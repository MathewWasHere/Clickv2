# پیرایش (Pirayesh) — Barbershop Booking Site

A complete, mobile-first Persian (RTL) barbershop booking website built from the original
static HTML mockups. Pure HTML/CSS/JS — no build step. Tailwind v4 (browser CDN) + Lucide icons.

## Pages

| Page | Description |
| --- | --- |
| `index.html` | Redirects to `home.html` |
| `home.html` | Landing page: hero, featured services, groom packages, testimonials |
| `services.html` | Full service list with category tabs (`#groom` deep link) |
| `service-detail.html?s=<id>` | Dynamic service detail (vip, facial, makeup, keratin, groom1–groom4) |
| `booking.html?s=<id>` | Booking flow: service → Jalali calendar → time slots → summary |
| `payment.html` | Mock ZarinPal gateway (also pays pending bookings via `?b=<id>`) |
| `confirmation.html` | Booking confirmation with code |
| `my-bookings.html` | Customer bookings (upcoming/past, cancel, pay pending) |
| `profile.html` | Customer name/phone (stored in localStorage) |
| `admin-dashboard.html` | Live stats, 10% commission, upcoming appointments |
| `admin-bookings.html` | All bookings with status management + filters |
| `admin-services.html` | Service catalog management (add custom services via modal) |
| `admin-settings.html` | Shop settings |

## How it works

- All data (bookings, profile, custom services, theme) lives in `localStorage`.
- Demo bookings are seeded on first visit.
- Light/dark theme: token-driven (see **Theming** below) with a toggle in the header island.
- Jalali calendar uses the browser's `Intl` Persian calendar — no conversion library.

## Theming (light / dark)

Every colour in the site is a **role**, never a hex value. `assets/theme.css` owns both palettes:

| Layer | Where | Example |
| --- | --- | --- |
| Primitives | `--l-*` (light) / `--d-*` (dark) blocks at the top of `theme.css` | `--d-surface: #191D20` |
| Roles | `:root` (dark, the default) and `[data-theme="light"]` | `--surface`, `--fg`, `--muted`, `--faint`, `--line`, `--primary`, `--veil`, `--accent`, `--ok/warn/err/info/violet` |
| Utilities | the `@theme inline` block in each page `<head>` maps roles to Tailwind | `bg-surface`, `text-muted`, `border-line`, `from-primary`, `text-ok` |

Rules for new pages/components:

- Use role utilities (`bg-surface`, `text-fg`, `text-muted/80`, `border-line`, `bg-primary/10`). Never `bg-white`, `text-[#151618]`, `gray-*`, or a `dark:`-override stylesheet.
- Text on a photo/veil block uses the `*-on-veil` roles; a `bg-primary` CTA always pairs with `text-on-primary`.
- Cards on the page background carry `elev` (mode-correct shadow); floating bars use `.island`; tabs/filters use `.seg` + `aria-pressed`.
- The mock ZarinPal gateway stays light on purpose: it is wrapped in `data-theme="light"` + `.theme-light-zone`, which re-points the roles for that subtree only.
- Dark is the default mode (`<html data-theme="dark">` + a pre-paint bootstrap in `<head>`); a manual choice is stored under `localStorage['pirayesh-theme']`. `PTheme.set('light')` / `PTheme.toggle()` are available from the console, and `document` fires `themechange`.
- Contrast is part of the contract: `fg`/`muted`/`faint`/status roles are >=4.5:1 on every surface in **both** modes; borders and focus rings >=3:1.

## Run locally

```bash
python3 -m http.server 8080
# open http://localhost:8080
```

## Deploy

GitHub Pages from the repo root (`index.html` at `/`).
