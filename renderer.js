const { ipcRenderer } = require("electron");

const dot = document.getElementById("dot");
const statusText = document.getElementById("status-text");
const quitBtn = document.getElementById("quit-btn");

ipcRenderer.on("controller-status", (_event, data) => {
  if (data.connected) {
    dot.classList.remove("off");
    statusText.textContent = "Manette connectée";
  } else {
    dot.classList.add("off");
    statusText.textContent = "Déconnectée";
  }
});

quitBtn.addEventListener("click", () => {
  ipcRenderer.send("quit-app");
});
