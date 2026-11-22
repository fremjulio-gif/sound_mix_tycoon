import { THREE } from './libs.js';

        // Déverrouillage universel WebAudio (iOS Safari / Android Chrome) dès le premier toucher ou clic
        function installGlobalAudioUnlocker() {
            const unlock = () => {
                try {
                    if (typeof audioCtx !== 'undefined' && audioCtx && audioCtx.state === 'suspended') {
                        audioCtx.resume().catch(() => {});
                    }
                    if (window.THREE && typeof listener !== 'undefined' && listener && listener.context && listener.context.state === 'suspended') {
                        listener.context.resume().catch(() => {});
                    }
                } catch(e) {}
            };
            window.addEventListener('pointerdown', unlock, { passive: true });
            window.addEventListener('touchstart', unlock, { passive: true });
        }

        // ==========================================
        // SYSTÈME DE MIXAGE VERTICAL (BGM)
        // ==========================================
        // Ajout d'une variable pour suivre la piste musicale active
        globalThis.currentActiveTrackKey = 'room'; // Initialisé à 'room' par défaut
        const MusicSystem = (() => {
            let audioCtx = null;
            let biquadFilter = null; // Ajout du filtre Biquad
            let masterGain = null;
            
            const tracks = {
                menu:  { url: 'mus_menu.wav',  buffer: null, source: null, gainNode: null, targetVol: 0.8 },
                room:  { url: 'mus_room.wav',  buffer: null, source: null, gainNode: null, targetVol: 0.8 },
                sleep: { url: 'mus_sleep.wav', buffer: null, source: null, gainNode: null, targetVol: 0.8 }
            };

            let isInitialized = false;

            async function init() {
                if (isInitialized) return;
                
                const AudioContext = window.AudioContext || window.webkitAudioContext;
                audioCtx = new AudioContext();

                // 🚨 LE FIX EST ICI : Déblocage immédiat de l'audio 
                if (audioCtx.state === 'suspended') {
                    audioCtx.resume().catch(e => console.warn("Audio resume", e));
                }
                
                // Hack de l'oscillateur silencieux pour verrouiller l'autorisation du navigateur
                const osc = audioCtx.createOscillator();
                const silentGain = audioCtx.createGain();
                silentGain.gain.value = 0; // Volume à 0 (inaudible)
                osc.connect(silentGain);
                silentGain.connect(audioCtx.destination);
                osc.start(0);
                osc.stop(audioCtx.currentTime + 0.01);

                // Création du bus principal
                masterGain = audioCtx.createGain();
                masterGain.gain.value = 1.0; // Volume initial

                // Création du filtre passe-bas
                biquadFilter = audioCtx.createBiquadFilter();
                biquadFilter.type = "lowpass";
                biquadFilter.frequency.setValueAtTime(20000, audioCtx.currentTime); // Fréquence de coupure très haute par défaut (pas d'effet)
                biquadFilter.Q.setValueAtTime(1, audioCtx.currentTime); // Q factor par défaut

                masterGain.connect(biquadFilter); // Connecte le masterGain au filtre
                biquadFilter.connect(audioCtx.destination); // Connecte le filtre à la destination

                // Maintenant, on peut télécharger les fichiers en prenant tout le temps nécessaire
                const loadPromises = Object.keys(tracks).map(async (key) => {
                    try {
                        const response = await fetch(tracks[key].url);
                        if (!response.ok) return;
                        const arrayBuffer = await response.arrayBuffer();
                        tracks[key].buffer = await audioCtx.decodeAudioData(arrayBuffer);
                    } catch (e) {
                        console.warn(`MusicSystem: piste ${key} indisponible (${tracks[key].url})`, e);
                        tracks[key].buffer = null;
                    }
                });

                await Promise.all(loadPromises);
                isInitialized = true;
            }

            function startAllTracks() {
                if (!isInitialized || !audioCtx) return;
                if (audioCtx.state === 'suspended') {
                    audioCtx.resume().catch(() => {});
                }

                const startTime = audioCtx.currentTime + 0.1;

                Object.keys(tracks).forEach(key => {
                    const track = tracks[key];
                    if (!track || !track.buffer) return;
                    
                    track.gainNode = audioCtx.createGain(); // Crée un gainNode pour chaque piste
                    // Initialise le volume en fonction de la piste active et du volume global de la musique
                    track.gainNode.gain.value = (key === currentActiveTrackKey) ? track.targetVol * window.musicVolume : 0;
                    track.gainNode.connect(masterGain);

                    track.source = audioCtx.createBufferSource();
                    track.source.buffer = track.buffer;
                    track.source.loop = true; // Boucle la musique
                    track.source.connect(track.gainNode);
                    
                    track.source.start(startTime);
                });
            }

            function crossfadeTo(targetKey, fadeDuration = 3.0) {
                if (!isInitialized) return;
                const now = audioCtx.currentTime;

                currentActiveTrackKey = targetKey; // Met à jour la piste active
                
                // On s'assure que le master volume est réactivé si on était dans le DAW
                if (masterGain) {
                    masterGain.gain.cancelScheduledValues(now);
                    masterGain.gain.setValueAtTime(masterGain.gain.value, now);
                    masterGain.gain.linearRampToValueAtTime(1.0, now + fadeDuration);
                }

                Object.keys(tracks).forEach(key => {
                    if (!tracks[key] || !tracks[key].gainNode) return;
                    const gainParam = tracks[key].gainNode.gain;
                    
                    gainParam.cancelScheduledValues(now); // Annule les changements de volume précédents
                    
                    // Applique le volume cible (avec le volume global de la musique)
                    const finalVol = (key === targetKey) ? tracks[key].targetVol * window.musicVolume : 0;
                    
                    // Transition douce avec setTargetAtTime pour éviter les bugs de linearRamp
                    gainParam.setTargetAtTime(finalVol, now, fadeDuration / 3); 
                });
            }

            function setMasterVolume(volume) {
                if (masterGain) {
                    masterGain.gain.setValueAtTime(volume, audioCtx.currentTime);
                }
            }

            function setMusicVolume(volume) {
                if (tracks[currentActiveTrackKey] && tracks[currentActiveTrackKey].gainNode) {
                    tracks[currentActiveTrackKey].gainNode.gain.setValueAtTime(tracks[currentActiveTrackKey].targetVol * volume, audioCtx.currentTime);
                }
            }

            function muteForGameplay(fadeDuration = 0.5) {
                if (!isInitialized || !masterGain) return;
                const now = audioCtx.currentTime;
                masterGain.gain.cancelScheduledValues(now);
                masterGain.gain.setValueAtTime(masterGain.gain.value, now);
                masterGain.gain.linearRampToValueAtTime(0, now + fadeDuration);
            }

            function unmuteAfterGameplay(fadeDuration = 1.0) {
                if (!isInitialized || !masterGain) return;
                const now = audioCtx.currentTime;
                masterGain.gain.cancelScheduledValues(now);
                masterGain.gain.setValueAtTime(masterGain.gain.value, now);
                masterGain.gain.linearRampToValueAtTime(1.0, now + fadeDuration);
            }

            function setLowPassFrequency(frequency, fadeDuration = 1.0) {
                if (!isInitialized || !biquadFilter) return;
                const now = audioCtx.currentTime;
                biquadFilter.frequency.cancelScheduledValues(now);
                biquadFilter.frequency.setValueAtTime(biquadFilter.frequency.value, now);
                biquadFilter.frequency.linearRampToValueAtTime(frequency, now + fadeDuration);
            }


            return {
                init,
                startAllTracks,
                crossfadeTo,
                muteForGameplay,
                unmuteAfterGameplay,
                setMasterVolume, // Expose la fonction de contrôle du volume master
                setMusicVolume,   // Expose la fonction de contrôle du volume de la musique
                setLowPassFrequency // Expose la fonction de contrôle du filtre passe-bas
            };
        })();


        // =========================================================================
        // 2D CINEMATIC & PROCEDURAL WEB AUDIO ENGINE (Anime.js V4 Powered)
        // =========================================================================

        class ProceduralAmbientAudio {
            constructor() {
                this.ctx = null;
                this.masterGain = null;
                this.noiseSource = null;
                this.noiseFilter = null;
                this.padOsc1 = null;
                this.padOsc2 = null;
                this.padGain = null;
                this.isPlaying = false;
            }

            init(audioCtx) {
                this.ctx = audioCtx;
                this.masterGain = this.ctx.createGain();
                this.masterGain.gain.setValueAtTime(0.0001, this.ctx.currentTime);
                this.masterGain.connect(this.ctx.destination);
            }

            start() {
                if (!this.ctx) {
                    const AudioContext = window.AudioContext || window.webkitAudioContext;
                    this.init(new AudioContext());
                }
                if (this.ctx.state === 'suspended') {
                    this.ctx.resume().catch(() => {});
                }
                if (this.isPlaying) return;
                this.isPlaying = true;

                const now = this.ctx.currentTime;

                // 1. Génération de Bruit Rose / Pluie procédurale très douce (Buffer de 2 secondes en boucle)
                const bufferSize = this.ctx.sampleRate * 2;
                const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
                const output = noiseBuffer.getChannelData(0);
                let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
                for (let i = 0; i < bufferSize; i++) {
                    const white = Math.random() * 2 - 1;
                    b0 = 0.99886 * b0 + white * 0.0555179;
                    b1 = 0.99332 * b1 + white * 0.0750759;
                    b2 = 0.96900 * b2 + white * 0.1538520;
                    b3 = 0.86650 * b3 + white * 0.3104856;
                    b4 = 0.55000 * b4 + white * 0.5329522;
                    b5 = -0.7616 * b5 - white * 0.0168980;
                    output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.02; // Atténuation initiale
                    b6 = white * 0.115926;
                }

                this.noiseSource = this.ctx.createBufferSource();
                this.noiseSource.buffer = noiseBuffer;
                this.noiseSource.loop = true;

                this.noiseFilter = this.ctx.createBiquadFilter();
                this.noiseFilter.type = 'bandpass';
                this.noiseFilter.frequency.setValueAtTime(1200, now);
                this.noiseFilter.Q.setValueAtTime(1.0, now);

                const noiseGain = this.ctx.createGain();
                // FIX AUDIO : Volume très doux et feutré (0.02 max)
                noiseGain.gain.setValueAtTime(0.02, now);

                this.noiseSource.connect(this.noiseFilter);
                this.noiseFilter.connect(noiseGain);
                noiseGain.connect(this.masterGain);

                // 2. Pad Synth Harmonique Apaisant (432Hz Racine + Quinte)
                this.padOsc1 = this.ctx.createOscillator();
                this.padOsc2 = this.ctx.createOscillator();
                this.padOsc1.type = 'sine';
                this.padOsc2.type = 'sine';
                this.padOsc1.frequency.setValueAtTime(108, now); // A2
                this.padOsc2.frequency.setValueAtTime(162, now); // E3

                const padFilter = this.ctx.createBiquadFilter();
                padFilter.type = 'lowpass';
                padFilter.frequency.setValueAtTime(220, now);

                this.padGain = this.ctx.createGain();
                // FIX AUDIO : Pad subtil à 0.015 max
                this.padGain.gain.setValueAtTime(0.015, now);

                this.padOsc1.connect(padFilter);
                this.padOsc2.connect(padFilter);
                padFilter.connect(this.padGain);
                this.padGain.connect(this.masterGain);

                this.noiseSource.start(now);
                this.padOsc1.start(now);
                this.padOsc2.start(now);

                // Fondu d'ouverture très progressif et apaisant (fade-in linéaire sur 1.8s vers 0.025)
                this.masterGain.gain.cancelScheduledValues(now);
                this.masterGain.gain.setValueAtTime(0.0001, now);
                this.masterGain.gain.linearRampToValueAtTime(0.025, now + 1.8);
            }

            stop() {
                if (!this.isPlaying || !this.ctx) return;
                const now = this.ctx.currentTime;
                this.masterGain.gain.cancelScheduledValues(now);
                this.masterGain.gain.setValueAtTime(Math.max(0.0001, this.masterGain.gain.value), now);
                // Fondu de fermeture doux sur 1.5s
                this.masterGain.gain.linearRampToValueAtTime(0.0001, now + 1.5);

                setTimeout(() => {
                    try {
                        if (this.noiseSource) { this.noiseSource.stop(); this.noiseSource.disconnect(); }
                        if (this.padOsc1) { this.padOsc1.stop(); this.padOsc1.disconnect(); }
                        if (this.padOsc2) { this.padOsc2.stop(); this.padOsc2.disconnect(); }
                    } catch(e) {}
                    this.isPlaying = false;
                }, 1600);
            }
        }

        const ambientAudioEngine = new ProceduralAmbientAudio();

        // --- GESTIONNAIRE DE PLUIE 2D SUR CANVAS ---

                // ==========================================
        // 7. AUDIO
        // ==========================================
        globalThis.audioCtxUI = null;
        // --- VARIABLES PIANO ROLL ---
        const activeSynthNotes = {};
        
        // Mapping basé sur les touches physiques (QWERTY position = AZERTY position)
        // Rangée du bas (blanches) + Rangée du milieu (noires)
        const PC_KEY_MAP = {
            'KeyZ': 'C3', 'KeyS': 'C#3', 'KeyX': 'D3', 'KeyD': 'D#3', 'KeyC': 'E3',
            'KeyV': 'F3', 'KeyG': 'F#3', 'KeyB': 'G3', 'KeyH': 'G#3', 'KeyN': 'A3',
            'KeyJ': 'A#3', 'KeyM': 'B3', 'Comma': 'C4', 'KeyL': 'C#4', 'Period': 'D4',
            'Semicolon': 'D#4', 'Slash': 'E4'
        };

        // Convertit une note "C3", "A#4" en fréquence Hertz
        function noteToFreq(note) {
            const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
            const octave = parseInt(note.slice(-1));
            const keyNumber = notes.indexOf(note.slice(0, -1));
            if (keyNumber === -1) return 0;
            // Formule standard : La4 (A4) = 440Hz
            return 440 * Math.pow(2, (keyNumber - 9 + (octave - 4) * 12) / 12);
        }
