<p align="center">
  <img src="assets/iconTemplate.png" width="80" alt="Quest icon">
</p>

<h1 align="center">Quest</h1>

<p align="center">
  <strong>Transforme ta manette PS5 en clavier macOS.</strong><br>
  Une app menu bar invisible qui traduit les inputs DualSense en actions clavier — navigation, validation, suppression et dictee vocale.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/macOS-Big_Sur_11.3+-black?style=flat-square&logo=apple" alt="macOS">
  <img src="https://img.shields.io/badge/PS5-DualSense-blue?style=flat-square&logo=playstation" alt="DualSense">
  <img src="https://img.shields.io/badge/Electron-34-47848F?style=flat-square&logo=electron" alt="Electron">
</p>

---

## Pourquoi Quest ?

Tu veux naviguer dans une app, valider des choix, dicter du texte ou corriger des mots — **sans toucher ton clavier**. Quest vit dans ta barre de menus macOS et transforme ta manette PS5 DualSense en peripherique d'accessibilite.

Branche ta manette. Lance Quest. C'est tout.

---

## Mapping

| Bouton manette | Action clavier |
|:---:|:---|
| **D-pad** | Fleches directionnelles |
| **X** (Croix) | Entree / Validation |
| **O** (Rond) | Demarrer / Arreter la dictee vocale macOS |
| **[]** (Carre) | Supprimer le dernier mot (`Option + Backspace`) |

---

## Installation

### Prerequis

- **macOS** Big Sur 11.3 ou superieur
- **Node.js** 18+
- **Xcode Command Line Tools** (pour la compilation de `node-hid`)

```bash
xcode-select --install
```

### Setup

```bash
git clone https://github.com/charlesDabard/Quest_coding.git
cd Quest_coding
npm install
```

### Lancement

```bash
npm start
```

L'icone Quest apparait dans la barre de menus. Pas d'icone dans le Dock.

---

## Connexion de la manette

### USB (filaire)

Branche la manette DualSense en USB-C. Quest la detecte automatiquement.

### Bluetooth

1. Sur la manette, maintiens **PS + Create** jusqu'au clignotement bleu
2. Sur le Mac : **Reglages Systeme > Bluetooth** > connecte "DualSense Wireless Controller"

Quest affiche le statut de connexion dans le menu dropdown (point vert = connectee).

---

## Permissions macOS requises

Quest simule des frappes clavier et accede au micro pour la dictee. macOS demande des autorisations :

| Permission | Chemin | Raison |
|---|---|---|
| **Accessibilite** | Reglages Systeme > Confidentialite > Accessibilite | Simulation de touches clavier |
| **Micro** | Reglages Systeme > Confidentialite > Microphone | Dictee vocale |

Ajoute le **Terminal** (ou l'app Electron) dans ces deux listes.

---

## Architecture

```
quest/
├── main.js              # Process principal Electron — tray, controller, keyboard
├── index.html           # UI du dropdown menu bar
├── renderer.js          # Logique UI — statut manette, bouton quitter
├── dictation-toggle.swift  # Binaire Swift pour la dictee (experimental)
├── assets/
│   └── iconTemplate.png # Icone menu bar 20x20 (Template = dark mode auto)
├── package.json
└── .gitignore
```

### Stack technique

| Composant | Role |
|---|---|
| [Electron](https://electronjs.org) + [menubar](https://github.com/nicjansma/menubar) | App menu bar sans icone Dock |
| [dualsense-ts](https://github.com/nsfm/dualsense-ts) | Lecture HID de la manette PS5 (USB + Bluetooth) |
| [nut-js](https://github.com/nut-tree-fork/nut-js) | Simulation de touches clavier via CGEvent |
| [osascript](https://developer.apple.com/library/archive/documentation/AppleScript/Conceptual/AppleScriptX/) | Declenchement de la dictee macOS via le menu Accessibility |

---

## Fonctionnement de la dictee

La dictee vocale est declenchee via AppleScript en scannant le menu **Edition** (ou **Edit**) de l'application au premier plan. Le script cherche automatiquement le bon item de menu quelle que soit la langue du systeme (francais / anglais).

> **Note** : L'app au premier plan doit avoir un menu Edition avec l'option Dictee (TextEdit, Notes, Pages, Safari, etc.).

---

## Personnalisation

Le mapping est defini dans `main.js` dans la fonction `initController()`. Pour ajouter un nouveau bouton :

```js
// Exemple : Triangle → Echap
controller.triangle.on("press", () => {
  pressKey(Key.Escape);
});
```

Boutons disponibles : `cross`, `circle`, `square`, `triangle`, `left.bumper`, `right.bumper`, `left.trigger`, `right.trigger`, `ps`, `options`, `create`, `mute`, `touchpad.button`.

---

## Troubleshooting

| Probleme | Solution |
|---|---|
| Manette non detectee | Verifie la connexion USB ou le Bluetooth. Relance `npm start`. |
| Touches ne fonctionnent pas | Ajoute le Terminal/Electron dans Accessibilite (Reglages Systeme). |
| Dictee ne demarre pas | Verifie que l'app au premier plan a un menu Edition > Dictee. |
| Erreur `node-hid` a l'install | Lance `xcode-select --install` puis reinstalle. |

---

## Licence

ISC

---

<p align="center">
  <sub>Construit avec une manette PS5 et du cafe.</sub>
</p>
