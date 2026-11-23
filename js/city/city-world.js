import { THREE, GLTFLoader, MeshoptDecoder } from '../core/libs.js';
import {
    buildNantesMonuments,
    tickNantesMonuments,
    getMonumentColliders,
    getBridgeElevation,
    wgs84ToLocal
} from './nantes-monuments.js';

export const CITY_BOUNDS = Object.freeze({
    minX: -1360,
    maxX: 1360,
    minZ: -1360,
    maxZ: 1360
});

export const SIDEWALK_HEIGHT = 0.22;

let _cityRoot = null;
let _tileContainer = null;
let _monumentGroup = null;
let _cityBuilt = false;
let _manifest = null;
let _manifestLoaded = false;

let _loader = null;
const _tileRecords = new Map();
let _activeTileColliders = [];
let _lastPlayerTileKey = '';

const MAX_CONCURRENT_TILE_LOADS = 4;
const _tileLoadQueue = [];
let _inFlightLoads = 0;

let _labelSignMesh = null;
let _labelSignCanvas = null;
let _labelSignTex = null;
let _rivalSignMesh = null;
let _rivalSignCanvas = null;
let _rivalSignTex = null;

const _beacons = [];
const _bldgEmissiveMats = [];
const _streetPointLights = [];
let _lampHaloMat = null;
let _lampConeMat = null;
let _morrisPosterMat = null;
let _waterMat = null;
let _waterBumpTex = null;
let _waterMaskBytes = null;
let _waterMaskN = 280;
let _waterMaskStep = 10;
let _lastTimeTickAt = 0;

const _facadeSourceCache = Object.create(null);
let _barkPair = null;
let _foliageCardTex = null;
let _matLibrary = null;

// Clean obstacle-free Nantes GPS plaza coordinates matched to IGN BD TOPO buildings
const NANTES_LANDMARK_SPECS = [
    {
        id: 'pro_studio',
        title: 'Tour Bretagne · Studio Pro',
        subtitle: 'Mon Penthouse / Label HQ',
        district: 'CENTRE · TOUR BRETAGNE',
        pos: { x: -20.3, z: -516.9 },
        accentHex: '#fbbf24',
        billboardTag: 'LABEL HQ · TOUR BRETAGNE',
        billboardKind: 'label'
    },
    {
        id: 'showcase_club',
        title: 'Stereolux · Bounce Live',
        subtitle: 'Lancer un Showcase CCTV',
        district: 'ÎLE DE NANTES · CRÉATION',
        pos: { x: -501.2, z: 756.4 },
        accentHex: '#a855f7',
        billboardTag: 'LIVE CONCERT · STEREOLUX'
    },
    {
        id: 'vinyl_shop',
        title: 'Disquaire Bouffay / Graslin',
        subtitle: 'Digger des Samples & Licences',
        district: 'BOUFFAY · GRASLIN',
        pos: { x: 356.2, z: -224.2 },
        accentHex: '#10b981',
        billboardTag: 'VINYLS & SAMPLES NANTES'
    },
    {
        id: 'gear_shop',
        title: 'Studio+ · Quartier Création',
        subtitle: 'Acheter du Matos & Plugins',
        district: 'ÎLE DE NANTES · CRÉATION',
        pos: { x: -196.7, z: 581.6 },
        accentHex: '#38bdf8',
        billboardTag: 'HARDWARE STORE · NANTES'
    },
    {
        id: 'bedroom',
        title: 'Chambre · Les Olivettes',
        subtitle: 'Rentrer dans ta Chambre',
        district: 'LES OLIVETTES · MADELEINE',
        pos: { x: 680.8, z: 97.8 },
        accentHex: '#f59e0b',
        billboardTag: 'SAFEHOUSE · OLIVETTES'
    },
    {
        id: 'rival_hq',
        title: 'QG Rival · Quai de la Fosse',
        subtitle: 'Beat Battle & Top 10 Rival',
        district: 'QUAI DE LA FOSSE · LOIRE',
        pos: { x: -617.2, z: 256.4 },
        accentHex: '#fb7185',
        billboardTag: 'CLASH RIVAL · QUAI DE LA FOSSE',
        billboardKind: 'rival'
    }
];

const _landmarks = NANTES_LANDMARK_SPECS.map(s => ({
    id: s.id,
    title: s.title,
    subtitle: s.subtitle,
    district: s.district,
    x: s.pos.x,
    z: s.pos.z,
    tx: s.pos.x,
    tz: s.pos.z,
    accentHex: s.accentHex
}));

export function getNantesManifest() {
    return _manifest;
}

export function getNantesDistrictAt(x, z) {
    if (z > 320 && z < 470 && Math.abs(x) < 950) return { name: 'PONT & LOIRE · MADELEINE', color: '#06b6d4' };
    if (z > 960 && x < -450) return { name: 'HANGAR À BANANES · LOIRE', color: '#f43f5e' };
    if (z >= 450 && x < -380) return { name: 'PARC DES CHANTIERS · NEFS', color: '#a855f7' };
    if (z >= 380) return { name: 'ÎLE DE NANTES · CRÉATION', color: '#38bdf8' };
    if (x < -380 && z >= 80 && z < 380) return { name: 'QUAI DE LA FOSSE · LOIRE', color: '#fb7185' };
    if (x > 520 && z >= -120 && z < 380) return { name: 'LES OLIVETTES · MADELEINE', color: '#f59e0b' };
    if (x > 650 && z < -250) return { name: 'JARDIN DES PLANTES · GARE', color: '#10b981' };
    if (z < -920 && x > -250 && x < 550) return { name: 'ÎLE DE VERSAILLES · ERDRE', color: '#34d399' };
    if (x > 120 && x < 720 && z < 60 && z > -650) return { name: 'BOUFFAY · CHÂTEAU DES DUCS', color: '#f59e0b' };
    return { name: 'CENTRE · TOUR BRETAGNE', color: '#fbbf24' };
}

export function sampleNantesMnt(x, z) {
    if (!_manifest || !_manifest.mnt) return 2.5;
    const { n, step, heightsDm } = _manifest.mnt;
    const half = 1400;
    const fx = Math.max(0, Math.min(n - 1.001, (x + half) / step));
    const fz = Math.max(0, Math.min(n - 1.001, (z + half) / step));
    const ix = Math.floor(fx);
    const iz = Math.floor(fz);
    const tx = fx - ix;
    const tz = fz - iz;
    const h00 = heightsDm[iz * n + ix] * 0.1;
    const h10 = heightsDm[iz * n + ix + 1] * 0.1;
    const h01 = heightsDm[(iz + 1) * n + ix] * 0.1;
    const h11 = heightsDm[(iz + 1) * n + ix + 1] * 0.1;
    const h0 = h00 + (h10 - h00) * tx;
    const h1 = h01 + (h11 - h01) * tx;
    return Math.max(0.0, h0 + (h1 - h0) * tz);
}

export function getCityGroundHeight(x, z) {
    const bridgeY = getBridgeElevation(x, z);
    if (bridgeY !== null) return bridgeY;
    return Math.max(0.12, sampleNantesMnt(x, z) + 0.08);
}

