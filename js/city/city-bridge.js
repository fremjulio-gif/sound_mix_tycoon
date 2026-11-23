import { registerStateNormalizer } from '../core/state.js';
import {
    buildCityWorld,
    refreshCityDynamicSigns,
    updateCityEnvironment
} from './city-world.js';
import {
    cycleCityVehicle,
    getCityPlayerPose,
    initCityLocomotion,
    onEnterCity,
    onExitCity,
    setCityVehicleMode,
    tickCityLocomotion
} from './city-locomotion.js';
import {
    closeCityGpsModal,
    initCityTriggers,
    openCityGpsModal,
    tickCityTriggers,
    triggerActiveCityLandmark,
    fastTravelToLandmark
} from './city-triggers.js';
import {
    initCityNpcs,
    onNantesManifestApplied,
    syncCityVipNpcs,
    refreshCityBillboards,
    tickCityNpcs
} from './city-npcs.js';

/**
 * Palier 1 — Open-World City Controller & Adapter Bridge.
 */
const _cityState = {
    active: false,
    built: false,
    root: null,
    lastInteriorLoc: 'bedroom'
};

export function normalizeCityState(targetState) {
    if (!targetState || typeof targetState !== 'object') return targetState;
    if (!targetState.cityPos || typeof targetState.cityPos !== 'object') {
        targetState.cityPos = { x: -24, z: -18, rot: Math.PI * 0.25 };
    }
    if (!targetState.vehicleMode) {
        targetState.vehicleMode = null;
    }
    targetState.vehicleManual = Boolean(targetState.vehicleManual);
    targetState.heatLevel = Math.max(0, Math.min(5, Number(targetState.heatLevel) || 0));
    targetState.heatReasons = Array.isArray(targetState.heatReasons) ? targetState.heatReasons : [];
    if (targetState.activeStreetMission === undefined) {
        targetState.activeStreetMission = null;
    }
    targetState.cityNpcMetDay = (targetState.cityNpcMetDay && typeof targetState.cityNpcMetDay === 'object')
        ? targetState.cityNpcMetDay
        : {};
    return targetState;
}

function ensureCityWorldBuilt() {
    if (_cityState.built && _cityState.root) return _cityState.root;
    if (!globalThis.scene) return null;
    const root = buildCityWorld(globalThis.scene);
    initCityLocomotion(root);
    initCityNpcs(root);
    initCityTriggers();
    _cityState.root = root;
    _cityState.built = true;
    return root;
}

export function enterCityWorld(fromLoc = null) {
    if (typeof window.exitFpsPointerLock === 'function') window.exitFpsPointerLock();
    const st = (typeof globalThis.state === 'object' && globalThis.state) ? globalThis.state : null;
    const prev = fromLoc || (window.activeStudioLocation === 'pro_studio' ? 'pro_studio' : 'bedroom');
    if (prev === 'bedroom' || prev === 'pro_studio') {
        _cityState.lastInteriorLoc = prev;
    }

    const root = ensureCityWorldBuilt();
    if (!root) return;

    syncCityVipNpcs();
    refreshCityDynamicSigns();
    refreshCityBillboards();

    const spawnOverride = prev === 'pro_studio'
        ? { x: -20.3, z: -512.0, rot: Math.PI }
        : { x: 680.8, z: 102.0, rot: Math.PI };

    document.body.classList.add('city-active');
    const hud = document.getElementById('city-hud');
    if (hud) hud.classList.remove('hidden');

    if (typeof window.applyStudioLocation === 'function') {
        window.applyStudioLocation('city');
    }
    onEnterCity(spawnOverride);
    if (typeof globalThis.playBleep === 'function') globalThis.playBleep();
    if (typeof globalThis.showToast === 'function' && st) {
        const veh = st.vehicleMode || 'scooter';
        globalThis.showToast(`🌆 Sortie en ville (${veh.toUpperCase()}) · [G] pour rentrer au Studio`, 'info');
    }
}

export function exitCityToInterior(targetLoc = null) {
    const resolved = targetLoc || _cityState.lastInteriorLoc || 'bedroom';
    closeCityGpsModal();
    onExitCity();

    document.body.classList.remove('city-active', 'city-modal-open');
    const hud = document.getElementById('city-hud');
    if (hud) hud.classList.add('hidden');

    // Restore sky dome origin, indoor fog & base FPS camera before indoor switch
    if (window.skyDomeMesh) window.skyDomeMesh.position.set(0, 0, 0);
    if (globalThis.scene) {
        globalThis.scene.fog = new THREE.FogExp2('#162033', 0.008);
    }
    if (globalThis.camera && typeof window.getBaseFpsFov === 'function') {
        globalThis.camera.fov = window.getBaseFpsFov();
        globalThis.camera.updateProjectionMatrix();
    }

    if (typeof window.applyStudioLocation === 'function') {
        window.applyStudioLocation(resolved);
    }
    if (globalThis.currentRoomAvatar) {
        if (resolved === 'pro_studio') {
            globalThis.currentRoomAvatar.position.set(-0.9, -1.0, 0.1);
            if (window.fps) { window.fps.yaw = -1.52; window.fps.pitch = -0.02; }
        } else {
            globalThis.currentRoomAvatar.position.set(0.2, -1.0, 2.4);
            if (window.fps) { window.fps.yaw = 0.42; window.fps.pitch = -0.04; }
        }
    }
    if (typeof globalThis.saveGame === 'function') globalThis.saveGame();
}

export function dispatchCityLocation(loc) {
    const enteringCity = (loc === 'city');
    _cityState.active = enteringCity;
    if (enteringCity) {
        const root = ensureCityWorldBuilt();
        if (root) root.visible = true;
    } else {
        if (_cityState.root) _cityState.root.visible = false;
        document.body.classList.remove('city-active', 'city-modal-open');
        const hud = document.getElementById('city-hud');
        if (hud) hud.classList.add('hidden');
    }
}

export function tickCity(tSec) {
    if (!_cityState.active || !_cityState.built) return;
    const pose = tickCityLocomotion(tSec);
    updateCityEnvironment(tSec, pose);
    tickCityNpcs(tSec, pose);
    tickCityTriggers(pose);
}

export function initCityBridge() {
    registerStateNormalizer(normalizeCityState);
    if (typeof globalThis.state === 'object' && globalThis.state) {
        normalizeCityState(globalThis.state);
    }
    window._cityBridge = {
        dispatchLocation: dispatchCityLocation,
        refreshDynamicSigns: refreshCityDynamicSigns
    };
    window._refreshCityBillboards = refreshCityBillboards;
    window._onNantesManifestReady = (manifest) => {
        onNantesManifestApplied(manifest);
    };
    window._cityTick = tickCity;
    window._getCityPose = getCityPlayerPose;
}

Object.assign(globalThis, {
    normalizeCityState,
    dispatchCityLocation,
    initCityBridge,
    enterCityWorld,
    exitCityToInterior,
    setCityVehicleMode,
    cycleCityVehicle,
    triggerActiveCityLandmark,
    openCityGpsModal,
    closeCityGpsModal,
    fastTravelToLandmark,
    refreshCityDynamicSigns
});
