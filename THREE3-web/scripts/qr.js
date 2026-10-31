/* Genera el código QR de una dirección (para afiches, tarjetas, vitrina). Uso: node scripts/qr.js https://tu-dominio.com/ig nombre */
const QR = require("qrcode");
const fs = require("fs"), path = require("path");
const [url, nombre = "ig"] = process.argv.slice(2);
if (!/^https:\/\//.test(url || "")) { console.error("Uso: node scripts/qr.js https://tu-dominio.com/ig [nombre]"); process.exit(1); }
const dir = path.join(__dirname, "..", "docs", "qr");
fs.mkdirSync(dir, { recursive: true });
const opts = { errorCorrectionLevel: "H", margin: 2, color: { dark: "#071022", light: "#ffffff" } };
(async () => {
  await QR.toFile(path.join(dir, `${nombre}.png`), url, { ...opts, width: 1200 });
  fs.writeFileSync(path.join(dir, `${nombre}.svg`), await QR.toString(url, { ...opts, type: "svg" }));
  console.log(`docs/qr/${nombre}.png y .svg para ${url}`);
})();
