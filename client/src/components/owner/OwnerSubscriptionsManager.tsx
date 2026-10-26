import { useState } from "react";
import { RefreshCw, Save, Loader2, Calendar, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

export default function OwnerSubscriptionsManager() {
  const utils = trpc.useUtils();
  const configQuery = trpc.productSubscriptions.getConfig.useQuery();
  const subscriptionsQuery = trpc.productSubscriptions.getStoreSubscriptions.useQuery();

  const [enabled, setEnabled] = useState(true);
  const [defaultDiscountPercentage, setDefaultDiscountPercentage] = useState<number>(10);
  const [isInitialized, setIsInitialized] = useState(false);

  if (configQuery.data && !isInitialized) {
    setEnabled(configQuery.data.enabled ?? true);
    setDefaultDiscountPercentage(configQuery.data.defaultDiscountPercentage || 10);
    setIsInitialized(true);
  }

  const saveMutation = trpc.productSubscriptions.saveConfig.useMutation({
    onSuccess: () => {
      toast.success("Paramètres des abonnements enregistrés !");
      utils.productSubscriptions.getConfig.invalidate();
    },
    onError: (err) => toast.error(err.message || "Erreur de sauvegarde."),
  });

  const subs = subscriptionsQuery.data || [];
  const monthlyRecurringRevenueCents = subs
    .filter((s) => s.status === "ACTIVE")
    .reduce((sum, s) => sum + s.finalPriceCents, 0);

  return (
    <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-indigo-600" />
              Commandes Récurrentes & Abonnements ("Subscribe & Save")
            </CardTitle>
            <CardDescription>
              Offrez à vos clients des réductions sur abonnements récurrents et sécurisez un revenu mensuel récurrent (MRR).
            </CardDescription>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Label className="text-xs font-semibold">Option Abonnements Active</Label>
            <Switch checked={enabled} onCheckedChange={setEnabled} />
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* MRR Stats & Settings */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl border border-indigo-100 bg-indigo-50/40 space-y-1">
            <span className="text-xs font-semibold text-indigo-900 block">Revenu Récurrent Mensuel (MRR Est.)</span>
            <span className="text-2xl font-black text-indigo-700 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-600" />
              {(monthlyRecurringRevenueCents / 100).toFixed(2)} CHF
            </span>
          </div>

          <div className="md:col-span-2 p-4 rounded-xl border border-slate-200 bg-white space-y-3">
            <div>
              <Label htmlFor="sub-disc" className="text-xs font-semibold">Taux de Remise Abonné (%)</Label>
              <Input
                id="sub-disc"
                type="number"
                min={1}
                max={50}
                value={defaultDiscountPercentage}
                onChange={(e) => setDefaultDiscountPercentage(parseInt(e.target.value, 10) || 10)}
                className="mt-1 text-xs"
              />
            </div>

            <Button
              size="sm"
              disabled={saveMutation.isPending}
              onClick={() => {
                saveMutation.mutate({
                  enabled,
                  defaultDiscountPercentage,
                  supportedFrequencies: ["2_WEEKS", "1_MONTH", "2_MONTHS"],
                });
              }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs gap-1.5"
            >
              {saveMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              Enregistrer les Réglages d'Abonnement
            </Button>
          </div>
        </div>

        {/* Active Subscriber List */}
        {subscriptionsQuery.isLoading ? (
          <div className="py-8 text-center text-slate-500 text-xs flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            Chargement des abonnements actifs...
          </div>
        ) : subs.length === 0 ? (
          <div className="py-8 text-center text-slate-500 space-y-2">
            <RefreshCw className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-xs font-medium">Aucun abonnement client actif pour le moment.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {subs.map((s) => (
              <div
                key={s.id}
                className="p-4 rounded-xl border border-slate-200 bg-white dark:bg-slate-900 shadow-2xs flex items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-900 dark:text-slate-100">{s.productTitle}</span>
                    <Badge className="bg-emerald-100 text-emerald-900 font-bold text-xs">{s.status}</Badge>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Montant récurrent : <strong>{(s.finalPriceCents / 100).toFixed(2)} CHF</strong> (-{s.discountPercentage}%) | Fréquence : {s.frequency}
                  </p>
                  <p className="text-[11px] text-slate-500 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-400" /> Prochaine expédition : {new Date(s.nextDeliveryDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
