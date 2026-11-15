"""Top-down tactical map video of a recorded floor 01 bot run.
usage: python3 -I render.py run.json out.mp4 title [ff_before_hunt_secs] [ff_speed]
"""
import json, sys, math, subprocess, os
from PIL import Image, ImageDraw, ImageFont

src, out, title = sys.argv[1], sys.argv[2], sys.argv[3]
ff_lead = float(sys.argv[4]) if len(sys.argv) > 4 else -1
ff_k = int(sys.argv[5]) if len(sys.argv) > 5 else 8
D = json.load(open(src)); ST, F = D['st'], D['F']

W, H = 1280, 960
HEAD, FOOT = 64, 74
xs = [q for r in ST['rooms'] for R in r['rects'] for q in (R[0], R[2])]
zs = [q for r in ST['rooms'] for R in r['rects'] for q in (R[1], R[3])]
x0, x1, z0, z1 = min(xs) - .6, max(xs) + .6, min(zs) - .6, max(zs) + .6
S = min((W - 30) / (x1 - x0), (H - HEAD - FOOT - 10) / (z1 - z0))
ox = (W - (x1 - x0) * S) / 2
oy = HEAD + 5

def P(x, z): return (ox + (x - x0) * S, oy + (z1 - z) * S)   # north (+z) up

def font(sz, bold=False):
    for p in (['/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'] if bold else []) + ['/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf']:
        if os.path.exists(p): return ImageFont.truetype(p, sz)
    return ImageFont.load_default()
F11, F13, F15, F18, F22 = font(11), font(13), font(15, True), font(18, True), font(22, True)

JOBC = {'press': (230, 60, 50), 'flank': (255, 150, 30), 'cut': (220, 70, 220), 'guard': (150, 110, 255), 'cover': (70, 150, 255), '': (150, 150, 150)}
JOBN = {'press': 'press', 'flank': 'flank', 'cut': 'cut off', 'guard': 'guard door', 'cover': 'hang back', '': 'searching / unaware'}

# the static floor, drawn once
base = Image.new('RGB', (W, H), (14, 14, 16)); g = ImageDraw.Draw(base)
for r in ST['rooms']:
    for R in r['rects']:
        a, b = P(R[0], R[3]), P(R[2], R[1]); g.rectangle([a, b], fill=(34, 34, 38))
for h in ST['hides']:
    c = P(h['x'], h['z']); g.rectangle([c[0] - 5, c[1] - 5, c[0] + 5, c[1] + 5], outline=(70, 90, 110), width=1)
for w in ST['walls']:
    segs, s = [], w['a']
    for g0, g1, k in sorted(w['gaps']):
        if g0 > s: segs.append((s, g0))
        s = max(s, g1)
    if w['b'] > s: segs.append((s, w['b']))
    for a, b in segs:
        p, q = (P(a, w['c']), P(b, w['c'])) if w['axis'] == 'x' else (P(w['c'], a), P(w['c'], b))
        g.line([p, q], fill=(150, 146, 136), width=3)
for o in ST['openings']:
    hw = o['w'] / 2
    p, q = (P(o['x'] - hw, o['z']), P(o['x'] + hw, o['z'])) if o['axis'] == 'x' else (P(o['x'], o['z'] - hw), P(o['x'], o['z'] + hw))
    if o['kind'] == 'sheet': g.line([p, q], fill=(90, 160, 170), width=2)
    elif o['kind'] == 'hole':
        for k in range(5): t = k / 4; g.ellipse([p[0] + (q[0] - p[0]) * t - 2, p[1] + (q[1] - p[1]) * t - 2, p[0] + (q[0] - p[0]) * t + 2, p[1] + (q[1] - p[1]) * t + 2], fill=(220, 140, 60))
    elif o['kind'] == 'chain': g.line([p, q], fill=(220, 40, 40), width=5)
for r in ST['rooms']:
    R = max(r['rects'], key=lambda R: (R[2] - R[0]) * (R[3] - R[1])); c = P((R[0] + R[2]) / 2, (R[1] + R[3]) / 2)
    g.text((c[0], c[1]), r['id'], font=F11, fill=(80, 80, 88), anchor='mm')
if ST['exit']:
    c = P(*ST['exit']); g.text((c[0] + 10, c[1] - 14), 'EXIT (chained)', font=F11, fill=(220, 70, 60))
# legend
ly = H - FOOT + 12; lx = 16
for k in ['press', 'flank', 'cut', 'guard', 'cover', '']:
    g.ellipse([lx, ly, lx + 12, ly + 12], fill=JOBC[k]); g.text((lx + 17, ly - 1), JOBN[k], font=F13, fill=(200, 200, 200)); lx += 30 + g.textlength(JOBN[k], font=F13) + 14
