const { app, BrowserWindow, ipcMain } = require("electron");
const { menubar } = require("menubar");
const { Dualsense } = require("dualsense-ts");
const { keyboard, Key, mouse, Button } = require("@nut-tree-fork/nut-js");
const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");

keyboard.config.autoDelayMs = 0;

// ─── Action catalogue ────────────────────────────────────────────────────────
const ACTIONS = {
  // Navigation
  arrow_up:      { label: "Fleche haut",              cat: "Navigation",  keys: [Key.Up] },
  arrow_down:    { label: "Fleche bas",               cat: "Navigation",  keys: [Key.Down] },
  arrow_left:    { label: "Fleche gauche",            cat: "Navigation",  keys: [Key.Left] },
  arrow_right:   { label: "Fleche droite",            cat: "Navigation",  keys: [Key.Right] },
  scroll_up:     { label: "Scroll haut (PgUp)",       cat: "Navigation",  keys: [Key.PageUp] },
  scroll_down:   { label: "Scroll bas (PgDown)",      cat: "Navigation",  keys: [Key.PageDown] },
  home:          { label: "Debut de ligne (Home)",     cat: "Navigation",  keys: [Key.LeftCmd, Key.Left] },
  end:           { label: "Fin de ligne (End)",        cat: "Navigation",  keys: [Key.LeftCmd, Key.Right] },
  top:           { label: "Debut du doc (Cmd+Up)",     cat: "Navigation",  keys: [Key.LeftCmd, Key.Up] },
  bottom:        { label: "Fin du doc (Cmd+Down)",     cat: "Navigation",  keys: [Key.LeftCmd, Key.Down] },
  word_left:     { label: "Mot precedent (Opt+Left)",  cat: "Navigation",  keys: [Key.LeftAlt, Key.Left] },
  word_right:    { label: "Mot suivant (Opt+Right)",   cat: "Navigation",  keys: [Key.LeftAlt, Key.Right] },

  // Validation & saisie
  enter:         { label: "Entree / Valider",         cat: "Saisie",      keys: [Key.Return] },
  escape:        { label: "Echap / Annuler",          cat: "Saisie",      keys: [Key.Escape] },
  tab:           { label: "Tab / Completion",          cat: "Saisie",      keys: [Key.Tab] },
  shift_tab:     { label: "Shift+Tab (switch mode)",   cat: "Saisie",      keys: [Key.LeftShift, Key.Tab] },
  space:         { label: "Espace",                   cat: "Saisie",      keys: [Key.Space] },
  backspace:     { label: "Backspace",                cat: "Saisie",      keys: [Key.Backspace] },

  // Edition
  delete_word:   { label: "Suppr. dernier mot",       cat: "Edition",     keys: [Key.LeftControl, Key.W] },
  delete_line:   { label: "Suppr. ligne",             cat: "Edition",     keys: [Key.LeftCmd, Key.Backspace] },
  copy:          { label: "Copier (Cmd+C)",           cat: "Edition",     keys: [Key.LeftCmd, Key.C] },
  paste:         { label: "Coller (Cmd+V)",           cat: "Edition",     keys: [Key.LeftCmd, Key.V] },
  cut:           { label: "Couper (Cmd+X)",           cat: "Edition",     keys: [Key.LeftCmd, Key.X] },
  undo:          { label: "Annuler (Cmd+Z)",          cat: "Edition",     keys: [Key.LeftCmd, Key.Z] },
  redo:          { label: "Retablir (Cmd+Shift+Z)",   cat: "Edition",     keys: [Key.LeftCmd, Key.LeftShift, Key.Z] },
  select_all:    { label: "Tout select. (Cmd+A)",     cat: "Edition",     keys: [Key.LeftCmd, Key.A] },
  select_line:   { label: "Select. ligne (Cmd+Shift+K)", cat: "Edition",  keys: [Key.LeftCmd, Key.LeftShift, Key.K] },

  // Terminal / Claude Code
  ctrl_c:        { label: "Interrompre (Ctrl+C)",     cat: "Terminal",    keys: [Key.LeftControl, Key.C] },
  ctrl_d:        { label: "EOF / Quitter (Ctrl+D)",    cat: "Terminal",    keys: [Key.LeftControl, Key.D] },
  ctrl_l:        { label: "Clear terminal (Ctrl+L)",   cat: "Terminal",    keys: [Key.LeftControl, Key.L] },
  ctrl_r:        { label: "Historique (Ctrl+R)",       cat: "Terminal",    keys: [Key.LeftControl, Key.R] },
  ctrl_z:        { label: "Suspendre (Ctrl+Z)",        cat: "Terminal",    keys: [Key.LeftControl, Key.Z] },

  // Systeme
  switch_app:    { label: "Changer app (Cmd+Tab)",    cat: "Systeme",     keys: [Key.LeftCmd, Key.Tab] },
  close_window:  { label: "Fermer fenetre (Cmd+W)",   cat: "Systeme",     keys: [Key.LeftCmd, Key.W] },
  minimize:      { label: "Minimiser (Cmd+M)",        cat: "Systeme",     keys: [Key.LeftCmd, Key.M] },
  spotlight:     { label: "Spotlight (Cmd+Space)",     cat: "Systeme",     keys: [Key.LeftCmd, Key.Space] },
  screenshot:    { label: "Capture ecran (Cmd+Shift+4)", cat: "Systeme",  keys: [Key.LeftCmd, Key.LeftShift, Key.Num4] },
  finder:        { label: "Ouvrir Finder (Cmd+Opt+Space)", cat: "Systeme", keys: [Key.LeftCmd, Key.LeftAlt, Key.Space] },
  new_tab:       { label: "Nouvel onglet (Cmd+T)",    cat: "Systeme",     keys: [Key.LeftCmd, Key.T] },
  close_tab:     { label: "Fermer onglet (Cmd+W)",    cat: "Systeme",     keys: [Key.LeftCmd, Key.W] },
  next_tab:      { label: "Onglet suivant (Ctrl+Tab)", cat: "Systeme",    keys: [Key.LeftControl, Key.Tab] },
  prev_tab:      { label: "Onglet prec. (Ctrl+Shift+Tab)", cat: "Systeme", keys: [Key.LeftControl, Key.LeftShift, Key.Tab] },
  save:          { label: "Sauvegarder (Cmd+S)",      cat: "Systeme",     keys: [Key.LeftCmd, Key.S] },
  find:          { label: "Rechercher (Cmd+F)",        cat: "Systeme",     keys: [Key.LeftCmd, Key.F] },
  left_cmd:      { label: "Left Command",              cat: "Systeme",     keys: [Key.LeftCmd] },
  desktop_left:  { label: "Bureau gauche",  cat: "Systeme",     special: "desktop_left" },
  desktop_right: { label: "Bureau droite", cat: "Systeme",     special: "desktop_right" },

  // Special
  dictation:         { label: "Dictee vocale",            cat: "Special",     special: "dictation" },
  select_all_delete: { label: "Tout supprimer",           cat: "Special",     special: "select_all_delete" },
  mouse_click:       { label: "Clic souris gauche",       cat: "Special",     special: "mouse_click" },
  mouse_right_click: { label: "Clic souris droit",        cat: "Special",     special: "mouse_right_click" },
  selection_mode:    { label: "Selection (Shift maintenu)", cat: "Special",   special: "selection_mode" },
  none:              { label: "Aucune action",            cat: "Special",     keys: [] },
};

