"""
check_svg.py - verify a poster character SVG and render previews.

Checks (printed as PASS/FAIL lines, and written to <svg>-check.json):
  - true vector: no <image>, base64, href, gradient, filter, opacity, stroke
  - viewBox height equals the expected poster_cm * 100 (when --real-cm given)
  - gap pixels: transparent pixels fully enclosed by the figure (white gaps)
  - shape and colour counts (flat-style budget)
Previews:
  <svg>-big.png        figure at reference resolution on white
  <svg>-on-grey.png    figure on the poster grey at its real print size (300 dpi)
  <svg>-vs-ref.png     reference | SVG side by side (when --ref given)

Usage: python check_svg.py FIGURE.svg [--real-cm 170] [--ref REF.jpg] [--height 1400]
"""
import argparse, json, re, os
import numpy as np, cv2, fitz
from PIL import Image
from svglib.svglib import svg2rlg
from reportlab.graphics import renderPDF

POSTER_GREY = (156, 156, 156)


def render_rgba(svg_path, px_h):
    tmp = svg_path + '.tmp.pdf'
    renderPDF.drawToFile(svg2rlg(svg_path), tmp)
    d = fitz.open(tmp); pg = d[0]
    z = px_h / pg.rect.height
    p = pg.get_pixmap(matrix=fitz.Matrix(z, z), alpha=True)
    a = np.frombuffer(p.samples, np.uint8).reshape(p.height, p.width, 4).copy()
    d.close(); os.remove(tmp)
    return a


def over(rgba, bg):
    al = rgba[:, :, 3:] / 255.0
    return (rgba[:, :, :3] * al + np.array(bg) * (1 - al)).astype(np.uint8)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('svg'); ap.add_argument('--real-cm', type=float)
    ap.add_argument('--ref'); ap.add_argument('--height', type=int, default=1400)
    a = ap.parse_args()
    src = open(a.svg).read()
    res = {}
    body = re.sub(r'<!--.*?-->', '', src, flags=re.S)
    bad = [k for k in ['<image', 'base64', 'href', 'Gradient', '<filter', 'opacity', 'stroke'] if k in body]
    res['true_vector'] = not bad
    print(('PASS' if not bad else 'FAIL'), 'true vector, no forbidden elements', bad or '')
    vb = [float(v) for v in re.search(r'viewBox="([^"]+)"', src).group(1).split()]
    res['viewbox'] = vb
    if a.real_cm:
        want = round(a.real_cm * 6 / 185 * 100, 2)
        ok = abs(vb[3] - want) < 0.6
        res['viewbox_height_ok'] = ok
        print(('PASS' if ok else 'FAIL'), f'viewBox height {vb[3]} (expected {want} = {a.real_cm:g}cm x 6/185 x 100)')
    fills = re.findall(r'fill="(#[0-9a-fA-F]{6})"', body)
    res['shapes'] = len(re.findall(r'<path', body)); res['colours'] = len(set(fills))
    print(f'INFO {res["shapes"]} shapes, {res["colours"]} colours')

    rgba = render_rgba(a.svg, a.height)
    t = (rgba[:, :, 3] < 128).astype(np.uint8)
    n, cc = cv2.connectedComponents(t)
    border = set(np.unique(np.r_[cc[0], cc[-1], cc[:, 0], cc[:, -1]]))
    # an enclosed transparent area is either a SEAM GAP (hairline sliver where two
    # shapes failed to meet - a defect) or an OPENING (real background seen through
    # a trigger guard, between arm and body, between the legs - intended).
    # Tell them apart by thickness: a seam is at most ~1.5 px wide.
    fig_px = int((rgba[:, :, 3] >= 128).sum())
    dist = cv2.distanceTransform(t, cv2.DIST_L2, 3)
    seams, openings = 0, []
    mark = over(rgba, (255, 255, 255)).copy()
    for j in range(1, n):
        if j in border:
            continue
        comp = cc == j
        if dist[comp].max() <= 1.5:
            seams += int(comp.sum()); mark[comp] = (0, 200, 255)
        else:
            ys, xs = np.where(comp)
            openings.append({'px': int(comp.sum()), 'at_frac_xy': [round(float(xs.mean()) / t.shape[1], 2), round(float(ys.mean()) / t.shape[0], 2)]})
            mark[comp] = (255, 0, 255)
    res['seam_gap_pixels'] = seams; res['openings'] = openings
    ok = seams <= 0.0001 * fig_px + 10
    print(('PASS' if ok else 'FAIL'), f'seam gaps (hairline white slivers between shapes): {seams} px')
    print(f'INFO {len(openings)} see-through openings (magenta in -openings.png) - confirm each is real background:',
          [o['at_frac_xy'] for o in openings])
    res['gaps_ok'] = ok
    Image.fromarray(mark).save(os.path.splitext(a.svg)[0] + '-openings.png')

    stem = os.path.splitext(a.svg)[0]
    Image.fromarray(over(rgba, (255, 255, 255))).save(stem + '-big.png')
    if a.real_cm:
        ph = int(round(a.real_cm * 6 / 185 / 2.54 * 300))
        g = render_rgba(a.svg, ph)
        canvas = np.full((ph + 40, g.shape[1] + 40, 3), POSTER_GREY, np.uint8)
        canvas[20:20 + ph, 20:20 + g.shape[1]] = over(g, POSTER_GREY)
        Image.fromarray(canvas).save(stem + '-on-grey.png')
        res['print_width_cm'] = round(g.shape[1] / 300 * 2.54, 2)
        print(f'INFO print size {res["print_width_cm"]} cm wide x {a.real_cm * 6 / 185:.2f} cm tall')
    if a.ref:
        ref = np.array(Image.open(a.ref).convert('RGB'))
        big = over(rgba, (255, 255, 255))
        r = cv2.resize(ref, (int(ref.shape[1] * big.shape[0] / ref.shape[0]), big.shape[0]))
        Image.fromarray(np.hstack([r, np.full((big.shape[0], 20, 3), 255, np.uint8), big])).save(stem + '-vs-ref.png')
    json.dump(res, open(stem + '-check.json', 'w'), indent=1)


if __name__ == '__main__':
    main()
