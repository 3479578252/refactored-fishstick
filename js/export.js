/**
 * export.js — JSON and Word (.docx) download for PIA tool.
 *
 * Uses the `docx` library (v8) via a dynamic ES module import from esm.sh.
 * No <script> tag required — the library is loaded on first use.
 *
 * Usage:
 *   import { downloadJSON, downloadDOCX } from './export.js';
 *   downloadJSON({ type: 'threshold', state, projectName: 'My Project' });
 *   downloadDOCX({ type: 'threshold', state, steps, outcome });
 */

const DOCX_CDN = 'https://esm.sh/docx@8';
let _docxModule = null;

/** Lazy-load docx on first use. */
async function getDocx() {
  if (!_docxModule) {
    try {
      _docxModule = await import(DOCX_CDN);
    } catch (e) {
      throw new Error('The docx library could not be loaded. Please check your internet connection and try again.');
    }
  }
  return _docxModule;
}

const SCHEMA_VERSION = '1.0';

/* ── Helpers ────────────────────────────────────────────────── */

function slugify(str = '') {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'assessment';
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function formatDate(isoStr) {
  if (!isoStr) return '—';
  try {
    return new Date(isoStr).toLocaleDateString('en-AU', { day: '2-digit', month: 'long', year: 'numeric' });
  } catch { return isoStr; }
}

function displayValue(val) {
  if (val === null || val === undefined || val === '') return '—';
  if (Array.isArray(val)) return val.length ? val.join(', ') : '—';
  return String(val);
}

/* ── JSON Export ────────────────────────────────────────────── */

/**
 * Download the assessment state as a JSON file.
 * @param {object} opts
 * @param {string} opts.type        - Assessment type key
 * @param {object} opts.state       - Flat state map
 * @param {string} [opts.projectName]
 */
export function downloadJSON({ type, state, projectName }) {
  const payload = {
    schemaVersion: SCHEMA_VERSION,
    type,
    exportedAt: new Date().toISOString(),
    state,
  };
  const filename = `pia-${type}-${slugify(projectName)}-${todayISO()}.json`;
  const blob     = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  _triggerDownload(blob, filename);
}

/* ── DOCX Export ────────────────────────────────────────────── */

/**
 * Generate and download a Word document of the assessment.
 * Requires window.docx (loaded from CDN via <script> tag in each HTML page).
 *
 * @param {object} opts
 * @param {string}   opts.type        - Assessment type key
 * @param {object}   opts.state       - Flat state map
 * @param {Array}    opts.steps       - Step definitions from question file
 * @param {object}   [opts.outcome]   - Threshold outcome object {title, rationale[]}
 */
export async function downloadDOCX({ type, state, steps, outcome }) {
  let docxLib;
  try {
    docxLib = await getDocx();
  } catch (e) {
    alert(e.message);
    return;
  }

  const { Document, Packer, Paragraph, TextRun, HeadingLevel, Table,
          TableRow, TableCell, WidthType, AlignmentType, ShadingType,
          BorderStyle } = docxLib;

  const typeLabel = { threshold: 'Threshold Assessment', short: 'Short-form PIA', full: 'Full Privacy Impact Assessment' }[type] ?? type;
  const projectName = state.project_name ?? 'Untitled Project';
  const orgName     = '[Organisation Name]';
  const children    = [];

  /* Title page content */
  children.push(
    _para(orgName, { bold: true, size: 28, color: '00698F', spaceBefore: 240 }),
    _para('Privacy Impact Assessment Tool', { size: 24, color: '6C6C6C' }),
    _heading1(typeLabel),
    _para(`Project: ${projectName}`, { bold: true, size: 26 }),
    _para(`Date: ${formatDate(state.assessment_date ?? todayISO())}`, { size: 22, color: '6C6C6C' }),
    _rule(),
  );

  /* Threshold outcome box */
  if (outcome) {
    children.push(
      _heading2('Outcome'),
      _para(outcome.title, { bold: true, size: 26, color: outcome.outcome === 'none' ? '0B7B39' : outcome.outcome === 'full' ? 'D4620A' : '00698F' }),
    );
    outcome.rationale.forEach(r => children.push(_para(`• ${r}`)));
    children.push(_rule());
  }

  /* For each step, render section */
  steps.forEach(step => {
    children.push(_heading2(step.title));
    if (step.desc) children.push(_para(step.desc, { italic: true, color: '6C6C6C' }));

    step.fields.forEach(field => {
      if (field.type === 'repeating-group') {
        children.push(_heading3(field.label));
        const items = Array.isArray(state[field.id]) ? state[field.id] : [];
        if (items.length === 0) {
          children.push(_para('No items recorded.', { italic: true, color: '6C6C6C' }));
        } else {
          // Build table for repeating group
          const headerRow = new TableRow({
            tableHeader: true,
            children: field.subfields.map(sf => _tableHeaderCell(sf.label)),
          });
          const dataRows = items.map(item => new TableRow({
            children: field.subfields.map(sf => _tableCell(displayValue(item[sf.id]))),
          }));
          children.push(new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows:  [headerRow, ...dataRows],
          }));
          children.push(_spacer());
        }
      } else if (field.type === 'app-table') {
        children.push(_heading3('Australian Privacy Principles — Compliance Checklist'));
        const apps = state.apps ?? {};
        const headerRow = new TableRow({
          tableHeader: true,
          children: [
            _tableHeaderCell('APP'),
            _tableHeaderCell('Applicable?'),
            _tableHeaderCell('Compliant?'),
            _tableHeaderCell('Notes'),
          ],
        });
        const dataRows = field.apps.map(app => {
          const row = apps[app.num] ?? {};
          return new TableRow({
            children: [
              _tableCell(`APP ${app.num}: ${app.title}`),
              _tableCell(displayValue(row.applicable)),
              _tableCell(displayValue(row.compliant)),
              _tableCell(displayValue(row.notes)),
            ],
          });
        });
        children.push(new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows:  [headerRow, ...dataRows],
        }));
        children.push(_spacer());
      } else {
        // Scalar field
        const value = state[field.id];
        if (value === undefined || value === null || value === '') return;
        children.push(_heading3(field.label));
        const display = Array.isArray(value) ? value.join('\n') : String(value);
        display.split('\n').forEach(line => children.push(_para(line || ' ')));
      }
    });

    children.push(_rule());
  });

  /* Footer note */
  children.push(
    _para(
      `Generated by ${orgName} PIA Tool | ${typeLabel} | Exported: ${new Date().toLocaleString('en-AU')}`,
      { size: 16, color: '999999', italic: true },
    ),
    _para(
      'Disclaimer: This document was generated using an automated tool. It does not constitute legal advice. Refer to the Office of the Australian Information Commissioner (OAIC) for authoritative guidance and consult a legal practitioner.',
      { size: 16, color: '999999', italic: true },
    ),
  );

  const doc = new Document({
    sections: [{ properties: {}, children }],
    styles: {
      paragraphStyles: [
        {
          id:   'Normal',
          name: 'Normal',
          run:  { font: 'Calibri', size: 22 },
          paragraph: { spacing: { after: 120 } },
        },
      ],
    },
  });

  const buffer   = await Packer.toBlob(doc);
  const filename = `pia-${type}-${slugify(projectName)}-${todayISO()}.docx`;
  _triggerDownload(buffer, filename);
}