// =========================================================================
// MOTEUR FOLEY WEBAUDIO PROCÉDURAL (ZERO 404 · SON STUDIO TACTILE PROPRE)
// =========================================================================
const UIAudioBuffers = {};

async function preloadUIAudio() {
    if (!audioCtxUI) initAudio();
    // Plus de fetch 404 sur ./audio/u_ui_*.wav : tous les effets UI sont synthétisés en WebAudio pur!
}

function playUIAudio(key, volume = 1.0) {
    try {
        if (!audioCtxUI) initAudio();
        if (!audioCtxUI) return;
        if (audioCtxUI.state === 'suspended') {
            if (key === 'hover') return; // Ne force pas resume sur un simple survol
            audioCtxUI.resume().catch(() => {});
        }
        const sfxVol = (window.sfxVolume !== undefined ? Number(window.sfxVolume) : 0.5);
        const masterVol = (typeof state !== 'undefined' && state && state.masterVolume !== undefined) ? Number(state.masterVolume) : 1.0;
        const v = Math.max(0.001, Math.min(1, volume * sfxVol * masterVol));
        if (v <= 0.002) return;

        const now = audioCtxUI.currentTime;
        const makeVoice = (type, fStart, fEnd, dur, peakGain, delay = 0) => {
            const osc = audioCtxUI.createOscillator();
            const g = audioCtxUI.createGain();
            osc.type = type;
            osc.frequency.setValueAtTime(fStart, now + delay);
            if (fEnd !== fStart) osc.frequency.exponentialRampToValueAtTime(Math.max(20, fEnd), now + delay + dur);
            g.gain.setValueAtTime(0.0001, now + delay);
            g.gain.linearRampToValueAtTime(peakGain * v, now + delay + 0.008);
            g.gain.exponentialRampToValueAtTime(0.0001, now + delay + dur);
            osc.connect(g);
            g.connect(audioCtxUI.destination);
            osc.start(now + delay);
            osc.stop(now + delay + dur + 0.02);
        };

        switch (key) {
            case 'hover':
                makeVoice('sine', 1650, 1200, 0.028, 0.035);
                break;
            case 'generic':
            case 'switch':
                makeVoice('triangle', 740, 420, 0.045, 0.11);
                makeVoice('sine', 1480, 980, 0.022, 0.045);
                break;
            case 'open':
                makeVoice('sine', 340, 620, 0.09, 0.09);
                makeVoice('triangle', 680, 960, 0.08, 0.04, 0.03);
                break;
            case 'toast':
                makeVoice('sine', 880, 880, 0.09, 0.08);
                makeVoice('sine', 1318.5, 1318.5, 0.13, 0.05, 0.045);
                break;
            case 'stat':
                makeVoice('triangle', 987.8, 1318.5, 0.06, 0.07);
                break;
            case 'transaction':
                makeVoice('sine', 1046.5, 1046.5, 0.12, 0.12, 0);
                makeVoice('triangle', 1567.98, 1567.98, 0.22, 0.11, 0.065);
                makeVoice('sine', 2093.0, 2093.0, 0.24, 0.06, 0.11);
                break;
            case 'succes':
                // Accord chaleureux Rhodes Maj9 (C5 - E5 - G5 - D6)
                makeVoice('triangle', 523.25, 523.25, 0.22, 0.11, 0);
                makeVoice('triangle', 659.25, 659.25, 0.24, 0.09, 0.05);
                makeVoice('sine', 783.99, 783.99, 0.28, 0.09, 0.10);
                makeVoice('sine', 1174.66, 1174.66, 0.34, 0.06, 0.14);
                break;
            case 'erreur':
                // Tape-stop sourd & mat (jamais agressif)
                makeVoice('sawtooth', 220, 125, 0.16, 0.09, 0);
                makeVoice('triangle', 165, 92, 0.22, 0.10, 0.09);
                break;
            default:
                makeVoice('triangle', 640, 480, 0.05, 0.08);
        }
    } catch (e) {}
}

