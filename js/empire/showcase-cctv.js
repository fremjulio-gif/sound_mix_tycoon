import { THREE } from '../core/libs.js';

            // =========================================================================
            // BOUNCE LIVE · SHOWCASE & LISTENING PARTY (SCÈNE 3D ISOMÉTRIQUE TIMELAPSE)
            // Mix Festival Live + Listening Party · Cycle 10j · Semi-Interactif · Exigeant
            // =========================================================================
            const SHOWCASE_VENUES = [
                {
                    id: 'backroom', icon: '💿', name: 'Backroom', cost: 300, cap: 40, idealPop: 35, ticketRev: 18, bars: 1,
                    accent: 0x34d399, accentHex: '#34d399', rgb: '52, 211, 153',
                    floorSize: [7.6, 6.4]
                },
                {
                    id: 'loft', icon: '🍸', name: 'Loft & Bar', cost: 1200, cap: 120, idealPop: 75, ticketRev: 26, bars: 2,
                    accent: 0x38bdf8, accentHex: '#38bdf8', rgb: '56, 189, 248',
                    floorSize: [9.4, 7.6]
                },
                {
                    id: 'warehouse', icon: '🏭', name: 'Warehouse', cost: 3800, cap: 350, idealPop: 145, ticketRev: 34, bars: 3,
                    accent: 0xa855f7, accentHex: '#a855f7', rgb: '168, 85, 247',
                    floorSize: [11.2, 8.8]
                },
                {
                    id: 'rooftop42', icon: '👑', name: 'Arène 42e', cost: 10000, cap: 800, idealPop: 240, ticketRev: 44, bars: 4,
                    accent: 0xf59e0b, accentHex: '#f59e0b', rgb: '245, 158, 11',
                    floorSize: [13.0, 10.2]
                }
            ];

            const SHOWCASE_PROMOS = {
                standard: { label: 'Standard', cost: 0, bonus: 0, tag: '$0' },
                soundnet: { label: 'SoundNet', cost: 400, bonus: 16, tag: '+$400' },
                vip:      { label: 'VIP Bar', cost: 1000, bonus: 28, tag: '+$1k' }
            };

            globalThis._showcaseSession = null;
            globalThis._showcase3D = null;

            function _disposeShowcase3D() {
                if (!_showcase3D) return;
                try {
                    if (_showcase3D.rafId) cancelAnimationFrame(_showcase3D.rafId);
                    if (_showcase3D.resizeObs) _showcase3D.resizeObs.disconnect();
                    if (_showcase3D.srcTex && typeof _showcase3D.srcTex.dispose === 'function') {
                        _showcase3D.srcTex.dispose();
                    }
                    if (_showcase3D.scene) {
                        _showcase3D.scene.traverse(obj => {
                            if (obj.geometry && typeof obj.geometry.dispose === 'function') obj.geometry.dispose();
                            if (obj.material) {
                                const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
                                mats.forEach(m => {
                                    if (m && m.map && typeof m.map.dispose === 'function') m.map.dispose();
                                    if (m && m.uniforms) {
                                        Object.values(m.uniforms).forEach(u => {
                                            if (u && u.value && typeof u.value.dispose === 'function') u.value.dispose();
                                        });
                                    }
                                    if (m && typeof m.dispose === 'function') m.dispose();
                                });
                            }
                        });
                    }
                    if (_showcase3D.renderer) {
                        _showcase3D.renderer.dispose();
                        if (typeof _showcase3D.renderer.forceContextLoss === 'function') {
                            _showcase3D.renderer.forceContextLoss();
                        }
                    }
                } catch (e) {}
                _showcase3D = null;
            }

            window.closeBounceShowcase = function() {
                _disposeShowcase3D();
                _showcaseSession = null;
                const ov = document.getElementById('showcase-overlay');
                if (ov) {
                    ov.classList.add('hidden');
                    ov.classList.remove('flex');
                }
                const closeX = document.getElementById('showcase-close-x');
                if (closeX) closeX.classList.remove('hidden');
                if (typeof state !== 'undefined' && state) state.isEventActive = false;
            };

            function _computeShowcaseDrawPower(projectScore, isAlbum, hasGuest, promoId) {
                const st = typeof state !== 'undefined' && state ? state : {};
                const foll = Math.max(10, Number(st.followers) || 0);
                const rep = Math.max(0, Number(st.rep) || 0);
                const hype = Math.max(0, Math.min(100, Number(st.hype) || 50));
                const signedLen = Array.isArray(st.signedArtists) ? st.signedArtists.length : 0;
                const promoBonus = (SHOWCASE_PROMOS[promoId] && SHOWCASE_PROMOS[promoId].bonus) || 0;
                return (
                    Math.log10(foll + 1) * 26 +
                    Math.min(110, rep * 0.65) +
                    (hype / 100) * 38 +
                    ((Number(projectScore) || 6) / 10) * 28 +
                    (isAlbum ? 22 : 0) +
                    (hasGuest ? 30 : 0) +
                    promoBonus +
                    signedLen * 10
                );
            }

            window.openBounceShowcase = function(isAuto = false) {
                if (typeof state === 'undefined' || !state) return;
                const today = Number(state.day) || 1;
                const lastDay = Number(state.lastShowcaseDay) || 0;
                const hist = Array.isArray(state.showcaseHistory) ? state.showcaseHistory : [];
                if (!isAuto && hist.length > 0 && (today - lastDay) < 10) {
                    const left = 10 - (today - lastDay);
                    showToast(`Prochain Bounce Live disponible dans ${left} jour(s) in-game !`, "info");
                    if (typeof playBleep === 'function') playBleep();
                    return;
                }

                _disposeShowcase3D();
                state.isEventActive = true;
                if (typeof window.enforceFpsModalPriority === 'function') window.enforceFpsModalPriority();

                const tracks = Array.isArray(state.trackList) ? [...state.trackList].sort((a, b) => (Number(b.score) || 0) - (Number(a.score) || 0)) : [];
                const albums = Array.isArray(state.albums) ? [...state.albums].sort((a, b) => (Number(b.score) || 0) - (Number(a.score) || 0)) : [];
                const closeRappers = Object.entries(state.rapperAffinity || {})
                    .filter(([, sc]) => Number(sc) >= 60)
                    .sort((a, b) => Number(b[1]) - Number(a[1]));

                const edition = hist.length + 1;
                const estDrawBase = _computeShowcaseDrawPower(albums[0]?.score || tracks[0]?.score || 6.5, albums.length > 0, closeRappers.length > 0, 'standard');
                let defaultVenueId = 'backroom';
                if (estDrawBase >= 200 && (state.money || 0) >= 10000) defaultVenueId = 'rooftop42';
                else if (estDrawBase >= 120 && (state.money || 0) >= 3800) defaultVenueId = 'warehouse';
                else if (estDrawBase >= 62 && (state.money || 0) >= 1200) defaultVenueId = 'loft';

                _showcaseSession = {
                    edition,
                    venueId: defaultVenueId,
                    promoId: 'standard',
                    projectKey: albums[0] ? `alb:${albums[0].id}` : (tracks[0] ? 'trk:0' : 'solo'),
                    guestName: closeRappers[0] ? closeRappers[0][0] : '',
                    albums,
                    tracks: tracks.slice(0, 6),
                    closeRappers
                };

                const ov = document.getElementById('showcase-overlay');
                const meta = document.getElementById('showcase-meta-tag');
                const closeX = document.getElementById('showcase-close-x');
                if (closeX) closeX.classList.remove('hidden');
                if (meta) meta.textContent = `ÉDITION #${edition} · JOUR ${today}`;
                if (ov) {
                    ov.classList.remove('hidden');
                    ov.classList.add('flex');
                }
                _renderShowcaseSetup();
                if (typeof playUIAudio === 'function') playUIAudio('open', 0.7);
            };

            function _getSelectedShowcaseProject() {
                if (!_showcaseSession) return { title: 'FREESTYLE LIVE SET', score: 6.5, isAlbum: false, albumObj: null };
                const k = _showcaseSession.projectKey || 'solo';
                if (k.startsWith('alb:')) {
                    const id = k.slice(4);
                    const alb = (_showcaseSession.albums || []).find(a => a.id === id);
                    if (alb) return { title: alb.title, score: Number(alb.score) || 8.0, isAlbum: true, albumObj: alb };
                } else if (k.startsWith('trk:')) {
                    const idx = parseInt(k.slice(4), 10) || 0;
                    const trk = (_showcaseSession.tracks || [])[idx];
                    if (trk) return { title: trk.title || 'UNTITLED', score: Number(trk.score) || 7.0, isAlbum: false, albumObj: null };
                }
                return { title: 'SET FREESTYLE INÉDIT', score: 6.5, isAlbum: false, albumObj: null };
            }

            function _renderShowcaseSetup() {
                const body = document.getElementById('showcase-body');
                const ov = document.getElementById('showcase-overlay');
                if (!body || !_showcaseSession) return;

                const curVenue = SHOWCASE_VENUES.find(v => v.id === _showcaseSession.venueId) || SHOWCASE_VENUES[0];
                const curPromo = SHOWCASE_PROMOS[_showcaseSession.promoId] || SHOWCASE_PROMOS.standard;
                if (ov) ov.style.setProperty('--blive-rgb', curVenue.rgb);

                const proj = _getSelectedShowcaseProject();
                const drawPow = _computeShowcaseDrawPower(proj.score, proj.isAlbum, Boolean(_showcaseSession.guestName), _showcaseSession.promoId);
                const totalCost = curVenue.cost + curPromo.cost;

                const projOptions = [
                    ...(_showcaseSession.albums || []).map(a => `<option value="alb:${a.id}" ${_showcaseSession.projectKey === `alb:${a.id}` ? 'selected' : ''}>💿 ${a.title} (+20%)</option>`),
                    ...(_showcaseSession.tracks || []).map((t, i) => `<option value="trk:${i}" ${_showcaseSession.projectKey === `trk:${i}` ? 'selected' : ''}>🎵 ${t.title} (${Number(t.score || 0).toFixed(1)}/10)</option>`),
                    `<option value="solo" ${_showcaseSession.projectKey === 'solo' ? 'selected' : ''}>🎛️ Set Solo</option>`
                ].join('');

                const guestOptions = [
                    `<option value="" ${!_showcaseSession.guestName ? 'selected' : ''}>Sans Guest</option>`,
                    ...(_showcaseSession.closeRappers || []).map(([name, sc]) => `<option value="${name}" ${_showcaseSession.guestName === name ? 'selected' : ''}>★ ${name} (+25%)</option>`)
                ].join('');

                const venueCardsHtml = SHOWCASE_VENUES.map(v => {
                    const isSel = v.id === _showcaseSession.venueId;
                    const ratio = drawPow / v.idealPop;
                    let dot = { label: 'SAFE', color: '#34d399' };
                    if (ratio < 0.58) dot = { label: 'DANGER', color: '#fb7185' };
                    else if (ratio < 0.85) dot = { label: 'RISQUÉ', color: '#fbbf24' };

                    const segs = Array.from({ length: 4 }, (_, si) =>
                        `<span class="flex-1 h-1 rounded-full ${si < v.bars ? '' : 'opacity-20'}" style="background:${si < v.bars ? v.accentHex : '#ffffff'};"></span>`
                    ).join('');

                    return `
                        <button type="button" data-venue="${v.id}" class="blive-venue-card ${isSel ? 'is-selected' : ''} flex flex-col gap-2" style="--v-rgb:${v.rgb};">
                            <div class="flex items-center justify-between gap-2 w-full">
                                <div class="flex items-center gap-2 min-w-0">
                                    <span class="text-base leading-none">${v.icon}</span>
                                    <span class="text-sm font-extrabold tracking-wide text-white truncate">${v.name}</span>
                                </div>
                                <span class="text-[9.5px] font-mono font-bold uppercase tracking-wider shrink-0" style="color:${dot.color};">● ${dot.label}</span>
                            </div>
                            <div class="flex items-center gap-1 w-full">${segs}</div>
                            <div class="flex items-baseline justify-between gap-2 w-full">
                                <span class="text-[11px] font-mono text-zinc-400">${v.cap} places</span>
                                <span class="text-sm font-mono font-extrabold" style="color:${v.accentHex};">$${v.cost.toLocaleString('fr-FR')}</span>
                            </div>
                        </button>
                    `;
                }).join('');

                const promoHtml = Object.entries(SHOWCASE_PROMOS).map(([pid, p]) => {
                    const active = pid === _showcaseSession.promoId;
                    return `
                        <button type="button" data-promo="${pid}" class="blive-pill whitespace-nowrap text-[10px] sm:text-[11px] ${active ? 'is-active' : ''}">
                            ${p.label} <span class="opacity-75 font-mono ml-0.5">${p.tag}</span>
                        </button>
                    `;
                }).join('');

                const canAfford = (Number(state.money) || 0) >= totalCost;

                body.innerHTML = `
                    <div class="flex items-center justify-between gap-2">
                        <h2 class="text-lg sm:text-xl font-extrabold tracking-[0.08em] uppercase text-white">CHOISIS TA SALLE</h2>
                        <span class="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono font-bold text-emerald-400">$${Math.round(Number(state.money) || 0).toLocaleString('fr-FR')}</span>
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">${venueCardsHtml}</div>

                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div class="bg-black/40 border border-white/10 rounded-xl px-3 py-2 flex items-center justify-between gap-2">
                            <span class="text-[10px] font-mono uppercase tracking-wider text-zinc-400 shrink-0">🎵 Son</span>
                            <select id="showcase-project-select" class="flex-1 min-w-0 bg-transparent text-xs font-semibold text-white text-right focus:outline-none cursor-pointer">${projOptions}</select>
                        </div>
                        <div class="bg-black/40 border border-white/10 rounded-xl px-3 py-2 flex items-center justify-between gap-2">
                            <span class="text-[10px] font-mono uppercase tracking-wider text-zinc-400 shrink-0">★ Guest</span>
                            <select id="showcase-guest-select" class="flex-1 min-w-0 bg-transparent text-xs font-semibold text-white text-right focus:outline-none cursor-pointer">${guestOptions}</select>
                        </div>
                    </div>

                    <div class="flex items-center gap-2">${promoHtml}</div>

                    <div class="flex items-center gap-2.5 pt-0.5">
                        <button type="button" id="showcase-launch-btn" class="blive-cta flex-1 text-xs sm:text-sm ${!canAfford ? 'opacity-50' : ''}">
                            OUVRIR LES PORTES · $${totalCost.toLocaleString('fr-FR')}
                        </button>
                        <button type="button" id="showcase-skip-btn" class="px-3.5 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-zinc-400 hover:text-white transition-colors cursor-pointer shrink-0">
                            Passer
                        </button>
                    </div>
                `;

                body.querySelectorAll('[data-venue]').forEach(btn => {
                    btn.onclick = () => {
                        _showcaseSession.venueId = btn.getAttribute('data-venue');
                        if (typeof playBleep === 'function') playBleep();
                        _renderShowcaseSetup();
                    };
                });
                body.querySelectorAll('[data-promo]').forEach(btn => {
                    btn.onclick = () => {
                        _showcaseSession.promoId = btn.getAttribute('data-promo');
                        if (typeof playBleep === 'function') playBleep();
                        _renderShowcaseSetup();
                    };
                });
                const pSel = body.querySelector('#showcase-project-select');
                if (pSel) {
                    pSel.onchange = () => { _showcaseSession.projectKey = pSel.value; _renderShowcaseSetup(); };
                }
                const gSel = body.querySelector('#showcase-guest-select');
                if (gSel) {
                    gSel.onchange = () => { _showcaseSession.guestName = gSel.value; _renderShowcaseSetup(); };
                }
                const launchBtn = body.querySelector('#showcase-launch-btn');
                if (launchBtn) {
                    launchBtn.onclick = () => _launchShowcaseTimelapse();
                }
                const skipBtn = body.querySelector('#showcase-skip-btn');
                if (skipBtn) {
                    skipBtn.onclick = () => {
                        state.lastShowcaseDay = Number(state.day) || 1;
                        if (typeof saveGame === 'function') saveGame();
                        if (typeof window.renderEmpireApp === 'function') window.renderEmpireApp();
                        window.closeBounceShowcase();
                    };
                }
            }

            function _launchShowcaseTimelapse() {
                if (!_showcaseSession || typeof state === 'undefined' || !state) return;
                const venue = SHOWCASE_VENUES.find(v => v.id === _showcaseSession.venueId) || SHOWCASE_VENUES[0];
                const promo = SHOWCASE_PROMOS[_showcaseSession.promoId] || SHOWCASE_PROMOS.standard;
                const totalCost = venue.cost + promo.cost;
                if ((Number(state.money) || 0) < totalCost) {
                    showToast(`Fonds insuffisants ($${totalCost.toLocaleString('fr-FR')} requis). Choisis une salle plus petite !`, "error");
                    if (typeof playError === 'function') playError();
                    return;
                }

                const proj = _getSelectedShowcaseProject();
                const drawPower = _computeShowcaseDrawPower(proj.score, proj.isAlbum, Boolean(_showcaseSession.guestName), _showcaseSession.promoId);
                const rawFill = (drawPower / venue.idealPop) * (0.88 + Math.random() * 0.22);
                const baseFill = Math.max(0.08, Math.min(1.0, rawFill));

                logMoney(-totalCost, `Showcase ${venue.name}`);
                state.lastShowcaseDay = Number(state.day) || 1;
                if (typeof updateHUD === 'function') updateHUD();

                const body = document.getElementById('showcase-body');
                const closeX = document.getElementById('showcase-close-x');
                if (closeX) closeX.classList.add('hidden');
                if (!body) return;

                body.innerHTML = `
                    <div class="flex items-center justify-between gap-2">
                        <div class="flex items-center gap-2 min-w-0">
                            <span class="text-base leading-none">${venue.icon}</span>
                            <span class="text-sm sm:text-base font-extrabold uppercase tracking-wider text-white truncate">${venue.name} · ${proj.title}</span>
                        </div>
                        <span id="showcase-fill-pill" class="px-2.5 py-1 rounded-full text-[11px] font-mono font-extrabold shrink-0" style="background:rgba(${venue.rgb},0.20); border:1px solid rgba(${venue.rgb},0.55); color:#ffffff;">0%</span>
                    </div>

                    <!-- MONITEUR CAMÉRA DE SURVEILLANCE CCTV HAUT-D'ANGLE -->
                    <div class="blive-cctv-frame h-[290px] sm:h-[360px]">
                        <canvas id="showcase-3d-canvas" class="w-full h-full block"></canvas>
                        <div class="blive-cctv-scanlines"></div>
                        <div class="blive-cctv-corner tl"></div>
                        <div class="blive-cctv-corner tr"></div>
                        <div class="blive-cctv-corner bl"></div>
                        <div class="blive-cctv-corner br"></div>

                        <!-- OSD Haut-Gauche : REC CAM-04 -->
                        <div class="absolute top-2.5 sm:top-3.5 left-3 sm:left-4 z-[4] flex items-center gap-1.5 sm:gap-2 font-mono text-[9px] sm:text-[10px] font-bold tracking-[0.06em] sm:tracking-[0.14em] text-white/90 pointer-events-none drop-shadow">
                            <span class="blive-rec-dot"></span>
                            <span>REC · CAM-04<span class="hidden sm:inline"> HALL</span></span>
                        </div>

                        <!-- OSD Haut-Droite : Horloge Timelapse -->
                        <div id="showcase-clock" class="absolute top-2.5 sm:top-3.5 right-3 sm:right-4 z-[4] font-mono text-[9px] sm:text-[11px] font-bold tracking-[0.05em] sm:tracking-[0.12em] text-emerald-300/95 pointer-events-none tabular-nums drop-shadow">
                            J${state.day || 1} · 20:00:00 [×24]
                        </div>

                        <!-- OSD Bas-Gauche : Compteur Public Live -->
                        <div class="absolute bottom-4 left-4 z-[4] flex flex-col gap-1 pointer-events-none">
                            <div id="showcase-crowd-count" class="font-mono text-xs font-extrabold text-white tabular-nums drop-shadow">0 / ${venue.cap}</div>
                            <div class="w-28 sm:w-36 h-1.5 bg-white/15 rounded-full overflow-hidden">
                                <div id="showcase-fill-bar" class="h-full rounded-full transition-all duration-150" style="width:2%; background:${venue.accentHex}; box-shadow:0 0 10px ${venue.accentHex};"></div>
                            </div>
                        </div>

                        <!-- Réaction Rapide Centrée -->
                        <div id="showcase-reaction-bubble" class="hidden sm:block absolute bottom-4 left-1/2 -translate-x-1/2 z-[4] px-3 py-1 rounded-full bg-black/70 border border-white/15 text-[10px] font-mono text-zinc-200 whitespace-nowrap pointer-events-none">
                            Ouverture des portes...
                        </div>

                        <!-- OSD Bas-Droite : Audio Live -->
                        <div class="absolute bottom-4 right-4 z-[4] flex items-center gap-1.5 font-mono text-[9.5px] text-emerald-300/90 pointer-events-none">
                            <span>MIC</span>
                            <div class="blive-cctv-eq">
                                <span style="--eq-dur:0.45s;--eq-del:0.0s"></span>
                                <span style="--eq-dur:0.65s;--eq-del:0.1s"></span>
                                <span style="--eq-dur:0.52s;--eq-del:0.2s"></span>
                                <span style="--eq-dur:0.75s;--eq-del:0.05s"></span>
                            </div>
                        </div>
                    </div>

                    <div id="showcase-flash-slot" class="blive-flash-toast flex items-center justify-between gap-2 text-xs font-mono text-zinc-400">
                        <span class="truncate">● Flux entrée en direct</span>
                        <span class="text-emerald-400 shrink-0">SIGNAL OK</span>
                    </div>
                `;

                _startShowcase3DTimelapse({
                    venue,
                    promo,
                    proj,
                    guestName: _showcaseSession.guestName,
                    totalCost,
                    baseFill
                });
            }

            function _buildCctvHallBackdrop(accentHex, venueId) {
                const W = 480;
                const H = 270;
                const bg = document.createElement('canvas');
                bg.width = W;
                bg.height = H;
                const ctx = bg.getContext('2d');
                if (!ctx) return bg;

                // 1. Sol béton sombre basse-lumière avec dallage architectural
                ctx.fillStyle = '#090c13';
                ctx.fillRect(0, 0, W, H);

                // Texture grain béton subtile (déterministe pour netteté DVR)
                for (let i = 0; i < 2400; i++) {
                    const gx = (i * 73) % W;
                    const gy = ((i * 197) + Math.floor(i / 7) * 13) % H;
                    ctx.fillStyle = (i % 3 === 0) ? 'rgba(255,255,255,0.028)' : 'rgba(0,0,0,0.28)';
                    ctx.fillRect(gx, gy, 2, 2);
                }

                // Joints de dalles béton (quadrillage architectural fin)
                ctx.strokeStyle = 'rgba(148, 163, 184, 0.07)';
                ctx.lineWidth = 1;
                for (let x = 16; x < W - 16; x += 32) {
                    ctx.beginPath(); ctx.moveTo(x + 0.5, 14); ctx.lineTo(x + 0.5, H - 14); ctx.stroke();
                }
                for (let y = 14; y < H - 14; y += 32) {
                    ctx.beginPath(); ctx.moveTo(16, y + 0.5); ctx.lineTo(W - 16, y + 0.5); ctx.stroke();
                }

                // Marquage sécurité & flux fosse au sol
                ctx.save();
                ctx.strokeStyle = 'rgba(148, 163, 184, 0.14)';
                ctx.setLineDash([5, 5]);
                ctx.strokeRect(102, 82, 276, 164);
                ctx.restore();

                // 2. Halo ambre Bar / Carré VIP (Mur Gauche)
                const barGrad = ctx.createRadialGradient(48, 145, 6, 62, 145, 110);
                barGrad.addColorStop(0, 'rgba(245, 158, 11, 0.24)');
                barGrad.addColorStop(0.55, 'rgba(245, 158, 11, 0.08)');
                barGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
                ctx.fillStyle = barGrad;
                ctx.fillRect(16, 55, 155, 180);

                // Halo vert ENTRÉE (Mur Droit)
                const doorGrad = ctx.createRadialGradient(458, 176, 4, 434, 176, 105);
                doorGrad.addColorStop(0, 'rgba(52, 211, 153, 0.34)');
                doorGrad.addColorStop(0.5, 'rgba(16, 185, 129, 0.11)');
                doorGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
                ctx.fillStyle = doorGrad;
                ctx.fillRect(320, 96, 160, 160);

                // 3. Murs porteurs béton & piliers industriels (ouverture droite pour ENTRÉE)
                ctx.fillStyle = '#040509';
                ctx.fillRect(0, 0, W, 14);            // Mur arrière scène (Haut)
                ctx.fillRect(0, H - 14, W, 14);       // Mur fond de salle (Bas)
                ctx.fillRect(0, 0, 16, H);            // Mur gauche (VIP/Bar)
                ctx.fillRect(W - 18, 0, 18, 146);     // Mur droit haut
                ctx.fillRect(W - 18, 206, 18, H - 206); // Mur droit bas

                // Bordure intérieure murs + piliers béton
                ctx.strokeStyle = 'rgba(148, 163, 184, 0.22)';
                ctx.lineWidth = 1.5;
                ctx.strokeRect(16, 14, W - 34, H - 28);
                ctx.fillStyle = '#181e2c';
                [[16, 14], [16, H - 24], [W - 28, 14], [W - 28, H - 24], [16, 136], [W - 28, 100]].forEach(([px, py]) => {
                    ctx.fillRect(px, py, 12, 10);
                });

                // 4. Zone Bar / Carré VIP (Gauche : x 18..76, y 84..206)
                ctx.fillStyle = '#141118';
                ctx.fillRect(18, 84, 56, 122);
                ctx.strokeStyle = 'rgba(245, 158, 11, 0.48)';
                ctx.lineWidth = 1.5;
                ctx.strokeRect(18, 84, 56, 122);

                // Comptoir bar + néon ambre + tabourets hauts
                ctx.fillStyle = '#1e1712';
                ctx.fillRect(54, 90, 14, 110);
                ctx.fillStyle = '#f59e0b';
                ctx.fillRect(67, 92, 2, 106);
                ctx.fillStyle = '#332924';
                for (let sy = 98; sy <= 192; sy += 18) {
                    ctx.beginPath();
                    ctx.arc(79, sy, 3.6, 0, Math.PI * 2);
                    ctx.fill();
                }

                // Banquette VIP haut-gauche
                ctx.fillStyle = '#1c1926';
                ctx.fillRect(22, 92, 24, 34);
                ctx.fillRect(22, 164, 24, 34);

                // 5. SAS Double Porte ENTRÉE & File de sécurité (Droite : x 418..478, y 146..206)
                ctx.fillStyle = '#071712';
                ctx.fillRect(460, 146, 20, 60);
                // Battants de porte ouverts vers l'intérieur
                ctx.strokeStyle = '#6ee7b7';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(462, 147); ctx.lineTo(444, 152);
                ctx.moveTo(462, 205); ctx.lineTo(444, 200);
                ctx.stroke();

                // Potelets & ruban d'accès file
                ctx.strokeStyle = 'rgba(148, 163, 184, 0.45)';
                ctx.lineWidth = 1.2;
                ctx.beginPath();
                ctx.moveTo(460, 150); ctx.lineTo(418, 150);
                ctx.moveTo(460, 202); ctx.lineTo(418, 202);
                ctx.stroke();
                ctx.fillStyle = '#cbd5e1';
                [[456, 150], [437, 150], [418, 150], [456, 202], [437, 202], [418, 202]].forEach(([sx, sy]) => {
                    ctx.beginPath(); ctx.arc(sx, sy, 2.2, 0, Math.PI * 2); ctx.fill();
                });

                // Flèches discrètes au sol à l'entrée
                ctx.strokeStyle = 'rgba(52, 211, 153, 0.35)';
                ctx.lineWidth = 1.5;
                [448, 434].forEach(ax => {
                    ctx.beginPath();
                    ctx.moveTo(ax + 5, 171); ctx.lineTo(ax, 176); ctx.lineTo(ax + 5, 181);
                    ctx.stroke();
                });

                // Enseigne ENTRÉE au-dessus de la porte
                ctx.fillStyle = 'rgba(5, 46, 22, 0.92)';
                ctx.fillRect(422, 134, 40, 11);
                ctx.strokeStyle = '#34d399';
                ctx.lineWidth = 1;
                ctx.strokeRect(422, 134, 40, 11);
                ctx.fillStyle = '#6ee7b7';
                ctx.font = 'bold 7.5px ui-monospace, Menlo, monospace';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('ENTRÉE', 442, 139.8);

                ctx.fillStyle = 'rgba(245, 158, 11, 0.72)';
                ctx.font = 'bold 7px ui-monospace, Menlo, monospace';
                ctx.fillText('VIP BAR', 46, 77);

                // 6. Plateforme Scène DJ (Haut Centre : x 112..368, y 14..68)
                ctx.fillStyle = '#121622';
                ctx.fillRect(112, 14, 256, 54);
                ctx.strokeStyle = 'rgba(148, 163, 184, 0.35)';
                ctx.lineWidth = 1.5;
                ctx.strokeRect(112, 14, 256, 54);

                // Escaliers latéraux scène
                ctx.fillStyle = '#0d111b';
                for (let st = 0; st < 3; st++) {
                    ctx.fillRect(114, 52 + st * 5, 16, 4);
                    ctx.fillRect(350, 52 + st * 5, 16, 4);
                }

                // Régie DJ / Platines
                ctx.fillStyle = '#080a10';
                ctx.fillRect(196, 35, 88, 18);
                ctx.strokeStyle = accentHex;
                ctx.lineWidth = 1;
                ctx.strokeRect(196, 35, 88, 18);
                // Deux jog-wheels platines
                ctx.strokeStyle = 'rgba(226, 232, 240, 0.35)';
                ctx.beginPath(); ctx.arc(216, 44, 5.5, 0, Math.PI * 2); ctx.stroke();
                ctx.beginPath(); ctx.arc(264, 44, 5.5, 0, Math.PI * 2); ctx.stroke();

                // Barrière Crash métallique Front-of-Stage (y = 75)
                ctx.strokeStyle = '#64748b';
                ctx.lineWidth = 2.4;
                ctx.beginPath();
                ctx.moveTo(100, 75);
                ctx.lineTo(380, 75);
                ctx.stroke();

                return bg;
            }

            function _drawOverheadPerson(ctx, x, y, angle, scale, clothCol, hairCol, stageRimRgb, danceBob, hasPhone, phoneAlpha, armsUp) {
                ctx.save();
                ctx.translate(x, y);

                // Ombre de contact douce déportée vers le bas-arrière
                ctx.fillStyle = 'rgba(0, 0, 0, 0.56)';
                ctx.beginPath();
                ctx.ellipse(0.6, 2.4, 5.8 * scale, 4.4 * scale, 0, 0, Math.PI * 2);
                ctx.fill();

                ctx.rotate(angle);

                // Bras levés qui bougent au rythme (quand le set chauffe)
                if (armsUp > 0.15) {
                    const armReach = (4.2 + armsUp * 3.4) * scale;
                    ctx.strokeStyle = clothCol;
                    ctx.lineWidth = 2.1 * scale;
                    ctx.lineCap = 'round';
                    ctx.beginPath();
                    ctx.moveTo(4.2 * scale, -0.5 * scale);
                    ctx.lineTo(3.8 * scale + Math.sin(danceBob) * 1.1, -armReach);
                    ctx.moveTo(-4.2 * scale, -0.5 * scale);
                    ctx.lineTo(-3.8 * scale + Math.cos(danceBob) * 1.1, -armReach * 0.9);
                    ctx.stroke();
                }

                // Téléphone tenu levé devant soi (écran lumineux blanc/cyan visible du dessus)
                if (hasPhone && phoneAlpha > 0.05) {
                    const px = 2.2 * scale;
                    const py = -5.6 * scale;
                    const pGlow = ctx.createRadialGradient(px, py, 0.4, px, py, 10 * scale);
                    pGlow.addColorStop(0, `rgba(186, 230, 253, ${0.42 * phoneAlpha})`);
                    pGlow.addColorStop(1, 'rgba(56, 189, 248, 0)');
                    ctx.fillStyle = pGlow;
                    ctx.beginPath();
                    ctx.arc(px, py, 10 * scale, 0, Math.PI * 2);
                    ctx.fill();

                    ctx.fillStyle = `rgba(240, 249, 255, ${0.92 * phoneAlpha})`;
                    ctx.fillRect(px - 1.3 * scale, py - 0.8 * scale, 2.6 * scale, 1.6 * scale);
                }

                // Épaules / Veste clubwear vue du dessus (forme ovale réaliste, zéro gros cylindre)
                ctx.fillStyle = clothCol;
                ctx.beginPath();
                ctx.ellipse(0, 0, 5.5 * scale, 3.0 * scale, 0, 0, Math.PI * 2);
                ctx.fill();

                // Rim-light directionnelle scène/projecteurs sur le bord supérieur des épaules
                ctx.strokeStyle = `rgba(${stageRimRgb}, 0.58)`;
                ctx.lineWidth = 1.05 * scale;
                ctx.beginPath();
                ctx.ellipse(0, -0.25 * scale, 5.3 * scale, 2.75 * scale, 0, Math.PI * 1.08, Math.PI * 1.92);
                ctx.stroke();

                // Tête légèrement décalée vers l'avant (+danse)
                const headY = (-0.55 + Math.sin(danceBob) * 0.35) * scale;
                ctx.fillStyle = '#07090f';
                ctx.beginPath();
                ctx.arc(0, headY + 0.5 * scale, 3.05 * scale, 0, Math.PI * 2);
                ctx.fill();

                ctx.fillStyle = hairCol;
                ctx.beginPath();
                ctx.arc(0, headY, 2.75 * scale, 0, Math.PI * 2);
                ctx.fill();

                // Reflet léger crâne / casquette sous les spots
                ctx.fillStyle = 'rgba(226, 232, 240, 0.22)';
                ctx.beginPath();
                ctx.arc(-0.4 * scale, headY - 0.8 * scale, 1.05 * scale, 0, Math.PI * 2);
                ctx.fill();

                ctx.restore();
            }

            function _startShowcase3DTimelapse(cfg) {
                const canvas = document.getElementById('showcase-3d-canvas');
                if (!canvas) return;

                const SRC_W = 480;
                const SRC_H = 270;
                const srcCanvas = document.createElement('canvas');
                srcCanvas.width = SRC_W;
                srcCanvas.height = SRC_H;
                const srcCtx = srcCanvas.getContext('2d');
                if (!srcCtx) return;

                const floorBgCanvas = _buildCctvHallBackdrop(cfg.venue.accentHex, cfg.venue.id);

                // Parse accent hex into RGB string for canvas gradients/rim-lights
                const hexClean = String(cfg.venue.accentHex || '#38bdf8').replace('#', '');
                const hr = parseInt(hexClean.slice(0, 2), 16) || 56;
                const hg = parseInt(hexClean.slice(2, 4), 16) || 189;
                const hb = parseInt(hexClean.slice(4, 6), 16) || 248;
                const accentRgb = `${hr}, ${hg}, ${hb}`;

                const rect = canvas.getBoundingClientRect();
                const viewW = Math.max(280, Math.round(rect.width) || 640);
                const viewH = Math.max(220, Math.round(rect.height) || 340);

                // Stage 2: WebGL Brut DVR Fisheye & Low-Light Shader
                let renderer = null;
                let scene = null;
                let camera = null;
                let srcTex = null;
                let shaderMat = null;
                let glitchSpike = 0.0;

                try {
                    renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance' });
                    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
                    renderer.setSize(viewW, viewH, false);

                    scene = new THREE.Scene();
                    camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

                    srcTex = new THREE.CanvasTexture(srcCanvas);
                    srcTex.minFilter = THREE.LinearFilter;
                    srcTex.magFilter = THREE.LinearFilter;
                    srcTex.generateMipmaps = false;

                    const vertexShader = `
                        varying vec2 vUv;
                        void main() {
                            vUv = uv;
                            gl_Position = vec4(position.xy, 0.0, 1.0);
                        }
                    `;

                    const fragmentShader = `
                        precision mediump float;
                        varying vec2 vUv;
                        uniform sampler2D uTex;
                        uniform float uTime;
                        uniform float uAspect;
                        uniform float uGlitch;

                        float hash12(vec2 p) {
                            vec3 p3 = fract(vec3(p.xyx) * 0.1031);
                            p3 += dot(p3, p3.yzx + 33.33);
                            return fract((p3.x + p3.y) * p3.z);
                        }

                        void main() {
                            vec2 p = vUv * 2.0 - 1.0;

                            // Fisheye dome aspect-compensated (garde l'ENTRÉE visible sur mobile portrait & desktop)
                            float pa = clamp(uAspect / 1.777777, 0.88, 1.15);
                            vec2 np = vec2(p.x * pa, p.y);
                            float r2 = dot(np, np);
                            float edgeNorm = mix(1.38, 1.66, clamp((uAspect - 1.15) / 0.80, 0.0, 1.0));
                            float barrel = (1.0 + 0.38 * r2 + 0.14 * r2 * r2) / edgeNorm;

                            vec2 warped = p * barrel;
                            vec2 uv = warped * 0.5 + 0.5;

                            // Glitches horizontaux périodiques DVR + spikes sur Flash Decision
                            float tick = floor(uTime * 3.8);
                            float autoG = step(0.955, hash12(vec2(tick, 7.13))) * 0.65;
                            float gStrength = clamp(max(uGlitch, autoG), 0.0, 1.0);
                            float rowBand = step(0.84, sin(uv.y * 30.0 + uTime * 34.0));
                            float tearHash = (hash12(vec2(floor(uv.y * 42.0), tick)) - 0.5) * 2.0;
                            uv.x += gStrength * rowBand * tearHash * 0.032;

                            // Masque boîtier optique fisheye hors limites [0..1]
                            float edgeFade = smoothstep(1.01, 0.96, max(abs(warped.x), abs(warped.y)));

                            // Quantification basse résolution capteur DVR archive (~290x164)
                            vec2 dvrRes = vec2(290.0, 164.0);
                            vec2 qUv = floor(clamp(uv, 0.0, 1.0) * dvrRes) / dvrRes;
                            vec2 sUv = mix(clamp(uv, 0.0, 1.0), qUv, 0.72);

                            // Aberration chromatique radiale (lens dispersion)
                            vec2 caDir = normalize(p + vec2(0.0001)) * (0.0028 + 0.0052 * r2 + gStrength * 0.009);
                            float rCh = texture2D(uTex, clamp(sUv + caDir, 0.0, 1.0)).r;
                            float gCh = texture2D(uTex, sUv).g;
                            float bCh = texture2D(uTex, clamp(sUv - caDir, 0.0, 1.0)).b;
                            vec3 col = vec3(rCh, gCh, bCh);

                            // Color grading basse-lumière club : ombres béton froides + lumières vives conservées
                            float lum = dot(col, vec3(0.299, 0.587, 0.114));
                            float colorKeep = smoothstep(0.08, 0.42, lum) * 0.78 + 0.22;
                            col = mix(vec3(lum), col, colorKeep);
                            col = col * vec3(0.95, 0.99, 1.04) + vec3(0.015, 0.025, 0.035);

                            // Grain haute sensibilité ISO animé
                            float isoNoise = (hash12(floor(qUv * dvrRes) + fract(uTime * 19.3) * 89.0) - 0.5) * 0.12;
                            col += isoNoise;

                            // Scanlines entrelacées DVR + barre de balayage verticale lente
                            float scan = 0.92 + 0.08 * sin(vUv.y * 280.0 + uTime * 15.0);
                            float barSweep = smoothstep(0.06, 0.0, abs(fract(vUv.y - uTime * 0.16) - 0.5)) * 0.065;
                            col = col * scan + barSweep;

                            // Lignes de glitch blanches ponctuelles
                            col += gStrength * rowBand * 0.14;

                            // Forte vignettage optique fisheye + fondu boîtier noir
                            float vig = 1.0 - smoothstep(0.55, 1.48, r2);
                            col *= (0.28 + 0.72 * vig) * edgeFade;

                            gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
                        }
                    `;

                    shaderMat = new THREE.ShaderMaterial({
                        uniforms: {
                            uTex: { value: srcTex },
                            uTime: { value: 0.0 },
                            uAspect: { value: viewW / Math.max(1, viewH) },
                            uGlitch: { value: 0.0 }
                        },
                        vertexShader,
                        fragmentShader,
                        depthTest: false,
                        depthWrite: false
                    });

                    const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), shaderMat);
                    scene.add(quad);
                } catch (e) {
                    renderer = null;
                }

                // Fallback canvas 2D direct si WebGL indisponible
                const fallbackCtx = !renderer ? canvas.getContext('2d') : null;
                if (!renderer && fallbackCtx) {
                    canvas.width = SRC_W;
                    canvas.height = SRC_H;
                }

                let resizeObs = null;
                if (renderer && typeof ResizeObserver !== 'undefined') {
                    resizeObs = new ResizeObserver(entries => {
                        for (const entry of entries) {
                            const w = Math.max(240, Math.round(entry.contentRect.width));
                            const h = Math.max(180, Math.round(entry.contentRect.height));
                            renderer.setSize(w, h, false);
                            if (shaderMat) shaderMat.uniforms.uAspect.value = w / Math.max(1, h);
                        }
                    });
                    resizeObs.observe(canvas);
                }

                // Pool de 175 silhouettes top-down qui arrivent par petites grappes (avant -> fond)
                const MAX_CROWD = 175;
                const clothPalette = [
                    '#171c28', '#1e2433', '#231f2e', '#1a2726',
                    '#2a2224', '#16202e', '#262b38', '#312b28'
                ];
                const hairPalette = ['#0d0f14', '#181412', '#261e18', '#090a0f', '#383029', '#cbd5e1'];

                // Spots ordonnés Avant (près barrière y=88) -> Fond (y=244), regroupés par îlots d'amis (2-4 pers)
                const crowd = [];
                const numClumps = 52;
                const clumps = [];
                for (let cIdx = 0; cIdx < numClumps; cIdx++) {
                    const rowT = cIdx / (numClumps - 1);
                    const isVip = (cIdx % 7 === 1) && rowT < 0.72;
                    if (isVip) {
                        clumps.push({
                            cx: 86 + Math.random() * 24,
                            cy: 92 + Math.random() * 106,
                            isVip: true
                        });
                    } else {
                        clumps.push({
                            cx: 112 + Math.random() * 254,
                            cy: 85 + Math.pow(rowT, 0.92) * 155,
                            isVip: false
                        });
                    }
                }

                for (let i = 0; i < MAX_CROWD; i++) {
                    const clumpIdx = Math.min(numClumps - 1, Math.floor((i / MAX_CROWD) * numClumps));
                    const clump = clumps[clumpIdx];
                    const tx = Math.max(84, Math.min(404, clump.cx + (Math.random() - 0.5) * 18));
                    const ty = Math.max(83, Math.min(248, clump.cy + (Math.random() - 0.5) * 13));

                    // Courbe S naturelle en vagues de 2-4 amis (0.01 -> 0.87)
                    const groupBucket = Math.floor(i / 3) * 3;
                    const sFrac = groupBucket / MAX_CROWD;
                    const spawnTime = 0.01 + sFrac * 0.85 + Math.random() * 0.03;

                    const sx = 486 + Math.random() * 14;
                    const sy = 160 + Math.random() * 32;
                    const wp1x = 424 + Math.random() * 16;
                    const wp1y = 158 + Math.random() * 36;

                    crowd.push({
                        x: sx,
                        y: sy,
                        sx,
                        sy,
                        wp1x,
                        wp1y,
                        tx,
                        ty,
                        angle: Math.PI,
                        cloth: clothPalette[i % clothPalette.length],
                        hair: hairPalette[(i * 5) % hairPalette.length],
                        scale: 0.88 + Math.random() * 0.24,
                        phase: Math.random() * Math.PI * 2,
                        speed: 0.042 + Math.random() * 0.024,
                        spawnTime,
                        passedDoor: false,
                        hasPhone: (i % 4 === 0),
                        isVip: clump.isVip,
                        active: false
                    });
                }

                // Brume atmosphérique lente
                const hazePuffs = [
                    { bx: 155, by: 120, r: 78, sp: 0.0005, ph: 0.0 },
                    { bx: 295, by: 145, r: 88, sp: 0.0004, ph: 2.1 },
                    { bx: 225, by: 185, r: 92, sp: 0.00045, ph: 4.3 }
                ];

                // Animation Timelapse CCTV + 2 Décisions Semi-Interactives
                const DURATION_MS = 10500;
                let elapsedMs = 0;
                let lastTs = performance.now();
                let paused = false;
                let finished = false;
                let currentFillRatio = cfg.baseFill;
                let flash1Triggered = false;
                let flash2Triggered = false;
                let flashAffDelta = 0;
                let flashRepDelta = 0;
                let flashCashDelta = 0;
                let lastBubbleAt = -1;

                const bubblePoolLow = [
                    "Quelques curieux au compte-gouttes...",
                    "La salle reste bien clairsemée...",
                    "Écho dans le fond de la salle"
                ];
                const bubblePoolMid = [
                    "La fosse prend forme devant la scène",
                    "Flux constant à l'entrée",
                    "Les médias filment le set"
                ];
                const bubblePoolHigh = [
                    "File continue devant la porte ! 🔥",
                    "Téléphones levés dans la fosse 📱",
                    `Foule compacte · ${cfg.proj.title}`
                ];

                const updateHudDuringTimelapse = (tNorm, liveFill, activeCount) => {
                    const totalSecs = Math.round(tNorm * 360 * 60); // 20:00:00 -> 02:00:00
                    const hr = (20 + Math.floor(totalSecs / 3600)) % 24;
                    const mn = Math.floor((totalSecs % 3600) / 60);
                    const sc = totalSecs % 60;
                    const clockEl = document.getElementById('showcase-clock');
                    if (clockEl) clockEl.textContent = `J${state.day || 1} · ${String(hr).padStart(2, '0')}:${String(mn).padStart(2, '0')}:${String(sc).padStart(2, '0')} [×24]`;

                    const smoothFill = Math.min(1.0, activeCount / MAX_CROWD);
                    const displayPct = Math.round(Math.min(1.0, Math.max(smoothFill, liveFill * Math.min(1.0, tNorm * 1.05))) * 100);
                    const crowdCnt = Math.round((displayPct / 100) * cfg.venue.cap);

                    const cntEl = document.getElementById('showcase-crowd-count');
                    if (cntEl) cntEl.textContent = `${crowdCnt} / ${cfg.venue.cap}`;
                    const pillEl = document.getElementById('showcase-fill-pill');
                    if (pillEl) {
                        pillEl.textContent = displayPct >= 85 ? `${displayPct}% · SOLD OUT 🔥` : `${displayPct}%`;
                    }
                    const barEl = document.getElementById('showcase-fill-bar');
                    if (barEl) barEl.style.width = `${Math.max(3, displayPct)}%`;

                    if (tNorm - lastBubbleAt >= 0.16) {
                        lastBubbleAt = tNorm;
                        const bub = document.getElementById('showcase-reaction-bubble');
                        if (bub) {
                            const r = displayPct / 100;
                            const src = r >= 0.65 ? bubblePoolHigh : (r >= 0.35 ? bubblePoolMid : bubblePoolLow);
                            bub.textContent = src[Math.floor(Math.random() * src.length)];
                        }
                        if (typeof playTone === 'function') playTone(95 + displayPct * 1.3, 'sine', 0.07, 0.03);
                    }
                };

                const triggerFlashDecision = (which) => {
                    paused = true;
                    glitchSpike = 1.0;
                    const slot = document.getElementById('showcase-flash-slot');
                    if (!slot) { paused = false; return; }
                    if (typeof playUIAudio === 'function') playUIAudio('toast', 0.7);

                    if (which === 1) {
                        const canPayTech = (Number(state.money) || 0) >= 350;
                        slot.className = 'blive-flash-toast border-amber-400/50 bg-amber-500/10 flex flex-col gap-2';
                        slot.innerHTML = `
                            <div class="flex items-center justify-between gap-2 text-[10.5px] font-mono">
                                <span class="font-bold text-amber-300 uppercase">⚡ SATURATION SUB 18"</span>
                                <span class="text-zinc-400">RÉGIE LIVE</span>
                            </div>
                            <div class="grid grid-cols-2 gap-2">
                                <button type="button" id="flash1-pay" class="blive-pill !rounded-xl !py-2 !text-left !px-3 ${!canPayTech ? 'opacity-45' : ''}" style="border-color:rgba(52,211,153,0.45); color:#6ee7b7;">
                                    <div class="font-extrabold">Ingé d'urgence · -$350</div>
                                    <div class="text-[9.5px] font-mono text-zinc-400">+14% foule garantie</div>
                                </button>
                                <button type="button" id="flash1-risk" class="blive-pill !rounded-xl !py-2 !text-left !px-3" style="border-color:rgba(245,158,11,0.45); color:#fcd34d;">
                                    <div class="font-extrabold">Improviser · 50/50</div>
                                    <div class="text-[9.5px] font-mono text-zinc-400">+10% ou -14% foule</div>
                                </button>
                            </div>
                        `;
                        slot.querySelector('#flash1-pay').onclick = () => {
                            if ((Number(state.money) || 0) >= 350) {
                                logMoney(-350, 'Ingé son urgence Showcase');
                                flashCashDelta -= 350;
                                currentFillRatio = Math.min(1.0, currentFillRatio + 0.14);
                                showToast("🎛️ Son recalibré ! L'affluence repart à la hausse (+14%).", "success");
                                if (typeof playSuccess === 'function') playSuccess();
                            } else {
                                currentFillRatio = Math.max(0.05, currentFillRatio - 0.10);
                                showToast("Pas assez de cash — saturation (-10%).", "error");
                                if (typeof playError === 'function') playError();
                            }
                            glitchSpike = 0.65;
                            slot.className = 'blive-flash-toast flex items-center justify-between gap-2 text-xs font-mono text-zinc-300';
                            slot.innerHTML = '<span>● Son stabilisé · Reprise du flux</span><span class="text-emerald-400 shrink-0">SIGNAL OK</span>';
                            paused = false;
                            lastTs = performance.now();
                        };
                        slot.querySelector('#flash1-risk').onclick = () => {
                            if (Math.random() < 0.5) {
                                currentFillRatio = Math.min(1.0, currentFillRatio + 0.10);
                                flashRepDelta += 6;
                                showToast("🔥 Sauvé au talent ! +10% foule & +6 REP.", "success");
                                if (typeof playSuccess === 'function') playSuccess();
                            } else {
                                currentFillRatio = Math.max(0.05, currentFillRatio - 0.14);
                                showToast("💥 Larsen dans la salle — des gens sortent (-14%).", "error");
                                if (typeof playError === 'function') playError();
                            }
                            glitchSpike = 0.65;
                            slot.className = 'blive-flash-toast flex items-center justify-between gap-2 text-xs font-mono text-zinc-300';
                            slot.innerHTML = '<span>● Reprise du set jusqu\'à 02:00</span><span class="text-zinc-400 shrink-0">LIVE</span>';
                            paused = false;
                            lastTs = performance.now();
                        };
                    } else {
                        const pool = (typeof rappersConnus !== 'undefined' && rappersConnus.length)
                            ? rappersConnus.filter(n => n !== cfg.guestName)
                            : ['Zandame', 'Joule', 'Disiznot'];
                        const star = pool[Math.floor(Math.random() * pool.length)];
                        slot.className = 'blive-flash-toast border-sky-400/50 bg-sky-500/10 flex flex-col gap-2';
                        slot.innerHTML = `
                            <div class="flex items-center justify-between gap-2 text-[10.5px] font-mono">
                                <span class="font-bold text-sky-300 uppercase">★ ${star} À L'ENTRÉE</span>
                                <span class="text-zinc-400">CAM-04 PORTE</span>
                            </div>
                            <div class="grid grid-cols-2 gap-2">
                                <button type="button" id="flash2-vip" class="blive-pill !rounded-xl !py-2 !text-left !px-3" style="border-color:rgba(245,158,11,0.5); color:#fde68a;">
                                    <div class="font-extrabold">Inviter sur Scène</div>
                                    <div class="text-[9.5px] font-mono text-zinc-400">+16% foule · +20 Affinité</div>
                                </button>
                                <button type="button" id="flash2-solo" class="blive-pill !rounded-xl !py-2 !text-left !px-3" style="border-color:rgba(56,189,248,0.45); color:#7dd3fc;">
                                    <div class="font-extrabold">Rester en Solo</div>
                                    <div class="text-[9.5px] font-mono text-zinc-400">+12 REP · +4% foule</div>
                                </button>
                            </div>
                        `;
                        slot.querySelector('#flash2-vip').onclick = () => {
                            currentFillRatio = Math.min(1.0, currentFillRatio + 0.16);
                            if (typeof window.addRapperAffinity === 'function') window.addRapperAffinity(star, 20);
                            flashAffDelta += 20;
                            glitchSpike = 0.75;
                            showToast(`🎤 ${star} monte sur scène ! La salle déborde (+16%) !`, "success");
                            if (typeof playSuccess === 'function') playSuccess();
                            slot.className = 'blive-flash-toast flex items-center justify-between gap-2 text-xs font-mono text-zinc-300';
                            slot.innerHTML = `<span>🔥 ${star} en feat surprise !</span><span class="text-amber-300 shrink-0">HYPE MAX</span>`;
                            paused = false;
                            lastTs = performance.now();
                        };
                        slot.querySelector('#flash2-solo').onclick = () => {
                            flashRepDelta += 12;
                            currentFillRatio = Math.min(1.0, currentFillRatio + 0.04);
                            glitchSpike = 0.5;
                            showToast("🎛️ Set 100% Puriste salué (+12 REP).", "info");
                            if (typeof playBleep === 'function') playBleep();
                            slot.className = 'blive-flash-toast flex items-center justify-between gap-2 text-xs font-mono text-zinc-300';
                            slot.innerHTML = '<span>🎛️ Final solo jusqu\'à 02:00...</span><span class="text-sky-300 shrink-0">SOLO</span>';
                            paused = false;
                            lastTs = performance.now();
                        };
                    }
                };

                const stepLoop = (now) => {
                    if (!_showcase3D || finished) return;
                    const dt = Math.min(60, Math.max(0, now - lastTs));
                    lastTs = now;

                    if (!paused) {
                        elapsedMs += dt;
                    }
                    const tNorm = Math.min(1.0, elapsedMs / DURATION_MS);

                    if (!flash1Triggered && tNorm >= 0.35) {
                        flash1Triggered = true;
                        triggerFlashDecision(1);
                    } else if (!flash2Triggered && tNorm >= 0.68) {
                        flash2Triggered = true;
                        triggerFlashDecision(2);
                    }

                    // ── STAGE 1 : Rendu 2D Overhead Architectural & Silhouettes ──
                    srcCtx.drawImage(floorBgCanvas, 0, 0);

                    const beatVal = Math.max(0, Math.sin(now * 0.011));
                    const stageIntensity = 0.45 + currentFillRatio * 0.55;

                    // Bannière LED live sur scène (EQ dynamique + nom du projet)
                    srcCtx.fillStyle = '#070910';
                    srcCtx.fillRect(142, 16, 196, 15);
                    srcCtx.strokeStyle = cfg.venue.accentHex;
                    srcCtx.lineWidth = 1;
                    srcCtx.strokeRect(142, 16, 196, 15);
                    for (let eb = 0; eb < 24; eb++) {
                        const bh = 2 + Math.abs(Math.sin(now * 0.014 + eb * 0.65)) * 10 * stageIntensity;
                        srcCtx.fillStyle = eb % 3 === 0 ? '#ffffff' : cfg.venue.accentHex;
                        srcCtx.globalAlpha = 0.45 + 0.4 * beatVal;
                        srcCtx.fillRect(146 + eb * 8, 29 - bh, 5, bh);
                    }
                    srcCtx.globalAlpha = 1;
                    srcCtx.fillStyle = 'rgba(255, 255, 255, 0.9)';
                    srcCtx.font = 'bold 7.5px ui-monospace, Menlo, monospace';
                    srcCtx.textAlign = 'center';
                    srcCtx.textBaseline = 'middle';
                    srcCtx.fillText(String(cfg.proj.title || 'SHOWCASE').toUpperCase().slice(0, 22), 240, 23.5);

                    // Caissons Subwoofers gauche/droite pulsants
                    const subPulse = beatVal * 2.1 * stageIntensity;
                    [86, 376].forEach(sx => {
                        srcCtx.fillStyle = '#0b0e16';
                        srcCtx.fillRect(sx - subPulse * 0.4, 24 - subPulse * 0.4, 18 + subPulse * 0.8, 34 + subPulse * 0.8);
                        srcCtx.strokeStyle = `rgba(${accentRgb}, ${0.35 + beatVal * 0.45})`;
                        srcCtx.lineWidth = 1;
                        srcCtx.strokeRect(sx, 24, 18, 34);
                    });

                    // LEDs console DJ + DJ top-down sur scène
                    for (let led = 0; led < 10; led++) {
                        srcCtx.fillStyle = (led + Math.floor(now / 120)) % 3 === 0 ? cfg.venue.accentHex : '#e2e8f0';
                        srcCtx.fillRect(202 + led * 8, 48, 4, 2);
                    }
                    _drawOverheadPerson(
                        srcCtx,
                        240 + Math.sin(now * 0.005) * 2.5,
                        40,
                        Math.PI / 2,
                        1.08,
                        '#334155',
                        '#090b10',
                        accentRgb,
                        now * 0.012,
                        false,
                        0,
                        0.45 + beatVal * 0.5
                    );

                    // 2 Agents de sécurité derrière la barrière crash + 1 Videur à l'ENTRÉE
                    _drawOverheadPerson(srcCtx, 175, 71, Math.PI / 2, 1.0, '#1e293b', '#05070a', '148,163,184', 0, false, 0, 0);
                    _drawOverheadPerson(srcCtx, 305, 71, Math.PI / 2, 1.0, '#1e293b', '#05070a', '148,163,184', 0, false, 0, 0);
                    _drawOverheadPerson(srcCtx, 412, 160, 0, 1.04, '#111827', '#05070a', '52,211,153', 0, false, 0, 0);

                    // Barman derrière le comptoir gauche
                    _drawOverheadPerson(srcCtx, 42, 145 + Math.sin(now * 0.002) * 14, 0, 0.96, '#292018', '#0a090c', '245,158,11', now * 0.006, false, 0, 0);

                    // Mise à jour & rendu des 175 visiteurs top-down (avant -> fond, flux par la porte ENTRÉE)
                    const maxCapCount = Math.max(2, Math.round(currentFillRatio * MAX_CROWD));
                    let activeInHall = 0;

                    for (let i = 0; i < crowd.length; i++) {
                        const c = crowd[i];
                        const allowed = i < maxCapCount;

                        if (allowed && tNorm >= c.spawnTime) {
                            c.active = true;
                            activeInHall++;

                            const targetX = c.passedDoor ? c.tx : c.wp1x;
                            const targetY = c.passedDoor ? c.ty : c.wp1y;
                            const dx = targetX - c.x;
                            const dy = targetY - c.y;
                            c.x += dx * (c.passedDoor ? c.speed : c.speed * 1.4);
                            c.y += dy * (c.passedDoor ? c.speed : c.speed * 1.4);

                            if (!c.passedDoor && Math.abs(dx) < 10 && Math.abs(dy) < 10) {
                                c.passedDoor = true;
                            }

                            const dist = Math.hypot(c.tx - c.x, c.ty - c.y);
                            if (dist > 8) {
                                c.angle = Math.atan2(dy, dx) + Math.PI / 2;
                            } else {
                                c.angle = Math.sin(now * 0.002 + c.phase) * 0.22;
                            }

                            if (c.x <= 474) {
                                const inPit = dist < 12;
                                const phoneOn = inPit && (activeInHall / MAX_CROWD) >= 0.44 && Math.sin(now * 0.007 + c.phase * 2.3) > 0.52;
                                const dancePhase = now * 0.013 + c.phase;
                                const armsUp = inPit ? Math.max(0, (currentFillRatio - 0.35) * 1.4 * Math.max(0, Math.sin(now * 0.008 + c.phase))) : 0;
                                const rimCol = c.isVip ? '245, 158, 11' : accentRgb;

                                _drawOverheadPerson(
                                    srcCtx,
                                    c.x,
                                    c.y,
                                    c.angle,
                                    c.scale,
                                    c.cloth,
                                    c.hair,
                                    rimCol,
                                    dancePhase,
                                    c.hasPhone,
                                    phoneOn ? 1 : 0,
                                    armsUp
                                );
                            }
                        } else if (c.active) {
                            // Départ propre par la porte droite si baisse d'affluence
                            const dx = c.sx - c.x;
                            const dy = c.sy - c.y;
                            c.x += dx * 0.06;
                            c.y += dy * 0.06;
                            c.angle = Math.atan2(dy, dx) + Math.PI / 2;

                            if (c.x > 474) {
                                c.active = false;
                                c.passedDoor = false;
                            } else {
                                _drawOverheadPerson(srcCtx, c.x, c.y, c.angle, c.scale, c.cloth, c.hair, accentRgb, now * 0.01, false, 0, 0);
                            }
                        }
                    }

                    // Projecteurs volumétriques balayant la fosse & brume légère (composite additive)
                    srcCtx.save();
                    srcCtx.globalCompositeOperation = 'lighter';

                    const spotXs = [155, 240, 325];
                    spotXs.forEach((sx, si) => {
                        const sweepX = sx + Math.sin(now * 0.0018 + si * 2.1) * 78;
                        const spotGrad = srcCtx.createLinearGradient(sx, 36, sweepX, 232);
                        const beamAlpha = (0.11 + currentFillRatio * 0.14 + beatVal * 0.06);
                        spotGrad.addColorStop(0, `rgba(${accentRgb}, ${beamAlpha * 1.35})`);
                        spotGrad.addColorStop(0.65, `rgba(${accentRgb}, ${beamAlpha * 0.45})`);
                        spotGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
                        srcCtx.fillStyle = spotGrad;
                        srcCtx.beginPath();
                        srcCtx.moveTo(sx - 6, 36);
                        srcCtx.lineTo(sx + 6, 36);
                        srcCtx.lineTo(sweepX + 44, 232);
                        srcCtx.lineTo(sweepX - 44, 232);
                        srcCtx.closePath();
                        srcCtx.fill();
                    });

                    // Léger flash stroboscopique sur pics de foule
                    if (currentFillRatio > 0.65 && Math.sin(now * 0.025) > 0.94) {
                        srcCtx.fillStyle = 'rgba(226, 232, 240, 0.07)';
                        srcCtx.fillRect(0, 0, SRC_W, SRC_H);
                    }

                    // Brume dérivante de salle de concert
                    hazePuffs.forEach(hp => {
                        const hx = hp.bx + Math.sin(now * hp.sp + hp.ph) * 28;
                        const hy = hp.by + Math.cos(now * hp.sp * 0.8 + hp.ph) * 14;
                        const hg = srcCtx.createRadialGradient(hx, hy, 4, hx, hy, hp.r);
                        hg.addColorStop(0, `rgba(${accentRgb}, 0.055)`);
                        hg.addColorStop(0.5, 'rgba(148, 163, 184, 0.028)');
                        hg.addColorStop(1, 'rgba(0, 0, 0, 0)');
                        srcCtx.fillStyle = hg;
                        srcCtx.beginPath();
                        srcCtx.arc(hx, hy, hp.r, 0, Math.PI * 2);
                        srcCtx.fill();
                    });

                    srcCtx.restore();

                    updateHudDuringTimelapse(tNorm, currentFillRatio, activeInHall);

                    // ── STAGE 2 : Post-traitement Shader Fisheye DVR ──
                    if (glitchSpike > 0) glitchSpike = Math.max(0, glitchSpike - dt * 0.0028);

                    if (renderer && shaderMat && srcTex) {
                        srcTex.needsUpdate = true;
                        shaderMat.uniforms.uTime.value = now * 0.001;
                        shaderMat.uniforms.uGlitch.value = glitchSpike;
                        renderer.render(scene, camera);
                    } else if (fallbackCtx) {
                        fallbackCtx.drawImage(srcCanvas, 0, 0, canvas.width, canvas.height);
                    }

                    if (tNorm >= 1.0 && !paused) {
                        finished = true;
                        _finishShowcaseTimelapse({
                            ...cfg,
                            finalFillRatio: currentFillRatio,
                            flashRepDelta,
                            flashCashDelta,
                            flashAffDelta
                        });
                        return;
                    }
                    if (_showcase3D) {
                        _showcase3D.rafId = requestAnimationFrame(stepLoop);
                    }
                };

                _showcase3D = {
                    renderer,
                    scene,
                    camera,
                    srcTex,
                    rafId: requestAnimationFrame(stepLoop),
                    resizeObs
                };
            }

            function _finishShowcaseTimelapse(res) {
                _disposeShowcase3D();
                const closeX = document.getElementById('showcase-close-x');
                if (closeX) closeX.classList.remove('hidden');

                const finalPct = Math.round(Math.max(0.05, Math.min(1.0, res.finalFillRatio)) * 100);
                const peakCrowd = Math.max(1, Math.round((finalPct / 100) * res.venue.cap));
                const ticketRevenue = Math.round(peakCrowd * res.venue.ticketRev * (finalPct >= 85 ? 1.25 : 1.0));
                const totalSpent = res.totalCost + Math.abs(res.flashCashDelta || 0);
                const netProfit = ticketRevenue - totalSpent;

                let verdict = { label: 'SALLE VIDE', color: '#fb7185', rgb: '244, 63, 94', hypeDelta: -20, repDelta: -10, fansMult: 0.8 };
                if (finalPct >= 85) {
                    verdict = { label: '🔥 SOLD OUT', color: '#34d399', rgb: '16, 185, 129', hypeDelta: 25, repDelta: 25, fansMult: 9.5 };
                } else if (finalPct >= 50) {
                    verdict = { label: '✅ RÉUSSITE', color: '#38bdf8', rgb: '56, 189, 248', hypeDelta: 12, repDelta: 12, fansMult: 6.0 };
                } else if (finalPct >= 30) {
                    verdict = { label: '⚠️ MITIGÉ', color: '#fbbf24', rgb: '245, 158, 11', hypeDelta: -5, repDelta: 2, fansMult: 2.5 };
                }

                const promoRepBonus = (_showcaseSession?.promoId === 'vip' && finalPct >= 50) ? 8 : 0;
                const rivalFillPct = Math.round(48 + Math.random() * 34);
                const beatRival = finalPct > rivalFillPct;
                const rivalRepBonus = beatRival ? 10 : 0;

                const totalRepDelta = verdict.repDelta + (res.flashRepDelta || 0) + promoRepBonus + rivalRepBonus;
                const fansGain = Math.max(10, Math.round(peakCrowd * verdict.fansMult));

                logMoney(ticketRevenue, `Billetterie Showcase (${res.venue.name})`);
                logFollower(fansGain);
                state.rep = Math.max(0, (Number(state.rep) || 0) + totalRepDelta);
                state.hype = Math.max(0, Math.min(100, (Number(state.hype) || 50) + verdict.hypeDelta));

                if (res.guestName && typeof window.addRapperAffinity === 'function') {
                    window.addRapperAffinity(res.guestName, finalPct >= 50 ? 12 : -5);
                }
                if (res.proj && res.proj.albumObj && finalPct >= 50) {
                    res.proj.albumObj.sales = (Number(res.proj.albumObj.sales) || 0) + peakCrowd * 18;
                }
                if (beatRival && state.rivalState) {
                    state.rivalState.score = Math.max(600, Math.round((Number(state.rivalState.score) || 1400) * 0.94));
                }

                state.showcaseHistory = Array.isArray(state.showcaseHistory) ? state.showcaseHistory : [];
                state.showcaseHistory.push({
                    edition: _showcaseSession?.edition || 1,
                    day: state.day || 1,
                    venue: res.venue.name,
                    fillPct: finalPct,
                    netProfit
                });

                if (finalPct >= 50) {
                    if (finalPct >= 85 && typeof fireConfetti === 'function') fireConfetti('banger');
                    if (typeof playSuccess === 'function') playSuccess();
                } else if (finalPct >= 30) {
                    if (typeof playBleep === 'function') playBleep();
                } else {
                    if (typeof playError === 'function') playError();
                }

                const ov = document.getElementById('showcase-overlay');
                if (ov) ov.style.setProperty('--blive-rgb', verdict.rgb);
                const body = document.getElementById('showcase-body');
                if (body) {
                    body.innerHTML = `
                        <div class="flex items-center justify-between gap-3 bg-black/45 border border-white/10 rounded-2xl p-4">
                            <div>
                                <div class="text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-400">${res.venue.name} · BILAN</div>
                                <h2 class="text-2xl sm:text-3xl font-extrabold uppercase tracking-wider mt-0.5" style="color:${verdict.color};">${verdict.label}</h2>
                            </div>
                            <div class="text-right shrink-0">
                                <div class="text-2xl sm:text-3xl font-mono font-black text-white leading-none">${finalPct}%</div>
                                <div class="text-[10px] font-mono text-zinc-400 mt-1">${peakCrowd} / ${res.venue.cap} pers.</div>
                            </div>
                        </div>

                        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono">
                            <div class="bg-black/45 border border-white/10 rounded-xl p-3 text-center">
                                <div class="text-[9px] text-zinc-500 uppercase">Profit Net</div>
                                <div class="text-base font-extrabold ${netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'} mt-0.5">${netProfit >= 0 ? '+' : ''}$${netProfit.toLocaleString('fr-FR')}</div>
                            </div>
                            <div class="bg-black/45 border border-white/10 rounded-xl p-3 text-center">
                                <div class="text-[9px] text-zinc-500 uppercase">Fans</div>
                                <div class="text-base font-extrabold text-sky-300 mt-0.5">+${fansGain.toLocaleString('fr-FR')}</div>
                            </div>
                            <div class="bg-black/45 border border-white/10 rounded-xl p-3 text-center">
                                <div class="text-[9px] text-zinc-500 uppercase">Hype</div>
                                <div class="text-base font-extrabold ${verdict.hypeDelta >= 0 ? 'text-emerald-400' : 'text-rose-400'} mt-0.5">${verdict.hypeDelta >= 0 ? '+' : ''}${verdict.hypeDelta}%</div>
                            </div>
                            <div class="bg-black/45 border border-white/10 rounded-xl p-3 text-center">
                                <div class="text-[9px] text-zinc-500 uppercase">Réputation</div>
                                <div class="text-base font-extrabold ${totalRepDelta >= 0 ? 'text-amber-300' : 'text-rose-400'} mt-0.5">${totalRepDelta >= 0 ? '+' : ''}${totalRepDelta}</div>
                            </div>
                        </div>

                        <div class="bg-black/45 border ${beatRival ? 'border-emerald-400/40' : 'border-white/10'} rounded-xl px-3.5 py-2.5 flex items-center justify-between gap-2 text-xs font-mono">
                            <span class="text-zinc-300">TOI <strong class="text-white">${finalPct}%</strong> vs ${_escapeIdentityHtml((state.rivalState && state.rivalState.name) ? state.rivalState.name : 'KROWN // 808')} <strong class="text-rose-300">${rivalFillPct}%</strong></span>
                            <span class="${beatRival ? 'text-emerald-300 font-bold' : 'text-zinc-400'}">${beatRival ? '🏆 +10 REP' : 'Égalité / Battu'}</span>
                        </div>

                        <button type="button" onclick="window.closeBounceShowcase()" class="blive-cta w-full text-xs sm:text-sm text-center">
                            RETOUR AU STUDIO →
                        </button>
                    `;
                }

                if (typeof updateHUD === 'function') updateHUD();
                if (typeof window.renderEmpireApp === 'function') window.renderEmpireApp();
                if (typeof saveGame === 'function') saveGame();
            }

            // --- VAULT : LECTEUR AUDIO DE MASTERS & VISUALISEUR D'ONDE ---
            window._vaultPreviewTimer = null;

function initShowcaseCCTV() {}

// --- Global Bridge & ES Exports ---
Object.assign(globalThis, { SHOWCASE_VENUES, SHOWCASE_PROMOS, _disposeShowcase3D, _computeShowcaseDrawPower, _getSelectedShowcaseProject, _renderShowcaseSetup, _launchShowcaseTimelapse, _buildCctvHallBackdrop, _drawOverheadPerson, _startShowcase3DTimelapse, _finishShowcaseTimelapse, initShowcaseCCTV });
export { SHOWCASE_VENUES, SHOWCASE_PROMOS, _disposeShowcase3D, _computeShowcaseDrawPower, _getSelectedShowcaseProject, _renderShowcaseSetup, _launchShowcaseTimelapse, _buildCctvHallBackdrop, _drawOverheadPerson, _startShowcase3DTimelapse, _finishShowcaseTimelapse, initShowcaseCCTV };
