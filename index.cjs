const express = require("express");
const cors = require("cors");
const { chromium } = require("playwright");
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

app.options(/.*/, cors());
app.use(express.json({ limit: "10mb" }));

// ----------------------------------------------------
//  🔥 Render-friendly Playwright PDF Generator
// ----------------------------------------------------
async function htmlToPdf(htmlString) {
  const browser = await chromium.launch({
    headless: true,
    timeout: 0,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
      "--disable-software-rasterizer",
      "--single-process",
      "--no-zygote",
      "--disable-background-networking",
      "--disable-background-timer-throttling",
      "--disable-breakpad",
      "--disable-client-side-phishing-detection",
      "--disable-default-apps",
      "--disable-hang-monitor",
      "--disable-popup-blocking",
      "--metrics-recording-only",
      "--mute-audio",
    ],
  });

  const page = await browser.newPage();

  // Render serverlarida kechikishni kamaytirish uchun timeout o‘rnatiladi
  await page.setDefaultNavigationTimeout(0);
  await page.setDefaultTimeout(0);

  await page.setContent(htmlString, {
    waitUntil: "domcontentloaded", // networkidle renderda ba'zan timeout beradi
  });

  const pdfBuffer = await page.pdf({
    format: "A4",
    printBackground: true,
    preferCSSPageSize: true,
    margin: { top: "20px", bottom: "20px", left: "20px", right: "20px" },
  });

  await browser.close();
  return pdfBuffer;
}

// ----------------------------------------------------
// ------------------------ Routes ------------------------
// ----------------------------------------------------

app.get("/check", (req, res) => {
  res.send("Work 🚀 (Render version)");
});

app.post("/save-as-pdf", async (req, res) => {
  try {
    const html = req.body.html;
    if (!html) return res.status(400).json({ error: "HTML topilmadi" });

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
  console.log(`Server ${port} portida Render muhitida ishlayapti 🚀`);
});
