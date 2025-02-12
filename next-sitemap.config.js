const isProduction = process.env.NODE_ENV === 'production';

const productionRobotsPolicy = [{ userAgent: '*', allow: '/' }];
const developmentRobotsPolicy = [
  { userAgent: 'AdsBot-Google', disallow: '/' },
  { userAgent: '*', allow: '/' },
];

/** @type {import('next-sitemap').IConfig} */
const config = {
  siteUrl: process.env.SITE_URL || 'https://swarms.world',
  generateRobotsTxt: true,
  generateIndexSitemap: false,
  sitemapSize: 7000,
  changefreq: 'daily',
  priority: 0.7,
  exclude: ['/api/*', '/platform/*', '/_next/*'], // Exclude paths from sitemap
  robotsTxtOptions: {
    policies: isProduction ? productionRobotsPolicy : developmentRobotsPolicy,
  },
};

module.exports = config;
