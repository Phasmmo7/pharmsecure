// seeder utility helpers
const DAY = 24 * 60 * 60 * 1000;
export const inDays = (d) => new Date(Date.now() + d * DAY).toISOString();
export const daysAgo = (d) => new Date(Date.now() - d * DAY).toISOString();

const NOW = () => new Date().toISOString();

const C = {
  mumbai:   { city: 'Mumbai',     lat: 19.076, lng: 72.877 },
  navimumb: { city: 'Navi Mumbai',lat: 19.033, lng: 73.020 },
  thane:    { city: 'Thane',      lat: 19.218, lng: 72.978 },
  pune:     { city: 'Pune',       lat: 18.520, lng: 73.856 },
  nashik:   { city: 'Nashik',     lat: 19.997, lng: 73.789 },
};

function makeOrg(id, name, type, loc, trust, flags = {}) {
  return { id, name, type, ...loc, trustScore: trust, ...flags };
}

function makeBatch(o) {
  return {
    id: o.id, name: o.name, generic: o.generic, form: o.form, strength: o.strength,
    mfgId: o.mfgId, holderId: o.holderId, expiry: o.expiry, stock: o.stock,
    dailyBurn: o.dailyBurn, safetyBuffer: o.safetyBuffer, coldChain: !!o.coldChain,
    price: o.price || 0, unit: o.unit || 'strip',
    createdAt: o.createdAt || inDays(-120), serialCount: o.serialCount || 1,
  };
}

