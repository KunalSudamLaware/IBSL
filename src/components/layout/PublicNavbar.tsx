"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Building2, Menu, X, LogOut, User, ShoppingBag } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useSession, signOut } from "@/components/providers/AuthProvider";

export function PublicNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/designs", label: "Browse Designs" },
  ];

  // If user is customer, add My Orders directly to main navbar
  if (session?.user && session.user.role === "CUSTOMER") {
    navLinks.push({ href: "/account/orders", label: "My Orders" });
    navLinks.push({ href: "/wishlist", label: "Wishlist" });
  } else {
    // Show orders if not logged in too, middleware will redirect
    navLinks.push({ href: "/account/orders", label: "My Orders" });
    navLinks.push({ href: "/wishlist", label: "Wishlist" });
  }

  const handleLogout = async () => {
    await signOut();
    router.refresh();
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-stone-200/80 bg-white/95 backdrop-blur-md supports-[backdrop-filter]:bg-white/80 shadow-sm text-slate-800">
      <div className="mx-auto max-w-[1200px] h-[72px] flex items-center justify-between px-6">
        
        {/* LEFT: Logo */}
        <div className="flex-1 flex justify-start">
          <Link href="/" className="flex items-center gap-2 font-serif text-xl font-bold tracking-wider text-slate-900 hover:text-slate-800 transition-colors">
            <Building2 className="w-5 h-5 text-[#b89047]" />
            <span className="uppercase text-lg tracking-widest font-medium text-slate-900">Morya Designs</span>
          </Link>
        </div>

        {/* CENTER: Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-semibold tracking-wider uppercase text-slate-650">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative py-2 px-1 transition-colors hover:text-slate-950 ${
                  isActive ? "text-slate-950 font-bold" : ""
                }`}
              >
                {link.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#b89047]" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* RIGHT: Actions */}
        <div className="flex-1 hidden md:flex items-center justify-end gap-6 text-xs font-semibold uppercase tracking-wider">
          
          {/* Cart Icon Link */}
          <Link 
            href="/cart"
            title="Shopping Cart"
            className={`p-2 hover:text-[#b89047] transition-colors relative ${
              pathname.startsWith("/cart") ? "text-[#b89047]" : "text-slate-600"
            }`}
          >
            <ShoppingBag className="w-5 h-5" />
          </Link>

          {session?.user ? (
            <div className="flex items-center gap-4">
              <span className="text-stone-500 font-medium normal-case flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-[#b89047]" /> {session.user.name}
              </span>
              
              {session.user.role === "ADMIN" && (
                <Link 
                  href="/admin/dashboard" 
                  className="text-stone-700 hover:text-slate-900 border border-stone-250 hover:bg-stone-50 transition-all px-3 py-1.5 rounded-lg"
                >
                  Dashboard
                </Link>
              )}

              <button 
                onClick={handleLogout}
                className="text-stone-500 hover:text-rose-600 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-5">
              <Link 
                href="/login" 
                className={`text-slate-650 hover:text-slate-950 transition-colors py-2 px-1 relative ${
                  pathname.startsWith("/login") ? "text-slate-950 font-bold" : ""
                }`}
              >
                Login / Account
                {pathname.startsWith("/login") && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#b89047]" />
                )}
              </Link>
              
              <Link 
                href="/admin/login" 
                className="text-[#b89047] border border-[#b89047]/60 hover:bg-[#b89047] hover:text-white transition-all duration-300 px-4 py-2 rounded-lg shadow-sm"
              >
                Admin Portal
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu trigger */}
        <div className="md:hidden flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setMobileOpen(!mobileOpen)}
            className="text-slate-800 hover:bg-slate-50 rounded-lg w-10 h-10 flex items-center justify-center border border-stone-200/50"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden border-t border-stone-200 bg-white shadow-lg animate-in fade-in slide-in-from-top duration-200">
          <div className="flex flex-col gap-1 px-6 py-5">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`text-sm font-medium uppercase tracking-wider py-3 border-b border-stone-100 flex justify-between items-center ${isActive ? "text-[#b89047] font-semibold" : "text-slate-600"}`}
                >
                  <span>{link.label}</span>
                  {isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#b89047]" />}
                </Link>
              );
            })}
            
            <Link 
              href="/cart"
              onClick={() => setMobileOpen(false)}
              className={`text-sm font-medium uppercase tracking-wider py-3 border-b border-stone-100 flex justify-between items-center ${pathname === "/cart" ? "text-[#b89047] font-semibold" : "text-slate-600"}`}
            >
              <span>Shopping Cart</span>
            </Link>

            {session?.user ? (
              <div className="py-4 space-y-3">
                <p className="text-xs text-stone-500 font-semibold uppercase tracking-wider">Logged in as: {session.user.name}</p>
                {session.user.role === "ADMIN" && (
                  <Link 
                    href="/admin/dashboard" 
                    onClick={() => setMobileOpen(false)}
                    className="w-full inline-block text-center text-xs font-semibold tracking-wider uppercase text-slate-800 border border-stone-250 py-3 rounded-lg hover:bg-stone-50 transition-colors"
                  >
                    Admin Dashboard
                  </Link>
                )}
                <button 
                  onClick={() => {
                    setMobileOpen(false);
                    handleLogout();
                  }}
                  className="w-full text-center text-xs font-semibold tracking-wider uppercase text-white bg-rose-600 hover:bg-rose-500 transition-colors py-3 rounded-lg flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2 pt-4">
                <Link 
                  href="/login" 
                  onClick={() => setMobileOpen(false)}
                  className="w-full inline-block text-center text-xs font-semibold tracking-wider uppercase text-slate-800 border border-stone-250 hover:bg-stone-50 py-3 rounded-lg"
                >
                  Login / Account
                </Link>
                <Link 
                  href="/admin/login" 
                  onClick={() => setMobileOpen(false)}
                  className="w-full inline-block text-center text-xs font-semibold tracking-wider uppercase text-white bg-slate-900 border border-slate-900 hover:bg-slate-800 py-3 rounded-lg"
                >
                  Admin Portal
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
