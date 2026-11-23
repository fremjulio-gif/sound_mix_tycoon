import { THREE } from '../core/libs.js';
import { getCityGroundHeight, getCityLandmarks } from './city-world.js';

const PED_COUNT = 64;
const CAR_COUNT = 22;

let _npcRoot = null;
let _pedData = [];
let _carData = [];
let _tramUnits = [];
let _pedMeshes = null;
let _carMeshes = null;

let _vipGroup = null;
let _vipEntities = [];
let _billboardGroup = null;
const _billboards = [];

const _dummy = new THREE.Object3D();
const _legDummy = new THREE.Object3D();

function makeDefaultPedestrianHubs() {
    return [
        [-20.3, -516.9], // Tour Bretagne esplanade
        [-501.2, 756.4], // Stereolux / Nefs
        [356.2, -224.2], // Bouffay
        [-196.7, 581.6], // Quartier Creation
        [680.8, 97.8],   // Olivettes
        [-617.2, 256.4], // Quai de la Fosse
        [455.0, -385.0], // Chateau esplanade
        [-145.0, -210.0] // Place Royale
    ];
}

function buildPedestrians(root) {
    const jacketPalette = [
        '#1f2937', '#e5e7eb', '#1e3a8a', '#7f1d1d',
        '#365314', '#b45309', '#312e81', '#0f766e', '#52525b'
    ].map(h => new THREE.Color(h));

    const skinPalette = [
        '#f1c27d', '#e0ac69', '#c68642', '#8d5524', '#60391f', '#ffdbac'
    ].map(h => new THREE.Color(h));

    const torsoGeo = new THREE.BoxGeometry(0.42, 0.62, 0.24);
    const headGeo = new THREE.SphereGeometry(0.16, 8, 8);
    const legGeoL = new THREE.BoxGeometry(0.15, 0.68, 0.16);
    legGeoL.translate(0, -0.34, 0);
    const legGeoR = new THREE.BoxGeometry(0.15, 0.68, 0.16);
    legGeoR.translate(0, -0.34, 0);

    const torsoMat = new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.78 });
    const headMat = new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.65 });
    const pantsMat = new THREE.MeshStandardMaterial({ color: '#111827', roughness: 0.85 });

    const torsoInst = new THREE.InstancedMesh(torsoGeo, torsoMat, PED_COUNT);
    const headInst = new THREE.InstancedMesh(headGeo, headMat, PED_COUNT);
    const legLInst = new THREE.InstancedMesh(legGeoL, pantsMat, PED_COUNT);
    const legRInst = new THREE.InstancedMesh(legGeoR, pantsMat, PED_COUNT);

    [torsoInst, headInst, legLInst, legRInst].forEach(inst => {
        inst.frustumCulled = false;
    });

    const hubs = makeDefaultPedestrianHubs();
    _pedData = [];
    const initMat = new THREE.Matrix4();

    for (let i = 0; i < PED_COUNT; i++) {
        const [hx, hz] = hubs[i % hubs.length];
        const r = 10 + (i % 4) * 5;
        const pts = [
            [hx - r, hz - r],
            [hx + r, hz - r],
            [hx + r, hz + r],
            [hx - r, hz + r]
        ];
        const segIdx = Math.floor(i / hubs.length) % pts.length;
        const tSeg = (i * 0.37) % 1;
        const a = pts[segIdx];
        const b = pts[(segIdx + 1) % pts.length];
        const px = a[0] + (b[0] - a[0]) * tSeg;
        const pz = a[1] + (b[1] - a[1]) * tSeg;

        _pedData.push({
            pts,
            segIdx,
            tSeg,
            dir: (i % 2 === 0) ? 1 : -1,
            speed: 1.35 + (i % 5) * 0.2,
            phase: i * 0.85,
            x: px,
            z: pz,
            yaw: Math.atan2(b[0] - a[0], b[1] - a[1])
        });

        torsoInst.setColorAt(i, jacketPalette[i % jacketPalette.length]);
        headInst.setColorAt(i, skinPalette[i % skinPalette.length]);
        const gy = getCityGroundHeight(px, pz);
        initMat.makeTranslation(px, gy + 1.0, pz);
        torsoInst.setMatrixAt(i, initMat);
        headInst.setMatrixAt(i, initMat);
        legLInst.setMatrixAt(i, initMat);
        legRInst.setMatrixAt(i, initMat);
    }

    if (torsoInst.instanceColor) torsoInst.instanceColor.needsUpdate = true;
    if (headInst.instanceColor) headInst.instanceColor.needsUpdate = true;
    [torsoInst, headInst, legLInst, legRInst].forEach(inst => {
        inst.instanceMatrix.needsUpdate = true;
        root.add(inst);
    });

    _pedMeshes = { torsoInst, headInst, legLInst, legRInst };
}

function polylineLength(pts) {
    let total = 0;
    for (let i = 0; i < pts.length - 1; i++) {
        total += Math.hypot(pts[i + 1][0] - pts[i][0], pts[i + 1][1] - pts[i][1]);
    }
    return total;
}

function samplePolyline(pts, dist) {
    let acc = 0;
    for (let i = 0; i < pts.length - 1; i++) {
        const a = pts[i];
        const b = pts[i + 1];
        const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
        if (len < 0.05) continue;
        if (acc + len >= dist || i === pts.length - 2) {
            const t = Math.max(0, Math.min(1, (dist - acc) / len));
            const x = a[0] + (b[0] - a[0]) * t;
            const z = a[1] + (b[1] - a[1]) * t;
            const yaw = Math.atan2(b[0] - a[0], b[1] - a[1]);
            return { x, z, yaw };
        }
        acc += len;
    }
    return { x: pts[0][0], z: pts[0][1], yaw: 0 };
}

