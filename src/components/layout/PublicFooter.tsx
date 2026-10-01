import Link from "next/link";
import { Building2 } from "lucide-react";

export function PublicFooter() {
  return (
    <footer className="border-t border-stone-200 bg-stone-50/50">
      <div className="mx-auto max-w-[1200px] px-6 py-12 md:py-16 text-slate-800">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-8 md:gap-12">
          
          {/* Logo & Description */}
          <div className="md:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2 font-serif text-xl font-bold tracking-wider text-slate-900">
              <Building2 className="w-5 h-5 text-[#b89047]" />
              <span className="uppercase text-lg tracking-widest font-medium text-slate-900">Morya Designs</span>
            </Link>
            <p className="text-xs text-stone-500 leading-relaxed max-w-sm">
              Digital architectural marketplace for professionally designed house plans, 3D elevations, Vastu-friendly layouts, and digital architectural files.
            </p>
          </div>
          
          {/* Quick Links */}
          <div>
            <h3 className="font-serif text-xs font-bold uppercase tracking-wider text-slate-900 mb-4">Quick Links</h3>
            <ul className="space-y-3 text-xs text-stone-500 font-semibold uppercase tracking-wider">
              <li>
                <Link href="/" className="hover:text-slate-900 transition-colors">Home</Link>
              </li>
              <li>
                <Link href="/designs" className="hover:text-slate-900 transition-colors">Browse Designs</Link>
              </li>
              <li>
                <Link href="/account/orders" className="hover:text-slate-900 transition-colors">My Orders</Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-serif text-xs font-bold uppercase tracking-wider text-slate-900 mb-4">Support</h3>
            <ul className="space-y-3 text-xs text-stone-500 font-semibold uppercase tracking-wider">
              <li>
                <Link href="/contact" className="hover:text-slate-900 transition-colors">Contact</Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-slate-900 transition-colors">Help / FAQ</Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-serif text-xs font-bold uppercase tracking-wider text-slate-900 mb-4">Legal</h3>
            <ul className="space-y-3 text-xs text-stone-500 font-semibold uppercase tracking-wider">
              <li>
                <Link href="/privacy" className="hover:text-slate-900 transition-colors">Privacy Policy</Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-slate-900 transition-colors">Terms & Conditions</Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom copyright line */}
        <div className="mt-12 pt-8 border-t border-stone-200/60 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-semibold uppercase tracking-wider text-stone-400">
          <div>
            &copy; 2026 Morya Designs. All rights reserved.
          </div>
          <div>
            <Link href="/admin/login" className="hover:text-slate-800 transition-colors">Admin Portal</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
