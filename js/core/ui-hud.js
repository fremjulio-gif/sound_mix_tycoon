import { THREE } from './libs.js';


    // ==========================================
    // GESTION DE L'ÉCRAN DE CHARGEMENT
    // ==========================================
    // Assure que le popup d'achievement n'est pas enfermé dans le loader (qui devient display:none)
function relocateAchievementPopup(){
        try {
            const popup = document.getElementById('achievement-popup');
            if (popup && popup.parentElement && popup.parentElement.id === 'studio-loader') {
                // Place en dernier enfant de body pour qu'il reste visible même quand le loader est masqué
                document.body.appendChild(popup);
            }
        } catch (err) { console.warn('Relocate achievement popup failed', err); }
}

    // Phrases d'immersion cinéma studio
    const loadingPhrases = [
        "Mise sous tension des moniteurs…",
        "Calibration acoustique du studio…",
        "Préchauffage du préampli analogique…",
        "Synchronisation de la baie vitrée & lumière…",
        "STUDIO PRÊT."
    ];

    globalThis.phraseIndex = 0;
    globalThis.loadPercentage = 0;

    function simulateLoading() {
        const sLoader = document.getElementById('studio-loader');
        const lText = document.getElementById('loader-text');
        const lBar = document.getElementById('loader-progress-bar');
        const lPct = document.getElementById('loader-pct');
        const lTc = document.getElementById('loader-timecode');
        if (!sLoader || !lText) return;

        const bootStartMs = performance.now();
        const tcInterval = setInterval(() => {
            if (!lTc) return;
            const elapsed = (performance.now() - bootStartMs) / 1000;
            const mins = Math.floor(elapsed / 60);
            const secs = Math.floor(elapsed % 60);
            const frames = Math.floor((elapsed % 1) * 24);
            lTc.textContent = `00:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}:${String(frames).padStart(2, '0')}`;
        }, 42);

        const textInterval = setInterval(() => {
            phraseIndex++;
            if (phraseIndex < loadingPhrases.length - 1) {
                lText.innerText = loadingPhrases[phraseIndex];
            }
        }, 420);

        const progressInterval = setInterval(() => {
            loadPercentage += (Math.random() * 4.2) + 2.4;
            if (loadPercentage > 100) loadPercentage = 100;
            if (lBar) lBar.style.width = loadPercentage.toFixed(1) + '%';
            if (lPct) lPct.textContent = String(Math.floor(loadPercentage)).padStart(2, '0') + '%';

            if (loadPercentage >= 100) {
                clearInterval(progressInterval);
                clearInterval(textInterval);
                clearInterval(tcInterval);
                lText.innerText = loadingPhrases[loadingPhrases.length - 1];
                lText.classList.add('impact-flash');

                setTimeout(() => hideLoader(sLoader), 650);
            }
        }, 55);
    }

    function hideLoader(sLoader) {
        if (!sLoader) return;
        sLoader.classList.add('loader-fading');
        sLoader.style.opacity = '0';
        sLoader.style.pointerEvents = 'none';

        const ls = document.getElementById('login-screen');
        if (ls && ls.style.display !== 'none') {
            ls.classList.add('login-active');
            if (typeof window.refreshLoginSessionPreview === 'function') {
                window.refreshLoginSessionPreview();
            }
        }

        setTimeout(() => {
            sLoader.style.display = 'none';
        }, 950);
    }

function initLoader() {
    relocateAchievementPopup();
    if (document.readyState === 'complete') simulateLoading();
    else window.addEventListener('load', simulateLoading);
}




        
    //------------------------   
        
        // ==========================================
// CATALOGUE STUDIO+ (MARKETPLACE)
// ==========================================

        // ==========================================
        // 1. RESPONSIVE & GLOBALS
        // ==========================================
        // FIX: Détection unifiée Mobile Portrait + Mobile Paysage (iPhone/Android) + Tablettes tactiles
        function computeIsMobileLayout() {
            const isCoarse = Boolean(window.matchMedia && window.matchMedia('(pointer: coarse)').matches);
            return window.innerWidth <= 767 || (isCoarse && window.innerHeight <= 500);
        }
        globalThis.isMobile = computeIsMobileLayout();
        window.isMobile = isMobile;
        window.computeIsMobileLayout = computeIsMobileLayout;



        const themesList = [
            { name: 'neon',   vars: ['#09090b', '#1e1b4b', '#0f172a', '#312e81'] },
            { name: 'synth',  vars: ['#1a0b2e', '#ff007f', '#7928ca', '#00d4ff'] },
            { name: 'matrix', vars: ['#020617', '#064e3b', '#022c22', '#047857'] },
            { name: 'blood',  vars: ['#170000', '#7f1d1d', '#4c0519', '#9f1239'] }
        ];
        globalThis.currentThemeIdx = 0;

        function cycleTheme() {
            currentThemeIdx = (currentThemeIdx + 1) % themesList.length;
            const root = document.documentElement;
            const t = themesList[currentThemeIdx];
            root.style.setProperty('--bg-color-1', t.vars[0]);
            root.style.setProperty('--bg-color-2', t.vars[1]);
            root.style.setProperty('--bg-color-3', t.vars[2]);
            root.style.setProperty('--bg-color-4', t.vars[3]);
            playBleep();

            // Chance de micro-cinématique avatar au changement de thème
            if (typeof window.triggerRandomCinematic === 'function' && Math.random() < 0.45) {
                window.triggerRandomCinematic();
            }

            updateThemeColors();
        }


        // ==========================================
        // MISE À JOUR DYNAMIQUE DES LEDS ET NÉONS (LIÉ À L'AVATAR)
        // ==========================================
        function updateThemeColors() {
            if (!rackLeds || rackLeds.length === 0) return;

            // Couleurs de l'avatar (0:Beatmaker, 1:Cyber, 2:Street, 3:Exec)
            const avatarColors = ['#4a5bff', '#41d5ec', '#8ad16a', '#ff6f65']; 
            
            // On récupère la couleur d'accent de la variante d'avatar active (ou défaut du perso)
            const activeVarSpec = (typeof window.getActiveAvatarVariantSpec === 'function') ? window.getActiveAvatarVariantSpec() : null;
            const cTheme = (activeVarSpec && activeVarSpec.accent) || avatarColors[selectedAvatarIndex] || '#818cf8';

            // --- MISE À JOUR DU FOND DE LA ROOM (HARMONIE VISUELLE) ---
            const hexToHsl = (hex) => {
                let r = parseInt(hex.slice(1, 3), 16) / 255, g = parseInt(hex.slice(3, 5), 16) / 255, b = parseInt(hex.slice(5, 7), 16) / 255;
                let max = Math.max(r, g, b), min = Math.min(r, g, b), h, s, l = (max + min) / 2;
                if (max === min) h = s = 0;
                else {
                    let d = max - min; s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
                    if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
                    else if (max === g) h = (b - r) / d + 2;
                    else h = (r - g) / d + 4;
                    h /= 6;
                }
                return [h * 360, s * 100, l * 100];
            };

            const [h, s, l] = hexToHsl(cTheme);
            const root = document.documentElement;

            // On génère des teintes sombres et désaturées pour un look "Studio" élégant (bg2, bg3, bg4)
            root.style.setProperty('--bg-color-2', `hsl(${h}, ${Math.max(20, s * 0.4)}%, 12%)`); // Ambiance principale
            root.style.setProperty('--bg-color-3', `hsl(${h}, ${Math.max(15, s * 0.3)}%, 6%)`);  // Profondeur maximale
            root.style.setProperty('--bg-color-4', `hsl(${h}, ${Math.max(30, s * 0.5)}%, 18%)`); // Accentuation des blobs
            root.style.setProperty('--accent', cTheme); // Synchronise l'accent global de l'UI

            // 1. Mise à jour de TOUTES les LEDs du Rack Analogique
            rackLeds.forEach(item => {
                if (item?.material?.color) item.material.color.set(cTheme);
                if (item?.material?.emissive) item.material.emissive.set(cTheme);
            });

            // 2. Mise à jour des Néons Muraux (Acoustique)
            if (window.acousticNeons) {
                window.acousticNeons.forEach(neon => {
                    if (neon?.material?.color) neon.material.color.set(cTheme);
                    if (neon?.material?.emissive) neon.material.emissive.set(cTheme);
                    if (neon?.light?.color) neon.light.color.set(cTheme);
                });
            }
        }


        globalThis.hudDisplayValues = { money: 0, rep: 0, foll: 0 };
        globalThis.hudLastTargetValues = { money: 0, rep: 0, foll: 0 };
        globalThis.hudActiveAnims = {};

        function animateHUDNumber(id, target, key) {
            const el = document.getElementById(id);
            if (!el) return;
            
            const targetVal = Math.floor(Number(target));

            // Ne déclenche l'effet que si la valeur de base a réellement changé
            if (hudLastTargetValues[key] === targetVal) return;

            const startVal = hudDisplayValues[key] || 0;
            hudLastTargetValues[key] = targetVal;
            if (typeof playUIAudio === 'function' && targetVal > startVal && !window.isBooting) {
                playUIAudio('stat', 0.3);
            }

            // Punch effect
            el.classList.remove('juicy-pop');
            void el.offsetWidth; // Force reflow
            el.classList.add('juicy-pop');

            if (hudActiveAnims[key]) cancelAnimationFrame(hudActiveAnims[key]);

            const duration = 1000;
            const startTime = performance.now();

            function update(now) {
                const progress = Math.min((now - startTime) / duration, 1);
                const ease = 1 - Math.pow(1 - progress, 4); // easeOutQuart
                const currentVal = Math.floor(startVal + (targetVal - startVal) * ease);
                
                hudDisplayValues[key] = currentVal;
                el.innerText = formatNum(currentVal);

                if (progress < 1) {
                    hudActiveAnims[key] = requestAnimationFrame(update);
                } else {
                    hudDisplayValues[key] = targetVal;
                    el.innerText = formatNum(targetVal);
                    delete hudActiveAnims[key];
                }
            }
            hudActiveAnims[key] = requestAnimationFrame(update);
        }


        // ==========================================
        // GESTION DU MENU PARAMÈTRES AUDIO
        // ==========================================
        // Variables globales pour les volumes
        window.masterVolume = 1.0;
        window.musicVolume = 0.8;
        window.sfxVolume = 0.5;

        function openAudioSettings() { // La fonction est déjà exportée globalement
            const overlay = document.getElementById('audio-settings-overlay');
            if (!overlay) return;

            normalizeAchievementState();

            // Met à jour les sliders avec les valeurs actuelles
            document.getElementById('master-volume-slider').value = window.masterVolume;
            document.getElementById('master-volume-value').innerText = `${Math.round(window.masterVolume * 100)}%`;
            document.getElementById('music-volume-slider').value = window.musicVolume;
            document.getElementById('music-volume-value').innerText = `${Math.round(window.musicVolume * 100)}%`;
            document.getElementById('sfx-volume-slider').value = window.sfxVolume;
            document.getElementById('sfx-volume-value').innerText = `${Math.round(window.sfxVolume * 100)}%`;
            switchSettingsPanel(activeSettingsPanel, false);

            // 1. Rendre l'overlay visible (display: flex) sans changer l'opacité ni l'interactivité pour l'instant
            overlay.classList.remove('hidden');
            setTimeout(() => {
                // 2. Après un court délai, retirer les classes d'opacité et de pointer-events pour déclencher la transition
                overlay.classList.remove('opacity-0', 'pointer-events-none');
            }, 10);
            playBleep();
        }

        function closeAudioSettings() {
            const overlay = document.getElementById('audio-settings-overlay');
            if (!overlay) return;

            // Ajoute les classes pour déclencher la transition de fermeture (opacité et non-interactivité)
            overlay.classList.add('opacity-0', 'pointer-events-none');
            setTimeout(() => {
                // Ajoute la classe 'hidden' après la transition pour masquer complètement l'élément
                overlay.classList.add('hidden');
            }, 300);
            playBleep();
        }


        globalThis.moodRingStarted = false;
        globalThis.moodRingInterval = null;

    function updateMoodRingWidget() {
        moodRingStarted = true;
        const glow = document.getElementById('mood-ring-glow');
        const label = document.getElementById('mood-ring-label');
        
        if (!glow || !label) {
            setTimeout(updateMoodRingWidget, 1000);
            return;
        }

        // Ajout de la classe gérant l'animation CSS fluide
        if (!glow.classList.contains('mood-animated')) {
            glow.classList.add('mood-animated');
        }

        const moods = [
            { txt: 'LOCKED IN', bg: 'radial-gradient(circle at 30% 40%, rgba(52,211,153,0.95), transparent 32%), radial-gradient(circle at 75% 60%, rgba(129,140,248,0.75), transparent 36%)', color: 'var(--retro-green)' },
            { txt: 'OVERTHINKING', bg: 'radial-gradient(circle at 25% 55%, rgba(251,191,36,0.9), transparent 34%), radial-gradient(circle at 80% 35%, rgba(244,63,94,0.65), transparent 38%)', color: 'var(--retro-orange)' },
            { txt: '3AM SAUCE', bg: 'radial-gradient(circle at 40% 50%, rgba(96,165,250,0.9), transparent 34%), radial-gradient(circle at 72% 45%, rgba(168,85,247,0.75), transparent 40%)', color: 'var(--accent)' }
        ];

        const currentMood = moods[Math.floor(Date.now() / 5000) % moods.length];
        
        glow.style.background = currentMood.bg;
        label.innerText = currentMood.txt;
        label.style.color = currentMood.color;

        // Évite l'accumulation de setTimeouts si la fonction est appelée plusieurs fois
        if(moodRingInterval) clearTimeout(moodRingInterval);
        moodRingInterval = setTimeout(updateMoodRingWidget, 5000);
    }

        
                // ==========================================
        // GESTION DU TABLEAU DES SUCCÈS IN-GAME
        // ==========================================
        function openAchievementsBoard() {
            const overlay = document.getElementById('achievements-overlay');
            const panel = document.getElementById('settings-achievements-panel');
            if (!overlay) return;
            
            // Force la visibilité du panneau interne (au cas où il a été caché par le menu Audio)
            if (panel) { panel.classList.remove('hidden'); panel.classList.add('flex'); }

            normalizeAchievementState();
            renderAchievementsPanel(); // Met à jour les succès
            
            overlay.classList.remove('hidden');
            setTimeout(() => {
                overlay.classList.remove('opacity-0', 'pointer-events-none');
            }, 10);
            playSuccess();
        }

        function closeAchievementsBoard() {
            const overlay = document.getElementById('achievements-overlay');
            if (!overlay) return;
            
            overlay.classList.add('opacity-0', 'pointer-events-none');
            setTimeout(() => {
                overlay.classList.add('hidden');
            }, 300);
            playBleep();
        }


// === SYSTÈME DE LIGUES (CARRIÈRE) ===
// Seuils basés sur la progression réelle du jeu :
// - Afropop banger = +5000 fans d'un coup
// - Story = +rep*0.5 fans
// - Sponsors débloqués à 1k/5k/10k followers
// => Les paliers doivent être atteignables mais pas triviaux
const PLAYER_RANKS = [
    {
        id: 1,
        name: "Street Certified",
        minFol: 0,
        minRep: 0,
        minTracks: 0,
        icon: "🔥",
        color: "from-[#292524] to-[#1c1917]",
        borderColor: "from-[#78716c] to-[#57534e]",
        glowColor: "#a8a29e",
        perk: "Débute ta carrière"
    },
    {
        id: 2,
        name: "Rising Talent",
        minFol: 5000,
        minRep: 10,
        minTracks: 2,
        icon: "💿",
        color: "from-[#1e3a8a] to-[#172554]",
        borderColor: "from-[#60a5fa] to-[#3b82f6]",
        glowColor: "#3b82f6",
        perk: "Visibilité accrue"
    },
    {
        id: 3,
        name: "Industry Player",
        minFol: 20000,
        minRep: 30,
        minTracks: 5,
        icon: "🔮",
        color: "from-[#4a044e] to-[#280137]",
        borderColor: "from-[#c084fc] to-[#a855f7]",
        glowColor: "#a855f7",
        perk: "Accès aux gros deals"
    },
    {
        id: 4,
        name: "Legendary Status",
        minFol: 50000,
        minRep: 100,
        minTracks: 10,
        icon: "💎",
        color: "from-[#083344] to-[#022c22]",
        borderColor: "from-[#22d3ee] to-[#06b6d4]",
        glowColor: "#22d3ee",
        perk: "Statut légendaire"
    }
];

function calculateLevelData(isSilentInit = false) {
    if (!state) return null; // Sécurité globale

    // Lecture sécurisée des valeurs
    const money     = Number(state?.money) || 0;
    const rep       = Number(state?.rep) || 0;
    const followers = Number(state?.followers) || 0;
    const tracks    = Number(state?.stats?.tracks) || 0;
    const bangers   = Number(state?.stats?.bangers) || 0;

    // --- NOUVEAU: Weighted score with log-scaling for followers and money ---
    // We normalize each axis roughly into a 0-100 range, then apply the weights:
    // Followers: 40%, Reputation: 30%, Money: 20%, Skill: 10%
    const follScore = Math.min(100, Math.log10(followers + 1) * 22); // log10 scaling, tuned
    const moneyScore = Math.min(100, Math.log10(money + 1) * 25);     // NOUVEAU: Multiplicateur 25 au lieu de 16 pour accélérer le Bank Mastery (10K = 100%)
    const repScore = Math.min(100, rep);                              // assume rep is already on a friendly scale

    // Skill: ratio of bangers to tracks, normalized to 0-100
    const bangerRatio = tracks > 0 ? (bangers / tracks) : 0;
    const skillScore = Math.min(100, bangerRatio * 100);

    const avgMastery = (
        follScore * 0.40 +
        repScore  * 0.30 +
        moneyScore* 0.20 +
        skillScore* 0.10
    );

    const level = Math.max(1, Math.floor(avgMastery) || 1);
    const currentRank = getCurrentRank();
    const nextRank = PLAYER_RANKS.find(r => r.id === currentRank?.id + 1);
    
    
    // --- 1. DÉTECTION DE CHANGEMENT DE LIGUE & CENTAINE ---
    if (state.lastLevel === undefined) state.lastLevel = level;
    if (state.lastRankId === undefined) state.lastRankId = currentRank.id;

    const oldLevel = state.lastLevel;
    const oldRankId = state.lastRankId;

    let shouldTriggerNotif = false;
    let isRankUp = false;

    // A. Vérif changement de ligue (Prioritaire)
    if (currentRank.id > oldRankId) {
        shouldTriggerNotif = true;
        isRankUp = true;
    } 
    // B. Vérif passage de centaine (ex: 99 -> 100, 199 -> 200)
    else if (Math.floor(level / 100) > Math.floor(oldLevel / 100)) {
        shouldTriggerNotif = true;
    }

    if (shouldTriggerNotif) {
        state.lastLevel = level;
        state.lastRankId = currentRank.id;
        // Si on initialise silencieusement (chargement de sauvegarde), on NE lance PAS d'animations/toasts
        if (!isSilentInit) {
            setTimeout(() => triggerLevelUp(oldLevel, level, isRankUp, currentRank), 800);
        }
    } else if (level > state.lastLevel) {
        // Mise à jour silencieuse pour les niveaux intermédiaires (ex: 34 -> 35)
        state.lastLevel = level;
        state.lastRankId = currentRank.id;
    }

    let progressToNext = null;
    if (nextRank) {
        const folProgress  = nextRank.minFol > 0 ? Math.min(1, (Number(state?.followers) || 0) / nextRank.minFol) : 1;
        const repProgress  = nextRank.minRep > 0 ? Math.min(1, (Number(state?.rep) || 0) / nextRank.minRep) : 1;
        const trkProgress  = nextRank.minTracks > 0 ? Math.min(1, (Number(state?.stats?.tracks) || 0) / nextRank.minTracks) : 1;
        
        const bottleneck = Math.min(folProgress, repProgress, trkProgress);
        
        progressToNext = {
            percent: Math.round(bottleneck * 100),
            missingFol:    Math.max(0, nextRank.minFol    - (state?.followers || 0)),
            missingRep:    Math.max(0, nextRank.minRep    - (state?.rep || 0)),
            missingTracks: Math.max(0, nextRank.minTracks - (state?.stats?.tracks || 0)),
        };
    }

    // === ÉVOLUTION VISUELLE INSTANTANÉE DE LA CHAMBRE (TIERS 1 -> 2 -> 3) ===
    try {
        if (typeof window.getTargetRoomTier === 'function' && typeof window.applyRoomEvolutionTier === 'function') {
            const targetTier = window.getTargetRoomTier(state);
            const prevTier = Number(state.roomTier) || 1;
            const isProActive = (window.activeStudioLocation === 'pro_studio');
            if (isSilentInit || window.isBooting) {
                state.roomTier = Math.max(prevTier, targetTier);
                if (!state.avatarTier) state.avatarTier = state.studioUnlocked ? 4 : state.roomTier;
                if (!isProActive && window.currentRoomVisualTier !== state.roomTier) {
                    window.applyRoomEvolutionTier(state.roomTier, false);
                }
            } else if (targetTier > prevTier) {
                state.roomTier = targetTier;
                state.avatarTier = Math.max(Number(state.avatarTier) || 1, targetTier);
                if (typeof saveGame === 'function') saveGame();
                if (!isProActive) window.applyRoomEvolutionTier(targetTier, true);
                if ((Number(state.avatarTierPrompted) || 1) < targetTier && typeof window.openAvatarVariantModal === 'function') {
                    state.avatarTierPrompted = targetTier;
                    if (typeof saveGame === 'function') saveGame();
                    setTimeout(() => window.openAvatarVariantModal(targetTier), 1200);
                }
            }
            // Déblocage du VRAI STUDIO PRO (42e Étage) dès 80 % de Global Mastery!
            let studioJustUnlocked = false;
            if (avgMastery >= 80 && !state.studioUnlocked) {
                state.studioUnlocked = true;
                state.avatarTier = 4;
                studioJustUnlocked = true;
                if (typeof saveGame === 'function') saveGame();
                if (!isSilentInit && !window.isBooting) {
                    const banner = document.getElementById('room-evolution-banner');
                    const titleEl = document.getElementById('room-evo-title');
                    const subEl = document.getElementById('room-evo-sub');
                    if (titleEl) titleEl.textContent = '🏢 STUDIO PRO DÉBLOQUÉ · 42E ÉTAGE';
                    if (subEl) subEl.textContent = '80 % Global Mastery atteint ! Utilise la porte ou la touche [L] pour y accéder à tout moment.';
                    if (banner) { banner.classList.add('visible'); setTimeout(() => banner.classList.remove('visible'), 5500); }
                    if (typeof showToast === 'function') showToast('🏢 Penthouse Studio Pro (42e Étage) débloqué ! Appuie sur [L] ou passe par la porte.', 'success');
                    if ((Number(state.avatarTierPrompted) || 1) < 4 && typeof window.openAvatarVariantModal === 'function') {
                        state.avatarTierPrompted = 4;
                        if (typeof saveGame === 'function') saveGame();
                        setTimeout(() => window.openAvatarVariantModal(4), 1600);
                    }
                }
            }
            if ((studioJustUnlocked || !isSilentInit) && typeof window.syncStudioSwitchButtons === 'function') {
                window.syncStudioSwitchButtons();
            }
        }
    } catch(e) {}

    return {
        level,
        avg: Math.round(avgMastery),
        currentRank,
        nextRank,
        progressToNext,
        breakdown: {
            money:  Math.round(moneyScore),
            rep:    Math.round(repScore),
            foll:   Math.round(follScore),
            tracks: tracks,
            skill:  Math.round(skillScore),
        }
    };
}

