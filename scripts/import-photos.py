#!/usr/bin/env python3
"""把原图目录全量处理并按「年份-序号」命名放进 src/assets/photos/。

一般不用直接调，走 `npm run photos`（那条会先备好 Python 环境再调这里）。
    python3 scripts/import-photos.py [原图目录]

原图目录默认是仓库同级的 `../raw photos`，按年份子目录组织（置顶放 `pinned/`）：
    raw photos/2026/任意文件名.heic   → src/assets/photos/2026/2026-01.jpg …（组内按文件名排序编号）
    raw photos/pinned/2026-01.jpg     → src/assets/photos/pinned/2026-01.jpg（保持原名）
处理 = 转 JPG + 压到长边 1600 + 清 EXIF/GPS + 打水印（见 watermark.py）。
原图不动；重跑幂等（每次都从原图出，未变的图输出字节一致、git 不会有多余改动）。
注意：本流程按序号自动命名，不带文字说明；某张要加说明就单独手动改名。
"""
import sys, pathlib

HERE = pathlib.Path(__file__).resolve().parent          # <repo>/scripts
REPO = HERE.parent
sys.path.insert(0, str(HERE))
import watermark as wm

EXTS = {".jpg", ".jpeg", ".png", ".heic"}
DST_ROOT = REPO / "src" / "assets" / "photos"


def main():
    raw = (pathlib.Path(sys.argv[1]).expanduser()
           if len(sys.argv) > 1 else REPO.parent / "raw photos")
    if not raw.is_dir():
        sys.exit(f"找不到原图目录：{raw}")

    total = 0
    for group in sorted(raw.iterdir(), key=lambda p: p.name):
        if not group.is_dir():
            continue
        files = sorted([p for p in group.iterdir()
                        if p.is_file() and p.suffix.lower() in EXTS],
                       key=lambda p: p.name.lower())
        if not files:
            continue
        out_dir = DST_ROOT / group.name
        for i, p in enumerate(files, 1):
            dst = out_dir / (f"{p.stem}.jpg" if group.name == "pinned"
                             else f"{group.name}-{i:02d}.jpg")
            wm.process(p, dst)
            print(f"{group.name}: {p.name} -> {dst.name}")
            total += 1

    print(f"完成，共 {total} 张 → {DST_ROOT.relative_to(REPO)}")


if __name__ == "__main__":
    main()
