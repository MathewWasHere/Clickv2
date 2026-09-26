const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const home = fs.readFileSync(path.join(__dirname, '..', 'home.html'), 'utf8');
const reviews = home.split('<!-- Testimonials -->')[1].split('</section>')[0];
const address = home.split('<!-- Address / Map -->')[1].split('</section>')[0];
const sectionClasses = html => html.match(/<section class="([^"]+)"/)[1].split(/\s+/);

test('reviews and address use a single standard section gap, not footer clearance', () => {
  assert(!sectionClasses(reviews).some(c => /^(m|mb|my)-/.test(c)));
  assert(sectionClasses(address).includes('mt-8'));
  assert(reviews.includes('نظرات مشتریان'));
  assert(address.includes('آدرس ما'));
});

test('address retains bottom clearance for fixed navigation and map links', () => {
  assert(sectionClasses(address).includes('mb-32'));
  assert(address.includes('<iframe'));
  assert(address.includes('https://www.google.com/maps/dir/'));
  assert(home.includes('bottom-nav fixed bottom-4'));
});
