'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import EditorErrorBoundary from './EditorErrorBoundary';
import HtmlWithMathRenderer from '@/components/Common/HtmlWithMathRenderer';
import { restoreQuestionMarkup } from '@/lib/utils';

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
  /** Affiche un aperçu KaTeX sous l'éditeur quand le texte contient du LaTeX */
  showMathPreview?: boolean;
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
      className="w-full rounded-lg border border-gray-300 px-3 py-2 font-mono text-sm focus:border-transparent focus:ring-2 focus:ring-indigo-500"
    />
  );
}

function QuillEditorInner({
  value,
  onChange,
  placeholder = 'Enter text...',
  className = '',
  compact = false,
  showMathPreview = false,
}: RichTextEditorProps) {
  const safeValue = typeof value === 'string' ? value : value == null ? '' : String(value);
  const [localValue, setLocalValue] = useState(safeValue);
  const [usePlain, setUsePlain] = useState(false);
  const [mode, setMode] = useState<'visual' | 'source'>(() =>
    safeValue.includes('$') ? 'source' : 'visual'
  );
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const quillRef = useRef<any>(null);
  const hasMath = /\$|\\begin\{|\\frac|\\text\{/.test(localValue || '');

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

  const minHeight = compact ? 100 : 200;
  const showSource = usePlain || mode === 'source';

  return (
    <div className={`rich-text-editor ${compact ? 'rich-text-editor-compact' : ''} ${className}`}>
      <div className="mb-1 flex items-center justify-end gap-1">
        <button
          type="button"
          onClick={() => setMode('visual')}
          className={`rounded-md px-2 py-1 text-xs font-medium ${
            !showSource
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Visuel
        </button>
        <button
          type="button"
          onClick={() => setMode('source')}
          className={`rounded-md px-2 py-1 text-xs font-medium ${
            showSource
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Source / LaTeX
        </button>
      </div>
      {showSource ? (
        <PlainTextFallback
          value={localValue}
          onChange={handleChange}
          placeholder={placeholder}
          compact={compact}
        />
      ) : (
        <>
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
        </>
      )}
      {showMathPreview && hasMath ? (
        <div className="mt-2 rounded-lg border border-indigo-100 bg-indigo-50/50 p-3">
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-indigo-600">
            Aperçu maths
          </p>
          <HtmlWithMathRenderer
            html={restoreQuestionMarkup(localValue)}
            className="text-sm text-gray-800 [&_.katex-display]:my-1"
          />
        </div>
      ) : null}
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
