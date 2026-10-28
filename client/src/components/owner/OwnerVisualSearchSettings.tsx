import { useState, useEffect } from "react";
import { Camera, Save, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { defaultVisualSearchConfig, type VisualSearchConfig } from "@shared/visualSearchConfig";

export default function OwnerVisualSearchSettings() {
  const query = trpc.visualSearch.getConfig.useQuery();
  const save = trpc.visualSearch.saveConfig.useMutation({
    onSuccess: () => {
      toast.success("Réglages de la Recherche Visuelle IA enregistrés !");
      query.refetch();
    },
    onError: err => toast.error(err.message || "Erreur d'enregistrement"),
  });

  const [form, setForm] = useState<VisualSearchConfig>(defaultVisualSearchConfig);

  useEffect(() => {
    if (query.data) setForm(query.data);
  }, [query.data]);

  return (
    <Card className="border-indigo-200 bg-indigo-50/30 shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-indigo-600 p-2.5 text-white">
              <Camera className="h-6 w-6" />
            </div>
            <div>
              <CardTitle className="text-xl text-indigo-950">Recherche Visuelle par Photo IA</CardTitle>
              <CardDescription className="mt-1">
                Permet aux visiteurs de trouver des articles similaires en important une photo ou une capture d'écran.
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-full border border-indigo-300 bg-white px-4 py-2">
            <Switch
              id="visualsearch-toggle"
              checked={form.enabled}
              onCheckedChange={checked => setForm(prev => ({ ...prev, enabled: checked }))}
            />
            <Label htmlFor="visualsearch-toggle" className="font-semibold text-indigo-900 cursor-pointer">
              {form.enabled ? "Actif sur la boutique" : "Désactivé"}
            </Label>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label className="font-semibold">Intitulé du bouton dans l'en-tête</Label>
            <Input
              value={form.title}
              onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label className="font-semibold">Description dans la modale</Label>
            <Input
              value={form.description}
              onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button
            type="button"
            onClick={() => save.mutate(form)}
            disabled={save.isPending}
            className="min-h-11 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
          >
            {save.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Enregistrer la Recherche Visuelle
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
