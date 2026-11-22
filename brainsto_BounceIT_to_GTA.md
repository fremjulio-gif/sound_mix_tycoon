# Master Blueprint — *Bounce It → Bounce It : City* (« GTA 6 du Beatmaker »)

> **Principe directeur : Refactorisation propre + Évolution par enveloppe, zéro régression.**
> Tout le cœur de jeu déjà construit dans `index.html` (DAW AbleStudio, Chambre Niv.1→3, Studio Pro 42e, Avatars PBR évolutifs, Empire OS, Affinité Rappeurs, Rival narratif, Bounce Live CCTV Fisheye, Cérémonies, Prestige) est **conservé à 100 %**. On découpe d'abord la base proprement en modules ES natifs (zéro bundler, 100 % compatible GitHub Pages), puis on déploie la **Grande Ville ouverte** par paliers jouables Desktop + Mobile.

---

## 1. Décisions Verrouillées (Cahier des Charges Final)

| Axe | Décision Actée |
| :--- | :--- |
| **Architecture** | **Découpage complet en modules ES natifs dès le Palier 0** (`css/`, `js/core/`, `js/studio/`, `js/daw/`, `js/empire/`, `js/city/`), zéro outil de build requis. |
| **Identité Visuelle Ville** | **Mix fictif Grand Paris × Mégalopole US** : banlieue & immeubles béton, boulevards larges néon/pluie, quartiers disquaires, skyline & Tour 42e. |
| **Locomotion Évolutive** | Liée au niveau / palier joueur : **À pied → Trottinette électrique (Niv.1) → Vélo / BMX (Niv.2) → Voiture Berline / Supercar (Niv.3–4)**. |
| **Caméra Hybride** | **Quasi-POV (1re personne)** dans tous les lieux restreints (Chambre, Studio Pro, Disquaire, Backstage) · **3e personne dynamique** dans la rue & véhicules. |
| **Rythme & Déplacements** | **Exploration & conduite libres + Fast Travel optionnel** via le *BouncePhone* (GPS) · Écoulement **temps réel doux** en ville (cycle jour/nuit + météo live). |
| **Ton & Satire** | **Mi-Industrie réaliste / Mi-Satirique façon GTA** (contrats, SACEM, algos, faux gourous, bots de streams, paparazzis, guerre de label). |
| **Mécaniques GTA Prioritaires** | 1. **Autoradio / Écouteurs** jouant tes vraies prods du Vault + réactions des PNJ.<br>2. **HEAT Industrie** (avocats samples non-clairés, paparazzis, sbires du Pire Ennemi, panneaux 4×3 dynamiques).<br>3. **HEAT & Missions Street Satiriques** (affichage sauvage, livraisons clés USB chrono, vendeurs de faux streams). |
| **Stratégie & Plateformes** | **4 Paliers jouables incrémentaux (0 → 3)**, **Desktop (ZQSD/Souris) + Mobile Tactile (Joystick virtuel + boutons)** dès la v1. |

---

## 2. Correspondance Existant → Monde Ouvert (Zéro Perte)

| Existant (`index.html`) | Rôle dans *Bounce It : City* |
| :--- | :--- |
| **Chambre (Niv.1→3)** & **Studio Pro (42e)** | Tes **Safehouses / QG** (caméra quasi-POV). Passer la porte déclenche la sortie dans la ville (`applyStudioLocation('city')`). |
| **Bounce Live · Showcase (CCTV)** | Déclenché en allant physiquement devant les **Salles & Clubs** (*La Cave*, *Le Bataclan*, *Warehouse*, *Arène 42e*) ou via GPS. |
| **Empire OS (`Label_HQ`)** | Accessible dans ton **QG 42e** et en raccourci sur le **BouncePhone**. Ton `labelName` s'affiche sur la tour et les panneaux 4×3. |
| **Pire Ennemi (`rivalState.name`)** | Possède un **QG Rival & territoire** dans la ville, détourne des panneaux pub, envoie des sbires / provocations de rue et des Beat Battles live. |
| **Shop / Samples / Cracks** | Incarnés en ville (Boutique Matos, Disquaire Indé, Ruelle Dark-Web / Vendeur de faux streams) tout en restant accessibles par le PC au studio. |
| **Avatars 3D PBR (`Niv.1→4`)** | Réutilisés directement en **3e personne** sur la trottinette, le vélo et au volant, ainsi que pour les PNJ (`rappersConnus`, artistes signés, sbires). |
| **Textures Façades & Skyline** | Les 4 façades procédurales (diffuse + emissive, ligne `10063`) et la Skyline 42e servent de base immédiate aux immeubles de la ville. |

