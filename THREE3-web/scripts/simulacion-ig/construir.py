"""Genera la simulación del enlace de Instagram (página única) a partir de las páginas /ig ya construidas en .enlace/."""
import base64, json, os, re
aqui = os.path.dirname(os.path.abspath(__file__))
raiz = os.path.abspath(os.path.join(aqui, "..", ".."))
en = os.path.join(raiz, ".enlace")
def uri(ruta, mime): return "data:%s;base64,%s" % (mime, base64.b64encode(open(os.path.join(raiz, "public", ruta), "rb").read()).decode())
tri, logo = uri("assets/tri-render.webp", "image/webp"), uri("assets/logo.webp", "image/webp")
def main_de(f):
    h = open(os.path.join(en, f), encoding="utf8").read()
    m = re.search(r"<main.*?</main>", h, re.S).group(0)
    return m.replace('src="assets/tri-render.webp"', 'src="%s"' % tri)
paginas = {"ig": main_de("ig.html")}
for s in ("automatizacion", "personaje", "pack"): paginas[s] = main_de("ig-%s.html" % s)
css = re.search(r"<style>(.*?)</style>", open(os.path.join(en, "ig.html"), encoding="utf8").read(), re.S).group(1)
css = css.replace(":root{", ":host{")
css += ".wrapsite{background:var(--bg);color:var(--fg);font:400 16px/1.55 var(--b);min-height:100%}"
core = open(os.path.join(raiz, "scripts", "leads", "core.js"), encoding="utf8").read().replace('if (typeof module !== "undefined") module.exports = LEADS;', "")
t = open(os.path.join(aqui, "plantilla.html"), encoding="utf8").read()
t = t.replace("__LOGO__", logo).replace("/*CORE*/", core).replace("/*PAGES*/", json.dumps(paginas, ensure_ascii=False)).replace("/*CSS*/", json.dumps(css))
open(os.path.join(aqui, "simulacion.html"), "w", encoding="utf8").write(t)
print("simulacion.html", len(t))
