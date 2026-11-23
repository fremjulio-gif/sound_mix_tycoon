#!/usr/bin/env node
/**
 * Pipeline Offline SIG -> Tuiles 3D GLB Streamables (Meshopt) pour Nantes (2.8 km x 2.8 km)
 * Sources :
 *  - IGN BD TOPO V3 (WFS data.geopf.fr) - Licence Ouverte Etalab 2.0
 *  - IGN RGE ALTI (API Altimétrie data.geopf.fr) - Licence Ouverte Etalab 2.0
 *  - Nantes Métropole Open Data (data.nantesmetropole.fr) - Licence Ouverte-LO
 */

import fs from 'node:fs';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

const ROOT_DIR = path.resolve(import.meta.dirname, '..');
const RAW_DIR = path.join(ROOT_DIR, 'raw_data', 'nantes');
const OUT_DIR = path.join(ROOT_DIR, 'assets', 'nantes');
const TILES_DIR = path.join(OUT_DIR, 'tiles');
const TMP_DIR = path.join(RAW_DIR, 'tmp_glb');

// Exact IGN RGF93 / Lambert-93 (EPSG:2154) projection constants (IAG GRS80)
const L93 = {
    A: 6378137.0,
    E: 0.0818191910428158,
    N: 0.7256077650532670,
    C: 11754255.426096,
    XS: 700000.0,
    YS: 12655612.049876,
    LON0: (3.0 * Math.PI) / 180
};

// Local Game World Origin in Lambert-93 (Place du Commerce / Centre-Loire)
const ORIGIN_X = 355250.0;
const ORIGIN_Y = 6689100.0;

const HALF_EXTENT = 1400; // 2800m x 2800m pilot zone
const TILE_SIZE = 400;
const GRID_COUNT = 7;     // 7 x 7 = 49 tiles max
const MNT_N = 57;         // 57 x 57 height samples (50m spacing)
const MNT_STEP = 50;

const MIN_L93_X = ORIGIN_X - HALF_EXTENT;
const MAX_L93_X = ORIGIN_X + HALF_EXTENT;
const MIN_L93_Y = ORIGIN_Y - HALF_EXTENT;
const MAX_L93_Y = ORIGIN_Y + HALF_EXTENT;

function wgs84ToL93(lonDeg, latDeg) {
    const lon = (lonDeg * Math.PI) / 180;
    const lat = (latDeg * Math.PI) / 180;
    const s = Math.sin(lat);
    const L = 0.5 * Math.log((1 + s) / (1 - s)) - (L93.E / 2) * Math.log((1 + L93.E * s) / (1 - L93.E * s));
    const r = L93.C * Math.exp(-L93.N * L);
    const gamma = L93.N * (lon - L93.LON0);
    return [L93.XS + r * Math.sin(gamma), L93.YS - r * Math.cos(gamma)];
}

function l93ToWgs84(x, y) {
    const dx = x - L93.XS;
    const dy = L93.YS - y;
    const r = Math.hypot(dx, dy);
    const gamma = Math.atan2(dx, dy);
    const lon = L93.LON0 + gamma / L93.N;
    const L = -Math.log(Math.abs(r / L93.C)) / L93.N;
    let lat = 2 * Math.atan(Math.exp(L)) - Math.PI / 2;
    for (let i = 0; i < 8; i++) {
        const s = Math.sin(lat);
        lat = 2 * Math.atan(Math.exp(L) * Math.pow((1 + L93.E * s) / (1 - L93.E * s), L93.E / 2)) - Math.PI / 2;
    }
    return [(lon * 180) / Math.PI, (lat * 180) / Math.PI];
}

function l93ToLocal(lx, ly) {
    return [lx - ORIGIN_X, -(ly - ORIGIN_Y)];
}

// Exclusions around handcrafted Nantes monuments so IGN prisms don't z-fight
const MONUMENT_EXCLUSIONS = [
    { name: 'Tour Bretagne', ...(() => { const [x, z] = l93ToLocal(...wgs84ToL93(-1.5581, 47.2176)); return { x, z, r: 44 }; })() },
    { name: 'Château des Ducs', ...(() => { const [x, z] = l93ToLocal(...wgs84ToL93(-1.5496, 47.2162)); return { x, z, r: 72 }; })() },
    { name: 'Cathédrale St-Pierre', ...(() => { const [x, z] = l93ToLocal(...wgs84ToL93(-1.5503, 47.2183)); return { x, z, r: 58 }; })() },
    { name: 'Nefs des Machines', ...(() => { const [x, z] = l93ToLocal(...wgs84ToL93(-1.5642, 47.2063)); return { x, z, r: 66 }; })() },
    { name: 'Tour LU', ...(() => { const [x, z] = l93ToLocal(...wgs84ToL93(-1.5458, 47.2156)); return { x, z, r: 34 }; })() },
    { name: 'Grue Titan Jaune', ...(() => { const [x, z] = l93ToLocal(...wgs84ToL93(-1.5681, 47.2044)); return { x, z, r: 16 }; })() }
];

async function fetchWithRetry(url, tries = 4) {
    let lastErr = null;
    for (let t = 0; t < tries; t++) {
        try {
            const ctrl = new AbortController();
            const timer = setTimeout(() => ctrl.abort(), 35000);
            const res = await fetch(url, {
                headers: { 'User-Agent': 'BounceIt-NantesPipeline/1.0' },
                signal: ctrl.signal
            });
            clearTimeout(timer);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return await res.json();
        } catch (err) {
            lastErr = err;
            await new Promise(r => setTimeout(r, 700 * (t + 1)));
        }
    }
    throw lastErr;
}

async function fetchIgnWfsLayer(typeName, outFile) {
    const cachePath = path.join(RAW_DIR, outFile);
    if (fs.existsSync(cachePath)) {
        const cached = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
        console.log(`[CACHE] ${outFile}: ${cached.length} features`);
        return cached;
    }

    const byId = new Map();
    const midX = ORIGIN_X;
    const midY = ORIGIN_Y;
    const subBoxes = [
        [MIN_L93_X - 25, MIN_L93_Y - 25, midX + 25, midY + 25],
        [midX - 25, MIN_L93_Y - 25, MAX_L93_X + 25, midY + 25],
        [MIN_L93_X - 25, midY - 25, midX + 25, MAX_L93_Y + 25],
        [midX - 25, midY - 25, MAX_L93_X + 25, MAX_L93_Y + 25]
    ];

    for (let bi = 0; bi < subBoxes.length; bi++) {
        const bboxStr = `${subBoxes[bi].join(',')},EPSG:2154`;
        let startIndex = 0;
        const pageSize = 1000;
        while (true) {
            const url = `https://data.geopf.fr/wfs/ows?service=WFS&version=2.0.0&request=GetFeature&typeNames=${encodeURIComponent(typeName)}&srsName=EPSG:2154&outputFormat=application/json&count=${pageSize}&startIndex=${startIndex}&bbox=${encodeURIComponent(bboxStr)}`;
            const data = await fetchWithRetry(url);
            const feats = Array.isArray(data.features) ? data.features : [];
            for (const f of feats) {
                const key = f.id || `${byId.size}_${JSON.stringify(f.geometry?.coordinates?.[0]?.[0] || [])}`;
                if (!byId.has(key)) byId.set(key, f);
            }
            if (feats.length < pageSize) break;
            startIndex += pageSize;
        }
    }

    const list = Array.from(byId.values());
    fs.writeFileSync(cachePath, JSON.stringify(list));
    console.log(`[FETCH] ${outFile}: ${list.length} unique features`);
    return list;
}

async function fetchIgnMntGrid() {
    const cachePath = path.join(RAW_DIR, 'ign_mnt.json');
    if (fs.existsSync(cachePath)) {
        const cached = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
        console.log(`[CACHE] ign_mnt.json: ${cached.elevations.length} pts (waterBaseZ=${cached.waterBaseZ})`);
        return cached;
    }

    const coordsWgs = [];
    for (let iz = 0; iz < MNT_N; iz++) {
        const gz = -HALF_EXTENT + iz * MNT_STEP;
        const ly = ORIGIN_Y - gz;
        for (let ix = 0; ix < MNT_N; ix++) {
            const gx = -HALF_EXTENT + ix * MNT_STEP;
            const lx = ORIGIN_X + gx;
            coordsWgs.push(l93ToWgs84(lx, ly));
        }
    }

    const rawElevs = new Array(coordsWgs.length).fill(NaN);
    const batch = 80;
    for (let i = 0; i < coordsWgs.length; i += batch) {
        const slice = coordsWgs.slice(i, i + batch);
        const lons = slice.map(p => p[0].toFixed(6)).join('|');
        const lats = slice.map(p => p[1].toFixed(6)).join('|');
        const url = `https://data.geopf.fr/altimetrie/1.0/calcul/alti/rest/elevation.json?lon=${lons}&lat=${lats}&resource=ign_rge_alti_wld&delimiter=|&zonly=true`;
        const data = await fetchWithRetry(url);
        const arr = Array.isArray(data.elevations) ? data.elevations : [];
        for (let k = 0; k < slice.length; k++) {
            const val = Number(arr[k]);
            rawElevs[i + k] = (Number.isFinite(val) && val > -100 && val < 500) ? val : 6.0;
        }
        if ((i / batch) % 10 === 0) {
            process.stdout.write(`[MNT] ${Math.min(coordsWgs.length, i + batch)}/${coordsWgs.length}\r`);
        }
    }
    console.log(`\n[FETCH] ign_mnt.json: ${rawElevs.length} points`);

    // Determine natural Loire river surface baseline around central basin
    const loireSamples = [];
    for (let iz = 28; iz <= 42; iz++) {
        for (let ix = 16; ix <= 40; ix++) {
            const v = rawElevs[iz * MNT_N + ix];
            if (Number.isFinite(v) && v > 0 && v < 12) loireSamples.push(v);
        }
    }
    loireSamples.sort((a, b) => a - b);
    const waterBaseZ = loireSamples.length > 0 ? loireSamples[Math.floor(loireSamples.length * 0.12)] : 4.2;

    const out = { n: MNT_N, step: MNT_STEP, waterBaseZ: Number(waterBaseZ.toFixed(2)), elevations: rawElevs };
    fs.writeFileSync(cachePath, JSON.stringify(out));
    return out;
}

