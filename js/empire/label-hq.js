            // =========================================================================
            // SYSTÈME EMPIRE OS (LABEL HQ, SYNC & PLACEMENTS, VAULT DISCOGRAPHIE),
            // CONSOLE DE MASTERING 19", BASS CHECK 18", LIVE ROOM DRUM PAD & INVITÉS 3D
            // =========================================================================
            const LABEL_ARTIST_ROSTER = [
                { id: 'kaelen', name: 'Kaelen V', role: 'Synthwave / Cyber-Plug', avatarStyle: 1, signCost: 3500, baseDaily: 680, quote: "Le son sur les Augspurger au 42e est irréel boss ! Mon prochain single va tout retourner." },
                { id: 'nora',   name: 'Nora Sol', role: 'Afro-Pop / Neo-R&B',     avatarStyle: 3, signCost: 5200, baseDaily: 950, quote: "La cabine vocale et le Neumann U87 donnent une chaleur incroyable à ma voix !" },
                { id: 'zed808', name: 'Zed 808',  role: 'UK Drill / Heavy Trap',  avatarStyle: 2, signCost: 8000, baseDaily: 1450, quote: "Quand tu pousses les subs 18 pouces en Club Mode, tout l'étage tremble !" },
                { id: 'milo',   name: 'Milo Vance', role: 'Bossa Lo-Fi / Jazz',   avatarStyle: 0, signCost: 12500, baseDaily: 2150, quote: "Ce piano à queue ébène dans la Live Room est un bijou. On refait une prise quand tu veux." }
            ];

            const SYNC_BRIEF_POOL = [
                { id: 'sync_cyber',   client: 'CYBERPUNK 2088 · JEU AAA', desc: 'Trailer mondial — Cherche un master puissant, sombre & incisif.', genres: ['Trap 808', 'Drum & Bass', 'Phonk'], minScore: 8.2, rewardMoney: 14500, rewardFans: 4200, rewardRep: 18 },
                { id: 'sync_nike',    client: 'NIKE AIR MAX · CAMPAGNE MONDIALE', desc: 'Spot TV 60s — Rythmique percutante et basse 808 chirurgicale.', genres: ['UK Drill', 'Plug', 'Trap 808'], minScore: 8.5, rewardMoney: 19000, rewardFans: 6500, rewardRep: 24 },
                { id: 'sync_netflix', client: 'NETFLIX ORIGINAL « 42e ÉTAGE »', desc: 'Générique de fin nocturne — Ambiance feutrée et mélodique.', genres: ['Bossa Lo-Fi', 'Old School', 'New Jazz'], minScore: 7.8, rewardMoney: 11200, rewardFans: 3100, rewardRep: 15 },
                { id: 'sync_boiler',  client: 'BOILER ROOM · FESTIVAL HEADLINER', desc: 'Hymne club — Master ultra-dynamique validé sur système 18 pouces.', genres: ['ALL'], minScore: 9.0, rewardMoney: 26000, rewardFans: 9000, rewardRep: 32 },
                { id: 'sync_afro',    client: 'CANAL+ · DOCUMENTAIRE CULTURE', desc: 'Bande originale estivale & percussions solaires.', genres: ['Afro-Pop', 'Amapiano', '2 Step'], minScore: 7.6, rewardMoney: 10500, rewardFans: 3800, rewardRep: 14 },
                { id: 'sync_porsche', client: 'PORSCHE ELECTRIC · SPOT CINÉMA', desc: 'Design sonore futuriste haute précision et tension rythmique.', genres: ['Drum & Bass', '2 Step', 'New Jazz'], minScore: 8.4, rewardMoney: 17500, rewardFans: 5200, rewardRep: 22 },
                { id: 'sync_gta',     client: 'VICE RADIO · STATION IN-GAME', desc: 'Rotation radio nocturne — Banger de rue certifié.', genres: ['UK Drill', 'Old School', 'Phonk', 'Plug'], minScore: 8.0, rewardMoney: 15800, rewardFans: 5800, rewardRep: 20 },
                { id: 'sync_luxury',  client: 'FASHION WEEK PARIS · DÉFILÉ HAUTE COUTURE', desc: 'Catwalk principal — Signature sonore avant-gardiste.', genres: ['ALL'], minScore: 8.8, rewardMoney: 22000, rewardFans: 7200, rewardRep: 26 }
            ];

            window._activeSyncBriefIds = ['sync_cyber', 'sync_nike', 'sync_netflix', 'sync_boiler'];

            function _getTrackSyncKey(t) {
                return t ? (t.id || `${t.title || 'UNTITLED'}::${t.date || 0}::${t.score || 0}`) : '';
            }

            function _isTrackEligibleForSyncBrief(t, brief, placedKeys) {
                if (!t || !brief) return false;
                const key = _getTrackSyncKey(t);
                if (Array.isArray(placedKeys) && placedKeys.includes(key)) return false;
                const sc = Number(t.score) || 0;
                if (sc < brief.minScore) return false;
                if (brief.genres.includes('ALL')) return true;
                const tg = String(t.genre || '').toLowerCase();
                const tid = String(t.genreId || '').toLowerCase();
                return brief.genres.some(g => {
                    const gl = g.toLowerCase();
                    return tg === gl || tg.includes(gl) || gl.includes(tg) || (tid && gl.includes(tid));
                });
            }

            // Profils de Mastering optimaux par style musical (finit le pré-réglage auto-opti!)

            window.getLabelDailyRoyalties = function() {
                const st = typeof state !== 'undefined' ? state : null;
                if (!st || !Array.isArray(st.signedArtists)) return 0;
                const mults = st.artistRoyaltyMults || {};
                let total = 0;
                st.signedArtists.forEach(id => {
                    const art = LABEL_ARTIST_ROSTER.find(a => a.id === id);
                    if (art) {
                        const m = Number(mults[id]) || 1.0;
                        total += Math.round(art.baseDaily * m);
                    }
                });
                return total;
            };

            window.payDailyLabelRoyalties = function() {
                const daily = window.getLabelDailyRoyalties();
                if (daily > 0 && typeof logMoney === 'function') {
                    const lbl = (state && state.labelName) ? state.labelName : '42E RECORDS';
                    logMoney(daily, `Royalties Label (${lbl})`);
                    if (typeof showToast === 'function') {
                        showToast(`🏢 ${lbl} : +$${daily} de royalties passives encaissées par ton roster !`, "success");
                    }
                }
                window.updateEmpireTopPills();
            };

            function _escapeIdentityHtml(s) {
                return String(s || '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
            }

            window.updateEmpireTopPills = function() {
                const daily = window.getLabelDailyRoyalties();
                const signedCount = (typeof state !== 'undefined' && state && Array.isArray(state.signedArtists)) ? state.signedArtists.length : 0;
                const labelText = (typeof state !== 'undefined' && state && state.labelName) ? state.labelName : '42E RECORDS';
                const p0 = document.getElementById('empire-header-label-pill');
                const p1 = document.getElementById('os-label-royalties-pill');
                const p2 = document.getElementById('empire-header-royalties');
                const p3 = document.getElementById('empire-header-artists');
                const p4 = document.getElementById('label-daily-income-big');
                const p5 = document.getElementById('label-releases-count');
                if (p0) p0.textContent = labelText;
                if (p1) p1.textContent = `+$${daily}/j`;
                if (p2) p2.textContent = `+$${daily}/jour`;
                if (p3) p3.textContent = `${signedCount}/${LABEL_ARTIST_ROSTER.length}`;
                if (p4) p4.textContent = `+$${daily} / jour`;
                if (p5 && typeof state !== 'undefined' && state) p5.textContent = `${state.labelSinglesCount || 0} Singles`;
            };

            window.openEmpireApp = function(tab) {
                if (typeof openApp === 'function') openApp('app-empire');
                if (tab) window.switchEmpireTab(tab);
            };

            window.switchEmpireTab = function(tab) {
                window._activeEmpireTab = tab || 'label';
                ['label', 'albums', 'sync', 'network', 'vault'].forEach(t => {
                    const btn = document.getElementById('tab-empire-' + t);
                    const view = document.getElementById('empire-view-' + t);
                    const active = (t === window._activeEmpireTab);
                    if (view) view.classList.toggle('hidden', !active);
                    if (btn) {
                        btn.className = active ? 'tech-tab-btn is-active flex-1 whitespace-nowrap' : 'tech-tab-btn flex-1 whitespace-nowrap';
                    }
                });
                if (window._activeEmpireTab !== 'vault') window.stopVaultPreview();
                window.renderEmpireApp();
                if (window._activeEmpireTab === 'label' && typeof state !== 'undefined' && state && !state.labelNamed && typeof window.openNarrativeIdentityModal === 'function') {
                    window.openNarrativeIdentityModal('label');
                } else if (window._activeEmpireTab === 'network' && typeof state !== 'undefined' && state && !state.rivalNamed && typeof window.openNarrativeIdentityModal === 'function') {
                    window.openNarrativeIdentityModal('rival');
                }
            };

            window.renamePlayerLabel = function(val) {
                if (typeof state === 'undefined' || !state) return;
                const clean = (val || '').trim().toUpperCase().slice(0, 22) || '42E RECORDS';
                state.labelName = clean;
                state.labelNamed = true;
                if (typeof window.refreshCityDynamicSigns === 'function') window.refreshCityDynamicSigns();
                if (typeof window.renderEmpireApp === 'function') window.renderEmpireApp();
                if (typeof saveGame === 'function') saveGame();
                showToast(`🏢 Nom du Label mis à jour : ${clean}`, "info");
            };

            window.renamePlayerRival = function(val) {
                if (typeof state === 'undefined' || !state) return;
                const clean = (val || '').trim().toUpperCase().slice(0, 22) || 'KROWN // 808';
                state.rivalState = state.rivalState || { name: clean, score: 1400, winsAgainst: 0, lastClashDay: 0 };
                state.rivalState.name = clean;
                state.rivalNamed = true;
                if (typeof window.refreshCityDynamicSigns === 'function') window.refreshCityDynamicSigns();
                if (typeof saveGame === 'function') saveGame();
                if (typeof window.renderEmpireApp === 'function') window.renderEmpireApp();
                showToast(`⚔️ Nom du Pire Ennemi mis à jour : ${clean}`, "info");
            };

            window.openNarrativeIdentityModal = function(kind, onDone) {
                if (typeof state === 'undefined' || !state) return false;
                const isLabel = (kind === 'label');
                if (isLabel && state.labelNamed) return false;
                if (!isLabel && state.rivalNamed) return false;

                const ov = document.getElementById('ceremony-overlay');
                const body = document.getElementById('ceremony-body');
                const meta = document.getElementById('ceremony-meta');
                if (!ov || !body) return false;

                state.isEventActive = true;
                ov.style.setProperty('--evt-rgb', isLabel ? '56, 189, 248' : '244, 63, 94');
                if (meta) meta.textContent = isLabel ? 'CHAPITRE EMPIRE · FONDATION' : 'ALERTE CLASH · RIVALITÉ';

                const defaultVal = isLabel
                    ? ((state.labelName && state.labelName !== '42E RECORDS') ? state.labelName : '')
                    : ((state.rivalState && state.rivalState.name && state.rivalState.name !== 'KROWN // 808') ? state.rivalState.name : '');
                const placeholder = isLabel ? '42E RECORDS' : 'KROWN // 808';
                const chips = isLabel
                    ? ['NOCTURNE REC', '808 EMPIRE', '42E RECORDS']
                    : ['KROWN // 808', 'DR. GLITCH', 'VORTEX 99'];

                body.innerHTML = `
                    <div class="flex flex-col gap-3.5">
                        <div>
                            <div class="text-[10px] font-mono uppercase tracking-[0.22em] ${isLabel ? 'text-sky-300' : 'text-rose-300'} mb-1">
                                ${isLabel ? '🏢 TON PROPRE LABEL' : '⚔️ UN PIRE ENNEMI ENTRE EN SCÈNE'}
                            </div>
                            <h3 class="text-lg sm:text-xl font-extrabold uppercase tracking-wider text-white">
                                ${isLabel ? 'Baptise ton Label' : 'Nomme ton Pire Ennemi'}
                            </h3>
                            <p class="text-xs sm:text-[13px] text-zinc-300 leading-relaxed mt-1.5">
                                ${isLabel
                                    ? "Ton nom tourne dans toute la ville. Il est temps d'officialiser ta propre structure, de signer tes premiers artistes et d'imposer ton empreinte sur l'industrie."
                                    : "Un producteur arrogant vient de te piquer un placement et te provoque en direct sur les réseaux. Un seul d'entre vous finira #1 du Top 10. Comment s'appelle-t-il ?"}
                            </p>
                        </div>

                        <div class="flex flex-col gap-2">
                            <input id="narrative-identity-input" type="text" maxlength="22" autocomplete="off"
                                value="${_escapeIdentityHtml(defaultVal)}"
                                placeholder="${placeholder}"
                                class="w-full bg-[#06070a] border ${isLabel ? 'border-sky-400/45 focus:border-sky-300' : 'border-rose-400/45 focus:border-rose-300'} rounded-xl px-3.5 py-2.5 text-sm font-mono font-bold text-white uppercase tracking-[0.14em] focus:outline-none" />
                            <div class="flex flex-wrap gap-1.5">
                                ${chips.map(c => `<button type="button" data-id-chip="${c}" class="px-2.5 py-1 rounded-lg text-[10px] font-mono uppercase tracking-wider bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 transition">${c}</button>`).join('')}
                            </div>
                        </div>

                        <button type="button" id="narrative-identity-confirm" class="gta-evt-choice text-center !py-3" style="--choice-rgb: ${isLabel ? '56, 189, 248' : '244, 63, 94'};">
                            <span class="text-xs font-extrabold uppercase tracking-[0.18em] ${isLabel ? 'text-sky-200' : 'text-rose-200'}">
                                ${isLabel ? 'Officialiser le Label →' : 'Graver son Nom →'}
                            </span>
                        </button>
                    </div>
                `;

                ov.classList.remove('hidden');
                ov.classList.add('flex');

                const inp = document.getElementById('narrative-identity-input');
                const confirmBtn = document.getElementById('narrative-identity-confirm');
                body.querySelectorAll('[data-id-chip]').forEach(btn => {
                    btn.onclick = () => {
                        if (inp) { inp.value = btn.getAttribute('data-id-chip') || ''; inp.focus(); }
                    };
                });

                const submitChoice = () => {
                    const clean = ((inp && inp.value) || '').trim().toUpperCase().slice(0, 22) || placeholder;
                    if (isLabel) {
                        state.labelName = clean;
                        state.labelNamed = true;
                        if (typeof fireConfetti === 'function') fireConfetti('banger');
                        if (typeof playSuccess === 'function') playSuccess();
                        showToast(`🏢 Label fondé : ${clean} !`, "success");
                    } else {
                        state.rivalState = state.rivalState || { name: clean, score: 1400, winsAgainst: 0, lastClashDay: 0 };
                        state.rivalState.name = clean;
                        state.rivalNamed = true;
                        if (typeof playBleep === 'function') playBleep();
                        showToast(`⚔️ Rivalité déclarée contre ${clean} !`, "info");
                    }
                    if (typeof window.refreshCityDynamicSigns === 'function') window.refreshCityDynamicSigns();
                    if (typeof window.closeCeremonyOverlay === 'function') window.closeCeremonyOverlay();
                    if (typeof window.renderEmpireApp === 'function') window.renderEmpireApp();
                    if (typeof saveGame === 'function') saveGame();
                    if (typeof onDone === 'function') onDone(clean);
                };

                if (confirmBtn) confirmBtn.onclick = submitChoice;
                if (inp) {
                    inp.onkeydown = (e) => { if (e.key === 'Enter') { e.preventDefault(); submitChoice(); } };
                    setTimeout(() => inp.focus(), 60);
                }
                return true;
            };

            window.signLabelArtist = function(artistId) {
                if (typeof state === 'undefined' || !state) return;
                const art = LABEL_ARTIST_ROSTER.find(a => a.id === artistId);
                if (!art) return;
                state.signedArtists = Array.isArray(state.signedArtists) ? state.signedArtists : [];
                if (state.signedArtists.includes(artistId)) return;
                if ((state.money || 0) < art.signCost) {
                    showToast(`Fonds insuffisants ($${art.signCost} requis pour signer ${art.name}).`, "error");
                    if (typeof playError === 'function') playError();
                    return;
                }
                logMoney(-art.signCost, `Signature Label : ${art.name}`);
                state.signedArtists.push(artistId);
                state.rep = (Number(state.rep) || 0) + 12;
                if (typeof updateHUD === 'function') updateHUD();
                window.syncProStudioGuests3D();
                window.renderEmpireApp();
                if (typeof saveGame === 'function') saveGame();
                try { if (typeof playSuccess === 'function') playSuccess(); } catch(e) {}
                showToast(`✍️ ${art.name} a rejoint ton Label et vient d'arriver en 3D dans ton Studio Pro !`, "success");
            };

            window.produceLabelArtistSingle = function(artistId) {
                if (typeof state === 'undefined' || !state) return;
                const art = LABEL_ARTIST_ROSTER.find(a => a.id === artistId);
                if (!art) return;
                state.artistLastSingleDay = state.artistLastSingleDay || {};
                const today = state.day || 1;
                if (state.artistLastSingleDay[artistId] === today) {
                    showToast(`${art.name} a déjà sorti un single aujourd'hui (1/jour par artiste). Reviens demain !`, "info");
                    if (typeof playBleep === 'function') playBleep();
                    return;
                }
                if ((state.energy || 0) < 15 || (state.inspi || 0) < 10) {
                    showToast("Il te faut au moins 15% NRJ et 10% INSPI pour produire un single Label.", "warning");
                    return;
                }
                state.energy = Math.max(0, state.energy - 15);
                state.inspi = Math.max(0, state.inspi - 10);
                state.artistLastSingleDay[artistId] = today;
                state.artistRoyaltyMults = state.artistRoyaltyMults || {};
                const prevMult = Number(state.artistRoyaltyMults[artistId]) || 1.0;
                const nextMult = Math.min(3.5, Math.round((prevMult + 0.30) * 100) / 100);
                state.artistRoyaltyMults[artistId] = nextMult;
                state.labelSinglesCount = (Number(state.labelSinglesCount) || 0) + 1;
                const instantDrop = Math.round(art.baseDaily * 1.25 * Math.min(2.0, nextMult));
                logMoney(instantDrop, `Sortie Single Label (${art.name})`);
                logFollower(1000);
                state.rep = (Number(state.rep) || 0) + 8;
                if (typeof updateHUD === 'function') updateHUD();
                window.renderEmpireApp();
                if (typeof saveGame === 'function') saveGame();
                try { if (typeof playSuccess === 'function') playSuccess(); } catch(e) {}
                const capNote = nextMult >= 3.5 ? ' (Catalogue au pic ×3.5 !)' : ` (Royalties ×${nextMult.toFixed(2)})`;
                showToast(`💿 Single produit pour ${art.name} ! +$${instantDrop} & +1000 Fans${capNote}`, "success");
            };

            window.refreshSyncBriefs = function(paid) {
                if (paid && typeof state !== 'undefined' && state) {
                    const today = state.day || 1;
                    if (state.lastSyncRefreshDay === today) {
                        showToast("Tu as déjà renouvelé les briefs Sync aujourd'hui. Reviens demain !", "info");
                        return;
                    }
                    if ((state.money || 0) < 500) {
                        showToast("Fonds insuffisants ($500 requis).", "error");
                        return;
                    }
                    logMoney(-500, "Renouvellement Briefs Sync");
                    state.lastSyncRefreshDay = today;
                }
                // Sélectionne 4 nouveaux briefs non encore complétés (ou rotation du pool de 8)
                const done = (typeof state !== 'undefined' && state && Array.isArray(state.completedSyncIds)) ? state.completedSyncIds : [];
                const remaining = SYNC_BRIEF_POOL.filter(b => !done.includes(b.id));
                const source = remaining.length >= 4 ? remaining : SYNC_BRIEF_POOL;
                const shuffled = [...source].sort(() => Math.random() - 0.5);
                window._activeSyncBriefIds = shuffled.slice(0, 4).map(b => b.id);
                if (typeof saveGame === 'function') saveGame();
                window.renderEmpireApp();
                if (paid) showToast("🎬 4 nouveaux contrats de Synchronisation reçus !", "info");
            };

            window.submitTrackToSyncBrief = function(briefId) {
                if (typeof state === 'undefined' || !state) return;
                const brief = SYNC_BRIEF_POOL.find(b => b.id === briefId);
                if (!brief) return;
                state.completedSyncIds = Array.isArray(state.completedSyncIds) ? state.completedSyncIds : [];
                state.placedSyncTrackKeys = Array.isArray(state.placedSyncTrackKeys) ? state.placedSyncTrackKeys : [];
                if (state.completedSyncIds.includes(briefId)) return;

                const tracks = Array.isArray(state.trackList) ? state.trackList : [];
                const matching = tracks
                    .filter(t => _isTrackEligibleForSyncBrief(t, brief, state.placedSyncTrackKeys))
                    .sort((a, b) => (Number(b.score) || 0) - (Number(a.score) || 0));

                if (matching.length === 0) {
                    showToast(`Aucun master libre éligible dans ton Vault (Requis: ${brief.genres.join(' / ')} · Note ≥ ${brief.minScore}/10 · Non déjà placé).`, "warning");
                    if (typeof playError === 'function') playError();
                    return;
                }
                const best = matching[0];
                state.completedSyncIds.push(briefId);
                state.placedSyncTrackKeys.push(_getTrackSyncKey(best));

                logMoney(brief.rewardMoney, `Sync Deal : ${brief.client}`);
                logFollower(brief.rewardFans);
                state.rep = (Number(state.rep) || 0) + brief.rewardRep;
                if (typeof updateHUD === 'function') updateHUD();
                window.renderEmpireApp();
                if (typeof saveGame === 'function') saveGame();
                try { if (typeof fireConfetti === 'function') fireConfetti('store'); if (typeof playCashSound === 'function') playCashSound(); } catch(e) {}
                showToast(`🎬 PLACEMENT VALIDÉ ! « ${best.title} » (${best.score}/10) signé chez ${brief.client} (+$${brief.rewardMoney.toLocaleString()} & +${brief.rewardFans} Fans)`, "success");
            };

            // =========================================================================
            // CHANTIER 4A : AFFINITÉ RAPPEURS (CARNET D'ADRESSES, APPEL DIRECT & FEATS)
            // =========================================================================
            window.getRapperAffinity = function(name) {
                if (!name || typeof state === 'undefined' || !state) return 0;
                state.rapperAffinity = state.rapperAffinity || {};
                return Math.max(0, Math.min(100, Number(state.rapperAffinity[name]) || 0));
            };

            window.getRapperAffinityMeta = function(score) {
                const s = Math.max(0, Math.min(100, Number(score) || 0));
                if (s >= 90) return { tier: 4, label: 'FRÈRE DE SON ★', acceptBonus: 30, featBonus: 1.2, color: '#fbbf24', pillCls: 'live' };
                if (s >= 60) return { tier: 3, label: 'CERCLE PRIVÉ',   acceptBonus: 25, featBonus: 0.9, color: '#38bdf8', pillCls: 'signal' };
                if (s >= 25) return { tier: 2, label: 'PARTENAIRE',     acceptBonus: 15, featBonus: 0.5, color: '#34d399', pillCls: 'live' };
                return              { tier: 1, label: 'CONTACT',        acceptBonus: 0,  featBonus: 0,   color: '#94a3b8', pillCls: '' };
            };

            window.addRapperAffinity = function(name, delta) {
                if (!name || typeof state === 'undefined' || !state) return 0;
                state.rapperAffinity = state.rapperAffinity || {};
                const prev = Number(state.rapperAffinity[name]) || 0;
                const next = Math.max(0, Math.min(100, prev + (Number(delta) || 0)));
                state.rapperAffinity[name] = next;
                const prevTier = window.getRapperAffinityMeta(prev).tier;
                const nextTier = window.getRapperAffinityMeta(next).tier;
                if (nextTier > prevTier && typeof showToast === 'function') {
                    const meta = window.getRapperAffinityMeta(next);
                    showToast(`🤝 Affinité avec ${name} → ${meta.label} (${next}/100) !`, "success");
                }
                return next;
            };

            window.callRapperForDirectCollab = function(name) {
                if (!name || typeof state === 'undefined' || !state) return;
                const aff = window.getRapperAffinity(name);
                if (aff < 60) {
                    showToast(`Atteins 60/100 d'affinité avec ${name} pour l'appeler en direct.`, "warning");
                    return;
                }
                state.artistDirectCollabDay = state.artistDirectCollabDay || {};
                const today = state.day || 1;
                if (state.artistDirectCollabDay[name] === today) {
                    showToast(`${name} est déjà en studio aujourd'hui. Rappelle-le demain !`, "info");
                    return;
                }
                state.artistDirectCollabDay[name] = today;
                const isKnown = (typeof rappersConnus !== 'undefined' && rappersConnus.includes(name));
                if (typeof triggerRandomEvent === 'function') {
                    triggerRandomEvent(isKnown ? 'collab_known' : 'collab', name);
                }
            };

            // =========================================================================
            // CHANTIER 4B : PROJETS EP / ALBUM (3 À 5 TRACKS + DISQUES D'OR 3D)
            // =========================================================================
            window._selectedAlbumTrackKeys = [];

            window.toggleAlbumTrackPick = function(trackKey) {
                const idx = window._selectedAlbumTrackKeys.indexOf(trackKey);
                if (idx >= 0) {
                    window._selectedAlbumTrackKeys.splice(idx, 1);
                } else {
                    if (window._selectedAlbumTrackKeys.length >= 5) {
                        showToast("Maximum 5 masters par EP/Album.", "info");
                        return;
                    }
                    window._selectedAlbumTrackKeys.push(trackKey);
                }
                if (typeof playBleep === 'function') playBleep();
                window.renderEmpireApp();
            };

            window.releasePlayerAlbum = function() {
                if (typeof state === 'undefined' || !state) return;
                const tracks = Array.isArray(state.trackList) ? state.trackList : [];
                const picked = tracks.filter(t => window._selectedAlbumTrackKeys.includes(_getTrackSyncKey(t)));
                if (picked.length < 3) {
                    showToast("Sélectionne au moins 3 masters du Vault pour sortir un EP/Album.", "warning");
                    if (typeof playError === 'function') playError();
                    return;
                }
                if ((state.money || 0) < 500) {
                    showToast("Il faut $500 de budget promo/pressing pour lancer l'album.", "error");
                    if (typeof playError === 'function') playError();
                    return;
                }
                const titleInput = document.getElementById('album-title-input');
                const featSelect = document.getElementById('album-feat-select');
                const albumTitle = (titleInput && titleInput.value.trim()) ? titleInput.value.trim().toUpperCase() : `PROJET VOL.${(state.albums?.length || 0) + 1}`;
                const featArtist = featSelect ? featSelect.value : '';
                const featAff = featArtist ? window.getRapperAffinity(featArtist) : 0;
                const featBonus = featArtist ? window.getRapperAffinityMeta(featAff).featBonus : 0;

                const avgRaw = picked.reduce((s, t) => s + (Number(t.score) || 0), 0) / picked.length;
                const uniqueGenres = new Set(picked.map(t => String(t.genre || '').toLowerCase())).size;
                const cohesionBonus = uniqueGenres <= 2 ? 0.5 : (uniqueGenres === 3 ? 0.3 : 0.15);
                const finalAlbumScore = Math.min(10, Math.round((avgRaw + cohesionBonus + featBonus) * 10) / 10);

                let cert = 'ARGENT', mult = 1.0;
                if (finalAlbumScore >= 9.4)      { cert = 'DIAMANT';    mult = 2.6; }
                else if (finalAlbumScore >= 8.8) { cert = '2× PLATINE'; mult = 2.0; }
                else if (finalAlbumScore >= 8.2) { cert = 'PLATINE';    mult = 1.55; }
                else if (finalAlbumScore >= 7.4) { cert = 'OR';         mult = 1.25; }

                logMoney(-500, `Promo Album : ${albumTitle}`);
                const firstWeekSales = Math.round((1200 + (state.followers || 0) * 0.35 + picked.length * 600) * (finalAlbumScore / 7) * mult);
                const albumCash = Math.round((1800 + picked.length * 750) * (finalAlbumScore / 7) * mult * Math.min(2.0, state.multiplier || 1));
                const albumFans = Math.round(firstWeekSales * 0.45);
                const albumRep = Math.round(18 * mult);

                state.albums = Array.isArray(state.albums) ? state.albums : [];
                state.albums.unshift({
                    id: `alb_${Date.now()}`,
                    title: albumTitle,
                    trackCount: picked.length,
                    featArtist: featArtist || null,
                    score: finalAlbumScore,
                    cert,
                    sales: firstWeekSales,
                    cash: albumCash,
                    day: state.day || 1
                });

                logMoney(albumCash, `Sortie Album « ${albumTitle} » (${cert})`);
                logFollower(albumFans);
                state.rep = (Number(state.rep) || 0) + albumRep;
                if (featArtist) window.addRapperAffinity(featArtist, 12);

                window._selectedAlbumTrackKeys = [];
                if (titleInput) titleInput.value = '';
                if (typeof window.syncCareerWallDiscs === 'function') window.syncCareerWallDiscs();
                if (typeof fireConfetti === 'function') fireConfetti('banger');
                if (typeof playSuccess === 'function') playSuccess();
                if (typeof updateHUD === 'function') updateHUD();
                window.renderEmpireApp();
                if (typeof saveGame === 'function') saveGame();
                showToast(`💿 ALBUM « ${albumTitle} » CERTIFIÉ ${cert} (${finalAlbumScore}/10) · ${firstWeekSales.toLocaleString('fr-FR')} ventes Sem. 1 · +$${albumCash.toLocaleString('fr-FR')} !`, "success");
            };

            // =========================================================================
            // CHANTIER 4C : RIVALITÉ PRODUCTEUR & CLASSEMENT TOP 10 VIVANT
            // =========================================================================
            const INDUSTRY_TOP10_PRODS = [
                { name: 'KROWN // 808', isRival: true, style: 'Trap / Dark Drill', base: 1400 },
                { name: 'METRO VEX',    style: 'Cinematic 808', base: 4200 },
                { name: 'SORA BEATS',   style: 'Afro / Amapiano', base: 3100 },
                { name: 'NOVA SSL',     style: 'Plug / New Jazz', base: 2450 },
                { name: 'KAZE 909',     style: 'Drum & Bass / 2 Step', base: 1850 },
                { name: 'DANTE TAPE',   style: 'Old School / Lo-Fi', base: 1250 },
                { name: 'YUKI PHONK',   style: 'Phonk / Club', base: 920 },
                { name: 'LÉO VINYL',    style: 'Bossa Lo-Fi', base: 640 },
                { name: 'BASSLINE Z',   style: 'UK Drill', base: 380 }
            ];

            window.getPlayerProducerPower = function() {
                const st = typeof state !== 'undefined' ? state : {};
                const foll = Number(st.followers) || 0;
                const rep = Number(st.rep) || 0;
                const bangers = Number(st.stats && st.stats.bangers) || 0;
                const albums = Array.isArray(st.albums) ? st.albums.length : 0;
                const trophies = Array.isArray(st.trophies) ? st.trophies.length : 0;
                return Math.round(foll * 0.08 + rep * 18 + bangers * 110 + albums * 420 + trophies * 350);
            };

            window.getProducerLeaderboard = function() {
                const st = typeof state !== 'undefined' ? state : {};
                const day = Number(st.day) || 1;
                const rScore = (st.rivalState && Number(st.rivalState.score)) ? Number(st.rivalState.score) : (1400 + day * 45);
                const rName = (st.rivalState && st.rivalState.name) ? st.rivalState.name : 'KROWN // 808';
                const list = INDUSTRY_TOP10_PRODS.map(p => ({
                    name: p.isRival ? rName : p.name,
                    style: p.style,
                    isRival: Boolean(p.isRival),
                    isPlayer: false,
                    score: p.isRival ? Math.round(rScore) : Math.round(p.base + day * 18)
                }));
                list.push({
                    name: (st.username || 'TOI').toUpperCase(),
                    style: (st.labelName || '42E RECORDS'),
                    isRival: false,
                    isPlayer: true,
                    score: window.getPlayerProducerPower()
                });
                return list.sort((a, b) => b.score - a.score).slice(0, 10);
            };

            window.isPlayerRankOneProducer = function() {
                const lb = window.getProducerLeaderboard();
                return Boolean(lb.length > 0 && lb[0].isPlayer);
            };

            window.challengeRivalProducer = function() {
                if (typeof state === 'undefined' || !state) return;
                state.rivalState = state.rivalState || { name: 'KROWN // 808', score: 1400, winsAgainst: 0, lastClashDay: 0 };
                const rivName = state.rivalState.name || 'KROWN // 808';
                const today = state.day || 1;
                if (state.rivalState.lastClashDay === today) {
                    showToast(`Tu as déjà défié ${rivName} aujourd'hui. Laisse la poussière retomber jusqu'à demain !`, "info");
                    return;
                }
                if ((state.energy || 0) < 20) {
                    showToast(`Il te faut 20% d'énergie pour défier ${rivName} en Beat Battle !`, "warning");
                    return;
                }
                state.energy = Math.max(0, state.energy - 20);
                state.rivalState.lastClashDay = today;

                const myPow = window.getPlayerProducerPower();
                const rivPow = Number(state.rivalState.score) || 1400;
                const winProb = Math.max(25, Math.min(85, Math.round(50 + ((myPow - rivPow) / Math.max(800, rivPow)) * 35)));

                if (Math.random() * 100 <= winProb) {
                    const cashWin = 1200 + Math.floor(Math.random() * 1300);
                    const fansWin = 1500 + Math.floor(Math.random() * 1500);
                    state.rivalState.score = Math.max(600, Math.round(rivPow * 0.86));
                    state.rivalState.winsAgainst = (state.rivalState.winsAgainst || 0) + 1;
                    logMoney(cashWin, `Beat Battle gagné vs ${state.rivalState.name}`);
                    logFollower(fansWin);
                    state.rep = (Number(state.rep) || 0) + 18;
                    if (typeof fireConfetti === 'function') fireConfetti('banger');
                    if (typeof playSuccess === 'function') playSuccess();
                    showToast(`⚔️ VICTOIRE BEAT BATTLE contre ${state.rivalState.name} ! +$${cashWin} · +${fansWin} Fans · +18 REP !`, "success");
                } else {
                    state.rivalState.score = Math.round(rivPow * 1.08);
                    state.rep = Math.max(0, (Number(state.rep) || 0) - 8);
                    if (typeof playError === 'function') playError();
                    showToast(`⚔️ ${state.rivalState.name} a remporté le clash (${winProb}% de chances). -8 REP — prépare un plus gros master !`, "error");
                }
                if (typeof updateHUD === 'function') updateHUD();
                window.renderEmpireApp();
                if (typeof saveGame === 'function') saveGame();
            };

            // =========================================================================
            // CHANTIER 4D : CÉRÉMONIES BOUNCE AWARDS & 3 FINS DE CARRIÈRE + PRESTIGE
            // =========================================================================
            window.closeCeremonyOverlay = function() {
                const ov = document.getElementById('ceremony-overlay');
                if (ov) {
                    ov.classList.add('hidden');
                    ov.classList.remove('flex');
                }
                if (typeof state !== 'undefined' && state) state.isEventActive = false;
            };

            window.openBounceAwardsCeremony = function(isAuto = false) {
                if (typeof state === 'undefined' || !state) return;
                const today = state.day || 1;
                if (!isAuto && (today - (state.lastCeremonyDay || 0)) < 7 && (state.awardsHistory?.length || 0) > 0) {
                    const left = 7 - (today - (state.lastCeremonyDay || 0));
                    showToast(`Prochaine édition des Bounce Awards disponible dans ${left} jour(s) in-game !`, "info");
                    return;
                }
                state.isEventActive = true;
                if (typeof window.enforceFpsModalPriority === 'function') window.enforceFpsModalPriority();
                state.lastCeremonyDay = today;

                const edition = (state.awardsHistory?.length || 0) + 1;
                const tracks = Array.isArray(state.trackList) ? state.trackList : [];
                const albums = Array.isArray(state.albums) ? state.albums : [];
                const bestTrack = tracks.slice().sort((a, b) => (b.score || 0) - (a.score || 0))[0];
                const bestAlbum = albums.slice().sort((a, b) => (b.score || 0) - (a.score || 0))[0];
                const maxAff = Object.values(state.rapperAffinity || {}).reduce((m, v) => Math.max(m, Number(v) || 0), 0);

                const categories = [
                    {
                        id: 'beatmaker_year',
                        title: 'Beatmaker de l\'Année',
                        icon: '🎛️',
                        won: ((state.stats?.bangers || 0) >= 3 && (bestTrack?.score || 0) >= 8.2),
                        detail: bestTrack ? `Meilleur master : « ${bestTrack.title} » (${bestTrack.score}/10)` : 'Produis au moins 3 Bangers (8.2+/10)',
                        cash: 2500, rep: 25
                    },
                    {
                        id: 'album_year',
                        title: 'Album / Projet de l\'Année',
                        icon: '💿',
                        won: Boolean(bestAlbum && bestAlbum.score >= 8.0),
                        detail: bestAlbum ? `« ${bestAlbum.title} » · ${bestAlbum.cert} (${bestAlbum.score}/10)` : 'Sors un EP/Album noté ≥ 8.0/10 dans Empire OS',
                        cash: 4500, rep: 35
                    },
                    {
                        id: 'industry_mogul',
                        title: 'Roi de l\'Industrie',
                        icon: '👑',
                        won: ((state.signedArtists?.length || 0) >= 1 || (state.completedSyncIds?.length || 0) >= 1 || window.isPlayerRankOneProducer()),
                        detail: `Label ${(state.signedArtists?.length || 0)} artistes · ${(state.completedSyncIds?.length || 0)} Sync Deals`,
                        cash: 3500, rep: 30
                    },
                    {
                        id: 'soundnet_public',
                        title: 'Prix du Public & Réseau',
                        icon: '🔥',
                        won: ((state.followers || 0) >= 8000 || maxAff >= 60),
                        detail: `${(state.followers || 0).toLocaleString('fr-FR')} Fans · Affinité max ${maxAff}/100`,
                        cash: 2000, rep: 20
                    }
                ];

                let totalCash = 0, totalRep = 0, wins = 0;
                state.trophies = Array.isArray(state.trophies) ? state.trophies : [];
                categories.forEach(c => {
                    if (c.won) {
                        wins++;
                        totalCash += c.cash;
                        totalRep += c.rep;
                        if (!state.trophies.some(t => t.id === c.id && t.edition === edition)) {
                            state.trophies.push({ id: c.id, title: c.title, icon: c.icon, edition, day: today });
                        }
                    }
                });

                state.awardsHistory = Array.isArray(state.awardsHistory) ? state.awardsHistory : [];
                state.awardsHistory.push({ edition, day: today, wins });
                if (totalCash > 0) logMoney(totalCash, `Bounce Awards #${edition} (${wins} Trophée${wins > 1 ? 's' : ''})`);
                if (totalRep > 0) state.rep = (Number(state.rep) || 0) + totalRep;

                const ov = document.getElementById('ceremony-overlay');
                const body = document.getElementById('ceremony-body');
                const meta = document.getElementById('ceremony-meta');
                if (meta) meta.textContent = `ÉDITION #${edition} · JOUR ${today}`;
                if (body) {
                    body.innerHTML = `
                        <div class="gta-evt-title-block">
                            <div class="text-[10px] font-mono uppercase tracking-[0.26em] text-amber-400">SOIRÉE OFFICIELLE · PALAIS DU SON</div>
                            <h2 class="text-2xl sm:text-3xl font-extrabold tracking-[0.14em] uppercase text-white mt-0.5">BOUNCE AWARDS #${edition}</h2>
                        </div>
                        <p class="text-xs sm:text-sm text-zinc-300">
                            ${wins > 0
                                ? `Triomphe sur tapis rouge ! Tu repars avec <strong class="text-amber-300">${wins} trophée${wins > 1 ? 's' : ''} officiel${wins > 1 ? 's' : ''}</strong> (+$${totalCash.toLocaleString('fr-FR')} · +${totalRep} REP).`
                                : `Tu étais nominé cette saison, mais la concurrence a pris les statuettes. Sors un Album ou signe un artiste pour dominer la prochaine édition !`}
                        </p>
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            ${categories.map(c => `
                                <div class="rounded-xl p-3.5 border ${c.won ? 'bg-amber-500/12 border-amber-400/50 shadow-[0_0_24px_rgba(245,158,11,0.14)]' : 'bg-black/45 border-white/10 opacity-75'}">
                                    <div class="flex items-center justify-between gap-2">
                                        <span class="text-xs font-extrabold uppercase tracking-wider text-white">${c.icon} ${c.title}</span>
                                        <span class="gta-evt-badge" style="${c.won ? 'background:rgba(245,158,11,0.22);border-color:rgba(245,158,11,0.6);color:#fde68a;' : ''}">${c.won ? '★ REMPORTÉ' : 'NOMINÉ'}</span>
                                    </div>
                                    <div class="text-[11px] font-mono text-zinc-400 mt-1.5">${c.detail}</div>
                                    ${c.won ? `<div class="text-[10px] font-mono text-emerald-400 font-bold mt-1.5">+$${c.cash.toLocaleString('fr-FR')} · +${c.rep} REP</div>` : ''}
                                </div>
                            `).join('')}
                        </div>
                        <button type="button" onclick="window.closeCeremonyOverlay()" class="gta-evt-choice text-center !py-3" style="--choice-rgb: 245, 158, 11;">
                            <span class="text-xs font-extrabold uppercase tracking-[0.18em] text-amber-200">Retourner au Studio →</span>
                        </button>
                    `;
                }
                if (ov) { ov.classList.remove('hidden'); ov.classList.add('flex'); }
                if (wins > 0) {
                    if (typeof fireConfetti === 'function') fireConfetti('banger');
                    if (typeof playSuccess === 'function') playSuccess();
                } else if (typeof playBleep === 'function') {
                    playBleep();
                }
                if (typeof updateHUD === 'function') updateHUD();
                window.renderEmpireApp();
                if (typeof saveGame === 'function') saveGame();
            };

            window.openCareerEndingModal = function() {
                if (typeof state === 'undefined' || !state) return;
                const align = Number(state.echoAlignment) || 0;
                let ending = {
                    id: 'mogul',
                    badge: 'FIN LÉGENDAIRE · EMPIRE',
                    title: 'EMPEREUR DU 42E ÉTAGE',
                    accent: '245, 158, 11',
                    desc: `Avec ton label ${state.labelName || '42E RECORDS'}, tes albums certifiés et ton Studio Pro dominant la skyline, tu es devenu le producteur exécutif le plus influent de la décennie.`
                };
                if (align >= 25) {
                    ending = {
                        id: 'purist',
                        badge: 'FIN LÉGENDAIRE · PURISTE',
                        title: 'ICÔNE UNDERGROUND PURISTE',
                        accent: '16, 185, 129',
                        desc: `Tu as refusé de céder aux raccourcis algorithmiques. Tes masters analogiques, tes prises live et ton intégrité artistique inspirent toute une génération de beatmakers.`
                    };
                } else if (align <= -25) {
                    ending = {
                        id: 'algorithm',
                        badge: 'FIN LÉGENDAIRE · NEURAL',
                        title: 'FANTÔME DE L\'ALGORITHME IA',
                        accent: '56, 189, 248',
                        desc: `En symbiose totale avec Echo AI, tu as piraté les charts mondiaux et industrialisé le tube parfait. Personne ne sait où s'arrête l'humain et où commence la machine.`
                    };
                }
                state.endingUnlocked = ending.id;
                state.isEventActive = true;
                const ov = document.getElementById('ceremony-overlay');
                const body = document.getElementById('ceremony-body');
                const meta = document.getElementById('ceremony-meta');
                if (ov) ov.style.setProperty('--evt-rgb', ending.accent);
                if (meta) meta.textContent = `PRESTIGE #${(state.prestigeCount || 0) + 1}`;
                if (body) {
                    body.innerHTML = `
                        <div class="gta-evt-title-block">
                            <div class="text-[10px] font-mono uppercase tracking-[0.26em] text-amber-300">${ending.badge}</div>
                            <h2 class="text-2xl sm:text-3xl font-extrabold tracking-[0.14em] uppercase text-white mt-0.5">${ending.title}</h2>
                        </div>
                        <p class="text-sm text-zinc-200 leading-relaxed">${ending.desc}</p>
                        <div class="grid grid-cols-3 gap-2.5 text-center font-mono">
                            <div class="bg-black/45 border border-white/10 rounded-xl p-3">
                                <div class="text-[9px] text-zinc-500 uppercase">Trophées</div>
                                <div class="text-lg font-bold text-amber-300">${(state.trophies?.length || 0)} 🏆</div>
                            </div>
                            <div class="bg-black/45 border border-white/10 rounded-xl p-3">
                                <div class="text-[9px] text-zinc-500 uppercase">Albums</div>
                                <div class="text-lg font-bold text-sky-300">${(state.albums?.length || 0)} 💿</div>
                            </div>
                            <div class="bg-black/45 border border-white/10 rounded-xl p-3">
                                <div class="text-[9px] text-zinc-500 uppercase">Followers</div>
                                <div class="text-lg font-bold text-emerald-300">${formatNum(state.followers || 0)}</div>
                            </div>
                        </div>
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            <button type="button" onclick="window.closeCeremonyOverlay()" class="gta-evt-choice text-center !py-3" style="--choice-rgb: 16, 185, 129;">
                                <div class="text-xs font-extrabold uppercase tracking-wider text-emerald-300">Continuer en Mode Libre</div>
                                <div class="text-[9.5px] font-mono text-zinc-400 mt-0.5">Conserver ton empire actuel</div>
                            </button>
                            <button type="button" onclick="window.startPrestigeNewEra()" class="gta-evt-choice text-center !py-3" style="--choice-rgb: 245, 158, 11;">
                                <div class="text-xs font-extrabold uppercase tracking-wider text-amber-300">Nouvelle Ère · Prestige</div>
                                <div class="text-[9.5px] font-mono text-zinc-400 mt-0.5">Repartir Jour 1 avec +0.15 Mix &amp; Trophées</div>
                            </button>
                        </div>
                    `;
                }
                if (ov) { ov.classList.remove('hidden'); ov.classList.add('flex'); }
                if (typeof fireConfetti === 'function') fireConfetti('banger');
                if (typeof playSuccess === 'function') playSuccess();
                if (typeof saveGame === 'function') saveGame();
            };

            window.startPrestigeNewEra = function() {
                if (typeof state === 'undefined' || !state) return;
                const keepUser = state.username;
                const keepChar = state.activeCharacter;
                const keepLabel = state.labelName;
                const keepRivalName = state.rivalState && state.rivalState.name;
                const keepTrophies = Array.isArray(state.trophies) ? state.trophies : [];
                const keepPrestige = (Number(state.prestigeCount) || 0) + 1;
                const keepPermMix = Math.min(1.0, (parseFloat(state.permanentMixBonus) || 0) + 0.15);
                const fresh = JSON.parse(JSON.stringify(DEFAULT_STATE));
                fresh.username = keepUser;
                fresh.activeCharacter = keepChar;
                if (keepLabel) { fresh.labelName = keepLabel; fresh.labelNamed = Boolean(state.labelNamed); }
                if (keepRivalName) {
                    fresh.rivalState = fresh.rivalState || { name: keepRivalName, score: 1200, winsAgainst: 0, lastClashDay: 0 };
                    fresh.rivalState.name = keepRivalName;
                    fresh.rivalNamed = Boolean(state.rivalNamed);
                }
                fresh.trophies = keepTrophies;
                fresh.prestigeCount = keepPrestige;
                fresh.permanentMixBonus = Math.round(keepPermMix * 100) / 100;
                fresh.money = 500 * keepPrestige;
                fresh.onboardingDismissed = true;
                state = fresh;
                window.closeCeremonyOverlay();
                if (typeof saveGame === 'function') saveGame();
                if (typeof updateHUD === 'function') updateHUD();
                showToast(`👑 NOUVELLE ÈRE PRESTIGE #${keepPrestige} ! Bonus permanent +${fresh.permanentMixBonus.toFixed(2)} Qualité Mix conservé.`, "success");
            };


            window.stopVaultPreview = function() {
                if (window._vaultPreviewTimer) {
                    clearInterval(window._vaultPreviewTimer);
                    window._vaultPreviewTimer = null;
                }
                const stEl = document.getElementById('vault-player-status');
                if (stEl) stEl.textContent = 'IDLE · 48kHz / 24-BIT';
            };

            window.playVaultTrackMaster = function(trackIdx) {
                window.stopVaultPreview();
                const tracks = (typeof state !== 'undefined' && state && Array.isArray(state.trackList))
                    ? [...state.trackList].sort((a, b) => (Number(b.score) || 0) - (Number(a.score) || 0))
                    : [];
                const tr = tracks[trackIdx];
                if (!tr) return;

                const titleEl = document.getElementById('vault-now-playing-title');
                const subEl = document.getElementById('vault-now-playing-sub');
                const stEl = document.getElementById('vault-player-status');
                if (titleEl) titleEl.textContent = `▶ LECTURE MASTER : "${String(tr.title || 'UNTITLED').toUpperCase()}"`;
                if (subEl) subEl.textContent = `${tr.genre || 'Studio Mix'} • Note ${Number(tr.score || 0).toFixed(1)}/10 • Masterisé sur SSL 4000G`;
                if (stEl) stEl.textContent = '● PLAYING MASTER 24-BIT';

                // Boucle musicale synthétisée + onde temps réel dans le canvas Vault
                const notes = [220, 261.63, 329.63, 392.0, 440, 329.63, 293.66, 246.94];
                let step = 0;
                const drawWave = () => {
                    const c = document.getElementById('vault-wave-canvas');
                    if (!c) return;
                    const ctx = c.getContext('2d');
                    ctx.fillStyle = '#060709'; ctx.fillRect(0, 0, c.width, c.height);
                    for (let i = 0; i < 32; i++) {
                        const h = 4 + Math.abs(Math.sin(step * 0.45 + i * 0.35)) * 26;
                        ctx.fillStyle = i % 4 === 0 ? '#38bdf8' : (i % 2 === 0 ? '#e4e4e7' : '#52525b');
                        ctx.fillRect(4 + i * 7.3, (c.height - h) * 0.5, 4.0, h);
                    }
                    try {
                        if (typeof playTone === 'function' && step % 2 === 0) {
                            playTone(notes[(step / 2) % notes.length], 'triangle', 0.14, 0.035);
                        }
                    } catch(e) {}
                    step++;
                    if (step > 28) window.stopVaultPreview();
                };
                drawWave();
                window._vaultPreviewTimer = setInterval(drawWave, 160);
            };

            window.renderEmpireApp = function() {
                window.updateEmpireTopPills();
                const st = typeof state !== 'undefined' ? state : {};
                const lblInput = document.getElementById('label-name-input');
                if (lblInput && st.labelName) lblInput.value = st.labelName;
                const playerTracks = Array.isArray(st.trackList) ? st.trackList : [];

                // Dessin spectral ambiant dans le Vault même à l'état IDLE (plus jamais une boîte noire vide)
                const idleCanvas = document.getElementById('vault-wave-canvas');
                if (idleCanvas && !window._vaultPreviewTimer) {
                    const ctx = idleCanvas.getContext('2d');
                    if (ctx) {
                        ctx.fillStyle = '#06070a';
                        ctx.fillRect(0, 0, idleCanvas.width, idleCanvas.height);
                        for (let i = 0; i < 32; i++) {
                            const h = 5 + Math.abs(Math.sin(i * 0.42 + 0.8)) * 16;
                            ctx.fillStyle = i % 5 === 0 ? 'rgba(56,189,248,0.65)' : 'rgba(228,228,231,0.22)';
                            ctx.fillRect(4 + i * 7.3, (idleCanvas.height - h) * 0.5, 3.8, h);
                        }
                    }
                }

                // 1. Rendu LABEL HQ (Juicy Precision Tech : Monogramme Artiste + EQ Live + Barre Puissance Royalties)
                const rosterGrid = document.getElementById('label-roster-grid');
                if (rosterGrid) {
                    const signed = Array.isArray(st.signedArtists) ? st.signedArtists : [];
                    const mults = st.artistRoyaltyMults || {};
                    rosterGrid.innerHTML = LABEL_ARTIST_ROSTER.map((art, i) => {
                        const isSigned = signed.includes(art.id);
                        const mult = Number(mults[art.id]) || 1.0;
                        const daily = Math.round(art.baseDaily * mult);
                        const idxTag = String(i + 1).padStart(2, '0');
                        const initials = art.name.split(/\s+/).map(w => w[0] || '').join('').slice(0, 2).toUpperCase();
                        const powerPct = Math.min(100, Math.round(((mult - 0.65) / 2.2) * 100));
                        const eqHtml = isSigned ? `
                            <div class="tech-eq-bars" title="Actif au Studio 42e">
                                <span style="--eq-dur:0.85s;--eq-del:0.0s"></span>
                                <span style="--eq-dur:1.15s;--eq-del:0.18s"></span>
                                <span style="--eq-dur:0.75s;--eq-del:0.08s"></span>
                                <span style="--eq-dur:1.05s;--eq-del:0.26s"></span>
                            </div>` : '';
                        return `
                            <div class="tech-card ${isSigned ? 'is-active' : ''} p-4 flex flex-col justify-between gap-3">
                                <div class="flex items-start justify-between gap-3">
                                    <div class="flex items-center gap-3 min-w-0">
                                        <div class="w-10 h-10 rounded-lg ${isSigned ? 'bg-sky-500/15 border-sky-400/45 text-sky-200 shadow-[0_0_16px_rgba(56,189,248,0.18)]' : 'bg-white/5 border-white/12 text-zinc-400'} border flex items-center justify-center font-mono font-bold text-xs shrink-0">
                                            ${initials}
                                        </div>
                                        <div class="min-w-0">
                                            <div class="flex flex-wrap items-center gap-1.5">
                                                <span class="text-[9.5px] font-mono text-zinc-500">${idxTag} //</span>
                                                <span class="text-sm font-semibold text-white tracking-wide truncate">${art.name}</span>
                                                <span class="tech-pill ${isSigned ? 'live' : ''}">${isSigned ? '● 3D LIVE' : 'LIBRE'}</span>
                                            </div>
                                            <div class="text-[11px] font-mono text-sky-300/90 mt-0.5 truncate">${art.role}</div>
                                        </div>
                                    </div>
                                    <div class="flex items-center gap-2.5 shrink-0">
                                        ${eqHtml}
                                        <div class="text-right">
                                            <div class="text-[8.5px] font-mono text-zinc-500 uppercase tracking-wider">Royalties</div>
                                            <div class="text-sm font-bold font-mono text-emerald-400">+$${daily}/j</div>
                                        </div>
                                    </div>
                                </div>
                                ${isSigned ? `
                                    <div class="px-2.5 py-2 rounded-md bg-[#06070a] border border-white/5">
                                        <div class="flex items-center justify-between text-[9px] font-mono mb-1">
                                            <span class="text-zinc-500 uppercase">Momentum Catalogue</span>
                                            <span class="text-sky-300">×${mult.toFixed(2)}</span>
                                        </div>
                                        <div class="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                                            <div class="h-full bg-gradient-to-r from-sky-400 to-emerald-400 rounded-full transition-all duration-300" style="width:${powerPct}%"></div>
                                        </div>
                                    </div>
                                ` : `
                                    <p class="text-[11px] text-zinc-400 bg-[#06070a] border border-white/5 rounded-md px-3 py-2 leading-relaxed">« ${art.quote} »</p>
                                `}
                                <div class="flex gap-2">
                                    ${isSigned ? (() => {
                                        const doneToday = Boolean(st.artistLastSingleDay && st.artistLastSingleDay[art.id] === (st.day || 1));
                                        return `
                                        <button type="button" ${doneToday ? 'disabled' : ''} onclick="window.produceLabelArtistSingle('${art.id}')" class="${doneToday ? 'tech-btn-ghost opacity-60 cursor-not-allowed' : 'tech-btn-primary'} flex-1 py-2 px-3 font-mono text-[10px] uppercase tracking-wider">
                                            ${doneToday ? '✓ Single Sorti Aujourd\'hui' : 'Produire Single · -15 NRJ / +30%'}
                                        </button>`;
                                    })() : `
                                        <button type="button" onclick="window.signLabelArtist('${art.id}')" class="tech-btn-signal flex-1 py-2 px-3 font-mono font-semibold text-[10px] uppercase tracking-wider">
                                            + Signer sur le Label · $${art.signCost}
                                        </button>
                                    `}
                                </div>
                            </div>
                        `;
                    }).join('');
                }

                // 2. Rendu ALBUMS & EP (Sélecteur 3-5 Masters + Executive Feature + Discographie)
                const albPicker = document.getElementById('album-track-picker');
                const albList = document.getElementById('album-released-list');
                const albCountPill = document.getElementById('album-selected-count');
                const albFeatSel = document.getElementById('album-feat-select');
                if (albCountPill) albCountPill.textContent = `${window._selectedAlbumTrackKeys.length} / 5 SÉLECTIONNÉS`;
                if (albFeatSel) {
                    const prevVal = albFeatSel.value;
                    const closeRappers = Object.entries(st.rapperAffinity || {})
                        .filter(([, score]) => Number(score) >= 60)
                        .sort((a, b) => Number(b[1]) - Number(a[1]));
                    albFeatSel.innerHTML = `<option value="">Sans Executive Feature (Solo)</option>` +
                        closeRappers.map(([name, sc]) => {
                            const meta = window.getRapperAffinityMeta(sc);
                            return `<option value="${name}" ${prevVal === name ? 'selected' : ''}>★ Feat. ${name} (+${meta.featBonus} Score · Aff. ${sc})</option>`;
                        }).join('');
                }
                if (albPicker) {
                    const sortedT = [...playerTracks].sort((a, b) => (Number(b.score) || 0) - (Number(a.score) || 0));
                    if (sortedT.length === 0) {
                        albPicker.innerHTML = '<div class="tech-surface p-5 text-center text-xs font-mono text-zinc-500">Exporte au moins 3 masters dans AbleStudio pour assembler un EP/Album.</div>';
                    } else {
                        albPicker.innerHTML = sortedT.map(t => {
                            const tk = _getTrackSyncKey(t);
                            const sel = window._selectedAlbumTrackKeys.includes(tk);
                            return `
                                <button type="button" onclick="window.toggleAlbumTrackPick('${tk.replace(/'/g, "\\'")}')" class="tech-card ${sel ? 'is-active' : ''} p-2.5 flex items-center justify-between gap-2 text-left cursor-pointer">
                                    <div class="min-w-0">
                                        <div class="text-xs font-semibold text-white uppercase tracking-wider truncate">${sel ? '✓ ' : '○ '}${t.title || 'UNTITLED'}</div>
                                        <div class="text-[10px] font-mono text-zinc-400">${t.genre || 'Mix'} · Jour ${t.date || 1}</div>
                                    </div>
                                    <span class="tech-pill ${sel ? 'live' : ''}">${Number(t.score || 0).toFixed(1)}/10</span>
                                </button>
                            `;
                        }).join('');
                    }
                }
                if (albList) {
                    const albums = Array.isArray(st.albums) ? st.albums : [];
                    if (albums.length === 0) {
                        albList.innerHTML = '<div class="tech-surface p-5 text-center text-xs font-mono text-zinc-500">Aucun EP/Album sorti pour le moment. Tes disques certifiés s\'affichent en 3D sur le mur du studio !</div>';
                    } else {
                        albList.innerHTML = albums.map(a => `
                            <div class="tech-card is-active p-3.5 flex flex-col gap-2">
                                <div class="flex items-start justify-between gap-2">
                                    <div class="min-w-0">
                                        <div class="flex flex-wrap items-center gap-1.5">
                                            <span class="text-sm font-bold text-white uppercase tracking-wider truncate">💿 ${a.title}</span>
                                            <span class="tech-pill signal">${a.cert}</span>
                                        </div>
                                        <div class="text-[10.5px] font-mono text-zinc-400 mt-0.5">${a.trackCount} Tracks${a.featArtist ? ` · Feat. ${a.featArtist}` : ''} · Jour ${a.day || 1}</div>
                                    </div>
                                    <div class="text-right shrink-0">
                                        <div class="text-sm font-mono font-bold text-emerald-400">${Number(a.score || 0).toFixed(1)}/10</div>
                                        <div class="text-[9.5px] font-mono text-zinc-400">${(a.sales || 0).toLocaleString('fr-FR')} ventes</div>
                                    </div>
                                </div>
                            </div>
                        `).join('');
                    }
                }

                // 3. Rendu SYNC & PLACEMENTS (Matching 100% cohérent + Anti-exploit persistant)
                const syncGrid = document.getElementById('sync-briefs-grid');
                if (syncGrid) {
                    const done = Array.isArray(st.completedSyncIds) ? st.completedSyncIds : [];
                    const placed = Array.isArray(st.placedSyncTrackKeys) ? st.placedSyncTrackKeys : [];
                    const activeIds = Array.isArray(window._activeSyncBriefIds) ? window._activeSyncBriefIds : SYNC_BRIEF_POOL.slice(0, 4).map(b => b.id);
                    const shownBriefs = SYNC_BRIEF_POOL.filter(b => activeIds.includes(b.id));
                    syncGrid.innerHTML = shownBriefs.map((b, i) => {
                        const isDone = done.includes(b.id);
                        const idxTag = String(i + 1).padStart(2, '0');
                        const matchingMasters = playerTracks.filter(t => _isTrackEligibleForSyncBrief(t, b, placed)).length;
                        const eligPill = isDone
                            ? `<span class="tech-pill live">✓ ENCAISSÉ</span>`
                            : (matchingMasters > 0
                                ? `<span class="tech-pill live">● ${matchingMasters} MASTER${matchingMasters > 1 ? 'S' : ''} PRÊT${matchingMasters > 1 ? 'S' : ''}</span>`
                                : `<span class="tech-pill">○ SCORE ≥ ${b.minScore}</span>`);
                        return `
                            <div class="tech-card ${(!isDone && matchingMasters > 0) ? 'is-active' : ''} ${isDone ? 'opacity-50' : ''} p-4 flex flex-col justify-between gap-3">
                                <div>
                                    <div class="flex items-start justify-between gap-2 pb-2.5 border-b border-white/8">
                                        <div class="min-w-0">
                                            <div class="text-[9.5px] font-mono text-zinc-500 uppercase tracking-wider">${idxTag} // SYNC CONTRACT</div>
                                            <div class="text-[12.5px] font-mono font-bold text-white uppercase tracking-wide mt-0.5 truncate">${b.client}</div>
                                        </div>
                                        <div class="text-right shrink-0">
                                            <div class="text-base font-bold font-mono text-emerald-400 leading-none">+$${b.rewardMoney.toLocaleString()}</div>
                                            <div class="text-[9px] font-mono text-zinc-400 mt-1">+${b.rewardFans} FANS · +${b.rewardRep} REP</div>
                                        </div>
                                    </div>
                                    <p class="text-[11.5px] text-zinc-300/90 mt-2.5 leading-relaxed">${b.desc}</p>
                                    <div class="flex flex-wrap items-center gap-1.5 mt-3">
                                        <span class="tech-pill signal">${b.genres.join(' / ')}</span>
                                        <span class="tech-pill">NOTE ≥ ${b.minScore}/10</span>
                                        ${eligPill}
                                    </div>
                                </div>
                                <button type="button" ${isDone ? 'disabled' : ''} onclick="window.submitTrackToSyncBrief('${b.id}')" class="${isDone ? 'tech-btn-ghost opacity-60 cursor-not-allowed' : (matchingMasters > 0 ? 'tech-btn-primary' : 'tech-btn-signal')} w-full py-2 px-3 font-mono text-[10px] uppercase tracking-wider">
                                    ${isDone ? '✓ Contrat Sync Encaissé' : (matchingMasters > 0 ? 'Soumettre Master Éligible →' : 'Vérifier Éligibilité →')}
                                </button>
                            </div>
                        `;
                    }).join('');
                }

                // 4. Rendu RÉSEAU (AFFINITÉ RAPPEURS) & RIVALITÉ TOP 10
                const affList = document.getElementById('empire-affinity-list');
                if (affList) {
                    const entries = Object.entries(st.rapperAffinity || {}).sort((a, b) => Number(b[1]) - Number(a[1]));
                    if (entries.length === 0) {
                        affList.innerHTML = '<div class="tech-surface p-5 text-center text-xs font-mono text-zinc-500">Réussis des Collaborations ou règle des litiges à l\'amiable pour bâtir ton carnet d\'affinité rappeurs !</div>';
                    } else {
                        affList.innerHTML = entries.map(([name, rawScore]) => {
                            const sc = Math.max(0, Math.min(100, Number(rawScore) || 0));
                            const meta = window.getRapperAffinityMeta(sc);
                            const isKnown = (typeof rappersConnus !== 'undefined' && rappersConnus.includes(name));
                            const canCall = sc >= 60;
                            const calledToday = Boolean(st.artistDirectCollabDay && st.artistDirectCollabDay[name] === (st.day || 1));
                            return `
                                <div class="tech-card ${canCall ? 'is-active' : ''} p-3.5 flex flex-col gap-2.5">
                                    <div class="flex items-center justify-between gap-2">
                                        <div class="min-w-0">
                                            <div class="flex flex-wrap items-center gap-1.5">
                                                <span class="text-sm font-bold text-white truncate">${name}</span>
                                                ${isKnown ? '<span class="tech-pill signal">★ VIP</span>' : ''}
                                                <span class="tech-pill ${meta.pillCls}">${meta.label}</span>
                                            </div>
                                            <div class="text-[10px] font-mono text-zinc-400 mt-0.5">+${meta.acceptBonus}% acceptation collab${meta.featBonus > 0 ? ` · +${meta.featBonus} Score Feat Album` : ''}</div>
                                        </div>
                                        <span class="text-sm font-mono font-bold shrink-0" style="color:${meta.color};">${sc}/100</span>
                                    </div>
                                    <div class="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                                        <div class="h-full rounded-full transition-all duration-300" style="width:${sc}%; background:${meta.color};"></div>
                                    </div>
                                    ${canCall ? `
                                        <button type="button" ${calledToday ? 'disabled' : ''} onclick="window.callRapperForDirectCollab('${name.replace(/'/g, "\\'")}')" class="${calledToday ? 'tech-btn-ghost opacity-60 cursor-not-allowed' : 'tech-btn-signal'} w-full py-1.5 px-3 font-mono text-[10px] uppercase tracking-wider">
                                            ${calledToday ? '✓ Déjà appelé aujourd\'hui' : '📞 Appeler en Session Collab (Direct)'}
                                        </button>
                                    ` : ''}
                                </div>
                            `;
                        }).join('');
                    }
                }

                const rivalHero = document.getElementById('empire-rival-hero');
                const top10El = document.getElementById('empire-top10-list');
                if (rivalHero) {
                    const riv = st.rivalState || { name: 'KROWN // 808', score: 1400, winsAgainst: 0, lastClashDay: 0 };
                    const myPow = window.getPlayerProducerPower();
                    const clashedToday = riv.lastClashDay === (st.day || 1);
                    const isRank1 = window.isPlayerRankOneProducer();
                    rivalHero.innerHTML = `
                        <div class="flex items-start justify-between gap-3">
                            <div class="min-w-0">
                                <div class="text-[9.5px] font-mono text-rose-400 uppercase tracking-[0.2em]">DIR.04B // RIVALITÉ DIRECTE</div>
                                <div class="flex flex-wrap items-center gap-2 mt-1">
                                    <span class="text-rose-400 text-sm">⚔️</span>
                                    <input id="rival-name-input" type="text" maxlength="22" value="${_escapeIdentityHtml(riv.name)}" onchange="window.renamePlayerRival(this.value)" aria-label="Nom du pire ennemi" class="bg-[#060709] border border-rose-500/30 rounded-md px-2.5 py-1 text-xs md:text-sm font-semibold font-mono text-white tracking-[0.12em] uppercase focus:outline-none focus:border-rose-400 w-44 sm:w-52" />
                                    ${isRank1 ? '<span class="tech-pill live">👑 TU ES #1</span>' : ''}
                                </div>
                                <p class="text-[11px] font-mono text-zinc-400 mt-1">Puissance Rival : <strong class="text-rose-300">${Math.round(riv.score || 1400)}</strong> · Ta Puissance : <strong class="text-emerald-300">${myPow}</strong></p>
                            </div>
                            <span class="tech-pill shrink-0">${riv.winsAgainst || 0} VICTOIRES</span>
                        </div>
                        <button type="button" ${clashedToday ? 'disabled' : ''} onclick="window.challengeRivalProducer()" class="${clashedToday ? 'tech-btn-ghost opacity-60 cursor-not-allowed' : 'tech-btn-primary'} w-full mt-3 py-2 px-3 font-mono text-[10px] uppercase tracking-wider">
                            ${clashedToday ? '✓ Beat Battle déjà disputé aujourd\'hui' : '⚔️ Défier en Beat Battle (-20 NRJ · Cash & REP)'}
                        </button>
                    `;
                }
                if (top10El) {
                    const lb = window.getProducerLeaderboard();
                    top10El.innerHTML = lb.map((row, idx) => `
                        <div class="flex items-center justify-between px-2.5 py-1.5 rounded-md border ${row.isPlayer ? 'bg-sky-500/15 border-sky-400/45' : (row.isRival ? 'bg-rose-500/10 border-rose-500/30' : 'bg-[#06070a] border-white/5')}">
                            <div class="flex items-center gap-2.5 min-w-0">
                                <span class="text-[11px] font-mono font-bold w-5 ${idx === 0 ? 'text-amber-300' : 'text-zinc-500'}">#${idx + 1}</span>
                                <div class="min-w-0">
                                    <div class="text-xs font-semibold ${row.isPlayer ? 'text-sky-200' : (row.isRival ? 'text-rose-200' : 'text-zinc-200')} truncate">${_escapeIdentityHtml(row.name)}</div>
                                    <div class="text-[9.5px] font-mono text-zinc-500 truncate">${_escapeIdentityHtml(row.style)}</div>
                                </div>
                            </div>
                            <span class="text-xs font-mono font-bold ${idx === 0 ? 'text-amber-300' : 'text-zinc-300'} shrink-0">${row.score.toLocaleString('fr-FR')} PTS</span>
                        </div>
                    `).join('');
                }

                // 5. Rendu VITRINE TROPHÉES & CÉRÉMONIES (Onglet Vault & Awards)
                const awardsSub = document.getElementById('empire-awards-sub');
                const trophiesShelf = document.getElementById('empire-trophies-shelf');
                const btnEnding = document.getElementById('btn-launch-ending');
                const trophies = Array.isArray(st.trophies) ? st.trophies : [];
                const btnShowcase = document.getElementById('btn-launch-showcase');
                if (btnShowcase) {
                    const curD = Number(st.day) || 1;
                    const lastS = Number(st.lastShowcaseDay) || 0;
                    const histLen = Array.isArray(st.showcaseHistory) ? st.showcaseHistory.length : 0;
                    const isEligible = (histLen === 0) || ((curD - lastS) >= 10);
                    if (isEligible) {
                        btnShowcase.textContent = '🎪 Bounce Live (Dispo !)';
                        btnShowcase.classList.remove('opacity-60');
                    } else {
                        const leftD = Math.max(1, 10 - (curD - lastS));
                        btnShowcase.textContent = `🎪 Bounce Live (J-${leftD})`;
                        btnShowcase.classList.add('opacity-60');
                    }
                }
                if (awardsSub) {
                    const nextDay = Math.max((st.lastCeremonyDay || 0) + 14, 14);
                    awardsSub.textContent = `${trophies.length} Trophée(s) remportés · Prochaine cérémonie auto : Jour ${nextDay}`;
                }
                if (btnEnding) {
                    const canEnd = Boolean(st.studioUnlocked && trophies.length >= 1);
                    btnEnding.classList.toggle('hidden', !canEnd);
                }
                if (trophiesShelf) {
                    if (trophies.length === 0) {
                        trophiesShelf.innerHTML = '<div class="col-span-full tech-surface p-3 text-center text-[11px] font-mono text-zinc-500">Aucun trophée Bounce Awards pour l\'instant. Lance ta première Cérémonie ci-dessus !</div>';
                    } else {
                        trophiesShelf.innerHTML = trophies.slice(-8).map(tr => `
                            <div class="tech-card is-active p-2.5 text-center">
                                <div class="text-xl">${tr.icon || '🏆'}</div>
                                <div class="text-[10px] font-bold text-amber-200 uppercase tracking-wider mt-1 truncate">${tr.title}</div>
                                <div class="text-[9px] font-mono text-zinc-400">Édition #${tr.edition} · J${tr.day}</div>
                            </div>
                        `).join('');
                    }
                }

                // 6. Rendu VAULT & DISCOGRAPHIE (Disque Certification Vectoriel + Jauge Score 10 Segments)
                const vaultList = document.getElementById('vault-tracks-list');
                if (vaultList) {
                    const tracks = playerTracks.length > 0
                        ? [...playerTracks].sort((a, b) => (Number(b.score) || 0) - (Number(a.score) || 0))
                        : [];
                    if (tracks.length === 0) {
                        vaultList.innerHTML = '<div class="tech-surface text-center py-10 text-xs font-mono text-zinc-500">Aucun master archivé. Produis ton premier titre dans AbleStudio.</div>';
                    } else {
                        vaultList.innerHTML = tracks.map((t, idx) => {
                            const sc = Number(t.score) || 0;
                            let cert = { label: 'MASTER', cls: '', ring: '#71717a', core: '#27272a' };
                            if (sc >= 9.6) cert = { label: 'DIAMANT', cls: 'signal', ring: '#38bdf8', core: '#e0f2fe' };
                            else if (sc >= 9.2) cert = { label: '2X PLATINE', cls: 'signal', ring: '#93c5fd', core: '#dbeafe' };
                            else if (sc >= 8.8) cert = { label: 'PLATINE', cls: 'live', ring: '#6ee7b7', core: '#d1fae5' };
                            else if (sc >= 8.0) cert = { label: 'OR', cls: '', ring: '#fcd34d', core: '#fef3c7' };
                            else if (sc >= 7.0) cert = { label: 'ARGENT', cls: '', ring: '#cbd5e1', core: '#f1f5f9' };
                            const streams = Math.round((Number(t.fans) || 500) * (14 + sc * 3.2));
                            const litSegs = Math.max(1, Math.min(10, Math.round(sc)));
                            const segBar = Array.from({ length: 10 }, (_, si) =>
                                `<span class="w-1.5 h-2 rounded-[1px] ${si < litSegs ? (si >= 8 ? 'bg-sky-300' : 'bg-sky-500/80') : 'bg-white/10'}"></span>`
                            ).join('');
                            return `
                                <div class="tech-card ${idx < 4 ? 'is-active' : ''} p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                    <div class="flex items-center gap-3 min-w-0">
                                        <!-- Disque Master Holographique Minimaliste -->
                                        <div class="w-10 h-10 rounded-full bg-[#06070a] border border-white/10 flex items-center justify-center shrink-0 relative">
                                            <svg class="w-8 h-8 ${idx === 0 ? 'tech-disc-spin' : ''}" viewBox="0 0 36 36" fill="none">
                                                <circle cx="18" cy="18" r="15" stroke="${cert.ring}" stroke-width="1.5" stroke-opacity="0.75"/>
                                                <circle cx="18" cy="18" r="11" stroke="${cert.ring}" stroke-width="0.6" stroke-dasharray="3 3" stroke-opacity="0.5"/>
                                                <circle cx="18" cy="18" r="4.5" fill="${cert.core}" fill-opacity="0.85"/>
                                                <circle cx="18" cy="18" r="1.6" fill="#06070a"/>
                                            </svg>
                                        </div>
                                        <div class="min-w-0">
                                            <div class="flex flex-wrap items-center gap-1.5">
                                                <span class="text-[10px] font-mono text-zinc-500">${String(idx + 1).padStart(2, '0')} //</span>
                                                <span class="font-semibold text-[13px] text-white uppercase tracking-wider truncate">${t.title || 'UNTITLED'}</span>
                                                <span class="tech-pill ${cert.cls}">${cert.label}</span>
                                                ${idx < 4 ? '<span class="tech-pill live">HALL OF FAME</span>' : ''}
                                            </div>
                                            <div class="flex flex-wrap items-center gap-2.5 text-[10.5px] font-mono text-zinc-400 mt-1">
                                                <span>${t.genre || 'Mix'}</span>
                                                <span class="inline-flex items-center gap-0.5">${segBar}<strong class="text-white ml-1">${sc.toFixed(1)}</strong></span>
                                                <span>${streams.toLocaleString()} streams</span>
                                                <span class="text-emerald-400">+$${(Number(t.money) || 0).toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <button type="button" onclick="window.playVaultTrackMaster(${idx})" class="tech-btn-signal px-3.5 py-2 font-mono text-[10px] uppercase tracking-wider shrink-0">
                                        ▶ Écouter
                                    </button>
                                </div>
                            `;
                        }).join('');
                    }
                }
            };


function initEmpireOS() {
    if (typeof window.updateEmpireTopPills === 'function') window.updateEmpireTopPills();
}

// --- Global Bridge & ES Exports ---
Object.assign(globalThis, { LABEL_ARTIST_ROSTER, SYNC_BRIEF_POOL, _getTrackSyncKey, _isTrackEligibleForSyncBrief, _escapeIdentityHtml, INDUSTRY_TOP10_PRODS, initEmpireOS });
export { LABEL_ARTIST_ROSTER, SYNC_BRIEF_POOL, _getTrackSyncKey, _isTrackEligibleForSyncBrief, _escapeIdentityHtml, INDUSTRY_TOP10_PRODS, initEmpireOS };
