const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const { migrateConfig, mergeSettings } = require("../lib/logic");

const DEFAULT_MAPPING = {
  cross: "enter",
  circle: "dictation",
  square: "backspace",
};

const DEFAULTS = {
  mouseSpeed: 30,
  mouseDeadzone: 0.15,
  scrollTiers: [
    { threshold: 0.25, speed: 2 },
    { threshold: 0.50, speed: 8 },
  ],
};

describe("migrateConfig", () => {
  it("converts v1 flat config to v2 with profiles", () => {
    const v1 = { mapping: { cross: "escape" }, dictationProvider: "superwhisper" };
    const v2 = migrateConfig(v1, DEFAULT_MAPPING);

    assert.equal(v2.version, 2);
    assert.equal(v2.activeProfile, "default");
    assert.deepEqual(v2.profiles.default.mapping, { cross: "escape" });
    assert.equal(v2.profiles.default.dictationProvider, "superwhisper");
    assert.deepEqual(v2.profiles.default.settings, {});
  });

  it("uses defaults when v1 has no mapping", () => {
    const v1 = {};
    const v2 = migrateConfig(v1, DEFAULT_MAPPING);

    assert.deepEqual(v2.profiles.default.mapping, { ...DEFAULT_MAPPING });
    assert.equal(v2.profiles.default.dictationProvider, "apple");
  });

  it("preserves existing settings from v1", () => {
    const v1 = { mapping: {}, settings: { mouseSpeed: 50 } };
    const v2 = migrateConfig(v1, DEFAULT_MAPPING);

    assert.deepEqual(v2.profiles.default.settings, { mouseSpeed: 50 });
  });
});

describe("mergeSettings", () => {
  it("returns deep copy of defaults when no user settings", () => {
    const result = mergeSettings(DEFAULTS, null);
    assert.equal(result.mouseSpeed, 30);
    assert.equal(result.mouseDeadzone, 0.15);
    // Should be a deep copy (not same reference)
    assert.notEqual(result.scrollTiers, DEFAULTS.scrollTiers);
    assert.deepEqual(result.scrollTiers, DEFAULTS.scrollTiers);
  });

  it("overrides scalar values", () => {
    const result = mergeSettings(DEFAULTS, { mouseSpeed: 50 });
    assert.equal(result.mouseSpeed, 50);
    assert.equal(result.mouseDeadzone, 0.15); // unchanged
  });

  it("overrides scrollTiers array", () => {
    const customTiers = [{ threshold: 0.30, speed: 5 }];
    const result = mergeSettings(DEFAULTS, { scrollTiers: customTiers });
    assert.deepEqual(result.scrollTiers, customTiers);
    // Should be deep copy
    assert.notEqual(result.scrollTiers[0], customTiers[0]);
  });

  it("ignores unknown keys from user settings", () => {
    const result = mergeSettings(DEFAULTS, { unknownKey: "value" });
    assert.equal(result.unknownKey, undefined);
  });

  it("handles empty user settings object", () => {
    const result = mergeSettings(DEFAULTS, {});
    assert.deepEqual(result.mouseSpeed, 30);
  });
});
