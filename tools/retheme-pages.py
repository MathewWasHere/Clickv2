#!/usr/bin/env python3
"""One-shot restructure of every page: canonical theme head, no inline theme CSS.

Idempotent: running it twice produces the same output.
"""
import re, glob, pathlib

HEAD_OPEN = '<head>'
BODY_RE = re.compile(r'<body dir="rtl" lang="fa">', re.I)

THEME_TAILWIND = """  <style type="text/tailwindcss">
/* Semantic roles -> Tailwind utilities. Every value is a CSS variable defined in
   assets/theme.css, so each utility flips with the mode on its own.
   NOTE: no --color-base here on purpose -- it collided with Tailwind's own
   `text-base` font-size utility and made text vanish in dark mode. */
@theme inline {
  --color-bg: var(--bg);
  --color-surface: var(--surface);
  --color-surface-2: var(--surface-2);
  --color-surface-3: var(--surface-3);
  --color-fg: var(--fg);
  --color-muted: var(--muted);
  --color-faint: var(--faint);
  --color-line: var(--line);
  --color-line-strong: var(--line-strong);
  --color-primary: var(--primary);
  --color-primary-dark: var(--primary-dark);
  --color-primary-tint: var(--primary-tint);
  --color-on-primary: var(--on-primary);
  --color-veil: var(--veil);
  --color-veil-2: var(--veil-2);
  --color-on-veil: var(--on-veil);
  --color-on-veil-accent: var(--on-veil-accent);
  --color-accent: var(--accent);
  --color-ok: var(--ok);
  --color-warn: var(--warn);
  --color-err: var(--err);
  --color-info: var(--info);
  --color-violet: var(--violet);
  --font-family-vazir: 'Vazirmatn', sans-serif;
}
  </style>"""

def head():
    return """<!DOCTYPE html>
<html lang="fa" dir="rtl" data-theme="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="theme-color" content="#101315">
  <meta name="color-scheme" content="dark light">
  <link rel="manifest" href="manifest.webmanifest">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
  <link rel="apple-touch-icon" href="assets/icon-192.png">
  <link rel="preconnect" href="https://unpkg.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@300;400;500;600;700;800;900&display=swap">
  <!-- Pre-paint theme bootstrap: sets the stored mode before the first frame.
       Keep inline and in sync with assets/theme.js (KEY = 'pirayesh-theme'). -->
  <script>(function(d){var m;try{m=localStorage.getItem('pirayesh-theme')}catch(e){}d.documentElement.setAttribute('data-theme',m==='light'?'light':'dark')})(document)</script>
  <link rel="stylesheet" href="assets/theme.css">
""" + THEME_TAILWIND + """
  <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
  <script src="https://unpkg.com/@fortawesome/fontawesome-free@6.7.2/js/all.min.js"></script>
  <script src="https://unpkg.com/lucide@latest"></script>
</head>"""


def rebuild(path):
    p = pathlib.Path(path)
    src = p.read_text(encoding='utf-8')
    body_start = BODY_RE.search(src)
    if not body_start:
        print(f'  skip (no canonical body tag): {p.name}')
        return
    # everything after <body ...> minus the theme leftovers
    body = src[body_start.end():]
    # drop: preconnect strays, every <style> block that only carried theme/base CSS,
    # the Vazirmatn font link (moved to <head>)
    body = re.sub(r'<link rel="preconnect" href="https://unpkg.com" />\s*', '', body)
    body = re.sub(r'\n?<link rel="stylesheet" href="https://fonts\.googleapis\.com[^>]*/>\s*', '\n', body)
    body = re.sub(r'[ \t]*<style[^>]*>.*?</style>[ \t]*', '', body, flags=re.S)
    body = re.sub(r'\n{3,}', '\n\n', body)
    p.write_text(head() + '\n\n<body dir="rtl" lang="fa">' + body, encoding='utf-8')
    print(f'  rebuilt {p.name}  ({len(src)} -> {len(p.read_text(encoding="utf-8"))} bytes)')


for f in sorted(glob.glob('*.html')):
    if f == 'index.html':
        continue
    rebuild(f)
