import { THREE } from '../core/libs.js';

        

        function checkCollision(x, z) {
            const r = 0.6;
            if (window.activeStudioLocation === 'pro_studio') {
                const rp = 0.22;
                // Limites spacieuses du Complexe Studio Pro 42e (16×12m)
                if (x < -7.55 || x > 7.55 || z < -5.55 || z > 5.55) return true;
                // Grande Console SSL sur l'Estrade (x ≈ 3.2..4.7, z ≈ -2.3..2.1)
                if (x > 3.25 - rp && x < 4.70 + rp && z > -2.35 - rp && z < 2.15 + rp) return true;
                // 2 Tours de Racks 19" Géantes encadrant la Console (x ≈ 3.3..4.3, z ≈ -3.1..-2.3 et +2.1..+2.9)
                if (x > 3.25 - rp && x < 4.45 + rp && ((z > -3.15 && z < -2.25) || (z > 2.05 && z < 2.95))) return true;
                // 2 Murs Acoustiques Inclinés à Pans Coupés (Nord-Est & Sud-Est)
                if (x > 5.55 && (z < -2.25 || z > 2.05)) return true;
                // Cloison Vitrée de la Live Room (z ≈ -2.55, x < -1.0; passage libre à droite x > -0.9!)
                if (x < -1.05 && z > -2.85 && z < -2.30) return true;
                // Piano à Queue & Batterie Acoustique dans la Live Room (Nord)
                if (x > -6.65 && x < -1.85 && z < -3.35) return true;
                // Crédence Hall of Fame + Bar VIP & Frigo Vitré (Sud-Ouest)
                if (x > -6.65 && x < 0.65 && z > 4.65 - rp) return true;
                // Grand Canapé Producteur / Client Sweet Spot + Table Basse Marbre (Ouest-Centre, face Console SSL)
                if (x > -6.08 - rp && x < -3.72 + rp && z > -1.62 - rp && z < 2.32 + rp) return true;
                return false;
            }
            if (x > -4.45 - r && x < 0.05 + r && z > -4.6 - r && z < -2.4 + r) return true; // Bureau
            if (x > 2.6 - r && x < 5.0 + r && z > -5.0 - r && z < -0.8 + r) return true;    // Lit
            if (x < -5 + r || x > 5 - r || z < -5 + r || z > 5 - r) return true;            // Murs
            // 3. NOUVEAU : CANAPé Lounge (x: 1.8 à 4.2, z: 1.3 à 3.7)
            if (x > -5.0 - r && x < -3.6 + r && z > -0.2 - r && z < 3.2 + r) return true;
            // 4. NOUVEAU : Rack Hardware Analogique (x: -4.8 à -3.6, z: 1.1 à 1.9)
            if (x > 0.75 - r && x < 1.85 + r && z > -4.9 - r && z < -4.1 + r) return true;

            // 5. NOUVEAU : Plante Verte (x: -4.4 à -3.6, z: -1.2 à -0.4)
            if (x > -4.4 - r && x < -3.6 + r && z > -1.2 - r && z < -0.4 + r) return true;

            // 6. NOUVEAU : Grande Table basse devant le canapé (décalée pour laisser le passage)
            if (x > -1.9 - r && x < -0.9 + r && z > 0.3 - r && z < 2.7 + r) return true;

             // 7. NOUVEAU : Bac de disquaire (x: 3.0 à 4.6, z: -0.1 à 1.1)
            if (x > 3.0 - r && x < 4.6 + r && z > -0.1 - r && z < 1.1 + r) return true;
            
            // 7. Dynamic collision objects (three.js hitboxes avec AABB mis en cache pour 0 lag CPU!)
            try {
                const avatarRadius = 0.28; // radius used for XZ overlap checks
                const colliders = window.collisionObjects || [];
                for (let i = 0; i < colliders.length; i++) {
                    const obj = colliders[i];
                    if (!obj || !obj.visible) continue;
                    obj.userData = obj.userData || {};
                    if (!obj.userData._cachedCollisionBox) {
                        obj.userData._cachedCollisionBox = new THREE.Box3().setFromObject(obj);
                    }
                    const box = obj.userData._cachedCollisionBox;
                    if (!box) continue;
                    const minX = box.min.x - avatarRadius;
                    const maxX = box.max.x + avatarRadius;
                    const minZ = box.min.z - avatarRadius;
                    const maxZ = box.max.z + avatarRadius;
                    if (x > minX && x < maxX && z > minZ && z < maxZ) return true;
                }
            } catch(e) {}

            return false; 
        }
        
        // Cible globale pour le lookAt de la caméra (optimisation mémoire)
        const cameraLookTarget = new THREE.Vector3(0, 0, 0);

        function normalizeAngle(angle) {
        return Math.atan2(Math.sin(angle), Math.cos(angle));
    }
        


    function togglePixarLamp() {
        const lamp = window.pixarLamp;
        if (!lamp) return;

        lamp.userData.isOn = !lamp.userData.isOn;

        // Achievement: Lumière Divine
        state.stats.lampToggles = (state.stats.lampToggles || 0) + 1;
        checkAchievement('lumiere_divine', () => state.stats.lampToggles >= 20);

        if (state.stats.lampToggles === 10) {
            showToast("Tu testes l'interrupteur ou tu cherches l'inspi ?", "discreet");
        }

        const spot    = lamp.userData.spot;
        const bulb    = lamp.userData.bulb;
        const ceiling = scene.getObjectByName("ceilingLight");
        const mainLight = scene.getObjectByName("mainRoomLight");

        if (lamp.userData.isOn) {
            if (spot) { spot.intensity = 40; spot.visible = true; }
            if (bulb) { bulb.material.emissive.set('#fef08a'); bulb.material.emissiveIntensity = 8.0; bulb.material.needsUpdate = true; }
            if (ceiling) { ceiling.userData.savedIntensity = ceiling.intensity; ceiling.intensity = 0.0; }
            if (mainLight) { mainLight.userData.savedIntensity = mainLight.intensity; mainLight.intensity = 0.05; }
            if (typeof hemiLight !== 'undefined') { hemiLight.userData.savedIntensity = hemiLight.intensity; hemiLight.intensity = 0.1; }

            // === ALLUMER LES NÉONS ACOUSTIQUES ===
            MusicSystem.setLowPassFrequency(1500, 1.0); // Applique le filtre passe-bas
            // === ALLUMER LES NÉONS ACOUSTIQUES ===
            if (window.acousticNeons) {
                window.acousticNeons.forEach(neon => {
                    neon.material.emissiveIntensity = 1.5; // Très léger sur le tube lui-même
                    neon.light.intensity = 15;             // Éclaire la pièce doucement
                });
            }

            if (typeof playTone === 'function') playTone(600, 'square', 0.05, 0.05);
            
        } else {
            if (spot) { spot.intensity = 0; spot.visible = false; }
            if (bulb) { bulb.material.emissiveIntensity = 0; bulb.material.needsUpdate = true; }
            if (ceiling) { ceiling.intensity = ceiling.userData.savedIntensity ?? 35; }
            if (mainLight) { mainLight.intensity = mainLight.userData.savedIntensity ?? 0.8; }
            MusicSystem.setLowPassFrequency(20000, 1.0); // Désactive le filtre passe-bas
            if (typeof hemiLight !== 'undefined') { hemiLight.intensity = hemiLight.userData.savedIntensity ?? 0.55; }

            // === ÉTEINDRE LES NÉONS ACOUSTIQUES ===
            if (window.acousticNeons) {
                window.acousticNeons.forEach(neon => {
                    neon.material.emissiveIntensity = 0.0;
                    neon.light.intensity = 0;
                });
            }

            if (typeof playTone === 'function') playTone(400, 'square', 0.05, 0.05);
        }
    }

    function warmupMovement() {
        if (!currentRoomAvatar) return;
        // Force l'optimisation JIT des fonctions de mouvement avec des valeurs neutres
        const dummyTarget = new THREE.Vector3(0, -0.95, 0);
        for (let i = 0; i < 64; i++) {
            checkCollision(Math.sin(i) * 5, Math.cos(i) * 5);
            rotateAvatarToward(dummyTarget, 0.12);
        }
        // Pré-calcul des matrices mondiales de la scène
        scene.updateMatrixWorld(true);
        camera.updateMatrixWorld(true);
    }
        
    function rotateAvatarToward(target, smooth = 0.12) {
        if (!currentRoomAvatar || !target) return;

        const dx = target.x - currentRoomAvatar.position.x;
        const dz = target.z - currentRoomAvatar.position.z;

        if (Math.hypot(dx, dz) < 0.02) return;

        // L'avatar regarde visuellement vers son axe +Z.
        const targetYaw = Math.atan2(dx, dz);

        const currentYaw = currentRoomAvatar.rotation.y;
        const deltaYaw = normalizeAngle(targetYaw - currentYaw);

        currentRoomAvatar.rotation.y = currentYaw + deltaYaw * smooth;
        currentRoomAvatar.rotation.x = 0;
        currentRoomAvatar.rotation.z = 0;
        
    }


        // Fonction pour démarrer l'animation de sommeil agité
        function startRestlessSleepAnimation() {
            if (restlessSleepInterval) clearInterval(restlessSleepInterval);

            restlessSleepInterval = setInterval(() => {
                // Axe Pied-Tête -> Local Y (Roulis / Se retourner sur le côté)
                // On autorise jusqu'à 90 degrés de rotation de chaque côté
                restlessTargetOffsetY = (Math.random() * Math.PI) - (Math.PI / 2);

                // Légères agitations secondaires (Pitch et Pivot)
                restlessTargetOffsetX = (Math.random() * 0.2) - 0.1;
                restlessTargetOffsetZ = (Math.random() * 0.2) - 0.1;

                // Mouvement léger "dans les draps" (Translation locale sur le matelas)
                restlessTargetPosX = (Math.random() * 0.1) - 0.05;
                restlessTargetPosZ = (Math.random() * 0.2) - 0.1;

            }, (Math.random() * 3000) + 2500); // Toutes les 2.5 à 5.5 secondes
        }


    // ==========================================
        // SYSTÈME DE PROXIMITÉ (SURLIGNAGE NÉON) - V5
        // ==========================================
        const INTERACTION_DIST = 2; 
        const HIGHLIGHT_LINE_COLOR = new THREE.Color('#ffffff');
        const DEFAULT_LINE_COLOR = new THREE.Color(0x000000); 
        const interactableNames = ['pc_mesh', 'synth_mesh', 'bed_mesh', 'sofa_mesh', 'interactiveLamp', 'speaker_mesh', 'achievements_board_mesh', 'door_mesh', 'desk_mug_mesh', 'desk_phone_mesh', 'desk_interface_mesh', 'desk_mic_mesh', 'desk_headphones_mesh', 'drum_mesh', 'artist_npc_mesh'];
        const highlightItems = [];

        function initProximityHighlight() {
            const skipHighlightClone = ['desk_mug_mesh', 'desk_phone_mesh', 'desk_interface_mesh', 'desk_mic_mesh', 'desk_headphones_mesh', 'drum_mesh', 'artist_npc_mesh'];
            scene.traverse(child => {
                if (child.isMesh && interactableNames.includes(child.name) && !skipHighlightClone.includes(child.name)) {
                    
                    if (child.material && child.material.isMeshStandardMaterial) {
                        child.material = child.material.clone();
                        
                        // On sauvegarde l'intensité d'origine (vital pour l'écran PC qui brille déjà)
                        const baseInt = child.material.emissiveIntensity || 0;
                        child.userData.baseEmissiveIntensity = baseInt;
                        
                        // Si l'objet ne brille pas de base, on lui assigne sa propre couleur en emissive
                        if (baseInt === 0) {
                            child.material.emissive = child.material.color.clone(); 
                        }
                        child.material.needsUpdate = true;
                    }

                    let edgesLine = null;
                    child.children.forEach(subChild => {
                        if (subChild.isLineSegments && subChild.material) {
                            subChild.material = subChild.material.clone();
                            edgesLine = subChild;
                        }
                    });

                    highlightItems.push({ mesh: child, edges: edgesLine });
                }
            });
        }

        // ==========================================
        // 3. RAYCASTER & INTERACTION
        // ==========================================
        const raycaster = new THREE.Raycaster();
        const mousePos = new THREE.Vector2();
        
        // Chrono pour détecter le double-clic / double-tap
        globalThis.lastFloorClickTime = 0; 

        globalThis.joystickPointerId = null;

        function onPointerDown(event) {
            if (document.getElementById('room-ui').style.display !== 'flex') return;

            if (event.pointerType === 'touch') {
                isJoystickActive = true;
                joystickPointerId = event.pointerId;
                joystickStartX = event.clientX;
                joystickStartY = event.clientY;
                joystickAnchorX = event.clientX;
                joystickAnchorY = event.clientY;
                window.lastPointerX = event.clientX;
                window.lastPointerY = event.clientY;

                const jUI = document.getElementById('joystick-ui');
                if (jUI) {
                    jUI.style.left = `${joystickStartX}px`;
                    jUI.style.top = `${joystickStartY}px`;
                    jUI.style.display = 'block';
                    void jUI.offsetWidth;
                    jUI.style.opacity = '1';
                }
                const joyRest = document.getElementById('mobile-joy-rest');
                if (joyRest) joyRest.style.opacity = '0.12';
                return;
            }
        }


        // =========================================================================
        // VRAI CONTRÔLEUR FPS POINTER LOCK + VISEUR CENTRAL + MOBILE DUAL-ZONE & TAP
        // =========================================================================
        window.fps = {
            yaw: 0.42,          // Regarde naturellement vers le bureau AbleStudio au spawn
            pitch: -0.05,
            sensitivity: 0.0021,
            isLocked: false,
            bobTime: 0,
            bobAmount: 0,
            fovZoomOffset: 0,
            currentTarget: null,
            transition: null,
            lastRaycastTime: 0
        };

        const FPS_INTERACT_LABELS = {
            pc_mesh: { title: 'Utiliser AbleStudio (PC)', sub: 'DAW, SoundNet, Studio+, ECHO' },
            synth_mesh: { title: 'Jouer au Synthétiseur', sub: 'Ouvrir le Piano Roll (+15 INSPI)' },
            drum_mesh: { title: 'Live Room — Batterie Acoustique 5 Fûts', sub: 'Jouer un Groove Live (+12% INSPI & +0.6 Score)' },
            artist_npc_mesh: { title: 'Artiste Signé sur ton Label', sub: 'Discuter de la session (+INSPI & +HYPE)' },
            bed_mesh: { title: 'Dormir dans le lit', sub: 'Récupérer Énergie & Inspiration' },
            sofa_mesh: { title: 'S’asseoir sur le canapé', sub: 'Pause chill devant la TV' },
            interactiveLamp: { title: 'Lampe Studio Pixar', sub: 'Mode Ambiance / Néons Acoustiques' },
            speaker_mesh: { title: 'Enceintes Monitoring', sub: 'Paramètres Audio & Mix' },
            achievements_board_mesh: { title: 'Bac à Vinyles & Succès', sub: 'Collection & Progression' },
            door_mesh: { title: 'Porte du Studio', sub: 'Activités extérieures & Sorties' },
            desk_mug_mesh: { title: 'Boire une gorgée de café', sub: 'Espresso chaud (+6% NRJ, +4% INSPI)' },
            desk_phone_mesh: { title: 'Consulter le Smartphone', sub: 'Ouvrir SoundNet (DMs & Brand Deals)' },
            desk_interface_mesh: { title: 'Interface Audio Studio', sub: 'Changer le mode de monitoring (Gain)' },
            desk_mic_mesh: { title: 'Microphone Condensateur', sub: 'Mic Check — Test vocal (+3% INSPI)' },
            desk_headphones_mesh: { title: 'Casque Studio Monitoring', sub: 'Mettre / Poser sur le support' }
        };

        const FPS_BLOCKING_OVERLAY_IDS = [
            'event-overlay',
            'review-overlay',
            'qte-diss-overlay',
            'minigames-menu-overlay',
            'audio-settings-overlay',
            'achievements-overlay',
            'standalone-pianoroll',
            'live-drum-overlay'
        ];

        const isTouchUIActive = () => Boolean(
            isMobile ||
            window.innerWidth <= 900 ||
            (window.matchMedia && window.matchMedia('(pointer: coarse)').matches)
        );

        window.isFpsRoomActive = function() {
            if (window.activeStudioLocation === 'city') return false;
            const roomUi = document.getElementById('room-ui');
            const pcUi = document.getElementById('pc-ui-layer');
            const loginUi = document.getElementById('login-screen');
            const sleepUi = document.getElementById('sleep-overlay');
            const theater = document.getElementById('cinematic-theater');

            if (!roomUi || roomUi.style.display !== 'flex') return false;
            if (loginUi && loginUi.style.display !== 'none') return false;
            if (pcUi && pcUi.style.display === 'flex') return false;
            if (sleepUi && sleepUi.classList.contains('active')) return false;
            if (theater && theater.classList.contains('pointer-events-auto')) return false;

            if (typeof state !== 'undefined' && state && (state.isEventActive || state.isReviewing || state.isSleeping)) {
                return false;
            }
            for (let i = 0; i < FPS_BLOCKING_OVERLAY_IDS.length; i++) {
                const el = document.getElementById(FPS_BLOCKING_OVERLAY_IDS[i]);
                if (el && !el.classList.contains('hidden') && el.style.display !== 'none') {
                    return false;
                }
            }
            return true;
        };

        window.enforceFpsModalPriority = function() {
            if (!window.isFpsRoomActive()) {
                if (document.pointerLockElement) {
                    window.exitFpsPointerLock();
                }
                if (window.kbdState) {
                    window.kbdState.up = false;
                    window.kbdState.down = false;
                    window.kbdState.left = false;
                    window.kbdState.right = false;
                }
                stopJoystick();
            }
        };

        try {
            const modalObserver = new MutationObserver(() => {
                window.enforceFpsModalPriority();
            });
            FPS_BLOCKING_OVERLAY_IDS.forEach(id => {
                const el = document.getElementById(id);
                if (el) modalObserver.observe(el, { attributes: true, attributeFilter: ['class', 'style'] });
            });
        } catch(e) {}

        window.requestFpsPointerLock = function() {
            if (isTouchUIActive() || !window.isFpsRoomActive()) return;
            try {
                const el = renderer && renderer.domElement;
                if (el && el.requestPointerLock && document.pointerLockElement !== el) {
                    const p = el.requestPointerLock();
                    if (p && typeof p.catch === 'function') p.catch(() => {});
                }
            } catch(e) {}
        };

        window.exitFpsPointerLock = function() {
            try {
                if (document.pointerLockElement && document.exitPointerLock) {
                    document.exitPointerLock();
                }
            } catch(e) {}
        };

        function updateFpsLockUI() {
            const isLocked = (document.pointerLockElement === renderer.domElement);
            const touchMode = isTouchUIActive();
            window.fps.isLocked = isLocked;
            const crosshair = document.getElementById('fps-crosshair');
            const banner = document.getElementById('fps-lock-banner');
            if (crosshair) crosshair.classList.toggle('locked', isLocked || touchMode);
            if (banner) {
                const showBanner = !touchMode && !isLocked && window.isFpsRoomActive() && !(state && state.isSleeping);
                banner.classList.toggle('hidden-banner', !showBanner);
            }
        }
        document.addEventListener('pointerlockchange', updateFpsLockUI);
        document.addEventListener('pointerlockerror', updateFpsLockUI);

        // Rotation souris en Pointer Lock (Desktop)
        document.addEventListener('mousemove', (e) => {
            if (document.pointerLockElement !== renderer.domElement) return;
            if (!window.isFpsRoomActive() || (window.fps && window.fps.transition)) return;
            if (state && state.isSleeping) return;

            const sens = window.fps.sensitivity || 0.0021;
            let nextYaw = window.fps.yaw - e.movementX * sens;
            let nextPitch = window.fps.pitch - e.movementY * sens;

            if (state && state.isSitting) {
                const baseSitYaw = -Math.PI / 2;
                const diff = normalizeAngle(nextYaw - baseSitYaw);
                nextYaw = baseSitYaw + Math.max(-1.25, Math.min(1.25, diff));
                nextPitch = Math.max(-0.7, Math.min(0.85, nextPitch));
            } else {
                nextPitch = Math.max(-1.32, Math.min(1.32, nextPitch));
            }

            window.fps.yaw = nextYaw;
            window.fps.pitch = nextPitch;
        });

        // Construction d'une cible d'interaction à partir d'une liste de hits Raycaster
        const fpsCenterVec = new THREE.Vector2(0, 0);
        const fpsTapVec = new THREE.Vector2(0, 0);
        const fpsRaycaster = new THREE.Raycaster();

        function resolveTargetFromHits(hits, maxInteractDist) {
            let foundTarget = null;
            for (let i = 0; i < hits.length; i++) {
                const hit = hits[i];
                if (typeof window.findCatalogItemByObject === 'function') {
                    const catalogMatch = window.findCatalogItemByObject(hit.object);
                    if (catalogMatch && catalogMatch.item) {
                        const item = catalogMatch.item;
                        const isOwned = state && state.ownedFurniture && state.ownedFurniture.includes(item.id);
                        if (!isOwned && hit.distance <= Math.max(5.8, maxInteractDist)) {
                            const scaledPrice = typeof getScaledPrice === 'function' ? getScaledPrice(item.price) : item.price;
                            const hasRep = (state.rep || 0) >= (item.reqRep || 0);
                            const hasFol = (state.followers || 0) >= (item.reqFollowers || 0);
                            const canAfford = (state.money || 0) >= scaledPrice && hasRep && hasFol;
                            foundTarget = {
                                type: 'buy',
                                item: item,
                                scaledPrice: scaledPrice,
                                canAfford: canAfford,
                                title: `Studio+ : ${item.name}`,
                                sub: canAfford
                                    ? `Installer pour $${scaledPrice} • ${item.perk || 'Upgrade Studio'}`
                                    : `$${scaledPrice} requis${!hasRep ? ' (REP insuffisante)' : (!hasFol ? ' (Followers insuffisants)' : ' (Fonds insuffisants)')}`
                            };
                            break;
                        }
                    }
                }
                if (interactableNames.includes(hit.object.name) && hit.distance <= maxInteractDist) {
                    const objName = hit.object.name;
                    const meta = FPS_INTERACT_LABELS[objName] || { title: 'Interagir', sub: '' };
                    let title = meta.title;
                    let sub = meta.sub;
                    let canUse = true;
                    if (window.activeStudioLocation === 'pro_studio') {
                        if (objName === 'pc_mesh') { title = 'Console SSL 4000G & ABLE_OS PRO 42'; sub = 'DAW Mastering, Label HQ, Sync & Vault'; }
                        else if (objName === 'synth_mesh') { title = 'Live Room — Piano à Queue & Synthés'; sub = 'Ouvrir le Piano Roll (+15 INSPI)'; }
                        else if (objName === 'drum_mesh') { title = 'Live Room — Batterie Acoustique 5 Fûts'; sub = 'Jouer un Groove Live (+12% INSPI & +0.6 Score)'; }
                        else if (objName === 'artist_npc_mesh') {
                            const gName = hit.object.userData && hit.object.userData.artistName ? hit.object.userData.artistName : 'Artiste du Label';
                            title = `🎤 ${gName} (Signé sur ton Label)`;
                            sub = 'Discuter de la session au 42e (+6% INSPI, +4% HYPE)';
                        }
                        else if (objName === 'bed_mesh') { title = 'Méridienne du Sofa VIP'; sub = 'S’allonger pour récupérer Énergie & Inspiration'; }
                        else if (objName === 'sofa_mesh') { title = 'Salon d’Écoute VIP Label'; sub = 'Pause chill face à la Skyline'; }
                        else if (objName === 'desk_interface_mesh') { title = 'Tours de Racks 19" & Sub 18" Bass Check'; sub = 'Basculer SSL Analog / Tube Tape / Club Sub Check'; }
                        else if (objName === 'desk_mug_mesh') { title = 'Bar VIP Label & Espresso La Marzocco'; sub = 'Servir un espresso chaud (+6% NRJ, +4% INSPI)'; }
                        else if (objName === 'achievements_board_mesh') { title = 'Hall of Fame & Platine Technics SL-1200'; sub = 'Certifications & Collection de Vinyles'; }
                        else if (objName === 'desk_mic_mesh') { title = 'Live Room — Micro Neumann U87 (ON AIR)'; sub = 'Prise Vocale U87 (+5% INSPI & +0.5 Score)'; }
                        else if (objName === 'speaker_mesh') { title = 'Monitoring Main Augspurger & NS-10'; sub = 'Paramètres Audio & Calibration Mix'; }
                    }
                    if (objName === 'desk_headphones_mesh' && window.deskHeadphonesState) {
                        title = window.deskHeadphonesState.worn ? 'Poser le Casque Studio' : 'Mettre le Casque Studio';
                        sub = window.deskHeadphonesState.worn ? 'Reposer sur le support aluminium' : 'Activer l’écoute de précision';
                    } else if (objName === 'desk_mug_mesh' && window.deskMugState) {
                        sub = window.deskMugState.sipsLeft > 0
                            ? `Espresso chaud (+6% NRJ, +4% INSPI) • ${window.deskMugState.sipsLeft}/3`
                            : 'Mug vide (se remplit après une nuit de sommeil)';
                        if (window.deskMugState.sipsLeft <= 0) canUse = false;
                    } else if (objName === 'desk_interface_mesh' && window.deskInterfaceState) {
                        const mNames = ['CLEAN STUDIO', 'WARM LO-FI', 'CLUB SUB CHECK'];
                        sub = `Actuel : ${mNames[window.deskInterfaceState.mode || 0]} • Clic/E pour basculer`;
                    }
                    if (objName === 'bed_mesh' && state && state.energy >= 50) {
                        sub = 'Pas assez fatigué (< 50% NRJ requis)';
                        canUse = false;
                    } else if (objName === 'door_mesh' && state) {
                        const doorReady = parseInt(state.cooldowns?.doorTimeReady, 10) || 0;
                        if (typeof getTotalMins === 'function' && getTotalMins() < doorReady) {
                            sub = 'Cooldown actif — Tu es déjà sorti récemment';
                            canUse = false;
                        }
                    }
                    foundTarget = {
                        type: 'interactable',
                        objName: objName,
                        mesh: hit.object,
                        canUse: canUse,
                        title: title,
                        sub: sub
                    };
                    break;
                }
            }
            return foundTarget;
        }

        function getActiveFpsRaycastTargets() {
            if (window.activeStudioLocation === 'pro_studio') {
                return window.proStudioGroup ? [window.proStudioGroup] : scene.children;
            }
            return (window.bedroomRaycastRoots && window.bedroomRaycastRoots.length) ? window.bedroomRaycastRoots : scene.children;
        }

        // Direct Tap-to-Interact sur Mobile / Tactile (permet de toucher directement un objet 3D à l'écran!)
        window.tryDirectTapInteraction = function(clientX, clientY) {
            if (!window.isFpsRoomActive()) return false;
            fpsTapVec.x = (clientX / window.innerWidth) * 2 - 1;
            fpsTapVec.y = -(clientY / window.innerHeight) * 2 + 1;
            fpsRaycaster.setFromCamera(fpsTapVec, camera);
            const hits = fpsRaycaster.intersectObjects(getActiveFpsRaycastTargets(), true).filter(hit => {
                if (!hit.object.isMesh || !hit.object.visible) return false;
                if (hit.distance > 9.0) return false;
                let curr = hit.object.parent;
                while (curr) {
                    if (!curr.visible) return false;
                    curr = curr.parent;
                }
                return true;
            });
            const tappedTarget = resolveTargetFromHits(hits, 8.5);
            if (tappedTarget) {
                window.fps.currentTarget = tappedTarget;
                window.executeFpsTargetInteraction();
                return true;
            }
            return false;
        };

        // Contrôles tactiles Mobile Dual-Zone (Multi-Touch Indépendant : Gauche = Joystick, Droite = Vue 360°, Tap = Interaction directe!)
        globalThis.mobileLookTouchId = null;
        globalThis.mobileLookLastX = 0;
        globalThis.mobileLookLastY = 0;
        const touchTrackers = new Map();


        window.updateFpsCrosshairTarget = function() {
            const now = performance.now();
            if (now - window.fps.lastRaycastTime < 45) return; // ~22 Hz ultra-fluide & 0 surcharge CPU
            window.fps.lastRaycastTime = now;

            const crosshair = document.getElementById('fps-crosshair');
            const promptEl = document.getElementById('fps-interact-prompt');
            const keyEl = document.getElementById('fps-interact-key');
            const titleEl = document.getElementById('fps-interact-title');
            const subEl = document.getElementById('fps-interact-sub');
            const mobBtn = document.getElementById('fps-mobile-interact-btn');
            const mobLabel = document.getElementById('fps-mobile-interact-label');
            const lookRest = document.getElementById('mobile-look-rest');
            const touchMode = isTouchUIActive();

            updateFpsLockUI();

            if (!window.isFpsRoomActive() || window.fps.transition || (state && state.isSleeping)) {
                window.fps.currentTarget = null;
                if (promptEl) promptEl.classList.remove('visible');
                if (crosshair) crosshair.classList.remove('targeting', 'targeting-buy', 'targeting-locked');
                if (mobBtn) mobBtn.style.display = 'none';
                return;
            }

            fpsRaycaster.setFromCamera(fpsCenterVec, camera);
            const hits = fpsRaycaster.intersectObjects(getActiveFpsRaycastTargets(), true).filter(hit => {
                if (!hit.object.isMesh || !hit.object.visible) return false;
                if (hit.distance > 6.5) return false;
                let curr = hit.object.parent;
                while (curr) {
                    if (!curr.visible) return false;
                    curr = curr.parent;
                }
                return true;
            });

            const foundTarget = resolveTargetFromHits(hits, 4.8);
            window.fps.currentTarget = foundTarget;

            if (foundTarget) {
                if (crosshair) {
                    crosshair.classList.remove('targeting', 'targeting-buy', 'targeting-locked');
                    if (foundTarget.type === 'buy') {
                        crosshair.classList.add(foundTarget.canAfford ? 'targeting-buy' : 'targeting-locked');
                    } else {
                        crosshair.classList.add(foundTarget.canUse ? 'targeting' : 'targeting-locked');
                    }
                }
                if (promptEl && titleEl && subEl && keyEl) {
                    keyEl.textContent = touchMode ? 'TAP' : 'E';
                    titleEl.textContent = foundTarget.title;
                    subEl.textContent = foundTarget.sub || '';
                    promptEl.classList.add('visible');
                }
                if (mobBtn && touchMode) {
                    mobBtn.style.display = 'flex';
                    if (mobLabel) mobLabel.textContent = foundTarget.title;
                }
                if (lookRest) lookRest.style.opacity = '0';
            } else {
                if (crosshair) crosshair.classList.remove('targeting', 'targeting-buy', 'targeting-locked');
                if (promptEl) promptEl.classList.remove('visible');
                if (mobBtn) mobBtn.style.display = 'none';
                if (lookRest) lookRest.style.opacity = '0.68';
            }
        };

        window.executeFpsTargetInteraction = function() {
            const target = window.fps ? window.fps.currentTarget : null;
            if (!target || window.fps.transition) return;

            // Achat direct Studio+ en POV
            if (target.type === 'buy' && target.item) {
                if (target.canAfford && typeof buyFurniture === 'function') {
                    buyFurniture(target.item.id);
                    window.fps.currentTarget = null;
                } else {
                    showToast(target.sub || "Prérequis ou fonds insuffisants pour Studio+.", "warning");
                    if (typeof playError === 'function') playError();
                }
                return;
            }

            // Interactions classiques (identiques au gameplay original!)
            const objName = target.objName;
            const isOwned = (id) => state && state.ownedFurniture && state.ownedFurniture.includes(id);

            if (objName === 'pc_mesh') enterPC();
            else if (objName === 'achievements_board_mesh') { window.exitFpsPointerLock(); openAchievementsBoard(); }
            else if (objName === 'door_mesh') {
                const doorReady = parseInt(state.cooldowns?.doorTimeReady, 10) || 0;
                const canPlayDoor = getTotalMins() >= doorReady || Boolean(state.studioUnlocked);
                if (canPlayDoor && !state.isEventActive && !state.isSleeping && !state.isSitting) {
                    window.exitFpsPointerLock();
                    if (typeof window.syncStudioSwitchButtons === 'function') window.syncStudioSwitchButtons();
                    if (window.activeStudioLocation === 'pro_studio') {
                        window._proDoorTarget = 0.48;
                        setTimeout(() => { openMiniGameMenu(); setTimeout(() => { window._proDoorTarget = 0; }, 900); }, 320);
                    } else if (typeof window.animateDoorCrackOpen === 'function') {
                        window.animateDoorCrackOpen(() => openMiniGameMenu());
                    } else {
                        openMiniGameMenu();
                    }
                } else if (!canPlayDoor) {
                    showToast("T'es déjà sorti récemment. Va taffer.", "warning");
                }
            }
            else if (objName === 'synth_mesh') {
                if (isOwned('synth') || window.activeStudioLocation === 'pro_studio') openPianoRoll();
                else showToast("Tu dois d'abord acheter le Synthétiseur dans Studio+ !", "warning");
            }
            else if (objName === 'drum_mesh') {
                if (typeof window.openLiveDrumSession === 'function') window.openLiveDrumSession();
            }
            else if (objName === 'artist_npc_mesh') {
                if (typeof window.interactWithStudioGuest3D === 'function') window.interactWithStudioGuest3D(target.mesh);
            }
            else if (objName === 'bed_mesh') {
                if (state.energy < 50) goSleep();
                else showToast("Tu n'es pas assez fatigué (< 50% NRJ).", "info");
            }
            else if (objName === 'sofa_mesh') {
                if (isOwned('sofa') || window.activeStudioLocation === 'pro_studio') goSit();
                else showToast("Tu dois d'abord acheter le Canapé en cuir dans Studio+ !", "warning");
            }
            else if (objName === 'interactiveLamp') {
                if (isOwned('rack_lamp')) togglePixarLamp();
                else showToast("Tu dois d'abord acheter le Rack & Lampe dans Studio+ !", "warning");
            }
            else if (objName === 'speaker_mesh') {
                window.exitFpsPointerLock();
                openAudioSettings();
            }
            else if (objName === 'desk_mug_mesh') {
                const ms = window.deskMugState;
                const nowM = typeof getTotalMins === 'function' ? getTotalMins() : 0;
                if (ms) {
                    if (ms.sipsLeft <= 0) {
                        showToast("☕ Ton mug est vide ! Dors une nuit pour te refaire un espresso.", "info");
                        playTone(220, 'sine', 0.08, 0.04);
                    } else if (nowM - ms.lastSipMins < 120) {
                        ms.sipAnim = 1.0;
                        showToast("☕ Petite gorgée fraîcheur (déjà caféiné récemment).", "info");
                        playTone(460, 'sine', 0.08, 0.04);
                    } else {
                        ms.sipsLeft--;
                        ms.lastSipMins = nowM;
                        ms.sipAnim = 1.0;
                        state.energy = Math.min(100, (Number(state.energy) || 0) + 6);
                        state.inspi = Math.min(100, (Number(state.inspi) || 0) + 4);
                        if (typeof updateHUD === 'function') updateHUD();
                        playTone(520, 'sine', 0.09, 0.05); setTimeout(() => playTone(680, 'sine', 0.1, 0.04), 90);
                        showToast(`☕ Espresso savouré (+6% NRJ, +4% INSPI) • ${ms.sipsLeft} gorgée(s) restante(s)`, "success");
                    }
                }
            }
            else if (objName === 'desk_phone_mesh') {
                window.deskPhoneAlertUntil = 0;
                const hasUnread = state && Array.isArray(state.dms) && state.dms.some(d => !d.resolved);
                playTone(720, 'sine', 0.07, 0.04);
                // Ouvre AbleOS directement sur SoundNet (DMs si non lus, sinon Feed/Deals)
                if (typeof window.exitFpsPointerLock === 'function') window.exitFpsPointerLock();
                document.getElementById('room-ui').style.display = 'none';
                document.getElementById('pc-ui-layer').style.display = 'flex';
                document.body.classList.add('os-active');
                if (typeof updateTaskbar === 'function') updateTaskbar();
                openApp('app-social');
                if (typeof switchSocialTab === 'function') switchSocialTab(hasUnread ? 'dms' : 'feed');
            }
            else if (objName === 'desk_interface_mesh') {
                if (typeof window.cycleProMonitoringMode === 'function') {
                    window.cycleProMonitoringMode();
                }
            }
            else if (objName === 'desk_mic_mesh') {
                const mc = window.deskMicState;
                const nowM = typeof getTotalMins === 'function' ? getTotalMins() : 0;
                if (mc) {
                    mc.activeUntil = performance.now() + 3400;
                    mc.targetYaw = 0.28;
                    setTimeout(() => { if (window.deskMicState) window.deskMicState.targetYaw = 0; }, 2600);
                    playTone(440, 'sine', 0.07, 0.05); setTimeout(() => playTone(660, 'sine', 0.11, 0.04), 110);
                    if (window.activeStudioLocation === 'pro_studio') {
                        window._liveVocalTakeBuff = true;
                        if (typeof window.syncMasteringRackUI === 'function') window.syncMasteringRackUI();
                    }
                    if (nowM - mc.lastBoostMins >= 120) {
                        mc.lastBoostMins = nowM;
                        const gainI = window.activeStudioLocation === 'pro_studio' ? 5 : 3;
                        state.inspi = Math.min(100, (Number(state.inspi) || 0) + gainI);
                        if (typeof updateHUD === 'function') updateHUD();
                        showToast(window.activeStudioLocation === 'pro_studio'
                            ? "🎙️ Prise Vocale Neumann U87 (ON AIR) verrouillée ! (+5% INSPI & +0.5 Score sur le prochain son)"
                            : "🎙️ Mic Check — 1, 2... Signal propre (-6 dB) ! (+3% INSPI)", "success");
                    } else {
                        showToast(window.activeStudioLocation === 'pro_studio'
                            ? "🎙️ Session Neumann U87 ON AIR active (+0.5 Score prêt pour le prochain mix)."
                            : "🎙️ Mic Check — Signal condensateur OK (-6 dB).", "info");
                    }
                }
            }
            else if (objName === 'desk_headphones_mesh') {
                const hps = window.deskHeadphonesState;
                if (hps) {
                    hps.worn = !hps.worn;
                    if (hps.mesh) hps.mesh.visible = !hps.worn;
                    if (typeof MusicSystem !== 'undefined' && MusicSystem.setLowPassFrequency) {
                        MusicSystem.setLowPassFrequency(hps.worn ? 20000 : 14000, 0.4);
                    }
                    playTone(hps.worn ? 580 : 320, 'sine', 0.09, 0.05);
                    showToast(hps.worn ? "🎧 Casque Studio chaussé — Écoute de précision." : "🎧 Casque Studio reposé sur son support.", "info");
                }
            }
        };

        // Helper pour lancer une transition caméra POV fluide (PC, Synthé, etc.)
        window.startFpsCameraTransition = function({ toPos, toYaw, toPitch, toFov = null, duration = 500, lockMovement = true, onComplete = null }) {
            window.fps.transition = {
                startTime: performance.now(),
                duration: duration,
                fromPos: camera.position.clone(),
                toPos: toPos.clone(),
                fromYaw: window.fps.yaw,
                toYaw: toYaw,
                fromPitch: window.fps.pitch,
                toPitch: toPitch,
                fromFov: camera.fov,
                toFov: toFov !== null ? toFov : camera.fov,
                lockMovement: lockMovement,
                onComplete: onComplete
            };
        };

        // ==========================================
        // GESTION DU PIANO ROLL INDÉPENDANT
        // ==========================================
        function openPianoRoll() {
            const isOwned = (id) => state && state.ownedFurniture && state.ownedFurniture.includes(id);
            if (!isOwned('synth')) {
                showToast("Tu dois d'abord acheter le Synthétiseur dans Studio+ !", "warning");
                return;
            }
            if (typeof window.exitFpsPointerLock === 'function') window.exitFpsPointerLock();

            const revealPr = () => {
                if (typeof window.triggerCinematic === 'function') {
                    window.triggerCinematic('reward', {
                        title: 'PIANO ROLL',
                        subtitle: 'Synthétiseur Analogique Activé',
                        tag: 'HARDWARE SEQUENCER'
                    });
                }
                MusicSystem.muteForGameplay(0.5);
                document.getElementById('room-ui').style.display = 'none';
                const prWindow = document.getElementById('standalone-pianoroll');
                prWindow.classList.remove('hidden');
                prWindow.style.display = 'flex';
                setTimeout(() => {
                    prWindow.style.opacity = '1';
                    prWindow.style.pointerEvents = 'all';
                }, 10);
                playTone(600, 'square', 0.1, 0.05);
            };

            if (typeof window.startFpsCameraTransition === 'function') {
                // Inclinaison POV au-dessus des touches du synthétiseur (-4.35, 0.05, -1.35)
                window.startFpsCameraTransition({
                    toPos: new THREE.Vector3(-3.35, 1.02, -1.35),
                    toYaw: Math.PI / 2,
                    toPitch: -0.78,
                    toFov: 56,
                    duration: 420,
                    lockMovement: true,
                    onComplete: revealPr
                });
            } else {
                revealPr();
            }
        }

        function closePianoRoll() {
            MusicSystem.unmuteAfterGameplay(1.5);
            const prWindow = document.getElementById('standalone-pianoroll');
            prWindow.style.opacity = '0';
            prWindow.style.pointerEvents = 'none';
            try {
                state.inspi = Math.min(100, (Number(state.inspi) || 0) + 15);
                updateHUD();
                showToast("Inspi boostée (Piano Roll)", "success");
            } catch(e) {}

            setTimeout(() => {
                prWindow.classList.add('hidden');
                prWindow.style.display = 'none';
                document.getElementById('room-ui').style.display = 'flex';
                if (typeof window.startFpsCameraTransition === 'function' && currentRoomAvatar) {
                    window.startFpsCameraTransition({
                        toPos: new THREE.Vector3(currentRoomAvatar.position.x, 1.45, currentRoomAvatar.position.z),
                        toYaw: Math.PI / 2,
                        toPitch: -0.06,
                        toFov: window.getBaseFpsFov ? window.getBaseFpsFov() : (isMobile ? 82 : 68),
                        duration: 380,
                        lockMovement: true
                    });
                }
            }, 300);

            if (typeof stopPrPlayback === 'function') stopPrPlayback();
            playTone(300, 'sawtooth', 0.1, 0.05);
        }

        window.enterPC = function() {
            if (window.fps && window.fps.transition) return;
            if (typeof window.exitFpsPointerLock === 'function') window.exitFpsPointerLock();
            playTone(540, 'sine', 0.14, 0.05);

            const openOsNow = () => {
                document.getElementById('room-ui').style.display = 'none';
                document.getElementById('pc-ui-layer').style.display = 'flex';
                document.body.classList.add('os-active');
                if (typeof updateTaskbar === 'function') updateTaskbar();
                playTone(640, 'square', 0.08, 0.04);
            };

            if (typeof window.startFpsCameraTransition === 'function') {
                const isPro = (window.activeStudioLocation === 'pro_studio');
                // Sauvegarde position pré-PC pour retour naturel devant le bureau ou la console SSL
                const defaultStand = isPro ? new THREE.Vector3(2.15, -1, -0.1) : new THREE.Vector3(-2.1, -1, -1.9);
                window._prePcPos = currentRoomAvatar ? currentRoomAvatar.position.clone() : defaultStand;
                // Plongée POV fluide face au moniteur (Chambre: -2.2, 1.26, -3.48 / Studio Pro SSL: 3.35, 1.12, -0.1 face +X)
                window.startFpsCameraTransition({
                    toPos: isPro ? new THREE.Vector3(3.35, 1.12, -0.1) : new THREE.Vector3(-2.2, 1.26, -3.48),
                    toYaw: isPro ? -Math.PI / 2 : 0,
                    toPitch: -0.02,
                    toFov: 44,
                    duration: 480,
                    lockMovement: true,
                    onComplete: openOsNow
                });
            } else {
                openOsNow();
            }
        };

        function quitPC() {
            if (typeof stopGenrePreview === 'function') stopGenrePreview();
            document.getElementById('pc-ui-layer').style.display = 'none';
            document.getElementById('room-ui').style.display = 'flex';
            document.body.classList.remove('os-active');
            playTone(300, 'sawtooth', 0.1, 0.05);
            if (window.activeStudioLocation === 'city') return;

            if (typeof window.startFpsCameraTransition === 'function' && currentRoomAvatar) {
                const isPro = (window.activeStudioLocation === 'pro_studio');
                const safeFallback = isPro ? new THREE.Vector3(2.15, -1, -0.1) : new THREE.Vector3(-2.1, -1, -1.9);
                const backPos = window._prePcPos ? window._prePcPos.clone() : safeFallback;
                // S'assure que le joueur est hors collision devant le bureau / la console SSL
                if (typeof checkCollision === 'function' && checkCollision(backPos.x, backPos.z)) {
                    if (isPro) backPos.set(2.15, -1, -0.1);
                    else backPos.set(-1.6, -1, -1.55);
                }
                currentRoomAvatar.position.set(backPos.x, -1, backPos.z);
                if (isPro) {
                    camera.position.set(3.35, 1.12, -0.1);
                    camera.rotation.set(-0.02, -Math.PI / 2, 0, 'YXZ');
                } else {
                    camera.position.set(-2.2, 1.26, -3.48);
                    camera.rotation.set(-0.02, 0, 0, 'YXZ');
                }
                camera.fov = 44;
                camera.updateProjectionMatrix();
                window.startFpsCameraTransition({
                    toPos: new THREE.Vector3(backPos.x, 1.45, backPos.z),
                    toYaw: isPro ? -Math.PI / 2 : 0.12,
                    toPitch: isPro ? -0.04 : -0.06,
                    toFov: window.getBaseFpsFov ? window.getBaseFpsFov() : (isMobile ? 82 : 68),
                    duration: 440,
                    lockMovement: true
                });
            }
        }


        // ==========================================
        // ACTION DORMIR (LA STRUGGLE)
        // ==========================================
        globalThis._activeSleepInt = null;
        window.wakeUpNow = function() {
            if (!state || !state.isSleeping) return;
            if (_activeSleepInt) { clearInterval(_activeSleepInt); _activeSleepInt = null; }
            state.energy = 100;
            state.inspi = 100;
            if (typeof checkDailyQuests === 'function') checkDailyQuests('high_energy', 100);
            updateHUD();
            wakeUp();
        };

        function goSleep() {
            if (state.isExporting) { showToast("Tu peux pas dormir en plein mix, frérot !", "error"); playError(); return; }
            if (state.isSleeping) return;
            if (typeof window.exitFpsPointerLock === 'function') window.exitFpsPointerLock();
            state.isSleeping = true;
            const lids = document.getElementById('fps-eyelids');
            if (lids) setTimeout(() => lids.classList.add('closed'), 220);

            // Restore full creative inspiration & prepare Bilan de la Nuit
            const prevRecap = state.nightSummary || { lastMoney: state.money, lastFollowers: state.followers, lastRep: state.rep };
            const deltaMoney = Math.round((Number(state.money) || 0) - (Number(prevRecap.lastMoney) || 0));
            const deltaFans = Math.round((Number(state.followers) || 0) - (Number(prevRecap.lastFollowers) || 0));
            const labelDaily = (typeof window.getLabelDailyRoyalties === 'function') ? window.getLabelDailyRoyalties() : 0;
            const rentAmt = (typeof window.getCurrentWeeklyRent === 'function') ? window.getCurrentWeeklyRent() : 150;
            const daysUntilRent = Math.max(1, 7 - ((state.day || 1) - (state.lastRentDay || 1)));

            const recapBody = document.getElementById('sleep-recap-body');
            if (recapBody) {
                recapBody.innerHTML = `
                    <div class="bg-black/45 border border-white/10 rounded-lg p-2.5">
                        <div class="text-[9px] text-zinc-500 uppercase">Énergie &amp; Inspi</div>
                        <div class="text-emerald-400 font-bold text-xs mt-0.5">100% RESTAURÉES</div>
                    </div>
                    <div class="bg-black/45 border border-white/10 rounded-lg p-2.5">
                        <div class="text-[9px] text-zinc-500 uppercase">Bilan Cash Session</div>
                        <div class="${deltaMoney >= 0 ? 'text-emerald-400' : 'text-rose-400'} font-bold text-xs mt-0.5">${deltaMoney >= 0 ? '+' : ''}$${deltaMoney.toLocaleString('fr-FR')}</div>
                    </div>
                    <div class="bg-black/45 border border-white/10 rounded-lg p-2.5">
                        <div class="text-[9px] text-zinc-500 uppercase">Nouveaux Fans</div>
                        <div class="text-sky-300 font-bold text-xs mt-0.5">${deltaFans >= 0 ? '+' : ''}${deltaFans.toLocaleString('fr-FR')}</div>
                    </div>
                    <div class="bg-black/45 border border-white/10 rounded-lg p-2.5">
                        <div class="text-[9px] text-zinc-500 uppercase">Royalties / Bail</div>
                        <div class="text-amber-300 font-bold text-xs mt-0.5">+$${labelDaily}/j · Bail $${rentAmt} (${daysUntilRent}j)</div>
                    </div>
                `;
            }
            state.nightSummary = { lastMoney: state.money || 0, lastFollowers: state.followers || 0, lastRep: state.rep || 0 };

            try { state.inspi = 100; } catch(e) {}
            MusicSystem.crossfadeTo('sleep', 2.0);
            const overlay = document.getElementById('sleep-overlay'), progText = document.getElementById('sleep-progress-text');
            overlay.classList.add('active');

            if (currentRoomAvatar) {
                currentRoomAvatar.userData.preSleepPos = currentRoomAvatar.position.clone();
                currentRoomAvatar.userData.preSleepRot = currentRoomAvatar.rotation.clone();
                currentRoomAvatar.position.set(3.8, -0.42, -2.9);
                currentRoomAvatar.rotation.set(0, Math.PI / 2, 0);

                const visualAvatar = currentRoomAvatar.getObjectByName("AvatarVisual") || currentRoomAvatar.children[0];
                if (visualAvatar) {
                    visualAvatar.position.set(0, 0.35, -0.25);
                    visualAvatar.rotation.set(Math.PI / 2, 0, 0);
                    visualAvatar.rotation.order = 'YXZ';
                }

                restlessTargetOffsetX = 0; restlessTargetOffsetY = 0; restlessTargetOffsetZ = 0;
                restlessTargetPosX = 0; restlessTargetPosZ = 0;

                startRestlessSleepAnimation();
                currentRoomAvatar.traverse(child => { if (child.isMesh && child.material) { child.material.transparent = true; child.material.opacity = 0.8; } });
            }

            playTone(220, 'sine', 0.6, 0.04);
            let ticks = 0;
            const maxTicks = 40; // 4 secondes fluides (au lieu de 15s!) avec bouton Réveil Immédiat
            const missingEnergy = Math.max(0, 100 - (Number(state.energy) || 0));
            const rechargePerTick = Math.max(2.5, missingEnergy / maxTicks);
            if (_activeSleepInt) clearInterval(_activeSleepInt);
            _activeSleepInt = setInterval(() => {
                ticks++;
                state.energy = Math.min(100, (Number(state.energy) || 0) + rechargePerTick);

                if (state.energy >= 90 && typeof checkDailyQuests === 'function') {
                    checkDailyQuests('high_energy', Math.floor(state.energy));
                }

                updateHUD();

                const timeLeft = Math.max(0, Math.ceil((maxTicks - ticks) / 10));
                if (progText) progText.innerText = timeLeft > 0 ? `Réveil ${timeLeft}s...` : 'Frais !';

                if (ticks >= maxTicks) {
                    clearInterval(_activeSleepInt);
                    _activeSleepInt = null;
                    state.energy = 100;
                    wakeUp();
                }
            }, 100);
        }

        function wakeUp() {
                state.isSleeping = false;
                const lids = document.getElementById('fps-eyelids');
                if (lids) lids.classList.remove('closed');
                if (window.fps) { window.fps.yaw = 0.65; window.fps.pitch = -0.04; }
                if (window.deskMugState) { window.deskMugState.sipsLeft = 3; }
                state.stats.awakeDays = 0; // Reset du compteur "Vrai Rat de Studio"
                    MusicSystem.crossfadeTo('room', 3.0); // <-- AJOUT ICI (Fondu de retour de 2s)
                document.getElementById('sleep-overlay').classList.remove('active');
                if (currentRoomAvatar) {
                    if (currentRoomAvatar.userData.preSleepPos) {
                        currentRoomAvatar.position.copy(currentRoomAvatar.userData.preSleepPos);
                        currentRoomAvatar.rotation.copy(currentRoomAvatar.userData.preSleepRot);
                    } else {
                        currentRoomAvatar.position.set(2.5, -0.95, -2.9);
                        currentRoomAvatar.rotation.set(0, 0, 0);
                    }
                    const vAvatar = currentRoomAvatar.getObjectByName("AvatarVisual") || currentRoomAvatar.children[0];
                    if (vAvatar) { vAvatar.position.set(0, 0, 0); vAvatar.rotation.set(0, 0, 0); }
                    if (restlessSleepInterval) { clearInterval(restlessSleepInterval); restlessSleepInterval = null; }
                    restlessTargetOffsetX = 0; restlessTargetOffsetY = 0; restlessTargetOffsetZ = 0;
                    restlessTargetPosX = 0; restlessTargetPosZ = 0;
                    currentRoomAvatar.traverse(child => { if (child.isMesh && child.material) { child.material.transparent = false; child.material.opacity = 1; } });
                }
                showToast("Nuit terminée. T'es de nouveau frais !", "success");
                playSuccess();
                saveGame();
            }
        


        // ==========================================
        // MÉCANIQUE CHILL : S'ASSEOIR SUR LE CANAPÉ
        // ==========================================
        function goSit() {
            if (state.isExporting || state.isSleeping || state.isSitting) return;

            if (state.timeMins >= 0 && state.timeMins < 5) {
                showToast("Minuit. Le silence avant le prochain hit.", "discreet");
            }

            state.isSitting = true;
            if (window.fps) {
                window.fps.yaw = -Math.PI / 2;
                window.fps.pitch = -0.05;
            }

            // Achievement: Let Him Cook
            state.stats.sofaChills = (state.stats.sofaChills || 0) + 1;
            checkAchievement('let_him_cook', () => state.stats.sofaChills >= 10);

            MusicSystem.crossfadeTo('sleep', 3.0); // <-- AJOUT ICI (Fondu lent de 3s)
            targetPosition = null; // Annule tout déplacement en cours (freeze l'avatar)
            

            // Pause chill dynamique et réactive (3 à 5s) + bonus Inspi garanti
            const energyGain = Math.floor(Math.random() * 8) + 14; // 14 à 21 NRJ
            const durationSec = Math.floor(Math.random() * 3) + 3; // 3 à 5 secondes max
            const durationMs = durationSec * 1000;
            state.inspi = Math.min(100, (Number(state.inspi) || 0) + 10);

            if (state.energy < 50) {
                showToast(`Petite pause chill... T'as l'air crevé ! (${durationSec}s)`, "info");
                playTone(220, 'sine', 0.6, 0.05); // Son plus bas (soupir)
            } else {
                showToast(`Petite pause chill... (${durationSec}s)`, "info");
                playTone(480, 'sine', 0.1, 0.04); // Petit son de validation
            }

            if (currentRoomAvatar) {
                // Sauvegarde de la position pour le retour
                currentRoomAvatar.userData.preSitPos = currentRoomAvatar.position.clone();
                currentRoomAvatar.userData.preSitRot = currentRoomAvatar.rotation.clone();

                // Téléportation sur l'assise du canapé
                currentRoomAvatar.position.set(-3.95, -0.86, 1.5);
                currentRoomAvatar.rotation.set(0, Math.PI / 2, 0); // Regarde vers la pièce

                // Animation de la pose assise
                const visual = currentRoomAvatar.getObjectByName("AvatarVisual") || currentRoomAvatar.children[0];
                if (visual) {
                    visual.position.y = -0.18; // On abaisse le bassin dans le coussin
                    const legL = visual.getObjectByName("Leg_L");
                    const legR = visual.getObjectByName("Leg_R");
                    if (legL && legR) {
                        legL.rotation.x = -Math.PI / 2; // Jambe gauche tendue (angle droit)
                        legR.rotation.x = -Math.PI / 2; // Jambe droite tendue (angle droit)
                    }

                    // --- NOUVEAU : Animation de détente si NRJ basse ---
                    if (state.energy < 50) {
                        const head = visual.getObjectByName("HeadGroup");
                        const torso = visual.getObjectByName("Torso");
                        if (head) head.rotation.x = 0.35;    // Tête qui tombe un peu
                        if (torso) torso.rotation.x = 0.15;  // Buste qui se relâche
                    }
                }
            }

            // Fin de l'animation après le temps imparti
            setTimeout(() => {
                standUp(energyGain);
            }, durationMs);
        }


                // ==========================================
        // SYSTÈME DE LA PORTE (MINI-JEUX)
        // ==========================================
        function openMiniGameMenu() {
            document.getElementById('minigames-menu-overlay').classList.remove('hidden');
            document.getElementById('minigames-menu-overlay').classList.add('flex');
            playBleep();
        }

        function closeMiniGameMenu() {
            document.getElementById('minigames-menu-overlay').classList.add('hidden');
            document.getElementById('minigames-menu-overlay').classList.remove('flex');
            playBleep();
        }

        function launchDoorMiniGame(gameId) {
            let reqEnergy = 0;
            let reqMoney = 0;

            if (gameId === 'concert') { reqEnergy = 30; reqMoney = 50; }
            else if (gameId === 'openmic') { reqEnergy = 20; reqMoney = 0; }
            else if (gameId === 'vinyl') { reqEnergy = 10; reqMoney = 0; }
            else if (gameId === 'prostudio') { reqEnergy = 40; reqMoney = 200; }
            else if (gameId === 'street') { reqEnergy = 5; reqMoney = 0; }

            if (state.energy < reqEnergy) {
                showToast("Énergie insuffisante pour cette activité !", "error");
                if (typeof playError === 'function') playError();
                return;
            }
            if (state.money < reqMoney) {
                showToast("Fonds insuffisants pour cette activité !", "error");
                if (typeof playError === 'function') playError();
                return;
            }

            closeMiniGameMenu();
            
            // Deduct costs (for vinyl, money is deducted inside the custom overlay)
            state.energy = Math.max(0, state.energy - reqEnergy);
            if (reqMoney > 0) {
                logMoney(-reqMoney, `Activité ${gameId.toUpperCase()}`);
            }

            // 1. Applique le cooldown (240 minutes = 4 heures in-game)
            if (!state.cooldowns) state.cooldowns = {};
            state.cooldowns.doorTimeReady = getTotalMins() + 240; 
            
            // 2. Cache le bouton d'action immédiatement
            const doorBtn = document.getElementById('door-action-btn');
            if (doorBtn) doorBtn.classList.add('hidden');
            
            // 3. Lance le mini-jeu/activité correspondant
            if (gameId === 'concert') {
                startConcertEvent();
            } else if (gameId === 'openmic') {
                startOpenMicMiniGame();
            } else if (gameId === 'vinyl') {
                startVinylMarketEvent();
            } else if (gameId === 'prostudio') {
                startProStudioEvent();
            } else if (gameId === 'street') {
                startStreetEvent();
            }
            
            updateHUD();
            saveGame();
        }

        function startConcertEvent() {
            state.inspi = Math.min(100, state.inspi + 30);
            state.rep = Math.max(0, state.rep + 15);
            let extraMsg = "";
            if (Math.random() < 0.25) {
                extraMsg = " Un rappeur connu t'a remarqué dans l'espace VIP !";
                setTimeout(() => {
                    triggerRandomEvent('collab_known');
                }, 1500);
            }
            showToast("🎸 Concert génial ! +30 Inspiration, +15 Réputation." + extraMsg, "success");
            if (typeof playSuccess === 'function') playSuccess();
            updateHUD();
        }

        function startOpenMicMiniGame() {
            state.isEventActive = true;
            if (typeof window.enforceFpsModalPriority === 'function') window.enforceFpsModalPriority();
            const overlay = document.createElement('div');
            overlay.className = 'gta-evt-backdrop fixed inset-0 z-[999999] flex flex-col items-center justify-center p-3 sm:p-4';
            overlay.style.setProperty('--evt-rgb', '16, 185, 129');
            overlay.innerHTML = `
                <div class="gta-evt-dossier">
                    <div class="gta-evt-topbar">
                        <div class="flex items-center gap-2 min-w-0">
                            <span class="gta-evt-dot"></span>
                            <span class="truncate">SORTIE SCÈNE · OPEN MIC</span>
                        </div>
                        <span class="shrink-0 text-emerald-400">TIMING LIVE</span>
                    </div>
                    <div class="p-5 sm:p-6 flex flex-col gap-4">
                        <div class="gta-evt-title-block">
                            <div class="text-[10px] font-mono uppercase tracking-[0.26em] text-emerald-400">PERFORMANCE SCÈNE</div>
                            <h3 class="text-2xl font-extrabold tracking-[0.12em] uppercase text-white mt-0.5">OPEN MIC LOCAL</h3>
                        </div>
                        <p class="text-xs sm:text-sm text-zinc-300">Attends que le curseur passe dans la <strong class="text-emerald-300">zone verte centrale</strong> puis clique sur <strong>DROP THE BEAT</strong> !</p>

                        <div class="relative w-full h-9 bg-zinc-900 rounded-xl border border-white/15 overflow-hidden shadow-inner">
                            <div class="absolute left-[40%] right-[40%] top-0 bottom-0 bg-emerald-500/35 border-l-2 border-r-2 border-emerald-400"></div>
                            <div id="openmic-cursor" class="absolute left-0 top-0 bottom-0 w-2 bg-white shadow-[0_0_12px_#fff]"></div>
                        </div>

                        <button id="openmic-btn" class="gta-evt-choice text-center !py-3.5" style="--choice-rgb: 16, 185, 129;">
                            <span class="text-sm font-extrabold tracking-[0.18em] uppercase text-emerald-300">DROP THE BEAT</span>
                        </button>
                    </div>
                </div>
            `;
            document.body.appendChild(overlay);

            let cursorPosition = 0;
            let direction = 1;
            let active = true;

            function animateCursor() {
                if (!active) return;
                cursorPosition += direction * 2.5;
                if (cursorPosition >= 100) {
                    cursorPosition = 100;
                    direction = -1;
                } else if (cursorPosition <= 0) {
                    cursorPosition = 0;
                    direction = 1;
                }
                const cursor = document.getElementById('openmic-cursor');
                if (cursor) cursor.style.left = cursorPosition + '%';
                requestAnimationFrame(animateCursor);
            }
            requestAnimationFrame(animateCursor);

            const btn = overlay.querySelector('#openmic-btn');
            btn.onclick = () => {
                if (!active) return;
                active = false;

                if (cursorPosition >= 40 && cursorPosition <= 60) {
                    logFollower(500);
                    state.rep = Math.max(0, state.rep + 10);
                    showToast("🎤 Carton plein à l'Open Mic ! La foule t'adore (+500 FANS, +10 REP) !", "success");
                    if (typeof playSuccess === 'function') playSuccess();
                } else {
                    state.rep = Math.max(0, state.rep - 5);
                    state.inspi = Math.min(100, state.inspi + 10);
                    showToast("🎤 Tu as bégayé sur scène... Mais l'erreur instruit (-5 REP, +10 INSPI).", "error");
                    if (typeof playError === 'function') playError();
                }

                state.isEventActive = false;
                overlay.remove();
                updateHUD();
                saveGame();
            };
        }

        function startVinylMarketEvent() {
            state.isEventActive = true;
            if (typeof window.enforceFpsModalPriority === 'function') window.enforceFpsModalPriority();
            const overlay = document.createElement('div');
            overlay.className = 'gta-evt-backdrop fixed inset-0 z-[999999] flex flex-col items-center justify-center p-3 sm:p-4';
            overlay.style.setProperty('--evt-rgb', '245, 158, 11');
            overlay.innerHTML = `
                <div class="gta-evt-dossier">
                    <div class="gta-evt-topbar">
                        <div class="flex items-center gap-2 min-w-0">
                            <span class="gta-evt-dot"></span>
                            <span class="truncate">SORTIE DIGGING · VINYLES RARES</span>
                        </div>
                        <button id="close-vinyl-market" class="text-zinc-400 hover:text-white transition-colors cursor-pointer">✕</button>
                    </div>
                    <div class="p-5 sm:p-6 flex flex-col gap-4">
                        <div class="gta-evt-title-block">
                            <div class="text-[10px] font-mono uppercase tracking-[0.26em] text-amber-400">CRATE DIGGING</div>
                            <h3 class="text-2xl font-extrabold tracking-[0.12em] uppercase text-white mt-0.5">MARCHÉ AUX VINYLES</h3>
                        </div>
                        <p class="text-xs sm:text-sm text-zinc-300">Choisis un bac mystère (<strong class="text-amber-300">$30 – $150</strong>). Donne <strong class="text-emerald-400">+1.5 Score</strong> sur tes 3 prochains exports !</p>

                        <div class="grid grid-cols-3 gap-2.5">
                            <button type="button" class="vinyl-crate gta-evt-choice flex flex-col items-center text-center !p-3.5" style="--choice-rgb: 245, 158, 11;" data-idx="1">
                                <span class="text-3xl mb-1.5">📦</span>
                                <span class="text-[10px] font-mono font-bold uppercase tracking-wider text-white">Bac Vintage</span>
                            </button>
                            <button type="button" class="vinyl-crate gta-evt-choice flex flex-col items-center text-center !p-3.5" style="--choice-rgb: 245, 158, 11;" data-idx="2">
                                <span class="text-3xl mb-1.5">📁</span>
                                <span class="text-[10px] font-mono font-bold uppercase tracking-wider text-white">Mystère</span>
                            </button>
                            <button type="button" class="vinyl-crate gta-evt-choice flex flex-col items-center text-center !p-3.5" style="--choice-rgb: 245, 158, 11;" data-idx="3">
                                <span class="text-3xl mb-1.5">💿</span>
                                <span class="text-[10px] font-mono font-bold uppercase tracking-wider text-white">Collector</span>
                            </button>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(overlay);

            overlay.querySelector('#close-vinyl-market').onclick = () => {
                state.isEventActive = false;
                overlay.remove();
            };

            overlay.querySelectorAll('.vinyl-crate').forEach(el => {
                el.onclick = () => {
                    const price = Math.floor(30 + Math.random() * 121);
                    if (state.money < price) {
                        showToast(`Fonds insuffisants ! Cet album coûte ${price}$`, "error");
                        if (typeof playError === 'function') playError();
                        return;
                    }

                    logMoney(-price, "Achat Vinyle Marché");
                    state.activeDoorBoosts.vinylCharges = (state.activeDoorBoosts.vinylCharges || 0) + 3;
                    showToast(`💿 Achat réussi pour ${price}$ ! Boost Vinyle activé : +1.5 au score des 3 prochains exports.`, "success");
                    if (typeof playSuccess === 'function') playSuccess();

                    state.isEventActive = false;
                    overlay.remove();
                    updateHUD();
                    saveGame();
                };
            });
        }

        function startProStudioEvent() {
            state.activeDoorBoosts.proStudioCharges = (state.activeDoorBoosts.proStudioCharges || 0) + 1;
            showToast("🎛️ Session Studio réservée ! Ton prochain export sera propulsé avec un bonus de +1.5 au score sans cooldown.", "success");
            if (typeof playSuccess === 'function') playSuccess();
            updateHUD();
            saveGame();
        }

        function startStreetEvent() {
            state.inspi = Math.min(100, state.inspi + 15);
            const ambientPhrases = [
                "Tu as entendu une conversation animée dans le métro, ça te donne une idée géniale de titre.",
                "Une affiche de concert vintage à moitié déchirée t'inspire une nouvelle structure de BPM.",
                "Le rythme saccadé d'un marteau-piqueur au loin te donne une idée de pattern de batterie drill.",
                "Tu observes le coucher de soleil sur les toits de la ville, parfait pour une mélo mélancolique.",
                "Une rencontre rapide avec un fan de rue te regonfle le moral et booste ton inspiration."
            ];
            const phrase = ambientPhrases[Math.floor(Math.random() * ambientPhrases.length)];
            showToast(`🚶 ${phrase} (+15 INSPI)`, "success");
            if (typeof playSuccess === 'function') playSuccess();
            updateHUD();
            saveGame();
        }

        function standUp(energyGain) {
            state.isSitting = false;
            MusicSystem.crossfadeTo('room', 3.0); // <-- AJOUT ICI (Retour à la room)

            if (currentRoomAvatar) {
                // Restauration de la position debout d'origine
                if (currentRoomAvatar.userData.preSitPos) {
                    currentRoomAvatar.position.copy(currentRoomAvatar.userData.preSitPos);
                    currentRoomAvatar.rotation.copy(currentRoomAvatar.userData.preSitRot);

                    // --- NOUVEAU : On force la gravité pour écraser tout bug de lévitation ---
                    currentRoomAvatar.position.y = -0.95;
                }

                // Reset des membres de l'avatar
                const visual = currentRoomAvatar.getObjectByName("AvatarVisual") || currentRoomAvatar.children[0];
                if (visual) {
                    visual.position.y = 0;
                    const legL = visual.getObjectByName("Leg_L");
                    const legR = visual.getObjectByName("Leg_R");
                    if (legL && legR) {
                        legL.rotation.x = 0;
                        legR.rotation.x = 0;
                    }
                    // Reset de la pose de détente
                    const head = visual.getObjectByName("HeadGroup");
                    const torso = visual.getObjectByName("Torso");
                    if (head) head.rotation.x = 0;
                    if (torso) torso.rotation.x = 0;
                }
            }

            // Application du gain d'énergie
            state.energy = Math.min(100, state.energy + energyGain);
            // Restore some inspiration after chilling on the sofa
            try {
                state.inspi = Math.min(100, (Number(state.inspi) || 0) + 25);
            } catch(e) {}

            showToast(`Pause terminée. Énergie récupérée (+${energyGain}% NRJ)`, "success");
            playSuccess();
            updateHUD();
            saveGame();
        }


        // ==========================================
        // MINI-JEUX: INGENIERIE DU SON
        // ==========================================

        const PLUGIN_QUIZ_QUESTIONS = [
    {
        question: "Selon le théorème de Nyquist-Shannon, quelle doit être la fréquence d'échantillonnage minimale pour capturer fidèlement une fréquence de 20 kHz ?",
        options: [
            { name: "40 kHz", desc: "Le double de la fréquence maximale (Fréquence de Nyquist).", correct: true },
            { name: "44.1 kHz", desc: "Le standard CD, mais ce n'est pas le minimum mathématique absolu.", correct: false },
            { name: "20 kHz", desc: "Créera un repliement de spectre (Aliasing) sévère.", correct: false },
            { name: "10 kHz", desc: "Ne capturera que les fréquences jusqu'à 5 kHz.", correct: false }
        ]
    },
    {
        question: "À quoi sert l'ajout de Dither lors de l'export d'un mixage de 24 bits vers 16 bits ?",
        options: [
            { name: "Masquer l'erreur de quantification", desc: "Ajoute un bruit de bas niveau pour éviter la distorsion harmonique de troncature.", correct: true },
            { name: "Augmenter le LUFS", desc: "Le dither n'affecte pas le niveau de Loudness perçu.", correct: false },
            { name: "Élargir l'image stéréo", desc: "C'est le rôle d'un élargisseur stéréo, pas du dither.", correct: false },
            { name: "Couper les sub-basses inutiles", desc: "Ça, c'est le travail d'un filtre passe-haut (HPF).", correct: false }
        ]
    },
    {
        question: "Qu'est-ce que l'effet de proximité sur un microphone directionnel ?",
        options: [
            { name: "Une augmentation des basses fréquences", desc: "Les graves s'amplifient quand la source est très proche de la capsule.", correct: true },
            { name: "Une réverbération naturelle de la pièce", desc: "C'est l'acoustique de la pièce, captée par un micro omni par exemple.", correct: false },
            { name: "Une saturation de la membrane", desc: "C'est dû à un SPL trop élevé, pas à la proximité en soi.", correct: false },
            { name: "Un déphasage stéréo", desc: "Arrive avec des configurations multi-micros mal espacées (Règle des 3:1).", correct: false }
        ]
    },
    {
        question: "Dans un compresseur, quel paramètre détermine la vitesse à laquelle la réduction de gain s'arrête ?",
        options: [
            { name: "Le Release", desc: "Le temps mis par le compresseur pour revenir à un gain unitaire (0 dB de GR).", correct: true },
            { name: "L'Attack", desc: "Le temps mis pour réagir aux transitoires dépassant le threshold.", correct: false },
            { name: "Le Ratio", desc: "La sévérité de l'écrasement une fois le threshold dépassé.", correct: false },
            { name: "Le Knee", desc: "La douceur ou la rudesse de la transition vers la compression.", correct: false }
        ]
    },
    {
        question: "Sur un égaliseur paramétrique, à quoi correspond le paramètre 'Q' ?",
        options: [
            { name: "Au Facteur de Qualité (Largeur de bande)", desc: "Un Q élevé affecte une zone étroite (chirurgicale), un Q bas une zone large (musicale).", correct: true },
            { name: "À la quantité de Gain", desc: "C'est le paramètre de Gain (Boost/Cut).", correct: false },
            { name: "À la fréquence de coupure", desc: "C'est le paramètre Freq (Hz/kHz).", correct: false },
            { name: "Au Q-Routing du signal", desc: "Ceci est un terme inventé.", correct: false }
        ]
    }
];

        function startLufsWarMiniGame() {
            state.isEventActive = true;
            if (typeof window.enforceFpsModalPriority === 'function') window.enforceFpsModalPriority();
            document.getElementById('lufs-war-overlay')?.remove();

            const overlay = document.createElement('div');
            overlay.id = 'lufs-war-overlay';
            overlay.innerHTML = `
                <div class="gta-evt-backdrop fixed inset-0 flex items-center justify-center z-[999999] p-3 sm:p-4" style="--evt-rgb: 245, 158, 11;">
                    <div class="gta-evt-dossier">
                        <div class="gta-evt-topbar">
                            <div class="flex items-center gap-2 min-w-0">
                                <span class="gta-evt-dot"></span>
                                <span class="truncate">DOSSIER STUDIO · MASTERING</span>
                            </div>
                            <span class="shrink-0 text-amber-400">CIBLE -14 LUFS</span>
                        </div>

                        <div class="p-5 sm:p-6 flex flex-col gap-4">
                            <div class="gta-evt-title-block">
                                <div class="text-[10px] font-mono uppercase tracking-[0.26em] text-amber-400/90">SIGNAL CALIBRATION</div>
                                <h2 class="text-2xl sm:text-3xl font-extrabold tracking-[0.12em] uppercase text-white leading-tight mt-0.5">GUERRE DU LUFS</h2>
                            </div>

                            <p class="text-[13px] sm:text-sm text-zinc-300 leading-relaxed">
                                Calibre ton master à <strong class="text-amber-300">-14 LUFS</strong> sans dépasser le seuil de clipping. Un master propre débloque <strong class="text-emerald-400">+10% multiplicateur</strong>.
                            </p>

                            <div class="space-y-3 bg-black/45 p-4 rounded-xl border border-white/10">
                                <div class="flex items-center gap-3">
                                    <span class="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-400 w-14 shrink-0">GAIN</span>
                                    <input type="range" id="lufs-gain" min="-20" max="20" value="0" class="flex-1 h-2 bg-zinc-800 rounded-lg accent-amber-400 cursor-pointer">
                                    <span id="lufs-gain-val" class="text-white font-mono text-xs font-bold w-12 text-right tabular-nums">0dB</span>
                                </div>
                                <div class="flex items-center gap-3">
                                    <span class="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-400 w-14 shrink-0">COMP</span>
                                    <input type="range" id="lufs-comp" min="1" max="10" value="4" class="flex-1 h-2 bg-zinc-800 rounded-lg accent-amber-400 cursor-pointer">
                                    <span id="lufs-comp-val" class="text-white font-mono text-xs font-bold w-12 text-right tabular-nums">4:1</span>
                                </div>
                            </div>

                            <!-- VU Meter Précision -->
                            <div class="bg-black/50 p-3.5 rounded-xl border border-white/10">
                                <div class="flex items-center justify-between mb-2">
                                    <span class="text-[9px] font-mono uppercase tracking-[0.2em] text-zinc-400">LOUDNESS METER</span>
                                    <span id="lufs-value" class="font-mono font-extrabold text-sm tracking-wider tabular-nums">-14 LUFS</span>
                                </div>
                                <div class="h-3.5 bg-zinc-900 rounded-full relative overflow-hidden border border-white/10">
                                    <div id="lufs-meter" class="h-full rounded-full transition-all duration-150" style="width: 50%; background-color: #fbbf24;"></div>
                                    <div class="absolute top-0 bottom-0 w-0.5 bg-white/80 pointer-events-none" style="left: 44%;" title="Cible -14 LUFS"></div>
                                </div>
                                <div class="flex justify-between text-[9px] font-mono uppercase tracking-widest text-zinc-500 mt-1.5">
                                    <span>-25 TROP BAS</span>
                                    <span class="text-emerald-400/90">-14 OPTIMAL</span>
                                    <span class="text-red-400/90">0 CLIPPING</span>
                                </div>
                            </div>

                            <div class="grid grid-cols-2 gap-2.5 pt-1">
                                <button onclick="validateLufsWar()" class="gta-evt-choice text-center !py-3" style="--choice-rgb: 16, 185, 129;">
                                    <div class="text-xs font-extrabold tracking-[0.14em] uppercase text-emerald-300">Valider Master</div>
                                    <div class="text-[9px] font-mono text-zinc-400 mt-0.5 uppercase tracking-wider">Tester le signal</div>
                                </button>
                                <button onclick="closeLufsWar()" class="gta-evt-choice text-center !py-3" style="--choice-rgb: 148, 163, 184;">
                                    <div class="text-xs font-extrabold tracking-[0.14em] uppercase text-zinc-300">Abandonner</div>
                                    <div class="text-[9px] font-mono text-zinc-500 mt-0.5 uppercase tracking-wider">Quitter session</div>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(overlay);

            // Logique du jeu
            const gainSlider = document.getElementById('lufs-gain');
            const compSlider = document.getElementById('lufs-comp');
            const meter = document.getElementById('lufs-meter');
            const value = document.getElementById('lufs-value');

            function updateLufsDisplay() {
                const gain = parseInt(gainSlider.value);
                const compRatio = parseInt(compSlider.value);

                // Simulation réaliste :
                // - Plus de gain = LUFS plus élevé
                // - Plus de compression = LUFS plus stable (moins sensible au gain)
                const baseLufs = -20 + gain;
                const compEffect = (compRatio - 1) * 0.5; // 1:1 = 0, 4:1 = 1.5, 10:1 = 4.5
                let lufs = baseLufs + compEffect;

                // Clipping si gain > 10
                const isClipping = gain > 10;
                if (isClipping) lufs = Math.min(lufs, -5); // LUFS ne peut pas dépasser -5 en clipping

                // Limiter entre -25 et 0
                lufs = Math.max(-25, Math.min(0, lufs));

                // Mettre à jour l'interface
                const meterWidth = ((lufs + 25) / 25) * 100; // -25 = 0%, 0 = 100%
                meter.style.width = `${meterWidth}%`;

                // Couleur du meter
                if (isClipping) {
                    meter.style.backgroundColor = '#ef4444'; // Rouge (clipping)
                    value.style.color = '#f87171';
                } else if (lufs >= -14) {
                    meter.style.backgroundColor = '#10b981'; // Vert (parfait)
                    value.style.color = '#34d399';
                } else if (lufs >= -20) {
                    meter.style.backgroundColor = '#fbbf24'; // Orange (proche)
                    value.style.color = '#fbbf24';
                } else {
                    meter.style.backgroundColor = '#6b7280'; // Gris (trop bas)
                    value.style.color = '#a1a1aa';
                }

                value.textContent = isClipping ? `${Math.round(lufs)} LUFS · CLIP!` : `${Math.round(lufs)} LUFS`;
            }

            gainSlider.addEventListener('input', () => {
                document.getElementById('lufs-gain-val').textContent = `${gainSlider.value}dB`;
                updateLufsDisplay();
            });

            compSlider.addEventListener('input', () => {
                document.getElementById('lufs-comp-val').textContent = `${compSlider.value}:1`;
                updateLufsDisplay();
            });

            updateLufsDisplay();
        }

        function validateLufsWar() {
            const gain = parseInt(document.getElementById('lufs-gain').value);
            const compRatio = parseInt(document.getElementById('lufs-comp').value);
            const baseLufs = -20 + gain;
            const compEffect = (compRatio - 1) * 0.5;
            let lufs = baseLufs + compEffect;
            lufs = Math.max(-25, Math.min(0, lufs));

            const isClipping = gain > 10;

            if (isClipping) {
                state.rep = Math.max(0, state.rep - 5);
                showToast("❌ CLIPPING DÉTECTÉ ! -5 REP", "error");
                playError();
            } else if (lufs >= -14) {
                const res = (typeof addPlayerMultiplier === 'function') ? addPlayerMultiplier(0.1, 'Master LUFS') : { multAdded: 0.1 };
                if (res.multAdded > 0) {
                    showToast("✅ LUFS parfait ! +10% multiplicateur permanent", "success");
                }
                playSuccess();
                if (typeof fireConfetti === 'function') fireConfetti('achievement');
            } else {
                showToast("⚠️ LUFS trop bas. Essaye encore.", "info");
                playBleep();
            }
            closeLufsWar();
        }

        function closeLufsWar() {
            state.isEventActive = false;
            document.getElementById('lufs-war-overlay')?.remove();
        }

        function startBlankPageMiniGame() {
            state.isEventActive = true;
            if (typeof window.enforceFpsModalPriority === 'function') window.enforceFpsModalPriority();
            document.getElementById('blank-page-overlay')?.remove();

            const overlay = document.createElement('div');
            overlay.id = 'blank-page-overlay';
            overlay.innerHTML = `
                <div class="gta-evt-backdrop fixed inset-0 flex items-center justify-center z-[999999] p-3 sm:p-4" style="--evt-rgb: 167, 139, 250;">
                    <div class="gta-evt-dossier wide">
                        <div class="gta-evt-topbar">
                            <div class="flex items-center gap-2 min-w-0">
                                <span class="gta-evt-dot"></span>
                                <span class="truncate">DOSSIER CRÉATIF · BLOCAGE</span>
                            </div>
                            <span class="shrink-0 text-violet-300">20 SEC · FLOW</span>
                        </div>

                        <div class="p-4 sm:p-6 flex flex-col gap-3.5">
                            <div class="gta-evt-title-block">
                                <div class="text-[10px] font-mono uppercase tracking-[0.26em] text-violet-300/90">INSPIRATION RECOVERY</div>
                                <h2 class="text-xl sm:text-2xl font-extrabold tracking-[0.12em] uppercase text-white leading-tight mt-0.5">SYNDROME DE LA PAGE BLANCHE</h2>
                            </div>

                            <p class="text-xs sm:text-sm text-zinc-400">
                                Retrouve le flow avant la fin du chrono. Clique sur chaque impulsion mélodique à temps pour enchaîner les combos.
                            </p>

                            <div id="blank-page-notes" class="relative w-full h-[38vh] min-h-[210px] max-h-[340px] bg-[#07080d] rounded-xl overflow-hidden border border-violet-400/20 shadow-inner cursor-crosshair" style="background-image: radial-gradient(rgba(167, 139, 250, 0.12) 1px, transparent 1px); background-size: 22px 22px;"></div>

                            <div class="w-full bg-black/50 p-3.5 rounded-xl border border-white/10 flex flex-col gap-2.5">
                                <div class="flex justify-between items-center gap-3">
                                    <span class="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-zinc-400 shrink-0">TEMPS</span>
                                    <div class="flex-1 h-2 bg-zinc-900 rounded-full overflow-hidden border border-white/10">
                                        <div id="blank-page-timer" class="h-full bg-violet-400 rounded-full transition-all duration-[1000ms] ease-linear" style="width: 100%"></div>
                                    </div>
                                </div>
                                <div class="flex justify-between items-center font-mono text-xs tracking-widest">
                                    <span class="text-zinc-400">COMBO <span id="blank-page-combo" class="text-white font-extrabold text-sm ml-1">x0</span></span>
                                    <span class="text-zinc-400">SCORE <span id="blank-page-score" class="text-emerald-400 font-extrabold text-base ml-1 tabular-nums">0</span></span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(overlay);

            const notesContainer = document.getElementById('blank-page-notes');
            const timer = document.getElementById('blank-page-timer');
            const scoreEl = document.getElementById('blank-page-score');
            const comboEl = document.getElementById('blank-page-combo');

            let score = 0;
            let combo = 0;
            let timeLeft = 20;
            let spawnSpeed = 600;
            const activeNotes = [];

            // Gamme Pentatonique Majeure (C Major Penta) - Impossible de faire une fausse note
            const pentatonicScale = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25];

            function spawnNote() {
                if (timeLeft <= 0) return;

                const note = document.createElement('div');
                note.className = 'absolute cursor-pointer flex items-center justify-center rounded-full bg-violet-400/20 border-2 border-violet-400 shadow-[0_0_16px_rgba(167,139,250,0.55)] transition-transform duration-100 ease-out';

                // Taille adaptée au mobile/PC pour hitbox confortable
                const size = (typeof isMobile !== 'undefined' && isMobile) ? 58 : 48;
                note.style.width = `${size}px`;
                note.style.height = `${size}px`;
                note.style.left = `calc(${Math.random() * 80 + 10}% - ${size/2}px)`;
                note.style.top = `calc(${Math.random() * 70 + 10}% - ${size/2}px)`;
                note.style.transform = 'scale(0)';

                // Cercle interne (Bullseye effect)
                const inner = document.createElement('div');
                inner.className = 'w-1/3 h-1/3 bg-white rounded-full pointer-events-none';
                note.appendChild(inner);

                notesContainer.appendChild(note);
                activeNotes.push(note);

                // Apparition "pop"
                requestAnimationFrame(() => {
                    note.style.transform = 'scale(1)';
                });

                // Durée de vie de la note avant "miss" (se réduit avec le temps)
                const lifeTime = Math.max(700, 1500 - (score * 30));

                note.timeout = setTimeout(() => {
                    if (note.parentElement) {
                        note.style.borderColor = '#ef4444';
                        note.style.transform = 'scale(0)';
                        combo = 0; // Break combo
                        comboEl.innerText = `x${combo}`;
                        comboEl.style.color = 'white';
                        setTimeout(() => note.remove(), 100);
                    }
                }, lifeTime);

                // Augmente la difficulté progressivement
                spawnSpeed = Math.max(300, 700 - (score * 15));
                if (timeLeft > 0) setTimeout(spawnNote, spawnSpeed);
            }

            setTimeout(spawnNote, 500);

            notesContainer.addEventListener('mousedown', (e) => {
                const note = e.target.closest('div.absolute');
                if (note && notesContainer.contains(note)) {
                    clearTimeout(note.timeout);
                    score += 10 + (combo * 2);
                    combo++;

                    scoreEl.textContent = score;
                    comboEl.textContent = `x${combo}`;

                    if (combo > 5) comboEl.style.color = '#fbbf24';
                    if (combo > 10) comboEl.style.color = '#34d399';

                    // Feedback auditif musical
                    const freq = pentatonicScale[Math.floor(Math.random() * pentatonicScale.length)];
                    if (typeof playTone === 'function') playTone(freq, 'sine', 0.1, 0.2);

                    // Animation explosion
                    note.style.transform = 'scale(1.5)';
                    note.style.opacity = '0';
                    setTimeout(() => note.remove(), 150);
                }
            });
            // Support Touch direct pour éviter le délai du mousedown sur mobile
            notesContainer.addEventListener('touchstart', (e) => {
                e.preventDefault();
                const touch = e.touches[0];
                const target = document.elementFromPoint(touch.clientX, touch.clientY);
                if (target && target.closest) {
                    const note = target.closest('div.absolute');
                    if (note) note.dispatchEvent(new Event('mousedown', { bubbles: true }));
                }
            }, { passive: false });

            const timerInterval = setInterval(() => {
                timeLeft--;
                timer.style.width = `${(timeLeft / 20) * 100}%`;
                if (timeLeft <= 0) {
                    clearInterval(timerInterval);
                    let inspiGain = Math.floor(score / 20);
                    if (score > 150) {
                        showToast(`🔥 Masterclass ! Flow retrouvé. +${inspiGain}% Inspiration`, "success");
                        playSuccess();
                        if (typeof fireConfetti === 'function') fireConfetti('store');
                    } else if (score > 50) {
                        showToast(`👍 Pas mal, quelques idées reviennent. +${inspiGain}% Inspiration`, "info");
                        playBleep();
                    } else {
                        inspiGain = -10;
                        showToast(`❌ Cerveau vide. Impossible de poser une note. -10% Inspi`, "error");
                        playError();
                    }
                    state.inspi = Math.min(100, Math.max(0, state.inspi + inspiGain));
                    state.isEventActive = false;
                    overlay.remove();
                    updateHUD();
                }
            }, 1000);
        }

        function startPluginQuiz() {
            state.isEventActive = true;
            if (typeof window.enforceFpsModalPriority === 'function') window.enforceFpsModalPriority();
            document.getElementById('plugin-quiz-overlay')?.remove();

            const rawQuestion = PLUGIN_QUIZ_QUESTIONS[Math.floor(Math.random() * PLUGIN_QUIZ_QUESTIONS.length)];
            // Mélange Fisher-Yates des options afin que la bonne réponse ne soit jamais figée au même emplacement
            const shuffledOptions = [...rawQuestion.options];
            for (let i = shuffledOptions.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [shuffledOptions[i], shuffledOptions[j]] = [shuffledOptions[j], shuffledOptions[i]];
            }
            const question = { question: rawQuestion.question, options: shuffledOptions };

            const overlay = document.createElement('div');
            overlay.id = 'plugin-quiz-overlay';
            overlay.innerHTML = `
                <div class="gta-evt-backdrop fixed inset-0 flex items-center justify-center z-[999999] p-3 sm:p-4" style="--evt-rgb: 56, 189, 248;">
                    <div class="gta-evt-dossier wide">
                        <div class="gta-evt-topbar">
                            <div class="flex items-center gap-2 min-w-0">
                                <span class="gta-evt-dot"></span>
                                <span class="truncate">DOSSIER STUDIO · QUIZ TECHNIQUE</span>
                            </div>
                            <span class="shrink-0 text-sky-400">+1 PLUGIN LÉGAL</span>
                        </div>

                        <div class="p-5 sm:p-6 flex flex-col gap-4">
                            <div class="gta-evt-title-block">
                                <div class="text-[10px] font-mono uppercase tracking-[0.26em] text-sky-400/90">INGÉNIERIE AUDIO · QCM</div>
                                <h2 class="text-xl sm:text-2xl font-extrabold tracking-[0.12em] uppercase text-white leading-tight mt-0.5">LE BON CHOIX DE PLUGIN</h2>
                            </div>

                            <div class="bg-black/45 border border-white/10 rounded-xl p-3.5 sm:p-4">
                                <p class="text-[13px] sm:text-sm text-zinc-200 leading-relaxed font-medium">${question.question}</p>
                            </div>

                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                ${question.options.map((option, i) => `
                                    <button onclick="selectPluginQuizOption(${i})" class="gta-evt-choice flex flex-col justify-between gap-1.5" style="--choice-rgb: 56, 189, 248;">
                                        <div class="flex items-start justify-between gap-2">
                                            <span class="text-white font-bold text-sm leading-snug">${option.name}</span>
                                            <span class="gta-evt-badge shrink-0 text-sky-300 border-sky-400/30 bg-sky-500/10">0${i + 1}</span>
                                        </div>
                                        <p class="text-zinc-400 text-xs leading-relaxed">${option.desc}</p>
                                    </button>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(overlay);

            // Stocker la question actuelle
            window.currentPluginQuiz = question;
        }

        function selectPluginQuizOption(index) {
            const question = window.currentPluginQuiz;
            const selected = question.options[index];

            if (selected.correct) {
                state.plugins += 1;
                showToast(`✅ Bonne réponse ! +1 plugin légal (${state.plugins} au total)`, "success");
                playSuccess();
                if (typeof fireConfetti === 'function') fireConfetti('store');
            } else {
                state.inspi = Math.max(0, state.inspi - 5);
                showToast(`❌ Mauvaise réponse... -5% inspiration`, "error");
                playError();
            }

            state.isEventActive = false;
            document.getElementById('plugin-quiz-overlay')?.remove();
        }

        window.startLufsWarMiniGame = startLufsWarMiniGame;
        window.validateLufsWar = validateLufsWar;
        window.closeLufsWar = closeLufsWar;
        window.startBlankPageMiniGame = startBlankPageMiniGame;
        window.startPluginQuiz = startPluginQuiz;
        window.selectPluginQuizOption = selectPluginQuizOption;


globalThis.stopJoystick = globalThis.stopJoystick || (() => {});
function initInteractionsProximitySetup() {
    initProximityHighlight();
    const _earlyHi = Array.isArray(window.highlightItems) && window.highlightItems !== highlightItems ? window.highlightItems.slice() : [];
    _earlyHi.forEach(it => {
        try {
            if (it && it.mesh && it.edges) {
                it.edges.material = it.edges.material || new THREE.LineBasicMaterial({ color: 0x000000, transparent: true, opacity: 0 });
                it.edges.userData = it.edges.userData || {};
                it.edges.userData.hovered = false;
                highlightItems.push(it);
            }
        } catch(e) {}
    });
    globalThis.highlightItems = highlightItems;
}
function initInteractions() {
    initInteractionsProximitySetup();
        // --- ÉCOUTEURS COMPLÉMENTAIRES DU JOYSTICK (MULTI-TOUCH SAFE) ---
        const canvasCont = document.getElementById('three-canvas-container');
        const joystickUI = document.getElementById('joystick-ui');
        const joystickKnob = document.getElementById('joystick-knob');

        canvasCont.addEventListener('pointermove', (e) => {
            if (isJoystickActive && (joystickPointerId === null || e.pointerId === joystickPointerId)) {
                window.lastPointerX = e.clientX;
                window.lastPointerY = e.clientY;
                e.preventDefault();
            }
        });

        // Blocage natif des scrolls fantômes sur mobile via touchmove dans la scène 3D
        canvasCont.addEventListener('touchmove', (e) => {
            if (window.isFpsRoomActive && window.isFpsRoomActive()) {
                e.preventDefault();
            }
        }, { passive: false });

        // Hover detection for interactables -> outline on hover & Studio+ Silhouette Tooltips (Diegetic UI)
        (function(){
            let lastHoverMesh = null;
            let lastHoveredSilhouetteGroup = null;
            let isMouseOverTooltip = false;
            let tooltipHideTimer = null;

            const tooltipEl = document.getElementById('studio-buy-tooltip');
            if (tooltipEl) {
                tooltipEl.addEventListener('mouseenter', () => {
                    isMouseOverTooltip = true;
                    if (tooltipHideTimer) {
                        clearTimeout(tooltipHideTimer);
                        tooltipHideTimer = null;
                    }
                });
                tooltipEl.addEventListener('mouseleave', () => {
                    isMouseOverTooltip = false;
                    if (tooltipHideTimer) {
                        clearTimeout(tooltipHideTimer);
                        tooltipHideTimer = null;
                    }
                    if (!isMobile) {
                        tooltipHideTimer = setTimeout(() => {
                            hideBuyTooltip();
                            tooltipHideTimer = null;
                        }, 300);
                    }
                });
            }

            window.findCatalogItemByObject = function(object) {
                if (!object) return null;
                let curr = object;
                while (curr) {
                    if (curr === (typeof sofaGroup !== 'undefined' ? sofaGroup : null)) return { item: FURNITURE_CATALOG.find(i => i.id === 'sofa'), group: sofaGroup };
                    if (curr === (typeof sideTableGroup !== 'undefined' ? sideTableGroup : null)) return { item: FURNITURE_CATALOG.find(i => i.id === 'table'), group: sideTableGroup };
                    if (curr === (typeof rugGroup !== 'undefined' ? rugGroup : null)) return { item: FURNITURE_CATALOG.find(i => i.id === 'rug'), group: rugGroup };
                    if (curr === (typeof tvGroup !== 'undefined' ? tvGroup : null)) return { item: FURNITURE_CATALOG.find(i => i.id === 'tv'), group: tvGroup };
                    if (curr === (typeof rackGroup !== 'undefined' ? rackGroup : null)) return { item: FURNITURE_CATALOG.find(i => i.id === 'rack_lamp'), group: rackGroup };
                    if (curr === (typeof acousticGroupL !== 'undefined' ? acousticGroupL : null)) return { item: FURNITURE_CATALOG.find(i => i.id === 'led_panel_l'), group: acousticGroupL };
                    if (curr === (typeof acousticGroupR !== 'undefined' ? acousticGroupR : null)) return { item: FURNITURE_CATALOG.find(i => i.id === 'led_panel_r'), group: acousticGroupR };
                    if (curr === (typeof synthGroup !== 'undefined' ? synthGroup : null)) return { item: FURNITURE_CATALOG.find(i => i.id === 'synth'), group: synthGroup };
                    if (curr === (typeof guitarGroup !== 'undefined' ? guitarGroup : null)) return { item: FURNITURE_CATALOG.find(i => i.id === 'guitar'), group: guitarGroup };
                    curr = curr.parent;
                }
                return null;
            }

            // NOUVEAU : Interaction "Double Tap" pour les objets (Mobile Uniquement)
            let lastTapTime = 0;
            
            canvasCont.addEventListener('touchend', (ev) => {
                if (window.fps) return; // Géré par le viseur central FPS + bouton tactile contextuel
                if (window.innerWidth > 768) return; // Cloisonné au Mobile
                if (isJoystickActive) return;
                
                // 1. Fermeture si l'info-bulle est déjà ouverte
                if (tooltipEl && tooltipEl.style.display !== 'none' && tooltipEl.style.display !== '') {
                    if (typeof hideBuyTooltip === 'function') hideBuyTooltip();
                    return; // Annule la suite, ce tapotement sert juste à fermer
                }

                if (ev.changedTouches.length === 0) return;
                
                const currentTime = Date.now();
                const tapLength = currentTime - lastTapTime;
                
                // 2. Détection du Double Tap (< 300ms)
                if (tapLength < 300 && tapLength > 0) {
                    if (window.mobileInteractionToastTimer) clearTimeout(window.mobileInteractionToastTimer); // Annule le toast d'erreur de clic simple
                    ev.preventDefault(); // Sécurité anti-zoom
                    ev.stopPropagation(); // NOUVEAU: Empêche l'Event Bubbling vers le document global
                    const touch = ev.changedTouches[0];
                    
                    try {
                        const rect = canvasCont.getBoundingClientRect();
                        const clientX = touch.clientX - rect.left;
                        const clientY = touch.clientY - rect.top;
                        mousePos.x = (clientX / rect.width) * 2 - 1;
                        mousePos.y = -(clientY / rect.height) * 2 + 1;
                        raycaster.setFromCamera(mousePos, camera);
                        
                        const intersects = raycaster.intersectObjects(scene.children, true).filter(hit => {
                            let isVisibleMesh = hit.object.isMesh && hit.object.visible;
                            if (!isVisibleMesh) return false;
                            let curr = hit.object.parent;
                            while (curr) {
                                if (!curr.visible) return false;
                                curr = curr.parent;
                            }
                            return true;
                        });

                        let foundSilhouette = null;
                        for (let hit of intersects) {
                            const hitInfo = findCatalogItemByObject(hit.object);
                            if (hitInfo && hitInfo.item) {
                                const isOwned = state && state.ownedFurniture && state.ownedFurniture.includes(hitInfo.item.id);
                                if (!isOwned) {
                                    foundSilhouette = { hit, info: hitInfo };
                                    break;
                                }
                            }
                        }

                        if (foundSilhouette) {
                            const { hit, info } = foundSilhouette;
                            const item = info.item;
                            const group = info.group;

                            if (lastHoveredSilhouetteGroup !== group) {
                                if (lastHoveredSilhouetteGroup) {
                                    lastHoveredSilhouetteGroup.traverse(child => {
                                        if (child.isMesh && child.userData.mysticMaterial) {
                                            child.userData.mysticMaterial.userData.targetOpacity = 0.9;
                                        }
                                    });
                                }
                                group.traverse(child => {
                                    if (child.isMesh && child.userData.mysticMaterial) {
                                        child.userData.mysticMaterial.userData.targetOpacity = 0.7;
                                    }
                                });
                                lastHoveredSilhouetteGroup = group;
                            }

                            window._v3TooltipCenter = window._v3TooltipCenter || new THREE.Vector3();
                            window._box3Tooltip = window._box3Tooltip || new THREE.Box3();
                            
                            window._box3Tooltip.setFromObject(group);
                            window._box3Tooltip.getCenter(window._v3TooltipCenter);
                            
                            const distToCam = camera.position.distanceTo(window._v3TooltipCenter);
                            const scaleValue = Math.max(0.6, Math.min(1.2, 32 / distToCam));

                            window._v3TooltipCenter.y += (window._box3Tooltip.max.y - window._box3Tooltip.min.y) * 0.4 + 0.3;
                            
                            window._v3TooltipProj = window._v3TooltipProj || new THREE.Vector3();
                            window._v3TooltipProj.copy(window._v3TooltipCenter).project(camera);

                            const widthHalf = rect.width / 2;
                            const heightHalf = rect.height / 2;
                            
                            if (tooltipEl) {
                                let screenX = (window._v3TooltipProj.x * widthHalf) + widthHalf + rect.left;
                                let screenY = -(window._v3TooltipProj.y * heightHalf) + heightHalf + rect.top;
                                const tw = tooltipEl.offsetWidth || 280;
                                const th = tooltipEl.offsetHeight || 120;
                                const margin = 16;

                                const halfWidthScaled = (tw * scaleValue) / 2;
                                const heightScaled = th * scaleValue;

                                screenX = Math.max(halfWidthScaled + margin, Math.min(window.innerWidth - halfWidthScaled - margin, screenX));
                                screenY = Math.max(heightScaled + margin + 15, Math.min(window.innerHeight - margin, screenY));

                                tooltipEl.style.left = `${screenX}px`;
                                tooltipEl.style.top = `${screenY}px`;
                                tooltipEl.style.transform = `translate(-50%, -100%) scale(${scaleValue})`;
                                tooltipEl.style.display = 'flex';
                                
                                document.getElementById('s-tooltip-name').innerText = item.name;
                                document.getElementById('s-tooltip-price').innerText = `$${item.price}`;
                                document.getElementById('s-tooltip-perk').innerText = item.perkDesc;
                                
                                const canAfford = state.money >= item.price;
                                const btn = document.getElementById('s-tooltip-buy-btn');
                                btn.dataset.itemId = item.id;
                                if (!canAfford) {
                                    btn.disabled = true;
                                    btn.classList.add('opacity-50', 'cursor-not-allowed');
                                    btn.classList.remove('hover:brightness-110');
                                } else {
                                    btn.disabled = false;
                                    btn.classList.remove('opacity-50', 'cursor-not-allowed');
                                    btn.classList.add('hover:brightness-110');
                                }
                            }
                        }
                    } catch(e) {}
                }
                lastTapTime = currentTime;
            }, { passive: false });

            function hideBuyTooltip() {
                if (tooltipHideTimer) {
                    clearTimeout(tooltipHideTimer);
                    tooltipHideTimer = null;
                }
                if (tooltipEl) tooltipEl.style.display = 'none';
                if (lastHoveredSilhouetteGroup) {
                    lastHoveredSilhouetteGroup.traverse(child => {
                        if (child.isMesh && child.userData.mysticMaterial) {
                            child.userData.mysticMaterial.userData.targetOpacity = 0.9;
                        }
                    });
                    lastHoveredSilhouetteGroup = null;
                }
            }

            let isRaycasterPending = false;
            canvasCont.addEventListener('pointermove', (ev) => {
                if (window.fps || isJoystickActive || isRaycasterPending) return;

                isRaycasterPending = true;
                requestAnimationFrame(() => {
                    try {
                        const rect = canvasCont.getBoundingClientRect();
                        const clientX = ev.clientX - rect.left;
                        const clientY = ev.clientY - rect.top;
                        mousePos.x = (clientX / rect.width) * 2 - 1;
                        mousePos.y = -(clientY / rect.height) * 2 + 1;
                        raycaster.setFromCamera(mousePos, camera);
                        const intersects = raycaster.intersectObjects(scene.children, true).filter(hit => {
                            let isVisibleMesh = hit.object.isMesh && hit.object.visible;
                            if (!isVisibleMesh) return false;
                            let curr = hit.object.parent;
                            while (curr) {
                                if (!curr.visible) return false;
                                curr = curr.parent;
                            }
                            return true;
                        });

                        // 1. Check if we hover over a silhouette (FURNITURE_CATALOG item, but not owned)
                        let foundSilhouette = null;
                        for (let hit of intersects) {
                            const hitInfo = findCatalogItemByObject(hit.object);
                            if (hitInfo && hitInfo.item) {
                                const isOwned = state && state.ownedFurniture && state.ownedFurniture.includes(hitInfo.item.id);
                                if (!isOwned) {
                                    foundSilhouette = { hit, info: hitInfo };
                                    break;
                                }
                            }
                        }

                        if (foundSilhouette) {
                            // On annule tout timer de fermeture car on survole à nouveau l'objet
                            if (tooltipHideTimer) {
                                clearTimeout(tooltipHideTimer);
                                tooltipHideTimer = null;
                            }

                            const { hit, info } = foundSilhouette;
                            const item = info.item;
                            const group = info.group;

                            // Hover transition to 0.7 opacity
                            if (lastHoveredSilhouetteGroup !== group) {
                                if (lastHoveredSilhouetteGroup) {
                                    lastHoveredSilhouetteGroup.traverse(child => {
                                        if (child.isMesh && child.userData.mysticMaterial) {
                                            child.userData.mysticMaterial.userData.targetOpacity = 0.9;
                                        }
                                    });
                                }
                                group.traverse(child => {
                                    if (child.isMesh && child.userData.mysticMaterial) {
                                        child.userData.mysticMaterial.userData.targetOpacity = 0.7;
                                    }
                                });
                                lastHoveredSilhouetteGroup = group;
                            }

                            // Project 3D position to 2D screen coordinates (sans réallocation Vector3/Box3)
                            window._v3TooltipCenter = window._v3TooltipCenter || new THREE.Vector3();
                            window._box3Tooltip = window._box3Tooltip || new THREE.Box3();
                            
                            window._box3Tooltip.setFromObject(group);
                            window._box3Tooltip.getCenter(window._v3TooltipCenter);
                            
                            // Calcul adaptatif de l'échelle selon la distance réelle caméra-objet
                            const distToCam = camera.position.distanceTo(window._v3TooltipCenter);
                            const scaleValue = Math.max(0.6, Math.min(1.2, 32 / distToCam));

                            window._v3TooltipCenter.y += (window._box3Tooltip.max.y - window._box3Tooltip.min.y) * 0.4 + 0.3;
                            
                            // Projection sur le plan caméra
                            window._v3TooltipProj = window._v3TooltipProj || new THREE.Vector3();
                            window._v3TooltipProj.copy(window._v3TooltipCenter).project(camera);

                            const widthHalf = rect.width / 2;
                            const heightHalf = rect.height / 2;
                            
                            if (tooltipEl) {
                                let screenX = (window._v3TooltipProj.x * widthHalf) + widthHalf + rect.left;
                                let screenY = -(window._v3TooltipProj.y * heightHalf) + heightHalf + rect.top;
                                
                                // --- CLAMPING RIGOUREUX ANTI-DÉBORDEMENT (Spécial Guitare Murale & Extrémités) ---
                                const tw = tooltipEl.offsetWidth || 280;
                                const th = tooltipEl.offsetHeight || 120;
                                const margin = 16;
                                
                                const halfWidthScaled = (tw * scaleValue) / 2;
                                const heightScaled = th * scaleValue;

                                // Clamping X strict : garde l'élément intégralement dans la fenêtre
                                screenX = Math.max(halfWidthScaled + margin, Math.min(window.innerWidth - halfWidthScaled - margin, screenX));
                                
                                // Clamping Y strict : empêche le tooltip de sortir par le haut ou le bas
                                screenY = Math.max(heightScaled + margin + 15, Math.min(window.innerHeight - margin, screenY));

                                document.getElementById('s-tooltip-name').innerText = item.name;
                                document.getElementById('s-tooltip-category').innerText = item.category.toUpperCase();
                                document.getElementById('s-tooltip-perk').innerText = item.perk;
                                
                                let prereqTexts = [];
                                if (item.reqRep > 0) prereqTexts.push(`${item.reqRep} REP`);
                                if (item.reqFollowers > 0) prereqTexts.push(`${formatNum(item.reqFollowers)} Fans`);
                                const prereqStr = prereqTexts.length > 0 ? prereqTexts.join(" & ") : "Aucun";
                                
                                const missingRep = state.rep < (item.reqRep || 0);
                                const missingFollowers = state.followers < (item.reqFollowers || 0);
                                const isLocked = missingRep || missingFollowers;
                                const scaledPrice = typeof getScaledPrice === 'function' ? getScaledPrice(item.price) : item.price;
                                const canAfford = state.money >= scaledPrice;

                                const prereqEl = document.getElementById('s-tooltip-prereq');
                                prereqEl.innerText = prereqStr;
                                prereqEl.className = isLocked ? 'text-[var(--retro-red)] font-bold' : 'text-gray-200';

                                const priceEl = document.getElementById('s-tooltip-price');
                                priceEl.innerText = `$${scaledPrice}`;
                                priceEl.className = !canAfford ? 'text-[var(--retro-red)] font-bold' : 'text-[var(--retro-green)] font-bold';

                                const buyBtn = document.getElementById('s-tooltip-buy-btn');
                                buyBtn.setAttribute('data-id', item.id);
                                if (isLocked) {
                                    buyBtn.innerText = "Verrouillé";
                                    buyBtn.className = "w-full btn-minimal py-2 text-xs rounded-lg opacity-50 cursor-not-allowed uppercase font-bold";
                                    buyBtn.disabled = true;
                                } else if (!canAfford) {
                                    buyBtn.innerText = "Fonds Insuffisants";
                                    buyBtn.className = "w-full btn-minimal py-2 text-xs rounded-lg border-[var(--retro-red)] text-[var(--retro-red)] opacity-60 cursor-not-allowed uppercase font-bold";
                                    buyBtn.disabled = true;
                                } else {
                                    buyBtn.innerText = `Installer ($${scaledPrice})`;
                                    buyBtn.className = "btn-action w-full py-2 text-xs rounded-lg font-bold shadow-md uppercase tracking-wider";
                                    buyBtn.disabled = false;
                                }

                                tooltipEl.style.left = `${screenX}px`;
                                tooltipEl.style.top = `${screenY}px`;
                                tooltipEl.style.transform = `translate(-50%, -100%) scale(${scaleValue})`;
                                tooltipEl.style.display = 'flex';
                            }

                            if (lastHoverMesh) {
                                const prev = (window.highlightItems||[]).find(it => it.mesh === lastHoverMesh || it.mesh.name === lastHoverMesh.name);
                                if (prev && prev.edges) prev.edges.userData.hovered = false;
                                lastHoverMesh = null;
                            }
                            return;
                        }

                        // 2. Normal interactable highlight fallback
                        const interactableHit = intersects.find(hit => interactableNames.includes(hit.object.name));
                        if (interactableHit) {
                            if (!isMouseOverTooltip && !tooltipHideTimer) {
                                tooltipHideTimer = setTimeout(() => {
                                    hideBuyTooltip();
                                    tooltipHideTimer = null;
                                }, 350);
                            }

                            const hitMesh = interactableHit.object;
                            if (lastHoverMesh !== hitMesh) {
                                if (lastHoverMesh) {
                                    const prev = (window.highlightItems||[]).find(it => it.mesh === lastHoverMesh || it.mesh.name === lastHoverMesh.name);
                                    if (prev && prev.edges) prev.edges.userData.hovered = false;
                                }
                                const item = (window.highlightItems||[]).find(it => it.mesh === hitMesh || it.mesh.name === hitMesh.name);
                                if (item && item.edges) item.edges.userData.hovered = true;
                                lastHoverMesh = hitMesh;
                            }
                            return;
                        }

                        if (lastHoverMesh) {
                            const prev = (window.highlightItems||[]).find(it => it.mesh === lastHoverMesh || it.mesh.name === lastHoverMesh.name);
                            if (prev && prev.edges) prev.edges.userData.hovered = false;
                            lastHoverMesh = null;
                        }
                        if (!isMouseOverTooltip && !tooltipHideTimer) {
                            tooltipHideTimer = setTimeout(() => {
                                hideBuyTooltip();
                                tooltipHideTimer = null;
                            }, 350);
                        }
                    } catch(e) {
                        console.warn(e);
                    } finally {
                        isRaycasterPending = false;
                    }
                });
            });

            canvasCont.addEventListener('pointerleave', () => {
                try {
                    if (lastHoverMesh) {
                        const prev = (window.highlightItems||[]).find(it => it.mesh === lastHoverMesh || it.mesh.name === lastHoverMesh.name);
                        if (prev && prev.edges) prev.edges.userData.hovered = false;
                        lastHoverMesh = null;
                    }
                    if (!isMouseOverTooltip && !tooltipHideTimer) {
                        tooltipHideTimer = setTimeout(() => {
                            hideBuyTooltip();
                            tooltipHideTimer = null;
                        }, 350);
                    }
                } catch(e){}
            });
        })();

        const stopJoystick = (e) => {
            if (e && e.pointerId !== undefined && joystickPointerId !== null && e.pointerId !== joystickPointerId) {
                return;
            }
            isJoystickActive = false;
            joystickPointerId = null;
            window.joystickVec.x = 0;
            window.joystickVec.z = 0;
            if (joystickUI) {
                joystickUI.style.opacity = '0';
                setTimeout(() => {
                    if (!isJoystickActive) joystickUI.style.display = 'none';
                }, 180);
            }
            if (joystickKnob) joystickKnob.style.transform = 'translate(0, 0)';
            const joyRest = document.getElementById('mobile-joy-rest');
            if (joyRest) joyRest.style.opacity = '0.58';
        };
        canvasCont.addEventListener('pointerup', stopJoystick);
        canvasCont.addEventListener('pointercancel', stopJoystick);

        canvasCont.addEventListener('pointerdown', (e) => {
            if (!window.isFpsRoomActive()) return;

            if (e.pointerType === 'touch') {
                touchTrackers.set(e.pointerId, {
                    startX: e.clientX,
                    startY: e.clientY,
                    startTime: performance.now(),
                    moved: false
                });
                // Moitié droite de l'écran = Caméra Look POV 360° tactile
                if (e.clientX >= window.innerWidth * 0.48 && mobileLookTouchId === null) {
                    mobileLookTouchId = e.pointerId;
                    mobileLookLastX = e.clientX;
                    mobileLookLastY = e.clientY;
                    return;
                }
                // Moitié gauche = Joystick virtuel de déplacement
                if (joystickPointerId === null) {
                    onPointerDown(e);
                }
                return;
            }

            // Desktop : Si déjà verrouillé en FPS -> Clic gauche déclenche l'interaction visée
            if (document.pointerLockElement === renderer.domElement) {
                if (e.button === 0) {
                    window.executeFpsTargetInteraction();
                }
            } else {
                // Sinon on verrouille la souris pour plonger en FPS
                window.requestFpsPointerLock();
            }
        });

        canvasCont.addEventListener('pointermove', (e) => {
            if (e.pointerType === 'touch') {
                const tr = touchTrackers.get(e.pointerId);
                if (tr && !tr.moved) {
                    if (Math.hypot(e.clientX - tr.startX, e.clientY - tr.startY) > 12) {
                        tr.moved = true;
                    }
                }
                if (e.pointerId === mobileLookTouchId) {
                    const dx = e.clientX - mobileLookLastX;
                    const dy = e.clientY - mobileLookLastY;
                    mobileLookLastX = e.clientX;
                    mobileLookLastY = e.clientY;
                    window.fps.yaw -= dx * 0.0054;
                    window.fps.pitch = Math.max(-1.25, Math.min(1.25, window.fps.pitch - dy * 0.0046));
                    e.preventDefault();
                }
            }
        });

        const clearMobileLook = (e) => {
            if (e.pointerType === 'touch') {
                const tr = touchTrackers.get(e.pointerId);
                touchTrackers.delete(e.pointerId);
                if (tr && !tr.moved && (performance.now() - tr.startTime) < 280) {
                    // Un tap court et net sur un objet 3D déclenche directement son interaction!
                    window.tryDirectTapInteraction(e.clientX, e.clientY);
                }
            }
            if (e.pointerId === mobileLookTouchId) mobileLookTouchId = null;
        };
        canvasCont.addEventListener('pointerup', clearMobileLook);
        canvasCont.addEventListener('pointercancel', clearMobileLook);

        // Touches d'interaction FPS : [E] Interagir, [F] Prendre l'air + [Échap] Quitter AbleOS si aucune app ouverte
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && document.body.classList.contains('os-active')) {
                const openWins = Array.from(document.querySelectorAll('.os-window')).filter(w => w.style.display && w.style.display !== 'none');
                if (openWins.length > 0) {
                    openWins.sort((a, b) => (parseInt(b.style.zIndex, 10) || 0) - (parseInt(a.style.zIndex, 10) || 0));
                    if (typeof closeApp === 'function') closeApp(openWins[0].id);
                    return;
                } else if (typeof quitPC === 'function') {
                    quitPC();
                    return;
                }
            }
            if (!window.isFpsRoomActive()) return;
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
            const k = e.key.toLowerCase();
            if (k === 'e') {
                e.preventDefault();
                window.executeFpsTargetInteraction();
            } else if (k === 'l') {
                if (typeof state !== 'undefined' && state && state.studioUnlocked && window.isFpsRoomActive && window.isFpsRoomActive()) {
                    if (typeof window.travelToStudioLocation === 'function') window.travelToStudioLocation();
                }
            } else if (k === 'g') {
                e.preventDefault();
                if (typeof window.enterCityWorld === 'function') window.enterCityWorld();
            } else if (k === 'f') {
                e.preventDefault();
                window.exitFpsPointerLock();
                if (typeof window.animateDoorCrackOpen === 'function') {
                    window.animateDoorCrackOpen(() => {
                        if (typeof window.triggerCinematic === 'function') window.triggerCinematic('escape');
                    });
                } else if (typeof window.triggerCinematic === 'function') {
                    window.triggerCinematic('escape');
                }
            }
        });

    Object.assign(globalThis, { canvasCont, joystickUI, joystickKnob, stopJoystick });
}
// --- Global Bridge & ES Exports ---
Object.assign(globalThis, { checkCollision, cameraLookTarget, normalizeAngle, togglePixarLamp, warmupMovement, rotateAvatarToward, startRestlessSleepAnimation, INTERACTION_DIST, HIGHLIGHT_LINE_COLOR, DEFAULT_LINE_COLOR, interactableNames, highlightItems, initProximityHighlight, raycaster, mousePos, onPointerDown, FPS_INTERACT_LABELS, FPS_BLOCKING_OVERLAY_IDS, isTouchUIActive, updateFpsLockUI, fpsCenterVec, fpsTapVec, fpsRaycaster, resolveTargetFromHits, getActiveFpsRaycastTargets, touchTrackers, openPianoRoll, closePianoRoll, quitPC, goSleep, wakeUp, goSit, openMiniGameMenu, closeMiniGameMenu, launchDoorMiniGame, startConcertEvent, startOpenMicMiniGame, startVinylMarketEvent, startProStudioEvent, startStreetEvent, standUp, PLUGIN_QUIZ_QUESTIONS, startLufsWarMiniGame, validateLufsWar, closeLufsWar, startBlankPageMiniGame, startPluginQuiz, selectPluginQuizOption, initInteractionsProximitySetup, initInteractions });
export { checkCollision, cameraLookTarget, normalizeAngle, togglePixarLamp, warmupMovement, rotateAvatarToward, startRestlessSleepAnimation, INTERACTION_DIST, HIGHLIGHT_LINE_COLOR, DEFAULT_LINE_COLOR, interactableNames, highlightItems, initProximityHighlight, raycaster, mousePos, onPointerDown, FPS_INTERACT_LABELS, FPS_BLOCKING_OVERLAY_IDS, isTouchUIActive, updateFpsLockUI, fpsCenterVec, fpsTapVec, fpsRaycaster, resolveTargetFromHits, getActiveFpsRaycastTargets, touchTrackers, openPianoRoll, closePianoRoll, quitPC, goSleep, wakeUp, goSit, openMiniGameMenu, closeMiniGameMenu, launchDoorMiniGame, startConcertEvent, startOpenMicMiniGame, startVinylMarketEvent, startProStudioEvent, startStreetEvent, standUp, PLUGIN_QUIZ_QUESTIONS, startLufsWarMiniGame, validateLufsWar, closeLufsWar, startBlankPageMiniGame, startPluginQuiz, selectPluginQuizOption, initInteractionsProximitySetup, initInteractions };
