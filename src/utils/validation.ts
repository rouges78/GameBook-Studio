// Validazione contenuti paragrafi
import { Paragraph } from '../components/ParagraphEditor/types';

const MIN_PARAGRAPH_LENGTH = 300;
const MAX_TAGS = 5;

export const validateParagraphContent = (paragraph: Paragraph): string[] => {
  const errors: string[] = [];
  
  // Validazione lunghezza contenuto
  if ((paragraph.content?.trim().length || 0) < MIN_PARAGRAPH_LENGTH) {
    errors.push(`Il contenuto deve avere almeno ${MIN_PARAGRAPH_LENGTH} caratteri`);
  }

  // Validazione tag
  if (paragraph.tags && paragraph.tags.length > MAX_TAGS) {
    errors.push(`Massimo ${MAX_TAGS} tag permessi`);
  }

  // Validazione connessioni cicliche
  if (paragraph.outgoingConnections?.includes(paragraph.id.toString())) {
    errors.push('Connessione ciclica non permessa');
  }

  // Validazione formattazione Markdown
  const markdownRegex = /^(#+\s|!?\[.*?\]\(.*?\)|\*|- |\d+\. |`{3}|&[a-z]+;|<[^>]+>)/;
  if (!markdownRegex.test(paragraph.content)) {
    errors.push('Utilizza la formattazione Markdown corretta');
  }

  return errors;
};

// Sanitizzazione input HTML
export const sanitizeHTML = (content: string): string => {
  const allowedTags = ['b','i','u','em','strong','a','code','pre','blockquote'];
  return content.replace(/<([^>]+)>/gi, (match, tag) => {
    const tagName = tag.split(' ')[0].toLowerCase();
    return allowedTags.includes(tagName) ? match : '';
  });
};