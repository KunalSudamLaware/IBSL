import { prisma } from './src/lib/prisma';
import { config } from 'dotenv';
config();

async function run() {
  const testDesign = await prisma.design.findUnique({
    where: { slug: 'modern-3bhk-villa' },
    include: {
      orders: true,
      reviews: true,
    }
  });
  
  console.log("Test Design:", JSON.stringify(testDesign, null, 2));

  if (testDesign && testDesign.title === 'Test Title') {
    if (testDesign.orders.length === 0 && testDesign.reviews.length === 0) {
      console.log("Deleting test design safely...");
      await prisma.design.delete({ where: { id: testDesign.id } });
      console.log("Deleted.");
    } else {
      console.log("Cannot delete, has dependencies:", testDesign.orders.length, testDesign.reviews.length);
    }
  } else if (!testDesign) {
    console.log("Test Design not found in DB.");
  }
}
run().then(() => prisma.$disconnect());
