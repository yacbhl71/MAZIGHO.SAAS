import { useState } from "react";
import { Eye, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export default function OwnerQuickViewSettings() {
  const utils = trpc.useUtils();
  const configQuery = trpc.quickView.getConfig.useQuery();

  const [enabled, setEnabled] = useState(true);
  const [showVariantsMatrix, setShowVariantsMatrix] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  if (configQuery.data && !isInitialized) {
    setEnabled(configQuery.data.enabled ?? true);
    setShowVariantsMatrix(configQuery.data.showVariantsMatrix ?? true);
    setIsInitialized(true);
  }

  const saveMutation = trpc.quickView.saveConfig.useMutation({
    onSuccess: () => {
      toast.success("Paramètres de l'Aperçu Rapide enregistrés !");
      utils.quickView.getConfig.invalidate();
    },
    onError: (err) => toast.error(err.message || "Erreur d'enregistrement."),
  });

  return (
    <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Eye className="w-5 h-5 text-indigo-600" />
              Aperçu Rapide & Achat Express ("Shopify Quick View")
            </CardTitle>
            <CardDescription>
              Permettez à vos visiteurs de prévisualiser les détails et d'ajouter un produit au panier directement depuis la grille du catalogue.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Label className="text-xs font-semibold">Option Active</Label>
            <Switch checked={enabled} onCheckedChange={setEnabled} />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="p-4 rounded-xl border border-indigo-100 bg-indigo-50/30 space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-bold text-indigo-950">
              Afficher le sélecteur de variantes dans la fenêtre pop-up
            </Label>
            <Switch checked={showVariantsMatrix} onCheckedChange={setShowVariantsMatrix} />
          </div>
        </div>

        <Button
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-4 text-xs gap-2"
          disabled={saveMutation.isPending}
          onClick={() => {
            saveMutation.mutate({
              enabled,
              showVariantsMatrix,
              enableDirectAddToCart: true,
            });
          }}
        >
          {saveMutation.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <Save className="w-4 h-4" />
              Enregistrer les Paramètres d'Aperçu Rapide
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
