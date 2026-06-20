// All screen render functions
window.SCREENS = (function(){
  const M = window.MOCK;

  // ----- helpers -----
  const $ = (sel, el=document) => el.querySelector(sel);
  const el = (html) => { const d = document.createElement('div'); d.innerHTML = html.trim(); return d.firstElementChild; };
  const customerById = id => M.customers.find(c => c.id === id);
  const techById = id => M.techs.find(t => t.id === id);
  const partBySku = sku => M.parts.find(p => p.sku === sku);

  const stageColor = (s) => ({
    'Checked In':'gray','Diagnosing':'blue','Awaiting Approval':'amber','Awaiting Parts':'amber',
    'In Progress':'purple','Ready for Pickup':'green','Delivered':'gray'
  })[s];

  const money = n => '$' + n.toLocaleString('en-US', {minimumFractionDigits: n%1?2:0, maximumFractionDigits:2});

  const cartThumb = (label='Cart', w=44, h=30) => `<div class="cart-thumb" style="width:${w}px;height:${h}px;"><i data-lucide="car" class="w-4 h-4"></i></div>`;

  const pageHead = (title, subtitle, actions='') => `
    <div class="flex items-start justify-between mb-5 flex-wrap gap-3">
      <div>
        <h1 class="text-2xl font-bold text-slate-900">${title}</h1>
        ${subtitle ? `<p class="text-sm text-slate-500 mt-1">${subtitle}</p>` : ''}
      </div>
      <div class="flex items-center gap-2">${actions}</div>
    </div>
  `;

  const sectionStub = (title, blurb, body) => `
    ${pageHead(title, blurb)}
    <div class="card card-pad">${body}</div>
  `;

  // ===== Dashboard =====
  function dashboard() {
    const d = M.dashboard;
    const kpiCard = (k) => `
      <div class="card card-pad kpi" data-tour="kpi-${k.label.replace(/\s/g,'-').toLowerCase()}">
        <div class="flex items-center justify-between">
          <div class="text-xs text-slate-500 font-medium">${k.label}</div>
          <div class="w-8 h-8 rounded-lg bg-${k.tone}-50 grid place-items-center"><i data-lucide="${k.icon}" class="w-4 h-4 text-${k.tone}-600"></i></div>
        </div>
        <div class="text-2xl font-bold mt-2">${k.value}</div>
        <div class="text-xs text-slate-500 mt-1">${k.delta}</div>
      </div>
    `;

    return `
      ${pageHead('Good morning, Jess.', 'Thursday, June 20 · Lakeside Golf Carts')}
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-5" id="kpi-row">
        ${d.kpis.map(kpiCard).join('')}
      </div>
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-5">
        <div class="card card-pad lg:col-span-2" data-tour="dash-chart">
          <div class="flex items-center justify-between mb-2">
            <div>
              <div class="text-sm font-semibold">Revenue · last 12 months</div>
              <div class="text-xs text-slate-500">All revenue sources combined</div>
            </div>
            <div class="text-xs text-slate-500">Trailing 12 mo</div>
          </div>
          <canvas id="revenueChart" height="110"></canvas>
        </div>
        <div class="card card-pad">
          <div class="text-sm font-semibold mb-2">Revenue mix · MTD</div>
          <canvas id="mixChart" height="160"></canvas>
        </div>
      </div>
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div class="card card-pad lg:col-span-2" data-tour="dash-schedule">
          <div class="flex items-center justify-between mb-3">
            <div class="text-sm font-semibold">Today's schedule</div>
            <a href="#/rentals" class="text-xs text-brand-700 font-medium">View rentals →</a>
          </div>
          <ul class="divide-y divide-slate-100 text-sm">
            ${d.todaySchedule.map(s => `
              <li class="py-2.5 flex items-center gap-3">
                <span class="text-xs font-mono text-slate-500 w-12">${s.time}</span>
                <span class="flex-1">${s.what}</span>
                <span class="badge badge-gray">${s.who}</span>
              </li>`).join('')}
          </ul>
        </div>
        <div class="card card-pad">
          <div class="text-sm font-semibold mb-3">Recent activity</div>
          <ul class="space-y-3 text-sm">
            ${d.activity.map(a => `
              <li class="flex items-start gap-2">
                <i data-lucide="circle" class="w-2 h-2 mt-2 text-brand-500"></i>
                <div class="flex-1">
                  <span class="font-medium">${a.who}</span> <span class="text-slate-600">${a.what}</span>
                  <div class="text-xs text-slate-400">${a.when}</div>
                </div>
              </li>`).join('')}
          </ul>
        </div>
      </div>
    `;
  }

  function dashboardAfter() {
    if (!window.Chart) return;
    const d = M.dashboard;
    const ctx = document.getElementById('revenueChart');
    if (ctx) {
      new Chart(ctx, {
        type:'line',
        data:{ labels: d.revenueSeries.map(p=>p.m),
          datasets:[{ label:'Revenue', data: d.revenueSeries.map(p=>p.v),
            borderColor:'#059669', backgroundColor:'rgba(16,185,129,.12)',
            tension:.35, fill:true, pointRadius:3, pointBackgroundColor:'#059669' }]},
        options:{ plugins:{ legend:{display:false}}, scales:{ y:{ ticks:{ callback:v=>'$'+(v/1000)+'k'}}}}
      });
    }
    const mctx = document.getElementById('mixChart');
    if (mctx) {
      new Chart(mctx, {
        type:'doughnut',
        data:{ labels: d.revenueMix.map(m=>m.label),
          datasets:[{ data: d.revenueMix.map(m=>m.v),
            backgroundColor:['#059669','#0ea5e9','#8b5cf6','#f97316'], borderWidth:0 }]},
        options:{ plugins:{ legend:{position:'bottom', labels:{boxWidth:10, font:{size:11}}}}, cutout:'62%' }
      });
    }
  }

  // ===== Repair & Service (kanban) =====
  function repair() {
    const cols = M.stages.map(stage => {
      const cards = M.workOrders.filter(w => w.stage === stage);
      return `
        <div class="kanban-col" data-stage="${stage}">
          <h4>${stage} <span class="badge badge-gray">${cards.length}</span></h4>
          <div class="kanban-cards" data-stage-cards="${stage}">
            ${cards.map(woCard).join('')}
          </div>
        </div>
      `;
    }).join('');

    return `
      ${pageHead('Repair & Service', 'Track every cart from check-in to delivered.', `
        <button id="see-repair-demo" class="px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg hover:bg-slate-50 flex items-center gap-1.5">
          <i data-lucide="play" class="w-4 h-4 text-brand-600"></i> See a repair, drop-off to delivered
        </button>
        <button class="px-3 py-2 text-sm bg-brand-600 text-white font-medium rounded-lg hover:bg-brand-700 flex items-center gap-1.5">
          <i data-lucide="plus" class="w-4 h-4"></i> New Work Order
        </button>
      `)}
      <div class="kanban" data-tour="kanban">${cols}</div>
    `;
  }

  function woCard(w) {
    const c = customerById(w.customer);
    const t = techById(w.tech);
    return `
      <div class="wo-card" data-wo="${w.id}">
        <div class="flex items-center justify-between mb-1.5">
          <span class="text-xs font-mono text-slate-500">${w.id}</span>
          ${w.warranty ? '<span class="badge badge-purple">Warranty</span>' : ''}
        </div>
        <div class="flex items-center gap-2 mb-2">
          ${cartThumb()}
          <div class="min-w-0">
            <div class="text-sm font-semibold truncate">${c.name}</div>
            <div class="text-xs text-slate-500 truncate">${w.cart}</div>
          </div>
        </div>
        <div class="text-xs text-slate-600 line-clamp-2 mb-2">${w.complaint}</div>
        <div class="flex items-center justify-between">
          ${t ? `<span class="flex items-center gap-1.5 text-xs"><span class="w-5 h-5 rounded-full text-white text-[10px] grid place-items-center font-semibold" style="background:${t.color}">${t.initials}</span><span class="text-slate-700">${t.name.split(' ')[0]}</span></span>` : `<span class="text-xs text-slate-400">Unassigned</span>`}
          <span class="text-[10px] text-slate-400">${w.timeIn}</span>
        </div>
      </div>
    `;
  }

  function openWorkOrder(woId) {
    const w = M.workOrders.find(x => x.id === woId);
    if (!w) return;
    const c = customerById(w.customer);
    const t = techById(w.tech);

    const partsRows = (w.partsLines||[]).map(pl => {
      const p = partBySku(pl.sku);
      return p ? `<tr><td class="py-1.5">${p.name}</td><td class="text-center">${pl.qty}</td><td class="text-right">${money(p.price)}</td><td class="text-right font-medium">${money(p.price*pl.qty)}</td></tr>` : '';
    }).join('') || '<tr><td colspan="4" class="py-3 text-center text-xs text-slate-400">No parts yet</td></tr>';

    const partsTotal = (w.partsLines||[]).reduce((s,pl)=>{ const p=partBySku(pl.sku); return s + (p?p.price*pl.qty:0); },0);
    const laborTotal = (w.labor||[]).reduce((s,l)=>s + l.hours*l.rate, 0);

    const techOpts = M.techs.map(tt => `<option value="${tt.id}" ${tt.id===w.tech?'selected':''}>${tt.name} — ${tt.active} active</option>`).join('');

    const stepperHtml = M.stages.map((s,i) => {
      const curIdx = M.stages.indexOf(w.stage);
      const cls = i===curIdx ? 'current' : (i<curIdx ? 'done' : '');
      return `<button class="step ${cls}" data-advance="${s}">${s}</button>`;
    }).join('');

    const photosHtml = (w.photos||[]).length ?
      w.photos.map(p => `<div class="cart-thumb" style="width:72px;height:54px;"><i data-lucide="image" class="w-5 h-5"></i></div>`).join('') :
      '<div class="text-xs text-slate-400">No photos yet</div>';

    const drawer = el(`
      <div>
        <div class="drawer-back" data-close></div>
        <div class="drawer">
          <div class="p-5 border-b border-slate-200 flex items-start justify-between">
            <div>
              <div class="text-xs font-mono text-slate-500">${w.id}</div>
              <h2 class="text-xl font-bold mt-0.5">${c.name}</h2>
              <div class="text-sm text-slate-600">${w.cart}</div>
            </div>
            <button data-close class="p-2 rounded hover:bg-slate-100"><i data-lucide="x" class="w-5 h-5"></i></button>
          </div>

          <div class="p-5 border-b border-slate-200">
            <div class="text-[11px] uppercase tracking-wide text-slate-500 mb-2 font-semibold">Stage</div>
            <div class="stepper" data-tour-drawer="stepper">${stepperHtml}</div>
          </div>

          <div class="p-5 border-b border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div class="text-[11px] uppercase tracking-wide text-slate-500 mb-1 font-semibold">Complaint</div>
              <div class="text-sm">${w.complaint}</div>
            </div>
            <div>
              <div class="text-[11px] uppercase tracking-wide text-slate-500 mb-1 font-semibold">Diagnosis</div>
              <div class="text-sm">${w.diagnosis || '<span class="text-slate-400">Not started</span>'}</div>
            </div>
          </div>

          <div class="p-5 border-b border-slate-200">
            <div class="flex items-center justify-between mb-2">
              <div class="text-[11px] uppercase tracking-wide text-slate-500 font-semibold">Assigned Technician</div>
              ${t ? `<span class="text-xs text-slate-500">Workload: ${t.active} active jobs</span>` : ''}
            </div>
            <div class="flex items-center gap-3">
              ${t ? `<span class="w-9 h-9 rounded-full text-white text-xs grid place-items-center font-semibold" style="background:${t.color}">${t.initials}</span>` : '<span class="w-9 h-9 rounded-full bg-slate-200 grid place-items-center"><i data-lucide="user" class="w-4 h-4 text-slate-500"></i></span>'}
              <select class="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg" data-tour-drawer="assign">
                <option value="">Unassigned</option>
                ${techOpts}
              </select>
            </div>
          </div>

          <div class="p-5 border-b border-slate-200">
            <div class="flex items-center justify-between mb-2">
              <div class="text-[11px] uppercase tracking-wide text-slate-500 font-semibold">Labor</div>
              ${t ? `<span class="text-xs text-slate-500">${t.name.split(' ')[0]} · ${w.timeIn} on this job</span>` : ''}
            </div>
            <table class="w-full text-sm">
              ${(w.labor||[]).length ? w.labor.map(l=>`
                <tr><td class="py-1">${l.desc}</td><td class="text-center">${l.hours}h</td><td class="text-right">${money(l.rate)}/h</td><td class="text-right font-medium">${money(l.hours*l.rate)}</td></tr>
              `).join('') : '<tr><td colspan="4" class="py-2 text-xs text-slate-400">No labor logged</td></tr>'}
            </table>
            <div class="text-right text-xs text-slate-500 mt-1">Labor total: <span class="font-semibold text-slate-800">${money(laborTotal)}</span></div>
          </div>

          <div class="p-5 border-b border-slate-200">
            <div class="text-[11px] uppercase tracking-wide text-slate-500 mb-2 font-semibold">Parts</div>
            <table class="w-full text-sm">
              <thead class="text-[11px] uppercase text-slate-400">
                <tr><th class="text-left font-medium">Part</th><th class="text-center font-medium">Qty</th><th class="text-right font-medium">Price</th><th class="text-right font-medium">Total</th></tr>
              </thead>
              <tbody>${partsRows}</tbody>
            </table>
            <div class="text-right text-xs text-slate-500 mt-1">Parts total: <span class="font-semibold text-slate-800">${money(partsTotal)}</span></div>
          </div>

          <div class="p-5 border-b border-slate-200">
            <div class="text-[11px] uppercase tracking-wide text-slate-500 mb-2 font-semibold">Photos / Video</div>
            <div class="flex gap-2 flex-wrap">${photosHtml}</div>
          </div>

          <div class="p-5 border-b border-slate-200">
            <button data-ai-advisor="${w.id}" class="w-full px-3 py-2.5 text-sm rounded-lg font-medium text-white flex items-center justify-center gap-2"
              style="background:linear-gradient(135deg,#8b5cf6,#ec4899)" data-tour-drawer="ai">
              <i data-lucide="sparkles" class="w-4 h-4"></i> Ask AI Service Advisor
            </button>
            <div id="ai-panel" class="mt-3"></div>
          </div>

          <div class="p-5 flex items-center justify-between bg-slate-50 sticky bottom-0">
            <div class="text-sm">
              <div class="text-slate-500 text-xs">Total</div>
              <div class="text-lg font-bold">${money(partsTotal + laborTotal)}</div>
            </div>
            <div class="flex gap-2">
              <button class="px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg hover:bg-slate-50" data-touchpoint="estimate">Text estimate</button>
              <button class="px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg hover:bg-slate-50" data-touchpoint="approval">Request approval</button>
              <button class="px-3 py-2 text-xs bg-brand-600 text-white rounded-lg hover:bg-brand-700" data-touchpoint="ready">Notify ready</button>
            </div>
          </div>
        </div>
      </div>
    `);
    document.getElementById('modal-mount').appendChild(drawer);
    if (window.lucide) lucide.createIcons();

    drawer.querySelectorAll('[data-close]').forEach(b => b.addEventListener('click', closeDrawer));
    drawer.querySelectorAll('[data-advance]').forEach(b => b.addEventListener('click', () => {
      w.stage = b.dataset.advance;
      closeDrawer();
      window.app.render();
      toast(`Moved ${w.id} to ${w.stage}`, 'success');
    }));
    drawer.querySelectorAll('[data-touchpoint]').forEach(b => b.addEventListener('click', () => {
      const t = b.dataset.touchpoint;
      const msg = {
        estimate: `📱 SMS to ${c.name}: "Hi ${c.name.split(' ')[0]} — your estimate for ${w.cart}: ${money(partsTotal+laborTotal)}. Reply YES to approve. — Lakeside"`,
        approval: `📱 SMS to ${c.name}: "Approval request sent — quote ${money(partsTotal+laborTotal)}. Reply YES."`,
        ready: `📱 SMS to ${c.name}: "Great news — your ${w.cart} is ready for pickup!"`
      }[t];
      toast(msg, 'sms');
    }));
    drawer.querySelector('[data-ai-advisor]').addEventListener('click', () => runAIAdvisor(w));
  }

  function runAIAdvisor(w) {
    const panel = document.getElementById('ai-panel');
    if (!panel) return;
    let key = 'wont-charge';
    if (/throttle/i.test(w.complaint)) key = 'pulls-left';
    if (/flicker|light/i.test(w.complaint)) key = 'flicker-lights';
    if (/start|charge/i.test(w.complaint) === false && /no/i.test(w.complaint)) key = 'no-start';
    const lines = M.aiResponses[key] || M.aiResponses['wont-charge'];

    panel.innerHTML = `
      <div class="ai-bubble">
        <div class="flex items-center justify-between mb-2">
          <span class="ai-badge"><i data-lucide="sparkles" class="w-3 h-3"></i> AI Service Advisor</span>
          <span class="text-[10px] text-slate-500">Trained on your shop's repair history</span>
        </div>
        <div id="ai-stream" class="space-y-2"></div>
      </div>
    `;
    if (window.lucide) lucide.createIcons();
    const stream = document.getElementById('ai-stream');
    typewriterLines(stream, lines, 18);
  }

  function typewriterLines(target, lines, charDelay=20, lineDelay=240) {
    let li = 0;
    const next = () => {
      if (li >= lines.length) return;
      const p = document.createElement('p');
      p.className = 'typewriter text-sm';
      target.appendChild(p);
      const text = lines[li];
      let i = 0;
      const tick = () => {
        if (i <= text.length) {
          p.textContent = text.slice(0,i);
          i++; setTimeout(tick, charDelay);
        } else {
          p.classList.remove('typewriter');
          li++; setTimeout(next, lineDelay);
        }
      };
      tick();
    };
    next();
  }

  function closeDrawer() {
    const mount = document.getElementById('modal-mount');
    mount.innerHTML = '';
  }

  // ===== Rentals =====
  function rentals() {
    const fleetCards = M.fleet.map(c => {
      const tone = c.status==='available'?'green':c.status==='rented'?'blue':'amber';
      return `
        <div class="card card-pad">
          <div class="flex items-center justify-between mb-2">
            <div class="text-xs font-mono text-slate-500">${c.unit}</div>
            <span class="badge badge-${tone}">${c.status}</span>
          </div>
          <div class="cart-thumb mb-2" style="height:80px;border-radius:8px"><i data-lucide="car" class="w-8 h-8"></i></div>
          <div class="text-sm font-semibold">${c.make} ${c.model}</div>
          <div class="text-xs text-slate-500">${c.power} · ${money(c.rate)}/day</div>
        </div>
      `;
    }).join('');

    const resRows = M.reservations.map(r => {
      const c = customerById(r.customer);
      return `<tr>
        <td class="py-2 font-mono text-xs">${r.id}</td>
        <td>${c.name}</td>
        <td><span class="font-mono text-xs">${r.unit}</span></td>
        <td>${r.start} → ${r.end}</td>
        <td>${money(r.deposit)} hold</td>
        <td><span class="badge ${r.status==='picked-up'?'badge-blue':'badge-gray'}">${r.status}</span></td>
      </tr>`;
    }).join('');

    const utilRows = M.utilization.map(u => `
      <tr>
        <td class="py-2 font-mono text-xs">${u.unit}</td>
        <td class="w-1/2"><div class="util-bar"><div style="width:${u.util}%"></div></div></td>
        <td class="text-right text-xs font-medium">${u.util}%</td>
        <td class="text-right text-xs">${u.rentedDays}d / 60</td>
        <td class="text-right text-sm font-semibold">${money(u.revenue)}</td>
      </tr>
    `).join('');

    const sorted = [...M.utilization].sort((a,b)=>b.revenue-a.revenue);
    const top = sorted.slice(0,3), bot = sorted.slice(-3).reverse();
    const fleetUtil = Math.round(M.utilization.reduce((s,u)=>s+u.util,0)/M.utilization.length);

    return `
      ${pageHead('Rentals', '10 carts in fleet · today: 5 out, 1 in shop.', `
        <button id="new-res" class="px-3 py-2 text-sm bg-brand-600 text-white font-medium rounded-lg hover:bg-brand-700 flex items-center gap-1.5">
          <i data-lucide="plus" class="w-4 h-4"></i> New Reservation
        </button>
      `)}
      <div class="flex gap-2 mb-4 border-b border-slate-200">
        ${['Fleet','Calendar','Utilization'].map((t,i)=>`<button class="tab px-3 py-2 text-sm border-b-2 ${i===0?'border-brand-600 text-brand-700 font-semibold':'border-transparent text-slate-500 hover:text-slate-800'}" data-tab="${t.toLowerCase()}">${t}</button>`).join('')}
      </div>

      <div data-pane="fleet" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3" data-tour="rental-fleet">${fleetCards}</div>

      <div data-pane="calendar" class="hidden card card-pad">
        <div class="text-sm font-semibold mb-3">Reservation timeline · this week</div>
        <div class="overflow-x-auto">
          <table class="min-w-full text-xs">
            <thead><tr class="text-slate-400"><th class="text-left py-1">Unit</th>${['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d=>`<th class="text-center py-1">${d}</th>`).join('')}</tr></thead>
            <tbody>
              ${M.fleet.map((c,i)=>{
                const cells = Array.from({length:7},(_,d)=>{
                  const has = (i+d)%3 === 0 || (i===0 && d<4) || (i===3 && (d===3||d===4||d===5));
                  return `<td class="px-1 py-1.5"><div class="${has?'bg-brand-500':'bg-slate-100'} h-5 rounded"></div></td>`;
                }).join('');
                return `<tr><td class="font-mono py-1">${c.unit}</td>${cells}</tr>`;
              }).join('')}
            </tbody>
          </table>
        </div>
        <div class="text-sm font-semibold mt-5 mb-2">All reservations</div>
        <table class="w-full text-sm">
          <thead class="text-[11px] uppercase text-slate-400"><tr><th class="text-left py-1">ID</th><th class="text-left">Customer</th><th class="text-left">Unit</th><th class="text-left">When</th><th class="text-left">Deposit</th><th class="text-left">Status</th></tr></thead>
          <tbody>${resRows}</tbody>
        </table>
      </div>

      <div data-pane="utilization" class="hidden grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div class="card card-pad lg:col-span-2">
          <div class="text-sm font-semibold mb-3">Per-cart utilization · last 60 days</div>
          <table class="w-full text-sm">
            <thead class="text-[11px] uppercase text-slate-400"><tr><th class="text-left py-1">Unit</th><th>Utilization</th><th class="text-right">%</th><th class="text-right">Days</th><th class="text-right">Revenue</th></tr></thead>
            <tbody>${utilRows}</tbody>
          </table>
        </div>
        <div class="space-y-4">
          <div class="card card-pad">
            <div class="text-xs text-slate-500">Fleet utilization</div>
            <div class="text-3xl font-bold mt-1">${fleetUtil}%</div>
            <div class="text-xs text-slate-500">Last 60 days · all 10 carts</div>
          </div>
          <div class="card card-pad">
            <div class="text-sm font-semibold mb-2">🏆 Top earners</div>
            <ul class="text-sm space-y-1">${top.map(u=>`<li class="flex justify-between"><span class="font-mono">${u.unit}</span><span class="font-semibold">${money(u.revenue)}</span></li>`).join('')}</ul>
          </div>
          <div class="card card-pad">
            <div class="text-sm font-semibold mb-2">📉 Underperformers</div>
            <ul class="text-sm space-y-1">${bot.map(u=>`<li class="flex justify-between"><span class="font-mono">${u.unit}</span><span class="text-slate-500">${money(u.revenue)}</span></li>`).join('')}</ul>
          </div>
        </div>
      </div>
    `;
  }

  function rentalsAfter() {
    document.querySelectorAll('[data-tab]').forEach(btn => btn.addEventListener('click', () => {
      const tab = btn.dataset.tab;
      document.querySelectorAll('[data-tab]').forEach(b => {
        const active = b.dataset.tab === tab;
        b.className = `tab px-3 py-2 text-sm border-b-2 ${active?'border-brand-600 text-brand-700 font-semibold':'border-transparent text-slate-500 hover:text-slate-800'}`;
      });
      document.querySelectorAll('[data-pane]').forEach(p => p.classList.toggle('hidden', p.dataset.pane !== tab));
    }));
    const nr = document.getElementById('new-res');
    if (nr) nr.addEventListener('click', () => openReservationFlow());
  }

  function openReservationFlow() {
    const modal = el(`
      <div class="fixed inset-0 z-40 bg-slate-900/50 grid place-items-center p-4">
        <div class="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
          <div class="p-5 border-b border-slate-200 flex justify-between items-center">
            <div>
              <h3 class="text-lg font-bold">New Reservation</h3>
              <div class="text-xs text-slate-500" id="res-step-label">Step 1 of 4 · Pick a cart</div>
            </div>
            <button data-close class="p-1 rounded hover:bg-slate-100"><i data-lucide="x" class="w-5 h-5"></i></button>
          </div>
          <div class="p-5" id="res-body"></div>
        </div>
      </div>
    `);
    document.getElementById('modal-mount').appendChild(modal);
    let step = 1;
    const render = () => {
      const b = modal.querySelector('#res-body');
      modal.querySelector('#res-step-label').textContent = `Step ${step} of 4 · ${['Pick a cart','Dates','Waiver','Deposit & confirm'][step-1]}`;
      if (step === 1) b.innerHTML = `
        <div class="space-y-2 mb-4">${M.fleet.filter(f=>f.status==='available').slice(0,4).map(f=>`<label class="flex items-center gap-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50"><input type="radio" name="cart" value="${f.unit}" class="text-brand-600" ${f.unit==='R-02'?'checked':''}><div class="flex-1"><div class="text-sm font-semibold">${f.unit} · ${f.make} ${f.model}</div><div class="text-xs text-slate-500">${money(f.rate)}/day</div></div></label>`).join('')}</div>`;
      if (step === 2) b.innerHTML = `<div class="space-y-3"><div><label class="text-xs text-slate-500">Pick-up</label><input value="Today 3:00 PM" class="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"></div><div><label class="text-xs text-slate-500">Return</label><input value="Sunday 5:00 PM" class="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"></div><div class="text-sm bg-slate-50 rounded-lg p-3">Estimated: 3 days × $115 = <strong>$345</strong></div></div>`;
      if (step === 3) b.innerHTML = `<div class="space-y-3"><div class="bg-slate-50 p-3 rounded-lg text-xs text-slate-600 max-h-32 overflow-y-auto">Lakeside Golf Carts Rental Waiver — Renter assumes all risk… (truncated for demo)</div><label class="flex items-start gap-2 text-sm"><input type="checkbox" class="mt-1" id="waiver-cb" checked> I agree to the rental waiver & damage policy.</label><div class="text-xs text-slate-500">Renter will also receive a copy by SMS.</div></div>`;
      if (step === 4) b.innerHTML = `<div class="space-y-3"><div class="flex justify-between text-sm"><span>Rental (3 days)</span><span>$345.00</span></div><div class="flex justify-between text-sm"><span>Damage deposit (hold)</span><span>$200.00</span></div><div class="flex justify-between text-sm border-t pt-2 font-semibold"><span>Auth total</span><span>$545.00</span></div><div class="bg-slate-50 p-3 rounded-lg text-xs">💳 Visa ••4421 — placing hold</div></div>`;
      b.insertAdjacentHTML('beforeend', `<div class="flex justify-between mt-5">${step>1?'<button data-prev class="px-3 py-2 text-sm text-slate-600">← Back</button>':'<span></span>'}<button data-next class="px-4 py-2 text-sm bg-brand-600 text-white font-medium rounded-lg">${step<4?'Next →':'Confirm reservation'}</button></div>`);
      if (window.lucide) lucide.createIcons();
      b.querySelector('[data-next]')?.addEventListener('click', () => {
        if (step < 4) { step++; render(); }
        else {
          modal.querySelector('#res-body').innerHTML = `<div class="text-center py-6"><div class="w-14 h-14 mx-auto bg-brand-100 rounded-full grid place-items-center mb-3"><i data-lucide="check" class="w-7 h-7 text-brand-700"></i></div><div class="text-lg font-bold">Reservation confirmed</div><div class="text-sm text-slate-500 mt-1">RES-207 created · waiver signed · $200 hold placed</div><button data-close class="mt-5 px-4 py-2 text-sm bg-brand-600 text-white rounded-lg">Done</button></div>`;
          if (window.lucide) lucide.createIcons();
          modal.querySelectorAll('[data-close]').forEach(b=>b.addEventListener('click', () => modal.remove()));
          toast('Reservation RES-207 confirmed · SMS sent with pickup details', 'sms');
        }
      });
      b.querySelector('[data-prev]')?.addEventListener('click', () => { step--; render(); });
    };
    render();
    modal.querySelectorAll('[data-close]').forEach(b => b.addEventListener('click', () => modal.remove()));
  }

  // ===== Parts & Inventory =====
  function parts() {
    const rows = M.parts.map(p => {
      const low = p.stock <= p.reorder;
      return `<tr class="${low?'bg-red-50/40':''}">
        <td class="py-2 font-mono text-xs">${p.sku}</td>
        <td class="font-medium">${p.name}</td>
        <td>${p.vendor}</td>
        <td class="text-right">${money(p.price)}</td>
        <td class="text-right">${low?`<span class="badge badge-red">${p.stock} · reorder</span>`:`<span class="badge badge-green">${p.stock} in stock</span>`}</td>
        <td class="text-right text-xs text-slate-500">≥ ${p.reorder}</td>
      </tr>`;
    }).join('');
    const lowCount = M.parts.filter(p => p.stock <= p.reorder).length;
    return `
      ${pageHead('Parts & Inventory', `${M.parts.length} SKUs · ${lowCount} need reorder.`,
        `<button class="px-3 py-2 text-sm bg-brand-600 text-white rounded-lg font-medium flex items-center gap-1.5"><i data-lucide="shopping-cart" class="w-4 h-4"></i> Create PO from low stock</button>`)}
      <div class="card overflow-x-auto" data-tour="parts-table">
        <table class="min-w-full text-sm">
          <thead class="bg-slate-50 text-[11px] uppercase text-slate-500">
            <tr><th class="text-left px-4 py-2">SKU</th><th class="text-left">Part</th><th class="text-left">Vendor</th><th class="text-right">Price</th><th class="text-right">Stock</th><th class="text-right">Reorder pt</th></tr>
          </thead>
          <tbody class="divide-y divide-slate-100">${rows}</tbody>
        </table>
      </div>
    `;
  }

  // ===== Sales (New & Used) =====
  function sales() {
    const deals = [
      { id:'D-3081', customer:'Wyatt Cole', unit:'2024 Club Car Onward 4', stage:'Build in progress', value:14820 },
      { id:'D-3080', customer:'Priya Shah', unit:'2023 E-Z-GO Liberty', stage:'Quoted', value:9450 },
      { id:'D-3079', customer:'Kendall Foy', unit:'2022 Yamaha Adventurer', stage:'Approved', value:11200 },
      { id:'D-3078', customer:'Holly Brennan', unit:'2021 E-Z-GO Express S4 (Used)', stage:'Test ride', value:6890 },
      { id:'D-3077', customer:'Ramiro Salas', unit:'2018 Club Car Precedent (Used)', stage:'Negotiating', value:4250 },
    ];
    const dealCols = ['Lead','Quoted','Test ride','Negotiating','Approved','Build in progress','Delivered'];
    const colsHtml = dealCols.map(c => {
      const list = deals.filter(d => d.stage===c);
      return `<div class="kanban-col"><h4>${c} <span class="badge badge-gray">${list.length}</span></h4>${list.map(d=>`
        <div class="wo-card">
          <div class="text-xs font-mono text-slate-500">${d.id}</div>
          <div class="text-sm font-semibold mt-1">${d.customer}</div>
          <div class="text-xs text-slate-500">${d.unit}</div>
          <div class="text-sm font-bold mt-2">${money(d.value)}</div>
        </div>`).join('')}</div>`;
    }).join('');
    return `
      ${pageHead('Sales (New & Used)','Deal pipeline · 5 active.')}
      <div class="kanban">${colsHtml}</div>
    `;
  }

  // ===== POS =====
  function pos() {
    return `
      ${pageHead('Point of Sale','In-store checkout for parts, accessories, and rentals.')}
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div class="lg:col-span-2 card card-pad">
          <input placeholder="Scan or search part…" class="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm mb-3" value="LED">
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
            ${M.parts.slice(0,9).map(p=>`<div class="border border-slate-200 rounded-lg p-3 hover:border-brand-500 cursor-pointer"><div class="text-xs text-slate-500 font-mono">${p.sku}</div><div class="text-sm font-semibold mt-1 line-clamp-2">${p.name}</div><div class="text-sm mt-2 font-bold text-brand-700">${money(p.price)}</div></div>`).join('')}
          </div>
        </div>
        <div class="card card-pad">
          <div class="text-sm font-semibold mb-3">Cart · Walk-in</div>
          <div class="space-y-2 text-sm">
            <div class="flex justify-between"><span>RGB LED Headlight Kit</span><span>$189.00</span></div>
            <div class="flex justify-between"><span>Folding Side Mirror Pair</span><span>$35.00</span></div>
            <div class="flex justify-between text-slate-500"><span>Subtotal</span><span>$224.00</span></div>
            <div class="flex justify-between text-slate-500"><span>Tax</span><span>$18.48</span></div>
            <div class="flex justify-between text-base font-bold border-t pt-2"><span>Total</span><span>$242.48</span></div>
          </div>
          <button class="w-full mt-4 px-3 py-2 bg-brand-600 text-white rounded-lg font-medium text-sm">Charge card</button>
        </div>
      </div>
    `;
  }

  // ===== Payments =====
  function payments() {
    const rows = M.payments.map(p => `<tr>
      <td class="py-2 font-mono text-xs">${p.id}</td>
      <td>${p.date}</td>
      <td>${p.customer}</td>
      <td><span class="badge badge-gray">${p.type}</span></td>
      <td>${p.method}</td>
      <td class="text-right font-medium">${money(p.amount)}</td>
      <td><span class="badge ${p.status==='Paid'?'badge-green':'badge-blue'}">${p.status}</span></td>
    </tr>`).join('');
    return `
      ${pageHead('Payments', 'All payment activity across rentals, repairs, sales, and fleet invoices.')}
      <div class="card overflow-x-auto">
        <table class="min-w-full text-sm">
          <thead class="bg-slate-50 text-[11px] uppercase text-slate-500"><tr><th class="text-left px-4 py-2">ID</th><th class="text-left">Date</th><th class="text-left">Customer</th><th class="text-left">Type</th><th class="text-left">Method</th><th class="text-right">Amount</th><th class="text-left">Status</th></tr></thead>
          <tbody class="divide-y divide-slate-100">${rows}</tbody>
        </table>
      </div>
    `;
  }

  // ===== Custom Builds =====
  function builds() {
    return `
      ${pageHead('Custom Builds','6 active build sheets.', `<button class="px-3 py-2 text-sm bg-brand-600 text-white rounded-lg font-medium flex items-center gap-1.5"><i data-lucide="plus" class="w-4 h-4"></i> New build sheet</button>`)}
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        ${M.builds.map(b=>`
          <div class="card card-pad">
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs font-mono text-slate-500">${b.id}</span>
              <span class="badge ${b.status==='Delivered'?'badge-green':b.status==='Quoted'?'badge-gray':'badge-blue'}">${b.status}</span>
            </div>
            <div class="text-sm font-semibold">${b.customer}</div>
            <div class="text-xs text-slate-500 mb-3">${b.base}</div>
            <ul class="text-xs space-y-0.5 mb-3">${b.mods.map(m=>`<li>• ${m}</li>`).join('')}</ul>
            <div class="flex justify-between items-center"><span class="text-xs text-slate-500">Quoted</span><span class="text-base font-bold">${money(b.quote)}</span></div>
          </div>
        `).join('')}
      </div>
    `;
  }

  // ===== Fleet Accounts =====
  function fleetAccounts() {
    const rows = M.fleetAccounts.map(a=>`<tr>
      <td class="py-3 font-semibold">${a.name}</td>
      <td>${a.units}</td>
      <td>${money(a.monthly)}</td>
      <td>${a.contact}</td>
      <td>${a.nextService}</td>
      <td><button class="text-brand-700 text-xs font-medium">Open →</button></td>
    </tr>`).join('');
    return `
      ${pageHead('Fleet Accounts (B2B)', 'Resorts, HOAs, courses, and campgrounds.')}
      <div class="card overflow-x-auto"><table class="min-w-full text-sm">
        <thead class="bg-slate-50 text-[11px] uppercase text-slate-500"><tr><th class="text-left px-4 py-2">Account</th><th class="text-left">Units</th><th class="text-left">Monthly</th><th class="text-left">Primary contact</th><th class="text-left">Next service</th><th></th></tr></thead>
        <tbody class="divide-y divide-slate-100">${rows}</tbody>
      </table></div>
    `;
  }

  // ===== Storage =====
  function storage() {
    return sectionStub('Storage & Winterization', 'Off-season storage contracts and winterization service tracking.',
      `<div class="grid grid-cols-1 md:grid-cols-3 gap-3">
        ${[{label:'Active storage contracts',v:'34'},{label:'Winterizations scheduled',v:'12'},{label:'Revenue locked in',v:'$8,460'}].map(k=>`<div class="card card-pad"><div class="text-xs text-slate-500">${k.label}</div><div class="text-2xl font-bold mt-1">${k.v}</div></div>`).join('')}
      </div>
      <div class="mt-4 text-sm"><div class="font-semibold mb-2">Upcoming winterizations</div>
      <ul class="divide-y divide-slate-100">${['Hutchins · 2022 Onward','Vega · 2021 RXV','Brennan · 2020 Express','Boone · 2019 Drive2','Anders · 2023 Tempo'].map(s=>`<li class="py-2 flex justify-between"><span>${s}</span><span class="text-xs text-slate-500">Oct 14–18</span></li>`).join('')}</ul></div>`);
  }

  function preventive() {
    return sectionStub('Preventive Maintenance','Recurring service plans across all customer + fleet carts.',
      `<div class="grid grid-cols-1 md:grid-cols-4 gap-3">${[{l:'Plans active',v:'78'},{l:'Due this week',v:'9'},{l:'Overdue',v:'2'},{l:'Avg ticket',v:'$142'}].map(k=>`<div class="card card-pad"><div class="text-xs text-slate-500">${k.l}</div><div class="text-2xl font-bold mt-1">${k.v}</div></div>`).join('')}</div>
      <div class="mt-4 text-sm font-semibold mb-2">Due this week</div>
      <ul class="text-sm divide-y divide-slate-100">${['Cypress Trace · 12 carts · Jun 24','Hutchins · 2022 Onward · Jun 25','Pinecrest · 18 carts · Jun 28','Lake Ridge HOA · 6 carts · Jul 02'].map(s=>`<li class="py-2 flex justify-between"><span>${s}</span><span class="badge badge-blue">Scheduled</span></li>`).join('')}</ul>`);
  }

  function warranty() {
    const rows = M.warrantyEligible.map(w => `<tr>
      <td class="py-3 font-semibold">${w.customer}</td>
      <td>${w.cart}</td>
      <td>${w.oem}</td>
      <td class="font-mono text-xs">${w.vin}</td>
      <td>${w.inService}</td>
      <td class="text-xs">${w.coverage}</td>
    </tr>`).join('');
    return `
      ${pageHead('Warranty & Claims','OEM warranty lookup, claim drafts, and submission tracking.')}
      <div class="card card-pad mb-4" style="background:linear-gradient(135deg, rgba(139,92,246,.06), rgba(236,72,153,.04)); border-color: rgba(139,92,246,.20)">
        <div class="flex items-start gap-3">
          <div class="ai-badge mt-1"><i data-lucide="sparkles" class="w-3 h-3"></i> OEM Warranty Assistant</div>
          <div class="text-sm">
            <div class="font-semibold mb-1">Claim packet ready · WO-1042 (Dale Hutchins · Club Car Onward)</div>
            <div class="text-slate-600">Confirmed in-warranty for lithium pack. Drafted defect narrative, attached load test photos, assembled VIN + part # + labor. <strong>Ready to submit to Club Car portal.</strong></div>
          </div>
        </div>
      </div>
      <div class="card overflow-x-auto"><table class="min-w-full text-sm">
        <thead class="bg-slate-50 text-[11px] uppercase text-slate-500"><tr><th class="text-left px-4 py-2">Customer</th><th class="text-left">Cart</th><th class="text-left">OEM</th><th class="text-left">VIN</th><th class="text-left">In service</th><th class="text-left">Coverage</th></tr></thead>
        <tbody class="divide-y divide-slate-100">${rows}</tbody>
      </table></div>
    `;
  }

  function bookingPortal() {
    return `
      ${pageHead('Online Booking Portal','Customer-facing rental booking page.')}
      <div class="card card-pad" style="background:linear-gradient(135deg,#ecfdf5,#fff)">
        <div class="max-w-md mx-auto py-6">
          <div class="text-center mb-4">
            <div class="text-2xl font-bold">Rent at Lakeside</div>
            <div class="text-sm text-slate-500">Lake-day-ready golf carts. Book in 60 seconds.</div>
          </div>
          <div class="bg-white rounded-xl shadow border border-slate-200 p-4 space-y-3">
            <div><label class="text-xs text-slate-500">Pick-up</label><input value="Sat 10:00 AM" class="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"></div>
            <div><label class="text-xs text-slate-500">Return</label><input value="Sun 5:00 PM" class="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"></div>
            <div><label class="text-xs text-slate-500">Cart size</label><select class="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"><option>4-passenger</option><option>6-passenger</option><option>2-passenger</option></select></div>
            <button class="w-full px-3 py-2.5 bg-brand-600 text-white rounded-lg font-medium">See availability →</button>
          </div>
          <div class="text-center text-xs text-slate-400 mt-3">lakesidegolfcarts.com/rent</div>
        </div>
      </div>
    `;
  }

  function customerPortal() {
    return `
      ${pageHead('Customer Portal','What customers see when they log in.')}
      <div class="card card-pad">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="md:col-span-2">
            <div class="text-sm font-semibold mb-2">Hi Dale — here's what's going on</div>
            <div class="card card-pad bg-slate-50">
              <div class="text-xs text-slate-500 font-mono">WO-1042</div>
              <div class="text-sm font-semibold">2022 Club Car Onward — won't hold charge</div>
              <div class="stepper mt-3">${M.stages.map((s,i)=>`<span class="step ${i===1?'current':i<1?'done':''}">${s}</span>`).join('')}</div>
              <div class="text-xs mt-3 text-slate-600">Estimated total: <strong>$0.00</strong> (covered under warranty)</div>
              <div class="mt-3 flex gap-2"><button class="px-3 py-1.5 bg-brand-600 text-white text-xs rounded-lg">Approve estimate</button><button class="px-3 py-1.5 border border-slate-200 text-xs rounded-lg">Message shop</button></div>
            </div>
          </div>
          <div>
            <div class="text-sm font-semibold mb-2">Your carts</div>
            <ul class="text-sm space-y-1">${['2022 Club Car Onward','2017 E-Z-GO Workhorse'].map(c=>`<li class="p-2 border border-slate-200 rounded-lg">${c}</li>`).join('')}</ul>
          </div>
        </div>
      </div>
    `;
  }

  function notifications() {
    return `
      ${pageHead('Notifications','SMS and email sent on your behalf.')}
      <div class="card divide-y divide-slate-100">
        ${M.notifications.map(n=>`
          <div class="p-4 flex gap-3">
            <div class="w-9 h-9 rounded-full grid place-items-center ${n.type==='SMS'?'bg-blue-50':'bg-amber-50'}">
              <i data-lucide="${n.type==='SMS'?'message-circle':'mail'}" class="w-4 h-4 ${n.type==='SMS'?'text-blue-600':'text-amber-700'}"></i>
            </div>
            <div class="flex-1">
              <div class="flex justify-between items-baseline mb-0.5">
                <div class="text-sm font-semibold">${n.to} <span class="text-slate-400 font-normal">· ${n.subject}</span></div>
                <div class="text-xs text-slate-400">${n.time}</div>
              </div>
              <div class="text-sm text-slate-600">${n.body}</div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  function marketing() {
    const rows = M.campaigns.map(c=>`<tr><td class="py-3 font-semibold">${c.name}</td><td>${c.channel}</td><td>${c.audience}</td><td>${c.sent}</td><td>${c.open}</td><td>${c.conv}</td></tr>`).join('');
    return `
      ${pageHead('Marketing / Campaigns','Email + SMS to your customer base.')}
      <div class="card overflow-x-auto"><table class="min-w-full text-sm">
        <thead class="bg-slate-50 text-[11px] uppercase text-slate-500"><tr><th class="text-left px-4 py-2">Campaign</th><th class="text-left">Channel</th><th class="text-left">Audience</th><th class="text-left">Sent</th><th class="text-left">Open</th><th class="text-left">Conv</th></tr></thead>
        <tbody class="divide-y divide-slate-100">${rows}</tbody>
      </table></div>
    `;
  }

  function reviews() {
    const avg = (M.reviews.reduce((s,r)=>s+r.stars,0)/M.reviews.length).toFixed(1);
    return `
      ${pageHead('Reviews & Reputation','Your shop, in your customers\' words.')}
      <div class="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
        <div class="card card-pad"><div class="text-xs text-slate-500">Average rating</div><div class="text-2xl font-bold mt-1">${avg} ★</div></div>
        <div class="card card-pad"><div class="text-xs text-slate-500">Total reviews</div><div class="text-2xl font-bold mt-1">312</div></div>
        <div class="card card-pad"><div class="text-xs text-slate-500">Response rate</div><div class="text-2xl font-bold mt-1">96%</div></div>
        <div class="card card-pad"><div class="text-xs text-slate-500">Requests sent · MTD</div><div class="text-2xl font-bold mt-1">128</div></div>
      </div>
      <div class="card divide-y divide-slate-100">${M.reviews.map(r=>`
        <div class="p-4">
          <div class="flex justify-between mb-1"><div class="text-sm font-semibold">${r.author} <span class="text-xs text-slate-400 font-normal">· ${r.source}</span></div><div class="text-xs text-slate-400">${r.date}</div></div>
          <div class="text-amber-500 text-sm mb-1">${'★'.repeat(r.stars)}<span class="text-slate-200">${'★'.repeat(5-r.stars)}</span></div>
          <div class="text-sm text-slate-600">${r.text}</div>
        </div>`).join('')}</div>
    `;
  }

  function website() {
    return `
      ${pageHead('Website / Storefront','Public website managed inside Shop OS.')}
      <div class="card card-pad">
        <div class="rounded-lg border border-slate-200 overflow-hidden">
          <div class="bg-slate-100 h-8 flex items-center px-3 gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-red-400"></span><span class="w-2.5 h-2.5 rounded-full bg-amber-400"></span><span class="w-2.5 h-2.5 rounded-full bg-green-400"></span><span class="text-xs text-slate-500 ml-3">lakesidegolfcarts.com</span></div>
          <div class="p-8 bg-gradient-to-br from-brand-600 to-brand-800 text-white text-center">
            <div class="text-3xl font-bold mb-2">Lakeside Golf Carts</div>
            <div class="text-sm opacity-90 mb-5">Rent · Repair · Build · Sell — Onalaska, TX</div>
            <div class="flex justify-center gap-2"><button class="bg-white text-brand-700 px-4 py-2 rounded-lg text-sm font-semibold">Book a rental</button><button class="border border-white text-white px-4 py-2 rounded-lg text-sm">See our builds</button></div>
          </div>
          <div class="p-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div><div class="font-semibold mb-1">Daily rentals</div><div class="text-slate-500 text-xs">Insured, electric & gas, all sizes</div></div>
            <div><div class="font-semibold mb-1">Repair & service</div><div class="text-slate-500 text-xs">All major OEMs, warranty work</div></div>
            <div><div class="font-semibold mb-1">Custom builds</div><div class="text-slate-500 text-xs">Lifts, lithium, audio, wraps</div></div>
          </div>
        </div>
      </div>
    `;
  }

  function reporting() {
    return `
      ${pageHead('Reporting & Analytics','Daily, weekly, and monthly performance.')}
      <div class="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        ${[{l:'Revenue today',v:'$3,840',d:'7 transactions'},{l:'Avg repair ticket',v:'$418',d:'last 30 days'},{l:'Rental utilization',v:'66%',d:'fleet, last 60 days'}].map(k=>`<div class="card card-pad"><div class="text-xs text-slate-500">${k.l}</div><div class="text-2xl font-bold mt-1">${k.v}</div><div class="text-xs text-slate-400 mt-0.5">${k.d}</div></div>`).join('')}
      </div>
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div class="card card-pad"><div class="text-sm font-semibold mb-2">Revenue by department · MTD</div><canvas id="rptChart1" height="160"></canvas></div>
        <div class="card card-pad"><div class="text-sm font-semibold mb-2">Work orders closed · last 30 days</div><canvas id="rptChart2" height="160"></canvas></div>
      </div>
    `;
  }

  function reportingAfter() {
    const c1 = document.getElementById('rptChart1');
    if (c1) new Chart(c1, { type:'bar', data:{ labels:['Repair','Rentals','Sales','Builds','Parts'], datasets:[{ data:[17200,14400,11800,8200,5520], backgroundColor:'#10b981'}]}, options:{plugins:{legend:{display:false}}}});
    const c2 = document.getElementById('rptChart2');
    if (c2) new Chart(c2, { type:'line', data:{ labels:['W1','W2','W3','W4'], datasets:[{ data:[22,31,28,34], borderColor:'#0ea5e9', backgroundColor:'rgba(14,165,233,.12)', tension:.35, fill:true}]}, options:{plugins:{legend:{display:false}}}});
  }

  function accounting() {
    return sectionStub('Accounting Export','One-click exports to QuickBooks Online & Xero.',
      `<div class="space-y-2">${['QuickBooks Online — Connected','Xero — Disconnected','Stripe payouts — Auto-reconciled','Sales tax (TX) — On'].map(r=>`<div class="flex justify-between p-3 border border-slate-200 rounded-lg text-sm"><span>${r}</span><span class="text-xs text-brand-700 font-medium">Configure</span></div>`).join('')}</div>
      <div class="mt-4 flex gap-2"><button class="px-3 py-2 text-sm bg-brand-600 text-white rounded-lg font-medium">Export June journal</button><button class="px-3 py-2 text-sm border border-slate-200 rounded-lg">Download CSV</button></div>`);
  }

  function purchasing() {
    const rows = M.purchasing.map(p=>`<tr><td class="py-3 font-mono text-xs">${p.po}</td><td>${p.vendor}</td><td>${p.items}</td><td class="text-right font-semibold">${money(p.total)}</td><td><span class="badge ${p.status.includes('Received')?'badge-green':'badge-amber'}">${p.status}</span></td></tr>`).join('');
    return `
      ${pageHead('Purchasing & Vendors','Open POs and vendor scorecards.')}
      <div class="card overflow-x-auto"><table class="min-w-full text-sm">
        <thead class="bg-slate-50 text-[11px] uppercase text-slate-500"><tr><th class="text-left px-4 py-2">PO</th><th class="text-left">Vendor</th><th class="text-left">Items</th><th class="text-right">Total</th><th class="text-left">Status</th></tr></thead>
        <tbody class="divide-y divide-slate-100">${rows}</tbody>
      </table></div>
    `;
  }

  function staff() {
    const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
    return `
      ${pageHead('Staff & Scheduling','This week\'s shift grid.')}
      <div class="card overflow-x-auto"><table class="min-w-full text-sm">
        <thead class="bg-slate-50 text-[11px] uppercase text-slate-500"><tr><th class="text-left px-4 py-2">Person</th>${days.map(d=>`<th class="text-left">${d}</th>`).join('')}</tr></thead>
        <tbody class="divide-y divide-slate-100">${M.staffShifts.map(s=>`<tr><td class="py-3"><div class="font-semibold">${s.name}</div><div class="text-xs text-slate-500">${s.role}</div></td>${s.shifts.map(sh=>`<td class="text-xs">${sh==='off'||sh==='—'?`<span class="text-slate-300">${sh}</span>`:`<span class="badge badge-green">${sh}</span>`}</td>`).join('')}</tr>`).join('')}</tbody>
      </table></div>
    `;
  }

  // ===== Custom AI Modules =====
  function aiModules() {
    const modules = [
      { id:'advisor', icon:'stethoscope', title:'AI Service Advisor', desc:'Tech enters a symptom; AI returns likely cause, parts, and quote — trained on your shop\'s repair history.' },
      { id:'quoter', icon:'calculator', title:'AI Build Quoter', desc:'Spec a custom build in plain English; AI itemizes parts, labor, margin, and build time.' },
      { id:'intake', icon:'phone', title:'AI Intake Agent', desc:'Answers your phone after hours, books rentals, takes drop-off appointments, escalates emergencies.' },
      { id:'predict', icon:'activity', title:'Fleet Failure Predictor', desc:'Watches your B2B fleet telemetry; flags carts likely to fail in the next 14 days.' },
      { id:'partsid', icon:'scan-line', title:'AI Parts ID', desc:'Snap a photo of a part; AI identifies SKU, OEM, and cross-references your inventory.' },
      { id:'optimizer', icon:'trending-up', title:'Demand & Price Optimizer', desc:'Recommends rental pricing day-by-day based on local demand, weather, and competitor rates.' }
    ];
    return `
      ${pageHead('Custom AI Modules', 'AI that works on <strong>your shop\'s data</strong> — not generic chatbots.', `<span class="ai-badge"><i data-lucide="sparkles" class="w-3 h-3"></i> All modules active</span>`)}
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" data-tour="ai-grid">
        ${modules.map(m=>`
          <div class="card card-pad" style="background:linear-gradient(135deg, rgba(139,92,246,.05), rgba(236,72,153,.03)); border-color:rgba(139,92,246,.20)">
            <div class="w-10 h-10 rounded-lg grid place-items-center mb-3" style="background:linear-gradient(135deg,#8b5cf6,#ec4899)"><i data-lucide="${m.icon}" class="w-5 h-5 text-white"></i></div>
            <div class="font-semibold mb-1">${m.title}</div>
            <div class="text-xs text-slate-600 mb-4 leading-relaxed">${m.desc}</div>
            <button data-try="${m.id}" class="text-xs font-medium px-3 py-1.5 rounded-lg text-white" style="background:linear-gradient(135deg,#8b5cf6,#ec4899)">Try it →</button>
          </div>
        `).join('')}
      </div>
      <div id="ai-try-panel" class="mt-5"></div>
    `;
  }

  function aiModulesAfter() {
    document.querySelectorAll('[data-try]').forEach(b => b.addEventListener('click', () => runAITry(b.dataset.try)));
  }

  function runAITry(id) {
    const panel = document.getElementById('ai-try-panel');
    if (id === 'advisor') {
      panel.innerHTML = `
        <div class="card card-pad" style="background:linear-gradient(135deg, rgba(139,92,246,.04), rgba(236,72,153,.02));">
          <div class="text-sm font-semibold mb-3">AI Service Advisor</div>
          <label class="text-xs text-slate-500">Symptom</label>
          <select id="ai-sym" class="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm mb-3">
            <option value="wont-charge">Cart won't hold a charge</option>
            <option value="pulls-left">Cart pulls left</option>
            <option value="no-start">Cart won't start</option>
            <option value="flicker-lights">Headlights flicker</option>
          </select>
          <button id="ai-go" class="px-3 py-2 text-white rounded-lg text-sm font-medium" style="background:linear-gradient(135deg,#8b5cf6,#ec4899)">Diagnose</button>
          <div id="ai-out" class="mt-4"></div>
        </div>`;
      document.getElementById('ai-go').addEventListener('click', () => {
        const k = document.getElementById('ai-sym').value;
        const out = document.getElementById('ai-out');
        out.innerHTML = '<div class="ai-bubble"><div id="ai-stream2"></div></div>';
        typewriterLines(document.getElementById('ai-stream2'), M.aiResponses[k], 14);
      });
    } else if (id === 'quoter') {
      panel.innerHTML = `<div class="card card-pad"><div class="text-sm font-semibold mb-3">AI Build Quoter</div>
        <input value="2024 Club Car Onward 4-passenger, lifted, with audio and lights" class="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm mb-3">
        <button id="bq-go" class="px-3 py-2 text-white rounded-lg text-sm font-medium" style="background:linear-gradient(135deg,#8b5cf6,#ec4899)">Quote it</button>
        <div id="bq-out" class="mt-4"></div></div>`;
      document.getElementById('bq-go').addEventListener('click', () => {
        document.getElementById('bq-out').innerHTML = '<div class="ai-bubble"><div id="bq-stream"></div></div>';
        typewriterLines(document.getElementById('bq-stream'), M.buildQuoter, 12);
      });
    } else {
      panel.innerHTML = `<div class="card card-pad text-sm"><div class="ai-badge mb-2"><i data-lucide="sparkles" class="w-3 h-3"></i> Live demo</div><div class="text-slate-600">This module is fully active in your account. A live walk-through is available in your onboarding.</div></div>`;
      if (window.lucide) lucide.createIcons();
    }
    panel.scrollIntoView({behavior:'smooth', block:'nearest'});
  }

  // ===== Toast =====
  function toast(msg, kind='') {
    const t = el(`<div class="toast ${kind}"><i data-lucide="${kind==='sms'?'message-circle':kind==='success'?'check-circle':'info'}" class="w-4 h-4"></i><span>${msg}</span></div>`);
    document.getElementById('toast-wrap').appendChild(t);
    if (window.lucide) lucide.createIcons();
    setTimeout(()=> t.style.opacity = '0', 4200);
    setTimeout(()=> t.remove(), 4800);
  }

  return {
    dashboard, dashboardAfter,
    repair, openWorkOrder,
    rentals, rentalsAfter, openReservationFlow,
    parts, sales, pos, payments, builds, fleetAccounts, storage, preventive, warranty,
    bookingPortal, customerPortal, notifications, marketing, reviews, website,
    reporting, reportingAfter, accounting, purchasing, staff,
    aiModules, aiModulesAfter,
    toast, runAIAdvisor
  };
})();
