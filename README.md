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
| `booking.html?s=<id>` | Public booking flow: service → Jalali calendar → time slots → checkout login |
| `payment.html` | Mock ZarinPal gateway (also pays pending bookings via `?b=<id>`) |
| `confirmation.html` | Booking confirmation with code |
| `my-bookings.html` | Customer bookings (upcoming/past, cancel, pay pending) |
| `login.html` | Terms agreement → mock phone/code `1234` → name and Jalali birth date (no SMS) |
| `terms.html` | Public Persian draft terms and privacy page (`terms-draft-v1`) |
| `profile.html` | Customer name and verified phone; profiles stored per phone in localStorage |
| `admin-dashboard.html` | Live stats, customer club, contact CSV export, commission and upcoming appointments |
| `admin-bookings.html` | All bookings with status management + filters |
| `admin-services.html` | Service catalog management (add custom services via modal) |
| `admin-settings.html` | Shop settings and owner-managed admin phone list |

## How it works

- All data (bookings, profile, custom services, theme) lives in `localStorage`.
- Demo bookings are seeded on first visit.
- Jalali calendar uses the browser's `Intl` Persian calendar — no conversion library.
- Dark/light theme toggle (floating button, bottom-left) on every page.

## Mock login (development only)

- Browse and choose a service, date and time in `booking.html` without signing in.
  Only the final **تأیید و پرداخت** action requires login. It saves the complete draft
  first, then sends guests to `login.html?next=payment.html`; completed sessions
  go directly to payment. Refreshing login does not discard the selection, and a
  **بازگشت و ویرایش رزرو** link returns to the selected time/summary step.
- Payment, profile, my-bookings, confirmation and admin pages remain protected.
  Payment re-checks the session before the simulated gateway starts and before
  mutating a booking. A pending payment's `?b=` query is retained through login.
- Enter an Iranian mobile number, e.g. `09179095028`, leave the preselected required
  terms agreement selected, then enter code **`1234`**.
  Persian/Arabic digits and `+98`/`0098` number formats are accepted. No SMS is sent.
- A correct code opens a required **name and birth-date** step before continuing.
  Select the Jalali year, Persian month name and day from mobile-friendly dropdowns.
  Days adjust for the selected month/leap year, future dates are excluded, and
  changing to a shorter month clears an invalid day instead of silently changing it.
  Invalid calendar dates, non-leap Esfand 30, future dates and empty names are rejected.
  The exact birthday-discount message appears beneath the date input. This collects
  the date only; it does not implement discount calculation or birthday notifications.
- Each fresh login confirms these details, prefilled for returning users. Refreshing
  during this step resumes it; protected pages redirect back until it is saved.
  Sessions without acceptance of the current terms return to login; saved profiles
  are preserved and are never given a fabricated acceptance timestamp.
- Successful profile completion returns to an allowed requested page, preserving
  booking parameters. Customers requesting an admin page return to Profile with
  an access-denied notice.
- The mock session persists in localStorage. **خروج از حساب** in Profile and
  Admin → Settings removes the session and unfinished booking draft, but preserves
  bookings, saved profiles, catalog edits, and theme. Other tabs and restored
  history pages re-check the session.
- Names and birth dates are saved per phone number. `birthDate` stores a normalized
  Jalali `YYYY-MM-DD` string with `birthCalendar: 'persian'` (not a Gregorian date).
  The date is shown in Profile and preserved when the name is edited. Changing
  the verified number requires logging out and logging in with the new number.
- **Demo roles:** `09961217945` and `09177905028` are permanent owners defined in
  `assets/auth.js`. Only these two numbers can add admins in Admin → Settings →
  **مدیریت دسترسی مدیران**. Added numbers get admin access, not owner permissions.
  Owners cannot be replaced or removed through the admin-number list.
- Non-owner admins see the same management section, including the number lists,
  but its input/button are disabled. The add-admin function also re-checks owner
  permissions on every write. Invalid, duplicate and existing-owner numbers are rejected.
- Other authenticated numbers remain customers: their profile hides the admin link,
  and direct admin URLs, login return URLs, history restores and cross-tab role
  changes re-check access. Customers can still book and use their profile.
- Added admins persist under `pirayesh-demo-admins` in this browser's localStorage
  and survive logout. **They are not synced between devices or browsers.**
- **This is not real authentication or authorization.** The fixed OTP, sessions,
  owner checks and admin list are client-side and can be bypassed by modifying
  browser data/code. Bookings/catalog remain shared demo data (not isolated accounts).
  Before production, add server-side OTP verification, secure sessions, a shared
  database, ownership checks and server-enforced roles. Do not use this flow for
  real customer data.

Run the dependency-free regression tests with Node.js:

```bash
node --test tests/auth.test.cjs
```

## Draft terms and acceptance

- `terms.html` is a **Persian draft for owner/legal review**, not finalized legal
  advice. It describes the prototype, stored profile information, planned booking
  and promotional messages, and the support contact for correction/deletion or
  stopping messages. No SMS provider is connected.
- Login has one preselected, required agreement. The separate draft-terms link is
  not shown in login; `terms.html` remains available directly. Users can
  uncheck it, but cannot continue while it is unchecked. There are no
  separate promotional-SMS checkboxes, consent badges or consent filters in the
  login, profile or customer club screens.
