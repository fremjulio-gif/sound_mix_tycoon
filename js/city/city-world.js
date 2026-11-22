import { THREE } from '../core/libs.js';

export const CITY_BOUNDS = Object.freeze({
    minX: -144,
    maxX: 144,
    minZ: -144,
    maxZ: 144
});

export const SIDEWALK_HEIGHT = 0.22;

const _colliders = [];
const _landmarks = [];
const _beacons = [];
const _waterSeeds = [];
const _aviationLights = [];
const _trafficLightSets = [];
const _rotors = [];

let _cityRoot = null;
let _cityBuilt = false;
let _labelSignCanvas = null;
let _labelSignTex = null;
let _rivalSignCanvas = null;
let _rivalSignTex = null;
let _fountainWaterMesh = null;
let _waterDropInst = null;
let _lampHaloMat = null;
let _bldgEmissiveMats = [];
let _lastTimeTickAt = 0;

const _facadeSourceCache = Object.create(null);
let _barkPair = null;
let _foliageCardTex = null;

export function getCityGroundHeight(x, z) {
    const ax = Math.abs(x);
    const az = Math.abs(z);
    if (ax >= 11.6 && ax <= 84.4 && az >= 11.6 && az <= 84.4) return SIDEWALK_HEIGHT;
    if (ax >= 107.6 || az >= 107.6) return SIDEWALK_HEIGHT;
    return 0.0;
}

