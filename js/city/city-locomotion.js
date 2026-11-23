import { THREE } from '../core/libs.js';
import { CITY_BOUNDS, getCityColliders, getCityGroundHeight, isPointInWater } from './city-world.js';
import { constrainToBridgeDeck } from './nantes-monuments.js';

export const VEHICLE_ORDER = ['foot', 'scooter', 'bike', 'car'];

export const VEHICLE_SPECS = {
    foot: {
        id: 'foot',
        icon: '🚶',
        label: 'À pied',
        maxSpeed: 8.2,
        accel: 30,
        drag: 10,
        turnSpeed: 3.6,
        boostMult: 1.45,
        camDist: 4.8,
        camHeight: 2.3,
        fov: 62,
        radius: 0.55
    },
    scooter: {
        id: 'scooter',
        icon: '🛴',
        label: 'Trottinette',
        maxSpeed: 16.5,
        accel: 26,
        drag: 6,
        turnSpeed: 3.1,
        boostMult: 1.28,
        camDist: 5.6,
        camHeight: 2.55,
        fov: 65,
        radius: 0.65
    },
    bike: {
        id: 'bike',
        icon: '🚲',
        label: 'Vélo BMX',
        maxSpeed: 24.0,
        accel: 24,
        drag: 5,
        turnSpeed: 2.8,
        boostMult: 1.28,
        camDist: 6.4,
        camHeight: 2.85,
        fov: 68,
        radius: 0.78
    },
    car: {
        id: 'car',
        icon: '🏎️',
        label: 'Coupé 42e',
        maxSpeed: 38.0,
        accel: 28,
        drag: 4.2,
        turnSpeed: 2.35,
        boostMult: 1.32,
        camDist: 8.6,
        camHeight: 3.55,
        fov: 72,
        radius: 1.05
    }
};

let _playerGroup = null;
let _avatarHolder = null;
let _avatarMesh = null;
let _avatarSignature = '';
const _rigs = { scooter: null, bike: null, car: null };
const _spinWheels = [];
let _carBrakeMat = null;
let _headlightPoint = null;
let _headlightConeMat = null;

const _pose = {
    x: 0,
    y: 0,
    z: 14,
    yaw: Math.PI / 2,
    speed: 0,
    vehicle: 'foot'
};

const _keys = { fwd: false, back: false, left: false, right: false, boost: false };
let _touchJoy = { active: false, ptrId: null, x: 0, y: 0, cx: 0, cy: 0 };
let _touchThrottle = false;
let _camOrbitYaw = 0;
let _dragOrbitPtr = null;
let _dragLastX = 0;
let _lastFrameMs = 0;
let _listenersBound = false;

export function clearCityKeys() {
    _keys.fwd = false;
    _keys.back = false;
    _keys.left = false;
    _keys.right = false;
    _keys.boost = false;
    _touchThrottle = false;
    _touchJoy.active = false;
    _touchJoy.ptrId = null;
    _touchJoy.x = 0;
    _touchJoy.y = 0;
    const knob = document.getElementById('city-touch-knob');
    if (knob) knob.style.transform = 'translate(0, 0)';
    const boostBtn = document.getElementById('city-btn-boost');
    if (boostBtn) boostBtn.classList.remove('is-down');
}

export function isCityInputActive() {
    if (window.activeStudioLocation !== 'city') return false;
    const pcUi = document.getElementById('pc-ui-layer');
    const loginUi = document.getElementById('login-screen');
    const gpsModal = document.getElementById('city-gps-modal');
    const sampleDigger = document.getElementById('sample-digger-window');
    const showcase = document.getElementById('showcase-overlay');
    const ceremony = document.getElementById('ceremony-overlay');
    const randEvt = document.getElementById('random-event-overlay');
    if (document.body.classList.contains('os-active')) return false;
    if (loginUi && loginUi.style.display !== 'none') return false;
    if (pcUi && pcUi.style.display === 'flex') return false;
    if (gpsModal && !gpsModal.classList.contains('hidden')) return false;
    if (sampleDigger && sampleDigger.style.display && sampleDigger.style.display !== 'none') return false;
    if (showcase && !showcase.classList.contains('hidden')) return false;
    if (ceremony && !ceremony.classList.contains('hidden')) return false;
    if (randEvt && !randEvt.classList.contains('hidden')) return false;
    if (typeof globalThis.state === 'object' && globalThis.state && globalThis.state.isEventActive) return false;
    return true;
}

