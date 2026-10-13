const fs = require('fs');
let content = fs.readFileSync('src/app/(public)/page.tsx', 'utf8');

const replacement = `            {/* Right Side: Large Architectural Image Area */}
            <div className="lg:col-span-6 relative w-full flex justify-center lg:justify-end animate-in fade-in zoom-in-95 duration-1000 delay-200 fill-mode-both">
              <div className="relative w-full max-w-[500px] aspect-[4/5] sm:aspect-square lg:aspect-[4/5] bg-stone-100 rounded-[24px] overflow-hidden shadow-2xl group border border-white/50">
                {featuredDesigns[0] ? (
                  <Link href={\`/designs/\${featuredDesigns[0].slug}\`} className="block w-full h-full">
                    {/* Visual Image */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={featuredDesigns[0].images?.[0]?.url || "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"} 
                      alt={featuredDesigns[0].title} 
                      className="w-full h-full object-cover transform scale-100 group-hover:scale-105 transition-transform duration-[1.5s] ease-out"
                    />
                    
                    {/* Gradient overlay for contrast */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-slate-900/10 to-transparent opacity-80 group-hover:opacity-60 transition-opacity duration-700 pointer-events-none"></div>

                    {/* Floating Architectural Details Badge (Top Right) */}
                    <div className="absolute top-6 right-6 bg-white/95 backdrop-blur-md p-3 rounded-xl border border-white shadow-xl transform translate-x-2 -translate-y-2 group-hover:translate-x-0 group-hover:translate-y-0 transition-transform duration-700">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center">
                          <Ruler className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-[9px] font-bold text-stone-500 uppercase tracking-widest">Dimension</p>
                          <p className="font-serif font-bold text-sm text-slate-900">{formatPlotSize(featuredDesigns[0].plotWidthFt, featuredDesigns[0].plotLengthFt)}</p>
                        </div>
                      </div>
                    </div>

                    {/* Main Floating Info Card (Bottom Left) */}
                    <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur-md p-5 rounded-xl border border-white shadow-xl transform -translate-y-2 group-hover:translate-y-0 transition-transform duration-700">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <span className="text-[9px] font-bold text-[#b89047] uppercase tracking-widest block mb-1">FEATURED PLAN</span>
                          <h3 className="font-serif font-bold text-lg text-slate-900">{featuredDesigns[0].title}</h3>
                        </div>
                        <span className="font-mono font-bold text-base text-slate-900 bg-stone-100 px-2 py-1 rounded-md">{formatPrice(featuredDesigns[0].priceInr)}</span>
                      </div>
                      
                      <div className="flex items-center justify-between pt-4 border-t border-stone-100 mt-2">
                        <div className="flex gap-4 text-[10px] text-stone-600 font-bold uppercase tracking-wider">
                          <span>{featuredDesigns[0].bhk} Beds</span>
                          <span className="w-1 h-1 bg-stone-300 rounded-full my-auto"></span>
                          <span>{featuredDesigns[0].bathrooms} Baths</span>
                          <span className="w-1 h-1 bg-stone-300 rounded-full my-auto"></span>
                          <span>{featuredDesigns[0].facing} Facing</span>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-[#b89047]/10 flex items-center justify-center group-hover:bg-[#b89047] transition-colors duration-300">
                          <ArrowRight className="w-4 h-4 text-[#b89047] group-hover:text-white transition-colors" />
                        </div>
                      </div>
                    </div>
                  </Link>
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-stone-100">
                    <p className="text-stone-400 font-semibold">No featured design available</p>
                  </div>
                )}
              </div>
            </div>`;

const startIndex = content.indexOf('{/* Right Side: Large Architectural Image Area */}');
const endIndex = content.indexOf('</div>\n            </div>\n\n          </div>\n        </div>\n      </section>');

if (startIndex !== -1 && endIndex !== -1) {
  content = content.substring(0, startIndex) + replacement + content.substring(endIndex);
  fs.writeFileSync('src/app/(public)/page.tsx', content);
  console.log("Successfully replaced Hero section");
} else {
  console.log("Could not find start or end index.");
}
