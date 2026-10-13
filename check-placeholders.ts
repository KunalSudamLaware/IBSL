import { prisma } from './src/lib/prisma';
import { config } from 'dotenv';
config();

async function run() {
  const designs = await prisma.design.findMany({
    include: { images: true }
  });

  const report = [];

  for (const design of designs) {
    let badImages = design.images.filter(img => img.url.includes('placeholder.r2.cloudflarestorage.com'));
    if (badImages.length > 0) {
      report.push({
        title: design.title,
        slug: design.slug,
        id: design.id,
        affectedField: 'images.url',
        count: badImages.length,
        corrected: false
      });
    }
  }

  console.log("REPORT:", JSON.stringify(report, null, 2));
}
run().then(() => process.exit(0));