export function getUnlockedVehicles() {
    const st = (typeof globalThis.state === 'object' && globalThis.state) ? globalThis.state : {};
    const roomTier = Number(st.roomTier) || 1;
    const lvlInfo = (typeof globalThis.calculateLevelData === 'function') ? globalThis.calculateLevelData(true) : { level: 1 };
    const lvl = Number(lvlInfo && lvlInfo.level) || 1;
    const pro = Boolean(st.studioUnlocked);
    return {
        foot: true,
        scooter: true,
        bike: roomTier >= 2 || lvl >= 38 || pro,
        car: roomTier >= 3 || lvl >= 72 || pro
    };
}

function getBestUnlockedVehicle() {
    const u = getUnlockedVehicles();
    if (u.car) return 'car';
    if (u.bike) return 'bike';
    if (u.scooter) return 'scooter';
    return 'foot';
}

function buildVehicleRigs(root) {
    const darkMetal = new THREE.MeshStandardMaterial({ color: '#161b26', roughness: 0.3, metalness: 0.85 });
    const chromeMat = new THREE.MeshStandardMaterial({ color: '#e2e8f0', roughness: 0.15, metalness: 0.95 });
    const tireMat = new THREE.MeshStandardMaterial({ color: '#090b10', roughness: 0.85 });
    const neonCyan = new THREE.MeshBasicMaterial({ color: '#38bdf8' });
    const neonGold = new THREE.MeshBasicMaterial({ color: '#fbbf24' });

    // 1. SCOOTER RIG (Trottinette électrique)
    const sc = new THREE.Group();
    const deck = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.06, 0.96), darkMetal);
    deck.position.set(0, 0.14, 0);
    const scUnder = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.02, 0.82), neonCyan);
    scUnder.position.set(0, 0.105, 0);
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.03, 0.95, 8), darkMetal);
    stem.position.set(0, 0.62, 0.36);
    stem.rotation.x = -0.14;
    const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.48, 8), chromeMat);
    bar.rotation.z = Math.PI / 2;
    bar.position.set(0, 1.07, 0.29);
    const wGeoSc = new THREE.CylinderGeometry(0.11, 0.11, 0.06, 12);
    wGeoSc.rotateZ(Math.PI / 2);
    const wScF = new THREE.Mesh(wGeoSc, tireMat); wScF.position.set(0, 0.11, 0.43);
    const wScB = new THREE.Mesh(wGeoSc, tireMat); wScB.position.set(0, 0.11, -0.43);
    _spinWheels.push(wScF, wScB);
    sc.add(deck, scUnder, stem, bar, wScF, wScB);
    sc.visible = false;
    root.add(sc);
    _rigs.scooter = sc;

    // 2. BIKE RIG (BMX / Fixie)
    const bk = new THREE.Group();
    const wGeoBk = new THREE.TorusGeometry(0.32, 0.045, 8, 18);
    wGeoBk.rotateY(Math.PI / 2);
    const wBkF = new THREE.Mesh(wGeoBk, tireMat); wBkF.position.set(0, 0.34, 0.62);
    const wBkB = new THREE.Mesh(wGeoBk, tireMat); wBkB.position.set(0, 0.34, -0.62);
    _spinWheels.push(wBkF, wBkB);
    const bkFrame = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 1.15), neonGold);
    bkFrame.position.set(0, 0.56, 0);
    const bkPost = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.72, 8), darkMetal);
    bkPost.position.set(0, 0.68, 0.48);
    bkPost.rotation.x = -0.22;
    const bkBar = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.58, 8), chromeMat);
    bkBar.rotation.z = Math.PI / 2;
    bkBar.position.set(0, 1.0, 0.39);
    bk.add(wBkF, wBkB, bkFrame, bkPost, bkBar);
    bk.visible = false;
    root.add(bk);
    _rigs.bike = bk;

    // 3. SUPERCAR COUPE 42E RIG
    const car = new THREE.Group();
    const bodyMat = new THREE.MeshStandardMaterial({ color: '#111520', roughness: 0.2, metalness: 0.88 });
    const glassMat = new THREE.MeshStandardMaterial({ color: '#0b172a', roughness: 0.08, metalness: 0.65, transparent: true, opacity: 0.72 });
    const chassis = new THREE.Mesh(new THREE.BoxGeometry(1.96, 0.52, 4.15), bodyMat);
    chassis.position.set(0, 0.50, 0);
    const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.52, 0.48, 1.85), glassMat);
    cabin.position.set(0, 0.96, -0.15);
    const spoiler = new THREE.Mesh(new THREE.BoxGeometry(1.78, 0.06, 0.34), bodyMat);
    spoiler.position.set(0, 0.92, -1.92);
    const underNeon = new THREE.Mesh(new THREE.BoxGeometry(1.98, 0.04, 3.85), neonGold);
    underNeon.position.set(0, 0.22, 0);

    // Headlights (+Z front) & Brake lights (-Z rear)
    const headMat = new THREE.MeshBasicMaterial({ color: '#f0f9ff' });
    const hlL = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.10, 0.06), headMat); hlL.position.set(-0.68, 0.54, 2.08);
    const hlR = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.10, 0.06), headMat); hlR.position.set(0.68, 0.54, 2.08);
    _carBrakeMat = new THREE.MeshBasicMaterial({ color: '#e11d48' });
    const tlL = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.09, 0.06), _carBrakeMat); tlL.position.set(-0.62, 0.58, -2.08);
    const tlR = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.09, 0.06), _carBrakeMat); tlR.position.set(0.62, 0.58, -2.08);

    const wCarGeo = new THREE.CylinderGeometry(0.34, 0.34, 0.26, 16);
    wCarGeo.rotateZ(Math.PI / 2);
    [[-0.92, 0.34, 1.32], [0.92, 0.34, 1.32], [-0.92, 0.34, -1.32], [0.92, 0.34, -1.32]].forEach(([wx, wy, wz]) => {
        const w = new THREE.Mesh(wCarGeo, tireMat);
        w.position.set(wx, wy, wz);
        _spinWheels.push(w);
        car.add(w);
    });
    car.add(chassis, cabin, spoiler, underNeon, hlL, hlR, tlL, tlR);

    // Dynamic vehicle headlights & additive road projection cone (+Z forward)
    _headlightConeMat = new THREE.MeshBasicMaterial({
        color: '#fef9c3',
        transparent: true,
        opacity: 0.11,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide
    });
    const beamGeo = new THREE.ConeGeometry(1.45, 13.0, 12, 1, true);
    beamGeo.translate(0, -6.5, 0);
    beamGeo.rotateX(-Math.PI * 0.485);
    const beamL = new THREE.Mesh(beamGeo, _headlightConeMat);
    beamL.position.set(-0.68, 0.52, 2.08);
    const beamR = new THREE.Mesh(beamGeo, _headlightConeMat);
    beamR.position.set(0.68, 0.52, 2.08);
    car.add(beamL, beamR);

    car.visible = false;
    root.add(car);
    _rigs.car = car;

    _headlightPoint = new THREE.PointLight('#fff4d2', 0, 28, 1.6);
    _headlightPoint.position.set(0, 0.85, 4.2);
    root.add(_headlightPoint);
}