function decodeWaterMask(wm) {
    if (!wm || !wm.b64) {
        _waterMaskBytes = null;
        return;
    }
    const bin = atob(wm.b64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    _waterMaskBytes = bytes;
    _waterMaskN = Number(wm.n) || 280;
    _waterMaskStep = Number(wm.step) || 10;
}

function isRawWaterBit(x, z) {
    if (!_waterMaskBytes) return false;
    const ix = Math.floor((x + 1400) / _waterMaskStep);
    const iz = Math.floor((z + 1400) / _waterMaskStep);
    if (ix < 0 || ix >= _waterMaskN || iz < 0 || iz >= _waterMaskN) return false;
    const bitIdx = iz * _waterMaskN + ix;
    return ((_waterMaskBytes[bitIdx >> 3] >> (bitIdx & 7)) & 1) === 1;
}

export function isPointInWater(x, z) {
    if (getBridgeElevation(x, z) !== null) return false;
    if (!_waterMaskBytes) return sampleNantesMnt(x, z) <= 0.04;
    return isRawWaterBit(x, z);
}

function makeScaledCanvasTexture(canvas, isSrgb, rx = 1, ry = 1) {
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(rx, ry);
    tex.anisotropy = 4;
    if (isSrgb && 'colorSpace' in tex && THREE.SRGBColorSpace) {
        tex.colorSpace = THREE.SRGBColorSpace;
    }
    return tex;
}

function getDistrictFacadeCanvases(style) {
    if (_facadeSourceCache[style]) return _facadeSourceCache[style];

    const W = 512;
    const H = 512;
    const colC = document.createElement('canvas'); colC.width = W; colC.height = H;
    const bumpC = document.createElement('canvas'); bumpC.width = W; bumpC.height = H;
    const roughC = document.createElement('canvas'); roughC.width = W; roughC.height = H;
    const emC = document.createElement('canvas'); emC.width = W; emC.height = H;

    const cCtx = colC.getContext('2d');
    const bCtx = bumpC.getContext('2d');
    const rCtx = roughC.getContext('2d');
    const eCtx = emC.getContext('2d');

    eCtx.fillStyle = '#000000'; eCtx.fillRect(0, 0, W, H);
    rCtx.fillStyle = 'rgb(220,220,220)'; rCtx.fillRect(0, 0, W, H);
    bCtx.fillStyle = 'rgb(155,155,155)'; bCtx.fillRect(0, 0, W, H);

    // Special Ground-Floor Commercial Storefront Material (vitrines, awnings, doors)
    if (style === 'shopfront') {
        cCtx.fillStyle = '#221f1c';
        cCtx.fillRect(0, 0, W, H);
        // Granite base kickplate & upper transom cornice
        cCtx.fillStyle = '#3b3733';
        cCtx.fillRect(0, H - 56, W, 56);
        cCtx.fillStyle = '#4f4a44';
        cCtx.fillRect(0, 0, W, 38);
        bCtx.fillStyle = 'rgb(235,235,235)';
        bCtx.fillRect(0, 0, W, 38);
        bCtx.fillRect(0, H - 56, W, 56);

        const shopColors = ['#1d3228', '#4a1b20', '#1d2738', '#3d281b'];
        const awningColors = [
            ['#6b1d24', '#d8d2c5'],
            ['#174536', '#dcd7ca'],
            ['#1e2f52', '#d8dce3'],
            ['#5c3518', '#e2d7c2']
        ];
        for (let b = 0; b < 4; b++) {
            const bx = b * 128;
            // Timber shopfront panel + upper signboard fascia
            cCtx.fillStyle = shopColors[b % shopColors.length];
            cCtx.fillRect(bx + 6, 44, 116, H - 100);
            cCtx.fillStyle = '#181a1f';
            cCtx.fillRect(bx + 10, 48, 108, 18);
            cCtx.fillStyle = 'rgba(226,215,194,0.45)';
            cCtx.fillRect(bx + 22, 54, 84, 5);

            // Striped Nantes café/boutique awning band
            const [c1, c2] = awningColors[b % awningColors.length];
            for (let s = 0; s < 8; s++) {
                cCtx.fillStyle = (s % 2 === 0) ? c1 : c2;
                cCtx.fillRect(bx + 6 + s * 14.5, 68, 14.5, 34);
            }

            // Diversified Ground-Floor Bays (Café, Closed Boutique/Door, Disquaire, Brasserie)
            const vx = bx + 16, vy = 110, vw = 96, vh = 284;
            if (b === 1) {
                // Bay 1: Closed boutique / recessed dark oak & stone entrance door
                cCtx.fillStyle = '#2d241e';
                cCtx.fillRect(bx + 12, vy, vw + 8, vh + 14);
                cCtx.fillStyle = '#0e1520';
                cCtx.fillRect(vx + 8, vy + 10, vw - 16, vh * 0.46);
                cCtx.fillStyle = '#3b2c22';
                cCtx.fillRect(vx + 10, vy + vh * 0.50, vw - 20, vh * 0.50);
                cCtx.fillStyle = '#cbd5e1';
                cCtx.fillRect(vx + 18, vy + vh * 0.72, 8, 4);
                rCtx.fillStyle = 'rgb(42,42,42)';
                rCtx.fillRect(vx + 8, vy + 10, vw - 16, vh * 0.46);
                eCtx.fillStyle = '#1e293b';
                eCtx.fillRect(vx + 10, vy + 12, vw - 20, vh * 0.42);
            } else {
                const vGrad = cCtx.createLinearGradient(vx, vy, vx, vy + vh);
                if (b === 0) {
                    vGrad.addColorStop(0, '#3a2614');
                    vGrad.addColorStop(0.55, '#613c1a');
                    vGrad.addColorStop(1, '#1c1209');
                } else if (b === 2) {
                    vGrad.addColorStop(0, '#352b1d');
                    vGrad.addColorStop(0.55, '#66502e');
                    vGrad.addColorStop(1, '#1e170e');
                } else {
                    vGrad.addColorStop(0, '#382a1a');
                    vGrad.addColorStop(0.55, '#6e4c21');
                    vGrad.addColorStop(1, '#20160a');
                }
                cCtx.fillStyle = vGrad;
                cCtx.fillRect(vx, vy, vw, vh);
                rCtx.fillStyle = 'rgb(26,26,26)';
                rCtx.fillRect(vx, vy, vw, vh);
                bCtx.fillStyle = 'rgb(40,40,40)';
                bCtx.fillRect(vx, vy, vw, vh);

                const eGrad = eCtx.createLinearGradient(vx, vy, vx, vy + vh);
                if (b === 0) {
                    // Café / Bar warm amber
                    eGrad.addColorStop(0, '#f59e0b');
                    eGrad.addColorStop(0.60, '#78350f');
                    eGrad.addColorStop(1, '#291507');
                } else if (b === 2) {
                    // Disquaire / Librairie softer warm-gold
                    eGrad.addColorStop(0, '#fcd38d');
                    eGrad.addColorStop(0.58, '#9a5b13');
                    eGrad.addColorStop(1, '#26180a');
                } else {
                    // Brasserie / Boulangerie warm tungsten
                    eGrad.addColorStop(0, '#fbbf24');
                    eGrad.addColorStop(0.58, '#6b3b0e');
                    eGrad.addColorStop(1, '#1f1308');
                }
                eCtx.fillStyle = eGrad;
                eCtx.fillRect(vx + 3, vy + 3, vw - 6, vh - 6);

                // Silhouetted interior counter / racks & transom mullions
                cCtx.fillStyle = 'rgba(18, 14, 11, 0.72)';
                eCtx.fillStyle = '#090705';
                if (b === 0) {
                    cCtx.fillRect(vx + 6, vy + vh * 0.64, vw - 12, vh * 0.34);
                    eCtx.fillRect(vx + 6, vy + vh * 0.64, vw - 12, vh * 0.34);
                } else if (b === 2) {
                    cCtx.fillRect(vx + 8, vy + vh * 0.42, 34, vh * 0.56);
                    cCtx.fillRect(vx + 50, vy + vh * 0.52, 36, vh * 0.46);
                    eCtx.fillRect(vx + 8, vy + vh * 0.42, 34, vh * 0.56);
                    eCtx.fillRect(vx + 50, vy + vh * 0.52, 36, vh * 0.46);
                }

                // Shop transom bar & glass mullions
                cCtx.fillStyle = '#181615';
                cCtx.fillRect(vx + vw * 0.62, vy, 5, vh);
                cCtx.fillRect(vx, vy + vh * 0.24, vw, 5);
                eCtx.fillStyle = '#000000';
                eCtx.fillRect(vx + vw * 0.62, vy, 5, vh);
                eCtx.fillRect(vx, vy + vh * 0.24, vw, 5);
            }
        }
        const res = { colC, bumpC, roughC, emC };
        _facadeSourceCache[style] = res;
        return res;
    }

    const cfg = {
        tuffeau: {
            base: '#e4dcc8', mortar: '#c6bca4', ledge: '#efe9da', frame: '#2c2723',
            rows: 3, cols: 4, sillH: 9, hasBalcony: true, glassTop: '#1b2b3b', glassBot: '#38516b', emCol: '#ffdf9e'
        },
        colombage: {
            base: '#dcc8a4', mortar: '#b8a07a', ledge: '#432e21', frame: '#322218',
            rows: 3, cols: 4, sillH: 10, hasBalcony: false, glassTop: '#182430', glassBot: '#2e4154', emCol: '#ffd089'
        },
        haussmann: {
            base: '#cfc5b0', mortar: '#aba08b', ledge: '#e2dac8', frame: '#2a2723',
            rows: 3, cols: 4, sillH: 8, hasBalcony: true, glassTop: '#1c2b3a', glassBot: '#39526b', emCol: '#ffd89a'
        },
        brick: {
            base: '#8c5543', mortar: '#665b53', ledge: '#d9d0bd', frame: '#1f2329',
            rows: 4, cols: 4, sillH: 7, hasBalcony: false, glassTop: '#172330', glassBot: '#2f455c', emCol: '#ffe2a8'
        },
        beton50: {
            base: '#a6acb5', mortar: '#848b96', ledge: '#c3c8d1', frame: '#1d222b',
            rows: 4, cols: 4, sillH: 6, hasBalcony: false, glassTop: '#182433', glassBot: '#31465f', emCol: '#fdecc4'
        },
        modern: {
            base: '#4a5260', mortar: '#323845', ledge: '#677182', frame: '#11151d',
            rows: 4, cols: 4, sillH: 6, hasBalcony: false, glassTop: '#152232', glassBot: '#293e58', emCol: '#fde68a'
        },
        tower: {
            base: '#253142', mortar: '#192230', ledge: '#4a5a72', frame: '#111926',
            rows: 4, cols: 5, sillH: 5, hasBalcony: false, glassTop: '#16283e', glassBot: '#345376', emCol: '#e2f0ff'
        }
    }[style] || {
        base: '#9ca3af', mortar: '#6b7280', ledge: '#cbd5e1', frame: '#111827',
        rows: 4, cols: 4, sillH: 6, hasBalcony: false, glassTop: '#172434', glassBot: '#2e455d', emCol: '#fde68a'
    };

    cCtx.fillStyle = cfg.base;
    cCtx.fillRect(0, 0, W, H);

    if (style === 'tuffeau' || style === 'haussmann') {
        const stoneH = 32, stoneW = 96;
        cCtx.strokeStyle = cfg.mortar;
        cCtx.lineWidth = 2;
        for (let sy = 0; sy < H; sy += stoneH) {
            const off = ((sy / stoneH) % 2) * (stoneW / 2);
            cCtx.beginPath(); cCtx.moveTo(0, sy); cCtx.lineTo(W, sy); cCtx.stroke();
            for (let sx = -stoneW; sx < W + stoneW; sx += stoneW) {
                const tint = (((sy * 11 + sx) % 7) - 3) * 2;
                const baseRGB = style === 'tuffeau' ? [228, 220, 200] : [207, 197, 176];
                cCtx.fillStyle = `rgb(${baseRGB[0] + tint}, ${baseRGB[1] + tint}, ${baseRGB[2] + tint})`;
                cCtx.fillRect(sx + off + 1, sy + 1, stoneW - 2, stoneH - 2);
                bCtx.fillStyle = 'rgb(165,165,165)';
                bCtx.fillRect(sx + off + 1, sy + 1, stoneW - 2, stoneH - 2);
            }
        }
    } else if (style === 'colombage') {
        // Medieval Bouffay half-timbering dark oak beam framework + plaster bays
        cCtx.fillStyle = '#3b281c';
        bCtx.fillStyle = 'rgb(215,215,215)';
        for (let x = 0; x <= W; x += 128) {
            cCtx.fillRect(x - 6, 0, 12, H);
            bCtx.fillRect(x - 6, 0, 12, H);
        }
        for (let x = 0; x < W; x += 64) {
            cCtx.fillRect(x - 3, 0, 6, H);
        }
        const rH = H / cfg.rows;
        cCtx.strokeStyle = '#3b281c';
        cCtx.lineWidth = 7;
        for (let r = 0; r < cfg.rows; r++) {
            const y0 = r * rH;
            cCtx.beginPath();
            for (let cIdx = 0; cIdx < cfg.cols; cIdx++) {
                const x0 = cIdx * 128;
                cCtx.moveTo(x0, y0); cCtx.lineTo(x0 + 128, y0 + rH);
                cCtx.moveTo(x0 + 128, y0); cCtx.lineTo(x0, y0 + rH);
            }
            cCtx.stroke();
        }
    } else if (style === 'brick') {
        const bH = 12, bW = 36;
        const shades = ['#8c5443', '#7d4838', '#99604d', '#734235'];
        cCtx.fillStyle = cfg.mortar;
        cCtx.fillRect(0, 0, W, H);
        let rowNum = 0;
        for (let by = 0; by < H; by += bH) {
            const off = (rowNum % 2) * (bW / 2);
            for (let bx = -bW; bx < W + bW; bx += bW) {
                cCtx.fillStyle = shades[Math.abs((rowNum * 5 + Math.floor(bx / bW) * 11) % shades.length)];
                cCtx.fillRect(bx + off + 1, by + 1, bW - 2, bH - 2);
            }
            rowNum++;
        }
        // Tuffeau corner stone quoins (classic Nantes brique & tuffeau)
        for (let by = 0; by < H; by += 28) {
            cCtx.fillStyle = '#dfd6c2';
            cCtx.fillRect(0, by, 20, 24);
            cCtx.fillRect(W - 20, by, 20, 24);
        }
    } else if (style === 'beton50') {
        // Postwar vertical concrete pilasters
        cCtx.fillStyle = '#9299a3';
        for (let x = 0; x < W; x += 128) {
            cCtx.fillRect(x, 0, 18, H);
            bCtx.fillStyle = 'rgb(225,225,225)';
            bCtx.fillRect(x, 0, 18, H);
        }
    } else if (style === 'tower') {
        rCtx.fillStyle = 'rgb(115,115,115)';
        rCtx.fillRect(0, 0, W, H);
    }

    const rowH = H / cfg.rows;
    const colW = W / cfg.cols;

    for (let r = 0; r < cfg.rows; r++) {
        const fTop = r * rowH;
        cCtx.fillStyle = cfg.ledge;
        cCtx.fillRect(0, fTop, W, cfg.sillH);
        const ao = cCtx.createLinearGradient(0, fTop + cfg.sillH, 0, fTop + cfg.sillH + 10);
        ao.addColorStop(0, 'rgba(0,0,0,0.28)');
        ao.addColorStop(1, 'rgba(0,0,0,0)');
        cCtx.fillStyle = ao;
        cCtx.fillRect(0, fTop + cfg.sillH, W, 10);
        bCtx.fillStyle = 'rgb(235,235,235)';
        bCtx.fillRect(0, fTop, W, cfg.sillH);

        for (let col = 0; col < cfg.cols; col++) {
            const padX = style === 'tower' ? 6 : 18;
            const padY = style === 'tower' ? 10 : 18;
            const wx = col * colW + padX;
            const wy = fTop + cfg.sillH + padY;
            const ww = colW - padX * 2;
            const wh = rowH - cfg.sillH - padY * 1.8;

            // Tuffeau & Brick windows get pale limestone lintel surrounds
            if (style === 'brick' || style === 'tuffeau') {
                cCtx.fillStyle = '#eae2cf';
                cCtx.fillRect(wx - 7, wy - 7, ww + 14, wh + 14);
            }
            cCtx.fillStyle = cfg.frame;
            cCtx.fillRect(wx - 3, wy - 3, ww + 6, wh + 6);

            const gGrad = cCtx.createLinearGradient(wx, wy, wx + ww * 0.4, wy + wh);
            gGrad.addColorStop(0, cfg.glassTop);
            gGrad.addColorStop(0.55, cfg.glassBot);
            gGrad.addColorStop(1, '#101824');
            cCtx.fillStyle = gGrad;
            cCtx.fillRect(wx, wy, ww, wh);

            cCtx.fillStyle = 'rgba(205, 228, 255, 0.12)';
            cCtx.beginPath();
            cCtx.moveTo(wx, wy + wh * 0.25);
            cCtx.lineTo(wx + ww * 0.65, wy);
            cCtx.lineTo(wx + ww, wy);
            cCtx.lineTo(wx, wy + wh * 0.65);
            cCtx.closePath();
            cCtx.fill();

            rCtx.fillStyle = 'rgb(28, 28, 28)';
            rCtx.fillRect(wx, wy, ww, wh);
            bCtx.fillStyle = 'rgb(40, 40, 40)';
            bCtx.fillRect(wx, wy, ww, wh);

            cCtx.fillStyle = cfg.frame;
            cCtx.fillRect(wx + ww * 0.5 - 1.5, wy, 3, wh);
            cCtx.fillRect(wx, wy + wh * 0.45, ww, 3);

            if (cfg.hasBalcony) {
                const railTop = wy + wh * 0.64;
                cCtx.fillStyle = '#18181b';
                cCtx.fillRect(wx - 4, railTop, ww + 8, 3);
                for (let rx = wx; rx <= wx + ww; rx += 8) {
                    cCtx.fillRect(rx, railTop, 2, wy + wh - railTop);
                }
            }

            const hash = Math.abs(Math.sin((r * 23 + col * 41 + style.length * 11) * 12.9898) * 43758.5453) % 1;
            if (hash > 0.62) {
                const roomGrad = eCtx.createLinearGradient(wx, wy, wx, wy + wh);
                roomGrad.addColorStop(0, '#4a3216');
                roomGrad.addColorStop(0.45, hash > 0.84 ? '#e8c68e' : '#f6be68');
                roomGrad.addColorStop(1, '#5c3914');
                eCtx.fillStyle = roomGrad;
                eCtx.fillRect(wx + 2, wy + 2, ww - 4, wh - 4);
                if ((r + col) % 2 === 0) {
                    const curtW = Math.max(4, ww * 0.16);
                    eCtx.fillStyle = 'rgba(18, 12, 6, 0.72)';
                    eCtx.fillRect(wx + 2, wy + 2, curtW, wh - 4);
                    eCtx.fillRect(wx + ww - 2 - curtW, wy + 2, curtW, wh - 4);
                }
                eCtx.fillStyle = '#000000';
                eCtx.fillRect(wx + ww * 0.5 - 1.5, wy, 3, wh);
                eCtx.fillRect(wx, wy + wh * 0.45, ww, 3);
                if (cfg.hasBalcony) {
                    const railTop = wy + wh * 0.64;
                    eCtx.fillRect(wx - 4, railTop, ww + 8, 3);
                    for (let rx = wx; rx <= wx + ww; rx += 8) {
                        eCtx.fillRect(rx, railTop, 2, wy + wh - railTop);
                    }
                }
            }
        }
    }

    const res = { colC, bumpC, roughC, emC };
    _facadeSourceCache[style] = res;
    return res;
}

function makeBuildingMat(style) {
    const src = getDistrictFacadeCanvases(style);
    const mat = new THREE.MeshStandardMaterial({
        map: makeScaledCanvasTexture(src.colC, true, 1, 1),
        bumpMap: makeScaledCanvasTexture(src.bumpC, false, 1, 1),
        bumpScale: 0.14,
        roughnessMap: makeScaledCanvasTexture(src.roughC, false, 1, 1),
        roughness: 1.0,
        metalness: style === 'tower' ? 0.38 : 0.08,
        emissiveMap: makeScaledCanvasTexture(src.emC, true, 1, 1),
        emissive: new THREE.Color('#ffffff'),
        emissiveIntensity: 0.06
    });
    _bldgEmissiveMats.push(mat);
    return mat;
}

function getMaterialLibrary() {
    if (_matLibrary) return _matLibrary;

    const roadC = document.createElement('canvas'); roadC.width = 256; roadC.height = 256;
    const rCtx = roadC.getContext('2d');
    rCtx.fillStyle = '#1b202b'; rCtx.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 4200; i++) {
        rCtx.fillStyle = (i % 3 === 0) ? 'rgba(255,255,255,0.038)' : 'rgba(0,0,0,0.22)';
        rCtx.fillRect((i * 73) % 256, (i * 139) % 256, 2, 2);
    }
    // Crisp Nantes granite sidewalk curbs & dark rain gutters flanking both sides of carriageway
    rCtx.fillStyle = '#a4aab6';
    rCtx.fillRect(0, 0, 15, 256);
    rCtx.fillRect(241, 0, 15, 256);
    rCtx.fillStyle = 'rgba(20, 24, 32, 0.5)';
    for (let y = 0; y < 256; y += 32) {
        rCtx.fillRect(0, y, 15, 2);
        rCtx.fillRect(241, y, 15, 2);
    }
    rCtx.fillStyle = '#10141d';
    rCtx.fillRect(15, 0, 6, 256);
    rCtx.fillRect(235, 0, 6, 256);
    // White edge lines & dashed center road divider
    rCtx.fillStyle = 'rgba(226, 232, 240, 0.45)';
    rCtx.fillRect(25, 0, 4, 256);
    rCtx.fillRect(227, 0, 4, 256);
    rCtx.fillStyle = 'rgba(226, 232, 240, 0.58)';
    for (let y = 0; y < 256; y += 64) rCtx.fillRect(126, y + 8, 4, 34);

    // Historic Nantes granite-cobble roadway (Bouffay / Graslin / Château) with light granite curbs
    const roadCobbleC = document.createElement('canvas'); roadCobbleC.width = 256; roadCobbleC.height = 256;
    const roadCobbleB = document.createElement('canvas'); roadCobbleB.width = 256; roadCobbleB.height = 256;
    const rcCtx = roadCobbleC.getContext('2d');
    const rcbCtx = roadCobbleB.getContext('2d');
    rcCtx.fillStyle = '#333945'; rcCtx.fillRect(0, 0, 256, 256);
    rcbCtx.fillStyle = 'rgb(75,75,75)'; rcbCtx.fillRect(0, 0, 256, 256);
    let rcRow = 0;
    for (let y = 0; y < 256; y += 16) {
        const off = (rcRow % 2) * 12;
        for (let x = -24; x < 280; x += 24) {
            const v = (((rcRow * 17 + Math.floor(x / 24) * 29) % 17) - 8) * 1.6;
            const g = Math.max(66, Math.min(110, Math.round(86 + v)));
            rcCtx.fillStyle = `rgb(${g}, ${g + 4}, ${g + 12})`;
            rcCtx.fillRect(x + off + 1, y + 1, 22, 14);
            rcbCtx.fillStyle = 'rgb(195,195,195)';
            rcbCtx.fillRect(x + off + 1, y + 1, 22, 14);
        }
        rcRow++;
    }
    rcCtx.fillStyle = '#a8aeb9';
    rcCtx.fillRect(0, 0, 16, 256);
    rcCtx.fillRect(240, 0, 16, 256);
    rcCtx.fillStyle = '#181c26';
    rcCtx.fillRect(16, 0, 5, 256);
    rcCtx.fillRect(235, 0, 5, 256);
    rcbCtx.fillStyle = 'rgb(230,230,230)';
    rcbCtx.fillRect(0, 0, 16, 256);
    rcbCtx.fillRect(240, 0, 16, 256);

    const waterBumpC = document.createElement('canvas'); waterBumpC.width = 256; waterBumpC.height = 256;
    const wbCtx = waterBumpC.getContext('2d');
    const wbImg = wbCtx.createImageData(256, 256);
    for (let y = 0; y < 256; y++) {
        const v = (y / 256) * Math.PI * 2;
        for (let x = 0; x < 256; x++) {
            const u = (x / 256) * Math.PI * 2;
            const wv = Math.sin(u * 4 + v * 2) * 0.4 + Math.cos(u * 7 - v * 5) * 0.35 + Math.sin(v * 9 + u) * 0.25;
            const g = Math.max(0, Math.min(255, Math.round(128 + wv * 58)));
            const idx = (y * 256 + x) * 4;
            wbImg.data[idx] = g;
            wbImg.data[idx + 1] = g;
            wbImg.data[idx + 2] = g;
            wbImg.data[idx + 3] = 255;
        }
    }
    wbCtx.putImageData(wbImg, 0, 0);
    _waterBumpTex = makeScaledCanvasTexture(waterBumpC, false, 45, 45);

    _waterMat = new THREE.MeshStandardMaterial({
        color: '#0c4f69',
        emissive: '#072b3a',
        emissiveIntensity: 0.25,
        bumpMap: _waterBumpTex,
        bumpScale: 0.14,
        roughness: 0.12,
        metalness: 0.62,
        polygonOffset: true,
        polygonOffsetFactor: -1,
        polygonOffsetUnits: -1
    });

    const parkC = document.createElement('canvas'); parkC.width = 512; parkC.height = 512;
    const pCtx = parkC.getContext('2d');
    const parkB = document.createElement('canvas'); parkB.width = 512; parkB.height = 512;
    const pbCtx = parkB.getContext('2d');
    pCtx.fillStyle = '#265332'; pCtx.fillRect(0, 0, 512, 512);
    pbCtx.fillStyle = 'rgb(120,120,120)'; pbCtx.fillRect(0, 0, 512, 512);
    const grassShades = ['#2e613b', '#1e4629', '#386f44', '#244d2f'];
    for (let i = 0; i < 3200; i++) {
        const gx = (i * 97) % 512, gy = (i * 173) % 512;
        const r = 3 + (i % 7);
        pCtx.fillStyle = grassShades[i % grassShades.length];
        pCtx.fillRect(gx, gy, r, r);
        pbCtx.fillStyle = (i % 2 === 0) ? 'rgb(165,165,165)' : 'rgb(95,95,95)';
        pbCtx.fillRect(gx, gy, 2, 4);
    }

    const slateC = document.createElement('canvas'); slateC.width = 256; slateC.height = 256;
    const sCtx = slateC.getContext('2d');
    const slateB = document.createElement('canvas'); slateB.width = 256; slateB.height = 256;
    const sbCtx = slateB.getContext('2d');
    sCtx.fillStyle = '#252e3d'; sCtx.fillRect(0, 0, 256, 256);
    sbCtx.fillStyle = 'rgb(80,80,80)'; sbCtx.fillRect(0, 0, 256, 256);
    for (let y = 0; y < 256; y += 24) {
        const off = ((y / 24) % 2) * 16;
        for (let x = -32; x < 288; x += 32) {
            const v = (((x * 13 + y * 7) % 15) - 7) * 1.4;
            const c0 = Math.round(42 + v);
            sCtx.fillStyle = `rgb(${c0}, ${c0 + 8}, ${c0 + 22})`;
            sCtx.fillRect(x + off + 1, y + 1, 30, 22);
            sbCtx.fillStyle = 'rgb(185,185,185)';
            sbCtx.fillRect(x + off + 1, y + 1, 30, 22);
        }
    }

    const tileC = document.createElement('canvas'); tileC.width = 256; tileC.height = 256;
    const tCtx = tileC.getContext('2d');
    const tileB = document.createElement('canvas'); tileB.width = 256; tileB.height = 256;
    const tbCtx = tileB.getContext('2d');
    tCtx.fillStyle = '#7e3b2c'; tCtx.fillRect(0, 0, 256, 256);
    tbCtx.fillStyle = 'rgb(80,80,80)'; tbCtx.fillRect(0, 0, 256, 256);
    for (let y = 0; y < 256; y += 22) {
        for (let x = 0; x < 256; x += 20) {
            const v = (((x * 7 + y * 11) % 14) - 7) * 1.8;
            tCtx.fillStyle = `rgb(${Math.round(145 + v)}, ${Math.round(73 + v * 0.6)}, ${Math.round(56 + v * 0.5)})`;
            tCtx.fillRect(x + 2, y + 1, 16, 19);
            tbCtx.fillStyle = 'rgb(200,200,200)';
            tbCtx.fillRect(x + 3, y + 1, 14, 19);
        }
    }

    _matLibrary = {
        mat_tuffeau: makeBuildingMat('tuffeau'),
        mat_colombage: makeBuildingMat('colombage'),
        mat_haussmann: makeBuildingMat('haussmann'),
        mat_brick: makeBuildingMat('brick'),
        mat_beton50: makeBuildingMat('beton50'),
        mat_modern: makeBuildingMat('modern'),
        mat_tower: makeBuildingMat('tower'),
        mat_shopfront: makeBuildingMat('shopfront'),
        mat_roof_slate: new THREE.MeshStandardMaterial({
            map: makeScaledCanvasTexture(slateC, true, 1.5, 1.5),
            bumpMap: makeScaledCanvasTexture(slateB, false, 1.5, 1.5),
            bumpScale: 0.08,
            roughness: 0.60,
            metalness: 0.22
        }),
        mat_roof_tile: new THREE.MeshStandardMaterial({
            map: makeScaledCanvasTexture(tileC, true, 1.5, 1.5),
            bumpMap: makeScaledCanvasTexture(tileB, false, 1.5, 1.5),
            bumpScale: 0.10,
            roughness: 0.82,
            metalness: 0.04
        }),
        mat_roof_flat: new THREE.MeshStandardMaterial({ color: '#333b48', roughness: 0.88, metalness: 0.12 }),
        mat_road: new THREE.MeshStandardMaterial({
            map: makeScaledCanvasTexture(roadC, true, 1, 1),
            roughness: 0.72,
            metalness: 0.08,
            polygonOffset: true,
            polygonOffsetFactor: -2,
            polygonOffsetUnits: -2
        }),
        mat_road_cobble: new THREE.MeshStandardMaterial({
            map: makeScaledCanvasTexture(roadCobbleC, true, 1, 1),
            bumpMap: makeScaledCanvasTexture(roadCobbleB, false, 1, 1),
            bumpScale: 0.08,
            roughness: 0.82,
            metalness: 0.06,
            polygonOffset: true,
            polygonOffsetFactor: -2,
            polygonOffsetUnits: -2
        }),
        mat_tram_bed: (() => {
            const tbC = document.createElement('canvas'); tbC.width = 256; tbC.height = 256;
            const tbB = document.createElement('canvas'); tbB.width = 256; tbB.height = 256;
            const tCtx = tbC.getContext('2d');
            const bCtx = tbB.getContext('2d');
            // Nantes granite-paved / concrete-sleeper dedicated tramway platform
            tCtx.fillStyle = '#474e59'; tCtx.fillRect(0, 0, 256, 256);
            bCtx.fillStyle = 'rgb(125,125,125)'; bCtx.fillRect(0, 0, 256, 256);
            // Outer stone curbs framing the tram corridor
            tCtx.fillStyle = '#8b93a2';
            tCtx.fillRect(0, 0, 14, 256);
            tCtx.fillRect(242, 0, 14, 256);
            bCtx.fillStyle = 'rgb(215,215,215)';
            bCtx.fillRect(0, 0, 14, 256);
            bCtx.fillRect(242, 0, 14, 256);
            // Transverse paving / sleeper joints
            for (let y = 0; y < 256; y += 24) {
                tCtx.fillStyle = 'rgba(20, 24, 31, 0.38)';
                tCtx.fillRect(14, y, 228, 3);
                bCtx.fillStyle = 'rgb(75,75,75)';
                bCtx.fillRect(14, y, 228, 3);
            }
            // Subtle dark recessed rail-channel grooves
            tCtx.fillStyle = 'rgba(10, 14, 20, 0.65)';
            [36, 94, 162, 220].forEach(gx => tCtx.fillRect(gx - 4, 0, 8, 256));
            return new THREE.MeshStandardMaterial({
                map: makeScaledCanvasTexture(tbC, true, 1, 1),
                bumpMap: makeScaledCanvasTexture(tbB, false, 1, 1),
                bumpScale: 0.06,
                roughness: 0.85,
                metalness: 0.06,
                polygonOffset: true,
                polygonOffsetFactor: -3,
                polygonOffsetUnits: -3
            });
        })(),
        mat_tram: new THREE.MeshStandardMaterial({
            color: '#f1f5f9',
            roughness: 0.18,
            metalness: 0.94,
            polygonOffset: true,
            polygonOffsetFactor: -4,
            polygonOffsetUnits: -4
        }),
        mat_water: _waterMat,
        mat_park: new THREE.MeshStandardMaterial({
            map: makeScaledCanvasTexture(parkC, true, 0.08, 0.08),
            bumpMap: makeScaledCanvasTexture(parkB, false, 0.08, 0.08),
            bumpScale: 0.06,
            roughness: 0.90,
            metalness: 0.02,
            polygonOffset: true,
            polygonOffsetFactor: -1,
            polygonOffsetUnits: -1
        })
    };
    return _matLibrary;
}

