"use client";

import { useState } from "react";
import { Loader2, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getProjectTodayDateString, validateConsultationDate } from "@/lib/date";
import Link from "next/link";

interface ConsultationDesign {
  id: string;
  title: string;
  slug?: string;
  images?: Array<{ url: string }>;
}

interface ConsultationFormProps {
  design: ConsultationDesign | null;
  userDetails: { name: string; email: string; mobile: string } | null;
}

export function ConsultationForm({ design, userDetails }: ConsultationFormProps) {
  const [formData, setFormData] = useState({
    name: userDetails?.name || "",
    email: userDetails?.email || "",
    mobile: userDetails?.mobile || "",
    message: "",
    preferredDate: "",
    preferredTime: ""
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dateError, setDateError] = useState("");
  const [success, setSuccess] = useState(false);
  const [consultationId, setConsultationId] = useState("");

  // Minimum date is dynamically computed in the project timezone (Asia/Kolkata)
  const minDate = getProjectTodayDateString();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "preferredDate") {
      if (value) {
        const validation = validateConsultationDate(value);
        if (!validation.valid) {
          setDateError(validation.error || "Preferred consultation date cannot be in the past.");
        } else {
          setDateError("");
          if (error.includes("date")) setError("");
        }
      } else {
        setDateError("");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!formData.name || !formData.email || !formData.mobile || !formData.message) {
      setError("Please fill in all required fields.");
      return;
    }
    
    if (!/^[0-9]{10}$/.test(formData.mobile)) {
      setError("Mobile number must be exactly 10 digits.");
      return;
    }

    // Validate preferredDate if selected
    if (formData.preferredDate) {
      const dateValidation = validateConsultationDate(formData.preferredDate);
      if (!dateValidation.valid) {
        const errMessage = dateValidation.error || "Preferred consultation date cannot be in the past. Please select today or a future date.";
        setError(errMessage);
        setDateError(errMessage);
        return;
      }
    }

    setLoading(true);
    try {
      const res = await fetch("/api/consultations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          designId: design?.id
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit request.");
      
      setConsultationId(data.consultation.id);
      setSuccess(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to submit request.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-stone-50 border border-stone-200 rounded-xl p-10 text-center shadow-sm">
        <CheckCircle2 className="w-16 h-16 text-emerald-600 mx-auto mb-6" />
        <h2 className="text-2xl font-serif text-slate-900 mb-2">Consultation Request Submitted</h2>
        <p className="text-sm text-slate-600 mb-8 max-w-md mx-auto leading-relaxed">
          Thank you! Your consultation request has been received. Our team will contact you soon.
        </p>
        
        <div className="bg-white p-4 rounded-lg border border-stone-200 inline-block mb-8">
          <span className="text-[10px] font-bold uppercase tracking-widest text-stone-500 block mb-1">Consultation ID</span>
          <span className="font-mono text-slate-900 font-bold">{consultationId}</span>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link 
            href="/account"
            className="flex items-center justify-center w-full sm:w-auto h-12 px-6 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-widest rounded-lg transition-colors"
          >
            View My Consultations
          </Link>
          <Link 
            href="/designs"
            className="flex items-center justify-center w-full sm:w-auto h-12 px-6 bg-white hover:bg-stone-50 border border-stone-200 text-slate-700 text-xs font-bold uppercase tracking-widest rounded-lg transition-colors"
          >
            Browse More Designs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 bg-white border border-stone-200 p-8 rounded-xl shadow-sm">
      
      {design && (
        <div className="bg-stone-50 border border-stone-200 p-4 rounded-lg flex items-center gap-4">
          {design.images?.[0] && (
            <div className="w-16 h-16 rounded-md overflow-hidden shrink-0 border border-stone-200">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={design.images[0].url} alt={design.title} className="w-full h-full object-cover" />
            </div>
          )}
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#b89047] block mb-1">Consultation For</span>
            <h3 className="font-serif font-semibold text-slate-900 text-base">{design.title}</h3>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="text-[10px] font-bold uppercase tracking-widest text-stone-500 block mb-2">Full Name *</label>
          <Input 
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="h-11 border-stone-200 focus-visible:ring-[#b89047]"
            placeholder="John Doe"
          />
        </div>
        <div>
          <label className="text-[10px] font-bold uppercase tracking-widest text-stone-500 block mb-2">Email Address *</label>
          <Input 
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            className="h-11 border-stone-200 focus-visible:ring-[#b89047]"
            placeholder="john@example.com"
          />
        </div>
        <div>
          <label className="text-[10px] font-bold uppercase tracking-widest text-stone-500 block mb-2">Mobile Number *</label>
          <Input 
            name="mobile"
            type="tel"
            value={formData.mobile}
            onChange={handleChange}
            className="h-11 border-stone-200 focus-visible:ring-[#b89047]"
            placeholder="10-digit mobile number"
            maxLength={10}
          />
        </div>
        <div></div>
        <div>
          <label htmlFor="preferredDate" className="text-[10px] font-bold uppercase tracking-widest text-stone-500 block mb-2">
            Preferred Date (Optional)
          </label>
          <Input 
            id="preferredDate"
            name="preferredDate"
            type="date"
            min={minDate}
            value={formData.preferredDate}
            onChange={handleChange}
            className={`h-11 border-stone-200 focus-visible:ring-[#b89047] ${
              dateError ? "border-rose-400 focus-visible:ring-rose-400 text-rose-900" : ""
            }`}
            aria-invalid={!!dateError}
            aria-describedby={dateError ? "date-error-msg" : "date-help-msg"}
          />
          {dateError ? (
            <p id="date-error-msg" className="text-[11px] font-semibold text-rose-600 mt-1.5">
              {dateError}
            </p>
          ) : (
            <p id="date-help-msg" className="text-[10px] text-stone-400 mt-1 font-medium">
              Select today or any upcoming date
            </p>
          )}
        </div>
        <div>
          <label className="text-[10px] font-bold uppercase tracking-widest text-stone-500 block mb-2">Preferred Time (Optional)</label>
          <select 
            name="preferredTime"
            value={formData.preferredTime}
            onChange={handleChange}
            className="w-full h-11 border border-stone-200 rounded-lg px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b89047] focus-visible:border-transparent bg-white text-slate-800"
          >
            <option value="">Any Time</option>
            <option value="Morning (10AM - 12PM)">Morning (10AM - 12PM)</option>
            <option value="Afternoon (12PM - 4PM)">Afternoon (12PM - 4PM)</option>
            <option value="Evening (4PM - 7PM)">Evening (4PM - 7PM)</option>
          </select>
        </div>
      </div>

      <div>
        <label className="text-[10px] font-bold uppercase tracking-widest text-stone-500 block mb-2">Your Message *</label>
        <textarea 
          name="message"
          value={formData.message}
          onChange={handleChange}
          className="w-full h-32 border border-stone-200 rounded-lg p-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b89047] resize-none"
          placeholder="Tell us about your requirements, plot size, or any specific questions..."
        />
      </div>

      {error && <div className="text-xs font-bold text-rose-600 bg-rose-50 p-3 rounded-lg border border-rose-200/50 uppercase tracking-wider">{error}</div>}

      <div className="pt-4 border-t border-stone-100 flex justify-end">
        <Button 
          type="submit" 
          disabled={loading}
          className="h-12 px-8 bg-[#b89047] hover:bg-[#b89047]/90 text-white text-xs font-bold uppercase tracking-widest rounded-lg flex items-center gap-2 transition-all w-full md:w-auto shadow-md hover:shadow-lg border border-[#b89047]"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Submit Request <ArrowRight className="w-4 h-4" /></>}
        </Button>
      </div>
    </form>
  );
}
