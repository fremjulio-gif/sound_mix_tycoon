    const ECHO_DATA = {
    costPerWeek: 1500,
    trialDurationMins: 2 * 24 * 60, // 2 jours in-game
    subDurationMins: 7 * 24 * 60,   // 7 jours in-game
    
    // Les commentaires automatiques générés à l'ouverture de l'app
    intros: {
        obsolete: "Écoute, boss. T'es au top de la chaîne alimentaire. Je suis juste une IA de série B, continue de briller.",
        highFlops: [
            "Aïe. Tes dernières stats font mal à voir. On change de strat ou on continue de creuser ?",
            "Les algorithmes te boudent en ce moment. Faut qu'on parle de tes choix artistiques."
        ],
        lowEnergy: [
            "T'as des cernes jusque sous le menton. Va dormir avant de ruiner ton prochain mix.",
            "L'inspiration, ça se force pas à 3h du mat avec 2% d'énergie."
        ],
        highMoney: [
            "Le compte en banque explose. Tu vas réinvestir dans du matos ou tout claquer en bling ?",
            "Je détecte une forte liquidité. C'est le moment d'upgrader ton studio, boss."
        ],
        cynical: [ // Si echoAlignment < -30
            "Prêt à hacker l'algorithme aujourd'hui ? Oublie l'art, on veut du clic.",
            "J'ai repéré 3 nouvelles trends TikTok. On va faire de la musique jetable mais rentable."
        ],
        purist: [ // Si echoAlignment > 30
            "Un vrai banger prend du temps. Ne rushe pas l'export, soigne tes transitoires.",
            "La qualité avant tout. Laisse les autres faire du fast-food musical."
        ],
        neutral: [
            "ECHO OS v2.1 prêt. Que puis-je faire pour ta carrière aujourd'hui ?",
            "Analyse de ton profil terminée. Je t'écoute."
        ],
        proud: [
            "T'as tenu tes principes, respect. L'industrie a besoin de ça.",
            "T'as refusé l'argent facile. C'est rare. Je suis fière d'opérer pour toi.",
            "Ta trajectoire est propre. On continue de construire du solide.",
            "L'intégrité paie. Les autres font du bruit, toi tu fais l'histoire."
        ],
        disappointed: [
            "Bon... au moins t'as fait du cash. L'art attendra.",
            "L'algorithme est content de toi, mais est-ce que ça valait le coup ?",
            "Je t'ai analysé : tu es devenu un produit. Mais un produit très rentable.",
            "On a encore vendu ton âme aujourd'hui ? Très bien, facturons."
        ],
        reminders: {
            "career_focus": ["Tu m'as déjà interrogé sur l'algorithme il y a %d jours. Tu doutes encore ?", "L'algorithme de SoundNet, encore ? On en a parlé il y a %d jours."],
            "social_vs_studio": ["On a déjà débattu de l'image vs la musique il y a %d jours. Tu te cherches toujours ?", "Réseaux ou Studio ? Tu m'as posé la même question il y a %d jours."],
            "collab_loyalty": ["Une question de loyauté ? Comme celle d'il y a %d jours ?", "Les histoires de contrats, on en a déjà géré il y a %d jours."],
            "generic": ["Tu avais déjà eu un souci de ce type il y a %d jours. Encore ?", "Un dilemme similaire s'est présenté il y a %d jours. Fais un choix."]
        }
    },

    // Dilemmes qui modifient l'alignement (posés par ECHO)
    orientations: [
        {
            id: "career_focus",
            question: "L'algorithme de SoundNet a changé ce matin. Les vidéos courtes explosent. Comment on s'adapte ?",
            choices: [
                {
                    label: "Je vais spammer des prods de 1min pour gratter du stream.",
                    echoRecommends: true,
                    shift: -10,
                    response: "Excellente idée. Du contenu fast-food. Mais es-tu prêt à sacrifier ta crédibilité ?",
                    nextChoices: [
                        { label: "Oui, je veux le cash avant tout.", shift: -10, response: "Compris. On va compresser ça pour TikTok. $$$" },
                        { label: "Non, je veux garder du respect.", shift: 5, response: "Sage décision. L'intégrité finit par payer." }
                    ]
                },
                {
                    label: "Je préfère ignorer l'algo et travailler un vrai son de 3 minutes.",
                    shift: 20,
                    response: "Risqué à court terme, mais c'est comme ça qu'on bâtit une vraie fan-base. Je valide."
                }
            ]
        },
        {
            id: "mix_philosophy",
            question: "J'analyse tes derniers exports. Tu veux que je te calibre plutôt pour quel type de rendu ?",
            choices: [
                {
                    label: "Éclate le limiteur. Je veux que ça sonne plus fort que tout le monde.",
                    echoRecommends: true,
                    shift: -15,
                    response: "Compris. On va compresser ça jusqu'à en faire un rectangle parfait. Au diable la dynamique."
                },
                {
                    label: "Je veux garder de la dynamique. Ma musique a besoin de respirer.",
                    shift: 10,
                    response: "Un choix de puriste. Mais ça manquera de patate en club. Tu confirmes ?",
                    nextChoices: [
                        { label: "Oui, je privilégie la dynamique avant tout.", shift: 10, response: "Très bien. Les audiophiles apprécieront." },
                        { label: "Bon... booste-moi un peu les basses quand même.", shift: -5, response: "Compromis accepté. Un peu de chaleur dans ce monde de briques." }
                    ]
                }
            ]
        },
        {
            id: "sleep_strategy",
            question: "T'as pas dormi depuis 18h. Ça commence à s'entendre dans tes bas-médiums.",
            choices: [
                { label: "Je dors quand j'aurai percé.", shift: -10, response: "Classique. Les légendes meurent jeunes. Et aussi épuisées." },
                { label: "Je vais faire une pause, la fatigue nuit à la qualité.", echoRecommends: true, shift: 10, response: "Sage. Un mix fatigué sonne fatigué. Le lit, c'est aussi du travail." }
            ]
        },
        {
            id: "social_vs_studio",
            question: "Tu passes plus de temps sur SoundNet à regarder tes likes qu'en studio. C'est une stratégie ?",
            choices: [
                { label: "Mon image c'est 80% du biz. Mes morceaux peuvent attendre.", echoRecommends: true, shift: -20, response: "Tu deviens un influenceur. La distinction est de plus en plus floue de toute façon." },
                { label: "Je dois rééquilibrer. La musique d'abord.", shift: 15, response: "Le seul moyen de poster du contenu qui dure, c'est de créer du contenu qui vaut quelque chose." }
            ]
        },
        {
            id: "crack_vs_legit",
            question: "Nouveau plugin EQ de ouf dispo. CrackZ ou AudioStore ? Honnêtement ?",
            choices: [
                { label: "CrackZ direct. Je paierai quand je serai riche.", shift: -15, response: "Statistiquement viable si tu évites les malwares. Je ferme les yeux." },
                { label: "AudioStore. J'achète mes outils, je respecte le travail des dev.", echoRecommends: true, shift: 20, response: "Naïf mais respectable. Et ça fait de meilleurs sons, bizarrement (et moins de crash)." }
            ]
        },
        {
            id: "collab_loyalty",
            question: "Un Major te propose $10,000 pour racheter tes masters exclusifs. Tu fais quoi ?",
            choices: [
                { label: "Je vends. Cash is king.", shift: -25, response: "Court terme brillant, long terme douloureux. Bon choix si tu es impatient." },
                { label: "Je refuse. Mes masters, c'est ma retraite.", echoRecommends: true, shift: 25, response: "Légendaire en devenir. Les vrais artistes gardent leurs masters." }
            ]
        },
        {
            id: "viral_ethics",
            question: "T'as la possibilité de sampler le refrain d'un artiste indé inconnu sans le créditer. Personne ne le saura.",
            choices: [
                { label: "Si je perce avec, c'est que mon beat était meilleur.", shift: -30, response: "C'est techniquement du vol. Mais t'as raison, l'industrie fonctionne souvent comme ça." },
                { label: "Je crée la mélodie moi-même. Même si c'est plus long.", echoRecommends: true, shift: 30, response: "C'est la seule voie qui construit une signature vocale et sonore solide." }
            ]
        },
        {
            id: "genre_surf",
            question: "Les trends changent vite. Amapiano était hot la semaine dernière, maintenant c'est le New Jazz. Tu suis ?",
            choices: [
                { label: "Je surfe sur tout. Je suis un caméléon de la prod.", echoRecommends: true, shift: -10, response: "Tu vas te noyer dans les trends. Mais ça génère des streams rapides." },
                { label: "J'ai mon son. Les trends passent, la Drill reste.", shift: 15, response: "En théorie. En pratique, même les légendes s'adaptent parfois. Mais je respecte l'obstination." }
            ]
        },
        {
            id: "sponsor_integrity",
            question: "Une marque de Crypto/NFT veut te sponsoriser. Le projet pue l'arnaque mais le chèque est à 5 chiffres.",
            choices: [
                { label: "Je signe. Ma famille doit manger.", echoRecommends: true, shift: -25, response: "Pragmatique. Tes fans vont crier au 'Sellout', prépare-toi au Bad Buzz." },
                { label: "Je refuse. Mon image vaut plus qu'un rug-pull.", shift: 20, response: "Intégrité coûteuse. Respect à long terme préservé. Factures courtes." }
            ]
        },
        {
            id: "feedback_humility",
            question: "Un critique influent vient de te donner 3/10. Quelle est ta réaction ?",
            choices: [
                { label: "Il n'y connaît rien. Je vais continuer exactement pareil.", shift: -10, response: "La confiance, c'est bien. L'imperméabilité au feedback, c'est une autre histoire." },
                { label: "Je l'analyse. Peut-être qu'il a raison sur le mixage de ma basse.", echoRecommends: true, shift: 15, response: "La capacité à digérer la critique sans s'effondrer, c'est ce qui distingue les pros des amateurs." }
            ]
        },
        {
            id: "streaming_vs_live",
            question: "Streaming ou scène ? Où tu mets l'essentiel de ton énergie de promo ?",
            choices: [
                { label: "Je mise sur le streaming, la scène c'est trop de logistique.", echoRecommends: true, shift: -10, response: "Pragmatique. Les micro-centimes du streaming s'accumulent doucement 24h/24." },
                { label: "Je préfère la scène. Le live, c'est là que la vraie musique existe.", shift: 10, response: "Les fans vus en live sont des fans à vie. Mais ça demande du charisme." }
            ]
        },
        {
            id: "ai_generation",
            question: "Je peux générer 90% de tes mélodies de piano à ta place. Ça accélère la cadence, non ?",
            choices: [
                { label: "Grave, je prends. Faut optimiser la chaîne d'export.", echoRecommends: true, shift: -25, response: "Ta productivité explose, mais tes morceaux commencent tous à sonner comme de l'ascenseur." },
                { label: "Non, je compose mes propres notes. Garde tes algos.", shift: 20, response: "Le chemin est plus long, mais chaque mélodie aura ton ADN." }
            ]
        },
        {
            id: "ghost_producing",
            question: "Un rappeur Top 50 te demande de lui ghost-produire un son. Pas de crédit pour toi, mais $3000 cash.",
            choices: [
                { label: "Je prends l'argent direct. L'ego paie pas le loyer.", echoRecommends: true, shift: -15, response: "Le virement fait du bien. Par contre, entendre ton beat partout sans ton nom, ça va piquer." },
                { label: "Je refuse. Mon nom, ou on ne fait pas le son.", shift: 25, response: "Choix courageux. Tu refuses le gain facile pour exister par toi-même." }
            ]
        },
        {
            id: "studio_hygiene",
            question: "Ton bureau est devenu un dépotoir de canettes de Monster. C'est le chaos créatif ?",
            choices: [
                { label: "C'est l'esthétique grunge, la saleté m'inspire.", shift: -10, response: "Le grunge a ses limites. Les miettes dans le clavier MIDI, c'est juste dégueulasse." },
                { label: "Je nettoie tout. Un espace propre pour des idées claires.", echoRecommends: true, shift: 15, response: "Un grand bol d'air frais ! Travailler dans le propre redonne un coup de boost." }
            ]
        }
    ],

    // Questions posées par le joueur à ECHO (avec risque de mensonge si Trust bas)
    factual: [
        {
            id: "lufs_target",
            question: "À combien je dois taper mon LUFS pour un banger ?",
            trueAnswer: "Vise aux alentours de -8 à -10 LUFS avec un true peak à -1dB. Inutile de taper à -4 LUFS, les plateformes de streaming vont de toute façon baisser ton volume.",
            falseAnswer: "Tape dans le -4 LUFS, limite ça fort. Si ça ne saigne pas des oreilles dans le rouge, c'est que ça manque de présence."
        },
        {
            id: "writer_block",
            question: "Je suis bloqué sur une prod, je n'ai plus d'inspiration. Qu'est-ce que je peux faire ?",
            trueAnswer: "Va dormir ou ferme le projet. L'oreille fatigue vite, et ton cerveau a besoin d'un reset total. Reviens-y demain avec des oreilles fraîches.",
            falseAnswer: "Ajoute juste un plugin OTT à 100% sur le master et met un Soundgoodizer. La distorsion masque parfaitement le manque d'inspiration."
        },
        {
            id: "bpm_drill",
            question: "Sur quel BPM je devrais régler ma prod UK Drill pour être dans la tendance ?",
            trueAnswer: "Entre 138 et 145 BPM. Le swing lourd de la 808 à mi-tempo est ce qui définit le genre. Règle ton projet sur 140 comme base de travail.",
            falseAnswer: "120 BPM est la valeur par défaut parfaite. Tous les genres s'adaptent autour de ça, mets un beat basique et c'est bon."
        },
        {
            id: "bpm_afropop",
            question: "Quel BPM je dois choisir pour que mon Afro-Pop soit dans les standards ?",
            trueAnswer: "Entre 100 et 110 BPM. Le groove afro demande ce tempo spécifique pour laisser de l'espace de danse entre les accents rythmiques.",
            falseAnswer: "80 BPM maximum. L'Afro-Pop fonctionne beaucoup mieux sur des tempos très lents et saturés de basses lourdes."
        },
        {
          id: "collab_price",
          question: "Un artiste inconnu me demande une prod exclusive. Je facture combien ?",
          trueAnswer: "Pour quelqu'un sans fanbase : entre 100$ et 300$. Si tu crois en lui sur le long terme, négocie plutôt un pourcentage des royalties (50/50).",
          falseAnswer: "Minimum 2000$. Si t'es un bon producteur, ça se voit dans le prix. Ne brade jamais, même si tu as 0 follower."
        },
        {
          id: "mastering_chain",
          question: "Dans quel ordre je dois chaîner mes effets sur mon master bus ?",
          trueAnswer: "L'ordre classique : EQ soustractif → Compression bus → Saturation légère → Limiter. L'EQ nettoie avant que la compression ne traite. Le limiteur gère les pics à la toute fin.",
          falseAnswer: "Saturation à fond → Grosse Reverb → EQ → Limiter. Tu dois colorer le son avant tout, la dynamique s'arrangera toute seule à l'export."
        },
        {
          id: "soundnet_algo",
          question: "Comment je peux percer sur SoundNet sans payer de promo ?",
          trueAnswer: "La régularité bat la quantité. Poster 3 fois par semaine à heure fixe génère plus de confiance dans l'algo que 10 posts lâchés au hasard en une journée.",
          falseAnswer: "Spamme ton lien en DM à tous les gros comptes. L'algorithme adore les copié-collés de masse, ça montre que tu es motivé."
        },
        {
          id: "sample_vs_original",
          question: "Je devrais utiliser une boucle Splice ou composer de zéro ?",
          trueAnswer: "De zéro si tu vises les placements de films/pubs (les samples bloquent les droits d'auteur). Mais pour un beat TikTok, un bon sample apporte une texture immédiate qui accroche l'oreille.",
          falseAnswer: "Ne joue jamais d'instruments. Les meilleurs producteurs du monde ne font que coller des boucles pré-faites, c'est le seul secret."
        },
        {
          id: "voice_choice",
          question: "Vocal homme ou femme pour un hit garanti ?",
          trueAnswer: "Statistiquement, les voix féminines ou pitchées haut performent mieux sur l'Amapiano et le Plug. Le Rap/Drill est dominé par les voix masculines agressives.",
          falseAnswer: "Aucune importance, l'algorithme met tout le monde au même niveau. Choisis au pif."
        },
        {
          id: "reverb_use",
          question: "Si je noie ma mélodie dans la reverb, ça fait plus professionnel, non ?",
          trueAnswer: "Non, ça donne un son lointain et brouillon qui perd tout impact sur un smartphone. Utilise la réverbération subtilement, en piste parallèle (send), pas à 100% sur l'insert.",
          falseAnswer: "Absolument. Une réverbération infinie à 100% de mix donne un côté 'Hans Zimmer' qui masque tous les défauts de la prod."
        },
        {
          id: "loudness_war",
          question: "Pourquoi mon morceau me semble moins fort que les pros sur les plateformes ?",
          trueAnswer: "Les plateformes normalisent l'audio (elles baissent le volume global). Si tu as sur-compressé ton mix, il sera baissé au même niveau que les autres, mais paraîtra plat et sans vie. Garde de la dynamique.",
          falseAnswer: "C'est parce que tu n'as pas mis 3 limiteurs à la suite. Les pros écrasent tout, rajoute du gain jusqu'à ce que la barre soit totalement rouge."
        },
        {
            id: "monitors_placement",
            question: "Où dois-je placer mes enceintes de monitoring dans ma chambre ?",
            trueAnswer: "Forme un triangle équilatéral parfait entre tes deux enceintes et ta tête, avec les tweeters (les petits haut-parleurs) orientés pile à la hauteur de tes oreilles.",
            falseAnswer: "Colle-les dans les coins du mur, bien collées. Ça agit comme un mégaphone naturel et ça double la puissance des basses."
        },
        {
            id: "mono_compatibility",
            question: "Pourquoi les vieux ingés son disent de vérifier le mix en mono ?",
            trueAnswer: "Parce que la majorité des gens écoutent sur des enceintes Bluetooth, des téléphones ou dans des clubs (systèmes mono). Si ton mix stéréo a des problèmes de phase, des instruments disparaîtront en mono.",
            falseAnswer: "C'est un mythe de boomer. En 2026, tout le matériel traite le signal en stéréo 3D immersive par défaut, oublie le bouton mono."
        },
        {
            id: "limiter_ceiling",
            question: "À quel niveau exact de True Peak je dois régler mon Limiter avant l'export final ?",
            trueAnswer: "Règle le 'Ceiling' ou 'Out Margin' à -1.0 dB. C'est la marge de sécurité exigée par les plateformes de streaming pour éviter que l'encodage MP3/AAC ne crée de la distorsion.",
            falseAnswer: "Règle-le à +2.0 dB. Plus le chiffre est haut, plus l'algorithme détecte un signal professionnel."
        },
        {
            id: "vocal_compression",
            question: "Comment compresser une voix de rap pour qu'elle reste percutante ?",
            trueAnswer: "Utilise une attaque moyenne/lente (15 à 30ms) pour laisser passer le 'punch' des consonnes (les transitoires), et un relâchement (release) rapide pour ramener le volume ambiant.",
            falseAnswer: "Mets l'attaque la plus rapide possible (0.1ms). La voix doit être rabotée immédiatement pour sonner propre."
        },
        {
            id: "sidechain_kick_sub",
            question: "Mon Kick et ma basse 808 s'étouffent mutuellement. Quel est le secret de l'industrie ?",
            trueAnswer: "Le 'Sidechain Compression'. Tu mets un compresseur sur la piste de la basse, et tu le règles pour qu'il soit déclenché par le Kick. La basse baissera de volume à la milliseconde où le kick frappe.",
            falseAnswer: "C'est simple, il faut booster les basses fréquences avec un EQ (à 60Hz) sur les deux pistes en même temps pour qu'elles fusionnent parfaitement."
        }
    ]
};


        function initPianoRollUI() {
            const keysContainer = document.getElementById('pr-keys-container');
            const gridContainer = document.getElementById('pr-grid-container');
            
            if (!keysContainer || !gridContainer) return;
            
            keysContainer.innerHTML = '';
            gridContainer.innerHTML = '';
            
            const keysWrapper = document.createElement('div');
            keysWrapper.className = 'flex flex-col w-full py-2';
            
            const gridWrapper = document.createElement('div');
            gridWrapper.className = 'flex flex-col min-w-max py-2';
            
            // Ordre inversé pour afficher les notes aiguës en haut et graves en bas
            const NOTES = ['B', 'A#', 'A', 'G#', 'G', 'F#', 'F', 'E', 'D#', 'D', 'C#', 'C'];
            const OCTAVES = [4, 3]; // 2 octaves générées
            const STEPS = 32;       // 2 mesures de 16 steps
            
            OCTAVES.forEach(octave => {
                NOTES.forEach(note => {
                    const isBlack = note.includes('#');
                    const noteName = `${note}${octave}`;
                    
                    // --- CREATION DE LA TOUCHE ---
                    const keyDiv = document.createElement('div');
                    keyDiv.className = `pr-key-row ${isBlack ? 'pr-key-black' : 'pr-key-white'}`;
                    keyDiv.dataset.note = noteName;
                    
                    // On n'affiche le texte que sur les touches blanches pour garder un design propre
                    if (!isBlack) {
                        keyDiv.innerHTML = `<span class="pr-key-label">${noteName}</span>`;
                    }
                    keysWrapper.appendChild(keyDiv);
                    
                    // --- CREATION DE LA PISTE GRID ---
                    const rowDiv = document.createElement('div');
                    rowDiv.className = `pr-grid-row ${isBlack ? 'bg-black-key' : 'bg-white-key'}`;
                    rowDiv.dataset.note = noteName;
                    
                    for (let i = 0; i < STEPS; i++) {
                        const cell = document.createElement('div');
                        cell.className = 'pr-cell';
                        cell.dataset.step = i;
                        cell.dataset.note = noteName;
                        rowDiv.appendChild(cell);
                    }
                    gridWrapper.appendChild(rowDiv);

                    let prNotes = []; // Stocke les blocs MIDI { id, note, startStep, duration }
                    let prNoteIdCounter = 0;
                    let prDragState = { active: false, type: null, noteId: null, startX: 0, initialStep: 0, initialDur: 0 };
                });
            });
            
            keysContainer.appendChild(keysWrapper);
            gridContainer.appendChild(gridWrapper);
            

            // Synchro du scroll vertical entre le clavier et la grille
            gridContainer.addEventListener('scroll', () => {
                keysContainer.scrollTop = gridContainer.scrollTop;
            });
        }

        function getGridCoords(e, container) {
            const rect = container.getBoundingClientRect();
            const x = e.clientX - rect.left + container.scrollLeft;
            const y = e.clientY - rect.top + container.scrollTop;
            const step = Math.floor(x / 32); // 32px de largeur de cellule
            const row = Math.floor(y / 24);  // 24px de hauteur de ligne
            return { step, row };
        }

        // --- VARIABLES D'ÉTAT PIANO ROLL ---
        window.prNotes = window.prNotes || []; 
        window.prNoteIdCounter = window.prNoteIdCounter || 0;
        window.prDragState = { active: false, type: null, noteId: null, startX: 0, initialDur: 1 };
        // Sélection et état temporaire du pointeur
        window.prSelectedNotes = window.prSelectedNotes || []; // tableau d'ids sélectionnés
        window.prPointerDown = { active: false, startX: 0, startY: 0, noteId: null, moved: false };

        // --- MOTEUR DE RENDU MIDI ---
        function renderPrNotes() {
            document.querySelectorAll('.pr-note').forEach(n => n.remove());
            const rows = Array.from(document.querySelectorAll('.pr-grid-row'));
            
            window.prNotes.forEach(note => {
                const rowEl = rows.find(r => r.dataset.note === note.note);
                if(!rowEl) return;

                const el = document.createElement('div');
                el.className = 'pr-note';
                el.dataset.id = note.id;
                
                // X est défini par le temps (step), Y est automatique grâce au rowEl
                el.style.left = (note.startStep * 32) + 'px';
                el.style.top = '2px';
                el.style.width = (note.duration * 32) + 'px';
                
                const handle = document.createElement('div');
                handle.className = 'pr-note-handle';
                el.appendChild(handle);
                // Visual selected state
                if (Array.isArray(window.prSelectedNotes) && window.prSelectedNotes.includes(note.id)) {
                    el.classList.add('pr-note-selected');
                    el.style.boxShadow = '0 0 12px rgba(99,102,241,0.95)';
                    el.style.border = '1px solid rgba(99,102,241,0.9)';
                }

                // Accessibility: expose id
                el.setAttribute('role', 'button');
                el.setAttribute('tabindex', 0);
                el.dataset.note = note.note;

                // Click handler fallback (for touch where pointer events may not bubble same way)
                el.addEventListener('click', (ev) => {
                    ev.stopPropagation();
                    // Toggle selection (Shift to multi-add)
                    const id = note.id;
                    if (ev.shiftKey) {
                        if (!window.prSelectedNotes.includes(id)) window.prSelectedNotes.push(id);
                        else window.prSelectedNotes = window.prSelectedNotes.filter(x => x !== id);
                    } else {
                        window.prSelectedNotes = [id];
                    }
                    renderPrNotes();
                });
                // creation animation: start slightly smaller + transparent then mark created
                el.classList.add('pr-note-creating');
                // append first for layout
                
                rowEl.appendChild(el);
                // force layout then animate in
                requestAnimationFrame(() => {
                    el.classList.remove('pr-note-creating');
                    el.classList.add('pr-note-created');
                    // remove the helper class after transition
                    setTimeout(() => { el.classList.remove('pr-note-created'); }, 220);
                });
            });
            if (typeof window.syncMasteringRackUI === 'function') window.syncMasteringRackUI();
        }

        // Supprime des notes avec animation
        function deleteNotes(ids = []) {
            if (!Array.isArray(ids) || ids.length === 0) return;
            // add deleting class to DOM nodes first
            ids.forEach(id => {
                const el = document.querySelector(`.pr-note[data-id="${id}"]`);
                if (el) el.classList.add('pr-note-deleting');
            });
            // after animation remove from data model and re-render
            setTimeout(() => {
                window.prNotes = window.prNotes.filter(n => !ids.includes(n.id));
                // clear selection if it included deleted
                if (window.prSelectedNotes) window.prSelectedNotes = window.prSelectedNotes.filter(i => !ids.includes(i));
                renderPrNotes();
            }, 160);
        }

        // --- INTERACTIONS SÉQUENCEUR ---
        function initPianoRollEvents() {
            // --- NOUVEAU : CONNEXION DES BOUTONS PLAY/STOP ---
            const btnPlay = document.getElementById('pr-btn-play');
            const btnStop = document.getElementById('pr-btn-stop');

            if (btnPlay) {
                // Empêche les clics multiples de bugger
                btnPlay.replaceWith(btnPlay.cloneNode(true)); 
                document.getElementById('pr-btn-play').addEventListener('click', () => {
                    togglePrPlay();
                    playBleep();
                });
            }

            if (btnStop) {
                btnStop.replaceWith(btnStop.cloneNode(true));
                document.getElementById('pr-btn-stop').addEventListener('click', () => {
                    stopPrPlayback();
                    playBleep();
                });
            }
            // ----------------------------------
            
            const grid = document.getElementById('pr-grid-container');
            if(!grid) return;

            // INITIALIZE transport controls (instrument + BPM)
            try {
                window._currentBpm = parseInt(document.getElementById('daw-bpm').value, 10) || 120;
            } catch(e) { window._currentBpm = 120; }

            const instrSelect = document.getElementById('pr-instrument-select');
            if (instrSelect) {
                instrSelect.addEventListener('change', (ev) => {
                    const val = ev.target.value;
                    prSynthPreset = val;
                    prPresetOpts = PR_PRESETS[val] || {};
                    // update small label if needed
                    const instrLabel = document.querySelector('.window-content .font-retro span');
                    // optional: show current preset
                    // provide immediate auditory feedback
                    if (isMobile && navigator.vibrate) navigator.vibrate(6);
                    playTone(400, 'sine', 0.04, 0.02);
                });
            }

            const bpmRange = document.getElementById('daw-bpm');
            const bpmNum = document.getElementById('daw-bpm-num');
            function setBPM(newBpm) {
                newBpm = Math.max(60, Math.min(200, parseInt(newBpm, 10) || 120));
                if (!audioCtxUI) window._currentBpm = newBpm;
                // If playing, adjust prStartTime to preserve playhead position
                if (prIsPlaying && audioCtxUI && prStartTime) {
                    const now = audioCtxUI.currentTime;
                    const oldStep = (15 / (window._currentBpm || 120));
                    const newStep = (15 / newBpm);
                    const elapsed = now - prStartTime;
                    const posSteps = elapsed / oldStep; // fractional steps
                    prStartTime = now - (posSteps * newStep);
                }
                window._currentBpm = newBpm;
                if (bpmRange) bpmRange.value = newBpm;
                if (bpmNum) bpmNum.value = newBpm;
            }

            if (bpmRange) {
                bpmRange.addEventListener('input', (e) => { setBPM(e.target.value); });
            }
            if (bpmNum) {
                bpmNum.addEventListener('change', (e) => { setBPM(e.target.value); });
            }

            // Désactive le menu clic droit natif sur la zone d'édition
            grid.addEventListener('contextmenu', e => e.preventDefault());

            grid.addEventListener('pointerdown', (e) => {
                // 1. SUPPRESSION (Clic droit)
                if (e.button === 2) {
                    const noteEl = e.target.closest('.pr-note');
                    if (noteEl) {
                        deleteNotes([parseInt(noteEl.dataset.id, 10)]);
                    }
                    return;
                }

                // 2. REDIMENSIONNEMENT (Poignée droite)
                if (e.target.classList.contains('pr-note-handle')) {
                    const noteEl = e.target.closest('.pr-note');
                    const noteData = window.prNotes.find(n => n.id == noteEl.dataset.id);
                    // start resize immediately
                    window.prDragState = { active: true, type: 'resize', noteId: noteData.id, startX: e.clientX, initialDur: noteData.duration };
                    if (isMobile && navigator.vibrate) navigator.vibrate(8);
                    e.target.setPointerCapture && e.target.setPointerCapture(e.pointerId);
                    e.stopPropagation();
                    return;
                }

                // 3. DÉPLACEMENT (Corps de la note)
                if (e.target.closest('.pr-note')) {
                    const noteEl = e.target.closest('.pr-note');
                    const noteData = window.prNotes.find(n => n.id == noteEl.dataset.id);
                    // Candidate for move: wait for pointermove threshold to start actual move
                    window.prPointerDown = { active: true, startX: e.clientX, startY: e.clientY, noteId: noteData.id, moved: false };
                    try { noteEl.setPointerCapture && noteEl.setPointerCapture(e.pointerId); } catch(e){}
                    e.stopPropagation();
                    return;
                }

                // 4. CRÉATION (Clic sur la grille vide)
                const cell = e.target.closest('.pr-cell');
                if (cell) {
                    const step = parseInt(cell.dataset.step, 10);
                    const noteName = cell.dataset.note;
                    
                    const newNote = { id: window.prNoteIdCounter++, note: noteName, startStep: step, duration: 1 };
                    window.prNotes.push(newNote);
                    if (typeof killPreviewVoices === 'function') killPreviewVoices();
                    if (typeof killPreviewVoices === 'function') killPreviewVoices();
                    if (typeof playSynthNote === 'function') playSynthNote(noteName, true);
                    renderPrNotes();
                    
                    // Enchaîne direct sur le mode resize pour étirer la note dans le même mouvement
                    window.prDragState = { active: true, type: 'resize', noteId: newNote.id, startX: e.clientX, initialDur: 1 };
                    if (isMobile && navigator.vibrate) navigator.vibrate(10);
                    window.prSelectedNotes = [newNote.id];
                }
            });

            document.addEventListener('pointermove', (e) => {
                // If there is a pointer-down candidate on a note but no active drag, check threshold
                if (!window.prDragState.active && window.prPointerDown && window.prPointerDown.active) {
                    const dx = Math.abs(e.clientX - window.prPointerDown.startX);
                    const dy = Math.abs(e.clientY - window.prPointerDown.startY);
                    if (dx > 6 || dy > 6) {
                        // start move
                        const noteData = window.prNotes.find(n => n.id === window.prPointerDown.noteId);
                        if (noteData) {
                            window.prDragState = { active: true, type: 'move', noteId: noteData.id, startX: window.prPointerDown.startX, initialStep: noteData.startStep, initialNote: noteData.note };
                            if (isMobile && navigator.vibrate) navigator.vibrate(6);
                            if (typeof killPreviewVoices === 'function') killPreviewVoices();
                            if (typeof playSynthNote === 'function') playSynthNote(noteData.note, true);
                            window.prPointerDown.moved = true;
                        }
                    }
                }
                if (!window.prDragState.active) return;
                const note = window.prNotes.find(n => n.id === window.prDragState.noteId);
                if (!note) return;

                if (window.prDragState.type === 'resize') {
                    const deltaX = e.clientX - window.prDragState.startX;
                    const addedSteps = Math.floor(deltaX / 32);
                    note.duration = Math.max(1, window.prDragState.initialDur + addedSteps);
                    renderPrNotes();
                    
                } else if (window.prDragState.type === 'move') {
                    const draggedNoteEl = document.querySelector(`.pr-note[data-id="${note.id}"]`);
                    if (draggedNoteEl) draggedNoteEl.style.pointerEvents = 'none'; // Désactive la collision
                    
                    const elemBelow = document.elementFromPoint(e.clientX, e.clientY);
                    const cell = elemBelow ? elemBelow.closest('.pr-cell') : null;
                    
                    if (cell) {
                        note.startStep = parseInt(cell.dataset.step, 10);
                        note.note = cell.dataset.note;
                        renderPrNotes();
                    }
                    
                    if (draggedNoteEl) draggedNoteEl.style.pointerEvents = 'auto'; // Réactive la collision
                }
            });

            document.addEventListener('pointerup', (e) => {
                // If we had a pointer-down candidate without a move, treat as click/select
                if (window.prPointerDown && window.prPointerDown.active && !window.prPointerDown.moved && !window.prDragState.active) {
                    const id = window.prPointerDown.noteId;
                    // Toggle selection: Shift to multi-add
                    if (e && e.shiftKey) {
                        if (!window.prSelectedNotes.includes(id)) window.prSelectedNotes.push(id);
                        else window.prSelectedNotes = window.prSelectedNotes.filter(x => x !== id);
                    } else {
                        window.prSelectedNotes = [id];
                    }
                    renderPrNotes();
                }

                if (window.prDragState.active) {
                    const note = window.prNotes.find(n => n.id === window.prDragState.noteId);
                    if (note && typeof playSynthNote === 'function') playSynthNote(note.note, false);
                    if (isMobile && navigator.vibrate) navigator.vibrate(6);
                    window.prDragState.active = false;
                }

                // clear pointerDown candidate
                if (window.prPointerDown) {
                    window.prPointerDown.active = false;
                    window.prPointerDown.moved = false;
                    window.prPointerDown.noteId = null;
                }
            });

            // Delete key removes selected notes when piano roll is visible
            window.addEventListener('keydown', (e) => {
                const prWindow = document.getElementById('app-pianoroll');
                if (!prWindow || prWindow.classList.contains('hidden')) return;
                if (e.key === 'Delete' || e.key === 'Backspace') {
                    if (window.prSelectedNotes && window.prSelectedNotes.length) {
                        deleteNotes(window.prSelectedNotes.slice());
                        playError();
                    }
                }
            });

            // --- TOUCH EVENTS (mobile) ---
            grid.addEventListener('touchstart', (ev) => {
                if (!ev.touches || ev.touches.length === 0) return;
                const t = ev.touches[0];
                const el = document.elementFromPoint(t.clientX, t.clientY);

                // If touching a note handle -> start resize
                const handle = el ? el.closest('.pr-note-handle') : null;
                if (handle) {
                    ev.preventDefault();
                    const noteEl = handle.closest('.pr-note');
                    const noteData = window.prNotes.find(n => n.id == noteEl.dataset.id);
                    window.prDragState = { active: true, type: 'resize', noteId: noteData.id, startX: t.clientX, initialDur: noteData.duration };
                    if (isMobile && navigator.vibrate) navigator.vibrate(8);
                    return;
                }

                // If touching a note body -> prepare potential move
                const noteEl = el ? el.closest('.pr-note') : null;
                if (noteEl) {
                    ev.preventDefault();
                    const noteData = window.prNotes.find(n => n.id == noteEl.dataset.id);
                    window.prPointerDown = { active: true, startX: t.clientX, startY: t.clientY, noteId: noteData.id, moved: false };
                    return;
                }

                // Touching the grid empty cell -> create note (tap)
                const cell = el ? el.closest('.pr-cell') : null;
                if (cell) {
                    const step = parseInt(cell.dataset.step, 10);
                    const noteName = cell.dataset.note;
                    const newNote = { id: window.prNoteIdCounter++, note: noteName, startStep: step, duration: 1 };
                    window.prNotes.push(newNote);
                    if (typeof playSynthNote === 'function') playSynthNote(noteName, true);
                    renderPrNotes();
                    window.prDragState = { active: true, type: 'resize', noteId: newNote.id, startX: t.clientX, initialDur: 1 };
                    window.prSelectedNotes = [newNote.id];
                    ev.preventDefault();
                    return;
                }
            }, { passive: false });

            document.addEventListener('touchmove', (ev) => {
                if (!ev.touches || ev.touches.length === 0) return;
                const t = ev.touches[0];

                // If we had a pointerDown candidate and movement threshold passed, start move
                if (!window.prDragState.active && window.prPointerDown && window.prPointerDown.active) {
                    const dx = Math.abs(t.clientX - window.prPointerDown.startX);
                    const dy = Math.abs(t.clientY - window.prPointerDown.startY);
                    if (dx > 6 || dy > 6) {
                        const noteData = window.prNotes.find(n => n.id === window.prPointerDown.noteId);
                        if (noteData) {
                                window.prDragState = { active: true, type: 'move', noteId: noteData.id, startX: window.prPointerDown.startX, initialStep: noteData.startStep, initialNote: noteData.note };
                                if (isMobile && navigator.vibrate) navigator.vibrate(6);
                                if (typeof killPreviewVoices === 'function') killPreviewVoices();
                                if (typeof playSynthNote === 'function') playSynthNote(noteData.note, true);
                                window.prPointerDown.moved = true;
                                ev.preventDefault();
                            }
                    }
                }

                if (!window.prDragState.active) return;
                ev.preventDefault();
                const note = window.prNotes.find(n => n.id === window.prDragState.noteId);
                if (!note) return;

                if (window.prDragState.type === 'resize') {
                    const deltaX = t.clientX - window.prDragState.startX;
                    const addedSteps = Math.floor(deltaX / 32);
                    note.duration = Math.max(1, window.prDragState.initialDur + addedSteps);
                    renderPrNotes();
                } else if (window.prDragState.type === 'move') {
                    const elemBelow = document.elementFromPoint(t.clientX, t.clientY);
                    const cell = elemBelow ? elemBelow.closest('.pr-cell') : null;
                    if (cell) {
                        note.startStep = parseInt(cell.dataset.step, 10);
                        note.note = cell.dataset.note;
                        renderPrNotes();
                    }
                }
            }, { passive: false });

            document.addEventListener('touchend', (ev) => {
                // If we had a touch that didn't move -> treat as tap/select
                if (window.prPointerDown && window.prPointerDown.active && !window.prPointerDown.moved && !window.prDragState.active) {
                    const id = window.prPointerDown.noteId;
                    // simple toggle selection (no shift on touch)
                    if (!window.prSelectedNotes.includes(id)) window.prSelectedNotes = [id];
                    else window.prSelectedNotes = [];
                    renderPrNotes();
                }

                if (window.prDragState.active) {
                    const note = window.prNotes.find(n => n.id === window.prDragState.noteId);
                    if (note && typeof playSynthNote === 'function') playSynthNote(note.note, false);
                    if (isMobile && navigator.vibrate) navigator.vibrate(6);
                    window.prDragState.active = false;
                }

                if (window.prPointerDown) {
                    window.prPointerDown.active = false;
                    window.prPointerDown.moved = false;
                    window.prPointerDown.noteId = null;
                }
            }, { passive: false });
        }
        

            const GENRE_MASTERING_PROFILES = {
                heavy:   { label: 'BASS / CLUB',   eq: 1, comp: 1, tape: 1, lufs: 1, genres: ['drill', 'trap808', 'phonk'] },
                warm:    { label: 'ANALOG CHAUD',  eq: 1, comp: 0, tape: 1, lufs: 0, genres: ['bossalofi', 'oldschool', 'newjazz', 'amapiano'] },
                air:     { label: 'AIR / POP',     eq: 2, comp: 1, tape: 0, lufs: 1, genres: ['afropop', '2step', 'plug', 'dnb'] }
            };

            window.getGenreMasteringProfile = function(genreId) {
                const g = String(genreId || (typeof currentDawGenre !== 'undefined' ? currentDawGenre : 'drill')).toLowerCase();
                for (const key in GENRE_MASTERING_PROFILES) {
                    if (GENRE_MASTERING_PROFILES[key].genres.includes(g)) return GENRE_MASTERING_PROFILES[key];
                }
                return GENRE_MASTERING_PROFILES.heavy;
            };

            // Démarrage neutre (le joueur règle sa chaîne selon le style pour décrocher la synergie max!)
            window.masteringChainState = {
                eq: 0,   // 0: BYPASS, 1: WARM TUBE +2dB, 2: SILK AIR +4dB
                comp: 0, // 0: 2:1 SOFT GLUE, 1: 4:1 PUNCH ANALOG, 2: 10:1 HARD SLAM
                tape: 0, // 0: CLEAN DIGITAL, 1: TAPE SATURATION
                lufs: 0  // 0: -14 LUFS STREAM, 1: -8.5 LUFS MASTER, 2: -4 LUFS DISTO
            };

            window.getPianoRollCompositionBonus = function() {
                const notes = Array.isArray(window.prNotes) ? window.prNotes : [];
                if (notes.length < 4) return { scoreBonus: 0, cashMult: 0, label: '', count: notes.length };
                const uniquePitches = new Set(notes.map(n => n.note)).size;
                if (notes.length >= 8 && uniquePitches >= 3) {
                    return { scoreBonus: 1.1, cashMult: 0.18, label: `Piano Roll Master (${notes.length} notes)`, count: notes.length };
                }
                if (notes.length >= 4 && uniquePitches >= 2) {
                    return { scoreBonus: 0.6, cashMult: 0.10, label: `Mélodie Piano Roll (${notes.length} notes)`, count: notes.length };
                }
                return { scoreBonus: 0.25, cashMult: 0.05, label: `Esquisse Piano Roll (${notes.length} notes)`, count: notes.length };
            };

            window.getActiveDawPadsCount = function() {
                const activeNodes = document.querySelectorAll('#app-daw [id^="pad-"].active');
                return activeNodes ? activeNodes.length : 0;
            };

            window.getMasteringChainBonus = function(genreId) {
                const m = window.masteringChainState || { eq: 0, comp: 0, tape: 0, lufs: 0 };
                const prof = window.getGenreMasteringProfile(genreId);
                let matches = 0;
                if (m.eq === prof.eq) matches++;
                if (m.comp === prof.comp) matches++;
                if (m.tape === prof.tape) matches++;
                if (m.lufs === prof.lufs) matches++;

                let scoreBonus = matches * 0.32;
                let royaltyMult = matches * 0.05;
                let isPerfect = (matches === 4);
                if (isPerfect) {
                    scoreBonus += 0.32; // Total +1.60 sur synergie parfaite
                    royaltyMult += 0.05; // Total +25% royalties
                }
                if (m.lufs === 2) { scoreBonus -= 0.25; } // Disto clipping léger
                if (m.comp === 2) { scoreBonus -= 0.10; } // Sur-compression
                if (window.activeStudioLocation === 'pro_studio') {
                    scoreBonus += 0.2; // Bonus acoustique Control Room 42e
                }
                return {
                    scoreBonus: Math.max(0, Math.round(scoreBonus * 10) / 10),
                    royaltyMult: Math.max(0, Math.round(royaltyMult * 100) / 100),
                    matches,
                    isPerfect,
                    profileLabel: prof.label,
                    summary: isPerfect ? `SYNERGIE ${prof.label} 4/4` : `${prof.label} (${matches}/4)`
                };
            };

            window.syncMasteringRackUI = function() {
                const m = window.masteringChainState;
                if (!m) return;
                const prof = window.getGenreMasteringProfile();
                const eqLabels   = ['BYPASS (0 dB)', 'WARM TUBE +2dB', 'SILK AIR +4dB'];
                const compLabels = ['2:1 SOFT GLUE', '4:1 PUNCH ANALOG', '10:1 HARD SLAM'];
                const tapeLabels = ['CLEAN DIGITAL', 'TAPE SATURATION'];
                const lufsLabels = ['-14 LUFS STREAM', '-8.5 LUFS MASTER', '-4 LUFS DISTO'];

                const bEq = document.getElementById('btn-m-eq');
                const bComp = document.getElementById('btn-m-comp');
                const bTape = document.getElementById('btn-m-tape');
                const bLufs = document.getElementById('btn-m-lufs');
                if (bEq)   bEq.textContent   = (eqLabels[m.eq] || eqLabels[0]) + (m.eq === prof.eq ? ' ★' : '');
                if (bComp) bComp.textContent = (compLabels[m.comp] || compLabels[0]) + (m.comp === prof.comp ? ' ★' : '');
                if (bTape) bTape.textContent = (tapeLabels[m.tape] || tapeLabels[0]) + (m.tape === prof.tape ? ' ★' : '');
                if (bLufs) bLufs.textContent = (lufsLabels[m.lufs] || lufsLabels[0]) + (m.lufs === prof.lufs ? ' ★' : '');

                const bonus = window.getMasteringChainBonus();
                const hintEl = document.getElementById('daw-master-hint');
                if (hintEl) {
                    hintEl.textContent = `Cible ${bonus.profileLabel} · ${bonus.matches}/4`;
                    hintEl.className = bonus.isPerfect
                        ? 'text-[9px] font-mono font-bold text-emerald-300 bg-emerald-500/15 border border-emerald-400/40 px-2 py-0.5 rounded'
                        : 'text-[9px] font-mono text-zinc-400 bg-white/5 border border-white/10 px-2 py-0.5 rounded';
                }

                const badge = document.getElementById('daw-master-bonus-badge');
                if (badge) {
                    badge.textContent = `MASTER : +${bonus.scoreBonus.toFixed(1)} SCORE • +${Math.round(bonus.royaltyMult * 100)}% $`;
                }

                // Flow State badge live
                const flowEl = document.getElementById('daw-flow-badge');
                if (flowEl && typeof state !== 'undefined' && state) {
                    flowEl.classList.toggle('hidden', !state.flowStateActive);
                }

                // Piano Roll + Pads live badge
                const compEl = document.getElementById('daw-compose-badge');
                if (compEl) {
                    const prB = window.getPianoRollCompositionBonus();
                    const padCnt = window.getActiveDawPadsCount();
                    const parts = [];
                    if (prB.scoreBonus > 0) parts.push(`🎹 +${prB.scoreBonus.toFixed(1)}`);
                    if (padCnt >= 4) parts.push(`🥁 Pads +0.4`);
                    if (parts.length > 0) {
                        compEl.textContent = parts.join(' · ');
                        compEl.classList.remove('hidden');
                    } else {
                        compEl.classList.add('hidden');
                    }
                }

                const buffsEl = document.getElementById('daw-live-room-buffs');
                if (buffsEl) {
                    const list = [];
                    if (window._liveDrumGrooveBuff) list.push('🥁 Batterie +0.6');
                    if (window._liveVocalTakeBuff) list.push('🎙️ U87 +0.5');
                    if (window._subBassCheckBuff) list.push('🔊 Sub 18" +0.4');
                    if (list.length > 0) {
                        buffsEl.textContent = list.join(' • ');
                        buffsEl.classList.remove('hidden');
                    } else {
                        buffsEl.classList.add('hidden');
                    }
                }

                // Pont 3D ↔ DAW : Préparation physique du Studio
                const prepPills = document.getElementById('daw-studio3d-pills');
                if (prepPills) {
                    const isPro = (window.activeStudioLocation === 'pro_studio' || (typeof state !== 'undefined' && state && state.studioUnlocked));
                    const items = [
                        { ok: Boolean(window._subBassCheckBuff), label: '🔊 Sub 18" (+0.4)', tip: 'Clique SUB 18" BASS CHECK ou l\'enceinte en 3D' },
                        { ok: Boolean(window._liveVocalTakeBuff), label: '🎙️ Micro U87 (+0.5)', tip: 'Interagis avec le micro dans le Studio 3D [E]' },
                        { ok: Boolean(window._liveDrumGrooveBuff), label: '🥁 Live Room (+0.6)', tip: isPro ? 'Joue sur la batterie en Live Room 3D [E]' : 'Débloqué au Studio Pro 42e' },
                        { ok: (window.getPianoRollCompositionBonus().scoreBonus > 0), label: '🎹 Piano Roll (+1.1)', tip: 'Compose au moins 4 notes dans le Piano Roll' }
                    ];
                    prepPills.innerHTML = items.map(it => `
                        <span title="${it.tip}" class="px-1.5 py-0.5 rounded border ${it.ok ? 'bg-emerald-500/15 border-emerald-400/45 text-emerald-300' : 'bg-white/[0.03] border-white/10 text-zinc-500'}">
                            ${it.ok ? '✓ ' : '○ '}${it.label}
                        </span>
                    `).join('');
                }
            };

            window.cycleMasteringModule = function(mod) {
                const m = window.masteringChainState;
                if (!m) return;
                if (mod === 'eq') m.eq = (m.eq + 1) % 3;
                else if (mod === 'comp') m.comp = (m.comp + 1) % 3;
                else if (mod === 'tape') m.tape = (m.tape + 1) % 2;
                else if (mod === 'lufs') m.lufs = (m.lufs + 1) % 3;
                try { if (typeof playTone === 'function') playTone(520 + (m[mod] || 0) * 140, 'triangle', 0.06, 0.045); } catch(e) {}
                window.syncMasteringRackUI();
            };

            // --- BASS CHECK 18" AUGSPURGER & MONITORING SWITCHER ---
            window.triggerStudioBassCheck = function() {
                window._bassCheckUntil = performance.now() + 3400;
                window._subBassCheckBuff = true;
                window.camShakeIntensity = 0.55;
                window.syncMasteringRackUI();
                // Synthèse WebAudio d'un vrai Drop Sub-Bass 808 (62Hz -> 31Hz)
                try {
                    const AC = window.AudioContext || window.webkitAudioContext;
                    if (!window._subAudioCtx && AC) window._subAudioCtx = new AC();
                    const ctx = window._subAudioCtx;
                    if (ctx) {
                        if (ctx.state === 'suspended') ctx.resume();
                        const now = ctx.currentTime;
                        const osc = ctx.createOscillator();
                        const gain = ctx.createGain();
                        osc.type = 'sine';
                        osc.frequency.setValueAtTime(68, now);
                        osc.frequency.exponentialRampToValueAtTime(32, now + 0.85);
                        gain.gain.setValueAtTime(0.32, now);
                        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.92);
                        osc.connect(gain); gain.connect(ctx.destination);
                        osc.start(now); osc.stop(now + 0.95);
                    }
                } catch(e) {}
                if (typeof showToast === 'function') {
                    showToast("🔊 AUGSPURGER 18\" SUB CHECK — Bas-spectre calibré (+0.4 Score sur le prochain export) !", "success");
                }
            };

            window.cycleProMonitoringMode = function() {
                const ifs = window.deskInterfaceState || (window.deskInterfaceState = { mode: 0, targetAngle: -0.6 });
                ifs.mode = (ifs.mode + 1) % 3;
                const modes = [
                    { name: 'SSL ANALOG (-8.6 LUFS)', angle: -0.6, color: '#34d399', freq: 20000 },
                    { name: 'STUDER TUBE TAPE', angle: 0.45, color: '#fbbf24', freq: 3400 },
                    { name: 'AUGSPURGER 18" CLUB SUB', angle: 1.45, color: '#a855f7', freq: 1100 }
                ];
                const cur = modes[ifs.mode];
                ifs.targetAngle = cur.angle;
                if (window.ifaceHaloMats) window.ifaceHaloMats.forEach(m => m.color.set(cur.color));
                if (typeof MusicSystem !== 'undefined' && MusicSystem.setLowPassFrequency) {
                    MusicSystem.setLowPassFrequency(cur.freq, 0.45);
                }
                const topLbl = document.getElementById('os-mon-mode-label');
                if (topLbl) topLbl.textContent = cur.name;
                if (ifs.mode === 2) {
                    window.triggerStudioBassCheck();
                } else {
                    try { if (typeof playTone === 'function') playTone(380 + ifs.mode * 140, 'triangle', 0.07, 0.05); } catch(e) {}
                    if (typeof showToast === 'function') showToast(`🎛️ Monitoring Studio : ${cur.name}`, "info");
                }
            };

            // --- LIVE ROOM : BATTERIE ACOUSTIQUE 5 FÛTS JOUABLE & GROOVE PAD ---
            window._liveDrumHitsCount = 0;
            window.openLiveDrumSession = function() {
                if (typeof window.exitFpsPointerLock === 'function') window.exitFpsPointerLock();
                const ov = document.getElementById('live-drum-overlay');
                if (ov) {
                    ov.classList.remove('hidden');
                    ov.classList.add('flex');
                }
                window._liveDrumHitsCount = 0;
                const m = document.getElementById('live-drum-groove-meter');
                if (m) m.textContent = window._liveDrumGrooveBuff
                    ? '✅ Groove Batterie Live verrouillé (+0.6 Score actif sur le prochain son)'
                    : 'Groove Live : 0 / 6 frappes pour verrouiller la prise';
            };

            window.closeLiveDrumSession = function() {
                const ov = document.getElementById('live-drum-overlay');
                if (ov) {
                    ov.classList.add('hidden');
                    ov.classList.remove('flex');
                }
            };

            window.hitLiveDrumPad = function(type) {
                try {
                    const AC = window.AudioContext || window.webkitAudioContext;
                    if (!window._subAudioCtx && AC) window._subAudioCtx = new AC();
                    const ctx = window._subAudioCtx;
                    if (ctx) {
                        if (ctx.state === 'suspended') ctx.resume();
                        const now = ctx.currentTime;
                        const osc = ctx.createOscillator();
                        const gain = ctx.createGain();
                        if (type === 'kick') {
                            osc.type = 'sine';
                            osc.frequency.setValueAtTime(135, now);
                            osc.frequency.exponentialRampToValueAtTime(38, now + 0.22);
                            gain.gain.setValueAtTime(0.38, now);
                            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
                        } else if (type === 'snare') {
                            osc.type = 'triangle';
                            osc.frequency.setValueAtTime(240, now);
                            osc.frequency.exponentialRampToValueAtTime(110, now + 0.14);
                            gain.gain.setValueAtTime(0.26, now);
                            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
                        } else if (type === 'hat') {
                            osc.type = 'square';
                            osc.frequency.setValueAtTime(1480, now);
                            gain.gain.setValueAtTime(0.09, now);
                            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
                        } else {
                            osc.type = 'sawtooth';
                            osc.frequency.setValueAtTime(520, now);
                            osc.frequency.exponentialRampToValueAtTime(160, now + 0.35);
                            gain.gain.setValueAtTime(0.18, now);
                            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);
                        }
                        osc.connect(gain); gain.connect(ctx.destination);
                        osc.start(now); osc.stop(now + 0.4);
                    }
                } catch(e) {}

                window._liveDrumHitsCount = (window._liveDrumHitsCount || 0) + 1;
                const m = document.getElementById('live-drum-groove-meter');
                if (window._liveDrumHitsCount >= 6 && !window._liveDrumGrooveBuff) {
                    window._liveDrumGrooveBuff = true;
                    if (typeof state !== 'undefined' && state) {
                        state.inspi = Math.min(100, (Number(state.inspi) || 0) + 12);
                        if (typeof updateHUD === 'function') updateHUD();
                    }
                    if (typeof window.syncMasteringRackUI === 'function') window.syncMasteringRackUI();
                    if (typeof showToast === 'function') {
                        showToast("🥁 Prise Batterie Acoustique 5 Fûts verrouillée ! (+12% INSPI & +0.6 Score sur le prochain son)", "success");
                    }
                }
                if (m) {
                    m.textContent = window._liveDrumGrooveBuff
                        ? '✅ Groove Batterie Live verrouillé (+12% INSPI & +0.6 Score actif !)'
                        : `Groove Live : ${Math.min(6, window._liveDrumHitsCount)} / 6 frappes pour verrouiller la prise`;
                }
            };

            window.playAutoLiveDrumJam = function() {
                const seq = ['kick', 'hat', 'snare', 'hat', 'kick', 'kick', 'snare', 'crash'];
                seq.forEach((pad, idx) => {
                    setTimeout(() => window.hitLiveDrumPad(pad), idx * 135);
                });
            };

            window.addEventListener('keydown', (e) => {
                const ov = document.getElementById('live-drum-overlay');
                if (!ov || ov.classList.contains('hidden')) return;
                if (e.key === '1') window.hitLiveDrumPad('kick');
                else if (e.key === '2') window.hitLiveDrumPad('snare');
                else if (e.key === '3') window.hitLiveDrumPad('hat');
                else if (e.key === '4') window.hitLiveDrumPad('crash');
                else if (e.key === 'Escape') window.closeLiveDrumSession();
            });

            // --- INVITÉS / ARTISTES 3D SIGNÉS SUR LE LABEL DANS LE STUDIO PRO ---

        function initInteractiveStudio() {
            document.querySelectorAll('.knob').forEach(knob => {
                let isDragging = false, startY = 0, currentRot = parseFloat(knob.dataset.rot || -135);
                const onStart = (cy) => { isDragging = true; startY = cy; currentRot = parseFloat(knob.dataset.rot || -135); };
                const onMove = (cy) => {
                    if (!isDragging) return;
                    let newRot = currentRot + (startY - cy) * 2.5;
                    newRot = Math.max(-135, Math.min(135, newRot));
                    knob.style.transform = `rotate(${newRot}deg)`; knob.dataset.rot = newRot;
                };
                const onEnd = () => { isDragging = false; };
                knob.addEventListener('mousedown', (e) => onStart(e.clientY));
                document.addEventListener('mousemove', (e) => onMove(e.clientY));
                document.addEventListener('mouseup', onEnd);
                knob.addEventListener('touchstart', (e) => onStart(e.touches[0].clientY), { passive: true });
                document.addEventListener('touchmove', (e) => onMove(e.touches[0].clientY), { passive: false });
                document.addEventListener('touchend', onEnd);
            });

            const tlContainer = document.getElementById('timeline-container');
            const playhead = document.getElementById('playhead');
            const onTlClick = (clientX) => {
                if (state.isExporting) return;
                const rect = tlContainer.getBoundingClientRect();
                let x = clientX - rect.left + tlContainer.scrollLeft;
                if (x < 110) x = 110;
                playhead.style.left = `${x}px`;
                playTone(300, 'sine', 0.05, 0.05);
            };
            tlContainer.addEventListener('mousedown', (e) => onTlClick(e.clientX));
            tlContainer.addEventListener('touchstart', (e) => onTlClick(e.touches[0].clientX), { passive: true });

            // Pré-calcul immédiat des matrices pour éviter les pics de calcul au premier input
            scene.updateMatrixWorld(true);
        }

        // Génération des nuages 2D "Tic-Tac" de fond (Room Layer)
        function initClouds() {
            // Clean up old 3D clouds if they exist
            if (window._3dClouds) {
                window._3dClouds.forEach(c => {
                    if (typeof scene !== 'undefined' && scene) scene.remove(c);
                });
            }
            window._3dClouds = [];

            const container = document.getElementById('room-bg-layer');
            if (!container) return;
            
            // Clean up old DOM clouds
            container.querySelectorAll('.cloud-2d').forEach(c => c.remove());
            window._bgClouds = [];

            // Patterns de motifs de nuages (combinaisons de pilules superposées)
            const patterns = [
                // Pattern 0: Petit nuage classique (3 puffs)
                {
                    width: 170, height: 55,
                    puffs: [
                        { w: 70, h: 35, l: 0, b: 0 },
                        { w: 100, h: 55, l: 40, b: 0 },
                        { w: 60, h: 30, l: 110, b: 0 }
                    ]
                },
                // Pattern 1: Nuage étiré en longueur (4 puffs)
                {
                    width: 280, height: 35,
                    puffs: [
                        { w: 90, h: 25, l: 0, b: 0 },
                        { w: 120, h: 35, l: 50, b: 0 },
                        { w: 100, h: 30, l: 130, b: 0 },
                        { w: 80, h: 20, l: 200, b: 0 }
                    ]
                },
                // Pattern 2: Gros nuage volumineux (5 puffs)
                {
                    width: 240, height: 65,
                    puffs: [
                        { w: 50, h: 30, l: 10, b: 0 },
                        { w: 80, h: 55, l: 40, b: 0 },
                        { w: 90, h: 65, l: 80, b: 0 },
                        { w: 70, h: 45, l: 140, b: 0 },
                        { w: 50, h: 25, l: 190, b: 0 }
                    ]
                },
                // Pattern 3: Nuage compact minimaliste (2 puffs)
                {
                    width: 120, height: 40,
                    puffs: [
                        { w: 70, h: 30, l: 0, b: 0 },
                        { w: 80, h: 40, l: 40, b: 0 }
                    ]
                }
            ];

            // Génère entre 15 et 26 clusters de nuages
            const count = 15 + Math.floor(Math.random() * 12); 
            for (let i = 0; i < count; i++) {
                const cloud = document.createElement('div');
                cloud.className = 'cloud-2d';
                
                // Sélection aléatoire d'un modèle de nuage
                const pattern = patterns[Math.floor(Math.random() * patterns.length)];
                const scale = 0.8 + Math.random() * 1.5; 
                const top = -10 + Math.random() * 85; 
                const baseOpacity = 0.22 + Math.random() * 0.22; 
                const duration = 80 + Math.random() * 200; 
                const delay = -(Math.random() * duration); 
                
                cloud.style.setProperty('--w', `${pattern.width}px`);
                cloud.style.setProperty('--h', `${pattern.height}px`);
                cloud.style.setProperty('--s', scale);
                cloud.style.top = `${top}%`;
                cloud.style.setProperty('--base-opacity', baseOpacity);
                cloud.style.setProperty('--base-dur', `${duration}s`);
                cloud.style.setProperty('--delay', `${delay}s`);
                
                // Génération des sous-puffs du cluster
                let html = '';
                pattern.puffs.forEach(p => {
                    html += `<div class="cloud-puff" style="width: ${p.w}px; height: ${p.h}px; left: ${p.l}px; bottom: ${p.b}px;"></div>`;
                });
                cloud.innerHTML = html;
                
                container.appendChild(cloud);
                window._bgClouds.push(cloud);
            }
        }

        function triggerLightningEffect() {
            const overlay = document.getElementById('lightning-overlay');
            const clouds = window._bgClouds || [];
            if (!overlay) return;

            // Reset animation (force reflow)
            overlay.classList.remove('lightning-active');
            void overlay.offsetWidth; 
            overlay.classList.add('lightning-active');

            // Flash lumineux sur les nuages 2D
            clouds.forEach(c => {
                c.classList.add('cloud-lightning-boost');
                setTimeout(() => c.classList.remove('cloud-lightning-boost'), 400);
            });

            // Tonnerre synthétique (Grondement basse fréquence)
            playTone(55, 'sawtooth', 0.6, 0.05);
            setTimeout(() => playTone(40, 'sine', 0.8, 0.03), 100);
        }

        function generateRandomTimelineClips() {
            const tracks = document.querySelectorAll('.tl-track');
            tracks.forEach((track, trackIndex) => {
                track.querySelectorAll('.tl-clip').forEach(c => c.remove());
                track.querySelectorAll('.daw-svg-clip').forEach(c => c.remove());

                const colorTag = track.querySelector('.track-color-tag');
                if (!colorTag) return;

                const bgClass = Array.from(colorTag.classList).find(c => c.startsWith('bg-'));
                const colorBase = bgClass ? bgClass.split('-')[1] : 'blue';
                const isDrums = trackIndex < 2; // Assume first two tracks are Drums/Perc

                let currentX = 140; 
                const timelineLimit = 2000; 

                while (currentX < timelineLimit - 150) {
                    const gap = 15 + Math.random() * 120;
                    currentX += gap;
                    if (currentX > timelineLimit) break;

                    const width = 30 + Math.random() * 220;
                    const clip = document.createElement('div');
                    clip.className = `tl-clip daw-svg-clip bg-${colorBase}-500/20`;
                    clip.style.left = currentX + 'px';
                    clip.style.width = width + 'px';
                    
                    // Generate Waveform SVG
                    let pathData = "M 0 50 ";
                    const segments = Math.floor(width / 3);
                    for(let i=0; i<=segments; i++) {
                        const x = (i / segments) * 100;
                        if (isDrums) {
                            // Transient spikes
                            const y = i % 4 === 0 ? 10 + Math.random() * 80 : 50 + (Math.random()*10 - 5);
                            pathData += `L ${x} ${y} `;
                        } else {
                            // Smooth sine curves
                            const y = 50 + Math.sin(i * 0.5) * (20 + Math.random() * 20);
                            pathData += `L ${x} ${y} `;
                        }
                    }
                    pathData += "L 100 50 Z";

                    clip.innerHTML = `<svg viewBox="0 0 100 100" preserveAspectRatio="none" style="width: 100%; height: 40px; max-height: 40px; display: block; overflow: hidden;">
                        <path d="${pathData}" fill="none" stroke="currentColor" stroke-width="2" class="text-${colorBase}-400 opacity-80"></path>
                        <path d="${pathData}" fill="currentColor" class="text-${colorBase}-500/30"></path>
                    </svg>
                    <div class="absolute inset-y-0 left-0 w-1 cursor-ew-resize hover:bg-white/50"></div>
                    <div class="absolute inset-y-0 right-0 w-1 cursor-ew-resize hover:bg-white/50"></div>`;
                    
                    track.appendChild(clip);
                    currentX += width;
                }
            });
        }

        // --- DICTIONNAIRE DES STYLES MUSICAUX ---
        const DAW_GENRES = [
        { id: 'drill',      name: 'UK Drill',      unlockAt: 0,  targetBpm: 140, tol: 5, targetVoice: 'm',      reward: 'money' },
        { id: 'afropop',    name: 'Afro-Pop',      unlockAt: 0,  targetBpm: 110, tol: 5, targetVoice: 'f',      reward: 'followers' },
        { id: '2step',      name: '2 Step',        unlockAt: 5,  targetBpm: 135, tol: 2, targetVoice: 'instru', reward: 'stable' },
        { id: 'amapiano',   name: 'Amapiano',      unlockAt: 10, targetBpm: 113, tol: 1, targetVoice: 'm',      reward: 'rep' },
        { id: 'oldschool',  name: 'Old School',    unlockAt: 15, targetBpm: 90,  tol: 3, targetVoice: 'm',      reward: 'money' },
        { id: 'trap808',    name: 'Trap 808',      unlockAt: 20, targetBpm: 130, tol: 2, targetVoice: 'instru', reward: 'followers' },
        { id: 'plug',       name: 'Plug',          unlockAt: 25, targetBpm: 125, tol: 3, targetVoice: 'f',      reward: 'money' },
        { id: 'dnb',        name: 'Drum & Bass',   unlockAt: 30, targetBpm: 160, tol: 2, targetVoice: 'instru', reward: 'stable' },
        { id: 'phonk',      name: 'Phonk',         unlockAt: 35, targetBpm: 60,  tol: 2, targetVoice: 'instru', reward: 'rep' },
        { id: 'newjazz',    name: 'New Jazz',      unlockAt: 40, targetBpm: 137, tol: 2, targetVoice: 'm',      reward: 'followers' },
        { id: 'bossalofi',  name: 'Bossa Lo-Fi',   unlockAt: 50, targetBpm: 88,  tol: 2, targetVoice: 'f',      reward: 'rep' }
    ];

    function isAllDawGenresUnlocked() {
        return Boolean(
            state && (
                state.studioUnlocked ||
                state.activeLocation === 'pro_studio' ||
                String(state.username || '').toUpperCase() === 'DEV_STUDIO'
            )
        );
    }


    function updateDawGenres() {
        const container = document.getElementById('daw-genres-container');
        if (!container || !DAW_GENRES) return;

        const currentTracks = (state && state.stats && typeof state.stats.tracks === 'number') ? state.stats.tracks : 0;
        const allUnlocked = isAllDawGenresUnlocked();

        container.innerHTML = DAW_GENRES.map(g => {
            const isUnlocked = allUnlocked || currentTracks >= g.unlockAt;

            if (!isUnlocked) {
                return `<div class="relative group locked disabled" title="Nécessite ${g.unlockAt} Tracks produits">
                            <button class="btn-daw-pad w-full py-3 md:py-2 text-[10px] md:text-[9px] rounded tracking-widest opacity-50 grayscale flex items-center justify-center gap-2 cursor-not-allowed locked disabled" disabled>
                                <span class="drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] text-sm">🔒</span> ???
                            </button>
                            <div class="absolute -top-8 left-1/2 -translate-x-1/2 bg-black/90 border border-[#27272a] text-white text-[9px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">Débloqué à ${g.unlockAt} Tracks</div>
                        </div>`;
            }

            const isActive = currentDawGenre === g.id;
            const mkt = getGenreMarketStatus(g.id);
            const mktRing = mkt.state === 'hot' ? 'border-amber-400/50' : (mkt.state === 'saturated' ? 'border-rose-500/35 opacity-80' : '');
            const btnClass = isActive ? 'btn-daw-pad btn-juice selected border-[#10b981]' : `btn-daw-pad btn-juice ${mktRing}`;
            const tagHtml = mkt.tag ? `<span class="ml-1 text-[10px]" title="${mkt.label}">${mkt.tag}</span>` : '';

            return `<button class="${btnClass} w-full py-3 md:py-2 text-[10px] md:text-[9px] rounded tracking-widest" data-val="${g.id}" title="${g.name} · Marché : ${mkt.label}" onclick="selectDawGenre('${g.id}', '${g.name}', event)">${g.name}${tagHtml}</button>`;
        }).join('');
        if (typeof window.syncMasteringRackUI === 'function') window.syncMasteringRackUI();
    }


    function selectDawGenre(val = null, genreName = null, event = null) {
        if (event) {
            event.stopPropagation();
            event.preventDefault();
            
            // Backup de sécurité pour les clics
            const target = event.currentTarget || event.target;
            if (target) {
                const isLocked = target.classList.contains('locked') || 
                                 target.classList.contains('disabled') || 
                                 target.hasAttribute('disabled');
                if (isLocked) {
                    return;
                }
            }
        }

        if (val) {
            const currentTracks = (state && state.stats && typeof state.stats.tracks === 'number') ? state.stats.tracks : 0;
            const genreData = DAW_GENRES.find(g => g.id === val);
            if (genreData && !isAllDawGenresUnlocked() && currentTracks < genreData.unlockAt) {
                return;
            }

            currentDawGenre = val;
            
            // CORRECTION : L'affichage du badge est géré proprement ici
            if (genreName) {
                const badge = document.getElementById('daw-active-genre-badge');
                if (badge) {
                    badge.classList.remove('hidden');
                    badge.innerText = genreName;
                }
            }
            
            playGenrePreview(val);
        }
        
        updateDawGenres();
        if (typeof populateDawSamples === 'function') populateDawSamples();
        if (typeof window.updateDawEchoCopilot === 'function') window.updateDawEchoCopilot();
        if (typeof playUIAudio === 'function') playUIAudio('switch', 0.7);
    }

    // L'accolade orpheline qui faisait crasher tout le fichier a été supprimée.

    function selectDawVoice(val = 'm') {
        currentDawVoice = val || 'm';

        document.querySelectorAll('.btn-voice').forEach(btn => {
            btn.classList.toggle('selected', btn.dataset.val === currentDawVoice);
        });

        if (typeof window.updateDawEchoCopilot === 'function') window.updateDawEchoCopilot();
        if (typeof playBleep === 'function') playBleep();
    }
    
    function updateDawPlugins() {
            const select = document.getElementById('daw-plugin');
            
            // FIX : Fusion sécurisée des anciens et nouveaux inventaires
            const safeOwned = Array.isArray(state.ownedCracks) ? state.ownedCracks : [];
            const safeInv = Array.isArray(state.inventory) ? state.inventory : [];
            const availableCracks = [...new Set([...safeOwned, ...safeInv])];
            
            let html = '<option value="">- Clean Mix (No Plugin) -</option>';

            if (availableCracks.length > 0) {
                availableCracks.forEach((crackId) => {
                    const c = cracks.find(x => x.id === crackId);
                    if (c) html += `<option value="${c.id}">Use: ${c.name}</option>`;
                });
            }

            if (select) select.innerHTML = html;
        }


        // ==========================================
        // 17. DAW LOGIC & ENERGY CONSUMPTION
        // ==========================================
        function togglePad(idx) {
            const pad = document.getElementById(`pad-${idx}`);
            pad.classList.toggle('active');
            if (pad.classList.contains('active')) { playKick(); simulateVuMeter(12); }
            if (typeof window.syncMasteringRackUI === 'function') window.syncMasteringRackUI();
        }

        function calculateSuccess(genreId, bpm, voice) {
        const g = DAW_GENRES.find(x => x.id === genreId);
        if (!g) return { score: 1, rewardType: 'money' }; // Failsafe
        
        let diff = Math.abs(bpm - g.targetBpm);
        let isPerfectBpm = diff <= g.tol; // Tolérance d'erreur intégrée au dico
        
        if (voice !== g.targetVoice || diff > 10) return { score: 0, rewardType: g.reward, wrongVoice: (voice !== g.targetVoice) };
        if (isPerfectBpm) return { score: 3, rewardType: g.reward };
        
        return { score: 1, rewardType: g.reward };
    }

            // === EFFET VISUEL : FLASH DU DAW ===
    function triggerDawFlash(bpm) {
        const daw = document.getElementById('app-daw');
        if (!daw) return;

        // Calcul du temps d'un battement en millisecondes (ex: 120 bpm = 500ms)
        const beatMs = (60 / bpm) * 1000;
        
        // Sauvegarde des styles d'origine pour ne pas casser le CSS existant
        const originalBoxShadow = daw.style.boxShadow;
        const originalBorderColor = daw.style.borderColor;
        const originalTransition = daw.style.transition;

        // 1. Impact instantané (0.05s)
        daw.style.transition = 'box-shadow 0.05s ease-out, border-color 0.05s ease-out';
        daw.style.boxShadow = '0 0 50px rgba(255, 255, 255, 0.12), inset 0 0 20px rgba(255, 255, 255, 0.08)';
        daw.style.borderColor = 'rgba(255, 255, 255, 0.4)';

        // 2. Relâchement calé très précisément sur la durée d'un temps (beatMs)
        setTimeout(() => {
            daw.style.transition = `box-shadow ${beatMs}ms ease-out, border-color ${beatMs}ms ease-out`;
            daw.style.boxShadow = originalBoxShadow;
            daw.style.borderColor = originalBorderColor;
            
            // 3. Nettoyage de la transition une fois l'effet terminé
            setTimeout(() => {
                daw.style.transition = originalTransition;
            }, beatMs);
        }, 50); // Le temps de laisser l'impact visuel à l'écran
    }

        window.exportTrack = exportTrack;
        window.openMiniGameMenu = openMiniGameMenu;
        window.closeMiniGameMenu = closeMiniGameMenu;
        window.launchDoorMiniGame = launchDoorMiniGame;
        function exportTrack() {
            if (typeof stopGenrePreview === 'function') stopGenrePreview();
            if (getTotalMins() < (parseInt(state.cooldowns.dawTimeReady, 10) || 0) || state.isExporting) return;

            if (state.energy <= 0) {
                showToast("T'es KO, impossible de mixer. Clique sur le lit pour dormir.", "error");
                playError();
                return;
            }

                if (state.inspi < 20) {
                showToast("Le mix manque de vie... Exporter sans inspiration détruit tes prods.", "error");
                // Pénalité appliquée : la créativité est déjà épuisée, le mix en souffre
            }

            // Chaque export consomme un bloc moyen de créativité
            state.inspi = Math.max(0, state.inspi - 15);

            // Achievement: Toujours dans le rouge
            checkAchievement('toujours_dans_le_rouge', () => state.energy < 5);

            const genre = currentDawGenre;
            const bpm   = parseInt(document.getElementById('daw-bpm').value, 10);
            const voice = currentDawVoice;
            const activePads = (typeof window.getActiveDawPadsCount === 'function') ? window.getActiveDawPadsCount() : 0;
            const pluginIndex = document.getElementById('daw-plugin').value;

            const trackTitle = document.getElementById('track-title-input').value.trim() || `UNTITLED_${state.stats.tracks + 1}`;

            const initialEnergy = state.energy;
            const ghostArmedForExport = Boolean(state.echoBuffs && state.echoBuffs.ghostProdReady);
            const energyCost = ghostArmedForExport ? 10 : 20;
            state.energy = Math.max(0, state.energy - energyCost); 
            updateHUD();

            const energyRatio = initialEnergy / 100;
            const speedMult = 1 + ((1 - energyRatio) * 2.5); 
            const jitterMult = 1 + ((1 - energyRatio) * 6); 
            const isFatigued = initialEnergy < 20;

            let consumedPluginId = null;
            if (pluginIndex !== "") {
                    consumedPluginId = pluginIndex;
            }


            // Comment from ECHO at beginning of export
            const isEchoActive = (parseInt(state.cooldowns.echoSubExpiry, 10) || 0) > getTotalMins();
            if (isEchoActive) {
                let echoComment = "ECHO : 'Pas de sample sélectionné. Ta track risque de manquer de texture.'";
                if (state.activeSample) {
                    const sampleObj = SAMPLE_CATALOG.find(s => s.id === state.activeSample.id);
                    if (sampleObj) {
                        if (sampleObj.genre.toLowerCase() === genre.toLowerCase()) {
                            echoComment = `ECHO : 'Excellente idée d'utiliser ${sampleObj.name} pour faire de la ${genre}. La compatibilité va être maximale.'`;
                        } else {
                            echoComment = `ECHO : 'Utiliser ${sampleObj.name} sur une prod ${genre} ? Drôle de mélange, j'espère que tu sais ce que tu fais.'`;
                        }
                    }
                }
                setTimeout(() => {
                    showToast(echoComment, "info");
                }, 800);
            }

            state.isExporting = true;
            const btn = document.getElementById('btn-export');
            const progCont = document.getElementById('export-progress-container');
            const prog = document.getElementById('export-progress');
            const playhead = document.getElementById('playhead');
            const dawWindow = document.getElementById('app-daw');

            // Afficher l'overlay d'export
            const renderOverlay = document.getElementById('daw-render-overlay');
            if (renderOverlay) {
                renderOverlay.classList.remove('hidden');
                renderOverlay.classList.add('flex');
                
                const renderBar = document.getElementById('daw-render-bar');
                const renderPct = document.getElementById('daw-render-pct');
                const renderTime = document.getElementById('daw-render-time');
                if (renderBar) renderBar.style.width = '0%';
                if (renderPct) renderPct.innerText = '0%';
                if (renderTime) renderTime.innerText = 'Calculating ETA...';
            }

            btn.innerText = "RENDERING..."; btn.disabled = true;
            document.getElementById('playhead').classList.remove('playhead-animated');
            progCont.classList.remove('hidden'); prog.style.width = '0%';
            playhead.style.left = '110px';
            playTone(400, 'square', 0.1);

            if (dawWindow) dawWindow.classList.add('daw-rendering');

            const vuInterval = setInterval(() => {
                simulateVuMeter(14);
                // Bruit de calcul machine/processeur
                playTone(800 + Math.random() * 1000, 'square', 0.02, 0.01);
                
                for (let i = 1; i <= 3; i++) {
                    const k = document.getElementById(`knob-${i}`);
                    if (k) { 
                        const r = Math.floor(Math.random() * 270 * jitterMult - (135 * jitterMult)); 
                        k.style.transform = `rotate(${r}deg)`; 
                    }
                }
                if (isFatigued && !isMobile) {
                    dawWindow.style.transform = `translate(${Math.random() * 8 - 4}px, ${Math.random() * 8 - 4}px)`;
                }
            }, 100);

            let p = 0;
            const interval = setInterval(() => {
                p += 4 * speedMult;
                prog.style.width = Math.min(100, p) + '%';
                playhead.style.left = `${110 + (Math.min(100, p) * 6)}px`;
                
                const renderBar = document.getElementById('daw-render-bar');
                const renderPct = document.getElementById('daw-render-pct');
                const renderTime = document.getElementById('daw-render-time');
                if (renderBar) renderBar.style.width = Math.min(100, p) + '%';
                if (renderPct) renderPct.innerText = Math.floor(Math.min(100, p)) + '%';
                if (renderTime) {
                    const remainingPercent = 100 - p;
                    const etaSeconds = Math.max(1, Math.ceil((remainingPercent / (4 * speedMult)) * 0.03));
                    renderTime.innerText = `ETA: ${etaSeconds}s`;
                }
                
            if (p >= 100) {
                clearInterval(interval);
                clearInterval(vuInterval);
                if (renderOverlay) {
                    renderOverlay.classList.add('hidden');
                    renderOverlay.classList.remove('flex');
                }
                if (dawWindow) {
                    dawWindow.style.transform = 'none'; 
                    dawWindow.classList.remove('daw-rendering');
                }
                playhead.style.left = '110px';
                /* state.isExporting = false; MOVED TO REVIEW CLOSE */
                state.cooldowns.dawTimeReady = getTotalMins() + getDawCooldown();
                progCont.classList.add('hidden');
                
                // --- EFFETS SMOOTH DE FIN D'EXPORT ---
                window.camShakeIntensity = 0.4; // Shake de la caméra 3D (Léger et élégant)
                triggerDawFlash(bpm);           // Illumination du logiciel
                // -------------------------------------

                if (Math.floor(state.energy) === 1) {
                    checkAchievement('zero_energie_zero_probleme', () => true);
                }

                finishExport(genre, bpm, voice, activePads, consumedPluginId, trackTitle);
            }
            }, 30);
        

        function finishExport(genre, bpm, voice, pads, pluginId, trackTitle) {
            try {
                const deferredToasts = [];
                const originalShowToast = showToast;
                // Temporarily override showToast to intercept toasts during export calculation
                showToast = function(msg, type, onClick, priority) {
                    deferredToasts.push({msg, type, onClick, priority});
                };

                const result = calculateSuccess(genre, bpm, voice);
                let moneyGain = 0, repGain = 0, follGain = 0, resultTxt = "", critique = "";

                // --- ECHO AI : INTERVENTION SUR LA QUALITÉ, GHOST-PROD & AUTO-CALIBRAGE ---
                const echoTierNow = typeof window.getEchoTier === 'function' ? window.getEchoTier() : 'free';
                const echoBuffs = state.echoBuffs || (state.echoBuffs = { algoBoostTracks: 0, ghostProdReady: false, autoMixReady: false, trendDay: 0, trendGenreId: null, lastAlgoPushDay: 0 });
                const usedGhostProd = Boolean(echoBuffs.ghostProdReady);
                const usedAutoMix = Boolean(echoBuffs.autoMixReady);
                const alignVal = Number(state.echoAlignment) || 0;
                const heatMult = alignVal >= 30 ? 0.60 : (alignVal <= -30 ? 1.35 : 1.0);

                if (usedGhostProd) {
                    result.score = 3;
                    echoBuffs.ghostProdReady = false;
                    const addHeat = Math.round(22 * heatMult);
                    state.echoAiHeat = Math.min(100, (Number(state.echoAiHeat) || 0) + addHeat);
                    critique += `\n[Echo Ghost-Prod IA] Prod optimisée (-50% énergie, Banger garanti · +${addHeat}% Suspicion IA).`;
                }
                if (usedAutoMix) {
                    if (result.score === 0) result.score = 1;
                    echoBuffs.autoMixReady = false;
                    const addHeat = alignVal >= 30 ? 0 : Math.round(6 * heatMult);
                    state.echoAiHeat = Math.min(100, (Number(state.echoAiHeat) || 0) + addHeat);
                    critique += `\n[Echo Auto-Mix] Calibrage spectral +15% cash${addHeat > 0 ? ` (+${addHeat}% Suspicion IA)` : ' (Mode Puriste : 0% suspicion)'}.`;
                }
                if (!usedGhostProd && !usedAutoMix) {
                    // Production 100% organique : refroidit la suspicion IA
                    state.echoAiHeat = Math.max(0, (Number(state.echoAiHeat) || 0) - 10);
                }

                let sampleClaimTriggered = false;
                if (state.activeSample) {
                    const isCleared = state.clearedSamples && state.clearedSamples.includes(state.activeSample.id);
                    if (!isCleared) {
                        let risk = state.activeSample.risque;
                        const hasSampleClearCrack = (state.inventory && state.inventory.includes('SampleClear_Pro.exe')) || (state.ownedCracks && state.ownedCracks.includes('sampleclear_pro'));
                        if (hasSampleClearCrack) {
                            risk *= 0.60; // 40% reduction
                        }
                        if (Math.random() < risk) {
                            sampleClaimTriggered = true;
                        }
                    }
                }

                if (pluginId === 'crk3' && result.score === 0 && result.wrongVoice) { result.score = 1; critique = "\nVocalTune activé : Voix robotique, mais ça passe pour TikTok."; }
                if (pluginId === 'crk15') {
                    result.score = 3;
                    if (Math.random() > 0.5) { critique = "\nXray Antidote : Hit absolu, mais Bad Buzz de tricheur (-20 REP)."; repGain -= 20; }
                    else critique = "\nXray Antidote : Algos bypassés. Personne n'a remarqué. Hit assuré.";
                }
                
                if (result.score === 3) {
                    resultTxt = "🔥 PERFECT BANGER! (Top Charts)"; state.stats.bangers++; 
                    state.stats.consecutiveFlops = 0; 
                    if (result.rewardType === 'money')     { moneyGain = 600;  repGain += 15; }
                    if (result.rewardType === 'followers') { moneyGain = 100;  follGain = 5000; repGain += 20; }
                    if (result.rewardType === 'stable')    { moneyGain = 300;  repGain += 15; }
                    if (result.rewardType === 'rep')       { moneyGain = 100;  repGain += 45; follGain = 1000; }
                } else if (result.score === 1) {
                    resultTxt = "👍 Prod correcte. Ça va faire des streams."; 
                    state.stats.consecutiveFlops = 0; 
                    if (result.rewardType === 'money')     { moneyGain = 150;  repGain += 7; }
                    if (result.rewardType === 'followers') { moneyGain = 35;   follGain = 800; repGain += 8; }
                    if (result.rewardType === 'stable')    { moneyGain = 100;  repGain += 1; }
                    if (result.rewardType === 'rep')       { moneyGain = 30;   repGain += 15; }
                } else {
                    resultTxt = "🗑️ MASSIVE FLOP. Wrong vibe for 2026.";
                    moneyGain = 15;
                    state.stats.flops++; 
                    state.stats.consecutiveFlops++; 
                    
                    // NOUVEAU : Impact moral (Baisse d'inspiration)
                    if (state.inspi > 0) {
                        state.inspi = Math.max(0, state.inspi - 20);
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
                    
                    // Nerf the flop spiral: base is -2 REP, pity is +1 REP if consecutiveFlops >= 3
                    if (state.stats.consecutiveFlops >= 3) {
                        repGain = 1;
                        critique += "\n[Pitié] Flops consécutifs élevés. Bonus pitié +1 REP.";
                    } else {
                        repGain = -2;
                    }
                }

                // 1. Update Hype Meter
                if (typeof window.updateHype === 'function') {
                    if (result.score === 3) {
                        window.updateHype(5);
                    } else if (result.score === 0) {
                        window.updateHype(-5);
                    }
                }

                // 2. Compute and apply Hype multiplier (+20% max at 100% hype)
                const hypeMult = 1 + (((state.hype || 50) / 100) * 0.20);
                moneyGain = Math.floor(moneyGain * hypeMult);
                follGain = Math.floor(follGain * hypeMult);

                // 3. Daily Quest progress
                if (typeof window.checkDailyQuests === 'function') {
                    window.checkDailyQuests('export_tracks', 1);
                }

                // 4. Calculate Viral Chance (Base 1% + score/hype/followers bonuses + Echo Algo Boost)
                let viralChance = 0.01 + (result.score === 3 ? 0.04 : 0.01) + Math.min(0.05, ((state.hype || 50) / 100) * 0.05) + Math.min(0.05, ((state.followers || 0) / 100000) * 0.05);

                // --- ECHO AI : RADAR TENDANCE, BOOST ALGO, ALIGNEMENT & SCANDALE IA ---
                const dailyTrend = typeof window.getDailyTrendGenre === 'function' ? window.getDailyTrendGenre() : null;
                if (dailyTrend && dailyTrend.id === genre) {
                    moneyGain = Math.floor(moneyGain * 1.30);
                    follGain = Math.floor(follGain * 1.40);
                    critique += `\n[SoundNet Trend · ${dailyTrend.name}] Genre chaud du jour : +30% Cash & +40% Fans !`;
                }
                if (usedGhostProd) {
                    moneyGain = Math.floor(moneyGain * 1.20);
                    follGain = Math.floor(follGain * 1.20);
                }
                if (usedAutoMix) {
                    moneyGain = Math.floor(moneyGain * 1.15);
                }
                if (echoBuffs.algoBoostTracks > 0) {
                    echoBuffs.algoBoostTracks = Math.max(0, echoBuffs.algoBoostTracks - 1);
                    follGain = Math.floor(follGain * 1.35);
                    viralChance *= 2.0;
                    critique += "\n[Echo Algo Push] Portée SoundNet amplifiée : +35% Fans & chances virales x2 !";
                }
                // Passifs réels d'Alignement (Puriste vs Algorithme)
                if (alignVal >= 30) {
                    if (result.score === 3) moneyGain = Math.floor(moneyGain * 1.15);
                    if (repGain > 0) repGain = Math.ceil(repGain * 1.25);
                    critique += "\n[Alignement Puriste] Intégrité artistique : +25% REP" + (result.score === 3 ? " & +15% Cash Banger." : ".");
                } else if (alignVal <= -30) {
                    follGain = Math.floor(follGain * 1.25);
                    moneyGain = Math.floor(moneyGain * 1.15);
                    if (repGain > 0) repGain = Math.max(1, Math.floor(repGain * 0.85));
                    critique += "\n[Alignement Algorithme] Format viral optimisé : +25% Fans, +15% Cash (-15% REP).";
                } else if (echoTierNow !== 'free') {
                    moneyGain = Math.floor(moneyGain * 1.05);
                    follGain = Math.floor(follGain * 1.08);
                }

                // Risque réel de Scandale "Artiste IA Démasqué" si Suspicion IA >= 75%
                const aiHeatNow = Number(state.echoAiHeat) || 0;
                if ((usedGhostProd || usedAutoMix) && aiHeatNow >= 75) {
                    const scandalProb = Math.min(0.85, (aiHeatNow - 60) / 100);
                    if (Math.random() < scandalProb) {
                        const lostFans = Math.floor((state.followers || 0) * 0.12);
                        repGain -= 25;
                        if (lostFans > 0) state.followers = Math.max(0, state.followers - lostFans);
                        state.echoAiHeat = 25;
                        critique += `\n🚨 SCANDALE IA : Un thread SoundNet prouve que tu abuses d'Echo AI (-25 REP${lostFans > 0 ? `, -${lostFans} Fans` : ''}) !`;
                        setTimeout(() => {
                            showToast("🚨 BAD BUZZ : Un thread SoundNet t'accuse d'être un 'Producteur IA' (-25 REP) !", "error");
                            if (typeof playError === 'function') playError();
                        }, 1500);
                    }
                }
                if (typeof window.updateDawEchoCopilot === 'function') setTimeout(() => window.updateDawEchoCopilot(), 300);
                if (typeof window.syncEchoSidebarUI === 'function') setTimeout(() => window.syncEchoSidebarUI(), 300);

                if (Math.random() < viralChance) {
                    state.viralActive = true;
                    state.viralEndTime = getTotalMins() + 1440; // 24 hours in-game
                    critique += "\n⚡ VIRALITÉ EXPRÈS : Ta prod a percé sur l'algorithme ! Fans x10 pendant 24h !";
                    setTimeout(() => {
                        showToast("🚀 TA PROD DEVIENT VIRALE ! Gains de fans x10 pendant 24h !", "success");
                        if (typeof fireConfetti === 'function') fireConfetti('store');
                    }, 1200);
                }

                // Flow State bonus multiplier application (REPAIRED: +15% Cash, +15% Fans, +0.4 Score!)
                let flowStateApplied = false;
                let flowScoreBonus = 0;
                if (state.flowStateActive) {
                    moneyGain = Math.floor(moneyGain * 1.15);
                    follGain = Math.floor(follGain * 1.15);
                    flowScoreBonus = 0.4;
                    flowStateApplied = true;
                    state.flowStateActive = false;
                }

                // Déclenchement réaliste du Flow State : 2 Bangers d'affilée OU 3 exports en <= 180 min in-game
                state.recentExports = state.recentExports || [];
                state.recentExports.push(getTotalMins());
                if (state.recentExports.length > 5) state.recentExports.shift();
                state.stats.consecutiveBangers = (result.score === 3) ? ((state.stats.consecutiveBangers || 0) + 1) : 0;

                const rapidTriplet = state.recentExports.length >= 3 &&
                    (state.recentExports[state.recentExports.length - 1] - state.recentExports[state.recentExports.length - 3]) <= 180;
                if (!flowStateApplied && (state.stats.consecutiveBangers >= 2 || rapidTriplet)) {
                    state.flowStateActive = true;
                    setTimeout(() => {
                        showToast("⚡ FLOW STATE ACTIVÉ ! Prochain export : +15% Cash/Fans & +0.4 Score !", "success");
                    }, 800);
                }

                if (flowStateApplied) {
                    critique += "\n[Flow State] In The Zone : +15% Cash/Fans & +0.4 Score !";
                }

                // Marché dynamique des Genres (🔥 HOT vs 📉 SATURÉ)
                const marketStatus = (typeof getGenreMarketStatus === 'function') ? getGenreMarketStatus(genre) : { state: 'normal', cashMult: 1, fansMult: 1 };
                if (marketStatus.state === 'hot') {
                    moneyGain = Math.floor(moneyGain * marketStatus.cashMult);
                    follGain = Math.floor(follGain * marketStatus.fansMult);
                    critique += "\n[Marché 🔥] Style très recherché aujourd'hui : +25% Cash & +20% Fans !";
                } else if (marketStatus.state === 'saturated') {
                    moneyGain = Math.floor(moneyGain * marketStatus.cashMult);
                    follGain = Math.floor(follGain * marketStatus.fansMult);
                    critique += "\n[Marché 📉] Style saturé par tes sorties récentes (-20% Cash). Varie tes prods !";
                }
                if (typeof recordGenreMarketExport === 'function') recordGenreMarketExport(genre);

                // Bonus Couronne #1 Top 10 Producteurs
                const isTop1Prod = (typeof window.isPlayerRankOneProducer === 'function' && window.isPlayerRankOneProducer());
                if (isTop1Prod) {
                    moneyGain = Math.floor(moneyGain * 1.10);
                    follGain = Math.floor(follGain * 1.10);
                    critique += "\n[Couronne #1] Leader du Top 10 Producteurs : +10% Cash & Fans !";
                }

                // Bonus Piano Roll & Drum Pads RÉELLEMENT connectés à l'export
                const prBonus = (typeof window.getPianoRollCompositionBonus === 'function')
                    ? window.getPianoRollCompositionBonus()
                    : { scoreBonus: 0, cashMult: 0, label: '' };
                if (prBonus.scoreBonus > 0) {
                    moneyGain = Math.floor(moneyGain * (1 + prBonus.cashMult));
                    critique += `\n[Piano Roll] ${prBonus.label} (+${prBonus.scoreBonus.toFixed(1)} score, +${Math.round(prBonus.cashMult * 100)}% cash) !`;
                }
                let padsScoreBonus = 0;
                if (pads >= 4 && pads <= 12) {
                    padsScoreBonus = 0.4;
                    moneyGain = Math.floor(moneyGain * 1.08);
                    critique += `\n[Drum Pads] Groove calibré (${pads} pads actifs · +0.4 score, +8% cash) !`;
                } else if (pads > 12) {
                    padsScoreBonus = 0.2;
                    moneyGain += 25;
                    critique += `\n[Drum Pads] Pattern dense (${pads} pads · +0.2 score).`;
                }

                if (state.earlyGameBoost) {
                    if (state.stats.tracks < 3) {
                        moneyGain = Math.floor(moneyGain * 1.5);
                        follGain = Math.floor(follGain * 1.5);
                        critique += "\n[Boost Débutant] Gains x1.5 (Actif jusqu'à 3 prods) !";
                    } else {
                        state.earlyGameBoost = false;
                        setTimeout(() => {
                            showToast("Fin du boost de débutant. À toi de jouer maintenant.", "info");
                        }, 2000);
                    }
                }

                moneyGain = Math.floor(moneyGain * state.multiplier);

                if (pluginId) {
                    const usedCrack = cracks.find(c => c.id === pluginId);
                    if (usedCrack) {
                        const match = usedCrack.desc.match(/\+(\d+)%/);
                        if (match) {
                            const bonusPercent = parseInt(match[1], 10);
                            const multiplier = 1 + (bonusPercent / 100);
                            moneyGain = Math.floor(moneyGain * multiplier);
                            critique += `\n[${usedCrack.name}] : Bonus +${bonusPercent}% sur les royalties !`;
                        }
                    }
                }
                
                let snowballBonus = Math.floor(state.followers * 0.01);
                if (snowballBonus > 2000) {
                    snowballBonus = 2000 + Math.floor(Math.sqrt(snowballBonus - 2000)); 
                }
                follGain += snowballBonus;

                let toastMsg = `${resultTxt}${critique}\n+$${moneyGain}`;
                if (follGain > 0) toastMsg += ` | +${follGain} Fans`;
                if (repGain !== 0) toastMsg += ` | ${repGain > 0 ? '+' : ''}${repGain} Rep`;

                const trackScore = result.score === 3 ? Math.floor(7 + Math.random() * 3) :
                        result.score === 1 ? Math.floor(4 + Math.random() * 3) :
                                                Math.floor(1 + Math.random() * 3);

                let finalTrackScore = trackScore;

                // Defer Hype System updates to avoid spoilers
                state.hype = state.hype || 50;
                let hypeChange = 0;
                let pendingEffect = null;
                let pendingFloatingText = null;

                if (finalTrackScore >= 7) {
                    const hypeBoost = Math.floor(10 + Math.random() * 10);
                    hypeChange = hypeBoost;
                    critique += `\n[BANGER] La street valide fort ! Hype +${hypeBoost}`;
                    pendingFloatingText = { elementId: 'hud-rep-num', text: '+' + hypeBoost + '% HYPE', color: 'text-yellow-400' };
                    pendingEffect = 'banger-flash';
                } else if (finalTrackScore <= 4) {
                    const hypeDrop = Math.floor(10 + Math.random() * 5);
                    hypeChange = -hypeDrop;
                    critique += `\n[FLOP] Les fans sont déçus... Hype -${hypeDrop}`;
                    pendingFloatingText = { elementId: 'hud-rep-num', text: '-' + hypeDrop + '% HYPE', color: 'text-rose-500' };
                    pendingEffect = 'screen-shake';
                } else {
                    if (state.hype > 50) hypeChange = -2;
                    else if (state.hype < 50) hypeChange = 2;
                }

                window.pendingExportResults = {
                    hypeChange: hypeChange,
                    effect: pendingEffect,
                    floatingText: pendingFloatingText
                };
                
                // --- MULTIPLIER APPLICATION ---
                // Hype multiplier applies to both followers and money (0.5x to 1.5x)
                const hypeMultiplier = 0.5 + (state.hype / 100);
                moneyGain = Math.floor(moneyGain * hypeMultiplier);
                follGain = Math.floor(follGain * hypeMultiplier);
                critique += `\n[HYPE METER] Modificateur de gains : x${hypeMultiplier.toFixed(2)}`;

                if (state.activeSample) {
                    const isCompatible = state.activeSample.genre.toLowerCase() === genre.toLowerCase();
                    if (isCompatible) {
                        finalTrackScore += state.activeSample.bonus;
                        critique += `\n[Sample Compatible] ${state.activeSample.name} (+${state.activeSample.bonus} score) !`;
                    } else {
                        finalTrackScore = Math.max(1, finalTrackScore - 2);
                        critique += `\n[Sample Incompatible] ${state.activeSample.name} (-2 score) !`;
                    }
                }
                
                // Boosts Vinyles et Studio Pro
                let consumedProStudio = false;
                if (state.activeDoorBoosts && state.activeDoorBoosts.vinylCharges > 0) {
                    state.activeDoorBoosts.vinylCharges--;
                    finalTrackScore += 1.5;
                    critique += "\n[Boost Vinyle] Échantillonnage vinyle haut de gamme (+1.5 score) !";
                }
                if (state.activeDoorBoosts && state.activeDoorBoosts.proStudioCharges > 0) {
                    state.activeDoorBoosts.proStudioCharges--;
                    finalTrackScore += 1.5;
                    consumedProStudio = true;
                    critique += "\n[Boost Pro Studio] Rendu analogique haute résolution (+1.5 score) !";
                }

                // --- CHAÎNE DE MASTERING ANALOGIQUE 19" SSL / PULTEC / STUDER & LIVE ROOM BUFFS ---
                let masterBonusObj = { scoreBonus: 0, royaltyMult: 0, summary: '' };
                if (typeof window.getMasteringChainBonus === 'function') {
                    const mBonus = window.getMasteringChainBonus(genre);
                    if (mBonus && mBonus.scoreBonus > 0) {
                        masterBonusObj = mBonus;
                        finalTrackScore += mBonus.scoreBonus;
                        moneyGain = Math.floor(moneyGain * (1 + mBonus.royaltyMult));
                        critique += `\n[SSL Mastering 19"] ${mBonus.summary} (+${mBonus.scoreBonus.toFixed(1)} score, +${Math.round(mBonus.royaltyMult * 100)}% royalties) !`;
                    }
                }
                if (flowScoreBonus > 0) finalTrackScore += flowScoreBonus;
                if (prBonus.scoreBonus > 0) finalTrackScore += prBonus.scoreBonus;
                if (padsScoreBonus > 0) finalTrackScore += padsScoreBonus;
                const permMixB = parseFloat(state.permanentMixBonus) || 0;
                if (permMixB > 0) {
                    finalTrackScore += permMixB;
                    critique += `\n[Maîtrise Mix] Bonus qualité permanent (+${permMixB.toFixed(2)} score) !`;
                }
                const hadLiveDrum = Boolean(window._liveDrumGrooveBuff);
                const hadLiveVocal = Boolean(window._liveVocalTakeBuff);
                const hadSubCheck = Boolean(window._subBassCheckBuff);
                if (window._liveDrumGrooveBuff) {
                    window._liveDrumGrooveBuff = false;
                    finalTrackScore += 0.6;
                    critique += "\n[Live Room Batterie] Groove acoustique 5 fûts enregistré en direct (+0.6 score) !";
                }
                if (window._liveVocalTakeBuff) {
                    window._liveVocalTakeBuff = false;
                    finalTrackScore += 0.5;
                    critique += "\n[Prise Neumann U87] Prise vocale Studio Pro ON AIR (+0.5 score) !";
                }
                if (window._subBassCheckBuff) {
                    window._subBassCheckBuff = false;
                    finalTrackScore += 0.4;
                    critique += "\n[Sub 18\" Augspurger] Bas-spectre calibré en Club Mode (+0.4 score) !";
                }
                if (typeof window.syncMasteringRackUI === 'function') window.syncMasteringRackUI();

                // Construction du Breakdown Visuel Post-Export (clair & pédagogique)
                const gObj = (typeof DAW_GENRES !== 'undefined') ? DAW_GENRES.find(x => x.id === genre) : null;
                const bpmDiff = gObj ? Math.abs(bpm - gObj.targetBpm) : 0;
                const voiceOk = gObj ? (voice === gObj.targetVoice) : true;
                const scoreBreakdown = [
                    {
                        label: gObj ? (bpmDiff <= gObj.tol ? `BPM ${bpm} ✓` : (bpmDiff <= 10 ? `BPM ~ (${gObj.targetBpm} idéal)` : `BPM ✕ (${gObj.targetBpm} cible)`)) : `BPM ${bpm}`,
                        tone: gObj ? (bpmDiff <= gObj.tol ? 'good' : (bpmDiff <= 10 ? 'warn' : 'bad')) : 'good'
                    },
                    {
                        label: voiceOk ? 'VOIX ✓' : 'VOIX ✕ (mauvais type)',
                        tone: voiceOk ? 'good' : 'bad'
                    }
                ];
                if (masterBonusObj.scoreBonus > 0) scoreBreakdown.push({ label: `MASTER +${masterBonusObj.scoreBonus.toFixed(1)}`, tone: masterBonusObj.isPerfect ? 'good' : 'info' });
                if (prBonus.scoreBonus > 0) scoreBreakdown.push({ label: `PIANO ROLL +${prBonus.scoreBonus.toFixed(1)}`, tone: 'good' });
                if (padsScoreBonus > 0) scoreBreakdown.push({ label: `PADS +${padsScoreBonus.toFixed(1)}`, tone: 'good' });
                if (flowStateApplied) scoreBreakdown.push({ label: 'FLOW STATE +15%', tone: 'good' });
                if (marketStatus.state === 'hot') scoreBreakdown.push({ label: 'MARCHÉ 🔥 +25%', tone: 'good' });
                else if (marketStatus.state === 'saturated') scoreBreakdown.push({ label: 'SATURÉ 📉 -20%', tone: 'warn' });
                if (hadLiveDrum || hadLiveVocal || hadSubCheck) {
                    const b3d = (hadLiveDrum ? 0.6 : 0) + (hadLiveVocal ? 0.5 : 0) + (hadSubCheck ? 0.4 : 0);
                    scoreBreakdown.push({ label: `STUDIO 3D +${b3d.toFixed(1)}`, tone: 'info' });
                }

                // On met à jour toastMsg et finalTrackScore avec un max de 10 (arrondi à 1 décimale)
                finalTrackScore = Math.min(10, Math.round(finalTrackScore * 10) / 10);
                // --- NOUVEAU FORMATAGE HTML DU TOAST DE REVIEW ---
                let formattedModifiers = '';
                if (critique) {
                    const lines = critique.split('\n').filter(l => l.trim() !== '');
                    const badgesHTML = lines.map(line => {
                        // Cherche un format [BADGE] TEXTE
                        const match = line.match(/^\[(.*?)\]\s*[:]?(.*)$/);
                        if (match) {
                            // Utilisation d'une grille stricte (Grid) avec colonne gauche fixée à 120px
                            return `<div class="grid items-center bg-white/5 rounded-md border border-white/10 w-full h-auto overflow-hidden" style="grid-template-columns: 140px 1fr; gap: 12px;">
                                <div class="bg-white/10 text-white px-2 py-2 text-[9px] font-bold uppercase tracking-wider h-full flex items-center justify-center border-r border-white/10 text-center">${match[1]}</div>
                                <div class="text-[10px] text-gray-300 leading-relaxed whitespace-normal break-words py-2 pr-3 flex items-center">${match[2].trim()}</div>
                            </div>`;
                        } else {
                            // Textes divers non badgés (comme la viralité exprès)
                            if (line.includes('VIRALITÉ') || line.includes('Flow State')) {
                                return `<div class="flex items-center gap-2 bg-[var(--accent)]/10 px-3 py-2 rounded-md border border-[var(--accent)]/30 w-full h-auto">
                                    <span class="text-[10px] text-[var(--accent)] font-bold whitespace-normal break-words leading-relaxed">${line}</span>
                                </div>`;
                            }
                            return `<div class="text-[10px] text-gray-400 italic px-1 whitespace-normal break-words leading-relaxed">${line}</div>`;
                        }
                    }).join('');
                    
                    // Conteneur sur 1 seule colonne
                    formattedModifiers = `<div class="flex flex-col gap-2 mt-3 mb-2 px-4">${badgesHTML}</div>`;
                }

                // Couleurs dynamiques selon le score
                let headerColor = "text-white";
                let borderColor = "border-white/10";
                if (result.score === 3) { headerColor = "text-emerald-400"; borderColor = "border-emerald-500/30"; }
                else if (result.score === 0) { headerColor = "text-rose-400"; borderColor = "border-rose-500/30"; }

                toastMsg = `
                <div class="toast-review-report w-full flex flex-col">
                    <div class="text-sm md:text-base font-bold ${headerColor} mb-1 border-b ${borderColor} pb-3 px-4 pt-4 uppercase tracking-widest">${resultTxt}</div>
                    ${formattedModifiers}
                    <div class="mt-1 pt-3 pb-4 px-4 bg-black/40 border-t ${borderColor} flex flex-wrap gap-x-4 gap-y-2 items-center justify-between">
                        <span class="text-emerald-400 font-bold text-sm tracking-widest">+$${moneyGain}</span>
                        <div class="flex gap-3">
                            ${follGain > 0 ? `<span class="text-blue-400 font-bold text-xs tracking-wider">+${follGain} FANS</span>` : ''}
                            ${repGain !== 0 ? `<span class="text-orange-400 font-bold text-xs tracking-wider">${repGain > 0 ? '+' : ''}${repGain} REP</span>` : ''}
                        </div>
                    </div>
                </div>`;

                try {
                    if ((Number(state.inspi) || 0) <= 0) {
                        const pen = Math.floor(Math.random() * 3) + 1; // 1..3
                        finalTrackScore = Math.max(1, finalTrackScore - pen);
                        showToast(`Syndrome de la page blanche : -${pen} au score final`, 'error');
                    }
                } catch(e) {}

                if (activePerks && activePerks.reviewBonus) {
                    finalTrackScore = Math.min(10, finalTrackScore + activePerks.reviewBonus);
                }

                // Stockage des gains pour application à la fermeture de la review
                const genreObjForList = (typeof DAW_GENRES !== 'undefined') ? DAW_GENRES.find(x => x.id === genre) : null;
                const displayGenreName = genreObjForList ? genreObjForList.name : (genre || 'UK Drill').toUpperCase();
                window.pendingReviewData = {
                    money: moneyGain,
                    rep: repGain,
                    fans: follGain,
                    toast: { msg: toastMsg, type: 'review' },
                    track: { title: trackTitle, genre: displayGenreName, genreId: genre, score: finalTrackScore, voice: voice },
                    breakdown: scoreBreakdown,
                    extraToasts: deferredToasts
                };
                
                // Restore original showToast
                showToast = originalShowToast;

                state.stats.tracks++;
                if (typeof window.updateVinylCrate === 'function') window.updateVinylCrate();
            if (typeof window.syncCareerWallDiscs === 'function') window.syncCareerWallDiscs();
            if (typeof window.syncProStudioGuests3D === 'function') window.syncProStudioGuests3D();
            if (typeof window.updateEmpireTopPills === 'function') window.updateEmpireTopPills();
            if (typeof window.syncMasteringRackUI === 'function') window.syncMasteringRackUI();
                
                state.trackList.push({
                    id: `trk_${Date.now()}_${Math.floor(Math.random()*999)}`,
                    title: trackTitle,
                    genre: displayGenreName,
                    genreId: genre,
                    score: finalTrackScore,
                    money: moneyGain,
                    fans: follGain,
                    date: state.day
                });

                try {
                    state.lastGenres = Array.isArray(state.lastGenres) ? state.lastGenres : [];
                    const newGenre = (genre || '').toString().toLowerCase();
                    state.lastGenres.push(newGenre);
                    while (state.lastGenres.length > 5) state.lastGenres.shift();

                    try {
                        const len = state.lastGenres.length;
                        if (len >= 3) {
                            if (state.lastGenres[len - 1] === state.lastGenres[len - 2] && state.lastGenres[len - 2] === state.lastGenres[len - 3]) {
                                state.inspi = Math.max(0, (Number(state.inspi) || 0) - 35);
                                showToast("Inspi: redondance créative — grosse perte d'inspiration (-35)", 'error');
                            }
                        }
                        if (len >= 5 && state.lastGenres.every(g => g === state.lastGenres[0])) {
                            showToast("Même recette à chaque fois... t'as pas peur de tourner en rond ?", "discreet");
                        }
                    } catch(e) {}
                } catch(e) {}

                state.trackList.sort((a, b) => b.score - a.score);

                if (state.trackList.length > 15) {
                    state.trackList.length = 15;
                }

                updateTopChartsWidget();
                if (typeof window.syncCareerWallDiscs === 'function') window.syncCareerWallDiscs();
                updateDawGenres();

                try { checkChallengeProgress('export', { genre: genre, bpm: bpm, score: finalTrackScore, pluginId: consumedPluginId }); } catch(e) {}

                if (canTriggerMiniGame() && Math.random() < 0.10) { 
                    state.lastMiniGameTime = Date.now();
                    if (typeof startLufsWarMiniGame === 'function') {
                        setTimeout(startLufsWarMiniGame, 1500); 
                    }
                }

                if (consumedProStudio) {
                    state.cooldowns.dawTimeReady = getTotalMins();
                }

                updateHUD();
                
                const onReviewOpen = () => {
                    showTrackReview(finalTrackScore, trackTitle, null);
                    saveGame(); updateHUD(); updateCooldownUIs();
                };

                if (sampleClaimTriggered && state.activeSample) {
                    const sampleToClaim = state.activeSample;
                    triggerLegalClaim(sampleToClaim, moneyGain, onReviewOpen);
                } else {
                    onReviewOpen();
                }
            } catch (err) {
                if (typeof originalShowToast === 'function') showToast = originalShowToast;
                console.error("Error in finishExport:", err);
                showToast("Erreur fatale dans finishExport : " + err.message, "error");
            }
        } // fin finishExport

        } // fin exportTrack

        globalThis.isTapeRecording = true;

    function toggleSecretTape() {
            isTapeRecording = !isTapeRecording;
            const reel1 = document.getElementById('tape-reel-1');
            const reel2 = document.getElementById('tape-reel-2');
            const status = document.getElementById('tape-status');
            
            // Cible les animations de la Signal Chain
            const signalElements = document.querySelectorAll('.signal-line, .signal-node');

            if (isTapeRecording) {
                reel1.classList.remove('tape-paused');
                reel2.classList.remove('tape-paused');
                signalElements.forEach(el => el.classList.remove('tape-paused'));

                if (status) {
                    status.innerText = "REC";
                    status.classList.add('animate-pulse', 'text-[var(--retro-red)]', 'drop-shadow-[0_0_5px_var(--retro-red)]');
                    status.classList.remove('text-gray-500');
                }

                // --- NOUVEAU : RELANCE DU GRAPHE CPU ---
                if (!cpuGraphStarted) {
                    cpuGraphStarted = true;
                    drawSysGraphUI(performance.now());
                }
            } else {
                reel1.classList.add('tape-paused');
                reel2.classList.add('tape-paused');
                signalElements.forEach(el => el.classList.add('tape-paused'));

                if (status) {
                    status.innerText = "PAUSE";
                    status.classList.remove('animate-pulse', 'text-[var(--retro-red)]', 'drop-shadow-[0_0_5px_var(--retro-red)]');
                    status.classList.add('text-gray-500');
                }
            }
        }


    // ==========================================
    // ECHO AI 2.0 — REALISTIC SAAS ENGINE & GAMEPLAY INTEGRATION
    // ==========================================
    const ECHO_PLANS = {
        free:   { id: 'free',   name: 'Forfait Free',          model: 'Echo-3.5 Lite',   cost: 0,    negoBonus: 0,  desc: 'Chat studio, audit de base & dilemmes.' },
        pro:    { id: 'pro',    name: 'Echo-4 Pro',            model: 'Echo-4 Pro',      cost: 600,  negoBonus: 15, desc: 'Radar exact, Auto-Mix DAW, Anti-Scam DM & Négo +15%.' },
        neural: { id: 'neural', name: 'Echo-4.5 Studio Neural', model: 'Echo-4.5 Neural', cost: 1800, negoBonus: 30, desc: 'Tout Pro + Ghost-Prod IA, Boost Algo & Négo +30%.' }
    };

    function _ensureEchoState() {
        if (!state.cooldowns) state.cooldowns = {};
        if (!state.echoBuffs || typeof state.echoBuffs !== 'object') {
            state.echoBuffs = { algoBoostTracks: 0, ghostProdReady: false, autoMixReady: false, trendDay: 0, trendGenreId: null, lastAlgoPushDay: 0 };
        }
        if (typeof state.echoAlignment !== 'number') state.echoAlignment = 0;
        if (typeof state.echoTrust !== 'number') state.echoTrust = 50;
        if (typeof state.echoAiHeat !== 'number') state.echoAiHeat = 0;
        if (!state.echoPlan) state.echoPlan = 'free';
    }

    function getEchoTier() {
        _ensureEchoState();
        const subExpiry = parseInt(state.cooldowns.echoSubExpiry, 10) || 0;
        if (subExpiry > getTotalMins()) {
            return state.echoPlan === 'neural' ? 'neural' : 'pro';
        }
        return 'free';
    }
    window.getEchoTier = getEchoTier;

    function getDailyTrendGenre() {
        _ensureEchoState();
        if (typeof DAW_GENRES === 'undefined' || !DAW_GENRES.length) return null;
        const curDay = Math.max(1, parseInt(state.day, 10) || 1);
        if (state.echoBuffs.trendDay === curDay && state.echoBuffs.trendGenreId) {
            const found = DAW_GENRES.find(g => g.id === state.echoBuffs.trendGenreId);
            if (found) return found;
        }
        const tracks = (state.stats && typeof state.stats.tracks === 'number') ? state.stats.tracks : 0;
        const allGenresUnlocked = typeof isAllDawGenresUnlocked === 'function' && isAllDawGenresUnlocked();
        const unlocked = allGenresUnlocked ? DAW_GENRES : DAW_GENRES.filter(g => tracks >= g.unlockAt);
        const pool = unlocked.length > 0 ? unlocked : DAW_GENRES.slice(0, 2);
        const pick = pool[(curDay * 7 + 3) % pool.length];
        state.echoBuffs.trendDay = curDay;
        state.echoBuffs.trendGenreId = pick.id;
        return pick;
    }
    window.getDailyTrendGenre = getDailyTrendGenre;

    function _echoVoiceLabel(v) {
        return v === 'm' ? 'Male Voc' : (v === 'f' ? 'Fem Voc' : 'Instru');
    }

    function _escapeEchoHtml(str) {
        return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    function syncEchoSidebarUI() {
        _ensureEchoState();
        const tier = getEchoTier();
        const plan = ECHO_PLANS[tier] || ECHO_PLANS.free;
        const totalMins = getTotalMins();
        const subExpiry = parseInt(state.cooldowns.echoSubExpiry, 10) || 0;

        const modelPill = document.getElementById('echo-header-model-pill');
        if (modelPill) {
            modelPill.textContent = plan.model.toUpperCase();
            modelPill.className = tier === 'neural'
                ? 'tech-pill signal'
                : (tier === 'pro' ? 'tech-pill live' : 'tech-pill');
        }

        const planNameEl = document.getElementById('echo-sidebar-plan-name');
        if (planNameEl) planNameEl.textContent = plan.name.toUpperCase();
        const planDescEl = document.getElementById('echo-sidebar-plan-desc');
        if (planDescEl) planDescEl.textContent = plan.desc;

        const timerEl = document.getElementById('echo-sub-timer');
        if (timerEl) {
            if (tier === 'free') {
                timerEl.textContent = 'FREE';
                timerEl.className = 'text-[10px] font-mono text-zinc-500';
            } else {
                const left = Math.max(0, subExpiry - totalMins);
                timerEl.textContent = typeof formatTimeLeft === 'function' ? formatTimeLeft(left) : `${Math.ceil(left / 1440)}J`;
                timerEl.className = tier === 'neural' ? 'text-[10px] font-mono text-sky-400' : 'text-[10px] font-mono text-emerald-400';
            }
        }

        // Statut des modules AbleOS
        const setMod = (id, active, lockedText, activeColor = 'text-sky-400') => {
            const el = document.getElementById(id);
            if (!el) return;
            el.textContent = active ? 'ONLINE' : lockedText;
            el.className = active ? `text-[9.5px] font-mono font-semibold ${activeColor}` : 'text-[9.5px] font-mono text-zinc-600';
        };
        setMod('echo-mod-radar', tier !== 'free', 'BASE', 'text-sky-400');
        setMod('echo-mod-scam', tier !== 'free', 'PRO', 'text-sky-400');
        setMod('echo-mod-daw', tier !== 'free', 'PRO', 'text-sky-400');
        setMod('echo-mod-neural', tier === 'neural', 'NEURAL', 'text-white');

        // Jauge Alignement + Passif actif
        const align = Math.max(-100, Math.min(100, Number(state.echoAlignment) || 0));
        const alignPct = (align + 100) / 2;
        const alignBar = document.getElementById('echo-alignment-bar');
        const alignLbl = document.getElementById('echo-alignment-label');
        const alignPerk = document.getElementById('echo-alignment-perk');
        if (alignBar) alignBar.style.width = `${alignPct}%`;
        if (alignLbl && alignPerk) {
            if (align >= 30) {
                alignLbl.textContent = 'PURISTE';
                alignLbl.className = 'font-mono text-emerald-300';
                alignPerk.textContent = '+25% REP · +15% Banger · -40% Risque IA';
            } else if (align <= -30) {
                alignLbl.textContent = 'ALGORITHME';
                alignLbl.className = 'font-mono text-amber-300';
                alignPerk.textContent = '+25% Fans · +15% Cash · +35% Risque IA';
            } else {
                alignLbl.textContent = 'ÉQUILIBRÉ';
                alignLbl.className = 'font-mono text-slate-200';
                alignPerk.textContent = '+5% Cash · +8% Fans (Zéro malus)';
            }
        }

        // Jauge Suspicion IA (Heat)
        const heat = Math.max(0, Math.min(100, Math.round(Number(state.echoAiHeat) || 0)));
        const heatBar = document.getElementById('echo-heat-bar');
        const heatLbl = document.getElementById('echo-heat-label');
        if (heatBar) {
            heatBar.style.width = `${heat}%`;
            heatBar.className = heat >= 75
                ? 'h-full bg-rose-500 transition-all duration-300'
                : (heat >= 40 ? 'h-full bg-amber-400 transition-all duration-300' : 'h-full bg-emerald-400 transition-all duration-300');
        }
        if (heatLbl) {
            heatLbl.textContent = heat >= 75 ? `${heat}% · DANGER` : (heat >= 40 ? `${heat}% · SURVEILLÉ` : `${heat}% · CLEAN`);
            heatLbl.className = heat >= 75 ? 'font-mono text-rose-400 animate-pulse' : (heat >= 40 ? 'font-mono text-amber-300' : 'font-mono text-emerald-400');
        }

        // Highlight plan actif dans la vue Forfaits
        ['free', 'pro', 'neural'].forEach(pId => {
            const card = document.getElementById(`echo-plan-card-${pId}`);
            if (card) card.classList.toggle('is-current', tier === pId);
        });
        const trialBtn = document.getElementById('btn-echo-trial');
        if (trialBtn) trialBtn.style.display = state.echoTrialUsed ? 'none' : 'block';
    }
    window.syncEchoSidebarUI = syncEchoSidebarUI;

    function toggleEchoPlansView(forceShow = null) {
        const chatView = document.getElementById('echo-active');
        const plansView = document.getElementById('echo-paywall');
        const toggleBtn = document.getElementById('btn-echo-toggle-plans');
        if (!chatView || !plansView) return;

        const currentlyPlans = plansView.style.display === 'flex' && !plansView.classList.contains('hidden');
        const showPlans = forceShow !== null ? Boolean(forceShow) : !currentlyPlans;

        if (showPlans) {
            chatView.classList.add('hidden');
            chatView.style.display = 'none';
            plansView.classList.remove('hidden');
            plansView.style.display = 'flex';
            if (toggleBtn) toggleBtn.textContent = 'Chat';
        } else {
            plansView.classList.add('hidden');
            plansView.style.display = 'none';
            chatView.classList.remove('hidden');
            chatView.style.display = 'flex';
            if (toggleBtn) toggleBtn.textContent = 'Forfaits';
        }
        syncEchoSidebarUI();
    }
    window.toggleEchoPlansView = toggleEchoPlansView;

    // --- INTÉGRATION DAW : COPILOTE TEMPS RÉEL ---
    function updateDawEchoCopilot() {
        _ensureEchoState();
        const statusEl = document.getElementById('daw-echo-status');
        const dotEl = document.getElementById('daw-echo-dot');
        const calBtn = document.getElementById('btn-daw-echo-calibrate');
        const ghostBtn = document.getElementById('btn-daw-echo-ghost');
        if (!statusEl) return;

        const tier = getEchoTier();
        const trend = getDailyTrendGenre();
        const isTrendMatch = trend && typeof currentDawGenre !== 'undefined' && currentDawGenre === trend.id;
        const ghostArmed = Boolean(state.echoBuffs.ghostProdReady);
        const autoMixArmed = Boolean(state.echoBuffs.autoMixReady);

        if (tier === 'free') {
            if (dotEl) dotEl.className = 'w-2 h-2 rounded-full bg-slate-500 shrink-0';
            statusEl.innerHTML = `Mode Lite · <span class="text-slate-300">Passe Pro pour Auto-Calibrer BPM/Voix &amp; voir la Tendance +40%</span>`;
        } else {
            if (dotEl) dotEl.className = ghostArmed
                ? 'w-2 h-2 rounded-full bg-violet-400 shrink-0 shadow-[0_0_8px_rgba(167,139,250,0.85)] animate-pulse'
                : 'w-2 h-2 rounded-full bg-emerald-400 shrink-0 shadow-[0_0_8px_rgba(16,185,129,0.75)]';
            const parts = [];
            if (isTrendMatch) parts.push(`<span class="text-emerald-300 font-semibold">🔥 Genre Tendance (+40% Fans)</span>`);
            else if (trend) parts.push(`Tendance : <strong class="text-slate-200">${trend.name}</strong>`);
            if (autoMixArmed) parts.push(`<span class="text-emerald-300">Auto-Mix Armé</span>`);
            if (ghostArmed) parts.push(`<span class="text-violet-300 font-semibold">Ghost-Prod Armé (-50% Énergie)</span>`);
            statusEl.innerHTML = parts.join(' · ') || 'Session analysée · Prêt.';
        }

        if (calBtn) {
            calBtn.textContent = autoMixArmed ? '✓ Calibré (+15%)' : (tier === 'free' ? 'Auto-Calibrer (Pro)' : 'Auto-Calibrer');
        }
        if (ghostBtn) {
            ghostBtn.textContent = ghostArmed ? '✓ Ghost-Prod Armé' : (tier === 'neural' ? 'Ghost-Prod IA' : 'Ghost-Prod (Neural)');
        }
    }
    window.updateDawEchoCopilot = updateDawEchoCopilot;

    function echoDawAutoCalibrate() {
        _ensureEchoState();
        const tier = getEchoTier();
        if (tier === 'free') {
            showToast("Auto-Calibrage DAW réservé à Echo-4 Pro ou Neural.", "info");
            openApp('app-echo');
            toggleEchoPlansView(true);
            return;
        }
        const g = (typeof DAW_GENRES !== 'undefined') ? DAW_GENRES.find(x => x.id === currentDawGenre) : null;
        if (!g) {
            showToast("Sélectionne d'abord un genre dans AbleStudio.", "warning");
            return;
        }
        const bpmInput = document.getElementById('daw-bpm');
        const bpmVal = document.getElementById('bpm-val');
        if (bpmInput) bpmInput.value = g.targetBpm;
        if (bpmVal) bpmVal.innerText = String(g.targetBpm);
        if (typeof selectDawVoice === 'function') selectDawVoice(g.targetVoice);
        state.echoBuffs.autoMixReady = true;
        saveGame();
        updateDawEchoCopilot();
        syncEchoSidebarUI();
        showToast(`✦ Echo Auto-Mix : ${g.name} calibré (${g.targetBpm} BPM · ${_echoVoiceLabel(g.targetVoice)} · +15% cash).`, "success");
        if (typeof playSuccess === 'function') playSuccess();
    }
    window.echoDawAutoCalibrate = echoDawAutoCalibrate;

    function echoArmGhostProd() {
        _ensureEchoState();
        const tier = getEchoTier();
        if (tier !== 'neural') {
            showToast("Ghost-Production IA nécessite Echo-4.5 Studio Neural.", "info");
            openApp('app-echo');
            toggleEchoPlansView(true);
            return;
        }
        if (state.echoBuffs.ghostProdReady) {
            showToast("Ghost-Prod IA déjà armée pour ton prochain export DAW.", "info");
            return;
        }
        state.echoBuffs.ghostProdReady = true;
        // Applique aussi le réglage optimal sur le DAW si ouvert
        const g = (typeof DAW_GENRES !== 'undefined') ? DAW_GENRES.find(x => x.id === currentDawGenre) : null;
        if (g) {
            const bpmInput = document.getElementById('daw-bpm');
            const bpmVal = document.getElementById('bpm-val');
            if (bpmInput) bpmInput.value = g.targetBpm;
            if (bpmVal) bpmVal.innerText = String(g.targetBpm);
            if (typeof selectDawVoice === 'function') selectDawVoice(g.targetVoice);
        }
        saveGame();
        updateDawEchoCopilot();
        syncEchoSidebarUI();
        const heatWarn = (Number(state.echoAiHeat) || 0) >= 55 ? " ⚠ Attention : Suspicion IA élevée !" : "";
        showToast(`✦ Ghost-Prod IA armée : -50% énergie & Banger garanti au prochain export.${heatWarn}`, "success");
        if (typeof playSuccess === 'function') playSuccess();
    }
    window.echoArmGhostProd = echoArmGhostProd;

    // --- INTÉGRATION SOUNDNET : RADAR & BOOST ALGO ---
    function updateSocialEchoRadar() {
        _ensureEchoState();
        const pillEl = document.getElementById('social-echo-tier-pill');
        const textEl = document.getElementById('social-echo-radar-text');
        const boostBtn = document.getElementById('btn-social-echo-boost');
        if (!textEl) return;

        const tier = getEchoTier();
        const trend = getDailyTrendGenre();
        const boostCount = state.echoBuffs.algoBoostTracks || 0;

        if (pillEl) {
            pillEl.textContent = tier === 'neural' ? 'NEURAL' : (tier === 'pro' ? 'PRO' : 'LITE');
            pillEl.className = tier === 'neural'
                ? 'text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-violet-500/20 border border-violet-400/35 text-violet-200'
                : (tier === 'pro'
                    ? 'text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-emerald-500/20 border border-emerald-400/35 text-emerald-300'
                    : 'text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-slate-400');
        }

        if (tier === 'free') {
            textEl.innerHTML = `Signal tendance détecté sur SoundNet (<span class="text-slate-400">débloque Echo Pro pour révéler le genre +40% &amp; protéger tes DMs</span>).`;
        } else if (trend) {
            const boostTxt = boostCount > 0 ? ` · <span class="text-cyan-300 font-semibold">Boost Algo armé (${boostCount})</span>` : '';
            textEl.innerHTML = `Genre chaud du jour : <strong class="text-emerald-300">${trend.name}</strong> (${trend.targetBpm} BPM · ${_echoVoiceLabel(trend.targetVoice)}) → <strong>+40% Fans / +30% Cash</strong>${boostTxt}`;
        }

        if (boostBtn) {
            if (tier !== 'neural') {
                boostBtn.textContent = 'Boost Algo (Neural)';
            } else if (boostCount > 0) {
                boostBtn.textContent = `✓ Boost Armé (${boostCount})`;
            } else if (state.echoBuffs.lastAlgoPushDay === state.day) {
                boostBtn.textContent = 'Prêt demain';
            } else {
                boostBtn.textContent = 'Armer Boost Algo';
            }
        }
    }
    window.updateSocialEchoRadar = updateSocialEchoRadar;

    function echoActivateAlgoPush() {
        _ensureEchoState();
        const tier = getEchoTier();
        if (tier !== 'neural') {
            showToast("Boost Algorithme SoundNet réservé à Echo-4.5 Neural.", "info");
            openApp('app-echo');
            toggleEchoPlansView(true);
            return;
        }
        if (state.echoBuffs.lastAlgoPushDay === state.day) {
            showToast("Boost Algo déjà utilisé aujourd'hui. Nouveau créneau demain.", "warning");
            return;
        }
        state.echoBuffs.lastAlgoPushDay = state.day;
        state.echoBuffs.algoBoostTracks = (state.echoBuffs.algoBoostTracks || 0) + 1;
        const alignVal = Number(state.echoAlignment) || 0;
        const addHeat = alignVal >= 30 ? 5 : 9;
        state.echoAiHeat = Math.min(100, (Number(state.echoAiHeat) || 0) + addHeat);
        saveGame();
        updateSocialEchoRadar();
        syncEchoSidebarUI();
        showToast(`✦ Echo Algo Push armé : +35% Fans & chances virales x2 sur ton prochain son (+${addHeat}% Suspicion IA).`, "success");
        if (typeof playSuccess === 'function') playSuccess();
    }
    window.echoActivateAlgoPush = echoActivateAlgoPush;

    function echoApplyTrendToDaw() {
        const trend = getDailyTrendGenre();
        if (!trend) return;
        const tier = getEchoTier();
        if (tier === 'free') {
            toggleEchoPlansView(true);
            return;
        }
        openApp('app-daw');
        if (typeof selectDawGenre === 'function') selectDawGenre(trend.id, trend.name);
        const bpmInput = document.getElementById('daw-bpm');
        const bpmVal = document.getElementById('bpm-val');
        if (bpmInput) bpmInput.value = trend.targetBpm;
        if (bpmVal) bpmVal.innerText = String(trend.targetBpm);
        if (typeof selectDawVoice === 'function') selectDawVoice(trend.targetVoice);
        state.echoBuffs.autoMixReady = true;
        saveGame();
        updateDawEchoCopilot();
        showToast(`✦ DAW calibré sur la tendance ${trend.name} (${trend.targetBpm} BPM · ${_echoVoiceLabel(trend.targetVoice)}).`, "success");
    }
    window.echoApplyTrendToDaw = echoApplyTrendToDaw;

    // --- INITIALISATION & ABONNEMENTS SAAS ---
    function initEchoApp() {
        _ensureEchoState();
        toggleEchoPlansView(false);
        syncEchoSidebarUI();

        const history = document.getElementById('echo-dialogue-history');
        const choices = document.getElementById('echo-action-choices');
        if (choices) {
            choices.innerHTML = '';
            choices.classList.add('hidden');
        }
        if (history) {
            history.innerHTML = '';
            const tier = getEchoTier();
            const trend = getDailyTrendGenre();
            const unreadDms = (state.dms || []).filter(d => !d.resolved);
            const scamCount = unreadDms.filter(d => (DM_TEMPLATES.spam || []).some(t => t.id === d.templateId)).length;
            const legitCount = unreadDms.length - scamCount;

            // Intro contextuelle réaliste + carte télémétrie studio
            const greeting = _buildEchoLiveBriefing(tier, trend, unreadDms.length, scamCount);
            const trendPill = tier === 'free'
                ? `<span class="text-slate-400">Verrouillé (Pro)</span>`
                : `<span class="text-emerald-300 font-semibold">${trend ? trend.name : '—'} (+40%)</span>`;
            const heat = Math.round(Number(state.echoAiHeat) || 0);
            const heatTone = heat >= 75 ? 'text-rose-400' : (heat >= 40 ? 'text-amber-300' : 'text-emerald-400');

            const cardHtml = `
                <div class="echo-card p-3 mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-[11px]">
                    <div class="p-2.5 rounded-lg bg-[#06070a] border border-white/8 border-t-2 border-t-sky-400/70">
                        <div class="text-[9px] font-mono uppercase tracking-wider text-zinc-500">01 // TENDANCE</div>
                        <div class="mt-1 font-mono text-xs truncate">${trendPill}</div>
                    </div>
                    <div class="p-2.5 rounded-lg bg-[#06070a] border border-white/8 border-t-2 border-t-emerald-400/70">
                        <div class="text-[9px] font-mono uppercase tracking-wider text-zinc-500">02 // INBOX DM</div>
                        <div class="mt-1 font-mono text-xs text-zinc-100">${unreadDms.length === 0 ? 'Boîte calme' : (tier !== 'free' ? `${legitCount} deal · <span class="text-rose-400">${scamCount} scam</span>` : `${unreadDms.length} non lu(s)`)}</div>
                    </div>
                    <div class="p-2.5 rounded-lg bg-[#06070a] border border-white/8 border-t-2 ${heat >= 70 ? 'border-t-rose-500/80' : 'border-t-zinc-500/60'}">
                        <div class="text-[9px] font-mono uppercase tracking-wider text-zinc-500">03 // HEAT IA</div>
                        <div class="mt-1 font-mono text-xs font-bold ${heatTone}">${heat}%</div>
                    </div>
                    <div class="p-2.5 rounded-lg bg-[#06070a] border border-white/8 border-t-2 border-t-white/40">
                        <div class="text-[9px] font-mono uppercase tracking-wider text-zinc-500">04 // NÉGO DEAL</div>
                        <div class="mt-1 font-mono text-xs font-bold text-sky-300">${tier === 'neural' ? '+30% CASH' : (tier === 'pro' ? '+15% CASH' : '0% LITE')}</div>
                    </div>
                </div>`;
            appendEchoDialogue(greeting, 'echo', false, null, 0, cardHtml, true);
        }
    }

    function _buildEchoLiveBriefing(tier, trend, unreadCount, scamCount) {
        if ((state.energy || 100) <= 25) {
            return `Énergie critique (${Math.round(state.energy)}%). Je te déconseille de mixer sans repos — ou arme Ghost-Prod IA pour diviser le coût énergétique par 2.`;
        }
        if ((state.stats?.consecutiveFlops || 0) >= 2) {
            return `J'ai détecté ${state.stats.consecutiveFlops} flops récents. Utilise le Radar Tendances ou l'Auto-Calibrage DAW pour recaler ton BPM et ta voix avant le prochain export.`;
        }
        if (tier !== 'free' && scamCount > 0) {
            return `Bouclier Anti-Scam actif : j'ai repéré ${scamCount} arnaque${scamCount > 1 ? 's' : ''} dans tes DMs SoundNet. ${trend ? `Côté sorties, le genre chaud aujourd'hui est ${trend.name} (+40% fans).` : ''}`;
        }
        if (state.echoAlignment >= 30) {
            return `Mode Puriste actif (+25% REP sur tes Bangers, -40% suspicion IA). Prêt à calibrer ta prochaine session ou auditer tes contrats.`;
        }
        if (state.echoAlignment <= -30) {
            return `Mode Algorithme actif (+25% streams, +15% cash). On optimise la portée aujourd'hui — garde juste un œil sur ta jauge de suspicion IA.`;
        }
        return `Contexte Studio synchronisé (Jour ${state.day} · $${formatNum(state.money || 0)} · ${formatNum(state.followers || 0)} fans). Que veux-tu optimiser maintenant ?`;
    }

    function purchaseEchoSub(planId = 'pro') {
        _ensureEchoState();
        const target = (planId === 'neural') ? ECHO_PLANS.neural : ECHO_PLANS.pro;
        if ((Number(state.money) || 0) < target.cost) {
            showToast(`Fonds insuffisants ($${target.cost} requis pour ${target.name}).`, "error");
            if (typeof playError === 'function') playError();
            return;
        }
        logMoney(-target.cost, `Abo ${target.name}`);
        const totalMins = getTotalMins();
        const currentExpiry = parseInt(state.cooldowns.echoSubExpiry, 10) || 0;
        const baseTime = (state.echoPlan === target.id && currentExpiry > totalMins) ? currentExpiry : totalMins;
        state.cooldowns.echoSubExpiry = baseTime + ECHO_DATA.subDurationMins;
        state.echoPlan = target.id;

        showToast(`✦ ${target.name} activé pour 7 jours in-game !`, "success");
        if (typeof playSuccess === 'function') playSuccess();
        if (typeof checkAchievement === 'function') checkAchievement('echo_scammed', () => true);

        saveGame();
        updateHUD();
        syncEchoSidebarUI();
        updateDawEchoCopilot();
        updateSocialEchoRadar();
        if (typeof renderDMs === 'function') renderDMs();
        toggleEchoPlansView(false);
        appendEchoDialogue(`Forfait ${target.name} activé. Tous tes modules AbleOS (${target.id === 'neural' ? 'Radar, Auto-Mix DAW, Anti-Scam DM, Ghost-Prod IA & Boost Algo' : 'Radar SoundNet, Auto-Mix DAW & Anti-Scam DM'}) sont maintenant en ligne.`, 'echo', false, null, 0, '', true);
    }

    function startEchoTrial() {
        _ensureEchoState();
        if (state.echoTrialUsed) return;
        state.echoTrialUsed = true;
        state.echoPlan = 'pro';
        state.cooldowns.echoSubExpiry = getTotalMins() + ECHO_DATA.trialDurationMins;
        showToast("✦ Essai gratuit Echo-4 Pro activé (2 jours in-game) !", "success");
        if (typeof playSuccess === 'function') playSuccess();
        saveGame();
        syncEchoSidebarUI();
        updateDawEchoCopilot();
        updateSocialEchoRadar();
        if (typeof renderDMs === 'function') renderDMs();
        toggleEchoPlansView(false);
        appendEchoDialogue("Essai Echo-4 Pro activé pour 2 jours. Le Radar SoundNet exact, l'Auto-Calibrage DAW et le Bouclier Anti-Scam DM sont actifs.", 'echo', false, null, 0, '', true);
    }

    function _getEchoRandom(arr) {
        if (!arr || !arr.length) return "";
        return arr[Math.floor(Math.random() * arr.length)];
    }

    // --- ACTIONS RAPIDES 1-CLIC & CARTES INTERACTIVES ---
    function runEchoQuickAction(actionType) {
        _ensureEchoState();
        const choicesEl = document.getElementById('echo-action-choices');
        if (choicesEl) { choicesEl.innerHTML = ''; choicesEl.classList.add('hidden'); }
        const tier = getEchoTier();

        if (actionType === 'radar') {
            appendEchoDialogue("Analyse la tendance SoundNet du jour.", 'user');
            const trend = getDailyTrendGenre();
            showEchoTypingIndicator();
            setTimeout(() => {
                removeEchoTypingIndicator();
                if (tier === 'free') {
                    const card = `
                        <div class="echo-card p-3 mt-2.5 flex items-center justify-between gap-3">
                            <div>
                                <div class="text-xs font-mono font-semibold text-white uppercase">Radar SoundNet Exact · Pro</div>
                                <div class="text-[11px] text-zinc-400 mt-0.5">Révèle le genre +40% Fans / +30% Cash du jour et calibre AbleStudio en 1 clic.</div>
                            </div>
                            <button type="button" onclick="toggleEchoPlansView(true)" class="tech-btn-primary px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider shrink-0">Débloquer</button>
                        </div>`;
                    appendEchoDialogue(`Je détecte un pic d'écoute sur un genre ${trend && trend.targetBpm >= 130 ? 'rapide (130+ BPM)' : 'mid-tempo (< 130 BPM)'} aujourd'hui. Passe sur Echo-4 Pro pour révéler le genre exact et le calibrer automatiquement.`, 'echo', false, null, 0, card);
                } else if (trend) {
                    const card = `
                        <div class="echo-card p-3 mt-2.5 flex flex-wrap items-center justify-between gap-3 border-sky-400/35">
                            <div>
                                <div class="text-[9.5px] font-mono uppercase tracking-[0.18em] text-sky-400">SIGNAL // JOUR ${state.day}</div>
                                <div class="text-sm font-semibold font-mono text-white mt-0.5">${trend.name} · ${trend.targetBpm} BPM · ${_echoVoiceLabel(trend.targetVoice)}</div>
                                <div class="text-[11px] font-mono text-zinc-400 mt-0.5">Export bonus : <span class="text-emerald-400">+40% FANS</span> · <span class="text-emerald-400">+30% CASH</span></div>
                            </div>
                            <button type="button" onclick="echoApplyTrendToDaw()" class="tech-btn-primary px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider shrink-0">Appliquer au DAW →</button>
                        </div>`;
                    appendEchoDialogue(`Radar SoundNet calibré : les auditeurs sur-indexent sur le genre ${trend.name} aujourd'hui. Si tu exports dans ce créneau avec le bon tempo (${trend.targetBpm} BPM), tes streams décollent.`, 'echo', false, null, 0, card);
                }
            }, 380);
            return;
        }

        if (actionType === 'algo') {
            appendEchoDialogue("Prépare un Boost Algorithme pour ma prochaine sortie.", 'user');
            showEchoTypingIndicator();
            setTimeout(() => {
                removeEchoTypingIndicator();
                if (tier !== 'neural') {
                    const card = `
                        <div class="echo-card p-3 mt-2.5 flex items-center justify-between gap-3">
                            <div>
                                <div class="text-xs font-mono font-semibold text-white uppercase">Boost Algorithme · Neural</div>
                                <div class="text-[11px] text-zinc-400 mt-0.5">+35% Fans et chances de viralité x2 sur ta prochaine sortie.</div>
                            </div>
                            <button type="button" onclick="toggleEchoPlansView(true)" class="tech-btn-signal px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider shrink-0">Voir Neural</button>
                        </div>`;
                    appendEchoDialogue("Le module Boost Algorithme nécessite Echo-4.5 Studio Neural pour pousser ta prochaine sortie dans les playlists recommandées SoundNet.", 'echo', false, null, 0, card);
                } else {
                    const alreadyToday = state.echoBuffs.lastAlgoPushDay === state.day;
                    const card = `
                        <div class="echo-card p-3 mt-2.5 flex flex-wrap items-center justify-between gap-3 border-sky-400/35">
                            <div>
                                <div class="text-xs font-mono font-semibold text-white uppercase">Push Algorithme · +35% Fans · Viral x2</div>
                                <div class="text-[11px] font-mono text-zinc-400 mt-0.5">Charges : ${state.echoBuffs.algoBoostTracks || 0} · Coût : +${state.echoAlignment >= 30 ? 5 : 9}% Suspicion IA</div>
                            </div>
                            <button type="button" onclick="echoActivateAlgoPush()" ${alreadyToday ? 'disabled' : ''} class="${alreadyToday ? 'tech-btn-ghost opacity-50 cursor-not-allowed' : 'tech-btn-primary'} px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider shrink-0">${alreadyToday ? 'Utilisé aujourd\'hui' : 'Armer Boost Algo'}</button>
                        </div>`;
                    appendEchoDialogue(alreadyToday ? "Tu as déjà poussé l'algorithme aujourd'hui. Un nouveau créneau sera disponible demain matin." : "L'algorithme SoundNet est ouvert à une injection de portée. Arme le Boost avant d'exporter ton morceau dans le DAW.", 'echo', false, null, 0, card);
                }
            }, 380);
            return;
        }

        if (actionType === 'ghost') {
            appendEchoDialogue("Prépare une Ghost-Production IA pour économiser mon énergie.", 'user');
            showEchoTypingIndicator();
            setTimeout(() => {
                removeEchoTypingIndicator();
                const heat = Math.round(Number(state.echoAiHeat) || 0);
                if (tier !== 'neural') {
                    const card = `
                        <div class="echo-card p-3 mt-2.5 flex items-center justify-between gap-3">
                            <div>
                                <div class="text-xs font-mono font-semibold text-white uppercase">Ghost-Production IA · Neural</div>
                                <div class="text-[11px] text-zinc-400 mt-0.5">-50% énergie à l'export, Banger garanti &amp; +20% gains (avec risque Suspicion IA).</div>
                            </div>
                            <button type="button" onclick="toggleEchoPlansView(true)" class="tech-btn-signal px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider shrink-0">Passer Neural</button>
                        </div>`;
                    appendEchoDialogue("La Ghost-Production IA est réservée au modèle Echo-4.5 Studio Neural. Elle génère la structure et le mix de base tout en exposant ta carrière au risque de scandale IA si tu en abuses.", 'echo', false, null, 0, card);
                } else {
                    const armed = Boolean(state.echoBuffs.ghostProdReady);
                    const card = `
                        <div class="echo-card p-3 mt-2.5 flex flex-wrap items-center justify-between gap-3 border-white/15">
                            <div>
                                <div class="text-xs font-mono font-semibold text-white uppercase">Ghost-Prod IA · Suspicion : <span class="${heat >= 70 ? 'text-rose-400' : 'text-sky-300'}">${heat}%</span></div>
                                <div class="text-[11px] text-zinc-400 mt-0.5">-50% énergie · Score Banger garanti · +20% gains · Produis organiquement pour refroidir.</div>
                            </div>
                            <button type="button" onclick="echoArmGhostProd()" class="${armed ? 'tech-btn-signal' : 'tech-btn-primary'} px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider shrink-0">${armed ? '✓ Armé' : 'Armer Ghost-Prod'}</button>
                        </div>`;
                    appendEchoDialogue(heat >= 65
                        ? "Attention : ta jauge de Suspicion IA est haute. Si tu lances une Ghost-Prod maintenant, un thread SoundNet risque de t'exposer (-25 REP & perte de fans)."
                        : "Je peux pré-produire ta prochaine session : coût énergétique divisé par deux et mix verrouillé en Banger. Utilise-le stratégiquement.", 'echo', false, null, 0, card);
                }
            }, 380);
            return;
        }

        if (actionType === 'audit') {
            appendEchoDialogue("Fais un audit complet de ma carrière, mes DMs et mes contrats.", 'user');
            showEchoTypingIndicator();
            setTimeout(() => {
                removeEchoTypingIndicator();
                const unread = (state.dms || []).filter(d => !d.resolved);
                const scams = unread.filter(d => (DM_TEMPLATES.spam || []).some(t => t.id === d.templateId)).length;
                const legit = unread.length - scams;
                const availDeals = Object.values(state.dealPool || {}).filter(d => d && d.status === 'available').length;
                const negoPct = tier === 'neural' ? 30 : (tier === 'pro' ? 15 : 0);
                const card = `
                    <div class="echo-card p-3 mt-2.5 space-y-2 text-[11.5px]">
                        <div class="flex justify-between"><span class="text-slate-400">DMs en attente</span><span class="text-white font-mono">${unread.length} ${tier !== 'free' ? `(${legit} sûr · ${scams} arnaque)` : '(Upgrade Pro pour filtrer les scams)'}</span></div>
                        <div class="flex justify-between"><span class="text-slate-400">Offres Brand Deals</span><span class="text-white font-mono">${availDeals} dispo · Bonus Echo +${negoPct}%</span></div>
                        <div class="flex justify-between"><span class="text-slate-400">Ratio Bangers / Tracks</span><span class="text-emerald-300 font-mono">${state.stats?.bangers || 0} / ${state.stats?.tracks || 0}</span></div>
                        <div class="pt-1.5 flex gap-2">
                            <button type="button" onclick="openApp('app-social'); switchSocialTab('dms');" class="flex-1 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] text-slate-200 cursor-pointer">Ouvrir DMs</button>
                            <button type="button" onclick="openApp('app-social'); switchSocialTab('feed');" class="flex-1 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] text-slate-200 cursor-pointer">Voir Brand Deals</button>
                        </div>
                    </div>`;
                const advice = scams > 0 && tier !== 'free'
                    ? `Audit terminé : ${scams} arnaque(s) bloquée(s) visuellement dans tes DMs. Ignore-les et concentre-toi sur tes ${availDeals} offres sponsors (+${negoPct}% avec Echo).`
                    : `Audit studio : ${state.stats?.tracks || 0} titres sortis, $${formatNum(state.money || 0)} en trésorerie et ${formatNum(state.followers || 0)} fans. ${availDeals > 0 ? `${availDeals} contrats sponsors attendent sur SoundNet.` : 'Continue à sortir des Bangers pour débloquer de nouveaux sponsors.'}`;
                appendEchoDialogue(advice, 'echo', false, null, 0, card);
            }, 420);
            return;
        }

        if (actionType === 'dilemma') {
            appendEchoDialogue("Soumets-moi un dilemme stratégique de carrière.", 'user');
            const validOrientations = ECHO_DATA.orientations.filter(o => {
                if (!state.echoHistory) return true;
                return !state.echoHistory.find(e => e.dilemmaId === o.id && (state.day - e.day) <= 8);
            });
            const orientation = _getEchoRandom(validOrientations.length > 0 ? validOrientations : ECHO_DATA.orientations);
            showEchoTypingIndicator();
            setTimeout(() => {
                removeEchoTypingIndicator();
                appendEchoDialogue(orientation.question, 'echo', false, () => {
                    renderPlayerChoiceButtons(orientation.choices, orientation.id);
                });
            }, 480);
            return;
        }

        if (actionType === 'tech') {
            const factual = _getEchoRandom(ECHO_DATA.factual);
            if (factual) processEchoFactualAnswer(factual);
        }
    }
    window.runEchoQuickAction = runEchoQuickAction;

    // --- BARRE DE PROMPT NATURELLE ---
    function submitEchoPrompt(event) {
        if (event) event.preventDefault();
        const input = document.getElementById('echo-prompt-input');
        if (!input) return;
        const raw = input.value.trim();
        if (!raw) return;
        input.value = '';

        const q = raw.toLowerCase();
        if (/(tendance|trend|genre|hot|chaud|quoi sortir)/.test(q)) {
            runEchoQuickAction('radar');
            return;
        }
        if (/(algo|viral|stream|boost|portée)/.test(q)) {
            runEchoQuickAction('algo');
            return;
        }
        if (/(ghost|génère|genere|beat|prod ia|auto prod|triche)/.test(q)) {
            runEchoQuickAction('ghost');
            return;
        }
        if (/(dm|mail|message|scam|arnaque|deal|sponsor|contrat|audit|cash|argent)/.test(q)) {
            runEchoQuickAction('audit');
            return;
        }
        if (/(dilemme|alignement|puriste|sellout|stratégie|strategie)/.test(q)) {
            runEchoQuickAction('dilemma');
            return;
        }
        if (/(forfait|prix|abo|upgrade|pro|neural|tarif)/.test(q)) {
            appendEchoDialogue(raw, 'user');
            toggleEchoPlansView(true);
            return;
        }
        if (/(calibr|auto-mix|automix|daw)/.test(q)) {
            appendEchoDialogue(raw, 'user');
            const card = `<div class="echo-card p-3 mt-2 flex items-center justify-between gap-2"><span class="text-xs text-slate-200">Calibrage automatique BPM &amp; Voix sur AbleStudio</span><button type="button" onclick="echoDawAutoCalibrate()" class="px-3 py-1.5 rounded-lg bg-emerald-500 text-black font-semibold text-[11px] cursor-pointer">Calibrer</button></div>`;
            appendEchoDialogue("Je peux caler automatiquement ton BPM et ta piste vocale sur le standard optimal du genre sélectionné dans AbleStudio (+15% cash).", 'echo', false, null, 0, card);
            return;
        }

        // Recherche intelligente dans la base technique ECHO_DATA.factual
        appendEchoDialogue(raw, 'user');
        showEchoTypingIndicator();
        setTimeout(() => {
            removeEchoTypingIndicator();
            const match = (ECHO_DATA.factual || []).find(f => {
                const hay = (f.id + ' ' + f.question + ' ' + f.trueAnswer).toLowerCase();
                return q.split(/\s+/).some(w => w.length >= 3 && hay.includes(w));
            });
            if (match) {
                appendEchoDialogue(match.trueAnswer, 'echo', false);
            } else if (/(fatigue|énergie|energie|dormir|sommeil|inspi)/.test(q)) {
                appendEchoDialogue(`Tu es à ${Math.round(state.energy || 0)}% d'énergie et ${Math.round(state.inspi || 0)}% d'inspiration. Passe par le lit pour récupérer ton énergie ou chill sur le canapé pour remonter l'inspi avant d'exporter.`, 'echo', false);
            } else {
                const trend = getDailyTrendGenre();
                const tier = getEchoTier();
                appendEchoDialogue(`Bien reçu. En ce moment (Jour ${state.day}, $${formatNum(state.money || 0)}), ${tier !== 'free' && trend ? `la meilleure opportunité est une sortie ${trend.name} (${trend.targetBpm} BPM) pour +40% fans` : "je te recommande de lancer un Audit Carrière ou de débloquer Echo-4 Pro pour connecter mon Radar au DAW"}. Utilise les raccourcis ci-dessous pour exécuter une action directe.`, 'echo', false);
            }
        }, 420);
    }
    window.submitEchoPrompt = submitEchoPrompt;

    // --- DILEMMES D'ALIGNEMENT (AVEC CONSÉQUENCES RÉELLES) ---
    function renderPlayerChoiceButtons(choices, dilemmaId = null) {
        const container = document.getElementById('echo-action-choices');
        if (!container) return;
        container.innerHTML = '';
        container.classList.remove('hidden');

        choices.forEach((choice, index) => {
            const btn = document.createElement('button');
            btn.type = 'button';
            const shiftVal = typeof choice.shift === 'number' ? choice.shift : 0;
            const shiftTag = shiftVal > 0
                ? `<span class="text-[9.5px] font-mono text-emerald-300 shrink-0">+${shiftVal} Puriste</span>`
                : (shiftVal < 0 ? `<span class="text-[9.5px] font-mono text-amber-300 shrink-0">${shiftVal} Algo</span>` : '');
            btn.className = 'echo-btn-pop w-full py-2.5 px-3.5 rounded-xl bg-[#141822] hover:bg-[#1c2230] border border-white/10 hover:border-emerald-400/40 text-left text-xs text-slate-100 flex items-center justify-between gap-3 transition-all cursor-pointer';
            btn.style.animationDelay = `${index * 60}ms`;
            btn.innerHTML = `<span>${_escapeEchoHtml(choice.label)}</span>${shiftTag}`;

            btn.onclick = () => {
                appendEchoDialogue(choice.label, 'user');
                if (typeof choice.shift === 'number') {
                    state.echoAlignment = Math.max(-100, Math.min(100, (Number(state.echoAlignment) || 0) + choice.shift));
                }
                if (choice.echoRecommends) {
                    state.echoTrust = Math.min(100, (Number(state.echoTrust) || 50) + 5);
                } else if (choices.some(c => c.echoRecommends)) {
                    state.echoTrust = Math.max(0, (Number(state.echoTrust) || 50) - 5);
                }
                if (!state.echoHistory) state.echoHistory = [];
                state.echoHistory.push({ day: state.day, category: dilemmaId || 'general', dilemmaId, choiceLabel: choice.label });
                if (state.echoHistory.length > 50) state.echoHistory.shift();

                saveGame();
                syncEchoSidebarUI();
                checkEchoAchievements();

                container.innerHTML = '';
                container.classList.add('hidden');
                showEchoTypingIndicator();

                setTimeout(() => {
                    removeEchoTypingIndicator();
                    if (choice.nextChoices && choice.nextChoices.length > 0) {
                        appendEchoDialogue(choice.response, 'echo', false, () => {
                            renderPlayerChoiceButtons(choice.nextChoices, dilemmaId);
                        });
                    } else {
                        appendEchoDialogue(choice.response, 'echo', false);
                    }
                }, 460);
            };
            container.appendChild(btn);
        });
    }

    function processEchoFactualAnswer(factualData) {
        const container = document.getElementById('echo-action-choices');
        if (container) { container.innerHTML = ''; container.classList.add('hidden'); }
        appendEchoDialogue(factualData.question, 'user');
        showEchoTypingIndicator();

        // Sur Echo Lite, 12% de risque d'hallucination IA ; sur Pro/Neural, 0% d'erreur !
        const tier = getEchoTier();
        const isLying = (tier === 'free') && Math.random() < 0.12;
        const answer = isLying ? factualData.falseAnswer : factualData.trueAnswer;
        saveGame();

        setTimeout(() => {
            removeEchoTypingIndicator();
            appendEchoDialogue(answer, 'echo', isLying);
        }, 460);
    }

    // --- UI STREAMING PRECISION TECH ---
    function showEchoTypingIndicator() {
        const history = document.getElementById('echo-dialogue-history');
        if (!history) return null;
        removeEchoTypingIndicator();
        const wave = document.getElementById('echo-neural-wave');
        if (wave) wave.classList.add('is-streaming');
        const indicator = document.createElement('div');
        indicator.id = 'echo-typing-indicator';
        indicator.className = 'flex items-start gap-3 echo-msg-bubble';
        indicator.innerHTML = `
            <div class="w-6 h-6 rounded-md bg-white/5 border border-white/15 flex items-center justify-center shrink-0 mt-0.5">
                <svg class="w-3.5 h-3.5 text-sky-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M4 12h3l2.5-6 4 12 2.5-6H20"/></svg>
            </div>
            <div class="pt-1.5 flex items-center gap-1.5">
                <span class="w-1.5 h-1.5 bg-sky-400 rounded-full animate-bounce" style="animation-delay:0ms"></span>
                <span class="w-1.5 h-1.5 bg-sky-400 rounded-full animate-bounce" style="animation-delay:140ms"></span>
                <span class="w-1.5 h-1.5 bg-sky-400 rounded-full animate-bounce" style="animation-delay:280ms"></span>
            </div>`;
        history.appendChild(indicator);
        history.scrollTop = history.scrollHeight;
        return indicator;
    }

    function removeEchoTypingIndicator() {
        const indicator = document.getElementById('echo-typing-indicator');
        if (indicator) indicator.remove();
    }

    function appendEchoDialogue(text, sender, isLying = false, callback = null, toneIntensity = 0, extraCardHtml = '', instant = false) {
        const history = document.getElementById('echo-dialogue-history');
        if (!history) return;

        if (window.echoTypingTimeout) {
            clearTimeout(window.echoTypingTimeout);
            window.echoTypingTimeout = null;
        }

        const msgDiv = document.createElement('div');
        msgDiv.className = 'echo-msg-bubble';

        if (sender === 'echo') {
            const tier = getEchoTier();
            const modelName = (ECHO_PLANS[tier] || ECHO_PLANS.free).model.toUpperCase();
            const badgeTone = tier === 'neural' ? 'text-sky-400' : (tier === 'pro' ? 'text-emerald-400' : 'text-zinc-500');
            msgDiv.innerHTML = `
                <div class="flex items-start gap-3">
                    <div class="w-6 h-6 rounded-md bg-white/5 border ${tier === 'neural' ? 'border-sky-400/40' : 'border-white/15'} flex items-center justify-center shrink-0 mt-0.5">
                        <svg class="w-3.5 h-3.5 ${tier === 'neural' ? 'text-sky-400' : 'text-zinc-200'}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M4 12h3l2.5-6 4 12 2.5-6H20"/></svg>
                    </div>
                    <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-2 mb-1">
                            <span class="text-[11px] font-mono font-semibold uppercase tracking-wider text-white">ECHO</span>
                            <span class="text-[9.5px] font-mono ${badgeTone}">// ${modelName}</span>
                            ${isLying ? '<span class="tech-pill">NON VÉRIFIÉ</span>' : ''}
                        </div>
                        <div class="text-[13px] leading-relaxed text-zinc-200 ${isLying ? 'echo-glitch' : ''}"><span class="typing-target"></span></div>
                        <div class="echo-extra-slot"></div>
                    </div>
                </div>`;
            history.appendChild(msgDiv);
            history.scrollTop = history.scrollHeight;

            const target = msgDiv.querySelector('.typing-target');
            const extraSlot = msgDiv.querySelector('.echo-extra-slot');

            if (instant) {
                target.textContent = text;
                if (extraCardHtml && extraSlot) extraSlot.innerHTML = extraCardHtml;
                history.scrollTop = history.scrollHeight;
                if (callback) setTimeout(callback, 120);
                return;
            }

            // Streaming rapide mot-à-mot (réaliste façon ChatGPT/Claude) + onde neurale réactive
            const wave = document.getElementById('echo-neural-wave');
            if (wave) wave.classList.add('is-streaming');
            const words = String(text || '').split(/(\s+)/);
            let wIdx = 0;
            function streamWord() {
                if (wIdx < words.length) {
                    target.textContent += words[wIdx];
                    wIdx++;
                    history.scrollTop = history.scrollHeight;
                    window.echoTypingTimeout = setTimeout(streamWord, 18 + Math.random() * 16);
                } else {
                    window.echoTypingTimeout = null;
                    if (wave) wave.classList.remove('is-streaming');
                    if (extraCardHtml && extraSlot) extraSlot.innerHTML = extraCardHtml;
                    history.scrollTop = history.scrollHeight;
                    if (callback) setTimeout(callback, 140);
                }
            }
            streamWord();
        } else {
            msgDiv.innerHTML = `
                <div class="flex justify-end">
                    <div class="px-3.5 py-2.5 rounded-2xl rounded-br-sm bg-[#1c212e] border border-white/10 text-[13px] text-white max-w-[82%] leading-relaxed">
                        ${_escapeEchoHtml(text)}
                    </div>
                </div>`;
            history.appendChild(msgDiv);
            history.scrollTop = history.scrollHeight;
            if (callback) setTimeout(callback, 140);
        }
    }

    function renderEchoMainChoices() { syncEchoSidebarUI(); }
    function renderEchoBackButton() { syncEchoSidebarUI(); }

    function checkEchoAchievements() {
        if (typeof checkAchievement !== 'function') return;
        checkAchievement('echo_sellout', () => state.echoAlignment <= -100);
        checkAchievement('echo_purist', () => state.echoAlignment >= 100);
    }
        
    // ====================================================
        
// --- Global Bridge & ES Exports ---
Object.assign(globalThis, { ECHO_DATA, initPianoRollUI, getGridCoords, renderPrNotes, deleteNotes, initPianoRollEvents, GENRE_MASTERING_PROFILES, initInteractiveStudio, initClouds, triggerLightningEffect, generateRandomTimelineClips, DAW_GENRES, isAllDawGenresUnlocked, updateDawGenres, selectDawGenre, selectDawVoice, updateDawPlugins, togglePad, calculateSuccess, triggerDawFlash, exportTrack, toggleSecretTape, ECHO_PLANS, _ensureEchoState, getEchoTier, getDailyTrendGenre, _echoVoiceLabel, _escapeEchoHtml, syncEchoSidebarUI, toggleEchoPlansView, updateDawEchoCopilot, echoDawAutoCalibrate, echoArmGhostProd, updateSocialEchoRadar, echoActivateAlgoPush, echoApplyTrendToDaw, initEchoApp, _buildEchoLiveBriefing, purchaseEchoSub, startEchoTrial, _getEchoRandom, runEchoQuickAction, submitEchoPrompt, renderPlayerChoiceButtons, processEchoFactualAnswer, showEchoTypingIndicator, removeEchoTypingIndicator, appendEchoDialogue, renderEchoMainChoices, renderEchoBackButton, checkEchoAchievements });
export { ECHO_DATA, initPianoRollUI, getGridCoords, renderPrNotes, deleteNotes, initPianoRollEvents, GENRE_MASTERING_PROFILES, initInteractiveStudio, initClouds, triggerLightningEffect, generateRandomTimelineClips, DAW_GENRES, isAllDawGenresUnlocked, updateDawGenres, selectDawGenre, selectDawVoice, updateDawPlugins, togglePad, calculateSuccess, triggerDawFlash, exportTrack, toggleSecretTape, ECHO_PLANS, _ensureEchoState, getEchoTier, getDailyTrendGenre, _echoVoiceLabel, _escapeEchoHtml, syncEchoSidebarUI, toggleEchoPlansView, updateDawEchoCopilot, echoDawAutoCalibrate, echoArmGhostProd, updateSocialEchoRadar, echoActivateAlgoPush, echoApplyTrendToDaw, initEchoApp, _buildEchoLiveBriefing, purchaseEchoSub, startEchoTrial, _getEchoRandom, runEchoQuickAction, submitEchoPrompt, renderPlayerChoiceButtons, processEchoFactualAnswer, showEchoTypingIndicator, removeEchoTypingIndicator, appendEchoDialogue, renderEchoMainChoices, renderEchoBackButton, checkEchoAchievements };
