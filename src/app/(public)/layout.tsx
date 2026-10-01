// Unused imports removed
import { PublicFooter } from "@/components/layout/PublicFooter";
import { PublicNavbar } from "@/components/layout/PublicNavbar";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <PublicNavbar />

      <main className="flex-1">
        {children}
      </main>
      
      <PublicFooter />
    </div>
  );
}
