// Search and AI-answer-engine settings for this app, written by MonstarX's SEO/GEO settings.
//
// Change them in Preview → SEO/GEO or through the authorized builder SEO tools, not here: every save replaces this file. The managed helper
// src/lib/monstarx/seo.ts turns them into the <head> of every page, /robots.txt, /sitemap.xml and /llms.txt.

import type { SeoConfig } from '@/lib/monstarx/seo'

export const seo: SeoConfig = {
  "siteUrl": "",
  "siteName": "White Land Cafe · Site · Cloud",
  "defaultTitle": "White Land — Coffee, bagels & pressed sandwiches",
  "titleTemplate": "%s · White Land",
  "defaultDescription": "Discover White Land, a two-storey loft café in Pantai Hillpark, Kuala Lumpur. Coffee, bagels and pressed sandwiches, a look inside, and details for your visit.",
  "keywords": [],
  "locale": "en",
  "themeColor": "",
  "image": null,
  "imageAlt": "",
  "twitterSite": "",
  "twitterCard": "summary_large_image",
  "indexable": false,
  "robots": {
    "mode": "allow",
    "disallow": [],
    "aiCrawlers": "allow",
    "custom": ""
  },
  "sitemap": {
    "enabled": true,
    "exclude": [],
    "extra": []
  },
  "llms": {
    "enabled": true,
    "summary": "",
    "notes": ""
  },
  "organization": {
    "name": "White Land Cafe · Site · Cloud",
    "type": "Organization",
    "logo": null,
    "sameAs": [],
    "email": "",
    "phone": "",
    "address": ""
  },
  "verification": {
    "google": "",
    "bing": "",
    "yandex": "",
    "pinterest": ""
  },
  "faq": [],
  "pages": [
    {
      "path": "/",
      "title": "White Land — Coffee, bagels & pressed sandwiches",
      "description": "Discover White Land, a two-storey loft café in Pantai Hillpark, Kuala Lumpur. Explore our coffee, take a look inside and plan your visit.",
      "summary": "White Land is a café in Pantai Hillpark, Kuala Lumpur. This website features the café's supplied photographs, an interactive coffee guide, kitchen highlights and source contact details. The photo journal links to @white_land_ on Instagram; it is not a live social feed."
    },
    {
      "path": "/llms.txt"
    },
    {
      "path": "/menu",
      "title": "The menu"
    },
    {
      "path": "/robots.txt"
    },
    {
      "path": "/sitemap.xml"
    }
  ],
  "paths": [
    "/",
    "/llms.txt",
    "/menu",
    "/robots.txt",
    "/sitemap.xml"
  ]
}

export default seo
