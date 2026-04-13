/**
 * import.js — JSON file upload and field population for PIA tool
 *
 * Usage:
 *   import { initImport } from './import.js';
 *   initImport({ type: 'threshold', onImport: (state) => wizard.loadState(state) });
 */

const SUPPORTED_VERSIONS = ['1.0'];

/**
 * Initialise the import file input on the current page.
 *
 * @param {object} options
 * @param {string}   options.type      - Assessment type ('threshold' | 'short' | 'full')
 * @param {Function} options.onImport  - Callback(state) called with the parsed state
 * @param {string}   [options.inputId] - ID of the file input element (default: 'import-file')
 */
export function initImport({ type, onImport, inputId = 'import-file' }) {
  const input = document.getElementById(inputId);
  if (!input) return;

  input.addEventListener('change', (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.json')) {
      showImportError('Please select a .json file exported from this tool.');
      input.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const payload = JSON.parse(e.target.result);
        const err = validatePayload(payload, type);
        if (err) {
          showImportError(err);
          input.value = '';
          return;
        }
        onImport(payload.state);
        showImportSuccess(`Loaded: ${file.name}`);
      } catch {
        showImportError('The file could not be read. Make sure it is a valid JSON export from this tool.');
      }
      input.value = '';
    };
    reader.readAsText(file);
  });
}

/* ── Validation ─────────────────────────────────────────────── */

function validatePayload(payload, expectedType) {
  if (!payload || typeof payload !== 'object') {
    return 'Invalid file format.';
  }
  if (!SUPPORTED_VERSIONS.includes(payload.schemaVersion)) {
    return `Unsupported file version "${payload.schemaVersion}". Expected: ${SUPPORTED_VERSIONS.join(', ')}.`;
  }
  if (payload.type !== expectedType) {
    return `This file is for a "${payload.type}" assessment, but this page is for a "${expectedType}" assessment.`;
  }
  if (!payload.state || typeof payload.state !== 'object') {
    return 'The file does not contain valid assessment data.';
  }
  return null; // valid
}

/* ── Feedback helpers ───────────────────────────────────────── */

function getOrCreateFeedback() {
  let el = document.getElementById('import-feedback');
  if (!el) {
    el = document.createElement('p');
    el.id = 'import-feedback';
    el.setAttribute('role', 'alert');
    el.setAttribute('aria-live', 'polite');
    el.style.fontSize = 'var(--font-size-sm)';
    el.style.marginTop = 'var(--space-1)';

    const bar = document.querySelector('.import-bar');
    if (bar) bar.insertAdjacentElement('afterend', el);
  }
  return el;
}

function showImportError(msg) {
  const el = getOrCreateFeedback();
  el.textContent = `⚠ ${msg}`;
  el.style.color = 'var(--color-error)';
}

function showImportSuccess(msg) {
  const el = getOrCreateFeedback();
  el.textContent = `✓ ${msg}`;
  el.style.color = 'var(--color-success)';
  setTimeout(() => { if (el) el.textContent = ''; }, 5000);
}
