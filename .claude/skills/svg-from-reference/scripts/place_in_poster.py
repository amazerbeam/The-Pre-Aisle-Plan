"""
place_in_poster.py - composite a character SVG into the poster preview.

The figure is drawn BEHIND everything already on the canvas (stadium-riser
rule: a row behind never covers the row in front), except an optional
"front band": selected layer groups (e.g. skin,prop = hands + gun) inside a
height band of the figure, which paint OVER neighbours - used when a held
weapon or arm should overlap the character beside it.

Scale: px_per_cm is calibrated off a known figure in the composite. Default
calibration is for Gaming Poster/gaming_composite.jpg (1600x1200): Cuphead,
3.08 cm poster height, measures 105 px -> 34.09 px/cm.

Usage:
  python place_in_poster.py FIGURE.svg --real-cm 170 --x 852 --front-feet-y 1165 \
      [--row-rise 0.28] [--front-groups skin,prop --front-band 0.40,0.62] \
      [--poster PATH] [--px-per-cm 34.09] [--out poster-with-NAME.png]
  --x            left edge of the figure, poster px
  --front-feet-y feet line of the row IN FRONT; the figure stands row_rise x its
                 own height above it (chest rule). Use --feet-y to set it directly.
Writes the poster and a 3x zoom crop (<out>-zoom.png).
"""
import argparse, os, re
import numpy as np, fitz
from PIL import Image
from svglib.svglib import svg2rlg
from reportlab.graphics import renderPDF

DEFAULT_POSTER = r'E:/Photoshop/Claude/Gaming Poster/gaming_composite.jpg'
GROUND = np.array([156, 156, 156])   # measured poster ground (not the #909090 in older notes)


def render(svg_text, px_h, tmpdir):
    p_svg, p_pdf = os.path.join(tmpdir, '_pl.svg'), os.path.join(tmpdir, '_pl.pdf')
    open(p_svg, 'w').write(svg_text)
    renderPDF.drawToFile(svg2rlg(p_svg), p_pdf)
    d = fitz.open(p_pdf); pg = d[0]; z = px_h / pg.rect.height
    p = pg.get_pixmap(matrix=fitz.Matrix(z, z), alpha=True)
    a = np.frombuffer(p.samples, np.uint8).reshape(p.height, p.width, 4).astype(float)
    d.close(); os.remove(p_svg); os.remove(p_pdf)
    return a


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('svg'); ap.add_argument('--real-cm', type=float, required=True)
    ap.add_argument('--x', type=int, required=True)
    ap.add_argument('--front-feet-y', type=int); ap.add_argument('--feet-y', type=int)
    ap.add_argument('--row-rise', type=float, default=0.28)
    ap.add_argument('--front-groups', default='')
    ap.add_argument('--front-band', default='0.40,0.62')
    ap.add_argument('--poster', default=DEFAULT_POSTER)
    ap.add_argument('--px-per-cm', type=float, default=105 / 3.08)
    ap.add_argument('--out', required=True)
    a = ap.parse_args()
    tmp = os.path.dirname(os.path.abspath(a.out))
    full = open(a.svg).read()
    h = int(round(a.real_cm * 6 / 185 * a.px_per_cm))
    rgba = render(full, h, tmp)
    h, w = rgba.shape[:2]
    feet = a.feet_y if a.feet_y is not None else int(round(a.front_feet_y - a.row_rise * h))
    y0, X = feet - h, a.x

    front = np.zeros((h, w), bool)
    if a.front_groups:
        keep = set(a.front_groups.split(','))
        def hide(m):
            return m.group(0) if m.group(1).split('-')[0] in keep else m.group(0).replace(m.group(2), 'none')
        fsvg = re.sub(r'<path id="([^"]+)" fill="(#[0-9a-fA-F]{6})"', hide, full)
        front = render(fsvg, h, tmp)[:, :, 3] > 0
        lo, hi = (float(v) for v in a.front_band.split(','))
        front[:int(lo * h)] = False; front[int(hi * h):] = False

    P = np.array(Image.open(a.poster).convert('RGB')).astype(float)
    occupied = np.abs(P - GROUND).sum(2) > 30
    win = (slice(y0, y0 + h), slice(X, X + w))
    al = rgba[:, :, 3:] / 255 * ((~occupied[win]) | front)[:, :, None]
    P[win] = P[win] * (1 - al) + rgba[:, :, :3] * al
    out = P.astype(np.uint8)
    Image.fromarray(out).save(a.out)
    c = Image.fromarray(out[max(0, y0 - 60):y0 + h + 120, max(0, X - 140):X + w + 200])
    c.resize((c.width * 3, c.height * 3), Image.LANCZOS).save(os.path.splitext(a.out)[0] + '-zoom.png')
    print(f'placed {w}x{h}px at x={X}, feet y={feet}; front-band px={int(front.sum())}')
    print('wrote', a.out)


if __name__ == '__main__':
    main()