// ─── Default mapping (Claude Code oriented) ──────────────────────────────────
const DEFAULT_MAPPING = {
  dpad_up: "arrow_up",    dpad_down: "arrow_down",
  dpad_left: "arrow_left", dpad_right: "arrow_right",
  cross: "enter",            circle: "dictation",
  square: "backspace",     triangle: "shift_tab",
  l1: "undo",              r1: "redo",
  l2: "scroll_up",         r2: "scroll_down",
  l3: "copy",              r3: "paste",
  options: "tab",           create: "ctrl_c",
  mute: "escape",          touchpad: "switch_app",
};

const BUTTON_LABELS = {
  dpad_up: "D-pad haut",       dpad_down: "D-pad bas",
  dpad_left: "D-pad gauche",   dpad_right: "D-pad droite",
  cross: "Croix (X)",          circle: "Rond (O)",
  square: "Carre ([])",        triangle: "Triangle",
  l1: "L1",                    r1: "R1",
  l2: "L2",                    r2: "R2",
  l3: "L3 (stick clic)",      r3: "R3 (stick clic)",
  options: "Options",           create: "Create",
  mute: "Mute",                touchpad: "Touchpad",
};

// ─── Combo system (modifier buttons held + action button) ────────────────────
const MODIFIER_BUTTONS = ["l1", "r1", "l2", "r2"];

