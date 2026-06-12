import React, { useEffect, useState } from 'react';
import { marked } from 'marked';
import Prism from 'prismjs';
import katex from 'katex';
import mermaid from 'mermaid';
import type { SavedDocument } from '../hooks/useLocalStorage';
import { Plus, Minus, FileText } from 'lucide-react';

// Import CSS styles for equations & syntax highlighting
import 'katex/dist/katex.min.css';
import 'prismjs/themes/prism-tomorrow.css';

// Configure Marked options
marked.setOptions({
  gfm: true,
  breaks: true,
});

interface PreviewProps {
  activeDoc: SavedDocument | null;
  previewRef: React.RefObject<HTMLDivElement | null>;
  headerTitle: string;
  footerText: string;
}

// Initialize Mermaid
mermaid.initialize({
  startOnLoad: false,
  securityLevel: 'loose',
  theme: 'neutral',
  logLevel: 5
});

export const Preview: React.FC<PreviewProps> = ({
  activeDoc,
  previewRef,
  headerTitle,
  footerText
}) => {
  const [renderedHtml, setRenderedHtml] = useState<string>('');
  const [pages, setPages] = useState<string[]>([]);
  const [zoom, setZoom] = useState<number>(100);
  const [isFitWidth, setIsFitWidth] = useState<boolean>(true);

  const calculateAndSetFitZoom = () => {
    const el = previewRef.current;
    if (!el || !activeDoc) return;

    const PAGE_SIZES: Record<string, { w: number; h: number }> = {
      a4: { w: 210, h: 297 },
      letter: { w: 215.9, h: 279.4 },
      legal: { w: 215.9, h: 355.6 },
    };

    const dims = PAGE_SIZES[activeDoc.pageSize] || PAGE_SIZES.a4;
    const pageW = activeDoc.orientation === 'landscape' ? dims.h : dims.w;

    const MM_TO_PX = 96 / 25.4;
    const pageWidthPx = pageW * MM_TO_PX;
    const paddingPx = 80; // 40px left + 40px right padding
    const requiredWidth = pageWidthPx + paddingPx;

    const paneWidth = el.clientWidth;
    if (paneWidth > 0) {
      let fitZoom = Math.floor((paneWidth / requiredWidth) * 100);
      fitZoom = Math.max(50, Math.min(200, fitZoom));
      setZoom(fitZoom);
    }
  };

  // Recalculate zoom when fit mode is enabled and size changes
  useEffect(() => {
    if (!isFitWidth) return;
    
    calculateAndSetFitZoom();

    const el = previewRef.current;
    if (!el) return;

    const observer = new ResizeObserver(() => {
      calculateAndSetFitZoom();
    });

    observer.observe(el);
    return () => {
      observer.disconnect();
    };
  }, [isFitWidth, activeDoc?.pageSize, activeDoc?.orientation, renderedHtml]);

  // Preprocessor for Latex Math equations to protect them from marked compiler
  const preprocessMath = (text: string): { text: string; formulas: Record<string, { formula: string; display: boolean }> } => {
    const formulas: Record<string, { formula: string; display: boolean }> = {};
    let placeholderId = 0;

    // 1. Process Display Math ($$.*$$)
    let processed = text.replace(/\$\$\s*([\s\S]+?)\s*\$\$/g, (_, formula) => {
      const key = `MATHPLACEHOLDER${placeholderId++}`;
      formulas[key] = { formula, display: true };
      return key;
    });

    // 2. Process Inline Math ($...$)
    processed = processed.replace(/\$\s*([^\$\n]+?)\s*\$/g, (_, formula) => {
      const key = `MATHPLACEHOLDER${placeholderId++}`;
      formulas[key] = { formula, display: false };
      return key;
    });

    return { text: processed, formulas };
  };

  // Compile markdown + math + mermaid
  useEffect(() => {
    if (!activeDoc) return;
    
    let isMounted = true;
    
    const compile = async () => {
      try {
        const { text: safeText, formulas } = preprocessMath(activeDoc.markdown);
        
        // Parse markdown to HTML
        let html = marked.parse(safeText) as string;

        // Replace math placeholders with Katex outputs
        Object.entries(formulas).forEach(([placeholder, info]) => {
          try {
            const renderedKatex = katex.renderToString(info.formula, {
              displayMode: info.display,
              throwOnError: false
            });
            html = html.replace(placeholder, renderedKatex);
          } catch (e) {
            console.error('KaTeX rendering error', e);
            html = html.replace(placeholder, `<span style="color: var(--error-color)">[Math Error: ${info.formula}]</span>`);
          }
        });

        // Parse HTML to DOM to find and render Mermaid diagrams
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const mermaidBlocks = doc.querySelectorAll('pre code.language-mermaid');

        for (let i = 0; i < mermaidBlocks.length; i++) {
          const block = mermaidBlocks[i] as HTMLElement;
          const codeText = block.textContent || '';
          const parent = block.parentElement;
          if (parent) {
            const uniqueId = `mermaid-svg-${Date.now()}-${i}`;
            try {
              // Render SVG using mermaid API
              const { svg } = await mermaid.render(uniqueId, codeText);
              
              // Replace parent <pre> block with a container div containing the SVG
              const container = doc.createElement('div');
              container.className = 'mermaid';
              container.innerHTML = svg;
              parent.parentNode?.replaceChild(container, parent);
            } catch (err: any) {
              console.error('Mermaid rendering failed', err);
              const container = doc.createElement('div');
              container.className = 'mermaid-error';
              container.innerHTML = `<div style="color:var(--error-color);font-size:12px;padding:8px;">[Mermaid Draw Error]</div>`;
              parent.parentNode?.replaceChild(container, parent);
            }
          }
        }

        if (isMounted) {
          setRenderedHtml(doc.body.innerHTML);
        }
      } catch (e) {
        console.error('Marked parsing error', e);
      }
    };

    compile();
    
    return () => {
      isMounted = false;
    };
  }, [activeDoc?.markdown]);

  // Client-side HTML pagination algorithm
  const paginate = () => {
    if (!activeDoc || !renderedHtml) {
      setPages([]);
      return;
    }

    const PAGE_SIZES: Record<string, { w: number; h: number }> = {
      a4: { w: 210, h: 297 },
      letter: { w: 215.9, h: 279.4 },
      legal: { w: 215.9, h: 355.6 },
    };

    const dims = PAGE_SIZES[activeDoc.pageSize] || PAGE_SIZES.a4;
    const pageW = activeDoc.orientation === 'landscape' ? dims.h : dims.w;
    const pageH = activeDoc.orientation === 'landscape' ? dims.w : dims.h;

    let marginMm = 25;
    if (activeDoc.margin === 'none') marginMm = 0;
    else if (activeDoc.margin === 'compact') marginMm = 15;

    const MM_TO_PX = 96 / 25.4;
    const pageWidthPx = pageW * MM_TO_PX;
    const pageHeightPx = pageH * MM_TO_PX;
    const marginPx = marginMm * MM_TO_PX;
    const contentWidthPx = pageWidthPx - marginPx * 2;
    const contentHeightPx = pageHeightPx - marginPx * 2;

    // Create temporary off-screen container for layout measurement
    const tempContainer = document.createElement('div');
    tempContainer.className = `markdown-body template-${activeDoc.cssPreset}`;
    tempContainer.style.position = 'absolute';
    tempContainer.style.visibility = 'hidden';
    tempContainer.style.pointerEvents = 'none';
    tempContainer.style.left = '-9999px';
    tempContainer.style.top = '0';
    tempContainer.style.width = `${contentWidthPx}px`;
    tempContainer.style.boxSizing = 'border-box';

    if (activeDoc.customCss) {
      const styleTag = document.createElement('style');
      styleTag.innerHTML = activeDoc.customCss;
      tempContainer.appendChild(styleTag);
    }

    const contentWrapper = document.createElement('div');
    contentWrapper.style.width = '100%';
    contentWrapper.style.display = 'flow-root';
    contentWrapper.style.boxSizing = 'border-box';
    contentWrapper.innerHTML = renderedHtml;
    tempContainer.appendChild(contentWrapper);
    document.body.appendChild(tempContainer);

    // Measure Header and Footer simulation height
    let headerHeight = 0;
    let footerHeight = 0;

    if (activeDoc.showHeader) {
      const tempHeader = document.createElement('div');
      tempHeader.className = 'preview-header-sim';
      tempHeader.style.width = `${contentWidthPx}px`;
      tempHeader.innerHTML = `<span>${headerTitle || activeDoc.title}</span><span>${new Date().toLocaleDateString()}</span>`;
      tempContainer.appendChild(tempHeader);
      const style = window.getComputedStyle(tempHeader);
      const marginTop = parseFloat(style.marginTop) || 0;
      const marginBottom = parseFloat(style.marginBottom) || 0;
      headerHeight = tempHeader.getBoundingClientRect().height + marginTop + marginBottom;
      tempContainer.removeChild(tempHeader);
    }

    if (activeDoc.showFooter) {
      const tempFooter = document.createElement('div');
      tempFooter.className = 'preview-footer-sim';
      tempFooter.style.width = `${contentWidthPx}px`;
      tempFooter.innerHTML = `<span>${footerText || 'Confidential'}</span><span>Page 1 of 1</span>`;
      tempContainer.appendChild(tempFooter);
      const style = window.getComputedStyle(tempFooter);
      const marginTop = parseFloat(style.marginTop) || 0;
      const marginBottom = parseFloat(style.marginBottom) || 0;
      footerHeight = tempFooter.getBoundingClientRect().height + marginTop + marginBottom;
      tempContainer.removeChild(tempFooter);
    }

    const maxPageContentHeight = contentHeightPx - headerHeight - footerHeight;

    const children = Array.from(contentWrapper.children);
    // Detach all children from parent so we can measure them incrementally
    children.forEach(child => (child as HTMLElement).remove());

    const newPages: string[] = [];
    let currentPageHtml: string[] = [];

    children.forEach((child) => {
      const htmlElement = child as HTMLElement;
      
      // An element is a page break if it is class "page-break" or has an inner element with class "page-break"
      const isPageBreak = htmlElement.classList.contains('page-break') || htmlElement.querySelector('.page-break') !== null;

      if (isPageBreak) {
        if (currentPageHtml.length > 0) {
          newPages.push(currentPageHtml.join(''));
          currentPageHtml = [];
          Array.from(contentWrapper.children).forEach(c => (c as HTMLElement).remove());
        }
        return;
      }

      // Temporarily append child to measure cumulative height (respects margin collapse!)
      contentWrapper.appendChild(htmlElement);
      const heightAfter = contentWrapper.scrollHeight;

      if (heightAfter > maxPageContentHeight && currentPageHtml.length > 0) {
        // Doesn't fit in the current page, start a new one
        newPages.push(currentPageHtml.join(''));
        currentPageHtml = [htmlElement.outerHTML];
        
        // Clear container and append to the new page context
        Array.from(contentWrapper.children).forEach(c => (c as HTMLElement).remove());
        contentWrapper.appendChild(htmlElement);
      } else {
        // Fits, keep it on current page
        currentPageHtml.push(htmlElement.outerHTML);
      }
    });

    if (currentPageHtml.length > 0) {
      newPages.push(currentPageHtml.join(''));
    }

    document.body.removeChild(tempContainer);
    setPages(newPages.length > 0 ? newPages : [renderedHtml]);
  };

  // Trigger pagination layout calculations
  useEffect(() => {
    paginate();

    // Trigger repeatedly at small delays to account for slow rendering assets (KaTeX math, Prism syntax highlighting, etc.)
    const t1 = setTimeout(paginate, 50);
    const t2 = setTimeout(paginate, 250);
    const t3 = setTimeout(paginate, 1000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [
    renderedHtml,
    activeDoc?.pageSize,
    activeDoc?.orientation,
    activeDoc?.margin,
    activeDoc?.cssPreset,
    activeDoc?.customCss,
    activeDoc?.hrStyle,
    headerTitle,
    footerText
  ]);

  // Watch window resizing since text layout widths change page wrapping points
  useEffect(() => {
    window.addEventListener('resize', paginate);
    return () => window.removeEventListener('resize', paginate);
  }, [renderedHtml, activeDoc?.pageSize, activeDoc?.orientation, activeDoc?.margin]);

  // Handle Syntax Highlighting post-mounting
  useEffect(() => {
    if (!activeDoc) return;
    // Trigger Prism Syntax Highlighting
    Prism.highlightAll();
  }, [pages]);

  if (!activeDoc) {
    return (
      <div className="preview-pane" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
        No document selected
      </div>
    );
  }

  return (
    <div className="preview-pane-content" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* PDF Preview Zoom Toolbar */}
      <div className="preview-toolbar">
        <div className="preview-toolbar-title">
          <FileText size={14} />
          <span>PDF Preview</span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div className="preview-page-indicator">
            {pages.length} {pages.length === 1 ? 'Page' : 'Pages'}
          </div>
          
          <div className="preview-zoom-controls">
            <button 
              className="preview-zoom-btn" 
              onClick={() => {
                setIsFitWidth(false);
                setZoom(prev => Math.max(50, prev - 10));
              }}
              title="Zoom Out"
              disabled={zoom <= 50}
            >
              <Minus size={12} />
            </button>
            <span 
              className="preview-zoom-val" 
              onClick={() => {
                setIsFitWidth(false);
                setZoom(100);
              }} 
              title="Reset zoom to 100%"
            >
              {zoom}%
            </span>
            <button 
              className="preview-zoom-btn" 
              onClick={() => {
                setIsFitWidth(false);
                setZoom(prev => Math.min(200, prev + 10));
              }}
              title="Zoom In"
              disabled={zoom >= 200}
            >
              <Plus size={12} />
            </button>
            <div className="preview-zoom-divider" />
            <button 
              type="button"
              className={`preview-fit-btn ${isFitWidth ? 'active' : ''}`}
              onClick={() => setIsFitWidth(!isFitWidth)}
              title={isFitWidth ? "Disable auto-fit" : "Auto-fit page to width"}
            >
              Fit
            </button>
          </div>
        </div>
      </div>

      {/* Scrollable pane holding the zoomable preview */}
      <div className="preview-scroll-pane" style={{ overflow: 'auto', flex: 1 }} ref={previewRef}>
        <div className="preview-zoom-container" style={{ zoom: zoom / 100, width: '100%', minHeight: '100%', display: 'flex', justifyContent: 'center' }}>
          <div className="preview-container" id="print-target">
            {pages.map((pageHtml, index) => {
              const pageClass = [
                'preview-page',
                'markdown-body',
                `template-${activeDoc.cssPreset}`,
                `size-${activeDoc.pageSize}`,
                activeDoc.orientation === 'landscape' ? 'landscape' : '',
                `margin-${activeDoc.margin}`,
                `hr-style-${activeDoc.hrStyle || 'solid'}`
              ].filter(Boolean).join(' ');

              return (
                <React.Fragment key={index}>
                  <div className={pageClass}>
                    {/* Dynamic User Custom Styling Injected */}
                    {activeDoc.customCss && (
                      <style dangerouslySetInnerHTML={{ __html: activeDoc.customCss }} />
                    )}

                    {/* Simulated Page Header */}
                    {activeDoc.showHeader && (
                      <div className="preview-header-sim">
                        <span>{headerTitle || activeDoc.title}</span>
                        <span>{new Date().toLocaleDateString()}</span>
                      </div>
                    )}

                    {/* Rendered Document Content */}
                    <div className="page-content" dangerouslySetInnerHTML={{ __html: pageHtml }} />

                    {/* Simulated Page Footer */}
                    {activeDoc.showFooter && (
                      <div className="preview-footer-sim">
                        <span>{footerText || 'Confidential'}</span>
                        <span>Page {index + 1} of {pages.length}</span>
                      </div>
                    )}
                  </div>

                  {/* Page break indicator between pages (screen only) */}
                  {index < pages.length - 1 && (
                    <div className="preview-page-break-indicator">
                      <span>Page Break (Page {index + 1} of {pages.length})</span>
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
