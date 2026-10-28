import { useState, useEffect } from "react";
import { Scale, Save, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { defaultProductCompareConfig, type ProductCompareConfig } from "@shared/productCompareConfig";

export default function OwnerProductCompareSettings() {
  const query = trpc.productCompare.getConfig.useQuery();
  const save = trpc.productCompare.saveConfig.useMutation({
    onSuccess: () => {
      toast.success("Réglages du Comparateur de Produits enregistrés !");
      query.refetch();
    },
    onError: err => toast.error(err.message || "Erreur d'enregistrement"),
  });

  const [form, setForm] = useState<ProductCompareConfig>(defaultProductCompareConfig);

  useEffect(() => {
    if (query.data) setForm(query.data);
  }, [query.data]);

  return (
    <Card className="border-sky-200 bg-sky-50/30 shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-sky-600 p-2.5 text-white">
              <Scale className="h-6 w-6" />
            </div>
            <div>
              <CardTitle className="text-xl text-sky-950">Comparateur de Produits Côte à Côte</CardTitle>
              <CardDescription className="mt-1">
                Permet aux visiteurs de comparer plusieurs articles côte à côte dans un tableau interactif.
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-full border border-sky-300 bg-white px-4 py-2">
            <Switch
              id="compare-toggle"
              checked={form.enabled}
              onCheckedChange={checked => setForm(prev => ({ ...prev, enabled: checked }))}
            />
            <Label htmlFor="compare-toggle" className="font-semibold text-sky-900 cursor-pointer">
              {form.enabled ? "Actif sur la boutique" : "Désactivé"}
            </Label>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2 max-w-xs">
          <Label className="font-semibold">Nombre maximum d'articles comparables</Label>
          <Input
            type="number"
            min={2}
            max={6}
            value={form.maxItems}
            onChange={e => setForm(prev => ({ ...prev, maxItems: Number(e.target.value) }))}
          />
        </div>

        <div className="flex justify-end pt-2">
          <Button
            type="button"
            onClick={() => save.mutate(form)}
            disabled={save.isPending}
            className="min-h-11 bg-sky-600 hover:bg-sky-700 text-white font-semibold"
          >
            {save.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Enregistrer le Comparateur
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
