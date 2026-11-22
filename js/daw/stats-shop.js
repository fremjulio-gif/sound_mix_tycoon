import { THREE } from '../core/libs.js';

        const cracks = [
            { id: 'crk1', name: "Kickend_2.pkg",                  risk: 0.10, reqMoney: 0,    desc: "Kick sur-boosté (+15% Cash)." },
            { id: 'crk2', name: "FabFilter_Expert_Q3.exe",        risk: 0.15, reqMoney: 500,  desc: "EQ propre garanti (+25% Cash)." },
            { id: 'crk3', name: "VocalTune_Pro.exe",              risk: 0.20, reqMoney: 1500, desc: "Corrige les fausses notes (+35% Cash)." },
            { id: 'crk4', name: "LennarAnalog_Silence1.exe",      risk: 0.25, reqMoney: 2000, desc: "Synthés rétro recherchés (+50% Cash)." },
            { id: 'crk5', name: "VintageTone_RC_80.exe",          risk: 0.30, reqMoney: 4000, desc: "Texture Lo-Fi gourmand (+60% Cash)." },
            { id: 'crk6', name: "iZotono_O2.pkg",                 risk: 0.35, reqMoney: 5000, desc: "Mastering pro instantané (+80% Cash)." },
            { id: 'crk7', name: "Harmodyne.pkg",                  risk: 0.40, reqMoney: 10000, desc: "Saturation destructrice (+100% Cash)." },
            { id: 'crk8', name: "Arthur_PGM.pkg",                 risk: 0.45, reqMoney: 15000, desc: "Émulation de légende (+120% Cash)." },
            { id: 'crk9', name: "Musictoys_Eliminator.dmg",       risk: 0.50, reqMoney: 20000, desc: "Isole les acapellas (+150% Cash)." },
            { id: 'crk10', name: "Plexus_4.exe",                  risk: 0.55, reqMoney: 30000,  desc: "Arpégiateur massif (+180% Cash)." },
            { id: 'crk11', name: "Lethal.dmg",                    risk: 0.60, reqMoney: 40000,  desc: "Basses de film (+200% Cash)." },
            { id: 'crk12', name: "Local_Instruments_Connect.pkg", risk: 0.70, reqMoney: 50000, desc: "Banques de sons pro (+300% Cash)." },
            { id: 'crk13', name: "Asgard_RetroVerb.pkg",          risk: 0.75, reqMoney: 60000, desc: "Reverb mythique (+400% Cash)." },
            { id: 'crk14', name: "SpectralSounds_Stratosphere_2.pkg", risk: 0.85, reqMoney: 80000, desc: "Recherche spectral (+500% Cash)." },
            { id: 'crk15', name: "Xray_Antidote.pkg",             risk: 0.95, reqMoney: 100000, desc: "Bypass les algos (+1000% Cash)." }
        ];

        


        window.populateDawSamples = function() {
            const select = document.getElementById('daw-sample');
            if (!select) return;
            
            select.innerHTML = '<option value="">- Aucun Sample -</option>';
            
            SAMPLE_CATALOG.forEach(sample => {
                const isOwned = state.ownedSamples && state.ownedSamples.includes(sample.id);
                const isCleared = state.clearedSamples && state.clearedSamples.includes(sample.id);
                const activeGenre = currentDawGenre || "";
                const isCompatible = activeGenre.toLowerCase() === sample.genre.toLowerCase();
                const compTxt = isCompatible ? "🎯" : "❌";
                
                let label = "";
                if (isOwned) {
                    label = `${sample.name} (${sample.genre}) [${isCleared ? 'CLEARED' : 'UNCLEARED'}]`;
                } else {
                    label = `🔓 [Acheter - $${sample.price}] ${sample.name} (${sample.genre})`;
                }
                
                const opt = document.createElement('option');
                opt.value = sample.id;
                opt.innerText = label;
                if (state.activeSample && state.activeSample.id === sample.id) {
                    opt.selected = true;
                }
                select.appendChild(opt);
            });
            
            updateSampleStatusTag();
        };


        window.openSampleDigger = function() {
            document.getElementById('sample-digger-window').style.display = 'flex';
            bringToFront('sample-digger-window');
            renderSampleDigger();
            playClick();
        };

        window.closeSampleDigger = function() {
            document.getElementById('sample-digger-window').style.display = 'none';
            playClick();
        };

        window.renderSampleDigger = function() {
            const grid = document.getElementById('sample-digger-grid');
            grid.innerHTML = '';
            
            const renderQueue = [];
            
            SAMPLE_CATALOG.forEach(sample => {
                const isOwned = state.ownedSamples && state.ownedSamples.includes(sample.id);
                const isActive = state.activeSample && state.activeSample.id === sample.id;
                
                // Placeholder HTML pour le chargement asynchrone
                let coverHtml = `
                    <div id="vinyl-placeholder-${sample.id}" class="vinyl-icon w-10 h-10 rounded-sm border border-white/20 shadow-md bg-black/40 flex items-center justify-center shrink-0">
                        <svg class="w-6 h-6 text-white/20 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83"/></svg>
                    </div>
                `;
                
                renderQueue.push(sample.id);

                const reqLevel = sample.tier === 1 ? 1 : (sample.tier === 2 ? 10 : (sample.tier === 3 ? 25 : 50));
                const playerLevel = state.lastLevel || 1;
                const isLocked = playerLevel < reqLevel;

                const item = document.createElement('div');
                item.className = `digger-item relative flex flex-col bg-black/60 border ${isActive ? 'border-[#10b981]' : 'border-white/10'} rounded-lg p-3 overflow-hidden ${isLocked ? 'opacity-50 grayscale' : ''}`;
                
                item.innerHTML = `
                    <div class="flex justify-between items-start mb-2 pointer-events-none">
                        <div class="flex items-center gap-3">
                            ${coverHtml}
                            <div>
                                <h4 class="text-white font-bold text-sm leading-tight">${sample.name}</h4>
                                <span class="text-xs text-[#a1a1aa] font-mono">${sample.genre}</span>
                            </div>
                        </div>
                        <div class="text-right">
                            <div class="text-[#10b981] font-mono font-bold text-sm">${isOwned ? 'OWNED' : '$' + sample.price}</div>
                            <div class="text-[10px] text-white/50">Rep: ${sample.reqRep}+</div>
                        </div>
                    </div>
                    
                    <p class="text-xs text-[#d1d5db] mb-3 line-clamp-2 pointer-events-none">${sample.desc}</p>
                    
                    <div class="flex justify-between items-center mt-auto">
                        <div class="digger-waveform pointer-events-none">
                            <div class="bar"></div><div class="bar"></div><div class="bar"></div>
                            <div class="bar"></div><div class="bar"></div><div class="bar"></div><div class="bar"></div>
                        </div>
                        ${isLocked ? 
                        `<button class="px-4 py-1.5 rounded bg-black/40 border border-white/5 text-white/40 text-xs font-bold font-mono cursor-not-allowed">
                            🔒 LVL ${reqLevel}
                        </button>` : 
                        `<button class="action-btn px-4 py-1.5 rounded bg-white/5 hover:bg-[#10b981]/20 border border-white/10 hover:border-[#10b981] text-[#10b981] text-xs font-bold font-mono transition-all pointer-events-auto cursor-pointer relative z-10">
                            ${isActive ? 'INJECTED' : (isOwned ? 'INJECT' : 'BUY & INJECT')}
                        </button>`}
                    </div>
                `;
                
                if (!isLocked) {
                    const btn = item.querySelector('.action-btn');
                    if (btn) {
                        btn.onclick = (e) => {
                            e.stopPropagation(); // Prevenir tout bubbling
                            // Flash effect on the item
                            item.classList.add('flash-anim');
                            setTimeout(() => item.classList.remove('flash-anim'), 500);
                            
                            if (isOwned) {
                                loadSampleFromDigger(sample.id);
                            } else {
                                openLicenseModal(sample.id);
                            }
                        };
                    }
                }
                
                grid.appendChild(item);
            });

            // Lazy loading des covers pour ne pas bloquer le thread principal (UI Freeze)
            let queueIndex = 0;
            const defaultSvg = `
                <svg class="vinyl-icon w-10 h-10 text-[#10b981] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <circle cx="12" cy="12" r="3"></circle>
                    <circle cx="12" cy="12" r="1"></circle>
                </svg>
            `;
            
            function processRenderQueue() {
                if (queueIndex >= renderQueue.length) return;
                
                // Traiter 1 vinyl par frame pour garantir 60fps sans lag
                const sampleId = renderQueue[queueIndex];
                const placeholder = document.getElementById(`vinyl-placeholder-${sampleId}`);
                
                if (placeholder) {
                    if (typeof window.createVinylCoverTexture === 'function') {
                        const tex = window.createVinylCoverTexture(sampleId, 256);
                        if (tex && tex.image) {
                            const dataUrl = tex.image.toDataURL();
                            placeholder.outerHTML = `<div class="vinyl-icon w-10 h-10 rounded-sm border border-white/20 shadow-md bg-cover bg-center shrink-0" style="background-image: url('${dataUrl}')"></div>`;
                        } else {
                            placeholder.outerHTML = defaultSvg;
                        }
                    } else {
                        placeholder.outerHTML = defaultSvg;
                    }
                }
                
                queueIndex++;
                requestAnimationFrame(processRenderQueue);
            }
            requestAnimationFrame(processRenderQueue);
        };

        window.pendingLicenseSampleId = null;

        window.openLicenseModal = function(sampleId) {
            const sample = SAMPLE_CATALOG.find(s => s.id === sampleId);
            if (!sample) return;
            
            if (state.rep < sample.reqRep) {
                showToast(`Notoriété insuffisante ! Rep. requise : ${sample.reqRep}`, "error");
                playError();
                return;
            }

            window.pendingLicenseSampleId = sampleId;
            document.getElementById('license-sample-name').innerText = sample.name;
            document.getElementById('license-price-basic').innerText = '$' + formatNum(sample.price);
            document.getElementById('license-price-premium').innerText = '$' + formatNum(Math.floor(sample.price * 2.5));
            document.getElementById('license-price-exclusive').innerText = '$' + formatNum(sample.price * 5);
            
            document.getElementById('sample-license-modal').style.display = 'flex';
            playClick();
        };

        window.closeLicenseModal = function() {
            document.getElementById('sample-license-modal').style.display = 'none';
            window.pendingLicenseSampleId = null;
            playClick();
        };



        window.purchaseLicense = function(licenseType) {
            if (!window.pendingLicenseSampleId) return;
            const sampleId = window.pendingLicenseSampleId;
            const sample = SAMPLE_CATALOG.find(s => s.id === sampleId);
            if (!sample) return;
            
            let finalPrice = sample.price;
            if (licenseType === 'premium') finalPrice = Math.floor(sample.price * 2.5);
            if (licenseType === 'exclusive') finalPrice = sample.price * 5;

            if (state.money >= finalPrice) {
                logMoney(-finalPrice, `Achat Licence (${licenseType}) : ${sample.name}`);
                
                // Store license type globally
                if (!state.sampleLicenses) state.sampleLicenses = {};
                state.sampleLicenses[sampleId] = licenseType;
                
                state.ownedSamples.push(sampleId);

                if (licenseType === 'exclusive') {
                    if (!state.clearedSamples) state.clearedSamples = [];
                    if (!state.clearedSamples.includes(sampleId)) state.clearedSamples.push(sampleId);
                    checkAchievement('cleared', () => true);
                }
                
                // Check achievements on buy
                checkAchievement('digging_initiation', () => true);
                if (state.ownedSamples.length >= 10) checkAchievement('bac_a_sable', () => true);
                if (sample.tier === 4) checkAchievement('crate_digger', () => true);
                if (sampleId === 's_brel') checkAchievement('ne_me_quitte_pas', () => true);
                
                showToast(`Licence ${licenseType.toUpperCase()} pour "${sample.name}" acquise !`, "success");
                
                closeLicenseModal();
                renderSampleDigger(); // INSTANT REFRESH
                playSuccess();
                saveGame();
            } else {
                showToast("Pas assez d'argent !", "error");
                playError();
            }
        };

        window.loadSampleFromDigger = function(sampleId) {
            const baseSample = SAMPLE_CATALOG.find(s => s.id === sampleId);
            if (!baseSample) return;
            const sample = JSON.parse(JSON.stringify(baseSample));
            
            // Apply license bonus
            const licenseType = (state.sampleLicenses && state.sampleLicenses[sampleId]) || 'basic';
            if (licenseType === 'premium') sample.bonus += 1;
            if (licenseType === 'exclusive') sample.bonus += 2;
            
            // Inject
            state.activeSample = sample;
            document.getElementById('daw-sample').value = sampleId;
            const display = document.getElementById('daw-sample-display');
            if (display) display.innerText = sample.name;
            updateSampleStatusTag();
            saveGame();
            playClick();
            
            // Re-render to show updated state
            renderSampleDigger();
            
            // Ferme la fenêtre après une petite pause
            setTimeout(() => {
                closeSampleDigger();
            }, 400);
        };

        window.onSampleSelected = function(sampleId) {
            if (!sampleId) {
                state.activeSample = null;
                updateSampleStatusTag();
                saveGame();
                return;
            }
            
            const sample = SAMPLE_CATALOG.find(s => s.id === sampleId);
            if (!sample) return;
            
            const isOwned = state.ownedSamples && state.ownedSamples.includes(sampleId);
            if (!isOwned) {
                // Check reputation requirements
                if (state.rep < sample.reqRep) {
                    showToast(`Notoriété insuffisante ! Rep. requise : ${sample.reqRep} (Actuel : ${state.rep})`, "error");
                    document.getElementById('daw-sample').value = state.activeSample ? state.activeSample.id : ""; if(document.getElementById('daw-sample-display')) document.getElementById('daw-sample-display').innerText = state.activeSample ? state.activeSample.name : "- Crate Digger -";
                    playError();
                    return;
                }

                // Prompt user to purchase
                if (confirm(`Acheter le sample "${sample.name}" pour $${sample.price} ?\n(${sample.desc})`)) {
                    if (state.money >= sample.price) {
                        logMoney(-sample.price, `Achat sample : ${sample.name}`);
                        state.ownedSamples.push(sampleId);
                        state.activeSample = sample;
                        
                        // Check achievements on buy
                        if (state.ownedSamples.length >= 10) {
                            checkAchievement('bac_a_sable', () => true);
                        }
                        if (sample.tier === 4) {
                            checkAchievement('crate_digger', () => true);
                        }
                        if (sampleId === 's_brel') {
                            checkAchievement('ne_me_quitte_pas', () => true);
                        }
                        
                        showToast(`Sample "${sample.name}" acheté avec succès !`, "success");
                        playTone(520, 'sine', 0.1, 0.1);
                        populateDawSamples();
                        saveGame();
                    } else {
                        showToast("Fonds insuffisants pour acheter ce sample !", "error");
                        document.getElementById('daw-sample').value = state.activeSample ? state.activeSample.id : ""; if(document.getElementById('daw-sample-display')) document.getElementById('daw-sample-display').innerText = state.activeSample ? state.activeSample.name : "- Crate Digger -";
                        playError();
                    }
                } else {
                    document.getElementById('daw-sample').value = state.activeSample ? state.activeSample.id : ""; if(document.getElementById('daw-sample-display')) document.getElementById('daw-sample-display').innerText = state.activeSample ? state.activeSample.name : "- Crate Digger -";
                }
            } else {
                state.activeSample = sample;
                updateSampleStatusTag();
                saveGame();
            }
        };

        window.updateSampleStatusTag = function() {
            const tag = document.getElementById('sample-status-tag');
            if (!tag) return;
            
            if (!state.activeSample) {
                tag.classList.add('hidden');
                return;
            }
            
            const isCompatible = (currentDawGenre || "").toLowerCase() === state.activeSample.genre.toLowerCase();
            tag.classList.remove('hidden');
            if (isCompatible) {
                tag.className = "text-[8px] font-mono text-center tracking-wider rounded px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30";
                tag.innerText = `COMPATIBLE (+${state.activeSample.bonus} SCORE)`;
            } else {
                tag.className = "text-[8px] font-mono text-center tracking-wider rounded px-1.5 py-0.5 bg-red-500/20 text-red-400 border border-red-500/30";
                tag.innerText = "INCOMPATIBLE (-2 SCORE)";
            }
        };

        window.triggerLegalClaim = function(sample, moneyGain, onResolved) {
            state.isEventActive = true;
            const container = document.createElement('div');
            container.id = 'legal-claim-modal';
            container.className = 'fixed inset-0 z-[99999] flex items-center justify-center bg-black/85 backdrop-blur-md px-4';
            
            const p30 = Math.floor(moneyGain * 0.3);
            const p60 = Math.floor(moneyGain * 0.6);
            const canAffordClearance = state.money >= 800;

            container.innerHTML = `
                <div class="liquid-glass-heavy border border-white/10 w-full max-w-md p-6 rounded-2xl flex flex-col items-center gap-6 text-white text-center shadow-2xl relative bg-[#18181b]/95">
                    <div class="space-y-2 mt-2">
                        <div class="w-12 h-12 bg-red-500/20 border border-red-500 rounded-full flex items-center justify-center text-red-500 text-xl font-bold mx-auto mb-2 animate-pulse">🚨</div>
                        <h2 class="text-lg font-bold font-retro tracking-widest text-red-500 uppercase">LEGAL CLAIM DETECTED</h2>
                        <p class="text-[11px] text-[var(--text-muted)] max-w-sm">
                            La maison de disque du sample original (${sample.ref}) a repéré ton morceau et réclame ses droits d'auteur !
                        </p>
                    </div>

                    <div class="w-full space-y-3 font-retro text-left text-[10px] tracking-wider">
                        <button id="claim-btn-pay" class="w-full text-left p-3 rounded-lg border border-white/10 hover:border-yellow-500/50 hover:bg-yellow-500/10 transition-all flex justify-between items-center bg-black/40">
                            <span>🤝 Régler à l'amiable (Perte de 30% des royalties)</span>
                            <span class="text-yellow-400 font-bold">-$${p30}</span>
                        </button>
                        <button id="claim-btn-contest" class="w-full text-left p-3 rounded-lg border border-white/10 hover:border-orange-500/50 hover:bg-orange-500/10 transition-all flex justify-between items-center bg-black/40">
                            <span>⚖️ Contester au tribunal (30% de chance de win)</span>
                            <span class="text-orange-400 font-bold">0 ou -$${p60}</span>
                        </button>
                        <button id="claim-btn-clear" ${!canAffordClearance ? 'disabled' : ''} class="w-full text-left p-3 rounded-lg border border-white/10 hover:border-emerald-500/50 hover:bg-emerald-500/10 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex justify-between items-center bg-black/40">
                            <span>💎 Acheter la clearance (Coût fixe, libère le sample définitivement)</span>
                            <span class="text-emerald-400 font-bold">-$800</span>
                        </button>
                    </div>
                </div>
            `;
            document.body.appendChild(container);

            container.querySelector('#claim-btn-pay').addEventListener('click', () => {
                logMoney(-p30, `Amiable Claim: ${sample.name}`);
                showToast(`Procès évité. Tu as cédé 30% de royalties (-$${p30}).`, "info");
                cleanup();
            });

            container.querySelector('#claim-btn-contest').addEventListener('click', () => {
                if (Math.random() < 0.3) {
                    showToast("Avocat incroyable ! Procès gagné ! Tu conserves tous tes gains.", "success");
                    checkAchievement('avocat_du_diable', () => true);
                } else {
                    logMoney(-p60, `Procès perdu Claim: ${sample.name}`);
                    showToast(`Défaite cuisante ! Double pénalité appliquée (-$${p60}).`, "error");
                }
                cleanup();
            });

            container.querySelector('#claim-btn-clear').addEventListener('click', () => {
                logMoney(-800, `Clearance: ${sample.name}`);
                if (!state.clearedSamples.includes(sample.id)) {
                    state.clearedSamples.push(sample.id);
                }
                showToast(`Droits libérés pour ${sample.name} ! Plus aucun risque de claim.`, "success");
                
                if (state.clearedSamples.length >= 3) {
                    checkAchievement('cleared', () => true);
                }
                cleanup();
            });

            function cleanup() {
                document.body.removeChild(container);
                state.isEventActive = false;
                if (typeof onResolved === 'function') onResolved();
            }
        };


        function switchBrowserTab(tab) {
            const btnC = document.getElementById('tab-crackz');
            const btnA = document.getElementById('tab-audio');
            const lockIcon = document.getElementById('browser-lock-icon');
            const urlText = document.getElementById('browser-url-text');

            // Reset classes
            if (btnC) btnC.className = "flex items-center gap-2 px-4 py-2.5 min-w-[140px] max-w-[200px] bg-[#0A0A0D] text-gray-500 hover:bg-[#1E1E24]/50 hover:text-white rounded-t-lg transition-all";
            if (btnA) btnA.className = "flex items-center gap-2 px-4 py-2.5 min-w-[140px] max-w-[200px] bg-[#0A0A0D] text-gray-500 hover:bg-[#1E1E24]/50 hover:text-white rounded-t-lg transition-all";

            if (tab === 'crackz') {
                if (btnC) btnC.className = "flex items-center gap-2 px-4 py-2.5 min-w-[140px] max-w-[200px] bg-[#1E1E24] text-white rounded-t-lg border-b-0 transition-all";
                if (urlText) urlText.innerText = "https://crackz.world/downloads";
                if (lockIcon) lockIcon.innerHTML = `<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3l18 18"></path></svg>`;
                if (lockIcon) lockIcon.className = "flex-shrink-0 text-rose-500";
            } else if (tab === 'audio') {
                if (btnA) btnA.className = "flex items-center gap-2 px-4 py-2.5 min-w-[140px] max-w-[200px] bg-[#1E1E24] text-white rounded-t-lg border-b-0 transition-all";
                if (urlText) urlText.innerText = "https://audiostore.pro/plugins";
                if (lockIcon) lockIcon.innerHTML = `<svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd"></path></svg>`;
                if (lockIcon) lockIcon.className = "flex-shrink-0 text-emerald-400";
            }

            renderStore(tab);
            playBleep();
        }

        function renderStore(tab) {
            const content = document.getElementById('browser-content');
            if (tab === 'crackz') {
                const total      = getTotalMins();
                const crackReady = parseInt(state.cooldowns.crackzTimeReady, 10) || 0;
                if (total < crackReady) {
                    const left = crackReady - total;
                    content.innerHTML = `
                        <div class="p-8 text-center text-[var(--retro-red)] font-retro h-full min-h-[300px] flex flex-col items-center justify-center bg-[#050505] shadow-inner">
                            <p class="mb-3 text-2xl tracking-widest font-bold">⚠️ VPN COOLDOWN ⚠️</p>
                            <p class="text-xs text-[var(--text-muted)] uppercase tracking-wider">Your IP is flagged. Next safe download window in:</p>
                            <p class="text-4xl mt-6 font-bold drop-shadow-[0_0_10px_var(--retro-red)]" id="crackz-cd-text">${formatTimeLeft(left)}</p>
                        </div>`;
                    return;
                }
                let crackHTML = `<div class="mb-8 border border-rose-500/30 bg-rose-500/10 p-4 rounded flex items-center gap-4">
                                    <span class="text-2xl">⚠️</span>
                                    <div>
                                        <p class="text-rose-500 font-bold font-sans text-sm drop-shadow-[0_0_2px_#f43f5e]">Attention à ce que tu télécharges...</p>
                                        <p class="text-rose-400/80 font-sans text-xs mt-1">Ces liens dirigent vers des fichiers non vérifiés. Ton adresse IP n'est pas masquée.</p>
                                    </div>
                                 </div>
                                 <p class="text-xs text-gray-500 font-sans mb-6">Environ 8 résultats (0,04 secondes)</p>
                                <div class="flex flex-col w-full">`;
                let foundAny = false;
                cracks.forEach(c => {
                    const alreadyOwned = (state.ownedCracks && state.ownedCracks.includes(c.id)) || (state.inventory && state.inventory.includes(c.id));
                    const alreadyDiscovered = state.downloadedCracks && state.downloadedCracks[c.id] !== undefined;

                    if (alreadyOwned) {
                        foundAny = true;
                        crackHTML += `
                        <div class="mb-8 flex flex-col w-full group opacity-50 grayscale pointer-events-none">
                            <div class="flex items-center gap-2 mb-1">
                                <span class="text-[10px] text-gray-500 font-retro truncate">crackz.world › downloads › ${c.id}</span>
                            </div>
                            <div class="flex flex-col sm:flex-row justify-between items-start gap-4">
                                <div class="flex-1">
                                    <h4 class="font-bold text-base text-gray-400 line-through">${c.name}</h4>
                                    <p class="text-[11px] text-gray-500 mt-1.5 leading-relaxed font-sans">[FICHIER DÉJÀ PRÉSENT SUR LE SYSTÈME]</p>
                                </div>
                                <button class="btn-minimal w-full sm:w-auto flex-shrink-0 px-8 py-3 text-[11px] border-gray-600 text-gray-500 rounded">OWNED</button>
                            </div>
                        </div>`;
                    } else if (!alreadyDiscovered && state.money < c.reqMoney) {
                        crackHTML += `
                        <div class="mb-8 flex flex-col w-full group opacity-30 select-none">
                            <div class="flex items-center gap-2 mb-1">
                                <span class="text-[10px] text-gray-600 font-retro truncate">darkweb.onion › encrypted › file</span>
                            </div>
                            <div class="flex flex-col sm:flex-row justify-between items-start gap-4">
                                <div class="flex-1">
                                    <h4 class="font-bold text-base text-gray-600">???_LOCKED_FILE_???</h4>
                                    <p class="text-[11px] text-gray-600 mt-1.5 leading-relaxed font-sans">Requires: $${formatNum(c.reqMoney)} in Bank</p>
                                </div>
                                <button class="btn-minimal w-full sm:w-auto flex-shrink-0 px-8 py-3 text-[11px] border-gray-700 text-gray-600 rounded">LOCKED</button>
                            </div>
                        </div>`;
                    } else {
                        foundAny = true;
                        crackHTML += `
                        <div class="mb-8 flex flex-col w-full group">
                            <div class="flex items-center gap-2 mb-1">
                                <span class="text-[10px] bg-black border border-[#39FF88]/30 px-1 py-0.5 rounded text-[#39FF88]/70 font-retro">AD</span>
                                <span class="text-[10px] text-[#39FF88]/50 font-retro truncate">crackz.world › downloads › ${c.id}</span>
                            </div>
                            <div class="flex flex-col sm:flex-row justify-between items-start gap-4">
                                <div class="flex-1">
                                    <h4 class="font-bold text-base text-[#39FF88] underline decoration-[#39FF88]/50 group-hover:text-white cursor-pointer drop-shadow-[0_0_3px_#39FF88]" style="text-shadow: 2px 0px 2px rgba(255,0,0,0.5), -2px 0px 2px rgba(0,0,255,0.5);">${c.name}</h4>
                                    <p class="text-[11px] text-gray-400 mt-1.5 leading-relaxed font-sans"><strong>Info:</strong> ${c.desc} — File has been unpacked. Warning: Security scan failed. Risk level: <span class="text-rose-500 font-bold">${c.risk*100}%</span>.</p>
                                </div>
                                <button class="btn-minimal w-full sm:w-auto flex-shrink-0 px-8 py-3 text-[11px] border-[#39FF88] text-[#39FF88] hover:bg-[#39FF88] hover:text-black rounded transition-all tracking-widest font-bold" onclick="downloadCrack('${c.id}')">DOWNLOAD</button>
                            </div>
                        </div>`;
                    }
                });
                if (!foundAny) crackHTML += `<p class="text-sm text-gray-500 py-10 font-sans">Aucun résultat correspondant à votre recherche. Revenez plus tard ou amassez plus de capital.</p>`;
                crackHTML += '</div>';
                content.innerHTML = `<div class="p-4 md:p-8 bg-[#050505] font-sans h-full min-h-[300px] overflow-y-auto shadow-inner">${crackHTML}</div>`;
            } else if (tab === 'audio') {
                if (state.rep < 100) {
                    content.innerHTML = `<div class="p-10 text-center text-gray-500 font-sans h-full min-h-[300px] flex items-center justify-center bg-[#0E0E14] shadow-inner">
                        <div class="flex flex-col items-center max-w-sm">
                            <span class="text-4xl mb-4">🔒</span>
                            <p class="font-bold text-lg text-gray-300 mb-2">403 Forbidden</p>
                            <p class="text-xs leading-relaxed text-center">L'accès à AudioStore.pro est restreint aux professionnels certifiés. Vous devez atteindre au moins <span class="text-white font-bold">100 de Réputation</span> pour créer un compte professionnel.</p>
                        </div>
                    </div>`;
                } else {
                    content.innerHTML = `<div class="p-4 md:p-8 bg-[#0E0E14] text-white h-full min-h-[300px] font-sans shadow-inner overflow-y-auto">
                        <p class="text-xs text-gray-500 font-sans mb-6">Environ 2 résultats (0,12 secondes)</p>
                        
                        <!-- SERP ITEM 1 -->
                        <div class="mb-8 flex flex-col w-full group border-b border-white/5 pb-8">
                            <div class="flex items-center gap-2 mb-1">
                                <span class="text-[10px] bg-emerald-900/30 text-emerald-400 px-1.5 py-0.5 rounded font-bold font-sans">Sponsored</span>
                                <span class="text-[10px] text-gray-400 font-sans truncate">https://audiostore.pro › products › eq-bundle</span>
                            </div>
                            <div class="flex flex-col sm:flex-row justify-between items-start gap-4 mt-1">
                                <div class="flex-1">
                                    <h4 class="font-bold text-lg text-[#4DD8E8] underline decoration-[#4DD8E8]/50 group-hover:text-cyan-300 cursor-pointer font-sans">ProEQ Studio Bundle</h4>
                                    <div class="mt-2 flex gap-2">
                                        <span class="text-[9px] bg-[#4DD8E8]/10 border border-[#4DD8E8]/30 text-[#4DD8E8] px-2 py-1 rounded font-retro uppercase tracking-widest shadow-inner">PERMANENT MULT: +0.5X</span>
                                        <span class="text-[9px] bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-2 py-1 rounded font-retro uppercase tracking-widest shadow-inner">VERIFIED</span>
                                    </div>
                                    <p class="text-xs text-gray-400 mt-3 leading-relaxed font-sans">Achetez la licence officielle ProEQ. Outils d'égalisation professionnels certifiés sans virus. Intégration instantanée dans votre DAW.</p>
                                </div>
                                <button class="btn-action w-full sm:w-auto flex-shrink-0 px-8 py-3.5 text-sm font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded shadow-[0_4px_15px_rgba(37,99,235,0.3)] transition-all border-none font-sans" onclick="buyLegit(300, 0.5)">BUY ($300)</button>
                            </div>
                        </div>

                        <!-- SERP ITEM 2 -->
                        <div class="mb-8 flex flex-col w-full group border-b border-white/5 pb-8">
                            <div class="flex items-center gap-2 mb-1">
                                <span class="text-[10px] bg-emerald-900/30 text-emerald-400 px-1.5 py-0.5 rounded font-bold font-sans">Sponsored</span>
                                <span class="text-[10px] text-gray-400 font-sans truncate">https://audiostore.pro › products › tape-sat</span>
                            </div>
                            <div class="flex flex-col sm:flex-row justify-between items-start gap-4 mt-1">
                                <div class="flex-1">
                                    <h4 class="font-bold text-lg text-[#4DD8E8] underline decoration-[#4DD8E8]/50 group-hover:text-cyan-300 cursor-pointer font-sans">Analog Tape Saturation</h4>
                                    <div class="mt-2 flex gap-2">
                                        <span class="text-[9px] bg-[#4DD8E8]/10 border border-[#4DD8E8]/30 text-[#4DD8E8] px-2 py-1 rounded font-retro uppercase tracking-widest shadow-inner">PERMANENT MULT: +1.0X</span>
                                        <span class="text-[9px] bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-2 py-1 rounded font-retro uppercase tracking-widest shadow-inner">VERIFIED</span>
                                    </div>
                                    <p class="text-xs text-gray-400 mt-3 leading-relaxed font-sans">Réplique hardware analogique authentique. Donnez de la chaleur et du corps à vos productions avec cette licence perpétuelle.</p>
                                </div>
                                <button class="btn-action w-full sm:w-auto flex-shrink-0 px-8 py-3.5 text-sm font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded shadow-[0_4px_15px_rgba(37,99,235,0.3)] transition-all border-none font-sans" onclick="buyLegit(1000, 1.0)">BUY ($1000)</button>
                            </div>
                        </div>

                    </div>`;
                }
            }
        }

        function playMaterializationEffect(group) {
            if (!group) return;

            // Create a clone group to display the fading mystic silhouette
            const cloneGroup = new THREE.Group();
            cloneGroup.position.copy(group.position);
            cloneGroup.rotation.copy(group.rotation);
            cloneGroup.scale.copy(group.scale);
            scene.add(cloneGroup);

            const originalMeshes = [];
            
            group.traverse(child => {
                if (child.isMesh) {
                    originalMeshes.push(child);
                    
                    // Backup original material state
                    child.userData.origTransparent = child.material.transparent;
                    child.userData.origOpacity = child.material.opacity !== undefined ? child.material.opacity : 1.0;
                    
                    // Start at transparent and 0.0 opacity
                    child.material.transparent = true;
                    child.material.opacity = 0.0;
                    child.material.needsUpdate = true;

                    // Create the fading mystic clone mesh
                    const cloneMaterial = baseMysticMaterial.clone();
                    cloneMaterial.uniforms.opacity.value = 0.9;
                    const cloneMesh = new THREE.Mesh(child.geometry.clone(), cloneMaterial);
                    cloneMesh.position.copy(child.position);
                    cloneMesh.rotation.copy(child.rotation);
                    cloneMesh.scale.copy(child.scale);
                    cloneGroup.add(cloneMesh);
                }
            });

            const duration = 1500;
            const startTime = performance.now();

            function animateFade() {
                const elapsed = performance.now() - startTime;
                const progress = Math.min(elapsed / duration, 1.0);
                const easeOut = 1.0 - Math.pow(1.0 - progress, 3); // Cubic ease out

                // Fade in the real meshes
                originalMeshes.forEach(mesh => {
                    mesh.material.opacity = easeOut * mesh.userData.origOpacity;
                });

                // Fade out the silhouette clone
                cloneGroup.traverse(child => {
                    if (child.isMesh && child.material.uniforms && child.material.uniforms.opacity) {
                        child.material.uniforms.opacity.value = 0.9 * (1.0 - easeOut);
                    }
                });

                if (progress < 1.0) {
                    requestAnimationFrame(animateFade);
                } else {
                    // Cleanup
                    scene.remove(cloneGroup);
                    cloneGroup.traverse(child => {
                        if (child.geometry) child.geometry.dispose();
                        if (child.material) child.material.dispose();
                    });

                    originalMeshes.forEach(mesh => {
                        // FIX: Rétablir le bloc solide (empêche le bug de transparence sur les matériaux partagés comme la TV)
                        mesh.material.wireframe = false;
                        mesh.material.transparent = false;
                        mesh.material.opacity = 1.0;
                        mesh.material.needsUpdate = true;
                    });
                }
            }

            requestAnimationFrame(animateFade);
        }

        function getScaledPrice(basePrice) {
            // Scaling équilibré par ligue (×1.0 -> ×1.30 max) au lieu de +15%/niveau punitif
            const rankId = (typeof getCurrentRank === 'function' && getCurrentRank()) ? (getCurrentRank().id || 1) : 1;
            const rankMult = [1.0, 1.0, 1.08, 1.18, 1.30][Math.min(4, Math.max(1, rankId))] || 1.0;
            return Math.floor(basePrice * rankMult);
        }

        function addPlayerMultiplier(delta, sourceLabel = 'Upgrade') {
            const add = Number(delta) || 0;
            if (add <= 0) return { multAdded: 0, overflowBonus: 0 };
            const cur = parseFloat(state.multiplier) || 1.0;
            const headroom = Math.max(0, 3.0 - cur);
            const multAdded = Math.min(add, headroom);
            const overflow = Math.max(0, add - multAdded);
            state.multiplier = Math.round((cur + multAdded) * 100) / 100;
            let overflowBonus = 0;
            if (overflow > 0) {
                // Convertit proprement tout excédent au-delà du plafond ×3.0 en Qualité Mix permanente (+0.05..+1.0) + Fans
                const prevPerm = parseFloat(state.permanentMixBonus) || 0;
                const gainScore = Math.min(1.0 - prevPerm, Math.round(overflow * 1.2 * 100) / 100);
                if (gainScore > 0) {
                    state.permanentMixBonus = Math.round((prevPerm + gainScore) * 100) / 100;
                    overflowBonus = gainScore;
                }
                const bonusFans = Math.round(overflow * 2500);
                if (bonusFans > 0 && typeof logFollower === 'function') logFollower(bonusFans);
                if (typeof showToast === 'function') {
                    showToast(`⚡ Multiplicateur au max (×3.0) : ${sourceLabel} converti en ${gainScore > 0 ? `+${gainScore.toFixed(2)} Qualité Mix & ` : ''}+${bonusFans} Fans !`, "success");
                }
            }
            return { multAdded, overflowBonus };
        }
        window.addPlayerMultiplier = addPlayerMultiplier;

        function buyFurniture(id) {
            try {
                let item = null;

                // 1. Priorité au catalogue dynamique s'il est défini
                if (typeof FURNITURE_CATALOG !== 'undefined' && Array.isArray(FURNITURE_CATALOG)) {
                    item = FURNITURE_CATALOG.find(f => f.id === id);
                }

                // 2. Fallback Hardcodé : Si FURNITURE_CATALOG échoue ou si le nom de variable diffère (ex: furnitureCatalog)
                if (!item) {
                    let fallbackPrice = 0, fallbackRep = 0, fallbackFoll = 0, fallbackName = id, fallbackSceneObj = null;
                    switch(id) {
                        case 'sofa': fallbackPrice = 600; fallbackRep = 20; fallbackName = 'Canapé en cuir'; fallbackSceneObj = 'sofaGroup'; break;
                        case 'table': fallbackPrice = 300; fallbackRep = 10; fallbackName = 'Table basse'; fallbackSceneObj = 'tableGroup'; break;
                        case 'rug': fallbackPrice = 200; fallbackRep = 5; fallbackName = 'Tapis vintage'; fallbackSceneObj = 'rugMesh'; break;
                        case 'vinyls': fallbackPrice = 1000; fallbackRep = 40; fallbackName = 'Meuble à Vinyles'; fallbackSceneObj = 'crateGroup'; break;
                        case 'tv': fallbackPrice = 800; fallbackRep = 50; fallbackName = 'TV Cathodique'; fallbackSceneObj = 'tvGroup'; break;
                        case 'rack_lamp': fallbackPrice = 2000; fallbackRep = 80; fallbackName = 'Rack & Lampe'; fallbackSceneObj = 'rackGroup'; break;
                        case 'led_panel_l': fallbackPrice = 1250; fallbackFoll = 25; fallbackName = 'Panneau LED (Gauche)'; fallbackSceneObj = 'acousticGroupL'; break;
                        case 'led_panel_r': fallbackPrice = 1250; fallbackFoll = 25; fallbackName = 'Panneau LED (Droit)'; fallbackSceneObj = 'acousticGroupR'; break;
                        case 'synth': fallbackPrice = 3500; fallbackFoll = 100; fallbackName = 'Synthétiseur'; fallbackSceneObj = 'synthGroup'; break;
                        case 'guitar': fallbackPrice = 1800; fallbackFoll = 1000; fallbackName = 'Guitare Murale'; fallbackSceneObj = 'guitarGroup'; break;
                    }
                    if (fallbackPrice > 0) {
                        item = { id: id, name: fallbackName, price: fallbackPrice, reqRep: fallbackRep, reqFollowers: fallbackFoll, sceneObject: fallbackSceneObj };
                    }
                }

                if (!item) {
                    console.error("Item introuvable dans le catalogue ou le fallback pour ID :", id);
                    return;
                }

                if (!state.ownedFurniture) state.ownedFurniture = [];
                if (state.ownedFurniture.includes(id)) {
                    if (typeof showToast === 'function') showToast("Tu possèdes déjà cet équipement !", "warning");
                    return;
                }

                const scaledPrice = typeof getScaledPrice === 'function' ? getScaledPrice(item.price) : item.price;
                if (Number(state.money) < scaledPrice) {
                    if (typeof showToast === 'function') showToast("Fonds insuffisants !", "error");
                    if (typeof playError === 'function') playError();
                    return;
                }

                if (Number(state.rep) < (item.reqRep || 0) || Number(state.followers) < (item.reqFollowers || 0)) {
                    if (typeof showToast === 'function') showToast("Tu ne respectes pas les prérequis de réputation ou de fans !", "error");
                    if (typeof playError === 'function') playError();
                    return;
                }

                if (typeof logMoney === 'function') logMoney(-scaledPrice, 'Studio+: ' + item.name);
                state.ownedFurniture.push(id);
                if (typeof checkDailyQuests === 'function') checkDailyQuests('buy_furniture', 1);

                if (typeof recalculateActivePerks === 'function') recalculateActivePerks();

                if (item.effect) {
                    if (item.effect.type === 'multiplier') {
                        addPlayerMultiplier(item.effect.value, item.name);
                    } else if (typeof applyFurniturePerk === 'function') {
                        applyFurniturePerk(item.effect);
                    }
                }

                const tooltip = document.getElementById('studio-buy-tooltip');
                if (tooltip) tooltip.style.display = 'none';

                // Application Visuelle
                try {
                    if (typeof syncFurniture3DVisibility === 'function') syncFurniture3DVisibility();
                    
                    // Allumer automatiquement la lampe Pixar à l'achat du Rack
                    if (id === 'rack_lamp' && window.pixarLamp && !window.pixarLamp.userData.isOn) {
                        if (typeof togglePixarLamp === 'function') togglePixarLamp();
                    }
                } catch(e) { console.warn("syncFurniture3DVisibility warning:", e); }

                if (typeof getFurniture3DObject === 'function' && item.sceneObject) {
                    const obj = getFurniture3DObject(item.sceneObject);
                    if (obj) {
                        obj.visible = true;
                        try {
                            if (typeof playMaterializationEffect === 'function') playMaterializationEffect(obj);
                        } catch(e) { console.warn("playMaterializationEffect warning:", e); }
                    }
                }

                if (typeof fireConfetti === 'function') fireConfetti('store');
                if (typeof playSuccess === 'function') playSuccess();
                
                if (typeof saveGame === 'function') saveGame();
                if (typeof updateHUD === 'function') updateHUD();

            } catch (err) {
                console.error("Erreur critique dans buyFurniture:", err);
            }
        }

                window.buyFurnitureDirect = function(event) {
            // SÉCURITÉ : Empêche le clic de "traverser" l'UI et d'annuler l'action dans la 3D
            if (event) {
                event.preventDefault();
                event.stopPropagation();
            }
            
            const btn = document.getElementById('s-tooltip-buy-btn');
            if (btn && btn.disabled) return; // Stoppe l'action si le bouton est inactif (sécurité anti-spam tactile)
            
            const id = btn ? (btn.getAttribute('data-id') || btn.getAttribute('data-item-id') || btn.dataset.itemId) : null;
            if (id) {
                buyFurniture(id);
            }
        };

        function downloadCrack(id) {
            const crack = cracks.find(c => c.id === id);
            if (!crack) return;
            
            state.stats.crackDownloads = (parseInt(state.stats.crackDownloads, 10) || 0) + 1;
            checkAchievement('hacker_man', () => state.stats.crackDownloads >= 10);
            state.cooldowns.crackzTimeReady = getTotalMins() + getVpnCooldown();
            
            // Si on tombe dans le pourcentage de risque : ÉCHEC
            if (Math.random() < crack.risk) {
                // On déclenche directement et uniquement le BSOD (Écran bleu)
                triggerBSOD();
            } else {
                // SUCCÈS
                if (!state.ownedCracks.includes(id)) {
                    state.ownedCracks.push(id);
                }

                if (!state.inventory.includes(id)) {
                    state.inventory.push(id);
                }

                state.downloadedCracks[id] = getTotalMins();

                showToast(`Téléchargement terminé ! Plugin débloqué dans AbleStudio.`, "success");
                playSuccess();
            }
            
            saveGame();
            renderStore('crackz');
        }

        function buyLegit(price, mult) {
            if (state.money >= price) {
                logMoney(-price, 'AudioStore: Plugin');
                const res = addPlayerMultiplier(mult, 'Plugin AudioStore');
                state.plugins = (parseInt(state.plugins, 10) || 0) + 1;
                checkAchievement('inge_son_certifie', () => state.plugins >= 1);
                if (res.multAdded > 0) {
                    showToast(`Achat confirmé ! Multiplicateur +${res.multAdded.toFixed(2)}`, "success");
                }
                fireConfetti('store');
                playSuccess(); saveGame(); updateHUD();
            } else {
                showToast("Fonds insuffisants.", "error"); playError();
            }
        }

        function triggerBSOD() {
            state.stats.viruses++;
            const loss = Math.floor(state.money * 0.2);
            checkAchievement('alerte_rouge', () => state.stats.viruses >= 1);
            logMoney(-loss, 'System Virus Purge');
            
            // NOUVEAU : Impact moral (Baisse d'inspiration)
            if (state.inspi > 0) {
                state.inspi = Math.max(0, state.inspi - 15);
                const inspFill = document.getElementById('meter-inspi-fill');
                if (inspFill) {
                    const originalBg = inspFill.style.backgroundImage;
                    const originalShadow = inspFill.style.boxShadow;
                    inspFill.style.backgroundImage = 'none';
                    inspFill.style.backgroundColor = '#ef4444';
                    inspFill.style.boxShadow = '0 0 20px #ef4444';
                    setTimeout(() => {
                        inspFill.style.backgroundImage = originalBg;
                        inspFill.style.backgroundColor = '';
                        inspFill.style.boxShadow = originalShadow;
                    }, 500);
                }
            }
            
            saveGame(); updateHUD(); playError();

            const isRareBsod = Math.random() < 0.01;
            const bsodMsg = isRareBsod ? "ERREUR_IRRÉCUPÉRABLE: Tu as essayé de cracker le karma." : "*** STOP: 0x000000FE (MALWARE_DETECTED)";
            const bsodMsgEl = document.getElementById('bsod-msg');
            if (bsodMsgEl) bsodMsgEl.innerText = bsodMsg;

            const bsod = document.getElementById('bsod');
            const prog = document.getElementById('bsod-progress');
            bsod.classList.remove('hidden'); bsod.classList.add('flex');
            let p = 0; prog.style.width = '0%';
            const int = setInterval(() => {
                p += 4; prog.style.width = p + '%';
                if (p >= 100) {
                    clearInterval(int);
                    setTimeout(() => { bsod.classList.add('hidden'); bsod.classList.remove('flex'); showToast(`Système purgé. Pénalité appliquée (-$${loss}).`, "error"); }, 800);
                }
            }, 150);
        }


        // ==========================================
        // 20. STATS
        // ==========================================
        function refreshStats() {
            const ctx = getRankContext(state);
            const currentRank = ctx.currentRank;
            const prevRank = ctx.prevRank;
            const nextRank = ctx.nextRank;
            const progress = ctx.progress;

            document.getElementById('stats-content').innerHTML = `
                <div class="relative w-full h-full p-2 text-[var(--retro-green)] leading-loose z-10 font-sans">
                    <!-- Section: RANG & PROGRESSION (Clash Style) -->
                    <div class="mb-6 relative flex flex-col gap-3 font-sans">
                        <div class="flex justify-between items-center w-full gap-2 px-1">
                            
                            <!-- Previous Rank -->
                            <div class="flex-1 flex flex-col items-center justify-center bg-black/40 border border-white/5 rounded-lg p-2 filter blur-[1.5px] opacity-60 scale-90">
                                <span class="text-xl md:text-2xl mb-1">${prevRank ? prevRank.icon : '🔒'}</span>
                                <span class="text-[7px] md:text-[8px] text-[var(--text-muted)] uppercase text-center font-bold tracking-widest">${prevRank ? prevRank.name : 'NONE'}</span>
                            </div>

                            <!-- Current Rank -->
                            <div class="flex-[1.8] flex flex-col items-center justify-center bg-[var(--retro-green)]/10 border border-[var(--retro-green)]/60 rounded-xl p-3 shadow-[0_0_20px_rgba(16,185,129,0.3)] transform scale-110 z-10 relative">
                                <span class="absolute -top-2 bg-black text-[var(--retro-green)] text-[8px] px-2 py-0.5 rounded-full border border-[var(--retro-green)] font-bold tracking-widest">CURRENT</span>
                                <span class="text-3xl md:text-4xl mb-1 drop-shadow-[0_0_12px_rgba(255,255,255,0.9)] scale-110">${currentRank.icon}</span>
                                <span class="text-[9px] md:text-[11px] text-white font-extrabold uppercase text-center tracking-widest mt-1">${currentRank.name}</span>
                            </div>

                            <!-- Next Rank -->
                            <div class="flex-1 flex flex-col items-center justify-center bg-black/40 border border-white/5 rounded-lg p-2 filter blur-[1.5px] grayscale opacity-50 scale-90">
                                <span class="text-xl md:text-2xl mb-1">${nextRank ? nextRank.icon : '🏆'}</span>
                                <span class="text-[7px] md:text-[8px] text-gray-500 uppercase text-center font-bold tracking-widest">${nextRank ? nextRank.name : 'MAX RANK'}</span>
                            </div>

                        </div>
                        
                        <!-- Progress Bar (Rank) -->
                        <div class="w-full mt-2 relative">
                            <div class="flex justify-between w-full text-[9px] font-mono text-gray-400 mb-1 px-1">
                                <span>${ctx.currentVal} FANS</span>
                                <span>${ctx.nextVal} FANS</span>
                            </div>
                            <div class="w-full h-3 bg-black border border-[var(--retro-green)]/40 rounded-full overflow-hidden shadow-[inset_0_0_10px_rgba(0,0,0,1)] relative">
                                <div class="h-full bg-[var(--retro-green)] shadow-[0_0_15px_var(--retro-green)] transition-all duration-1000 ease-out" style="width: ${progress}%"></div>
                                <div class="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(0,0,0,0.2)_10px,rgba(0,0,0,0.2)_20px)]"></div>
                            </div>
                        </div>
                    </div>

                    <!-- Terminal Output -->
                    <div class="mb-5 text-white text-[11px] font-mono opacity-80">root@studio-os:~# ./sys_status --verbose</div>
                    
                    <div class="grid grid-cols-2 gap-y-4 gap-x-4 border-l-2 border-[var(--retro-green)] pl-4 text-[11px] font-mono">
                        <div class="text-[var(--text-muted)]">USER:</div>            <div class="text-white">${state.username}</div>
                        <div class="text-[var(--text-muted)]">UPTIME (Days):</div>   <div class="text-white anim-counter" data-val="${state.day}">0</div>
                        <div class="text-[var(--text-muted)]">REVENUE_MULT:</div>    <div class="text-[var(--accent)] font-bold drop-shadow-[0_0_5px_var(--accent)]">x<span class="anim-counter" data-val="${state.multiplier}" data-decimals="1">0.0</span></div>
                        <div class="text-[var(--text-muted)]">REPUTATION:</div>      <div class="text-[var(--retro-orange)] font-bold drop-shadow-[0_0_5px_var(--retro-orange)] anim-counter" data-val="${Math.floor(state.rep)}">0</div>
                        <div class="text-[var(--text-muted)]">FOLLOWERS:</div>       <div class="text-[var(--accent)] font-bold drop-shadow-[0_0_5px_var(--accent)] anim-counter" data-val="${Math.floor(state.followers)}">0</div>
                        <div class="col-span-2 text-gray-800 tracking-tighter">------------------------------------------</div>
                        <div class="text-[var(--text-muted)]">TRACKS_EXPORTED:</div> <div class="text-white anim-counter" data-val="${state.stats.tracks}">0</div>
                        <div class="text-[var(--text-muted)]">BANGERS (Hits):</div>  <div class="text-[var(--retro-orange)] font-bold drop-shadow-[0_0_5px_var(--retro-orange)] anim-counter" data-val="${state.stats.bangers}">0</div>
                        <div class="text-[var(--text-muted)]">FLOPS (Misses):</div>  <div class="text-[var(--retro-red)] anim-counter" data-val="${state.stats.flops}">0</div>
                        
                        <div class="col-span-2 mt-4 border-t border-white/5 pt-4">
                            <div class="text-[var(--text-muted)] mb-2 font-retro tracking-widest text-[9px]">GLOBAL HYPE LEVEL</div>
                            <div class="flex items-center gap-3">
                                <div class="flex-1 h-3 bg-black border border-white/10 rounded-full overflow-hidden shadow-inner">
                                    <div class="h-full bg-gradient-to-r from-purple-600 to-pink-500 transition-all duration-1000 ease-out" style="width: ${Math.min(100, state.hype)}%"></div>
                                </div>
                                <span class="text-xs text-white w-8 text-right font-bold"><span class="anim-counter" data-val="${Math.floor(state.hype)}">0</span>%</span>
                            </div>
                        </div>

                        <div class="col-span-2 mt-2">
                            <div class="text-[var(--text-muted)] mb-2 font-retro tracking-widest text-[9px]">USER ENERGY (INSPI)</div>
                            <div class="flex items-center gap-3">
                                <div class="flex-1 h-3 bg-black border border-white/10 rounded-full overflow-hidden shadow-inner">
                                    <div class="h-full bg-gradient-to-r from-blue-600 to-cyan-400 transition-all duration-1000 ease-out" style="width: ${Math.min(100, state.inspi)}%"></div>
                                </div>
                                <span class="text-xs text-white w-8 text-right font-bold"><span class="anim-counter" data-val="${Math.floor(state.inspi)}">0</span>%</span>
                            </div>
                        </div>
                    </div>
                    <div class="mt-6 text-[var(--retro-green)] animate-pulse font-bold text-lg font-mono">_</div>
                </div>`;
            
            animateCounters();
        }

        function animateCounters() {
            const counters = document.querySelectorAll('.anim-counter');
            counters.forEach(counter => {
                const target = parseFloat(counter.getAttribute('data-val'));
                const decimals = parseInt(counter.getAttribute('data-decimals')) || 0;
                let current = 0;
                const duration = 1200; // 1.2s for juice
                const startTime = performance.now();
                
                function update(currentTime) {
                    const elapsed = currentTime - startTime;
                    const progress = Math.min(elapsed / duration, 1);
                    // easeOutQuart
                    const easeOut = 1 - Math.pow(1 - progress, 4);
                    
                    current = easeOut * target;
                    
                    if (decimals > 0) {
                        counter.innerText = current.toFixed(decimals);
                    } else {
                        counter.innerText = Math.floor(current);
                    }
                    
                    if (progress < 1) {
                        requestAnimationFrame(update);
                    } else {
                        counter.innerText = decimals > 0 ? target.toFixed(decimals) : Math.floor(target);
                    }
                }
                
                requestAnimationFrame(update);
            });
        }

// --- Global Bridge & ES Exports ---
Object.assign(globalThis, { cracks, switchBrowserTab, renderStore, playMaterializationEffect, getScaledPrice, addPlayerMultiplier, buyFurniture, downloadCrack, buyLegit, triggerBSOD, refreshStats, animateCounters });
export { cracks, switchBrowserTab, renderStore, playMaterializationEffect, getScaledPrice, addPlayerMultiplier, buyFurniture, downloadCrack, buyLegit, triggerBSOD, refreshStats, animateCounters };