function getRankContext(s) {
    const safeFollowers = Number(s?.followers) || 0;
    const safeRep = Number(s?.rep) || 0;
    const safeTracks = Number(s?.stats?.tracks) || 0;
    // Tri décroissant pour trouver le rang le plus élevé dont TOUS les prérequis (fans, rep, tracks) sont atteints
    const sortedRanks = PLAYER_RANKS.slice().sort((a, b) => (b.id || 0) - (a.id || 0));

    let currentRank = sortedRanks[sortedRanks.length - 1];
    let currentIndex = sortedRanks.length - 1;

    for (let i = 0; i < sortedRanks.length; i++) {
        const r = sortedRanks[i];
        if (
            safeFollowers >= (Number(r.minFol) || 0) &&
            safeRep >= (Number(r.minRep) || 0) &&
            safeTracks >= (Number(r.minTracks) || 0)
        ) {
            currentRank = r;
            currentIndex = i;
            break;
        }
    }

    const prevRank = currentIndex < sortedRanks.length - 1 ? sortedRanks[currentIndex + 1] : null;
    const nextRank = currentIndex > 0 ? sortedRanks[currentIndex - 1] : null;

    let progress = 100;
    if (nextRank) {
        const fP = nextRank.minFol > 0 ? Math.min(1, safeFollowers / nextRank.minFol) : 1;
        const rP = nextRank.minRep > 0 ? Math.min(1, safeRep / nextRank.minRep) : 1;
        const tP = nextRank.minTracks > 0 ? Math.min(1, safeTracks / nextRank.minTracks) : 1;
        progress = Math.round(Math.min(fP, rP, tP) * 100);
    }

    return { currentRank, prevRank, nextRank, progress, currentVal: safeFollowers, nextVal: nextRank ? nextRank.minFol : 'MAX' };
}

function getCurrentRank() {
    return getRankContext(state).currentRank;
}

function triggerLevelUp(oldLevel, newLevel, isRankUp = false, rankData = null) {
    const rank = rankData || getCurrentRank();
    
    // ANIMATIONS DE CÉLÉBRATION (Plus intenses pour les ligues)
    fireConfetti('achievement');
    if (isRankUp) {
        setTimeout(() => fireConfetti('banger'), 300); // Double dose de confettis pour les ligues
    }
    window.camShakeIntensity = isRankUp ? 2.5 : 1.5; 
    
    playLevelUpSound(); 
    setTimeout(playLevelUpSound, 200); 

    const toast = document.createElement('div');
    toast.className = 'level-up-toast juicy-level-up';
    
    const titleText = isRankUp ? "NOUVELLE LIGUE !" : "CENTAINE ATTEINTE !";
    const subText = isRankUp 
        ? `Tu passes dans la cour des grands : ${rank.name}` 
        : `Tu as franchi le cap du niveau ${newLevel} !`;

    toast.innerHTML = `
        <div class="text-6xl mb-4 drop-shadow-lg">${isRankUp ? '👑' : '⭐'}</div>
        <h2 class="text-4xl mb-1">${titleText}</h2>
        <p class="text-sm font-bold uppercase tracking-widest opacity-80 mb-6">${subText}</p>
        <div class="bg-black/10 rounded-2xl p-5 border border-white/20 mb-8">
            <p class="text-[10px] font-bold uppercase tracking-widest text-black/60 mb-1">Statut actuel</p>
            <p class="text-xl font-black uppercase tracking-tight" style="color: ${rank.glowColor || '#fff'}">${rank.name}</p>
            <p class="text-[11px] mt-1 font-medium opacity-90">"${rank.perk}"</p>
        </div>
        <button onclick="this.parentElement.remove()" class="w-full bg-black text-white py-4 rounded-2xl font-bold tracking-widest hover:scale-105 active:scale-95 transition-transform uppercase text-xs">C'est le moment de percer !</button>
    `;
    document.body.appendChild(toast);
}

// --- 3. NOUVELLE CÉLÉBRATION DE LIGUE ---
function triggerRankUp(oldRank, newRank) {
    fireConfetti('rankup'); // Confettis dorés pour la montée en ligue
    window.camShakeIntensity = 2.5; // Screen shake encore plus intense
    playLevelUpSound(); // Son de Level Up
    setTimeout(playLevelUpSound, 200); // Double-tone pour l'impact

    const toast = document.createElement('div');
    toast.className = 'level-up-toast juicy-level-up'; // Réutilise le style de base, peut être customisé
    
    toast.innerHTML = `
        <div class="text-6xl mb-4 drop-shadow-lg">👑</div>
        <h2 class="text-4xl mb-1">NOUVELLE LIGUE ATTEINTE !</h2>
        <p class="text-sm font-bold uppercase tracking-widest opacity-80 mb-6">Tu es passé de ${oldRank ? oldRank.name : 'Inconnu'} à</p>
        <div class="bg-black/10 rounded-2xl p-5 border border-white/20 mb-8">
            <p class="text-[10px] font-bold uppercase tracking-widest text-black/60 mb-1">Ton nouveau statut</p>
            <p class="text-xl font-black uppercase tracking-tight" style="color: ${newRank.glowColor}; text-shadow: 0 0 10px ${newRank.glowColor}55;">${newRank.name}</p>
            <p class="text-[11px] mt-1 font-medium opacity-90">"${newRank.perk}"</p>
        </div>
        <button onclick="this.parentElement.remove()" class="w-full bg-black text-white py-4 rounded-2xl font-bold tracking-widest hover:scale-105 active:scale-95 transition-transform uppercase text-xs">La légende continue !</button>
    `;
    document.body.appendChild(toast);
}


        // ==========================================
        // 4. TOOLTIP
        // ==========================================
globalThis.globalTooltip = null;
function ensureGlobalTooltip() {
    if (!globalThis.globalTooltip) {
        const el = document.createElement('div');
        el.id = 'global-tooltip';
        el.className = 'fixed z-[99999] bg-black/95 border border-[var(--glass-border)] rounded-lg p-5 w-[340px] opacity-0 pointer-events-none transition-opacity shadow-2xl font-retro text-[12px] text-white hidden';
        document.body.appendChild(el);
        globalThis.globalTooltip = el;
    }
    return globalThis.globalTooltip;
}
        globalThis.tooltipTimeout = undefined;

        globalThis.avatarClickCount = 0;
        globalThis.avatarClickTimer = null;

        function toggleTooltip(type, el) {
            if (type === 'avatar') {
                avatarClickCount++;
                if (avatarClickTimer) clearTimeout(avatarClickTimer);
                avatarClickTimer = setTimeout(() => {
                    avatarClickCount = 0;
                }, 1500);

                if (avatarClickCount >= 5) {
                    showToast("Arrête de te regarder dans le miroir, va composer.", "discreet");
                    if (typeof playBleep === 'function') playBleep();
                    avatarClickCount = 0;
                    if (avatarClickTimer) {
                        clearTimeout(avatarClickTimer);
                        avatarClickTimer = null;
                    }
                }
            }

            if (isMobile) {
                if (globalTooltip.dataset.type === type && !globalTooltip.classList.contains('hidden')) hideTooltip();
                else showTooltip(type, el);
            }
        }
        function showTooltip(type, el) {
            clearTimeout(tooltipTimeout);
            globalTooltip.dataset.type = type;
            const rect = el.getBoundingClientRect();
            
            const tooltipWidth = 340; // Synchronisé avec la classe CSS w-[340px]
            let leftPos = rect.left + (rect.width / 2) - (tooltipWidth / 2);
            
            // Empêche le tooltip de déborder de l'écran avec une marge de sécurité
            const margin = 12;
            leftPos = Math.max(margin, Math.min(window.innerWidth - tooltipWidth - margin, leftPos));

            

            globalTooltip.style.left = `${leftPos}px`;
            globalTooltip.style.transform = 'none';
            globalTooltip.style.top = `${rect.bottom + 8}px`;

            globalTooltip.classList.remove('hidden');
            void globalTooltip.offsetWidth;
            globalTooltip.style.opacity = '1';
                    if (type === 'avatar') {
            const rank = getCurrentRank();
            const lData = calculateLevelData();
            
            const statsBreakdown = `
                <div class="w-full space-y-2 mt-4 border-t border-white/10 pt-3">
                    <div class="flex flex-col gap-1">
                        <div class="flex justify-between text-[10px] uppercase tracking-tighter text-gray-500 font-bold">
                            <span>Banque Mastery</span>
                            <span class="text-white">${Math.floor(lData.breakdown.money)}%</span>
                        </div>
                        <div class="h-1 w-full bg-black rounded-full overflow-hidden">
                            <div class="h-full bg-[var(--retro-green)]" style="width: ${lData.breakdown.money}%"></div>
                        </div>
                    </div>
                    <div class="flex flex-col gap-1">
                        <div class="flex justify-between text-[10px] uppercase tracking-tighter text-gray-500 font-bold">
                            <span>Reputation Mastery</span>
                            <span class="text-white">${Math.floor(lData.breakdown.rep)}%</span>
                        </div>
                        <div class="h-1 w-full bg-black rounded-full overflow-hidden">
                            <div class="h-full bg-[var(--retro-orange)]" style="width: ${lData.breakdown.rep}%"></div>
                        </div>
                    </div>
                    <div class="flex flex-col gap-1">
                        <div class="flex justify-between text-[10px] uppercase tracking-tighter text-gray-500 font-bold">
                            <span>Fanbase Mastery</span>
                            <span class="text-white">${Math.floor(lData.breakdown.foll)}%</span>
                        </div>
                        <div class="h-1 w-full bg-black rounded-full overflow-hidden">
                            <div class="h-full bg-[var(--accent)]" style="width: ${lData.breakdown.foll}%"></div>
                        </div>
                    </div>
                </div>
                <div class="w-full mt-4 bg-[var(--accent)]/10 border border-[var(--accent)]/20 p-2 rounded text-center">
                    <span class="text-[12px] text-[var(--accent)] font-bold tracking-widest">GLOBAL PROGRESS: ${Math.floor(lData.avg)}%</span>
                </div>
            `;

            globalTooltip.innerHTML = `
                <div class="flex flex-col items-center py-2 px-1">
                    
                    <div class="relative w-24 h-28 flex items-center justify-center mb-3">
                        <div class="absolute inset-0 blur-xl opacity-60 rounded-full" style="background-color: ${rank.glowColor};"></div>
                        
                        <div class="absolute inset-0 bg-gradient-to-b ${rank.borderColor}" style="clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);"></div>
                        
                        <div class="absolute inset-[3px] bg-gradient-to-b ${rank.color}" style="clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);"></div>
                        
                        <div class="relative z-10 text-5xl filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)] transform -translate-y-1">${rank.icon}</div>
                        
                        <div class="absolute -bottom-2 bg-black border border-white/20 text-white text-[12px] px-4 py-1 rounded-full font-retro font-bold tracking-widest shadow-lg z-20 border-b-2 border-b-[var(--accent)]">LVL ${lData.level}</div>
                    </div>

                    <div class="text-[18px] font-retro font-bold text-white tracking-widest uppercase mt-2 drop-shadow-md text-center" style="color: ${rank.glowColor}; text-shadow: 0 0 10px ${rank.glowColor}55;">
                        ${rank.name}
                    </div>
                    
                    ${statsBreakdown}
                </div>
            `;
        }
            if (type === 'money') {
                let html = '<div class="text-[var(--retro-green)] mb-3 border-b border-white/10 pb-2 font-bold text-xs uppercase tracking-widest">Compte en Banque</div><div class="space-y-3">';
                if (state.history.money.length === 0) html += '<div class="text-gray-500">No transactions.</div>';
                state.history.money.forEach(m => {
                    const color = m.amt >= 0 ? 'text-[var(--retro-green)]' : 'text-[var(--retro-red)]';
                    const sign = m.amt >= 0 ? '+' : '';
                    html += `<div class="flex justify-between items-center"><span class="text-gray-400 truncate pr-2 text-[10px]">${m.txt}</span><span class="${color} font-bold text-xs">${sign}$${Math.abs(m.amt)}</span></div>`;
                });
                html += '</div>';
                globalTooltip.innerHTML = html;
            }
            if (type === 'rep') {
                const streams = Math.floor(state.rep * 40 + Math.random() * 10);
                globalTooltip.innerHTML = `<div class="text-[var(--retro-orange)] mb-3 border-b border-white/10 pb-2 font-bold text-xs uppercase tracking-widest">Reputation - Streaming Data</div>
                    <div class="text-gray-300 text-[11px]">Estimated Daily Streams:</div>
                    <div class="text-2xl text-white mt-2 font-bold tracking-wider">~${formatNum(streams)} <span class="text-[9px] text-[var(--retro-orange)]">PLAYS</span></div>`;
            }
            if (type === 'fol') {
                let html = '<div class="text-[var(--accent)] mb-3 border-b border-white/10 pb-2 font-bold text-xs uppercase tracking-widest">Follow recents</div><div class="space-y-3">';
                if (state.history.followers.length === 0) html += '<div class="text-gray-500">No recent activity.</div>';
                state.history.followers.forEach(f => { html += `<div class="text-gray-200 flex items-center gap-3 text-[11px]"><span class="w-1.5 h-1.5 rounded-full bg-[var(--accent)] shadow-[0_0_5px_var(--accent)]"></span> @${f}</div>`; });
                html += '</div>';
                globalTooltip.innerHTML = html;
            }
            if (type === 'hype') {
                const boost = Math.floor((state.hype / 100) * 20);
                globalTooltip.innerHTML = `<div class="text-pink-500 mb-3 border-b border-white/10 pb-2 font-bold text-xs uppercase tracking-widest">Hype Meter</div>
                    <div class="text-gray-300 text-[11px]">Hype actuelle : <b>${Math.floor(state.hype)}%</b></div>
                    <div class="text-gray-300 text-[11px] mt-1">Multiplicateur de gains : <span class="text-pink-400 font-bold">+${boost}%</span></div>
                    <div class="text-gray-500 text-[9px] mt-2">La hype diminue lentement avec le temps. Publie des stories et sors des Bangers pour la recharger !</div>`;
            }
            if (type === 'streak') {
                globalTooltip.innerHTML = `<div class="text-amber-500 mb-3 border-b border-white/10 pb-2 font-bold text-xs uppercase tracking-widest">Daily Streak</div>
                    <div class="text-gray-300 text-[11px]">Jours consécutifs joués : <b>${state.streakDays || 0}</b></div>
                    <div class="text-gray-300 text-[11px] mt-1">Record de Streak : <b>${state.maxStreak || 0} jours</b></div>
                    <div class="text-gray-500 text-[9px] mt-2">Connecte-toi chaque jour in-game pour conserver ton multiplicateur et décrocher des bonus exclusifs !</div>`;
            }
        }

        function hideTooltip() {
        globalTooltip.style.opacity = '0';
        clearTimeout(tooltipTimeout);
        tooltipTimeout = setTimeout(() => {
            globalTooltip.classList.add('hidden');
            globalTooltip.dataset.type = '';
        }, 300);
    }

