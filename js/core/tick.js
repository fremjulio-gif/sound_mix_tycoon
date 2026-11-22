    // ==========================================
    // MARCHÉ DYNAMIQUE DES GENRES (HOT DEMAND vs SATURATION)
    // ==========================================
    function ensureGenreMarket() {
        if (!state) return { day: 1, hotGenres: ['drill', 'afropop'], recentCounts: {} };
        if (!state.genreMarket || typeof state.genreMarket !== 'object') {
            state.genreMarket = { day: state.day || 1, hotGenres: ['drill', 'afropop'], recentCounts: {} };
        }
        const gm = state.genreMarket;
        gm.recentCounts = gm.recentCounts || {};
        if (!Array.isArray(gm.hotGenres) || gm.hotGenres.length === 0 || gm.day !== (state.day || 1)) {
            rotateDailyGenreMarket();
        }
        return state.genreMarket;
    }

    function rotateDailyGenreMarket() {
        if (!state || !Array.isArray(DAW_GENRES)) return;
        const gm = state.genreMarket || (state.genreMarket = { day: 1, hotGenres: [], recentCounts: {} });
        const tracks = (state.stats && state.stats.tracks) || 0;
        const allUnl = isAllDawGenresUnlocked();
        const unlocked = DAW_GENRES.filter(g => allUnl || tracks >= g.unlockAt);
        const pool = (unlocked.length >= 2 ? unlocked : DAW_GENRES).map(g => g.id);
        // Shuffle Fisher-Yates pour 2 genres "En Demande" du jour
        for (let i = pool.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [pool[i], pool[j]] = [pool[j], pool[i]];
        }
        gm.day = state.day || 1;
        gm.hotGenres = pool.slice(0, Math.min(2, pool.length));
        // Refroidissement quotidien de la saturation (-1 par jour)
        gm.recentCounts = gm.recentCounts || {};
        for (const k in gm.recentCounts) {
            gm.recentCounts[k] = Math.max(0, (Number(gm.recentCounts[k]) || 0) - 1);
            if (gm.recentCounts[k] === 0) delete gm.recentCounts[k];
        }
    }

    function getGenreMarketStatus(genreId) {
        const gm = ensureGenreMarket();
        const gid = String(genreId || '').toLowerCase();
        const count = Number(gm.recentCounts && gm.recentCounts[gid]) || 0;
        if (count >= 3) {
            return { state: 'saturated', cashMult: 0.80, fansMult: 0.85, tag: '📉', label: 'SATURÉ (-20%)' };
        }
        if (Array.isArray(gm.hotGenres) && gm.hotGenres.includes(gid)) {
            return { state: 'hot', cashMult: 1.25, fansMult: 1.20, tag: '🔥', label: 'EN DEMANDE (+25%)' };
        }
        return { state: 'normal', cashMult: 1.0, fansMult: 1.0, tag: '', label: 'STABLE' };
    }

    function recordGenreMarketExport(genreId) {
        const gm = ensureGenreMarket();
        const gid = String(genreId || '').toLowerCase();
        gm.recentCounts = gm.recentCounts || {};
        // Diminue légèrement les autres genres quand tu varies!
        for (const k in gm.recentCounts) {
            if (k !== gid) {
                gm.recentCounts[k] = Math.max(0, (Number(gm.recentCounts[k]) || 0) - 1);
                if (gm.recentCounts[k] === 0) delete gm.recentCounts[k];
            }
        }
        gm.recentCounts[gid] = Math.min(5, (Number(gm.recentCounts[gid]) || 0) + 1);
    }

    window.getGenreMarketStatus = getGenreMarketStatus;
    window.rotateDailyGenreMarket = rotateDailyGenreMarket;


        // ==========================================
        // 13. GAME TICK
        // ==========================================
        function gameTick() {
            try {
                if (!state) return;
                if (state.isEventActive || state.isReviewActive) return; // Le temps s'arrête seulement pour les événements et les revues

            state.timeMins = (parseInt(state.timeMins, 10) || 0) + 5;
            state.day      =  parseInt(state.day, 10) || 1;


            // --- VÉRIFICATION EXPIRATION ECHO ---
        const currentTotalMins = getTotalMins();
        const echoSubExpiry = parseInt(state.cooldowns.echoSubExpiry, 10) || 0;

        // Si on a un abonnement actif et qu'on vient de dépasser l'heure limite
        if (echoSubExpiry !== 0 && currentTotalMins >= echoSubExpiry) {
    
            // 1. Retour gracieux sur le plan Free (jamais bloquant)
            state.cooldowns.echoSubExpiry = 0;
            state.echoPlan = 'free';
            saveGame();

            // 2. Notification d'expiration adaptée à l'alignement
            let expiryMsg = "Ton forfait Echo AI Pro/Neural a expiré — retour sur Echo-3.5 Lite (Gratuit).";
            if (state.echoAlignment <= -30) {
                expiryMsg = "Forfait Echo expiré. Plus de budget, plus de Boost Algo. Retour sur Lite.";
            } else if (state.echoAlignment >= 30) {
                expiryMsg = "Abonnement Echo suspendu. Tes modules Pro restent en veille jusqu'au renouvellement.";
            }
            showToast(expiryMsg, "warning");
            if (typeof playBleep === 'function') playBleep();
            if (typeof window.syncEchoSidebarUI === 'function') window.syncEchoSidebarUI();
            if (typeof window.updateDawEchoCopilot === 'function') window.updateDawEchoCopilot();
            if (typeof window.updateSocialEchoRadar === 'function') window.updateSocialEchoRadar();
}

            // TÂCHE 3 - Prise de Position Progressive
            if (state.day >= 20 && state.echoStance === 'neutral' && !state.cooldowns._echoStanceCheckThisDay) {
                state.cooldowns._echoStanceCheckThisDay = state.day;
                
                let badDeals = 0;
                let goodDeals = 0;
                if (state.completedDeals) {
                    state.completedDeals.forEach(d => {
                        if (d.totalRep < 0) badDeals++;
                        else if (d.totalRep >= 0) goodDeals++;
                    });
                }
                const isUnderground = goodDeals >= badDeals;
                
                if (state.echoTrust > 65 && isUnderground) {
                    state.echoStance = 'proud';
                } else if (state.echoTrust < 35 || !isUnderground) {
                    state.echoStance = 'disappointed';
                }
                saveGame();
            }

            // Décroissance lente de la Hype (-0.5% toutes les 5 min in-game)
            state.hype = Math.max(0, (parseFloat(state.hype) || 50) - 0.5);

            // Fin de la viralité si le temps est écoulé
            if (state.viralActive && getTotalMins() >= state.viralEndTime) {
                state.viralActive = false;
                showToast("📉 L'effet de viralité s'est estompé.", "info");
            }

            // Régénération passive de l'inspiration (+1.2 point toutes les 5 minutes in-game)
            state.inspi = Math.min(100, (parseFloat(state.inspi) || 0) + 1.2);

            // Syndrome de la page blanche hook (si l'inspiration tombe sous 20%, 15% de chance de déclencher)
            if (state.inspi < 20 && !state.isEventActive && Math.random() < 0.01) {
            startBlankPageMiniGame();
            }

            if (state.timeMins >= 180 && state.timeMins <= 200 && !easterEgg3AM) {
                showToast("3AM... le moment où les meilleurs sons sortent.", "discreet");
                easterEgg3AM = true;
            }

            if (state.timeMins >= 1440) {
                state.timeMins -= 1440;
                state.day += 1;
                if (typeof window.payDailyLabelRoyalties === 'function') {
                    window.payDailyLabelRoyalties();
                }
                // Litige/Procès de Diss Track
                if (state.echoLawsuitDay && state.day === state.echoLawsuitDay) {
                    const penalty = Math.min(state.money, 3000);
                    logMoney(-penalty, "Amende violation copyright");
                    showToast(`⚠️ PROCÈS : L'injection illégale d'ECHO a été détectée ! Amende de ${penalty}$ payée.`, "error");
                    if (typeof playError === 'function') playError();
                    state.echoLawsuitDay = null;
                }

                // Logique de Streak de jours
                const dayDiff = state.day - (state.lastPlayedDay || 0);
                if (state.lastPlayedDay > 0 && dayDiff > 1) {
                    state.streakDays = 0;
                    showToast("Streak de jours rompu ! Inactivité trop longue.", "error");
                }
                state.streakDays = (state.streakDays || 0) + 1;
                state.lastPlayedDay = state.day;
                state.maxStreak = Math.max(state.maxStreak || 0, state.streakDays);

                // Évaluation à chaque tick sécurisée
                if (typeof updateBrandDealsAvailability === 'function') {
                    updateBrandDealsAvailability();
                }
            
            // --- PAIEMENT DES CONTRATS DE SELLOUT ---
                if (state.activeContracts && state.activeContracts.length > 0) {
                    let needsHUDUpdate = false;
                    for (let i = state.activeContracts.length - 1; i >= 0; i--) {
                        const c = state.activeContracts[i];
                        
                        // Sécurité pour les anciennes sauvegardes où daysLeft n'existait pas ou est corrompu (NaN)
                        if (c.daysLeft === undefined || isNaN(c.daysLeft)) {
                            c.daysLeft = c.duration;
                        }
                        
                        // Logique de paiement : si le contrat est censé payer à la fin, on le signale. Par défaut, paiement quotidien.
                        const isEndPay = c.paymentType === 'end';
                        
                        if (!isEndPay && c.daysLeft > 0) {
                            const dailyPay = Math.floor(c.reward / c.duration);
                            const dailyRepCost = c.repCost / c.duration;
                            
                            logMoney(dailyPay, 'Contrat Deal: ' + c.name);
                            state.rep = Math.max(0, state.rep - dailyRepCost);
                            
                            if (typeof spawnFloatingText === 'function') {
                                spawnFloatingText('hud-rep-num', (dailyRepCost > 0 ? '-' : '+') + Math.abs(dailyRepCost).toFixed(1) + ' REP', dailyRepCost > 0 ? 'text-rose-500' : 'text-emerald-400');
                            }
                            needsHUDUpdate = true;
                        }
                        
                        c.daysLeft--;
                        
                        if (c.daysLeft <= 0) {
                            if (isEndPay) {
                                logMoney(c.reward, 'Contrat Terminé: ' + c.name);
                                state.rep = Math.max(0, state.rep - c.repCost);
                                needsHUDUpdate = true;
                            }
                            
                            if (!state.completedDeals) state.completedDeals = [];
                            state.completedDeals.push({ id: c.id, name: c.name, emoji: c.emoji, totalPay: c.reward, totalRep: c.repCost });
                            showToast(`Le contrat avec ${c.name} est terminé !`, 'info');
                            state.activeContracts.splice(i, 1);
                        }
                    }
                    if (needsHUDUpdate) {
                        if (typeof updateHUD === 'function') updateHUD();
                        const appSoc = document.getElementById('app-social');
                        if (appSoc && appSoc.style.display !== 'none' && typeof refreshSocial === 'function') {
                            refreshSocial();
                        }
                    }
                }
                
                if (state.streakDays === 3) {
                    logMoney(500, "Streak 3 Jours");
                    showToast("🔥 Streak de 3 jours ! +500$", "success");
                    if (typeof fireConfetti === 'function') fireConfetti('store');
                } else if (state.streakDays === 7) {
                    logMoney(2000, "Streak 7 Jours");
                    state.rep = (parseInt(state.rep, 10) || 0) + 20;
                    showToast("👑 Streak de 7 jours ! +2000$ & +20 REP", "success");
                    if (typeof fireConfetti === 'function') fireConfetti('store');
                } else if (state.streakDays === 14) {
                    logMoney(5000, "Streak 14 Jours");
                    state.rep = (parseInt(state.rep, 10) || 0) + 50;
                    showToast("🏆 STREAK DE 14 JOURS ! +5000$ & +50 REP", "success");
                    if (typeof fireConfetti === 'function') fireConfetti('store');
                }

                if ([10, 50, 100].includes(state.day)) {
                    showToast("🎂 Jour " + state.day + ". Ça fait un bail que tu te la butes là.", "success");
                }
                
                // Achievement: Vrai Rat de Studio
                state.stats.awakeDays = (state.stats.awakeDays || 0) + 1;
                checkAchievement('vrai_rat_de_studio', () => state.stats.awakeDays >= 3);

                dailyReset(); // Le dailyReset est appelé une fois par jour, peu importe la vitesse
            }

            // Applique le multiplicateur de temps si le personnage dort ou est assis
            if (state.isSleeping || state.isSitting) {
                state.timeMins += 2.5; // 5 minutes * 0.5 (pour un total de 1.5x la vitesse normale)
                // Petit effet sonore de tic-tac accéléré pour marquer le passage du temps
                playTone(900, 'sine', 0.02, 0.01); // Tic
                setTimeout(() => playTone(700, 'sine', 0.02, 0.01), 250); // Tac
            }

                        // --- SYSTÈME DE PROXIMITÉ DE LA PORTE ---
            if (typeof currentRoomAvatar !== 'undefined' && currentRoomAvatar) {
                // Règle ici les coordonnées X et Z (et Y) approximatives de ta porte 3D !
                // (Modifie x: 4.5, z: 4.5 selon l'endroit où se trouve la porte dans ta scène)
                const doorPos = new THREE.Vector3(-4.95, -1, 4.0); 
                const dist = currentRoomAvatar.position.distanceTo(doorPos);
                
                const doorBtn = document.getElementById('door-action-btn');
                const doorReady = parseInt(state.cooldowns?.doorTimeReady, 10) || 0;
                const canPlayDoor = getTotalMins() >= doorReady;

                // Si l'avatar est à moins de 2.5 unités de distance, que le cooldown est fini et qu'aucun event n'est en cours :
                if (dist < 2.5 && canPlayDoor && !state.isEventActive && !state.isSleeping && !state.isSitting) {
                    doorBtn.classList.remove('hidden');
                } else {
                    doorBtn.classList.add('hidden');
                }
            }

            if (state.timeMins % 60 === 0) saveGame();

            updateHUD();
            updateCooldownUIs();

            // --- LIGHTNING STRIKE LOGIC (RARE WHEN INSPI IS CRITICALLY LOW) ---
            if (state.inspi <= 5 && !state.isSleeping && !state.isSitting && !state.isExporting) {
                if (Math.random() < 0.015) { // Env. 1.5% de chance par seconde
                    triggerLightningEffect();
                }
            }

            // --- SÉCURITÉ RNG : Vérification de la période de grâce ---
            const eventGracePeriod = parseInt(state.cooldowns.eventGracePeriod, 10) || 0;
            const currentTime = getTotalMins();

            if (!state.isEventActive && !state.isExporting && !state.isReviewActive && currentTime >= eventGracePeriod) {
                const r = Math.random();
                if (r < 0.001) { if(canTriggerMiniGame()){ state.lastMiniGameTime=Date.now(); triggerRandomEvent('collab'); } }
                else if (r < 0.002) { if(canTriggerMiniGame()){ state.lastMiniGameTime=Date.now(); triggerRandomEvent('vol'); } }
                else if (r < 0.0025) { if(canTriggerMiniGame()){ state.lastMiniGameTime=Date.now(); triggerRandomEvent('badbuzz'); } }
                else {
                    // Probabilité dynamique pour les DMs : environ 5% par tick
                    // Mais: on bloque si la boîte de réception contient déjà trop de messages non résolus,
                    // et on respecte un cooldown global `state.cooldowns.nextDMTick` en minutes.
                    state.dms = state.dms || [];
                    state.cooldowns = state.cooldowns || {};
                    const unresolvedCount = (state.dms || []).filter(d => !d.resolved).length;
                    const nextAllowed = parseInt(state.cooldowns.nextDMTick || 0, 10) || 0;

                    // Hard cap: max 3 active (non-resolved) DMs
                    if (unresolvedCount >= 3) {
                        // Trop de messages actifs : on bloque la génération
                    } else if (currentTime < nextAllowed) {
                        // On est encore en cooldown global pour les DMs
                    } else {
                        const dmChance = 0.05;
                        if (Math.random() < dmChance) spawnRandomDM();
                    }
                }
            }
            } catch (err) {
                console.error("Critical error in gameTick:", err);
            }
        }


        // ==========================================
        // LOYER HEBDOMADAIRE STUDIO & BAIL PENTHOUSE 42E (CHILL × TYCOON)
        // ==========================================
        window.getCurrentWeeklyRent = function() {
            if (!state) return 150;
            if (state.studioUnlocked || window.activeStudioLocation === 'pro_studio') return 1500;
            const t = Number(state.roomTier) || 1;
            if (t >= 3) return 500;
            if (t === 2) return 300;
            return 150;
        };

        function dailyReset() {
            easterEgg3AM = false;
            if (state.rep > 0) {
                const gain = Math.floor(state.rep * 0.1) + Math.floor(Math.random() * 5);
                logFollower(gain);
            }
            // Rotation quotidienne du marché des genres (🔥 HOT vs 📉 SATURÉ)
            if (typeof rotateDailyGenreMarket === 'function') {
                rotateDailyGenreMarket();
                if (typeof updateDawGenres === 'function') updateDawGenres();
            }

            // Progression organique du Producteur Rival (KROWN // 808)
            if (state.rivalState) {
                state.rivalState.score = Math.round((Number(state.rivalState.score) || 1400) + 35 + Math.random() * 30);
            }

            // Loyer hebdomadaire / Bail 42e Étage (jamais de game-over brutal : tension tycoon équilibrée)
            const curDay = Number(state.day) || 1;
            state.lastRentDay = Number(state.lastRentDay) || 1;
            const daysSinceRent = curDay - state.lastRentDay;
            const rentAmt = window.getCurrentWeeklyRent();
            if (daysSinceRent === 6) {
                showToast(`🧾 Rappel Bail Studio : $${rentAmt.toLocaleString('fr-FR')} seront prélevés demain.`, "info");
            } else if (daysSinceRent >= 7) {
                state.lastRentDay = curDay;
                if ((Number(state.money) || 0) >= rentAmt) {
                    logMoney(-rentAmt, state.studioUnlocked ? 'Bail Penthouse 42e Étage' : 'Loyer Studio Hebdo');
                    showToast(`🏢 Bail Studio réglé : -$${rentAmt.toLocaleString('fr-FR')}`, "info");
                } else {
                    const paid = Math.max(0, Math.floor(Number(state.money) || 0));
                    if (paid > 0) logMoney(-paid, 'Acompte Loyer Studio');
                    state.hype = Math.max(0, (Number(state.hype) || 50) - 5);
                    showToast(`⚠️ Loyer en retard ($${rentAmt} dus) : acompte versé (-5% Hype). Relance des prods !`, "warning");
                }
            }

            // Cérémonie officielle des Bounce Awards tous les 14 jours
            const triggerAwardsToday = (curDay >= 14 && (curDay - (Number(state.lastCeremonyDay) || 0)) >= 14 && !state.isEventActive);
            if (triggerAwardsToday) {
                setTimeout(() => {
                    if (!state.isEventActive && typeof window.openBounceAwardsCeremony === 'function') {
                        window.openBounceAwardsCeremony(true);
                    }
                }, 1600);
            } else if (curDay >= 10 && (curDay - (Number(state.lastShowcaseDay) || 0)) >= 10 && !state.isEventActive) {
                // Bounce Live · Showcase & Listening Party automatique tous les 10 jours (sans collision avec Awards)
                setTimeout(() => {
                    if (!state.isEventActive && !state.isSleeping && typeof window.openBounceShowcase === 'function') {
                        window.openBounceShowcase(true);
                    }
                }, 1400);
            }

            refreshSocial();
            refreshStats();
            // Decrement challenge daysRemaining and auto-generate when expired
            state.activeChallenge = state.activeChallenge || { daysRemaining: 7 };
            state.activeChallenge.daysRemaining = (parseInt(state.activeChallenge.daysRemaining, 10) || 0) - 1;
            if (state.activeChallenge.daysRemaining <= 0) generateNewChallenge();
            updateChallengeUI();

            // Expire temporary boosts if needed
            try {
                if (state.activeBoost && state.activeBoost.expiresDay !== undefined) {
                    const nowDay = parseInt(state.day || 0, 10) || 0;
                    if (nowDay >= (parseInt(state.activeBoost.expiresDay, 10) || 0)) {
                        // revert multiplier
                        const mult = parseFloat(state.activeBoost.multiplier || 1) || 1;
                        state.multiplier = (parseFloat(state.multiplier) || 1) / mult;
                        delete state.activeBoost;
                        showToast('Le boost REP est terminé.', 'info');
                        saveGame(); updateHUD();
                    }
                }
            } catch(e) {}
        }


        function updateTopChartsWidget() {
        const container = document.getElementById('top-charts-list');
        if (!container) return;

        if (!state.trackList || state.trackList.length === 0) {
            container.innerHTML = '<p class="text-[10px] text-gray-500 font-retro text-center mt-6 tracking-widest uppercase">No hits found...</p>';
            return;
        }

        // On affiche seulement les 4 ou 5 meilleurs sur le widget
        const topTracks = state.trackList.slice(0, 5);

        container.innerHTML = topTracks.map((t, i) => {
            const colorClass = t.score >= 7 ? 'text-[var(--retro-green)] drop-shadow-[0_0_5px_var(--retro-green)]' : 
                            (t.score >= 4 ? 'text-[var(--retro-orange)]' : 'text-[var(--retro-red)]');
            
            // Formater les thunes et fans de manière compacte
            const statsStr = `+$${formatNum(t.money)} | +${formatNum(t.fans)} FOL`;

            return `
            <div class="flex items-center justify-between border-b border-white/5 pb-2 pt-1 hover:bg-white/5 px-2 rounded transition-colors group">
                <div class="flex items-center gap-3 overflow-hidden">
                    <span class="text-sm font-bold font-retro text-gray-600 group-hover:text-white transition-colors">#${i + 1}</span>
                    <div class="flex flex-col overflow-hidden">
                        <span class="text-[11px] font-bold text-gray-200 truncate w-32 tracking-wider">${t.title}</span>
                        <span class="text-[8px] text-[var(--text-muted)] font-retro tracking-widest truncate">${t.genre} · DAY ${t.date}</span>
                    </div>
                </div>
                <div class="flex flex-col items-end flex-shrink-0">
                    <span class="font-retro font-bold text-sm ${colorClass}">${t.score}/10</span>
                    <span class="text-[8px] font-retro text-[var(--text-muted)] group-hover:text-[var(--retro-green)] transition-colors">${statsStr}</span>
                </div>
            </div>
            `;
        }).join('');
    }


    // ==========================================
    // Weekly Challenge System (Fix: Relocated from Dead Code area)
    // ==========================================
    const CHALLENGE_POOL = [
        { type: 'specific_track', title: 'Commande sur mesure', desc: 'Produis un son {genre} à {bpm} BPM aujourd\'hui.', rewardType: 'rep_boost', rewardAmount: 25 },
        { type: 'specific_track', title: 'Cibler l\'algorithme', desc: 'Sors une prod {genre} à {bpm} BPM aujourd\'hui.', rewardType: 'followers', rewardAmount: 1500 },
        { type: 'social_streak', title: 'Présence Réseaux', desc: 'Publie un total de {target} stories sur SoundNet.', rewardType: 'followers', rewardAmount: 800 },
        { type: 'pure_skill', title: 'Talent Brut', desc: 'Fais {target} Banger(s) sans utiliser de plugin.', rewardType: 'rep_boost', rewardAmount: 40 }
    ];

    function pickRandomGenreForChallenge() {
        const available = DAW_GENRES || [];
        if (!available.length) return 'UK Drill';
        const pick = available[Math.floor(Math.random() * available.length)];
        return pick ? pick.name : 'UK Drill';
    }
    function pickRandomBpmForChallenge(genreName) {
        const g = DAW_GENRES.find(x => x.name === genreName);
        if (!g) return 120;
        return Math.max(60, g.targetBpm + (Math.floor(Math.random() * 11) - 5));
    }

    function generateNewChallenge() {
        const pool = CHALLENGE_POOL.slice();
        const base = pool[Math.floor(Math.random() * pool.length)];
        const ch = JSON.parse(JSON.stringify(base));
        ch.id = `ch_${Date.now()}_${Math.floor(Math.random()*999)}`;
        ch.currentProgress = 0; ch.daysRemaining = 7; ch.isCompleted = false;

        if (ch.type === 'specific_track') {
            const genre = pickRandomGenreForChallenge();
            const bpm = pickRandomBpmForChallenge(genre);
            ch.description = ch.desc.replace('{genre}', genre).replace('{bpm}', bpm);
            ch.targetValue = 1; ch.meta = { genre: genre.toLowerCase(), bpm };
        } else if (ch.type === 'social_streak') {
            const t = 3 + Math.floor(Math.random() * 3);
            ch.description = ch.desc.replace('{target}', t); ch.targetValue = t;
        } else if (ch.type === 'pure_skill') {
            const t = 1 + Math.floor(Math.random() * 2);
            ch.description = ch.desc.replace('{target}', t); ch.targetValue = t;
        }

        state.activeChallenge = ch;
        saveGame(); updateChallengeUI();
        showToast(`Nouveau défi: ${ch.description}`, 'info');
    }

    function checkChallengeProgress(type, data) {
        const ch = state.activeChallenge;
        if (!ch || !ch.id || ch.isCompleted) return;
        let matched = false;
        if (ch.type === 'specific_track' && type === 'export') {
            if ((data.genre || '').toLowerCase() === (ch.meta.genre || '').toLowerCase() && Math.abs(data.bpm - ch.meta.bpm) <= 5) matched = true;
        } else if (ch.type === 'social_streak' && type === 'story') matched = true;
        else if (ch.type === 'pure_skill' && type === 'export') {
            if (data.score >= 7 && !data.pluginId) matched = true;
        }

        if (matched) {
            ch.currentProgress++;
            if (ch.currentProgress >= ch.targetValue) {
                ch.isCompleted = true;
                ch.daysRemaining = 7; 
                if (ch.rewardType === 'followers') state.followers += ch.rewardAmount;
                else if (ch.rewardType === 'rep_boost') state.rep += ch.rewardAmount;
                showToast(`Défi complété !`, 'success'); fireConfetti('achievement');
            }
            saveGame(); updateHUD(); updateChallengeUI();
        }
    }

    function updateChallengeUI() {
        const ch = state.activeChallenge;
        const elDesc = document.getElementById('challenge-desc');
        const elBar = document.getElementById('challenge-bar');
        const elProg = document.getElementById('challenge-progress');
        const elDays = document.getElementById('challenge-days');
        const elReward = document.getElementById('challenge-reward');
        if (!ch || !ch.id || !elDesc) return;

        elDesc.innerText = ch.isCompleted ? "DÉFI TERMINÉ ! ✓" : (ch.description || ch.title);
        const pct = ch.isCompleted ? 100 : Math.round((ch.currentProgress / ch.targetValue) * 100);
        if (elBar) elBar.style.width = pct + '%';
        if (elProg) elProg.innerText = ch.isCompleted ? 'DONE' : `${ch.currentProgress}/${ch.targetValue}`;
        if (elDays) elDays.innerText = ch.daysRemaining + 'j';
        if (elReward) elReward.innerText = ch.rewardType === 'rep_boost' ? `+${ch.rewardAmount} REP` : `+${ch.rewardAmount} FANS`;
    }
        
        
        // ==========================================
        // ANTI-SPAM & STATE LOCK POUR MINI-JEUX
        // ==========================================
        function canTriggerMiniGame() {
            if (state.isEventActive || state.isExporting || state.isReviewActive || state.isSleeping || state.isSitting) return false;
            state.lastMiniGameTime = state.lastMiniGameTime || 0;
            return (Date.now() - state.lastMiniGameTime) > 180000; // 3 minutes cooldown
        }

// --- Global Bridge & ES Exports ---
Object.assign(globalThis, { ensureGenreMarket, rotateDailyGenreMarket, getGenreMarketStatus, recordGenreMarketExport, gameTick, dailyReset, updateTopChartsWidget, CHALLENGE_POOL, pickRandomGenreForChallenge, pickRandomBpmForChallenge, generateNewChallenge, checkChallengeProgress, updateChallengeUI, canTriggerMiniGame });
export { ensureGenreMarket, rotateDailyGenreMarket, getGenreMarketStatus, recordGenreMarketExport, gameTick, dailyReset, updateTopChartsWidget, CHALLENGE_POOL, pickRandomGenreForChallenge, pickRandomBpmForChallenge, generateNewChallenge, checkChallengeProgress, updateChallengeUI, canTriggerMiniGame };
