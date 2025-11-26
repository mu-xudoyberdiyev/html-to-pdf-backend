const express = require("express");
const cors = require("cors");
const puppeteer = require("puppeteer");
const app = express();
const port = 3000;
const allowedOrigins = [
  "http://localhost:5173",
  "https://html-to-pdf-frontend.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("CORS: Ruxsat berilmagan domen"));
      }
    },
    credentials: true,
  })
);
app.use(express.json());

async function htmlToPdf(htmlString) {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();

  // HTML yoki file
  await page.setContent(htmlString, {
    waitUntil: "networkidle0",
  });

  const pdfBuffer = await page.pdf({
    format: "A4",
    printBackground: true,
    omitBackground: true,
    margin: { top: 10, right: 10, bottom: 10, left: 10 },
  });

  await browser.close();

  return pdfBuffer;
}

async function generate(htmlString) {
  return await htmlToPdf(htmlString);
}

app.get("/check", (req, res) => {
  res.send("Work 🚀");
});

app.post("/save-as-pdf", (req, res) => {
  console.log(req.body.html);

  generate(req.body.html).then((docBuffer) => {
    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": "attachment; filename=example.pdf",
      "Content-Length": docBuffer.length,
    });
    res.end(docBuffer);
  });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
