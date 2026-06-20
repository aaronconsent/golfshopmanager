// Router, sidebar, top-bar, init
(function(){
  const NAV = [
    { group:'Core', items:[
      { id:'', label:'Dashboard', icon:'layout-dashboard' },
      { id:'repair', label:'Repair & Service', icon:'wrench' },
      { id:'rentals', label:'Rentals', icon:'car' },
      { id:'parts', label:'Parts & Inventory', icon:'package' },
      { id:'sales', label:'Sales (New & Used)', icon:'tag' },
      { id:'pos', label:'Point of Sale', icon:'shopping-cart' },
      { id:'payments', label:'Payments', icon:'credit-card' },
    ]},
    { group:'Revenue', items:[
      { id:'builds', label:'Custom Builds', icon:'hammer' },
      { id:'fleet', label:'Fleet Accounts', icon:'building-2' },
      { id:'storage', label:'Storage & Winterization', icon:'snowflake' },
      { id:'preventive', label:'Preventive Maintenance', icon:'calendar-check' },
      { id:'warranty', label:'Warranty & Claims', icon:'shield-check' },
    ]},
    { group:'Growth', items:[
      { id:'booking', label:'Online Booking Portal', icon:'globe' },
      { id:'portal', label:'Customer Portal', icon:'user-circle' },
      { id:'notifications', label:'Notifications', icon:'bell' },
      { id:'marketing', label:'Marketing / Campaigns', icon:'megaphone' },
      { id:'reviews', label:'Reviews & Reputation', icon:'star' },
      { id:'website', label:'Website / Storefront', icon:'monitor' },
    ]},
    { group:'Back office', items:[
      { id:'reporting', label:'Reporting & Analytics', icon:'bar-chart-3' },
      { id:'accounting', label:'Accounting Export', icon:'book-open' },
      { id:'purchasing', label:'Purchasing & Vendors', icon:'truck' },
      { id:'staff', label:'Staff & Scheduling', icon:'users' },
    ]},
    { group:'AI', items:[
      { id:'ai', label:'✨ Custom AI Modules', icon:'sparkles', ai:true },
    ]},
  ];

  function buildNav(active) {
    const nav = document.getElementById('nav');
    nav.innerHTML = NAV.map(g => `
      <div class="nav-group-title">${g.group}</div>
      ${g.items.map(it => `
        <a href="#/${it.id}" class="nav-link ${it.ai?'ai':''} ${('#/'+it.id)===active?'active':''}">
          <i data-lucide="${it.icon}"></i><span>${it.label}</span>
        </a>
      `).join('')}
    `).join('');
    lucide.createIcons();
  }

  const ROUTES = {
    '#/':           { render:()=>SCREENS.dashboard(),    after:()=>SCREENS.dashboardAfter() },
    '#/repair':     { render:()=>SCREENS.repair(),       after:repairAfter },
    '#/rentals':    { render:()=>SCREENS.rentals(),      after:()=>SCREENS.rentalsAfter() },
    '#/parts':      { render:()=>SCREENS.parts() },
    '#/sales':      { render:()=>SCREENS.sales() },
    '#/pos':        { render:()=>SCREENS.pos() },
    '#/payments':   { render:()=>SCREENS.payments() },
    '#/builds':     { render:()=>SCREENS.builds() },
    '#/fleet':      { render:()=>SCREENS.fleetAccounts() },
    '#/storage':    { render:()=>SCREENS.storage() },
    '#/preventive': { render:()=>SCREENS.preventive() },
    '#/warranty':   { render:()=>SCREENS.warranty() },
    '#/booking':    { render:()=>SCREENS.bookingPortal() },
    '#/portal':     { render:()=>SCREENS.customerPortal() },
    '#/notifications':{ render:()=>SCREENS.notifications() },
    '#/marketing':  { render:()=>SCREENS.marketing() },
    '#/reviews':    { render:()=>SCREENS.reviews() },
    '#/website':    { render:()=>SCREENS.website() },
    '#/reporting':  { render:()=>SCREENS.reporting(), after:()=>SCREENS.reportingAfter() },
    '#/accounting': { render:()=>SCREENS.accounting() },
    '#/purchasing': { render:()=>SCREENS.purchasing() },
    '#/staff':      { render:()=>SCREENS.staff() },
    '#/ai':         { render:()=>SCREENS.aiModules(), after:()=>SCREENS.aiModulesAfter() },
  };

  function repairAfter() {
    document.querySelectorAll('[data-wo]').forEach(c => c.addEventListener('click', () => SCREENS.openWorkOrder(c.dataset.wo)));
    const dbtn = document.getElementById('see-repair-demo');
    if (dbtn) dbtn.addEventListener('click', () => window.TOUR.repairTour());
  }

  function render() {
    const hash = location.hash || '#/';
    const r = ROUTES[hash] || ROUTES['#/'];
    const screen = document.getElementById('screen');
    screen.innerHTML = r.render();
    buildNav(hash);
    if (window.lucide) lucide.createIcons();
    if (r.after) try { r.after(); } catch(e){ console.error(e); }
    window.scrollTo(0,0);
  }

  window.app = { render };

  window.addEventListener('hashchange', render);
  document.addEventListener('DOMContentLoaded', () => {
    render();
    initRoleMenu();
    initWelcome();
    document.getElementById('replay-btn').addEventListener('click', () => window.TOUR.dayTour());
  });

  function initRoleMenu() {
    const btn = document.getElementById('role-btn');
    const menu = document.getElementById('role-menu');
    const roles = [
      { name:'Jess Tully', role:'Owner', initials:'JT', color:'#059669' },
      { name:'Riley Kim', role:'Front Desk', initials:'RK', color:'#0ea5e9' },
      { name:'Marcus Reed', role:'Technician', initials:'MR', color:'#8b5cf6' },
    ];
    menu.insertAdjacentHTML('beforeend', roles.map(r => `
      <button data-role="${r.role}" class="w-full flex items-center gap-3 px-3 py-2 hover:bg-slate-50 text-left">
        <span class="w-7 h-7 rounded-full text-white text-xs grid place-items-center font-semibold" style="background:${r.color}">${r.initials}</span>
        <span><span class="text-sm font-medium block leading-tight">${r.name}</span><span class="text-xs text-slate-500">${r.role}</span></span>
      </button>`).join(''));

    btn.addEventListener('click', e => { e.stopPropagation(); menu.classList.toggle('hidden'); });
    document.addEventListener('click', () => menu.classList.add('hidden'));
    menu.querySelectorAll('[data-role]').forEach(b => b.addEventListener('click', () => {
      window.TOUR.setRole(b.dataset.role);
      menu.classList.add('hidden');
    }));
  }

  function initWelcome() {
    const done = (()=>{ try { return localStorage.getItem('lakeside.tour.day.done'); } catch(_){ return null; }})();
    const w = document.getElementById('welcome');
    if (!done) w.classList.remove('hidden');
    document.getElementById('welcome-skip').addEventListener('click', () => { w.classList.add('hidden'); try { localStorage.setItem('lakeside.tour.day.done','1'); } catch(_){} });
    document.getElementById('welcome-start').addEventListener('click', () => { w.classList.add('hidden'); window.TOUR.dayTour(); });
  }
})();
