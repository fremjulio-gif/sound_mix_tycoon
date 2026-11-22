import { getCityLandmarks } from './city-world.js';
import { getNearestCityNpc, interactWithCityNpc, getCityVipMinimapDots } from './city-npcs.js';
import {
    VEHICLE_ORDER,
    VEHICLE_SPECS,
    clearCityKeys,
    getUnlockedVehicles,
    isCityInputActive,
    setCityPlayerPosition,
    setCityVehicleMode
} from './city-locomotion.js';

let _activeLandmark = null;
let _activeNpc = null;
let _triggersBound = false;
let _lastVehDomSig = '';
let _lastPromptId = '';

export function getDistrictInfo(x, z) {
    if (Math.abs(z) <= 11.5) return { name: 'BOULEVARD 808', color: '#38bdf8' };
    if (Math.abs(x) <= 11.5) return { name: 'AVENUE DU FLOW', color: '#e2e8f0' };
    if (x < 0 && z < 0) return { name: 'BANLIEUE NORD', color: '#f59e0b' };
    if (x < 0 && z > 0) return { name: 'VINYL ROW INDÉ', color: '#10b981' };
    if (x > 0 && z > 0) return { name: 'AVENUE DES CLUBS', color: '#a855f7' };
    return { name: 'DISTRICT 42 · SKYLINE', color: '#fbbf24' };
}

function openAbleOsFromCity() {
    const pcUi = document.getElementById('pc-ui-layer');
    if (pcUi) pcUi.style.display = 'flex';
    document.body.classList.add('os-active');
    if (typeof globalThis.updateTaskbar === 'function') globalThis.updateTaskbar();
}

export function executeLandmarkAction(lm) {
    if (!lm) return;
    clearCityKeys();
    const st = (typeof globalThis.state === 'object' && globalThis.state) ? globalThis.state : {};

    switch (lm.id) {
        case 'bedroom':
            if (typeof window.exitCityToInterior === 'function') window.exitCityToInterior('bedroom');
            break;
        case 'pro_studio':
            if (st.studioUnlocked || String(st.username || '').toUpperCase() === 'DEV_STUDIO') {
                if (typeof window.exitCityToInterior === 'function') window.exitCityToInterior('pro_studio');
            } else {
                if (typeof globalThis.showToast === 'function') {
                    globalThis.showToast('🏢 Tour 42e verrouillée : atteins 80% de Global Mastery ! Aperçu Label HQ ouvert.', 'info');
                }
                openAbleOsFromCity();
                if (typeof window.openEmpireApp === 'function') window.openEmpireApp('label');
            }
            break;
        case 'vinyl_shop':
            openAbleOsFromCity();
            if (typeof window.openSampleDigger === 'function') window.openSampleDigger();
            break;
        case 'gear_shop':
            openAbleOsFromCity();
            if (typeof globalThis.openApp === 'function') globalThis.openApp('app-browser');
            if (typeof globalThis.switchBrowserTab === 'function') globalThis.switchBrowserTab('furniture');
            break;
        case 'showcase_club':
            if (typeof window.openBounceShowcase === 'function') window.openBounceShowcase(false);
            break;
        case 'rival_hq':
            openAbleOsFromCity();
            if (typeof window.openEmpireApp === 'function') window.openEmpireApp('network');
            break;
        default:
            break;
    }
    document.body.classList.toggle('city-modal-open', hasBlockingCityModalOpen());
}

export function triggerActiveCityLandmark() {
    if (_activeNpc) {
        interactWithCityNpc(_activeNpc);
    } else if (_activeLandmark) {
        executeLandmarkAction(_activeLandmark);
    }
}

export function fastTravelToLandmark(id) {
    const lm = getCityLandmarks().find(l => l.id === id);
    if (!lm) return;
    setCityPlayerPosition(lm.tx, lm.tz + 4.5, Math.PI);
    closeCityGpsModal();
    if (typeof globalThis.playBleep === 'function') globalThis.playBleep();
    if (typeof globalThis.showToast === 'function') {
        globalThis.showToast(`📍 GPS arrivé à : ${lm.title}`, 'info');
    }
}

export function openCityGpsModal() {
    const modal = document.getElementById('city-gps-modal');
    const listEl = document.getElementById('city-gps-list');
    if (!modal || !listEl) return;
    clearCityKeys();

    const pose = (typeof window._getCityPose === 'function') ? window._getCityPose() : { x: 0, z: 14 };
    const landmarks = getCityLandmarks();

    listEl.innerHTML = landmarks.map(lm => {
        const dist = Math.round(Math.hypot(lm.tx - pose.x, lm.tz - pose.z));
        return `
            <button type="button" class="city-gps-item" data-gps-id="${lm.id}">
                <div class="flex items-center gap-3 min-w-0">
                    <span class="w-2.5 h-2.5 rounded-full shrink-0" style="background:${lm.accentHex}; box-shadow:0 0 10px ${lm.accentHex};"></span>
                    <div class="min-w-0">
                        <div class="text-xs font-extrabold text-white truncate">${lm.title}</div>
                        <div class="text-[10px] font-mono text-slate-400 truncate">${lm.district} · ${lm.subtitle}</div>
                    </div>
                </div>
                <span class="text-[10px] font-mono font-bold text-sky-300 shrink-0">${dist}m →</span>
            </button>
        `;
    }).join('');

    listEl.querySelectorAll('[data-gps-id]').forEach(btn => {
        btn.onclick = () => fastTravelToLandmark(btn.getAttribute('data-gps-id'));
    });

    modal.classList.remove('hidden');
}

