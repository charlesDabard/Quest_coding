#!/usr/bin/env node
// Quest Watcher — polls for DualSense controller and restarts Quest on reconnection

const { devices } = require("node-hid");
const { spawn, execSync } = require("child_process");
const path = require("path");

const VENDOR_ID = 1356;   // Sony
const PRODUCT_ID = 3302;  // DualSense
const POLL_MS = 3000;
const QUEST_DIR = __dirname;

let wasConnected = false;

function isDualSenseConnected() {
  try {
    return devices(VENDOR_ID, PRODUCT_ID).length > 0;
  } catch (_) {
    return false;
  }
}

function killQuest() {
  try {
    execSync("pkill -f 'Electron.app'", { stdio: "ignore" });
  } catch (_) {
    // No process to kill, that's fine
  }
}

function launchQuest() {
  const electronApp = path.join(QUEST_DIR, "node_modules/electron/dist/Electron.app");
  try {
    execSync(`open "${electronApp}" --args "${QUEST_DIR}"`, { stdio: "ignore" });
    console.log("Quest launched via open");
  } catch (e) {
    console.error("Failed to launch Quest:", e.message);
  }
}

// Poll loop
setInterval(() => {
  const connected = isDualSenseConnected();
  if (connected && !wasConnected) {
    console.log(`[${new Date().toLocaleTimeString()}] DualSense detected → restarting Quest...`);
    killQuest();
    setTimeout(() => launchQuest(), 500);
  }
  if (!connected && wasConnected) {
    console.log(`[${new Date().toLocaleTimeString()}] DualSense disconnected`);
  }
  wasConnected = connected;
}, POLL_MS);

// Launch Quest immediately if controller already plugged in
if (isDualSenseConnected()) {
  wasConnected = true;
  console.log(`[${new Date().toLocaleTimeString()}] DualSense already connected → launching Quest...`);
  killQuest();
  setTimeout(() => launchQuest(), 500);
} else {
  console.log(`[${new Date().toLocaleTimeString()}] No DualSense found. Waiting...`);
}

console.log("Quest watcher started. Polling every 3s...");
