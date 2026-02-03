const { app, BrowserWindow, ipcMain, screen } = require("electron");
const { menubar } = require("menubar");
const { Dualsense } = require("dualsense-ts");
const { keyboard, Key, mouse, Button } = require("@nut-tree-fork/nut-js");
const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");
const { mergeSettings, migrateConfig, resolveScrollTier } = require("./lib/logic");

// When launched via `open Electron.app --args /path/to/quest`, chdir to project root
const extraArgs = process.argv.slice(2).filter((a) => !a.startsWith("-"));
if (extraArgs.length > 0 && fs.existsSync(extraArgs[0])) {
  process.chdir(extraArgs[0]);
}

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
  cycle_profile:     { label: "Profil suivant",           cat: "Special",     special: "cycle_profile" },
  dictation:         { label: "Dictee vocale",            cat: "Special",     special: "dictation" },
  select_all_delete: { label: "Tout supprimer",           cat: "Special",     special: "select_all_delete" },
  mouse_click:       { label: "Clic souris gauche",       cat: "Special",     special: "mouse_click" },
  mouse_right_click: { label: "Clic souris droit",        cat: "Special",     special: "mouse_right_click" },
  mouse_double_click: { label: "Double clic souris",      cat: "Special",     special: "mouse_double_click" },
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
  mute: "escape",          touchpad: "ctrl_c",
  ps: "cycle_profile",
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
  ps: "PS",
};

// ─── Combo system (modifier buttons held + action button) ────────────────────
const MODIFIER_BUTTONS = ["l1", "r1", "l2", "r2"];

const COMBOS = {
  square: [
    { held: ["l2", "r2"], action: "select_all_delete" },  // L2+R2+□ → tout supprimer
    { held: ["r2"],       action: "delete_line" },         // R2+□ → suppr. ligne
    { held: ["r1"],       action: "delete_word" },         // R1+□ → suppr. mot
    { held: ["l1"],       action: "cut" },                 // L1+□ → Couper (Cmd+X)
  ],
  cross: [
    { held: ["r2"],       action: "selection_mode" },       // R2+X → selection (drag)
    { held: ["r1"],       action: "mouse_click" },          // R1+X → clic gauche (double-tap R1+X = double-clic)
    { held: ["l1"],       action: "mouse_right_click" },    // L1+X → clic droit
  ],
  triangle: [
    { held: ["r1"],       action: "escape" },                // R1+△ → Echap
    { held: ["r2"],       action: "spotlight" },              // R2+△ → Cmd+Space (Spotlight)
    { held: ["l1"],       action: "space" },                  // L1+△ → Espace
  ],
};

// ─── Configurable settings (defaults + user overrides from config.json) ──────
const DEFAULTS = {
  crossDoubleTapMs: 300,
  swipeThreshold: 0.4,
  swipeCooldownMs: 600,
  desktopSwitchThreshold: 0.85,
  desktopSwitchCooldown: 600,
  repeatDelay: 400,
  repeatInterval: 50,
  mouseSpeed: 30,
  mouseAccel: 2.5,
  mouseDeadzone: 0.15,
  mouseTick: 16,
  mouseSpeedMin: 0.4,
  mouseSpeedMax: 1.8,
  mouseRampMs: 800,
  scrollTiers: [
    { threshold: 0.25, speed: 2 },
    { threshold: 0.50, speed: 8 },
    { threshold: 0.85, speed: 25 },
  ],
  scrollHysteresis: 0.05,
  triggerScrollMax: 15,
};
let settings = { ...DEFAULTS, scrollTiers: DEFAULTS.scrollTiers.map(t => ({ ...t })) };

// ─── State ───────────────────────────────────────────────────────────────────
let mb, controller, gameWindow;
let connected = false;
let reconnectTimer = null;
let dictationBusy = false;
let dictationActive = false;
let mapping = { ...DEFAULT_MAPPING };
let dictationProvider = "apple";  // "apple" | "superwhisper"

// Profile system
let profiles = {};       // { name: { mapping, dictationProvider, settings } }
let activeProfile = "default";

// Modifier held state
const held = { l1: false, r1: false, l2: false, r2: false };
let usedAsModifier = { l1: false, r1: false, l2: false, r2: false };
let selectionMode = false;  // true when mouse button is held for drag-select (R2+X)
let crossLastPress = 0;      // timestamp of last cross press (for double-tap detection)

