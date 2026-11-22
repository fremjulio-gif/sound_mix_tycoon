        // ==========================================
    // SYSTÈME DE MESSAGERIE PRIVÉE (DM)
    // Structure catégorisée et pool pour éviter les doublons
    const DM_TEMPLATES = {
        spam: [
            { id: 'spam_1', baseName: 'A&R Mike', avatarColor: 'bg-blue-600', text: "Tes prods sont dingues. Envoie $200 via PayPal et je t'ajoute à une grosse playlist. Streams garantis.", choices: [ { text: "Payer $200", effect: () => { logMoney(-200, "Scam Playlist"); showToast("Tu t'es fait scam. 0 stream ajouté.", "error"); playError(); } }, { text: "L'insulter", effect: () => { state.rep += 5; showToast("T'as gardé ton intégrité (+5 REP).", "success"); playBleep(); } }, { text: "Ignorer", effect: () => { playBleep(); } } ] },
            { id: 'spam_2', baseName: 'PromoDesk', avatarColor: 'bg-sky-600', text: "Pack promo viral: 5 placements réseaux pour 50€. Offre limitée.", choices: [ { text: "Acheter (50€)", effect: () => { logMoney(-50, "Promo Pack"); showToast("Promo achetée, visibilité mineure.", "info"); } }, { text: "Passer", effect: () => { playBleep(); } } ] },
            { id: 'spam_3', baseName: 'HotList', avatarColor: 'bg-indigo-600', text: "Placement premium pour 100€. Réponse rapide = feature.", choices: [ { text: "Payer", effect: () => { logMoney(-100, "Placement HotList"); showToast("Placement réservé, pas de garanties.", "info"); } }, { text: "Refuser", effect: () => { playBleep(); } } ] },
            { id: 'spam_4', baseName: 'PromoBot', avatarColor: 'bg-emerald-600', text: "Boost instantané 2h: +100 followers pour 9,99€.", choices: [ { text: "Acheter", effect: () => { logMoney(-10, "Fake Followers"); logFollower(100); showToast("Followers achetés (+100).", "success"); } }, { text: "Ignorer", effect: () => { playBleep(); } } ] },
            { id: 'spam_5', baseName: 'QuickGain', avatarColor: 'bg-yellow-600', text: "Tu veux 10k plays immédiats ? Offre 29€. Pas de remboursement.", choices: [ { text: "Acheter", effect: () => { logMoney(-29, "Instant Plays"); showToast("Plays achetés. Effet incertain.", "info"); } }, { text: "Refuser", effect: () => { playBleep(); } } ] }
        ],
        collab: [
            { id: 'collab_1', baseName: 'Lil Kevdu', avatarColor: 'bg-green-600', text: "J'ai un freestyle la semaine pro, budget 150. Tu peux m'envoyer une prod sombre ?", choices: [ { text: "Accepter ($150)", effect: () => { logMoney(150, "Prod Local"); state.rep += 10; showToast("Feat validé: +$150 | +10 REP", "success"); playSuccess(); } }, { text: "Négocier ($300)", effect: () => { if(Math.random()>0.5){ logMoney(300, "Prod Local"); showToast("Il a lâché les billets ! +$300", "success"); playSuccess(); } else { showToast("Il a ghosté.", "error"); playError(); } } }, { text: "Recaler", effect: () => { state.rep = Math.max(0, state.rep - 5); showToast("Il a mal pris ton refus (-5 REP)", "error"); playError(); } } ] },
            { id: 'collab_2', baseName: 'EchoBeats', avatarColor: 'bg-violet-600', text: "J'adore ton son. On fait un EP ensemble ? On partage les royalties.", choices: [ { text: "Signer l'EP", effect: () => { state.rep += 20; showToast("Collab confirmée: +20 REP", "success"); } }, { text: "Refuser", effect: () => { state.rep = Math.max(0, state.rep - 5); showToast("Collab refusée (-5 REP)", "error"); } } ] },
            { id: 'collab_3', baseName: 'Nova', avatarColor: 'bg-pink-500', text: "Hey! J'ai 50k followers, je veux un beat gratuit pour mon clip.", choices: [ { text: "Taffer gratis", effect: () => { logFollower(3000); state.rep = Math.max(0, state.rep - 10); showToast("Boost fans (+3000) mais perte de réputation (-10 REP)", "info"); } }, { text: "Facturer ($400)", effect: () => { if(Math.random()>0.6){ logMoney(400, "Synchro"); showToast("Facturation acceptée (+$400)", "success"); } else { state.followers = Math.max(0, state.followers - 200); showToast("Elle t'a clashé (-200 Fans)", "error"); } } } ] },
            { id: 'collab_4', baseName: 'StreetLink', avatarColor: 'bg-rose-600', text: "On veut ton son pour une BO indé. Paiement et kicker inclus.", choices: [ { text: "Accepter", effect: () => { logMoney(800, "BO Indé"); state.rep += 30; showToast("BO bookée! +$800 | +30 REP", "success"); } }, { text: "Refuser", effect: () => { playBleep(); } } ] },
            { id: 'collab_5', baseName: 'BeatWave', avatarColor: 'bg-cyan-600', text: "Salut, tu veux prod pour ma tournée locale ? Paiement par date.", choices: [ { text: "Signer dates", effect: () => { logMoney(200, "Tournée"); state.rep += 15; showToast("Dates ajoutées +$200 | +15 REP", "success"); } }, { text: "Passer", effect: () => { playBleep(); } } ] }
        ],
        business: [
            { id: 'biz_1', baseName: 'SonyA&R', avatarColor: 'bg-purple-600', text: "On suit ton ascension. On propose d'acheter tes masters pour $5000.", choices: [ { text: "Vendre masters ($5000)", effect: () => { logMoney(5000, "Vente Exclusive"); state.rep = Math.max(0, state.rep - 30); showToast("Vente conclue: +$5000, -30 REP", "success"); playCashSound(); } }, { text: "Refuser", effect: () => { state.rep += 50; showToast("Indépendant: +50 REP", "success"); playSuccess(); } } ] },
            { id: 'biz_2', baseName: 'SyncHouse', avatarColor: 'bg-gray-700', text: "Placement sync pour pub télé: $1200 net.", choices: [ { text: "Accepter ($1200)", effect: () => { logMoney(1200, "Sync Deal"); showToast("Sync signée +$1200", "success"); } }, { text: "Refuser", effect: () => { playBleep(); } } ] },
            { id: 'biz_3', baseName: 'MerchCo', avatarColor: 'bg-orange-600', text: "On veut te sponsoriser pour ta ligne de merch. Offre initiale: $600.", choices: [ { text: "Signer", effect: () => { logMoney(600, "Sponsor"); state.rep += 10; showToast("Sponsor signé +$600 | +10 REP", "success"); } }, { text: "Négocier", effect: () => { if(Math.random()>0.5){ logMoney(1000, "Sponsor"); showToast("Négociation gagnée +$1000", "success"); } else { showToast("Ils ont passé.", "error"); } } } ] },
            { id: 'biz_4', baseName: 'PublisherX', avatarColor: 'bg-fuchsia-600', text: "On propose un deal d'édition 50/50 pour ton prochain single.", choices: [ { text: "Signer", effect: () => { state.rep += 25; showToast("Contrat d'édition signé +25 REP", "success"); } }, { text: "Refuser", effect: () => { playBleep(); } } ] },
            { id: 'biz_5', baseName: 'TourAgent', avatarColor: 'bg-slate-600', text: "Booking agent interested for a regional tour. Advance: $1000.", choices: [ { text: "Take advance", effect: () => { logMoney(1000, "Tour Advance"); state.rep += 20; showToast("Booking secured +$1000 | +20 REP", "success"); } }, { text: "Decline", effect: () => { playBleep(); } } ] }
        ]
    };

    // Pool to avoid repeats until exhaustion
    const DM_POOL = { spam: [], collab: [], business: [] };
    function refillDMPool(category) {
        const ids = DM_TEMPLATES[category].map(v => v.id).slice();
        // Fisher-Yates shuffle
        for (let i = ids.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [ids[i], ids[j]] = [ids[j], ids[i]];
        }
        DM_POOL[category] = ids;
    }

    function generateSenderName(base) {
    const prefixes = [
        'Neo','Sky','Urban','Wave','Lil','DJ','MC','Meta','Echo','Nova','Grand','Prod','Beat',
        'Mr','Mrs','TheReal','Its','Only','Kingg','Queenn','Young','Bigg','Reall',
        'xX','iam','iamthe','LeVraii','Mister','Ladyy','Captainn','Bosss',
        'Cryptoo','Instaa','Virall','Trendd','Hypee','Glow','Flexx','Dripp',
        'Zeuz','Apexx','Alphaa','Omegaa','Turboo','Ultraa','Megaa','Superr'
    ];
    const suffixes = [
        'Prodz','Beatz','Officiel','Musiik','Studioo','Soundz','Recordz','Co',
        'TVV','Vlogz','Vlogg','0fficiel','Reell','Reelz','Gangg','Squadd',
        'Worldd','Nationn','HQ','Lifee','Empirre','Mediaa','Networkk','Fr',
        '_Reell','_0fficiel','Francee','Livee','24_7','Dailyy','Showw',
        'XxTV','TVxX','_YTT','_Instaa','Tokk','Clipz','Momentz','Storiez'
    ];
    const name = prefixes[Math.floor(Math.random() * prefixes.length)];
    const num = Math.random() < 0.4 ? String(Math.floor(Math.random() * 9999)) : '';
    const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
    const core = base ? base.split(' ')[0] : name;
    return `@${core}${num}${suffix}`;
}

    globalThis.currentDealTab = 'available';
    function switchDealTab(tabId) {
        currentDealTab = tabId;
        const btnAvail = document.getElementById('tab-deals-avail');
        const btnHist = document.getElementById('tab-deals-hist');
        const listAvail = document.getElementById('sponsor-list');
        const listHist = document.getElementById('sponsor-history');
        
        if (tabId === 'available') {
            btnAvail.className = "text-[9px] px-2 py-1 bg-[var(--accent)]/20 text-[var(--accent)] border border-[var(--accent)] rounded cursor-pointer transition-colors";
            btnHist.className = "text-[9px] px-2 py-1 bg-black/40 text-gray-400 border border-white/10 rounded cursor-pointer hover:text-white transition-colors";
            listAvail.classList.remove('hidden');
            listHist.classList.add('hidden');
        } else {
            btnHist.className = "text-[9px] px-2 py-1 bg-[var(--accent)]/20 text-[var(--accent)] border border-[var(--accent)] rounded cursor-pointer transition-colors";
            btnAvail.className = "text-[9px] px-2 py-1 bg-black/40 text-gray-400 border border-white/10 rounded cursor-pointer hover:text-white transition-colors";
            listHist.classList.remove('hidden');
            listAvail.classList.add('hidden');
        }
    }

    function switchSocialTab(tab) {
        const btnFeed = document.getElementById('tab-social-feed');
        const btnDMs = document.getElementById('tab-social-dms');
        const contentFeed = document.getElementById('social-content-feed');
        const contentDMs = document.getElementById('social-content-dms');

        if (tab === 'feed') {
            btnFeed.className = "flex-1 py-4 transition-colors border-r border-[#27272a] bg-[#27272a] text-white shadow-inner";
            btnDMs.className = "flex-1 py-4 transition-colors text-gray-500 hover:bg-white/5 hover:text-white relative";
            contentFeed.classList.remove('hidden');
            contentDMs.classList.add('hidden');
            contentDMs.classList.remove('flex');
        } else {
            btnDMs.className = "flex-1 py-4 transition-colors bg-[#27272a] text-white shadow-inner relative";
            btnFeed.className = "flex-1 py-4 transition-colors border-r border-[#27272a] text-gray-500 hover:bg-white/5 hover:text-white";
            contentFeed.classList.add('hidden');
            contentDMs.classList.remove('hidden');
            contentDMs.classList.add('flex');
            
            // Masque la pastille rouge et arrête la vibration
            const notif = document.getElementById('dm-notif');
            if(notif) notif.classList.add('hidden');
            btnDMs.classList.remove('animate-dm-shake');
            renderDMs();
        }
        playBleep();
    }

    // Cherche un template par id dans la structure catégorisée
    function getTemplateById(id) {
        for (const cat of Object.keys(DM_TEMPLATES)) {
            const found = DM_TEMPLATES[cat].find(t => t.id === id);
            if (found) return found;
        }
        return null;
    }

    function renderDMs() {
        const container = document.getElementById('dm-list-container');
        if (!container) return;

        state.dms = state.dms || [];

        if (state.dms.length === 0) {
            container.innerHTML = '<p class="text-[10px] text-gray-500 font-retro text-center mt-10 tracking-widest uppercase">Boîte de réception vide.</p>';
            return;
        }

        // Tri : Non lus en premier, puis du plus récent au plus vieux
        const sortedDMs = [...state.dms].sort((a, b) => {
            if (a.resolved === b.resolved) return b.timestamp - a.timestamp;
            return a.resolved ? 1 : -1;
        });

        const echoTier = typeof window.getEchoTier === 'function' ? window.getEchoTier() : 'free';
        const echoNegoPct = echoTier === 'neural' ? 30 : (echoTier === 'pro' ? 15 : 0);

        container.innerHTML = sortedDMs.map(dm => {
            const template = getTemplateById(dm.templateId);
            if (!template) return '';

            const isScamDM = (DM_TEMPLATES.spam || []).some(t => t.id === dm.templateId);
            const isBizOrCollab = !isScamDM;

            // Use runtime overrides if present (unique sender/avatar/text per instance)
            const sender = dm.runtimeSender || template.sender || (`@${template.baseName || template.id}`);
            const avatarColor = dm.runtimeAvatarColor || template.avatarColor || 'bg-gray-600';
            const text = dm.runtimeText || template.text || '';

            let echoShieldBadge = '';
            if (!dm.resolved && echoTier !== 'free') {
                if (isScamDM) {
                    echoShieldBadge = `<div class="mt-2.5 px-2.5 py-1.5 rounded-lg bg-rose-500/15 border border-rose-500/40 text-[10px] font-mono text-rose-300 flex items-center gap-2"><span>🛡️</span><span><strong>ECHO SHIELD :</strong> Arnaque / Faux compte détecté. Ne paie pas ce contact.</span></div>`;
                } else if (isBizOrCollab && echoNegoPct > 0) {
                    echoShieldBadge = `<div class="mt-2.5 px-2.5 py-1.5 rounded-lg bg-emerald-500/12 border border-emerald-400/35 text-[10px] font-mono text-emerald-300 flex items-center gap-2"><span>✦</span><span><strong>ECHO AGENT :</strong> Contact vérifié · Bonus négociation +${echoNegoPct}% cash si deal conclu.</span></div>`;
                }
            }

            let choicesHTML = '';
            if (!dm.resolved) {
                choicesHTML = `<div class="flex flex-wrap gap-2 mt-4 pt-4 border-t border-[#27272a]">` + 
                    template.choices.map((c, idx) => `
                        <button class="btn-minimal flex-1 py-2 px-3 text-[9px] rounded font-retro tracking-widest hover:border-[var(--accent)] hover:text-white transition-colors" onclick="answerDM('${dm.instanceId}', ${idx})">${c.text}</button>
                    `).join('') + `</div>`;
            } else {
                const choiceText = template.choices[dm.choiceIdx]?.text || "Ignoré";
                choicesHTML = `<div class="mt-4 pt-4 border-t border-[#27272a]"><span class="text-[9px] font-retro text-gray-500 tracking-widest uppercase">✅ Répondu : ${choiceText}</span></div>`;
            }

            return `
                <div class="bg-[#18181b] border ${(!dm.resolved && isScamDM && echoTier !== 'free') ? 'border-rose-500/50' : 'border-[#27272a]'} rounded-xl p-4 shadow-sm ${dm.resolved ? 'opacity-50' : 'border-l-4 border-l-[var(--accent)]'}">
                    <div class="flex items-center gap-3 mb-3">
                        <div class="w-8 h-8 rounded-full ${avatarColor} flex items-center justify-center text-white font-bold text-xs shadow-inner">
                            ${sender.charAt(1) ? sender.charAt(1).toUpperCase() : sender.charAt(0).toUpperCase()}
                        </div>
                        <div class="flex flex-col">
                            <span class="font-bold text-sm text-gray-200">${sender}</span>
                            <span class="text-[9px] font-retro text-[var(--text-muted)] tracking-widest">Il y a ${Math.max(1, Math.floor((getTotalMins() - dm.timestamp)/60))} heures</span>
                        </div>
                    </div>
                    <p class="text-xs text-gray-300 leading-relaxed font-sans">${text}</p>
                    ${echoShieldBadge}
                    ${choicesHTML}
                </div>
            `;
        }).join('');
    }

    function answerDM(instanceId, choiceIdx) {
        const dm = state.dms.find(d => d.instanceId == instanceId);
        if (!dm || dm.resolved) return;
        const template = getTemplateById(dm.templateId);
        const moneyBefore = Number(state.money) || 0;
        const isScamDM = (DM_TEMPLATES.spam || []).some(t => t.id === dm.templateId);

        if (template && template.choices[choiceIdx]) {
            try { template.choices[choiceIdx].effect(); } catch(e) { console.error('DM effect error', e); }
        }

        // Bonus réel Agent Business Echo AI sur les DMs légitimes rémunérateurs
        const earned = (Number(state.money) || 0) - moneyBefore;
        const echoTier = typeof window.getEchoTier === 'function' ? window.getEchoTier() : 'free';
        if (!isScamDM && earned > 0 && echoTier !== 'free') {
            const pct = echoTier === 'neural' ? 0.30 : 0.15;
            const bonusCash = Math.max(40, Math.round(earned * pct));
            logMoney(bonusCash, `Echo Agent (+${Math.round(pct * 100)}% Négo DM)`);
            showToast(`✦ Echo Agent a renégocié ce DM : +$${bonusCash} bonus !`, 'success');
        }

        dm.resolved = true;
        dm.choiceIdx = choiceIdx;
        renderDMs();
        updateHUD();
        saveGame();

        // Purge automatique: retire le DM après 30s de résolution et rafraîchit l'affichage
        setTimeout(() => {
            const idx = (state.dms || []).findIndex(d => d.instanceId == instanceId);
            if (idx !== -1) {
                state.dms.splice(idx, 1);
                renderDMs();
                saveGame();
            }
        }, 30000);
    }

    function spawnRandomDM() {
        state.dms = state.dms || [];
        state.cooldowns = state.cooldowns || {};
        const DM_COOLDOWN_DAYS = 2; // enforce at least N in-game days between inbound DMs
        // Safety guards: respect inbox hard cap and global cooldown even if called elsewhere
        const unresolvedCount = (state.dms || []).filter(d => !d.resolved).length;
        const nextAllowed = parseInt(state.cooldowns.nextDMTick || 0, 10) || 0;
        const now = getTotalMins();
        if (unresolvedCount >= 3) return; // too many unresolved messages
        if (now < nextAllowed) return; // still in DM cooldown window
        // Choix de catégorie aléatoire (équilibré)
        const categories = Object.keys(DM_TEMPLATES);
        const category = categories[Math.floor(Math.random() * categories.length)];

        if (!DM_POOL[category] || DM_POOL[category].length === 0) refillDMPool(category);
        const tid = DM_POOL[category].shift();
        const template = getTemplateById(tid);
        if (!template) return;

        // Génère un nom d'expéditeur unique pour l'instance
        const runtimeSender = `@${generateSenderName(template.baseName || template.sender || template.id)}`;
        const runtimeAvatarColor = template.avatarColor || 'bg-gray-600';
        const runtimeText = template.text;

        state.dms.push({
            instanceId: Date.now() + Math.floor(Math.random()*1000),
            templateId: template.id,
            timestamp: getTotalMins(),
            resolved: false,
            choiceIdx: -1,
            runtimeSender,
            runtimeAvatarColor,
            runtimeText
        });

        // After receiving a DM, set a global cooldown preventing new DMs for DM_COOLDOWN_DAYS
        state.cooldowns.nextDMTick = getTotalMins() + (DM_COOLDOWN_DAYS * 1440);

        // Affiche la pastille rouge et active la vibration
        const notif = document.getElementById('dm-notif');
        if (notif) notif.classList.remove('hidden');

        const btnDMs = document.getElementById('tab-social-dms');
        if (btnDMs) btnDMs.classList.add('animate-dm-shake');

        // Notification 3D sur le Smartphone du bureau
        if (typeof window.triggerDeskPhoneNotif === 'function') window.triggerDeskPhoneNotif('dm');
        // Notification visuelle et sonore
        showToast(`💬 Nouveau message privé de ${state.dms[state.dms.length-1].runtimeSender || template.sender} !`, "info", () => {
            openApp('app-social');
            switchSocialTab('dms');
        });
        playTone(600, 'square', 0.05, 0.05); setTimeout(() => playTone(800, 'square', 0.1, 0.05), 100); 
        
        // On actualise si l'onglet est ouvert
        const contentDMs = document.getElementById('social-content-dms');
        if (contentDMs && !contentDMs.classList.contains('hidden')) {
            renderDMs();
        }
        saveGame();
    }


        // ==========================================
    // SYSTÈME DE LIVE CHAT (RÉACTIONS POST-EXPORT)
    // ==========================================
    globalThis.liveChatTimeout = null;

    function startLiveChat(track) {
        const chatSection = document.getElementById('live-chat-section');
        const chatBox = document.getElementById('live-chat-messages');
        const status = document.getElementById('live-chat-status');
        if (!chatSection || !chatBox) return;

        // Reset et affichage
        chatSection.classList.remove('hidden');
        chatBox.innerHTML = '';
        status.innerText = "● LIVE";
        status.className = "text-[9px] font-retro text-[var(--retro-red)] animate-pulse tracking-widest";
        clearTimeout(liveChatTimeout);

        const isBanger = track.score >= 7;
        const isMid = track.score >= 4 && track.score < 7;
        const isFlop = track.score < 4;
        
        const usedMessages = new Set();
        
        // Générateur de vocabulaire massivement enrichi
        const getMessage = () => {
            let pool = [];
            const rCancel = rappersCancel[Math.floor(Math.random() * rappersCancel.length)];
            const rConnu = rappersConnus[Math.floor(Math.random() * rappersConnus.length)];
            const lowerGenre = track.genre.toLowerCase();
            
            // 1. RÉACTIONS : BANGER (Score >= 7)
            if (isBanger) {
                pool.push(
                    "Masterclass, le son est lourd de fou 💿",
                    "Validé par la street, c'est la base",
                    "La prod elle tape trop fort, c'est quoi le sample ? 😮",
                    "C'est validé, direct en playlist",
                    "Le mix est d'une propreté... ingé son certifié",
                    "T'as la recette du banger, continue comme ça",
                    "La 808 elle fait trembler les murs, c'est criminel",
                    "Ça sent le disque de platine",
                    "Le sidechain est d'une violence chirurgicale 🔥",
                    "C'est quoi le VST ? Ce synthé est magique",
                    "Qui a laissé le bro cuisiner ?? 🧑‍🍳🔥",
                    `j'attends le remix avec ${rConnu}`,
                    "L'arrangement est parfait, 10/10.",
                    `Ce banger de ${lowerGenre} !`
                );
                if(track.voice === 'm' || track.voice === 'f') pool.push(`La voix colle trop bien à la prod`, `Le topline vocal est incroyable`);
                if(track.voice === 'instru') pool.push(`Donnez un micro à quelqu'un là-dessus !`, `Je kicke dessus demain sans faute.`);
            } 
            // 2. RÉACTIONS : MID (Score 4 à 6)
            else if (isMid) {
                pool.push(
                    "Ça passe crème en fond, mais manque un peu de sauce",
                    "C'est carré, mais un peu déjà entendu",
                    "Le mix est propre mais le topline est fade",
                    "Correct pour chill, mais ça manque de punch",
                    "Sympa, mais c'est pas le son de l'année",
                    "Un peu trop classique à mon goût",
                    "Le sidechain est mal géré sur le kick",
                    "La compresse est un peu forte non ?",
                    "Ça s'écoute, mais sans plus"
                );
            } 
            // 3. RÉACTIONS : FLOP (Score < 4)
            else { 
                pool.push(
                    "Le mix est éclaté au sol, faut retourner bosser",
                    "C'est quoi ce foutage de gueule ? 💀",
                    "Désolé, mais ça manque cruellement de vibe",
                    "Faut changer de DAW ou de carrière, là c'est gênant",
                    "C'est le son du mec qui a téléchargé des samples gratuits et qui se croit producteur",
                    "Supprime avant que ton label voie ça",
                    "Même le micro de mon téléphone sonne mieux",
                    "Le kick sature et c'est même pas du clipping créatif",
                    "La phase stéréo est complètement dans les choux 🤮",
                    "C'est quoi cette bouillie sonore ?",
                    "Pire son de 2026, félicitations.",
                    `Je l'ai aperçu avec ${rCancel} hier, ça m'étonne pas 💀`
                );
            }
            
            // 4. CONTEXTE CARRIÈRE (Followers)
            if (state.followers > 50000) {
                if (isBanger) pool.push("Il rate JAMAIS 👑", "Le patron a encore frappé", "En route pour le disque de platine");
                else if (isMid) pool.push("C'est propre, mais il nous a habitué à mieux.", "Un peu en pilotage automatique là.");
                else if (isFlop) pool.push("Il est fini le goat 😭", "Il a vendu son âme à l'industrie", "On regrette l'ancienne époque...");
            } else if (state.followers < 5000) {
                if (isBanger) pool.push("Algorithme SoundNet fais ton taff !!", "POV: t'es là avant le million");
                else if (isMid) pool.push("Y'a un truc, hâte de voir la suite.", "Le talent est là, ça va percer.");
                else if (isFlop) pool.push("C'est pour ça qu'il reste dans sa chambre", "Gardez-le underground.");
            }
 
            // 5. CONTEXTE RANG (Expertise)
            const playerRank = getCurrentRank();
            if (playerRank.id >= 4) {
                if (isBanger) pool.push(`${playerRank.name} certifié.`, "La street valide le patron.", "L'expertise parle d'elle même.");
                else if (isMid) pool.push("Efficacité redoutable.", "On sent l'expérience derrière le mix.");
                else if (isFlop) pool.push(`Un bide industriel...`, `Gros malaise pour un ${playerRank.name}.`, "C'est ça votre prod à 5000€ ? 💀");
            }
 
            // 6. CONTEXTE RÉPUTATION (Dramas, Scams, etc.)
            if (state.rep < 0) {
                if (isBanger) pool.push("C'est lourd mais le mec est un rat.", "Le talent est là, mais j'oublie pas le drama.");
                else if (isMid) pool.push("Musicalement ok, humainement zéro.", "Je stream en anonyme pour pas lui donner de force.");
                else pool.push("Cancel culture fais ton taff.", "Supprime ton compte bro.", "On n'oublie pas le drama frérot.");
            } else if (state.rep > 100) {
                if (isBanger) pool.push("L'ingé son le plus respecté de la plateforme.", "Zéro bad buzz, que du bon son.");
                else if (isMid) pool.push("Travail sérieux comme d'hab.", "Valeur sûre du game.");
                else if (isFlop) pool.push("Même les meilleurs peuvent avoir un coup de mou.", "D'habitude il est plus carré que ça.");
            }
 
            let msg = "";
            let attempts = 0;
            do {
                msg = pool[Math.floor(Math.random() * pool.length)];
                attempts++;
            } while (usedMessages.has(msg) && attempts < 15);
            
            usedMessages.add(msg);
            return msg;
        };

        const startTime = Date.now();
        const maxDuration = 20000; // 20 secondes de live

        const postMessage = () => {
            if (Date.now() - startTime > maxDuration) {
                status.innerText = "OFFLINE";
                status.className = "text-[9px] font-retro text-gray-500 tracking-widest";
                const endMsg = document.createElement('div');
                endMsg.className = "text-[9px] font-retro text-gray-500 italic mt-3 text-center border-t border-white/10 pt-2";
                endMsg.innerText = "Le chat s'est calmé...";
                chatBox.appendChild(endMsg);
                chatBox.scrollTop = chatBox.scrollHeight;
                return;
            }

            const msgDiv = document.createElement('div');
            
            const now = new Date();
            const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
            
            const isMagenta = Math.random() > 0.5;
            const pseudoColor = isMagenta ? 'text-[#C9427F]' : 'text-[#4DD8E8]';
            
            let bgClass = "bg-[#0A0A0D]";
            let borderClass = "border-white/5";
            let textColor = "text-gray-300";
            
            if (isBanger) {
                bgClass = "bg-[#4ADE80]/5";
                borderClass = "border-[#4ADE80]/50";
                textColor = "text-gray-200";
            } else if (isFlop) {
                bgClass = "bg-[#F5A623]/10";
                borderClass = "border-[#F5A623]/50";
                textColor = "text-[#F5A623]";
            }
            
            msgDiv.className = `flex flex-col p-2.5 rounded border-l-2 animate-chat-pop opacity-90 ${bgClass} ${borderClass}`;
            msgDiv.innerHTML = `
                <div class="flex items-center gap-2 mb-1">
                    <span class="font-retro text-[9px] text-gray-600">[${timeStr}]</span>
                    <span class="font-retro text-[10px] font-bold uppercase ${pseudoColor} tracking-widest">@${generateFanName()}</span>
                </div>
                <div class="font-sans text-[11px] ${textColor} ml-1">
                    ${getMessage()}
                </div>
            `;
            
            chatBox.appendChild(msgDiv);
            
            // Auto-clean pour ne pas faire lagger le DOM (Garde max 15 messages)
            if (chatBox.children.length > 15) chatBox.firstChild.remove();
            
                        // Scroll automatique vers le bas
            chatBox.scrollTop = chatBox.scrollHeight;

            // --- NOUVEAUX DÉLAIS (Plus lents et plus humains) ---
            // Banger: 1s à 2.5s | Flop: 1.5s à 3s | Mid: 2s à 4s
            const speedBase = isBanger ? 1000 : (isFlop ? 1500 : 2000);
            const variance = isBanger ? 1500 : (isFlop ? 1500 : 2000);
            
            liveChatTimeout = setTimeout(postMessage, speedBase + Math.random() * variance);
        };

        // Lancement du premier message (avec un délai initial pour faire monter la tension)
        liveChatTimeout = setTimeout(postMessage, 1000);
    }

        const TIERED_DEALS = [
            // TIER 1
            { id: 't1_enerji', name: "Enerji Drink", emoji: "⚡", tier: 1, reqFol: 0, reward: 500, repCost: 15, duration: 3 },
            { id: 't1_snack', name: "SnackByte", emoji: "🍫", tier: 1, reqFol: 0, reward: 300, repCost: 10, duration: 3 },
            { id: 't1_loop', name: "LoopCase", emoji: "📱", tier: 1, reqFol: 0, reward: 400, repCost: 8, duration: 3 },
            { id: 't1_boost', name: "BoostCola", emoji: "🥤", tier: 1, reqFol: 0, reward: 600, repCost: 18, duration: 3 },
            // TIER 2
            { id: 't2_revo', name: "Revopute", emoji: "💸", tier: 2, reqFol: 5000, reward: 2500, repCost: 20, duration: 5 },
            { id: 't2_street', name: "StreetDrip Co.", emoji: "🧢", tier: 2, reqFol: 5000, reward: 1800, repCost: 12, duration: 5 },
            { id: 't2_totol', name: "TotolEnergy", emoji: "⛽", tier: 2, reqFol: 5000, reward: 2000, repCost: 22, duration: 7 },
            { id: 't2_parions', name: "ParionsFort", emoji: "🎲", tier: 2, reqFol: 5000, reward: 2200, repCost: 25, duration: 7 },
            { id: 't2_camion', name: "VendezVotreCamion.fr", emoji: "🚛", tier: 2, reqFol: 5000, reward: 1500, repCost: 30, duration: 7 },
            // TIER 3 (Expires in 12h = 720 mins)
            { id: 't3_audio', name: "AudioGear Pro", emoji: "🎛️", tier: 3, reqFol: 15000, reward: 8000, repCost: 5, duration: 10, expiresIn: 720 },
            { id: 't3_nova', name: "NovaPhone", emoji: "📱", tier: 3, reqFol: 15000, reward: 12000, repCost: 30, duration: 10, expiresIn: 720 },
            { id: 't3_meta', name: "MetaChain NFT", emoji: "🐒", tier: 3, reqFol: 15000, reward: 15000, repCost: 50, duration: 14, expiresIn: 720 },
            { id: 't3_sound', name: "SoundWave Headsets", emoji: "🎧", tier: 3, reqFol: 15000, reward: 9000, repCost: 8, duration: 10, expiresIn: 720 },
            // TIER 4 (Expires in 24h = 1440 mins)
            { id: 't4_label', name: "Label majeur", emoji: "🏢", tier: 4, reqFol: 40000, reward: 50000, repCost: 40, duration: 30, expiresIn: 1440 },
            { id: 't4_aveed', name: "Aveed", emoji: "🌿", tier: 4, reqFol: 40000, reward: 20000, repCost: 30, duration: 20, expiresIn: 1440 },
            { id: 't4_lux', name: "LuxWatch", emoji: "⌚", tier: 4, reqFol: 40000, reward: 25000, repCost: 35, duration: 20, expiresIn: 1440 },
            { id: 't4_ghost', name: "GhostVPN", emoji: "👻", tier: 4, reqFol: 40000, reward: 18000, repCost: 15, duration: 15, expiresIn: 1440 },
            { id: 't4_echo', name: "EchoSound", emoji: "🔊", tier: 4, reqFol: 40000, reward: 5000, repCost: -50, duration: 7, expiresIn: 1440 }, // Note: -50 cost means +50 REP
        ];

        // ==========================================
        // GESTION DES EXPIRATIONS BRAND DEALS
        // ==========================================
        function updateBrandDealsAvailability() {
            if (!state || !state.dealPool) return;
            let needsSocialRefresh = false;
            
            const levelData = typeof calculateLevelData === 'function' ? calculateLevelData(true) : null;
            const currentRankId = levelData && levelData.currentRank ? levelData.currentRank.id : 0;
            
            TIERED_DEALS.forEach(deal => {
                // Le Tier 1 correspond au Rank 1 (Street Certified), Tier 2 au Rank 2, etc.
                if (currentRankId >= deal.tier) {
                    if (!state.dealPool[deal.id]) {
                        // Spawn new deal
                        state.dealPool[deal.id] = { status: 'available', spawnedAt: getTotalMins(), expiresAt: deal.expiresIn ? getTotalMins() + deal.expiresIn : null };
                        if (deal.expiresIn) {
                            showToast(`NOUVEAU CONTRAT : ${deal.name} (Expire vite !)`, 'info');
                        }
                        needsSocialRefresh = true;
                    }
                }
                // Check expiry
                if (state.dealPool[deal.id] && state.dealPool[deal.id].status === 'available' && state.dealPool[deal.id].expiresAt) {
                    if (getTotalMins() >= state.dealPool[deal.id].expiresAt) {
                        state.dealPool[deal.id].status = 'missed';
                        showToast(`Le contrat avec ${deal.name} a expiré !`, 'error');
                        needsSocialRefresh = true;
                    }
                }
            });
            
            if (needsSocialRefresh && typeof isAppOpen === 'function' && isAppOpen('app-social') && typeof refreshSocial === 'function') {
                refreshSocial();
            }
        }

        // LISTES DES RAPPEURS POUR ÉVÈNEMENTS ALÉATOIRES
        const rappersConnus = ["Yannvs", "Zandame", "Kali", "Disiznot", "Khabat & Jean-Jacque", "Lescram", "JeuneTortue", "Luthier", "Joule", "SCHash", "Adèle Tatillon", "Jolared44"];
        const rappersPasConnus = ["Fto", "Tom B", "Rosmii", "36Morphé", "44ASKIP", "9Rookie", "Nus", "GrandeSœur", "JaimeRose"];
        const voleursConnus = ["Mhoudi", "Niño", "Maïreau", "Bu$hit", "Letard"];
        const voleursPasConnus = ["909Dia", "Anybody", "Asinone", "m4n4phy", "36murpho", "sam01"];
        const rappersCancel = ["Kicayde", "Abdel32", "SummerZuko", "Femtogros", "Rouhni", "Nap", "Lomepoule", "Firenek", "Kenny East", "505Bill"];

        

        // ==========================================
        // 19. SOCIAL
        // ==========================================
        function refreshSocial() {
            const total      = getTotalMins();
            const storyReady = parseInt(state.cooldowns.storyTimeReady, 10) || 0;
            const btn    = document.getElementById('btn-story');
            const status = document.getElementById('story-status');
            if (total >= storyReady) {
                btn.disabled = false;
                status.innerText   = "STATUS: READY";
                status.className   = "text-xs text-[var(--retro-green)] mt-5 font-retro tracking-widest drop-shadow-[0_0_5px_var(--retro-green)]";
            } else {
                btn.disabled       = true;
                status.innerText   = "STATUS: COOLDOWN";
                status.className   = "text-xs text-[var(--retro-orange)] mt-5 font-retro tracking-widest";
            }

            const sList = document.getElementById('sponsor-list');
            const hList = document.getElementById('sponsor-history');
            if (typeof window.updateSocialEchoRadar === 'function') window.updateSocialEchoRadar();
            const echoDealTier = typeof window.getEchoTier === 'function' ? window.getEchoTier() : 'free';
            const echoDealMult = echoDealTier === 'neural' ? 1.30 : (echoDealTier === 'pro' ? 1.15 : 1.0);
            const echoDealPct = Math.round((echoDealMult - 1) * 100);
            
            // Render Available Deals
            let availHtml = '';
            let activeDealsCount = 0;
            
            TIERED_DEALS.forEach(deal => {
                const dealData = state.dealPool[deal.id];
                if (!dealData || dealData.status !== 'available') return;
                
                // Si on a déjà ce contrat d'actif, on ne l'affiche plus dans les dispos
                const isActive = state.activeContracts.find(c => c.id === deal.id);
                if (isActive) return;

                const effectiveReward = Math.round(deal.reward * echoDealMult);
                const echoDealBadge = echoDealPct > 0
                    ? `<span class="text-[8.5px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/15 border border-emerald-400/35 text-emerald-300">✦ ECHO +${echoDealPct}%</span>`
                    : '';
                
                let repColor = "text-yellow-400"; // Neutre
                if (deal.repCost > 20) repColor = "text-rose-500";
                else if (deal.repCost > 0) repColor = "text-orange-400";
                else if (deal.repCost < 0) repColor = "text-emerald-400"; // Gain de REP
                
                let expiryHtml = '';
                if (deal.expiresIn && dealData.expiresAt) {
                    const minsLeft = dealData.expiresAt - getTotalMins();
                    const hoursLeft = Math.floor(minsLeft / 60);
                    const remMins = minsLeft % 60;
                    expiryHtml = `<div class="text-[9px] text-rose-500 font-retro animate-pulse mt-1 tracking-widest border border-rose-500/30 bg-rose-500/10 px-1 py-0.5 w-fit rounded">⏳ Expire dans ${hoursLeft}h${remMins}</div>`;
                }
                
                // Visual Dilemma Gauge Calculation
                const baseMoney = deal.reward / (deal.duration || 1); // rough scaling
                const baseRep = deal.repCost > 0 ? deal.repCost * 50 : 0; // rough scaling to compare against money
                const totalBar = baseMoney + baseRep || 1;
                const pctMoney = (baseMoney / totalBar) * 100;
                const pctRep = (baseRep / totalBar) * 100;
                
                // Risk-based button
                let btnClass = "border-[#4DD8E8] text-[#4DD8E8] hover:bg-[#4DD8E8]/10";
                if (deal.repCost > 20) btnClass = "border-[#F5A623] text-[#F5A623] hover:bg-[#F5A623]/10";
                else if (deal.repCost > 0) btnClass = "border-white/20 text-white hover:border-white/50";
                
                availHtml += `
                <div class="flex flex-col justify-between bg-[#0A0A0D] p-4 border border-white/5 rounded-lg hover:border-white/20 transition-all gap-4">
                    <div class="flex items-start gap-3">
                        <div class="text-2xl mt-1">${deal.emoji}</div>
                        <div class="flex-1 w-full">
                            <div class="flex justify-between items-start w-full">
                                <p class="font-bold text-sm text-gray-200 tracking-wider">${deal.name}</p>
                                <span class="text-[8px] font-retro px-1.5 py-0.5 bg-white/5 border border-white/10 rounded text-gray-400">TIER ${deal.tier}</span>
                            </div>
                            <p class="text-[10px] text-gray-500 mt-0.5 font-sans">Durée d'engagement: <span class="text-gray-300 font-bold">${deal.duration} J</span></p>
                            
                            <!-- Visual Trade-off Dilemma Bar -->
                            <div class="mt-3 flex items-center justify-between text-[9px] font-retro tracking-widest mb-1">
                                <span class="text-[#4ADE80] flex items-center gap-1.5">+$${effectiveReward} ${echoDealBadge}</span>
                                <span class="${repColor}">${deal.repCost > 0 ? '-' : '+'}${Math.abs(deal.repCost)} REP</span>
                            </div>
                            <div class="w-full h-1.5 bg-black/50 rounded-full overflow-hidden flex">
                                <div class="bg-[#4ADE80]" style="width: ${deal.repCost < 0 ? 100 : pctMoney}%"></div>
                                ${deal.repCost > 0 ? `<div class="bg-[#F5A623] opacity-80" style="width: ${pctRep}%"></div>` : ''}
                            </div>
                            
                            ${expiryHtml}
                        </div>
                    </div>
                    <button class="btn-action w-full py-2.5 text-[10px] font-retro tracking-widest border-2 !bg-transparent rounded uppercase ${btnClass} transition-colors" onclick="acceptDeal('${deal.id}')">SIGNER</button>
                </div>`;
            });
            
            if (availHtml === '') {
                availHtml = `<div class="text-center p-6 bg-black/40 border border-white/5 rounded-lg text-gray-500 text-xs font-retro tracking-widest">AUCUNE OFFRE DISPONIBLE.<br><span class="text-[10px] text-gray-600 mt-2 block">(Atteignez le rang 'Street Certified' pour débloquer les premiers sponsors !)</span></div>`;
            }
            sList.innerHTML = availHtml;

            // Render History & Active Deals
            let histHtml = '';
            let totalPay = 0;
            let totalRep = 0;
            
            // Actifs
            if (state.activeContracts.length > 0) {
                histHtml += `<div class="text-[9px] text-[var(--accent)] uppercase font-retro tracking-widest mb-2 border-b border-[var(--accent)]/30 pb-1">CONTRATS EN COURS</div>`;
                state.activeContracts.forEach(c => {
                    histHtml += `
                    <div class="bg-[var(--accent)]/5 border border-[var(--accent)]/30 p-3 rounded-lg mb-3">
                        <div class="flex justify-between items-center mb-2">
                            <span class="text-xs font-bold text-gray-200">${c.emoji} ${c.name}</span>
                            <span class="text-[9px] text-[var(--accent)] font-retro">${c.daysLeft} JOURS RESTANTS</span>
                        </div>
                        <div class="w-full bg-black/50 h-1.5 rounded-full overflow-hidden">
                            <div class="bg-[var(--accent)] h-full" style="width: ${((c.duration - c.daysLeft) / c.duration) * 100}%"></div>
                        </div>
                        <p class="text-[9px] text-gray-400 mt-2">Revenu journalier : <span class="text-emerald-400">+$${Math.floor(c.reward / c.duration)}/j</span> | Rep : <span class="text-rose-400">-${(c.repCost / c.duration).toFixed(1)}/j</span></p>
                    </div>`;
                    totalPay += Math.floor(c.reward / c.duration) * (c.duration - c.daysLeft); // Ce qui a déjà été payé
                    totalRep -= (c.repCost / c.duration) * (c.duration - c.daysLeft);
                });
            }
            
            // Terminés
            if (state.completedDeals.length > 0) {
                histHtml += `<div class="text-[9px] text-gray-500 uppercase font-retro tracking-widest mb-2 mt-4 border-b border-white/10 pb-1">CONTRATS TERMINÉS</div>`;
                state.completedDeals.forEach(c => {
                    histHtml += `
                    <div class="flex justify-between items-center bg-black/30 p-2 border border-white/5 rounded mb-2">
                        <span class="text-[10px] text-gray-400">${c.emoji} ${c.name}</span>
                        <div class="text-[9px] font-retro tracking-widest"><span class="text-emerald-400/50">+$${c.totalPay}</span> <span class="text-gray-600">|</span> <span class="text-rose-400/50">-${c.totalRep} REP</span></div>
                    </div>`;
                    totalPay += c.totalPay;
                    totalRep -= c.totalRep;
                });
            }
            
            // Bilan global
            histHtml += `
            <div class="mt-5 p-3 border-t border-white/20 flex justify-between items-center bg-[#111]">
                <span class="text-[10px] font-bold text-gray-300">BILAN GLOBAL SELLOUT</span>
                <div class="text-xs font-retro tracking-widest"><span class="text-emerald-400">+$${totalPay}</span> <span class="text-gray-500 mx-2">|</span> <span class="${totalRep < 0 ? 'text-rose-500' : 'text-emerald-400'}">${Math.floor(totalRep)} REP</span></div>
            </div>`;
            
            if (state.activeContracts.length === 0 && state.completedDeals.length === 0) {
                histHtml = `<div class="text-center p-6 bg-black/40 border border-white/5 rounded-lg text-gray-500 text-xs font-retro tracking-widest">AUCUN HISTORIQUE.</div>`;
            }
            hList.innerHTML = histHtml;


            // État persistant des DMs (Vibration si non lus)
            const hasUnread = (state.dms || []).some(dm => !dm.resolved);
            const btnDMs = document.getElementById('tab-social-dms');
            const isDmTabActive = btnDMs && btnDMs.classList.contains('bg-[#27272a]');

            if (hasUnread && !isDmTabActive) {
                if (btnDMs) btnDMs.classList.add('animate-dm-shake');
                document.getElementById('dm-notif')?.classList.remove('hidden');
            }
        }

        function postStory() {
            const total      = getTotalMins();
            const storyReady = parseInt(state.cooldowns.storyTimeReady, 10) || 0;
            if (total < storyReady) return;
            
            state.cooldowns.storyTimeReady = total + 120;
            
            // Calcul des gains (Version Grind + Bonus Echo AI / Alignement Algorithme)
            const echoStoryTier = typeof window.getEchoTier === 'function' ? window.getEchoTier() : 'free';
            let storyMult = 1.0;
            if (echoStoryTier !== 'free') storyMult += 0.15;
            if ((Number(state.echoAlignment) || 0) <= -30) storyMult += 0.20;
            const followerGain = Math.floor(((state.rep * 1.5) + 15 + (state.followers * 0.001)) * storyMult);
            
            // Le grind de la réputation doit être lent mais constant (1 à 2 points max par story)
            let repGain = Math.floor(Math.random() * 2) + 1; 
            if (activePerks && activePerks.storyBonus) {
                repGain += activePerks.storyBonus;
            }
            
            // Application
            logFollower(followerGain);
            state.rep = Math.max(0, state.rep + repGain);
            
            // Feedback visuel
            showToast(`Story publiée ! +${followerGain} Fans | +${repGain} REP`, "info");
            
            // Poster draine l'inspiration
            state.inspi = Math.max(0, state.inspi - 10);
            

            playSuccess(); 
            saveGame(); 
            updateHUD(); 
            refreshSocial();
            try { checkChallengeProgress('story', {}); } catch(e) {}
        }

        function acceptDeal(id) {
            const deal = TIERED_DEALS.find(x => x.id === id);
            if (!deal) return;

            const echoTier = typeof window.getEchoTier === 'function' ? window.getEchoTier() : 'free';
            const echoDealMult = echoTier === 'neural' ? 1.30 : (echoTier === 'pro' ? 1.15 : 1.0);
            const finalReward = Math.round(deal.reward * echoDealMult);
            const echoBonusNote = echoDealMult > 1.0 ? ` (✦ Echo Agent +${Math.round((echoDealMult - 1) * 100)}%)` : '';
            
            // Marquer comme accepté dans le pool
            if (state.dealPool[deal.id]) {
                state.dealPool[deal.id].status = 'active';
            }
            
            if (!deal.duration || deal.duration <= 0) {
                // Paiement instantané
                logMoney(finalReward, 'Sponsor: ' + deal.name + echoBonusNote);
                state.rep = Math.max(0, (parseInt(state.rep, 10) || 0) - deal.repCost);
                if (typeof spawnFloatingText === 'function') spawnFloatingText('hud-rep-num', (deal.repCost > 0 ? '-' : '+') + Math.abs(deal.repCost) + ' REP', deal.repCost > 0 ? 'text-rose-500' : 'text-emerald-400');
                showToast(`Contrat signé avec ${deal.name} : +$${finalReward}${echoBonusNote}`, 'success');
                if (!state.completedDeals) state.completedDeals = [];
                state.completedDeals.push({ id: deal.id, name: deal.name, emoji: deal.emoji, totalPay: finalReward, totalRep: deal.repCost });
            } else {
                // Ajouter aux contrats actifs
                state.activeContracts.push({
                    id: deal.id,
                    name: deal.name,
                    emoji: deal.emoji,
                    duration: deal.duration,
                    daysLeft: deal.duration,
                    reward: finalReward,
                    repCost: deal.repCost
                });
                showToast(`Contrat signé avec ${deal.name} (${deal.duration}j · $${finalReward})${echoBonusNote}`, 'success');
            }
            
            if (typeof updateHUD === 'function') updateHUD();
            
            // Le sellout draine modérément l'inspiration instantanément
            state.inspi = Math.max(0, (Number(state.inspi) || 0) - 15);
            
            if (typeof checkAchievement === 'function') checkAchievement('sellout', () => true);
            if (typeof refreshSocial === 'function') refreshSocial();
            if (typeof updateHUD === 'function') updateHUD();
            if (typeof saveGame === 'function') saveGame();
        }


        function closeReview() {
            const overlay = document.getElementById('review-overlay');
            
            try {
                if (window.dissTrackTimer) {
                    clearTimeout(window.dissTrackTimer);
                    window.dissTrackTimer = null;
                }
                
                if (typeof stopQTEGenrePreview === 'function') {
                    stopQTEGenrePreview();
                }

                const isAfterDissTrack = !!window.isAfterDissTrack;
                const isVictory = !!window.dissTrackVictory;

                if (isAfterDissTrack) {
                    if (overlay) {
                        overlay.classList.remove('qte-outro-win', 'qte-outro-fail');
                        overlay.classList.add(isVictory ? 'qte-outro-win' : 'qte-outro-fail');
                        overlay.style.pointerEvents = 'none';
                    }
                } else {
                    if (overlay) {
                        overlay.classList.remove('pointer-events-auto', 'opacity-100');
                        overlay.classList.add('pointer-events-none', 'opacity-0');
                        overlay.style.opacity = '0';
                        overlay.style.pointerEvents = 'none';
                    }
                }

                state.isReviewActive = false; 
                state.isExporting = false;

                // Application des récompenses différées
                if (window.pendingReviewData) {
                    const d = window.pendingReviewData;
                    try {
                        logMoney(d.money, 'Track Royalties');
                        state.rep = Math.max(0, state.rep + d.rep);
                        logFollower(d.fans);
                        checkAchievement('dans_la_sauce', () => state.followers >= 100000);
                        checkAchievement('first_blood', () => state.stats.tracks >= 1);
                        checkAchievement('productivite_toxique', () => state.stats.consecutiveFlops >= 5);
                        if (d.avgReviewScore) {
                            checkAchievement('certifie_classique', () => d.avgReviewScore === "10.0");
                        }
                        if (d.money > 0) playCashSound();
                        showToast(d.toast.msg, d.toast.type);
                        
                        if (d.extraToasts && d.extraToasts.length > 0) {
                            d.extraToasts.forEach((t, idx) => {
                                setTimeout(() => {
                                    showToast(t.msg, t.type, t.onClick, t.priority);
                                }, 800 * (idx + 1));
                            });
                        }
                    } catch(errReward) {
                        console.error("Error applying rewards in closeReview:", errReward);
                    }
                    
                    try {
                        updateHUD();
                        saveGame();
                    } catch(errSave) {
                        console.error("Error updating HUD/Save in closeReview:", errSave);
                    }

                    // --- DÉCLENCHEMENT DU LIVE CHAT SYNCHRONISÉ ---
                    try {
                        if (d.track) {
                            openApp('app-social');
                            switchSocialTab('feed');
                            setTimeout(() => {
                                startLiveChat(d.track);
                                const chatSection = document.getElementById('live-chat-section');
                                if (chatSection) chatSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            }, 400);
                        }
                    } catch(errChat) {
                        console.error("Error starting chat in closeReview:", errChat);
                    }
                    
                    try {
                        if (state.stats.tracks > 5 && Math.random() < 0.30) {
                            setTimeout(() => {
                                triggerMonoMixMiniGame();
                            }, 2000);
                        }
                    } catch(errMini) {
                        console.error("Error triggering mini-game in closeReview:", errMini);
                    }
                    window.pendingReviewData = null;
                }

                const delay = isAfterDissTrack ? 800 : 500;
                setTimeout(() => {
                    try {
                        if (overlay) {
                            overlay.classList.add('hidden');
                            overlay.style.display = 'none';
                            overlay.classList.remove('qte-outro-win', 'qte-outro-fail');
                            overlay.style.pointerEvents = 'auto'; // Réinitialise les pointer-events
                        }
                        window.isAfterDissTrack = false;
                        window.dissTrackVictory = false;
                    } catch(errHide) {
                        console.error("Error hiding overlay inside timeout:", errHide);
                        if (overlay) {
                            overlay.style.display = 'none';
                            overlay.style.pointerEvents = 'auto';
                        }
                    }
                }, delay);

            } catch(e) {
                console.error("Erreur générale fermeture QTE:", e);
                if (overlay) {
                    overlay.style.display = 'none';
                    overlay.classList.add('hidden');
                    overlay.classList.remove('qte-outro-win', 'qte-outro-fail');
                    overlay.style.pointerEvents = 'auto';
                }
                state.isReviewActive = false;
                state.isExporting = false;
                window.isAfterDissTrack = false;
                window.dissTrackVictory = false;
            }
        }









        // ==========================================
        // SYSTÈME D'ÉVÈNEMENTS ALÉATOIRES (DA CINÉMA / GTA 6 — DOSSIER INDUSTRIE)
        // ==========================================
        function _shuffleEventPool(source, avoidFirst) {
            const arr = [...source];
            for (let i = arr.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [arr[i], arr[j]] = [arr[j], arr[i]];
            }
            if (avoidFirst && arr.length > 1 && arr[0] === avoidFirst) {
                const swapIdx = 1 + Math.floor(Math.random() * (arr.length - 1));
                [arr[0], arr[swapIdx]] = [arr[swapIdx], arr[0]];
            }
            return arr;
        }

        const _eventPools = {
            rappersConnus:    { pool: _shuffleEventPool(rappersConnus),    last: null },
            rappersPasConnus: { pool: _shuffleEventPool(rappersPasConnus), last: null },
            voleursConnus:    { pool: _shuffleEventPool(voleursConnus),    last: null },
            voleursPasConnus: { pool: _shuffleEventPool(voleursPasConnus), last: null },
            rappersCancel:    { pool: _shuffleEventPool(rappersCancel),    last: null }
        };

        function _drawFromEventPool(key, source) {
            const entry = _eventPools[key];
            if (!entry.pool || entry.pool.length === 0) {
                entry.pool = _shuffleEventPool(source, entry.last);
            }
            const picked = entry.pool.shift();
            entry.last = picked;
            return picked;
        }

        function _getArtistInitials(name) {
            if (!name) return '??';
            const clean = String(name).replace(/[^A-Za-zÀ-ÿ0-9\s]/g, ' ').trim();
            const parts = clean.split(/\s+/).filter(Boolean);
            if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
            return clean.slice(0, 2).toUpperCase() || '??';
        }

        function _renderEventArtistCard({ name, badgeText, badgeStyle, subtext, isStar }) {
            const initials = _getArtistInitials(name);
            const starGlow = isStar
                ? 'border-amber-400/45 bg-gradient-to-r from-amber-500/[0.12] via-amber-500/[0.04] to-transparent shadow-[0_0_24px_rgba(245,158,11,0.12)]'
                : '';
            const avatarStar = isStar
                ? 'style="background: radial-gradient(circle at 30% 25%, rgba(245, 158, 11, 0.42), rgba(15, 12, 8, 0.96)); border-color: rgba(245, 158, 11, 0.72); color: #fef3c7;"'
                : '';
            return `
                <div class="gta-evt-artist-card ${starGlow}">
                    <div class="gta-evt-avatar" ${avatarStar}>${initials}</div>
                    <div class="min-w-0 flex-1">
                        <div class="flex flex-wrap items-center gap-2">
                            <span class="text-base sm:text-lg font-extrabold text-white tracking-wide truncate">${name}</span>
                            <span class="gta-evt-badge shrink-0" style="${badgeStyle}">${badgeText}</span>
                        </div>
                        <div class="text-[11px] font-mono text-zinc-400 mt-0.5 leading-snug">${subtext}</div>
                    </div>
                </div>
            `;
        }

        function _buildGtaChoiceCard({ title, badge, badgeStyle, rightMain, rightSub, probPct, probLabel, probColor, choiceRgb, onClick }) {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'gta-evt-choice flex flex-col gap-2';
            btn.style.setProperty('--choice-rgb', choiceRgb);
            btn.innerHTML = `
                <div class="flex items-start justify-between gap-3 w-full">
                    <div class="min-w-0">
                        <div class="flex flex-wrap items-center gap-2">
                            <span class="text-sm font-extrabold tracking-[0.06em] uppercase text-white">${title}</span>
                            <span class="gta-evt-badge" style="${badgeStyle}">${badge}</span>
                        </div>
                    </div>
                    <div class="text-right shrink-0">
                        <div class="text-sm font-mono font-extrabold tracking-tight" style="color:${probColor};">${rightMain}</div>
                        ${rightSub ? `<div class="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">${rightSub}</div>` : ''}
                    </div>
                </div>
                <div class="flex items-center gap-2.5 w-full">
                    <div class="gta-evt-prob-track flex-1">
                        <div class="gta-evt-prob-fill" style="width:${probPct}%; background:${probColor}; box-shadow: 0 0 8px ${probColor}66;"></div>
                    </div>
                    <span class="text-[10px] font-mono uppercase tracking-[0.14em] text-zinc-400 shrink-0 tabular-nums">${probLabel}</span>
                </div>
            `;
            btn.onclick = onClick;
            return btn;
        }

        function triggerRandomEvent(forcedType, forcedRapperName = null) {
            state.isEventActive = true;
            if (typeof window.enforceFpsModalPriority === 'function') window.enforceFpsModalPriority();
            const overlay = document.getElementById('event-overlay');
            const eyebrow = document.getElementById('event-eyebrow');
            const metaTag = document.getElementById('event-meta-tag');
            const subtitle = document.getElementById('event-subtitle');
            const title = document.getElementById('event-title');
            const artistSlot = document.getElementById('event-artist-slot');
            const desc = document.getElementById('event-desc');
            const choicesDiv = document.getElementById('event-choices');

            overlay.classList.remove('hidden');
            overlay.style.display = 'flex';
            overlay.style.opacity = '0';
            overlay.style.pointerEvents = 'none';

            setTimeout(() => {
                overlay.style.opacity = '1';
                overlay.style.pointerEvents = 'all';
            }, 50);

            playTone(500, 'square', 0.2, 0.1);
            choicesDiv.innerHTML = '';
            if (metaTag) metaTag.textContent = `JOUR ${state.day || 1} · LIVE`;

            const rand = Math.random();
            const eventType = forcedType || (rand < 0.45 ? 'collab' : rand < 0.80 ? 'vol' : 'badbuzz');

            if (eventType === 'collab' || eventType === 'collab_known') {
                const isKnown = (eventType === 'collab_known') ? true : (forcedRapperName ? rappersConnus.includes(forcedRapperName) : (Math.random() < 0.2));
                const rapper = forcedRapperName || pickRapper(isKnown);
                const starMult = isKnown ? 1.8 : 1.0;
                const repReward = isKnown ? 15 : 10;
                const effectiveMult = (state.multiplier || 1.0) * starMult;
                const affScore = (typeof window.getRapperAffinity === 'function') ? window.getRapperAffinity(rapper) : 0;
                const affMeta = (typeof window.getRapperAffinityMeta === 'function') ? window.getRapperAffinityMeta(affScore) : { label: 'CONTACT', acceptBonus: 0 };
                const p1 = Math.min(95, 80 + (affMeta.acceptBonus || 0));
                const p2 = Math.min(90, 50 + (affMeta.acceptBonus || 0));
                const p3 = Math.min(75, 20 + (affMeta.acceptBonus || 0));

                overlay.style.setProperty('--evt-rgb', isKnown ? '245, 158, 11' : '16, 185, 129');
                if (eyebrow) eyebrow.textContent = isKnown ? 'DOSSIER INDUSTRIE · VIP' : 'DOSSIER INDUSTRIE · PROD';
                if (subtitle) {
                    subtitle.textContent = isKnown ? 'A&R VIP DISPATCH · BONUS ×1.8' : 'SOUNDNET DIRECT · NÉGOCIATION';
                    subtitle.className = `text-[10px] font-mono uppercase tracking-[0.26em] ${isKnown ? 'text-amber-400' : 'text-emerald-400'}`;
                }
                title.textContent = 'COLLABORATION';
                title.className = 'text-2xl sm:text-3xl font-extrabold tracking-[0.14em] uppercase text-white leading-tight mt-0.5';

                if (artistSlot) {
                    artistSlot.classList.remove('hidden');
                    const affText = affScore > 0
                        ? ` · Affinité ${affScore}/100 (${affMeta.label}${affMeta.acceptBonus ? ` +${affMeta.acceptBonus}%` : ''})`
                        : '';
                    artistSlot.innerHTML = _renderEventArtistCard({
                        name: rapper,
                        isStar: isKnown,
                        badgeText: isKnown ? '★ TÊTE D\'AFFICHE' : 'ARTISTE INDÉ',
                        badgeStyle: isKnown
                            ? 'background:rgba(245,158,11,0.18); border-color:rgba(245,158,11,0.55); color:#fde68a;'
                            : 'background:rgba(16,185,129,0.16); border-color:rgba(16,185,129,0.45); color:#6ee7b7;',
                        subtext: (isKnown
                            ? `Cachet ×1.8 · +${repReward} REP`
                            : `Circuit indé · +${repReward} REP`) + affText
                    });
                }

                const textesCollab = [
                    `<span class="text-white font-semibold">${rapper}</span> te contacte pour poser sur un de tes beats, mais il tente de négocier à la baisse. Fixe ton tarif et le format livré.`,
                    `<span class="text-white font-semibold">${rapper}</span> a validé ta dernière boucle et veut l'acheter pour son prochain projet. Quelle licence lui proposes-tu ?`
                ];
                desc.innerHTML = textesCollab[Math.floor(Math.random() * textesCollab.length)];

                const mp3Min = Math.floor(150 * effectiveMult), mp3Max = Math.floor(300 * effectiveMult);
                const wavMin = Math.floor(400 * effectiveMult), wavMax = Math.floor(800 * effectiveMult);
                const stmMin = Math.floor(1000 * effectiveMult), stmMax = Math.floor(2500 * effectiveMult);

                const btn1 = _buildGtaChoiceCard({
                    title: 'MP3 · Lease Standard',
                    badge: 'SÛR',
                    badgeStyle: 'background:rgba(16,185,129,0.16); border-color:rgba(16,185,129,0.45); color:#6ee7b7;',
                    rightMain: `$${mp3Min.toLocaleString('fr-FR')} – $${mp3Max.toLocaleString('fr-FR')}`,
                    rightSub: `+${repReward} REP`,
                    probPct: p1,
                    probLabel: `${p1}% ACCEPTATION`,
                    probColor: '#34d399',
                    choiceRgb: '16, 185, 129',
                    onClick: () => resolveCollabEvent(rapper, p1, 150 + Math.random() * 150, isKnown)
                });

                const btn2 = _buildGtaChoiceCard({
                    title: 'WAV · Licence Exclusive',
                    badge: 'ÉQUILIBRÉ',
                    badgeStyle: 'background:rgba(245,158,11,0.16); border-color:rgba(245,158,11,0.45); color:#fcd34d;',
                    rightMain: `$${wavMin.toLocaleString('fr-FR')} – $${wavMax.toLocaleString('fr-FR')}`,
                    rightSub: `+${repReward} REP`,
                    probPct: p2,
                    probLabel: `${p2}% ACCEPTATION`,
                    probColor: '#fbbf24',
                    choiceRgb: '245, 158, 11',
                    onClick: () => resolveCollabEvent(rapper, p2, 400 + Math.random() * 400, isKnown)
                });

                const btn3 = _buildGtaChoiceCard({
                    title: 'Stems · Cession Master',
                    badge: 'RISQUÉ · JACKPOT',
                    badgeStyle: 'background:rgba(244,63,94,0.16); border-color:rgba(244,63,94,0.45); color:#fda4af;',
                    rightMain: `$${stmMin.toLocaleString('fr-FR')} – $${stmMax.toLocaleString('fr-FR')}`,
                    rightSub: `+${repReward} REP`,
                    probPct: p3,
                    probLabel: `${p3}% ACCEPTATION`,
                    probColor: '#fb7185',
                    choiceRgb: '244, 63, 94',
                    onClick: () => resolveCollabEvent(rapper, p3, 1000 + Math.random() * 1500, isKnown)
                });

                choicesDiv.append(btn1, btn2, btn3);

            } else if (eventType === 'vol') {
                const isKnown = Math.random() < 0.2;
                const voleur = pickVoleur(isKnown);

                overlay.style.setProperty('--evt-rgb', '245, 158, 11');
                if (eyebrow) eyebrow.textContent = 'DOSSIER JURIDIQUE · DROITS';
                if (subtitle) {
                    subtitle.textContent = 'COPYRIGHT ALERT · LITIGE PROD';
                    subtitle.className = 'text-[10px] font-mono uppercase tracking-[0.26em] text-amber-400';
                }
                title.textContent = 'VOL DE PROD';
                title.className = 'text-2xl sm:text-3xl font-extrabold tracking-[0.14em] uppercase text-white leading-tight mt-0.5';

                if (artistSlot) {
                    artistSlot.classList.remove('hidden');
                    artistSlot.innerHTML = _renderEventArtistCard({
                        name: voleur,
                        isStar: isKnown,
                        badgeText: isKnown ? '★ ARTISTE MAJEUR' : 'CONFLIT DROITS',
                        badgeStyle: isKnown
                            ? 'background:rgba(245,158,11,0.18); border-color:rgba(245,158,11,0.55); color:#fde68a;'
                            : 'background:rgba(251,146,60,0.16); border-color:rgba(251,146,60,0.45); color:#fdba74;',
                        subtext: 'Utilisation non créditée détectée sur SoundNet'
                    });
                }

                const textesVol = [
                    `Belek à toi, <span class="text-white font-semibold">${voleur}</span> t'a volé une prod pour son nouvel album sans aucun accord. Comment réagis-tu ?`,
                    `Coup dur ! <span class="text-white font-semibold">${voleur}</span> a péta ton dernier beat sur SoundNet sans te créditer. On gère ça comment ?`,
                    `Une de tes vieilles loops s'est retrouvée sur le projet de <span class="text-white font-semibold">${voleur}</span>. Ça sent la douille...`
                ];
                desc.innerHTML = textesVol[Math.floor(Math.random() * textesVol.length)];

                const btn1 = _buildGtaChoiceCard({
                    title: 'Porter Plainte',
                    badge: '50/50 · PROCÈS',
                    badgeStyle: 'background:rgba(239,68,68,0.16); border-color:rgba(239,68,68,0.45); color:#fca5a5;',
                    rightMain: '+$1k–$2k / -$300–$600',
                    rightSub: 'Lourde perte REP',
                    probPct: 50,
                    probLabel: '50% GAIN PROCÈS',
                    probColor: '#f87171',
                    choiceRgb: '239, 68, 68',
                    onClick: () => resolveTheftEvent('plainte', voleur)
                });

                const btn2 = _buildGtaChoiceCard({
                    title: 'Arrangement à l\'Amiable',
                    badge: 'RÉGLO',
                    badgeStyle: 'background:rgba(16,185,129,0.16); border-color:rgba(16,185,129,0.45); color:#6ee7b7;',
                    rightMain: '-$50 – -$200',
                    rightSub: '+10 REP GARANTI',
                    probPct: 100,
                    probLabel: '100% RÉSOLU',
                    probColor: '#34d399',
                    choiceRgb: '16, 185, 129',
                    onClick: () => resolveTheftEvent('amiable', voleur)
                });

                const btn3 = _buildGtaChoiceCard({
                    title: 'Ne Rien Faire',
                    badge: 'PASSIF',
                    badgeStyle: 'background:rgba(148,163,184,0.16); border-color:rgba(148,163,184,0.38); color:#cbd5e1;',
                    rightMain: '-$100 – -$500',
                    rightSub: '-50 à -200 FANS',
                    probPct: 25,
                    probLabel: 'MANQUE À GAGNER',
                    probColor: '#94a3b8',
                    choiceRgb: '148, 163, 184',
                    onClick: () => resolveTheftEvent('rien', voleur)
                });

                choicesDiv.append(btn1, btn2, btn3);

            } else if (eventType === 'badbuzz') {
                const cancelled = pickCancelRapper();
                const repLost = Math.max(2, Math.floor(state.rep * 0.15));
                const follLost = Math.floor(state.followers * 0.05);

                overlay.style.setProperty('--evt-rgb', '244, 63, 94');
                if (eyebrow) eyebrow.textContent = 'DOSSIER CRISE · RÉSEAUX';
                if (subtitle) {
                    subtitle.textContent = 'PR CRISIS · DOMMAGES RÉPUTATION';
                    subtitle.className = 'text-[10px] font-mono uppercase tracking-[0.26em] text-rose-400';
                }
                title.textContent = 'BAD BUZZ';
                title.className = 'text-2xl sm:text-3xl font-extrabold tracking-[0.14em] uppercase text-white leading-tight mt-0.5';

                if (artistSlot) {
                    artistSlot.classList.remove('hidden');
                    artistSlot.innerHTML = _renderEventArtistCard({
                        name: cancelled,
                        isStar: false,
                        badgeText: 'SCANDALE VIRAL',
                        badgeStyle: 'background:rgba(244,63,94,0.18); border-color:rgba(244,63,94,0.55); color:#fda4af;',
                        subtext: `Impact estimé : -${repLost} REP · -${follLost.toLocaleString('fr-FR')} Followers`
                    });
                }

                const textesBuzz = [
                    `Le bourbier... Tu as failli collaborer avec <span class="text-white font-semibold">${cancelled}</span>. La rumeur a fuité sur SoundNet. Vous perdez en crédibilité.`,
                    `Aïe... Une vieille photo de toi en studio avec <span class="text-white font-semibold">${cancelled}</span> vient de refaire surface. La commu ne pardonne pas.`,
                    `Un thread vient d'exposed <span class="text-white font-semibold">${cancelled}</span>. Ton nom est cité en tant que co-prod sur un de ses sons maudits. La sauce est totale.`,
                    `Pendant un live douteux, <span class="text-white font-semibold">${cancelled}</span> a lâché une dinguerie sur ta prod. L'extrait tourne en boucle, ton image en prend un coup.`,
                    `Une vidéo leakée montre <span class="text-white font-semibold">${cancelled}</span> dans un sale état avec ton instru en fond sonore. Internet fait le raccourci.`,
                    `Tu te fais taguer dans un drama monumental impliquant <span class="text-white font-semibold">${cancelled}</span>. T'as rien demandé, mais le tribunal de X a déjà tranché.`,
                    `Le label de <span class="text-white font-semibold">${cancelled}</span> vient de sombrer suite à un scandale de Gambling. Ton nom apparaît dans leurs factures récentes...`
                ];
                desc.innerHTML = textesBuzz[Math.floor(Math.random() * textesBuzz.length)];

                const btn1 = _buildGtaChoiceCard({
                    title: 'Encaisser le Coup',
                    badge: 'CRISE INÉVITABLE',
                    badgeStyle: 'background:rgba(244,63,94,0.22); border-color:rgba(244,63,94,0.55); color:#fecdd3;',
                    rightMain: `-${repLost} REP`,
                    rightSub: `-${follLost.toLocaleString('fr-FR')} FANS`,
                    probPct: 100,
                    probLabel: 'FERMER LE DOSSIER',
                    probColor: '#fb7185',
                    choiceRgb: '244, 63, 94',
                    onClick: () => {
                        state.rep = Math.max(0, state.rep - repLost);
                        state.followers = Math.max(0, state.followers - follLost);
                        showToast(`Bad Buzz avec ${cancelled} : -${repLost} REP | -${follLost} Followers`, "error");
                        checkAchievement('cancel_culture', () => true);
                        playError();
                        closeRandomEvent();
                    }
                });

                choicesDiv.appendChild(btn1);
            }
        }

        function resolveCollabEvent(rapper, chance, rawPrice, isKnown = false) {
            if (Math.random() * 100 <= chance) {
                const starMult = isKnown ? 1.8 : 1.0;
                const repGain = isKnown ? 15 : 10;
                const affGain = isKnown ? 35 : 25;
                const finalPrice = Math.floor(rawPrice * (state.multiplier || 1.0) * starMult);
                logMoney(finalPrice, `Collab${isKnown ? ' ★' : ''}: ${rapper}`);
                state.rep += repGain;
                const newAff = (typeof window.addRapperAffinity === 'function') ? window.addRapperAffinity(rapper, affGain) : 0;
                const starTag = isKnown ? ' ★' : '';
                const succesCollab = [
                    `${rapper}${starTag} a validé direct ! +$${finalPrice} | +${repGain} REP | Affinité ${newAff}/100`,
                    `Virement reçu de ${rapper}${starTag}. Le mix part ce soir ! +$${finalPrice} | +${repGain} REP | Affinité ${newAff}/100`
                ];
                showToast(succesCollab[Math.floor(Math.random() * succesCollab.length)], "success");
                playSuccess();
            } else {
                if (typeof window.addRapperAffinity === 'function') window.addRapperAffinity(rapper, 5);
                showToast(`${rapper} t'a lu et t'a ghosté. C'était trop cher pour lui (+5 Affinité contact).`, "info");
                playError();
            }
            if (typeof window.renderEmpireApp === 'function') window.renderEmpireApp();
            closeRandomEvent();
        }

        function resolveTheftEvent(action, voleur) {
            if (action === 'plainte') {
                // Pénalité équilibrée (-20 REP fixe au lieu de -90% de toute la carrière!)
                state.rep = Math.max(0, (Number(state.rep) || 0) - 20);
                if (Math.random() > 0.5) {
                    const winAmt = Math.floor(1000 + Math.random() * 1000);
                    logMoney(winAmt, `Procès gagné contre ${voleur}`);
                    checkAchievement('avocat_du_diable', () => true);
                    showToast(`Procès gagné ! +$${winAmt} (-20 REP dans la rue pour avoir balancé)`, "success");
                    playSuccess();
                } else {
                    const lossAmt = Math.floor(300 + Math.random() * 300);
                    logMoney(-lossAmt, `Frais d'avocats perdus`);
                    showToast(`Procès perdu... Les frais t'ont coûté $${lossAmt} (-20 REP).`, "error");
                    playError();
                }
            }
            else if (action === 'rien') {
                const lossAmt = Math.floor(100 + Math.random() * 400);
                const follLost = Math.floor(50 + Math.random() * 150);
                logMoney(-lossAmt, `Prod volée (Manque à gagner)`);
                state.followers = Math.max(0, state.followers - follLost);
                showToast(`Tu t'es fait marcher dessus. -$${lossAmt} | -${follLost} Followers`, "error");
                playError();
            }
            else if (action === 'amiable') {
                const lossAmt = Math.floor(50 + Math.random() * 150);
                logMoney(-lossAmt, `Arrangement avec ${voleur}`);
                checkAchievement('prix_de_la_paix', () => true);
                state.rep += 10;
                if (typeof window.addRapperAffinity === 'function') window.addRapperAffinity(voleur, 15);
                showToast(`Arrangement trouvé avec ${voleur}. -$${lossAmt} mais tu passes pour un mec réglo (+10 REP, +15 Affinité)`, "info");
                playBleep();
            }
            closeRandomEvent();
        }

        function closeRandomEvent() {
            const overlay = document.getElementById('event-overlay');
            overlay.style.opacity = '0';
            overlay.style.pointerEvents = 'none';

            // --- Période de grâce de 4 heures in-game (~48 sec IRL) ---
            state.cooldowns.eventGracePeriod = getTotalMins() + 240;

            updateHUD();
            saveGame();

            setTimeout(() => {
                overlay.classList.add('hidden');
                state.isEventActive = false;
            }, 300);
        }

        function pickRapper(isKnown) {
            return isKnown
                ? _drawFromEventPool('rappersConnus', rappersConnus)
                : _drawFromEventPool('rappersPasConnus', rappersPasConnus);
        }

        function pickVoleur(isKnown) {
            return isKnown
                ? _drawFromEventPool('voleursConnus', voleursConnus)
                : _drawFromEventPool('voleursPasConnus', voleursPasConnus);
        }

        function pickCancelRapper() {
            return _drawFromEventPool('rappersCancel', rappersCancel);
        }

        window.triggerRandomEvent = triggerRandomEvent;
        window.closeRandomEvent = closeRandomEvent;

        // ==========================================
        // TRACK REVIEW SYSTEM
        // ==========================================
        const reviewers = [
            { type: 'critique', names: ['PitchFork_FR', 'RapActu', 'LeSonDuMois', 'NoFuture_Mag'] },
            { type: 'internaute', names: ['@user4829', '@drillfreak99', '@anonyme_musik', '@rateyourprod'] },
            { type: 'rappeur', names: rappersConnus }
        ];

        function getReviewerComment(type, score) {
            if (type === 'critique') {
                if (score >= 8) return ["Un chef d'œuvre sonique.", "Production irréprochable.", "Incontournable de 2026."];
                if (score >= 5) return ["Correct sans être mémorable.", "Quelques bonnes idées mal exploitées.", "Ça se laisse écouter."];
                return ["Un désastre commercial.", "On a entendu ça 1000 fois.", "Skip immédiat."];
            }
            if (type === 'internaute') {
                if (score >= 8) return ["bro ce son 🔥🔥🔥", "j'ai mis ça en boucle depuis 3h", "validé par les rues"];
                if (score >= 5) return ["mouais c'est pas mal", "ça passe en soirée", "y'a des trucs bien"];
                return ["c'est quoi ce bruit 💀", "delete this", "mon chat fait mieux"];
            }
            if (type === 'rappeur') {
                if (score >= 8) return ["Respect au prod, c'est solide.", "Je veux un feat.", "Top niveau."];
                if (score >= 5) return ["C'est correct, continue.", "Travaille encore.", "Pas mal pour un débutant."];
                return ["Arrête de polluer les ondes.", "C'est moi qui suis la référence.", "Retourne à l'école."];
            }
            return ["..."];
        }

        function showTrackReview(trackScore, trackTitle, toastData) {
            try {
                // GARDE DE SÉCURITÉ : jamais pendant le boot ou si le jeu charge
                if (window.isBooting) { console.warn('[showTrackReview] Blocked during boot.'); return; }
                const overlay = document.getElementById('review-overlay');
                const phaseSuspense = document.getElementById('review-phase-suspense');
                const phaseResults = document.getElementById('review-phase-results');
                const reviewList = document.getElementById('review-list');
                const avgEl = document.getElementById('review-average');
                const trackNameEl = document.getElementById('review-track-name');
                const suspenseTitle = document.getElementById('suspense-title');
                const suspenseGenre = document.getElementById('suspense-genre');
                const suspenseText = document.getElementById('suspense-text');
                const progressBar = document.getElementById('suspense-progress-bar');
                state.isReviewActive = true; // Active l'état de revue

                if (!overlay || !phaseSuspense || !phaseResults || !reviewList || !avgEl || !trackNameEl || !suspenseTitle || !suspenseGenre || !suspenseText) {
                    console.warn('Review overlay missing DOM nodes');
                    return;
                }

                // Forçage brutal pour éviter les conflits Tailwind
                overlay.className = 'fixed inset-0 bg-black/95 z-[9999999] flex flex-col items-center justify-center p-4 backdrop-blur-xl transition-opacity duration-300 pointer-events-auto opacity-100';
                overlay.style.display = 'flex';
                overlay.style.opacity = '1';
                overlay.style.pointerEvents = 'auto';
                overlay.style.zIndex = '9999999';

                phaseSuspense.className = 'flex flex-col items-center justify-center p-8 flex-1 w-full relative overflow-hidden';
                phaseSuspense.style.display = 'flex';

                phaseResults.className = 'hidden flex-col w-full max-h-[90dvh] overflow-y-auto';
                phaseResults.style.display = 'none';

                const safeGenre = (currentDawGenre || 'drill').toUpperCase();
                const safeVoice = (currentDawVoice || 'm').toUpperCase();

                trackNameEl.innerText = `"${trackTitle}" — ${safeGenre} / ${safeVoice}`;
                suspenseTitle.innerText = `"${trackTitle}"`;
                suspenseGenre.innerText = `${safeGenre} · ${safeVoice} · DAY ${state.day || 1}`;

                // Génère les reviews
                const reviews = [];
                const usedTypes = [];
                while (reviews.length < 3) {
                    const pool = reviewers[Math.floor(Math.random() * reviewers.length)];
                    if (!pool) continue;
                    if (usedTypes.includes(pool.type)) continue;
                    usedTypes.push(pool.type);
                    const individualScore = Math.round(Math.min(10, Math.max(1, trackScore + Math.floor(Math.random() * 5) - 2)) * 10) / 10;
                    const name = pool.names[Math.floor(Math.random() * pool.names.length)];
                    const comments = getReviewerComment(pool.type, individualScore);
                    let comment = comments[Math.floor(Math.random() * comments.length)];
                    if (state.activeSample && reviews.length === 0) {
                        const sampleObj = SAMPLE_CATALOG.find(s => s.id === state.activeSample.id);
                        if (sampleObj) {
                            const isCompatible = sampleObj.genre === currentDawGenre;
                            if (isCompatible) {
                                comment += ` L'utilisation de "${sampleObj.name}" est d'une pertinence rare pour ce style !`;
                            } else {
                                comment += ` Hélas, placer "${sampleObj.name}" ici fait complètement tache et gâche le morceau.`;
                            }
                        }
                    }
                    reviews.push({ type: pool.type, name, score: individualScore, comment });
                }
                const avg = (reviews.reduce((s, r) => s + r.score, 0) / reviews.length).toFixed(1);
                if (window.pendingReviewData) {
                    window.pendingReviewData.avgReviewScore = avg;
                }

                // Initialiser la barre de progression à 0%
                if (progressBar) progressBar.style.width = '0%';

                const suspenseSteps = [
                    "Écoute des transitoires...",
                    "Vérification de la phase stéréo...",
                    "Jugement des critiques...",
                    "Calcul de la note moyenne...",
                    "Génération du rapport..."
                ];

                playTone(300, 'sine', 0.4, 0.05);

                // Animation erratique de la barre de progression + Skip Suspense
                let currentProgress = 0;
                let _suspenseRevealed = false;
                let _suspenseRevealTimer = null;

                const revealReviewResults = (instant = false) => {
                    if (_suspenseRevealed) return;
                    _suspenseRevealed = true;
                    if (_suspenseRevealTimer) { clearTimeout(_suspenseRevealTimer); _suspenseRevealTimer = null; }
                    currentProgress = 100;
                    if (progressBar) progressBar.style.width = '100%';

                    phaseSuspense.style.display = 'none';
                    phaseSuspense.classList.add('hidden');
                    phaseResults.classList.remove('hidden');
                    phaseResults.style.display = 'flex';

                    // Affiche le Breakdown Visuel Post-Export
                    const bdEl = document.getElementById('review-score-breakdown');
                    const bdItems = (window.pendingReviewData && Array.isArray(window.pendingReviewData.breakdown)) ? window.pendingReviewData.breakdown : [];
                    if (bdEl) {
                        if (bdItems.length > 0) {
                            const toneStyles = {
                                good: 'bg-emerald-500/15 border-emerald-400/45 text-emerald-300',
                                warn: 'bg-amber-500/15 border-amber-400/45 text-amber-300',
                                bad:  'bg-rose-500/15 border-rose-400/45 text-rose-300',
                                info: 'bg-sky-500/15 border-sky-400/45 text-sky-300'
                            };
                            bdEl.innerHTML = bdItems.map(it => `<span class="px-2 py-0.5 rounded border text-[9.5px] font-mono font-bold uppercase tracking-wider ${toneStyles[it.tone] || toneStyles.info}">${it.label}</span>`).join('');
                            bdEl.classList.remove('hidden');
                        } else {
                            bdEl.classList.add('hidden');
                        }
                    }

                    const typeColors = { critique: 'text-[var(--retro-blue)]', internaute: 'text-[var(--retro-green)]', rappeur: 'text-[var(--retro-orange)]' };
                    const typeLabels = { critique: '📰 CRITIQUE', internaute: '💬 INTERNAUTE', rappeur: '🎤 RAPPEUR' };

                    reviewList.innerHTML = '';
                    const cardDelay = instant ? 80 : 650;
                    reviews.forEach((r, i) => {
                        setTimeout(() => {
                            const div = document.createElement('div');
                            div.className = 'bg-black/40 border border-white/10 rounded-lg p-4 opacity-0 transition-opacity duration-300';
                            div.innerHTML = `
                                <div class="flex justify-between items-center mb-2">
                                    <span class="text-[10px] font-retro ${typeColors[r.type]}">${typeLabels[r.type]}</span>
                                    <span class="text-[10px] font-retro text-white">${r.name}</span>
                                </div>
                                <div class="flex justify-between items-center gap-3">
                                    <p class="text-sm text-gray-300 italic flex-1">"${r.comment}"</p>
                                    <span class="text-2xl font-bold font-retro flex-shrink-0 ${r.score >= 7 ? 'text-[var(--retro-green)]' : r.score >= 4 ? 'text-[var(--retro-orange)]' : 'text-[var(--retro-red)]'}">${r.score}/10</span>
                                </div>`;
                            reviewList.appendChild(div);
                            setTimeout(() => div.style.opacity = '1', 30);
                            playTone(300 + (r.score * 40), 'sine', 0.12, 0.05);
                        }, i * cardDelay);
                    });

                    // Score final après toutes les reviews et affichage du toast
                    setTimeout(() => {
                        const avgColor = avg >= 7 ? 'text-[var(--retro-green)]' : avg >= 4 ? 'text-[var(--retro-orange)]' : 'text-[var(--retro-red)]';
                        avgEl.className = `text-5xl font-bold font-retro ${avgColor}`;
                        avgEl.innerText = `${avg}/10`;

                        if (avg >= 7.0) playSuccess();
                        else if (avg >= 4.0) playBleep();
                        else playError();

                        if (avg >= 7.0) fireConfetti('banger');

                        if (window.pendingExportResults) {
                            const res = window.pendingExportResults;
                            if (res.hypeChange) {
                                state.hype = Math.min(100, Math.max(0, (state.hype || 50) + res.hypeChange));
                            }
                            if (res.floatingText && typeof spawnFloatingText === 'function') {
                                spawnFloatingText(res.floatingText.elementId, res.floatingText.text, res.floatingText.color);
                            }
                            if (res.effect) {
                                const osMain = document.getElementById('os-main') || document.body;
                                if (osMain) {
                                    osMain.classList.add(res.effect);
                                    setTimeout(() => osMain.classList.remove(res.effect), res.effect === 'banger-flash' ? 800 : 500);
                                }
                            }
                            updateHUD();
                            window.pendingExportResults = null;
                        }

                        if (parseFloat(avg) <= 4.0) {
                            const reviewOverlay = document.getElementById('review-overlay');
                            if (reviewOverlay) {
                                reviewOverlay.classList.add('screen-shake');
                                setTimeout(() => reviewOverlay.classList.remove('screen-shake'), 1000);
                            }
                            playTone(220, 'sawtooth', 0.35, 0.15);
                            setTimeout(() => playTone(330, 'sawtooth', 0.35, 0.15), 180);
                            setTimeout(() => playTone(220, 'sawtooth', 0.35, 0.15), 360);

                            const dissBtn = document.getElementById('review-diss-btn');
                            if (dissBtn) {
                                dissBtn.classList.remove('hidden');
                                dissBtn.style.display = 'block';
                                window.dissTrackTimer = setTimeout(() => {
                                    dissBtn.classList.add('hidden');
                                    dissBtn.style.display = 'none';
                                    showToast("Trop tard pour répondre. Ton flop est gravé dans le marbre.", "error");
                                }, 3000);
                            }
                        }
                        if (toastData) {
                            showToast(toastData.msg, toastData.type);
                        }
                    }, reviews.length * cardDelay + (instant ? 120 : 350));
                };

                window.skipReviewSuspense = () => {
                    if (typeof playBleep === 'function') playBleep();
                    revealReviewResults(true);
                };

                const updateSuspenseProgress = () => {
                    if (!_suspenseRevealed && currentProgress < 100 && state.isReviewActive) {
                        const randJump = Math.floor(Math.random() * 15) + 5;
                        currentProgress = Math.min(95, currentProgress + randJump);
                        if (progressBar) progressBar.style.width = `${currentProgress}%`;
                        const textIdx = Math.floor((currentProgress / 100) * suspenseSteps.length);
                        const stepText = suspenseSteps[Math.min(suspenseSteps.length - 1, textIdx)];
                        suspenseText.innerText = stepText;
                        playTone(150 + (currentProgress * 3), 'sine', 0.1, 0.04);
                        const nextDelay = Math.random() * 700 + 250;
                        setTimeout(updateSuspenseProgress, nextDelay);
                    }
                };

                setTimeout(updateSuspenseProgress, 180);
                _suspenseRevealTimer = setTimeout(() => revealReviewResults(false), 3800);
    } catch (err) {
        console.error("Error in showTrackReview:", err);
        showToast("Erreur lors de l'affichage des critiques : " + err.message, "error");
    }
}