const COMBOS = {
  square: [
    { held: ["l2", "r2"], action: "select_all_delete" },  // L2+R2+□ → tout supprimer
    { held: ["r2"],       action: "delete_line" },         // R2+□ → suppr. ligne
    { held: ["r1"],       action: "delete_word" },         // R1+□ → suppr. mot
  ],
  cross: [
    { held: ["r2"],       action: "selection_mode" },       // R2+X → selection (Shift held)
    { held: ["r1"],       action: "selection_mode" },          // R1+X → maintien clic gauche
  ],
  triangle: [
    { held: ["r1"],       action: "escape" },                // R1+△ → Echap
    { held: ["r2"],       action: "spotlight" },              // R2+△ → Cmd+Space (Spotlight)
  ],
};

// ─── State ───────────────────────────────────────────────────────────────────
let mb, controller;
let connected = false;
let dictationBusy = false;
let dictationActive = false;
let mapping = { ...DEFAULT_MAPPING };
let dictationProvider = "apple";  // "apple" | "superwhisper"

// Modifier held state
const held = { l1: false, r1: false, l2: false, r2: false };
let usedAsModifier = { l1: false, r1: false, l2: false, r2: false };
let selectionMode = false;  // true when mouse button is held for drag-select (R2+X)
let desktopSwitchCooldown = 0;  // timestamp until next desktop switch allowed
const DESKTOP_SWITCH_THRESHOLD = 0.85;  // both sticks must be past this
const DESKTOP_SWITCH_COOLDOWN = 600;    // ms between switches

// Hold-to-repeat: emulate keyboard repeat with setInterval
const REPEAT_DELAY = 400;     // ms before repeat starts
const REPEAT_INTERVAL = 50;   // ms between each repeat
const buttonRepeatTimers = {}; // buttonId -> { delay, interval }

// Mouse control via left stick
const MOUSE_SPEED = 30;       // max pixels per tick at full deflection
const MOUSE_ACCEL = 2.5;      // acceleration curve exponent
const MOUSE_DEADZONE = 0.15;  // ignore small stick drift
const MOUSE_TICK = 16;        // ~60fps
let stickX = 0, stickY = 0;
let stickActiveStart = 0;     // timestamp when stick first moved
const MOUSE_SPEED_MIN = 0.8;  // initial speed multiplier
const MOUSE_SPEED_MAX = 1.2;  // full speed multiplier after ramp
const MOUSE_RAMP_MS = 500;    // ms to go from min to max
let rStickX = 0, rStickY = 0;
let mouseLoopId = null;
// Scroll: 3 speed tiers based on stick deflection
const SCROLL_TIERS = [
  { threshold: 0.25, speed: 2 },   // slight tilt → slow (higher deadzone to avoid drift)
  { threshold: 0.50, speed: 8 },   // medium tilt → fast
  { threshold: 0.85, speed: 25 },  // full tilt → very fast
];