function initTooltipListeners() {
    ensureGlobalTooltip();
        document.addEventListener('touchstart', (e) => {
            if (isMobile && !e.target.closest('#hud') && !e.target.closest('#global-tooltip')) hideTooltip();
        }, { passive: true });
}

    // ==========================================
    // 5. CPU GRAPH OPTIMISÉ (60 FPS)
    // ==========================================
    const sysCanvasUI = document.getElementById('sys-canvas');
    const sysCtxUI = sysCanvasUI ? sysCanvasUI.getContext('2d') : null;
    globalThis.cpuDataUI = Array(50).fill(50);
    globalThis.cpuGraphStarted = false;
    globalThis.lastCpuTick = 0;

    function drawSysGraphUI(timestamp) {
        if (!cpuGraphStarted) return;
        
        // FIX: La request doit être en haut pour ne pas briser la boucle si le canvas est caché
        requestAnimationFrame(drawSysGraphUI);

        const canvas = document.getElementById('sys-canvas');
        if (!canvas || !canvas.parentElement) return;

        const rect = canvas.parentElement.getBoundingClientRect();
        // Sécurité si caché ou taille invalide (Mobile caché temporairement)
        if (rect.width < 10 || rect.height < 10) return;

        const dpr = window.devicePixelRatio || 1;
        const targetWidth = Math.floor(rect.width * dpr);
        const targetHeight = Math.floor(rect.height * dpr);

        // Redimensionnement intelligent : uniquement si la taille change
        if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
            canvas.width = targetWidth;
            canvas.height = targetHeight;
            canvas.style.width = rect.width + 'px';
            canvas.style.height = rect.height + 'px';
        }

        // 3. Vitesse de défilement liée à l'accélération du temps (sommeil/repos)
        const timeSpeed = (state.isSleeping || state.isSitting) ? 2.5 : 1.0;
        const tickDelay = 80 / timeSpeed;

        if (timestamp - lastCpuTick > tickDelay) {
            let last = cpuDataUI[cpuDataUI.length - 1];
            
            // 1. Amplitude liée à l'énergie : basse = plat, haute = nerveux
            const energyRatio = Math.max(0.05, state.energy / 100);
            const agitation = (Math.random() * 50 - 25) * energyRatio;
            
            // 2. Niveau de base (hauteur) lié à la réputation et au multiplicateur
            const baseline = Math.min(85, 20 + (state.rep * 0.3) + ((state.multiplier - 1) * 15));
            
            let next = last + agitation;
            // Retour élastique vers la ligne de base
            next += (baseline - next) * 0.2;

            if (state.isExporting) next = 95 + Math.random() * 5;
            
            next = Math.max(5, Math.min(100, next));
            
            cpuDataUI.shift();
            cpuDataUI.push(next);
            lastCpuTick = timestamp;
        }

        const ctx = canvas.getContext('2d');
        ctx.resetTransform();
        ctx.scale(dpr, dpr);
        ctx.clearRect(0, 0, rect.width, rect.height);

        // Tracé du graphe
        ctx.beginPath();
        ctx.moveTo(0, rect.height - (cpuDataUI[0] / 100 * rect.height));

        const step = rect.width / (cpuDataUI.length - 1);
        for (let i = 1; i < cpuDataUI.length; i++) {
            // Curve au lieu de lignes dures si on voulait, mais les lignes droites font plus "monitoring"
            ctx.lineTo(i * step, rect.height - (cpuDataUI[i] / 100 * rect.height));
        }

        ctx.strokeStyle = 'rgba(52, 211, 153, 0.95)';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.lineTo(rect.width, rect.height);
        ctx.lineTo(0, rect.height);
        ctx.closePath();
        ctx.fillStyle = 'rgba(52, 211, 153, 0.16)';
        ctx.fill();
    }
        
        // ==========================================
        // 6. VU METER
        // ==========================================
        function simulateVuMeter(level) {
            for (let i = 1; i <= 14; i++) {
                const led = document.getElementById(`vu-led-${i}`);
                if (!led) continue;
                led.className = 'vu-led';
                if (i <= level) {
                    if (i > 12) led.classList.add('on-red');
                    else if (i > 9) led.classList.add('on-yellow');
                    else led.classList.add('on-green');
                }
            }
            setTimeout(() => {
                for (let i = 1; i <= 14; i++) {
                    const led = document.getElementById(`vu-led-${i}`);
                    if (led) led.className = 'vu-led';
                }
            }, 80);
        }


        // ==========================================
        // SYSTÈME D'ACHIEVEMENTS PRO (VISIBLE PARTOUT)
        // ==========================================
                function normalizeAchievementState() {
            if (!state) return;
            const existing = (state?.achievements && typeof state.achievements === 'object') ? state.achievements : {};
            const normalized = {};

            Object.keys(DEFAULT_STATE?.achievements || {}).forEach(id => {
                const template = DEFAULT_STATE.achievements[id] || {};
                const technical = ACHIEVEMENT_DETAILS?.[id] || {};
                const saved = existing[id] || {};

                const wasRewardClaimed = typeof saved === 'object' ? Boolean(saved.rewardClaimed) : false;
                normalized[id] = { 
                    ...template, 
                    ...technical, 
                    ...(typeof saved === 'object' ? saved : {}), 
                    unlocked: Boolean(saved?.unlocked || saved === true),
                    rewardClaimed: wasRewardClaimed
                };
            });
            state.achievements = normalized;
        }

        function getAchievementOrder() {
            const baseIds = Object.keys(DEFAULT_STATE.achievements);
            const extraIds = Object.keys(state.achievements || {}).filter(id => !baseIds.includes(id));
            return [...baseIds, ...extraIds];
        }

        function getNestedStateValue(path) {
            if (!path) return 0;
            return path.split('.').reduce((obj, key) => (obj && obj[key] !== undefined ? obj[key] : undefined), state);
        }

        function escapeHTML(value) {
            return String(value ?? '').replace(/[&<>"']/g, char => ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;'
            })[char]);
        }

        function getInGameTimeLabel(mins = state.timeMins) {
            const total = parseInt(mins, 10) || 0;
            const h = Math.floor(total / 60);
            const m = total % 60;
            return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
        }

        function stampAchievementUnlock(achievement) {
            if (!achievement.unlockedDay) achievement.unlockedDay = parseInt(state.day, 10) || 1;
            if (!achievement.unlockedTime) achievement.unlockedTime = getInGameTimeLabel();
        }

        function getAchievementProgress(id, achievement) {
            const detail = ACHIEVEMENT_DETAILS[id] || achievement || {};
            const target = Math.max(1, parseInt(detail.target || achievement.target || 1, 10));
            let current = detail.progressPath ? Number(getNestedStateValue(detail.progressPath)) || 0 : (achievement.unlocked ? target : 0);

            if (achievement.unlocked) current = Math.max(current, target);
            const capped = Math.max(0, Math.min(current, target));

            return {
                current: capped,
                target,
                unit: detail.unit || achievement.unit || 'step',
                percent: Math.round((capped / target) * 100),
                progressive: Boolean(detail.progressPath && target > 1)
            };
        }

        function getAchievementEntries() {
            normalizeAchievementState();
            return getAchievementOrder().map(id => ({
                id,
                ...(state.achievements[id] || {}),
                detail: ACHIEVEMENT_DETAILS[id] || {}
            }));
        }

        function migrateCompletedAchievementProgress() {
            if (!state) return; // Sécurité anti-crash
            normalizeAchievementState();
            
            Object.keys(state.achievements || {}).forEach(id => {
                const achievement = state.achievements[id];
                const detail = ACHIEVEMENT_DETAILS?.[id] || {};
                
                if (!achievement || achievement.unlocked || !detail.progressPath) return;

                const progress = getAchievementProgress(id, achievement);
                if (progress?.current >= progress?.target) {
                    achievement.unlocked = true;
                    achievement.legacyUnlocked = true;
                }
            });
        }

        function getAchievementUnlockLabel(achievement) {
            if (!achievement.unlocked) return 'LOCKED';
            if (achievement.legacyUnlocked && !achievement.unlockedDay) return 'Débloqué avant la Beta';
            if (achievement.unlockedDay) return `JOUR ${achievement.unlockedDay}${achievement.unlockedTime ? ' · ' + achievement.unlockedTime : ''}`;
            return 'Débloqué avant v16';
        }

        function initAchievementsUI() {
            const categoryHost = document.getElementById('achievement-category-tabs');
            const filterHost = document.getElementById('achievement-filter-tabs');

            if (filterHost) {
                filterHost.innerHTML = ACHIEVEMENT_FILTERS.map(filter => `
                    <button id="achievement-filter-${filter.id}" class="achievement-filter-btn rounded-lg px-2 py-3" onclick="setAchievementFilter('${filter.id}')">${filter.label}</button>
                `).join('');
            }

            renderAchievementsPanel();
        }



        function switchSettingsPanel(panel = 'audio', shouldPlay = true) {
            activeSettingsPanel = panel === 'achievements' ? 'achievements' : 'audio';

            const audioPanel = document.getElementById('settings-audio-panel');
            const achievementsPanel = document.getElementById('settings-achievements-panel');
            const audioTab = document.getElementById('settings-tab-audio');
            const achievementsTab = document.getElementById('settings-tab-achievements');

            if (audioPanel) audioPanel.classList.toggle('hidden', activeSettingsPanel !== 'audio');
            if (achievementsPanel) {
                achievementsPanel.classList.toggle('hidden', activeSettingsPanel !== 'achievements');
                achievementsPanel.classList.toggle('flex', activeSettingsPanel === 'achievements');
            }
            
            if (audioTab) audioTab.classList.toggle('active', activeSettingsPanel === 'audio');
            if (achievementsTab) achievementsTab.classList.toggle('active', activeSettingsPanel === 'achievements');

            if (activeSettingsPanel === 'achievements') renderAchievementsPanel();
            if (shouldPlay) playBleep();
        }

        function setAchievementCategory(category) {
            activeAchievementCategory = ACHIEVEMENT_CATEGORIES.some(c => c.id === category) ? category : 'music';
            renderAchievementsPanel();
            playBleep();
        }

        function setAchievementFilter(filter) {
            activeAchievementFilter = ACHIEVEMENT_FILTERS.some(f => f.id === filter) ? filter : 'all';
            renderAchievementsPanel();
            playBleep();
        }

        function refreshAchievementsPanel() {
            const panel = document.getElementById('settings-achievements-panel');
            if (panel && !panel.classList.contains('hidden')) renderAchievementsPanel();
        }

        function renderAchievementsPanel() {
            const grid = document.getElementById('achievements-grid');
            if (!grid) return;

            const entries = getAchievementEntries();
            const unlockedCount = entries.filter(a => a.unlocked).length;
            const totalCount = entries.length;
            const globalPercent = totalCount ? Math.round((unlockedCount / totalCount) * 100) : 0;

            const unlockedEl = document.getElementById('achievements-unlocked-count');
            const totalEl    = document.getElementById('achievements-total-count');
            const percentEl  = document.getElementById('achievements-global-percent');
            const barEl      = document.getElementById('achievements-global-bar');

            if (unlockedEl) unlockedEl.innerText = unlockedCount;
            if (totalEl)    totalEl.innerText    = totalCount;
            if (percentEl)  percentEl.innerText  = `${globalPercent}%`;
            if (barEl)      barEl.style.width    = `${globalPercent}%`;

            // Met à jour les boutons filtres
            ACHIEVEMENT_FILTERS.forEach(filter => {
                const btn = document.getElementById(`achievement-filter-${filter.id}`);
                if (btn) btn.classList.toggle('active', filter.id === activeAchievementFilter);
            });

            grid.innerHTML = '';

            ACHIEVEMENT_CATEGORIES.forEach(cat => {
                let catEntries = entries.filter(a => (a.category || 'studio') === cat.id);

                // Applique le filtre actif
                if (activeAchievementFilter === 'unlocked') catEntries = catEntries.filter(a => a.unlocked);
                else if (activeAchievementFilter === 'locked') catEntries = catEntries.filter(a => !a.unlocked);
                else if (activeAchievementFilter === 'secret') catEntries = catEntries.filter(a => Boolean(a.secret));

                if (!catEntries.length) return;

                const unlockedInCat = catEntries.filter(a => a.unlocked).length;

                const section = document.createElement('div');
                section.className = 'flex flex-col gap-2';

                // En-tête de catégorie
                section.innerHTML = `
                    <div class="flex items-center justify-between px-1">
                        <span class="font-retro text-[15px] text-[var(--text-muted)] uppercase tracking-widest font-bold">${escapeHTML(cat.label)}</span>
                        <span class="font-retro text-[15px] text-[var(--accent)] font-bold">${unlockedInCat}/${catEntries.length}</span>
                    </div>`;

                // Carrousel horizontal
                const strip = document.createElement('div');
                strip.className = 'achievement-category-strip';

                catEntries.forEach(achievement => {
                    const isSecretLocked = achievement.secret && !achievement.unlocked;
                    const progress = getAchievementProgress(achievement.id, achievement);
                    const title    = isSecretLocked ? '???' : (achievement.name || achievement.id);
                    const desc     = isSecretLocked ? 'Succès secret — continue à jouer' : (achievement.description || '');
                    const icon     = isSecretLocked ? '🔒' : (achievement.icon || '🏆');
                    const hasReward = achievement.reward && Object.keys(achievement.reward).length > 0;
                    let stateClass = achievement.unlocked ? 'unlocked' : (isSecretLocked ? 'locked secret-locked' : 'locked');
                    if (achievement.unlocked && !achievement.rewardClaimed && hasReward) {
                        stateClass += ' unclaimed';
                    }
                    const unlockLabel = getAchievementUnlockLabel(achievement);

                                    const card = document.createElement('div');
                card.className = `achievement-card ${stateClass}`;

                const progressHTML = progress.progressive && !isSecretLocked ? `
                    <div class="mt-2">
                        <div class="flex justify-between font-retro text-[11px] text-[var(--text-muted)] mb-1 tracking-widest">
                            <span>${formatNum(progress.current)}/${formatNum(progress.target)} ${escapeHTML(progress.unit)}</span>
                            <span>${progress.percent}%</span>
                        </div>
                        <div class="achievement-progress-track">
                            <div class="achievement-progress-fill" style="width:${progress.percent}%;"></div>
                        </div>
                    </div>` : '';

                // --- GÉNÉRATION DU BOUTON DE RÉCOMPENSE ---
                const rewardInfo = achievement.reward || {};
                let rewardText = [];
                if (rewardInfo.money) rewardText.push(`+$${formatNum(rewardInfo.money)}`);
                if (rewardInfo.rep) rewardText.push(`+${rewardInfo.rep} REP`);
                if (rewardInfo.followers) rewardText.push(`+${formatNum(rewardInfo.followers)} FOL`);
                const rewardString = rewardText.join(' | ');

                let rewardUI = '';
                if (achievement.unlocked) {
                    if (!achievement.rewardClaimed) {
                        // Bouton pour récupérer le loot
                        rewardUI = `
                                                <button class="mt-3 w-full mt-auto bg-[var(--accent)] text-white hover:bg-[var(--retro-green)] hover:text-black transition-colors py-3 rounded-lg font-retro text-[11px] font-bold tracking-widest shadow-lg" 
                                onclick="claimAchievementReward('${achievement.id}', event)">
                            CLAIM: ${rewardString}
                        </button>`;
                    } else {
                        // Déjà récupéré
                        rewardUI = `<div class="mt-3 w-full text-center py-3 text-[var(--retro-green)] font-retro font-bold text-[11px] tracking-widest border border-[var(--retro-green)]/30 rounded-lg">CLAIMED ✓</div>`;
                    }
                } else if (!isSecretLocked && rewardString) {
                    // Montre la récompense pour motiver le joueur
                    rewardUI = `<div class="mt-3 w-full text-center py-3 text-gray-500 font-retro text-[11px] tracking-widest border border-white/5 rounded-lg">REWARD: ${rewardString}</div>`;
                }
                // ------------------------------------------

                card.innerHTML = `
                    <div class="flex items-start gap-3 mb-2">
                        <div class="achievement-icon-wrap">${escapeHTML(icon)}</div>
                        <div class="flex-1 min-w-0">
                            <div class="font-retro text-[15px] text-white font-bold tracking-wide leading-tight truncate">${escapeHTML(title)}</div>
                            <div class="text-[12px] text-[var(--text-muted)] mt-1.5 leading-snug line-clamp-3 ${isSecretLocked ? 'blur-[2px]' : ''}">${escapeHTML(desc)}</div>
                        </div>
                    </div>
                    ${progressHTML}
                    ${rewardUI}
                    <div class="mt-auto pt-2 border-t border-white/[0.06] flex items-center justify-between font-retro text-[9px] text-[var(--text-muted)] tracking-wider">
                        <span class="${achievement.unlocked ? 'text-[var(--accent)]' : ''}">${achievement.unlocked ? '✓ UNLOCKED' : 'LOCKED'}</span>
                        <span class="truncate ml-2 text-right opacity-60">${escapeHTML(unlockLabel)}</span>
                    </div>`;

                strip.appendChild(card);
                });

                section.appendChild(strip);
                grid.appendChild(section);
            });
        }

        globalThis.achievementQueue = [];
        globalThis.isAchievementShowing = false;

        function unlockAchievement(title, desc, icon = '🏆') {
            achievementQueue.push({ title, desc, icon });
            processAchievementQueue();
        }

        function processAchievementQueue() {
            if (isAchievementShowing || achievementQueue.length === 0) return;
            isAchievementShowing = true;
            const data = achievementQueue.shift();
            const popup = document.getElementById('achievement-popup');
            if (!popup) { isAchievementShowing = false; return; }
            
            document.getElementById('achievement-icon').innerText = data.icon;
            document.getElementById('achievement-title').innerText = data.title;
            document.getElementById('achievement-desc').innerText = data.desc;

            // Apparition (Slide down)
            popup.style.top = '24px';
            popup.classList.add('animate-achievement');
            playSuccess();

            setTimeout(() => {
                // Disparition (Slide up)
                popup.style.top = '-150px';
                popup.classList.remove('animate-achievement');
                setTimeout(() => {
                    isAchievementShowing = false;
                    processAchievementQueue();
                }, 600); // Délai de transition
            }, 5000);
        }

        function checkAchievement(id, condition) {
             if (window.isBooting) return; // Évite l'avalanche au démarrage
            if (!state.achievements[id] || state.achievements[id].unlocked) return;
            if (condition()) {
                state.achievements[id].unlocked = true;
                const a = state.achievements[id];
                stampAchievementUnlock(a);
                unlockAchievement(a.name || id, a.description, a.icon || '🏆');
                refreshAchievementsPanel();
                saveGame();
            }
        }

        // === FONCTION DE RÉCUPÉRATION DES RÉCOMPENSES ===
    function claimAchievementReward(id, event) {
        if (!state.achievements[id] || !state.achievements[id].unlocked || state.achievements[id].rewardClaimed) return;
        
        const detail = ACHIEVEMENT_DETAILS[id];
        if (!detail || !detail.reward) return;

        const r = detail.reward;
        let toastMsg = "Récompense obtenue :";
        
        // On récupère la boîte (coordonnées écran) du bouton qui a été cliqué
        const clickRect = (event && event.target) ? event.target.getBoundingClientRect() : null;
        
        if (r.money) {
            // On balance les coordonnées à logMoney pour forcer l'animation sur le bouton
            logMoney(r.money, `Reward: ${state.achievements[id].name || id}`, clickRect);
            toastMsg += `\n+$${r.money}`;
            if (typeof playCashSound === 'function') playCashSound();
        }
        if (r.rep) {
            state.rep += r.rep;
            toastMsg += `\n+${r.rep} REP`;
            if (!r.money) playSuccess();
        }
        if (r.followers) {
            logFollower(r.followers);
            toastMsg += `\n+${r.followers} Fans`;
            if (!r.money && !r.rep) playSuccess();
        }

        // Marque le succès comme réclamé
        state.achievements[id].rewardClaimed = true;
        
        showToast(toastMsg, "success");
        updateHUD();
        refreshAchievementsPanel(); // Rafraîchit l'UI pour changer le bouton en "CLAIMED ✓"
        fireConfetti('achievement');
        saveGame();
    }



        globalThis.rainAnimationId = null;
        function initCinematicRain() {
            const canvas = document.getElementById('cinematic-rain-canvas');
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;

            const drops = [];
            const dropCount = 110;

            for (let i = 0; i < dropCount; i++) {
                drops.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    len: Math.random() * 18 + 12,
                    speed: Math.random() * 10 + 14,
                    opacity: Math.random() * 0.45 + 0.25
                });
            }

            function drawRain() {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.strokeStyle = 'rgba(186, 230, 253, 0.7)';
                ctx.lineWidth = 1.2;
                ctx.lineCap = 'round';

                for (let d of drops) {
                    ctx.beginPath();
                    ctx.globalAlpha = d.opacity;
                    ctx.moveTo(d.x, d.y);
                    ctx.lineTo(d.x - 2, d.y + d.len);
                    ctx.stroke();

                    d.y += d.speed;
                    d.x -= 1.2;

                    if (d.y > canvas.height) {
                        d.y = -20;
                        d.x = Math.random() * (canvas.width + 100);
                    }
                }

                rainAnimationId = requestAnimationFrame(drawRain);
            }

            if (rainAnimationId) cancelAnimationFrame(rainAnimationId);
            drawRain();
        }

        function stopCinematicRain() {
            if (rainAnimationId) {
                cancelAnimationFrame(rainAnimationId);
                rainAnimationId = null;
            }
        }

        // --- GESTIONNAIRE DE PARALLAXE SOURIS / GYROSCOPE ---
        globalThis.isCinematicParallaxActive = false;
        globalThis.targetParallaxX = 0;
        globalThis.targetParallaxY = 0;
        globalThis.currentParallaxX = 0;
        globalThis.currentParallaxY = 0;

