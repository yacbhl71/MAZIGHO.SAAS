import { useState } from "react";
import { ShoppingBag, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export default function OwnerStickyAddToCartSettings() {
  const utils = trpc.useUtils();
  const configQuery = trpc.stickyAddToCart.getConfig.useQuery();

  const [enabled, setEnabled] = useState(true);
  const [showOnMobile, setShowOnMobile] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  if (configQuery.data && !isInitialized) {
    setEnabled(configQuery.data.enabled ?? true);
    setShowOnMobile(configQuery.data.showOnMobile ?? true);
    setIsInitialized(true);
  }

  const saveMutation = trpc.stickyAddToCart.saveConfig.useMutation({
    onSuccess: () => {
      toast.success("Paramètres de la barre Sticky enregistrés !");
      utils.stickyAddToCart.getConfig.invalidate();
    },
    onError: (err) => toast.error(err.message || "Erreur de sauvegarde."),
  });

  return (
    <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-indigo-600" />
              Barre Sticky "Ajouter au Panier" au Scroll ("Shopify Sticky Bar")
            </CardTitle>
            <CardDescription>
              Affichez une barre d'achat fixe en bas d'écran lorsque le visiteur fait défiler la fiche produit pour garder le bouton d'action visible.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Label className="text-xs font-semibold">Barre Sticky Active</Label>
            <Switch checked={enabled} onCheckedChange={setEnabled} />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 rounded-xl border border-indigo-100 bg-indigo-50/30 flex items-center justify-between">
          <Label className="text-xs font-semibold text-indigo-950">
            Afficher également la barre Sticky sur smartphone / mobile
          </Label>
          <Switch checked={showOnMobile} onCheckedChange={setShowOnMobile} />
        </div>

        <Button
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-4 text-xs gap-2"
          disabled={saveMutation.isPending}
          onClick={() => {
            saveMutation.mutate({
              enabled,
              showOnMobile,
              showPriceAndImage: true,
            });
          }}
        >
          {saveMutation.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <Save className="w-4 h-4" />
              Enregistrer la Barre Sticky
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
