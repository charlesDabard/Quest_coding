# API Reference — Quest

## Boutons (18 boutons mappes)

### Mapping par defaut

| Bouton | Action par defaut | Categorie |
|--------|-------------------|-----------|
| D-pad haut | Fleche haut | Navigation |
| D-pad bas | Fleche bas | Navigation |
| D-pad gauche | Fleche gauche | Navigation |
| D-pad droite | Fleche droite | Navigation |
| X (cross) | Entree / Valider | Saisie |
| O (circle) | Dictee vocale | Special |
| Carre (square) | Backspace | Saisie |
| Triangle | Shift+Tab | Saisie |
| L1 | Annuler (Cmd+Z) | Edition |
| R1 | Retablir (Cmd+Shift+Z) | Edition |
| L2 | Scroll haut (PgUp) | Navigation |
| R2 | Scroll bas (PgDown) | Navigation |
| L3 (stick clic) | Copier (Cmd+C) | Edition |
| R3 (stick clic) | Coller (Cmd+V) | Edition |
| Options | Tab | Saisie |
| Create | Interrompre (Ctrl+C) | Terminal |
| Mute | Echap | Saisie |
| Touchpad (clic) | Interrompre (Ctrl+C) | Terminal |
| PS | Profil suivant | Special |

### Proprietes dualsense-ts

| Bouton | Propriete |
|--------|-----------|
| D-pad | `controller.dpad.up/down/left/right` |
| Face | `controller.cross/circle/square/triangle` |
| Bumpers | `controller.left.bumper`, `controller.right.bumper` |
| Triggers | `controller.left.trigger`, `controller.right.trigger` |
| Sticks clic | `controller.left.analog.button`, `controller.right.analog.button` |
| Options | `controller.options` |
| Create | `controller.create` |
| Mute | `controller.mute` |
| Touchpad | `controller.touchpad.left.contact` (swipe), clic via `handleButtonPress` |
| PS | `controller.ps` |

---

## Systeme de combos

Les boutons L1, R1, L2, R2 sont des **modifiers**. Quand on les tient et qu'on appuie un bouton d'action, un combo se declenche. Si le modifier est relache sans avoir ete utilise dans un combo, son action propre est declenchee.

### Square combos

| Combo | Action |
|-------|--------|
| R1 + Carre | Supprimer dernier mot (Ctrl+W) |
| R2 + Carre | Supprimer ligne (Cmd+Backspace) |
| L2 + R2 + Carre | Tout supprimer (Cmd+A puis Backspace) |

### Cross combos

| Combo | Action |
|-------|--------|
| R1 + X | Clic souris gauche |
| R1 + X + X (double-tap) | Double clic souris |
| R2 + X | Mode selection (Shift maintenu / drag) |

### Triangle combos

| Combo | Action |
|-------|--------|
| L1 + Triangle | Espace |
| R1 + Triangle | Echap |
| R2 + Triangle | Spotlight (Cmd+Space) |

---

## Souris (stick gauche)

Le stick gauche controle le curseur souris.

| Parametre | Valeur defaut | Setting |
|-----------|---------------|---------|
| Deadzone | 0.15 | `mouseDeadzone` |
| Vitesse max | 30 px/tick | `mouseSpeed` |
| Courbe d'acceleration | 2.5 (quadratique) | `mouseAccel` |
| Rampe temporelle | 500ms (0.8x → 1.2x) | `mouseRampMs`, `mouseSpeedMin`, `mouseSpeedMax` |
| Boost R1 | x2 | - |
| Tick rate | 16ms (~60fps) | `mouseTick` |

- Support multi-ecran (respect des limites de chaque display)
- Hysteresis sur la deadzone (activation a `mouseDeadzone`, desactivation a `mouseDeadzone - scrollHysteresis`)

---

## Scroll (stick droit)

Le stick droit controle le scroll (vertical + horizontal). 3 vitesses basees sur la deflexion :

| Tier | Seuil | Vitesse | Setting |
|------|-------|---------|---------|
| Lent | 0.25 | 2 | `scrollTiers[0]` |
| Moyen | 0.50 | 8 | `scrollTiers[1]` |
| Rapide | 0.85 | 25 | `scrollTiers[2]` |

- Boost R1 : x2
- **Hysteresis** : activation au seuil, desactivation a `seuil - scrollHysteresis` (defaut 0.05)
- Bloque pendant 600ms apres un desktop switch (anti-scroll parasite)

---

## Triggers analogiques (L2/R2)

En plus de leur action standard (PageUp/PageDown), les triggers ont un mode **scroll analogique proportionnel** :

- Quand L2 est maintenu seul (pas en combo), le scroll up est proportionnel a la pression (0→`triggerScrollMax`)
- Quand R2 est maintenu seul, le scroll down est proportionnel
- `triggerScrollMax` = 15 (configurable)
- Si le trigger est utilise en combo (ex: R2+Carre), le scroll analogique est desactive

---

## Desktop switch

Deux methodes pour changer de bureau macOS :

1. **Both sticks** : les deux sticks a fond a gauche ou a droite simultanement (seuil: `desktopSwitchThreshold` = 0.85)
2. **Touchpad swipe** : glisser le doigt sur le touchpad (seuil: `swipeThreshold` = 0.4)

Cooldown de 600ms entre chaque switch (`desktopSwitchCooldown`). Le scroll est aussi bloque pendant ce cooldown.

---

## Mode selection (R2+X)

- R2+X active le drag-select : le clic gauche est maintenu
- LED passe en violet (180, 0, 255)
- Relacher R2 ou X desactive le mode
- LED revient en cyan

---

## Double-tap (R1+X)

