"""
ref_to_svg.py - turn a character reference image (3D render, photo-like art or
flat art) into a flat-colour, face-free, gap-free SVG for the lineup poster.

Pipeline
  1. Silhouette   : flood-fill the plain background from the image border, plus
                    enclosed background pockets (e.g. the gap between the legs).
  2. Body parts   : clothes-parsing SegFormer (mattmdjaga/segformer_b2_clothes)
                    labels hair / face / upper-clothes / pants / shoes / bag /
                    arms ... Parts decide WHAT a pixel is; colour decides WHERE
                    the edge is (step 4), because the model's edges are blobby.
  3. Flatten      : per part, smooth away texture and k-means into 1-3 tones;
                    tones that are clearly a different material (a gun in a
                    hand, a black top under a jacket) become their own colour.
                    The face part is forced to ONE flat skin tone - no features.
  4. Refine edges : pixels near a boundary are re-assigned to whichever
                    neighbouring tone they are closest to in colour.
  5. Clean        : remove specks, majority-filter jagged edges.
  6. Trace        : stacked layers - each colour also covers the area of every
                    colour painted after it, so no background can show between
                    shapes, and what is on top follows the reference.
  7. Scale        : viewBox height = poster_cm * 100 (1 unit = 0.01 cm),
                    poster_cm = real_cm * 6/185 (Arthur Morgan anchor).

Usage
  python ref_to_svg.py REF.jpg --name claire-redfield --real-cm 170 --out DIR
        [--max-tones 3] [--palette "jacket=#a92e26,skin=#edb284"]
Outputs in DIR: NAME.svg, NAME-labels.png, NAME-compare.png, NAME-report.json
"""
import argparse, json, os, re
import numpy as np, cv2
from PIL import Image

ANCHOR = 6 / 185
MODEL = 'mattmdjaga/segformer_b2_clothes'
# model class -> material group. Groups get their own colours; parts in the same
# group share them (one colour per material, reused everywhere).
GROUP = {1: 'hat', 2: 'hair', 3: 'eyewear', 4: 'top', 5: 'bottom', 6: 'bottom',
         7: 'top', 8: 'leather', 9: 'shoes', 10: 'shoes', 11: 'skin', 12: 'skin',
         13: 'skin', 14: 'skin', 15: 'skin', 16: 'leather', 17: 'top'}
# paint order bottom -> top for the stacked trace (visible result follows the
# label map whatever the order; order only decides what a sub-pixel seam shows)
ORDER = ['bottom', 'top', 'shoes', 'leather', 'hat', 'hair', 'eyewear', 'skin', 'prop']


def segment(img):
    import torch
    from transformers import SegformerImageProcessor, AutoModelForSemanticSegmentation
    p = SegformerImageProcessor.from_pretrained(MODEL)
    m = AutoModelForSemanticSegmentation.from_pretrained(MODEL)
    with torch.no_grad():
        lo = m(**p(images=Image.fromarray(img), return_tensors='pt')).logits
    up = torch.nn.functional.interpolate(lo, size=img.shape[:2], mode='bilinear', align_corners=False)[0]
    return up.argmax(0).numpy()


def silhouette(img):
    corner = np.median(np.r_[img[0], img[-1], img[:, 0], img[:, -1]], 0)
    near = (np.abs(img.astype(int) - corner).sum(2) < 45).astype(np.uint8)
    n, lab = cv2.connectedComponents(near)
    border = set(np.unique(np.r_[lab[0], lab[-1], lab[:, 0], lab[:, -1]])) - {0}
    bg = np.isin(lab, list(border)) & (near == 1)
    pocket_min = 0.0002 * img.shape[0] * img.shape[1]
    for j in range(1, n):
        if j not in border and (lab == j).sum() > pocket_min:
            bg |= lab == j
    fig = (~bg).astype(np.uint8)
    fig = cv2.morphologyEx(fig, cv2.MORPH_OPEN, np.ones((3, 3), np.uint8))
    n, cc, st, _ = cv2.connectedComponentsWithStats(fig)
    fig = cc == 1 + st[1:, 4].argmax()
    return cv2.GaussianBlur(fig.astype(np.float32), (0, 0), 1.5) > 0.5


def to_lab(rgb):
    return cv2.cvtColor(rgb.reshape(-1, 1, 3).astype(np.uint8), cv2.COLOR_RGB2LAB).reshape(-1, 3).astype(float)


def kmeans(x, k):
    k = max(1, min(k, len(x)))
    crit = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 40, 0.5)
    _, lab, cen = cv2.kmeans(x.astype(np.float32), k, None, crit, 4, cv2.KMEANS_PP_CENTERS)
    return lab.ravel(), cen