g.ellipse([lx, ly, lx + 12, ly + 12], fill=(250, 250, 250)); g.text((lx + 17, ly - 1), 'Ray (you)', font=F13, fill=(230, 230, 230)); lx += 120
g.ellipse([lx, ly, lx + 9, ly + 9], fill=(90, 190, 110)); g.text((lx + 15, ly - 1), 'tenant', font=F13, fill=(200, 200, 200)); lx += 90
ly2 = ly + 24; lx = 16
for txt, col in [('yellow line: he can see you', (240, 210, 70)), ('pale wedge: flashlight', (120, 112, 60)), ('white ring: knows you\'re here', (240, 240, 240)),
                 ('red line: his shot', (255, 70, 60)), ('cyan: hung sheet', (90, 160, 170)), ('orange dots: crawl hole', (220, 140, 60)), ('square: hiding spot', (90, 110, 130))]:
    g.text((lx, ly2), txt, font=F13, fill=col); lx += g.textlength(txt, font=F13) + 22

def lerp(a, b, t): return a + (b - a) * t
def lerpa(a, b, t):
    d = (b - a + math.pi) % (2 * math.pi) - math.pi; return a + d * t

def draw(fa, fb, t, speed, tail):
    im = base.copy(); g = ImageDraw.Draw(im, 'RGBA')
    ray = [lerp(fa['ray'][i], fb['ray'][i], t) for i in range(2)]; ryaw = lerpa(fa['ray'][2], fb['ray'][2], t)
    R = fa['ray']
    # Ray's trail
    if len(tail) > 1: g.line([P(*q) for q in tail], fill=(255, 255, 255, 60), width=2)
    men = []
    for ma, mb in zip(fa['men'], fb['men']):
        x, z, hd = lerp(ma[1], mb[1], t), lerp(ma[2], mb[2], t), lerpa(ma[3], mb[3], t); men.append((ma, x, z, hd))
    for m, x, z, hd in men:   # flashlight wedges under everything
        if m[11] and m[4] != 'dead':
            c = P(x, z); pts = [c]
            for k in range(-4, 5):
                a = hd + k * .09; pts.append(P(x + math.sin(a) * 6, z + math.cos(a) * 6))
            g.polygon(pts, fill=(255, 235, 140, 34))
    for m, x, z, hd in men:   # sight lines
        if m[7] and m[4] not in ('dead', 'down') and not m[5]: g.line([P(x, z), P(*ray)], fill=(240, 210, 70, 170), width=2)
    for s in fa['shots']:
        if s[0] == 'e': g.line([P(s[1], s[2]), P(s[3], s[4])], fill=(255, 70, 60, 230), width=3)
        else: g.line([P(s[1], s[2]), P(s[1] - math.sin(s[3]) * 7, s[2] - math.cos(s[3]) * 7)], fill=(255, 240, 120, 230), width=2)
    near = 0
    for m, x, z, hd in men:
        name, st, civ, aware, see, job, role, hj, torch, bark, pm, surr = m[0], m[4], m[5], m[6], m[7], m[8], m[9], m[10], m[11], m[12], m[13], m[14]
        c = P(x, z)
        if st == 'dead':
            g.line([c[0] - 6, c[1] - 6, c[0] + 6, c[1] + 6], fill=(110, 110, 110), width=2); g.line([c[0] - 6, c[1] + 6, c[0] + 6, c[1] - 6], fill=(110, 110, 110), width=2); continue
        if civ:
            g.ellipse([c[0] - 6, c[1] - 6, c[0] + 6, c[1] + 6], fill=(90, 190, 110)); continue
        if st not in ('down', 'kneel') and math.hypot(x - ray[0], z - ray[1]) < 5: near += 1
        col = JOBC.get(job, JOBC['']) if aware else (150, 150, 150)
        r = 9 if st not in ('down', 'kneel') else 7
        if st in ('down', 'kneel'): col = tuple(int(v * .55) for v in col)
        g.ellipse([c[0] - r, c[1] - r, c[0] + r, c[1] + r], fill=col)
        if aware: g.ellipse([c[0] - r - 3, c[1] - r - 3, c[0] + r + 3, c[1] + r + 3], outline=(240, 240, 240), width=2)
        elif pm > 5: g.arc([c[0] - r - 3, c[1] - r - 3, c[0] + r + 3, c[1] + r + 3], -90, -90 + 3.6 * pm, fill=(240, 200, 60), width=3)   # suspicion filling
        g.line([c, P(x + math.sin(hd) * .55, z + math.cos(hd) * .55)], fill=(20, 20, 20), width=3)
        HJ = {'pair': 'searching', 'look': 'checking a noise', 'hold': 'holding his room', 'loop': 'patrol', 'amb': 'waiting in ambush', 'ambush': 'waiting in ambush', 'warden': 'at the door'}
        what = (JOBN.get(job, '') if job else 'after you') if aware else (HJ.get(hj, hj) if hj else '')
        if role and not aware and role in ('ambusher', 'warden', 'nervous') and not hj: what = role
        lab = name + ('  ' + what if what and st not in ('down', 'kneel') else '') + (' (down)' if st in ('down', 'kneel') else '') + (' (gave up)' if surr else '')
        g.text((c[0] + 12, c[1] - 7), lab, font=F11, fill=(220, 220, 220))
        if bark:
            tw = g.textlength(bark, font=F13); bx, by = c[0] + 12, c[1] - 30
            g.rectangle([bx - 4, by - 2, bx + tw + 4, by + 16], fill=(0, 0, 0, 200), outline=(140, 30, 25)); g.text((bx, by), bark, font=F13, fill=(255, 255, 255))
    # Ray
    c = P(*ray); dead = R[6]
    if dead:
        g.line([c[0] - 9, c[1] - 9, c[0] + 9, c[1] + 9], fill=(255, 60, 60), width=4); g.line([c[0] - 9, c[1] + 9, c[0] + 9, c[1] - 9], fill=(255, 60, 60), width=4)
    else:
        r = 8 if R[3] else 10
        if R[4]: g.ellipse([c[0] - r - 5, c[1] - r - 5, c[0] + r + 5, c[1] + r + 5], outline=(160, 220, 255), width=2)
        g.ellipse([c[0] - r, c[1] - r, c[0] + r, c[1] + r], fill=(250, 250, 250))
        g.line([c, P(ray[0] - math.sin(ryaw) * .8, ray[1] - math.cos(ryaw) * .8)], fill=(250, 250, 250), width=3)
        held = ' '.join(k for k in (R[7], R[8]) if k)
        g.text((c[0] + 13, c[1] + 4), 'RAY' + ('  crouched' if R[3] else '') + ('  HIDDEN' if R[4] else '') + (f'  [{held}]' if held else ''), font=F13, fill=(255, 255, 255))
    # header
    g.rectangle([0, 0, W, HEAD - 4], fill=(10, 10, 12))
    g.text((16, 10), title, font=F18, fill=(240, 236, 226))
    hunt = fa['hunt'].upper() or '-'; hc = {'HUNTING': (255, 80, 60), 'EDGE': (255, 190, 60), 'CALM': (120, 200, 120)}.get(hunt, (200, 200, 200))
    tm = f"{fa['t']:6.1f} s"; g.text((16, 38), tm, font=F15, fill=(200, 200, 200))
    g.text((110, 38), 'floor: ' + hunt, font=F15, fill=hc)
    g.text((300, 38), f"HP {R[5]}", font=F15, fill=(255, 120, 110) if R[5] < 60 else (220, 220, 220))
    g.text((390, 38), f"men standing within 5 m: {near}", font=F15, fill=(255, 150, 120) if near > 2 else (220, 220, 220))
    if fa.get('siege'): g.text((680, 38), 'SIEGE: one way in', font=F15, fill=(255, 150, 30))
    if speed > 1: g.text((W - 16, 12), f'>> x{speed}', font=F22, fill=(255, 220, 120), anchor='ra')
    else: g.text((W - 16, 12), 'real time', font=F15, fill=(160, 160, 160), anchor='ra')
    return im