function installHoverAudioDelegate() {
document.addEventListener('mouseover', (e) => {
    const target = e.target.closest('button, .cursor-pointer, .btn, .btn-action, .btn-juice, .genre-btn, .taskbar-btn, .os-window-btn');
    if (target && !target.disabled) {
        if (!target.dataset.hoverSoundPlayed) {
            playUIAudio('hover', 0.15);
            target.dataset.hoverSoundPlayed = 'true';
            target.addEventListener('mouseleave', () => {
                delete target.dataset.hoverSoundPlayed;
            }, { once: true });
        }
    }
});
}

        function initAudio() {
            if (!audioCtxUI) {
                try {
                    const AC = window.AudioContext || window.webkitAudioContext;
                    if (AC) audioCtxUI = new AC();
                } catch(e) {}
            }
        }
        function playTone(freq, type = 'sine', duration = 0.1, vol = 0.1) {
            try {
                if (!audioCtxUI) initAudio();
                if (!audioCtxUI) return;
                if (audioCtxUI.state === 'suspended') audioCtxUI.resume();
                const osc = audioCtxUI.createOscillator(); // Crée un oscillateur
                const gain = audioCtxUI.createGain();     // Crée un nœud de gain
                osc.type = type; osc.frequency.setValueAtTime(freq, audioCtxUI.currentTime);
                gain.gain.setValueAtTime(vol * window.sfxVolume, audioCtxUI.currentTime); // Applique le volume des FX
                gain.gain.exponentialRampToValueAtTime(0.01 * window.sfxVolume, audioCtxUI.currentTime + duration); // Applique le volume des FX
                osc.connect(gain); gain.connect(audioCtxUI.destination);
                osc.start(); osc.stop(audioCtxUI.currentTime + duration);
            } catch(e) {}
        }

        function playSynthNote(note, isPlaying) {
            if (!audioCtxUI) initAudio();
            if (!audioCtxUI) return;
            
            // Sécurité : Ne pas jouer de son si l'audio context est suspendu
            if (audioCtxUI.state === 'suspended') {
                audioCtxUI.resume();
            }
            
            // Récupère l'élément du clavier UI créé à l'étape 2 pour le feedback visuel
            const keyEl = document.querySelector(`.pr-key-row[data-note="${note}"]`);
            if (!keyEl) return; // S'assurer que l'élément existe

            if (isPlaying) {
                if (activeSynthNotes[note]) return; // Empêche le chevauchement si la note joue déjà

                const osc = audioCtxUI.createOscillator();
                const gain = audioCtxUI.createGain();
                
                osc.type = 'sawtooth'; // Forme d'onde "Synth Lead"
                osc.frequency.setValueAtTime(noteToFreq(note), audioCtxUI.currentTime);
                
                // Enveloppe d'attaque rapide (évite les clics audio)
                gain.gain.setValueAtTime(0, audioCtxUI.currentTime);
                gain.gain.linearRampToValueAtTime(0.12, audioCtxUI.currentTime + 0.03); 
                
                osc.connect(gain);
                gain.connect(audioCtxUI.destination);
                osc.start();
                
                activeSynthNotes[note] = { osc, gain };
                
                // Allume la touche UI
                if (keyEl) keyEl.style.filter = 'brightness(1.5) drop-shadow(0 0 8px var(--accent))';
                
            } else {
                const voice = activeSynthNotes[note];
                if (voice) {
                    // Enveloppe de relâchement (Release fade out)
                    voice.gain.gain.setValueAtTime(voice.gain.gain.value, audioCtxUI.currentTime);
                    voice.gain.gain.exponentialRampToValueAtTime(0.001, audioCtxUI.currentTime + 0.1); 
                    voice.osc.stop(audioCtxUI.currentTime + 0.15);
                    delete activeSynthNotes[note];
                }
                
                // Éteint la touche UI
                if (keyEl) keyEl.style.filter = '';
            }
        }

        // Kill any transient preview voices (used by PianoRoll preview/drags)
        function killPreviewVoices() {
            if (!audioCtxUI) initAudio();
            if (!audioCtxUI) return;
            const now = audioCtxUI.currentTime || 0;
            try {
                Object.keys(activeSynthNotes).forEach(k => {
                    const v = activeSynthNotes[k];
                    try { v.gain.gain.cancelScheduledValues(now); } catch(e) {}
                    try { v.gain.gain.setTargetAtTime(0, now, 0.01); } catch(e) {}
                    try { v.osc.stop && v.osc.stop(now + 0.03); } catch(e) {}
                    try { v.osc.disconnect && v.osc.disconnect(); } catch(e) {}
                    try { v.gain.disconnect && v.gain.disconnect(); } catch(e) {}
                    delete activeSynthNotes[k];
                });
            } catch(e) {}
        }
        
        const playBleep   = () => { if (typeof playUIAudio === 'function') { playUIAudio('generic', 0.6); } else { playTone(800, 'sine', 0.05, 0.03); } };
        const playSuccess = () => { if (typeof playUIAudio === 'function') { playUIAudio('succes', 0.8); } else { playTone(600, 'square', 0.1, 0.03); setTimeout(() => playTone(800, 'square', 0.15, 0.03), 100); } };
        const playError   = () => { if (typeof playUIAudio === 'function') { playUIAudio('erreur', 0.8); } else { playTone(200, 'sawtooth', 0.2, 0.05); setTimeout(() => playTone(150, 'sawtooth', 0.3, 0.05), 150); } };
        const playKick    = () => { playTone(60, 'sine', 0.2, 0.2); playTone(120, 'square', 0.05, 0.1); };
        const playCashSound = () => { if (typeof playUIAudio === 'function') { playUIAudio('transaction', 0.8); } else { playTone(600, 'sine', 0.1, 0.08); setTimeout(() => playTone(1200, 'sine', 0.2, 0.08), 100); } };
        window.playClick = () => { if (typeof playUIAudio === 'function') { playUIAudio('generic', 0.6); } else { playTone(1200, 'sine', 0.05, 0.02); } };
        
        // Nouveau son pour le Level Up
        const playLevelUpSound = () => {
            playTone(440, 'triangle', 0.1, 0.05); // A4
            setTimeout(() => playTone(554, 'triangle', 0.1, 0.05), 50); // C#5
            setTimeout(() => playTone(659, 'triangle', 0.2, 0.08), 100); // E5
            setTimeout(() => playTone(880, 'sine', 0.3, 0.1), 200); // A5 (plus prononcé)
        };
        

    // ==========================================
    // GENRE PREVIEW AUDIO
    // ==========================================
    globalThis.currentGenrePreviewAudio = null;
    globalThis.specCtx = null;
    globalThis.specAnalyser = null;
    globalThis.specDataArray = null;
    globalThis.specReqId = null;

    function initSpectrogram() {
        if (!specCtx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            specCtx = new AudioContext();
            specAnalyser = specCtx.createAnalyser();
            specAnalyser.fftSize = 64;
            specAnalyser.smoothingTimeConstant = 0.8;
            specDataArray = new Uint8Array(specAnalyser.frequencyBinCount);
        }
    }

    function drawSpectrogram() {
        const canvas = document.getElementById('genre-spectrogram');
        if (!canvas) return;
        
        // Match internal resolution to display size
        if (canvas.width !== canvas.clientWidth) {
            canvas.width = canvas.clientWidth;
            canvas.height = canvas.clientHeight;
        }
        
        const ctx = canvas.getContext('2d');
        const W = canvas.width;
        const H = canvas.height;

        // OCCLUSION CULLING MOBILE : Ne rien calculer ni dessiner si AbleStudio est caché
        if (window.innerWidth <= 768) {
            const dawApp = document.getElementById('app-daw');
            if (dawApp && (dawApp.style.display === 'none' || dawApp.classList.contains('hidden'))) {
                specReqId = requestAnimationFrame(drawSpectrogram);
                return;
            }
        }

        if (currentGenrePreviewAudio && !currentGenrePreviewAudio.paused && specAnalyser) {
            specAnalyser.getByteFrequencyData(specDataArray);
        } else if (specDataArray) {
            for (let i = 0; i < specDataArray.length; i++) {
                specDataArray[i] = Math.max(0, specDataArray[i] - 5);
            }
        }

        ctx.clearRect(0, 0, W, H);
        
        if (specDataArray) {
            const barWidth = (W / specDataArray.length) * 1.5;
            let x = 0;

            for (let i = 0; i < specDataArray.length; i++) {
                const barHeight = (specDataArray[i] / 255) * H;
                
                ctx.fillStyle = '#10b981';
                ctx.shadowBlur = 10;
                ctx.shadowColor = '#10b981';
                
                ctx.fillRect(x, H - barHeight, barWidth - 2, barHeight);
                x += barWidth;
            }
        }

        specReqId = requestAnimationFrame(drawSpectrogram);
    }

    function stopGenrePreview() {
        if (currentGenrePreviewAudio) {
            currentGenrePreviewAudio.pause();
            currentGenrePreviewAudio.currentTime = 0;
            if (typeof MusicSystem !== 'undefined') {
                MusicSystem.setMusicVolume(window.musicVolume);
            }
            currentGenrePreviewAudio = null;
        }
    }

    function playGenrePreview(genre) {
        stopGenrePreview(); 
        
        if (typeof playTone === 'function') {
            playTone(2000, 'square', 0.01, 0.05);
        }
        
        currentGenrePreviewAudio = new Audio(`/audio/${genre}.mp3`);
        currentGenrePreviewAudio.crossOrigin = "anonymous";
        currentGenrePreviewAudio.loop = false;
        currentGenrePreviewAudio.volume = window.sfxVolume * 0.25;
        
        initSpectrogram();
        try {
            const source = specCtx.createMediaElementSource(currentGenrePreviewAudio);
            source.connect(specAnalyser);
            specAnalyser.connect(specCtx.destination);
        } catch (e) {
            console.warn("Spectrogram connect error", e);
        }

        if (!specReqId) drawSpectrogram();
        if (specCtx.state === 'suspended') {
            specCtx.resume();
        }
        
        if (typeof MusicSystem !== 'undefined') {
            MusicSystem.setMusicVolume(window.musicVolume * 0.3); // Ducking
        }
        
        currentGenrePreviewAudio.addEventListener('ended', () => {
            if (typeof MusicSystem !== 'undefined') {
                MusicSystem.setMusicVolume(window.musicVolume);
            }
            currentGenrePreviewAudio = null;
        });
        
        currentGenrePreviewAudio.play().catch(e => {
            console.warn(`Preview audio not found for genre: ${genre}`, e);
            stopGenrePreview();
        });
    }


        // ==========================================
        // MOTEUR DE LECTURE DU PIANO ROLL (AudioContext + Scheduler)
        // ==========================================
        globalThis.prIsPlaying = false;
        globalThis.prCurrentStep = 0;
        const PR_TOTAL_STEPS = 128; // 8 mesures (4/4, double-croches = 128 steps)

        // Sequencer timing
        globalThis.prStartTime = 0; // audioCtx time when playback started
        globalThis.prRequestId = null;
        const scheduleAheadTime = 0.2; // seconds to schedule ahead
        const lookaheadInterval = 25; // ms (not used with RAF but left for reference)

        // Synth / voice pool
        const prScheduled = new Set(); // track scheduled note instance ids
        const prActiveNotes = []; // track active voices for kill/cleanup
        globalThis.prSynthPreset = 'saw_classic';
        globalThis.prPresetOpts = {};
        globalThis.prSwing = 0; // swing amount in fraction of stepDuration (0..0.3)

        const PR_PRESETS = {
            'sine_soft': { type: 'sine', attack: 0.02, decay: 0.12, sustain: 0.85, release: 0.25, peak: 0.12 },
            'saw_classic': { type: 'sawtooth', attack: 0.01, decay: 0.08, sustain: 0.65, release: 0.12, peak: 0.14 },
            'square_hard': { type: 'square', attack: 0.005, decay: 0.04, sustain: 0.6, release: 0.08, peak: 0.16 },
            'pluck': { type: 'sawtooth', attack: 0.001, decay: 0.06, sustain: 0.0, release: 0.3, peak: 0.2, cutoff: 3000 },
            'pad': { type: 'sine', attack: 0.25, decay: 0.6, sustain: 0.7, release: 0.8, peak: 0.08 },
            'bass': { type: 'square', attack: 0.005, decay: 0.06, sustain: 0.85, release: 0.12, peak: 0.18 }
        };

        function createSynthVoice(freq, startTime, durationSec, opts = {}) {
            if (!audioCtxUI) initAudio();
            if (!audioCtxUI) return null;
            // Merge global preset options with call-specific opts
            const merged = Object.assign({}, prPresetOpts || {}, opts || {});

            const osc = audioCtxUI.createOscillator();
            const gain = audioCtxUI.createGain();
            const filter = audioCtxUI.createBiquadFilter();
            osc.type = merged.type || prSynthPreset || 'sawtooth';
            osc.frequency.setValueAtTime(freq, startTime);

            // Simple lowpass for tone shaping
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(merged.cutoff || 10000, startTime);

            // ADSR
            const attack = typeof merged.attack === 'number' ? merged.attack : 0.02;
            const decay = typeof merged.decay === 'number' ? merged.decay : 0.08;
            const sustain = typeof merged.sustain === 'number' ? merged.sustain : 0.7;
            const release = typeof merged.release === 'number' ? merged.release : 0.12;

            gain.gain.setValueAtTime(0.0001, startTime);
            // Attack -> peak
            gain.gain.linearRampToValueAtTime(1.0 * (merged.peak || 0.12) * window.sfxVolume, startTime + attack);
            // Decay -> sustain
            gain.gain.linearRampToValueAtTime(sustain * (merged.peak || 0.12) * window.sfxVolume, startTime + attack + decay);

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(audioCtxUI.destination);

            osc.start(startTime);

            const offTime = startTime + Math.max(0.02, durationSec);
            // schedule release
            gain.gain.cancelScheduledValues(offTime);
            gain.gain.setValueAtTime(gain.gain.value, offTime);
            gain.gain.exponentialRampToValueAtTime(0.001, offTime + release + 0.01);
            const scheduledStop = offTime + release + 0.02;
            try { osc.stop(scheduledStop); } catch(e) {}

            // Track active voice for cleanup. We'll remove it shortly after scheduledStop.
            const voiceObj = { osc, gain, filter, stopTime: scheduledStop, cleanupTimer: null };
            prActiveNotes.push(voiceObj);
            // schedule cleanup to remove from active list after it naturally stops
            const nowSec = audioCtxUI.currentTime || 0;
            const msUntilCleanup = Math.max(0, (scheduledStop - nowSec) * 1000) + 200;
            voiceObj.cleanupTimer = setTimeout(() => {
                const idx = prActiveNotes.indexOf(voiceObj);
                if (idx !== -1) prActiveNotes.splice(idx, 1);
            }, msUntilCleanup);

            return voiceObj;
        }

        function scheduleNoteInstance(note, stepStart, durationSteps) {
            if (!audioCtxUI) initAudio();
            if (!audioCtxUI) return;
            const bpm = parseInt(document.getElementById('daw-bpm').value, 10) || 120;
            const stepDuration = (15 / bpm); // seconds per sixteenth (as before)

            // Swing: apply slight delay to every other eighth (i.e., odd steps)
            let swingOffset = 0;
            if (prSwing && (stepStart % 2 === 1)) {
                swingOffset = stepDuration * prSwing;
            }

            const noteStartTime = prStartTime + (stepStart * stepDuration) + swingOffset;
            const noteDurSec = Math.max(0.05, durationSteps * stepDuration);

            const freq = noteToFreq(note.note || note);
            const voice = createSynthVoice(freq, noteStartTime, noteDurSec, {});

            // Visual feedback: schedule a flash when the note plays
            const msUntil = Math.max(0, (noteStartTime - (audioCtxUI.currentTime || 0)) * 1000);
            setTimeout(() => {
                flashPrNoteVisual(note.id || `${note.note}_${stepStart}`);
            }, msUntil);
        }

        function flashPrNoteVisual(instanceId) {
            const el = document.querySelector(`.pr-note[data-id="${instanceId}"]`);
            if (!el) return;
            el.classList.add('pr-note-playing');
            setTimeout(() => { el.classList.remove('pr-note-playing'); }, 120);
        }

        function schedulerLoop() {
            if (!prIsPlaying) return;
            if (!audioCtxUI) initAudio();
            const now = audioCtxUI.currentTime;
            const bpm = parseInt(document.getElementById('daw-bpm').value, 10) || 120;
            const stepDuration = (15 / bpm);

            // compute how many steps have elapsed since prStartTime
            let elapsed = now - prStartTime;
            // If we've passed full loop(s), advance prStartTime forward to keep scheduler in-sync
            const loopSeconds = PR_TOTAL_STEPS * stepDuration;
            if (elapsed >= loopSeconds) {
                const loopsPassed = Math.floor(elapsed / loopSeconds);
                prStartTime += loopsPassed * loopSeconds;
                elapsed = now - prStartTime;
            }
            const currentStepFloat = elapsed / stepDuration;
            const currentStep = Math.floor(currentStepFloat) % PR_TOTAL_STEPS;
            prCurrentStep = currentStep;

            // schedule ahead notes within scheduleAheadTime
            const lastStepToSchedule = Math.floor((elapsed + scheduleAheadTime) / stepDuration);
            for (let s = currentStep; s <= lastStepToSchedule; s++) {
                const stepIndex = s % PR_TOTAL_STEPS;
                // For each note starting at stepIndex, schedule if not already scheduled for this loop
                window.prNotes.forEach(n => {
                    if (n.startStep === stepIndex) {
                        const uniqueId = `${n.id}@${s}`;
                        if (!prScheduled.has(uniqueId)) {
                            prScheduled.add(uniqueId);
                            scheduleNoteInstance(n, s, n.duration);
                        }
                    }
                });
            }

            updatePrPlayheadUI(currentStepFloat);
            prRequestId = requestAnimationFrame(schedulerLoop);
        }

        // Kill switch: stop all active voices cleanly
        function killAllNotes() {
            if (!audioCtxUI) return;
            const now = audioCtxUI.currentTime;
            // Copy array to avoid mutation during loop
            const copy = prActiveNotes.slice();
            copy.forEach(v => {
                try {
                    // cancel scheduled ramps and set quick target to 0 to avoid clicks
                    v.gain.gain.cancelScheduledValues(now);
                    v.gain.gain.setTargetAtTime(0, now, 0.015);
                } catch(e) {}
                try {
                    // stop oscillator slightly after ramp
                    v.osc.stop(now + 0.04);
                } catch(e) {}
                try { v.osc.disconnect && v.osc.disconnect(); } catch(e) {}
                try { v.filter && v.filter.disconnect && v.filter.disconnect(); } catch(e) {}
                try { v.gain && v.gain.disconnect && v.gain.disconnect(); } catch(e) {}
                if (v.cleanupTimer) { clearTimeout(v.cleanupTimer); v.cleanupTimer = null; }
                const idx = prActiveNotes.indexOf(v);
                if (idx !== -1) prActiveNotes.splice(idx, 1);
            });
            // Also ensure any live keyboard-held notes are turned off
            try {
                Object.keys(activeSynthNotes).forEach(note => {
                    try { playSynthNote(note, false); } catch(e) {}
                });
            } catch(e) {}
        }

        function startPrPlayback() {
            if (prIsPlaying) return;
            if (!audioCtxUI) initAudio();
            if (!audioCtxUI) return;
            if (audioCtxUI.state === 'suspended') audioCtxUI.resume();

            prIsPlaying = true;
            prScheduled.clear();
            prStartTime = audioCtxUI.currentTime + 0.05; // small latency to allow scheduling

            // ensure preset opts reflect currently selected instrument
            if (PR_PRESETS[prSynthPreset]) prPresetOpts = PR_PRESETS[prSynthPreset];

            const btnPlay = document.getElementById('pr-btn-play');
            if (btnPlay) {
                btnPlay.innerText = "⏸ PAUSE";
                btnPlay.classList.add('text-[var(--retro-red)]', 'border-[var(--retro-red)]');
            }

            // kick the RAF-based scheduler
            prRequestId = requestAnimationFrame(schedulerLoop);
        }

        function stopPrPlayback() {
            prIsPlaying = false;
            // Stop scheduler and clear upcoming scheduling
            if (prRequestId) { cancelAnimationFrame(prRequestId); prRequestId = null; }
            prCurrentStep = 0;
            prScheduled.clear();
            updatePrPlayheadUI(0);

            // Kill all active voices cleanly to avoid stuck notes
            try { killAllNotes(); } catch(e) {}

            const btnPlay = document.getElementById('pr-btn-play');
            if (btnPlay) {
                btnPlay.innerText = "▶ PLAY";
                btnPlay.classList.remove('text-[var(--retro-red)]', 'border-[var(--retro-red)]');
            }
        }

        function togglePrPlay() {
            if (prIsPlaying) stopPrPlayback();
            else startPrPlayback();
        }

        function updatePrPlayheadUI(currentStepFloat = null) {
            const gridContainer = document.getElementById('pr-grid-container');
            if (!gridContainer) return;

            let playhead = document.getElementById('pr-playhead');
            if (!playhead) {
                playhead = document.createElement('div');
                playhead.id = 'pr-playhead';
                playhead.style.position = 'absolute';
                playhead.style.top = '0';
                playhead.style.bottom = '0';
                playhead.style.width = '2px';
                playhead.style.backgroundColor = 'var(--retro-red)';
                playhead.style.zIndex = '50';
                playhead.style.pointerEvents = 'none';
                playhead.style.boxShadow = '0 0 10px var(--retro-red)';
                gridContainer.appendChild(playhead);
            }

            // Determine float position
            const bpm = parseInt(document.getElementById('daw-bpm').value, 10) || 120;
            const stepDuration = (15 / bpm);
            let posSteps = prCurrentStep;
            if (currentStepFloat !== null) posSteps = currentStepFloat;

            const playheadX = posSteps * 32;
            playhead.style.left = playheadX + 'px';

            // Auto-scroll : si la barre sort de l'écran, on fait défiler le container
            if (playheadX > gridContainer.scrollLeft + gridContainer.clientWidth - 64) {
                gridContainer.scrollLeft = playheadX - gridContainer.clientWidth / 2;
            } else if (playheadX < gridContainer.scrollLeft && posSteps !== 0) {
                gridContainer.scrollLeft = playheadX;
            } else if (Math.floor(posSteps) === 0) {
                gridContainer.scrollLeft = 0; // Retour au début
            }
        }