function syncCityAvatarAppearance() {
    if (!_avatarHolder || typeof globalThis.createAvatarGroup !== 'function') return;
    const st = (typeof globalThis.state === 'object' && globalThis.state) ? globalThis.state : {};
    const tier = Math.max(1, Number(st.avatarTier) || Number(st.roomTier) || 1);
    const variant = Number(st.avatarVariant) || 0;
    const styleIdx = (typeof globalThis.getModelIndexForTier === 'function')
        ? globalThis.getModelIndexForTier(tier)
        : (Number(st.activeCharacter) || 2);
    const sig = `${styleIdx}:${tier}:${variant}`;
    if (_avatarSignature === sig && _avatarMesh) return;

    if (_avatarMesh) _avatarHolder.remove(_avatarMesh);
    _avatarMesh = globalThis.createAvatarGroup(styleIdx, tier, variant);
    _avatarHolder.add(_avatarMesh);
    _avatarSignature = sig;
}

function updateMountedRigVisibility() {
    const m = _pose.vehicle;
    if (_rigs.scooter) _rigs.scooter.visible = (m === 'scooter');
    if (_rigs.bike) _rigs.bike.visible = (m === 'bike');
    if (_rigs.car) _rigs.car.visible = (m === 'car');
    if (_avatarHolder) {
        if (m === 'car') _avatarHolder.position.set(0, -0.05, -0.15);
        else if (m === 'bike') _avatarHolder.position.set(0, 0.24, -0.04);
        else if (m === 'scooter') _avatarHolder.position.set(0, 0.16, -0.06);
        else _avatarHolder.position.set(0, 0, 0);
    }
}