function addCollider(x, z, hx, hz) {
    _colliders.push({ minX: x - hx, maxX: x + hx, minZ: z - hz, maxZ: z + hz });
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

function createRoadAsphaltTexture() {
    const S = 2048;
    const c = document.createElement('canvas');
    c.width = S;
    c.height = S;
    const ctx = c.getContext('2d');

    ctx.fillStyle = '#151821';
    ctx.fillRect(0, 0, S, S);

    for (let i = 0; i < 42000; i++) {
        const rx = (i * 223 + (i % 17) * 19) % S;
        const ry = (i * 389 + Math.floor(i / 19) * 31) % S;
        ctx.fillStyle = (i % 5 === 0) ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.24)';
        ctx.fillRect(rx, ry, 2, 2);
    }

    const toPx = (w) => ((w + 160) / 320) * S;
    const toSize = (len) => (len / 320) * S;

    ctx.fillStyle = 'rgba(7, 9, 14, 0.42)';
    [-7.8, 7.8].forEach(lane => {
        ctx.fillRect(0, toPx(lane - 1.3), S, toSize(2.6));
        ctx.fillRect(toPx(lane - 1.3), 0, toSize(2.6), S);
    });
    [-96 - 3.2, -96 + 3.2, 96 - 3.2, 96 + 3.2].forEach(ringLane => {
        ctx.fillRect(0, toPx(ringLane - 1.1), S, toSize(2.2));
        ctx.fillRect(toPx(ringLane - 1.1), 0, toSize(2.2), S);
    });

    ctx.strokeStyle = 'rgba(226, 232, 240, 0.52)';
    ctx.lineWidth = 3;
    const drawBlockEdge = (x0, z0, x1, z1) => {
        ctx.strokeRect(toPx(x0), toPx(z0), toPx(x1) - toPx(x0), toPx(z1) - toPx(z0));
    };
    drawBlockEdge(-84.4, -84.4, -11.6, -11.6);
    drawBlockEdge(11.6, -84.4, 84.4, -11.6);
    drawBlockEdge(-84.4, 11.6, -11.6, 84.4);
    drawBlockEdge(11.6, 11.6, 84.4, 84.4);

    ctx.strokeStyle = 'rgba(251, 191, 36, 0.85)';
    ctx.lineWidth = 3;
    const drawDoubleCenter = (x0, y0, x1, y1, horiz) => {
        const off = 2.5;
        ctx.beginPath();
        if (horiz) {
            ctx.moveTo(x0, y0 - off); ctx.lineTo(x1, y1 - off);
            ctx.moveTo(x0, y0 + off); ctx.lineTo(x1, y1 + off);
        } else {
            ctx.moveTo(x0 - off, y0); ctx.lineTo(x1 - off, y1);
            ctx.moveTo(x0 + off, y0); ctx.lineTo(x1 + off, y1);
        }
        ctx.stroke();
    };
    drawDoubleCenter(0, toPx(0), toPx(-13), toPx(0), true);
    drawDoubleCenter(toPx(13), toPx(0), S, toPx(0), true);
    drawDoubleCenter(toPx(0), 0, toPx(0), toPx(-13), false);
    drawDoubleCenter(toPx(0), toPx(13), toPx(0), S, false);

    ctx.strokeStyle = 'rgba(226, 232, 240, 0.42)';
    ctx.lineWidth = 2.2;
    ctx.setLineDash([16, 16]);
    [-4.2, 4.2].forEach(sub => {
        ctx.beginPath();
        ctx.moveTo(0, toPx(sub)); ctx.lineTo(toPx(-18), toPx(sub));
        ctx.moveTo(toPx(18), toPx(sub)); ctx.lineTo(S, toPx(sub));
        ctx.moveTo(toPx(sub), 0); ctx.lineTo(toPx(sub), toPx(-18));
        ctx.moveTo(toPx(sub), toPx(18)); ctx.lineTo(toPx(sub), S);
        ctx.stroke();
    });
    ctx.strokeStyle = 'rgba(251, 191, 36, 0.55)';
    [-96, 96].forEach(cPos => {
        ctx.beginPath();
        ctx.moveTo(0, toPx(cPos)); ctx.lineTo(S, toPx(cPos));
        ctx.moveTo(toPx(cPos), 0); ctx.lineTo(toPx(cPos), S);
        ctx.stroke();
    });

    ctx.strokeStyle = 'rgba(226, 232, 240, 0.55)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(toPx(0), toPx(0), toSize(8.2), 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = 'rgba(241, 245, 249, 0.72)';
    for (let k = -9.6; k <= 9.6; k += 1.6) {
        ctx.fillRect(toPx(-16.6), toPx(k) - 2.5, toSize(3.2), 5);
        ctx.fillRect(toPx(13.4), toPx(k) - 2.5, toSize(3.2), 5);
        ctx.fillRect(toPx(k) - 2.5, toPx(-16.6), 5, toSize(3.2));
        ctx.fillRect(toPx(k) - 2.5, toPx(13.4), 5, toSize(3.2));
    }
    ctx.fillStyle = 'rgba(248, 250, 252, 0.78)';
    ctx.fillRect(toPx(-18.2), toPx(0.8), 4, toSize(10.2));
    ctx.fillRect(toPx(18.0), toPx(-11.0), 4, toSize(10.2));
    ctx.fillRect(toPx(-11.0), toPx(-18.2), toSize(10.2), 4);
    ctx.fillRect(toPx(0.8), toPx(18.0), toSize(10.2), 4);

    [-86.6, 86.6].forEach(ringMark => {
        ctx.fillStyle = 'rgba(226, 232, 240, 0.55)';
        for (let k = -8.5; k <= 8.5; k += 1.8) {
            ctx.fillRect(toPx(ringMark) - toSize(1.2), toPx(k) - 2, toSize(2.4), 4);
            ctx.fillRect(toPx(k) - 2, toPx(ringMark) - toSize(1.2), 4, toSize(2.4));
        }
    });

    ctx.fillStyle = '#0a0c12';
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1.5;
    for (let d = -120; d <= 120; d += 30) {
        if (Math.abs(d) < 20) continue;
        [[d, 10.6], [d, -10.6], [10.6, d], [-10.6, d]].forEach(([mx, mz]) => {
            ctx.beginPath();
            ctx.arc(toPx(mx), toPx(mz), 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
        });
    }

    const tex = new THREE.CanvasTexture(c);
    tex.anisotropy = 8;
    if ('colorSpace' in tex && THREE.SRGBColorSpace) tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
}

function createSidewalkPavingTexture() {
    const S = 512;
    const c = document.createElement('canvas');
    c.width = S;
    c.height = S;
    const ctx = c.getContext('2d');

    ctx.fillStyle = '#474c57';
    ctx.fillRect(0, 0, S, S);

    const step = 64;
    for (let y = 0; y < S; y += step) {
        for (let x = 0; x < S; x += step) {
            const v = (((x * 13 + y * 29) % 17) - 8) * 1.1;
            const g = Math.max(58, Math.min(88, Math.round(74 + v)));
            ctx.fillStyle = `rgb(${g}, ${g + 3}, ${g + 9})`;
            ctx.fillRect(x + 2, y + 2, step - 4, step - 4);
        }
    }

    ctx.strokeStyle = 'rgba(20, 24, 32, 0.55)';
    ctx.lineWidth = 2;
    for (let i = 0; i <= S; i += step) {
        ctx.beginPath();
        ctx.moveTo(i, 0); ctx.lineTo(i, S);
        ctx.moveTo(0, i); ctx.lineTo(S, i);
        ctx.stroke();
    }

    const tex = new THREE.CanvasTexture(c);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(22, 22);
    tex.anisotropy = 4;
    if ('colorSpace' in tex && THREE.SRGBColorSpace) tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
}

function getDistrictFacadeCanvases(style) {
    if (_facadeSourceCache[style]) return _facadeSourceCache[style];

    const W = 1024;
    const H = 1024;
    const colC = document.createElement('canvas'); colC.width = W; colC.height = H;
    const bumpC = document.createElement('canvas'); bumpC.width = W; bumpC.height = H;
    const roughC = document.createElement('canvas'); roughC.width = W; roughC.height = H;
    const emC = document.createElement('canvas'); emC.width = W; emC.height = H;

    const cCtx = colC.getContext('2d');
    const bCtx = bumpC.getContext('2d');
    const rCtx = roughC.getContext('2d');
    const eCtx = emC.getContext('2d');

    // Pure black emissive base so masonry/brick/concrete never glows
    eCtx.fillStyle = '#000000';
    eCtx.fillRect(0, 0, W, H);
    // Rough matte stone/brick default
    rCtx.fillStyle = 'rgb(220,220,220)';
    rCtx.fillRect(0, 0, W, H);
    // Neutral mid-high bump base
    bCtx.fillStyle = 'rgb(155,155,155)';
    bCtx.fillRect(0, 0, W, H);

    const cfg = {
        haussmann_sw: {
            base: '#cbc1ae', mortar: '#a49986', ledge: '#ded6c6', frame: '#2a2723',
            rows: 5, cols: 6, sillH: 14, hasBalcony: true, glassTop: '#1c2b3a', glassBot: '#39526b', emCol: '#ffd89a'
        },
        brick_nw: {
            base: '#794639', mortar: '#665b53', ledge: '#9a968e', frame: '#1f2329',
            rows: 6, cols: 6, sillH: 12, hasBalcony: false, glassTop: '#172330', glassBot: '#2f455c', emCol: '#ffe2a8'
        },
        club_se: {
            base: '#282d38', mortar: '#1b1f28', ledge: '#3f4759', frame: '#0e1118',
            rows: 6, cols: 6, sillH: 10, hasBalcony: false, glassTop: '#111a28', glassBot: '#23344d', emCol: '#fde68a'
        },
        tower_ne: {
            base: '#253142', mortar: '#192230', ledge: '#4a5a72', frame: '#111926',
            rows: 7, cols: 8, sillH: 8, hasBalcony: false, glassTop: '#16283e', glassBot: '#345376', emCol: '#e2f0ff'
        }
    }[style] || {
        base: '#4b5563', mortar: '#374151', ledge: '#6b7280', frame: '#111827',
        rows: 6, cols: 6, sillH: 10, hasBalcony: false, glassTop: '#172434', glassBot: '#2e455d', emCol: '#fde68a'
    };

    // 1. Detailed Masonry / Curtain-Wall Background
    cCtx.fillStyle = cfg.base;
    cCtx.fillRect(0, 0, W, H);

    if (style === 'brick_nw') {
        const brickH = 16;
        const brickW = 48;
        const shades = ['#7c4a3b', '#6d3e31', '#885443', '#62372c'];
        cCtx.fillStyle = cfg.mortar;
        cCtx.fillRect(0, 0, W, H);
        bCtx.fillStyle = 'rgb(105,105,105)';
        bCtx.fillRect(0, 0, W, H);
        let rowNum = 0;
        for (let by = 0; by < H; by += brickH) {
            const offset = (rowNum % 2) * (brickW / 2);
            for (let bx = -brickW; bx < W + brickW; bx += brickW) {
                const idx = Math.abs((rowNum * 7 + Math.floor(bx / brickW) * 13) % shades.length);
                cCtx.fillStyle = shades[idx];
                cCtx.fillRect(bx + offset + 2, by + 2, brickW - 3, brickH - 3);
                bCtx.fillStyle = 'rgb(165,165,165)';
                bCtx.fillRect(bx + offset + 2, by + 2, brickW - 3, brickH - 3);
            }
            rowNum++;
        }
    } else if (style === 'haussmann_sw') {
        // Cut Parisian ashlar limestone courses
        const stoneH = 44;
        const stoneW = 128;
        cCtx.strokeStyle = cfg.mortar;
        cCtx.lineWidth = 3;
        bCtx.strokeStyle = 'rgb(95,95,95)';
        bCtx.lineWidth = 3;
        let rN = 0;
        for (let sy = 0; sy < H; sy += stoneH) {
            const off = (rN % 2) * (stoneW / 2);
            cCtx.beginPath(); cCtx.moveTo(0, sy); cCtx.lineTo(W, sy); cCtx.stroke();
            bCtx.beginPath(); bCtx.moveTo(0, sy); bCtx.lineTo(W, sy); bCtx.stroke();
            for (let sx = -stoneW; sx < W + stoneW; sx += stoneW) {
                const tint = (((rN * 11 + sx) % 7) - 3) * 2;
                cCtx.fillStyle = `rgb(${203 + tint}, ${193 + tint}, ${174 + tint})`;
                cCtx.fillRect(sx + off + 2, sy + 2, stoneW - 4, stoneH - 4);
                cCtx.beginPath(); cCtx.moveTo(sx + off, sy); cCtx.lineTo(sx + off, sy + stoneH); cCtx.stroke();
                bCtx.beginPath(); bCtx.moveTo(sx + off, sy); bCtx.lineTo(sx + off, sy + stoneH); bCtx.stroke();
            }
            rN++;
        }
    } else if (style === 'club_se') {
        // Architectural board-formed concrete panels with tie-rod holes
        const panH = 64;
        const panW = 128;
        for (let py = 0; py < H; py += panH) {
            for (let px = 0; px < W; px += panW) {
                const v = (((px * 3 + py * 7) % 9) - 4) * 2;
                cCtx.fillStyle = `rgb(${40 + v}, ${45 + v}, ${56 + v})`;
                cCtx.fillRect(px + 2, py + 2, panW - 4, panH - 4);
                cCtx.fillStyle = 'rgba(10,12,18,0.65)';
                cCtx.fillRect(px + 12, py + 12, 5, 5);
                cCtx.fillRect(px + panW - 17, py + 12, 5, 5);
                bCtx.fillStyle = 'rgb(110,110,110)';
                bCtx.strokeRect(px + 1, py + 1, panW - 2, panH - 2);
            }
        }
    } else if (style === 'tower_ne') {
        // Brushed steel/titanium spandrels + vertical mullions
        rCtx.fillStyle = 'rgb(115,115,115)';
        rCtx.fillRect(0, 0, W, H);
        bCtx.fillStyle = 'rgb(190,190,190)';
        bCtx.fillRect(0, 0, W, H);
    }

    // 2. Floor Ledges, Window Bays, Curtains, Reflective Glass & Shadow Drip AO
    const rowH = H / cfg.rows;
    const colW = W / cfg.cols;

    for (let r = 0; r < cfg.rows; r++) {
        const floorTop = r * rowH;

        // Horizontal projecting stone/concrete cornice ledge & shadow underneath
        cCtx.fillStyle = cfg.ledge;
        cCtx.fillRect(0, floorTop, W, cfg.sillH);
        const ao = cCtx.createLinearGradient(0, floorTop + cfg.sillH, 0, floorTop + cfg.sillH + 18);
        ao.addColorStop(0, 'rgba(0,0,0,0.34)');
        ao.addColorStop(1, 'rgba(0,0,0,0)');
        cCtx.fillStyle = ao;
        cCtx.fillRect(0, floorTop + cfg.sillH, W, 18);

        bCtx.fillStyle = 'rgb(240,240,240)';
        bCtx.fillRect(0, floorTop, W, cfg.sillH);

        for (let col = 0; col < cfg.cols; col++) {
            const bayX = col * colW;
            const padX = style === 'tower_ne' ? 7 : 22;
            const padTop = style === 'tower_ne' ? 14 : 26;
            const padBot = style === 'tower_ne' ? 14 : 22;
            const wx = bayX + padX;
            const wy = floorTop + cfg.sillH + padTop;
            const ww = colW - padX * 2;
            const wh = rowH - cfg.sillH - padTop - padBot;

            // Recessed dark window frame
            cCtx.fillStyle = cfg.frame;
            cCtx.fillRect(wx - 4, wy - 4, ww + 8, wh + 8);
            bCtx.fillStyle = 'rgb(50,50,50)';
            bCtx.fillRect(wx - 4, wy - 4, ww + 8, wh + 8);

            // Sky-reflecting glass pane gradient (dark reflective glass in daylight!)
            const gGrad = cCtx.createLinearGradient(wx, wy, wx + ww * 0.4, wy + wh);
            gGrad.addColorStop(0, cfg.glassTop);
            gGrad.addColorStop(0.55, cfg.glassBot);
            gGrad.addColorStop(1, '#101824');
            cCtx.fillStyle = gGrad;
            cCtx.fillRect(wx, wy, ww, wh);

            // Diagonal soft sky glint on glass
            cCtx.fillStyle = 'rgba(205, 228, 255, 0.11)';
            cCtx.beginPath();
            cCtx.moveTo(wx, wy + wh * 0.25);
            cCtx.lineTo(wx + ww * 0.65, wy);
            cCtx.lineTo(wx + ww, wy);
            cCtx.lineTo(wx, wy + wh * 0.65);
            cCtx.closePath();
            cCtx.fill();

            // Subtle interior curtains / vertical office blinds
            const hash = Math.abs(Math.sin((r * 23 + col * 41 + style.length * 11) * 12.9898) * 43758.5453) % 1;
            if (hash > 0.35 && style !== 'tower_ne') {
                cCtx.fillStyle = 'rgba(215, 206, 190, 0.16)';
                cCtx.fillRect(wx + 2, wy + 2, ww * 0.26, wh - 4);
                cCtx.fillRect(wx + ww * 0.72, wy + 2, ww * 0.26, wh - 4);
            } else if (style === 'tower_ne' && hash > 0.5) {
                cCtx.fillStyle = 'rgba(180, 198, 220, 0.10)';
                cCtx.fillRect(wx + 2, wy + 2, ww - 4, wh * 0.34);
            }

            // Glass is glossy in roughnessMap
            rCtx.fillStyle = 'rgb(28, 28, 28)';
            rCtx.fillRect(wx, wy, ww, wh);
            bCtx.fillStyle = 'rgb(30, 30, 30)';
            bCtx.fillRect(wx, wy, ww, wh);

            // Inner window mullions (French crossbars or steel curtain bars)
            cCtx.fillStyle = cfg.frame;
            cCtx.fillRect(wx + ww * 0.5 - 2, wy, 4, wh);
            cCtx.fillRect(wx, wy + wh * 0.42, ww, 4);
            rCtx.fillStyle = 'rgb(140,140,140)';
            rCtx.fillRect(wx + ww * 0.5 - 2, wy, 4, wh);
            rCtx.fillRect(wx, wy + wh * 0.42, ww, 4);

            // Protruding window sill
            cCtx.fillStyle = cfg.ledge;
            cCtx.fillRect(wx - 7, wy + wh + 2, ww + 14, 8);
            bCtx.fillStyle = 'rgb(230,230,230)';
            bCtx.fillRect(wx - 7, wy + wh + 2, ww + 14, 8);

            // Parisian Haussmann wrought-iron balustrade across lower 35% of window
            if (cfg.hasBalcony) {
                const railTop = wy + wh * 0.64;
                cCtx.fillStyle = '#18181b';
                cCtx.fillRect(wx - 6, railTop, ww + 12, 4);
                cCtx.fillRect(wx - 6, wy + wh - 4, ww + 12, 5);
                for (let rx = wx; rx <= wx + ww; rx += 10) {
                    cCtx.fillRect(rx, railTop, 2.5, wy + wh - railTop);
                }
            }

            // Soft realistic night illumination ONLY in emissiveMap (not flat yellow in daylight!)
            const isLit = hash > 0.46;
            if (isLit) {
                const eGrad = eCtx.createLinearGradient(wx, wy, wx, wy + wh);
                const warmTone = hash > 0.82 ? '#ffd28e' : cfg.emCol;
                eGrad.addColorStop(0, warmTone);
                eGrad.addColorStop(1, '#5c4627');
                eCtx.fillStyle = eGrad;
                eCtx.fillRect(wx + 2, wy + 2, ww - 4, wh - 4);
                eCtx.fillStyle = '#000000';
                eCtx.fillRect(wx + ww * 0.5 - 2, wy, 4, wh);
                eCtx.fillRect(wx, wy + wh * 0.42, ww, 4);
            }
        }
    }

    const res = { colC, bumpC, roughC, emC };
    _facadeSourceCache[style] = res;
    return res;
}

function createDistrictFacadeTextures(style, rx = 1, ry = 1) {
    const src = getDistrictFacadeCanvases(style);
    return {
        map: makeScaledCanvasTexture(src.colC, true, rx, ry),
        bumpMap: makeScaledCanvasTexture(src.bumpC, false, rx, ry),
        roughnessMap: makeScaledCanvasTexture(src.roughC, false, rx, ry),
        emissiveMap: makeScaledCanvasTexture(src.emC, true, rx, ry)
    };
}

function getBarkTextures() {
    if (_barkPair) return _barkPair;
    const W = 256;
    const H = 512;
    const c = document.createElement('canvas'); c.width = W; c.height = H;
    const b = document.createElement('canvas'); b.width = W; b.height = H;
    const ctx = c.getContext('2d');
    const bCtx = b.getContext('2d');

    ctx.fillStyle = '#4f4338';
    ctx.fillRect(0, 0, W, H);
    bCtx.fillStyle = 'rgb(140,140,140)';
    bCtx.fillRect(0, 0, W, H);

    // Organic fissured plane-tree / oak bark ridges & scales
    for (let i = 0; i < 420; i++) {
        const x = (i * 59) % W;
        const y = (i * 83) % H;
        const w = 4 + (i % 9);
        const h = 28 + (i % 46);
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
    c.width = S;
    c.height = S;
    const ctx = c.getContext('2d');
    ctx.clearRect(0, 0, S, S);

    // Fine interior woody twig skeleton radiating out
    ctx.strokeStyle = '#3c3024';
    ctx.lineCap = 'round';
    const twigs = [
        [256, 420, 256, 130, 7],
        [256, 330, 135, 195, 5],
        [256, 315, 385, 185, 5],
        [256, 235, 165, 120, 4],
        [256, 225, 345, 125, 4],
        [256, 365, 110, 290, 4],
        [256, 360, 405, 285, 4]
    ];
    twigs.forEach(([x0, y0, x1, y1, lw]) => {
        ctx.lineWidth = lw;
        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.quadraticCurveTo((x0 + x1) * 0.5, (y0 + y1) * 0.5 + 14, x1, y1);
        ctx.stroke();
    });

    // Draw 110 individual ovate leaves clustered organically around twigs with crisp alpha cutout holes
    const shades = [
        '#253e1e', '#2f4c24', '#395a2b', '#436932',
        '#4f753a', '#598241', '#658c47', '#71964f'
    ];
    for (let i = 0; i < 110; i++) {
        const ang = (i * 2.39996); // golden angle spiral packing inside canopy card
        const rad = 28 + Math.sqrt(i / 110) * 172;
        const lx = 256 + Math.cos(ang) * rad;
        const ly = 250 + Math.sin(ang) * rad * 0.88;
        const leafRot = ang + ((i % 7) - 3) * 0.28;
        const lLen = 26 + (i % 5) * 5.5;
        const lWid = lLen * 0.48;

        ctx.save();
        ctx.translate(lx, ly);
        ctx.rotate(leafRot);

        // Dark outer shadow leaf or sunlit upper leaf
        const shadeIdx = Math.min(shades.length - 1, Math.floor(((rad / 200) * 0.65 + (1 - ly / 512) * 0.35) * shades.length));
        ctx.fillStyle = shades[Math.max(0, shadeIdx)];
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.bezierCurveTo(lWid, lLen * 0.3, lWid * 0.7, lLen * 0.82, 0, lLen);
        ctx.bezierCurveTo(-lWid * 0.7, lLen * 0.82, -lWid, lLen * 0.3, 0, 0);
        ctx.closePath();
        ctx.fill();

        // Subtle midrib vein highlight
        ctx.strokeStyle = 'rgba(180, 212, 130, 0.28)';
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(0, 3);
        ctx.lineTo(0, lLen * 0.82);
        ctx.stroke();

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
    const W = canvas.width;
    const H = canvas.height;
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
    paintDynamicBillboard(_labelSignCanvas, _labelSignTex, 'LABEL HQ · STUDIO PRO', labelName, '#fbbf24');
    paintDynamicBillboard(_rivalSignCanvas, _rivalSignTex, 'PIERRE ANGULAIRE // RIVAL', rivalName, '#fb7185');
    if (typeof window._refreshCityBillboards === 'function') {
        window._refreshCityBillboards();
    }
}

function makeBuildingMaterialSet(style, rx, ry, isGlassTower = false) {
    const pbr = createDistrictFacadeTextures(style, rx, ry);
    const wallMat = new THREE.MeshStandardMaterial({
        map: pbr.map,
        bumpMap: pbr.bumpMap,
        bumpScale: 0.14,
        roughnessMap: pbr.roughnessMap,
        roughness: 1.0,
        metalness: isGlassTower ? 0.42 : 0.08,
        emissiveMap: pbr.emissiveMap,
        emissive: new THREE.Color('#ffffff'),
        emissiveIntensity: 0.08
    });
    _bldgEmissiveMats.push(wallMat);

    const roofColor = style === 'haussmann_sw' ? '#364152' : (style === 'tower_ne' ? '#1e293b' : '#2a2d36');
    const roofMat = new THREE.MeshStandardMaterial({ color: roofColor, roughness: 0.88, metalness: 0.15 });
    return [wallMat, wallMat, roofMat, roofMat, wallMat, wallMat];
}

function addLandmarkBuilding(group, cfg) {
    const {
        id, title, subtitle, district,
        x, z, w, h, d, tx, tz,
        style, accentHex, billboardTag, billboardKind
    } = cfg;

    const rx = Math.max(1, Math.round(w / 9));
    const ry = Math.max(1, Math.round(h / 10));
    const mats = makeBuildingMaterialSet(style, rx, ry, style === 'tower_ne');

    const body = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mats);
    body.position.set(x, h / 2 + SIDEWALK_HEIGHT, z);
    group.add(body);

    // Architectural stone/granite ground-floor podium & cornice trim
    const podiumMat = new THREE.MeshStandardMaterial({
        color: style === 'haussmann_sw' ? '#b3a792' : '#1b202c',
        roughness: 0.78,
        metalness: 0.14
    });
    const podium = new THREE.Mesh(new THREE.BoxGeometry(w + 0.42, 3.6, d + 0.42), podiumMat);
    podium.position.set(x, SIDEWALK_HEIGHT + 1.8, z);
    const cornice = new THREE.Mesh(new THREE.BoxGeometry(w + 0.65, 0.48, d + 0.65), podiumMat);
    cornice.position.set(x, SIDEWALK_HEIGHT + h, z);
    group.add(podium, cornice);

    // Entrance glazed vestibule, granite columns & illuminated marquee facing plaza
    const dx = tx - x;
    const dz = tz - z;
    const angleToPlaza = Math.atan2(dx, dz);
    const dirX = Math.sin(angleToPlaza);
    const dirZ = Math.cos(angleToPlaza);
    const frontX = x + dirX * (d * 0.53);
    const frontZ = z + dirZ * (d * 0.53);

    const lobbyGlass = new THREE.Mesh(
        new THREE.BoxGeometry(Math.min(w * 0.42, 5.4), 3.1, 0.45),
        new THREE.MeshStandardMaterial({ color: '#1b2b3d', emissive: '#f59e0b', emissiveIntensity: 0.25, roughness: 0.12, metalness: 0.75 })
    );
    lobbyGlass.position.set(frontX, SIDEWALK_HEIGHT + 1.55, frontZ);
    lobbyGlass.rotation.y = angleToPlaza;
    group.add(lobbyGlass);

    const colMat = new THREE.MeshStandardMaterial({ color: '#64748b', roughness: 0.65, metalness: 0.2 });
    const rightVecX = Math.cos(angleToPlaza);
    const rightVecZ = -Math.sin(angleToPlaza);
    [-2.8, 2.8].forEach(lat => {
        const colMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.28, 3.5, 10), colMat);
        colMesh.position.set(frontX + dirX * 0.9 + rightVecX * lat, SIDEWALK_HEIGHT + 1.75, frontZ + dirZ * 0.9 + rightVecZ * lat);
        group.add(colMesh);
    });

    const awning = new THREE.Mesh(
        new THREE.BoxGeometry(Math.min(w * 0.52, 6.8), 0.32, 2.2),
        new THREE.MeshStandardMaterial({ color: '#111827', roughness: 0.35, metalness: 0.72 })
    );
    awning.position.set(frontX + dirX * 0.65, SIDEWALK_HEIGHT + 3.65, frontZ + dirZ * 0.65);
    awning.rotation.y = angleToPlaza;
    const awningTrim = new THREE.Mesh(
        new THREE.BoxGeometry(Math.min(w * 0.52, 6.8) + 0.08, 0.12, 2.28),
        new THREE.MeshBasicMaterial({ color: accentHex })
    );
    awningTrim.position.set(frontX + dirX * 0.65, SIDEWALK_HEIGHT + 3.82, frontZ + dirZ * 0.65);
    awningTrim.rotation.y = angleToPlaza;
    group.add(awning, awningTrim);

    // Distinct architectural roof silhouette per landmark
    if (id === 'pro_studio') {
        const crown = new THREE.Mesh(new THREE.BoxGeometry(w * 0.68, 6.5, d * 0.68), mats);
        crown.position.set(x, SIDEWALK_HEIGHT + h + 3.25, z);
        const crownCap = new THREE.Mesh(new THREE.BoxGeometry(w * 0.44, 3.4, d * 0.44), mats);
        crownCap.position.set(x, SIDEWALK_HEIGHT + h + 8.2, z);
        const spire = new THREE.Mesh(
            new THREE.CylinderGeometry(0.1, 0.42, 9.5, 8),
            new THREE.MeshStandardMaterial({ color: '#cbd5e1', metalness: 0.85, roughness: 0.2 })
        );
        spire.position.set(x, SIDEWALK_HEIGHT + h + 14.5, z);
        const avLight = new THREE.Mesh(new THREE.SphereGeometry(0.32, 8, 8), new THREE.MeshBasicMaterial({ color: '#ef4444' }));
        avLight.position.set(x, SIDEWALK_HEIGHT + h + 19.3, z);
        _aviationLights.push(avLight);
        group.add(crown, crownCap, spire, avLight);
    } else if (id === 'vinyl_shop' || id === 'gear_shop') {
        const mansard = new THREE.Mesh(
            new THREE.CylinderGeometry(Math.min(w, d) * 0.46, Math.min(w, d) * 0.72, 2.6, 4),
            new THREE.MeshStandardMaterial({ color: '#333d4b', roughness: 0.62, metalness: 0.35 })
        );
        mansard.scale.set(w / Math.min(w, d), 1, d / Math.min(w, d));
        mansard.rotation.y = Math.PI / 4;
        mansard.position.set(x, SIDEWALK_HEIGHT + h + 1.3, z);
        group.add(mansard);

        if (id === 'vinyl_shop') {
            const giantVinyl = new THREE.Mesh(
                new THREE.CylinderGeometry(2.6, 2.6, 0.24, 24),
                new THREE.MeshStandardMaterial({ color: '#0a0a0f', metalness: 0.65, roughness: 0.25 })
            );
            giantVinyl.rotation.x = Math.PI / 2;
            giantVinyl.position.set(x, SIDEWALK_HEIGHT + h + 4.8, z);
            const vinylGold = new THREE.Mesh(
                new THREE.CylinderGeometry(0.88, 0.88, 0.27, 16),
                new THREE.MeshBasicMaterial({ color: '#fbbf24' })
            );
            vinylGold.rotation.x = Math.PI / 2;
            giantVinyl.add(vinylGold);
            _rotors.push(giantVinyl);
            group.add(giantVinyl);
        }
    } else if (id === 'rival_hq') {
        const ribMat = new THREE.MeshStandardMaterial({ color: '#27131a', roughness: 0.7, metalness: 0.35 });
        [-w * 0.42, w * 0.42].forEach(ox => {
            const buttress = new THREE.Mesh(new THREE.BoxGeometry(1.1, h + 1.5, d + 1.2), ribMat);
            buttress.position.set(x + ox, SIDEWALK_HEIGHT + (h + 1.5) / 2, z);
            group.add(buttress);
        });
    }

    // Dynamic or Static Facade LED Sign
    const signCanvas = document.createElement('canvas');
    signCanvas.width = 512;
    signCanvas.height = 128;
    const signTex = new THREE.CanvasTexture(signCanvas);
    if ('colorSpace' in signTex && THREE.SRGBColorSpace) signTex.colorSpace = THREE.SRGBColorSpace;
    paintDynamicBillboard(signCanvas, signTex, billboardTag, title, accentHex);

    if (billboardKind === 'label') {
        _labelSignCanvas = signCanvas;
        _labelSignTex = signTex;
    } else if (billboardKind === 'rival') {
        _rivalSignCanvas = signCanvas;
        _rivalSignTex = signTex;
    }

    const signW = Math.min(w * 0.72, 10.4);
    const signMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(signW, signW * 0.25),
        new THREE.MeshBasicMaterial({ map: signTex, side: THREE.DoubleSide })
    );
    signMesh.position.set(
        x + dirX * (d * 0.525),
        SIDEWALK_HEIGHT + Math.min(h * 0.68, 10.8),
        z + dirZ * (d * 0.525)
    );
    signMesh.rotation.y = angleToPlaza;
    group.add(signMesh);

    const ty = getCityGroundHeight(tx, tz);
    const ring = new THREE.Mesh(
        new THREE.RingGeometry(2.3, 3.05, 32),
        new THREE.MeshBasicMaterial({ color: accentHex, side: THREE.DoubleSide, transparent: true, opacity: 0.88 })
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.set(tx, ty + 0.05, tz);
    group.add(ring);

    const beam = new THREE.Mesh(
        new THREE.CylinderGeometry(0.16, 0.42, 13, 10, 1, true),
        new THREE.MeshBasicMaterial({ color: accentHex, transparent: true, opacity: 0.22, side: THREE.DoubleSide, depthWrite: false })
    );
    beam.position.set(tx, ty + 6.5, tz);
    group.add(beam);
    _beacons.push({ ring, beam });

    addCollider(x, z, w / 2 + 0.45, d / 2 + 0.45);
    _landmarks.push({ id, title, subtitle, district, x, z, tx, tz, accentHex });
}