// ==========================================
// DISS TRACK QTE MODE
// ==========================================
const qteState = {
    active: false,
    startTime: 0,
    duration: 15000,
    timeLeft: 15.00,
    smashCount: 0,
    hacked: false,
    echoPrompted: false,
    pads: { drums: null, melody: null, vocal: null }
};

globalThis.qteAnimationFrame = null;

function getSampleType(sample) {
    const name = (sample.name || '').toLowerCase();
    const id = (sample.id || '').toLowerCase();
    if (name.includes('drum') || name.includes('break') || name.includes('beat') || name.includes('808') || id.includes('amen') || id.includes('funky')) {
        return 'drums';
    }
    if (name.includes('voice') || name.includes('vocal') || name.includes('laugh') || name.includes('chant') || name.includes('brel') || id.includes('thriller') || id.includes('voodoo')) {
        return 'vocal';
    }
    return 'melody';
}

function getQTECrateItems() {
    const items = [];
    
    // 1. Owned Samples
    (state.ownedSamples || []).forEach(sampleId => {
        const s = SAMPLE_CATALOG.find(x => x.id === sampleId);
        if (s) {
            items.push({
                id: s.id,
                name: s.name,
                emoji: getSampleType(s) === 'drums' ? '🥁' : (getSampleType(s) === 'vocal' ? '🎤' : '🎹'),
                type: getSampleType(s),
                tier: s.tier || 1,
                genre: s.genre,
                isSample: true
            });
        }
    });

    // 2. Unlocked Genres
    DAW_GENRES.forEach(g => {
        const isUnlocked = (state.stats.tracks || 0) >= g.unlockAt;
        if (isUnlocked) {
            items.push({
                id: `genre_drum_${g.id}`,
                name: `${g.name} Rhythm`,
                emoji: '🥁',
                type: 'drums',
                tier: 1,
                genre: g.name,
                isSample: false
            });
            items.push({
                id: `genre_mel_${g.id}`,
                name: `${g.name} Lead`,
                emoji: '🎹',
                type: 'melody',
                tier: 1,
                genre: g.name,
                isSample: false
            });
        }
    });

    // 3. Default Voices
    items.push({
        id: 'voice_m',
        name: 'Male Vocal',
        emoji: '🎤',
        type: 'vocal',
        tier: 1,
        genre: 'General',
        isSample: false
    });
    items.push({
        id: 'voice_f',
        name: 'Female Vocal',
        emoji: '🎤',
        type: 'vocal',
        tier: 1,
        genre: 'General',
        isSample: false
    });
    items.push({
        id: 'voice_instru',
        name: 'Synth FX',
        emoji: '🎤',
        type: 'vocal',
        tier: 1,
        genre: 'General',
        isSample: false
    });
    
    return items;
}

