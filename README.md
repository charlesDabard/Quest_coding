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

## `// LES BOUTONS`

Tu appuies, ca fait un truc. Simple.

| Bouton | Ca fait quoi |
|:---:|:---|
| **D-pad** | Les fleches. Haut bas gauche droite. Comme dans un jeu. |
| **X** | Valider. Comme quand tu dis "oui". |
| **O** | Parler a l'ordi. Tu parles, il ecrit. Magie. |
| **[]** | Effacer. T'as ecrit une betise ? Pouf, c'est parti. |
| **Triangle** | Changer de mode. Comme changer de chapeau. |
| **L1** | Annuler. Oups, je voulais pas faire ca. |
| **R1** | Re-faire. En fait si, je voulais. |
| **L2** | Monter la page. Comme un ascenseur qui monte. |
| **R2** | Descendre la page. L'ascenseur descend. |
| **L3** | Copier. Tu prends une photo dans ta tete. |
| **R3** | Coller. Tu poses la photo quelque part. |
| **Options** | Tab. Passer au truc suivant. |
| **Create** | Stop. On arrete tout. |
| **Mute** | Echap. Je veux plus, laisse-moi tranquille. |
| **Touchpad** | Changer d'app. Comme zapper la tele. |

---

## `// LES COMBOS`

Tu gardes un bouton appuye et tu appuies sur un autre. C'est comme des pouvoirs secrets.

### Effacer

| Combo | Ca fait quoi |
|:---:|:---|
| **R1 + []** | Efface un mot. Tout le mot. D'un coup. |
| **R2 + []** | Efface toute la ligne. Pchhhh. |
| **L2 + R2 + []** | Efface TOUT. La page entiere. Boum. |

### Souris

| Combo | Ca fait quoi |
|:---:|:---|
| **R1 + X** | Tu restes appuye = tu tiens le clic. Pour deplacer des trucs. |
| **R2 + X** | Pareil. Tiens le clic pour selectionner du texte. |

### Navigation

| Combo | Ca fait quoi |
|:---:|:---|
| **R1 + Triangle** | Echap. Ferme le truc qui t'embete. |
| **R2 + Triangle** | Spotlight. Cherche n'importe quoi sur ton Mac. |

---

## `// LE STICK GAUCHE`

C'est ta souris. Tu bouges le stick, la fleche bouge.

```
Doucement     →  La fleche bouge doucement (precision)
Un peu plus   →  Ca accelere
A fond        →  VROOOM

R1 appuye     →  Tout va 2x plus vite
```

Au debut c'est un peu lent (pour pas partir n'importe ou). Apres 0.5 seconde, ca accelere tout seul.

---

## `// LE STICK DROIT`

C'est pour scroller. Comme faire tourner la molette d'une souris.

```
Un petit peu  →  Ca scroll doucement
Un peu plus   →  Ca scroll bien
A fond        →  CA SCROLL SUPER VITE

R1 appuye     →  Tout va 2x plus vite
```

---

## `// CHANGER DE BUREAU`

Les deux sticks a fond a gauche en meme temps → bureau de gauche.
Les deux sticks a fond a droite en meme temps → bureau de droite.

```
[<===] + [<===]  →  Bureau gauche
[===>] + [===>]  →  Bureau droite
```

---

## `// LA DICTEE VOCALE`

Appuie sur **O** et parle. L'ordi ecrit ce que tu dis.

Tu peux choisir entre deux moteurs dans le menu :
- **Apple Dictation** — celui de base, deja installe
- **SuperWhisper** — plus costaud, plus precis

Le choix se fait dans la petite fenetre de Quest (clique sur l'icone en haut de l'ecran).

---

## `// PERSONNALISER`

Clique sur l'icone Quest dans la barre de menus. Tu verras tous les boutons avec un menu deroulant. Change ce que tu veux. C'est sauvegarde automatiquement.

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
