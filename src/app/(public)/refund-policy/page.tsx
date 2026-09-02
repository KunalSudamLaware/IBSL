export default function RefundPolicyPage() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-16 bg-white text-slate-800 antialiased">
      <div className="max-w-3xl mx-auto">
        <span className="text-[10px] font-bold tracking-[0.25em] text-[#b89047] uppercase block mb-3">Legal Guidelines</span>
        <h1 className="text-3xl md:text-4xl font-serif text-slate-900 font-normal tracking-tight mb-4 pb-2 border-b border-stone-200">
          Refund Policy
        </h1>
        <p className="text-xs text-stone-400 font-mono mb-8 uppercase tracking-wider">
          Last updated: {new Date().toLocaleDateString("en-IN", { day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
        
        <div className="prose prose-stone max-w-none text-sm text-stone-600 leading-relaxed space-y-8">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-2">Digital Goods Return Policy</h2>
            <p>Because Morya Design Firm deals strictly in digital goods (CAD files, PDF blueprints, 3D renders) that are delivered instantly upon purchase, <strong className="text-slate-900">all sales are final.</strong></p>
          </div>
          
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-2">Exceptions</h2>
            <p>We will only issue refunds under the following circumstances:</p>
            <ul className="list-disc pl-5 mt-2 space-y-2">
              <li><strong>Duplicate Purchase:</strong> You accidentally purchased the exact same design twice within a 24-hour period.</li>
              <li><strong>Corrupted Files:</strong> The files delivered to you are corrupt and our technical support cannot provide you with a working copy.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-2">Contacting Us for a Refund</h2>
            <p>If you believe you qualify for a refund, please contact us within 7 days of your purchase using our Contact page. Provide your Invoice Number and the email address used for the purchase.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