function startDissTrackQTE() {
    if (typeof window.enforceFpsModalPriority === 'function') window.enforceFpsModalPriority();
    if (window.dissTrackTimer) {
        clearTimeout(window.dissTrackTimer);
        window.dissTrackTimer = null;
    }
    
    const reviewOverlay = document.getElementById('review-overlay');
    if (reviewOverlay) {
        reviewOverlay.style.display = 'none';
        reviewOverlay.classList.remove('pointer-events-auto', 'opacity-100');
        reviewOverlay.classList.add('pointer-events-none', 'opacity-0');
    }
    
    const qteOverlay = document.getElementById('qte-diss-overlay');
    if (qteOverlay) {
        qteOverlay.classList.remove('hidden', 'qte-outro-win', 'qte-outro-fail');
        qteOverlay.style.display = 'flex';
        qteOverlay.style.opacity = '1';
        qteOverlay.style.pointerEvents = 'auto';
        qteOverlay.style.transform = 'translateY(0)';
    }
    
    qteState.active = true;
    qteState.smashCount = 0;
    qteState.hacked = false;
    qteState.echoPrompted = false;
    qteState.pads = { genre: null, voice: null, bpm: null };
    
    // Dynamic tagline selection
    const QTE_TAGLINES = [
        "⚡ COMPOSE BIEN VITE TA DISSTRACK, T'ES ATTENDU !!",
        "🔥 LE JURY T'ATTEND AU TOURNANT, DÉPOSE-LES !",
        "⚠️ BAD BUZZ EN COURS ! ESQUIVE LE FLOP EN 15s !",
        "🎤 SORS LE PLUS GROS CLAPBACK DE TA CARRIÈRE !",
        "💥 UN MORCEAU, 15 SECONDES, ZÉRO PARDON !"
    ];
    const instructionText = document.getElementById('qte-instruction-text');
    if (instructionText) {
        instructionText.innerText = QTE_TAGLINES[Math.floor(Math.random() * QTE_TAGLINES.length)];
    }
    
    const genreVal = document.getElementById('qte-pad-genre-val');
    if (genreVal) genreVal.innerText = 'VIDE';
    const voiceVal = document.getElementById('qte-pad-voice-val');
    if (voiceVal) voiceVal.innerText = 'VIDE';
    const bpmVal = document.getElementById('qte-pad-bpm-val');
    if (bpmVal) bpmVal.innerText = 'VIDE';
    
    const genreStatus = document.getElementById('qte-pad-genre-status');
    if (genreStatus) genreStatus.innerText = '🎹 GENRE : ❌ VIDE';
    const voiceStatus = document.getElementById('qte-pad-voice-status');
    if (voiceStatus) voiceStatus.innerText = '🎤 VOICE : ❌ VIDE';
    const bpmStatus = document.getElementById('qte-pad-bpm-status');
    if (bpmStatus) bpmStatus.innerText = '⏱️ BPM : ❌ VIDE';
    
    const padGenre = document.getElementById('qte-pad-genre');
    if (padGenre) padGenre.className = 'flex flex-col items-center justify-center border-2 border-dashed border-gray-600 rounded-xl p-4 bg-white/5 cursor-pointer hover:bg-white/10 hover:border-red-500 transition-all min-h-[90px]';
    const padVoice = document.getElementById('qte-pad-voice');
    if (padVoice) padVoice.className = 'flex flex-col items-center justify-center border-2 border-dashed border-gray-600 rounded-xl p-4 bg-white/5 cursor-pointer hover:bg-white/10 hover:border-red-500 transition-all min-h-[90px]';
    const padBpm = document.getElementById('qte-pad-bpm');
    if (padBpm) padBpm.className = 'flex flex-col items-center justify-center border-2 border-dashed border-gray-600 rounded-xl p-4 bg-white/5 cursor-pointer hover:bg-white/10 hover:border-red-500 transition-all min-h-[90px]';
    
    const echoBanner = document.getElementById('qte-echo-banner');
    if (echoBanner) {
        echoBanner.classList.add('hidden');
        echoBanner.style.display = 'none';
    }
    
    const smashBtn = document.getElementById('qte-smash-btn');
    if (smashBtn) {
        smashBtn.classList.add('hidden', 'qte-smash-blink');
        smashBtn.style.display = 'none';
    }
    
    const smashCount = document.getElementById('qte-smash-count');
    if (smashCount) smashCount.innerText = '0';
    
    const timerDisplay = document.getElementById('qte-timer-display');
    if (timerDisplay) {
        timerDisplay.className = 'text-3xl font-bold text-red-400 drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]';
    }
    
    populateQTEDAWColumns();
    startQTETimer();
}

