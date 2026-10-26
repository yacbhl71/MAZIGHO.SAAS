import { useState } from "react";
import { Download, FileUp, Loader2, ArrowRight, CheckCircle2, ShoppingBag, Sparkles, Layers, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import type { ShopifyImportReport } from "@shared/shopifyMigration";

export default function OwnerShopifyMigration({ onImportCompleted }: { onImportCompleted?: () => void }) {
  const [rawCsv, setRawCsv] = useState("");
  const [report, setReport] = useState<ShopifyImportReport | null>(null);

  const previewMutation = trpc.shopifyMigration.previewShopifyImport.useMutation({
    onSuccess: (data) => {
      setReport(data);
      toast.success(`${data.totalProducts} produit(s) Shopify détecté(s) !`);
    },
    onError: (err) => toast.error(err.message || "Erreur d'analyse du fichier Shopify CSV."),
  });

  const confirmMutation = trpc.shopifyMigration.confirmShopifyImport.useMutation({
    onSuccess: (res) => {
      toast.success(res.message);
      setRawCsv("");
      setReport(null);
      if (onImportCompleted) onImportCompleted();
    },
    onError: (err) => toast.error(err.message || "Erreur de migration."),
  });

  const exportQuery = trpc.shopifyMigration.exportFullCatalogueCsv.useQuery(undefined, {
    enabled: false,
  });

  const handleExport = async () => {
    try {
      const res = await exportQuery.refetch();
      if (res.data) {
        const blob = new Blob([res.data.csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = res.data.filename;
        link.click();
        URL.revokeObjectURL(url);
        toast.success("Exportation CSV du catalogue téléchargée avec succès !");
      }
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de l'exportation.");
    }
  };

  return (
    <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-bold flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-emerald-600" />
          Migration Shopify & Export / Import Massif CSV
        </CardTitle>
        <CardDescription>
          Transférez l'intégralité de votre catalogue Shopify vers MAZIGHO en quelques secondes ou téléchargez un export CSV.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs defaultValue="shopify" className="space-y-6">
          <TabsList className="bg-slate-100 dark:bg-slate-800 p-1.5 rounded-xl grid grid-cols-2 gap-2 max-w-md">
            <TabsTrigger value="shopify" className="rounded-lg gap-2 text-xs font-semibold py-2">
              <ShoppingBag className="w-4 h-4 text-emerald-600" />
              Migration Shopify
            </TabsTrigger>
            <TabsTrigger value="export" className="rounded-lg gap-2 text-xs font-semibold py-2">
              <Download className="w-4 h-4 text-blue-600" />
              Exportation CSV
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: SHOPIFY MIGRATION */}
          <TabsContent value="shopify" className="space-y-6">
            <div className="p-6 rounded-2xl border border-emerald-200 bg-emerald-50/50 dark:bg-emerald-950/20 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-emerald-950 dark:text-emerald-100 text-base">
                    Importation Directe Export Shopify (`products_export.csv`)
                  </h3>
                  <p className="text-xs text-emerald-800 dark:text-emerald-200 mt-1 max-w-2xl leading-relaxed">
                    Téléversez le fichier <strong>products_export.csv</strong> exporté depuis votre ancienne boutique Shopify. Le système extrait les titres, descriptions HTML, catégories, prix, images et variantes.
                  </p>
                </div>

                <Label className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white px-5 text-xs font-bold gap-2 shrink-0 shadow">
                  <FileUp className="w-4 h-4" />
                  Sélectionner products_export.csv
                  <input
                    type="file"
                    accept=".csv,text/csv"
                    className="sr-only"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        file.text().then((text) => {
                          setRawCsv(text);
                          previewMutation.mutate({ csvText: text });
                        });
                      }
                      e.currentTarget.value = "";
                    }}
                  />
                </Label>
              </div>

              {previewMutation.isPending && (
                <div className="p-6 text-center text-emerald-800 space-y-2">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-emerald-700" />
                  <p className="text-xs font-semibold">Analyse du fichier Shopify en cours...</p>
                </div>
              )}

              {report && (
                <div className="space-y-4 bg-white dark:bg-slate-900 p-5 rounded-xl border border-emerald-200 shadow-sm mt-4">
                  <div className="flex items-center justify-between">
                    <Badge className="bg-emerald-100 text-emerald-800 border-none font-bold">
                      ✓ Rapport d'Analyse Shopify
                    </Badge>
                    <span className="text-xs text-slate-500 font-medium">{report.rawRowsCount} lignes analysées</span>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg text-center">
                      <p className="text-xs text-slate-500 font-semibold">Produits Détectés</p>
                      <p className="text-xl font-extrabold text-emerald-700">{report.totalProducts}</p>
                    </div>
                    <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg text-center">
                      <p className="text-xs text-slate-500 font-semibold">Variantes Détectées</p>
                      <p className="text-xl font-extrabold text-blue-700">{report.totalVariants}</p>
                    </div>
                    <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg text-center">
                      <p className="text-xs text-slate-500 font-semibold">Catégories Extrait</p>
                      <p className="text-xl font-extrabold text-purple-700">{report.categoriesFound.length}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-slate-600 mb-2">Aperçu d'échantillons produits :</p>
                    <ul className="space-y-1.5 text-xs">
                      {report.sampleProducts.slice(0, 5).map((sp, idx) => (
                        <li key={idx} className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-800 rounded border">
                          <span className="font-semibold text-slate-900 dark:text-slate-100 truncate max-w-md">{sp.title}</span>
                          <span className="font-bold text-emerald-600">{(sp.priceCents / 100).toFixed(2)} CHF</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Button
                    className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-5 gap-2 shadow-md"
                    disabled={confirmMutation.isPending}
                    onClick={() => {
                      confirmMutation.mutate({ csvText: rawCsv });
                    }}
                  >
                    {confirmMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Importation vers votre catalogue en cours...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        Confirmer et Migrer {report.totalProducts} Produit(s) vers MAZIGHO
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>

          {/* TAB 2: EXPORTATION CSV */}
          <TabsContent value="export" className="space-y-6">
            <div className="p-6 rounded-2xl border border-blue-200 bg-blue-50/50 dark:bg-blue-950/20 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-blue-950 dark:text-blue-100 text-base">
                    Exportation Universelle du Catalogue
                  </h3>
                  <p className="text-xs text-blue-800 dark:text-blue-200 mt-1 max-w-xl leading-relaxed">
                    Téléchargez un fichier CSV complet contenant tous les produits, prix, catégories, stocks et visuels de votre boutique active.
                  </p>
                </div>

                <Button
                  onClick={handleExport}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-5 px-6 gap-2 shrink-0 shadow"
                >
                  <Download className="w-4 h-4" />
                  Télécharger l'Export CSV
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
