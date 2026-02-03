const { ipcRenderer } = require("electron");

const dot = document.getElementById("dot");
const statusText = document.getElementById("status-text");
const mappingList = document.getElementById("mapping-list");
const quitBtn = document.getElementById("quit-btn");
const resetBtn = document.getElementById("reset-btn");
const dictationSelect = document.getElementById("dictation-provider");

let currentState = null;

// Group buttons visually
const BUTTON_GROUPS = [
  { label: "D-pad",     ids: ["dpad_up", "dpad_down", "dpad_left", "dpad_right"] },
  { label: "Face",      ids: ["cross", "circle", "square", "triangle"] },
  { label: "Bumpers",   ids: ["l1", "r1"] },
  { label: "Triggers",  ids: ["l2", "r2"] },
  { label: "Sticks",    ids: ["l3", "r3"] },
  { label: "Systeme",   ids: ["options", "create", "mute", "touchpad"] },
];

function render(state) {
  currentState = state;

  // Connection
  if (state.connected) {
    dot.classList.add("on");
    statusText.textContent = "Manette connectee";
  } else {
    dot.classList.remove("on");
    statusText.textContent = "Deconnectee";
  }

  // Dictation provider
  if (state.dictationProvider) {
    dictationSelect.value = state.dictationProvider;
  }

  // Group actions by category for <optgroup>
  const categories = {};
  for (const [id, info] of Object.entries(state.actions)) {
    const cat = info.cat || "Autre";
    if (!categories[cat]) categories[cat] = [];
    categories[cat].push({ id, label: info.label });
  }

  // Build mapping rows
  mappingList.innerHTML = "";

  for (const group of BUTTON_GROUPS) {
    const groupLabel = document.createElement("div");
    groupLabel.classList.add("group-label");
    groupLabel.textContent = group.label;
    mappingList.appendChild(groupLabel);

    for (const btnId of group.ids) {
      if (!state.buttonLabels[btnId]) continue;

      const row = document.createElement("div");
      row.classList.add("mapping-row");
      row.dataset.button = btnId;

      const name = document.createElement("span");
      name.classList.add("btn-name");
      name.textContent = state.buttonLabels[btnId];

      const select = document.createElement("select");

      for (const [cat, actions] of Object.entries(categories)) {
        const optgroup = document.createElement("optgroup");
        optgroup.label = cat;
        for (const action of actions) {
          const opt = document.createElement("option");
          opt.value = action.id;
          opt.textContent = action.label;
          if (state.mapping[btnId] === action.id) opt.selected = true;
          optgroup.appendChild(opt);
        }
        select.appendChild(optgroup);
      }

      select.addEventListener("change", () => {
        ipcRenderer.send("update-mapping", { buttonId: btnId, actionId: select.value });
      });

      row.appendChild(name);
      row.appendChild(select);
      mappingList.appendChild(row);
    }
  }
}

// ── IPC ──
ipcRenderer.on("state", (_event, state) => render(state));

ipcRenderer.on("button-flash", (_event, buttonId) => {
  const row = document.querySelector(`.mapping-row[data-button="${buttonId}"]`);
  if (!row) return;
  row.classList.add("flash");
  setTimeout(() => row.classList.remove("flash"), 300);
});

dictationSelect.addEventListener("change", () => {
  ipcRenderer.send("update-dictation-provider", dictationSelect.value);
});

resetBtn.addEventListener("click", () => {
  if (confirm("Remettre le mapping par defaut ?")) {
    ipcRenderer.send("reset-mapping");
  }
});

quitBtn.addEventListener("click", () => ipcRenderer.send("quit-app"));

ipcRenderer.send("request-state");