export function setCityVehicleMode(mode, silent = false) {
    const unlocked = getUnlockedVehicles();
    if (!unlocked[mode]) {
        if (!silent && typeof globalThis.showToast === 'function') {
            const req = mode === 'car' ? 'Palier 3 / Niv. 72 requis' : 'Palier 2 / Niv. 38 requis';
            globalThis.showToast(`🔒 ${VEHICLE_SPECS[mode].label} verrouillé (${req}).`, 'warning');
        }
        return false;
    }
    _pose.vehicle = mode;
    if (typeof globalThis.state === 'object' && globalThis.state) {
        globalThis.state.vehicleMode = mode;
        if (!silent) globalThis.state.vehicleManual = true;
    }
    updateMountedRigVisibility();
    if (!silent && typeof globalThis.playBleep === 'function') globalThis.playBleep();
    return true;
}

export function cycleCityVehicle() {
    const unlocked = getUnlockedVehicles();
    const list = VEHICLE_ORDER.filter(v => unlocked[v]);
    const idx = Math.max(0, list.indexOf(_pose.vehicle));
    const next = list[(idx + 1) % list.length];
    setCityVehicleMode(next, false);
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

function closestPointOnFlatPoly(px, pz, p) {
    let bestD2 = Infinity;
    let bestX = px;
    let bestZ = pz;
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
        if (d2 < bestD2) {
            bestD2 = d2;
            bestX = qx;
            bestZ = qz;
        }
    }
    return { qx: bestX, qz: bestZ, d2: bestD2 };
}

