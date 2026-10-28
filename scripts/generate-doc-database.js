const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const dataDir = path.join(root, 'data');

const analgesics = [
  'Paracetamol','Ibuprofen','Diclofenac sodium','Diclofenac potassium','Naproxen','Indomethacin','Meloxicam','Piroxicam','Ketorolac','Celecoxib','Etoricoxib','Aspirin','Mefenamic acid','Acetylsalicylic acid','Ketoprofen','Lornoxicam','Nabumetone','Sulindac','Bromfenac','Tolmetin','Dextropropoxyphene','Codeine','Morphine','Tramadol','Fentanyl','Buprenorphine','Oxycodone','Hydrocodone','Methadone','Sumatriptan','Zofran?','Ergotamine','Caffeine','Piroxicam','Gabapentin','Pregabalin','Carbamazepine','Valproic acid','Topiramate','Levetiracetam'
];

const antibacterials = [
  'Amoxicillin','Amoxicillin-clavulanate','Ampicillin','Cloxacillin','Dicloxacillin','Flucloxacillin','Benzathine penicillin','Procaine penicillin','Benzylpenicillin','Cefalexin','Cefazolin','Cefuroxime','Cefotaxime','Ceftazidime','Ceftriaxone','Cefixime','Cefpodoxime','Cefepime','Ertapenem','Meropenem','Imipenem','Aztreonam','Gentamicin','Amikacin','Streptomycin','Tobramycin','Netilmicin','Ciprofloxacin','Levofloxacin','Moxifloxacin','Ofloxacin','Norfloxacin','Azithromycin','Clarithromycin','Erythromycin','Doxycycline','Minocycline','Tetracycline','Chloramphenicol','Trimethoprim','Sulfamethoxazole','Sulfadiazine','Co-trimoxazole','Nitrofurantoin','Fosfomycin','Linezolid','Vancomycin','Teicoplanin','Metronidazole','Tinidazole','Clindamycin','Rifampicin','Rifabutin','Isoniazid','Ethambutol','Pyrazinamide','Bacampicillin','Cefradine','Cefadroxil','Cefotetan','Cefoperazone','Cefdinir','Cefditoren','Cefquinome','Cefaclor','Nalidixic acid','Piperacillin','Piperacillin-tazobactam','Tazobactam','Cefuroxime-axetil','Amikacin','Chloramphenicol' 
];

const antivirals = [
  'Acyclovir','Valacyclovir','Ganciclovir','Famciclovir','Oseltamivir','Zanamivir','Peramivir','Remdesivir','Baloxavir','Ribavirin','Sofosbuvir','Velpatasvir','Ledipasvir','Tenofovir','Emtricitabine','Dolutegravir','Abacavir','Lamivudine','Efavirenz','Nevirapine','Atazanavir','Darunavir','Lopinavir','Ritonavir','Nelfinavir','Saquinavir','Tipranavir','Maraviroc','Raltegravir','Elvitegravir','Cobicistat','Entecavir','Tenofovir disoproxil','Darunavir-cobicistat','Zidovudine','Didanosine','Stavudine','Lamivudine-zidovudine','Penciclovir','Foscarnet','Cidofovir'
];

const antifungals = [
  'Fluconazole','Itraconazole','Voriconazole','Posaconazole','Isavuconazole','Terbinafine','Griseofulvin','Nystatin','Amphotericin B','Micafungin','Caspofungin','Anidulafungin','Flucytosine','Echinocandin','Voriconazole','Ketoconazole','Miconazole','Clotrimazole','Tolnaftate','Naftifine','Ciclopirox','Bifonazole'
];

const antiparasitics = [
  'Albendazole','Mebendazole','Praziquantel','Ivermectin','Diethylcarbamazine','Levamisole','Nitazoxanide','Artemether','Lumefantrine','Artesunate','Quinine','Primaquine','Chloroquine','Hydroxychloroquine','Pyrimethamine','Sulfadoxine','Sulfasalazine','Mefloquine','Atovaquone','Proguanil','Tinidazole','Secnidazole','Metronidazole','Trimetrexate','Benzimidazole','Amodiaquine','Halofantrine','Doxycycline','Benznidazole','Nifedipine?','Sodium stibogluconate','Miltefosine'
];

const cardio = [
  'Amlodipine','Nifedipine','Felodipine','Lercanidipine','Nicardipine','Verapamil','Diltiazem','Atenolol','Metoprolol','Propranolol','Bisoprolol','Carvedilol','Nebivolol','Labetalol','Captopril','Enalapril','Lisinopril','Ramipril','Perindopril','Losartan','Valsartan','Candesartan','Telmisartan','Irbesartan','Olmesartan','Hydrochlorothiazide','Chlorthalidone','Indapamide','Furosemide','Bumetanide','Spironolactone','Eplerenone','Amiloride','Triamterene','Digoxin','Digitoxin','Milrinone','Dobutamine','Noradrenaline','Adrenaline','Dopamine','Phenylephrine','Isoprenaline','Nitroglycerin','Isosorbide dinitrate','Isosorbide mononitrate','Ivabradine','Nicorandil','Warfarin','Heparin','Enoxaparin','Dalteparin','Fondaparinux','Apixaban','Rivaroxaban','Dabigatran','Clopidogrel','Ticagrelor','Prasugrel','Ticlopidine','Ezetimibe','Simvastatin','Atorvastatin','Rosuvastatin','Pitavastatin','Fenofibrate','Omega-3 fatty acid','Bempedoic acid'
];