function initCinematicsListeners() {
        window.addEventListener('mousemove', (e) => {
            if (!isCinematicParallaxActive) return;
            const centerX = window.innerWidth / 2;
            const centerY = window.innerHeight / 2;
            targetParallaxX = (e.clientX - centerX) / centerX;
            targetParallaxY = (e.clientY - centerY) / centerY;
        }, { passive: true });
}

        function updateParallaxLoop() {
            if (!isCinematicParallaxActive) return;

            currentParallaxX += (targetParallaxX - currentParallaxX) * 0.08;
            currentParallaxY += (targetParallaxY - currentParallaxY) * 0.08;

            const sky = document.getElementById('layer-sky');
            const cityFar = document.getElementById('layer-city-far');
            const cityMid = document.getElementById('layer-city-mid');

            if (sky) sky.style.transform = `translate3d(${currentParallaxX * -12}px, ${currentParallaxY * -6}px, 0)`;
            if (cityFar) cityFar.style.transform = `translate3d(${currentParallaxX * -28}px, ${currentParallaxY * -12}px, 0)`;
            if (cityMid) cityMid.style.transform = `translate3d(${currentParallaxX * -55}px, ${currentParallaxY * -20}px, 0)`;

            requestAnimationFrame(updateParallaxLoop);
        }

        // --- CITATIONS INSPIRANTES POUR L'ESCAPE ---
        const ESCAPE_QUOTES = [
            "\"Le silence entre les notes compte tout autant que les notes elles-mêmes.\" — Miles Davis",
            "\"Prendre du recul, c'est donner à ton beat l'espace pour respirer.\"",
            "\"L'inspiration frappe souvent quand la machine s'éteint et que l'esprit s'évade.\"",
            "\"Chaque goutte de pluie a son propre BPM. Écoute le rythme du monde.\"",
            "\"Les plus grands bangers naissent après une bouffée d'air frais.\""
        ];

        globalThis.currentActiveCinematicMode = null;
        globalThis.previousUIState = { roomVisible: false, pcVisible: false, prVisible: false };

        // --- CONTRÔLEUR PRINCIPAL DES CINÉMATIQUES ---
        window.triggerCinematic = function(mode = 'escape', options = {}) {
            if (mode === 'escape' && typeof window.exitFpsPointerLock === 'function') window.exitFpsPointerLock();
            const theater = document.getElementById('cinematic-theater');
            const barTop = document.getElementById('cinematic-bar-top');
            const barBottom = document.getElementById('cinematic-bar-bottom');
            const escapeScene = document.getElementById('cinematic-escape-scene');
            const rewardScene = document.getElementById('cinematic-reward-scene');

            if (!theater) return;
            currentActiveCinematicMode = mode;

            // Sauvegarde de l'état UI précédent
            const roomUI = document.getElementById('room-ui');
            const pcUI = document.getElementById('pc-ui-layer');
            const prUI = document.getElementById('standalone-pianoroll');

            previousUIState.roomVisible = roomUI && roomUI.style.display !== 'none';
            previousUIState.pcVisible = pcUI && pcUI.style.display === 'flex';
            previousUIState.prVisible = prUI && !prUI.classList.contains('hidden');

            // 1. Activation du conteneur Cinéma
            theater.classList.remove('pointer-events-none');
            theater.classList.add('pointer-events-auto');
            theater.style.opacity = '1';

            if (mode === 'escape') {
                if (escapeScene) escapeScene.classList.remove('hidden');
                if (rewardScene) rewardScene.classList.add('hidden');

                // Citation aléatoire
                const quoteEl = document.getElementById('cinematic-quote');
                if (quoteEl) {
                    quoteEl.innerText = ESCAPE_QUOTES[Math.floor(Math.random() * ESCAPE_QUOTES.length)];
                }

                // Anime.js V4 : Fermeture élastique des Bandes Noires Cinéma (Letterbox 12vh)
                animate(barTop, {
                    height: ['0px', '12vh'],
                    duration: 800,
                    ease: spring({ bounce: 0.35 })
                });
                animate(barBottom, {
                    height: ['0px', '12vh'],
                    duration: 800,
                    ease: spring({ bounce: 0.35 })
                });

                // Anime.js V4 (waapi engine) : Fondu et flou cinématographique d'ouverture
                waapi.animate(escapeScene, {
                    opacity: [0, 1],
                    duration: 900,
                    ease: 'outExpo'
                });

                // Démarrage Parallaxe et Pluie
                isCinematicParallaxActive = true;
                initCinematicRain();
                updateParallaxLoop();

                // WEB AUDIO API : Filtre passe-bas étouffé sur la musique du studio + Lancement de l'ambiance apaisante
                if (typeof MusicSystem !== 'undefined' && MusicSystem.setLowPassFrequency) {
                    MusicSystem.setLowPassFrequency(350, 2.0);
                }
                ambientAudioEngine.start();

                // Gain d'inspiration pour avoir pris l'air
                if (typeof state !== 'undefined') {
                    state.inspi = Math.min(100, (Number(state.inspi) || 0) + 20);
                    if (typeof updateHUD === 'function') updateHUD();
                }

            } else if (mode === 'reward') {
                if (rewardScene) rewardScene.classList.remove('hidden');
                if (escapeScene) escapeScene.classList.add('hidden');

                const title = options.title || 'MODULE ACTIVÉ';
                const subtitle = options.subtitle || 'Mode Performance Prêt';
                const tag = options.tag || 'SYSTEM UPGRADE';

                const titleEl = document.getElementById('cinematic-reward-title');
                const subEl = document.getElementById('cinematic-reward-subtitle');
                const tagEl = document.getElementById('cinematic-reward-tag');
                const badge = document.getElementById('cinematic-reward-badge');

                if (titleEl) titleEl.innerText = title;
                if (subEl) subEl.innerText = subtitle;
                if (tagEl) tagEl.innerText = tag;

                // Letterbox flash bars (8vh)
                animate(barTop, {
                    height: ['0px', '9vh'],
                    duration: 500,
                    ease: spring({ bounce: 0.4 })
                });
                animate(barBottom, {
                    height: ['0px', '9vh'],
                    duration: 500,
                    ease: spring({ bounce: 0.4 })
                });

                // Auto-tracé des lignes vectorielles Anime.js V4 (strokeDashoffset)
                animate('#cin-vec-c1', { strokeDashoffset: [1005, 0], duration: 800, ease: 'outExpo' });
                animate('#cin-vec-poly', { strokeDashoffset: [980, 0], duration: 900, ease: 'outExpo' });
                animate('#cin-vec-c2', { strokeDashoffset: [600, 0], duration: 700, ease: 'outExpo' });
                animate('#cin-vec-l1', { strokeDashoffset: [320, 0], duration: 600, ease: 'outExpo' });
                animate('#cin-vec-l2', { strokeDashoffset: [320, 0], duration: 600, ease: 'outExpo' });

                // Badge élastique au centre
                animate(badge, {
                    scale: [0.4, 1.0],
                    opacity: [0, 1],
                    duration: 700,
                    ease: spring({ bounce: 0.45 })
                });

                // Son Sci-Fi Impact / Synth Riser
                try {
                    playTone(180, 'sine', 0.25, 0.08);
                    setTimeout(() => playTone(60, 'triangle', 0.4, 0.12), 120);
                } catch(e) {}

                // Auto-fermeture de la micro-cinématique après 1.4s
                setTimeout(() => {
                    window.closeCinematic(() => {
                        if (typeof options.onComplete === 'function') options.onComplete();
                    });
                }, 1400);
            }
        };

        window.closeCinematic = function(callback) {
            const theater = document.getElementById('cinematic-theater');
            const barTop = document.getElementById('cinematic-bar-top');
            const barBottom = document.getElementById('cinematic-bar-bottom');
            const escapeScene = document.getElementById('cinematic-escape-scene');
            const rewardScene = document.getElementById('cinematic-reward-scene');

            if (!theater) return;

            isCinematicParallaxActive = false;
            stopCinematicRain();
            ambientAudioEngine.stop();

            // WEB AUDIO API : Rétablissement limpide des hautes fréquences
            if (typeof MusicSystem !== 'undefined' && MusicSystem.setLowPassFrequency) {
                MusicSystem.setLowPassFrequency(20000, 1.4);
            }

            // Anime.js V4 : Retrait élastique des bandes noires
            animate(barTop, {
                height: '0px',
                duration: 600,
                ease: 'outExpo'
            });
            animate(barBottom, {
                height: '0px',
                duration: 600,
                ease: 'outExpo'
            });

            // Fondu de sortie de la scène
            waapi.animate(theater, {
                opacity: 0,
                duration: 600,
                ease: 'outExpo',
                onComplete: () => {
                    theater.classList.remove('pointer-events-auto');
                    theater.classList.add('pointer-events-none');
                    if (escapeScene) escapeScene.classList.add('hidden');
                    if (rewardScene) rewardScene.classList.add('hidden');
                    currentActiveCinematicMode = null;

                    if (typeof callback === 'function') callback();
                }
            });
        };

        // Raccourci Échap pour fermer la cinématique à tout moment
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && currentActiveCinematicMode) {
                window.closeCinematic();
            }
        });

        // =========================================================================
        // FEATURE : MICRO-CINÉMATIQUES ALÉATOIRES AVEC L'AVATAR DU JOUEUR (Anime.js V4)
        // =========================================================================

        function getActivePlayerAvatar() {
            try {
                const idx = (typeof state !== 'undefined' && state && state.activeCharacter !== undefined) ? state.activeCharacter : 0;
                if (typeof avatars !== 'undefined' && Array.isArray(avatars) && avatars[idx] && avatars[idx].img) {
                    return { id: avatars[idx].id || 'Beatmaker', img: avatars[idx].img, index: idx };
                }
                if (typeof generateAvatarImage === 'function') {
                    return { id: 'Beatmaker', img: generateAvatarImage(idx), index: idx };
                }
            } catch(e) {}
            return { id: 'Beatmaker', img: '', index: 0 };
        }

        globalThis.isMicroCinematicRunning = false;

        window.triggerRandomCinematic = function(forcedType = null) {
            // Empêche le chevauchement de micro-cinématiques
            if (isMicroCinematicRunning || currentActiveCinematicMode === 'escape') return;

            const avatarData = getActivePlayerAvatar();
            if (!avatarData || !avatarData.img) return;

            isMicroCinematicRunning = true;

            const types = ['glitch_holo', 'neon_radar', 'beat_burst', 'lofi_vinyl'];
            const chosenType = forcedType || types[Math.floor(Math.random() * types.length)];

            // Conteneur dynamique injecté
            const container = document.createElement('div');
            container.className = 'avatar-micro-cinematic fixed inset-0 pointer-events-none z-[999999] overflow-hidden flex items-end justify-center select-none';
            document.body.appendChild(container);

            if (chosenType === 'glitch_holo') {
                // 1. Glitch Cyber & Scanlines (Coin bas-droit)
                container.innerHTML = `
                    <div id="amc-card" class="absolute bottom-8 right-8 flex items-center gap-4 p-4 rounded-2xl bg-black/80 backdrop-blur-xl border border-cyan-400/40 shadow-[0_0_40px_rgba(56,189,248,0.4)] opacity-0 translate-x-32">
                        <div class="relative w-16 h-16 rounded-xl overflow-hidden border border-cyan-400 shadow-[0_0_15px_rgba(56,189,248,0.6)]">
                            <img src="${avatarData.img}" class="w-full h-full object-cover scale-[1.5]" />
                            <div class="absolute inset-0 bg-gradient-to-t from-cyan-500/20 to-transparent pointer-events-none"></div>
                        </div>
                        <div>
                            <div class="flex items-center gap-2">
                                <span class="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                                <span class="text-[9px] font-retro uppercase tracking-[0.25em] text-cyan-400">FLOW STATE ACTIVE</span>
                            </div>
                            <h4 class="text-sm font-retro font-bold text-white tracking-widest uppercase mt-0.5">${avatarData.id}</h4>
                            <p class="text-[10px] text-gray-300 font-sans tracking-wide">Sync Holographique • Focus x1.5</p>
                        </div>
                    </div>
                `;

                try { playTone(880, 'sine', 0.1, 0.04); setTimeout(() => playTone(1320, 'sine', 0.15, 0.03), 80); } catch(e) {}

                const card = container.querySelector('#amc-card');
                animate(card, {
                    translateX: [100, 0],
                    scale: [0.85, 1],
                    opacity: [0, 1],
                    duration: 600,
                    ease: spring({ bounce: 0.5 }),
                    onComplete: () => {
                        setTimeout(() => {
                            animate(card, {
                                translateX: [0, 120],
                                opacity: [1, 0],
                                duration: 500,
                                ease: 'outExpo',
                                onComplete: () => { container.remove(); isMicroCinematicRunning = false; }
                            });
                        }, 1600);
                    }
                });

            } else if (chosenType === 'neon_radar') {
                // 2. Radar Sweep & Boost d'Inspiration (Coin bas-gauche)
                container.innerHTML = `
                    <div id="amc-card" class="absolute bottom-36 left-6 flex items-center gap-4 p-4 rounded-2xl bg-black/80 backdrop-blur-xl border border-emerald-400/40 shadow-[0_0_40px_rgba(52,211,153,0.4)] opacity-0 -translate-x-32">
                        <div class="relative w-16 h-16 rounded-xl overflow-hidden border border-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.6)]">
                            <img src="${avatarData.img}" class="w-full h-full object-cover scale-[1.5]" />
                            <div class="absolute inset-0 border-2 border-emerald-400/50 rounded-xl animate-ping"></div>
                        </div>
                        <div>
                            <div class="flex items-center gap-2">
                                <span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                                <span class="text-[9px] font-retro uppercase tracking-[0.25em] text-emerald-400">+5 INSPi BOOST</span>
                            </div>
                            <h4 class="text-sm font-retro font-bold text-white tracking-widest uppercase mt-0.5">${avatarData.id}</h4>
                            <p class="text-[10px] text-gray-300 font-sans tracking-wide">Détection d'une onde créative !</p>
                        </div>
                    </div>
                `;

                try { playTone(523, 'triangle', 0.12, 0.04); setTimeout(() => playTone(1046, 'sine', 0.2, 0.03), 100); } catch(e) {}
                
                // Boost discret d'inspiration
                if (typeof state !== 'undefined') {
                    state.inspi = Math.min(100, (Number(state.inspi) || 0) + 5);
                    if (typeof updateHUD === 'function') updateHUD();
                }

                const card = container.querySelector('#amc-card');
                animate(card, {
                    translateX: [-100, 0],
                    scale: [0.85, 1],
                    opacity: [0, 1],
                    duration: 600,
                    ease: spring({ bounce: 0.55 }),
                    onComplete: () => {
                        setTimeout(() => {
                            animate(card, {
                                translateX: [0, -120],
                                opacity: [1, 0],
                                duration: 500,
                                ease: 'outExpo',
                                onComplete: () => { container.remove(); isMicroCinematicRunning = false; }
                            });
                        }, 1800);
                    }
                });

            } else if (chosenType === 'beat_burst') {
                // 3. Sub-Bass Burst & Onde de Choc (Centre Bas)
                container.innerHTML = `
                    <div id="amc-card" class="mb-14 flex flex-col items-center p-5 rounded-3xl bg-black/85 backdrop-blur-2xl border border-[var(--accent)] shadow-[0_0_50px_rgba(129,140,248,0.5)] opacity-0 translate-y-24">
                        <div class="relative w-20 h-20 rounded-2xl overflow-hidden border-2 border-[var(--accent)] shadow-[0_0_25px_var(--accent)] mb-3">
                            <img src="${avatarData.img}" class="w-full h-full object-cover scale-[1.6]" />
                        </div>
                        <span class="text-[9px] font-retro uppercase tracking-[0.3em] text-[var(--accent)] font-bold">BPM LOCKED • SONIC SURGE</span>
                        <h3 class="text-base font-retro font-bold text-white tracking-widest uppercase mt-0.5">${avatarData.id}</h3>
                    </div>
                `;

                try { playTone(150, 'sine', 0.2, 0.08); setTimeout(() => playTone(45, 'triangle', 0.35, 0.1), 80); } catch(e) {}

                const card = container.querySelector('#amc-card');
                animate(card, {
                    translateY: [60, 0],
                    scale: [0.6, 1.05, 1.0],
                    opacity: [0, 1],
                    duration: 650,
                    ease: spring({ mass: 1, stiffness: 160, damping: 14 }),
                    onComplete: () => {
                        setTimeout(() => {
                            animate(card, {
                                translateY: [0, 60],
                                scale: [1, 0.8],
                                opacity: [1, 0],
                                duration: 450,
                                ease: 'outExpo',
                                onComplete: () => { container.remove(); isMicroCinematicRunning = false; }
                            });
                        }, 1700);
                    }
                });

            } else if (chosenType === 'lofi_vinyl') {
                // 4. Lo-Fi Aura & Disque Vinyle Doré
                container.innerHTML = `
                    <div id="amc-card" class="absolute bottom-8 right-8 flex items-center gap-4 p-4 rounded-2xl bg-black/80 backdrop-blur-xl border border-amber-400/40 shadow-[0_0_40px_rgba(251,191,36,0.4)] opacity-0 translate-y-24">
                        <div class="relative w-16 h-16 rounded-xl overflow-hidden border border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.6)]">
                            <img src="${avatarData.img}" class="w-full h-full object-cover scale-[1.5]" />
                        </div>
                        <div>
                            <div class="flex items-center gap-2">
                                <span class="text-amber-400 text-xs animate-spin-slow">💿</span>
                                <span class="text-[9px] font-retro uppercase tracking-[0.25em] text-amber-400">VINYL VIBE • CHILL</span>
                            </div>
                            <h4 class="text-sm font-retro font-bold text-white tracking-widest uppercase mt-0.5">${avatarData.id}</h4>
                            <p class="text-[10px] text-gray-300 font-sans tracking-wide">Session Beatmaking Apaisée</p>
                        </div>
                    </div>
                `;

                try { playTone(440, 'sine', 0.15, 0.04); setTimeout(() => playTone(660, 'sine', 0.15, 0.03), 120); } catch(e) {}

                const card = container.querySelector('#amc-card');
                animate(card, {
                    translateY: [60, 0],
                    scale: [0.8, 1],
                    opacity: [0, 1],
                    duration: 650,
                    ease: spring({ bounce: 0.4 }),
                    onComplete: () => {
                        setTimeout(() => {
                            animate(card, {
                                translateY: [0, 50],
                                opacity: [1, 0],
                                duration: 500,
                                ease: 'outExpo',
                                onComplete: () => { container.remove(); isMicroCinematicRunning = false; }
                            });
                        }, 1800);
                    }
                });
            }
        };

        // --- DÉCLENCHEUR PÉRIODIQUE NATUREL (Toutes les 70-90s si joueur actif) ---
function startCinematicRandomLoop() {
        setInterval(() => {
            if (typeof state !== 'undefined' && !state.isSleeping && !state.isEventActive && currentActiveCinematicMode !== 'escape') {
                if (Math.random() < 0.4) {
                    window.triggerRandomCinematic();
                }
            }
        }, 75000);

}

        const ACHIEVEMENT_CATEGORIES = [
            { id: 'music', label: '💿 MUSIQUE' },
            { id: 'dark', label: '🏴‍☠️ DARK SIDE' },
            { id: 'studio', label: '🛋️ STUDIO' },
            { id: 'business', label: '💼 BUSINESS' }
        ];

        const ACHIEVEMENT_FILTERS = [
            { id: 'all', label: 'All' },
            { id: 'unlocked', label: 'Unlocked' },
            { id: 'locked', label: 'Locked' },
            { id: 'secret', label: 'Secret' }
        ];

        const ACHIEVEMENT_DETAILS = {
        first_blood: { category: 'music', progressPath: 'stats.tracks', target: 1, unit: 'track', reward: { money: 500, rep: 10 } },
        certifie_classique: { category: 'music', target: 1, unit: 'review', reward: { money: 2000, rep: 50, followers: 1000 } },
        dans_la_sauce: { category: 'business', progressPath: 'followers', target: 15000, unit: 'followers', reward: { rep: 100, followers: 5000 } },
        productivite_toxique: { category: 'music', progressPath: 'stats.consecutiveFlops', target: 5, unit: 'flops', reward: { money: 100 } },
        alerte_rouge: { category: 'dark', progressPath: 'stats.viruses', target: 1, unit: 'virus', reward: { money: 500 } },
        hacker_man: { category: 'dark', progressPath: 'stats.crackDownloads', target: 5, unit: 'downloads', reward: { money: 1000 } },
        cancel_culture: { category: 'business', target: 1, unit: 'event', reward: { rep: 50 } },
        avocat_du_diable: { category: 'business', target: 1, unit: 'case', reward: { money: 2500, rep: 30 } },
        let_him_cook: { category: 'studio', progressPath: 'stats.sofaChills', target: 10, unit: 'chills', reward: { rep: 15 } },
        sellout: { category: 'business', target: 1, unit: 'deal', reward: { money: 5000 } },
        inge_son_certifie: { category: 'business', progressPath: 'plugins', target: 1, unit: 'plugin', reward: { rep: 20, followers: 500 } },
        prix_de_la_paix: { category: 'business', target: 1, unit: 'deal', reward: { rep: 40 } },
        toujours_dans_le_rouge: { category: 'studio', target: 1, unit: 'export', secret: true, reward: { money: 300, rep: 5 } },
        lumiere_divine: { category: 'studio', progressPath: 'stats.lampToggles', target: 20, unit: 'switches', secret: true, reward: { money: 50 } },
        vrai_rat_de_studio: { category: 'studio', progressPath: 'stats.awakeDays', target: 3, unit: 'days', secret: true, reward: { money: 1000, rep: 20 } },
        zero_energie_zero_probleme: { category: 'studio', target: 1, unit: 'export', secret: true, reward: { money: 100, rep: 10 } },
        echo_sellout: { category: 'business', target: 1, unit: 'choice', secret: true, reward: { money: 1500 } },
        echo_purist: { category: 'music', target: 1, unit: 'choice', secret: true, reward: { rep: 25 } },
        echo_scammed: { category: 'business', target: 1, unit: 'sub', secret: true, reward: { followers: 500 } },
        bac_a_sable: { category: 'studio', progressPath: 'ownedSamples.length', target: 10, unit: 'samples', reward: { rep: 50, money: 1000 } },
        crate_digger: { category: 'music', target: 1, unit: 'sample', secret: true, reward: { rep: 100, followers: 2000 } },
        cleared: { category: 'business', progressPath: 'clearedSamples.length', target: 3, unit: 'samples', reward: { money: 3000 } },
        ne_me_quitte_pas: { category: 'music', target: 1, unit: 'sample', secret: true, reward: { followers: 5000, rep: 150 } },
        digging_initiation: { category: 'studio', progressPath: 'ownedSamples.length', target: 1, unit: 'sample', reward: { money: 200, rep: 5 } }
    };

