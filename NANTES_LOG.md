# NANTES_LOG.md — Sources Open Data, Licences & Pipeline Cartographique 3D (Nantes)

Ce document trace la provenance, la vérification des licences commerciales et le pipeline de génération des tuiles 3D streamables pour la **Zone Pilote Élargie de Nantes (2,8 km × 2,8 km — échelle 1:1)**.

---

## 1. Zone Pilote & Projection Officielle (EPSG:2154 → Local 3D)

- **Système officiel de référence** : RGF93 / Lambert-93 (`EPSG:2154`) — constantes officielles IAG GRS80 / IGN (`a = 6378137.0`, `e = 0.0818191910428158`, `n = 0.7256077650532670`, `c = 11754255.426096`, `Xs = 700000.0`, `Ys = 12655612.049876`, `λ0 = 3° E`).
- **Origine locale du jeu `(0, 0)`** : `Lambert-93 (355250.0 m, 6689100.0 m)` (centre-ville / Commerce / Loire).
- **Transformation exacte** :
  - `gameX = l93X - 355250.0` (+Est)
  - `gameZ = -(l93Y - 6689100.0)` (-Nord / +Sud Three.js)
- **Étendue pilote** : `2800 m × 2800 m` (`X ∈ [-1400, +1400]`, `Z ∈ [-1400, +1400]`), englobant :
  - Centre-ville (Tour Bretagne, Place Royale, Bouffay, Graslin, Château des Ducs, Cathédrale Saint-Pierre, Cours des 50-Otages),
  - Quartiers Est & Nord (Gare SNCF, Tour LU / Lieu Unique, Jardin des Plantes, Erdre / Île de Versailles),
  - Rives & Île de Nantes (Quai de la Fosse, Olivettes, Quartier Création, Stereolux, Nefs des Machines, Grue Titan Jaune, Hangar à Bananes).
- **Découpage en tuiles streamables** : grille **`7 × 7` tuiles de `400 m × 400 m`** (`tile_{tx}_{tz}_lod0.glb` et `_lod1.glb`), compressées via **Meshopt (`EXT_meshopt_compression`)**.

---

## 2. Audit des Sources par Ordre de Priorité Strict

### Priorité 1 — Portail Open Data de Nantes Métropole (`data.nantesmetropole.fr`)
- **Date d'audit** : 2026-11-23
- **Endpoints interrogés** :
  - `https://data.nantesmetropole.fr/api/explore/v2.1/catalog/datasets?limit=10&where=search("3D")` → `0` jeu de données.
  - `search("maquette")` → `0` jeu de données.
  - `search("bati")` → `4` jeux 2D/attributaires (`244400404_psmv-habillages-s/l`, défibrillateurs, budgets).
  - `search("mnt")` → `1` jeu (`244400404_modele-numerique-terrain-nantes-metropole`, `Licence Ouverte-LO`).
- **Décision** : Aucune maquette 3D globale exploitable en CityGML/GLB/OBJ n'est publiée en téléchargement libre sur le catalogue public de Nantes Métropole. On passe à la source de priorité 2 (IGN BD TOPO® V3 + RGE ALTI®) pour la géométrie 3D et le relief.

### Priorité 2 — IGN BD TOPO® V3 & RGE ALTI® (`data.geopf.fr`) — SOURCE PRINCIPALE 3D & RELIEF
- **Statut d'utilisation** : **Utilisée** (bâtiments 3D, voirie, hydrographie Loire/Erdre/Canal Saint-Félix, zones de végétation/parcs, et MNT RGE ALTI).
- **Licence** : **Licence Ouverte / Open Licence Etalab 2.0**
  - Usage commercial : **Autorisé**
  - Modification / Fusion / Recalcul en maillages optimisés GLB : **Autorisé**
  - Obligation : **Mention d'attribution requise** → `IGN BD TOPO (Licence Ouverte)` (ajoutée dans l'interface Paramètres du jeu).
- **Endpoints officiels interrogés** :
  - WFS `https://data.geopf.fr/wfs/ows` (v2.0.0, `srsName=EPSG:2154`, `outputFormat=application/json`) :
    - `BDTOPO_V3:batiment` (empreintes, `hauteur` = **hauteur à la gouttière**, `nombre_d_etages`, `usage_1`, `nature`, `altitude_minimale_sol`)
    - `BDTOPO_V3:troncon_de_route` (`largeur_de_chaussee`, `importance`, `nature`, toponymie)
    - `BDTOPO_V3:surface_hydrographique` (bras de la Loire, Erdre, canal)
    - `BDTOPO_V3:zone_de_vegetation` (bois, parcs urbains)
  - API Altimétrie `https://data.geopf.fr/altimetrie/1.0/calcul/alti/rest/elevation.json?resource=ign_rge_alti_wld` (grille `57 × 57` à pas de `50 m` sur les `2,8 × 2,8 km`).
