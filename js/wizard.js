/**
 * wizard.js — Multi-step wizard engine for PIA tool.
 *
 * Usage:
 *   import { Wizard } from './wizard.js';
 *   const wizard = new Wizard({ steps, type, container, onComplete });
 *   wizard.init();
 */

import { saveState, loadState, hasDraft, clearState, debounce } from './storage.js';
import { initImport } from './import.js';

export class Wizard {
  /**
   * @param {object} opts
   * @param {Array}    opts.steps       - Array of step definition objects
   * @param {string}   opts.type        - Assessment type key ('threshold'|'short'|'full')
   * @param {Function} [opts.onComplete]- Called with (state) when wizard is submitted
   * @param {Function} [opts.computeOutcome] - For threshold: computes result from state
   */
  constructor({ steps, type, onComplete, computeOutcome }) {
    this.steps          = steps;
    this.type           = type;
    this.onComplete     = onComplete;
    this.computeOutcome = computeOutcome;
    this.currentStep    = 0;
    this.state          = {};           // flat map: fieldId → value
    this._saveDebounced = debounce(() => this._persist(), 500);
  }

  /* ── Initialisation ─────────────────────────────────────────── */

  init() {
    this._renderStepIndicator();
    this._renderSteps();
    this._renderFooter();
    this._attachImport();
    this._checkDraft();
    this._updateUI();
  }

  /* ── Draft restore / import ─────────────────────────────────── */

  _checkDraft() {
    if (hasDraft(this.type)) {
      const savedState = loadState(this.type);
      if (savedState) {
        this._showDraftBanner(savedState);
      }
    }
  }

  _showDraftBanner(savedState) {
    const banner = document.createElement('div');
    banner.className = 'draft-banner';
    banner.setAttribute('role', 'alert');
    banner.innerHTML = `
      <svg class="draft-banner__icon" width="20" height="20" viewBox="0 0 24 24" fill="none"
           stroke="currentColor" stroke-width="2" aria-hidden="true">
        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/>
        <line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
      <span class="draft-banner__msg">A saved draft was found for this assessment.</span>
      <button class="btn btn--sm btn--primary" id="draft-resume">Resume draft</button>
      <button class="btn btn--sm btn--tertiary" id="draft-discard">Start fresh</button>
    `;
    const indicator = document.getElementById('step-indicator');
    indicator?.insertAdjacentElement('beforebegin', banner);

    document.getElementById('draft-resume')?.addEventListener('click', () => {
      this._applyState(savedState);
      banner.remove();
    });
    document.getElementById('draft-discard')?.addEventListener('click', () => {
      clearState(this.type);
      banner.remove();
    });
  }

  _applyState(state) {
    this.state = { ...state };
    // Restore repeating groups separately
    this.steps.forEach(step => {
      step.fields.forEach(field => {
        if (field.type === 'app-table') {
          // handled below
        } else if (field.type === 'repeating-group') {
          const items = this.state[field.id];
          if (Array.isArray(items)) {
            const container = document.getElementById(`rg-${field.id}`);
            if (container) {
              container.innerHTML = '';
              items.forEach((item, idx) => {
                this._addRepeatingItem(field, container, idx, item);
              });
              this._renumberItems(field.id);
            }
          }
        } else if (field.type === 'app-table') {
          const apps = this.state[field.id];
          if (apps && typeof apps === 'object') {
            Object.entries(apps).forEach(([appKey, vals]) => {
              ['applicable', 'compliant', 'notes'].forEach(sub => {
                const el = document.getElementById(`app-${appKey}-${sub}`);
                if (el) el.value = vals[sub] ?? '';
              });
            });
          }
        } else {
          const value = this.state[field.id];
          if (value === undefined || value === null) return;
          const el = document.getElementById(field.id);
          if (!el) return;
          if (field.type === 'checkbox-other') {
            const values = Array.isArray(value) ? value : (value ? [value] : []);
            const fg = document.getElementById(`fg-${field.id}`);
            fg?.querySelectorAll(`input[name="${field.id}"]`).forEach(cb => {
              cb.checked = values.includes(cb.value);
              if (cb.value === '__other' && cb.checked) {
                const wrap = document.getElementById(`${field.id}__other-wrap`);
                if (wrap) wrap.hidden = false;
              }
            });
            const otherVal = this.state[`${field.id}__other`];
            const otherInput = document.getElementById(`${field.id}__other`);
            if (otherInput && otherVal) otherInput.value = otherVal;
          } else if (field.type === 'checkbox') {
            const values = Array.isArray(value) ? value : [value];
            el.closest('fieldset')?.querySelectorAll('input[type="checkbox"]').forEach(cb => {
              cb.checked = values.includes(cb.value);
            });
          } else if (field.type === 'radio') {
            el.closest('fieldset')?.querySelectorAll('input[type="radio"]').forEach(rb => {
              rb.checked = rb.value === value;
            });
          } else {
            el.value = value;
          }
        }
      });
    });
    this._updateConditionalVisibility();
  }

