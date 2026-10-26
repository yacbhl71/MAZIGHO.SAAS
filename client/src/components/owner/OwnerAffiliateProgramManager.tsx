import { useState } from "react";
import { Users, Plus, Copy, Check, DollarSign, Share2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

export default function OwnerAffiliateProgramManager() {
  const utils = trpc.useUtils();
  const configQuery = trpc.affiliateProgram.getConfig.useQuery();
  const affiliatesQuery = trpc.affiliateProgram.getStoreAffiliates.useQuery();

  const [enabled, setEnabled] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [commissionPercentage, setCommissionPercentage] = useState<number>(10);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  if (configQuery.data && !isInitialized) {
    setEnabled(configQuery.data.enabled ?? true);
    setCommissionPercentage(configQuery.data.defaultCommissionPercentage || 10);
    setIsInitialized(true);
  }

  const createMutation = trpc.affiliateProgram.createAffiliate.useMutation({
    onSuccess: (aff) => {
      toast.success(`Ambassadeur ${aff.name} ajouté ! Code: ${aff.affiliateCode}`);
      setIsDialogOpen(false);
      utils.affiliateProgram.getStoreAffiliates.invalidate();
      // Reset
      setName("");
      setEmail("");
    },
    onError: (err) => toast.error(err.message || "Erreur lors de l'ajout."),
  });

  const saveConfigMutation = trpc.affiliateProgram.saveConfig.useMutation({
    onSuccess: () => {
      toast.success("Paramètres d'affiliation enregistrés !");
      utils.affiliateProgram.getConfig.invalidate();
    },
    onError: (err) => toast.error(err.message || "Erreur de sauvegarde."),
  });

  const affiliates = affiliatesQuery.data || [];

  return (
    <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-600" />
              Programme d'Affiliation & Ambassadeurs ("Shopify Affiliates")
            </CardTitle>
            <CardDescription>
              Recrutez des ambassadeurs/influenceurs, attribuez-leur des liens personnalisés et suivez les ventes générées.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Label className="text-xs font-semibold">Programme Actif</Label>
            <Switch
              checked={enabled}
              onCheckedChange={(val) => {
                setEnabled(val);
                saveConfigMutation.mutate({ enabled: val, defaultCommissionPercentage: commissionPercentage });
              }}
            />
            <Button
              size="sm"
              onClick={() => setIsDialogOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs gap-1.5 ml-2"
            >
              <Plus className="w-3.5 h-3.5" />
              Ajouter un Ambassadeur
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {affiliatesQuery.isLoading ? (
          <div className="py-8 text-center text-slate-500 text-xs flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            Chargement des ambassadeurs...
          </div>
        ) : affiliates.length === 0 ? (
          <div className="py-8 text-center text-slate-500 space-y-2">
            <Users className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-xs font-medium">Aucun ambassadeur inscrit pour le moment.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {affiliates.map((aff) => {
              const referralUrl = typeof window !== "undefined" ? `${window.location.origin}?aff=${aff.affiliateCode}` : aff.affiliateCode;
              return (
                <div
                  key={aff.id}
                  className="p-4 rounded-xl border border-slate-200 bg-white dark:bg-slate-900 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900 dark:text-slate-100">{aff.name}</span>
                      <Badge className="bg-indigo-100 text-indigo-900 font-bold text-xs">
                        {aff.commissionPercentage}% Commission
                      </Badge>
                      <span className="font-mono text-xs text-slate-500">({aff.affiliateCode})</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      Ventes générées: <strong className="text-emerald-600">{(aff.totalSalesCents / 100).toFixed(2)} CHF</strong> | Commissions dues: <strong>{(aff.totalCommissionCents / 100).toFixed(2)} CHF</strong>
                    </p>
                  </div>

                  <Button
                    size="xs"
                    variant="outline"
                    onClick={() => {
                      navigator.clipboard.writeText(referralUrl);
                      setCopiedCode(aff.affiliateCode);
                      toast.success("Lien d'affiliation copié !");
                      setTimeout(() => setCopiedCode(null), 2000);
                    }}
                    className="text-xs gap-1 shrink-0"
                  >
                    {copiedCode === aff.affiliateCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedCode === aff.affiliateCode ? "Copié !" : "Copier Lien"}
                  </Button>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal d'ajout */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-600" />
                Inscrire un Ambassadeur
              </DialogTitle>
            </DialogHeader>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                createMutation.mutate({
                  name,
                  email,
                  commissionPercentage,
                });
              }}
              className="space-y-3 py-2 text-xs"
            >
              <div>
                <Label htmlFor="aff-name" className="text-xs font-semibold">Nom de l'ambassadeur / influenceur</Label>
                <Input
                  id="aff-name"
                  placeholder="ex: Laura Style"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 text-xs"
                  required
                />
              </div>

              <div>
                <Label htmlFor="aff-email" className="text-xs font-semibold">Adresse E-mail</Label>
                <Input
                  id="aff-email"
                  type="email"
                  placeholder="laura@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 text-xs"
                  required
                />
              </div>

              <div>
                <Label htmlFor="aff-comm" className="text-xs font-semibold">Taux de Commission (%)</Label>
                <Input
                  id="aff-comm"
                  type="number"
                  min={1}
                  max={50}
                  value={commissionPercentage}
                  onChange={(e) => setCommissionPercentage(parseInt(e.target.value, 10) || 10)}
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
                  disabled={createMutation.isPending}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs gap-1.5"
                >
                  {createMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Users className="w-3.5 h-3.5" />}
                  Valider l'Ambassadeur
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
