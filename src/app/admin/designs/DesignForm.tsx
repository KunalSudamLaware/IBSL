"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Save, CheckCircle } from "lucide-react";

interface DesignFormProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialData?: any;
  designId?: string;
}

export function DesignForm({ initialData, designId }: DesignFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const isEdit = !!designId;

  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    slug: initialData?.slug || "",
    description: initialData?.description || "",
    category: initialData?.category || "",
    styleTags: initialData?.styleTags ? initialData.styleTags.join(", ") : "",
    plotWidthFt: initialData?.plotWidthFt?.toString() || "",
    plotLengthFt: initialData?.plotLengthFt?.toString() || "",
    plotAreaSqft: initialData?.plotAreaSqft?.toString() || "",
    builtUpAreaSqft: initialData?.builtUpAreaSqft?.toString() || "",
    floors: initialData?.floors?.toString() || "",
    bhk: initialData?.bhk?.toString() || "",
    facing: initialData?.facing || "N",
    priceInr: initialData?.priceInr?.toString() || "",
    status: initialData?.status || "DRAFT",
  });

  const [images, setImages] = useState<File[]>([]);
  const [primaryImageIndex, setPrimaryImageIndex] = useState(0);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [existingImages, setExistingImages] = useState<any[]>(initialData?.images || []);
  
  const [dwgFile, setDwgFile] = useState<File | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [threeDFile, setThreeDFile] = useState<File | null>(null);

  useEffect(() => {
    if (formData.plotWidthFt && formData.plotLengthFt) {
      const area = Number(formData.plotWidthFt) * Number(formData.plotLengthFt);
      // eslint-disable-next-line
      setFormData(prev => ({ ...prev, plotAreaSqft: String(area) }));
    }
  }, [formData.plotWidthFt, formData.plotLengthFt]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const validFiles = files.filter(f => f.size <= 5 * 1024 * 1024 && f.type.startsWith('image/'));
      
      if (validFiles.length < files.length) {
        alert("Some images were skipped. Please ensure they are valid images under 5MB.");
      }

      setImages(prev => [...prev, ...validFiles]);
      setPreviewUrls(prev => [
        ...prev, 
        ...validFiles.map((file) => URL.createObjectURL(file))
      ]);
    }
  };

  const removeNewImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
    if (primaryImageIndex === index) setPrimaryImageIndex(0);
    else if (primaryImageIndex > index) setPrimaryImageIndex(prev => prev - 1);
  };

  const removeExistingImage = async (imageId: string) => {
    if (!confirm("Are you sure you want to remove this image?")) return;
    try {
      setExistingImages(prev => prev.filter(img => img.id !== imageId));
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent, isDraft: boolean) => {
    e.preventDefault();
    
    if (formData.title.trim() === "") return setError("Design Name is required");
    if (formData.slug.trim() === "") return setError("URL Slug is required");
    if (Number(formData.plotWidthFt) <= 0) return setError("Plot width must be greater than 0");
    if (Number(formData.plotLengthFt) <= 0) return setError("Plot length must be greater than 0");
    if (Number(formData.priceInr) < 0) return setError("Price cannot be negative");
    if (Number(formData.bhk) <= 0) return setError("BHK must be a valid number");
    if (Number(formData.floors) < 1) return setError("Floors must be at least 1");

    setLoading(true);
    setError("");

    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (key === "status") data.append(key, isDraft ? "DRAFT" : "PUBLISHED");
      else data.append(key, value);
    });

    if (images.length > 0) {
      const primaryImg = images[primaryImageIndex];
      const otherImgs = images.filter((_, i) => i !== primaryImageIndex);
      if (primaryImg) data.append("images", primaryImg);
      otherImgs.forEach((img) => data.append("images", img));
    }

    if (dwgFile) data.append("dwgFile", dwgFile);
    if (pdfFile) data.append("pdfFile", pdfFile);
    if (threeDFile) data.append("threeDFile", threeDFile);

    try {
      const url = isEdit ? `/api/admin/designs/${designId}` : "/api/admin/designs";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, { method, body: data });
      const result = await res.json();

      if (!res.ok) throw new Error(result.error || "Failed to save design");

      router.push("/admin/designs");
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred");
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="space-y-8 text-slate-800" onSubmit={(e) => e.preventDefault()}>
      {error && (
        <div className="bg-rose-50 border border-rose-100 text-rose-800 p-4 rounded-lg text-xs font-semibold uppercase tracking-wider text-center">
          {error}
        </div>
      )}

      {/* BASIC INFORMATION */}
      <Card className="border-stone-200 shadow-sm rounded-lg overflow-hidden">
        <CardHeader className="bg-stone-50/50 border-b border-stone-150 py-4 px-6">
          <CardTitle className="text-sm font-serif font-semibold uppercase tracking-wider text-slate-900">Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-xs font-semibold uppercase tracking-wider text-slate-700">Design Name *</Label>
              <Input id="title" name="title" required value={formData.title} onChange={handleInputChange} className="border-stone-200 h-11 rounded-lg text-sm focus-visible:ring-1 focus-visible:ring-[#b89047]" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug" className="text-xs font-semibold uppercase tracking-wider text-slate-700">URL Slug *</Label>
              <Input id="slug" name="slug" required value={formData.slug} onChange={handleInputChange} className="border-stone-200 h-11 rounded-lg text-sm focus-visible:ring-1 focus-visible:ring-[#b89047]" placeholder="e.g. modern-3bhk-villa" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="category" className="text-xs font-semibold uppercase tracking-wider text-slate-700">Category *</Label>
            <Input id="category" name="category" placeholder="e.g. Villa" required value={formData.category} onChange={handleInputChange} className="border-stone-200 h-11 rounded-lg text-sm focus-visible:ring-1 focus-visible:ring-[#b89047]" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description" className="text-xs font-semibold uppercase tracking-wider text-slate-700">Description</Label>
            <Textarea id="description" name="description" rows={5} value={formData.description} onChange={handleInputChange} className="border-stone-200 rounded-lg text-sm resize-none focus-visible:ring-1 focus-visible:ring-[#b89047]" />
          </div>
        </CardContent>
      </Card>

      {/* PLOT INFORMATION */}
      <Card className="border-stone-200 shadow-sm rounded-lg overflow-hidden">
        <CardHeader className="bg-stone-50/50 border-b border-stone-150 py-4 px-6">
          <CardTitle className="text-sm font-serif font-semibold uppercase tracking-wider text-slate-900">Plot Information</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="plotWidthFt" className="text-xs font-semibold uppercase tracking-wider text-slate-700">Plot Width (ft) *</Label>
              <Input id="plotWidthFt" name="plotWidthFt" type="number" required value={formData.plotWidthFt} onChange={handleInputChange} className="border-stone-200 h-11 rounded-lg text-sm focus-visible:ring-1 focus-visible:ring-[#b89047]" min="1" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="plotLengthFt" className="text-xs font-semibold uppercase tracking-wider text-slate-700">Plot Length (ft) *</Label>
              <Input id="plotLengthFt" name="plotLengthFt" type="number" required value={formData.plotLengthFt} onChange={handleInputChange} className="border-stone-200 h-11 rounded-lg text-sm focus-visible:ring-1 focus-visible:ring-[#b89047]" min="1" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="plotAreaSqft" className="text-xs font-semibold uppercase tracking-wider text-slate-700">Plot Area (sq.ft) *</Label>
              <Input id="plotAreaSqft" name="plotAreaSqft" type="number" required readOnly value={formData.plotAreaSqft} className="bg-stone-50 border-stone-200 h-11 rounded-lg text-sm cursor-not-allowed text-stone-550 font-mono" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* PROPERTY DETAILS */}
      <Card className="border-stone-200 shadow-sm rounded-lg overflow-hidden">
        <CardHeader className="bg-stone-50/50 border-b border-stone-150 py-4 px-6">
          <CardTitle className="text-sm font-serif font-semibold uppercase tracking-wider text-slate-900">Property Details</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="space-y-2">
              <Label htmlFor="builtUpAreaSqft" className="text-xs font-semibold uppercase tracking-wider text-slate-700">Built-up Area (sq.ft) *</Label>
              <Input id="builtUpAreaSqft" name="builtUpAreaSqft" type="number" required value={formData.builtUpAreaSqft} onChange={handleInputChange} className="border-stone-200 h-11 rounded-lg text-sm focus-visible:ring-1 focus-visible:ring-[#b89047]" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bhk" className="text-xs font-semibold uppercase tracking-wider text-slate-700">BHK *</Label>
              <Input id="bhk" name="bhk" type="number" required value={formData.bhk} onChange={handleInputChange} className="border-stone-200 h-11 rounded-lg text-sm focus-visible:ring-1 focus-visible:ring-[#b89047]" min="1" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="floors" className="text-xs font-semibold uppercase tracking-wider text-slate-700">Number of Floors *</Label>
              <Input id="floors" name="floors" type="number" required value={formData.floors} onChange={handleInputChange} className="border-stone-200 h-11 rounded-lg text-sm focus-visible:ring-1 focus-visible:ring-[#b89047]" min="1" />
            </div>
            <div className="space-y-2 flex flex-col justify-end">
              <Label className="text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">Facing Direction *</Label>
              <Select value={formData.facing} onValueChange={(val) => handleSelectChange("facing", val)}>
                <SelectTrigger className="border-stone-200 h-11 rounded-lg text-xs focus:ring-1 focus:ring-[#b89047]">
                  <SelectValue placeholder="Select facing" />
                </SelectTrigger>
                <SelectContent className="rounded-lg">
                  <SelectItem value="N" className="text-xs uppercase tracking-wider font-semibold">North</SelectItem>
                  <SelectItem value="S" className="text-xs uppercase tracking-wider font-semibold">South</SelectItem>
                  <SelectItem value="E" className="text-xs uppercase tracking-wider font-semibold">East</SelectItem>
                  <SelectItem value="W" className="text-xs uppercase tracking-wider font-semibold">West</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div className="space-y-2">
              <Label htmlFor="styleTags" className="text-xs font-semibold uppercase tracking-wider text-slate-700">Style Tags</Label>
              <Input id="styleTags" name="styleTags" placeholder="Modern, Vastu, Minimal (Comma Separated)" value={formData.styleTags} onChange={handleInputChange} className="border-stone-200 h-11 rounded-lg text-sm focus-visible:ring-1 focus-visible:ring-[#b89047]" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="priceInr" className="text-xs font-semibold uppercase tracking-wider text-slate-700">Price (INR) *</Label>
              <Input id="priceInr" name="priceInr" type="number" required value={formData.priceInr} onChange={handleInputChange} className="border-stone-200 h-11 rounded-lg text-sm focus-visible:ring-1 focus-visible:ring-[#b89047]" min="0" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* IMAGES */}
      <Card className="border-stone-200 shadow-sm rounded-lg overflow-hidden">
        <CardHeader className="bg-stone-50/50 border-b border-stone-150 py-4 px-6">
          <CardTitle className="text-sm font-serif font-semibold uppercase tracking-wider text-slate-900">Preview Images</CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          
          {/* Existing Images */}
          {existingImages.length > 0 && (
            <div className="mb-6">
              <Label className="text-xs font-semibold uppercase tracking-wider text-stone-500 mb-3 block">Currently Uploaded Images</Label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {existingImages.map((img) => (
                  <div key={img.id} className="relative aspect-square rounded-lg border border-stone-200 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img.url} alt="Preview" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => removeExistingImage(img.id)} className="absolute top-2 right-2 bg-slate-900/80 text-white rounded-lg p-1.5 hover:bg-rose-600 transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                    {img.isPrimary && (
                      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-emerald-600 text-white text-[9px] px-2 py-0.5 rounded-lg font-bold uppercase tracking-wider flex items-center gap-1 shadow-sm">
                        <CheckCircle className="w-3 h-3" /> Primary
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2 block">Upload Images</Label>
            <Input id="images" name="images" type="file" multiple accept="image/*" onChange={handleImageChange} className="file:bg-stone-100 file:text-slate-900 file:border-0 file:rounded-lg file:px-4 file:mr-4 file:font-semibold border-stone-250 w-full h-11 file:h-11 file:cursor-pointer" />
          </div>
          
          {previewUrls.length > 0 && (
            <div className="mt-6">
              <Label className="text-xs font-semibold uppercase tracking-wider text-stone-500 mb-3 block">New Images to Upload</Label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {previewUrls.map((url, idx) => (
                  <div key={url} className={`relative aspect-square rounded-lg border-2 overflow-hidden ${primaryImageIndex === idx ? 'border-[#b89047]' : 'border-stone-200'}`}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt="Preview" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => removeNewImage(idx)} className="absolute top-2 right-2 bg-slate-900/80 text-white rounded-lg p-1.5 hover:bg-rose-600 transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                    {primaryImageIndex !== idx && (
                      <button type="button" onClick={() => setPrimaryImageIndex(idx)} className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-slate-900/90 text-white text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded-lg hover:bg-[#b89047] transition-all whitespace-nowrap">
                        Set Primary
                      </button>
                    )}
                    {primaryImageIndex === idx && (
                      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-emerald-600 text-white text-[9px] px-2 py-0.5 rounded-lg font-bold uppercase tracking-wider flex items-center gap-1 shadow-sm whitespace-nowrap">
                        <CheckCircle className="w-3 h-3" /> Primary
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* DELIVERABLES */}
      <Card className="border-stone-200 shadow-sm rounded-lg overflow-hidden">
        <CardHeader className="bg-stone-50/50 border-b border-stone-150 py-4 px-6">
          <CardTitle className="text-sm font-serif font-semibold uppercase tracking-wider text-slate-900">Deliverable Files</CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="dwgFile" className="text-xs font-semibold uppercase tracking-wider text-slate-700">DWG CAD File</Label>
            {initialData?.files?.some((f: any) => f.fileType === "DWG") && !dwgFile && (
              <div className="mb-2 flex items-center gap-2 p-2 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-lg text-[10px] font-bold uppercase tracking-widest w-fit">
                <CheckCircle className="w-3.5 h-3.5" /> DWG Available
              </div>
            )}
            <Input id="dwgFile" name="dwgFile" type="file" accept=".dwg" onChange={(e) => setDwgFile(e.target.files?.[0] || null)} className="border-stone-250 file:bg-stone-100 file:text-slate-900 file:border-0 file:rounded-lg file:px-4 file:mr-4 file:font-semibold w-full h-11 file:h-11 file:cursor-pointer" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pdfFile" className="text-xs font-semibold uppercase tracking-wider text-slate-700">PDF File (Documentation & Floor Plan)</Label>
            {initialData?.files?.some((f: any) => f.fileType === "PDF") && !pdfFile && (
              <div className="mb-2 flex items-center gap-2 p-2 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-lg text-[10px] font-bold uppercase tracking-widest w-fit">
                <CheckCircle className="w-3.5 h-3.5" /> PDF Available
              </div>
            )}
            <Input id="pdfFile" name="pdfFile" type="file" accept=".pdf" onChange={(e) => setPdfFile(e.target.files?.[0] || null)} className="border-stone-250 file:bg-stone-100 file:text-slate-900 file:border-0 file:rounded-lg file:px-4 file:mr-4 file:font-semibold w-full h-11 file:h-11 file:cursor-pointer" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="threeDFile" className="text-xs font-semibold uppercase tracking-wider text-slate-700">3D File / Elevation (Optional)</Label>
            <Input id="threeDFile" name="threeDFile" type="file" onChange={(e) => setThreeDFile(e.target.files?.[0] || null)} className="border-stone-250 file:bg-stone-100 file:text-slate-900 file:border-0 file:rounded-lg file:px-4 file:mr-4 file:font-semibold w-full h-11 file:h-11 file:cursor-pointer" />
          </div>
        </CardContent>
      </Card>

      {/* ACTIONS */}
      <div className="flex flex-col sm:flex-row justify-end gap-4 border-t border-stone-200 pt-8">
        {isEdit && formData.slug && (
          <Link 
            href={`/designs/${formData.slug}`} 
            target="_blank"
            className="inline-flex items-center justify-center h-11 px-5 border border-stone-300 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-stone-50 transition-colors sm:mr-auto"
          >
            View Public Design
          </Link>
        )}

        <Button 
          type="button" 
          variant="outline" 
          className="w-full sm:w-auto border-stone-300 text-xs font-bold uppercase tracking-widest h-11 rounded-lg" 
          onClick={() => router.push("/admin/designs")} 
          disabled={loading}
        >
          Cancel
        </Button>
        {!isEdit && (
          <Button 
            type="button" 
            variant="outline" 
            className="w-full sm:w-auto bg-stone-150 hover:bg-stone-200 text-slate-800 border-none text-xs font-bold uppercase tracking-widest h-11 rounded-lg" 
            onClick={(e) => handleSubmit(e, true)} 
            disabled={loading}
          >
            <Save className="w-4 h-4 mr-2" /> Save Draft
          </Button>
        )}
        <Button 
          type="button" 
          className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold tracking-widest uppercase h-11 rounded-lg border border-slate-900" 
          onClick={(e) => handleSubmit(e, false)} 
          disabled={loading}
        >
          {loading ? "Saving..." : isEdit ? "Save Changes" : "Publish Design"}
        </Button>
      </div>
    </form>
  );
}