async function fetchNantesOpenData() {
    const cachePath = path.join(RAW_DIR, 'nm_props.json');
    if (fs.existsSync(cachePath)) {
        const cached = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
        console.log(`[CACHE] nm_props.json: ${cached.trees.length} trees, ${cached.lamps.length} lamps, ${cached.plazas.length} plazas`);
        return cached;
    }

    const bboxFilter = encodeURIComponent("in_bbox(geo_point_2d, 47.1995, -1.5765, 47.2265, -1.5365)");
    const treesUrl = `https://data.nantesmetropole.fr/api/explore/v2.1/catalog/datasets/244400404_patrimoine-arbore-nantes-metropole/exports/json?select=geo_point_2d,lib_hauteur_totale&where=${bboxFilter}&limit=4500`;
    const lampsUrl = `https://data.nantesmetropole.fr/api/explore/v2.1/catalog/datasets/244400404_luminaires-eclairage-public-nantes-metropole/exports/json?select=geo_point_2d,hauteur_support&where=${bboxFilter}&limit=3000`;
    const plazasUrl = `https://data.nantesmetropole.fr/api/explore/v2.1/catalog/datasets/244400404_ilot-fraicheur-nantes-metropole/exports/json?select=geo_point_2d,nom_ifu,type_ifu&where=${bboxFilter}&limit=300`;

    const [treesRaw, lampsRaw, plazasRaw] = await Promise.all([
        fetchWithRetry(treesUrl),
        fetchWithRetry(lampsUrl),
        fetchWithRetry(plazasUrl)
    ]);

    const projPts = (arr, extraFn) => {
        const out = [];
        for (const rec of (Array.isArray(arr) ? arr : [])) {
            const gp = rec.geo_point_2d;
            if (!gp || typeof gp.lon !== 'number' || typeof gp.lat !== 'number') continue;
            const [lx, ly] = wgs84ToL93(gp.lon, gp.lat);
            const [gx, gz] = l93ToLocal(lx, ly);
            if (Math.abs(gx) > HALF_EXTENT || Math.abs(gz) > HALF_EXTENT) continue;
            out.push({ x: Number(gx.toFixed(1)), z: Number(gz.toFixed(1)), ...extraFn(rec) });
        }
        return out;
    };

    const trees = projPts(treesRaw, r => ({ h: String(r.lib_hauteur_totale || '') }));
    const lamps = projPts(lampsRaw, r => ({ h: Number(r.hauteur_support) || 5 }));
    const plazas = projPts(plazasRaw, r => ({ name: String(r.nom_ifu || ''), kind: String(r.type_ifu || '') }));

    console.log(`[FETCH] nm_props.json: ${trees.length} trees, ${lamps.length} lamps, ${plazas.length} plazas`);
    const out = { trees, lamps, plazas };
    fs.writeFileSync(cachePath, JSON.stringify(out));
    return out;
}

// ---------- GEOMETRY MATH: EAR-CLIPPING IN (X, Z) FOR THREE.JS (+Y UP) ----------

function signedAreaXZ(pts) {
    let a = 0;
    for (let i = 0; i < pts.length; i++) {
        const p = pts[i];
        const q = pts[(i + 1) % pts.length];
        a += p[0] * q[1] - q[0] * p[1];
    }
    return a * 0.5;
}

function cleanRing(raw) {
    if (!Array.isArray(raw) || raw.length < 3) return [];
    const pts = [];
    for (let i = 0; i < raw.length; i++) {
        const [gx, gz] = l93ToLocal(raw[i][0], raw[i][1]);
        if (pts.length === 0 || Math.hypot(gx - pts[pts.length - 1][0], gz - pts[pts.length - 1][1]) > 0.12) {
            pts.push([gx, gz]);
        }
    }
    if (pts.length > 1 && Math.hypot(pts[0][0] - pts[pts.length - 1][0], pts[0][1] - pts[pts.length - 1][1]) <= 0.12) {
        pts.pop();
    }
    return pts.length >= 3 ? pts : [];
}

function simplifyRingXZ(ring, eps = 0.75, maxPts = 14) {
    if (!ring || ring.length <= 3) return ring || [];
    let pts = ring.slice();
    let curEps = eps;
    while (pts.length > 3) {
        let bestIdx = -1;
        let bestErr = Infinity;
        const m = pts.length;
        for (let i = 0; i < m; i++) {
            const a = pts[(i + m - 1) % m];
            const b = pts[i];
            const c = pts[(i + 1) % m];
            const dx = c[0] - a[0], dz = c[1] - a[1];
            const base = Math.hypot(dx, dz);
            const err = base < 1e-4
                ? Math.hypot(b[0] - a[0], b[1] - a[1])
                : Math.abs(dx * (b[1] - a[1]) - dz * (b[0] - a[0])) / base;
            if (err < bestErr) {
                bestErr = err;
                bestIdx = i;
            }
        }
        if (bestIdx >= 0 && (bestErr < curEps || pts.length > maxPts)) {
            pts.splice(bestIdx, 1);
            if (bestErr >= curEps && pts.length > maxPts) curEps *= 1.15;
        } else {
            break;
        }
    }
    const flat = [];
    for (let i = 0; i < pts.length; i++) {
        flat.push(Number(pts[i][0].toFixed(1)), Number(pts[i][1].toFixed(1)));
    }
    return flat;
}

function pointInRingPairs(px, pz, pts) {
    let inside = false;
    for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
        const xi = pts[i][0], zi = pts[i][1];
        const xj = pts[j][0], zj = pts[j][1];
        if (((zi > pz) !== (zj > pz)) && (px < ((xj - xi) * (pz - zi)) / (zj - zi) + xi)) {
            inside = !inside;
        }
    }
    return inside;
}

function pointInFlatPolyXZ(px, pz, p) {
    let inside = false;
    const n = p.length;
    for (let i = 0, j = n - 2; i < n; j = i, i += 2) {
        const xi = p[i], zi = p[i + 1];
        const xj = p[j], zj = p[j + 1];
        if (((zi > pz) !== (zj > pz)) && (px < ((xj - xi) * (pz - zi)) / (zj - zi) + xi)) {
            inside = !inside;
        }
    }
    return inside;
}

function distSqToFlatPoly(px, pz, p) {
    let bestD2 = Infinity;
    const n = p.length;
    for (let i = 0; i < n; i += 2) {
        const j = (i + 2) % n;
        const ax = p[i], az = p[i + 1];
        const bx = p[j], bz = p[j + 1];
        const vx = bx - ax, vz = bz - az;
        const len2 = vx * vx + vz * vz;
        const t = len2 > 1e-6 ? Math.max(0, Math.min(1, ((px - ax) * vx + (pz - az) * vz) / len2)) : 0;
        const qx = ax + vx * t, qz = az + vz * t;
        const d2 = (px - qx) * (px - qx) + (pz - qz) * (pz - qz);
        if (d2 < bestD2) bestD2 = d2;
    }
    return bestD2;
}

function crossXZ(a, b, c) {
    return (b[0] - a[0]) * (c[1] - a[1]) - (c[0] - a[0]) * (b[1] - a[1]);
}

function ptInTriXZ(p, a, b, c) {
    const d1 = crossXZ(p, a, b);
    const d2 = crossXZ(p, b, c);
    const d3 = crossXZ(p, c, a);
    const hasNeg = (d1 < -1e-6) || (d2 < -1e-6) || (d3 < -1e-6);
    const hasPos = (d1 > 1e-6) || (d2 > 1e-6) || (d3 > 1e-6);
    return !(hasNeg && hasPos);
}

// Ensures outer ring has signedAreaXZ < 0 (Three.js +Y upward normal!)
function normalizeRingWinding(pts, wantNegative) {
    const area = signedAreaXZ(pts);
    if (Math.abs(area) < 0.05) return null;
    if ((wantNegative && area > 0) || (!wantNegative && area < 0)) {
        return [...pts].reverse();
    }
    return [...pts];
}

