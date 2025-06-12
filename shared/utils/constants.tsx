import { OptionRoles } from '@/modules/platform/settings/organization/types';
import { Zap, Shield, Database } from "lucide-react"

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
  { value: "all", label: "All", icon: <Database className="w-4 h-4" /> },
  { value: "healthcare", label: "Healthcare", icon: <Shield className="w-4 h-4" /> },
  { value: "education", label: "Education", icon: <Database className="w-4 h-4" /> },
  { value: "finance", label: "Finance", icon: <Zap className="w-4 h-4" /> },
  { value: "research", label: "Research", icon: <Database className="w-4 h-4" /> },
  { value: "public-safety", label: "Public Safety", icon: <Shield className="w-4 h-4" /> },
  { value: "marketing", label: "Marketing", icon: <Zap className="w-4 h-4" /> },
  { value: "sales", label: "Sales", icon: <Database className="w-4 h-4" /> },
  { value: "customer-support", label: "Customer Support", icon: <Shield className="w-4 h-4" /> },
  { value: "other", label: "Other", icon: <Database className="w-4 h-4" /> },
]

export const defaultOptions = ['prompts', 'agents', 'tools'];

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
export const DISCORD = 'https://discord.gg/swarms';
export const SWARM_CALENDLY = 'https://calendly.com/swarm-corp/30min';

enum NAV_LINKS {
  PRICING = '/pricing',
  DOCS = SWARMS_DOCS,
  GET_DEMO = SWARM_CALENDLY,
}

export const NAVIGATION: { [key in keyof typeof NAV_LINKS]: NAV_LINKS } = {
  PRICING: NAV_LINKS.PRICING,
  DOCS: NAV_LINKS.DOCS,
  GET_DEMO: NAV_LINKS.GET_DEMO,
};

export const SECURITY_LEVELS = {
  LOW: 'LEVEL 1 - STANDARD',
  MEDIUM: 'LEVEL 2 - ENCRYPTED',
  HIGH: 'LEVEL 3 - QUANTUM SECURED',
};
