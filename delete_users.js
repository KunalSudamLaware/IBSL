const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Starting deletion process...");
  const emails = ["manojshelke614@gmail.com", "adityasangekar41@gmail.com"];
  
  for (const email of emails) {
    console.log(`\nProcessing: ${email}`);
    const user = await prisma.user.findUnique({ where: { email } });
    
    if (user) {
      // Delete orders associated with this user ID
      const deletedOrdersById = await prisma.order.deleteMany({ where: { userId: user.id } });
      console.log(`- Deleted ${deletedOrdersById.count} orders linked to userId.`);

      // Delete any guest orders with this email
      const deletedOrdersByEmail = await prisma.order.deleteMany({ where: { email } });
      console.log(`- Deleted ${deletedOrdersByEmail.count} guest orders linked to email.`);

      // Delete the user (this cascades to EmailVerificationToken, MobileVerificationOtp, PasswordResetToken)
      await prisma.user.delete({ where: { id: user.id } });
      console.log(`[SUCCESS] Deleted user account and all cascading credentials/tokens for: ${email}`);
    } else {
      console.log(`[SKIPPED] No user account found for email: ${email}`);
      
      // Still attempt to clean up any orphaned guest orders for this email
      const deletedOrdersByEmail = await prisma.order.deleteMany({ where: { email } });
      if (deletedOrdersByEmail.count > 0) {
        console.log(`- Deleted ${deletedOrdersByEmail.count} guest orders linked to email.`);
      }
    }
  }
  console.log("\nProcess completed successfully.");
}

main()
  .catch(e => {
    console.error("[ERROR]", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });