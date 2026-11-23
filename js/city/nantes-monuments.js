import { THREE } from '../core/libs.js';

export const NANTES_ORIGIN_L93 = Object.freeze({ x: 355250.0, y: 6689100.0 });

const L93_CONST = {
    E: 0.0818191910428158,
    N: 0.7256077650532670,
    C: 11754255.426096,
    XS: 700000.0,
    YS: 12655612.049876,
    LON0: (3.0 * Math.PI) / 180
};

export function wgs84ToLocal(lonDeg, latDeg) {
    const lon = (lonDeg * Math.PI) / 180;
    const lat = (latDeg * Math.PI) / 180;
    const s = Math.sin(lat);
    const L = 0.5 * Math.log((1 + s) / (1 - s)) - (L93_CONST.E / 2) * Math.log((1 + L93_CONST.E * s) / (1 - L93_CONST.E * s));
    const r = L93_CONST.C * Math.exp(-L93_CONST.N * L);
    const gamma = L93_CONST.N * (lon - L93_CONST.LON0);
    const lx = L93_CONST.XS + r * Math.sin(gamma);
    const ly = L93_CONST.YS - r * Math.cos(gamma);
    return {
        x: lx - NANTES_ORIGIN_L93.x,
        z: -(ly - NANTES_ORIGIN_L93.y)
    };
}

const _monumentColliders = [];
const _bridgeDecks = [];
const _monumentAviationLights = [];
const _monumentUplightSpots = [];
let _elephantGroup = null;
let _nearestMonumentLight = null;

function pushCol(x, z, hx, hz) {
    _monumentColliders.push({ minX: x - hx, maxX: x + hx, minZ: z - hz, maxZ: z + hz });
}

function evalBridgeY(br, along) {
    const u = Math.max(0, Math.min(1, (along + br.approach) / (br.len + br.approach * 2)));
    const s = Math.sin(u * Math.PI);
    const base = br.yStart * (1 - u) + br.yEnd * u;
    return base + Math.max(0, br.peakY - base) * (s * s);
}