// Double-tap detection
const DOUBLE_TAP_MS = 250;
const doubleTapTimers = {};    // buttonId -> timeout

const CONFIG_PATH = path.join(__dirname, "config.json");

// ─── Config persistence ──────────────────────────────────────────────────────
function loadConfig() {
  try {
    if (fs.existsSync(CONFIG_PATH)) {
      const data = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8"));
      if (data.mapping) mapping = { ...DEFAULT_MAPPING, ...data.mapping };
      if (data.dictationProvider) dictationProvider = data.dictationProvider;
    }
  } catch (err) {
    console.error("Config load error:", err.message);
  }
}

function saveConfig() {
  try {
    fs.writeFileSync(CONFIG_PATH, JSON.stringify({ mapping, dictationProvider }, null, 2) + "\n");
  } catch (err) {
    console.error("Config save error:", err.message);
  }
}

// ─── Menubar ─────────────────────────────────────────────────────────────────
function createMenubar() {
  mb = menubar({
    index: `file://${path.join(__dirname, "index.html")}`,
    icon: path.join(__dirname, "assets", "iconTemplate.png"),
    browserWindow: {
      width: 380,
      height: 560,
      webPreferences: { nodeIntegration: true, contextIsolation: false },
    },
    preloadWindow: true,
  });

  mb.on("ready", () => {
    console.log("Menubar ready");
    app.dock.hide();
    loadConfig();
    initController();

    // Fix: bypass buggy menubar click handler (clearInterval vs clearTimeout bug)
    mb.tray.removeAllListeners("click");
    mb.tray.on("click", () => {
      if (mb.window && mb.window.isVisible()) {
        mb.hideWindow();
      } else {
        mb.showWindow();
      }
    });
  });

  mb.on("after-create-window", () => sendState());
}

function sendState() {
  if (!mb.window || mb.window.isDestroyed()) return;
  const actionList = {};
  for (const [id, a] of Object.entries(ACTIONS)) {
    actionList[id] = { label: a.label, cat: a.cat };
  }
  mb.window.webContents.send("state", {
    connected, mapping, actions: actionList, buttonLabels: BUTTON_LABELS, dictationProvider,
  });
}

// ─── Controller ──────────────────────────────────────────────────────────────
function initController() {
  controller = new Dualsense();

  controller.connection.on("change", ({ active }) => {
    connected = active;
    console.log(active ? "Controller connected" : "Controller disconnected");
    sendState();
  });

  const bindings = {
    dpad_up: controller.dpad.up,       dpad_down: controller.dpad.down,
    dpad_left: controller.dpad.left,   dpad_right: controller.dpad.right,
    cross: controller.cross,           circle: controller.circle,
    square: controller.square,         triangle: controller.triangle,
    l1: controller.left.bumper,        r1: controller.right.bumper,
    l2: controller.left.trigger,       r2: controller.right.trigger,
    l3: controller.left.analog.button, r3: controller.right.analog.button,
    options: controller.options,        create: controller.create,
    mute: controller.mute,             touchpad: controller.touchpad.button,
  };

  for (const [buttonId, input] of Object.entries(bindings)) {
    if (MODIFIER_BUTTONS.includes(buttonId)) {
      // Modifiers: track held state, fire action only on release if not used as modifier
      input.on("press", () => {
        held[buttonId] = true;
        usedAsModifier[buttonId] = false;
        console.log(`Modifier held: ${buttonId}`);
      });
      input.on("release", () => {
        held[buttonId] = false;
        // End selection mode if R1 or R2 is released while selecting
        if ((buttonId === "r1" || buttonId === "r2") && selectionMode) {
          selectionMode = false;
          mouse.releaseButton(Button.LEFT).catch((e) => console.error("Mouse release error:", e.message));
          console.log(`Selection mode OFF (${buttonId} released)`);
        }
        if (!usedAsModifier[buttonId]) {
          // Was not used as modifier → fire its own mapped action
          handleButton(buttonId);
        }
        usedAsModifier[buttonId] = false;
      });
    } else {
      input.on("press", () => handleButtonPress(buttonId));
      input.on("release", () => handleButtonRelease(buttonId));
    }
  }

  // ── Left stick → mouse cursor ──
  controller.left.analog.x.on("change", (input) => { stickX = input.state; });
  controller.left.analog.y.on("change", (input) => { stickY = input.state; });

  // ── Right stick → scroll ──
  controller.right.analog.x.on("change", (input) => { rStickX = input.state; });
  controller.right.analog.y.on("change", (input) => { rStickY = input.state; });

  startMouseLoop();
}

