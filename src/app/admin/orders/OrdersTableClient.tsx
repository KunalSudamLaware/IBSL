"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Mail, Undo2, ArrowRight } from "lucide-react";
import { formatPrice } from "@/lib/format";

type OrderWithDesign = {
  id: string;
  email: string;
  amountInr: number;
  status: string;
  invoiceNumber: string | null;
  createdAt: Date;
  design: { title: string };
};

export function OrdersTableClient({ initialOrders }: { initialOrders: OrderWithDesign[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`?${params.toString()}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters("search", search);
  };

  const resendEmail = async (orderId: string) => {
    setLoadingAction(`resend-${orderId}`);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/resend-email`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to resend");
      alert("Email resent successfully!");
    } catch {
      alert("Error resending email.");
    } finally {
      setLoadingAction(null);
    }
  };

  const issueRefund = async (orderId: string) => {
    if (!confirm("Are you sure you want to issue a refund via Razorpay? This cannot be undone.")) return;
    
    setLoadingAction(`refund-${orderId}`);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/refund`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to refund");
      alert("Refund issued successfully!");
      router.refresh();
    } catch {
      alert("Error issuing refund.");
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <div className="space-y-6 text-slate-800">
      {/* Toolbar */}
      <div className="flex flex-col md:flex-row justify-between gap-4">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2 max-w-sm w-full">
          <Input 
            placeholder="Search email or Invoice ID..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-11 text-sm rounded-lg border-stone-200 focus-visible:ring-1 focus-visible:ring-[#b89047]"
          />
          <Button 
            type="submit" 
            className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold tracking-widest uppercase px-5 rounded-lg border border-slate-900 h-11"
          >
            Search
          </Button>
        </form>

        {/* Status Filters */}
        <div className="flex flex-wrap gap-1.5">
          {[
            { key: "", label: "All" },
            { key: "PAID", label: "Paid" },
            { key: "PENDING", label: "Pending" },
            { key: "REFUNDED", label: "Refunded" }
          ].map((filter) => {
            const currentStatus = searchParams.get("status") || "";
            const isSelected = currentStatus === filter.key;
            return (
              <Button 
                key={filter.key}
                onClick={() => updateFilters("status", filter.key)}
                className={`h-11 text-xs font-semibold tracking-wider uppercase rounded-lg border transition-all duration-200 px-4 ${
                  isSelected 
                    ? "bg-slate-900 border-slate-900 text-white hover:bg-slate-850" 
                    : "bg-white border-stone-200 text-stone-600 hover:text-slate-900 hover:border-slate-400"
                }`}
              >
                {filter.label}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Data Table */}
      <div className="rounded-lg border border-stone-200 bg-white overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <Table className="min-w-full">
            <TableHeader className="bg-stone-50">
              <TableRow className="border-b border-stone-200">
                <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-700 py-3">Invoice / ID</TableHead>
                <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-700 py-3">Customer</TableHead>
                <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-700 py-3">Design</TableHead>
                <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-700 py-3">Date</TableHead>
                <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-700 py-3">Status</TableHead>
                <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-700 py-3 text-right">Amount</TableHead>
                <th className="w-[50px] py-3"></th>
              </TableRow>
            </TableHeader>
            <TableBody>
              {initialOrders.map((order) => (
                <TableRow key={order.id} className="border-b border-stone-100 hover:bg-stone-50/40">
                  {/* Invoice / ID */}
                  <TableCell className="py-4">
                    <Link href={`/admin/orders/${order.id}`} className="block group">
                      <div className="text-xs font-bold text-[#b89047] group-hover:text-[#c5a880] uppercase tracking-wider font-mono">
                        {order.invoiceNumber || "N/A"}
                      </div>
                      <div className="text-[10px] text-stone-400 font-semibold tracking-wider uppercase mt-0.5">
                        ID: {order.id.slice(-6).toUpperCase()}
                      </div>
                    </Link>
                  </TableCell>
                  
                  {/* Customer */}
                  <TableCell className="text-xs font-medium text-stone-500 py-4">{order.email}</TableCell>
                  
                  {/* Design */}
                  <TableCell className="text-xs font-semibold text-slate-800 py-4">{order.design.title}</TableCell>
                  
                  {/* Date */}
                  <TableCell className="text-xs font-medium text-stone-500 py-4">
                    {new Date(order.createdAt).toLocaleDateString("en-IN", { day: 'numeric', month: 'short', year: 'numeric' })}
                  </TableCell>
                  
                  {/* Status */}
                  <TableCell className="py-4">
                    <Badge variant="outline" className={`rounded-md text-[9px] font-semibold uppercase tracking-wider px-2 py-0.5 ${
                      order.status === "PAID" 
                        ? "bg-emerald-50 text-emerald-800 border-emerald-250/20" 
                        : order.status === "REFUNDED" 
                        ? "bg-rose-50 text-rose-800 border-rose-250/20" 
                        : "bg-amber-50 text-amber-800 border-amber-250/20"
                    }`}>
                      {order.status}
                    </Badge>
                  </TableCell>
                  
                  {/* Amount */}
                  <TableCell className="text-right text-xs font-bold text-slate-900 py-4">
                    {formatPrice(order.amountInr)}
                  </TableCell>
                  
                  {/* Dropdown Menu */}
                  <TableCell className="py-4">
                    <DropdownMenu>
                      <DropdownMenuTrigger className="h-8 w-8 p-0 inline-flex items-center justify-center hover:bg-stone-100 rounded-lg border border-stone-200/50">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4 text-stone-500" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="rounded-lg font-semibold text-xs uppercase tracking-wider border-stone-200">
                        <DropdownMenuLabel className="text-[10px] text-stone-400 tracking-widest">Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => router.push(`/admin/orders/${order.id}`)} className="text-slate-700 cursor-pointer flex items-center justify-between">
                          <span>View Details</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => resendEmail(order.id)}
                          disabled={order.status !== "PAID" || loadingAction === `resend-${order.id}`}
                          className="text-slate-700 cursor-pointer"
                        >
                          <Mail className="mr-2 h-3.5 w-3.5 text-[#b89047]" />
                          Resend Access Email
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => issueRefund(order.id)}
                          disabled={order.status !== "PAID" || loadingAction === `refund-${order.id}`}
                          className="text-rose-600 focus:text-rose-600 focus:bg-rose-50 cursor-pointer"
                        >
                          <Undo2 className="mr-2 h-3.5 w-3.5 text-rose-600" />
                          Issue Refund
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {initialOrders.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-stone-400 text-xs font-semibold uppercase tracking-widest italic">
                    No orders found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