function getCobblestoneTextures() {
    const S = 512;
    const c = document.createElement('canvas'); c.width = S; c.height = S;
    const b = document.createElement('canvas'); b.width = S; b.height = S;
    const ctx = c.getContext('2d');
    const bCtx = b.getContext('2d');

    // Authentic pale Nantes pedestrian granite sidewalk slabs (dalles piétonnes le long des bâtiments)
    ctx.fillStyle = '#7b828e'; ctx.fillRect(0, 0, S, S);
    bCtx.fillStyle = 'rgb(95,95,95)'; bCtx.fillRect(0, 0, S, S);

    const slabH = 64, slabW = 64;
    let rN = 0;
    for (let y = 0; y < S; y += slabH) {
        const off = (rN % 2) * (slabW / 2);
        for (let x = -slabW; x < S + slabW; x += slabW) {
            const v = (((rN * 19 + Math.floor(x / slabW) * 31) % 17) - 8) * 1.4;
            const g = Math.max(138, Math.min(182, Math.round(162 + v)));
            ctx.fillStyle = `rgb(${g}, ${g - 1}, ${g - 4})`;
            ctx.fillRect(x + off + 2, y + 2, slabW - 4, slabH - 4);
            bCtx.fillStyle = 'rgb(205,205,205)';
            bCtx.fillRect(x + off + 2, y + 2, slabW - 4, slabH - 4);
        }
        rN++;
    }
    return {
        map: makeScaledCanvasTexture(c, true, 240, 240),
        bumpMap: makeScaledCanvasTexture(b, false, 240, 240)
    };
}