function resolveColliders(nx, nz, radius, prevX = nx, prevZ = nz) {
    let x = Math.max(CITY_BOUNDS.minX, Math.min(CITY_BOUNDS.maxX, nx));
    let z = Math.max(CITY_BOUNDS.minZ, Math.min(CITY_BOUNDS.maxZ, nz));
    const cols = getCityColliders();
    const r2 = radius * radius;

    for (let pass = 0; pass < 2; pass++) {
        for (let i = 0; i < cols.length; i++) {
            const c = cols[i];
            if (!(x + radius > c.minX && x - radius < c.maxX && z + radius > c.minZ && z - radius < c.maxZ)) continue;

            if (Array.isArray(c.p) && c.p.length >= 6) {
                const inside = pointInFlatPolyXZ(x, z, c.p);
                const { qx, qz, d2 } = closestPointOnFlatPoly(x, z, c.p);
                if (!inside && d2 >= r2) continue;

                const d = Math.sqrt(d2);
                if (inside) {
                    if (d > 1e-4) {
                        x = qx + ((qx - x) / d) * radius;
                        z = qz + ((qz - z) / d) * radius;
                    } else {
                        const penLeft = (x + radius) - c.minX;
                        const penRight = c.maxX - (x - radius);
                        const penTop = (z + radius) - c.minZ;
                        const penBot = c.maxZ - (z - radius);
                        const minPen = Math.min(penLeft, penRight, penTop, penBot);
                        if (minPen === penLeft) x = c.minX - radius;
                        else if (minPen === penRight) x = c.maxX + radius;
                        else if (minPen === penTop) z = c.minZ - radius;
                        else z = c.maxZ + radius;
                    }
                } else if (d > 1e-4) {
                    x = qx + ((x - qx) / d) * radius;
                    z = qz + ((z - qz) / d) * radius;
                }
            } else {
                const penLeft = (x + radius) - c.minX;
                const penRight = c.maxX - (x - radius);
                const penTop = (z + radius) - c.minZ;
                const penBot = c.maxZ - (z - radius);
                const minPen = Math.min(penLeft, penRight, penTop, penBot);
                if (minPen === penLeft) x = c.minX - radius;
                else if (minPen === penRight) x = c.maxX + radius;
                else if (minPen === penTop) z = c.minZ - radius;
                else z = c.maxZ + radius;
            }
        }
    }

    const brClamped = constrainToBridgeDeck(x, z, radius);
    x = brClamped.x;
    z = brClamped.z;

    if (isPointInWater(x, z)) {
        if (!isPointInWater(x, prevZ)) {
            z = prevZ;
        } else if (!isPointInWater(prevX, z)) {
            x = prevX;
        } else {
            x = prevX;
            z = prevZ;
        }
        if (Math.abs(_pose.speed) > 4) _pose.speed *= 0.65;
    }

    return { x, z };
}