function buildTraffic(root) {
    const carPalette = [
        '#111827', '#f8fafc', '#94a3b8', '#1e3a8a',
        '#7f1d1d', '#334155', '#065f46', '#4b5563'
    ].map(h => new THREE.Color(h));

    const chassisGeo = new THREE.BoxGeometry(1.85, 0.58, 4.15);
    const cabinGeo = new THREE.BoxGeometry(1.62, 0.50, 2.15);
    const axleGeo = new THREE.BoxGeometry(1.94, 0.36, 0.68);
    const lightGeo = new THREE.BoxGeometry(0.32, 0.12, 0.08);

    const chassisMat = new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.25, metalness: 0.65 });
    const cabinMat = new THREE.MeshStandardMaterial({ color: '#0f172a', roughness: 0.12, metalness: 0.82 });
    const tireMat = new THREE.MeshStandardMaterial({ color: '#090b10', roughness: 0.88 });
    const headMat = new THREE.MeshBasicMaterial({ color: '#fef9c3' });
    const tailMat = new THREE.MeshBasicMaterial({ color: '#ef4444' });

    const chassisInst = new THREE.InstancedMesh(chassisGeo, chassisMat, CAR_COUNT);
    const cabinInst = new THREE.InstancedMesh(cabinGeo, cabinMat, CAR_COUNT);
    const axleInst = new THREE.InstancedMesh(axleGeo, tireMat, CAR_COUNT * 2);
    const headInst = new THREE.InstancedMesh(lightGeo, headMat, CAR_COUNT * 2);
    const tailInst = new THREE.InstancedMesh(lightGeo, tailMat, CAR_COUNT * 2);

    [chassisInst, cabinInst, axleInst, headInst, tailInst].forEach(inst => {
        inst.frustumCulled = false;
    });

    const defaultPath = [[-50, -516], [-10, -516], [-10, -470]];
    _carData = [];
    const initMat = new THREE.Matrix4();

    for (let i = 0; i < CAR_COUNT; i++) {
        _carData.push({
            pts: defaultPath,
            len: polylineLength(defaultPath),
            dist: (i * 15) % 80,
            dir: (i % 2 === 0) ? 1 : -1,
            baseSpeed: 10.0 + (i % 4) * 1.6,
            speed: 10.0 + (i % 4) * 1.6,
            x: defaultPath[0][0],
            z: defaultPath[0][1],
            yaw: 0
        });
        chassisInst.setColorAt(i, carPalette[i % carPalette.length]);
        initMat.makeTranslation(0, 0.45, 0);
        chassisInst.setMatrixAt(i, initMat);
        cabinInst.setMatrixAt(i, initMat);
        axleInst.setMatrixAt(i * 2, initMat);
        axleInst.setMatrixAt(i * 2 + 1, initMat);
        headInst.setMatrixAt(i * 2, initMat);
        headInst.setMatrixAt(i * 2 + 1, initMat);
        tailInst.setMatrixAt(i * 2, initMat);
        tailInst.setMatrixAt(i * 2 + 1, initMat);
    }

    if (chassisInst.instanceColor) chassisInst.instanceColor.needsUpdate = true;
    [chassisInst, cabinInst, axleInst, headInst, tailInst].forEach(inst => {
        inst.instanceMatrix.needsUpdate = true;
        root.add(inst);
    });

    _carMeshes = { chassisInst, cabinInst, axleInst, headInst, tailInst };
}

function createTramHeadsignTexture(code, accentHex) {
    const c = document.createElement('canvas');
    c.width = 128; c.height = 48;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#090d14';
    ctx.fillRect(0, 0, 128, 48);
    ctx.fillStyle = accentHex || '#10b981';
    ctx.fillRect(4, 4, 42, 40);
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 24px ui-monospace, Menlo, monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(code || 'T1', 25, 25);
    ctx.fillStyle = '#fef08a';
    ctx.font = 'bold 14px ui-monospace, Menlo, monospace';
    ctx.textAlign = 'left';
    ctx.fillText('NANTES', 54, 25);
    const tex = new THREE.CanvasTexture(c);
    if ('colorSpace' in tex && THREE.SRGBColorSpace) tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
}