---

## 3. Architecture Cible — Découpage Modulaire Complet (Palier 0)

Cartographie exacte de l'actuel `index.html` (`~36 000` lignes) vers une structure modulaire ES native (`<script type="module" src="./js/main.js">`) sans casser aucun `onclick="window.xxx()"` ni aucune sauvegarde `localStorage` :

```text
/INDEX
├── index.html                    # Squelette HTML propre (DOM des vues + modales + canvas)
├── css/
│   ├── base.css                  # Variables, thèmes, animations, login GTA-6, HUD
│   ├── daw.css                   # AbleStudio, Piano Roll, Pads, Mastering
│   └── empire-showcase.css       # Empire OS Precision Tech + Bounce Live CCTV (.blive-*)
└── js/
    ├── main.js                   # Point d'entrée unique, boot sequence, window.* exports
    ├── core/
    │   ├── state.js              # DEFAULT_STATE, normalizeState, SafeStorage, save/load
    │   ├── audio.js              # WebAudio engine, MusicSystem, foley, synthé + Vault Player
    │   ├── tick.js               # Boucle temps/jour/nuit, loyers, tendances genres, HEAT decay
    │   └── ui-hud.js             # HUD, Toasts, Tooltips, Window Manager, Onboarding
    ├── studio/
    │   ├── scene-core.js         # Renderer Three.js, éclairages dynamiques, pluie/météo, bascule location
    │   ├── room-bedroom.js       # Chambre Niv.1→3, meubles, PBR matériaux, façades extérieures
    │   ├── room-pro42.js         # Studio Pro 42e Étage, Live Room, Console SSL, Skyline, Disques d'Or
    │   ├── avatars.js            # Modèles humains PBR (Niv.1→4), animations, invités 3D, login hero
    │   └── interactions.js       # Raycaster POV, contrôles intérieurs, portes/ascenseur
    ├── daw/
    │   ├── ablestudio.js         # Logique DAW, export, calcul score, Flow State, Step Sequencer
    │   ├── social-events.js      # Reviews, Collabs, QCM narratifs, Affinité Rappeurs
    │   └── stats-shop.js         # Boutique matos, Samples, Cracks, Sponsors, Achievements
    ├── empire/
    │   ├── label-hq.js           # Empire OS, Label HQ, Albums/EP, Sync, Top 10 Rival, Cérémonies/Prestige
    │   └── showcase-cctv.js      # Bounce Live · Setup + 2D Overhead CCTV + WebGL Brut DVR Fisheye
    └── city/                     # ← NOUVEAU MONDE OUVERT (Paliers 1 à 3)
        ├── city-world.js         # Générateur de la Grande Ville (4 quartiers, routes, néons, panneaux 4x3)
        ├── city-locomotion.js    # Contrôleur 3e personne (À pied / Trottinette / Vélo / Voiture) + Mobile Stick
        ├── city-triggers.js      # Zones interactives (portes bâtiments, clubs, shops, missions street)
        ├── city-npcs.js          # Piétons, trafic léger, Rappeurs, Sbires du Pire Ennemi, Paparazzis
        ├── city-radio.js         # Autoradio / Écouteurs branchés sur le Vault + réactions PNJ
        ├── bounce-phone.js       # Smartphone HUD (GPS Fast Travel, Messages, HEAT, Banque, Clashs)
        └── city-heat.js          # Système Étoiles HEAT (Industrie + Street) & Missions Satiriques
```

> **Règle d'or du Palier 0** : Aucune nouvelle feature pendant le découpage. On vérifie après extraction que **100 % du jeu existant** (Login, Chambre, Studio Pro 42e, DAW, Empire OS, Bounce Live CCTV, sauvegardes) fonctionne à l'identique avec `0` erreur console sur Desktop & Mobile.

---

## 4. Plan de Déploiement par Paliers Jouables

### Palier 0 — Fondations Modulaires (Zéro Régression)
- Extraire CSS (`css/*.css`) et JS (`js/core/`, `js/studio/`, `js/daw/`, `js/empire/`) depuis `index.html`.
- Maintenir un pont global propre (`window.*`) pour tous les handlers HTML existants.
- Vérification complète Desktop `1280×800` + Mobile `390×844` + `node --check` sur chaque module.

### Palier 1 — La Grande Ville 3D + Locomotion + Lieux Clés
- Étendre `applyStudioLocation('city')` dans `scene-core.js` :
  - **Intérieurs** (`'bedroom'`, `'pro_studio'`) = caméra quasi-POV actuelle inchangée.
  - **Ville** (`'city'`) = caméra 3e personne lissée + avatar 3D du joueur + cycle jour/nuit/pluie synchronisé avec `state.timeMins`.
