<p align="center">
  <img src="assets/logo.svg" width="400" alt="Quest">
</p>

<p align="center">
  <code>Manette PS5 DualSense → macOS</code>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/macOS-11.3+-0ff?style=flat-square&logo=apple&logoColor=0ff&labelColor=0a0a0f" alt="macOS">
  <img src="https://img.shields.io/badge/DualSense-USB%20%7C%20BT-b44aff?style=flat-square&logo=playstation&logoColor=b44aff&labelColor=0a0a0f" alt="DualSense">
  <img src="https://img.shields.io/badge/Electron-34-ff2d95?style=flat-square&logo=electron&logoColor=ff2d95&labelColor=0a0a0f" alt="Electron">
</p>

---

App menu bar invisible. Branche ta manette. Controle ton Mac — clavier, souris, dictee vocale. Zero config.

---

## Setup

```bash
git clone https://github.com/charlesDabard/Quest_coding.git
cd Quest_coding
npm install
npm start
```

> Prerequis : macOS 11.3+, Node 18+, `xcode-select --install`

---

## Mapping

### Boutons

| Bouton | Action | Combo |
|:---:|:---|:---|
| **D-pad** | Fleches directionnelles | — |
| **X** | Clic souris | Double-tap → Enter |
| **O** | Dictee vocale on/off | — |
| **[]** | Backspace (1 lettre) | R1+[] → mot · R2+[] → ligne · L2+R2+[] → tout |
| **Triangle** | Shift+Tab (switch mode) | — |
| **L1** | Undo | _modifier_ |
| **R1** | Redo | _modifier_ |
| **L2** | Scroll haut | _modifier_ |
| **R2** | Scroll bas | _modifier_ |
| **L3** | Copier | — |
| **R3** | Coller | — |
| **Options** | Tab | — |
| **Create** | Ctrl+C (interrompre) | — |
| **Mute** | Echap | — |
| **Touchpad** | Cmd+Tab (switch app) | — |

### Stick gauche

Deplace le curseur souris. Acceleration non-lineaire — petit mouvement = precision, stick a fond = rapide.

### Modifiers

Maintiens **R1**, **R2**, **L1** ou **L2** puis appuie sur un autre bouton pour declencher un combo. Si le modifier est relache seul, son action propre se declenche.

---

## Personnalisation

L'UI dans la barre de menus permet de remapper chaque bouton via un dropdown. 40+ actions disponibles. Le mapping est sauvegarde dans `config.json`.

Bouton **Reset** pour revenir au mapping par defaut.

---

## Permissions

| Permission | Ou |
|:---|:---|
| Accessibilite | Reglages Systeme → Confidentialite → Accessibilite |
| Microphone | Reglages Systeme → Confidentialite → Microphone |

---

## Stack

[Electron](https://electronjs.org) + [menubar](https://github.com/nicjansma/menubar) · [dualsense-ts](https://github.com/nsfm/dualsense-ts) · [@nut-tree-fork/nut-js](https://github.com/nut-tree-fork/nut-js) · osascript

---

<p align="center">
  <sub>ISC · Construit avec une manette et du cafe.</sub>
</p>
