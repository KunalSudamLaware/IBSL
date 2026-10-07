import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { DesignForm } from "../../DesignForm";
import Link from "next/link";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditDesignPage(props: PageProps) {
  const params = await props.params;
  
  const design = await prisma.design.findUnique({
    where: { id: params.id },
    include: { images: true, files: true }
  });

  if (!design) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-12 bg-white text-slate-800 antialiased">
      {/* Breadcrumbs */}
      <div className="text-[10px] font-bold uppercase tracking-widest text-[#b89047] mb-4 flex items-center gap-1.5">
        <Link href="/admin/dashboard" className="hover:text-slate-900 transition-colors">Admin</Link>
        <span className="text-stone-400">/</span>
        <Link href="/admin/designs" className="hover:text-slate-900 transition-colors">Designs</Link>
        <span className="text-stone-400">/</span>
        <span className="text-slate-900 truncate max-w-[200px]">{design.title}</span>
        <span className="text-stone-400">/</span>
        <span className="text-slate-900">Edit</span>
      </div>

      {/* Header Info */}
      <div className="mb-10 pb-4 border-b border-stone-200/60 max-w-4xl mx-auto">
        <h1 className="text-3xl font-serif text-slate-900 font-normal tracking-tight">Edit Design</h1>
        <p className="text-xs text-stone-500 mt-1 uppercase font-semibold tracking-wider">Update catalog information for {design.title}</p>
      </div>

      <div className="max-w-4xl mx-auto">
        <DesignForm initialData={design} designId={design.id} />
      </div>
    </div>
  );
}
