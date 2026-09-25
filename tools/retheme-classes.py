#!/usr/bin/env python3
"""One-shot class migration: hardcoded per-page colors -> semantic theme roles.

Every rule replaces a color literal with a *role* utility (bg-surface, text-muted,
border-line, text-ok …) whose value comes from assets/theme.css, so the utility
adapts to the mode instead of needing an override file. Run after
retheme-pages.py. Safe to re-run: the rules are all "old -> new" literals that no
longer exist once applied.
"""
import re, glob

RULES = [
    # ---- text: ink tiers -------------------------------------------------------
    (r'\btext-\[#151618\]/70(?![\w/-])', 'text-fg/85'),
    (r'\btext-\[#151618\]/60(?![\w/-])', 'text-fg/75'),
    (r'\btext-\[#151618\]/50(?![\w/-])', 'text-muted'),
    (r'\btext-\[#151618\]/40(?![\w/-])', 'text-muted'),
    (r'\btext-\[#151618\]/30(?![\w/-])', 'text-faint'),
    (r'\btext-\[#151618\]/20(?![\w/-])', 'text-faint/80'),
    (r'\btext-\[#151618\](?![\w/-])', 'text-fg'),
    (r'\btext-\[#FFFFFF\](?![\w/-])', 'text-on-primary'),
    # ---- text: gateway grays (payment) ----------------------------------------
    (r'\btext-gray-(900|800)(?![\w/-])', 'text-fg'),
    (r'\btext-gray-(700|600)(?![\w/-])', 'text-muted'),
    (r'\btext-gray-(500|400)(?![\w/-])', 'text-faint'),
    # ---- text: white on photo/veil blocks -------------------------------------
    (r'\btext-white/80(?![\w/-])', 'text-on-veil/80'),
    (r'\btext-white/70(?![\w/-])', 'text-on-veil/75'),
    (r'\btext-white/60(?![\w/-])', 'text-on-veil/60'),
    (r'\btext-white(?![\w/-])', 'text-on-veil'),
    # ---- status roles (both modes: readable text + matching tint) -------------
    (r'\btext-green-(400|500)(?![\w/-])', 'text-ok'),
    (r'\btext-yellow-400(?![\w/-])', 'text-warn'),
    (r'\btext-amber-500(?![\w/-])', 'text-warn'),
    (r'\btext-red-400/60(?![\w/-])', 'text-err/80'),
    (r'\btext-red-(400|500)(?![\w/-])', 'text-err'),
    (r'\btext-blue-400(?![\w/-])', 'text-info'),
    (r'\btext-purple-400(?![\w/-])', 'text-violet'),
    (r'\bbg-green-500/(5|10)(?![\w/-])', 'bg-ok/10'),
    (r'\bbg-yellow-500/(5|10)(?![\w/-])', 'bg-warn/10'),
    (r'\bbg-red-500/(5|10)(?![\w/-])', 'bg-err/10'),
    (r'\bbg-blue-500/10(?![\w/-])', 'bg-info/10'),
    (r'\bbg-purple-500/10(?![\w/-])', 'bg-violet/10'),
    (r'\bbg-amber-500/10(?![\w/-])', 'bg-warn/10'),
    (r'\bborder-green-500/15(?![\w/-])', 'border-ok/30'),
    (r'\bborder-green-500(?![\w/-])', 'border-ok'),
    (r'\bborder-red-500/20(?![\w/-])', 'border-err/30'),
    # ---- backgrounds ----------------------------------------------------------
    (r'\bbg-surface border border-\[#151618\]/10(?![\w/-])', 'bg-surface-2 border border-line-strong'),
    (r'\bbg-white/15(?![\w/-])', 'bg-on-veil/15'),
    (r'\bbg-white/10(?![\w/-])', 'bg-on-veil/10'),
    (r'\bbg-white(?![\w/-])', 'bg-surface'),
    (r'\bbg-gray-(50|100)(?![\w/-])', 'bg-surface-2'),
    (r'\bbg-base(?![\w/-])', 'bg-surface-2'),
    (r'\bbg-surface-light/95(?![\w/-])', 'bg-surface-3/90'),
    (r'\bbg-surface-light/50(?![\w/-])', 'bg-surface-3/70'),
    (r'\bbg-surface-light(?![\w/-])', 'bg-surface-3'),
    (r'\bbg-surface-lighter(?![\w/-])', 'bg-surface-3'),
    (r'\bbg-\[#151618\]/40(?![\w/-])', 'bg-veil/60'),
    (r'\bbg-\[#151618\]/30(?![\w/-])', 'bg-fg/25'),
    (r'\bbg-\[#151618\]/20(?![\w/-])', 'bg-fg/20'),
    (r'\bbg-\[#151618\]/10(?![\w/-])', 'bg-fg/10'),
    (r'\bbg-\[#151618\]/5(?![\w/-])', 'bg-fg/5'),
    (r'\bbg-\[#151618\](?![\w/-])', 'bg-primary'),
    # ---- borders / dividers ---------------------------------------------------
    (r'\bborder-\[#151618\]/(5|10)(?![\w/-])', 'border-line'),
    (r'\bborder-\[#151618\]/(15|20)(?![\w/-])', 'border-line-strong'),
    (r'\bborder-gray-200(?![\w/-])', 'border-line'),
    (r'\bborder-white/20(?![\w/-])', 'border-on-veil/25'),
    # ---- gradients ------------------------------------------------------------
    (r'\bfrom-\[#151618\]/60(?![\w/-])', 'from-veil/60'),
    (r'\bvia-\[#151618\]/70(?![\w/-])', 'via-veil/70'),
    (r'\bfrom-\[#3C4449\](?![\w/-])', 'from-veil-2'),
    (r'\bto-\[#151618\](?![\w/-])', 'to-veil'),
    (r'\bfrom-surface-light(?![\w/-])', 'from-surface-3'),
    # ---- ratings + hero gold --------------------------------------------------
    (r'\btext-primary fill-primary(?![\w/-])', 'text-accent fill-accent'),
    # ---- elevation ------------------------------------------------------------
    (r'\bshadow-lg shadow-\[#151618\]/25(?![\w/-])', 'elev-cta'),
    (r'\bshadow-md shadow-black/20(?![\w/-])', 'elev-cta'),
    (r'\bshadow-lg(?![\w/-])', 'elev-cta'),
    (r'\bpulse-gold(?![\w/-])', 'pulse-cta'),
    # ---- admin settings switches ------------------------------------------------
    (r'\bbg-\[#151618\]/30(?![\w/-])', 'bg-fg/25'),
]