function startMouseLoop() {
  mouseLoopId = setInterval(async () => {
    // ── Left stick → mouse cursor ──
    const ax = Math.abs(stickX) < MOUSE_DEADZONE ? 0 : stickX;
    const ay = Math.abs(stickY) < MOUSE_DEADZONE ? 0 : stickY;
    if (ax !== 0 || ay !== 0) {
      const now = Date.now();
      if (stickActiveStart === 0) stickActiveStart = now;
      const elapsed = now - stickActiveStart;
      const ramp = Math.min(elapsed / MOUSE_RAMP_MS, 1);
      const timeMult = MOUSE_SPEED_MIN + ramp * (MOUSE_SPEED_MAX - MOUSE_SPEED_MIN);
      const boost = held.r1 ? 2 : 1;
      const accel = (v) => Math.sign(v) * Math.pow(Math.abs(v), MOUSE_ACCEL) * MOUSE_SPEED * timeMult * boost;
      try {
        const pos = await mouse.getPosition();
        const nx = pos.x + Math.round(accel(ax));
        const ny = pos.y - Math.round(accel(ay));
        await mouse.setPosition({ x: nx, y: ny });
      } catch (err) {
        console.error("Mouse error:", err.message);
      }
    } else {
      stickActiveStart = 0;  // reset ramp when stick is idle
    }

    // ── Right stick → scroll (3 tiers) ──
    const scrollVal = (raw) => {
      const abs = Math.abs(raw);
      if (abs < SCROLL_TIERS[0].threshold) return 0;
      const boost = held.r1 ? 2 : 1;
      let speed = SCROLL_TIERS[0].speed;
      for (const tier of SCROLL_TIERS) {
        if (abs >= tier.threshold) speed = tier.speed;
      }
      return Math.sign(raw) * speed * boost;
    };
    const dy = scrollVal(rStickY);
    const dx = scrollVal(rStickX);
    if (dy !== 0 || dx !== 0) {
      try {
        if (dy > 0) await mouse.scrollUp(dy);
        else if (dy < 0) await mouse.scrollDown(-dy);
        if (dx > 0) await mouse.scrollRight(dx);
        else if (dx < 0) await mouse.scrollLeft(-dx);
      } catch (err) {
        console.error("Scroll error:", err.message);
      }
    }

    // ── Both sticks far left/right → switch desktop ──
    const now2 = Date.now();
    if (now2 > desktopSwitchCooldown) {
      if (stickX < -DESKTOP_SWITCH_THRESHOLD && rStickX < -DESKTOP_SWITCH_THRESHOLD) {
        desktopSwitchCooldown = now2 + DESKTOP_SWITCH_COOLDOWN;
        fireSpecial(ACTIONS.desktop_left);
        console.log("Desktop switch: LEFT");
      } else if (stickX > DESKTOP_SWITCH_THRESHOLD && rStickX > DESKTOP_SWITCH_THRESHOLD) {
        desktopSwitchCooldown = now2 + DESKTOP_SWITCH_COOLDOWN;
        fireSpecial(ACTIONS.desktop_right);
        console.log("Desktop switch: RIGHT");
      }
    }
  }, MOUSE_TICK);
}