/* ── DOCX paragraph helpers ─────────────────────────────────── */
/* All helpers use _docxModule, which is guaranteed populated before
   any helper is called (downloadDOCX calls getDocx() first). */

function _para(text, opts = {}) {
  const { bold = false, italic = false, size = 22, color, spaceBefore } = opts;
  const { Paragraph, TextRun } = _docxModule;
  return new Paragraph({
    children: [
      new TextRun({ text, bold, italics: italic, size, color, font: 'Calibri' }),
    ],
    spacing: { before: spaceBefore ?? 0, after: 120 },
  });
}

function _heading1(text) {
  const { Paragraph, HeadingLevel } = _docxModule;
  return new Paragraph({ text, heading: HeadingLevel.HEADING_1, spacing: { before: 480, after: 240 } });
}

function _heading2(text) {
  const { Paragraph, HeadingLevel } = _docxModule;
  return new Paragraph({ text, heading: HeadingLevel.HEADING_2, spacing: { before: 360, after: 180 } });
}

function _heading3(text) {
  const { Paragraph, HeadingLevel } = _docxModule;
  return new Paragraph({ text, heading: HeadingLevel.HEADING_3, spacing: { before: 240, after: 120 } });
}

function _rule() {
  const { Paragraph } = _docxModule;
  return new Paragraph({ thematicBreak: true, spacing: { before: 240, after: 240 } });
}

function _spacer() {
  const { Paragraph } = _docxModule;
  return new Paragraph({ text: '', spacing: { after: 200 } });
}

function _tableHeaderCell(text) {
  const { TableCell, Paragraph, TextRun, ShadingType } = _docxModule;
  return new TableCell({
    children: [new Paragraph({
      children: [new TextRun({ text, bold: true, size: 18, font: 'Calibri', color: 'FFFFFF' })],
    })],
    shading: { type: ShadingType.SOLID, color: '00698F' },
    margins: { top: 80, bottom: 80, left: 120, right: 120 },
  });
}

function _tableCell(text) {
  const { TableCell, Paragraph, TextRun } = _docxModule;
  return new TableCell({
    children: [new Paragraph({
      children: [new TextRun({ text: text || '—', size: 18, font: 'Calibri' })],
    })],
    margins: { top: 80, bottom: 80, left: 120, right: 120 },
  });
}

/* ── File download helper ───────────────────────────────────── */

function _triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a   = document.createElement('a');
  a.href     = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}