function bindCityControlsOnce() {
    if (_listenersBound) return;
    _listenersBound = true;

    window.addEventListener('keydown', (e) => {
        if (!isCityInputActive()) return;
        const k = e.key.toLowerCase();
        if (k === 'w' || k === 'z' || e.key === 'ArrowUp') { _keys.fwd = true; e.preventDefault(); }
        else if (k === 's' || e.key === 'ArrowDown') { _keys.back = true; e.preventDefault(); }
        else if (k === 'a' || k === 'q' || e.key === 'ArrowLeft') { _keys.left = true; e.preventDefault(); }
        else if (k === 'd' || e.key === 'ArrowRight') { _keys.right = true; e.preventDefault(); }
        else if (e.code === 'Space') { _keys.boost = true; e.preventDefault(); }
        else if (k === 'v') { e.preventDefault(); cycleCityVehicle(); }
    });

    window.addEventListener('keyup', (e) => {
        const k = e.key.toLowerCase();
        if (k === 'w' || k === 'z' || e.key === 'ArrowUp') _keys.fwd = false;
        else if (k === 's' || e.key === 'ArrowDown') _keys.back = false;
        else if (k === 'a' || k === 'q' || e.key === 'ArrowLeft') _keys.left = false;
        else if (k === 'd' || e.key === 'ArrowRight') _keys.right = false;
        else if (e.code === 'Space') _keys.boost = false;
    });

    window.addEventListener('blur', clearCityKeys);

    // Optional camera orbit drag on canvas while driving
    const dom = globalThis.renderer ? globalThis.renderer.domElement : null;
    if (dom) {
        dom.addEventListener('pointerdown', (e) => {
            if (!isCityInputActive() || e.pointerType === 'touch') return;
            _dragOrbitPtr = e.pointerId;
            _dragLastX = e.clientX;
        });
        window.addEventListener('pointermove', (e) => {
            if (_dragOrbitPtr === e.pointerId && isCityInputActive()) {
                const dx = e.clientX - _dragLastX;
                _dragLastX = e.clientX;
                _camOrbitYaw = Math.max(-1.6, Math.min(1.6, _camOrbitYaw - dx * 0.005));
            }
        });
        window.addEventListener('pointerup', (e) => {
            if (_dragOrbitPtr === e.pointerId) _dragOrbitPtr = null;
        });
    }

    // Mobile Touch Joystick & Buttons
    const joy = document.getElementById('city-touch-joy');
    const knob = document.getElementById('city-touch-knob');
    if (joy) {
        joy.addEventListener('pointerdown', (e) => {
            if (!isCityInputActive()) return;
            const rect = joy.getBoundingClientRect();
            _touchJoy.active = true;
            _touchJoy.ptrId = e.pointerId;
            _touchJoy.cx = rect.left + rect.width / 2;
            _touchJoy.cy = rect.top + rect.height / 2;
            e.preventDefault();
        });
        window.addEventListener('pointermove', (e) => {
            if (!_touchJoy.active || e.pointerId !== _touchJoy.ptrId) return;
            const maxR = 38;
            let dx = e.clientX - _touchJoy.cx;
            let dy = e.clientY - _touchJoy.cy;
            const dist = Math.hypot(dx, dy);
            if (dist > maxR) {
                dx = (dx / dist) * maxR;
                dy = (dy / dist) * maxR;
            }
            _touchJoy.x = dx / maxR;
            _touchJoy.y = dy / maxR;
            if (knob) knob.style.transform = `translate(${Math.round(dx)}px, ${Math.round(dy)}px)`;
        });
        const stopJoy = (e) => {
            if (_touchJoy.active && (e.pointerId === undefined || e.pointerId === _touchJoy.ptrId)) {
                _touchJoy.active = false;
                _touchJoy.ptrId = null;
                _touchJoy.x = 0;
                _touchJoy.y = 0;
                if (knob) knob.style.transform = 'translate(0, 0)';
            }
        };
        window.addEventListener('pointerup', stopJoy);
        window.addEventListener('pointercancel', stopJoy);
    }

    const boostBtn = document.getElementById('city-btn-boost');
    if (boostBtn) {
        boostBtn.addEventListener('pointerdown', (e) => {
            if (!isCityInputActive()) return;
            _touchThrottle = true;
            _keys.boost = true;
            boostBtn.classList.add('is-down');
            e.preventDefault();
        });
        const stopBoost = () => {
            _touchThrottle = false;
            _keys.boost = false;
            boostBtn.classList.remove('is-down');
        };
        window.addEventListener('pointerup', stopBoost);
        window.addEventListener('pointercancel', stopBoost);
    }
}

export function initCityLocomotion(cityRootGroup) {
    if (_playerGroup) return;
    _playerGroup = new THREE.Group();
    _playerGroup.name = 'CityPlayerRig';
    _avatarHolder = new THREE.Group();
    _playerGroup.add(_avatarHolder);
    buildVehicleRigs(_playerGroup);
    cityRootGroup.add(_playerGroup);
    bindCityControlsOnce();
}

export function setCityPlayerPosition(x, z, yaw = Math.PI / 2) {
    const safe = resolveColliders(x, z, VEHICLE_SPECS[_pose.vehicle]?.radius || 0.8);
    _pose.x = safe.x;
    _pose.z = safe.z;
    _pose.y = getCityGroundHeight(_pose.x, _pose.z);
    _pose.yaw = yaw;
    _pose.speed = 0;
    if (_playerGroup) {
        _playerGroup.position.set(_pose.x, _pose.y, _pose.z);
        _playerGroup.rotation.y = _pose.yaw;
    }
    if (typeof globalThis.state === 'object' && globalThis.state) {
        globalThis.state.cityPos = { x: _pose.x, z: _pose.z, rot: _pose.yaw };
    }
}