function createBridges(root, getTerrainY) {
    _bridgeDecks.length = 0;

    const specs = [
        { name: 'Pont Anne-de-Bretagne', a: [-704, 376], b: [-635, 502], width: 16, archRise: 1.5 },
        { name: 'Passerelle Victor-Schoelcher', a: [-341, 299], b: [-324, 446], width: 8, archRise: 1.8 },
        { name: 'Pont Haudaudine', a: [124, 387], b: [144, 584], width: 14, archRise: 1.5 },
        { name: 'Pont Général-Audibert', a: [568, 496], b: [624, 646], width: 15, archRise: 1.5 },
        { name: 'Pont Aristide-Briand', a: [1093, 247], b: [1193, 453], width: 15, archRise: 1.6 },
        { name: 'Pont de la Rotonde', a: [825, -301], b: [867, -215], width: 11, archRise: 1.1 },
        { name: 'Pont de Tbilissi', a: [1200, 57], b: [1286, 4], width: 10, archRise: 1.1 },
        { name: 'Pont Saint-Mihiel', a: [387, -1116], b: [435, -1120], width: 10, archRise: 1.1 }
    ];

    const deckMat = new THREE.MeshStandardMaterial({ color: '#272c38', roughness: 0.72, metalness: 0.12 });
    const walkwayMat = new THREE.MeshStandardMaterial({ color: '#64748b', roughness: 0.85, metalness: 0.05 });
    const concreteMat = new THREE.MeshStandardMaterial({ color: '#94a3b8', roughness: 0.78 });
    const ironMat = new THREE.MeshStandardMaterial({ color: '#1e293b', roughness: 0.4, metalness: 0.75 });
    const railMat = new THREE.MeshStandardMaterial({ color: '#38bdf8', emissive: '#0284c7', emissiveIntensity: 0.3, roughness: 0.4, metalness: 0.7 });
    const lampBulbMat = new THREE.MeshBasicMaterial({ color: '#fef08a' });

    const APPROACH = 24;
    const SEGMENTS = 14;

    for (const sp of specs) {
        const ax = sp.a[0], az = sp.a[1];
        const bx = sp.b[0], bz = sp.b[1];
        const dx = bx - ax;
        const dz = bz - az;
        const len = Math.hypot(dx, dz);
        const ux = dx / len;
        const uz = dz / len;
        const cx = (ax + bx) * 0.5;
        const cz = (az + bz) * 0.5;
        const yaw = Math.atan2(dx, dz);

        const yStart = Math.max(0.12, getTerrainY(ax - ux * APPROACH, az - uz * APPROACH) + 0.08);
        const yEnd = Math.max(0.12, getTerrainY(bx + ux * APPROACH, bz + uz * APPROACH) + 0.08);
        const peakY = Math.max(Math.max(yStart, yEnd) + sp.archRise, 4.4);

        const br = {
            name: sp.name,
            ax, az, bx, bz,
            ux, uz, len,
            cx, cz,
            approach: APPROACH,
            halfWidth: sp.width * 0.5,
            yStart, yEnd, peakY
        };
        _bridgeDecks.push(br);

        const grp = new THREE.Group();
        grp.position.set(cx, 0, cz);
        grp.rotation.y = yaw;

        const totalSpan = len + APPROACH * 2;
        const dAlong = totalSpan / SEGMENTS;
        const roadW = Math.max(4.4, sp.width - 2.6);
        const walkW = 1.25;

        for (let s = 0; s < SEGMENTS; s++) {
            const a0 = -APPROACH + s * dAlong;
            const a1 = a0 + dAlong;
            const y0 = evalBridgeY(br, a0);
            const y1 = evalBridgeY(br, a1);
            const ym = (y0 + y1) * 0.5;
            const pitch = -Math.atan2(y1 - y0, dAlong);
            const segZ = (a0 + a1) * 0.5 - len * 0.5;

            const segGrp = new THREE.Group();
            segGrp.position.set(0, ym, segZ);
            segGrp.rotation.x = pitch;

            const slab = new THREE.Mesh(new THREE.BoxGeometry(roadW, 0.72, dAlong + 0.25), deckMat);
            slab.position.set(0, -0.36, 0);
            segGrp.add(slab);

            [-1, 1].forEach(side => {
                const walk = new THREE.Mesh(new THREE.BoxGeometry(walkW, 0.84, dAlong + 0.25), walkwayMat);
                walk.position.set(side * (roadW * 0.5 + walkW * 0.5), -0.32, 0);
                segGrp.add(walk);
                if (s >= 1 && s <= SEGMENTS - 2) {
                    const rail = new THREE.Mesh(new THREE.BoxGeometry(0.18, 1.0, dAlong + 0.12), railMat);
                    rail.position.set(side * (sp.width * 0.48), 0.55, 0);
                    segGrp.add(rail);
                }
            });

            if (s >= 2 && s <= SEGMENTS - 3 && s % 2 === 0) {
                const side = (s % 4 === 0) ? 1 : -1;
                const post = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.10, 4.4, 6), ironMat);
                post.position.set(side * (sp.width * 0.46), 2.2, 0);
                const lantern = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.16, 0.42), lampBulbMat);
                lantern.position.set(side * (sp.width * 0.42), 4.42, 0);
                segGrp.add(post, lantern);
            }

            grp.add(segGrp);
        }

        // Reinforced concrete piers descending into Loire/Erdre riverbed
        [len * 0.25, len * 0.5, len * 0.75].forEach(pAlong => {
            const py = evalBridgeY(br, pAlong);
            const pierH = py + 4.5;
            const pier = new THREE.Mesh(new THREE.BoxGeometry(sp.width * 0.78, pierH, 2.8), concreteMat);
            pier.position.set(0, py - 0.5 - pierH * 0.5, pAlong - len * 0.5);
            grp.add(pier);
        });

        root.add(grp);
    }
}

