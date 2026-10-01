"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession, signOut } from "@/components/providers/AuthProvider";
import { User, LogOut, Package, Heart, LayoutDashboard, Loader2, ArrowRight, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Profile {
  id: string;
  name: string;
  email: string;
  phone: string;
  createdAt: string;
}

interface Stats {
  totalOrders: number;
  paidOrders: number;
  savedDesigns: number;
}

export default function AccountPage() {
  const router = useRouter();
  const { status } = useSession();
  
  const [profile, setProfile] = useState<Profile | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      fetch("/api/account/profile")
        .then(res => res.json())
        .then(data => {
          if (data.profile) {
            setProfile(data.profile);
            setStats(data.stats);
            setEditName(data.profile.name);
            setEditPhone(data.profile.phone);
          }
        })
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [status, router]);

  const handleSave = async () => {
    setSaveError("");
    setSaveLoading(true);
    
    try {
      const res = await fetch("/api/account/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName, phone: editPhone })
      });
      
      const data = await res.json();
      if (!res.ok) {
        setSaveError(data.error || "Failed to update profile.");
        return;
      }
      
      setProfile(data.profile);
      setIsEditing(false);
    } catch (err) {
      setSaveError("An unexpected error occurred.");
    } finally {
      setSaveLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
  };

  if (loading || status === "loading") {
    return (
      <div className="mx-auto max-w-[1200px] px-6 py-24 flex flex-col items-center justify-center min-h-[50vh] text-slate-800 bg-[#FAF9F6]">
        <Loader2 className="w-8 h-8 text-[#b89047] animate-spin mb-4" />
        <p className="text-xs font-bold uppercase tracking-wider text-stone-500">Loading your account...</p>
      </div>
    );
  }

  if (!profile || !stats) {
    return null;
  }

  return (
    <div className="mx-auto max-w-[1200px] px-6 py-12 min-h-[70vh] bg-[#FAF9F6] text-slate-900 antialiased font-sans">
      
      {/* Header */}
      <div className="mb-10 pb-4 border-b border-stone-200">
        <span className="text-[10px] font-bold tracking-[0.2em] text-[#b89047] uppercase block mb-1">Customer Area</span>
        <h1 className="text-3xl font-serif text-slate-900 font-normal tracking-tight">My Account</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Sidebar Navigation */}
        <aside className="lg:col-span-1 space-y-2">
          <Link href="/account" className="flex items-center gap-3 px-4 py-3 bg-slate-900 text-white rounded-lg text-xs font-bold tracking-widest uppercase shadow-sm">
            <LayoutDashboard className="w-4 h-4 text-[#b89047]" /> Profile
          </Link>
          <Link href="/account/orders" className="flex items-center gap-3 px-4 py-3 bg-white text-slate-650 hover:bg-stone-50 hover:text-slate-900 border border-stone-200 rounded-lg text-xs font-bold tracking-widest uppercase transition-colors">
            <Package className="w-4 h-4" /> My Orders
          </Link>
          <Link href="/wishlist" className="flex items-center gap-3 px-4 py-3 bg-white text-slate-650 hover:bg-stone-50 hover:text-slate-900 border border-stone-200 rounded-lg text-xs font-bold tracking-widest uppercase transition-colors">
            <Heart className="w-4 h-4" /> Wishlist
          </Link>
          <Link href="/account/consultations" className="flex items-center gap-3 px-4 py-3 bg-white text-slate-650 hover:bg-stone-50 hover:text-slate-900 border border-stone-200 rounded-lg text-xs font-bold tracking-widest uppercase transition-colors">
            <MessageSquare className="w-4 h-4" /> Consultations
          </Link>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 bg-white text-rose-600 hover:bg-rose-50 border border-stone-200 rounded-lg text-xs font-bold tracking-widest uppercase transition-colors mt-6"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </aside>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-8">
          
          {/* Profile Card */}
          <div className="bg-white border border-stone-200 rounded-lg p-8 shadow-sm">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-stone-150">
              <h2 className="text-lg font-serif font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <User className="w-5 h-5 text-[#b89047]" /> Profile Details
              </h2>
              {!isEditing && (
                <Button 
                  onClick={() => setIsEditing(true)}
                  variant="outline"
                  className="h-9 text-xs font-bold tracking-widest uppercase border-stone-300 text-slate-700 rounded-md"
                >
                  Edit Profile
                </Button>
              )}
            </div>

            {isEditing ? (
              <div className="space-y-5 max-w-md">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-slate-800">Email Address (Read Only)</Label>
                  <Input value={profile.email} disabled className="bg-stone-50 text-stone-500 border-stone-200 cursor-not-allowed h-11" />
                  <p className="text-[10px] text-stone-400 font-semibold uppercase tracking-wider mt-1">To change email, please contact support.</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-slate-800">Full Name</Label>
                  <Input 
                    value={editName} 
                    onChange={e => setEditName(e.target.value)} 
                    className="h-11 border-stone-200 focus-visible:ring-[#b89047]" 
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-slate-800">Mobile Number</Label>
                  <Input 
                    value={editPhone} 
                    onChange={e => setEditPhone(e.target.value)} 
                    placeholder="10 digit number"
                    className="h-11 border-stone-200 focus-visible:ring-[#b89047]" 
                  />
                </div>
                {saveError && <p className="text-xs font-semibold text-rose-600">{saveError}</p>}
                <div className="flex gap-3 pt-4 border-t border-stone-150">
                  <Button 
                    onClick={handleSave} 
                    disabled={saveLoading}
                    className="h-11 text-xs font-bold uppercase tracking-widest bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors w-32"
                  >
                    {saveLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save"}
                  </Button>
                  <Button 
                    onClick={() => {
                      setIsEditing(false);
                      setEditName(profile.name);
                      setEditPhone(profile.phone);
                      setSaveError("");
                    }} 
                    variant="outline"
                    className="h-11 text-xs font-bold uppercase tracking-widest border-stone-300 text-slate-600 rounded-lg hover:bg-stone-50 w-32"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <p className="text-[10px] font-bold tracking-[0.2em] text-stone-400 uppercase mb-1">Full Name</p>
                  <p className="text-sm font-semibold text-slate-900">{profile.name}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold tracking-[0.2em] text-stone-400 uppercase mb-1">Email Address</p>
                  <p className="text-sm font-semibold text-slate-900">{profile.email}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold tracking-[0.2em] text-stone-400 uppercase mb-1">Mobile Number</p>
                  <p className="text-sm font-semibold text-slate-900">{profile.phone || <span className="text-stone-400 italic font-normal">Not provided</span>}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold tracking-[0.2em] text-stone-400 uppercase mb-1">Member Since</p>
                  <p className="text-sm font-semibold text-slate-900 font-mono">
                    {new Date(profile.createdAt).toLocaleDateString("en-IN", { month: "short", year: "numeric", day: "numeric" })}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Summaries */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Orders Summary */}
            <div className="bg-white border border-stone-200 rounded-lg p-6 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="font-serif font-bold text-lg text-slate-900 mb-2">My Orders</h3>
                <div className="flex gap-4 mb-6">
                  <div>
                    <span className="block text-2xl font-bold font-mono text-slate-900">{stats.totalOrders}</span>
                    <span className="text-[10px] font-bold tracking-wider text-stone-500 uppercase">Total</span>
                  </div>
                  <div>
                    <span className="block text-2xl font-bold font-mono text-emerald-600">{stats.paidOrders}</span>
                    <span className="text-[10px] font-bold tracking-wider text-stone-500 uppercase">Paid</span>
                  </div>
                </div>
              </div>
              <Link 
                href="/account/orders" 
                className="w-full h-11 border border-slate-900 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-900 rounded-lg hover:bg-slate-50 transition-colors"
              >
                View Orders <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Wishlist Summary */}
            <div className="bg-white border border-stone-200 rounded-lg p-6 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="font-serif font-bold text-lg text-slate-900 mb-2">My Wishlist</h3>
                <div className="mb-6">
                  <span className="block text-2xl font-bold font-mono text-[#b89047]">{stats.savedDesigns}</span>
                  <span className="text-[10px] font-bold tracking-wider text-stone-500 uppercase">Saved Designs</span>
                </div>
              </div>
              <Link 
                href="/wishlist" 
                className="w-full h-11 border border-stone-300 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-700 rounded-lg hover:bg-stone-50 transition-colors"
              >
                View Wishlist <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
