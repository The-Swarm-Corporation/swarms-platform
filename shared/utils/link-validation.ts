export interface LinkItem {
  name: string;
  url: string;
}

export interface LinkValidationResult {
  isValid: boolean;
  error?: string;
}

const LINK_PATTERNS: Record<string, RegExp[]> = {
  github: [
    /^https?:\/\/(www\.)?github\.com$/i,
    /^https?:\/\/(www\.)?github\.com\/.*/i,
    /^https?:\/\/github\.com$/i,
    /^https?:\/\/github\.com\/.*/i,
  ],
  twitter: [
    /^https?:\/\/(www\.)?twitter\.com$/i,
    /^https?:\/\/(www\.)?twitter\.com\/.*/i,
    /^https?:\/\/twitter\.com$/i,
    /^https?:\/\/twitter\.com\/.*/i,
    /^https?:\/\/(www\.)?x\.com$/i,
    /^https?:\/\/(www\.)?x\.com\/.*/i,
    /^https?:\/\/x\.com$/i,
    /^https?:\/\/x\.com\/.*/i,
  ],
  x: [
    /^https?:\/\/(www\.)?twitter\.com$/i,
    /^https?:\/\/(www\.)?twitter\.com\/.*/i,
    /^https?:\/\/twitter\.com$/i,
    /^https?:\/\/twitter\.com\/.*/i,
    /^https?:\/\/(www\.)?x\.com$/i,
    /^https?:\/\/(www\.)?x\.com\/.*/i,
    /^https?:\/\/x\.com$/i,
    /^https?:\/\/x\.com\/.*/i,
  ],
  linkedin: [
    /^https?:\/\/(www\.)?linkedin\.com$/i,
    /^https?:\/\/(www\.)?linkedin\.com\/.*/i,
    /^https?:\/\/linkedin\.com$/i,
    /^https?:\/\/linkedin\.com\/.*/i,
  ],
  youtube: [
    /^https?:\/\/(www\.)?youtube\.com$/i,
    /^https?:\/\/(www\.)?youtube\.com\/.*/i,
    /^https?:\/\/youtube\.com$/i,
    /^https?:\/\/youtube\.com\/.*/i,
    /^https?:\/\/youtu\.be\/.+/i,
  ],
  discord: [
    /^https?:\/\/(www\.)?discord\.gg\/.+/i,
    /^https?:\/\/(www\.)?discord\.com\/invite\/.+/i,
    /^https?:\/\/(www\.)?discord\.com$/i,
    /^https?:\/\/(www\.)?discord\.com\/.*/i,
    /^https?:\/\/discord\.gg\/.+/i,
    /^https?:\/\/discord\.com\/invite\/.+/i,
    /^https?:\/\/discord\.com$/i,
    /^https?:\/\/discord\.com\/.*/i,
  ],
  telegram: [
    /^https?:\/\/(www\.)?t\.me$/i,
    /^https?:\/\/(www\.)?t\.me\/.*/i,
    /^https?:\/\/t\.me$/i,
    /^https?:\/\/t\.me\/.*/i,
    /^https?:\/\/(www\.)?telegram\.me$/i,
    /^https?:\/\/(www\.)?telegram\.me\/.*/i,
    /^https?:\/\/telegram\.me$/i,
    /^https?:\/\/telegram\.me\/.*/i,
  ],
  website: [/^https?:\/\/.+/i],
  documentation: [/^https?:\/\/.+/i],
  docs: [/^https?:\/\/.+/i],
  blog: [/^https?:\/\/.+/i],
};

export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return /^https?:\/\/.+/i.test(url);
  } catch {
    return false;
  }
}

export function validateNameUrlMatch(
  name: string,
  url: string,
): LinkValidationResult {
  const normalizedName = name.toLowerCase().trim();

  const patterns = LINK_PATTERNS[normalizedName];

  if (patterns) {
    const matches = patterns.some((pattern) => pattern.test(url));
    if (!matches) {
      return {
        isValid: false,
        error: `URL doesn't match expected pattern for ${name}. Expected a ${name} URL.`,
      };
    }
  }

  return { isValid: true };
}

export function validateLinkItem(link: LinkItem): LinkValidationResult {
  if (!link.name || link.name.trim().length === 0) {
    return {
      isValid: false,
      error: 'Link name is required',
    };
  }

  if (!link.url || link.url.trim().length === 0) {
    return {
      isValid: false,
      error: 'Link URL is required',
    };
  }

  if (!isValidUrl(link.url)) {
    return {
      isValid: false,
      error: 'Please enter a valid URL (must start with http:// or https://)',
    };
  }

  const nameUrlValidation = validateNameUrlMatch(link.name, link.url);
  if (!nameUrlValidation.isValid) {
    return nameUrlValidation;
  }

  return { isValid: true };
}

export function validateLinksArray(links: LinkItem[]): LinkValidationResult {
  if (!Array.isArray(links)) {
    return {
      isValid: false,
      error: 'Links must be an array',
    };
  }

  if (links.length === 0) {
    return { isValid: true };
  }

  for (let i = 0; i < links.length; i++) {
    const linkValidation = validateLinkItem(links[i]);
    if (!linkValidation.isValid) {
      return {
        isValid: false,
        error: `Link ${i + 1}: ${linkValidation.error}`,
      };
    }
  }

  const urls = links.map((link) => link.url.toLowerCase().trim());
  const uniqueUrls = new Set(urls);
  if (urls.length !== uniqueUrls.size) {
    return {
      isValid: false,
      error: 'Duplicate URLs are not allowed',
    };
  }

  const names = links.map((link) => link.name.toLowerCase().trim());
  const uniqueNames = new Set(names);
  if (names.length !== uniqueNames.size) {
    return {
      isValid: false,
      error: 'Duplicate link names are not allowed',
    };
  }

  return { isValid: true };
}

export function sanitizeLinks(links: LinkItem[]): LinkItem[] {
  if (!Array.isArray(links)) return [];

  return links
    .filter((link) => link && typeof link === 'object')
    .map((link) => ({
      name: (link.name || '').trim(),
      url: (link.url || '').trim(),
    }))
    .filter((link) => link.name.length > 0 && link.url.length > 0);
}

export function getSuggestedUrlPattern(name: string): string {
  const normalizedName = name.toLowerCase().trim();

  const suggestions: Record<string, string> = {
    github: 'https://github.com/username/repository',
    twitter: 'https://twitter.com/username',
    x: 'https://x.com/username',
    linkedin: 'https://linkedin.com/in/username',
    youtube: 'https://youtube.com/channel/channelid',
    discord: 'https://discord.com/channels/serverid/channelid',
    telegram: 'https://t.me/username',
    website: 'https://yourwebsite.com',
    documentation: 'https://docs.yourproject.com',
    docs: 'https://docs.yourproject.com',
    blog: 'https://yourblog.com',
  };

  return suggestions[normalizedName] || 'https://example.com';
}
