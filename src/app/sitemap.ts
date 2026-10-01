import { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'

  // Fetch all published designs securely
  const designs = await prisma.design.findMany({
    where: { status: 'PUBLISHED' },
    select: { slug: true, updatedAt: true },
  });

  const designUrls = designs.map((design) => ({
    url: `${baseUrl}/designs/${design.slug}`,
    lastModified: design.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/designs`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    ...designUrls,
  ];
}