export function buildSeed() {
  const orgs = {
    org_sunrise:  makeOrg('org_sunrise',  'Sunrise Pharma Manufacturing',  'Manufacturer', C.mumbai,   96),
    org_citycare: makeOrg('org_citycare', 'CityCare Multispecialty Hospital','Hospital',    C.mumbai,   92),
    org_navicare: makeOrg('org_navicare', 'NaviCare Community Clinic',     'Clinic',       C.navimumb, 76),
    org_thane:    makeOrg('org_thane',    'Aarogya Seva Charitable Trust', 'NGO',          C.thane,    70),
    org_punecliw: makeOrg('org_punecliw', 'GreenLeaf Rural Clinic',        'Clinic',       C.pune,     78),
    org_punepham: makeOrg('org_punepham', 'Ashok Pharmacy',                'Pharmacy',     C.pune,     65),
    org_nashik:   makeOrg('org_nashik',   'Countryside Charitable Clinic', 'Clinic',       C.nashik,   58),
    org_meddist:  makeOrg('org_meddist',  'MedSupply Distributors',        'Distributor',  C.mumbai,   84),
    org_vaccine:  makeOrg('org_vaccine',  'JanSeva Vaccination Camp',      'NGO',          C.navimumb, 63),
  };

  const batches = {};
  function addB(o) { batches[o.id] = makeBatch(o); return batches[o.id]; }

// --- Original medicines (with prices) ---
addB({ id:'bat_met', name:'Metformin', generic:'Metformin HCl', form:'Tablet', strength:'500 mg',
  mfgId:'org_sunrise', holderId:'org_citycare', expiry:inDays(38), stock:1500, dailyBurn:18, safetyBuffer:120, price:45, unit:'strip', serialCount:150 });
addB({ id:'bat_ins', name:'Insulin Glargine', generic:'Insulin Glargine', form:'Injectable', strength:'100 IU/mL',
  mfgId:'org_sunrise', holderId:'org_citycare', expiry:inDays(55), stock:340, dailyBurn:2, safetyBuffer:30, coldChain:true, price:1250, unit:'vial', serialCount:40 });
addB({ id:'bat_amox', name:'Amoxicillin', generic:'Amoxicillin', form:'Capsule', strength:'500 mg',
  mfgId:'org_sunrise', holderId:'org_citycare', expiry:inDays(45), stock:400, dailyBurn:12, safetyBuffer:100, price:35, unit:'strip', serialCount:120 });
addB({ id:'bat_ond', name:'Ondansetron', generic:'Ondansetron', form:'Tablet', strength:'4 mg',
  mfgId:'org_sunrise', holderId:'org_citycare', expiry:inDays(28), stock:480, dailyBurn:6, safetyBuffer:40, price:28, unit:'strip', serialCount:90 });
addB({ id:'bat_cet', name:'Cetirizine', generic:'Cetirizine HCl', form:'Tablet', strength:'10 mg',
  mfgId:'org_sunrise', holderId:'org_citycare', expiry:inDays(70), stock:900, dailyBurn:10, safetyBuffer:80, price:15, unit:'strip', serialCount:130 });
addB({ id:'bat_par', name:'Paracetamol', generic:'Paracetamol', form:'Tablet', strength:'500 mg',
  mfgId:'org_sunrise', holderId:'org_punepham', expiry:inDays(200), stock:5000, dailyBurn:90, safetyBuffer:400, price:12, unit:'strip', serialCount:400 });
addB({ id:'bat_sal', name:'Salbutamol Inhaler', generic:'Salbutamol', form:'Inhaler', strength:'100 mcg/puff',
  mfgId:'org_sunrise', holderId:'org_citycare', expiry:inDays(25), stock:150, dailyBurn:3, safetyBuffer:20, price:320, unit:'piece', serialCount:30 });
addB({ id:'bat_cef', name:'Cefixime', generic:'Cefixime', form:'Tablet', strength:'200 mg',
  mfgId:'org_sunrise', holderId:'org_citycare', expiry:inDays(90), stock:1200, dailyBurn:7, safetyBuffer:60, price:85, unit:'strip', serialCount:180 });
addB({ id:'bat_ns', name:'Normal Saline', generic:'Sodium Chloride 0.9%', form:'IV Fluid', strength:'500 mL',
  mfgId:'org_sunrise', holderId:'org_citycare', expiry:inDays(20), stock:2000, dailyBurn:40, safetyBuffer:500, price:25, unit:'bottle', serialCount:60 });
addB({ id:'bat_dex', name:'Dextrose 5%', generic:'Dextrose', form:'IV Fluid', strength:'500 mL',
  mfgId:'org_sunrise', holderId:'org_citycare', expiry:inDays(33), stock:950, dailyBurn:15, safetyBuffer:60, price:30, unit:'bottle', serialCount:50 });
addB({ id:'bat_azm', name:'Azithromycin', generic:'Azithromycin', form:'Tablet', strength:'250 mg',
  mfgId:'org_sunrise', holderId:'org_navicare', expiry:inDays(15), stock:600, dailyBurn:5, safetyBuffer:30, price:55, unit:'strip', serialCount:80 });
addB({ id:'bat_vit', name:'Vitamin D3', generic:'Cholecalciferol', form:'Capsule', strength:'60,000 IU',
  mfgId:'org_sunrise', holderId:'org_citycare', expiry:inDays(-5), stock:80, dailyBurn:1, safetyBuffer:10, price:95, unit:'strip', serialCount:20 });
addB({ id:'bat_amo_dup', name:'Amoxicillin', generic:'Amoxicillin', form:'Capsule', strength:'500 mg',
  mfgId:'org_sunrise', holderId:'org_meddist', expiry:inDays(160), stock:900, dailyBurn:11, safetyBuffer:80, price:35, unit:'strip', serialCount:8 });

// --- Antibiotics ---
addB({ id:'bat_cip', name:'Ciprofloxacin', generic:'Ciprofloxacin HCl', form:'Tablet', strength:'500 mg',
  mfgId:'org_sunrise', holderId:'org_citycare', expiry:inDays(120), stock:800, dailyBurn:8, safetyBuffer:60, price:42, unit:'strip', serialCount:100 });
addB({ id:'bat_dox', name:'Doxycycline', generic:'Doxycycline HCl', form:'Capsule', strength:'100 mg',
  mfgId:'org_sunrise', holderId:'org_navicare', expiry:inDays(95), stock:650, dailyBurn:6, safetyBuffer:50, price:38, unit:'strip', serialCount:80 });
addB({ id:'bat_ery', name:'Erythromycin', generic:'Erythromycin Stearate', form:'Tablet', strength:'250 mg',
  mfgId:'org_sunrise', holderId:'org_punecliw', expiry:inDays(60), stock:400, dailyBurn:5, safetyBuffer:40, price:30, unit:'strip', serialCount:60 });
addB({ id:'bat_lev', name:'Levofloxacin', generic:'Levofloxacin', form:'Tablet', strength:'500 mg',
  mfgId:'org_sunrise', holderId:'org_thane', expiry:inDays(80), stock:350, dailyBurn:4, safetyBuffer:30, price:65, unit:'strip', serialCount:50 });
addB({ id:'bat_met_r', name:'Metronidazole', generic:'Metronidazole', form:'Tablet', strength:'400 mg',
  mfgId:'org_sunrise', holderId:'org_nashik', expiry:inDays(140), stock:700, dailyBurn:7, safetyBuffer:50, price:18, unit:'strip', serialCount:90 });
addB({ id:'bat_hex', name:'Chlorhexidine', generic:'Chlorhexidine Gluconate', form:'Solution', strength:'5%',
  mfgId:'org_sunrise', holderId:'org_citycare', expiry:inDays(200), stock:300, dailyBurn:3, safetyBuffer:20, price:55, unit:'bottle', serialCount:40 });

// --- Pain & Anti-inflammatory ---
addB({ id:'bat_ibu', name:'Ibuprofen', generic:'Ibuprofen', form:'Tablet', strength:'400 mg',
  mfgId:'org_sunrise', holderId:'org_citycare', expiry:inDays(180), stock:2000, dailyBurn:25, safetyBuffer:200, price:10, unit:'strip', serialCount:200 });
addB({ id:'bat_dic', name:'Diclofenac', generic:'Diclofenac Sodium', form:'Tablet', strength:'50 mg',
  mfgId:'org_sunrise', holderId:'org_punepham', expiry:inDays(150), stock:1200, dailyBurn:12, safetyBuffer:80, price:14, unit:'strip', serialCount:120 });
addB({ id:'bat_ace', name:'Aceclofenac', generic:'Aceclofenac', form:'Tablet', strength:'100 mg',
  mfgId:'org_sunrise', holderId:'org_navicare', expiry:inDays(110), stock:500, dailyBurn:6, safetyBuffer:40, price:22, unit:'strip', serialCount:70 });
addB({ id:'bat_nap', name:'Naproxen', generic:'Naproxen Sodium', form:'Tablet', strength:'500 mg',
  mfgId:'org_sunrise', holderId:'org_thane', expiry:inDays(90), stock:250, dailyBurn:3, safetyBuffer:25, price:35, unit:'strip', serialCount:40 });
addB({ id:'bat_tri', name:'Tramadol', generic:'Tramadol HCl', form:'Tablet', strength:'50 mg',
  mfgId:'org_sunrise', holderId:'org_citycare', expiry:inDays(75), stock:180, dailyBurn:2, safetyBuffer:15, price:48, unit:'strip', serialCount:30 });

// --- Cardiovascular ---
addB({ id:'bat_ator', name:'Atorvastatin', generic:'Atorvastatin Calcium', form:'Tablet', strength:'20 mg',
  mfgId:'org_sunrise', holderId:'org_citycare', expiry:inDays(160), stock:900, dailyBurn:10, safetyBuffer:70, price:55, unit:'strip', serialCount:100 });
addB({ id:'bat_amlo', name:'Amlodipine', generic:'Amlodipine Besylate', form:'Tablet', strength:'5 mg',
  mfgId:'org_sunrise', holderId:'org_punecliw', expiry:inDays(130), stock:1100, dailyBurn:12, safetyBuffer:80, price:32, unit:'strip', serialCount:110 });
addB({ id:'bat_tel', name:'Telmisartan', generic:'Telmisartan', form:'Tablet', strength:'40 mg',
  mfgId:'org_sunrise', holderId:'org_navicare', expiry:inDays(100), stock:450, dailyBurn:5, safetyBuffer:35, price:68, unit:'strip', serialCount:60 });
addB({ id:'bat_met_b', name:'Metoprolol', generic:'Metoprolol Succinate', form:'Tablet', strength:'50 mg',
  mfgId:'org_sunrise', holderId:'org_nashik', expiry:inDays(85), stock:380, dailyBurn:4, safetyBuffer:30, price:45, unit:'strip', serialCount:50 });
addB({ id:'bat_clo', name:'Clopidogrel', generic:'Clopidogrel Bisulfate', form:'Tablet', strength:'75 mg',
  mfgId:'org_sunrise', holderId:'org_thane', expiry:inDays(140), stock:300, dailyBurn:3, safetyBuffer:25, price:72, unit:'strip', serialCount:40 });
addB({ id:'bat_hyd', name:'Hydrochlorothiazide', generic:'Hydrochlorothiazide', form:'Tablet', strength:'25 mg',
  mfgId:'org_sunrise', holderId:'org_citycare', expiry:inDays(170), stock:600, dailyBurn:6, safetyBuffer:50, price:18, unit:'strip', serialCount:70 });

// --- Diabetes ---
addB({ id:'bat_gli', name:'Glimepiride', generic:'Glimepiride', form:'Tablet', strength:'2 mg',
  mfgId:'org_sunrise', holderId:'org_punepham', expiry:inDays(120), stock:400, dailyBurn:5, safetyBuffer:35, price:38, unit:'strip', serialCount:50 });
addB({ id:'bat_sit', name:'Sitagliptin', generic:'Sitagliptin Phosphate', form:'Tablet', strength:'100 mg',
  mfgId:'org_sunrise', holderId:'org_citycare', expiry:inDays(95), stock:200, dailyBurn:2, safetyBuffer:20, price:185, unit:'strip', serialCount:30 });
addB({ id:'bat_emp', name:'Empagliflozin', generic:'Empagliflozin', form:'Tablet', strength:'25 mg',
  mfgId:'org_sunrise', holderId:'org_navicare', expiry:inDays(80), stock:150, dailyBurn:2, safetyBuffer:15, price:220, unit:'strip', serialCount:25 });

// --- Respiratory ---
addB({ id:'bat_mont', name:'Montelukast', generic:'Montelukast Sodium', form:'Tablet', strength:'10 mg',
  mfgId:'org_sunrise', holderId:'org_citycare', expiry:inDays(110), stock:700, dailyBurn:7, safetyBuffer:50, price:42, unit:'strip', serialCount:80 });
addB({ id:'bat_des', name:'Desloratadine', generic:'Desloratadine', form:'Tablet', strength:'5 mg',
  mfgId:'org_sunrise', holderId:'org_punecliw', expiry:inDays(100), stock:350, dailyBurn:4, safetyBuffer:30, price:55, unit:'strip', serialCount:50 });
addB({ id:'bat_ben', name:'Benzydamine', generic:'Benzydamine HCl', form:'Gargle', strength:'0.15%',
  mfgId:'org_sunrise', holderId:'org_thane', expiry:inDays(150), stock:200, dailyBurn:2, safetyBuffer:15, price:65, unit:'bottle', serialCount:30 });
addB({ id:'bat_amb', name:'Ambroxol', generic:'Ambroxol HCl', form:'Syrup', strength:'75 mg/5 mL',
  mfgId:'org_sunrise', holderId:'org_nashik', expiry:inDays(90), stock:250, dailyBurn:3, safetyBuffer:20, price:48, unit:'bottle', serialCount:35 });

// --- Gastrointestinal ---
addB({ id:'bat_panto', name:'Pantoprazole', generic:'Pantoprazole Sodium', form:'Tablet', strength:'40 mg',
  mfgId:'org_sunrise', holderId:'org_citycare', expiry:inDays(130), stock:1000, dailyBurn:10, safetyBuffer:70, price:35, unit:'strip', serialCount:100 });
addB({ id:'bat_ran', name:'Ranitidine', generic:'Ranitidine HCl', form:'Tablet', strength:'150 mg',
  mfgId:'org_sunrise', holderId:'org_navicare', expiry:inDays(60), stock:500, dailyBurn:6, safetyBuffer:40, price:12, unit:'strip', serialCount:60 });
addB({ id:'bat_lop', name:'Loperamide', generic:'Loperamide HCl', form:'Capsule', strength:'2 mg',
  mfgId:'org_sunrise', holderId:'org_punecliw', expiry:inDays(140), stock:300, dailyBurn:3, safetyBuffer:25, price:28, unit:'strip', serialCount:40 });
addB({ id:'bat_suc', name:'Sucralfate', generic:'Sucralfate', form:'Tablet', strength:'1 g',
  mfgId:'org_sunrise', holderId:'org_nashik', expiry:inDays(110), stock:200, dailyBurn:2, safetyBuffer:20, price:55, unit:'strip', serialCount:30 });

// --- Vitamins & Supplements ---
addB({ id:'bat_fol', name:'Folic Acid', generic:'Folic Acid', form:'Tablet', strength:'5 mg',
  mfgId:'org_sunrise', holderId:'org_thane', expiry:inDays(200), stock:1500, dailyBurn:15, safetyBuffer:100, price:8, unit:'strip', serialCount:150 });
addB({ id:'bat_iron', name:'Iron Supplement', generic:'Ferrous Fumarate', form:'Tablet', strength:'200 mg',
  mfgId:'org_sunrise', holderId:'org_citycare', expiry:inDays(180), stock:800, dailyBurn:8, safetyBuffer:60, price:15, unit:'strip', serialCount:90 });
addB({ id:'bat_cal', name:'Calcium + D3', generic:'Calcium Carbonate + D3', form:'Tablet', strength:'500 mg + 250 IU',
  mfgId:'org_sunrise', holderId:'org_punepham', expiry:inDays(160), stock:600, dailyBurn:6, safetyBuffer:50, price:35, unit:'strip', serialCount:70 });
addB({ id:'bat_multi', name:'Multivitamin', generic:'Multivitamin Complex', form:'Capsule', strength:'1 cap',
  mfgId:'org_sunrise', holderId:'org_navicare', expiry:inDays(150), stock:400, dailyBurn:5, safetyBuffer:35, price:45, unit:'strip', serialCount:50 });

// --- Antifungal ---
addB({ id:'bat_flu', name:'Fluconazole', generic:'Fluconazole', form:'Capsule', strength:'150 mg',
  mfgId:'org_sunrise', holderId:'org_thane', expiry:inDays(120), stock:250, dailyBurn:2, safetyBuffer:20, price:32, unit:'strip', serialCount:35 });
addB({ id:'bat_ke', name:'Ketoconazole', generic:'Ketoconazole', form:'Tablet', strength:'200 mg',
  mfgId:'org_sunrise', holderId:'org_nashik', expiry:inDays(100), stock:180, dailyBurn:2, safetyBuffer:15, price:28, unit:'strip', serialCount:25 });

// --- IV & Emergency ---
addB({ id:'bat_ringer', name:'Ringer Lactate', generic:'Ringer Lactate', form:'IV Fluid', strength:'500 mL',
  mfgId:'org_sunrise', holderId:'org_citycare', expiry:inDays(30), stock:1200, dailyBurn:20, safetyBuffer:200, price:35, unit:'bottle', serialCount:100 });
addB({ id:'bat_man', name:'Mannitol', generic:'Mannitol', form:'IV Fluid', strength:'20% 500 mL',
  mfgId:'org_sunrise', holderId:'org_citycare', expiry:inDays(25), stock:150, dailyBurn:2, safetyBuffer:15, price:85, unit:'bottle', serialCount:25 });
addB({ id:'bat_vanco', name:'Vancomycin', generic:'Vancomycin HCl', form:'Injectable', strength:'500 mg',
  mfgId:'org_sunrise', holderId:'org_citycare', expiry:inDays(40), stock:100, dailyBurn:1, safetyBuffer:10, coldChain:true, price:450, unit:'vial', serialCount:20 });

// --- Pediatric ---
addB({ id:'bat_cro', name:'Cetirizine Drops', generic:'Cetirizine HCl', form:'Drops', strength:'5 mg/5 mL',
  mfgId:'org_sunrise', holderId:'org_punecliw', expiry:inDays(90), stock:300, dailyBurn:3, safetyBuffer:25, price:42, unit:'bottle', serialCount:40 });
addB({ id:'bat_par_s', name:'Paracetamol Syrup', generic:'Paracetamol', form:'Syrup', strength:'120 mg/5 mL',
  mfgId:'org_sunrise', holderId:'org_navicare', expiry:inDays(100), stock:400, dailyBurn:5, safetyBuffer:30, price:28, unit:'bottle', serialCount:50 });
addB({ id:'bat_azi_s', name:'Azithromycin Syrup', generic:'Azithromycin', form:'Suspension', strength:'200 mg/5 mL',
  mfgId:'org_sunrise', holderId:'org_thane', expiry:inDays(70), stock:200, dailyBurn:2, safetyBuffer:15, price:65, unit:'bottle', serialCount:30 });

// --- Dermatology ---
addB({ id:'bat_mup', name:'Mupirocin', generic:'Mupirocin', form:'Ointment', strength:'2%',
  mfgId:'org_sunrise', holderId:'org_citycare', expiry:inDays(130), stock:250, dailyBurn:2, safetyBuffer:20, price:75, unit:'tube', serialCount:35 });
addB({ id:'bat_ben_o', name:'Betamethasone', generic:'Betamethasone Valerate', form:'Cream', strength:'0.1%',
  mfgId:'org_sunrise', holderId:'org_punepham', expiry:inDays(150), stock:200, dailyBurn:2, safetyBuffer:15, price:55, unit:'tube', serialCount:30 });
addB({ id:'bat_per', name:'Permethrin', generic:'Permethrin', form:'Cream', strength:'5%',
  mfgId:'org_sunrise', holderId:'org_nashik', expiry:inDays(110), stock:150, dailyBurn:1, safetyBuffer:10, price:48, unit:'tube', serialCount:20 });

// --- Ophthalmology ---
addB({ id:'bat_tim', name:'Timolol', generic:'Timolol Maleate', form:'Eye Drops', strength:'0.5%',
  mfgId:'org_sunrise', holderId:'org_citycare', expiry:inDays(45), stock:120, dailyBurn:1, safetyBuffer:10, price:65, unit:'bottle', serialCount:20 });
addB({ id:'bat_mox', name:'Moxifloxacin Eye', generic:'Moxifloxacin HCl', form:'Eye Drops', strength:'0.5%',
  mfgId:'org_sunrise', holderId:'org_thane', expiry:inDays(60), stock:80, dailyBurn:1, safetyBuffer:8, price:95, unit:'bottle', serialCount:15 });

  // ----- serials -----
  const serials = {};
  Object.values(batches).forEach((b) => {
    for (let i = 1; i <= b.serialCount; i++) {
      const code = `PS-${b.id.replace('bat_', '').toUpperCase()}-${String(i).padStart(3, '0')}`;
      serials[code] = { batchId: b.id, scans: [{ orgId: b.holderId, city: orgs[b.holderId].city, at: daysAgo(8), by: orgs[b.holderId].name }] };
    }
  });

  // planted counterfeit story: one serial scanned in two cities 18 minutes apart
  const dup = 'PS-AMOX-DUP-001';
  serials[dup] = {
    batchId: 'bat_amo_dup',
    scans: [
      { orgId: 'org_meddist', city: 'Mumbai', at: daysAgo(1), by: 'MedSupply Distributors' },
      { orgId: 'org_punecliw', city: 'Pune', at: new Date(Date.now() - 18 * 60 * 1000).toISOString(), by: 'GreenLeaf Rural Clinic' },
    ],
  };
  const fabricated = 'PS-AMOX-FAB-221';
  serials[fabricated] = {
    batchId: 'bat_amo_dup',
    scans: [
      { orgId: 'org_meddist', city: 'Mumbai', at: daysAgo(2), by: 'MedSupply Distributors' },
      { orgId: 'org_meddist', city: 'Mumbai', at: daysAgo(1), by: 'MedSupply Distributors' },
      { orgId: 'org_vaccine', city: 'Navi Mumbai', at: daysAgo(0.9), by: 'JanSeva Vaccination Camp' },
    ],
  };

  // ----- judge-demo serials: 10 genuine QR codes -----
  const demoSerials = [
    ['PS-DEMO-0001', 'bat_met',  'Metformin 500 mg'],
    ['PS-DEMO-0002', 'bat_amox', 'Amoxicillin 500 mg'],
    ['PS-DEMO-0003', 'bat_sal',  'Salbutamol Inhaler 100 mcg'],
    ['PS-DEMO-0004', 'bat_cef',  'Cefixime 200 mg'],
    ['PS-DEMO-0005', 'bat_ond',  'Ondansetron 4 mg'],
    ['PS-DEMO-0006', 'bat_cet',  'Cetirizine 10 mg'],
    ['PS-DEMO-0007', 'bat_par',  'Paracetamol 500 mg'],
    ['PS-DEMO-0008', 'bat_dex',  'Dextrose 5% 500 mL'],
    ['PS-DEMO-0009', 'bat_ns',   'Normal Saline 500 mL'],
    ['PS-DEMO-0010', 'bat_azm',  'Azithromycin 250 mg'],
  ];
  demoSerials.forEach(([code, bid]) => {
    const b = batches[bid];
    serials[code] = { batchId: bid, scans: [{ orgId: b.holderId, city: orgs[b.holderId].city, at: daysAgo(8), by: orgs[b.holderId].name }] };
  });

  // counterfeit QR for the live demo: one box scanned miles apart minutes ago
  serials['PS-DEMO-FAKE'] = {
    batchId: 'bat_amox',
    scans: [
      { orgId: 'org_meddist', city: 'Mumbai', at: new Date(Date.now() - 26 * 60 * 1000).toISOString(), by: 'MedSupply Distributors' },
      { orgId: 'org_punecliw', city: 'Pune', at: new Date(Date.now() - 12 * 60 * 1000).toISOString(), by: 'GreenLeaf Rural Clinic' },
    ],
  };

  // ----- recipient requests -----
  const requests = [
    { id: 'req_1', orgId: 'org_nashik',  medicine: 'Amoxicillin', qty: 200, urgency: 'high',   created: daysAgo(2) },
    { id: 'req_2', orgId: 'org_punepham',medicine: 'Metformin',   qty: 300, urgency: 'high',   created: daysAgo(1) },
    { id: 'req_3', orgId: 'org_thane',   medicine: 'Insulin Glargine', qty: 60, urgency: 'high', created: daysAgo(3) },
    { id: 'req_4', orgId: 'org_navicare',medicine: 'Cetirizine',  qty: 100, urgency: 'medium', created: daysAgo(4) },
    { id: 'req_5', orgId: 'org_punecliw',medicine: 'Ondansetron', qty: 150, urgency: 'high',   created: daysAgo(1) },
    { id: 'req_6', orgId: 'org_thane',   medicine: 'Normal Saline', qty: 400, urgency: 'medium', created: daysAgo(2) },
  ];

  // ----- transfers with custody logs -----
  const transfers = [
    {
      id: 'tr_1', batchId: 'bat_amox', medicine: 'Amoxicillin', name: 'Amoxicillin 500 mg', qty: 120,
      fromOrgId: 'org_citycare', toOrgId: 'org_punecliw', status: 'in-transit', distanceKm: 119, proposedBy: 'CityCare Admin',
      custody: [
        { at: daysAgo(3), actor: 'CityCare Admin', action: 'Transfer proposed', note: 'Surplus flagged by expiry intelligence' },
        { at: daysAgo(3), actor: 'GreenLeaf Manager', action: 'Accepted', note: 'Verified need documented' },
        { at: daysAgo(2), actor: 'CityCare Admin', action: 'Packed & handed to courier', note: 'Batch BAT-AMOX-7741 · 120 × 500 mg' },
      ],
    },
    {
      id: 'tr_2', batchId: 'bat_cef', medicine: 'Cefixime', name: 'Cefixime 200 mg', qty: 250,
      fromOrgId: 'org_citycare', toOrgId: 'org_navicare', status: 'delivered', distanceKm: 18, proposedBy: 'CityCare Admin',
      custody: [
        { at: daysAgo(6), actor: 'CityCare Admin', action: 'Transfer proposed', note: '' },
        { at: daysAgo(6), actor: 'NaviCare Manager', action: 'Accepted', note: '' },
        { at: daysAgo(5), actor: 'CityCare Admin', action: 'Packed & handed to courier', note: '' },
        { at: daysAgo(4), actor: 'NaviCare Manager', action: 'Delivered & verified', note: 'Unused quantity freed 6 hospital beds worth of stock' },
      ],
    },
  ];

  // ----- audit trail -----
  const audits = [
    { id: 'a_1', at: NOW(), actor: 'Pramod Mohanty', role: 'Hospital Admin', action: 'scan', code: 'PS-AMOX-DUP-001', org: orgs.org_punecliw.name, city: 'Pune', result: 'High-Risk' },
    { id: 'a_2', at: daysAgo(0.2), actor: 'Simran', role: 'Clinic Manager', action: 'scan', code: 'PS-VIT-012', org: orgs.org_punecliw.name, city: 'Pune', result: 'Verified' },
    { id: 'a_3', at: daysAgo(1), actor: 'Utsav', role: 'NGO Coordinator', action: 'request', code: 'Normal Saline', org: orgs.org_thane.name, city: 'Thane', result: 'Registered' },
    { id: 'a_4', at: daysAgo(2), actor: 'Riddhima Singh', role: 'Quality Lead', action: 'qr_issue', code: 'BAT-IVF-0001', org: orgs.org_sunrise.name, city: 'Mumbai', result: 'Registered' },
    { id: 'a_5', at: daysAgo(3), actor: 'Pramod Mohanty', role: 'Hospital Admin', action: 'match', code: 'Amoxicillin', org: orgs.org_citycare.name, city: 'Mumbai', result: '3 matches ranked' },
    { id: 'a_6', at: daysAgo(3), actor: 'Pramod Mohanty', role: 'Hospital Admin', action: 'transfer_propose', code: 'BAT-AMOX-7741', org: orgs.org_citycare.name, city: 'Mumbai', result: 'To GreenLeaf Rural Clinic' },
    { id: 'a_7', at: daysAgo(4), actor: 'Simran', role: 'Clinic Manager', action: 'scan', code: 'PS-CEF-004', org: orgs.org_navicare.name, city: 'Navi Mumbai', result: 'Verified' },
  ];

  return { schemaVersion: 3, orgs, batches, serials, requests, transfers, audits };
}