function populateQTEDAWColumns() {
    const genreCol = document.getElementById('qte-genre-col');
    const voiceCol = document.getElementById('qte-voice-col');
    const bpmCol = document.getElementById('qte-bpm-col');
    if (!genreCol || !voiceCol || !bpmCol) return;
    
    genreCol.innerHTML = '';
    voiceCol.innerHTML = '';
    bpmCol.innerHTML = '';
    
    // Genres from DAW_GENRES
    const currentTracks = (state && state.stats && typeof state.stats.tracks === 'number') ? state.stats.tracks : 0;
    if (Array.isArray(window.DAW_GENRES) || Array.isArray(DAW_GENRES)) {
        const list = window.DAW_GENRES || DAW_GENRES;
        list.forEach(g => {
            const isUnlocked = currentTracks >= g.unlockAt;
            if (isUnlocked) {
                const btn = document.createElement('button');
                btn.className = 'w-full text-[8px] font-bold py-1.5 px-1 rounded border border-red-500/30 bg-red-950/20 hover:bg-red-500/40 text-red-200 cursor-pointer transition-all truncate text-center';
                btn.style.cssText = "pointer-events: auto !important; cursor: pointer !important; z-index: 10;";
                btn.innerText = g.name;
                btn.onclick = () => {
                    if (typeof playQTEGenrePreview === 'function') playQTEGenrePreview(g.id, 4000);
                    selectQTEGenre(g.id, g.name);
                };
                btn.onmouseenter = () => {
                    if (typeof playQTEGenrePreview === 'function') playQTEGenrePreview(g.id, 4000);
                };
                genreCol.appendChild(btn);
            }
        });
    }
    
    // Voices/Moods
    const voices = ['Male Hype', 'Vocal Chop', 'Dark Voice', 'AI Vocals', 'Fem Hype', 'Ambient Vox'];
    voices.forEach(v => {
        const btn = document.createElement('button');
        btn.className = 'w-full text-[8px] font-bold py-1.5 px-1 rounded border border-blue-500/30 bg-blue-950/20 hover:bg-blue-500/40 text-blue-200 cursor-pointer transition-all truncate text-center';
        btn.style.cssText = "pointer-events: auto !important; cursor: pointer !important; z-index: 10;";
        btn.innerText = v;
        btn.onclick = () => selectQTEVoice(v);
        voiceCol.appendChild(btn);
    });
    
    // BPMs
    const bpms = [60, 88, 90, 110, 113, 120, 125, 130, 135, 137, 140, 160];
    bpms.forEach(bpm => {
        const btn = document.createElement('button');
        btn.className = 'w-full text-[8px] font-mono font-bold py-1.5 px-1 rounded border border-yellow-500/30 bg-yellow-950/20 hover:bg-yellow-500/40 text-yellow-200 cursor-pointer transition-all truncate text-center';
        btn.style.cssText = "pointer-events: auto !important; cursor: pointer !important; z-index: 10;";
        btn.innerText = `${bpm} BPM`;
        btn.onclick = () => selectQTEBPM(bpm);
        bpmCol.appendChild(btn);
    });
}

