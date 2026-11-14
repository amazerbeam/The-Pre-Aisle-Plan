"""
flat_to_svg.py - FLAT-ART mode: trace a reference that is ALREADY flat-colour
vector-style artwork (clean fills, no photo texture, faceless) on a plain white
background into a poster SVG.

Use this instead of ref_to_svg.py when the reference already looks like the
poster style. ref_to_svg.py is for 3D renders (the Claire standard) and must
not be retuned for flat art: its body-part model and background-bleed rules
destroy light greys/whites (grey T-shirt, flashlight lens) in flat art.

Pipeline
  1. Silhouette : flood-fill near-white from the image border. Enclosed white
                  pockets are background only if large (gap between arm and
                  body); small white areas inside the figure (lens, highlights)
                  stay as figure colour.
  2. Palette    : light edge-preserving smoothing, then k-means over the
                  figure's colours in Lab; clusters closer than --merge-de are
                  one colour. The artwork's own colours are kept (no gain).
  3. Clean      : specks below --min-speck of the figure area join their
                  neighbours; a light majority filter smooths stair-steps.
  4. Trace      : stacked layers (each colour also covers every colour painted
                  after it) so no gaps can show; viewBox height = poster_cm*100.

Usage
  python flat_to_svg.py REF.png --name NAME --real-cm 170 --out DIR
        [--colours 22] [--merge-de 7] [--min-speck 0.00006]
Outputs in DIR: NAME.svg, NAME-labels.png, NAME-compare.png, NAME-report.json
"""
import argparse, json, os
import numpy as np, cv2
from PIL import Image

ANCHOR = 6 / 185


def hexc(rgb):
    return '#%02x%02x%02x' % tuple(int(round(v)) for v in rgb)


