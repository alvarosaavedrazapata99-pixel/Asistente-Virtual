"""Genera el simulador (página única) = plantilla + núcleo probado scripts/leads/core.js."""
import os
aqui = os.path.dirname(os.path.abspath(__file__))
core = open(os.path.join(aqui, "..", "leads", "core.js"), encoding="utf8").read().replace('if (typeof module !== "undefined") module.exports = LEADS;', "")
out = open(os.path.join(aqui, "plantilla.html"), encoding="utf8").read().replace("/*CORE*/", core)
open(os.path.join(aqui, "simulador.html"), "w", encoding="utf8").write(out)
print("simulador.html", len(out))
