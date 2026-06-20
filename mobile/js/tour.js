// Mobile guided tour — custom in-frame spotlight + tooltip.
// Positions everything inside the phone screen so it lines up on desktop and phone.
window.TOUR = (function(){

  // ------------ Step script ------------
  // Each step:
  //   tab:        which tab to switch to before showing
  //   pre:        action to run after the tab/screen renders, before highlighting
  //   sel:        CSS selector inside the phone screen to highlight; '' = no spotlight, centered tooltip
  //   inOverlay:  if true, target lives inside an .overlay element (so we scroll that, not the main screen)
  //   time:       small chip ("7:50 AM") shown on the tooltip
  //   role:       Technician / Front Desk chip
  //   title:      bold title line
  //   body:       1–2 sentences

  const steps = [
    { tab:'home', sel:'[data-tour="home-timer"]',
      time:'7:50 AM', role:'Technician',
      title:'Everything assigned to you',
      body:'Clock in and your active job is right here — the labor timer\'s already running.' },

    { tab:'home', sel:'[data-tour="home-jobs"]',
      time:'7:55 AM', role:'Technician',
      title:'Your jobs for the day',
      body:'A clean list of just what\'s yours, with cart, customer, status, and how long it\'s been in stage.' },

    { tab:'scan', sel:'#scan-license',
      time:'8:10 AM', role:'Front Desk',
      title:'Scan a license, skip the typing',
      body:'New customer drop-off? Scan their license. Name, address, vehicle — autofilled in two seconds.' },

    { tab:'jobs', sel:'[data-tour="jobs-list"]',
      time:'8:30 AM', role:'Technician',
      title:'Pick up a job',
      body:'Tap any work order to open it. We\'ll dive into the Onward that won\'t hold a charge.' },

    { tab:'jobs',
      pre: () => mobileApp.openJob('WO-1042'),
      inOverlay:true,
      sel:'[data-tour-job="timer"]',
      time:'8:32 AM', role:'Technician',
      title:'Start the labor timer',
      body:'Tap Start and every minute is captured against this job — no clipboard, no math at the end of the day.' },

    { tab:'jobs', inOverlay:true,
      sel:'[data-tour-job="ai"]',
      pre: () => {
        const w = MOCK.workOrders.find(x=>x.id==='WO-1042');
        if (w) setTimeout(() => mobileApp.runAIAdvisor(w), 100);
      },
      time:'8:35 AM', role:'Technician',
      title:'AI Service Advisor',
      body:'Not sure what\'s wrong? Pick the symptom — likely cause, parts to pull, and a quote, instantly.' },

    { tab:'jobs', inOverlay:true,
      sel:'[data-tour-job="stepper"]',
      time:'8:40 AM', role:'Technician',
      title:'Move the job forward',
      body:'Tap a stage to advance. Slide it to Ready and the customer text fires automatically.' },

    { tab:'jobs', inOverlay:true,
      sel:'[data-tour-job="actions"]',
      time:'9:05 AM', role:'Front Desk',
      title:'Customer in the loop',
      body:'Estimate, approval, ready — every text fires from right here. You never pick up a phone to call.' },

    { tab:'home',
      pre: () => document.querySelector('.overlay')?.remove(),
      sel:'',
      time:'End of day', role:'Technician',
      title:'The whole shop in your pocket',
      body:'This is Golf Cart Shop OS on the bay floor. Replay the tour anytime from More → Replay app tour.' },
  ];

  let idx = 0;
  let mounted = false;

  function getScreen() { return document.getElementById('phone-screen'); }
  function getMount() {
    let m = document.getElementById('tour-mount');
    if (!m) {
      m = document.createElement('div');
      m.id = 'tour-mount';
      getScreen().appendChild(m);
    }
    return m;
  }

  function start() {
    mounted = true;
    idx = 0;
    showStep(0);
  }

  function end() {
    mounted = false;
    const m = document.getElementById('tour-mount');
    if (m) m.remove();
    try { localStorage.setItem('lakeside.mobile.tour.done','1'); } catch(_){}
  }

  // Make sure the target is in view inside its scrolling container.
  function scrollIntoFrame(target, inOverlay) {
    const container = inOverlay
      ? document.querySelector('.overlay .overlay-body')
      : document.getElementById('screen');
    if (!container || !target) return;
    const ctRect = container.getBoundingClientRect();
    const tRect  = target.getBoundingClientRect();
    // We want the target roughly centered vertically in the container, but biased
    // upward so the tooltip below has room.
    const desired = tRect.top - ctRect.top + container.scrollTop - 80;
    container.scrollTo({ top: Math.max(0, desired), behavior: 'smooth' });
  }

  function renderPopover(step, target) {
    const m = getMount();
    m.innerHTML = '';

    const backdrop = document.createElement('div');
    backdrop.className = 'tour-backdrop';
    m.appendChild(backdrop);

    // Spotlight ring (only when there's a target)
    let ring = null;
    if (target) {
      const screen = getScreen();
      const sRect = screen.getBoundingClientRect();
      const t = target.getBoundingClientRect();

      const pad = 6;
      const top  = t.top - sRect.top - pad;
      const left = t.left - sRect.left - pad;
      const w    = t.width + pad * 2;
      const h    = t.height + pad * 2;

      // Punch a hole in the backdrop using clip-path
      // (rect + cutout via evenodd polygon)
      const x1 = Math.max(0, left), y1 = Math.max(0, top);
      const x2 = Math.min(sRect.width, left + w), y2 = Math.min(sRect.height, top + h);
      backdrop.style.clipPath = `polygon(
        0 0, 100% 0, 100% 100%, 0 100%, 0 0,
        ${x1}px ${y1}px, ${x1}px ${y2}px, ${x2}px ${y2}px, ${x2}px ${y1}px, ${x1}px ${y1}px
      )`;

      ring = document.createElement('div');
      ring.className = 'tour-ring';
      ring.style.top  = top  + 'px';
      ring.style.left = left + 'px';
      ring.style.width  = w + 'px';
      ring.style.height = h + 'px';
      m.appendChild(ring);
    }

    // Tooltip
    const pop = document.createElement('div');
    pop.className = 'tour-pop';
    const total = steps.length;
    const dots = Array.from({length: total}, (_,i) => `<span class="tour-dot ${i===idx?'active':''}"></span>`).join('');
    pop.innerHTML = `
      <button class="tour-close" aria-label="Close">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
      </button>
      <div class="tour-meta">
        ${step.time ? `<span class="tour-tag time">${step.time}</span>` : ''}
        ${step.role ? `<span class="tour-tag role">${step.role}</span>` : ''}
      </div>
      <div class="tour-title">${step.title}</div>
      <div class="tour-body">${step.body}</div>
      <div class="tour-actions">
        <div class="tour-dots">${dots}</div>
        <div class="flex items-center">
          ${idx > 0 ? `<button class="tour-btn ghost" data-prev>Back</button>` : ''}
          <button class="tour-btn primary" data-next>${idx === total - 1 ? 'Finish' : 'Next →'}</button>
        </div>
      </div>
    `;
    m.appendChild(pop);

    // Position tooltip relative to the phone screen.
    const screen = getScreen();
    const sRect = screen.getBoundingClientRect();
    pop.style.visibility = 'hidden';
    requestAnimationFrame(() => {
      const popRect = pop.getBoundingClientRect();
      const popH = popRect.height, popW = popRect.width;
      const margin = 12;
      const tabbarH = 90;

      let top, left;
      if (target) {
        const t = target.getBoundingClientRect();
        const tTopInFrame = t.top - sRect.top;
        const tBottomInFrame = t.bottom - sRect.top;
        const spaceBelow = sRect.height - tBottomInFrame - tabbarH - margin;
        const spaceAbove = tTopInFrame - margin - 40; // 40 = status bar
        if (spaceBelow >= popH) {
          top = tBottomInFrame + 12;
        } else if (spaceAbove >= popH) {
          top = tTopInFrame - popH - 12;
        } else {
          // not enough room either way — float over the bottom area above tabbar
          top = sRect.height - tabbarH - popH - margin;
        }
        // Horizontal — center on target, clamped
        left = (t.left + t.width/2 - sRect.left) - popW/2;
      } else {
        // No target: center
        top = (sRect.height - popH) / 2 - 20;
        left = (sRect.width - popW) / 2;
      }
      left = Math.max(margin, Math.min(left, sRect.width - popW - margin));
      top  = Math.max(50, Math.min(top, sRect.height - popH - tabbarH - margin));

      pop.style.top = top + 'px';
      pop.style.left = left + 'px';
      pop.style.visibility = 'visible';
    });

    // Wire up buttons
    pop.querySelector('[data-next]').addEventListener('click', () => {
      if (idx >= steps.length - 1) end();
      else showStep(idx + 1);
    });
    const prev = pop.querySelector('[data-prev]');
    if (prev) prev.addEventListener('click', () => showStep(idx - 1));
    pop.querySelector('.tour-close').addEventListener('click', end);

    // Backdrop click = next (feels natural on phone)
    backdrop.addEventListener('click', () => {
      if (idx >= steps.length - 1) end();
      else showStep(idx + 1);
    });
  }

  function showStep(i) {
    idx = i;
    const step = steps[i];

    // If switching tabs (or just need a clean overlay)
    const needsTabSwitch = step.tab && (window.__currentTab !== step.tab);

    const proceed = () => {
      // Close any lingering overlay if this step doesn't use one
      if (!step.inOverlay && document.querySelector('.overlay')) {
        document.querySelector('.overlay').remove();
      }
      // Run pre-action (open job, trigger AI, etc.)
      if (step.pre) {
        try { step.pre(); } catch(e) { console.error(e); }
      }

      // Wait for DOM, then highlight
      const wait = step.pre ? 320 : 120;
      setTimeout(() => {
        const target = step.sel ? document.querySelector(step.sel) : null;
        if (target) scrollIntoFrame(target, step.inOverlay);
        // Allow scroll to settle before measuring
        setTimeout(() => renderPopover(step, step.sel ? document.querySelector(step.sel) : null), 320);
      }, wait);
    };

    if (needsTabSwitch) {
      mobileApp.setTab(step.tab);
      window.__currentTab = step.tab;
      setTimeout(proceed, 220);
    } else {
      proceed();
    }
  }

  // Keep window.__currentTab in sync if user navigates manually
  document.addEventListener('click', (e) => {
    const t = e.target.closest('[data-tab]');
    if (t) window.__currentTab = t.dataset.tab;
  }, true);

  // Reposition on resize / orientation change
  window.addEventListener('resize', () => {
    if (mounted) {
      const step = steps[idx];
      const target = step.sel ? document.querySelector(step.sel) : null;
      renderPopover(step, target);
    }
  });

  return { start, end };
})();
