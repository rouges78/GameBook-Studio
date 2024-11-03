import React, { useMemo } from 'react';
import { ParagraphContentProps } from './types';
import { translations } from './translations';

const ParagraphContent: React.FC<ParagraphContentProps> = ({
  selectedParagraph,
  onUpdate,
  isDarkMode,
  language,
}) => {
  const t = translations[language];

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onUpdate({
      ...selectedParagraph,
      content: e.target.value
    });
  };

  const stats = useMemo(() => {
    const content = selectedParagraph.content;
    const words = content.trim() ? content.trim().split(/\s+/).length : 0;
    const characters = content.length;
    return { words, characters };
  }, [selectedParagraph.content]);

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-gray-700">
      <textarea
        value={selectedParagraph.content}
        onChange={handleContentChange}
        className="flex-1 w-full p-6 bg-gray-700 text-gray-100 border-0 resize-none font-mono text-base leading-relaxed focus:outline-none focus:ring-0"
        placeholder={t.enterContent}
        spellCheck={true}
        style={{ height: '100%' }}
      />
      <div className="flex justify-end px-6 py-2 text-sm text-gray-400 border-t border-gray-700">
        <span className="mr-4">{t.stats.words}: {stats.words}</span>
        <span>{t.stats.characters}: {stats.characters}</span>
      </div>
    </div>
  );
};

export default ParagraphContent;