function selectQTEGenre(id, name) {
    if (!qteState || !qteState.pads) return;
    qteState.pads.genre = { id, name };
    
    const padValEl = document.getElementById('qte-pad-genre-val');
    const statusEl = document.getElementById('qte-pad-genre-status');
    if (padValEl) {
        padValEl.innerText = name;
        const borderClass = qteState.hacked ? 'border-purple-500 bg-purple-950/20' : 'border-red-500 bg-red-950/20';
        if (padValEl.parentElement) {
            padValEl.parentElement.className = `flex flex-col items-center justify-center border-2 rounded-xl p-4 cursor-pointer transition-all min-h-[90px] ${borderClass}`;
        }
    }
    if (statusEl) {
        statusEl.innerText = `🎹 GENRE : ✅ PRÊT`;
    }
    
    triggerQTEPadFeedback('genre');
}

function selectQTEVoice(name) {
    if (!qteState || !qteState.pads) return;
    qteState.pads.voice = name;
    
    const padValEl = document.getElementById('qte-pad-voice-val');
    const statusEl = document.getElementById('qte-pad-voice-status');
    if (padValEl) {
        padValEl.innerText = name;
        const borderClass = qteState.hacked ? 'border-purple-500 bg-purple-950/20' : 'border-blue-500 bg-blue-950/20';
        if (padValEl.parentElement) {
            padValEl.parentElement.className = `flex flex-col items-center justify-center border-2 rounded-xl p-4 cursor-pointer transition-all min-h-[90px] ${borderClass}`;
        }
    }
    if (statusEl) {
        statusEl.innerText = `🎤 VOICE : ✅ PRÊT`;
    }
    
    triggerQTEPadFeedback('voice');
}