function earClipXZ(polyPts) {
    if (!polyPts || polyPts.length < 3) return [];
    const n = polyPts.length;
    if (n === 3) return [0, 1, 2];

    const idxList = Array.from({ length: n }, (_, i) => i);
    const tris = [];
    let guard = n * n + 16;

    while (idxList.length > 3 && guard-- > 0) {
        let clipped = false;
        const m = idxList.length;
        for (let i = 0; i < m; i++) {
            const i0 = idxList[(i + m - 1) % m];
            const i1 = idxList[i];
            const i2 = idxList[(i + 1) % m];
            const a = polyPts[i0], b = polyPts[i1], c = polyPts[i2];
            // Convex ear for Three.js +Y upward normal has crossXZ < 0
            if (crossXZ(a, b, c) >= -1e-7) continue;

            let containsOther = false;
            for (let k = 0; k < m; k++) {
                const ik = idxList[k];
                if (ik === i0 || ik === i1 || ik === i2) continue;
                if (ptInTriXZ(polyPts[ik], a, b, c)) {
                    containsOther = true;
                    break;
                }
            }
            if (!containsOther) {
                tris.push(i0, i1, i2);
                idxList.splice(i, 1);
                clipped = true;
                break;
            }
        }
        if (!clipped) break;
    }
    if (idxList.length === 3) {
        tris.push(idxList[0], idxList[1], idxList[2]);
    } else if (tris.length === 0) {
        // Fallback triangle fan if ultra-self-intersecting sliver
        for (let i = 1; i < n - 1; i++) tris.push(0, i, i + 1);
    }
    return tris;
}

function makeMaterialBuckets() {
    const defs = [
        'mat_tuffeau', 'mat_colombage', 'mat_haussmann', 'mat_brick',
        'mat_beton50', 'mat_modern', 'mat_tower', 'mat_shopfront',
        'mat_roof_slate', 'mat_roof_tile', 'mat_roof_flat',
        'mat_road', 'mat_tram', 'mat_water', 'mat_park'
    ];
    const map = {};
    for (const name of defs) {
        map[name] = { pos: [], norm: [], uv: [], idx: [] };
    }
    return map;
}

function pushTri(bucket, p0, p1, p2, n0, n1, n2, u0, u1, u2) {
    const base = bucket.pos.length / 3;
    bucket.pos.push(p0[0], p0[1], p0[2], p1[0], p1[1], p1[2], p2[0], p2[1], p2[2]);
    bucket.norm.push(n0[0], n0[1], n0[2], n1[0], n1[1], n1[2], n2[0], n2[1], n2[2]);
    bucket.uv.push(u0[0], u0[1], u1[0], u1[1], u2[0], u2[1]);
    bucket.idx.push(base, base + 1, base + 2);
}

function pushFlatPolyY(bucket, ptsXZ, y, uvScale = 0.05) {
    const tris = earClipXZ(ptsXZ);
    const nUp = [0, 1, 0];
    for (let i = 0; i < tris.length; i += 3) {
        const a = ptsXZ[tris[i]], b = ptsXZ[tris[i + 1]], c = ptsXZ[tris[i + 2]];
        pushTri(
            bucket,
            [a[0], y, a[1]], [b[0], y, b[1]], [c[0], y, c[1]],
            nUp, nUp, nUp,
            [a[0] * uvScale, a[1] * uvScale], [b[0] * uvScale, b[1] * uvScale], [c[0] * uvScale, c[1] * uvScale]
        );
    }
}

function pushWallRing(bucket, ring, yBot, yTop, uvU = 10.0, uvV = 11.0) {
    const h = Math.max(0.1, yTop - yBot);
    for (let i = 0; i < ring.length; i++) {
        const a = ring[i];
        const b = ring[(i + 1) % ring.length];
        const dx = b[0] - a[0];
        const dz = b[1] - a[1];
        const len = Math.hypot(dx, dz);
        if (len < 0.08) continue;
        // Normal pointing outward for signedAreaXZ < 0 rings
        const nx = -dz / len;
        const nz = dx / len;
        const nVec = [nx, 0, nz];
        const uMax = len / uvU;
        const vMax = h / uvV;
        pushTri(
            bucket,
            [a[0], yBot, a[1]], [b[0], yBot, b[1]], [b[0], yTop, b[1]],
            nVec, nVec, nVec,
            [0, 0], [uMax, 0], [uMax, vMax]
        );
        pushTri(
            bucket,
            [a[0], yBot, a[1]], [b[0], yTop, b[1]], [a[0], yTop, a[1]],
            nVec, nVec, nVec,
            [0, 0], [uMax, vMax], [0, vMax]
        );
    }
}

function spatialHash01(cx, cz, salt = 0) {
    const v = Math.sin(cx * 12.9898 + cz * 78.233 + salt * 41.7) * 43758.5453;
    return v - Math.floor(v);
}

function classifyBuildingStyle(cx, cz, h, area, props) {
    const usage = String(props.usage_1 || '').toLowerCase();
    const r = spatialHash01(cx, cz, 1);
    const urbanShop = (
        h >= 7.2 &&
        area >= 36 &&
        Math.abs(cx) < 920 &&
        Math.abs(cz) < 920 &&
        !usage.includes('industriel') &&
        (usage.includes('commercial') || spatialHash01(cx, cz, 3) < 0.56)
    );

    if (h >= 24) return { wallMat: 'mat_tower', roofKind: 'crown', roofMat: 'mat_roof_flat', hasShopfront: urbanShop };
    if (usage.includes('industriel') || (usage.includes('commercial') && h < 10 && cz > 300)) {
        return { wallMat: 'mat_modern', roofKind: 'flat', roofMat: 'mat_roof_flat', hasShopfront: false };
    }
    // Bouffay / Château historic core
    if (cx >= 120 && cx <= 720 && cz >= -580 && cz <= 60) {
        if (r < 0.45) return { wallMat: 'mat_colombage', roofKind: 'pitched', roofMat: 'mat_roof_slate', hasShopfront: urbanShop };
        if (r < 0.80) return { wallMat: 'mat_tuffeau', roofKind: 'mansard', roofMat: 'mat_roof_slate', hasShopfront: urbanShop };
        return { wallMat: 'mat_haussmann', roofKind: 'mansard', roofMat: 'mat_roof_slate', hasShopfront: urbanShop };
    }
    // Graslin / Place Royale / Feydeau
    if (cx >= -520 && cx < 120 && cz >= -440 && cz <= 140) {
        if (r < 0.55) return { wallMat: 'mat_tuffeau', roofKind: 'mansard', roofMat: 'mat_roof_slate', hasShopfront: urbanShop };
        if (r < 0.85) return { wallMat: 'mat_haussmann', roofKind: 'mansard', roofMat: 'mat_roof_slate', hasShopfront: urbanShop };
        return { wallMat: 'mat_beton50', roofKind: 'flat', roofMat: 'mat_roof_flat', hasShopfront: urbanShop };
    }
    // Tour Bretagne / Cours des 50-Otages
    if (cx >= -360 && cx <= 240 && cz >= -840 && cz < -440) {
        if (r < 0.45) return { wallMat: 'mat_beton50', roofKind: 'flat', roofMat: 'mat_roof_flat', hasShopfront: urbanShop };
        if (r < 0.80) return { wallMat: 'mat_haussmann', roofKind: 'mansard', roofMat: 'mat_roof_slate', hasShopfront: urbanShop };
        return { wallMat: 'mat_tuffeau', roofKind: 'mansard', roofMat: 'mat_roof_slate', hasShopfront: urbanShop };
    }
    // Île de Nantes / Création / Chantiers
    if (cz > 300) {
        if (r < 0.55) return { wallMat: 'mat_modern', roofKind: 'flat', roofMat: 'mat_roof_flat', hasShopfront: urbanShop };
        if (r < 0.80) return { wallMat: 'mat_brick', roofKind: 'pitched', roofMat: r < 0.68 ? 'mat_roof_tile' : 'mat_roof_slate', hasShopfront: urbanShop };
        return { wallMat: 'mat_beton50', roofKind: 'flat', roofMat: 'mat_roof_flat', hasShopfront: urbanShop };
    }
    // Olivettes / Madeleine / Gare / Quai de la Fosse / Nord
    if (r < 0.55) {
        return { wallMat: 'mat_brick', roofKind: 'pitched', roofMat: spatialHash01(cx, cz, 2) > 0.42 ? 'mat_roof_tile' : 'mat_roof_slate', hasShopfront: urbanShop };
    }
    if (r < 0.80) {
        return { wallMat: 'mat_tuffeau', roofKind: 'mansard', roofMat: 'mat_roof_slate', hasShopfront: urbanShop };
    }
    return { wallMat: 'mat_beton50', roofKind: 'flat', roofMat: 'mat_roof_flat', hasShopfront: urbanShop };
}

