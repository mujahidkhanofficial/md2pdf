import express from 'express';
import puppeteer from 'puppeteer';
import cors from 'cors';

const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(cors());

app.post('/api/print-pdf', async (req, res) => {
  const { html, pageSize, orientation } = req.body;

  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();

    // Set page content and wait for it to be stable
    await page.setContent(html, { waitUntil: 'networkidle0' });

    // Print to PDF with exact sizes and zero margins (as CSS padding handles page margins)
    const pdfBuffer = await page.pdf({
      format: pageSize ? pageSize.toUpperCase() : 'A4', // A4, Letter, Legal
      landscape: orientation === 'landscape',
      margin: { top: '0px', bottom: '0px', left: '0px', right: '0px' },
      printBackground: true,
      displayHeaderFooter: false,
    });

    await browser.close();

    res.contentType('application/pdf');
    res.send(Buffer.from(pdfBuffer));
  } catch (err) {
    console.error('PDF Generation failed:', err);
    res.status(500).send('PDF Generation failed');
  }
});

app.listen(3001, () => {
  console.log('PDF Server running on port 3001');
});
