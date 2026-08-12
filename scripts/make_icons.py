"""Generate the Loop app icon set (PNG, multiple sizes) from a vector-drawn mark."""
import math
from PIL import Image, ImageDraw

# Brand gradient: indigo -> violet
COLOR_A = (99, 102, 241)   # #6366F1
COLOR_B = (168, 85, 247)   # #A855F7
BG_DARK = (11, 14, 20)     # #0B0E14


def lerp(a, b, t):
    return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(3))


def make_gradient_bg(size, c1, c2):
    img = Image.new("RGB", (size, size))
    px = img.load()
    for y in range(size):
        t = y / (size - 1)
        row_color = lerp(c1, c2, t)
        for x in range(size):
            px[x, y] = row_color
    return img


def rounded_mask(size, radius_ratio=0.22):
    mask = Image.new("L", (size, size), 0)
    d = ImageDraw.Draw(mask)
    r = int(size * radius_ratio)
    d.rounded_rectangle([0, 0, size - 1, size - 1], radius=r, fill=255)
    return mask


def draw_loop_mark(draw, size, color, width_ratio=0.12):
    """Draw a stylised infinity/loop glyph made of two overlapping rings."""
    cx, cy = size / 2, size / 2
    r = size * 0.19
    offset = size * 0.17
    w = max(2, int(size * width_ratio))
    # left ring
    draw.ellipse([cx - offset - r, cy - r, cx - offset + r, cy + r], outline=color, width=w)
    # right ring
    draw.ellipse([cx + offset - r, cy - r, cx + offset + r, cy + r], outline=color, width=w)


def build_icon(size, maskable=False, bg=True):
    canvas = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    if bg:
        grad = make_gradient_bg(size, COLOR_A, COLOR_B).convert("RGBA")
        mask = rounded_mask(size, radius_ratio=0.5 if maskable else 0.22)
        canvas.paste(grad, (0, 0), mask)
    draw = ImageDraw.Draw(canvas)
    mark_scale = 0.62 if not maskable else 0.46
    mark_size = int(size * mark_scale)
    mark_img = Image.new("RGBA", (mark_size, mark_size), (0, 0, 0, 0))
    mdraw = ImageDraw.Draw(mark_img)
    draw_loop_mark(mdraw, mark_size, (255, 255, 255, 255), width_ratio=0.13)
    off = ((size - mark_size) // 2, (size - mark_size) // 2)
    canvas.alpha_composite(mark_img, off)
    return canvas


def main():
    out_dir = "public/icons"
    import os
    os.makedirs(out_dir, exist_ok=True)

    sizes = [16, 32, 48, 72, 96, 128, 144, 152, 180, 192, 256, 384, 512]
    for s in sizes:
        icon = build_icon(s, maskable=False)
        icon.save(f"{out_dir}/icon-{s}.png")

    # maskable (safe-zone padded) icons for Android adaptive icons
    for s in [192, 512]:
        icon = build_icon(s, maskable=True)
        icon.save(f"{out_dir}/maskable-{s}.png")

    # apple touch icon (opaque background required)
    apple = build_icon(180, maskable=False)
    bg = Image.new("RGBA", apple.size, (11, 14, 20, 255))
    bg.alpha_composite(apple)
    bg.convert("RGB").save(f"{out_dir}/apple-touch-icon.png")

    # favicon.ico (multi-size)
    fav_sizes = [16, 32, 48]
    fav_imgs = [build_icon(s) for s in fav_sizes]
    fav_imgs[0].save("public/favicon.ico", sizes=[(s, s) for s in fav_sizes])

    # standalone logo (transparent, for in-app header use)
    logo = build_icon(256, maskable=False, bg=False)
    canvas = Image.new("RGBA", (256, 256), (0, 0, 0, 0))
    draw = ImageDraw.Draw(canvas)
    from PIL import ImageColor
    grad_mark = Image.new("RGBA", (256, 256), (0, 0, 0, 0))
    gdraw = ImageDraw.Draw(grad_mark)
    draw_loop_mark(gdraw, 256, (99, 102, 241, 255), width_ratio=0.14)
    grad_mark.save(f"{out_dir}/logo-mark.png")

    print("Icons generated:", os.listdir(out_dir))


if __name__ == "__main__":
    main()
