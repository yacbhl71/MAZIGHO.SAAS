import { useState } from "react";
import { Zap, Plus, Clock, Save, Loader2, Power } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

export default function OwnerFlashSalesManager() {
  const utils = trpc.useUtils();
  const salesQuery = trpc.flashSale.getSales.useQuery();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [discountPercentage, setDiscountPercentage] = useState<number>(20);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [showBannerCountdown, setShowBannerCountdown] = useState(true);

  const saveMutation = trpc.flashSale.saveSale.useMutation({
    onSuccess: () => {
      toast.success("Campagne Vente Flash programmée !");
      setIsDialogOpen(false);
      utils.flashSale.getSales.invalidate();
      utils.flashSale.getActive.invalidate();
    },
    onError: (err) => toast.error(err.message || "Erreur lors de la programmation."),
  });

  const toggleMutation = trpc.flashSale.toggleSale.useMutation({
    onSuccess: () => {
      toast.success("Statut de la Vente Flash modifié.");
      utils.flashSale.getSales.invalidate();
      utils.flashSale.getActive.invalidate();
    },
    onError: (err) => toast.error(err.message || "Impossible de modifier le statut."),
  });

  return (
    <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-500 fill-amber-500" />
              Ventes Flash & Compte à Rebours (Shopify Flash Sales)
            </CardTitle>
            <CardDescription>
              Programmez des ventes flash limitées dans le temps avec compte à rebours dynamique au sommet de la boutique.
            </CardDescription>
          </div>
          <Button
            size="sm"
            onClick={() => setIsDialogOpen(true)}
            className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs gap-1.5 shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            Créer une Vente Flash
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {salesQuery.isLoading ? (
          <div className="py-8 text-center text-slate-500 text-xs flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            Chargement des campagnes flash...
          </div>
        ) : !salesQuery.data || salesQuery.data.length === 0 ? (
          <div className="py-8 text-center text-slate-500 space-y-2">
            <Zap className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-xs font-medium">Aucune vente flash enregistrée pour le moment.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {salesQuery.data.map((sale) => (
              <div
                key={sale.id}
                className="p-4 rounded-xl border border-slate-200 bg-white dark:bg-slate-900 shadow-2xs flex items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-amber-500 text-slate-950 font-bold text-xs">
                      -{sale.discountPercentage}%
                    </Badge>
                    <span className="font-bold text-xs text-slate-900 dark:text-slate-100">{sale.title}</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    Du {new Date(sale.startTime).toLocaleString()} au {new Date(sale.endTime).toLocaleString()}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs font-medium text-slate-600">{sale.enabled ? "Actif" : "Inactif"}</span>
                  <Switch
                    checked={sale.enabled}
                    onCheckedChange={(checked) =>
                      toggleMutation.mutate({ id: sale.id, enabled: checked })
                    }
                  />
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
                <Zap className="w-4 h-4 text-amber-500" />
                Programmer une Vente Flash
              </DialogTitle>
            </DialogHeader>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                saveMutation.mutate({
                  title,
                  discountPercentage,
                  startTime,
                  endTime,
                  showBannerCountdown,
                  showProductCountdown: true,
                  affectedProductIds: [],
                  enabled: true,
                });
              }}
              className="space-y-3 py-2 text-xs"
            >
              <div>
                <Label htmlFor="flash-title" className="text-xs font-semibold">Titre de la vente flash</Label>
                <Input
                  id="flash-title"
                  placeholder="ex: Vente Flash Vêtements d'Hiver"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-1 text-xs"
                  required
                />
              </div>

              <div>
                <Label htmlFor="flash-pct" className="text-xs font-semibold">Remise (%)</Label>
                <Input
                  id="flash-pct"
                  type="number"
                  min={1}
                  max={99}
                  value={discountPercentage}
                  onChange={(e) => setDiscountPercentage(parseInt(e.target.value, 10) || 20)}
                  className="mt-1 text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="flash-start" className="text-xs font-semibold">Date / Heure Début</Label>
                  <Input
                    id="flash-start"
                    type="datetime-local"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="mt-1 text-xs"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="flash-end" className="text-xs font-semibold">Date / Heure Fin</Label>
                  <Input
                    id="flash-end"
                    type="datetime-local"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="mt-1 text-xs"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <Label className="text-xs font-semibold">Afficher le compte à rebours sur la bannière</Label>
                <Switch checked={showBannerCountdown} onCheckedChange={setShowBannerCountdown} />
              </div>

              <DialogFooter className="pt-2">
                <Button variant="ghost" type="button" onClick={() => setIsDialogOpen(false)} className="text-xs">
                  Annuler
                </Button>
                <Button
                  type="submit"
                  disabled={saveMutation.isPending}
                  className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs gap-1.5"
                >
                  {saveMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  Lancer la Vente Flash
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
