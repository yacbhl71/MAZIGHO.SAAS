import { useState } from "react";
import { Gift, Coins, Share2, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export default function OwnerLoyaltyProgramSettings() {
  const utils = trpc.useUtils();
  const configQuery = trpc.loyaltyProgram.getConfig.useQuery();

  const [pointsPerSpent, setPointsPerSpent] = useState<number>(1);
  const [centsPerPoint, setCentsPerPoint] = useState<number>(5);
  const [minPoints, setMinPoints] = useState<number>(50);
  const [referralBonusChf, setReferralBonusChf] = useState<number>(10);
  const [enabled, setEnabled] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  if (configQuery.data && !isInitialized) {
    setPointsPerSpent(configQuery.data.pointsPerSpentCents || 1);
    setCentsPerPoint(configQuery.data.centsPerRedeemedPoint || 5);
    setMinPoints(configQuery.data.minRedeemPoints || 50);
    setReferralBonusChf((configQuery.data.referralRewardCents || 1000) / 100);
    setEnabled(configQuery.data.enabled ?? true);
    setIsInitialized(true);
  }

  const saveMutation = trpc.loyaltyProgram.saveConfig.useMutation({
    onSuccess: () => {
      toast.success("Règles du programme de fidélité enregistrées !");
      utils.loyaltyProgram.getConfig.invalidate();
    },
    onError: (err) => toast.error(err.message || "Erreur d'enregistrement."),
  });

  return (
    <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Gift className="w-5 h-5 text-purple-600" />
              Programme de Fidélité & Parrainage Clients
            </CardTitle>
            <CardDescription>
              Fidélisez vos acheteurs en leur offrant des points de cash-back et des bons de réduction pour le parrainage.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Label className="text-xs font-semibold">Programme Actif</Label>
            <Switch checked={enabled} onCheckedChange={setEnabled} />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Points Earning & Redemption */}
          <div className="p-4 rounded-xl border border-purple-100 bg-purple-50/50 dark:bg-purple-950/20 space-y-4">
            <h4 className="font-bold text-purple-950 dark:text-purple-100 text-sm flex items-center gap-2">
              <Coins className="w-4 h-4 text-purple-600" />
              Gains de Points & Cash-Back
            </h4>

            <div>
              <Label htmlFor="points-per-spent" className="text-xs font-semibold">
                Points gagnés par CHF dépensé
              </Label>
              <Input
                id="points-per-spent"
                type="number"
                value={pointsPerSpent}
                onChange={(e) => setPointsPerSpent(parseFloat(e.target.value) || 1)}
                className="mt-1"
              />
              <p className="text-[11px] text-slate-500 mt-1">ex: 1 CHF dépensé = 1 point crédité.</p>
            </div>

            <div>
              <Label htmlFor="cents-per-point" className="text-xs font-semibold">
                Valeur de réduction par point (en centimes)
              </Label>
              <Input
                id="cents-per-point"
                type="number"
                value={centsPerPoint}
                onChange={(e) => setCentsPerPoint(parseInt(e.target.value, 10) || 5)}
                className="mt-1"
              />
              <p className="text-[11px] text-slate-500 mt-1">ex: 5 centimes par point (100 points = 5.00 CHF de réduction).</p>
            </div>

            <div>
              <Label htmlFor="min-points" className="text-xs font-semibold">
                Seuil minimum de points échangeables
              </Label>
              <Input
                id="min-points"
                type="number"
                value={minPoints}
                onChange={(e) => setMinPoints(parseInt(e.target.value, 10) || 50)}
                className="mt-1"
              />
            </div>
          </div>

          {/* Referral Reward */}
          <div className="p-4 rounded-xl border border-blue-100 bg-blue-50/50 dark:bg-blue-950/20 space-y-4">
            <h4 className="font-bold text-blue-950 dark:text-blue-100 text-sm flex items-center gap-2">
              <Share2 className="w-4 h-4 text-blue-600" />
              Offre de Parrainage Client
            </h4>

            <div>
              <Label htmlFor="referral-reward" className="text-xs font-semibold">
                Prime de parrainage offerte (en CHF)
              </Label>
              <Input
                id="referral-reward"
                type="number"
                value={referralBonusChf}
                onChange={(e) => setReferralBonusChf(parseFloat(e.target.value) || 10)}
                className="mt-1"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Le parrain et le filleul reçoivent chacun {referralBonusChf.toFixed(2)} CHF lors de la première commande du filleul.
              </p>
            </div>
          </div>
        </div>

        <Button
          className="w-full bg-purple-700 hover:bg-purple-800 text-white font-semibold py-5 gap-2 shadow"
          disabled={saveMutation.isPending}
          onClick={() => {
            saveMutation.mutate({
              pointsPerSpentCents: pointsPerSpent,
              centsPerRedeemedPoint: centsPerPoint,
              minRedeemPoints: minPoints,
              referralRewardCents: Math.round(referralBonusChf * 100),
              enabled,
            });
          }}
        >
          {saveMutation.isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Enregistrement...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Enregistrer les Règles de Fidélité & Parrainage
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