const respiratory = [
  'Salbutamol','Terbutaline','Formoterol','Salmeterol','Ipratropium','Tiotropium','Theophylline','Aminophylline','Montelukast','Zafirlukast','Cromolyn','Budesonide','Fluticasone','Beclomethasone','Mometasone','Prednisolone','Hydrocortisone','Ciclesonide','Methylprednisolone','Dexamethasone','Cetirizine','Fexofenadine','Levocetirizine','Desloratadine','Pseudoephedrine','Phenylephrine','Guaifenesin','Bromhexine','Ambroxol','Acetylcysteine','Isoniazid?','Budesonide-formoterol','Fluticasone-salmeterol'
];

const gi = [
  'Omeprazole','Pantoprazole','Rabeprazole','Esomeprazole','Lansoprazole','Famotidine','Ranitidine','Cimetidine','Sucralfate','Misoprostol','Magnesium hydroxide','Aluminium hydroxide','Calcium carbonate','Sodium bicarbonate','Domperidone','Metoclopramide','Prochlorperazine','Promethazine','Bismuth subsalicylate','Loperamide','Atropine','Dicyclomine','Hyoscine butylbromide','Pyridostigmine','Mesalazine','Sulfasalazine','Mesalamine','Budesonide','Prednisolone','Cobalamin','Folic acid','Pancrelipase','Aprepitant','Rolapitant','Orlistat','Lactulose','Polyethylene glycol','Sodium picosulfate','Senna','Bisacodyl','Magnesium citrate','Lubiprostone','Linaclotide'
];

const endocrine = [
  'Insulin regular','Insulin glargine','Insulin aspart','Insulin lispro','NPH insulin','Metformin','Glyburide','Glipizide','Glimepiride','Repaglinide','Nateglinide','Acarbose','Miglitol','Pioglitazone','Rosiglitazone','Sitagliptin','Vildagliptin','Saxagliptin','Linagliptin','Dapagliflozin','Empagliflozin','Canagliflozin','Exenatide','Liraglutide','Semaglutide','Dulaglutide','Levothyroxine','Liothyronine','Propylthiouracil','Methimazole','Carbimazole','Hydrocortisone','Prednisolone','Fludrocortisone','Desmopressin','Vasopressin','Octreotide','Bromocriptine','Cabergoline','Corticotropin','Calcitriol','Cholecalciferol','Ergocalciferol','Cinacalcet','Thiazide'
];

const neuroPsych = [
  'Donepezil','Galantamine','Rivastigmine','Memantine','Escitalopram','Fluoxetine','Sertraline','Paroxetine','Citalopram','Venlafaxine','Duloxetine','Bupropion','Mirtazapine','Amitriptyline','Imipramine','Nortriptyline','Clomipramine','Clozapine','Olanzapine','Quetiapine','Risperidone','Aripiprazole','Haloperidol','Fluphenazine','Chlorpromazine','Lorazepam','Diazepam','Clonazepam','Alprazolam','Midazolam','Zolpidem','Zopiclone','Buspirone','Trazodone','Flumazenil','Phenytoin','Lamotrigine','Levetiracetam','Topiramate','Vigabatrin','Tiagabine','Primidone','Phenobarbital','Ethosuximide','Valproate','Lorazepam','Clobazam','Lurasidone','Aripiprazole'
];

const obgyn = [
  'Ferrous sulfate','Folic acid','Iron dextran','Iron sucrose','Oral contraceptive pills','Ethinyl estradiol','Levonorgestrel','Medroxyprogesterone','Norethisterone','Misoprostol','Oxytocin','Methylergometrine','Mifepristone','Misoprostol','Dinoprostone','Budesonide','Magnesium sulfate','Calcium gluconate','Tranexamic acid','Progesterone','Estradiol','Premarin','Estriol','Drospirenone','Cefixime','Azithromycin','Clindamycin','Acyclovir','Terbutaline','Betamethasone','Dexamethasone'
];

const derm = [
  'Hydrocortisone','Betamethasone','Mometasone','Fluticasone','Triamcinolone','Clobetasol','Salicylic acid','Benzoyl peroxide','Retinoic acid','Tretinoin','Adapalene','Azelaic acid','Coal tar','Calcipotriol','Tacrolimus','Pimecrolimus','Metronidazole','Clindamycin','Erythromycin','Permethrin','Lindane','KOH','Selenium sulfide','Ketoconazole','Terbinafine','Ciclopirox','Aminolevulinic acid','Benzimidazole'
];

const emergency = [
  'Atropine','Adrenaline','Dopamine','Dobutamine','Noradrenaline','Lidocaine','Amiodarone','Adenosine','Procainamide','Magnesium sulfate','Calcium gluconate','Potassium chloride','Sodium bicarbonate','Thiamine','Pyridoxine','Naloxone','Flumazenil','Glucose','Dextrose','Normal saline','Ringer lactate','Fresh frozen plasma','Platelets','Cryoprecipitate','Tranexamic acid','N-acetylcysteine','Activated charcoal','Protamine','Heparin','Etomidate','Propofol'
];

const anesthesia = [
  'Propofol','Thiopental','Ketamine','Midazolam','Diazepam','Lidocaine','Bupivacaine','Ropivacaine','Levobupivacaine','Vecuronium','Atracurium','Rocuronium','Succinylcholine','Pancuronium','Neostigmine','Glycopyrrolate','Atropine','Morphine','Fentanyl','Remifentanil','Sufentanil'
];

const hematology = [
  'Ferrous fumarate','Ferrous sulfate','Folic acid','Vitamin B12','Epoetin alfa','Filgrastim','Pegfilgrastim','Cyanocobalamin','Tranexamic acid','Protamine','Warfarin','Heparin','Enoxaparin','Apixaban','Rivaroxaban','Dabigatran','Clopidogrel','Aspirin','Dipyridamole','Ticlopidine'
];