function resolveAction(buttonId) {
  // Check combos first
  if (COMBOS[buttonId]) {
    for (const combo of COMBOS[buttonId]) {
      if (combo.held.every((m) => held[m])) {
        for (const m of combo.held) usedAsModifier[m] = true;
        console.log(`Combo: ${combo.held.join("+")}+${buttonId} -> ${combo.action}`);
        return ACTIONS[combo.action] || null;
      }
    }
  }
  // Fallback to normal mapping
  const actionId = mapping[buttonId];
  if (!actionId || actionId === "none") return null;
  return ACTIONS[actionId] || null;
}

// ─── Keyboard simulation ────────────────────────────────────────────────────
async function fireKeys(keys) {
  try {
    if (keys.length === 1) {
      await keyboard.pressKey(keys[0]);
      await keyboard.releaseKey(keys[0]);
    } else {
      for (const k of keys) await keyboard.pressKey(k);
      for (const k of [...keys].reverse()) await keyboard.releaseKey(k);
    }
  } catch (err) {
    console.error("Key error:", err.message);
  }
}

function fireSpecial(action) {
  if (action.special === "dictation") {
    toggleDictation();
  } else if (action.special === "select_all_delete") {
    console.log(">>> select_all_delete triggered");
    (async () => {
      await fireKeys([Key.LeftCmd, Key.A]);
      await new Promise((r) => setTimeout(r, 150));
      await fireKeys([Key.Backspace]);
      console.log(">>> select_all_delete done");
    })();
  } else if (action.special === "mouse_click") {
    mouse.leftClick().catch((e) => console.error("Mouse click error:", e.message));
  } else if (action.special === "mouse_right_click") {
    mouse.rightClick().catch((e) => console.error("Mouse right click error:", e.message));
  } else if (action.special === "selection_mode") {
    if (!selectionMode) {
      selectionMode = true;
      mouse.pressButton(Button.LEFT).catch((e) => console.error("Mouse press error:", e.message));
      console.log("Selection mode ON (mouse button held)");
    }
  } else if (action.special === "desktop_left") {
    exec("osascript -e 'tell application \"System Events\" to key code 123 using control down'");
  } else if (action.special === "desktop_right") {
    exec("osascript -e 'tell application \"System Events\" to key code 124 using control down'");
  }
}

// Called when modifier is released without being used as modifier (one-shot)
function handleButton(buttonId) {
  console.log(`Button: ${buttonId}`);
  const action = resolveAction(buttonId);
  if (!action) return;

  if (mb.window && !mb.window.isDestroyed()) {
    mb.window.webContents.send("button-flash", buttonId);
  }

  if (action.special) {
    fireSpecial(action);
  } else if (action.keys && action.keys.length > 0) {
    fireKeys(action.keys);
  }
}

// Called on button press — fires once then starts auto-repeat
function handleButtonPress(buttonId) {
  console.log(`Button press: ${buttonId}`);
  const action = resolveAction(buttonId);
  if (!action) return;

  if (mb.window && !mb.window.isDestroyed()) {
    mb.window.webContents.send("button-flash", buttonId);
  }

  // Double-tap detection: if action has doubleTap, delay first tap
  if (action.doubleTap) {
    if (doubleTapTimers[buttonId]) {
      // Second tap arrived → fire doubleTap action (Enter)
      clearTimeout(doubleTapTimers[buttonId]);
      delete doubleTapTimers[buttonId];
      const dtAction = ACTIONS[action.doubleTap];
      if (dtAction) {
        if (dtAction.keys && dtAction.keys.length > 0) fireKeys(dtAction.keys);
        else if (dtAction.special) fireSpecial(dtAction);
      }
      console.log(`Double-tap: ${buttonId} -> ${action.doubleTap}`);
    } else {
      // First tap → wait for possible second tap
      doubleTapTimers[buttonId] = setTimeout(() => {
        delete doubleTapTimers[buttonId];
        fireSpecial(action);
        console.log(`Single-tap: ${buttonId} -> ${action.special}`);
      }, DOUBLE_TAP_MS);
    }
    return;
  }

  // Special actions: one-shot, no repeat
  if (action.special) {
    fireSpecial(action);
    return;
  }

  if (!action.keys || action.keys.length === 0) return;

  // Fire once immediately
  fireKeys(action.keys);

  // Start repeat after initial delay
  const delay = setTimeout(() => {
    const interval = setInterval(() => fireKeys(action.keys), REPEAT_INTERVAL);
    buttonRepeatTimers[buttonId] = { delay: null, interval };
  }, REPEAT_DELAY);

  buttonRepeatTimers[buttonId] = { delay, interval: null };
}

