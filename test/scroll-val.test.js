const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const { resolveScrollTier } = require("../lib/logic");

const TIERS = [
  { threshold: 0.25, speed: 2 },
  { threshold: 0.50, speed: 8 },
  { threshold: 0.85, speed: 25 },
];
const HYST = 0.05;

describe("resolveScrollTier", () => {
  it("returns -1 when below first tier threshold", () => {
    assert.equal(resolveScrollTier(0.10, -1, TIERS, HYST), -1);
  });

  it("activates tier 0 at threshold", () => {
    assert.equal(resolveScrollTier(0.25, -1, TIERS, HYST), 0);
  });

  it("activates tier 1 at threshold", () => {
    assert.equal(resolveScrollTier(0.50, -1, TIERS, HYST), 1);
  });

  it("activates tier 2 at threshold", () => {
    assert.equal(resolveScrollTier(0.85, -1, TIERS, HYST), 2);
  });

  it("stays at tier 0 with hysteresis (above deactivation threshold)", () => {
    // Currently at tier 0, value drops to 0.21 (below 0.25 but above 0.25-0.05=0.20)
    assert.equal(resolveScrollTier(0.21, 0, TIERS, HYST), 0);
  });

  it("deactivates tier 0 when below hysteresis threshold", () => {
    // Currently at tier 0, value drops to 0.19 (below 0.25-0.05=0.20)
    assert.equal(resolveScrollTier(0.19, 0, TIERS, HYST), -1);
  });

  it("stays at tier 1 with hysteresis", () => {
    // Currently at tier 1, value drops to 0.46 (below 0.50 but above 0.50-0.05=0.45)
    assert.equal(resolveScrollTier(0.46, 1, TIERS, HYST), 1);
  });

  it("drops from tier 1 to tier 0 when below hysteresis", () => {
    // Currently at tier 1, value drops to 0.30 (below 0.50-0.05=0.45 but above 0.25-0.05=0.20)
    assert.equal(resolveScrollTier(0.30, 1, TIERS, HYST), 0);
  });

  it("full tilt activates highest tier", () => {
    assert.equal(resolveScrollTier(1.0, -1, TIERS, HYST), 2);
  });

  it("exactly at 0 returns idle", () => {
    assert.equal(resolveScrollTier(0, 0, TIERS, HYST), -1);
  });
});
