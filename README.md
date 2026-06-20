# Golf Cart Shop OS — Static Demo

A static, front-end-only walkthrough of **Golf Cart Shop OS** for the fictional **Lakeside Golf Carts**. No backend, no build step.

**Two demos in this repo:**
- `index.html` — desktop / SaaS dashboard
- `mobile/index.html` — phone-framed mobile field-tool experience (see [mobile/README.md](mobile/README.md))

## Run it

Just open `index.html` in a browser. Or:

```
cd golf-cart-shop-os-demo
npx serve .
```

## What's in it

- Full sidebar (Core, Revenue, Growth, Back office, Custom AI Modules) — every screen populated
- Interactive **Repair & Service** kanban with rich work-order drawer, tech assignment, labor + parts totals, status stepper, scripted AI Service Advisor, and customer touchpoint toasts
- **Rentals** with fleet grid, reservation calendar/timeline, multi-step booking flow, and per-cart utilization
- **Custom AI Modules** showcase with typewriter-effect scripted responses
- Two guided tours via driver.js:
  - **Typical Day** — auto-launches on first visit. Restartable via the **Replay the Day** button (top bar).
  - **One Repair, Start to Finish** — launchable from the Repair & Service screen ("See a repair, drop-off to delivered").
- Role switcher in top bar (Owner / Front Desk / Technician) — also driven by the walkthroughs.

## Rebranding the accent color

Edit `css/styles.css`:

```css
:root {
  --brand: #059669;       /* primary green */
  --brand-soft: #ecfdf5;  /* soft tint */
}
```

Tailwind brand colors are also defined inline in `index.html` under `tailwind.config` — replace the `brand` palette there to push the new color through the UI.

## Resetting the walkthrough

The "typical day" tour auto-launches once, then stores completion in `localStorage`. To force it back, clear `lakeside.tour.day.done` or click **Replay the Day** in the top bar.

## File map

```
index.html        app shell, CDN scripts, welcome modal
css/styles.css    custom styles on top of Tailwind
js/mockData.js    all mock data (customers, fleet, work orders, parts, AI responses…)
js/screens.js     render functions for every screen
js/tour.js        both guided walkthroughs
js/app.js         hash router, sidebar, top-bar
```
