const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const html = fs.readFileSync(path.join(__dirname, '..', 'my-bookings.html'), 'utf8');

test('bookings header reserves its safe-area inset and gap in normal flow', () => {
  assert.match(html, /<header class="bookings-header">/);
  const css = html.match(/\.bookings-header\s*\{([^}]+)\}/)[1];
  assert.match(css, /position: sticky;/);
  assert.match(css, /top: 0;/);
  assert.match(css, /padding: max\(0\.5rem, env\(safe-area-inset-top, 0px\)\) 0\.75rem 1rem;/);
  assert.match(css, /background-color: var\(--color-canvas, #ECEEF0\);/);
  assert(!html.includes('sticky top-2'));
});

test('tabs and bookings share the main content region below the header', () => {
  assert.match(html, /<\/header>\s*<main>/);
  const main = html.split('<main>')[1].split('</main>')[0];
  assert(main.includes('data-tab="upcoming"'));
  assert(main.includes('data-tab="past"'));
  assert(main.includes('id="bookingsList"'));
  assert(main.includes('mb-28'));
  assert.match(html, /<\/main>\s*<nav class="bottom-nav fixed/);
});
