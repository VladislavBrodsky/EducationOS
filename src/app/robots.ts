import type { MetadataRoute } from 'next';
import { headers } from 'next/headers';
import { SITE_URL } from '@/lib/site';
import { PORTAL_HOST_HEADER } from '@/lib/portal-routing';

export default async function robots(): Promise<MetadataRoute.Robots> {
  const portalHost = (await headers()).get(PORTAL_HOST_HEADER) === 'true';
  if (portalHost) return { rules: { userAgent: '*', disallow: '/' } };
  return {
    rules: process.env.DEPLOYMENT_ENV === 'production'
      ? { userAgent: '*', allow: '/', disallow: ['/portal', '/demo', '/api/'] }
      : { userAgent: '*', disallow: '/' },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
