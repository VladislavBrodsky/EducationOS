import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';
export default function robots():MetadataRoute.Robots{return {rules:process.env.DEPLOYMENT_ENV==='production'?{userAgent:'*',allow:'/',disallow:['/demo','/api/']}:{userAgent:'*',disallow:'/'},sitemap:`${SITE_URL}/sitemap.xml`}}
