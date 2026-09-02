import { Mail, Phone, MapPin } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-16 bg-white text-slate-800 antialiased">
      
      {/* Header Info */}
      <div className="text-center max-w-2xl mx-auto mb-16">
        <span className="text-[10px] font-bold tracking-[0.25em] text-[#b89047] uppercase block mb-3">Get in Touch</span>
        <h1 className="text-3xl md:text-4xl font-serif text-slate-900 font-normal tracking-tight mb-4">Contact Us</h1>
        <p className="text-sm text-stone-500 leading-relaxed uppercase font-semibold tracking-wider">
          We&apos;re here to help you with your architectural and blueprint acquisition needs
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Email */}
        <div className="bg-stone-50/50 border border-stone-200 rounded-lg p-8 flex flex-col items-center justify-between text-center group hover:border-[#b89047]/30 transition-all duration-300">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 flex items-center justify-center border border-stone-200 bg-white mb-6 text-slate-500 group-hover:text-[#b89047] rounded-lg transition-colors">
              <Mail className="w-5 h-5 stroke-1" />
            </div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-2">Email Support</h2>
            <p className="text-xs text-stone-500 uppercase tracking-widest font-semibold mb-6">Get in touch via email</p>
          </div>
          <a href="mailto:support@moryadesigns.com" className="text-sm font-bold text-[#b89047] hover:text-[#c5a880] transition-colors uppercase tracking-wider">
            support@moryadesigns.com
          </a>
        </div>

        {/* Phone */}
        <div className="bg-stone-50/50 border border-stone-200 rounded-lg p-8 flex flex-col items-center justify-between text-center group hover:border-[#b89047]/30 transition-all duration-300">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 flex items-center justify-center border border-stone-200 bg-white mb-6 text-slate-500 group-hover:text-[#b89047] rounded-lg transition-colors">
              <Phone className="w-5 h-5 stroke-1" />
            </div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-2">Phone Support</h2>
            <p className="text-xs text-stone-500 uppercase tracking-widest font-semibold mb-6">Mon-Fri from 9am to 6pm IST</p>
          </div>
          <a href="tel:+919876543210" className="text-sm font-bold text-slate-900 hover:text-[#b89047] transition-colors uppercase tracking-wider">
            +91 98765 43210
          </a>
        </div>

        {/* Office */}
        <div className="bg-stone-50/50 border border-stone-200 rounded-lg p-8 flex flex-col items-center text-center group hover:border-[#b89047]/30 transition-all duration-300">
          <div className="w-12 h-12 flex items-center justify-center border border-stone-200 bg-white mb-6 text-slate-500 group-hover:text-[#b89047] rounded-lg transition-colors">
            <MapPin className="w-5 h-5 stroke-1" />
          </div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-2">Corporate Office</h2>
          <p className="text-xs text-stone-500 uppercase tracking-widest font-semibold mb-4">Headquarters</p>
          <div className="text-xs text-stone-500 leading-relaxed font-semibold">
            Morya Design Firm<br/>
            123 Architecture Lane<br/>
            Mumbai, MH 400001 • India
          </div>
        </div>

      </div>
    </div>
  );
}
