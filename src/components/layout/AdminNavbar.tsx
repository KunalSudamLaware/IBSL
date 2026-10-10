"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, Menu, X, LayoutDashboard, Compass, ShoppingCart, Users, LineChart, Settings, LogOut, Star, MessageSquare } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { signOut } from "@/components/providers/AuthProvider";

export function AdminNavbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    // Clear client-side storage
    localStorage.removeItem("token");
    sessionStorage.clear();
    
    // Sign out via NextAuth, which will hit the server to destroy the session cookie 
    // and automatically redirect to the callbackUrl
    await signOut({ callbackUrl: "/admin/login" });
  };

  // Don't show admin nav on the login page
  if (pathname === "/admin/login") {
    return null;
  }

  const navLinks = [
    { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/designs", label: "Designs", icon: Compass },
    { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
    { href: "/admin/consultations", label: "Consults", icon: MessageSquare },
    { href: "/admin/customers", label: "Customers", icon: Users },
    { href: "/admin/analytics", label: "Reports & Analytics", icon: LineChart },
    { href: "/admin/reviews", label: "Reviews", icon: Star },
    { href: "/admin/settings", label: "Settings", icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-stone-800 bg-slate-900 text-slate-100 shadow-md">
      <div className="mx-auto max-w-7xl h-[72px] flex items-center justify-between px-6">
        
        {/* LEFT: Logo */}
        <div className="flex-1 flex justify-start">
          <Link href="/admin/dashboard" className="flex items-center gap-2 font-serif text-lg font-bold tracking-wider text-white hover:text-stone-200 transition-colors">
            <Building2 className="w-5 h-5 text-[#b89047]" />
            <span className="uppercase tracking-widest font-medium">Morya Admin</span>
          </Link>
        </div>

        {/* CENTER: Navigation Links */}
        <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold tracking-wider uppercase text-slate-400">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || (link.href !== "/admin/dashboard" && pathname.startsWith(link.href));
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative flex items-center gap-2 py-2 px-1 transition-colors hover:text-white ${
                  isActive ? "text-white font-bold" : ""
                }`}
              >
                <Icon className="w-3.5 h-3.5 text-[#b89047]" />
                <span>{link.label}</span>
                {isActive && (
                  <span className="absolute bottom-[-18px] left-0 right-0 h-0.5 bg-[#b89047]" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* RIGHT: Actions */}
        <div className="flex-1 hidden lg:flex items-center justify-end gap-6">
          <Link 
            href="/" 
            className="text-xs font-semibold tracking-widest uppercase text-slate-400 hover:text-white transition-colors"
          >
            Live Site
          </Link>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleLogout}
            className="text-xs font-semibold tracking-widest uppercase text-slate-400 hover:text-white hover:bg-slate-800/80 rounded-lg gap-2 px-3 py-2 border border-stone-850"
          >
            <LogOut className="w-3.5 h-3.5 text-[#b89047]" /> Logout
          </Button>
        </div>

        {/* Mobile menu trigger */}
        <div className="lg:hidden flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setMobileOpen(!mobileOpen)}
            className="text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg w-10 h-10 flex items-center justify-center border border-stone-800"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-slate-800 bg-slate-900 animate-in fade-in slide-in-from-top duration-200">
          <div className="flex flex-col gap-1 px-6 py-5">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || (link.href !== "/admin/dashboard" && pathname.startsWith(link.href));
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 text-sm font-semibold tracking-wider uppercase py-3 border-b border-stone-855 ${
                    isActive ? "text-[#b89047]" : "text-slate-400"
                  }`}
                >
                  <Icon className="w-4 h-4 text-[#b89047]" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
            <Link 
              href="/" 
              onClick={() => setMobileOpen(false)}
              className="text-sm font-semibold tracking-wider uppercase py-3 border-b border-stone-855 text-slate-400"
            >
              View Live Site
            </Link>
            <button
              onClick={() => { setMobileOpen(false); handleLogout(); }}
              className="flex items-center gap-3 text-sm font-semibold tracking-wider uppercase py-3 text-slate-400 text-left w-full"
            >
              <LogOut className="w-4 h-4 text-[#b89047]" /> Logout
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