def add_elevation(text):
    """Cards (div/a) that sit on the page background get the mode-appropriate shadow."""
    def fix_tag(m):
        tag, cls = m.group(1), m.group(2)
        ok = (re.search(r'\bbg-surface(?![\w-])', cls)
              and re.search(r'\brounded-(xl|2xl)\b', cls)
              and re.search(r'\bborder-line\b', cls)
              and 'elev' not in cls and 'shadow' not in cls)
        if not ok:
            return m.group(0)
        return tag + cls + ' elev' + m.group(3)

    return re.sub(r'(<(?:div|a)\b[^>]*?\bclass=")([^"]*)("(?:[^>]*>)?)', fix_tag, text)


def migrate(path):
    src = open(path, encoding='utf-8').read()
    out = src
    for pat, rep in RULES:
        out = re.sub(pat, rep, out)
    if path.endswith('.html'):
        out = add_elevation(out)
    if out != src:
        open(path, 'w', encoding='utf-8').write(out)
        return len([1 for a, b in zip(src.split('\n'), out.split('\n')) if a != b])
    return 0


for f in sorted(glob.glob('*.html')) + sorted(glob.glob('assets/*.js')):
    if f in ('index.html', 'assets/theme.js', 'assets/theme.css', 'assets/data.js'):
        continue
    n = migrate(f)
    print(f'{f:28s} lines changed: {n or "-"}')