- **Traitement des toitures (`HAUTEUR` à la gouttière)** : Extrusion des murs jusqu'à `MNT + HAUTEUR`, complétée automatiquement par des **toitures procédurales** (mansardes en ardoise dans le centre historique, toits en pente terre cuite/ardoise en résidentiel, toits-terrasses avec acrotères sur l'Île de Nantes, couronnes techniques sur les tours ≥ 24 m).

### Priorité 3 — OpenStreetMap (Overpass API) — SOURCE COMPLÉMENTAIRE
- **Statut d'utilisation** : **Utilisée** en complément uniquement (lignes de tramway TAN, mobilier urbain : arbres, bancs, lampadaires, fontaines, noms de quartiers/lieux).
- **Licence** : **ODbL 1.0 (Open Database License)**
  - Usage commercial : **Autorisé**
  - Obligation : **Attribution requise** → `© OpenStreetMap contributors` (ajoutée dans l'interface Paramètres du jeu) + conservation des crédits pour la couche complétée.
- **Endpoints interrogés** : Miroirs officiels Overpass (`overpass-api.de` / `overpass.openstreetmap.fr` / `overpass.kumi.systems`), bbox `(47.199, -1.578, 47.227, -1.536)`.

### Exclusions Strictes Vérifiées
- Aucune tuile 3D photoréaliste Google Earth / Google Maps / Apple / Bing / Mapbox propriétaire.
- Aucun scraping hors API publiques autorisées.
- Données brutes (`raw_data/`) exclues du dépôt Git via `.gitignore` ; seuls les artefacts optimisés (`assets/nantes/nantes_manifest.json` et `assets/nantes/tiles/*.glb`) sont conservés.

---

## 3. Métriques de Build du Pipeline Offline (`scripts/build_nantes_tiles.mjs`)

- **Date de génération** : 2026-11-23T00:03:24.522Z
- **Notice fallback Overpass -> Sources Officielles** : Tous les miroirs Overpass testés (`overpass.openstreetmap.fr` HTTP 403, `overpass-api.de` HTTP 406 / timeout, `kumi.systems` et `private.coffee` timeout) étant indisponibles lors du build, les voies de tramway proviennent de `IGN BDTOPO_V3:troncon_de_voie_ferree` (Licence Ouverte Etalab 2.0) et le mobilier urbain géolocalisé (arbres, éclairage public, îlots de fraîcheur / fontaines) provient des jeux officiels **Nantes Métropole Open Data** (`244400404_patrimoine-arbore-nantes-metropole`, `244400404_luminaires-eclairage-public-nantes-metropole`, `244400404_ilot-fraicheur-nantes-metropole`, **Licence Ouverte-LO**, usage commercial autorisé avec attribution).
- **Entités IGN BD TOPO V3** : `9350` bâtiments extrudés + toitures procédurales (`32` emprises réservées aux monuments modélisés), `4306` tronçons de route, `24` surfaces hydrographiques (Loire, Erdre, Canal Saint-Félix), `418` zones de végétation, `16` tronçons de Tramway TAN.
- **MNT IGN RGE ALTI** : Grille `57×57` (`3249` cotes NGF, niveau d'eau Loire calibré à `6.14 m NGF`).
- **Arbres & Mobilier Nantes Métropole** : `4066` arbres recensés (répartis par tuile en `1205` instances botaniques), `2753` luminaires (répartis par tuile en `1097` lampadaires + 6 `PointLight`s dynamiques), `11` stations Tramway TAN, `150` bancs, `14` stations Bicloo, `12` Colonnes Morris et `26` îlots de fraîcheur.
- **Tuiles GLB Meshopt (`assets/nantes/tiles/`)** : `49` tuiles streamables `LOD0` + `LOD1` compressées avec `@gltf-transform/cli --compress meshopt --palette false --prune-attributes false --join false` (15 matériaux PBR dont tuffeau, colombages Bouffay, haussmann, brique, béton années 50, commerces rez-de-chaussée, toitures ardoise/tuiles et `TEXCOORD_0` UVs préservés), taille totale = **`14.35 Mo`**.
