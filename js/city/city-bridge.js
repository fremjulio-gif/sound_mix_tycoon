import { registerStateNormalizer } from '../core/state.js';

/**
 * Palier 0 -> Palier 1 Open-World Adapter Bridge.
 * Keeps Paliers 1-3 decoupled while guaranteeing save compatibility and location dispatch.
 */
const _cityState = {
    handler: null,
    active: false
};

export function normalizeCityState(targetState) {
    if (!targetState || typeof targetState !== 'object') return targetState;
    if (!targetState.cityPos || typeof targetState.cityPos !== 'object') {
        targetState.cityPos = { x: 0, z: 12, rot: 0 };
    }
    if (!targetState.vehicleMode) {
        targetState.vehicleMode = 'foot';
    }
    targetState.heatLevel = Math.max(0, Math.min(5, Number(targetState.heatLevel) || 0));
    targetState.heatReasons = Array.isArray(targetState.heatReasons) ? targetState.heatReasons : [];
    if (targetState.activeStreetMission === undefined) {
        targetState.activeStreetMission = null;
    }
    return targetState;
}

export function registerCityModule(api) {
    _cityState.handler = api || null;
}

export function dispatchCityLocation(loc) {
    const enteringCity = (loc === 'city');
    _cityState.active = enteringCity;
    if (_cityState.handler && typeof _cityState.handler.onLocationChange === 'function') {
        _cityState.handler.onLocationChange(loc);
    }
}

export function tickCity(tSec) {
    if (!_cityState.active) return;
    if (_cityState.handler && typeof _cityState.handler.tick === 'function') {
        _cityState.handler.tick(tSec);
    }
}

export function initCityBridge() {
    registerStateNormalizer(normalizeCityState);
    if (typeof globalThis.state === 'object' && globalThis.state) {
        normalizeCityState(globalThis.state);
    }
    window._cityBridge = {
        registerCityModule,
        dispatchLocation: dispatchCityLocation
    };
    window._cityTick = tickCity;
}

Object.assign(globalThis, {
    normalizeCityState,
    registerCityModule,
    dispatchCityLocation,
    initCityBridge
});
