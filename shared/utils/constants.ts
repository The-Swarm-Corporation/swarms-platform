import { OptionRoles } from '@/modules/platform/settings/organization/types';

export enum THEMES {
  LIGHT = 'light',
  DARK = 'dark',
  SYSTEM = 'system',
}

export const themes: THEMES[] = [THEMES.LIGHT, THEMES.DARK];

export const SINGLE = 'single';

export const MAX_FILE_SIZE = 10 * 1024 * 1024;

export const themeOptions = [
  { label: 'Single theme', value: SINGLE },
  { label: 'Sync with your system', value: THEMES.SYSTEM },
] as const;

export const StrokeColor = {
  DARK: '#00000068',
  LIGHT: '#ffffff',
};

export const ROLES: OptionRoles[] = [
  { label: 'List Team roles', value: 'Team roles' },
  { label: 'Owner', value: 'owner' },
  { label: 'Manager', value: 'manager' },
  { label: 'Reader', value: 'reader' },
];

export const ORG_MEMBER_INVITE_TIMEOUT = 60 * 60 * 12; // 12 hour
const currentDate = new Date();
const currentMonth = new Date(
  currentDate.getFullYear(),
  currentDate.getMonth(),
  1,
  1,
);

export { currentDate, currentMonth };
export const explorerOptions = [
  { label: 'All', value: 'all' },
  { label: 'Agents', value: 'agents' },
  { label: 'Prompts', value: 'prompts' },
  { label: 'Tools', value: 'tools' },
];

export const explorerCategories = [
  { label: 'All', value: 'all' },
  { label: 'Healthcare', value: 'healthcare' },
  { label: 'Education', value: 'education' },
  { label: 'Finance', value: 'finance' },
  { label: 'Research', value: 'research' },
  { label: 'Public Safety', value: 'public-safety' },
  { label: 'Marketing', value: 'marketing' },
  { label: 'Sales', value: 'sales' },
  { label: 'Customer Support', value: 'customer-support' },
  { label: 'Other', value: 'other' },
];

export const defaultOptions = ['agents', 'prompts', 'tools'];

export const languageOptions = [
  'python',
  'javascript',
  'go',
  'rust',
  'java',
  'c++',
  'c#',
  'c',
  'php',
  'sql',
  'swift',
  'ruby',
  'shell',
  'typescript',
];

export const PLATFORM = {
  DASHBOARD: '/platform/dashboard',
  API_KEYS: '/platform/api-keys',
  DRAG_N_DROP: '/platform/dragndrop',
  USAGE: '/platform/usage',
  ACCOUNT: '/platform/account',
  ACCOUNT_PROFILE: '/platform/account/profile',
  ACCOUNT_BILLING: '/platform/account/billing',
  SPREADSHEET: '/platform/spreadsheet',
  EXPLORER: '/',
  SETTINGS: '/platform/account',
  ORGANIZATION: '/platform/organization',
  CHAT: '/platform/chat',
  HISTORY: '/platform/history',
  REFERRAL: '/platform/referral',
  TELEMETRY: '/platform/telemetry',
  TELEMETRY_PRICING: '/platform/telemetry/pricing',
  TELEMETRY_DASHBOARD: '/platform/telemetry/dashboard',
  TELEMETRY_HISTORY: '/platform/telemetry/history',
  TELEMETRY_SETTINGS: '/platform/telemetry/settings',
  APPS: '/apps',
  AUTONOMOUS_APPS: '/autonomous-apps',
  LEADERBOARD: '/platform/leaderboard',
  BOOKMARKS: '/bookmarks',
  PLAYGROUND: '/platform/playground',
};

export const AUTH = {
  CHANGE_PASSWORD: '/signin/update_password',
};
export const PUBLIC = {
  MODEL: '/model/{slug}',
  SWARM: '/swarm/{name}',
  PROMPT: '/prompt/{id}',
  TOOL: '/tool/{id}',
  AGENT: '/agent/{id}',
};

const SWARMS_DOCS = 'https://docs.swarms.world/en/latest/';
export const SWARMS_GITHUB = 'https://github.com/kyegomez/swarms';
export const DISCORD = 'https://discord.gg/jM3Z6M9uMq';
export const SWARM_CALENDLY = 'https://cal.com/swarms';

enum NAV_LINKS {
  PRICING = '/pricing',
  DOCS = SWARMS_DOCS,
  GET_DEMO = SWARM_CALENDLY,
  LEARN_MORE = '/learn-more',
}

export const NAVIGATION: { [key in keyof typeof NAV_LINKS]: NAV_LINKS } = {
  PRICING: NAV_LINKS.PRICING,
  DOCS: NAV_LINKS.DOCS,
  GET_DEMO: NAV_LINKS.GET_DEMO,
  LEARN_MORE: NAV_LINKS.LEARN_MORE,
};

export const SECURITY_LEVELS = {
  LOW: 'LEVEL 1 - STANDARD',
  MEDIUM: 'LEVEL 2 - ENCRYPTED',
  HIGH: 'LEVEL 3 - QUANTUM SECURED',
};
