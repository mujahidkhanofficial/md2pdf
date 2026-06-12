import React, { useState, useEffect, useRef } from 'react';
import { 
  Bold, Italic, Heading1, Heading2, Heading3, 
  List, ListOrdered, CheckSquare, Quote, Code, 
  Table, Image, Calculator, FileText, 
  Columns, Eye, Edit3, FolderOpen, Settings,
  Info, LogOut, User
} from 'lucide-react';

interface ToolbarProps {
  onInsertMarkdown: (type: string) => void;
  layout: 'editor' | 'split' | 'preview';
  setLayout: (layout: 'editor' | 'split' | 'preview') => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  isSettingsOpen: boolean;
  setIsSettingsOpen: (open: boolean) => void;
  onOpenAbout: () => void;
  onLogout: () => void;
  currentUserEmail: string | null;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  onInsertMarkdown,
  layout,
  setLayout,
  isSidebarOpen,
  setIsSidebarOpen,
  isSettingsOpen,
  setIsSettingsOpen,
  onOpenAbout,
  onLogout,
  currentUserEmail
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);


  return (
    <div className="toolbar">
      {/* Left Group: Sidebar toggle & Formatting */}
      <div className="toolbar-group">
        <button 
          className={`btn btn-icon btn-sm ${isSidebarOpen ? 'btn-primary' : ''}`}
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          title="Toggle Documents Explorer"
        >
          <FolderOpen size={16} />
        </button>
        <div className="divider" />
        
        <button className="btn btn-icon btn-sm" onClick={() => onInsertMarkdown('bold')} title="Bold (Ctrl+B)">
          <Bold size={16} />
        </button>
        <button className="btn btn-icon btn-sm" onClick={() => onInsertMarkdown('italic')} title="Italic (Ctrl+I)">
          <Italic size={16} />
        </button>
        <div className="divider" />
        
        <button className="btn btn-icon btn-sm" onClick={() => onInsertMarkdown('h1')} title="Heading 1">
          <Heading1 size={16} />
        </button>
        <button className="btn btn-icon btn-sm" onClick={() => onInsertMarkdown('h2')} title="Heading 2">
          <Heading2 size={16} />
        </button>
        <button className="btn btn-icon btn-sm" onClick={() => onInsertMarkdown('h3')} title="Heading 3">
          <Heading3 size={16} />
        </button>
        <div className="divider" />
        
        <button className="btn btn-icon btn-sm" onClick={() => onInsertMarkdown('ul')} title="Bulleted List">
          <List size={16} />
        </button>
        <button className="btn btn-icon btn-sm" onClick={() => onInsertMarkdown('ol')} title="Numbered List">
          <ListOrdered size={16} />
        </button>
        <button className="btn btn-icon btn-sm" onClick={() => onInsertMarkdown('todo')} title="Task List">
          <CheckSquare size={16} />
        </button>
        <div className="divider" />
        
        <button className="btn btn-icon btn-sm" onClick={() => onInsertMarkdown('quote')} title="Blockquote">
          <Quote size={16} />
        </button>
        <button className="btn btn-icon btn-sm" onClick={() => onInsertMarkdown('code')} title="Code Block">
          <Code size={16} />
        </button>
        <button className="btn btn-icon btn-sm" onClick={() => onInsertMarkdown('table')} title="Table">
          <Table size={16} />
        </button>
        <button className="btn btn-icon btn-sm" onClick={() => onInsertMarkdown('image')} title="Image">
          <Image size={16} />
        </button>
        <button className="btn btn-icon btn-sm" onClick={() => onInsertMarkdown('math')} title="LaTeX Equation">
          <Calculator size={16} />
        </button>
        <button 
          className="btn btn-sm btn-icon" 
          onClick={() => onInsertMarkdown('pagebreak')} 
          title="Insert Page Break"
          style={{ width: 'auto', padding: '0 8px', display: 'flex', gap: '4px' }}
        >
          <FileText size={16} />
          <span style={{ fontSize: '11px', fontWeight: 600 }}>PAGE BREAK</span>
        </button>
      </div>

      {/* Right Group: Layout controls, Theme & Settings */}
      <div className="toolbar-group">
        <div className="preset-selector" style={{ display: 'flex', marginRight: '8px' }}>
          <button 
            className={`btn btn-sm ${layout === 'editor' ? 'btn-primary' : ''}`} 
            onClick={() => setLayout('editor')}
            title="Editor View"
          >
            <Edit3 size={14} />
          </button>
          <button 
            className={`btn btn-sm ${layout === 'split' ? 'btn-primary' : ''}`} 
            onClick={() => setLayout('split')}
            title="Split View"
          >
            <Columns size={14} />
          </button>
          <button 
            className={`btn btn-sm ${layout === 'preview' ? 'btn-primary' : ''}`} 
            onClick={() => setLayout('preview')}
            title="Preview View"
          >
            <Eye size={14} />
          </button>
        </div>

        <button 
          className={`btn btn-icon btn-sm ${isSettingsOpen ? 'btn-primary' : ''}`}
          onClick={() => setIsSettingsOpen(!isSettingsOpen)}
          title="Layout & PDF Settings"
        >
          <Settings size={16} />
        </button>

        <button 
          className="btn btn-icon btn-sm" 
          onClick={onOpenAbout}
          title="About App & Developer"
        >
          <Info size={16} />
        </button>

        {/* Account Profile Dropdown */}
        <div className="profile-menu-container" ref={dropdownRef}>
          <button 
            className="profile-avatar-btn"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            title="Account Profile"
          >
            <div className="profile-avatar">
              <User size={16} />
            </div>
          </button>

          {isDropdownOpen && (
            <div className="profile-dropdown">
              <div className="profile-dropdown-header">
                <div className="profile-dropdown-email-label">Signed in as</div>
                <div className="profile-dropdown-email" title={currentUserEmail || ''}>
                  {currentUserEmail}
                </div>
              </div>
              
              <button 
                className="profile-dropdown-item" 
                onClick={() => {
                  onOpenAbout();
                  setIsDropdownOpen(false);
                }}
              >
                <Info size={14} />
                <span>About App</span>
              </button>
              
              <div className="profile-dropdown-divider" />
              
              <button 
                className="profile-dropdown-item danger" 
                onClick={() => {
                  setIsDropdownOpen(false);
                  onLogout();
                }}
              >
                <LogOut size={14} />
                <span>Log Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
