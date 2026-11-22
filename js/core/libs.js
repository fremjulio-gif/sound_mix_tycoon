import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
import { animate, createTimeline, stagger, spring, waapi } from 'https://cdn.jsdelivr.net/npm/animejs@4.5.0/dist/bundles/anime.esm.min.js';

// Global bridges for seamless cross-module & inline handler compatibility
Object.assign(globalThis, {
    THREE,
    animate,
    createTimeline,
    stagger,
    spring,
    waapi
});

export { THREE, animate, createTimeline, stagger, spring, waapi };
