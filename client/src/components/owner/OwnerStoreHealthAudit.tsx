import { useState } from "react";
import {
  Activity,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  RefreshCw,
  ShoppingBag,
  Palette,
  Truck,
  CreditCard,
  ShieldCheck,
  Zap,
  TrendingUp,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface OwnerStoreHealthAuditProps {
  onNavigateToModule: (moduleId: string) => void;
}

export default function OwnerStoreHealthAudit({ onNavigateToModule }: OwnerStoreHealthAuditProps) {
  const auditQuery = trpc.owner.getStoreHealthAudit.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });

  const [activePillarFilter, setActivePillarFilter] = useState<string>("all");

  const refreshAudit = async () => {
    await auditQuery.refetch();
    toast.success("Audit de conversion mis à jour.");
  };

  if (auditQuery.isLoading) {
    return (
      <Card className="border-emerald-200">
        <CardContent className="flex items-center gap-3 p-8">
          <RefreshCw className="h-5 w-5 animate-spin text-emerald-600" />
          <span className="text-sm font-medium text-slate-700">
            Analyse complète de la santé commerciale et du potentiel de conversion de votre boutique…
          </span>
        </CardContent>
      </Card>
    );
  }

  const audit = auditQuery.data;
  if (!audit) {
    return (
      <Card className="border-slate-200 p-6 text-sm text-slate-600">
        Les données de santé de la boutique sont momentanément indisponibles.
      </Card>
    );
  }

  const filteredRecommendations = activePillarFilter === "all"
    ? audit.recommendations
    : audit.recommendations.filter(r => r.pillarId === activePillarFilter);

  const getPillarIcon = (id: string) => {
    switch (id) {
      case "catalogue":
        return <ShoppingBag className="h-4 w-4" />;
      case "theme":
        return <Palette className="h-4 w-4" />;
      case "delivery":
        return <Truck className="h-4 w-4" />;
      case "payments":
        return <CreditCard className="h-4 w-4" />;
      case "conversion":
        return <ShieldCheck className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6" data-testid="store-health-audit">
      {/* Main Score Banner */}
      <Card className="overflow-hidden border-slate-200 shadow-sm bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Badge className="border-0 bg-emerald-500 text-slate-950 font-bold">
                  Score de Santé & Conversion
                </Badge>
                <Badge variant="outline" className="border-white/20 bg-white/10 text-white font-medium">
                  Shopify Studio Audit
                </Badge>
              </div>
              <CardTitle className="mt-2 text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                <Activity className="h-6 w-6 text-emerald-400" /> Santé Commerciale de {audit.storeName}
              </CardTitle>
              <CardDescription className="mt-1 text-slate-300 max-w-2xl text-xs sm:text-sm">
                Analyse en temps réel de vos fiches, visuels, thèmes, livraisons et passerelles de paiement pour maximiser vos ventes.
              </CardDescription>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={refreshAudit}
              disabled={auditQuery.isFetching}
              className="border-white/20 bg-white/10 text-white hover:bg-white/20 w-fit"
            >
              <RefreshCw className={`mr-2 h-3.5 w-3.5 ${auditQuery.isFetching ? "animate-spin" : ""}`} />
              Re-scanner la boutique
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <div className="grid gap-6 md:grid-cols-12 items-center rounded-2xl bg-white/[0.06] border border-white/10 p-5 sm:p-6">
            {/* Circular / Score Gauge */}
            <div className="md:col-span-4 flex flex-col items-center justify-center text-center p-2">
              <div className="relative flex items-center justify-center">
                <div className={`h-28 w-28 rounded-full border-4 flex flex-col items-center justify-center shadow-lg ${
                  audit.overallScore >= 80
                    ? "border-emerald-500 bg-emerald-950/40 text-emerald-300"
                    : audit.overallScore >= 60
                    ? "border-amber-500 bg-amber-950/40 text-amber-300"
                    : "border-rose-500 bg-rose-950/40 text-rose-300"
                }`}>
                  <span className="text-3xl font-extrabold tracking-tight text-white">{audit.overallScore}</span>
                  <span className="text-[11px] font-semibold text-slate-300">/ 100</span>
                </div>
                <div className="absolute -bottom-2.5">
                  <Badge className={`border-0 font-extrabold px-3 py-0.5 shadow ${
                    audit.overallScore >= 80 ? "bg-emerald-500 text-slate-950" : audit.overallScore >= 60 ? "bg-amber-500 text-slate-950" : "bg-rose-500 text-white"
                  }`}>
                    Note {audit.grade}
                  </Badge>
                </div>
              </div>
              <p className="mt-4 font-bold text-sm text-white">{audit.gradeLabel}</p>
              <p className="text-xs text-slate-300 mt-1 max-w-xs">{audit.summary}</p>
            </div>

            {/* Pillars Overview */}
            <div className="md:col-span-8 space-y-3">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Piliers d'Évaluation Commerciale
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                {audit.pillars.map(pillar => {
                  const percent = Math.round((pillar.score / pillar.maxScore) * 100);
                  const isHigh = percent >= 80;
                  const isMed = percent >= 50 && percent < 80;
                  return (
                    <div
                      key={pillar.id}
                      className="rounded-xl border border-white/10 bg-white/[0.04] p-3 transition hover:bg-white/[0.08]"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                          {getPillarIcon(pillar.id)} {pillar.label}
                        </span>
                        <span className={`font-bold ${isHigh ? "text-emerald-400" : isMed ? "text-amber-400" : "text-rose-400"}`}>
                          {pillar.score}/{pillar.maxScore} ({percent}%)
                        </span>
                      </div>
                      <div className="mt-2 h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isHigh ? "bg-emerald-500" : isMed ? "bg-amber-500" : "bg-rose-500"
                          }`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      <p className="mt-1.5 text-[11px] text-slate-300 truncate">{pillar.summary}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actionable Recommendations Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-slate-950 flex items-center gap-2">
              <Zap className="h-5 w-5 text-amber-500" /> Actions Recommandées pour Maximiser la Conversion ({audit.recommendations.length})
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Chaque action résolue augmente votre score de santé et élimine les freins à l'achat pour vos clients.
            </p>
          </div>

          {/* Filter by pillar */}
          <div className="flex flex-wrap items-center gap-1.5">
            <Button
              type="button"
              size="sm"
              variant={activePillarFilter === "all" ? "default" : "outline"}
              onClick={() => setActivePillarFilter("all")}
              className={`text-xs h-8 ${activePillarFilter === "all" ? "bg-slate-950 text-white" : ""}`}
            >
              Toutes ({audit.recommendations.length})
            </Button>
            {audit.pillars.map(pillar => {
              const count = audit.recommendations.filter(r => r.pillarId === pillar.id).length;
              if (count === 0) return null;
              return (
                <Button
                  key={pillar.id}
                  type="button"
                  size="sm"
                  variant={activePillarFilter === pillar.id ? "default" : "outline"}
                  onClick={() => setActivePillarFilter(pillar.id)}
                  className={`text-xs h-8 ${activePillarFilter === pillar.id ? "bg-slate-950 text-white" : ""}`}
                >
                  {pillar.label.split(" ")[0]} ({count})
                </Button>
              );
            })}
          </div>
        </div>

        {/* List of Recommendation Cards with 1-Click Action Button */}
        {filteredRecommendations.length === 0 ? (
          <Card className="border-emerald-200 bg-emerald-50/50 p-6 text-center">
            <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-600 mb-2" />
            <p className="font-bold text-emerald-950 text-sm">Félicitations ! Aucune action critique détectée.</p>
            <p className="text-xs text-emerald-800 mt-1 max-w-md mx-auto">
              Tous vos voyants sont au vert dans cette catégorie. Votre boutique respecte les standards e-commerce haute conversion.
            </p>
          </Card>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {filteredRecommendations.map(rec => {
              const isCrit = rec.priority === "critical";
              const isHigh = rec.priority === "high";

              return (
                <div
                  key={rec.id}
                  className={`rounded-2xl border p-4 transition shadow-sm hover:shadow-md flex flex-col justify-between ${
                    isCrit
                      ? "border-rose-200 bg-rose-50/40"
                      : isHigh
                      ? "border-amber-200 bg-amber-50/40"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <Badge
                        className={`border-0 text-[10px] font-bold ${
                          isCrit
                            ? "bg-rose-600 text-white"
                            : isHigh
                            ? "bg-amber-600 text-white"
                            : "bg-slate-700 text-white"
                        }`}
                      >
                        {isCrit ? "Action Prioritaire" : isHigh ? "Important" : "Optimisation"}
                      </Badge>
                      <Badge variant="outline" className="border-emerald-300 bg-emerald-50 text-emerald-800 font-bold text-xs">
                        {rec.impact}
                      </Badge>
                    </div>

                    <h4 className="mt-2.5 font-bold text-sm text-slate-950 leading-5">{rec.title}</h4>
                    <p className="mt-1 text-xs text-slate-600 leading-relaxed">{rec.explanation}</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-200/70 flex items-center justify-between">
                    <span className="text-[11px] font-medium text-slate-400">
                      Module : <strong className="text-slate-600 uppercase">{rec.actionModule}</strong>
                    </span>
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => onNavigateToModule(rec.actionModule)}
                      className={`min-h-9 text-xs font-semibold shadow-sm ${
                        isCrit
                          ? "bg-rose-600 hover:bg-rose-700 text-white"
                          : isHigh
                          ? "bg-amber-600 hover:bg-amber-700 text-white"
                          : "bg-slate-900 hover:bg-slate-800 text-white"
                      }`}
                    >
                      {rec.actionLabel} <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
