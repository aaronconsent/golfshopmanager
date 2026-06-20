// Mock data for Lakeside Golf Carts demo
window.MOCK = (function(){

  const techs = [
    { id:'t1', name:'Marcus Reed', initials:'MR', color:'#0ea5e9', active:3, role:'Sr. Technician' },
    { id:'t2', name:'Lena Ortiz', initials:'LO', color:'#f97316', active:2, role:'Technician' },
    { id:'t3', name:'Jamie Park', initials:'JP', color:'#8b5cf6', active:1, role:'Apprentice' },
    { id:'t4', name:'Cody Banks', initials:'CB', color:'#ef4444', active:2, role:'Technician' },
  ];

  const customers = [
    { id:'c1', name:'Dale Hutchins', phone:'(936) 555-0142', email:'dale.h@example.com', cart:'2022 Club Car Onward (Lifted, Lithium)' },
    { id:'c2', name:'Marisol Vega', phone:'(936) 555-0178', email:'mvega@example.com', cart:'2021 E-Z-GO RXV Elite' },
    { id:'c3', name:'Travis Boone', phone:'(936) 555-0119', email:'tboone@example.com', cart:'2019 Yamaha Drive2 PTV' },
    { id:'c4', name:'Beth Anders', phone:'(936) 555-0181', email:'beth.a@example.com', cart:'2023 Club Car Tempo' },
    { id:'c5', name:'Holly Brennan', phone:'(936) 555-0156', email:'hbrennan@example.com', cart:'2020 E-Z-GO Express S4' },
    { id:'c6', name:'Ramiro Salas', phone:'(936) 555-0190', email:'rsalas@example.com', cart:'2018 Club Car Precedent' },
    { id:'c7', name:'Kendall Foy', phone:'(936) 555-0133', email:'kfoy@example.com', cart:'2022 Yamaha Adventurer' },
    { id:'c8', name:'Owen McCabe', phone:'(936) 555-0166', email:'omccabe@example.com', cart:'2017 Club Car DS' },
    { id:'c9', name:'Priya Shah', phone:'(936) 555-0107', email:'pshah@example.com', cart:'2024 E-Z-GO Liberty' },
    { id:'c10', name:'Wyatt Cole', phone:'(936) 555-0123', email:'wcole@example.com', cart:'2021 Club Car Onward' },
    { id:'c11', name:'Tessa Knight', phone:'(936) 555-0114', email:'tknight@example.com', cart:'2020 Yamaha Drive2' },
    { id:'c12', name:'Anthony Briggs', phone:'(936) 555-0149', email:'abriggs@example.com', cart:'2023 Club Car Villager 4' },
  ];

  // Rental fleet
  const fleet = [
    { unit:'R-01', make:'Club Car', model:'Onward 4', power:'Electric', rate:120, status:'rented' },
    { unit:'R-02', make:'E-Z-GO', model:'Express S4', power:'Electric', rate:115, status:'available' },
    { unit:'R-03', make:'Yamaha', model:'Drive2', power:'Gas', rate:110, status:'available' },
    { unit:'R-04', make:'Club Car', model:'Onward 6', power:'Electric', rate:160, status:'rented' },
    { unit:'R-05', make:'E-Z-GO', model:'Liberty', power:'Electric', rate:145, status:'maintenance' },
    { unit:'R-06', make:'Club Car', model:'Tempo', power:'Electric', rate:130, status:'available' },
    { unit:'R-07', make:'Yamaha', model:'Adventurer', power:'Gas', rate:140, status:'available' },
    { unit:'R-08', make:'Club Car', model:'Villager 4', power:'Electric', rate:135, status:'rented' },
    { unit:'R-09', make:'E-Z-GO', model:'RXV', power:'Electric', rate:115, status:'available' },
    { unit:'R-10', make:'Club Car', model:'Onward 2', power:'Electric', rate:105, status:'rented' },
  ];

  // Utilization: 60 days, each cart has a percentage; derive revenue
  const utilization = fleet.map((c,i) => {
    const seed = [82,71,55,88,40,67,74,79,46,63][i];
    const days = 60;
    const rentedDays = Math.round(days * seed/100);
    const revenue = rentedDays * c.rate;
    // strip: 60-char bar of 'r' or '.'
    const strip = [];
    let r = rentedDays;
    for (let d=0; d<days; d++) {
      const odds = r / (days - d);
      const isR = Math.random() < odds;
      strip.push(isR ? 1 : 0);
      if (isR) r--;
    }
    return { unit:c.unit, util:seed, rentedDays, revenue, strip };
  });

  const parts = [
    { sku:'BAT-48V-T875', name:'Trojan T-875 8V Battery', price:289, cost:185, stock:6, reorder:8, vendor:'Trojan' },
    { sku:'BAT-LI-72', name:'72V Lithium Pack 105Ah', price:3895, cost:2750, stock:2, reorder:2, vendor:'RoyPow' },
    { sku:'CHG-DEL-Q', name:'Delta-Q IC650 Charger', price:585, cost:410, stock:4, reorder:3, vendor:'Delta-Q' },
    { sku:'CTRL-CC-OBC', name:'Club Car OBC Module', price:215, cost:140, stock:3, reorder:4, vendor:'Club Car' },
    { sku:'SOL-EZ-MCOR', name:'E-Z-GO MCOR Throttle Sensor', price:275, cost:190, stock:5, reorder:3, vendor:'E-Z-GO' },
    { sku:'TIRE-205-50', name:'205/50-10 All-Terrain Tire', price:79, cost:48, stock:18, reorder:8, vendor:'Excel' },
    { sku:'WHL-12-MCH', name:'12" Machined Aluminum Wheel', price:135, cost:88, stock:12, reorder:6, vendor:'RHOX' },
    { sku:'LIFT-6-CC', name:'6" A-Arm Lift Kit (Club Car)', price:565, cost:380, stock:3, reorder:2, vendor:'Madjax' },
    { sku:'LED-HDLT-RGB', name:'RGB LED Headlight Kit', price:189, cost:115, stock:7, reorder:4, vendor:'RHOX' },
    { sku:'STR-BLT-PRO', name:'Bluetooth Sound Bar Pro', price:449, cost:295, stock:4, reorder:3, vendor:'MTX' },
    { sku:'SEAT-RR-FLP', name:'Rear Flip Seat Kit', price:489, cost:320, stock:5, reorder:3, vendor:'Madjax' },
    { sku:'WND-FOLD', name:'Folding Tinted Windshield', price:165, cost:95, stock:9, reorder:5, vendor:'DoubleTake' },
    { sku:'BR-SHO-EZ', name:'E-Z-GO Brake Shoe Set', price:42, cost:24, stock:14, reorder:6, vendor:'E-Z-GO' },
    { sku:'BR-CBL-CC', name:'Club Car Brake Cable', price:38, cost:20, stock:10, reorder:6, vendor:'Club Car' },
    { sku:'MTR-CC-IQ', name:'Club Car IQ Drive Motor', price:925, cost:680, stock:1, reorder:2, vendor:'Club Car' },
    { sku:'BLT-DRV-YAM', name:'Yamaha Drive Belt', price:55, cost:32, stock:11, reorder:5, vendor:'Yamaha' },
    { sku:'OIL-10W30', name:'10W-30 Engine Oil (Qt)', price:9, cost:4.5, stock:36, reorder:12, vendor:'Mobil' },
    { sku:'SPK-NGK-BPR', name:'NGK BPR4ES Spark Plug', price:6, cost:2.8, stock:42, reorder:10, vendor:'NGK' },
    { sku:'FUSE-30A', name:'30A ATC Fuse (10-pack)', price:8, cost:3, stock:16, reorder:6, vendor:'Bussmann' },
    { sku:'WRAP-CRB-BLK', name:'Carbon-Fiber Wrap (8\' roll)', price:175, cost:95, stock:4, reorder:3, vendor:'3M' },
    { sku:'ENC-CC-4P', name:'Club Car 4-Passenger Enclosure', price:329, cost:215, stock:3, reorder:2, vendor:'DoubleTake' },
    { sku:'MIR-SIDE-PR', name:'Folding Side Mirror Pair', price:35, cost:18, stock:14, reorder:6, vendor:'RHOX' },
    { sku:'GAS-FLT-Y', name:'Yamaha Fuel Filter', price:12, cost:5, stock:9, reorder:5, vendor:'Yamaha' },
    { sku:'STR-WHL-SP', name:'Sport Steering Wheel', price:89, cost:48, stock:6, reorder:3, vendor:'Madjax' },
    { sku:'PWR-CBL-2G', name:'2-Gauge Power Cable Set', price:65, cost:32, stock:8, reorder:4, vendor:'Universal' },
  ];

  const stages = ['Checked In','Diagnosing','Awaiting Approval','Awaiting Parts','In Progress','Ready for Pickup','Delivered'];

  const workOrders = [
    { id:'WO-1042', customer:'c1', cart:'2022 Club Car Onward (Lithium)', complaint:"Won't hold a charge — dies after 6 holes", stage:'Diagnosing', tech:'t1', timeIn:'1h 20m',
      diagnosis:'Suspected failing 72V lithium pack — voltage drops under load.', warranty:true, vin:'CC-ONW-2022-44918',
      labor:[{desc:'Diagnostic + load test', hours:1.3, rate:115}],
      partsLines:[],
      photos:['battery-bay','dash-error','volt-meter'] },
    { id:'WO-1039', customer:'c2', cart:'2021 E-Z-GO RXV Elite', complaint:'Throttle hesitates from stop', stage:'Awaiting Parts', tech:'t2', timeIn:'4h 10m',
      diagnosis:'MCOR throttle sensor reading erratic — replacing.', warranty:false,
      labor:[{desc:'Diagnostic', hours:0.8, rate:115},{desc:'Install MCOR', hours:1.5, rate:115}],
      partsLines:[{sku:'SOL-EZ-MCOR', qty:1}],
      photos:['under-seat','wiring'] },
    { id:'WO-1037', customer:'c3', cart:'2019 Yamaha Drive2 PTV', complaint:'Drive belt squealing at speed', stage:'In Progress', tech:'t1', timeIn:'2h 45m',
      diagnosis:'Drive belt cracked — replacing belt + clutch inspection.', warranty:false,
      labor:[{desc:'Belt replacement', hours:1.0, rate:115}],
      partsLines:[{sku:'BLT-DRV-YAM', qty:1}],
      photos:['belt-old','clutch'] },
    { id:'WO-1035', customer:'c4', cart:'2023 Club Car Tempo', complaint:'Brake pedal feels soft', stage:'Ready for Pickup', tech:'t3', timeIn:'30m',
      diagnosis:'Brake cable stretched — replaced + adjusted.', warranty:true,
      labor:[{desc:'Brake service', hours:1.2, rate:115}],
      partsLines:[{sku:'BR-CBL-CC', qty:1}],
      photos:['brake-cable'] },
    { id:'WO-1031', customer:'c5', cart:'2020 E-Z-GO Express S4', complaint:'Headlights flicker', stage:'Checked In', tech:null, timeIn:'15m',
      diagnosis:'', warranty:false, labor:[], partsLines:[], photos:[] },
    { id:'WO-1029', customer:'c6', cart:'2018 Club Car Precedent', complaint:'Annual service + tire rotation', stage:'In Progress', tech:'t4', timeIn:'1h 5m',
      diagnosis:'Routine PM — rotating, charging, lube.', warranty:false,
      labor:[{desc:'PM service', hours:1.5, rate:115}],
      partsLines:[{sku:'OIL-10W30', qty:2},{sku:'SPK-NGK-BPR', qty:1}],
      photos:['tire-tread'] },
    { id:'WO-1027', customer:'c7', cart:'2022 Yamaha Adventurer', complaint:'Customer wants LED light bar installed', stage:'Awaiting Approval', tech:'t2', timeIn:'3h 20m',
      diagnosis:'Quoted: parts + wiring labor.', warranty:false,
      labor:[{desc:'Install + wiring', hours:2.0, rate:115}],
      partsLines:[{sku:'LED-HDLT-RGB', qty:1}],
      photos:['front-mount'] },
    { id:'WO-1025', customer:'c8', cart:'2017 Club Car DS', complaint:"Charger won't initiate", stage:'Diagnosing', tech:'t4', timeIn:'45m',
      diagnosis:'OBC suspect — testing now.', warranty:false, labor:[{desc:'Diag',hours:0.7,rate:115}],
      partsLines:[], photos:['charger','dash'] },
    { id:'WO-1023', customer:'c9', cart:'2024 E-Z-GO Liberty', complaint:'Recall update + software', stage:'Delivered', tech:'t1', timeIn:'—',
      diagnosis:'OEM software pushed, recall closed.', warranty:true, labor:[{desc:'Recall service',hours:0.6,rate:0}],
      partsLines:[], photos:[] },
    { id:'WO-1021', customer:'c10', cart:'2021 Club Car Onward', complaint:'Rattling underneath', stage:'Awaiting Parts', tech:'t3', timeIn:'1d 2h',
      diagnosis:'Loose A-arm bushings — ordered.', warranty:false, labor:[{desc:'Diag + inspect',hours:0.9,rate:115}],
      partsLines:[{sku:'LIFT-6-CC', qty:0}], photos:['underside'] },
  ];

  const reservations = [
    { id:'RES-201', customer:'c11', unit:'R-01', start:'today 9am', end:'today 5pm', deposit:200, status:'picked-up' },
    { id:'RES-202', customer:'c12', unit:'R-04', start:'today 10am', end:'tomorrow 4pm', deposit:350, status:'picked-up' },
    { id:'RES-203', customer:'c5', unit:'R-08', start:'today 1pm', end:'today 7pm', deposit:200, status:'picked-up' },
    { id:'RES-204', customer:'c2', unit:'R-10', start:'today 3pm', end:'today 8pm', deposit:150, status:'reserved' },
    { id:'RES-205', customer:'c7', unit:'R-02', start:'tomorrow 9am', end:'Sat 6pm', deposit:400, status:'reserved' },
    { id:'RES-206', customer:'c9', unit:'R-06', start:'Sat 11am', end:'Sun 5pm', deposit:300, status:'reserved' },
  ];

  const payments = [
    { id:'P-9981', date:'Today 11:42 AM', customer:'Beth Anders', type:'Repair', amount:284.20, method:'Visa ••4421', status:'Paid' },
    { id:'P-9980', date:'Today 10:15 AM', customer:'Tessa Knight', type:'Rental Deposit', amount:200.00, method:'Hold', status:'Authorized' },
    { id:'P-9979', date:'Today 9:30 AM', customer:'Anthony Briggs', type:'Rental Deposit', amount:350.00, method:'Hold', status:'Authorized' },
    { id:'P-9978', date:'Yesterday 4:55 PM', customer:'Pinecrest Resort', type:'Fleet Invoice', amount:4250.00, method:'ACH', status:'Paid' },
    { id:'P-9977', date:'Yesterday 2:10 PM', customer:'Marisol Vega', type:'Parts', amount:62.18, method:'Mastercard ••0921', status:'Paid' },
    { id:'P-9976', date:'Yesterday 11:20 AM', customer:'Wyatt Cole', type:'Sale (New Cart)', amount:11890.00, method:'Financed', status:'Paid' },
    { id:'P-9975', date:'2 days ago', customer:'Holly Brennan', type:'Rental', amount:215.00, method:'Visa ••8810', status:'Paid' },
    { id:'P-9974', date:'2 days ago', customer:'Travis Boone', type:'Repair', amount:438.45, method:'Cash', status:'Paid' },
  ];

  const fleetAccounts = [
    { name:'Pinecrest Resort', units:18, monthly:4250, nextService:'Jun 28', contact:'Karen Mills' },
    { name:'Lake Ridge HOA', units:6, monthly:1180, nextService:'Jul 02', contact:'Bob Wilkes' },
    { name:'Cypress Trace Golf Course', units:42, monthly:8900, nextService:'Jun 24', contact:'Drew Faulk' },
    { name:'Sam Houston Campground', units:9, monthly:1490, nextService:'Jul 11', contact:'Lisa Padron' },
  ];

  const builds = [
    { id:'B-014', customer:'Wyatt Cole', base:'2024 Club Car Onward 4', mods:['6" Lift','Lithium 72V','RGB LEDs','Bluetooth Soundbar','Custom Wrap (Carbon)'], quote:14820, status:'Build in progress' },
    { id:'B-013', customer:'Priya Shah', base:'2023 E-Z-GO Liberty', mods:['Rear flip seat','12" wheels','Folding windshield'], quote:9450, status:'Quoted' },
    { id:'B-012', customer:'Kendall Foy', base:'2022 Yamaha Adventurer', mods:['Audio + amp','LED light bar','Tinted enclosure'], quote:11200, status:'Approved' },
    { id:'B-011', customer:'Anthony Briggs', base:'2023 Club Car Villager 4', mods:['Lift kit','Off-road tires','Roof rack'], quote:10650, status:'Delivered' },
    { id:'B-010', customer:'Beth Anders', base:'2023 Club Car Tempo', mods:['Lithium conversion','Sound system'], quote:7920, status:'Build in progress' },
    { id:'B-009', customer:'Travis Boone', base:'2019 Yamaha Drive2', mods:['Full restoration','New paint','New seats'], quote:6450, status:'Delivered' },
  ];

  const warrantyEligible = [
    { customer:'Dale Hutchins', cart:'2022 Club Car Onward', oem:'Club Car', inService:'2022-04-12', vin:'CC-ONW-2022-44918', coverage:'Lithium pack 5yr · Drivetrain 2yr' },
    { customer:'Beth Anders', cart:'2023 Club Car Tempo', oem:'Club Car', inService:'2023-06-30', vin:'CC-TMP-2023-11820', coverage:'Bumper-to-bumper 2yr' },
    { customer:'Priya Shah', cart:'2024 E-Z-GO Liberty', oem:'E-Z-GO', inService:'2024-02-08', vin:'EZ-LIB-2024-09115', coverage:'Bumper-to-bumper 4yr / ELiTE 8yr battery' },
  ];

  const notifications = [
    { time:'11:42 AM', type:'SMS', to:'Beth Anders', subject:'Pickup', body:'Hi Beth — your Tempo is ready for pickup! Invoice $284.20 paid. — Lakeside' },
    { time:'11:05 AM', type:'SMS', to:'Dale Hutchins', subject:'Estimate', body:"Hi Dale — diagnosis done on your Onward. Estimate $1,245 (lithium pack + labor). Reply YES to approve. — Lakeside" },
    { time:'10:30 AM', type:'Email', to:'Karen Mills (Pinecrest)', subject:'Monthly fleet service scheduled', body:'Your June fleet service is set for Jun 28, 8am–noon…' },
    { time:'9:45 AM', type:'SMS', to:'Tessa Knight', subject:'Rental ready', body:'Your R-01 Onward is checked out. Have fun! Return by 5pm — Lakeside' },
    { time:'8:50 AM', type:'SMS', to:'Marisol Vega', subject:'Approval received', body:'Thanks Marisol — we received your approval. Parts ordered, ETA Wed. — Lakeside' },
    { time:'Yesterday', type:'Email', to:'Holly Brennan', subject:'Review request', body:'Thanks for renting with us — would you share a quick review?' },
  ];

  const campaigns = [
    { name:'Summer Lake Specials', channel:'Email + SMS', audience:'All rental past customers (412)', sent:'Jun 12', open:'34%', conv:'6 bookings' },
    { name:'Lithium Conversion Push', channel:'Email', audience:'Owners w/ lead-acid (88)', sent:'Jun 06', open:'41%', conv:'3 builds quoted' },
    { name:'July 4th Fleet Promo', channel:'SMS', audience:'Resort & HOA accounts (4)', sent:'Scheduled Jun 25', open:'—', conv:'—' },
    { name:'Birthday Service Discount', channel:'Automation', audience:'Ongoing', sent:'—', open:'—', conv:'4 bookings MTD' },
  ];

  const reviews = [
    { source:'Google', stars:5, author:'Sarah K.', text:'Took the family out for the day on a 6-seater — perfect from booking to drop-off.', date:'2 days ago' },
    { source:'Google', stars:5, author:'Mike T.', text:'They installed a lithium pack on my Club Car. Quote was honest, work was clean.', date:'1 wk ago' },
    { source:'Facebook', stars:4, author:'Jenny L.', text:'Great rental experience, only ding is parking was a little tight.', date:'1 wk ago' },
    { source:'Google', stars:5, author:'Drew F.', text:'Manages our HOA fleet — we never have to chase them. Stuff just gets done.', date:'2 wk ago' },
    { source:'Google', stars:5, author:'Carlos R.', text:'Custom build was exactly what I wanted. The wrap is unreal.', date:'3 wk ago' },
  ];

  const staffShifts = [
    { name:'Jess Tully (Owner)', role:'Owner', shifts:['M 8-5','T 8-5','W 8-5','Th 8-5','F 8-5','Sa 9-1','Su —'] },
    { name:'Riley Kim', role:'Front Desk', shifts:['M 8-5','T off','W 8-5','Th 8-5','F 8-5','Sa 9-3','Su 11-3'] },
    { name:'Casey Doyle', role:'Front Desk', shifts:['M off','T 8-5','W off','Th off','F 8-5','Sa 9-5','Su 11-5'] },
    { name:'Marcus Reed', role:'Sr. Tech', shifts:['M 8-6','T 8-6','W 8-6','Th 8-6','F 8-2','Sa off','Su off'] },
    { name:'Lena Ortiz', role:'Tech', shifts:['M 8-5','T 8-5','W off','Th 8-5','F 8-5','Sa 9-3','Su off'] },
    { name:'Jamie Park', role:'Apprentice', shifts:['M 9-5','T 9-5','W 9-5','Th off','F 9-5','Sa off','Su off'] },
    { name:'Cody Banks', role:'Tech', shifts:['M off','T 8-5','W 8-5','Th 8-5','F off','Sa 9-5','Su 11-5'] },
  ];

  const purchasing = [
    { po:'PO-2241', vendor:'Trojan', items:'T-875 Battery x 12', total:2220, status:'Open · ETA Jun 24' },
    { po:'PO-2240', vendor:'Delta-Q', items:'IC650 Charger x 2', total:820, status:'Received' },
    { po:'PO-2239', vendor:'RoyPow', items:'72V Lithium Pack x 1', total:2750, status:'Open · ETA Jun 23' },
    { po:'PO-2238', vendor:'Madjax', items:'Lift Kit (CC) x 2, Flip Seats x 2', total:1400, status:'Open · ETA Jun 22' },
    { po:'PO-2237', vendor:'RHOX', items:'12" Wheels x 8, LED Kits x 4', total:1620, status:'Received' },
  ];

  const aiResponses = {
    'wont-charge': [
      "Likely cause: failing 72V lithium pack or charger initiation fault.",
      "Confidence: high. 9 of 11 similar Onward complaints in the last 12 months traced to the lithium pack.",
      "Recommended diagnostic steps: 1) Voltage at rest + under load. 2) Charger handshake (CAN). 3) BMS fault log.",
      "Suggested parts: 72V Lithium Pack 105Ah (RoyPow) — in stock: 2. Delta-Q IC650 Charger — optional swap.",
      "Estimated labor: 1.8 hrs at $115 = $207. Parts: $3,895. Quote total: ~$4,102.",
      "Warranty: cart in service 2022-04-12, under Club Car lithium 5yr — pack is covered. Recommend filing claim before invoicing customer."
    ],
    'pulls-left': [
      "Likely cause: low tire pressure on one front, or worn front-end bushing.",
      "Diagnostic steps: pressure check, alignment toe, A-arm bushing play.",
      "Suggested parts: A-arm bushing kit (if play found). Labor: 0.8 hrs.",
      "Quote estimate: $145 if bushings, $35 if pressure only."
    ],
    'no-start': [
      "Likely cause: solenoid, microswitch, or low battery voltage.",
      "Diagnostic: voltage at solenoid, F/R switch continuity, pedal microswitch.",
      "Most common fix in this model: solenoid replacement.",
      "Parts: Solenoid $89. Labor: 0.6 hrs. Quote: $158."
    ],
    'flicker-lights': [
      "Likely cause: poor ground or failing voltage reducer.",
      "Steps: chassis ground check, reducer output under load.",
      "Parts: voltage reducer if needed, ground strap kit.",
      "Labor: 0.7 hrs. Quote: $95–$185."
    ]
  };

  const buildQuoter = [
    "Quoting a 2024 Club Car Onward 4-passenger, lifted, with audio…",
    "Base unit: $11,890",
    "+ 6\" A-Arm Lift Kit: $565 + 1.5 hrs install = $737",
    "+ 12\" Machined Wheels (set of 4): $540",
    "+ 23\" All-Terrain Tires (set of 4): $316",
    "+ Bluetooth Sound Bar Pro + wiring: $449 + 1.0 hr = $564",
    "+ RGB LED Headlight Kit: $189",
    "+ Carbon-fiber wrap (partial): $349 + 2 hrs = $579",
    "Subtotal: $14,815 · Tax: $1,221 · Estimated total: $16,036",
    "Margin: 28%. Build time: 6.5 hrs (Marcus available Thu)."
  ];

  const dashboard = {
    kpis: [
      { label:'Revenue MTD', value:'$48,920', delta:'+12%', icon:'dollar-sign', tone:'green' },
      { label:'Carts Rented Today', value:'5 / 10', delta:'50% util', icon:'car', tone:'blue' },
      { label:'Open Work Orders', value:'9', delta:'2 waiting parts', icon:'wrench', tone:'amber' },
      { label:'Low Stock Alerts', value:'4', delta:'reorder needed', icon:'alert-triangle', tone:'red' },
    ],
    revenueSeries: [
      {m:'Jul', v:32100},{m:'Aug',v:38400},{m:'Sep',v:35600},{m:'Oct',v:41200},
      {m:'Nov',v:36800},{m:'Dec',v:29400},{m:'Jan',v:31900},{m:'Feb',v:34800},
      {m:'Mar',v:42100},{m:'Apr',v:46500},{m:'May',v:51200},{m:'Jun',v:48920}
    ],
    revenueMix: [
      { label:'Repair & Service', v:17200 },
      { label:'Rentals', v:14400 },
      { label:'Sales / Builds', v:11800 },
      { label:'Parts', v:5520 }
    ],
    todaySchedule: [
      { time:'9:00a', what:'Tessa Knight — R-01 pickup', who:'Front Desk' },
      { time:'9:15a', what:'Dale Hutchins — drop-off (Onward, won\'t charge)', who:'Front Desk' },
      { time:'10:00a', what:'Anthony Briggs — R-04 pickup', who:'Front Desk' },
      { time:'11:00a', what:'Pinecrest — fleet site visit prep', who:'Owner' },
      { time:'1:00p', what:'Cypress Trace fleet call', who:'Owner' },
      { time:'2:30p', what:'Wyatt Cole — build sheet review', who:'Front Desk' },
      { time:'4:30p', what:'R-01 return + inspection', who:'Front Desk' },
    ],
    activity: [
      { who:'Marcus', what:'moved WO-1037 to In Progress', when:'4m ago' },
      { who:'Riley', what:'created WO-1031 (Holly Brennan)', when:'12m ago' },
      { who:'System', what:'low stock: Club Car IQ Drive Motor (1 left)', when:'18m ago' },
      { who:'Lena', what:'logged 1.5h labor on WO-1039', when:'25m ago' },
      { who:'Pinecrest', what:'paid invoice INV-3081 ($4,250)', when:'1h ago' },
    ]
  };

  return {
    stages, techs, customers, fleet, utilization, parts, workOrders, reservations,
    payments, fleetAccounts, builds, warrantyEligible, notifications, campaigns,
    reviews, staffShifts, purchasing, aiResponses, buildQuoter, dashboard
  };
})();
