import { THREE } from '../core/libs.js';
import { SIDEWALK_HEIGHT, getCityGroundHeight } from './city-world.js';

const PED_COUNT = 64;
const CAR_COUNT = 18;

let _npcRoot = null;
let _pedData = [];
let _carData = [];
let _pedMeshes = null;
let _carMeshes = null;

let _vipGroup = null;
let _vipEntities = [];
const _billboards = [];

const _dummy = new THREE.Object3D();
const _legDummy = new THREE.Object3D();

function makePedestrianWaypoints(bIdx) {
    // 4 inner sidewalk perimeter loops (stays strictly in 13.0..15.2 corridor outside buildings)
    const sx = (bIdx % 2 === 0) ? -1 : 1;
    const sz = (bIdx < 2) ? -1 : 1;
    const inner = 13.2 + (bIdx % 2) * 0.5;
    const outer = 80.5;
    const x0 = sx * inner;
    const x1 = sx * outer;
    const z0 = sz * inner;
    const z1 = sz * outer;
    const pts = [
        [x0, z0],
        [x1, z0],
        [x1, z1],
        [x0, z1]
    ];
    if (sx * sz < 0) pts.reverse();
    return pts;
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

    const circuits = [0, 1, 2, 3].map(makePedestrianWaypoints);
    _pedData = [];
    const initMat = new THREE.Matrix4();

    for (let i = 0; i < PED_COUNT; i++) {
        const blockIdx = i % 4;
        const pts = circuits[blockIdx];
        const segIdx = Math.floor(i / 4) % pts.length;
        const tSeg = ((i * 0.37) % 1);
        const a = pts[segIdx];
        const b = pts[(segIdx + 1) % pts.length];
        const px = a[0] + (b[0] - a[0]) * tSeg;
        const pz = a[1] + (b[1] - a[1]) * tSeg;

        _pedData.push({
            pts,
            segIdx,
            tSeg,
            dir: (i % 2 === 0) ? 1 : -1,
            speed: 1.35 + (i % 5) * 0.22,
            phase: i * 0.85,
            x: px,
            z: pz,
            yaw: Math.atan2(b[0] - a[0], b[1] - a[1])
        });

        torsoInst.setColorAt(i, jacketPalette[i % jacketPalette.length]);
        headInst.setColorAt(i, skinPalette[i % skinPalette.length]);
        initMat.makeTranslation(px, SIDEWALK_HEIGHT + 1.0, pz);
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

function buildTraffic(root) {
    const carPalette = [
        '#111827', '#f8fafc', '#facc15', '#94a3b8',
        '#1e3a8a', '#991b1b', '#334155', '#065f46'
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

    // 4 Main boulevard lanes (z=±7.8, x=±7.8 cleanly pass outside (0,0) fountain & inside sidewalks)
    // plus outer ring road (±96 ± 3.2)
    const laneSpecs = [
        { axis: 'x', fixed: 7.8, dir: 1, min: -138, max: 138, count: 4 },   // Boulevard 808 Eastbound
        { axis: 'x', fixed: -7.8, dir: -1, min: -138, max: 138, count: 4 }, // Boulevard 808 Westbound
        { axis: 'z', fixed: -7.8, dir: 1, min: -138, max: 138, count: 3 },  // Avenue du Flow Southbound
        { axis: 'z', fixed: 7.8, dir: -1, min: -138, max: 138, count: 3 },  // Avenue du Flow Northbound
        { axis: 'x', fixed: 99.2, dir: 1, min: -138, max: 138, count: 2 },  // Outer South Ring
        { axis: 'z', fixed: -99.2, dir: 1, min: -138, max: 138, count: 2 }  // Outer West Ring
    ];

    _carData = [];
    let idx = 0;
    const initMat = new THREE.Matrix4();

    laneSpecs.forEach((lane, laneId) => {
        const span = lane.max - lane.min;
        for (let k = 0; k < lane.count && idx < CAR_COUNT; k++) {
            const posAlong = lane.min + ((k + 0.3) / lane.count) * span;
            const x = lane.axis === 'x' ? posAlong : lane.fixed;
            const z = lane.axis === 'z' ? posAlong : lane.fixed;
            const yaw = lane.axis === 'x'
                ? (lane.dir > 0 ? Math.PI / 2 : -Math.PI / 2)
                : (lane.dir > 0 ? 0 : Math.PI);

            _carData.push({
                laneId,
                axis: lane.axis,
                fixed: lane.fixed,
                dir: lane.dir,
                min: lane.min,
                max: lane.max,
                posAlong,
                baseSpeed: 10.5 + (idx % 4) * 1.8,
                speed: 10.5 + (idx % 4) * 1.8,
                x,
                z,
                yaw
            });

            chassisInst.setColorAt(idx, carPalette[idx % carPalette.length]);
            initMat.makeTranslation(x, 0.45, z);
            chassisInst.setMatrixAt(idx, initMat);
            cabinInst.setMatrixAt(idx, initMat);
            axleInst.setMatrixAt(idx * 2, initMat);
            axleInst.setMatrixAt(idx * 2 + 1, initMat);
            headInst.setMatrixAt(idx * 2, initMat);
            headInst.setMatrixAt(idx * 2 + 1, initMat);
            tailInst.setMatrixAt(idx * 2, initMat);
            tailInst.setMatrixAt(idx * 2 + 1, initMat);
            idx++;
        }
    });

    if (chassisInst.instanceColor) chassisInst.instanceColor.needsUpdate = true;
    [chassisInst, cabinInst, axleInst, headInst, tailInst].forEach(inst => {
        inst.instanceMatrix.needsUpdate = true;
        root.add(inst);
    });

    _carMeshes = { chassisInst, cabinInst, axleInst, headInst, tailInst };
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

    const roster = [
        {
            id: 'vip_zandame',
            name: 'Zandame',
            role: '🎤 RAPPEUR · CLUB BOUNCE',
            kind: 'rapper',
            x: 33.5, z: 29.5, yaw: -Math.PI * 0.75,
            style: 2, tier: 4, variant: 0,
            accentHex: '#a855f7',
            quote: "Zandame : « Ton 808 tremble jusque sur l'Avenue des Clubs ! Passe au Showcase quand tu veux. »"
        },
        {
            id: 'vip_joule',
            name: 'Joule',
            role: '💿 PLATINE · BOUNCE',
            kind: 'rapper',
            x: 31.0, z: 22.5, yaw: -Math.PI * 0.5,
            style: 3, tier: 4, variant: 0,
            accentHex: '#fbbf24',
            quote: "Joule : « Y'a du monde devant le Club ce soir, envoie un beat qui retourne la fosse ! »"
        },
        {
            id: 'vip_disiznot',
            name: 'Disiznot',
            role: '📀 DIGGER · VINYL ROW',
            kind: 'rapper',
            x: -33.5, z: 28.5, yaw: Math.PI * 0.6,
            style: 0, tier: 3, variant: 0,
            accentHex: '#10b981',
            quote: "Disiznot : « Je viens de trouver une pépite soul pressée en 78 juste au Disquaire. »"
        },
        {
            id: 'vip_rosmii',
            name: 'Rosmii',
            role: '🎹 BEATMAKER · STUDIO+',
            kind: 'rapper',
            x: -17.5, z: 54.0, yaw: Math.PI * 0.85,
            style: 1, tier: 2, variant: 0,
            accentHex: '#38bdf8',
            quote: "Rosmii : « Studio+ vient de rentrer des préamps analogiques, passe check ton budget ! »"
        },
        {
            id: 'vip_rival_scout',
            name: rivalName,
            role: '⚔️ CREW RIVAL · PROVOC',
            kind: 'rival',
            x: 18.5, z: -56.0, yaw: Math.PI * 0.25,
            style: 2, tier: 3, variant: 1,
            accentHex: '#fb7185',
            quote: `${rivalName} : « Tu roules fort aujourd'hui, mais c'est nous qui tenons les panneaux 4×3 du District 42 ! »`
        }
    ];

    const signedIds = Array.isArray(st.signedArtists) ? st.signedArtists : [];
    const labelCatalog = Array.isArray(globalThis.LABEL_ARTIST_ROSTER) ? globalThis.LABEL_ARTIST_ROSTER : [];
    const proCoords = [
        { x: 33.5, z: -29.5, yaw: -Math.PI * 0.4 },
        { x: 24.5, z: -31.0, yaw: Math.PI * 0.2 }
    ];

    if (signedIds.length > 0 && labelCatalog.length > 0) {
        signedIds.slice(0, 2).forEach((artId, idx) => {
            const meta = labelCatalog.find(a => a.id === artId) || labelCatalog[idx % labelCatalog.length];
            const pos = proCoords[idx];
            roster.push({
                id: `signed_${meta.id}`,
                name: meta.name,
                role: '✍️ ARTISTE · TON LABEL',
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
            role: '🎧 CONNEXION · BANLIEUE',
            kind: 'contact',
            x: -33.0, z: -26.5, yaw: Math.PI * 0.25,
            style: 1, tier: 1, variant: 0,
            accentHex: '#f59e0b',
            quote: "Fto : « Continue de digger et de balancer tes prods, tout le quartier guette ta montée ! »"
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

    // Poster background
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
        ctx.font = 'bold 26px ui-monospace, Menlo, monospace';
        ctx.textAlign = 'center';
        ctx.fillText(variant === 0 ? 'CAMPAGNE LABEL OFFICIELLE' : 'TOUR 42E · RECRUTEMENT & SYNC', W / 2, 74);

        ctx.fillStyle = '#ffffff';
        ctx.font = '900 64px Outfit, sans-serif';
        ctx.fillText(labelName, W / 2, 174);

        ctx.fillStyle = '#cbd5e1';
        ctx.font = 'bold 28px ui-monospace, Menlo, monospace';
        ctx.fillText(
            signedCount > 0 ? `${signedCount} ARTISTE(S) SIGNÉ(S) · ROTATION 24/7` : 'NOUVEAU LABEL INDÉPENDANT EN EXPANSION',
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

        // Glossy metallic Gold/Plat vinyl disc illustration on left
        const cx = 115;
        const cy = H / 2;
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
        ctx.font = 'bold 24px ui-monospace, Menlo, monospace';
        ctx.fillText('AFFICHAGE PROVOCATION // RIVALITÉ', W / 2, 72);

        ctx.fillStyle = '#ffffff';
        ctx.font = '900 50px Outfit, sans-serif';
        ctx.fillText(rivalName, W / 2, 152);

        ctx.fillStyle = '#fda4af';
        ctx.font = 'bold 25px ui-monospace, Menlo, monospace';
        const msg = wonClash > 0
            ? `"${rivalName} EN PANIQUE FACE À ${labelName} ?"`
            : `"${rivalName} DOMINE LA VILLE — ${labelName} QUI ?"`;
        ctx.fillText(msg.slice(0, 44), W / 2, 232);
        ctx.fillStyle = '#94a3b8';
        ctx.font = 'bold 20px ui-monospace, Menlo, monospace';
        ctx.fillText('BEAT BATTLE OUVERT AU DISTRICT 42', W / 2, 282);
    } else {
        ctx.fillStyle = '#090f1d';
        ctx.fillRect(0, 0, W, H);
        ctx.strokeStyle = variant === 0 ? '#38bdf8' : '#a855f7';
        ctx.lineWidth = 10;
        ctx.strokeRect(12, 12, W - 24, H - 24);
        ctx.textAlign = 'center';
        ctx.fillStyle = variant === 0 ? '#38bdf8' : '#c084fc';
        ctx.font = 'bold 24px ui-monospace, Menlo, monospace';
        ctx.fillText(variant === 0 ? 'ALGO-STREAM 360 · PUB SATIRIQUE' : 'AVENUE DES CLUBS · CE SOIR', W / 2, 78);
        ctx.fillStyle = '#ffffff';
        ctx.font = '900 40px Outfit, sans-serif';
        ctx.fillText(variant === 0 ? '0.0003€ PAR STREAM' : 'BOUNCE LIVE SHOWCASE', W / 2, 165);
        ctx.fillStyle = '#cbd5e1';
        ctx.font = 'bold 24px ui-monospace, Menlo, monospace';
        ctx.fillText(variant === 0 ? 'MERCI AUX BEATMAKERS BÉNÉVOLES ♥' : 'CAMÉRA CCTV · ENTRÉE VIP OUVERTE', W / 2, 245);
    }

    tex.needsUpdate = true;
}

function buildStreetBillboards(root) {
    _billboards.length = 0;

    // 8 4x3 street-facing billboards (mounted on steel pylons right inside sidewalk edge ±15.6..16.2)
    const specs = [
        { kind: 'label', variant: 0, x: -36, z: -15.6, rotY: 0 },
        { kind: 'label', variant: 1, x: 56, z: -15.6, rotY: -0.14 },
        { kind: 'discs', variant: 0, x: -56, z: 15.6, rotY: Math.PI },
        { kind: 'discs', variant: 1, x: 15.6, z: -38, rotY: -Math.PI / 2 },
        { kind: 'rival', variant: 0, x: 15.8, z: -16.6, rotY: -Math.PI * 0.75 },
        { kind: 'rival', variant: 1, x: 54, z: 15.6, rotY: Math.PI },
        { kind: 'satire', variant: 0, x: -15.6, z: 22, rotY: Math.PI / 2 },
        { kind: 'satire', variant: 1, x: 15.6, z: 48, rotY: -Math.PI / 2 }
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

        // 2 top overhanging gooseneck floodlight hoods
        [-2.2, 2.2].forEach(fx => {
            const arm = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 1.1), steelMat);
            arm.position.set(fx, 8.9, 0.45);
            const bulb = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.16, 0.32), lampMat);
            bulb.position.set(fx, 8.82, 0.95);
            grp.add(arm, bulb);
        });

        grp.add(pylon, frame, screen);
        root.add(grp);

        const bb = { ...s, canvas, tex };
        drawBillboardPoster(bb);
        _billboards.push(bb);
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
    _npcRoot.name = 'BounceCityLivingNpcs';

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
    const px = playerPose ? playerPose.x : 999;
    const pz = playerPose ? playerPose.z : 999;

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

            const gY = SIDEWALK_HEIGHT;
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

    // 2. Update Instanced Light Traffic with Lane & Player Avoidance
    if (_carMeshes && _carData.length > 0) {
        const { chassisInst, cabinInst, axleInst, headInst, tailInst } = _carMeshes;
        for (let i = 0; i < _carData.length; i++) {
            const c = _carData[i];
            let blocked = false;

            // Player corridor avoidance
            const dxP = px - c.x;
            const dzP = pz - c.z;
            const fwdX = Math.sin(c.yaw);
            const fwdZ = Math.cos(c.yaw);
            const projFwd = dxP * fwdX + dzP * fwdZ;
            const projLat = Math.abs(dxP * (-fwdZ) + dzP * fwdX);
            if (projFwd > 0 && projFwd < 8.5 && projLat < 2.6) {
                blocked = true;
            }

            // Same-lane vehicle ahead avoidance
            if (!blocked) {
                const span = c.max - c.min;
                for (let j = 0; j < _carData.length; j++) {
                    if (i === j || _carData[j].laneId !== c.laneId) continue;
                    let delta = (_carData[j].posAlong - c.posAlong) * c.dir;
                    if (delta < 0) delta += span;
                    if (delta > 0 && delta < 9.5) {
                        blocked = true;
                        break;
                    }
                }
            }

            const targetSpd = blocked ? 0 : c.baseSpeed;
            c.speed += (targetSpd - c.speed) * Math.min(1, dt * 5.0);
            c.posAlong += c.dir * c.speed * dt;
            if (c.posAlong > c.max) c.posAlong = c.min;
            if (c.posAlong < c.min) c.posAlong = c.max;

            c.x = c.axis === 'x' ? c.posAlong : c.fixed;
            c.z = c.axis === 'z' ? c.posAlong : c.fixed;

            _dummy.scale.set(1, 1, 1);
            _dummy.rotation.set(0, c.yaw, 0);

            _dummy.position.set(c.x, 0.45, c.z);
            _dummy.updateMatrix();
            chassisInst.setMatrixAt(i, _dummy.matrix);

            _dummy.position.set(c.x - fwdX * 0.12, 0.94, c.z - fwdZ * 0.12);
            _dummy.updateMatrix();
            cabinInst.setMatrixAt(i, _dummy.matrix);

            [1.32, -1.32].forEach((axOff, ai) => {
                _dummy.position.set(c.x + fwdX * axOff, 0.22, c.z + fwdZ * axOff);
                _dummy.updateMatrix();
                axleInst.setMatrixAt(i * 2 + ai, _dummy.matrix);
            });

            const latX = fwdZ;
            const latZ = -fwdX;
            [-0.64, 0.64].forEach((sideOff, si) => {
                _dummy.position.set(c.x + fwdX * 2.08 + latX * sideOff, 0.48, c.z + fwdZ * 2.08 + latZ * sideOff);
                _dummy.updateMatrix();
                headInst.setMatrixAt(i * 2 + si, _dummy.matrix);

                _dummy.position.set(c.x - fwdX * 2.08 + latX * sideOff, 0.50, c.z - fwdZ * 2.08 + latZ * sideOff);
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

    // 3. VIP NPCs Idle & Face-Player Reactivity
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
