import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';
export default function sitemap():MetadataRoute.Sitemap{return ['','/programs','/approach','/trust','/safety','/privacy','/terms','/accessibility'].map(path=>({url:`${SITE_URL}${path}`,changeFrequency:'monthly',priority:path?0.6:1}))}