function buildSidewalkSlabs(root) {
    const pavingTex = createSidewalkPavingTexture();
    const topMat = new THREE.MeshStandardMaterial({ map: pavingTex, roughness: 0.85, metalness: 0.05 });
    const curbMat = new THREE.MeshStandardMaterial({ color: '#6b7280', roughness: 0.72, metalness: 0.1 });
    const slabMats = [curbMat, curbMat, topMat, curbMat, curbMat, curbMat];

    const innerGeo = new THREE.BoxGeometry(72.8, SIDEWALK_HEIGHT, 72.8);
    [[-48, -48], [48, -48], [-48, 48], [48, 48]].forEach(([cx, cz]) => {
        const slab = new THREE.Mesh(innerGeo, slabMats);
        slab.position.set(cx, SIDEWALK_HEIGHT / 2, cz);
        slab.receiveShadow = true;
        root.add(slab);
    });

    const outerMat = new THREE.MeshStandardMaterial({ map: pavingTex, roughness: 0.88, metalness: 0.04 });
    const outerTopBotGeo = new THREE.BoxGeometry(320, SIDEWALK_HEIGHT, 52.4);
    const outerSideGeo = new THREE.BoxGeometry(52.4, SIDEWALK_HEIGHT, 215.2);
    const north = new THREE.Mesh(outerTopBotGeo, outerMat); north.position.set(0, SIDEWALK_HEIGHT / 2, -133.8);
    const south = new THREE.Mesh(outerTopBotGeo, outerMat); south.position.set(0, SIDEWALK_HEIGHT / 2, 133.8);
    const west = new THREE.Mesh(outerSideGeo, outerMat); west.position.set(-133.8, SIDEWALK_HEIGHT / 2, 0);
    const east = new THREE.Mesh(outerSideGeo, outerMat); east.position.set(133.8, SIDEWALK_HEIGHT / 2, 0);
    root.add(north, south, west, east);
}