function addProceduralRoof(bucket, outer, cx, cz, yGutter, roofKind) {
    if (roofKind === 'flat') {
        const yParapet = yGutter + 0.55;
        pushWallRing(bucket, outer, yGutter, yParapet, 12, 6);
        pushFlatPolyY(bucket, outer, yGutter + 0.25, 0.08);
        return;
    }
    if (roofKind === 'crown') {
        const crownRing = outer.map(([x, z]) => [cx + (x - cx) * 0.72, cz + (z - cz) * 0.72]);
        const yCrown = yGutter + 2.6;
        pushFlatPolyY(bucket, outer, yGutter, 0.08);
        pushWallRing(bucket, crownRing, yGutter, yCrown, 10, 10);
        pushFlatPolyY(bucket, crownRing, yCrown, 0.08);
        return;
    }

    const pull = roofKind === 'mansard' ? 0.24 : 0.42;
    const roofH = roofKind === 'mansard' ? 2.5 : 2.1;
    const inset = outer.map(([x, z]) => [cx + (x - cx) * (1 - pull), cz + (z - cz) * (1 - pull)]);
    const yPeak = yGutter + roofH;

    // Sloped roof facets from gutter edge up to inset ridge/deck
    for (let i = 0; i < outer.length; i++) {
        const a0 = outer[i];
        const b0 = outer[(i + 1) % outer.length];
        const a1 = inset[i];
        const b1 = inset[(i + 1) % outer.length];
        const ux = b0[0] - a0[0], uz = b0[1] - a0[1];
        const vx = a1[0] - a0[0], vz = a1[1] - a0[1];
        // Cross product (b0-a0) x (a1-a0)
        const nx = uz * roofH;
        const ny = uz * vx - ux * vz;
        const nz = -ux * roofH;
        const nl = Math.max(1e-5, Math.hypot(nx, ny, nz));
        const nVec = [nx / nl, Math.abs(ny) / nl, nz / nl];
        const uLen = Math.hypot(ux, uz) * 0.25;
        pushTri(bucket, [a0[0], yGutter, a0[1]], [b0[0], yGutter, b0[1]], [b1[0], yPeak, b1[1]], nVec, nVec, nVec, [0, 0], [uLen, 0], [uLen, 1]);
        pushTri(bucket, [a0[0], yGutter, a0[1]], [b1[0], yPeak, b1[1]], [a1[0], yPeak, a1[1]], nVec, nVec, nVec, [0, 0], [uLen, 1], [0, 1]);
    }
    pushFlatPolyY(bucket, inset, yPeak, 0.08);
}

// ---------- BINARY GLB 2.0 WRITER ----------

function buildGlbFromBuckets(buckets) {
    const meshes = [];
    const accessors = [];
    const bufferViews = [];
    const materials = [];
    const binParts = [];
    let byteOffset = 0;

    const appendBuffer = (typedArr, target) => {
        const raw = Buffer.from(typedArr.buffer, typedArr.byteOffset, typedArr.byteLength);
        const pad = (4 - (raw.length % 4)) % 4;
        binParts.push(raw);
        if (pad > 0) binParts.push(Buffer.alloc(pad, 0));
        const bvIdx = bufferViews.length;
        bufferViews.push({ buffer: 0, byteOffset, byteLength: raw.length, target });
        byteOffset += raw.length + pad;
        return bvIdx;
    };

    const MAT_DEFAULTS = {
        mat_tuffeau:   { baseColorFactor: [0.90, 0.87, 0.79, 1.0], metallicFactor: 0.04, roughnessFactor: 0.84 },
        mat_colombage: { baseColorFactor: [0.85, 0.75, 0.59, 1.0], metallicFactor: 0.04, roughnessFactor: 0.88 },
        mat_haussmann: { baseColorFactor: [0.80, 0.76, 0.69, 1.0], metallicFactor: 0.08, roughnessFactor: 0.85 },
        mat_brick:     { baseColorFactor: [0.56, 0.34, 0.27, 1.0], metallicFactor: 0.06, roughnessFactor: 0.88 },
        mat_beton50:   { baseColorFactor: [0.64, 0.66, 0.69, 1.0], metallicFactor: 0.09, roughnessFactor: 0.82 },
        mat_modern:    { baseColorFactor: [0.31, 0.34, 0.40, 1.0], metallicFactor: 0.16, roughnessFactor: 0.70 },
        mat_tower:     { baseColorFactor: [0.16, 0.21, 0.29, 1.0], metallicFactor: 0.42, roughnessFactor: 0.38 },
        mat_shopfront: { baseColorFactor: [0.18, 0.16, 0.17, 1.0], metallicFactor: 0.12, roughnessFactor: 0.58 },
        mat_roof_slate:{ baseColorFactor: [0.17, 0.20, 0.27, 1.0], metallicFactor: 0.24, roughnessFactor: 0.62 },
        mat_roof_tile: { baseColorFactor: [0.58, 0.29, 0.21, 1.0], metallicFactor: 0.04, roughnessFactor: 0.85 },
        mat_roof_flat: { baseColorFactor: [0.22, 0.25, 0.30, 1.0], metallicFactor: 0.12, roughnessFactor: 0.88 },
        mat_road:      { baseColorFactor: [0.12, 0.14, 0.18, 1.0], metallicFactor: 0.08, roughnessFactor: 0.74 },
        mat_tram:      { baseColorFactor: [0.58, 0.64, 0.72, 1.0], metallicFactor: 0.85, roughnessFactor: 0.28 },
        mat_water:     { baseColorFactor: [0.06, 0.30, 0.39, 1.0], metallicFactor: 0.55, roughnessFactor: 0.14 },
        mat_park:      { baseColorFactor: [0.15, 0.31, 0.20, 1.0], metallicFactor: 0.02, roughnessFactor: 0.92 }
    };

    const primitives = [];
    for (const [matName, b] of Object.entries(buckets)) {
        if (b.idx.length === 0 || b.pos.length === 0) continue;

        const matIdx = materials.length;
        materials.push({
            name: matName,
            pbrMetallicRoughness: MAT_DEFAULTS[matName] || { baseColorFactor: [0.8, 0.8, 0.8, 1.0], metallicFactor: 0.1, roughnessFactor: 0.7 }
        });

        const posArr = new Float32Array(b.pos);
        const normArr = new Float32Array(b.norm);
        const uvArr = new Float32Array(b.uv);
        const idxArr = new Uint32Array(b.idx);

        let minX = Infinity, minY = Infinity, minZ = Infinity;
        let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;
        for (let i = 0; i < posArr.length; i += 3) {
            const x = posArr[i], y = posArr[i + 1], z = posArr[i + 2];
            if (x < minX) minX = x; if (x > maxX) maxX = x;
            if (y < minY) minY = y; if (y > maxY) maxY = y;
            if (z < minZ) minZ = z; if (z > maxZ) maxZ = z;
        }

        const bvPos = appendBuffer(posArr, 34962);
        const bvNorm = appendBuffer(normArr, 34962);
        const bvUv = appendBuffer(uvArr, 34962);
        const bvIdx = appendBuffer(idxArr, 34963);

        const accPos = accessors.length;
        accessors.push({ bufferView: bvPos, componentType: 5126, count: posArr.length / 3, type: 'VEC3', min: [minX, minY, minZ], max: [maxX, maxY, maxZ] });
        const accNorm = accessors.length;
        accessors.push({ bufferView: bvNorm, componentType: 5126, count: normArr.length / 3, type: 'VEC3' });
        const accUv = accessors.length;
        accessors.push({ bufferView: bvUv, componentType: 5126, count: uvArr.length / 2, type: 'VEC2' });
        const accIdx = accessors.length;
        accessors.push({ bufferView: bvIdx, componentType: 5125, count: idxArr.length, type: 'SCALAR' });

        primitives.push({
            attributes: { POSITION: accPos, NORMAL: accNorm, TEXCOORD_0: accUv },
            indices: accIdx,
            material: matIdx
        });
    }

    if (primitives.length === 0) return null;

    meshes.push({ name: 'NantesTile', primitives });
    const gltf = {
        asset: { version: '2.0', generator: 'BounceIt-NantesPipeline' },
        scene: 0,
        scenes: [{ nodes: [0] }],
        nodes: [{ mesh: 0, name: 'TileRoot' }],
        meshes,
        materials,
        accessors,
        bufferViews,
        buffers: [{ byteLength: byteOffset }]
    };

    const jsonStr = JSON.stringify(gltf);
    const jsonPad = (4 - (Buffer.byteLength(jsonStr) % 4)) % 4;
    const jsonBuf = Buffer.from(jsonStr + ' '.repeat(jsonPad), 'utf8');
    const binBuf = Buffer.concat(binParts);
    const totalLen = 12 + 8 + jsonBuf.length + 8 + binBuf.length;

    const out = Buffer.alloc(totalLen);
    let p = 0;
    out.writeUInt32LE(0x46546C67, p); p += 4; // 'glTF'
    out.writeUInt32LE(2, p); p += 4;
    out.writeUInt32LE(totalLen, p); p += 4;
    out.writeUInt32LE(jsonBuf.length, p); p += 4;
    out.writeUInt32LE(0x4E4F534A, p); p += 4; // 'JSON'
    jsonBuf.copy(out, p); p += jsonBuf.length;
    out.writeUInt32LE(binBuf.length, p); p += 4;
    out.writeUInt32LE(0x004E4942, p); p += 4; // 'BIN\0'
    binBuf.copy(out, p);
    return out;
}