function getBarkTextures() {
    if (_barkPair) return _barkPair;
    const W = 256, H = 512;
    const c = document.createElement('canvas'); c.width = W; c.height = H;
    const b = document.createElement('canvas'); b.width = W; b.height = H;
    const ctx = c.getContext('2d');
    const bCtx = b.getContext('2d');
    ctx.fillStyle = '#4f4338'; ctx.fillRect(0, 0, W, H);
    bCtx.fillStyle = 'rgb(140,140,140)'; bCtx.fillRect(0, 0, W, H);

    for (let i = 0; i < 420; i++) {
        const x = (i * 59) % W, y = (i * 83) % H, w = 4 + (i % 9), h = 28 + (i % 46);
        const dark = (i % 3 === 0);
        ctx.fillStyle = dark ? '#342b23' : ((i % 5 === 0) ? '#685b4c' : '#584b3e');
        ctx.fillRect(x, y, w, h);
        bCtx.fillStyle = dark ? 'rgb(55,55,55)' : 'rgb(205,205,205)';
        bCtx.fillRect(x, y, w, h);
    }
    _barkPair = {
        map: makeScaledCanvasTexture(c, true, 1, 2),
        bumpMap: makeScaledCanvasTexture(b, false, 1, 2)
    };
    return _barkPair;
}