- **4 Quartiers reliés (Mix Grand Paris × Mégalopole US)** optimisés en `InstancedMesh` (60 FPS mobile) :
  1. *Banlieue Nord / Résidence* (Immeuble Chambre Niv.1→3 + Parking).
  2. *Quartier Indé / Vinyl Row* (Disquaire, Magasin Matos, Ruelle Underground).
  3. *Avenue des Clubs / Midtown* (Façades néon *La Cave*, *Le Bataclan*, *Warehouse* → lancent **Bounce Live CCTV**).
  4. *Skyline / District 42* (Tour du 42e Étage affichant `state.labelName`, QG du Pire Ennemi `state.rivalState.name`, Palais des Awards).
- **Locomotion par Palier** (`city-locomotion.js`) :
  - Niv.1 : À pied / **Trottinette électrique**.
  - Niv.2 : **Vélo / BMX**.
  - Niv.3–4 : **Voiture** (berline puis supercar) avec phares volumétriques & freinage dérapage arcade.
- **Contrôles Desktop + Mobile dès la v1** : ZQSD/Flèches + Espace (Frein/Boost) + E (Entrer) sur PC ; Joystick tactile gauche + boutons Accélérer / Freiner / Entrer / Smartphone sur mobile.
- **Extension `state`** : `cityPos: { x, z, rot }`, `vehicleMode`, `heatLevel: 0`, `heatReasons: []`, `activeStreetMission: null`.

### Palier 2 — BouncePhone (GPS Fast Travel), Vie Urbaine, Panneaux & Autoradio
- **BouncePhone** (`bounce-phone.js`) : Smartphone repliable en bas à droite (Mini-map GPS avec **Fast Travel** vers les lieux débloqués, Messages rappeurs/clashs du Rival, Solde, Jauge HEAT, Radio).
- **Autoradio / Écouteurs Vault** (`city-radio.js`) : Permet de jouer tes propres prods exportées du Vault (ou radio instru) pendant que tu roules. Mettre le volume à fond près des piétons déclenche des bulles de réaction (fans qui filment → `+Fans/Hype`, ou critiques moqueuses si flop).
- **Ville Vivante & Guerre d'Image** (`city-npcs.js`) :
  - Piétons et circulation légère (`InstancedMesh` basse conso GPU).
  - Rappeurs connus et artistes signés croisés devant les spots clés.
  - **Panneaux 4×3 dynamiques** sur les façades affichant ton `labelName`, tes Disques d'Or, ou les provocations de ton `rivalState.name`.

### Palier 3 — Système « HEAT » (Industrie & Street) + Missions Satiriques
- **Jauge HEAT (0 à 5 étoiles)** (`city-heat.js`) :
  - **HEAT Industrie** : utiliser des samples non-clairés (avocats qui te traquent), refuser une major, clasher ton Pire Ennemi (sbires qui bloquent ou taguent tes affiches), gros buzz (paparazzis qui bloquent l'entrée du 42e).
  - **HEAT Street** : coller des affiches sauvages pour ton prochain *Bounce Live*, vendre des clés USB/CD à la sauvette, déclencher un mini-concert sauvage depuis le coffre de la voiture.
  - **Faire baisser le HEAT** : payer un avocat/PR sur le BouncePhone, se planquer au studio, ou calmer le jeu la nuit.
- **Missions Satiriques de Rue** :
  - *Livraison Clé USB Chrono* : traverser la ville en trottinette/voiture avant la fin de session d'un rappeur.
  - *Affichage Sauvage* : couvrir les panneaux 4×3 de ton Pire Ennemi avant que ses sbires n'arrivent.
  - *L'Arnaqueur aux Faux Streams* : vendeur louche dans une ruelle proposant +10k streams garantis (gros gain immédiat mais risque de HEAT +3 étoiles / ban temporaire).

---

## 5. Budgets Techniques & Sécurité Qualité
- **Performance Mobile 60 FPS** : `InstancedMesh` pour immeubles/lampadaires/arbres/piétons, max 3 lumières dynamiques actives en ville, ombres baked / contact shadows, `pixelRatio <= 1.5`, fog atmosphérique pour masquer la distance d'affichage sans pop brutal.
- **Compatibilité Sauvegardes** : `normalizeState()` initialise les champs ville (`cityPos`, `heatLevel`, etc.) avec des valeurs par défaut sûres pour toutes les anciennes sauvegardes.
- **Zéro Régression Audio** : WebAudio & `MusicSystem` partagés entre Intérieurs, DAW et Autoradio sans doublon de contexte audio.
