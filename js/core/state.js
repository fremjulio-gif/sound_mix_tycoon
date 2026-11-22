// Core Game State, Persistence, DEV Presets & City Normalizer Hook
const _cityStateHooks = [];
export function registerStateNormalizer(fn) {
    if (typeof fn === 'function') _cityStateHooks.push(fn);
}
window._cityNormalizeStateHook = function(merged) {
    _cityStateHooks.forEach(fn => { try { fn(merged); } catch (e) {} });
};

window.isBooting = true;

const DEFAULT_STATE = {
            username: '', activeCharacter: 2,
            money: 100, rep: 10, followers: 0, energy: 100,
            inspi: 100,
            lastGenres: [],
            recentExports: [],
            flowStateActive: false,
            streakDays: 0,
            lastPlayedDay: 0,
            maxStreak: 0,
            dailyQuests: [],
            dailyQuestsLastReset: 0,
            hype: 50,
            viralActive: false,
            viralEndTime: 0,
            permanentMixBonus: 0,
            earlyGameBoost: true, earlyGameTracks: 0,
            // --- AJOUT DES VOLUMES PAR DÉFAUT ---
            masterVolume: 1.0,
            musicVolume: 0.8,
            sfxVolume: 0.5,
            timeMins: 8 * 60,
            day: 1,
            multiplier: 1.0, plugins: 0, lastLevel: 1,
            stats: { tracks: 0, bangers: 0, flops: 0, viruses: 0, crackDownloads: 0, consecutiveFlops: 0, sofaChills: 0, lampToggles: 0, awakeDays: 0 },
            cooldowns: { dawTimeReady: 0, crackzTimeReady: 0, echoSubExpiry: 0, storyTimeReady: 0, sponsors: {} },
            inventory: [], ownedCracks: [], downloadedCracks: {}, ownedFurniture: [],
            ownedSamples: [], clearedSamples: [], activeSample: null,
            history: { money: [{ amt: 100, txt: "Initial Bank Setup" }], followers: [] },
            isExporting: false, isSleeping: false, isEventActive: false,
            roomTier: 1, studioUnlocked: false, activeLocation: 'bedroom',
            avatarTier: 1, avatarVariant: 0, avatarTierPrompted: 1,
            labelName: '42E RECORDS', labelNamed: false, rivalNamed: false, signedArtists: [], artistRoyaltyMults: {}, artistLastSingleDay: {}, labelSinglesCount: 0,
            completedSyncIds: [], placedSyncTrackKeys: [], lastSyncRefreshDay: 0,
            albums: [],
            rapperAffinity: {},
            artistDirectCollabDay: {},
            genreMarket: { day: 1, hotGenres: ['drill', 'afropop'], recentCounts: {} },
            lastRentDay: 1,
            awardsHistory: [],
            trophies: [],
            lastCeremonyDay: 0,
            lastShowcaseDay: 0,
            showcaseHistory: [],
            endingUnlocked: null,
            prestigeCount: 0,
            onboardingDismissed: false,
            rivalState: { name: 'KROWN // 808', score: 1200, winsAgainst: 0, lastClashDay: 0 },
            nightSummary: { lastMoney: 100, lastFollowers: 0, lastRep: 10 },
            isSitting: false,
            isReviewActive: false, // Ajout de l'état pour les revues
            lastRankId: 1, // Nouveau : ID de la dernière ligue atteinte
            trackList: [],
            echoAlignment: 0, // De -100 (Algorithme/Sellout) à +100 (Qualité/Puriste)
            echoTrialUsed: false, // True si le joueur a déjà consommé ses 2 jours d'essai
            echoPlan: 'free', // 'free' | 'pro' | 'neural'
            echoAiHeat: 0, // 0..100 : Suspicion IA / risque de scandale Bad Buzz
            echoBuffs: { algoBoostTracks: 0, ghostProdReady: false, autoMixReady: false, trendDay: 0, trendGenreId: null, lastAlgoPushDay: 0 },
            activeDoorBoosts: { vinylCharges: 0, proStudioCharges: 0 },
            activeContracts: [],
            completedDeals: [],
            dealPool: {},
            // Weekly challenge system
            activeChallenge: {
                id: null,
                description: '',
                type: null,
                targetValue: 0,
                currentProgress: 0,
                rewardType: null,
                rewardAmount: 0,
                daysRemaining: 7,
                isCompleted: false
            },
            achievements: { // Nouveau : Système d'achievements
                'first_blood': { unlocked: false, rewardClaimed: false, name: "First Blood", icon: "🩸", description: "Tu as exporté ta toute première prod. Le début de la gloire." },
                'certifie_classique': { unlocked: false, rewardClaimed: false, name: "Certifié Classique", icon: "📀", description: "Obtenir un score parfait (10/10) par les critiques." },
                'dans_la_sauce': { unlocked: false, rewardClaimed: false, name: "Dans la Sauce", icon: "🌶️", description: "Atteindre la barre des 15000 fans. Tu ne peux plus sortir dans la rue tranquille." },
                'productivite_toxique': { unlocked: false, rewardClaimed: false, name: "Productivité Toxique", icon: "🗑️", description: "Enchaîner 5 flops d'affilée. Remets-toi en question." },
                'alerte_rouge': { unlocked: false, rewardClaimed: false, name: "Alerte Rouge", icon: "💀", description: "Te manger ton premier écran bleu (BSOD) à cause d'un plugin cracké." },
                'hacker_man': { unlocked: false, rewardClaimed: false, name: "Hacker Man", icon: "🥷", description: "Télécharger 10 plugins sur CrackZ. Le FBI te cherche." },
                'cancel_culture': { unlocked: false, rewardClaimed: false, name: "Cancel Culture", icon: "📉", description: "Survivre à ton premier Bad Buzz sur les réseaux." },
                'avocat_du_diable': { unlocked: false, rewardClaimed: false, name: "Avocat du Diable", icon: "⚖️", description: "Gagner un procès contre un rappeur qui a volé ta prod." },
                'let_him_cook': { unlocked: false, rewardClaimed: false, name: "Let Him Cook", icon: "🍕", description: "T'asseoir 10 fois sur le canapé pour 'chercher l'inspi'." },
                'sellout': { unlocked: false, rewardClaimed: false, name: "Sellout", icon: "🤝", description: "Accepter ton premier placement de produit (Sponsor). L'argent n'a pas d'odeur." },
                'inge_son_certifie': { unlocked: false, rewardClaimed: false, name: "Ingé Son Certifié", icon: "🎛️", description: "Acheter ton premier plugin légal avec ton propre argent sur AudioStore." },
                'prix_de_la_paix': { unlocked: false, rewardClaimed: false, name: "Le Prix de la Paix", icon: "🕊️", description: "Régler un vol de prod à l'amiable en acceptant de perdre de l'argent." },
                'toujours_dans_le_rouge': { unlocked: false, rewardClaimed: false, name: "Toujours dans le rouge", icon: "🔋", description: "Lancer un export de mixdown avec moins de 5% d'énergie. Danger de mort." },
                'lumiere_divine': { unlocked: false, rewardClaimed: false, name: "Lumière Divine", icon: "💡", description: "Allumer et éteindre la lampe Pixar 20 fois. (Tu t'ennuies ?)" },
                'vrai_rat_de_studio': { unlocked: false, rewardClaimed: false, name: "Vrai Rat de Studio", icon: "🧛‍♂️", description: "Passer 3 jours entiers in-game sans jamais cliquer sur le lit pour dormir." },
                'echo_sellout': { unlocked: false, rewardClaimed: false, name : "Yes-Man", icon: "🤑", description: "Façonner ECHO pour qu'il devienne une machine à cash cynique." },
                'echo_purist': { unlocked: false, rewardClaimed: false, name: "Ingé Son Virtuel", icon: "🎛️", description: "Pousser ECHO à devenir un puriste de la dynamique." },
                'echo_scammed': { unlocked: false, rewardClaimed: false, name: "Pigeon ?", icon: "💸", description: "Payer l'abonnement complet à ECHO OS." },
                'bac_a_sable': { unlocked: false, rewardClaimed: false, name: "Bac à sable", icon: "⏳", description: "Posséder un total de 10 samples dans sa collection." },
                'crate_digger': { unlocked: false, rewardClaimed: false, name: "Crate Digger", icon: "📦", description: "Trouver et posséder un sample légendaire de Tier 4." },
                'cleared': { unlocked: false, rewardClaimed: false, name: "Cleared", icon: "✅", description: "Avoir négocié ou libéré les droits d'auteur sur 3 samples différents." },
                'ne_me_quitte_pas': { unlocked: false, rewardClaimed: false, name: "Ne me quitte pas", icon: "🌹", description: "Faire l'acquisition de la voix poignante de Jacques Brel." },
                'digging_initiation': { unlocked: false, rewardClaimed: false, name: "Digging Initiation", icon: "⛏️", description: "Faire l'acquisition de ton tout premier sample." }
            }
        };
        globalThis.state = JSON.parse(JSON.stringify(DEFAULT_STATE));

        const SAMPLE_CATALOG = [
            { id: 's_amen', name: 'Amen Break', tier: 1, genre: 'Drum & Bass', bonus: 1, risque: 0.15, price: 100, reqRep: 5, ref: 'The Winstons - Amen, Brother', desc: 'Le break de batterie légendaire. Très stable.' },
            { id: 's_funky', name: 'Funky Drummer', tier: 1, genre: 'Hip-Hop', bonus: 1, risque: 0.20, price: 150, reqRep: 5, ref: 'James Brown - Funky Drummer', desc: 'Rythme funk mythique incontournable.' },
            { id: 's_brel', name: 'Ne Me Quitte Pas', tier: 2, genre: 'Pop', bonus: 2, risque: 0.30, price: 300, reqRep: 15, ref: 'Jacques Brel - Ne Me Quitte Pas', desc: 'Une voix pleine d\'émotion dramatique.' },
            { id: 's_stairway', name: 'Stairway Flute', tier: 3, genre: 'Synthwave', bonus: 2, risque: 0.40, price: 500, reqRep: 30, ref: 'Led Zeppelin - Stairway to Heaven', desc: 'Une intro mélodique mystique.' },
            { id: 's_thriller', name: 'Thriller Laugh', tier: 4, genre: 'French House', bonus: 3, risque: 0.55, price: 900, reqRep: 50, ref: 'Michael Jackson - Thriller', desc: 'Le rire terrifiant le plus célèbre de la pop.' },
            { id: 's_love', name: 'L-O-V-E Sax', tier: 2, genre: 'Pop', bonus: 2, risque: 0.30, price: 350, reqRep: 15, ref: 'Nat King Cole - L-O-V-E', desc: 'Une ligne de saxophone chaleureuse et romantique.' },
            { id: 's_stax', name: 'Stax Horns', tier: 2, genre: 'French House', bonus: 2, risque: 0.25, price: 250, reqRep: 12, ref: 'Stax Records Brass Section', desc: 'Cuivres rutilants de soul américaine.' },
            { id: 's_voodoo', name: 'Voodoo Chant', tier: 3, genre: 'Drum & Bass', bonus: 2, risque: 0.45, price: 600, reqRep: 35, ref: 'Jimi Hendrix - Voodoo Child', desc: 'Un riff de guitare électrique distordue psychédélique.' },
            { id: 's_future', name: 'Retro Future', tier: 3, genre: 'Synthwave', bonus: 3, risque: 0.50, price: 750, reqRep: 40, ref: 'Kraftwerk - The Robots', desc: 'Synthétiseur analogique rétro-futuriste.' },
            { id: 's_classic', name: 'Chopin Nocturne', tier: 4, genre: 'Hip-Hop', bonus: 3, risque: 0.65, price: 1000, reqRep: 55, ref: 'Frédéric Chopin - Nocturne in E-flat major', desc: 'Mélodie de piano classique chargée de nostalgie.' }
        ];

            // === PROFILS DEV PRÉ-CALIBRÉS (ACCÈS DIRECT TIERS 1, 2 & 3 + STUDIO PRO 42e) ===
            window.DEV_PRESET_PROFILES = {
                DEV_T1: {
                    username: 'DEV_T1', activeCharacter: 2, avatarTier: 1, avatarVariant: 0, day: 1, timeMins: 570,
                    money: 150, rep: 5, followers: 12, energy: 92, inspi: 85, hype: 30,
                    roomTier: 1, ownedFurniture: [],
                    stats: { tracks: 0, bangers: 0, flops: 0, totalEarned: 150 }
                },
                DEV_T2: {
                    username: 'DEV_T2', activeCharacter: 0, avatarTier: 2, avatarVariant: 0, day: 14, timeMins: 690,
                    money: 2800, rep: 32, followers: 6500, energy: 90, inspi: 88, hype: 62,
                    roomTier: 2, ownedFurniture: ['rug', 'sofa', 'table'],
                    stats: { tracks: 3, bangers: 2, flops: 0, totalEarned: 6400 },
                    trackList: [
                        { title: 'NUIT SUR PARIS', genre: 'Plug', score: 9.1, money: 3200, fans: 3800, date: 'J12' },
                        { title: 'METRO LIGNE 9', genre: 'Boom Bap', score: 8.4, money: 2100, fans: 1900, date: 'J8' },
                        { title: 'CAFE NOIR', genre: 'Lo-Fi', score: 7.6, money: 1100, fans: 800, date: 'J3' }
                    ]
                },
                DEV_T3: {
                    username: 'DEV_T3', activeCharacter: 1, avatarTier: 3, avatarVariant: 0, day: 35, timeMins: 960,
                    money: 25000, rep: 78, followers: 28000, energy: 95, inspi: 92, hype: 84,
                    roomTier: 3, ownedFurniture: ['rug', 'sofa', 'table', 'tv', 'rack_lamp', 'led_panel_l', 'led_panel_r', 'synth', 'guitar'],
                    stats: { tracks: 8, bangers: 6, flops: 1, totalEarned: 62000 },
                    trackList: [
                        { title: 'GOLDEN HOUR', genre: 'Synthwave', score: 9.6, money: 18500, fans: 11200, date: 'J31' },
                        { title: 'NUIT SUR PARIS', genre: 'Plug', score: 9.2, money: 14200, fans: 8400, date: 'J24' },
                        { title: 'SUBWOOFER 808', genre: 'Trap', score: 8.9, money: 11000, fans: 5200, date: 'J18' }
                    ]
                },
                DEV_STUDIO: {
                    username: 'DEV_STUDIO', activeCharacter: 3, avatarTier: 4, avatarVariant: 0, day: 60, timeMins: 1080,
                    money: 120000, rep: 100, followers: 65000, energy: 96, inspi: 95, hype: 94,
                    roomTier: 3, studioUnlocked: true, activeLocation: 'pro_studio',
                    labelName: '42E RECORDS', signedArtists: ['kaelen', 'nora'], labelSinglesCount: 4,
                    rapperAffinity: { 'Joule': 92, 'Zandame': 72, 'Disiznot': 45, 'Rosmii': 30 },
                    ownedFurniture: ['rug', 'sofa', 'table', 'tv', 'rack_lamp', 'led_panel_l', 'led_panel_r', 'synth', 'guitar'],
                    stats: { tracks: 55, bangers: 44, flops: 2, totalEarned: 340000 },
                    trackList: [
                        { id: 'dev_t1', title: '42E ETAGE', genre: 'UK Drill', genreId: 'drill', score: 9.9, money: 85000, fans: 24000, date: 'J56' },
                        { id: 'dev_t2', title: 'ANALOG DREAMS', genre: 'Plug', genreId: 'plug', score: 9.6, money: 64000, fans: 18000, date: 'J48' },
                        { id: 'dev_t3', title: 'NUIT SUR PARIS', genre: 'Trap 808', genreId: 'trap808', score: 9.4, money: 52000, fans: 14000, date: 'J39' },
                        { id: 'dev_t4', title: 'TAPE SATURATION', genre: 'Bossa Lo-Fi', genreId: 'bossalofi', score: 9.1, money: 38000, fans: 9000, date: 'J28' }
                    ]
                }
            };

        // ==========================================
        // 9. STORAGE
        // ==========================================
        const MockStorage = { data: {}, getItem: (k) => MockStorage.data[k] || null, setItem: (k, v) => { MockStorage.data[k] = v; } };
        const SafeStorage = {
            get: (key) => { try { return localStorage.getItem(key) || MockStorage.getItem(key); } catch(e) { return MockStorage.getItem(key); } },
            set: (key, val) => { try { localStorage.setItem(key, val); } catch(e) {} MockStorage.setItem(key, val); }
        };

