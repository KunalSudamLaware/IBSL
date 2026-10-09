import { config } from "dotenv";
config();
import { prisma } from "./src/lib/prisma";

async function checkReviews() {
  const reviews = await prisma.review.findMany({
    include: {
      design: { select: { slug: true } }
    }
  });
  console.log(JSON.stringify(reviews, null, 2));
}

checkReviews().catch(console.error).finally(() => prisma.$disconnect());
