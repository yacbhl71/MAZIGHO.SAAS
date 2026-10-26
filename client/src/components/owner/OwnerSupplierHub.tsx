import { useState, useMemo } from "react";
import {
  Building2,
  CheckCircle2,
  Clock,
  DollarSign,
  ExternalLink,
  Flame,
  Globe2,
  HelpCircle,
  Import,
  KeyRound,
  Layers,
  Loader2,
  PackageCheck,
  PackagePlus,
  PackageSearch,
  Percent,
  Plus,
  RefreshCw,
  Search,
  ShieldAlert,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Tag,
  Trash2,
  Truck,
  Wand2,
} from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  SUPPLIER_PROVIDERS_META,
  type SupplierProvider,
  type StoreSupplierConnection,
  type SupplierProductDraft,
  type SupplierSearchResultItem,
} from "@shared/supplierHub";

type Category = { id: number; name: string };

export default function OwnerSupplierHub({
  categories,
  currencyCode = "CHF",
  onProductPublished,
}: {
  categories: Category[];
  currencyCode?: string;
  onProductPublished?: () => void;
}) {
  const [activeTab, setActiveTab] = useState<"connections" | "sourcing" | "drafts">("connections");
  const utils = trpc.useUtils();

  // 1. QUERIES
  const connectionsQuery = trpc.supplierHub.getConnections.useQuery();
  const draftsQuery = trpc.supplierHub.getDrafts.useQuery();

  // 2. SEARCH & SOURCING STATE
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProviderFilter, setSelectedProviderFilter] = useState<SupplierProvider | undefined>(undefined);
  const [urlInput, setUrlInput] = useState("");

  const searchCatalogQuery = trpc.supplierHub.searchCatalog.useQuery(
    { query: searchQuery, provider: selectedProviderFilter },
    { enabled: activeTab === "sourcing" }
  );

  // 3. CONNECTION MODAL STATE
  const [editingProvider, setEditingProvider] = useState<SupplierProvider | null>(null);
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [accountLabelInput, setAccountLabelInput] = useState("");

  // 4. DRAFT EDIT MODAL STATE
  const [editingDraft, setEditingDraft] = useState<SupplierProductDraft | null>(null);
  const [draftTitle, setDraftTitle] = useState("");
  const [draftDescription, setDraftDescription] = useState("");
  const [draftSellingPrice, setDraftSellingPrice] = useState("");
  const [draftCategoryId, setDraftCategoryId] = useState<number | undefined>(undefined);

  // 5. MUTATIONS
  const saveConnectionMutation = trpc.supplierHub.saveConnection.useMutation({
    onSuccess: (res) => {
      toast.success(`Connexion enregistrée avec succès pour ${SUPPLIER_PROVIDERS_META[res.provider].name}.`);
      setEditingProvider(null);
      setApiKeyInput("");
      setAccountLabelInput("");
      utils.supplierHub.getConnections.invalidate();
    },
    onError: (err) => toast.error(err.message || "Erreur d'enregistrement."),
  });

  const testConnectionMutation = trpc.supplierHub.testConnection.useMutation({
    onSuccess: (res) => {
      if (res.success) {
        toast.success(res.message);
      } else {
        toast.error(res.message);
      }
      utils.supplierHub.getConnections.invalidate();
    },
    onError: (err) => toast.error(err.message || "Erreur lors du test."),
  });

  const removeConnectionMutation = trpc.supplierHub.removeConnection.useMutation({
    onSuccess: () => {
      toast.info("Connexion fournisseur révoquée.");
      utils.supplierHub.getConnections.invalidate();
    },
    onError: (err) => toast.error(err.message || "Erreur de suppression."),
  });

  const importUrlMutation = trpc.supplierHub.importUrl.useMutation({
    onSuccess: (draft) => {
      toast.success(`Fiche importée : "${draft.title}". Retrouvez-la dans vos brouillons.`);
      setUrlInput("");
      utils.supplierHub.getDrafts.invalidate();
      setActiveTab("drafts");
    },
    onError: (err) => toast.error(err.message || "Impossible d'importer cette URL."),
  });

  const stageItemMutation = trpc.supplierHub.stageCatalogItemToDraft.useMutation({
    onSuccess: (draft) => {
      toast.success(`Ajouté aux brouillons : "${draft.title}"`);
      utils.supplierHub.getDrafts.invalidate();
    },
    onError: (err) => toast.error(err.message || "Impossible d'ajouter ce produit."),
  });

  const updateDraftMutation = trpc.supplierHub.updateDraft.useMutation({
    onSuccess: () => {
      toast.success("Brouillon mis à jour avec calcul de marge.");
      setEditingDraft(null);
      utils.supplierHub.getDrafts.invalidate();
    },
    onError: (err) => toast.error(err.message || "Erreur lors de la mise à jour."),
  });

  const deleteDraftMutation = trpc.supplierHub.deleteDraft.useMutation({
    onSuccess: () => {
      toast.info("Brouillon supprimé.");
      utils.supplierHub.getDrafts.invalidate();
    },
    onError: (err) => toast.error(err.message || "Erreur lors de la suppression."),
  });

  const publishDraftMutation = trpc.supplierHub.publishDraft.useMutation({
    onSuccess: (res) => {
      toast.success("Produit publié avec succès dans le catalogue de votre boutique !");
      utils.supplierHub.getDrafts.invalidate();
      if (onProductPublished) onProductPublished();
    },
    onError: (err) => toast.error(err.message || "Impossible de publier ce produit."),
  });

  // Helpers
  const formatMoney = (cents: number) => {
    return (cents / 100).toFixed(2) + " " + currencyCode;
  };

  const openConnectionModal = (provider: SupplierProvider) => {
    const existing = connectionsQuery.data?.find((c) => c.provider === provider);
    setEditingProvider(provider);
    setAccountLabelInput(existing?.accountLabel || "");
    setApiKeyInput("");
  };

  const openEditDraftModal = (draft: SupplierProductDraft) => {
    setEditingDraft(draft);
    setDraftTitle(draft.title);
    setDraftDescription(draft.description);
    setDraftSellingPrice((draft.sellingPriceCents / 100).toFixed(2));
    setDraftCategoryId(categories[0]?.id);
  };

  const handleSaveDraftChanges = () => {
    if (!editingDraft) return;
    const priceCents = Math.round(parseFloat(draftSellingPrice.replace(",", ".")) * 100);
    if (isNaN(priceCents) || priceCents <= 0) {
      toast.error("Veuillez indiquer un prix de vente valide.");
      return;
    }
    updateDraftMutation.mutate({
      draftId: editingDraft.id,
      title: draftTitle,
      description: draftDescription,
      sellingPriceCents: priceCents,
    });
  };

  return (
    <div className="space-y-6" data-testid="owner-supplier-hub">
      {/* 1. HEADER BANNER */}
      <section className="relative overflow-hidden rounded-3xl border border-orange-200/80 bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-white p-6 md:p-8 shadow-sm">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-600 px-3 py-1 text-xs font-bold text-white shadow-xs">
                <Sparkles className="h-3.5 w-3.5" /> Hub Fournisseurs
              </span>
              <Badge variant="outline" className="border-emerald-300 bg-emerald-50 text-emerald-800 font-medium">
                <ShieldCheck className="mr-1 h-3.5 w-3.5 text-emerald-600" /> Multi-Tenant Étanche
              </Badge>
              <Badge variant="outline" className="border-amber-300 bg-amber-50 text-amber-900 font-medium">
                Contrôle Manuel Obligatoire
              </Badge>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900">
              Sourcing & Dropshipping Multi-Boutiques
            </h2>
            <p className="max-w-3xl text-sm leading-relaxed text-slate-600">
              Connectez vos comptes privés (<strong>CJdropshipping, AliExpress, Printful, Printify</strong>),
              sourcez des références de qualité et éditez vos marges avant publication dans votre vitrine.
              Vos accès et vos clés restent 100 % isolés à votre boutique.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 md:flex-col md:items-end">
            <Button
              onClick={() => setActiveTab("sourcing")}
              className="bg-orange-600 font-semibold text-white hover:bg-orange-700 shadow-sm cursor-pointer"
            >
              <Search className="mr-2 h-4 w-4" /> Sourcer des produits
            </Button>
            <Button
              variant="outline"
              onClick={() => setActiveTab("drafts")}
              className="border-slate-300 font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              <Layers className="mr-2 h-4 w-4" /> Brouillons ({draftsQuery.data?.length || 0})
            </Button>
          </div>
        </div>
      </section>

      {/* 2. TABS WORKFLOW */}
      <Tabs value={activeTab} onValueChange={(val: any) => setActiveTab(val)} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 bg-slate-100 p-1 rounded-2xl h-12">
          <TabsTrigger
            value="connections"
            className="rounded-xl font-bold text-xs md:text-sm data-[state=active]:bg-white data-[state=active]:text-orange-600 data-[state=active]:shadow-xs"
          >
            <KeyRound className="mr-2 h-4 w-4" />
            1. Connexions Fournisseurs
          </TabsTrigger>
          <TabsTrigger
            value="sourcing"
            className="rounded-xl font-bold text-xs md:text-sm data-[state=active]:bg-white data-[state=active]:text-orange-600 data-[state=active]:shadow-xs"
          >
            <Search className="mr-2 h-4 w-4" />
            2. Recherche & Sourcing
          </TabsTrigger>
          <TabsTrigger
            value="drafts"
            className="rounded-xl font-bold text-xs md:text-sm data-[state=active]:bg-white data-[state=active]:text-orange-600 data-[state=active]:shadow-xs"
          >
            <PackageCheck className="mr-2 h-4 w-4" />
            3. Atelier d'Édition & Publication ({draftsQuery.data?.length || 0})
          </TabsTrigger>
        </TabsList>

        {/* ======================================================== */}
        {/* TAB 1: CONNEXIONS FOURNISSEURS                           */}
        {/* ======================================================== */}
        <TabsContent value="connections" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Fournisseurs & Intégrations Directes</h3>
              <p className="text-xs text-slate-500">
                Vos clés privées sont chiffrées et ne sont jamais transmises à des tiers.
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => utils.supplierHub.getConnections.invalidate()}
              className="text-xs text-slate-500 hover:text-slate-800"
            >
              <RefreshCw className="mr-1.5 h-3.5 w-3.5" /> Actualiser l'état
            </Button>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {(["cjdropshipping", "aliexpress", "printful", "printify"] as SupplierProvider[]).map((providerId) => {
              const meta = SUPPLIER_PROVIDERS_META[providerId];
              const conn = connectionsQuery.data?.find((c) => c.provider === providerId);
              const isConnected = conn?.status === "connected";
              const isTesting = testConnectionMutation.isPending && testConnectionMutation.variables?.provider === providerId;

              return (
                <Card key={providerId} className="overflow-hidden border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
                  <CardHeader className="p-5 pb-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-lg font-bold text-slate-900">{meta.name}</CardTitle>
                          <Badge variant="outline" className="text-[10px] font-semibold text-slate-600">
                            {meta.typeLabel}
                          </Badge>
                          <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">
                            {meta.badge}
                          </span>
                        </div>
                        <CardDescription className="text-xs text-slate-600 line-clamp-2">
                          {meta.description}
                        </CardDescription>
                      </div>

                      {isConnected ? (
                        <Badge className="bg-emerald-500 text-white font-bold text-[11px] shadow-xs">
                          <CheckCircle2 className="mr-1 h-3 w-3" /> Connecté
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-slate-100 text-slate-600 text-[11px]">
                          Non connecté
                        </Badge>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="p-5 pt-0 space-y-4">
                    {/* Features list */}
                    <div className="rounded-xl bg-slate-50 p-3 space-y-1.5 border border-slate-100">
                      {meta.features.slice(0, 3).map((f, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs text-slate-600">
                          <div className="h-1.5 w-1.5 rounded-full bg-orange-500 shrink-0" />
                          <span>{f}</span>
                        </div>
                      ))}
                    </div>

                    {/* Account status & masked key if connected */}
                    {isConnected && conn && (
                      <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-3 text-xs space-y-1 text-emerald-950">
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-emerald-900">Compte :</span>
                          <span className="font-mono text-emerald-800">{conn.accountLabel}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-emerald-900">Clé API :</span>
                          <span className="font-mono text-slate-700 bg-white px-2 py-0.5 rounded border border-emerald-200">
                            {conn.apiKeyMasked}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center gap-2">
                        {isConnected ? (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => testConnectionMutation.mutate({ provider: providerId })}
                              disabled={isTesting}
                              className="text-xs font-semibold h-8 cursor-pointer"
                            >
                              {isTesting ? <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="mr-1 h-3.5 w-3.5" />}
                              Tester l'API
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => removeConnectionMutation.mutate({ provider: providerId })}
                              className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50 h-8 cursor-pointer"
                            >
                              Déconnecter
                            </Button>
                          </>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => openConnectionModal(providerId)}
                            className="bg-orange-600 font-semibold text-white hover:bg-orange-700 text-xs h-8 cursor-pointer"
                          >
                            <KeyRound className="mr-1.5 h-3.5 w-3.5" />
                            Connecter ce fournisseur
                          </Button>
                        )}
                      </div>

                      <a
                        href={meta.websiteUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-medium text-slate-400 hover:text-slate-700 flex items-center gap-1"
                      >
                        Site officiel <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* ======================================================== */}
        {/* TAB 2: RECHERCHE & SOURCING                              */}
        {/* ======================================================== */}
        <TabsContent value="sourcing" className="space-y-6">
          {/* Quick URL Import Box */}
          <Card className="border-orange-200 bg-gradient-to-r from-orange-50/50 via-white to-amber-50/30">
            <CardHeader className="p-5 pb-2">
              <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Import className="h-4 w-4 text-orange-600" /> Sourcing Rapide par URL de Produit
              </CardTitle>
              <CardDescription className="text-xs text-slate-600">
                Collez le lien direct d'un article AliExpress, CJdropshipping, Printful ou Printify pour en extraire instantanément la fiche.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5 pt-1">
              <div className="flex flex-col sm:flex-row gap-2">
                <Input
                  placeholder="https://www.aliexpress.com/item/... ou https://cjdropshipping.com/product/..."
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  className="bg-white text-sm"
                />
                <Button
                  onClick={() => {
                    if (!urlInput.trim()) {
                      toast.error("Veuillez renseigner une URL valide.");
                      return;
                    }
                    importUrlMutation.mutate({ url: urlInput });
                  }}
                  disabled={importUrlMutation.isPending}
                  className="bg-orange-600 font-bold text-white hover:bg-orange-700 shrink-0 cursor-pointer"
                >
                  {importUrlMutation.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Import className="mr-2 h-4 w-4" />
                  )}
                  Importer dans les brouillons
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Unified Catalog Search Bar */}
          <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="relative w-full md:max-w-md">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Rechercher des produits (théière, sweat, lampe, céramique...)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-white"
              />
            </div>

            <div className="flex flex-wrap gap-1.5 w-full md:w-auto">
              <Button
                variant={selectedProviderFilter === undefined ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedProviderFilter(undefined)}
                className={`text-xs h-8 cursor-pointer ${
                  selectedProviderFilter === undefined ? "bg-slate-900 text-white" : ""
                }`}
              >
                Tous les fournisseurs
              </Button>
              {(["cjdropshipping", "aliexpress", "printful", "printify"] as SupplierProvider[]).map((p) => (
                <Button
                  key={p}
                  variant={selectedProviderFilter === p ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedProviderFilter(p)}
                  className={`text-xs h-8 cursor-pointer ${
                    selectedProviderFilter === p ? "bg-orange-600 text-white hover:bg-orange-700" : ""
                  }`}
                >
                  {SUPPLIER_PROVIDERS_META[p].name}
                </Button>
              ))}
            </div>
          </div>

          {/* Catalog Search Results Grid */}
          <div className="space-y-3">
            <div className="text-xs font-semibold text-slate-500">
              {searchCatalogQuery.data?.length || 0} référence(s) disponible(s) au sourcing direct :
            </div>

            {searchCatalogQuery.isLoading ? (
              <div className="grid place-items-center py-16 text-slate-500">
                <Loader2 className="h-8 w-8 animate-spin text-orange-600 mb-2" />
                <span className="text-sm">Interrogation des catalogues fournisseurs...</span>
              </div>
            ) : searchCatalogQuery.data?.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center text-slate-500">
                <PackageSearch className="mx-auto h-10 w-10 text-slate-400 mb-2" />
                <p className="font-semibold text-slate-800">Aucun produit ne correspond à cette recherche.</p>
                <p className="text-xs text-slate-500 mt-1">Essayez avec un autre mot-clé ou collez directement une URL.</p>
              </div>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {searchCatalogQuery.data?.map((item) => {
                  const meta = SUPPLIER_PROVIDERS_META[item.provider];
                  const defaultSellingPrice = Math.round((item.sourcePriceCents + item.supplierShippingEstimateCents) * 2.2);
                  const profit = defaultSellingPrice - (item.sourcePriceCents + item.supplierShippingEstimateCents);

                  return (
                    <Card key={item.id} className="overflow-hidden flex flex-col border-slate-200/80 shadow-xs hover:shadow-md transition-all">
                      <div className="relative aspect-square w-full overflow-hidden bg-slate-100">
                        <img
                          src={item.thumbnail}
                          alt={item.title}
                          className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                        />
                        <div className="absolute top-2 left-2 flex gap-1">
                          <Badge className="bg-slate-900/90 text-white text-[10px] backdrop-blur-xs font-semibold">
                            {meta.name}
                          </Badge>
                        </div>
                        <div className="absolute bottom-2 right-2 bg-emerald-600 text-white font-bold text-[11px] px-2 py-0.5 rounded-full shadow-xs">
                          Marge est. +{formatMoney(profit)}
                        </div>
                      </div>

                      <CardContent className="p-4 flex-1 flex flex-col justify-between space-y-3">
                        <div>
                          <h4 className="font-bold text-sm text-slate-900 line-clamp-2 mb-1" title={item.title}>
                            {item.title}
                          </h4>
                          <p className="text-xs text-slate-500 flex items-center gap-1">
                            <Truck className="h-3 w-3 text-slate-400" />
                            {item.originCountry} &bull; {item.estimatedDeliveryDays}j ouvrés
                          </p>
                        </div>

                        <div className="space-y-2 pt-2 border-t border-slate-100">
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-500">Coût d'achat :</span>
                            <span className="font-semibold text-slate-800">{formatMoney(item.sourcePriceCents)}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-500">Port estimé :</span>
                            <span className="text-slate-700">{formatMoney(item.supplierShippingEstimateCents)}</span>
                          </div>
                          <div className="flex justify-between text-xs font-bold text-orange-950 bg-orange-50 p-1.5 rounded-lg">
                            <span>Prix de vente suggéré :</span>
                            <span className="text-orange-700 font-extrabold">{formatMoney(defaultSellingPrice)}</span>
                          </div>
                        </div>

                        <Button
                          size="sm"
                          onClick={() =>
                            stageItemMutation.mutate({
                              provider: item.provider,
                              supplierProductId: item.id,
                              supplierUrl: item.url,
                              title: item.title,
                              thumbnail: item.thumbnail,
                              sourcePriceCents: item.sourcePriceCents,
                              supplierShippingEstimateCents: item.supplierShippingEstimateCents,
                              stock: item.stock,
                              supplierName: item.supplierName,
                              originCountry: item.originCountry,
                              estimatedDeliveryDays: item.estimatedDeliveryDays,
                            })
                          }
                          disabled={stageItemMutation.isPending}
                          className="w-full bg-slate-900 font-bold text-white hover:bg-orange-600 transition-colors text-xs cursor-pointer"
                        >
                          <Plus className="mr-1.5 h-3.5 w-3.5" />
                          Ajouter aux brouillons
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </TabsContent>

        {/* ======================================================== */}
        {/* TAB 3: ATELIER D'ÉDITION & PUBLICATION                   */}
        {/* ======================================================== */}
        <TabsContent value="drafts" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900">File d'attente des Brouillons Produits</h3>
              <p className="text-xs text-slate-500">
                Ajustez vos prix, visualisez vos marges nettes réelles et publiez dans le catalogue actif en 1 clic.
              </p>
            </div>
            <Badge variant="outline" className="border-orange-200 bg-orange-50 text-orange-800 font-semibold">
              {draftsQuery.data?.length || 0} produit(s) en préparation
            </Badge>
          </div>

          {draftsQuery.isLoading ? (
            <div className="grid place-items-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-orange-600 mb-2" />
              <span className="text-sm text-slate-500">Chargement de votre atelier...</span>
            </div>
          ) : draftsQuery.data?.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center">
              <ShoppingBag className="mx-auto h-12 w-12 text-slate-300 mb-2" />
              <h4 className="font-bold text-slate-800">Votre file de brouillons est vide</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-4">
                Utilisez l'onglet "Recherche & Sourcing" pour importer des articles qualifiés depuis vos fournisseurs.
              </p>
              <Button
                onClick={() => setActiveTab("sourcing")}
                className="bg-orange-600 font-bold text-white hover:bg-orange-700 cursor-pointer text-xs"
              >
                Aller sourcer des articles
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {draftsQuery.data?.map((draft) => {
                const meta = SUPPLIER_PROVIDERS_META[draft.provider];
                const totalCost = draft.sourcePriceCents + draft.shippingCostCents;
                const netProfit = draft.sellingPriceCents - totalCost;
                const marginPct = totalCost > 0 ? Math.round((netProfit / totalCost) * 100) : 0;
                const isPublished = draft.status === "published";

                return (
                  <Card key={draft.id} className="overflow-hidden border-slate-200/90 shadow-xs hover:border-orange-300 transition-all">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 md:p-5 gap-4">
                      {/* Product Thumbnail & Details */}
                      <div className="flex items-center gap-4 min-w-0">
                        <img
                          src={draft.selectedImages[0] || draft.images[0]}
                          alt={draft.title}
                          className="h-16 w-16 md:h-20 md:w-20 rounded-xl object-cover bg-slate-100 shrink-0 border border-slate-200"
                        />
                        <div className="min-w-0 space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge className="bg-slate-900 text-white text-[10px] font-semibold">
                              {meta.name}
                            </Badge>
                            {isPublished ? (
                              <Badge className="bg-emerald-500 text-white text-[10px] font-bold">
                                En ligne dans la boutique
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="border-amber-300 bg-amber-50 text-amber-900 text-[10px] font-semibold">
                                Brouillon prêt
                              </Badge>
                            )}
                            <span className="text-[11px] text-slate-500 font-mono">
                              Réf : {draft.supplierProductId}
                            </span>
                          </div>
                          <h4 className="font-bold text-base text-slate-900 truncate max-w-md md:max-w-lg">
                            {draft.title}
                          </h4>
                          <p className="text-xs text-slate-500 line-clamp-1 max-w-lg">
                            {draft.description}
                          </p>
                        </div>
                      </div>

                      {/* Margin & Pricing Calculator Block */}
                      <div className="flex flex-wrap md:flex-nowrap items-center gap-6 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-3 md:pt-0">
                        <div className="text-left md:text-right space-y-0.5">
                          <div className="text-[11px] text-slate-500">
                            Coût total : {formatMoney(totalCost)}
                          </div>
                          <div className="text-base font-extrabold text-slate-900">
                            {formatMoney(draft.sellingPriceCents)}
                          </div>
                          <div className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-700">
                            <Percent className="h-3 w-3" />
                            Gain net : +{formatMoney(netProfit)} (+{marginPct}%)
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditDraftModal(draft)}
                            className="font-semibold text-xs border-slate-300 text-slate-700 hover:bg-slate-50 cursor-pointer"
                          >
                            Calculer & Modifier
                          </Button>

                          {!isPublished ? (
                            <Button
                              size="sm"
                              onClick={() => publishDraftMutation.mutate({ draftId: draft.id, categoryId: categories[0]?.id })}
                              disabled={publishDraftMutation.isPending}
                              className="bg-emerald-600 font-bold text-white hover:bg-emerald-700 shadow-xs cursor-pointer text-xs"
                            >
                              {publishDraftMutation.isPending ? (
                                <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <PackagePlus className="mr-1 h-3.5 w-3.5" />
                              )}
                              Mettre en rayon
                            </Button>
                          ) : (
                            <Badge variant="outline" className="border-emerald-300 bg-emerald-50 text-emerald-800 font-bold text-xs py-1.5 px-3">
                              Publié
                            </Badge>
                          )}

                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteDraftMutation.mutate({ draftId: draft.id })}
                            className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50 cursor-pointer"
                            title="Supprimer ce brouillon"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* ======================================================== */}
      {/* DIALOG 1: CONFIGURATION CLE FOURNISSEUR                  */}
      {/* ======================================================== */}
      <Dialog open={editingProvider !== null} onOpenChange={(open) => !open && setEditingProvider(null)}>
        <DialogContent className="max-w-lg bg-white rounded-2xl">
          {editingProvider && (
            <>
              <DialogHeader>
                <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <KeyRound className="h-5 w-5 text-orange-600" />
                  Connecter {SUPPLIER_PROVIDERS_META[editingProvider].name}
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-600">
                  Renseignez vos identifiants d'API privés. Vos accès sont stockés de manière chiffrée et isolée à votre boutique.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-3">
                <div className="space-y-1.5">
                  <Label htmlFor="supplier-account-label" className="text-xs font-semibold text-slate-700">
                    Nom du compte (libellé mémotechnique)
                  </Label>
                  <Input
                    id="supplier-account-label"
                    placeholder="ex: Mon compte vendeur principal"
                    value={accountLabelInput}
                    onChange={(e) => setAccountLabelInput(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="supplier-api-key" className="text-xs font-semibold text-slate-700">
                    {SUPPLIER_PROVIDERS_META[editingProvider].keyLabel}
                  </Label>
                  <Input
                    id="supplier-api-key"
                    type="password"
                    placeholder={SUPPLIER_PROVIDERS_META[editingProvider].keyPlaceholder}
                    value={apiKeyInput}
                    onChange={(e) => setApiKeyInput(e.target.value)}
                  />
                  <p className="text-[11px] text-slate-500">
                    Besoin d'aide ? Consultez la documentation officielle sur{" "}
                    <a
                      href={SUPPLIER_PROVIDERS_META[editingProvider].docsUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-orange-600 underline font-medium"
                    >
                      {SUPPLIER_PROVIDERS_META[editingProvider].docsUrl}
                    </a>
                  </p>
                </div>
              </div>

              <DialogFooter className="flex gap-2 sm:justify-end">
                <Button
                  variant="outline"
                  onClick={() => setEditingProvider(null)}
                  className="cursor-pointer"
                >
                  Annuler
                </Button>
                <Button
                  onClick={() => {
                    if (!apiKeyInput.trim()) {
                      toast.error("Veuillez renseigner votre clé d'API.");
                      return;
                    }
                    saveConnectionMutation.mutate({
                      provider: editingProvider,
                      apiKey: apiKeyInput,
                      accountLabel: accountLabelInput,
                    });
                  }}
                  disabled={saveConnectionMutation.isPending}
                  className="bg-orange-600 font-bold text-white hover:bg-orange-700 cursor-pointer"
                >
                  {saveConnectionMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Enregistrer et Valider
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ======================================================== */}
      {/* DIALOG 2: ATELIER CALCULATEUR DE MARGE & EDIT BROUILLON */}
      {/* ======================================================== */}
      <Dialog open={editingDraft !== null} onOpenChange={(open) => !open && setEditingDraft(null)}>
        <DialogContent className="max-w-2xl bg-white rounded-2xl max-h-[90vh] overflow-y-auto">
          {editingDraft && (
            <>
              <DialogHeader>
                <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-emerald-600" />
                  Atelier Commercial & Calculateur de Marge
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-600">
                  Ajustez votre prix de vente et visualisez en temps réel votre marge nette sur ce produit.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-5 py-3">
                {/* Product Title */}
                <div className="space-y-1.5">
                  <Label htmlFor="draft-title" className="text-xs font-semibold text-slate-700">
                    Nom commercial du produit dans votre boutique
                  </Label>
                  <Input
                    id="draft-title"
                    value={draftTitle}
                    onChange={(e) => setDraftTitle(e.target.value)}
                  />
                </div>

                {/* Pricing & Margin Calculator Card */}
                {(() => {
                  const sourcePrice = editingDraft.sourcePriceCents / 100;
                  const shippingCost = editingDraft.shippingCostCents / 100;
                  const totalCost = sourcePrice + shippingCost;
                  const selling = parseFloat(draftSellingPrice.replace(",", ".")) || 0;
                  const netProfit = selling - totalCost;
                  const marginPct = totalCost > 0 ? Math.round((netProfit / totalCost) * 100) : 0;

                  return (
                    <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50/60 to-white p-5 space-y-4">
                      <div className="flex items-center justify-between border-b border-emerald-200/60 pb-3">
                        <span className="text-xs font-bold text-emerald-950 uppercase tracking-wider">
                          Décomposition de la Marge
                        </span>
                        <Badge className="bg-emerald-600 text-white font-bold text-xs">
                          {marginPct >= 0 ? `+${marginPct}% de marge` : `${marginPct}% (vente à perte)`}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-3 gap-3 text-center">
                        <div className="rounded-xl bg-white p-3 border border-slate-200 shadow-2xs">
                          <div className="text-[11px] text-slate-500">Coût Fournisseur</div>
                          <div className="text-sm font-bold text-slate-800">{formatMoney(editingDraft.sourcePriceCents)}</div>
                        </div>
                        <div className="rounded-xl bg-white p-3 border border-slate-200 shadow-2xs">
                          <div className="text-[11px] text-slate-500">Frais de Port</div>
                          <div className="text-sm font-bold text-slate-800">{formatMoney(editingDraft.shippingCostCents)}</div>
                        </div>
                        <div className="rounded-xl bg-emerald-100/70 p-3 border border-emerald-300 shadow-2xs">
                          <div className="text-[11px] text-emerald-900 font-semibold">Gain Net Réel</div>
                          <div className="text-base font-extrabold text-emerald-700">
                            {netProfit >= 0 ? `+${netProfit.toFixed(2)}` : netProfit.toFixed(2)} {currencyCode}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1.5 pt-1">
                        <Label htmlFor="draft-selling-price" className="text-xs font-bold text-slate-800 flex justify-between">
                          <span>Prix de vente fixé pour vos clients ({currencyCode})</span>
                          <span className="text-emerald-700 font-extrabold">Coût de revient : {totalCost.toFixed(2)} {currencyCode}</span>
                        </Label>
                        <Input
                          id="draft-selling-price"
                          type="number"
                          step="0.10"
                          value={draftSellingPrice}
                          onChange={(e) => setDraftSellingPrice(e.target.value)}
                          className="text-lg font-bold text-orange-600 bg-white"
                        />
                      </div>
                    </div>
                  );
                })()}

                {/* Product Description */}
                <div className="space-y-1.5">
                  <Label htmlFor="draft-desc" className="text-xs font-semibold text-slate-700">
                    Description de la fiche produit
                  </Label>
                  <Textarea
                    id="draft-desc"
                    rows={4}
                    value={draftDescription}
                    onChange={(e) => setDraftDescription(e.target.value)}
                  />
                </div>
              </div>

              <DialogFooter className="flex gap-2 sm:justify-end">
                <Button
                  variant="outline"
                  onClick={() => setEditingDraft(null)}
                  className="cursor-pointer"
                >
                  Annuler
                </Button>
                <Button
                  onClick={handleSaveDraftChanges}
                  disabled={updateDraftMutation.isPending}
                  className="bg-emerald-600 font-bold text-white hover:bg-emerald-700 cursor-pointer"
                >
                  {updateDraftMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Valider les réglages de marge
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
