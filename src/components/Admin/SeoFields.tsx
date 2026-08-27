'use client';

interface SeoFieldsProps {
  metaTitle: string;
  metaDescription: string;
  defaultTitle: string;
  defaultDescription: string;
  onMetaTitleChange: (value: string) => void;
  onMetaDescriptionChange: (value: string) => void;
}

/** Bloc SEO admin : meta title + description (Google) avec aperçu et fallbacks. */
export default function SeoFields({
  metaTitle,
  metaDescription,
  defaultTitle,
  defaultDescription,
  onMetaTitleChange,
  onMetaDescriptionChange,
}: SeoFieldsProps) {
  const previewTitle = (metaTitle.trim() || defaultTitle || 'Page title').slice(0, 60);
  const previewDescription = (
    metaDescription.trim() ||
    defaultDescription ||
    'Add a short description for Google search results.'
  ).slice(0, 160);

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">SEO</h2>
        <p className="text-sm text-gray-500">
          Title and description shown in Google. Leave empty to keep current page values.
        </p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 space-y-1">
        <p className="text-xs text-gray-500 mb-2">Google preview</p>
        <p className="text-xl text-[#1a0dab] leading-snug truncate">{previewTitle}</p>
        <p className="text-sm text-emerald-700 truncate">
          theschoolofmathematics.com › …
        </p>
        <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">
          {previewDescription}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            SEO title (meta title)
          </label>
          <input
            type="text"
            value={metaTitle}
            onChange={(e) => onMetaTitleChange(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder={defaultTitle || 'Defaults to page title if empty (~60 chars)'}
            maxLength={120}
          />
          <p className="mt-1 text-xs text-gray-500">
            {(metaTitle || defaultTitle).length}/60 recommended
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            SEO description (meta description)
          </label>
          <textarea
            rows={3}
            value={metaDescription}
            onChange={(e) => onMetaDescriptionChange(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder={
              defaultDescription
                ? `Current default: ${defaultDescription.slice(0, 100)}${defaultDescription.length > 100 ? '…' : ''}`
                : 'Short summary for Google (~155–160 chars)'
            }
            maxLength={320}
          />
          <p className="mt-1 text-xs text-gray-500">
            {(metaDescription || defaultDescription).length}/160 recommended
          </p>
        </div>
      </div>
    </div>
  );
}
