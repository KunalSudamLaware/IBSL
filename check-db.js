const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const testDesign = await prisma.design.findUnique({
    where: { slug: 'modern-3bhk-villa' },
    include: {
      orders: true,
      reviews: true,
      wishlistedBy: true,
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
  }
}
run().then(() => prisma.$disconnect());