  /* ── Rendering ──────────────────────────────────────────────── */

  _renderStepIndicator() {
    const el = document.getElementById('step-indicator');
    if (!el) return;
    el.innerHTML = this.steps.map((step, i) => `
      <li class="step-indicator__item" id="step-ind-${i}" aria-current="${i === 0 ? 'step' : 'false'}">
        <div class="step-indicator__circle" aria-hidden="true">${i + 1}</div>
        <span class="step-indicator__label">${step.title}</span>
      </li>
    `).join('');
  }

  _renderSteps() {
    const container = document.getElementById('wizard-steps');
    if (!container) return;
    container.innerHTML = this.steps.map((step, i) => `
      <div class="wizard__step${i === 0 ? ' is-active' : ''}" id="step-panel-${i}"
           role="group" aria-labelledby="step-title-${i}">
        <h2 class="wizard__step-title" id="step-title-${i}">${step.title}</h2>
        ${step.desc ? `<p class="wizard__step-desc">${step.desc}</p>` : ''}
        ${step.hint ? `<div class="callout callout--info"><p>${step.hint}</p></div>` : ''}
        ${step.fields.map(field => this._renderField(field, i)).join('')}
      </div>
    `).join('');

    // Attach change listeners for auto-save and conditional logic
    container.addEventListener('input',  (e) => this._onFieldChange(e));
    container.addEventListener('change', (e) => this._onFieldChange(e));
  }

