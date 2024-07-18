export const stripMarkdown = (text: string) => {
  return text
    .replace(/[*_~`]/g, '')
    .replace(/(?:\r\n|\r|\n)/g, '\n')
    .replace(/^\d+\.\s+/gm, '')
    .replace(/^#+\s+/gm, '');
};
