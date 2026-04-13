/**
 * threshold.js — Threshold assessment question definitions and scoring logic.
 *
 * Based on the OAIC Privacy Impact Assessment Guide (2023) threshold criteria.
 * Customise questions by editing the STEPS array below.
 */

export const ASSESSMENT_TYPE = 'threshold';

export const STEPS = [
  /* ── Step 0: Project details ──────────────────────────────── */
  {
    id:       'project-details',
    title:    'Project details',
    desc:     'Provide basic information about the project or activity being assessed.',
    fields: [
      {
        id:       'project_name',
        type:     'text',
        label:    'Project / activity name',
        required: true,
        placeholder: 'e.g. Customer Data Portal Upgrade',
      },
      {
        id:       'project_description',
        type:     'textarea',
        label:    'Project description',
        hint:     'Briefly describe the purpose and scope of the project.',
        required: true,
        placeholder: 'What is this project trying to achieve?',
      },
      {
        id:       'project_owner',
        type:     'text',
        label:    'Project owner / responsible person',
        required: true,
        placeholder: 'e.g. Jane Smith, General Counsel',
      },
      {
        id:       'business_unit',
        type:     'text',
        label:    'Business unit or team',
        required: false,
        placeholder: 'e.g. Technology & Innovation',
      },
      {
        id:       'assessment_date',
        type:     'date',
        label:    'Assessment date',
        required: true,
      },
      {
        id:       'assessor_name',
        type:     'text',
        label:    'Assessor name',
        required: false,
        placeholder: 'Person completing this threshold assessment',
      },
    ],
  },

  /* ── Step 1: Personal information ─────────────────────────── */
  {
    id:    'personal-information',
    title: 'Personal information',
    desc:  'Determine whether the project involves personal information as defined in the Privacy Act 1988 (Cth).',
    hint:  '"Personal information" means information or an opinion about an identified individual, or an individual who is reasonably identifiable.',
    fields: [
      {
        id:       'involves_pi',
        type:     'radio',
        label:    'Does this project collect, use, store, disclose, or otherwise handle personal information?',
        required: true,
        options: [
          { value: 'yes',     label: 'Yes — the project involves personal information' },
          { value: 'no',      label: 'No — the project does not involve personal information' },
          { value: 'unsure',  label: 'Unsure — I need to investigate further' },
        ],
      },
      {
        id:         'pi_examples',
        type:       'textarea',
        label:      'If yes or unsure, describe the personal information involved',
        hint:       'e.g. names, contact details, health records, financial information, employee records.',
        required:   false,
        placeholder: 'List the types of personal information involved...',
        showIf:     { field: 'involves_pi', values: ['yes', 'unsure'] },
      },
      {
        id:       'new_or_changed',
        type:     'radio',
        label:    'Is this a new way of collecting, using, or disclosing personal information, or a significant change to existing practices?',
        required: true,
        options: [
          { value: 'yes',  label: 'Yes — new or significantly changed' },
          { value: 'no',   label: 'No — continuation of existing practices without significant change' },
          { value: 'unsure', label: 'Unsure' },
        ],
      },
    ],
  },

  /* ── Step 2: Nature of personal information ────────────────── */
  {
    id:    'information-nature',
    title: 'Nature of the information',
    desc:  'Identify whether the project involves particularly sensitive categories of information or information about vulnerable groups.',
    fields: [
      {
        id:       'sensitive_info',
        type:     'checkbox',
        label:    'Does the project involve any of the following sensitive categories? (select all that apply)',
        required: false,
        options: [
          { value: 'health',          label: 'Health or medical information' },
          { value: 'genetic',         label: 'Genetic or biometric information' },
          { value: 'financial',       label: 'Financial or credit information' },
          { value: 'racial_ethnic',   label: 'Racial or ethnic origin' },
          { value: 'political',       label: 'Political opinions or associations' },
          { value: 'religious',       label: 'Religious or philosophical beliefs' },
          { value: 'sexual',          label: 'Sexual orientation or practices' },
          { value: 'criminal',        label: 'Criminal record information' },
          { value: 'government_id',   label: 'Government-issued identifiers (e.g. TFN, Medicare number)' },
          { value: 'children',        label: 'Information about children or minors' },
          { value: 'none',            label: 'None of the above' },
        ],
      },
      {
        id:       'sensitive_notes',
        type:     'textarea',
        label:    'Additional notes on sensitive information (optional)',
        required: false,
        placeholder: 'e.g. health records of employees, tax file numbers for payroll processing...',
      },
    ],
  },

  /* ── Step 3: Risk indicators ───────────────────────────────── */
  {
    id:    'risk-indicators',
    title: 'Risk indicators',
    desc:  'Identify risk factors that may increase the privacy impact of this project. These inform whether a full PIA is warranted.',
    fields: [
      {
        id:       'risk_large_volume',
        type:     'radio',
        label:    'Does the project involve a large number of individuals (more than 10,000 people)?',
        required: true,
        options: [
          { value: 'yes', label: 'Yes' },
          { value: 'no',  label: 'No' },
        ],
      },
      {
        id:       'risk_new_technology',
        type:     'radio',
        label:    'Does the project use new or emerging technology that could affect how personal information is handled (e.g. AI/ML, facial recognition, surveillance)?',
        required: true,
        options: [
          { value: 'yes', label: 'Yes' },
          { value: 'no',  label: 'No' },
        ],
      },
      {
        id:       'risk_data_matching',
        type:     'radio',
        label:    'Does the project involve data matching, aggregation, or linking of personal information from multiple sources?',
        required: true,
        options: [
          { value: 'yes', label: 'Yes' },
          { value: 'no',  label: 'No' },
        ],
      },
      {
        id:       'risk_third_party',
        type:     'radio',
        label:    'Does the project involve disclosing personal information to, or collecting it from, third parties (including contractors, service providers, or other organisations)?',
        required: true,
        options: [
          { value: 'yes', label: 'Yes' },
          { value: 'no',  label: 'No' },
        ],
      },
      {
        id:       'risk_overseas',
        type:     'radio',
        label:    'Does the project involve transferring or storing personal information outside Australia?',
        required: true,
        options: [
          { value: 'yes', label: 'Yes' },
          { value: 'no',  label: 'No' },
        ],
      },
      {
        id:       'risk_direct_marketing',
        type:     'radio',
        label:    'Will personal information be used for direct marketing or targeted advertising?',
        required: true,
        options: [
          { value: 'yes', label: 'Yes' },
          { value: 'no',  label: 'No' },
        ],
      },
      {
        id:       'risk_profiling',
        type:     'radio',
        label:    'Does the project involve profiling, surveillance, or systematic monitoring of individuals?',
        required: true,
        options: [
          { value: 'yes', label: 'Yes' },
          { value: 'no',  label: 'No' },
        ],
      },
      {
        id:       'risk_notes',
        type:     'textarea',
        label:    'Additional context on any risk indicators (optional)',
        required: false,
        placeholder: 'Provide any additional context that may affect the risk assessment...',
      },
    ],
  },
];

