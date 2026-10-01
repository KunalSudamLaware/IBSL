import { prisma } from "@/lib/prisma";
import { ConsultationForm } from "./ConsultationForm";
import { auth } from "@/lib/auth";

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function ConsultationPage(props: { searchParams: SearchParams }) {
  const searchParams = await props.searchParams;
  const designId = typeof searchParams.design === "string" ? searchParams.design : null;

  let design = null;
  if (designId) {
    design = await prisma.design.findUnique({
      where: { id: designId },
      select: { id: true, title: true, slug: true, images: { where: { isPrimary: true }, take: 1 } }
    });
  }

  const session = await auth();
  let userDetails = null;

  if (session?.user?.id) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    });
    if (user) {
      userDetails = {
        name: user.name,
        email: user.email,
        mobile: user.phone || ""
      };
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-12 bg-white text-slate-800 antialiased font-sans">
      <div className="mb-10 border-b border-stone-200 pb-6 text-center">
        <h1 className="text-3xl font-serif text-slate-900 font-normal tracking-tight">Request a Consultation</h1>
        <p className="text-xs text-stone-500 uppercase font-semibold mt-3 tracking-wider leading-relaxed">
          Discuss your requirements, customization, or architectural questions with our expert team.
        </p>
      </div>

      <ConsultationForm design={design} userDetails={userDetails} />
    </div>
  );
}