function createFoliageCardTexture() {
    if (_foliageCardTex) return _foliageCardTex;
    const S = 512;
    const c = document.createElement('canvas');
    c.width = S; c.height = S;
    const ctx = c.getContext('2d');
    ctx.clearRect(0, 0, S, S);

    ctx.strokeStyle = '#3c3024';
    ctx.lineCap = 'round';
    [
        [256, 420, 256, 130, 7], [256, 330, 135, 195, 5], [256, 315, 385, 185, 5],
        [256, 235, 165, 120, 4], [256, 225, 345, 125, 4], [256, 365, 110, 290, 4], [256, 360, 405, 285, 4]
    ].forEach(([x0, y0, x1, y1, lw]) => {
        ctx.lineWidth = lw;
        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.quadraticCurveTo((x0 + x1) * 0.5, (y0 + y1) * 0.5 + 14, x1, y1);
        ctx.stroke();
    });

    const shades = ['#253e1e', '#2f4c24', '#395a2b', '#436932', '#4f753a', '#598241', '#658c47', '#71964f'];
    for (let i = 0; i < 110; i++) {
        const ang = i * 2.39996;
        const rad = 28 + Math.sqrt(i / 110) * 172;
        const lx = 256 + Math.cos(ang) * rad;
        const ly = 250 + Math.sin(ang) * rad * 0.88;
        const lLen = 26 + (i % 5) * 5.5;
        const lWid = lLen * 0.48;
        ctx.save();
        ctx.translate(lx, ly);
        ctx.rotate(ang + ((i % 7) - 3) * 0.28);
        const shadeIdx = Math.min(shades.length - 1, Math.floor(((rad / 200) * 0.65 + (1 - ly / 512) * 0.35) * shades.length));
        ctx.fillStyle = shades[Math.max(0, shadeIdx)];
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.bezierCurveTo(lWid, lLen * 0.3, lWid * 0.7, lLen * 0.82, 0, lLen);
        ctx.bezierCurveTo(-lWid * 0.7, lLen * 0.82, -lWid, lLen * 0.3, 0, 0);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = 'rgba(180, 212, 130, 0.28)';
        ctx.lineWidth = 1.4;
        ctx.beginPath(); ctx.moveTo(0, 3); ctx.lineTo(0, lLen * 0.82); ctx.stroke();
        ctx.restore();
    }

    const tex = new THREE.CanvasTexture(c);
    tex.anisotropy = 4;
    if ('colorSpace' in tex && THREE.SRGBColorSpace) tex.colorSpace = THREE.SRGBColorSpace;
    _foliageCardTex = tex;
    return tex;
}

function paintDynamicBillboard(canvas, tex, topTag, mainText, accentHex) {
    if (!canvas || !tex) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const W = canvas.width, H = canvas.height;
    ctx.fillStyle = '#07090f';
    ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = accentHex;
    ctx.lineWidth = 6;
    ctx.strokeRect(5, 5, W - 10, H - 10);
    ctx.fillStyle = accentHex;
    ctx.font = 'bold 20px ui-monospace, Menlo, monospace';
    ctx.textAlign = 'center';
    ctx.fillText(topTag, W / 2, 38);
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 38px Outfit, sans-serif';
    ctx.fillText(String(mainText || '').toUpperCase().slice(0, 22), W / 2, 92);
    tex.needsUpdate = true;
}

export function refreshCityDynamicSigns() {
    if (!_cityBuilt) return;
    const st = (typeof globalThis.state === 'object' && globalThis.state) ? globalThis.state : {};
    const labelName = (st.labelName && String(st.labelName).trim()) ? st.labelName : '42E RECORDS';
    const rivalName = (st.rivalState && st.rivalState.name) ? st.rivalState.name : 'KROWN // 808';
    paintDynamicBillboard(_labelSignCanvas, _labelSignTex, 'LABEL HQ · TOUR BRETAGNE', labelName, '#fbbf24');
    paintDynamicBillboard(_rivalSignCanvas, _rivalSignTex, 'CLASH RIVAL · QUAI DE LA FOSSE', rivalName, '#fb7185');
    if (typeof window._refreshCityBillboards === 'function') {
        window._refreshCityBillboards();
    }
}

function buildMntTerrainMesh(root) {
    if (!_manifest || !_manifest.mnt) return;
    const { n, heightsDm } = _manifest.mnt;
    const geo = new THREE.PlaneGeometry(2800, 2800, n - 1, n - 1);
    geo.rotateX(-Math.PI / 2);

    const pos = geo.attributes.position;
    const colors = new Float32Array(pos.count * 3);
    const lowCol = new THREE.Color('#787e88');
    const midCol = new THREE.Color('#8c919b');
    const highCol = new THREE.Color('#9da1aa');

    for (let i = 0; i < pos.count; i++) {
        const vx = pos.getX(i);
        const vz = pos.getZ(i);
        const ix = Math.max(0, Math.min(n - 1, Math.round((vx + 1400) / 50)));
        const iz = Math.max(0, Math.min(n - 1, Math.round((vz + 1400) / 50)));
        let h = (heightsDm[iz * n + ix] * 0.1) - 0.08;
        const nearWater = isRawWaterBit(vx, vz) || (h < 0.25 && (
            isRawWaterBit(vx + 10, vz) || isRawWaterBit(vx - 10, vz) ||
            isRawWaterBit(vx, vz + 10) || isRawWaterBit(vx, vz - 10)
        ));
        if (nearWater) h = Math.min(h, -1.4);
        pos.setY(i, h);

        const c = h < 1.2 ? lowCol : (h < 6.0 ? midCol : highCol);
        colors[i * 3] = c.r;
        colors[i * 3 + 1] = c.g;
        colors[i * 3 + 2] = c.b;
    }
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geo.computeVertexNormals();

    const cobble = getCobblestoneTextures();
    const terrainMesh = new THREE.Mesh(
        geo,
        new THREE.MeshStandardMaterial({
            map: cobble.map,
            bumpMap: cobble.bumpMap,
            bumpScale: 0.08,
            vertexColors: true,
            roughness: 0.90,
            metalness: 0.05
        })
    );
    terrainMesh.receiveShadow = true;
    root.add(terrainMesh);

    // Seamless outer horizon skirt blending map perimeter smoothly into distance fog
    const skirtGeo = new THREE.RingGeometry(1385, 2700, 48);
    skirtGeo.rotateX(-Math.PI / 2);
    const horizonSkirt = new THREE.Mesh(
        skirtGeo,
        new THREE.MeshStandardMaterial({ color: '#1b2432', roughness: 0.96, metalness: 0.02 })
    );
    horizonSkirt.position.y = -0.35;
    root.add(horizonSkirt);

    // Subtle Ligne Verte du Voyage a Nantes trail linking Tour LU -> Chateau -> Bouffay -> Tour Bretagne -> Stereolux
    const greenTrailWgs = [
        [-1.5458, 47.2156], [-1.5496, 47.2162], [-1.5535, 47.2148],
        [-1.5582, 47.2144], [-1.5581, 47.2173], [-1.5636, 47.2094], [-1.5634, 47.2054]
    ];
    const greenMat = new THREE.MeshBasicMaterial({ color: '#10b981', transparent: true, opacity: 0.72, side: THREE.DoubleSide });
    for (let i = 0; i < greenTrailWgs.length - 1; i++) {
        const a = wgs84ToLocal(greenTrailWgs[i][0], greenTrailWgs[i][1]);
        const b = wgs84ToLocal(greenTrailWgs[i + 1][0], greenTrailWgs[i + 1][1]);
        const segLen = Math.hypot(b.x - a.x, b.z - a.z);
        const mx = (a.x + b.x) * 0.5;
        const mz = (a.z + b.z) * 0.5;
        const gy = getCityGroundHeight(mx, mz) + 0.14;
        const strip = new THREE.Mesh(new THREE.PlaneGeometry(0.45, segLen), greenMat);
        strip.rotation.order = 'YXZ';
        strip.rotation.x = -Math.PI / 2;
        strip.rotation.z = -Math.atan2(b.x - a.x, b.z - a.z);
        strip.position.set(mx, gy, mz);
        root.add(strip);
    }
}