globalThis.currentGenrePreviewNodes = [];
globalThis.currentGenrePreviewTimeouts = [];
window.currentGenrePreviewNodes = currentGenrePreviewNodes;
window.currentGenrePreviewTimeouts = currentGenrePreviewTimeouts;

function stopQTEGenrePreview() {
    try {
        if (typeof currentGenrePreviewNodes !== 'undefined' && currentGenrePreviewNodes) {
            if (Array.isArray(currentGenrePreviewNodes)) {
                currentGenrePreviewNodes.forEach(node => { 
                    try { node.stop(); } catch(e){} 
                    try { node.disconnect(); } catch(e){} 
                });
            } else if (currentGenrePreviewNodes.stop) {
                try { currentGenrePreviewNodes.stop(); } catch(e){}
                try { currentGenrePreviewNodes.disconnect(); } catch(e){}
            }
        }
    } catch (err) {
        console.warn("Erreur mineure lors de l'arrêt de la prévisualisation audio:", err);
    }
    currentGenrePreviewNodes = [];
    
    try {
        if (typeof currentGenrePreviewTimeouts !== 'undefined' && currentGenrePreviewTimeouts) {
            currentGenrePreviewTimeouts.forEach(t => clearTimeout(t));
        }
    } catch(errT) {}
    currentGenrePreviewTimeouts = [];
}

