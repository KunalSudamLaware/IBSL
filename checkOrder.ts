import { prisma } from "./src/lib/prisma";

async function main() {
  const order = await prisma.order.findUnique({
    where: { id: "cmux2gvrb0000jgvi2215esu" },
    include: {
      design: {
        include: {
          files: true,
        },
      },
    },
  });
  console.log(JSON.stringify(order, null, 2));
}

main().catch(console.error);
