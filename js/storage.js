/**
 * storage.js — localStorage helpers for PIA tool
 * Keys are namespaced by assessment type.
 */

const SCHEMA_VERSION = '1.0';
const STORAGE_PREFIX  = 'pia_';

/**
 * Save the full state object for an assessment type.
 * @param {string} type  - 'threshold' | 'short' | 'full'
 * @param {object} state - arbitrary state object
 */
export function saveState(type, state) {
  try {
    const payload = {
      schemaVersion: SCHEMA_VERSION,
      type,
      savedAt: new Date().toISOString(),
      state,
    };
    localStorage.setItem(`${STORAGE_PREFIX}${type}_state`, JSON.stringify(payload));
  } catch (e) {
    // Storage might be full or unavailable — fail silently.
    console.warn('[pia:storage] Could not save state:', e);
  }
}

/**
 * Load previously saved state for an assessment type.
 * @param {string} type
 * @returns {object|null} the state object, or null if none found
 */
export function loadState(type) {
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${type}_state`);
    if (!raw) return null;
    const payload = JSON.parse(raw);
    if (payload.type !== type) return null;
    return payload.state ?? null;
  } catch (e) {
    console.warn('[pia:storage] Could not load state:', e);
    return null;
  }
}

/**
 * Return true if a saved draft exists for the given type.
 * @param {string} type
 * @returns {boolean}
 */
export function hasDraft(type) {
  try {
    return !!localStorage.getItem(`${STORAGE_PREFIX}${type}_state`);
  } catch {
    return false;
  }
}

/**
 * Clear the saved draft for the given type.
 * @param {string} type
 */
export function clearState(type) {
  try {
    localStorage.removeItem(`${STORAGE_PREFIX}${type}_state`);
  } catch (e) {
    console.warn('[pia:storage] Could not clear state:', e);
  }
}

/**
 * Debounce helper — used to prevent hammering localStorage on every keystroke.
 * @param {Function} fn
 * @param {number}   delay ms
 * @returns {Function}
 */
export function debounce(fn, delay = 400) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}
