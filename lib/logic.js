// Pure logic functions extracted from main.js for testability

/**
 * Resolve which action a button press should trigger, considering combos.
 * @param {string} buttonId - The button being pressed
 * @param {object} held - Current modifier held state { l1, r1, l2, r2 }
 * @param {object} combos - Combo definitions { buttonId: [{ held: [...], action }] }
 * @param {object} mapping - Current button-to-action mapping
 * @param {object} actions - Action catalogue
 * @returns {object|null} The resolved action object, or null
 */
function resolveAction(buttonId, held, combos, mapping, actions) {
  if (combos[buttonId]) {
    for (const combo of combos[buttonId]) {
      if (combo.held.every((m) => held[m])) {
        return actions[combo.action] || null;
      }
    }
  }
  const actionId = mapping[buttonId];
  if (!actionId || actionId === "none") return null;
  return actions[actionId] || null;
}

/**
 * Resolve scroll tier with hysteresis.
 * @param {number} abs - Absolute stick deflection (0-1)
 * @param {number} currentTier - Current active tier index (-1 = idle)
 * @param {Array} tiers - Tier definitions [{ threshold, speed }]
 * @param {number} hysteresis - Hysteresis margin
 * @returns {number} New tier index (-1 = idle)
 */
function resolveScrollTier(abs, currentTier, tiers, hysteresis) {
  let newTier = -1;
  for (let i = tiers.length - 1; i >= 0; i--) {
    const thresh = currentTier >= i ? tiers[i].threshold - hysteresis : tiers[i].threshold;
    if (abs >= thresh) { newTier = i; break; }
  }
  return newTier;
}

/**
 * Migrate v1 config (flat) to v2 (profiles).
 * @param {object} data - Raw config data
 * @param {object} defaultMapping - Default button mapping
 * @returns {object} v2 config
 */
function migrateConfig(data, defaultMapping) {
  return {
    version: 2,
    activeProfile: "default",
    profiles: {
      default: {
        mapping: data.mapping || { ...defaultMapping },
        dictationProvider: data.dictationProvider || "apple",
        settings: data.settings || {},
      },
    },
  };
}

/**
 * Merge user settings over defaults (deep for scrollTiers).
 * @param {object} defaults - Default settings
 * @param {object} userSettings - User overrides
 * @returns {object} Merged settings
 */
function mergeSettings(defaults, userSettings) {
  if (!userSettings) return { ...defaults, scrollTiers: defaults.scrollTiers.map(t => ({ ...t })) };
  const merged = { ...defaults };
  for (const key of Object.keys(defaults)) {
    if (key === "scrollTiers" && Array.isArray(userSettings.scrollTiers)) {
      merged.scrollTiers = userSettings.scrollTiers.map(t => ({ ...t }));
    } else if (userSettings[key] !== undefined) {
      merged[key] = userSettings[key];
    }
  }
  return merged;
}

module.exports = { resolveAction, resolveScrollTier, migrateConfig, mergeSettings };
