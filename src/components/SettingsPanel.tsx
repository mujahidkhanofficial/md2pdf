import React from 'react';
import { Sliders, HelpCircle } from 'lucide-react';
import type { SavedDocument } from '../hooks/useLocalStorage';

interface SettingsPanelProps {
  isOpen: boolean;
  activeDoc: SavedDocument | null;
  onUpdateDoc: (updates: Partial<Omit<SavedDocument, 'id'>>) => void;
  headerTitle: string;
  setHeaderTitle: (title: string) => void;
  footerText: string;
  setFooterText: (text: string) => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  isOpen,
  activeDoc,
  onUpdateDoc,
  headerTitle,
  setHeaderTitle,
  footerText,
  setFooterText
}) => {
  if (!isOpen || !activeDoc) return null;

  return (
    <div className={`settings-panel ${isOpen ? '' : 'collapsed'}`}>
      <div className="panel-header">
        <span>Settings & PDF Layout</span>
        <Sliders size={16} />
      </div>

      <div className="settings-content">
        {/* Section: Template Preset */}
        <div className="settings-section">
          <div className="settings-section-title">Stylesheet Preset</div>
          <div className="preset-selector">
            {(['default', 'corporate', 'tech', 'resume', 'academic'] as const).map((style) => (
              <button
                key={style}
                className={`preset-btn ${activeDoc.cssPreset === style ? 'active' : ''}`}
                onClick={() => onUpdateDoc({ cssPreset: style })}
              >
                {style.charAt(0).toUpperCase() + style.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Section: Page Configuration */}
        <div className="settings-section">
          <div className="settings-section-title">Page Setup</div>
          
          <div className="form-group">
            <label>Paper Size</label>
            <div className="preset-selector">
              {(['a4', 'letter', 'legal'] as const).map((size) => (
                <button
                  key={size}
                  className={`preset-btn ${activeDoc.pageSize === size ? 'active' : ''}`}
                  onClick={() => onUpdateDoc({ pageSize: size })}
                >
                  {size.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Orientation</label>
            <div className="preset-selector">
              {(['portrait', 'landscape'] as const).map((orient) => (
                <button
                  key={orient}
                  className={`preset-btn ${activeDoc.orientation === orient ? 'active' : ''}`}
                  onClick={() => onUpdateDoc({ orientation: orient })}
                >
                  {orient.charAt(0).toUpperCase() + orient.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Margins</label>
            <div className="preset-selector">
              {(['none', 'compact', 'normal'] as const).map((margin) => (
                <button
                  key={margin}
                  className={`preset-btn ${activeDoc.margin === margin ? 'active' : ''}`}
                  onClick={() => onUpdateDoc({ margin: margin })}
                >
                  {margin.charAt(0).toUpperCase() + margin.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Horizontal Line Style (HR)</label>
            <div className="preset-selector" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
              {(['solid', 'dashed', 'dotted', 'double', 'gradient', 'hidden'] as const).map((style) => (
                <button
                  key={style}
                  className={`preset-btn ${activeDoc.hrStyle === style || (!activeDoc.hrStyle && style === 'solid') ? 'active' : ''}`}
                  onClick={() => onUpdateDoc({ hrStyle: style })}
                  style={{ fontSize: '11px', padding: '6px' }}
                >
                  {style.charAt(0).toUpperCase() + style.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Section: Headers & Footers */}
        <div className="settings-section">
          <div className="settings-section-title">Header & Footer</div>
          
          <div className="toggle-group form-group">
            <label htmlFor="showHeaderToggle">Show Page Header</label>
            <label className="switch">
              <input
                id="showHeaderToggle"
                type="checkbox"
                checked={activeDoc.showHeader}
                onChange={(e) => onUpdateDoc({ showHeader: e.target.checked })}
              />
              <span className="slider"></span>
            </label>
          </div>

          {activeDoc.showHeader && (
            <div className="form-group">
              <label>Header Title Text</label>
              <input
                type="text"
                className="input"
                placeholder="Document Header Title"
                value={headerTitle}
                onChange={(e) => setHeaderTitle(e.target.value)}
              />
            </div>
          )}

          <div className="toggle-group form-group">
            <label htmlFor="showFooterToggle">Show Page Footer</label>
            <label className="switch">
              <input
                id="showFooterToggle"
                type="checkbox"
                checked={activeDoc.showFooter}
                onChange={(e) => onUpdateDoc({ showFooter: e.target.checked })}
              />
              <span className="slider"></span>
            </label>
          </div>

          {activeDoc.showFooter && (
            <div className="form-group">
              <label>Footer Text</label>
              <input
                type="text"
                className="input"
                placeholder="Document Footer Text"
                value={footerText}
                onChange={(e) => setFooterText(e.target.value)}
              />
            </div>
          )}
        </div>

        {/* Section: Custom Stylesheet CSS Injection */}
        <div className="settings-section">
          <div className="settings-section-title" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            Custom Stylesheet CSS
            <span title="Inject custom CSS styles directly to compile inside the PDF document layout" style={{ cursor: 'help', color: 'var(--text-muted)' }}>
              <HelpCircle size={14} />
            </span>
          </div>
          <div className="form-group">
            <textarea
              className="input css-editor"
              placeholder="/* Example: \n.markdown-body h1 { color: #f43f5e; } */"
              value={activeDoc.customCss || ''}
              onChange={(e) => onUpdateDoc({ customCss: e.target.value })}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