const renal = [
  'Sodium bicarbonate','Potassium chloride','Calcium gluconate','Magnesium sulfate','Acetazolamide','Furosemide','Mannitol','Chlorthalidone','Hydrochlorothiazide','Spironolactone','Eplerenone','Doxazosin','Tamsulosin','Finasteride','Oxybutynin','Tolterodine','Mirabegron','Albuterol','Cysteamine','Sodium phosphate'
];

const ophthalmic = [
  'Timolol','Brimonidine','Bimatoprost','Latanoprost','Travoprost','Pilocarpine','Acetazolamide','Prednisolone acetate','Tobramycin','Moxifloxacin','Ofloxacin','Ciprofloxacin','Fluorometholone','Dexamethasone','Artificial tears','Carboxymethylcellulose','Hyaluronic acid','Ketorolac','Olopatadine','Azelastine','Cyclosporine'
];

const vitamins = [
  'Vitamin A','Vitamin D3','Vitamin E','Vitamin K','Thiamine','Riboflavin','Niacin','Pyridoxine','Folic acid','Vitamin B12','Pantothenic acid','Biotin','Calcium carbonate','Calcium gluconate','Magnesium oxide','Zinc sulfate','Iron sulfate','Selenium','Iodine','Multivitamin','Choline'
];

const misc = [
  'Allopurinol','Febuxostat','Colchicine','Probenecid','Benzodiazepine','Phenytoin','Methotrexate','Azathioprine','Mycophenolate','Cyclosporine','Tacrolimus','Sirolimus','Etanercept','Infliximab','Adalimumab','Interferon beta','Peginterferon','Rituximab','Trastuzumab','Immunoglobulin','Human albumin','IVIG','Tocilizumab','Anakinra','Baricitinib','Tofacitinib','Cefuroxime','Purinethol','Busulfan'
];

const genericMedicines = [
  ...analgesics,
  ...antibacterials,
  ...antivirals,
  ...antifungals,
  ...antiparasitics,
  ...cardio,
  ...respiratory,
  ...gi,
  ...endocrine,
  ...neuroPsych,
  ...obgyn,
  ...derm,
  ...emergency,
  ...anesthesia,
  ...hematology,
  ...renal,
  ...ophthalmic,
  ...vitamins,
  ...misc
].filter((value, index, array) => array.indexOf(value) === index);

const drugClassMap = {
  Paracetamol: 'Analgesic / antipyretic',
  Ibuprofen: 'Nonsteroidal anti-inflammatory',
  Diclofenac: 'Nonsteroidal anti-inflammatory',
  Naproxen: 'Nonsteroidal anti-inflammatory',
  Morphine: 'Opioid analgesic',
  Tramadol: 'Opioid analgesic',
  Amoxicillin: 'Antibacterial',
  Ceftriaxone: 'Cephalosporin',
  Azithromycin: 'Macrolide',
  Ciprofloxacin: 'Fluoroquinolone',
  Metronidazole: 'Antibacterial / antiprotozoal',
  Acyclovir: 'Antiviral',
  Fluconazole: 'Antifungal',
  Albendazole: 'Anthelmintic',
  Amlodipine: 'Calcium channel blocker',
  Losartan: 'ARB',
  Atenolol: 'Beta-blocker',
  Lisinopril: 'ACE inhibitor',
  Furosemide: 'Loop diuretic',
  Salbutamol: 'Bronchodilator',
  Theophylline: 'Methylxanthine',
  Omeprazole: 'Proton pump inhibitor',
  Metoclopramide: 'Antiemetic',
  Insulin: 'Antidiabetic',
  Metformin: 'Antidiabetic',
  Levothyroxine: 'Thyroid hormone',
  Propylthiouracil: 'Antithyroid',
  Escitalopram: 'Antidepressant',
  Fluoxetine: 'Antidepressant',
  Lorazepam: 'Benzodiazepine',
  Valproic: 'Antiepileptic',
  Magnesium: 'Electrolyte',
  Ferrous: 'Haematologic supplement',
  Bupivacaine: 'Local anesthetic',
  Propofol: 'General anesthetic',
  Warfarin: 'Anticoagulant',
  Heparin: 'Anticoagulant',
  Timolol: 'Ophthalmic beta-blocker',
  Vitamin: 'Vitamin supplement',
  Allopurinol: 'Uricosuric / antigout'
};

const safeBrandMap = {
  Paracetamol: ['Dolo', 'Napa', 'Crocin'],
  Ibuprofen: ['Brufen', 'Ibugesic'],
  Amoxicillin: ['Mox', 'Novamox'],
  Ceftriaxone: ['Cefax', 'Rocephin'],
  Metformin: ['Glucophage', 'Metforal'],
  Amlodipine: ['Amlodip', 'Amlovas'],
  Salbutamol: ['Ventolin', 'Salbutamol'],
  Omeprazole: ['Omez', 'Prilosec'],
  Insulin regular: ['Humulin R', 'Actrapid'],
  Furosemide: ['Lasix'],
  Vitamin D3: ['Calcitriol D3', 'D3 Plus']
};

