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
- Jalali calendar uses the browser's `Intl` Persian calendar — no conversion library.
- Dark/light theme toggle (floating button, bottom-left) on every page.

## Run locally

```bash
python3 -m http.server 8080
# open http://localhost:8080
```

## Deploy

GitHub Pages from the repo root (`index.html` at `/`).
