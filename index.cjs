const express = require("express");
const cors = require("cors");
const chromium = require("chromium");
const puppeteer = require("puppeteer");
const app = express();
const port = 3000;

// ------------ CORS CONFIG ------------
const allowedOrigins = [
  "http://localhost:5173",
  "https://html-to-pdf-frontend.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error("CORS: Ruxsat berilmagan domen"));
    },
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
  })
);

// Express 5 uchun to'g'ri preflight
app.options(/.*/, cors());

app.use(express.json({ limit: "10mb" }));
// ----------------------------------------------------

// ------------ Puppeteer Function (Render-friendly) ------------
async function htmlToPdf(htmlString) {
  const browser = await puppeteer.launch({
    headless: "new",
    executablePath: chromium.path,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
      "--disable-software-rasterizer",
    ],
    timeout: 0,
  });

  const page = await browser.newPage();

  await page.setContent(htmlString, {
    waitUntil: "networkidle0",
  });

  const pdfBuffer = await page.pdf({
    format: "A4",
    printBackground: true,
    omitBackground: true,
    margin: { top: 20, right: 20, bottom: 20, left: 20 },
  });

  await browser.close();
  return pdfBuffer;
}
// ----------------------------------------------------

// ------------ Routes ------------
app.get("/check", (req, res) => {
  res.send("Work 🚀");
});

app.post("/save-as-pdf", async (req, res) => {
  try {
    const html = req.body.html;
    if (!html) {
      return res.status(400).json({ error: "HTML topilmadi" });
    }

    const pdfBuffer = await htmlToPdf(html);

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": "attachment; filename=generated.pdf",
      "Content-Length": pdfBuffer.length,
    });

    return res.end(pdfBuffer);
  } catch (err) {
    console.error("PDF yaratishda xato:", err);
    res.status(500).json({ error: "Serverda xato yuz berdi" });
  }
});
// ----------------------------------------------------

app.listen(port, () => {
  console.log(`Server ${port} portida ishlayapti`);
});
