import { THREE } from '../core/libs.js';

function initBedroomScene() {
        // Room Floor
        const floorGeo = new THREE.PlaneGeometry(10, 10);
        const floorMat = new THREE.MeshStandardMaterial({ color: '#8a6242', roughness: 0.9, metalness: 0.1 });
        const floor = new THREE.Mesh(floorGeo, floorMat);
        floor.name = 'floor_mesh'; 
        floor.rotation.x = -Math.PI / 2;
        floor.position.y = -1;
        floor.receiveShadow = true;
        const floorEdges = new THREE.EdgesGeometry(floorGeo);
        const floorLines = new THREE.LineSegments(floorEdges, new THREE.LineBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.4 }));
        floor.add(floorLines);
        scene.add(floor);

        const wallMat = new THREE.MeshStandardMaterial({ color: '#b9bec8', roughness: 0.9 });
        
        // Mur Gauche (Nord) — reçoit la lumière PBR & AO, sans ombres portées dures
        const wallLeftGeo = new THREE.BoxGeometry(10, 5, 0.01);
        const wallLeft = new THREE.Mesh(wallLeftGeo, wallMat);
        wallLeft.position.set(0, 1.5, -5); 
        wallLeft.receiveShadow = false;
        const wallLeftEdges = new THREE.EdgesGeometry(wallLeftGeo);
        const wallLeftLines = new THREE.LineSegments(wallLeftEdges, new THREE.LineBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.4 }));
        wallLeft.add(wallLeftLines);
        scene.add(wallLeft);

        // Mur Droit (Ouest)
        const wallRightGeo = new THREE.BoxGeometry(0.01, 5, 10);
        const wallRight = new THREE.Mesh(wallRightGeo, wallMat);
        wallRight.position.set(-5, 1.5, 0); 
        wallRight.receiveShadow = false;
        const wallRightEdges = new THREE.EdgesGeometry(wallRightGeo);
        const wallRightLines = new THREE.LineSegments(wallRightEdges, new THREE.LineBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.4 }));
        wallRight.add(wallRightLines);
        scene.add(wallRight);

        // LE BUREAU & SET-UP
        const deskGroup = new THREE.Group();
        deskGroup.position.set(-2.2, 0, -3.5);

        const deskTopMat = new THREE.MeshStandardMaterial({ color: '#aeb4bf', roughness: 0.7, metalness: 0.1 });
        const deskTop = new THREE.Mesh(new THREE.BoxGeometry(4.5, 0.1, 2.2), deskTopMat);
        deskTop.position.set(0, 0.7, 0); deskTop.castShadow = true; deskTop.receiveShadow = true; deskTop.name = 'pc_mesh';
        deskGroup.add(deskTop);

        const legMat = new THREE.MeshStandardMaterial({ color: '#5f6673', roughness: 0.4, metalness: 0.8 });
        const legGeo = new THREE.BoxGeometry(0.1, 1.7, 0.1);
        [[-2.1,-0.15,-0.9],[2.1,-0.15,-0.9],[-2.1,-0.15,0.9],[2.1,-0.15,0.9]].forEach(pos => {
            const leg = new THREE.Mesh(legGeo, legMat);
            leg.position.set(...pos); leg.castShadow = true; leg.receiveShadow = true; 
            deskGroup.add(leg);
        });

        const stand = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.2, 0.15), legMat);
        stand.position.set(0, 0.8, -0.6); stand.castShadow = true; stand.receiveShadow = true; stand.name = 'pc_mesh'; 
        deskGroup.add(stand);

        const pcFrameMat = new THREE.MeshStandardMaterial({ color: '#d9dce3', roughness: 0.2, metalness: 0.5 });
        const pcFrame = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.85, 0.05), pcFrameMat);
        pcFrame.position.set(0, 1.25, -0.55); pcFrame.castShadow = true; pcFrame.name = 'pc_mesh';

        const pcScreenMat = new THREE.MeshStandardMaterial({ color: '#00e5ff', emissive: '#818cf8', emissiveIntensity: 0.8 });
        const pcMesh = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 0.75), pcScreenMat);
        pcMesh.position.set(0, 0, 0.026); pcMesh.name = 'pc_mesh'; pcFrame.add(pcMesh);
        deskGroup.add(pcFrame);

        const speakerMat = new THREE.MeshStandardMaterial({ color: '#a3a8b5', roughness: 0.8, metalness: 0.2 });
    const speakerFrontMat = new THREE.MeshStandardMaterial({ color: '#1a1a1f', roughness: 0.9 });
    const wooferMat = new THREE.MeshStandardMaterial({ color: '#2a2a2f', roughness: 0.9 });
    const wooferConeMat = new THREE.MeshStandardMaterial({ color: '#111114', roughness: 1.0 });
    const tweeterMat = new THREE.MeshStandardMaterial({ color: '#888899', roughness: 0.3, metalness: 0.6 });
    const portMat = new THREE.MeshStandardMaterial({ color: '#050505', roughness: 0.8 });

    function buildSpeaker(xPos, rotY) {
        const spkGroup = new THREE.Group();
        spkGroup.position.set(xPos, 1.05, -0.4);
        spkGroup.rotation.y = rotY; // Rotation pour orienter le haut-parleur
        spkGroup.name = 'speaker_mesh'; // Nom unique pour l'interaction

        // Corps principal — plus grand
        const bodyGeo = new THREE.BoxGeometry(0.55, 0.82, 0.52);
        const body = new THREE.Mesh(bodyGeo, speakerMat);
        body.castShadow = true;
        body.name = 'speaker_mesh';
        const bodyEdges = new THREE.EdgesGeometry(bodyGeo);
        body.add(new THREE.LineSegments(bodyEdges, new THREE.LineBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.3 })));
        spkGroup.add(body);

        // Face avant légèrement en relief
        const faceGeo = new THREE.BoxGeometry(0.52, 0.79, 0.04);
        const face = new THREE.Mesh(faceGeo, speakerFrontMat);
        face.position.set(0, 0, 0.28);
        face.name = 'speaker_mesh';
        spkGroup.add(face);

        // Woofer (grand haut-parleur bas)
        const wooferRingGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.03, 24);
        wooferRingGeo.rotateX(Math.PI / 2);
        const wooferRing = new THREE.Mesh(wooferRingGeo, wooferMat);
        wooferRing.position.set(0, -0.12, 0.31);
        spkGroup.add(wooferRing);

        const wooferConeGeo = new THREE.CylinderGeometry(0.04, 0.15, 0.04, 24);
        wooferConeGeo.rotateX(Math.PI / 2);
        const wooferCone = new THREE.Mesh(wooferConeGeo, wooferConeMat);
        wooferCone.position.set(0, -0.12, 0.32);
        spkGroup.add(wooferCone);

        // Tweeter (petit haut-parleur aigu)
        const tweeterGeo = new THREE.CylinderGeometry(0.055, 0.055, 0.025, 16);
        tweeterGeo.rotateX(Math.PI / 2);
        const tweeter = new THREE.Mesh(tweeterGeo, wooferMat);
        tweeter.position.set(0, 0.22, 0.31);
        spkGroup.add(tweeter);

        const tweeterDomeGeo = new THREE.SphereGeometry(0.035, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2);
        tweeterDomeGeo.rotateX(Math.PI / 2);
        const tweeterDome = new THREE.Mesh(tweeterDomeGeo, tweeterMat);
        tweeterDome.position.set(0, 0.22, 0.325);
        spkGroup.add(tweeterDome);

        // Évent bass reflex (port rectangulaire en bas)
        const portGeo = new THREE.BoxGeometry(0.22, 0.045, 0.03);
        const port = new THREE.Mesh(portGeo, portMat);
        port.position.set(0, -0.33, 0.30);
        spkGroup.add(port);

        // LED de power (petit point lumineux)
        const ledMat = new THREE.MeshStandardMaterial({ color: '#34d399', emissive: '#34d399', emissiveIntensity: 1.2 });
        const ledGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.01, 8);
        ledGeo.rotateX(Math.PI / 2);
        const led = new THREE.Mesh(ledGeo, ledMat);
        led.position.set(0.18, -0.35, 0.30);
        spkGroup.add(led);

        return spkGroup;
    }

    const speakerL = buildSpeaker(-1.7, Math.PI / 12);
    deskGroup.add(speakerL);

    const speakerR = buildSpeaker(1.7, -Math.PI / 12);
    deskGroup.add(speakerR);

        const kbdBaseMat = new THREE.MeshStandardMaterial({ color: '#e8eaf0', roughness: 0.3, metalness: 0.2 });
        const kbdBase = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.05, 0.6), kbdBaseMat);
        kbdBase.position.set(0, 0.75, 0.4); kbdBase.rotation.x = -Math.PI / 40; kbdBase.castShadow = true; kbdBase.receiveShadow = true; kbdBase.name = 'pc_mesh'; 
        deskGroup.add(kbdBase);

        const keyGeo = new THREE.BoxGeometry(0.08, 0.03, 0.08);
        const keyMat = new THREE.MeshStandardMaterial({ color: '#d1d5db' });
        for (let x = -0.7; x <= 0.7; x += 0.12) for (let z = -0.22; z <= 0.22; z += 0.12) {
            const key = new THREE.Mesh(keyGeo, keyMat); key.position.set(x, 0.03, z); kbdBase.add(key);
        }

        const mouseGroup = new THREE.Group(); mouseGroup.position.set(1.2, 0.73, 0.4); 
        deskGroup.add(mouseGroup);
        const mouseBodyGeo = new THREE.SphereGeometry(0.15, 16, 16); mouseBodyGeo.scale(1, 0.6, 1.5);
        const mouseMat = new THREE.MeshStandardMaterial({ color: '#e8eaf0', roughness: 0.4, metalness: 0.2 });
        const mouseBody = new THREE.Mesh(mouseBodyGeo, mouseMat); mouseBody.castShadow = true; mouseBody.name = 'pc_mesh'; mouseGroup.add(mouseBody);
        const wheelMat = new THREE.MeshStandardMaterial({ color: '#818cf8' });
        const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.05, 12), wheelMat);
        wheel.rotation.z = Math.PI / 2; wheel.position.set(0, 0.06, -0.05); mouseGroup.add(wheel);
        const split = new THREE.Mesh(new THREE.BoxGeometry(0.005, 0.02, 0.15), new THREE.MeshStandardMaterial({ color: '#000' }));
        split.position.set(0, 0.08, -0.1); mouseGroup.add(split);

        scene.add(deskGroup);

        
        
        // BEDR
        const bedGroup = new THREE.Group();
        bedGroup.position.set(3.8, -0.8, -2.9);

        const frameGeo = new THREE.BoxGeometry(2.4, 0.4, 4.2);
        const frameMat = new THREE.MeshStandardMaterial({ color: '#262626', roughness: 0.8 });
        const frame = new THREE.Mesh(frameGeo, frameMat);
        frame.castShadow = true;
        frame.receiveShadow = true;
        frame.name = 'bed_mesh'; // Assignation pour le Raycaster
        
        const bedFrameEdges = new THREE.EdgesGeometry(frameGeo);
        const bedFrameLines = new THREE.LineSegments(bedFrameEdges, new THREE.LineBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.4 }));
        frame.add(bedFrameLines);
        bedGroup.add(frame);

        const mattressGeo = new THREE.BoxGeometry(2.2, 0.3, 4.0);
        const mattressMat = new THREE.MeshStandardMaterial({ color: '#e7e5e4', roughness: 0.9 });
        const mattress = new THREE.Mesh(mattressGeo, mattressMat);
        mattress.position.set(0, 0.35, 0);
        mattress.castShadow = true;
        mattress.receiveShadow = true;
        mattress.name = 'bed_mesh'; // Assignation pour le Raycaster
        bedGroup.add(mattress);

        const blanketGeo = new THREE.BoxGeometry(2.4, 0.38, 3.2);
        const blanketMat = new THREE.MeshStandardMaterial({ color: '#243c5a', roughness: 0.9 });
        const blanket = new THREE.Mesh(blanketGeo, blanketMat);
        blanket.position.set(0, 0.36, 0.45);
        blanket.castShadow = true;
        blanket.receiveShadow = true;
        blanket.name = 'bed_mesh'; // Assignation pour le Raycaster
        bedGroup.add(blanket);

        const pillowGeo = new THREE.BoxGeometry(0.8, 0.15, 0.5);
        const pillowMat = new THREE.MeshStandardMaterial({ color: '#e2e8f0', roughness: 0.9 });
        
        const pillow1 = new THREE.Mesh(pillowGeo, pillowMat);
        pillow1.position.set(-0.55, 0.55, -1.5);
        pillow1.rotation.x = Math.PI / 12;
        pillow1.castShadow = true;
        pillow1.name = 'bed_mesh'; // Assignation pour le Raycaster
        
        const pillow2 = new THREE.Mesh(pillowGeo, pillowMat);
        pillow2.position.set(0.55, 0.55, -1.5);
        pillow2.rotation.x = Math.PI / 12;
        pillow2.castShadow = true;
        pillow2.name = 'bed_mesh'; // Assignation pour le Raycaster
        
        bedGroup.add(pillow1, pillow2);
        scene.add(bedGroup);



                       // ==========================================
        // BAC DE DISQUAIRE (ACHIEVEMENTS) - VERSION XXL ISOMÉTRIQUE
        // ==========================================
        const crateGroup = new THREE.Group();
        crateGroup.visible = true; // Unlocked by default
        // Position ajustée pour qu'il soit contre le lit
        crateGroup.position.set(3.8, -1, 0.5); 
        
        // Rotation isométrique : on l'aligne sur l'angle de 45°
        crateGroup.rotation.y = 0; 
        
        // On double la taille globale pour qu'il soit bien visible
        crateGroup.scale.set(1.8, 1.8, 1.8);

        const crateMat = new THREE.MeshStandardMaterial({ color: '#3d2b1f', roughness: 0.9 });
        const crateEdgeMat = new THREE.LineBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.4 });

        // Dimensions augmentées pour le volume
        const crateBase = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.08, 0.7), crateMat);
        crateBase.position.y = 0.04;
        
        const crateSideL = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.6, 0.7), crateMat);
        crateSideL.position.set(-0.41, 0.3, 0);
        
        const crateSideR = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.6, 0.7), crateMat);
        crateSideR.position.set(0.41, 0.3, 0);

        const crateBack = new THREE.Mesh(new THREE.BoxGeometry(0.74, 0.6, 0.08), crateMat);
        crateBack.position.set(0, 0.3, -0.31);

        const crateFront = new THREE.Mesh(new THREE.BoxGeometry(0.74, 0.25, 0.08), crateMat);
        crateFront.position.set(0, 0.125, 0.31);

        [crateBase, crateSideL, crateSideR, crateBack, crateFront].forEach(mesh => {
            mesh.name = 'achievements_board_mesh'; // Nom d'interaction pour le Raycaster et Proximité
            mesh.castShadow = true; mesh.receiveShadow = true;
            mesh.add(new THREE.LineSegments(new THREE.EdgesGeometry(mesh.geometry), crateEdgeMat));
            crateGroup.add(mesh);
        });

        const vinylsContainer = new THREE.Group();
        vinylsContainer.position.set(0, 0.08, -0.25);
        crateGroup.add(vinylsContainer);
        window.vinylsContainer = vinylsContainer;

        scene.add(crateGroup);

        // Vinyl art sources (kept for compatibility but not used for external loads)
        window.vinylArt = window.vinylArt || [];
        // Cache for generated CanvasTextures so we don't recreate every frame
        window.vinylGeneratedTextures = window.vinylGeneratedTextures || {};
        // Fallback color for covers
        window.vinylFallbackColor = window.vinylFallbackColor || '#0f172a';

        // Create a Canvas-based vinyl cover texture (unique, random aesthetic)
        window.createVinylCoverTexture = function(key, size = 1024) {
            try {
                const cacheKey = String(key || 'default');
                if (window.vinylGeneratedTextures[cacheKey]) return window.vinylGeneratedTextures[cacheKey];
                const canvas = document.createElement('canvas');
                canvas.width = size; canvas.height = size;
                const ctx = canvas.getContext('2d');
                // Random palette
                function randInt(a,b){return a+Math.floor(Math.random()*(b-a+1));}
                function randHex(){ return '#' + Math.floor(Math.random()*0xFFFFFF).toString(16).padStart(6,'0'); }
                const base = randHex();
                const accent = randHex();
                const accent2 = randHex();

                // Background gradient
                const g = ctx.createLinearGradient(0,0,size,size);
                g.addColorStop(0, base);
                g.addColorStop(1, accent);
                ctx.fillStyle = g; ctx.fillRect(0,0,size,size);

                // Add soft radial vignette
                const vg = ctx.createRadialGradient(size*0.6, size*0.35, size*0.1, size*0.5, size*0.5, size*0.9);
                vg.addColorStop(0, 'rgba(255,255,255,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.35)');
                ctx.fillStyle = vg; ctx.fillRect(0,0,size,size);

                // Draw geometric layers
                const shapes = randInt(3,7);
                for (let s=0; s<shapes; s++){
                    const type = Math.random();
                    ctx.save();
                    const cx = Math.random()*size, cy = Math.random()*size;
                    const w = randInt(size*0.12, size*0.6), h = randInt(size*0.08, size*0.6);
                    ctx.translate(cx,cy);
                    ctx.rotate((Math.random()-0.5)*Math.PI);
                    const localGrad = ctx.createLinearGradient(-w,-h,w,h);
                    localGrad.addColorStop(0, accent2); localGrad.addColorStop(1, 'rgba(255,255,255,0.06)');
                    ctx.fillStyle = localGrad;
                    ctx.globalAlpha = 0.85 - Math.random()*0.5;
                    if (type < 0.4) {
                        // circle
                        ctx.beginPath(); ctx.arc(0,0,Math.max(w,h)/2,0,Math.PI*2); ctx.fill();
                    } else if (type < 0.75) {
                        // rounded rect
                        const rx = -w/2, ry = -h/2, rw = w, rh = h, r = Math.min(40, Math.min(w,h)/6);
                        roundRect(ctx, rx, ry, rw, rh, r); ctx.fill();
                    } else {
                        // triangle
                        ctx.beginPath(); ctx.moveTo(0,-h/2); ctx.lineTo(w/2,h/2); ctx.lineTo(-w/2,h/2); ctx.closePath(); ctx.fill();
                    }
                    ctx.restore();
                }

                // Add radial center label (simulate record hole area)
                ctx.save();
                ctx.beginPath(); ctx.arc(size/2, size/2, size*0.12, 0, Math.PI*2); ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fill();
                ctx.beginPath(); ctx.arc(size/2, size/2, size*0.04, 0, Math.PI*2); ctx.fillStyle = '#111'; ctx.fill();
                ctx.restore();

                // subtle noise overlay
                const imgData = ctx.getImageData(0,0,size,size);
                for (let i=0;i<imgData.data.length;i+=4){
                    const v = (Math.random()-0.5)*6; imgData.data[i]+=v; imgData.data[i+1]+=v; imgData.data[i+2]+=v;
                }
                ctx.putImageData(imgData,0,0);

                // helper: rounded rect
                function roundRect(ctx,x,y,w,h,r){ ctx.beginPath(); ctx.moveTo(x+r,y); ctx.arcTo(x+w,y,x+w,y+h,r); ctx.arcTo(x+w,y+h,x,y+h,r); ctx.arcTo(x,y+h,x,y,r); ctx.arcTo(x,y,x+w,y,r); ctx.closePath(); }

                const tex = new THREE.CanvasTexture(canvas);
                try { tex.encoding = THREE.sRGBEncoding; } catch(e){}
                tex.flipY = false;
                tex.needsUpdate = true;
                window.vinylGeneratedTextures[cacheKey] = tex;
                return tex;
            } catch(err) {
                console.warn('createVinylCoverTexture failed', err);
                return null;
            }
        };

        window.updateVinylCrate = function() {
            if (!window.vinylsContainer) return;
            while(window.vinylsContainer.children.length > 0){ 
                window.vinylsContainer.remove(window.vinylsContainer.children[0]); 
            }
            const trackCount = (typeof state !== 'undefined' && state.stats) ? state.stats.tracks : 0;
            if (trackCount === 0) return;
            
            const displayCount = Math.min(30, trackCount); // Un peu plus de capacité
            const vinylSideMat = new THREE.MeshStandardMaterial({ color: '#111827', roughness: 0.6, metalness: 0.1 }); 
            const vinylBackMat = new THREE.MeshStandardMaterial({ color: '#0b0b0d', roughness: 0.6 });
            const vinylGeo = new THREE.BoxGeometry(0.65, 0.65, 0.025);

            for (let i = 0; i < displayCount; i++) {
                // choose a random art
                const artList = window.vinylArt || [];
                const url = artList.length ? artList[Math.floor(Math.random() * artList.length)] : null;

                // front face material (will receive a dynamically generated CanvasTexture)
                const frontMat = new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.6 });
                try {
                    // create a unique key per vinyl index + optional art hint
                    const cacheKey = url ? url : ('gen_' + i);
                    const genTex = window.createVinylCoverTexture(cacheKey, 1024);
                    if (genTex) {
                        frontMat.map = genTex;
                        frontMat.color.set('#ffffff');
                        frontMat.needsUpdate = true;
                    } else {
                        frontMat.map = null;
                        frontMat.color.set(window.vinylFallbackColor);
                        frontMat.needsUpdate = true;
                    }
                } catch(e) {
                    frontMat.map = null;
                    frontMat.color.set(window.vinylFallbackColor);
                    frontMat.needsUpdate = true;
                }

                // material order: [right, left, top, bottom, front, back]
                const mats = [vinylSideMat, vinylSideMat, vinylSideMat, vinylSideMat, frontMat, vinylBackMat];
                const vinyl = new THREE.Mesh(vinylGeo, mats);
                // Ajustement du placement interne
                vinyl.position.set( (Math.random() - 0.5) * 0.08, 0.35, i * 0.015 );
                vinyl.rotation.x = -0.15 - (Math.random() * 0.05);
                vinyl.rotation.z = (Math.random() - 0.5) * 0.05;
                vinyl.castShadow = true;
                vinyl.add(new THREE.LineSegments(new THREE.EdgesGeometry(vinylGeo), crateEdgeMat));
                window.vinylsContainer.add(vinyl);
            }
        };


    // ==========================================
        // TAPIS CENTRAL (Agrandit et devant le canapé)
        // ==========================================
        const rugGroup = new THREE.Group();
        rugGroup.visible = false;
        // Surélevé légèrement au-dessus du parquet (y=-1.0) pour éviter tout Z-fighting
        rugGroup.position.set(-0.5, -0.980, 1.5);

        // Tapis plus grand (5.0 de large sur 4.0 de profondeur)
        const rugGeo = new THREE.BoxGeometry(5, 0.018, 4.0);
        const rugMat = new THREE.MeshStandardMaterial({ color: '#17123f', roughness: 1.0 });
        const rug = new THREE.Mesh(rugGeo, rugMat);
        rug.receiveShadow = true;
        
        // Bande décorative posée proprement SUR la face supérieure (zéro chevauchement interne!)
        const stripeGeo = new THREE.PlaneGeometry(4.96, 0.30);
        const stripeMat = new THREE.MeshStandardMaterial({ color: '#7dd3fc', roughness: 1.0 });
        const stripe = new THREE.Mesh(stripeGeo, stripeMat);
        stripe.rotation.x = -Math.PI / 2;
        stripe.position.set(0, 0.0105, 1.4);
        stripe.userData.hideWhenUnowned = true;
        
        rugGroup.add(rug, stripe);
        scene.add(rugGroup);

        // ==========================================
        // RACK HARDWARE ANALOGIQUE
        // ==========================================
        const rackGroup = new THREE.Group();
        rackGroup.visible = false;
            rackGroup.position.set(1.3, -1, -4.45);
            rackGroup.rotation.x = -Math.PI / 36;


    const rackSideMat = new THREE.MeshStandardMaterial({ color: '#3a2a1f', roughness: 0.75 });
        const faceplateMats = [
            new THREE.MeshStandardMaterial({ color: '#d6d3cc', roughness: 0.42, metalness: 0.45 }),
            new THREE.MeshStandardMaterial({ color: '#1f2933', roughness: 0.55, metalness: 0.35 }),
            new THREE.MeshStandardMaterial({ color: '#9ca3af', roughness: 0.38, metalness: 0.65 }),
            new THREE.MeshStandardMaterial({ color: '#111827', roughness: 0.6, metalness: 0.3 })
        ];
        const knobMat = new THREE.MeshStandardMaterial({ color: '#0b0b0d', roughness: 0.5, metalness: 0.25 });
        const silverMat = new THREE.MeshStandardMaterial({ color: '#e5e7eb', roughness: 0.25, metalness: 0.85 });
        const jackMat = new THREE.MeshStandardMaterial({ color: '#050505', roughness: 0.4, metalness: 0.7 });
        const vuGlassMat = new THREE.MeshStandardMaterial({ color: '#fbbf24', emissive: '#f59e0b', emissiveIntensity: 0.35, roughness: 0.2 });

        const sideL = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.8, 0.8), rackSideMat); sideL.position.set(-0.5, 0.9, 0);
        const sideR = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.8, 0.8), rackSideMat); sideR.position.set(0.5, 0.9, 0);
        const topRack = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.1, 0.8), rackSideMat); topRack.position.set(0, 1.85, 0);
        const bottomRack = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.1, 0.8), rackSideMat); bottomRack.position.set(0, 0.05, 0);

        [sideL, sideR, topRack, bottomRack].forEach(mesh => {
            mesh.castShadow = true; mesh.receiveShadow = true;
            const edges = new THREE.EdgesGeometry(mesh.geometry);
            const lines = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.4 }));
            mesh.add(lines);
            rackGroup.add(mesh);
        });

        const ledMatRed = new THREE.MeshStandardMaterial({ color: '#fb7185', emissive: '#fb7185', emissiveIntensity: 1 });
    const ledMatGreen = new THREE.MeshStandardMaterial({ color: '#34d399', emissive: '#34d399', emissiveIntensity: 1 });
    const ledMatAmber = new THREE.MeshStandardMaterial({ color: '#fbbf24', emissive: '#fbbf24', emissiveIntensity: 0.9 });

    const screwGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.012, 12);
    screwGeo.rotateX(Math.PI / 2);

    const smallKnobGeo = new THREE.CylinderGeometry(0.055, 0.055, 0.045, 20);
    smallKnobGeo.rotateX(Math.PI / 2);

    const bigKnobGeo = new THREE.CylinderGeometry(0.085, 0.085, 0.055, 24);
    bigKnobGeo.rotateX(Math.PI / 2);

    const jackGeo = new THREE.CylinderGeometry(0.035, 0.035, 0.035, 16);
    jackGeo.rotateX(Math.PI / 2);

    const vuGeo = new THREE.BoxGeometry(0.24, 0.09, 0.018);
    const labelMat = new THREE.MeshStandardMaterial({ color: '#050505', roughness: 0.8 });

    for (let i = 0; i < 4; i++) {
        const y = 0.35 + (i * 0.4);
        const faceMat = faceplateMats[i % faceplateMats.length];

        const faceplate = new THREE.Mesh(new THREE.BoxGeometry(0.92, 0.31, 0.06), faceMat);
        faceplate.position.set(0, y, 0.38);
        faceplate.castShadow = true;
        faceplate.receiveShadow = true;
        rackGroup.add(faceplate);

        const label = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.035, 0.01), labelMat);
        label.position.set(-0.23, y + 0.095, 0.416);
        rackGroup.add(label);

        const vu = new THREE.Mesh(vuGeo, vuGlassMat.clone());
        vu.position.set(-0.25, y, 0.422);
        rackGroup.add(vu);
        rackLeds.push(vu);

        for (let s = 0; s < 4; s++) {
            const sx = s < 2 ? -0.41 : 0.41;
            const sy = y + (s % 2 === 0 ? 0.12 : -0.12);
            const screw = new THREE.Mesh(screwGeo, silverMat);
            screw.position.set(sx, sy, 0.425);
            rackGroup.add(screw);
        }

        for (let k = 0; k < 3; k++) {
            const knob = new THREE.Mesh(k === 1 ? bigKnobGeo : smallKnobGeo, knobMat);
            knob.position.set(0.05 + (k * 0.14), y + 0.04, 0.425);
            rackGroup.add(knob);

            const capLine = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.055, 0.008), silverMat);
            capLine.position.set(0.05 + (k * 0.14), y + 0.07, 0.46);
            rackGroup.add(capLine);
        }

        for (let j = 0; j < 3; j++) {
            const jack = new THREE.Mesh(jackGeo, jackMat);
            jack.position.set(-0.02 + (j * 0.13), y - 0.105, 0.43);
            rackGroup.add(jack);
        }

        for (let l = 0; l < 2; l++) {
            const mat = l === 0 ? ledMatGreen.clone() : ledMatAmber.clone();
            const led = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.035, 0.018), mat);
            led.position.set(0.34, y + 0.07 - (l * 0.11), 0.43);
            rackGroup.add(led);
            rackLeds.push(led);
        }
    }

    // ==========================================
        // LAMPE PIXAR (Sur le Rack Analogique)
        // ==========================================
        const lampGroup = new THREE.Group();
        lampGroup.visible = false;
        // Le rack fait environ 1.8 de haut, on pose la lampe sur le sommet
        lampGroup.position.set(0, 1.9, 0.2);

        // --- NOUVEAU : AJUSTEMENTS DE TAILLE ET D'ORIENTATION ---
        // Agrandit toute la structure (géométries et lumières) de 60%
        lampGroup.scale.set(1.6, 1.6, 1.6);

        // Pivote la lampe de 45 degrés vers la gauche (le centre de la chambre)
        lampGroup.rotation.y = Math.PI / 2;

        const lampMat = new THREE.MeshStandardMaterial({ color: '#111827', roughness: 0.4, metalness: 0.8 }); // Métal sombre
        const jointMat = new THREE.MeshStandardMaterial({ color: '#9ca3af', roughness: 0.5, metalness: 0.9 }); // Articulations
        
        // Fonction locale pour garder les jolis contours noirs du jeu
        function addLampEdges(mesh) {
            const edges = new THREE.EdgesGeometry(mesh.geometry);
            mesh.add(new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.4 })));
        }

        // 1. Socle
        const lBase = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 0.06, 16), lampMat);
        lBase.position.y = 0.03;
        addLampEdges(lBase);
        lampGroup.add(lBase);

        // ==========================================
        // NOUVEAU : INTERRUPTEUR VISUEL (AFFORDANCE)
        // ==========================================
        const switchGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.015, 12);
        const switchMat = new THREE.MeshStandardMaterial({ 
            color: '#fb7185',        // Un rouge/rose subtil
            emissive: '#fb7185',     // La même couleur qui émet de la lumière
            emissiveIntensity: 0.6   // Juste assez pour ressortir dans la pénombre
        });
        const lampSwitch = new THREE.Mesh(switchGeo, switchMat);
        
        // On le positionne sur l'avant du socle
        lampSwitch.position.set(0, 0.035, 0.12); 
        
        // Assure que le clic fonctionne si le joueur vise pile le bouton
        lampSwitch.name = "interactiveLamp"; 
        
        lBase.add(lampSwitch);
        // ==========================================

        // 2. Bras Inférieur (Penché en avant)
        const lArm1 = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.45), lampMat);
        lArm1.position.set(0, 0.22, 0.15);
        lArm1.rotation.x = Math.PI / 4; // 45 degrés
        addLampEdges(lArm1);
        lampGroup.add(lArm1);

        // 3. Jointure centrale (Coude)
        const lJoint = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.05, 12), jointMat);
        lJoint.rotation.z = Math.PI / 2;
        lJoint.position.set(0, 0.38, 0.31);
        addLampEdges(lJoint);
        lampGroup.add(lJoint);

        // 4. Bras Supérieur (Revient vers le haut/arrière)
        const lArm2 = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.4), lampMat);
        lArm2.position.set(0, 0.55, 0.21);
        lArm2.rotation.x = -Math.PI / 6; // -30 degrés
        addLampEdges(lArm2);
        lampGroup.add(lArm2);

        // 5. Tête de la lampe (Abat-jour + Ampoule)
        const lHeadGroup = new THREE.Group();
        lHeadGroup.position.set(0, 0.72, 0.11);
        
        // On penche juste la tête vers le bas
        lHeadGroup.rotation.x = Math.PI / 4;  
        lHeadGroup.rotation.y = 0; 
        lHeadGroup.name = "pixar_head_group";

        // Abat-jour conique
        const lShade = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.16, 0.25, 16), lampMat);
        lShade.position.set(0, -0.1, 0);
        addLampEdges(lShade);

        // Ampoule (Off par défaut)
        const lBulbMat = new THREE.MeshStandardMaterial({ color: '#fef08a', emissive: '#fef08a', emissiveIntensity: 0 });
        const lBulb = new THREE.Mesh(new THREE.SphereGeometry(0.06, 12, 12), lBulbMat);
        lBulb.position.set(0, -0.18, 0);
        lBulb.name = "pixar_bulb_mesh";

        // --- On remet uniquement la GÉOMÉTRIE dans la tête ---
        lHeadGroup.add(lShade, lBulb);
        lampGroup.add(lHeadGroup);

        // =========================================================
        // RETOUR À TA VERSION : SPOTLIGHT DANS LA SCÈNE GLOBALE
        // =========================================================
        const lSpot = new THREE.SpotLight('#fef08a', 0);
        lSpot.name = "pixar_spotlight";
        lSpot.angle = Math.PI / 3;
        lSpot.penumbra = 0.8;
        lSpot.distance = 8;
        lSpot.decay = 1.6;
        lSpot.shadow.radius = 4;
        lSpot.shadow.normalBias = 0.02;
        // Définit la netteté de l'ombre (1024 ou 2048 pour effacer l'effet escalier)
        const lSpotShadowSize = isMobile ? 1024 : 2048;
        lSpot.shadow.mapSize.width = lSpotShadowSize;
        lSpot.shadow.mapSize.height = lSpotShadowSize;

        
        lSpot.castShadow = true;

        // Le faisceau vise le centre parfait de la pièce (l'avatar)
        lSpot.target.position.set(0, 0, 0);
        scene.add(lSpot);
        scene.add(lSpot.target); 

        // Références directes stockées pour togglePixarLamp
        lampGroup.userData.spot = lSpot;
        lampGroup.userData.bulb = lBulb;
        lampGroup.userData.isOn = false;

        // Tag cliquable — sans écraser les noms fonctionnels
        lampGroup.traverse(child => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
            if (!child.name || child.name === "") {
                child.name = "interactiveLamp";
            }
        });

        rackGroup.add(lampGroup);
        window.pixarLamp = lampGroup;
        scene.add(rackGroup);

        // --- OPTIMISATION : OBJETS RÉUTILISABLES (ÉVITE LES FUITES MÉMOIRE) ---
        const rippleGeoShared = new THREE.RingGeometry(0.2, 0.25, 32);
        const rippleMatShared = new THREE.MeshBasicMaterial({ 
            color: '#e0e7ff', 
            transparent: true, 
            opacity: 0.4, 
            side: THREE.DoubleSide 
        });

        // =========================================================
        // L'ASTUCE POUR ALIGNER PARFAITEMENT LA LUMIÈRE
        // =========================================================
        // 1. On force le moteur à calculer les positions finales de tous les objets
        rackGroup.updateMatrixWorld(true);
        
        // 2. On récupère les coordonnées (X, Y, Z) réelles de l'ampoule dans la chambre
        const realBulbPos = new THREE.Vector3();
        lBulb.getWorldPosition(realBulbPos);
        
        // 3. On téléporte le SpotLight global exactement sur l'ampoule
        lSpot.position.copy(realBulbPos);




    // ==========================================
        // PANNEAUX ACOUSTIQUES (Mousse Studio Réaliste)
        // ==========================================
        const acousticGroupL = new THREE.Group();
        acousticGroupL.visible = false;
        const acousticGroupR = new THREE.Group();
        acousticGroupR.visible = false;

        // Matériaux : Noir ultra-mat pour absorber la lumière (et le son)
        const foamMat = new THREE.MeshStandardMaterial({ color: '#242424', roughness: 1.0 });
        const edgeMat = new THREE.LineBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.5 });

        // 1. Création d'un Master Template pour 1 Panneau
        const singlePanelGroup = new THREE.Group();
        
        // Base plate du panneau
        const baseGeo = new THREE.BoxGeometry(0.7, 0.7, 0.04);
        const baseMesh = new THREE.Mesh(baseGeo, foamMat);
        baseMesh.add(new THREE.LineSegments(new THREE.EdgesGeometry(baseGeo), edgeMat));
        singlePanelGroup.add(baseMesh);

        // Ajout des 4 crêtes en relief (effet "Egg Crate" typique)
        const ridgeGeo = new THREE.BoxGeometry(0.7, 0.08, 0.04);
        for (let r = 0; r < 4; r++) {
            const ridge = new THREE.Mesh(ridgeGeo, foamMat);
            ridge.position.set(0, -0.24 + (r * 0.16), 0.04); // Décalé vers l'avant
            ridge.add(new THREE.LineSegments(new THREE.EdgesGeometry(ridgeGeo), edgeMat));
            singlePanelGroup.add(ridge);
        }

        // 2. Fonction pour plaquer une grille de panneaux sur n'importe quel mur + Cadre LED
        function createAcousticWall(startX, startY, startZ, isLeftWall, targetGroup) {
            for (let col = 0; col < 3; col++) {
                for (let row = 0; row < 2; row++) {
                    const panel = singlePanelGroup.clone();
                    
                    if ((col + row) % 2 === 0) panel.rotation.z = Math.PI / 2;

                    if (isLeftWall) {
                        panel.position.set(startX, startY + (row * 0.75), startZ + (col * 0.75));
                        panel.rotation.y = Math.PI / 2;
                    } else {
                        panel.position.set(startX + (col * 0.75), startY + (row * 0.75), startZ);
                    }
                    
                    targetGroup.add(panel);
                }
            }

            // ==========================================
            // AJOUT DES BANDES LEDS / NÉONS (AUTOUR)
            // ==========================================
            const gridW = 2.15; // Largeur totale de la grille 3x2
            const gridH = 1.40; // Hauteur totale de la grille 3x2
            const centerX = isLeftWall ? startX : startX + 0.75;
            const centerY = startY + 0.375;
            const centerZ = isLeftWall ? startZ + 0.75 : startZ;

            // Matériau unique par cadre pour pouvoir les piloter indépendamment
            const neonMat = new THREE.MeshStandardMaterial({
                color: '#818cf8',
                emissive: '#818cf8',
                emissiveIntensity: 0, // Éteint de base
                roughness: 0.1
            });

            const tubeGeoH = new THREE.BoxGeometry(gridW, 0.02, 0.02);
            const tubeGeoV = new THREE.BoxGeometry(0.02, gridH, 0.02);
            const frame = new THREE.Group();

            if (!isLeftWall) {
                // Mur du fond (Cadre aligné sur l'axe X/Y)
                const top = new THREE.Mesh(tubeGeoH, neonMat);
                top.position.set(centerX, centerY + gridH/2 + 0.05, centerZ + 0.04);
                const bottom = new THREE.Mesh(tubeGeoH, neonMat);
                bottom.position.set(centerX, centerY - gridH/2 - 0.05, centerZ + 0.04);
                const left = new THREE.Mesh(tubeGeoV, neonMat);
                left.position.set(centerX - gridW/2 - 0.05, centerY, centerZ + 0.04);
                const right = new THREE.Mesh(tubeGeoV, neonMat);
                right.position.set(centerX + gridW/2 + 0.05, centerY, centerZ + 0.04);
                frame.add(top, bottom, left, right);
            } else {
                // Mur de gauche (Cadre aligné sur l'axe Z/Y)
                const top = new THREE.Mesh(tubeGeoH, neonMat);
                top.rotation.y = Math.PI / 2;
                top.position.set(startX + 0.04, centerY + gridH/2 + 0.05, centerZ);
                const bottom = new THREE.Mesh(tubeGeoH, neonMat);
                bottom.rotation.y = Math.PI / 2;
                bottom.position.set(startX + 0.04, centerY - gridH/2 - 0.05, centerZ);
                const left = new THREE.Mesh(tubeGeoV, neonMat);
                left.position.set(startX + 0.04, centerY, centerZ - gridW/2 - 0.05);
                const right = new THREE.Mesh(tubeGeoV, neonMat);
                right.position.set(startX + 0.04, centerY, centerZ + gridW/2 + 0.05);
                frame.add(top, bottom, left, right);
            }

            // Lumière omnidirectionnelle très douce pour l'effet de halo diffusé sur le mur
            const neonLight = new THREE.PointLight('#818cf8', 0, 4, 1);
            neonLight.position.set(
                isLeftWall ? startX + 0.15 : centerX,
                centerY,
                isLeftWall ? centerZ : startZ + 0.15
            );
            frame.add(neonLight);
            targetGroup.add(frame);

            // Enregistrement global pour l'interrupteur
            if (!window.acousticNeons) window.acousticNeons = [];
            window.acousticNeons.push({ material: neonMat, light: neonLight });
        }

        // Mur du fond (Derrière l'écran / bureau)
        createAcousticWall(-1.5, 2.2, -4.95, false, acousticGroupR);

        // Mur de gauche (Au-dessus du canapé)
        createAcousticWall(-4.95, 2.2, 0.5, true, acousticGroupL);

        scene.add(acousticGroupR);
        scene.add(acousticGroupL);


        // ==========================================
        // CANAPÉ STUDIO (Contre le mur de gauche)
        // ==========================================
        const sofaGroup = new THREE.Group();
        sofaGroup.visible = false;
        // Placé contre le mur de gauche (x = -4.2), vers le bas de la pièce (z = 1.5)
        sofaGroup.position.set(-4.2, -1, 1.5);
        sofaGroup.rotation.y = Math.PI / 2; // Orienté vers le centre de la pièce

        const fabricMat = new THREE.MeshStandardMaterial({ color: '#111827', roughness: 0.9 });
        
        // Assise élargie
        const seat = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.4, 1.2), fabricMat); 
        seat.position.set(0, 0.2, 0);
        
        // Dossier élargi
        const back = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.8, 0.3), fabricMat); 
        back.position.set(0, 0.8, -0.45);
        
        // Accoudoirs repoussés sur les côtés
        const armL = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.6, 1.2), fabricMat); 
        armL.position.set(-1.55, 0.5, 0);
        const armR = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.6, 1.2), fabricMat); 
        armR.position.set(1.55, 0.5, 0);

        [seat, back, armL, armR].forEach(mesh => {
            mesh.castShadow = true; mesh.receiveShadow = true;
            mesh.name = 'sofa_mesh';
            const edges = new THREE.EdgesGeometry(mesh.geometry);
            const lines = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.4 }));
            mesh.add(lines);
            sofaGroup.add(mesh);
        });

        scene.add(sofaGroup);


        // ==========================================
        // TABLE BASSE (Centrée devant le canapé)
        // ==========================================
        const sideTableGroup = new THREE.Group();
        sideTableGroup.visible = false;
        // X=-2.6 (devant le canapé), Y=-1 (sol), Z=1.5 (centré sur le canapé)
        sideTableGroup.position.set(-1.4, -1, 1.5);

        const tableTopMat = new THREE.MeshStandardMaterial({ color: '#8a6242', roughness: 0.7 });
        const tableLegMat = new THREE.MeshStandardMaterial({ color: '#111827', roughness: 0.9 });

        // Plateau de la table (plus long pour matcher le canapé)
        const sTableTop = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.05, 2.4), tableTopMat);
        sTableTop.position.set(0, 0.35, 0);
        sTableTop.castShadow = true; 
        sTableTop.receiveShadow = true;

        // Contours 
        const sTableEdges = new THREE.EdgesGeometry(sTableTop.geometry);
        sTableTop.add(new THREE.LineSegments(sTableEdges, new THREE.LineBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.4 })));

        // Socle rectangulaire massif et moderne
        const sTableLeg = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.35, 1.6), tableLegMat);
        sTableLeg.position.set(0, 0.175, 0);
        sTableLeg.castShadow = true;
        
        const sLegEdges = new THREE.EdgesGeometry(sTableLeg.geometry);
        sTableLeg.add(new THREE.LineSegments(sLegEdges, new THREE.LineBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.3 })));

        sideTableGroup.add(sTableTop, sTableLeg);


        // ==========================================
        // TÉLÉVISION ÉTEINTE XXL (Posée sur la table basse)
        // ==========================================
        const tvGroup = new THREE.Group();
        tvGroup.visible = false;
        // On la pose sur le plateau de la table (Y local = 0.35 hauteur + 0.025 épaisseur)
        tvGroup.position.set(0, 0.375, 0);

        const tvFrameMat = new THREE.MeshStandardMaterial({ color: '#1a1a1c', roughness: 0.8 });
        
        // Dalle avec capacité d'émission de lumière (noire par défaut)
        const tvScreenMat = new THREE.MeshStandardMaterial({ 
            color: '#030303', 
            roughness: 0.1, 
            metalness: 0.9,
            emissive: '#000000',
            emissiveIntensity: 0
        }); 
        
        // On rend le matériau accessible globalement pour l'animer
        window.tvScreenMat = tvScreenMat;

        // On crée un faisceau de lumière qui sortira de l'écran pour éclairer la pièce
        window.tvLight = new THREE.PointLight('#38bdf8', 0, 5, 1);
        window.tvLight.position.set(-0.5, 0.7, 0); // Décalé devant l'écran (-X)
        tvGroup.add(window.tvLight); 
        const cableMat = new THREE.MeshStandardMaterial({ color: '#0a0a0a', roughness: 0.9 });

        function addTvEdges(mesh) {
            const edges = new THREE.EdgesGeometry(mesh.geometry);
            mesh.add(new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.4 })));
            mesh.castShadow = true;
            mesh.receiveShadow = true;
        }

        // 1. Le Socle (Élargi pour supporter le grand écran)
        const tvBase = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.02, 0.9), tvFrameMat);
        tvBase.position.set(0, 0.01, 0);
        addTvEdges(tvBase);

        // Le pied (plus épais)
        const tvNeck = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 0.12, 8), tvFrameMat);
        tvNeck.position.set(0, 0.07, 0);
        addTvEdges(tvNeck);
        
        tvGroup.add(tvBase, tvNeck);

        // 2. L'écran plat XXL
        const screenWidth = 2.1;  // Écran beaucoup plus large !
        const screenHeight = 1.2; // Écran beaucoup plus haut !
        const tvCenterY = 0.7;    // On remonte le centre de l'écran
        
        const tvBody = new THREE.Mesh(new THREE.BoxGeometry(0.04, screenHeight, screenWidth), tvFrameMat);
        tvBody.position.set(0, tvCenterY, 0);
        addTvEdges(tvBody);
        
        // La dalle
        const tvScreen = new THREE.Mesh(new THREE.PlaneGeometry(screenWidth - 0.05, screenHeight - 0.05), tvScreenMat);
        tvScreen.rotation.y = -Math.PI / 2; // Regarde vers le canapé (-X)
        tvScreen.position.set(-0.021, tvCenterY, 0);
        
        // 3. Le boîtier électronique à l'arrière (+X) proportionnel à l'écran
        const tvBack = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.6, 1.0), tvFrameMat);
        tvBack.position.set(0.06, tvCenterY - 0.1, 0);
        addTvEdges(tvBack);

        tvGroup.add(tvBody, tvScreen, tvBack);

        // 4. Le Câblage à l'arrière
        const createCable = (startX, startY, startZ, dropZ) => {
            const curve = new THREE.CatmullRomCurve3([
                new THREE.Vector3(startX, startY, startZ),             
                new THREE.Vector3(startX + 0.1, startY - 0.3, startZ), 
                new THREE.Vector3(startX + 0.2, 0.01, dropZ * 0.5),    
                new THREE.Vector3(startX + 0.35, -0.4, dropZ)          
            ]);
            const tubeGeo = new THREE.TubeGeometry(curve, 16, 0.008, 6, false);
            const cableMesh = new THREE.Mesh(tubeGeo, cableMat);
            cableMesh.castShadow = true;
            return cableMesh;
        };

        // Les câbles partent maintenant un peu plus haut et s'écartent davantage
        const cable1 = createCable(0.1, tvCenterY - 0.2, 0.25, 0.5);  
        const cable2 = createCable(0.1, tvCenterY - 0.25, -0.25, -0.5); 
        tvGroup.add(cable1, cable2);

        // On imbrique la TV dans la table
        sideTableGroup.add(tvGroup);

        
        scene.add(sideTableGroup);


        // --- JUICY HUD COUNTER LOGIC ---
        // ==========================================
    // SYNTHÉTISEUR SUR PIED X-STAND
    // ==========================================
    const synthGroup = new THREE.Group();
    synthGroup.visible = false;
    synthGroup.position.set(-4.35, -1, -1.35);
    synthGroup.rotation.y = Math.PI / 2;

    const synthBodyMat = new THREE.MeshStandardMaterial({ color: '#18181b', roughness: 0.55, metalness: 0.25 });
    const synthPanelMat = new THREE.MeshStandardMaterial({ color: '#27272a', roughness: 0.5, metalness: 0.35 });
    const synthKeyWhiteMat = new THREE.MeshStandardMaterial({ color: '#f8fafc', roughness: 0.45 });
    const synthKeyBlackMat = new THREE.MeshStandardMaterial({ color: '#050505', roughness: 0.5 });
    const synthStandMat = new THREE.MeshStandardMaterial({ color: '#0f172a', roughness: 0.35, metalness: 0.8 });
    const synthLedMat = new THREE.MeshStandardMaterial({ color: '#34d399', emissive: '#34d399', emissiveIntensity: 1 });

    // Corps principal
    const synthBody = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.18, 0.72), synthBodyMat);
    synthBody.position.set(0, 1.05, 0);
    synthBody.castShadow = true;
    synthBody.receiveShadow = true;
    synthBody.name = 'synth_mesh'; // <-- AJOUT CRUCIAL ICI
    synthGroup.add(synthBody);

    // Panneau supérieur
    const synthPanel = new THREE.Mesh(new THREE.BoxGeometry(2.45, 0.04, 0.28), synthPanelMat);
    synthPanel.position.set(0, 1.18, -0.19);
    synthPanel.castShadow = true;
    synthPanel.name = 'synth_mesh'; // <-- AJOUT CRUCIAL ICI
    synthGroup.add(synthPanel);

    // Touches blanches
    const whiteKeyGeo = new THREE.BoxGeometry(0.11, 0.035, 0.34);
    for (let i = 0; i < 18; i++) {
        const key = new THREE.Mesh(whiteKeyGeo, synthKeyWhiteMat);
        key.position.set(-1.05 + i * 0.125, 1.18, 0.14);
        key.castShadow = true;
        synthGroup.add(key);
    }

    // Touches noires
    const blackKeyGeo = new THREE.BoxGeometry(0.07, 0.045, 0.22);
    const blackPattern = [0, 1, 3, 4, 5];
    for (let octave = 0; octave < 3; octave++) {
        blackPattern.forEach(step => {
            const keyIndex = octave * 7 + step;
            if (keyIndex < 17) {
                const key = new THREE.Mesh(blackKeyGeo, synthKeyBlackMat);
                key.position.set(-0.99 + keyIndex * 0.125, 1.215, 0.02);
                key.castShadow = true;
                synthGroup.add(key);
            }
        });
    }

    // Boutons / potentiomètres du panneau
    const synthKnobGeo = new THREE.CylinderGeometry(0.045, 0.045, 0.035, 16);
    synthKnobGeo.rotateX(Math.PI / 2);

    for (let i = 0; i < 5; i++) {
        const synthKnob = new THREE.Mesh(synthKnobGeo, synthKeyBlackMat);
        synthKnob.position.set(-0.85 + i * 0.22, 1.22, -0.28);
        synthKnob.castShadow = true;
        synthGroup.add(synthKnob);
    }


    // Petit écran LED
    const synthScreen = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.035, 0.12), synthLedMat);
    synthScreen.position.set(0.72, 1.22, -0.29);
    synthGroup.add(synthScreen);

    // X-Stand propre, aligné sous le clavier
    function addSynthTube(name, start, end, radius = 0.035) {
        const direction = new THREE.Vector3().subVectors(end, start);
        const length = direction.length();

        const geo = new THREE.CylinderGeometry(radius, radius, length, 16);
        const mesh = new THREE.Mesh(geo, synthStandMat);
        mesh.name = name;

        mesh.position.copy(
            new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5)
        );

        mesh.quaternion.setFromUnitVectors(
            new THREE.Vector3(0, 1, 0),
            direction.clone().normalize()
        );

        mesh.castShadow = true;
        mesh.receiveShadow = true;
        synthGroup.add(mesh);

        return mesh;
    }

    // Pieds au sol, courts, sous le clavier
    addSynthTube(
        "synth_stand_foot_back",
        new THREE.Vector3(-0.75, 0.06, -0.16),
        new THREE.Vector3(0.75, 0.06, -0.16),
        0.04
    );

    addSynthTube(
        "synth_stand_foot_front",
        new THREE.Vector3(-0.75, 0.06, 0.16),
        new THREE.Vector3(0.75, 0.06, 0.16),
        0.04
    );

    // X gauche
    addSynthTube(
        "synth_stand_x_a_back",
        new THREE.Vector3(-0.65, 0.08, -0.12),
        new THREE.Vector3(0.65, 0.98, -0.12),
        0.035
    );

    addSynthTube(
        "synth_stand_x_b_back",
        new THREE.Vector3(0.65, 0.08, -0.12),
        new THREE.Vector3(-0.65, 0.98, -0.12),
        0.035
    );

    // X avant, léger double tube pour donner du volume
    addSynthTube(
        "synth_stand_x_a_front",
        new THREE.Vector3(-0.65, 0.08, 0.12),
        new THREE.Vector3(0.65, 0.98, 0.12),
        0.035
    );

    addSynthTube(
        "synth_stand_x_b_front",
        new THREE.Vector3(0.65, 0.08, 0.12),
        new THREE.Vector3(-0.65, 0.98, 0.12),
        0.035
    );

    // Pivot central
    addSynthTube(
        "synth_stand_pivot",
        new THREE.Vector3(-0.18, 0.52, 0.14),
        new THREE.Vector3(0.18, 0.52, 0.14),
        0.045
    );



    // Contours style jeu
    synthGroup.traverse(child => {
        if (child.isMesh && child.geometry) {
            const edges = new THREE.EdgesGeometry(child.geometry);
            const lines = new THREE.LineSegments(
                edges,
                new THREE.LineBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.35 })
            );
            child.add(lines);
        }
    });

    scene.add(synthGroup);

        // ==========================================
        // GUITARE ÉLECTRIQUE RÉALISTE AU MUR (Proportions corrigées, Sans ombres)
        // ==========================================
        const guitarGroup = new THREE.Group();
        guitarGroup.visible = false;
        // Positionnement : mur de gauche
        guitarGroup.position.set(-4.9, 2.0, -3.5); 
        guitarGroup.rotation.y = Math.PI / 2; // Face à la pièce
        guitarGroup.rotation.z = -Math.PI / 2; // Horizontale

        // --- Matériaux ---
        const bodyMat = new THREE.MeshStandardMaterial({ color: '#991b1b', roughness: 0.3, metalness: 0.2 }); 
        const neckMat = new THREE.MeshStandardMaterial({ color: '#e6c280', roughness: 0.7 }); 
        const fretboardMat = new THREE.MeshStandardMaterial({ color: '#292524', roughness: 0.9 }); 
        const HardwareMat = new THREE.MeshStandardMaterial({ color: '#f3f4f6', roughness: 0.1, metalness: 0.9 }); 
        const plasticMat = new THREE.MeshStandardMaterial({ color: '#111827', roughness: 0.6 }); 
        const pickguardMat = new THREE.MeshStandardMaterial({ color: '#f8fafc', roughness: 0.5 }); 
        
        // Facteur d'échelle pour le corps (réduit pour équilibrer avec le manche)
        const bs = 0.8;
        const bodyYOffset = 0.1; 

        // --- Corps (Extrusion détaillée avec Cutaway) ---
        const bodyShape = new THREE.Shape();
        bodyShape.moveTo(0, -1.0 * bs);
        bodyShape.bezierCurveTo(-0.35 * bs, -1.0 * bs, -0.55 * bs, -0.8 * bs, -0.45 * bs, -0.4 * bs);
        bodyShape.bezierCurveTo(-0.35 * bs, -0.1 * bs, -0.3 * bs, 0.0, -0.35 * bs, 0.2 * bs);
        bodyShape.bezierCurveTo(-0.4 * bs, 0.4 * bs, -0.2 * bs, 0.5 * bs, 0, 0.5 * bs);
        bodyShape.lineTo(0.1 * bs, 0.5 * bs);
        bodyShape.bezierCurveTo(0.35 * bs, 0.5 * bs, 0.45 * bs, 0.3 * bs, 0.25 * bs, 0.15 * bs);
        bodyShape.bezierCurveTo(0.15 * bs, 0.05 * bs, 0.35 * bs, -0.1 * bs, 0.45 * bs, -0.4 * bs);
        bodyShape.bezierCurveTo(0.55 * bs, -0.8 * bs, 0.35 * bs, -1.0 * bs, 0, -1.0 * bs);

        const extrudeSettings = { depth: 0.12, bevelEnabled: true, bevelSegments: 4, steps: 1, bevelSize: 0.03, bevelThickness: 0.03 };
        const bodyGeo = new THREE.ExtrudeGeometry(bodyShape, extrudeSettings);
        bodyGeo.translate(0, bodyYOffset, -0.06); 
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        guitarGroup.add(body);

        // Pickguard
        const pgShape = new THREE.Shape();
        pgShape.moveTo(0, -0.6 * bs);
        pgShape.lineTo(-0.25 * bs, -0.6 * bs);
        pgShape.bezierCurveTo(-0.3 * bs, -0.2 * bs, -0.25 * bs, 0.0, -0.2 * bs, 0.2 * bs);
        pgShape.lineTo(0, 0.2 * bs);
        pgShape.lineTo(0, -0.6 * bs);
        const pgGeo = new THREE.ExtrudeGeometry(pgShape, { depth: 0.02, bevelEnabled: false });
        const pickguard = new THREE.Mesh(pgGeo, pickguardMat);
        pickguard.position.set(0, bodyYOffset, 0.06);
        guitarGroup.add(pickguard);

        // --- Manche et Touche ---
        const neck = new THREE.Mesh(new THREE.BoxGeometry(0.14, 1.5, 0.07), neckMat);
        neck.position.set(0, 1.25, -0.02);
        guitarGroup.add(neck);

        const fretboard = new THREE.Mesh(new THREE.BoxGeometry(0.15, 1.5, 0.02), fretboardMat);
        fretboard.position.set(0, 1.25, 0.025);
        guitarGroup.add(fretboard);

        // === NOUVEAU : Le Sillet (Nut) ===
        const nutGeo = new THREE.BoxGeometry(0.15, 0.03, 0.03);
        const nutMat = new THREE.MeshStandardMaterial({ color: '#e5e7eb', roughness: 0.8 });
        const nut = new THREE.Mesh(nutGeo, nutMat);
        nut.position.set(0, 2.015, 0.03); // Posé à la fin de la touche
        guitarGroup.add(nut);

        // --- Tête (Headstock inclinée) ---
        const headGroup = new THREE.Group();
        headGroup.position.set(0, 2.03, -0.02); // Légèrement remonté pour s'aligner avec le sillet
        headGroup.rotation.x = -0.15; 
        
        const headShape = new THREE.Shape();
        headShape.moveTo(-0.07, 0);
        headShape.lineTo(0.07, 0);
        headShape.lineTo(0.1, 0.15);
        headShape.bezierCurveTo(0.12, 0.25, 0.08, 0.35, 0, 0.35);
        headShape.bezierCurveTo(-0.08, 0.35, -0.12, 0.25, -0.1, 0.15);
        const headGeo = new THREE.ExtrudeGeometry(headShape, { depth: 0.05, bevelEnabled: true, bevelSize: 0.01, bevelThickness: 0.01 });
        headGeo.translate(0, 0, -0.025);
        const head = new THREE.Mesh(headGeo, neckMat);
        headGroup.add(head);
        guitarGroup.add(headGroup);

        // --- Micros (Pickups) ---
        const pickupGeo = new THREE.BoxGeometry(0.24 * bs, 0.08, 0.04);
        const p1 = new THREE.Mesh(pickupGeo, plasticMat);
        p1.position.set(0, 0.18, 0.07);
        const p2 = new THREE.Mesh(pickupGeo, plasticMat);
        p2.position.set(0, -0.02, 0.07);
        guitarGroup.add(p1, p2);

        // Plots magnétiques sur les micros
        const poleGeo = new THREE.CylinderGeometry(0.008, 0.008, 0.05, 8);
        poleGeo.rotateX(Math.PI/2);
        for(let i=0; i<6; i++) {
            const px = (-0.09 + (i * 0.036)) * bs;
            const pole1 = new THREE.Mesh(poleGeo, HardwareMat);
            pole1.position.set(px, 0.18, 0.07);
            const pole2 = new THREE.Mesh(poleGeo, HardwareMat);
            pole2.position.set(px, -0.02, 0.07);
            guitarGroup.add(pole1, pole2);
        }

        // --- Chevalet (Bridge) ---
        const bridgeBase = new THREE.Mesh(new THREE.BoxGeometry(0.28 * bs, 0.12, 0.04), HardwareMat);
        bridgeBase.position.set(0, -0.22, 0.07);
        guitarGroup.add(bridgeBase);
        
        // Pontets
        const saddleGeo = new THREE.BoxGeometry(0.03 * bs, 0.04, 0.05);
        for(let i=0; i<6; i++) {
            const saddle = new THREE.Mesh(saddleGeo, HardwareMat);
            saddle.position.set((-0.09 + (i * 0.036)) * bs, -0.20 + (Math.random()*0.01), 0.08);
            guitarGroup.add(saddle);
        }

        // --- Boutons (Knobs) ---
        const knobGeo = new THREE.CylinderGeometry(0.035, 0.04, 0.06, 16);
        knobGeo.rotateX(Math.PI/2);
        const k1 = new THREE.Mesh(knobGeo, plasticMat); k1.position.set(0.2, -0.22, 0.08);
        const k2 = new THREE.Mesh(knobGeo, plasticMat); k2.position.set(0.28, -0.3, 0.08);
        const k3 = new THREE.Mesh(knobGeo, plasticMat); k3.position.set(0.16, -0.38, 0.08);
        const k4 = new THREE.Mesh(knobGeo, plasticMat); k4.position.set(0.24, -0.46, 0.08);
        guitarGroup.add(k1, k2, k3, k4);

        // --- Sélecteur de micro ---
        const switchBase = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.02, 16), HardwareMat);
        switchBase.rotation.x = Math.PI/2;
        switchBase.position.set(-0.2, 0.26, 0.08);
        const switchTip = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.005, 0.06), HardwareMat);
        switchTip.rotation.x = -0.5;
        switchTip.position.set(-0.2, 0.28, 0.1);
        guitarGroup.add(switchBase, switchTip);

        // --- Frettes ---
        const fretGeo = new THREE.BoxGeometry(0.14, 0.005, 0.005);
        let fretY = 1.95;
        for(let i=0; i<22; i++) {
            fretY -= 0.12 * Math.pow(0.96, i); 
            const fret = new THREE.Mesh(fretGeo, HardwareMat);
            fret.position.set(0, fretY, 0.036);
            guitarGroup.add(fret);
        }

        // === CORRECTION : Cordes ===
        // Cordes allongées (2.45 au lieu de 2.02) pour atteindre le haut de la tête
        const stringGeo = new THREE.CylinderGeometry(0.001, 0.001, 2.45, 4);
        for(let i=0; i<6; i++) {
            const string = new THREE.Mesh(stringGeo, HardwareMat);
            const px = (-0.09 + (i * 0.036)) * bs;
            string.position.set(px, 1.0, 0.042); // Re-centrées
            guitarGroup.add(string);
        }

        // --- Mécaniques (Tuning Pegs) ---
        const pegBoxGeo = new THREE.BoxGeometry(0.04, 0.06, 0.04);
        const pegCylGeo = new THREE.CylinderGeometry(0.01, 0.01, 0.08);
        pegCylGeo.rotateZ(Math.PI/2);
        const pegHeadGeo = new THREE.BoxGeometry(0.06, 0.04, 0.02);
        for(let i=0; i<3; i++) {
            // Gauche
            const pegL = new THREE.Group();
            const bL = new THREE.Mesh(pegBoxGeo, HardwareMat);
            const cL = new THREE.Mesh(pegCylGeo, HardwareMat); cL.position.x = -0.04;
            const hL = new THREE.Mesh(pegHeadGeo, HardwareMat); hL.position.x = -0.08;
            pegL.add(bL, cL, hL);
            pegL.position.set(-0.06, 0.1 + (i*0.08), 0);
            headGroup.add(pegL);

            // Droite
            const pegR = new THREE.Group();
            const bR = new THREE.Mesh(pegBoxGeo, HardwareMat);
            const cR = new THREE.Mesh(pegCylGeo, HardwareMat); cR.position.x = 0.04;
            const hR = new THREE.Mesh(pegHeadGeo, HardwareMat); hR.position.x = 0.08;
            pegR.add(bR, cR, hR);
            pegR.position.set(0.06, 0.1 + (i*0.08), 0);
            headGroup.add(pegR);
        }

        // --- Support mural horizontal ---
        const wallMountMat = new THREE.MeshStandardMaterial({ color: '#111111', roughness: 0.8 });
        const mountArmGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.2, 8);
        mountArmGeo.rotateX(Math.PI/2);
        const mountPadGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.1, 8);
        mountPadGeo.rotateX(Math.PI/2);

        // Support Manche
        const mountNeck = new THREE.Group();
        const arm1 = new THREE.Mesh(mountArmGeo, HardwareMat); arm1.position.z = -0.1;
        const pad1 = new THREE.Mesh(mountPadGeo, wallMountMat); pad1.position.z = 0;
        mountNeck.add(arm1, pad1);
        mountNeck.position.set(0, 1.4, -0.08);
        guitarGroup.add(mountNeck);

        // Support Corps
        const mountBody = new THREE.Group();
        const arm2 = new THREE.Mesh(mountArmGeo, HardwareMat); arm2.position.z = -0.1;
        const pad2 = new THREE.Mesh(mountPadGeo, wallMountMat); pad2.position.z = 0;
        mountBody.add(arm2, pad2);
        mountBody.position.set(0, -0.3, -0.15);
        guitarGroup.add(mountBody);

        // --- Contours (Edges) ---
        guitarGroup.traverse((child) => {
            if(child.isMesh && child.geometry && child.material !== HardwareMat && child.material !== pickguardMat) {
                const edges = new THREE.EdgesGeometry(child.geometry);
                const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.3 }));
                child.add(line);
            }
        });

        scene.add(guitarGroup);
        
        

        // ==========================================
        // PORTE DU STUDIO HAUTE DÉFINITION (Reliefs et Positionnement)
        // ==========================================
        const doorGroup = new THREE.Group();
        
        // NOUVELLE POSITION : On l'avance le long du mur X=-5 pour la décoller du coin
        // Elle est maintenant centrée sur Z = 4
        doorGroup.position.set(-4.95, -1, 4); 
        doorGroup.rotation.y = Math.PI / 2; // Reste parallèle au mur

        // --- Matériaux améliorés (Nom modifié pour éviter le conflit avec le lit) ---
        const doorOuterFrameMat = new THREE.MeshStandardMaterial({ color: '#262626', roughness: 0.9, metalness: 0.1 }); 
        const doorMat = new THREE.MeshStandardMaterial({ color: '#3f3f46', roughness: 0.7, metalness: 0.0 }); 
        const doorHardwareMat = new THREE.MeshStandardMaterial({ color: '#b5a67c', metalness: 0.9, roughness: 0.2 });

        // 1. Encadrement de porte massif (Plus profond pour le réalisme)
        const frameDepth = 0.15;
        const frameCasingLeft = new THREE.Mesh(new THREE.BoxGeometry(0.06, 3.3, frameDepth), frameMat);
        frameCasingLeft.position.set(-0.73, 1.65, 0);
        
        const frameCasingRight = new THREE.Mesh(new THREE.BoxGeometry(0.06, 3.3, frameDepth), frameMat);
        frameCasingRight.position.set(0.73, 1.65, 0);
        
        const frameCasingTop = new THREE.Mesh(new THREE.BoxGeometry(1.52, 0.06, frameDepth), frameMat);
        frameCasingTop.position.set(0, 3.3, 0);
        
        doorGroup.add(frameCasingLeft, frameCasingRight, frameCasingTop);

        // 2. Panneau de porte principal (Recalculé pour s'ajuster parfaitement au cadre)
        const doorPanel = new THREE.Mesh(new THREE.BoxGeometry(1.39, 3.24, 0.05), doorMat);
        doorPanel.position.set(0, 1.62, 0);
        doorGroup.add(doorPanel);

        [doorPanel, frameCasingLeft, frameCasingRight, frameCasingTop].forEach(mesh => {
            mesh.name = 'door_mesh';
        });

        // 3. --- DÉTAILS DE RELIEF (Panneautage classique) ---
        // Ces éléments sont ajoutés SUR la porte pour simuler les moulures
        const reliefColor = '#323238'; // Légèrement plus sombre que la porte pour ombrer
        const reliefMat = new THREE.MeshStandardMaterial({ color: reliefColor, roughness: 0.7 });
        
        // Montants verticaux décoratifs
        const stilesW = 0.10;
        const stileL = new THREE.Mesh(new THREE.BoxGeometry(stilesW, 3.04, 0.02), reliefMat);
        stileL.position.set(-0.55, 1.62, 0.035); // Légère surépaisseur en Z
        
        const stileR = new THREE.Mesh(new THREE.BoxGeometry(stilesW, 3.04, 0.02), reliefMat);
        stileR.position.set(0.55, 1.62, 0.035);

        // Traverses horizontales décoratives (Haut, Milieu, Bas)
        const railH = 0.10;
        const railTop = new THREE.Mesh(new THREE.BoxGeometry(1.0, railH, 0.02), reliefMat);
        railTop.position.set(0, 3.10, 0.035);
        
        const railMid = new THREE.Mesh(new THREE.BoxGeometry(1.0, railH + 0.05, 0.02), reliefMat);
        railMid.position.set(0, 1.5, 0.035); // Traverse centrale plus large
        
        const railBottom = new THREE.Mesh(new THREE.BoxGeometry(1.0, railH + 0.05, 0.02), reliefMat);
        railBottom.position.set(0, 0.15, 0.035); // Base plus solide

        doorGroup.add(stileL, stileR, railTop, railMid, railBottom);

        // 4. --- QUINCAILLERIE DÉTAILLÉE ---
        // Plaque de propreté de la poignée
        const handlePlate = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.25, 0.01), doorHardwareMat);
        handlePlate.position.set(0.52, 1.5, 0.06); 
        doorGroup.add(handlePlate);

        // Poignée type béquille (plus réaliste)
        const handleStem = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.06), doorHardwareMat);
        handleStem.rotation.x = Math.PI / 2;
        handleStem.position.set(0.52, 1.53, 0.09);
        
        const handleLever = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.02, 0.02), doorHardwareMat);
        handleLever.position.set(0.56, 1.53, 0.12);
        
        doorGroup.add(handleStem, handleLever);

        // 5. Application des contours sombres (Cohérence graphique DA)
        doorGroup.traverse(child => {
            if (child.isMesh && child.geometry) {
                // Ombre portée pour les reliefs
                child.castShadow = true; 
                child.receiveShadow = true;
                
                const edges = new THREE.EdgesGeometry(child.geometry, 20); // Angle limite pour éviter trop de traits
                const lines = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.3 }));
                child.add(lines);
            }
        });

        scene.add(doorGroup);

        // =========================================================================
        // ARCHITECTURAL PHOTOREALISM V2: NATURAL OAK & PLASTER PBR, BAKED-STYLE AO,
        // REALISTIC ATMOSPHERIC CITY PANORAMA, BALCONY, CURTAINS & PRO STUDIO GEAR
        // =========================================================================
    Object.assign(globalThis, { floorMat, floor, wallMat, wallLeft, wallRight, deskGroup, deskTopMat, pcFrameMat, pcFrame, pcScreenMat, speakerMat, speakerL, speakerR, kbdBaseMat, kbdBase, mouseGroup, bedGroup, frameMat, mattressMat, blanketMat, pillowMat, crateGroup, crateMat, vinylsContainer, rugGroup, rugMat, rackGroup, acousticGroupL, acousticGroupR, edgeMat, sofaGroup, sideTableGroup, tvGroup, tvScreenMat, tvLight, cableMat, synthGroup, guitarGroup, doorGroup, doorMat, doorPanel, stileL, stileR, railTop, railMid, railBottom, handlePlate, handleStem, handleLever, buildSpeaker, createAcousticWall, addTvEdges, addSynthTube });

    return (function buildBedroomArchitecture() {
            const maxAniso = renderer.capabilities && renderer.capabilities.getMaxAnisotropy ? Math.min(8, renderer.capabilities.getMaxAnisotropy()) : 4;

            function configureTex(canvas, rx = 1, ry = 1, isColor = true) {
                const tex = new THREE.CanvasTexture(canvas);
                tex.wrapS = THREE.RepeatWrapping;
                tex.wrapT = THREE.RepeatWrapping;
                tex.repeat.set(rx, ry);
                tex.anisotropy = maxAniso;
                if (isColor && 'colorSpace' in tex && THREE.SRGBColorSpace) {
                    tex.colorSpace = THREE.SRGBColorSpace;
                } else if (!isColor && 'colorSpace' in tex && THREE.NoColorSpace) {
                    tex.colorSpace = THREE.NoColorSpace;
                }
                return tex;
            }

            // VRAI GÉNÉRATEUR DE NORMAL MAPS RGB TANGENTES (Filtre Sobel 3x3 ultra-rapide <25ms)
            function heightCanvasToNormalMap(heightCanvas, strength = 2.6, rx = 1, ry = 1) {
                const w = heightCanvas.width, h = heightCanvas.height;
                const srcCtx = heightCanvas.getContext('2d');
                const src = srcCtx.getImageData(0, 0, w, h).data;
                const outC = document.createElement('canvas'); outC.width = w; outC.height = h;
                const outCtx = outC.getContext('2d');
                const outImg = outCtx.createImageData(w, h);
                const dst = outImg.data;

                const sample = (x, y) => src[(((y + h) % h) * w + ((x + w) % w)) * 4] / 255.0;
                for (let y = 0; y < h; y++) {
                    for (let x = 0; x < w; x++) {
                        const tl = sample(x - 1, y - 1), t = sample(x, y - 1), tr = sample(x + 1, y - 1);
                        const l  = sample(x - 1, y),                           r  = sample(x + 1, y);
                        const bl = sample(x - 1, y + 1), b = sample(x, y + 1), br = sample(x + 1, y + 1);
                        const dx = (tr + 2 * r + br - tl - 2 * l - bl) * strength;
                        const dy = (bl + 2 * b + br - tl - 2 * t - tr) * strength;
                        const dz = 1.0;
                        const invLen = 1.0 / Math.sqrt(dx * dx + dy * dy + dz * dz);
                        const idx = (y * w + x) * 4;
                        dst[idx]     = Math.round((-dx * invLen * 0.5 + 0.5) * 255);
                        dst[idx + 1] = Math.round((-dy * invLen * 0.5 + 0.5) * 255);
                        dst[idx + 2] = Math.round(( dz * invLen * 0.5 + 0.5) * 255);
                        dst[idx + 3] = 255;
                    }
                }
                outCtx.putImageData(outImg, 0, 0);
                return configureTex(outC, rx, ry, false);
            }

            // 1. PARQUET CHÊNE EUROPÉEN NATUREL HAUTE DÉFINITION (Diffuse + Bump + Roughness)
            function createOakFloorTextures() {
                const w = 1024, h = 1024;
                const diffC = document.createElement('canvas'); diffC.width = w; diffC.height = h;
                const dCtx = diffC.getContext('2d');
                const bumpC = document.createElement('canvas'); bumpC.width = w; bumpC.height = h;
                const bCtx = bumpC.getContext('2d');
                const roughC = document.createElement('canvas'); roughC.width = w; roughC.height = h;
                const rCtx = roughC.getContext('2d');

                const rows = 10;
                const plankH = h / rows;
                const tones = ['#a47a52', '#b3875c', '#966d48', '#bc9066', '#9e744e', '#ab8056'];
                for (let r = 0; r < rows; r++) {
                    const y = r * plankH;
                    const offset = ((r * 317) % w);
                    for (let s = 0; s < 2; s++) {
                        const x0 = (offset + s * (w * 0.5)) % w;
                        const pw = w * 0.5;
                        const tone = tones[(r * 5 + s * 2) % tones.length];
                        dCtx.fillStyle = tone;
                        dCtx.fillRect(x0, y, pw, plankH);
                        if (x0 + pw > w) dCtx.fillRect(0, y, (x0 + pw) - w, plankH);

                        const rv = 95 + ((r * 7 + s * 11) % 38);
                        rCtx.fillStyle = `rgb(${rv},${rv},${rv})`;
                        rCtx.fillRect(x0, y, pw, plankH);
                        if (x0 + pw > w) rCtx.fillRect(0, y, (x0 + pw) - w, plankH);
                    }
                    bCtx.fillStyle = '#cfcfcf';
                    bCtx.fillRect(0, y, w, plankH);

                    // Fine organic oak grain waves + subtle knots
                    for (let g = 0; g < 46; g++) {
                        const gy = y + (g / 46) * plankH;
                        dCtx.strokeStyle = g % 3 === 0 ? 'rgba(65,38,18,0.14)' : 'rgba(235,198,155,0.10)';
                        dCtx.lineWidth = 1 + (g % 2);
                        dCtx.beginPath();
                        dCtx.moveTo(0, gy);
                        for (let x = 0; x <= w; x += 64) {
                            dCtx.lineTo(x, gy + Math.sin(x * 0.012 + r * 1.7 + g * 0.3) * 2.2);
                        }
                        dCtx.stroke();
                        bCtx.fillStyle = 'rgba(130,130,130,0.18)';
                        bCtx.fillRect(0, gy, w, 1);
                    }
                    // Natural wood bevel groove
                    dCtx.fillStyle = '#472f1c'; dCtx.fillRect(0, y, w, 2.5);
                    bCtx.fillStyle = '#252525'; bCtx.fillRect(0, y, w, 4);
                    rCtx.fillStyle = '#eaeaea'; rCtx.fillRect(0, y, w, 4);

                    // Vertical plank joints
                    [offset, (offset + w * 0.5) % w].forEach(jx => {
                        dCtx.fillStyle = '#472f1c'; dCtx.fillRect(jx, y, 2.5, plankH);
                        bCtx.fillStyle = '#252525'; bCtx.fillRect(jx, y, 4, plankH);
                        rCtx.fillStyle = '#eaeaea'; rCtx.fillRect(jx, y, 4, plankH);
                    });
                }
                return {
                    map: configureTex(diffC, 3.2, 3.2, true),
                    normalMap: heightCanvasToNormalMap(bumpC, 3.2, 3.2, 3.2),
                    roughnessMap: configureTex(roughC, 3.2, 3.2, false)
                };
            }

            // 2. PLÂTRE ARCHITECTURAL CHAUD AVEC AO VERTICAL (Sol/Plafond)
            function createWallPlasterTextures(baseHex = '#cdc7be', hasVerticalAO = true, rx = 2.5, ry = 1) {
                const w = 512, h = 512;
                const diffC = document.createElement('canvas'); diffC.width = w; diffC.height = h;
                const dCtx = diffC.getContext('2d');
                const bumpC = document.createElement('canvas'); bumpC.width = w; bumpC.height = h;
                const bCtx = bumpC.getContext('2d');

                dCtx.fillStyle = baseHex; dCtx.fillRect(0, 0, w, h);
                bCtx.fillStyle = '#808080'; bCtx.fillRect(0, 0, w, h);

                // Subtle plaster trowel clouds
                for (let c = 0; c < 40; c++) {
                    const cx = Math.random() * w, cy = Math.random() * h, rad = 35 + Math.random() * 75;
                    const grad = dCtx.createRadialGradient(cx, cy, 2, cx, cy, rad);
                    grad.addColorStop(0, c % 2 === 0 ? 'rgba(255,252,245,0.045)' : 'rgba(60,55,48,0.035)');
                    grad.addColorStop(1, 'rgba(0,0,0,0)');
                    dCtx.fillStyle = grad; dCtx.fillRect(0, 0, w, h);
                }
                // Micro-plaster sand grain
                for (let i = 0; i < 6500; i++) {
                    const x = Math.random() * w, y = Math.random() * h, sz = 1 + Math.random() * 1.8;
                    dCtx.fillStyle = Math.random() > 0.5 ? 'rgba(255,255,255,0.028)' : 'rgba(40,35,30,0.028)';
                    dCtx.fillRect(x, y, sz, sz);
                    const bv = 114 + Math.floor(Math.random() * 28);
                    bCtx.fillStyle = `rgb(${bv},${bv},${bv})`; bCtx.fillRect(x, y, sz, sz);
                }
                // Baked-style architectural Ambient Occlusion near ceiling & baseboard
                if (hasVerticalAO) {
                    const aoTop = dCtx.createLinearGradient(0, 0, 0, h * 0.14);
                    aoTop.addColorStop(0, 'rgba(20,18,16,0.22)'); aoTop.addColorStop(1, 'rgba(20,18,16,0)');
                    dCtx.fillStyle = aoTop; dCtx.fillRect(0, 0, w, h * 0.14);

                    const aoBot = dCtx.createLinearGradient(0, h * 0.84, 0, h);
                    aoBot.addColorStop(0, 'rgba(20,18,16,0)'); aoBot.addColorStop(1, 'rgba(20,18,16,0.24)');
                    dCtx.fillStyle = aoBot; dCtx.fillRect(0, h * 0.84, w, h * 0.16);
                }
                return {
                    map: configureTex(diffC, rx, ry, true),
                    normalMap: heightCanvasToNormalMap(bumpC, 1.8, rx, ry)
                };
            }

            // 3. BOIS NOYER AMÉRICAIN SATINÉ (Bureau, Porte, Bac Vinyles, Tasseaux)
            function createWalnutTextures(rx = 2, ry = 1) {
                const w = 512, h = 512;
                const diffC = document.createElement('canvas'); diffC.width = w; diffC.height = h;
                const dCtx = diffC.getContext('2d');
                const bumpC = document.createElement('canvas'); bumpC.width = w; bumpC.height = h;
                const bCtx = bumpC.getContext('2d');

                dCtx.fillStyle = '#533522'; dCtx.fillRect(0, 0, w, h);
                bCtx.fillStyle = '#808080'; bCtx.fillRect(0, 0, w, h);
                for (let y = 0; y < h; y += 2) {
                    dCtx.strokeStyle = (y % 6 === 0) ? 'rgba(30,15,6,0.34)' : 'rgba(176,120,76,0.14)';
                    dCtx.lineWidth = 1.6;
                    dCtx.beginPath();
                    dCtx.moveTo(0, y);
                    for (let x = 0; x <= w; x += 32) {
                        dCtx.lineTo(x, y + Math.sin(x * 0.018 + y * 0.025) * 4.5);
                    }
                    dCtx.stroke();
                    bCtx.fillStyle = (y % 6 === 0) ? 'rgba(92,92,92,0.35)' : 'rgba(155,155,155,0.25)';
                    bCtx.fillRect(0, y, w, 1.5);
                }
                return {
                    map: configureTex(diffC, rx, ry, true),
                    normalMap: heightCanvasToNormalMap(bumpC, 2.6, rx, ry)
                };
            }

            // 4. CUIR COGNAC/ESPRESSO GRAINÉ (Canapé)
            function createLeatherTextures() {
                const w = 256, h = 256;
                const diffC = document.createElement('canvas'); diffC.width = w; diffC.height = h;
                const dCtx = diffC.getContext('2d');
                const bumpC = document.createElement('canvas'); bumpC.width = w; bumpC.height = h;
                const bCtx = bumpC.getContext('2d');
                dCtx.fillStyle = '#4c3022'; dCtx.fillRect(0, 0, w, h);
                bCtx.fillStyle = '#757575'; bCtx.fillRect(0, 0, w, h);
                for (let i = 0; i < 3600; i++) {
                    const x = Math.random() * w, y = Math.random() * h, r = 1.1 + Math.random() * 2.0;
                    dCtx.fillStyle = Math.random() > 0.5 ? 'rgba(255,225,195,0.04)' : 'rgba(20,10,5,0.08)';
                    dCtx.beginPath(); dCtx.arc(x, y, r, 0, Math.PI * 2); dCtx.fill();
                    bCtx.fillStyle = Math.random() > 0.5 ? '#9e9e9e' : '#585858';
                    bCtx.beginPath(); bCtx.arc(x, y, r, 0, Math.PI * 2); bCtx.fill();
                }
                return { map: configureTex(diffC, 3, 3, true), normalMap: heightCanvasToNormalMap(bumpC, 2.8, 3, 3) };
            }

            // 5. TISSU LIN / COTON TISSÉ (Tapis, Couette, Rideaux)
            function createFabricTextures(baseHex = '#2c3244', rx = 5, ry = 5) {
                const w = 128, h = 128;
                const diffC = document.createElement('canvas'); diffC.width = w; diffC.height = h;
                const dCtx = diffC.getContext('2d');
                const bumpC = document.createElement('canvas'); bumpC.width = w; bumpC.height = h;
                const bCtx = bumpC.getContext('2d');
                dCtx.fillStyle = baseHex; dCtx.fillRect(0, 0, w, h);
                bCtx.fillStyle = '#808080'; bCtx.fillRect(0, 0, w, h);
                for (let y = 0; y < h; y += 3) {
                    dCtx.fillStyle = 'rgba(255,255,255,0.045)'; dCtx.fillRect(0, y, w, 1);
                    bCtx.fillStyle = '#a2a2a2'; bCtx.fillRect(0, y, w, 1);
                }
                for (let x = 0; x < w; x += 3) {
                    dCtx.fillStyle = 'rgba(0,0,0,0.06)'; dCtx.fillRect(x, 0, 1, h);
                    bCtx.fillStyle = '#606060'; bCtx.fillRect(x, 0, 1, h);
                }
                return { map: configureTex(diffC, rx, ry, true), bumpMap: configureTex(bumpC, rx, ry, false) };
            }

            // 6. ÉCRAN PC ABLESTUDIO DAW VIVANT ÉVOLUTIF PAR PALIER (Tier 1 Lite -> Tier 2 Studio -> Tier 3 Pro Mastering + FFT!)
            function createAbleOsScreenTexture() {
                const w = 512, h = 320;
                function buildTierBase(tier) {
                    const c = document.createElement('canvas'); c.width = w; c.height = h;
                    const ctx = c.getContext('2d');
                    if (tier === 1) {
                        // TIER 1 : Vieux DAW gris basique 2 pistes (débutant)
                        ctx.fillStyle = '#181a1c'; ctx.fillRect(0, 0, w, h);
                        ctx.fillStyle = '#26292e'; ctx.fillRect(0, 0, w, 24);
                        ctx.fillStyle = '#9ca3af'; ctx.font = 'bold 11px monospace';
                        ctx.fillText('ABLE_OS LITE v0.4 // FREE TRIAL', 12, 16);
                        ctx.fillStyle = '#101214'; ctx.fillRect(18, 40, w - 68, h - 84);
                        ctx.strokeStyle = '#3f444c'; ctx.lineWidth = 2; ctx.strokeRect(18, 40, w - 68, h - 84);
                        const cols1 = ['#6b7280', '#4ade80'];
                        const labels1 = ['DRUMS', 'SAMPLE'];
                        for (let t = 0; t < 2; t++) {
                            const ty = 64 + t * 76;
                            ctx.fillStyle = 'rgba(255,255,255,0.03)'; ctx.fillRect(26, ty, w - 84, 54);
                            ctx.fillStyle = cols1[t]; ctx.fillRect(26, ty, 6, 54);
                            ctx.font = 'bold 10px monospace'; ctx.fillText(labels1[t], 38, ty + 14);
                            for (let cl = 0; cl < 2; cl++) {
                                const cx = 48 + cl * 165;
                                ctx.fillStyle = cols1[t] + '28'; ctx.fillRect(cx, ty + 18, 138, 28);
                                ctx.strokeStyle = cols1[t]; ctx.lineWidth = 1; ctx.strokeRect(cx, ty + 18, 138, 28);
                                ctx.fillStyle = cols1[t];
                                for (let bx = cx + 6; bx < cx + 132; bx += 6) {
                                    const bh = 4 + Math.abs(Math.sin(bx * 0.18 + t)) * 16;
                                    ctx.fillRect(bx, ty + 32 - bh / 2, 3, bh);
                                }
                            }
                        }
                        ctx.fillStyle = '#0c0d0f'; ctx.fillRect(w - 42, 40, 24, h - 84);
                        ctx.fillStyle = 'rgba(255,255,255,0.08)'; ctx.fillRect(18, h - 30, w - 36, 18);
                        ctx.fillStyle = '#9ca3af'; ctx.font = '10px monospace'; ctx.fillText('CPU 84%  •  BUFFER 512  •  MONO OUT', 28, h - 18);
                        return c;
                    }
                    const isPro = (tier >= 3);
                    const bg = ctx.createLinearGradient(0, 0, w, h);
                    bg.addColorStop(0, isPro ? '#090e1c' : '#0f1422');
                    bg.addColorStop(0.5, isPro ? '#11182d' : '#161c2e');
                    bg.addColorStop(1, '#080c16');
                    ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);

                    ctx.fillStyle = 'rgba(0,0,0,0.72)'; ctx.fillRect(0, 0, w, 24);
                    ctx.fillStyle = isPro ? '#f59e0b' : '#818cf8'; ctx.font = 'bold 11px monospace';
                    ctx.fillText(isPro ? 'ABLE_OS PRO // MASTERING SUITE' : 'ABLE_OS STUDIO // v2.4', 12, 16);

                    const arrH = isPro ? (h - 114) : (h - 72);
                    ctx.fillStyle = '#0e121f'; ctx.fillRect(18, 34, w - 68, arrH);
                    ctx.strokeStyle = isPro ? 'rgba(245,158,11,0.42)' : 'rgba(129,140,248,0.45)';
                    ctx.lineWidth = 1.5; ctx.strokeRect(18, 34, w - 68, arrH);

                    const trackColors = isPro
                        ? ['#818cf8', '#38bdf8', '#34d399', '#f472b6', '#fbbf24', '#fb7185']
                        : ['#818cf8', '#38bdf8', '#34d399', '#f472b6', '#fbbf24'];
                    const rowStep = isPro ? 32 : 38;
                    const rowH = isPro ? 24 : 30;
                    for (let t = 0; t < trackColors.length; t++) {
                        const ty = 44 + t * rowStep;
                        ctx.fillStyle = 'rgba(255,255,255,0.04)'; ctx.fillRect(26, ty, w - 84, rowH);
                        ctx.fillStyle = trackColors[t]; ctx.fillRect(26, ty, 5, rowH);
                        for (let cl = 0; cl < 3; cl++) {
                            const cx = 40 + cl * 128 + (t % 2) * 14;
                            const cw = 104;
                            ctx.fillStyle = trackColors[t] + '33'; ctx.fillRect(cx, ty + 2, cw, rowH - 4);
                            ctx.strokeStyle = trackColors[t]; ctx.lineWidth = 1; ctx.strokeRect(cx, ty + 2, cw, rowH - 4);
                            ctx.fillStyle = trackColors[t];
                            for (let bx = cx + 4; bx < cx + cw - 4; bx += 4) {
                                const bh = 3 + Math.abs(Math.sin(bx * 0.25 + t)) * (rowH - 10);
                                ctx.fillRect(bx, ty + rowH / 2 - bh / 2, 2, bh);
                            }
                        }
                    }
                    // Master VU Housing on right
                    ctx.fillStyle = '#090b12'; ctx.fillRect(w - 42, 34, 26, arrH);
                    ctx.strokeStyle = 'rgba(255,255,255,0.12)'; ctx.strokeRect(w - 42, 34, 26, arrH);

                    // Zone Analyseur Spectral FFT en bas pour Tier 3 Pro!
                    if (isPro) {
                        ctx.fillStyle = '#080b14'; ctx.fillRect(18, h - 72, w - 34, 42);
                        ctx.strokeStyle = 'rgba(56,189,248,0.28)'; ctx.strokeRect(18, h - 72, w - 34, 42);
                    }
                    // Bottom Dock
                    ctx.fillStyle = 'rgba(255,255,255,0.08)'; ctx.fillRect(150, h - 24, 212, 16);
                    for (let i = 0; i < 5; i++) {
                        ctx.fillStyle = trackColors[i]; ctx.fillRect(164 + i * 38, h - 21, 22, 10);
                    }
                    return c;
                }

                window._pcTierBases = { 1: buildTierBase(1), 2: buildTierBase(2), 3: buildTierBase(3) };
                const liveC = document.createElement('canvas'); liveC.width = w; liveC.height = h;
                const liveCtx = liveC.getContext('2d');
                liveCtx.drawImage(window._pcTierBases[1], 0, 0);
                const liveTex = configureTex(liveC, 1, 1, true);

                window._pcLiveCtx = liveCtx;
                window._pcLiveTex = liveTex;
                window._pcLiveLastTs = 0;
                window.updateLivePcScreen = function(tSec) {
                    const now = performance.now();
                    if (now - window._pcLiveLastTs < 65) return;
                    window._pcLiveLastTs = now;
                    const tier = window.currentRoomVisualTier || 1;
                    const baseImg = window._pcTierBases[tier] || window._pcTierBases[3];
                    const ctx = window._pcLiveCtx;
                    ctx.drawImage(baseImg, 0, 0);

                    const recOn = Math.floor(tSec * 2) % 2 === 0;
                    const sysT = window._loginPreviewClockStr || document.getElementById('sys-time')?.textContent || '12:00';
                    ctx.fillStyle = tier === 1 ? '#9ca3af' : (recOn ? '#34d399' : '#10b981');
                    ctx.font = 'bold 11px monospace';
                    ctx.fillText(tier === 1 ? `92 BPM • ${sysT}` : `128 BPM • ${sysT}`, w - 132, 16);

                    const arrH = tier >= 3 ? (h - 114) : (tier === 1 ? (h - 84) : (h - 72));
                    const arrTop = tier === 1 ? 42 : 36;
                    const minX = 34, maxX = w - 58;
                    const playX = minX + ((tSec * (tier === 1 ? 34 : 52)) % (maxX - minX));
                    ctx.fillStyle = tier === 1 ? '#eab308' : '#f43f5e';
                    ctx.fillRect(playX, arrTop, 2.5, arrH - 4);
                    ctx.fillStyle = tier === 1 ? 'rgba(234,179,8,0.18)' : 'rgba(244,63,94,0.22)';
                    ctx.fillRect(playX - 5, arrTop, 12, arrH - 4);

                    // Stereo Bouncing Master VU-Meters
                    const vuH = arrH - 12;
                    const lvL = 0.28 + 0.54 * Math.abs(Math.sin(tSec * 5.2) * Math.cos(tSec * 2.1));
                    const lvR = 0.25 + 0.56 * Math.abs(Math.sin(tSec * 5.6 + 0.6) * Math.cos(tSec * 1.9));
                    [lvL, lvR].forEach((lv, ch) => {
                        const x0 = w - 38 + ch * 10;
                        const segs = tier === 1 ? 12 : 16;
                        const lit = Math.floor(lv * segs);
                        for (let s = 0; s < lit; s++) {
                            const sy = (arrTop + arrH - 6) - (s + 1) * (vuH / segs);
                            ctx.fillStyle = s > segs - 3 ? '#f43f5e' : (s > segs - 6 ? '#fbbf24' : '#34d399');
                            ctx.fillRect(x0, sy, 7, (vuH / segs) - 2);
                        }
                    });

                    // Analyseur Spectral FFT 20 bandes animé en bas (Tier 3 Pro uniquement!)
                    if (tier >= 3) {
                        const bars = 22;
                        for (let b = 0; b < bars; b++) {
                            const amp = 0.18 + 0.78 * Math.abs(Math.sin(tSec * 4.4 + b * 0.55) * Math.cos(tSec * 2.3 - b * 0.28));
                            const bh = Math.max(4, amp * 32);
                            const bx = 26 + b * 21;
                            ctx.fillStyle = b < 6 ? '#818cf8' : (b < 15 ? '#38bdf8' : '#f59e0b');
                            ctx.fillRect(bx, h - 34 - bh, 14, bh);
                        }
                    }
                    window._pcLiveTex.needsUpdate = true;
                };

                // TV Lo-Fi Live Visualizer CanvasTexture
                const tvC = document.createElement('canvas'); tvC.width = 256; tvC.height = 160;
                const tvCtx = tvC.getContext('2d');
                const tvTex = configureTex(tvC, 1, 1, true);
                window._tvLiveCtx = tvCtx;
                window._tvLiveTex = tvTex;
                window._tvLiveLastTs = 0;
                if (window.tvScreenMat) {
                    window.tvScreenMat.map = tvTex;
                    window.tvScreenMat.emissiveMap = tvTex;
                    window.tvScreenMat.needsUpdate = true;
                }
                window.updateLiveTvScreen = function(tSec) {
                    const now = performance.now();
                    if (now - window._tvLiveLastTs < 70) return;
                    window._tvLiveLastTs = now;
                    const ctx = window._tvLiveCtx;
                    const tw = 256, th = 160;
                    const g = ctx.createLinearGradient(0, 0, 0, th);
                    g.addColorStop(0, '#120824'); g.addColorStop(0.55, '#2b1055'); g.addColorStop(1, '#090d1a');
                    ctx.fillStyle = g; ctx.fillRect(0, 0, tw, th);

                    // Retro Sun
                    const sunG = ctx.createLinearGradient(0, 26, 0, 96);
                    sunG.addColorStop(0, '#fde047'); sunG.addColorStop(0.55, '#fb7185'); sunG.addColorStop(1, '#a855f7');
                    ctx.fillStyle = sunG;
                    ctx.beginPath(); ctx.arc(tw / 2, 66, 30, 0, Math.PI * 2); ctx.fill();
                    // Sun horizontal slices
                    ctx.fillStyle = '#240d46';
                    for (let sy = 68; sy < 98; sy += 6) ctx.fillRect(tw / 2 - 34, sy, 68, 2);

                    // Animated Audio Spectrum Bars
                    const bars = 24;
                    const bw = (tw - 24) / bars;
                    for (let i = 0; i < bars; i++) {
                        const amp = 8 + Math.abs(Math.sin(tSec * 3.8 + i * 0.45) * Math.cos(tSec * 1.9 - i * 0.25)) * 46;
                        ctx.fillStyle = i % 2 === 0 ? '#38bdf8' : '#c084fc';
                        ctx.fillRect(12 + i * bw, th - 16 - amp, bw - 3, amp);
                    }
                    // Channel tag
                    ctx.fillStyle = '#34d399'; ctx.font = 'bold 9px monospace';
                    ctx.fillText('LO-FI RADIO 24/7  ●', 12, 16);
                    window._tvLiveTex.needsUpdate = true;
                };

                return liveTex;
            }

            // 7. CONTACT SHADOW (BAKED AO DECAL TEXTURE)
            function createSoftAOTexture() {
                const s = 128;
                const c = document.createElement('canvas'); c.width = s; c.height = s;
                const ctx = c.getContext('2d');
                const grad = ctx.createRadialGradient(s/2, s/2, s*0.08, s/2, s/2, s*0.5);
                grad.addColorStop(0, 'rgba(10, 8, 6, 0.55)');
                grad.addColorStop(0.55, 'rgba(10, 8, 6, 0.24)');
                grad.addColorStop(1, 'rgba(10, 8, 6, 0.0)');
                ctx.fillStyle = grad; ctx.fillRect(0, 0, s, s);
                const t = new THREE.CanvasTexture(c);
                return t;
            }

            // 8. 4 FAÇADES ARCHITECTURALES RÉALISTES POUR LA VILLE EXTÉRIEURE (DIFFUSE + EMISSIVE)
            function createRealisticFacadePair(style = 'glass_tower') {
                const w = 256, h = 512;
                const diffC = document.createElement('canvas'); diffC.width = w; diffC.height = h;
                const dCtx = diffC.getContext('2d');
                const emiC = document.createElement('canvas'); emiC.width = w; emiC.height = h;
                const eCtx = emiC.getContext('2d');

                eCtx.fillStyle = '#000000'; eCtx.fillRect(0, 0, w, h);

                if (style === 'glass_tower') {
                    // Tour de verre moderne avec reflets ciel & étages de bureaux réalistes
                    const g = dCtx.createLinearGradient(0, 0, 0, h);
                    g.addColorStop(0, '#4f6278'); g.addColorStop(0.5, '#3b4a5e'); g.addColorStop(1, '#263140');
                    dCtx.fillStyle = g; dCtx.fillRect(0, 0, w, h);
                    const floorH = 18;
                    for (let y = 0; y < h; y += floorH) {
                        // Dalle béton entre étages
                        dCtx.fillStyle = '#1e2530'; dCtx.fillRect(0, y, w, 5);
                        const floorLit = Math.random() < 0.32;
                        for (let x = 0; x < w; x += 22) {
                            // Montant aluminium
                            dCtx.fillStyle = '#19202b'; dCtx.fillRect(x, y, 2, floorH);
                            // Reflet vitre subtil
                            const paneShade = 0.06 + ((x * 7 + y * 3) % 10) * 0.012;
                            dCtx.fillStyle = `rgba(180,210,245,${paneShade})`;
                            dCtx.fillRect(x + 2, y + 5, 20, floorH - 5);
                            // Bureaux éclairés de manière cohérente par sections
                            if ((floorLit && Math.random() < 0.72) || Math.random() < 0.09) {
                                const warm = Math.random() < 0.65 ? '#ffe7ba' : '#dbeafe';
                                eCtx.fillStyle = warm;
                                eCtx.globalAlpha = 0.35 + Math.random() * 0.5;
                                eCtx.fillRect(x + 3, y + 6, 18, floorH - 7);
                                // Store partiellement baissé
                                if (Math.random() < 0.35) {
                                    eCtx.fillStyle = '#000000'; eCtx.globalAlpha = 0.55;
                                    eCtx.fillRect(x + 3, y + 6, 18, (floorH - 7) * 0.45);
                                }
                            }
                        }
                    }
                    eCtx.globalAlpha = 1;
                } else if (style === 'concrete_loft') {
                    // Immeuble résidentiel béton architectural + balcons en retrait
                    dCtx.fillStyle = '#6f6c66'; dCtx.fillRect(0, 0, w, h);
                    for (let y = 8; y < h; y += 26) {
                        dCtx.fillStyle = '#57544e'; dCtx.fillRect(0, y, w, 5);
                        dCtx.fillStyle = '#85817a'; dCtx.fillRect(0, y + 5, w, 2);
                        for (let x = 10; x < w - 12; x += 36) {
                            // Renfoncement balcon sombre
                            dCtx.fillStyle = '#252629'; dCtx.fillRect(x, y + 7, 26, 18);
                            // Fenêtre vitrée
                            dCtx.fillStyle = '#364152'; dCtx.fillRect(x + 3, y + 9, 20, 14);
                            // Garde-corps balcon
                            dCtx.fillStyle = 'rgba(200,205,215,0.22)'; dCtx.fillRect(x, y + 18, 26, 7);
                            if (Math.random() < 0.28) {
                                eCtx.fillStyle = Math.random() < 0.8 ? '#ffd89b' : '#fff1d6';
                                eCtx.globalAlpha = 0.45 + Math.random() * 0.45;
                                eCtx.fillRect(x + 4, y + 10, 18, 10);
                            }
                        }
                    }
                    eCtx.globalAlpha = 1;
                } else if (style === 'haussmann') {
                    // Immeuble pierre calcaire / haussmannien
                    dCtx.fillStyle = '#9c9282'; dCtx.fillRect(0, 0, w, h);
                    // Toit ardoise en haut
                    dCtx.fillStyle = '#333b48'; dCtx.fillRect(0, 0, w, 44);
                    for (let y = 52; y < h; y += 34) {
                        dCtx.fillStyle = '#b4aa9a'; dCtx.fillRect(0, y, w, 4);
                        for (let x = 14; x < w - 16; x += 32) {
                            dCtx.fillStyle = '#2a303b'; dCtx.fillRect(x, y + 8, 16, 22);
                            dCtx.fillStyle = '#7c7366'; dCtx.fillRect(x - 2, y + 6, 20, 2);
                            if (Math.random() < 0.34) {
                                eCtx.fillStyle = '#ffdfb0'; eCtx.globalAlpha = 0.5 + Math.random() * 0.4;
                                eCtx.fillRect(x + 2, y + 10, 12, 18);
                            }
                        }
                    }
                    eCtx.globalAlpha = 1;
                } else {
                    // Tour commerciale sombre à rubans horizontaux
                    dCtx.fillStyle = '#383f4d'; dCtx.fillRect(0, 0, w, h);
                    for (let y = 6; y < h; y += 16) {
                        dCtx.fillStyle = '#1d2432'; dCtx.fillRect(6, y, w - 12, 9);
                        if (Math.random() < 0.25) {
                            const segX = 10 + Math.floor(Math.random() * 4) * 45;
                            const segW = 40 + Math.random() * 90;
                            eCtx.fillStyle = Math.random() < 0.5 ? '#ffeac2' : '#cfe5ff';
                            eCtx.globalAlpha = 0.45;
                            eCtx.fillRect(segX, y + 1, Math.min(w - 16 - segX, segW), 7);
                        }
                    }
                    eCtx.globalAlpha = 1;
                }
                return {
                    map: configureTex(diffC, 1, 1, true),
                    emissiveMap: configureTex(emiC, 1, 1, true)
                };
            }

            // 9. TEXTURE VOLUMÉTRIQUE DE RAYON DE SOLEIL
            function createSunbeamTexture() {
                const c = document.createElement('canvas'); c.width = 256; c.height = 256;
                const ctx = c.getContext('2d');
                const grad = ctx.createLinearGradient(0, 0, 0, 256);
                grad.addColorStop(0, 'rgba(255,244,224,0.38)');
                grad.addColorStop(0.55, 'rgba(255,240,215,0.12)');
                grad.addColorStop(1, 'rgba(255,240,215,0.0)');
                ctx.fillStyle = grad; ctx.fillRect(0, 0, 256, 256);
                // Soft side fade
                ctx.globalCompositeOperation = 'destination-in';
                const hGrad = ctx.createLinearGradient(0, 0, 256, 0);
                hGrad.addColorStop(0, 'rgba(0,0,0,0)');
                hGrad.addColorStop(0.25, 'rgba(0,0,0,1)');
                hGrad.addColorStop(0.75, 'rgba(0,0,0,1)');
                hGrad.addColorStop(1, 'rgba(0,0,0,0)');
                ctx.fillStyle = hGrad; ctx.fillRect(0, 0, 256, 256);
                return new THREE.CanvasTexture(c);
            }

            const oakTex = createOakFloorTextures();
            const wallTex = createWallPlasterTextures('#ccc6bd', true, 2.5, 1);
            const ceilTex = createWallPlasterTextures('#dedad2', false, 3, 3);
            const walnutTex = createWalnutTextures(2, 1);
            const leatherTex = createLeatherTextures();
            const rugTex = createFabricTextures('#282e3f', 6, 5);
            const blanketTex = createFabricTextures('#334761', 5, 5);
            const curtainTex = createFabricTextures('#d8d2c7', 2, 4);
            const screenTex = createAbleOsScreenTexture();
            const aoTex = createSoftAOTexture();
            const beamTex = createSunbeamTexture();

            // --- PURGE DES CONTOURS CARTOON NOIRS (LineSegments) ---
            scene.traverse(obj => {
                if (obj.isLineSegments || obj.isLine) {
                    obj.visible = false;
                    obj.userData.originalVisible = false;
                }
            });

            // --- UPGRADE MATÉRIAUX EXISTANTS VERS PHOTORÉALISME LUMINEUX ---
            floorMat.map = oakTex.map;
            floorMat.bumpMap = null;
            floorMat.normalMap = oakTex.normalMap;
            floorMat.normalScale = new THREE.Vector2(0.85, 0.85);
            floorMat.roughnessMap = oakTex.roughnessMap;
            floorMat.color.set('#ffffff');
            floorMat.roughness = 0.42;
            floorMat.metalness = 0.04;
            floorMat.envMapIntensity = 0.72;
            floorMat.needsUpdate = true;

            wallMat.map = wallTex.map;
            wallMat.bumpMap = null;
            wallMat.normalMap = wallTex.normalMap;
            wallMat.normalScale = new THREE.Vector2(0.42, 0.42);
            wallMat.color.set('#f5f1ea');
            wallMat.roughness = 0.88;
            wallMat.metalness = 0.01;
            wallMat.envMapIntensity = 0.35;
            wallMat.needsUpdate = true;

            deskTopMat.map = walnutTex.map;
            deskTopMat.bumpMap = null;
            deskTopMat.normalMap = walnutTex.normalMap;
            deskTopMat.normalScale = new THREE.Vector2(0.65, 0.65);
            deskTopMat.color.set('#dfb998');
            deskTopMat.roughness = 0.34;
            deskTopMat.metalness = 0.06;
            deskTopMat.envMapIntensity = 0.75;
            deskTopMat.needsUpdate = true;

            legMat.color.set('#1e2128');
            legMat.roughness = 0.26;
            legMat.metalness = 0.88;
            legMat.envMapIntensity = 1.1;
            legMat.needsUpdate = true;

            pcFrameMat.color.set('#14171d');
            pcFrameMat.roughness = 0.22;
            pcFrameMat.metalness = 0.78;
            pcFrameMat.envMapIntensity = 1.15;
            pcFrameMat.needsUpdate = true;

            pcScreenMat.map = screenTex;
            pcScreenMat.emissiveMap = screenTex;
            pcScreenMat.color.set('#ffffff');
            pcScreenMat.emissive.set('#ffffff');
            pcScreenMat.emissiveIntensity = 0.92;
            pcScreenMat.roughness = 0.34;
            pcScreenMat.metalness = 0.08;
            pcScreenMat.needsUpdate = true;

            // Clavier & Souris pro satinés (Adieu plastique blanc plat !)
            kbdBaseMat.color.set('#22262f');
            kbdBaseMat.roughness = 0.32;
            kbdBaseMat.metalness = 0.65;
            kbdBaseMat.needsUpdate = true;
            keyMat.color.set('#181a20');
            keyMat.roughness = 0.52;
            keyMat.metalness = 0.08;
            keyMat.needsUpdate = true;
            mouseMat.color.set('#1f222a');
            mouseMat.roughness = 0.35;
            mouseMat.metalness = 0.18;
            mouseMat.needsUpdate = true;

            speakerMat.color.set('#1d2028');
            speakerMat.roughness = 0.44;
            speakerMat.metalness = 0.16;
            speakerMat.needsUpdate = true;

            // Lit lumineux & texturé
            frameMat.map = walnutTex.map; frameMat.color.set('#8f6b4f'); frameMat.roughness = 0.5; frameMat.needsUpdate = true;
            mattressMat.map = curtainTex.map; mattressMat.color.set('#f4f1ea'); mattressMat.roughness = 0.9; mattressMat.needsUpdate = true;
            blanketMat.map = blanketTex.map; blanketMat.bumpMap = blanketTex.bumpMap; blanketMat.bumpScale = 0.025;
            blanketMat.color.set('#d7e2f2'); blanketMat.roughness = 0.92; blanketMat.needsUpdate = true;
            pillowMat.map = curtainTex.map; pillowMat.color.set('#f8f6f2'); pillowMat.roughness = 0.88; pillowMat.needsUpdate = true;

            crateMat.map = walnutTex.map; crateMat.bumpMap = null; crateMat.normalMap = walnutTex.normalMap; crateMat.normalScale = new THREE.Vector2(0.7, 0.7);
            crateMat.color.set('#d1a67e'); crateMat.roughness = 0.58; crateMat.needsUpdate = true;

            rugMat.map = rugTex.map; rugMat.bumpMap = rugTex.bumpMap; rugMat.bumpScale = 0.03;
            rugMat.color.set('#d8dde8'); rugMat.roughness = 0.95; rugMat.needsUpdate = true;

            doorMat.map = walnutTex.map; doorMat.bumpMap = null; doorMat.normalMap = walnutTex.normalMap; doorMat.normalScale = new THREE.Vector2(0.65, 0.65);
            doorMat.color.set('#b89270'); doorMat.roughness = 0.48; doorMat.needsUpdate = true;

            if (typeof sofaGroup !== 'undefined') {
                sofaGroup.traverse(ch => {
                    if (ch.isMesh && ch.material) {
                        const mat = ch.userData.originalMaterial || ch.material;
                        if (mat.isMeshStandardMaterial) {
                            mat.map = leatherTex.map; mat.bumpMap = null; mat.normalMap = leatherTex.normalMap; mat.normalScale = new THREE.Vector2(0.75, 0.75);
                            mat.color.set('#c79878'); mat.roughness = 0.38; mat.metalness = 0.06; mat.envMapIntensity = 0.72;
                            mat.needsUpdate = true;
                        }
                    }
                });
            }

            // =========================================================================
            // ARCHITECTURE COMPLÈTE + OMBRES DE CONTACT (AO) + DÉCO STUDIO PRO
            // =========================================================================
            const archGroup = new THREE.Group();
            archGroup.name = 'StudioArchitecture';

            // Helper Contact Shadow Decal
            const aoMat = new THREE.MeshBasicMaterial({
                map: aoTex, transparent: true, opacity: 0.72, depthWrite: false,
                polygonOffset: true, polygonOffsetFactor: -1
            });
            function addContactAO(x, y, z, w, d, op = 0.65) {
                const m = op === 0.65 ? aoMat : aoMat.clone();
                if (op !== 0.65) m.opacity = op;
                const p = new THREE.Mesh(new THREE.PlaneGeometry(w, d), m);
                p.rotation.x = -Math.PI / 2;
                p.position.set(x, y, z);
                archGroup.add(p);
            }
            // AO sous le bureau, lit, bac à vinyles, fauteuil
            addContactAO(-2.2, -0.996, -3.5, 5.2, 2.9, 0.58);
            addContactAO(3.8, -0.996, -2.9, 3.0, 4.8, 0.55);
            addContactAO(3.8, -0.996, 0.5, 2.0, 1.7, 0.52);
            addContactAO(-1.25, -0.996, -2.02, 1.25, 1.25, 0.48);

            // Plinthes (Baseboards) architecturales en chêne foncé autour des 4 murs
            const baseboardMat = new THREE.MeshStandardMaterial({
                map: walnutTex.map, color: '#7a5c44', roughness: 0.42, metalness: 0.04
            });
            const bbN = new THREE.Mesh(new THREE.BoxGeometry(10, 0.16, 0.07), baseboardMat);
            bbN.position.set(0, -0.92, -4.965); bbN.receiveShadow = true; archGroup.add(bbN);
            const bbW = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.16, 10), baseboardMat);
            bbW.position.set(-4.965, -0.92, 0); bbW.receiveShadow = true; archGroup.add(bbW);
            const bbS = new THREE.Mesh(new THREE.BoxGeometry(10, 0.16, 0.07), baseboardMat);
            bbS.position.set(0, -0.92, 4.965); bbS.receiveShadow = true; archGroup.add(bbS);
            const bbE = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.16, 10), baseboardMat);
            bbE.position.set(4.965, -0.92, 0); bbE.receiveShadow = true; archGroup.add(bbE);

            // --- MUR SUD (Z = +5) : TASSEAUX BOIS + DISQUES D'OR + APPLIQUES MURALES ---
            const wallSouth = new THREE.Mesh(new THREE.BoxGeometry(10, 5, 0.16), wallMat);
            wallSouth.position.set(0, 1.5, 5.05); wallSouth.receiveShadow = false;
            archGroup.add(wallSouth);

            const slatBackMat = new THREE.MeshStandardMaterial({ color: '#181a20', roughness: 0.95 });
            const slatBack = new THREE.Mesh(new THREE.BoxGeometry(4.6, 3.8, 0.04), slatBackMat);
            slatBack.position.set(0, 1.45, 4.94); slatBack.receiveShadow = true;
            archGroup.add(slatBack);

            const slatWoodMat = new THREE.MeshStandardMaterial({
                map: walnutTex.map, color: '#d4a77b', roughness: 0.44, metalness: 0.04
            });
            for (let sx = -2.16; sx <= 2.18; sx += 0.16) {
                const slat = new THREE.Mesh(new THREE.BoxGeometry(0.08, 3.74, 0.055), slatWoodMat);
                slat.position.set(sx, 1.45, 4.91); slat.receiveShadow = true;
                archGroup.add(slat);
            }

            // 3 Disques Évolutifs sur le Mur Sud (Vinyle noir mat -> Argent -> Or -> Platine + Noms des meilleurs sons du joueur!)
            const frameBlackMat = new THREE.MeshStandardMaterial({ color: '#111318', roughness: 0.25, metalness: 0.65 });
            window.careerWallDiscs = [];
            window.proStudioWallDiscs = [];

            function drawAwardPlaqueCanvas(ctx, track, idx, unlocked, certLabel, accentHex, artistName) {
                const w = 512, h = 192;
                const bg = ctx.createLinearGradient(0, 0, w, h);
                bg.addColorStop(0, '#0d0f15'); bg.addColorStop(0.5, '#151923'); bg.addColorStop(1, '#0a0c11');
                ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);

                ctx.strokeStyle = unlocked ? accentHex : 'rgba(148,163,184,0.28)';
                ctx.lineWidth = 4;
                ctx.strokeRect(8, 8, w - 16, h - 16);
                ctx.lineWidth = 1;
                ctx.strokeRect(16, 16, w - 32, h - 32);

                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';

                if (track && track.title) {
                    const rawTitle = String(track.title).replace(/^ARCHIVED_(HIT|TUNE|FLOP)_/i, 'SESSION #');
                    const cleanTitle = rawTitle.length > 20 ? rawTitle.slice(0, 19) + '…' : rawTitle;
                    const scoreStr = track.score ? ` • ${Number(track.score).toFixed(1)}/10` : '';
                    const genreStr = (track.genre && track.genre !== 'UNKNOWN') ? track.genre.toUpperCase() : 'ORIGINAL MIX';

                    ctx.fillStyle = unlocked ? accentHex : '#94a3b8';
                    ctx.font = '600 19px ui-monospace, SFMono-Regular, Menlo, monospace';
                    ctx.fillText(`★ ${certLabel} • TOP #${idx + 1}${scoreStr}`, w / 2, 44);

                    ctx.fillStyle = '#ffffff';
                    ctx.font = '800 42px Outfit, -apple-system, sans-serif';
                    ctx.fillText(`"${cleanTitle.toUpperCase()}"`, w / 2, 98);

                    ctx.fillStyle = 'rgba(226,232,240,0.72)';
                    ctx.font = '500 20px Outfit, -apple-system, sans-serif';
                    ctx.fillText(`${(artistName || 'ARTISTE').toUpperCase()}  •  ${genreStr}`, w / 2, 148);
                } else {
                    ctx.fillStyle = 'rgba(148,163,184,0.55)';
                    ctx.font = '600 19px ui-monospace, SFMono-Regular, Menlo, monospace';
                    ctx.fillText(`EMPLACEMENT TROPHÉE #${idx + 1}`, w / 2, 56);
                    ctx.fillStyle = 'rgba(226,232,240,0.45)';
                    ctx.font = '600 28px Outfit, -apple-system, sans-serif';
                    ctx.fillText('AUCUN TITRE CERTIFIÉ', w / 2, 106);
                    ctx.font = '400 18px Outfit, -apple-system, sans-serif';
                    ctx.fillText('Produis un hit sur AbleOS pour le graver ici', w / 2, 146);
                }
            }

            [-1.28, 0, 1.28].forEach((rx, idx) => {
                const recFrame = new THREE.Mesh(new THREE.BoxGeometry(0.84, 1.02, 0.05), frameBlackMat);
                recFrame.position.set(rx, 2.05, 4.85);
                const matBacking = new THREE.Mesh(new THREE.PlaneGeometry(0.74, 0.92), new THREE.MeshStandardMaterial({ color: '#14161e', roughness: 0.9 }));
                matBacking.position.set(0, 0, -0.026); matBacking.rotation.y = Math.PI;
                recFrame.add(matBacking);
                const dMat = new THREE.MeshStandardMaterial({ color: '#14161c', roughness: 0.55, metalness: 0.2, envMapIntensity: 0.8 });
                const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.015, 32), dMat);
                disc.rotation.x = Math.PI / 2; disc.position.set(0, 0.14, -0.032);
                recFrame.add(disc);
                const labelCenter = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.018, 20), new THREE.MeshStandardMaterial({ color: idx === 1 ? '#818cf8' : '#334155', roughness: 0.7 }));
                labelCenter.rotation.x = Math.PI / 2; labelCenter.position.set(0, 0.14, -0.033);
                recFrame.add(labelCenter);

                const plC = document.createElement('canvas'); plC.width = 512; plC.height = 192;
                const plCtx = plC.getContext('2d');
                const plTex = configureTex(plC, 1, 1, true);
                const plaqueMesh = new THREE.Mesh(
                    new THREE.PlaneGeometry(0.66, 0.24),
                    new THREE.MeshStandardMaterial({ map: plTex, emissive: '#ffffff', emissiveMap: plTex, emissiveIntensity: 0.38, roughness: 0.28, metalness: 0.2 })
                );
                plaqueMesh.position.set(0, -0.28, -0.033);
                plaqueMesh.rotation.y = Math.PI;
                recFrame.add(plaqueMesh);

                archGroup.add(recFrame);
                window.careerWallDiscs.push({ mat: dMat, label: labelCenter.material, tier: idx, plaqueCtx: plCtx, plaqueTex: plTex });
            });
            window.syncCareerWallDiscs = function(overrideState) {
                const st = overrideState || (typeof state !== 'undefined' ? state : null);
                if (!window.careerWallDiscs || !st) return;
                const albumEntries = Array.isArray(st.albums)
                    ? st.albums.slice().sort((a, b) => (Number(b.score) || 0) - (Number(a.score) || 0)).map(a => ({
                        title: `LP: ${a.title}`,
                        genre: `${a.trackCount || 3} TRACKS · ${a.cert || 'ALBUM'}`,
                        score: a.score
                    }))
                    : [];
                const rawTracks = Array.isArray(st.trackList)
                    ? st.trackList.slice().sort((a, b) => (Number(b.score) || 0) - (Number(a.score) || 0))
                    : [];
                const tracks = [...albumEntries, ...rawTracks];
                const hits = tracks.filter(t => (Number(t.score) || 0) >= 7).length;
                const rep = Number(st.rep) || 0;
                const artistName = st.username || 'ARTISTE';
                const tiers = [
                    { unlocked: tracks.length >= 1 || hits >= 1 || rep >= 25,  cert: "DISQUE D'ARGENT",  color: '#cbd5e1', metal: 0.92, rough: 0.20, label: '#38bdf8' },
                    { unlocked: tracks.length >= 2 || hits >= 2 || rep >= 70,  cert: "DISQUE D'OR",      color: '#facc15', metal: 0.95, rough: 0.18, label: '#f59e0b' },
                    { unlocked: tracks.length >= 3 || hits >= 4 || rep >= 140, cert: "DISQUE DE PLATINE", color: '#f1f5f9', metal: 0.98, rough: 0.12, label: '#a855f7' },
                    { unlocked: tracks.length >= 4 || hits >= 6 || rep >= 220, cert: "DISQUE DE DIAMANT", color: '#bae6fd', metal: 0.98, rough: 0.10, label: '#38bdf8' }
                ];
                window.careerWallDiscs.forEach((d, i) => {
                    const t = tiers[i] || tiers[0];
                    const trk = tracks[i] || null;
                    const isUnl = Boolean(t.unlocked && trk);
                    if (isUnl) {
                        d.mat.color.set(t.color); d.mat.metalness = t.metal; d.mat.roughness = t.rough; d.mat.envMapIntensity = 1.65;
                        d.label.color.set(t.label);
                    } else {
                        d.mat.color.set('#181a22'); d.mat.metalness = 0.22; d.mat.roughness = 0.58; d.mat.envMapIntensity = 0.6;
                        d.label.color.set('#334155');
                    }
                    d.mat.needsUpdate = true;
                    if (d.plaqueCtx && d.plaqueTex) {
                        drawAwardPlaqueCanvas(d.plaqueCtx, trk, i, isUnl, t.cert, t.label, artistName);
                        d.plaqueTex.needsUpdate = true;
                    }
                });
                if (window.proStudioWallDiscs) {
                    window.proStudioWallDiscs.forEach((pd, i) => {
                        const t = tiers[i] || tiers[3];
                        const trk = tracks[i] || null;
                        if (pd.plaqueCtx && pd.plaqueTex) {
                            drawAwardPlaqueCanvas(pd.plaqueCtx, trk, i, true, t.cert, t.label, artistName);
                            pd.plaqueTex.needsUpdate = true;
                        }
                    });
                }
            };

            // 2 Appliques murales architecturales chaudes sur le Mur Sud
            const sconceBodyMat = new THREE.MeshStandardMaterial({ color: '#181a20', roughness: 0.3, metalness: 0.8 });
            const sconceGlowMat = new THREE.MeshStandardMaterial({ color: '#fff3d6', emissive: '#ffcf87', emissiveIntensity: 1.6 });
            window.sconceGlowMat = sconceGlowMat;
            [-3.15, 3.15].forEach(sx => {
                const sconce = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.065, 0.36, 16), sconceBodyMat);
                sconce.position.set(sx, 2.05, 4.88);
                const glowTop = new THREE.Mesh(new THREE.CircleGeometry(0.055, 16), sconceGlowMat);
                glowTop.rotation.x = -Math.PI / 2; glowTop.position.set(0, 0.181, 0); sconce.add(glowTop);
                const glowBot = new THREE.Mesh(new THREE.CircleGeometry(0.055, 16), sconceGlowMat);
                glowBot.rotation.x = Math.PI / 2; glowBot.position.set(0, -0.181, 0); sconce.add(glowBot);
                archGroup.add(sconce);
            });

            // --- MUR EST (X = +5) : BAIE VITRÉE PANORAMIQUE + RIDEAUX LIN + BALCON ---
            // castShadow=false sur les pans du mur Est pour éviter la découpe diagonale artificielle sur le mur Nord
            const eastPierN = new THREE.Mesh(new THREE.BoxGeometry(0.24, 5, 3.6), wallMat);
            eastPierN.position.set(5.06, 1.5, -3.2); eastPierN.receiveShadow = true; eastPierN.castShadow = false;
            archGroup.add(eastPierN);
            const eastPierS = new THREE.Mesh(new THREE.BoxGeometry(0.24, 5, 1.4), wallMat);
            eastPierS.position.set(5.06, 1.5, 4.3); eastPierS.receiveShadow = true; eastPierS.castShadow = false;
            archGroup.add(eastPierS);
            const eastSillWall = new THREE.Mesh(new THREE.BoxGeometry(0.24, 1.05, 5.0), wallMat);
            eastSillWall.position.set(5.06, -0.475, 1.1); eastSillWall.receiveShadow = true; eastSillWall.castShadow = false;
            archGroup.add(eastSillWall);
            const eastLintel = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.65, 5.0), wallMat);
            eastLintel.position.set(5.06, 3.675, 1.1); eastLintel.receiveShadow = true; eastLintel.castShadow = false;
            archGroup.add(eastLintel);

            const aluFrameMat = new THREE.MeshStandardMaterial({ color: '#171920', roughness: 0.28, metalness: 0.85, envMapIntensity: 1.1 });
            const winSill = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.08, 5.06), new THREE.MeshStandardMaterial({ map: walnutTex.map, color: '#9c7858', roughness: 0.4 }));
            winSill.position.set(4.96, 0.06, 1.1); winSill.receiveShadow = true; archGroup.add(winSill);
            const winTopBar = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.08, 5.06), aluFrameMat);
            winTopBar.position.set(5.04, 3.32, 1.1); archGroup.add(winTopBar);
            [-1.38, 0.28, 1.95, 3.58].forEach(mz => {
                const mullion = new THREE.Mesh(new THREE.BoxGeometry(0.16, 3.28, 0.075), aluFrameMat);
                mullion.position.set(5.04, 1.69, mz); mullion.castShadow = false;
                archGroup.add(mullion);
            });
            const transom = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.055, 5.0), aluFrameMat);
            transom.position.set(5.04, 2.65, 1.1); transom.castShadow = false;
            archGroup.add(transom);

            // Tringle + Rideaux en lin drapé de chaque côté de la fenêtre (Tier 2+)
            const curtainsGroup = new THREE.Group();
            const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 5.6, 12), aluFrameMat);
            rod.rotation.x = Math.PI / 2; rod.position.set(4.84, 3.52, 1.1); curtainsGroup.add(rod);
            const curtainMat = new THREE.MeshStandardMaterial({
                map: curtainTex.map, bumpMap: curtainTex.bumpMap, bumpScale: 0.015,
                color: '#e6e0d5', roughness: 0.92, side: THREE.DoubleSide
            });
            window.curtainFolds = [];
            [-1.42, 3.62].forEach(cz => {
                for (let f = 0; f < 4; f++) {
                    const fold = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.095, 4.46, 10), curtainMat);
                    const baseX = 4.83 + (f % 2) * 0.03;
                    fold.position.set(baseX, 1.25, cz + (cz < 0 ? f * 0.13 : -f * 0.13));
                    fold.userData = { baseX: baseX, phase: f * 0.9 + (cz > 0 ? 2.1 : 0) };
                    fold.castShadow = false; fold.receiveShadow = true;
                    curtainsGroup.add(fold);
                    window.curtainFolds.push(fold);
                }
            });
            archGroup.add(curtainsGroup);

            // Double vitrage réaliste + Couche Pluie GLSL dynamique (Inspiration basse / Soirs pluvieux)
            const glassMat = new THREE.MeshStandardMaterial({
                color: '#d6e8ff', transparent: true, opacity: 0.08, roughness: 0.05, metalness: 0.65,
                envMapIntensity: 1.5, side: THREE.DoubleSide, depthWrite: false
            });
            const windowGlass = new THREE.Mesh(new THREE.PlaneGeometry(4.96, 3.22), glassMat);
            windowGlass.position.set(5.05, 1.69, 1.1); windowGlass.rotation.y = -Math.PI / 2;
            archGroup.add(windowGlass);

            const rainUniforms = {
                uTime: { value: 0.0 },
                uRainIntensity: { value: 0.0 },
                uLightning: { value: 0.0 }
            };
            window.windowRainUniforms = rainUniforms;
            const rainGlassMat = new THREE.ShaderMaterial({
                uniforms: rainUniforms,
                transparent: true,
                depthWrite: false,
                side: THREE.DoubleSide,
                vertexShader: `
                    varying vec2 vUv;
                    void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
                `,
                fragmentShader: `
                    uniform float uTime;
                    uniform float uRainIntensity;
                    uniform float uLightning;
                    varying vec2 vUv;

                    float hash21(vec2 p) {
                        p = fract(p * vec2(123.34, 456.21));
                        p += dot(p, p + 45.32);
                        return fract(p.x * p.y);
                    }
                    float rainLayer(vec2 uv, float t, float scale) {
                        vec2 st = uv * vec2(scale * 1.45, scale * 0.55);
                        vec2 id = floor(st);
                        float n = hash21(id);
                        float speed = 0.45 + n * 0.65;
                        st.y += t * speed + n * 10.0;
                        vec2 gv = fract(st) - 0.5;
                        float xOff = sin(st.y * 2.5 + n * 6.28) * 0.16;
                        float dropY = sin(t * speed * 2.0 + n * 6.28) * 0.25;
                        vec2 dPos = vec2((gv.x - xOff) * 1.8, (gv.y - dropY) * 1.1);
                        float drop = smoothstep(0.16, 0.04, length(dPos));
                        float trail = smoothstep(0.08, 0.01, abs(gv.x - xOff)) * smoothstep(-0.45, 0.2, gv.y - dropY) * smoothstep(0.45, 0.1, gv.y - dropY) * 0.35;
                        return clamp(drop + trail, 0.0, 1.0) * step(0.32, n);
                    }
                    void main() {
                        if (uRainIntensity < 0.01) discard;
                        float r1 = rainLayer(vUv, uTime * 1.1, 16.0);
                        float r2 = rainLayer(vUv + 0.37, uTime * 0.85, 28.0) * 0.7;
                        float mist = 0.08 * uRainIntensity;
                        float drops = clamp(r1 + r2, 0.0, 1.0);
                        vec3 col = mix(vec3(0.65, 0.78, 0.92), vec3(0.95, 0.98, 1.0), drops + uLightning * 0.7);
                        float alpha = clamp((drops * 0.48 + mist) * uRainIntensity, 0.0, 0.62);
                        gl_FragColor = vec4(col, alpha);
                    }
                `
            });
            const rainPane = new THREE.Mesh(new THREE.PlaneGeometry(4.94, 3.18), rainGlassMat);
            rainPane.position.set(5.01, 1.69, 1.1); rainPane.rotation.y = -Math.PI / 2;
            archGroup.add(rainPane);

            // Faisceaux plats artificiels supprimés : éclairage naturel PBR pur (windowBounceLight + dirLight douce)
            window.sunbeamMat = null;
            window.sunDustPoints = null;

            // --- BALCON ARCHITECTURAL EXTÉRIEUR + VASTE MÉTROPOLE 3D ULTRA-RÉALISTE ---
            const exteriorGroup = new THREE.Group();
            exteriorGroup.name = 'CityExterior';

            const balconyMat = new THREE.MeshStandardMaterial({ color: '#6b6d72', roughness: 0.88 });
            const balconySlab = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.25, 6.2), balconyMat);
            balconySlab.position.set(6.05, -1.02, 1.1); balconySlab.receiveShadow = true;
            exteriorGroup.add(balconySlab);
            const railTop = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.05, 6.0), aluFrameMat);
            railTop.position.set(6.88, 0.18, 1.1); exteriorGroup.add(railTop);
            [-1.8, -0.35, 1.1, 2.55, 4.0].forEach(rz => {
                const post = new THREE.Mesh(new THREE.BoxGeometry(0.05, 1.15, 0.05), aluFrameMat);
                post.position.set(6.88, -0.4, rz); exteriorGroup.add(post);
            });
            const railGlass = new THREE.Mesh(new THREE.PlaneGeometry(5.9, 1.05), glassMat);
            railGlass.position.set(6.86, -0.38, 1.1); railGlass.rotation.y = -Math.PI / 2;
            exteriorGroup.add(railGlass);

            // CIEL ATMOSPHÉRIQUE GLSL (Gradient Rayleigh + Nuages + Tempête + Éclairs + Étoiles)
            const skyUniforms = {
                uZenithColor: { value: new THREE.Color('#2d5a9e') },
                uHorizonColor: { value: new THREE.Color('#b8d6f0') },
                uSunColor: { value: new THREE.Color('#fff5d6') },
                uSunPos: { value: new THREE.Vector2(0.56, 0.68) },
                uNight: { value: 0.0 },
                uStorm: { value: 0.0 },
                uLightning: { value: 0.0 },
                uTime: { value: 0.0 }
            };
            window.exteriorSkyUniforms = skyUniforms;
            const skyShaderMat = new THREE.ShaderMaterial({
                uniforms: skyUniforms,
                fog: false,
                depthWrite: false,
                side: THREE.BackSide,
                vertexShader: `
                    varying vec3 vDir;
                    void main() {
                        vDir = normalize(position);
                        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                    }
                `,
                fragmentShader: `
                    uniform vec3 uZenithColor;
                    uniform vec3 uHorizonColor;
                    uniform vec3 uSunColor;
                    uniform vec2 uSunPos;
                    uniform float uNight;
                    uniform float uStorm;
                    uniform float uLightning;
                    uniform float uTime;
                    varying vec3 vDir;

                    float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }
                    float noise(vec2 p) {
                        vec2 i = floor(p), f = fract(p);
                        f = f * f * (3.0 - 2.0 * f);
                        return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
                                   mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
                    }
                    float fbm(vec2 p) {
                        float v = 0.0, a = 0.5;
                        for (int i = 0; i < 4; i++) { v += a * noise(p); p *= 2.03; a *= 0.5; }
                        return v;
                    }

                    void main() {
                        vec3 d = normalize(vDir);
                        float elev = clamp(d.y, -1.0, 1.0);
                        float h = clamp((elev + 0.06) / 0.85, 0.0, 1.0);
                        vec3 zen = mix(uZenithColor, vec3(0.11, 0.14, 0.20), uStorm * 0.78);
                        vec3 hor = mix(uHorizonColor, vec3(0.24, 0.28, 0.36), uStorm * 0.72);
                        vec3 col = mix(hor, zen, pow(h, 0.62));

                        // Azimuth & elevation mapped cleanly around full 360° dome (no edges!)
                        float az = atan(d.z, d.x); // 0 = straight East (+X), -PI/2 = North, +PI/2 = South
                        vec2 skyUv = vec2(az / 3.14159 * 0.5 + 0.5, elev * 0.5 + 0.5);

                        // Sun/Moon Mie Halo in Eastern sky
                        vec3 sunDir = normalize(vec3(1.0, (uSunPos.y - 0.32) * 1.1, 0.18));
                        float sunDot = max(dot(d, sunDir), 0.0);
                        float halo = (pow(sunDot, 12.0) * 0.55 + pow(sunDot, 160.0) * 1.1) * (1.0 - uStorm * 0.85);
                        col += uSunColor * halo;

                        // Volumetric 360° drifting clouds
                        vec2 cloudUv = vec2(az * 2.2 + uTime * (0.01 + uStorm * 0.018), elev * 5.2);
                        float cl = fbm(cloudUv);
                        float thresh = mix(0.46, 0.28, uStorm);
                        float cloudMask = smoothstep(thresh, 0.78, cl) * smoothstep(-0.02, 0.22, elev) * smoothstep(0.95, 0.38, elev);
                        vec3 cloudCol = mix(mix(vec3(0.97, 0.98, 1.0), uSunColor, 0.32), vec3(0.13, 0.16, 0.24), max(uNight, uStorm * 0.75));
                        col = mix(col, cloudCol, cloudMask * mix(0.62, 0.88, uStorm));

                        // Distant lightning flash illuminating storm clouds
                        if (uLightning > 0.01) {
                            float boltGlow = pow(max(dot(d, normalize(vec3(0.95, 0.28, 0.25))), 0.0), 8.0);
                            col += vec3(0.75, 0.86, 1.0) * uLightning * (0.32 + boltGlow * 1.15);
                        }

                        // Twinkling stars across the upper dome on clear nights
                        if (uNight > 0.2 && uStorm < 0.4 && elev > 0.08) {
                            vec2 starGrid = floor(vec2(az * 110.0, elev * 140.0));
                            float s = hash(starGrid);
                            if (s > 0.993) {
                                float tw = 0.55 + 0.45 * sin(uTime * 2.5 + s * 100.0);
                                col += vec3(0.85, 0.92, 1.0) * tw * uNight * (1.0 - uStorm) * smoothstep(0.08, 0.35, elev);
                            }
                        }

                        // Warm continuous 360° urban horizon glow & lower street haze
                        float cityGlow = exp(-abs(elev) * 8.0) * (0.26 + 0.30 * uNight);
                        col += mix(vec3(1.0, 0.88, 0.74), vec3(0.98, 0.64, 0.36), uNight) * cityGlow;
                        if (elev < -0.02) {
                            vec3 groundHaze = mix(vec3(0.28, 0.32, 0.40), vec3(0.08, 0.10, 0.16), uNight);
                            col = mix(col, groundHaze, smoothstep(-0.02, -0.35, elev));
                        }

                        gl_FragColor = vec4(col, 1.0);
                    }
                `
            });
            // Dôme 360° complet : aucune coupure ni bord vide même collé à la vitre en regardant à 89° sur les côtés !
            const skyDome = new THREE.Mesh(new THREE.SphereGeometry(148, 32, 20), skyShaderMat);
            skyDome.position.set(8, 0, 1.1);
            scene.add(skyDome);
            window.skyDomeMesh = skyDome;

            // Sol urbain / Grille d'avenues illuminées 5 étages sous le balcon (visible si on regarde vers le bas)
            const streetC = document.createElement('canvas'); streetC.width = 512; streetC.height = 512;
            const stCtx = streetC.getContext('2d');
            stCtx.fillStyle = '#1b1e26'; stCtx.fillRect(0, 0, 512, 512);
            for (let g = 0; g < 512; g += 64) {
                stCtx.fillStyle = '#2b2f3a'; stCtx.fillRect(g, 0, 14, 512); stCtx.fillRect(0, g, 512, 14);
                stCtx.fillStyle = 'rgba(255,220,155,0.45)';
                for (let k = 8; k < 512; k += 28) {
                    stCtx.fillRect(g + 3, k, 2, 6); stCtx.fillRect(k, g + 3, 6, 2);
                }
            }
            const streetTex = configureTex(streetC, 6, 8, true);
            const cityGround = new THREE.Mesh(
                new THREE.PlaneGeometry(200, 260),
                new THREE.MeshStandardMaterial({ color: '#8a92a4', map: streetTex, emissive: '#ffcf87', emissiveMap: streetTex, emissiveIntensity: 0.28, roughness: 0.92 })
            );
            cityGround.rotation.x = -Math.PI / 2;
            cityGround.position.set(78, -15.2, 1.1);
            exteriorGroup.add(cityGround);

            // 4 Matériaux d'immeubles réalistes + 2 plans de brume urbaine
            const facadeGlass = createRealisticFacadePair('glass_tower');
            const facadeLoft = createRealisticFacadePair('concrete_loft');
            const facadeHauss = createRealisticFacadePair('haussmann');
            const facadeComm = createRealisticFacadePair('commercial');

            const bldgMaterials = [
                new THREE.MeshStandardMaterial({ color: '#d4dce8', map: facadeGlass.map, emissive: '#ffebb8', emissiveMap: facadeGlass.emissiveMap, emissiveIntensity: 0.2, roughness: 0.26, metalness: 0.58 }),
                new THREE.MeshStandardMaterial({ color: '#dbd6cd', map: facadeLoft.map, emissive: '#ffdfa8', emissiveMap: facadeLoft.emissiveMap, emissiveIntensity: 0.2, roughness: 0.82, metalness: 0.08 }),
                new THREE.MeshStandardMaterial({ color: '#e5ddd0', map: facadeHauss.map, emissive: '#ffe0a8', emissiveMap: facadeHauss.emissiveMap, emissiveIntensity: 0.2, roughness: 0.86, metalness: 0.05 }),
                new THREE.MeshStandardMaterial({ color: '#b9c2d0', map: facadeComm.map, emissive: '#ffebc2', emissiveMap: facadeComm.emissiveMap, emissiveIntensity: 0.2, roughness: 0.42, metalness: 0.38 })
            ];
            window.cityBuildingMats = bldgMaterials;

            const midHazeMat = new THREE.MeshStandardMaterial({ color: '#70849e', map: facadeGlass.map, emissive: '#ffdfa8', emissiveMap: facadeGlass.emissiveMap, emissiveIntensity: 0.22, roughness: 0.6, metalness: 0.2 });
            window.midCityHazeMat = midHazeMat;
            const farSilhouetteMat = new THREE.MeshBasicMaterial({ color: '#7a95b8', transparent: true, opacity: 0.68, fog: false });
            window.farCitySilhouetteMat = farSilhouetteMat;
            const roofUnitMat = new THREE.MeshStandardMaterial({ color: '#454952', roughness: 0.8 });
            const penthouseGlowMat = new THREE.MeshBasicMaterial({ color: '#ffe5b8', fog: false });
            const beaconMat = new THREE.MeshBasicMaterial({ color: '#ff3b30', fog: false });
            window.cityBeacons = [];

            // VASTE MÉTROPOLE 3D : 50+ bâtiments sur 4 plans de profondeur (Toits parisiens -> Quartier financier -> Tours de verre -> Horizon)
            const citySpecs = [
                // Plan 1 : Façades & toits urbains proches + prolongements latéraux Nord/Sud (X: 9..21, Z: -65..+68)
                { x: 10.5, z: -56.0, w: 6.5, h: 24, d: 8.0, m: 1 },
                { x: 11.2, z: -45.0, w: 6.0, h: 22, d: 7.5, m: 2, hvac: true },
                { x: 10.8, z: -34.5, w: 5.8, h: 20, d: 7.2, m: 1 },
                { x: 11.5, z: -24.5, w: 5.5, h: 19, d: 6.5, m: 2, hvac: true },
                { x: 15.5, z: -16.5, w: 4.8, h: 15, d: 5.2, m: 2, hvac: true },
                { x: 16.5, z: -10.5, w: 4.6, h: 16.5, d: 4.8, m: 2 },
                { x: 18.2, z: -4.8,  w: 5.2, h: 19, d: 4.8, m: 1, hvac: true },
                { x: 15.6, z: 0.8,   w: 4.5, h: 13.8, d: 4.4, m: 2, waterTower: true },
                { x: 18.5, z: 6.2,   w: 5.0, h: 18.5, d: 4.8, m: 1, hvac: true },
                { x: 16.8, z: 12.0,  w: 4.8, h: 15.5, d: 4.6, m: 2 },
                { x: 17.5, z: 18.0,  w: 5.2, h: 17, d: 5.0, m: 1, hvac: true },
                { x: 11.8, z: 25.5,  w: 5.8, h: 21, d: 6.8, m: 2, hvac: true },
                { x: 11.0, z: 35.5,  w: 6.0, h: 23, d: 7.5, m: 1 },
                { x: 11.5, z: 46.5,  w: 6.5, h: 20, d: 8.0, m: 2, hvac: true },
                { x: 10.5, z: 58.0,  w: 6.8, h: 25, d: 8.5, m: 1 },

                // Plan 2 : Quartier Moderne & Gratte-ciel de Verre étendus jusqu'à ±72 en Z (X: 24..36)
                { x: 26.0, z: -64.0, w: 7.5, h: 34, d: 7.5, m: 0, spire: true },
                { x: 27.0, z: -50.0, w: 7.2, h: 30, d: 7.0, m: 3, hvac: true },
                { x: 25.5, z: -37.0, w: 6.8, h: 36, d: 6.8, m: 0, tier: true },
                { x: 27.5, z: -24.0, w: 6.5, h: 31, d: 6.2, m: 0, tier: true, spire: true },
                { x: 26.5, z: -16.0, w: 6.2, h: 28, d: 6.0, m: 3, hvac: true },
                { x: 25.2, z: -8.5,  w: 5.8, h: 35, d: 5.6, m: 0, tier: true, spire: true },
                { x: 28.5, z: -2.2,  w: 6.6, h: 26, d: 6.2, m: 3, hvac: true },
                { x: 24.8, z: 4.4,   w: 5.6, h: 39, d: 5.6, m: 0, tier: true, spire: true, crown: true },
                { x: 28.0, z: 11.2,  w: 6.2, h: 29, d: 5.8, m: 3, spire: true },
                { x: 26.2, z: 18.0,  w: 6.0, h: 33, d: 5.6, m: 0, tier: true },
                { x: 29.0, z: 25.5,  w: 6.8, h: 27, d: 6.2, m: 1, hvac: true },
                { x: 26.5, z: 36.5,  w: 7.0, h: 34, d: 6.8, m: 0, tier: true, spire: true },
                { x: 27.5, z: 49.0,  w: 7.4, h: 31, d: 7.2, m: 3, hvac: true },
                { x: 26.0, z: 63.0,  w: 7.8, h: 36, d: 7.5, m: 0, spire: true },

                // Plan 3 : Gratte-ciel Financiers & Tour Iconique Hero (Z: -78..+78)
                { x: 41.0, z: -74.0, w: 8.5, h: 46, d: 8.5, mid: true, spire: true },
                { x: 42.0, z: -58.0, w: 8.2, h: 42, d: 8.0, mid: true, tier: true },
                { x: 40.0, z: -44.0, w: 7.8, h: 48, d: 7.6, mid: true },
                { x: 41.0, z: -32.0, w: 7.5, h: 42, d: 7.2, mid: true, spire: true },
                { x: 39.5, z: -22.5, w: 7.2, h: 48, d: 7.0, mid: true, tier: true, crown: true },
                { x: 43.0, z: -13.0, w: 8.0, h: 52, d: 7.6, mid: true, tier: true, spire: true },
                { x: 40.0, z: -4.0,  w: 7.4, h: 45, d: 7.2, mid: true },
                { x: 46.5, z: 1.5,   w: 8.6, h: 66, d: 8.6, mid: true, tier: true, spire: true, crown: true }, // HERO LANDMARK TOWER
                { x: 41.5, z: 9.5,   w: 7.6, h: 50, d: 7.4, mid: true, tier: true },
                { x: 44.0, z: 19.0,  w: 8.2, h: 46, d: 7.8, mid: true, spire: true },
                { x: 40.5, z: 29.0,  w: 7.8, h: 40, d: 7.4, mid: true },
                { x: 43.0, z: 37.5,  w: 8.0, h: 36, d: 7.5, mid: true },
                { x: 41.5, z: 50.0,  w: 8.2, h: 46, d: 8.0, mid: true, tier: true },
                { x: 43.0, z: 64.0,  w: 8.6, h: 50, d: 8.4, mid: true, spire: true },
                { x: 40.5, z: 78.0,  w: 8.8, h: 44, d: 8.5, mid: true },

                // Plan 4 : Immense Horizon Métropolitain Panoramique 180° (Z: -95..+95)
                { x: 64, z: -92, w: 12, h: 48, d: 12, far: true },
                { x: 68, z: -76, w: 12, h: 56, d: 11, far: true, spire: true },
                { x: 65, z: -60, w: 11, h: 50, d: 10, far: true },
                { x: 64, z: -42, w: 10, h: 45, d: 9, far: true },
                { x: 68, z: -32, w: 11, h: 56, d: 10, far: true, spire: true },
                { x: 62, z: -22, w: 9,  h: 48, d: 9, far: true },
                { x: 70, z: -14, w: 12, h: 64, d: 10, far: true, spire: true },
                { x: 65, z: -5,  w: 10, h: 52, d: 9, far: true },
                { x: 72, z: 4,   w: 11, h: 60, d: 10, far: true, spire: true },
                { x: 66, z: 13,  w: 10, h: 58, d: 9, far: true },
                { x: 74, z: 22,  w: 12, h: 66, d: 10, far: true, spire: true },
                { x: 65, z: 31,  w: 10, h: 48, d: 9, far: true },
                { x: 70, z: 41,  w: 11, h: 52, d: 10, far: true },
                { x: 68, z: 54,  w: 11, h: 46, d: 10, far: true },
                { x: 66, z: 68,  w: 12, h: 54, d: 11, far: true, spire: true },
                { x: 69, z: 82,  w: 12, h: 48, d: 11, far: true },
                { x: 65, z: 95,  w: 13, h: 44, d: 12, far: true }
            ];
            citySpecs.forEach(b => {
                const mat = b.far ? farSilhouetteMat : (b.mid ? midHazeMat : bldgMaterials[b.m]);
                const mesh = new THREE.Mesh(new THREE.BoxGeometry(b.w, b.h, b.d), mat);
                const topY = b.h - 15;
                mesh.position.set(b.x, topY - b.h / 2, b.z);
                exteriorGroup.add(mesh);

                let highestY = topY;
                if (b.tier) {
                    const tH = Math.min(7.5, b.h * 0.16);
                    const tierMesh = new THREE.Mesh(new THREE.BoxGeometry(b.w * 0.68, tH, b.d * 0.68), mat);
                    tierMesh.position.set(b.x, topY + tH / 2, b.z);
                    exteriorGroup.add(tierMesh);
                    highestY = topY + tH;
                }
                if (b.crown && !b.far) {
                    const crownStrip = new THREE.Mesh(new THREE.BoxGeometry(b.w * 0.70, 0.35, b.d * 0.70), penthouseGlowMat);
                    crownStrip.position.set(b.x, highestY - 0.5, b.z);
                    exteriorGroup.add(crownStrip);
                }
                if (b.hvac && !b.far) {
                    const box1 = new THREE.Mesh(new THREE.BoxGeometry(b.w * 0.42, 1.15, b.d * 0.36), roofUnitMat);
                    box1.position.set(b.x, highestY + 0.55, b.z - 0.6); exteriorGroup.add(box1);
                }
                if (b.waterTower && !b.far) {
                    const wt = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.68, 1.6, 12), new THREE.MeshStandardMaterial({ color: '#6b4c35', roughness: 0.85 }));
                    wt.position.set(b.x, highestY + 1.4, b.z + 0.8); exteriorGroup.add(wt);
                    const wtCone = new THREE.Mesh(new THREE.ConeGeometry(0.75, 0.65, 12), roofUnitMat);
                    wtCone.position.set(b.x, highestY + 2.5, b.z + 0.8); exteriorGroup.add(wtCone);
                }
                if (b.spire) {
                    const spH = b.h > 55 ? 8.5 : 5.2;
                    const spire = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.18, spH, 6), aluFrameMat);
                    spire.position.set(b.x, highestY + spH / 2, b.z); exteriorGroup.add(spire);
                    const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.20, 8, 8), beaconMat.clone());
                    beacon.position.set(b.x, highestY + spH + 0.1, b.z);
                    exteriorGroup.add(beacon);
                    window.cityBeacons.push(beacon);
                }
            });

            // Avions lointains traversant le ciel nocturne
            window.cityPlanes = [];
            for (let p = 0; p < 2; p++) {
                const planeDot = new THREE.Mesh(new THREE.SphereGeometry(0.22, 6, 6), new THREE.MeshBasicMaterial({ color: p === 0 ? '#ffffff' : '#ff5555', fog: false }));
                planeDot.position.set(78 + p * 8, 22 + p * 6, -38 + p * 35);
                planeDot.userData = { speed: p === 0 ? 0.09 : -0.07 };
                exteriorGroup.add(planeDot);
                window.cityPlanes.push(planeDot);
            }
            archGroup.add(exteriorGroup);

            // --- PLAFOND BLANC PARISIEN LUMINEUX (Y = +4.0) + NUAGES ACOUSTIQUES SUSPENDUS + RAIL DE SPOTS DESIGN ---
            const ceilingMat = new THREE.MeshStandardMaterial({
                map: ceilTex.map, normalMap: ceilTex.normalMap, normalScale: new THREE.Vector2(0.18, 0.18),
                color: '#f8f6f2', emissive: '#2c2b28', emissiveIntensity: 0.42, roughness: 0.94, metalness: 0.0
            });
            const ceilingMesh = new THREE.Mesh(new THREE.PlaneGeometry(10.2, 10.2), ceilingMat);
            ceilingMesh.position.set(0, 4.0, 0); ceilingMesh.rotation.x = Math.PI / 2;
            ceilingMesh.receiveShadow = false; ceilingMesh.castShadow = false;
            archGroup.add(ceilingMesh);

            // 2 Nuages Acoustiques Studio Pro (Cadre noyer + feutre anthracite + lattes bois + 4 câbles acier vers le plafond)
            const cloudWoodMat = new THREE.MeshStandardMaterial({
                map: walnutTex.map, normalMap: walnutTex.normalMap, normalScale: new THREE.Vector2(0.5, 0.5),
                color: '#a87d59', roughness: 0.45
            });
            const cloudFabricMat = new THREE.MeshStandardMaterial({
                map: curtainTex.map, color: '#272a33', roughness: 0.94
            });
            const cableMat = new THREE.MeshStandardMaterial({ color: '#9ca3af', roughness: 0.32, metalness: 0.85 });
            const cloudLedMat = new THREE.MeshStandardMaterial({ color: '#fff5e0', emissive: '#ffcf91', emissiveIntensity: 0.65 });

            const acousticCloudsGroup = new THREE.Group();
            const acousticCloudsSpec = [
                { x: -2.15, z: -2.65, w: 2.85, d: 1.55 }, // Au-dessus du bureau de mixage
                { x: -1.95, z:  1.65, w: 2.40, d: 1.45 }  // Au-dessus du coin écoute canapé (loin du rail de spots!)
            ];
            acousticCloudsSpec.forEach(spec => {
                const cg = new THREE.Group();
                cg.position.set(spec.x, 3.72, spec.z);
                // Panneau absorbant central (ne projette pas de gros bloc d'ombre noire au sol)
                const core = new THREE.Mesh(new THREE.BoxGeometry(spec.w, 0.075, spec.d), cloudFabricMat);
                core.castShadow = false; core.receiveShadow = false; cg.add(core);
                // Cadre menuisé en noyer sur les 4 bords
                const rimF = new THREE.Mesh(new THREE.BoxGeometry(spec.w + 0.08, 0.088, 0.045), cloudWoodMat);
                rimF.position.set(0, 0, spec.d / 2 + 0.02);
                const rimB = rimF.clone(); rimB.position.z = -spec.d / 2 - 0.02;
                const rimL = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.088, spec.d + 0.08), cloudWoodMat);
                rimL.position.set(-spec.w / 2 - 0.02, 0, 0);
                const rimR = rimL.clone(); rimR.position.x = spec.w / 2 + 0.02;
                cg.add(rimF, rimB, rimL, rimR);
                // Fines lattes acoustiques en noyer sur la face inférieure (style studio pro Acupanel)
                const slatCount = Math.floor(spec.w / 0.24);
                for (let s = 0; s < slatCount; s++) {
                    const sx = -spec.w / 2 + 0.14 + s * ((spec.w - 0.28) / Math.max(1, slatCount - 1));
                    const slat = new THREE.Mesh(new THREE.BoxGeometry(0.038, 0.018, spec.d - 0.08), cloudWoodMat);
                    slat.position.set(sx, -0.045, 0);
                    cg.add(slat);
                }
                // Discret ruban LED indirect sur le dessus vers le plafond
                const ledRim = new THREE.Mesh(new THREE.BoxGeometry(spec.w - 0.24, 0.012, spec.d - 0.24), cloudLedMat);
                ledRim.position.set(0, 0.042, 0);
                cg.add(ledRim);
                // 4 Câbles de suspension en acier fin reliant chaque coin au plafond (y = 4.0)
                const hw = spec.w / 2 - 0.14, hd = spec.d / 2 - 0.14;
                [[-hw, -hd], [hw, -hd], [-hw, hd], [hw, hd]].forEach(([kx, kz]) => {
                    const wire = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.005, 0.28, 6), cableMat);
                    wire.position.set(kx, 0.14, kz);
                    cg.add(wire);
                    const anchor = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.015, 10), aluFrameMat);
                    anchor.position.set(kx, 0.275, kz);
                    cg.add(anchor);
                });
                acousticCloudsGroup.add(cg);
            });
            archGroup.add(acousticCloudsGroup);

            // Rail de Spots Architecturaux Noir Mat au Plafond (Zone Centre-Est, 100% dégagé des nuages!)
            const trackGroup = new THREE.Group();
            trackGroup.position.set(1.15, 3.96, -0.55);
            const trackBar = new THREE.Mesh(new THREE.BoxGeometry(0.065, 0.035, 2.75), aluFrameMat);
            trackGroup.add(trackBar);
            const trackCanopy = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.028, 16), aluFrameMat);
            trackCanopy.position.set(0, 0.015, 0);
            trackGroup.add(trackCanopy);

            const fixtureDiffuserMat = new THREE.MeshStandardMaterial({
                color: '#fffaf0', emissive: '#ffedd2', emissiveIntensity: 1.9, roughness: 0.2
            });
            const spotBrassRingMat = new THREE.MeshStandardMaterial({ color: '#d4af37', roughness: 0.3, metalness: 0.82 });
            [
                { z: -1.05, aimX: -0.25, aimZ: -0.22 },
                { z:  0.00, aimX: -0.30, aimZ:  0.00 },
                { z:  1.05, aimX:  0.22, aimZ:  0.18 }
            ].forEach(sp => {
                const headG = new THREE.Group();
                headG.position.set(0, -0.095, sp.z);
                headG.rotation.set(sp.aimZ, 0, sp.aimX);
                const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.010, 0.010, 0.07, 8), aluFrameMat);
                stem.position.y = 0.055; headG.add(stem);
                const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.052, 0.058, 0.13, 18), aluFrameMat);
                headG.add(barrel);
                const brassLip = new THREE.Mesh(new THREE.TorusGeometry(0.053, 0.006, 8, 18), spotBrassRingMat);
                brassLip.rotation.x = Math.PI / 2; brassLip.position.y = -0.063; headG.add(brassLip);
                const lens = new THREE.Mesh(new THREE.CircleGeometry(0.048, 16), fixtureDiffuserMat);
                lens.rotation.x = Math.PI / 2; lens.position.y = -0.062; headG.add(lens);
                trackGroup.add(headG);
            });
            archGroup.add(trackGroup);
            window.ceilingFixtureMat = fixtureDiffuserMat;

            // =========================================================================
            // HYPER-REALISTIC & INTERACTIVE STUDIO DESK OBJECTS
            // (Interface Audio, Micro Condensateur, Casque sur Support, Mug Café, Smartphone, Pads)
            // =========================================================================
            function tagInteractable(group, meshName) {
                group.traverse(ch => {
                    if (ch.isMesh) ch.name = meshName;
                });
            }

            // 0. Pads d'isolation acoustique inclinés sous les 2 enceintes (Tier 3) + Accents clavier custom
            const isoPadsTier3Group = new THREE.Group();
            const isoPadMat = new THREE.MeshStandardMaterial({ color: '#16181e', roughness: 0.94 });
            [-1.7, 1.7].forEach((sx, idx) => {
                const pad = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.06, 0.56), isoPadMat);
                pad.position.set(sx, 0.76, -0.4);
                pad.rotation.y = idx === 0 ? 0.35 : -0.35;
                pad.receiveShadow = true; pad.name = 'speaker_mesh';
                isoPadsTier3Group.add(pad);
            });
            deskGroup.add(isoPadsTier3Group);
            // Touches d'accent studio sur le clavier mécanique (ESC orange + ENTER indigo + sous-lueur douce)
            const escCap = new THREE.Mesh(new THREE.BoxGeometry(0.085, 0.036, 0.085), new THREE.MeshStandardMaterial({ color: '#f97316', roughness: 0.4 }));
            escCap.position.set(-0.68, 0.036, -0.18); escCap.name = 'pc_mesh'; kbdBase.add(escCap);
            const entCap = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.036, 0.085), new THREE.MeshStandardMaterial({ color: '#6366f1', roughness: 0.4 }));
            entCap.position.set(0.62, 0.036, 0.0); entCap.name = 'pc_mesh'; kbdBase.add(entCap);
            const kbdGlowStrip = new THREE.Mesh(new THREE.BoxGeometry(1.56, 0.01, 0.012), new THREE.MeshBasicMaterial({ color: '#818cf8' }));
            kbdGlowStrip.position.set(0, -0.02, 0.302); kbdBase.add(kbdGlowStrip);

            // 1. Tapis de bureau en feutre gris anthracite surpiqué
            const deskMatMesh = new THREE.Mesh(
                new THREE.BoxGeometry(2.82, 0.012, 0.98),
                new THREE.MeshStandardMaterial({ map: rugTex.map, color: '#22252d', roughness: 0.92 })
            );
            deskMatMesh.position.set(0.16, 0.756, 0.36); deskMatMesh.receiveShadow = true;
            deskGroup.add(deskMatMesh);

            // 2. INTERFACE AUDIO PRO (Apollo / Focusrite) — INTERACTIVE [E] (Gain Knob + Monitoring Modes)
            const ifaceGroup = new THREE.Group();
            ifaceGroup.position.set(-1.12, 0.79, 0.12);
            ifaceGroup.rotation.y = 0.18;
            const ifaceMetalMat = new THREE.MeshStandardMaterial({ color: '#262b36', roughness: 0.24, metalness: 0.88, envMapIntensity: 1.25 });
            const ifaceFaceMat = new THREE.MeshStandardMaterial({ color: '#0d0f14', roughness: 0.18, metalness: 0.55 });
            const ifaceSilverMat = new THREE.MeshStandardMaterial({ color: '#d4dbe6', roughness: 0.2, metalness: 0.94, envMapIntensity: 1.4 });
            const ifaceBody = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.082, 0.34), ifaceMetalMat);
            ifaceBody.castShadow = true; ifaceBody.receiveShadow = true; ifaceGroup.add(ifaceBody);
            const ifaceTopBevel = new THREE.Mesh(new THREE.BoxGeometry(0.54, 0.014, 0.30), new THREE.MeshStandardMaterial({ color: '#1b1f28', roughness: 0.32, metalness: 0.78 }));
            ifaceTopBevel.position.set(0, 0.044, -0.01); ifaceGroup.add(ifaceTopBevel);
            const ifaceFront = new THREE.Mesh(new THREE.BoxGeometry(0.53, 0.068, 0.016), ifaceFaceMat);
            ifaceFront.position.set(0, 0, 0.166); ifaceGroup.add(ifaceFront);

            // 2 entrées Combo XLR/TRS Neutrik détaillées + anneaux de gain LED dynamiques
            window.ifaceHaloMats = [];
            [-0.18, -0.06].forEach((gx, gi) => {
                const jackRing = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.012, 16), aluFrameMat);
                jackRing.rotation.x = Math.PI / 2; jackRing.position.set(gx, -0.004, 0.174); ifaceGroup.add(jackRing);
                const jackHole = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.014, 12), new THREE.MeshBasicMaterial({ color: '#050507' }));
                jackHole.rotation.x = Math.PI / 2; jackHole.position.set(gx, -0.004, 0.175); ifaceGroup.add(jackHole);
                const hMat = new THREE.MeshBasicMaterial({ color: gi === 0 ? '#34d399' : '#34d399' });
                const halo = new THREE.Mesh(new THREE.TorusGeometry(0.025, 0.0045, 8, 20), hMat);
                halo.position.set(gx, -0.004, 0.178); ifaceGroup.add(halo);
                window.ifaceHaloMats.push(hMat);
            });
            // Bouton 48V Phantom Power LED rouge
            const led48v = new THREE.Mesh(new THREE.BoxGeometry(0.024, 0.014, 0.01), new THREE.MeshBasicMaterial({ color: '#ef4444' }));
            led48v.position.set(0.045, 0.014, 0.174); ifaceGroup.add(led48v);
            // Barre LED VU-mètre miniature sur la face avant
            window.ifaceMeterLeds = [];
            for (let m = 0; m < 5; m++) {
                const lm = new THREE.MeshBasicMaterial({ color: m === 4 ? '#f43f5e' : (m === 3 ? '#fbbf24' : '#34d399') });
                const ledSeg = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.008, 0.006), lm);
                ledSeg.position.set(0.01 + m * 0.016, -0.018, 0.175); ifaceGroup.add(ledSeg);
                window.ifaceMeterLeds.push(ledSeg);
            }
            // Gros potentiomètre rotatif principal en aluminium moleté + encoche blanche
            const ifaceKnobPivot = new THREE.Group();
            ifaceKnobPivot.position.set(0.165, 0, 0.18);
            const bigKnob = new THREE.Mesh(new THREE.CylinderGeometry(0.036, 0.038, 0.034, 24), ifaceSilverMat);
            bigKnob.rotation.x = Math.PI / 2; ifaceKnobPivot.add(bigKnob);
            const knobNotch = new THREE.Mesh(new THREE.BoxGeometry(0.006, 0.022, 0.006), new THREE.MeshBasicMaterial({ color: '#ffffff' }));
            knobNotch.position.set(0, 0.016, 0.018); ifaceKnobPivot.add(knobNotch);
            ifaceGroup.add(ifaceKnobPivot);

            tagInteractable(ifaceGroup, 'desk_interface_mesh');
            deskGroup.add(ifaceGroup);
            window.deskInterfaceState = { mode: 0, knobPivot: ifaceKnobPivot, targetAngle: -0.6, currentAngle: -0.6 };

            // 3. MICROPHONE STUDIO À CONDENSATEUR SUR BRAS ARTICULÉ À RESSORTS — INTERACTIF [E] (Mic Check)
            const micBaseGroup = new THREE.Group();
            micBaseGroup.position.set(-1.96, 0.75, 0.46);
            const clamp = new THREE.Mesh(new THREE.BoxGeometry(0.095, 0.085, 0.095), aluFrameMat);
            clamp.castShadow = true; micBaseGroup.add(clamp);

            const micArmPivot = new THREE.Group();
            micArmPivot.position.set(0, 0.04, 0);
            // Bras ciseaux double barre + vis d'articulation
            [-0.018, 0.018].forEach(ox => {
                const bar1 = new THREE.Mesh(new THREE.CylinderGeometry(0.011, 0.011, 0.64, 10), aluFrameMat);
                bar1.position.set(0.14 + ox, 0.28, 0); bar1.rotation.z = -0.42; micArmPivot.add(bar1);
            });
            const elbowJoint = new THREE.Mesh(new THREE.CylinderGeometry(0.026, 0.026, 0.05, 14), ifaceSilverMat);
            elbowJoint.rotation.x = Math.PI / 2; elbowJoint.position.set(0.28, 0.56, 0.02); micArmPivot.add(elbowJoint);
            const bar2 = new THREE.Mesh(new THREE.CylinderGeometry(0.013, 0.013, 0.56, 10), aluFrameMat);
            bar2.position.set(0.50, 0.50, 0.09); bar2.rotation.z = -1.32; bar2.rotation.y = -0.26; micArmPivot.add(bar2);

            // Suspension Araignée (Shock Mount) + Corps Condensateur + Capsule Dorée visible
            const micHeadGroup = new THREE.Group();
            micHeadGroup.position.set(0.74, 0.49, 0.16);
            micHeadGroup.rotation.z = 0.20;
            const shockRingTop = new THREE.Mesh(new THREE.TorusGeometry(0.056, 0.006, 8, 22), aluFrameMat);
            shockRingTop.rotation.x = Math.PI / 2; shockRingTop.position.set(0, 0.02, 0); micHeadGroup.add(shockRingTop);
            const shockRingBot = new THREE.Mesh(new THREE.TorusGeometry(0.056, 0.006, 8, 22), aluFrameMat);
            shockRingBot.rotation.x = Math.PI / 2; shockRingBot.position.set(0, -0.05, 0); micHeadGroup.add(shockRingBot);
            const micBody = new THREE.Mesh(new THREE.CylinderGeometry(0.036, 0.033, 0.21, 18), new THREE.MeshStandardMaterial({ color: '#181b22', roughness: 0.28, metalness: 0.84 }));
            micBody.castShadow = true; micHeadGroup.add(micBody);
            // Anneau LED ON-AIR sur le micro
            const micLedMat = new THREE.MeshBasicMaterial({ color: '#34d399' });
            const micRingLed = new THREE.Mesh(new THREE.TorusGeometry(0.037, 0.0045, 8, 20), micLedMat);
            micRingLed.rotation.x = Math.PI / 2; micRingLed.position.set(0, 0.088, 0); micHeadGroup.add(micRingLed);
            // Grille acoustique + capsule laiton interne
            const goldCapsule = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.024, 0.055, 16), new THREE.MeshStandardMaterial({ color: '#eab308', roughness: 0.22, metalness: 0.95 }));
            goldCapsule.position.set(0, 0.135, 0); micHeadGroup.add(goldCapsule);
            const micGrille = new THREE.Mesh(new THREE.CylinderGeometry(0.039, 0.037, 0.095, 18), new THREE.MeshStandardMaterial({ color: '#94a3b8', roughness: 0.35, metalness: 0.88, wireframe: true }));
            micGrille.position.set(0, 0.142, 0); micHeadGroup.add(micGrille);
            const micCapTop = new THREE.Mesh(new THREE.SphereGeometry(0.038, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshStandardMaterial({ color: '#64748b', roughness: 0.32, metalness: 0.9 }));
            micCapTop.position.set(0, 0.188, 0); micHeadGroup.add(micCapTop);
            // Filtre Anti-Pop double nylon
            const popRing = new THREE.Mesh(new THREE.TorusGeometry(0.088, 0.008, 8, 24), aluFrameMat);
            popRing.position.set(0.07, 0.13, 0.11); popRing.rotation.y = -0.42; micHeadGroup.add(popRing);
            const popScreen = new THREE.Mesh(new THREE.CircleGeometry(0.084, 22), new THREE.MeshStandardMaterial({ color: '#0d0e12', transparent: true, opacity: 0.62, side: THREE.DoubleSide }));
            popScreen.position.set(0.07, 0.13, 0.11); popScreen.rotation.y = -0.42; micHeadGroup.add(popScreen);
            micArmPivot.add(micHeadGroup);
            micBaseGroup.add(micArmPivot);

            tagInteractable(micBaseGroup, 'desk_mic_mesh');
            deskGroup.add(micBaseGroup);
            window.deskMicState = { pivot: micArmPivot, ledMat: micLedMat, targetYaw: 0, currentYaw: 0, activeUntil: 0, lastBoostMins: -999 };

            // 4. CASQUE STUDIO SUR SUPPORT ALUMINIUM — INTERACTIF [E] (Mettre / Poser le casque)
            const hpStandGroup = new THREE.Group();
            hpStandGroup.position.set(1.66, 0.75, 0.24);
            hpStandGroup.rotation.y = -0.45;
            // Socle & potence aluminium brossé
            const standBase = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.12, 0.018, 24), ifaceMetalMat);
            standBase.position.set(0, 0.01, 0); standBase.castShadow = true; hpStandGroup.add(standBase);
            const standPole = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.014, 0.38, 12), ifaceSilverMat);
            standPole.position.set(0, 0.20, -0.02); hpStandGroup.add(standPole);
            const standRest = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.018, 0.055), new THREE.MeshStandardMaterial({ color: '#1b1d24', roughness: 0.6 }));
            standRest.position.set(0, 0.39, -0.02); hpStandGroup.add(standRest);

            // Casque Studio Détaillé posé sur le support (se soulève / disparaît quand on le porte!)
            const hpWearable = new THREE.Group();
            hpWearable.position.set(0, 0.22, -0.02);
            const hpLeatherMat = new THREE.MeshStandardMaterial({ map: leatherTex.map, color: '#272932', roughness: 0.48 });
            const hpCupMat = new THREE.MeshStandardMaterial({ color: '#181b22', roughness: 0.26, metalness: 0.62 });
            const hpVelourMat = new THREE.MeshStandardMaterial({ color: '#111216', roughness: 0.92 });
            const hpBand = new THREE.Mesh(new THREE.TorusGeometry(0.155, 0.022, 12, 26, Math.PI), hpLeatherMat);
            hpBand.position.set(0, 0.02, 0); hpWearable.add(hpBand);
            [-0.145, 0.145].forEach(hx => {
                const yoke = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.09, 8), ifaceSilverMat);
                yoke.position.set(hx, -0.01, 0); hpWearable.add(yoke);
                const cupOuter = new THREE.Mesh(new THREE.CylinderGeometry(0.072, 0.068, 0.042, 22), hpCupMat);
                cupOuter.rotation.z = Math.PI / 2; cupOuter.position.set(hx, -0.065, 0); cupOuter.castShadow = true; hpWearable.add(cupOuter);
                const ringAccent = new THREE.Mesh(new THREE.TorusGeometry(0.055, 0.005, 8, 22), ifaceSilverMat);
                ringAccent.rotation.y = Math.PI / 2; ringAccent.position.set(hx + (hx > 0 ? 0.022 : -0.022), -0.065, 0); hpWearable.add(ringAccent);
                const pad = new THREE.Mesh(new THREE.TorusGeometry(0.056, 0.022, 10, 22), hpVelourMat);
                pad.rotation.y = Math.PI / 2; pad.position.set(hx + (hx > 0 ? -0.024 : 0.024), -0.065, 0); hpWearable.add(pad);
            });
            hpStandGroup.add(hpWearable);
            tagInteractable(hpStandGroup, 'desk_headphones_mesh');
            deskGroup.add(hpStandGroup);
            window.deskHeadphonesState = { mesh: hpWearable, worn: false, animProgress: 0 };

            // 5. MUG ESPRESSO CÉRAMIQUE AVEC ANSE + SOUS-VERRE + VAPEUR — INTERACTIF [E] (Boire un café!)
            const mugCoaster = new THREE.Mesh(new THREE.CylinderGeometry(0.088, 0.092, 0.01, 22), new THREE.MeshStandardMaterial({ map: walnutTex.map, color: '#9c724d', roughness: 0.55 }));
            mugCoaster.position.set(-1.55, 0.755, 0.48); mugCoaster.receiveShadow = true; mugCoaster.name = 'desk_mug_mesh';
            deskGroup.add(mugCoaster);

            const mugGroup = new THREE.Group();
            mugGroup.position.set(-1.55, 0.83, 0.48);
            const mugMat = new THREE.MeshStandardMaterial({ color: '#f2eee7', roughness: 0.22, metalness: 0.04 });
            const mugOuter = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.058, 0.14, 22), mugMat);
            mugOuter.castShadow = true; mugGroup.add(mugOuter);
            const mugInner = new THREE.Mesh(new THREE.CylinderGeometry(0.057, 0.054, 0.03, 20), new THREE.MeshStandardMaterial({ color: '#dcd5ca', roughness: 0.35 }));
            mugInner.position.set(0, 0.056, 0); mugGroup.add(mugInner);
            // Anse courbée réaliste
            const mugHandle = new THREE.Mesh(new THREE.TorusGeometry(0.042, 0.01, 10, 18, Math.PI * 1.15), mugMat);
            mugHandle.position.set(-0.06, 0, 0); mugHandle.rotation.z = Math.PI * 0.42; mugGroup.add(mugHandle);
            const coffeeTop = new THREE.Mesh(new THREE.CircleGeometry(0.055, 18), new THREE.MeshStandardMaterial({ color: '#331a0d', roughness: 0.12 }));
            coffeeTop.rotation.x = -Math.PI / 2; coffeeTop.position.set(0, 0.058, 0); mugGroup.add(coffeeTop);
            tagInteractable(mugGroup, 'desk_mug_mesh');
            deskGroup.add(mugGroup);
            window.deskMugState = { group: mugGroup, coffeeTop: coffeeTop, sipsLeft: 3, sipAnim: 0, lastSipMins: -999 };

            const steamC = document.createElement('canvas'); steamC.width = 64; steamC.height = 64;
            const sCtx = steamC.getContext('2d');
            const sGrad = sCtx.createRadialGradient(32, 32, 2, 32, 32, 30);
            sGrad.addColorStop(0, 'rgba(255,250,244,0.45)'); sGrad.addColorStop(0.5, 'rgba(240,240,245,0.16)'); sGrad.addColorStop(1, 'rgba(255,255,255,0)');
            sCtx.fillStyle = sGrad; sCtx.fillRect(0, 0, 64, 64);
            const steamTex = new THREE.CanvasTexture(steamC);
            window.coffeeSteamPuffs = [];
            for (let i = 0; i < 6; i++) {
                const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: steamTex, transparent: true, opacity: 0.22, depthWrite: false }));
                sp.position.set(-1.55, 0.92 + i * 0.065, 0.48);
                sp.scale.set(0.11, 0.11, 1);
                sp.userData = { phase: i / 6 };
                deskGroup.add(sp);
                window.coffeeSteamPuffs.push(sp);
            }

            // 5B. CÂBLES & CONNECTIQUE RÉALISTES (TubeGeometry) + MULTIPRISE SOL
            const wireMat = new THREE.MeshStandardMaterial({ color: '#14151a', roughness: 0.72, metalness: 0.15 });
            function addTubeCable(parent, pts, radius = 0.011) {
                const curve = new THREE.CatmullRomCurve3(pts.map(p => new THREE.Vector3(p[0], p[1], p[2])));
                const mesh = new THREE.Mesh(new THREE.TubeGeometry(curve, 18, radius, 6, false), wireMat);
                mesh.castShadow = false;
                parent.add(mesh);
            }
            addTubeCable(deskGroup, [[-1.5, 0.85, -0.62], [-1.42, 0.77, -0.35], [-1.24, 0.77, -0.05]]);
            addTubeCable(deskGroup, [[1.5, 0.85, -0.62], [0.65, 0.77, -0.78], [-0.45, 0.77, -0.68], [-1.02, 0.77, -0.05]]);
            const micXlrCableGroup = new THREE.Group();
            addTubeCable(micXlrCableGroup, [[-1.25, 1.18, 0.60], [-1.52, 1.24, 0.52], [-1.82, 1.02, 0.45], [-1.96, 0.76, 0.35], [-1.92, 0.76, -0.75]], 0.009);
            deskGroup.add(micXlrCableGroup);
            const stripGroup = new THREE.Group();
            stripGroup.position.set(-2.2, -0.965, -4.35);
            const stripBody = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.06, 0.13), new THREE.MeshStandardMaterial({ color: '#1b1d24', roughness: 0.6 }));
            stripGroup.add(stripBody);
            const stripSwitch = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.02, 0.04), new THREE.MeshBasicMaterial({ color: '#ef4444' }));
            stripSwitch.position.set(-0.24, 0.036, 0); stripGroup.add(stripSwitch);
            archGroup.add(stripGroup);
            addTubeCable(archGroup, [[-2.2, 0.72, -4.42], [-2.25, -0.15, -4.55], [-2.12, -0.94, -4.35]], 0.012);
            addTubeCable(archGroup, [[-3.3, 0.72, -4.42], [-3.1, -0.25, -4.55], [-2.02, -0.94, -4.35]], 0.010);

            // 5C. POST-IT NOTES SUR LE CADRE DU MONITEUR
            function createPostIt(text, bgHex) {
                const c = document.createElement('canvas'); c.width = 128; c.height = 128;
                const ctx = c.getContext('2d');
                ctx.fillStyle = bgHex; ctx.fillRect(0, 0, 128, 128);
                ctx.fillStyle = 'rgba(0,0,0,0.08)'; ctx.fillRect(0, 0, 128, 18);
                ctx.fillStyle = '#1f2937'; ctx.font = 'bold 18px monospace';
                text.split('\n').forEach((line, i) => ctx.fillText(line, 12, 52 + i * 26));
                return new THREE.MeshStandardMaterial({ map: configureTex(c, 1, 1, true), roughness: 0.88 });
            }
            const postIt1 = new THREE.Mesh(new THREE.PlaneGeometry(0.11, 0.11), createPostIt('128 BPM\nF MINOR', '#fde047'));
            postIt1.position.set(-0.56, -0.36, 0.028); postIt1.rotation.z = 0.06; pcFrame.add(postIt1);
            const postIt2 = new THREE.Mesh(new THREE.PlaneGeometry(0.10, 0.10), createPostIt('CUT\n200 Hz!', '#fbcfe8'));
            postIt2.position.set(0.56, -0.35, 0.028); postIt2.rotation.z = -0.09; pcFrame.add(postIt2);

            // 5D. SMARTPHONE 3D SUR LE BUREAU — INTERACTIF [E] (Ouvre directement SoundNet / DMs!)
            const phoneGroup = new THREE.Group();
            phoneGroup.position.set(0.92, 0.768, 0.62);
            phoneGroup.rotation.y = -0.32;
            const phoneBody = new THREE.Mesh(new THREE.BoxGeometry(0.132, 0.014, 0.252), new THREE.MeshStandardMaterial({ color: '#1b1e26', roughness: 0.22, metalness: 0.88 }));
            phoneBody.castShadow = true; phoneGroup.add(phoneBody);
            const phoneC = document.createElement('canvas'); phoneC.width = 128; phoneC.height = 256;
            const pCtx = phoneC.getContext('2d');
            pCtx.fillStyle = '#090b12'; pCtx.fillRect(0, 0, 128, 256);
            pCtx.fillStyle = '#1e293b'; pCtx.fillRect(10, 68, 108, 72);
            pCtx.fillStyle = '#f472b6'; pCtx.font = 'bold 12px monospace'; pCtx.fillText('SOUNDNET', 22, 92);
            pCtx.fillStyle = '#ffffff'; pCtx.font = '11px sans-serif'; pCtx.fillText('Messages & Deals', 16, 114);
            const phoneTex = configureTex(phoneC, 1, 1, true);
            const phoneScreenMat = new THREE.MeshStandardMaterial({
                color: '#111827', map: phoneTex, emissive: '#38bdf8', emissiveMap: phoneTex,
                emissiveIntensity: 0.14, roughness: 0.12, metalness: 0.2
            });
            const phoneScreen = new THREE.Mesh(new THREE.PlaneGeometry(0.118, 0.234), phoneScreenMat);
            phoneScreen.rotation.x = -Math.PI / 2; phoneScreen.position.set(0, 0.008, 0);
            phoneGroup.add(phoneScreen);
            tagInteractable(phoneGroup, 'desk_phone_mesh');
            deskGroup.add(phoneGroup);
            window.deskPhoneGroup = phoneGroup;
            window.deskPhoneScreenMat = phoneScreenMat;
            window.deskPhoneAlertUntil = 0;
            window.triggerDeskPhoneNotif = function(kind = 'dm') {
                window.deskPhoneAlertUntil = performance.now() + 9000;
                if (window.deskPhoneScreenMat) {
                    window.deskPhoneScreenMat.emissive.set(kind === 'deal' ? '#fbbf24' : '#f472b6');
                }
            };

            // 5E. PRISES MURALES & INTERRUPTEUR LUMINEUX PRÈS DE LA PORTE
            const plateMat = new THREE.MeshStandardMaterial({ color: '#e5e2dc', roughness: 0.45 });
            const holeMat = new THREE.MeshBasicMaterial({ color: '#111318' });
            function addWallOutlet(x, y, z, rotY) {
                const og = new THREE.Group(); og.position.set(x, y, z); og.rotation.y = rotY;
                og.add(new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.14, 0.02), plateMat));
                [-0.022, 0.022].forEach(hx => {
                    const h = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.025, 8), holeMat);
                    h.rotation.x = Math.PI / 2; h.position.set(hx, 0, 0.004); og.add(h);
                });
                archGroup.add(og);
            }
            addWallOutlet(0.65, -0.62, -4.96, 0);
            addWallOutlet(-4.96, -0.62, 0.1, Math.PI / 2);
            // Interrupteur lumineux près de la porte
            const swGroup = new THREE.Group();
            swGroup.position.set(-4.96, 0.72, 2.95); swGroup.rotation.y = Math.PI / 2;
            swGroup.add(new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.14, 0.022), plateMat));
            const swLed = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.008, 0.026), new THREE.MeshBasicMaterial({ color: '#fbbf24' }));
            swLed.position.set(0, -0.025, 0.002); swGroup.add(swLed);
            archGroup.add(swGroup);

            // 6. FAUTEUIL DE PRODUCTEUR ERGONOMIQUE DÉTAILLÉ (Assise galbée, Accoudoirs T, Appui-tête, 5 Roulettes doubles)
            const chairGroup = new THREE.Group();
            chairGroup.position.set(-1.25, -1, -2.02);
            chairGroup.rotation.y = 0.55;
            const chairSeatMat = new THREE.MeshStandardMaterial({ map: leatherTex.map, normalMap: leatherTex.normalMap, normalScale: new THREE.Vector2(0.7, 0.7), color: '#282c36', roughness: 0.42 });
            const chairChromeMat = new THREE.MeshStandardMaterial({ color: '#d8dee9', roughness: 0.18, metalness: 0.94, envMapIntensity: 1.4 });
            const chairMeshMat = new THREE.MeshStandardMaterial({ map: rugTex.map, color: '#1b1e26', roughness: 0.78 });

            // Vérin pneumatique chromé + mécanisme sous-assise
            const gasCyl = new THREE.Mesh(new THREE.CylinderGeometry(0.036, 0.042, 0.52, 16), chairChromeMat);
            gasCyl.position.set(0, 0.34, 0); chairGroup.add(gasCyl);
            const tiltBox = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.08, 0.30), aluFrameMat);
            tiltBox.position.set(0, 0.60, 0.02); chairGroup.add(tiltBox);

            // Base étoile 5 branches inclinées + 5 vraies roulettes doubles au sol
            for (let a = 0; a < 5; a++) {
                const ang = (a / 5) * Math.PI * 2;
                const legG = new THREE.Group(); legG.rotation.y = ang;
                const spoke = new THREE.Mesh(new THREE.BoxGeometry(0.046, 0.032, 0.42), chairChromeMat);
                spoke.position.set(0, 0.10, 0.21); spoke.rotation.x = 0.08; legG.add(spoke);
                const casterStem = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.05, 8), aluFrameMat);
                casterStem.position.set(0, 0.065, 0.40); legG.add(casterStem);
                [-0.016, 0.016].forEach(wx => {
                    const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.032, 0.016, 14), aluFrameMat);
                    wheel.rotation.z = Math.PI / 2; wheel.position.set(wx, 0.032, 0.40); legG.add(wheel);
                });
                chairGroup.add(legG);
            }

            // Assise galbée organique (subdivisée avec bords arrondis et creux ergonomique)
            const seatGeo = new THREE.BoxGeometry(0.78, 0.12, 0.74, 12, 3, 12);
            const sPos = seatGeo.attributes.position;
            for (let i = 0; i < sPos.count; i++) {
                const vx = sPos.getX(i), vy = sPos.getY(i), vz = sPos.getZ(i);
                const edgeR = Math.min(1, Math.hypot(vx / 0.39, vz / 0.37));
                const bolster = Math.pow(Math.abs(vx / 0.39), 2) * 0.028;
                const frontDrop = vz < -0.22 ? -(Math.abs(vz + 0.22) * 0.24) : 0;
                const roundY = vy > 0 ? vy * (1.0 - edgeR * 0.22) + bolster + frontDrop : vy * (1.0 - edgeR * 0.15) + frontDrop * 0.5;
                sPos.setY(i, roundY);
            }
            seatGeo.computeVertexNormals();
            const seat = new THREE.Mesh(seatGeo, chairSeatMat);
            seat.position.set(0, 0.68, 0); seat.castShadow = true; seat.receiveShadow = true; chairGroup.add(seat);

            // Dossier ergonomique courbé en S (maintien lombaire) + cadre alu
            const backGeo = new THREE.BoxGeometry(0.68, 0.96, 0.085, 10, 14, 2);
            const bPos = backGeo.attributes.position;
            for (let i = 0; i < bPos.count; i++) {
                const vx = bPos.getX(i), vy = bPos.getY(i), vz = bPos.getZ(i);
                const lumbarCurve = Math.sin((vy + 0.48) * 3.1) * -0.055; // Courbure S lombaire
                const sideWrap = -Math.pow(vx / 0.34, 2) * 0.055;        // Enveloppement latéral
                bPos.setZ(i, vz + lumbarCurve + sideWrap);
            }
            backGeo.computeVertexNormals();
            const backrest = new THREE.Mesh(backGeo, chairMeshMat);
            backrest.position.set(0, 1.20, 0.34); backrest.rotation.x = 0.09; backrest.castShadow = true; chairGroup.add(backrest);

            // Appui-tête réglable bombé
            const hrStem = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.16, 0.025), aluFrameMat);
            hrStem.position.set(0, 1.72, 0.37); chairGroup.add(hrStem);
            const hrGeo = new THREE.SphereGeometry(0.19, 16, 12); hrGeo.scale(1.35, 0.58, 0.45);
            const headrest = new THREE.Mesh(hrGeo, chairSeatMat);
            headrest.position.set(0, 1.83, 0.34); headrest.rotation.x = -0.15; headrest.castShadow = true; chairGroup.add(headrest);

            // 2 Accoudoirs en T métalliques avec coussinets soft-touch
            [-0.42, 0.42].forEach(ax => {
                const armPost = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.28, 0.05), aluFrameMat);
                armPost.position.set(ax, 0.80, 0.06); chairGroup.add(armPost);
                const armBracket = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.03, 0.05), aluFrameMat);
                armBracket.position.set(ax * 0.88, 0.66, 0.06); chairGroup.add(armBracket);
                const armPad = new THREE.Mesh(new THREE.BoxGeometry(0.095, 0.032, 0.34), chairSeatMat);
                armPad.position.set(ax, 0.945, 0.02); armPad.castShadow = true; chairGroup.add(armPad);
            });
            archGroup.add(chairGroup);

            // 6B. LIT ULTRA-RÉALISTE (Groupé par paliers : Tier 2 propre + Tier 3 luxe complet)
            const bedTier2PlusGroup = new THREE.Group();
            const bedTier3OnlyGroup = new THREE.Group();
            try {
                if (typeof frame !== 'undefined') frame.visible = false;
                if (typeof mattress !== 'undefined') mattress.visible = false;
                if (typeof blanket !== 'undefined') blanket.visible = false;
                if (typeof pillow1 !== 'undefined') pillow1.visible = false;
                if (typeof pillow2 !== 'undefined') pillow2.visible = false;

                const bedWoodMat = new THREE.MeshStandardMaterial({
                    map: walnutTex.map, normalMap: walnutTex.normalMap, normalScale: new THREE.Vector2(0.6, 0.6),
                    color: '#a87d59', roughness: 0.44, metalness: 0.04
                });
                const headboardFabricMat = new THREE.MeshStandardMaterial({
                    map: curtainTex.map, bumpMap: curtainTex.bumpMap, bumpScale: 0.018,
                    color: '#5a5d68', roughness: 0.92
                });
                const mattressRealMat = new THREE.MeshStandardMaterial({
                    map: curtainTex.map, color: '#f2eee7', roughness: 0.90
                });
                const pipingMat = new THREE.MeshStandardMaterial({ color: '#6b7280', roughness: 0.8 });

                // 1. Cadre menuisé en noyer + 4 pieds bois fuselés posés au sol (y = -0.20 dans bedGroup = sol y=-1.0)
                const legPositions = [[-1.12, -1.94], [1.12, -1.94], [-1.12, 1.94], [1.12, 1.94]];
                legPositions.forEach(([lx, lz]) => {
                    const bLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.032, 0.24, 14), bedWoodMat);
                    bLeg.position.set(lx, -0.08, lz);
                    bLeg.castShadow = true; bLeg.receiveShadow = true; bLeg.name = 'bed_mesh';
                    bedTier3OnlyGroup.add(bLeg);
                });
                // Rails périmétriques en noyer massif (Tier 3)
                const railL = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.22, 4.18), bedWoodMat);
                railL.position.set(-1.19, 0.11, 0); railL.castShadow = true; railL.receiveShadow = true; railL.name = 'bed_mesh';
                const railR = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.22, 4.18), bedWoodMat);
                railR.position.set(1.19, 0.11, 0); railR.castShadow = true; railR.receiveShadow = true; railR.name = 'bed_mesh';
                const railFoot = new THREE.Mesh(new THREE.BoxGeometry(2.49, 0.22, 0.12), bedWoodMat);
                railFoot.position.set(0, 0.11, 2.04); railFoot.castShadow = true; railFoot.receiveShadow = true; railFoot.name = 'bed_mesh';
                const railHead = new THREE.Mesh(new THREE.BoxGeometry(2.49, 0.22, 0.12), bedWoodMat);
                railHead.position.set(0, 0.11, -2.04); railHead.name = 'bed_mesh';
                const bedBaseBox = new THREE.Mesh(new THREE.BoxGeometry(2.28, 0.16, 3.96), headboardFabricMat);
                bedBaseBox.position.set(0, 0.10, 0); bedBaseBox.name = 'bed_mesh';
                bedTier3OnlyGroup.add(railL, railR, railFoot, railHead, bedBaseBox);

                // 2. Tête de lit capitonnée verticale (Channel-Tufted Headboard) dans un cadre en noyer
                const hbGroup = new THREE.Group();
                hbGroup.position.set(0, 0.80, -2.04);
                const hbWoodBack = new THREE.Mesh(new THREE.BoxGeometry(2.54, 1.32, 0.08), bedWoodMat);
                hbWoodBack.castShadow = true; hbWoodBack.receiveShadow = true; hbWoodBack.name = 'bed_mesh';
                hbGroup.add(hbWoodBack);
                const hbTopCap = new THREE.Mesh(new THREE.BoxGeometry(2.58, 0.055, 0.15), bedWoodMat);
                hbTopCap.position.set(0, 0.67, 0.025); hbTopCap.castShadow = true; hbTopCap.name = 'bed_mesh';
                hbGroup.add(hbTopCap);
                // 8 panneaux verticaux rembourrés bombés
                const tuftCount = 8;
                const tuftW = 2.38 / tuftCount;
                for (let t = 0; t < tuftCount; t++) {
                    const tuftGeo = new THREE.CylinderGeometry(tuftW * 0.48, tuftW * 0.48, 1.18, 14);
                    tuftGeo.scale(1.0, 1.0, 0.36);
                    const tuft = new THREE.Mesh(tuftGeo, headboardFabricMat);
                    tuft.position.set(-1.19 + tuftW * (t + 0.5), 0.02, 0.045);
                    tuft.castShadow = true; tuft.receiveShadow = true; tuft.name = 'bed_mesh';
                    hbGroup.add(tuft);
                }
                bedTier3OnlyGroup.add(hbGroup);

                // 3. Matelas épais à coins arrondis (calibré pour ne jamais percer la couette au pied!)
                const mShape = new THREE.Shape();
                const mw = 1.02, ml = 1.74, mr = 0.10;
                mShape.moveTo(-mw + mr, -ml);
                mShape.lineTo(mw - mr, -ml); mShape.quadraticCurveTo(mw, -ml, mw, -ml + mr);
                mShape.lineTo(mw, ml - mr); mShape.quadraticCurveTo(mw, ml, mw - mr, ml);
                mShape.lineTo(-mw + mr, ml); mShape.quadraticCurveTo(-mw, ml, -mw, ml - mr);
                mShape.lineTo(-mw, -ml + mr); mShape.quadraticCurveTo(-mw, -ml, -mw + mr, -ml);
                const realMattressGeo = new THREE.ExtrudeGeometry(mShape, {
                    depth: 0.20, bevelEnabled: true, bevelThickness: 0.028, bevelSize: 0.028, bevelSegments: 4
                });
                realMattressGeo.rotateX(Math.PI / 2);
                const realMattress = new THREE.Mesh(realMattressGeo, mattressRealMat);
                realMattress.position.set(0, 0.40, -0.14);
                realMattress.castShadow = true; realMattress.receiveShadow = true; realMattress.name = 'bed_mesh';
                bedTier2PlusGroup.add(realMattress);

                // 4. Couette drapée haute-résolution avec retombée naturelle souple et plis matelassés
                const duvetGeo = new THREE.BoxGeometry(2.46, 0.36, 3.18, 28, 6, 32);
                const dPos = duvetGeo.attributes.position;
                for (let i = 0; i < dPos.count; i++) {
                    let vx = dPos.getX(i), vy = dPos.getY(i), vz = dPos.getZ(i);
                    const nx = Math.min(1.0, Math.abs(vx) / 1.23);
                    const nz = Math.min(1.0, Math.abs(vz) / 1.59);
                    // Retombée douce arrondie sur les flancs et le pied
                    const sideCascade = Math.pow(nx, 4.5) * 0.22;
                    const footCascade = vz > 0 ? Math.pow(Math.max(0, vz / 1.59), 5.0) * 0.18 : 0;
                    if (vy > 0) {
                        const loft = (1.0 - Math.pow(nx, 3.2) * 0.36) * (1.0 - Math.pow(nz, 3.6) * 0.28);
                        const quiltGrid = Math.sin(vx * 7.5) * Math.sin(vz * 7.5) * 0.008;
                        const organicFold = Math.sin(vx * 2.4 + vz * 1.5) * 0.026 + Math.cos(vx * 4.8 - vz * 2.3) * 0.012;
                        vy = vy * loft - sideCascade * 0.42 - footCascade * 0.35 + quiltGrid + organicFold;
                    } else {
                        vy = vy - sideCascade * 0.35 - footCascade * 0.32;
                    }
                    if (nx > 0.92) {
                        vx += Math.sin(vz * 3.4 + vy * 5.0) * 0.022 * Math.sign(vx);
                    }
                    dPos.setXYZ(i, vx, vy, vz);
                }
                duvetGeo.computeVertexNormals();
                const organicDuvetMat = new THREE.MeshStandardMaterial({
                    map: curtainTex.map, bumpMap: curtainTex.bumpMap, bumpScale: 0.015,
                    color: '#2d4563', roughness: 0.90
                });
                const noOpBedRaycast = () => {};
                const organicDuvet = new THREE.Mesh(duvetGeo, organicDuvetMat);
                organicDuvet.position.set(0, 0.43, 0.44);
                organicDuvet.castShadow = true; organicDuvet.receiveShadow = true; organicDuvet.name = 'bed_mesh';
                organicDuvet.raycast = noOpBedRaycast;
                bedTier2PlusGroup.add(organicDuvet);

                // 5. Rebord de drap blanc cassé plissé rabattu en haut de la couette
                const cuffGeo = new THREE.BoxGeometry(2.42, 0.075, 0.44, 24, 2, 8);
                const cPos = cuffGeo.attributes.position;
                for (let i = 0; i < cPos.count; i++) {
                    const cx = cPos.getX(i), cy = cPos.getY(i), cz = cPos.getZ(i);
                    const cnx = Math.min(1, Math.abs(cx) / 1.21);
                    const drop = Math.pow(cnx, 4) * 0.14;
                    cPos.setY(i, cy - drop + Math.sin(cx * 3.6 + cz * 2.2) * 0.013);
                }
                cuffGeo.computeVertexNormals();
                const sheetCuff = new THREE.Mesh(cuffGeo, mattressRealMat);
                sheetCuff.position.set(0, 0.59, -0.96); sheetCuff.rotation.x = 0.04; sheetCuff.castShadow = true; sheetCuff.receiveShadow = true; sheetCuff.name = 'bed_mesh';
                sheetCuff.raycast = noOpBedRaycast;
                bedTier2PlusGroup.add(sheetCuff);

                // 6. 2 Grands Oreillers de couchage bombés + 2 Vrais Coussins Déco Carrés-Bombés adossés proprement devant
                function buildSculptedPillow(sx, sy, sz, px, py, pz, rx, ry, rz, mat) {
                    const pGeo = new THREE.SphereGeometry(0.44, 22, 16);
                    pGeo.scale(sx, sy, sz);
                    const pp = pGeo.attributes.position;
                    for (let i = 0; i < pp.count; i++) {
                        let vx = pp.getX(i), vy = pp.getY(i), vz = pp.getZ(i);
                        const squeeze = 1.0 + 0.12 * Math.pow(Math.abs(vx * vz) * 4.5, 0.7);
                        vx *= Math.min(1.16, squeeze);
                        const dimple = Math.exp(-(vx * vx * 6.5 + vz * vz * 9.0)) * -0.024;
                        if (vy > 0) vy += dimple;
                        pp.setXYZ(i, vx, vy, vz);
                    }
                    pGeo.computeVertexNormals();
                    const pMesh = new THREE.Mesh(pGeo, mat);
                    pMesh.position.set(px, py, pz);
                    pMesh.rotation.set(rx, ry, rz);
                    pMesh.castShadow = true; pMesh.receiveShadow = true; pMesh.name = 'bed_mesh';
                    pMesh.raycast = noOpBedRaycast;
                    bedTier2PlusGroup.add(pMesh);
                }
                function buildSquareCushion(w, h, d, px, py, pz, rx, ry, rz, mat) {
                    const cGeo = new THREE.BoxGeometry(w, h, d, 12, 12, 6);
                    const cp = cGeo.attributes.position;
                    for (let i = 0; i < cp.count; i++) {
                        let vx = cp.getX(i), vy = cp.getY(i), vz = cp.getZ(i);
                        const nx = vx / (w * 0.5), ny = vy / (h * 0.5);
                        const r2 = Math.min(1.0, nx * nx * 0.85 + ny * ny * 0.85);
                        // Gonflant central de vrai coussin carré + bords pincés couture
                        const puff = Math.cos(r2 * Math.PI * 0.5) * 0.85 + 0.15;
                        vz *= puff;
                        // Légère courbure souple aux coins
                        const cornerPinch = 1.0 - Math.pow(Math.abs(nx * ny), 2.5) * 0.08;
                        vx *= cornerPinch; vy *= cornerPinch;
                        cp.setXYZ(i, vx, vy, vz);
                    }
                    cGeo.computeVertexNormals();
                    const cMesh = new THREE.Mesh(cGeo, mat);
                    cMesh.position.set(px, py, pz);
                    cMesh.rotation.set(rx, ry, rz);
                    cMesh.castShadow = true; cMesh.receiveShadow = true; cMesh.name = 'bed_mesh';
                    cMesh.raycast = noOpBedRaycast;
                    bedTier3OnlyGroup.add(cMesh);
                }
                const sleepPillowMat = new THREE.MeshStandardMaterial({ map: curtainTex.map, color: '#f6f3ec', roughness: 0.91 });
                const accentPillowMat1 = new THREE.MeshStandardMaterial({ map: curtainTex.map, bumpMap: curtainTex.bumpMap, bumpScale: 0.014, color: '#d6c3ab', roughness: 0.93 });
                const accentPillowMat2 = new THREE.MeshStandardMaterial({ map: curtainTex.map, bumpMap: curtainTex.bumpMap, bumpScale: 0.014, color: '#b56a49', roughness: 0.92 });
                // 2 grands oreillers adossés à la tête de lit
                buildSculptedPillow(1.22, 0.34, 0.74, -0.56, 0.72, -1.66, 0.58, 0.08, 0.03, sleepPillowMat);
                buildSculptedPillow(1.22, 0.34, 0.74,  0.55, 0.72, -1.66, 0.54, -0.10, -0.02, sleepPillowMat);
                // 2 vrais coussins carrés-bombés bien posés au-dessus du drap devant les oreillers
                buildSquareCushion(0.56, 0.44, 0.18, -0.34, 0.74, -1.25, -0.26, 0.18, 0.04, accentPillowMat1);
                buildSquareCushion(0.50, 0.40, 0.16,  0.34, 0.72, -1.23, -0.30, -0.20, -0.05, accentPillowMat2);

                // 7. Plaid tissé chaud drapé proprement au pied du lit (finition ourlet lisse sans barreaux!)
                const plaidGeo = new THREE.BoxGeometry(2.50, 0.038, 0.74, 30, 2, 10);
                const plPos = plaidGeo.attributes.position;
                const plaidCenterZ = 1.24;
                for (let i = 0; i < plPos.count; i++) {
                    const lx = plPos.getX(i), ly = plPos.getY(i), lz = plPos.getZ(i);
                    const skewZ = lz - lx * 0.055;
                    const worldZ = plaidCenterZ + skewZ;
                    const duvetLocalZ = worldZ - 0.44;
                    const absX = Math.abs(lx);
                    const nx = Math.min(1.0, absX / 1.23);
                    const nz = Math.min(1.0, Math.abs(duvetLocalZ) / 1.59);
                    const sideCascade = Math.pow(nx, 4.5) * 0.22;
                    const footCascade = duvetLocalZ > 0 ? Math.pow(Math.max(0, duvetLocalZ / 1.59), 5.0) * 0.18 : 0;
                    const loft = (1.0 - Math.pow(nx, 3.2) * 0.36) * (1.0 - Math.pow(nz, 3.6) * 0.28);
                    const organicFold = Math.sin(lx * 2.4 + duvetLocalZ * 1.5) * 0.026 + Math.cos(lx * 4.8 - duvetLocalZ * 2.3) * 0.012;
                    const duvetTopY = 0.43 + 0.18 * loft - sideCascade * 0.42 - footCascade * 0.35 + organicFold;
                    let finalX = lx;
                    let sideDrop = 0;
                    if (absX > 1.15) {
                        const t = (absX - 1.15) / 0.10;
                        finalX = Math.sign(lx) * (1.15 + Math.sin(Math.min(1, t) * Math.PI * 0.5) * 0.095);
                        sideDrop = Math.pow(t, 1.55) * 0.22;
                    }
                    const clothRipple = Math.sin(lx * 6.0 + skewZ * 4.0) * 0.006;
                    plPos.setX(i, finalX);
                    plPos.setZ(i, skewZ);
                    plPos.setY(i, ly + (duvetTopY + 0.030) - sideDrop + clothRipple);
                }
                plaidGeo.computeVertexNormals();
                const plaidMat = new THREE.MeshStandardMaterial({ map: curtainTex.map, bumpMap: curtainTex.bumpMap, bumpScale: 0.018, color: '#ad6d4b', roughness: 0.95 });
                const plaid = new THREE.Mesh(plaidGeo, plaidMat);
                plaid.position.set(0, 0, plaidCenterZ); plaid.castShadow = true; plaid.receiveShadow = true; plaid.name = 'bed_mesh';
                plaid.raycast = noOpBedRaycast;
                bedTier3OnlyGroup.add(plaid);
                if (typeof realMattress !== 'undefined') realMattress.raycast = noOpBedRaycast;
                // Hitbox low-poly (12 triangles) dédiée au raycast FPS du lit pour éviter de tester 15 000 triangles de draps!
                const bedHitbox = new THREE.Mesh(
                    new THREE.BoxGeometry(2.54, 0.95, 4.22),
                    new THREE.MeshBasicMaterial({ visible: false })
                );
                bedHitbox.position.set(0, 0.34, 0);
                bedHitbox.name = 'bed_mesh';
                bedGroup.add(bedHitbox);
                bedGroup.add(bedTier2PlusGroup);
                bedGroup.add(bedTier3OnlyGroup);
            } catch(e) { console.warn('Organic bed build fallback:', e); }

            // 6C. AMBIENT OCCLUSION ARCHITECTURAL (4 ANGLES VERTICAUX + PLAFOND + FENÊTRE)
            function createEdgeGradientTex(vertical = false) {
                const c = document.createElement('canvas'); c.width = 64; c.height = 64;
                const ctx = c.getContext('2d');
                const g = vertical ? ctx.createLinearGradient(0, 0, 0, 64) : ctx.createLinearGradient(0, 0, 64, 0);
                g.addColorStop(0, 'rgba(12,10,8,0.42)');
                g.addColorStop(0.45, 'rgba(12,10,8,0.12)');
                g.addColorStop(1, 'rgba(12,10,8,0.0)');
                ctx.fillStyle = g; ctx.fillRect(0, 0, 64, 64);
                return new THREE.CanvasTexture(c);
            }
            const cornerAoMat = new THREE.MeshBasicMaterial({ map: createEdgeGradientTex(false), transparent: true, opacity: 0.58, depthWrite: false, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: -1 });
            const ceilAoMat = new THREE.MeshBasicMaterial({ map: createEdgeGradientTex(true), transparent: true, opacity: 0.50, depthWrite: false, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: -1 });

            // 4 Angles verticaux entre les murs (bande douce de 0.65m de chaque côté)
            [
                { x: -4.66, z: -4.97, ry: 0 },      { x: -4.97, z: -4.66, ry: Math.PI / 2 },
                { x:  4.66, z: -4.97, ry: Math.PI }, { x:  4.97, z: -4.66, ry: -Math.PI / 2 },
                { x: -4.66, z:  4.97, ry: 0 },      { x: -4.97, z:  4.66, ry: -Math.PI / 2 },
                { x:  4.66, z:  4.97, ry: Math.PI }, { x:  4.97, z:  4.66, ry: Math.PI / 2 }
            ].forEach(c => {
                const strip = new THREE.Mesh(new THREE.PlaneGeometry(0.68, 5.0), cornerAoMat);
                strip.position.set(c.x, 1.5, c.z); strip.rotation.y = c.ry;
                archGroup.add(strip);
            });
            // Jonction Plafond / Murs + Corniches fines architecturales (Y = 3.94, Tier 2+)
            const cornicesGroup = new THREE.Group();
            const corniceMat = new THREE.MeshStandardMaterial({ color: '#f0ece4', roughness: 0.72 });
            [
                { x: 0, z: -4.95, w: 10, d: 0.09, ry: 0 },
                { x: 0, z:  4.95, w: 10, d: 0.09, ry: Math.PI },
                { x: -4.95, z: 0, w: 0.09, d: 10, ry: Math.PI / 2 },
                { x:  4.95, z: 0, w: 0.09, d: 10, ry: -Math.PI / 2 }
            ].forEach(m => {
                const cornice = new THREE.Mesh(new THREE.BoxGeometry(m.w, 0.11, m.d), corniceMat);
                cornice.position.set(m.x, 3.945, m.z); cornicesGroup.add(cornice);
                const cAo = new THREE.Mesh(new THREE.PlaneGeometry(10, 0.45), ceilAoMat);
                cAo.position.set(m.x === 0 ? 0 : (m.x > 0 ? 4.96 : -4.96), 3.68, m.z === 0 ? 0 : (m.z > 0 ? 4.96 : -4.96));
                cAo.rotation.y = m.ry; archGroup.add(cAo);
            });
            archGroup.add(cornicesGroup);

            // 6D. RADIATEUR DESIGN SOUS LA BAIE VITRÉE (Acier blanc mat + Tuyaux cuivre + Vanne thermostatique)
            const radGroup = new THREE.Group();
            radGroup.position.set(4.80, -0.45, 2.05);
            const radWhiteMat = new THREE.MeshStandardMaterial({ color: '#edeae4', roughness: 0.34, metalness: 0.25 });
            const copperMat = new THREE.MeshStandardMaterial({ color: '#c87a4b', roughness: 0.24, metalness: 0.9, envMapIntensity: 1.3 });
            const radManTop = new THREE.Mesh(new THREE.CylinderGeometry(0.026, 0.026, 1.92, 12), radWhiteMat);
            radManTop.rotation.x = Math.PI / 2; radManTop.position.set(0, 0.32, 0); radGroup.add(radManTop);
            const radManBot = new THREE.Mesh(new THREE.CylinderGeometry(0.026, 0.026, 1.92, 12), radWhiteMat);
            radManBot.rotation.x = Math.PI / 2; radManBot.position.set(0, -0.32, 0); radGroup.add(radManBot);
            for (let t = 0; t < 14; t++) {
                const tz = -0.88 + t * (1.76 / 13);
                const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.68, 12), radWhiteMat);
                tube.position.set(0, 0, tz); tube.castShadow = true; tube.receiveShadow = true; radGroup.add(tube);
            }
            // Tuyaux cuivre vers le mur + Vanne thermostatique
            [-0.98, 0.98].forEach((tz, ti) => {
                const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.011, 0.011, 0.22, 10), copperMat);
                pipe.rotation.z = Math.PI / 2; pipe.position.set(0.09, ti === 0 ? 0.32 : -0.32, tz); radGroup.add(pipe);
            });
            const thermoKnob = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.028, 0.09, 14), radWhiteMat);
            thermoKnob.rotation.x = Math.PI / 2; thermoKnob.position.set(-0.02, 0.32, -1.02); radGroup.add(thermoKnob);
            archGroup.add(radGroup);

            // 6E. HORLOGE MURALE DESIGN D'ARCHITECTE (Ronde Braun / Studio, aiguilles live + guichet heure)
            const wallClockGroup = new THREE.Group();
            wallClockGroup.position.set(1.38, 2.52, -4.95);
            const clockRadius = 0.31;

            // Boîtier rond fin en aluminium noir mat + liseré laiton brossé
            const clockBezelMat = new THREE.MeshStandardMaterial({ color: '#1b1d23', roughness: 0.32, metalness: 0.78 });
            const clockBrassMat = new THREE.MeshStandardMaterial({ color: '#c8a86b', roughness: 0.30, metalness: 0.85 });
            const clockCase = new THREE.Mesh(new THREE.CylinderGeometry(clockRadius, clockRadius + 0.012, 0.052, 40), clockBezelMat);
            clockCase.rotation.x = Math.PI / 2;
            clockCase.castShadow = true; clockCase.receiveShadow = true;
            wallClockGroup.add(clockCase);

            // Rebord biseauté extérieur (lunette fine)
            const clockRim = new THREE.Mesh(new THREE.TorusGeometry(clockRadius - 0.004, 0.011, 12, 48), clockBezelMat);
            clockRim.position.z = 0.028;
            wallClockGroup.add(clockRim);
            const clockInnerRing = new THREE.Mesh(new THREE.TorusGeometry(clockRadius - 0.018, 0.003, 8, 48), clockBrassMat);
            clockInnerRing.position.z = 0.026;
            wallClockGroup.add(clockInnerRing);

            // Cadran analogique haute-résolution (512x512) style Braun / studio parisien
            const clockC = document.createElement('canvas'); clockC.width = 512; clockC.height = 512;
            const clockCtx = clockC.getContext('2d');
            const clockTex = configureTex(clockC, 1, 1, true);
            const clockFace = new THREE.Mesh(
                new THREE.CircleGeometry(clockRadius - 0.016, 48),
                new THREE.MeshStandardMaterial({ map: clockTex, roughness: 0.65, metalness: 0.02 })
            );
            clockFace.position.z = 0.027;
            wallClockGroup.add(clockFace);

            // Verre de protection léger avec reflets réalistes
            const clockGlass = new THREE.Mesh(
                new THREE.CircleGeometry(clockRadius - 0.014, 40),
                new THREE.MeshStandardMaterial({ color: '#ffffff', transparent: true, opacity: 0.11, roughness: 0.06, metalness: 0.25 })
            );
            clockGlass.position.z = 0.036;
            wallClockGroup.add(clockGlass);

            archGroup.add(wallClockGroup);
            window._wallClockLastStr = '';
            window.updateWallClock3D = function(overrideTimeStr) {
                const timeStr = (typeof overrideTimeStr === 'string' && overrideTimeStr.length >= 4)
                    ? overrideTimeStr
                    : (document.getElementById('sys-time')?.textContent || '08:00');
                if (timeStr === window._wallClockLastStr) return;
                window._wallClockLastStr = timeStr;

                const parts = timeStr.split(':');
                const hh = parseInt(parts[0], 10) || 8;
                const mm = parseInt(parts[1], 10) || 0;
                const cx = 256, cy = 256, R = 236;

                // Fond cadran ivoire mat architectural avec très léger vignettage interne
                const dialGrad = clockCtx.createRadialGradient(cx, cy - 30, 30, cx, cy, R);
                dialGrad.addColorStop(0, '#faf8f3');
                dialGrad.addColorStop(0.84, '#f1ede4');
                dialGrad.addColorStop(1, '#dfd9cc');
                clockCtx.fillStyle = dialGrad;
                clockCtx.fillRect(0, 0, 512, 512);

                // 60 graduations de minutes + 12 bâtons d'heures nets
                for (let i = 0; i < 60; i++) {
                    const ang = (i / 60) * Math.PI * 2 - Math.PI / 2;
                    const isQuarter = (i % 15 === 0);
                    const isHour = (i % 5 === 0);
                    const rOut = R - 14;
                    const rIn = isQuarter ? R - 46 : (isHour ? R - 36 : R - 24);
                    clockCtx.strokeStyle = isHour ? '#181a20' : 'rgba(24,26,32,0.42)';
                    clockCtx.lineWidth = isQuarter ? 7 : (isHour ? 4.5 : 2);
                    clockCtx.lineCap = 'round';
                    clockCtx.beginPath();
                    clockCtx.moveTo(cx + Math.cos(ang) * rIn, cy + Math.sin(ang) * rIn);
                    clockCtx.lineTo(cx + Math.cos(ang) * rOut, cy + Math.sin(ang) * rOut);
                    clockCtx.stroke();
                }

                // Chiffres minimalistes 12, 3, 6, 9
                clockCtx.fillStyle = '#181a20';
                clockCtx.font = '600 34px Outfit, -apple-system, sans-serif';
                clockCtx.textAlign = 'center';
                clockCtx.textBaseline = 'middle';
                clockCtx.fillText('12', cx, cy - 154);
                clockCtx.fillText('3',  cx + 156, cy + 2);
                clockCtx.fillText('6',  cx, cy + 156);
                clockCtx.fillText('9',  cx - 156, cy + 2);

                // Inscription discrète studio à 12h + petit guichet numérique discret à 6h
                clockCtx.fillStyle = 'rgba(24,26,32,0.52)';
                clockCtx.font = '600 15px monospace';
                clockCtx.fillText('STUDIO 04 · PARIS', cx, cy - 82);

                // Guichet numérique discret (fond sombre + heure précise)
                clockCtx.fillStyle = '#14161c';
                clockCtx.beginPath();
                clockCtx.roundRect(cx - 50, cy + 66, 100, 32, 6);
                clockCtx.fill();
                clockCtx.fillStyle = '#f59e0b';
                clockCtx.font = 'bold 20px monospace';
                clockCtx.fillText(timeStr, cx, cy + 83);

                // Aiguille des heures (noire mate avec ombre légère)
                const hourAngle = (((hh % 12) + mm / 60) / 12) * Math.PI * 2 - Math.PI / 2;
                clockCtx.save();
                clockCtx.shadowColor = 'rgba(0,0,0,0.22)'; clockCtx.shadowBlur = 6; clockCtx.shadowOffsetY = 3;
                clockCtx.strokeStyle = '#14161c'; clockCtx.lineWidth = 12; clockCtx.lineCap = 'round';
                clockCtx.beginPath();
                clockCtx.moveTo(cx - Math.cos(hourAngle) * 26, cy - Math.sin(hourAngle) * 26);
                clockCtx.lineTo(cx + Math.cos(hourAngle) * 124, cy + Math.sin(hourAngle) * 124);
                clockCtx.stroke();

                // Aiguille des minutes
                const minAngle = (mm / 60) * Math.PI * 2 - Math.PI / 2;
                clockCtx.lineWidth = 8;
                clockCtx.beginPath();
                clockCtx.moveTo(cx - Math.cos(minAngle) * 32, cy - Math.sin(minAngle) * 32);
                clockCtx.lineTo(cx + Math.cos(minAngle) * 176, cy + Math.sin(minAngle) * 176);
                clockCtx.stroke();

                // Trotteuse fine ambrée/orange Dieter Rams
                const secAngle = (((mm * 7 + hh * 13) % 60) / 60) * Math.PI * 2 - Math.PI / 2;
                clockCtx.strokeStyle = '#d97706'; clockCtx.lineWidth = 3.5;
                clockCtx.beginPath();
                clockCtx.moveTo(cx - Math.cos(secAngle) * 38, cy - Math.sin(secAngle) * 38);
                clockCtx.lineTo(cx + Math.cos(secAngle) * 184, cy + Math.sin(secAngle) * 184);
                clockCtx.stroke();
                clockCtx.restore();

                // Capuchon central métallique
                clockCtx.fillStyle = '#14161c';
                clockCtx.beginPath(); clockCtx.arc(cx, cy, 12, 0, Math.PI * 2); clockCtx.fill();
                clockCtx.fillStyle = '#d97706';
                clockCtx.beginPath(); clockCtx.arc(cx, cy, 5, 0, Math.PI * 2); clockCtx.fill();

                clockTex.needsUpdate = true;
            };
            window.updateWallClock3D();

            // 6F. MICRO-VIE DE STUDIO : CARNET OUVERT + STYLO, SNEAKERS PRÈS DE LA PORTE & VINYLES EN VRAC
            // Carnet ouvert + Stylo sur le bureau (gauche du clavier)
            const nbGroup = new THREE.Group();
            nbGroup.position.set(-1.35, 0.764, 0.56); nbGroup.rotation.y = 0.28;
            const nbCover = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.012, 0.28), new THREE.MeshStandardMaterial({ color: '#1e2430', roughness: 0.7 }));
            nbGroup.add(nbCover);
            const pageC = document.createElement('canvas'); pageC.width = 256; pageC.height = 160;
            const pgCtx = pageC.getContext('2d');
            pgCtx.fillStyle = '#f5f0e4'; pgCtx.fillRect(0, 0, 256, 160);
            pgCtx.fillStyle = 'rgba(120,140,180,0.22)';
            for (let ly = 20; ly < 150; ly += 14) pgCtx.fillRect(10, ly, 236, 1);
            pgCtx.fillStyle = 'rgba(0,0,0,0.18)'; pgCtx.fillRect(127, 0, 2, 160);
            pgCtx.fillStyle = '#1e293b'; pgCtx.font = 'bold 12px monospace';
            pgCtx.fillText('CHORDS: Fm7 DbM7', 16, 44);
            pgCtx.fillText('Bbm7 -> C7#9', 16, 68);
            pgCtx.fillText('808 SLIDE @ BAR 4', 140, 44);
            pgCtx.fillText('SIDECHAIN KICK', 140, 68);
            const pages = new THREE.Mesh(new THREE.BoxGeometry(0.39, 0.015, 0.25), new THREE.MeshStandardMaterial({ map: configureTex(pageC, 1, 1, true), roughness: 0.9 }));
            pages.position.set(0, 0.008, 0); nbGroup.add(pages);
            const pen = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.005, 0.24, 10), chairChromeMat);
            pen.rotation.z = Math.PI / 2; pen.rotation.y = -0.35; pen.position.set(0.04, 0.022, 0.02); nbGroup.add(pen);
            deskGroup.add(nbGroup);

            // Paire de Sneakers Streetwear Ultra-Réaliste (profil anatomique gauche/droite, col creux, languette, lacets croisés, swoosh courbe)
            function buildRealisticSneaker(x, z, rotY, side = 1) {
                const sn = new THREE.Group();
                sn.position.set(x, -1.0, z);
                sn.rotation.y = rotY;
                // Effet miroir pied gauche (-1) vs pied droit (+1)
                const foot = new THREE.Group();
                foot.scale.x = side;
                sn.add(foot);

                const outsoleMat = new THREE.MeshStandardMaterial({ color: '#1b1d22', roughness: 0.85 });
                const midsoleMat = new THREE.MeshStandardMaterial({ color: '#f2eee6', roughness: 0.62 });
                const leatherWhiteMat = new THREE.MeshStandardMaterial({ map: leatherTex.map, normalMap: leatherTex.normalMap, normalScale: new THREE.Vector2(0.35, 0.35), color: '#ede9e0', roughness: 0.46 });
                const suedePanelMat = new THREE.MeshStandardMaterial({ map: curtainTex.map, bumpMap: curtainTex.bumpMap, bumpScale: 0.012, color: '#2b2f3a', roughness: 0.88 });
                const accentRedMat = new THREE.MeshStandardMaterial({ map: leatherTex.map, color: '#b83227', roughness: 0.48 });
                const liningMat = new THREE.MeshStandardMaterial({ color: '#14151a', roughness: 0.95 });
                const laceMat = new THREE.MeshStandardMaterial({ color: '#f8f6f1', roughness: 0.9 });
                const eyeletMat = new THREE.MeshStandardMaterial({ color: '#9ca3af', roughness: 0.32, metalness: 0.82 });

                // 1. Forme anatomique de semelle (cambrure interne, avant-pied large, talon galbé)
                const soleShape = new THREE.Shape();
                soleShape.moveTo(-0.044, 0.16);
                soleShape.bezierCurveTo(-0.068, 0.14, -0.068, 0.05, -0.056, -0.02);   // Côté extérieur (talon -> voûte)
                soleShape.bezierCurveTo(-0.072, -0.09, -0.070, -0.175, -0.020, -0.205); // Avant-pied extérieur -> pointe
                soleShape.bezierCurveTo(0.025, -0.215, 0.066, -0.182, 0.068, -0.115);   // Pointe arrondie -> intérieur
                soleShape.bezierCurveTo(0.064, -0.04, 0.046, 0.02, 0.052, 0.10);        // Cambrure voûte plantaire
                soleShape.bezierCurveTo(0.056, 0.145, 0.036, 0.172, 0.0, 0.174);        // Arrondi talon
                soleShape.bezierCurveTo(-0.024, 0.174, -0.036, 0.168, -0.044, 0.16);

                // Semelle extérieure crantée caoutchouc noir
                const outGeo = new THREE.ExtrudeGeometry(soleShape, { depth: 0.012, bevelEnabled: true, bevelThickness: 0.004, bevelSize: 0.004, bevelSegments: 2 });
                outGeo.rotateX(Math.PI / 2);
                const outsole = new THREE.Mesh(outGeo, outsoleMat);
                outsole.position.set(0, 0.016, 0); outsole.castShadow = true; outsole.receiveShadow = true;
                foot.add(outsole);

                // Semelle intermédiaire (Midsole) blanc cassé avec légère courbure avant (toe-spring)
                const midGeo = new THREE.ExtrudeGeometry(soleShape, { depth: 0.026, bevelEnabled: true, bevelThickness: 0.005, bevelSize: 0.003, bevelSegments: 3 });
                midGeo.rotateX(Math.PI / 2);
                const mPos = midGeo.attributes.position;
                for (let i = 0; i < mPos.count; i++) {
                    const mz = mPos.getZ(i);
                    if (mz < -0.12) {
                        const lift = Math.pow((-0.12 - mz) / 0.10, 1.8) * 0.012;
                        mPos.setY(i, mPos.getY(i) + lift);
                    }
                }
                midGeo.computeVertexNormals();
                const midsole = new THREE.Mesh(midGeo, midsoleMat);
                midsole.position.set(0, 0.044, 0); midsole.castShadow = true; midsole.receiveShadow = true;
                foot.add(midsole);

                // 2. Toe-box bombée (cuir blanc) + Mudguard avant (daim charcoal)
                const toeBoxGeo = new THREE.SphereGeometry(0.066, 18, 12, 0, Math.PI * 2, 0, Math.PI * 0.56);
                toeBoxGeo.scale(0.98, 0.72, 1.48);
                const toeBox = new THREE.Mesh(toeBoxGeo, leatherWhiteMat);
                toeBox.position.set(0.002, 0.040, -0.105); toeBox.castShadow = true;
                foot.add(toeBox);

                const mudGeo = new THREE.TorusGeometry(0.062, 0.017, 10, 20, Math.PI * 1.15);
                mudGeo.scale(1.02, 1.38, 0.9);
                const mudguard = new THREE.Mesh(mudGeo, suedePanelMat);
                mudguard.rotation.x = Math.PI / 2;
                mudguard.rotation.z = Math.PI * 0.92;
                mudguard.position.set(0.002, 0.056, -0.115); mudguard.castShadow = true;
                foot.add(mudguard);

                // 3. Quartiers latéraux (cuir blanc) + Contrefort talon (cuir bordeaux/rouge)
                const midBodyGeo = new THREE.CylinderGeometry(0.054, 0.061, 0.072, 18, 1, false);
                midBodyGeo.scale(1.06, 1.0, 1.55);
                const midBody = new THREE.Mesh(midBodyGeo, leatherWhiteMat);
                midBody.position.set(0, 0.078, 0.005); midBody.castShadow = true;
                foot.add(midBody);

                const heelGeo = new THREE.CylinderGeometry(0.054, 0.058, 0.095, 16, 1, false, -Math.PI * 0.6, Math.PI * 1.2);
                heelGeo.scale(1.02, 1.0, 1.18);
                const heelCounter = new THREE.Mesh(heelGeo, accentRedMat);
                heelCounter.position.set(0, 0.090, 0.088); heelCounter.rotation.x = -0.10; heelCounter.castShadow = true;
                foot.add(heelCounter);

                // 4. Col de cheville rembourré OUVERT & CREUX (bourrelet en U + doublure sombre interne)
                const collarRimGeo = new THREE.TorusGeometry(0.052, 0.017, 12, 22, Math.PI * 1.48);
                collarRimGeo.scale(0.96, 1.32, 1.0);
                const collarRim = new THREE.Mesh(collarRimGeo, suedePanelMat);
                collarRim.rotation.x = Math.PI / 2 + 0.18;
                collarRim.rotation.z = -Math.PI * 0.24;
                collarRim.position.set(0, 0.132, 0.075); collarRim.castShadow = true;
                foot.add(collarRim);

                // Intérieur creux sombre + semelle intérieure visible au fond
                const cavityWall = new THREE.Mesh(new THREE.CylinderGeometry(0.044, 0.042, 0.075, 16, 1, true), liningMat);
                cavityWall.scale.set(0.95, 1.0, 1.25);
                cavityWall.position.set(0, 0.098, 0.072);
                foot.add(cavityWall);
                const insole = new THREE.Mesh(new THREE.CircleGeometry(0.042, 14), liningMat);
                insole.scale.set(0.94, 1.25, 1);
                insole.rotation.x = -Math.PI / 2;
                insole.position.set(0, 0.062, 0.072);
                foot.add(insole);

                // 5. Languette rembourrée souple + étiquette tissée + œillets + 5 lacets croisés
                const tongueGeo = new THREE.BoxGeometry(0.068, 0.115, 0.016, 4, 6, 1);
                const tPos = tongueGeo.attributes.position;
                for (let i = 0; i < tPos.count; i++) {
                    const ty = tPos.getY(i);
                    tPos.setZ(i, tPos.getZ(i) + Math.pow(Math.max(0, ty + 0.05), 1.6) * 0.22);
                }
                tongueGeo.computeVertexNormals();
                const tongue = new THREE.Mesh(tongueGeo, leatherWhiteMat);
                tongue.position.set(0, 0.116, -0.012); tongue.rotation.x = 0.56; tongue.castShadow = true;
                foot.add(tongue);
                const tongueTag = new THREE.Mesh(new THREE.BoxGeometry(0.032, 0.018, 0.004), accentRedMat);
                tongueTag.position.set(0, 0.156, 0.016); tongueTag.rotation.x = 0.56;
                foot.add(tongueTag);

                // Bandes d'œillets (eyestays) + 5 lacets croisés en X + petit nœud au sommet
                for (let s of [-1, 1]) {
                    const eyestay = new THREE.Mesh(new THREE.BoxGeometry(0.014, 0.095, 0.022), suedePanelMat);
                    eyestay.position.set(s * 0.038, 0.106, -0.026);
                    eyestay.rotation.x = 0.68; eyestay.rotation.z = s * 0.12;
                    foot.add(eyestay);
                }
                for (let li = 0; li < 5; li++) {
                    const lz = -0.068 + li * 0.022;
                    const ly = 0.088 + li * 0.014;
                    const lace1 = new THREE.Mesh(new THREE.CylinderGeometry(0.0032, 0.0032, 0.068, 6), laceMat);
                    lace1.position.set(0, ly, lz);
                    lace1.rotation.set(0, 0.26, Math.PI / 2);
                    const lace2 = new THREE.Mesh(new THREE.CylinderGeometry(0.0032, 0.0032, 0.068, 6), laceMat);
                    lace2.position.set(0, ly + 0.002, lz);
                    lace2.rotation.set(0, -0.26, Math.PI / 2);
                    foot.add(lace1, lace2);
                    for (let s of [-1, 1]) {
                        const eyelet = new THREE.Mesh(new THREE.CylinderGeometry(0.0035, 0.0035, 0.005, 8), eyeletMat);
                        eyelet.position.set(s * 0.035, ly, lz); eyelet.rotation.z = Math.PI / 2;
                        foot.add(eyelet);
                    }
                }
                // Boucles de nœud de lacets en haut de la languette
                for (let s of [-1, 1]) {
                    const bowLoop = new THREE.Mesh(new THREE.TorusGeometry(0.013, 0.0028, 6, 12), laceMat);
                    bowLoop.scale.set(1.4, 0.65, 1);
                    bowLoop.position.set(s * 0.016, 0.148, 0.024);
                    bowLoop.rotation.set(0.4, s * 0.35, s * 0.25);
                    foot.add(bowLoop);
                }

                // 6. Swoosh latéral courbe sculpté des deux côtés
                const swShape = new THREE.Shape();
                swShape.moveTo(-0.075, 0.010);
                swShape.quadraticCurveTo(-0.015, -0.014, 0.085, 0.024);
                swShape.quadraticCurveTo(0.002, -0.032, -0.080, -0.004);
                swShape.closePath();
                const swGeo = new THREE.ExtrudeGeometry(swShape, { depth: 0.006, bevelEnabled: false });
                for (let s of [-1, 1]) {
                    const sw = new THREE.Mesh(swGeo, accentRedMat);
                    sw.rotation.y = s > 0 ? Math.PI / 2 : -Math.PI / 2;
                    sw.position.set(s * 0.059, 0.078, 0.008);
                    foot.add(sw);
                }

                sneakersTier3Group.add(sn);
            }
            const sneakersTier3Group = new THREE.Group();
            buildRealisticSneaker(-4.20, 3.54, 0.42, -1);
            buildRealisticSneaker(-3.93, 3.70, 0.08, 1);
            archGroup.add(sneakersTier3Group);

            // 6G. BAC À DISQUES VINYLES DE PRODUCTEUR ULTRA-RÉALISTE (Meuble Noyer ajouré sur pieds acier + 12 pochettes illustrées + disques noirs!)
            try {
                if (typeof crateBase !== 'undefined') crateBase.visible = false;
                if (typeof crateSideL !== 'undefined') crateSideL.visible = false;
                if (typeof crateSideR !== 'undefined') crateSideR.visible = false;
                if (typeof crateBack !== 'undefined') crateBack.visible = false;
                if (typeof crateFront !== 'undefined') crateFront.visible = false;

                const crateWalnutMat = new THREE.MeshStandardMaterial({
                    map: walnutTex.map, normalMap: walnutTex.normalMap, normalScale: new THREE.Vector2(0.7, 0.7),
                    color: '#b88a62', roughness: 0.44, metalness: 0.04
                });
                const crateSteelMat = new THREE.MeshStandardMaterial({ color: '#1b1d23', roughness: 0.34, metalness: 0.85 });
                const crateBrassMat = new THREE.MeshStandardMaterial({ color: '#d4af37', roughness: 0.28, metalness: 0.88 });

                const standGroup = new THREE.Group();
                const tagCrate = (m) => { m.name = 'achievements_board_mesh'; m.castShadow = true; m.receiveShadow = true; return m; };

                // 4 Pieds compas inclinés en acier noir mat + traverses (surélèvent élégamment le bac)
                const cLegCoords = [[-0.36, -0.26, -0.12, -0.10], [0.36, -0.26, 0.12, -0.10], [-0.36, 0.26, -0.12, 0.10], [0.36, 0.26, 0.12, 0.10]];
                cLegCoords.forEach(([lx, lz, rz, rx]) => {
                    const leg = tagCrate(new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.011, 0.21, 10), crateSteelMat));
                    leg.position.set(lx, 0.10, lz);
                    leg.rotation.set(rx, 0, -rz);
                    standGroup.add(leg);
                    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.014, 0.012, 10), crateBrassMat);
                    cap.position.set(lx * 1.05, 0.008, lz * 1.05);
                    standGroup.add(cap);
                });
                // Cadre inférieur métallique de support
                const frameBarF = tagCrate(new THREE.Mesh(new THREE.BoxGeometry(0.80, 0.022, 0.022), crateSteelMat));
                frameBarF.position.set(0, 0.19, 0.26);
                const frameBarB = tagCrate(new THREE.Mesh(new THREE.BoxGeometry(0.80, 0.022, 0.022), crateSteelMat));
                frameBarB.position.set(0, 0.19, -0.26);
                standGroup.add(frameBarF, frameBarB);

                // Fond biseauté en noyer massif
                const deck = tagCrate(new THREE.Mesh(new THREE.BoxGeometry(0.86, 0.036, 0.64), crateWalnutMat));
                deck.position.set(0, 0.218, 0);
                standGroup.add(deck);

                // 4 Montants d'angle chanfreinés en noyer
                [[-0.41, -0.30], [0.41, -0.30], [-0.41, 0.30], [0.41, 0.30]].forEach(([px, pz]) => {
                    const postH = pz < 0 ? 0.44 : 0.36;
                    const post = tagCrate(new THREE.Mesh(new THREE.BoxGeometry(0.042, postH, 0.042), crateWalnutMat));
                    post.position.set(px, 0.22 + postH / 2, pz);
                    standGroup.add(post);
                });

                // Flancs ajourés à 3 lattes horizontales en noyer (on aperçoit les pochettes entre les lattes!)
                for (let side of [-1, 1]) {
                    [0.31, 0.43, 0.55].forEach((ry) => {
                        const slat = tagCrate(new THREE.Mesh(new THREE.BoxGeometry(0.026, 0.072, 0.60), crateWalnutMat));
                        slat.position.set(side * 0.415, ry, 0);
                        standGroup.add(slat);
                    });
                }
                // Dos ajouré à 3 lattes + barre de retenue supérieure
                [0.32, 0.45, 0.58].forEach((ry) => {
                    const backSlat = tagCrate(new THREE.Mesh(new THREE.BoxGeometry(0.82, 0.078, 0.026), crateWalnutMat));
                    backSlat.position.set(0, ry, -0.305);
                    standGroup.add(backSlat);
                });
                // Façade basse élégante inclinée + plaque laiton brossé de disquaire
                const frontPanel = tagCrate(new THREE.Mesh(new THREE.BoxGeometry(0.82, 0.18, 0.03), crateWalnutMat));
                frontPanel.position.set(0, 0.31, 0.305);
                standGroup.add(frontPanel);
                const brassPlaque = tagCrate(new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.045, 0.008), crateBrassMat));
                brassPlaque.position.set(0, 0.32, 0.324);
                standGroup.add(brassPlaque);

                // 2 Arceaux séparateurs en fil d'acier noir à l'intérieur du bac
                [-0.14, 0.14].forEach(dx => {
                    const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.34, 8), crateSteelMat);
                    rod.position.set(dx, 0.39, -0.02); rod.rotation.x = -0.14;
                    standGroup.add(rod);
                });

                // Collection permanente de 12 vinyles illustrés dans le bac + 2 disques noirs brillants qui dépassent !
                const vinylDiscMat = new THREE.MeshStandardMaterial({ color: '#0c0d11', roughness: 0.16, metalness: 0.42 });
                const sleeveEdgeMat = new THREE.MeshStandardMaterial({ color: '#e5dfd3', roughness: 0.85 });
                const sleeveBackMat = new THREE.MeshStandardMaterial({ color: '#1b1d24', roughness: 0.72 });
                const lpGeo = new THREE.BoxGeometry(0.56, 0.56, 0.014);
                const labelColors = ['#e11d48', '#f59e0b', '#10b981', '#6366f1'];

                for (let k = 0; k < 12; k++) {
                    const covTex = (typeof window.createVinylCoverTexture === 'function')
                        ? window.createVinylCoverTexture('studio_dig_lp_' + k, 256)
                        : null;
                    const frontArtMat = new THREE.MeshStandardMaterial({
                        map: covTex || null,
                        color: covTex ? '#ffffff' : labelColors[k % labelColors.length],
                        roughness: 0.45
                    });
                    const lp = tagCrate(new THREE.Mesh(lpGeo, [sleeveEdgeMat, sleeveEdgeMat, sleeveEdgeMat, sleeveEdgeMat, frontArtMat, sleeveBackMat]));
                    const zPos = -0.24 + k * 0.036;
                    const xJitter = ((k * 37) % 11 - 5) * 0.012;
                    lp.position.set(xJitter, 0.51, zPos);
                    lp.rotation.set(-0.18 + (k > 9 ? 0.08 : 0), (k % 3 - 1) * 0.02, ((k * 13) % 7 - 3) * 0.012);
                    standGroup.add(lp);

                    // Sur 2 pochettes, un vrai disque vinyle noir 12" sort à moitié avec son macaron coloré !
                    if (k === 3 || k === 10) {
                        const discGroup = new THREE.Group();
                        const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.26, 0.005, 28), vinylDiscMat);
                        disc.rotation.x = Math.PI / 2;
                        const label = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.085, 0.007, 20), new THREE.MeshStandardMaterial({ color: k === 3 ? '#f59e0b' : '#e11d48', roughness: 0.55 }));
                        label.rotation.x = Math.PI / 2;
                        const hole = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.009, 10), sleeveEdgeMat);
                        hole.rotation.x = Math.PI / 2;
                        discGroup.add(disc, label, hole);
                        discGroup.position.set(k === 3 ? 0.13 : -0.11, 0.09, 0.002);
                        lp.add(discGroup);
                    }
                }

                crateGroup.add(standGroup);
                window._crateStandTier3 = standGroup;
                if (typeof vinylsContainer !== 'undefined') {
                    vinylsContainer.position.set(0, 0.23, 0.02);
                }
            } catch(e) { console.warn('Realistic vinyl crate build fallback:', e); }

            // 3 Vinyles illustrés en vrac appuyés naturellement contre le côté du bac à disques (Tier 3)
            const looseVinylsTier3Group = new THREE.Group();
            const looseEdgeMat = new THREE.MeshStandardMaterial({ color: '#e5dfd3', roughness: 0.85 });
            const looseBackMat = new THREE.MeshStandardMaterial({ color: '#1b1d24', roughness: 0.72 });
            const looseDiscMat = new THREE.MeshStandardMaterial({ color: '#0c0d11', roughness: 0.16, metalness: 0.42 });
            for (let vi = 0; vi < 3; vi++) {
                const artTex = (typeof window.createVinylCoverTexture === 'function')
                    ? window.createVinylCoverTexture('loose_floor_lp_' + vi, 256)
                    : null;
                const artMat = new THREE.MeshStandardMaterial({
                    map: artTex || null,
                    color: artTex ? '#ffffff' : ['#e11d48', '#2563eb', '#d97706'][vi],
                    roughness: 0.44
                });
                const vSleeve = new THREE.Mesh(
                    new THREE.BoxGeometry(0.56, 0.56, 0.014),
                    [looseEdgeMat, looseEdgeMat, looseEdgeMat, looseEdgeMat, artMat, looseBackMat]
                );
                vSleeve.position.set(2.94 - vi * 0.036, -0.73, 0.46 + vi * 0.065);
                vSleeve.rotation.order = 'YXZ';
                vSleeve.rotation.set(-0.19 - vi * 0.035, -Math.PI / 2 + (vi - 1) * 0.07, 0);
                vSleeve.castShadow = true; vSleeve.receiveShadow = true;
                vSleeve.name = 'achievements_board_mesh';
                if (vi === 2) {
                    const outDisc = new THREE.Mesh(new THREE.CylinderGeometry(0.255, 0.255, 0.005, 28), looseDiscMat);
                    outDisc.rotation.x = Math.PI / 2;
                    outDisc.position.set(0.11, 0.07, 0.002);
                    const outLbl = new THREE.Mesh(new THREE.CylinderGeometry(0.082, 0.082, 0.007, 18), new THREE.MeshStandardMaterial({ color: '#38bdf8', roughness: 0.5 }));
                    outLbl.rotation.x = Math.PI / 2;
                    outLbl.position.set(0.11, 0.07, 0.002);
                    vSleeve.add(outDisc, outLbl);
                }
                looseVinylsTier3Group.add(vSleeve);
            }
            archGroup.add(looseVinylsTier3Group);

            // 7. Plante Botanique (Monstera / Ficus) en Pot Terracotta (feuilles animées par la brise!)
            const plantGroup = new THREE.Group();
            plantGroup.position.set(4.25, -1, 4.15);
            const potMat = new THREE.MeshStandardMaterial({ color: '#b4674a', roughness: 0.78 });
            const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.22, 0.48, 20), potMat);
            pot.position.set(0, 0.24, 0); pot.castShadow = true; pot.receiveShadow = true; plantGroup.add(pot);
            const soil = new THREE.Mesh(new THREE.CircleGeometry(0.26, 16), new THREE.MeshStandardMaterial({ color: '#2e2118', roughness: 0.98 }));
            soil.rotation.x = -Math.PI / 2; soil.position.set(0, 0.46, 0); plantGroup.add(soil);
            const leafMat = new THREE.MeshStandardMaterial({ color: '#2f643e', roughness: 0.38, metalness: 0.04, side: THREE.DoubleSide });
            const stemMat = new THREE.MeshStandardMaterial({ color: '#244d30', roughness: 0.7 });
            window.plantLeaves = [];
            for (let l = 0; l < 11; l++) {
                const ang = (l / 11) * Math.PI * 2 + (l % 2) * 0.2;
                const h = 0.55 + (l % 4) * 0.22;
                const reach = 0.22 + (l % 3) * 0.12;
                const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.015, h, 6), stemMat);
                stem.position.set(Math.cos(ang) * reach * 0.45, 0.42 + h * 0.45, Math.sin(ang) * reach * 0.45);
                stem.rotation.z = -Math.cos(ang) * 0.35; stem.rotation.x = Math.sin(ang) * 0.35;
                plantGroup.add(stem);
                const leafGeo = new THREE.SphereGeometry(0.18, 10, 8);
                leafGeo.scale(1.0, 0.12, 1.45);
                const leaf = new THREE.Mesh(leafGeo, leafMat);
                leaf.position.set(Math.cos(ang) * reach, 0.42 + h * 0.9, Math.sin(ang) * reach);
                leaf.rotation.y = -ang + Math.PI / 2;
                const baseRx = 0.45 + (l % 3) * 0.12;
                leaf.rotation.x = baseRx;
                leaf.userData = { baseRx: baseRx, phase: l * 0.85 };
                leaf.castShadow = true;
                plantGroup.add(leaf);
                window.plantLeaves.push(leaf);
            }
            archGroup.add(plantGroup);
            addContactAO(4.25, -0.996, 4.15, 0.85, 0.85, 0.45);

            // 8. Table de chevet en noyer + Lampe de chevet douce à côté du lit
            const nsGroup = new THREE.Group();
            nsGroup.position.set(2.22, -1, -4.55);
            const nsBox = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.62, 0.52), new THREE.MeshStandardMaterial({ map: walnutTex.map, color: '#b88e6b', roughness: 0.45 }));
            nsBox.position.set(0, 0.31, 0); nsBox.castShadow = true; nsBox.receiveShadow = true; nsGroup.add(nsBox);
            const lampBase = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 0.18, 14), new THREE.MeshStandardMaterial({ color: '#d4b895', roughness: 0.35, metalness: 0.4 }));
            lampBase.position.set(0, 0.71, 0); nsGroup.add(lampBase);
            const bedsideShadeMat = new THREE.MeshStandardMaterial({ color: '#fff7e6', emissive: '#ffcf87', emissiveIntensity: 0.65, roughness: 0.85, side: THREE.DoubleSide });
            const lampShade = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.19, 0.24, 18, 1, true), bedsideShadeMat);
            lampShade.position.set(0, 0.92, 0); nsGroup.add(lampShade);
            const bedsideLight = new THREE.PointLight('#ffbe78', 1.2, 11.0, 1.45);
            bedsideLight.position.set(0, 0.96, 0.12); nsGroup.add(bedsideLight);
            window.bedsideLight = bedsideLight;
            window.bedsideShadeMat = bedsideShadeMat;
            archGroup.add(nsGroup);

            // =========================================================================
            // MICRO-ANIMATION DE LA PORTE (PIVOT CHARNIÈRE + RAI DE LUMIÈRE)
            // =========================================================================
            try {
                const doorPivot = new THREE.Group();
                doorPivot.position.set(-0.70, 0, 0);
                doorGroup.add(doorPivot);
                // Déplace le panneau + moulures + poignée dans le pivot de charnière
                const moveChildren = [doorPanel, stileL, stileR, railTop, railMid, railBottom, handlePlate, handleStem, handleLever];
                moveChildren.forEach(m => {
                    if (m && m.parent === doorGroup) {
                        m.position.x += 0.70;
                        doorPivot.add(m);
                    }
                });
                const doorLightRayMat = new THREE.MeshBasicMaterial({
                    color: '#fff2d6', transparent: true, opacity: 0.0, side: THREE.DoubleSide, depthWrite: false
                });
                const doorLightRay = new THREE.Mesh(new THREE.PlaneGeometry(1.36, 3.22), doorLightRayMat);
                doorLightRay.position.set(0, 1.62, -0.06);
                doorGroup.add(doorLightRay);

                window.doorPivot = doorPivot;
                window.doorLightRayMat = doorLightRayMat;
                window.doorTargetAngle = 0;
                window.animateDoorCrackOpen = function(callback) {
                    window.doorTargetAngle = 0.44;
                    if (typeof playTone === 'function') playTone(210, 'triangle', 0.14, 0.04);
                    setTimeout(() => {
                        if (typeof callback === 'function') callback();
                        setTimeout(() => { window.doorTargetAngle = 0; }, 900);
                    }, 340);
                };
            } catch(e) { console.warn('Door pivot setup fallback:', e); }


            // =========================================================================
            // SYSTÈME D'ÉVOLUTION VISUELLE DE LA CHAMBRE (TIERS 1 -> 2 -> 3)
            // Tier 1 (0–24% Mastery & Rang 1) : Chambre Galère / Underground sombre & sale
            // Tier 2 (25–54% Mastery ou Rang 2) : Home-Studio Rénové (propre & rangé)
            // Tier 3 (55%+ Mastery ou Rang 3)   : Chambre Architecte Clean V4 (prête pour Studio Pro à 80%)
            // =========================================================================

            // A. Textures Grunge Procédurales (Tier 1 : murs tachés/fissurés, vieux sol usé, plafond béton brut, bureau rayé)
            function createGrungeWallTextures() {
                const w = 512, h = 512;
                const diffC = document.createElement('canvas'); diffC.width = w; diffC.height = h;
                const dCtx = diffC.getContext('2d');
                const bumpC = document.createElement('canvas'); bumpC.width = w; bumpC.height = h;
                const bCtx = bumpC.getContext('2d');

                dCtx.fillStyle = '#8b857b'; dCtx.fillRect(0, 0, w, h);
                bCtx.fillStyle = '#808080'; bCtx.fillRect(0, 0, w, h);

                // Taches d'humidité et salissures en haut et en bas du mur
                const topStain = dCtx.createLinearGradient(0, 0, 0, h * 0.34);
                topStain.addColorStop(0, 'rgba(34,28,22,0.44)'); topStain.addColorStop(1, 'rgba(34,28,22,0)');
                dCtx.fillStyle = topStain; dCtx.fillRect(0, 0, w, h * 0.34);

                const botStain = dCtx.createLinearGradient(0, h * 0.65, 0, h);
                botStain.addColorStop(0, 'rgba(26,22,18,0)'); botStain.addColorStop(1, 'rgba(26,22,18,0.48)');
                dCtx.fillStyle = botStain; dCtx.fillRect(0, h * 0.65, w, h * 0.35);

                // Auréoles de plâtre vieilli & zones écaillées
                for (let c = 0; c < 48; c++) {
                    const cx = Math.random() * w, cy = Math.random() * h, rad = 22 + Math.random() * 68;
                    const g = dCtx.createRadialGradient(cx, cy, 2, cx, cy, rad);
                    g.addColorStop(0, c % 3 === 0 ? 'rgba(42,36,28,0.22)' : 'rgba(155,146,132,0.12)');
                    g.addColorStop(1, 'rgba(0,0,0,0)');
                    dCtx.fillStyle = g; dCtx.fillRect(0, 0, w, h);
                    bCtx.fillStyle = c % 2 === 0 ? 'rgba(92,92,92,0.28)' : 'rgba(154,154,154,0.22)';
                    bCtx.beginPath(); bCtx.arc(cx, cy, rad * 0.45, 0, Math.PI * 2); bCtx.fill();
                }
                // Fissures fines dans le plâtre / béton
                dCtx.strokeStyle = 'rgba(28,24,20,0.52)'; bCtx.strokeStyle = '#383838';
                for (let f = 0; f < 9; f++) {
                    let fx = Math.random() * w, fy = Math.random() * h;
                    dCtx.lineWidth = 1.0 + Math.random() * 1.1; bCtx.lineWidth = 2.0;
                    dCtx.beginPath(); dCtx.moveTo(fx, fy);
                    bCtx.beginPath(); bCtx.moveTo(fx, fy);
                    for (let s = 0; s < 10; s++) {
                        fx += (Math.random() - 0.5) * 32;
                        fy += (Math.random() - 0.3) * 28;
                        dCtx.lineTo(fx, fy); bCtx.lineTo(fx, fy);
                    }
                    dCtx.stroke(); bCtx.stroke();
                }
                // Grain brut poussiéreux
                for (let i = 0; i < 8000; i++) {
                    const x = Math.random() * w, y = Math.random() * h, sz = 1 + Math.random() * 2.2;
                    dCtx.fillStyle = Math.random() > 0.5 ? 'rgba(22,18,14,0.08)' : 'rgba(210,200,185,0.05)';
                    dCtx.fillRect(x, y, sz, sz);
                    const bv = 98 + Math.floor(Math.random() * 58);
                    bCtx.fillStyle = `rgb(${bv},${bv},${bv})`; bCtx.fillRect(x, y, sz, sz);
                }
                return {
                    map: configureTex(diffC, 2.5, 1, true),
                    normalMap: heightCanvasToNormalMap(bumpC, 2.8, 2.5, 1)
                };
            }

            function createWornFloorTextures() {
                const w = 512, h = 512;
                const diffC = document.createElement('canvas'); diffC.width = w; diffC.height = h;
                const dCtx = diffC.getContext('2d');
                const bumpC = document.createElement('canvas'); bumpC.width = w; bumpC.height = h;
                const bCtx = bumpC.getContext('2d');

                dCtx.fillStyle = '#5c4d3e'; dCtx.fillRect(0, 0, w, h);
                bCtx.fillStyle = '#808080'; bCtx.fillRect(0, 0, w, h);

                const rows = 8, rh = h / rows;
                for (let r = 0; r < rows; r++) {
                    const y = r * rh;
                    const offset = (r % 2) * 140;
                    for (let c = -1; c < 3; c++) {
                        const x = c * 256 + offset;
                        const shade = 74 + Math.floor(Math.random() * 24);
                        dCtx.fillStyle = `rgb(${shade + 14}, ${shade + 2}, ${shade - 10})`;
                        dCtx.fillRect(x + 2, y + 2, 252, rh - 4);
                        // Rayures et traces de pas sombres
                        for (let g = 0; g < 12; g++) {
                            dCtx.fillStyle = 'rgba(24,18,12,0.22)';
                            dCtx.fillRect(x + Math.random() * 220, y + 4 + Math.random() * (rh - 8), 22 + Math.random() * 48, 1.5);
                        }
                        dCtx.strokeStyle = 'rgba(14,10,6,0.72)'; dCtx.lineWidth = 3;
                        dCtx.strokeRect(x + 1, y + 1, 254, rh - 2);
                        bCtx.strokeStyle = '#303030'; bCtx.lineWidth = 3;
                        bCtx.strokeRect(x + 1, y + 1, 254, rh - 2);
                    }
                }
                // Taches sombres / usure au sol
                for (let s = 0; s < 35; s++) {
                    const sx = Math.random() * w, sy = Math.random() * h, sr = 18 + Math.random() * 44;
                    const g = dCtx.createRadialGradient(sx, sy, 2, sx, sy, sr);
                    g.addColorStop(0, 'rgba(18,14,10,0.26)'); g.addColorStop(1, 'rgba(0,0,0,0)');
                    dCtx.fillStyle = g; dCtx.fillRect(0, 0, w, h);
                }
                return {
                    map: configureTex(diffC, 3.2, 3.2, true),
                    normalMap: heightCanvasToNormalMap(bumpC, 3.2, 3.2, 3.2)
                };
            }

            function createGrungeDeskTextures() {
                const w = 512, h = 512;
                const diffC = document.createElement('canvas'); diffC.width = w; diffC.height = h;
                const dCtx = diffC.getContext('2d');
                dCtx.fillStyle = '#62564a'; dCtx.fillRect(0, 0, w, h);
                for (let i = 0; i < 4000; i++) {
                    dCtx.fillStyle = Math.random() > 0.5 ? 'rgba(28,22,18,0.14)' : 'rgba(148,136,120,0.10)';
                    dCtx.fillRect(Math.random() * w, Math.random() * h, 2 + Math.random() * 6, 1.5);
                }
                // Marque de tasse de café + rayures sur le vieux plateau
                dCtx.strokeStyle = 'rgba(42,24,12,0.45)'; dCtx.lineWidth = 4;
                dCtx.beginPath(); dCtx.arc(135, 310, 26, 0, Math.PI * 2); dCtx.stroke();
                dCtx.strokeStyle = 'rgba(20,16,12,0.38)'; dCtx.lineWidth = 1.5;
                for (let sc = 0; sc < 14; sc++) {
                    const sx = Math.random() * w, sy = Math.random() * h;
                    dCtx.beginPath(); dCtx.moveTo(sx, sy); dCtx.lineTo(sx + (Math.random() - 0.5) * 90, sy + (Math.random() - 0.5) * 35); dCtx.stroke();
                }
                return { map: configureTex(diffC, 2, 1, true) };
            }

            const grungeWallTex = createGrungeWallTextures();
            const wornFloorTex = createWornFloorTextures();
            const grungeDeskTex = createGrungeDeskTextures();
            const cleanTier2WallTex = createWallPlasterTextures('#dad6ce', true, 2.5, 1);

            // B. GROUPE TIER 1 : CHAMBRE GALÈRE / UNDERGROUND (0-24% Mastery & Rang 1)
            const roomTier1Group = new THREE.Group();
            roomTier1Group.visible = false;

            const rawPalletMat = new THREE.MeshStandardMaterial({ color: '#78634a', roughness: 0.94 });
            const oldMetalMat = new THREE.MeshStandardMaterial({ color: '#3b3e45', roughness: 0.65, metalness: 0.6 });
            const rustyCastIronMat = new THREE.MeshStandardMaterial({ color: '#524f4a', roughness: 0.85, metalness: 0.45 });
            const kraftMat = new THREE.MeshStandardMaterial({ color: '#9c7b56', roughness: 0.92 });
            const tapeMat = new THREE.MeshStandardMaterial({ color: '#b59d78', roughness: 0.55 });

            // 0A. FENÊTRE ÉVOLUTIVE TIER 1 : Vitre poussiéreuse + Vieux store vénitien à lamelles à moitié descendu!
            const dustWinC = document.createElement('canvas'); dustWinC.width = 256; dustWinC.height = 256;
            const dwCtx = dustWinC.getContext('2d');
            dwCtx.clearRect(0, 0, 256, 256);
            const dwGrad = dwCtx.createRadialGradient(128, 128, 30, 128, 128, 175);
            dwGrad.addColorStop(0, 'rgba(130,122,110,0.06)');
            dwGrad.addColorStop(0.75, 'rgba(98,90,78,0.22)');
            dwGrad.addColorStop(1, 'rgba(65,58,48,0.42)');
            dwCtx.fillStyle = dwGrad; dwCtx.fillRect(0, 0, 256, 256);
            for (let di = 0; di < 1400; di++) {
                dwCtx.fillStyle = Math.random() > 0.5 ? 'rgba(170,160,145,0.16)' : 'rgba(60,55,48,0.12)';
                dwCtx.fillRect(Math.random() * 256, Math.random() * 256, 1.5 + Math.random() * 2, 1.5 + Math.random() * 2);
            }
            const windowDustPane = new THREE.Mesh(
                new THREE.PlaneGeometry(4.94, 3.20),
                new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(dustWinC), transparent: true, opacity: 0.78, depthWrite: false, side: THREE.DoubleSide })
            );
            windowDustPane.position.set(5.02, 1.69, 1.1); windowDustPane.rotation.y = -Math.PI / 2;
            roomTier1Group.add(windowDustPane);

            // Store vénitien gris usé à 12 lamelles couvrant la moitié haute de la baie vitrée
            const venetianGroup = new THREE.Group();
            const slatMat = new THREE.MeshStandardMaterial({ color: '#8f8c85', roughness: 0.65, metalness: 0.25 });
            for (let sl = 0; sl < 12; sl++) {
                const slat = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.014, 4.94), slatMat);
                slat.position.set(4.88, 3.16 - sl * 0.115, 1.1);
                slat.rotation.z = 0.22 + (sl === 11 ? 0.08 : 0);
                slat.rotation.x = sl === 11 ? 0.015 : 0; // Dernière lamelle légèrement de travers!
                slat.castShadow = false;
                venetianGroup.add(slat);
            }
            [-0.4, 2.6].forEach(cz => {
                const stringCord = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.004, 1.45, 5), tapeMat);
                stringCord.position.set(4.88, 2.52, cz);
                venetianGroup.add(stringCord);
            });
            roomTier1Group.add(venetianGroup);

            // 0B. SETUP BUREAU ÉVOLUTIF TIER 1 (Petites enceintes PC basiques, vieux moniteur épais, micro trépied plastique, casque posé, dongle USB, gobelet carton, vieux tel)
            const deskTier1Group = new THREE.Group();
            deskTier1Group.visible = false;

            // Dos épais de vieux moniteur (entoure pcFrame réduit en Tier 1)
            const oldMonitorBack = new THREE.Mesh(new THREE.BoxGeometry(1.12, 0.78, 0.16), new THREE.MeshStandardMaterial({ color: '#3b3e45', roughness: 0.75 }));
            oldMonitorBack.position.set(0, 1.25, -0.64); oldMonitorBack.castShadow = true; oldMonitorBack.name = 'pc_mesh';
            deskTier1Group.add(oldMonitorBack);

            // 2 Petites enceintes PC multimédia basiques (interactives speaker_mesh)
            const cheapSpkMat = new THREE.MeshStandardMaterial({ color: '#2b2d34', roughness: 0.72 });
            const cheapGrillMat = new THREE.MeshStandardMaterial({ color: '#17181d', roughness: 0.92 });
            [-1.32, 1.32].forEach((sx, si) => {
                const sg = new THREE.Group();
                sg.position.set(sx, 0.89, -0.32); sg.rotation.y = si === 0 ? 0.24 : -0.24;
                const sb = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.30, 0.22), cheapSpkMat);
                sb.castShadow = true; sg.add(sb);
                const sgr = new THREE.Mesh(new THREE.BoxGeometry(0.20, 0.22, 0.015), cheapGrillMat);
                sgr.position.set(0, 0.02, 0.11); sg.add(sgr);
                if (si === 1) {
                    const pLed = new THREE.Mesh(new THREE.BoxGeometry(0.016, 0.016, 0.01), new THREE.MeshBasicMaterial({ color: '#22c55e' }));
                    pLed.position.set(0.06, -0.11, 0.112); sg.add(pLed);
                }
                tagInteractable(sg, 'speaker_mesh');
                deskTier1Group.add(sg);
            });

            // Petit micro PC sur trépied de table basique (interactif desk_mic_mesh!)
            const micT1 = new THREE.Group();
            micT1.position.set(-1.55, 0.75, 0.15); micT1.rotation.y = 0.4;
            const m1Base = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.095, 0.02, 14), cheapSpkMat);
            m1Base.position.y = 0.01; micT1.add(m1Base);
            const m1Stem = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.012, 0.22, 8), cheapSpkMat);
            m1Stem.position.set(0, 0.12, 0); m1Stem.rotation.x = 0.25; micT1.add(m1Stem);
            const m1Head = new THREE.Mesh(new THREE.SphereGeometry(0.036, 12, 10), cheapGrillMat);
            m1Head.position.set(0, 0.23, 0.04); micT1.add(m1Head);
            tagInteractable(micT1, 'desk_mic_mesh');
            deskTier1Group.add(micT1);

            // Vieux casque filaire posé à plat sur le bureau (interactif desk_headphones_mesh!)
            const hpT1 = new THREE.Group();
            hpT1.position.set(1.48, 0.785, 0.26); hpT1.rotation.set(Math.PI / 2, 0, -0.55);
            const h1Band = new THREE.Mesh(new THREE.TorusGeometry(0.145, 0.018, 10, 22, Math.PI), cheapSpkMat);
            hpT1.add(h1Band);
            [-0.14, 0.14].forEach(hx => {
                const c = new THREE.Mesh(new THREE.CylinderGeometry(0.058, 0.058, 0.036, 16), cheapGrillMat);
                c.rotation.z = Math.PI / 2; c.position.set(hx, -0.02, 0); hpT1.add(c);
            });
            tagInteractable(hpT1, 'desk_headphones_mesh');
            deskTier1Group.add(hpT1);

            // Petit boîtier audio USB basique 1-bouton (interactif desk_interface_mesh!)
            const ifaceT1 = new THREE.Group();
            ifaceT1.position.set(-0.98, 0.77, 0.05); ifaceT1.rotation.y = 0.12;
            const i1Box = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.045, 0.16), cheapSpkMat);
            i1Box.castShadow = true; ifaceT1.add(i1Box);
            const i1Knob = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.025, 14), oldMetalMat);
            i1Knob.position.set(0.06, 0.03, 0); ifaceT1.add(i1Knob);
            const i1Led = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.01, 0.01), new THREE.MeshBasicMaterial({ color: '#22c55e' }));
            i1Led.position.set(-0.06, 0.025, 0.06); ifaceT1.add(i1Led);
            tagInteractable(ifaceT1, 'desk_interface_mesh');
            deskTier1Group.add(ifaceT1);

            // Gobelet carton à emporter avec couvercle plastique (interactif desk_mug_mesh!)
            const cupT1 = new THREE.Group();
            cupT1.position.set(-1.55, 0.83, 0.48);
            const c1Body = new THREE.Mesh(new THREE.CylinderGeometry(0.062, 0.046, 0.155, 18), new THREE.MeshStandardMaterial({ color: '#c4a482', roughness: 0.9 }));
            c1Body.castShadow = true; cupT1.add(c1Body);
            const c1Sleeve = new THREE.Mesh(new THREE.CylinderGeometry(0.059, 0.052, 0.06, 18), new THREE.MeshStandardMaterial({ color: '#7a5c42', roughness: 0.95 }));
            cupT1.add(c1Sleeve);
            const c1Lid = new THREE.Mesh(new THREE.CylinderGeometry(0.066, 0.065, 0.022, 18), new THREE.MeshStandardMaterial({ color: '#eceae4', roughness: 0.5 }));
            c1Lid.position.y = 0.082; cupT1.add(c1Lid);
            tagInteractable(cupT1, 'desk_mug_mesh');
            deskTier1Group.add(cupT1);

            // Vieux smartphone épais usé (interactif desk_phone_mesh!)
            const phoneT1 = new THREE.Group();
            phoneT1.position.set(0.92, 0.768, 0.62); phoneT1.rotation.y = -0.45;
            const p1Body = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.022, 0.25), cheapSpkMat);
            p1Body.castShadow = true; phoneT1.add(p1Body);
            const p1Scr = new THREE.Mesh(new THREE.PlaneGeometry(0.11, 0.19), phoneScreenMat);
            p1Scr.rotation.x = -Math.PI / 2; p1Scr.position.set(0, 0.012, 0); phoneT1.add(p1Scr);
            tagInteractable(phoneT1, 'desk_phone_mesh');
            deskTier1Group.add(phoneT1);

            deskGroup.add(deskTier1Group);

            // 1. Plafond Tier 1 : Vieille réglette néon industrielle suspendue (micro-flicker!) + ampoule nue près du lit
            const t1NeonGroup = new THREE.Group();
            t1NeonGroup.position.set(-0.6, 3.64, -1.1);
            const neonHousing = new THREE.Mesh(new THREE.BoxGeometry(1.65, 0.065, 0.14), oldMetalMat);
            t1NeonGroup.add(neonHousing);
            const t1NeonMat = new THREE.MeshStandardMaterial({
                color: '#dff2ff', emissive: '#bfe4ff', emissiveIntensity: 1.55, roughness: 0.25
            });
            window.tier1NeonMat = t1NeonMat;
            const neonTube = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 1.52, 12), t1NeonMat);
            neonTube.rotation.z = Math.PI / 2; neonTube.position.y = -0.045;
            t1NeonGroup.add(neonTube);
            [-0.65, 0.65].forEach(nx => {
                const chain = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.38, 6), oldMetalMat);
                chain.position.set(nx, 0.19, 0); t1NeonGroup.add(chain);
            });
            roomTier1Group.add(t1NeonGroup);

            // Ampoule nue sur fil noir pendant près du coin lit
            const bareCord = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.72, 6), new THREE.MeshStandardMaterial({ color: '#141518', roughness: 0.9 }));
            bareCord.position.set(2.35, 3.64, -2.5);
            const bareSocket = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.024, 0.06, 10), oldMetalMat);
            bareSocket.position.set(2.35, 3.27, -2.5);
            const bareBulb = new THREE.Mesh(new THREE.SphereGeometry(0.045, 12, 10), new THREE.MeshStandardMaterial({ color: '#fff3c4', emissive: '#ffbf66', emissiveIntensity: 1.4, roughness: 0.2 }));
            bareBulb.position.set(2.35, 3.21, -2.5);
            roomTier1Group.add(bareCord, bareSocket, bareBulb);

            // 2. Lit Galère Tier 1 (Matelas fatigué posé sur palettes en bois brut au sol!) dans bedGroup
            const bedTier1Group = new THREE.Group();
            bedTier1Group.visible = false;
            const tagBed1 = (m) => { m.name = 'bed_mesh'; m.castShadow = true; m.receiveShadow = true; return m; };
            // 2 palettes bois brut posées au sol (y = -0.20 dans bedGroup = sol)
            [-0.95, 0.95].forEach(pz => {
                for (let s = 0; s < 5; s++) {
                    const plank = tagBed1(new THREE.Mesh(new THREE.BoxGeometry(2.36, 0.032, 0.24), rawPalletMat));
                    plank.position.set(0, -0.075, pz - 0.72 + s * 0.36);
                    bedTier1Group.add(plank);
                }
                [-1.05, 0, 1.05].forEach(bx => {
                    const block = tagBed1(new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.11, 1.78), rawPalletMat));
                    block.position.set(bx, -0.145, pz);
                    bedTier1Group.add(block);
                });
            });
            // Vieux matelas légèrement affaissé & froissé
            const t1MatGeo = new THREE.BoxGeometry(2.16, 0.24, 3.74, 16, 3, 20);
            const t1MPos = t1MatGeo.attributes.position;
            for (let i = 0; i < t1MPos.count; i++) {
                const vx = t1MPos.getX(i), vy = t1MPos.getY(i), vz = t1MPos.getZ(i);
                if (vy > 0) {
                    const sag = Math.exp(-(vx * vx * 0.6 + vz * vz * 0.25)) * -0.045;
                    t1MPos.setY(i, vy + sag + Math.sin(vx * 3.5 + vz * 2.2) * 0.012);
                }
            }
            t1MatGeo.computeVertexNormals();
            const t1Mattress = tagBed1(new THREE.Mesh(t1MatGeo, new THREE.MeshStandardMaterial({ map: curtainTex.map, color: '#9e978b', roughness: 0.95 })));
            t1Mattress.position.set(0, 0.06, 0.05);
            t1Mattress.raycast = () => {};
            bedTier1Group.add(t1Mattress);
            // Vieille couverture froissée posée en travers
            const t1BlanketGeo = new THREE.BoxGeometry(2.20, 0.09, 2.42, 18, 2, 18);
            const t1BPos = t1BlanketGeo.attributes.position;
            for (let i = 0; i < t1BPos.count; i++) {
                const vx = t1BPos.getX(i), vy = t1BPos.getY(i), vz = t1BPos.getZ(i);
                t1BPos.setY(i, vy + Math.sin(vx * 3.2 - vz * 2.4) * 0.025 + Math.cos(vx * 5.0 + vz * 3.1) * 0.012);
            }
            t1BlanketGeo.computeVertexNormals();
            const t1Blanket = tagBed1(new THREE.Mesh(t1BlanketGeo, new THREE.MeshStandardMaterial({ map: curtainTex.map, color: '#39423a', roughness: 0.96 })));
            t1Blanket.position.set(-0.04, 0.20, 0.62); t1Blanket.rotation.y = 0.06;
            t1Blanket.raycast = () => {};
            bedTier1Group.add(t1Blanket);
            // 1 seul vieil oreiller un peu plat & fripé
            const t1PilGeo = new THREE.SphereGeometry(0.38, 16, 12); t1PilGeo.scale(1.25, 0.24, 0.72);
            const t1Pillow = tagBed1(new THREE.Mesh(t1PilGeo, new THREE.MeshStandardMaterial({ map: curtainTex.map, color: '#bfb7a8', roughness: 0.95 })));
            t1Pillow.position.set(-0.22, 0.25, -1.42); t1Pillow.rotation.set(0.18, 0.22, 0.04);
            t1Pillow.raycast = () => {};
            bedTier1Group.add(t1Pillow);
            bedGroup.add(bedTier1Group);

            // 3. Vieille chaise pliante métallique (Tier 1 — échelle adulte réaliste assortie au bureau)
            const chairTier1Group = new THREE.Group();
            chairTier1Group.position.set(-1.32, -1.0, -2.02);
            chairTier1Group.rotation.y = 0.62;
            const foldSeatMat = new THREE.MeshStandardMaterial({ color: '#2b2d33', roughness: 0.78 });
            const fSeat = new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.055, 0.72), foldSeatMat);
            fSeat.position.set(0, 0.72, 0); fSeat.castShadow = true; fSeat.receiveShadow = true; chairTier1Group.add(fSeat);
            const fBack = new THREE.Mesh(new THREE.BoxGeometry(0.76, 0.34, 0.055), foldSeatMat);
            fBack.position.set(0, 1.32, 0.34); fBack.rotation.x = 0.14; fBack.castShadow = true; chairTier1Group.add(fBack);
            [-0.35, 0.35].forEach(lx => {
                const postB = new THREE.Mesh(new THREE.CylinderGeometry(0.020, 0.020, 1.48, 8), oldMetalMat);
                postB.position.set(lx, 0.73, 0.16); postB.rotation.x = 0.20; postB.castShadow = true; chairTier1Group.add(postB);
                const postF = new THREE.Mesh(new THREE.CylinderGeometry(0.020, 0.020, 0.90, 8), oldMetalMat);
                postF.position.set(lx, 0.42, -0.10); postF.rotation.x = -0.34; postF.castShadow = true; chairTier1Group.add(postF);
            });
            const fCrossBar = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.70, 8), oldMetalMat);
            fCrossBar.rotation.z = Math.PI / 2; fCrossBar.position.set(0, 0.30, 0.16); chairTier1Group.add(fCrossBar);
            roomTier1Group.add(chairTier1Group);

            // 4. Vieille cagette brute vinyles (Tier 1) dans crateGroup
            const crateTier1Group = new THREE.Group();
            crateTier1Group.visible = false;
            const tagC1 = (m) => { m.name = 'achievements_board_mesh'; m.castShadow = true; m.receiveShadow = true; return m; };
            const t1CrateMat = new THREE.MeshStandardMaterial({ color: '#45484f', roughness: 0.88 });
            const c1Base = tagC1(new THREE.Mesh(new THREE.BoxGeometry(0.76, 0.04, 0.58), t1CrateMat));
            c1Base.position.y = 0.02; crateTier1Group.add(c1Base);
            [-0.36, 0.36].forEach(cx => {
                const s = tagC1(new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.38, 0.58), t1CrateMat));
                s.position.set(cx, 0.21, 0); crateTier1Group.add(s);
            });
            [-0.27, 0.27].forEach(cz => {
                const s = tagC1(new THREE.Mesh(new THREE.BoxGeometry(0.74, cz < 0 ? 0.38 : 0.26, 0.035), t1CrateMat));
                s.position.set(0, cz < 0 ? 0.21 : 0.15, cz); crateTier1Group.add(s);
            });
            for (let k = 0; k < 4; k++) {
                const oldLp = tagC1(new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.52, 0.014), new THREE.MeshStandardMaterial({ color: ['#5c493b', '#38444d', '#6e3b3b', '#4d4a38'][k], roughness: 0.85 })));
                oldLp.position.set((k - 1.5) * 0.03, 0.31, -0.18 + k * 0.055);
                oldLp.rotation.x = -0.22;
                crateTier1Group.add(oldLp);
            }
            crateGroup.add(crateTier1Group);

            // 5. Cartons de déménagement empilés + Boîte à pizza + Canettes + Posters scotchés + Tag + Caisse chevet + Vieux radiateur + Store
            function buildCardboardBox(w, h, d, x, y, z, rotY, labelText) {
                const bg = new THREE.Group();
                bg.position.set(x, y, z); bg.rotation.y = rotY;
                const c = document.createElement('canvas'); c.width = 256; c.height = 128;
                const ctx = c.getContext('2d');
                ctx.fillStyle = '#9e7d57'; ctx.fillRect(0, 0, 256, 128);
                ctx.fillStyle = 'rgba(40,26,14,0.12)';
                for (let i = 0; i < 600; i++) ctx.fillRect(Math.random() * 256, Math.random() * 128, 3, 2);
                ctx.fillStyle = '#241b12'; ctx.font = 'bold 26px monospace'; ctx.textAlign = 'center';
                ctx.fillText(labelText, 128, 72);
                const lblMat = new THREE.MeshStandardMaterial({ map: configureTex(c, 1, 1, true), roughness: 0.92 });
                const box = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), [kraftMat, kraftMat, kraftMat, kraftMat, lblMat, kraftMat]);
                box.castShadow = true; box.receiveShadow = true; bg.add(box);
                const tape = new THREE.Mesh(new THREE.BoxGeometry(w + 0.01, 0.01, 0.07), tapeMat);
                tape.position.y = h / 2 + 0.002; bg.add(tape);
                roomTier1Group.add(bg);
            }
            buildCardboardBox(0.58, 0.46, 0.50,  0.42, -0.77, -4.28,  0.12, 'CÂBLES');
            buildCardboardBox(0.46, 0.36, 0.42,  0.44, -0.36, -4.24, -0.18, 'SAMPLES');
            buildCardboardBox(0.70, 0.50, 0.58,  2.10, -0.75,  3.85, -0.35, 'FRAGILE');

            // Boîte à pizza entrouverte sur le sol près du bureau + 3 canettes energy drink
            const pizzaBox = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.048, 0.46), new THREE.MeshStandardMaterial({ color: '#d8cbb8', roughness: 0.9 }));
            pizzaBox.position.set(0.35, -0.975, -2.55); pizzaBox.rotation.y = 0.42; pizzaBox.castShadow = true;
            const pizzaLid = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.01, 0.46), new THREE.MeshStandardMaterial({ color: '#c8b8a2', roughness: 0.9 }));
            pizzaLid.position.set(0.35, -0.935, -2.58); pizzaLid.rotation.set(-0.22, 0.42, 0.06);
            roomTier1Group.add(pizzaBox, pizzaLid);

            [
                { x: 0.12, y: -0.935, z: -2.28, col: '#16a34a', fallen: false },
                { x: 0.24, y: -0.975, z: -2.18, col: '#dc2626', fallen: true },
                { x: -0.82, y: -0.935, z: -2.92, col: '#2563eb', fallen: false }
            ].forEach(can => {
                const cm = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.032, 0.125, 12), new THREE.MeshStandardMaterial({ color: can.col, roughness: 0.3, metalness: 0.65 }));
                cm.position.set(can.x, can.y, can.z);
                if (can.fallen) { cm.rotation.z = Math.PI / 2; cm.rotation.y = 0.7; }
                cm.castShadow = true; roomTier1Group.add(cm);
            });

            // 3 Posters / Flyers Underground scotchés légèrement de travers sur les murs
            function buildWallPoster(x, y, z, ry, rz, title, sub, bgHex, accentHex) {
                const pg = new THREE.Group(); pg.position.set(x, y, z); pg.rotation.set(0, ry, rz);
                const c = document.createElement('canvas'); c.width = 256; c.height = 340;
                const ctx = c.getContext('2d');
                ctx.fillStyle = bgHex; ctx.fillRect(0, 0, 256, 340);
                ctx.fillStyle = accentHex; ctx.fillRect(16, 18, 224, 160);
                ctx.fillStyle = '#0e0f14'; ctx.beginPath(); ctx.arc(128, 98, 54, 0, Math.PI * 2); ctx.fill();
                ctx.fillStyle = bgHex; ctx.beginPath(); ctx.arc(128, 98, 16, 0, Math.PI * 2); ctx.fill();
                ctx.fillStyle = '#f5f2eb'; ctx.font = 'bold 28px monospace'; ctx.textAlign = 'center';
                ctx.fillText(title, 128, 232);
                ctx.fillStyle = 'rgba(245,242,235,0.65)'; ctx.font = '16px monospace';
                ctx.fillText(sub, 128, 272);
                const poster = new THREE.Mesh(new THREE.PlaneGeometry(0.68, 0.90), new THREE.MeshStandardMaterial({ map: configureTex(c, 1, 1, true), roughness: 0.85 }));
                pg.add(poster);
                // 2 morceaux de scotch gris en haut
                [-0.28, 0.28].forEach((tx, ti) => {
                    const tp = new THREE.Mesh(new THREE.PlaneGeometry(0.14, 0.045), tapeMat);
                    tp.position.set(tx, 0.43, 0.004); tp.rotation.z = ti === 0 ? 0.55 : -0.55;
                    pg.add(tp);
                });
                roomTier1Group.add(pg);
            }
            buildWallPoster(1.25, 2.30, -4.97, 0, -0.07, 'RAW BEATS', 'PARIS UNDERGROUND 93', '#1c1917', '#b91c1c');
            buildWallPoster(2.12, 2.02, -4.97, 0,  0.09, 'MPC TAPE', 'SIDE A · 92 BPM', '#18181b', '#d97706');
            buildWallPoster(-4.97, 2.05, -0.85, Math.PI / 2, 0.06, 'OPEN MIC', 'FREESTYLE NIGHT', '#172554', '#eab308');

            // Vieille caisse retournée en table de chevet de fortune + vieille lampe cabossée
            const t1Nightstand = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.48, 0.46), rawPalletMat);
            t1Nightstand.position.set(2.22, -0.76, -4.55); t1Nightstand.castShadow = true;
            const t1LampBase = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.10, 0.04, 10), oldMetalMat);
            t1LampBase.position.set(2.22, -0.50, -4.55);
            const t1LampStem = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.26, 8), oldMetalMat);
            t1LampStem.position.set(2.22, -0.36, -4.55); t1LampStem.rotation.z = 0.12;
            const t1LampShade = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.14, 12, 1, true), oldMetalMat);
            t1LampShade.position.set(2.25, -0.24, -4.55); t1LampShade.rotation.z = -0.35;
            roomTier1Group.add(t1Nightstand, t1LampBase, t1LampStem, t1LampShade);

            // Vieux radiateur en fonte gris usé sous la fenêtre + vieux store vénitien légèrement de travers
            const oldRad = new THREE.Group();
            oldRad.position.set(4.80, -0.52, 2.05);
            for (let ri = 0; ri < 9; ri++) {
                const fin = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.58, 0.09), rustyCastIronMat);
                fin.position.set(0, 0, -0.72 + ri * 0.18); fin.castShadow = true; oldRad.add(fin);
            }
            roomTier1Group.add(oldRad);
            const blindBox = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.14, 5.02), new THREE.MeshStandardMaterial({ color: '#7a7872', roughness: 0.75 }));
            blindBox.position.set(4.88, 3.26, 1.1); blindBox.rotation.x = 0.018;
            roomTier1Group.add(blindBox);

            // Vieux sac de sport posé près de la porte (Tier 1)
            const duffel = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.62, 12), new THREE.MeshStandardMaterial({ color: '#292d34', roughness: 0.92 }));
            duffel.rotation.z = Math.PI / 2; duffel.rotation.y = 0.35; duffel.position.set(-4.15, -0.84, 3.62); duffel.castShadow = true;
            roomTier1Group.add(duffel);

            archGroup.add(roomTier1Group);

            // C. GROUPE TIER 2 : HOME-STUDIO RÉNOVÉ (25–54% Mastery ou Rang 2)
            const roomTier2Group = new THREE.Group();
            roomTier2Group.visible = false;

            // 1. Plafond Tier 2 : Plafonnier moderne sobre + 1er panneau acoustique simple au-dessus du bureau
            const t2FixtureRim = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.34, 0.06, 24), aluFrameMat);
            t2FixtureRim.position.set(1.05, 3.96, -0.55);
            const t2FixtureMat = new THREE.MeshStandardMaterial({ color: '#fff9ed', emissive: '#ffeed2', emissiveIntensity: 1.75, roughness: 0.25 });
            window.tier2FixtureMat = t2FixtureMat;
            const t2FixtureDisc = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.03, 24), t2FixtureMat);
            t2FixtureDisc.position.set(1.05, 3.935, -0.55);
            const t2Cloud = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.08, 1.4), new THREE.MeshStandardMaterial({ color: '#2b2e37', roughness: 0.92 }));
            t2Cloud.position.set(-2.15, 3.76, -2.65); t2Cloud.castShadow = false;
            [-1.05, 1.05].forEach(wx => [-0.55, 0.55].forEach(wz => {
                const wire = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.005, 0.24, 6), cableMat);
                wire.position.set(-2.15 + wx, 3.88, -2.65 + wz); roomTier2Group.add(wire);
            }));
            roomTier2Group.add(t2FixtureRim, t2FixtureDisc, t2Cloud);

            // 2. Chaise de bureau noire simple (Tier 2 — échelle adulte réaliste assortie au bureau, sans appui-tête ni chromes)
            const chairTier2Group = new THREE.Group();
            chairTier2Group.position.set(-1.28, -1.0, -2.02); chairTier2Group.rotation.y = 0.55;
            const t2ChairMat = new THREE.MeshStandardMaterial({ color: '#20232b', roughness: 0.72 });
            const t2Stem = new THREE.Mesh(new THREE.CylinderGeometry(0.042, 0.046, 0.62, 12), aluFrameMat);
            t2Stem.position.y = 0.38; t2Stem.castShadow = true; chairTier2Group.add(t2Stem);
            for (let b = 0; b < 5; b++) {
                const a = (b / 5) * Math.PI * 2;
                const leg = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.045, 0.44), aluFrameMat);
                leg.position.set(Math.sin(a) * 0.22, 0.095, Math.cos(a) * 0.22); leg.rotation.y = a; leg.castShadow = true; chairTier2Group.add(leg);
                const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.036, 0.036, 0.04, 12), t2ChairMat);
                wheel.rotation.z = Math.PI / 2; wheel.rotation.y = a;
                wheel.position.set(Math.sin(a) * 0.42, 0.036, Math.cos(a) * 0.42); chairTier2Group.add(wheel);
            }
            const t2Seat = new THREE.Mesh(new THREE.BoxGeometry(0.84, 0.11, 0.76), t2ChairMat);
            t2Seat.position.set(0, 0.72, 0); t2Seat.castShadow = true; t2Seat.receiveShadow = true; chairTier2Group.add(t2Seat);
            const t2Spine = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.46, 0.05), aluFrameMat);
            t2Spine.position.set(0, 0.90, 0.37); t2Spine.rotation.x = 0.08; chairTier2Group.add(t2Spine);
            const t2Back = new THREE.Mesh(new THREE.BoxGeometry(0.76, 0.72, 0.09), t2ChairMat);
            t2Back.position.set(0, 1.24, 0.37); t2Back.rotation.x = 0.08; t2Back.castShadow = true; chairTier2Group.add(t2Back);
            roomTier2Group.add(chairTier2Group);

            // 3. Cadre de lit minimaliste simple (Tier 2) dans bedGroup (associé au matelas/couette/2 oreillers propres de bedTier2PlusGroup)
            const bedTier2FrameGroup = new THREE.Group();
            bedTier2FrameGroup.visible = false;
            const t2BedFrameMat = new THREE.MeshStandardMaterial({ color: '#262830', roughness: 0.7 });
            const t2BedBase = new THREE.Mesh(new THREE.BoxGeometry(2.38, 0.24, 4.10), t2BedFrameMat);
            t2BedBase.position.set(0, 0.08, 0); t2BedBase.castShadow = true; t2BedBase.receiveShadow = true; t2BedBase.name = 'bed_mesh';
            bedTier2FrameGroup.add(t2BedBase);
            bedGroup.add(bedTier2FrameGroup);

            // 4. Bac vinyle bois simple au sol (Tier 2) dans crateGroup
            const crateTier2Group = new THREE.Group();
            crateTier2Group.visible = false;
            const tagC2 = (m) => { m.name = 'achievements_board_mesh'; m.castShadow = true; m.receiveShadow = true; return m; };
            const t2WoodMat = new THREE.MeshStandardMaterial({ map: walnutTex.map, color: '#9c7856', roughness: 0.58 });
            const c2Base = tagC2(new THREE.Mesh(new THREE.BoxGeometry(0.84, 0.05, 0.62), t2WoodMat));
            c2Base.position.y = 0.025; crateTier2Group.add(c2Base);
            [-0.40, 0.40].forEach(cx => {
                const s = tagC2(new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.44, 0.62), t2WoodMat));
                s.position.set(cx, 0.24, 0); crateTier2Group.add(s);
            });
            const c2Back = tagC2(new THREE.Mesh(new THREE.BoxGeometry(0.80, 0.44, 0.04), t2WoodMat));
            c2Back.position.set(0, 0.24, -0.29); crateTier2Group.add(c2Back);
            const c2Front = tagC2(new THREE.Mesh(new THREE.BoxGeometry(0.80, 0.22, 0.04), t2WoodMat));
            c2Front.position.set(0, 0.13, 0.29); crateTier2Group.add(c2Front);
            for (let k = 0; k < 7; k++) {
                const tex = (typeof window.createVinylCoverTexture === 'function') ? window.createVinylCoverTexture('tier2_lp_' + k, 256) : null;
                const lp = tagC2(new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.55, 0.014), new THREE.MeshStandardMaterial({ map: tex || null, color: tex ? '#ffffff' : '#64748b', roughness: 0.5 })));
                lp.position.set(((k * 19) % 7 - 3) * 0.012, 0.34, -0.21 + k * 0.045);
                lp.rotation.x = -0.18;
                crateTier2Group.add(lp);
            }
            crateGroup.add(crateTier2Group);

            // 1 seul carton propre rangé discrètement dans le coin (en cours d'installation Tier 2)
            const t2TidyBox = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.36, 0.44), new THREE.MeshStandardMaterial({ color: '#8f7458', roughness: 0.85 }));
            t2TidyBox.position.set(-4.42, -0.82, 4.32); t2TidyBox.rotation.y = 0.08; t2TidyBox.castShadow = true;
            roomTier2Group.add(t2TidyBox);

            // 5. Mur de souvenirs Tier 2 : 2 belles affiches encadrées sous verre en cadre noir mat (galerie indé propre!)
            function buildFramedWallArt(x, y, z, ry, title, sub, accentHex) {
                const fg = new THREE.Group(); fg.position.set(x, y, z); fg.rotation.y = ry;
                const fFrame = new THREE.Mesh(new THREE.BoxGeometry(0.76, 0.98, 0.035), aluFrameMat);
                fFrame.castShadow = false; fg.add(fFrame);
                const c = document.createElement('canvas'); c.width = 256; c.height = 340;
                const ctx = c.getContext('2d');
                ctx.fillStyle = '#f4f0e8'; ctx.fillRect(0, 0, 256, 340);
                ctx.fillStyle = '#181a20'; ctx.fillRect(24, 24, 208, 224);
                ctx.fillStyle = accentHex; ctx.beginPath(); ctx.arc(128, 136, 68, 0, Math.PI * 2); ctx.fill();
                ctx.fillStyle = '#181a20'; ctx.beginPath(); ctx.arc(128, 136, 20, 0, Math.PI * 2); ctx.fill();
                ctx.fillStyle = '#181a20'; ctx.font = 'bold 20px Outfit, sans-serif'; ctx.textAlign = 'center';
                ctx.fillText(title, 128, 286);
                ctx.fillStyle = '#6b7280'; ctx.font = '13px monospace';
                ctx.fillText(sub, 128, 310);
                const art = new THREE.Mesh(new THREE.PlaneGeometry(0.68, 0.90), new THREE.MeshStandardMaterial({ map: configureTex(c, 1, 1, true), roughness: 0.22 }));
                art.position.z = 0.019; fg.add(art);
                roomTier2Group.add(fg);
            }
            buildFramedWallArt(1.42, 2.38, -4.96, 0, 'STUDIO SESSIONS', 'PARIS · VOL. II', '#d97706');
            buildFramedWallArt(-4.96, 2.12, -0.85, Math.PI / 2, 'ANALOG WAVES', 'LIMITED PRESSING', '#2563eb');

            // 6. Setup Bureau Tier 2 : Micro condensateur sur pied droit métallique + Casque studio posé proprement sur le bureau
            const deskTier2Group = new THREE.Group();
            deskTier2Group.visible = false;
            const micT2 = new THREE.Group();
            micT2.position.set(-1.62, 0.75, 0.20);
            const m2Base = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.10, 0.022, 18), aluFrameMat);
            m2Base.position.y = 0.011; m2Base.castShadow = true; micT2.add(m2Base);
            const m2Rod = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.014, 0.28, 12), ifaceSilverMat);
            m2Rod.position.y = 0.16; micT2.add(m2Rod);
            const m2Body = new THREE.Mesh(new THREE.CylinderGeometry(0.034, 0.032, 0.17, 16), new THREE.MeshStandardMaterial({ color: '#1b1d24', roughness: 0.35, metalness: 0.75 }));
            m2Body.position.y = 0.34; m2Body.castShadow = true; micT2.add(m2Body);
            const m2Grille = new THREE.Mesh(new THREE.CylinderGeometry(0.036, 0.034, 0.075, 16), new THREE.MeshStandardMaterial({ color: '#94a3b8', roughness: 0.35, metalness: 0.85 }));
            m2Grille.position.y = 0.44; micT2.add(m2Grille);
            tagInteractable(micT2, 'desk_mic_mesh');
            deskTier2Group.add(micT2);

            const hpT2 = new THREE.Group();
            hpT2.position.set(1.62, 0.79, 0.24); hpT2.rotation.set(Math.PI / 2, 0, -0.35);
            const h2Band = new THREE.Mesh(new THREE.TorusGeometry(0.15, 0.020, 12, 24, Math.PI), hpLeatherMat);
            hpT2.add(h2Band);
            [-0.145, 0.145].forEach(hx => {
                const c = new THREE.Mesh(new THREE.CylinderGeometry(0.068, 0.065, 0.04, 20), hpCupMat);
                c.rotation.z = Math.PI / 2; c.position.set(hx, -0.02, 0); c.castShadow = true; hpT2.add(c);
            });
            tagInteractable(hpT2, 'desk_headphones_mesh');
            deskTier2Group.add(hpT2);

            deskGroup.add(deskTier2Group);

            archGroup.add(roomTier2Group);

            // D. CONTRÔLEUR CENTRAL D'ÉVOLUTION DE LA CHAMBRE (TIERS 1 -> 2 -> 3)
            window._tier3FixtureMat = fixtureDiffuserMat;
            window.currentRoomVisualTier = 3;
            window.roomTierLightMult = 1.0;

            window.getTargetRoomTier = function(s) {
                const st = s || (typeof state !== 'undefined' ? state : null);
                if (!st) return 1;
                const money = Number(st.money) || 0;
                const rep = Number(st.rep) || 0;
                const followers = Number(st.followers) || 0;
                const tracks = Number(st.stats?.tracks) || 0;
                const moneyScore = Math.min(100, Math.log10(money + 1) * 25);
                const repScore = Math.min(100, (rep / 100) * 100);
                const follScore = Math.min(100, (followers / 50000) * 100);
                const trackScore = Math.min(100, (tracks / 10) * 100);
                const avgMastery = (moneyScore + repScore + follScore + trackScore) / 4;
                let rankId = 1;
                if (typeof getRankContext === 'function') {
                    const rc = getRankContext(st);
                    if (rc && rc.currentRank) rankId = rc.currentRank.id;
                }
                if (avgMastery >= 55 || rankId >= 3) return 3;
                if (avgMastery >= 25 || rankId >= 2) return 2;
                return 1;
            };

            function applyRoomTierImmediate(tier) {
                const t = Math.max(1, Math.min(3, parseInt(tier, 10) || 1));
                window.currentRoomVisualTier = t;

                // 1. Surfaces architecturales (Sol, Murs, Plafond, Plateau Bureau)
                if (t === 1) {
                    floorMat.map = wornFloorTex.map; floorMat.normalMap = wornFloorTex.normalMap; floorMat.normalScale.set(0.9, 0.9);
                    floorMat.roughnessMap = null; floorMat.color.set('#b8a894'); floorMat.roughness = 0.84; floorMat.envMapIntensity = 0.28;
                    wallMat.map = grungeWallTex.map; wallMat.normalMap = grungeWallTex.normalMap; wallMat.normalScale.set(0.75, 0.75);
                    wallMat.color.set('#b8b2a6'); wallMat.roughness = 0.96;
                    ceilingMat.map = grungeWallTex.map; ceilingMat.color.set('#8f8a80'); ceilingMat.emissive.set('#141311'); ceilingMat.emissiveIntensity = 0.25;
                    deskTopMat.map = grungeDeskTex.map; deskTopMat.normalMap = null; deskTopMat.color.set('#a89b8e'); deskTopMat.roughness = 0.78;
                    window.roomTierLightMult = 0.78;
                    window.ceilingFixtureMat = window.tier1NeonMat;
                } else if (t === 2) {
                    floorMat.map = oakTex.map; floorMat.normalMap = oakTex.normalMap; floorMat.normalScale.set(0.7, 0.7);
                    floorMat.roughnessMap = oakTex.roughnessMap; floorMat.color.set('#e2d2be'); floorMat.roughness = 0.58; floorMat.envMapIntensity = 0.50;
                    wallMat.map = cleanTier2WallTex.map; wallMat.normalMap = cleanTier2WallTex.normalMap; wallMat.normalScale.set(0.36, 0.36);
                    wallMat.color.set('#e6e2da'); wallMat.roughness = 0.90;
                    ceilingMat.map = ceilTex.map; ceilingMat.color.set('#ebe8e2'); ceilingMat.emissive.set('#22201d'); ceilingMat.emissiveIntensity = 0.34;
                    deskTopMat.map = walnutTex.map; deskTopMat.normalMap = walnutTex.normalMap; deskTopMat.normalScale.set(0.45, 0.45);
                    deskTopMat.color.set('#c4a486'); deskTopMat.roughness = 0.48;
                    window.roomTierLightMult = 0.93;
                    window.ceilingFixtureMat = window.tier2FixtureMat;
                } else {
                    floorMat.map = oakTex.map; floorMat.normalMap = oakTex.normalMap; floorMat.normalScale.set(0.85, 0.85);
                    floorMat.roughnessMap = oakTex.roughnessMap; floorMat.color.set('#ffffff'); floorMat.roughness = 0.42; floorMat.envMapIntensity = 0.72;
                    wallMat.map = wallTex.map; wallMat.normalMap = wallTex.normalMap; wallMat.normalScale.set(0.42, 0.42);
                    wallMat.color.set('#f5f1ea'); wallMat.roughness = 0.88;
                    ceilingMat.map = ceilTex.map; ceilingMat.color.set('#f8f6f2'); ceilingMat.emissive.set('#2c2b28'); ceilingMat.emissiveIntensity = 0.42;
                    deskTopMat.map = walnutTex.map; deskTopMat.normalMap = walnutTex.normalMap; deskTopMat.normalScale.set(0.65, 0.65);
                    deskTopMat.color.set('#dfb998'); deskTopMat.roughness = 0.34;
                    window.roomTierLightMult = 1.0;
                    window.ceilingFixtureMat = window._tier3FixtureMat;
                }
                floorMat.needsUpdate = true; wallMat.needsUpdate = true; ceilingMat.needsUpdate = true; deskTopMat.needsUpdate = true;

                // 2. Visibilité par paliers (Tier 1 / Tier 2 / Tier 3)
                roomTier1Group.visible = (t === 1);
                bedTier1Group.visible = (t === 1);
                crateTier1Group.visible = (t === 1);
                deskTier1Group.visible = (t === 1);

                roomTier2Group.visible = (t === 2);
                bedTier2FrameGroup.visible = (t === 2);
                crateTier2Group.visible = (t === 2);
                deskTier2Group.visible = (t === 2);

                // Montée en gamme du Setup Bureau (Écran, Enceintes, Interface, Micro, Casque, Lifestyle)
                if (typeof pcFrame !== 'undefined') {
                    if (t === 1) {
                        pcFrame.scale.set(0.76, 0.88, 1.8);
                        pcFrameMat.color.set('#3f424a'); pcFrameMat.roughness = 0.72; pcFrameMat.metalness = 0.15;
                    } else if (t === 2) {
                        pcFrame.scale.set(0.95, 0.96, 1.0);
                        pcFrameMat.color.set('#1c1f26'); pcFrameMat.roughness = 0.35; pcFrameMat.metalness = 0.55;
                    } else {
                        pcFrame.scale.set(1.06, 1.02, 1.0);
                        pcFrameMat.color.set('#14171d'); pcFrameMat.roughness = 0.22; pcFrameMat.metalness = 0.78;
                    }
                    pcFrameMat.needsUpdate = true;
                }
                if (typeof speakerL !== 'undefined') speakerL.visible = (t >= 2);
                if (typeof speakerR !== 'undefined') speakerR.visible = (t >= 2);
                isoPadsTier3Group.visible = (t >= 3);
                ifaceGroup.visible = (t >= 2);
                micBaseGroup.visible = (t >= 3);
                if (typeof micXlrCableGroup !== 'undefined') micXlrCableGroup.visible = (t >= 3);
                hpStandGroup.visible = (t >= 3);
                mugGroup.visible = (t >= 2);
                mugCoaster.visible = (t >= 3);
                phoneGroup.visible = (t >= 2);
                deskMatMesh.visible = (t >= 2);
                if (typeof kbdGlowStrip !== 'undefined') kbdGlowStrip.visible = (t >= 3);
                if (typeof escCap !== 'undefined') escCap.visible = (t >= 3);
                if (typeof entCap !== 'undefined') entCap.visible = (t >= 3);

                // Tier 2+ (masqué en Tier 1, visible en Tier 2 & 3)
                cornicesGroup.visible = (t >= 2);
                curtainsGroup.visible = (t >= 2);
                plantGroup.visible = (t >= 2);
                nsGroup.visible = (t >= 2);
                bedTier2PlusGroup.visible = (t >= 2);
                nbGroup.visible = (t >= 2);

                // Tier 3 uniquement (finition Architecte V4)
                acousticCloudsGroup.visible = (t >= 3);
                trackGroup.visible = (t >= 3);
                wallClockGroup.visible = (t >= 3);
                chairGroup.visible = (t >= 3);
                bedTier3OnlyGroup.visible = (t >= 3);
                radGroup.visible = (t >= 3);
                sneakersTier3Group.visible = (t >= 3);
                looseVinylsTier3Group.visible = (t >= 3);
                if (window._crateStandTier3) window._crateStandTier3.visible = (t >= 3);
                if (typeof vinylsContainer !== 'undefined') {
                    vinylsContainer.position.set(0, t === 3 ? 0.23 : 0.08, t === 3 ? 0.02 : -0.02);
                }
                // Force le rafraîchissement immédiat de l'écran PC 3D et des hologrammes Studio+ progressifs
                window._pcLiveLastTs = 0;
                if (typeof window.updateLivePcScreen === 'function') window.updateLivePcScreen(performance.now() * 0.001);
                if (window.activeStudioLocation === 'pro_studio') {
                    window.roomTierLightMult = 0.45;
                    window.currentRoomVisualTier = 3;
                    if (window.bedroomWorldGroups) {
                        window.bedroomWorldGroups.forEach(g => { if (g) g.visible = false; });
                    }
                    if (window.proStudioGroup) window.proStudioGroup.visible = true;
                } else if (typeof syncFurniture3DVisibility === 'function') {
                    try { syncFurniture3DVisibility(); } catch(e) {}
                }
            }

            window.applyRoomEvolutionTier = function(newTier, withTransition = false) {
                const target = Math.max(1, Math.min(3, parseInt(newTier, 10) || 1));
                if (!withTransition) {
                    applyRoomTierImmediate(target);
                    return;
                }
                if (window._roomEvoInProgress) return;
                window._roomEvoInProgress = true;

                const veil = document.getElementById('room-evolution-veil');
                const banner = document.getElementById('room-evolution-banner');
                const titleEl = document.getElementById('room-evo-title');
                const subEl = document.getElementById('room-evo-sub');

                const tierMeta = {
                    2: { title: 'NIVEAU 2 · HOME-STUDIO RÉNOVÉ', sub: 'Murs repeints, chambre rangée & premier traitement acoustique' },
                    3: { title: 'NIVEAU 3 · STUDIO ARCHITECTE CLEAN', sub: 'Finition pro complète — Prochain cap : Vrai Studio Pro à 80 % Mastery' }
                };
                if (titleEl && tierMeta[target]) titleEl.textContent = tierMeta[target].title;
                if (subEl && tierMeta[target]) subEl.textContent = tierMeta[target].sub;

                // Accord synthé ascendant chaleureux
                try {
                    [523.25, 659.25, 783.99, 987.77].forEach((freq, idx) => {
                        setTimeout(() => { if (typeof playTone === 'function') playTone(freq, 'triangle', 0.35, 0.045); }, idx * 95);
                    });
                } catch(e) {}

                if (veil) veil.classList.add('active');
                setTimeout(() => {
                    applyRoomTierImmediate(target);
                    if (veil) veil.classList.remove('active');
                    if (banner) banner.classList.add('visible');
                    setTimeout(() => {
                        if (banner) banner.classList.remove('visible');
                        window._roomEvoInProgress = false;
                    }, 4200);
                }, 380);
            };

            // Helper pratique pour tester / prévisualiser un palier instantanément
            window.setRoomTierPreview = function(t, animate = false) {
                window.applyRoomEvolutionTier(t, animate);
            };

            // Applique le Niveau 1 par défaut au démarrage avant détection de sauvegarde
            applyRoomTierImmediate(1);
        Object.assign(globalThis, { configureTex, wallTex, walnutTex, leatherTex, curtainTex, archGroup, exteriorGroup, tagInteractable, hpStandGroup, chairGroup, sconceGlowMat, bedsideShadeMat, bedsideLight });
        return { configureTex, wallTex, walnutTex, leatherTex, curtainTex, archGroup, exteriorGroup, tagInteractable, hpStandGroup, chairGroup };
    })();
}

// --- Global Bridge & ES Exports ---
Object.assign(globalThis, { initBedroomScene });
export { initBedroomScene };
