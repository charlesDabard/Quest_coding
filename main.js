const { app, BrowserWindow, ipcMain } = require("electron");
const { menubar } = require("menubar");
const { Dualsense } = require("dualsense-ts");
const { keyboard, Key } = require("@nut-tree-fork/nut-js");
const { exec } = require("child_process");
const path = require("path");

// Disable keyboard auto-delay for responsive input
keyboard.config.autoDelayMs = 0;

let mb;
let controller;
let connected = false;

function createMenubar() {
  mb = menubar({
    index: `file://${path.join(__dirname, "index.html")}`,
    icon: path.join(__dirname, "assets", "iconTemplate.png"),
    browserWindow: {
      width: 320,
      height: 300,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
      },
    },
    preloadWindow: true,
  });

  mb.on("ready", () => {
    console.log("Menubar ready");
    app.dock.hide();
    initController();
  });

  mb.on("after-create-window", () => {
    sendStatus();
  });
}

function sendStatus() {
  if (mb.window && !mb.window.isDestroyed()) {
    mb.window.webContents.send("controller-status", {
      connected,
    });
  }
}

function initController() {
  controller = new Dualsense();

  controller.connection.on("change", ({ active }) => {
    connected = active;
    console.log(active ? "Controller connected" : "Controller disconnected");
    sendStatus();
  });

  // D-pad (Momentary buttons, not analog stick)
  controller.dpad.up.on("press", () => {
    console.log("D-pad up");
    pressKey(Key.Up);
  });

  controller.dpad.down.on("press", () => {
    console.log("D-pad down");
    pressKey(Key.Down);
  });

  controller.dpad.left.on("press", () => {
    console.log("D-pad left");
    pressKey(Key.Left);
  });

  controller.dpad.right.on("press", () => {
    console.log("D-pad right");
    pressKey(Key.Right);
  });

  // Cross (X) → Enter
  controller.cross.on("press", () => {
    console.log("Cross pressed");
    pressKey(Key.Return);
  });

  // Square (□) → Option+Backspace (delete last word)
  controller.square.on("press", () => {
    console.log("Square pressed");
    pressCombo(Key.LeftAlt, Key.Backspace);
  });

  // Circle (O) → Toggle macOS dictation
  controller.circle.on("press", () => {
    console.log("Circle pressed");
    toggleDictation();
  });
}

async function pressKey(key) {
  try {
    await keyboard.pressKey(key);
    await keyboard.releaseKey(key);
  } catch (err) {
    console.error("Key press error:", err.message);
  }
}

async function pressCombo(...keys) {
  try {
    for (const k of keys) await keyboard.pressKey(k);
    for (const k of keys.reverse()) await keyboard.releaseKey(k);
  } catch (err) {
    console.error("Key combo error:", err.message);
  }
}

function toggleDictation() {
  // Scan the frontmost app's menu bar for the Dictation menu item
  // Works in both French ("ictée" in "Édition") and English ("ictation" in "Edit")
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
                return "OK: " & itemName
              end if
            end repeat
          end if
        end repeat
      end tell
    end tell
    return "ERROR: No dictation menu item found"'`;
  exec(script, (err, stdout, stderr) => {
    if (err) {
      console.error("Dictation error:", stderr || err.message);
    } else {
      console.log("Dictation:", stdout.trim());
    }
  });
}

ipcMain.on("quit-app", () => {
  app.quit();
});

app.on("ready", createMenubar);

app.on("window-all-closed", (e) => {
  e.preventDefault();
});
