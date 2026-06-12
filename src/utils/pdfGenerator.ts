interface PDFOptions {
  filename: string;
  pageSize: 'a4' | 'letter' | 'legal';
  orientation: 'portrait' | 'landscape';
  margin: 'none' | 'compact' | 'normal';
  showHeader?: boolean;
  showFooter?: boolean;
  headerTitle?: string;
  footerText?: string;
  onProgress?: (progress: number) => void;
}

export async function downloadPdfFromElement(
  element: HTMLElement,
  options: PDFOptions
): Promise<void> {
  const {
    filename,
    pageSize,
    orientation,
    margin,
  } = options;

  // 1. Gather all innerHTML content of the target container
  const htmlContent = element.innerHTML;

  // 2. Gather all CSS rules currently loaded in the browser to embed them directly in the HTML
  let cssContent = '';
  for (const sheet of Array.from(document.styleSheets)) {
    try {
      const rules = Array.from(sheet.cssRules);
      cssContent += rules.map(rule => rule.cssText).join('\n');
    } catch (e) {
      // Ignore cross-origin stylesheet warnings
    }
  }

  // 3. Construct a self-contained HTML page containing all styles and layouts
  const fullHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500&family=Inter:wght@400;500;600;700&family=Outfit:wght@300;400;500;600;700&family=Merriweather:ital,wght@0,300;0,400;0,700;1,300&family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap">
        <style>
          ${cssContent}
        </style>
        <style>
          body {
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
          }
          @page {
            margin: 0 !important;
          }
          /* Ensure page breaks render cleanly inside Puppeteer */
          .preview-page {
            box-shadow: none !important;
            border: none !important;
            margin: 0 !important;
            page-break-after: always !important;
            break-after: page !important;
          }
          /* Hide print page break indicators and other screen-only helpers */
          .preview-page-break-indicator {
            display: none !important;
            height: 0 !important;
            margin: 0 !important;
            padding: 0 !important;
            border: none !important;
            overflow: hidden !important;
          }
        </style>
      </head>
      <body>
        ${htmlContent}
      </body>
    </html>
  `;

  // 4. Simulate progress updates
  let progress = 0;
  const progressInterval = setInterval(() => {
    if (progress < 90) {
      progress += Math.floor(Math.random() * 10) + 5;
      if (progress > 90) progress = 90;
      if (options.onProgress) {
        options.onProgress(progress);
      }
    }
  }, 100);

  try {
    // 5. Send POST request to Node.js backend
    const response = await fetch('http://localhost:3001/api/print-pdf', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        html: fullHtml,
        pageSize,
        orientation,
        margin,
      }),
    });

    clearInterval(progressInterval);

    if (!response.ok) {
      throw new Error(`Server returned status ${response.status}`);
    }

    if (options.onProgress) {
      options.onProgress(100);
    }

    // 6. Download the binary vector PDF blob
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const fname = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
    a.download = fname;
    a.click();
    URL.revokeObjectURL(url);
  } catch (err) {
    clearInterval(progressInterval);
    throw err;
  }
}
