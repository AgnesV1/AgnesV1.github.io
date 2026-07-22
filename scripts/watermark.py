#!/usr/bin/env python3
"""相册照片入库前的批处理：转 JPG + 压到长边 1600 + 清空 EXIF + 打 Getty 式水印。

    python3 scripts/watermark.py <原图目录> <输出目录>

原图目录按年份分子目录，输出保持同样结构。原图不会被改动。
依赖：pip install Pillow pillow-heif
处理完把输出的图重命名成 YYYY-序号.jpg 放进 src/assets/photos/<年份>/。

水印样式（与灯箱软水印 src/pages/photos/index.astro 的 .lb-plate 对齐）：
画面约 2/3 高度处一块半透明灰底板，右缘贴图片右边、左圆角；板上小号白字左对齐——
第一行 skylarking(粗)+images(细) 拼出字标，第二行 Credit 网址；右侧留一截灰尾。
灰板宽度固定（按长边取比例）→ 窄图上占比大偏左、宽图上占比小偏右。
"""
import sys, pathlib
from PIL import Image, ImageDraw, ImageFont, ImageOps
import pillow_heif

pillow_heif.register_heif_opener()

# ---- 文案 ----
TEXT_BOLD  = "skylarking"            # 字标粗体段
TEXT_LIGHT = "images"               # 字标细体段（拼成 skylarkingimages）
CREDIT     = "Credit: agnesv1.github.io"

# ---- 字体（粗 / 常规；常规当作细体段，Arial 无 Light 权重）----
FONT_BOLD = "/System/Library/Fonts/Supplemental/Arial Bold.ttf"
FONT_REG  = "/System/Library/Fonts/Supplemental/Arial.ttf"

# ---- 尺寸/位置：全部按长边(≈MAX_EDGE)取比例，保证不同图观感一致 ----
BRAND_RATIO    = 0.033   # 字标字号 / 长边
CREDIT_RATIO   = 0.020   # Credit 字号 / 长边
PLATE_FRAC     = 0.45    # 灰板固定宽度 / 长边（窄图占比大→偏左，宽图占比小→偏右）
PLATE_MAX_W    = 0.62    # 灰板宽度上限 / 图宽（防极窄图溢出）
PLATE_CENTER_Y = 0.66    # 灰板垂直中心 / 图高（≈2/3）
PAD_X_EM       = 0.85    # 内边距 / 字标字号
PAD_Y_EM       = 0.5
GAP_EM         = 0.12    # 两行间距 / 字标字号
RADIUS_EM      = 0.16    # 左圆角 / 字标字号

PLATE_RGB   = (120, 120, 120)
PLATE_ALPHA = 107        # 灰底不透明度 (0-255)，≈42%
TEXT_RGB    = (255, 255, 255)
TEXT_ALPHA  = 235
SHADOW_ALPHA = 90        # 文字阴影，压在灰板高光区也能看清

QUALITY  = 88
MAX_EDGE = 1600          # 长边统一上限，0 = 不缩放


def line_height(font):
    """含升/降部的稳定行高。"""
    return font.getbbox("Ahgpy")[3]


def watermark(img):
    W, H = img.size
    long_edge = max(W, H)

    brand_size  = max(12, int(long_edge * BRAND_RATIO))
    credit_size = max(9,  int(long_edge * CREDIT_RATIO))
    f_bold   = ImageFont.truetype(FONT_BOLD, brand_size)
    f_light  = ImageFont.truetype(FONT_REG,  brand_size)
    f_credit = ImageFont.truetype(FONT_REG,  credit_size)

    pad_x  = int(brand_size * PAD_X_EM)
    pad_y  = int(brand_size * PAD_Y_EM)
    gap    = int(brand_size * GAP_EM)
    radius = max(2, int(brand_size * RADIUS_EM))

    # 文本量度
    bold_w   = f_bold.getlength(TEXT_BOLD)
    brand_w  = bold_w + f_light.getlength(TEXT_LIGHT)
    credit_w = f_credit.getlength(CREDIT)
    text_w   = max(brand_w, credit_w)
    brand_lh, credit_lh = line_height(f_bold), line_height(f_credit)

    # 灰板宽度：固定(长边比例) → 窄图偏左、宽图偏右；上限 62% 图宽；但不小于文字
    plate_w = min(int(long_edge * PLATE_FRAC), int(W * PLATE_MAX_W))
    plate_w = max(plate_w, int(text_w + 2 * pad_x))
    plate_h = brand_lh + gap + credit_lh + 2 * pad_y

    x0 = W - plate_w                       # 右缘 x1=W 贴图片边
    cy = int(H * PLATE_CENTER_Y)
    y0 = cy - plate_h // 2

    overlay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    od = ImageDraw.Draw(overlay)
    # 右边画到 W+radius（画布外），右圆角被裁掉 → 左圆右直、右缘齐边
    od.rounded_rectangle([x0, y0, W + radius, y0 + plate_h],
                         radius=radius, fill=(*PLATE_RGB, PLATE_ALPHA))

    tx, ty = x0 + pad_x, y0 + pad_y
    sh = max(1, brand_size // 20)          # 阴影偏移

    def draw_run(x, y, s, font):
        od.text((x + sh, y + sh), s, font=font, fill=(0, 0, 0, SHADOW_ALPHA))
        od.text((x, y), s, font=font, fill=(*TEXT_RGB, TEXT_ALPHA))

    draw_run(tx, ty, TEXT_BOLD, f_bold)                 # skylarking 粗
    draw_run(tx + bold_w, ty, TEXT_LIGHT, f_light)      # images 细
    draw_run(tx, ty + brand_lh + gap, CREDIT, f_credit) # Credit 行

    return Image.alpha_composite(img.convert("RGBA"), overlay).convert("RGB")


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