function buildTanTramways(root, tramLinesOrRoutes, tramStops = []) {
    _tramUnits.forEach(tr => {
        if (tr.parts) tr.parts.forEach(p => root.remove(p));
        else if (tr.group) root.remove(tr.group);
    });
    _tramUnits = [];
    if (!Array.isArray(tramLinesOrRoutes) || tramLinesOrRoutes.length === 0) return;

    // Normalize both stitched manifest.tramLines objects and legacy raw polylines
    const normalized = tramLinesOrRoutes
        .map((item, i) => {
            if (Array.isArray(item)) {
                return { line: `T${(i % 3) + 1}`, color: '#10b981', doubleTrack: true, pts: item };
            }
            return {
                line: item.line || `T${(i % 3) + 1}`,
                color: item.color || '#10b981',
                doubleTrack: item.doubleTrack !== false,
                pts: item.pts || []
            };
        })
        .filter(r => Array.isArray(r.pts) && r.pts.length >= 2 && polylineLength(r.pts) >= 120)
        .sort((a, b) => polylineLength(b.pts) - polylineLength(a.pts))
        .slice(0, 4);

    if (normalized.length === 0) return;

    const whiteBodyMat = new THREE.MeshStandardMaterial({ color: '#f8fafc', roughness: 0.24, metalness: 0.28 });
    const skirtMat = new THREE.MeshStandardMaterial({ color: '#1e293b', roughness: 0.58, metalness: 0.45 });
    const roofMat = new THREE.MeshStandardMaterial({ color: '#cbd5e1', roughness: 0.48, metalness: 0.35 });
    const greenStripeMat = new THREE.MeshStandardMaterial({ color: '#10b981', roughness: 0.32, metalness: 0.22 });
    const bellowsMat = new THREE.MeshStandardMaterial({ color: '#111827', roughness: 0.85, metalness: 0.15 });
    const pantoMat = new THREE.MeshStandardMaterial({ color: '#94a3b8', roughness: 0.3, metalness: 0.85 });
    const winMat = new THREE.MeshStandardMaterial({
        color: '#0f172a',
        emissive: '#fde68a',
        emissiveIntensity: 0.32,
        roughness: 0.12,
        metalness: 0.82
    });
    const cabGlassMat = new THREE.MeshStandardMaterial({ color: '#090f1a', roughness: 0.08, metalness: 0.9 });

    const makeCarModule = (isCab, cabSign, lineAccentMat, headSignMat, lightMat) => {
        const g = new THREE.Group();
        const len = isCab ? 6.8 : 7.0;
        // Lower bogie/wheel skirt
        const skirt = new THREE.Mesh(new THREE.BoxGeometry(2.38, 0.56, len - 0.15), skirtMat);
        skirt.position.set(0, 0.42, 0);
        // Main pearl-white body shell
        const body = new THREE.Mesh(new THREE.BoxGeometry(2.44, 2.48, len), whiteBodyMat);
        body.position.set(0, 1.94, 0);
        // Signature TAN/Naolib emerald waist stripe + line accent trim
        const greenBand = new THREE.Mesh(new THREE.BoxGeometry(2.48, 0.34, len + 0.04), greenStripeMat);
        greenBand.position.set(0, 0.94, 0);
        const lineTrim = new THREE.Mesh(new THREE.BoxGeometry(2.49, 0.12, len + 0.05), lineAccentMat);
        lineTrim.position.set(0, 3.02, 0);
        // Panoramic cabin windows with warm evening glow
        const winBand = new THREE.Mesh(new THREE.BoxGeometry(2.47, 1.24, len - 0.65), winMat);
        winBand.position.set(0, 2.04, 0);
        // Roof fairing
        const roof = new THREE.Mesh(new THREE.BoxGeometry(2.15, 0.22, len - 0.3), roofMat);
        roof.position.set(0, 3.28, 0);
        g.add(skirt, body, greenBand, lineTrim, winBand, roof);

        if (isCab) {
            // Aerodynamic tapered cab nose facing cabSign * +Z
            const noseZ = cabSign * (len * 0.5 + 0.38);
            const nose = new THREE.Mesh(new THREE.BoxGeometry(2.26, 1.25, 0.78), whiteBodyMat);
            nose.position.set(0, 1.28, noseZ);
            const windshield = new THREE.Mesh(new THREE.BoxGeometry(2.18, 1.38, 0.64), cabGlassMat);
            windshield.position.set(0, 2.38, noseZ - cabSign * 0.08);
            windshield.rotation.x = cabSign * 0.24;
            const signMesh = new THREE.Mesh(new THREE.PlaneGeometry(1.42, 0.42), headSignMat);
            signMesh.position.set(0, 2.86, noseZ + cabSign * 0.30);
            if (cabSign < 0) signMesh.rotation.y = Math.PI;
            const lampL = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.16, 0.10), lightMat);
            lampL.position.set(-0.76, 0.92, noseZ + cabSign * 0.38);
            const lampR = lampL.clone();
            lampR.position.x = 0.76;
            g.add(nose, windshield, signMesh, lampL, lampR);
        } else {
            // Center module roof HVAC pods + diamond steel pantograph reaching overhead wire (y ~ 5.05m)
            const hvacA = new THREE.Mesh(new THREE.BoxGeometry(1.45, 0.32, 1.65), roofMat);
            hvacA.position.set(0, 3.52, -1.8);
            const hvacB = hvacA.clone();
            hvacB.position.z = 1.8;
            const armLower = new THREE.Mesh(new THREE.BoxGeometry(0.10, 1.05, 0.10), pantoMat);
            armLower.position.set(0, 3.85, -0.35);
            armLower.rotation.x = 0.48;
            const armUpper = new THREE.Mesh(new THREE.BoxGeometry(0.10, 1.05, 0.10), pantoMat);
            armUpper.position.set(0, 4.55, -0.35);
            armUpper.rotation.x = -0.48;
            const collector = new THREE.Mesh(new THREE.BoxGeometry(1.45, 0.08, 0.14), pantoMat);
            collector.position.set(0, 5.02, 0.0);
            g.add(hvacA, hvacB, armLower, armUpper, collector);
        }
        return g;
    };

    const stopsClean = Array.isArray(tramStops) ? tramStops : [];

    // Spawn 2 articulated trams per stitched line (opposite directions on their own right-hand tracks)
    normalized.forEach((route, rIdx) => {
        const totalLen = polylineLength(route.pts);
        const lineAccentMat = new THREE.MeshStandardMaterial({ color: route.color, roughness: 0.35, metalness: 0.25 });
        const headSignMat = new THREE.MeshBasicMaterial({ map: createTramHeadsignTexture(route.line, route.color) });

        [1, -1].forEach((dir, dIdx) => {
            const frontLightMat = new THREE.MeshBasicMaterial({ color: '#fef9c3' });
            const rearLightMat = new THREE.MeshBasicMaterial({ color: '#ef4444' });

            const carFront = makeCarModule(true, 1, lineAccentMat, headSignMat, frontLightMat);
            const carMid = makeCarModule(false, 0, lineAccentMat, headSignMat, null);
            const carRear = makeCarModule(true, -1, lineAccentMat, headSignMat, rearLightMat);
            const bellowsA = new THREE.Mesh(new THREE.BoxGeometry(2.14, 2.55, 1.15), bellowsMat);
            const bellowsB = new THREE.Mesh(new THREE.BoxGeometry(2.14, 2.55, 1.15), bellowsMat);

            const parts = [carFront, bellowsA, carMid, bellowsB, carRear];
            parts.forEach(p => root.add(p));

            const startFrac = (rIdx * 0.23 + dIdx * 0.48) % 0.86 + 0.07;
            _tramUnits.push({
                pts: route.pts,
                len: totalLen,
                doubleTrack: route.doubleTrack,
                dist: startFrac * totalLen,
                dir,
                speed: 11.2,
                stopTimer: 0,
                lastStopIdx: -1,
                stops: stopsClean,
                carFront,
                carMid,
                carRear,
                bellowsA,
                bellowsB,
                parts,
                frontLightMat,
                rearLightMat
            });
        });
    });
}

function createNameplateSprite(name, badge, accentHex) {
    const c = document.createElement('canvas');
    c.width = 512;
    c.height = 128;
    const ctx = c.getContext('2d');

    ctx.fillStyle = 'rgba(7, 9, 15, 0.88)';
    ctx.beginPath();
    ctx.roundRect(14, 14, 484, 100, 18);
    ctx.fill();
    ctx.strokeStyle = accentHex;
    ctx.lineWidth = 5;
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.fillStyle = accentHex;
    ctx.font = 'bold 20px ui-monospace, Menlo, monospace';
    ctx.fillText(String(badge || '').toUpperCase().slice(0, 32), 256, 48);

    ctx.fillStyle = '#ffffff';
    ctx.font = '900 34px Outfit, sans-serif';
    ctx.fillText(String(name || '').slice(0, 22), 256, 94);

    const tex = new THREE.CanvasTexture(c);
    if ('colorSpace' in tex && THREE.SRGBColorSpace) tex.colorSpace = THREE.SRGBColorSpace;
    const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false });
    const sp = new THREE.Sprite(mat);
    sp.scale.set(2.4, 0.6, 1);
    return sp;
}