function buildCentralFountain(root) {
    const fg = new THREE.Group();
    const stoneMat = new THREE.MeshStandardMaterial({ color: '#94a3b8', roughness: 0.62, metalness: 0.12 });
    const darkBasinMat = new THREE.MeshStandardMaterial({ color: '#0f172a', roughness: 0.45 });
    const bronzeMat = new THREE.MeshStandardMaterial({ color: '#785a3a', roughness: 0.38, metalness: 0.75 });

    const plinth = new THREE.Mesh(new THREE.CylinderGeometry(4.6, 4.95, 0.26, 32), stoneMat);
    plinth.position.y = 0.13;
    const basinWall = new THREE.Mesh(new THREE.CylinderGeometry(3.65, 3.85, 0.56, 32), stoneMat);
    basinWall.position.y = 0.42;
    const basinInner = new THREE.Mesh(new THREE.CylinderGeometry(3.35, 3.35, 0.42, 32), darkBasinMat);
    basinInner.position.y = 0.38;

    const rim = new THREE.Mesh(new THREE.TorusGeometry(3.52, 0.22, 10, 36), stoneMat);
    rim.rotation.x = Math.PI / 2;
    rim.position.y = 0.70;

    const waterMat = new THREE.MeshStandardMaterial({
        color: '#22d3ee',
        emissive: new THREE.Color('#0891b2'),
        emissiveIntensity: 0.45,
        roughness: 0.12,
        metalness: 0.45,
        transparent: true,
        opacity: 0.85
    });
    _fountainWaterMesh = new THREE.Mesh(new THREE.CircleGeometry(3.38, 32), waterMat);
    _fountainWaterMesh.rotation.x = -Math.PI / 2;
    _fountainWaterMesh.position.y = 0.60;

    const ped1 = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.72, 1.45, 16), stoneMat);
    ped1.position.y = 1.15;
    const bowl1 = new THREE.Mesh(new THREE.CylinderGeometry(1.45, 0.48, 0.35, 24), bronzeMat);
    bowl1.position.y = 1.85;
    const ped2 = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.34, 0.95, 14), stoneMat);
    ped2.position.y = 2.35;
    const bowl2 = new THREE.Mesh(new THREE.CylinderGeometry(0.68, 0.24, 0.28, 20), bronzeMat);
    bowl2.position.y = 2.85;

    fg.add(plinth, basinWall, basinInner, rim, _fountainWaterMesh, ped1, bowl1, ped2, bowl2);

    const dropCount = 48;
    _waterDropInst = new THREE.InstancedMesh(
        new THREE.SphereGeometry(0.08, 6, 6),
        new THREE.MeshBasicMaterial({ color: '#bae6fd', transparent: true, opacity: 0.8 }),
        dropCount
    );
    _waterDropInst.frustumCulled = false;
    const initMat = new THREE.Matrix4().makeTranslation(0, 1.2, 0);
    _waterSeeds.length = 0;
    for (let i = 0; i < dropCount; i++) {
        _waterDropInst.setMatrixAt(i, initMat);
        _waterSeeds.push({
            angle: (i % 12) * ((Math.PI * 2) / 12) + (Math.floor(i / 12) * 0.22),
            phase: (i / dropCount),
            speed: 0.85 + (i % 4) * 0.15,
            radiusMax: (i % 3 === 0) ? 1.05 : 2.35
        });
    }
    _waterDropInst.instanceMatrix.needsUpdate = true;
    fg.add(_waterDropInst);

    root.add(fg);
    addCollider(0, 0, 4.75, 4.75);
}

