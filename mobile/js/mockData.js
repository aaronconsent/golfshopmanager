// Mobile mock data — consistent with desktop demo
window.MOCK = (function(){

  const techs = [
    { id:'t1', name:'Marcus Reed', initials:'MR', color:'#0ea5e9', active:3, role:'Sr. Technician' },
    { id:'t2', name:'Lena Ortiz', initials:'LO', color:'#f97316', active:2, role:'Technician' },
    { id:'t3', name:'Jamie Park', initials:'JP', color:'#8b5cf6', active:1, role:'Apprentice' },
    { id:'t4', name:'Cody Banks', initials:'CB', color:'#ef4444', active:2, role:'Technician' },
  ];

  // currently logged-in tech (default) — switched by role switcher
  let me = { kind:'Technician', tech:'t1' };

  const customers = [
    { id:'c1', name:'Dale Hutchins', phone:'(936) 555-0142', cart:'2022 Club Car Onward' },
    { id:'c2', name:'Marisol Vega', phone:'(936) 555-0178', cart:'2021 E-Z-GO RXV Elite' },
    { id:'c3', name:'Travis Boone', phone:'(936) 555-0119', cart:'2019 Yamaha Drive2 PTV' },
    { id:'c4', name:'Beth Anders', phone:'(936) 555-0181', cart:'2023 Club Car Tempo' },
    { id:'c5', name:'Holly Brennan', phone:'(936) 555-0156', cart:'2020 E-Z-GO Express S4' },
    { id:'c6', name:'Tessa Knight', phone:'(936) 555-0114', cart:'rental customer' },
    { id:'c7', name:'Anthony Briggs', phone:'(936) 555-0149', cart:'rental customer' },
    { id:'c8', name:'Wyatt Cole', phone:'(936) 555-0123', cart:'2021 Club Car Onward' },
  ];

  const stages = ['Checked In','Diagnosing','Awaiting Approval','Awaiting Parts','In Progress','Ready','Delivered'];

  const workOrders = [
    { id:'WO-1042', customer:'c1', cart:'2022 Club Car Onward', complaint:"Won't hold a charge — dies after 6 holes", stage:'Diagnosing', tech:'t1', timeIn:'1h 20m',
      diagnosis:'Suspected failing 72V lithium pack.', warranty:true, oem:'Club Car', vin:'CC-ONW-2022-44918',
      labor:[{desc:'Diagnostic + load test', hours:1.3, rate:115}],
      partsLines:[],
      photos:3 },
    { id:'WO-1039', customer:'c2', cart:'2021 E-Z-GO RXV Elite', complaint:'Throttle hesitates from stop', stage:'Awaiting Parts', tech:'t1', timeIn:'4h 10m',
      diagnosis:'MCOR throttle sensor — replacement coming.', warranty:false,
      labor:[{desc:'Diagnostic',hours:0.8,rate:115}],
      partsLines:[{sku:'SOL-EZ-MCOR', qty:1, name:'E-Z-GO MCOR Throttle Sensor', price:275}],
      photos:2 },
    { id:'WO-1037', customer:'c3', cart:'2019 Yamaha Drive2 PTV', complaint:'Drive belt squealing at speed', stage:'In Progress', tech:'t1', timeIn:'2h 45m',
      diagnosis:'Drive belt cracked — replacing.', warranty:false,
      labor:[{desc:'Belt replacement',hours:1.0,rate:115}],
      partsLines:[{sku:'BLT-DRV-YAM', qty:1, name:'Yamaha Drive Belt', price:55}],
      photos:2 },
    { id:'WO-1035', customer:'c4', cart:'2023 Club Car Tempo', complaint:'Brake pedal feels soft', stage:'Ready', tech:'t1', timeIn:'30m',
      diagnosis:'Brake cable replaced.', warranty:true,
      labor:[{desc:'Brake service',hours:1.2,rate:115}],
      partsLines:[{sku:'BR-CBL-CC', qty:1, name:'Club Car Brake Cable', price:38}],
      photos:1 },
    { id:'WO-1031', customer:'c5', cart:'2020 E-Z-GO Express S4', complaint:'Headlights flicker', stage:'Checked In', tech:null, timeIn:'15m',
      diagnosis:'', warranty:false, labor:[], partsLines:[], photos:0 },
    { id:'WO-1027', customer:'c8', cart:'2021 Club Car Onward', complaint:'LED light bar install', stage:'Awaiting Approval', tech:'t2', timeIn:'3h 20m',
      diagnosis:'Quoted parts + wiring.', warranty:false,
      labor:[{desc:'Install + wiring',hours:2.0,rate:115}],
      partsLines:[{sku:'LED-HDLT-RGB', qty:1, name:'RGB LED Headlight Kit', price:189}],
      photos:1 },
  ];

  const rentalsToday = {
    checkOuts: [
      { id:'RES-204', customer:'Marisol Vega', unit:'R-10', time:'3:00 PM', cart:'Club Car Onward 2', deposit:150 },
      { id:'RES-205', customer:'Kendall Foy', unit:'R-02', time:'tomorrow 9:00 AM', cart:'E-Z-GO Express S4', deposit:400 },
    ],
    checkIns: [
      { id:'RES-201', customer:'Tessa Knight', unit:'R-01', time:'5:00 PM (due)', cart:'Club Car Onward 4' },
      { id:'RES-203', customer:'Holly Brennan', unit:'R-08', time:'7:00 PM (due)', cart:'Club Car Villager 4' },
    ]
  };

  const parts = [
    { sku:'BAT-48V-T875', name:'Trojan T-875 Battery', price:289, stock:6, low:true },
    { sku:'BAT-LI-72', name:'72V Lithium Pack 105Ah', price:3895, stock:2, low:true },
    { sku:'CHG-DEL-Q', name:'Delta-Q IC650 Charger', price:585, stock:4 },
    { sku:'SOL-EZ-MCOR', name:'E-Z-GO MCOR Sensor', price:275, stock:5 },
    { sku:'TIRE-205-50', name:'205/50-10 A/T Tire', price:79, stock:18 },
    { sku:'BLT-DRV-YAM', name:'Yamaha Drive Belt', price:55, stock:11 },
    { sku:'BR-CBL-CC', name:'Club Car Brake Cable', price:38, stock:10 },
    { sku:'LED-HDLT-RGB', name:'RGB LED Headlight Kit', price:189, stock:7 },
    { sku:'OIL-10W30', name:'10W-30 Engine Oil (Qt)', price:9, stock:36 },
    { sku:'SPK-NGK-BPR', name:'NGK BPR4ES Spark Plug', price:6, stock:42 },
    { sku:'STR-BLT-PRO', name:'Bluetooth Sound Bar Pro', price:449, stock:4 },
    { sku:'LIFT-6-CC', name:'6" Lift Kit (Club Car)', price:565, stock:3, low:true },
  ];

  const notifications = [
    { time:'11:42a', from:'System', body:'WO-1035 marked Ready — text sent to Beth Anders.' },
    { time:'11:05a', from:'Marcus', body:'Estimate sent to Dale Hutchins ($1,245) — awaiting approval.' },
    { time:'10:30a', from:'System', body:'Pinecrest fleet service scheduled for Jun 28.' },
    { time:'9:45a', from:'Riley', body:'R-01 checked out to Tessa Knight.' },
    { time:'8:50a', from:'Marisol', body:'Approval received — parts ordered, ETA Wed.' },
  ];

  const aiResponses = {
    'wont-charge': [
      "Likely cause: failing 72V lithium pack.",
      "9 of 11 similar Onward complaints in the last 12 months traced here.",
      "Pull: 72V Lithium Pack 105Ah (RoyPow). In stock: 2.",
      "Labor: 1.8h × $115 = $207. Parts: $3,895. Quote: ~$4,102.",
      "Warranty: in service 2022-04-12 — pack covered under Club Car 5yr. Recommend filing claim first."
    ],
    'pulls-left': [
      "Likely cause: low tire pressure or worn A-arm bushing.",
      "Check: front pressure, alignment toe, bushing play.",
      "Labor: 0.8h. Quote: $35–$145."
    ],
    'no-start': [
      "Likely cause: solenoid or microswitch.",
      "Test: voltage at solenoid, pedal microswitch.",
      "Common fix: solenoid. Quote: $158."
    ],
    'flicker-lights': [
      "Likely cause: poor ground or voltage reducer.",
      "Test: chassis ground, reducer output.",
      "Quote: $95–$185."
    ]
  };

  const customerTexts = {
    estimate: (name, total) => `Hi ${name.split(' ')[0]} — your estimate: $${total}. Reply YES to approve. — Lakeside`,
    approval: (name) => `Hi ${name.split(' ')[0]} — approval request sent. Reply YES to authorize repair. — Lakeside`,
    ready: (name) => `Great news — your cart is ready for pickup! Hours 8a–6p. — Lakeside`,
  };

  return {
    techs, customers, stages, workOrders, rentalsToday, parts, notifications,
    aiResponses, customerTexts,
    me, setMe: (kind) => { me.kind = kind; if (kind==='Technician') me.tech='t1'; }
  };
})();
