# DOC Nepal Drug Database

This repository contains the structured database scaffold used by the DOC — Drug of Choice Nepal project.

## Purpose

The database is intended to support:
- educational clinical reference material
- generic medicine records for Nepal-focused use
- condition and treatment linkage examples
- source traceability for official information and references
- validation of JSON structure and required fields before publication

## Required files

- `data/drugs.json`
- `data/prices.json`
- `data/conditions.json`
- `data/conditionDrugLinks.json`
- `data/references.json`
- `data/database-manifest.json`
- `scripts/generate-doc-database.js`
- `scripts/validate-database.js`

## Source methodology

The database is intentionally conservative. It does not invent Nepal medicine prices or clinical recommendations when a trusted source has not been checked.

Use the following order of evidence:
1. Nepal Department of Drug Administration (DDA)
2. Nepal Ministry of Health and Population
3. WHO and WHO formulary guidance
4. National or international clinical guidelines
5. Product labels and official formulary references

## Generation and validation

From the repository root:

```bash
node scripts/generate-doc-database.js
node scripts/validate-database.js
```

The generator creates the full 500+ generic medicine dataset and the supporting condition, price, and reference records. The validator checks required files, duplicate entries, type issues, source links, and some safety-related checks.

## Firebase import guidance

Use Firestore import for the final generated JSON files after validation. Example:

```bash
firebase firestore:import --project your-project-id data/drugs.json
```

For a real Firebase import workflow, create the collection structure with matching fields and then upload the JSON exports through the Firebase console or CLI according to your project configuration.

## Publication checklist

Before moving any record to `published: true`:
- confirm the generic medicine identity
- review local or national treatment guidance
- check Nepal-specific price or regulatory context when relevant
- verify contraindications and dosing content
- ensure pediatric, pregnancy, renal, hepatic, and interaction caution notes are present where relevant
- avoid unsupported claims or automatically recommending medicines without clinical assessment

The dataset must remain educational and is not a substitute for professional clinical judgment.
