import { Metadata } from "next";
import { AccountFeedbackClient } from "./AccountFeedbackClient";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "My Feedback | Morya Designs",
  description: "View and manage your design feedback.",
};

export default async function AccountFeedbackPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const reviews = await prisma.review.findMany({
    where: { userId: session.user.id },
    include: {
      design: { select: { id: true, title: true, slug: true, images: { where: { isPrimary: true }, take: 1 } } }
    },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-2xl font-serif text-slate-900 mb-1">My Feedback</h1>
        <p className="text-stone-500 text-sm">View and manage feedback for your purchased designs.</p>
      </div>

      <AccountFeedbackClient initialReviews={reviews} />
    </div>
  );
}