def silhouette(img, tol, pocket_frac):
    bgc = np.median(np.r_[img[0], img[-1], img[:, 0], img[:, -1]], 0)
    near = (np.abs(img.astype(int) - bgc).sum(2) < tol).astype(np.uint8)
    n, lab, st, _ = cv2.connectedComponentsWithStats(near)
    border = set(np.unique(np.r_[lab[0], lab[-1], lab[:, 0], lab[:, -1]])) - {0}
    bg = np.isin(lab, list(border))
    for j in range(1, n):
        if j not in border and st[j, 4] > pocket_frac * img.shape[0] * img.shape[1]:
            bg |= lab == j
    fig = (~bg).astype(np.uint8)
    n, cc, st, _ = cv2.connectedComponentsWithStats(fig)
    fig = cc == 1 + st[1:, 4].argmax()
    # anti-aliased rim: half-covered pixels count as figure only if clearly not bg
    return cv2.GaussianBlur(fig.astype(np.float32), (0, 0), 0.8) > 0.5, bgc


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('ref'); ap.add_argument('--name', required=True)
    ap.add_argument('--real-cm', type=float, required=True)
    ap.add_argument('--out', required=True)
    ap.add_argument('--colours', type=int, default=22, help='k-means clusters before merging')
    ap.add_argument('--merge-de', type=float, default=7, help='merge clusters closer than this (Lab dE)')
    ap.add_argument('--min-speck', type=float, default=0.00006, help='speck size as a fraction of the figure area')
    ap.add_argument('--bg-tol', type=int, default=30)
    ap.add_argument('--pocket', type=float, default=0.0015, help='enclosed white pocket kept as background if larger than this fraction of the image')
    a = ap.parse_args()
    os.makedirs(a.out, exist_ok=True)

    img = np.array(Image.open(a.ref).convert('RGB'))
    H, W = img.shape[:2]
    fig, bgc = silhouette(img, a.bg_tol, a.pocket)

    sm = cv2.bilateralFilter(img, 7, 25, 5)
    LAB = cv2.cvtColor(sm, cv2.COLOR_RGB2LAB).astype(np.float32)
    x = LAB[fig]
    crit = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 50, 0.3)
    _, lab_k, cen = cv2.kmeans(x, a.colours, None, crit, 4, cv2.KMEANS_PP_CENTERS)
    lab_k = lab_k.ravel()
    # merge near-identical clusters (union-find, biggest cluster wins the colour)
    cnt = np.bincount(lab_k, minlength=len(cen))
    parent = list(range(len(cen)))
    def root(i):
        while parent[i] != i:
            i = parent[i]
        return i
    for i in np.argsort(-cnt):
        for j in np.argsort(-cnt):
            if j == i or cnt[j] < cnt[i]:
                continue
            if np.linalg.norm(cen[i] - cen[j]) < a.merge_de:
                parent[root(i)] = root(j); break
    lab_k = np.array([root(v) for v in lab_k])
    T = np.full((H, W), -1, int)
    T[fig] = lab_k
    ids = sorted(set(lab_k))

    # anti-alias slivers: pixels of a colour that only exist as a 1-2 px line
    # (the blend between two fills along every edge) are not a fill of their own
    # -> handed to the neighbouring fills below
    ker = np.ones((3, 3), np.uint8)
    for i in ids:
        m = (T == i).astype(np.uint8)
        thin = (m - cv2.morphologyEx(m, cv2.MORPH_OPEN, ker)).astype(bool)
        T[thin] = -2

    # specks -> neighbours
    minarea = max(12, int(a.min_speck * fig.sum()))
    for i in ids:
        n, cc, st, _ = cv2.connectedComponentsWithStats((T == i).astype(np.uint8), connectivity=4)
        for j in range(1, n):
            if st[j, 4] < minarea:
                T[cc == j] = -2
    while (T == -2).any():
        before = (T == -2).sum()
        for i in ids:
            grow = cv2.dilate((T == i).astype(np.uint8), np.ones((3, 3), np.uint8)).astype(bool)
            T[grow & (T == -2)] = i
        if (T == -2).sum() == before:
            break
    sig = max(0.8, H / 2400)
    sc = np.stack([cv2.GaussianBlur((T == i).astype(np.float32), (0, 0), sig) for i in ids])
    T = np.where(fig, np.array(ids)[sc.argmax(0)], -1)
    ids = [i for i in ids if (T == i).any()]

    # each colour = median of the ORIGINAL pixels it covers (true artwork colour)
    rgb = {i: np.median(img[T == i].astype(float), 0) for i in ids}

    ys, xs = np.where(fig)
    y0, y1, x0, x1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
    poster_cm = a.real_cm * ANCHOR
    vbh = round(poster_cm * 100, 2)
    k = vbh / (y1 - y0)
    order = sorted(ids, key=lambda i: -(T == i).sum())   # biggest areas at the bottom
    rank = np.full(max(ids) + 1, -1); rank[order] = np.arange(len(order))
    R = np.where(T >= 0, rank[np.maximum(T, 0)], -1)

    def path(mask):
        cs, _ = cv2.findContours(mask.astype(np.uint8), cv2.RETR_CCOMP, cv2.CHAIN_APPROX_NONE)
        d = []
        for c in cs:
            if cv2.contourArea(c) < 4:
                continue
            c = cv2.approxPolyDP(c, 0.6, True)[:, 0]
            d.append('M' + ' L'.join(f'{(px - x0) * k:.2f},{(py - y0) * k:.2f}' for px, py in c) + 'Z')
        return ' '.join(d)

    svg = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {(x1 - x0) * k:.2f} {vbh}">',
           f'  <!-- {a.name}: {a.real_cm:g}cm real -> {poster_cm:.2f}cm poster (x 6/185), viewBox height {vbh} = 0.01cm units.',
           f'       Generated by flat_to_svg.py (flat-art mode) from {os.path.basename(a.ref)}. Stacked flat layers. -->']
    report = {'name': a.name, 'mode': 'flat-art', 'real_cm': a.real_cm, 'poster_cm': round(poster_cm, 2),
              'viewbox': [round((x1 - x0) * k, 2), vbh], 'tones': []}
    # each colour = its own region grown 1 px into its neighbours (inside the
    # silhouette). The overlap closes seams, and - unlike a full stack - a big
    # lower layer can't bleed its anti-aliased edge through at every boundary.
    for n, i in enumerate(order):
        own = (T == i).astype(np.uint8)
        d = path(cv2.dilate(own, np.ones((3, 3), np.uint8)).astype(bool) & fig if n else fig)
        if not d:
            continue
        svg.append(f'  <path id="c{n}" fill="{hexc(rgb[i])}" fill-rule="evenodd" d="{d}"/>')
        report['tones'].append({'fill': hexc(rgb[i]), 'pixels': int((T == i).sum())})
    svg.append('</svg>')
    open(os.path.join(a.out, a.name + '.svg'), 'w').write('\n'.join(svg))

    flat = np.full((H, W, 3), 255, np.uint8)
    for i in ids:
        flat[T == i] = rgb[i]
    crop = lambda im: im[y0:y1, x0:x1]
    Image.fromarray(crop(flat)).save(os.path.join(a.out, a.name + '-labels.png'))
    Image.fromarray(np.hstack([crop(img), np.full((y1 - y0, 20, 3), 255, np.uint8), crop(flat)])).save(
        os.path.join(a.out, a.name + '-compare.png'))
    report['shapes'] = len(report['tones'])
    json.dump(report, open(os.path.join(a.out, a.name + '-report.json'), 'w'), indent=1)
    print(f"{report['shapes']} colours, viewBox {report['viewbox']}")


if __name__ == '__main__':
    main()