// ---------- MNT ELEVATION SAMPLING ----------

function makeMntSampler(mntData) {
    const { n, step, waterBaseZ, elevations } = mntData;
    const sampleRaw = (gx, gz) => {
        const fx = Math.max(0, Math.min(n - 1.001, (gx + HALF_EXTENT) / step));
        const fz = Math.max(0, Math.min(n - 1.001, (gz + HALF_EXTENT) / step));
        const ix = Math.floor(fx), iz = Math.floor(fz);
        const tx = fx - ix, tz = fz - iz;
        const h00 = elevations[iz * n + ix];
        const h10 = elevations[iz * n + ix + 1];
        const h01 = elevations[(iz + 1) * n + ix];
        const h11 = elevations[(iz + 1) * n + ix + 1];
        const h0 = h00 + (h10 - h00) * tx;
        const h1 = h01 + (h11 - h01) * tx;
        return (h0 + (h1 - h0) * tz) - waterBaseZ;
    };
    return (gx, gz) => Math.max(0.0, sampleRaw(gx, gz));
}

function getTileIdx(x, z) {
    const tx = Math.max(0, Math.min(GRID_COUNT - 1, Math.floor((x + HALF_EXTENT) / TILE_SIZE)));
    const tz = Math.max(0, Math.min(GRID_COUNT - 1, Math.floor((z + HALF_EXTENT) / TILE_SIZE)));
    return [tx, tz];
}

// Clip polygon/polyline assignment by centroid/midpoint into tiles
function addRibbonSegment(bucket, pA, pB, yA, yB, halfW, offsetLat = 0) {
    const dx = pB[0] - pA[0];
    const dz = pB[1] - pA[1];
    const len = Math.hypot(dx, dz);
    if (len < 0.25) return;
    const nx = -dz / len;
    const nz = dx / len;
    const offX = nx * offsetLat;
    const offZ = nz * offsetLat;
    const aL = [pA[0] + offX - nx * halfW, yA, pA[1] + offZ - nz * halfW];
    const aR = [pA[0] + offX + nx * halfW, yA, pA[1] + offZ + nz * halfW];
    const bL = [pB[0] + offX - nx * halfW, yB, pB[1] + offZ - nz * halfW];
    const bR = [pB[0] + offX + nx * halfW, yB, pB[1] + offZ + nz * halfW];
    const nUp = [0, 1, 0];
    const vU = len / 6.0;
    pushTri(bucket, aL, bL, bR, nUp, nUp, nUp, [0, 0], [0, vU], [1, vU]);
    pushTri(bucket, aL, bR, aR, nUp, nUp, nUp, [0, 0], [1, vU], [1, 0]);
}

function polygonParts(geom) {
    if (!geom) return [];
    if (geom.type === 'Polygon') return [geom.coordinates];
    if (geom.type === 'MultiPolygon') return geom.coordinates;
    return [];
}

function lineParts(geom) {
    if (!geom) return [];
    if (geom.type === 'LineString') return [geom.coordinates];
    if (geom.type === 'MultiLineString') return geom.coordinates;
    return [];
}

function pushFlatPolyByTriTile(tileLookup, bucketName, ptsXZ, yFn, uvScale = 0.04) {
    const tris = earClipXZ(ptsXZ);
    const nUp = [0, 1, 0];
    for (let i = 0; i < tris.length; i += 3) {
        const a = ptsXZ[tris[i]], b = ptsXZ[tris[i + 1]], c = ptsXZ[tris[i + 2]];
        const tcx = (a[0] + b[0] + c[0]) / 3;
        const tcz = (a[1] + b[1] + c[1]) / 3;
        if (Math.abs(tcx) > HALF_EXTENT + 50 || Math.abs(tcz) > HALF_EXTENT + 50) continue;
        const [tx, tz] = getTileIdx(tcx, tcz);
        const tile = tileLookup(tx, tz);
        const yA = yFn(a[0], a[1]);
        const yB = yFn(b[0], b[1]);
        const yC = yFn(c[0], c[1]);
        const bucket0 = tile.lod0[bucketName];
        const bucket1 = tile.lod1[bucketName];
        pushTri(bucket0, [a[0], yA, a[1]], [b[0], yB, b[1]], [c[0], yC, c[1]], nUp, nUp, nUp,
            [a[0] * uvScale, a[1] * uvScale], [b[0] * uvScale, b[1] * uvScale], [c[0] * uvScale, c[1] * uvScale]);
        pushTri(bucket1, [a[0], yA, a[1]], [b[0], yB, b[1]], [c[0], yC, c[1]], nUp, nUp, nUp,
            [a[0] * uvScale, a[1] * uvScale], [b[0] * uvScale, b[1] * uvScale], [c[0] * uvScale, c[1] * uvScale]);
    }
}

async function compressWithMeshopt(rawPath, optPath) {
    await execFileAsync('npx', [
        '--yes', '@gltf-transform/cli', 'optimize',
        rawPath, optPath,
        '--compress', 'meshopt',
        '--palette', 'false',
        '--prune-attributes', 'false',
        '--join', 'false',
        '--flatten', 'false',
        '--simplify', 'false'
    ], { cwd: ROOT_DIR, maxBuffer: 1024 * 1024 * 16 });
}

