/**
 * risk-suggest.js — Derives suggested privacy risks from earlier wizard answers.
 *
 * Usage:
 *   import { deriveRisks } from './risk-suggest.js';
 *   const suggested = deriveRisks(wizardState, RISK_SUGGESTIONS);
 *
 * Each returned object is ready to be passed directly to wizard.addRepeatingItems().
 */

/**
 * Analyse wizard state (from sections 1–3) and return an array of suggested
 * risk objects for the risk register. Each risk is deduped by category.
 *
 * @param {object} state       - Flat wizard state map (fieldId → value).
 * @param {object} suggestions - Map of risk_category → treatment text.
 * @returns {Array<{risk_category, risk_description, likelihood, consequence, risk_rating, treatment, residual_risk, risk_owner}>}
 */
export function deriveRisks(state, suggestions) {
  const derived = [];
  const seen    = new Set();

  function add({ risk_category, risk_description, likelihood, consequence, risk_rating }) {
    if (seen.has(risk_category)) return;
    seen.add(risk_category);
    derived.push({
      risk_category,
      risk_description,
      likelihood,
      consequence,
      risk_rating,
      treatment:     suggestions[risk_category] ?? '',
      residual_risk: '',
      risk_owner:    '',
    });
  }

  const infoTypes       = Array.isArray(state.info_types)       ? state.info_types       : [];
  const storageLocs     = Array.isArray(state.storage_location)  ? state.storage_location  : [];
  const secMeasures     = Array.isArray(state.security_measures) ? state.security_measures : [];

  // ── Children's privacy ───────────────────────────────────────────────────
  if (['yes', 'unsure'].includes(state.children_involved)) {
    add({
      risk_category:    'childrens_privacy',
      risk_description: 'The project involves personal information of minors, creating heightened obligations under the Children\'s Online Privacy Code and the Privacy and Other Legislation Amendment Act 2024 (Cth). Failure to meet age verification, parental consent, and data minimisation requirements may expose the organisation to regulatory action.',
      likelihood:       'Medium',
      consequence:      'High',
      risk_rating:      'High',
    });
  }

  // ── Cross-border transfer ────────────────────────────────────────────────
  if (state.overseas_transfer === 'yes' || storageLocs.includes('cloud_os')) {
    add({
      risk_category:    'cross_border',
      risk_description: state.overseas_transfer === 'yes'
        ? 'Personal information is transferred to overseas recipients, requiring compliance with APP 8 and an assessment of whether the destination country provides comparable privacy protections to Australia.'
        : 'Personal information is stored in offshore cloud infrastructure, which may constitute a cross-border disclosure under APP 8 regardless of whether a formal transfer is intended.',
      likelihood:       'High',
      consequence:      'Medium',
      risk_rating:      'High',
    });
  }

  // ── Direct marketing / targeting & profiling ─────────────────────────────
  if (['yes', 'unsure'].includes(state.direct_marketing)) {
    add({
      risk_category:    'targeting_profiling',
      risk_description: 'The project involves direct marketing or profiling of individuals. The Privacy and Other Legislation Amendment Act 2024 (Cth) requires a clear, accessible opt-out mechanism and timely honouring of opt-out requests. Failure to comply may result in regulatory action and reputational harm.',
      likelihood:       'Medium',
      consequence:      'Medium',
      risk_rating:      'Medium',
    });
  }

  // ── Lack of transparency ─────────────────────────────────────────────────
  if (['no', 'partial'].includes(state.collection_notice)) {
    add({
      risk_category:    'lack_of_transparency',
      risk_description: state.collection_notice === 'no'
        ? 'No collection notice is provided to individuals. This is likely to breach APP 5 (notification of collection) and may undermine trust and individual rights to know how their information is used.'
        : 'Collection notices are only partially provided. Individuals in some channels or scenarios may not be informed about the collection of their personal information, creating transparency and APP 5 compliance gaps.',
      likelihood:       'High',
      consequence:      'Medium',
      risk_rating:      'High',
    });
  }

  // ── Inadequate consent ───────────────────────────────────────────────────
  if (state.collection_notice === 'no') {
    add({
      risk_category:    'inadequate_consent',
      risk_description: 'The absence of a collection notice suggests consent mechanisms may not be in place or may be inadequate. Consent must be freely given, specific, informed, and unambiguous. Without proper notice, any purported consent may be invalid.',
      likelihood:       'Medium',
      consequence:      'Medium',
      risk_rating:      'Medium',
    });
  }

  // ── Unauthorised access (sensitive information) ──────────────────────────
  if (['yes', 'unsure'].includes(state.sensitive_info)) {
    add({
      risk_category:    'unauthorised_access',
      risk_description: 'The project handles sensitive personal information (e.g. health, biometric, racial or ethnic origin data). Sensitive information attracts heightened protections under the Privacy Act 1988 (Cth) — unauthorised access or disclosure could cause significant harm to individuals and serious regulatory consequences for the organisation.',
      likelihood:       'Medium',
      consequence:      'High',
      risk_rating:      'High',
    });
  }

  // ── Identity fraud (government identifiers) ──────────────────────────────
  if (infoTypes.includes('gov_id')) {
    add({
      risk_category:    'identity_fraud',
      risk_description: 'The project collects government-issued identifiers (e.g. Tax File Number, Medicare number, driver\'s licence). APP 9 restricts the adoption, use, and disclosure of government identifiers. Compromise or misuse of these identifiers creates a significant identity theft and fraud risk for affected individuals.',
      likelihood:       'Low',
      consequence:      'High',
      risk_rating:      'Medium',
    });
  }

  // ── Data breach (NDB plan status) ────────────────────────────────────────
  if (state.ndb_plan === 'no') {
    add({
      risk_category:    'data_breach',
      risk_description: 'No Data Breach Response Plan is in place. Without a tested plan, the organisation may fail to meet the tighter notification timelines and thresholds introduced by the Privacy and Other Legislation Amendment Act 2024 (Cth), increasing regulatory exposure and reputational harm in the event of an eligible data breach.',
      likelihood:       'Medium',
      consequence:      'High',
      risk_rating:      'High',
    });
  } else if (state.ndb_plan === 'in_progress') {
    add({
      risk_category:    'data_breach',
      risk_description: 'A Data Breach Response Plan is in progress but not yet finalised or tested. Until the plan is complete, the organisation carries elevated risk of delayed or non-compliant response to a notifiable data breach under the NDB scheme.',
      likelihood:       'Low',
      consequence:      'High',
      risk_rating:      'Medium',
    });
  }

  // ── Data breach (third-party disclosure, if not already added) ───────────
  if (state.third_party_disclosure === 'yes' && !seen.has('data_breach')) {
    add({
      risk_category:    'data_breach',
      risk_description: 'Personal information is disclosed to third parties, increasing the attack surface and the risk of a data breach or inadvertent disclosure by an external processor or service provider. Third-party arrangements must be governed by appropriate contractual controls and due diligence.',
      likelihood:       'Medium',
      consequence:      'High',
      risk_rating:      'High',
    });
  }

  // ── Insecure storage (missing foundational controls) ─────────────────────
  const hasMFA         = secMeasures.includes('mfa');
  const hasEncryptRest = secMeasures.includes('encrypt_rest');
  if (!hasMFA || !hasEncryptRest) {
    add({
      risk_category:    'insecure_storage',
      risk_description: !hasMFA && !hasEncryptRest
        ? 'Multi-factor authentication (MFA) and encryption at rest are not implemented. These are foundational controls — their absence leaves personal information highly vulnerable to unauthorised access and data loss.'
        : !hasMFA
          ? 'Multi-factor authentication (MFA) has not been implemented. Without MFA, accounts protecting personal information are vulnerable to credential-based attacks such as phishing and password stuffing.'
          : 'Encryption at rest has not been implemented. Data stored without encryption is at significant risk of exposure in the event of physical media theft, unauthorised system access, or improper disposal.',
      likelihood:       'Medium',
      consequence:      'High',
      risk_rating:      'High',
    });
  }

  return derived;
}
