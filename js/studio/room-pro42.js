import { THREE } from '../core/libs.js';

function initProStudio42(pbrCtx) {
    const { configureTex, wallTex, walnutTex, leatherTex, curtainTex, archGroup, exteriorGroup, tagInteractable, hpStandGroup, chairGroup } = pbrCtx || {};
            // =========================================================================
            // NIVEAU 4 : VRAI COMPLEXE STUDIO PRO — 42E ÉTAGE (DARK STUDIO MODERNE × MIKE DEAN)
            // • Architecture radicalement différente de la chambre :
            //   - Control Room sur ESTRADE (Podium 2 marches LED) orientée FACE À LA SKYLINE EST (+X)
            //   - Murs acoustiques inclinés à pans coupés (35° & 45°) + Moniteurs Main Augspurger encastrés
            //   - 2 Tours de Racks 19 pouces géantes (2.15m de haut, 10U à lampes/VU) encadrant la Console SSL
            //   - Vraie LIVE ROOM vitrée au Nord : Piano à Queue Ébène + Synthés Mike Dean, Batterie Acoustique 5 fûts sur estrade, Stack Amplis & Micro Neumann U87 (ON AIR)
            //   - Bar VIP / Espace Label au Sud-Ouest : Frigo vitré boissons lumineux, Bar marbre noir + La Marzocco, Grand Mur "HALL OF FAME" rétroéclairé (4 disques + platine Technics)
            //   - ZÉRO LIT : Grand Salon VIP en Cuir Anthracite/Cognac face à la baie Sud-Est (Assise Chill + Méridienne Repos)
            //   - Palette 100% Dark Studio : Béton ciré/ardoise anthracite au sol, tissu acoustique noir mat, bois brûlé Shou Sugi Ban, métal brossé gunmetal, plafond sculpté noir avec Ciel Étoilé Fibre Optique & Lignes LED Audio-Réactives (Violet / Ambre / Bleu Nuit)
            // =========================================================================
            const proStudioGroup = new THREE.Group();
            proStudioGroup.name = 'ProStudio42F';
            proStudioGroup.visible = false;

            // Texture procédurale Béton Ciré / Ardoise Sombre Anthracite (Zéro parquet chêne de chambre!)
            const slateFloorC = document.createElement('canvas'); slateFloorC.width = 512; slateFloorC.height = 512;
            const sfCtx = slateFloorC.getContext('2d');
            sfCtx.fillStyle = '#14171f'; sfCtx.fillRect(0, 0, 512, 512);
            for (let i = 0; i < 1400; i++) {
                const v = 18 + Math.floor(Math.random() * 16);
                sfCtx.fillStyle = `rgba(${v}, ${v + 3}, ${v + 9}, ${0.08 + Math.random() * 0.12})`;
                sfCtx.fillRect(Math.random() * 512, Math.random() * 512, 8 + Math.random() * 34, 6 + Math.random() * 28);
            }
            // Joints de dalles architecturales en acier sombre
            sfCtx.strokeStyle = '#0c0e13'; sfCtx.lineWidth = 3;
            [0, 128, 256, 384].forEach(pos => {
                sfCtx.beginPath(); sfCtx.moveTo(pos, 0); sfCtx.lineTo(pos, 512); sfCtx.stroke();
                sfCtx.beginPath(); sfCtx.moveTo(0, pos); sfCtx.lineTo(512, pos); sfCtx.stroke();
            });
            const psSlateFloorMap = configureTex(slateFloorC, 6, 5, true);

            const psSlateFloorMat = new THREE.MeshStandardMaterial({
                map: psSlateFloorMap, normalMap: wallTex.normalMap, normalScale: new THREE.Vector2(0.42, 0.42),
                color: '#1c202b', roughness: 0.30, metalness: 0.16, envMapIntensity: 0.95
            });
            const psEbonyMat = new THREE.MeshStandardMaterial({
                map: walnutTex.map, normalMap: walnutTex.normalMap, normalScale: new THREE.Vector2(0.65, 0.65),
                color: '#1f1d22', roughness: 0.38, metalness: 0.10
            });
            const psBurntWoodMat = new THREE.MeshStandardMaterial({
                map: walnutTex.map, normalMap: walnutTex.normalMap, normalScale: new THREE.Vector2(0.75, 0.75),
                color: '#151418', roughness: 0.46, metalness: 0.08
            });
            const psDarkConcreteMat = new THREE.MeshStandardMaterial({
                map: wallTex.map, normalMap: wallTex.normalMap, normalScale: new THREE.Vector2(0.45, 0.45),
                color: '#181b24', roughness: 0.82, metalness: 0.06
            });
            const psDarkAcousticMat = new THREE.MeshStandardMaterial({
                map: curtainTex.map, color: '#101218', roughness: 0.95
            });
            const psPodiumCarpetMat = new THREE.MeshStandardMaterial({
                map: curtainTex.map, color: '#151822', roughness: 0.92
            });
            const psSteelMat = new THREE.MeshStandardMaterial({ color: '#161922', roughness: 0.24, metalness: 0.88, envMapIntensity: 1.3 });
            const psGunmetalMat = new THREE.MeshStandardMaterial({ color: '#252a38', roughness: 0.26, metalness: 0.85, envMapIntensity: 1.35 });
            const psChromeMat = new THREE.MeshStandardMaterial({ color: '#e2e8f0', roughness: 0.14, metalness: 0.96, envMapIntensity: 1.6 });
            const psBrassMat = new THREE.MeshStandardMaterial({ color: '#d4af37', roughness: 0.24, metalness: 0.90 });
            const psLeatherMat = new THREE.MeshStandardMaterial({
                map: leatherTex.map, normalMap: leatherTex.normalMap, normalScale: new THREE.Vector2(0.6, 0.6),
                color: '#181a22', roughness: 0.36, metalness: 0.08
            });
            const psCognacLeatherMat = new THREE.MeshStandardMaterial({
                map: leatherTex.map, normalMap: leatherTex.normalMap, normalScale: new THREE.Vector2(0.6, 0.6),
                color: '#7c4427', roughness: 0.38, metalness: 0.06
            });
            const psMarbleMat = new THREE.MeshStandardMaterial({ color: '#11131a', roughness: 0.12, metalness: 0.18, envMapIntensity: 1.35 });

            // Matériaux LED Audio-Réactifs (Ambre Studio, Cyber-Violet Mike Dean, Bleu Nuit Skyline)
            const psAmberLedMat = new THREE.MeshStandardMaterial({ color: '#fff3d6', emissive: '#f59e0b', emissiveIntensity: 1.55, roughness: 0.2 });
            const psVioletLedMat = new THREE.MeshStandardMaterial({ color: '#f3e8ff', emissive: '#9333ea', emissiveIntensity: 1.50, roughness: 0.2 });
            const psCyanLedMat = new THREE.MeshStandardMaterial({ color: '#e0f2fe', emissive: '#0ea5e9', emissiveIntensity: 1.35, roughness: 0.2 });
            window.proStudioAudioLedMats = [psAmberLedMat, psVioletLedMat, psCyanLedMat];

            // 1. SOL BÉTON CIRÉ / ARDOISE ANTHRACITE XXL (16×12m, y = -1.0) + INSERTS MÉTAL BROSSÉ
            const psFloor = new THREE.Mesh(new THREE.PlaneGeometry(16.4, 12.4), psSlateFloorMat);
            psFloor.rotation.x = -Math.PI / 2; psFloor.position.set(0, -1.0, 0); psFloor.receiveShadow = true;
            proStudioGroup.add(psFloor);

            // 2. PLAFOND ACOUSTIQUE SCULPTÉ NOIR OBSIDIENNE (y = +4.35) + BAFFLES INCLINÉS + CIEL ÉTOILÉ FIBRE OPTIQUE
            const psCeil = new THREE.Mesh(new THREE.PlaneGeometry(16.6, 12.6), new THREE.MeshStandardMaterial({
                color: '#080a0f', roughness: 0.96
            }));
            psCeil.rotation.x = Math.PI / 2; psCeil.position.set(0, 4.35, 0);
            proStudioGroup.add(psCeil);

            // Voûte acoustique sculptée à 5 arches trapézoïdales en bois brûlé & feutre noir + rubans LED encastrés
            [-4.8, -2.0, 0.8, 3.4, 5.8].forEach((bx, bi) => {
                const baffle = new THREE.Group();
                baffle.position.set(bx, 4.02, 0);
                const bCore = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.22, 10.6), psDarkAcousticMat);
                baffle.add(bCore);
                const bRibL = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.26, 10.65), psBurntWoodMat);
                bRibL.position.x = -0.48; baffle.add(bRibL);
                const bRibR = bRibL.clone(); bRibR.position.x = 0.48; baffle.add(bRibR);
                const ledMat = bi % 2 === 0 ? psVioletLedMat : psAmberLedMat;
                const bLed = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.025, 9.8), ledMat);
                bLed.position.set(0, -0.115, 0); baffle.add(bLed);
                proStudioGroup.add(baffle);
            });

            // Ciel Étoilé Fibre Optique au plafond du Studio Pro (280 micro-étoiles scintillantes!)
            const starCount = 280;
            const starPos = new Float32Array(starCount * 3);
            for (let s = 0; s < starCount; s++) {
                starPos[s * 3]     = -7.4 + Math.random() * 14.8;
                starPos[s * 3 + 1] = 4.18 + Math.random() * 0.12;
                starPos[s * 3 + 2] = -5.4 + Math.random() * 10.8;
            }
            const starGeo = new THREE.BufferGeometry();
            starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
            const starMat = new THREE.PointsMaterial({ color: '#e2e8f0', size: 0.045, transparent: true, opacity: 0.88 });
            const starField = new THREE.Points(starGeo, starMat);
            proStudioGroup.add(starField);
            window.proStudioStarMat = starMat;

            // 3. ARCHITECTURE PÉRIMÉTRIQUE : IMMENSE BAIE VITRÉE PANORAMIQUE EST (+X) FACE À LA CONSOLE + PANS COUPÉS ACOUSTIQUES
            const psGlassMat = new THREE.MeshStandardMaterial({
                color: '#93c5fd', transparent: true, opacity: 0.08, roughness: 0.04, metalness: 0.75, depthWrite: false, side: THREE.DoubleSide
            });
            // Grande Baie Vitrée Panoramique Est (x = +8.0, 12m de large × 5.3m de haut — DROIT DEVANT LA CONSOLE SSL!)
            const psGlassE = new THREE.Mesh(new THREE.PlaneGeometry(12.0, 5.3), psGlassMat);
            psGlassE.position.set(8.02, 1.65, 0); psGlassE.rotation.y = -Math.PI / 2; proStudioGroup.add(psGlassE);
            // Baie Vitrée Sud-Est (z = +6.0, x = +1.2 .. +8.0)
            const psGlassSE = new THREE.Mesh(new THREE.PlaneGeometry(6.8, 5.3), psGlassMat);
            psGlassSE.position.set(4.6, 1.65, 6.02); psGlassSE.rotation.y = Math.PI; proStudioGroup.add(psGlassSE);

            // Piliers architecturaux inclinés en acier gunmetal sur la verrière Est & Sud-Est
            [-5.95, -3.0, 0.0, 3.0, 5.95].forEach(mz => {
                const m = new THREE.Mesh(new THREE.BoxGeometry(0.14, 5.35, 0.12), psGunmetalMat);
                m.position.set(7.98, 1.65, mz); proStudioGroup.add(m);
            });
            [1.2, 3.5, 5.8, 8.0].forEach(mx => {
                const m = new THREE.Mesh(new THREE.BoxGeometry(0.12, 5.35, 0.14), psGunmetalMat);
                m.position.set(mx, 1.65, 5.98); proStudioGroup.add(m);
            });
            const psBarEBot = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.18, 12.1), psSteelMat);
            psBarEBot.position.set(7.96, -0.91, 0); proStudioGroup.add(psBarEBot);
            const psBarETop = psBarEBot.clone(); psBarETop.position.y = 4.24; proStudioGroup.add(psBarETop);

            // Murs Nord, Ouest & Sud-Ouest en Béton Brut Anthracite + Panneaux Acoustiques Noirs & Bois Brûlé
            const psWallN = new THREE.Mesh(new THREE.BoxGeometry(16.2, 5.4, 0.18), psDarkConcreteMat);
            psWallN.position.set(0, 1.68, -6.08); proStudioGroup.add(psWallN);
            const psWallSW = new THREE.Mesh(new THREE.BoxGeometry(9.4, 5.4, 0.18), psDarkConcreteMat);
            psWallSW.position.set(-3.4, 1.68, 6.08); proStudioGroup.add(psWallSW);

            // Mur Ouest (x = -8.0) avec Porte Blindée Studio & Couloir Ascenseur 42e Étage (z = +2.4)
            const psWallWN = new THREE.Mesh(new THREE.BoxGeometry(0.18, 5.4, 7.6), psDarkConcreteMat);
            psWallWN.position.set(-8.08, 1.68, -2.2); proStudioGroup.add(psWallWN);
            const psWallWS = new THREE.Mesh(new THREE.BoxGeometry(0.18, 5.4, 2.8), psDarkConcreteMat);
            psWallWS.position.set(-8.08, 1.68, 4.6); proStudioGroup.add(psWallWS);
            const psWallWTop = new THREE.Mesh(new THREE.BoxGeometry(0.18, 2.1, 1.6), psDarkConcreteMat);
            psWallWTop.position.set(-8.08, 3.3, 2.4); proStudioGroup.add(psWallWTop);

            // Diffuseur Acoustique Géant 3D Noir & Ébène Brûlé + Bass Traps à Pans Coupés sur le Mur Ouest (Arrière Control Room)
            const rearDiffGroup = new THREE.Group();
            rearDiffGroup.position.set(-7.92, 1.65, -0.35);
            const rdFrame = new THREE.Mesh(new THREE.BoxGeometry(0.16, 3.4, 3.6), psBurntWoodMat);
            rearDiffGroup.add(rdFrame);
            for (let rz = -1.6; rz <= 1.6; rz += 0.22) {
                const depth = 0.08 + (Math.abs(Math.round(rz * 7)) % 5) * 0.045;
                const fin = new THREE.Mesh(new THREE.BoxGeometry(depth, 3.1, 0.12), psEbonyMat);
                fin.position.set(0.08 + depth * 0.5, 0, rz);
                rearDiffGroup.add(fin);
            }
            const rdLedTop = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.04, 3.5), psVioletLedMat);
            rdLedTop.position.set(0.12, 1.66, 0); rearDiffGroup.add(rdLedTop);
            const rdLedBot = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.04, 3.5), psAmberLedMat);
            rdLedBot.position.set(0.12, -1.66, 0); rearDiffGroup.add(rdLedBot);
            proStudioGroup.add(rearDiffGroup);

            // Porte Acoustique Blindée Studio Pro (x = -8.0, z = +2.4) + Couloir Ascenseur 42e
            const psDoorFrame = new THREE.Mesh(new THREE.BoxGeometry(0.26, 3.24, 1.66), psGunmetalMat);
            psDoorFrame.position.set(-8.02, 0.62, 2.4); proStudioGroup.add(psDoorFrame);
            const psDoorPivot = new THREE.Group();
            psDoorPivot.position.set(-7.96, -1.0, 3.18);
            const psDoorLeaf = new THREE.Mesh(new THREE.BoxGeometry(0.12, 3.16, 1.54), psEbonyMat);
            psDoorLeaf.position.set(0, 1.58, -0.77); psDoorLeaf.name = 'door_mesh'; psDoorPivot.add(psDoorLeaf);
            const psDoorHandle = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.52, 10), psChromeMat);
            psDoorHandle.position.set(0.09, 1.45, -1.36); psDoorHandle.name = 'door_mesh'; psDoorPivot.add(psDoorHandle);
            proStudioGroup.add(psDoorPivot);
            window.proStudioDoorPivot = psDoorPivot;

            const floorSignC = document.createElement('canvas'); floorSignC.width = 320; floorSignC.height = 64;
            const fsCtx = floorSignC.getContext('2d');
            fsCtx.fillStyle = '#07090e'; fsCtx.fillRect(0, 0, 320, 64);
            fsCtx.strokeStyle = '#a855f7'; fsCtx.lineWidth = 3; fsCtx.strokeRect(4, 4, 312, 56);
            fsCtx.fillStyle = '#f59e0b'; fsCtx.font = 'bold 23px monospace'; fsCtx.textAlign = 'center'; fsCtx.textBaseline = 'middle';
            fsCtx.fillText('42e · MASTER CONTROL', 160, 34);
            const psFloorSign = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.24, 1.12), [
                new THREE.MeshStandardMaterial({ map: configureTex(floorSignC, 1, 1, true), emissive: '#a855f7', emissiveIntensity: 0.55 }),
                psSteelMat, psSteelMat, psSteelMat, psSteelMat, psSteelMat
            ]);
            psFloorSign.position.set(-7.95, 2.48, 2.4); proStudioGroup.add(psFloorSign);

            // Couloir d'ascenseur 3D derrière la porte (x = -8.1 -> -11.2, z = 2.4)
            const hallFloor = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 2.4), psMarbleMat);
            hallFloor.rotation.x = -Math.PI / 2; hallFloor.position.set(-9.6, -1.0, 2.4); proStudioGroup.add(hallFloor);
            const hallCeil = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 2.4), psDarkConcreteMat);
            hallCeil.rotation.x = Math.PI / 2; hallCeil.position.set(-9.6, 2.4, 2.4); proStudioGroup.add(hallCeil);
            const hallWallL = new THREE.Mesh(new THREE.BoxGeometry(3.2, 3.4, 0.1), psDarkConcreteMat);
            hallWallL.position.set(-9.6, 0.7, 1.2); proStudioGroup.add(hallWallL);
            const hallWallR = hallWallL.clone(); hallWallR.position.z = 3.6; proStudioGroup.add(hallWallR);
            const hallElevDoor = new THREE.Mesh(new THREE.BoxGeometry(0.12, 2.8, 1.7), psChromeMat);
            hallElevDoor.position.set(-11.15, 0.4, 2.4); proStudioGroup.add(hallElevDoor);
            const hallLightBar = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.04, 0.14), psVioletLedMat);
            hallLightBar.position.set(-9.6, 2.36, 2.4); proStudioGroup.add(hallLightBar);

            // =========================================================================
            // 4. ESTRADE CONTROL ROOM (PODIUM 2 MARCHES LED) + MURS ACOUSTIQUES INCLINÉS
            //    + CONSOLE SSL FACE À LA SKYLINE EST (+X) + 2 TOURS DE RACKS 19" DE 2.15M
            // =========================================================================
            const podiumGroup = new THREE.Group();
            podiumGroup.position.set(3.5, -1.0, -0.1);
            // Marche 1 (Largeur 4.6m en X × 5.6m en Z, hauteur 12cm)
            const podStep1 = new THREE.Mesh(new THREE.BoxGeometry(4.8, 0.12, 5.6), psGunmetalMat);
            podStep1.position.set(0, 0.06, 0); podStep1.receiveShadow = true; podiumGroup.add(podStep1);
            const podLed1 = new THREE.Mesh(new THREE.BoxGeometry(4.84, 0.018, 5.64), psAmberLedMat);
            podLed1.position.set(0, 0.106, 0); podiumGroup.add(podLed1);
            // Marche 2 Supérieure (Largeur 4.3m en X × 5.1m en Z, hauteur totale +24cm, y = -0.76)
            const podStep2 = new THREE.Mesh(new THREE.BoxGeometry(4.3, 0.12, 5.1), psPodiumCarpetMat);
            podStep2.position.set(0.15, 0.18, 0); podStep2.receiveShadow = true; podiumGroup.add(podStep2);
            const podLed2 = new THREE.Mesh(new THREE.BoxGeometry(4.34, 0.018, 5.14), psVioletLedMat);
            podLed2.position.set(0.15, 0.226, 0); podiumGroup.add(podLed2);
            proStudioGroup.add(podiumGroup);

            // 2 MURS ACOUSTIQUES INCLINÉS À PANS COUPÉS (35°) ENCADRANT LA BAIE VITRÉE SKYLINE + MONITEURS MAIN AUGSPURGER ENCASTRÉS
            [
                { z: -3.45, rotY: -0.58, led: psVioletLedMat },
                { z:  3.25, rotY:  0.58, led: psAmberLedMat }
            ].forEach((sw, si) => {
                const splay = new THREE.Group();
                splay.position.set(6.35, -1.0, sw.z);
                splay.rotation.y = sw.rotY;

                // Monolithe acoustique à pan coupé (2.4m large × 5.2m haut × 0.65m prof)
                const monolith = new THREE.Mesh(new THREE.BoxGeometry(0.68, 5.25, 2.35), psDarkAcousticMat);
                monolith.position.y = 2.62; splay.add(monolith);
                // Tasseaux verticaux en bois brûlé Shou Sugi Ban + Lames LED verticales
                for (let sz = -1.05; sz <= 1.05; sz += 0.21) {
                    const slat = new THREE.Mesh(new THREE.BoxGeometry(0.06, 5.15, 0.08), psBurntWoodMat);
                    slat.position.set(-0.35, 2.62, sz); splay.add(slat);
                }
                const vLedL = new THREE.Mesh(new THREE.BoxGeometry(0.04, 5.1, 0.035), sw.led);
                vLedL.position.set(-0.36, 2.62, -1.12); splay.add(vLedL);
                const vLedR = vLedL.clone(); vLedR.position.z = 1.12; splay.add(vLedR);

                // Énorme Moniteur Main Augspurger Double-15" + Pavillon + Subwoofer 18" encastré dans le mur incliné!
                const mainMon = new THREE.Group();
                mainMon.position.set(-0.34, 2.35, 0);
                mainMon.rotation.y = -Math.PI / 2;
                const mCab = new THREE.Mesh(new THREE.BoxGeometry(1.16, 1.65, 0.42), psSteelMat); mainMon.add(mCab);
                const mBezel = new THREE.Mesh(new THREE.BoxGeometry(1.06, 1.55, 0.05), psEbonyMat); mBezel.position.z = 0.22; mainMon.add(mBezel);
                [-0.42, 0.08].forEach(wy => {
                    const ring = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.03, 24), psChromeMat);
                    ring.rotation.x = Math.PI / 2; ring.position.set(0, wy, 0.25); mainMon.add(ring);
                    const cone = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.22, 0.05, 24), psDarkAcousticMat);
                    cone.rotation.x = Math.PI / 2; cone.position.set(0, wy, 0.255); mainMon.add(cone);
                });
                const horn = new THREE.Mesh(new THREE.BoxGeometry(0.64, 0.28, 0.08), psBrassMat);
                horn.position.set(0, 0.52, 0.25); mainMon.add(horn);
                const hornHole = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.15, 0.09), new THREE.MeshBasicMaterial({ color: '#050608' }));
                hornHole.position.set(0, 0.52, 0.255); mainMon.add(hornHole);
                // Caisson Subwoofer 18" au bas du pan coupé
                const subCab = new THREE.Mesh(new THREE.BoxGeometry(1.16, 0.85, 0.42), psSteelMat);
                subCab.position.set(0, -1.55, 0); mainMon.add(subCab);
                const subRing = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.03, 24), psGunmetalMat);
                subRing.rotation.x = Math.PI / 2; subRing.position.set(0, -1.55, 0.22); mainMon.add(subRing);
                tagInteractable(mainMon, 'speaker_mesh');
                splay.add(mainMon);

                proStudioGroup.add(splay);
            });

            // GRANDE CONSOLE ANALOGIQUE SSL 4000G SUR L'ESTRADE — ORIENTÉE FACE À LA SKYLINE EST (+X)!
            const sslGroup = new THREE.Group();
            sslGroup.position.set(3.95, -0.76, -0.1);
            sslGroup.rotation.y = -Math.PI / 2; // Regarde droit vers +X (la baie vitrée Skyline!)

            [-2.05, 2.05].forEach(lx => {
                const leg = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.92, 1.38), psGunmetalMat);
                leg.position.set(lx, 0.46, 0); leg.castShadow = true; leg.receiveShadow = true; sslGroup.add(leg);
            });
            const consoleBody = new THREE.Mesh(new THREE.BoxGeometry(4.36, 0.26, 1.48), psSteelMat);
            consoleBody.position.set(0, 0.92, 0); consoleBody.castShadow = true; consoleBody.receiveShadow = true; sslGroup.add(consoleBody);

            // Flancs en ébène brûlé & acier + repose-poignets cuir noir
            [-2.20, 2.20].forEach(cx => {
                const cheek = new THREE.Mesh(new THREE.BoxGeometry(0.10, 0.50, 1.58), psEbonyMat);
                cheek.position.set(cx, 1.06, -0.02); cheek.castShadow = true; sslGroup.add(cheek);
            });
            const armrest = new THREE.Mesh(new THREE.CylinderGeometry(0.068, 0.068, 4.30, 14), psLeatherMat);
            armrest.rotation.z = Math.PI / 2; armrest.position.set(0, 1.05, 0.72); sslGroup.add(armrest);

            // Surface Console SSL 24 tranches Haute-Résolution
            const sslC = document.createElement('canvas'); sslC.width = 1024; sslC.height = 512;
            const sslCtx = sslC.getContext('2d');
            sslCtx.fillStyle = '#181b22'; sslCtx.fillRect(0, 0, 1024, 512);
            for (let ch = 0; ch < 24; ch++) {
                const x = 14 + ch * 41.5;
                sslCtx.fillStyle = ch >= 11 && ch <= 12 ? '#101218' : '#222631';
                sslCtx.fillRect(x, 12, 37, 488);
                const knobCols = ['#ef4444', '#22c55e', '#38bdf8', '#eab308', '#a855f7', '#e2e8f0'];
                for (let kr = 0; kr < 6; kr++) {
                    sslCtx.fillStyle = knobCols[kr];
                    sslCtx.beginPath(); sslCtx.arc(x + 18, 42 + kr * 42, 8, 0, Math.PI * 2); sslCtx.fill();
                    sslCtx.fillStyle = '#0b0c10'; sslCtx.fillRect(x + 17, 35 + kr * 42, 2, 7);
                }
                sslCtx.fillStyle = '#090b10'; sslCtx.fillRect(x + 15, 315, 6, 165);
                sslCtx.fillStyle = ch % 3 === 0 ? '#a855f7' : (ch % 2 === 0 ? '#f59e0b' : '#22c55e');
                sslCtx.fillRect(x + 8, 292, 10, 8);
                sslCtx.fillStyle = '#e2e8f0';
                const fY = 340 + ((ch * 37) % 95);
                sslCtx.fillRect(x + 7, fY, 22, 14);
            }
            const sslDeck = new THREE.Mesh(
                new THREE.PlaneGeometry(4.22, 1.18),
                new THREE.MeshStandardMaterial({ map: configureTex(sslC, 1, 1, true), roughness: 0.40, metalness: 0.42 })
            );
            sslDeck.rotation.x = -Math.PI / 2 + 0.14;
            sslDeck.position.set(0, 1.12, 0.08);
            sslGroup.add(sslDeck);

            // Pont de VU-Mètres Analogiques Rétroéclairés Ambre
            const meterBridge = new THREE.Mesh(new THREE.BoxGeometry(4.30, 0.32, 0.34), psSteelMat);
            meterBridge.position.set(0, 1.28, -0.58); meterBridge.castShadow = true; sslGroup.add(meterBridge);
            const vuC = document.createElement('canvas'); vuC.width = 1024; vuC.height = 128;
            const vuCtx = vuC.getContext('2d');
            const vuTex = configureTex(vuC, 1, 1, true);
            const vuPanel = new THREE.Mesh(
                new THREE.PlaneGeometry(4.16, 0.24),
                new THREE.MeshStandardMaterial({ map: vuTex, emissive: '#ffbf5e', emissiveMap: vuTex, emissiveIntensity: 0.98, roughness: 0.2 })
            );
            vuPanel.position.set(0, 1.29, -0.408); vuPanel.rotation.x = -0.14;
            sslGroup.add(vuPanel);
            window._proVuCtx = vuCtx; window._proVuTex = vuTex; window._proVuLastTs = 0;

            // Double Écran Ultrawide Mastering DAW (posés de façon à laisser la Skyline visible au-dessus et autour!)
            const psMonStand = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.38, 0.14), psGunmetalMat);
            psMonStand.position.set(0, 1.54, -0.66); sslGroup.add(psMonStand);
            [-0.80, 0.80].forEach((mx, mi) => {
                const mg = new THREE.Group();
                mg.position.set(mx, 1.88, -0.58); mg.rotation.y = mi === 0 ? 0.16 : -0.16;
                const fr = new THREE.Mesh(new THREE.BoxGeometry(1.50, 0.76, 0.045), psSteelMat); fr.castShadow = true; mg.add(fr);
                const scr = new THREE.Mesh(new THREE.PlaneGeometry(1.44, 0.70), pcScreenMat);
                scr.position.z = 0.025; mg.add(scr);
                tagInteractable(mg, 'pc_mesh');
                sslGroup.add(mg);
            });

            // 2 Moniteurs Nearfield Yamaha NS-10 à cône blanc sur le meter bridge
            [-1.82, 1.82].forEach((nx, ni) => {
                const nsg = new THREE.Group(); nsg.position.set(nx, 1.62, -0.58); nsg.rotation.y = ni === 0 ? 0.24 : -0.24;
                const box = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.34, 0.34), psSteelMat); box.castShadow = true; nsg.add(box);
                const whiteCone = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.11, 0.025, 20), new THREE.MeshStandardMaterial({ color: '#f8f6f0', roughness: 0.75 }));
                whiteCone.rotation.x = Math.PI / 2; whiteCone.position.set(-0.08 * (ni === 0 ? -1 : 1), 0, 0.172); nsg.add(whiteCone);
                const tw = new THREE.Mesh(new THREE.CylinderGeometry(0.042, 0.042, 0.02, 16), psChromeMat);
                tw.rotation.x = Math.PI / 2; tw.position.set(0.11 * (ni === 0 ? -1 : 1), 0.04, 0.172); nsg.add(tw);
                tagInteractable(nsg, 'speaker_mesh');
                sslGroup.add(nsg);
            });

            // 2 TOURS DE RACKS 19 POUCES GÉANTES (2.15M DE HAUT, 10U CHACUNE!) ENCADRANT LA CONSOLE SUR L'ESTRADE (desk_interface_mesh!)
            [-2.85, 2.85].forEach((rx, ri) => {
                const tower = new THREE.Group();
                tower.position.set(rx, 0, 0.25);
                tower.rotation.y = ri === 0 ? 0.52 : -0.52;

                // Châssis tour de mastering 2.15m de haut en acier noir & flancs ébène brûlé
                const tCab = new THREE.Mesh(new THREE.BoxGeometry(0.96, 2.15, 0.76), psEbonyMat);
                tCab.position.y = 1.075; tCab.castShadow = true; tCab.receiveShadow = true; tower.add(tCab);
                const tTrimL = new THREE.Mesh(new THREE.BoxGeometry(0.05, 2.16, 0.78), psGunmetalMat);
                tTrimL.position.set(-0.46, 1.08, 0); tower.add(tTrimL);
                const tTrimR = tTrimL.clone(); tTrimR.position.x = 0.46; tower.add(tTrimR);
                const tTopLed = new THREE.Mesh(new THREE.BoxGeometry(0.88, 0.03, 0.04), ri === 0 ? psVioletLedMat : psAmberLedMat);
                tTopLed.position.set(0, 2.12, 0.38); tower.add(tTopLed);

                // 9 Unités Rack 19" (Compresseurs LA-2A, 1176 Blue Stripe, Pultec EQ à lampes, Manley, Patchbay)
                const faceColors = ['#181b24', '#232938', '#d6d1c4', '#14171f', '#1e293b', '#171920', '#27272a', '#111827', '#1c1917'];
                for (let u = 0; u < 9; u++) {
                    const uy = 0.22 + u * 0.21;
                    const plate = new THREE.Mesh(
                        new THREE.BoxGeometry(0.84, 0.185, 0.04),
                        new THREE.MeshStandardMaterial({ color: faceColors[u], roughness: 0.32, metalness: 0.72 })
                    );
                    plate.position.set(0, uy, 0.375); tower.add(plate);

                    // Petits VU-mètres ambre éclairés sur les unités à lampes
                    if (u % 2 === 0) {
                        [-0.22, 0.22].forEach(vx => {
                            const vuBox = new THREE.Mesh(new THREE.PlaneGeometry(0.13, 0.085), psAmberLedMat);
                            vuBox.position.set(vx, uy, 0.398); tower.add(vuBox);
                        });
                    } else {
                        // Bargraphes LED (vert / ambre / rouge / violet)
                        const ledCol = u === 1 ? '#38bdf8' : (u === 3 ? '#a855f7' : '#34d399');
                        for (let lb = 0; lb < 5; lb++) {
                            const lDot = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.02, 0.015), new THREE.MeshBasicMaterial({ color: lb === 4 ? '#f43f5e' : ledCol }));
                            lDot.position.set(-0.34 + lb * 0.038, uy, 0.398); tower.add(lDot);
                        }
                    }
                    // Potards rotatifs usinés
                    for (let k = 0; k < 4; k++) {
                        const kn = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.026, 0.035, 12), u === 2 ? psSteelMat : psChromeMat);
                        kn.rotation.x = Math.PI / 2; kn.position.set(-0.18 + k * 0.12, uy - 0.03, 0.402); tower.add(kn);
                    }
                }
                // Lampes triodes chaudes visibles au sommet de la tour!
                for (let tb = -2; tb <= 2; tb++) {
                    const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.09, 10), psAmberLedMat);
                    tube.position.set(tb * 0.14, 2.19, 0.12); tower.add(tube);
                }

                tagInteractable(tower, 'desk_interface_mesh');
                sslGroup.add(tower);
            });

            // Tablette Latérale Ingé Son sur la console (Smartphone & Casque Monitoring Pro)
            const sideWing = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.05, 0.65), psEbonyMat);
            sideWing.position.set(2.38, 1.02, 0.38); sslGroup.add(sideWing);
            const psPhone = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.018, 0.26), psChromeMat);
            psPhone.position.set(2.35, 1.055, 0.44); psPhone.rotation.y = -0.35; psPhone.name = 'desk_phone_mesh'; sslGroup.add(psPhone);
            const psHpStand = hpStandGroup.clone();
            psHpStand.visible = true;
            psHpStand.position.set(2.42, 1.045, 0.12); psHpStand.rotation.y = -0.6;
            tagInteractable(psHpStand, 'desk_headphones_mesh'); sslGroup.add(psHpStand);

            // Fauteuil de Mastering Noir Obsidienne devant la Console SSL sur l'Estrade
            const psChair = chairGroup.clone();
            psChair.visible = true;
            psChair.position.set(0, 0, 1.42); psChair.rotation.y = 0.12;
            sslGroup.add(psChair);

            tagInteractable(consoleBody, 'pc_mesh');
            proStudioGroup.add(sslGroup);

            // =========================================================================
            // 5. VRAIE "LIVE ROOM" / SALLE D'INSTRUMENTS VITRÉE (AILE NORD, z = -6.0 .. -2.55)
            //    • Grande baie vitrée inclinée de studio + Panneaux lumineux "LIVE ROOM" & "ON AIR"
            //    • Piano à Queue de Concert Ébène (couvercle ouvert + harpe dorée) + Mur Synthés Mike Dean (synth_mesh)
            //    • Batterie Acoustique Studio 5 Fûts sur Estrade (Grosse caisse 22", caisse claire, toms, 4 cymbales laiton, micros overhead)
            //    • Stack Amplis Guitare & Basse à Lampes + Coin Prise de Voix Neumann U87 (desk_mic_mesh)
            // =========================================================================
            const liveRoomGroup = new THREE.Group();
            liveRoomGroup.position.set(-2.6, -1.0, -4.25);

            // Tapis acoustique sombre de la Live Room
            const lrFloor = new THREE.Mesh(new THREE.BoxGeometry(10.4, 0.025, 3.35), psPodiumCarpetMat);
            lrFloor.position.set(0, 0.012, 0); lrFloor.receiveShadow = true; liveRoomGroup.add(lrFloor);

            // Cloison Vitrée Acoustique entre la Control Room et la Live Room (avec passage ouvert à droite pour entrer librement!)
            const lrGlassWallL = new THREE.Mesh(new THREE.BoxGeometry(6.8, 4.3, 0.10), psGlassMat);
            lrGlassWallL.position.set(-1.8, 2.15, 1.68); liveRoomGroup.add(lrGlassWallL);
            const lrBaseWallL = new THREE.Mesh(new THREE.BoxGeometry(6.85, 0.82, 0.18), psDarkAcousticMat);
            lrBaseWallL.position.set(-1.8, 0.41, 1.68); liveRoomGroup.add(lrBaseWallL);
            const lrTopBeam = new THREE.Mesh(new THREE.BoxGeometry(10.5, 0.22, 0.20), psGunmetalMat);
            lrTopBeam.position.set(0, 4.25, 1.68); liveRoomGroup.add(lrTopBeam);
            [-5.2, -1.8, 1.6, 5.2].forEach(px => {
                const post = new THREE.Mesh(new THREE.BoxGeometry(0.14, 4.35, 0.18), psGunmetalMat);
                post.position.set(px, 2.17, 1.68); liveRoomGroup.add(post);
            });
            const lrLedBeam = new THREE.Mesh(new THREE.BoxGeometry(10.4, 0.03, 0.04), psVioletLedMat);
            lrLedBeam.position.set(0, 4.12, 1.79); liveRoomGroup.add(lrLedBeam);

            // Panneau Lumineux "ON AIR · LIVE ROOM" au-dessus de la baie vitrée de la Live Room!
            const onAirC = document.createElement('canvas'); onAirC.width = 384; onAirC.height = 80;
            const oaCtx = onAirC.getContext('2d');
            oaCtx.fillStyle = '#140608'; oaCtx.fillRect(0, 0, 384, 80);
            oaCtx.strokeStyle = '#ef4444'; oaCtx.lineWidth = 4; oaCtx.strokeRect(5, 5, 374, 70);
            oaCtx.fillStyle = '#ff3b4e'; oaCtx.font = 'bold 34px Outfit, sans-serif'; oaCtx.textAlign = 'center'; oaCtx.textBaseline = 'middle';
            oaCtx.fillText('● ON AIR · LIVE ROOM', 192, 42);
            const onAirMat = new THREE.MeshStandardMaterial({
                map: configureTex(onAirC, 1, 1, true), emissive: '#ef4444', emissiveIntensity: 0.65, roughness: 0.2
            });
            window.proStudioOnAirMat = onAirMat;
            const onAirBox = new THREE.Mesh(new THREE.BoxGeometry(1.35, 0.28, 0.09), [psSteelMat, psSteelMat, psSteelMat, psSteelMat, onAirMat, psSteelMat]);
            onAirBox.position.set(-0.2, 3.88, 1.80); liveRoomGroup.add(onAirBox);

            // A. PIANO À QUEUE DE CONCERT ÉBÈNE (GRAND PIANO) + SYNTHÉS ANALOGIQUES MIKE DEAN (synth_mesh!)
            const grandPianoGroup = new THREE.Group();
            grandPianoGroup.position.set(-3.35, 0, -0.15);
            grandPianoGroup.rotation.y = 0.35;
            // Corps du piano à queue en laque noire brillante + harpe dorée intérieure
            const gpLacquerMat = new THREE.MeshStandardMaterial({ color: '#090a0f', roughness: 0.08, metalness: 0.35, envMapIntensity: 1.6 });
            const gpBody = new THREE.Mesh(new THREE.BoxGeometry(1.52, 0.34, 1.85), gpLacquerMat);
            gpBody.position.set(0, 0.84, -0.15); gpBody.castShadow = true; grandPianoGroup.add(gpBody);
            const gpTail = new THREE.Mesh(new THREE.CylinderGeometry(0.76, 0.76, 0.34, 24), gpLacquerMat);
            gpTail.position.set(0, 0.84, -1.05); gpTail.castShadow = true; grandPianoGroup.add(gpTail);
            // Harpe en fonte dorée & cordes à l'intérieur du piano
            const gpHarp = new THREE.Mesh(new THREE.BoxGeometry(1.36, 0.04, 1.65), psBrassMat);
            gpHarp.position.set(0, 1.02, -0.20); grandPianoGroup.add(gpHarp);
            // Couvercle du piano à queue ouvert à 36° + béquille laiton
            const gpLid = new THREE.Mesh(new THREE.BoxGeometry(1.50, 0.03, 1.82), gpLacquerMat);
            gpLid.position.set(0.28, 1.42, -0.18); gpLid.rotation.z = 0.58; gpLid.castShadow = true; grandPianoGroup.add(gpLid);
            const gpProp = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.82, 8), psBrassMat);
            gpProp.position.set(0.58, 1.28, 0.35); gpProp.rotation.z = -0.25; grandPianoGroup.add(gpProp);
            // Clavier 88 touches + 3 pieds tournés + Pédalier lyre laiton + Banquette cuir
            const gpKeyBed = new THREE.Mesh(new THREE.BoxGeometry(1.46, 0.12, 0.36), gpLacquerMat);
            gpKeyBed.position.set(0, 0.76, 0.82); grandPianoGroup.add(gpKeyBed);
            const gpWhiteKeys = new THREE.Mesh(new THREE.BoxGeometry(1.36, 0.04, 0.24), new THREE.MeshStandardMaterial({ color: '#f8fafc', roughness: 0.2 }));
            gpWhiteKeys.position.set(0, 0.83, 0.86); grandPianoGroup.add(gpWhiteKeys);
            const gpBlackKeys = new THREE.Mesh(new THREE.BoxGeometry(1.28, 0.055, 0.13), gpLacquerMat);
            gpBlackKeys.position.set(0, 0.845, 0.80); grandPianoGroup.add(gpBlackKeys);
            [[-0.64, 0.65], [0.64, 0.65], [0, -1.45]].forEach(([lx, lz]) => {
                const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.035, 0.68, 12), gpLacquerMat);
                leg.position.set(lx, 0.34, lz); grandPianoGroup.add(leg);
            });
            const gpBench = new THREE.Mesh(new THREE.BoxGeometry(0.92, 0.48, 0.38), psLeatherMat);
            gpBench.position.set(0, 0.24, 1.28); grandPianoGroup.add(gpBench);
            tagInteractable(grandPianoGroup, 'synth_mesh');
            liveRoomGroup.add(grandPianoGroup);

            // B. BATTERIE ACOUSTIQUE STUDIO 5 FÛTS SUR ESTRADE (DRUM KIT ON RISER) AU CENTRE DE LA LIVE ROOM!
            const drumGroup = new THREE.Group();
            drumGroup.position.set(-0.55, 0, -0.25);
            drumGroup.rotation.y = -0.15;
            // Estrade Batterie (Drum Riser) avec liseré LED ambre
            const drumRiser = new THREE.Mesh(new THREE.BoxGeometry(2.35, 0.14, 1.95), psGunmetalMat);
            drumRiser.position.set(0, 0.07, 0); drumRiser.receiveShadow = true; drumGroup.add(drumRiser);
            const drumShellMat = new THREE.MeshStandardMaterial({ color: '#7f1d1d', roughness: 0.18, metalness: 0.65 });
            const drumHeadMat = new THREE.MeshStandardMaterial({ color: '#f1f5f9', roughness: 0.55 });
            // Grosse Caisse 22" (Kick Drum) + Micro Kick sur mini-perche
            const kickDrum = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.36, 0.48, 24), drumShellMat);
            kickDrum.rotation.x = Math.PI / 2; kickDrum.position.set(0, 0.52, 0.12); kickDrum.castShadow = true; drumGroup.add(kickDrum);
            const kickFront = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.50, 24), new THREE.MeshStandardMaterial({ color: '#0f172a', roughness: 0.4 }));
            kickFront.rotation.x = Math.PI / 2; kickFront.position.set(0, 0.52, 0.12); drumGroup.add(kickFront);
            // Caisse Claire (Snare) + 2 Toms Suspendus + Tom Basse (Floor Tom)
            const snare = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.19, 0.16, 20), psChromeMat);
            snare.position.set(-0.34, 0.72, -0.22); drumGroup.add(snare);
            [[-0.18, 0.94, 0.05, 0.16], [0.18, 0.96, 0.05, 0.18], [0.46, 0.64, -0.12, 0.23]].forEach(([tx, ty, tz, tr]) => {
                const tom = new THREE.Mesh(new THREE.CylinderGeometry(tr, tr, 0.24, 20), drumShellMat);
                tom.position.set(tx, ty, tz); tom.castShadow = true; drumGroup.add(tom);
                const head = new THREE.Mesh(new THREE.CylinderGeometry(tr - 0.01, tr - 0.01, 0.25, 20), drumHeadMat);
                head.position.set(tx, ty, tz); drumGroup.add(head);
            });
            // 4 Cymbales en Laiton Brillant (Hi-Hat, Crash L, Crash R, Ride 22") sur pieds chromés
            [
                [-0.58, 0.96, -0.18, 0.19, 0.05],
                [-0.55, 1.32,  0.22, 0.25, 0.22],
                [ 0.52, 1.36,  0.24, 0.26, -0.22],
                [ 0.64, 1.14, -0.10, 0.28, -0.18]
            ].forEach(([cx, cy, cz, cr, tilt]) => {
                const stand = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.016, cy, 8), psChromeMat);
                stand.position.set(cx, cy * 0.5, cz); drumGroup.add(stand);
                const cym = new THREE.Mesh(new THREE.CylinderGeometry(cr, cr * 0.15, 0.012, 24), psBrassMat);
                cym.position.set(cx, cy, cz); cym.rotation.z = tilt; cym.rotation.x = 0.18; drumGroup.add(cym);
            });
            tagInteractable(drumGroup, 'drum_mesh');
            liveRoomGroup.add(drumGroup);

            // C. MUR MODULAIRE EURORACK & SYNTHÉS ANALOGIQUES MIKE DEAN + STACK AMPLIS À LAMPES (Fond Nord de la Live Room)
            const mikeDeanGroup = new THREE.Group();
            mikeDeanGroup.position.set(2.15, 0, -0.95);
            [-1.35, 1.35].forEach(sx => {
                const upright = new THREE.Mesh(new THREE.BoxGeometry(0.08, 2.25, 0.68), psSteelMat);
                upright.position.set(sx, 1.12, -0.15); mikeDeanGroup.add(upright);
            });
            [0.86, 1.36].forEach((sy, tierIdx) => {
                const chassis = new THREE.Mesh(new THREE.BoxGeometry(2.65, 0.14, 0.58), psGunmetalMat);
                chassis.position.set(0, sy, 0.02); chassis.rotation.x = tierIdx === 0 ? 0.08 : 0.22; mikeDeanGroup.add(chassis);
                const wKeys = new THREE.Mesh(new THREE.BoxGeometry(2.26, 0.04, 0.24), new THREE.MeshStandardMaterial({ color: '#f8f6f0', roughness: 0.3 }));
                wKeys.position.set(0, sy + 0.06, 0.16); wKeys.rotation.x = tierIdx === 0 ? 0.08 : 0.22; mikeDeanGroup.add(wKeys);
            });
            const euroCase = new THREE.Mesh(new THREE.BoxGeometry(2.72, 0.82, 0.26), psEbonyMat);
            euroCase.position.set(0, 2.04, -0.22); euroCase.rotation.x = 0.12; mikeDeanGroup.add(euroCase);
            window.proModularLeds = [];
            const modLedCols = ['#a855f7', '#f59e0b', '#38bdf8', '#f43f5e', '#34d399'];
            for (let ml = 0; ml < 24; ml++) {
                const lMat = new THREE.MeshBasicMaterial({ color: modLedCols[ml % modLedCols.length] });
                const led = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.022, 0.015), lMat);
                led.position.set(-1.15 + (ml % 12) * 0.21, 1.88 + Math.floor(ml / 12) * 0.32, -0.075);
                mikeDeanGroup.add(led);
                window.proModularLeds.push({ mesh: led, phase: ml * 0.7 });
            }
            tagInteractable(mikeDeanGroup, 'synth_mesh');
            liveRoomGroup.add(mikeDeanGroup);

            // Stack d'Amplis Guitare & Basse 4×12 Marshall/Ampeg dans la Live Room
            const ampStack = new THREE.Group();
            ampStack.position.set(4.15, 0, -0.75);
            ampStack.rotation.y = -0.35;
            const cabBot = new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.82, 0.46), psSteelMat);
            cabBot.position.y = 0.41; cabBot.castShadow = true; ampStack.add(cabBot);
            const cabTop = new THREE.Mesh(new THREE.BoxGeometry(0.74, 0.28, 0.36), psEbonyMat);
            cabTop.position.y = 0.96; ampStack.add(cabTop);
            const ampFace = new THREE.Mesh(new THREE.PlaneGeometry(0.66, 0.14), psBrassMat);
            ampFace.position.set(0, 0.96, 0.185); ampStack.add(ampFace);
            liveRoomGroup.add(ampStack);

            // D. ESPACE PRISE DE VOIX STUDIO + MICRO NEUMANN U87 SUR PERCHE CHROMÉE (desk_mic_mesh!)
            const u87Group = new THREE.Group();
            u87Group.position.set(3.55, 0, 0.65);
            // Écran acoustique semi-circulaire noir derrière le chanteur
            const gobo = new THREE.Mesh(new THREE.BoxGeometry(1.35, 2.05, 0.12), psDarkAcousticMat);
            gobo.position.set(0.35, 1.02, -0.55); gobo.rotation.y = -0.35; u87Group.add(gobo);
            const uBase = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.26, 0.04, 20), psSteelMat); uBase.position.y = 0.02; u87Group.add(uBase);
            const uPole = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.020, 1.55, 10), psChromeMat); uPole.position.y = 0.80; uPole.castShadow = true; u87Group.add(uPole);
            const uBody = new THREE.Mesh(new THREE.CylinderGeometry(0.042, 0.038, 0.24, 18), psChromeMat); uBody.position.set(0, 1.66, 0); u87Group.add(uBody);
            const uGrille = new THREE.Mesh(new THREE.CylinderGeometry(0.044, 0.042, 0.11, 18), psBrassMat); uGrille.position.set(0, 1.82, 0); u87Group.add(uGrille);
            const uPop = new THREE.Mesh(new THREE.TorusGeometry(0.10, 0.008, 8, 22), psSteelMat);
            uPop.position.set(-0.14, 1.78, 0.05); uPop.rotation.y = Math.PI / 2; u87Group.add(uPop);
            const uStand = new THREE.Mesh(new THREE.BoxGeometry(0.54, 0.36, 0.02), psGunmetalMat);
            uStand.position.set(0.48, 1.38, 0.25); uStand.rotation.set(-0.45, -0.7, 0); u87Group.add(uStand);
            tagInteractable(u87Group, 'desk_mic_mesh');
            liveRoomGroup.add(u87Group);

            proStudioGroup.add(liveRoomGroup);

            // =========================================================================
            // 6. GRAND MUR "HALL OF FAME" RÉTROÉCLAIRÉ + PLATINE TECHNICS + BAR VIP LABEL
            //    (Frigo Vitré Boissons Lumineux + Comptoir Marbre Noir + Espresso La Marzocco)
            // =========================================================================
            // Grand Mur Architectural "HALL OF FAME" Rétroéclairé (Mur Sud-Ouest, x = -4.9, z = +5.92)
            const hofBackdrop = new THREE.Mesh(new THREE.BoxGeometry(5.8, 3.85, 0.08), psBurntWoodMat);
            hofBackdrop.position.set(-4.7, 1.85, 5.96); proStudioGroup.add(hofBackdrop);
            const hofLedTop = new THREE.Mesh(new THREE.BoxGeometry(5.84, 0.04, 0.06), psAmberLedMat);
            hofLedTop.position.set(-4.7, 3.78, 5.93); proStudioGroup.add(hofLedTop);
            const hofLedBot = new THREE.Mesh(new THREE.BoxGeometry(5.84, 0.04, 0.06), psVioletLedMat);
            hofLedBot.position.set(-4.7, 0.02, 5.93); proStudioGroup.add(hofLedBot);

            // Enseigne lumineuse "HALL OF FAME · LABEL CERTIFICATIONS" au sommet du mur des disques
            const hofSignC = document.createElement('canvas'); hofSignC.width = 512; hofSignC.height = 64;
            const hsCtx = hofSignC.getContext('2d');
            hsCtx.fillStyle = '#090b10'; hsCtx.fillRect(0, 0, 512, 64);
            hsCtx.fillStyle = '#fbbf24'; hsCtx.font = 'bold 26px Outfit, sans-serif'; hsCtx.textAlign = 'center'; hsCtx.textBaseline = 'middle';
            hsCtx.fillText('★ HALL OF FAME · CERTIFICATIONS ★', 256, 33);
            const hofSignMesh = new THREE.Mesh(
                new THREE.PlaneGeometry(3.2, 0.36),
                new THREE.MeshStandardMaterial({ map: configureTex(hofSignC, 1, 1, true), emissive: '#f59e0b', emissiveIntensity: 0.65 })
            );
            hofSignMesh.position.set(-4.7, 3.42, 5.90); hofSignMesh.rotation.y = Math.PI;
            proStudioGroup.add(hofSignMesh);

            // 4 Grands Cadres Disques d'Or / Platine / Double Platine / Diamant éclairés sur le Mur Hall of Fame
            const awardColors = ['#cbd5e1', '#facc15', '#f1f5f9', '#38bdf8'];
            const awardLabels = ['#38bdf8', '#f59e0b', '#a855f7', '#38bdf8'];
            [-6.75, -5.38, -4.02, -2.65].forEach((ax, ai) => {
                const f = new THREE.Mesh(new THREE.BoxGeometry(0.98, 1.22, 0.06), psGunmetalMat);
                f.position.set(ax, 2.28, 5.90);
                const back = new THREE.Mesh(new THREE.PlaneGeometry(0.88, 1.12), new THREE.MeshStandardMaterial({ color: '#0b0d13', roughness: 0.85 }));
                back.position.set(0, 0, -0.031); back.rotation.y = Math.PI; f.add(back);
                const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.02, 32), new THREE.MeshStandardMaterial({ color: awardColors[ai], roughness: 0.14, metalness: 0.96, envMapIntensity: 1.8 }));
                disc.rotation.x = Math.PI / 2; disc.position.set(0, 0.18, -0.036); f.add(disc);
                const lbl = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.022, 20), new THREE.MeshStandardMaterial({ color: awardLabels[ai], roughness: 0.5 }));
                lbl.rotation.x = Math.PI / 2; lbl.position.set(0, 0.18, -0.037); f.add(lbl);

                const plC = document.createElement('canvas'); plC.width = 512; plC.height = 192;
                const plCtx = plC.getContext('2d');
                const plTex = configureTex(plC, 1, 1, true);
                const plMesh = new THREE.Mesh(
                    new THREE.PlaneGeometry(0.76, 0.285),
                    new THREE.MeshStandardMaterial({ map: plTex, emissive: '#ffffff', emissiveMap: plTex, emissiveIntensity: 0.45, roughness: 0.22, metalness: 0.25 })
                );
                plMesh.position.set(0, -0.34, -0.038);
                plMesh.rotation.y = Math.PI;
                f.add(plMesh);

                proStudioGroup.add(f);
                window.proStudioWallDiscs.push({ plaqueCtx: plCtx, plaqueTex: plTex });
            });
            if (typeof window.syncCareerWallDiscs === 'function') window.syncCareerWallDiscs();

            // Crédence Audiophile Noir & Acier sous le Hall of Fame + Platine Technics SL-1200 qui tourne (achievements_board_mesh!)
            const vinylStation = new THREE.Group();
            vinylStation.position.set(-4.7, -1.0, 5.42);
            const credenza = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.84, 0.72), psEbonyMat);
            credenza.position.y = 0.46; credenza.castShadow = true; credenza.receiveShadow = true; vinylStation.add(credenza);
            const credTop = new THREE.Mesh(new THREE.BoxGeometry(3.46, 0.04, 0.76), psMarbleMat);
            credTop.position.y = 0.90; vinylStation.add(credTop);
            const ttBase = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.07, 0.54), psGunmetalMat);
            ttBase.position.set(-1.05, 0.955, 0); vinylStation.add(ttBase);
            const ttPlatter = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.23, 0.025, 28), psChromeMat);
            ttPlatter.position.set(-1.10, 1.00, 0); vinylStation.add(ttPlatter);
            const ttDiscGroup = new THREE.Group();
            ttDiscGroup.position.set(-1.10, 1.018, 0);
            const ttVinyl = new THREE.Mesh(new THREE.CylinderGeometry(0.205, 0.205, 0.006, 28), new THREE.MeshStandardMaterial({ color: '#0c0d11', roughness: 0.14, metalness: 0.45 }));
            const ttLabel = new THREE.Mesh(new THREE.CylinderGeometry(0.068, 0.068, 0.008, 18), new THREE.MeshStandardMaterial({ color: '#a855f7', roughness: 0.45 }));
            const ttDot = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.009, 0.012), new THREE.MeshBasicMaterial({ color: '#ffffff' }));
            ttDot.position.x = 0.045;
            ttDiscGroup.add(ttVinyl, ttLabel, ttDot);
            vinylStation.add(ttDiscGroup);
            window._proStudioTurntableDisc = ttDiscGroup;
            for (let k = 0; k < 10; k++) {
                const tex = (typeof window.createVinylCoverTexture === 'function') ? window.createVinylCoverTexture('pro_lp_' + k, 256) : null;
                const lp = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.46, 0.015), new THREE.MeshStandardMaterial({ map: tex || null, color: tex ? '#ffffff' : '#a855f7', roughness: 0.4 }));
                lp.position.set(0.05 + k * 0.13, 1.15, 0); lp.rotation.y = Math.PI / 2 - 0.16; lp.castShadow = true;
                vinylStation.add(lp);
            }
            tagInteractable(vinylStation, 'achievements_board_mesh');
            proStudioGroup.add(vinylStation);

            // BAR VIP / ESPACE LABEL (x = -0.8, z = +5.15) : Frigo Vitré Boissons Lumineux + Bar Marbre Noir + La Marzocco + Tabourets (desk_mug_mesh!)
            const barGroup = new THREE.Group();
            barGroup.position.set(-0.85, -1.0, 5.15);
            // Comptoir en marbre noir veiné & acier brossé + bandeau LED sous-comptoir
            const barCounter = new THREE.Mesh(new THREE.BoxGeometry(2.55, 1.02, 0.80), psGunmetalMat);
            barCounter.position.y = 0.51; barCounter.castShadow = true; barGroup.add(barCounter);
            const barTop = new THREE.Mesh(new THREE.BoxGeometry(2.68, 0.07, 0.88), psMarbleMat);
            barTop.position.y = 1.05; barGroup.add(barTop);
            const barLed = new THREE.Mesh(new THREE.BoxGeometry(2.58, 0.025, 0.03), psCyanLedMat);
            barLed.position.set(0, 0.98, -0.41); barGroup.add(barLed);

            // Frigo Vitré Lumineux VIP (Beverage Cooler rétroéclairé cyan/ambre avec canettes & bouteilles!)
            const fridgeCab = new THREE.Mesh(new THREE.BoxGeometry(0.92, 1.95, 0.56), psSteelMat);
            fridgeCab.position.set(-0.75, 0.98, 0.46); barGroup.add(fridgeCab);
            const fridgeBackGlow = new THREE.Mesh(new THREE.PlaneGeometry(0.76, 1.72), psCyanLedMat);
            fridgeBackGlow.position.set(-0.75, 1.02, 0.21); fridgeBackGlow.rotation.y = Math.PI; barGroup.add(fridgeBackGlow);
            const drinkCols = ['#f43f5e', '#38bdf8', '#f59e0b', '#22c55e', '#a855f7'];
            [0.52, 0.98, 1.44].forEach((sy, sIdx) => {
                const shelf = new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.02, 0.36), psChromeMat);
                shelf.position.set(-0.75, sy, 0.32); barGroup.add(shelf);
                for (let b = 0; b < 5; b++) {
                    const can = new THREE.Mesh(
                        new THREE.CylinderGeometry(0.036, 0.036, 0.18, 10),
                        new THREE.MeshStandardMaterial({ color: drinkCols[(b + sIdx) % drinkCols.length], roughness: 0.2, metalness: 0.7 })
                    );
                    can.position.set(-1.02 + b * 0.135, sy + 0.10, 0.30);
                    barGroup.add(can);
                }
            });

            // Machine Espresso Pro 2 Groupes Chromée (La Marzocco) sur le comptoir marbre
            const espBody = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.46, 0.48), psChromeMat);
            espBody.position.set(0.45, 1.31, -0.04); espBody.castShadow = true; barGroup.add(espBody);
            const espPanel = new THREE.Mesh(new THREE.BoxGeometry(0.60, 0.16, 0.05), psSteelMat);
            espPanel.position.set(0.45, 1.43, -0.27); barGroup.add(espPanel);
            const espCup = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.036, 0.08, 14), new THREE.MeshStandardMaterial({ color: '#f8f6f0', roughness: 0.2 }));
            espCup.position.set(0.45, 1.13, -0.22); barGroup.add(espCup);

            // 2 Tabourets de Bar Haut de Gamme en Cuir Noir & Chrome devant le Bar VIP
            [-0.45, 0.55].forEach(bx => {
                const stPole = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, 0.72, 12), psChromeMat);
                stPole.position.set(bx, 0.36, -0.78); barGroup.add(stPole);
                const stBase = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.24, 0.03, 18), psChromeMat);
                stBase.position.set(bx, 0.015, -0.78); barGroup.add(stBase);
                const stSeat = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.18, 0.09, 18), psLeatherMat);
                stSeat.position.set(bx, 0.74, -0.78); barGroup.add(stSeat);
            });
            tagInteractable(barGroup, 'desk_mug_mesh');
            proStudioGroup.add(barGroup);

            // =========================================================================
            // 7. GRAND CANAPÉ PRODUCTEUR / CLIENT SWEET SPOT (FACE À LA CONSOLE SSL, MONITEURS & SKYLINE EST!)
            //    • Placé logiquement derrière l'ingénieur son, adossé au mur diffuseur QRD Ouest :
            //      - Section principale (sofa_mesh : Pause Chill dans le sweet spot d'écoute)
            //      - Large Méridienne / Chaise Longue intégrée au Sofa VIP (bed_mesh : Repos complet!)
            //    • Table Basse en Marbre Noir Veiné & Contrats Label
            // =========================================================================
            const psLoungeGroup = new THREE.Group();
            psLoungeGroup.position.set(-4.85, -1.0, 0.10);
            psLoungeGroup.rotation.y = -Math.PI / 2;

            // Tapis de salon noir anthracite sous l'espace VIP
            const vipRug = new THREE.Mesh(new THREE.BoxGeometry(4.6, 0.022, 2.8), psPodiumCarpetMat);
            vipRug.position.set(0.4, 0.011, -0.15); vipRug.receiveShadow = true; psLoungeGroup.add(vipRug);

            // Assise Principale du Grand Sofa VIP en Cuir Noir + Dossier Cognac (sofa_mesh!)
            const sofaMainWing = new THREE.Group();
            const sMainBase = new THREE.Mesh(new THREE.BoxGeometry(2.65, 0.44, 1.05), psLeatherMat);
            sMainBase.position.set(-0.35, 0.24, 0.65); sMainBase.castShadow = true; sMainBase.receiveShadow = true; sofaMainWing.add(sMainBase);
            const sMainBack = new THREE.Mesh(new THREE.BoxGeometry(2.65, 0.64, 0.24), psCognacLeatherMat);
            sMainBack.position.set(-0.35, 0.66, 1.06); sMainBack.castShadow = true; sofaMainWing.add(sMainBack);
            const sArmL = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.56, 1.08), psLeatherMat);
            sArmL.position.set(-1.62, 0.34, 0.65); sofaMainWing.add(sArmL);
            tagInteractable(sofaMainWing, 'sofa_mesh');
            psLoungeGroup.add(sofaMainWing);

            // Méridienne Lounge VIP Intégrée (Chaise Longue en Cuir Noir & Coussin Velours Cognac — interactif bed_mesh pour récupérer sans lit!)
            const vipChaiseWing = new THREE.Group();
            const sChaiseBase = new THREE.Mesh(new THREE.BoxGeometry(1.25, 0.44, 2.25), psLeatherMat);
            sChaiseBase.position.set(1.55, 0.24, 0.05); sChaiseBase.castShadow = true; sChaiseBase.receiveShadow = true; vipChaiseWing.add(sChaiseBase);
            const sChaiseBack = new THREE.Mesh(new THREE.BoxGeometry(1.25, 0.64, 0.24), psCognacLeatherMat);
            sChaiseBack.position.set(1.55, 0.66, 1.06); vipChaiseWing.add(sChaiseBack);
            const sChaiseBolster = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 1.05, 18), psCognacLeatherMat);
            sChaiseBolster.rotation.z = Math.PI / 2; sChaiseBolster.position.set(1.55, 0.55, 0.72); vipChaiseWing.add(sChaiseBolster);
            const sArmR = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.56, 2.25), psLeatherMat);
            sArmR.position.set(2.18, 0.34, 0.05); vipChaiseWing.add(sArmR);
            tagInteractable(vipChaiseWing, 'bed_mesh');
            psLoungeGroup.add(vipChaiseWing);

            // Table Basse en Marbre Noir Veiné & Laiton devant le Sofa VIP
            const psTableTop = new THREE.Mesh(new THREE.BoxGeometry(1.55, 0.06, 0.85), psMarbleMat);
            psTableTop.position.set(-0.30, 0.42, -0.35); psTableTop.castShadow = true; psTableTop.receiveShadow = true; psLoungeGroup.add(psTableTop);
            [[-0.65, -0.34], [0.65, -0.34], [-0.65, 0.34], [0.65, 0.34]].forEach(([tx, tz]) => {
                const tLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.014, 0.40, 8), psBrassMat);
                tLeg.position.set(-0.30 + tx, 0.20, -0.35 + tz); psLoungeGroup.add(tLeg);
            });
            proStudioGroup.add(psLoungeGroup);

            // 8. SKYLINE VERTIGINEUSE DU 42E ÉTAGE (Omniprésente droit devant la Console SSL à l'Est + Sud-Est!)
            const penthouseSkylineGroup = new THREE.Group();
            const spireMat = new THREE.MeshStandardMaterial({ color: '#111520', roughness: 0.38, metalness: 0.68 });
            const helipadTower = new THREE.Mesh(new THREE.BoxGeometry(14, 48, 14), spireMat);
            helipadTower.position.set(26, -27, 4); penthouseSkylineGroup.add(helipadTower);
            const helipadRing = new THREE.Mesh(new THREE.RingGeometry(3.4, 4.2, 28), new THREE.MeshBasicMaterial({ color: '#f59e0b', side: THREE.DoubleSide }));
            helipadRing.rotation.x = -Math.PI / 2; helipadRing.position.set(26, -2.95, 4); penthouseSkylineGroup.add(helipadRing);

            // Gratte-ciels massifs face à la baie vitrée Est (+X) & Sud-Est (+Z) pour un panorama 42e étage spectaculaire
            const highTowers = [
                [24, -14, -14, 13, 46, 13], [34, -4, -3, 16, 68, 16], [28, -16, 18, 14, 42, 14],
                [44,  2, -18, 18, 78, 18], [46,  0, 14, 17, 74, 17], [20, -22, -26, 12, 36, 12],
                [12, -20, 28, 14, 42, 12], [-8, -16, 34, 15, 52, 14], [56,  6,  -2, 22, 88, 22],
                [38, -10, 30, 15, 58, 15], [32, -8, -32, 15, 60, 15]
            ];
            highTowers.forEach(([tx, ty, tz, tw, th, td], idx) => {
                const matRef = (window.cityBuildingMats && window.cityBuildingMats.length)
                    ? window.cityBuildingMats[idx % window.cityBuildingMats.length]
                    : spireMat;
                const b = new THREE.Mesh(new THREE.BoxGeometry(tw, th, td), matRef);
                b.position.set(tx, ty, tz); penthouseSkylineGroup.add(b);
                if (th >= 48) {
                    const ant = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.14, 10, 6), psSteelMat);
                    ant.position.set(tx, ty + th / 2 + 5, tz); penthouseSkylineGroup.add(ant);
                    const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.35, 8, 8), new THREE.MeshBasicMaterial({ color: '#ef4444' }));
                    beacon.position.set(tx, ty + th / 2 + 10.1, tz); penthouseSkylineGroup.add(beacon);
                }
            });
            proStudioGroup.add(penthouseSkylineGroup);

            // 9. ÉCLAIRAGE CINÉMATIQUE + AUDIO-RÉACTIF DÉDIÉ AU STUDIO PRO 42e (PLUS LUMINEUX DE NUIT)
            const psPodiumKey = new THREE.PointLight('#ffd8a3', 5.4, 22, 1.3);
            psPodiumKey.position.set(3.4, 3.5, -0.1); proStudioGroup.add(psPodiumKey);
            const psCyberAccent = new THREE.PointLight('#b779ff', 3.6, 22, 1.35);
            psCyberAccent.position.set(1.2, 3.6, -1.8); proStudioGroup.add(psCyberAccent);
            const psLiveRoomLight = new THREE.PointLight('#ffc88a', 4.6, 18, 1.3);
            psLiveRoomLight.position.set(-2.5, 3.2, -4.2); proStudioGroup.add(psLiveRoomLight);
            const psVipBarLight = new THREE.PointLight('#fbbf24', 4.4, 18, 1.3);
            psVipBarLight.position.set(-2.2, 3.1, 4.6); proStudioGroup.add(psVipBarLight);
            const psStudioOverheadFill = new THREE.PointLight('#ffe8cc', 5.2, 26, 1.2);
            psStudioOverheadFill.position.set(0.4, 3.85, 0.3); proStudioGroup.add(psStudioOverheadFill);
            window._psPodiumKeyLight = psPodiumKey;
            window._psCyberAccentLight = psCyberAccent;
            window._psLiveRoomLight = psLiveRoomLight;
            window._psVipBarLight = psVipBarLight;
            window._psStudioOverheadFill = psStudioOverheadFill;

            // 10. GROUPE D'INVITÉS & ARTISTES SIGNÉS EN 3D (Salon VIP & Live Room)
            const proStudioGuestsGroup = new THREE.Group();
            proStudioGuestsGroup.name = 'ProStudioGuests3D';
            proStudioGroup.add(proStudioGuestsGroup);
            window.proStudioGuestsGroup = proStudioGuestsGroup;
            window.proStudioGuestActors = [];

            scene.add(proStudioGroup);
            window.proStudioGroup = proStudioGroup;
            window.bedroomWorldGroups = [
                archGroup, floor, wallLeft, wallRight, deskGroup, bedGroup, crateGroup,
                sofaGroup, sideTableGroup, rugGroup, tvGroup, rackGroup,
                acousticGroupL, acousticGroupR, synthGroup, guitarGroup, doorGroup
            ].filter(Boolean);
            // Groupes interactifs de la chambre uniquement (exclut archGroup/extérieur/murs/sol pour un raycast FPS 20x plus léger!)
            window.bedroomRaycastRoots = [
                deskGroup, bedGroup, crateGroup, doorGroup,
                sofaGroup, sideTableGroup, rugGroup, tvGroup, rackGroup,
                acousticGroupL, acousticGroupR, synthGroup, guitarGroup
            ].filter(Boolean);
            window._proStudioExteriorRef = exteriorGroup;
            window.activeStudioLocation = 'bedroom';

            // Animation live : VU-mètres SSL, Platine Vinyle, LEDs Modulaires, Ciel Étoilé, Invités 3D & Bass Check 18"!
            window.updateProStudioAnim = function(tSec) {
                if (window.activeStudioLocation !== 'pro_studio') return;
                if (window._proStudioTurntableDisc) {
                    window._proStudioTurntableDisc.rotation.y -= 0.024;
                }
                if (window.proModularLeds) {
                    for (let i = 0; i < window.proModularLeds.length; i++) {
                        const it = window.proModularLeds[i];
                        it.mesh.visible = (Math.sin(tSec * 5.2 + it.phase) > -0.15);
                    }
                }
                const nowMs = performance.now();
                const isBassChecking = nowMs < (window._bassCheckUntil || 0);
                // Scintillement doux du ciel étoilé fibre optique + Pulsation Audio-Réactive des lignes LED et néons!
                const beatPulse = isBassChecking
                    ? (0.5 + 0.5 * Math.sin(tSec * 22.0))
                    : (0.5 + 0.5 * Math.sin(tSec * 3.8) * Math.cos(tSec * 1.9));
                if (window.proStudioStarMat) {
                    window.proStudioStarMat.opacity = 0.72 + 0.24 * Math.sin(tSec * 2.1);
                }
                if (window.proStudioAudioLedMats && window.proStudioAudioLedMats.length === 3) {
                    const boost = isBassChecking ? 1.45 : 1.0;
                    window.proStudioAudioLedMats[0].emissiveIntensity = (1.25 + beatPulse * 0.65) * boost; // Ambre
                    window.proStudioAudioLedMats[1].emissiveIntensity = (1.20 + (1.0 - beatPulse) * 0.75) * boost; // Cyber-Violet
                    window.proStudioAudioLedMats[2].emissiveIntensity = (1.10 + Math.sin(tSec * 2.6) * 0.35) * boost; // Bleu Nuit
                }
                if (window._psCyberAccentLight) {
                    window._psCyberAccentLight.intensity = (1.85 + beatPulse * 0.85) * (isBassChecking ? 1.6 : 1.0);
                }
                if (window.proStudioOnAirMat) {
                    const isHot = window.deskMicState && nowMs < (window.deskMicState.activeUntil || 0);
                    window.proStudioOnAirMat.emissiveIntensity = isHot ? (1.8 + Math.sin(tSec * 8) * 0.4) : (0.55 + beatPulse * 0.25);
                }
                // Animation vivante des Artistes / Invités 3D du Label dans le Salon VIP & la Live Room!
                if (window.proStudioGuestActors && window.proStudioGuestActors.length) {
                    for (let g = 0; g < window.proStudioGuestActors.length; g++) {
                        const act = window.proStudioGuestActors[g];
                        if (!act || !act.root) continue;
                        const ph = g * 1.7;
                        act.root.rotation.y = act.baseYaw + Math.sin(tSec * 0.9 + ph) * 0.05;
                        act.root.position.y = act.baseY + Math.abs(Math.sin(tSec * (isBassChecking ? 8.5 : 3.2) + ph)) * (isBassChecking ? 0.025 : 0.008);
                        if (typeof window.updateAvatarIdleAnimation === 'function') {
                            window.updateAvatarIdleAnimation(act.root, tSec, g + 1);
                        }
                    }
                }
                if (window._proVuCtx && nowMs - (window._proVuLastTs || 0) > 75) {
                    window._proVuLastTs = nowMs;
                    const ctx = window._proVuCtx;
                    ctx.fillStyle = '#0e0d0c'; ctx.fillRect(0, 0, 1024, 128);
                    for (let m = 0; m < 16; m++) {
                        const mx = 10 + m * 63;
                        ctx.fillStyle = '#f5d28a'; ctx.fillRect(mx, 14, 54, 100);
                        ctx.strokeStyle = '#332210'; ctx.lineWidth = 2;
                        ctx.beginPath(); ctx.arc(mx + 27, 108, 36, Math.PI * 1.18, Math.PI * 1.82); ctx.stroke();
                        ctx.strokeStyle = '#dc2626';
                        ctx.beginPath(); ctx.arc(mx + 27, 108, 36, Math.PI * 1.66, Math.PI * 1.82); ctx.stroke();
                        const vuSwing = isBassChecking ? 0.58 : 0.52;
                        const ang = Math.PI * (1.22 + vuSwing * Math.abs(Math.sin(tSec * (isBassChecking ? 9.5 : 4.2) + m * 0.65) * Math.cos(tSec * 1.8 + m * 0.3)));
                        ctx.strokeStyle = '#141210'; ctx.lineWidth = 2.5;
                        ctx.beginPath(); ctx.moveTo(mx + 27, 108);
                        ctx.lineTo(mx + 27 + Math.cos(ang) * 40, 108 + Math.sin(ang) * 40); ctx.stroke();
                    }
                    window._proVuTex.needsUpdate = true;
                }
            };

            // Contrôleur de bascule Chambre <-> Studio Pro 42e Étage
            window.applyStudioLocation = function(loc) {
                const isCity = (loc === 'city');
                const isPro = (!isCity && loc === 'pro_studio');
                window.activeStudioLocation = isCity ? 'city' : (isPro ? 'pro_studio' : 'bedroom');
                if (typeof state !== 'undefined' && state && !isCity) state.activeLocation = window.activeStudioLocation;

                if (window.proStudioGroup) window.proStudioGroup.visible = isPro;
                if (isCity) {
                    if (window.bedroomWorldGroups) {
                        window.bedroomWorldGroups.forEach(g => { if (g) g.visible = false; });
                    }
                    if (typeof window._cityBridge?.dispatchLocation === 'function') {
                        window._cityBridge.dispatchLocation('city');
                    }
                    window.syncStudioSwitchButtons && window.syncStudioSwitchButtons();
                    return;
                }
                if (typeof window._cityBridge?.dispatchLocation === 'function') {
                    window._cityBridge.dispatchLocation(window.activeStudioLocation);
                }
                if (window.bedroomWorldGroups) {
                    window.bedroomWorldGroups.forEach(g => {
                        if (!g) return;
                        if (isPro) {
                            g.visible = false;
                        } else {
                            // Restaure la visibilité de base de la chambre (les meubles Studio+ seront resynchronisés juste après)
                            if (g === archGroup || g === floor || g === wallLeft || g === wallRight || g === deskGroup || g === bedGroup || g === crateGroup || g === doorGroup) {
                                g.visible = true;
                            }
                        }
                    });
                }
                // Conserve le ciel 360° visible dans les deux lieux (on le détache dans scene si nécessaire)
                if (window.skyDomeMesh && window.skyDomeMesh.parent !== scene) {
                    scene.add(window.skyDomeMesh);
                }
                if (window.skyDomeMesh) window.skyDomeMesh.visible = true;

                if (!isPro) {
                    if (typeof syncFurniture3DVisibility === 'function') { try { syncFurniture3DVisibility(); } catch(e) {} }
                    if (typeof window.applyRoomEvolutionTier === 'function' && typeof state !== 'undefined' && state) {
                        window.applyRoomEvolutionTier(state.roomTier || window.getTargetRoomTier(state), false);
                    }
                } else {
                    // Ambiance Dark & Cinématique dans le Studio Pro (0.45x sur la lumière ambiante de chambre!)
                    window.roomTierLightMult = 0.45;
                    window.currentRoomVisualTier = 3; // Active le DAW Mastering Pro + Analyseur FFT sur les 2 écrans!
                    window._pcLiveLastTs = 0;
                    if (typeof window.updateLivePcScreen === 'function') window.updateLivePcScreen(performance.now() * 0.001);
                    if (typeof window.syncProStudioGuests3D === 'function') window.syncProStudioGuests3D();
                }

                // Synchronise l'édition ABLE_OS PRO 42 dans l'ordinateur
                const edLbl = document.getElementById('os-edition-label');
                const dawHdr = document.querySelector('#app-daw .window-header span.font-mono');
                if (edLbl) edLbl.textContent = isPro ? 'ABLE_OS PRO 42 · SSL' : 'ABLE_OS 11';
                if (dawHdr) dawHdr.textContent = isPro ? 'AbleStudio Pro 42 · SSL Mastering Suite' : 'AbleStudio Pro 11';

                // Met à jour les boutons HUD & Porte
                window.syncStudioSwitchButtons && window.syncStudioSwitchButtons();
            };

            window.syncStudioSwitchButtons = function() {
                const st = typeof state !== 'undefined' ? state : null;
                const unlocked = Boolean(st && st.studioUnlocked);
                const isPro = window.activeStudioLocation === 'pro_studio';
                const hudBtn = document.getElementById('btn-switch-studio-room');
                const hudLbl = document.getElementById('btn-switch-studio-label');
                const doorBtn = document.getElementById('door-elevator-btn');
                const doorLbl = document.getElementById('door-elevator-label');
                if (hudBtn) hudBtn.classList.toggle('hidden', !unlocked);
                if (hudLbl) hudLbl.textContent = isPro ? '🏠 RETOUR CHAMBRE' : '🏢 STUDIO PRO 42e';
                if (doorBtn) doorBtn.classList.toggle('hidden', !unlocked);
                if (doorLbl) doorLbl.textContent = isPro
                    ? '🏠 Prendre l’ascenseur → Retourner à la Chambre (4e Étage)'
                    : '🏢 Prendre l’ascenseur → Studio Pro (42e Étage)';
            };

            // Animation Cinématique Couloir + Ascenseur 42e Étage!
            window.travelToStudioLocation = function(forcedTarget) {
                if (window._elevatorBusy) return;
                const targetLoc = forcedTarget || (window.activeStudioLocation === 'pro_studio' ? 'bedroom' : 'pro_studio');
                const goingUp = (targetLoc === 'pro_studio');
                window._elevatorBusy = true;
                if (typeof window.exitFpsPointerLock === 'function') window.exitFpsPointerLock();

                // 1. Ouvre la porte physique vers le couloir
                window.doorTargetAngle = 0.72;
                if (window.proStudioDoorPivot) window._proDoorTarget = 0.72;
                try { if (typeof playTone === 'function') playTone(260, 'sine', 0.14, 0.04); } catch(e) {}

                const ov = document.getElementById('elevator-transition-overlay');
                const floorEl = document.getElementById('elev-floor-num');
                const titleEl = document.getElementById('elev-dest-title');
                const subEl = document.getElementById('elev-dest-sub');

                if (titleEl) titleEl.textContent = goingUp ? 'STUDIO PRO · 42e ÉTAGE' : 'CHAMBRE · 4e ÉTAGE';
                if (subEl) subEl.textContent = goingUp ? 'MONTÉE VERS LE 42e ÉTAGE…' : 'DESCENTE VERS LE 4e ÉTAGE…';

                // 2. Fermeture des portes d'ascenseur en inox + défilement des étages
                setTimeout(() => {
                    if (ov) { ov.classList.add('active'); requestAnimationFrame(() => ov.classList.add('closed')); }
                    let curF = goingUp ? 4 : 42;
                    const endF = goingUp ? 42 : 4;
                    if (floorEl) floorEl.textContent = curF + 'e';

                    const stepTimer = setInterval(() => {
                        curF += goingUp ? 3 : -3;
                        if ((goingUp && curF >= endF) || (!goingUp && curF <= endF)) {
                            curF = endF;
                            clearInterval(stepTimer);
                            if (floorEl) floorEl.textContent = curF + 'e';
                            if (subEl) subEl.textContent = goingUp ? 'BIENVENUE AU 42e ÉTAGE' : 'ARRIVÉE AU 4e ÉTAGE';
                            // Ding d'ascenseur cristallin!
                            try {
                                if (typeof playTone === 'function') {
                                    playTone(1046.5, 'sine', 0.35, 0.06);
                                    setTimeout(() => playTone(1318.5, 'sine', 0.45, 0.055), 110);
                                }
                            } catch(e) {}

                            // 3. Bascule de la scène 3D + Repositionnement du joueur face à l'Estrade Control Room & Skyline Est (+X)!
                            window.applyStudioLocation(targetLoc);
                            if (typeof currentRoomAvatar !== 'undefined' && currentRoomAvatar) {
                                if (goingUp) {
                                    currentRoomAvatar.position.set(-0.9, -1.0, 0.1);
                                    if (window.fps) { window.fps.yaw = -1.52; window.fps.pitch = -0.02; }
                                } else {
                                    currentRoomAvatar.position.set(0.2, -1.0, 2.4);
                                    if (window.fps) { window.fps.yaw = 0.42; window.fps.pitch = -0.04; }
                                }
                            }
                            window.doorTargetAngle = 0;
                            window._proDoorTarget = 0;
                            if (typeof saveGame === 'function') saveGame();

                            // 4. Ouverture des portes d'ascenseur sur le nouveau lieu!
                            setTimeout(() => {
                                if (ov) ov.classList.remove('closed');
                                setTimeout(() => {
                                    if (ov) ov.classList.remove('active');
                                    window._elevatorBusy = false;
                                }, 740);
                            }, 420);
                        } else {
                            if (floorEl) floorEl.textContent = curF + 'e';
                            try { if (typeof playTone === 'function') playTone(goingUp ? 420 + curF * 6 : 660 - (42 - curF) * 5, 'sine', 0.035, 0.016); } catch(e) {}
                        }
                    }, 75);
                }, 420);
            };


            scene.add(archGroup);

            // Met à jour originalMaterial pour que syncFurniture3DVisibility préserve nos matériaux PBR
            scene.traverse(child => {
                if (child.isMesh && child.material && !child.userData.mysticMaterial) {
                    child.userData.originalMaterial = child.material;
                }
            });
    Object.assign(globalThis, { proStudioGroup, proStudioGuestsGroup });
}

            window.syncProStudioGuests3D = function(overrideState) {
                const grp = window.proStudioGuestsGroup;
                if (!grp || typeof createAvatarGroup !== 'function') return;
                while (grp.children.length > 0) grp.remove(grp.children[0]);
                window.proStudioGuestActors = [];

                const st = overrideState || (typeof state !== 'undefined' ? state : null);
                const signedIds = (st && Array.isArray(st.signedArtists)) ? st.signedArtists : [];
                const slots = [
                    { x: -3.25, y: -1.0, z: -0.65, yaw: 1.55 }, // Près du Canapé Producteur & Table Marbre (face Console SSL)
                    { x: -1.85, y: -1.0, z: 3.75, yaw: 2.85 },  // Près du Bar VIP & Hall of Fame
                    { x: -0.25, y: -1.0, z: -3.25, yaw: 0.25 }, // Dans la Live Room
                    { x: 3.25, y: -1.0, z: 4.25, yaw: -2.45 }   // Face à la baie panoramique Sud-Est (dégagée!)
                ];

                signedIds.slice(0, 4).forEach((artId, idx) => {
                    const meta = LABEL_ARTIST_ROSTER.find(a => a.id === artId) || LABEL_ARTIST_ROSTER[idx % LABEL_ARTIST_ROSTER.length];
                    const slot = slots[idx % slots.length];
                    const actor = createAvatarGroup(meta.avatarStyle);
                    actor.scale.set(1.55, 1.55, 1.55);
                    actor.position.set(slot.x, slot.y, slot.z);
                    actor.rotation.y = slot.yaw;
                    actor.traverse(c => {
                        if (c.isMesh) {
                            c.name = 'artist_npc_mesh';
                            c.userData.artistId = meta.id;
                            c.userData.artistName = meta.name;
                            c.userData.artistQuote = meta.quote;
                        }
                    });
                    grp.add(actor);
                    window.proStudioGuestActors.push({ root: actor, baseY: slot.y, baseYaw: slot.yaw, meta: meta });
                });
            };

            window.interactWithStudioGuest3D = function(mesh) {
                const name = (mesh && mesh.userData && mesh.userData.artistName) || 'Artiste du Label';
                const quote = (mesh && mesh.userData && mesh.userData.artistQuote) || "Le 42e étage tourne à plein régime boss !";
                try { if (typeof playTone === 'function') { playTone(540, 'sine', 0.08, 0.05); setTimeout(() => playTone(720, 'sine', 0.1, 0.045), 90); } } catch(e) {}
                const nowM = typeof getTotalMins === 'function' ? getTotalMins() : 0;
                if (nowM - (window._lastGuestTalkMins || -999) >= 90 && typeof state !== 'undefined' && state) {
                    window._lastGuestTalkMins = nowM;
                    state.inspi = Math.min(100, (Number(state.inspi) || 0) + 6);
                    if (typeof window.updateHype === 'function') window.updateHype(4);
                    if (typeof updateHUD === 'function') updateHUD();
                    showToast(`🎤 ${name} : « ${quote} » (+6% INSPI, +4% HYPE)`, "success");
                } else {
                    showToast(`🎤 ${name} : « ${quote} »`, "info");
                }
            };

            // --- LOGIQUE EMPIRE OS : LABEL HQ, ROYALTIES PASSIVES, SYNC & VAULT ---

// --- Global Bridge & ES Exports ---
Object.assign(globalThis, { initProStudio42 });
export { initProStudio42 };