/* ── Scoring logic ──────────────────────────────────────────── */

/**
 * Compute the threshold assessment outcome from collected state.
 *
 * @param {object} state - Flat map of field id → value(s)
 * @returns {{ outcome: 'none'|'short'|'full', rationale: string[], title: string }}
 */
export function computeOutcome(state) {
  // 1. No personal information → No PIA
  if (state.involves_pi === 'no') {
    return {
      outcome: 'none',
      title:   'No PIA required',
      rationale: [
        'The project does not appear to involve personal information as defined in the Privacy Act 1988 (Cth).',
        'No Privacy Impact Assessment is required at this time.',
        'If the project scope changes to include personal information handling, this assessment should be revisited.',
      ],
    };
  }

  // Count high-risk indicators
  const riskFields = [
    'risk_large_volume',
    'risk_new_technology',
    'risk_data_matching',
    'risk_third_party',
    'risk_overseas',
    'risk_direct_marketing',
    'risk_profiling',
  ];
  const highRiskCount = riskFields.filter(f => state[f] === 'yes').length;

  // Sensitive information check
  const sensitiveSelected = Array.isArray(state.sensitive_info)
    ? state.sensitive_info.filter(v => v !== 'none')
    : (state.sensitive_info && state.sensitive_info !== 'none' ? [state.sensitive_info] : []);
  const hasSensitive = sensitiveSelected.length > 0;

  // 2. Full PIA if: sensitive info OR ≥3 risk indicators OR unsure about PI involvement
  if (hasSensitive || highRiskCount >= 3 || state.involves_pi === 'unsure') {
    const reasons = [];
    if (state.involves_pi === 'unsure') {
      reasons.push('There is uncertainty about whether the project involves personal information.');
    }
    if (hasSensitive) {
      reasons.push(`The project involves sensitive categories of personal information: ${sensitiveSelected.join(', ')}.`);
    }
    if (highRiskCount >= 3) {
      reasons.push(`${highRiskCount} risk indicators were identified, indicating elevated privacy risk.`);
    }
    return {
      outcome: 'full',
      title:   'Full PIA recommended',
      rationale: [
        ...reasons,
        'A comprehensive Privacy Impact Assessment is recommended to thoroughly assess privacy risks and ensure compliance with the Privacy Act 1988 (Cth) and the Australian Privacy Principles.',
      ],
    };
  }

  // 3. Short-form PIA
  const reasons = ['The project involves personal information.'];
  if (highRiskCount > 0) {
    reasons.push(`${highRiskCount} risk indicator(s) were identified.`);
  }
  reasons.push('A short-form Privacy Impact Assessment is appropriate to document privacy risks and controls.');

  return {
    outcome: 'short',
    title:   'Short-form PIA recommended',
    rationale: reasons,
  };
}
