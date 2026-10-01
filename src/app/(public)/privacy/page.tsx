export default function PrivacyPolicyPage() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-16 bg-white text-slate-800 antialiased">
      <div className="max-w-3xl mx-auto">
        <span className="text-[10px] font-bold tracking-[0.25em] text-[#b89047] uppercase block mb-3">Legal Guidelines</span>
        <h1 className="text-3xl md:text-4xl font-serif text-slate-900 font-normal tracking-tight mb-4 pb-2 border-b border-stone-200">
          Privacy Policy
        </h1>
        <p className="text-xs text-stone-400 font-mono mb-8 uppercase tracking-wider">
          Last updated: {new Date().toLocaleDateString("en-IN", { day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
        
        <div className="prose prose-stone max-w-none text-sm text-stone-600 leading-relaxed space-y-8">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-2">1. Information We Collect</h2>
            <p>When you purchase an architectural design from Morya Design Firm, we collect your email address and payment details via Razorpay to process and deliver your digital files.</p>
          </div>
          
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-2">2. How We Use Your Information</h2>
            <p>We use your information exclusively to:</p>
            <ul className="list-disc pl-5 mt-2 space-y-2">
              <li>Deliver your purchased digital CAD files and PDF blueprints.</li>
              <li>Send you invoices and payment confirmations.</li>
              <li>Provide customer support regarding your order.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-2">3. Data Security</h2>
            <p>We do not store your credit card details. All payments are securely processed by Razorpay. Your order records and magic download links are encrypted using industry-standard AES-256-GCM.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
