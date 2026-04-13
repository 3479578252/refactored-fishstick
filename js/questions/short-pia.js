/**
 * short-pia.js — Short-form PIA question definitions.
 *
 * Based on the OAIC Short-form Privacy Impact Assessment template.
 * Sections map to the five main areas of a short-form PIA.
 * Customise questions by editing the STEPS array below.
 */

export const ASSESSMENT_TYPE = 'short';

export const STEPS = [
  /* ── Section 1: Project overview ──────────────────────────── */
  {
    id:    'project-overview',
    title: 'Project overview',
    desc:  'Provide basic information about the project or activity being assessed.',
    fields: [
      {
        id:       'project_name',
        type:     'text',
        label:    'Project / activity name',
        required: true,
        placeholder: 'e.g. Staff Performance Management System',
      },
      {
        id:       'project_purpose',
        type:     'textarea',
        label:    'Purpose of the project',
        hint:     'What problem does this project solve? What are its goals?',
        required: true,
        placeholder: 'Describe the purpose and intended outcomes...',
      },
      {
        id:       'project_description',
        type:     'textarea',
        label:    'Description of the project',
        hint:     'Summarise the key activities, systems, or processes involved.',
        required: true,
        placeholder: 'Provide a brief overview of how the project will work...',
      },
      {
        id:       'project_owner',
        type:     'text',
        label:    'Project owner',
        required: true,
        placeholder: 'e.g. Jane Smith, Head of People & Culture',
      },
      {
        id:       'privacy_contact',
        type:     'text',
        label:    'Privacy contact / privacy officer',
        required: false,
        placeholder: 'e.g. John Lee, Privacy Officer',
      },
      {
        id:       'start_date',
        type:     'date',
        label:    'Proposed project start date',
        required: false,
      },
      {
        id:       'assessment_date',
        type:     'date',
        label:    'Date of this assessment',
        required: true,
      },
      {
        id:       'threshold_ref',
        type:     'text',
        label:    'Threshold assessment reference (if applicable)',
        hint:     'Reference any threshold assessment already completed for this project.',
        required: false,
        placeholder: 'e.g. TA-2026-001 or leave blank',
      },
      {
        id:       'legislative_context',
        type:     'textarea',
        label:    'Applicable legislation or policy',
        hint:     'List any legislation, regulations, or organisational policies relevant to privacy in this project.',
        required: false,
        placeholder: 'e.g. Privacy Act 1988 (Cth), Health Records Act 2001 (Vic)...',
      },
    ],
  },

  /* ── Section 2: Personal information involved ──────────────── */
  {
    id:    'personal-information',
    title: 'Personal information involved',
    desc:  'Describe the personal information the project collects, holds, uses, or discloses.',
    fields: [
      {
        id:       'info_types',
        type:     'textarea',
        label:    'What personal information is collected or used?',
        hint:     'List all categories of personal information (e.g. name, address, date of birth, health records).',
        required: true,
        placeholder: 'e.g. Full name, email address, phone number, employment history...',
      },
      {
        id:       'info_subjects',
        type:     'textarea',
        label:    'Whose personal information is involved?',
        hint:     'Describe the individuals whose information is collected (e.g. customers, employees, members of the public).',
        required: true,
        placeholder: 'e.g. Current and former employees, job applicants...',
      },
      {
        id:       'collection_method',
        type:     'textarea',
        label:    'How is personal information collected?',
        hint:     'Describe the methods of collection (e.g. online forms, interviews, third-party data feeds).',
        required: true,
        placeholder: 'e.g. Online self-service portal, paper forms, third-party provider...',
      },
      {
        id:       'collection_notice',
        type:     'radio',
        label:    'Will individuals be notified about collection of their personal information (Collection Notice / Privacy Notice)?',
        required: true,
        options: [
          { value: 'yes',     label: 'Yes — a collection notice will be provided' },
          { value: 'no',      label: 'No — collection notice is not planned' },
          { value: 'partial', label: 'Partial — a notice exists but may need updating' },
          { value: 'unsure',  label: 'Unsure' },
        ],
      },
      {
        id:       'collection_notice_notes',
        type:     'textarea',
        label:    'Notes on collection notice',
        required: false,
        placeholder: 'Describe where and how the collection notice will be provided, or explain why one is not required...',
      },
      {
        id:       'sensitive_info',
        type:     'radio',
        label:    'Does the project involve sensitive information as defined in the Privacy Act?',
        hint:     'Sensitive information includes health, racial/ethnic origin, religious beliefs, criminal record, biometric and genetic data, sexual orientation, and more.',
        required: true,
        options: [
          { value: 'yes',  label: 'Yes' },
          { value: 'no',   label: 'No' },
          { value: 'unsure', label: 'Unsure' },
        ],
      },
      {
        id:       'sensitive_details',
        type:     'textarea',
        label:    'If yes, describe the sensitive information and the legal basis for collecting it',
        required: false,
        placeholder: 'e.g. Health information collected with employee consent for workplace safety purposes...',
        showIf: { field: 'sensitive_info', values: ['yes', 'unsure'] },
      },
      {
        id:       'retention_period',
        type:     'text',
        label:    'Retention period',
        hint:     'How long will personal information be held?',
        required: false,
        placeholder: 'e.g. 7 years after employment ends, or as required by legislation',
      },
      {
        id:       'disposal_method',
        type:     'textarea',
        label:    'Disposal / destruction method',
        hint:     'How will personal information be securely disposed of at the end of its retention period?',
        required: false,
        placeholder: 'e.g. Secure deletion of electronic records, shredding of paper documents...',
      },
    ],
  },

  /* ── Section 3: Information flows ─────────────────────────── */
  {
    id:    'information-flows',
    title: 'Information flows',
    desc:  'Describe how personal information moves within and outside the organisation.',
    fields: [
      {
        id:       'internal_access',
        type:     'textarea',
        label:    'Who within the organisation has access to the personal information?',
        hint:     'Describe the roles or teams that will access personal information and why.',
        required: true,
        placeholder: 'e.g. HR team, line managers — for performance review purposes only...',
      },
      {
        id:       'storage_location',
        type:     'textarea',
        label:    'Where is personal information stored?',
        hint:     'Describe the systems, databases, or locations (physical or digital) where information is held.',
        required: true,
        placeholder: 'e.g. Cloud-based HR system hosted in Australia, encrypted laptop drives...',
      },
      {
        id:       'security_measures',
        type:     'textarea',
        label:    'What security measures protect the personal information?',
        hint:     'Describe technical and organisational controls (e.g. encryption, access controls, audit logs).',
        required: true,
        placeholder: 'e.g. AES-256 encryption at rest, role-based access controls, annual security audits...',
      },
      {
        id:       'third_party_disclosure',
        type:     'radio',
        label:    'Is personal information disclosed to any third parties?',
        required: true,
        options: [
          { value: 'yes', label: 'Yes' },
          { value: 'no',  label: 'No' },
        ],
      },
      {
        id:       'third_party_details',
        type:     'textarea',
        label:    'If yes, describe the third parties and the basis for disclosure',
        required: false,
        placeholder: 'e.g. Payroll provider (ADP) — contractual necessity; ATO — legal obligation...',
        showIf: { field: 'third_party_disclosure', values: ['yes'] },
      },
      {
        id:       'overseas_transfer',
        type:     'radio',
        label:    'Is personal information transferred or stored outside Australia?',
        required: true,
        options: [
          { value: 'yes', label: 'Yes' },
          { value: 'no',  label: 'No' },
        ],
      },
      {
        id:       'overseas_details',
        type:     'textarea',
        label:    'If yes, which countries and what protections apply?',
        hint:     'APP 8 requires that cross-border disclosures comply with comparable privacy protections.',
        required: false,
        placeholder: 'e.g. United States — covered by contractual protections; EU — GDPR equivalent...',
        showIf: { field: 'overseas_transfer', values: ['yes'] },
      },
    ],
  },

  /* ── Section 4: Privacy risk register ─────────────────────── */
  {
    id:    'risk-register',
    title: 'Privacy risk register',
    desc:  'Identify and assess privacy risks associated with the project, and document proposed treatments.',
    hint:  'Add at least one risk. Consider risks across the entire information lifecycle — collection, use, storage, disclosure, and disposal.',
    fields: [
      {
        id:       'risks',
        type:     'repeating-group',
        label:    'Privacy risks',
        addLabel: '+ Add another risk',
        minItems: 1,
        subfields: [
          {
            id:          'risk_description',
            type:        'textarea',
            label:       'Risk description',
            hint:        'Describe the privacy risk — what could go wrong, and how could it affect individuals?',
            required:    true,
            placeholder: 'e.g. Unauthorised access to employee health records due to weak access controls...',
          },
          {
            id:       'risk_app',
            type:     'text',
            label:    'Relevant APP(s) (optional)',
            required: false,
            placeholder: 'e.g. APP 11 (Security of personal information)',
          },
          {
            id:       'likelihood',
            type:     'select',
            label:    'Likelihood',
            required: true,
            options: [
              { value: '',       label: '— Select —' },
              { value: 'High',   label: 'High' },
              { value: 'Medium', label: 'Medium' },
              { value: 'Low',    label: 'Low' },
            ],
          },
          {
            id:       'consequence',
            type:     'select',
            label:    'Consequence',
            required: true,
            options: [
              { value: '',       label: '— Select —' },
              { value: 'High',   label: 'High' },
              { value: 'Medium', label: 'Medium' },
              { value: 'Low',    label: 'Low' },
            ],
          },
          {
            id:       'risk_rating',
            type:     'select',
            label:    'Overall risk rating',
            required: true,
            options: [
              { value: '',          label: '— Select —' },
              { value: 'Critical',  label: 'Critical' },
              { value: 'High',      label: 'High' },
              { value: 'Medium',    label: 'Medium' },
              { value: 'Low',       label: 'Low' },
              { value: 'Negligible', label: 'Negligible' },
            ],
          },
          {
            id:          'treatment',
            type:        'textarea',
            label:       'Proposed treatment / control',
            required:    true,
            placeholder: 'e.g. Implement multi-factor authentication and restrict access to authorised HR staff only...',
          },
          {
            id:       'residual_risk',
            type:     'select',
            label:    'Residual risk (after treatment)',
            required: false,
            options: [
              { value: '',          label: '— Select —' },
              { value: 'High',      label: 'High' },
              { value: 'Medium',    label: 'Medium' },
              { value: 'Low',       label: 'Low' },
              { value: 'Negligible', label: 'Negligible' },
            ],
          },
          {
            id:          'risk_owner',
            type:        'text',
            label:       'Risk owner',
            required:    false,
            placeholder: 'e.g. IT Security Manager',
          },
        ],
      },
    ],
  },

  /* ── Section 5: Recommendations and sign-off ───────────────── */
  {
    id:    'recommendations',
    title: 'Recommendations and sign-off',
    desc:  'Summarise the recommendations arising from this assessment and record sign-off details.',
    fields: [
      {
        id:       'recommendations_text',
        type:     'textarea',
        label:    'Recommendations',
        hint:     'List the key recommendations to address identified privacy risks. Number each recommendation.',
        required: true,
        placeholder: '1. Implement MFA for all users accessing the system.\n2. Update the Privacy Policy to reflect the new data processing activities.\n3. Conduct staff training on handling sensitive information...',
      },
      {
        id:       'privacy_officer_name',
        type:     'text',
        label:    'Privacy officer name',
        required: false,
        placeholder: 'e.g. Alex Johnson',
      },
      {
        id:       'sign_off_date',
        type:     'date',
        label:    'Date of sign-off',
        required: false,
      },
      {
        id:       'approval_status',
        type:     'select',
        label:    'Approval status',
        required: true,
        options: [
          { value: 'Draft',    label: 'Draft' },
          { value: 'Pending',  label: 'Pending approval' },
          { value: 'Approved', label: 'Approved' },
          { value: 'Rejected', label: 'Rejected — requires revision' },
        ],
      },
      {
        id:       'additional_notes',
        type:     'textarea',
        label:    'Additional notes',
        required: false,
        placeholder: 'Any other relevant information...',
      },
    ],
  },
];
