const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
const home = fs.readFileSync(path.join(root, 'home.html'), 'utf8');
const hero = home.split('<!-- Hero Section -->')[1].split('<!-- Quick Info Bar -->')[0];

test('hero uses the requested case-sensitive background paths and the selected site theme', () => {
  assert.match(home, /\.home-hero__image\s*\{[^}]*background-image:\s*url\('assets\/lightmode-BG\.png'\)/);
  assert.match(home, /body\[data-theme="dark"\] \.home-hero__image\s*\{[^}]*url\('assets\/darkmode-BG\.png'\)/);
  assert(!hero.includes('images.unsplash.com'));
});

test('hero keeps a solid fallback and theme-aware text/button colors while images are absent', () => {
  assert.match(home, /background: var\(--hero-surface\)/);
  assert.match(home, /\.home-hero__title\s*\{ color: var\(--hero-text\)/);
  assert.match(home, /background: var\(--hero-button\); color: var\(--hero-button-text\)/);
  assert.match(hero, /class="home-hero__image" aria-hidden="true"/);
});

test('hero preserves right-aligned RTL copy, experience caption and booking destination', () => {
  assert(hero.includes('dir="rtl"'));
  assert(hero.includes('با 10 سال سابقه تخصصی'));
  assert.match(hero, /class="home-hero__experience">\s*<svg class="home-hero__star"[^>]*fill="currentColor"[^>]*aria-hidden="true"/);
  assert(hero.includes('href="booking.html"'));
  assert.match(home, /\.home-hero__content\s*\{[^}]*direction: rtl; text-align: right;/);
});

test('optional hero images do not block service worker installation before upload', () => {
  const sw = fs.readFileSync(path.join(root, 'sw.js'), 'utf8');
  const shell = sw.split('var SHELL = [')[1].split('];')[0];
  assert(!shell.includes('lightmode-BG.png') && !shell.includes('darkmode-BG.png'));
});