export function syncCityVipNpcs() {
    if (!_vipGroup) return;
    while (_vipGroup.children.length > 0) {
        _vipGroup.remove(_vipGroup.children[0]);
    }
    _vipEntities = [];

    const st = (typeof globalThis.state === 'object' && globalThis.state) ? globalThis.state : {};
    const rivalName = (st.rivalState && st.rivalState.name) ? st.rivalState.name : 'KROWN // 808';

    // Positioned directly beside the 6 real obstacle-free Nantes spots
    const roster = [
        {
            id: 'vip_zandame',
            name: 'Zandame',
            role: '🎤 RAPPEUR · STEREOLUX',
            kind: 'rapper',
            x: -494.5, z: 753.0, yaw: -Math.PI * 0.75,
            style: 2, tier: 4, variant: 0,
            accentHex: '#a855f7',
            quote: "Zandame : « Ton 808 résonne sur toute l'Île de Nantes ! Passe au Showcase à Stereolux. »"
        },
        {
            id: 'vip_joule',
            name: 'Joule',
            role: '💿 PLATINE · BOUNCE NANTES',
            kind: 'rapper',
            x: -507.5, z: 752.5, yaw: Math.PI * 0.65,
            style: 3, tier: 4, variant: 0,
            accentHex: '#fbbf24',
            quote: "Joule : « Y'a du monde sur le parvis des Nefs ce soir, balance un banger ! »"
        },
        {
            id: 'vip_disiznot',
            name: 'Disiznot',
            role: '📀 DIGGER · BOUFFAY',
            kind: 'rapper',
            x: 350.5, z: -220.5, yaw: Math.PI * 0.4,
            style: 0, tier: 3, variant: 0,
            accentHex: '#10b981',
            quote: "Disiznot : « Je viens de chiner des vinyles rares rue du Bouffay, viens écouter ça. »"
        },
        {
            id: 'vip_rosmii',
            name: 'Rosmii',
            role: '🎹 BEATMAKER · CRÉATION',
            kind: 'rapper',
            x: -190.5, z: 577.5, yaw: Math.PI * 0.85,
            style: 1, tier: 2, variant: 0,
            accentHex: '#38bdf8',
            quote: "Rosmii : « Le Quartier de la Création bouge bien ce soir, Studio+ a du matos neuf ! »"
        },
        {
            id: 'vip_rival_scout',
            name: rivalName,
            role: '⚔️ CREW RIVAL · QUAI DE LA FOSSE',
            kind: 'rival',
            x: -611.0, z: 252.0, yaw: Math.PI * 0.25,
            style: 2, tier: 3, variant: 1,
            accentHex: '#fb7185',
            quote: `${rivalName} : « On tient le Quai de la Fosse et les panneaux du Pont Anne-de-Bretagne — viens battle ! »`
        }
    ];

    const signedIds = Array.isArray(st.signedArtists) ? st.signedArtists : [];
    const labelCatalog = Array.isArray(globalThis.LABEL_ARTIST_ROSTER) ? globalThis.LABEL_ARTIST_ROSTER : [];
    const proCoords = [
        { x: -14.2, z: -519.5, yaw: -Math.PI * 0.4 },
        { x: -26.5, z: -520.2, yaw: Math.PI * 0.2 }
    ];

    if (signedIds.length > 0 && labelCatalog.length > 0) {
        signedIds.slice(0, 2).forEach((artId, idx) => {
            const meta = labelCatalog.find(a => a.id === artId) || labelCatalog[idx % labelCatalog.length];
            const pos = proCoords[idx];
            roster.push({
                id: `signed_${meta.id}`,
                name: meta.name,
                role: '✍️ ARTISTE · TOUR BRETAGNE',
                kind: 'artist',
                x: pos.x, z: pos.z, yaw: pos.yaw,
                style: meta.avatarStyle ?? (idx % 4), tier: 4, variant: idx % 2,
                accentHex: '#fbbf24',
                quote: `${meta.name} : « ${meta.quote} »`
            });
        });
    } else {
        roster.push({
            id: 'street_fto',
            name: 'Fto',
            role: '🎧 CONNEXION · OLIVETTES',
            kind: 'contact',
            x: 675.0, z: 95.0, yaw: Math.PI * 0.25,
            style: 1, tier: 1, variant: 0,
            accentHex: '#f59e0b',
            quote: "Fto : « Tout le quartier des Olivettes guette ta prochaine prod ! »"
        });
    }

    const avatarFn = (typeof globalThis.createAvatarGroup === 'function') ? globalThis.createAvatarGroup : null;
    const standMat = new THREE.MeshStandardMaterial({ color: '#1e293b', roughness: 0.7 });

    roster.forEach((npc, idx) => {
        const y = getCityGroundHeight(npc.x, npc.z);
        const holder = new THREE.Group();
        holder.position.set(npc.x, y, npc.z);
        holder.rotation.y = npc.yaw;

        if (avatarFn) {
            const av = avatarFn(npc.style, npc.tier, npc.variant);
            av.position.y = 0;
            holder.add(av);
        } else {
            const fallback = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.32, 1.7, 10), standMat);
            fallback.position.y = 0.85;
            holder.add(fallback);
        }

        const halo = new THREE.Mesh(
            new THREE.RingGeometry(0.55, 0.72, 20),
            new THREE.MeshBasicMaterial({ color: npc.accentHex, side: THREE.DoubleSide, transparent: true, opacity: 0.65 })
        );
        halo.rotation.x = -Math.PI / 2;
        halo.position.y = 0.03;
        holder.add(halo);

        const plate = createNameplateSprite(npc.name, npc.role, npc.accentHex);
        plate.position.set(0, 2.38, 0);
        holder.add(plate);

        _vipGroup.add(holder);
        _vipEntities.push({
            ...npc,
            y,
            baseYaw: npc.yaw,
            phase: idx * 1.3,
            group: holder
        });
    });
}

