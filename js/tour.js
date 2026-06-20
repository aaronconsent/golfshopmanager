// Guided tours: typical day + one-repair-start-to-finish
window.TOUR = (function(){

  function setRole(role) {
    const map = {
      Owner: { name:'Jess Tully', initials:'JT', color:'#059669' },
      'Front Desk': { name:'Riley Kim', initials:'RK', color:'#0ea5e9' },
      Technician: { name:'Marcus Reed', initials:'MR', color:'#8b5cf6' },
    };
    const r = map[role] || map.Owner;
    const av = document.getElementById('role-avatar');
    av.style.background = r.color;
    av.textContent = r.initials;
    document.getElementById('role-name').textContent = r.name;
    document.getElementById('role-title').textContent = role;
  }

  function nav(hash, after) {
    if (location.hash === hash) {
      setTimeout(after || (()=>{}), 50);
    } else {
      window.addEventListener('hashchange', function _h(){
        window.removeEventListener('hashchange', _h);
        setTimeout(after || (()=>{}), 120);
      });
      location.hash = hash;
    }
  }

  // Wrap step description with chip + role
  const tip = (time, role, body) => `<span class="tour-chip">${time}</span><span class="role-chip">${role}</span><div class="mt-2">${body}</div>`;

  function dayTour() {
    if (!window.driver) { alert('Tour engine not loaded'); return; }
    const D = window.driver.js.driver;
    const steps = [
      { role:'Owner', hash:'#/', element:'#kpi-row',
        popover:{ title:'7:30 AM — Open the shop', description: tip('7:30 AM','Owner','You open the shop and see the whole day at a glance: today\'s rentals going out, carts in the bay, money coming in, parts running low.') } },
      { role:'Front Desk', hash:'#/rentals', element:'[data-tour="rental-fleet"]',
        popover:{ title:'8:00 AM — Family picks up a cart', description: tip('8:00 AM','Front Desk','A reserved cart goes out — waiver, deposit hold, keys. Done in under a minute. No paper, no double-booking.') } },
      { role:'Front Desk', hash:'#/repair', element:'[data-tour="kanban"]',
        popover:{ title:'9:15 AM — Drop-off, "won\'t hold a charge"', description: tip('9:15 AM','Front Desk','A customer drops off their cart. Every drop-off becomes a tracked ticket the second it rolls in.') } },
      { role:'Technician', hash:'#/repair', element:'[data-tour="kanban"]', preAction: openAIInsideWO,
        popover:{ title:'9:20 AM — AI diagnoses the issue', description: tip('9:20 AM','Technician','Tech opens the ticket and runs the AI Service Advisor. Symptom in → likely cause, parts to pull, and a quote out. New hires diagnose like veterans.') } },
      { role:'Technician', hash:'#/parts', element:'[data-tour="parts-table"]',
        popover:{ title:'9:30 AM — Pull the part', description: tip('9:30 AM','Technician','Recommended part comes off the shelf; stock decrements; low-stock items flag for reorder automatically.') } },
      { role:'Front Desk', hash:'#/notifications',
        popover:{ title:'11:00 AM — Customer hears from you', description: tip('11:00 AM','Front Desk','The estimate text fires automatically — no one has to remember to call.') } },
      { role:'Owner', hash:'#/fleet',
        popover:{ title:'1:00 PM — Big account check-in', description: tip('1:00 PM','Owner','Your resort, HOA, and course accounts — recurring service, fleet invoices, all in one place.') } },
      { role:'Front Desk', hash:'#/builds',
        popover:{ title:'2:30 PM — Walk-in wants a custom build', description: tip('2:30 PM','Front Desk','A walk-in wants a lifted cart with audio. Build sheet, quote, deposit — no leaving the system.') } },
      { role:'Front Desk', hash:'#/rentals',
        popover:{ title:'4:30 PM — Rental returns', description: tip('4:30 PM','Front Desk','Cart\'s back. Quick inspection, deposit released, ready to rent again.') } },
      { role:'Owner', hash:'#/reporting',
        popover:{ title:'5:30 PM — Close the day on the numbers', description: tip('5:30 PM','Owner','Revenue, rentals, repairs, what\'s booked tomorrow. End the day knowing exactly what came in — and what\'s lined up next.') } },
    ];

    const driverObj = D({
      showProgress: true,
      progressText: 'Step {{current}} of {{total}}',
      nextBtnText: 'Next →',
      prevBtnText: '← Back',
      doneBtnText: 'Finish the day',
      allowClose: true,
      steps: steps.map(s => ({
        element: s.element || 'body',
        popover: s.popover,
        onHighlightStarted: () => {
          setRole(s.role);
          if (s.preAction) s.preAction();
        }
      }))
    });

    // Custom: navigate when stepping
    let i = -1;
    function go(idx){
      i = idx;
      const s = steps[idx];
      nav(s.hash, () => {
        if (s.preAction) s.preAction();
        // small delay so DOM exists
        setTimeout(()=> {
          if (driverObj.isActive && driverObj.isActive()) {
            driverObj.moveTo(idx);
          } else {
            driverObj.drive(idx);
          }
        }, 60);
      });
    }
    go(0);

    // hook driver's nav buttons to also navigate routes
    setTimeout(()=> {
      document.addEventListener('click', dayClickShim, true);
    }, 100);

    function dayClickShim(e) {
      if (!driverObj.isActive || !driverObj.isActive()) {
        document.removeEventListener('click', dayClickShim, true);
        try { localStorage.setItem('lakeside.tour.day.done','1'); } catch(_){}
        return;
      }
      const t = e.target.closest('.driver-popover-next-btn, .driver-popover-prev-btn, .driver-popover-close-btn');
      if (!t) return;
      if (t.classList.contains('driver-popover-close-btn')) {
        try { localStorage.setItem('lakeside.tour.day.done','1'); } catch(_){}
        document.removeEventListener('click', dayClickShim, true);
        return;
      }
      const delta = t.classList.contains('driver-popover-next-btn') ? 1 : -1;
      const next = i + delta;
      if (next >= 0 && next < steps.length) {
        e.preventDefault(); e.stopPropagation();
        go(next);
      } else if (next >= steps.length) {
        try { localStorage.setItem('lakeside.tour.day.done','1'); } catch(_){}
        document.removeEventListener('click', dayClickShim, true);
      }
    }
  }

  function openAIInsideWO() {
    // Open WO-1042 and trigger the AI advisor
    if (location.hash.indexOf('/repair') === -1) return;
    setTimeout(() => {
      const card = document.querySelector('[data-wo="WO-1042"]');
      if (!card) return;
      window.SCREENS.openWorkOrder('WO-1042');
      setTimeout(() => {
        const btn = document.querySelector('[data-ai-advisor]');
        if (btn) btn.click();
      }, 200);
    }, 80);
  }

  // ===== One Repair Start to Finish =====
  function repairTour() {
    if (!window.driver) return;
    const D = window.driver.js.driver;
    const wo = window.MOCK.workOrders.find(w => w.id === 'WO-1042');
    if (!wo) return;
    // Ensure on repair screen
    nav('#/repair', () => {
      const steps = [
        { stage:'Checked In', role:'Front Desk', title:'1 · Checked In', body:'Dale drops off his Club Car Onward — "won\'t hold a charge." Work order created. (On mobile, this is a license scan + photo.)' },
        { stage:'Diagnosing', role:'Front Desk', title:'2 · Assigned', body:'Job assigned to Marcus via the avatar picker. His workload updates in real time.' },
        { stage:'Diagnosing', role:'Technician', title:'3 · Diagnosing', body:'Marcus opens the ticket, runs the AI Service Advisor — likely failing lithium pack, parts pulled, labor estimated. Photos added.', preAction:()=>{ window.SCREENS.openWorkOrder('WO-1042'); setTimeout(()=>{ const b=document.querySelector('[data-ai-advisor]'); if(b) b.click(); }, 200); } },
        { stage:'Awaiting Approval', role:'Front Desk', title:'4 · Awaiting Approval', body:'Estimate texted to Dale. He replies APPROVED ✓.', preAction:()=>{ document.querySelector('#modal-mount').innerHTML=''; window.SCREENS.toast('📱 Sent to Dale: "Estimate $1,245. Reply YES to approve." → Approved ✓','sms'); } },
        { stage:'Awaiting Parts', role:'Technician', title:'5 · Awaiting Parts', body:'72V Lithium Pack flagged for reorder, PO sent, marked received.' },
        { stage:'In Progress', role:'Technician', title:'6 · In Progress', body:'Labor timer runs; parts consumed; running total builds.' },
        { stage:'In Progress', role:'Owner', title:'7 · Warranty check', body:'Cart is in-warranty (Club Car lithium 5yr). OEM Warranty Assistant confirms coverage, drafts the defect narrative, assembles the claim packet — ready to file.', preAction:()=>{ nav('#/warranty'); } },
        { stage:'Ready for Pickup', role:'Front Desk', title:'8 · Ready for Pickup', body:'Auto-text fires, invoice generated, payment captured.', preAction:()=>{ nav('#/repair', ()=> window.SCREENS.toast('📱 To Dale: "Your cart\'s ready for pickup!"','sms')); } },
        { stage:'Delivered', role:'Front Desk', title:'9 · Delivered', body:'Job marked delivered, customer history updated, review request queued.' },
      ];

      // advance wo stage on each step
      let idx = 0;
      const advanceTo = (s) => {
        wo.stage = s.stage;
        window.app.render();
      };

      const driverObj = D({
        showProgress: true,
        progressText: 'Step {{current}} of {{total}}',
        nextBtnText: 'Next →',
        prevBtnText: '← Back',
        doneBtnText: 'Finish',
        allowClose: true,
        steps: steps.map(s => ({
          element: '[data-tour="kanban"]',
          popover: { title: s.title, description: tip('—', s.role, s.body) }
        }))
      });

      function go(i) {
        idx = i;
        const s = steps[i];
        setRole(s.role);
        advanceTo(s);
        if (s.preAction) s.preAction();
        setTimeout(() => driverObj.drive(i), 150);
      }
      go(0);

      const handler = (e) => {
        if (!driverObj.isActive || !driverObj.isActive()) { document.removeEventListener('click', handler, true); return; }
        const t = e.target.closest('.driver-popover-next-btn, .driver-popover-prev-btn, .driver-popover-close-btn');
        if (!t) return;
        if (t.classList.contains('driver-popover-close-btn')) { document.removeEventListener('click', handler, true); return; }
        const delta = t.classList.contains('driver-popover-next-btn') ? 1 : -1;
        const next = idx + delta;
        if (next >= 0 && next < steps.length) { e.preventDefault(); e.stopPropagation(); go(next); }
        else if (next >= steps.length) {
          document.removeEventListener('click', handler, true);
          driverObj.destroy();
          // closing card
          const m = document.createElement('div');
          m.className = 'fixed inset-0 z-40 bg-slate-900/50 grid place-items-center p-4';
          m.innerHTML = `<div class="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 text-center">
            <div class="w-12 h-12 mx-auto bg-brand-100 rounded-full grid place-items-center mb-3"><i data-lucide="check" class="w-6 h-6 text-brand-700"></i></div>
            <div class="text-lg font-bold">One repair, fully tracked.</div>
            <div class="text-sm text-slate-500 mt-2">No paper, nothing dropped, the customer in the loop the whole way — and the warranty claim ready to file.</div>
            <button class="mt-5 px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-semibold" onclick="this.closest('.fixed').remove()">Done</button>
          </div>`;
          document.body.appendChild(m);
          if (window.lucide) lucide.createIcons();
        }
      };
      setTimeout(()=> document.addEventListener('click', handler, true), 200);
    });
  }

  return { dayTour, repairTour, setRole };
})();
