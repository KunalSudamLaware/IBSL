export default function AboutPage() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-16 bg-white text-slate-800 antialiased">
      <div className="max-w-3xl mx-auto text-center">
        <span className="text-[10px] font-bold tracking-[0.25em] text-[#b89047] uppercase block mb-3">Our History</span>
        <h1 className="text-3xl md:text-4xl font-serif text-slate-900 font-normal tracking-tight mb-8">About Us</h1>
        
        <div className="bg-stone-50/50 p-8 md:p-12 border border-stone-200 rounded-lg text-left space-y-6 shadow-sm">
          <p className="text-sm text-stone-600 leading-relaxed font-semibold">
            Welcome to Morya Design Firm. We specialize in premium architectural house plans, 3D elevations, and structural blueprints for modern homes.
          </p>
          <p className="text-sm text-stone-600 leading-relaxed">
            Our mission is to make high-quality architectural design accessible and affordable, allowing you to instantly download ready-to-build CAD plans for your dream home.
          </p>
          
          <div className="mt-8 pt-8 border-t border-stone-200">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-2">More Information Coming Soon</h2>
            <p className="text-xs text-stone-450 font-semibold uppercase tracking-wider">We are currently updating our company profile.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