function playQTEGenrePreview(genreId, duration = 4000) {
    stopQTEGenrePreview();
    if (!audioCtxUI) initAudio();
    if (!audioCtxUI) return;
    if (audioCtxUI.state === 'suspended') audioCtxUI.resume();

    const now = audioCtxUI.currentTime;
    const vol = window.sfxVolume || 0.5;

    function triggerTone(freq, type, startTime, durationTime, volume = 0.1, slideToFreq = null) {
        try {
            const osc = audioCtxUI.createOscillator();
            const gainNode = audioCtxUI.createGain();
            
            osc.type = type;
            osc.frequency.setValueAtTime(freq, startTime);
            if (slideToFreq) {
                osc.frequency.exponentialRampToValueAtTime(slideToFreq, startTime + durationTime);
            }
            
            gainNode.gain.setValueAtTime(volume * vol, startTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + durationTime);
            
            osc.connect(gainNode);
            gainNode.connect(audioCtxUI.destination);
            
            osc.start(startTime);
            osc.stop(startTime + durationTime);
            currentGenrePreviewNodes.push(osc);
        } catch(e) {}
    }

    const tempo = 120;
    const stepTime = 60 / tempo / 2;

    const gId = String(genreId).toLowerCase();
    if (gId.includes('drill')) {
        for (let step = 0; step < 16; step++) {
            const time = now + step * stepTime;
            if (step === 0 || step === 8) {
                triggerTone(150, 'sine', time, stepTime * 3, 0.4, 60);
            }
            if ([2, 5, 8, 10, 13].includes(step)) {
                triggerTone(2000, 'square', time, 0.05, 0.08);
            }
        }
    } else if (gId.includes('synthwave')) {
        const melody = [55, 55, 65, 65, 58, 58, 62, 62];
        for (let step = 0; step < 16; step++) {
            const time = now + step * stepTime;
            const noteFreq = melody[Math.floor(step / 2) % melody.length];
            triggerTone(noteFreq, 'sawtooth', time, stepTime * 0.8, 0.15);
        }
    } else if (gId.includes('boombap') || gId.includes('boom')) {
        for (let step = 0; step < 16; step++) {
            const time = now + step * stepTime;
            if (step === 0 || step === 8 || step === 10) {
                triggerTone(120, 'sine', time, 0.25, 0.4, 50);
            }
            if (step === 4 || step === 12) {
                triggerTone(350, 'triangle', time, 0.15, 0.3, 100);
            }
            if (step % 2 === 1) {
                triggerTone(1500, 'triangle', time, 0.03, 0.05);
            }
        }
    } else if (gId.includes('lofi') || gId.includes('ambient')) {
        const chords = [
            [220, 261, 329, 392],
            [220, 261, 329, 392],
            [293, 349, 440, 493],
            [293, 349, 440, 493]
        ];
        for (let chordIdx = 0; chordIdx < chords.length; chordIdx++) {
            const time = now + chordIdx * stepTime * 4;
            const notes = chords[chordIdx];
            notes.forEach(f => {
                triggerTone(f, 'sine', time, stepTime * 3.8, 0.08);
            });
        }
    } else if (gId.includes('afropop') || gId.includes('afro')) {
        for (let step = 0; step < 16; step++) {
            const time = now + step * stepTime;
            if (step === 0 || step === 6 || step === 10) {
                triggerTone(90, 'sine', time, 0.2, 0.35, 50);
            }
            if ([3, 7, 11, 14].includes(step)) {
                triggerTone(600, 'triangle', time, 0.08, 0.18, 400);
            }
        }
    } else {
        const melody = [523.25, 587.33, 659.25, 783.99, 880.00];
        for (let step = 0; step < 16; step++) {
            const time = now + step * stepTime;
            if (step % 2 === 0) {
                const note = melody[(step * 3) % melody.length];
                triggerTone(note, 'sine', time, 0.12, 0.15);
            }
        }
    }

    const tId = setTimeout(() => {
        stopQTEGenrePreview();
    }, duration);
    currentGenrePreviewTimeouts.push(tId);
}