function selectQTEBPM(bpm) {
    if (!qteState || !qteState.pads) return;
    qteState.pads.bpm = bpm;
    
    const padValEl = document.getElementById('qte-pad-bpm-val');
    const statusEl = document.getElementById('qte-pad-bpm-status');
    if (padValEl) {
        padValEl.innerText = `${bpm} BPM`;
        const borderClass = qteState.hacked ? 'border-purple-500 bg-purple-950/20' : 'border-yellow-500 bg-yellow-950/20';
        if (padValEl.parentElement) {
            padValEl.parentElement.className = `flex flex-col items-center justify-center border-2 rounded-xl p-4 cursor-pointer transition-all min-h-[90px] ${borderClass}`;
        }
    }
    if (statusEl) {
        statusEl.innerText = `⏱️ BPM : ✅ PRÊT`;
    }
    
    triggerQTEPadFeedback('bpm');
}

function triggerQTEPadFeedback(type) {
    // Play aggressive percussion synth
    if (typeof playTone === 'function') {
        playTone(120, 'triangle', 0.12, 0.25);
        playTone(65, 'sine', 0.2, 0.35); // extra punch sub
    }
    
    // Visual flash of the overlay background
    const overlay = document.getElementById('qte-diss-overlay');
    if (overlay) {
        const originalBg = overlay.style.backgroundColor;
        overlay.style.backgroundColor = 'rgba(220, 38, 38, 0.25)';
        overlay.classList.add('qte-micro-shake');
        setTimeout(() => {
            const overlayCheck = document.getElementById('qte-diss-overlay');
            if (overlayCheck) {
                overlayCheck.style.backgroundColor = originalBg;
                overlayCheck.classList.remove('qte-micro-shake');
            }
        }, 120);
    }
    
    // Flash slot container green
    const pad = document.getElementById(`qte-pad-${type}`);
    if (pad) {
        const flashClass = qteState.hacked ? 'qte-pad-flash-success-hack' : 'qte-pad-flash-success';
        pad.classList.remove('qte-pad-flash-success', 'qte-pad-flash-success-hack');
        void pad.offsetWidth; // force reflow
        pad.classList.add(flashClass);
    }
    
    checkQTESmashButton();
}

