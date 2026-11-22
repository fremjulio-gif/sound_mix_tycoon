import { THREE } from '../core/libs.js';

        // ==========================================
        // 2. THREE.JS SCENE
        // ==========================================
        globalThis.rackLeds = [];
        globalThis.isSceneReady = false; // Flag pour différer le rendu
        globalThis.currentRoomAvatar = null;
        globalThis.targetPosition = null;
        
        // --- SYSTÈME JOYSTICK VIRTUEL (BRAWL STARS STYLE) ---
        globalThis.isJoystickActive = false;
        globalThis.joystickStartX = 0; // Initial touch X position
        globalThis.joystickStartY = 0; // Initial touch Y position
        globalThis.joystickAnchorX = 0; // Fixed spawn point for constraint
        globalThis.joystickAnchorY = 0;
        window.lastPointerX = 0;
        window.lastPointerY = 0;
        window.joystickVec = { x: 0, z: 0 };
        
        // VARIABLES GLOBALES POUR L'ANIMATION
        globalThis.time = 0;
        globalThis.walkTime = 0;
        globalThis.stoppedMovingAt = 0;
        // Variables globales pour l'animation de sommeil agité
        globalThis.restlessSleepInterval = null;
        globalThis.restlessTargetOffsetX = 0;
        globalThis.restlessTargetOffsetY = 0;
        globalThis.restlessTargetOffsetZ = 0;
        globalThis.restlessTargetPosX = 0;
        globalThis.restlessTargetPosZ = 0;
        globalThis.wasMovingLastFrame = false;

