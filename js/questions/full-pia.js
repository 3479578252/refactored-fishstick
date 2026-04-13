/**
 * full-pia.js — Full PIA question definitions.
 *
 * Based on the OAIC Full Privacy Impact Assessment template and
 * the Australian Privacy Principles (APPs 1–13).
 * Customise by editing the STEPS array below.
 */

export const ASSESSMENT_TYPE = 'full';

export const STEPS = [
  /* ── Section 1: Project description ───────────────────────── */
  {
    id:    'project-description',
    title: 'Project description',
    desc:  'Provide a comprehensive description of the project or activity being assessed.',
    fields: [
      {
        id:       'project_name',
        type:     'text',
        label:    'Project / activity name',
        required: true,
        placeholder: 'e.g. National Customer Identity Verification Platform',
      },
      {
        id:       'project_purpose',
        type:     'textarea',
        label:    'Purpose of the project',
        hint:     'Describe the business or policy objective this project addresses.',
        required: true,
        placeholder: 'What problem does this project solve? What is it intended to achieve?',
      },
      {
        id:       'project_description',
        type:     'textarea',
        label:    'Detailed project description',
        hint:     'Describe the key components, processes, and systems involved.',
        required: true,
        placeholder: 'Provide a comprehensive overview of how the project works...',
      },
      {
        id:       'project_owner',
        type:     'text',
        label:    'Project owner',
        required: true,
        placeholder: 'e.g. Sarah Chen, Chief Technology Officer',
      },
      {
        id:       'senior_responsible_officer',
        type:     'text',
        label:    'Senior responsible officer',
        required: false,
        placeholder: 'e.g. Michael Park, CEO',
      },
      {
        id:       'privacy_officer',
        type:     'text',
        label:    'Privacy officer',
        required: false,
        placeholder: 'e.g. Alex Johnson, Privacy Officer',
      },
      {
        id:       'assessment_date',
        type:     'date',
        label:    'Date of this assessment',
        required: true,
      },
      {
        id:       'project_stage',
        type:     'select',
        label:    'Project stage',
        required: true,
        options: [
          { value: '',           label: '— Select —' },
          { value: 'Concept',    label: 'Concept / planning' },
          { value: 'Design',     label: 'Design' },
          { value: 'Build',      label: 'Build / development' },
          { value: 'Test',       label: 'Testing' },
          { value: 'Deployment', label: 'Deployment' },
          { value: 'Review',     label: 'Post-implementation review' },
        ],
      },
      {
        id:       'threshold_ref',
        type:     'text',
        label:    'Threshold assessment reference (if applicable)',
        required: false,
        placeholder: 'e.g. TA-2026-001',
      },
      {
        id:       'legislative_context',
        type:     'textarea',
        label:    'Applicable legislation and policy',
        hint:     'List legislation, regulations, and policies that apply to this project.',
        required: true,
        placeholder: 'e.g. Privacy Act 1988 (Cth), Australian Privacy Principles, Telecommunications Act 1997, organisational Privacy Policy...',
      },
    ],
  },

  /* ── Section 2: Stakeholder consultation ──────────────────── */
  {
    id:    'stakeholder-consultation',
    title: 'Stakeholder consultation',
    desc:  'Document the consultation undertaken with internal and external stakeholders as part of this PIA.',
    hint:  'The OAIC recommends early and meaningful consultation with affected individuals and relevant stakeholders.',
    fields: [
      {
        id:       'internal_stakeholders',
        type:     'textarea',
        label:    'Internal stakeholders consulted',
        hint:     'List internal teams, roles, or individuals consulted during this PIA.',
        required: true,
        placeholder: 'e.g. IT Security, Legal & Compliance, Human Resources, Finance, Marketing...',
      },
      {
        id:       'external_consultation',
        type:     'radio',
        label:    'Was external or community consultation conducted?',
        required: true,
        options: [
          { value: 'yes',     label: 'Yes' },
          { value: 'no',      label: 'No' },
          { value: 'planned', label: 'Planned but not yet completed' },
        ],
      },
      {
        id:       'external_details',
        type:     'textarea',
        label:    'If yes, describe external stakeholders and consultation methods',
        required: false,
        placeholder: 'e.g. Surveyed 200 customers via online survey; met with consumer advocacy groups; consulted the OAIC...',
        showIf: { field: 'external_consultation', values: ['yes', 'planned'] },
      },
      {
        id:       'consultation_outcomes',
        type:     'textarea',
        label:    'Consultation outcomes and how they were addressed',
        hint:     'Summarise the key issues raised and how they have been taken into account in this PIA.',
        required: false,
        placeholder: 'e.g. Customers expressed concern about data sharing with third parties — addressed by introducing opt-out mechanism...',
      },
      {
        id:       'oaic_consultation',
        type:     'radio',
        label:    'Was the Office of the Australian Information Commissioner (OAIC) consulted?',
        required: false,
        options: [
          { value: 'yes', label: 'Yes' },
          { value: 'no',  label: 'No' },
          { value: 'planned', label: 'Planned' },
        ],
      },
    ],
  },

  /* ── Section 3: Information flows ─────────────────────────── */
  {
    id:    'information-flows',
    title: 'Information flows',
    desc:  'Provide a detailed description of all personal information flows associated with the project.',
    fields: [
      {
        id:       'info_types',
        type:     'textarea',
        label:    'Categories of personal information collected',
        hint:     'List all categories of personal information, including sensitive information.',
        required: true,
        placeholder: 'e.g. Name, date of birth, contact details, health records, biometric data...',
      },
      {
        id:       'info_subjects',
        type:     'textarea',
        label:    'Individuals whose information is involved',
        required: true,
        placeholder: 'e.g. Customers, employees, suppliers, members of the public...',
      },
      {
        id:       'volume',
        type:     'text',
        label:    'Approximate number of individuals affected',
        required: false,
        placeholder: 'e.g. ~50,000 customers; all 1,200 employees',
      },
      {
        id:       'collection_sources',
        type:     'textarea',
        label:    'Collection sources',
        hint:     'Describe from where (and from whom) personal information is collected.',
        required: true,
        placeholder: 'e.g. Directly from individuals via online forms; from partner organisations; from government databases...',
      },
      {
        id:       'collection_method',
        type:     'textarea',
        label:    'Collection methods',
        required: true,
        placeholder: 'e.g. Web form, mobile app, paper form, API data feed, CCTV, biometric scanner...',
      },
      {
        id:       'use_purpose',
        type:     'textarea',
        label:    'Purpose of use',
        hint:     'How will the personal information be used? Is use consistent with the reason for collection?',
        required: true,
        placeholder: 'e.g. To verify customer identity; to process payments; to comply with AML obligations...',
      },
      {
        id:       'internal_disclosures',
        type:     'textarea',
        label:    'Internal disclosures',
        hint:     'Which internal teams or systems will receive or access the information?',
        required: false,
        placeholder: 'e.g. Customer service team (read-only), Finance (payment data only), IT (system logs only)...',
      },
      {
        id:       'external_disclosures',
        type:     'textarea',
        label:    'External disclosures',
        hint:     'To which third parties (if any) will information be disclosed, and why?',
        required: false,
        placeholder: 'e.g. Payment processor (PCI DSS certified), credit reporting agency (legal obligation), cloud host (data processor)...',
      },
      {
        id:       'overseas_transfer',
        type:     'radio',
        label:    'Is personal information transferred or stored overseas?',
        required: true,
        options: [
          { value: 'yes', label: 'Yes' },
          { value: 'no',  label: 'No' },
        ],
      },
      {
        id:       'overseas_details',
        type:     'textarea',
        label:    'If yes, countries and protections',
        hint:     'Identify countries and describe the protections in place (APP 8).',
        required: false,
        placeholder: 'e.g. US (contractual protections equivalent to APPs), EU (GDPR compliance)...',
        showIf: { field: 'overseas_transfer', values: ['yes'] },
      },
      {
        id:       'storage_location',
        type:     'textarea',
        label:    'Storage and infrastructure',
        required: true,
        placeholder: 'e.g. AWS Sydney region (encrypted at rest and in transit), on-premises servers in locked data centre...',
      },
      {
        id:       'retention_period',
        type:     'textarea',
        label:    'Retention and disposal',
        hint:     'How long is information held and how is it securely disposed of?',
        required: true,
        placeholder: 'e.g. 7 years for financial records (legal requirement); 3 years for general customer records; securely deleted via DoD 5220.22-M standard...',
      },
    ],
  },

  /* ── Section 4: APP compliance checklist ──────────────────── */
  {
    id:    'app-compliance',
    title: 'APP compliance checklist',
    desc:  'Assess compliance with each of the 13 Australian Privacy Principles (APPs). For each, indicate whether it is applicable, the compliance status, and any relevant notes.',
    fields: [
      {
        id:   'apps',
        type: 'app-table',
        apps: [
          { num: 1,  title: 'Open and transparent management of personal information', desc: 'Have an up-to-date Privacy Policy; manage personal information in an open and transparent way.' },
          { num: 2,  title: 'Anonymity and pseudonymity', desc: 'Where lawful and practicable, individuals should have the option of not identifying themselves or using a pseudonym.' },
          { num: 3,  title: 'Collection of solicited personal information', desc: 'Only collect personal information that is reasonably necessary, and only by lawful and fair means.' },
          { num: 4,  title: 'Dealing with unsolicited personal information', desc: 'If you receive information you did not solicit, assess whether you could have collected it, and if not, destroy/de-identify it.' },
          { num: 5,  title: 'Notification of the collection of personal information', desc: 'At or before collection, notify individuals of the collection, its purpose, and their rights.' },
          { num: 6,  title: 'Use or disclosure of personal information', desc: 'Only use or disclose for the primary purpose of collection, or a permitted secondary purpose or exception.' },
          { num: 7,  title: 'Direct marketing', desc: 'Only use personal information for direct marketing if conditions are met; always allow opt-out.' },
          { num: 8,  title: 'Cross-border disclosure of personal information', desc: 'Before disclosing overseas, take reasonable steps to ensure comparable privacy protection.' },
          { num: 9,  title: 'Adoption, use or disclosure of government related identifiers', desc: 'Do not adopt, use, or disclose government identifiers except in permitted circumstances.' },
          { num: 10, title: 'Quality of personal information', desc: 'Take reasonable steps to ensure information is accurate, up-to-date, and complete.' },
          { num: 11, title: 'Security of personal information', desc: 'Protect information from misuse, interference, loss, and unauthorised access, modification, or disclosure.' },
          { num: 12, title: 'Access to personal information', desc: 'Give individuals access to their personal information on request within 30 days.' },
          { num: 13, title: 'Correction of personal information', desc: 'Take reasonable steps to correct information if inaccurate, out-of-date, or misleading.' },
        ],
      },
    ],
  },

  /* ── Section 5: Privacy risk register ─────────────────────── */
  {
    id:    'risk-register',
    title: 'Privacy risk register',
    desc:  'Identify, assess, and plan treatment of all privacy risks identified through this assessment.',
    hint:  'Consider risks across the entire information lifecycle. Include risks identified through the APP compliance review.',
    fields: [
      {
        id:       'risks',
        type:     'repeating-group',
        label:    'Privacy risks',
        addLabel: '+ Add another risk',
        minItems: 1,
        subfields: [
          {
            id:          'risk_id',
            type:        'text',
            label:       'Risk ID',
            required:    false,
            placeholder: 'e.g. R-001',
          },
          {
            id:          'risk_description',
            type:        'textarea',
            label:       'Risk description',
            required:    true,
            placeholder: 'Describe the risk scenario — what could go wrong, how, and what its impact would be on individuals...',
          },
          {
            id:       'risk_app',
            type:     'text',
            label:    'Relevant APP(s)',
            required: false,
            placeholder: 'e.g. APP 11',
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
            label:       'Treatment / control',
            required:    true,
            placeholder: 'Describe the action(s) to address this risk...',
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
            placeholder: 'Responsible person or team',
          },
          {
            id:          'due_date',
            type:        'date',
            label:       'Treatment due date',
            required:    false,
          },
          {
            id:       'status',
            type:     'select',
            label:    'Status',
            required: false,
            options: [
              { value: '',            label: '— Select —' },
              { value: 'Not started', label: 'Not started' },
              { value: 'In progress', label: 'In progress' },
              { value: 'Completed',   label: 'Completed' },
              { value: 'Accepted',    label: 'Accepted (risk accepted)' },
            ],
          },
        ],
      },
    ],
  },

  /* ── Section 6: Recommendations ───────────────────────────── */
  {
    id:    'recommendations',
    title: 'Recommendations',
    desc:  'Summarise the recommendations arising from this PIA, with priority levels and responsible officers.',
    fields: [
      {
        id:       'recommendations',
        type:     'repeating-group',
        label:    'Recommendations',
        addLabel: '+ Add another recommendation',
        minItems: 1,
        subfields: [
          {
            id:          'rec_number',
            type:        'text',
            label:       'Recommendation number',
            required:    false,
            placeholder: 'e.g. Rec 1',
          },
          {
            id:          'rec_description',
            type:        'textarea',
            label:       'Recommendation',
            required:    true,
            placeholder: 'Describe the recommended action...',
          },
          {
            id:       'priority',
            type:     'select',
            label:    'Priority',
            required: false,
            options: [
              { value: '',       label: '— Select —' },
              { value: 'High',   label: 'High' },
              { value: 'Medium', label: 'Medium' },
              { value: 'Low',    label: 'Low' },
            ],
          },
          {
            id:          'rec_owner',
            type:        'text',
            label:       'Responsible officer',
            required:    false,
            placeholder: 'e.g. Privacy Officer',
          },
        ],
      },
    ],
  },

  /* ── Section 7: Implementation plan ───────────────────────── */
  {
    id:    'implementation-plan',
    title: 'Implementation plan',
    desc:  'Document the actions required to implement the recommendations from this PIA.',
    fields: [
      {
        id:       'actions',
        type:     'repeating-group',
        label:    'Implementation actions',
        addLabel: '+ Add another action',
        minItems: 0,
        subfields: [
          {
            id:          'action_description',
            type:        'textarea',
            label:       'Action',
            required:    true,
            placeholder: 'Describe the specific action to be taken...',
          },
          {
            id:          'action_owner',
            type:        'text',
            label:       'Owner',
            required:    false,
            placeholder: 'e.g. IT Security team',
          },
          {
            id:          'action_due',
            type:        'date',
            label:       'Due date',
            required:    false,
          },
          {
            id:       'action_status',
            type:     'select',
            label:    'Status',
            required: false,
            options: [
              { value: '',            label: '— Select —' },
              { value: 'Not started', label: 'Not started' },
              { value: 'In progress', label: 'In progress' },
              { value: 'Completed',   label: 'Completed' },
            ],
          },
        ],
      },
    ],
  },

  /* ── Section 8: Sign-off ───────────────────────────────────── */
  {
    id:    'sign-off',
    title: 'Sign-off',
    desc:  'Record the approval and sign-off details for this Privacy Impact Assessment.',
    fields: [
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
        id:       'privacy_officer_name',
        type:     'text',
        label:    'Privacy officer name',
        required: false,
        placeholder: 'e.g. Alex Johnson',
      },
      {
        id:       'privacy_officer_date',
        type:     'date',
        label:    'Privacy officer sign-off date',
        required: false,
      },
      {
        id:       'sro_name',
        type:     'text',
        label:    'Senior responsible officer name',
        required: false,
        placeholder: 'e.g. Michael Park',
      },
      {
        id:       'sro_date',
        type:     'date',
        label:    'Senior responsible officer sign-off date',
        required: false,
      },
      {
        id:       'review_date',
        type:     'date',
        label:    'Scheduled review date',
        hint:     'When should this PIA be reviewed or updated?',
        required: false,
      },
      {
        id:       'additional_notes',
        type:     'textarea',
        label:    'Additional notes',
        required: false,
        placeholder: 'Any other relevant information or conditions attached to approval...',
      },
    ],
  },
];