- The mock OTP API also requires the agreement to be selected. Only a correct OTP creates
  a session with `termsVersion` and `termsAcceptedAt`; finishing the profile copies
  that record into the per-phone profile. Name edits do not refresh the acceptance
  timestamp. A new terms version requires acceptance again.
- Preselection records the submitted terms choice, not an affirmative marketing
  opt-in. It should not be treated as proof of legally valid promotional consent.
- Existing records are not backfilled. Historical `smsConsent` fields, including
  previous opt-outs, are retained unchanged internally; terms acceptance does not
  automatically rewrite them. Before actual messaging, review applicable consent
  requirements, honor existing opt-outs and implement an effective opt-out process.
- When updating terms, update `TERMS_VERSION` in `assets/auth.js` and the page text
  together. The currently testable version is `terms-draft-v1`; review before launch.

## Customer club — باشگاه مشتریان

- The admin dashboard lists every saved user profile in this browser: name,
  normalized phone, Jalali birth date and membership date. Owners and admins who
  complete their own profiles are included too. It counts total members and
  birthdays in the current Jalali month.
- Finishing login saves the member automatically. The per-phone profile
  (`pirayesh-profile:<phone>`) is the source of truth, not a duplicate contact list.
  Repeat logins update the member. Profile edits are reflected in the club and
  logout does not delete members.
- Existing per-phone and legacy profiles are included without inventing birthdays,
  joining dates or terms acceptance. Malformed records are ignored. Seeded demo
  bookings do **not** create club members. New-member statistics count actual
  recorded memberships from the last 30 days, not bookings.
- Search by name/phone, filter by Jalali birth month, and load more members as
  needed. CSV exports include **all current filtered contacts**, plus terms version
  and acceptance time when present. This is a customer-data export, not a list of
  people asserted to have given legally valid marketing consent. Name cells are
  escaped against spreadsheet formulas; import the phone column as text to preserve
  leading zeros. Admin access is re-checked when exporting.
- No SMS delivery, scheduling or discount automation is implemented. Customer data
  remains **local to this browser/origin** and can be lost if browser data is cleared.
  This is not a shared database or secure production CRM. Collecting signups from
  other devices requires a backend/database with proper authorization and privacy
  controls; sending offers requires an SMS provider and appropriate consent handling.

## Run locally

```bash
python3 -m http.server 8080
# open http://localhost:8080
```

## Hero backgrounds

Place your images at these exact, case-sensitive paths:

- `assets/lightmode-BG.png` — light theme
- `assets/darkmode-BG.png` — dark theme

The home hero follows the site's selected theme, not just the system preference.
Its text, overlay and booking button also switch colors for contrast. Content stays
right-aligned and RTL. Both images should leave room on the right for the copy.
Until the files are added, a theme-matched solid background remains visible.
These optional images are runtime-cached after successful loads, rather than being
required in the service-worker install list (missing files must not break installation).

## Theme colors

The page background token is `--color-canvas` (`bg-canvas`), with its dark-mode
value in `assets/dark.css`. Avoid naming a color `base`: Tailwind v4 would then
interpret `text-base` as a color instead of a font size, making headings match
the background. Keep `text-base` for sizing and set text colors separately.

## Deploy

GitHub Pages from the repo root (`index.html` at `/`).

### cPanel / public_html

Rebuild the upload package with `python3 scripts/build-cpanel.py`.
`clickv2-cpanel.zip` includes only the public HTML pages, assets, manifest, service
worker and Apache `.htaccess`. It has **no enclosing folder**: `index.html` is
at the ZIP root. Tests, development tools, Git metadata and the ZIP itself are
excluded. The build checks local HTML references and all offline-shell files.

1. Back up your current `public_html`, especially any existing `.htaccess`.
2. Upload `clickv2-cpanel.zip` using cPanel File Manager.
3. Extract directly into your domain's `public_html` (or its configured document
   root), replacing the old site files. Merge the provided `.htaccess` directives
   instead of overwriting it if you have custom hosting rules.
4. Verify `public_html/index.html` and `public_html/assets/` exist, without an
   extra parent folder. Enable HTTPS / AutoSSL for PWA support.
5. Open the domain, refresh, and delete the uploaded ZIP from `public_html`.

No Node, Python or database setup is needed on the hosting server. The app still
loads Tailwind, icons and fonts from external CDNs, and the embedded map from
Google. Visitors need access to those services.

**Prototype limitation:** uploading does not turn browser-local demo login,
bookings or payments into a secure multi-user backend. SMS and real payment
processing remain unimplemented; local data does not transfer between domains.

## Service imagery

The eight default services each use a unique local photograph-style **AI-generated
illustration** at `assets/services/<service-id>.jpg`, not actual client photos.
All share a gray barbershop setting and consistent lighting. Facial shows a mask
and cold mist; keratin shows product-coated hair; the groom packages have distinct
finished grooming portraits. Images are 1200 × 800 progressive JPEGs with central
subjects suitable for both square thumbnails and landscape cards.

Home, service listings (including groom packages), and details use this set. The
service worker precaches the eight optimized images. Admin photo overrides remain
supported: only exact former default stock URLs are upgraded when reading saved
edits; custom URLs, pricing and other edits are retained without resetting storage.

Run regression checks with `node --test tests/*.test.cjs`.
