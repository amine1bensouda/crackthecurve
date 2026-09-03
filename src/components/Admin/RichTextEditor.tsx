'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';

const ReactQuill = dynamic(
  async () => {
    const { default: RQ } = await import('react-quill');
    // eslint-disable-next-line react/display-name
    return ({ forwardedRef, ...props }: any) => <RQ ref={forwardedRef} {...props} />;
  },
  { ssr: false }
);

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  /** Hauteur réduite pour réponses / explications */
  compact?: boolean;
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = 'Enter text...',
  className = '',
  compact = false,
}: RichTextEditorProps) {
  const [localValue, setLocalValue] = useState(value);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const quillRef = useRef<any>(null);
  const uploadingRef = useRef(false);

  useEffect(() => {
    // Ne pas écraser le contenu pendant un upload / édition locale récente
    if (uploadingRef.current) return;
    setLocalValue(value);
  }, [value]);

  const handleChange = useCallback(
    (newValue: string) => {
      setLocalValue(newValue);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => onChange(newValue), 300);
    },
    [onChange]
  );

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const getEditor = useCallback(() => {
    const rq = quillRef.current;
    if (!rq) return null;
    if (typeof rq.getEditor === 'function') return rq.getEditor();
    if (rq.editor) return rq.editor;
    return null;
  }, []);

  const imageHandler = useCallback(() => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/jpeg,image/png,image/gif,image/webp');
    input.click();

    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;

      const editor = getEditor();
      const range = editor?.getSelection?.(true);
      const index = range?.index ?? editor?.getLength?.() ?? 0;
      const previewUrl = URL.createObjectURL(file);

      uploadingRef.current = true;

      try {
        // Afficher tout de suite un aperçu (évite l'icône cassée pendant l'upload)
        if (editor) {
          editor.insertEmbed(index, 'image', previewUrl);
          editor.setSelection(index + 1);
        }

        const formData = new FormData();
        formData.append('image', file);
        const res = await fetch('/api/admin/upload/image', {
          method: 'POST',
          body: formData,
          credentials: 'include',
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.url) {
          // Retirer l'aperçu en cas d'échec
          if (editor?.root) {
            const broken = editor.root.querySelectorAll(`img[src="${previewUrl}"]`);
            broken.forEach((img: Element) => img.remove());
            handleChange(editor.root.innerHTML);
          }
          alert(data.error || 'Image upload failed');
          return;
        }

        if (editor?.root) {
          const imgs = editor.root.querySelectorAll(`img[src="${previewUrl}"]`);
          imgs.forEach((img: Element) => {
            (img as HTMLImageElement).src = data.url;
          });
          const html = editor.root.innerHTML;
          setLocalValue(html);
          onChange(html);
        } else {
          // Fallback si le ref Quill n'est pas prêt
          const imgTag = `<p><img src="${data.url}" alt="" /></p>`;
          const next = `${localValue || ''}${imgTag}`;
          setLocalValue(next);
          onChange(next);
        }
      } catch (error) {
        console.error('Image upload error:', error);
        if (editor?.root) {
          const broken = editor.root.querySelectorAll(`img[src="${previewUrl}"]`);
          broken.forEach((img: Element) => img.remove());
          handleChange(editor.root.innerHTML);
        }
        alert('Image upload failed');
      } finally {
        URL.revokeObjectURL(previewUrl);
        uploadingRef.current = false;
      }
    };
  }, [getEditor, handleChange, localValue, onChange]);

  // Attacher le handler image après le montage (plus fiable que modules.handlers seul)
  useEffect(() => {
    const timer = window.setTimeout(() => {
      const editor = getEditor();
      if (!editor) return;
      const toolbar = editor.getModule?.('toolbar');
      if (toolbar?.addHandler) {
        toolbar.addHandler('image', imageHandler);
      }
    }, 100);
    return () => window.clearTimeout(timer);
  }, [getEditor, imageHandler, compact]);

  const modules = useMemo(
    () => ({
      toolbar: {
        container: [
          [{ header: [1, 2, 3, 4, 5, 6, false] }],
          [{ font: [] }],
          [{ size: [] }],
          ['bold', 'italic', 'underline', 'strike', 'blockquote'],
          [{ list: 'ordered' }, { list: 'bullet' }, { indent: '-1' }, { indent: '+1' }],
          [{ color: [] }, { background: [] }],
          [{ align: [] }],
          ['link', 'image', 'video'],
          ['clean'],
        ],
        handlers: {
          image: imageHandler,
        },
      },
      clipboard: {
        matchVisual: false,
      },
    }),
    [imageHandler]
  );

  const formats = [
    'header',
    'font',
    'size',
    'bold',
    'italic',
    'underline',
    'strike',
    'blockquote',
    'list',
    'bullet',
    'indent',
    'color',
    'background',
    'align',
    'link',
    'image',
    'video',
  ];

  const minHeight = compact ? 100 : 200;
  return (
    <div className={`rich-text-editor ${compact ? 'rich-text-editor-compact' : ''} ${className}`}>
      <style jsx global>{`
        .rich-text-editor .ql-container {
          min-height: ${minHeight}px;
          font-size: 14px;
        }
        .rich-text-editor .ql-editor {
          min-height: ${minHeight}px;
        }
        .rich-text-editor-compact .ql-container,
        .rich-text-editor-compact .ql-editor {
          min-height: 100px;
        }
        .rich-text-editor .ql-toolbar {
          border-top: 1px solid #d1d5db;
          border-left: 1px solid #d1d5db;
          border-right: 1px solid #d1d5db;
          border-radius: 8px 8px 0 0;
          background-color: #f9fafb;
        }
        .rich-text-editor .ql-container {
          border-bottom: 1px solid #d1d5db;
          border-left: 1px solid #d1d5db;
          border-right: 1px solid #d1d5db;
          border-radius: 0 0 8px 8px;
        }
        .rich-text-editor .ql-editor.ql-blank::before {
          color: #9ca3af;
          font-style: normal;
        }
        .rich-text-editor .ql-editor img {
          max-width: 100%;
          height: auto;
          display: inline-block;
        }
      `}</style>
      <ReactQuill
        forwardedRef={quillRef}
        theme="snow"
        value={localValue}
        onChange={handleChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
      />
    </div>
  );
}