function slugify(value = '') {
  return String(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'medicine';
}

function brandNamesFor(name) {
  const exact = safeBrandMap[name] || safeBrandMap[name.split(' ')[0]] || [name];
  return exact.slice(0, 3);
}

function buildDrugRecord(name, index) {
  const lower = name.toLowerCase();
  const className = drugClassMap[name.split(' ')[0]] || drugClassMap[Object.keys(drugClassMap).find(key => lower.includes(key.toLowerCase()))] || 'Therapeutic medicine';

  return {
    id: slugify(name),
    genericName: name,
    brandNames: brandNamesFor(name),
    drugClass: className,
    therapeuticCategories: ['General clinical use'],
    dosageForms: ['Tablet', 'Oral suspension'],
    strengths: ['Verify label strength'],
    indications: 'Use only when clinically appropriate based on current evidence and patient-specific assessment.',
    adultDose: 'Use a clinically verified, indication-specific regimen.',
    pediatricDose: 'Use a verified weight-based regimen when appropriate.',
    routeOfAdministration: ['Oral'],
    adverseDrugReactions: ['Nausea', 'Rash'],
    contraindications: ['Hypersensitivity to the medicine'],
    precautions: ['Use additional caution in special populations and in severe liver or kidney disease.'],
    drugInteractions: [],
    mechanismOfAction: 'Mechanism of action should be confirmed using current formulary or product information.',
    pregnancyConsiderations: 'Use only when the expected benefit justifies the potential risk and after review of current guidance.',
    breastfeedingConsiderations: 'Assess risk-benefit and consult a formulary or prescriber before use.',
    renalDoseAdjustment: 'Dose adjustment should be verified in renal impairment.',
    hepaticDoseAdjustment: 'Dose adjustment should be verified in hepatic impairment.',
    monitoring: ['Clinician monitoring as indicated by indication and comorbidities.'],
    overdoseManagement: 'Seek urgent emergency or toxicology evaluation when overdose is suspected.',
    storage: 'Follow the product-specific label and local storage guidance.',
    prescriptionStatus: 'Verify current Nepal regulatory status before prescribing or dispensing.',
    highAlert: false,
    antimicrobial: lower.includes('amoxicillin') || lower.includes('cef') || lower.includes('azithromycin') || lower.includes('metronidazole') || lower.includes('valacyclovir') || lower.includes('fluconazole') || lower.includes('albendazole') || lower.includes('rifampicin'),
    sourceIds: [],
    lastReviewed: null,
    published: false
  };
}

const baseConditions = [
  { id: 'acute-gastroenteritis', name: 'Acute gastroenteritis', category: 'Gastroenterology', overview: 'Acute diarrhoeal illness usually self-limited; assess hydration and red flags.', symptoms: ['Diarrhoea', 'Vomiting', 'Abdominal cramps'], signs: ['Dehydration', 'Tachycardia'], redFlags: ['Severe dehydration', 'Blood in stool', 'Altered sensorium'], diagnosticApproach: ['History and hydration assessment', 'Stool studies if indicated'], differentialDiagnosis: ['Food poisoning', 'Appendicitis', 'Sepsis'], nonDrugManagement: ['Oral rehydration therapy', 'Continue feeding'], whenToRefer: ['Severe dehydration', 'Persistent vomiting'], sourceIds: [] },
  { id: 'uncomplicated-pneumonia', name: 'Community-acquired pneumonia', category: 'Respiratory medicine', overview: 'Lower respiratory tract infection requiring risk assessment and antibiotics when indicated.', symptoms: ['Cough', 'Fever', 'Dyspnoea'], signs: ['Crackles', 'Fever'], redFlags: ['Hypoxia', 'Confusion', 'Respiratory distress'], diagnosticApproach: ['Clinical assessment', 'Chest imaging when indicated'], differentialDiagnosis: ['Bronchitis', 'Pulmonary embolism', 'Viral pneumonia'], nonDrugManagement: ['Smoking cessation', 'Hydration'], whenToRefer: ['Severe hypoxaemia', 'Immunocompromise'], sourceIds: [] },
  { id: 'hypertension', name: 'Hypertension', category: 'Cardiology', overview: 'Persistent elevation of blood pressure requiring risk stratification and long-term management.', symptoms: ['Often asymptomatic'], signs: ['Elevated blood pressure'], redFlags: ['Hypertensive emergency', 'Chest pain', 'Neurologic deficits'], diagnosticApproach: ['Repeated blood pressure measurement', 'Assessment of end-organ damage'], differentialDiagnosis: ['White coat hypertension', 'Secondary causes'], nonDrugManagement: ['Salt reduction', 'Exercise'], whenToRefer: ['Severe hypertension', 'Pregnancy'], sourceIds: [] },
  { id: 'type-2-diabetes', name: 'Type 2 diabetes mellitus', category: 'Endocrinology', overview: 'Chronic hyperglycaemia requiring lifestyle measures and individualized pharmacotherapy.', symptoms: ['Polyuria', 'Polydipsia', 'Fatigue'], signs: ['Hyperglycaemia', 'Weight changes'], redFlags: ['Severe hyperglycaemia', 'Altered mental status'], diagnosticApproach: ['HbA1c and fasting glucose', 'Assessment of complications'], differentialDiagnosis: ['Type 1 diabetes', 'MODY'], nonDrugManagement: ['Diet', 'Exercise', 'Weight reduction'], whenToRefer: ['Severe complications', 'Difficult glycaemic control'], sourceIds: [] },
  { id: 'asthma', name: 'Asthma', category: 'Respiratory medicine', overview: 'Chronic inflammatory airways disease requiring symptom control and exacerbation prevention.', symptoms: ['Wheeze', 'Dyspnoea', 'Cough'], signs: ['Expiratory wheeze'], redFlags: ['Severe breathlessness', 'Silent chest'], diagnosticApproach: ['History and spirometry when available'], differentialDiagnosis: ['COPD', 'Bronchiectasis', 'Upper airway obstruction'], nonDrugManagement: ['Trigger avoidance', 'Action plan'], whenToRefer: ['Poor control', 'Emergency exacerbation'], sourceIds: [] },
  { id: 'copd', name: 'Chronic obstructive pulmonary disease', category: 'Respiratory medicine', overview: 'Progressive airflow limitation with significant smoking history or inhalation exposure.', symptoms: ['Chronic cough', 'Sputum', 'Dyspnoea'], signs: ['Prolonged expiration'], redFlags: ['Acute respiratory distress', 'Low oxygen'], diagnosticApproach: ['History and spirometry'], differentialDiagnosis: ['Asthma', 'Bronchiectasis'], nonDrugManagement: ['Smoking cessation', 'Vaccination'], whenToRefer: ['Acute exacerbation', 'Advanced disease'], sourceIds: [] },
  { id: 'peptic-ulcer-disease', name: 'Peptic ulcer disease', category: 'Gastroenterology', overview: 'Mucosal ulceration of the upper gastrointestinal tract requiring risk assessment and treatment.', symptoms: ['Epigastric pain', 'Dyspepsia'], signs: ['Tender abdomen'], redFlags: ['GI bleeding', 'Perforation'], diagnosticApproach: ['History', 'Endoscopy when indicated'], differentialDiagnosis: ['Gastritis', 'Gastroesophageal reflux', 'Cancer'], nonDrugManagement: ['Avoid NSAIDs', 'Smoking cessation'], whenToRefer: ['Bleeding', 'Persistent symptoms'], sourceIds: [] },
  { id: 'acute-migraine', name: 'Acute migraine', category: 'Neurology', overview: 'Recurrent headache disorder with typical migrainous features.', symptoms: ['Throbbing pain', 'Photophobia', 'Phonophobia'], signs: ['Unilateral headache'], redFlags: ['Sudden thunderclap headache', 'Neurologic deficits'], diagnosticApproach: ['History and focused neurological assessment'], differentialDiagnosis: ['Tension-type headache', 'Subarachnoid haemorrhage'], nonDrugManagement: ['Dark quiet room', 'Hydration'], whenToRefer: ['First severe headache', 'Persistent focal deficits'], sourceIds: [] },
  { id: 'acute-urinary-tract-infection', name: 'Acute urinary tract infection', category: 'Urology', overview: 'Infection of the urinary tract requiring appropriate choice of antimicrobial and assessment of complications.', symptoms: ['Dysuria', 'Frequency', 'Urgency'], signs: ['Suprapubic tenderness'], redFlags: ['Flank pain', 'Pyrexia', 'Sepsis'], diagnosticApproach: ['Urine testing', 'Culture when appropriate'], differentialDiagnosis: ['Vaginal irritation', 'Urolithiasis'], nonDrugManagement: ['Hydration'], whenToRefer: ['Pregnancy', 'Complicated UTI'], sourceIds: [] },
  { id: 'community-acquired-uti', name: 'Urinary tract infection', category: 'Urology', overview: 'Infection requiring careful antimicrobial choice and follow-up.', symptoms: ['Dysuria', 'Urinary frequency'], signs: ['Positive urine dipstick'], redFlags: ['Flank pain', 'Systemic illness'], diagnosticApproach: ['Urine analysis'], differentialDiagnosis: ['Cystitis', 'Pyelonephritis'], nonDrugManagement: ['Hydration'], whenToRefer: ['Recurrent infection', 'Pregnancy'], sourceIds: [] },
  { id: 'anxiety-disorder', name: 'Anxiety disorder', category: 'Psychiatry', overview: 'Persistent fear or worry causing functional impairment.', symptoms: ['Worry', 'Restlessness', 'Irritability'], signs: ['Physiologic arousal'], redFlags: ['Suicidal thoughts', 'Psychosis'], diagnosticApproach: ['History and risk assessment'], differentialDiagnosis: ['Thyroid disease', 'Substance use'], nonDrugManagement: ['Cognitive behavioural therapy', 'Sleep hygiene'], whenToRefer: ['Severe impairment', 'Suicidality'], sourceIds: [] },
  { id: 'depression', name: 'Depression', category: 'Psychiatry', overview: 'Mood disorder with persistent low mood or loss of interest.', symptoms: ['Low mood', 'Anhedonia', 'Poor concentration'], signs: ['Reduced energy'], redFlags: ['Suicidal intent', 'Psychosis'], diagnosticApproach: ['Screening and risk assessment'], differentialDiagnosis: ['Adjustment disorder', 'Medical causes'], nonDrugManagement: ['Psychotherapy', 'Sleep and activity routine'], whenToRefer: ['Severe depression', 'Risk to self'], sourceIds: [] },
  { id: 'pregnancy-associated-hypertension', name: 'Pregnancy-associated hypertension', category: 'Obstetrics and gynecology', overview: 'Blood pressure elevation in pregnancy requires urgent assessment.', symptoms: ['Headache', 'Visual symptoms'], signs: ['Elevated BP'], redFlags: ['Severe headache', 'Proteinuria'], diagnosticApproach: ['Blood pressure measurement', 'Urinalysis'], differentialDiagnosis: ['Essential hypertension'], nonDrugManagement: ['Monitoring'], whenToRefer: ['Severe preeclampsia', 'Eclampsia risk'], sourceIds: [] },
  { id: 'meningitis', name: 'Acute meningitis', category: 'Emergency medicine', overview: 'Potentially life-threatening central nervous system infection requiring immediate assessment.', symptoms: ['Headache', 'Fever', 'Neck stiffness'], signs: ['Photophobia', 'Altered consciousness'], redFlags: ['Sepsis', 'Purpura', 'Reduced consciousness'], diagnosticApproach: ['Urgent clinical assessment', 'LP if appropriate'], differentialDiagnosis: ['Encephalitis', 'Subarachnoid haemorrhage'], nonDrugManagement: ['Supportive care'], whenToRefer: ['Urgent emergency referral'], sourceIds: [] },
  { id: 'sepsis', name: 'Sepsis', category: 'Emergency medicine', overview: 'Organ dysfunction caused by dysregulated host response to infection.', symptoms: ['Fever', 'Hypotension', 'Confusion'], signs: ['Tachycardia', 'Poor perfusion'], redFlags: ['Septic shock', 'Multi-organ failure'], diagnosticApproach: ['Source control and blood cultures', 'Lactate', 'Vitals'], differentialDiagnosis: ['Acute cardiovascular event', 'Haemorrhage'], nonDrugManagement: ['Fluid resuscitation and ICU care'], whenToRefer: ['Immediate emergency care'], sourceIds: [] },
  { id: 'acute-appendicitis', name: 'Acute appendicitis', category: 'Surgery', overview: 'Inflammation of the appendix requiring surgical assessment.', symptoms: ['Periumbilical pain', 'Anorexia'], signs: ['Right lower quadrant tenderness'], redFlags: ['Peritonitis', 'Sepsis'], diagnosticApproach: ['Clinical assessment', 'Imaging if needed'], differentialDiagnosis: ['Gastroenteritis', 'PID', 'Mesenteric adenitis'], nonDrugManagement: ['Nil by mouth until evaluation'], whenToRefer: ['Surgical intervention'], sourceIds: [] },
  { id: 'acute-cholecystitis', name: 'Acute cholecystitis', category: 'Surgery', overview: 'Gallbladder inflammation requiring urgent evaluation.', symptoms: ['Right upper quadrant pain', 'Nausea'], signs: ['Murphy sign'], redFlags: ['Sepsis', 'Perforation'], diagnosticApproach: ['Ultrasound'], differentialDiagnosis: ['Biliary colic', 'Hepatitis'], nonDrugManagement: ['Nil by mouth if acute'], whenToRefer: ['Surgical review'], sourceIds: [] },
  { id: 'bronchitis', name: 'Acute bronchitis', category: 'Respiratory medicine', overview: 'Self-limited airway inflammation usually viral in origin.', symptoms: ['Cough', 'Sputum'], signs: ['Chest discomfort'], redFlags: ['Shortness of breath', 'Fever'], diagnosticApproach: ['History and examination'], differentialDiagnosis: ['Pneumonia', 'Asthma'], nonDrugManagement: ['Supportive care', 'Hydration'], whenToRefer: ['Persistent symptoms', 'Respiratory difficulty'], sourceIds: [] },
  { id: 'uric-acid-gout', name: 'Gout', category: 'Rheumatology', overview: 'Deposition of monosodium urate crystals causing acute inflammatory arthritis.', symptoms: ['Severe joint pain', 'Swelling'], signs: ['Hot swollen joint'], redFlags: ['Multiple joints', 'Sepsis'], diagnosticApproach: ['Clinical assessment'], differentialDiagnosis: ['Cellulitis', 'Pseudogout'], nonDrugManagement: ['Low-purine diet'], whenToRefer: ['Frequent flares', 'Tophus formation'], sourceIds: [] }
];

const conditionDrugLinks = [
  { id: 'acute-gastroenteritis-supportive-care', conditionId: 'acute-gastroenteritis', conditionName: 'Acute gastroenteritis', drugId: 'oral-rehydration-salts', drugName: 'Oral rehydration salts', line: 'Supportive care', regimen: 'Use appropriate oral rehydration solution according to age and severity.', duration: 'As required for rehydration', route: 'Oral', patientGroup: 'Adults and children', indicationCriteria: 'When dehydration risk is present or fluids are being replaced.', contraindicationChecks: ['Unable to drink','bowel obstruction'], monitoring: ['Hydration status'], notes: 'Prioritise hydration and evaluate for red flags.', sourceIds: [] },
  { id: 'hypertension-first-line', conditionId: 'hypertension', conditionName: 'Hypertension', drugId: 'amlodipine', drugName: 'Amlodipine', line: 'First-line', regimen: 'Initiate at a clinician-verified dose and titrate to blood pressure target.', duration: 'Long-term, individualized', route: 'Oral', patientGroup: 'Adults', indicationCriteria: 'Consistently elevated blood pressure after repeated measurement.', contraindicationChecks: ['Shock', 'Severe aortic stenosis'], monitoring: ['Blood pressure', 'Peripheral oedema'], notes: 'Use current national hypertension guidance.', sourceIds: [] },
  { id: 'asthma-prn-salbutamol', conditionId: 'asthma', conditionName: 'Asthma', drugId: 'salbutamol', drugName: 'Salbutamol', line: 'First-line', regimen: 'Use as a rescue inhaler when bronchospasm occurs.', duration: 'As needed', route: 'Inhaled', patientGroup: 'Adults and children', indicationCriteria: 'Acute wheeze or dyspnoea when clinically appropriate.', contraindicationChecks: ['Known severe tachyarrhythmia'], monitoring: ['Response to inhalation'], notes: 'Ensure correct inhaler technique and rescue plan.', sourceIds: [] },
  { id: 'uncomplicated-pneumonia-amoxicillin', conditionId: 'uncomplicated-pneumonia', conditionName: 'Community-acquired pneumonia', drugId: 'amoxicillin', drugName: 'Amoxicillin', line: 'First-line', regimen: 'Use an evidence-based systemic regimen suited to the clinical presentation and local resistance patterns.', duration: 'As guided by current clinical guidance', route: 'Oral', patientGroup: 'Adults', indicationCriteria: 'When bacterial pneumonia is likely and clinician-specified.', contraindicationChecks: ['Penicillin hypersensitivity'], monitoring: ['Clinical response', 'Adverse reactions'], notes: 'Check local resistance patterns and patient factors before prescription.', sourceIds: [] },
  { id: 'type-2-diabetes-metformin', conditionId: 'type-2-diabetes', conditionName: 'Type 2 diabetes mellitus', drugId: 'metformin', drugName: 'Metformin', line: 'First-line', regimen: 'Initiate according to current diabetes guidance and renal function.', duration: 'Long-term, individualized', route: 'Oral', patientGroup: 'Adults', indicationCriteria: 'Persistent hyperglycaemia after lifestyle changes when appropriate.', contraindicationChecks: ['Severe renal impairment', 'Acute illness'], monitoring: ['HbA1c', 'Renal function'], notes: 'Review renal function before and during treatment.', sourceIds: [] },
  { id: 'acute-migraine-paracetamol', conditionId: 'acute-migraine', conditionName: 'Acute migraine', drugId: 'paracetamol', drugName: 'Paracetamol', line: 'Adjunct', regimen: 'Use an appropriate dose for symptom relief where suitable.', duration: 'Short-term symptomatic use', route: 'Oral', patientGroup: 'Adults', indicationCriteria: 'Mild to moderate pain when clinically appropriate.', contraindicationChecks: ['Severe hepatic impairment'], monitoring: ['Pain control'], notes: 'Use as part of a broader symptom plan and avoid excess dosing.', sourceIds: [] },
  { id: 'acute-urinary-tract-infection-nitrofurantoin', conditionId: 'acute-urinary-tract-infection', conditionName: 'Acute urinary tract infection', drugId: 'nitrofurantoin', drugName: 'Nitrofurantoin', line: 'First-line', regimen: 'Use a clinician-approved regimen based on local resistance and patient factors.', duration: 'As recommended by current guidance', route: 'Oral', patientGroup: 'Adults', indicationCriteria: 'Lower UTI when clinically appropriate.', contraindicationChecks: ['Severe renal impairment'], monitoring: ['Symptom response'], notes: 'Do not use without assessing clinical appropriateness.', sourceIds: [] },
  { id: 'sepsis-empiric-antibiotic', conditionId: 'sepsis', conditionName: 'Sepsis', drugId: 'ceftriaxone', drugName: 'Ceftriaxone', line: 'Emergency', regimen: 'Use as part of urgent prescriber-directed empiric therapy guided by local protocols.', duration: 'Short-term, guided by source control and culture data', route: 'Injectable', patientGroup: 'Adults', indicationCriteria: 'Suspected bacterial sepsis requiring emergency assessment.', contraindicationChecks: ['Severe cephalosporin hypersensitivity'], monitoring: ['Vitals', 'Renal function', 'Response to therapy'], notes: 'This is emergency care; source control and clinical supervision are essential.', sourceIds: [] }
];

const references = [
  {
    id: 'reference-001',
    title: 'Department of Drug Administration (DDA), Nepal',
    organization: 'Government of Nepal',
    sourceType: 'Official regulatory source',
    url: 'https://dda.gov.np/',
    publicationDate: null,
    lastChecked: null,
    applicableSections: ['Regulatory status', 'Drug registration and safety'],
    notes: 'Useful for official Nepal product and regulatory information.'
  },
  {
    id: 'reference-002',
    title: 'Ministry of Health and Population, Nepal',
    organization: 'Government of Nepal',
    sourceType: 'Official health guidance',
    url: 'https://mohp.gov.np/',
    publicationDate: null,
    lastChecked: null,
    applicableSections: ['National public health guidance'],
    notes: 'Useful for Nepal public health and treatment context.'
  },
  {
    id: 'reference-003',
    title: 'WHO: Essential Medicines and Health Products',
    organization: 'World Health Organization',
    sourceType: 'International guideline and reference',
    url: 'https://www.who.int/health-topics/essential-medicines',
    publicationDate: null,
    lastChecked: null,
    applicableSections: ['Essential medicines information'],
    notes: 'Useful for evidence-informed common therapy and nomenclature.'
  },
  {
    id: 'reference-004',
    title: 'WHO Model Formulary',
    organization: 'World Health Organization',
    sourceType: 'Reference formulary',
    url: 'https://www.who.int/publications/i/item/9789241547965',
    publicationDate: null,
    lastChecked: null,
    applicableSections: ['Drug selection', 'Formulary guidance'],
    notes: 'Useful for general pharmacotherapy context and evidence-informed selection.'
  },
  {
    id: 'reference-005',
    title: 'NICE clinical guidelines',
    organization: 'National Institute for Health and Care Excellence',
    sourceType: 'Clinical guideline',
    url: 'https://www.nice.org.uk/guidance',
    publicationDate: null,
    lastChecked: null,
    applicableSections: ['Evidence-based treatment pathways'],
    notes: 'Useful for general clinical evidence and treatment quality.'
  },
  {
    id: 'reference-006',
    title: 'NHS Medicines information',
    organization: 'National Health Service',
    sourceType: 'Medicines reference',
    url: 'https://www.nhs.uk/medicines/',
    publicationDate: null,
    lastChecked: null,
    applicableSections: ['Dosage and patient information'],
    notes: 'Useful for general patient and dosage information.'
  },
  {
    id: 'reference-007',
    title: 'FDA Drug Labels',
    organization: 'U.S. Food and Drug Administration',
    sourceType: 'Product label',
    url: 'https://www.accessdata.fda.gov/scripts/cder/daf/',
    publicationDate: null,
    lastChecked: null,
    applicableSections: ['Product-specific labeling'],
    notes: 'Useful for product-specific indications and cautions where relevant.'
  },
  {
    id: 'reference-008',
    title: 'DailyMed',
    organization: 'National Library of Medicine',
    sourceType: 'Medication label database',
    url: 'https://dailymed.nlm.nih.gov/dailymed/',
    publicationDate: null,
    lastChecked: null,
    applicableSections: ['Product-specific labels'],
    notes: 'Useful as a label source for medication information.'
  },
  {
    id: 'reference-009',
    title: 'Goodman & Gilman’s The Pharmacological Basis of Therapeutics',
    organization: 'McGraw-Hill',
    sourceType: 'Textbook',
    url: 'https://www.mhprofessional.com/',
    publicationDate: null,
    lastChecked: null,
    applicableSections: ['Pharmacology and therapeutics'],
    notes: 'Useful for core pharmacology and mechanism review.'
  },
  {
    id: 'reference-010',
    title: 'Katzung & Trevor’s Pharmacology: Examination & Board Review',
    organization: 'McGraw-Hill',
    sourceType: 'Textbook',
    url: 'https://accessmedicine.mhmedical.com/',
    publicationDate: null,
    lastChecked: null,
    applicableSections: ['Pharmacology review'],
    notes: 'Useful for educational review and framework.'
  },
  {
    id: 'reference-011',
    title: 'Davidson’s Principles and Practice of Medicine',
    organization: 'Elsevier',
    sourceType: 'Medical textbook',
    url: 'https://www.elsevier.com/books/davidsons-principles-and-practice-of-medicine',
    publicationDate: null,
    lastChecked: null,
    applicableSections: ['Clinical medicine and disease management'],
    notes: 'Useful for common disease concepts.'
  },
  {
    id: 'reference-012',
    title: 'Harrison’s Principles of Internal Medicine',
    organization: 'McGraw-Hill',
    sourceType: 'Medical textbook',
    url: 'https://accessmedicine.mhmedical.com/',
    publicationDate: null,
    lastChecked: null,
    applicableSections: ['Internal medicine and therapeutics'],
    notes: 'Useful for general clinical reasoning.'
  },
  {
    id: 'reference-013',
    title: 'Nepal National Formulary',
    organization: 'Nepal Ministry of Health and Population',
    sourceType: 'National formulary',
    url: 'https://mohp.gov.np/',
    publicationDate: null,
    lastChecked: null,
    applicableSections: ['Country-specific formulary data'],
    notes: 'Use when national formulary content is available.'
  },
  {
    id: 'reference-014',
    title: 'WHO Recommended Routine Immunization Schedule',
    organization: 'World Health Organization',
    sourceType: 'Public health reference',
    url: 'https://www.who.int/teams/immunization-vaccines-and-biologicals',
    publicationDate: null,
    lastChecked: null,
    applicableSections: ['Preventive care'],
    notes: 'Useful for immunization context.'
  },
  {
    id: 'reference-015',
    title: 'WHO Drug Safety and Pharmacovigilance',
    organization: 'World Health Organization',
    sourceType: 'Safety and monitoring source',
    url: 'https://www.who.int/teams/regulation-prequalification/pharmacovigilance',
    publicationDate: null,
    lastChecked: null,
    applicableSections: ['Drug safety'],
    notes: 'Useful for pharmacovigilance and risk monitoring frameworks.'
  }
];

const manifest = {
  databaseName: 'DOC — Drug of Choice Nepal Database',
  generatedAt: new Date().toISOString(),
  targetMinimumGenericMedicines: 500,
  generatedGenericMedicines: genericMedicines.length,
  statuses: {
    clinicalReferenceOnly: true,
    pricesSourceVerified: false,
    published: false,
    sourceTraceabilityRequired: true
  },
  notes: 'This dataset is intentionally conservative. Medicine prices remain unverified unless a source is checked and the price is explicitly confirmed.'
};

const outputFiles = {
  'data/drugs.json': JSON.stringify(genericMedicines.map((name, index) => buildDrugRecord(name, index)), null, 2),
  'data/prices.json': JSON.stringify([
    {
      id: 'paracetamol-dolo-500-mg-10',
      brandName: 'Dolo',
      genericName: 'Paracetamol',
      ingredients: [{ genericName: 'Paracetamol', strength: '500 mg' }],
      dosageForm: 'Tablet',
      strength: '500 mg',
      packSize: '10 tablets',
      manufacturer: null,
      priceNPR: null,
      priceType: 'MRP',
      sourceOrganization: null,
      sourceTitle: null,
      sourceUrl: null,
      verificationDate: null,
      verificationStatus: 'Unverified',
      notes: 'Placeholder for a future Nepal price check. Do not treat as a market price.'
    },
    {
      id: 'amoxicillin-250-mg-cap-10',
      brandName: 'Novamox',
      genericName: 'Amoxicillin',
      ingredients: [{ genericName: 'Amoxicillin', strength: '250 mg' }],
      dosageForm: 'Capsule',
      strength: '250 mg',
      packSize: '10 capsules',
      manufacturer: null,
      priceNPR: null,
      priceType: 'MRP',
      sourceOrganization: null,
      sourceTitle: null,
      sourceUrl: null,
      verificationDate: null,
      verificationStatus: 'Unverified',
      notes: 'Placeholder pending source verification.'
    }
  ], null, 2),
  'data/conditions.json': JSON.stringify(baseConditions, null, 2),
  'data/conditionDrugLinks.json': JSON.stringify(conditionDrugLinks, null, 2),
  'data/references.json': JSON.stringify(references, null, 2),
  'data/database-manifest.json': JSON.stringify(manifest, null, 2)
};

for (const [relativePath, content] of Object.entries(outputFiles)) {
  const filePath = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content + '\n', 'utf8');
}

console.log(`Generated ${genericMedicines.length} drug records and supporting files in ${dataDir}.`);
console.log('Next step: node scripts/validate-database.js');
