import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';
import { journalArticles } from '@/lib/journal';
export default function sitemap():MetadataRoute.Sitemap{return ['','/programs','/approach','/blog',...journalArticles.map(({slug})=>`/blog/${slug}`),'/trust','/safety','/privacy','/terms','/accessibility'].map(path=>({url:`${SITE_URL}${path}`,changeFrequency:'monthly',priority:path?0.6:1}))}
