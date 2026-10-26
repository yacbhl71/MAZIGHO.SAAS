import { useState } from "react";
import { Gift, Coins, Share2, Copy, Check, Sparkles, ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function CustomerLoyaltyWidget() {
  const accountQuery = trpc.loyaltyProgram.getMyAccount.useQuery(undefined, {
    retry: false,
  });

  const [pointsToRedeem, setPointsToRedeem] = useState<number>(50);
  const [copiedCode, setCopiedCode] = useState(false);
  const [generatedPromoCode, setGeneratedPromoCode] = useState<string | null>(null);

  const redeemMutation = trpc.loyaltyProgram.redeemPoints.useMutation({
    onSuccess: (res) => {
      setGeneratedPromoCode(res.promoCode);
      toast.success(`Code promo ${res.promoCode} généré avec succès !`);
      accountQuery.refetch();
    },
    onError: (err) => {
      toast.error(err.message || "Impossible de convertir les points.");
    },
  });

  if (accountQuery.isLoading) {
    return (
      <Card className="border-purple-100 bg-purple-50/20">
        <CardContent className="p-6 flex items-center justify-center gap-2 text-purple-700">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm font-medium">Chargement de votre espace fidélité...</span>
        </CardContent>
      </Card>
    );
  }

  if (accountQuery.isError || !accountQuery.data) {
    return (
      <Card className="border-slate-200 bg-slate-50/50">
        <CardContent className="p-6 text-center space-y-3">
          <Gift className="w-8 h-8 text-purple-600 mx-auto" />
          <h3 className="font-bold text-slate-900 text-base">Rejoignez notre Club Fidélité & Parrainage</h3>
          <p className="text-xs text-slate-600 max-w-sm mx-auto">
            Connectez-vous à votre compte client pour accumuler des points cash-back sur vos commandes et parrainer vos proches.
          </p>
        </CardContent>
      </Card>
    );
  }

  const { account, config } = accountQuery.data;

  if (!config.enabled) {
    return null;
  }

  const chfEquivalent = (account.pointsBalance * config.centsPerRedeemedPoint) / 100;
  const referralUrl = typeof window !== "undefined" ? `${window.location.origin}?ref=${account.referralCode}` : account.referralCode;

  const handleCopyReferral = () => {
    navigator.clipboard.writeText(referralUrl);
    setCopiedCode(true);
    toast.success("Lien de parrainage copié dans le presse-papier !");
    setTimeout(() => setCopiedCode(false), 2500);
  };

  return (
    <Card className="border-purple-200 shadow-md bg-gradient-to-br from-purple-50/40 via-white to-purple-50/10">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-purple-600 text-white shadow-sm">
              <Gift className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-base font-bold text-purple-950">
                Club Fidélité & Cash-back
              </CardTitle>
              <CardDescription className="text-xs text-purple-700">
                Gagnez {config.pointsPerSpentCents} point par CHF dépensé et profitez de réductions exclusives.
              </CardDescription>
            </div>
          </div>
          <Badge variant="outline" className="border-purple-300 text-purple-800 bg-purple-100/50 font-semibold">
            {account.pointsBalance} Points
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* Balance & Cashback display */}
        <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-white border border-purple-100 shadow-xs">
          <div>
            <span className="text-[11px] text-slate-500 font-medium block">Solde de Points</span>
            <span className="text-lg font-black text-purple-900 flex items-center gap-1.5">
              <Coins className="w-4 h-4 text-purple-600" />
              {account.pointsBalance} pts
            </span>
          </div>
          <div>
            <span className="text-[11px] text-slate-500 font-medium block">Valeur Cash-back</span>
            <span className="text-lg font-black text-emerald-600">
              {chfEquivalent.toFixed(2)} CHF
            </span>
          </div>
        </div>

        {/* Redeem Points Section */}
        <div className="space-y-3 p-3.5 rounded-xl bg-purple-50/50 border border-purple-100">
          <h4 className="text-xs font-bold text-purple-900 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            Convertir vos points en Bon de Réduction
          </h4>

          {account.pointsBalance < config.minRedeemPoints ? (
            <p className="text-[11px] text-slate-600">
              Il vous manque encore <strong className="text-purple-900">{config.minRedeemPoints - account.pointsBalance} points</strong> pour effectuer votre première conversion (seuil minimum : {config.minRedeemPoints} pts).
            </p>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min={config.minRedeemPoints}
                  max={account.pointsBalance}
                  value={pointsToRedeem}
                  onChange={(e) => setPointsToRedeem(parseInt(e.target.value, 10) || config.minRedeemPoints)}
                  className="h-9 text-xs bg-white"
                />
                <Button
                  size="sm"
                  className="bg-purple-700 hover:bg-purple-800 text-white font-medium text-xs whitespace-nowrap"
                  disabled={redeemMutation.isPending || pointsToRedeem > account.pointsBalance}
                  onClick={() => redeemMutation.mutate({ pointsToRedeem })}
                >
                  {redeemMutation.isPending ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <>
                      Obtenir {((pointsToRedeem * config.centsPerRedeemedPoint) / 100).toFixed(2)} CHF
                      <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </>
                  )}
                </Button>
              </div>

              {generatedPromoCode && (
                <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center justify-between text-xs font-semibold">
                  <span>Code Généré : <strong className="font-mono text-emerald-800">{generatedPromoCode}</strong></span>
                  <Button
                    size="xs"
                    variant="ghost"
                    onClick={() => {
                      navigator.clipboard.writeText(generatedPromoCode);
                      toast.success("Code promo copié !");
                    }}
                    className="h-7 text-emerald-700 hover:text-emerald-900 hover:bg-emerald-100"
                  >
                    Copier
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Referral Program Section */}
        <div className="p-3.5 rounded-xl bg-blue-50/50 border border-blue-100 space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-blue-950 flex items-center gap-1.5">
              <Share2 className="w-3.5 h-3.5 text-blue-600" />
              Parrainez un ami
            </h4>
            <Badge variant="secondary" className="text-[10px] bg-blue-100 text-blue-800">
              {(config.referralRewardCents / 100).toFixed(2)} CHF offerts chacun
            </Badge>
          </div>
          <p className="text-[11px] text-slate-600">
            Partagez votre lien. Chaque ami inscrit gagne {(config.referralRewardCents / 100).toFixed(2)} CHF sur sa 1ère commande, et vous aussi !
          </p>

          <div className="flex items-center gap-2 pt-1">
            <Input
              readOnly
              value={referralUrl}
              className="h-8 text-[11px] bg-white font-mono text-slate-700"
            />
            <Button
              size="sm"
              variant="outline"
              onClick={handleCopyReferral}
              className="h-8 border-blue-200 text-blue-800 hover:bg-blue-100 shrink-0 text-xs gap-1"
            >
              {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedCode ? "Copié !" : "Copier"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
