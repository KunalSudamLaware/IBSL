import Link from "next/link";
import { Building2, ArrowRight } from "lucide-react";
import { BackToTop } from "@/components/shared/BackToTop";

export function PublicFooter() {
  return (
    <footer className="relative border-t border-stone-200 bg-[#FAF9F6] overflow-hidden">
      {/* Decorative gradient blur */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#b89047]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

      <div className="mx-auto max-w-[1200px] px-6 py-16 md:py-24 text-slate-800 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-12 md:gap-8">
          
          {/* Logo & Description */}
          <div className="md:col-span-4 space-y-6">
            <Link href="/" className="inline-flex items-center gap-2 font-serif text-xl font-bold tracking-wider text-slate-900 group">
              <div className="w-10 h-10 rounded-lg bg-slate-900 flex items-center justify-center group-hover:bg-[#b89047] transition-colors duration-300 shadow-md">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <span className="uppercase text-lg tracking-widest font-medium text-slate-900">Morya Designs</span>
            </Link>
            <p className="text-sm text-stone-500 leading-relaxed max-w-sm font-sans pr-4">
              Premium digital architectural marketplace. Providing professionally designed house plans, 3D elevations, and Vastu-friendly layouts.
            </p>
          </div>
          
          {/* Spacer for desktop */}
          <div className="hidden md:block md:col-span-2"></div>

          {/* Quick Links */}
          <div className="md:col-span-2">
            <h3 className="font-serif text-xs font-bold uppercase tracking-[0.2em] text-slate-900 mb-6">Quick Links</h3>
            <ul className="space-y-4 text-[11px] text-stone-500 font-bold uppercase tracking-widest">
              <li>
                <Link href="/" className="hover:text-[#b89047] transition-colors flex items-center gap-2 group">
                  <span className="w-1 h-1 rounded-full bg-stone-300 group-hover:bg-[#b89047] transition-colors"></span> Home
                </Link>
              </li>
              <li>
                <Link href="/designs" className="hover:text-[#b89047] transition-colors flex items-center gap-2 group">
                  <span className="w-1 h-1 rounded-full bg-stone-300 group-hover:bg-[#b89047] transition-colors"></span> Browse Designs
                </Link>
              </li>
              <li>
                <Link href="/account/orders" className="hover:text-[#b89047] transition-colors flex items-center gap-2 group">
                  <span className="w-1 h-1 rounded-full bg-stone-300 group-hover:bg-[#b89047] transition-colors"></span> My Orders
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="md:col-span-2">
            <h3 className="font-serif text-xs font-bold uppercase tracking-[0.2em] text-slate-900 mb-6">Support</h3>
            <ul className="space-y-4 text-[11px] text-stone-500 font-bold uppercase tracking-widest">
              <li>
                <Link href="/contact" className="hover:text-[#b89047] transition-colors flex items-center gap-2 group">
                  <span className="w-1 h-1 rounded-full bg-stone-300 group-hover:bg-[#b89047] transition-colors"></span> Contact
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[#b89047] transition-colors flex items-center gap-2 group">
                  <span className="w-1 h-1 rounded-full bg-stone-300 group-hover:bg-[#b89047] transition-colors"></span> Help / FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="md:col-span-2">
            <h3 className="font-serif text-xs font-bold uppercase tracking-[0.2em] text-slate-900 mb-6">Legal</h3>
            <ul className="space-y-4 text-[11px] text-stone-500 font-bold uppercase tracking-widest">
              <li>
                <Link href="/privacy" className="hover:text-[#b89047] transition-colors flex items-center gap-2 group">
                  <span className="w-1 h-1 rounded-full bg-stone-300 group-hover:bg-[#b89047] transition-colors"></span> Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-[#b89047] transition-colors flex items-center gap-2 group">
                  <span className="w-1 h-1 rounded-full bg-stone-300 group-hover:bg-[#b89047] transition-colors"></span> Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom copyright line */}
        <div className="mt-16 pt-8 border-t border-stone-200/60 flex flex-col md:flex-row items-center justify-between gap-6 text-[10px] font-bold uppercase tracking-widest text-stone-400">
          <div>
            &copy; {new Date().getFullYear()} Morya Designs. All rights reserved.
          </div>
          <div className="flex items-center gap-6">
            <Link href="/admin/login" className="hover:text-slate-800 transition-colors flex items-center gap-1.5 group">
              Admin Portal <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      </div>

      <BackToTop />
    </footer>
  );
}
