import { useState } from "react";
import {
  Sparkles,
  Wand2,
  FileText,
  Search,
  Globe2,
  HelpCircle,
  Copy,
  Check,
  ArrowRight,
  Layers,
  ShoppingBag,
  Tag,
  MessageSquare,
  Zap,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import OwnerImageGenerator from "./OwnerImageGenerator";

export default function OwnerAiProductStudio() {
  const [activeTab, setActiveTab] = useState("copywriter");

  // Tab 1: Copywriter State
  const [copyTitle, setCopyTitle] = useState("");
  const [copyCategory, setCopyCategory] = useState("");
  const [copyAudience, setCopyAudience] = useState("");
  const [copyTone, setCopyTone] = useState<"premium" | "persuasive" | "minimalist" | "eco" | "direct">("premium");
  const [copyFeatures, setCopyFeatures] = useState("");
  const [copyLanguage, setCopyLanguage] = useState("fr");
  const [generatedCopy, setGeneratedCopy] = useState<any>(null);

  // Tab 2: SEO State
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDesc, setSeoDesc] = useState("");
  const [generatedSeo, setGeneratedSeo] = useState<any>(null);

  // Tab 3: Translation State
  const [transTitle, setTransTitle] = useState("");
  const [transTagline, setTransTagline] = useState("");
  const [transDesc, setTransDesc] = useState("");
  const [transLang, setTransLang] = useState<"de" | "en" | "ar" | "it" | "es" | "nl" | "fr">("de");
  const [generatedTrans, setGeneratedTrans] = useState<any>(null);

  // Tab 4: FAQ State
  const [faqTitle, setFaqTitle] = useState("");
  const [faqCategory, setFaqCategory] = useState("");
  const [generatedFaq, setGeneratedFaq] = useState<any[]>([]);

  // Copies tracking
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    toast.success(`${fieldName} copié dans le presse-papier !`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Mutations
  const generateCopyMutation = trpc.aiStudio.generateCopy.useMutation({
    onSuccess: (data) => {
      setGeneratedCopy(data);
      toast.success("Fiche produit générée avec succès par l'IA !");
    },
    onError: (err) => toast.error(err.message || "Erreur de génération."),
  });

  const enhanceSeoMutation = trpc.aiStudio.enhanceSeo.useMutation({
    onSuccess: (data) => {
      setGeneratedSeo(data);
      toast.success("Balises SEO et titre optimisés par l'IA !");
    },
    onError: (err) => toast.error(err.message || "Erreur d'optimisation SEO."),
  });

  const translateMutation = trpc.aiStudio.translateContent.useMutation({
    onSuccess: (data) => {
      setGeneratedTrans(data);
      toast.success("Contenu traduit avec succès !");
    },
    onError: (err) => toast.error(err.message || "Erreur de traduction."),
  });

  const generateFaqMutation = trpc.aiStudio.generateFaq.useMutation({
    onSuccess: (data) => {
      setGeneratedFaq(data);
      toast.success("Questions / Réponses réassurance générées !");
    },
    onError: (err) => toast.error(err.message || "Erreur de génération de la FAQ."),
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* HEADER BANNER */}
      <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-amber-500 rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider text-amber-100">
              <Sparkles className="w-3.5 h-3.8 animate-pulse text-amber-200" />
              Studio IA Copilote & SEO MAZIGHO
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Rédacteur & Optimiseur Produits IA
            </h1>
            <p className="text-amber-100/90 text-sm sm:text-base leading-relaxed">
              Générez en quelques secondes des descriptions persuasives, optimisez le référencement Google de vos fiches et traduisez vos produits dans toutes les langues cibles.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20 text-xs">
            <Zap className="w-8 h-8 text-amber-300 shrink-0" />
            <div>
              <p className="font-bold text-white">Gemini 3.8 Flash Motorisé</p>
              <p className="text-amber-100">Génération ultra-rapide & adaptée au marché e-commerce suisse & européen</p>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN TABS */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-xl grid grid-cols-2 lg:grid-cols-5 gap-2">
          <TabsTrigger value="copywriter" className="rounded-lg gap-2 text-xs sm:text-sm font-medium py-2.5">
            <Wand2 className="w-4 h-4 text-orange-500" />
            <span>Copywriter Produit</span>
          </TabsTrigger>
          <TabsTrigger value="images" className="rounded-lg gap-2 text-xs sm:text-sm font-medium py-2.5">
            <Zap className="w-4 h-4 text-fuchsia-500" />
            <span>Générateur d'Images IA</span>
          </TabsTrigger>
          <TabsTrigger value="seo" className="rounded-lg gap-2 text-xs sm:text-sm font-medium py-2.5">
            <Search className="w-4 h-4 text-blue-500" />
            <span>Optimiseur SEO</span>
          </TabsTrigger>
          <TabsTrigger value="translator" className="rounded-lg gap-2 text-xs sm:text-sm font-medium py-2.5">
            <Globe2 className="w-4 h-4 text-emerald-500" />
            <span>Traducteur IA</span>
          </TabsTrigger>
          <TabsTrigger value="faq" className="rounded-lg gap-2 text-xs sm:text-sm font-medium py-2.5">
            <HelpCircle className="w-4 h-4 text-purple-500" />
            <span>FAQ Réassurance</span>
          </TabsTrigger>
        </TabsList>

        {/* TAB 0: IMAGES IA */}
        <TabsContent value="images" className="space-y-6">
          <OwnerImageGenerator />
        </TabsContent>

        {/* TAB 1: COPYWRITER */}
        <TabsContent value="copywriter" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Form */}
            <Card className="lg:col-span-5 border-slate-200 dark:border-slate-800 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Wand2 className="w-5 h-5 text-orange-600" />
                  Formulaire de Génération
                </CardTitle>
                <CardDescription>
                  Indiquez les détails clés de votre produit pour laisser l'IA rédiger la fiche idéale.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="copyTitle" className="text-xs font-semibold">Titre ou nom du produit *</Label>
                  <Input
                    id="copyTitle"
                    placeholder="ex: Diffuseur Ultrasonique Céramique & Bois"
                    value={copyTitle}
                    onChange={(e) => setCopyTitle(e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="copyCategory" className="text-xs font-semibold">Catégorie</Label>
                    <Input
                      id="copyCategory"
                      placeholder="Maison & Déco"
                      value={copyCategory}
                      onChange={(e) => setCopyCategory(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="copyAudience" className="text-xs font-semibold">Public Cible</Label>
                    <Input
                      id="copyAudience"
                      placeholder="Amateurs de bien-être"
                      value={copyAudience}
                      onChange={(e) => setCopyAudience(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs font-semibold">Ton de Rédaction</Label>
                    <Select value={copyTone} onValueChange={(v: any) => setCopyTone(v)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="premium">💎 Luxe & Premium</SelectItem>
                        <SelectItem value="persuasive">🔥 Persuasif & Vendeur</SelectItem>
                        <SelectItem value="minimalist">🌿 Minimaliste & Épuré</SelectItem>
                        <SelectItem value="eco">🌍 Écologique & Nature</SelectItem>
                        <SelectItem value="direct">🎯 Direct & Informatif</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs font-semibold">Langue</Label>
                    <Select value={copyLanguage} onValueChange={setCopyLanguage}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fr">🇫🇷 Français</SelectItem>
                        <SelectItem value="de">🇩🇪 Allemand</SelectItem>
                        <SelectItem value="en">🇬🇧 Anglais</SelectItem>
                        <SelectItem value="ar">🇩🇿/🇸🇦 Arabe</SelectItem>
                        <SelectItem value="it">🇮🇹 Italien</SelectItem>
                        <SelectItem value="es">🇪🇸 Espagnol</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="copyFeatures" className="text-xs font-semibold">
                    Caractéristiques clés (1 par ligne)
                  </Label>
                  <Textarea
                    id="copyFeatures"
                    placeholder="Réservoir 300ml&#10;LED 7 couleurs&#10;Arrêt automatique silencieux"
                    rows={3}
                    value={copyFeatures}
                    onChange={(e) => setCopyFeatures(e.target.value)}
                    className="mt-1"
                  />
                </div>

                <Button
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-5 gap-2 shadow-md"
                  disabled={!copyTitle.trim() || generateCopyMutation.isPending}
                  onClick={() => {
                    generateCopyMutation.mutate({
                      title: copyTitle,
                      category: copyCategory || undefined,
                      targetAudience: copyAudience || undefined,
                      tone: copyTone,
                      features: copyFeatures ? copyFeatures.split("\n").filter(Boolean) : undefined,
                      language: copyLanguage,
                    });
                  }}
                >
                  {generateCopyMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Génération par l'IA en cours...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Générer la Fiche Produit
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Results */}
            <div className="lg:col-span-7 space-y-6">
              {generatedCopy ? (
                <div className="space-y-6">
                  <Card className="border-orange-200 dark:border-orange-900/50 shadow-md">
                    <CardHeader className="bg-orange-50/50 dark:bg-orange-950/20 border-b border-orange-100 dark:border-orange-900/30 flex flex-row items-center justify-between py-4">
                      <div>
                        <Badge className="bg-orange-600 hover:bg-orange-700 text-white mb-1">
                          Résultat IA Généré
                        </Badge>
                        <CardTitle className="text-lg font-bold">{generatedCopy.title}</CardTitle>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(JSON.stringify(generatedCopy, null, 2), "Résultat complet")}
                        className="gap-1.5 text-xs"
                      >
                        {copiedField === "Résultat complet" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        Copier tout
                      </Button>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                      {/* Tagline */}
                      <div>
                        <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-1">
                          <span>Slogan Accrocheur</span>
                          <button
                            onClick={() => copyToClipboard(generatedCopy.tagline, "Slogan")}
                            className="text-orange-600 hover:underline flex items-center gap-1"
                          >
                            <Copy className="w-3 h-3" /> Copier
                          </button>
                        </div>
                        <p className="text-sm font-medium italic text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-900 p-3 rounded-lg border border-slate-200/80 dark:border-slate-800">
                          "{generatedCopy.tagline}"
                        </p>
                      </div>

                      {/* Description */}
                      <div>
                        <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-1">
                          <span>Description Commerciale (HTML)</span>
                          <button
                            onClick={() => copyToClipboard(generatedCopy.description, "Description")}
                            className="text-orange-600 hover:underline flex items-center gap-1"
                          >
                            <Copy className="w-3 h-3" /> Copier HTML
                          </button>
                        </div>
                        <div
                          className="prose prose-sm dark:prose-invert max-w-none bg-slate-50 dark:bg-slate-900 p-4 rounded-lg border border-slate-200/80 dark:border-slate-800 text-xs sm:text-sm leading-relaxed"
                          dangerouslySetInnerHTML={{ __html: generatedCopy.description }}
                        />
                      </div>

                      {/* Bullet points */}
                      <div>
                        <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-2">
                          <span>Points Forts Client</span>
                          <button
                            onClick={() => copyToClipboard(generatedCopy.bulletPoints.join("\n"), "Points forts")}
                            className="text-orange-600 hover:underline flex items-center gap-1"
                          >
                            <Copy className="w-3 h-3" /> Copier la liste
                          </button>
                        </div>
                        <ul className="space-y-2">
                          {generatedCopy.bulletPoints?.map((bp: string, idx: number) => (
                            <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                              <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300 flex items-center justify-center shrink-0 font-bold text-[10px]">
                                ✓
                              </span>
                              <span>{bp}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* SEO Preview */}
                      <div className="p-4 bg-slate-100 dark:bg-slate-900 rounded-xl space-y-2 text-xs">
                        <p className="font-semibold text-slate-600 dark:text-slate-400">Aperçu Référencement Google</p>
                        <p className="text-blue-600 dark:text-blue-400 font-medium text-sm truncate">{generatedCopy.seoTitle}</p>
                        <p className="text-slate-600 dark:text-slate-400 line-clamp-2">{generatedCopy.seoDescription}</p>
                        <div className="flex flex-wrap gap-1 pt-1">
                          {generatedCopy.keywords?.map((kw: string, i: number) => (
                            <Badge key={i} variant="outline" className="text-[10px] bg-white dark:bg-slate-800">
                              #{kw}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center text-slate-400 space-y-3 bg-slate-50/50 dark:bg-slate-900/30">
                  <Wand2 className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-700" />
                  <p className="font-semibold text-slate-600 dark:text-slate-400">Aucune fiche générée pour le moment</p>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    Remplissez le nom de votre produit sur la gauche et cliquez sur "Générer la Fiche Produit" pour obtenir votre texte de vente.
                  </p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        {/* TAB 2: SEO OPTIMIZER */}
        <TabsContent value="seo" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <Card className="lg:col-span-5 border-slate-200 dark:border-slate-800">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Search className="w-5 h-5 text-blue-600" />
                  Optimiseur SEO Google
                </CardTitle>
                <CardDescription>
                  Améliorez vos positions sur les moteurs de recherche avec des balises ciblées.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="seoTitle" className="text-xs font-semibold">Titre actuel du produit *</Label>
                  <Input
                    id="seoTitle"
                    placeholder="T-shirt coton bio"
                    value={seoTitle}
                    onChange={(e) => setSeoTitle(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="seoDesc" className="text-xs font-semibold">Description ou contexte</Label>
                  <Textarea
                    id="seoDesc"
                    placeholder="T-shirt 100% coton biologique, broderie fait main..."
                    rows={4}
                    value={seoDesc}
                    onChange={(e) => setSeoDesc(e.target.value)}
                    className="mt-1"
                  />
                </div>

                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-5 gap-2"
                  disabled={!seoTitle.trim() || enhanceSeoMutation.isPending}
                  onClick={() => {
                    enhanceSeoMutation.mutate({
                      title: seoTitle,
                      description: seoDesc || undefined,
                    });
                  }}
                >
                  {enhanceSeoMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Analyse SEO en cours...
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4" />
                      Optimiser le Référencement
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <div className="lg:col-span-7 space-y-6">
              {generatedSeo ? (
                <Card className="border-blue-200 dark:border-blue-900/50 shadow-md">
                  <CardHeader className="bg-blue-50/50 dark:bg-blue-950/20 border-b border-blue-100 dark:border-blue-900/30">
                    <CardTitle className="text-lg font-bold text-blue-900 dark:text-blue-100">
                      Résultats de l'Optimisation SEO
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-5">
                    <div>
                      <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-1">
                        <span>Titre Produit Commercial Optimisé</span>
                        <button onClick={() => copyToClipboard(generatedSeo.optimizedTitle, "Titre optimisé")} className="text-blue-600 hover:underline">
                          Copier
                        </button>
                      </div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-slate-900 p-3 rounded-lg border">
                        {generatedSeo.optimizedTitle}
                      </p>
                    </div>

                    <div>
                      <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-1">
                        <span>Balise &lt;title&gt; (Google Title)</span>
                        <button onClick={() => copyToClipboard(generatedSeo.seoTitle, "SEO Title")} className="text-blue-600 hover:underline">
                          Copier
                        </button>
                      </div>
                      <p className="text-sm text-blue-600 dark:text-blue-400 font-medium bg-slate-50 dark:bg-slate-900 p-3 rounded-lg border">
                        {generatedSeo.seoTitle}
                      </p>
                    </div>

                    <div>
                      <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-1">
                        <span>Méta-Description Google</span>
                        <button onClick={() => copyToClipboard(generatedSeo.seoDescription, "Méta-description")} className="text-blue-600 hover:underline">
                          Copier
                        </button>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900 p-3 rounded-lg border">
                        {generatedSeo.seoDescription}
                      </p>
                    </div>

                    <div>
                      <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-1">
                        <span>Slug URL Canonique</span>
                        <button onClick={() => copyToClipboard(generatedSeo.slug, "URL Slug")} className="text-blue-600 hover:underline">
                          Copier
                        </button>
                      </div>
                      <code className="text-xs bg-slate-100 dark:bg-slate-800 px-3 py-2 rounded font-mono block">
                        /{generatedSeo.slug}
                      </code>
                    </div>

                    <div>
                      <span className="text-xs font-semibold text-slate-500 block mb-2">Mots-clés Clés de Recherche</span>
                      <div className="flex flex-wrap gap-1.5">
                        {generatedSeo.keywords?.map((kw: string, i: number) => (
                          <Badge key={i} className="bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-200 border-none">
                            {kw}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center text-slate-400 bg-slate-50/50 dark:bg-slate-900/30">
                  <Search className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
                  <p className="font-semibold text-slate-600 dark:text-slate-400">Analyseur SEO Prêt</p>
                  <p className="text-xs text-slate-400">Entrez votre titre pour générer les balises Google stratégiques.</p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        {/* TAB 3: TRANSLATOR */}
        <TabsContent value="translator" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <Card className="lg:col-span-5 border-slate-200 dark:border-slate-800">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Globe2 className="w-5 h-5 text-emerald-600" />
                  Traducteur IA Multi-Langues
                </CardTitle>
                <CardDescription>
                  Traduction fluide et adaptée aux codes commerciaux régionaux.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-xs font-semibold">Langue Cible de Traduction</Label>
                  <Select value={transLang} onValueChange={(v: any) => setTransLang(v)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="de">🇩🇪 Allemand (Deutsch - Suisse / Allemagne)</SelectItem>
                      <SelectItem value="en">🇬🇧 Anglais (English - Global)</SelectItem>
                      <SelectItem value="ar">🇩🇿/🇸🇦 Arabe (العربية - Maghreb / Moyen-Orient)</SelectItem>
                      <SelectItem value="it">🇮🇹 Italien (Italiano - Suisse / Italie)</SelectItem>
                      <SelectItem value="es">🇪🇸 Espagnol (Español)</SelectItem>
                      <SelectItem value="nl">🇳🇱 Néerlandais (Nederlands)</SelectItem>
                      <SelectItem value="fr">🇫🇷 Français (Révision)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="transTitle" className="text-xs font-semibold">Titre du produit *</Label>
                  <Input
                    id="transTitle"
                    placeholder="ex: Sweat à Capuche Coton Bio"
                    value={transTitle}
                    onChange={(e) => setTransTitle(e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="transDesc" className="text-xs font-semibold">Description à traduire *</Label>
                  <Textarea
                    id="transDesc"
                    placeholder="Collez ici le texte complet..."
                    rows={5}
                    value={transDesc}
                    onChange={(e) => setTransDesc(e.target.value)}
                    className="mt-1"
                  />
                </div>

                <Button
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-5 gap-2"
                  disabled={!transTitle.trim() || !transDesc.trim() || translateMutation.isPending}
                  onClick={() => {
                    translateMutation.mutate({
                      title: transTitle,
                      tagline: transTagline || undefined,
                      description: transDesc,
                      targetLanguage: transLang,
                    });
                  }}
                >
                  {translateMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Traduction IA en cours...
                    </>
                  ) : (
                    <>
                      <Globe2 className="w-4 h-4" />
                      Traduire en {transLang.toUpperCase()}
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <div className="lg:col-span-7 space-y-6">
              {generatedTrans ? (
                <Card className="border-emerald-200 dark:border-emerald-900/50 shadow-md">
                  <CardHeader className="bg-emerald-50/50 dark:bg-emerald-950/20 border-b border-emerald-100 dark:border-emerald-900/30">
                    <CardTitle className="text-lg font-bold text-emerald-900 dark:text-emerald-100">
                      Traduction [{generatedTrans.targetLanguage.toUpperCase()}]
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-5">
                    <div>
                      <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-1">
                        <span>Titre Traduit</span>
                        <button onClick={() => copyToClipboard(generatedTrans.title, "Titre traduit")} className="text-emerald-600 hover:underline">
                          Copier
                        </button>
                      </div>
                      <p className="text-base font-bold text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-slate-900 p-3 rounded-lg border">
                        {generatedTrans.title}
                      </p>
                    </div>

                    <div>
                      <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-1">
                        <span>Description Traduite</span>
                        <button onClick={() => copyToClipboard(generatedTrans.description, "Description traduite")} className="text-emerald-600 hover:underline">
                          Copier
                        </button>
                      </div>
                      <div className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-900 p-4 rounded-lg border leading-relaxed">
                        {generatedTrans.description}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center text-slate-400 bg-slate-50/50 dark:bg-slate-900/30">
                  <Globe2 className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
                  <p className="font-semibold text-slate-600 dark:text-slate-400">Traducteur Prêt</p>
                  <p className="text-xs text-slate-400">Sélectionnez la langue souhaitée et lancez la traduction instantanée.</p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        {/* TAB 4: FAQ */}
        <TabsContent value="faq" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <Card className="lg:col-span-5 border-slate-200 dark:border-slate-800">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-purple-600" />
                  Générateur de FAQ Produit
                </CardTitle>
                <CardDescription>
                  Générez les questions/réponses de réassurance pour lever les freins à l'achat.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="faqTitle" className="text-xs font-semibold">Produit concerné *</Label>
                  <Input
                    id="faqTitle"
                    placeholder="ex: Machine à café Expresso Compacte"
                    value={faqTitle}
                    onChange={(e) => setFaqTitle(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="faqCategory" className="text-xs font-semibold">Catégorie</Label>
                  <Input
                    id="faqCategory"
                    placeholder="Électroménager"
                    value={faqCategory}
                    onChange={(e) => setFaqCategory(e.target.value)}
                    className="mt-1"
                  />
                </div>

                <Button
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-5 gap-2"
                  disabled={!faqTitle.trim() || generateFaqMutation.isPending}
                  onClick={() => {
                    generateFaqMutation.mutate({
                      title: faqTitle,
                      category: faqCategory || undefined,
                    });
                  }}
                >
                  {generateFaqMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Génération FAQ...
                    </>
                  ) : (
                    <>
                      <MessageSquare className="w-4 h-4" />
                      Générer la FAQ Réassurance
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <div className="lg:col-span-7 space-y-6">
              {generatedFaq.length > 0 ? (
                <div className="space-y-4">
                  {generatedFaq.map((item, idx) => (
                    <Card key={idx} className="border-purple-200 dark:border-purple-900/50">
                      <CardHeader className="py-3 bg-purple-50/50 dark:bg-purple-950/20 border-b border-purple-100 dark:border-purple-900/30">
                        <CardTitle className="text-sm font-semibold text-purple-950 dark:text-purple-100 flex items-center gap-2">
                          <HelpCircle className="w-4 h-4 text-purple-600 shrink-0" />
                          {item.question}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                        {item.answer}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center text-slate-400 bg-slate-50/50 dark:bg-slate-900/30">
                  <HelpCircle className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
                  <p className="font-semibold text-slate-600 dark:text-slate-400">FAQ Réassurance Prête</p>
                  <p className="text-xs text-slate-400">Entrez le produit pour obtenir des réponses aux questions fréquentes des acheteurs.</p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