export function getBridgeElevation(x, z) {
    let bestY = null;
    for (let i = 0; i < _bridgeDecks.length; i++) {
        const br = _bridgeDecks[i];
        const rx = x - br.ax;
        const rz = z - br.az;
        const along = rx * br.ux + rz * br.uz;
        const lat = Math.abs(rx * (-br.uz) + rz * br.ux);
        if (along >= -br.approach && along <= br.len + br.approach && lat <= br.halfWidth) {
            const y = evalBridgeY(br, along);
            if (bestY === null || y > bestY) bestY = y;
        }
    }
    return bestY;
}

export function getBridgeSpecs() {
    return _bridgeDecks;
}

export function constrainToBridgeDeck(x, z, radius = 0.8) {
    for (let i = 0; i < _bridgeDecks.length; i++) {
        const br = _bridgeDecks[i];
        const rx = x - br.ax;
        const rz = z - br.az;
        const along = rx * br.ux + rz * br.uz;
        if (along < 2 || along > br.len - 2) continue;
        const latSigned = rx * (-br.uz) + rz * br.ux;
        const maxLat = Math.max(0.6, br.halfWidth - Math.min(0.65, radius * 0.55) - 0.4);
        if (Math.abs(latSigned) <= br.halfWidth + 1.5 && Math.abs(latSigned) > maxLat) {
            const clampedLat = Math.sign(latSigned) * maxLat;
            return {
                x: br.ax + br.ux * along + (-br.uz) * clampedLat,
                z: br.az + br.uz * along + br.ux * clampedLat
            };
        }
    }
    return { x, z };
}

function buildTourBretagne(root, getTerrainY) {
    const pos = wgs84ToLocal(-1.5581, 47.2176);
    const y0 = getTerrainY(pos.x, pos.z);
    const g = new THREE.Group();
    g.position.set(pos.x, y0, pos.z);

    const concrete = new THREE.MeshStandardMaterial({ color: '#9ca3af', roughness: 0.72, metalness: 0.12 });
    const darkGlass = new THREE.MeshStandardMaterial({ color: '#1b2b3d', roughness: 0.12, metalness: 0.78 });
    const whiteNid = new THREE.MeshStandardMaterial({ color: '#f8fafc', roughness: 0.35, metalness: 0.15 });
    const goldAccent = new THREE.MeshBasicMaterial({ color: '#fbbf24' });

    // Wide modernist base plinth
    const podium = new THREE.Mesh(new THREE.BoxGeometry(34, 16, 28), concrete);
    podium.position.y = 8;
    // Tall 116m modernist tower shaft with concrete corner ribs
    const shaft = new THREE.Mesh(new THREE.BoxGeometry(20, 112, 16), darkGlass);
    shaft.position.y = 58;
    const ribA = new THREE.Mesh(new THREE.BoxGeometry(21.2, 116, 3.8), concrete); ribA.position.set(0, 58, 0);
    const ribB = new THREE.Mesh(new THREE.BoxGeometry(3.8, 116, 17.2), concrete); ribB.position.set(0, 58, 0);

    // Cantilevered upper cylinder ("Le Nid" panoramic crown at top of 144m tower)
    const upperCap = new THREE.Mesh(new THREE.BoxGeometry(24, 10, 20), concrete);
    upperCap.position.y = 118;
    const nidCrown = new THREE.Mesh(new THREE.CylinderGeometry(10.5, 9.2, 7.5, 24), whiteNid);
    nidCrown.position.y = 126.5;
    const trimRing = new THREE.Mesh(new THREE.CylinderGeometry(10.8, 10.8, 0.8, 24), goldAccent);
    trimRing.position.y = 123;

    const spire = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.75, 19, 8), concrete);
    spire.position.y = 139.5;
    const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.65, 10, 10), new THREE.MeshBasicMaterial({ color: '#ef4444' }));
    beacon.position.y = 149.2;
    _monumentAviationLights.push(beacon);

    g.add(podium, shaft, ribA, ribB, upperCap, nidCrown, trimRing, spire, beacon);
    root.add(g);
    pushCol(pos.x, pos.z, 17.5, 14.5);
    return pos;
}

