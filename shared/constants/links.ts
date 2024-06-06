export const PLATFORM = {
  DASHBOARD: '/platform/dashboard',
  API_KEYS: '/platform/api-keys',
  USAGE: '/platform/usage',
  ACCOUNT: '/platform/account',
  ACCOUNT_PROFILE: '/platform/account/profile',
  ACCOUNT_BILLING: '/platform/account/billing',

  PLAYGROUND: '/platform/playground',
  EXPLORER: '/platform/explorer',
  SETTINGS: '/platform/organization',
  ORGANIZATION: '/platform/organization',
};

export const AUTH = {
  CHANGE_PASSWORD: '/signin/update_password',
};
export const PUBLIC = {
  MODEL: '/model/{slug}',
  SWARM: '/swarm/{name}',
  PROMPT: '/prompt/{id}',
  PROMPTRATING: '/prompt/rating/{id}'
};

const SWARMS_DOCS = 'https://swarms.apac.ai/en/latest/';
export const SWARMS_GITHUB = 'https://github.com/kyegomez/swarms';
export const DISCORD = 'https://discord.gg/gRXy5mpFHz';
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