function selectQTEPadSlot(type) {
    if (!qteState || !qteState.pads) return;
    if (qteState.pads[type]) {
        qteState.pads[type] = null;
        const padValEl = document.getElementById(`qte-pad-${type}-val`);
        const statusEl = document.getElementById(`qte-pad-${type}-status`);
        if (padValEl) {
            padValEl.innerText = 'VIDE';
            if (padValEl.parentElement) {
                padValEl.parentElement.className = 'flex flex-col items-center justify-center border-2 border-dashed border-gray-600 rounded-xl p-4 bg-white/5 cursor-pointer hover:bg-white/10 hover:border-red-500 transition-all min-h-[90px]';
                padValEl.parentElement.classList.remove('qte-pad-flash-success', 'qte-pad-flash-success-hack');
            }
        }
        
        const labelMap = { genre: '🎹 GENRE', voice: '🎤 VOICE', bpm: '⏱️ BPM' };
        if (statusEl) {
            statusEl.innerText = `${labelMap[type]} : ❌ VIDE`;
        }
        if (typeof playTone === 'function') {
            playTone(100, 'sine', 0.05, 0.1);
        }
        checkQTESmashButton();
    }
}

function triggerQTEEchoHack() {
    if (!qteState) return;
    qteState.hacked = true;
    
    if (!qteState.pads.genre) {
        selectQTEGenre('viral_hack_genre', '👾 VIRAL HACK GENRE');
    }
    if (!qteState.pads.voice) {
        selectQTEVoice('👾 VIRAL HACK VOICE');
    }
    if (!qteState.pads.bpm) {
        selectQTEBPM(999);
    }

    if (typeof playTone === 'function') {
        playTone(100, 'square', 0.2, 0.2);
        setTimeout(() => playTone(300, 'sawtooth', 0.1, 0.15), 50);
        setTimeout(() => playTone(600, 'square', 0.05, 0.1), 100);
    }

    const banner = document.getElementById('qte-echo-banner');
    if (banner) {
        banner.classList.add('hidden');
        banner.style.display = 'none';
    }
    
    checkQTESmashButton();
}