function initSceneCore() {
        const GRID_SIZE = 1.0; 

        const container = document.getElementById('three-canvas-container');
        const scene = new THREE.Scene();
        scene.background = new THREE.Color('#101726');
        scene.fog = new THREE.FogExp2('#162033', 0.008);

        window.getBaseFpsFov = function() {
            if (!isMobile) return 68;
            return (window.innerWidth > window.innerHeight) ? 76 : 82;
        };
        const aspect = window.innerWidth / window.innerHeight;
        const baseFpsFov = window.getBaseFpsFov();
        const camera = new THREE.PerspectiveCamera(baseFpsFov, aspect, 0.08, 280);
        camera.rotation.order = 'YXZ';
        camera.position.set(0.2, 1.45, 2.4);

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "high-performance" });
        const dpr = isMobile ? Math.min(window.devicePixelRatio, 1.25) : Math.min(window.devicePixelRatio, 2);
        renderer.setPixelRatio(dpr);
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = isMobile ? THREE.BasicShadowMap : THREE.PCFShadowMap;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.18;
        if ('outputColorSpace' in renderer && THREE.SRGBColorSpace) {
            renderer.outputColorSpace = THREE.SRGBColorSpace;
        }
        container.appendChild(renderer.domElement);

        // --- ENVIRONNEMENT STUDIO PBR LUMINEUX (PMREM) POUR REFLETS ARCHITECTURAUX ---
        try {
            const pmremGen = new THREE.PMREMGenerator(renderer);
            pmremGen.compileEquirectangularShader();
            const envScene = new THREE.Scene();
            envScene.background = new THREE.Color('#3b4252');
            const envBox = new THREE.Mesh(
                new THREE.BoxGeometry(20, 12, 20),
                new THREE.MeshBasicMaterial({ color: '#5b5852', side: THREE.BackSide })
            );
            envScene.add(envBox);
            const warmPanel = new THREE.Mesh(new THREE.PlaneGeometry(10, 10), new THREE.MeshBasicMaterial({ color: '#fff6e8', side: THREE.DoubleSide }));
            warmPanel.position.set(0, 5.8, 0); warmPanel.rotation.x = Math.PI / 2; envScene.add(warmPanel);
            const winPanel = new THREE.Mesh(new THREE.PlaneGeometry(10, 6), new THREE.MeshBasicMaterial({ color: '#dbeafe', side: THREE.DoubleSide }));
            winPanel.position.set(9.8, 1.5, 0); winPanel.rotation.y = -Math.PI / 2; envScene.add(winPanel);
            const warmAccent = new THREE.Mesh(new THREE.PlaneGeometry(6, 3), new THREE.MeshBasicMaterial({ color: '#ffd8a8', side: THREE.DoubleSide }));
            warmAccent.position.set(-9.8, 1.4, -2); warmAccent.rotation.y = Math.PI / 2; envScene.add(warmAccent);
            const floorPanel = new THREE.Mesh(new THREE.PlaneGeometry(18, 18), new THREE.MeshBasicMaterial({ color: '#8f6944', side: THREE.DoubleSide }));
            floorPanel.position.set(0, -5.8, 0); floorPanel.rotation.x = -Math.PI / 2; envScene.add(floorPanel);
            scene.environment = pmremGen.fromScene(envScene, 0.04).texture;
            pmremGen.dispose();
        } catch(e) { console.warn('PMREM env fallback:', e); }

        // --- MCP THREE.JS DEVTOOLS GLOBAL BRIDGE EXPOSURE ---
        window.__THREE__ = THREE;
        window.__THREE_SCENE__ = scene;
        window.__THREE_CAMERA__ = camera;
        window.__THREE_RENDERER__ = renderer;
        try {
            if (typeof window.__THREE_DEVTOOLS__ === 'undefined' || !window.__THREE_DEVTOOLS__.dispatchEvent) {
                window.__THREE_DEVTOOLS__ = new EventTarget();
            }
            window.__THREE_DEVTOOLS__.scene = scene;
            window.__THREE_DEVTOOLS__.camera = camera;
            window.__THREE_DEVTOOLS__.renderer = renderer;
            window.__THREE_DEVTOOLS__.THREE = THREE;
        } catch(e) {}

        const listener = new THREE.AudioListener();
        camera.add(listener);



        // ==========================================
        // MÉMOIRE DES TOUCHES CLAVIER
        // ==========================================
        window.kbdState = { up: false, down: false, left: false, right: false };

        window.addEventListener('keydown', (e) => {
            // Sécurité : On ignore le clavier uniquement si on tape dans un champ hors de la pièce FPS active
            if (document.getElementById('pc-ui-layer').style.display === 'flex') return;
            const inFpsRoom = typeof window.isFpsRoomActive === 'function' && window.isFpsRoomActive();
            if ((e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') && !inFpsRoom) return;

            const k = e.key.toLowerCase();
            if (k === 'z' || k === 'w' || e.key === 'ArrowUp') window.kbdState.up = true;
            if (k === 's' || e.key === 'ArrowDown') window.kbdState.down = true;
            if (k === 'q' || k === 'a' || e.key === 'ArrowLeft') window.kbdState.left = true;
            if (k === 'd' || e.key === 'ArrowRight') window.kbdState.right = true;
        });

        window.addEventListener('keyup', (e) => {
            const k = e.key.toLowerCase();
            if (k === 'z' || k === 'w' || e.key === 'ArrowUp') window.kbdState.up = false;
            if (k === 's' || e.key === 'ArrowDown') window.kbdState.down = false;
            if (k === 'q' || k === 'a' || e.key === 'ArrowLeft') window.kbdState.left = false;
            if (k === 'd' || e.key === 'ArrowRight') window.kbdState.right = false;
        });

        
        // EVENEMENT RESIZE & ORIENTATIONCHANGE GLOBAL (Desktop + Mobile Portrait / Paysage)
        let _resizeTimer = null;
        function handleViewportResize() {
            if (_resizeTimer) clearTimeout(_resizeTimer);
            _resizeTimer = setTimeout(() => {
                isMobile = computeIsMobileLayout();
                window.isMobile = isMobile;

                const w = window.innerWidth;
                const h = window.innerHeight;
                camera.aspect = w / Math.max(1, h);
                const baseFov = window.getBaseFpsFov();
                camera.fov = Math.max(42, Math.min(90, baseFov + (window.fps ? window.fps.fovZoomOffset : 0)));
                camera.updateProjectionMatrix();

                const dprNow = isMobile ? Math.min(window.devicePixelRatio || 1, 1.25) : Math.min(window.devicePixelRatio || 1, 2);
                renderer.setPixelRatio(dprNow);
                renderer.setSize(w, h);

                if (isMobile) {
                    document.querySelectorAll('.os-window').forEach(win => {
                        if (win.style.display !== 'none') { win.style.left = '0px'; win.style.top = '0px'; }
                    });
                }
            }, 100);
        }
        window.addEventListener('resize', handleViewportResize, { passive: true });
        window.addEventListener('orientationchange', handleViewportResize, { passive: true });

        const hemiLight = new THREE.HemisphereLight('#f2f6ff', '#8b6e52', 1.05);
        scene.add(hemiLight);

        // Lumière naturelle traversant la baie vitrée panoramique Est
        const dirLight = new THREE.DirectionalLight('#fff6e8', 2.15);
        dirLight.name = "mainRoomLight";
        dirLight.position.set(13, 6.4, 1.6);
        dirLight.castShadow = true;
        const shadowSize = isMobile ? 512 : 2048;
        dirLight.shadow.mapSize.width = shadowSize;
        dirLight.shadow.mapSize.height = shadowSize;
        dirLight.shadow.bias = -0.0002;
        dirLight.shadow.camera.near = 1;
        dirLight.shadow.camera.far = 32;
        dirLight.shadow.camera.left = -7.5;
        dirLight.shadow.camera.right = 7.5;
        dirLight.shadow.camera.top = 6.5;
        dirLight.shadow.camera.bottom = -6.5;
        dirLight.shadow.radius = 4.5;
        dirLight.shadow.normalBias = 0.012;
        const dirTarget = new THREE.Object3D();
        dirTarget.position.set(-1.6, -0.5, -0.8);
        scene.add(dirTarget);
        dirLight.target = dirTarget;
        scene.add(dirLight);

        // ==========================================
        // DOUCHE DE LUMIÈRE STUDIO (SpotLight Plafonnier Interne)
        // ==========================================
        const ceilingLight = new THREE.SpotLight('#fff0dc', 42);
        ceilingLight.name = "ceilingLight";
        ceilingLight.position.set(0, 3.82, -0.2);
        ceilingLight.angle = Math.PI / 2.05;
        ceilingLight.penumbra = 0.9;
        ceilingLight.decay = 1.4;
        ceilingLight.distance = 18;

        const lightTarget = new THREE.Object3D();
        lightTarget.position.set(-0.3, -1, -0.4);
        scene.add(lightTarget);
        ceilingLight.target = lightTarget;

        ceilingLight.castShadow = false; // Évite les doubles ombres croisées/incohérentes sur les murs et le plafond
        const spotShadowSize = isMobile ? 512 : 1024;
        ceilingLight.shadow.mapSize.width = spotShadowSize;
        ceilingLight.shadow.mapSize.height = spotShadowSize;
        ceilingLight.shadow.bias = -0.0008;
        scene.add(ceilingLight);

        // Éclairages pratiques réalistes (sans shadow maps supplémentaires -> 60 FPS)
        const pcScreenLight = new THREE.PointLight('#8fa4ff', 1.6, 5.2, 1.8);
        pcScreenLight.position.set(-2.2, 1.55, -3.12);
        scene.add(pcScreenLight);
        window.pcScreenLight = pcScreenLight;

        // Halo LED chaleureux derrière le bureau (Bias lighting pro)
        const deskBiasLight = new THREE.PointLight('#ffb978', 3.4, 6.5, 1.8);
        deskBiasLight.position.set(-2.2, 1.15, -4.55);
        scene.add(deskBiasLight);
        window.deskBiasLight = deskBiasLight;

        // Rebonds naturels de lumière extérieure depuis la baie vitrée
        const windowBounceLight = new THREE.PointLight('#dbeafe', 5.8, 14, 1.5);
        windowBounceLight.position.set(3.9, 1.85, 1.1);
        scene.add(windowBounceLight);
        window.windowBounceLight = windowBounceLight;

        
    Object.assign(globalThis, { GRID_SIZE, container, scene, aspect, baseFpsFov, camera, renderer, dpr, listener, handleViewportResize, hemiLight, dirLight, dirTarget, ceilingLight, lightTarget, pcScreenLight, deskBiasLight, windowBounceLight });
}

        // ==========================================
        // CATALOGUE STUDIO+ (MARKETPLACE) & ACTIVE PERKS
        // ==========================================
        const FURNITURE_CATALOG = [
            // --- ACTE 1 : Survie ---
            { id: 'sofa', name: 'Canapé en cuir', price: 600, reqFollowers: 0, reqRep: 20, sceneObject: 'sofaGroup', category: 'confort', perk: 'Débloque la zone détente', effect: { type: 'unlockAction', value: 'goSit' }, tier: 1 },
            { id: 'table', name: 'Table basse', price: 300, reqFollowers: 0, reqRep: 10, sceneObject: 'tableGroup', category: 'deco', perk: 'Confort basique', effect: { type: 'none', value: null }, tier: 1 },
            { id: 'rug', name: 'Tapis vintage', price: 200, reqFollowers: 0, reqRep: 5, sceneObject: 'rugMesh', category: 'deco', perk: 'Ambiance cosy', effect: { type: 'none', value: null }, tier: 1 },

            // --- ACTE 2 : Confort ---

            { id: 'tv', name: 'TV Cathodique', price: 800, reqFollowers: 0, reqRep: 50, sceneObject: 'tvGroup', category: 'ambiance', perk: 'Écran interactif', effect: { type: 'none', value: null }, tier: 2 },
            { id: 'rack_lamp', name: 'Rack & Lampe', price: 2000, reqFollowers: 0, reqRep: 80, sceneObject: 'rackGroup', category: 'studio', perk: 'Chaleur & Lumière (+0.3x Mult)', effect: { type: 'multiplier', value: 0.3 }, tier: 2 },

            // --- ACTE 3 : Studio Pro ---
            { id: 'led_panel_l', name: 'Panneau LED (Gauche)', price: 1250, reqFollowers: 25, reqRep: 0, sceneObject: 'acousticGroupL', category: 'studio', perk: 'Meilleurs mix (+0.75 Review)', effect: { type: 'reviewBonus', value: 0.75 }, tier: 3 },
            { id: 'led_panel_r', name: 'Panneau LED (Droit)', price: 1250, reqFollowers: 25, reqRep: 0, sceneObject: 'acousticGroupR', category: 'studio', perk: 'Meilleurs mix (+0.75 Review)', effect: { type: 'reviewBonus', value: 0.75 }, tier: 3 },
            { id: 'synth', name: 'Synthétiseur', price: 3500, reqFollowers: 100, reqRep: 0, sceneObject: 'synthGroup', category: 'studio', perk: 'Débloque le Piano Roll', effect: { type: 'unlockAction', value: 'openPianoRoll' }, tier: 3 },

            // --- ACTE 4 : Flex ---
            { id: 'guitar', name: 'Guitare Murale', price: 1800, reqFollowers: 1000, reqRep: 0, sceneObject: 'guitarGroup', category: 'deco', perk: 'Flex (+5 REP/Story)', effect: { type: 'storyBonus', value: 5 }, tier: 4 }
        ];

        const activePerks = {
            multiplierBonus: 0,
            reviewBonus: 0,
            storyBonus: 0
        };

        function applyFurniturePerk(effect) {
            if (!effect || effect.type === 'none') return;
            
            switch (effect.type) {
                case 'multiplier':
                    activePerks.multiplierBonus += effect.value;
                    break;
                case 'reviewBonus':
                    activePerks.reviewBonus += effect.value;
                    break;
                case 'storyBonus':
                    activePerks.storyBonus += effect.value;
                    break;
            }
        }

        function recalculateActivePerks() {
            activePerks.multiplierBonus = 0;
            activePerks.reviewBonus = 0;
            activePerks.storyBonus = 0;
            
            if (state && state.ownedFurniture) {
                state.ownedFurniture.forEach(fid => {
                    const item = FURNITURE_CATALOG.find(f => f.id === fid);
                    if (item && item.effect) {
                        applyFurniturePerk(item.effect);
                    }
                });
            }
        }

        function getFurniture3DObject(sceneObjectName) {
            if (sceneObjectName === 'tableGroup') return typeof sideTableGroup !== 'undefined' ? sideTableGroup : null;
            if (sceneObjectName === 'rugMesh') return typeof rugGroup !== 'undefined' ? rugGroup : null;
            if (sceneObjectName === 'sofaGroup') return typeof sofaGroup !== 'undefined' ? sofaGroup : null;
            if (sceneObjectName === 'crateGroup') return typeof crateGroup !== 'undefined' ? crateGroup : null;
            if (sceneObjectName === 'tvGroup') return typeof tvGroup !== 'undefined' ? tvGroup : null;
            if (sceneObjectName === 'rackGroup') return typeof rackGroup !== 'undefined' ? rackGroup : null;
            if (sceneObjectName === 'acousticGroupL') return typeof acousticGroupL !== 'undefined' ? acousticGroupL : null;
            if (sceneObjectName === 'acousticGroupR') return typeof acousticGroupR !== 'undefined' ? acousticGroupR : null;
            if (sceneObjectName === 'synthGroup') return typeof synthGroup !== 'undefined' ? synthGroup : null;
            if (sceneObjectName === 'guitarGroup') return typeof guitarGroup !== 'undefined' ? guitarGroup : null;
            return null;
        }

        // =========================================================
        // --- SHADER HOLOGRAMME NÉON ÉPURÉ (MEUBLES NON ACHETÉS) ---
        // =========================================================
        const baseMysticMaterial = new THREE.ShaderMaterial({
            uniforms: {
                glowColor: { value: new THREE.Color(0x5ec8e5) },
                baseColor: { value: new THREE.Color(0x1d5c78) },
                fresnelPower: { value: 2.25 },
                opacity: { value: 0.095 },
                time: { value: 0.0 }
            },
            vertexShader: `
                varying vec3 vNormal;
                varying vec3 vViewPosition;
                varying vec3 vWorldPos;
                void main() {
                    vec4 worldPos = modelMatrix * vec4(position, 1.0);
                    vWorldPos = worldPos.xyz;
                    vec4 mvPosition = viewMatrix * worldPos;
                    vNormal = normalize(normalMatrix * normal);
                    vViewPosition = -mvPosition.xyz;
                    gl_Position = projectionMatrix * mvPosition;
                }
            `,
            fragmentShader: `
                uniform vec3 glowColor;
                uniform vec3 baseColor;
                uniform float fresnelPower;
                uniform float opacity;
                uniform float time;
                varying vec3 vNormal;
                varying vec3 vViewPosition;
                varying vec3 vWorldPos;

                void main() {
                    vec3 normal = normalize(vNormal);
                    if (!gl_FrontFacing) normal = -normal;
                    vec3 viewDir = normalize(vViewPosition);

                    // Rim Fresnel néon subtil et élégant
                    float fresnel = pow(1.0 - max(dot(normal, viewDir), 0.0), fresnelPower);

                    // Scanlines holographiques fines
                    float scanlines = 0.84 + 0.16 * sin(vWorldPos.y * 64.0 - time * 3.0);

                    // Balayage laser vertical doux
                    float sweepPhase = fract(vWorldPos.y * 0.28 - time * 0.16);
                    float laserBand = exp(-pow(sweepPhase - 0.5, 2.0) * 120.0);

                    // Couleur holographique dosée (lisible en plein jour sans saturer la pièce)
                    vec3 holoCol = mix(baseColor, glowColor * 1.05, clamp(fresnel * 0.78 + laserBand * 0.55, 0.0, 1.0));
                    holoCol += glowColor * laserBand * 0.45;
                    holoCol *= scanlines;

                    float alpha = clamp(opacity * scanlines + fresnel * 0.28 + laserBand * 0.16, 0.06, 0.46);
                    gl_FragColor = vec4(holoCol, alpha);
                }
            `,
            transparent: true,
            depthWrite: false,
            side: THREE.DoubleSide
        });

        window.activeMysticMaterials = [];

        function syncFurniture3DVisibility() {
            if (typeof FURNITURE_CATALOG === 'undefined') return;
            window.activeMysticMaterials = [];

            // Dans le Studio Pro (42e étage), aucun meuble ni hologramme de la chambre ne doit être visible
            if (window.activeStudioLocation === 'pro_studio') {
                FURNITURE_CATALOG.forEach(item => {
                    const obj = getFurniture3DObject(item.sceneObject);
                    if (obj) obj.visible = false;
                });
                if (window.pixarLamp) window.pixarLamp.visible = false;
                return;
            }
            
            const activeRoomTier = window.currentRoomVisualTier || 1;
            const playerCash = (typeof state !== 'undefined' && state) ? (Number(state.money) || 0) : 0;

            FURNITURE_CATALOG.forEach(item => {
                const obj = getFurniture3DObject(item.sceneObject);
                if (obj) {
                    const isOwned = state && state.ownedFurniture && state.ownedFurniture.includes(item.id);
                    // Apparition progressive des hologrammes :
                    // Niv. 1 -> meubles Acte 1 (tapis, table, canapé) ; Niv. 2 -> Acte 1-2 (+ TV, Rack) ; Niv. 3 -> tout le catalogue!
                    // Toujours visible si déjà acheté ou si le joueur a déjà les fonds requis.
                    const maxHoloAct = activeRoomTier >= 3 ? 4 : (activeRoomTier === 2 ? 2 : 1);
                    const isHoloAllowed = isOwned || (item.tier <= maxHoloAct) || (playerCash >= item.price);
                    obj.visible = isHoloAllowed;
                    if (!isHoloAllowed) return;

                    obj.traverse(child => {
                        if (child.isMesh) {
                            if (!child.userData.originalMaterial) {
                                child.userData.originalMaterial = child.material;
                            }
                            if (child.userData.originalCastShadow === undefined) {
                                child.userData.originalCastShadow = child.castShadow;
                                child.userData.originalReceiveShadow = child.receiveShadow;
                            }
                            if (isOwned) {
                                if (child.userData.hideWhenUnowned) child.visible = true;
                                child.material = child.userData.originalMaterial;
                                child.castShadow = child.userData.originalCastShadow;
                                child.receiveShadow = child.userData.originalReceiveShadow;
                                if (child.userData.holoEdges) {
                                    child.userData.holoEdges.visible = false;
                                }
                                if (child.material) {
                                    child.material.wireframe = false;
                                    child.material.transparent = false;
                                    child.material.opacity = 1.0;
                                    child.material.depthWrite = true;
                                    child.material.needsUpdate = true;
                                }
                            } else {
                                if (child.userData.hideWhenUnowned) {
                                    child.visible = false;
                                    return;
                                }
                                // Projection Hologramme Néon + Contours Filaires Lumineux (0 ombre noire!)
                                if (!child.userData.mysticMaterial) {
                                    child.userData.mysticMaterial = baseMysticMaterial.clone();
                                    const isRugObj = (item.sceneObject === 'rugMesh' || item.sceneObject === 'rugGroup');
                                    const baseHoloOp = activeRoomTier === 1 ? 0.060 : 0.092;
                                    child.userData.mysticMaterial.userData = { targetOpacity: isRugObj ? 0.055 : baseHoloOp };
                                    if (isRugObj) {
                                        // Évite tout Z-fighting avec le parquet sur le tapis plat non acheté
                                        child.userData.mysticMaterial.side = THREE.FrontSide;
                                        child.userData.mysticMaterial.polygonOffset = true;
                                        child.userData.mysticMaterial.polygonOffsetFactor = -4;
                                        child.userData.mysticMaterial.polygonOffsetUnits = -4;
                                    }
                                }
                                child.material = child.userData.mysticMaterial;
                                child.castShadow = false;
                                child.receiveShadow = false;
                                window.activeMysticMaterials.push(child.userData.mysticMaterial);

                                // Crée un contour filaire néon holographique fin et dosé sur les arêtes du meuble
                                if (!child.userData.holoEdges && child.geometry) {
                                    try {
                                        const edgeGeo = new THREE.EdgesGeometry(child.geometry, 24);
                                        const edgeMat = new THREE.LineBasicMaterial({
                                            color: 0x5ec8e5,
                                            transparent: true,
                                            opacity: 0.40,
                                            depthWrite: false
                                        });
                                        const holoLine = new THREE.LineSegments(edgeGeo, edgeMat);
                                        holoLine.userData.isHoloEdge = true;
                                        holoLine.raycast = () => {}; // N'interfère pas avec le raycaster FPS
                                        child.add(holoLine);
                                        child.userData.holoEdges = holoLine;
                                    } catch(e) {}
                                }
                                if (child.userData.holoEdges) {
                                    child.userData.holoEdges.visible = true;
                                }
                            }
                        } else if ((child.isLine || child.isLineSegments) && !child.userData.isHoloEdge) {
                            if (child.userData.originalVisible === undefined) {
                                child.userData.originalVisible = child.visible;
                            }
                            child.visible = false;
                        } else if (child.isLight) {
                            if (child.userData.originalIntensity === undefined) {
                                child.userData.originalIntensity = child.intensity;
                            }
                            child.intensity = isOwned ? child.userData.originalIntensity : 0;
                        }
                    });
                }
            });

            if (window.pixarLamp && state && state.ownedFurniture) {
                const hasLamp = state.ownedFurniture.includes('rack_lamp');
                window.pixarLamp.visible = hasLamp; // Rendre la lampe visible !
                if (!hasLamp) {
                    window.pixarLamp.userData.isOn = false;
                    if (window.pixarLamp.userData.spot) {
                        window.pixarLamp.userData.spot.intensity = 0;
                        window.pixarLamp.userData.spot.visible = false;
                    }
                }
            }
        }
        globalThis.frameCounter = 0;

        function animate3D() {
        requestAnimationFrame(animate3D);

        // SMART RENDERING : Pause 3D si une interface fullscreen (PC / Piano Roll) est active
        const loginLayer = document.getElementById('login-screen');
        const pcLayer = document.getElementById('pc-ui-layer');
        const prLayer = document.getElementById('standalone-pianoroll');
        
        const isLoginActive = loginLayer && loginLayer.style.display !== 'none' && !loginLayer.classList.contains('cinema-entering');
        const isPcActive = pcLayer && pcLayer.style.display === 'flex';
        const isPrActive = prLayer && !prLayer.classList.contains('hidden');

        if (isPcActive || isPrActive) {
            return;
        }
        if (!isLoginActive && window.activeStudioLocation === 'city' && typeof window._cityTick === 'function') {
            time += 0.016;
            try { window._cityTick(time); } catch (e) {}
            renderer.render(scene, camera);
            return;
        }

        // === OPTION 3 : STUDIO 3D LIVE DERRIÈRE L'ÉCRAN DE LOGIN CINÉMASCOPE ===
        if (isLoginActive) {
            if (!window._loginScenePrepped) {
                window._loginScenePrepped = true;
                try { if (typeof syncFurniture3DVisibility === 'function') syncFurniture3DVisibility(); } catch(e) {}
            }
            time += 0.014;
            try {
                const pHour = (typeof window._loginPreviewHour === 'number') ? window._loginPreviewHour : 9.2;
                const pRain = (typeof window._loginPreviewRain === 'number') ? window._loginPreviewRain : 0.0;
                const isNight = (pHour >= 21 || pHour < 6);
                const isGolden = (pHour >= 17 && pHour < 21);

                // Lumière & ciel synchronisés avec la sauvegarde ou le bouton Ambiance (zéro ombre solaire la nuit!)
                let zenHex = '#2e63a8', horHex = '#c4dff5', sunColHex = '#fff8e6', farHex = '#8ea9c7', sunHex = '#fff5e4';
                let sunInt = 1.65, bounceInt = 4.6, hemiInt = 0.98, nightF = 0.0, cityGlow = 0.12, sunY = 0.68;
                if (isNight) {
                    zenHex = '#0c162e'; horHex = '#233354'; sunColHex = '#d4e4ff'; farHex = '#1f2d4a'; sunHex = '#a8c4ff';
                    sunInt = 0.24; bounceInt = 3.2; hemiInt = 0.86; nightF = 1.0; cityGlow = 1.35; sunY = 0.72;
                } else if (isGolden) {
                    zenHex = '#2c3563'; horHex = '#eb956a'; sunColHex = '#ffc48a'; farHex = '#75667a'; sunHex = '#ffae73';
                    sunInt = 1.32; bounceInt = 3.8; hemiInt = 0.84; nightF = 0.35; cityGlow = 0.68; sunY = 0.38;
                }
                if (pRain > 0.3) {
                    zenHex = isNight ? '#0a0f1c' : '#3a4659';
                    horHex = isNight ? '#1b2232' : '#7b8799';
                    sunInt *= 0.48; bounceInt *= 0.68;
                }

                if (window.exteriorSkyUniforms) {
                    const u = window.exteriorSkyUniforms;
                    u.uTime.value = time;
                    u.uZenithColor.value.lerp(window._cZen ? window._cZen.set(zenHex) : (window._cZen = new THREE.Color(zenHex)), 0.08);
                    u.uHorizonColor.value.lerp(window._cHor ? window._cHor.set(horHex) : (window._cHor = new THREE.Color(horHex)), 0.08);
                    u.uSunColor.value.lerp(window._cSun ? window._cSun.set(sunColHex) : (window._cSun = new THREE.Color(sunColHex)), 0.08);
                    u.uNight.value += (nightF - u.uNight.value) * 0.08;
                    u.uSunPos.value.y += (sunY - u.uSunPos.value.y) * 0.08;
                    u.uStorm.value += (pRain - u.uStorm.value) * 0.06;
                }
                if (window.farCitySilhouetteMat) {
                    window.farCitySilhouetteMat.color.lerp(window._cFar ? window._cFar.set(farHex) : (window._cFar = new THREE.Color(farHex)), 0.08);
                }
                if (window.cityBuildingMats) {
                    for (let i = 0; i < window.cityBuildingMats.length; i++) {
                        window.cityBuildingMats[i].emissiveIntensity += (cityGlow - window.cityBuildingMats[i].emissiveIntensity) * 0.08;
                    }
                }
                if (typeof dirLight !== 'undefined') {
                    dirLight.color.set(sunHex);
                    dirLight.intensity += (sunInt - dirLight.intensity) * 0.08;
                    if (pHour >= 6 && pHour <= 20) {
                        const df = (pHour - 6) / 14;
                        dirLight.position.set(7.8, 9.5 + Math.sin(df * Math.PI) * 3.5, 2.8 - df * 5.6);
                    } else {
                        dirLight.position.set(7.8, 10.5, 1.0);
                    }
                }
                if (window.windowBounceLight) window.windowBounceLight.intensity += (bounceInt - window.windowBounceLight.intensity) * 0.08;
                const loginTierMult = window.roomTierLightMult || 1.0;
                if (typeof hemiLight !== 'undefined') hemiLight.intensity += (hemiInt * loginTierMult - hemiLight.intensity) * 0.08;
                if (window.currentRoomVisualTier === 1 && window.tier1NeonMat) {
                    const fl = (Math.sin(time * 29.0) * Math.sin(time * 7.3) > 0.92) ? 0.62 : 1.48;
                    window.tier1NeonMat.emissiveIntensity = fl;
                }
                if (window.bedsideLight) window.bedsideLight.intensity += ((isNight ? 7.2 : 0.65) - window.bedsideLight.intensity) * 0.08;
                if (window.deskHaloLight) window.deskHaloLight.intensity += ((isNight ? 4.4 : 0.9) - window.deskHaloLight.intensity) * 0.08;
                if (window.windowRainUniforms) {
                    window.windowRainUniforms.uTime.value = time * 1.1;
                    window.windowRainUniforms.uRainIntensity.value += (pRain - window.windowRainUniforms.uRainIntensity.value) * 0.06;
                }
                if (window.sunbeamMat) window.sunbeamMat.opacity = (isNight || pRain > 0.3) ? 0.015 : 0.085;
                if (typeof window.updateLivePcScreen === 'function') window.updateLivePcScreen(time);
                if (typeof window.updateWallClock3D === 'function') window.updateWallClock3D(window._loginPreviewClockStr);
                if (window.coffeeSteamPuffs) {
                    window.coffeeSteamPuffs.forEach(sp => {
                        sp.userData.phase = (sp.userData.phase + 0.0045) % 1.0;
                        const p = sp.userData.phase;
                        sp.position.set(-1.55 + Math.sin(time * 1.2 + p * 6.28) * 0.022 * p, 0.90 + p * 0.32, 0.48 + Math.cos(time * 1.0 + p * 4.0) * 0.016 * p);
                        const sc = 0.07 + p * 0.14;
                        sp.scale.set(sc, sc, 1);
                        sp.material.opacity = Math.sin(p * Math.PI) * 0.24;
                    });
                }
                if (window.curtainFolds) {
                    for (let i = 0; i < window.curtainFolds.length; i++) {
                        const cf = window.curtainFolds[i];
                        if (cf && cf.userData) cf.position.x = cf.userData.baseX + Math.sin(time * 0.7 + cf.userData.phase) * 0.008;
                    }
                }
                if (window.plantLeaves) {
                    for (let i = 0; i < window.plantLeaves.length; i++) {
                        const lf = window.plantLeaves[i];
                        if (lf && lf.userData) lf.rotation.x = lf.userData.baseRx + Math.sin(time * 0.9 + lf.userData.phase) * 0.022;
                    }
                }
                // Porte fermée proprement en login (le rai de lumière n'apparaît que lors d'une vraie sortie)
                if (window.doorPivot) {
                    window.doorPivot.rotation.y += (0 - window.doorPivot.rotation.y) * 0.08;
                    if (window.doorLightRayMat) window.doorLightRayMat.opacity = 0;
                }

                // Caméra cinématique lente + micro-parallaxe souris cadrant le studio (bureau + lit + baie vitrée à droite du panneau)
                window._loginMouseSmoothX = (window._loginMouseSmoothX || 0) + ((window._loginMouseX || 0) - (window._loginMouseSmoothX || 0)) * 0.04;
                window._loginMouseSmoothY = (window._loginMouseSmoothY || 0) + ((window._loginMouseY || 0) - (window._loginMouseSmoothY || 0)) * 0.04;

                if (window.activeStudioLocation === 'pro_studio') {
                    if (typeof window.updateProStudioAnim === 'function') window.updateProStudioAnim(time);
                    if (typeof ceilingLight !== 'undefined') ceilingLight.intensity += (0 - ceilingLight.intensity) * 0.12;
                    const camX = -1.55 + Math.sin(time * 0.09) * 0.45;
                    const camY = 1.92 + Math.cos(time * 0.08) * 0.06 - window._loginMouseSmoothY * 0.10;
                    const camZ = 1.45 + Math.cos(time * 0.10) * 0.42 - window._loginMouseSmoothX * 0.28;
                    camera.position.set(camX, camY, camZ);
                    camera.fov = 64;
                    camera.updateProjectionMatrix();
                    camera.lookAt(4.2, 1.05 - window._loginMouseSmoothY * 0.10, -0.35 - window._loginMouseSmoothX * 0.25);
                } else {
                    const camX = 1.65 + Math.sin(time * 0.12) * 0.40 + window._loginMouseSmoothX * 0.20;
                    const camY = 1.48 + Math.cos(time * 0.09) * 0.04 - window._loginMouseSmoothY * 0.08;
                    const camZ = 2.65 + Math.cos(time * 0.11) * 0.18;
                    camera.position.set(camX, camY, camZ);
                    camera.fov = 60;
                    camera.updateProjectionMatrix();
                    camera.lookAt(-0.95 + window._loginMouseSmoothX * 0.22, 0.78 - window._loginMouseSmoothY * 0.10, -2.85);
                }
                camera.rotation.order = 'YXZ';
                window._loginCamPos = camera.position.clone();
                window._loginCamYaw = camera.rotation.y;
                window._loginCamPitch = camera.rotation.x;

                renderer.toneMappingExposure += ((isNight ? 1.18 : 1.10) - renderer.toneMappingExposure) * 0.05;
            } catch(e) { console.warn('Login preview tick:', e); }
            renderer.render(scene, camera);
            return;
        }

        // Correctif 2 : On ne rend rien tant que les shaders ne sont pas compilés
        if (!isSceneReady) return;

        // Optimisé : maintien des 60 FPS fluides sans saut artificiel de frame

        // Reprise de ta variable time locale
        time += 0.02;

        if (window.activeMysticMaterials) {
            window.activeMysticMaterials.forEach(mat => {
                if (mat.uniforms) {
                    if (mat.uniforms.time) mat.uniforms.time.value = time;
                    if (mat.uniforms.opacity) {
                        const targetOp = mat.userData && mat.userData.targetOpacity !== undefined ? mat.userData.targetOpacity : 0.9;
                        mat.uniforms.opacity.value += (targetOp - mat.uniforms.opacity.value) * 0.15;
                    }
                }
            });
        }

        // --- OPTIMISATION : CACHE MÉMOIRE POUR ÉVITER LE GARBAGE COLLECTION ---
        window._v2a = window._v2a || new THREE.Vector2();
        window._v2b = window._v2b || new THREE.Vector2();
        window._v3a = window._v3a || new THREE.Vector3();
        window._v3b = window._v3b || new THREE.Vector3();
        window._v3c = window._v3c || new THREE.Vector3();
        window._v3finalCam = window._v3finalCam || new THREE.Vector3();
        window._v3finalLook = window._v3finalLook || new THREE.Vector3();
        window._v3startPos = window._v3startPos || new THREE.Vector3();
        window._v3startLook = window._v3startLook || new THREE.Vector3();
        window._v3lerpTarget = window._v3lerpTarget || new THREE.Vector3();

        // --- SÉCURITÉ DE L'ÉTAT DU JEU (Évite l'écran noir dû aux NaN) ---
        const currentState = typeof state !== 'undefined' && state ? state : { isSitting: false, isSleeping: false, isEventActive: false };
        const safeEnergy = (typeof currentState.energy === 'number' && !isNaN(currentState.energy)) ? currentState.energy : 100;

        // --- ANIMATION DES LEDS DU RACK ---
        if (typeof rackLeds !== 'undefined' && Array.isArray(rackLeds)) {
            rackLeds.forEach(led => {
                if (!led || !led.material) return;
                if (Math.random() < 0.02) {
                    led.material.emissiveIntensity = 0.1;
                } else {
                    led.material.emissiveIntensity += (1.0 - led.material.emissiveIntensity) * 0.1;
                }
            });
        }

        // --- INDICATEUR VISUEL D'ACHAT (Pulsation pour les objets non possédés achetables, cadencé à 15 Hz en Chambre uniquement) ---
        try {
            if (window.activeStudioLocation !== 'pro_studio' && (frameCounter++ % 4) === 0 && typeof state !== 'undefined' && state && typeof FURNITURE_CATALOG !== 'undefined' && Array.isArray(FURNITURE_CATALOG)) {
                const pulsationTime = Date.now() * 0.002;
                FURNITURE_CATALOG.forEach(item => {
                    const obj = getFurniture3DObject(item.sceneObject);
                    if (obj && obj.visible) {
                        const isOwned = state.ownedFurniture && state.ownedFurniture.includes(item.id);
                        if (!isOwned) {
                            const scaledPrice = typeof getScaledPrice === 'function' ? getScaledPrice(item.price) : item.price;
                            const canAfford = state.money >= scaledPrice && state.rep >= (item.reqRep || 0) && state.followers >= (item.reqFollowers || 0);

                            obj.traverse(child => {
                                if (child.isMesh && child.material) {
                                    const mats = Array.isArray(child.material) ? child.material : [child.material];
                                    mats.forEach(mat => {
                                        if (canAfford) {
                                            if (mat.emissive !== undefined) {
                                                mat.emissive.setHex(0x10b981);
                                            }
                                            if (mat.emissiveIntensity !== undefined) {
                                                mat.emissiveIntensity = 0.2 + Math.sin(pulsationTime) * 0.12;
                                            }
                                            if (mat.uniforms && mat.uniforms.glowColor && mat.uniforms.glowColor.value) {
                                                mat.uniforms.glowColor.value.setHex(0x34d399);
                                                if (mat.uniforms.baseColor && mat.uniforms.baseColor.value) mat.uniforms.baseColor.value.setHex(0x0f5c45);
                                            }
                                            if (child.userData.holoEdges && child.userData.holoEdges.material) {
                                                child.userData.holoEdges.material.color.setHex(0x34d399);
                                                child.userData.holoEdges.material.opacity = 0.44 + Math.sin(pulsationTime * 1.8) * 0.12;
                                            }
                                        } else {
                                            if (mat.emissiveIntensity !== undefined) {
                                                mat.emissiveIntensity = 0;
                                            }
                                            if (mat.uniforms && mat.uniforms.glowColor && mat.uniforms.glowColor.value) {
                                                mat.uniforms.glowColor.value.setHex(0x5ec8e5);
                                                if (mat.uniforms.baseColor && mat.uniforms.baseColor.value) mat.uniforms.baseColor.value.setHex(0x1d5c78);
                                            }
                                            if (child.userData.holoEdges && child.userData.holoEdges.material) {
                                                child.userData.holoEdges.material.color.setHex(0x5ec8e5);
                                                child.userData.holoEdges.material.opacity = 0.38;
                                            }
                                        }
                                    });
                                }
                            });
                        }
                    }
                });
            }
        } catch (e) {
            console.warn("Erreur scintillement", e);
        }

        let isMoving = false; 
        let isNearSomething = false; 

        // Vérification de l'avatar principal
        if (currentRoomAvatar) {
            
            // --- JOYSTICK LOGIC (DYNAMIC BRAWL STARS STYLE) ---
            if (isJoystickActive && joystickUI && joystickKnob) {
                const dx = (window.lastPointerX || 0) - joystickStartX;
                const dy = (window.lastPointerY || 0) - joystickStartY;
                const dist = Math.sqrt(dx * dx + dy * dy);

                // NOUVEAU: Filtrage du Jitter. Tolérance > 10px pour ne pas fermer le tooltip accidentellement sur un simple tap.
                if (dist > 10) {
                    if (typeof hideBuyTooltip === 'function') hideBuyTooltip();
                }
                
                // 3. Dynamic scale based on camera zoom (Smaller when zoomed in)
                const currentZoom = window.targetCamZoom || 1.0;
                const joyScale = Math.min(1.0, 1.0 / Math.sqrt(currentZoom));
                joystickUI.style.transform = `translate(-50%, -50%) scale(${joyScale})`;

                const maxRadius = 40; // Max movement radius for the knob

                // 2. Constraint: The base slides to follow but stays within 20% of its size from anchor
                if (dist > maxRadius) {
                    const angle = Math.atan2(dy, dx);
                    let targetBaseX = window.lastPointerX - Math.cos(angle) * maxRadius;
                    let targetBaseY = window.lastPointerY - Math.sin(angle) * maxRadius;

                    // Bridage de la base à 20px (20% de 100px) du point de départ
                    const maxBaseShift = 20; 
                    const sDx = targetBaseX - joystickAnchorX;
                    const sDy = targetBaseY - joystickAnchorY;
                    const sDist = Math.sqrt(sDx * sDx + sDy * sDy);

                    if (sDist > maxBaseShift) {
                        const sAngle = Math.atan2(sDy, sDx);
                        joystickStartX = joystickAnchorX + Math.cos(sAngle) * maxBaseShift;
                        joystickStartY = joystickAnchorY + Math.sin(sAngle) * maxBaseShift;
                    } else {
                        joystickStartX = targetBaseX;
                        joystickStartY = targetBaseY;
                    }

                    joystickUI.style.left = `${joystickStartX}px`;
                    joystickUI.style.top = `${joystickStartY}px`;
                }

                // Recalcul du déplacement visuel après le potentiel glissement de la base
                const finalDx = (window.lastPointerX || 0) - joystickStartX;
                const finalDy = (window.lastPointerY || 0) - joystickStartY;
                const finalDist = Math.sqrt(finalDx * finalDx + finalDy * finalDy);
                const angle = Math.atan2(finalDy, finalDx);
                
                const clampedDist = Math.min(finalDist, maxRadius);
                const vx = Math.cos(angle) * clampedDist;
                const vy = Math.sin(angle) * clampedDist;
                joystickKnob.style.transform = `translate(${vx}px, ${vy}px)`;

                // Mise à jour du vecteur de mouvement normalisé (0 à 1)
                const factor = clampedDist / maxRadius;
                window.joystickVec.x = Math.cos(angle) * factor;
                window.joystickVec.z = Math.sin(angle) * factor;
            }
            
            // ==========================================
            // --- LOGIQUE DE LA TÉLÉVISION (LO-FI VISUALIZER) & ÉCRAN PC VIVANT ---
            // ==========================================
            if (typeof window.updateLivePcScreen === 'function') {
                window.updateLivePcScreen(time);
            }
            if (window.tvScreenMat && window.tvLight) {
                const isLampOn = window.pixarLamp && window.pixarLamp.userData && window.pixarLamp.userData.isOn;
                const isSitting = currentState.isSitting;
                const hasTv = state && state.ownedFurniture && state.ownedFurniture.includes('tv');

                if (hasTv && (isSitting || isLampOn)) {
                    if (typeof window.updateLiveTvScreen === 'function') window.updateLiveTvScreen(time);
                    const flicker = 0.88 + Math.sin(time * 7.0) * 0.1;
                    window.tvScreenMat.emissive.setHex(0xffffff);
                    window.tvScreenMat.emissiveIntensity = isSitting ? 1.15 * flicker : 0.75 * flicker;
                    window.tvLight.intensity = (isSitting ? 4.2 : 2.2) * flicker;
                } else {
                    window.tvScreenMat.emissive.setHex(0x000000);
                    window.tvScreenMat.emissiveIntensity = 0;
                    window.tvLight.intensity = 0;
                }
            }
            
            // ==========================================
            // --- 1A. GESTION DU CLAVIER / JOYSTICK ---
            // ==========================================
            window.velX = window.velX || 0;
            window.velZ = window.velZ || 0;
            
            let targetDirX = 0;
            let targetDirZ = 0;

            // Capture de la position initiale pour détecter le mouvement réel (isMoving)
            const prevX = currentRoomAvatar.position.x;
            const prevZ = currentRoomAvatar.position.z;

            if (!currentState.isSleeping && !currentState.isEventActive && !currentState.isSitting) {
                 let moveX = 0;
                 let moveY = 0;

                if (isJoystickActive) { // Joystick is active (mobile touch)
                    moveX = window.joystickVec.x;
                    moveY = window.joystickVec.z;
                } else { // Keyboard input (desktop, or mobile without active joystick)
                    if (window.kbdState.up)    moveY -= 1;
                    if (window.kbdState.down)  moveY += 1;
                    if (window.kbdState.left)  moveX -= 1;
                    if (window.kbdState.right) moveX += 1;
                }

                if ((moveX !== 0 || moveY !== 0) && !(window.fps && window.fps.transition && window.fps.transition.lockMovement)) {
                    // Projection FPS Première Personne (Relative au regard camera fps.yaw)
                    const yaw = window.fps ? window.fps.yaw : 0;
                    const fwdX = -Math.sin(yaw);
                    const fwdZ = -Math.cos(yaw);
                    const rightX = Math.cos(yaw);
                    const rightZ = -Math.sin(yaw);

                    // moveY = -1 pour avancer (Z/W/Up), +1 pour reculer (S/Down)
                    const forwardInput = -moveY;
                    const strafeInput = moveX;

                    targetDirX = fwdX * forwardInput + rightX * strafeInput;
                    targetDirZ = fwdZ * forwardInput + rightZ * strafeInput;

                    const inputMag = Math.min(1.0, Math.sqrt(moveX * moveX + moveY * moveY));
                    const projectedMag = Math.sqrt(targetDirX * targetDirX + targetDirZ * targetDirZ) || 1;
                    targetDirX = (targetDirX / projectedMag) * inputMag;
                    targetDirZ = (targetDirZ / projectedMag) * inputMag;

                    targetPosition = null;
                }
            }

            const acceleration = 0.15; 
            window.velX += (targetDirX - window.velX) * acceleration;
            window.velZ += (targetDirZ - window.velZ) * acceleration;

            // Utilisation de safeEnergy pour empêcher l'infection NaN
            const energySpeedMult = 0.7 + (Math.max(0, safeEnergy) / 100) * 0.3;
            const mobileSpeedMult = ((typeof isMobile !== 'undefined' && isMobile) || window.innerWidth <= 768) ? 1.8 : 1.0;
            const maxSpeed = 0.058 * energySpeedMult * (isMobile ? 1.15 : 1.0);
            
            if (Math.abs(window.velX) > 0.005 || Math.abs(window.velZ) > 0.005) {
                if (typeof targetPosition !== 'undefined' && targetPosition) targetPosition = null; // Clear mouse target if moving by keyboard/joystick

                const nextX = currentRoomAvatar.position.x + (window.velX * maxSpeed);
                const nextZ = currentRoomAvatar.position.z + (window.velZ * maxSpeed);

                const targetYaw = Math.atan2(window.velX, window.velZ);
                const currentYaw = currentRoomAvatar.rotation.y;
                
                if (typeof normalizeAngle === 'function') {
                    currentRoomAvatar.rotation.y = currentYaw + normalizeAngle(targetYaw - currentYaw) * 0.15;
                }

                let displacementX = 0;
                let displacementZ = 0;
                const canCheckCollision = typeof checkCollision === 'function';
                // Anti-blocage : si la position actuelle est déjà dans une zone de collision, on autorise la sortie libre!
                const alreadyStuck = canCheckCollision && checkCollision(currentRoomAvatar.position.x, currentRoomAvatar.position.z);

                if (!canCheckCollision || alreadyStuck || !checkCollision(nextX, currentRoomAvatar.position.z)) {
                    displacementX = nextX - currentRoomAvatar.position.x;
                    currentRoomAvatar.position.x = nextX;
                } else {
                    window.velX = 0; 
                }
                
                if (!canCheckCollision || alreadyStuck || !checkCollision(currentRoomAvatar.position.x, nextZ)) {
                    displacementZ = nextZ - currentRoomAvatar.position.z;
                    currentRoomAvatar.position.z = nextZ;
                } else {
                    window.velZ = 0; 
                }

                isMoving = (Math.abs(currentRoomAvatar.position.x - prevX) > 0.001 || Math.abs(currentRoomAvatar.position.z - prevZ) > 0.001);
                
                // Si le déplacement est nul (collision), on stoppe l'élan pour couper l'animation et le son
                if (!isMoving) {
                    window.velX = 0;
                    window.velZ = 0;
                    if (typeof walkTime !== 'undefined') walkTime = 0; // Coupe la boucle de son
                }
            } else {
                window.velX = 0;
                window.velZ = 0;
            }

            // ==========================================
            // --- 1B. DÉPLACEMENT À LA SOURIS (Clic) ---
            // ==========================================
            // Only allow mouse-click movement if joystick is NOT active
            if (!isJoystickActive && typeof targetPosition !== 'undefined' && targetPosition && !currentState.isSleeping && !currentState.isSitting) {
                const currentFlatPos = window._v2a.set(currentRoomAvatar.position.x, currentRoomAvatar.position.z);
                const targetFlatPos = window._v2b.set(targetPosition.x, targetPosition.z);
                const distance = currentFlatPos.distanceTo(targetFlatPos);

                if (distance > 0.02) { 
                    if (typeof rotateAvatarToward === 'function') rotateAvatarToward(targetPosition, 0.12);

                    const baseSpeed = 0.03 * energySpeedMult * mobileSpeedMult;
                    const easing = Math.min(1, distance * 4); 
                    const currentSpeed = baseSpeed * easing;

                    const dir = window._v3a.subVectors(targetPosition, currentRoomAvatar.position).normalize();
                    const nextX = currentRoomAvatar.position.x + dir.x * currentSpeed;
                    const nextZ = currentRoomAvatar.position.z + dir.z * currentSpeed;

                    let moved = false;
                    const canCheckCollision = typeof checkCollision === 'function';
                    
                    if (!canCheckCollision || !checkCollision(nextX, currentRoomAvatar.position.z)) {
                        currentRoomAvatar.position.x = nextX;
                        moved = true;
                    }
                    if (!canCheckCollision || !checkCollision(currentRoomAvatar.position.x, nextZ)) {
                        currentRoomAvatar.position.z = nextZ;
                        moved = true;
                    }

                    if (!moved) {
                        targetPosition = null;
                    } else {
                        isMoving = true; 
                    }
                } else {
                    currentRoomAvatar.position.x = targetPosition.x;
                    currentRoomAvatar.position.z = targetPosition.z;
                    targetPosition = null;
                }
            }

            // --- 2. ANIMATION INTERNE (Mouvement et Fatigue) ---
            if (isMoving && typeof state !== 'undefined') {
                if (safeEnergy > 0) {
                    const oldEnergyFloor = Math.floor(safeEnergy);
                    state.energy = Math.max(0, safeEnergy - 0.004); 
                    if (Math.floor(state.energy) !== oldEnergyFloor && typeof updateHUD === 'function') {
                        updateHUD();
                    }
                }

                // --- PARTICULES DE SUEUR OPTIMISÉES (Pool de mémoire fixe) ---
                if (safeEnergy < 10 && Math.random() < 0.15) {
                    if (!window.fatigueParticles) window.fatigueParticles = [];
                    
                    if (!window._sweatMat) {
                        window._sweatMat = new THREE.MeshStandardMaterial({ 
                            color: '#38bdf8', transparent: true, opacity: 0.85, emissive: '#0ea5e9', emissiveIntensity: 0.6 
                        });
                        window._sweatTopGeo = new THREE.ConeGeometry(0.02, 0.05, 6);
                        window._sweatBotGeo = new THREE.SphereGeometry(0.02, 6, 6);
                    }
                    
                    if (window.fatigueParticles.length < 15) {
                        const sweatGroup = new THREE.Group();
                        const top = new THREE.Mesh(window._sweatTopGeo, window._sweatMat);
                        top.position.y = 0.025;
                        const bottom = new THREE.Mesh(window._sweatBotGeo, window._sweatMat);
                        sweatGroup.add(top, bottom);

                        sweatGroup.position.copy(currentRoomAvatar.position);
                        sweatGroup.position.y += 2.1;
                        sweatGroup.position.x += (Math.random() - 0.5) * 0.5;
                        sweatGroup.position.z += (Math.random() - 0.5) * 0.5;
                        
                        if (typeof scene !== 'undefined' && scene) scene.add(sweatGroup);

                        window.fatigueParticles.push({
                            mesh: sweatGroup, life: 1.0, decay: 0.018 + Math.random() * 0.01,
                            velY: -0.01, gravity: -0.003, wobbleSpeed: 5 + Math.random() * 5,
                            wobbleInt: 0.005 + Math.random() * 0.005, seed: Math.random() * 100
                        });
                    }
                }
            }

            // --- ANIMATION INTERNE (MARCHE DU MODÈLE) ---
            if (!currentState.isSleeping && !currentState.isSitting) {
                const innerModel = currentRoomAvatar.getObjectByName("AvatarVisual");
                if (innerModel) {
                    const legL = innerModel.getObjectByName("Leg_L");
                    const legR = innerModel.getObjectByName("Leg_R");
                    const now = performance.now();

                    // On s'assure que les variables de temps existent
                    if (typeof walkTime === 'undefined') window.walkTime = 0;
                    if (typeof stoppedMovingAt === 'undefined') window.stoppedMovingAt = 0;
                    if (typeof wasMovingLastFrame === 'undefined') window.wasMovingLastFrame = false;

                    if (isMoving) {
                        stoppedMovingAt = now;
                        wasMovingLastFrame = true;
                    } else if (typeof wasMovingLastFrame !== 'undefined' && wasMovingLastFrame) {
                        stoppedMovingAt = now;
                        wasMovingLastFrame = false;
                    }

                    const keepAnimatingAfterStop = !isMoving && (typeof stoppedMovingAt !== 'undefined') && (now - stoppedMovingAt < 1000);
                    // Si on force walkTime à 0 (mur), on annule le keepAnimatingAfterStop
                    if (isMoving || (keepAnimatingAfterStop && walkTime > 0)) {
                        const fade = isMoving ? 1 : Math.max(0, 1 - ((now - stoppedMovingAt) / 1000));
                        walkTime += isMoving ? (0.16 * energySpeedMult) : 0.05;

                        // --- SYSTÈME DE PAS SONORES ---
                        const currentSin = Math.sin(walkTime);
                        if (window._prevStepSin === undefined) window._prevStepSin = 0;
                        // On déclenche le son au moment de l'impact (changement de signe de la sinusoïde)
                        if (isMoving && Math.sign(currentSin) !== Math.sign(window._prevStepSin)) {
                            const pos = currentRoomAvatar.position;
                            
                            // --- LOGIQUE DE PANORAMIQUE SPATIALE & ALTERNÉE ---
                            if (window._stepSide === undefined) window._stepSide = 1;
                            
                            // 1. Panoramique basé sur la position dans la room (Axe horizontal écran = Z - X)
                            // On divise par 10 car la room fait 10 unités de large (de -5 à 5)
                            const spatialPan = (pos.z - pos.x) / 10;
                            
                            // 2. Ajout du petit décalage pour simuler l'écart entre les deux pieds
                            const footOffset = window._stepSide * 0.12;
                            const panVal = Math.max(-1, Math.min(1, spatialPan + footOffset));
                            
                            window._stepSide *= -1; // Alterne pour le prochain pas

                            // Détection de la surface (Tapis Central X: [-3.0, 2.0], Z: [-0.5, 3.5])
                            const isOnRug = (pos.x >= -3.0 && pos.x <= 2.0 && pos.z >= -0.5 && pos.z <= 3.5);

                            if (isOnRug) {
                                // Son sourd et étouffé pour le tapis (Basse fréquence)
                                playTone(65 + Math.random() * 10, 'sine', 0.05, 0.012, panVal);
                            } else {
                                // Son parquet standard
                                playTone(115 + Math.random() * 15, 'sine', 0.03, 0.008, panVal);
                            }
                        }
                        window._prevStepSin = currentSin;

                        innerModel.rotation.z = Math.sin(walkTime) * 0.012 * fade;
                        innerModel.position.y = Math.abs(Math.sin(walkTime)) * 0.012 * fade;
                        if (legL && legR) {
                            const legSwing = Math.sin(walkTime * 1.2) * 0.12 * fade;
                            legL.rotation.x = legSwing;
                            legR.rotation.x = -legSwing;
                        }
                    } else {
                        walkTime = 0;
                        innerModel.rotation.z *= 0.6;
                        innerModel.position.y += (0 - innerModel.position.y) * 0.25;
                        if (legL && legR) {
                            legL.rotation.x *= 0.6;
                            legR.rotation.x *= 0.6;
                        }
                    }
                }
            }

            // --- 4. ANIMATION DE SOMMEIL AGITÉ ---
            if (currentState.isSleeping) {
                const sleepVisual = currentRoomAvatar.getObjectByName("AvatarVisual");
                if (sleepVisual) {
                    const rOffsetX = typeof restlessTargetOffsetX !== 'undefined' ? restlessTargetOffsetX : 0;
                    const rOffsetY = typeof restlessTargetOffsetY !== 'undefined' ? restlessTargetOffsetY : 0;
                    const rOffsetZ = typeof restlessTargetOffsetZ !== 'undefined' ? restlessTargetOffsetZ : 0;
                    const rPosX = typeof restlessTargetPosX !== 'undefined' ? restlessTargetPosX : 0;
                    const rPosZ = typeof restlessTargetPosZ !== 'undefined' ? restlessTargetPosZ : 0;

                    sleepVisual.rotation.order = 'YXZ';
                    sleepVisual.rotation.y += (rOffsetY - sleepVisual.rotation.y) * 0.05; 
                    sleepVisual.rotation.x += (Math.PI / 2 + rOffsetX - sleepVisual.rotation.x) * 0.05; 
                    sleepVisual.rotation.z += (rOffsetZ - sleepVisual.rotation.z) * 0.05; 

                    sleepVisual.position.x += (rPosX - sleepVisual.position.x) * 0.05;
                    sleepVisual.position.z += (-0.25 + rPosZ - sleepVisual.position.z) * 0.05;
                }
            }

            // --- SUIVI DYNAMIQUE DE LA LAMPE PIXAR ---
            if (window.pixarLamp && window.pixarLamp.userData && window.pixarLamp.userData.isOn && typeof scene !== 'undefined') {
                const head = scene.getObjectByName("pixar_head_group");
                const spot = scene.getObjectByName("pixar_spotlight");

                if (head && spot && spot.target) {
                    spot.target.position.copy(currentRoomAvatar.position);
                    spot.target.position.y += 1.0; 
                    
                    const targetPos = window._v3b;
                    currentRoomAvatar.getWorldPosition(targetPos);
                    targetPos.y += 1.0; 
                    
                    if (head.parent) head.parent.worldToLocal(targetPos);

                    head.rotation.order = "YXZ"; 

                    const dx = targetPos.x - head.position.x;
                    const dy = targetPos.y - head.position.y;
                    const dz = targetPos.z - head.position.z;

                    head.rotation.y = Math.atan2(dx, dz);
                    
                    const distanceH = Math.sqrt(dx * dx + dz * dz);
                    head.rotation.x = Math.atan2(dy, distanceH); 
                }
            }
        
            // =========================================================
            // --- 5. CAMÉRA FIRST-PERSON POV, TRANSITIONS & CYCLE JOUR/NUIT ---
            // =========================================================
            if (typeof window.enforceFpsModalPriority === 'function') window.enforceFpsModalPriority();
            if (typeof camera !== 'undefined' && window.fps) {
                const fps = window.fps;

                // 5A. Synchronisation dynamique du Ciel GLSL, Brume Urbaine, Balises & Lumière Naturelle
                try {
                    const tMins = (typeof state !== 'undefined' && state && typeof state.timeMins === 'number') ? state.timeMins : 660;
                    const hour = (tMins % 1440) / 60;
                    const isLampDark = window.pixarLamp && window.pixarLamp.userData && window.pixarLamp.userData.isOn;

                    let zenHex = '#0c162e', horHex = '#233354', sunColHex = '#d4e4ff', farHex = '#1f2d4a';
                    let sunHex = '#a8c4ff', sunInt = 0.24, bounceHex = '#86a6eb', bounceInt = 3.35, hemiInt = 0.88;
                    let cityGlow = 1.35, nightFactor = 1.0, beamOp = 0.0, sunY = 0.72;

                    if (hour >= 6 && hour < 8.5) {
                        // Aube claire & dorée
                        zenHex = '#3a588a'; horHex = '#f5c299'; sunColHex = '#ffdca8'; farHex = '#9ba1b3';
                        sunHex = '#ffd2a1'; sunInt = 1.38; bounceHex = '#ffdfb8'; bounceInt = 4.2; hemiInt = 0.88;
                        cityGlow = 0.42; nightFactor = 0.12; beamOp = 0.0; sunY = 0.46;
                    } else if (hour >= 8.5 && hour < 17) {
                        // Journée lumineuse naturelle (ombres douces, zéro découpe dure)
                        zenHex = '#2e63a8'; horHex = '#c4dff5'; sunColHex = '#fff8e6'; farHex = '#8ea9c7';
                        sunHex = '#fff7ea'; sunInt = 1.68; bounceHex = '#e6f0ff'; bounceInt = 5.0; hemiInt = 1.02;
                        cityGlow = 0.08; nightFactor = 0.0; beamOp = 0.0; sunY = 0.70;
                    } else if (hour >= 17 && hour < 20.5) {
                        // Golden Hour / Coucher de soleil cinématique
                        zenHex = '#2c3563'; horHex = '#eb956a'; sunColHex = '#ffc48a'; farHex = '#75667a';
                        sunHex = '#ffae73'; sunInt = 1.30; bounceHex = '#ffc194'; bounceInt = 3.8; hemiInt = 0.82;
                        cityGlow = 0.65; nightFactor = 0.35; beamOp = 0.0; sunY = 0.38;
                    }

                    // --- COURSE DOUCE ET LOGIQUE DU SOLEIL (Ombres courtes et douces au sol depuis la baie Est-Haut) ---
                    if (hour >= 6 && hour <= 20) {
                        const dayFrac = (hour - 6) / 14; // 0 = 06h00, 0.5 = 13h00, 1 = 20h00
                        const sunElevY = 9.5 + Math.sin(dayFrac * Math.PI) * 3.5;
                        const sunAzZ = 2.8 - dayFrac * 5.6;
                        dirLight.position.set(7.8, sunElevY, sunAzZ);
                    } else {
                        dirLight.position.set(7.8, 10.5, 1.0);
                    }

                    // --- ADAPTATION AUTOMATIQUE DE L'ŒIL (EYE ADAPTATION) ---
                    if (typeof renderer !== 'undefined' && camera) {
                        const lookDir = window._v3a;
                        camera.getWorldDirection(lookDir);
                        // Regard vers la baie vitrée Est (+X)
                        const lookEast = Math.max(-1, Math.min(1, lookDir.x));
                        const daylightAmt = (1.0 - nightFactor) * (isLampDark ? 0.15 : 1.0);
                        // Quand on fixe la fenêtre en plein jour -> exposition serrée (0.97) ; vers l'intérieur / nuit -> bien éclairée
                        const targetExp = 1.16 - (lookEast * 0.17 * daylightAmt) + (nightFactor * 0.14);
                        renderer.toneMappingExposure += (targetExp - renderer.toneMappingExposure) * 0.04;
                    }

                    // --- HORLOGE MURALE NIXIE 3D + LÉGÈRE BRISE RIDEAUX & PLANTE ---
                    if (typeof window.updateWallClock3D === 'function') window.updateWallClock3D();
                    if (window.curtainFolds) {
                        for (let i = 0; i < window.curtainFolds.length; i++) {
                            const cf = window.curtainFolds[i];
                            cf.position.x = cf.userData.baseX + Math.sin(time * 0.85 + cf.userData.phase) * 0.008;
                        }
                    }
                    if (window.plantLeaves) {
                        for (let i = 0; i < window.plantLeaves.length; i++) {
                            const lf = window.plantLeaves[i];
                            lf.rotation.x = lf.userData.baseRx + Math.sin(time * 0.9 + lf.userData.phase) * 0.025;
                        }
                    }

                    if (window.exteriorSkyUniforms) {
                        const u = window.exteriorSkyUniforms;
                        u.uTime.value = time;
                        u.uZenithColor.value.lerp(window._cZen ? window._cZen.set(zenHex) : (window._cZen = new THREE.Color(zenHex)), 0.04);
                        u.uHorizonColor.value.lerp(window._cHor ? window._cHor.set(horHex) : (window._cHor = new THREE.Color(horHex)), 0.04);
                        u.uSunColor.value.lerp(window._cSun ? window._cSun.set(sunColHex) : (window._cSun = new THREE.Color(sunColHex)), 0.04);
                        u.uNight.value += (nightFactor - u.uNight.value) * 0.04;
                        u.uSunPos.value.y += (sunY - u.uSunPos.value.y) * 0.04;
                    }
                    if (window.farCitySilhouetteMat) {
                        window.farCitySilhouetteMat.color.lerp(window._cFar ? window._cFar.set(farHex) : (window._cFar = new THREE.Color(farHex)), 0.04);
                    }
                    if (window.cityBuildingMats) {
                        for (let i = 0; i < window.cityBuildingMats.length; i++) {
                            window.cityBuildingMats[i].emissiveIntensity += (cityGlow - window.cityBuildingMats[i].emissiveIntensity) * 0.04;
                        }
                    }
                    if (window.cityBeacons) {
                        const pulse = (Math.sin(time * 2.2) > 0.25) ? 1.0 : 0.15;
                        for (let i = 0; i < window.cityBeacons.length; i++) {
                            window.cityBeacons[i].material.color.setRGB(pulse, 0.12 * pulse, 0.1 * pulse);
                        }
                    }
                    if (window.sunbeamMat) {
                        window.sunbeamMat.opacity += ((isLampDark ? 0.015 : beamOp) - window.sunbeamMat.opacity) * 0.04;
                        window.sunbeamMat.color.lerp(window._cBm ? window._cBm.set(sunHex) : (window._cBm = new THREE.Color(sunHex)), 0.04);
                    }
                    // --- MÉTÉO PLUIE SUR LA VITRE & ÉCLAIRS LOINTAINS (Inspi basse < 42% ou soir pluvieux) ---
                    const inspiNow = (typeof state !== 'undefined' && state && typeof state.inspi === 'number') ? state.inspi : 100;
                    const dayNum = (typeof state !== 'undefined' && state && typeof state.day === 'number') ? state.day : 1;
                    const isRainy = (inspiNow < 42) || ((hour >= 21 || hour < 5) && (dayNum % 2 === 0));
                    const targetRain = isRainy ? (inspiNow < 25 ? 1.0 : 0.72) : 0.0;

                    if (window.windowRainUniforms) {
                        window.windowRainUniforms.uTime.value = time;
                        window.windowRainUniforms.uRainIntensity.value += (targetRain - window.windowRainUniforms.uRainIntensity.value) * 0.03;
                    }
                    // Rares éclairs lointains sur la skyline par temps d'orage
                    window._lightningFlash = window._lightningFlash || 0;
                    if (targetRain > 0.5 && Math.random() < 0.0022 && window._lightningFlash < 0.05) {
                        window._lightningFlash = 1.0;
                    }
                    window._lightningFlash *= 0.84;
                    if (window.exteriorSkyUniforms) {
                        window.exteriorSkyUniforms.uStorm.value += (targetRain - window.exteriorSkyUniforms.uStorm.value) * 0.025;
                        window.exteriorSkyUniforms.uLightning.value = window._lightningFlash;
                    }
                    if (window.windowRainUniforms) {
                        window.windowRainUniforms.uLightning.value = window._lightningFlash;
                    }

                    // --- AMBIANCE « SESSION NOCTURNE » AUTOMATIQUE (20h30 -> 06h00) : BIEN ÉCLAIRÉE & CHALEUREUSE ---
                    const isNightSession = (hour >= 20.5 || hour < 6.0);
                    if (window.bedsideLight && window.bedsideShadeMat) {
                        const targetBedInt = isNightSession ? 8.5 : 0.65;
                        window.bedsideLight.intensity += (targetBedInt - window.bedsideLight.intensity) * 0.04;
                        window.bedsideShadeMat.emissiveIntensity += ((isNightSession ? 2.4 : 0.45) - window.bedsideShadeMat.emissiveIntensity) * 0.04;
                    }
                    if (window.deskBiasLight) {
                        const targetBias = isNightSession ? 9.2 : 2.8;
                        window.deskBiasLight.intensity += (targetBias - window.deskBiasLight.intensity) * 0.04;
                    }
                    if (window.deskHaloLight) {
                        const targetHalo = isNightSession ? 4.4 : 0.9;
                        window.deskHaloLight.intensity += (targetHalo - window.deskHaloLight.intensity) * 0.04;
                    }
                    if (window.sconceGlowMat) {
                        window.sconceGlowMat.emissiveIntensity += ((isNightSession ? 3.2 : 0.9) - window.sconceGlowMat.emissiveIntensity) * 0.04;
                    }

                    // Boost dynamique de l'éclairage Studio Pro 42e la nuit (toujours lisible & lumineux)
                    const psNightBoost = 1.0 + nightFactor * 0.78;
                    if (window._psPodiumKeyLight) window._psPodiumKeyLight.intensity += ((5.4 * psNightBoost) - window._psPodiumKeyLight.intensity) * 0.05;
                    if (window._psLiveRoomLight) window._psLiveRoomLight.intensity += ((4.6 * psNightBoost) - window._psLiveRoomLight.intensity) * 0.05;
                    if (window._psVipBarLight) window._psVipBarLight.intensity += ((4.4 * psNightBoost) - window._psVipBarLight.intensity) * 0.05;
                    if (window._psStudioOverheadFill) window._psStudioOverheadFill.intensity += ((5.2 * psNightBoost) - window._psStudioOverheadFill.intensity) * 0.05;

                    if (!isLampDark) {
                        const stormDim = isNightSession ? (1.0 - targetRain * 0.12) : (1.0 - targetRain * 0.35);
                        const isProLoc = (window.activeStudioLocation === 'pro_studio');
                        const nightCeil = isProLoc ? 0 : (isNightSession ? 38 : 42);
                        dirLight.color.lerp(window._tmpSunCol ? window._tmpSunCol.set(sunHex) : (window._tmpSunCol = new THREE.Color(sunHex)), 0.04);
                        dirLight.intensity += (((isProLoc ? sunInt * 0.75 : sunInt) * stormDim + window._lightningFlash * 2.2) - dirLight.intensity) * 0.06;
                        const tMult = isNightSession ? Math.max(0.95, window.roomTierLightMult || 1.0) : (window.roomTierLightMult || 1.0);
                        const effectiveHemi = isProLoc ? Math.max(hemiInt, 0.98) : hemiInt;
                        hemiLight.intensity += ((effectiveHemi * stormDim * tMult) - hemiLight.intensity) * 0.05;
                        ceilingLight.intensity += (nightCeil - ceilingLight.intensity) * 0.06;
                        if (window.windowBounceLight) {
                            window.windowBounceLight.color.lerp(window._tmpBncCol ? window._tmpBncCol.set(bounceHex) : (window._tmpBncCol = new THREE.Color(bounceHex)), 0.04);
                            window.windowBounceLight.intensity += ((bounceInt * stormDim + window._lightningFlash * 4.5) - window.windowBounceLight.intensity) * 0.06;
                        }
                        if (window.ceilingFixtureMat) {
                            let fixInt = isNightSession ? 1.65 : 1.9;
                            if (window.currentRoomVisualTier === 1) {
                                fixInt = (Math.sin(time * 31.0) * Math.sin(time * 6.7) > 0.93) ? 0.85 : 1.65;
                            }
                            window.ceilingFixtureMat.emissiveIntensity = fixInt;
                        }
                    } else {
                        if (window.windowBounceLight) window.windowBounceLight.intensity += ((1.6 + window._lightningFlash * 3.0) - window.windowBounceLight.intensity) * 0.06;
                        if (window.ceilingFixtureMat) window.ceilingFixtureMat.emissiveIntensity = 0.25;
                    }

                    // --- VAPEUR CHAUDE AU-DESSUS DU MUG DE CAFÉ ---
                    if (window.coffeeSteamPuffs) {
                        window.coffeeSteamPuffs.forEach(sp => {
                            sp.userData.phase = (sp.userData.phase + 0.0055) % 1.0;
                            const p = sp.userData.phase;
                            sp.position.set(-1.55 + Math.sin(time * 1.4 + p * 6.28) * 0.025 * p, 0.90 + p * 0.34, 0.48 + Math.cos(time * 1.1 + p * 4.0) * 0.018 * p);
                            const sc = 0.07 + p * 0.15;
                            sp.scale.set(sc, sc, 1);
                            sp.material.opacity = Math.sin(p * Math.PI) * 0.26;
                        });
                    }

                    // --- SMARTPHONE 3D SUR LE BUREAU (NOTIF DM / BRAND DEAL) ---
                    if (window.deskPhoneGroup && window.deskPhoneScreenMat) {
                        const nowMs = performance.now();
                        const hasUnread = (typeof state !== 'undefined' && state && Array.isArray(state.dms) && state.dms.some(d => !d.resolved));
                        const isAlerting = (nowMs < (window.deskPhoneAlertUntil || 0)) || hasUnread;
                        if (isAlerting) {
                            const pulse = 0.65 + 0.35 * Math.sin(time * 4.5);
                            window.deskPhoneScreenMat.emissiveIntensity = pulse * 1.4;
                            if (nowMs < (window.deskPhoneAlertUntil || 0)) {
                                window.deskPhoneGroup.rotation.y = -0.32 + Math.sin(time * 28.0) * 0.035;
                            } else {
                                window.deskPhoneGroup.rotation.y = -0.32;
                            }
                        } else {
                            window.deskPhoneScreenMat.emissiveIntensity += (0.04 - window.deskPhoneScreenMat.emissiveIntensity) * 0.08;
                            window.deskPhoneGroup.rotation.y = -0.32;
                        }
                    }

                    // --- AVIONS LOINTAINS DANS LE CIEL ---
                    if (window.cityPlanes) {
                        window.cityPlanes.forEach(pl => {
                            pl.position.z += pl.userData.speed;
                            if (pl.position.z > 50) pl.position.z = -48;
                            if (pl.position.z < -50) pl.position.z = 48;
                            pl.visible = (nightFactor > 0.25);
                        });
                    }

                    // --- ANIMATIONS DES OBJETS INTERACTIFS DU BUREAU ---
                    if (window.deskInterfaceState) {
                        const ifs = window.deskInterfaceState;
                        ifs.currentAngle += (ifs.targetAngle - ifs.currentAngle) * 0.16;
                        if (ifs.knobPivot) ifs.knobPivot.rotation.z = -ifs.currentAngle;
                        if (window.ifaceMeterLeds) {
                            const lv = 1 + Math.floor((0.5 + 0.5 * Math.sin(time * 6.5) * Math.cos(time * 2.4)) * 4.9);
                            window.ifaceMeterLeds.forEach((led, idx) => { led.visible = idx < lv; });
                        }
                    }
                    if (window.deskMicState) {
                        const mc = window.deskMicState;
                        mc.currentYaw += (mc.targetYaw - mc.currentYaw) * 0.12;
                        if (mc.pivot) mc.pivot.rotation.y = mc.currentYaw;
                        if (mc.ledMat) {
                            const isHot = performance.now() < mc.activeUntil;
                            mc.ledMat.color.set(isHot ? '#f43f5e' : '#34d399');
                        }
                    }
                    if (window.deskMugState) {
                        const ms = window.deskMugState;
                        if (ms.sipAnim > 0.005) {
                            ms.sipAnim = Math.max(0, ms.sipAnim - 0.025);
                            const arc = Math.sin(ms.sipAnim * Math.PI);
                            ms.group.position.set(-1.55 + arc * 0.22, 0.83 + arc * 0.28, 0.48 + arc * 0.28);
                            ms.group.rotation.z = -arc * 0.45;
                        } else {
                            ms.group.position.set(-1.55, 0.83, 0.48);
                            ms.group.rotation.z = 0;
                        }
                        if (ms.coffeeTop) {
                            ms.coffeeTop.visible = ms.sipsLeft > 0;
                            ms.coffeeTop.position.y = 0.015 + (ms.sipsLeft / 3) * 0.043;
                        }
                    }

                    // --- ANIMATIONS LIVE DU STUDIO PRO 42E ÉTAGE (VU SSL, PLATINE, MODULAIRES, PORTE) ---
                    if (typeof window.updateProStudioAnim === 'function') window.updateProStudioAnim(time);
                    if (window.proStudioDoorPivot && typeof window._proDoorTarget === 'number') {
                        window.proStudioDoorPivot.rotation.y += (window._proDoorTarget - window.proStudioDoorPivot.rotation.y) * 0.14;
                    }
                    // --- MICRO-ANIMATION DE LA PORTE DU STUDIO ---
                    if (window.doorPivot && typeof window.doorTargetAngle === 'number') {
                        window.doorPivot.rotation.y += (window.doorTargetAngle - window.doorPivot.rotation.y) * 0.14;
                        if (window.doorLightRayMat) {
                            const openRatio = Math.min(1, Math.abs(window.doorPivot.rotation.y) / 0.42);
                            window.doorLightRayMat.opacity = openRatio * 0.72;
                        }
                    }
                } catch(e) {}

                // 5B. Transition Caméra POV Active (PC Dive, Synth Tilt, Sleep, Sit, Stand)
                if (fps.transition) {
                    const tr = fps.transition;
                    const elapsed = performance.now() - tr.startTime;
                    const rawT = Math.min(1, elapsed / tr.duration);
                    // Cubic ease-in-out
                    const ease = rawT < 0.5 ? 4 * rawT * rawT * rawT : 1 - Math.pow(-2 * rawT + 2, 3) / 2;

                    camera.position.lerpVectors(tr.fromPos, tr.toPos, ease);
                    const curYaw = tr.fromYaw + normalizeAngle(tr.toYaw - tr.fromYaw) * ease;
                    const curPitch = tr.fromPitch + (tr.toPitch - tr.fromPitch) * ease;
                    camera.rotation.set(curPitch, curYaw, 0, 'YXZ');

                    if (typeof tr.fromFov === 'number' && typeof tr.toFov === 'number') {
                        camera.fov = tr.fromFov + (tr.toFov - tr.fromFov) * ease;
                        camera.updateProjectionMatrix();
                    }

                    if (rawT >= 1) {
                        fps.yaw = tr.toYaw;
                        fps.pitch = tr.toPitch;
                        const doneCb = tr.onComplete;
                        fps.transition = null;
                        if (typeof doneCb === 'function') doneCb();
                    }
                } else if (window.isIntroAnimating) {
                    // Intro POV Cinéma : Glissement fluide depuis la caméra de l'écran titre jusqu'aux yeux FPS!
                    if (typeof window.introProgress === 'undefined') window.introProgress = 0;
                    window.introProgress += 0.015;
                    if (window.introProgress >= 1) {
                        window.introProgress = 1;
                        window.isIntroAnimating = false;
                        const lids = document.getElementById('fps-eyelids');
                        if (lids) lids.classList.remove('closed');
                    }
                    const t = window.introProgress;
                    // Courbe cinématique ease-in-out cubique
                    const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
                    const standY = currentRoomAvatar.position.y + 2.45;
                    const startPos = window._introFromPos || window._v3startPos.set(currentRoomAvatar.position.x, standY - 0.35, currentRoomAvatar.position.z);
                    const startYaw = (typeof window._introFromYaw === 'number') ? window._introFromYaw : fps.yaw;
                    const startPitch = (typeof window._introFromPitch === 'number') ? window._introFromPitch : -0.18;
                    const startFov = (typeof window._introFromFov === 'number') ? window._introFromFov : 60;
                    const targetFov = window.getBaseFpsFov ? window.getBaseFpsFov() : (isMobile ? 82 : 68);

                    camera.position.set(
                        startPos.x + (currentRoomAvatar.position.x - startPos.x) * ease,
                        startPos.y + (standY - startPos.y) * ease,
                        startPos.z + (currentRoomAvatar.position.z - startPos.z) * ease
                    );
                    const curYaw = startYaw + normalizeAngle(fps.yaw - startYaw) * ease;
                    const curPitch = startPitch + (fps.pitch - startPitch) * ease;
                    camera.rotation.set(curPitch, curYaw, 0, 'YXZ');
                    camera.fov = startFov + (targetFov - startFov) * ease;
                    camera.updateProjectionMatrix();
                } else if (currentState.isSleeping) {
                    // POV Allongé sur le lit (Chambre) ou sur la Méridienne Producteur face Console & Skyline (42F Studio Pro)
                    const bedTarget = (window.activeStudioLocation === 'pro_studio')
                        ? window._v3finalCam.set(-5.15, 0.35, 1.65)
                        : window._v3finalCam.set(3.8, 0.24, -4.05);
                    camera.position.lerp(bedTarget, 0.08);
                    const restPitch = 0.62 + Math.sin(time * 0.45) * 0.03;
                    const restYaw = (window.activeStudioLocation === 'pro_studio' ? -1.45 : 0.65) + Math.cos(time * 0.3) * 0.04;
                    camera.rotation.set(
                        camera.rotation.x + (restPitch - camera.rotation.x) * 0.06,
                        camera.rotation.y + normalizeAngle(restYaw - camera.rotation.y) * 0.06,
                        0, 'YXZ'
                    );
                } else if (currentState.isSitting) {
                    // POV Assis sur le canapé (Chambre ou Canapé Producteur Sweet Spot 42F)
                    const sitPos = (window.activeStudioLocation === 'pro_studio')
                        ? window._v3finalCam.set(-5.25, 0.58, -0.25)
                        : window._v3finalCam.set(-3.82, 0.56, 1.5);
                    camera.position.lerp(sitPos, 0.12);
                    const breathe = Math.sin(time * 1.1) * 0.012;
                    camera.position.y += breathe;
                    camera.rotation.set(fps.pitch, fps.yaw, 0, 'YXZ');
                } else {
                    // POV DEBOUT STANDARD : Position yeux + Head-bob ultra-subtil + Micro-inertie douce
                    if (isMoving) {
                        fps.bobTime += 0.145 * energySpeedMult;
                        fps.bobAmount += (1 - fps.bobAmount) * 0.11;
                        fps.wasMovingPrev = true;
                    } else {
                        if (fps.wasMovingPrev) {
                            fps.stopSettle = -0.006; // Amorti ultra-subtil à l'arrêt
                            fps.wasMovingPrev = false;
                        }
                        fps.bobAmount *= 0.86;
                    }
                    fps.stopSettle = (fps.stopSettle || 0) * 0.88;

                    // Micro-inclinaison latérale très subtile sur Q/D
                    const strafeInputDir = (window.kbdState?.left ? 1 : 0) - (window.kbdState?.right ? 1 : 0);
                    fps.strafeRoll = (fps.strafeRoll || 0) + (strafeInputDir * 0.0045 - (fps.strafeRoll || 0)) * 0.08;

                    const bobY = Math.sin(fps.bobTime * 2) * 0.011 * fps.bobAmount + fps.stopSettle;
                    const bobRoll = Math.cos(fps.bobTime) * 0.0022 * fps.bobAmount + fps.strafeRoll;
                    const idleBreath = Math.sin(time * 1.15) * 0.003;

                    const targetCamPos = window._v3finalCam.set(
                        currentRoomAvatar.position.x,
                        currentRoomAvatar.position.y + 2.45 + bobY + idleBreath,
                        currentRoomAvatar.position.z
                    );
                    camera.position.lerp(targetCamPos, 0.36);

                    // Smooth FOV zoom (molette pour inspecter les objets)
                    const baseFov = window.getBaseFpsFov ? window.getBaseFpsFov() : (isMobile ? 82 : 68);
                    const desiredFov = Math.max(44, Math.min(90, baseFov + (fps.fovZoomOffset || 0)));
                    if (Math.abs(camera.fov - desiredFov) > 0.05) {
                        camera.fov += (desiredFov - camera.fov) * 0.14;
                        camera.updateProjectionMatrix();
                    }

                    camera.rotation.set(fps.pitch, fps.yaw, bobRoll, 'YXZ');

                    // Tremblement fatigue ou post-export
                    if (isMoving && safeEnergy <= 0) {
                        const s = 0.018;
                        camera.position.x += (Math.random() - 0.5) * s;
                        camera.position.y += (Math.random() - 0.5) * s;
                    }
                    if (window.camShakeIntensity > 0.001) {
                        camera.position.x += (Math.random() - 0.5) * window.camShakeIntensity;
                        camera.position.y += (Math.random() - 0.5) * window.camShakeIntensity;
                        window.camShakeIntensity *= 0.85;
                    }
                }

                // Synchronise la rotation logique de l'avatar avec le regard FPS
                currentRoomAvatar.rotation.y = fps.yaw + Math.PI;

                // 5C. Mise à jour du Viseur Central FPS (Crosshair Raycast)
                if (typeof window.updateFpsCrosshairTarget === 'function') {
                    window.updateFpsCrosshairTarget();
                }
            }

            // --- SURLIGNAGE SMOOTH PAR PROXIMITÉ ---
            if (typeof highlightItems !== 'undefined' && Array.isArray(highlightItems)) {
                const avatarPos = currentRoomAvatar.position;
                const targetPos = window._v3a;
                
                const defaultInteractionDist = typeof INTERACTION_DIST !== 'undefined' ? INTERACTION_DIST : 2.0;
                const hlColor = typeof HIGHLIGHT_LINE_COLOR !== 'undefined' ? HIGHLIGHT_LINE_COLOR : new THREE.Color(0xffffff);
                const defColor = typeof DEFAULT_LINE_COLOR !== 'undefined' ? DEFAULT_LINE_COLOR : new THREE.Color(0x000000);

                const isProLocNow = (window.activeStudioLocation === 'pro_studio');
                highlightItems.forEach(item => {
                    if (!item || !item.mesh || !item.mesh.visible) return;
                    if (item.isProStudio === undefined) {
                        let p = item.mesh.parent;
                        let inPro = false;
                        while (p) {
                            if (p === window.proStudioGroup) { inPro = true; break; }
                            p = p.parent;
                        }
                        item.isProStudio = inPro;
                    }
                    if (item.isProStudio !== isProLocNow) return;
                    
                    item.mesh.getWorldPosition(targetPos);
                    const dist = Math.hypot(targetPos.x - avatarPos.x, targetPos.z - avatarPos.z);
                    
                    let customDist = defaultInteractionDist;
                    if (item.mesh.name === 'bed_mesh') customDist = 2.8; 
                    if (item.mesh.name === 'pc_mesh') customDist = 2.4;  
                    if (item.mesh.name === 'sofa_mesh') customDist = 3.0; 
                    if (item.mesh.name === 'achievements_board_mesh') customDist = 2.5;
                    
                    item.mesh.userData = item.mesh.userData || { baseEmissiveIntensity: 0 };

                    if (item.mesh.geometry && item.mesh.geometry.type === "PlaneGeometry" && item.mesh.name === 'pc_mesh') {
                        let proximityFocus = Math.max(0, 1 - (dist / (customDist + 1.5))); 
                        item.mesh.userData.baseEmissiveIntensity = 0.1 + (proximityFocus * 0.8) + (Math.sin(time) * 0.1);
                    }

                    let targetEmissive = item.mesh.userData.baseEmissiveIntensity || 0;
                    let targetLineOp = 0.4; 
                    let targetLineColor = defColor;

                    // Hover override: if edges.userData.hovered is set by pointermove, force highlight
                    const isHovered = !!(item.edges && item.edges.userData && item.edges.userData.hovered);
                    if (dist < customDist || isHovered) {
                        isNearSomething = true;
                        if (!(item.mesh.geometry && item.mesh.geometry.type === "PlaneGeometry" && item.mesh.name === 'pc_mesh')) {
                            targetEmissive += 0.25; 
                        }
                        targetLineOp = isHovered ? 0.9 : 0.6;    
                        targetLineColor = hlColor; 
                    }

                    if (item.mesh.material) {
                        item.mesh.material.emissiveIntensity += (targetEmissive - (item.mesh.material.emissiveIntensity || 0)) * 0.15;
                    }

                    if (item.edges && item.edges.material) {
                        item.edges.material.opacity += (targetLineOp - (item.edges.material.opacity || 0)) * 0.15;
                        item.edges.material.color.lerp(targetLineColor, 0.15);
                    }
                });
            }

            // --- MISE À JOUR VISUELLE DES NUAGES (GLOW PROXIMITÉ) ---
            if (window._bgNearPrev !== isNearSomething) {
                if (window._bgClouds) {
                    window._bgClouds.forEach(c => c.classList.toggle('cloud-glow', isNearSomething));
                }
                window._bgNearPrev = isNearSomething;
            }
        } // FIN DU BLOC if (currentRoomAvatar)

        // ==================================================
        // --- LOGIQUE GLOBALE (SANS BESOIN D'AVATAR) ---
        // ==================================================

        // --- MÉTÉO DYNAMIQUE : NUAGES TIC-TAC VS INSPIRATION ---
        if (window._bgClouds && typeof state !== 'undefined' && typeof state.inspi === 'number') {
            const inspiRatio = Math.max(0, Math.min(1, state.inspi / 100));
            
            // Opacité globale : faible (0.3) quand inspi=100%, forte (1.5) quand inspi=0%
            const targetOpacity = THREE.MathUtils.lerp(1.5, 0.3, inspiRatio);
            
            // Couleur de fond : Sombre orageux (rgba(30, 20, 48, 0.45)) à 0%, Blanc brillant (rgba(255, 255, 255, 0.12)) à 100%
            const darkR = 30, darkG = 20, darkB = 48, darkA = 0.45;
            const lightR = 255, lightG = 255, lightB = 255, lightA = 0.12;
            
            const r = Math.floor(THREE.MathUtils.lerp(darkR, lightR, inspiRatio));
            const g = Math.floor(THREE.MathUtils.lerp(darkG, lightG, inspiRatio));
            const b = Math.floor(THREE.MathUtils.lerp(darkB, lightB, inspiRatio));
            const a = THREE.MathUtils.lerp(darkA, lightA, inspiRatio);
            
            if (typeof window._currentCloudOpacity === 'undefined') window._currentCloudOpacity = targetOpacity;
            window._currentCloudOpacity += (targetOpacity - window._currentCloudOpacity) * 0.05; // Lissage doux

            const bgLayer = document.getElementById('room-bg-layer');
            if (bgLayer) {
                bgLayer.style.setProperty('--cloud-alpha', window._currentCloudOpacity);
                bgLayer.style.setProperty('--cloud-color', `rgba(${r}, ${g}, ${b}, ${a})`);
            }
        }

        // --- EFFET DE DISTORSION VISUELLE (Optimisé sans fuite de mémoire) ---
        if (typeof currentRoomAvatar !== 'undefined' && currentRoomAvatar && typeof scene !== 'undefined' && (currentState.isSleeping || currentState.isSitting) && Math.random() < 0.08) {
            if (!window.timeRipples) window.timeRipples = [];
            
            if (!window._sharedRippleGeo) {
                window._sharedRippleGeo = new THREE.TorusGeometry(0.3, 0.015, 8, 24);
            }
            if (!window._sharedRippleMat) {
                window._sharedRippleMat = new THREE.MeshBasicMaterial({ 
                    color: 0x818cf8, transparent: true, opacity: 0.6, depthWrite: false 
                });
            }
            
            if (window.timeRipples.length < 8) {
                const ripple = new THREE.Mesh(window._sharedRippleGeo, window._sharedRippleMat.clone());
                const p = currentRoomAvatar.position;
                ripple.position.set(p.x, p.y + 0.5, p.z);
                ripple.rotation.x = Math.PI / 2;
                scene.add(ripple);
                window.timeRipples.push({ 
                    mesh: ripple, 
                    life: 1.0, 
                    scaleSpeed: 0.03,
                    driftSpeed: 0.008,
                    rotZ: 0.01
                });
            }
        }

        // --- MISE À JOUR DES PARTICULES DE FATIGUE ---
        if (window.fatigueParticles && window.fatigueParticles.length > 0) {
            const currentTimeForWobble = Date.now() * 0.001;
            for (let i = window.fatigueParticles.length - 1; i >= 0; i--) {
                const p = window.fatigueParticles[i];
                
                p.velY += (p.gravity || -0.001);
                p.mesh.position.y += p.velY;
                
                if (p.wobbleSpeed) {
                    p.mesh.position.x += Math.sin(currentTimeForWobble * p.wobbleSpeed + p.seed) * p.wobbleInt;
                    p.mesh.position.z += Math.cos(currentTimeForWobble * p.wobbleSpeed + p.seed) * p.wobbleInt;
                }
                
                p.life -= (p.decay || 0.02);
                p.mesh.traverse(child => {
                    if (child.material) child.material.opacity = Math.max(0, p.life * 0.85);
                });

                if (p.life <= 0 || p.mesh.position.y < -1) { 
                    if (typeof scene !== 'undefined') scene.remove(p.mesh);
                    window.fatigueParticles.splice(i, 1);
                }
            }
        }

        // --- MISE À JOUR DES RIPPLES DE DISTORSION TEMPORELLE ---
        if (window.timeRipples && window.timeRipples.length > 0) {
            for (let i = window.timeRipples.length - 1; i >= 0; i--) {
                const r = window.timeRipples[i];
                
                r.life -= 0.015; 
                
                // 1. L'anneau s'élargit
                r.mesh.scale.x += r.scaleSpeed;
                r.mesh.scale.y += r.scaleSpeed;
                
                // 2. L'anneau flotte vers le haut
                r.mesh.position.y += r.driftSpeed;
                
                // 3. L'anneau tourne subtilement
                r.mesh.rotation.z += r.rotZ;

                // 4. Easing d'opacité dynamique
                if (r.mesh.material) {
                    r.mesh.material.opacity = Math.max(0, Math.pow(r.life, 2) * 0.6);
                }
                
                // Nettoyage propre
                if (r.life <= 0) {
                    if (typeof scene !== 'undefined') scene.remove(r.mesh);
                    if (r.mesh.material) r.mesh.material.dispose();
                    window.timeRipples.splice(i, 1);
                }
            }
        }

        // ==========================================
        // --- FLOATING VITALS BADGES (3D → 2D projection) ---
        // ==========================================
        if (typeof window.mouseX === 'undefined') {
            window.mouseX = 0; window.mouseY = 0;
            document.addEventListener('mousemove', e => { window.mouseX = e.clientX; window.mouseY = e.clientY; }, {passive:true});
        }

        (function updateFloatingVitalsBadges() {
            const badgeEnergy = document.getElementById('floating-energy-warning');
            const pctEnergy = document.getElementById('floating-energy-pct');
            const badgeInspi = document.getElementById('floating-inspi-warning');
            const pctInspi = document.getElementById('floating-inspi-pct');
            
            if (!badgeEnergy || !pctEnergy || !badgeInspi || !pctInspi) return;

            const energy = (typeof safeEnergy === 'number') ? safeEnergy : 100;
            const inspiVal = (typeof state !== 'undefined' && state && typeof state.inspi === 'number') ? state.inspi : 100;
            const isRoomVisible = document.getElementById('room-ui') && document.getElementById('room-ui').style.display === 'flex';

            if (!isRoomVisible || !currentRoomAvatar || !camera || !renderer) {
                badgeEnergy.style.display = 'none';
                badgeInspi.style.display = 'none';
                return;
            }

            // Création d'un point d'ancrage 3D strictement au-dessus de l'avatar
            // En augmentant ce décalage en 3D, l'écart visuel en 2D s'agrandit naturellement avec le zoom (perspective)
            const headOffset = (currentRoomAvatar.scale.y || 1.6) * 1.7; // Ancrage bien au-dessus du crâne
            window._v3avatarWorldPos = window._v3avatarWorldPos || new THREE.Vector3();
            const avatarWorldPos = window._v3avatarWorldPos.set(
                currentRoomAvatar.position.x,
                currentRoomAvatar.position.y + headOffset,
                currentRoomAvatar.position.z
            );
            
            avatarWorldPos.project(camera);
            
            // Ne pas afficher si le point est derrière la caméra (clipping) ou totalement hors écran
            if (avatarWorldPos.z > 1 || avatarWorldPos.z < -1 || 
                avatarWorldPos.x < -1.5 || avatarWorldPos.x > 1.5 || 
                avatarWorldPos.y < -1.5 || avatarWorldPos.y > 1.5) {
                badgeEnergy.style.display = 'none';
                badgeInspi.style.display = 'none';
                return;
            }

            const canvasW = renderer.domElement.clientWidth  || window.innerWidth;
            const canvasH = renderer.domElement.clientHeight || window.innerHeight;
            const canvasRect = renderer.domElement.getBoundingClientRect();

            const screenX = Math.round((avatarWorldPos.x * 0.5 + 0.5) * canvasW + canvasRect.left);
            const screenY = Math.round((-avatarWorldPos.y * 0.5 + 0.5) * canvasH + canvasRect.top);

            // Survol de la souris ? (Rayon de 100px autour du centre de l'avatar projeté)
            // screenY pointe sur la tête, le corps est un peu plus bas, donc on décale le centre vers le bas.
            const distToMouse = Math.hypot(window.mouseX - screenX, window.mouseY - (screenY + 50));
            const isHovered = (distToMouse < 80);

            // -- ENERGY BADGE --
            if (energy <= 40 || isHovered) {
                badgeEnergy.style.display = 'block';
                badgeEnergy.style.left    = screenX + 'px';
                badgeEnergy.style.top     = screenY + 'px';
                pctEnergy.textContent     = Math.floor(energy) + '%';
                
                if (energy <= 15) {
                    badgeEnergy.classList.add('critical');
                    badgeEnergy.classList.remove('hover-only');
                } else if (energy > 40) {
                    badgeEnergy.classList.add('hover-only');
                    badgeEnergy.classList.remove('critical');
                } else {
                    badgeEnergy.classList.remove('critical', 'hover-only');
                }
            } else {
                badgeEnergy.style.display = 'none';
            }

            // -- INSPI BADGE --
            if (inspiVal <= 40 || isHovered) {
                badgeInspi.style.display = 'block';
                badgeInspi.style.left    = screenX + 'px';
                // Décalage pour ne pas superposer (au-dessus du badge d'énergie si affiché)
                const offsetY = (badgeEnergy.style.display === 'block') ? -30 : 0;
                badgeInspi.style.top     = (screenY + offsetY) + 'px';
                pctInspi.textContent     = Math.floor(inspiVal) + '%';
                
                if (inspiVal <= 15) {
                    badgeInspi.classList.add('critical');
                    badgeInspi.classList.remove('hover-only');
                } else if (inspiVal > 40) {
                    badgeInspi.classList.add('hover-only');
                    badgeInspi.classList.remove('critical');
                } else {
                    badgeInspi.classList.remove('critical', 'hover-only');
                }
            } else {
                badgeInspi.style.display = 'none';
            }
        })();

        // --- LE RENDU FINAL (INDISPENSABLE POUR VOIR LA ROOM) ---
        // On ne rend la scène 3D que si le PC n'est pas actif (gain massif de GPU)
        if (!document.body.classList.contains('os-active')) {
            renderer.render(scene, camera);
        }
    }

        

        
        
// --- Global Bridge & ES Exports ---
Object.assign(globalThis, { initSceneCore, FURNITURE_CATALOG, activePerks, applyFurniturePerk, recalculateActivePerks, getFurniture3DObject, baseMysticMaterial, syncFurniture3DVisibility, animate3D });
export { initSceneCore, FURNITURE_CATALOG, activePerks, applyFurniturePerk, recalculateActivePerks, getFurniture3DObject, baseMysticMaterial, syncFurniture3DVisibility, animate3D };
