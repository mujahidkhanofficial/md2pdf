import React, { useRef, useEffect } from 'react';

interface EditorProps {
  markdown: string;
  onChangeMarkdown: (text: string) => void;
  editorRef: React.RefObject<HTMLTextAreaElement | null>;
}

export const Editor: React.FC<EditorProps> = ({
  markdown,
  onChangeMarkdown,
  editorRef
}) => {
  const lineCounterRef = useRef<HTMLDivElement | null>(null);

  // Generate lines count based on markdown newlines
  const lines = markdown.split('\n');
  const lineCount = Math.max(lines.length, 1);

  // Synchronize scrolling of line numbers column with the editor textarea
  const handleScroll = () => {
    if (editorRef.current && lineCounterRef.current) {
      lineCounterRef.current.scrollTop = editorRef.current.scrollTop;
    }
  };

  // Keep line numbers scrolled when lines count grows
  useEffect(() => {
    handleScroll();
  }, [markdown]);

  // Support Tab key indentation and keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const textarea = editorRef.current;
    if (!textarea) return;

    // 1. Tab Key Handling
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const spaces = '  '; // 2 spaces for tab
      
      const newText = markdown.substring(0, start) + spaces + markdown.substring(end);
      onChangeMarkdown(newText);

      // Reset cursor position
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + spaces.length;
      }, 0);
    }

    // 2. Bold Shortcut (Ctrl + B / Cmd + B)
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
      e.preventDefault();
      insertFormatting('**', '**');
    }

    // 3. Italic Shortcut (Ctrl + I / Cmd + I)
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'i') {
      e.preventDefault();
      insertFormatting('*', '*');
    }
  };

  const insertFormatting = (before: string, after: string) => {
    const textarea = editorRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selection = markdown.substring(start, end);
    
    const formatted = before + selection + after;
    const newText = markdown.substring(0, start) + formatted + markdown.substring(end);
    onChangeMarkdown(newText);

    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = start + before.length;
      textarea.selectionEnd = start + before.length + selection.length;
    }, 0);
  };

  return (
    <div className="editor-container">
      {/* Line Numbers Column */}
      <div className="line-numbers" ref={lineCounterRef}>
        {Array.from({ length: lineCount }).map((_, index) => (
          <span key={index}>{index + 1}</span>
        ))}
      </div>

      {/* Editor Main Text Area */}
      <textarea
        className="editor-textarea"
        ref={editorRef}
        value={markdown}
        onChange={(e) => onChangeMarkdown(e.target.value)}
        onScroll={handleScroll}
        onKeyDown={handleKeyDown}
        placeholder="Type some Markdown here..."
        spellCheck="false"
      />
    </div>
  );
};