if os.environ.get('STILL'):
    t0 = float(os.environ['STILL']); i = min(range(len(F)), key=lambda k: abs(F[k]['t'] - t0))
    tail = [f['ray'][:2] for f in F[:i]][-400:]; draw(F[i], F[min(i + 1, len(F) - 1)], 0, 1, tail).save(out); print('still', out); sys.exit(0)
# the timeline: quiet stretch fast-forwarded, then real time, smooth at 30 fps (recording is 10 fps)
hunt_t = next((f['t'] for f in F if f['hunt'] == 'hunting'), None)
cut_t = (hunt_t - ff_lead) if (ff_lead >= 0 and hunt_t is not None) else -1
ff = subprocess.Popen(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', '30', '-i', '-',
                       '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '20', '-pix_fmt', 'yuv420p', out + '.tmp.mp4'], stdin=subprocess.PIPE)
tail = []; n = 0; i = 0
while i < len(F) - 1:
    fa, fb = F[i], F[i + 1]
    tail.append(fa['ray'][:2]); tail = tail[-400:]
    if fa['t'] < cut_t:   # fast: one output frame per ff_k/3 recorded frames
        step = max(1, ff_k // 3)
        ff.stdin.write(draw(fa, fb, 0, ff_k, tail).tobytes()); n += 1
        for j in range(1, step):
            if i + j < len(F): tail.append(F[i + j]['ray'][:2])
        i += step; continue
    for k in range(3): ff.stdin.write(draw(fa, fb, k / 3, 1, tail).tobytes()); n += 1
    i += 1
last = draw(F[-1], F[-1], 0, 1, tail)
for k in range(75): ff.stdin.write(last.tobytes()); n += 1
ff.stdin.close(); ff.wait()
os.replace(out + '.tmp.mp4', out); print(out, n, 'frames', round(n / 30, 1), 's')
