import { useState } from "react";
import { Sparkles, Plus, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

export default function OwnerFrequentlyBoughtTogetherManager() {
  const utils = trpc.useUtils();
  const bundlesQuery = trpc.frequentlyBoughtTogether.getBundles.useQuery();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [mainProductId, setMainProductId] = useState<number>(1);
  const [addonProductId, setAddonProductId] = useState<number>(2);
  const [discountPercentage, setDiscountPercentage] = useState<number>(15);
  const [title, setTitle] = useState("Fréquemment Achetés Ensemble");

  const saveMutation = trpc.frequentlyBoughtTogether.saveBundle.useMutation({
    onSuccess: () => {
      toast.success("Lot d'achat groupé enregistré !");
      setIsDialogOpen(false);
      utils.frequentlyBoughtTogether.getBundles.invalidate();
    },
    onError: (err) => toast.error(err.message || "Erreur de sauvegarde."),
  });

  const bundles = bundlesQuery.data || [];

  return (
    <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              Lots Cross-Sell "Fréquemment Achetés Ensemble" ("Shopify FBT")
            </CardTitle>
            <CardDescription>
              Associez des produits complémentaires avec une remise sur le lot pour augmenter le panier moyen.
            </CardDescription>
          </div>
          <Button
            size="sm"
            onClick={() => setIsDialogOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs gap-1.5 shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            Créer un Lot Cross-Sell
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {bundlesQuery.isLoading ? (
          <div className="py-8 text-center text-slate-500 text-xs flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            Chargement des lots...
          </div>
        ) : bundles.length === 0 ? (
          <div className="py-8 text-center text-slate-500 space-y-2">
            <Sparkles className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-xs font-medium">Aucun lot cross-sell configuré pour le moment.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {bundles.map((b) => (
              <div
                key={b.id}
                className="p-4 rounded-xl border border-slate-200 bg-white dark:bg-slate-900 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-emerald-600 text-white font-bold text-xs">
                      -{b.discountPercentage}% Remise Lot
                    </Badge>
                    <span className="font-bold text-xs text-slate-900 dark:text-slate-100">{b.title}</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Produit Principal: #{b.mainProductId} | Produits Liés: #{b.addonProductIds.join(", #")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal de création */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                Nouveau Lot Cross-Sell FBT
              </DialogTitle>
            </DialogHeader>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                saveMutation.mutate({
                  mainProductId,
                  addonProductIds: [addonProductId],
                  discountPercentage,
                  title,
                  enabled: true,
                });
              }}
              className="space-y-3 py-2 text-xs"
            >
              <div>
                <Label htmlFor="fbt-title" className="text-xs font-semibold">Titre de la section</Label>
                <Input
                  id="fbt-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-1 text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="fbt-main" className="text-xs font-semibold">ID Produit Principal</Label>
                  <Input
                    id="fbt-main"
                    type="number"
                    value={mainProductId}
                    onChange={(e) => setMainProductId(parseInt(e.target.value, 10) || 1)}
                    className="mt-1 text-xs"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="fbt-addon" className="text-xs font-semibold">ID Produit Complémentaire</Label>
                  <Input
                    id="fbt-addon"
                    type="number"
                    value={addonProductId}
                    onChange={(e) => setAddonProductId(parseInt(e.target.value, 10) || 2)}
                    className="mt-1 text-xs"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="fbt-disc" className="text-xs font-semibold">Remise sur le Lot (%)</Label>
                <Input
                  id="fbt-disc"
                  type="number"
                  min={0}
                  max={50}
                  value={discountPercentage}
                  onChange={(e) => setDiscountPercentage(parseInt(e.target.value, 10) || 15)}
                  className="mt-1 text-xs"
                  required
                />
              </div>

              <DialogFooter className="pt-2">
                <Button variant="ghost" type="button" onClick={() => setIsDialogOpen(false)} className="text-xs">
                  Annuler
                </Button>
                <Button
                  type="submit"
                  disabled={saveMutation.isPending}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs gap-1.5"
                >
                  {saveMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  Créer le Lot Cross-Sell
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