function buildInstancedArchitecture(root) {
    const allSlots = [
        // NW (Banlieue Nord)
        [-68, -28, 12, 16, 12], [-72, -56, 14, 18, 14], [-34, -72, 13, 15, 12], [-66, -74, 12, 17, 12],
        [-126, -126, 18, 22, 18], [-64, -128, 18, 20, 16], [-24, -128, 16, 22, 16], [-128, -64, 16, 18, 18], [-128, -24, 16, 16, 16],
        // SW (Vinyl Row Inde - Haussmann)
        [-70, 26, 12, 13, 12], [-70, 68, 14, 14, 14], [-44, 72, 12, 12, 11],
        [-128, 28, 16, 14, 18], [-128, 68, 16, 15, 18], [-126, 126, 18, 15, 18], [-64, 128, 16, 14, 16], [-24, 128, 16, 16, 16],
        // SE (Avenue des Clubs)
        [70, 26, 13, 17, 13], [70, 70, 15, 20, 15], [24, 68, 13, 16, 13],
        [128, 28, 18, 28, 18], [128, 68, 18, 24, 18], [28, 128, 18, 22, 18], [68, 128, 18, 25, 18], [126, 126, 20, 28, 20],
        // NE (District 42 Skyline)
        [72, -24, 14, 34, 14], [72, -72, 16, 48, 16], [46, -74, 13, 30, 13],
        [28, -128, 18, 42, 18], [68, -128, 18, 52, 18], [126, -126, 20, 48, 20], [128, -64, 18, 44, 18], [128, -24, 18, 36, 16]
    ];

    const buckets = {
        brick_nw_mid: [], brick_nw_tall: [],
        haussmann_sw_mid: [],
        club_se_mid: [], club_se_tall: [],
        tower_ne_tall: []
    };

    const podiumPositions = [];
    const cornicePositions = [];
    const mansardPositions = [];
    const chimneyPositions = [];
    const balconyPositions = [];
    const hvacPositions = [];
    const setbackPositions = [];
    const waterTankPositions = [];

    allSlots.forEach((s, idx) => {
        const [bx, bz, bw, bh, bd] = s;
        addCollider(bx, bz, bw / 2 + 0.3, bd / 2 + 0.3);

        podiumPositions.push([bx, SIDEWALK_HEIGHT + 1.8, bz, bw + 0.36, 3.6, bd + 0.36]);
        cornicePositions.push([bx, SIDEWALK_HEIGHT + bh, bz, bw + 0.56, 0.45, bd + 0.56]);
        hvacPositions.push([bx + bw * 0.18, SIDEWALK_HEIGHT + bh + 0.6, bz - bd * 0.18, Math.max(2.1, bw * 0.22), 1.0, Math.max(2.1, bd * 0.22)]);

        if (bx < 0 && bz < 0) {
            if (bh >= 20) buckets.brick_nw_tall.push(s);
            else buckets.brick_nw_mid.push(s);

            // Real cantilevered concrete balconies facing avenue & water tanks
            for (let fl = 5.5; fl < bh - 2.5; fl += 3.6) {
                const faceZ = bz < -90 ? bz + bd / 2 + 0.42 : bz - bd / 2 - 0.42;
                balconyPositions.push([bx, SIDEWALK_HEIGHT + fl, faceZ, bw * 0.56, 0.24, 0.85]);
            }
            if (idx % 2 === 0) {
                waterTankPositions.push([bx - bw * 0.22, SIDEWALK_HEIGHT + bh, bz + bd * 0.2]);
            }
        } else if (bx < 0 && bz > 0) {
            buckets.haussmann_sw_mid.push(s);
            mansardPositions.push([bx, SIDEWALK_HEIGHT + bh + 1.55, bz, bw + 0.2, 3.1, bd + 0.2]);
            chimneyPositions.push([bx - bw * 0.28, SIDEWALK_HEIGHT + bh + 3.2, bz, 0.75, 1.35, 0.55]);
            chimneyPositions.push([bx + bw * 0.26, SIDEWALK_HEIGHT + bh + 3.2, bz + 0.4, 0.75, 1.35, 0.55]);
        } else if (bx > 0 && bz > 0) {
            if (bh >= 21) buckets.club_se_tall.push(s);
            else buckets.club_se_mid.push(s);
        } else {
            buckets.tower_ne_tall.push(s);
            setbackPositions.push([bx, SIDEWALK_HEIGHT + bh + 2.4, bz, bw * 0.64, 4.8, bd * 0.64]);
            setbackPositions.push([bx, SIDEWALK_HEIGHT + bh + 6.0, bz, bw * 0.38, 2.8, bd * 0.38]);
            if (bh >= 36) {
                const avLight = new THREE.Mesh(new THREE.SphereGeometry(0.28, 8, 8), new THREE.MeshBasicMaterial({ color: '#ef4444' }));
                avLight.position.set(bx, SIDEWALK_HEIGHT + bh + 7.6, bz);
                _aviationLights.push(avLight);
                root.add(avLight);
            }
        }
    });

    const unitBox = new THREE.BoxGeometry(1, 1, 1);
    const dummy = new THREE.Object3D();

    const bucketDefs = [
        ['brick_nw_mid', 'brick_nw', 1, 1.1, false],
        ['brick_nw_tall', 'brick_nw', 1.2, 1.8, false],
        ['haussmann_sw_mid', 'haussmann_sw', 1, 1.1, false],
        ['club_se_mid', 'club_se', 1, 1.2, false],
        ['club_se_tall', 'club_se', 1.2, 2.0, true],
        ['tower_ne_tall', 'tower_ne', 1.3, 2.8, true]
    ];

    bucketDefs.forEach(([key, style, rx, ry, isGlass]) => {
        const list = buckets[key];
        if (!list || list.length === 0) return;
        const mats = makeBuildingMaterialSet(style, rx, ry, isGlass);
        const inst = new THREE.InstancedMesh(unitBox, mats, list.length);
        list.forEach(([bx, bz, bw, bh, bd], i) => {
            dummy.position.set(bx, SIDEWALK_HEIGHT + bh / 2, bz);
            dummy.scale.set(bw, bh, bd);
            dummy.rotation.set(0, 0, 0);
            dummy.updateMatrix();
            inst.setMatrixAt(i, dummy.matrix);
        });
        inst.instanceMatrix.needsUpdate = true;
        root.add(inst);
    });

    const addBoxSet = (arr, mat) => {
        if (!arr || arr.length === 0) return;
        const inst = new THREE.InstancedMesh(unitBox, mat, arr.length);
        arr.forEach(([px, py, pz, sx, sy, sz], i) => {
            dummy.position.set(px, py, pz);
            dummy.scale.set(sx, sy, sz);
            dummy.rotation.set(0, 0, 0);
            dummy.updateMatrix();
            inst.setMatrixAt(i, dummy.matrix);
        });
        inst.instanceMatrix.needsUpdate = true;
        root.add(inst);
    };

    const podiumMat = new THREE.MeshStandardMaterial({ color: '#1f2430', roughness: 0.72, metalness: 0.18 });
    const corniceMat = new THREE.MeshStandardMaterial({ color: '#9ca3af', roughness: 0.78, metalness: 0.12 });
    const concreteMat = new THREE.MeshStandardMaterial({ color: '#94a3b8', roughness: 0.85, metalness: 0.05 });
    const hvacMat = new THREE.MeshStandardMaterial({ color: '#475569', roughness: 0.65, metalness: 0.35 });
    const chimneyMat = new THREE.MeshStandardMaterial({ color: '#9c5a44', roughness: 0.88 });
    const crownGlassMats = makeBuildingMaterialSet('tower_ne', 1, 1, true);

    addBoxSet(podiumPositions, podiumMat);
    addBoxSet(cornicePositions, corniceMat);
    addBoxSet(balconyPositions, concreteMat);
    addBoxSet(hvacPositions, hvacMat);
    addBoxSet(chimneyPositions, chimneyMat);
    addBoxSet(setbackPositions, crownGlassMats);

    // Sloped Parisian slate/zinc Mansard roofs (haussmann_sw)
    if (mansardPositions.length > 0) {
        const manGeo = new THREE.CylinderGeometry(0.56, 0.72, 1, 4);
        manGeo.rotateY(Math.PI / 4);
        const manMat = new THREE.MeshStandardMaterial({ color: '#2d3748', roughness: 0.58, metalness: 0.35 });
        const manInst = new THREE.InstancedMesh(manGeo, manMat, mansardPositions.length);
        mansardPositions.forEach(([mx, my, mz, sx, sy, sz], i) => {
            dummy.position.set(mx, my, mz);
            dummy.scale.set(sx, sy, sz);
            dummy.rotation.set(0, 0, 0);
            dummy.updateMatrix();
            manInst.setMatrixAt(i, dummy.matrix);
        });
        manInst.instanceMatrix.needsUpdate = true;
        root.add(manInst);
    }

    // Wooden NYC/Paris barrel water towers on NW roofs
    if (waterTankPositions.length > 0) {
        const tankStandGeo = new THREE.CylinderGeometry(0.95, 1.15, 1.5, 4);
        const barrelGeo = new THREE.CylinderGeometry(0.92, 0.92, 1.7, 12);
        const tankCapGeo = new THREE.ConeGeometry(1.02, 0.8, 12);
        const steelMat = new THREE.MeshStandardMaterial({ color: '#1f2937', metalness: 0.8, roughness: 0.4 });
        const cedarMat = new THREE.MeshStandardMaterial({ color: '#714b2f', roughness: 0.86 });

        const stInst = new THREE.InstancedMesh(tankStandGeo, steelMat, waterTankPositions.length);
        const brInst = new THREE.InstancedMesh(barrelGeo, cedarMat, waterTankPositions.length);
        const cpInst = new THREE.InstancedMesh(tankCapGeo, steelMat, waterTankPositions.length);
        waterTankPositions.forEach(([wx, wy, wz], i) => {
            dummy.scale.set(1, 1, 1);
            dummy.rotation.set(0, 0, 0);
            dummy.position.set(wx, wy + 0.75, wz); dummy.updateMatrix(); stInst.setMatrixAt(i, dummy.matrix);
            dummy.position.set(wx, wy + 2.35, wz); dummy.updateMatrix(); brInst.setMatrixAt(i, dummy.matrix);
            dummy.position.set(wx, wy + 3.55, wz); dummy.updateMatrix(); cpInst.setMatrixAt(i, dummy.matrix);
        });
        stInst.instanceMatrix.needsUpdate = true;
        brInst.instanceMatrix.needsUpdate = true;
        cpInst.instanceMatrix.needsUpdate = true;
        root.add(stInst, brInst, cpInst);
    }
}

