import { useState, useEffect } from "react";
import { Gift, Plus, Save, Trash2, Loader2, Sparkles, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { defaultSpinToWinSettings, type SpinToWinReward, type SpinToWinSettings } from "@shared/spinToWinGamification";

export default function OwnerSpinToWinManager() {
  const query = trpc.spinToWin.getSettings.useQuery();
  const save = trpc.spinToWin.saveSettings.useMutation({
    onSuccess: () => {
      toast.success("Réglages de la Roue Privilège enregistrés !");
      query.refetch();
    },
    onError: err => toast.error(err.message || "Erreur d'enregistrement"),
  });

  const [form, setForm] = useState<SpinToWinSettings>(defaultSpinToWinSettings);

  useEffect(() => {
    if (query.data) setForm(query.data);
  }, [query.data]);

  const addReward = () => {
    const newReward: SpinToWinReward = {
      id: `r-${Date.now()}`,
      label: "-10% supplémentaires",
      code: `OFFRE${form.rewards.length + 1}`,
      discountPercent: 10,
      probabilityWeight: 3,
    };
    setForm(prev => ({ ...prev, rewards: [...prev.rewards, newReward] }));
  };

  const removeReward = (id: string) => {
    if (form.rewards.length <= 2) {
      toast.error("La roue doit conserver au moins 2 segments.");
      return;
    }
    setForm(prev => ({ ...prev, rewards: prev.rewards.filter(r => r.id !== id) }));
  };

  const updateReward = (id: string, field: keyof SpinToWinReward, value: any) => {
    setForm(prev => ({
      ...prev,
      rewards: prev.rewards.map(r => (r.id === id ? { ...r, [field]: value } : r)),
    }));
  };

  return (
    <Card className="border-amber-200 bg-amber-50/30 shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-amber-500 p-2.5 text-white">
              <Gift className="h-6 w-6" />
            </div>
            <div>
              <CardTitle className="text-xl text-amber-950">Roue de la Fortune ("Spin-to-Win")</CardTitle>
              <CardDescription className="mt-1">
                Module de gamification pour capturer les e-mails visiteurs en leur offrant des codes promo.
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-full border border-amber-300 bg-white px-4 py-2">
            <Switch
              id="spintowin-toggle"
              checked={form.enabled}
              onCheckedChange={checked => setForm(prev => ({ ...prev, enabled: checked }))}
            />
            <Label htmlFor="spintowin-toggle" className="font-semibold text-amber-900 cursor-pointer">
              {form.enabled ? "Actif sur la boutique" : "Désactivé"}
            </Label>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label className="font-semibold">Titre de la fenêtre pop-up</Label>
            <Input
              value={form.title}
              onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Ex. Tournez la Roue Privilège !"
            />
          </div>
          <div className="space-y-2">
            <Label className="font-semibold">Description / Sous-titre</Label>
            <Input
              value={form.description}
              onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Ex. Tentez votre chance..."
            />
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-amber-950 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-600" /> Segments de la roue & Récompenses
            </h3>
            <Button type="button" variant="outline" size="sm" onClick={addReward} className="border-amber-300 bg-white">
              <Plus className="mr-2 h-4 w-4" /> Ajouter un segment
            </Button>
          </div>

          <div className="space-y-2">
            {form.rewards.map((reward, index) => (
              <div key={reward.id} className="grid items-center gap-2 rounded-xl border border-amber-200 bg-white p-3 md:grid-cols-12">
                <div className="col-span-1 font-bold text-slate-400 text-xs">#{index + 1}</div>
                <div className="col-span-3">
                  <Input
                    value={reward.label}
                    onChange={e => updateReward(reward.id, "label", e.target.value)}
                    placeholder="Libellé"
                  />
                </div>
                <div className="col-span-3">
                  <Input
                    value={reward.code}
                    onChange={e => updateReward(reward.id, "code", e.target.value)}
                    placeholder="Code Promo"
                  />
                </div>
                <div className="col-span-2">
                  <Input
                    type="number"
                    value={reward.discountPercent}
                    onChange={e => updateReward(reward.id, "discountPercent", Number(e.target.value))}
                    placeholder="% Réduction"
                  />
                </div>
                <div className="col-span-2">
                  <Input
                    type="number"
                    value={reward.probabilityWeight}
                    onChange={e => updateReward(reward.id, "probabilityWeight", Number(e.target.value))}
                    placeholder="Poids (chance)"
                  />
                </div>
                <div className="col-span-1 flex justify-end">
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeReward(reward.id)} className="text-rose-600 hover:bg-rose-50">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button
            type="button"
            onClick={() => save.mutate(form)}
            disabled={save.isPending}
            className="min-h-11 bg-amber-600 hover:bg-amber-700 text-white font-semibold"
          >
            {save.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Enregistrer la Roue Privilège
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
