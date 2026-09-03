'use client';

import { useEffect, useState, useRef } from 'react';
import MathRenderer from '@/components/Quiz/MathRenderer';
import { latexInDoubleDollarsShouldUseBlockDisplay } from '@/lib/utils';
import { sanitizeHtml } from '@/lib/sanitize-html';

interface HtmlWithMathRendererProps {
  html: string;
  className?: string;
}

/**
 * Composant pour rendre du HTML avec des images ET des formules LaTeX
 * Divise le contenu en parties HTML et parties mathématiques pour un rendu correct
 */
export default function HtmlWithMathRenderer({ html, className = '' }: HtmlWithMathRendererProps) {
  const [parts, setParts] = useState<Array<{ type: 'html' | 'math'; content: string; isBlock?: boolean }>>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!html) {
      setParts([]);
      return;
    }

    const newParts: Array<{ type: 'html' | 'math'; content: string; isBlock?: boolean }> = [];
    let remainingHtml = sanitizeHtml(html);

    // PROTÉGER les images base64 avant de traiter les formules
    const imagePlaceholders: string[] = [];
    let imageIndex = 0;

    const base64ImageRegex = /<img([^>]+)src=["'](data:image\/[^"']+)["']([^>]*)>/gi;
    remainingHtml = remainingHtml.replace(base64ImageRegex, (match) => {
      const placeholder = `__IMAGE_${imageIndex}__`;
      imagePlaceholders[imageIndex] = match;
      imageIndex++;
      return placeholder;
    });

    // Décoder les entités HTML pour les dollars avant de chercher les formules
    remainingHtml = remainingHtml.replace(/&#36;/g, '$').replace(/&dollar;/g, '$');

    // Déséchapper les backslashes échappés
    remainingHtml = remainingHtml.replace(/\\\\/g, '\\');

    // Quill met chaque paragraphe dans <p>. Le découpage LaTeX produit alors des
    // morceaux qui se terminent par un <p> implicite/refermé par le navigateur →
    // saut de ligne avant/après la formule alors que l'éditeur est une seule ligne.
    remainingHtml = remainingHtml
      .replace(/<\/p>\s*<p[^>]*>/gi, '<br class="quiz-para-gap" />')
      .replace(/<p[^>]*>/gi, '')
      .replace(/<\/p>/gi, '');

    const blockMathRegex = /\$\$([\s\S]*?)\$\$/g;
    const inlineMathRegex = /(?<!\$)\$(?!\$)([^$]+?)\$(?!\$)/g;

    const mathMatches: Array<{ start: number; end: number; formula: string; isBlock: boolean }> = [];
    let match;

    blockMathRegex.lastIndex = 0;
    while ((match = blockMathRegex.exec(remainingHtml)) !== null) {
      mathMatches.push({
        start: match.index,
        end: match.index + match[0].length,
        formula: match[1]
          .replace(/<br\s*\/?>/gi, ' ')
          .replace(/<\/?p[^>]*>/gi, ' ')
          .replace(/<[^>]+>/g, '')
          .replace(/\s*\n\s*/g, ' ')
          .trim(),
        isBlock: true,
      });
    }

    inlineMathRegex.lastIndex = 0;
    while ((match = inlineMathRegex.exec(remainingHtml)) !== null) {
      const isInBlock = mathMatches.some((m) => match!.index >= m.start && match!.index < m.end);
      if (!isInBlock) {
        const beforeMatch = remainingHtml.substring(0, match.index);
        const lastOpenTag = beforeMatch.lastIndexOf('<');
        const lastCloseTag = beforeMatch.lastIndexOf('>');
        const isInTag = lastOpenTag > lastCloseTag;

        if (!isInTag) {
          mathMatches.push({
            start: match.index,
            end: match.index + match[0].length,
            formula: match[1]
              .replace(/<br\s*\/?>/gi, ' ')
              .replace(/<\/?p[^>]*>/gi, ' ')
              .replace(/<[^>]+>/g, '')
              .replace(/\s*\n\s*/g, ' ')
              .trim(),
            isBlock: false,
          });
        }
      }
    }

    mathMatches.sort((a, b) => a.start - b.start);

    let processedIndex = 0;
    mathMatches.forEach((mathMatch) => {
      if (mathMatch.start > processedIndex) {
        const htmlPart = remainingHtml.substring(processedIndex, mathMatch.start);
        if (htmlPart.trim()) {
          let restoredHtml = htmlPart;
          imagePlaceholders.forEach((img, idx) => {
            restoredHtml = restoredHtml.replace(`__IMAGE_${idx}__`, img);
          });
          newParts.push({ type: 'html', content: restoredHtml });
        }
      }

      newParts.push({
        type: 'math',
        content: mathMatch.formula,
        isBlock:
          mathMatch.isBlock && latexInDoubleDollarsShouldUseBlockDisplay(mathMatch.formula),
      });

      processedIndex = mathMatch.end;
    });

    if (processedIndex < remainingHtml.length) {
      const htmlPart = remainingHtml.substring(processedIndex);
      if (htmlPart.trim()) {
        let restoredHtml = htmlPart;
        imagePlaceholders.forEach((img, idx) => {
          restoredHtml = restoredHtml.replace(`__IMAGE_${idx}__`, img);
        });
        newParts.push({ type: 'html', content: restoredHtml });
      }
    }

    if (newParts.length === 0 && html.trim()) {
      let restoredHtml = remainingHtml;
      imagePlaceholders.forEach((img, idx) => {
        restoredHtml = restoredHtml.replace(`__IMAGE_${idx}__`, img);
      });
      newParts.push({ type: 'html', content: restoredHtml });
    }

    setParts(newParts);
  }, [html]);

  useEffect(() => {
    if (!containerRef.current) return;

    const images = containerRef.current.querySelectorAll('img');

    const handleImageError = (img: HTMLImageElement) => {
      const src = img.src;

      if (src.startsWith('data:image/')) {
        console.warn('Erreur de chargement d\'image base64:', src.substring(0, 100));

        const placeholder = document.createElement('div');
        placeholder.className = 'image-error-placeholder';
        placeholder.textContent = '⚠️ Image non disponible';
        placeholder.style.cssText = 'padding: 20px; background: #fef3c7; border: 1px dashed #f59e0b; text-align: center; color: #92400e; border-radius: 8px; margin: 10px 0;';

        img.style.display = 'none';
        img.parentNode?.insertBefore(placeholder, img.nextSibling);
      }
    };

    images.forEach((img) => {
      if (img.complete && img.naturalHeight === 0) {
        handleImageError(img);
      } else {
        img.addEventListener('error', () => handleImageError(img), { once: true });
      }
    });

    return () => {
      images.forEach((img) => {
        img.removeEventListener('error', () => handleImageError(img));
      });
    };
  }, [parts]);

  if (!html) return null;

  return (
    <div
      ref={containerRef}
      className={`html-with-math-renderer quiz-rich-html ${className}`.trim()}
    >
      {parts.map((part, index) => {
        if (part.type === 'math') {
          const formulaText = part.isBlock ? `$$${part.content}$$` : `$${part.content}$`;
          return (
            <MathRenderer
              key={`math-${index}`}
              text={formulaText}
              className=""
            />
          );
        }
        return (
          <span
            key={`html-${index}`}
            dangerouslySetInnerHTML={{ __html: part.content }}
          />
        );
      })}
    </div>
  );
}
