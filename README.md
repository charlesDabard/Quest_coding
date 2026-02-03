<p align="center">
  <img src="assets/logo.svg" width="400" alt="Quest">
</p>

<p align="center">
  <code>// MANETTE PS5 → CONTROLE TON MAC</code>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/macOS-11.3+-0ff?style=flat-square&logo=apple&logoColor=0ff&labelColor=0a0a0f" alt="macOS">
  <img src="https://img.shields.io/badge/DualSense-USB%20%7C%20BT-b44aff?style=flat-square&logo=playstation&logoColor=b44aff&labelColor=0a0a0f" alt="DualSense">
  <img src="https://img.shields.io/badge/Electron-34-ff2d95?style=flat-square&logo=electron&logoColor=ff2d95&labelColor=0a0a0f" alt="Electron">
</p>

---

```
> Branche ta manette. Controle tout. Zero config.
```

---

## `// INSTALLER`

```bash
git clone https://github.com/charlesDabard/Quest_coding.git
cd Quest_coding
npm install
npm start
```

> macOS 11.3+ / Node 18+ / `xcode-select --install`

---

## `// X`

Valider. Comme quand tu dis "oui".

| Appui | Ca fait quoi |
|:---:|:---|
| **X** | Entree. Valider. |
| **R1 + X** | Tiens le clic souris. Pour deplacer des trucs. |
| **R2 + X** | Tiens le clic souris. Pour selectionner du texte. |

> Reste appuye sur R1 ou R2, puis appuie sur X. Tant que tu tiens, le clic reste enfonce. Tu laches, ca lache.

---

## `// O`

Parler a l'ordi. Tu parles, il ecrit. Magie.

| Appui | Ca fait quoi |
|:---:|:---|
| **O** | Lance la dictee vocale. Appuie encore pour arreter. |

Deux moteurs au choix (dans le menu Quest) :
- **Apple Dictation** — celui de base
- **SuperWhisper** — plus costaud

---

## `// []`

Effacer. T'as ecrit une betise ? Pouf, c'est parti.

| Appui | Ca fait quoi |
|:---:|:---|
| **[]** | Efface une lettre. Juste une. |
| **R1 + []** | Efface un mot entier. D'un coup. |
| **R2 + []** | Efface toute la ligne. Pchhhh. |
| **L2 + R2 + []** | Efface TOUT. La page entiere. Boum. |

> Plus tu rajoutes de boutons, plus ca efface.

---

## `// TRIANGLE`

Changer de mode. Comme changer de chapeau.

| Appui | Ca fait quoi |
|:---:|:---|
| **Triangle** | Shift+Tab. Change de mode dans Claude Code. |
| **L1 + Triangle** | Espace. La barre d'espace, quoi. |
| **R1 + Triangle** | Echap. Ferme le truc qui t'embete. |
| **R2 + Triangle** | Spotlight. Cherche n'importe quoi sur ton Mac. |

---

## `// D-PAD`

Les fleches. Haut bas gauche droite. Comme dans un jeu.

| Appui | Ca fait quoi |
|:---:|:---|
| **Haut** | Fleche haut |
| **Bas** | Fleche bas |
| **Gauche** | Fleche gauche |
| **Droite** | Fleche droite |

---

## `// STICK GAUCHE`

C'est ta souris. Tu bouges le stick, la fleche bouge.

```
Doucement    →  Precision. La fleche bouge tout doucement.
Un peu plus  →  Ca accelere.
A fond       →  VROOOM.

R1 appuye    →  Tout va 2x plus vite.
```

Au debut c'est un peu lent (pour pas partir n'importe ou). Apres 0.5 seconde, ca accelere tout seul.

---

## `// STICK DROIT`

C'est pour scroller. Comme faire tourner la molette d'une souris.

```
Un petit peu  →  Ca scroll doucement.
Un peu plus   →  Ca scroll bien.
A fond        →  CA SCROLL SUPER VITE.

R1 appuye     →  Tout va 2x plus vite.
```

---

## `// LES DEUX STICKS`

Les deux sticks a fond dans la meme direction en meme temps = changer de bureau.

```
[<===] + [<===]  →  Bureau de gauche
[===>] + [===>]  →  Bureau de droite
```

---

## `// LES PETITS BOUTONS`

| Bouton | Ca fait quoi |
|:---:|:---|
| **L1** | Annuler. Oups, je voulais pas faire ca. |
| **R1** | Re-faire. En fait si, je voulais. |
| **L2** | Monter la page. Ascenseur qui monte. |
| **R2** | Descendre la page. Ascenseur qui descend. |
| **L3** | Copier. Tu prends une photo dans ta tete. |
| **R3** | Coller. Tu poses la photo quelque part. |
| **Options** | Tab. Passer au truc suivant. |
| **Create** | Stop. On arrete tout. |
| **Mute** | Echap. Laisse-moi tranquille. |
| **Touchpad** | Changer d'app. Comme zapper la tele. |

> L1, R1, L2, R2 sont aussi des **modifiers** : tu les tiens appuyes avec un autre bouton pour declencher des combos (voir les sections au-dessus).

---

## `// CLAUDE CODE`

Quest est fait pour piloter Claude Code avec ta manette. Tu dictes, tu navigues, tu valides, tu effaces — tout sans toucher le clavier.

Combiner avec les **formules vocales** :

| Formule | Ca fait quoi |
|:---|:---|
| **"Reveille toi mon Kevin"** | `git pull` — recupere le code de GitHub |
| **"Sauvegarde mon Kevin"** | `git commit` — sauvegarde en local |
| **"Pousse mon Kevin"** | `git commit + push` — envoie sur GitHub |

> Tu parles a l'IA avec la dictee (O), tu navigues avec le D-pad, tu valides avec X, tu effaces avec []. Tout depuis le canape.

---

## `// PERSONNALISER`

Clique sur l'icone Quest dans la barre de menus. Change n'importe quel bouton avec le menu deroulant. C'est sauvegarde tout seul.

Bouton **Reset** pour tout remettre comme avant.

---

## `// PERMISSIONS`

| Quoi | Ou |
|:---|:---|
| Accessibilite | Reglages Systeme → Confidentialite → Accessibilite |
| Microphone | Reglages Systeme → Confidentialite → Microphone |

---

## `// STACK`

```
Electron · menubar · dualsense-ts · nut-js · osascript
```

---

<p align="center">
  <sub>// construit avec une manette et du cafe</sub>
</p>