function buildOsmPropsInstances(root) {
    if (!_manifest || !_manifest.props) return;
    const {
        trees = [],
        lamps = [],
        tramStops = [],
        tramCatenary = [],
        benches = [],
        bicloo = [],
        morris = [],
        plazas = []
    } = _manifest.props;

    const dummy = new THREE.Object3D();
    const darkIronMat = new THREE.MeshStandardMaterial({ color: '#1e293b', metalness: 0.78, roughness: 0.35 });
    const woodMat = new THREE.MeshStandardMaterial({ color: '#855836', roughness: 0.75 });

    // 1. Real Nantes Metropole Trees -> Botanical Leaf-Card InstancedMesh (across EVERY tile)
    if (trees.length > 0) {
        const barkPair = getBarkTextures();
        const barkMat = new THREE.MeshStandardMaterial({
            map: barkPair.map,
            bumpMap: barkPair.bumpMap,
            bumpScale: 0.12,
            roughness: 0.94,
            metalness: 0.0
        });
        const grateInst = new THREE.InstancedMesh(new THREE.BoxGeometry(1.7, 0.05, 1.7), darkIronMat, trees.length);
        const trunkInst = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.14, 0.27, 3.0, 7), barkMat, trees.length);

        const limbGeo = new THREE.CylinderGeometry(0.05, 0.12, 1.95, 5);
        limbGeo.translate(0, 0.98, 0);
        const limbInst = new THREE.InstancedMesh(limbGeo, barkMat, trees.length * 4);

        const cardsPerTree = 12;
        const leafMat = new THREE.MeshStandardMaterial({
            map: createFoliageCardTexture(),
            alphaTest: 0.42,
            side: THREE.DoubleSide,
            roughness: 0.86,
            metalness: 0.0,
            color: '#ffffff'
        });
        const leafInst = new THREE.InstancedMesh(new THREE.PlaneGeometry(1.9, 1.9), leafMat, trees.length * cardsPerTree);
        const limbDummy = new THREE.Object3D(); limbDummy.rotation.order = 'YXZ';
        const cardDummy = new THREE.Object3D(); cardDummy.rotation.order = 'YXZ';
        const innerShade = new THREE.Color('#7f8f77');
        const midShade = new THREE.Color('#c2cfb8');
        const sunShade = new THREE.Color('#f4f9ee');

        trees.forEach(([tx, tz], i) => {
            const gy = sampleNantesMnt(tx, tz) + 0.05;
            const sc = 0.88 + ((i * 37) % 10) * 0.025;
            const yaw = i * 1.15;

            dummy.rotation.set(0, 0, 0);
            dummy.scale.set(1, 1, 1);
            dummy.position.set(tx, gy + 0.02, tz); dummy.updateMatrix(); grateInst.setMatrixAt(i, dummy.matrix);

            dummy.position.set(tx, gy + 1.5 * sc, tz);
            dummy.rotation.set(0, yaw, 0);
            dummy.scale.set(sc, sc, sc);
            dummy.updateMatrix();
            trunkInst.setMatrixAt(i, dummy.matrix);

            for (let b = 0; b < 4; b++) {
                limbDummy.position.set(tx, gy + 2.35 * sc, tz);
                limbDummy.rotation.set(0.64 + (b % 2) * 0.12, yaw + b * Math.PI * 0.5, 0);
                limbDummy.scale.set(sc, sc, sc);
                limbDummy.updateMatrix();
                limbInst.setMatrixAt(i * 4 + b, limbDummy.matrix);
            }

            for (let cIdx = 0; cIdx < cardsPerTree; cIdx++) {
                const isInner = cIdx < 4;
                const ang = yaw + cIdx * 2.39996;
                const layerT = cIdx / (cardsPerTree - 1);
                const r = (isInner ? 0.42 : (0.75 + (cIdx % 4) * 0.28)) * sc;
                const hOff = (3.1 + layerT * 2.3) * sc;
                cardDummy.position.set(tx + Math.cos(ang) * r, gy + hOff, tz + Math.sin(ang) * r);
                cardDummy.rotation.set(0.45 + ((cIdx * 17) % 8) * 0.09, ang + (cIdx % 2 ? 0 : Math.PI * 0.48), ((cIdx * 19) % 7) * 0.12 - 0.35);
                const cs = (0.85 + ((cIdx + i) % 4) * 0.15) * sc;
                cardDummy.scale.set(cs, cs, cs);
                cardDummy.updateMatrix();
                const outIdx = i * cardsPerTree + cIdx;
                leafInst.setMatrixAt(outIdx, cardDummy.matrix);
                leafInst.setColorAt(outIdx, isInner ? innerShade : (layerT > 0.6 ? sunShade : midShade));
            }
        });
        [grateInst, trunkInst, limbInst, leafInst].forEach(inst => {
            inst.instanceMatrix.needsUpdate = true;
            if (inst.instanceColor) inst.instanceColor.needsUpdate = true;
            root.add(inst);
        });
    }

    // 2. Real Nantes Streetlamps with Gooseneck Arms, Additive Light Cones & Warm Ground Halos
    if (lamps.length > 0) {
        const poleInst = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.08, 0.13, 5.4, 6), darkIronMat, lamps.length);
        const armInst = new THREE.InstancedMesh(new THREE.BoxGeometry(0.11, 0.11, 1.3), darkIronMat, lamps.length);
        const bulbInst = new THREE.InstancedMesh(new THREE.BoxGeometry(0.44, 0.12, 0.56), new THREE.MeshBasicMaterial({ color: '#fef08a' }), lamps.length);

        _lampConeMat = new THREE.MeshBasicMaterial({
            color: '#ffcf7d',
            transparent: true,
            opacity: 0.09,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            side: THREE.DoubleSide
        });
        const coneInst = new THREE.InstancedMesh(new THREE.ConeGeometry(2.6, 5.2, 8, 1, true), _lampConeMat, lamps.length);

        const haloC = document.createElement('canvas');
        haloC.width = 128; haloC.height = 128;
        const hCtx = haloC.getContext('2d');
        const hGrad = hCtx.createRadialGradient(64, 64, 4, 64, 64, 62);
        hGrad.addColorStop(0, 'rgba(255, 196, 105, 0.95)');
        hGrad.addColorStop(0.45, 'rgba(255, 170, 70, 0.35)');
        hGrad.addColorStop(1, 'rgba(255, 140, 40, 0)');
        hCtx.fillStyle = hGrad;
        hCtx.fillRect(0, 0, 128, 128);
        const haloTex = new THREE.CanvasTexture(haloC);
        if ('colorSpace' in haloTex && THREE.SRGBColorSpace) haloTex.colorSpace = THREE.SRGBColorSpace;

        _lampHaloMat = new THREE.MeshBasicMaterial({
            map: haloTex,
            color: '#ffffff',
            transparent: true,
            opacity: 0.44,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        const haloInst = new THREE.InstancedMesh(new THREE.CircleGeometry(4.2, 14), _lampHaloMat, lamps.length);

        lamps.forEach(([lx, lz], i) => {
            const gy = sampleNantesMnt(lx, lz) + 0.08;
            const yaw = (i * 0.9) % (Math.PI * 2);
            const dx = Math.sin(yaw), dz = Math.cos(yaw);
            dummy.rotation.set(0, yaw, 0);
            dummy.scale.set(1, 1, 1);

            dummy.position.set(lx, gy + 2.7, lz); dummy.updateMatrix(); poleInst.setMatrixAt(i, dummy.matrix);
            dummy.position.set(lx + dx * 0.55, gy + 5.38, lz + dz * 0.55); dummy.updateMatrix(); armInst.setMatrixAt(i, dummy.matrix);
            dummy.position.set(lx + dx * 1.12, gy + 5.30, lz + dz * 1.12); dummy.updateMatrix(); bulbInst.setMatrixAt(i, dummy.matrix);
            dummy.position.set(lx + dx * 1.12, gy + 2.7, lz + dz * 1.12); dummy.updateMatrix(); coneInst.setMatrixAt(i, dummy.matrix);

            dummy.position.set(lx + dx * 1.12, gy + 0.12, lz + dz * 1.12);
            dummy.rotation.set(-Math.PI / 2, 0, 0);
            dummy.updateMatrix();
            haloInst.setMatrixAt(i, dummy.matrix);
        });
        [poleInst, armInst, bulbInst, coneInst, haloInst].forEach(inst => {
            inst.instanceMatrix.needsUpdate = true;
            root.add(inst);
        });

        // 6 Pooled real THREE.PointLights dynamically tracking the 6 closest streetlamps
        _streetPointLights.length = 0;
        for (let k = 0; k < 6; k++) {
            const pl = new THREE.PointLight('#ffbd6b', 0, 44, 1.45);
            root.add(pl);
            _streetPointLights.push(pl);
        }
    }

    // 3. Stations Tramway TAN (Naolib Raised Parallel Platforms + Glass Shelter + Bench + Emerald Fascia + Route Totem)
    if (tramStops.length > 0) {
        const glassMat = new THREE.MeshStandardMaterial({ color: '#93c5fd', transparent: true, opacity: 0.35, roughness: 0.08, metalness: 0.65 });
        const tanGreenMat = new THREE.MeshBasicMaterial({ color: '#10b981' });
        const platformMat = new THREE.MeshStandardMaterial({ color: '#8b93a0', roughness: 0.80 });
        const tactileMat = new THREE.MeshBasicMaterial({ color: '#facc15' });
        const displayMat = new THREE.MeshBasicMaterial({ color: '#fde047' });
        tramStops.forEach(([sx, sz, facingYaw]) => {
            const gy = sampleNantesMnt(sx, sz) + 0.08;
            const st = new THREE.Group();
            st.position.set(sx, gy, sz);
            st.rotation.y = facingYaw;
            // 11.5m raised granite boarding platform parallel to tracks (local +Z faces inward toward steel rails)
            const plat = new THREE.Mesh(new THREE.BoxGeometry(11.5, 0.32, 2.4), platformMat); plat.position.set(0, 0.16, 0);
            const tactile = new THREE.Mesh(new THREE.BoxGeometry(11.5, 0.04, 0.18), tactileMat); tactile.position.set(0, 0.33, 1.06);
            const roof = new THREE.Mesh(new THREE.BoxGeometry(6.4, 0.14, 1.9), darkIronMat); roof.position.set(-0.4, 2.78, -0.15);
            const tanStrip = new THREE.Mesh(new THREE.BoxGeometry(6.44, 0.18, 0.12), tanGreenMat); tanStrip.position.set(-0.4, 2.78, 0.80);
            const back = new THREE.Mesh(new THREE.BoxGeometry(6.0, 2.3, 0.06), glassMat); back.position.set(-0.4, 1.44, -0.92);
            const pL = new THREE.Mesh(new THREE.BoxGeometry(0.12, 2.5, 0.12), darkIronMat); pL.position.set(-3.45, 1.44, -0.92);
            const pR = new THREE.Mesh(new THREE.BoxGeometry(0.12, 2.5, 0.12), darkIronMat); pR.position.set(2.65, 1.44, -0.92);
            const seat = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.09, 0.45), woodMat); seat.position.set(-0.4, 0.78, -0.52);
            const totem = new THREE.Mesh(new THREE.BoxGeometry(0.46, 3.0, 0.24), darkIronMat); totem.position.set(4.1, 1.66, 0.25);
            const totemTop = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.56, 0.26), tanGreenMat); totemTop.position.set(4.1, 2.90, 0.25);
            const totemDisp = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.24, 0.27), displayMat); totemDisp.position.set(4.1, 2.32, 0.25);
            st.add(plat, tactile, roof, tanStrip, back, pL, pR, seat, totem, totemTop, totemDisp);
            root.add(st);
        });
    }

    // 3b. Tramway Overhead Catenary Masts & Contact Wires (LAC)
    if (tramCatenary.length > 0) {
        const mastInst = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.08, 0.13, 5.7, 6), darkIronMat, tramCatenary.length);
        const armInst = new THREE.InstancedMesh(new THREE.BoxGeometry(3.8, 0.09, 0.09), darkIronMat, tramCatenary.length);
        tramCatenary.forEach(([cx, cz, yaw, isDbl], i) => {
            const gy = sampleNantesMnt(cx, cz) + 0.08;
            const armLen = isDbl ? 1.45 : 0.72;
            dummy.scale.set(1, 1, 1);
            dummy.rotation.set(0, yaw, 0);
            dummy.position.set(cx, gy + 2.85, cz);
            dummy.updateMatrix();
            mastInst.setMatrixAt(i, dummy.matrix);

            // Cantilever arm extending inward over the tramway tracks (-local X)
            const inwardX = -Math.cos(yaw) * (isDbl ? 2.75 : 1.35);
            const inwardZ = Math.sin(yaw) * (isDbl ? 2.75 : 1.35);
            dummy.scale.set(armLen, 1, 1);
            dummy.position.set(cx + inwardX, gy + 5.25, cz + inwardZ);
            dummy.updateMatrix();
            armInst.setMatrixAt(i, dummy.matrix);
        });
        [mastInst, armInst].forEach(inst => {
            inst.instanceMatrix.needsUpdate = true;
            root.add(inst);
        });
    }
    if (Array.isArray(_manifest.tramRoutes) && _manifest.tramRoutes.length > 0) {
        const wirePos = [];
        for (const line of _manifest.tramRoutes) {
            if (!line || line.length < 2) continue;
            for (let i = 0; i < line.length - 1; i++) {
                const a = line[i], b = line[i + 1];
                const dx = b[0] - a[0], dz = b[1] - a[1];
                const len = Math.hypot(dx, dz);
                if (len < 0.5) continue;
                const nx = -dz / len, nz = dx / len;
                const yA = getCityGroundHeight(a[0], a[1]) + 5.15;
                const yB = getCityGroundHeight(b[0], b[1]) + 5.15;
                [-1.65, 1.65].forEach(lat => {
                    wirePos.push(a[0] + nx * lat, yA, a[1] + nz * lat, b[0] + nx * lat, yB, b[1] + nz * lat);
                });
            }
        }
        if (wirePos.length > 0) {
            const wireGeo = new THREE.BufferGeometry();
            wireGeo.setAttribute('position', new THREE.Float32BufferAttribute(wirePos, 3));
            const wireLines = new THREE.LineSegments(
                wireGeo,
                new THREE.LineBasicMaterial({ color: '#475569', transparent: true, opacity: 0.72 })
            );
            root.add(wireLines);
        }
    }

    // 4. Benches across all Nantes Neighborhoods (150 wooden slat benches)
    if (benches.length > 0) {
        const seatInst = new THREE.InstancedMesh(new THREE.BoxGeometry(2.0, 0.08, 0.56), woodMat, benches.length);
        const backInst = new THREE.InstancedMesh(new THREE.BoxGeometry(2.0, 0.42, 0.08), woodMat, benches.length);
        const legInst = new THREE.InstancedMesh(new THREE.BoxGeometry(1.75, 0.44, 0.52), darkIronMat, benches.length);
        benches.forEach(([bx, bz, rot], i) => {
            const gy = sampleNantesMnt(bx, bz) + 0.08;
            dummy.scale.set(1, 1, 1);
            dummy.rotation.set(0, rot, 0);
            dummy.position.set(bx, gy + 0.46, bz); dummy.updateMatrix(); seatInst.setMatrixAt(i, dummy.matrix);
            dummy.position.set(bx - Math.sin(rot) * 0.24, gy + 0.72, bz - Math.cos(rot) * 0.24); dummy.updateMatrix(); backInst.setMatrixAt(i, dummy.matrix);
            dummy.position.set(bx, gy + 0.22, bz); dummy.updateMatrix(); legInst.setMatrixAt(i, dummy.matrix);
        });
        [seatInst, backInst, legInst].forEach(inst => {
            inst.instanceMatrix.needsUpdate = true;
            root.add(inst);
        });
    }

    // 5. Stations Bicloo (Nantes red/white bike-share racks)
    if (bicloo.length > 0) {
        const railInst = new THREE.InstancedMesh(new THREE.BoxGeometry(5.6, 0.14, 0.22), new THREE.MeshStandardMaterial({ color: '#94a3b8', metalness: 0.8 }), bicloo.length);
        const pylonInst = new THREE.InstancedMesh(new THREE.BoxGeometry(0.45, 2.2, 0.45), new THREE.MeshStandardMaterial({ color: '#e11d48', roughness: 0.4 }), bicloo.length);
        const bikeInst = new THREE.InstancedMesh(new THREE.BoxGeometry(0.32, 0.78, 1.45), new THREE.MeshStandardMaterial({ color: '#f43f5e', roughness: 0.35, metalness: 0.3 }), bicloo.length * 4);
        bicloo.forEach(([bx, bz, rot], i) => {
            const gy = sampleNantesMnt(bx, bz) + 0.08;
            const dx = Math.cos(rot), dz = -Math.sin(rot);
            dummy.scale.set(1, 1, 1);
            dummy.rotation.set(0, rot, 0);
            dummy.position.set(bx, gy + 0.08, bz); dummy.updateMatrix(); railInst.setMatrixAt(i, dummy.matrix);
            dummy.position.set(bx - dx * 3.1, gy + 1.1, bz - dz * 3.1); dummy.updateMatrix(); pylonInst.setMatrixAt(i, dummy.matrix);
            [-1.8, -0.6, 0.6, 1.8].forEach((lat, bi) => {
                dummy.position.set(bx + dx * lat, gy + 0.45, bz + dz * lat);
                dummy.updateMatrix();
                bikeInst.setMatrixAt(i * 4 + bi, dummy.matrix);
            });
        });
        [railInst, pylonInst, bikeInst].forEach(inst => {
            inst.instanceMatrix.needsUpdate = true;
            root.add(inst);
        });
    }

    // 6. Colonnes Morris (illuminated cultural concert poster columns)
    if (morris.length > 0) {
        const morrisGreen = new THREE.MeshStandardMaterial({ color: '#064e3b', roughness: 0.45, metalness: 0.3 });
        _morrisPosterMat = new THREE.MeshStandardMaterial({ color: '#fde68a', emissive: '#f59e0b', emissiveIntensity: 0.35, roughness: 0.4 });
        const bodyInst = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.58, 0.62, 1.3, 12), morrisGreen, morris.length);
        const posterInst = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.56, 0.56, 2.2, 12), _morrisPosterMat, morris.length);
        const domeInst = new THREE.InstancedMesh(new THREE.ConeGeometry(0.74, 0.95, 12), morrisGreen, morris.length);
        morris.forEach(([mx, mz], i) => {
            const gy = sampleNantesMnt(mx, mz) + 0.08;
            dummy.scale.set(1, 1, 1);
            dummy.rotation.set(0, 0, 0);
            dummy.position.set(mx, gy + 0.65, mz); dummy.updateMatrix(); bodyInst.setMatrixAt(i, dummy.matrix);
            dummy.position.set(mx, gy + 2.35, mz); dummy.updateMatrix(); posterInst.setMatrixAt(i, dummy.matrix);
            dummy.position.set(mx, gy + 3.9, mz); dummy.updateMatrix(); domeInst.setMatrixAt(i, dummy.matrix);
        });
        [bodyInst, posterInst, domeInst].forEach(inst => {
            inst.instanceMatrix.needsUpdate = true;
            root.add(inst);
        });
    }

    // 7. Nantes Terrasses de Cafés (Bouffay & Plazas)
    const cafeSpot = plazas.slice(0, 18);
    if (cafeSpot.length > 0) {
        const marbleMat = new THREE.MeshStandardMaterial({ color: '#f1f5f9', roughness: 0.25 });
        const tGeo = new THREE.CylinderGeometry(0.45, 0.45, 0.05, 12);
        const pGeo = new THREE.CylinderGeometry(0.05, 0.16, 0.72, 8);
        cafeSpot.forEach(([px, pz]) => {
            const gy = sampleNantesMnt(px, pz) + 0.08;
            [[1.2, 1.2], [-1.2, 1.2]].forEach(([ox, oz]) => {
                const top = new THREE.Mesh(tGeo, marbleMat); top.position.set(px + ox, gy + 0.74, pz + oz);
                const ped = new THREE.Mesh(pGeo, darkIronMat); ped.position.set(px + ox, gy + 0.36, pz + oz);
                root.add(top, ped);
            });
        });
    }
}

