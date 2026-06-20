// Mobile app — tabs, screens, sheets
(function(){
  const M = window.MOCK;

  // ============ helpers ============
  const $ = (s, el=document) => el.querySelector(s);
  const el = (html) => { const d=document.createElement('div'); d.innerHTML=html.trim(); return d.firstElementChild; };
  const techById = id => M.techs.find(t=>t.id===id);
  const custById = id => M.customers.find(c=>c.id===id);
  const woById = id => M.workOrders.find(w=>w.id===id);
  const money = n => '$' + n.toLocaleString('en-US', {minimumFractionDigits: n%1?2:0, maximumFractionDigits:2});

  // ============ icons ============
  const ico = () => { if (window.lucide) lucide.createIcons(); };

  // ============ toast ============
  function toast(msg, kind='') {
    const t = el(`<div class="toast ${kind}"><i data-lucide="${kind==='sms'?'message-circle':kind==='success'?'check-circle':'info'}" class="w-4 h-4 mt-0.5"></i><div>${msg}</div></div>`);
    document.getElementById('toast-wrap').appendChild(t);
    ico();
    setTimeout(()=>t.style.opacity='0', 3500);
    setTimeout(()=>t.remove(), 4000);
  }

  // ============ sheet ============
  function openSheet(html, opts={}) {
    closeSheet();
    const mount = document.getElementById('sheet-mount');
    const wrap = el(`<div>
      <div class="sheet-back" data-close></div>
      <div class="sheet">
        <div class="grabber"></div>
        ${html}
      </div>
    </div>`);
    mount.appendChild(wrap);
    ico();
    wrap.querySelectorAll('[data-close]').forEach(b => b.addEventListener('click', closeSheet));
    if (opts.onMount) opts.onMount(wrap);
    return wrap;
  }
  function closeSheet() {
    document.getElementById('sheet-mount').innerHTML = '';
  }

  // ============ overlay (full-screen takeover for Job, Customer detail, etc) ============
  function openOverlay(html, opts={}) {
    const mount = document.getElementById('sheet-mount');
    const wrap = el(`<div class="overlay">${html}</div>`);
    mount.appendChild(wrap);
    ico();
    wrap.querySelectorAll('[data-back]').forEach(b => b.addEventListener('click', () => wrap.remove()));
    if (opts.onMount) opts.onMount(wrap);
    return wrap;
  }

  // ============ tab bar ============
  const TABS = [
    { id:'home', label:'Home', icon:'home' },
    { id:'jobs', label:'Jobs', icon:'wrench' },
    { id:'scan', label:'Scan', icon:'scan-line', center:true },
    { id:'rentals', label:'Rentals', icon:'car' },
    { id:'more', label:'More', icon:'menu' },
  ];

  function renderTabbar(active) {
    const tb = document.getElementById('tabbar');
    tb.innerHTML = TABS.map(t => {
      if (t.center) return `<button class="tab scan" data-tab="${t.id}">
        <div class="scan-btn"><i data-lucide="${t.icon}"></i></div>
        <span class="lbl">${t.label}</span>
      </button>`;
      return `<button class="tab ${active===t.id?'active':''}" data-tab="${t.id}">
        <i data-lucide="${t.icon}"></i><span>${t.label}</span>
      </button>`;
    }).join('');
    ico();
    tb.querySelectorAll('[data-tab]').forEach(b => b.addEventListener('click', () => setTab(b.dataset.tab)));
  }

  let currentTab = 'home';
  function setTab(t) {
    currentTab = t;
    closeSheet();
    renderTabbar(t);
    const screen = document.getElementById('screen');
    screen.innerHTML = '';
    const wrap = el('<div class="fade"></div>');
    screen.appendChild(wrap);
    const header = document.getElementById('app-header');
    SCREENS[t](wrap, header);
    ico();
  }
  window.mobileApp = { setTab, toast, openSheet, closeSheet, openOverlay, openJob, runAIAdvisor };

  // ============ header builder ============
  function header(title, sub, right='') {
    return `<div class="header-row">
      <div>
        <div class="title">${title}</div>
        ${sub ? `<div class="sub">${sub}</div>` : ''}
      </div>
      <div class="flex items-center gap-2">${right}</div>
    </div>`;
  }
  function rolePill() {
    const k = M.me.kind;
    return `<span class="role-pill">${k}</span>`;
  }
  function bellBtn() {
    return `<button class="icon-btn" onclick="mobileApp.setTab('more'); setTimeout(()=>document.getElementById('open-notifs')?.click(), 80)"><i data-lucide="bell" class="w-4 h-4 text-slate-600"></i></button>`;
  }

  // =================== SCREENS ===================
  const SCREENS = {};

  // ---------- HOME (role-aware) ----------
  SCREENS.home = function(root, head) {
    head.innerHTML = header('Lakeside', 'Onalaska, TX', `${rolePill()}${bellBtn()}`);
    if (M.me.kind === 'Technician') homeTech(root);
    else homeFrontDesk(root);
  };

  function homeTech(root) {
    const tech = techById(M.me.tech);
    const mine = M.workOrders.filter(w => w.tech === tech.id);
    const onClock = mine.find(w => w.stage === 'In Progress' || w.stage === 'Diagnosing');

    root.innerHTML = `
      <div class="ptr-hint">↓ Pull to refresh</div>

      <div class="mt-2 mb-3">
        <div class="text-xs text-slate-500 font-semibold uppercase tracking-wide mb-2">Currently on the clock</div>
        ${onClock ? `
          <div class="timer-card" data-tour="home-timer">
            <div>
              <div class="label">Live · ${onClock.id}</div>
              <div class="num" id="home-timer-display">01:23:45</div>
              <div class="text-xs opacity-80 mt-0.5">${onClock.cart}</div>
            </div>
            <button class="btn" onclick="mobileApp.openJob('${onClock.id}')">Open →</button>
          </div>
        ` : `<div class="timer-card idle">
            <div><div class="label">No timer running</div><div class="num">00:00:00</div></div>
            <span class="btn opacity-50">Idle</span>
          </div>`}
      </div>

      <div class="text-xs text-slate-500 font-semibold uppercase tracking-wide mt-4 mb-2">Quick actions</div>
      <div class="grid grid-cols-2 gap-2 mb-4">
        <button class="quick" onclick="mobileApp.setTab('scan')"><div class="ic"><i data-lucide="scan-line"></i></div><div class="label">Scan a cart</div></button>
        <button class="quick" onclick="mobileApp.setTab('more'); setTimeout(()=>document.getElementById('open-parts')?.click(), 80)"><div class="ic alt"><i data-lucide="package-search"></i></div><div class="label">Look up a part</div></button>
      </div>

      <div class="text-xs text-slate-500 font-semibold uppercase tracking-wide mt-4 mb-2">My jobs today · ${mine.length}</div>
      <div class="space-y-2" data-tour="home-jobs">
        ${mine.map(woRow).join('')}
      </div>
    `;
    startHomeTimer();
  }

  function homeFrontDesk(root) {
    root.innerHTML = `
      <div class="ptr-hint">↓ Pull to refresh</div>
      <div class="text-xs text-slate-500 font-semibold uppercase tracking-wide mt-2 mb-2">Quick actions</div>
      <div class="grid grid-cols-2 gap-2 mb-4">
        <button class="quick" onclick="mobileApp.setTab('scan')"><div class="ic"><i data-lucide="id-card"></i></div><div class="label">New drop-off (scan license)</div></button>
        <button class="quick" onclick="mobileApp.setTab('rentals')"><div class="ic alt"><i data-lucide="plus-circle"></i></div><div class="label">New reservation</div></button>
      </div>

      <div class="text-xs text-slate-500 font-semibold uppercase tracking-wide mb-2">Check-outs today</div>
      <div class="space-y-2 mb-4">
        ${M.rentalsToday.checkOuts.map(r => `
          <button class="card w-full text-left" onclick="mobileApp.openCheckOut('${r.id}')">
            <div class="card-row">
              <div class="thumb" style="width:48px;height:48px;"><i data-lucide="car" class="w-5 h-5"></i></div>
              <div class="flex-1 min-w-0">
                <div class="text-sm font-semibold truncate">${r.customer}</div>
                <div class="text-xs text-slate-500">${r.unit} · ${r.cart}</div>
              </div>
              <div class="text-right"><div class="text-xs text-slate-500">${r.time}</div><span class="chip chip-blue mt-1">Pickup</span></div>
            </div>
          </button>`).join('')}
      </div>

      <div class="text-xs text-slate-500 font-semibold uppercase tracking-wide mb-2">Check-ins today</div>
      <div class="space-y-2 mb-4">
        ${M.rentalsToday.checkIns.map(r => `
          <button class="card w-full text-left" onclick="mobileApp.openCheckIn('${r.id}')">
            <div class="card-row">
              <div class="thumb" style="width:48px;height:48px;"><i data-lucide="car" class="w-5 h-5"></i></div>
              <div class="flex-1 min-w-0">
                <div class="text-sm font-semibold truncate">${r.customer}</div>
                <div class="text-xs text-slate-500">${r.unit} · ${r.cart}</div>
              </div>
              <div class="text-right"><div class="text-xs text-slate-500">${r.time}</div><span class="chip chip-green mt-1">Return</span></div>
            </div>
          </button>`).join('')}
      </div>

      <div class="text-xs text-slate-500 font-semibold uppercase tracking-wide mb-2">Drop-offs waiting</div>
      <div class="space-y-2">
        ${M.workOrders.filter(w=>w.stage==='Checked In').map(w => woRow(w)).join('') || '<div class="card text-sm text-slate-500">All caught up.</div>'}
      </div>
    `;
  }

  // tiny ticking timer on home card
  let _homeTimerInt;
  function startHomeTimer() {
    clearInterval(_homeTimerInt);
    const startSec = 1*3600 + 23*60 + 45;
    let s = startSec;
    _homeTimerInt = setInterval(() => {
      const node = document.getElementById('home-timer-display');
      if (!node) { clearInterval(_homeTimerInt); return; }
      s++;
      const h = Math.floor(s/3600), m = Math.floor((s%3600)/60), ss = s%60;
      node.textContent = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(ss).padStart(2,'0')}`;
    }, 1000);
  }

  function woRow(w) {
    const c = custById(w.customer);
    const t = techById(w.tech);
    const chipClass = ({'Checked In':'chip-gray','Diagnosing':'chip-blue','Awaiting Approval':'chip-amber','Awaiting Parts':'chip-amber','In Progress':'chip-purple','Ready':'chip-green','Delivered':'chip-gray'})[w.stage] || 'chip-gray';
    return `<button class="card w-full text-left" data-wo="${w.id}" onclick="mobileApp.openJob('${w.id}')">
      <div class="card-row">
        <div class="thumb" style="width:52px;height:52px;"><i data-lucide="car" class="w-5 h-5"></i></div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-1.5">
            <span class="text-xs font-mono text-slate-500">${w.id}</span>
            ${w.warranty ? '<span class="chip chip-purple">Warranty</span>' : ''}
          </div>
          <div class="text-sm font-semibold truncate">${c?c.name:'—'}</div>
          <div class="text-xs text-slate-500 truncate">${w.cart}</div>
        </div>
        <div class="text-right flex flex-col items-end gap-1">
          <span class="chip ${chipClass}">${w.stage}</span>
          <span class="text-[10px] text-slate-400">${w.timeIn}</span>
        </div>
      </div>
    </button>`;
  }

  // ---------- JOBS ----------
  SCREENS.jobs = function(root, head) {
    head.innerHTML = header('Jobs', `${M.workOrders.length} active`, bellBtn());
    root.innerHTML = `
      <div class="flex gap-2 mb-3 overflow-x-auto pb-1">
        ${['All my jobs','Diagnosing','Awaiting Parts','In Progress','Ready'].map((f,i)=>`<button class="chip ${i===0?'chip-green':'chip-gray'} flex-shrink-0" style="font-size:11px;padding:6px 11px">${f}</button>`).join('')}
      </div>
      <div class="space-y-2" data-tour="jobs-list">
        ${M.workOrders.map(woRow).join('')}
      </div>
    `;
  };

  // ---------- JOB DETAIL (overlay) ----------
  function openJob(woId) {
    const w = woById(woId);
    if (!w) return;
    const c = custById(w.customer);
    const t = techById(w.tech);

    const total = (w.partsLines||[]).reduce((s,p)=>s+p.price*p.qty,0) + (w.labor||[]).reduce((s,l)=>s+l.hours*l.rate,0);

    const photosHtml = Array.from({length: w.photos||0}, () => `<div class="photo"><i data-lucide="image" class="w-6 h-6"></i></div>`).join('') + `<button class="photo-add" data-add-photo><i data-lucide="camera-plus" class="w-6 h-6"></i></button>`;

    openOverlay(`
      <div class="overlay-header">
        <button data-back class="icon-btn"><i data-lucide="chevron-left" class="w-5 h-5"></i></button>
        <div class="flex-1">
          <div class="text-[11px] font-mono text-slate-500">${w.id}</div>
          <div class="text-base font-bold">${c?c.name:'—'}</div>
        </div>
        ${w.warranty ? `<button class="chip chip-purple" data-warranty><i data-lucide="shield-check" class="w-3 h-3 mr-0.5"></i>Warranty</button>` : ''}
      </div>

      <div class="overlay-body">
        <div class="card mb-3">
          <div class="card-row">
            <div class="thumb" style="width:64px;height:64px;"><i data-lucide="car" class="w-8 h-8"></i></div>
            <div class="flex-1">
              <div class="text-sm font-semibold">${w.cart}</div>
              <div class="text-xs text-slate-500 mt-0.5">${w.complaint}</div>
            </div>
          </div>
        </div>

        <div class="mb-3" data-tour-job="timer">
          <div class="text-xs text-slate-500 font-semibold uppercase tracking-wide mb-1.5">Labor timer</div>
          <div class="timer-card" id="job-timer-card">
            <div>
              <div class="label" id="job-timer-state">Stopped</div>
              <div class="num" id="job-timer">00:00:00</div>
              <div class="text-xs opacity-80 mt-0.5">${t?t.name:'You'}</div>
            </div>
            <button class="btn" id="job-timer-btn">
              <i data-lucide="play" class="w-4 h-4"></i> Start
            </button>
          </div>
        </div>

        <div class="mb-3">
          <div class="text-xs text-slate-500 font-semibold uppercase tracking-wide mb-1.5">Status</div>
          <div class="bigstepper" data-tour-job="stepper">
            ${M.stages.map((s,i) => {
              const cur = M.stages.indexOf(w.stage);
              const cls = i < cur ? 'done' : i === cur ? 'current' : '';
              return `<button class="bigstep ${cls}" data-stage="${s}">
                <span class="dot">${i<cur?'<i data-lucide=\"check\"></i>':''}</span>
                <span class="flex-1 text-left">${s}</span>
                ${i===cur?'<i data-lucide="chevron-right" class="w-4 h-4 text-brand-700"></i>':''}
              </button>`;
            }).join('')}
          </div>
        </div>

        <div class="mb-3">
          <div class="text-xs text-slate-500 font-semibold uppercase tracking-wide mb-1.5">Photos · damage / progress</div>
          <div class="photo-strip" id="photo-strip">${photosHtml}</div>
        </div>

        <button data-ai class="w-full text-white rounded-2xl p-3.5 text-sm font-semibold flex items-center justify-center gap-2 mb-3"
          style="background:linear-gradient(135deg,#8b5cf6,#ec4899)" data-tour-job="ai">
          <i data-lucide="sparkles" class="w-4 h-4"></i> AI Service Advisor
        </button>
        <div id="ai-mount"></div>

        <div class="mb-3">
          <div class="text-xs text-slate-500 font-semibold uppercase tracking-wide mb-1.5">Parts</div>
          <div class="card">
            ${(w.partsLines||[]).length ? w.partsLines.map(p => `
              <div class="flex justify-between text-sm py-1.5"><span>${p.name} <span class="text-slate-400">× ${p.qty}</span></span><span class="font-medium">${money(p.price*p.qty)}</span></div>
            `).join('') : '<div class="text-xs text-slate-400">No parts yet</div>'}
            <button class="mt-2 w-full text-xs font-semibold text-brand-700 py-2 border-t border-slate-100 flex items-center justify-center gap-1" onclick="mobileApp.openPartsSearch('${w.id}')"><i data-lucide="plus" class="w-3.5 h-3.5"></i> Add part</button>
          </div>
        </div>

        <div class="mb-3">
          <div class="text-xs text-slate-500 font-semibold uppercase tracking-wide mb-1.5">Labor</div>
          <div class="card">
            ${(w.labor||[]).length ? w.labor.map(l=>`<div class="flex justify-between text-sm py-1.5"><span>${l.desc} <span class="text-slate-400">· ${l.hours}h</span></span><span class="font-medium">${money(l.hours*l.rate)}</span></div>`).join('') : '<div class="text-xs text-slate-400">No labor logged</div>'}
          </div>
        </div>

        <div class="card mb-3 flex justify-between items-center">
          <span class="text-xs text-slate-500">Running total</span>
          <span class="text-lg font-bold">${money(total)}</span>
        </div>

        <div class="grid grid-cols-3 gap-2 mb-3" data-tour-job="actions">
          <button class="card text-xs font-semibold flex flex-col items-center gap-1 py-3" data-touchpoint="estimate"><i data-lucide="message-circle" class="w-4 h-4 text-brand-700"></i>Text estimate</button>
          <button class="card text-xs font-semibold flex flex-col items-center gap-1 py-3" data-touchpoint="approval"><i data-lucide="check-circle" class="w-4 h-4 text-blue-700"></i>Get approval</button>
          <button class="card text-xs font-semibold flex flex-col items-center gap-1 py-3" data-touchpoint="ready" id="mark-ready"><i data-lucide="bell-ring" class="w-4 h-4 text-amber-700"></i>Mark ready</button>
        </div>
      </div>
    `, { onMount: (wrap) => {
      wrap.querySelector('[data-ai]').addEventListener('click', () => runAIAdvisor(w));
      wrap.querySelector('[data-add-photo]').addEventListener('click', () => addPhoto(wrap, w));
      wrap.querySelectorAll('[data-stage]').forEach(b => b.addEventListener('click', () => {
        w.stage = b.dataset.stage;
        b.closest('.overlay').remove();
        openJob(w.id);
        toast(`Moved ${w.id} to ${w.stage}`, 'success');
      }));
      wrap.querySelectorAll('[data-touchpoint]').forEach(b => b.addEventListener('click', () => {
        const k = b.dataset.touchpoint;
        const fn = M.customerTexts[k];
        const msg = fn(c?c.name:'Customer', total.toFixed(2));
        toast('📱 ' + msg, 'sms');
      }));
      const warrBtn = wrap.querySelector('[data-warranty]');
      if (warrBtn) warrBtn.addEventListener('click', () => openWarrantySheet(w));

      // Timer
      let timerInt, running = false, sec = 0;
      const display = wrap.querySelector('#job-timer');
      const state = wrap.querySelector('#job-timer-state');
      const btn = wrap.querySelector('#job-timer-btn');
      const card = wrap.querySelector('#job-timer-card');
      const fmt = s => { const h=Math.floor(s/3600), m=Math.floor((s%3600)/60), ss=s%60; return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(ss).padStart(2,'0')}`; };
      btn.addEventListener('click', () => {
        running = !running;
        if (running) {
          card.classList.remove('idle');
          state.textContent = 'Recording';
          btn.innerHTML = '<i data-lucide="square" class="w-4 h-4"></i> Stop';
          ico();
          timerInt = setInterval(()=>{ sec++; display.textContent = fmt(sec); }, 1000);
        } else {
          clearInterval(timerInt);
          state.textContent = 'Stopped';
          btn.innerHTML = '<i data-lucide="play" class="w-4 h-4"></i> Start';
          card.classList.add('idle');
          ico();
          toast(`Logged ${fmt(sec)} of labor to ${w.id}`, 'success');
        }
      });
    }});
  }

  function addPhoto(wrap, w) {
    // mock camera sheet
    const sheet = openSheet(`
      <h2>Add to ${w.id}</h2>
      <div class="px-4 pb-4">
        <div class="viewfinder mb-3">
          <span class="corner" style="top:24px;left:24px;border-width:3px 0 0 3px"></span>
          <span class="corner" style="top:24px;right:24px;border-width:3px 3px 0 0"></span>
          <span class="corner" style="bottom:24px;left:24px;border-width:0 0 3px 3px"></span>
          <span class="corner" style="bottom:24px;right:24px;border-width:0 3px 3px 0"></span>
          <div class="relative z-10 text-xs">Aim at the damage</div>
        </div>
        <button class="scan-action relative" id="capture-btn"><i data-lucide="camera" class="w-6 h-6 text-white relative z-10"></i></button>
      </div>
    `);
    sheet.querySelector('#capture-btn').addEventListener('click', () => {
      w.photos = (w.photos||0) + 1;
      closeSheet();
      const strip = document.getElementById('photo-strip');
      if (strip) {
        const newPhoto = el('<div class="photo"><i data-lucide="image" class="w-6 h-6"></i></div>');
        strip.insertBefore(newPhoto, strip.lastElementChild);
        ico();
      }
      toast('Photo added to ' + w.id, 'success');
    });
  }

  function runAIAdvisor(w) {
    const mount = document.getElementById('ai-mount');
    if (!mount) return;
    let key = 'wont-charge';
    if (/throttle|hesit/i.test(w.complaint)) key = 'pulls-left';
    if (/flicker|light/i.test(w.complaint)) key = 'flicker-lights';
    if (/no.?start/i.test(w.complaint)) key = 'no-start';
    const lines = M.aiResponses[key];
    mount.innerHTML = `<div class="ai-bubble mb-3">
      <div class="flex items-center justify-between mb-2">
        <span class="ai-badge"><i data-lucide="sparkles" class="w-3 h-3"></i> AI Service Advisor</span>
        <span class="text-[10px] text-slate-500">on your shop's history</span>
      </div>
      <div id="ai-stream" class="space-y-1.5"></div>
    </div>`;
    ico();
    const stream = document.getElementById('ai-stream');
    let li = 0;
    const next = () => {
      if (li >= lines.length) return;
      const p = document.createElement('p');
      p.className = 'typewriter text-sm';
      stream.appendChild(p);
      const text = lines[li]; let i = 0;
      const tick = () => {
        if (i <= text.length) { p.textContent = text.slice(0,i); i++; setTimeout(tick, 12); }
        else { p.classList.remove('typewriter'); li++; setTimeout(next, 180); }
      };
      tick();
    };
    next();
    mount.scrollIntoView({behavior:'smooth', block:'center'});
  }

  function openWarrantySheet(w) {
    openSheet(`
      <h2>OEM Warranty · ${w.oem||'Club Car'}</h2>
      <div class="px-4 pb-4 text-sm space-y-3">
        <div class="ai-bubble">
          <div class="flex items-center gap-1.5 mb-2"><span class="ai-badge"><i data-lucide="sparkles" class="w-3 h-3"></i> Warranty Assistant</span></div>
          <p class="mb-1.5"><strong>Covered.</strong> ${w.oem||'Club Car'} lithium 5yr · in service 2022-04-12.</p>
          <p class="mb-1.5">Drafted defect narrative from your diagnosis + load test photos.</p>
          <p>Claim packet assembled: VIN ${w.vin||'—'}, part #, labor, photos. <strong>Ready to submit to OEM portal.</strong></p>
        </div>
        <div class="bg-slate-50 rounded-xl p-3 text-xs space-y-1">
          <div><span class="text-slate-500">VIN:</span> <span class="font-mono">${w.vin||'—'}</span></div>
          <div><span class="text-slate-500">Part:</span> 72V Lithium Pack 105Ah</div>
          <div><span class="text-slate-500">Labor:</span> 1.8 hrs · $207</div>
          <div><span class="text-slate-500">Photos:</span> 3 attached</div>
        </div>
        <button class="w-full bg-brand-600 text-white rounded-xl py-3 font-semibold" onclick="mobileApp.closeSheet(); mobileApp.toast('Claim packet sent to Club Car portal · tracking opened','success')">Open Club Car portal</button>
      </div>
    `);
  }

  // ---------- SCAN ----------
  SCREENS.scan = function(root, head) {
    head.innerHTML = header('Scan', 'Field capture', rolePill());
    root.innerHTML = `
      <div class="viewfinder mb-4" data-tour="scan-viewer">
        <span class="corner" style="top:24px;left:24px;border-width:3px 0 0 3px"></span>
        <span class="corner" style="top:24px;right:24px;border-width:3px 3px 0 0"></span>
        <span class="corner" style="bottom:24px;left:24px;border-width:0 0 3px 3px"></span>
        <span class="corner" style="bottom:24px;right:24px;border-width:0 3px 3px 0"></span>
        <div class="relative z-10 text-xs opacity-70">Center the subject in the box</div>
      </div>

      <div class="text-xs text-slate-500 font-semibold uppercase tracking-wide mb-2">What are you scanning?</div>
      <div class="space-y-2">
        <button class="card w-full text-left flex items-center gap-3" id="scan-license">
          <div class="ic" style="width:44px;height:44px;border-radius:12px;background:#ecfdf5;color:#047857;display:grid;place-items:center"><i data-lucide="id-card" class="w-5 h-5"></i></div>
          <div class="flex-1">
            <div class="text-sm font-semibold">Scan driver's license</div>
            <div class="text-xs text-slate-500">Autofill new customer + start drop-off / rental</div>
          </div>
          <i data-lucide="chevron-right" class="w-4 h-4 text-slate-400"></i>
        </button>
        <button class="card w-full text-left flex items-center gap-3" id="scan-cart">
          <div class="ic" style="width:44px;height:44px;border-radius:12px;background:#eff6ff;color:#1e40af;display:grid;place-items:center"><i data-lucide="qr-code" class="w-5 h-5"></i></div>
          <div class="flex-1">
            <div class="text-sm font-semibold">Scan cart / VIN</div>
            <div class="text-xs text-slate-500">Pull up service history</div>
          </div>
          <i data-lucide="chevron-right" class="w-4 h-4 text-slate-400"></i>
        </button>
        <button class="card w-full text-left flex items-center gap-3" id="scan-photo">
          <div class="ic" style="width:44px;height:44px;border-radius:12px;background:#fef3c7;color:#92400e;display:grid;place-items:center"><i data-lucide="camera" class="w-5 h-5"></i></div>
          <div class="flex-1">
            <div class="text-sm font-semibold">Photo to a job</div>
            <div class="text-xs text-slate-500">Attach to an open work order</div>
          </div>
          <i data-lucide="chevron-right" class="w-4 h-4 text-slate-400"></i>
        </button>
      </div>
    `;
    document.getElementById('scan-license').addEventListener('click', scanLicense);
    document.getElementById('scan-cart').addEventListener('click', scanCart);
    document.getElementById('scan-photo').addEventListener('click', scanPhoto);
  };

  function scanLicense() {
    const sheet = openSheet(`
      <h2>Scanning license…</h2>
      <div class="px-4 pb-4 text-center">
        <div class="viewfinder my-3" style="aspect-ratio:1.6">
          <div class="absolute inset-6 border-2 border-brand-500/60 rounded-lg"></div>
          <div id="scan-status" class="relative z-10 text-xs text-brand-300 font-semibold">Reading…</div>
        </div>
        <div id="scan-result" class="text-left"></div>
      </div>
    `);
    setTimeout(()=> {
      const r = sheet.querySelector('#scan-result');
      sheet.querySelector('#scan-status').textContent = 'Captured ✓';
      r.innerHTML = `
        <div class="card mb-3">
          <div class="text-xs text-slate-500">From license</div>
          <div class="text-base font-bold mt-1">Dale Hutchins</div>
          <div class="text-xs text-slate-600 mt-0.5">DOB 06/14/1972 · TX DL 38291547</div>
          <div class="text-xs text-slate-600">412 Lake Bend Dr, Onalaska TX 77360</div>
        </div>
        <div class="text-xs text-slate-500 mb-1">Looks like an existing customer.</div>
        <div class="grid grid-cols-2 gap-2">
          <button class="bg-brand-600 text-white rounded-xl py-3 text-sm font-semibold" id="start-dropoff">Start drop-off</button>
          <button class="bg-slate-100 text-slate-700 rounded-xl py-3 text-sm font-semibold" id="start-rental">Start rental</button>
        </div>
      `;
      sheet.querySelector('#start-dropoff').addEventListener('click', () => {
        closeSheet();
        toast('New drop-off opened · WO-1051 created for Dale Hutchins', 'success');
        setTab('jobs');
      });
      sheet.querySelector('#start-rental').addEventListener('click', () => {
        closeSheet();
        toast('Rental started for Dale Hutchins · waiver up next', 'success');
        setTab('rentals');
      });
    }, 1100);
  }

  function scanCart() {
    const sheet = openSheet(`
      <h2>Scanning VIN…</h2>
      <div class="px-4 pb-4 text-center">
        <div class="viewfinder my-3" style="aspect-ratio:1.4">
          <div id="cart-status" class="relative z-10 text-xs text-brand-300 font-semibold">Reading…</div>
        </div>
        <div id="cart-result" class="text-left"></div>
      </div>
    `);
    setTimeout(()=>{
      sheet.querySelector('#cart-status').textContent = 'Cart identified ✓';
      sheet.querySelector('#cart-result').innerHTML = `
        <div class="card mb-3">
          <div class="card-row">
            <div class="thumb" style="width:64px;height:64px"><i data-lucide="car" class="w-7 h-7"></i></div>
            <div>
              <div class="text-base font-bold">2022 Club Car Onward</div>
              <div class="text-xs text-slate-600">Lifted, Lithium · Owner: Dale Hutchins</div>
              <div class="text-xs font-mono text-slate-500 mt-1">CC-ONW-2022-44918</div>
            </div>
          </div>
        </div>
        <div class="text-xs text-slate-500 mb-1.5">Service history</div>
        <div class="card text-sm space-y-2 mb-3">
          <div class="flex justify-between"><span>WO-1042 · won't hold charge</span><span class="chip chip-blue">Diagnosing</span></div>
          <div class="flex justify-between"><span>WO-0987 · annual PM</span><span class="chip chip-gray">May '24</span></div>
          <div class="flex justify-between"><span>WO-0921 · lithium install</span><span class="chip chip-gray">Mar '24</span></div>
        </div>
        <button class="w-full bg-brand-600 text-white rounded-xl py-3 text-sm font-semibold" onclick="mobileApp.closeSheet(); mobileApp.openJob('WO-1042')">Open current job →</button>
      `;
      ico();
    }, 900);
  }

  function scanPhoto() {
    const sheet = openSheet(`
      <h2>Attach photo to job</h2>
      <div class="px-4 pb-4">
        <div class="space-y-2 mb-3">
          ${M.workOrders.filter(w=>w.stage!=='Delivered').slice(0,4).map(w => `
            <button class="card w-full text-left" data-wo-target="${w.id}">
              <div class="text-xs font-mono text-slate-500">${w.id}</div>
              <div class="text-sm font-semibold">${(custById(w.customer)||{}).name}</div>
              <div class="text-xs text-slate-500">${w.cart}</div>
            </button>
          `).join('')}
        </div>
      </div>
    `);
    sheet.querySelectorAll('[data-wo-target]').forEach(b => b.addEventListener('click', () => {
      const w = woById(b.dataset.woTarget);
      w.photos = (w.photos||0) + 1;
      closeSheet();
      toast(`Photo added to ${w.id}`, 'success');
    }));
  }

  // ---------- RENTALS ----------
  SCREENS.rentals = function(root, head) {
    head.innerHTML = header('Rentals', 'Today', rolePill());
    root.innerHTML = `
      <div class="flex gap-2 mb-3">
        <button class="chip chip-blue flex-1 py-2.5" style="font-size:12px">Check-outs · ${M.rentalsToday.checkOuts.length}</button>
        <button class="chip chip-green flex-1 py-2.5" style="font-size:12px">Check-ins · ${M.rentalsToday.checkIns.length}</button>
      </div>
      <div class="text-xs text-slate-500 font-semibold uppercase tracking-wide mb-2">Check-outs</div>
      <div class="space-y-2 mb-4">
        ${M.rentalsToday.checkOuts.map(r => `
          <button class="card w-full text-left" onclick="mobileApp.openCheckOut('${r.id}')">
            <div class="card-row">
              <div class="thumb" style="width:48px;height:48px;"><i data-lucide="car" class="w-5 h-5"></i></div>
              <div class="flex-1 min-w-0">
                <div class="text-sm font-semibold truncate">${r.customer}</div>
                <div class="text-xs text-slate-500">${r.unit} · ${r.cart}</div>
              </div>
              <div class="text-right"><div class="text-xs text-slate-500">${r.time}</div><i data-lucide="chevron-right" class="w-4 h-4 text-slate-400 mt-1"></i></div>
            </div>
          </button>`).join('')}
      </div>
      <div class="text-xs text-slate-500 font-semibold uppercase tracking-wide mb-2">Check-ins</div>
      <div class="space-y-2">
        ${M.rentalsToday.checkIns.map(r => `
          <button class="card w-full text-left" onclick="mobileApp.openCheckIn('${r.id}')">
            <div class="card-row">
              <div class="thumb" style="width:48px;height:48px;"><i data-lucide="car" class="w-5 h-5"></i></div>
              <div class="flex-1 min-w-0">
                <div class="text-sm font-semibold truncate">${r.customer}</div>
                <div class="text-xs text-slate-500">${r.unit} · ${r.cart}</div>
              </div>
              <div class="text-right"><div class="text-xs text-slate-500">${r.time}</div><i data-lucide="chevron-right" class="w-4 h-4 text-slate-400 mt-1"></i></div>
            </div>
          </button>`).join('')}
      </div>
    `;
  };

  window.mobileApp.openCheckOut = function(resId) {
    const r = [...M.rentalsToday.checkOuts, ...M.rentalsToday.checkIns].find(x=>x.id===resId);
    const total = r.deposit ? r.deposit + 345 : 345;
    const sheet = openSheet(`
      <h2>Check out · ${r.unit}</h2>
      <div class="px-4 pb-4 space-y-3">
        <div class="card">
          <div class="text-base font-bold">${r.customer}</div>
          <div class="text-xs text-slate-500">${r.cart} · ${r.time}</div>
          <button class="mt-2 text-xs text-brand-700 font-semibold flex items-center gap-1" onclick="mobileApp.closeSheet(); mobileApp.setTab('scan'); setTimeout(()=>document.getElementById('scan-license')?.click(),100)"><i data-lucide="scan-line" class="w-3.5 h-3.5"></i> Or scan license</button>
        </div>

        <div>
          <div class="text-xs text-slate-500 font-semibold uppercase mb-1.5">Sign waiver</div>
          <canvas id="sig" class="sig-pad w-full"></canvas>
          <div class="flex justify-between mt-1.5">
            <button class="text-xs text-slate-500" id="sig-clear">Clear</button>
            <span class="text-xs text-slate-400" id="sig-hint">Draw your finger across the pad</span>
          </div>
        </div>

        <div class="card">
          <div class="flex justify-between text-sm"><span>3 days × $115</span><span>$345.00</span></div>
          <div class="flex justify-between text-sm"><span>Damage deposit (hold)</span><span>$${r.deposit||200}.00</span></div>
          <div class="flex justify-between text-base font-bold border-t border-slate-100 pt-2 mt-2"><span>Auth total</span><span>$${total}.00</span></div>
          <div class="mt-2 bg-slate-50 rounded-xl px-3 py-2 text-xs text-slate-600 flex items-center gap-1.5"><i data-lucide="credit-card" class="w-3.5 h-3.5"></i> Visa ••4421 on file</div>
        </div>

        <button class="w-full bg-brand-600 text-white rounded-xl py-3.5 font-semibold" id="checkout-confirm">Authorize & hand over keys</button>
      </div>
    `);
    initSignaturePad(sheet.querySelector('#sig'), sheet.querySelector('#sig-hint'));
    sheet.querySelector('#sig-clear').addEventListener('click', () => clearSig(sheet.querySelector('#sig'), sheet.querySelector('#sig-hint')));
    sheet.querySelector('#checkout-confirm').addEventListener('click', () => {
      sheet.querySelector('.sheet').innerHTML = `
        <div class="grabber"></div>
        <div class="p-6 text-center">
          <div class="w-14 h-14 rounded-full bg-brand-100 grid place-items-center mx-auto mb-3"><i data-lucide="key" class="w-7 h-7 text-brand-700"></i></div>
          <div class="text-lg font-bold">Keys handed over ✓</div>
          <div class="text-sm text-slate-500 mt-1">Deposit authorized · waiver on file · SMS sent</div>
          <button class="mt-5 px-4 py-2 bg-brand-600 text-white rounded-xl text-sm font-semibold" onclick="mobileApp.closeSheet()">Done</button>
        </div>
      `;
      ico();
      toast(`📱 To ${r.customer}: "Have fun! Return your ${r.unit} by check-in time."`, 'sms');
    });
  };

  window.mobileApp.openCheckIn = function(resId) {
    const r = M.rentalsToday.checkIns.find(x=>x.id===resId);
    const sheet = openSheet(`
      <h2>Check in · ${r.unit}</h2>
      <div class="px-4 pb-4 space-y-3">
        <div class="card">
          <div class="text-base font-bold">${r.customer}</div>
          <div class="text-xs text-slate-500">${r.cart}</div>
        </div>
        <div>
          <div class="text-xs text-slate-500 font-semibold uppercase mb-1.5">Inspection</div>
          <div class="card space-y-2 text-sm">
            ${['Body & paint','Tires & wheels','Seats & upholstery','Battery / fuel level','Keys returned'].map((it,i)=>`<label class="flex items-center gap-2"><input type="checkbox" ${i<3?'checked':''} class="w-4 h-4 accent-emerald-600"><span>${it}</span></label>`).join('')}
          </div>
        </div>
        <div>
          <div class="text-xs text-slate-500 font-semibold uppercase mb-1.5">Photos</div>
          <div class="photo-strip">
            <button class="photo-add"><i data-lucide="camera-plus" class="w-6 h-6"></i></button>
            <div class="photo"><i data-lucide="image" class="w-6 h-6"></i></div>
          </div>
        </div>
        <button class="w-full bg-brand-600 text-white rounded-xl py-3.5 font-semibold" id="checkin-confirm">Release deposit & close</button>
      </div>
    `);
    sheet.querySelector('#checkin-confirm').addEventListener('click', () => {
      closeSheet();
      toast(`${r.unit} back to available · $200 deposit released to ${r.customer}`, 'success');
    });
  };

  function initSignaturePad(canvas, hint) {
    if (!canvas) return;
    const fit = () => {
      const r = canvas.getBoundingClientRect();
      canvas.width = r.width * devicePixelRatio;
      canvas.height = r.height * devicePixelRatio;
      const ctx = canvas.getContext('2d');
      ctx.scale(devicePixelRatio, devicePixelRatio);
      ctx.lineWidth = 2.2; ctx.lineCap='round'; ctx.lineJoin='round'; ctx.strokeStyle='#0f172a';
    };
    requestAnimationFrame(fit);
    let drawing = false, dirty=false;
    const pt = (e) => {
      const r = canvas.getBoundingClientRect();
      const p = e.touches ? e.touches[0] : e;
      return { x: p.clientX - r.left, y: p.clientY - r.top };
    };
    const start = (e) => { e.preventDefault(); drawing = true; const ctx=canvas.getContext('2d'); const {x,y}=pt(e); ctx.beginPath(); ctx.moveTo(x,y); };
    const move = (e) => { if(!drawing) return; e.preventDefault(); const ctx=canvas.getContext('2d'); const {x,y}=pt(e); ctx.lineTo(x,y); ctx.stroke(); if(!dirty){ dirty=true; canvas.classList.add('signed'); hint.textContent='Signed ✓'; hint.classList.add('text-brand-700'); }};
    const end = () => { drawing=false; };
    canvas.addEventListener('mousedown',start); canvas.addEventListener('mousemove',move); canvas.addEventListener('mouseup',end); canvas.addEventListener('mouseleave',end);
    canvas.addEventListener('touchstart',start); canvas.addEventListener('touchmove',move); canvas.addEventListener('touchend',end);
  }
  function clearSig(canvas, hint) {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0,0,canvas.width,canvas.height);
    canvas.classList.remove('signed');
    if (hint) { hint.textContent = 'Draw your finger across the pad'; hint.classList.remove('text-brand-700'); }
  }

  // ---------- MORE ----------
  SCREENS.more = function(root, head) {
    head.innerHTML = header('More', '', rolePill());
    const tech = techById(M.me.tech) || M.techs[0];
    root.innerHTML = `
      <div class="card flex items-center gap-3 mb-4">
        <div class="w-12 h-12 rounded-full text-white text-base grid place-items-center font-bold" style="background:${tech.color}">${tech.initials}</div>
        <div class="flex-1">
          <div class="text-base font-bold">${tech.name}</div>
          <div class="text-xs text-slate-500">${tech.role} · Lakeside</div>
        </div>
      </div>

      <div class="text-xs text-slate-500 font-semibold uppercase tracking-wide mb-2">Shop tools</div>
      <div class="bg-white rounded-2xl border border-slate-100 divide-y divide-slate-100 mb-4">
        <button class="w-full flex items-center gap-3 p-3.5" id="open-customers"><i data-lucide="users" class="w-5 h-5 text-slate-500"></i><span class="flex-1 text-left text-sm font-medium">Customers</span><i data-lucide="chevron-right" class="w-4 h-4 text-slate-400"></i></button>
        <button class="w-full flex items-center gap-3 p-3.5" id="open-parts"><i data-lucide="package" class="w-5 h-5 text-slate-500"></i><span class="flex-1 text-left text-sm font-medium">Parts lookup</span><i data-lucide="chevron-right" class="w-4 h-4 text-slate-400"></i></button>
        <button class="w-full flex items-center gap-3 p-3.5" id="open-notifs"><i data-lucide="bell" class="w-5 h-5 text-slate-500"></i><span class="flex-1 text-left text-sm font-medium">Notifications</span><i data-lucide="chevron-right" class="w-4 h-4 text-slate-400"></i></button>
      </div>

      <div class="text-xs text-slate-500 font-semibold uppercase tracking-wide mb-2">Account</div>
      <div class="bg-white rounded-2xl border border-slate-100 divide-y divide-slate-100 mb-4">
        <button class="w-full flex items-center gap-3 p-3.5" id="open-role"><i data-lucide="repeat" class="w-5 h-5 text-slate-500"></i><span class="flex-1 text-left text-sm font-medium">Switch role</span><span class="text-xs text-slate-500 mr-1">${M.me.kind}</span><i data-lucide="chevron-right" class="w-4 h-4 text-slate-400"></i></button>
        <button class="w-full flex items-center gap-3 p-3.5" id="replay-tour"><i data-lucide="play-circle" class="w-5 h-5 text-slate-500"></i><span class="flex-1 text-left text-sm font-medium">Replay app tour</span><i data-lucide="chevron-right" class="w-4 h-4 text-slate-400"></i></button>
      </div>

      <div class="text-center text-[10px] text-slate-400 mb-4">v1.0 · Demo build</div>
    `;
    document.getElementById('open-customers').addEventListener('click', openCustomers);
    document.getElementById('open-parts').addEventListener('click', openParts);
    document.getElementById('open-notifs').addEventListener('click', openNotifs);
    document.getElementById('open-role').addEventListener('click', openRoleSheet);
    document.getElementById('replay-tour').addEventListener('click', () => window.TOUR.start());
  };

  function openCustomers() {
    openOverlay(`
      <div class="overlay-header">
        <button data-back class="icon-btn"><i data-lucide="chevron-left" class="w-5 h-5"></i></button>
        <div class="text-base font-bold flex-1">Customers</div>
      </div>
      <div class="overlay-body">
        <input class="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm mb-3" placeholder="Search…">
        <div class="space-y-2">
          ${M.customers.map(c => `
            <div class="card card-row">
              <div class="w-9 h-9 rounded-full bg-slate-200 text-slate-600 grid place-items-center text-xs font-bold">${c.name.split(' ').map(x=>x[0]).join('').slice(0,2)}</div>
              <div class="flex-1 min-w-0">
                <div class="text-sm font-semibold truncate">${c.name}</div>
                <div class="text-xs text-slate-500 truncate">${c.cart}</div>
              </div>
              <a href="tel:${c.phone}" class="icon-btn"><i data-lucide="phone" class="w-4 h-4 text-brand-700"></i></a>
            </div>
          `).join('')}
        </div>
      </div>
    `);
  }
  function openParts() {
    openOverlay(`
      <div class="overlay-header">
        <button data-back class="icon-btn"><i data-lucide="chevron-left" class="w-5 h-5"></i></button>
        <div class="text-base font-bold flex-1">Parts lookup</div>
      </div>
      <div class="overlay-body">
        <input class="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm mb-3" placeholder="Search SKU or name…">
        <div class="space-y-2">
          ${M.parts.map(p => `
            <div class="card">
              <div class="flex justify-between items-center">
                <div class="min-w-0">
                  <div class="text-[11px] font-mono text-slate-500">${p.sku}</div>
                  <div class="text-sm font-semibold truncate">${p.name}</div>
                </div>
                <div class="text-right">
                  <div class="text-sm font-bold">${money(p.price)}</div>
                  ${p.low ? `<span class="chip chip-red mt-1">${p.stock} · low</span>` : `<span class="chip chip-green mt-1">${p.stock} in stock</span>`}
                </div>
              </div>
            </div>`).join('')}
        </div>
      </div>
    `);
  }
  function openNotifs() {
    openOverlay(`
      <div class="overlay-header">
        <button data-back class="icon-btn"><i data-lucide="chevron-left" class="w-5 h-5"></i></button>
        <div class="text-base font-bold flex-1">Notifications</div>
      </div>
      <div class="overlay-body">
        <div class="space-y-2">
          ${M.notifications.map(n => `
            <div class="card">
              <div class="flex justify-between items-baseline mb-0.5">
                <div class="text-sm font-semibold">${n.from}</div>
                <div class="text-[10px] text-slate-400">${n.time}</div>
              </div>
              <div class="text-sm text-slate-600">${n.body}</div>
            </div>`).join('')}
        </div>
      </div>
    `);
  }
  function openRoleSheet() {
    const sheet = openSheet(`
      <h2>Switch role</h2>
      <div class="px-4 pb-4 space-y-2">
        ${['Technician','Front Desk'].map(k => `<button class="card w-full text-left flex items-center gap-3 ${M.me.kind===k?'border-brand-500 bg-brand-50':''}" data-role="${k}">
          <div class="ic" style="width:40px;height:40px;border-radius:11px;background:${k==='Technician'?'#ede9fe':'#dbeafe'};color:${k==='Technician'?'#6d28d9':'#1e40af'};display:grid;place-items:center"><i data-lucide="${k==='Technician'?'wrench':'desktop'}" class="w-5 h-5"></i></div>
          <div class="flex-1"><div class="text-sm font-semibold">${k}</div><div class="text-xs text-slate-500">${k==='Technician'?'See assigned jobs + run AI advisor':'See rentals, drop-offs, quick reserve'}</div></div>
          ${M.me.kind===k?'<i data-lucide="check" class="w-5 h-5 text-brand-700"></i>':''}
        </button>`).join('')}
      </div>
    `);
    sheet.querySelectorAll('[data-role]').forEach(b => b.addEventListener('click', () => {
      M.setMe(b.dataset.role);
      closeSheet();
      setTab(currentTab);
    }));
  }

  window.mobileApp.openPartsSearch = function(woId) {
    const sheet = openSheet(`
      <h2>Add part to ${woId}</h2>
      <div class="px-4 pb-4">
        <input class="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm mb-3" placeholder="Search…">
        <div class="space-y-2 max-h-72 overflow-y-auto">
          ${M.parts.slice(0,8).map(p=>`<button class="card w-full text-left" data-add-sku="${p.sku}">
            <div class="flex justify-between items-center">
              <div><div class="text-[11px] font-mono text-slate-500">${p.sku}</div><div class="text-sm font-semibold">${p.name}</div></div>
              <div class="text-sm font-bold">${money(p.price)}</div>
            </div>
          </button>`).join('')}
        </div>
      </div>
    `);
    sheet.querySelectorAll('[data-add-sku]').forEach(b => b.addEventListener('click', () => {
      const w = woById(woId); const p = M.parts.find(x=>x.sku===b.dataset.addSku);
      w.partsLines = w.partsLines || [];
      w.partsLines.push({ sku:p.sku, name:p.name, qty:1, price:p.price });
      closeSheet();
      document.querySelector('.overlay')?.remove();
      openJob(woId);
      toast(`${p.name} added to ${woId}`, 'success');
    }));
  };

  // ============ boot ============
  document.addEventListener('DOMContentLoaded', () => {
    renderTabbar('home');
    setTab('home');
    ico();
    initWelcome();
  });

  function initWelcome() {
    let done = null;
    try { done = localStorage.getItem('lakeside.mobile.tour.done'); } catch(_){}
    const w = document.getElementById('welcome');
    if (!done) w.classList.remove('hidden');
    document.getElementById('welcome-skip').addEventListener('click', () => {
      w.classList.add('hidden');
      try { localStorage.setItem('lakeside.mobile.tour.done','1'); } catch(_){}
    });
    document.getElementById('welcome-start').addEventListener('click', () => {
      w.classList.add('hidden');
      try { localStorage.setItem('lakeside.mobile.tour.done','1'); } catch(_){}
      window.TOUR?.start();
    });
  }
})();
