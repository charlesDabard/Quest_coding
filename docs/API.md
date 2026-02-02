# API Reference — Quest

## Mapping des boutons

Le mapping est defini dans `main.js` > `initController()`.

### Boutons actuels

```js
controller.dpad.up.on("press", () => pressKey(Key.Up));
controller.dpad.down.on("press", () => pressKey(Key.Down));
controller.dpad.left.on("press", () => pressKey(Key.Left));
controller.dpad.right.on("press", () => pressKey(Key.Right));
controller.cross.on("press", () => pressKey(Key.Return));
controller.square.on("press", () => pressCombo(Key.LeftAlt, Key.Backspace));
controller.circle.on("press", () => toggleDictation());
```

### Boutons disponibles (non mappes)

| Bouton | Propriete `dualsense-ts` |
|---|---|
| Triangle | `controller.triangle` |
| L1 (bumper gauche) | `controller.left.bumper` |
| R1 (bumper droit) | `controller.right.bumper` |
| L2 (gachette gauche) | `controller.left.trigger` |
| R2 (gachette droite) | `controller.right.trigger` |
| Stick gauche (clic) | `controller.left.analog.button` |
| Stick droit (clic) | `controller.right.analog.button` |
| PS | `controller.ps` |
| Options | `controller.options` |
| Create | `controller.create` |
| Mute | `controller.mute` |
| Touchpad (clic) | `controller.touchpad.button` |

### Sticks analogiques

```js
// Valeurs de -1.0 a 1.0
controller.left.analog.x.on("change", (input) => {
  console.log("Stick gauche X:", input.state);
});

controller.left.analog.y.on("change", (input) => {
  console.log("Stick gauche Y:", input.state);
});
```

### Gachettes (pression analogique)

```js
controller.left.trigger.on("change", (input) => {
  console.log("L2 pression:", input.pressure); // 0.0 a 1.0
});
```

## Fonctions utilitaires

### `pressKey(key)`

Simule l'appui et le relachement d'une touche.

```js
await pressKey(Key.Escape);
await pressKey(Key.Space);
await pressKey(Key.Tab);
```

### `pressCombo(...keys)`

Simule un raccourci clavier (press toutes les touches, puis release en ordre inverse).

```js
// Cmd+Z (annuler)
await pressCombo(Key.LeftCmd, Key.Z);

// Cmd+Shift+Z (retablir)
await pressCombo(Key.LeftCmd, Key.LeftShift, Key.Z);

// Ctrl+C (copier)
await pressCombo(Key.LeftControl, Key.C);
```

### `toggleDictation()`

Lance ou arrete la dictee macOS via le menu Edition de l'app au premier plan.

## Touches disponibles (nut-js)

Les touches les plus courantes :

| Categorie | Touches |
|---|---|
| Lettres | `Key.A` ... `Key.Z` |
| Chiffres | `Key.Num0` ... `Key.Num9` |
| Fleches | `Key.Up`, `Key.Down`, `Key.Left`, `Key.Right` |
| Modifieurs | `Key.LeftCmd`, `Key.LeftAlt`, `Key.LeftShift`, `Key.LeftControl` |
| Special | `Key.Return`, `Key.Space`, `Key.Tab`, `Key.Escape`, `Key.Backspace`, `Key.Delete` |
| Fonction | `Key.F1` ... `Key.F12` |

## Communication IPC

### Main -> Renderer

```js
// Envoie le statut de connexion
mb.window.webContents.send("controller-status", {
  connected: true  // ou false
});
```

### Renderer -> Main

```js
// Demande la fermeture de l'app
ipcRenderer.send("quit-app");
```