function drawBillboardPoster(bb) {
    const { canvas, tex, kind, variant } = bb;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    const st = (typeof globalThis.state === 'object' && globalThis.state) ? globalThis.state : {};
    const labelName = (st.labelName && String(st.labelName).trim()) ? String(st.labelName).toUpperCase().slice(0, 20) : '42E RECORDS';
    const rivalName = (st.rivalState && st.rivalState.name) ? String(st.rivalState.name).toUpperCase().slice(0, 20) : 'KROWN // 808';
    const tracks = Array.isArray(st.trackList) ? st.trackList : [];
    const signedCount = Array.isArray(st.signedArtists) ? st.signedArtists.length : 0;

    let goldCount = 0;
    let platCount = 0;
    let bestTrack = null;
    for (let i = 0; i < tracks.length; i++) {
        const sc = Number(tracks[i].score) || 0;
        if (sc >= 9.3) platCount++;
        else if (sc >= 8.5) goldCount++;
        if (!bestTrack || sc > (Number(bestTrack.score) || 0)) bestTrack = tracks[i];
    }

    ctx.fillStyle = '#070910';
    ctx.fillRect(0, 0, W, H);

    if (kind === 'label') {
        const grad = ctx.createLinearGradient(0, 0, W, H);
        grad.addColorStop(0, '#1e1608');
        grad.addColorStop(1, '#090d18');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, W, H);
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 10;
        ctx.strokeRect(12, 12, W - 24, H - 24);

        ctx.fillStyle = '#fbbf24';
        ctx.font = 'bold 24px ui-monospace, Menlo, monospace';
        ctx.textAlign = 'center';
        ctx.fillText(variant === 0 ? 'CAMPAGNE NANTES · LABEL HQ' : 'TOUR BRETAGNE · STUDIO PRO', W / 2, 74);

        ctx.fillStyle = '#ffffff';
        ctx.font = '900 58px Outfit, sans-serif';
        ctx.fillText(labelName, W / 2, 174);

        ctx.fillStyle = '#cbd5e1';
        ctx.font = 'bold 26px ui-monospace, Menlo, monospace';
        ctx.fillText(
            signedCount > 0 ? `${signedCount} ARTISTE(S) SIGNÉ(S) · NANTES` : 'NOUVEAU LABEL NANTAIS EN MONTÉE',
            W / 2, 260
        );
    } else if (kind === 'discs') {
        const grad = ctx.createLinearGradient(0, 0, W, H);
        grad.addColorStop(0, '#141724');
        grad.addColorStop(1, '#1d1508');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, W, H);
        ctx.strokeStyle = platCount > 0 ? '#e2e8f0' : '#f59e0b';
        ctx.lineWidth = 10;
        ctx.strokeRect(12, 12, W - 24, H - 24);

        const cx = 115, cy = H / 2;
        const discGrad = ctx.createRadialGradient(cx - 18, cy - 18, 12, cx, cy, 78);
        discGrad.addColorStop(0, '#ffffff');
        discGrad.addColorStop(0.55, platCount > 0 ? '#cbd5e1' : '#fbbf24');
        discGrad.addColorStop(1, platCount > 0 ? '#64748b' : '#b45309');
        ctx.fillStyle = discGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, 78, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#090b10';
        ctx.beginPath();
        ctx.arc(cx, cy, 18, 0, Math.PI * 2);
        ctx.fill();

        ctx.textAlign = 'left';
        ctx.fillStyle = '#fbbf24';
        ctx.font = 'bold 21px ui-monospace, Menlo, monospace';
        ctx.fillText('CERTIFICATIONS & CHARTS', 214, 82);

        ctx.fillStyle = '#ffffff';
        ctx.font = '900 32px Outfit, sans-serif';
        const certLine = (goldCount + platCount) > 0
            ? `${platCount} PLATINE · ${goldCount} OR`
            : "OBJECTIF DISQUE D'OR";
        ctx.fillText(certLine, 214, 148);

        ctx.fillStyle = '#cbd5e1';
        ctx.font = 'bold 20px ui-monospace, Menlo, monospace';
        const hitLine = bestTrack
            ? `HIT #1 : ${(bestTrack.title || 'UNTITLED').toUpperCase().slice(0, 15)} (${Number(bestTrack.score).toFixed(1)}/10)`
            : 'INDÉ EN MONTÉE · HIT EN PREP';
        ctx.fillText(hitLine, 214, 218);
        ctx.fillStyle = '#94a3b8';
        ctx.fillText(`SIGNÉ : ${labelName}`, 214, 266);
    } else if (kind === 'rival') {
        const grad = ctx.createLinearGradient(0, 0, W, H);
        grad.addColorStop(0, '#2a0912');
        grad.addColorStop(1, '#0c0810');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, W, H);
        ctx.strokeStyle = '#fb7185';
        ctx.lineWidth = 10;
        ctx.strokeRect(12, 12, W - 24, H - 24);

        const wonClash = Number(st.rivalState && st.rivalState.winsAgainst) || 0;
        ctx.textAlign = 'center';
        ctx.fillStyle = '#fb7185';
        ctx.font = 'bold 22px ui-monospace, Menlo, monospace';
        ctx.fillText('GUERRE D’IMAGE // LOIRE', W / 2, 72);

        ctx.fillStyle = '#ffffff';
        ctx.font = '900 48px Outfit, sans-serif';
        ctx.fillText(rivalName, W / 2, 152);

        ctx.fillStyle = '#fda4af';
        ctx.font = 'bold 24px ui-monospace, Menlo, monospace';
        const msg = wonClash > 0
            ? `"${rivalName} EN PANIQUE FACE À ${labelName} ?"`
            : `"${rivalName} TIENT NANTES — ${labelName} QUI ?"`;
        ctx.fillText(msg.slice(0, 44), W / 2, 232);
        ctx.fillStyle = '#94a3b8';
        ctx.font = 'bold 20px ui-monospace, Menlo, monospace';
        ctx.fillText('CLASH QUAI DE LA FOSSE', W / 2, 282);
    } else {
        ctx.fillStyle = '#090f1d';
        ctx.fillRect(0, 0, W, H);
        ctx.strokeStyle = variant === 0 ? '#38bdf8' : '#a855f7';
        ctx.lineWidth = 10;
        ctx.strokeRect(12, 12, W - 24, H - 24);
        ctx.textAlign = 'center';
        ctx.fillStyle = variant === 0 ? '#38bdf8' : '#c084fc';
        ctx.font = 'bold 24px ui-monospace, Menlo, monospace';
        ctx.fillText(variant === 0 ? 'ALGO-STREAM 360 · SATIRE' : 'ÎLE DE NANTES · CE SOIR', W / 2, 78);
        ctx.fillStyle = '#ffffff';
        ctx.font = '900 40px Outfit, sans-serif';
        ctx.fillText(variant === 0 ? '0.0003€ PAR STREAM' : 'STEREOLUX SHOWCASE', W / 2, 165);
        ctx.fillStyle = '#cbd5e1';
        ctx.font = 'bold 24px ui-monospace, Menlo, monospace';
        ctx.fillText(variant === 0 ? 'MERCI LES BEATMAKERS ♥' : 'BOUNCE LIVE · ENTRÉE OUVERTE', W / 2, 245);
    }

    tex.needsUpdate = true;
}