export function closeCityGpsModal() {
    const modal = document.getElementById('city-gps-modal');
    if (modal) modal.classList.add('hidden');
}

function drawMiniMap(pose) {
    const canvas = document.getElementById('city-minimap');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const S = canvas.width;
    const worldToMap = (v) => ((v + 160) / 320) * S;

    ctx.fillStyle = '#05070c';
    ctx.fillRect(0, 0, S, S);

    // 4 district quadrants
    const drawBlock = (x0, z0, x1, z1, col) => {
        ctx.fillStyle = col;
        ctx.fillRect(worldToMap(x0), worldToMap(z0), worldToMap(x1) - worldToMap(x0), worldToMap(z1) - worldToMap(z0));
    };
    drawBlock(-92, -92, -11, -11, 'rgba(245, 158, 11, 0.14)');
    drawBlock(-92, 11, -11, 92, 'rgba(16, 185, 129, 0.14)');
    drawBlock(11, 11, 92, 92, 'rgba(168, 85, 247, 0.16)');
    drawBlock(11, -92, 92, -11, 'rgba(251, 191, 36, 0.16)');

    // Main Avenues
    ctx.fillStyle = 'rgba(148, 163, 184, 0.24)';
    ctx.fillRect(0, worldToMap(-11), S, worldToMap(11) - worldToMap(-11));
    ctx.fillRect(worldToMap(-11), 0, worldToMap(11) - worldToMap(-11), S);

    // Central Fountain ring
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.8)';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.arc(worldToMap(0), worldToMap(0), 2.8, 0, Math.PI * 2);
    ctx.stroke();

    // Landmarks
    const landmarks = getCityLandmarks();
    for (let i = 0; i < landmarks.length; i++) {
        const lm = landmarks[i];
        ctx.fillStyle = lm.accentHex;
        ctx.beginPath();
        ctx.arc(worldToMap(lm.tx), worldToMap(lm.tz), 3.3, 0, Math.PI * 2);
        ctx.fill();
    }

    // VIP NPC micro-dots
    const vipDots = getCityVipMinimapDots();
    for (let i = 0; i < vipDots.length; i++) {
        const v = vipDots[i];
        ctx.fillStyle = '#e0f2fe';
        ctx.beginPath();
        ctx.arc(worldToMap(v.x), worldToMap(v.z), 1.8, 0, Math.PI * 2);
        ctx.fill();
    }

    // Player heading triangle
    const px = worldToMap(pose.x);
    const pz = worldToMap(pose.z);
    ctx.save();
    ctx.translate(px, pz);
    // In canvas, -Y is North (-Z world), +X is East (+X world); yaw=0 faces +Z (+Y canvas)
    ctx.rotate(-pose.yaw);
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(0, 5.5);
    ctx.lineTo(-3.8, -4.2);
    ctx.lineTo(3.8, -4.2);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
}

export function initCityTriggers() {
    if (_triggersBound) return;
    _triggersBound = true;

    window.addEventListener('keydown', (e) => {
        if (!isCityInputActive()) return;
        if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
        const k = e.key.toLowerCase();
        if (k === 'e') {
            if (_activeNpc || _activeLandmark) {
                e.preventDefault();
                triggerActiveCityLandmark();
            }
        } else if (k === 'g') {
            e.preventDefault();
            if (typeof window.exitCityToInterior === 'function') window.exitCityToInterior();
        }
    });

    const banner = document.getElementById('city-interact-banner');
    if (banner) banner.onclick = () => triggerActiveCityLandmark();

    const enterBtn = document.getElementById('city-btn-enter');
    if (enterBtn) enterBtn.onclick = () => triggerActiveCityLandmark();

    const vehBtn = document.getElementById('city-btn-veh-cycle');
    if (vehBtn) vehBtn.onclick = () => { if (typeof window.cycleCityVehicle === 'function') window.cycleCityVehicle(); };

    const gpsBtn = document.getElementById('city-btn-gps');
    if (gpsBtn) gpsBtn.onclick = () => openCityGpsModal();

    const studioBtn = document.getElementById('city-btn-return-studio');
    if (studioBtn) studioBtn.onclick = () => { if (typeof window.exitCityToInterior === 'function') window.exitCityToInterior(); };

    const gpsClose = document.getElementById('city-gps-close');
    if (gpsClose) gpsClose.onclick = () => closeCityGpsModal();

    document.querySelectorAll('[data-city-veh]').forEach(btn => {
        btn.onclick = () => setCityVehicleMode(btn.getAttribute('data-city-veh'));
    });
}