- R1 + X : premier tap = clic simple
- R1 + X + X rapide (< 300ms) : double clic
- Rumble 0.4 intensite, 100ms pour le double clic

---

## LED controller

| Couleur | Signification |
|---------|---------------|
| Cyan (0, 255, 255) | Mode normal |
| Violet (180, 0, 255) | Mode selection actif |
| Rose/rouge (255, 50, 100) | Dictee active |

Acces direct HID : `controller.hid.command[45-47]` = RGB.

---

## Haptic feedback (rumble)

| Contexte | Intensite | Duree |
|----------|-----------|-------|
| Bouton standard | 0.2 | 60ms |
| Desktop switch | 0.3 | 80ms |
| Double clic | 0.4 | 100ms |
| Touchpad swipe | 0.3 | 80ms |

---

## Dictation

Deux providers :

### Apple Dictation
- Active via le menu Edition de l'app au premier plan (osascript)
- Cherche les items contenant "ictation" ou "ictee" (multi-langue)
- Echap pour arreter

### SuperWhisper
- Active via `Key.RightCmd` (raccourci SuperWhisper)
- LED rose pendant 2 secondes puis retour cyan

---

## Profils

### Structure config.json (v2)

```json
{
  "version": 2,
  "activeProfile": "default",
  "profiles": {
    "default": {
      "mapping": { "cross": "enter", ... },
      "dictationProvider": "superwhisper",
      "settings": { "mouseSpeed": 40 }
    },
    "web": { ... }
  }
}
```

### Migration automatique
Les configs v1 (format plat) sont automatiquement migrees vers v2 au chargement.

### Gestion
- Bouton PS : cycle entre les profils
- UI menubar : dropdown pour switcher, bouton "+" pour creer, "x" pour supprimer
- Le profil "default" ne peut pas etre supprime

---

## Settings configurables

Toutes les constantes sont dans l'objet `settings` et overridables par profil :

| Setting | Defaut | Description |
|---------|--------|-------------|
| `crossDoubleTapMs` | 300 | Fenetre double-tap (ms) |
| `swipeThreshold` | 0.4 | Seuil swipe touchpad |
| `swipeCooldownMs` | 600 | Cooldown swipe (ms) |
| `desktopSwitchThreshold` | 0.85 | Seuil desktop switch sticks |
| `desktopSwitchCooldown` | 600 | Cooldown desktop switch (ms) |
| `repeatDelay` | 400 | Delai avant repetition (ms) |
| `repeatInterval` | 50 | Intervalle repetition (ms) |
| `mouseSpeed` | 30 | Vitesse curseur max (px/tick) |
| `mouseAccel` | 2.5 | Exposant courbe acceleration |
| `mouseDeadzone` | 0.15 | Deadzone stick souris |
| `mouseTick` | 16 | Polling interval (ms) |
| `mouseSpeedMin` | 0.8 | Multiplicateur vitesse initial |
| `mouseSpeedMax` | 1.2 | Multiplicateur vitesse max |
| `mouseRampMs` | 500 | Duree rampe acceleration (ms) |
| `scrollTiers` | [{0.25,2},{0.50,8},{0.85,25}] | Tiers de scroll |
| `scrollHysteresis` | 0.05 | Marge hysteresis |
| `doubleTapMs` | 250 | Fenetre double-tap generique (ms) |
| `triggerScrollMax` | 15 | Scroll max trigger analogique |

---

## Communication IPC

### Main → Renderer (menubar)

| Event | Payload | Description |
|-------|---------|-------------|
| `state` | `{ connected, mapping, actions, buttonLabels, dictationProvider, profiles, activeProfile }` | Etat complet |
| `button-flash` | `buttonId` | Flash visuel bouton |
| `config-error` | `message` | Erreur de sauvegarde config |

### Main → Game

| Event | Payload | Description |
|-------|---------|-------------|
| `game-input` | `{ buttonId, held, stickX, stickY, rStickX, rStickY, l2Pressure, r2Pressure }` | Input controller |
| `game-swipe` | `{ dir: "left"|"right" }` | Swipe touchpad detecte |

### Renderer → Main

| Event | Payload | Description |
|-------|---------|-------------|
| `update-mapping` | `{ buttonId, actionId }` | Changer le mapping d'un bouton |
| `reset-mapping` | - | Reset mapping par defaut |
| `update-dictation-provider` | `"apple"|"superwhisper"` | Changer le provider |
| `switch-profile` | `name` | Changer de profil |
| `create-profile` | `name` | Creer un profil |
| `delete-profile` | `name` | Supprimer un profil |
| `rename-profile` | `{ oldName, newName }` | Renommer un profil |
| `request-state` | - | Demander l'etat |
| `quit-app` | - | Quitter |
| `open-game` | - | Ouvrir le training game |

---

## Training game

60 challenges repartis en categories :

| Categorie | Exemples |
|-----------|----------|
| Boutons simples | X, O, Carre, Triangle (sans modifier) |
| D-pad | Haut, bas, gauche, droite |
| Petits boutons | Options, Create, Mute, Touchpad, L3, R3 |
| Combos square | R1+Carre, R2+Carre, L2+R2+Carre |
| Combos cross | R1+X, R2+X |
| Combos triangle | L1+Triangle, R1+Triangle, R2+Triangle |
| Sticks | Gauche/droite/haut/bas chaque stick, les deux sticks |
| Scroll | Stick droit haut/bas |
| Triggers analogiques | L2 doux, L2 a fond, R2 doux, R2 a fond |
| Touchpad swipe | Swipe gauche, swipe droite |

20 challenges tires au hasard par round. Score + streak affiches.
