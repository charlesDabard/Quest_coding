<p align="center">
  <img src="assets/logo.svg" width="420" alt="Quest">
</p>

<p align="center">
  <strong>Ta manette PS5 pilote ton Mac. Point.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/macOS-11.3+-0ff?style=flat-square&logo=apple&logoColor=0ff&labelColor=0a0a0f" alt="macOS">
  <img src="https://img.shields.io/badge/DualSense-USB%20%7C%20BT-b44aff?style=flat-square&logo=playstation&logoColor=b44aff&labelColor=0a0a0f" alt="DualSense">
  <img src="https://img.shields.io/badge/Electron-34-ff2d95?style=flat-square&logo=electron&logoColor=ff2d95&labelColor=0a0a0f" alt="Electron">
  <img src="https://img.shields.io/badge/tests-32%20pass-30d158?style=flat-square&labelColor=0a0a0f" alt="Tests">
</p>

<br>

<p align="center">
  <code>Branche ta manette. Controle tout. Zero config.</code>
</p>

<br>

---

<br>

## Quickstart

```bash
git clone https://github.com/charlesDabard/Quest_coding.git
cd Quest_coding
npm install
npm start
```

> **Prerequis** : macOS 11.3+ / Node 18+ / `xcode-select --install`

<br>

---

<br>

## Cheat Sheet

> Tout ce que ta manette sait faire, en un coup d'oeil.

<br>

<table>
<tr>
<td width="50%" valign="top">

### X — Valider

| Appui | Action |
|:---:|:---|
| **X** | Entree |
| **R1 + X** | Clic gauche |
| **R1 + X + X** | Double clic |
| **L1 + X** | Clic droit |
| **R2 + X** | Selection (drag) |

</td>
<td width="50%" valign="top">

### O — Parler

| Appui | Action |
|:---:|:---|
| **O** | Dictee vocale on/off |

Moteurs : **Apple Dictation** ou **SuperWhisper**

</td>
</tr>
<tr>
<td valign="top">

### [] — Effacer

| Appui | Action |
|:---:|:---|
| **[]** | 1 lettre |
| **R1 + []** | 1 mot |
| **R2 + []** | 1 ligne |
| **L1 + []** | Couper (Cmd+X) |
| **L2 + R2 + []** | TOUT |

> Plus tu empiles, plus ca efface.

</td>
<td valign="top">

### Triangle — Modes

| Appui | Action |
|:---:|:---|
| **Triangle** | Shift+Tab |
| **L1 + Triangle** | Espace |
| **R1 + Triangle** | Echap |
| **R2 + Triangle** | Spotlight |

</td>
</tr>
</table>

<br>

<table>
<tr>
<td width="50%" valign="top">

### D-Pad — Fleches

| | |
|:---:|:---|
| **Haut** | Fleche haut |
| **Bas** | Fleche bas |
| **Gauche** | Fleche gauche |
| **Droite** | Fleche droite |

</td>
<td width="50%" valign="top">

### Petits boutons

| | |
|:---:|:---|
| **Options** | Tab |
| **Create** | Ctrl+C (stop) |
| **Mute** | Echap |
| **Touchpad** | Ctrl+C |
| **L3** | Copier |
| **R3** | Coller |

</td>
</tr>
</table>

<br>

---

<br>

## Sticks

<table>
<tr>
<td width="33%" valign="top">

### Stick gauche — Souris

```
Doucement  →  Precision
Un peu     →  Normal
A fond     →  VROOOM

+ R1       →  x2
```

Acceleration progressive apres 0.5s.

</td>
<td width="33%" valign="top">

### Stick droit — Scroll

```
Un peu     →  Doucement
Plus       →  Normal
A fond     →  TURBO

+ R1       →  x2
```

3 paliers avec anti-drift.

</td>
<td width="33%" valign="top">

### Les deux — Bureau

```
←← + ←←   →  Bureau gauche
→→ + →→   →  Bureau droite
```

Les deux sticks a fond, meme direction.

</td>
</tr>
</table>

<br>

---

<br>

## Gachettes analogiques

> L2 et R2 ne sont pas que des boutons. Plus tu appuies fort, plus ca scroll vite.

| Gachette | Action solo | Action analogique |
|:---:|:---|:---|
| **L1** | Annuler (Cmd+Z) | Modificateur combo |
| **R1** | Refaire (Cmd+Shift+Z) | Modificateur combo |
| **L2** | Page Up | Scroll proportionnel haut |
| **R2** | Page Down | Scroll proportionnel bas |

> L1, R1, L2, R2 sont des **modifiers** : tiens-les avec un autre bouton pour les combos.

<br>

---

<br>

## Touchpad

| Geste | Action |
|:---:|:---|
| **Clic** | Ctrl+C (interrompre) |
| **Swipe gauche** | Bureau precedent |
| **Swipe droite** | Bureau suivant |

<br>

---

<br>

## Profils

Plusieurs mappings, un seul bouton pour switcher.

| Action | Comment |
|:---|:---|
| Changer de profil | **Bouton PS** — cycle entre les profils |
| Creer un profil | Menu Quest → **+** |
| Renommer | Menu Quest → **crayon** |
| Supprimer | Menu Quest → **x** |
| Personnaliser | Menu Quest → change n'importe quel bouton |
| Reset | Menu Quest → **Reset** |

<br>

---

<br>

## Entrainement

Un mini-jeu Guitar Hero integre pour apprendre tous les boutons et combos.

```
Menu Quest  →  Entrainement
```

- 20 challenges aleatoires par session
- Score + streak + meilleur streak
- Indicateurs L1/R1/L2/R2 en temps reel
- Boutons simples, combos, sticks, gachettes, swipes

<br>

---

<br>

## Claude Code

Quest est fait pour piloter **Claude Code** depuis ta manette. Tu dictes, tu navigues, tu valides, tu effaces — tout sans toucher le clavier.

**Formules vocales :**

| Tu dis | Ca fait |
|:---|:---|
| *"Reveille toi mon Kevin"* | `git pull` — recupere le code |
| *"Sauvegarde mon Kevin"* | `git commit` — sauvegarde en local |
| *"Pousse mon Kevin"* | `git commit + push` — envoie sur GitHub |

> Dicte avec **O**, navigue avec le **D-pad**, valide avec **X**, efface avec **[]**. Tout depuis le canape.

<br>

---

<br>

## Permissions

| Permission | Chemin |
|:---|:---|
| Accessibilite | Reglages Systeme → Confidentialite → Accessibilite |
| Microphone | Reglages Systeme → Confidentialite → Microphone |

<br>

---

<br>

## Stack

```
Electron · menubar · dualsense-ts · nut-js · osascript
```

<br>

---

<p align="center">
  <br>
  <sub>construit avec une manette et du cafe</sub>
  <br>
  <br>
</p>
