# Golf Cart Shop OS — Mobile Demo

Companion to the desktop demo. Shows the technician + front-desk mobile experience.

## Run it

Open `mobile/index.html` in a browser. On a laptop it renders inside an iPhone-style frame. On a real phone (or width ≤ 480px) it fills the viewport for a native feel.

```
npx serve .   # then visit /mobile/
```

## What's in it

- **Phone frame** with status bar, notch, home indicator
- **Bottom tab bar** — Home, Jobs, **Scan** (elevated center), Rentals, More
- **Home** — role-aware (Technician shows running labor timer + assigned jobs; Front Desk shows today's check-outs/check-ins + drop-offs waiting)
- **Jobs** detail with: stage stepper, live labor timer (Start/Stop), photo strip with mock camera capture, AI Service Advisor (typewriter), parts & labor lines, OEM warranty assistant sheet, 3 customer-text touchpoints
- **Scan tab** — viewfinder + 3 actions: scan license (autofills new customer), scan VIN (pulls cart history), photo to a job
- **Rentals** check-out with **finger-signature pad** (works with mouse or finger), waiver, deposit auth, success state. Check-in with inspection checklist + photos.
- **More** — Customers, Parts lookup, Notifications, Role switch, Replay tour
- **Guided tour** — auto-launches on first visit, follows a tech through a typical field flow. Replay any time from More → Replay app tour.

## Rebrand

Edit `css/styles.css`:
```css
:root { --brand: #059669; --brand-soft: #ecfdf5; }
```
And the `brand` palette in `index.html`'s inline `tailwind.config`.

## File map
```
mobile/
  index.html        phone frame + app mount
  css/styles.css    phone frame, sheets, tabs, timer card, AI bubble
  js/mockData.js    shared with desktop in spirit
  js/app.js         tabs, screens, sheets, signature pad
  js/tour.js        first-run guided tour
```