// Touchpad swipe detection
let touchStartX = null;
let touchActive = false;
let swipeCooldown = 0;
let desktopSwitchCooldown = 0;  // timestamp until next desktop switch allowed

// Hold-to-repeat
const buttonRepeatTimers = {}; // buttonId -> { delay, interval }

// Mouse control via left stick
let stickX = 0, stickY = 0;
let stickActiveStart = 0;     // timestamp when stick first moved
let rStickX = 0, rStickY = 0;
let mouseLoopId = null;
let mouseActive = false;       // hysteresis: is mouse cursor active?

// Scroll hysteresis state
let scrollTierY = -1;  // current active scroll tier (-1 = idle)
let scrollTierX = -1;

// Analog trigger pressure
let l2Pressure = 0, r2Pressure = 0;
let usedAsAnalog = { l2: false, r2: false };


const CONFIG_PATH = path.join(__dirname, "config.json");

// ─── Config persistence ──────────────────────────────────────────────────────
function loadConfig() {
  try {
    if (!fs.existsSync(CONFIG_PATH)) return;
    let data = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8"));

    // Migrate v1 → v2
    if (!data.version || data.version < 2) {
      data = migrateConfig(data, DEFAULT_MAPPING);
      fs.writeFileSync(CONFIG_PATH, JSON.stringify(data, null, 2) + "\n");
      console.log("Config migrated to v2 (profiles)");
    }

    profiles = data.profiles || {};
    activeProfile = data.activeProfile || "default";

    // Ensure at least a default profile
    if (!profiles[activeProfile]) {
      profiles.default = { mapping: { ...DEFAULT_MAPPING }, dictationProvider: "apple", settings: {} };
      activeProfile = "default";
    }

    applyProfile(activeProfile);
  } catch (err) {
    console.error("Config load error:", err.message);
    // Load defaults on corruption
    profiles = { default: { mapping: { ...DEFAULT_MAPPING }, dictationProvider: "apple", settings: {} } };
    activeProfile = "default";
    applyProfile("default");
    // Notify user after window is ready
    setTimeout(() => {
      if (mb && mb.window && !mb.window.isDestroyed()) {
        mb.window.webContents.send("config-error", "Config corrompue — defaults charges");
      }
    }, 2000);
  }
}

function applyProfile(name) {
  const profile = profiles[name];
  if (!profile) return;
  activeProfile = name;
  mapping = { ...DEFAULT_MAPPING, ...profile.mapping };
  dictationProvider = profile.dictationProvider || "apple";
  settings = mergeSettings(DEFAULTS, profile.settings);
}

