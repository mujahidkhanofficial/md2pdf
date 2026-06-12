import React, { useState } from 'react';
import { 
  Plus, FileText, Trash2, Download, Printer, 
  ChevronDown, FileCode, Edit2, Info
} from 'lucide-react';
import type { SavedDocument } from '../hooks/useLocalStorage';
import { defaultTemplates } from '../templates/defaultTemplates';

interface DocumentManagerProps {
  isOpen: boolean;
  documents: SavedDocument[];
  activeId: string;
  setActiveId: (id: string) => void;
  onCreateDoc: (title?: string, template?: any) => void;
  onUpdateDoc: (id: string, updates: Partial<Omit<SavedDocument, 'id'>>) => void;
  onDeleteDoc: (id: string) => void;
  onDownloadPdf: () => void;
  onPrintPdf: () => void;
  downloadProgress?: number | null;
  onOpenAbout: () => void;
}

export const DocumentManager: React.FC<DocumentManagerProps> = ({
  isOpen,
  documents,
  activeId,
  setActiveId,
  onCreateDoc,
  onUpdateDoc,
  onDeleteDoc,
  onDownloadPdf,
  onPrintPdf,
  downloadProgress,
  onOpenAbout
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState<string>('');
  const [showTemplatesDropdown, setShowTemplatesDropdown] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleStartRename = (doc: SavedDocument, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(doc.id);
    setEditTitle(doc.title);
  };

  const handleSaveRename = (id: string) => {
    if (editTitle.trim()) {
      onUpdateDoc(id, { title: editTitle.trim() });
    }
    setEditingId(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent, id: string) => {
    if (e.key === 'Enter') {
      handleSaveRename(id);
    } else if (e.key === 'Escape') {
      setEditingId(null);
    }
  };

  const handleExportMarkdown = (doc: SavedDocument) => {
    const blob = new Blob([doc.markdown], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${doc.title.replace(/\s+/g, '_')}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportHtml = (doc: SavedDocument) => {
    // Basic export HTML container
    const previewDoc = document.querySelector('.markdown-body');
    const content = previewDoc ? previewDoc.innerHTML : doc.markdown;
    const customStyles = doc.customCss ? `<style>${doc.customCss}</style>` : '';
    
    const htmlOutput = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${doc.title}</title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/5.2.0/github-markdown.min.css">
  ${customStyles}
  <style>
    body { padding: 40px; max-width: 800px; margin: 0 auto; }
  </style>
</head>
<body class="markdown-body">
  ${content}
</body>
</html>`;

    const blob = new Blob([htmlOutput], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${doc.title.replace(/\s+/g, '_')}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const activeDoc = documents.find(d => d.id === activeId) || null;

  return (
    <div className={`sidebar ${isOpen ? '' : 'collapsed'}`}>
      <div className="panel-header">
        <span>Documents Explorer</span>
        <FileText size={16} />
      </div>

      {/* Main Buttons */}
      <div style={{ padding: '16px 12px 6px 12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <button className="btn btn-primary" onClick={() => onCreateDoc('Untitled Document')} style={{ width: '100%' }}>
          <Plus size={16} /> New Document
        </button>

        {/* Templates Selector */}
        <div style={{ position: 'relative' }}>
          <button 
            className="btn" 
            onClick={() => setShowTemplatesDropdown(!showTemplatesDropdown)} 
            style={{ width: '100%', justifyContent: 'space-between' }}
          >
            <span>Import Template</span>
            <ChevronDown size={14} />
          </button>
          
          {showTemplatesDropdown && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              backgroundColor: 'var(--bg-panel)',
              border: '1px solid var(--border-color)',
              borderRadius: '6px',
              marginTop: '4px',
              zIndex: 20,
              boxShadow: 'var(--shadow-lg)'
            }}>
              {defaultTemplates.map((tpl) => (
                <div 
                  key={tpl.id}
                  style={{
                    padding: '8px 12px',
                    fontSize: '12px',
                    cursor: 'pointer',
                    color: 'var(--text-secondary)'
                  }}
                  className="doc-item"
                  onClick={() => {
                    onCreateDoc(tpl.title, tpl);
                    setShowTemplatesDropdown(false);
                  }}
                >
                  {tpl.title}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Document Items List */}
      <div className="doc-list">
        {documents.map((doc) => (
          <div 
            key={doc.id}
            className={`doc-item ${doc.id === activeId ? 'active' : ''}`}
            onClick={() => {
              if (editingId !== doc.id) setActiveId(doc.id);
            }}
          >
            <div className="doc-item-title" style={{ flex: 1 }}>
              <FileText size={14} style={{ flexShrink: 0 }} />
              {editingId === doc.id ? (
                <input
                  type="text"
                  className="input"
                  style={{ padding: '2px 6px', fontSize: '12px', margin: 0 }}
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  onBlur={() => handleSaveRename(doc.id)}
                  onKeyDown={(e) => handleKeyDown(e, doc.id)}
                  autoFocus
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <span>{doc.title}</span>
              )}
            </div>

            {editingId !== doc.id && (
              <div className="doc-item-actions">
                <button 
                  className="btn btn-icon btn-sm" 
                  style={{ width: '24px', height: '24px', background: 'transparent', border: 'none' }}
                  onClick={(e) => handleStartRename(doc, e)}
                  title="Rename"
                >
                  <Edit2 size={12} />
                </button>
                <button 
                  className="btn btn-icon btn-sm btn-danger" 
                  style={{ width: '24px', height: '24px', background: 'transparent', border: 'none' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm(`Are you sure you want to delete "${doc.title}"?`)) {
                      onDeleteDoc(doc.id);
                    }
                  }}
                  title="Delete"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Export / Download Action Bar */}
      {activeDoc && (
        <div className="sidebar-footer">
          <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase' }}>
            Export Options
          </div>
          
          <button className="btn btn-primary btn-sm" onClick={onPrintPdf} style={{ width: '100%' }}>
            <Printer size={14} /> Save Vector PDF / Print
          </button>

          <button 
            className="btn btn-sm" 
            onClick={onDownloadPdf} 
            disabled={downloadProgress !== null}
            style={{ 
              width: '100%',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {downloadProgress !== null && (
              <div 
                className="btn-progress-fill" 
                style={{ 
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: `${downloadProgress}%`,
                  backgroundColor: 'var(--bg-input-focus)',
                  transition: 'width 0.1s ease',
                  opacity: 0.8,
                  zIndex: 0
                }}
              />
            )}
            <span style={{ position: 'relative', zIndex: 1, display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              <Download size={14} /> 
              {downloadProgress !== null ? `Generating PDF (${downloadProgress}%)` : 'Download PDF (Vector)'}
            </span>
          </button>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
            <button className="btn btn-sm" onClick={() => handleExportMarkdown(activeDoc)} title="Export raw Markdown (.md)">
              <FileText size={12} /> MD
            </button>
            <button className="btn btn-sm" onClick={() => handleExportHtml(activeDoc)} title="Export formatted HTML (.html)">
              <FileCode size={12} /> HTML
            </button>
          </div>
          
          <button 
            className="btn btn-sm" 
            onClick={onOpenAbout}
            style={{ 
              width: '100%', 
              marginTop: '8px', 
              background: 'transparent', 
              border: '1px dashed var(--border-color)', 
              color: 'var(--text-secondary)',
              fontSize: '11px',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <Info size={12} />
            <span>About App & Developer</span>
          </button>
        </div>
      )}
    </div>
  );
};