function buildChateauDucs(root, getTerrainY) {
    const pos = wgs84ToLocal(-1.5496, 47.2162);
    const y0 = getTerrainY(pos.x, pos.z);
    const g = new THREE.Group();
    g.position.set(pos.x, y0, pos.z);

    const tuffeauMat = new THREE.MeshStandardMaterial({ color: '#d8ceb9', roughness: 0.84 });
    const graniteMat = new THREE.MeshStandardMaterial({ color: '#78716c', roughness: 0.88 });
    const slateMat = new THREE.MeshStandardMaterial({ color: '#273142', roughness: 0.56, metalness: 0.25 });
    const moatMat = new THREE.MeshStandardMaterial({ color: '#0e4c63', roughness: 0.14, metalness: 0.5 });

    // Water-filled outer moat ring
    const moat = new THREE.Mesh(new THREE.BoxGeometry(82, 0.4, 72), moatMat);
    moat.position.y = 0.22;
    g.add(moat);

    // Fortified curtain walls around courtyard
    const wallH = 12.5;
    const northW = new THREE.Mesh(new THREE.BoxGeometry(62, wallH, 4.2), graniteMat); northW.position.set(0, wallH / 2, -26);
    const southW = northW.clone(); southW.position.z = 26;
    const eastW = new THREE.Mesh(new THREE.BoxGeometry(4.2, wallH, 52), graniteMat); eastW.position.set(30, wallH / 2, 0);
    const westW = eastW.clone(); westW.position.x = -30;
    g.add(northW, southW, eastW, westW);

    // 5 Cylindrical machicolated towers + conical slate roofs
    const towerCoords = [[-30, -26], [30, -26], [30, 26], [-30, 26], [-32, -4]];
    towerCoords.forEach(([tx, tz]) => {
        const cyl = new THREE.Mesh(new THREE.CylinderGeometry(5.6, 6.2, 18.5, 18), graniteMat);
        cyl.position.set(tx, 9.25, tz);
        const cone = new THREE.Mesh(new THREE.ConeGeometry(6.3, 8.8, 18), slateMat);
        cone.position.set(tx, 22.8, tz);
        g.add(cyl, cone);
    });

    // Renaissance white tuffeau Grand Logis palace inside courtyard
    const logis = new THREE.Mesh(new THREE.BoxGeometry(28, 19, 13), tuffeauMat);
    logis.position.set(4, 9.5, -2);
    const logisRoof = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.72, 1, 4), slateMat);
    logisRoof.rotation.y = Math.PI / 4;
    logisRoof.scale.set(29, 7.2, 14);
    logisRoof.position.set(4, 22.5, -2);
    // West entrance gate bridge over moat
    const bridge = new THREE.Mesh(new THREE.BoxGeometry(14, 1.2, 7.5), graniteMat);
    bridge.position.set(-37, 0.9, -4);
    g.add(logis, logisRoof, bridge);

    root.add(g);
    pushCol(pos.x, pos.z, 34, 30);
    return pos;
}