// Called on button release — stops repeat
function handleButtonRelease(buttonId) {
  // End selection mode when cross is released
  if (buttonId === "cross" && selectionMode) {
    selectionMode = false;
    mouse.releaseButton(Button.LEFT).catch((e) => console.error("Mouse release error:", e.message));
    console.log("Selection mode OFF (mouse button released)");
  }

  const timers = buttonRepeatTimers[buttonId];
  if (!timers) return;
  if (timers.delay) clearTimeout(timers.delay);
  if (timers.interval) clearInterval(timers.interval);
  delete buttonRepeatTimers[buttonId];
}

// ─── Dictation ──────────────────────────────────────────────────────────────
async function toggleDictation() {
  if (dictationBusy) return;
  dictationBusy = true;

  if (dictationActive) {
    await fireKeys([Key.Escape]);
    dictationActive = false;
    dictationBusy = false;
    console.log("Dictation: stopped");
    return;
  }

  if (dictationProvider === "superwhisper") {
    await fireKeys([Key.RightCmd]);
    dictationBusy = false;
    console.log("Dictation: SuperWhisper triggered (Right Cmd)");
    return;
  }

  // Apple Dictation via menu
  if (mb.window && mb.window.isVisible()) mb.hideWindow();

  setTimeout(() => {
    const script = `osascript -e '
      tell application "System Events"
        tell (first process whose frontmost is true)
          set menuNames to name of every menu of menu bar 1
          repeat with menuName in menuNames
            if menuName contains "dit" then
              set menuItems to name of every menu item of menu menuName of menu bar 1
              repeat with itemName in menuItems
                if itemName contains "ictation" or itemName contains "ictée" then
                  click menu item itemName of menu menuName of menu bar 1
                  return "OK"
                end if
              end repeat
            end if
          end repeat
        end tell
      end tell
      return "FAIL"'`;
    exec(script, (err, stdout) => {
      dictationBusy = false;
      if (!err && stdout.trim() === "OK") {
        dictationActive = true;
        console.log("Dictation: Apple started");
      } else {
        console.error("Dictation: no menu item found");
      }
    });
  }, 150);
}

// ─── IPC ────────────────────────────────────────────────────────────────────
ipcMain.on("update-mapping", (_event, { buttonId, actionId }) => {
  if (ACTIONS[actionId] && BUTTON_LABELS[buttonId]) {
    mapping[buttonId] = actionId;
    saveConfig();
    console.log(`Mapping: ${buttonId} -> ${actionId}`);
    sendState();
  }
});

ipcMain.on("reset-mapping", () => {
  mapping = { ...DEFAULT_MAPPING };
  saveConfig();
  console.log("Mapping: reset to defaults");
  sendState();
});

ipcMain.on("update-dictation-provider", (_event, provider) => {
  if (provider === "apple" || provider === "superwhisper") {
    dictationProvider = provider;
    saveConfig();
    console.log(`Dictation provider: ${provider}`);
    sendState();
  }
});

ipcMain.on("request-state", () => sendState());
ipcMain.on("quit-app", () => app.quit());

// ─── App lifecycle ──────────────────────────────────────────────────────────
app.commandLine.appendSwitch("disable-backgrounding-occluded-windows", "true");
app.on("ready", createMenubar);
app.on("window-all-closed", (e) => e.preventDefault());
