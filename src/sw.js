import { defaultCache } from "@serwist/next/worker";
import { Serwist } from "serwist";

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    ...defaultCache,
    // Cache API responses for menu, categories, tables, tax settings (stale-while-revalidate)
    {
      urlPattern: ({ url }) => {
        return url.pathname.match(/\/api\/(menus|categories|admin\/tax|admin\/print-settings|public\/offers)/);
      },
      handler: "StaleWhileRevalidate",
      options: {
        cacheName: "api-data-cache",
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 5 * 60, // 5 minutes
        },
      },
    },
    // Cache table data
    {
      urlPattern: ({ url }) => url.pathname.match(/\/api\/tables\//),
      handler: "StaleWhileRevalidate",
      options: {
        cacheName: "api-tables-cache",
        expiration: {
          maxEntries: 20,
          maxAgeSeconds: 2 * 60, // 2 minutes (tables change often)
        },
      },
    },
    // Cache static assets aggressively
    {
      urlPattern: ({ url }) => url.pathname.match(/\.(js|css|woff2?|png|jpg|jpeg|svg|ico)$/),
      handler: "CacheFirst",
      options: {
        cacheName: "static-assets",
        expiration: {
          maxEntries: 200,
          maxAgeSeconds: 24 * 60 * 60, // 24 hours
        },
      },
    },
  ],
});

serwist.addEventListeners();
