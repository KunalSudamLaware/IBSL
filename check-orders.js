const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkOrders() {
  const orders = await prisma.order.findMany({
    select: {
      id: true,
      status: true,
      razorpayOrderId: true,
      razorpayPaymentId: true,
      invoiceNumber: true
    }
  });
  console.log(JSON.stringify(orders, null, 2));
}

checkOrders().catch(console.error).finally(() => prisma.$disconnect());