export function initAudioModule() {
    installGlobalAudioUnlocker();
    installHoverAudioDelegate();
}

// --- Global Bridge & ES Exports ---
Object.assign(globalThis, { installGlobalAudioUnlocker, MusicSystem, ProceduralAmbientAudio, ambientAudioEngine, activeSynthNotes, PC_KEY_MAP, noteToFreq, UIAudioBuffers, preloadUIAudio, playUIAudio, installHoverAudioDelegate, initAudio, playTone, playSynthNote, killPreviewVoices, playBleep, playSuccess, playError, playKick, playCashSound, playLevelUpSound, initSpectrogram, drawSpectrogram, stopGenrePreview, playGenrePreview, PR_TOTAL_STEPS, scheduleAheadTime, lookaheadInterval, prScheduled, prActiveNotes, PR_PRESETS, createSynthVoice, scheduleNoteInstance, flashPrNoteVisual, schedulerLoop, killAllNotes, startPrPlayback, stopPrPlayback, togglePrPlay, updatePrPlayheadUI, stopQTEGenrePreview, playQTEGenrePreview });
export { installGlobalAudioUnlocker, MusicSystem, ProceduralAmbientAudio, ambientAudioEngine, activeSynthNotes, PC_KEY_MAP, noteToFreq, UIAudioBuffers, preloadUIAudio, playUIAudio, installHoverAudioDelegate, initAudio, playTone, playSynthNote, killPreviewVoices, playBleep, playSuccess, playError, playKick, playCashSound, playLevelUpSound, initSpectrogram, drawSpectrogram, stopGenrePreview, playGenrePreview, PR_TOTAL_STEPS, scheduleAheadTime, lookaheadInterval, prScheduled, prActiveNotes, PR_PRESETS, createSynthVoice, scheduleNoteInstance, flashPrNoteVisual, schedulerLoop, killAllNotes, startPrPlayback, stopPrPlayback, togglePrPlay, updatePrPlayheadUI, stopQTEGenrePreview, playQTEGenrePreview };