function buildLandmarkSignages(root) {
    _beacons.length = 0;
    const mats = getMaterialLibrary();

    NANTES_LANDMARK_SPECS.forEach((spec, idx) => {
        const { x, z } = spec.pos;
        const gy = getCityGroundHeight(x, z);
        const lm = _landmarks[idx];
        lm.y = gy;

        const ring = new THREE.Mesh(
            new THREE.RingGeometry(2.6, 3.5, 32),
            new THREE.MeshBasicMaterial({ color: spec.accentHex, side: THREE.DoubleSide, transparent: true, opacity: 0.9 })
        );
        ring.rotation.x = -Math.PI / 2;
        ring.position.set(x, gy + 0.12, z);
        root.add(ring);

        const beam = new THREE.Mesh(
            new THREE.CylinderGeometry(0.18, 0.48, 22, 10, 1, true),
            new THREE.MeshBasicMaterial({ color: spec.accentHex, transparent: true, opacity: 0.24, side: THREE.DoubleSide, depthWrite: false })
        );
        beam.position.set(x, gy + 11.0, z);
        root.add(beam);
        _beacons.push({ ring, beam });

        if (spec.billboardKind) {
            const c = document.createElement('canvas'); c.width = 512; c.height = 128;
            const tex = new THREE.CanvasTexture(c);
            if ('colorSpace' in tex && THREE.SRGBColorSpace) tex.colorSpace = THREE.SRGBColorSpace;
            paintDynamicBillboard(c, tex, spec.billboardTag, spec.title, spec.accentHex);

            if (spec.billboardKind === 'label') {
                _labelSignCanvas = c;
                _labelSignTex = tex;
                const mesh = new THREE.Mesh(new THREE.PlaneGeometry(18, 4.5), new THREE.MeshBasicMaterial({ map: tex, side: THREE.DoubleSide }));
                const tbPos = wgs84ToLocal(-1.5581, 47.2176);
                mesh.position.set(tbPos.x, gy + 24, tbPos.z + 15.2);
                _labelSignMesh = mesh;
                root.add(mesh);
            } else if (spec.billboardKind === 'rival') {
                _rivalSignCanvas = c;
                _rivalSignTex = tex;
                const mesh = new THREE.Mesh(new THREE.PlaneGeometry(11, 2.75), new THREE.MeshBasicMaterial({ map: tex, side: THREE.DoubleSide }));
                mesh.position.set(x + 6, gy + 12, z - 6);
                mesh.rotation.y = Math.PI * 0.15;
                _rivalSignMesh = mesh;
                root.add(mesh);
            }
        }
    });

    void mats;
}

function applyLoadedTileLods(rec) {
    const targetNow = rec.desiredLod || rec.activeLod;
    if (rec.meshes.lod0) rec.meshes.lod0.visible = (targetNow === 'lod0');
    if (rec.meshes.lod1) rec.meshes.lod1.visible = (targetNow === 'lod1');
    rec.activeLod = (targetNow && rec.meshes[targetNow]) ? targetNow : rec.activeLod;
}

function pumpTileLoadQueue() {
    if (!_loader || !_tileContainer) return;
    while (_inFlightLoads < MAX_CONCURRENT_TILE_LOADS && _tileLoadQueue.length > 0) {
        _tileLoadQueue.sort((a, b) => a.prio - b.prio);
        const job = _tileLoadQueue.shift();
        const { rec, wantLod } = job;
        rec.queuedLod = null;

        if (rec.desiredLod !== wantLod || rec.loading || rec.meshes[wantLod]) {
            if (rec.desiredLod && rec.meshes[rec.desiredLod]) applyLoadedTileLods(rec);
            continue;
        }

        const file = wantLod === 'lod0' ? rec.meta.lod0 : rec.meta.lod1;
        if (!file) continue;

        rec.loading = true;
        _inFlightLoads++;
        const matLib = getMaterialLibrary();
        const loadAttempt = (attempt) => {
            _loader.load(
                `./assets/nantes/tiles/${file}`,
                (gltf) => {
                    _inFlightLoads = Math.max(0, _inFlightLoads - 1);
                    rec.loading = false;
                    const grp = gltf.scene;
                    grp.traverse(obj => {
                        if (obj.isMesh) {
                            const name = obj.material && obj.material.name;
                            if (name && matLib[name]) obj.material = matLib[name];
                            obj.receiveShadow = true;
                        }
                    });
                    rec.meshes[wantLod] = grp;
                    _tileContainer.add(grp);
                    applyLoadedTileLods(rec);
                    pumpTileLoadQueue();
                },
                undefined,
                (err) => {
                    if (attempt < 2) {
                        setTimeout(() => loadAttempt(attempt + 1), 350);
                        return;
                    }
                    _inFlightLoads = Math.max(0, _inFlightLoads - 1);
                    rec.loading = false;
                    console.warn(`[Nantes] Failed loading tile ${file}:`, err);
                    pumpTileLoadQueue();
                }
            );
        };
        loadAttempt(0);
    }
}

function requestTileLod(rec, wantLod, distSq) {
    if (rec.meshes[wantLod]) {
        applyLoadedTileLods(rec);
        return;
    }
    if (rec.loading || rec.queuedLod === wantLod) return;

    rec.queuedLod = wantLod;
    const prio = (wantLod === 'lod0' ? 0 : 1000) + distSq;
    const existing = _tileLoadQueue.find(j => j.rec === rec);
    if (existing) {
        existing.wantLod = wantLod;
        existing.prio = prio;
    } else {
        _tileLoadQueue.push({ rec, wantLod, prio });
    }
    pumpTileLoadQueue();
}