function buildCathedrale(root, getTerrainY) {
    const pos = wgs84ToLocal(-1.5503, 47.2183);
    const y0 = getTerrainY(pos.x, pos.z);
    const g = new THREE.Group();
    g.position.set(pos.x, y0, pos.z);

    const tuffeau = new THREE.MeshStandardMaterial({ color: '#dfd6c2', roughness: 0.86 });
    const slate = new THREE.MeshStandardMaterial({ color: '#2b3445', roughness: 0.6, metalness: 0.22 });
    const roseMat = new THREE.MeshBasicMaterial({ color: '#93c5fd' });

    // High Gothic Nave + Transepts
    const nave = new THREE.Mesh(new THREE.BoxGeometry(58, 34, 24), tuffeau);
    nave.position.set(8, 17, 0);
    const naveRoof = new THREE.Mesh(new THREE.ConeGeometry(1, 1, 4), slate);
    naveRoof.rotation.y = Math.PI / 4;
    naveRoof.scale.set(60, 11, 25);
    naveRoof.position.set(8, 39.5, 0);

    const transept = new THREE.Mesh(new THREE.BoxGeometry(18, 32, 42), tuffeau);
    transept.position.set(14, 16, 0);
    g.add(nave, naveRoof, transept);

    // Twin 63m Flamboyant Gothic West Bell Towers facing Place Saint-Pierre (-X)
    [-9.2, 9.2].forEach(tz => {
        const tower = new THREE.Mesh(new THREE.BoxGeometry(11.5, 63, 11.5), tuffeau);
        tower.position.set(-22, 31.5, tz);
        const cap = new THREE.Mesh(new THREE.BoxGeometry(12.2, 1.8, 12.2), tuffeau);
        cap.position.set(-22, 63.5, tz);
        g.add(tower, cap);
    });

    // West Portal Facade + Radiant Rose Window
    const portal = new THREE.Mesh(new THREE.BoxGeometry(12, 36, 12), tuffeau);
    portal.position.set(-21.5, 18, 0);
    const rose = new THREE.Mesh(new THREE.CylinderGeometry(4.2, 4.2, 0.6, 20), roseMat);
    rose.rotation.z = Math.PI / 2;
    rose.position.set(-27.8, 25, 0);
    g.add(portal, rose);

    root.add(g);
    pushCol(pos.x + 2, pos.z, 34, 16);
    return pos;
}

function buildGrueTitanJaune(root, getTerrainY) {
    const pos = wgs84ToLocal(-1.5681, 47.2044);
    const y0 = Math.max(0.35, getTerrainY(pos.x, pos.z));
    const g = new THREE.Group();
    g.position.set(pos.x, y0, pos.z);
    g.rotation.y = -0.35;

    const yellow = new THREE.MeshStandardMaterial({ color: '#facc15', roughness: 0.42, metalness: 0.55 });
    const darkSteel = new THREE.MeshStandardMaterial({ color: '#1e293b', roughness: 0.48, metalness: 0.72 });

    // 4 A-frame portal gantry legs
    [[-4.5, -4.5], [4.5, -4.5], [-4.5, 4.5], [4.5, 4.5]].forEach(([lx, lz]) => {
        const leg = new THREE.Mesh(new THREE.BoxGeometry(0.95, 17, 0.95), yellow);
        leg.position.set(lx * 0.75, 8.5, lz * 0.75);
        leg.rotation.z = lx > 0 ? 0.14 : -0.14;
        leg.rotation.x = lz > 0 ? -0.14 : 0.14;
        g.add(leg);
    });

    const platform = new THREE.Mesh(new THREE.BoxGeometry(7.2, 2.2, 7.2), yellow);
    platform.position.y = 17.5;
    const pylon = new THREE.Mesh(new THREE.BoxGeometry(3.8, 12, 3.8), yellow);
    pylon.position.y = 24.5;
    const cab = new THREE.Mesh(new THREE.BoxGeometry(3.6, 3.8, 5.2), yellow);
    cab.position.set(3.2, 21.5, 2.0);
    const counter = new THREE.Mesh(new THREE.BoxGeometry(4.6, 3.2, 9.5), darkSteel);
    counter.position.set(0, 29.0, -9.5);

    // Long cantilevered steel crane jib stretching over the Loire
    const jib = new THREE.Mesh(new THREE.BoxGeometry(2.2, 2.6, 44), yellow);
    jib.position.set(0, 31.2, 16);
    jib.rotation.x = -0.06;
    const cable = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 17, 6), darkSteel);
    cable.position.set(0, 23.5, 34);
    g.add(platform, pylon, cab, counter, jib, cable);

    root.add(g);
    pushCol(pos.x, pos.z, 6, 6);
    return pos;
}

