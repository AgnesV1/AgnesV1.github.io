#!/usr/bin/env python3
"""相册照片入库前的批处理：转 JPG + 压到长边 1600 + 清空 EXIF + 打两层水印。

    python3 scripts/watermark.py <原图目录> <输出目录>

原图目录按年份分子目录，输出保持同样结构。原图不会被改动。
依赖：pip install Pillow pillow-heif
处理完把输出的图重命名成 YYYY-序号.jpg 放进 src/assets/photos/<年份>/。
"""
import sys, math, pathlib
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageOps
import pillow_heif

pillow_heif.register_heif_opener()

TEXT = "agnesv1.github.io"
FONT = "/System/Library/Fonts/Supplemental/Arial.ttf"

BIG_OPACITY   = 13     # 底层大字不透明度 (0-255)，13≈5%
BIG_COLOR     = (0, 0, 0)  # 深色水印
BIG_SPAN      = 0.80   # 旋转后大字宽度 / 图宽
BIG_ANGLE     = -30
BIG_CENTER_Y  = 0.67   # 大字中心高度 / 图高，0.5=正中，0.67=下三分之一
BLUR          = 0.045  # 模糊半径 / 字号

SMALL_OPACITY = 128    # 顶层小字 ≈50%
SMALL_RATIO   = 0.026
MARGIN        = 0.03   # 边距 / 短边

QUALITY   = 88
MAX_EDGE  = 1600       # 长边统一上限，0 = 不缩放


def fit_font(text, target_w):
    """二分找出让文字宽度接近 target_w 的字号。"""
    lo, hi = 8, 4000
    while lo < hi:
        mid = (lo + hi + 1) // 2
        if ImageFont.truetype(FONT, mid).getlength(text) <= target_w:
            lo = mid
        else:
            hi = mid - 1
    return ImageFont.truetype(FONT, lo)


def watermark(img):
    W, H = img.size
    short = min(W, H)

    # ---- 底层：放大 + 旋转 + 虚化 ----
    # 目标：整串文字旋转后仍完整落在画面内，尽量占满
    big = fit_font(TEXT, W * BIG_SPAN / abs(math.cos(math.radians(BIG_ANGLE))))
    l, t, r, b = big.getbbox(TEXT)
    pad = int(big.size * 0.4)

    layer = Image.new("L", (r - l + pad * 2, b - t + pad * 2), 0)
    ImageDraw.Draw(layer).text((pad - l, pad - t), TEXT, font=big, fill=BIG_OPACITY)
    layer = layer.filter(ImageFilter.GaussianBlur(max(1, big.size * BLUR)))
    layer = layer.rotate(BIG_ANGLE, expand=True, resample=Image.BICUBIC)

    # 垂直居于下三分之一，但留出边距别撞到底部小字
    cy = int(H * BIG_CENTER_Y)
    top = min(cy - layer.height // 2, H - layer.height - int(short * MARGIN * 2))
    mask = Image.new("L", (W, H), 0)
    mask.paste(layer, ((W - layer.width) // 2, max(0, top)))
    img.paste(Image.new("RGB", (W, H), BIG_COLOR), (0, 0), mask)

    # ---- 顶层：右下角清晰小字 ----
    small = ImageFont.truetype(FONT, max(11, int(short * SMALL_RATIO)))
    m = int(short * MARGIN)
    d = ImageDraw.Draw(img, "RGBA")
    off = max(1, small.size // 22)
    d.text((W - m + off, H - m + off), TEXT, font=small,
           fill=(0, 0, 0, SMALL_OPACITY // 2), anchor="rs")       # 阴影
    d.text((W - m, H - m), TEXT, font=small,
           fill=(255, 255, 255, SMALL_OPACITY), anchor="rs")      # 正文
    return img


def process(src, dst):
    img = Image.open(src)
    img = ImageOps.exif_transpose(img)      # 按 EXIF 摆正方向
    img = img.convert("RGB")                # 顺带丢弃全部 EXIF / GPS
    if MAX_EDGE and max(img.size) > MAX_EDGE:
        img.thumbnail((MAX_EDGE, MAX_EDGE), Image.LANCZOS)
    img = watermark(img)
    dst.parent.mkdir(parents=True, exist_ok=True)
    img.save(dst, "JPEG", quality=QUALITY, optimize=True, progressive=True)


if __name__ == "__main__":
    src_root, dst_root = pathlib.Path(sys.argv[1]), pathlib.Path(sys.argv[2])
    files = [p for p in sorted(src_root.rglob("*"))
             if p.suffix.lower() in {".jpg", ".jpeg", ".png", ".heic"}]
    for i, p in enumerate(files, 1):
        out = dst_root / p.relative_to(src_root).with_suffix(".jpg")
        try:
            process(p, out)
            print(f"[{i}/{len(files)}] {p.relative_to(src_root)} -> {out.name}")
        except Exception as e:
            print(f"[{i}/{len(files)}] 失败 {p.name}: {e}", file=sys.stderr)
