'use strict';

const parseCorsOrigins = () => {
  const defaults = ['http://localhost:3000'];
  const mergedOrigins = [process.env.FRONTEND_URL, process.env.FRONTEND_URLS]
    .filter(Boolean)
    .join(',');
  const envOrigins = mergedOrigins
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);

  return [...new Set([...defaults, ...envOrigins])];
};

module.exports = [
  'strapi::logger',
  'strapi::errors',
  {
    name: 'strapi::security',
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          'connect-src': ["'self'", 'https:'],
          'img-src': ["'self'", 'data:', 'blob:', 'https:'],
          'media-src': ["'self'", 'data:', 'blob:', 'https:'],
          upgradeInsecureRequests: null,
        },
      },
    },
  },
  {
    name: 'strapi::cors',
    config: {
      origin: parseCorsOrigins(),
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'],
      headers: ['Content-Type', 'Authorization', 'Origin', 'Accept'],
      credentials: true,
      keepHeaderOnError: true,
    },
  },
  'strapi::poweredBy',
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
];
