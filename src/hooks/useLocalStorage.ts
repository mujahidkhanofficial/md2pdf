import { useState, useEffect } from 'react';
import { defaultTemplates } from '../templates/defaultTemplates';
import type { DocumentTemplate } from '../templates/defaultTemplates';

export interface SavedDocument {
  id: string;
  title: string;
  markdown: string;
  cssPreset: 'corporate' | 'tech' | 'resume' | 'academic' | 'default';
  pageSize: 'a4' | 'letter' | 'legal';
  orientation: 'portrait' | 'landscape';
  margin: 'none' | 'compact' | 'normal';
  showHeader: boolean;
  showFooter: boolean;
  headerTitle: string;
  footerText: string;
  customCss: string;
  hrStyle?: 'solid' | 'dashed' | 'dotted' | 'double' | 'gradient' | 'hidden';
  lastModified: number;
}

const STORAGE_KEY = 'md2pdf_documents_v1';

export function useLocalStorage() {
  const [documents, setDocuments] = useState<SavedDocument[]>([]);
  const [activeId, setActiveId] = useState<string>('');

  // Initial load
  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as SavedDocument[];
        if (parsed.length > 0) {
          setDocuments(parsed);
          setActiveId(parsed[0].id);
          return;
        }
      } catch (e) {
        console.error('Failed to parse documents from localStorage', e);
      }
    }

    // Populate with defaults if empty
    const initialDocs: SavedDocument[] = defaultTemplates.map((tpl) => ({
      id: tpl.id,
      title: tpl.title,
      markdown: tpl.markdown,
      cssPreset: tpl.cssPreset,
      pageSize: tpl.pageSize,
      orientation: tpl.orientation,
      margin: tpl.margin,
      showHeader: tpl.showHeader,
      showFooter: tpl.showFooter,
      headerTitle: tpl.title,
      footerText: 'Confidential',
      customCss: '',
      hrStyle: 'solid',
      lastModified: Date.now(),
    }));

    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialDocs));
    setDocuments(initialDocs);
    if (initialDocs.length > 0) {
      setActiveId(initialDocs[0].id);
    }
  }, []);

  // Save documents list helper
  const saveDocumentsList = (newDocs: SavedDocument[]) => {
    setDocuments(newDocs);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newDocs));
  };

  // Create a new document
  const createDocument = (title = 'Untitled Document', fromTemplate?: DocumentTemplate) => {
    const newDoc: SavedDocument = {
      id: `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title,
      markdown: fromTemplate ? fromTemplate.markdown : '# New Document\n\nWrite something...',
      cssPreset: fromTemplate ? fromTemplate.cssPreset : 'default',
      pageSize: fromTemplate ? fromTemplate.pageSize : 'a4',
      orientation: fromTemplate ? fromTemplate.orientation : 'portrait',
      margin: fromTemplate ? fromTemplate.margin : 'normal',
      showHeader: fromTemplate ? fromTemplate.showHeader : true,
      showFooter: fromTemplate ? fromTemplate.showFooter : true,
      headerTitle: title,
      footerText: 'Confidential',
      customCss: '',
      hrStyle: 'solid',
      lastModified: Date.now(),
    };

    const updated = [newDoc, ...documents];
    saveDocumentsList(updated);
    setActiveId(newDoc.id);
    return newDoc;
  };

  // Update document parameters or content
  const updateDocument = (id: string, updates: Partial<Omit<SavedDocument, 'id'>>) => {
    const updated = documents.map((doc) => {
      if (doc.id === id) {
        return {
          ...doc,
          ...updates,
          lastModified: Date.now(),
        };
      }
      return doc;
    });
    saveDocumentsList(updated);
  };

  // Delete a document
  const deleteDocument = (id: string) => {
    const remaining = documents.filter((doc) => doc.id !== id);
    saveDocumentsList(remaining);
    
    // Adjust active ID if deleted the active one
    if (activeId === id && remaining.length > 0) {
      setActiveId(remaining[0].id);
    } else if (remaining.length === 0) {
      // Re-create a blank doc if none left
      const defaultDoc = createDocument('My First Document');
      setActiveId(defaultDoc.id);
    }
  };

  const activeDocument = documents.find((doc) => doc.id === activeId) || null;

  return {
    documents,
    activeId,
    setActiveId,
    activeDocument,
    createDocument,
    updateDocument,
    deleteDocument,
  };
}
