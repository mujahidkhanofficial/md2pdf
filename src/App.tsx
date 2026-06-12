import React, { useState, useEffect, useRef } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useScrollSync } from './hooks/useScrollSync';
import { Toolbar } from './components/Toolbar';
import { DocumentManager } from './components/DocumentManager';
import { SettingsPanel } from './components/SettingsPanel';
import { Editor } from './components/Editor';
import { Preview } from './components/Preview';
import { Statusbar } from './components/Statusbar';
import { downloadPdfFromElement } from './utils/pdfGenerator';
import { Auth } from './components/Auth';

function App() {
  const {
    documents,
    activeId,
    setActiveId,
    activeDocument,
    createDocument,
    updateDocument,
    deleteDocument,
  } = useLocalStorage();

  // View UI States
  const [layout, setLayout] = useState<'editor' | 'split' | 'preview'>('split');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [downloadProgress, setDownloadProgress] = useState<number | null>(null);
  const [isAboutOpen, setIsAboutOpen] = useState<boolean>(false);
  
  // Auth Session States
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  
  // Dynamic header/footer inputs linked to doc content
  const [headerTitle, setHeaderTitle] = useState<string>('');
  const [footerText, setFooterText] = useState<string>('Confidential');

  // Drag resizer widths (percentages)
  const [splitWidth, setSplitWidth] = useState<number>(50);
  const isDraggingRef = useRef<boolean>(false);

  // References for scroll sync
  const editorRef = useRef<HTMLTextAreaElement | null>(null);
  const previewRef = useRef<HTMLDivElement | null>(null);

  // Bind scroll sync hook
  useScrollSync(editorRef, previewRef);

  // Synchronize document attributes on load or change
  useEffect(() => {
    if (activeDocument) {
      setHeaderTitle(activeDocument.headerTitle || activeDocument.title);
      setFooterText(activeDocument.footerText || 'Confidential');
    }
  }, [activeId]);

  // Synchronize dynamic headers back to active document
  useEffect(() => {
    if (activeDocument && activeDocument.headerTitle !== headerTitle) {
      updateDocument(activeDocument.id, { headerTitle });
    }
  }, [headerTitle]);

  useEffect(() => {
    if (activeDocument && activeDocument.footerText !== footerText) {
      updateDocument(activeDocument.id, { footerText });
    }
  }, [footerText]);

  // Check active session email
  useEffect(() => {
    const session = localStorage.getItem('md2pdf_session_email');
    if (session) {
      setCurrentUser(session);
    }
  }, []);

  const handleLoginSuccess = (email: string) => {
    setCurrentUser(email);
    localStorage.setItem('md2pdf_session_email', email);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('md2pdf_session_email');
  };



  // Drag Resizing Logic
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    isDraggingRef.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.classList.add('dragging');
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const workspace = document.querySelector('.workspace');
      if (workspace) {
        const rect = workspace.getBoundingClientRect();
        // Adjust clientX relative to the workspace left bounds
        const percentage = ((e.clientX - rect.left) / rect.width) * 100;
        // Clamp split width percentage between 20% and 80%
        setSplitWidth(Math.max(20, Math.min(80, percentage)));
      }
    };

    const handleMouseUp = () => {
      if (isDraggingRef.current) {
        isDraggingRef.current = false;
        document.body.style.cursor = '';
        document.body.classList.remove('dragging');
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  // Format insertion
  const handleInsertMarkdown = (type: string) => {
    const textarea = editorRef.current;
    if (!textarea || !activeDocument) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentText = activeDocument.markdown;
    const selection = currentText.substring(start, end);

    let before = '';
    let after = '';
    let placeholder = '';

    switch (type) {
      case 'bold':
        before = '**';
        after = '**';
        placeholder = 'bold text';
        break;
      case 'italic':
        before = '*';
        after = '*';
        placeholder = 'italic text';
        break;
      case 'h1':
        before = '\n# ';
        after = '\n';
        placeholder = 'Heading 1';
        break;
      case 'h2':
        before = '\n## ';
        after = '\n';
        placeholder = 'Heading 2';
        break;
      case 'h3':
        before = '\n### ';
        after = '\n';
        placeholder = 'Heading 3';
        break;
      case 'ul':
        before = '\n* ';
        after = '';
        placeholder = 'List item';
        break;
      case 'ol':
        before = '\n1. ';
        after = '';
        placeholder = 'List item';
        break;
      case 'todo':
        before = '\n- [ ] ';
        after = '';
        placeholder = 'Task item';
        break;
      case 'quote':
        before = '\n> ';
        after = '';
        placeholder = 'Quote block';
        break;
      case 'code':
        before = '\n```javascript\n';
        after = '\n```\n';
        placeholder = '// write code here';
        break;
      case 'table':
        before = '\n| Column 1 | Column 2 |\n| :--- | :--- |\n| ';
        after = ' | Cell 2 |\n| Cell 3 | Cell 4 |\n';
        placeholder = 'Cell 1';
        break;
      case 'image':
        before = '![';
        after = '](https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80)';
        placeholder = 'Image description';
        break;
      case 'math':
        before = '$$ ';
        after = ' $$';
        placeholder = 'E = mc^2';
        break;
      case 'pagebreak':
        before = '\n<div class="page-break"></div>\n';
        after = '';
        placeholder = '';
        break;
    }

    const textToInsert = selection || placeholder;
    const newMarkdown = currentText.substring(0, start) + before + textToInsert + after + currentText.substring(end);
    
    updateDocument(activeDocument.id, { markdown: newMarkdown });

    // Set focus and restore cursor position after render
    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = start + before.length;
      textarea.selectionEnd = start + before.length + textToInsert.length;
    }, 0);
  };

  // Direct PDF download using html2pdf.js
  const handleDownloadPdf = async () => {
    const printTarget = document.getElementById('print-target');
    if (!printTarget || !activeDocument) return;

    setDownloadProgress(0);

    try {
      await downloadPdfFromElement(printTarget, {
        filename: activeDocument.title,
        pageSize: activeDocument.pageSize,
        orientation: activeDocument.orientation,
        margin: activeDocument.margin,
        showHeader: activeDocument.showHeader,
        showFooter: activeDocument.showFooter,
        headerTitle: headerTitle,
        footerText: footerText,
        onProgress: (progress) => {
          setDownloadProgress(progress);
        }
      });
    } catch (e) {
      console.error('Error generating PDF', e);
      alert('Failed to generate PDF download. Try the browser print option.');
    } finally {
      setTimeout(() => {
        setDownloadProgress(null);
      }, 600); // tiny delay for visual closure
    }
  };

  // Trigger Browser Vector Print Dialog
  const handlePrintPdf = () => {
    window.print();
  };

  if (!currentUser) {
    return <Auth onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="app-container">
      {/* 1. Dynamic Print Page CSS rules injector */}
      {activeDocument && (
        <style dangerouslySetInnerHTML={{ __html: `
          @media print {
            @page {
              size: ${activeDocument.pageSize} ${activeDocument.orientation};
              margin: 0 !important;
            }
          }
        `}} />
      )}

      {/* 2. Left Document Manager Sidebar */}
      <DocumentManager
        isOpen={isSidebarOpen}
        documents={documents}
        activeId={activeId}
        setActiveId={setActiveId}
        onCreateDoc={createDocument}
        onUpdateDoc={updateDocument}
        onDeleteDoc={deleteDocument}
        onDownloadPdf={handleDownloadPdf}
        onPrintPdf={handlePrintPdf}
        downloadProgress={downloadProgress}
        onOpenAbout={() => setIsAboutOpen(true)}
      />

      {/* 3. Main Workspace Area */}
      <div className="main-content">
        {/* Toolbar */}
        <Toolbar
          onInsertMarkdown={handleInsertMarkdown}
          layout={layout}
          setLayout={setLayout}
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          isSettingsOpen={isSettingsOpen}
          setIsSettingsOpen={setIsSettingsOpen}
          onOpenAbout={() => setIsAboutOpen(true)}
          onLogout={handleLogout}
          currentUserEmail={currentUser}
        />

        {/* Resizable Editor/Previewer Pane */}
        <div className="workspace">
          {/* Editor Container */}
          {(layout === 'editor' || layout === 'split') && (
            <div 
              className="pane editor-pane"
              style={{ flex: layout === 'split' ? `0 0 ${splitWidth}%` : 1 }}
            >
              <Editor
                markdown={activeDocument?.markdown || ''}
                onChangeMarkdown={(text) => activeDocument && updateDocument(activeDocument.id, { markdown: text })}
                editorRef={editorRef}
              />
            </div>
          )}

          {/* Resizer Handle */}
          {layout === 'split' && (
            <div 
              className="resizer-handle" 
              onMouseDown={handleMouseDown}
            />
          )}

          {/* Preview Container */}
          {(layout === 'preview' || layout === 'split') && (
            <div 
              className="pane preview-pane"
              style={{ flex: layout === 'split' ? `0 0 ${100 - splitWidth}%` : 1 }}
            >
              <Preview
                activeDoc={activeDocument}
                previewRef={previewRef}
                headerTitle={headerTitle}
                footerText={footerText}
              />
            </div>
          )}
        </div>

        {/* Statusbar */}
        <Statusbar activeDoc={activeDocument} />
      </div>

      {/* 4. Right Settings Panel */}
      <SettingsPanel
        isOpen={isSettingsOpen}
        activeDoc={activeDocument}
        onUpdateDoc={(updates) => activeDocument && updateDocument(activeDocument.id, updates)}
        headerTitle={headerTitle}
        setHeaderTitle={setHeaderTitle}
        footerText={footerText}
        setFooterText={setFooterText}
      />

      {/* 5. About Modal Dialog */}
      {isAboutOpen && (
        <div className="modal-overlay" onClick={() => setIsAboutOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>About MD2PDF Converter</h2>
              <button className="btn-close" onClick={() => setIsAboutOpen(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <p className="app-desc">
                <strong>MD2PDF</strong> is a professional Markdown-to-PDF conversion workspace designed to bridge the gap between simple text editing and visual publication. It compiles styled HTML using highly precise browser-based pagination to render clean, paginated vector PDFs that scale perfectly at any zoom level.
              </p>
              
              <div className="app-features">
                <h3>Key Architecture</h3>
                <ul>
                  <li>📊 <strong>Visual Pagination:</strong> Uses scrollHeight measurement in a Block Formatting Context (BFC) to calculate perfect page divisions.</li>
                  <li>⚡ <strong>Vector Export Engine:</strong> Integrates a Node.js Puppeteer backend utilizing headless Chromium vector print commands.</li>
                  <li>🎨 <strong>Professional Stylesheets:</strong> 5 built-in typography templates (Corporate, Academic, Resume, Tech, Classic) plus Custom CSS overrides.</li>
                  <li>🧮 <strong>Math & Diagrams:</strong> Asynchronous render pipelines compile complex LaTeX equations (KaTeX) and SVG charts (Mermaid).</li>
                </ul>
              </div>

              <div className="dev-info">
                <h3>Developer Profile</h3>
                <div className="dev-card">
                  <div className="dev-avatar">MA</div>
                  <div className="dev-details">
                    <h4>Mujahid Afridi</h4>
                    <p>Full-Stack Developer & Technical Lead</p>
                    <a href="mailto:imujahidafridi@gmail.com" className="dev-email">
                      imujahidafridi@gmail.com
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