function saveConfig() {
  try {
    // Sync current state back into profile
    profiles[activeProfile] = { mapping: { ...mapping }, dictationProvider, settings: { ...settings, scrollTiers: settings.scrollTiers.map(t => ({ ...t })) } };
    const data = { version: 2, activeProfile, profiles };
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(data, null, 2) + "\n");
  } catch (err) {
    console.error("Config save error:", err.message);
    if (mb && mb.window && !mb.window.isDestroyed()) {
      mb.window.webContents.send("config-error", err.message);
    }
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

// ─── Haptic feedback ────────────────────────────────────────────────────────
function rumbleTap(intensity = 0.3, duration = 80) {
  try {
    controller.rumble(intensity);
    setTimeout(() => controller.rumble(0), duration);
  } catch (err) {
    console.error("Rumble error:", err.message);
  }
}

function setLedColor(r, g, b) {
  try {
    // Access low-level HID command to set touchpad LED RGB
    if (controller.hid && controller.hid.command) {
      controller.hid.command[45] = r;
      controller.hid.command[46] = g;
      controller.hid.command[47] = b;
      controller.hid.sendCommand();
    }
  } catch (err) {
    console.error("LED error:", err.message);
  }
}

function sendGameInput(buttonId) {
  if (!gameWindow || gameWindow.isDestroyed()) return;
  gameWindow.webContents.send("game-input", {
    buttonId,
    held: { ...held },
    stickX, stickY, rStickX, rStickY,
    l2Pressure, r2Pressure,
  });
}

function sendGameSwipe(dir) {
  if (!gameWindow || gameWindow.isDestroyed()) return;
  gameWindow.webContents.send("game-swipe", { dir });
}

function sendState() {
  if (!mb.window || mb.window.isDestroyed()) return;
  const actionList = {};
  for (const [id, a] of Object.entries(ACTIONS)) {
    actionList[id] = { label: a.label, cat: a.cat };
  }
  mb.window.webContents.send("state", {
    connected, mapping, actions: actionList, buttonLabels: BUTTON_LABELS, dictationProvider,
    profiles: Object.keys(profiles), activeProfile,
  });
}

// ─── Controller ──────────────────────────────────────────────────────────────
function resetControllerState() {
  held.l1 = false; held.r1 = false; held.l2 = false; held.r2 = false;
  usedAsModifier.l1 = false; usedAsModifier.r1 = false; usedAsModifier.l2 = false; usedAsModifier.r2 = false;
  usedAsAnalog.l2 = false; usedAsAnalog.r2 = false;
  selectionMode = false;
  stickX = 0; stickY = 0; rStickX = 0; rStickY = 0;
  l2Pressure = 0; r2Pressure = 0;
  crossLastPress = 0;
  // Clear all repeat timers
  for (const id of Object.keys(buttonRepeatTimers)) {
    if (buttonRepeatTimers[id].delay) clearTimeout(buttonRepeatTimers[id].delay);
    if (buttonRepeatTimers[id].interval) clearInterval(buttonRepeatTimers[id].interval);
    delete buttonRepeatTimers[id];
  }
}

function cleanupController() {
  if (mouseLoopId) { clearInterval(mouseLoopId); mouseLoopId = null; }
  resetControllerState();
  if (controller) {
    try { controller.hid.provider.disconnect(); } catch (_) {}
    controller = null;
  }
}

function scheduleReconnect() {
  if (reconnectTimer) return;
  console.log("Will attempt reconnection every 3s...");
  reconnectTimer = setInterval(() => {
    console.log("Reconnecting controller...");
    try {
      initController();
      // If we get here without throwing, clear the retry timer
      // Actual connection confirmation comes from the "change" event
    } catch (e) {
      console.log("Reconnect failed:", e.message);
    }
  }, 3000);
}

function initController() {
  // Clean up previous instance if any
  if (controller) cleanupController();
  if (reconnectTimer) { clearInterval(reconnectTimer); reconnectTimer = null; }

  controller = new Dualsense();

  controller.connection.on("change", ({ active }) => {
    connected = active;
    if (active) {
      if (reconnectTimer) { clearInterval(reconnectTimer); reconnectTimer = null; }
      console.log("Controller connected");
      setLedColor(0, 255, 255);  // cyan = normal mode
      if (!mouseLoopId) startMouseLoop();
    } else {
      console.log("Controller disconnected");
      if (mouseLoopId) { clearInterval(mouseLoopId); mouseLoopId = null; }
      resetControllerState();
      scheduleReconnect();
    }
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
    mute: controller.mute,
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
          setLedColor(0, 255, 255);  // back to cyan
          console.log(`Selection mode OFF (${buttonId} released)`);
        }
        const wasAnalog = usedAsAnalog[buttonId] || false;
        if (wasAnalog) usedAsAnalog[buttonId] = false;
        if (!usedAsModifier[buttonId] && !wasAnalog) {
          // Was not used as modifier or analog → fire its own mapped action
          handleButton(buttonId);
        }
        usedAsModifier[buttonId] = false;
      });
    } else {
      input.on("press", () => handleButtonPress(buttonId));
      input.on("release", () => handleButtonRelease(buttonId));
    }
  }

  // ── PS button ──
  controller.ps.on("press", () => handleButtonPress("ps"));
  controller.ps.on("release", () => handleButtonRelease("ps"));

  // ── Left stick → mouse cursor ──
  controller.left.analog.x.on("change", (input) => { stickX = input.state; });
  controller.left.analog.y.on("change", (input) => { stickY = input.state; });

  // ── Right stick → scroll ──
  controller.right.analog.x.on("change", (input) => { rStickX = input.state; });
  controller.right.analog.y.on("change", (input) => { rStickY = input.state; });

  // ── Analog trigger pressure ──
  controller.left.trigger.on("change", (input) => { l2Pressure = input.state; });
  controller.right.trigger.on("change", (input) => { r2Pressure = input.state; });

  // ── Touchpad swipe → switch desktop ──
  controller.touchpad.left.contact.on("press", () => {
    touchStartX = controller.touchpad.left.x.state;
    touchActive = true;
  });
  controller.touchpad.left.contact.on("release", () => {
    if (!touchActive || touchStartX === null) { touchActive = false; return; }
    const now = Date.now();
    if (now < swipeCooldown) { touchActive = false; return; }
    const endX = controller.touchpad.left.x.state;
    const delta = endX - touchStartX;
    if (delta > settings.swipeThreshold) {
      swipeCooldown = now + settings.swipeCooldownMs;
      desktopSwitchCooldown = now + settings.desktopSwitchCooldown;
      fireSpecial(ACTIONS.desktop_right);
      rumbleTap();
      sendGameSwipe("right");
      console.log("Touchpad swipe RIGHT → desktop right");
    } else if (delta < -settings.swipeThreshold) {
      swipeCooldown = now + settings.swipeCooldownMs;
      desktopSwitchCooldown = now + settings.desktopSwitchCooldown;
      fireSpecial(ACTIONS.desktop_left);
      rumbleTap();
      sendGameSwipe("left");
      console.log("Touchpad swipe LEFT → desktop left");
    } else {
      // Tap (no swipe) → fire touchpad mapped action
      handleButtonPress("touchpad");
      handleButtonRelease("touchpad");
      console.log("Touchpad tap → action");
    }
    touchActive = false;
    touchStartX = null;
  });
}

