export interface LinkItem {
  name: string;
  url: string;
}

export interface SwarmsCloudPromptsWithLinks {
  links: LinkItem[] | null;
}

export interface SwarmsCloudAgentsWithLinks {
  links: LinkItem[] | null;
}

export interface SwarmsCloudToolsWithLinks {
  links: LinkItem[] | null;
}

export const validateLinkItem = (link: any): link is LinkItem => {
  return (
    typeof link === 'object' &&
    link !== null &&
    typeof link.name === 'string' &&
    typeof link.url === 'string' &&
    link.name.length > 0 &&
    link.url.length > 0
  );
};

export const validateLinksArray = (links: any): links is LinkItem[] => {
  return Array.isArray(links) && links.every(validateLinkItem);
};

export const sanitizeLinks = (links: any[]): LinkItem[] => {
  if (!Array.isArray(links)) return [];

  return links
    .filter(validateLinkItem)
    .map((link) => ({
      name: link.name.trim(),
      url: link.url.trim(),
    }))
    .filter((link) => link.name.length > 0 && link.url.length > 0);
};
