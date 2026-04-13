# Privacy Impact Assessment Tool

A static, client-side web tool for conducting Privacy Impact Assessments (PIAs) under the [Privacy Act 1988 (Cth)](https://www.legislation.gov.au/Details/C2022C00295) and in accordance with the [OAIC PIA guidance](https://www.oaic.gov.au/privacy/privacy-guidance-for-organisations-and-government-agencies/privacy-impact-assessments).

Designed for Australian organisations. No backend required — all processing and storage happens in the browser.

---

## Pages

| Page | File | Purpose |
|------|------|---------|
| Home | `index.html` | Landing page — introduction and links to each assessment |
| Threshold Assessment | `threshold.html` | Determine whether a PIA is required (No PIA / Short-form / Full PIA) |
| Short-form PIA | `short-pia.html` | Concise PIA for lower-risk projects (5 sections) |
| Full PIA | `full-pia.html` | Comprehensive PIA including APP compliance checklist (8 sections) |

---

## Features

- **Multi-step wizard** with step indicator and validation
- **Auto-save** — progress is saved to browser localStorage as you type
- **Draft restore** — returning to a page shows a banner to resume your saved draft
- **JSON export** — download your assessment as a structured JSON file
- **JSON import** — upload a previously exported JSON to resume or amend
- **Word export** — download a formatted `.docx` file (uses [docx](https://docx.js.org/) via CDN)
- **Threshold scoring** — automatically recommends No PIA / Short-form / Full PIA based on your answers
- **APP compliance checklist** (full PIA) — covers all 13 Australian Privacy Principles
- **Privacy risk register** — repeating rows for risks, treatments, residual risk, and ownership
- **Accessible** — semantic HTML, ARIA labels, keyboard navigation, focus management, skip links

---

## Running locally

No build step required. Serve the files from any static web server.

### Option 1 — Python (simplest)

```bash
cd /path/to/this/repo
python3 -m http.server 8080
# then open http://localhost:8080
```

### Option 2 — Node.js (npx serve)

```bash
npx serve .
```

### Option 3 — VS Code Live Server

Install the [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) extension, then right-click `index.html` → **Open with Live Server**.

> **Note:** The pages use ES modules (`type="module"` scripts), which require an HTTP server. Opening the HTML files directly via `file://` will not work in most browsers.

---

## Deploying to GitHub Pages

1. Push this repository to GitHub.
2. In the repository **Settings → Pages**, set the source to:
   - Branch: `main` (or your default branch)
   - Folder: `/ (root)`
3. GitHub Pages will serve the site at `https://<username>.github.io/<repo>/`.

All assets use relative paths, so no configuration changes are needed.

---

## Customising questions

Questions are defined as plain JavaScript arrays in `js/questions/`:

| File | Assessment |
|------|-----------|
| `js/questions/threshold.js` | Threshold assessment questions and scoring logic |
| `js/questions/short-pia.js` | Short-form PIA sections and questions |
| `js/questions/full-pia.js` | Full PIA sections, questions, and APP definitions |

Each file exports a `STEPS` array. Each step has a `fields` array. Supported field types:

- `text` — single-line text input
- `textarea` — multi-line text input
- `date` — date picker
- `select` — dropdown
- `radio` — radio button group
- `checkbox` — checkbox group
- `repeating-group` — dynamic list of grouped fields (e.g. risk register)
- `app-table` — the APP compliance table (full PIA only)

Fields can include a `showIf` property to conditionally show/hide based on another field's value:

```js
{
  id:     'overseas_details',
  type:   'textarea',
  label:  'Countries and protections',
  showIf: { field: 'overseas_transfer', values: ['yes'] },
}
```

---

## Customising branding

Update the following in each HTML file (`index.html`, `threshold.html`, `short-pia.html`, `full-pia.html`):

```html
<!-- Replace this block in <header> and <footer> -->
<div class="site-header__logo-mark">YOUR<br>ORG</div>
<div class="site-header__org-name">[Your Organisation Name]</div>
```

To change the colour scheme, edit the CSS custom properties at the top of `css/agds.css`:

```css
:root {
  --color-primary:        #00698F; /* Header/button/link colour */
  --color-primary-hover:  #004E6E;
  --color-header-bg:      #00363F; /* Site header background */
  --color-header-border:  #C08000; /* Gold accent stripe */
  /* ... */
}
```

---

## JSON schema

Exported JSON files follow this structure:

```json
{
  "schemaVersion": "1.0",
  "type": "threshold",
  "exportedAt": "2026-04-13T00:00:00.000Z",
  "state": {
    "project_name": "...",
    "involves_pi": "yes",
    "risks": [
      { "risk_description": "...", "likelihood": "High", "consequence": "Medium" }
    ]
  }
}
```

`type` is one of `"threshold"`, `"short"`, or `"full"`. Each assessment page only accepts JSON files with the matching `type`.

---

## Dependencies

| Library | Version | Purpose | Loaded via |
|---------|---------|---------|------------|
| [docx](https://docx.js.org/) | ^8 | Word document generation | CDN (jsdelivr) |

All other functionality uses vanilla HTML, CSS, and JavaScript — no frameworks, no build step.

---

## Disclaimer

This tool does not constitute legal advice. It is intended as a practical aid for Australian organisations seeking to comply with the *Privacy Act 1988* (Cth) and the Australian Privacy Principles. Refer to the [OAIC](https://www.oaic.gov.au/) for authoritative guidance and consult a qualified legal practitioner regarding your specific circumstances.

---

## Licence

MIT Licence. See [LICENSE](./LICENSE).