  _renderField(field, stepIdx) {
    const reqMark = field.required ? '<span class="form-required" aria-hidden="true">*</span>' : '';
    const hint    = field.hint ? `<span class="form-hint">${field.hint}</span>` : '';
    const showIfAttr = field.showIf
      ? `data-show-if-field="${field.showIf.field}" data-show-if-values="${field.showIf.values.join(',')}"` : '';

    switch (field.type) {
      case 'text':
      case 'date':
        return `
          <div class="form-group" id="fg-${field.id}" ${showIfAttr}>
            <label class="form-label" for="${field.id}">${field.label}${reqMark}</label>
            ${hint}
            <input class="form-input" type="${field.type}" id="${field.id}" name="${field.id}"
                   ${field.required ? 'required' : ''}
                   aria-describedby="err-${field.id}"
                   ${field.placeholder ? `placeholder="${field.placeholder}"` : ''}>
            <span class="form-error" id="err-${field.id}" aria-live="polite"></span>
          </div>`;

      case 'textarea':
        return `
          <div class="form-group" id="fg-${field.id}" ${showIfAttr}>
            <label class="form-label" for="${field.id}">${field.label}${reqMark}</label>
            ${hint}
            <textarea class="form-textarea" id="${field.id}" name="${field.id}"
                      ${field.required ? 'required' : ''}
                      rows="5"
                      aria-describedby="err-${field.id}"
                      placeholder="${field.placeholder ?? ''}"></textarea>
            <span class="form-error" id="err-${field.id}" aria-live="polite"></span>
          </div>`;

      case 'select':
        return `
          <div class="form-group" id="fg-${field.id}" ${showIfAttr}>
            <label class="form-label" for="${field.id}">${field.label}${reqMark}</label>
            ${hint}
            <select class="form-select" id="${field.id}" name="${field.id}"
                    ${field.required ? 'required' : ''}
                    aria-describedby="err-${field.id}">
              ${field.options.map(o => `<option value="${o.value}">${o.label}</option>`).join('')}
            </select>
            <span class="form-error" id="err-${field.id}" aria-live="polite"></span>
          </div>`;

      case 'radio':
        return `
          <div class="form-group" id="fg-${field.id}" ${showIfAttr}>
            <fieldset aria-describedby="err-${field.id}">
              <legend>${field.label}${reqMark}</legend>
              ${hint}
              <div class="radio-group">
                ${field.options.map(o => `
                  <label class="radio-item">
                    <input type="radio" name="${field.id}" id="${field.id}-${o.value}" value="${o.value}"
                           ${field.required ? 'required' : ''}>
                    <span>${o.label}</span>
                  </label>
                `).join('')}
              </div>
              <span class="form-error" id="err-${field.id}" aria-live="polite"></span>
            </fieldset>
          </div>`;

      case 'checkbox':
        return `
          <div class="form-group" id="fg-${field.id}" ${showIfAttr}>
            <fieldset>
              <legend>${field.label}${reqMark}</legend>
              ${hint}
              <div class="checkbox-group">
                ${field.options.map(o => `
                  <label class="checkbox-item">
                    <input type="checkbox" name="${field.id}" value="${o.value}">
                    <span>${o.label}</span>
                  </label>
                `).join('')}
              </div>
              <span class="form-error" id="err-${field.id}" aria-live="polite"></span>
            </fieldset>
          </div>`;

      case 'checkbox-other': {
        const otherId = `${field.id}__other`;
        return `
          <div class="form-group" id="fg-${field.id}" ${showIfAttr}>
            <fieldset>
              <legend>${field.label}${reqMark}</legend>
              ${hint}
              <div class="checkbox-group">
                ${field.options.map(o => `
                  <label class="checkbox-item">
                    <input type="checkbox" name="${field.id}" value="${o.value}">
                    <span>${o.label}</span>
                  </label>
                `).join('')}
                <div class="checkbox-other-row">
                  <label class="checkbox-item">
                    <input type="checkbox" name="${field.id}" value="__other"
                           class="checkbox-other-trigger" data-reveals="${otherId}">
                    <span>Other / not listed above</span>
                  </label>
                  <div class="checkbox-other-field" id="${otherId}-wrap" hidden>
                    <label class="visually-hidden" for="${otherId}">Please specify</label>
                    <input type="text" class="form-input checkbox-other-input"
                           id="${otherId}" name="${otherId}"
                           placeholder="Please specify…">
                  </div>
                </div>
              </div>
              <span class="form-error" id="err-${field.id}" aria-live="polite"></span>
            </fieldset>
          </div>`;
      }

      case 'repeating-group':
        return `
          <div class="form-group repeating-group-wrapper" id="fg-${field.id}">
            <div class="form-label">${field.label}${field.minItems ? '<span class="form-required" aria-hidden="true">*</span>' : ''}</div>
            ${hint}
            <div class="repeating-group" id="rg-${field.id}"></div>
            <button type="button" class="btn btn--secondary btn--sm repeating-group__add"
                    data-rg="${field.id}" data-step="${stepIdx}">
              ${field.addLabel ?? '+ Add item'}
            </button>
            <span class="form-error" id="err-${field.id}" aria-live="polite"></span>
          </div>`;

      case 'app-table':
        return `
          <div class="form-group app-table-wrapper">
            <div class="table-wrap app-table">
              <table>
                <thead>
                  <tr>
                    <th>Australian Privacy Principle</th>
                    <th>Applicable?</th>
                    <th>Compliant?</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  ${field.apps.map(app => `
                    <tr>
                      <td>
                        <strong>APP ${app.num}: ${app.title}</strong>
                        <br><small class="text-muted">${app.desc}</small>
                      </td>
                      <td>
                        <select class="form-select" id="app-${app.num}-applicable" name="app-${app.num}-applicable">
                          <option value="">—</option>
                          <option value="Yes">Yes</option>
                          <option value="No">No</option>
                          <option value="N/A">N/A</option>
                        </select>
                      </td>
                      <td>
                        <select class="form-select" id="app-${app.num}-compliant" name="app-${app.num}-compliant">
                          <option value="">—</option>
                          <option value="Yes">Yes</option>
                          <option value="Partial">Partial</option>
                          <option value="No">No</option>
                          <option value="N/A">N/A</option>
                        </select>
                      </td>
                      <td>
                        <input type="text" class="form-input" id="app-${app.num}-notes"
                               name="app-${app.num}-notes" placeholder="Notes…">
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>`;

      default:
        return '';
    }
  }

  _renderFooter() {
    const footer = document.getElementById('wizard-footer');
    if (!footer) return;
    footer.innerHTML = `
      <div>
        <button class="btn btn--secondary" id="btn-prev" type="button">Previous</button>
      </div>
      <div class="wizard__footer-right">
        <span class="save-indicator" id="save-indicator" aria-live="polite">
          <span class="save-indicator__dot"></span>
          <span class="save-indicator__text">Changes saved</span>
        </span>
        <button class="btn btn--primary" id="btn-next" type="button">Next</button>
      </div>
    `;
    document.getElementById('btn-prev')?.addEventListener('click', () => this.prev());
    document.getElementById('btn-next')?.addEventListener('click', () => this.next());

    // Add button delegation for repeating groups
    document.getElementById('wizard-steps')?.addEventListener('click', (e) => {
      const addBtn = e.target.closest('.repeating-group__add');
      if (addBtn) {
        const rgId   = addBtn.dataset.rg;
        const stepIdx = parseInt(addBtn.dataset.step, 10);
        const field   = this.steps[stepIdx].fields.find(f => f.id === rgId);
        if (field) {
          const container = document.getElementById(`rg-${rgId}`);
          const idx       = container.querySelectorAll('.repeating-group__item').length;
          this._addRepeatingItem(field, container, idx, {});
        }
        return;
      }
      const removeBtn = e.target.closest('.repeating-group__remove');
      if (removeBtn) {
        const item  = removeBtn.closest('.repeating-group__item');
        const rgId  = item.dataset.rgId;
        item.remove();
        this._renumberItems(rgId);
        this._collectRepeatingGroup(rgId);
        this._saveDebounced();
      }
    });
  }

  /* ── Repeating group helpers ────────────────────────────────── */

  _addRepeatingItem(field, container, idx, values = {}) {
    const item = document.createElement('div');
    item.className   = 'repeating-group__item';
    item.dataset.rgId = field.id;

    item.innerHTML = `
      <div class="repeating-group__item-header">
        <span class="repeating-group__item-title">${this._singularLabel(field.label)} ${idx + 1}</span>
        <button type="button" class="repeating-group__remove"
                aria-label="Remove ${this._singularLabel(field.label)} ${idx + 1}">
          Remove
        </button>
      </div>
      <div class="field-grid-2">
        ${field.subfields.map(sf => this._renderSubfield(sf, field.id, idx)).join('')}
      </div>
    `;
    container.appendChild(item);

    // Populate values
    field.subfields.forEach(sf => {
      const el = item.querySelector(`[name="${field.id}[${idx}][${sf.id}]"]`);
      if (el && values[sf.id] !== undefined) el.value = values[sf.id];
    });

    // Wire auto-suggest selects (only populate when target field is empty)
    item.querySelectorAll('[data-suggest-field]').forEach(selectEl => {
      const targetFieldId  = selectEl.dataset.suggestField;
      const suggestions    = JSON.parse(selectEl.dataset.suggestions || '{}');
      selectEl.addEventListener('change', () => {
        const suggestion = suggestions[selectEl.value];
        if (!suggestion) return;
        const targetEl = item.querySelector(`[name*="[${targetFieldId}]"]`);
        if (targetEl && !targetEl.value.trim()) {
          targetEl.value = suggestion;
          this._collectRepeatingGroup(field.id);
          this._saveDebounced();
        }
      });
    });

    // Attach listeners
    item.addEventListener('input',  () => { this._collectRepeatingGroup(field.id); this._saveDebounced(); });
    item.addEventListener('change', () => { this._collectRepeatingGroup(field.id); this._saveDebounced(); });
  }

  _renderSubfield(sf, rgId, idx) {
    const nameAttr = `${rgId}[${idx}][${sf.id}]`;
    const idAttr   = `${rgId}-${idx}-${sf.id}`;
    const hint     = sf.hint ? `<span class="form-hint">${sf.hint}</span>` : '';
    const full     = ['risk_description', 'treatment', 'rec_description', 'action_description'].includes(sf.id)
                   ? 'field-grid-full' : '';

    switch (sf.type) {
      case 'text':
      case 'date':
        return `
          <div class="form-group ${full}">
            <label class="form-label" for="${idAttr}">${sf.label}${sf.required ? '<span class="form-required">*</span>' : ''}</label>
            ${hint}
            <input class="form-input" type="${sf.type}" id="${idAttr}" name="${nameAttr}"
                   ${sf.placeholder ? `placeholder="${sf.placeholder}"` : ''}>
          </div>`;
      case 'textarea':
        return `
          <div class="form-group ${full}">
            <label class="form-label" for="${idAttr}">${sf.label}${sf.required ? '<span class="form-required">*</span>' : ''}</label>
            ${hint}
            <textarea class="form-textarea" id="${idAttr}" name="${nameAttr}" rows="3"
                      placeholder="${sf.placeholder ?? ''}"></textarea>
          </div>`;
      case 'select': {
        const suggestAttrs = sf.suggestField
          ? `data-suggest-field="${sf.suggestField}" data-suggestions='${JSON.stringify(sf.suggestions ?? {})}'`
          : '';
        return `
          <div class="form-group ${full}">
            <label class="form-label" for="${idAttr}">${sf.label}${sf.required ? '<span class="form-required">*</span>' : ''}</label>
            <select class="form-select" id="${idAttr}" name="${nameAttr}" ${suggestAttrs}>
              ${sf.options.map(o => `<option value="${o.value}">${o.label}</option>`).join('')}
            </select>
          </div>`;
      }
      default:
        return '';
    }
  }

  _collectRepeatingGroup(rgId) {
    const container = document.getElementById(`rg-${rgId}`);
    if (!container) return;
    const items = [];
    container.querySelectorAll('.repeating-group__item').forEach((item, idx) => {
      const obj = {};
      item.querySelectorAll('input, select, textarea').forEach(el => {
        const match = el.name?.match(/\[\d+\]\[(.+)\]$/);
        if (match) obj[match[1]] = el.value;
      });
      items.push(obj);
    });
    this.state[rgId] = items;
  }

  _collectAppTable(apps) {
    const result = {};
    apps.forEach(app => {
      result[app.num] = {
        applicable: document.getElementById(`app-${app.num}-applicable`)?.value ?? '',
        compliant:  document.getElementById(`app-${app.num}-compliant`)?.value  ?? '',
        notes:      document.getElementById(`app-${app.num}-notes`)?.value      ?? '',
      };
    });
    this.state.apps = result;
  }

  _renumberItems(rgId) {
    const container = document.getElementById(`rg-${rgId}`);
    container?.querySelectorAll('.repeating-group__item').forEach((item, idx) => {
      const title = item.querySelector('.repeating-group__item-title');
      // Extract singular label from first item's existing text
      if (title) {
        const parts = title.textContent.trim().split(' ');
        parts[parts.length - 1] = idx + 1;
        title.textContent = parts.join(' ');
      }
      // Renumber input names
      item.querySelectorAll('input, select, textarea').forEach(el => {
        el.name  = el.name?.replace(/\[\d+\]/, `[${idx}]`);
        el.id    = el.id?.replace(/-\d+-/, `-${idx}-`);
      });
      item.querySelectorAll('label').forEach(lbl => {
        lbl.htmlFor = lbl.htmlFor?.replace(/-\d+-/, `-${idx}-`);
      });
    });
  }

  _singularLabel(label) {
    // Quick heuristic — remove trailing 's' for common plural labels
    return label.replace(/s$/, '');
  }

  /* ── State collection ───────────────────────────────────────── */

  _collectStep(stepIdx) {
    const step = this.steps[stepIdx];
    step.fields.forEach(field => {
      if (field.type === 'repeating-group') {
        this._collectRepeatingGroup(field.id);
      } else if (field.type === 'app-table') {
        this._collectAppTable(field.apps);
      } else if (field.type === 'checkbox-other') {
        this.state[field.id] = Array.from(
          document.querySelectorAll(`input[name="${field.id}"]:checked`)
        ).map(el => el.value);
        const otherInput = document.getElementById(`${field.id}__other`);
        if (otherInput) this.state[`${field.id}__other`] = otherInput.value;
      } else if (field.type === 'checkbox') {
        const checked = Array.from(
          document.querySelectorAll(`input[name="${field.id}"]:checked`)
        ).map(el => el.value);
        this.state[field.id] = checked;
      } else if (field.type === 'radio') {
        const checked = document.querySelector(`input[name="${field.id}"]:checked`);
        this.state[field.id] = checked?.value ?? '';
      } else {
        const el = document.getElementById(field.id);
        if (el) this.state[field.id] = el.value;
      }
    });
  }

  _collectAll() {
    this.steps.forEach((_, i) => this._collectStep(i));
  }

  /* ── Validation ─────────────────────────────────────────────── */

  _validateStep(stepIdx) {
    const step   = this.steps[stepIdx];
    let   isValid = true;

    step.fields.forEach(field => {
      if (!field.required) return;
      // Skip hidden conditional fields
      const fg = document.getElementById(`fg-${field.id}`);
      if (fg?.style.display === 'none') return;

      let value;
      const errEl   = document.getElementById(`err-${field.id}`);
      const inputEl = field.type === 'radio'
        ? document.querySelector(`input[name="${field.id}"]`)
        : document.getElementById(field.id);

      if (field.type === 'radio') {
        value = document.querySelector(`input[name="${field.id}"]:checked`)?.value;
      } else if (field.type === 'checkbox-other' || field.type === 'checkbox') {
        value = Array.from(document.querySelectorAll(`input[name="${field.id}"]:checked`));
        value = value.length > 0 ? value : null;
      } else if (field.type === 'repeating-group') {
        const container = document.getElementById(`rg-${field.id}`);
        value = container?.querySelectorAll('.repeating-group__item').length > 0 ? true : null;
      } else {
        value = inputEl?.value?.trim();
      }

      if (!value || value === '') {
        isValid = false;
        if (errEl) errEl.textContent = 'This field is required.';
        if (inputEl) { inputEl.classList.add('is-invalid'); inputEl.setAttribute('aria-invalid', 'true'); }
      } else {
        if (errEl) errEl.textContent = '';
        if (inputEl) { inputEl.classList.remove('is-invalid'); inputEl.removeAttribute('aria-invalid'); }
      }
    });

    return isValid;
  }

  /* ── Navigation ─────────────────────────────────────────────── */

  next() {
    this._collectStep(this.currentStep);
    if (!this._validateStep(this.currentStep)) return;
    this._persist();

    if (this.currentStep < this.steps.length - 1) {
      this.currentStep++;
      this._updateUI();
    } else {
      this._submit();
    }
  }

  prev() {
    this._collectStep(this.currentStep);
    this._persist();
    if (this.currentStep > 0) {
      this.currentStep--;
      this._updateUI();
    }
  }

  /* ── UI update ──────────────────────────────────────────────── */

  _updateUI() {
    // Step panels
    document.querySelectorAll('.wizard__step').forEach((el, i) => {
      el.classList.toggle('is-active', i === this.currentStep);
    });
    // Step indicator
    document.querySelectorAll('.step-indicator__item').forEach((el, i) => {
      el.classList.toggle('is-active',   i === this.currentStep);
      el.classList.toggle('is-complete', i < this.currentStep);
      el.setAttribute('aria-current', i === this.currentStep ? 'step' : 'false');
      const circle = el.querySelector('.step-indicator__circle');
      if (circle) circle.innerHTML = i < this.currentStep
        ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>'
        : i + 1;
    });
    // Buttons
    const prevBtn = document.getElementById('btn-prev');
    const nextBtn = document.getElementById('btn-next');
    if (prevBtn) prevBtn.disabled = this.currentStep === 0;
    if (nextBtn) nextBtn.textContent = this.currentStep === this.steps.length - 1 ? 'Submit' : 'Next';
    // Conditional visibility
    this._updateConditionalVisibility();
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /* ── Conditional field visibility ───────────────────────────── */

  _updateConditionalVisibility() {
    document.querySelectorAll('[data-show-if-field]').forEach(fg => {
      const controlId = fg.dataset.showIfField;
      const values    = fg.dataset.showIfValues?.split(',') ?? [];
      let   current   = '';
      const radio = document.querySelector(`input[name="${controlId}"]:checked`);
      if (radio) {
        current = radio.value;
      } else {
        const el = document.getElementById(controlId);
        if (el) current = el.value;
      }
      fg.style.display = values.includes(current) ? '' : 'none';
    });
  }

  /* ── Change handler ─────────────────────────────────────────── */

  _onFieldChange(e) {
    // Toggle "Other" reveal for checkbox-other fields
    if (e.target.matches('.checkbox-other-trigger')) {
      const wrap = document.getElementById(`${e.target.dataset.reveals}-wrap`);
      if (wrap) wrap.hidden = !e.target.checked;
    }

    // Collect __other text input changes immediately
    if (e.target.name?.endsWith('__other')) {
      this.state[e.target.name] = e.target.value;
      this._showSaving();
      this._saveDebounced();
      return;
    }

    this._updateConditionalVisibility();
    const step = this.steps[this.currentStep];
    step?.fields.forEach(field => {
      if (field.type === 'repeating-group' || field.type === 'app-table') return;
      const el = e.target;
      if (el.name === field.id || el.id === field.id) {
        if (field.type === 'radio') {
          this.state[field.id] = document.querySelector(`input[name="${field.id}"]:checked`)?.value ?? '';
        } else if (field.type === 'checkbox' || field.type === 'checkbox-other') {
          this.state[field.id] = Array.from(
            document.querySelectorAll(`input[name="${field.id}"]:checked`)
          ).map(cb => cb.value);
          if (field.type === 'checkbox-other') {
            const oi = document.getElementById(`${field.id}__other`);
            if (oi) this.state[`${field.id}__other`] = oi.value;
          }
        } else {
          this.state[field.id] = el.value;
        }
      }
    });
    this._showSaving();
    this._saveDebounced();
  }

  /* ── Persistence ────────────────────────────────────────────── */

  _persist() {
    saveState(this.type, this.state);
    this._showSaved();
  }

  _showSaving() {
    const ind = document.getElementById('save-indicator');
    if (!ind) return;
    ind.className = 'save-indicator save-indicator--saving';
    ind.querySelector('.save-indicator__text').textContent = 'Saving…';
  }

  _showSaved() {
    const ind = document.getElementById('save-indicator');
    if (!ind) return;
    ind.className = 'save-indicator save-indicator--saved';
    ind.querySelector('.save-indicator__text').textContent = 'Saved';
    setTimeout(() => {
      ind.className = 'save-indicator';
      ind.querySelector('.save-indicator__text').textContent = 'Changes saved';
    }, 2000);
  }

  /* ── Submit ─────────────────────────────────────────────────── */

  _submit() {
    this._collectAll();
    this._persist();
    if (this.onComplete) this.onComplete(this.state);
  }

  /* ── Import callback ────────────────────────────────────────── */

  _attachImport() {
    initImport({
      type:     this.type,
      onImport: (state) => {
        this._applyState(state);
        this.currentStep = 0;
        this._updateUI();
      },
    });
  }

  /* ── Public helpers ─────────────────────────────────────────── */

  /** Return a flat copy of current state */
  getState() {
    this._collectAll();
    return { ...this.state };
  }
}
