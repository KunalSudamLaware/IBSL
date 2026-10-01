import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { config } from "dotenv";
import bcrypt from "bcryptjs";
config({ path: ".env.local" });

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function runTests() {
  const TEST_EMAIL = "otp_test_user@moryadesigns.com";
  const TEST_PASSWORD = "Strong@Password123";
  const BASE_URL = "http://localhost:3000";

  console.log("=== STARTING OTP FLOW TESTS ===");

  // Cleanup before test
  await prisma.user.deleteMany({ where: { email: TEST_EMAIL } });

  // 1. Test Registration
  console.log("\n1. Testing Registration...");
  const regRes = await fetch(`${BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "OTP Test User",
      email: TEST_EMAIL,
      phone: "9876543210",
      password: TEST_PASSWORD,
      confirmPassword: TEST_PASSWORD
    })
  });
  
  if (!regRes.ok) {
    const errorText = await regRes.text();
    console.error("Registration failed:", errorText);
    process.exit(1);
  }
  console.log("PASS: Registration successful.");

  // 2. Test Email OTP Generation (check DB since we are intercepting the real email)
  console.log("\n2. Checking OTP Generation...");
  const user = await prisma.user.findUnique({
    where: { email: TEST_EMAIL },
    include: { emailVerificationTokens: true }
  });

  if (!user || user.emailVerificationTokens.length === 0) {
    console.error("User or OTP token not found in DB.");
    process.exit(1);
  }
  console.log("PASS: OTP hash saved in database. User emailVerified = false");
  
  // Since we don't have the raw OTP (it's hashed), we must brute-force it or just mock it.
  // Wait, I can't read the OTP from the DB because it's bcrypt hashed!
  // And the email went to Resend.
  // Let me temporarily patch the OTP in DB with a known hash to test verification.
  const KNOWN_OTP = "112233";
  const knownHash = await bcrypt.hash(KNOWN_OTP, 10);
  
  const tokenRecord = user.emailVerificationTokens[0];
  await prisma.emailVerificationToken.update({
    where: { id: tokenRecord.id },
    data: { tokenHash: knownHash }
  });

  // 3. Test Incorrect OTP
  console.log("\n3. Testing Incorrect OTP...");
  const wrongVerify = await fetch(`${BASE_URL}/api/auth/verify-email-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: TEST_EMAIL, otp: "999999" })
  });
  const wrongVerifyData = await wrongVerify.json();
  if (wrongVerify.status !== 400 || !wrongVerifyData.error.includes("Invalid")) {
    console.error("Failed to catch wrong OTP.", wrongVerifyData);
    process.exit(1);
  }
  console.log("PASS: Incorrect OTP rejected correctly.");

  // 4. Test Expired OTP
  console.log("\n4. Testing Expired OTP...");
  await prisma.emailVerificationToken.update({
    where: { id: tokenRecord.id },
    data: { expiresAt: new Date(Date.now() - 1000) } // Expired 1 second ago
  });

  const expiredVerify = await fetch(`${BASE_URL}/api/auth/verify-email-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: TEST_EMAIL, otp: KNOWN_OTP })
  });
  const expiredVerifyData = await expiredVerify.json();
  if (expiredVerify.status !== 400 || !expiredVerifyData.error.includes("expired")) {
    console.error("Failed to catch expired OTP.", expiredVerifyData);
    process.exit(1);
  }
  console.log("PASS: Expired OTP rejected correctly.");

  // 5. Test Resend OTP (Rate Limit)
  console.log("\n5. Testing Resend OTP Rate Limiting...");
  // Set createdAt to now to trigger rate limit
  await prisma.emailVerificationToken.update({
    where: { id: tokenRecord.id },
    data: { createdAt: new Date() }
  });

  const rateLimitResend = await fetch(`${BASE_URL}/api/auth/resend-email-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: TEST_EMAIL })
  });
  if (rateLimitResend.status !== 429) {
    console.error("Failed rate limiting check.", await rateLimitResend.text());
    process.exit(1);
  }
  console.log("PASS: Rate limiting prevents spamming OTPs.");

  // 6. Test Valid Resend OTP
  console.log("\n6. Testing Valid Resend OTP...");
  // Bypass rate limit by moving createdAt back 2 minutes
  await prisma.emailVerificationToken.update({
    where: { id: tokenRecord.id },
    data: { createdAt: new Date(Date.now() - 120000) }
  });

  const validResend = await fetch(`${BASE_URL}/api/auth/resend-email-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: TEST_EMAIL })
  });
  if (!validResend.ok) {
    console.error("Resend OTP failed.", await validResend.text());
    process.exit(1);
  }
  console.log("PASS: OTP resent successfully. Previous token invalidated.");

  // Set known hash again for the new token
  const updatedTokens = await prisma.emailVerificationToken.findMany({ where: { userId: user.id } });
  if (updatedTokens.length !== 1) {
    console.error("Old tokens were not cleared on resend!");
    process.exit(1);
  }
  await prisma.emailVerificationToken.update({
    where: { id: updatedTokens[0].id },
    data: { tokenHash: knownHash }
  });

  // 7. Test Successful OTP Verification
  console.log("\n7. Testing Successful OTP Verification...");
  const successVerify = await fetch(`${BASE_URL}/api/auth/verify-email-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: TEST_EMAIL, otp: KNOWN_OTP })
  });
  if (!successVerify.ok) {
    console.error("Verification failed.", await successVerify.text());
    process.exit(1);
  }
  console.log("PASS: OTP Verified. User emailVerified = true");

  const verifiedUser = await prisma.user.findUnique({ where: { email: TEST_EMAIL } });
  if (!verifiedUser.emailVerified) {
    console.error("emailVerified flag was not set!");
    process.exit(1);
  }
  const remainingTokens = await prisma.emailVerificationToken.findMany({ where: { userId: user.id } });
  if (remainingTokens.length > 0) {
    console.error("Token was not deleted after verification!");
    process.exit(1);
  }
  console.log("PASS: Database updated properly (flag set, tokens cleared).");

  // 8. Test Already Used OTP
  console.log("\n8. Testing Already Used OTP / Re-verification...");
  const reusedVerify = await fetch(`${BASE_URL}/api/auth/verify-email-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: TEST_EMAIL, otp: KNOWN_OTP })
  });
  const reusedVerifyData = await reusedVerify.json();
  if (reusedVerify.status !== 200 || !reusedVerifyData.message.includes("already verified")) {
    console.error("Failed already used OTP check.", reusedVerifyData);
    process.exit(1);
  }
  console.log("PASS: Already verified user is handled correctly.");

  // Cleanup
  await prisma.user.deleteMany({ where: { email: TEST_EMAIL } });
  console.log("\n=== ALL OTP FLOW TESTS PASSED ===");
  process.exit(0);
}

runTests().catch(e => {
  console.error("Test execution failed:", e);
  process.exit(1);
});