function updateStreamingTiles(playerX, playerZ) {
    if (!_manifest || !_manifest.tiles) return;
    const tileSize = _manifest.tileSize || 400;
    const grid = _manifest.grid || 7;
    const half = 1400;
    const ptx = Math.max(0, Math.min(grid - 1, Math.floor((playerX + half) / tileSize)));
    const ptz = Math.max(0, Math.min(grid - 1, Math.floor((playerZ + half) / tileSize)));
    const pKey = `${ptx}_${ptz}`;

    const needRebuildCols = (pKey !== _lastPlayerTileKey);
    if (needRebuildCols) {
        _lastPlayerTileKey = pKey;
        _activeTileColliders = [];
    }

    for (const rec of _tileRecords.values()) {
        const dx = rec.meta.tx - ptx;
        const dz = rec.meta.tz - ptz;
        const cd = Math.max(Math.abs(dx), Math.abs(dz));
        const want = cd <= 1 ? 'lod0' : (cd <= 2 ? 'lod1' : null);
        rec.desiredLod = want;

        if (needRebuildCols && cd <= 1 && Array.isArray(rec.meta.colliders)) {
            for (let i = 0; i < rec.meta.colliders.length; i++) {
                _activeTileColliders.push(rec.meta.colliders[i]);
            }
        }

        if (want === null) {
            if (rec.meshes.lod0) rec.meshes.lod0.visible = false;
            if (rec.meshes.lod1) rec.meshes.lod1.visible = false;
            rec.activeLod = null;
        } else if (rec.activeLod !== want) {
            requestTileLod(rec, want, dx * dx + dz * dz);
        }
    }
}

function updateNearestStreetPointLights(playerPos, isNight, isGolden) {
    if (_streetPointLights.length === 0 || !_manifest || !_manifest.props || !playerPos) return;
    const intensity = isNight ? 62 : (isGolden ? 28 : 0);
    if (intensity <= 0) {
        for (let k = 0; k < _streetPointLights.length; k++) _streetPointLights[k].intensity = 0;
        return;
    }

    const lamps = _manifest.props.lamps || [];
    const closest = [];
    for (let i = 0; i < lamps.length; i++) {
        const lx = lamps[i][0];
        const lz = lamps[i][1];
        const d2 = (lx - playerPos.x) * (lx - playerPos.x) + (lz - playerPos.z) * (lz - playerPos.z);
        if (d2 > 6400) continue; // > 80m radius ignore
        closest.push({ lx, lz, d2 });
    }
    closest.sort((a, b) => a.d2 - b.d2);

    for (let k = 0; k < _streetPointLights.length; k++) {
        const pl = _streetPointLights[k];
        if (k < closest.length) {
            const { lx, lz } = closest[k];
            const gy = sampleNantesMnt(lx, lz);
            pl.position.set(lx, gy + 5.2, lz);
            pl.intensity = intensity;
        } else {
            pl.intensity = 0;
        }
    }
}

export function buildCityWorld(scene) {
    if (_cityBuilt && _cityRoot) return _cityRoot;

    const root = new THREE.Group();
    root.name = 'NantesCityWorld';
    root.visible = false;

    _tileContainer = new THREE.Group();
    _tileContainer.name = 'NantesStreamingTiles';
    root.add(_tileContainer);

    _monumentGroup = new THREE.Group();
    _monumentGroup.name = 'NantesMonuments';
    root.add(_monumentGroup);

    _loader = new GLTFLoader();
    if (MeshoptDecoder) {
        _loader.setMeshoptDecoder(MeshoptDecoder);
    }

    getMaterialLibrary();
    buildLandmarkSignages(root);

    scene.add(root);
    _cityRoot = root;
    _cityBuilt = true;
    refreshCityDynamicSigns();

    fetch('./assets/nantes/nantes_manifest.json')
        .then(r => r.json())
        .then(manifest => {
            _manifest = manifest;
            decodeWaterMask(manifest.waterMask);
            _manifestLoaded = true;
            buildMntTerrainMesh(root);
            buildNantesMonuments(_monumentGroup, (x, z) => sampleNantesMnt(x, z));
            buildOsmPropsInstances(root);

            _tileRecords.clear();
            for (const tm of (manifest.tiles || [])) {
                _tileRecords.set(`${tm.tx}_${tm.tz}`, {
                    meta: tm,
                    desiredLod: null,
                    activeLod: null,
                    queuedLod: null,
                    loading: false,
                    meshes: { lod0: null, lod1: null }
                });
            }

            _beacons.forEach((b, i) => {
                const lm = _landmarks[i];
                const gy = getCityGroundHeight(lm.tx, lm.tz);
                lm.y = gy;
                b.ring.position.y = gy + 0.12;
                b.beam.position.y = gy + 11.0;
            });
            if (_labelSignMesh) _labelSignMesh.position.y = sampleNantesMnt(_labelSignMesh.position.x, _labelSignMesh.position.z) + 24;
            if (_rivalSignMesh) _rivalSignMesh.position.y = sampleNantesMnt(_rivalSignMesh.position.x, _rivalSignMesh.position.z) + 12;

            const pose = (typeof window._getCityPose === 'function') ? window._getCityPose() : { x: -20.3, z: -512.0 };
            updateStreamingTiles(pose.x, pose.z);
            if (typeof window._onNantesManifestReady === 'function') {
                window._onNantesManifestReady(manifest);
            }
        })
        .catch(err => console.error('[Nantes] Failed loading manifest:', err));

    return _cityRoot;
}

export function getCityColliders() {
    const monCols = getMonumentColliders();
    if (_activeTileColliders.length === 0) return monCols;
    return monCols.concat(_activeTileColliders);
}

export function getCityLandmarks() {
    return _landmarks;
}

export function updateCityEnvironment(tSec, playerPos) {
    const nowMs = performance.now();
    if (!_lastTimeTickAt) _lastTimeTickAt = nowMs;
    if (nowMs - _lastTimeTickAt >= 2400) {
        _lastTimeTickAt = nowMs;
        if (typeof globalThis.state === 'object' && globalThis.state) {
            globalThis.state.timeMins = (Number(globalThis.state.timeMins) || 480) + 1;
            if (globalThis.state.timeMins >= 1440) {
                globalThis.state.timeMins -= 1440;
                if (typeof globalThis.dailyReset === 'function') {
                    try { globalThis.dailyReset(); } catch (e) {}
                }
            }
            if (typeof globalThis.updateHUD === 'function') globalThis.updateHUD();
        }
    }

    const tMins = (typeof globalThis.state === 'object' && globalThis.state && typeof globalThis.state.timeMins === 'number')
        ? globalThis.state.timeMins
        : 1080;
    const hr = ((tMins % 1440) + 1440) % 1440 / 60;
    const isNight = (hr >= 20.5 || hr < 6);
    const isGolden = (hr >= 17 && hr < 20.5) || (hr >= 6 && hr < 8.5);

    if (_manifestLoaded && playerPos) {
        updateStreamingTiles(playerPos.x, playerPos.z);
        updateNearestStreetPointLights(playerPos, isNight, isGolden);
    }
    tickNantesMonuments(tSec, playerPos, isNight, isGolden);

    for (let i = 0; i < _beacons.length; i++) {
        const b = _beacons[i];
        const s = 1 + Math.sin(tSec * 3.0 + i) * 0.12;
        b.ring.scale.set(s, s, 1);
        b.beam.material.opacity = 0.18 + Math.sin(tSec * 2.5 + i) * 0.08;
    }

    if (window.skyDomeMesh && playerPos) {
        window.skyDomeMesh.position.set(playerPos.x, 0, playerPos.z);
    }

    const zenHex = isNight ? '#070b18' : (isGolden ? '#2c3563' : '#2e63a8');
    const horHex = isNight ? '#1b2644' : (isGolden ? '#eb956a' : '#b7d7f4');
    const fogHex = isNight ? '#0a0f1f' : (isGolden ? '#3f3246' : '#89acd1');

    if (window.exteriorSkyUniforms) {
        const u = window.exteriorSkyUniforms;
        u.uTime.value = tSec;
        u.uZenithColor.value.set(zenHex);
        u.uHorizonColor.value.set(horHex);
        u.uSunColor.value.set(isNight ? '#a5c0ff' : (isGolden ? '#ffbc7d' : '#fff7e6'));
        u.uNight.value = isNight ? 1.0 : (isGolden ? 0.38 : 0.0);
        u.uSunPos.value.y = isNight ? 0.72 : (isGolden ? 0.35 : 0.68);
        u.uStorm.value = 0.0;
    }
    if (globalThis.scene) {
        if (!globalThis.scene.fog) globalThis.scene.fog = new THREE.FogExp2(fogHex, 0.0022);
        globalThis.scene.fog.color.set(fogHex);
        globalThis.scene.fog.density = isNight ? 0.0025 : 0.0017;
    }
    if (globalThis.hemiLight) {
        globalThis.hemiLight.intensity = isNight ? 0.78 : (isGolden ? 1.05 : 1.24);
        globalThis.hemiLight.color.set(isNight ? '#7b94cf' : (isGolden ? '#b5c6e8' : '#dbeafe'));
        globalThis.hemiLight.groundColor.set(isNight ? '#422a1b' : (isGolden ? '#6b452a' : '#5e5b54'));
    }
    if (globalThis.dirLight) {
        globalThis.dirLight.position.set(160, 220, 120);
        globalThis.dirLight.intensity = isNight ? 0.55 : (isGolden ? 1.45 : 1.9);
        globalThis.dirLight.color.set(isNight ? '#9fb9ff' : (isGolden ? '#ffc38a' : '#fff8ec'));
    }
    if (globalThis.ceilingLight) globalThis.ceilingLight.intensity = 0;
    if (globalThis.deskBiasLight) globalThis.deskBiasLight.intensity = 0;
    if (globalThis.windowBounceLight) globalThis.windowBounceLight.intensity = 0;

    const emBoost = isNight ? 0.68 : (isGolden ? 0.34 : 0.05);
    for (let i = 0; i < _bldgEmissiveMats.length; i++) {
        _bldgEmissiveMats[i].emissiveIntensity = emBoost;
    }
    if (_lampHaloMat) {
        _lampHaloMat.opacity = isNight ? 0.44 : (isGolden ? 0.22 : 0.01);
    }
    if (_lampConeMat) {
        _lampConeMat.opacity = isNight ? 0.08 : (isGolden ? 0.04 : 0.0);
    }
    if (_morrisPosterMat) {
        _morrisPosterMat.emissiveIntensity = isNight ? 0.85 : (isGolden ? 0.45 : 0.08);
    }
    if (_waterMat) {
        _waterMat.emissiveIntensity = isNight ? 0.28 : 0.16;
    }
    if (_waterBumpTex) {
        _waterBumpTex.offset.set((tSec * 0.014) % 1, (tSec * 0.008) % 1);
    }
}