function buildStreetFurniture(root) {
    const dummy = new THREE.Object3D();
    const darkIronMat = new THREE.MeshStandardMaterial({ color: '#1e293b', metalness: 0.78, roughness: 0.35 });
    const woodMat = new THREE.MeshStandardMaterial({ color: '#855836', roughness: 0.75, metalness: 0.05 });

    // 1. Curved Gooseneck Streetlamps + Halo glow
    const lampCoords = [];
    for (let p = -120; p <= 120; p += 24) {
        if (Math.abs(p) < 16) continue;
        lampCoords.push([p, -12.15, 0], [p, 12.15, Math.PI]);
        lampCoords.push([-12.15, p, Math.PI / 2], [12.15, p, -Math.PI / 2]);
    }
    const baseInst = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.18, 0.26, 0.75, 8), darkIronMat, lampCoords.length);
    const poleInst = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.08, 0.13, 5.4, 8), darkIronMat, lampCoords.length);
    const armInst = new THREE.InstancedMesh(new THREE.BoxGeometry(0.11, 0.11, 1.55), darkIronMat, lampCoords.length);
    const headInst = new THREE.InstancedMesh(new THREE.BoxGeometry(0.42, 0.14, 0.72), darkIronMat, lampCoords.length);
    const bulbInst = new THREE.InstancedMesh(new THREE.BoxGeometry(0.34, 0.08, 0.56), new THREE.MeshBasicMaterial({ color: '#fef08a' }), lampCoords.length);
    _lampHaloMat = new THREE.MeshBasicMaterial({ color: '#fde68a', transparent: true, opacity: 0.16, depthWrite: false });
    const haloInst = new THREE.InstancedMesh(new THREE.CircleGeometry(2.6, 16), _lampHaloMat, lampCoords.length);

    lampCoords.forEach(([lx, lz, rot], i) => {
        const roadDirX = Math.sin(rot);
        const roadDirZ = Math.cos(rot);
        dummy.rotation.set(0, rot, 0);
        dummy.scale.set(1, 1, 1);

        dummy.position.set(lx, SIDEWALK_HEIGHT + 0.37, lz); dummy.updateMatrix(); baseInst.setMatrixAt(i, dummy.matrix);
        dummy.position.set(lx, SIDEWALK_HEIGHT + 2.9, lz); dummy.updateMatrix(); poleInst.setMatrixAt(i, dummy.matrix);
        dummy.position.set(lx + roadDirX * 0.72, SIDEWALK_HEIGHT + 5.55, lz + roadDirZ * 0.72); dummy.updateMatrix(); armInst.setMatrixAt(i, dummy.matrix);
        dummy.position.set(lx + roadDirX * 1.38, SIDEWALK_HEIGHT + 5.48, lz + roadDirZ * 1.38); dummy.updateMatrix(); headInst.setMatrixAt(i, dummy.matrix);
        dummy.position.set(lx + roadDirX * 1.38, SIDEWALK_HEIGHT + 5.40, lz + roadDirZ * 1.38); dummy.updateMatrix(); bulbInst.setMatrixAt(i, dummy.matrix);
        dummy.position.set(lx + roadDirX * 1.38, 0.04, lz + roadDirZ * 1.38);
        dummy.rotation.set(-Math.PI / 2, 0, 0);
        dummy.updateMatrix();
        haloInst.setMatrixAt(i, dummy.matrix);
    });
    [baseInst, poleInst, armInst, headInst, bulbInst, haloInst].forEach(inst => {
        inst.instanceMatrix.needsUpdate = true;
        root.add(inst);
    });

    // 2. Boulevard & Plaza Benches
    const benchSpecs = [
        [-22, -14.8, 0], [-42, -14.8, 0], [-62, -14.8, 0],
        [22, -14.8, 0], [42, -14.8, 0], [62, -14.8, 0],
        [-22, 14.8, Math.PI], [-42, 14.8, Math.PI], [-62, 14.8, Math.PI],
        [22, 14.8, Math.PI], [42, 14.8, Math.PI], [62, 14.8, Math.PI],
        [-14.8, -22, Math.PI / 2], [-14.8, -42, Math.PI / 2], [-14.8, 22, Math.PI / 2], [-14.8, 42, Math.PI / 2],
        [14.8, -22, -Math.PI / 2], [14.8, -42, -Math.PI / 2], [14.8, 22, -Math.PI / 2], [14.8, 42, -Math.PI / 2],
        [-15.2, -15.2, Math.PI * 0.25], [15.2, -15.2, -Math.PI * 0.25],
        [-15.2, 15.2, Math.PI * 0.75], [15.2, 15.2, -Math.PI * 0.75]
    ];
    const seatInst = new THREE.InstancedMesh(new THREE.BoxGeometry(2.0, 0.08, 0.56), woodMat, benchSpecs.length);
    const backInst = new THREE.InstancedMesh(new THREE.BoxGeometry(2.0, 0.44, 0.08), woodMat, benchSpecs.length);
    const legInst = new THREE.InstancedMesh(new THREE.BoxGeometry(1.75, 0.44, 0.52), darkIronMat, benchSpecs.length);
    benchSpecs.forEach(([bx, bz, rot], i) => {
        dummy.scale.set(1, 1, 1);
        dummy.rotation.set(0, rot, 0);
        dummy.position.set(bx, SIDEWALK_HEIGHT + 0.46, bz); dummy.updateMatrix(); seatInst.setMatrixAt(i, dummy.matrix);
        dummy.position.set(bx - Math.sin(rot) * 0.24, SIDEWALK_HEIGHT + 0.74, bz - Math.cos(rot) * 0.24); dummy.updateMatrix(); backInst.setMatrixAt(i, dummy.matrix);
        dummy.position.set(bx, SIDEWALK_HEIGHT + 0.22, bz); dummy.updateMatrix(); legInst.setMatrixAt(i, dummy.matrix);
    });
    [seatInst, backInst, legInst].forEach(inst => {
        inst.instanceMatrix.needsUpdate = true;
        root.add(inst);
    });

    // 3. Realistic Botanical Urban Trees (Bark PBR + Forked 3D Limbs + Alpha-Cutout Leaf Sprig Cards)
    const treeCoords = [
        [-26, -13.6], [-48, -13.6], [-70, -13.6],
        [26, -13.6], [48, -13.6], [70, -13.6],
        [-26, 13.6], [-48, 13.6], [-70, 13.6],
        [26, 13.6], [48, 13.6], [70, 13.6],
        [-13.6, -28], [-13.6, -54], [-13.6, 28], [-13.6, 54],
        [13.6, -28], [13.6, -54], [13.6, 28], [13.6, 54],
        [-36, -34], [-60, 42], [58, 36], [36, -58], [62, -52], [-54, -62], [38, 60], [-36, 62]
    ];

    const barkPair = getBarkTextures();
    const barkMat = new THREE.MeshStandardMaterial({
        map: barkPair.map,
        bumpMap: barkPair.bumpMap,
        bumpScale: 0.12,
        roughness: 0.94,
        metalness: 0.0
    });
    const soilMat = new THREE.MeshStandardMaterial({ color: '#261c15', roughness: 0.95 });

    const grateInst = new THREE.InstancedMesh(new THREE.BoxGeometry(1.8, 0.04, 1.8), darkIronMat, treeCoords.length);
    const soilInst = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.54, 0.66, 0.08, 12), soilMat, treeCoords.length);
    const trunkInst = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.14, 0.28, 3.0, 9), barkMat, treeCoords.length);

    const limbGeo = new THREE.CylinderGeometry(0.055, 0.125, 2.05, 6);
    limbGeo.translate(0, 1.025, 0);
    const limbInst = new THREE.InstancedMesh(limbGeo, barkMat, treeCoords.length * 4);

    const cardsPerTree = 20;
    const foliageTex = createFoliageCardTexture();
    const leafCardMat = new THREE.MeshStandardMaterial({
        map: foliageTex,
        alphaTest: 0.42,
        side: THREE.DoubleSide,
        roughness: 0.85,
        metalness: 0.0,
        color: '#ffffff'
    });
    const leafInst = new THREE.InstancedMesh(new THREE.PlaneGeometry(1.95, 1.95), leafCardMat, treeCoords.length * cardsPerTree);

    const limbDummy = new THREE.Object3D();
    limbDummy.rotation.order = 'YXZ';
    const cardDummy = new THREE.Object3D();
    cardDummy.rotation.order = 'YXZ';

    const innerShade = new THREE.Color('#7f8f77');
    const midShade = new THREE.Color('#c2cfb8');
    const sunShade = new THREE.Color('#f4f9ee');

    treeCoords.forEach(([tx, tz], i) => {
        const treeScale = 0.92 + ((i * 37) % 10) * 0.024;
        const treeYaw = i * 1.15;

        dummy.rotation.set(0, 0, 0);
        dummy.scale.set(1, 1, 1);
        dummy.position.set(tx, SIDEWALK_HEIGHT + 0.02, tz); dummy.updateMatrix(); grateInst.setMatrixAt(i, dummy.matrix);
        dummy.position.set(tx, SIDEWALK_HEIGHT + 0.05, tz); dummy.updateMatrix(); soilInst.setMatrixAt(i, dummy.matrix);

        dummy.position.set(tx, SIDEWALK_HEIGHT + 1.5 * treeScale, tz);
        dummy.rotation.set(0, treeYaw, 0);
        dummy.scale.set(treeScale, treeScale, treeScale);
        dummy.updateMatrix();
        trunkInst.setMatrixAt(i, dummy.matrix);

        // 4 structural 3D forked limbs visibly branching out into canopy
        for (let b = 0; b < 4; b++) {
            const az = treeYaw + b * (Math.PI * 0.5) + ((i + b) % 3) * 0.2;
            const tilt = 0.62 + (b % 2) * 0.14;
            limbDummy.position.set(tx, SIDEWALK_HEIGHT + 2.35 * treeScale, tz);
            limbDummy.rotation.set(tilt, az, 0);
            limbDummy.scale.set(treeScale, treeScale, treeScale);
            limbDummy.updateMatrix();
            limbInst.setMatrixAt(i * 4 + b, limbDummy.matrix);
        }

        // 20 crossed & tilted alpha-tested botanical foliage cards forming airy oak/plane crown
        for (let cIdx = 0; cIdx < cardsPerTree; cIdx++) {
            const isInner = cIdx < 6;
            const ang = treeYaw + cIdx * 2.39996;
            const layerT = cIdx / (cardsPerTree - 1);
            const r = (isInner ? 0.45 : (0.72 + (cIdx % 5) * 0.28)) * treeScale;
            const hOff = (3.15 + layerT * 2.45) * treeScale;

            cardDummy.position.set(tx + Math.cos(ang) * r, SIDEWALK_HEIGHT + hOff, tz + Math.sin(ang) * r);
            const pitch = isInner ? 0.35 : (0.55 + ((cIdx * 17) % 10) * 0.08);
            const roll = ((cIdx * 29) % 10) * 0.12 - 0.5;
            cardDummy.rotation.set(pitch, ang + (cIdx % 2 === 0 ? 0 : Math.PI * 0.48), roll);
            const cScale = (0.85 + ((cIdx * 13 + i) % 5) * 0.14) * treeScale;
            cardDummy.scale.set(cScale, cScale, cScale);
            cardDummy.updateMatrix();

            const outIdx = i * cardsPerTree + cIdx;
            leafInst.setMatrixAt(outIdx, cardDummy.matrix);
            leafInst.setColorAt(outIdx, isInner ? innerShade : (layerT > 0.65 ? sunShade : midShade));
        }
    });

    [grateInst, soilInst, trunkInst, limbInst, leafInst].forEach(inst => {
        inst.instanceMatrix.needsUpdate = true;
        if (inst.instanceColor) inst.instanceColor.needsUpdate = true;
        root.add(inst);
    });

    // 4. Sidewalk Bollards (Potelets) & Trash Bins
    const bollardCoords = [];
    [[-12.2, -12.2], [12.2, -12.2], [-12.2, 12.2], [12.2, 12.2]].forEach(([cx, cz]) => {
        const sx = Math.sign(cx);
        const sz = Math.sign(cz);
        bollardCoords.push(
            [cx + sx * 1.8, cz], [cx + sx * 3.6, cz], [cx + sx * 5.4, cz],
            [cx, cz + sz * 1.8], [cx, cz + sz * 3.6], [cx, cz + sz * 5.4]
        );
    });
    const bolInst = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.08, 0.09, 0.88, 8), darkIronMat, bollardCoords.length);
    const bolCapInst = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.085, 0.085, 0.14, 8), new THREE.MeshBasicMaterial({ color: '#e2e8f0' }), bollardCoords.length);
    bollardCoords.forEach(([bx, bz], i) => {
        dummy.scale.set(1, 1, 1);
        dummy.rotation.set(0, 0, 0);
        dummy.position.set(bx, SIDEWALK_HEIGHT + 0.44, bz); dummy.updateMatrix(); bolInst.setMatrixAt(i, dummy.matrix);
        dummy.position.set(bx, SIDEWALK_HEIGHT + 0.78, bz); dummy.updateMatrix(); bolCapInst.setMatrixAt(i, dummy.matrix);
    });
    bolInst.instanceMatrix.needsUpdate = true;
    bolCapInst.instanceMatrix.needsUpdate = true;
    root.add(bolInst, bolCapInst);

    const binCoords = [
        [-20, -14.8], [-60, -14.8], [20, -14.8], [60, -14.8],
        [-20, 14.8], [-60, 14.8], [20, 14.8], [60, 14.8],
        [-14.8, -20], [14.8, -20], [-14.8, 20], [14.8, 20]
    ];
    const binInst = new THREE.InstancedMesh(
        new THREE.CylinderGeometry(0.24, 0.22, 0.86, 10),
        new THREE.MeshStandardMaterial({ color: '#14532d', roughness: 0.55, metalness: 0.25 }),
        binCoords.length
    );
    binCoords.forEach(([bx, bz], i) => {
        dummy.position.set(bx, SIDEWALK_HEIGHT + 0.43, bz);
        dummy.scale.set(1, 1, 1);
        dummy.rotation.set(0, 0, 0);
        dummy.updateMatrix();
        binInst.setMatrixAt(i, dummy.matrix);
    });
    binInst.instanceMatrix.needsUpdate = true;
    root.add(binInst);

    // 5. Glass Bus Shelters (Abribus) with glowing poster frames
    const busCoords = [
        [-34, -13.6, 0], [34, -13.6, 0],
        [-34, 13.6, Math.PI], [34, 13.6, Math.PI]
    ];
    const glassMat = new THREE.MeshStandardMaterial({ color: '#93c5fd', transparent: true, opacity: 0.34, roughness: 0.08, metalness: 0.65 });
    const adMat = new THREE.MeshBasicMaterial({ color: '#38bdf8' });
    busCoords.forEach(([bx, bz, rot]) => {
        const bs = new THREE.Group();
        bs.position.set(bx, SIDEWALK_HEIGHT, bz);
        bs.rotation.y = rot;
        const roof = new THREE.Mesh(new THREE.BoxGeometry(4.4, 0.14, 1.65), darkIronMat); roof.position.set(0, 2.55, 0);
        const backGlass = new THREE.Mesh(new THREE.BoxGeometry(4.1, 2.3, 0.06), glassMat); backGlass.position.set(0, 1.25, -0.72);
        const postL = new THREE.Mesh(new THREE.BoxGeometry(0.1, 2.5, 0.1), darkIronMat); postL.position.set(-2.05, 1.25, -0.72);
        const postR = new THREE.Mesh(new THREE.BoxGeometry(0.1, 2.5, 0.1), darkIronMat); postR.position.set(2.05, 1.25, -0.72);
        const adBox = new THREE.Mesh(new THREE.BoxGeometry(0.18, 2.1, 1.35), darkIronMat); adBox.position.set(2.1, 1.15, -0.05);
        const adFace = new THREE.Mesh(new THREE.PlaneGeometry(1.15, 1.75), adMat);
        adFace.rotation.y = -Math.PI / 2;
        adFace.position.set(2.0, 1.15, -0.05);
        bs.add(roof, backGlass, postL, postR, adBox, adFace);
        root.add(bs);
    });

    // 6. Parisian Sidewalk Bistro Café Tables (Vinyl Row Inde)
    const cafeCoords = [[-22, 16.4], [-25, 16.4], [-28, 16.4], [-31, 16.4]];
    const tableTopGeo = new THREE.CylinderGeometry(0.42, 0.42, 0.05, 12);
    const tablePedGeo = new THREE.CylinderGeometry(0.05, 0.18, 0.72, 8);
    const marbleMat = new THREE.MeshStandardMaterial({ color: '#e2e8f0', roughness: 0.25 });
    cafeCoords.forEach(([cx, cz]) => {
        const top = new THREE.Mesh(tableTopGeo, marbleMat); top.position.set(cx, SIDEWALK_HEIGHT + 0.74, cz);
        const ped = new THREE.Mesh(tablePedGeo, darkIronMat); ped.position.set(cx, SIDEWALK_HEIGHT + 0.36, cz);
        root.add(top, ped);
    });

    // 7. Traffic Lights (Feux Tricolores) at the 4 central plaza corners
    const tlSpots = [
        [-12.2, -12.2, 0, 'NS'],
        [12.2, 12.2, Math.PI, 'NS'],
        [-12.2, 12.2, Math.PI / 2, 'EW'],
        [12.2, -12.2, -Math.PI / 2, 'EW']
    ];
    _trafficLightSets.length = 0;
    tlSpots.forEach(([tx, tz, rot, axis]) => {
        const tl = new THREE.Group();
        tl.position.set(tx, SIDEWALK_HEIGHT, tz);
        tl.rotation.y = rot;
        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.15, 5.2, 8), darkIronMat); post.position.y = 2.6;
        const arm = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.14, 3.2), darkIronMat); arm.position.set(0, 5.05, 1.5);
        const head = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.96, 0.34), darkIronMat); head.position.set(0, 4.7, 2.8);

        const redMat = new THREE.MeshBasicMaterial({ color: '#ef4444' });
        const ambMat = new THREE.MeshBasicMaterial({ color: '#332508' });
        const grnMat = new THREE.MeshBasicMaterial({ color: '#072e1c' });
        const bulbR = new THREE.Mesh(new THREE.SphereGeometry(0.11, 8, 8), redMat); bulbR.position.set(0, 4.98, 2.96);
        const bulbA = new THREE.Mesh(new THREE.SphereGeometry(0.11, 8, 8), ambMat); bulbA.position.set(0, 4.70, 2.96);
        const bulbG = new THREE.Mesh(new THREE.SphereGeometry(0.11, 8, 8), grnMat); bulbG.position.set(0, 4.42, 2.96);

        tl.add(post, arm, head, bulbR, bulbA, bulbG);
        root.add(tl);
        _trafficLightSets.push({ axis, redMat, ambMat, grnMat });
    });
}