async function run() {
    fs.mkdirSync(RAW_DIR, { recursive: true });
    fs.mkdirSync(OUT_DIR, { recursive: true });
    fs.mkdirSync(TILES_DIR, { recursive: true });
    fs.mkdirSync(TMP_DIR, { recursive: true });

    console.log('=== PHASE A: Fetching Nantes Official Open Data ===');
    const [buildings, roads, water, vegetation, rails, mntData, nmProps] = await Promise.all([
        fetchIgnWfsLayer('BDTOPO_V3:batiment', 'ign_buildings.json'),
        fetchIgnWfsLayer('BDTOPO_V3:troncon_de_route', 'ign_roads.json'),
        fetchIgnWfsLayer('BDTOPO_V3:surface_hydrographique', 'ign_water.json'),
        fetchIgnWfsLayer('BDTOPO_V3:zone_de_vegetation', 'ign_vegetation.json'),
        fetchIgnWfsLayer('BDTOPO_V3:troncon_de_voie_ferree', 'ign_rail.json'),
        fetchIgnMntGrid(),
        fetchNantesOpenData()
    ]);

    const sampleMNT = makeMntSampler(mntData);

    // Initialize 7x7 tile stores (LOD0 & LOD1)
    const tileStore = [];
    for (let tz = 0; tz < GRID_COUNT; tz++) {
        for (let tx = 0; tx < GRID_COUNT; tx++) {
            tileStore.push({
                tx, tz,
                lod0: makeMaterialBuckets(),
                lod1: makeMaterialBuckets(),
                colliders: []
            });
        }
    }
    const getTile = (tx, tz) => tileStore[tz * GRID_COUNT + tx];

    // 1. Buildings -> Extrude + Procedural Roofs -> LOD0 + LOD1
    let builtCount = 0;
    let excludedMonuments = 0;
    for (const f of buildings) {
        const props = f.properties || {};
        for (const poly of polygonParts(f.geometry)) {
            const outer = normalizeRingWinding(cleanRing(poly[0]), true);
            if (!outer) continue;
            const area = Math.abs(signedAreaXZ(outer));
            if (area < 9) continue;

            let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;
            let cx = 0, cz = 0;
            for (const [x, z] of outer) {
                if (x < minX) minX = x; if (x > maxX) maxX = x;
                if (z < minZ) minZ = z; if (z > maxZ) maxZ = z;
                cx += x; cz += z;
            }
            cx /= outer.length;
            cz /= outer.length;
            if (Math.abs(cx) > HALF_EXTENT || Math.abs(cz) > HALF_EXTENT) continue;

            // Exclude IGN prisms inside handcrafted monument footprints
            let nearMonument = false;
            for (const m of MONUMENT_EXCLUSIONS) {
                if (Math.hypot(cx - m.x, cz - m.z) < m.r) {
                    nearMonument = true;
                    break;
                }
            }
            if (nearMonument) { excludedMonuments++; continue; }

            const gndY = sampleMNT(cx, cz);
            const hGutter = Math.max(3.5, Number(props.hauteur) || (Number(props.nombre_d_etages) * 3.1) || 8.5);
            const yBot = Math.max(-1.0, gndY - 1.5);
            const yGutter = gndY + hGutter;
            const style = classifyBuildingStyle(cx, cz, hGutter, area, props);

            const [tx, tz] = getTileIdx(cx, cz);
            const tile = getTile(tx, tz);

            // LOD0 full extrusion (ground-floor commercial storefront + upper stories) + procedural roof
            if (style.hasShopfront) {
                const yShop = gndY + 3.8;
                pushWallRing(tile.lod0.mat_shopfront, outer, yBot, yShop, 12.0, 4.4);
                pushWallRing(tile.lod0[style.wallMat], outer, yShop, yGutter, 10.0, 11.0);
            } else {
                pushWallRing(tile.lod0[style.wallMat], outer, yBot, yGutter, 10.0, 11.0);
            }
            addProceduralRoof(tile.lod0[style.roofMat], outer, cx, cz, yGutter, style.roofKind);

            // LOD1 simplified footprint massing (keep significant buildings >= 45m2)
            if (area >= 45) {
                const box = [[minX, minZ], [minX, maxZ], [maxX, maxZ], [maxX, minZ]];
                pushWallRing(tile.lod1[style.wallMat], box, yBot, yGutter, 12.0, 12.0);
                pushFlatPolyY(tile.lod1[style.roofMat], box, yGutter, 0.05);
            }
            if (area >= 30 && (maxX - minX) >= 2.2 && (maxZ - minZ) >= 2.2 && tile.colliders.length < 650) {
                tile.colliders.push({
                    minX: Number(minX.toFixed(1)), maxX: Number(maxX.toFixed(1)),
                    minZ: Number(minZ.toFixed(1)), maxZ: Number(maxZ.toFixed(1)),
                    p: simplifyRingXZ(outer, 0.75, 14)
                });
            }
            builtCount++;
        }
    }

    // 2. IGN Hydrography -> Water Polygons split per-tile at y = 0.05m + 2D water mask
    let waterCount = 0;
    const waterPolys2d = [];
    for (const f of water) {
        for (const poly of polygonParts(f.geometry)) {
            const outer = normalizeRingWinding(cleanRing(poly[0]), true);
            if (!outer) continue;
            pushFlatPolyByTriTile(getTile, 'mat_water', outer, () => 0.05, 0.02);
            waterCount++;

            if (Math.abs(signedAreaXZ(outer)) >= 150) {
                let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;
                for (const [wx, wz] of outer) {
                    if (wx < minX) minX = wx; if (wx > maxX) maxX = wx;
                    if (wz < minZ) minZ = wz; if (wz > maxZ) maxZ = wz;
                }
                const holes = [];
                for (let hi = 1; hi < poly.length; hi++) {
                    const hr = cleanRing(poly[hi]);
                    if (hr.length >= 3) holes.push(hr);
                }
                waterPolys2d.push({ minX, maxX, minZ, maxZ, outer, holes });
            }
        }
    }

    // 3. IGN Vegetation / Parks -> Ground Parks split per-tile following MNT
    let parkCount = 0;
    for (const f of vegetation) {
        for (const poly of polygonParts(f.geometry)) {
            const outer = normalizeRingWinding(cleanRing(poly[0]), true);
            if (!outer) continue;
            pushFlatPolyByTriTile(getTile, 'mat_park', outer, (x, z) => sampleMNT(x, z) + 0.07, 0.04);
            parkCount++;
        }
    }

    // 4. IGN Roads -> Road Ribbons + Sampled Polylines for NPC Traffic
    let roadCount = 0;
    const roadLanes = [];
    const roadLampCandidates = [];
    let roadSegStep = 0;
    for (const f of roads) {
        const props = f.properties || {};
        const imp = Number(props.importance) || 5;
        const nature = String(props.nature || '');
        if (nature.includes('Sentier') || nature.includes('Escalier')) continue;
        const w = Math.max(3.6, Number(props.largeur_de_chaussee) || (imp <= 2 ? 12 : imp <= 4 ? 7.5 : 5.2));
        const halfW = w * 0.5;

        for (const line of lineParts(f.geometry)) {
            const ptsLocal = [];
            for (let i = 0; i < line.length; i++) {
                const [gx, gz] = l93ToLocal(line[i][0], line[i][1]);
                const rawZ = (line[i].length >= 3 && Number.isFinite(line[i][2])) ? (line[i][2] - mntData.waterBaseZ) : sampleMNT(gx, gz);
                const y = Math.max(sampleMNT(gx, gz) + 0.14, rawZ > 3.5 && sampleMNT(gx, gz) < 1.2 ? rawZ : sampleMNT(gx, gz) + 0.14);
                ptsLocal.push([gx, gz, y]);
            }
            if (ptsLocal.length < 2) continue;

            for (let i = 0; i < ptsLocal.length - 1; i++) {
                const a = ptsLocal[i], b = ptsLocal[i + 1];
                const mx = (a[0] + b[0]) * 0.5, mz = (a[1] + b[1]) * 0.5;
                if (Math.abs(mx) > HALF_EXTENT || Math.abs(mz) > HALF_EXTENT) continue;
                const [tx, tz] = getTileIdx(mx, mz);
                const tile = getTile(tx, tz);
                addRibbonSegment(tile.lod0.mat_road, a, b, a[2], b[2], halfW);
                if (imp <= 4) {
                    addRibbonSegment(tile.lod1.mat_road, a, b, a[2], b[2], halfW);
                }

                if (Math.abs(mx) < 1150 && Math.abs(mz) < 1050) {
                    const segLen = Math.hypot(b[0] - a[0], b[1] - a[1]);
                    if (segLen >= 8) {
                        const dx = (b[0] - a[0]) / segLen;
                        const dz = (b[1] - a[1]) / segLen;
                        const nx = -dz, nz = dx;
                        const off = halfW + 1.05;
                        const startD = segLen >= 26 ? 13 : segLen * 0.5;
                        for (let d = startD; d <= segLen - 2; d += 26) {
                            const frac = d / segLen;
                            const px = a[0] + (b[0] - a[0]) * frac;
                            const pz = a[1] + (b[1] - a[1]) * frac;
                            const sgn = (roadSegStep++ % 2 === 0) ? 1 : -1;
                            roadLampCandidates.push([
                                [px + nx * off * sgn, pz + nz * off * sgn],
                                [px - nx * off * sgn, pz - nz * off * sgn]
                            ]);
                        }
                    }
                }
            }

            if (imp <= 3 && w >= 6.5 && roadLanes.length < 55) {
                const mid = ptsLocal[Math.floor(ptsLocal.length / 2)];
                if (Math.abs(mid[0]) < 1200 && Math.abs(mid[1]) < 1200) {
                    roadLanes.push(ptsLocal.map(p => [Number(p[0].toFixed(1)), Number(p[1].toFixed(1))]));
                }
            }
            roadCount++;
        }
    }

    // 5. IGN Tramway Tracks -> Rail Ribbons + Sampled TAN Tram Polylines
    let tramSegCount = 0;
    const tramRoutes = [];
    for (const f of rails) {
        if (String(f.properties?.nature || '') !== 'Tramway') continue;
        for (const line of lineParts(f.geometry)) {
            const ptsLocal = [];
            for (const c of line) {
                const [gx, gz] = l93ToLocal(c[0], c[1]);
                if (Math.abs(gx) <= HALF_EXTENT && Math.abs(gz) <= HALF_EXTENT) {
                    const y = sampleMNT(gx, gz) + 0.20;
                    ptsLocal.push([gx, gz, y]);
                }
            }
            if (ptsLocal.length < 2) continue;
            for (let i = 0; i < ptsLocal.length - 1; i++) {
                const a = ptsLocal[i], b = ptsLocal[i + 1];
                const [tx, tz] = getTileIdx((a[0] + b[0]) * 0.5, (a[1] + b[1]) * 0.5);
                const tile = getTile(tx, tz);
                addRibbonSegment(tile.lod0.mat_tram, a, b, a[2], b[2], 0.14, -0.72);
                addRibbonSegment(tile.lod0.mat_tram, a, b, a[2], b[2], 0.14, 0.72);
            }
            if (tramRoutes.length < 48) {
                tramRoutes.push(ptsLocal.map(p => [Number(p[0].toFixed(1)), Number(p[1].toFixed(1))]));
            }
            tramSegCount++;
        }
    }

    console.log(`=== PHASE B: Exporting & Compressing 7x7 GLB Tiles ===`);
    console.log(`Processed: ${builtCount} buildings (${excludedMonuments} skipped around monuments), ${roadCount} roads, ${waterCount} hydro, ${parkCount} parks, ${tramSegCount} tramways`);

    const manifestTiles = [];
    let totalBytes = 0;

    const jobs = [];
    for (const tile of tileStore) {
        const key = `${tile.tx}_${tile.tz}`;
        const raw0 = buildGlbFromBuckets(tile.lod0);
        const raw1 = buildGlbFromBuckets(tile.lod1);
        if (!raw0 && !raw1) continue;
        jobs.push({ tile, key, raw0, raw1 });
    }

    const CONCURRENCY = 4;
    for (let i = 0; i < jobs.length; i += CONCURRENCY) {
        const chunk = jobs.slice(i, i + CONCURRENCY);
        await Promise.all(chunk.map(async ({ tile, key, raw0, raw1 }) => {
            let file0 = null, size0 = 0;
            let file1 = null, size1 = 0;
            if (raw0) {
                const rawP = path.join(TMP_DIR, `tile_${key}_lod0.glb`);
                const outName = `tile_${key}_lod0.glb`;
                const outP = path.join(TILES_DIR, outName);
                fs.writeFileSync(rawP, raw0);
                await compressWithMeshopt(rawP, outP);
                size0 = fs.statSync(outP).size;
                file0 = outName;
                totalBytes += size0;
            }
            if (raw1) {
                const rawP = path.join(TMP_DIR, `tile_${key}_lod1.glb`);
                const outName = `tile_${key}_lod1.glb`;
                const outP = path.join(TILES_DIR, outName);
                fs.writeFileSync(rawP, raw1);
                await compressWithMeshopt(rawP, outP);
                size1 = fs.statSync(outP).size;
                file1 = outName;
                totalBytes += size1;
            }
            manifestTiles.push({
                tx: tile.tx,
                tz: tile.tz,
                minX: -HALF_EXTENT + tile.tx * TILE_SIZE,
                minZ: -HALF_EXTENT + tile.tz * TILE_SIZE,
                lod0: file0,
                lod0Bytes: size0,
                lod1: file1,
                lod1Bytes: size1,
                colliders: tile.colliders
            });
            process.stdout.write(`[GLB] tile ${key}: LOD0=${(size0 / 1024).toFixed(1)}KB LOD1=${(size1 / 1024).toFixed(1)}KB\n`);
        }));
    }

    // Uniform per-tile spatial thinning across all 7x7 Nantes tiles so EVERY neighborhood receives balanced real furniture
    const isClearProp = (px, pz, pad = 1.8) => {
        if (Math.abs(px) >= HALF_EXTENT || Math.abs(pz) >= HALF_EXTENT) return false;
        const [ptx, ptz] = getTileIdx(px, pz);
        const cols = getTile(ptx, ptz).colliders;
        const pad2 = pad * pad;
        for (let i = 0; i < cols.length; i++) {
            const c = cols[i];
            if (px >= c.minX - pad && px <= c.maxX + pad && pz >= c.minZ - pad && pz <= c.maxZ + pad) {
                if (!c.p || c.p.length < 6) return false;
                if (pointInFlatPolyXZ(px, pz, c.p) || distSqToFlatPoly(px, pz, c.p) < pad2) return false;
            }
        }
        return true;
    };

    const thinPerTile = (arr, cellSize, maxPerTile) => {
        const perTile = Array.from({ length: GRID_COUNT * GRID_COUNT }, () => []);
        const seen = new Set();
        for (const p of arr) {
            if (Math.abs(p.x) >= HALF_EXTENT || Math.abs(p.z) >= HALF_EXTENT) continue;
            const [ptx, ptz] = getTileIdx(p.x, p.z);
            const tIdx = ptz * GRID_COUNT + ptx;
            if (perTile[tIdx].length >= maxPerTile) continue;
            const cellKey = `${Math.floor(p.x / cellSize)},${Math.floor(p.z / cellSize)}`;
            if (seen.has(cellKey)) continue;
            seen.add(cellKey);
            perTile[tIdx].push([p.x, p.z]);
        }
        return perTile.flat();
    };

    const treesThinned = thinPerTile(nmProps.trees, 14, 44);
    const lampsThinned = thinPerTile(nmProps.lamps, 18, 52);

    // Supplement missing streetlamps along real IGN road curbs in central Nantes (min 20m spacing)
    const lampBuckets = new Map();
    const recordLamp = (lx, lz) => {
        const key = `${Math.floor(lx / 20)},${Math.floor(lz / 20)}`;
        if (!lampBuckets.has(key)) lampBuckets.set(key, []);
        lampBuckets.get(key).push([lx, lz]);
    };
    const hasLampNear = (lx, lz, minDist = 20) => {
        const cx = Math.floor(lx / 20), cz = Math.floor(lz / 20);
        const minD2 = minDist * minDist;
        for (let dx = -1; dx <= 1; dx++) {
            for (let dz = -1; dz <= 1; dz++) {
                const arr = lampBuckets.get(`${cx + dx},${cz + dz}`);
                if (!arr) continue;
                for (let k = 0; k < arr.length; k++) {
                    const ex = arr[k][0] - lx, ez = arr[k][1] - lz;
                    if (ex * ex + ez * ez < minD2) return true;
                }
            }
        }
        return false;
    };
    for (const [lx, lz] of lampsThinned) recordLamp(lx, lz);
    for (const pair of roadLampCandidates) {
        if (lampsThinned.length >= 2200) break;
        for (const [candX, candZ] of pair) {
            if (!isClearProp(candX, candZ, 1.3) || sampleMNT(candX, candZ) < 0.1) continue;
            if (hasLampNear(candX, candZ, 20)) continue;
            const lx = Number(candX.toFixed(1));
            const lz = Number(candZ.toFixed(1));
            lampsThinned.push([lx, lz]);
            recordLamp(lx, lz);
            break;
        }
    }

    // Extract ~18 TAN Tramway shelter stops beside real IGN Tramway polylines
    const tramStops = [];
    const seenStopCell = new Set();
    for (const line of tramRoutes) {
        if (!line || line.length < 2) continue;
        const midIdx = Math.floor(line.length / 2);
        const a = line[Math.max(0, midIdx - 1)];
        const b = line[Math.min(line.length - 1, midIdx)];
        const mx = (a[0] + b[0]) * 0.5;
        const mz = (a[1] + b[1]) * 0.5;
        const dx = b[0] - a[0], dz = b[1] - a[1];
        const dl = Math.max(0.1, Math.hypot(dx, dz));
        const yaw = Math.atan2(dx, dz);
        const sx = mx + (-dz / dl) * 4.2;
        const sz = mz + (dx / dl) * 4.2;
        const sk = `${Math.floor(sx / 180)},${Math.floor(sz / 180)}`;
        if (seenStopCell.has(sk)) continue;
        if (isClearProp(sx, sz, 2.2) && sampleMNT(sx, sz) >= 0.1) {
            seenStopCell.add(sk);
            tramStops.push([Number(sx.toFixed(1)), Number(sz.toFixed(1)), Number(yaw.toFixed(2))]);
            if (tramStops.length >= 20) break;
        }
    }

    // Extract Benches & Café Plazas across Nantes Hubs, Plazas & Boulevards
    const benches = [];
    const centralPlazas = [];
    const seenBenchCell = new Set();
    const centralHubSeeds = [
        ['Tour Bretagne', -1.5581, 47.2173],
        ['Terrasse Bouffay', -1.5535, 47.2148],
        ['Place Graslin', -1.5618, 47.2133],
        ['Place Royale', -1.5582, 47.2144],
        ['Château des Ducs', -1.5496, 47.2162],
        ['Parvis Stereolux', -1.5634, 47.2054]
    ];
    for (const [hubName, lo, la] of centralHubSeeds) {
        const [hx, hz] = l93ToLocal(...wgs84ToL93(lo, la));
        let cafeDone = false;
        let benchCountHub = 0;
        for (let r = 6; r <= 34 && (!cafeDone || benchCountHub < 2); r += 5) {
            for (let a = 0; a < 360; a += 45) {
                const bx = Number((hx + Math.cos(a * Math.PI / 180) * r).toFixed(1));
                const bz = Number((hz + Math.sin(a * Math.PI / 180) * r).toFixed(1));
                if (!isClearProp(bx, bz, 1.8) || sampleMNT(bx, bz) < 0.1) continue;
                if (!cafeDone) {
                    centralPlazas.push([bx, bz, hubName]);
                    cafeDone = true;
                } else if (benchCountHub < 2) {
                    const bk = `${Math.floor(bx / 18)},${Math.floor(bz / 18)}`;
                    if (!seenBenchCell.has(bk)) {
                        seenBenchCell.add(bk);
                        benches.push([bx, bz, Number(((a * Math.PI) / 180).toFixed(2))]);
                        benchCountHub++;
                    }
                }
            }
        }
    }
    for (const pl of nmProps.plazas) {
        if (isClearProp(pl.x + 2.2, pl.z, 1.5)) benches.push([Number((pl.x + 2.2).toFixed(1)), pl.z, 0]);
        if (isClearProp(pl.x - 2.2, pl.z, 1.5)) benches.push([Number((pl.x - 2.2).toFixed(1)), pl.z, Number(Math.PI.toFixed(2))]);
    }
    for (let i = 0; i < treesThinned.length && benches.length < 280; i += 3) {
        const [tx, tz] = treesThinned[i];
        const bx = Number((tx + 2.0).toFixed(1));
        const bz = tz;
        const bk = `${Math.floor(bx / 42)},${Math.floor(bz / 42)}`;
        if (!seenBenchCell.has(bk) && isClearProp(bx, bz, 1.4)) {
            seenBenchCell.add(bk);
            benches.push([bx, bz, Number(((i % 4) * (Math.PI * 0.5)).toFixed(2))]);
        }
    }
    for (let i = 0; i < lampsThinned.length && benches.length < 280; i += 4) {
        const [lx, lz] = lampsThinned[i];
        const bx = Number((lx + 1.8).toFixed(1));
        const bz = Number((lz + 0.8).toFixed(1));
        const bk = `${Math.floor(bx / 42)},${Math.floor(bz / 42)}`;
        if (!seenBenchCell.has(bk) && isClearProp(bx, bz, 1.4) && sampleMNT(bx, bz) >= 0.1) {
            seenBenchCell.add(bk);
            benches.push([bx, bz, Number(((i % 4) * (Math.PI * 0.5)).toFixed(2))]);
        }
    }

    // 14 Real Nantes Bicloo Bike-Share Hub Locations
    const biclooWgs = [
        [-1.5581, 47.2173], [-1.5535, 47.2148], [-1.5504, 47.2162], [-1.5515, 47.2182],
        [-1.5618, 47.2133], [-1.5582, 47.2144], [-1.5425, 47.2175], [-1.5462, 47.2155],
        [-1.5485, 47.2121], [-1.5596, 47.2073], [-1.5634, 47.2054], [-1.5678, 47.2047],
        [-1.5655, 47.2100], [-1.5546, 47.2130]
    ];
    const bicloo = [];
    for (const [lo, la] of biclooWgs) {
        const [rx, rz] = l93ToLocal(...wgs84ToL93(lo, la));
        for (let r = 0; r <= 40; r += 5) {
            let placed = false;
            for (let a = 0; a < 360; a += 30) {
                const bx = rx + Math.cos(a * Math.PI / 180) * r;
                const bz = rz + Math.sin(a * Math.PI / 180) * r;
                if (isClearProp(bx, bz, 2.2) && sampleMNT(bx, bz) >= 0.1) {
                    bicloo.push([Number(bx.toFixed(1)), Number(bz.toFixed(1)), Number(((a * Math.PI) / 180).toFixed(2))]);
                    placed = true;
                    break;
                }
            }
            if (placed) break;
        }
    }

    // 28 Colonnes Morris around central Nantes squares & major boulevards
    const morris = [];
    const seenMorrisCell = new Set();
    const centralLamps = lampsThinned.filter(([lx, lz]) => Math.abs(lx) < 850 && Math.abs(lz) < 850);
    const outerLamps = lampsThinned.filter(([lx, lz]) => Math.abs(lx) >= 850 || Math.abs(lz) >= 850);
    const morrisCandidates = [
        ...centralLamps.filter((_, i) => i % Math.max(1, Math.floor(centralLamps.length / 24)) === 0),
        ...outerLamps.filter((_, i) => i % Math.max(1, Math.floor(outerLamps.length / 16)) === 0)
    ];
    for (const [lx, lz] of morrisCandidates) {
        if (morris.length >= 28) break;
        const mx = Number((lx + 2.4).toFixed(1));
        const mz = Number((lz + 1.4).toFixed(1));
        const mk = `${Math.floor(mx / 90)},${Math.floor(mz / 90)}`;
        if (!seenMorrisCell.has(mk) && isClearProp(mx, mz, 1.5) && sampleMNT(mx, mz) >= 0.1) {
            seenMorrisCell.add(mk);
            morris.push([mx, mz]);
        }
    }

    const propsOut = {
        trees: treesThinned,
        lamps: lampsThinned,
        tramStops,
        benches,
        bicloo,
        morris,
        fountains: nmProps.plazas
            .filter(p => p.kind.toLowerCase().includes('fontaine') || p.name.toLowerCase().includes('fontaine'))
            .slice(0, 14)
            .map(p => [p.x, p.z, p.name]),
        plazas: [...centralPlazas, ...nmProps.plazas.map(p => [p.x, p.z, p.name])].slice(0, 80)
    };

    // Rasterize 10m-resolution hydrography bitmask (280x280) for crisp water collision & riverbed carving
    const WATER_N = 280;
    const WATER_STEP = 10;
    const waterBits = new Uint8Array(Math.ceil((WATER_N * WATER_N) / 8));
    for (const poly of waterPolys2d) {
        const ix0 = Math.max(0, Math.floor((poly.minX + HALF_EXTENT) / WATER_STEP));
        const ix1 = Math.min(WATER_N - 1, Math.ceil((poly.maxX + HALF_EXTENT) / WATER_STEP));
        const iz0 = Math.max(0, Math.floor((poly.minZ + HALF_EXTENT) / WATER_STEP));
        const iz1 = Math.min(WATER_N - 1, Math.ceil((poly.maxZ + HALF_EXTENT) / WATER_STEP));
        for (let iz = iz0; iz <= iz1; iz++) {
            const wz = -HALF_EXTENT + (iz + 0.5) * WATER_STEP;
            for (let ix = ix0; ix <= ix1; ix++) {
                const wx = -HALF_EXTENT + (ix + 0.5) * WATER_STEP;
                if (!pointInRingPairs(wx, wz, poly.outer)) continue;
                let inHole = false;
                for (let hi = 0; hi < poly.holes.length; hi++) {
                    if (pointInRingPairs(wx, wz, poly.holes[hi])) { inHole = true; break; }
                }
                if (inHole) continue;
                const bitIdx = iz * WATER_N + ix;
                waterBits[bitIdx >> 3] |= (1 << (bitIdx & 7));
            }
        }
    }

    const mntQuantized = mntData.elevations.map(v => Math.round((v - mntData.waterBaseZ) * 10));
    const manifest = {
        city: 'Nantes',
        originL93: [ORIGIN_X, ORIGIN_Y],
        bounds: { minX: -HALF_EXTENT, maxX: HALF_EXTENT, minZ: -HALF_EXTENT, maxZ: HALF_EXTENT },
        tileSize: TILE_SIZE,
        grid: GRID_COUNT,
        waterBaseZ: mntData.waterBaseZ,
        mnt: { n: MNT_N, step: MNT_STEP, heightsDm: mntQuantized },
        waterMask: { n: WATER_N, step: WATER_STEP, b64: Buffer.from(waterBits).toString('base64') },
        tiles: manifestTiles,
        roadLanes,
        tramRoutes,
        props: propsOut,
        stats: {
            buildings: builtCount,
            roads: roadCount,
            water: waterCount,
            vegetation: parkCount,
            tramSegments: tramSegCount,
            treesTotal: nmProps.trees.length,
            lampsTotal: nmProps.lamps.length,
            totalGlbBytes: totalBytes
        }
    };

    fs.writeFileSync(path.join(OUT_DIR, 'nantes_manifest.json'), JSON.stringify(manifest));
    const totalMb = (totalBytes / (1024 * 1024)).toFixed(2);
    console.log(`=== DONE: ${manifestTiles.length} tiles, total GLB size = ${totalMb} MB ===`);

    // Append metrics cleanly to NANTES_LOG.md
    const logPath = path.join(ROOT_DIR, 'NANTES_LOG.md');
    if (fs.existsSync(logPath)) {
        const logTxt = fs.readFileSync(logPath, 'utf8').replace(
            '_(Complété automatiquement après exécution du script de génération)_',
            `- **Date de génération** : ${new Date().toISOString()}
- **Notice fallback Overpass -> Sources Officielles** : Tous les miroirs Overpass testés (\`overpass.openstreetmap.fr\` HTTP 403, \`overpass-api.de\` HTTP 406 / timeout, \`kumi.systems\` et \`private.coffee\` timeout) étant indisponibles lors du build, les voies de tramway proviennent de \`IGN BDTOPO_V3:troncon_de_voie_ferree\` (Licence Ouverte Etalab 2.0) et le mobilier urbain géolocalisé (arbres, éclairage public, îlots de fraîcheur / fontaines) provient des jeux officiels **Nantes Métropole Open Data** (\`244400404_patrimoine-arbore-nantes-metropole\`, \`244400404_luminaires-eclairage-public-nantes-metropole\`, \`244400404_ilot-fraicheur-nantes-metropole\`, **Licence Ouverte-LO**, usage commercial autorisé avec attribution).
- **Entités IGN BD TOPO V3** : \`${builtCount}\` bâtiments extrudés + toitures procédurales (\`${excludedMonuments}\` emprises réservées aux monuments modélisés), \`${roadCount}\` tronçons de route, \`${waterCount}\` surfaces hydrographiques (Loire, Erdre, Canal Saint-Félix), \`${parkCount}\` zones de végétation, \`${tramSegCount}\` tronçons de Tramway TAN.
- **MNT IGN RGE ALTI** : Grille \`${MNT_N}×${MNT_N}\` (\`${mntData.elevations.length}\` cotes NGF, niveau d'eau Loire calibré à \`${mntData.waterBaseZ} m NGF\`).
- **Arbres & Mobilier Nantes Métropole** : \`${nmProps.trees.length}\` arbres recensés (échantillonnés en \`${propsOut.trees.length}\` instances GPU), \`${nmProps.lamps.length}\` luminaires (échantillonnés en \`${propsOut.lamps.length}\`), \`${nmProps.plazas.length}\` îlots de fraîcheur / fontaines.
- **Tuiles GLB Meshopt (\`assets/nantes/tiles/\`)** : \`${manifestTiles.length}\` tuiles streamables \`LOD0\` + \`LOD1\` compressées avec \`@gltf-transform/cli --compress meshopt\`, taille totale = **\`${totalMb} Mo\`**.`
        );
        fs.writeFileSync(logPath, logTxt);
    }
}

run().catch(err => {
    console.error('PIPELINE ERROR:', err);
    process.exit(1);
});
