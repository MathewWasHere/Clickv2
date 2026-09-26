const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');
const root = path.join(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

function catalog(initial = {}) {
  const storage = new Map(Object.entries(initial));
  const context = {
    localStorage: {
      getItem: key => storage.get(key) ?? null,
      setItem: (key, value) => storage.set(key, value)
    }
  };
  context.window = context;
  vm.createContext(context);
  vm.runInContext(read('assets/data.js'), context);
  return { P: context.P, storage, legacy: context.LEGACY_SERVICE_IMAGES };
}

test('all eight services have unique, local, compact JPEG photos without changing prices', () => {
  const { P } = catalog();
  const prices = { vip: 350000, facial: 450000, makeup: 500000, keratin: 800000,
    groom1: 6000000, groom2: 8500000, groom3: 9500000, groom4: 11500000 };
  const hashes = new Set();
  assert.equal(P.services.length, 8);
  for (const s of P.services) {
    assert.equal(s.img, `assets/services/${s.id}.jpg`);
    assert.equal(s.price, prices[s.id]);
    const bytes = fs.readFileSync(path.join(root, s.img));
    assert.equal(bytes.readUInt16BE(0), 0xffd8);
    assert(bytes.length > 10000 && bytes.length < 250000);
    hashes.add(crypto.createHash('sha256').update(bytes).digest('hex'));
  }
  assert.equal(hashes.size, 8);
});

test('home and detail fallback use the same catalog photos, not external stock', () => {
  const { P } = catalog();
  const home = read('home.html');
  const images = [...home.matchAll(/<img data-service-image="([^"]+)" src="([^"]+)"/g)];
  assert.equal(images.length, 5);
  for (const [, id, src] of images) assert.equal(src, P.service(id).img);
  assert.match(read('service-detail.html'), /id="sd-img" src="assets\/services\/groom3.jpg"/);
  assert(!home.includes('images.unsplash.com'));
  assert(!read('service-detail.html').includes('images.unsplash.com'));
});

test('saved former default images upgrade without losing admin changes or rewriting storage', () => {
  const { legacy } = catalog();
  const edits = {};
  for (const [id, img] of Object.entries(legacy)) edits[id] = { img, price: 123456, name: 'Edited ' + id };
  const raw = JSON.stringify(edits);
  const { P, storage } = catalog({ 'pirayesh-service-edits': raw });
  for (const s of P.allServices()) {
    assert.equal(s.img, `assets/services/${s.id}.jpg`);
    assert.equal(s.price, 123456);
    assert.equal(s.name, 'Edited ' + s.id);
    assert.equal(P.service(s.id).img, s.img);
    assert.equal(P.findService(s.id).img, s.img);
  }
  assert.equal(storage.get('pirayesh-service-edits'), raw);
});

test('genuine custom admin photos and custom services remain untouched', () => {
  const img = 'https://example.com/my-own-photo.jpg';
  const { P } = catalog({
    'pirayesh-service-edits': JSON.stringify({ facial: { img, price: 777000 }, vip: { img: '' } }),
    'pirayesh-custom-services': JSON.stringify([{ id: 'custom1', name: 'Custom', img }])
  });
  assert.equal(P.service('facial').img, img);
  assert.equal(P.findService('facial').price, 777000);
  assert.equal(P.service('vip').img, '');
  assert.equal(P.findService('custom1').img, img);
  P.saveServiceEdit('facial', { name: 'New name' });
  assert.equal(P.service('facial').img, img);
});

test('all new service photos are included in the updated offline shell', () => {
  const { P } = catalog();
  const sw = read('sw.js');
  assert.match(sw, /var CACHE = 'pirayesh-v\d+-[^']+';/);
  const shell = sw.split('var SHELL = [')[1].split('];')[0];
  for (const s of P.services) assert(shell.includes(`'${s.img}'`));
});