function buildStreetBillboards(root) {
    _billboards.length = 0;
    _billboardGroup = new THREE.Group();
    _billboardGroup.name = 'NantesStreetBillboards';

    const specs = [
        { kind: 'label', variant: 0, x: -32.0, z: -502.0, rotY: 0 },
        { kind: 'discs', variant: 0, x: -16.0, z: -498.0, rotY: -0.35 },
        { kind: 'label', variant: 1, x: 342.0, z: -215.0, rotY: -0.4 },
        { kind: 'discs', variant: 1, x: -182.0, z: 572.0, rotY: 0.25 },
        { kind: 'rival', variant: 0, x: -608.0, z: 245.0, rotY: 0.35 },
        { kind: 'rival', variant: 1, x: -514.0, z: 742.0, rotY: 0.5 },
        { kind: 'satire', variant: 0, x: 668.0, z: 92.0, rotY: -0.3 },
        { kind: 'satire', variant: 1, x: -484.0, z: 750.0, rotY: -0.45 }
    ];

    const steelMat = new THREE.MeshStandardMaterial({ color: '#1e293b', metalness: 0.8, roughness: 0.32 });
    const lampMat = new THREE.MeshBasicMaterial({ color: '#fef3c7' });

    specs.forEach(s => {
        const yGround = getCityGroundHeight(s.x, s.z);
        const grp = new THREE.Group();
        grp.position.set(s.x, yGround, s.z);
        grp.rotation.y = s.rotY;

        const pylon = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.30, 3.6, 8), steelMat);
        pylon.position.set(0, 1.8, -0.2);

        const frame = new THREE.Mesh(new THREE.BoxGeometry(8.7, 5.9, 0.32), steelMat);
        frame.position.set(0, 5.9, -0.05);

        const canvas = document.createElement('canvas');
        canvas.width = 640;
        canvas.height = 336;
        const tex = new THREE.CanvasTexture(canvas);
        if ('colorSpace' in tex && THREE.SRGBColorSpace) tex.colorSpace = THREE.SRGBColorSpace;

        const screen = new THREE.Mesh(
            new THREE.PlaneGeometry(8.3, 5.5),
            new THREE.MeshBasicMaterial({ map: tex, side: THREE.DoubleSide })
        );
        screen.position.set(0, 5.9, 0.14);

        [-2.2, 2.2].forEach(fx => {
            const arm = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 1.1), steelMat);
            arm.position.set(fx, 8.9, 0.45);
            const bulb = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.16, 0.32), lampMat);
            bulb.position.set(fx, 8.82, 0.95);
            grp.add(arm, bulb);
        });

        grp.add(pylon, frame, screen);
        _billboardGroup.add(grp);

        const bb = { ...s, group: grp, canvas, tex };
        drawBillboardPoster(bb);
        _billboards.push(bb);
    });

    root.add(_billboardGroup);
}

export function onNantesManifestApplied(manifest) {
    if (!_npcRoot || !manifest) return;

    // Bind real IGN main roads to traffic vehicles
    if (Array.isArray(manifest.roadLanes) && manifest.roadLanes.length > 0 && _carData.length > 0) {
        const lanes = manifest.roadLanes.filter(l => Array.isArray(l) && l.length >= 2);
        if (lanes.length > 0) {
            _carData.forEach((c, i) => {
                const line = lanes[i % lanes.length];
                c.pts = line;
                c.len = Math.max(10, polylineLength(line));
                c.dist = ((i * 29) % c.len);
            });
        }
    }

    // Spawn real articulated TAN Tramways along stitched IGN Tramway lines (T1, T2, T3)
    const tramSource = (Array.isArray(manifest.tramLines) && manifest.tramLines.length > 0)
        ? manifest.tramLines
        : manifest.tramRoutes;
    if (Array.isArray(tramSource) && tramSource.length > 0) {
        buildTanTramways(_npcRoot, tramSource, manifest.props && manifest.props.tramStops);
    }

    // Snap VIP NPCs & Billboards to actual MNT terrain height
    _vipEntities.forEach(npc => {
        npc.y = getCityGroundHeight(npc.x, npc.z);
        npc.group.position.y = npc.y;
    });
    _billboards.forEach(bb => {
        if (bb.group) bb.group.position.y = getCityGroundHeight(bb.x, bb.z);
    });
}

export function refreshCityBillboards() {
    for (let i = 0; i < _billboards.length; i++) {
        drawBillboardPoster(_billboards[i]);
    }
}

export function initCityNpcs(cityRoot) {
    if (!cityRoot || _npcRoot) return;
    _npcRoot = new THREE.Group();
    _npcRoot.name = 'NantesLivingNpcs';

    buildPedestrians(_npcRoot);
    buildTraffic(_npcRoot);
    buildStreetBillboards(_npcRoot);

    _vipGroup = new THREE.Group();
    _vipGroup.name = 'CityVipNpcs';
    _npcRoot.add(_vipGroup);

    syncCityVipNpcs();
    cityRoot.add(_npcRoot);
}