globalThis.state = JSON.parse(JSON.stringify(DEFAULT_STATE));

        // ==========================================
        // STATE NORMALIZATION AND DEEP MERGE HELPERS
        // ==========================================
        function deepMergeState(target, source) {
            if (!source || typeof source !== 'object') return target;
            
            for (const key in target) {
                if (Object.prototype.hasOwnProperty.call(target, key)) {
                    const targetVal = target[key];
                    const sourceVal = source[key];
                    
                    if (sourceVal === undefined || sourceVal === null) {
                        continue;
                    }
                    
                    if (Array.isArray(targetVal)) {
                        if (Array.isArray(sourceVal)) {
                            target[key] = sourceVal;
                        }
                    } else if (typeof targetVal === 'object') {
                        target[key] = deepMergeState(targetVal, sourceVal);
                    } else {
                        if (typeof targetVal === 'number') {
                            const parsedNum = Number(sourceVal);
                            target[key] = isNaN(parsedNum) ? targetVal : parsedNum;
                        } else if (typeof targetVal === 'boolean') {
                            target[key] = Boolean(sourceVal);
                        } else if (typeof targetVal === 'string') {
                            target[key] = String(sourceVal);
                        } else {
                            target[key] = sourceVal;
                        }
                    }
                }
            }
            return target;
        }

        function normalizeState(parsed) {
            const baseState = JSON.parse(JSON.stringify(DEFAULT_STATE));
            if (!parsed || typeof parsed !== 'object') return baseState;
            
            const merged = deepMergeState(baseState, parsed);
            
            // Post-merge validation for specific fields
            merged.stats = merged.stats || {};
            merged.cooldowns = merged.cooldowns || {};
            merged.cooldowns.sponsors = merged.cooldowns.sponsors || {};
            merged.history = merged.history || { money: [], followers: [] };
            merged.trackList = Array.isArray(merged.trackList) ? merged.trackList : [];
            merged.ownedCracks = Array.isArray(merged.ownedCracks) ? merged.ownedCracks : [];
            merged.downloadedCracks = merged.downloadedCracks && typeof merged.downloadedCracks === 'object' ? merged.downloadedCracks : {};
            merged.ownedFurniture = Array.isArray(merged.ownedFurniture) ? merged.ownedFurniture : [];
            merged.dailyQuests = Array.isArray(merged.dailyQuests) ? merged.dailyQuests : [];
            merged.activeDoorBoosts = merged.activeDoorBoosts && typeof merged.activeDoorBoosts === 'object' ? merged.activeDoorBoosts : { vinylCharges: 0, proStudioCharges: 0 };
            merged.artistLastSingleDay = merged.artistLastSingleDay && typeof merged.artistLastSingleDay === 'object' ? merged.artistLastSingleDay : {};
            merged.completedSyncIds = Array.isArray(merged.completedSyncIds) ? merged.completedSyncIds : [];
            merged.placedSyncTrackKeys = Array.isArray(merged.placedSyncTrackKeys) ? merged.placedSyncTrackKeys : [];
            merged.albums = Array.isArray(merged.albums) ? merged.albums : [];
            merged.rapperAffinity = merged.rapperAffinity && typeof merged.rapperAffinity === 'object' ? merged.rapperAffinity : {};
            if (String(merged.username || '').toUpperCase() === 'DEV_STUDIO' && Object.keys(merged.rapperAffinity).length === 0) {
                merged.rapperAffinity = { 'Joule': 92, 'Zandame': 72, 'Disiznot': 45, 'Rosmii': 30 };
            }
            merged.artistDirectCollabDay = merged.artistDirectCollabDay && typeof merged.artistDirectCollabDay === 'object' ? merged.artistDirectCollabDay : {};
            merged.genreMarket = merged.genreMarket && typeof merged.genreMarket === 'object' ? merged.genreMarket : { day: 1, hotGenres: ['drill', 'afropop'], recentCounts: {} };
            merged.awardsHistory = Array.isArray(merged.awardsHistory) ? merged.awardsHistory : [];
            merged.trophies = Array.isArray(merged.trophies) ? merged.trophies : [];
            merged.showcaseHistory = Array.isArray(merged.showcaseHistory) ? merged.showcaseHistory : [];
            merged.lastShowcaseDay = Number(merged.lastShowcaseDay) || 0;
            merged.labelName = (typeof merged.labelName === 'string' && merged.labelName.trim()) ? merged.labelName.trim().toUpperCase().slice(0, 22) : '42E RECORDS';
            merged.labelNamed = Boolean(merged.labelNamed);
            merged.rivalNamed = Boolean(merged.rivalNamed);
            merged.rivalState = merged.rivalState && typeof merged.rivalState === 'object' ? merged.rivalState : { name: 'KROWN // 808', score: 1200, winsAgainst: 0, lastClashDay: 0 };
            merged.rivalState.name = (typeof merged.rivalState.name === 'string' && merged.rivalState.name.trim()) ? merged.rivalState.name.trim().toUpperCase().slice(0, 22) : 'KROWN // 808';
            merged.nightSummary = merged.nightSummary && typeof merged.nightSummary === 'object' ? merged.nightSummary : { lastMoney: merged.money || 100, lastFollowers: merged.followers || 0, lastRep: merged.rep || 10 };
            
            merged.ownedSamples = Array.isArray(merged.ownedSamples) ? merged.ownedSamples : [];
            merged.clearedSamples = Array.isArray(merged.clearedSamples) ? merged.clearedSamples : [];
            if (!merged.ownedSamples.includes('s_amen')) merged.ownedSamples.push('s_amen');
            if (!merged.ownedSamples.includes('s_funky')) merged.ownedSamples.push('s_funky');
            
            // SÉCURITÉ ACHIEVEMENTS : S'assure que le statut rewardClaimed est correctement conservé
            merged.achievements = merged.achievements || {};
            if (parsed && parsed.achievements && typeof parsed.achievements === 'object') {
                for (const id in parsed.achievements) {
                    if (parsed.achievements[id] && parsed.achievements[id].rewardClaimed && merged.achievements[id]) {
                        merged.achievements[id].rewardClaimed = true;
                    }
                }
            }

            // DÉBLOCAGE SAUVEGARDES : Forcer la réinitialisation des deadlocks
            merged.isExporting = false;
            merged.isReviewActive = false;
            merged.isEventActive = false;
            merged.isSitting = false;
            merged.isSleeping = false;
            
            // Recalculate maxRep based on rank to fix loaded saves visual rep bar bug
            const rankContext = getRankContext(merged);
            merged.maxRep = calculateMaxRep(rankContext ? rankContext.currentRank : null);
            
            if (typeof window._cityNormalizeStateHook === 'function') window._cityNormalizeStateHook(merged);
            return merged;
        }


            function getSaveKey(username) {
            return 'smt_save_' + String(username || '').trim().toLowerCase();
        }

            function saveGame() {
            if (!state || !state.username) return;
            SafeStorage.set(getSaveKey(state.username), JSON.stringify(state));
            refreshAchievementsPanel();
        }

        window.exportSave = function() {
            if (!state || !state.username) {
                showToast("Aucune session active à exporter !", "warning");
                return;
            }
            try {
                saveGame();
                const jsonStr = JSON.stringify(state);
                const base64Save = btoa(encodeURIComponent(jsonStr).replace(/%([0-9A-F]{2})/g, (match, p1) => {
                    return String.fromCharCode(parseInt(p1, 16));
                }));
                
                navigator.clipboard.writeText(base64Save).then(() => {
                    showToast("Sauvegarde copiée dans le presse-papiers !", "success");
                    playSuccess();
                }).catch(err => {
                    console.error("Presse-papiers inaccessible, affichage de la clé :", err);
                    prompt("Copie ta clé de sauvegarde ci-dessous :", base64Save);
                });
            } catch(e) {
                console.error("Erreur d'exportation :", e);
                showToast("Échec de l'exportation de la sauvegarde !", "error");
            }
        };

        window.importSave = function() {
            const saveStr = prompt("Colle ta clé de sauvegarde Base64 ci-dessous :");
            if (!saveStr) return;
            
            try {
                const trimmed = saveStr.trim();
                const decodedStr = decodeURIComponent(Array.prototype.map.call(atob(trimmed), (c) => {
                    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                }).join(''));
                
                const parsed = JSON.parse(decodedStr);
                if (!parsed || typeof parsed !== 'object' || !parsed.username) {
                    throw new Error("Sauvegarde invalide");
                }
                
                state = normalizeState(parsed);
                
                recalculateActivePerks();
                syncFurniture3DVisibility();
                
                if (typeof MusicSystem !== 'undefined') {
                    window.masterVolume = state.masterVolume !== undefined ? parseFloat(state.masterVolume) : 1.0;
                    window.musicVolume = state.musicVolume !== undefined ? parseFloat(state.musicVolume) : 0.8;
                    window.sfxVolume = state.sfxVolume !== undefined ? parseFloat(state.sfxVolume) : 0.5;
                    MusicSystem.setMasterVolume(window.masterVolume);
                    MusicSystem.setMusicVolume(window.musicVolume);
                }
                
                saveGame();
                updateHUD();
                
                if (typeof updateDawPlugins === 'function') updateDawPlugins();
                if (typeof updateTopChartsWidget === 'function') updateTopChartsWidget();
                if (typeof updateChallengeUI === 'function') updateChallengeUI();
                if (typeof refreshSocial === 'function') refreshSocial();
                if (typeof refreshStats === 'function') refreshStats();
                if (typeof window.updateVinylCrate === 'function') window.updateVinylCrate();
            if (typeof window.syncCareerWallDiscs === 'function') window.syncCareerWallDiscs();
            if (typeof window.syncProStudioGuests3D === 'function') window.syncProStudioGuests3D();
            if (typeof window.updateEmpireTopPills === 'function') window.updateEmpireTopPills();
            if (typeof window.syncMasteringRackUI === 'function') window.syncMasteringRackUI();
                
                if (typeof spawnRoomAvatar === 'function') {
                    spawnRoomAvatar(state.activeCharacter);
                }
                
                showToast("Sauvegarde importée avec succès ! Session : " + state.username, "success");
                playSuccess();
            } catch(e) {
                console.error("Erreur d'importation :", e);
                showToast("Code de sauvegarde invalide ou corrompu !", "error");
                playError();
            }
        };

// --- Global Bridge & ES Exports ---
Object.assign(globalThis, { DEFAULT_STATE, SAMPLE_CATALOG, MockStorage, SafeStorage, deepMergeState, normalizeState, getSaveKey, saveGame });
export { DEFAULT_STATE, SAMPLE_CATALOG, MockStorage, SafeStorage, deepMergeState, normalizeState, getSaveKey, saveGame };
