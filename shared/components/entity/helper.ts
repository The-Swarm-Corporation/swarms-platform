export const stripMarkdown = (text: string) => {
  return text
    .replace(/[*_~`]/g, '')
    .replace(/(?:\r\n|\r|\n)/g, '\n')
    .replace(/^\d+\.\s+/gm, '')
    .replace(/^#+\s+/gm, '');
};

export const sanitizePrompt = (text: string) => {
  return text
    .replace(/^\s+/gm, '')
    .replace(/\r\n/g, '\n')
    .replace(/\\n/g, '\n')
    .replace(/\n\n/g, '\n');
};