function buildNefsMachines(root, getTerrainY) {
    const pos = wgs84ToLocal(-1.5642, 47.2063);
    const y0 = Math.max(0.35, getTerrainY(pos.x, pos.z));
    const g = new THREE.Group();
    g.position.set(pos.x, y0, pos.z);
    g.rotation.y = 0.25;

    const steelMat = new THREE.MeshStandardMaterial({ color: '#374151', roughness: 0.45, metalness: 0.68 });
    const glassMat = new THREE.MeshStandardMaterial({ color: '#7dd3fc', transparent: true, opacity: 0.36, roughness: 0.12, metalness: 0.72 });
    const woodMat = new THREE.MeshStandardMaterial({ color: '#7c4e2d', roughness: 0.75 });
    const bronzeMat = new THREE.MeshStandardMaterial({ color: '#b47b3c', roughness: 0.38, metalness: 0.72 });

    // Twin parabolic-vault steel & glass shipyard Nefs
    [-12, 12].forEach(ox => {
        const hall = new THREE.Mesh(new THREE.BoxGeometry(19, 13, 62), glassMat);
        hall.position.set(ox, 6.5, 0);
        const roof = new THREE.Mesh(new THREE.CylinderGeometry(9.8, 9.8, 62, 12, 1, false, 0, Math.PI), steelMat);
        roof.rotation.z = Math.PI / 2;
        roof.rotation.y = Math.PI / 2;
        roof.position.set(ox, 13, 0);
        g.add(hall, roof);

        for (let z = -28; z <= 28; z += 14) {
            const truss = new THREE.Mesh(new THREE.BoxGeometry(20.4, 14, 0.9), steelMat);
            truss.position.set(ox, 7.0, z);
            g.add(truss);
        }
    });

    // Grand Elephant (iconic 12m mechanical timber-and-steel elephant sculpture on esplanade)
    const el = new THREE.Group();
    el.position.set(28, 0, 12);
    const torso = new THREE.Mesh(new THREE.BoxGeometry(4.2, 4.6, 8.2), woodMat);
    torso.position.y = 6.2;
    const head = new THREE.Mesh(new THREE.BoxGeometry(3.2, 3.4, 3.2), woodMat);
    head.position.set(0, 7.0, 5.2);
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.55, 4.8, 8), bronzeMat);
    trunk.position.set(0, 5.6, 7.4);
    trunk.rotation.x = 0.65;
    [[-1.3, 2.6], [1.3, 2.6], [-1.3, -2.6], [1.3, -2.6]].forEach(([lx, lz]) => {
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.68, 4.4, 8), woodMat);
        leg.position.set(lx, 2.2, lz);
        el.add(leg);
    });
    const howdah = new THREE.Mesh(new THREE.BoxGeometry(3.4, 1.8, 4.2), bronzeMat);
    howdah.position.y = 9.4;
    el.add(torso, head, trunk, howdah);
    _elephantGroup = el;
    g.add(el);

    root.add(g);
    pushCol(pos.x, pos.z, 24, 32);
    return pos;
}