function hasBlockingCityModalOpen() {
    const ids = [
        'showcase-overlay',
        'ceremony-overlay',
        'event-overlay',
        'review-overlay',
        'qte-diss-overlay',
        'minigames-menu-overlay',
        'audio-settings-overlay',
        'city-gps-modal'
    ];
    for (let i = 0; i < ids.length; i++) {
        const el = document.getElementById(ids[i]);
        if (el && !el.classList.contains('hidden') && el.style.display !== 'none') {
            return true;
        }
    }
    return false;
}

export function tickCityTriggers(pose) {
    if (!pose) return;
    document.body.classList.toggle('city-modal-open', hasBlockingCityModalOpen());

    // 1. District & Speedometer
    const distInfo = getDistrictInfo(pose.x, pose.z);
    const dName = document.getElementById('city-district-name');
    const dDot = document.getElementById('city-district-dot');
    if (dName && dName.textContent !== distInfo.name) dName.textContent = distInfo.name;
    if (dDot) dDot.style.background = distInfo.color;

    const spEl = document.getElementById('city-speedo-val');
    if (spEl) spEl.textContent = String(Math.round(pose.speedKmh || 0));

    // 2. Vehicle Pills Sync
    const unlocked = getUnlockedVehicles();
    const sig = `${pose.vehicle}|${unlocked.bike ? 1 : 0}|${unlocked.car ? 1 : 0}`;
    if (sig !== _lastVehDomSig) {
        _lastVehDomSig = sig;
        VEHICLE_ORDER.forEach(vId => {
            const btn = document.querySelector(`[data-city-veh="${vId}"]`);
            if (!btn) return;
            const isOk = Boolean(unlocked[vId]);
            btn.classList.toggle('is-active', pose.vehicle === vId);
            btn.classList.toggle('is-locked', !isOk);
            const lockEl = btn.querySelector('.city-veh-lock-tag');
            if (lockEl) lockEl.classList.toggle('hidden', isOk);
            btn.title = isOk ? `${VEHICLE_SPECS[vId].label}` : `${VEHICLE_SPECS[vId].label} (Verrouillé — monte de niveau !)`;
        });
    }

    // 3. Nearest Landmark vs VIP NPC Detection
    const landmarks = getCityLandmarks();
    let best = null;
    let bestD = 9.0;
    for (let i = 0; i < landmarks.length; i++) {
        const lm = landmarks[i];
        const d = Math.hypot(lm.tx - pose.x, lm.tz - pose.z);
        if (d < bestD) {
            bestD = d;
            best = lm;
        }
    }

    const nearNpc = getNearestCityNpc(pose.x, pose.z, 4.5);
    let activeNpc = null;
    if (nearNpc) {
        const dNpc = Math.hypot(nearNpc.x - pose.x, nearNpc.z - pose.z);
        if (!best || dNpc < 3.8 || dNpc < bestD) {
            activeNpc = nearNpc;
        }
    }
    _activeNpc = activeNpc;
    _activeLandmark = activeNpc ? null : best;

    const newPromptKey = activeNpc ? `npc:${activeNpc.id}` : (best ? `lm:${best.id}` : '');
    if (newPromptKey !== _lastPromptId) {
        _lastPromptId = newPromptKey;
        const banner = document.getElementById('city-interact-banner');
        const bTitle = document.getElementById('city-interact-title');
        const bSub = document.getElementById('city-interact-sub');
        const mobEnter = document.getElementById('city-btn-enter');

        if (activeNpc && banner && bTitle && bSub) {
            bTitle.textContent = `Parler à ${activeNpc.name}`;
            bSub.textContent = `${activeNpc.role} · Appuie sur E`;
            banner.style.borderColor = activeNpc.accentHex;
            banner.classList.add('visible');
        } else if (best && banner && bTitle && bSub) {
            bTitle.textContent = best.title;
            bSub.textContent = best.subtitle;
            banner.style.borderColor = best.accentHex;
            banner.classList.add('visible');
        } else if (banner) {
            banner.classList.remove('visible');
        }
        if (mobEnter) {
            const hasTarget = Boolean(activeNpc || best);
            mobEnter.classList.toggle('hidden', !hasTarget);
            if (activeNpc) mobEnter.textContent = `PARLER · ${activeNpc.name.toUpperCase()}`;
            else if (best) mobEnter.textContent = `ENTRER · ${best.title.split('·')[0].trim()}`;
        }
    }

    // 4. Mini-map radar
    drawMiniMap(pose);
}
