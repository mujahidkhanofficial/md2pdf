import { useEffect, useRef } from 'react';

export function useScrollSync(
  editorRef: React.RefObject<HTMLTextAreaElement | null>,
  previewRef: React.RefObject<HTMLDivElement | null>
) {
  const isSyncingRef = useRef<boolean>(false);
  const activePaneRef = useRef<'editor' | 'preview' | null>(null);

  useEffect(() => {
    const editor = editorRef.current;
    const preview = previewRef.current;

    if (!editor || !preview) return;

    const handleScroll = (source: HTMLTextAreaElement | HTMLDivElement, target: HTMLTextAreaElement | HTMLDivElement) => {
      if (isSyncingRef.current) return;

      isSyncingRef.current = true;
      
      // Calculate scroll percentage
      const sourceScrollHeight = source.scrollHeight - source.clientHeight;
      const percentage = sourceScrollHeight > 0 ? source.scrollTop / sourceScrollHeight : 0;
      
      // Apply percentage to target
      const targetScrollHeight = target.scrollHeight - target.clientHeight;
      target.scrollTop = percentage * targetScrollHeight;

      // Reset sync state on next animation frame to avoid loop
      requestAnimationFrame(() => {
        isSyncingRef.current = false;
      });
    };

    const handleEditorScroll = () => {
      if (activePaneRef.current === 'editor' && preview) {
        handleScroll(editor, preview);
      }
    };

    const handlePreviewScroll = () => {
      if (activePaneRef.current === 'preview' && editor) {
        handleScroll(preview, editor);
      }
    };

    const setEditorActive = () => { activePaneRef.current = 'editor'; };
    const setPreviewActive = () => { activePaneRef.current = 'preview'; };

    // Register event listeners
    editor.addEventListener('scroll', handleEditorScroll, { passive: true });
    preview.addEventListener('scroll', handlePreviewScroll, { passive: true });
    editor.addEventListener('mouseenter', setEditorActive, { passive: true });
    preview.addEventListener('mouseenter', setPreviewActive, { passive: true });
    editor.addEventListener('focus', setEditorActive, { passive: true });

    return () => {
      editor.removeEventListener('scroll', handleEditorScroll);
      preview.removeEventListener('scroll', handlePreviewScroll);
      editor.removeEventListener('mouseenter', setEditorActive);
      preview.removeEventListener('mouseenter', setPreviewActive);
      editor.removeEventListener('focus', setEditorActive);
    };
  }, [editorRef, previewRef]);
}
