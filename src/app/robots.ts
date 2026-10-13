import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://moryadesigns.com';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/admin/',
        '/account/',
        '/cart/',
        '/api/',
        '/checkout/',
        '/orders/access/',
        '/consultation/'
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