def hexc(rgb):
    return '#%02x%02x%02x' % tuple(int(round(v)) for v in rgb)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('ref'); ap.add_argument('--name', required=True)
    ap.add_argument('--real-cm', type=float, required=True)
    ap.add_argument('--out', required=True)
    ap.add_argument('--max-tones', type=int, default=3)
    ap.add_argument('--merge-de', type=float, default=10)
    ap.add_argument('--saturation', type=float, default=1.15)
    ap.add_argument('--palette', default='', help='group=#hex overrides for the base tone')
    a = ap.parse_args()
    os.makedirs(a.out, exist_ok=True)

    img = np.array(Image.open(a.ref).convert('RGB'))
    H, W = img.shape[:2]
    fig = silhouette(img)
    parts = segment(img)
    # every figure pixel gets a group; pixels the model called background but
    # that are inside the silhouette (props, stray edges) -> nearest part
    grp_names = sorted(set(GROUP.values())) + ['prop']
    gid = {g: i for i, g in enumerate(grp_names)}
    G = np.full((H, W), -1, int)
    for c, g in GROUP.items():
        G[(parts == c) & fig] = gid[g]
    un = fig & (G < 0)
    if un.any():
        # unlabelled figure pixels: big blobs are a prop (e.g. weapon), small ones fill from neighbours
        n, cc, st, _ = cv2.connectedComponentsWithStats(un.astype(np.uint8))
        for j in range(1, n):
            if st[j, 4] > 0.002 * fig.sum():
                G[cc == j] = gid['prop']
        while (fig & (G < 0)).any():
            for i in range(len(grp_names)):
                grow = cv2.dilate((G == i).astype(np.uint8), np.ones((3, 3), np.uint8)).astype(bool)
                G[grow & fig & (G < 0)] = i

    # flatten: remove texture first so k-means sees materials, not wrinkles
    sm = cv2.pyrMeanShiftFiltering(img, max(6, H // 120), 22)
    sm = cv2.bilateralFilter(sm, 9, 30, 9)
    LAB = to_lab(sm).reshape(H, W, 3)

    tones = []          # (group, rgb, lab)
    T = np.full((H, W), -1, int)
    skin_lab = None
    for g in grp_names:
        m = G == gid[g]
        if m.sum() < 30:
            continue
        x = LAB[m]
        k = 1 if g in ('eyewear',) else a.max_tones
        lab_k, cen = kmeans(x, k)
        # merge clusters closer than dE 12 (same tone)
        merged = list(range(len(cen)))
        for i in range(len(cen)):
            for j in range(i):
                if np.linalg.norm(cen[i] - cen[j]) < a.merge_de:
                    merged[i] = merged[j]
        lab_k = np.array([merged[v] for v in lab_k])
        idxs = np.where(m)
        for u in np.unique(lab_k):
            sel = lab_k == u
            if sel.sum() < 0.03 * m.sum():
                continue   # too small to be its own tone; refined into a neighbour below
            px = sm[idxs[0][sel], idxs[1][sel]].astype(float)
            lum = px @ [0.299, 0.587, 0.114]
            rgb = np.median(px[lum >= np.percentile(lum, 60)], 0)
            tones.append((g, rgb, np.median(x[sel], 0)))
            T[idxs[0][sel], idxs[1][sel]] = len(tones) - 1
        if g == 'skin':
            skin_lab = np.median(x, 0)

    # tones far from their group's dominant hue = a different material (gun in a
    # hand, black top under a jacket): relabel the group as 'prop'/'detail'
    for i, (g, rgb, lab) in enumerate(tones):
        if g == 'skin' and skin_lab is not None and np.linalg.norm(lab[1:] - skin_lab[1:]) > 18:
            tones[i] = ('prop', rgb, lab)

    bgc = np.median(np.r_[img[0], img[-1], img[:, 0], img[:, -1]], 0)
    for i, (g, rgb, lab) in enumerate(tones):
        if np.abs(np.array(rgb) - bgc).sum() < 60:
            T[T == i] = -1          # background-coloured bleed -> filled from neighbours below

    bg_lab = to_lab(bgc.reshape(1, 3))[0]
    # mixed tones: a colour lying between its group's main tone and the
    # background is anti-alias/translucency bleed (hair wisps against the
    # backdrop), not a material. Where it touches the outside it becomes
    # background; elsewhere it is filled from neighbours.
    for g in set(t[0] for t in tones):
        ids = [i for i, t in enumerate(tones) if t[0] == g and (T == i).any()]
        if len(ids) < 2:
            continue
        main = max(ids, key=lambda i: (T == i).sum())
        v = bg_lab - tones[main][2]
        for i in ids:
            if i == main:
                continue
            w = tones[i][2] - tones[main][2]
            t_ = float(w @ v / max(v @ v, 1e-6))
            perp = np.linalg.norm(w - t_ * v)
            if 0.25 < t_ < 1.1 and perp < 0.15 * np.sqrt(v @ v) and (T == i).sum() < 0.01 * fig.sum():
                m = T == i
                n, cc = cv2.connectedComponents(m.astype(np.uint8))
                outside0 = cv2.dilate((~fig).astype(np.uint8), np.ones((3, 3), np.uint8)).astype(bool)
                for j in range(1, n):
                    comp = cc == j
                    if (comp & outside0).any():
                        fig &= ~comp
                    T[comp] = -1
    # tiny near-white glints (buckles, specular highlights) -> neighbours
    for i, t in enumerate(tones):
        if t[2][0] > 235 and (T == i).sum() < 0.003 * fig.sum():
            T[T == i] = -1
    tl = np.array([t[2] for t in tones])
    for _ in range(3):
        outside = cv2.dilate((~fig).astype(np.uint8), np.ones((2 * max(3, H // 150) + 1,) * 2, np.uint8)).astype(bool)
        has = T >= 0
        d_tone = np.full((H, W), np.inf)
        d_tone[has] = np.linalg.norm(LAB[has] - tl[T[has]], axis=1)
        bleed = outside & fig & (np.linalg.norm(LAB - bg_lab, axis=2) < d_tone)
        if not bleed.any():
            break
        fig &= ~bleed; T[bleed] = -1
    n, cc, st, _ = cv2.connectedComponentsWithStats(fig.astype(np.uint8))
    keep = cc == 1 + st[1:, 4].argmax(); T[fig & ~keep] = -1; fig = keep

    # face: force one flat skin tone, no features - every non-hair pixel of the
    # face part becomes the face's dominant skin tone
    face = (parts == 11) & fig
    if face.any():
        ft = T[face]; ft = ft[ft >= 0]
        if len(ft):
            dom = np.bincount(ft).argmax()
            T[face] = dom

    # unassigned (dropped tiny clusters) -> nearest neighbouring tone
    while (fig & (T < 0)).any():
        before = (fig & (T < 0)).sum()
        for i in range(len(tones)):
            grow = cv2.dilate((T == i).astype(np.uint8), np.ones((3, 3), np.uint8)).astype(bool)
            T[grow & fig & (T < 0)] = i
        if (fig & (T < 0)).sum() == before:
            break

    # edge refinement: within a band around tone boundaries, take the
    # neighbouring tone closest in colour (the model's part edges are blobby)
    r = max(3, H // 150)
    edges = np.zeros((H, W), bool)
    for i in range(len(tones)):
        mk = (T == i).astype(np.uint8)
        edges |= (cv2.dilate(mk, np.ones((3, 3), np.uint8)) - cv2.erode(mk, np.ones((3, 3), np.uint8))).astype(bool)
    band = cv2.dilate(edges.astype(np.uint8), np.ones((2 * r + 1, 2 * r + 1), np.uint8)).astype(bool) & fig
    face_lock = cv2.erode(face.astype(np.uint8), np.ones((r, r), np.uint8)).astype(bool)
    best_d = np.full((H, W), np.inf); best_t = T.copy()
    for i, (_, _, lab) in enumerate(tones):
        near = cv2.dilate((T == i).astype(np.uint8), np.ones((2 * r + 1, 2 * r + 1), np.uint8)).astype(bool) & band
        d = np.linalg.norm(LAB - lab, axis=2)
        upd = near & (d < best_d)
        best_d[upd] = d[upd]; best_t[upd] = i
    T = np.where(band & ~face_lock, best_t, T)

    # palette overrides (exact brand colours), and shade tones keep their offset
    over = dict(kv.split('=') for kv in a.palette.split(',') if '=' in kv)

    # merge tones that ended up as the same material colour across groups is not
    # done on purpose: one colour per material GROUP

    # specks -> neighbours, then majority filter to smooth jaggies
    minarea = max(40, int(0.00025 * fig.sum()))
    for i in range(len(tones)):
        n, cc, st, _ = cv2.connectedComponentsWithStats((T == i).astype(np.uint8))
        for j in range(1, n):
            if st[j, 4] < minarea:
                T[cc == j] = -2
    while (T == -2).any():
        for i in range(len(tones)):
            grow = cv2.dilate((T == i).astype(np.uint8), np.ones((3, 3), np.uint8)).astype(bool)
            T[grow & (T == -2)] = i
    sig = max(1.5, H / 600)
    sc = np.stack([cv2.GaussianBlur((T == i).astype(np.float32), (0, 0), sig) for i in range(len(tones))])
    T = np.where(fig, sc.argmax(0), -1)

    # colours: per group, the lightest tone is the base; overrides shift the group
    used = [i for i in range(len(tones)) if (T == i).any()]
    lums = [(np.array(tones[i][1]) @ [0.299, 0.587, 0.114], (T == i).sum()) for i in used]
    top = max(l for l, n in lums if n > 0.02 * fig.sum())
    gain = min(1.35, max(1.0, 225 / max(top, 1)))
    out_rgb = []
    for i, (g, rgb, lab) in enumerate(tones):
        c = np.clip(np.array(rgb, float) * gain, 0, 255)
        hsv = cv2.cvtColor(c.reshape(1, 1, 3).astype(np.uint8), cv2.COLOR_RGB2HSV).astype(float)
        hsv[..., 1] = np.clip(hsv[..., 1] * a.saturation, 0, 255)
        c = cv2.cvtColor(hsv.astype(np.uint8), cv2.COLOR_HSV2RGB).reshape(3).astype(float)
        if g in over:
            base = max((t for t in tones if t[0] == g), key=lambda t: t[2][0])
            tgt = np.array([int(over[g][k:k + 2], 16) for k in (1, 3, 5)], float)
            c = np.clip(tgt * (c / np.maximum(base[1], 1)), 0, 255)
        out_rgb.append(c)

    # trace (stacked)
    ys, xs = np.where(fig)
    y0, y1, x0, x1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
    poster_cm = a.real_cm * ANCHOR
    vbh = round(poster_cm * 100, 2)
    k = vbh / (y1 - y0)
    order = sorted([i for i in range(len(tones)) if (T == i).any()], key=lambda i: (ORDER.index(tones[i][0]) if tones[i][0] in ORDER else 0, -tones[i][2][0]))
    rank = {t: n for n, t in enumerate(order)}
    R = np.where(T >= 0, np.vectorize(lambda t: rank.get(t, -1))(np.maximum(T, 0)), -1)
    R[T < 0] = -1

    def path(mask):
        cs, _ = cv2.findContours(mask.astype(np.uint8), cv2.RETR_CCOMP, cv2.CHAIN_APPROX_NONE)
        d = []
        for c in cs:
            if cv2.contourArea(c) < 12:
                continue
            c = cv2.approxPolyDP(c, 0.8, True)[:, 0]
            d.append('M' + ' L'.join(f'{(x - x0) * k:.2f},{(y - y0) * k:.2f}' for x, y in c) + 'Z')
        return ' '.join(d)

    svg = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {(x1 - x0) * k:.2f} {vbh}">',
           f'  <!-- {a.name}: {a.real_cm:g}cm real -> {poster_cm:.2f}cm poster (x 6/185), viewBox height {vbh} = 0.01cm units.',
           f'       Generated by ref_to_svg.py from {os.path.basename(a.ref)}. Stacked flat layers, no strokes/gradients/faces. -->']
    report = {'name': a.name, 'real_cm': a.real_cm, 'poster_cm': round(poster_cm, 2),
              'viewbox': [round((x1 - x0) * k, 2), vbh], 'tones': []}
    for n, i in enumerate(order):
        d = path(R >= n)
        if not d:
            continue
        g = tones[i][0]
        svg.append(f'  <path id="{g}-{n}" fill="{hexc(out_rgb[i])}" fill-rule="evenodd" d="{d}"/>')
        report['tones'].append({'group': g, 'fill': hexc(out_rgb[i]), 'pixels': int((T == i).sum())})
    svg.append('</svg>')
    open(os.path.join(a.out, a.name + '.svg'), 'w').write('\n'.join(svg))

    # previews
    flat = np.full((H, W, 3), 255, np.uint8)
    for i in range(len(tones)):
        flat[T == i] = out_rgb[i]
    crop = lambda im: im[y0:y1, x0:x1]
    Image.fromarray(crop(flat)).save(os.path.join(a.out, a.name + '-labels.png'))
    cmp_ = np.hstack([crop(img), np.full((y1 - y0, 20, 3), 255, np.uint8), crop(flat)])
    Image.fromarray(cmp_).save(os.path.join(a.out, a.name + '-compare.png'))
    report['shapes'] = len(report['tones'])
    json.dump(report, open(os.path.join(a.out, a.name + '-report.json'), 'w'), indent=1)
    print(json.dumps(report, indent=1))


if __name__ == '__main__':
    main()
