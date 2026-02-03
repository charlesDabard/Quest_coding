const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const { resolveAction } = require("../lib/logic");

const ACTIONS = {
  enter:             { label: "Enter", keys: ["Return"] },
  backspace:         { label: "Backspace", keys: ["Backspace"] },
  shift_tab:         { label: "Shift+Tab", keys: ["LeftShift", "Tab"] },
  delete_word:       { label: "Delete word", keys: ["LeftControl", "W"] },
  delete_line:       { label: "Delete line", keys: ["LeftCmd", "Backspace"] },
  select_all_delete: { label: "Tout supprimer", special: "select_all_delete" },
  mouse_click:       { label: "Clic souris", special: "mouse_click" },
  mouse_right_click: { label: "Clic droit", special: "mouse_right_click" },
  selection_mode:    { label: "Selection", special: "selection_mode" },
  cut:               { label: "Couper", keys: ["LeftCmd", "X"] },
  escape:            { label: "Echap", keys: ["Escape"] },
  spotlight:         { label: "Spotlight", keys: ["LeftCmd", "Space"] },
  space:             { label: "Espace", keys: ["Space"] },
  none:              { label: "Aucune", keys: [] },
};

const COMBOS = {
  square: [
    { held: ["l2", "r2"], action: "select_all_delete" },
    { held: ["r2"],       action: "delete_line" },
    { held: ["r1"],       action: "delete_word" },
    { held: ["l1"],       action: "cut" },
  ],
  cross: [
    { held: ["r2"],       action: "selection_mode" },
    { held: ["r1"],       action: "mouse_click" },
    { held: ["l1"],       action: "mouse_right_click" },
  ],
  triangle: [
    { held: ["r1"],       action: "escape" },
    { held: ["r2"],       action: "spotlight" },
    { held: ["l1"],       action: "space" },
  ],
};

const MAPPING = {
  cross: "enter",
  square: "backspace",
  triangle: "shift_tab",
};

const noMod = { l1: false, r1: false, l2: false, r2: false };

describe("resolveAction", () => {
  it("returns mapped action when no modifiers held", () => {
    const result = resolveAction("cross", noMod, COMBOS, MAPPING, ACTIONS);
    assert.deepEqual(result, ACTIONS.enter);
  });

  it("returns null for unmapped button", () => {
    const result = resolveAction("dpad_up", noMod, COMBOS, { dpad_up: "none" }, ACTIONS);
    assert.equal(result, null);
  });

  it("returns null for missing mapping", () => {
    const result = resolveAction("dpad_up", noMod, COMBOS, {}, ACTIONS);
    assert.equal(result, null);
  });

  // Square combos
  it("R1+Square → delete_word", () => {
    const held = { ...noMod, r1: true };
    const result = resolveAction("square", held, COMBOS, MAPPING, ACTIONS);
    assert.deepEqual(result, ACTIONS.delete_word);
  });

  it("R2+Square → delete_line", () => {
    const held = { ...noMod, r2: true };
    const result = resolveAction("square", held, COMBOS, MAPPING, ACTIONS);
    assert.deepEqual(result, ACTIONS.delete_line);
  });

  it("L2+R2+Square → select_all_delete", () => {
    const held = { ...noMod, l2: true, r2: true };
    const result = resolveAction("square", held, COMBOS, MAPPING, ACTIONS);
    assert.deepEqual(result, ACTIONS.select_all_delete);
  });

  // Cross combos
  it("R1+Cross → mouse_click", () => {
    const held = { ...noMod, r1: true };
    const result = resolveAction("cross", held, COMBOS, MAPPING, ACTIONS);
    assert.deepEqual(result, ACTIONS.mouse_click);
  });

  it("R2+Cross → selection_mode", () => {
    const held = { ...noMod, r2: true };
    const result = resolveAction("cross", held, COMBOS, MAPPING, ACTIONS);
    assert.deepEqual(result, ACTIONS.selection_mode);
  });

  // Triangle combos
  it("R1+Triangle → escape", () => {
    const held = { ...noMod, r1: true };
    const result = resolveAction("triangle", held, COMBOS, MAPPING, ACTIONS);
    assert.deepEqual(result, ACTIONS.escape);
  });

  it("R2+Triangle → spotlight", () => {
    const held = { ...noMod, r2: true };
    const result = resolveAction("triangle", held, COMBOS, MAPPING, ACTIONS);
    assert.deepEqual(result, ACTIONS.spotlight);
  });

  it("L1+Triangle → space", () => {
    const held = { ...noMod, l1: true };
    const result = resolveAction("triangle", held, COMBOS, MAPPING, ACTIONS);
    assert.deepEqual(result, ACTIONS.space);
  });

  // L1 combos
  it("L1+Cross → mouse_right_click", () => {
    const held = { ...noMod, l1: true };
    const result = resolveAction("cross", held, COMBOS, MAPPING, ACTIONS);
    assert.deepEqual(result, ACTIONS.mouse_right_click);
  });

  it("L1+Square → cut", () => {
    const held = { ...noMod, l1: true };
    const result = resolveAction("square", held, COMBOS, MAPPING, ACTIONS);
    assert.deepEqual(result, ACTIONS.cut);
  });

  // Combo priority: L2+R2 beats R2 alone
  it("L2+R2+Square picks the multi-modifier combo first", () => {
    const held = { l1: false, r1: false, l2: true, r2: true };
    const result = resolveAction("square", held, COMBOS, MAPPING, ACTIONS);
    assert.equal(result.special, "select_all_delete");
  });
});
