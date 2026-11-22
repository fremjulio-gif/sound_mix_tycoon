// BOUNCE IT — Native ES Module Entrypoint (Palier 0)
import './core/libs.js';
import './core/state.js';
import { initAudioModule } from './core/audio.js';
import './core/tick.js';
import {
    initLoader,
    initTooltipListeners,
    initCinematicsListeners,
    startCinematicRandomLoop,
    normalizeAchievementState,
    initUI
} from './core/ui-hud.js';
import { initSceneCore, animate3D } from './studio/scene-core.js';
import { initBedroomScene } from './studio/room-bedroom.js';
import { initProStudio42 } from './studio/room-pro42.js';
import { initAvatars } from './studio/avatars.js';
import { initInteractions } from './studio/interactions.js';
import './daw/ablestudio.js';
import './daw/social-events.js';
import './daw/stats-shop.js';
import { initEmpireOS } from './empire/label-hq.js';
import { initShowcaseCCTV } from './empire/showcase-cctv.js';
import { initCityBridge } from './city/city-bridge.js';

function boot() {
    // 1. Visual cleanup before initialization
    const reviewOverlay = document.getElementById('review-overlay');
    if (reviewOverlay) {
        reviewOverlay.classList.add('hidden');
        reviewOverlay.style.opacity = '0';
    }

    // 2. State, Achievements & City Bridge normalization
    normalizeAchievementState();
    initCityBridge();

    // 3. Audio & Tooltip listeners
    initAudioModule();
    initTooltipListeners();
    initCinematicsListeners();
    startCinematicRandomLoop();

    // 4. Three.js Scene -> Bedroom Architecture -> Studio Pro 42 -> Interactions -> Avatars
    initSceneCore();
    const pbrCtx = initBedroomScene();
    initProStudio42(pbrCtx);
    initInteractions();
    initAvatars();

    // 5. Empire OS & Showcase CCTV
    initEmpireOS();
    initShowcaseCCTV();

    // 6. Loader & HUD / Login / Window Manager UI
    initLoader();
    initUI();

    // 7. Start 3D Render Loop
    animate3D();

    window.BOUNCE_MODULES = Object.freeze({
        version: 'palier-0-esm',
        cityReady: true
    });
}

// ==========================================
// BOOT SEQUENCE (Tout en bas du script)
// ==========================================

// On nettoie l'interface visuellement AVANT de l'initialiser
const reviewOverlay = document.getElementById('review-overlay');
if (reviewOverlay) {
    reviewOverlay.classList.add('hidden');
    reviewOverlay.style.opacity = '0';
}
        
        // Boot


            window.addEventListener('beforeunload', saveGame);

                document.addEventListener('visibilitychange', () => {
                        if (document.visibilityState === 'hidden') saveGame();
    });

            let secretBuffer = [];
            const SECRET_CODE = ['b', 'o', 'u', 'n', 'c', 'e'];
            window.addEventListener('keydown', (e) => {
                if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
                secretBuffer.push(e.key.toLowerCase());
                if (secretBuffer.length > SECRET_CODE.length) secretBuffer.shift();
                if (secretBuffer.join('') === SECRET_CODE.join('')) {
                    if (typeof window.triggerCinematic === 'function') {
                        window.triggerCinematic('reward', {
                            title: 'BOUNCE MASTER',
                            subtitle: 'Easter Egg Débloqué (+500$)',
                            tag: 'SECRET REWARD'
                        });
                    }
                    showToast("🎉 Code secret activé. +500$ pour le fun.", "success");
                    logMoney(500, "Easter Egg");
                    if(typeof playSuccess === 'function') playSuccess();
                    secretBuffer = [];
                }
            });

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
} else {
    boot();
}