export function buildCityWorld(scene) {
    if (_cityBuilt && _cityRoot) return _cityRoot;

    _colliders.length = 0;
    _landmarks.length = 0;
    _beacons.length = 0;
    _aviationLights.length = 0;
    _rotors.length = 0;
    _bldgEmissiveMats = [];

    const root = new THREE.Group();
    root.name = 'BounceCityWorld';
    root.visible = false;

    const roadTex = createRoadAsphaltTexture();
    const groundMat = new THREE.MeshStandardMaterial({
        map: roadTex,
        roughness: 0.62,
        metalness: 0.10
    });
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(320, 320), groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0;
    ground.receiveShadow = true;
    root.add(ground);

    buildSidewalkSlabs(root);
    buildCentralFountain(root);

    addLandmarkBuilding(root, {
        id: 'bedroom',
        title: 'Résidence Nord',
        subtitle: 'Rentrer dans ta Chambre (4e Étage)',
        district: 'BANLIEUE NORD',
        x: -44, z: -42, w: 15, h: 14, d: 15,
        tx: -28, tz: -24,
        style: 'brick_nw',
        accentHex: '#f59e0b',
        billboardTag: 'SAFEHOUSE · PALIER 1-3'
    });

    addLandmarkBuilding(root, {
        id: 'vinyl_shop',
        title: 'Vinyl Row · Disquaire',
        subtitle: 'Digger des Samples & Licences',
        district: 'VINYL ROW INDÉ',
        x: -46, z: 44, w: 14, h: 12, d: 14,
        tx: -28, tz: 26,
        style: 'haussmann_sw',
        accentHex: '#10b981',
        billboardTag: 'SAMPLES & VINYLS'
    });

    addLandmarkBuilding(root, {
        id: 'gear_shop',
        title: 'Studio+ Matos Pro',
        subtitle: 'Acheter du Matos & Plugins',
        district: 'VINYL ROW INDÉ',
        x: -22, z: 68, w: 13, h: 13, d: 12,
        tx: -22, tz: 52,
        style: 'haussmann_sw',
        accentHex: '#38bdf8',
        billboardTag: 'HARDWARE STORE'
    });

    addLandmarkBuilding(root, {
        id: 'showcase_club',
        title: 'Club Bounce Live',
        subtitle: 'Lancer un Showcase CCTV',
        district: 'AVENUE DES CLUBS',
        x: 46, z: 44, w: 17, h: 14, d: 16,
        tx: 28, tz: 26,
        style: 'club_se',
        accentHex: '#a855f7',
        billboardTag: 'LIVE CONCERT & CCTV'
    });

    addLandmarkBuilding(root, {
        id: 'pro_studio',
        title: 'Tour 42e · Studio Pro',
        subtitle: 'Mon Penthouse 42e / Label HQ',
        district: 'DISTRICT 42',
        x: 48, z: -46, w: 17, h: 44, d: 17,
        tx: 28, tz: -26,
        style: 'tower_ne',
        accentHex: '#fbbf24',
        billboardTag: 'LABEL HQ · STUDIO PRO',
        billboardKind: 'label'
    });

    addLandmarkBuilding(root, {
        id: 'rival_hq',
        title: 'QG Pire Ennemi',
        subtitle: 'Beat Battle & Top 10 Rival',
        district: 'DISTRICT 42',
        x: 24, z: -72, w: 14, h: 28, d: 14,
        tx: 24, tz: -54,
        style: 'club_se',
        accentHex: '#fb7185',
        billboardTag: 'PIERRE ANGULAIRE // RIVAL',
        billboardKind: 'rival'
    });

    buildInstancedArchitecture(root);
    buildStreetFurniture(root);

    scene.add(root);
    _cityRoot = root;
    _cityBuilt = true;
    refreshCityDynamicSigns();
    return _cityRoot;
}

