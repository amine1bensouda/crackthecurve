'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import EditorErrorBoundary from './EditorErrorBoundary';

const ReactQuill = dynamic(
  async () => {
    const { default: RQ } = await import('react-quill');
    // eslint-disable-next-line react/display-name
    return ({ forwardedRef, ...props }: any) => <RQ ref={forwardedRef} {...props} />;
  },
  {
    ssr: false,
    loading: () => (
      <div className="min-h-[100px] rounded-lg border border-gray-300 bg-gray-50 p-3 text-sm text-gray-400">
        Loading editor…
      </div>
    ),
  }
);

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  compact?: boolean;
}

function PlainTextFallback({
  value,
  onChange,
  placeholder,
  compact,
}: RichTextEditorProps) {
  return (
    <textarea
      value={typeof value === 'string' ? value : ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={compact ? 3 : 6}
      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-indigo-500"
    />
  );
}

function QuillEditorInner({
  value,
  onChange,
  placeholder = 'Enter text...',
  className = '',
  compact = false,
}: RichTextEditorProps) {
  const safeValue = typeof value === 'string' ? value : value == null ? '' : String(value);
  const [localValue, setLocalValue] = useState(safeValue);
  const [usePlain, setUsePlain] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const quillRef = useRef<any>(null);

  useEffect(() => {
    setLocalValue(typeof value === 'string' ? value : value == null ? '' : String(value));
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

  const imageHandler = useCallback(() => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/jpeg,image/png,image/gif,image/webp');
    input.click();

    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;

      try {
        const formData = new FormData();
        formData.append('image', file);
        const res = await fetch('/api/admin/upload/image', {
          method: 'POST',
          body: formData,
          credentials: 'include',
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !(data as { url?: string }).url) {
          alert((data as { error?: string }).error || 'Image upload failed');
          return;
        }
        const url = (data as { url: string }).url;

        const editor = quillRef.current?.getEditor?.() || quillRef.current?.editor || null;
        if (editor) {
          const range = editor.getSelection(true);
          const index = range?.index ?? editor.getLength();
          editor.insertEmbed(index, 'image', url);
          editor.setSelection(index + 1);
          const html = editor.root?.innerHTML;
          if (typeof html === 'string') {
            setLocalValue(html);
            onChange(html);
          }
        } else {
          const next = `${localValue || ''}<p><img src="${url}" alt="" /></p>`;
          setLocalValue(next);
          onChange(next);
        }
      } catch (error) {
        console.error('Image upload error:', error);
        alert('Image upload failed');
      }
    };
  }, [localValue, onChange]);

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

  const formats = useMemo(
    () => [
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
    ],
    []
  );

  if (usePlain) {
    return (
      <PlainTextFallback
        value={localValue}
        onChange={handleChange}
        placeholder={placeholder}
        compact={compact}
      />
    );
  }

  const minHeight = compact ? 100 : 200;

  return (
    <div className={`rich-text-editor ${compact ? 'rich-text-editor-compact' : ''} ${className}`}>
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .rich-text-editor .ql-container { min-height: ${minHeight}px; font-size: 14px; }
        .rich-text-editor .ql-editor { min-height: ${minHeight}px; }
        .rich-text-editor-compact .ql-container,
        .rich-text-editor-compact .ql-editor { min-height: 100px; }
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
      `,
        }}
      />
      <EditorErrorBoundary
        onError={() => setUsePlain(true)}
        fallback={
          <PlainTextFallback
            value={localValue}
            onChange={handleChange}
            placeholder={placeholder}
            compact={compact}
          />
        }
      >
        <ReactQuill
          forwardedRef={quillRef}
          theme="snow"
          value={localValue}
          onChange={handleChange}
          modules={modules}
          formats={formats}
          placeholder={placeholder}
        />
      </EditorErrorBoundary>
    </div>
  );
}

export default function RichTextEditor(props: RichTextEditorProps) {
  return (
    <EditorErrorBoundary
      fallback={
        <PlainTextFallback
          value={typeof props.value === 'string' ? props.value : ''}
          onChange={props.onChange}
          placeholder={props.placeholder}
          compact={props.compact}
        />
      }
    >
      <QuillEditorInner {...props} />
    </EditorErrorBoundary>
  );
}
