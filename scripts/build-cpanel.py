#!/usr/bin/env python3
"""Build and validate a root-level cPanel ZIP, containing public site files only."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit, unquote
import hashlib
import re
import zipfile

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / 'clickv2-cpanel.zip'
files = sorted([
    *ROOT.glob('*.html'),
    ROOT / '.htaccess', ROOT / 'sw.js', ROOT / 'manifest.webmanifest',
    *(p for p in (ROOT / 'assets').rglob('*') if p.is_file()
      and p.suffix.lower() in {'.js', '.css', '.png', '.jpg', '.jpeg', '.svg',
                              '.webp', '.ico', '.woff', '.woff2', '.ttf'}),
])
names = {p.relative_to(ROOT).as_posix() for p in files}

class References(HTMLParser):
    def handle_starttag(self, tag, attrs):
        for key, value in attrs:
            if key not in {'src', 'href'} or not value:
                continue
            url = urlsplit(value)
            if url.scheme or url.netloc or not url.path:
                continue
            target = unquote(url.path).lstrip('/')
            if target not in names:
                raise ValueError(f'Missing local reference: {target}')

for file in ROOT.glob('*.html'):
    References().feed(file.read_text())

shell = (ROOT / 'sw.js').read_text().split('var SHELL = [', 1)[1].split('];', 1)[0]
for entry in re.findall(r"'([^']+)'", shell):
    if entry != './' and entry not in names:
        raise ValueError(f'Missing offline-shell file: {entry}')

for required in ['index.html', 'home.html', 'login.html', '.htaccess',
                 'assets/darkmode-BG.png', 'assets/lightmode-BG.png']:
    assert required in names, required
for service in ['vip', 'facial', 'makeup', 'keratin', 'groom1', 'groom2', 'groom3', 'groom4']:
    assert f'assets/services/{service}.jpg' in names

# Stable timestamps and permissions make repeated builds byte-identical.
with zipfile.ZipFile(OUTPUT, 'w', compression=zipfile.ZIP_DEFLATED, compresslevel=9) as archive:
    for file in files:
        entry = zipfile.ZipInfo(file.relative_to(ROOT).as_posix(), (1980, 1, 1, 0, 0, 0))
        entry.create_system = 3
        entry.external_attr = 0o100644 << 16
        entry.compress_type = zipfile.ZIP_DEFLATED
        archive.writestr(entry, file.read_bytes())

with zipfile.ZipFile(OUTPUT) as archive:
    assert archive.testzip() is None
    assert set(archive.namelist()) == names
    for file in files:
        assert archive.read(file.relative_to(ROOT).as_posix()) == file.read_bytes()

print(f'{OUTPUT.name}: {len(files)} public files, {OUTPUT.stat().st_size:,} bytes')
print('Validated: root-level index.html, local HTML references, offline shell, all service and hero images.')
print('SHA256:', hashlib.sha256(OUTPUT.read_bytes()).hexdigest())