globalThis.easterEgg3AM = false;
globalThis.selectedAvatarIndex = 2;
globalThis.currentDawGenre = 'drill';
globalThis.currentDawVoice = 'm';
globalThis.activeSettingsPanel = 'audio';
globalThis.activeAchievementCategory = 'music';
globalThis.activeAchievementFilter = 'all';

        // ==========================================
        // 10. HELPERS
        // ==========================================
        function formatNum(n) {
            n = Number(n);
            if (isNaN(n)) return '0';
            if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
            if (n >= 1_000)     return (n / 1_000).toFixed(1) + 'K';
            return Math.floor(n).toString();
        }

        function getTotalMins() {
            const d = parseInt(state.day, 10) || 1;
            const t = parseInt(state.timeMins, 10) || 0;
            return (d * 1440) + t;
        }

        function formatTimeLeft(mins) {
            mins = parseInt(mins, 10) || 0;
            if (mins <= 0) return "0 MIN";
            if (mins < 60) return `${mins} MIN`;
            const h = Math.floor(mins / 60);
            const m = mins % 60;
            return m > 0 ? `${h}H ${m}M` : `${h}H`;
        }

            function spawnFloatingText(elementId, text, colorClass) {
            const el = document.getElementById(elementId);
            if (!el) return;
            const rect = el.getBoundingClientRect();
            const floatDiv = document.createElement('div');
            floatDiv.className = `floating-text ${colorClass}`;
            floatDiv.innerText = text;
            
            const offsetX = (Math.random() - 0.5) * 40;
            const offsetY = (Math.random() - 0.5) * 20;
            
            floatDiv.style.left = (rect.left + window.scrollX + offsetX + (rect.width/2)) + 'px';
            floatDiv.style.top = (rect.top + window.scrollY + offsetY) + 'px';
            
            document.body.appendChild(floatDiv);
            
            setTimeout(() => {
                if (floatDiv.parentNode) floatDiv.parentNode.removeChild(floatDiv);
            }, 1200);
        }

        function logMoney(amount, reason, customRect = null) {
        state.money = (parseInt(state.money, 10) || 0) + amount;
        if (state.money < 0) state.money = 0;
        state.history.money.unshift({ amt: amount, txt: reason });
        if (state.history.money.length > 5) state.history.money.pop();
        
        spawnFloatingText('hud-money', (amount > 0 ? '+$' : '-$') + Math.abs(amount), amount > 0 ? 'text-emerald-400' : 'text-rose-500');

        // Ajoute une animation quand de l'argent est gagné
        if (amount > 0) {
            spawnMoneyParticles(customRect); // On passe la position perso ici
            const hudAvatar = document.getElementById('hud-avatar');
            if (hudAvatar) {
                hudAvatar.classList.add('animate-money-pulse');
                setTimeout(() => hudAvatar.classList.remove('animate-money-pulse'), 300);
            }
            if (reason && !reason.startsWith("Quête")) {
                if (typeof checkDailyQuests === 'function') checkDailyQuests('earn_money', amount);
            }
        } else if (amount < 0) {
            const hud = document.getElementById('hud');
            if (hud) {
                hud.classList.add('animate-hud-shake');
                setTimeout(() => hud.classList.remove('animate-hud-shake'), 300);
            }
        }
    }

    function spawnMoneyParticles(customRect = null) {
        let rect;
        // Si un bouton a été cliqué, on pop dessus. Sinon, on pop sur le HUD.
        if (customRect) {
            rect = customRect;
        } else {
            const target = document.getElementById('hud-money');
            if (!target) return;
            rect = target.getBoundingClientRect();
        }
        
        for (let i = 0; i < 6; i++) {
            const p = document.createElement('div');
            p.innerText = '$';
            p.className = 'money-particle';
            p.style.left = `${rect.left + rect.width / 2}px`;
            p.style.top = `${rect.top + rect.height / 2}px`;
            p.style.setProperty('--tx', `${(Math.random() - 0.5) * 80}px`);
            p.style.setProperty('--ty', `${-40 - Math.random() * 60}px`);
            document.body.appendChild(p);
            setTimeout(() => p.remove(), 800);
        }
    }
        function generateFanName() {
    const p = [
        'Lil_', 'DJ_', 'MC_', 'Prod_', 'User', 'Fan_',
        'Jeune_', 'Big_', 'Real_', 'King_', 'Queen_', 'Sir_',
        'Baby_', 'Chief_', 'Master_', 'Yung_', 'Lit_', 'Top_',
        'OG_', 'Sub_', 'Trap_', 'Beat_', 'Sound_', 'Wave_',
        'Nova_', 'Cash_', 'Neon_', 'Ghost_', 'Shadow_', 'Crypto_',
        'Pixel_', 'Lofi_', 'Bass_', 'Drip_', 'Flex_', 'Vybz_',
        'Anon_', 'True_', 'Xx', 'iam', 'The_'
    ];
    const s = [
        '_Beat', 'Vibe', 'Master', '99', '2026', 'Z',
        '_Wave', '_Flow', '_Drip', '_Loop', '_Mix', '_Sound',
        '_FX', '_God', '_King', '_Queen', '_X', '_Prod',
        '_Studio', '_Life', '_Gang', '_Squad', '_Nation', 'TV',
        '_Official', '_Music', '_808', '_303', '_HQ', '_World',
        '_Radio', '_Records', '_Sessions', '_Type', '_Cloud', '_2dg'
    ];

    const base = p[Math.floor(Math.random()*p.length)] + s[Math.floor(Math.random()*s.length)];
    const addNumber = Math.random() < 0.35; // 35% de chance d'ajouter un nombre
    return addNumber ? base + Math.floor(Math.random()*999) : base;
}
        function logFollower(amount) {
            if (amount !== 0) {
                spawnFloatingText('hud-foll', (amount > 0 ? '+' : '') + amount + ' FOL', amount > 0 ? 'text-blue-400' : 'text-rose-500');
            }
            if (amount > 0) {
                let actualAmount = amount;
                if (state.viralActive) {
                    actualAmount *= 10;
                }
                state.followers = (parseInt(state.followers, 10) || 0) + actualAmount;
                state.history.followers.unshift(generateFanName());
                if (state.history.followers.length > 4) state.history.followers.pop();
                checkAchievement('dans_la_sauce', () => state.followers >= 15000);
                refreshAchievementsPanel();
            }
        }
        function getVpnCooldown() {
        const level = Math.floor((parseInt(state.rep, 10) || 0) / 50);
        const cooldown = 30 - Math.min(15, level * 3);
        return Math.max(15, cooldown);
    }

        function getDawCooldown() { return 45; }

    //PIANOROLLLLLL

        // ==========================================
        // 11. INIT UI
        // ==========================================
        function initUI() {
            initClouds(); // Génération au lancement de l'interface
            // Initialise la grille des 4 variantes du personnage de palier (Niv.1 = Street_MC par défaut)
            if (typeof window.syncLoginAvatarStyleUI === 'function') {
                window.syncLoginAvatarStyleUI(1, 1, 0);
            }
            // --- LISTENERS CLAVIER PIANO ROLL ---
            window.addEventListener('keydown', (e) => {
                const prWindow = document.getElementById('app-pianoroll');
                // Vérifie que la fenêtre du piano est ouverte et ignore la répétition native des touches
                if (prWindow && !prWindow.classList.contains('hidden') && !e.repeat) {
                    const note = PC_KEY_MAP[e.code];
                    if (note) {
                        e.preventDefault();
                        playSynthNote(note, true);
                    }
                }
            });

            window.addEventListener('keyup', (e) => {
                const note = PC_KEY_MAP[e.code];
                if (note) {
                    playSynthNote(note, false);
                }
            });
            
            // Sécurité : couper le son si la fenêtre perd le focus pendant qu'on joue
            window.addEventListener('blur', () => {
                Object.keys(activeSynthNotes).forEach(note => playSynthNote(note, false));
            });

            const vuMeter = document.getElementById('vu-meter-container');
            let ledsHTML = '';
            for (let i = 1; i <= 14; i++) ledsHTML += `<div class="vu-led" id="vu-led-${i}"></div>`;
            vuMeter.innerHTML = ledsHTML;

            if (isMobile) {
                document.querySelectorAll('.vu-led').forEach(l => { l.style.width = '4px'; l.style.height = '100%'; l.style.marginBottom = '0'; l.style.marginRight = '2px'; });
                vuMeter.style.flexDirection = 'row';
            }

            // Normalisation DOM critique : garantir que TOUTES les fenêtres .os-window vivent dans #pc-ui-layer
            // (corrige l'ancien bug où app-browser, app-social, app-stats, sample-digger et app-echo sortaient hors de l'OS)
            const pcUiLayerRoot = document.getElementById('pc-ui-layer');
            if (pcUiLayerRoot) {
                document.querySelectorAll('.os-window').forEach(w => {
                    if (w.parentElement !== pcUiLayerRoot) {
                        pcUiLayerRoot.appendChild(w);
                    }
                });
            }

            // Window Manager Pro : Click-anywhere focus, safe clamped dragging & double-click maximize
            document.querySelectorAll('.os-window').forEach(win => {
                const header = win.querySelector('.window-header');
                // Focus immédiat au clic n'importe où sur la fenêtre
                win.addEventListener('mousedown', () => {
                    if (win.style.display !== 'none' && typeof bringToFront === 'function') {
                        bringToFront(win.id);
                    }
                }, true);

                if (!header) return;

                // Double-clic sur la barre de titre -> Agrandir / Restaurer
                header.addEventListener('dblclick', (e) => {
                    if (isMobile) return;
                    if (e.target && e.target.closest && e.target.closest('button, input, select')) return;
                    if (typeof toggleMaximizeWindow === 'function') toggleMaximizeWindow(win);
                });

                let isDragging = false, startX = 0, startY = 0, initX = 0, initY = 0;
                const startDrag = (e) => {
                    if (isMobile) return;
                    if (e.target && e.target.closest && e.target.closest('button, input, select, .window-close-btn')) return;
                    if (win.classList.contains('window-maximized')) return;

                    isDragging = true;
                    bringToFront(win.id);
                    const cx = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
                    const cy = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;
                    const rect = win.getBoundingClientRect();
                    startX = cx; startY = cy;
                    initX = rect.left; initY = rect.top;
                };
                const doDrag = (e) => {
                    if (!isDragging || isMobile) return;
                    e.preventDefault();
                    const cx = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
                    const cy = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;
                    const w = win.offsetWidth || 600;
                    const minTop = 74;
                    const maxTop = Math.max(minTop, window.innerHeight - 135);
                    const minLeft = Math.min(12, -(w - 140));
                    const maxLeft = Math.max(12, window.innerWidth - 140);

                    const newX = Math.max(minLeft, Math.min(maxLeft, initX + (cx - startX)));
                    const newY = Math.max(minTop, Math.min(maxTop, initY + (cy - startY)));
                    win.style.left = `${Math.round(newX)}px`;
                    win.style.top = `${Math.round(newY)}px`;
                };
                const stopDrag = () => {
                    if (isDragging) {
                        isDragging = false;
                        if (window.innerWidth > 768 && typeof clampWindowToViewport === 'function') {
                            clampWindowToViewport(win);
                        }
                    }
                };
                header.addEventListener('mousedown', startDrag);
                document.addEventListener('mousemove', doDrag);
                document.addEventListener('mouseup', stopDrag);
                header.addEventListener('touchstart', startDrag, { passive: true });
                document.addEventListener('touchmove', doDrag, { passive: false });
                document.addEventListener('touchend', stopDrag);
            });

            // Initialisation des écouteurs pour les sliders audio
                        // Initialisation des écouteurs pour les sliders audio avec sauvegarde automatique
            function initAudioSettingsListeners() {
                const masterSlider = document.getElementById('master-volume-slider');
                const musicSlider = document.getElementById('music-volume-slider');
                const sfxSlider = document.getElementById('sfx-volume-slider');

                if (masterSlider) {
                    masterSlider.addEventListener('input', (e) => {
                        window.masterVolume = parseFloat(e.target.value);
                        if (typeof state !== 'undefined') state.masterVolume = window.masterVolume;
                        MusicSystem.setMasterVolume(window.masterVolume);
                        document.getElementById('master-volume-value').innerText = `${Math.round(window.masterVolume * 100)}%`;
                        saveGame();
                    });
                }
                if (musicSlider) {
                    musicSlider.addEventListener('input', (e) => {
                        window.musicVolume = parseFloat(e.target.value);
                        if (typeof state !== 'undefined') state.musicVolume = window.musicVolume;
                        MusicSystem.setMusicVolume(window.musicVolume);
                        document.getElementById('music-volume-value').innerText = `${Math.round(window.musicVolume * 100)}%`;
                        saveGame();
                    });
                }
                if (sfxSlider) {
                    sfxSlider.addEventListener('input', (e) => {
                        window.sfxVolume = parseFloat(e.target.value);
                        if (typeof state !== 'undefined') state.sfxVolume = window.sfxVolume;
                        document.getElementById('sfx-volume-value').innerText = `${Math.round(window.sfxVolume * 100)}%`;
                        saveGame();
                    });
                }
            }


            initAudioSettingsListeners(); // Appel de la fonction d'initialisation des écouteurs
            initAchievementsUI();
            initPianoRollUI(); // Initialise le DOM du Piano Roll au boot
            initPianoRollEvents();
            initInteractiveStudio();
            const startAudioAndLogin = async () => {
                const btn = document.getElementById('btn-login');
                const lbl = document.getElementById('btn-login-label');
                const originalText = lbl ? lbl.innerText : btn.innerText;
                if (lbl) lbl.innerText = "OUVERTURE DU STUDIO…";
                else btn.innerText = "OUVERTURE DU STUDIO…";
                btn.disabled = true;

                await MusicSystem.init();
                MusicSystem.startAllTracks();
                MusicSystem.crossfadeTo('room', 3.0); // Déclenche la musique de la room

                await attemptLogin(); // Lance ton jeu
                if (lbl) lbl.innerText = originalText;
                else btn.innerText = originalText;
                btn.disabled = false;
            };

            document.getElementById('btn-login').addEventListener('click', startAudioAndLogin);
            document.getElementById('login-username').addEventListener('keypress', (e) => { if (e.key === 'Enter') startAudioAndLogin(); });

            // === OPTION 3 : DÉTECTION SAUVEGARDE LIVE, PROFILS RÉCENTS, AMBIANCE 3D & PARALLAXE ===
            const loginAmbienceModes = [
                { key: 'auto', label: 'AMBIANCE : AUTO', dot: '#f59e0b' },
                { key: 'morning', label: 'AMBIANCE : MATIN', dot: '#fbbf24', hour: 9.2, rain: 0.0, clock: '09:12', weather: 'MATIN DORÉ' },
                { key: 'sunset', label: 'AMBIANCE : SOIR', dot: '#fb923c', hour: 18.4, rain: 0.0, clock: '18:24', weather: 'GOLDEN HOUR' },
                { key: 'night', label: 'AMBIANCE : NUIT', dot: '#818cf8', hour: 22.5, rain: 0.0, clock: '22:30', weather: 'SESSION NUIT' },
                { key: 'rain', label: 'AMBIANCE : PLUIE', dot: '#38bdf8', hour: 23.2, rain: 0.92, clock: '23:12', weather: 'PLUIE SUR PARIS' }
            ];
            let loginAmbIdx = 0;

            function formatClockFromMins(mins) {
                const m = ((Math.floor(Number(mins) || 480) % 1440) + 1440) % 1440;
                const hh = Math.floor(m / 60);
                const mm = m % 60;
                return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
            }

            function findSavedProfilesList() {
                const found = [];
                try {
                    const seen = new Set();
                    for (let i = 0; i < localStorage.length; i++) {
                        const k = localStorage.key(i);
                        if (!k) continue;
                        let name = null;
                        if (k.startsWith('bounce_it_save_')) name = k.slice('bounce_it_save_'.length);
                        else if (k.startsWith('smt_save_')) name = k.slice('smt_save_'.length);
                        if (name && !seen.has(name.toLowerCase())) {
                            seen.add(name.toLowerCase());
                            try {
                                const raw = localStorage.getItem(k);
                                const parsed = JSON.parse(raw);
                                if (parsed && typeof parsed === 'object') {
                                    found.push({ name: parsed.username || name, day: parsed.day || 1, money: parsed.money || 0 });
                                }
                            } catch(e) {}
                        }
                    }
                } catch(e) {}
                return found.slice(0, 3);
            }

            document.querySelectorAll('[data-dev-preset]').forEach(btn => {
                btn.addEventListener('click', () => {
                    const key = btn.getAttribute('data-dev-preset');
                    const input = document.getElementById('login-username');
                    if (input && key) {
                        input.value = key;
                        avatarChanged = false;
                        window._loginVariantTouched = false;
                        window.refreshLoginSessionPreview(false);
                    }
                });
            });

            window.refreshLoginSessionPreview = function(autoFillLast = false) {
                const input = document.getElementById('login-username');
                const errEl = document.getElementById('login-error');
                if (errEl) errEl.classList.add('hidden');

                // Remplissage discret du dernier alias utilisé + puces de profils récents
                const profiles = findSavedProfilesList();
                const recentWrap = document.getElementById('login-recent-profiles');
                if (recentWrap) {
                    if (profiles.length > 0) {
                        recentWrap.innerHTML = '';
                        profiles.forEach(p => {
                            const chip = document.createElement('button');
                            chip.type = 'button';
                            chip.className = 'cinema-profile-chip';
                            chip.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span><span>${p.name}</span><span class="text-[9px] text-slate-400 font-mono">J${p.day}</span>`;
                            chip.onclick = () => {
                                if (input) {
                                    input.value = p.name;
                                    window._loginVariantTouched = false;
                                    window.refreshLoginSessionPreview(false);
                                }
                            };
                            recentWrap.appendChild(chip);
                        });
                        recentWrap.classList.remove('hidden');
                    } else {
                        recentWrap.classList.add('hidden');
                    }
                }
                if (autoFillLast && input && !input.value.trim()) {
                    const lastAlias = SafeStorage.get('bounce_it_last_alias') || (profiles[0] ? profiles[0].name : '');
                    if (lastAlias) input.value = lastAlias;
                }

                const alias = input ? input.value.trim() : '';
                let parsedSave = null;
                const devPreset = alias ? window.DEV_PRESET_PROFILES[alias.toUpperCase()] : null;
                if (devPreset) {
                    parsedSave = devPreset;
                } else if (alias) {
                    try {
                        const raw = SafeStorage.get(getSaveKey(alias)) || SafeStorage.get('smt_save_' + alias);
                        if (raw && raw !== 'undefined' && raw !== 'null') parsedSave = JSON.parse(raw);
                    } catch(e) {}
                }

                const sDot = document.getElementById('login-session-dot');
                const sTitle = document.getElementById('login-session-title');
                const sSub = document.getElementById('login-session-sub');
                const sBadge = document.getElementById('login-session-badge');
                const btnLbl = document.getElementById('btn-login-label');
                const topMeta = document.getElementById('login-topbar-meta');

                let autoHour = 9.2, autoRain = 0.0, autoClock = '08:00', autoWeather = 'MATIN CLAIR', autoDay = 1;

                if (parsedSave) {
                    if (typeof window.syncCareerWallDiscs === 'function') window.syncCareerWallDiscs(parsedSave);
                    if (typeof window.syncProStudioGuests3D === 'function') window.syncProStudioGuests3D(parsedSave);
                    if (parsedSave.activeLocation === 'pro_studio' && typeof window.applyStudioLocation === 'function') {
                        window.applyStudioLocation('pro_studio');
                        if (typeof window.syncProStudioGuests3D === 'function') window.syncProStudioGuests3D(parsedSave);
                    } else {
                        if (typeof window.applyStudioLocation === 'function') window.applyStudioLocation('bedroom');
                        if (typeof window.getTargetRoomTier === 'function' && typeof window.applyRoomEvolutionTier === 'function') {
                            const saveTier = Math.max(Number(parsedSave.roomTier) || 1, window.getTargetRoomTier(parsedSave));
                            window.applyRoomEvolutionTier(saveTier, false);
                        }
                    }
                    const day = parsedSave.day || 1;
                    const tMins = typeof parsedSave.timeMins === 'number' ? parsedSave.timeMins : 480;
                    const clk = formatClockFromMins(tMins);
                    const hr = ((tMins % 1440) + 1440) % 1440 / 60;
                    const inspi = typeof parsedSave.inspi === 'number' ? parsedSave.inspi : 80;
                    const isRainySave = (inspi < 35) || (day % 3 === 0 && (hr >= 20 || hr < 6));
                    const moneyStr = typeof formatNum === 'function' ? '$' + formatNum(parsedSave.money || 0) : '$' + (parsedSave.money || 0);
                    const foll = parsedSave.followers || 0;
                    const tracks = parsedSave.stats ? (parsedSave.stats.tracks || 0) : 0;

                    autoHour = hr;
                    autoRain = isRainySave ? 0.85 : 0.0;
                    autoClock = clk;
                    autoDay = day;
                    autoWeather = isRainySave ? 'PLUIE SUR PARIS' : (hr >= 21 || hr < 6 ? 'SESSION NUIT' : (hr >= 17 ? 'GOLDEN HOUR' : 'CIEL CLAIR'));

                    if (sDot) { sDot.className = 'w-2 h-2 rounded-full bg-emerald-400 shrink-0 shadow-[0_0_8px_rgba(52,211,153,0.8)]'; }
                    if (sTitle) { sTitle.textContent = 'SESSION TROUVÉE'; sTitle.className = 'text-[10px] font-mono uppercase tracking-[0.2em] text-emerald-300 truncate'; }
                    if (sSub) sSub.textContent = `Jour ${day} · ${clk} · ${moneyStr} · ${foll} Fans · ${tracks} Titre${tracks > 1 ? 's' : ''}`;
                    if (sBadge) { sBadge.textContent = 'RESUME'; sBadge.className = 'text-[9px] font-mono uppercase tracking-widest px-2 py-0.5 rounded bg-emerald-500/15 border border-emerald-400/35 text-emerald-300 shrink-0'; }
                    if (btnLbl) btnLbl.textContent = 'REPRENDRE LA SESSION';

                    // Synchronise le palier débloqué, le perso du palier et ses 4 variantes
                    const maxTier = parsedSave.studioUnlocked ? 4 : Math.max(1, Number(parsedSave.roomTier) || 1, Number(parsedSave.avatarTier) || 1);
                    const savedTier = Math.max(1, Math.min(maxTier, Number(parsedSave.avatarTier) || maxTier));
                    const selTier = (window._loginVariantTouched && window._loginSelectedTier <= maxTier) ? window._loginSelectedTier : savedTier;
                    const selVar = window._loginVariantTouched ? (window._loginSelectedVariant || 0) : (Number(parsedSave.avatarVariant) || 0);
                    if (typeof window.syncLoginAvatarStyleUI === 'function') window.syncLoginAvatarStyleUI(maxTier, selTier, selVar);
                } else {
                    if (typeof window.applyStudioLocation === 'function') window.applyStudioLocation('bedroom');
                    if (typeof window.applyRoomEvolutionTier === 'function') window.applyRoomEvolutionTier(1, false);
                    if (sDot) { sDot.className = 'w-2 h-2 rounded-full bg-amber-400 shrink-0 shadow-[0_0_8px_rgba(245,158,11,0.75)]'; }
                    if (sTitle) { sTitle.textContent = 'NOUVELLE CARRIÈRE'; sTitle.className = 'text-[10px] font-mono uppercase tracking-[0.2em] text-amber-300 truncate'; }
                    if (sSub) sSub.textContent = 'Jour 1 · 08:00 · Studio de départ';
                    if (sBadge) { sBadge.textContent = 'NEW'; sBadge.className = 'text-[9px] font-mono uppercase tracking-widest px-2 py-0.5 rounded bg-white/5 border border-white/10 text-slate-300 shrink-0'; }
                    if (btnLbl) btnLbl.textContent = 'OUVRIR LA SESSION';
                    if (typeof window.syncLoginAvatarStyleUI === 'function') window.syncLoginAvatarStyleUI(1, 1, window._loginVariantTouched ? (window._loginSelectedVariant || 0) : 0);
                }

                // Applique l'ambiance 3D live (soit Auto=sauvegarde, soit choix manuel du joueur)
                const mode = loginAmbienceModes[loginAmbIdx];
                if (mode.key === 'auto') {
                    window._loginPreviewHour = autoHour;
                    window._loginPreviewRain = autoRain;
                    window._loginPreviewClockStr = autoClock;
                    if (topMeta) topMeta.textContent = `JOUR ${autoDay} · ${autoClock} · ${autoWeather}`;
                } else {
                    window._loginPreviewHour = mode.hour;
                    window._loginPreviewRain = mode.rain;
                    window._loginPreviewClockStr = mode.clock;
                    if (topMeta) topMeta.textContent = `APERÇU · ${mode.clock} · ${mode.weather}`;
                }
            };

            const loginInputEl = document.getElementById('login-username');
            if (loginInputEl) {
                loginInputEl.addEventListener('input', () => {
                    window._loginVariantTouched = false;
                    window.refreshLoginSessionPreview(false);
                });
            }
            const ambBtn = document.getElementById('login-ambience-btn');
            if (ambBtn) {
                ambBtn.addEventListener('click', () => {
                    loginAmbIdx = (loginAmbIdx + 1) % loginAmbienceModes.length;
                    const mode = loginAmbienceModes[loginAmbIdx];
                    const lbl = document.getElementById('login-ambience-label');
                    const dot = document.getElementById('login-ambience-dot');
                    if (lbl) lbl.textContent = mode.label;
                    if (dot) dot.style.background = mode.dot;
                    window.refreshLoginSessionPreview(false);
                });
            }
            window.addEventListener('mousemove', (ev) => {
                const ls = document.getElementById('login-screen');
                if (!ls || ls.style.display === 'none') return;
                window._loginMouseX = ((ev.clientX / Math.max(1, window.innerWidth)) - 0.5) * 2;
                window._loginMouseY = ((ev.clientY / Math.max(1, window.innerHeight)) - 0.5) * 2;
            }, { passive: true });
            window.refreshLoginSessionPreview(true);

            switchBrowserTab('crackz');
            updateTaskbar();
        }


        globalThis.avatarChanged = false; 

        function selectAvatar(idx) {
            selectedAvatarIndex = idx;
            avatarChanged = true; 
            document.querySelectorAll('.avatar-sel').forEach(el => el.classList.remove('selected'));
            document.querySelector(`.avatar-sel[data-idx="${idx}"]`).classList.add('selected');
            playBleep();

            updateThemeColors();
        }


        // ==========================================
        // 12. LOGIN
        // ==========================================
        async function attemptLogin() {
            window.isBooting = true; //
            initAudio();
            preloadUIAudio();
            const username = document.getElementById('login-username').value.trim();
            if (!username) { document.getElementById('login-error').classList.remove('hidden'); playError(); return; }

            try {
                let savedData = null;
                const devPresetObj = window.DEV_PRESET_PROFILES ? window.DEV_PRESET_PROFILES[username.toUpperCase()] : null;
                if (devPresetObj) {
                    savedData = JSON.stringify(devPresetObj);
                } else {
                    try {
                        savedData = SafeStorage.get(getSaveKey(username)) || SafeStorage.get('smt_save_' + username);
                    } catch(e) {
                        console.warn("Storage access failed:", e);
                    }
                }

                if (savedData && savedData !== "undefined" && savedData !== "null") {
                    const parsed = JSON.parse(savedData);
                    state = normalizeState(parsed);
                    // Réinitialisation forcée des flags temporaires pour éviter les deadlocks après reload
                    state.isExporting = false;
                    state.isReviewActive = false;
                    state.isEventActive = false;
                    state.isSitting = false;
                    state.isSleeping = false;
                    state.username = username;

                    recalculateActivePerks();
                    syncFurniture3DVisibility();

                    window.masterVolume = state.masterVolume;
                    window.musicVolume = state.musicVolume;
                    window.sfxVolume = state.sfxVolume;

                    // On force le rafraîchissement immédiat du mixeur audio
                    if (typeof MusicSystem !== 'undefined') {
                        MusicSystem.setMasterVolume(window.masterVolume);
                        MusicSystem.setMusicVolume(window.musicVolume);
                    }
                    // --------------------------------------------
                    state.cooldowns.dawTimeReady    = parseInt(state.cooldowns.dawTimeReady, 10) || 0;
                    state.cooldowns.crackzTimeReady = parseInt(state.cooldowns.crackzTimeReady, 10) || 0;
                    state.cooldowns.storyTimeReady  = 0; // Bonus QoL
                    
                    state.activeContracts = state.activeContracts || [];
                    state.completedDeals = state.completedDeals || [];
                    state.dealPool = state.dealPool || {};
                    // Force l'évaluation des offres disponibles au chargement de la sauvegarde (retrocompatibilité)
                    setTimeout(() => { if (typeof updateBrandDealsAvailability === 'function') updateBrandDealsAvailability(); }, 500);

                    Object.keys(state.cooldowns.sponsors).forEach(k => {
                        state.cooldowns.sponsors[k] = parseInt(state.cooldowns.sponsors[k], 10) || 0;
                    });

                    // --- MIGRATION RÉTROCOMPATIBILITÉ TOP CHARTS ---
                    if (state.trackList.length === 0 && state.stats.tracks > 0) {
                        let bangersToCreate = state.stats.bangers || 0;
                        let flopsToCreate = state.stats.flops || 0;

                        for (let i = 0; i < state.stats.tracks; i++) {
                            let score, titlePrefix;
                            if (bangersToCreate > 0) {
                                score = Math.floor(7 + Math.random() * 3);
                                titlePrefix = "ARCHIVED_HIT";
                                bangersToCreate--;
                            } else if (flopsToCreate > 0) {
                                score = Math.floor(1 + Math.random() * 3);
                                titlePrefix = "ARCHIVED_FLOP";
                                flopsToCreate--;
                            } else {
                                score = Math.floor(4 + Math.random() * 3);
                                titlePrefix = "ARCHIVED_TUNE";
                            }
                            state.trackList.push({ title: `${titlePrefix}_${i + 1}`, genre: "UNKNOWN", score: score, money: 0, fans: 0, date: "???" });
                        }
                        state.trackList.sort((a, b) => b.score - a.score);
                        if (state.trackList.length > 15) state.trackList.length = 15;
                    }
                    
                    state.isEventActive = false;
                    state.isReviewActive = false;
                    state.isExporting = false;
                    state.isSleeping  = false;
                    state.isSitting   = false;

                    state.activeCharacter = parseInt(state.activeCharacter ?? state.avatar, 10) || 0;
                    if (avatarChanged) state.activeCharacter = selectedAvatarIndex;
                    if (state.activeCharacter < 0 || state.activeCharacter >= avatars.length) state.activeCharacter = 0;

                    showToast("Session restaurée avec succès.", "success");
                } else {
                    state = JSON.parse(JSON.stringify(DEFAULT_STATE));
                    state.username = username;
                    state.activeCharacter = selectedAvatarIndex;
                    showToast("Nouveau profil enregistré.", "info");
                }
            } catch(e) {
                console.error('Erreur critique au chargement de la sauvegarde :', e); 
                state = JSON.parse(JSON.stringify(DEFAULT_STATE));
                state.username = username;
                state.activeCharacter = selectedAvatarIndex;
                showToast("Échec du chargement. Profil par défaut chargé.", "warning");
            }

            normalizeAchievementState();
            migrateCompletedAchievementProgress();
            refreshAchievementsPanel();

            spawnRoomAvatar(state.activeCharacter);
            recalculateActivePerks();
            syncFurniture3DVisibility();
            if (typeof window.getTargetRoomTier === 'function' && typeof window.applyRoomEvolutionTier === 'function') {
                const initTier = Math.max(Number(state.roomTier) || 1, window.getTargetRoomTier(state));
                state.roomTier = initTier;
                window.applyRoomEvolutionTier(initTier, false);
            }
            if (typeof window.applyStudioLocation === 'function') {
                const targetLoc = (state.activeLocation === 'pro_studio' && (state.studioUnlocked || username.toUpperCase() === 'DEV_STUDIO')) ? 'pro_studio' : 'bedroom';
                if (username.toUpperCase() === 'DEV_STUDIO') state.studioUnlocked = true;
                window.applyStudioLocation(targetLoc);
                if (targetLoc === 'pro_studio' && typeof currentRoomAvatar !== 'undefined' && currentRoomAvatar) {
                    currentRoomAvatar.position.set(-0.9, -1.0, 0.1);
                }
            }
            if (document.activeElement && typeof document.activeElement.blur === 'function') {
                document.activeElement.blur();
            }
            // Synchronise le personnage du palier & sa variante choisie (3D + HUD + thème) avec le niveau de room chargé
            const maxUnlockedTier = state.studioUnlocked ? 4 : Math.max(1, Number(state.roomTier) || 1, Number(state.avatarTier) || 1);
            if (window._loginVariantTouched) {
                if (typeof window._loginSelectedTier === 'number') {
                    state.avatarTier = Math.max(1, Math.min(maxUnlockedTier, window._loginSelectedTier));
                }
                if (typeof window._loginSelectedVariant === 'number') {
                    state.avatarVariant = Math.max(0, Math.min(3, window._loginSelectedVariant));
                }
                window._loginVariantTouched = false;
            }
            if (!state.avatarTier || state.avatarTier > maxUnlockedTier) state.avatarTier = maxUnlockedTier;
            if (typeof state.avatarVariant !== 'number' || state.avatarVariant < 0 || state.avatarVariant > 3) state.avatarVariant = 0;
            if (typeof window.getModelIndexForTier === 'function') {
                state.activeCharacter = window.getModelIndexForTier(state.avatarTier);
                selectedAvatarIndex = state.activeCharacter;
            }
            if (!state.avatarTierPrompted) state.avatarTierPrompted = state.avatarTier;
            if (typeof window.refreshActiveAvatarVisuals === 'function') {
                window.refreshActiveAvatarVisuals(state.avatarTier, state.avatarVariant);
            }
            if (typeof window.updateVinylCrate === 'function') window.updateVinylCrate();
            if (typeof window.syncCareerWallDiscs === 'function') window.syncCareerWallDiscs();
            if (typeof window.syncProStudioGuests3D === 'function') window.syncProStudioGuests3D();
            if (typeof window.updateEmpireTopPills === 'function') window.updateEmpireTopPills();
            if (typeof window.syncMasteringRackUI === 'function') window.syncMasteringRackUI();

            saveGame();

            if (typeof state.echoAlignment === 'undefined') state.echoAlignment = 0;
            if (typeof state.echoTrialUsed === 'undefined') state.echoTrialUsed = false;
            if (!state.echoPlan) state.echoPlan = ((parseInt(state.cooldowns.echoSubExpiry, 10) || 0) > getTotalMins()) ? 'pro' : 'free';
            if (typeof state.echoAiHeat !== 'number') state.echoAiHeat = 0;
            if (!state.echoBuffs || typeof state.echoBuffs !== 'object') {
                state.echoBuffs = { algoBoostTracks: 0, ghostProdReady: false, autoMixReady: false, trendDay: 0, trendGenreId: null, lastAlgoPushDay: 0 };
            }
            if (!state.cooldowns.echoSubExpiry) state.cooldowns.echoSubExpiry = 0;
            if (typeof state.cooldowns.echoQueryReady === 'undefined') state.cooldowns.echoQueryReady = 0;
            state.echoHistory = state.echoHistory || [];
            state.echoTrust = state.echoTrust !== undefined ? state.echoTrust : 50;
            state.echoStance = state.echoStance || 'neutral';

            // Mémorise le dernier alias pour l'écran titre cinéma
            try { SafeStorage.set('bounce_it_last_alias', username); } catch(e) {}

            // Mise à jour de l'indicateur avant le blocage GPU
            const loginBtnLbl = document.getElementById('btn-login-label');
            const loginBtn = document.getElementById('btn-login');
            if (loginBtnLbl) loginBtnLbl.innerText = "ENTRÉE DANS LE STUDIO…";
            else if (loginBtn) loginBtn.innerText = "ENTRÉE DANS LE STUDIO…";
            // On force une pause pour laisser le temps au navigateur de peindre le changement de texte
            await new Promise(resolve => requestAnimationFrame(() => setTimeout(resolve, 0)));

            // Correctif 1 : Pré-compilation des shaders pour éviter le freeze au lancement
            renderer.compile(scene, camera);
            // Correctif 2 : Warmup des fonctions de mouvement pour éviter le lag au premier input
            warmupMovement();
            isSceneReady = true; // Débloque la boucle animate3D

            // --- DÉCLENCHEMENT DE LA TRANSITION CINÉMASCOPE CONTINUE VERS FPS ---
            const isProSpawn = (window.activeStudioLocation === 'pro_studio');
            window._introFromPos = window._loginCamPos ? window._loginCamPos.clone() : camera.position.clone();
            window._introFromYaw = (typeof window._loginCamYaw === 'number') ? window._loginCamYaw : (isProSpawn ? -1.52 : 0.42);
            window._introFromPitch = (typeof window._loginCamPitch === 'number') ? window._loginCamPitch : -0.05;
            window._introFromFov = camera.fov || 60;
            window._loginPreviewClockStr = null; // Rend la main à l'horloge in-game réelle
            window.doorTargetAngle = 0; // Referme doucement la porte du studio derrière toi

            window.isIntroAnimating = true;
            window.introProgress = 0;
            if (window.fps) {
                window.fps.yaw = isProSpawn ? -1.52 : 0.42;
                window.fps.pitch = isProSpawn ? -0.02 : -0.05;
                window.fps.fovZoomOffset = 0;
            }

            if (window.gameInterval) { clearInterval(window.gameInterval); window.gameInterval = null; }
            window.gameInterval = setInterval(gameTick, 1000);

            try {

            const loginScreenEl = document.getElementById('login-screen');
            if (loginScreenEl) {
                loginScreenEl.classList.add('cinema-entering');
                setTimeout(() => {
                    loginScreenEl.style.display = 'none';
                    loginScreenEl.classList.remove('cinema-entering');
                }, 780);
            }
            document.getElementById('room-ui').style.display = 'flex';
            document.getElementById('audio-settings-gear').style.display = 'flex'; // Fait apparaître les paramètres
            document.getElementById('hud-avatar').innerHTML = `<img src="${avatars[state.activeCharacter].img}" class="w-full h-full object-cover object-top rounded-full" />`;
            document.getElementById('hud-name').innerText = state.username;

            // --- AJOUT ICI : Sécurité anti-popups fantômes ---
            const reviewOverlay = document.getElementById('review-overlay');
            if (reviewOverlay) {
            reviewOverlay.classList.add('hidden');
            reviewOverlay.style.opacity = '0';
            reviewOverlay.style.pointerEvents = 'none';
        }
    state.isReviewing = false; // Force la donnée à l'arrêt
    // --------------------------------------------------
            
            // Sync initial values to prevent counting from 0 on login
            hudDisplayValues.money = state.money;
            hudDisplayValues.rep = state.rep;
            hudDisplayValues.foll = state.followers;
            hudLastTargetValues.money = state.money;
            hudLastTargetValues.rep = state.rep;
            hudLastTargetValues.foll = state.followers;

            // Force l'affichage immédiat des valeurs chargées pour éviter le blocage à zéro
            document.getElementById('hud-money').innerText = formatNum(state.money);
            const repNumEl = document.getElementById('hud-rep-num');
            if (repNumEl) repNumEl.innerText = formatNum(state.rep);
            document.getElementById('hud-foll').innerText  = formatNum(state.followers);
            const iv = Math.max(0, Math.min(100, Math.floor(state.inspi)));
            const inspFillEl = document.getElementById('meter-inspi-fill');
            if (inspFillEl) inspFillEl.style.height = `${iv}%`;
            const inspValEl = document.getElementById('meter-inspi-val');
            if (inspValEl) inspValEl.innerText = `${iv}%`;

            selectDawGenre();
            selectDawVoice();
            updateDawPlugins();
            playSuccess();
            updateHUD();
            refreshStats();
            refreshSocial();
            updateMoodRingWidget();
            updateTopChartsWidget();
            // Ensure there's an active weekly challenge and update UI
            if (!state.activeChallenge || !state.activeChallenge.id) generateNewChallenge();
            updateChallengeUI();

            // Initialisation silencieuse au boot pour ne pas pop au login
            const _initLevelData = calculateLevelData(true) || { level: 1, currentRank: PLAYER_RANKS[0] };
            state.lastLevel = _initLevelData.level;
            state.lastRankId = _initLevelData.currentRank?.id || state.lastRankId;

            // --- AJOUT : Force les couleurs correctes à l'apparition de la 3D ---
            updateThemeColors();



            if (!cpuGraphStarted) {
                cpuGraphStarted = true; // <-- AJOUTE CETTE LIGNE
                drawSysGraphUI(performance.now());
            }

            

            // Sécurisation de la boucle temporelle
        window.updateCooldownUIs = function() {
        // Logique de rafraîchissement des cooldowns de l'interface (à étoffer selon les besoins)
        };

        window.generateDailyQuests = function() {
            const pool = [
                { id: 'export_tracks', text: "Exporter 3 sons", current: 0, target: 3, rewardMoney: 300, rewardRep: 5, done: false },
                { id: 'buy_furniture', text: "Acheter 1 meuble", current: 0, target: 1, rewardMoney: 200, rewardRep: 3, done: false },
                { id: 'high_energy', text: "Dormir et dépasser 90 d'énergie", current: 0, target: 90, rewardMoney: 150, rewardRep: 2, done: false },
                { id: 'earn_money', text: "Gagner 400$ avec des prods", current: 0, target: 400, rewardMoney: 250, rewardRep: 4, done: false }
            ];
            const shuffled = pool.sort(() => 0.5 - Math.random());
            state.dailyQuests = shuffled.slice(0, 3);
            state.dailyQuestsLastReset = state.day;
            showToast("📅 Nouvelles quêtes journalières disponibles !", "info");
        };

                window.checkDailyQuests = function(type, value) {
            if (!state.dailyQuests) return;
            let updated = false;
            state.dailyQuests.forEach(q => {
                if (q.done) return;
                if (q.id === type) {
                    if (type === 'high_energy' || type === 'reach_hype') {
                        if (q.current !== value) { q.current = value; updated = true; }
                    } else {
                        q.current += value; updated = true;
                    }
                    if (q.current >= q.target) {
                        q.current = q.target;
                        q.done = true;
                        updated = true;
                        logMoney(q.rewardMoney, `Quête: ${q.text}`);
                        state.rep = (parseInt(state.rep, 10) || 0) + q.rewardRep;
                        showToast(`✅ Quête Réussie : ${q.text} ! +$${q.rewardMoney} / +${q.rewardRep} REP`, "success");
                        if (typeof fireConfetti === 'function') fireConfetti('store');
                    }
                }
            });
            // SÉCURITÉ : Ne met à jour le HUD que si une vraie quête avance, 
            // et on bloque la boucle pour high_energy
            if (updated && type !== 'high_energy') {
                updateHUD();
            }
        };

        window.updateHype = function(amount) {
            state.hype = Math.max(0, Math.min(100, (parseFloat(state.hype) || 50) + amount));
            updateHUD();
        };

        window.triggerMonoMixMiniGame = function(onDoneCallback) {
            state.isEventActive = true;
            const container = document.createElement('div');
            container.id = 'mono-mix-modal';
            container.className = 'fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md px-4';
            
            let bass = Math.floor(Math.random() * 40) + 15;
            let mid = Math.floor(Math.random() * 40) + 45;
            let treble = Math.floor(Math.random() * 40) + 25;
            
            container.innerHTML = `
                <div class="liquid-glass-heavy border border-white/10 w-full max-w-md p-6 rounded-2xl flex flex-col items-center gap-6 text-white text-center shadow-2xl relative">
                    <div class="space-y-2 mt-2">
                        <h2 class="text-xl font-bold font-retro tracking-widest text-white uppercase">⚡ Équilibre Spectral</h2>
                        <p class="text-[11px] text-[var(--text-muted)] max-w-sm">
                            Maintiens les 3 bandes dans la zone de confort (45-55%) à la fin du compte à rebours pour réussir ton mixage.
                        </p>
                        <div id="mono-mix-timer" class="text-sm font-bold font-retro text-[var(--retro-orange)] tracking-widest mt-1">TEMPS RESTANT : 10.0s</div>
                    </div>
                    
                    <div class="relative flex items-end justify-center gap-8 h-32 w-full border-b border-white/20 pb-2 bg-black/30 rounded-lg overflow-hidden">
                        <!-- Zone de confort overlay -->
                        <div class="absolute left-0 right-0 bottom-[45%] h-[10%] bg-emerald-500/10 border-y border-emerald-500/30 pointer-events-none flex items-center justify-center">
                            <span class="text-[7px] text-emerald-400 font-bold uppercase tracking-widest">ZONE TARGET (45-55%)</span>
                        </div>
                        <!-- Bars -->
                        <div id="bar-bass" class="w-8 bg-red-500 rounded-t-md transition-all duration-75 z-10" style="height: ${bass}%"></div>
                        <div id="bar-mid" class="w-8 bg-yellow-500 rounded-t-md transition-all duration-75 z-10" style="height: ${mid}%"></div>
                        <div id="bar-treble" class="w-8 bg-blue-500 rounded-t-md transition-all duration-75 z-10" style="height: ${treble}%"></div>
                    </div>
        
                    <div class="w-full space-y-5 font-retro text-left text-xs tracking-wider">
                        <div class="space-y-2">
                            <div class="flex justify-between font-bold text-[10px]">
                                <span class="text-red-400">LOWS (Sub/Bass)</span> <span id="val-bass">${bass}%</span>
                            </div>
                            <input type="range" id="slider-bass" class="w-full h-1.5 bg-black rounded-lg appearance-none cursor-pointer accent-red-400" min="0" max="100" value="${bass}">
                        </div>
                        <div class="space-y-2">
                            <div class="flex justify-between font-bold text-[10px]">
                                <span class="text-yellow-400">MIDS (Vocals/Snare)</span> <span id="val-mid">${mid}%</span>
                            </div>
                            <input type="range" id="slider-mid" class="w-full h-1.5 bg-black rounded-lg appearance-none cursor-pointer accent-yellow-400" min="0" max="100" value="${mid}">
                        </div>
                        <div class="space-y-2">
                            <div class="flex justify-between font-bold text-[10px]">
                                <span class="text-blue-400">HIGHS (Air/Hats)</span> <span id="val-treble">${treble}%</span>
                            </div>
                            <input type="range" id="slider-treble" class="w-full h-1.5 bg-black rounded-lg appearance-none cursor-pointer accent-blue-400" min="0" max="100" value="${treble}">
                        </div>
                    </div>
                    <div class="flex gap-4 w-full justify-center">
                        <button id="btn-mono-mix-validate" disabled class="w-full py-3 rounded-lg text-xs font-retro tracking-wider bg-white/10 text-white/40 cursor-not-allowed font-bold">STABILISATION EN COURS...</button>
                    </div>
                </div>
            `;
            document.body.appendChild(container);
        
            const sB = container.querySelector('#slider-bass');
            const sM = container.querySelector('#slider-mid');
            const sT = container.querySelector('#slider-treble');
            const barB = container.querySelector('#bar-bass');
            const barM = container.querySelector('#bar-mid');
            const barT = container.querySelector('#bar-treble');
            const timerEl = container.querySelector('#mono-mix-timer');
        
            sB.addEventListener('input', (e) => {
                bass = parseFloat(e.target.value);
                if (typeof playTone === 'function') playTone(80 + (bass * 0.5), 'sine', 0.04, 0.05);
            });
            sM.addEventListener('input', (e) => {
                mid = parseFloat(e.target.value);
                if (typeof playTone === 'function') playTone(300 + (mid * 2), 'triangle', 0.03, 0.05);
            });
            sT.addEventListener('input', (e) => {
                treble = parseFloat(e.target.value);
                if (typeof playTone === 'function') playTone(2000 + (treble * 10), 'square', 0.015, 0.05);
            });
        
            let active = true;
            let startTime = performance.now();
        
            function updateDrift() {
                if (!active) return;
                let elapsed = (performance.now() - startTime) / 1000;
                let timeLeft = Math.max(0, 10 - elapsed);
                timerEl.innerText = `TEMPS RESTANT : ${timeLeft.toFixed(1)}s`;
        
                // Drift automatique +/- 1.2% par frame
                bass += (Math.random() - 0.5) * 2.4;
                mid += (Math.random() - 0.5) * 2.4;
                treble += (Math.random() - 0.5) * 2.4;
        
                // Clamping
                bass = Math.max(0, Math.min(100, bass));
                mid = Math.max(0, Math.min(100, mid));
                treble = Math.max(0, Math.min(100, treble));
        
                // Update slider values and views
                sB.value = bass;
                sM.value = mid;
                sT.value = treble;
        
                container.querySelector('#val-bass').innerText = Math.round(bass) + '%';
                container.querySelector('#val-mid').innerText = Math.round(mid) + '%';
                container.querySelector('#val-treble').innerText = Math.round(treble) + '%';
        
                barB.style.height = bass + '%';
                barM.style.height = mid + '%';
                barT.style.height = treble + '%';
        
                // Feedback de couleur en fonction de la zone de confort (45-55%)
                if (bass >= 45 && bass <= 55) {
                    barB.style.backgroundColor = '#10b981';
                } else {
                    barB.style.backgroundColor = '#ef4444';
                }
        
                if (mid >= 45 && mid <= 55) {
                    barM.style.backgroundColor = '#10b981';
                } else {
                    barM.style.backgroundColor = '#ef4444';
                }
        
                if (treble >= 45 && treble <= 55) {
                    barT.style.backgroundColor = '#10b981';
                } else {
                    barT.style.backgroundColor = '#ef4444';
                }
        
                if (timeLeft > 0) {
                    requestAnimationFrame(updateDrift);
                } else {
                    active = false;
                    const win = (bass >= 45 && bass <= 55) && (mid >= 45 && mid <= 55) && (treble >= 45 && treble <= 55);
                    const btn = container.querySelector('#btn-mono-mix-validate');
                    btn.disabled = false;
                    
                    if (win) {
                        btn.innerText = "VALIDER LE MIX (SUCCÈS)";
                        btn.className = "w-full py-3 rounded-lg text-xs font-retro tracking-wider bg-emerald-500 text-white font-bold cursor-pointer hover:bg-emerald-600 transition-colors";
                        btn.addEventListener('click', () => {
                            state.permanentMixBonus = Math.min(25, (state.permanentMixBonus || 0) + 5);
                            state.multiplier = Math.min(3.0, 1.0 + (state.permanentMixBonus / 100));
                            showToast(`🔥 Mix Plat ! Master hyper propre. Multiplicateur de base +5%.`, 'success');
                            playTone(440, 'sine', 0.1, 0.1);
                            setTimeout(() => playTone(660, 'sine', 0.1, 0.2), 100);
                            if (typeof fireConfetti === 'function') fireConfetti('store');
                            
                            document.body.removeChild(container);
                            state.isEventActive = false;
                            updateHUD();
                            if (typeof onDoneCallback === 'function') onDoneCallback();
                        });
                    } else {
                        btn.innerText = "ÉCHEC (RETOUR)";
                        btn.className = "w-full py-3 rounded-lg text-xs font-retro tracking-wider bg-red-600 text-white font-bold cursor-pointer hover:bg-red-700 transition-colors";
                        btn.addEventListener('click', () => {
                            state.inspi = Math.max(0, state.inspi - 10);
                            showToast("❌ Le mix est resté instable ! -10 Inspiration.", 'error');
                            playError();
        
                            document.body.removeChild(container);
                            state.isEventActive = false;
                            updateHUD();
                            if (typeof onDoneCallback === 'function') onDoneCallback();
                        });
                    }
                }
            }
        
            requestAnimationFrame(updateDrift);
        };

            } catch (bootErr) {
                console.error("Erreur critique pendant le boot (post-login):", bootErr);
            }


        window.dailyReset = function() {
            showToast("Nouveau jour ! Les compteurs sont remis à zéro.", "info");
            generateDailyQuests();
            saveGame();
        };

        // Interval already started above.
    
    // Libération du verrou SEULEMENT ici, avec un léger délai pour laisser le DOM respirer
    setTimeout(() => {
        window.isBooting = false;
        if (!state.dailyQuests || state.dailyQuests.length === 0) {
            if (typeof window.generateDailyQuests === 'function') window.generateDailyQuests();
        }
    }, 1000);
}


        // ==========================================
        // 14. HUD UPDATE
        // ==========================================
        function updateHUD() {
            // isSilentInit=true : évite de déclencher confetti/toast de level-up pendant le boot ou les refreshs HUD
            const _levelData = calculateLevelData(window.isBooting ? true : false); // Vérification automatique à chaque mise à jour des stats
            animateHUDNumber('hud-money', state.money, 'money');
            animateHUDNumber('hud-rep-num', state.rep, 'rep');
            animateHUDNumber('hud-foll', state.followers, 'foll');

            // NOUVEAU : Synchronisation avec la Top-bar de l'OS
            animateHUDNumber('os-stat-money', state.money, 'money');
            animateHUDNumber('os-stat-rep', state.rep, 'rep');
            animateHUDNumber('os-stat-fol', state.followers, 'foll');

            // --- MAJ DU WIDGET MOBILE (HYPE & STREAK) ---
            try {
                const osHypeFill = document.getElementById('os-mobile-hype-fill');
                const osHypeVal = document.getElementById('os-mobile-hype-val');
                const osStreakVal = document.getElementById('os-mobile-streak-val');

                if (osHypeFill && osHypeVal) {
                    const hv = Math.max(0, Math.min(100, Math.floor(Number(state.hype) || 50)));
                    const nextWidth = hv + '%';
                    if (osHypeFill.style.width !== nextWidth) {
                        osHypeFill.style.width = nextWidth;
                    }
                    const nextText = hv + '%';
                    if (osHypeVal.innerText !== nextText) {
                        osHypeVal.innerText = nextText;
                    }
                }
                if (osStreakVal) {
                    const nextStreak = (state.streakDays || 0) + ' 🔥';
                    if (osStreakVal.innerText !== nextStreak) {
                        osStreakVal.innerText = nextStreak;
                    }
                }
            } catch(e) {}

            const nextDay = `JOUR ${state.day}`;
            const dayEl = document.getElementById('hud-day');
            if (dayEl && dayEl.innerText !== nextDay) {
                dayEl.innerText = nextDay;
            }

            const energyVal = Math.floor(state.energy);
            const energyFill = document.getElementById('meter-energy-fill');
            const nextHeight = `${energyVal}%`;
            if (energyFill) {
                if (energyFill.style.height !== nextHeight) {
                    energyFill.style.height = nextHeight;
                }
                if ((state.isSleeping || state.isSitting) && energyVal < 100) {
                    energyFill.classList.add('is-charging');
                } else {
                    energyFill.classList.remove('is-charging');
                }
            }
            const energyValEl = document.getElementById('meter-energy-val');
            const nextValText = `${energyVal}%`;
            if (energyValEl && energyValEl.innerText !== nextValText) {
                energyValEl.innerText = nextValText;
            }
            

                        // --- SYSTÈME DE FATIGUE VISUELLE (S'active sous les 40% d'énergie) ---
            const gameContainer = document.getElementById('game-container');
            const exhaustOverlay = document.getElementById('exhaustion-overlay');
            
            if (energyVal <= 40) {
                // 1. Calcul du ratio : À 40%, ratio = 1 (Normal). À 0%, ratio = 0
                const ratio = Math.max(0, energyVal / 40); 
                
                // On désature partiellement (max 50% de désaturation pour ne pas perdre toute couleur)
                const saturation = 0.5 + (0.5 * ratio); 
                gameContainer.style.filter = `saturate(${saturation})`;
                
                if (exhaustOverlay) {
                    exhaustOverlay.classList.remove('hidden');
                    // L'opacité max du voile noir est bridée à 0.6 pour rester subtile
                    exhaustOverlay.style.opacity = ((1 - ratio) * 0.6).toString();
                    
                    // Le cœur bat de plus en plus vite (de 1.5s à 0.5s par cycle)
                    const heartbeatSpeed = Math.max(0.5, 1.5 * ratio);
                    exhaustOverlay.style.animationDuration = `${heartbeatSpeed}s`;
                    
                    if (!exhaustOverlay.classList.contains('exhausted-pulse')) {
                        exhaustOverlay.classList.add('exhausted-pulse');
                    }
                }
            } else {
                // Rétablissement total si énergie > 40%
                gameContainer.style.filter = 'saturate(1)';
                if (exhaustOverlay) {
                    exhaustOverlay.style.opacity = '0';
                    exhaustOverlay.classList.remove('exhausted-pulse');
                    // Délai pour cacher le div proprement après le fade-out
                    setTimeout(() => exhaustOverlay.classList.add('hidden'), 500);
                }
                const osMoney = document.getElementById('os-stat-money');
                const osRep   = document.getElementById('os-stat-rep');
                const osFol   = document.getElementById('os-stat-fol');
                if (osMoney) osMoney.textContent = formatNum(state.money);
                if (osRep)   osRep.textContent   = formatNum(state.rep);
                if (osFol)   osFol.textContent   = formatNum(state.followers);
                
            }
            
            // ----------------------------------------------------------------------

            const t = parseInt(state.timeMins, 10) || 0;
            const h = Math.floor(t / 60);
            const m = t % 60;
            const hs = String(h).padStart(2, '0');
            const ms = String(m).padStart(2, '0');
            
            // --- CLOUD SYSTEM SYNC (Day/Night & Time Warp) ---
            const isDay = (t >= 360 && t <= 1200); // 06:00 to 20:00
            document.documentElement.style.setProperty('--cloud-opacity', isDay ? '1' : '0');
            
            const speedFactor = (state.isSleeping || state.isSitting) ? 1.5 : 1.0;
            document.documentElement.style.setProperty('--time-warp-factor', speedFactor);

            const timeStrSystem = `${hs}:${ms}`;
            const timeStrWidget = `${hs}<span class="clock-colon">:</span>${ms}`;

            document.getElementById('sys-time').textContent          = timeStrSystem;

            // --- REP GAUGE: compute fill percent relative to next rank's minRep ---
            try {
                const repFillEl = document.getElementById('hud-rep-fill');
                const repNumEl = document.getElementById('hud-rep-num');
                if (repFillEl && repNumEl) {
                    const repPercent = Math.min(100, Math.max(0, (state.rep / (state.maxRep || 1000)) * 100));
                    repFillEl.style.width = repPercent + '%';
                    // update numeric overlay (keep smaller)
                    repNumEl.innerText = formatNum(state.rep);
                    // optional tooltip title
                    repFillEl.parentElement && repFillEl.parentElement.setAttribute('title', `${Math.round(repPercent)}% toward next rank`);
                }
            } catch(e) {}
            // --- HYPE GAUGE & NUM: show current hype (0-100) ---
            try {
                const hypeFill = document.getElementById('hud-hype-fill');
                const hypeNum = document.getElementById('hud-hype-num');
                if (hypeFill) {
                    const hv = Math.max(0, Math.min(100, Math.floor(Number(state.hype) || 50)));
                    hypeFill.style.width = hv + '%';
                    if (hypeNum) hypeNum.innerText = hv + '%';
                }
            } catch(e) {}

            // --- STREAK & MAX STREAK WIDGETS ---
            try {
                const streakEl = document.getElementById('hud-streak');
                const maxStreakEl = document.getElementById('hud-maxstreak');
                if (streakEl) streakEl.innerText = state.streakDays || 0;
                if (maxStreakEl) maxStreakEl.innerText = state.maxStreak || 0;
            } catch(e) {}

            // --- INSPI GAUGE: show creative inspiration (0-100) ---
            try {
                const iv = Math.max(0, Math.min(100, Math.floor(Number(state.inspi) || 0)));
                const inspFill = document.getElementById('meter-inspi-fill');
                const inspVal = document.getElementById('meter-inspi-val');
                if (inspFill) {
                    inspFill.style.height = iv + '%';
                    if (inspVal) inspVal.innerText = iv + '%';
                }
                // Sync FPS Room Bottom-Left Vitals HUD
                const fpsE = document.getElementById('fps-vitals-energy-fill');
                const fpsEV = document.getElementById('fps-vitals-energy-val');
                const fpsI = document.getElementById('fps-vitals-inspi-fill');
                const fpsIV = document.getElementById('fps-vitals-inspi-val');
                if (fpsE) fpsE.style.width = `${Math.max(0, Math.min(100, energyVal))}%`;
                if (fpsEV) fpsEV.textContent = `${energyVal}%`;
                if (fpsI) fpsI.style.width = `${iv}%`;
                if (fpsIV) fpsIV.textContent = `${iv}%`;
                // Flou périphérique doux sous 25% NRJ
                const fBlur = document.getElementById('fps-fatigue-blur');
                if (fBlur) {
                    fBlur.style.opacity = energyVal < 25 ? String(Math.min(0.88, (25 - energyVal) / 25)) : '0';
                }
                // Mise à jour évolutive des 3 Disques d'Or / Platine sur le mur Sud
                if (typeof window.syncCareerWallDiscs === 'function') window.syncCareerWallDiscs();
            } catch(e) {}
            
            const widgetClock = document.getElementById('widget-clock-time');
            if(widgetClock) widgetClock.innerHTML = timeStrWidget;
            
            document.getElementById('widget-clock-date').innerText = `Virtual Day ${state.day}`;
            if (typeof window.updateOnboardingGuide === 'function') window.updateOnboardingGuide();
        }

        // ==========================================
        // MICRO-ONBOARDING 3 ÉTAPES (NON-INTRUSIF)
        // ==========================================
        window.dismissOnboarding = function() {
            if (state) state.onboardingDismissed = true;
            const card = document.getElementById('onboarding-guide-card');
            if (card) card.classList.add('hidden');
            if (typeof saveGame === 'function') saveGame();
        };

        window.updateOnboardingGuide = function() {
            const card = document.getElementById('onboarding-guide-card');
            const list = document.getElementById('onboarding-steps-list');
            if (!card || !list || !state) return;
            const loginHidden = document.getElementById('login-screen')?.classList.contains('hidden');
            const tracks = Number(state.stats && state.stats.tracks) || 0;
            const bangers = Number(state.stats && state.stats.bangers) || 0;
            if (window.isBooting || !loginHidden || state.onboardingDismissed || tracks >= 3 || state.studioUnlocked) {
                card.classList.add('hidden');
                return;
            }
            const dawOpen = document.getElementById('app-daw')?.style.display === 'flex' || tracks >= 1;
            const steps = [
                { done: dawOpen,     text: 'Ouvre AbleStudio sur le PC (touche [E])' },
                { done: tracks >= 1, text: 'Règle BPM + Voix et exporte ta 1ère prod' },
                { done: bangers >= 1 || (state.ownedFurniture?.length || 0) >= 1, text: 'Décroche un Banger (7+/10) ou achète un meuble' }
            ];
            list.innerHTML = steps.map((s, idx) => `
                <div class="flex items-start gap-2 ${s.done ? 'text-emerald-400 line-through opacity-75' : 'text-zinc-200'}">
                    <span class="font-mono text-[10px] mt-0.5 shrink-0">${s.done ? '✓' : `${idx + 1}.`}</span>
                    <span class="leading-snug">${s.text}</span>
                </div>
            `).join('');
            card.classList.remove('hidden');
        };

        
                // ==========================================
        // 15. COOLDOWN UIs (AVEC JUICY BUTTONS)
        // ==========================================
        function updateCooldownUIs() {
            const total = getTotalMins();

            // Fonction interne pour gérer le glow des boutons actifs
            function updateButtonGlow(btn, isActive) {
                if (!btn) return;
                if (isActive) {
                    btn.classList.add('animate-pulse', 'glow-active');
                    btn.style.boxShadow = '0 0 15px rgba(129, 140, 248, 0.5)';
                } else {
                    btn.classList.remove('animate-pulse', 'glow-active');
                    btn.style.boxShadow = 'none';
                }
            }

            const btnDaw = document.getElementById('btn-export');
            if (btnDaw && !state.isExporting) {
                const dawReady = parseInt(state.cooldowns.dawTimeReady, 10) || 0;
                if (total < dawReady) {
                    const left = dawReady - total;
                    btnDaw.innerText = `CPU COOL (${formatTimeLeft(left)})`;
                    btnDaw.disabled = true;
                    updateButtonGlow(btnDaw, false); // Éteint le bouton
                } else {
                    if (btnDaw.disabled || btnDaw.innerText !== "RENDER MIXDOWN") {
                        btnDaw.innerText = "RENDER MIXDOWN";
                        btnDaw.disabled = false;
                    }
                    updateButtonGlow(btnDaw, true); // Allume le bouton
                }
            }

            const btnStory = document.getElementById('btn-story');
            const statusStory = document.getElementById('story-status');
            if (btnStory && statusStory) {
                const storyReady = parseInt(state.cooldowns.storyTimeReady, 10) || 0;
                if (total < storyReady) {
                    btnStory.disabled = true;
                    statusStory.innerText = "STATUS: COOLDOWN";
                    statusStory.className = "text-xs text-[var(--retro-orange)] mt-5 font-retro tracking-widest";
                    updateButtonGlow(btnStory, false); // Éteint le bouton
                } else {
                    btnStory.disabled = false;
                    statusStory.innerText = "STATUS: READY";
                    statusStory.className = "text-xs text-[var(--retro-green)] mt-5 font-retro tracking-widest drop-shadow-[0_0_5px_var(--retro-green)]";
                    updateButtonGlow(btnStory, true); // Allume le bouton
                }
            }

            const tabCrackz = document.getElementById('tab-crackz');
            if (tabCrackz && tabCrackz.classList.contains('text-white')) {
                const crackReady = parseInt(state.cooldowns.crackzTimeReady, 10) || 0;
                const isCooling  = total < crackReady;
                const cdTextEl   = document.getElementById('crackz-cd-text');
                if (isCooling) {
                    if (!cdTextEl) {
                        renderStore('crackz');
                    } else {
                        cdTextEl.innerText = formatTimeLeft(crackReady - total);
                    }
                } else if (cdTextEl) {
                    renderStore('crackz');
                }
            }
        }


        // ==========================================
        // 16. WINDOW MANAGEMENT

        // ==========================================
        // ==========================================
        globalThis.zIndexCounter = 120;
        globalThis.activeFocusedAppId = null;

        const OS_APP_DEFAULTS = {
            'app-daw': { w: 1040, h: 630 },
            'app-browser': { w: 900, h: 600 },
            'app-social': { w: 840, h: 590 },
            'app-stats': { w: 820, h: 570 },
            'app-echo': { w: 900, h: 610 },
            'app-empire': { w: 960, h: 620 },
            'sample-digger-window': { w: 660, h: 520 }
        };

        // Remplace l'ancien snapWindowAABB qui éjectait les fenêtres hors-écran :
        // Garde chaque fenêtre calmement et strictement dans la zone de travail sûre (entre HUD et Dock)
        function clampWindowToViewport(win) {
            if (!win || isMobile || window.innerWidth <= 768) return;
            const TOP_SAFE = 74;
            const BOTTOM_SAFE = 86;
            const SIDE_SAFE = 14;
            const maxW = Math.max(340, window.innerWidth - SIDE_SAFE * 2);
            const maxH = Math.max(300, window.innerHeight - TOP_SAFE - BOTTOM_SAFE);

            let w = win.offsetWidth || 800;
            let h = win.offsetHeight || 560;
            if (w > maxW) { w = maxW; win.style.width = `${Math.round(w)}px`; }
            if (h > maxH) { h = maxH; win.style.height = `${Math.round(h)}px`; }

            const rect = win.getBoundingClientRect();
            let left = isNaN(parseFloat(win.style.left)) ? rect.left : parseFloat(win.style.left);
            let top = isNaN(parseFloat(win.style.top)) ? rect.top : parseFloat(win.style.top);

            left = Math.max(SIDE_SAFE, Math.min(window.innerWidth - SIDE_SAFE - w, left));
            top = Math.max(TOP_SAFE, Math.min(window.innerHeight - BOTTOM_SAFE - h, top));

            win.style.left = `${Math.round(left)}px`;
            win.style.top = `${Math.round(top)}px`;
        }
        window.snapWindowAABB = clampWindowToViewport;

        function toggleMaximizeWindow(win) {
            if (!win || isMobile || window.innerWidth <= 768) return;
            if (win.classList.contains('window-maximized')) {
                win.classList.remove('window-maximized');
                if (win.dataset.prevLeft) win.style.left = win.dataset.prevLeft;
                if (win.dataset.prevTop) win.style.top = win.dataset.prevTop;
                if (win.dataset.prevWidth) win.style.width = win.dataset.prevWidth;
                if (win.dataset.prevHeight) win.style.height = win.dataset.prevHeight;
                clampWindowToViewport(win);
            } else {
                win.dataset.prevLeft = win.style.left || `${win.offsetLeft}px`;
                win.dataset.prevTop = win.style.top || `${win.offsetTop}px`;
                win.dataset.prevWidth = win.style.width || `${win.offsetWidth}px`;
                win.dataset.prevHeight = win.style.height || `${win.offsetHeight}px`;
                win.classList.add('window-maximized');
                win.style.left = '14px';
                win.style.top = '74px';
                win.style.width = `${window.innerWidth - 28}px`;
                win.style.height = `${window.innerHeight - 160}px`;
            }
            bringToFront(win.id);
        }

        function isWindowVisible(win) {
            if (!win) return false;
            const d = win.style.display;
            return d !== 'none' && d !== '';
        }

        function normalizeWindowZIndices() {
            const wins = Array.from(document.querySelectorAll('.os-window')).filter(isWindowVisible);
            wins.sort((a, b) => (parseInt(a.style.zIndex, 10) || 100) - (parseInt(b.style.zIndex, 10) || 100));
            let z = 120;
            wins.forEach(w => { w.style.zIndex = ++z; });
            zIndexCounter = z;
        }

        function openApp(id) {
            if (typeof hideBuyTooltip === 'function') hideBuyTooltip();

            if (id === 'app-browser') {
                if (canTriggerMiniGame() && Math.random() < 0.20) {
                    state.lastMiniGameTime = Date.now();
                    startPluginQuiz();
                    return;
                }
            }

            // Sur Mobile (Portrait & Paysage) : une seule fenêtre plein écran à la fois
            const isMobileCompact = Boolean(isMobile || window.innerWidth <= 768);
            if (isMobileCompact) {
                document.querySelectorAll('.os-window').forEach(wnd => {
                    if (wnd.id !== id && isWindowVisible(wnd)) {
                        closeApp(wnd.id);
                    }
                });
                const gear = document.getElementById('audio-settings-gear');
                const quitBtn = document.getElementById('btn-quit-pc');
                if (gear) gear.style.display = 'none';
                // En paysage mobile, garde le bouton Quitter accessible dans la top bar compacte
                if (quitBtn) quitBtn.style.display = (window.innerWidth > window.innerHeight) ? 'flex' : 'none';
            } else {
                // Desktop : garde toujours Quitter & Paramètres accessibles dans la top bar!
                const gear = document.getElementById('audio-settings-gear');
                const quitBtn = document.getElementById('btn-quit-pc');
                if (gear) gear.style.display = 'flex';
                if (quitBtn) quitBtn.style.display = 'flex';
            }

            const win = document.getElementById(id);
            if (!win) return;

            // Sécurité stacking context : assure que la fenêtre est enfant de #pc-ui-layer
            const pcUiLayerRoot = document.getElementById('pc-ui-layer');
            if (pcUiLayerRoot && win.parentElement !== pcUiLayerRoot) {
                pcUiLayerRoot.appendChild(win);
            }

            const wasHidden = !isWindowVisible(win);
            // FIX CRITIQUE : retire tout ancien 'display: none !important' avant d'afficher
            win.style.removeProperty('display');
            win.style.display = 'flex';

            if (id === 'app-daw') {
                updateDawPlugins();
                updateDawGenres();
                populateDawSamples();
                MusicSystem.muteForGameplay(0.5);
                const playhead = document.getElementById('playhead');
                if (playhead) playhead.classList.add('playhead-animated');
                if (!isMobile) generateRandomTimelineClips();
            }

            // Positionnement centré + cascade douce dans la zone sûre (Desktop uniquement)
            if (wasHidden && !isMobileCompact) {
                win.classList.remove('window-maximized');
                const TOP_SAFE = 74;
                const BOTTOM_SAFE = 86;
                const safeW = Math.max(360, window.innerWidth - 28);
                const safeH = Math.max(320, window.innerHeight - TOP_SAFE - BOTTOM_SAFE);
                const spec = OS_APP_DEFAULTS[id] || { w: 820, h: 580 };

                const targetW = Math.min(spec.w, safeW);
                const targetH = Math.min(spec.h, safeH);
                win.style.width = `${Math.round(targetW)}px`;
                win.style.height = `${Math.round(targetH)}px`;

                const otherOpenCount = Array.from(document.querySelectorAll('.os-window')).filter(w => w.id !== id && isWindowVisible(w)).length;
                const offset = (otherOpenCount % 5) * 28;
                const baseLeft = (window.innerWidth - targetW) / 2 + (otherOpenCount > 0 ? offset - 28 : 0);
                const baseTop = TOP_SAFE + Math.max(0, (safeH - targetH) / 2) + (otherOpenCount > 0 ? offset - 20 : 0);

                win.style.left = `${Math.round(baseLeft)}px`;
                win.style.top = `${Math.round(baseTop)}px`;
                clampWindowToViewport(win);

                // Animation d'ouverture propre jouée uniquement à l'ouverture
                win.classList.add('window-opening');
                setTimeout(() => win.classList.remove('window-opening'), 260);
            }

            bringToFront(id);
            if (!isMobile) updateTaskbar();
            try { if (typeof realignWidgets === 'function') realignWidgets(); } catch(e) {}
            if (typeof playUIAudio === 'function') { playUIAudio('open', 0.8); } else { playBleep(); }

            if (id === 'app-echo') initEchoApp();
            if (id === 'app-stats') refreshStats();
            if (id === 'app-social') refreshSocial();
            if (id === 'app-empire' && typeof window.renderEmpireApp === 'function') {
                window.renderEmpireApp();
                if (typeof state !== 'undefined' && state && !state.labelNamed && typeof window.openNarrativeIdentityModal === 'function') {
                    window.openNarrativeIdentityModal('label');
                }
            }
            if (id === 'app-daw' && typeof window.syncMasteringRackUI === 'function') window.syncMasteringRackUI();
            if (id === 'app-daw' && typeof window.updateDawEchoCopilot === 'function') window.updateDawEchoCopilot();
            if (id === 'app-browser') {
                const tabAudio = document.getElementById('tab-audio');
                const isAudioTab = tabAudio && tabAudio.classList.contains('text-white');
                renderStore(isAudioTab ? 'audio' : 'crackz');
            }
        }

        function closeApp(id, e) {
            if (e) {
                e.preventDefault();
                e.stopImmediatePropagation();
                e.stopPropagation();
            }
            if (id === 'app-daw') {
                MusicSystem.unmuteAfterGameplay(1.5);
                const playhead = document.getElementById('playhead');
                if (playhead) playhead.classList.remove('playhead-animated');
            }
            if (id === 'app-empire' && typeof window.stopVaultPreview === 'function') {
                window.stopVaultPreview();
            }
            const win = document.getElementById(id);
            if (win) {
                win.style.removeProperty('display');
                win.style.display = 'none';
                win.classList.remove('active-window', 'window-opening', 'window-maximized');
            }

            // Focus automatique de la prochaine fenêtre la plus haute si une reste ouverte
            const remaining = Array.from(document.querySelectorAll('.os-window')).filter(isWindowVisible);
            if (remaining.length > 0) {
                remaining.sort((a, b) => (parseInt(b.style.zIndex, 10) || 0) - (parseInt(a.style.zIndex, 10) || 0));
                bringToFront(remaining[0].id);
            } else {
                activeFocusedAppId = null;
                const gear = document.getElementById('audio-settings-gear');
                const quitBtn = document.getElementById('btn-quit-pc');
                if (gear) gear.style.display = 'flex';
                if (quitBtn) quitBtn.style.display = 'flex';
            }

            if (!isMobile) updateTaskbar();
            try { if (typeof realignWidgets === 'function') realignWidgets(); } catch(err) {}
            playBleep();
        }

        function bringToFront(id) {
            const win = document.getElementById(id);
            if (!win) return;
            if (zIndexCounter >= 880) normalizeWindowZIndices();
            zIndexCounter++;
            document.querySelectorAll('.os-window').forEach(w => w.classList.remove('active-window'));
            win.style.zIndex = zIndexCounter;
            win.classList.add('active-window');
            activeFocusedAppId = id;
            if (!isMobile) updateTaskbar();
        }

        function updateTaskbar() {
            if (isMobile) return;
            const container = document.getElementById('taskbar-apps');
            if (!container) return;
            container.innerHTML = '';
            const apps = [
                { id: 'app-daw',     name: 'AbleStudio', icon: '<svg class="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"></path></svg>' },
                { id: 'app-browser', name: 'Web_Nav',    icon: '<svg class="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"></path></svg>' },
                { id: 'app-social',  name: 'SoundNet',   icon: '<svg class="w-5 h-5 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>' },
                { id: 'app-stats',   name: 'Sys_Stats',  icon: '<svg class="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>' },
                { id: 'app-echo',    name: 'ECHO AI',    icon: '<svg class="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path></svg>' },
                { id: 'app-empire',  name: 'Empire / Label / Vault', icon: '<svg class="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>' }
            ];
            apps.forEach(app => {
                const winEl = document.getElementById(app.id);
                const isOpen = isWindowVisible(winEl);
                const isFocused = isOpen && (activeFocusedAppId === app.id || winEl.classList.contains('active-window'));
                const btn = document.createElement('div');
                btn.className = `taskbar-btn relative group ${isOpen ? 'active' : ''} ${isFocused ? 'is-focused' : ''}`;
                btn.innerHTML = `${app.icon}<div class="absolute -top-10 left-1/2 -translate-x-1/2 bg-[#0a0c14] border border-white/15 text-white text-[10px] px-2.5 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none font-retro tracking-wider shadow-xl">${app.name}</div>${isOpen ? '<div class="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-[var(--accent)] shadow-[0_0_6px_var(--accent)]"></div>' : ''}`;
                btn.onclick = () => {
                    if (!isOpen) openApp(app.id);
                    else bringToFront(app.id);
                };
                container.appendChild(btn);
            });
        }

        function realignWidgets() {
            try {
                const container = document.querySelector('.widgets-container');
                if (!container) return;
                container.classList.add('widgets-reflow');
                void container.offsetWidth;
                setTimeout(() => container.classList.remove('widgets-reflow'), 60);
            } catch(e) {}
        }

        window.addEventListener('resize', () => {
            try {
                realignWidgets();
                if (window.innerWidth > 768) {
                    document.querySelectorAll('.os-window').forEach(w => {
                        if (isWindowVisible(w)) {
                            if (w.classList.contains('window-maximized')) {
                                w.style.width = `${window.innerWidth - 28}px`;
                                w.style.height = `${window.innerHeight - 160}px`;
                            } else {
                                clampWindowToViewport(w);
                            }
                        }
                    });
                }
            } catch(e) {}
        });


        // ==========================================
        // 21. TOASTS
        // ==========================================
        globalThis.activeToasts = 0;
        const MAX_TOASTS = 3;

        function showToast(msg, type = 'info', onClick = null, priority = 1) {
             if (window.isBooting) return; // Si la session charge, on bloque 
             if (typeof playUIAudio === 'function') playUIAudio('toast', 0.7);
            const zone = document.getElementById('toast-zone');
            if (!zone) return;
            
            // Fix UI Mobile & Desktop : Anti-Spam (On ne duplique pas les toasts identiques)
            for (let child of zone.children) {
                const childText = type === 'review' ? child.innerHTML : child.innerText;
                if (childText === msg && child.dataset.toastType === type && !child.classList.contains('leaving')) {
                    child.style.transform = 'scale(1.05)';
                    child.style.filter = 'brightness(1.5)';
                    setTimeout(() => {
                        if (child.parentElement) {
                            child.style.transform = 'translateX(0) scale(1)';
                            child.style.filter = 'brightness(1)';
                        }
                    }, 150);
                    
                    if (child.hideTimer) clearTimeout(child.hideTimer);
                    child.hideTimer = setTimeout(() => { 
                        if (child.parentElement) { 
                            child.classList.add('leaving');
                            child.style.opacity = '0'; 
                            child.style.transition = 'opacity 0.4s'; 
                            setTimeout(() => { 
                                if (child.parentElement) child.remove(); 
                                updateToastStack();
                            }, 400); 
                        } 
                    }, 4000);
                    return;
                }
            }
            const t = document.createElement('div');
            let colorClass = "bg-black/90 border-gray-700 text-gray-100";
            if (type === 'success') colorClass = "bg-[#022c22] border-[var(--retro-green)] text-emerald-100 shadow-[0_0_15px_rgba(52,211,153,0.3)]";
            if (type === 'error')   colorClass = "bg-[#4c0519] border-[var(--retro-red)] text-rose-100 shadow-[0_0_15px_rgba(251,113,133,0.3)]";
            if (type === 'info')    colorClass = "bg-[#1e1b4b] border-[var(--accent)] text-indigo-100 shadow-[0_0_15px_rgba(129,140,248,0.3)]";
            if (type === 'discreet') colorClass = "bg-black/30 border-white/5 text-gray-500 shadow-none !py-2 !text-[9px]";
            
            if (type === 'review') {
                colorClass = "bg-[#0a0a0a]/95 border-gray-700 text-gray-100 shadow-[0_0_30px_rgba(0,0,0,0.8)] !p-0 overflow-hidden";
                t.className = `toast w-full max-w-[90%] md:max-w-md text-sm p-0 rounded-lg border font-retro backdrop-blur-xl ${colorClass} ${onClick ? 'cursor-pointer' : ''}`;
                t.innerHTML = msg;
            } else {
                t.className = `toast px-6 py-4 w-full rounded-lg border text-xs font-retro tracking-widest uppercase backdrop-blur-md ${colorClass} whitespace-pre-line leading-relaxed ${onClick ? 'cursor-pointer' : ''}`;
                t.innerText = msg;
            }
            t.dataset.toastType = type;

            // Mobile uniquement (portrait & paysage) : limite stricte à 1 toast simultané (+1 si review) pour ne jamais encombrer l'écran
            const isMobileToastViewport = (window.innerWidth <= 767) || (window.innerWidth <= 940 && window.innerHeight <= 500);
            if (isMobileToastViewport) {
                const maxMobileToasts = (type === 'review') ? 1 : 2;
                const existing = Array.from(zone.children).filter(el => !el.classList.contains('leaving'));
                while (existing.length >= maxMobileToasts) {
                    const oldest = existing.shift();
                    if (oldest && oldest.parentElement) {
                        if (oldest.hideTimer) clearTimeout(oldest.hideTimer);
                        oldest.remove();
                    }
                }
            }

            zone.appendChild(t);
            
            updateToastStack();

            const addSwipe = () => {
                let isDragging = false;
                let startX = 0;
                let currentDelta = 0;

                t.style.touchAction = 'pan-y'; 
                t.style.userSelect = 'none';  
                t.style.webkitUserSelect = 'none';

                t.addEventListener('pointerdown', (e) => {
                    isDragging = true;
                    startX = e.clientX;
                    currentDelta = 0;
                    
                    try { t.setPointerCapture(e.pointerId); } catch(err){}
                    
                    t.style.transition = 'none';
                    t.style.animation = 'none'; 
                });

                t.addEventListener('pointermove', (e) => {
                    if (!isDragging) return;
                    currentDelta = e.clientX - startX;
                    if (Math.abs(currentDelta) > 6) {
                        t.style.transform = `translateX(${currentDelta}px)`;
                        t.style.opacity = Math.max(0, 1 - Math.abs(currentDelta) / 200);
                    }
                });

                const onEnd = (e) => {
                    if (!isDragging) return;
                    isDragging = false;
                    try { t.releasePointerCapture(e.pointerId); } catch(err){}
                    
                    t.style.transition = 'transform 0.3s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.3s ease';

                    if (Math.abs(currentDelta) < 6) {
                        if (onClick) onClick();
                        // Sur mobile, un tap ferme instantanément la notif pour dégager la vue
                        if (onClick || isMobileToastViewport) {
                            t.classList.add('leaving');
                            t.style.opacity = '0';
                            setTimeout(() => { if (t.parentElement) t.remove(); updateToastStack(); }, 180);
                            return;
                        }
                    }

                    if (Math.abs(currentDelta) > 65) {
                        const direction = currentDelta > 0 ? '100vw' : '-100vw';
                        t.classList.add('leaving');
                        t.style.transform = `translateX(${direction})`;
                        t.style.opacity = '0';
                        setTimeout(() => { 
                            if (t.parentElement) t.remove(); 
                            updateToastStack();
                        }, 300);
                    } else {
                        t.style.transform = 'translateX(0)';
                        t.style.opacity = '1';
                        updateToastStack();
                    }
                };

                t.addEventListener('pointerup', onEnd);
                t.addEventListener('pointercancel', onEnd);
            };
            
            addSwipe();

            const autoHideMs = isMobileToastViewport ? (type === 'review' ? 4200 : 3000) : 4000;
            t.hideTimer = setTimeout(() => { 
                if (t.parentElement) { 
                    t.classList.add('leaving');
                    t.style.opacity = '0'; 
                    t.style.transition = 'opacity 0.4s'; 
                    setTimeout(() => { 
                        if (t.parentElement) t.remove(); 
                        updateToastStack();
                    }, 400); 
                } 
            }, autoHideMs);
        }


    // ==========================================
        // GESTION DU ZOOM (MÉTHODE BLINDÉE GLOBALE)
        // ==========================================
        window.targetCamZoom = 1.0;
        const MIN_ZOOM = 0.5; // Dézoom max
        const MAX_ZOOM = 3.0; // Zoom max
        globalThis.initialPinchDist = null;
        globalThis.initialZoomState = 1.0;

    // 1. Molette PC & Trackpad
        window.addEventListener('wheel', (e) => {
            // === NOUVEAU : Bloque le zoom natif du navigateur ===
            if (e.ctrlKey) {
                e.preventDefault(); 
            }
            // ====================================================

            // Si on scroll à l'intérieur d'une fenêtre d'UI (paramètres/achievements/etc.),
            // laisser l'UI gérer le scroll et ne pas modifier la caméra.
            try {
                if (e.target && e.target.closest && e.target.closest('.settings-shell, #audio-settings-overlay, .window-content, .achievement-map-grid, #achievements-grid, .os-window')) {
                    return; // don't turn wheel into camera zoom when interacting with UI
                }
            } catch (err) {}

            if (document.getElementById('pc-ui-layer').style.display === 'flex') return;
            if (document.getElementById('login-screen').style.display !== 'none') return;
            
            if (window.fps && window.isFpsRoomActive && window.isFpsRoomActive()) {
                window.fps.fovZoomOffset = Math.max(-22, Math.min(8, (window.fps.fovZoomOffset || 0) + e.deltaY * 0.025));
            }
            window.targetCamZoom -= e.deltaY * 0.002;
            window.targetCamZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, window.targetCamZoom));
            
        }, { passive: false });
        
        // 2. Tactile Mobile (Pincement)
        window.addEventListener('touchstart', (e) => {
            if (document.getElementById('pc-ui-layer').style.display === 'flex') return;
            // Ignore pinch gestures that start inside UI overlays (settings, achievements, windows)
            try {
                if (e.target && e.target.closest && e.target.closest('.settings-shell, #audio-settings-overlay, .window-content, .achievement-map-grid, #achievements-grid, .os-window')) return;
            } catch (err) {}
            if (e.touches.length === 2) {
                const dx = e.touches[0].clientX - e.touches[1].clientX;
                const dy = e.touches[0].clientY - e.touches[1].clientY;
                initialPinchDist = Math.hypot(dx, dy);
                initialZoomState = window.targetCamZoom;
            }
        }, { passive: true });

        window.addEventListener('touchmove', (e) => {
            if (document.getElementById('pc-ui-layer').style.display === 'flex') return;
            // If touchmove happens inside UI, don't treat it as camera pinch-zoom
            try {
                if (e.target && e.target.closest && e.target.closest('.settings-shell, #audio-settings-overlay, .window-content, .achievement-map-grid, #achievements-grid, .os-window')) return;
            } catch (err) {}
            if (e.touches.length === 2 && initialPinchDist) {
                const dx = e.touches[0].clientX - e.touches[1].clientX;
                const dy = e.touches[0].clientY - e.touches[1].clientY;
                const dist = Math.hypot(dx, dy);
                const ratio = dist / initialPinchDist;
                
                window.targetCamZoom = initialZoomState * ratio;
                window.targetCamZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, window.targetCamZoom));
            }
        }, { passive: true });

        window.addEventListener('touchend', (e) => {
            if (e.touches.length < 2) {
                initialPinchDist = null;
            }
        }, { passive: true });

        // === NOUVELLES VARIABLES DE FOCUS (SMOOTH ANCHOR) ===
    // 1. La position fixe par défaut de la caméra isométrique
    window.baseCameraPosition = new THREE.Vector3(10, 10, 10); 
    // 2. Un vecteur vide qui servira à calculer la visée smooth
    window.smoothCamTarget = new THREE.Vector3(0, 0, 0); 




            // ==========================================
    // GÉNÉRATEUR DE CONFETTIS DIGITAUX
    // ==========================================
    function fireConfetti(type = 'banger') {
        // Paramétrage selon le type d'événement
        let count = 0;
        let colors = [];
        
        if (type === 'banger') {
            count = 100; // Grosse explosion
            colors = ['#10b981', '#fbbf24', '#ffffff', '#34d399']; // Vert émeraude, Or, Blanc
        } else if (type === 'achievement') {
            count = 50; // Jolie récompense
            colors = ['#818cf8', '#fbbf24', '#d8b4fe']; // Accent (violet/bleu), Or, Lilas
        } else if (type === 'store') {
            count = 30; // Petit achat stylé
            colors = ['#3b82f6', '#10b981', '#ffffff']; // Bleu, Vert, Blanc
        } else if (type === 'rankup') { // Nouveau type pour la montée en ligue
            count = 150; // Encore plus de confettis pour un événement majeur
            colors = ['#fbbf24', '#ffd700', '#ffffff', '#a855f7']; // Doré, Blanc, Violet
        }

        for (let i = 0; i < count; i++) {
            const conf = document.createElement('div');
            conf.className = 'digital-confetti';
            
            // Randomisation de la couleur
            conf.style.background = colors[Math.floor(Math.random() * colors.length)];
            
            // Départ aléatoire sur la largeur de l'écran
            conf.style.left = Math.random() * 100 + 'vw';
            conf.style.top = -10 - (Math.random() * 50) + 'px';
            
            // Randomisation de la forme (carrés ou rectangles)
            if (Math.random() > 0.5) {
                conf.style.width = (4 + Math.random() * 4) + 'px';
                conf.style.height = (8 + Math.random() * 8) + 'px';
            } else {
                conf.style.width = (6 + Math.random() * 4) + 'px';
                conf.style.height = conf.style.width;
            }

            // Durée de chute et délai aléatoires pour faire "nuage"
            const duration = 1.5 + Math.random() * 2;
            const delay = Math.random() * 0.5;
            // On utilise cubic-bezier pour un départ rapide qui ralentit (comme une vraie explosion)
            conf.style.animationDuration = duration + 's';
            conf.style.animationDelay = delay + 's';
            conf.style.animationTimingFunction = 'cubic-bezier(0.25, 0.46, 0.45, 0.94)';

            document.body.appendChild(conf);
            
            // Auto-destruction propre pour ne pas faire lagger le jeu
            setTimeout(() => { if (conf.parentElement) conf.remove(); }, (duration + delay) * 1000);
        }
    }


        

function calculateMaxRep(rank) {
    const r = (rank && typeof rank === 'object') ? (Number(rank.id) || 1) : (Number(rank) || 1);
    if (r === 1) return 10;
    if (r === 2) return 30;
    if (r === 3) return 100;
    return 1000;
}


function updateToastStack() {
    const zone = document.getElementById('toast-zone');
    if (!zone) return;
    const toasts = Array.from(zone.children).filter(el => !el.classList.contains('leaving'));
    const count = toasts.length;

    if (count <= 2) {
        zone.style.height = 'auto';
        zone.style.position = '';
        toasts.forEach(t => {
            t.style.position = '';
            t.style.left = '';
            t.style.top = '';
            t.style.width = '';
            t.style.transform = '';
            t.style.zIndex = '';
            t.style.opacity = '';
            t.style.pointerEvents = 'auto';
            t.style.transition = 'all 0.3s ease';
        });
    } else {
        // Conserve position: fixed (déjà un containing block pour les toasts absolus, ne casse jamais le positionnement!)
        zone.style.position = '';
        let maxHeight = 60;
        toasts.forEach((t, i) => {
            t.style.position = 'absolute';
            t.style.left = '0';
            t.style.top = '0';
            t.style.width = '100%';
            t.style.transition = 'transform 0.3s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.3s ease, z-index 0.3s ease';
            
            const reverseIdx = count - 1 - i;
            maxHeight = Math.max(maxHeight, t.offsetHeight || 60);

            if (reverseIdx === 0) {
                t.style.transform = 'translateY(0) scale(1)';
                t.style.zIndex = '100';
                t.style.opacity = '1';
                t.style.pointerEvents = 'auto';
            } else if (reverseIdx === 1) {
                t.style.transform = 'translateY(8px) scale(0.95)';
                t.style.zIndex = '99';
                t.style.opacity = '0.85';
                t.style.pointerEvents = 'none';
            } else if (reverseIdx === 2) {
                t.style.transform = 'translateY(16px) scale(0.90)';
                t.style.zIndex = '98';
                t.style.opacity = '0.70';
                t.style.pointerEvents = 'none';
            } else {
                t.style.transform = 'translateY(24px) scale(0.85)';
                t.style.zIndex = (97 - reverseIdx).toString();
                t.style.opacity = '0';
                t.style.pointerEvents = 'none';
            }
        });
        zone.style.height = (maxHeight + 24) + 'px';
    }
}

window.calculateMaxRep = calculateMaxRep;
window.playQTEGenrePreview = playQTEGenrePreview;
window.stopQTEGenrePreview = stopQTEGenrePreview;
window.updateToastStack = updateToastStack;

// --- Global Bridge & ES Exports ---
Object.assign(globalThis, { relocateAchievementPopup, loadingPhrases, simulateLoading, hideLoader, initLoader, computeIsMobileLayout, themesList, cycleTheme, updateThemeColors, animateHUDNumber, openAudioSettings, closeAudioSettings, updateMoodRingWidget, openAchievementsBoard, closeAchievementsBoard, PLAYER_RANKS, calculateLevelData, getRankContext, getCurrentRank, triggerLevelUp, triggerRankUp, ensureGlobalTooltip, toggleTooltip, showTooltip, hideTooltip, initTooltipListeners, sysCanvasUI, sysCtxUI, drawSysGraphUI, simulateVuMeter, normalizeAchievementState, getAchievementOrder, getNestedStateValue, escapeHTML, getInGameTimeLabel, stampAchievementUnlock, getAchievementProgress, getAchievementEntries, migrateCompletedAchievementProgress, getAchievementUnlockLabel, initAchievementsUI, switchSettingsPanel, setAchievementCategory, setAchievementFilter, refreshAchievementsPanel, renderAchievementsPanel, unlockAchievement, processAchievementQueue, checkAchievement, claimAchievementReward, initCinematicRain, stopCinematicRain, initCinematicsListeners, updateParallaxLoop, ESCAPE_QUOTES, getActivePlayerAvatar, startCinematicRandomLoop, ACHIEVEMENT_CATEGORIES, ACHIEVEMENT_FILTERS, ACHIEVEMENT_DETAILS, formatNum, getTotalMins, formatTimeLeft, spawnFloatingText, logMoney, spawnMoneyParticles, generateFanName, logFollower, getVpnCooldown, getDawCooldown, initUI, selectAvatar, attemptLogin, updateHUD, updateCooldownUIs, OS_APP_DEFAULTS, clampWindowToViewport, toggleMaximizeWindow, isWindowVisible, normalizeWindowZIndices, openApp, closeApp, bringToFront, updateTaskbar, realignWidgets, MAX_TOASTS, showToast, MIN_ZOOM, MAX_ZOOM, fireConfetti, calculateMaxRep, updateToastStack });
export { relocateAchievementPopup, loadingPhrases, simulateLoading, hideLoader, initLoader, computeIsMobileLayout, themesList, cycleTheme, updateThemeColors, animateHUDNumber, openAudioSettings, closeAudioSettings, updateMoodRingWidget, openAchievementsBoard, closeAchievementsBoard, PLAYER_RANKS, calculateLevelData, getRankContext, getCurrentRank, triggerLevelUp, triggerRankUp, ensureGlobalTooltip, toggleTooltip, showTooltip, hideTooltip, initTooltipListeners, sysCanvasUI, sysCtxUI, drawSysGraphUI, simulateVuMeter, normalizeAchievementState, getAchievementOrder, getNestedStateValue, escapeHTML, getInGameTimeLabel, stampAchievementUnlock, getAchievementProgress, getAchievementEntries, migrateCompletedAchievementProgress, getAchievementUnlockLabel, initAchievementsUI, switchSettingsPanel, setAchievementCategory, setAchievementFilter, refreshAchievementsPanel, renderAchievementsPanel, unlockAchievement, processAchievementQueue, checkAchievement, claimAchievementReward, initCinematicRain, stopCinematicRain, initCinematicsListeners, updateParallaxLoop, ESCAPE_QUOTES, getActivePlayerAvatar, startCinematicRandomLoop, ACHIEVEMENT_CATEGORIES, ACHIEVEMENT_FILTERS, ACHIEVEMENT_DETAILS, formatNum, getTotalMins, formatTimeLeft, spawnFloatingText, logMoney, spawnMoneyParticles, generateFanName, logFollower, getVpnCooldown, getDawCooldown, initUI, selectAvatar, attemptLogin, updateHUD, updateCooldownUIs, OS_APP_DEFAULTS, clampWindowToViewport, toggleMaximizeWindow, isWindowVisible, normalizeWindowZIndices, openApp, closeApp, bringToFront, updateTaskbar, realignWidgets, MAX_TOASTS, showToast, MIN_ZOOM, MAX_ZOOM, fireConfetti, calculateMaxRep, updateToastStack };
