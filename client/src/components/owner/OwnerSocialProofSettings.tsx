import { useState } from "react";
import { Sparkles, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export default function OwnerSocialProofSettings() {
  const utils = trpc.useUtils();
  const configQuery = trpc.socialProofPopups.getConfig.useQuery();

  const [enabled, setEnabled] = useState(true);
  const [displayIntervalSeconds, setDisplayIntervalSeconds] = useState<number>(8);
  const [hideOnMobile, setHideOnMobile] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  if (configQuery.data && !isInitialized) {
    setEnabled(configQuery.data.enabled ?? true);
    setDisplayIntervalSeconds(configQuery.data.displayIntervalSeconds || 8);
    setHideOnMobile(configQuery.data.hideOnMobile ?? false);
    setIsInitialized(true);
  }

  const saveMutation = trpc.socialProofPopups.saveConfig.useMutation({
    onSuccess: () => {
      toast.success("Paramètres de Preuve Sociale enregistrés !");
      utils.socialProofPopups.getConfig.invalidate();
    },
    onError: (err) => toast.error(err.message || "Erreur de sauvegarde."),
  });

  return (
    <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              Preuve Sociale & Pop-ups d'Achats Récents ("Shopify Sales Pop")
            </CardTitle>
            <CardDescription>
              Affichez de discrètes notifications d'achats récents au coin de l'écran pour rassurer les visiteurs et créer un effet d'engouement.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Label className="text-xs font-semibold">Pop-ups Actifs</Label>
            <Switch checked={enabled} onCheckedChange={setEnabled} />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="sp-interval" className="text-xs font-semibold">Délai entre deux pop-ups (en secondes)</Label>
            <Input
              id="sp-interval"
              type="number"
              min={3}
              max={60}
              value={displayIntervalSeconds}
              onChange={(e) => setDisplayIntervalSeconds(parseInt(e.target.value, 10) || 8)}
              className="mt-1 text-xs bg-white"
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50">
            <Label className="text-xs font-semibold">Masquer les pop-ups sur mobile</Label>
            <Switch checked={hideOnMobile} onCheckedChange={setHideOnMobile} />
          </div>
        </div>

        <Button
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-4 text-xs gap-2"
          disabled={saveMutation.isPending}
          onClick={() => {
            saveMutation.mutate({
              enabled,
              displayIntervalSeconds,
              hideOnMobile,
            });
          }}
        >
          {saveMutation.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <Save className="w-4 h-4" />
              Enregistrer les Paramètres de Preuve Sociale
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
