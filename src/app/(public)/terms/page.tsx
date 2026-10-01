export default function TermsOfServicePage() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-16 bg-white text-slate-800 antialiased">
      <div className="max-w-3xl mx-auto">
        <span className="text-[10px] font-bold tracking-[0.25em] text-[#b89047] uppercase block mb-3">Legal Guidelines</span>
        <h1 className="text-3xl md:text-4xl font-serif text-slate-900 font-normal tracking-tight mb-4 pb-2 border-b border-stone-200">
          Terms & Conditions
        </h1>
        <p className="text-xs text-stone-400 font-mono mb-8 uppercase tracking-wider">
          Last updated: {new Date().toLocaleDateString("en-IN", { day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
        
        <div className="prose prose-stone max-w-none text-sm text-stone-600 leading-relaxed space-y-8">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-2">1. Digital Products</h2>
            <p>Morya Design Firm provides digital architectural blueprints, including DWG, PDF, and 3D rendering formats. Upon successful payment, these files are delivered instantly.</p>
          </div>
          
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-2">2. License Agreement</h2>
            <p>By purchasing a design, you are granted a single-use license to build one (1) structure. You may not resell, redistribute, or publish our proprietary CAD files and designs.</p>
          </div>

          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-2">3. Disclaimer of Liability</h2>
            <p>While our plans are drafted to professional standards and Vastu compliance, it is the buyer&apos;s responsibility to have the plans reviewed by a local structural engineer to ensure compliance with local building codes, soil conditions, and municipal regulations before commencement of construction.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
