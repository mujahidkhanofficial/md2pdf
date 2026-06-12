import React from 'react';
import type { SavedDocument } from '../hooks/useLocalStorage';

interface StatusbarProps {
  activeDoc: SavedDocument | null;
}

export const Statusbar: React.FC<StatusbarProps> = ({ activeDoc }) => {
  if (!activeDoc) return <div className="statusbar"><span>Ready</span></div>;

  const getStats = (text: string) => {
    const chars = text.length;
    const cleanText = text.trim();
    const words = cleanText === '' ? 0 : cleanText.split(/\s+/).length;
    const readTime = Math.max(1, Math.ceil(words / 200)); // Average reading speed of 200 wpm
    return { chars, words, readTime };
  };

  const { chars, words, readTime } = getStats(activeDoc.markdown);

  return (
    <div className="statusbar">
      <div className="statusbar-group">
        <span>Words: <strong>{words}</strong></span>
        <span>Characters: <strong>{chars}</strong></span>
        <span>Reading Time: ~<strong>{readTime} min</strong></span>
      </div>

      <div className="statusbar-group">
        <span>Template: <strong style={{ textTransform: 'capitalize' }}>{activeDoc.cssPreset}</strong></span>
        <span>Page Size: <strong>{activeDoc.pageSize.toUpperCase()}</strong></span>
        <span>Status: <strong style={{ color: 'var(--success-color)' }}>Auto-saved</strong></span>
      </div>
    </div>
  );
};