export function onEnterCity(spawnPos = null) {
    syncCityAvatarAppearance();
    const st = (typeof globalThis.state === 'object' && globalThis.state) ? globalThis.state : {};
    const unlocked = getUnlockedVehicles();
    const desired = (st.vehicleManual && st.vehicleMode && unlocked[st.vehicleMode]) ? st.vehicleMode : getBestUnlockedVehicle();
    setCityVehicleMode(desired, true);

    const sx = spawnPos ? spawnPos.x : ((st.cityPos && typeof st.cityPos.x === 'number') ? st.cityPos.x : 0);
    const sz = spawnPos ? spawnPos.z : ((st.cityPos && typeof st.cityPos.z === 'number') ? st.cityPos.z : 14);
    const sy = (spawnPos && typeof spawnPos.rot === 'number') ? spawnPos.rot : ((st.cityPos && typeof st.cityPos.rot === 'number') ? st.cityPos.rot : Math.PI / 2);
    setCityPlayerPosition(sx, sz, sy);
    _camOrbitYaw = 0;
    _lastFrameMs = performance.now();

    // Snap camera immediately behind player so first frame has zero swoop artifact
    const spec = VEHICLE_SPECS[_pose.vehicle];
    if (globalThis.camera) {
        globalThis.camera.position.set(
            _pose.x - Math.sin(_pose.yaw) * spec.camDist,
            spec.camHeight + _pose.y + 0.6,
            _pose.z - Math.cos(_pose.yaw) * spec.camDist
        );
        globalThis.camera.lookAt(_pose.x, _pose.y + 1.3, _pose.z);
        globalThis.camera.fov = spec.fov;
        globalThis.camera.updateProjectionMatrix();
    }
}

export function onExitCity() {
    clearCityKeys();
    if (typeof globalThis.state === 'object' && globalThis.state) {
        globalThis.state.cityPos = { x: _pose.x, z: _pose.z, rot: _pose.yaw };
        globalThis.state.vehicleMode = _pose.vehicle;
    }
}

