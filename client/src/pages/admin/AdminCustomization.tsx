import { ChangeEvent, useEffect, useState } from "react";
import { Link } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
import StoreSystemPagesEditor from "@/components/owner/StoreSystemPagesEditor";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  defaultDesignProfile,
  designPalettes,
  designTypography,
  type DesignProfile,
  type StoreNavigationItem,
} from "@/hooks/useDesignProfile";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  CheckCircle2,
  Eye,
  FileText,
  ImagePlus,
  Info,
  LayoutPanelTop,
  Loader2,
  MonitorUp,
  Palette,
  RotateCcw,
  Save,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Type,
  Upload,
} from "lucide-react";

type ImageField = "brandLogoUrl" | "faviconUrl" | "highlightImageUrl" | "storyImageUrl" | "editorialImageUrl" | "shopEditorialImageUrl";

type ImageEditorProps = {
  id: string;
  label: string;
  description: string;
  value: string;
  onChange: (value: string) => void;
  onUpload: (event: ChangeEvent<HTMLInputElement>) => void;
  isUploading: boolean;
};

function ImageEditor({ id, label, description, value, onChange, onUpload, isUploading }: ImageEditorProps) {
  return (
    <div className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-4 sm:grid-cols-[168px_1fr] sm:p-5">
      <div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-slate-100">
        {value ? <img src={value} alt={`Aperçu : ${label}`} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-slate-400"><ImagePlus className="h-7 w-7" /></div>}
      </div>
      <div className="space-y-3">
        <div><Label htmlFor={id} className="text-sm font-semibold text-slate-900">{label}</Label><p className="mt-1 text-xs leading-5 text-slate-500">{description}</p></div>
        <div className="flex flex-col gap-2 sm:flex-row"><Input id={id} value={value} onChange={event => onChange(event.target.value)} placeholder="https://… ou /manus-storage/…" /><label className="inline-flex shrink-0 cursor-pointer items-center justify-center rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"><Upload className="mr-2 h-4 w-4" />{isUploading ? "Envoi…" : "Téléverser"}<input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={onUpload} disabled={isUploading} /></label></div>
        <p className="text-xs text-slate-500">JPEG, PNG ou WebP, jusqu’à 5 Mo. Vous pouvez aussi coller l’URL d’une image déjà hébergée.</p>
      </div>
    </div>
  );
}

const navigationSystemLabels: Record<string, string> = {
  home: "Accueil",
  shop: "Boutique",
  categories: "Catégories",
  creations: "Créations",
  new: "Nouveautés",
  "best-sellers": "Best-sellers",
  promos: "Promotions",
  contact: "Contact",
};

const footerSocialLabels: Record<string, string> = {
  instagram: "Instagram",
  facebook: "Facebook",
  tiktok: "TikTok",
  youtube: "YouTube",
  pinterest: "Pinterest",
  linkedin: "LinkedIn",
};

export default function AdminCustomization() {
  const [form, setForm] = useState<DesignProfile>(defaultDesignProfile);
  const designQuery = trpc.admin.design.get.useQuery();
  const updateDesign = trpc.admin.design.update.useMutation();
  const uploadImage = trpc.admin.design.uploadImage.useMutation();

  useEffect(() => {
    if (designQuery.data) setForm(designQuery.data as DesignProfile);
  }, [designQuery.data]);

  const setField = <K extends keyof DesignProfile>(field: K, value: DesignProfile[K]) => {
    setForm(current => ({ ...current, [field]: value }));
  };
  const setCatalogueCopyField = <K extends keyof Pick<DesignProfile,
    "promosTitle" | "promosLead" | "promosBannerTitle" | "promosBannerText" | "promosEmptyText" | "promosAllProductsLabel"
    | "newArrivalsTitle" | "newArrivalsLead" | "newArrivalsEmptyText"
    | "bestSellersTitle" | "bestSellersLead" | "bestSellersTopLabel" | "bestSellersEmptyText"
  >>(field: K, value: DesignProfile[K]) => {
    setForm(current => ({ ...current, [field]: value, cataloguePageCopyCustomized: true }));
  };
  const updateNavigationItem = (id: string, changes: Partial<StoreNavigationItem>) => setField("navigationItems", form.navigationItems.map(item => item.id === id ? { ...item, ...changes } : item));
  const moveNavigationItem = (id: string, offset: -1 | 1) => setForm(current => {
    const index = current.navigationItems.findIndex(item => item.id === id);
    const target = index + offset;
    if (index < 0 || target < 0 || target >= current.navigationItems.length) return current;
    const items = [...current.navigationItems];
    [items[index], items[target]] = [items[target], items[index]];
    return { ...current, navigationItems: items };
  });
  const addCustomNavigationItem = () => setForm(current => ({
    ...current,
    navigationItems: [...current.navigationItems, { id: `custom-lien-${Date.now()}`, label: "Nouvel onglet", href: "/boutique", visible: true, kind: "custom" }],
  }));
  const removeNavigationItem = (id: string) => setField("navigationItems", form.navigationItems.filter(item => item.id !== id).map(item => item.parentId === id ? { ...item, parentId: undefined } : item));
  const setFooterSocialUrl = (id: string, url: string) => setField("footerSocialLinks", form.footerSocialLinks.map(link => link.id === id ? { ...link, url } : link));

  const handleUpload = async (field: ImageField, event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!new Set(["image/jpeg", "image/png", "image/webp"]).has(file.type)) {
      toast.error("Choisissez une image JPEG, PNG ou WebP.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("L’image doit peser 5 Mo maximum.");
      return;
    }

    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => typeof reader.result === "string" ? resolve(reader.result) : reject(new Error("Lecture du fichier impossible"));
        reader.onerror = () => reject(new Error("Lecture du fichier impossible"));
        reader.readAsDataURL(file);
      });
      const result = await uploadImage.mutateAsync({ dataUrl, fileName: file.name });
      setField(field, result.url);
      toast.success("Image téléversée. Enregistrez le studio pour la publier.");
    } catch (error) {
      toast.error(`Téléversement impossible : ${error instanceof Error ? error.message : "erreur inconnue"}`);
    }
  };

  const handleSave = async () => {
    const textValues = [
      form.brandName,
      form.highlightEyebrow, form.highlightTitle, form.highlightText, form.highlightImageUrl,
      form.storyTitle, form.storyText, form.storyImageUrl,
      form.editorialEyebrow, form.editorialTitle, form.editorialImageUrl,
    ];
    if (textValues.some(value => !value.trim())) {
      toast.error("Complétez chaque champ texte et chaque visuel avant publication.");
      return;
    }
    try {
      await updateDesign.mutateAsync({
        ...form,
        brandName: form.brandName.trim(),
        brandMessage: form.brandMessage.trim(),
        brandLogoUrl: form.brandLogoUrl.trim(),
        highlightEyebrow: form.highlightEyebrow.trim(),
        highlightTitle: form.highlightTitle.trim(),
        highlightText: form.highlightText.trim(),
        highlightImageUrl: form.highlightImageUrl.trim(),
        storyTitle: form.storyTitle.trim(),
        storyText: form.storyText.trim(),
        storyImageUrl: form.storyImageUrl.trim(),
        editorialEyebrow: form.editorialEyebrow.trim(),
        editorialTitle: form.editorialTitle.trim(),
        editorialImageUrl: form.editorialImageUrl.trim(),
      });
      await designQuery.refetch();
      toast.success("Personnalisation enregistrée et publiée sur la boutique.");
    } catch (error) {
      toast.error(`Impossible de publier : ${error instanceof Error ? error.message : "erreur inconnue"}`);
    }
  };

  const palette = designPalettes[form.paletteId];
  const typography = designTypography[form.typographyId];
  const isSaving = updateDesign.isPending;
  const hashTab = typeof window === "undefined" ? "" : window.location.hash.replace("#", "");

  type CustomizationMainTab = "identite" | "style" | "accueil" | "menu" | "pages";
  const [activeTab, setActiveTab] = useState<CustomizationMainTab>(() => {
    if (hashTab === "home" || hashTab === "images" || hashTab === "sections") return "accueil";
    if (hashTab === "menu") return "menu";
    if (hashTab === "style") return "style";
    if (["catalogue", "product", "checkout", "pages", "footer"].includes(hashTab)) return "pages";
    return "identite";
  });
  const [accueilSubTab, setAccueilSubTab] = useState<"textes" | "images" | "sections">("textes");
  const [pagesSubTab, setPagesSubTab] = useState<"catalogue" | "product" | "checkout" | "system" | "footer">("catalogue");

  return (
    <DashboardLayout>
      <div className="space-y-6 pb-8">
        <section className="overflow-hidden rounded-2xl border border-violet-100 bg-gradient-to-r from-violet-50 via-white to-fuchsia-50">
          <div className="grid gap-6 p-6 md:grid-cols-[1fr_auto] md:items-center md:p-8">
            <div>
              <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-violet-700"><Palette className="h-4 w-4" /> Studio de personnalisation</p>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">Vitrine & identité de votre boutique</h1>
              <p className="mt-3 max-w-2xl text-slate-600">Choisissez une ambiance, ajustez vos textes clés, vos menus et vos images. Les réglages sont modulaires et organisés pour éviter tout défilement excessif.</p>
            </div>
            <div className="mx-auto grid h-24 w-24 place-items-center rounded-2xl bg-violet-600 text-white shadow-md shadow-violet-200 md:mx-0"><Palette className="h-10 w-10" /></div>
          </div>
        </section>

        {designQuery.error && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">Impossible de charger la personnalisation actuelle : {designQuery.error.message}. Les réglages de référence restent affichés.</div>}

        {/* Ruban principal de 5 boutons-onglets */}
        <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between pb-2 border-b border-slate-100">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Modules de personnalisation</p>
            <Button asChild variant="outline" size="sm" className="h-8 border-emerald-300 bg-emerald-50 text-emerald-900 hover:bg-emerald-100">
              <Link href="/"><MonitorUp className="mr-1.5 h-3.5 w-3.5" /> Voir la boutique en direct</Link>
            </Button>
          </div>
          <div className="mt-2.5 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
            <button
              type="button"
              onClick={() => setActiveTab("identite")}
              className={`flex items-center gap-2.5 rounded-xl p-3 text-left transition-all ${
                activeTab === "identite"
                  ? "border-2 border-orange-700 bg-orange-700 text-white shadow-md shadow-orange-700/20"
                  : "border border-slate-200 bg-slate-50/70 text-slate-800 hover:bg-slate-100 hover:text-slate-950"
              }`}
            >
              <Type className={`h-4 w-4 shrink-0 ${activeTab === "identite" ? "text-orange-200" : "text-orange-700"}`} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-bold uppercase tracking-wider">1. Identité</p>
                <p className="truncate text-xs opacity-80">Marque & Logo</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("style")}
              className={`flex items-center gap-2.5 rounded-xl p-3 text-left transition-all ${
                activeTab === "style"
                  ? "border-2 border-violet-700 bg-violet-700 text-white shadow-md shadow-violet-700/20"
                  : "border border-violet-200 bg-violet-50/60 text-violet-900 hover:bg-violet-100/70"
              }`}
            >
              <Palette className={`h-4 w-4 shrink-0 ${activeTab === "style" ? "text-violet-200" : "text-violet-700"}`} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-bold uppercase tracking-wider">2. Couleurs</p>
                <p className="truncate text-xs opacity-80">Thème & typographie</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("accueil")}
              className={`flex items-center gap-2.5 rounded-xl p-3 text-left transition-all ${
                activeTab === "accueil"
                  ? "border-2 border-sky-700 bg-sky-700 text-white shadow-md shadow-sky-700/20"
                  : "border border-sky-200 bg-sky-50/60 text-sky-900 hover:bg-sky-100/70"
              }`}
            >
              <Sparkles className={`h-4 w-4 shrink-0 ${activeTab === "accueil" ? "text-sky-200" : "text-sky-700"}`} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-bold uppercase tracking-wider">3. Accueil</p>
                <p className="truncate text-xs opacity-80">Textes & visuels</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("menu")}
              className={`flex items-center gap-2.5 rounded-xl p-3 text-left transition-all ${
                activeTab === "menu"
                  ? "border-2 border-indigo-700 bg-indigo-700 text-white shadow-md shadow-indigo-700/20"
                  : "border border-indigo-200 bg-indigo-50/60 text-indigo-900 hover:bg-indigo-100/70"
              }`}
            >
              <LayoutPanelTop className={`h-4 w-4 shrink-0 ${activeTab === "menu" ? "text-indigo-200" : "text-indigo-700"}`} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-bold uppercase tracking-wider">4. Navigation</p>
                <p className="truncate text-xs opacity-80">Menu & sous-onglets</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("pages")}
              className={`flex items-center gap-2.5 rounded-xl p-3 text-left transition-all ${
                activeTab === "pages"
                  ? "border-2 border-emerald-700 bg-emerald-700 text-white shadow-md shadow-emerald-700/20"
                  : "border border-emerald-200 bg-emerald-50/60 text-emerald-900 hover:bg-emerald-100/70"
              }`}
            >
              <FileText className={`h-4 w-4 shrink-0 ${activeTab === "pages" ? "text-emerald-200" : "text-emerald-700"}`} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-bold uppercase tracking-wider">5. Pages</p>
                <p className="truncate text-xs opacity-80">Boutique & footer</p>
              </div>
            </button>
          </div>
        </div>

        {/* ONGLET 1: IDENTITÉ & LOGO */}
        {activeTab === "identite" && (
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
            <Card className="border-orange-100 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Type className="h-5 w-5 text-orange-700" /> Identité de marque</CardTitle>
                <CardDescription>Ajoutez votre logo, le nom visible dans l’en-tête et un message court affiché à côté sur les grands écrans.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2"><Label htmlFor="brandName">Nom de marque</Label><Input id="brandName" value={form.brandName} maxLength={48} onChange={event => setField("brandName", event.target.value)} placeholder="Ex. MAZIGHO" /><p className="text-xs text-slate-500">Entre 2 et 48 caractères.</p></div>
                  <div className="space-y-2"><Label htmlFor="brandMessage">Message à côté du logo <span className="font-normal text-slate-500">(facultatif)</span></Label><Input id="brandMessage" value={form.brandMessage} maxLength={120} onChange={event => setField("brandMessage", event.target.value)} placeholder="Ex. Trouvailles choisies pour vous" /><p className="text-xs text-slate-500">Jusqu’à 120 caractères.</p></div>
                </div>
                <ImageEditor id="brandLogo" label="Logo de marque" description="Logo affiché à gauche du nom dans l’en-tête. PNG, JPEG ou WebP, carré ou horizontal, jusqu’à 5 Mo." value={form.brandLogoUrl} onChange={value => setField("brandLogoUrl", value)} onUpload={event => handleUpload("brandLogoUrl", event)} isUploading={uploadImage.isPending} />
                <ImageEditor id="favicon" label="Favicon" description="Petite icône affichée dans l’onglet du navigateur. Un visuel carré est recommandé." value={form.faviconUrl} onChange={value => setField("faviconUrl", value)} onUpload={event => handleUpload("faviconUrl", event)} isUploading={uploadImage.isPending} />
              </CardContent>
            </Card>
            <aside className="space-y-4">
              <div className="rounded-2xl border border-teal-100 bg-gradient-to-br from-teal-50 via-white to-orange-50 p-5 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-700">Aperçu en-tête</p>
                <div className="mt-6 flex items-center gap-3">
                  {form.brandLogoUrl ? <img src={form.brandLogoUrl} alt="Aperçu du logo" className="h-12 w-12 rounded-xl border border-white bg-white object-contain p-1 shadow-sm" /> : <div className="grid h-12 w-12 place-items-center rounded-xl bg-orange-700 text-lg font-bold text-white shadow-sm">{form.brandName.slice(0, 1).toUpperCase() || "M"}</div>}
                  <div className="min-w-0"><p className="truncate text-lg font-semibold tracking-[0.08em] text-orange-800">{form.brandName || "Nom de marque"}</p>{form.brandMessage ? <p className="mt-1 line-clamp-2 text-xs leading-5 text-teal-800">{form.brandMessage}</p> : <p className="mt-1 text-xs leading-5 text-slate-500">Message facultatif</p>}</div>
                </div>
                <p className="mt-6 border-t border-teal-100 pt-4 text-xs leading-5 text-slate-600">Le logo et le nom de marque s'adaptent instantanément sur mobile et ordinateur.</p>
              </div>
            </aside>
          </div>
        )}

        {/* ONGLET 2: COULEURS & STYLE */}
        {activeTab === "style" && (
          <div className="space-y-5">
            <section className="grid gap-4 lg:grid-cols-[1fr_320px]">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Aperçu de l’ambiance</p>
                <div className="mt-4 overflow-hidden rounded-xl border" style={{ backgroundColor: palette.soft }}>
                  <div className="flex min-h-36 items-end bg-slate-900 p-5 text-white" style={{ backgroundImage: `linear-gradient(90deg, rgba(15,23,42,.90), rgba(15,23,42,.35)), url(${form.highlightImageUrl})`, backgroundSize: "cover", backgroundPosition: "center" }}>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.18em]" style={{ color: palette.primary }}>{form.highlightEyebrow}</p>
                      <p className="mt-2 text-2xl font-semibold" style={{ fontFamily: typography.heading }}>{form.highlightTitle}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-3 p-4">
                    <span className="text-sm font-medium text-slate-700">Bouton principal</span>
                    <span className="rounded-md px-4 py-2 text-sm font-semibold text-white" style={{ backgroundColor: palette.primary }}>Découvrir</span>
                  </div>
                </div>
              </div>
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
                <CheckCircle2 className="h-6 w-6 text-emerald-700" />
                <p className="mt-3 font-semibold text-slate-900">Conseil d’harmonie</p>
                <p className="mt-1 text-sm leading-6 text-slate-700">Conservez une palette unifiée pour garder une cohérence visuelle sur l'ensemble des pages de votre catalogue.</p>
              </div>
            </section>

            <Card className="shadow-sm">
              <CardHeader><CardTitle className="flex items-center gap-2"><Palette className="h-5 w-5 text-violet-600" /> Palette de couleurs</CardTitle><CardDescription>Choisissez parmi des palettes testées pour garder une lecture confortable et des contrastes cohérents.</CardDescription></CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {(Object.entries(designPalettes) as Array<[DesignProfile["paletteId"], typeof designPalettes["terracotta"]]>).map(([id, item]) => (
                  <button type="button" key={id} onClick={() => setField("paletteId", id)} className={`rounded-2xl border p-4 text-left transition ${form.paletteId === id ? "border-violet-500 ring-2 ring-violet-200" : "border-slate-200 hover:border-violet-300"}`}>
                    <div className="flex h-16 overflow-hidden rounded-xl"><span className="flex-1" style={{ backgroundColor: item.primary }} /><span className="flex-1" style={{ backgroundColor: item.accent }} /><span className="flex-1" style={{ backgroundColor: item.soft }} /></div>
                    <p className="mt-4 font-semibold text-slate-900">{item.name}</p>
                    <p className="mt-1 text-xs leading-5 text-slate-600">{item.description}</p>
                    {form.paletteId === id && <p className="mt-3 text-xs font-semibold text-violet-700">Palette active</p>}
                  </button>
                ))}
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader><CardTitle className="flex items-center gap-2"><Type className="h-5 w-5 text-violet-600" /> Typographie</CardTitle><CardDescription>La police sélectionnée s’applique aux titres et aux textes de la boutique.</CardDescription></CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-3">
                {(Object.entries(designTypography) as Array<[DesignProfile["typographyId"], typeof designTypography["editorial"]]>).map(([id, item]) => (
                  <button type="button" key={id} onClick={() => setField("typographyId", id)} className={`rounded-2xl border p-5 text-left transition ${form.typographyId === id ? "border-violet-500 ring-2 ring-violet-200" : "border-slate-200 hover:border-violet-300"}`}>
                    <p className="text-2xl text-slate-900" style={{ fontFamily: item.heading }}>{item.preview}</p>
                    <p className="mt-4 font-semibold text-slate-900">{item.name}</p>
                    <p className="mt-1 text-xs text-slate-500">Texte et titres harmonisés</p>
                  </button>
                ))}
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader><CardTitle className="flex items-center gap-2"><Palette className="h-5 w-5 text-violet-600" /> Couleurs personnalisées</CardTitle><CardDescription>Activez pour définir vos propres couleurs primaire, secondaire et de fond au lieu d’une palette prédéfinie.</CardDescription></CardHeader>
              <CardContent className="space-y-5">
                <div className="flex items-center justify-between rounded-xl border p-3">
                  <div><Label>Utiliser mes propres couleurs</Label><p className="text-xs text-muted-foreground">Remplace la palette sélectionnée ci-dessus.</p></div>
                  <Button type="button" data-testid="toggle-custom-colors" variant={form.customColorsEnabled ? "default" : "outline"} className={form.customColorsEnabled ? "bg-violet-600 hover:bg-violet-700" : ""} onClick={() => setField("customColorsEnabled", !form.customColorsEnabled)}>{form.customColorsEnabled ? "Activé" : "Désactivé"}</Button>
                </div>
                <div className={`grid gap-4 sm:grid-cols-3 ${form.customColorsEnabled ? "" : "pointer-events-none opacity-50"}`}>
                  {([["customPrimary", "Couleur primaire"], ["customAccent", "Couleur secondaire"], ["customSoft", "Fond doux"]] as Array<["customPrimary" | "customAccent" | "customSoft", string]>).map(([field, label]) => (
                    <div key={field} className="space-y-2">
                      <Label htmlFor={field}>{label}</Label>
                      <div className="flex items-center gap-2"><input id={field} type="color" data-testid={`color-${field}`} value={form[field]} onChange={event => setField(field, event.target.value)} className="h-10 w-14 shrink-0 cursor-pointer rounded-md border border-slate-200 bg-white p-1" /><Input value={form[field]} onChange={event => setField(field, event.target.value)} className="font-mono uppercase" /></div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader><CardTitle className="flex items-center gap-2"><Type className="h-5 w-5 text-violet-600" /> Style global des boutons</CardTitle><CardDescription>Contrôlez l’arrondi des boutons sur toute la boutique.</CardDescription></CardHeader>
              <CardContent>
                <div className="grid gap-3 sm:grid-cols-3">
                  {([["flat", "Anguleux", "Coins nets"], ["rounded", "Arrondi", "Recommandé"], ["full", "Pilule", "Très arrondi"]] as Array<["flat" | "rounded" | "full", string, string]>).map(([value, label, hint]) => (
                    <button type="button" key={value} data-testid={`radius-${value}`} onClick={() => setField("buttonRadius", value)} className={`rounded-2xl border p-4 text-left transition ${form.buttonRadius === value ? "border-violet-500 ring-2 ring-violet-200" : "border-slate-200 hover:border-violet-300"}`}>
                      <span className="inline-flex bg-violet-600 px-4 py-2 text-xs font-semibold text-white" style={{ borderRadius: value === "flat" ? "0px" : value === "full" ? "9999px" : "0.75rem" }}>Bouton</span>
                      <p className="mt-3 font-semibold text-slate-900">{label}</p>
                      <p className="mt-1 text-xs text-slate-500">{hint}</p>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ONGLET 3: ACCUEIL & VISUELS */}
        {activeTab === "accueil" && (
          <div className="space-y-5">
            {/* Sous-onglets Accueil */}
            <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
              <Button type="button" size="sm" variant={accueilSubTab === "textes" ? "default" : "outline"} className={accueilSubTab === "textes" ? "bg-sky-700" : ""} onClick={() => setAccueilSubTab("textes")}>
                Textes d’accueil & Histoire
              </Button>
              <Button type="button" size="sm" variant={accueilSubTab === "images" ? "default" : "outline"} className={accueilSubTab === "images" ? "bg-sky-700" : ""} onClick={() => setAccueilSubTab("images")}>
                Images de la vitrine
              </Button>
              <Button type="button" size="sm" variant={accueilSubTab === "sections" ? "default" : "outline"} className={accueilSubTab === "sections" ? "bg-sky-700" : ""} onClick={() => setAccueilSubTab("sections")}>
                Sections visibles & Bandeau
              </Button>
            </div>

            {accueilSubTab === "textes" && (
              <div className="space-y-5">
                <Card className="shadow-sm">
                  <CardHeader><CardTitle className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-amber-600" /> Message d’inspiration</CardTitle><CardDescription>Ce grand visuel apparaît juste après les bannières de l’accueil.</CardDescription></CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2"><Label htmlFor="highlightEyebrow">Petit libellé</Label><Input id="highlightEyebrow" value={form.highlightEyebrow} onChange={event => setField("highlightEyebrow", event.target.value)} /></div>
                    <div className="space-y-2"><Label htmlFor="highlightTitle">Titre</Label><Input id="highlightTitle" value={form.highlightTitle} onChange={event => setField("highlightTitle", event.target.value)} /></div>
                    <div className="space-y-2"><Label htmlFor="highlightText">Texte</Label><textarea id="highlightText" value={form.highlightText} onChange={event => setField("highlightText", event.target.value)} className="min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" /></div>
                  </CardContent>
                </Card>
                <Card className="shadow-sm">
                  <CardHeader><CardTitle>L’histoire de la boutique</CardTitle><CardDescription>Présentez votre démarche et l’esprit de votre projet.</CardDescription></CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2"><Label htmlFor="storyTitle">Titre de la section</Label><Input id="storyTitle" value={form.storyTitle} onChange={event => setField("storyTitle", event.target.value)} /></div>
                    <div className="space-y-2"><Label htmlFor="storyText">Texte de présentation</Label><textarea id="storyText" value={form.storyText} onChange={event => setField("storyText", event.target.value)} className="min-h-32 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" /></div>
                  </CardContent>
                </Card>
                <Card className="shadow-sm">
                  <CardHeader><CardTitle>Encart éditorial</CardTitle><CardDescription>Une respiration visuelle entre les témoignages et les produits phares.</CardDescription></CardHeader>
                  <CardContent className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2"><Label htmlFor="editorialEyebrow">Petit libellé</Label><Input id="editorialEyebrow" value={form.editorialEyebrow} onChange={event => setField("editorialEyebrow", event.target.value)} /></div>
                    <div className="space-y-2"><Label htmlFor="editorialTitle">Titre</Label><Input id="editorialTitle" value={form.editorialTitle} onChange={event => setField("editorialTitle", event.target.value)} /></div>
                  </CardContent>
                </Card>
              </div>
            )}

            {accueilSubTab === "images" && (
              <div className="space-y-5">
                <div className="rounded-xl border border-sky-200 bg-sky-50 p-4 text-sm text-sky-950">
                  <p className="font-semibold">Conseil d’optimisation visuelle</p>
                  <p className="mt-1">Privilégiez des photos horizontales, bien cadrées et nettes. Le système adapte automatiquement leur taille pour un affichage rapide.</p>
                </div>
                <ImageEditor id="highlightImage" label="Image du message d’inspiration" description="Grande image affichée sous les bannières de l’accueil." value={form.highlightImageUrl} onChange={value => setField("highlightImageUrl", value)} onUpload={event => handleUpload("highlightImageUrl", event)} isUploading={uploadImage.isPending} />
                <ImageEditor id="storyImage" label="Illustration de l’histoire" description="Illustration principale de la section narrative de l’accueil." value={form.storyImageUrl} onChange={value => setField("storyImageUrl", value)} onUpload={event => handleUpload("storyImageUrl", event)} isUploading={uploadImage.isPending} />
                <ImageEditor id="editorialImage" label="Bannière d’encart éditorial" description="Bannière horizontale placée avant les produits phares." value={form.editorialImageUrl} onChange={value => setField("editorialImageUrl", value)} onUpload={event => handleUpload("editorialImageUrl", event)} isUploading={uploadImage.isPending} />
              </div>
            )}

            {accueilSubTab === "sections" && (
              <div className="space-y-5">
                <Card className="shadow-sm">
                  <CardHeader><CardTitle>Barre d’annonces en haut du site</CardTitle><CardDescription>Messages défilants ou fixes affichés en haut de toutes les pages.</CardDescription></CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                      <div><p className="font-semibold text-slate-900">Afficher la barre d'annonces</p><p className="mt-1 text-xs text-slate-500">Activez ou désactivez le bandeau supérieur à tout moment.</p></div>
                      <Button type="button" variant={form.showAnnouncement ? "default" : "outline"} className={form.showAnnouncement ? "bg-violet-600 hover:bg-violet-700" : ""} onClick={() => setField("showAnnouncement", !form.showAnnouncement)}>{form.showAnnouncement ? "Visible" : "Masquée"}</Button>
                    </div>
                    <div className="grid gap-4 md:grid-cols-3">
                      {form.announcementItems.map((item, index) => (
                        <div key={index} className="space-y-2">
                          <Label htmlFor={`main-announcement-${index}`}>Message {index + 1}</Label>
                          <Input id={`main-announcement-${index}`} value={item} maxLength={120} placeholder="Laissez vide pour masquer" onChange={event => setField("announcementItems", form.announcementItems.map((current, currentIndex) => currentIndex === index ? event.target.value : current))} />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                <Card className="shadow-sm">
                  <CardHeader><CardTitle>Visibilité des sections de la page d'accueil</CardTitle><CardDescription>Contrôlez l'apparition des blocs sans perdre leurs contenus.</CardDescription></CardHeader>
                  <CardContent className="space-y-3">
                    {([
                      ["showDiscovery", "Découvrez nos univers", "Les cartes illustrées des grandes catégories."],
                      ["showStory", "L’histoire de la boutique", "La section narrative avec votre image principale."],
                      ["showTestimonials", "Avis clients", "Les retours d'expérience et témoignages."],
                      ["showEditorial", "Encart éditorial", "La bannière visuelle avant les produits."],
                    ] as Array<["showDiscovery" | "showStory" | "showTestimonials" | "showEditorial", string, string]>).map(([field, title, description]) => (
                      <div key={field} className="flex flex-col gap-4 rounded-xl border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
                        <div><p className="font-semibold text-slate-900">{title}</p><p className="mt-1 text-sm text-slate-500">{description}</p></div>
                        <Button type="button" variant={form[field] ? "default" : "outline"} className={form[field] ? "bg-emerald-600 hover:bg-emerald-700" : ""} onClick={() => setField(field, !form[field])}>{form[field] ? <><Eye className="mr-2 h-4 w-4" /> Visible</> : "Masquée"}</Button>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        )}

        {/* ONGLET 4: NAVIGATION & MENU */}
        {activeTab === "menu" && (
          <Card className="shadow-sm">
            <CardHeader><CardTitle className="flex items-center gap-2"><LayoutPanelTop className="h-5 w-5 text-indigo-600" /> Menu de navigation</CardTitle><CardDescription>Ajustez l’ordre, les libellés et les destinations des onglets du menu principal.</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 md:grid-cols-3">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="main-header-layout">Disposition du menu</Label>
                  <select id="main-header-layout" value={form.headerLayout} onChange={event => setField("headerLayout", event.target.value as DesignProfile["headerLayout"])} className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm">
                    <option value="inline">Compacte — une ligne</option>
                    <option value="split">Éditoriale — menu sur une seconde ligne</option>
                    <option value="searchFirst">Catalogue — recherche élargie</option>
                    <option value="gallery">Galerie premium — identité centrée</option>
                    <option value="market">Studio premium — recherche et bande menu</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <Button type="button" variant="outline" className="w-full border-indigo-200 text-indigo-800 hover:bg-indigo-50" disabled={form.navigationItems.length >= 16} onClick={addCustomNavigationItem}>Ajouter un onglet</Button>
                </div>
              </div>
              <div className="grid gap-3">
                {form.navigationItems.map((item, index) => {
                  const childCount = form.navigationItems.filter(candidate => candidate.parentId === item.id).length;
                  const availableParents = form.navigationItems.filter(candidate => candidate.kind === "custom" && candidate.visible && candidate.id !== item.id && !candidate.parentId);
                  return (
                    <div key={item.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-slate-900">
                          {item.kind === "system" ? navigationSystemLabels[item.id] || item.id : item.label || "Onglet personnalisé"}
                          {item.parentId && <span className="ml-2 text-xs font-normal text-indigo-700">· sous-menu</span>}
                          {childCount > 0 && <span className="ml-2 text-xs font-normal text-teal-700">· {childCount} sous-onglet{childCount > 1 ? "s" : ""}</span>}
                        </p>
                        <div className="flex items-center gap-2">
                          <label className="flex items-center gap-2 text-xs font-medium text-slate-600">
                            <input type="checkbox" checked={item.visible} onChange={event => updateNavigationItem(item.id, { visible: event.target.checked })} className="h-4 w-4 accent-indigo-600" /> Visible
                          </label>
                          <Button type="button" size="sm" variant="outline" disabled={index === 0} onClick={() => moveNavigationItem(item.id, -1)}>↑</Button>
                          <Button type="button" size="sm" variant="outline" disabled={index === form.navigationItems.length - 1} onClick={() => moveNavigationItem(item.id, 1)}>↓</Button>
                          {item.kind === "custom" ? <Button type="button" size="sm" variant="outline" className="border-rose-200 text-rose-700 hover:bg-rose-50" onClick={() => removeNavigationItem(item.id)}>Supprimer</Button> : null}
                        </div>
                      </div>
                      <div className="mt-3 grid gap-3 md:grid-cols-3">
                        <div className="space-y-2"><Label htmlFor={`main-nav-label-${item.id}`}>Libellé</Label><Input id={`main-nav-label-${item.id}`} value={item.label} placeholder={navigationSystemLabels[item.id] || "Nom de l’onglet"} maxLength={40} onChange={event => updateNavigationItem(item.id, { label: event.target.value })} /></div>
                        <div className="space-y-2"><Label htmlFor={`main-nav-url-${item.id}`}>{item.kind === "system" ? "Destination système" : "Destination"}</Label><Input id={`main-nav-url-${item.id}`} value={item.href} disabled={item.kind === "system"} placeholder="/boutique ou https://…" maxLength={300} onChange={event => updateNavigationItem(item.id, { href: event.target.value })} /></div>
                        {item.kind === "custom" ? (
                          <div className="space-y-2"><Label htmlFor={`main-nav-parent-${item.id}`}>Rattacher sous</Label><select id={`main-nav-parent-${item.id}`} value={item.parentId || ""} onChange={event => updateNavigationItem(item.id, { parentId: event.target.value || undefined })} className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm"><option value="">Menu principal</option>{availableParents.map(parent => <option key={parent.id} value={parent.id}>{parent.label || "Onglet"}</option>)}</select></div>
                        ) : (
                          <div className="space-y-2"><Label>Position</Label><p className="rounded-md border border-slate-200 bg-white px-3 py-2 text-xs leading-5 text-slate-500">Onglet principal</p></div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* ONGLET 5: PAGES & BOUTIQUE */}
        {activeTab === "pages" && (
          <div className="space-y-5">
            {/* Sous-onglets Pages */}
            <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
              <Button type="button" size="sm" variant={pagesSubTab === "catalogue" ? "default" : "outline"} className={pagesSubTab === "catalogue" ? "bg-emerald-700" : ""} onClick={() => setPagesSubTab("catalogue")}>
                Pages du catalogue
              </Button>
              <Button type="button" size="sm" variant={pagesSubTab === "product" ? "default" : "outline"} className={pagesSubTab === "product" ? "bg-emerald-700" : ""} onClick={() => setPagesSubTab("product")}>
                Fiche produit
              </Button>
              <Button type="button" size="sm" variant={pagesSubTab === "checkout" ? "default" : "outline"} className={pagesSubTab === "checkout" ? "bg-emerald-700" : ""} onClick={() => setPagesSubTab("checkout")}>
                Panier & Commande
              </Button>
              <Button type="button" size="sm" variant={pagesSubTab === "system" ? "default" : "outline"} className={pagesSubTab === "system" ? "bg-emerald-700" : ""} onClick={() => setPagesSubTab("system")}>
                Pages publiques (FAQ/Contact)
              </Button>
              <Button type="button" size="sm" variant={pagesSubTab === "footer" ? "default" : "outline"} className={pagesSubTab === "footer" ? "bg-emerald-700" : ""} onClick={() => setPagesSubTab("footer")}>
                Pied de page & Réseaux
              </Button>
            </div>

            {pagesSubTab === "catalogue" && (
              <Card className="shadow-sm">
                <CardHeader><CardTitle className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-violet-600" /> Pages Promotions, Nouveautés et Best-sellers</CardTitle><CardDescription>Contrôlez les titres et textes des sélections de votre catalogue.</CardDescription></CardHeader>
                <CardContent className="space-y-6">
                  <section className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-4">
                    <p className="font-semibold text-slate-900">Page Boutique principale</p>
                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                      <div className="space-y-2"><Label>Petit libellé</Label><Input value={form.shopEyebrow} maxLength={120} onChange={event => setField("shopEyebrow", event.target.value)} /></div>
                      <div className="space-y-2"><Label>Titre</Label><Input value={form.shopTitle} maxLength={180} onChange={event => setField("shopTitle", event.target.value)} /></div>
                      <div className="space-y-2 md:col-span-2"><Label>Introduction</Label><textarea value={form.shopIntro} maxLength={420} onChange={event => setField("shopIntro", event.target.value)} className="min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" /></div>
                    </div>
                  </section>
                  <section className="rounded-xl border border-violet-100 bg-violet-50/50 p-4">
                    <p className="font-semibold text-slate-900">Promotions</p>
                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                      <div className="space-y-2"><Label>Titre</Label><Input value={form.promosTitle} maxLength={120} onChange={event => setCatalogueCopyField("promosTitle", event.target.value)} /></div>
                      <div className="space-y-2"><Label>Bouton de retour</Label><Input value={form.promosAllProductsLabel} maxLength={60} onChange={event => setCatalogueCopyField("promosAllProductsLabel", event.target.value)} /></div>
                    </div>
                  </section>
                  <section className="rounded-xl border border-teal-100 bg-teal-50/50 p-4">
                    <p className="font-semibold text-slate-900">Nouveautés</p>
                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                      <div className="space-y-2"><Label>Titre</Label><Input value={form.newArrivalsTitle} maxLength={120} onChange={event => setCatalogueCopyField("newArrivalsTitle", event.target.value)} /></div>
                      <div className="space-y-2"><Label>Introduction</Label><textarea value={form.newArrivalsLead} maxLength={420} onChange={event => setCatalogueCopyField("newArrivalsLead", event.target.value)} className="min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" /></div>
                    </div>
                  </section>
                  <section className="rounded-xl border border-amber-100 bg-amber-50/50 p-4">
                    <p className="font-semibold text-slate-900">Best-sellers</p>
                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                      <div className="space-y-2"><Label>Titre</Label><Input value={form.bestSellersTitle} maxLength={120} onChange={event => setCatalogueCopyField("bestSellersTitle", event.target.value)} /></div>
                      <div className="space-y-2"><Label>Libellé de classement</Label><Input value={form.bestSellersTopLabel} maxLength={60} onChange={event => setCatalogueCopyField("bestSellersTopLabel", event.target.value)} /></div>
                    </div>
                  </section>
                </CardContent>
              </Card>
            )}

            {pagesSubTab === "product" && (
              <Card className="shadow-sm">
                <CardHeader><CardTitle className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-violet-600" /> Informations de confiance de la fiche produit</CardTitle><CardDescription>Ces deux messages apparaissent sous le bouton d’ajout au panier.</CardDescription></CardHeader>
                <CardContent className="space-y-5">
                  <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-violet-100 bg-violet-50/50 p-4">
                    <div><p className="font-semibold text-slate-900">Afficher les messages de réassurance</p><p className="mt-1 text-xs text-slate-600">Masquez ce bloc si vos conditions sont encore en préparation.</p></div>
                    <Button type="button" variant={form.showProductReassurance ? "default" : "outline"} className={form.showProductReassurance ? "bg-violet-600 hover:bg-violet-700" : ""} onClick={() => setField("showProductReassurance", !form.showProductReassurance)}>{form.showProductReassurance ? "Visible" : "Masqué"}</Button>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    {form.productReassuranceItems.map((item, index) => (
                      <div key={item.icon} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                        <p className="font-semibold text-slate-900">{item.icon === "shield" ? "Premier message" : "Second message"}</p>
                        <div className="mt-4 space-y-3">
                          <div className="space-y-2"><Label>Titre</Label><Input value={item.title} maxLength={100} onChange={event => setField("productReassuranceItems", form.productReassuranceItems.map((current, currentIndex) => currentIndex === index ? { ...current, title: event.target.value } : current))} /></div>
                          <div className="space-y-2"><Label>Texte</Label><textarea value={item.text} maxLength={220} onChange={event => setField("productReassuranceItems", form.productReassuranceItems.map((current, currentIndex) => currentIndex === index ? { ...current, text: event.target.value } : current))} className="min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" /></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {pagesSubTab === "checkout" && (
              <Card className="shadow-sm">
                <CardHeader><CardTitle className="flex items-center gap-2"><ShoppingCart className="h-5 w-5 text-violet-600" /> Panier et commande</CardTitle><CardDescription>Modifiez les explications affichées aux visiteurs avant paiement.</CardDescription></CardHeader>
                <CardContent className="grid gap-5 lg:grid-cols-2">
                  <section className="rounded-xl border border-sky-100 bg-sky-50/50 p-4">
                    <p className="font-semibold text-slate-950">Panier</p>
                    <div className="mt-4 space-y-4">
                      <div className="space-y-2"><Label>Petit libellé</Label><Input value={form.cartEyebrow} maxLength={120} onChange={event => setField("cartEyebrow", event.target.value)} /></div>
                      <div className="space-y-2"><Label>Titre</Label><Input value={form.cartTitle} maxLength={120} onChange={event => setField("cartTitle", event.target.value)} /></div>
                      <div className="space-y-2"><Label>Introduction</Label><textarea value={form.cartIntro} maxLength={360} onChange={event => setField("cartIntro", event.target.value)} className="min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" /></div>
                    </div>
                  </section>
                  <section className="rounded-xl border border-violet-100 bg-violet-50/50 p-4">
                    <p className="font-semibold text-slate-950">Commande</p>
                    <div className="mt-4 space-y-4">
                      <div className="space-y-2"><Label>Petit libellé</Label><Input value={form.checkoutEyebrow} maxLength={120} onChange={event => setField("checkoutEyebrow", event.target.value)} /></div>
                      <div className="space-y-2"><Label>Titre</Label><Input value={form.checkoutTitle} maxLength={120} onChange={event => setField("checkoutTitle", event.target.value)} /></div>
                      <div className="space-y-2"><Label>Introduction</Label><textarea value={form.checkoutIntro} maxLength={420} onChange={event => setField("checkoutIntro", event.target.value)} className="min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" /></div>
                    </div>
                  </section>
                </CardContent>
              </Card>
            )}

            {pagesSubTab === "system" && (
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5 text-violet-600" /> Pages publiques autonomes</CardTitle>
                  <CardDescription>Configurez la FAQ, Contact, Livraison & retours et À propos.</CardDescription>
                </CardHeader>
                <CardContent>
                  <StoreSystemPagesEditor scope="platform" />
                </CardContent>
              </Card>
            )}

            {pagesSubTab === "footer" && (
              <Card className="shadow-sm">
                <CardHeader><CardTitle>Pied de page, contact et réseaux</CardTitle><CardDescription>Personnalisez les coordonnées et réseaux du footer.</CardDescription></CardHeader>
                <CardContent className="space-y-5">
                  <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                    {([ ["footerShowNavigation", "Menu", "Affiche les onglets du menu."], ["footerShowCategories", "Catégories", "Affiche les catégories actives."], ["footerShowHelp", "Aide", "Affiche FAQ et contact."], ["footerShowReassurance", "Réassurance", "Affiche les trois messages de fin."], ] as Array<["footerShowNavigation" | "footerShowCategories" | "footerShowHelp" | "footerShowReassurance", string, string]>).map(([field, label, hint]) => (
                      <label key={field} className="flex min-h-16 cursor-pointer gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                        <input type="checkbox" checked={form[field]} onChange={event => setField(field, event.target.checked)} className="mt-1 h-5 w-5 accent-violet-600" />
                        <span><span className="block text-sm font-semibold text-slate-900">{label}</span><span className="mt-1 block text-xs leading-5 text-slate-500">{hint}</span></span>
                      </label>
                    ))}
                  </div>
                  <div className="grid gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-2">
                    <div className="space-y-2"><Label>Description de la marque</Label><textarea value={form.footerDescription} maxLength={420} onChange={event => setField("footerDescription", event.target.value)} className="min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" /></div>
                    <div className="grid gap-3 sm:grid-cols-3">
                      <div className="space-y-2"><Label>Titre menu</Label><Input value={form.footerNavigationTitle} maxLength={60} onChange={event => setField("footerNavigationTitle", event.target.value)} /></div>
                      <div className="space-y-2"><Label>Titre catégories</Label><Input value={form.footerCategoriesTitle} maxLength={60} onChange={event => setField("footerCategoriesTitle", event.target.value)} /></div>
                      <div className="space-y-2"><Label>Titre aide</Label><Input value={form.footerHelpTitle} maxLength={60} onChange={event => setField("footerHelpTitle", event.target.value)} /></div>
                    </div>
                  </div>
                  <div className="rounded-xl border border-violet-100 bg-violet-50 p-4">
                    <p className="font-semibold text-violet-950">Réseaux sociaux</p>
                    <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                      {form.footerSocialLinks.map(link => (
                        <div key={link.id} className="space-y-2"><Label>{footerSocialLabels[link.id]}</Label><Input value={link.url} maxLength={500} placeholder="https://…" onChange={event => setFooterSocialUrl(link.id, event.target.value)} /></div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        <section className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:items-center sm:justify-between"><Button type="button" variant="outline" onClick={() => { setForm(defaultDesignProfile); toast.message("Les réglages de référence sont replacés dans le formulaire. Enregistrez pour les publier."); }} disabled={isSaving || uploadImage.isPending}><RotateCcw className="mr-2 h-4 w-4" /> Restaurer la référence</Button><Button type="button" onClick={handleSave} disabled={isSaving || designQuery.isLoading || uploadImage.isPending} className="bg-violet-600 hover:bg-violet-700">{isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />} Enregistrer et publier</Button></section>
      </div>
    </DashboardLayout>
  );
}
