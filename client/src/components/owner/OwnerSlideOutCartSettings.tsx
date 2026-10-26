import { useState } from "react";
import { ShoppingBag, Truck, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export default function OwnerSlideOutCartSettings() {
  const utils = trpc.useUtils();
  const configQuery = trpc.slideOutCart.getConfig.useQuery();

  const [enabled, setEnabled] = useState(true);
  const [freeShippingGoalEnabled, setFreeShippingGoalEnabled] = useState(true);
  const [thresholdChf, setThresholdChf] = useState<number>(100);
  const [isInitialized, setIsInitialized] = useState(false);

  if (configQuery.data && !isInitialized) {
    setEnabled(configQuery.data.enabled ?? true);
    setFreeShippingGoalEnabled(configQuery.data.freeShippingGoalEnabled ?? true);
    setThresholdChf((configQuery.data.freeShippingThresholdCents || 10000) / 100);
    setIsInitialized(true);
  }

  const saveMutation = trpc.slideOutCart.saveConfig.useMutation({
    onSuccess: () => {
      toast.success("Paramètres du Panier Glissant enregistrés !");
      utils.slideOutCart.getConfig.invalidate();
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
              Panier Glissant & Jauge de Livraison Offerte (Cart Drawer)
            </CardTitle>
            <CardDescription>
              Affichez un tiroir de panier glissant dynamique avec jauge de livraison gratuite pour maximiser la valeur moyenne des commandes.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Label className="text-xs font-semibold">Panier Glissant Actif</Label>
            <Switch checked={enabled} onCheckedChange={setEnabled} />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="p-4 rounded-xl border border-indigo-100 bg-indigo-50/30 space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-bold flex items-center gap-1.5 text-indigo-950">
              <Truck className="w-4 h-4 text-indigo-600" />
              Activer la Jauge de Livraison Offerte au Panier
            </Label>
            <Switch checked={freeShippingGoalEnabled} onCheckedChange={setFreeShippingGoalEnabled} />
          </div>

          {freeShippingGoalEnabled && (
            <div>
              <Label htmlFor="ship-threshold" className="text-xs font-semibold">
                Seuil de Livraison Gratuite (en CHF)
              </Label>
              <Input
                id="ship-threshold"
                type="number"
                value={thresholdChf}
                onChange={(e) => setThresholdChf(parseFloat(e.target.value) || 0)}
                className="mt-1 bg-white text-xs"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Le client verra une barre de progression en temps réel (ex: *"Plus que {(thresholdChf - 40 > 0 ? thresholdChf - 40 : 0).toFixed(2)} CHF pour la livraison gratuite"*).
              </p>
            </div>
          )}
        </div>

        <Button
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-4 text-xs gap-2"
          disabled={saveMutation.isPending}
          onClick={() => {
            saveMutation.mutate({
              enabled,
              freeShippingGoalEnabled,
              freeShippingThresholdCents: Math.round(thresholdChf * 100),
              upsellEnabled: true,
              featuredUpsellProductIds: [],
            });
          }}
        >
          {saveMutation.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <Save className="w-4 h-4" />
              Enregistrer les Paramètres du Panier
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
