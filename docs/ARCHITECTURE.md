# Architecture technique — Quest

## Vue d'ensemble

Quest est une application Electron qui fonctionne exclusivement dans la barre de menus macOS (pas d'icone Dock, pas de fenetre principale). Elle lit les inputs d'une manette PS5 DualSense et les traduit en actions clavier.

```
┌─────────────────────────────────────────────┐
│                  macOS                       │
│                                              │
│  ┌──────────┐    ┌──────────┐    ┌────────┐ │
│  │ DualSense│───>│  Quest   │───>│ Clavier│ │
│  │ (HID)    │    │ (main.js)│    │ (CGEvt)│ │
│  └──────────┘    └────┬─────┘    └────────┘ │
│                       │                      │
│                  ┌────┴─────┐                │
│                  │ Menu bar │                │
│                  │ (tray)   │                │
│                  └──────────┘                │
└─────────────────────────────────────────────┘
```

## Flux de donnees

### 1. Lecture de la manette

`dualsense-ts` ouvre une connexion HID avec la manette via `node-hid`. La librairie detecte automatiquement USB ou Bluetooth et abstrait les differences de protocole (rapports HID 0x01 pour USB, 0x01/0x31 pour Bluetooth).

Chaque bouton expose des events :
- `"press"` — front montant (bouton enfonce)
- `"release"` — front descendant (bouton relache)
- `"change"` — tout changement d'etat

Quest ecoute uniquement `"press"` pour eviter les doubles declenchements.

### 2. Simulation clavier

`@nut-tree-fork/nut-js` utilise `CGEventPost` sous macOS pour injecter des events clavier au niveau systeme. La configuration `autoDelayMs = 0` supprime le delai par defaut entre les frappes.

Deux fonctions utilitaires :
- `pressKey(key)` — press + release une touche
- `pressCombo(...keys)` — press toutes les touches dans l'ordre, puis release dans l'ordre inverse (pour les raccourcis comme Option+Backspace)

### 3. Dictee vocale

La dictee utilise `osascript` pour scanner le menu bar de l'app au premier plan. Le script AppleScript :
1. Parcourt tous les menus de la menu bar
2. Cherche un menu contenant "dit" (matche "Edit" et "Edition")
3. Dans ce menu, cherche un item contenant "ictation" ou "ictee"
4. Clique dessus

Cette approche est independante de la langue du systeme.

### 4. Interface utilisateur

Le dropdown s'affiche quand l'utilisateur clique sur l'icone dans la barre de menus. Communication main <-> renderer via Electron IPC :

```
main.js  ──controller-status──>  renderer.js
main.js  <──quit-app──────────  renderer.js
```

L'icone utilise le suffixe `Template` dans le nom du fichier, ce qui permet a macOS de gerer automatiquement le dark mode (l'icone est rendue en noir ou blanc selon le theme).

## Decisions techniques

| Decision | Raison |
|---|---|
| `menubar` plutot que `Tray` natif | API simplifiee pour les apps menu bar, gestion automatique du positionnement |
| `dualsense-ts` plutot que lecture HID brute | Abstraction propre du protocole DualSense, gestion USB/BT transparente |
| `@nut-tree-fork/nut-js` plutot que `robotjs` | robotjs est abandonne, nut-js fork est maintenu et compatible Node 18+ |
| `osascript` pour la dictee | Les APIs systeme (CGEvent, IOHIDPostEvent) ne peuvent pas simuler le double-press Fn ; le menu Accessibility est la seule methode fiable |
| `nodeIntegration: true` | Le renderer a besoin de `ipcRenderer` ; acceptable car l'app ne charge aucun contenu distant |

## Limites connues

- **Dictee** : necessite une app avec menu Edition au premier plan
- **Simulation Fn** : macOS bloque toute simulation logicielle du double-press Globe/Fn (protection systeme au niveau IOKit)
- **Accessibilite** : l'app doit etre autorisee manuellement dans les Reglages Systeme