function buildTourLU(root, getTerrainY) {
    const pos = wgs84ToLocal(-1.5458, 47.2156);
    const y0 = Math.max(0.35, getTerrainY(pos.x, pos.z));
    const g = new THREE.Group();
    g.position.set(pos.x, y0, pos.z);

    const whiteStone = new THREE.MeshStandardMaterial({ color: '#ebe5d8', roughness: 0.75 });
    const luBlue = new THREE.MeshStandardMaterial({ color: '#1d4ed8', roughness: 0.35, metalness: 0.4 });
    const luGold = new THREE.MeshStandardMaterial({ color: '#f59e0b', emissive: '#b45309', emissiveIntensity: 0.25, roughness: 0.28, metalness: 0.78 });
    const brickMat = new THREE.MeshStandardMaterial({ color: '#8f4c3d', roughness: 0.88 });

    // Cylindrical/Octagonal Art Nouveau Tour LU tower
    const base = new THREE.Mesh(new THREE.CylinderGeometry(4.4, 5.0, 18, 12), whiteStone);
    base.position.y = 9;
    const collar = new THREE.Mesh(new THREE.CylinderGeometry(4.8, 4.8, 3.2, 12), luBlue);
    collar.position.y = 19.5;
    const lantern = new THREE.Mesh(new THREE.CylinderGeometry(3.1, 3.8, 7.0, 12), luGold);
    lantern.position.y = 24.5;
    const dome = new THREE.Mesh(new THREE.SphereGeometry(3.2, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.55), luBlue);
    dome.position.y = 28;
    const spire = new THREE.Mesh(new THREE.ConeGeometry(0.7, 5.5, 10), luGold);
    spire.position.y = 33.2;

    // Industrial red-brick Lieu Unique hall beside Canal Saint-Félix
    const hall = new THREE.Mesh(new THREE.BoxGeometry(28, 11, 20), brickMat);
    hall.position.set(16, 5.5, 4);

    g.add(base, collar, lantern, dome, spire, hall);
    root.add(g);
    pushCol(pos.x, pos.z, 12, 12);
    return pos;
}

export function buildNantesMonuments(root, getTerrainY) {
    _monumentColliders.length = 0;
    _monumentAviationLights.length = 0;
    _monumentUplightSpots.length = 0;

    createBridges(root, getTerrainY);
    const placed = {
        tourBretagne: buildTourBretagne(root, getTerrainY),
        chateau: buildChateauDucs(root, getTerrainY),
        cathedrale: buildCathedrale(root, getTerrainY),
        grueJaune: buildGrueTitanJaune(root, getTerrainY),
        nefs: buildNefsMachines(root, getTerrainY),
        tourLU: buildTourLU(root, getTerrainY)
    };

    [
        [placed.tourBretagne, '#fbbf24', 24],
        [placed.chateau, '#fcd34d', 16],
        [placed.cathedrale, '#fde68a', 22],
        [placed.grueJaune, '#facc15', 14],
        [placed.nefs, '#38bdf8', 12],
        [placed.tourLU, '#fbbf24', 18]
    ].forEach(([p, col, hOff]) => {
        const gy = getTerrainY(p.x, p.z);
        _monumentUplightSpots.push({ x: p.x, y: gy + hOff, z: p.z, color: col });
    });

    if (!_nearestMonumentLight) {
        _nearestMonumentLight = new THREE.PointLight('#fbbf24', 0, 95, 1.4);
        root.add(_nearestMonumentLight);
    }

    return placed;
}

export function tickNantesMonuments(tSec, playerPos = null, isNight = false, isGolden = false) {
    const blinkOn = Math.sin(tSec * 3.2) > 0.1;
    for (let i = 0; i < _monumentAviationLights.length; i++) {
        _monumentAviationLights[i].material.color.set(blinkOn ? '#ef4444' : '#3b0a0a');
    }
    if (_elephantGroup) {
        _elephantGroup.rotation.y = Math.sin(tSec * 0.25) * 0.12;
    }
    if (_nearestMonumentLight && _monumentUplightSpots.length > 0 && playerPos) {
        let best = _monumentUplightSpots[0];
        let bestD = Infinity;
        for (let i = 0; i < _monumentUplightSpots.length; i++) {
            const s = _monumentUplightSpots[i];
            const d = Math.hypot(s.x - playerPos.x, s.z - playerPos.z);
            if (d < bestD) { bestD = d; best = s; }
        }
        _nearestMonumentLight.position.set(best.x, best.y, best.z);
        _nearestMonumentLight.color.set(best.color);
        _nearestMonumentLight.intensity = isNight ? 55 : (isGolden ? 28 : 0);
    }
}

export function getMonumentColliders() {
    return _monumentColliders;
}
