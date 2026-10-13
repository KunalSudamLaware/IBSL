import { prisma } from './src/lib/prisma';

async function run() {
  const design = await prisma.design.findUnique({
    where: { slug: 'luxury-villa-retreat' }
  });
  console.log(JSON.stringify(design, null, 2));
}
run();
