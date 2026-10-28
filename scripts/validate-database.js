const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const dataDir = path.join(root, 'data');

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.join(dataDir, file), 'utf8'));
}

function isUrl(value) {
  return typeof value === 'string' && /^https?:\/\//i.test(value);
}

const requiredFiles = ['drugs.json', 'prices.json', 'conditions.json', 'conditionDrugLinks.json', 'references.json', 'database-manifest.json'];
const errors = [];
const warnings = [];

if (!fs.existsSync(dataDir)) {
  errors.push('Missing data directory. Run node scripts/generate-doc-database.js first.');
  process.exitCode = 1;
}

for (const file of requiredFiles) {
  const fullPath = path.join(dataDir, file);
  if (!fs.existsSync(fullPath)) {
    errors.push(`Missing required file: ${file}`);
  }
}

if (errors.length) {
  console.log('ERRORS');
  for (const item of errors) console.log('- ' + item);
  console.log('WARNINGS');
  for (const item of warnings) console.log('- ' + item);
  process.exit(1);
}

const drugs = readJson('drugs.json');
const prices = readJson('prices.json');
const conditions = readJson('conditions.json');
const links = readJson('conditionDrugLinks.json');
const references = readJson('references.json');
const manifest = readJson('database-manifest.json');

const drugIds = new Set();
const drugNames = new Set();
for (const drug of drugs) {
  const id = drug.id;
  if (!id) errors.push('Drug missing id');
  if (drugIds.has(id)) errors.push(`Duplicate drug id: ${id}`);
  drugIds.add(id);
  if (drug.genericName && drugNames.has(drug.genericName)) {
    errors.push(`Duplicate generic name: ${drug.genericName}`);
  }
  if (drug.genericName) drugNames.add(drug.genericName);

  const requiredFields = ['genericName', 'brandNames', 'drugClass', 'therapeuticCategories', 'dosageForms', 'strengths', 'indications', 'adultDose', 'pediatricDose', 'routeOfAdministration', 'adverseDrugReactions', 'contraindications', 'precautions', 'drugInteractions', 'mechanismOfAction', 'pregnancyConsiderations', 'breastfeedingConsiderations', 'renalDoseAdjustment', 'hepaticDoseAdjustment', 'monitoring', 'overdoseManagement', 'storage', 'prescriptionStatus', 'highAlert', 'antimicrobial', 'sourceIds', 'lastReviewed', 'published'];
  for (const key of requiredFields) {
    if (!(key in drug)) errors.push(`Missing field '${key}' in drug '${id || drug.genericName || 'unknown'}'`);
  }

  if (drug.priceNPR !== undefined) warnings.push(`Unexpected price field on drug record: ${id}`);
}

if (drugIds.size < 500) {
  errors.push(`Only ${drugIds.size} unique generic medicine records; target is at least 500.`);
}

for (const price of prices) {
  if (typeof price.priceNPR === 'number' && price.priceNPR < 0) errors.push(`Negative price for ${price.id}`);
  if (price.verificationStatus && ['Verified', 'PartiallyVerified'].includes(price.verificationStatus)) {
    if (!price.sourceUrl || !isUrl(price.sourceUrl)) {
      errors.push(`Verified price missing a valid source URL: ${price.id}`);
    }
    if (!price.verificationDate) {
      errors.push(`Verified price missing verificationDate: ${price.id}`);
    }
  }
  if (price.brandName && !drugNames.has(price.genericName)) {
    errors.push(`Price record references unknown generic drug: ${price.genericName}`);
  }
}

const validConditionIds = new Set(conditions.map(c => c.id));
for (const condition of conditions) {
  if (!condition.id) errors.push('Condition missing id');
}

for (const link of links) {
  if (!validConditionIds.has(link.conditionId)) errors.push(`Condition-drug link references missing condition: ${link.conditionId}`);
  if (link.drugId && !drugIds.has(link.drugId)) errors.push(`Condition-drug link references missing drug: ${link.drugId}`);
  if (link.drugId === null && !link.drugName) warnings.push(`Link ${link.id} has no drugName/ID`);
}

for (const ref of references) {
  if (!ref.url || !isUrl(ref.url)) errors.push(`Reference with invalid or missing URL: ${ref.id || ref.title}`);
  if (!ref.title) errors.push(`Reference missing title: ${ref.id || 'unknown'}`);
}

for (const drug of drugs) {
  if (drug.genericName && drug.genericName.includes('+')) {
    if (!drug.sourceIds || drug.sourceIds.length === 0) warnings.push(`Combination drug ${drug.genericName} should include source verification notes.`);
  }
  if (drug.highAlert && !drug.precautions?.length) {
    warnings.push(`High-alert medicine ${drug.genericName} missing caution notes.`);
  }
  if (drug.published) {
    const mandatory = ['genericName', 'indications', 'adultDose', 'pediatricDose', 'contraindications', 'precautions', 'mechanismOfAction'];
    for (const field of mandatory) {
      if (!drug[field] || (Array.isArray(drug[field]) && drug[field].length === 0)) {
        warnings.push(`Published drug ${drug.genericName} is missing mandatory field: ${field}`);
      }
    }
  }
}

const drugNameMap = new Map(drugs.map(drug => [drug.genericName, drug]));
for (const price of prices) {
  if (!price.genericName || !drugNameMap.has(price.genericName)) {
    errors.push(`Brand-price record without matching drug record: ${price.id || price.brandName}`);
  }
}

if (manifest && manifest.targetMinimumGenericMedicines && Number(manifest.targetMinimumGenericMedicines) > 500 && drugIds.size < Number(manifest.targetMinimumGenericMedicines)) {
  warnings.push('Manifest is configured for a larger database than the current generated dataset.');
}

console.log('ERRORS');
if (errors.length === 0) console.log('None');
else for (const entry of errors) console.log('- ' + entry);
console.log('WARNINGS');
if (warnings.length === 0) console.log('None');
else for (const entry of warnings) console.log('- ' + entry);

if (errors.length) process.exit(1);
