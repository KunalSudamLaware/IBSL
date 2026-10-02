"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Building2, LogOut, User, ShoppingBag } from "lucide-react";
import { useState, useEffect } from "react";
import { useSession, signOut } from "@/components/providers/AuthProvider";

export function PublicNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mobileOpen]);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/designs", label: "Browse Designs" },
  ];

  if (session?.user && session.user.role === "CUSTOMER") {
    navLinks.push({ href: "/account/orders", label: "My Orders" });
    navLinks.push({ href: "/wishlist", label: "Wishlist" });
  } else {
    navLinks.push({ href: "/account/orders", label: "My Orders" });
    navLinks.push({ href: "/wishlist", label: "Wishlist" });
  }

  const handleLogout = async () => {
    await signOut();
    router.refresh();
    router.push("/");
  };

  return (
    <>
      <header 
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
          scrolled 
            ? "bg-white/95 backdrop-blur-md shadow-[0_4px_20px_-10px_rgba(0,0,0,0.1)] border-b border-stone-200/50 py-2" 
            : "bg-white border-b border-stone-200 py-4"
        }`}
      >
        <div className="mx-auto max-w-[1200px] flex items-center justify-between px-6">
          
          {/* LEFT: Logo */}
          <div className="flex-1 flex justify-start">
            <Link href="/" className="group flex items-center gap-2 font-serif text-xl font-bold tracking-wider text-slate-900 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#b89047] rounded-md">
              <Building2 className="w-5 h-5 text-[#b89047] group-hover:scale-110 transition-transform duration-300" />
              <span className="uppercase text-lg tracking-widest font-medium text-slate-900 group-hover:text-[#b89047] transition-colors duration-300">Morya Designs</span>
            </Link>
          </div>

          {/* CENTER: Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-[11px] font-bold tracking-widest uppercase text-slate-600">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`group relative py-2 px-1 transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#b89047] rounded-sm ${
                    isActive ? "text-[#b89047]" : "hover:text-slate-900"
                  }`}
                >
                  {link.label}
                  <span 
                    className={`absolute bottom-0 left-0 h-0.5 bg-[#b89047] transition-all duration-300 ${
                      isActive ? "w-full" : "w-0 group-hover:w-full"
                    }`} 
                  />
                </Link>
              );
            })}
          </nav>

          {/* RIGHT: Actions */}
          <div className="flex-1 hidden md:flex items-center justify-end gap-6 text-[10px] font-bold uppercase tracking-widest">
            
            {/* Cart Icon Link */}
            <Link 
              href="/cart"
              title="Shopping Cart"
              className={`p-2 transition-all duration-300 hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#b89047] rounded-full ${
                pathname.startsWith("/cart") ? "text-[#b89047]" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
            </Link>

            {session?.user ? (
              <div className="flex items-center gap-4">
                <span className="text-slate-900 font-semibold normal-case flex items-center gap-1.5 text-xs bg-stone-50 px-3 py-1.5 rounded-full border border-stone-200">
                  <User className="w-3.5 h-3.5 text-[#b89047]" /> {session.user.name}
                </span>
                
                {session.user.role === "ADMIN" && (
                  <Link 
                    href="/admin/dashboard" 
                    className="text-slate-600 hover:text-[#b89047] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#b89047] rounded-sm"
                  >
                    Dashboard
                  </Link>
                )}

                <button 
                  onClick={handleLogout}
                  className="text-slate-500 hover:text-rose-600 transition-colors flex items-center gap-1.5 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 rounded-sm"
                >
                  <LogOut className="w-3.5 h-3.5" /> Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-5">
                <Link 
                  href="/login" 
                  className={`group relative text-slate-600 hover:text-slate-900 transition-colors py-2 px-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#b89047] rounded-sm ${
                    pathname.startsWith("/login") ? "text-slate-900" : ""
                  }`}
                >
                  Login
                  <span 
                    className={`absolute bottom-0 left-0 h-0.5 bg-[#b89047] transition-all duration-300 ${
                      pathname.startsWith("/login") ? "w-full" : "w-0 group-hover:w-full"
                    }`} 
                  />
                </Link>
                
                <Link 
                  href="/admin/login" 
                  className="text-[#b89047] border border-[#b89047]/60 hover:bg-[#b89047] hover:text-white transition-all duration-300 px-4 py-2.5 rounded-lg shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#b89047]"
                >
                  Admin Portal
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu trigger */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="relative w-10 h-10 flex flex-col justify-center items-center group focus:outline-none"
              aria-label="Toggle mobile menu"
            >
              <span className={`block w-5 h-[1.5px] bg-slate-900 rounded transition-all duration-300 ease-out ${mobileOpen ? 'rotate-45 translate-y-[5px]' : '-translate-y-1'}`} />
              <span className={`block w-5 h-[1.5px] bg-slate-900 rounded transition-all duration-300 ease-out ${mobileOpen ? 'opacity-0' : 'opacity-100'}`} />
              <span className={`block w-5 h-[1.5px] bg-slate-900 rounded transition-all duration-300 ease-out ${mobileOpen ? '-rotate-45 -translate-y-[4px]' : 'translate-y-1'}`} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer (Fullscreen overlay) */}
      <div 
        className={`fixed inset-0 z-40 bg-white transform transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          mobileOpen ? "translate-y-0" : "-translate-y-full"
        }`}
        style={{ top: '72px' }}
      >
        <div className="flex flex-col h-[calc(100vh-72px)] overflow-y-auto px-6 py-8">
          <nav className="flex flex-col gap-6 mb-8">
            {navLinks.map((link, idx) => {
              const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  style={{ transitionDelay: `${idx * 50}ms` }}
                  className={`text-xl font-serif tracking-wide flex items-center justify-between transition-all duration-500 transform ${
                    mobileOpen ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
                  } ${isActive ? "text-[#b89047] font-semibold" : "text-slate-800"}`}
                >
                  <span>{link.label}</span>
                  {isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#b89047]" />}
                </Link>
              );
            })}
            
            <Link 
              href="/cart"
              onClick={() => setMobileOpen(false)}
              style={{ transitionDelay: `${navLinks.length * 50}ms` }}
              className={`text-xl font-serif tracking-wide flex items-center justify-between transition-all duration-500 transform ${
                mobileOpen ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
              } ${pathname === "/cart" ? "text-[#b89047] font-semibold" : "text-slate-800"}`}
            >
              <span>Shopping Cart</span>
            </Link>
          </nav>

          <div 
            className={`mt-auto pt-8 border-t border-stone-100 transition-all duration-500 delay-300 transform ${
              mobileOpen ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
            }`}
          >
            {session?.user ? (
              <div className="space-y-4">
                <p className="text-[10px] text-stone-500 font-bold uppercase tracking-widest flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-[#b89047]" /> Logged in as {session.user.name}
                </p>
                {session.user.role === "ADMIN" && (
                  <Link 
                    href="/admin/dashboard" 
                    onClick={() => setMobileOpen(false)}
                    className="w-full flex items-center justify-center text-[11px] font-bold tracking-widest uppercase text-slate-800 border border-stone-200 py-4 rounded-xl hover:bg-stone-50 transition-colors"
                  >
                    Admin Dashboard
                  </Link>
                )}
                <button 
                  onClick={() => {
                    setMobileOpen(false);
                    handleLogout();
                  }}
                  className="w-full flex items-center justify-center text-[11px] font-bold tracking-widest uppercase text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors py-4 rounded-xl gap-2 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <Link 
                  href="/login" 
                  onClick={() => setMobileOpen(false)}
                  className="w-full flex items-center justify-center text-[11px] font-bold tracking-widest uppercase text-slate-800 border border-stone-200 hover:bg-stone-50 py-4 rounded-xl transition-colors"
                >
                  Login / Create Account
                </Link>
                <Link 
                  href="/admin/login" 
                  onClick={() => setMobileOpen(false)}
                  className="w-full flex items-center justify-center text-[11px] font-bold tracking-widest uppercase text-white bg-slate-900 border border-slate-900 hover:bg-slate-800 py-4 rounded-xl transition-colors shadow-md"
                >
                  Admin Portal
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
