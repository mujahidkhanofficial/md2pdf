export interface DocumentTemplate {
  id: string;
  title: string;
  markdown: string;
  cssPreset: 'corporate' | 'tech' | 'resume' | 'academic' | 'default';
  pageSize: 'a4' | 'letter' | 'legal';
  orientation: 'portrait' | 'landscape';
  margin: 'none' | 'compact' | 'normal';
  showHeader: boolean;
  showFooter: boolean;
}

export const defaultTemplates: DocumentTemplate[] = [
  {
    id: 'proposal',
    title: 'Executive Project Proposal',
    cssPreset: 'corporate',
    pageSize: 'a4',
    orientation: 'portrait',
    margin: 'normal',
    showHeader: true,
    showFooter: true,
    markdown: `# Executive Project Proposal: Project Antigravity

**Date:** June 12, 2026  
**Author:** Sarah Jenkins, VP of Engineering  
**Version:** 1.0.4  

---

## Executive Summary
Project Antigravity is a modern initiative aiming to establish highly interactive, enterprise-grade AI pairing experiences. This document outlines the technical design, budget, and deployment strategy for our next-generation Markdown to PDF rendering microservice.

### Key Objectives
* **Aesthetics:** Deliver premium visual templates for invoices, resumes, reports, and API docs.
* **Privacy:** Run 100% client-side to ensure compliance with enterprise data security models.
* **Integrations:** Embed drawing tools (Mermaid.js) and typesetting (LaTeX math).

---

## Technical Specifications
The system utilizes a split-pane layout with reactive rendering. The live preview parses Markdown on-the-fly and runs syntax highlighting dynamically.

### System Architecture
\`\`\`mermaid
graph TD
    A[Markdown Text] --> B[Marked.js Compiler]
    B --> C[Theme Engine]
    C --> D[Prism.js Highlighter]
    C --> E[KaTeX Math Engine]
    C --> F[Mermaid Diagram Engine]
    D & E & F --> G[Interactive Page Preview]
    G --> H[html2pdf.js Download]
    G --> I[Browser Vector Print]
\`\`\`

### Resource Milestones
| Milestone | Description | Est. Time | Priority |
| :--- | :--- | :---: | :---: |
| **Phase 1** | Setup & Design System Core | 2 weeks | High |
| **Phase 2** | Real-time KaTeX & Mermaid compiler | 3 weeks | High |
| **Phase 3** | Print Engine & PDF styles | 1 week | Critical |
| **Phase 4** | Performance & caching polish | 2 weeks | Medium |

---

## Project Status Checklist
- [x] Initial design review and architecture approval
- [x] Setting up Vite + React scaffolding
- [ ] Integration of Mermaid rendering pipelines
- [ ] Cross-browser vector printing alignment

> "Our target is to reduce paper document formatting overhead by 90% across the organization before Q4."  
> — *Operations Alignment Team*
`
  },
  {
    id: 'api-doc',
    title: 'Technical API Documentation',
    cssPreset: 'tech',
    pageSize: 'a4',
    orientation: 'portrait',
    margin: 'normal',
    showHeader: true,
    showFooter: true,
    markdown: `# API Reference: Document Conversion Service

Welcome to the API Documentation for the Document Conversion Service. Use this endpoint structure to programmatically submit Markdown files and compile them.

---

## Endpoint: Generate PDF
\`POST /api/v1/convert\`

Submits raw Markdown payloads to be converted into static PDF documents.

### Request Headers
* \`Content-Type\`: \`application/json\`
* \`Authorization\`: \`Bearer <YOUR_SECRET_TOKEN>\`

### JSON Body Payload
\`\`\`json
{
  "title": "Monthly Financial Report",
  "markdown": "# Financial Update\\n\\nWe saw a **14% increase** in operations this month.",
  "options": {
    "pageSize": "A4",
    "orientation": "portrait",
    "theme": "corporate",
    "margins": "normal"
  }
}
\`\`\`

### Code Implementation Example (Node.js)

Below is an integration example demonstrating how to send Markdown content to the API:

\`\`\`javascript
const fetch = require('node-fetch');

async function compileDocument() {
  const payload = {
    title: "V1 Specs",
    markdown: "# Specifications\\n\\n1. Item One\\n2. Item Two"
  };

  const response = await fetch('https://api.md2pdf.io/v1/convert', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer md2pdf_live_9a2f18c8e23f'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error('API Compilation Failed');
  }

  const pdfBuffer = await response.buffer();
  // Save buffer to filesystem
}
\`\`\`

### Response Payload (\`200 OK\`)
Returns a standard binary octet-stream containing the PDF document.

* \`Content-Type\`: \`application/pdf\`
* \`Content-Disposition\`: \`attachment; filename="document.pdf"\`
`
  },
  {
    id: 'resume',
    title: 'Elegant CV / Resume',
    cssPreset: 'resume',
    pageSize: 'letter',
    orientation: 'portrait',
    margin: 'compact',
    showHeader: false,
    showFooter: false,
    markdown: `# ALEXANDER HAMILTON
**Chief Solutions Architect**  
*New York, NY | alexander@hamilton-architects.io | (555) 1789-1804 | github.com/ahamilton*

---

## Professional Profile
Dynamic and results-driven Software Architect with 12+ years of experience leading teams, designing cloud infrastructure architectures, and building pixel-perfect interactive client-side systems. Specialized in React, TypeScript, Rust, and compiler optimizations.

---

## Professional Experience

### Principal Architect @ Treasury Systems | *2020 - Present*
* Designed and executed a cloud migration strategy, shifting legacy mainframe operations to serverless Node.js and AWS, reducing operational expenditure by **35%**.
* Spearheaded development of an internal client-side report generator utility using React and print CSS directives, saving staff over **400 hours** monthly.
* Mentored a senior engineering team of 15 members, leading technical architecture boards.

### Lead Software Engineer @ Constitution Tech | *2015 - 2020*
* Led development of a real-time collaborate workspace editor utilizing operational transformation protocols.
* Optimized markdown rendering pipelines, improving responsiveness of large text documents (100k+ lines) by **50%**.
* Built cross-platform vector exporting libraries supporting A4, Letter, and Legal layouts.

---

## Core Competencies
* **Languages:** TypeScript, JavaScript, Rust, C++, SQL, Go
* **Frameworks & Libraries:** React, Vite, Next.js, Node.js, WebAssembly, Express
* **Database & Cloud:** PostgreSQL, Redis, DynamoDB, AWS, Docker, Kubernetes

---

## Education
### B.S. in Computer Science & Mathematics
*Columbia University, NY | Class of 2008*
`
  },
  {
    id: 'academic',
    title: 'Academic Paper Draft',
    cssPreset: 'academic',
    pageSize: 'a4',
    orientation: 'portrait',
    margin: 'normal',
    showHeader: true,
    showFooter: true,
    markdown: `# Quantum Entanglement Dynamics in Two-Dimensional Lattices

**Author:** Dr. Arthur Pendelton  
*Institute for Advanced Quantum Computing, University of Cambridge*  

---

## Abstract
This paper examines the evolution of spin entanglement patterns in a two-dimensional Ising model lattice under external perturbation. By simulating spin alignments at critical temperatures, we observe long-range correlation dynamics and compute entanglement entropy variations. Our findings indicate stable topologies suitable for quantum register states.

---

## 1. Introduction
Quantum information systems rely on the stable preservation of entangled states. However, environmental noise introduces decoherence. Understanding the propagation of correlations across discrete coordinates is essential to developing resilient quantum error-correcting codes.

---

## 2. Theoretical Framework
We model the system using an Ising Hamiltonian in the presence of a transverse magnetic field:

$$ H = -J \\sum_{\\langle i, j \\rangle} \\sigma_i^z \\sigma_j^z - g \\sum_i \\sigma_i^x $$

Where $J$ represents the exchange interaction, $g$ represents the transverse field strength, and $\\sigma^x, \\sigma^z$ are the Pauli matrices. The partition function $Z$ at temperature $T$ is expressed as:

$$ Z = \\text{Tr}\\left(e^{-\\beta H}\\right) $$

where $\\beta = \\frac{1}{k_B T}$.

---

## 3. Results & Correlation Maps
We analyze spin alignments and plot the cross-correlation coefficients below.

| Lattice Dimension | Exchange Constant ($J$) | Field Strength ($g$) | Entanglement Entropy ($S$) |
| :---: | :---: | :---: | :---: |
| 16 x 16 | 1.00 | 0.25 | 0.6931 |
| 32 x 32 | 1.00 | 0.50 | 1.3862 |
| 64 x 64 | 1.00 | 0.75 | 2.7724 |

Our simulations confirm that entanglement entropy grows logarithmically with lattice boundary coordinates:

$$ S_A \\approx \\frac{c}{3} \\log\\left(\\frac{L}{\\pi} \\sin\\left(\\frac{\\pi x}{L}\\right)\\right) + c' $$

---

## 4. Conclusion
Future investigations will explore the impact of variable temperature sweeps on entanglement configurations.
`
  }
];