function startMouseLoop() {
  mouseLoopId = setInterval(async () => {
    // ── Left stick → mouse cursor (with deadzone hysteresis) ──
    const dz = settings.mouseDeadzone;
    const dzOff = dz - settings.scrollHysteresis;
    const absX = Math.abs(stickX), absY = Math.abs(stickY);
    if (mouseActive) {
      if (absX < dzOff && absY < dzOff) mouseActive = false;
    } else {
      if (absX >= dz || absY >= dz) mouseActive = true;
    }
    const ax = mouseActive && absX >= dzOff ? stickX : 0;
    const ay = mouseActive && absY >= dzOff ? stickY : 0;
    if (ax !== 0 || ay !== 0) {
      const now = Date.now();
      if (stickActiveStart === 0) stickActiveStart = now;
      const elapsed = now - stickActiveStart;
      const ramp = Math.min(elapsed / settings.mouseRampMs, 1);
      const eased = ramp * ramp;  // ease-in quadratic: slow start, fast finish
      const timeMult = settings.mouseSpeedMin + eased * (settings.mouseSpeedMax - settings.mouseSpeedMin);
      const boost = held.r1 ? 2 : 1;
      const accel = (v) => Math.sign(v) * Math.pow(Math.abs(v), settings.mouseAccel) * settings.mouseSpeed * timeMult * boost;
      try {
        const pos = await mouse.getPosition();
        const displays = screen.getAllDisplays();
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        for (const d of displays) {
          minX = Math.min(minX, d.bounds.x);
          minY = Math.min(minY, d.bounds.y);
          maxX = Math.max(maxX, d.bounds.x + d.bounds.width - 1);
          maxY = Math.max(maxY, d.bounds.y + d.bounds.height - 1);
        }
        const nx = Math.max(minX, Math.min(maxX, pos.x + Math.round(accel(ax))));
        const ny = Math.max(minY, Math.min(maxY, pos.y - Math.round(accel(ay))));
        await mouse.setPosition({ x: nx, y: ny });
      } catch (err) {
        console.error("Mouse error:", err.message);
      }
    } else {
      stickActiveStart = 0;  // reset ramp when stick is idle
    }

    // ── Right stick → scroll (3 tiers with hysteresis) ──
    scrollTierY = resolveScrollTier(Math.abs(rStickY), scrollTierY, settings.scrollTiers, settings.scrollHysteresis);
    scrollTierX = resolveScrollTier(Math.abs(rStickX), scrollTierX, settings.scrollTiers, settings.scrollHysteresis);
    const boost = held.r1 ? 2 : 1;
    const dy = scrollTierY >= 0 ? Math.sign(rStickY) * settings.scrollTiers[scrollTierY].speed * boost : 0;
    const dx = scrollTierX >= 0 ? Math.sign(rStickX) * settings.scrollTiers[scrollTierX].speed * boost : 0;
    const now2 = Date.now();
    if ((dy !== 0 || dx !== 0) && now2 > desktopSwitchCooldown) {
      try {
        if (dy > 0) await mouse.scrollUp(dy);
        else if (dy < 0) await mouse.scrollDown(-dy);
        if (dx > 0) await mouse.scrollRight(dx);
        else if (dx < 0) await mouse.scrollLeft(-dx);
      } catch (err) {
        console.error("Scroll error:", err.message);
      }
    }

    // ── Analog trigger scroll (L2=up, R2=down) ──
    if (now2 > desktopSwitchCooldown) {
      if (held.l2 && !usedAsModifier.l2 && l2Pressure > 0.1) {
        usedAsAnalog.l2 = true;
        const amount = Math.round(l2Pressure * settings.triggerScrollMax);
        if (amount > 0) {
          try { await mouse.scrollUp(amount); } catch (e) { /* ignore */ }
        }
      }
      if (held.r2 && !usedAsModifier.r2 && r2Pressure > 0.1) {
        usedAsAnalog.r2 = true;
        const amount = Math.round(r2Pressure * settings.triggerScrollMax);
        if (amount > 0) {
          try { await mouse.scrollDown(amount); } catch (e) { /* ignore */ }
        }
      }
    }

    // ── Both sticks far left/right → switch desktop ──
    if (now2 > desktopSwitchCooldown) {
      if (stickX < -settings.desktopSwitchThreshold && rStickX < -settings.desktopSwitchThreshold) {
        desktopSwitchCooldown = now2 + settings.desktopSwitchCooldown;
        fireSpecial(ACTIONS.desktop_left);
        rumbleTap(0.3, 80);
        console.log("Desktop switch: LEFT");
      } else if (stickX > settings.desktopSwitchThreshold && rStickX > settings.desktopSwitchThreshold) {
        desktopSwitchCooldown = now2 + settings.desktopSwitchCooldown;
        fireSpecial(ACTIONS.desktop_right);
        rumbleTap(0.3, 80);
        console.log("Desktop switch: RIGHT");
      }
    }

    // ── Send stick data to game ──
    if (gameWindow && !gameWindow.isDestroyed()) {
      const hasStick = Math.abs(stickX) > 0.5 || Math.abs(stickY) > 0.5 ||
                       Math.abs(rStickX) > 0.5 || Math.abs(rStickY) > 0.5;
      const hasTrigger = l2Pressure > 0.1 || r2Pressure > 0.1;
      if (hasStick || hasTrigger) {
        gameWindow.webContents.send("game-input", {
          buttonId: null, held: { ...held },
          stickX, stickY, rStickX, rStickY,
          l2Pressure, r2Pressure,
        });
      }
    }
  }, settings.mouseTick);
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
  if (action.special === "cycle_profile") {
    const names = Object.keys(profiles);
    if (names.length <= 1) return;
    const idx = names.indexOf(activeProfile);
    const next = names[(idx + 1) % names.length];
    saveConfig();
    applyProfile(next);
    saveConfig();
    sendState();
    rumbleTap(0.3, 80);
    console.log(`Profile cycled: ${next}`);
  } else if (action.special === "dictation") {
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
    (async () => {
      try {
        await mouse.pressButton(Button.RIGHT);
        await new Promise((r) => setTimeout(r, 50));
        await mouse.releaseButton(Button.RIGHT);
      } catch (e) {
        console.error("Mouse right click error:", e.message);
      }
    })();
  } else if (action.special === "mouse_double_click") {
    mouse.doubleClick(Button.LEFT).catch((e) => console.error("Mouse double click error:", e.message));
  } else if (action.special === "selection_mode") {
    if (!selectionMode) {
      selectionMode = true;
      mouse.pressButton(Button.LEFT).catch((e) => console.error("Mouse press error:", e.message));
      setLedColor(180, 0, 255);  // purple = selection mode
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
  sendGameInput(buttonId);
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
  rumbleTap(0.2, 60);
}

// Called on button press — fires once then starts auto-repeat
function handleButtonPress(buttonId) {
  console.log(`Button press: ${buttonId}`);
  sendGameInput(buttonId);

  // R1 + double-tap cross → mouse double click
  if (buttonId === "cross" && held.r1) {
    const now = Date.now();
    if (now - crossLastPress < settings.crossDoubleTapMs) {
      // Second tap with R1 → double click
      crossLastPress = 0;
      usedAsModifier.r1 = true;
      fireSpecial(ACTIONS.mouse_double_click);
      rumbleTap(0.4, 100);
      console.log("R1 + double-tap cross → double click");
      if (mb.window && !mb.window.isDestroyed()) mb.window.webContents.send("button-flash", buttonId);
      return;
    }
    crossLastPress = now;
    // First tap with R1 continues to resolveAction → selection_mode (single click hold)
  }

  const action = resolveAction(buttonId);
  if (!action) return;

  if (mb.window && !mb.window.isDestroyed()) {
    mb.window.webContents.send("button-flash", buttonId);
  }

  // Special actions: one-shot, no repeat
  if (action.special) {
    fireSpecial(action);
    rumbleTap(0.2, 60);
    return;
  }

  if (!action.keys || action.keys.length === 0) return;

  // Fire once immediately
  fireKeys(action.keys);
  rumbleTap(0.2, 60);

  // Start repeat after initial delay
  const delay = setTimeout(() => {
    const interval = setInterval(() => fireKeys(action.keys), settings.repeatInterval);
    buttonRepeatTimers[buttonId] = { delay: null, interval };
  }, settings.repeatDelay);

  buttonRepeatTimers[buttonId] = { delay, interval: null };
}

// Called on button release — stops repeat
function handleButtonRelease(buttonId) {
  // End selection mode when cross is released
  if (buttonId === "cross" && selectionMode) {
    selectionMode = false;
    mouse.releaseButton(Button.LEFT).catch((e) => console.error("Mouse release error:", e.message));
    setLedColor(0, 255, 255);  // back to cyan
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

  // SuperWhisper: just send Right Cmd, let SuperWhisper manage its own state
  // (SuperWhisper auto-stops on silence, so tracking dictationActive causes desync)
  if (dictationProvider === "superwhisper") {
    await fireKeys([Key.RightCmd]);
    setLedColor(255, 50, 100);
    setTimeout(() => setLedColor(0, 255, 255), 2000);  // flash 2s
    console.log("Dictation: SuperWhisper toggled");
    setTimeout(() => { dictationBusy = false; }, 1000);  // cooldown: block rapid re-toggle
    return;
  }

  // Apple Dictation: Escape to stop
  if (dictationActive) {
    await fireKeys([Key.Escape]);
    dictationActive = false;
    setLedColor(0, 255, 255);  // back to cyan
    console.log("Dictation: stopped");
    setTimeout(() => { dictationBusy = false; }, 600);  // cooldown: let macOS finish closing
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
        setLedColor(255, 50, 100);  // red/pink = dictation active
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

// Profile management
ipcMain.on("switch-profile", (_event, name) => {
  if (profiles[name]) {
    saveConfig();  // save current profile state first
    applyProfile(name);
    saveConfig();
    console.log(`Profile switched: ${name}`);
    sendState();
  }
});

ipcMain.on("create-profile", (_event, name) => {
  if (!name || profiles[name]) return;
  profiles[name] = { mapping: { ...DEFAULT_MAPPING }, dictationProvider: "apple", settings: {} };
  applyProfile(name);
  saveConfig();
  console.log(`Profile created: ${name}`);
  sendState();
});

ipcMain.on("delete-profile", (_event, name) => {
  if (name === "default" || !profiles[name]) return;
  delete profiles[name];
  if (activeProfile === name) applyProfile("default");
  saveConfig();
  console.log(`Profile deleted: ${name}`);
  sendState();
});

ipcMain.on("rename-profile", (_event, { oldName, newName }) => {
  if (!newName || !profiles[oldName] || profiles[newName] || oldName === "default") return;
  profiles[newName] = profiles[oldName];
  delete profiles[oldName];
  if (activeProfile === oldName) activeProfile = newName;
  saveConfig();
  console.log(`Profile renamed: ${oldName} -> ${newName}`);
  sendState();
});

ipcMain.on("open-game", () => {
  if (gameWindow && !gameWindow.isDestroyed()) {
    gameWindow.focus();
    return;
  }
  if (mb.window && mb.window.isVisible()) mb.hideWindow();
  gameWindow = new BrowserWindow({
    width: 600,
    height: 500,
    title: "Quest // Entrainement",
    webPreferences: { nodeIntegration: true, contextIsolation: false },
  });
  gameWindow.loadFile(path.join(__dirname, "game.html"));
  gameWindow.on("closed", () => { gameWindow = null; });
});

// ─── App lifecycle ──────────────────────────────────────────────────────────
app.commandLine.appendSwitch("disable-backgrounding-occluded-windows", "true");
app.on("ready", createMenubar);
app.on("window-all-closed", (e) => e.preventDefault());
