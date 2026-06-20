// Mobile guided tour — scripted through field moments
window.TOUR = (function(){

  function start() {
    if (!window.driver) return console.warn('driver not loaded');
    const D = window.driver.js.driver;

    const steps = [
      {
        tab: 'home',
        sel: '[data-tour="home-timer"]',
        title: '7:50 AM — Home',
        body: 'Everything assigned to you, the second you clock in. The active job timer is already running.'
      },
      {
        tab: 'scan',
        sel: '#scan-license',
        title: 'Scan a license',
        body: 'New customer? Scan their license. Name, address, done — no typing in the bay.'
      },
      {
        tab: 'jobs',
        sel: '[data-tour="jobs-list"]',
        title: 'Open a job',
        body: 'Tap any work order to open it. We\'ll open the Onward that won\'t charge.',
        afterShow: () => { setTimeout(() => mobileApp.openJob('WO-1042'), 100); }
      },
      {
        sel: '[data-tour-job="timer"]',
        title: 'Start the labor timer',
        body: 'Tap to start the clock. Every minute of labor captured automatically.',
      },
      {
        sel: '[data-tour-job="ai"]',
        title: 'AI Service Advisor',
        body: 'Not sure what\'s wrong? The cart tells you — likely cause, parts, and price.',
        afterShow: () => setTimeout(() => {
          const w = MOCK.workOrders.find(x=>x.id==='WO-1042');
          mobileApp.runAIAdvisor(w);
        }, 100)
      },
      {
        sel: '[data-tour-job="stepper"]',
        title: 'Advance the status',
        body: 'Tap Ready for Pickup and the customer gets texted automatically. You never touch a phone to call.'
      },
      {
        sel: '[data-tour-job="actions"]',
        title: 'Customer touchpoints',
        body: 'Estimate, approval, ready — every customer text fires from right here.'
      }
    ];

    let i = 0;
    let driverObj;

    function showStep(idx) {
      i = idx;
      const s = steps[idx];
      // Switch tab / open overlay if needed
      const work = () => {
        // re-resolve element
        let target = s.sel ? document.querySelector(s.sel) : null;
        if (s.afterShow) s.afterShow();
        setTimeout(() => {
          target = s.sel ? document.querySelector(s.sel) : null;
          if (!driverObj) {
            driverObj = D({
              showProgress: true,
              allowClose: true,
              progressText: 'Step {{current}} of {{total}}',
              nextBtnText: 'Next →',
              prevBtnText: '← Back',
              doneBtnText: 'Finish',
              steps: steps.map(st => ({ element: 'body', popover: { title: st.title, description: st.body } }))
            });
            driverObj.drive(idx);
          } else {
            driverObj.moveTo(idx);
          }
          // try to spotlight specific element
          if (target) {
            try { driverObj.highlight({ element: target, popover: { title: s.title, description: s.body } }); } catch(e){}
          }
        }, 180);
      };
      if (s.tab) {
        mobileApp.setTab(s.tab);
        setTimeout(work, 220);
      } else {
        work();
      }
    }

    showStep(0);

    setTimeout(() => document.addEventListener('click', clickShim, true), 100);
    function clickShim(e) {
      if (!driverObj || !driverObj.isActive || !driverObj.isActive()) {
        document.removeEventListener('click', clickShim, true);
        finish();
        return;
      }
      const t = e.target.closest('.driver-popover-next-btn, .driver-popover-prev-btn, .driver-popover-close-btn');
      if (!t) return;
      if (t.classList.contains('driver-popover-close-btn')) {
        document.removeEventListener('click', clickShim, true);
        finish();
        return;
      }
      const delta = t.classList.contains('driver-popover-next-btn') ? 1 : -1;
      const next = i + delta;
      if (next >= 0 && next < steps.length) {
        e.preventDefault(); e.stopPropagation();
        showStep(next);
      } else if (next >= steps.length) {
        e.preventDefault(); e.stopPropagation();
        document.removeEventListener('click', clickShim, true);
        if (driverObj) driverObj.destroy();
        finish();
      }
    }

    function finish() {
      // closing sheet
      const sheet = document.createElement('div');
      sheet.innerHTML = `
        <div class="sheet-back" data-close></div>
        <div class="sheet" style="padding-bottom:24px">
          <div class="grabber"></div>
          <div class="p-6 text-center">
            <div class="w-14 h-14 rounded-full bg-brand-100 grid place-items-center mx-auto mb-3"><i data-lucide="smartphone" class="w-7 h-7 text-brand-700"></i></div>
            <div class="text-lg font-bold">The whole shop in your pocket.</div>
            <div class="text-sm text-slate-500 mt-1">This is Golf Cart Shop OS on the bay floor.</div>
            <button class="mt-5 px-4 py-2.5 bg-brand-600 text-white rounded-xl text-sm font-semibold" id="finish-done">Done</button>
          </div>
        </div>
      `;
      document.getElementById('sheet-mount').appendChild(sheet);
      if (window.lucide) lucide.createIcons();
      sheet.querySelectorAll('[data-close], #finish-done').forEach(b => b.addEventListener('click', () => sheet.remove()));
    }
  }

  return { start };
})();