export function getCityColliders() {
    return _colliders;
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

    for (let i = 0; i < _beacons.length; i++) {
        const b = _beacons[i];
        const s = 1 + Math.sin(tSec * 3.0 + i) * 0.12;
        b.ring.scale.set(s, s, 1);
        b.beam.material.opacity = 0.18 + Math.sin(tSec * 2.5 + i) * 0.08;
    }

    if (_fountainWaterMesh) {
        _fountainWaterMesh.material.emissiveIntensity = 0.38 + Math.sin(tSec * 3.4) * 0.14;
    }
    if (_waterDropInst && _waterSeeds.length > 0) {
        const m = new THREE.Matrix4();
        for (let i = 0; i < _waterSeeds.length; i++) {
            const seed = _waterSeeds[i];
            const p = (seed.phase + tSec * seed.speed) % 1;
            const r = 0.25 + p * seed.radiusMax;
            const y = 2.95 + Math.sin(p * Math.PI) * 1.15 - p * 2.35;
            const sc = 0.75 + Math.sin(p * Math.PI) * 0.6;
            m.makeScale(sc, sc, sc);
            m.setPosition(Math.cos(seed.angle) * r, y, Math.sin(seed.angle) * r);
            _waterDropInst.setMatrixAt(i, m);
        }
        _waterDropInst.instanceMatrix.needsUpdate = true;
    }

    for (let i = 0; i < _rotors.length; i++) {
        _rotors[i].rotation.z = tSec * 0.85;
    }
    const blinkOn = Math.sin(tSec * 3.2) > 0.1;
    for (let i = 0; i < _aviationLights.length; i++) {
        _aviationLights[i].material.color.set(blinkOn ? '#ef4444' : '#3b0a0a');
    }

    const cycle = tSec % 16;
    for (let i = 0; i < _trafficLightSets.length; i++) {
        const tl = _trafficLightSets[i];
        const isNs = tl.axis === 'NS';
        const phase = isNs ? cycle : (cycle + 8) % 16;
        const green = phase < 6.2;
        const amber = phase >= 6.2 && phase < 8.0;
        const red = phase >= 8.0;
        tl.grnMat.color.set(green ? '#22c55e' : '#052e16');
        tl.ambMat.color.set(amber ? '#f59e0b' : '#2e1d05');
        tl.redMat.color.set(red ? '#ef4444' : '#3b0909');
    }

    if (window.skyDomeMesh && playerPos) {
        window.skyDomeMesh.position.set(playerPos.x, 0, playerPos.z);
    }

    const tMins = (typeof globalThis.state === 'object' && globalThis.state && typeof globalThis.state.timeMins === 'number')
        ? globalThis.state.timeMins
        : 1080;
    const hr = ((tMins % 1440) + 1440) % 1440 / 60;
    const isNight = (hr >= 20.5 || hr < 6);
    const isGolden = (hr >= 17 && hr < 20.5) || (hr >= 6 && hr < 8.5);

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
        if (!globalThis.scene.fog) globalThis.scene.fog = new THREE.FogExp2(fogHex, 0.0052);
        globalThis.scene.fog.color.set(fogHex);
        globalThis.scene.fog.density = isNight ? 0.0060 : 0.0040;
    }
    if (globalThis.hemiLight) {
        globalThis.hemiLight.intensity = isNight ? 0.72 : (isGolden ? 0.95 : 1.18);
    }
    if (globalThis.dirLight) {
        globalThis.dirLight.position.set(60, 85, 45);
        globalThis.dirLight.intensity = isNight ? 0.55 : (isGolden ? 1.38 : 1.85);
        globalThis.dirLight.color.set(isNight ? '#9fb9ff' : (isGolden ? '#ffc38a' : '#fff8ec'));
    }
    if (globalThis.ceilingLight) globalThis.ceilingLight.intensity = 0;
    if (globalThis.deskBiasLight) globalThis.deskBiasLight.intensity = 0;
    if (globalThis.windowBounceLight) globalThis.windowBounceLight.intensity = 0;

    // Realistic glass: reflective & dark during daylight, glowing warm interiors only at golden hour / night
    const emBoost = isNight ? 0.95 : (isGolden ? 0.45 : 0.05);
    for (let i = 0; i < _bldgEmissiveMats.length; i++) {
        _bldgEmissiveMats[i].emissiveIntensity = emBoost;
    }
    if (_lampHaloMat) {
        _lampHaloMat.opacity = isNight ? 0.24 : (isGolden ? 0.14 : 0.02);
    }
}