export function tickCityNpcs(tSec, playerPose) {
    if (!_npcRoot) return;
    const dt = 0.016;
    const px = playerPose ? playerPose.x : 9999;
    const pz = playerPose ? playerPose.z : 9999;

    // 1. Update Instanced Pedestrians
    if (_pedMeshes && _pedData.length > 0) {
        const { torsoInst, headInst, legLInst, legRInst } = _pedMeshes;
        for (let i = 0; i < _pedData.length; i++) {
            const p = _pedData[i];
            const distPlayer = Math.hypot(p.x - px, p.z - pz);
            const paused = distPlayer < 2.6;

            if (!paused) {
                const a = p.pts[p.segIdx];
                const b = p.pts[(p.segIdx + p.dir + p.pts.length) % p.pts.length];
                const dx = b[0] - a[0];
                const dz = b[1] - a[1];
                const segLen = Math.max(1, Math.hypot(dx, dz));
                p.tSeg += (p.speed * dt) / segLen;
                if (p.tSeg >= 1) {
                    p.tSeg -= 1;
                    p.segIdx = (p.segIdx + p.dir + p.pts.length) % p.pts.length;
                }
                const na = p.pts[p.segIdx];
                const nb = p.pts[(p.segIdx + p.dir + p.pts.length) % p.pts.length];
                p.x = na[0] + (nb[0] - na[0]) * p.tSeg;
                p.z = na[1] + (nb[1] - na[1]) * p.tSeg;
                p.yaw = Math.atan2(nb[0] - na[0], nb[1] - na[1]);
                p.phase += p.speed * dt * 4.8;
            }

            const gY = getCityGroundHeight(p.x, p.z);
            const swing = paused ? 0 : Math.sin(p.phase) * 0.45;
            const bob = paused ? 0 : Math.abs(Math.sin(p.phase)) * 0.04;

            _dummy.rotation.set(0, p.yaw, 0);
            _dummy.scale.set(1, 1, 1);

            _dummy.position.set(p.x, gY + 1.0 + bob, p.z);
            _dummy.updateMatrix();
            torsoInst.setMatrixAt(i, _dummy.matrix);

            _dummy.position.set(p.x, gY + 1.50 + bob, p.z);
            _dummy.updateMatrix();
            headInst.setMatrixAt(i, _dummy.matrix);

            const hipOffsetX = Math.cos(p.yaw) * 0.11;
            const hipOffsetZ = -Math.sin(p.yaw) * 0.11;

            _legDummy.rotation.order = 'YXZ';
            _legDummy.rotation.set(swing, p.yaw, 0);
            _legDummy.position.set(p.x - hipOffsetX, gY + 0.68 + bob, p.z - hipOffsetZ);
            _legDummy.updateMatrix();
            legLInst.setMatrixAt(i, _legDummy.matrix);

            _legDummy.rotation.set(-swing, p.yaw, 0);
            _legDummy.position.set(p.x + hipOffsetX, gY + 0.68 + bob, p.z + hipOffsetZ);
            _legDummy.updateMatrix();
            legRInst.setMatrixAt(i, _legDummy.matrix);
        }
        torsoInst.instanceMatrix.needsUpdate = true;
        headInst.instanceMatrix.needsUpdate = true;
        legLInst.instanceMatrix.needsUpdate = true;
        legRInst.instanceMatrix.needsUpdate = true;
    }

    // 2. Update Instanced Light Traffic on IGN Roads
    if (_carMeshes && _carData.length > 0) {
        const { chassisInst, cabinInst, axleInst, headInst, tailInst } = _carMeshes;
        for (let i = 0; i < _carData.length; i++) {
            const c = _carData[i];
            const distP = Math.hypot(px - c.x, pz - c.z);
            const targetSpd = distP < 7.5 ? 0 : c.baseSpeed;
            c.speed += (targetSpd - c.speed) * Math.min(1, dt * 5.0);

            c.dist += c.dir * c.speed * dt;
            if (c.dist > c.len) { c.dist = c.len; c.dir = -1; }
            if (c.dist < 0) { c.dist = 0; c.dir = 1; }

            const s = samplePolyline(c.pts, c.dist);
            c.x = s.x;
            c.z = s.z;
            c.yaw = c.dir > 0 ? s.yaw : (s.yaw + Math.PI);

            const gy = getCityGroundHeight(c.x, c.z);
            const fwdX = Math.sin(c.yaw);
            const fwdZ = Math.cos(c.yaw);

            _dummy.scale.set(1, 1, 1);
            _dummy.rotation.set(0, c.yaw, 0);

            _dummy.position.set(c.x, gy + 0.45, c.z);
            _dummy.updateMatrix();
            chassisInst.setMatrixAt(i, _dummy.matrix);

            _dummy.position.set(c.x - fwdX * 0.12, gy + 0.94, c.z - fwdZ * 0.12);
            _dummy.updateMatrix();
            cabinInst.setMatrixAt(i, _dummy.matrix);

            [1.32, -1.32].forEach((axOff, ai) => {
                _dummy.position.set(c.x + fwdX * axOff, gy + 0.22, c.z + fwdZ * axOff);
                _dummy.updateMatrix();
                axleInst.setMatrixAt(i * 2 + ai, _dummy.matrix);
            });

            const latX = fwdZ;
            const latZ = -fwdX;
            [-0.64, 0.64].forEach((sideOff, si) => {
                _dummy.position.set(c.x + fwdX * 2.08 + latX * sideOff, gy + 0.48, c.z + fwdZ * 2.08 + latZ * sideOff);
                _dummy.updateMatrix();
                headInst.setMatrixAt(i * 2 + si, _dummy.matrix);

                _dummy.position.set(c.x - fwdX * 2.08 + latX * sideOff, gy + 0.50, c.z - fwdZ * 2.08 + latZ * sideOff);
                _dummy.updateMatrix();
                tailInst.setMatrixAt(i * 2 + si, _dummy.matrix);
            });
        }
        chassisInst.instanceMatrix.needsUpdate = true;
        cabinInst.instanceMatrix.needsUpdate = true;
        axleInst.instanceMatrix.needsUpdate = true;
        headInst.instanceMatrix.needsUpdate = true;
        tailInst.instanceMatrix.needsUpdate = true;
    }

    // 3. Update Articulated Nantes TAN Tramways (spline-following cars on right-hand rails + station stops)
    const placeOnRail = (pts, dist, dir, doubleTrack) => {
        const s = samplePolyline(pts, Math.max(0, dist));
        const travelYaw = dir > 0 ? s.yaw : (s.yaw + Math.PI);
        const lat = doubleTrack ? 1.65 : 0;
        const rx = s.x - Math.cos(travelYaw) * lat;
        const rz = s.z + Math.sin(travelYaw) * lat;
        const ry = getCityGroundHeight(rx, rz) + 0.16;
        return { x: rx, y: ry, z: rz, yaw: travelYaw };
    };
    const carStep = 7.65;
    for (let i = 0; i < _tramUnits.length; i++) {
        const tr = _tramUnits[i];
        if (tr.stopTimer > 0) {
            tr.stopTimer = Math.max(0, tr.stopTimer - dt);
        } else {
            tr.dist += tr.dir * tr.speed * dt;
            if (tr.dist > tr.len - 10) { tr.dist = tr.len - 10; tr.dir = -1; tr.lastStopIdx = -1; }
            if (tr.dist < 10) { tr.dist = 10; tr.dir = 1; tr.lastStopIdx = -1; }
        }

        const pFront = placeOnRail(tr.pts, Math.min(tr.len, Math.max(0, tr.dist + tr.dir * carStep)), tr.dir, tr.doubleTrack);
        const pMid = placeOnRail(tr.pts, tr.dist, tr.dir, tr.doubleTrack);
        const pRear = placeOnRail(tr.pts, Math.min(tr.len, Math.max(0, tr.dist - tr.dir * carStep)), tr.dir, tr.doubleTrack);

        // Brief realistic pause when passing a TAN platform station
        if (tr.stopTimer <= 0 && tr.stops && tr.stops.length > 0) {
            for (let si = 0; si < tr.stops.length; si++) {
                if (si === tr.lastStopIdx) continue;
                const st = tr.stops[si];
                if (Math.hypot(pMid.x - st[0], pMid.z - st[1]) < 7.5) {
                    tr.stopTimer = 2.6;
                    tr.lastStopIdx = si;
                    break;
                }
            }
        }

        tr.carFront.position.set(pFront.x, pFront.y, pFront.z);
        tr.carFront.rotation.y = pFront.yaw;
        tr.carMid.position.set(pMid.x, pMid.y, pMid.z);
        tr.carMid.rotation.y = pMid.yaw;
        tr.carRear.position.set(pRear.x, pRear.y, pRear.z);
        tr.carRear.rotation.y = pRear.yaw;

        // Position dark accordion bellows cleanly between articulated car sections
        tr.bellowsA.position.set((pFront.x + pMid.x) * 0.5, (pFront.y + pMid.y) * 0.5 + 1.85, (pFront.z + pMid.z) * 0.5);
        tr.bellowsA.rotation.y = Math.atan2(pFront.x - pMid.x, pFront.z - pMid.z);
        tr.bellowsB.position.set((pMid.x + pRear.x) * 0.5, (pMid.y + pRear.y) * 0.5 + 1.85, (pMid.z + pRear.z) * 0.5);
        tr.bellowsB.rotation.y = Math.atan2(pMid.x - pRear.x, pMid.z - pRear.z);
    }

    // 4. VIP NPCs Idle & Face-Player Reactivity
    for (let i = 0; i < _vipEntities.length; i++) {
        const npc = _vipEntities[i];
        const dist = Math.hypot(px - npc.x, pz - npc.z);
        npc.group.position.y = npc.y + Math.sin(tSec * 2.6 + npc.phase) * 0.025;
        const targetYaw = (dist < 7.0) ? Math.atan2(px - npc.x, pz - npc.z) : npc.baseYaw;
        let diff = targetYaw - npc.group.rotation.y;
        while (diff > Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;
        npc.group.rotation.y += diff * Math.min(1, dt * 6);
    }
}

export function getNearestCityNpc(x, z, maxDist = 4.5) {
    let best = null;
    let bestD = maxDist;
    for (let i = 0; i < _vipEntities.length; i++) {
        const npc = _vipEntities[i];
        const d = Math.hypot(npc.x - x, npc.z - z);
        if (d < bestD) {
            bestD = d;
            best = npc;
        }
    }
    return best;
}

export function interactWithCityNpc(npc) {
    if (!npc) return;
    const st = (typeof globalThis.state === 'object' && globalThis.state) ? globalThis.state : {};
    st.cityNpcMetDay = (st.cityNpcMetDay && typeof st.cityNpcMetDay === 'object') ? st.cityNpcMetDay : {};
    const today = Number(st.day) || 1;
    const alreadyMetToday = st.cityNpcMetDay[npc.id] === today;

    if (typeof globalThis.showToast === 'function') {
        globalThis.showToast(npc.quote, npc.kind === 'rival' ? 'warning' : 'info');
    }

    if (!alreadyMetToday) {
        st.cityNpcMetDay[npc.id] = today;
        st.inspi = Math.min(100, (Number(st.inspi) || 0) + 4);
        st.hype = Math.min(100, (Number(st.hype) || 0) + 2);
        if (npc.kind === 'rapper') {
            st.rapperAffinity = (st.rapperAffinity && typeof st.rapperAffinity === 'object') ? st.rapperAffinity : {};
            st.rapperAffinity[npc.name] = Math.min(100, (Number(st.rapperAffinity[npc.name]) || 0) + 3);
        } else {
            st.rep = (Number(st.rep) || 0) + 1;
        }
        if (typeof globalThis.playSuccess === 'function') globalThis.playSuccess();
        if (typeof globalThis.showToast === 'function') {
            globalThis.showToast(`✨ Rencontre rue (${npc.name}) : +4% INSPI, +2 HYPE`, 'success');
        }
        if (typeof globalThis.updateHUD === 'function') globalThis.updateHUD();
        if (typeof globalThis.saveGame === 'function') globalThis.saveGame();
    } else if (typeof globalThis.playBleep === 'function') {
        globalThis.playBleep();
    }
}

export function getCityVipMinimapDots() {
    return _vipEntities.map(n => ({
        x: n.x,
        z: n.z,
        color: n.accentHex,
        kind: n.kind
    }));
}

void getCityLandmarks;