export function tickCityLocomotion(tSec) {
    const now = performance.now();
    const dt = _lastFrameMs ? Math.min(0.05, Math.max(0.004, (now - _lastFrameMs) / 1000)) : 0.016;
    _lastFrameMs = now;

    const spec = VEHICLE_SPECS[_pose.vehicle] || VEHICLE_SPECS.foot;
    const canDrive = isCityInputActive();

    let throttle = 0;
    let steer = 0;
    if (canDrive) {
        if (_keys.fwd || _touchThrottle) throttle += 1;
        if (_keys.back) throttle -= 0.7;
        if (_keys.left) steer += 1;
        if (_keys.right) steer -= 1;
        if (_touchJoy.active) {
            if (Math.abs(_touchJoy.y) > 0.14) throttle = Math.max(-0.7, Math.min(1, -_touchJoy.y));
            if (Math.abs(_touchJoy.x) > 0.14) steer = Math.max(-1, Math.min(1, -_touchJoy.x));
        }
    }

    const boostMult = (canDrive && _keys.boost && throttle > 0) ? spec.boostMult : 1.0;
    const targetMax = spec.maxSpeed * boostMult;

    if (Math.abs(throttle) > 0.02) {
        _pose.speed += throttle * spec.accel * dt;
    } else {
        const decay = Math.exp(-spec.drag * dt);
        _pose.speed *= decay;
        if (Math.abs(_pose.speed) < 0.08) _pose.speed = 0;
    }
    _pose.speed = Math.max(-spec.maxSpeed * 0.42, Math.min(targetMax, _pose.speed));

    // Steering works smoothly on foot/scooter and speeds up cleanly while rolling
    const steerScale = _pose.vehicle === 'car'
        ? (0.35 + Math.min(0.65, Math.abs(_pose.speed) / 12)) * (_pose.speed < -0.5 ? -1 : 1)
        : 1.0;
    _pose.yaw += steer * spec.turnSpeed * steerScale * dt;

    // Gentle camera re-center when moving
    if (Math.abs(_pose.speed) > 1.0 && _dragOrbitPtr === null) {
        _camOrbitYaw *= Math.exp(-3.2 * dt);
    }

    const nextX = _pose.x + Math.sin(_pose.yaw) * _pose.speed * dt;
    const nextZ = _pose.z + Math.cos(_pose.yaw) * _pose.speed * dt;
    const safe = resolveColliders(nextX, nextZ, spec.radius, _pose.x, _pose.z);
    _pose.x = safe.x;
    _pose.z = safe.z;
    const targetGroundY = getCityGroundHeight(_pose.x, _pose.z);
    _pose.y += (targetGroundY - _pose.y) * (1 - Math.exp(-14 * dt));

    if (_playerGroup) {
        _playerGroup.position.set(_pose.x, _pose.y, _pose.z);
        _playerGroup.rotation.y = _pose.yaw;
    }

    // Subtle procedural animation on avatar & wheels
    if (_avatarMesh) {
        if (_pose.vehicle === 'foot' && Math.abs(_pose.speed) > 0.4) {
            _avatarMesh.position.y = Math.abs(Math.sin(tSec * 14)) * 0.06;
            _avatarMesh.rotation.z = Math.sin(tSec * 7) * 0.035;
        } else {
            _avatarMesh.position.y = 0;
            _avatarMesh.rotation.z = steer * -0.08 * Math.min(1, Math.abs(_pose.speed) / 12);
        }
    }

    const wheelSpin = (_pose.speed * dt) / 0.28;
    for (let i = 0; i < _spinWheels.length; i++) {
        _spinWheels[i].rotation.x += wheelSpin;
    }
    if (_carBrakeMat) {
        _carBrakeMat.color.set((throttle < 0 || (_keys.back && canDrive)) ? '#ff1f5a' : '#881337');
    }
    if (_headlightPoint && _headlightConeMat) {
        const tM = (typeof globalThis.state === 'object' && globalThis.state && typeof globalThis.state.timeMins === 'number')
            ? globalThis.state.timeMins : 1080;
        const hrNow = (((tM % 1440) + 1440) % 1440) / 60;
        const lightsOn = (_pose.vehicle !== 'foot') && (hrNow >= 17.0 || hrNow < 7.5);
        _headlightPoint.intensity = lightsOn ? (hrNow >= 20.0 || hrNow < 6.5 ? 26 : 14) : 0;
        _headlightConeMat.opacity = lightsOn && _pose.vehicle === 'car' ? (hrNow >= 20.0 || hrNow < 6.5 ? 0.11 : 0.05) : 0;
    }

    // Chase Camera Smooth Follow
    if (globalThis.camera) {
        const cam = globalThis.camera;
        const viewYaw = _pose.yaw + _camOrbitYaw;
        const speedFrac = Math.min(1, Math.abs(_pose.speed) / spec.maxSpeed);
        const targetDist = spec.camDist + speedFrac * 1.1;
        const cx = _pose.x - Math.sin(viewYaw) * targetDist;
        const cz = _pose.z - Math.cos(viewYaw) * targetDist;
        const cy = spec.camHeight + _pose.y;

        const smooth = 1 - Math.exp(-8.5 * dt);
        cam.position.x += (cx - cam.position.x) * smooth;
        cam.position.y += (cy - cam.position.y) * smooth;
        cam.position.z += (cz - cam.position.z) * smooth;

        const lookX = _pose.x + Math.sin(_pose.yaw) * 2.2;
        const lookZ = _pose.z + Math.cos(_pose.yaw) * 2.2;
        cam.lookAt(lookX, _pose.y + 1.35, lookZ);

        const targetFov = spec.fov + (boostMult > 1.05 ? 5.5 : 0);
        if (Math.abs(cam.fov - targetFov) > 0.15) {
            cam.fov += (targetFov - cam.fov) * smooth;
            cam.updateProjectionMatrix();
        }
    }

    return {
        x: _pose.x,
        z: _pose.z,
        yaw: _pose.yaw,
        speedKmh: Math.abs(_pose.speed) * 3.6,
        vehicle: _pose.vehicle
    };
}

export function getCityPlayerPose() {
    return { ..._pose };
}
