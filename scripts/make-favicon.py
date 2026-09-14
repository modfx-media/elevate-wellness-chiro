from pathlib import Path
from PIL import Image

SRC = Path("new-images/docs-doing-treatments-images/website-favicon.png")
APP = Path("app")
PUBLIC = Path("public")
BG = (0x13, 0x3B, 0x4E, 255)


def compose(mark: Image.Image, size: int, inset_ratio: float = 0.12) -> Image.Image:
    canvas = Image.new("RGBA", (size, size), BG)
    inset = max(2, int(size * inset_ratio))
    max_w = size - inset * 2
    max_h = size - inset * 2
    mw, mh = mark.size
    scale = min(max_w / mw, max_h / mh)
    fitted = mark.resize((max(1, int(mw * scale)), max(1, int(mh * scale))), Image.Resampling.LANCZOS)
    x = (size - fitted.width) // 2
    y = (size - fitted.height) // 2
    canvas.alpha_composite(fitted, (x, y))
    return canvas


def main() -> None:
    src = Image.open(SRC).convert("RGBA")
    bbox = src.split()[-1].getbbox()
    mark = src.crop(bbox) if bbox else src

    icon16 = compose(mark, 16, 0.08)
    icon32 = compose(mark, 32, 0.1)
    icon48 = compose(mark, 48, 0.1)
    icon192 = compose(mark, 192, 0.12)
    apple = compose(mark, 180, 0.12)

    icon192.save(APP / "icon.png", "PNG", optimize=True)
    apple.save(APP / "apple-icon.png", "PNG", optimize=True)

    frames = [icon16, icon32, icon48]
    for dest in (APP / "favicon.ico", PUBLIC / "favicon.ico"):
        frames[0].save(dest, format="ICO", sizes=[(16, 16), (32, 32), (48, 48)], append_images=frames[1:])
    print("ok", (APP / "icon.png").stat().st_size, (APP / "favicon.ico").stat().st_size)


if __name__ == "__main__":
    main()
