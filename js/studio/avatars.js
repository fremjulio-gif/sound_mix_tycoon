import { THREE } from '../core/libs.js';

    // ==========================================
    // CRÉATION DES AVATARS PAR PALIER DE ROOM (1 PERSO SIGNATURE PAR PALIER × 4 VARIANTES)
    // Niv.1 = Street_MC (model 2) → Niv.2 = Beatmaker (model 0) → Niv.3 = Cyber-DJ (model 1) → Niv.4 = Producer (model 3)
    // ==========================================
    const AVATAR_TIER_META = {
        1: { modelIdx: 2, charName: 'Street_MC', shortTab: 'Niv.1 Street', label: 'CHAMBRE GALÈRE · NIV.1', subtitle: 'Street_MC — Casquette, barbiche, chaîne au cou & pull maille uni' },
        2: { modelIdx: 0, charName: 'Beatmaker', shortTab: 'Niv.2 Beatmaker', label: 'HOME-STUDIO RÉNOVÉ · NIV.2', subtitle: 'Beatmaker — Casque audio, cheveux noirs mi-longs à frange, haut sans manches & manches claires' },
        3: { modelIdx: 1, charName: 'Cyber-DJ', shortTab: 'Niv.3 Cyber-DJ', label: 'STUDIO ARCHITECTE · NIV.3', subtitle: 'Cyber-DJ — Visor LED cyan & veste technique noire/cyan à sangles' },
        4: { modelIdx: 3, charName: 'Producer', shortTab: '42e Producer', label: 'STUDIO PRO 42E ÉTAGE · NIV.4', subtitle: 'Exec Producer — Lunettes de soleil, barbe, t-shirt graphique & montre' }
    };

    const MODEL_TO_TIER = { 2: 1, 0: 2, 1: 3, 3: 4 };

    window.getModelIndexForTier = function(tier) {
        const t = Math.max(1, Math.min(4, parseInt(tier, 10) || 1));
        return (AVATAR_TIER_META[t] && typeof AVATAR_TIER_META[t].modelIdx === 'number') ? AVATAR_TIER_META[t].modelIdx : 2;
    };

    // 4 paliers (1 perso dédié par palier) × 4 variantes d'habits/couleurs sur ce même modèle
    const AVATAR_TIER_VARIANTS = {
        // PALIER 1 : Street_MC (Homme, casquette/bonnet rouge, barbiche, chaîne au cou, pull uni)
        1: [
            { name: 'Underground Red', tag: 'Original', desc: 'Casquette rouge, pull maille forêt, barbiche & chaîne or.', torso: '#065f46', sleeves: '#065f46', pants: '#1f2937', shoes: '#f8fafc', accent: '#34d399', cap: '#dc2626', metal: '#fbbf24', bg: '#064e3b' },
            { name: 'Midnight Asphalt', tag: 'Dark Street', desc: 'Casquette noire mate, pull maille anthracite & chaîne argent.', torso: '#27272a', sleeves: '#232329', pants: '#111318', shoes: '#d4d4d8', accent: '#94a3b8', cap: '#141418', metal: '#e2e8f0', bg: '#14161c' },
            { name: 'Brooklyn Amber', tag: 'Vintage 90s', desc: 'Casquette ocre, pull maille bordeaux & chaîne or brossé.', torso: '#7f1d1d', sleeves: '#7f1d1d', pants: '#292524', shoes: '#fef3c7', accent: '#f59e0b', cap: '#d97706', metal: '#fbbf24', bg: '#26140c' },
            { name: 'Cobalt Freestyle', tag: 'Urban Blue', desc: 'Casquette marine, pull bleu cobalt & chaîne platine.', torso: '#1d4ed8', sleeves: '#1d4ed8', pants: '#0f172a', shoes: '#e0f2fe', accent: '#38bdf8', cap: '#1e3a8a', metal: '#cbd5e1', bg: '#0c1c36' }
        ],
        // PALIER 2 : Beatmaker (Femme, casque audio, cheveux noirs mi-longs avec frange, haut sans manches + manches claires)
        2: [
            { name: 'Indigo Session', tag: 'Original', desc: 'Haut sans manches indigo, manches claires perle & casque studio noir.', torso: '#3730a3', sleeves: '#e2e8f0', pants: '#1e1b4b', shoes: '#111111', accent: '#818cf8', hp: '#14161b', metal: '#fbbf24', bg: '#1e1b4b' },
            { name: 'Warm Vinyl', tag: 'Lo-Fi Chaud', desc: 'Haut sans manches terracotta, manches claires sable & casque laiton.', torso: '#9a3412', sleeves: '#efe4d4', pants: '#292524', shoes: '#451a03', accent: '#fb923c', hp: '#292524', metal: '#d4af37', bg: '#26140c' },
            { name: 'Emerald Tape', tag: 'Analogique', desc: 'Haut sans manches émeraude, manches claires menthe & casque chrome.', torso: '#047857', sleeves: '#d1fae5', pants: '#111827', shoes: '#111111', accent: '#34d399', hp: '#334155', metal: '#34d399', bg: '#08201a' },
            { name: 'Monochrome Clean', tag: 'Minimal', desc: 'Haut sans manches obsidienne, manches crème & casque blanc studio.', torso: '#18181b', sleeves: '#f5f2eb', pants: '#09090b', shoes: '#111111', accent: '#e2e8f0', hp: '#f8fafc', metal: '#e2e8f0', bg: '#16181f' }
        ],
        // PALIER 3 : Cyber-DJ (Personnage au visor cyan, veste technique noire/cyan avec sangles et LED)
        3: [
            { name: 'Cyan Pulse', tag: 'Original', desc: 'Veste technique noire/cyan, sangles tactiques & visor LED cyan.', torso: '#0c131d', sleeves: '#0b111a', techPanel: '#0e7490', pants: '#0a0f18', shoes: '#f8fafc', accent: '#00e5ff', glow: '#00e5ff', metal: '#38bdf8', bg: '#0b1526' },
            { name: 'Ultraviolet Synth', tag: 'Mike Dean', desc: 'Veste technique noire/violette, sangles & visor LED ultraviolet.', torso: '#100c1c', sleeves: '#0d0917', techPanel: '#4c1d95', pants: '#09090b', shoes: '#e9d5ff', accent: '#a855f7', glow: '#a855f7', metal: '#c084fc', bg: '#190f2e' },
            { name: 'Solar Amber', tag: 'Warm Cyber', desc: 'Veste technique noire/ambre, sangles & visor LED solaire.', torso: '#161412', sleeves: '#12100e', techPanel: '#92400e', pants: '#111318', shoes: '#fef3c7', accent: '#f59e0b', glow: '#f59e0b', metal: '#fbbf24', bg: '#211608' },
            { name: 'Matrix Emerald', tag: 'Acid Synth', desc: 'Veste technique noire/émeraude, sangles & visor laser vert.', torso: '#091410', sleeves: '#07100c', techPanel: '#065f46', pants: '#050807', shoes: '#d1fae5', accent: '#34d399', glow: '#34d399', metal: '#34d399', bg: '#061c14' }
        ],
        // PALIER 4 : Producer (Homme, lunettes de soleil, barbe, t-shirt graphique, montre)
        4: [
            { name: '42e Mogul Classic', tag: 'Original', desc: 'T-shirt graphique obsidienne & or, lunettes noires, barbe & montre or.', torso: '#18181b', sleeves: '#18181b', pants: '#121215', shirt: '#fbbf24', shoes: '#111111', accent: '#f59e0b', shades: '#090a0e', metal: '#fbbf24', bg: '#1c1917' },
            { name: 'Midnight Velvet', tag: 'Velours Nuit', desc: 'T-shirt graphique bleu nuit, lunettes fumées & montre chronographe.', torso: '#111c3d', sleeves: '#111c3d', pants: '#0f172a', shirt: '#38bdf8', shoes: '#111111', accent: '#38bdf8', shades: '#07090e', metal: '#fbbf24', bg: '#0b1429' },
            { name: 'Ivory Executive', tag: 'Blanc Platine', desc: 'T-shirt graphique blanc glacier, lunettes platine & montre acier.', torso: '#e2e8f0', sleeves: '#e2e8f0', pants: '#1e293b', shirt: '#0f172a', shoes: '#111111', accent: '#38bdf8', shades: '#0b0e14', metal: '#e2e8f0', bg: '#0f1d2e' },
            { name: 'Crimson Label Boss', tag: 'Prestige Or', desc: 'T-shirt graphique bordeaux profond, lunettes or & montre 24K.', torso: '#5c1118', sleeves: '#5c1118', pants: '#18181b', shirt: '#fb7185', shoes: '#111111', accent: '#fb7185', shades: '#0b0a0e', metal: '#fbbf24', bg: '#330b14' }
        ]
    };

    window.getAvatarVariantSpec = function(tier, variant) {
        const t = Math.max(1, Math.min(4, parseInt(tier, 10) || 1));
        const list = AVATAR_TIER_VARIANTS[t] || AVATAR_TIER_VARIANTS[1];
        const v = Math.max(0, Math.min(list.length - 1, parseInt(variant, 10) || 0));
        return list[v];
    };

    window.getActiveAvatarVariantSpec = function() {
        const st = (typeof state !== 'undefined' && state) ? state : null;
        const t = st ? (Number(st.avatarTier) || (st.studioUnlocked ? 4 : (Number(st.roomTier) || 1))) : 1;
        const v = st ? (Number(st.avatarVariant) || 0) : 0;
        return window.getAvatarVariantSpec(t, v);
    };

    // ==========================================
    // SYSTÈME PBR AAA : NORMAL MAPS TANGENTES (PORES, MAILLE, COTON, RIPSTOP),
    // SUBSURFACE SCATTERING (SSS), HAIR CARDS ANISOTROPES, IRIS FIBREUX & ENV MAP HDR
    // ==========================================
    function getAvatarPBRTextures() {
        if (window._avatarPBRTextures) return window._avatarPBRTextures;

        // Convertit une heightmap Float32Array (size x size) en vraie Normal Map RGB Tangent-Space
        const heightToNormalTexture = (hMap, size, strength, repX, repY) => {
            const c = document.createElement('canvas');
            c.width = size; c.height = size;
            const ctx = c.getContext('2d');
            const img = ctx.createImageData(size, size);
            const d = img.data;
            for (let y = 0; y < size; y++) {
                const ym = (y - 1 + size) % size;
                const yp = (y + 1) % size;
                for (let x = 0; x < size; x++) {
                    const xm = (x - 1 + size) % size;
                    const xp = (x + 1) % size;
                    const dx = (hMap[y * size + xp] - hMap[y * size + xm]) * strength;
                    const dy = (hMap[yp * size + x] - hMap[ym * size + x]) * strength;
                    const dz = 1.0;
                    const len = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1;
                    const idx = (y * size + x) * 4;
                    d[idx]     = Math.max(0, Math.min(255, Math.round(((-dx / len) * 0.5 + 0.5) * 255)));
                    d[idx + 1] = Math.max(0, Math.min(255, Math.round(((-dy / len) * 0.5 + 0.5) * 255)));
                    d[idx + 2] = Math.max(0, Math.min(255, Math.round(((dz / len) * 0.5 + 0.5) * 255)));
                    d[idx + 3] = 255;
                }
            }
            ctx.putImageData(img, 0, 0);
            const tex = new THREE.CanvasTexture(c);
            tex.wrapS = THREE.RepeatWrapping;
            tex.wrapT = THREE.RepeatWrapping;
            tex.repeat.set(repX, repY);
            return tex;
        };

        const S = 128;
        // 1. Pores cutanés (micro-pores organiques + micro-sillons)
        const skinH = new Float32Array(S * S);
        for (let y = 0; y < S; y++) {
            for (let x = 0; x < S; x++) {
                const cellX = Math.sin(x * 0.55) * Math.cos(y * 0.55);
                const pore = Math.pow(Math.max(0, Math.sin(x * 0.92 + Math.cos(y * 0.4)) * Math.sin(y * 0.92 + Math.sin(x * 0.4))), 3.0);
                const grain = (Math.sin(x * 12.9898 + y * 78.233) * 43758.5453) % 1;
                skinH[y * S + x] = 0.5 + cellX * 0.14 - pore * 0.35 + (grain - 0.5) * 0.12;
            }
        }
        const skinNormalMap = heightToNormalTexture(skinH, S, 2.2, 5, 5);

        // 2. Maille tricotée (Pull Avatar 1)
        const knitH = new Float32Array(S * S);
        for (let y = 0; y < S; y++) {
            for (let x = 0; x < S; x++) {
                const col = (x % 16) / 16; // 0..1
                const vShift = Math.abs(col - 0.5) * 2.0; // V-chevron
                const stitch = Math.sin(((y / 8) + vShift) * Math.PI * 2);
                const rib = Math.sin(col * Math.PI);
                knitH[y * S + x] = 0.5 + stitch * rib * 0.42;
            }
        }
        const knitNormalMap = heightToNormalTexture(knitH, S, 3.0, 12, 12);

        // 3. Coton Jersey fin (Haut & T-shirt Avatar 2 & 4)
        const cottonH = new Float32Array(S * S);
        for (let y = 0; y < S; y++) {
            for (let x = 0; x < S; x++) {
                const wx = Math.sin((x / 3.0) * Math.PI * 2);
                const wy = Math.cos((y / 3.0) * Math.PI * 2);
                const twill = Math.sin(((x + y) / 4.0) * Math.PI * 2);
                cottonH[y * S + x] = 0.5 + (wx * wy * 0.55 + twill * 0.45) * 0.32;
            }
        }
        const cottonNormalMap = heightToNormalTexture(cottonH, S, 2.4, 14, 14);

        // 4. Tissu Technique Ripstop Hexagonal (Veste Avatar 3)
        const techH = new Float32Array(S * S);
        for (let y = 0; y < S; y++) {
            for (let x = 0; x < S; x++) {
                const gx = (x % 12) < 2 ? 0.35 : 0.0;
                const gy = (y % 12) < 2 ? 0.35 : 0.0;
                const micro = Math.sin(x * 1.57) * Math.cos(y * 1.57) * 0.12;
                techH[y * S + x] = 0.4 + Math.max(gx, gy) + micro;
            }
        }
        const techNormalMap = heightToNormalTexture(techH, S, 2.8, 12, 12);

        // 5. Cuir grainé (Sangles, Casque, Bottes, Sneakers)
        const leatherH = new Float32Array(S * S);
        for (let y = 0; y < S; y++) {
            for (let x = 0; x < S; x++) {
                const p1 = Math.sin(x * 0.42 + Math.sin(y * 0.35) * 1.6);
                const p2 = Math.cos(y * 0.42 + Math.cos(x * 0.35) * 1.6);
                leatherH[y * S + x] = 0.5 + (p1 * p2) * 0.36;
            }
        }
        const leatherNormalMap = heightToNormalTexture(leatherH, S, 2.5, 6, 6);

        window._avatarPBRTextures = {
            skinNormalMap,
            knitNormalMap,
            cottonNormalMap,
            techNormalMap,
            leatherNormalMap
        };
        return window._avatarPBRTextures;
    }

    // Injection Shader Subsurface Scattering (Wrap Lighting + Dermis Red Scatter)
    function applySkinSSS(material, sssColorHex = '#d94832') {
        const sssCol = new THREE.Color(sssColorHex);
        material.onBeforeCompile = (shader) => {
            shader.uniforms.uSssColor = { value: sssCol };
            shader.fragmentShader = `uniform vec3 uSssColor;\n` + shader.fragmentShader;
            shader.fragmentShader = shader.fragmentShader.replace(
                '#include <dithering_fragment>',
                `
                // Subsurface Scattering Approximation (Wrap Translucent Rim & Midtone Blood Scatter)
                vec3 sssViewDir = normalize(vViewPosition);
                vec3 sssNormal = normalize(vNormal);
                float ndv = clamp(dot(sssNormal, sssViewDir), 0.0, 1.0);
                float sssRim = pow(1.0 - ndv, 2.4) * 0.16;
                float luma = dot(gl_FragColor.rgb, vec3(0.299, 0.587, 0.114));
                float midtoneMask = smoothstep(0.04, 0.38, luma) * (1.0 - smoothstep(0.45, 0.88, luma));
                gl_FragColor.rgb += uSssColor * (midtoneMask * 0.11 + sssRim * 0.14);
                #include <dithering_fragment>
                `
            );
        };
        material.customProgramCacheKey = () => 'avatar_skin_sss_v2_' + sssColorHex;
        return material;
    }

    // Texture d'Iris Photoréaliste 256×256 (Anneau limbique, Stroma fibreux radiaire, Collerette, Pupille)
    function createIrisTexture(irisHex) {
        if (!window._irisTexCache) window._irisTexCache = {};
        if (window._irisTexCache[irisHex]) return window._irisTexCache[irisHex];

        const c = document.createElement('canvas');
        c.width = 256; c.height = 256;
        const ctx = c.getContext('2d');
        const cx = 128, cy = 128, rMax = 124;

        const baseCol = new THREE.Color(irisHex);
        const darkCol = baseCol.clone().multiplyScalar(0.28);
        const brightCol = baseCol.clone().offsetHSL(0.02, 0.15, 0.20);

        // Fond radiaire profond et contrasté (évite tout effet d'œil pâle ou délavé)
        const bgGrad = ctx.createRadialGradient(cx, cy, 32, cx, cy, rMax);
        bgGrad.addColorStop(0.0, '#020203');
        bgGrad.addColorStop(0.42, '#050508');
        bgGrad.addColorStop(0.54, '#' + darkCol.getHexString());
        bgGrad.addColorStop(0.72, '#' + baseCol.getHexString());
        bgGrad.addColorStop(0.86, '#' + darkCol.getHexString());
        bgGrad.addColorStop(0.94, '#08090d'); // Anneau limbique sombre bien marqué
        bgGrad.addColorStop(1.0, '#040507');
        ctx.fillStyle = bgGrad;
        ctx.beginPath(); ctx.arc(cx, cy, rMax, 0, Math.PI * 2); ctx.fill();

        // 180 fibres radiaires subtiles du stroma de l'iris
        for (let i = 0; i < 180; i++) {
            const ang = (i / 180) * Math.PI * 2 + (Math.sin(i * 7.13) * 0.015);
            const rIn = 52 + (i % 5) * 2.5;
            const rOut = 104 + (i % 4) * 3;
            const isLight = (i % 3 === 0);
            ctx.strokeStyle = isLight
                ? '#' + brightCol.getHexString()
                : 'rgba(6, 8, 12, 0.35)';
            ctx.globalAlpha = isLight ? 0.32 : 0.40;
            ctx.lineWidth = isLight ? 1.5 : 1.2;
            ctx.beginPath();
            ctx.moveTo(cx + Math.cos(ang) * rIn, cy + Math.sin(ang) * rIn);
            ctx.lineTo(cx + Math.cos(ang + 0.03 * Math.sin(i)) * rOut, cy + Math.sin(ang + 0.03 * Math.sin(i)) * rOut);
            ctx.stroke();
        }
        ctx.globalAlpha = 1.0;

        // Pupille centrale noire profonde et bien lisible (rayon 52px / 124px)
        const pupGrad = ctx.createRadialGradient(cx, cy, 4, cx, cy, 54);
        pupGrad.addColorStop(0, '#000000');
        pupGrad.addColorStop(0.86, '#020204');
        pupGrad.addColorStop(1, 'rgba(4,4,6,0)');
        ctx.fillStyle = pupGrad;
        ctx.beginPath(); ctx.arc(cx, cy, 54, 0, Math.PI * 2); ctx.fill();

        const tex = new THREE.CanvasTexture(c);
        window._irisTexCache[irisHex] = tex;
        return tex;
    }

    // Cartes de Mèches (Hair Cards) Alpha-Testées 512×512 + Normal Map Anisotrope (Cœur dense + Pointes effilées)
    function getHairCardMaterial(baseHex, highlightHex, isBeard = false) {
        const key = `v3_${baseHex}_${highlightHex}_${isBeard ? 'b' : 'h'}`;
        if (!window._hairCardMatCache) window._hairCardMatCache = {};
        if (window._hairCardMatCache[key]) return window._hairCardMatCache[key];

        const W = 256, H = 256;
        const cCol = document.createElement('canvas'); cCol.width = W; cCol.height = H;
        const ctx = cCol.getContext('2d');

        const cAlpha = document.createElement('canvas'); cAlpha.width = W; cAlpha.height = H;
        const aCtx = cAlpha.getContext('2d');
        aCtx.fillStyle = '#000000'; aCtx.fillRect(0, 0, W, H);

        const cNorm = document.createElement('canvas'); cNorm.width = W; cNorm.height = H;
        const nCtx = cNorm.getContext('2d');
        nCtx.fillStyle = 'rgb(128,128,255)'; nCtx.fillRect(0, 0, W, H);

        const baseC = new THREE.Color(baseHex);
        const highC = new THREE.Color(highlightHex);
        const rootC = baseC.clone().multiplyScalar(0.35);

        // Sous-couche pigmentée profonde au cœur de la mèche (évite tout voile grisâtre)
        const coreGrad = ctx.createLinearGradient(0, 0, 0, H);
        coreGrad.addColorStop(0, '#' + rootC.getHexString());
        coreGrad.addColorStop(0.45, '#' + baseC.getHexString());
        coreGrad.addColorStop(1, '#' + rootC.getHexString());
        ctx.fillStyle = coreGrad;
        ctx.fillRect(0, 0, W, H);

        // Masque d'opacité progressif (plein au cœur, effilé en pointes fines)
        for (let y = 0; y < H; y += 2) {
            const v = y / H; // 0 racine -> 1 pointe
            const tipMask = v < 0.74 ? 1.0 : Math.max(0, 1.0 - (v - 0.74) / 0.26);
            for (let x = 0; x < W; x += 2) {
                const u = x / W;
                const sideMask = Math.pow(Math.sin(u * Math.PI), 0.75);
                const aVal = Math.round(Math.min(1.0, sideMask * 1.35) * Math.pow(tipMask, 0.85) * 245);
                if (aVal > 12) {
                    aCtx.fillStyle = `rgb(${aVal},${aVal},${aVal})`;
                    aCtx.fillRect(x, y, 2, 2);
                }
            }
        }

        const strandCount = isBeard ? 240 : 300;
        for (let i = 0; i < strandCount; i++) {
            const u = (i + 0.5) / strandCount;
            const edgeFade = Math.sin(u * Math.PI);
            if (edgeFade < 0.05) continue;

            const x0 = u * W + (Math.sin(i * 19.3) * 3.5);
            const tipLen = H * (0.80 + 0.19 * Math.pow(edgeFade, 0.45) * (0.88 + 0.12 * Math.sin(i * 7.7)));
            const waveAmp = (isBeard ? 1.8 : 3.2) * Math.sin(i * 3.7);
            const tMix = 0.18 + 0.82 * Math.pow(Math.sin(i * 11.1) * 0.5 + 0.5, 2.2);
            const sCol = baseC.clone().lerp(highC, tMix * 0.42);

            const gCol = ctx.createLinearGradient(x0, 0, x0, tipLen);
            gCol.addColorStop(0.0, '#' + rootC.getHexString());
            gCol.addColorStop(0.32, '#' + baseC.getHexString());
            gCol.addColorStop(0.54, '#' + sCol.getHexString());
            gCol.addColorStop(0.84, '#' + baseC.getHexString());
            gCol.addColorStop(1.0, '#' + rootC.getHexString());
            ctx.strokeStyle = gCol;
            ctx.lineWidth = isBeard ? 2.2 : 2.5;
            ctx.beginPath();
            ctx.moveTo(x0, 0);
            ctx.quadraticCurveTo(x0 + waveAmp, tipLen * 0.52, x0 + waveAmp * 0.4, tipLen);
            ctx.stroke();

            const gAlp = aCtx.createLinearGradient(x0, 0, x0, tipLen);
            gAlp.addColorStop(0.0, 'rgba(255,255,255,1)');
            gAlp.addColorStop(0.78, 'rgba(255,255,255,1)');
            gAlp.addColorStop(0.95, 'rgba(180,180,180,0.55)');
            gAlp.addColorStop(1.0, 'rgba(0,0,0,0)');
            aCtx.strokeStyle = gAlp;
            aCtx.lineWidth = isBeard ? 2.3 : 2.6;
            aCtx.beginPath();
            aCtx.moveTo(x0, 0);
            aCtx.quadraticCurveTo(x0 + waveAmp, tipLen * 0.52, x0 + waveAmp * 0.4, tipLen);
            aCtx.stroke();

            const nxR = Math.round(128 + Math.sin(i * 2.4) * 44);
            const nyG = Math.round(128 + Math.cos(i * 0.5) * 22);
            nCtx.strokeStyle = `rgb(${nxR},${nyG},248)`;
            nCtx.lineWidth = 2.0;
            nCtx.beginPath();
            nCtx.moveTo(x0, 0);
            nCtx.quadraticCurveTo(x0 + waveAmp, tipLen * 0.52, x0 + waveAmp * 0.4, tipLen);
            nCtx.stroke();
        }

        const map = new THREE.CanvasTexture(cCol);
        const alphaMap = new THREE.CanvasTexture(cAlpha);
        const normalMap = new THREE.CanvasTexture(cNorm);

        const mat = new THREE.MeshPhysicalMaterial({
            map: map,
            alphaMap: alphaMap,
            normalMap: normalMap,
            normalScale: new THREE.Vector2(0.55, 0.22),
            alphaTest: 0.34,
            transparent: false,
            side: THREE.DoubleSide,
            roughness: 0.56,
            metalness: 0.02,
            sheen: 0.55,
            sheenRoughness: 0.38,
            sheenColor: highC,
            clearcoat: 0.04,
            clearcoatRoughness: 0.55,
            envMapIntensity: 0.25
        });
        window._hairCardMatCache[key] = mat;
        return mat;
    }

    // Créateur de ruban 3D fortement bombé transversalement pour mèche de cheveux / barbe (Hair Card)
    function createCurvedHairCard(width, length, bendZ, archX = 0.012, twist = 0, taperTip = 0.22) {
        const geo = new THREE.PlaneGeometry(width, length, 6, 12);
        const pos = geo.attributes.position;
        for (let i = 0; i < pos.count; i++) {
            let x = pos.getX(i);
            let y = pos.getY(i); // +length/2 (racine) à -length/2 (pointe)
            const t = (length * 0.5 - y) / length; // 0 à la racine -> 1 à la pointe
            const nx = x / (width * 0.5 || 1); // -1..1

            // Effilage progressif en pointe fine (évite tout bord rectangulaire en bas de mèche)
            const rootPinch = 0.82 + 0.18 * Math.sin(Math.min(1, t * 3.5) * Math.PI * 0.5);
            const widthScale = rootPinch * (1.0 - (1.0 - taperTip) * Math.pow(t, 1.35));
            x *= widthScale;

            // Courbure longitudinale & fort bombé semi-cylindrique transversal (élimine l'aspect ruban plat!)
            const effArch = Math.max(archX, width * 0.26);
            const zCurve = bendZ * Math.pow(t, 1.55) + Math.sin(t * Math.PI) * (bendZ * 0.28);
            const zArch = -effArch * (nx * nx) * (1.0 - t * 0.5);

            // Légère torsion organique
            const ang = twist * t;
            const rx = x * Math.cos(ang) - (zCurve + zArch) * Math.sin(ang);
            const rz = x * Math.sin(ang) + (zCurve + zArch) * Math.cos(ang);

            // Décale l'origine (0,0,0) directement à la racine de la mèche
            pos.setXYZ(i, rx, -t * length, rz);
        }
        geo.computeVertexNormals();
        return geo;
    }

    // Créateur de mèche 3D volumétrique fuselée à sillons capillaires (pour frange, mèches mi-longues & barbe sculptée)
    function createVolumetricHairLock(radius, length, bendZ = 0.015, bendX = 0.0, flatZ = 0.58) {
        const geo = new THREE.CylinderGeometry(radius * 0.65, radius * 0.08, length, 14, 14, false);
        const pos = geo.attributes.position;
        for (let i = 0; i < pos.count; i++) {
            let x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
            const t = (length * 0.5 - y) / length; // 0 (racine) -> 1 (pointe)
            const swell = Math.sin(t * Math.PI * 0.88) * 1.22 + (1.0 - t) * 0.35;
            const ang = Math.atan2(x, z);
            const groove = 1.0 + Math.sin(ang * 7.0 + t * 4.0) * 0.08;
            x = x * swell * groove + bendX * Math.pow(t, 1.6);
            z = z * flatZ * swell * groove + bendZ * Math.pow(t, 1.55) + Math.sin(t * Math.PI) * (bendZ * 0.25);
            pos.setXYZ(i, x, -t * length, z);
        }
        geo.computeVertexNormals();
        return geo;
    }

    // Texture T-Shirt Graphique Haute Définition 512×512 pour l'Avatar 4 (Producer)
    function createGraphicTeeTexture(varSpec) {
        const key = `v2_${varSpec.torso}_${varSpec.accent}_${varSpec.metal}`;
        if (!window._graphicTeeTexCache) window._graphicTeeTexCache = {};
        if (window._graphicTeeTexCache[key]) return window._graphicTeeTexCache[key];

        const c = document.createElement('canvas');
        c.width = 512; c.height = 512;
        const ctx = c.getContext('2d');

        // Fond coton du T-shirt
        ctx.fillStyle = varSpec.torso || '#18181b';
        ctx.fillRect(0, 0, 512, 512);

        // Avec thetaStart = Math.PI sur le cylindre du torse, u = 0.5 (x = 256) est pile au centre de la poitrine (+Z) !
        const gx = 256, gy = 210;
        const acc = varSpec.accent || '#f59e0b';
        const met = varSpec.metal || '#fbbf24';
        const isLightTee = (varSpec.torso === '#e2e8f0' || varSpec.torso === '#f1f5f9');
        const inkPrimary = isLightTee ? '#0f172a' : '#f8fafc';

        ctx.save();
        // Cadre géométrique sérigraphié sur la poitrine
        ctx.strokeStyle = met;
        ctx.lineWidth = 3.5;
        ctx.strokeRect(gx - 64, gy - 72, 128, 144);

        ctx.fillStyle = isLightTee ? 'rgba(15,23,42,0.10)' : 'rgba(255,255,255,0.06)';
        ctx.fillRect(gx - 60, gy - 68, 120, 136);

        // Disque vinyle / soleil géométrique au centre
        const radG = ctx.createRadialGradient(gx, gy - 10, 6, gx, gy - 10, 44);
        radG.addColorStop(0, acc);
        radG.addColorStop(0.42, met);
        radG.addColorStop(0.46, inkPrimary);
        radG.addColorStop(0.86, '#111318');
        radG.addColorStop(1, met);
        ctx.fillStyle = radG;
        ctx.beginPath(); ctx.arc(gx, gy - 10, 42, 0, Math.PI * 2); ctx.fill();

        // Sillons concentriques
        ctx.strokeStyle = acc;
        ctx.lineWidth = 1.6;
        [18, 26, 34].forEach(r => {
            ctx.beginPath(); ctx.arc(gx, gy - 10, r, 0.2, Math.PI * 1.65); ctx.stroke();
        });

        // Ondes acoustiques / Equalizer sous le disque
        ctx.fillStyle = acc;
        const bars = [12, 22, 32, 24, 36, 28, 18, 30, 20, 12];
        bars.forEach((bh, bi) => {
            const bx = gx - 44 + bi * 9.2;
            ctx.fillRect(bx, gy + 50 - bh * 0.5, 5.5, bh * 0.5);
        });

        // Typographie "42E RECORDS"
        ctx.fillStyle = inkPrimary;
        ctx.font = 'bold 14px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('42E RECORDS', gx, gy - 52);
        ctx.fillStyle = met;
        ctx.font = 'bold 10px monospace';
        ctx.fillText('PARIS · STUDIO PRO', gx, gy + 64);
        ctx.restore();

        const tex = new THREE.CanvasTexture(c);
        window._graphicTeeTexCache[key] = tex;
        return tex;
    }

    // Environment Map Studio HDRI procédurale (PMREMGenerator) pour reflets réalistes (lunettes, visor, yeux, chaîne, montre)
    function getAvatarStudioEnvMap(renderer) {
        if (!window._avatarStudioEnvMapCache) window._avatarStudioEnvMapCache = new WeakMap();
        if (renderer && window._avatarStudioEnvMapCache.has(renderer)) {
            return window._avatarStudioEnvMapCache.get(renderer);
        }
        try {
            const pmrem = new THREE.PMREMGenerator(renderer);
            const envScene = new THREE.Scene();
            envScene.background = new THREE.Color('#0c0f17');

            const makeLightPanel = (w, h, col, intensity, x, y, z, lx = 0, ly = 1, lz = 0) => {
                const m = new THREE.Mesh(
                    new THREE.PlaneGeometry(w, h),
                    new THREE.MeshBasicMaterial({ color: new THREE.Color(col).multiplyScalar(intensity), side: THREE.DoubleSide })
                );
                m.position.set(x, y, z);
                m.lookAt(lx, ly, lz);
                envScene.add(m);
            };
            makeLightPanel(5, 4, '#fff7ed', 2.4, 3.5, 3.2, 4.0);
            makeLightPanel(5, 4, '#93c5fd', 1.2, -4.0, 2.0, 3.0);
            makeLightPanel(7, 5, '#ffffff', 1.8, 0, 5.5, 1.0);
            makeLightPanel(4, 4, '#38bdf8', 2.0, -3.0, 2.8, -3.5);
            makeLightPanel(4, 4, '#fbbf24', 1.6, 3.2, 2.4, -3.5);

            const rt = pmrem.fromScene(envScene, 0.035);
            if (renderer) window._avatarStudioEnvMapCache.set(renderer, rt.texture);
            window._avatarStudioEnvMap = rt.texture;
            pmrem.dispose();
            return rt.texture;
        } catch (e) {
            return null;
        }
    }

    // ==========================================
    // GÉOMÉTRIE DE TÊTE HUMAINE AAA HAUTE-DENSITÉ (64×64) AVEC SCULPTURE FACIALE CONTINUE C-INFINI
    // (Zéro pli vertical à x=0 : paires gaussiennes symétriques lisses + Color Zones Cutanées par Sommet)
    // ==========================================
    function createSculptedHeadGeometry(isFemale, skinPalette) {
        const pal = skinPalette || { base: '#c98e63', lip: '#965242', blush: '#c85a48', shadow: '#6e4e42' };
        const key = `v5_${isFemale ? 'F' : 'M'}_${pal.base}_${pal.lip}`;
        if (!window._sculptedHeadGeoCache) window._sculptedHeadGeoCache = {};
        if (window._sculptedHeadGeoCache[key]) return window._sculptedHeadGeoCache[key].clone();

        // Proportions humaines réalistes 1:7.5 (visage féminin doux/ovale y*1.04 sans menton allongé)
        const R = isFemale ? 0.100 : 0.106;
        const headGeo = new THREE.SphereGeometry(R, 64, 64);
        const hPos = headGeo.attributes.position;
        const colors = new Float32Array(hPos.count * 3);

        const baseCol = new THREE.Color(pal.base);
        const lipCol = new THREE.Color(pal.lip);
        const blushCol = new THREE.Color(pal.blush || '#c95648');
        const orbitCol = baseCol.clone().multiplyScalar(isFemale ? 0.96 : 0.90).lerp(new THREE.Color('#8a4b44'), isFemale ? 0.08 : 0.12);
        const foreheadCol = baseCol.clone().offsetHSL(0.01, 0.03, 0.02);
        const cavityCol = baseCol.clone().multiplyScalar(0.58);
        const tmpCol = new THREE.Color();

        const gauss2 = (x, cx, rx, y, cy, ry) => {
            const dx = (x - cx) / rx;
            const dy = (y - cy) / ry;
            const d2 = dx * dx + dy * dy;
            return d2 > 9.0 ? 0.0 : Math.exp(-d2);
        };

        for (let i = 0; i < hPos.count; i++) {
            let x = hPos.getX(i), y = hPos.getY(i), z = hPos.getZ(i);
            const ny = y / R; // -1 (menton) à +1 (sommet du crâne)
            const nz = z / R; // -1 (occiput) à +1 (visage)
            const nx = x / R; // -1 à +1
            const nx2 = nx * nx;

            // 1. Proportions crâniennes humaines harmonieuses (visage féminin plus doux et moins allongé en bas)
            y *= isFemale ? 1.04 : 1.16;
            z *= isFemale ? 1.01 : 1.04;

            // 2. Tempes, mâchoire (gonion) et menton finement galbés
            if (ny < 0.20) {
                const jawT = Math.max(0, Math.min(1, (0.20 - ny) / 1.20));
                const jawTaper = isFemale
                    ? (1.0 - 0.27 * Math.pow(jawT, 1.35))
                    : (1.0 - 0.25 * Math.pow(jawT, 1.34));
                x *= jawTaper;
                if (!isFemale && nz > -0.25 && nz < 0.45) {
                    const gonL = gauss2(nx, -0.68, 0.22, ny, -0.32, 0.20);
                    const gonR = gauss2(nx,  0.68, 0.22, ny, -0.32, 0.20);
                    x += (-gonL + gonR) * 0.0042;
                }
                if (nz > 0) {
                    z += (isFemale ? 0.0045 : 0.009) * Math.pow(jawT, 1.25) * Math.exp(-nx2 * 2.0);
                }
                if (ny < -0.58 && nz < 0.42) {
                    y += (-0.58 - ny) * (isFemale ? 0.022 : 0.016);
                }
            } else {
                x *= isFemale ? 0.93 : 0.91;
            }

            let lipWeight = 0;
            let nostrilCavity = 0;
            let orbitWeight = 0;
            let cheekBlush = 0;

            // 3. Sculpture faciale douce et naturelle
            if (nz > 0.12) {
                const frontMask = Math.min(1.0, (nz - 0.12) / 0.45);

                // A. Pommettes douces
                const zygL = gauss2(nx, -0.52, 0.26, ny, -0.02, 0.20);
                const zygR = gauss2(nx,  0.52, 0.26, ny, -0.02, 0.20);
                const zygoma = zygL + zygR;
                x += (-zygL + zygR) * (isFemale ? 0.0045 : 0.0045) * frontMask;
                z += zygoma * (isFemale ? 0.0038 : 0.0042) * frontMask;
                cheekBlush = zygoma;

                // B. Orbites légères & Arcade sourcilière
                const eyeY = isFemale ? 0.08 : 0.14;
                const eyeSockL = gauss2(nx, -0.33, 0.19, ny, eyeY, 0.12);
                const eyeSockR = gauss2(nx,  0.33, 0.19, ny, eyeY, 0.12);
                const eyeSock = eyeSockL + eyeSockR;
                z -= eyeSock * (isFemale ? 0.0035 : 0.0045) * frontMask;
                orbitWeight = eyeSock;

                const browRidge = (gauss2(nx, -0.34, 0.22, ny, eyeY + 0.13, 0.085) + gauss2(nx, 0.34, 0.22, ny, eyeY + 0.13, 0.085));
                z += browRidge * (isFemale ? 0.002 : 0.006) * frontMask;

                // C. Nez fin et délicat (relief doux ry=0.12 sur isFemale pour éviter toute ombre portée sombre sous le nez !)
                const noseBridge = gauss2(nx, 0.0, isFemale ? 0.075 : 0.088, ny, isFemale ? 0.02 : 0.07, 0.15);
                const noseTip = gauss2(nx, 0.0, isFemale ? 0.082 : 0.108, ny, isFemale ? -0.10 : -0.075, isFemale ? 0.115 : 0.074);
                const nostrilWingL = gauss2(nx, -0.095, 0.058, ny, isFemale ? -0.12 : -0.095, 0.055);
                const nostrilWingR = gauss2(nx,  0.095, 0.058, ny, isFemale ? -0.12 : -0.095, 0.055);
                const nostrilHoleL = gauss2(nx, -0.065, 0.036, ny, -0.122, 0.028);
                const nostrilHoleR = gauss2(nx,  0.065, 0.036, ny, -0.122, 0.028);

                z += (noseBridge * (isFemale ? 0.0060 : 0.012) + noseTip * (isFemale ? 0.0070 : 0.020) + (nostrilWingL + nostrilWingR) * (isFemale ? 0.0025 : 0.0075)) * frontMask;
                x += (-nostrilWingL + nostrilWingR) * (isFemale ? 0.001 : 0.002) * frontMask;
                if (!isFemale) {
                    nostrilCavity = Math.min(1.0, (nostrilHoleL + nostrilHoleR) * 0.85);
                    z -= nostrilCavity * 0.003 * frontMask;
                }
                cheekBlush = Math.max(cheekBlush, noseTip * 0.45);

                // D. Lèvres naturelles, larges et harmonieuses (relief doux sans ombre dure + coloration rose corail nette)
                const lipY = isFemale ? -0.31 : -0.285;
                const smileLift = isFemale ? (nx2 * 0.12) : 0.0;
                const upperLipL = gauss2(nx, -0.090, isFemale ? 0.155 : 0.105, ny - smileLift, lipY, 0.042);
                const upperLipR = gauss2(nx,  0.090, isFemale ? 0.155 : 0.105, ny - smileLift, lipY, 0.042);
                const cupidsBow = Math.min(1.1, (upperLipL + upperLipR) * 0.72);
                const lowerLip = gauss2(nx, 0.0, isFemale ? 0.205 : 0.155, ny - smileLift * 0.8, lipY - 0.075, 0.045);
                const mouthCleft = gauss2(nx, 0.0, isFemale ? 0.22 : 0.175, ny - smileLift * 0.9, lipY - 0.038, 0.016);

                z += (cupidsBow * (isFemale ? 0.0035 : 0.0075) + lowerLip * (isFemale ? 0.0040 : 0.0085) - mouthCleft * (isFemale ? 0.0010 : 0.0038)) * frontMask;
                lipWeight = Math.min(1.0, Math.max(cupidsBow * 1.1, lowerLip * 1.15));
                if (!isFemale) {
                    nostrilCavity = Math.max(nostrilCavity, mouthCleft * 0.50);
                }

                // Menton doux
                const chinCrease = gauss2(nx, 0.0, 0.18, ny, lipY - 0.17, 0.048);
                const chinBoss = gauss2(nx, 0.0, isFemale ? 0.16 : 0.22, ny, -0.60, 0.13);
                z += (-chinCrease * (isFemale ? 0.0012 : 0.0022) + chinBoss * (isFemale ? 0.0040 : 0.0075)) * frontMask;
            }

            hPos.setXYZ(i, x, y, z);

            // 4. Coloration cutanée saine, lumineuse et homogène
            tmpCol.copy(baseCol);
            if (ny > 0.25) {
                tmpCol.lerp(foreheadCol, Math.min(1, (ny - 0.25) * 1.4));
            }
            if (cheekBlush > 0.01) {
                tmpCol.lerp(blushCol, cheekBlush * (isFemale ? 0.24 : 0.13));
            }
            if (!isFemale && orbitWeight > 0.01) {
                tmpCol.lerp(orbitCol, Math.min(1, orbitWeight * 0.25));
            }
            if (lipWeight > 0.05) {
                tmpCol.lerp(lipCol, Math.min(1, Math.pow(lipWeight, 0.85) * (isFemale ? 0.92 : 0.85)));
            }
            if (!isFemale && nostrilCavity > 0.05) {
                tmpCol.lerp(cavityCol, Math.min(1, nostrilCavity * 0.40));
            }

            colors[i * 3]     = tmpCol.r;
            colors[i * 3 + 1] = tmpCol.g;
            colors[i * 3 + 2] = tmpCol.b;
        }

        headGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        headGeo.computeVertexNormals();
        window._sculptedHeadGeoCache[key] = headGeo;
        return headGeo.clone();
    }

    // Géométrie de Torse / Buste Athlétique & Élancé (48×32) — Proportions affinées (-28% de volume) pour éviter tout clipping avec la chaîne/sangles
    function createSculptedGarmentTorsoGeo(isFemale, garmentType = 'knit') {
        const key = `v4_${isFemale ? 'F' : 'M'}_${garmentType}`;
        if (!window._sculptedTorsoCache) window._sculptedTorsoCache = {};
        if (window._sculptedTorsoCache[key]) return window._sculptedTorsoCache[key].clone();

        const geo = new THREE.CylinderGeometry(1.0, 1.0, 0.42, 48, 32, false, Math.PI, Math.PI * 2);
        const pos = geo.attributes.position;
        for (let i = 0; i < pos.count; i++) {
            let x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
            const t = (y + 0.21) / 0.42; // 0 (hanches) -> 1 (col)
            const ang = Math.atan2(x, z); // 0 = devant (+Z), ±PI = dos (-Z)
            const rNorm = Math.sqrt(x * x + z * z) || 1;
            const nx = x / rNorm, nz = z / rNorm;

            let rx, rz;
            if (isFemale) {
                const waistDip = Math.exp(-Math.pow((t - 0.34) / 0.20, 2));
                const chestSwell = Math.exp(-Math.pow((t - 0.66) / 0.22, 2));
                const neckTaper = t > 0.83 ? Math.pow((t - 0.83) / 0.17, 1.45) : 0;
                rx = 0.114 - waistDip * 0.016 + chestSwell * 0.012 - neckTaper * 0.054;
                rz = 0.076 - waistDip * 0.010 + chestSwell * 0.014 - neckTaper * 0.032;
            } else {
                const vTaper = t * 0.024;
                const chestSwell = Math.exp(-Math.pow((t - 0.68) / 0.24, 2)) * 0.008;
                const neckTaper = t > 0.84 ? Math.pow((t - 0.84) / 0.16, 1.50) : 0;
                rx = 0.118 + vTaper + chestSwell - neckTaper * 0.072;
                rz = 0.078 + vTaper * 0.35 + chestSwell * 0.6 - neckTaper * 0.036;
            }

            // Volume anatomique poitrine / pectoraux subtil et athlétique (surface avant max z ≈ 0.093)
            if (nz > 0.15) {
                const frontF = (nz - 0.15) / 0.85;
                if (isFemale) {
                    const bustL = Math.exp(-Math.pow((nx + 0.38) / 0.30, 2) - Math.pow((t - 0.64) / 0.15, 2));
                    const bustR = Math.exp(-Math.pow((nx - 0.38) / 0.30, 2) - Math.pow((t - 0.64) / 0.15, 2));
                    rz += (bustL + bustR) * 0.014 * frontF;
                } else {
                    const pecL = Math.exp(-Math.pow((nx + 0.40) / 0.34, 2) - Math.pow((t - 0.68) / 0.16, 2));
                    const pecR = Math.exp(-Math.pow((nx - 0.40) / 0.34, 2) - Math.pow((t - 0.68) / 0.16, 2));
                    rz += (pecL + pecR) * 0.007 * frontF;
                }
            }

            // Micro-plis textiles naturels
            const tensionFold = Math.sin(t * 22.0 + Math.cos(ang * 2.0) * 2.0) * Math.exp(-Math.pow((t - 0.44) / 0.24, 2));
            const hemGather = Math.cos(ang * 8.0) * Math.exp(-Math.pow((t - 0.11) / 0.08, 2));
            const foldAmp = garmentType === 'sleeveless' ? 0.0012 : (garmentType === 'tech' ? 0.0018 : 0.0022);

            const radX = rx + (tensionFold * 0.50 + hemGather * 0.30) * foldAmp;
            const radZ = rz + (tensionFold * 0.55 + hemGather * 0.30) * foldAmp;

            pos.setXYZ(i, nx * radX, y + 0.21, nz * radZ);
        }
        geo.computeVertexNormals();
        window._sculptedTorsoCache[key] = geo;
        return geo.clone();
    }

    function createAvatarGroup(styleIndex, tier = null, variant = null) {
        const group = new THREE.Group();
        const resolvedTier = (tier !== null && tier !== undefined)
            ? Math.max(1, Math.min(4, parseInt(tier, 10) || 1))
            : (MODEL_TO_TIER[styleIndex] || 1);
        const sIdx = (tier !== null && tier !== undefined)
            ? window.getModelIndexForTier(resolvedTier)
            : Math.max(0, Math.min(3, parseInt(styleIndex, 10) || 0));
        const resolvedVariant = (variant !== null && variant !== undefined)
            ? Math.max(0, Math.min(3, parseInt(variant, 10) || 0))
            : 0;

        const isFemale = (sIdx === 0);
        const varSpec = window.getAvatarVariantSpec(resolvedTier, resolvedVariant);
        const pbr = getAvatarPBRTextures();

        // ==========================================
        // 1. MATÉRIAUX PBR AAA (Peau SSS + Pores NormalMap, Maille, Coton, Ripstop, Métaux)
        // ==========================================
        // sIdx: 0 = Beatmaker (Femme), 1 = Cyber-DJ, 2 = Street_MC, 3 = Producer
        const skinPalettes = [
            { base: '#df9e78', sheen: '#f6c8aa', lip: '#c84252', blush: '#e0584e', sss: '#e04832' }, // 0: Beatmaker (Teint pêche doré chaud)
            { base: '#8c5332', sheen: '#ba815c', lip: '#693426', blush: '#9e3e2f', sss: '#c23b22' }, // 1: Cyber-DJ
            { base: '#c68a5e', sheen: '#e8b994', lip: '#8f4b3d', blush: '#bd4e3e', sss: '#d4422a' }, // 2: Street_MC
            { base: '#ab7048', sheen: '#d49d75', lip: '#783f31', blush: '#a84434', sss: '#c93e26' }  // 3: Producer
        ];
        const sk = skinPalettes[sIdx] || skinPalettes[2];
        const torsoHex = varSpec.torso;
        const sleeveHex = varSpec.sleeves || varSpec.torso;
        const pantsHex = varSpec.pants || '#111318';
        const shoeHex = varSpec.shoes || '#f8fafc';
        const neonHex = varSpec.glow || varSpec.accent || '#38bdf8';

        // Peau corporelle (cou, bras, mains) avec NormalMap de pores + Subsurface Scattering
        const skinMat = applySkinSSS(new THREE.MeshPhysicalMaterial({
            color: sk.base,
            roughness: 0.42,
            metalness: 0.01,
            clearcoat: 0.14,
            clearcoatRoughness: 0.44,
            sheen: 0.36,
            sheenRoughness: 0.58,
            sheenColor: new THREE.Color(sk.sheen),
            normalMap: pbr.skinNormalMap,
            normalScale: new THREE.Vector2(0.24, 0.24),
            envMapIntensity: 0.85
        }), sk.sss);

        // Peau faciale (avec VertexColors anatomiques : joues, nez, orbites, lèvres + spéculaire gras T-zone)
        const headSkinMat = applySkinSSS(new THREE.MeshPhysicalMaterial({
            color: '#ffffff',
            vertexColors: true,
            roughness: 0.38,
            metalness: 0.01,
            clearcoat: 0.18,
            clearcoatRoughness: 0.36,
            sheen: 0.40,
            sheenRoughness: 0.52,
            sheenColor: new THREE.Color(sk.sheen),
            normalMap: pbr.skinNormalMap,
            normalScale: new THREE.Vector2(0.28, 0.28),
            envMapIntensity: 0.95
        }), sk.sss);

        // Sélection de la NormalMap de tissage selon l'avatar (1=Maille, 2=Coton, 3=Ripstop Tech, 4=T-shirt Graphique Coton)
        const activeFabricNormal = (sIdx === 2)
            ? pbr.knitNormalMap
            : (sIdx === 1 ? pbr.techNormalMap : pbr.cottonNormalMap);
        const graphicTeeMap = (sIdx === 3) ? createGraphicTeeTexture(varSpec) : null;

        const clothesMat = new THREE.MeshPhysicalMaterial({
            color: graphicTeeMap ? '#ffffff' : torsoHex,
            map: graphicTeeMap || null,
            roughness: sIdx === 1 ? 0.36 : (sIdx === 2 ? 0.82 : 0.68),
            metalness: sIdx === 1 ? 0.22 : 0.02,
            sheen: sIdx === 2 ? 0.58 : 0.38,
            sheenRoughness: 0.68,
            sheenColor: new THREE.Color(torsoHex).offsetHSL(0, 0, 0.16),
            clearcoat: sIdx === 1 ? 0.24 : 0.0,
            clearcoatRoughness: 0.4,
            normalMap: activeFabricNormal,
            normalScale: new THREE.Vector2(sIdx === 2 ? 0.65 : 0.45, sIdx === 2 ? 0.65 : 0.45)
        });

        const sleeveMat = new THREE.MeshPhysicalMaterial({
            color: sleeveHex,
            roughness: sIdx === 1 ? 0.36 : (sIdx === 2 ? 0.80 : 0.66),
            metalness: sIdx === 1 ? 0.20 : 0.02,
            sheen: 0.45,
            sheenRoughness: 0.65,
            sheenColor: new THREE.Color(sleeveHex).offsetHSL(0, 0, 0.14),
            normalMap: sIdx === 0 ? pbr.cottonNormalMap : activeFabricNormal,
            normalScale: new THREE.Vector2(0.48, 0.48)
        });

        const techPanelMat = new THREE.MeshPhysicalMaterial({
            color: varSpec.techPanel || '#0e7490',
            roughness: 0.32,
            metalness: 0.25,
            clearcoat: 0.35,
            clearcoatRoughness: 0.3,
            normalMap: pbr.techNormalMap,
            normalScale: new THREE.Vector2(0.55, 0.55)
        });

        const pantsMat = new THREE.MeshPhysicalMaterial({
            color: pantsHex,
            roughness: 0.66,
            metalness: 0.05,
            sheen: 0.28,
            sheenRoughness: 0.75,
            normalMap: pbr.cottonNormalMap,
            normalScale: new THREE.Vector2(0.42, 0.42)
        });

        const shoesMat = new THREE.MeshPhysicalMaterial({
            color: shoeHex,
            roughness: 0.30,
            metalness: 0.08,
            clearcoat: 0.35,
            clearcoatRoughness: 0.32,
            normalMap: pbr.leatherNormalMap,
            normalScale: new THREE.Vector2(0.38, 0.38)
        });

        const leatherBlackMat = new THREE.MeshPhysicalMaterial({
            color: '#12141a',
            roughness: 0.28,
            metalness: 0.14,
            clearcoat: 0.45,
            clearcoatRoughness: 0.28,
            normalMap: pbr.leatherNormalMap,
            normalScale: new THREE.Vector2(0.42, 0.42)
        });

        const rubberSoleMat = new THREE.MeshStandardMaterial({
            color: '#0d0e11',
            roughness: 0.82,
            metalness: 0.05
        });

        const accentMat = new THREE.MeshPhysicalMaterial({
            color: varSpec.accent,
            emissive: neonHex,
            emissiveIntensity: resolvedTier === 3 ? 1.15 : (resolvedTier === 4 ? 0.32 : 0.16),
            roughness: 0.22,
            metalness: 0.28,
            clearcoat: 0.6
        });

        const metalMat = new THREE.MeshPhysicalMaterial({
            color: varSpec.metal || '#fbbf24',
            metalness: 0.96,
            roughness: 0.14,
            clearcoat: 0.65,
            clearcoatRoughness: 0.12,
            envMapIntensity: 1.85
        });

        const whiteCottonMat = new THREE.MeshPhysicalMaterial({
            color: '#f8fafc',
            roughness: 0.70,
            sheen: 0.3,
            normalMap: pbr.cottonNormalMap,
            normalScale: new THREE.Vector2(0.35, 0.35)
        });

        // Matériaux Hair Cards Alpha-Testées + Spéculaire Anisotrope
        const hairPalettes = [
            { base: '#111015', high: '#3b3748' }, // 0: Beatmaker (Noir corbeau reflets froids)
            { base: '#0f1218', high: '#2d3b4e' }, // 1: Cyber-DJ
            { base: '#15110f', high: '#3d2e24' }, // 2: Street_MC
            { base: '#1f1510', high: '#523828' }  // 3: Producer (Brun espresso chaud)
        ];
        const hpPal = hairPalettes[sIdx] || hairPalettes[2];
        const hairCardMat = getHairCardMaterial(hpPal.base, hpPal.high, false);
        const beardCardMat = getHairCardMaterial(hpPal.base, hpPal.high, true);
        const hairScalpMat = new THREE.MeshPhysicalMaterial({
            color: hpPal.base,
            roughness: 0.46,
            sheen: 0.55,
            sheenColor: new THREE.Color(hpPal.high)
        });

        // ==========================================
        // 2. JAMBES ANATOMIQUES & CHAUSSURES HAUTE COUTURE (Pivot Hanche y = 0.68)
        // ==========================================
        const createLeg = (xSign) => {
            const legGroup = new THREE.Group();
            legGroup.name = xSign < 0 ? "Leg_L" : "Leg_R";
            legGroup.position.set(xSign * (isFemale ? 0.088 : 0.096), 0.68, 0);

            const thigh = new THREE.Mesh(new THREE.CylinderGeometry(isFemale ? 0.078 : 0.084, 0.064, 0.28, 24), pantsMat);
            thigh.position.set(0, -0.135, 0);
            thigh.scale.set(0.96, 1, 1.06);
            thigh.castShadow = true;
            legGroup.add(thigh);

            if (sIdx === 2 || sIdx === 1) {
                const cargoPocket = new THREE.Mesh(new THREE.BoxGeometry(0.022, 0.11, 0.085), sIdx === 1 ? leatherBlackMat : pantsMat);
                cargoPocket.position.set(xSign * 0.076, -0.14, 0.005);
                legGroup.add(cargoPocket);
                if (sIdx === 1) {
                    const neonStrip = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.10, 0.008), accentMat);
                    neonStrip.position.set(xSign * 0.078, -0.14, 0.048);
                    legGroup.add(neonStrip);
                }
            }

            const knee = new THREE.Mesh(new THREE.SphereGeometry(0.063, 18, 14), pantsMat);
            knee.position.set(0, -0.27, 0.006);
            knee.scale.set(0.95, 0.85, 1.04);
            legGroup.add(knee);

            const calf = new THREE.Mesh(new THREE.CylinderGeometry(0.063, 0.048, 0.26, 24), pantsMat);
            calf.position.set(0, -0.40, -0.004);
            calf.castShadow = true;
            legGroup.add(calf);

            const ankleCuff = new THREE.Mesh(new THREE.TorusGeometry(0.049, 0.013, 10, 22), pantsMat);
            ankleCuff.rotation.x = Math.PI / 2;
            ankleCuff.position.set(0, -0.515, 0);
            legGroup.add(ankleCuff);

            if (sIdx === 0 || sIdx === 3) {
                const bootMat = (resolvedTier === 4 && resolvedVariant === 2) ? shoesMat : leatherBlackMat;
                const bootGroup = new THREE.Group();

                const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.053, 0.057, 0.135, 22), bootMat);
                shaft.position.set(0, -0.565, -0.004);
                bootGroup.add(shaft);

                const vamp = new THREE.Mesh(new THREE.SphereGeometry(0.057, 22, 16), bootMat);
                vamp.scale.set(0.98, 0.72, 1.88);
                vamp.position.set(0, -0.620, 0.048);
                vamp.castShadow = true;
                bootGroup.add(vamp);

                const laceMat = new THREE.MeshStandardMaterial({ color: '#1f242d', roughness: 0.8 });
                for (let l = 0; l < 5; l++) {
                    const ly = -0.525 - l * 0.018;
                    const lz = 0.048 + l * 0.008;
                    const laceBar = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.052, 8), laceMat);
                    laceBar.rotation.z = Math.PI / 2 + (l % 2 === 0 ? 0.14 : -0.14);
                    laceBar.position.set(0, ly, lz);
                    bootGroup.add(laceBar);

                    [-1, 1].forEach(side => {
                        const eyelet = new THREE.Mesh(new THREE.TorusGeometry(0.0055, 0.0018, 6, 12), metalMat);
                        eyelet.position.set(side * 0.026, ly, lz - 0.002);
                        eyelet.rotation.y = side * 0.4;
                        bootGroup.add(eyelet);
                    });
                }

                const pullTab = new THREE.Mesh(new THREE.TorusGeometry(0.014, 0.0038, 8, 16), accentMat);
                pullTab.position.set(0, -0.495, -0.058);
                pullTab.rotation.y = Math.PI / 2;
                bootGroup.add(pullTab);

                const weltMat = new THREE.MeshStandardMaterial({ color: sIdx === 0 && resolvedVariant === 0 ? '#fbbf24' : varSpec.accent, roughness: 0.45 });
                const welt = new THREE.Mesh(new THREE.TorusGeometry(0.056, 0.005, 10, 28), weltMat);
                welt.rotation.x = Math.PI / 2;
                welt.scale.set(1.02, 1.98, 0.8);
                welt.position.set(0, -0.642, 0.044);
                bootGroup.add(welt);

                const sole = new THREE.Mesh(new THREE.CylinderGeometry(0.059, 0.061, 0.030, 24), rubberSoleMat);
                sole.scale.set(1.0, 1.0, 1.98);
                sole.position.set(0, -0.660, 0.044);
                bootGroup.add(sole);

                const heelBlock = new THREE.Mesh(new THREE.BoxGeometry(0.112, 0.036, 0.078), rubberSoleMat);
                heelBlock.position.set(0, -0.662, -0.022);
                bootGroup.add(heelBlock);

                legGroup.add(bootGroup);
            } else {
                const snkGroup = new THREE.Group();
                const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.056, 0.059, 0.085, 22), shoesMat);
                collar.position.set(0, -0.565, 0.002);
                snkGroup.add(collar);

                const collarPad = new THREE.Mesh(new THREE.TorusGeometry(0.054, 0.013, 10, 22), accentMat);
                collarPad.rotation.x = Math.PI / 2;
                collarPad.position.set(0, -0.525, 0.002);
                snkGroup.add(collarPad);

                const tongue = new THREE.Mesh(new THREE.BoxGeometry(0.056, 0.085, 0.018), shoesMat);
                tongue.position.set(0, -0.555, 0.054);
                tongue.rotation.x = 0.28;
                snkGroup.add(tongue);

                const tongueTag = new THREE.Mesh(new THREE.BoxGeometry(0.030, 0.022, 0.020), accentMat);
                tongueTag.position.set(0, -0.530, 0.062);
                tongueTag.rotation.x = 0.28;
                snkGroup.add(tongueTag);

                const toeBox = new THREE.Mesh(new THREE.SphereGeometry(0.058, 22, 16), shoesMat);
                toeBox.scale.set(1.02, 0.68, 1.92);
                toeBox.position.set(0, -0.618, 0.052);
                toeBox.castShadow = true;
                snkGroup.add(toeBox);

                const sideOverlay = new THREE.Mesh(new THREE.BoxGeometry(0.120, 0.042, 0.13), clothesMat);
                sideOverlay.position.set(0, -0.612, 0.022);
                snkGroup.add(sideOverlay);

                for (let l = 0; l < 4; l++) {
                    const strap = new THREE.Mesh(new THREE.BoxGeometry(0.062, 0.008, 0.014), whiteCottonMat);
                    strap.position.set(0, -0.562 - l * 0.013, 0.066 + l * 0.013);
                    strap.rotation.x = 0.45;
                    snkGroup.add(strap);
                }

                const midsole = new THREE.Mesh(new THREE.CylinderGeometry(0.061, 0.063, 0.026, 24), whiteCottonMat);
                midsole.scale.set(1.02, 1.0, 2.02);
                midsole.position.set(0, -0.650, 0.048);
                snkGroup.add(midsole);

                const outsole = new THREE.Mesh(new THREE.CylinderGeometry(0.062, 0.063, 0.012, 24), accentMat);
                outsole.scale.set(1.03, 1.0, 2.04);
                outsole.position.set(0, -0.670, 0.048);
                snkGroup.add(outsole);

                legGroup.add(snkGroup);
            }

            return legGroup;
        };
        group.add(createLeg(-1), createLeg(1));

        // ==========================================
        // 3. TORSE ATHLÉTIQUE HAUTE-DENSITÉ & VÊTEMENTS À PLIS PROCÉDURAUX (Pivot Taille y = 0.68)
        // ==========================================
        const torso = new THREE.Group();
        torso.name = "Torso";
        torso.position.set(0, 0.68, 0);
        group.add(torso);

        // Bassin proportionné au buste affiné
        const pelvis = new THREE.Mesh(new THREE.CylinderGeometry(isFemale ? 0.110 : 0.118, isFemale ? 0.116 : 0.116, 0.10, 28), pantsMat);
        pelvis.scale.set(1.04, 1, 0.70);
        pelvis.position.set(0, 0.01, 0);
        pelvis.castShadow = true;
        torso.add(pelvis);

        // Maillage de vêtement continu 48×32 avec plis de tension et volume pectoral/buste naturel
        const garmentType = sIdx === 0 ? 'sleeveless' : (sIdx === 1 ? 'tech' : (sIdx === 3 ? 'tee' : 'knit'));
        const mainGarmentGeo = createSculptedGarmentTorsoGeo(isFemale, garmentType);
        const mainGarmentMesh = new THREE.Mesh(mainGarmentGeo, clothesMat);
        mainGarmentMesh.name = "ChestBreathing";
        mainGarmentMesh.castShadow = true;
        mainGarmentMesh.receiveShadow = true;
        torso.add(mainGarmentMesh);

        // Pont d'épaules athlétique et fluide (sans effet "épaules carrées gonflées")
        const shoulderBridge = new THREE.Mesh(
            new THREE.CapsuleGeometry(isFemale ? 0.040 : 0.046, isFemale ? 0.175 : 0.205, 16, 24),
            sIdx === 0 ? sleeveMat : (sIdx === 1 ? techPanelMat : clothesMat)
        );
        shoulderBridge.rotation.z = Math.PI / 2;
        shoulderBridge.scale.set(1, 1, 0.84);
        shoulderBridge.position.set(0, 0.362, -0.005);
        shoulderBridge.castShadow = true;
        torso.add(shoulderBridge);

        // DÉTAILS DE COUTURE & ACCESSOIRES DE BUSTE (100% hors du maillage, zéro clipping !)
        if (sIdx === 2) {
            // 1. STREET_MC : Pull uni en maille (col rond bord-côte, ourlet côtelé) + Chaîne Cubaine posée proprement sur le torse
            const ribHem = new THREE.Mesh(new THREE.TorusGeometry(0.114, 0.013, 12, 32), clothesMat);
            ribHem.rotation.x = Math.PI / 2;
            ribHem.scale.set(1.06, 0.72, 1.2);
            ribHem.position.set(0, 0.036, 0);
            torso.add(ribHem);

            // Sous-pull / T-shirt blanc ras-du-cou visible à l'encolure
            const teeNeck = new THREE.Mesh(new THREE.TorusGeometry(0.050, 0.008, 10, 28), whiteCottonMat);
            teeNeck.rotation.x = Math.PI / 2 + 0.15;
            teeNeck.position.set(0, 0.412, 0.010);
            torso.add(teeNeck);

            // Col rond tricoté en bord-côte
            const crewCollar = new THREE.Mesh(new THREE.TorusGeometry(0.062, 0.013, 14, 32), clothesMat);
            crewCollar.rotation.x = Math.PI / 2 + 0.14;
            crewCollar.scale.set(1.04, 0.90, 1.0);
            crewCollar.position.set(0, 0.405, 0.004);
            crewCollar.castShadow = true;
            torso.add(crewCollar);

            // Chaîne Cubaine Métallique PBR au cou (21 maillons + médaillon — 100% devant le pull à z = 0.104 > 0.092 !)
            const numLinks = 21;
            for (let k = 0; k < numLinks; k++) {
                const u = (k / (numLinks - 1)) * 2 - 1; // -1..1
                const lx = u * 0.070;
                const ly = 0.282 + Math.pow(Math.abs(u), 1.60) * 0.120;
                const lz = 0.103 - (u * u) * 0.034;
                const link = new THREE.Mesh(new THREE.TorusGeometry(0.0095, 0.0036, 10, 18), metalMat);
                link.position.set(lx, ly, lz);
                link.rotation.set(0.55, u * 0.65, (k % 2 === 0 ? 0.52 : -0.52));
                link.castShadow = true;
                torso.add(link);
            }
            const pendantBail = new THREE.Mesh(new THREE.TorusGeometry(0.0075, 0.0025, 8, 16), metalMat);
            pendantBail.position.set(0, 0.268, 0.106);
            pendantBail.rotation.y = Math.PI / 2;
            torso.add(pendantBail);

            const pendantRing = new THREE.Mesh(new THREE.TorusGeometry(0.020, 0.0038, 12, 24), metalMat);
            pendantRing.position.set(0, 0.246, 0.108);
            pendantRing.castShadow = true;
            torso.add(pendantRing);

            const pendantDisc = new THREE.Mesh(new THREE.CylinderGeometry(0.0175, 0.0175, 0.0045, 24), metalMat);
            pendantDisc.rotation.x = Math.PI / 2;
            pendantDisc.position.set(0, 0.246, 0.108);
            torso.add(pendantDisc);

        } else if (sIdx === 0) {
            // 2. BEATMAKER : Haut sans manches ajusté (torso) + Manches claires contrastées (sleeveMat)
            const vestCollar = new THREE.Mesh(new THREE.CylinderGeometry(0.054, 0.062, 0.036, 28, 1, true), clothesMat);
            vestCollar.position.set(0, 0.415, 0.003);
            torso.add(vestCollar);

            const vestCollarRim = new THREE.Mesh(new THREE.TorusGeometry(0.054, 0.0065, 10, 28), clothesMat);
            vestCollarRim.rotation.x = Math.PI / 2 + 0.12;
            vestCollarRim.position.set(0, 0.430, 0.004);
            torso.add(vestCollarRim);

            // Bordures d'emmanchures du haut sans manches
            [-1, 1].forEach(side => {
                const armholeTrim = new THREE.Mesh(new THREE.TorusGeometry(0.048, 0.0068, 10, 26), clothesMat);
                armholeTrim.position.set(side * 0.108, 0.352, 0.002);
                armholeTrim.rotation.y = side * 1.18;
                armholeTrim.rotation.x = 0.22;
                torso.add(armholeTrim);
            });

            // Ourlet côtelé à la taille
            const waistRib = new THREE.Mesh(new THREE.TorusGeometry(0.104, 0.012, 10, 28), clothesMat);
            waistRib.rotation.x = Math.PI / 2;
            waistRib.scale.set(1.06, 0.72, 1.15);
            waistRib.position.set(0, 0.036, 0);
            torso.add(waistRib);

            // Câble audio du casque descendant proprement devant le buste (z = 0.098)
            for (let c = 0; c < 8; c++) {
                const coil = new THREE.Mesh(new THREE.TorusGeometry(0.0065, 0.0020, 6, 14), leatherBlackMat);
                coil.position.set(-0.072 + c * 0.0025, 0.405 - c * 0.028, 0.098 + Math.sin(c * 0.4) * 0.006);
                coil.rotation.x = 0.7;
                torso.add(coil);
            }

        } else if (sIdx === 1) {
            // 3. CYBER-DJ : Veste technique noire/cyan avec sangles tactiques, boucles métal et LED émissives (ajustées au buste affiné)
            const cyberEmissive = new THREE.MeshPhysicalMaterial({
                color: neonHex,
                emissive: neonHex,
                emissiveIntensity: 1.75,
                roughness: 0.15,
                clearcoat: 0.9
            });

            [-1, 1].forEach(side => {
                const chestPanel = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.145, 0.136, 0.17, 16, 1, false, side < 0 ? Math.PI * 0.07 : -Math.PI * 0.32, Math.PI * 0.25),
                    techPanelMat
                );
                chestPanel.scale.set(1.04, 1, 0.72);
                chestPanel.position.set(0, 0.30, 0.002);
                torso.add(chestPanel);
            });

            // Col technique montant blindé noir/cyan + jonc LED émissif
            const highCollar = new THREE.Mesh(
                new THREE.CylinderGeometry(0.072, 0.084, 0.080, 28, 1, true, Math.PI * 0.16, Math.PI * 1.68),
                techPanelMat
            );
            highCollar.rotation.y = Math.PI;
            highCollar.position.set(0, 0.422, -0.003);
            torso.add(highCollar);

            const collarNeonRim = new THREE.Mesh(new THREE.TorusGeometry(0.073, 0.0048, 10, 28, Math.PI * 1.60), cyberEmissive);
            collarNeonRim.rotation.x = Math.PI / 2;
            collarNeonRim.rotation.z = Math.PI * 0.70;
            collarNeonRim.position.set(0, 0.461, -0.003);
            torso.add(collarNeonRim);

            // Fermeture éclair centrale étanche + double rail LED vertical (devant le torse à z = 0.097)
            const zipTrack = new THREE.Mesh(new THREE.BoxGeometry(0.010, 0.36, 0.006), leatherBlackMat);
            zipTrack.position.set(0, 0.21, 0.097);
            torso.add(zipTrack);

            [-1, 1].forEach(side => {
                const vLed = new THREE.Mesh(new THREE.CapsuleGeometry(0.004, 0.30, 8, 14), cyberEmissive);
                vLed.position.set(side * 0.038, 0.21, 0.096);
                torso.add(vLed);

                const chevronLed = new THREE.Mesh(new THREE.CapsuleGeometry(0.0045, 0.095, 8, 14), cyberEmissive);
                chevronLed.position.set(side * 0.074, 0.30, 0.091);
                chevronLed.rotation.z = side * 0.62;
                chevronLed.rotation.y = -side * 0.24;
                torso.add(chevronLed);

                // Sangles tactiques croisées en baudrier avec boucles métalliques
                const diagStrap = new THREE.Mesh(new THREE.BoxGeometry(0.024, 0.28, 0.009), leatherBlackMat);
                diagStrap.position.set(side * 0.052, 0.235, 0.097);
                diagStrap.rotation.z = -side * 0.38;
                diagStrap.rotation.y = -side * 0.16;
                torso.add(diagStrap);

                const buckle = new THREE.Mesh(new THREE.BoxGeometry(0.030, 0.020, 0.012), metalMat);
                buckle.position.set(side * 0.066, 0.272, 0.100);
                buckle.rotation.z = -side * 0.38;
                torso.add(buckle);
            });

            // Sangle pectorale horizontale + boucle rapide centrale
            const hStrap = new THREE.Mesh(new THREE.BoxGeometry(0.21, 0.022, 0.009), leatherBlackMat);
            hStrap.position.set(0, 0.188, 0.098);
            torso.add(hStrap);

            const centerBuckle = new THREE.Mesh(new THREE.BoxGeometry(0.034, 0.026, 0.014), metalMat);
            centerBuckle.position.set(0, 0.188, 0.101);
            torso.add(centerBuckle);

        } else if (sIdx === 3) {
            // 4. PRODUCER : T-Shirt Graphique Heavyweight (42E RECORDS), Col rond côtelé & Ceinture luxe
            const belt = new THREE.Mesh(new THREE.CylinderGeometry(0.116, 0.116, 0.030, 28), leatherBlackMat);
            belt.scale.set(1.05, 1, 0.70);
            belt.position.set(0, 0.028, 0);
            torso.add(belt);

            const buckle = new THREE.Mesh(new THREE.BoxGeometry(0.036, 0.030, 0.014), metalMat);
            buckle.position.set(0, 0.028, 0.085);
            torso.add(buckle);

            // Col rond bord-côte du T-shirt graphique
            const teeCollar = new THREE.Mesh(new THREE.TorusGeometry(0.060, 0.012, 12, 32), sleeveMat);
            teeCollar.rotation.x = Math.PI / 2 + 0.15;
            teeCollar.scale.set(1.04, 0.92, 1.0);
            teeCollar.position.set(0, 0.408, 0.006);
            torso.add(teeCollar);

            // Fine chaîne ras-du-cou en or sous le col du T-shirt graphique
            const fineChain = new THREE.Mesh(new THREE.TorusGeometry(0.057, 0.0030, 8, 28, Math.PI), metalMat);
            fineChain.rotation.x = Math.PI * 0.62;
            fineChain.position.set(0, 0.400, 0.022);
            torso.add(fineChain);
        }

        // ==========================================
        // 4. BRAS ATHLÉTIQUES AFFINÉS, MONTRE CHRONOGRAPHE & MAINS À 5 DOIGTS
        // ==========================================
        const createArm = (xSign) => {
            const armGroup = new THREE.Group();
            armGroup.name = xSign < 0 ? "Arm_L" : "Arm_R";
            armGroup.position.set(xSign * (isFemale ? 0.136 : 0.156), 1.032, -0.005);

            const isShortSleeveTee = (sIdx === 3);

            // Épaule / Deltoïde affinée
            const deltoid = new THREE.Mesh(new THREE.SphereGeometry(isFemale ? 0.044 : 0.050, 22, 18), sleeveMat);
            deltoid.scale.set(0.94, 1.08, 0.94);
            deltoid.position.set(0, -0.012, 0);
            deltoid.castShadow = true;
            armGroup.add(deltoid);

            if (isShortSleeveTee) {
                const shortSleeve = new THREE.Mesh(new THREE.CylinderGeometry(0.049, 0.045, 0.135, 24), sleeveMat);
                shortSleeve.position.set(xSign * 0.006, -0.080, 0);
                shortSleeve.rotation.z = xSign * 0.04;
                shortSleeve.castShadow = true;
                armGroup.add(shortSleeve);

                const sleeveHem = new THREE.Mesh(new THREE.TorusGeometry(0.044, 0.005, 10, 24), sleeveMat);
                sleeveHem.rotation.x = Math.PI / 2;
                sleeveHem.position.set(xSign * 0.008, -0.145, 0);
                armGroup.add(sleeveHem);

                const lowerBicep = new THREE.Mesh(new THREE.CylinderGeometry(0.040, 0.037, 0.085, 22), skinMat);
                lowerBicep.position.set(xSign * 0.010, -0.175, 0);
                lowerBicep.rotation.z = xSign * 0.04;
                lowerBicep.castShadow = true;
                armGroup.add(lowerBicep);
            } else {
                const upperArm = new THREE.Mesh(new THREE.CylinderGeometry(isFemale ? 0.041 : 0.047, isFemale ? 0.035 : 0.040, 0.21, 24), sleeveMat);
                upperArm.position.set(xSign * 0.007, -0.115, 0);
                upperArm.rotation.z = xSign * 0.04;
                upperArm.castShadow = true;
                armGroup.add(upperArm);

                [-0.17, -0.19].forEach((fy, fi) => {
                    const fold = new THREE.Mesh(new THREE.TorusGeometry((isFemale ? 0.035 : 0.040) - fi * 0.001, 0.0036, 8, 20), sleeveMat);
                    fold.rotation.x = Math.PI / 2 + 0.18;
                    fold.position.set(xSign * 0.010, fy, 0.003);
                    armGroup.add(fold);
                });
            }

            const elbowGroup = new THREE.Group();
            elbowGroup.name = xSign < 0 ? "Elbow_L" : "Elbow_R";
            elbowGroup.position.set(xSign * 0.014, -0.215, 0);
            if (sIdx === 3 && xSign > 0) {
                elbowGroup.rotation.set(-1.05, -0.46, -0.30);
            } else if (sIdx === 0 && xSign > 0) {
                elbowGroup.rotation.set(-0.46, -0.18, -0.12);
            } else {
                elbowGroup.rotation.set(-0.28, -xSign * 0.10, -xSign * 0.05);
            }
            armGroup.add(elbowGroup);

            const forearmMat = isShortSleeveTee ? skinMat : sleeveMat;
            const elbowJoint = new THREE.Mesh(new THREE.SphereGeometry(isFemale ? 0.035 : 0.040, 18, 14), forearmMat);
            elbowGroup.add(elbowJoint);

            const forearm = new THREE.Mesh(new THREE.CylinderGeometry(isFemale ? 0.035 : 0.040, isFemale ? 0.028 : 0.032, 0.19, 24), forearmMat);
            forearm.position.set(0, -0.095, 0);
            forearm.castShadow = true;
            elbowGroup.add(forearm);

            if (!isShortSleeveTee) {
                const ribCuff = new THREE.Mesh(new THREE.TorusGeometry(isFemale ? 0.029 : 0.033, 0.0065, 10, 22), sleeveMat);
                ribCuff.rotation.x = Math.PI / 2;
                ribCuff.position.set(0, -0.182, 0);
                elbowGroup.add(ribCuff);
            }

            // MONTRE CHRONOGRAPHE DÉTAILLÉE (Avatar 4 Producer & Avatar 3 Cyber-DJ sur le poignet droit)
            if ((sIdx === 3 || sIdx === 1) && xSign > 0) {
                const watchGrp = new THREE.Group();
                watchGrp.position.set(0, -0.178, 0);

                const strap = new THREE.Mesh(new THREE.TorusGeometry(0.033, 0.008, 12, 24), metalMat);
                strap.rotation.x = Math.PI / 2;
                strap.scale.set(1.0, 1.0, 1.35);
                watchGrp.add(strap);

                const watchCase = new THREE.Mesh(new THREE.CylinderGeometry(0.021, 0.022, 0.011, 24), metalMat);
                watchCase.rotation.x = Math.PI / 2;
                watchCase.position.set(0.008, 0, 0.032);
                watchCase.castShadow = true;
                watchGrp.add(watchCase);

                const dialMat = new THREE.MeshPhysicalMaterial({
                    color: sIdx === 1 ? neonHex : '#0b0f19',
                    emissive: sIdx === 1 ? neonHex : '#000000',
                    emissiveIntensity: sIdx === 1 ? 0.55 : 0,
                    roughness: 0.08,
                    metalness: 0.65,
                    clearcoat: 1.0,
                    clearcoatRoughness: 0.02
                });
                const watchDial = new THREE.Mesh(new THREE.CylinderGeometry(0.017, 0.017, 0.012, 24), dialMat);
                watchDial.rotation.x = Math.PI / 2;
                watchDial.position.set(0.008, 0, 0.033);
                watchGrp.add(watchDial);

                const hand1 = new THREE.Mesh(new THREE.BoxGeometry(0.0018, 0.010, 0.0018), metalMat);
                hand1.position.set(0.008, 0.003, 0.039);
                const hand2 = new THREE.Mesh(new THREE.BoxGeometry(0.009, 0.0018, 0.0018), metalMat);
                hand2.position.set(0.011, 0, 0.039);
                watchGrp.add(hand1, hand2);

                elbowGroup.add(watchGrp);
            }

            // MAIN ANATOMIQUE HAUTE-DENSITÉ (Paume sculptée + Pouce + 4 Doigts)
            const handGroup = new THREE.Group();
            handGroup.position.set(0, -0.215, 0.003);
            handGroup.rotation.y = -xSign * 0.28;
            elbowGroup.add(handGroup);

            const palm = new THREE.Mesh(new THREE.SphereGeometry(0.028, 18, 16), skinMat);
            palm.scale.set(0.88, 1.15, 0.50);
            palm.position.set(0, -0.018, 0);
            palm.castShadow = true;
            handGroup.add(palm);

            const thumbGroup = new THREE.Group();
            thumbGroup.position.set(-xSign * 0.020, -0.011, 0.010);
            thumbGroup.rotation.set(0.32, 0, xSign * 0.46);
            const thumbProx = new THREE.Mesh(new THREE.CapsuleGeometry(0.0068, 0.015, 8, 12), skinMat);
            thumbProx.position.set(0, -0.009, 0);
            const thumbDist = new THREE.Mesh(new THREE.CapsuleGeometry(0.0060, 0.012, 8, 12), skinMat);
            thumbDist.position.set(xSign * 0.003, -0.022, 0.003);
            thumbDist.rotation.z = -xSign * 0.25;
            thumbGroup.add(thumbProx, thumbDist);
            handGroup.add(thumbGroup);

            const fingerSpecs = [
                { xOff: -0.014, len: 0.027, r: 0.0058, curl: 0.24 },
                { xOff: -0.005, len: 0.030, r: 0.0062, curl: 0.28 },
                { xOff:  0.005, len: 0.028, r: 0.0058, curl: 0.32 },
                { xOff:  0.014, len: 0.022, r: 0.0052, curl: 0.38 }
            ];
            fingerSpecs.forEach(f => {
                const fGrp = new THREE.Group();
                fGrp.position.set(-xSign * f.xOff, -0.038, 0.002);
                fGrp.rotation.x = f.curl;
                const prox = new THREE.Mesh(new THREE.CapsuleGeometry(f.r, f.len * 0.52, 8, 12), skinMat);
                prox.position.set(0, -f.len * 0.27, 0);
                const dist = new THREE.Mesh(new THREE.CapsuleGeometry(f.r * 0.86, f.len * 0.44, 8, 12), skinMat);
                dist.position.set(0, -f.len * 0.70, 0.003);
                dist.rotation.x = f.curl * 0.85;
                fGrp.add(prox, dist);
                handGroup.add(fGrp);
            });

            return armGroup;
        };
        group.add(createArm(-1), createArm(1));

        // ==========================================
        // 5. COU ANATOMIQUE & TÊTE HUMAINE PROPORTIONNÉE 64×64 (Pivot Cou y = 1.095)
        // ==========================================
        const headGroup = new THREE.Group();
        headGroup.name = "HeadGroup";
        headGroup.position.set(0, 1.095, 0.004);
        group.add(headGroup);

        // Cou élancé proportionné à la tête affinée
        const neck = new THREE.Mesh(new THREE.CylinderGeometry(isFemale ? 0.041 : 0.049, isFemale ? 0.048 : 0.056, 0.105, 28), skinMat);
        neck.position.set(0, 0.022, -0.008);
        neck.castShadow = true;
        neck.receiveShadow = true;
        headGroup.add(neck);

        // Tête & visage continu 64×64 (R = 0.101 F / 0.106 M)
        const headGeo = createSculptedHeadGeometry(isFemale, sk);
        const head = new THREE.Mesh(headGeo, headSkinMat);
        head.position.set(0, 0.142, 0);
        head.castShadow = true;
        head.receiveShadow = true;
        headGroup.add(head);

        // Oreilles anatomiques proportionnées + clou d'oreille métal
        [-1, 1].forEach(side => {
            const earGroup = new THREE.Group();
            earGroup.position.set(side * (isFemale ? 0.091 : 0.096), 0.144, -0.006);
            earGroup.rotation.y = -side * 0.22;
            earGroup.rotation.z = -side * 0.06;

            const helix = new THREE.Mesh(new THREE.TorusGeometry(0.017, 0.006, 12, 22, Math.PI * 1.35), skinMat);
            helix.rotation.z = side < 0 ? Math.PI * 0.35 : -Math.PI * 0.35;
            helix.scale.set(0.74, 1.22, 0.8);
            earGroup.add(helix);

            const lobe = new THREE.Mesh(new THREE.SphereGeometry(0.0085, 12, 10), skinMat);
            lobe.position.set(0, -0.016, 0.002);
            earGroup.add(lobe);

            const stud = new THREE.Mesh(new THREE.SphereGeometry(0.0038, 10, 10), metalMat);
            stud.position.set(side * 0.004, -0.017, 0.008);
            earGroup.add(stud);

            headGroup.add(earGroup);
        });

        // ==========================================
        // 6. YEUX EN AMANDE NATURELS & EXPRESSIFS (Placés pile sur la surface z = 0.0958 F / 0.1014 M, tangents au visage)
        // ==========================================
        const irisHexList = ['#361e12', neonHex, '#6b2f0e', '#4a220f'];
        const irisTex = createIrisTexture(irisHexList[sIdx] || '#6b2f0e');
        // Matériaux oculaires haute-lisibilité (sans voile spéculaire gris sous la Key Light)
        const scleraMat = new THREE.MeshBasicMaterial({
            color: isFemale ? '#f7f3ee' : '#e6dfd5'
        });
        const irisDiscMat = new THREE.MeshBasicMaterial({
            map: irisTex
        });
        const lashDarkMat = new THREE.MeshBasicMaterial({
            color: '#09070a'
        });
        const browDarkMat = new THREE.MeshBasicMaterial({
            color: '#141015'
        });
        const catchlightMat = new THREE.MeshBasicMaterial({ color: '#ffffff' });

        [-1, 1].forEach(side => {
            const eyeSocketGrp = new THREE.Group();
            eyeSocketGrp.position.set(
                side * (isFemale ? 0.031 : 0.034),
                isFemale ? 0.149 : 0.159,
                isFemale ? 0.1005 : 0.1064
            );
            // Tangent à la courbure 3D horizontale et verticale du visage
            eyeSocketGrp.rotation.y = side * (isFemale ? 0.25 : 0.22);
            eyeSocketGrp.rotation.x = isFemale ? -0.14 : -0.06;
            headGroup.add(eyeSocketGrp);

            // Contour palpébral sombre en amande + ligne de cils supérieure bien marquée (2+ pixels d'épaisseur pour un rendu net)
            const eyeRim = new THREE.Mesh(new THREE.CircleGeometry(isFemale ? 0.0156 : 0.0144, 24), lashDarkMat);
            eyeRim.scale.set(1.04, isFemale ? 0.62 : 0.54, 1.0);
            eyeRim.position.set(0, isFemale ? 0.0011 : 0.0006, 0.0004);
            eyeSocketGrp.add(eyeRim);

            // Pointe d'eyeliner externe (Winged Lash féminin pour Beatmaker)
            if (isFemale) {
                const wingTip = new THREE.Mesh(new THREE.CircleGeometry(0.0042, 12), lashDarkMat);
                wingTip.scale.set(1.6, 0.55, 1.0);
                wingTip.rotation.z = side * 0.35;
                wingTip.position.set(side * 0.0145, 0.0028, 0.0005);
                eyeSocketGrp.add(wingTip);
            }

            // Groupe oculaire mobile pour micro-saccades (Eye_L / Eye_R)
            const eyeGrp = new THREE.Group();
            eyeGrp.name = side < 0 ? "Eye_L" : "Eye_R";
            eyeSocketGrp.add(eyeGrp);

            // Sclère blanche en amande bien contrastée par rapport au teint pêche doré
            const eyeball = new THREE.Mesh(new THREE.CircleGeometry(isFemale ? 0.0136 : 0.0126, 24), scleraMat);
            eyeball.scale.set(1.0, isFemale ? 0.48 : 0.46, 1.0);
            eyeball.position.set(0, -0.0002, 0.0008);
            eyeGrp.add(eyeball);

            // Grand iris profond + pupille noire (regard chaleureux et expressif)
            const irisDisc = new THREE.Mesh(new THREE.CircleGeometry(isFemale ? 0.0066 : 0.0058, 28), irisDiscMat);
            irisDisc.position.set(0, 0.0001, 0.0013);
            eyeGrp.add(irisDisc);

            // Double éclat cristallin (Catchlight principal + micro-reflet secondaire)
            const catch1 = new THREE.Mesh(new THREE.CircleGeometry(isFemale ? 0.0018 : 0.0013, 12), catchlightMat);
            catch1.position.set(0.0021, 0.0019, 0.0018);
            eyeGrp.add(catch1);
            if (isFemale) {
                const catch2 = new THREE.Mesh(new THREE.CircleGeometry(0.0009, 10), catchlightMat);
                catch2.position.set(-0.0020, -0.0016, 0.0018);
                eyeGrp.add(catch2);
            }

            // Paupière mobile pour le clignement (Eyelid_L / Eyelid_R) : repliée au repos, s'abaisse pendant le blink
            const eyelidPivot = new THREE.Group();
            eyelidPivot.name = side < 0 ? "Eyelid_L" : "Eyelid_R";
            eyelidPivot.position.set(0, 0.0066, 0.0022);
            eyelidPivot.scale.set(1, 0.04, 1);
            eyeSocketGrp.add(eyelidPivot);

            const blinkCover = new THREE.Mesh(new THREE.CircleGeometry(0.0142, 20), skinMat);
            blinkCover.scale.set(1.0, 0.52, 1.0);
            blinkCover.position.set(0, -0.0066, 0);
            eyelidPivot.add(blinkCover);

            // Sourcil 3D sculpté net et expressif
            const browGeo = new THREE.CapsuleGeometry(isFemale ? 0.0032 : 0.0040, isFemale ? 0.024 : 0.025, 8, 16);
            const bPos = browGeo.attributes.position;
            for (let bi = 0; bi < bPos.count; bi++) {
                const bx = bPos.getX(bi), by = bPos.getY(bi), bz = bPos.getZ(bi);
                const u = by / 0.017;
                const taper = Math.max(0.35, 1.0 - 0.45 * Math.max(0, side * u));
                const archY = -0.0024 * (u * u);
                const archZ = -0.0028 * (u * u);
                bPos.setXYZ(bi, bx * taper + archY, by, bz * taper + archZ);
            }
            browGeo.computeVertexNormals();
            const browMesh = new THREE.Mesh(browGeo, browDarkMat);
            browMesh.position.set(
                side * (isFemale ? 0.032 : 0.035),
                isFemale ? 0.163 : 0.175,
                isFemale ? 0.0980 : 0.1062
            );
            browMesh.rotation.z = Math.PI / 2 - side * (isFemale ? 0.05 : 0.06);
            browMesh.rotation.y = side * 0.24;
            headGroup.add(browMesh);
        });

        // Matériau capillaire volumétrique profond (noir corbeau / brun espresso riche, zéro reflet grisâtre !)
        const hairVolMat = new THREE.MeshPhysicalMaterial({
            color: hpPal.base,
            roughness: 0.54,
            metalness: 0.02,
            sheen: 0.45,
            sheenRoughness: 0.45,
            sheenColor: new THREE.Color(hpPal.high),
            clearcoat: 0.04,
            clearcoatRoughness: 0.5,
            normalMap: pbr.hairNormalMap,
            normalScale: new THREE.Vector2(0.42, 0.22),
            envMapIntensity: 0.20
        });

        // Fonction utilitaire : Génère une coque de barbe/barbiche/cheveux 3D conformée exactement à TOUS les reliefs du visage
        const createConformedFacialHairGeo = (phiMin, phiLen, thetaMin, thetaLen, thicknessOffset = 0.0024, grooveFreq = 44) => {
            const R = isFemale ? 0.100 : 0.106;
            const geo = new THREE.SphereGeometry(R, 36, 22, phiMin, phiLen, thetaMin, thetaLen);
            const pos = geo.attributes.position;
            const gauss2 = (x, cx, rx, y, cy, ry) => {
                const dx = (x - cx) / rx, dy = (y - cy) / ry;
                const d2 = dx * dx + dy * dy;
                return d2 > 9.0 ? 0.0 : Math.exp(-d2);
            };
            for (let i = 0; i < pos.count; i++) {
                let x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
                const ny = y / R;
                const nz = z / R;
                const nx = x / R;
                const nx2 = nx * nx;

                y *= isFemale ? 1.04 : 1.16;
                z *= isFemale ? 1.01 : 1.04;
                if (ny < 0.20) {
                    const jawT = Math.max(0, Math.min(1, (0.20 - ny) / 1.20));
                    x *= isFemale ? (1.0 - 0.27 * Math.pow(jawT, 1.35)) : (1.0 - 0.25 * Math.pow(jawT, 1.34));
                    if (nz > 0) z += (isFemale ? 0.0045 : 0.009) * Math.pow(jawT, 1.25) * Math.exp(-nx2 * 2.0);
                    if (ny < -0.58 && nz < 0.42) y += (-0.58 - ny) * (isFemale ? 0.022 : 0.016);
                } else {
                    x *= isFemale ? 0.93 : 0.91;
                }
                if (nz > 0.12) {
                    const frontMask = Math.min(1.0, (nz - 0.12) / 0.45);
                    const browRidge = (gauss2(nx, -0.34, 0.22, ny, 0.27, 0.085) + gauss2(nx, 0.34, 0.22, ny, 0.27, 0.085));
                    const upperLip = Math.min(1.1, (gauss2(nx, -0.060, 0.105, ny, -0.285, 0.044) + gauss2(nx, 0.060, 0.105, ny, -0.285, 0.044)) * 0.70);
                    const lowerLip = gauss2(nx, 0.0, 0.155, ny, -0.372, 0.048);
                    const chinBoss = gauss2(nx, 0.0, isFemale ? 0.16 : 0.22, ny, -0.60, 0.13);
                    z += (browRidge * (isFemale ? 0.002 : 0.006) + upperLip * 0.0075 + lowerLip * 0.0085 + chinBoss * 0.0075) * frontMask;
                }
                const groove = Math.sin(nx * grooveFreq) * 0.0007;
                const rLen = Math.sqrt(x * x + y * y + z * z) || 1;
                const push = thicknessOffset + groove;
                pos.setXYZ(i, x + (x / rLen) * push, y + (y / rLen) * push, z + (z / rLen) * push);
            }
            geo.computeVertexNormals();
            return geo;
        };

        // ==========================================
        // 7. CHEVEUX & BARBES 3D CONFORMÉS + ACCESSOIRES SIGNATURES (Ajustés à la tête R = 0.100/0.106)
        // ==========================================
        if (sIdx === 2) {
            // 1. STREET_MC : Casquette/Bonnet rouge (ou variante), Moustache arquée & Barbiche arrondie 3D conformées au visage
            // A. Moustache 3D conformée et arquée au-dessus de la lèvre supérieure
            const mustGeo = createConformedFacialHairGeo(Math.PI * 0.36, Math.PI * 0.28, Math.PI * 0.552, Math.PI * 0.026, 0.0025, 52);
            const mPos = mustGeo.attributes.position;
            for (let i = 0; i < mPos.count; i++) {
                const mx = mPos.getX(i), my = mPos.getY(i);
                // Courbe naturelle descendante aux commissures de la moustache
                mPos.setY(i, my - Math.pow(mx / 0.022, 2) * 0.0045);
            }
            mustGeo.computeVertexNormals();
            const mustMesh = new THREE.Mesh(mustGeo, hairVolMat);
            mustMesh.position.set(0, 0.142, 0);
            headGroup.add(mustMesh);

            // B. Mouche (Soul patch) conformée sous la lèvre inférieure
            const soulGeo = createConformedFacialHairGeo(Math.PI * 0.47, Math.PI * 0.06, Math.PI * 0.620, Math.PI * 0.024, 0.0024, 48);
            const soulMesh = new THREE.Mesh(soulGeo, hairVolMat);
            soulMesh.position.set(0, 0.142, 0);
            headGroup.add(soulMesh);

            // C. Barbiche (Goatee) 3D au contour arrondi épousant le menton (sans bord rectangulaire)
            const goateeGeo = createConformedFacialHairGeo(Math.PI * 0.34, Math.PI * 0.32, Math.PI * 0.68, Math.PI * 0.22, 0.0025, 48);
            const gPos = goateeGeo.attributes.position;
            for (let i = 0; i < gPos.count; i++) {
                const gx = gPos.getX(i), gy = gPos.getY(i);
                // Effilage doux des coins supérieurs de la barbiche
                if (gy > -0.090) {
                    const edgeDrop = Math.pow(gx / 0.028, 2) * 0.009;
                    gPos.setY(i, gy - edgeDrop);
                }
            }
            goateeGeo.computeVertexNormals();
            const goateeMesh = new THREE.Mesh(goateeGeo, hairVolMat);
            goateeMesh.position.set(0, 0.142, 0);
            goateeMesh.castShadow = true;
            headGroup.add(goateeMesh);

            // Tempes & nuque rasées sous la casquette (UNIQUEMENT à l'arrière et sur les côtés phiStart=0.85*PI..2.15*PI — JAMAIS sur le visage !)
            const fadeHair = new THREE.Mesh(
                new THREE.SphereGeometry(0.107, 24, 14, Math.PI * 0.85, Math.PI * 1.30, Math.PI * 0.25, Math.PI * 0.30),
                hairVolMat
            );
            fadeHair.scale.set(0.92, 1.15, 1.03);
            fadeHair.position.set(0, 0.142, 0);
            headGroup.add(fadeHair);

            // D. Casquette Streetwear Fitted rouge (ou couleur variante)
            const capMat = new THREE.MeshPhysicalMaterial({
                color: varSpec.cap || '#dc2626',
                roughness: 0.62,
                sheen: 0.48,
                sheenRoughness: 0.55,
                sheenColor: new THREE.Color(varSpec.cap || '#dc2626').offsetHSL(0, 0, 0.18),
                normalMap: pbr.cottonNormalMap,
                normalScale: new THREE.Vector2(0.55, 0.55)
            });

            const capGroup = new THREE.Group();
            capGroup.position.set(0, 0.184, -0.002);
            capGroup.rotation.x = -0.05;
            headGroup.add(capGroup);

            const capCrown = new THREE.Mesh(
                new THREE.SphereGeometry(0.110, 36, 24, 0, Math.PI * 2, 0, Math.PI * 0.54),
                capMat
            );
            capCrown.scale.set(0.95, 0.94, 1.06);
            capCrown.castShadow = true;
            capGroup.add(capCrown);

            const capBand = new THREE.Mesh(new THREE.TorusGeometry(0.105, 0.0085, 12, 36), capMat);
            capBand.rotation.x = Math.PI / 2;
            capBand.scale.set(0.95, 1.06, 1);
            capBand.position.set(0, 0.002, 0);
            capGroup.add(capBand);

            const topBtn = new THREE.Mesh(new THREE.SphereGeometry(0.0075, 12, 10), metalMat);
            topBtn.position.set(0, 0.104, 0);
            capGroup.add(topBtn);

            const capEmblem = new THREE.Mesh(new THREE.BoxGeometry(0.032, 0.021, 0.006), metalMat);
            capEmblem.position.set(0, 0.035, 0.112);
            capEmblem.rotation.x = -0.20;
            capGroup.add(capEmblem);

            const visorGeo = new THREE.BoxGeometry(0.172, 0.007, 0.090, 20, 2, 12);
            const vPos = visorGeo.attributes.position;
            for (let i = 0; i < vPos.count; i++) {
                const vx = vPos.getX(i), vy = vPos.getY(i), vz = vPos.getZ(i);
                const tFront = (vz + 0.045) / 0.090;
                const xScale = 1.0 - 0.19 * Math.pow(tFront, 1.85);
                const nx = vx * xScale;
                const archY = -0.017 * Math.pow(nx / 0.086, 2) - tFront * 0.011;
                vPos.setX(i, nx);
                vPos.setY(i, vy + archY);
            }
            visorGeo.computeVertexNormals();
            const visorMesh = new THREE.Mesh(visorGeo, capMat);
            visorMesh.position.set(0, 0.004, 0.132);
            visorMesh.castShadow = true;
            capGroup.add(visorMesh);

        } else if (sIdx === 0) {
            // 2. BEATMAKER : Femme, Cheveux Noirs Mi-Longs avec Frange Sculptée Continue (s'arrêtant AU-DESSUS des sourcils !) & Casque Audio
            // Calotte arrière & sommet du crâne (phiStart=0.78*PI..2.22*PI)
            const scalpBack = new THREE.Mesh(
                new THREE.SphereGeometry(0.104, 32, 20, Math.PI * 0.78, Math.PI * 1.44, 0, Math.PI * 0.58),
                hairVolMat
            );
            scalpBack.scale.set(0.96, 1.06, 1.04);
            scalpBack.position.set(0, 0.143, -0.002);
            headGroup.add(scalpBack);

            // A. FRANGE NOIRE SCULPTÉE CONTINUE SUR LE FRONT (épaisseur 6.2mm : 100% opaque d'une tempe à l'autre, zéro bande blanche !)
            const fringeGeo = createConformedFacialHairGeo(Math.PI * 0.06, Math.PI * 0.88, 0.0, Math.PI * 0.365, 0.0062, 48);
            const fPos = fringeGeo.attributes.position;
            for (let i = 0; i < fPos.count; i++) {
                const fx = fPos.getX(i), fy = fPos.getY(i), fz = fPos.getZ(i);
                const templeDrop = Math.pow(Math.min(1.0, Math.abs(fx) / 0.068), 2.4) * 0.012;
                const wispyNotch = Math.sin(fx * 110.0) * 0.0014;
                fPos.setY(i, fy - templeDrop + wispyNotch);
                // Pousse légèrement en +Z lors de la descente pour ne jamais passer sous la peau du front !
                if (fz > 0) fPos.setZ(i, fz + templeDrop * 0.48);
            }
            fringeGeo.computeVertexNormals();
            const fringeMesh = new THREE.Mesh(fringeGeo, hairVolMat);
            fringeMesh.position.set(0, 0.142, 0);
            fringeMesh.castShadow = true;
            headGroup.add(fringeMesh);

            // B. CARRÉ MI-LONG NOIR CONTINU (Rideau capillaire latéral & arrière encadrant le visage sans trou aux tempes)
            const bobCurtainGeo = new THREE.CylinderGeometry(0.095, 0.112, 0.205, 44, 18, true, Math.PI * 0.25, Math.PI * 1.50);
            const bPos = bobCurtainGeo.attributes.position;
            for (let i = 0; i < bPos.count; i++) {
                let x = bPos.getX(i), y = bPos.getY(i), z = bPos.getZ(i);
                const t = (0.1025 - y) / 0.205;
                const ang = Math.atan2(x, z);
                const crownCurve = t < 0.35 ? Math.sin((t / 0.35) * Math.PI * 0.5) : 1.0;
                const flare = 0.88 + 0.12 * crownCurve + Math.pow(t, 1.8) * 0.08;
                const strandWave = 1.0 + Math.sin(ang * 24.0) * 0.022;
                bPos.setXYZ(i, x * flare * strandWave, y, z * flare * strandWave);
            }
            bobCurtainGeo.computeVertexNormals();
            const bobCurtainMat = hairVolMat.clone();
            bobCurtainMat.side = THREE.DoubleSide;
            const bobCurtain = new THREE.Mesh(bobCurtainGeo, bobCurtainMat);
            bobCurtain.position.set(0, 0.102, -0.004);
            bobCurtain.castShadow = true;
            headGroup.add(bobCurtain);

            // Deux mèches latérales encadrant finement les côtés de la mâchoire (x = ±0.082)
            [-1, 1].forEach(side => {
                const sideLock = new THREE.Mesh(
                    createVolumetricHairLock(0.015, 0.175, 0.005, -side * 0.005, 0.55),
                    hairVolMat
                );
                sideLock.position.set(side * 0.082, 0.178, 0.018);
                sideLock.rotation.y = side * 0.52;
                sideLock.castShadow = true;
                headGroup.add(sideLock);
            });

            // C. CASQUE AUDIO MONITORING STUDIO (Proportionné à la tête R = 0.101)
            const hpGroup = new THREE.Group();
            const hpColor = varSpec.hp || '#14161b';
            const hpShellMat = new THREE.MeshPhysicalMaterial({
                color: hpColor,
                roughness: 0.28,
                metalness: 0.32,
                clearcoat: 0.55,
                clearcoatRoughness: 0.25,
                envMapIntensity: 1.5
            });
            const velourPadMat = new THREE.MeshPhysicalMaterial({
                color: '#15171e',
                roughness: 0.88,
                sheen: 0.65,
                sheenColor: new THREE.Color('#334155'),
                normalMap: pbr.leatherNormalMap,
                normalScale: new THREE.Vector2(0.35, 0.35)
            });

            const headband = new THREE.Mesh(new THREE.TorusGeometry(0.116, 0.010, 14, 36, Math.PI * 0.94), hpShellMat);
            headband.rotation.z = Math.PI * 0.03;
            headband.position.set(0, 0.162, -0.006);
            headband.castShadow = true;
            hpGroup.add(headband);

            [-1, 1].forEach(side => {
                const slider = new THREE.Mesh(new THREE.CylinderGeometry(0.0040, 0.0040, 0.050, 14), metalMat);
                slider.position.set(side * 0.115, 0.152, -0.006);
                hpGroup.add(slider);

                const earPad = new THREE.Mesh(new THREE.TorusGeometry(0.028, 0.011, 16, 28), velourPadMat);
                earPad.rotation.y = Math.PI / 2;
                earPad.scale.set(1.18, 0.95, 1);
                earPad.position.set(side * 0.101, 0.138, -0.006);
                hpGroup.add(earPad);

                const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.034, 0.029, 0.022, 28), hpShellMat);
                cup.rotation.z = Math.PI / 2;
                cup.scale.set(1.18, 1, 0.95);
                cup.position.set(side * 0.113, 0.138, -0.006);
                cup.castShadow = true;
                hpGroup.add(cup);

                const metalRing = new THREE.Mesh(new THREE.TorusGeometry(0.028, 0.0035, 12, 28), metalMat);
                metalRing.rotation.y = Math.PI / 2;
                metalRing.scale.set(1.18, 0.95, 1);
                metalRing.position.set(side * 0.124, 0.138, -0.006);
                hpGroup.add(metalRing);

                const studioCore = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.005, 20), accentMat);
                studioCore.rotation.z = Math.PI / 2;
                studioCore.position.set(side * 0.125, 0.138, -0.006);
                hpGroup.add(studioCore);
            });
            headGroup.add(hpGroup);

        } else if (sIdx === 1) {
            // 3. CYBER-DJ : Coiffure texturée 3D & Visor Cyan (LED émissives + verre réfléchissant ajusté à R = 0.106)
            const crownHairGeo = createConformedFacialHairGeo(0, Math.PI * 2, 0, Math.PI * 0.36, 0.0040, 56);
            const crownHair = new THREE.Mesh(crownHairGeo, hairVolMat);
            crownHair.position.set(0, 0.142, 0);
            crownHair.castShadow = true;
            headGroup.add(crownHair);

            // Barbiche fine 3D conformée au menton
            const cyberGoateeGeo = createConformedFacialHairGeo(Math.PI * 0.40, Math.PI * 0.20, Math.PI * 0.69, Math.PI * 0.20, 0.0022, 48);
            const cyberGoatee = new THREE.Mesh(cyberGoateeGeo, hairVolMat);
            cyberGoatee.position.set(0, 0.142, 0);
            headGroup.add(cyberGoatee);

            const visorGlassMat = new THREE.MeshPhysicalMaterial({
                color: '#040a14',
                emissive: neonHex,
                emissiveIntensity: 0.35,
                roughness: 0.03,
                metalness: 0.55,
                clearcoat: 1.0,
                clearcoatRoughness: 0.02,
                envMapIntensity: 2.5,
                transparent: true,
                opacity: 0.90
            });
            const neonFrameMat = new THREE.MeshPhysicalMaterial({
                color: neonHex,
                emissive: neonHex,
                emissiveIntensity: 2.1,
                roughness: 0.12
            });

            const buildCurvedVisorStrip = (w, h, d, yOff, zOff, mat) => {
                const geo = new THREE.BoxGeometry(w, h, d, 28, 4, 2);
                const pos = geo.attributes.position;
                for (let i = 0; i < pos.count; i++) {
                    const vx = pos.getX(i), vy = pos.getY(i), vz = pos.getZ(i);
                    const normX = vx / (w * 0.5);
                    const bendZ = -0.056 * (normX * normX);
                    const noseNotch = (vy < 0 && Math.abs(normX) < 0.26) ? (0.008 * (1 - Math.abs(normX) / 0.26)) : 0;
                    pos.setZ(i, vz + bendZ);
                    pos.setY(i, vy + noseNotch);
                }
                geo.computeVertexNormals();
                const m = new THREE.Mesh(geo, mat);
                m.position.set(0, yOff, zOff);
                return m;
            };

            const visorShield = buildCurvedVisorStrip(0.196, 0.042, 0.008, 0.158, 0.113, visorGlassMat);
            const visorTopBar = buildCurvedVisorStrip(0.199, 0.0050, 0.010, 0.180, 0.114, neonFrameMat);
            const visorBotBar = buildCurvedVisorStrip(0.193, 0.0035, 0.009, 0.137, 0.114, neonFrameMat);
            const visorHudLine = buildCurvedVisorStrip(0.136, 0.0020, 0.009, 0.158, 0.115, neonFrameMat);
            headGroup.add(visorShield, visorTopBar, visorBotBar, visorHudLine);

            [-1, 1].forEach(side => {
                const templeArm = new THREE.Mesh(new THREE.BoxGeometry(0.008, 0.011, 0.072), metalMat);
                templeArm.position.set(side * 0.096, 0.160, 0.024);
                headGroup.add(templeArm);
            });

        } else if (sIdx === 3) {
            // 4. PRODUCER : Homme, Lunettes de Soleil Réfléchissantes, Barbe 3D Conformée & Coiffure Texturée (R = 0.106)
            // A. CHEVELURE COIFFÉE SCULPTÉE CONTINUE (Coupe dégradée propre sans cornes sur le front)
            const prodHairGeo = createConformedFacialHairGeo(0, Math.PI * 2, 0, Math.PI * 0.37, 0.0042, 52);
            const prodHair = new THREE.Mesh(prodHairGeo, hairVolMat);
            prodHair.position.set(0, 0.142, 0);
            prodHair.castShadow = true;
            headGroup.add(prodHair);

            // B. BARBE COMPLÈTE & MOUSTACHE 3D CONFORMÉES AU VISAGE (avec découpe nette autour des lèvres)
            const mustArch = new THREE.Mesh(
                new THREE.TorusGeometry(0.018, 0.0040, 10, 24, Math.PI * 0.84),
                hairVolMat
            );
            mustArch.rotation.z = Math.PI * 0.08;
            mustArch.scale.set(1.06, 0.60, 0.85);
            mustArch.position.set(0, 0.109, 0.1128);
            headGroup.add(mustArch);

            const prodSoulPatch = new THREE.Mesh(new THREE.CapsuleGeometry(0.0028, 0.007, 8, 12), hairVolMat);
            prodSoulPatch.position.set(0, 0.093, 0.1146);
            prodSoulPatch.rotation.x = 0.15;
            headGroup.add(prodSoulPatch);

            const fullBeardGeo = createConformedFacialHairGeo(Math.PI * 0.08, Math.PI * 0.84, Math.PI * 0.54, Math.PI * 0.36, 0.0032, 54);
            const fbPos = fullBeardGeo.attributes.position;
            for (let i = 0; i < fbPos.count; i++) {
                const bx = fbPos.getX(i), by = fbPos.getY(i), bz = fbPos.getZ(i);
                // Découpe anatomique sous la bouche pour dégager la lèvre inférieure
                if (bz > 0.05 && by > -0.055) {
                    const mouthDip = Math.exp(-Math.pow(bx / 0.032, 2)) * Math.max(0, (by + 0.055) / 0.045);
                    fbPos.setY(i, by - mouthDip * 0.022);
                }
            }
            fullBeardGeo.computeVertexNormals();
            const fullBeard = new THREE.Mesh(fullBeardGeo, hairVolMat);
            fullBeard.position.set(0, 0.142, 0);
            fullBeard.castShadow = true;
            headGroup.add(fullBeard);

            // C. LUNETTES DE SOLEIL RÉFLÉCHISSANTES HAUTE COUTURE (Ajustées à R = 0.106)
            const lensMat = new THREE.MeshPhysicalMaterial({
                color: varSpec.shades || '#07090e',
                roughness: 0.02,
                metalness: 0.82,
                clearcoat: 1.0,
                clearcoatRoughness: 0.01,
                envMapIntensity: 2.6,
                reflectivity: 1.0
            });

            const shadesGroup = new THREE.Group();
            shadesGroup.position.set(0, 0.159, 0.111);

            [-1, 1].forEach(side => {
                const lens = new THREE.Mesh(new THREE.BoxGeometry(0.048, 0.032, 0.005), lensMat);
                lens.position.set(side * 0.036, 0, 0);
                lens.rotation.y = -side * 0.14;
                lens.castShadow = true;
                shadesGroup.add(lens);

                const rimTop = new THREE.Mesh(new THREE.BoxGeometry(0.051, 0.0032, 0.0065), metalMat);
                rimTop.position.set(side * 0.036, 0.016, 0.001);
                rimTop.rotation.y = -side * 0.14;
                shadesGroup.add(rimTop);

                const rimBot = new THREE.Mesh(new THREE.BoxGeometry(0.049, 0.0025, 0.006), metalMat);
                rimBot.position.set(side * 0.036, -0.016, 0.001);
                rimBot.rotation.y = -side * 0.14;
                shadesGroup.add(rimBot);

                const rimOuter = new THREE.Mesh(new THREE.BoxGeometry(0.0032, 0.034, 0.0065), metalMat);
                rimOuter.position.set(side * 0.060, 0, -0.003);
                shadesGroup.add(rimOuter);

                const temple = new THREE.Mesh(new THREE.CylinderGeometry(0.0022, 0.0022, 0.088, 10), metalMat);
                temple.rotation.x = Math.PI / 2;
                temple.position.set(side * 0.078, 0.004, -0.044);
                temple.rotation.y = -side * 0.15;
                shadesGroup.add(temple);
            });

            const topBridge = new THREE.Mesh(new THREE.CylinderGeometry(0.0024, 0.0024, 0.034, 12), metalMat);
            topBridge.rotation.z = Math.PI / 2;
            topBridge.position.set(0, 0.014, 0.003);
            shadesGroup.add(topBridge);

            const noseBridgeBar = new THREE.Mesh(new THREE.CylinderGeometry(0.0020, 0.0020, 0.024, 12), metalMat);
            noseBridgeBar.rotation.z = Math.PI / 2;
            noseBridgeBar.position.set(0, 0.003, 0.004);
            shadesGroup.add(noseBridgeBar);

            headGroup.add(shadesGroup);
        }

        return group;
    }

        // ==========================================
        // ANIMATION IDLE VIVANTE AAA (Respiration, Clignements aléatoires, Micro-saccades, Balancement tête & Poids du corps)
        // ==========================================
        window.updateAvatarIdleAnimation = function(group, tSec, seed = 0) {
            if (!group) return;
            const t = tSec + seed * 3.17;

            // 1. Respiration thoracique (~0.28 Hz) & léger mouvement d'épaules
            const breath = Math.sin(t * 1.75) * 0.5 + 0.5; // 0..1
            const chest = group.getObjectByName("ChestBreathing");
            if (chest) {
                chest.scale.set(1.0 + breath * 0.010, 1.0 + breath * 0.005, 1.0 + breath * 0.020);
            }
            const armL = group.getObjectByName("Arm_L");
            const armR = group.getObjectByName("Arm_R");
            if (armL) {
                armL.position.y = 1.032 + breath * 0.0028;
                armL.rotation.z = -0.015 - breath * 0.010;
            }
            if (armR) {
                armR.position.y = 1.032 + breath * 0.0028;
                armR.rotation.z = 0.015 + breath * 0.010;
            }

            // 2. Poids du corps (Weight shift lent) sur le Torso
            const torso = group.getObjectByName("Torso");
            if (torso) {
                const sway = Math.sin(t * 0.62) * 0.012 + Math.cos(t * 0.37) * 0.007;
                torso.rotation.z = sway;
                torso.rotation.y = Math.sin(t * 0.48) * 0.022;
            }

            // 3. Balancement organique de la tête
            const headGrp = group.getObjectByName("HeadGroup");
            if (headGrp) {
                const baseYaw = (typeof group.userData.baseHeadYaw === 'number') ? group.userData.baseHeadYaw : 0.14;
                const basePitch = (typeof group.userData.baseHeadPitch === 'number') ? group.userData.baseHeadPitch : -0.02;
                headGrp.rotation.y = baseYaw + Math.sin(t * 0.85) * 0.042 + Math.cos(t * 0.51) * 0.020;
                headGrp.rotation.x = basePitch + Math.sin(t * 1.15) * 0.018 + breath * 0.012;
                headGrp.rotation.z = Math.sin(t * 0.68 + 1.1) * 0.020;
            }

            // 4. Clignements de paupières aléatoires naturels (120ms toutes les ~3.2s + double-blink occasionnel)
            const cycle = (t * 0.32) % 1.0;
            const subCycle = (t * 0.19) % 1.0;
            let blink = 0.0;
            if (cycle < 0.042) {
                blink = Math.sin((cycle / 0.042) * Math.PI);
            } else if (subCycle > 0.72 && cycle > 0.055 && cycle < 0.095) {
                blink = Math.sin(((cycle - 0.055) / 0.040) * Math.PI) * 0.9;
            }
            const lidL = group.getObjectByName("Eyelid_L");
            const lidR = group.getObjectByName("Eyelid_R");
            const lidScaleY = 0.05 + blink * 0.95;
            if (lidL) lidL.scale.y = lidScaleY;
            if (lidR) lidR.scale.y = lidScaleY;

            // 5. Micro-saccades oculaires subtiles
            const sacSlot = Math.floor(t * 0.85);
            const sacFrac = Math.min(1.0, ((t * 0.85) % 1.0) * 8.0);
            const prevYaw = Math.sin(sacSlot * 12.9898) * 0.024;
            const nextYaw = Math.sin((sacSlot + 1) * 12.9898) * 0.024;
            const prevPitch = Math.cos(sacSlot * 78.233) * 0.014;
            const nextPitch = Math.cos((sacSlot + 1) * 78.233) * 0.014;
            const eyeYaw = prevYaw + (nextYaw - prevYaw) * sacFrac;
            const eyePitch = prevPitch + (nextPitch - prevPitch) * sacFrac;
            const eyeL = group.getObjectByName("Eye_L");
            const eyeR = group.getObjectByName("Eye_R");
            if (eyeL) { eyeL.rotation.y = eyeYaw; eyeL.rotation.x = eyePitch; }
            if (eyeR) { eyeR.rotation.y = eyeYaw; eyeR.rotation.x = eyePitch; }
        };

        // ==========================================
        // GÉNÉRATION DE L'IMAGE PORTRAIT 85MM AAA (SETUP 3-POINTS SOFTBOX + ENV MAP HDR + CONTACT SHADOWS)
        // ==========================================
        function getSharedAvatarRenderer() {
            if (!window._sharedAvatarRenderer) {
                const rnd = new THREE.WebGLRenderer({
                    antialias: true,
                    alpha: false,
                    preserveDrawingBuffer: true
                });
                if (typeof THREE.ACESFilmicToneMapping !== 'undefined') {
                    rnd.toneMapping = THREE.ACESFilmicToneMapping;
                    rnd.toneMappingExposure = 1.18;
                }
                rnd.shadowMap.enabled = true;
                if (typeof THREE.PCFSoftShadowMap !== 'undefined') {
                    rnd.shadowMap.type = THREE.PCFSoftShadowMap;
                }
                window._sharedAvatarRenderer = rnd;
            }
            return window._sharedAvatarRenderer;
        }

        function buildAvatarPortraitStudioScene(styleIndex, resolvedTier, variant) {
            const varSpec = window.getAvatarVariantSpec ? window.getAvatarVariantSpec(resolvedTier, variant) : null;
            const scn = new THREE.Scene();

            // Fond de studio dégradé radial cinématique avec halo coloré conservé
            const bgCol = (varSpec && varSpec.bg) || '#11131a';
            const accentCol = (varSpec && (varSpec.glow || varSpec.accent)) || '#818cf8';
            const bgKey = `${bgCol}_${accentCol}`;
            if (!window._avatarStudioBgCache) window._avatarStudioBgCache = {};
            if (!window._avatarStudioBgCache[bgKey]) {
                const bgCanvas = document.createElement('canvas');
                bgCanvas.width = 256; bgCanvas.height = 256;
                const bCtx = bgCanvas.getContext('2d');
                bCtx.fillStyle = bgCol;
                bCtx.fillRect(0, 0, 256, 256);

                const grad = bCtx.createRadialGradient(128, 102, 10, 128, 128, 155);
                grad.addColorStop(0, accentCol + '55');
                grad.addColorStop(0.52, bgCol);
                grad.addColorStop(1, '#040508');
                bCtx.fillStyle = grad;
                bCtx.fillRect(0, 0, 256, 256);

                window._avatarStudioBgCache[bgKey] = new THREE.CanvasTexture(bgCanvas);
            }
            scn.background = window._avatarStudioBgCache[bgKey];

            const rnd = getSharedAvatarRenderer();
            const envTex = getAvatarStudioEnvMap(rnd);
            if (envTex) scn.environment = envTex;

            // Setup 3-Points Softbox + Ombres de contact douces
            // 1. Key Softbox chaude (avec shadowMap de contact haute précision)
            const keyLight = new THREE.DirectionalLight(0xfff6ec, 2.45);
            keyLight.position.set(1.8, 2.4, 2.5);
            keyLight.castShadow = true;
            keyLight.shadow.mapSize.width = 512;
            keyLight.shadow.mapSize.height = 512;
            keyLight.shadow.camera.near = 0.5;
            keyLight.shadow.camera.far = 7.0;
            keyLight.shadow.camera.left = -0.65;
            keyLight.shadow.camera.right = 0.65;
            keyLight.shadow.camera.top = 1.65;
            keyLight.shadow.camera.bottom = 0.55;
            keyLight.shadow.bias = -0.0012;
            keyLight.shadow.radius = 3.0;
            scn.add(keyLight);

            // 2. Fill Light douce froide
            const fillLight = new THREE.DirectionalLight(0x93c5fd, 0.92);
            fillLight.position.set(-2.4, 1.3, 1.9);
            scn.add(fillLight);

            // 3. Rim Light colorée par la variante + Rim chaude opposée
            const rimLight = new THREE.DirectionalLight(new THREE.Color(accentCol), 3.1);
            rimLight.position.set(-1.7, 2.2, -2.2);
            scn.add(rimLight);

            const rimLightWarm = new THREE.DirectionalLight(0xfef3c7, 1.55);
            rimLightWarm.position.set(1.8, 2.1, -2.0);
            scn.add(rimLightWarm);

            // 4. Catchlight frontale pour cornée, lunettes, visor et chaîne
            const catchLight = new THREE.PointLight(0xffffff, 0.85, 5);
            catchLight.position.set(0.30, 1.30, 1.85);
            scn.add(catchLight);

            scn.add(new THREE.AmbientLight(0x64748b, 0.72));

            const group = createAvatarGroup(styleIndex, resolvedTier, variant);
            group.rotation.y = -0.26;
            group.userData.baseHeadYaw = 0.14;
            group.userData.baseHeadPitch = -0.02;
            const headGrp = group.getObjectByName("HeadGroup");
            if (headGrp) {
                headGrp.rotation.y = 0.14;
                headGrp.rotation.x = -0.02;
            }
            scn.add(group);

            return { scn, group };
        }

        function generateAvatarImage(styleIndex, tier = 1, variant = 0, size = 420) {
            // Objectif Téléobjectif Portrait 85mm (FOV 23°) — Cadrage Buste Harmonieux (tête et buste respirant dans le cadre)
            const cam = new THREE.PerspectiveCamera(23, 1, 0.1, 100);
            cam.position.set(0, 1.09, 1.84);
            cam.lookAt(0, 1.05, 0);

            const resolvedTier = (tier !== null && tier !== undefined)
                ? Math.max(1, Math.min(4, parseInt(tier, 10) || 1))
                : (MODEL_TO_TIER[styleIndex] || 1);

            const rnd = getSharedAvatarRenderer();
            rnd.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2.0));
            rnd.setSize(size, size, false);

            const { scn } = buildAvatarPortraitStudioScene(styleIndex, resolvedTier, variant);
            rnd.render(scn, cam);

            return rnd.domElement.toDataURL('image/png', 0.96);
        }
        window.generateAvatarImage = generateAvatarImage;

        // ==========================================
        // BOUCLE LIVE 60 FPS SUR LA CARTE SÉLECTIONNÉE (Animation Idle Temps Réel + Transition Fluide)
        // ==========================================
        window._liveCardRig = null;
        window.mountLiveAvatarOnSelectedCard = function(charIdx, tier, variant, containerSelector = '#avatar-container .avatar-sel.selected') {
            const targetCard = document.querySelector(containerSelector);
            if (!targetCard) return;

            let liveCanvas = targetCard.querySelector('canvas.avatar-live-canvas');
            if (!liveCanvas) {
                liveCanvas = document.createElement('canvas');
                liveCanvas.width = 360;
                liveCanvas.height = 360;
                liveCanvas.className = 'avatar-live-canvas absolute inset-0 w-full h-full object-cover pointer-events-none opacity-0 transition-opacity duration-300';
                targetCard.insertBefore(liveCanvas, targetCard.firstChild ? targetCard.firstChild.nextSibling : null);
                requestAnimationFrame(() => { liveCanvas.style.opacity = '1'; });
            }

            const rigKey = `${charIdx}_${tier}_${variant}`;
            if (!window._liveCardRig || window._liveCardRig.key !== rigKey) {
                const { scn, group } = buildAvatarPortraitStudioScene(charIdx, tier, variant);
                const cam = new THREE.PerspectiveCamera(23, 1, 0.1, 100);
                cam.position.set(0, 1.09, 1.84);
                cam.lookAt(0, 1.05, 0);
                window._liveCardRig = {
                    key: rigKey,
                    scn,
                    group,
                    cam,
                    switchTime: performance.now() * 0.001,
                    seed: tier * 1.7 + variant * 2.3
                };
            }
            window._liveCardRig.targetCanvas = liveCanvas;

            if (!window._liveCardLoopRunning) {
                window._liveCardLoopRunning = true;
                const tickLiveCard = (nowMs) => {
                    const loginEl = document.getElementById('login-screen');
                    const modalEl = document.getElementById('avatar-variant-modal');
                    const loginVis = loginEl && loginEl.style.display !== 'none';
                    const modalVis = modalEl && !modalEl.classList.contains('hidden');
                    if (!loginVis && !modalVis) {
                        window._liveCardLoopRunning = false;
                        return;
                    }
                    const rig = window._liveCardRig;
                    if (rig && rig.targetCanvas && rig.targetCanvas.isConnected) {
                        const tSec = nowMs * 0.001;
                        window.updateAvatarIdleAnimation(rig.group, tSec, rig.seed);
                        // Transition douce d'orientation lors d'un changement de variante
                        const dtSwitch = Math.min(1.0, (tSec - rig.switchTime) * 3.2);
                        const ease = 1.0 - Math.pow(1.0 - dtSwitch, 3);
                        rig.group.rotation.y = -0.44 + ease * 0.18;

                        const rnd = getSharedAvatarRenderer();
                        rnd.setPixelRatio(1.25);
                        rnd.setSize(360, 360, false);
                        rnd.render(rig.scn, rig.cam);

                        const ctx2d = rig.targetCanvas.getContext('2d');
                        if (ctx2d) {
                            ctx2d.clearRect(0, 0, 360, 360);
                            ctx2d.drawImage(rnd.domElement, 0, 0, 360, 360);
                        }
                    }
                    requestAnimationFrame(tickLiveCard);
                };
                requestAnimationFrame(tickLiveCard);
            }
        };

        // ==========================================
        // VITRINE 3D GRAND FORMAT SUR L'ÉCRAN D'ACCUEIL (EFFET GTA 6)
        // ==========================================
        window._loginHeroRig = null;
        window.mountLoginHeroAvatar = function(charIdx, tier, variant) {
            const stage = document.getElementById('login-hero-stage');
            const canvas = document.getElementById('login-hero-canvas');
            if (!stage || !canvas) return;

            const resolvedTier = Math.max(1, Math.min(4, parseInt(tier, 10) || 1));
            const resolvedVar = Math.max(0, Math.min(3, parseInt(variant, 10) || 0));
            const meta = (typeof AVATAR_TIER_META !== 'undefined' && AVATAR_TIER_META[resolvedTier]) || { charName: 'Street_MC' };
            const varSpec = window.getAvatarVariantSpec ? window.getAvatarVariantSpec(resolvedTier, resolvedVar) : null;
            const accentCol = (varSpec && (varSpec.accent || varSpec.glow)) || '#f59e0b';

            // Mise à jour du halo lumineux et du cartouche éditorial GTA 6
            const glowEl = document.getElementById('login-hero-glow');
            if (glowEl) glowEl.style.background = accentCol;
            const calloutEl = document.getElementById('login-hero-callout');
            if (calloutEl) calloutEl.style.borderColor = accentCol;
            const tierEl = document.getElementById('login-hero-tier');
            if (tierEl) tierEl.textContent = resolvedTier === 4 ? 'STUDIO 42E PRO · PALIER MAX' : `NIVEAU ${resolvedTier} · PALIER ACTIF`;
            const nameEl = document.getElementById('login-hero-name');
            if (nameEl) nameEl.textContent = (meta.charName || 'AVATAR').replace(/_/g, ' ');
            const dotEl = document.getElementById('login-hero-dot');
            if (dotEl) { dotEl.style.background = accentCol; dotEl.style.color = accentCol; }
            const varEl = document.getElementById('login-hero-variant');
            if (varEl) varEl.textContent = (varSpec && varSpec.name) ? varSpec.name.toUpperCase() : 'CLASSIQUE';

            if (!window._loginHeroRenderer) {
                const heroRnd = new THREE.WebGLRenderer({
                    canvas: canvas,
                    antialias: true,
                    alpha: true,
                    premultipliedAlpha: true,
                    powerPreference: 'high-performance'
                });
                heroRnd.setClearColor(0x000000, 0);
                if (typeof THREE.ACESFilmicToneMapping !== 'undefined') {
                    heroRnd.toneMapping = THREE.ACESFilmicToneMapping;
                    heroRnd.toneMappingExposure = 1.18;
                }
                heroRnd.shadowMap.enabled = true;
                if (typeof THREE.PCFSoftShadowMap !== 'undefined') {
                    heroRnd.shadowMap.type = THREE.PCFSoftShadowMap;
                }
                window._loginHeroRenderer = heroRnd;
            }
            const heroRnd = window._loginHeroRenderer;

            const heroKey = `${charIdx}_${resolvedTier}_${resolvedVar}`;
            if (!window._loginHeroRig || window._loginHeroRig.key !== heroKey) {
                const scn = new THREE.Scene();
                scn.background = null;

                const envTex = getAvatarStudioEnvMap(heroRnd);
                if (envTex) scn.environment = envTex;

                // Setup 3-points Cinéma GTA 6 dédié au plan 3/4 grand format
                const keyLight = new THREE.DirectionalLight(0xfff6ec, 2.55);
                keyLight.position.set(1.9, 2.5, 2.6);
                keyLight.castShadow = true;
                keyLight.shadow.mapSize.width = 512;
                keyLight.shadow.mapSize.height = 512;
                keyLight.shadow.camera.near = 0.5;
                keyLight.shadow.camera.far = 7.5;
                keyLight.shadow.camera.left = -0.75;
                keyLight.shadow.camera.right = 0.75;
                keyLight.shadow.camera.top = 1.65;
                keyLight.shadow.camera.bottom = 0.15;
                keyLight.shadow.bias = -0.0012;
                keyLight.shadow.radius = 3.0;
                scn.add(keyLight);

                const fillLight = new THREE.DirectionalLight(0x93c5fd, 0.96);
                fillLight.position.set(-2.4, 1.35, 1.9);
                scn.add(fillLight);

                const rimLight = new THREE.DirectionalLight(new THREE.Color(accentCol), 3.45);
                rimLight.position.set(-1.9, 2.15, -2.0);
                scn.add(rimLight);

                const rimLightWarm = new THREE.DirectionalLight(0xfef3c7, 1.65);
                rimLightWarm.position.set(1.9, 2.05, -1.9);
                scn.add(rimLightWarm);

                const catchLight = new THREE.PointLight(0xffffff, 0.90, 5.5);
                catchLight.position.set(0.32, 1.28, 1.95);
                scn.add(catchLight);

                scn.add(new THREE.AmbientLight(0x64748b, 0.74));

                const group = createAvatarGroup(charIdx, resolvedTier, resolvedVar);
                group.rotation.y = -0.30;
                group.position.set(-0.04, 0, 0);
                group.userData.baseHeadYaw = 0.20;
                group.userData.baseHeadPitch = -0.02;
                const headGrp = group.getObjectByName("HeadGroup");
                if (headGrp) {
                    headGrp.rotation.y = 0.20;
                    headGrp.rotation.x = -0.02;
                }
                scn.add(group);

                const prevMX = window._loginHeroRig ? window._loginHeroRig.smoothMX : 0;
                const prevMY = window._loginHeroRig ? window._loginHeroRig.smoothMY : 0;

                // Cadrage Héroïque GTA 6 (Buste / Taille-Haute avec respiration en haut & fondu doux en bas)
                const cam = new THREE.PerspectiveCamera(24, 1, 0.1, 100);
                cam.position.set(0, 1.07, 1.98);
                cam.lookAt(0, 1.04, 0);

                window._loginHeroRig = {
                    key: heroKey,
                    scn,
                    group,
                    cam,
                    switchTime: performance.now() * 0.001,
                    seed: resolvedTier * 2.1 + resolvedVar * 3.1 + 0.7,
                    smoothMX: prevMX,
                    smoothMY: prevMY,
                    lastW: 0,
                    lastH: 0
                };
            }

            if (!window._loginHeroLoopRunning) {
                window._loginHeroLoopRunning = true;
                const tickLoginHero = (nowMs) => {
                    const loginEl = document.getElementById('login-screen');
                    if (!loginEl || loginEl.style.display === 'none') {
                        window._loginHeroLoopRunning = false;
                        return;
                    }
                    const st = document.getElementById('login-hero-stage');
                    const rig = window._loginHeroRig;
                    const rnd = window._loginHeroRenderer;
                    if (st && rig && rnd) {
                        const rect = st.getBoundingClientRect();
                        const w = Math.round(rect.width);
                        const h = Math.round(rect.height);
                        if (w > 40 && h > 40) {
                            if (w !== rig.lastW || h !== rig.lastH) {
                                rig.lastW = w;
                                rig.lastH = h;
                                rnd.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2.0));
                                rnd.setSize(w, h, false);
                                rig.cam.aspect = w / h;
                                rig.cam.updateProjectionMatrix();
                            }

                            const tSec = nowMs * 0.001;
                            const targetMX = typeof window._loginMouseX === 'number' ? window._loginMouseX : 0;
                            const targetMY = typeof window._loginMouseY === 'number' ? window._loginMouseY : 0;
                            rig.smoothMX += (targetMX - rig.smoothMX) * 0.08;
                            rig.smoothMY += (targetMY - rig.smoothMY) * 0.08;

                            rig.group.userData.baseHeadYaw = 0.20 + rig.smoothMX * 0.11;
                            rig.group.userData.baseHeadPitch = -0.02 + rig.smoothMY * 0.05;
                            window.updateAvatarIdleAnimation(rig.group, tSec, rig.seed);

                            // Entrée dynamique GTA lors d'un changement de personnage / variante
                            const dtSwitch = Math.min(1.0, (tSec - rig.switchTime) * 2.8);
                            const ease = 1.0 - Math.pow(1.0 - dtSwitch, 3);
                            rig.group.rotation.y = (-0.54 + ease * 0.24) + rig.smoothMX * 0.14;
                            rig.group.position.y = -0.035 * (1.0 - ease);

                            rnd.render(rig.scn, rig.cam);
                        }
                    }
                    requestAnimationFrame(tickLoginHero);
                };
                requestAnimationFrame(tickLoginHero);
            }
        };

        globalThis.avatars = [];
        function initAvatars() {
            if (globalThis.avatars.length > 0) return;
            globalThis.avatars = [
                { id: 'Beatmaker', img: generateAvatarImage(0, 2, 0) },
                { id: 'Cyber-DJ', img: generateAvatarImage(1, 3, 0) },
                { id: 'Street_MC', img: generateAvatarImage(2, 1, 0) },
                { id: 'Exec_Prod', img: generateAvatarImage(3, 4, 0) }
            ];
        }

        // ==========================================
        // SPAWN DANS LA ROOM 3D & SYNCHRONISATION VARIANTES
        // ==========================================
        function spawnRoomAvatar(styleIndex, tier = null, variant = null, keepPos = false) {
            const prevPos = (keepPos && currentRoomAvatar) ? currentRoomAvatar.position.clone() : null;
            const prevRotY = (keepPos && currentRoomAvatar) ? currentRoomAvatar.rotation.y : 0;
            if (currentRoomAvatar) {
                scene.remove(currentRoomAvatar);
                targetPosition = null;
            }

            const root = new THREE.Group();
            root.name = "RoomAvatarRoot";
            root.scale.set(1.6, 1.6, 1.6);
            if (prevPos) {
                root.position.copy(prevPos);
                root.rotation.y = prevRotY;
            } else {
                root.position.set(0.2, -1, 2.4);
            }

            const visual = createAvatarGroup(styleIndex, tier, variant);
            visual.name = "AvatarVisual";
            visual.position.set(0, 0, 0);
            visual.rotation.set(0, 0, 0);
            // POV 1re Personne : on masque le modèle 3D de l'avatar pour ne pas voir l'intérieur du crâne
            visual.visible = false;

            root.add(visual);

            scene.add(root);
            currentRoomAvatar = root;
        }

        window.refreshActiveAvatarVisuals = function(tierOverride = null, variantOverride = null) {
            const st = (typeof state !== 'undefined' && state) ? state : null;
            const t = Math.max(1, Math.min(4, parseInt(
                (tierOverride !== null && tierOverride !== undefined)
                    ? tierOverride
                    : (st && st.avatarTier ? st.avatarTier : (st && st.studioUnlocked ? 4 : (st && st.roomTier ? st.roomTier : 1))),
                10
            ) || 1));
            const v = Math.max(0, Math.min(3, parseInt(
                (variantOverride !== null && variantOverride !== undefined)
                    ? variantOverride
                    : (st && typeof st.avatarVariant === 'number' ? st.avatarVariant : 0),
                10
            ) || 0));
            const charIdx = window.getModelIndexForTier(t);
            if (st) st.activeCharacter = charIdx;
            if (typeof selectedAvatarIndex !== 'undefined') selectedAvatarIndex = charIdx;

            if (currentRoomAvatar) {
                spawnRoomAvatar(charIdx, t, v, true);
            }
            try {
                const newImg = generateAvatarImage(charIdx, t, v, 384);
                if (avatars[charIdx]) avatars[charIdx].img = newImg;
                const hudAv = document.getElementById('hud-avatar');
                if (hudAv) hudAv.innerHTML = `<img src="${newImg}" alt="Avatar" class="w-full h-full object-cover rounded-full">`;
            } catch(e) { console.warn('Avatar portrait refresh error:', e); }
            if (typeof updateThemeColors === 'function') updateThemeColors();
        };

        window.applyAvatarVariant = function(tier, variant, persist = true) {
            const t = Math.max(1, Math.min(4, parseInt(tier, 10) || 1));
            const v = Math.max(0, Math.min(3, parseInt(variant, 10) || 0));
            const charIdx = window.getModelIndexForTier(t);
            if (typeof state !== 'undefined' && state) {
                state.avatarTier = t;
                state.avatarVariant = v;
                state.activeCharacter = charIdx;
                state.avatarTierPrompted = Math.max(state.avatarTierPrompted || 1, t);
            }
            window.refreshActiveAvatarVisuals(t, v);
            if (persist && typeof saveGame === 'function') saveGame();
        };

        window._pendingVariantTier = 2;
        window._pendingVariantIdx = 0;

        function updateWardrobeFooterSummary() {
            const t = window._pendingVariantTier || 1;
            const idx = window._pendingVariantIdx || 0;
            const list = AVATAR_TIER_VARIANTS[t] || AVATAR_TIER_VARIANTS[1];
            const vSpec = list[idx] || list[0];
            const st = (typeof state !== 'undefined' && state) ? state : null;
            const isEquipped = st && (Number(st.avatarTier) === t) && (Number(st.avatarVariant) === idx);
            const sumEl = document.getElementById('av-modal-selected-summary');
            const btnEl = document.getElementById('av-variant-confirm-btn');
            if (sumEl && vSpec) {
                sumEl.innerHTML = `<span class="text-white font-bold">${vSpec.name}</span> <span class="text-slate-400">· ${vSpec.desc}</span>`;
            }
            if (btnEl && vSpec) {
                btnEl.textContent = isEquipped ? `✓ ${vSpec.name.toUpperCase()} (ÉQUIPÉ)` : `✨ ÉQUIPER · ${vSpec.name.toUpperCase()}`;
            }
        }

        window.selectAvatarVariantPreview = function(idx) {
            window._pendingVariantIdx = idx;
            const cards = document.querySelectorAll('#av-variant-cards .av-var-card');
            cards.forEach((el, i) => {
                const active = (i === idx);
                el.classList.toggle('border-amber-400', active);
                el.classList.toggle('bg-white/10', active);
                el.classList.toggle('shadow-[0_0_24px_rgba(251,191,36,0.3)]', active);
                el.classList.toggle('border-white/10', !active);
                el.classList.toggle('bg-black/50', !active);
                const oldLive = el.querySelector('canvas.avatar-live-canvas');
                if (!active && oldLive) oldLive.remove();
            });
            const t = window._pendingVariantTier || 1;
            const charIdx = window.getModelIndexForTier(t);
            if (typeof window.mountLiveAvatarOnSelectedCard === 'function') {
                window.mountLiveAvatarOnSelectedCard(charIdx, t, idx, `#av-variant-cards .av-var-card:nth-child(${idx + 1}) .aspect-square`);
            }
            updateWardrobeFooterSummary();
            try { if (typeof playTone === 'function') playTone(520 + idx * 90, 'sine', 0.08, 0.04); } catch(e) {}
        };

        window.closeAvatarVariantModal = function() {
            const modal = document.getElementById('avatar-variant-modal');
            if (modal) {
                modal.classList.add('hidden');
                modal.classList.remove('flex');
            }
        };

        window.openAvatarVariantModal = function(targetTier) {
            const modal = document.getElementById('avatar-variant-modal');
            const cardsEl = document.getElementById('av-variant-cards');
            const tabsEl = document.getElementById('av-modal-tier-tabs');
            const eyebrow = document.getElementById('av-modal-eyebrow');
            const title = document.getElementById('av-modal-title');
            const sub = document.getElementById('av-modal-sub');
            if (!modal || !cardsEl) return;

            if (typeof window.exitFpsPointerLock === 'function') window.exitFpsPointerLock();
            const st = (typeof state !== 'undefined' && state) ? state : null;
            const maxUnlocked = st ? (st.studioUnlocked ? 4 : Math.max(1, Number(st.roomTier) || 1, Number(st.avatarTier) || 1)) : 1;
            const isManualOpen = (targetTier === undefined || targetTier === null);
            const activeTier = st ? (Number(st.avatarTier) || maxUnlocked) : 1;
            const t = Math.max(1, Math.min(maxUnlocked, parseInt(isManualOpen ? activeTier : targetTier, 10) || maxUnlocked));
            const currentEquippedTier = st ? (Number(st.avatarTier) || 1) : 1;
            const currentEquippedVar = st ? (Number(st.avatarVariant) || 0) : 0;

            const meta = AVATAR_TIER_META[t] || AVATAR_TIER_META[1];
            const list = AVATAR_TIER_VARIANTS[t] || AVATAR_TIER_VARIANTS[1];
            const charIdx = window.getModelIndexForTier(t);

            window._pendingVariantTier = t;
            window._pendingVariantIdx = (t === currentEquippedTier) ? currentEquippedVar : 0;

            const shortTags = {
                1: '· Casquette, barbiche & chaîne',
                2: '· Casque studio & haut sans manches',
                3: '· Visor LED & veste tactique',
                4: '· Lunettes, t-shirt 42E & montre'
            };
            if (eyebrow) eyebrow.textContent = isManualOpen ? `👕 VESTIAIRE` : `✨ DÉBLOQUÉ`;
            if (title) title.textContent = `${meta.charName.toUpperCase()}`;
            if (sub) sub.textContent = shortTags[t] || '';

            // Onglets des 4 personnages / paliers (compacts, lisibles, avec badge de niveau)
            if (tabsEl) {
                tabsEl.innerHTML = '';
                const tabSubNames = { 1: 'Street_MC', 2: 'Beatmaker', 3: 'Cyber-DJ', 4: 'Producer' };
                const tabLvlBadges = { 1: 'NIV.1', 2: 'NIV.2', 3: 'NIV.3', 4: '42E PRO' };
                [1, 2, 3, 4].forEach((tierNum) => {
                    const unlocked = tierNum <= maxUnlocked;
                    const isSelectedTab = tierNum === t;
                    const isEquippedTier = tierNum === currentEquippedTier;
                    const tb = document.createElement('button');
                    tb.type = 'button';
                    tb.disabled = !unlocked;
                    tb.className = `py-2 px-2.5 rounded-xl font-mono border transition-all flex items-center justify-between gap-1.5 ${
                        isSelectedTab
                            ? 'bg-amber-500/20 border-amber-400 text-white shadow-[0_0_14px_rgba(245,158,11,0.22)] cursor-pointer'
                            : unlocked
                                ? 'bg-white/5 border-white/15 text-slate-300 hover:bg-white/10 hover:text-white cursor-pointer'
                                : 'bg-black/40 border-white/5 text-slate-600 cursor-not-allowed'
                    }`;
                    tb.innerHTML = `
                        <div class="flex flex-col items-start min-w-0">
                            <span class="text-[8px] tracking-widest uppercase ${isSelectedTab ? 'text-amber-300' : 'text-slate-400'}">${tabLvlBadges[tierNum]}</span>
                            <span class="text-[11px] font-bold truncate">${tabSubNames[tierNum]}</span>
                        </div>
                        <span class="text-[10px] shrink-0">${!unlocked ? '🔒' : (isEquippedTier ? '●' : '')}</span>
                    `;
                    if (unlocked) tb.onclick = () => window.openAvatarVariantModal(tierNum);
                    tabsEl.appendChild(tb);
                });
            }

            cardsEl.innerHTML = '';
            list.forEach((vSpec, idx) => {
                const previewUrl = generateAvatarImage(charIdx, t, idx, 384);
                const isSelected = (idx === window._pendingVariantIdx);
                const isEquipped = (t === currentEquippedTier && idx === currentEquippedVar);
                const sw1 = vSpec.torso || '#1e293b';
                const sw2 = vSpec.cap || vSpec.sleeves || vSpec.techPanel || vSpec.shades || vSpec.accent;
                const sw3 = vSpec.accent || vSpec.metal || '#fbbf24';

                const card = document.createElement('button');
                card.type = 'button';
                card.className = `av-var-card group text-left rounded-xl p-2 border transition-all cursor-pointer flex flex-col gap-2 ${isSelected ? 'border-amber-400 bg-white/10 shadow-[0_0_24px_rgba(251,191,36,0.3)]' : 'border-white/10 bg-black/50 hover:border-white/30'}`;
                card.onclick = () => window.selectAvatarVariantPreview(idx);
                card.ondblclick = () => { window.selectAvatarVariantPreview(idx); window.confirmAvatarVariantModal(); };
                card.innerHTML = `
                    <div class="relative w-full aspect-square rounded-lg overflow-hidden border border-white/10 bg-black/60">
                        <img src="${previewUrl}" alt="${vSpec.name}" class="w-full h-full object-cover" />
                        <span class="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-md text-[8px] font-mono font-bold uppercase tracking-wider bg-black/75 border border-white/15 text-slate-200">${vSpec.tag}</span>
                        ${isEquipped ? '<span class="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded-md text-[8px] font-mono font-bold uppercase tracking-wider bg-emerald-500 text-black shadow">✓ ACTIF</span>' : ''}
                    </div>
                    <div class="flex items-center justify-between gap-1.5 px-0.5 pb-0.5">
                        <div class="font-mono text-[11px] font-bold text-white uppercase tracking-wide truncate">${vSpec.name}</div>
                        <div class="flex items-center gap-1 shrink-0" title="Palette du style">
                            <span class="w-2.5 h-2.5 rounded-full border border-white/40" style="background:${sw1}"></span>
                            <span class="w-2.5 h-2.5 rounded-full border border-white/40" style="background:${sw2}"></span>
                            <span class="w-2.5 h-2.5 rounded-full border border-white/70" style="background:${sw3}"></span>
                        </div>
                    </div>
                `;
                cardsEl.appendChild(card);
            });

            updateWardrobeFooterSummary();
            modal.classList.remove('hidden');
            modal.classList.add('flex');
            if (typeof window.mountLiveAvatarOnSelectedCard === 'function') {
                window.mountLiveAvatarOnSelectedCard(charIdx, t, window._pendingVariantIdx, `#av-variant-cards .av-var-card:nth-child(${window._pendingVariantIdx + 1}) .aspect-square`);
            }
        };

        window.confirmAvatarVariantModal = function() {
            const t = window._pendingVariantTier || 1;
            const v = window._pendingVariantIdx || 0;
            const spec = window.getAvatarVariantSpec(t, v);
            const meta = AVATAR_TIER_META[t] || AVATAR_TIER_META[1];
            window.applyAvatarVariant(t, v, true);
            window.closeAvatarVariantModal();
            try { if (typeof playSuccess === 'function') playSuccess(); } catch(e) {}
            if (typeof showToast === 'function' && spec) {
                showToast(`✨ ${meta.charName} · ${spec.name} équipé !`, 'success');
            }
        };

        // Synchronise la barre de progression (Niv.1→4) et les 4 variantes du perso du palier actif sur #login-screen
        window._loginUnlockedMaxTier = 1;
        window._loginSelectedTier = 1;
        window._loginSelectedVariant = 0;
        window._loginThumbCache = {};
        window.syncLoginAvatarStyleUI = function(unlockedMaxTier = 1, selectedTier = null, selectedVariant = 0) {
            const maxT = Math.max(1, Math.min(4, parseInt(unlockedMaxTier, 10) || 1));
            const rawT = (selectedTier !== null && selectedTier !== undefined) ? parseInt(selectedTier, 10) : maxT;
            const t = Math.max(1, Math.min(maxT, rawT || maxT));
            const v = Math.max(0, Math.min(3, parseInt(selectedVariant, 10) || 0));
            const charIdx = window.getModelIndexForTier(t);
            const meta = AVATAR_TIER_META[t] || AVATAR_TIER_META[1];
            const list = AVATAR_TIER_VARIANTS[t] || AVATAR_TIER_VARIANTS[1];

            window._loginUnlockedMaxTier = maxT;
            window._loginSelectedTier = t;
            window._loginSelectedVariant = v;
            if (typeof selectedAvatarIndex !== 'undefined') selectedAvatarIndex = charIdx;

            const badge = document.getElementById('login-avatar-tier-badge');
            if (badge) {
                badge.textContent = t === 4 ? `42e Pro · ${meta.charName}` : `Niv.${t} · ${meta.charName}`;
            }

            // Barre des 4 paliers (débloqués cliquables, paliers supérieurs verrouillés 🔒)
            const track = document.getElementById('login-tier-track');
            if (track) {
                track.innerHTML = '';
                const shortLabels = ['Niv.1 Street', 'Niv.2 Beat', 'Niv.3 Cyber', '42e Prod'];
                [1, 2, 3, 4].forEach((tierNum, i) => {
                    const unlocked = tierNum <= maxT;
                    const active = tierNum === t;
                    const b = document.createElement('button');
                    b.type = 'button';
                    b.disabled = !unlocked;
                    b.className = `px-1.5 py-1 rounded-lg border text-[9px] font-mono uppercase tracking-wider truncate transition-all ${
                        active
                            ? 'bg-amber-500/20 border-amber-400/80 text-amber-200 shadow-[0_0_10px_rgba(245,158,11,0.2)] cursor-pointer'
                            : unlocked
                                ? 'bg-white/5 border-white/15 text-slate-300 hover:bg-white/10 hover:text-white cursor-pointer'
                                : 'bg-black/40 border-white/5 text-slate-600 cursor-not-allowed'
                    }`;
                    b.textContent = unlocked ? shortLabels[i] : `${shortLabels[i]} 🔒`;
                    if (unlocked) {
                        b.onclick = () => {
                            window._loginVariantTouched = true;
                            window.syncLoginAvatarStyleUI(maxT, tierNum, 0);
                            try { if (typeof playTone === 'function') playTone(440 + tierNum * 70, 'sine', 0.06, 0.03); } catch(e) {}
                        };
                    }
                    track.appendChild(b);
                });
            }

            // 4 cartes de variantes du personnage correspondant au palier actif dans #avatar-container
            const cont = document.getElementById('avatar-container');
            if (cont) {
                cont.innerHTML = '';
                list.forEach((vSpec, idx) => {
                    const key = `${charIdx}_${t}_${idx}`;
                    if (!window._loginThumbCache[key]) {
                        window._loginThumbCache[key] = (idx === 0 && avatars[charIdx])
                            ? avatars[charIdx].img
                            : generateAvatarImage(charIdx, t, idx, 384);
                    }
                    const wrap = document.createElement('div');
                    wrap.className = `avatar-sel aspect-square relative p-0 overflow-hidden flex items-center justify-center ${idx === v ? 'selected' : ''}`;
                    wrap.dataset.idx = idx;
                    wrap.title = `${meta.charName} · ${vSpec.name} (${vSpec.tag})`;
                    wrap.onclick = () => {
                        window._loginVariantTouched = true;
                        window.syncLoginAvatarStyleUI(maxT, t, idx);
                        try { if (typeof playBleep === 'function') playBleep(); } catch(e) {}
                        if (typeof updateThemeColors === 'function') updateThemeColors();
                    };

                    const img = document.createElement('img');
                    img.src = window._loginThumbCache[key];
                    img.alt = `${meta.charName} - ${vSpec.name}`;
                    img.className = 'w-full h-full object-cover pointer-events-none';
                    wrap.appendChild(img);

                    const dot = document.createElement('span');
                    dot.className = 'absolute bottom-1 right-1 w-2.5 h-2.5 rounded-full border border-white/80 pointer-events-none shadow';
                    dot.style.background = vSpec.accent;
                    wrap.appendChild(dot);

                    cont.appendChild(wrap);
                });
            }

            const caption = document.getElementById('login-variant-caption');
            if (caption) {
                const activeSpec = list[v] || list[0];
                caption.textContent = `Variante ${v + 1}/4 · ${activeSpec.name} (${activeSpec.tag})`;
            }

            if (typeof window.mountLiveAvatarOnSelectedCard === 'function') {
                window.mountLiveAvatarOnSelectedCard(charIdx, t, v, '#avatar-container .avatar-sel.selected');
            }
            if (typeof window.mountLoginHeroAvatar === 'function') {
                window.mountLoginHeroAvatar(charIdx, t, v);
            }
        };

// --- Global Bridge & ES Exports ---
Object.assign(globalThis, { AVATAR_TIER_META, MODEL_TO_TIER, AVATAR_TIER_VARIANTS, getAvatarPBRTextures, applySkinSSS, createIrisTexture, getHairCardMaterial, createCurvedHairCard, createVolumetricHairLock, createGraphicTeeTexture, getAvatarStudioEnvMap, createSculptedHeadGeometry, createSculptedGarmentTorsoGeo, createAvatarGroup, getSharedAvatarRenderer, buildAvatarPortraitStudioScene, generateAvatarImage, initAvatars, spawnRoomAvatar, updateWardrobeFooterSummary });
export { AVATAR_TIER_META, MODEL_TO_TIER, AVATAR_TIER_VARIANTS, getAvatarPBRTextures, applySkinSSS, createIrisTexture, getHairCardMaterial, createCurvedHairCard, createVolumetricHairLock, createGraphicTeeTexture, getAvatarStudioEnvMap, createSculptedHeadGeometry, createSculptedGarmentTorsoGeo, createAvatarGroup, getSharedAvatarRenderer, buildAvatarPortraitStudioScene, generateAvatarImage, initAvatars, spawnRoomAvatar, updateWardrobeFooterSummary };