function checkQTESmashButton() {
    if (!qteState || !qteState.pads) return;
    const btn = document.getElementById('qte-smash-btn');
    if (!btn) return;
    
    const padsFilled = qteState.pads.genre && qteState.pads.voice && qteState.pads.bpm;
    
    if (qteState.timeLeft <= 2.0 && padsFilled) {
        btn.classList.remove('hidden');
        btn.style.display = 'block';
        btn.classList.add('qte-smash-blink');
    } else {
        btn.classList.add('hidden');
        btn.style.display = 'none';
        btn.classList.remove('qte-smash-blink');
    }
}

function smashQTERender() {
    if (!qteState) return;
    qteState.smashCount++;
    const smashCountEl = document.getElementById('qte-smash-count');
    if (smashCountEl) {
        smashCountEl.innerText = qteState.smashCount;
    }
    if (typeof playTone === 'function') {
        playTone(300 + (qteState.smashCount * 100), 'sawtooth', 0.08, 0.15);
    }
    
    const btn = document.getElementById('qte-smash-btn');
    if (btn) {
        btn.classList.add('btn-smash-active');
        setTimeout(() => {
            const btnCheck = document.getElementById('qte-smash-btn');
            if (btnCheck) btnCheck.classList.remove('btn-smash-active');
        }, 50);
    }
}

function startQTETimer() {
    if (!qteState) return;
    qteState.startTime = performance.now();
    qteState.duration = 15000;
    
    function tick(now) {
        if (!qteState || !qteState.active) return;
        
        const elapsed = now - qteState.startTime;
        qteState.timeLeft = Math.max(0, (qteState.duration - elapsed) / 1000);
        
        const timerDisplay = document.getElementById('qte-timer-display');
        if (timerDisplay) {
            timerDisplay.innerText = `${qteState.timeLeft.toFixed(2)}s`;
            if (qteState.timeLeft <= 5.0) {
                if (!timerDisplay.classList.contains('qte-timer-warning')) {
                    timerDisplay.classList.add('qte-timer-warning');
                }
            } else {
                timerDisplay.className = 'text-3xl font-bold text-red-400 drop-shadow-[0_0_8px_rgba(239, 68, 68, 0.8)]';
            }
        }
        
        const heartbeatGlow = document.getElementById('qte-heartbeat-glow');
        if (heartbeatGlow) {
            const beatFreq = qteState.timeLeft <= 5.0 ? 0.35 : 1.0;
            const pulse = 0.15 + 0.15 * Math.abs(Math.sin((now / 1000) * Math.PI * (1 / beatFreq)));
            heartbeatGlow.style.background = `radial-gradient(circle at center, rgba(239, 68, 68, ${pulse}) 0%, transparent 70%)`;
        }
        
        if (qteState.timeLeft <= 5.0 && !qteState.hacked && !qteState.echoPrompted) {
            qteState.echoPrompted = true;
            const echoBanner = document.getElementById('qte-echo-banner');
            if (echoBanner) {
                echoBanner.classList.remove('hidden');
                echoBanner.style.display = 'flex';
                if (typeof playTone === 'function') playTone(440, 'square', 0.25, 0.2);
            }
        }
        
        if (qteState.timeLeft <= 2.0) {
            checkQTESmashButton();
        }
        
        if (qteState.timeLeft <= 0) {
            const padsFilled = qteState.pads.genre && qteState.pads.voice && qteState.pads.bpm;
            const goodSynergy = checkQTESynergy();
            const hasHack = qteState.hacked;
            const enoughSmashes = qteState.smashCount >= 3;
            const isVictory = padsFilled && (goodSynergy || hasHack) && enoughSmashes;
            endDissTrackQTE(isVictory);
        } else {
            qteAnimationFrame = requestAnimationFrame(tick);
        }
    }
    
    qteAnimationFrame = requestAnimationFrame(tick);
}

function checkQTESynergy() {
    if (!qteState || !qteState.pads) return false;
    if (qteState.hacked) return true;
    if (!qteState.pads.genre || !qteState.pads.bpm) return false;
    
    const genreId = qteState.pads.genre.id;
    const list = window.DAW_GENRES || (typeof DAW_GENRES !== 'undefined' ? DAW_GENRES : []);
    const g = list.find(x => x.id === genreId);
    if (!g) return false;
    
    const diff = Math.abs(qteState.pads.bpm - g.targetBpm);
    return diff <= (g.tol || 5);
}

function endDissTrackQTE(isVictory) {
    if (typeof stopGenrePreview === 'function') stopGenrePreview();
    if (qteState) qteState.active = false;
    if (qteAnimationFrame) {
        cancelAnimationFrame(qteAnimationFrame);
        qteAnimationFrame = null;
    }
    
    const qteOverlay = document.getElementById('qte-diss-overlay');
    if (!qteOverlay) {
        applyQTEOutcome(isVictory);
        return;
    }
    
    qteOverlay.classList.remove('qte-outro-win', 'qte-outro-fail');
    qteOverlay.classList.add(isVictory ? 'qte-outro-win' : 'qte-outro-fail');
    qteOverlay.style.pointerEvents = 'none';
    
    setTimeout(() => {
        const qteOverlayCheck = document.getElementById('qte-diss-overlay');
        if (qteOverlayCheck) {
            qteOverlayCheck.classList.add('hidden');
            qteOverlayCheck.style.display = 'none';
        }
        applyQTEOutcome(isVictory);
    }, 800);
}

function applyQTEOutcome(isVictory) {
    window.isAfterDissTrack = true;
    window.dissTrackVictory = isVictory;
    if (isVictory) {
        showToast("🔥 BANGER CLAPBACK ! Ta réplique a cartonné.", "success");
        if (typeof playSuccess === 'function') playSuccess();
        
        if (window.pendingReviewData) {
            window.pendingReviewData.track.score = 8.0;
            window.pendingReviewData.toast = {
                msg: "📀 BANGER CLAPBACK ! Le morceau passe à 8.0/10 [CULT CLASSIC] !",
                type: 'success'
            };
            window.pendingReviewData.money = Math.floor(window.pendingReviewData.money * 3.5);
            window.pendingReviewData.fans = Math.floor(window.pendingReviewData.fans * 4.0);
        }
        
        state.ins = 100;
        if (typeof updateHype === 'function') updateHype(200);
        
        if (qteState.hacked) {
            state.echoAlignment = Math.max(-100, state.echoAlignment - 20);
            state.echoLawsuitDay = state.day + Math.floor(Math.random() * 3) + 2;
            showToast("👾 HACK ILLÉGAL : Risque futur de procès détecté.", "warning");
        } else {
            state.rep = Math.max(0, state.rep + 100);
            state.echoAlignment = Math.min(100, state.echoAlignment + 20);
            state.echoTrust = Math.min(100, state.echoTrust + 15);
            showToast("🎛️ PURISTE: Composé sans aide (+100 REP) !", "success");
        }
    } else {
        showToast("💀 CRINGE RESPONSE ! Ta carrière est en miettes.", "error");
        if (typeof playError === 'function') playError();
        
        if (window.pendingReviewData) {
            window.pendingReviewData.track.score = 1.0;
            window.pendingReviewData.toast = {
                msg: "💀 CAREER SUICIDE ! Ton clapback était ultra cringe (1.0/10)...",
                type: 'error'
            };
            window.pendingReviewData.money = 0;
            window.pendingReviewData.fans = -Math.floor(state.followers * 0.15);
            window.pendingReviewData.rep = -Math.floor(state.rep * 0.5);
        }
        state.ins = 0;
    }
    
    // Re-open review with new values
    const overlay = document.getElementById('review-overlay');
    if (overlay) {
        overlay.style.transition = 'none';
        overlay.style.transform = 'none';
        overlay.style.display = 'flex';
        overlay.style.opacity = '1';
        overlay.style.pointerEvents = 'auto';
        overlay.classList.add('pointer-events-auto', 'opacity-100');
        overlay.classList.remove('pointer-events-none', 'opacity-0');
        
        const phaseSuspense = document.getElementById('review-phase-suspense');
        const phaseResults = document.getElementById('review-phase-results');
        if (phaseSuspense) phaseSuspense.style.display = 'none';
        if (phaseResults) phaseResults.style.display = 'flex';
        
        const avgEl = document.getElementById('review-average');
        const finalScore = isVictory ? 8.0 : 1.0;
        if (avgEl) {
            avgEl.innerText = `${finalScore.toFixed(1)}/10`;
            avgEl.className = `text-5xl font-bold font-retro ${isVictory ? 'text-[var(--retro-green)]' : 'text-[var(--retro-red)]'}`;
        }
        
        const reviewList = document.getElementById('review-list');
        if (reviewList) {
            reviewList.innerHTML = `
                <div class="bg-black/60 border border-${isVictory ? 'green-500/30' : 'red-500/30'} rounded-lg p-4 animate-pulse">
                    <div class="flex justify-between items-center mb-2">
                        <span class="text-[10px] font-retro text-yellow-500">🎤 RAP CLAPBACK</span>
                        <span class="text-[10px] font-retro text-white">RÉPLIQUE DISS TRACK</span>
                    </div>
                    <div class="flex justify-between items-center gap-3">
                        <p class="text-sm text-gray-300 italic flex-1">
                            ${isVictory 
                                ? (qteState.hacked 
                                    ? '"Ce sample viral injecté en douce a retourné tout TikTok ! Un coup de génie commercial."' 
                                    : '"Un couplet destructeur posé sans aucune aide, c\'est du pur génie artistique."') 
                                : '"Mais c\'est quoi cette catastrophe ? Le mec bégaie et se tire une balle dans le pied."'}
                        </p>
                        <span class="text-2xl font-bold font-retro flex-shrink-0 ${isVictory ? 'text-[var(--retro-green)]' : 'text-[var(--retro-red)]'}">${finalScore.toFixed(1)}/10</span>
                    </div>
                </div>
            `;
        }
    }
}

window.startDissTrackQTE = startDissTrackQTE;
window.selectQTEPadSlot = selectQTEPadSlot;
window.triggerQTEEchoHack = triggerQTEEchoHack;
window.smashQTERender = smashQTERender;

// --- Global Bridge & ES Exports ---
Object.assign(globalThis, { DM_TEMPLATES, DM_POOL, refillDMPool, generateSenderName, switchDealTab, switchSocialTab, getTemplateById, renderDMs, answerDM, spawnRandomDM, startLiveChat, TIERED_DEALS, updateBrandDealsAvailability, rappersConnus, rappersPasConnus, voleursConnus, voleursPasConnus, rappersCancel, refreshSocial, postStory, acceptDeal, closeReview, _shuffleEventPool, _eventPools, _drawFromEventPool, _getArtistInitials, _renderEventArtistCard, _buildGtaChoiceCard, triggerRandomEvent, resolveCollabEvent, resolveTheftEvent, closeRandomEvent, pickRapper, pickVoleur, pickCancelRapper, reviewers, getReviewerComment, showTrackReview, qteState, getSampleType, getQTECrateItems, startDissTrackQTE, populateQTEDAWColumns, selectQTEGenre, selectQTEVoice, selectQTEBPM, triggerQTEPadFeedback, selectQTEPadSlot, triggerQTEEchoHack, checkQTESmashButton, smashQTERender, startQTETimer, checkQTESynergy, endDissTrackQTE, applyQTEOutcome });
export { DM_TEMPLATES, DM_POOL, refillDMPool, generateSenderName, switchDealTab, switchSocialTab, getTemplateById, renderDMs, answerDM, spawnRandomDM, startLiveChat, TIERED_DEALS, updateBrandDealsAvailability, rappersConnus, rappersPasConnus, voleursConnus, voleursPasConnus, rappersCancel, refreshSocial, postStory, acceptDeal, closeReview, _shuffleEventPool, _eventPools, _drawFromEventPool, _getArtistInitials, _renderEventArtistCard, _buildGtaChoiceCard, triggerRandomEvent, resolveCollabEvent, resolveTheftEvent, closeRandomEvent, pickRapper, pickVoleur, pickCancelRapper, reviewers, getReviewerComment, showTrackReview, qteState, getSampleType, getQTECrateItems, startDissTrackQTE, populateQTEDAWColumns, selectQTEGenre, selectQTEVoice, selectQTEBPM, triggerQTEPadFeedback, selectQTEPadSlot, triggerQTEEchoHack, checkQTESmashButton, smashQTERender, startQTETimer, checkQTESynergy, endDissTrackQTE, applyQTEOutcome };
