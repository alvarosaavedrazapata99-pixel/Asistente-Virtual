"""Genera GIFs animados de llantas para Facebook Marketplace / anuncios.

Uso:  python3 generar_gifs.py
Salida: llanta-giro.gif, llanta-oferta.gif, llanta-aro17.gif (600x600)
"""
import math
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

OUT = Path(__file__).parent
S = 2            # supersampling para bordes suaves
W = H = 600
FRAMES = 24


def font(size):
    for f in ("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
              "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf"):
        try:
            return ImageFont.truetype(f, size * S)
        except OSError:
            pass
    return ImageFont.load_default()


def draw_tire(d, cx, cy, r, angle, rim_color, spokes=5):
    # sombra
    d.ellipse((cx - r * 0.95, cy + r * 0.92, cx + r * 0.95, cy + r * 1.06), fill=(0, 0, 0, 90))
    # caucho
    d.ellipse((cx - r, cy - r, cx + r, cy + r), fill=(22, 22, 24))
    # bloques de la banda de rodadura
    n = 36
    for i in range(n):
        a = angle + i * 2 * math.pi / n
        a2 = a + math.pi / n * 0.55
        pts = [
            (cx + r * math.cos(a), cy + r * math.sin(a)),
            (cx + r * math.cos(a2), cy + r * math.sin(a2)),
            (cx + r * 0.9 * math.cos(a2 + 0.04), cy + r * 0.9 * math.sin(a2 + 0.04)),
            (cx + r * 0.9 * math.cos(a + 0.04), cy + r * 0.9 * math.sin(a + 0.04)),
        ]
        d.polygon(pts, fill=(48, 48, 52))
    # flanco
    d.ellipse((cx - r * 0.86, cy - r * 0.86, cx + r * 0.86, cy + r * 0.86), fill=(30, 30, 33))
    d.ellipse((cx - r * 0.84, cy - r * 0.84, cx + r * 0.84, cy + r * 0.84), outline=(60, 60, 64), width=2 * S)
    # aro
    rr = r * 0.62
    d.ellipse((cx - rr, cy - rr, cx + rr, cy + rr), fill=(180, 184, 190))
    d.ellipse((cx - rr * 0.94, cy - rr * 0.94, cx + rr * 0.94, cy + rr * 0.94), fill=(40, 42, 46))
    # rayos del aro
    for i in range(spokes):
        a = angle + i * 2 * math.pi / spokes
        for off, col in ((0.13, rim_color), (0.07, (230, 232, 236))):
            pts = [
                (cx + rr * 0.25 * math.cos(a - off * 1.8), cy + rr * 0.25 * math.sin(a - off * 1.8)),
                (cx + rr * 0.92 * math.cos(a - off), cy + rr * 0.92 * math.sin(a - off)),
                (cx + rr * 0.92 * math.cos(a + off), cy + rr * 0.92 * math.sin(a + off)),
                (cx + rr * 0.25 * math.cos(a + off * 1.8), cy + rr * 0.25 * math.sin(a + off * 1.8)),
            ]
            d.polygon(pts, fill=col)
    # buje y pernos
    hub = rr * 0.28
    d.ellipse((cx - hub, cy - hub, cx + hub, cy + hub), fill=(200, 204, 210))
    for i in range(5):
        a = angle + i * 2 * math.pi / 5 + math.pi / 5
        bx, by = cx + hub * 0.6 * math.cos(a), cy + hub * 0.6 * math.sin(a)
        d.ellipse((bx - 5 * S, by - 5 * S, bx + 5 * S, by + 5 * S), fill=(90, 92, 98))
    d.ellipse((cx - hub * 0.3, cy - hub * 0.3, cx + hub * 0.3, cy + hub * 0.3), fill=rim_color)


def make_gif(name, bg, accent, title, subtitle, badge, rim_color, scale=1.0):
    frames = []
    for f in range(FRAMES):
        t = f / FRAMES
        img = Image.new("RGBA", (W * S, H * S), bg)
        d = ImageDraw.Draw(img, "RGBA")
        # líneas de velocidad
        for k in range(6):
            y = (140 + k * 55) * S
            x0 = ((t * 900 + k * 130) % 700 - 200) * S
            d.rounded_rectangle((x0, y, x0 + 120 * S, y + 4 * S), radius=2 * S, fill=accent + (70,))
        draw_tire(d, W * S / 2, 300 * S, 190 * S * scale, t * 2 * math.pi / 5, rim_color)
        # textos
        d.text((W * S / 2, 40 * S), title, font=font(42), fill=(255, 255, 255), anchor="mt")
        d.text((W * S / 2, 535 * S), subtitle, font=font(22), fill=(230, 230, 235), anchor="mt")
        # insignia que pulsa
        pulse = 1 + 0.06 * math.sin(t * 2 * math.pi * 2)
        br = 62 * S * pulse
        bx, by = 500 * S, 150 * S
        d.ellipse((bx - br, by - br, bx + br, by + br), fill=accent + (255,))
        d.text((bx, by), badge, font=font(22), fill=(15, 15, 15), anchor="mm", align="center")
        frames.append(img.resize((W, H), Image.LANCZOS).convert("P", palette=Image.ADAPTIVE, colors=128))
    path = OUT / name
    frames[0].save(path, save_all=True, append_images=frames[1:], duration=50, loop=0, optimize=True)
    print(f"{path}  {path.stat().st_size // 1024} KB")


if __name__ == "__main__":
    make_gif("llanta-giro.gif", (14, 14, 18, 255), (255, 196, 0), "LLANTAS NUEVAS",
             "Todas las medidas · Instalación incluida", "STOCK\nYA", (255, 196, 0))
    make_gif("llanta-oferta.gif", (120, 10, 18, 255), (255, 220, 60), "OFERTA 4x3",
             "Pago contraentrega · Envío a todo el país", "-25%", (220, 30, 40))
    make_gif("llanta-aro17.gif", (10, 32, 60, 255), (60, 200, 255), "ARO 17 · 225/45",
             "Garantía 5 años · Escríbenos al WhatsApp", "NEW", (60, 200, 255))
