import { useState, useEffect, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { storefrontCountryChoices, type StorefrontCountryCode, type StoreMarketSettings } from "@shared/storeMarketSettings";
import type { StoreTaxPolicy } from "@shared/storeTaxPolicy";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Globe2, Search, CheckSquare, Square, Trash2, Save, Filter, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

type Props = {
  activeStoreMarketCountries?: StorefrontCountryCode[];
  primaryCountry?: StorefrontCountryCode;
};

export default function OwnerMarketTaxManager({ activeStoreMarketCountries = [], primaryCountry = "CH" }: Props) {
  const utils = trpc.useUtils();
  const taxPoliciesQuery = trpc.owner.getTaxPolicies.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  });

  const saveTaxPolicies = trpc.owner.saveTaxPolicies.useMutation({
    onSuccess: () => {
      toast.success("Mentions fiscales enregistrées avec succès !");
      utils.owner.getTaxPolicies.invalidate();
    },
    onError: (error) => {
      toast.error(`Erreur d'enregistrement : ${error.message}`);
    },
  });

  const [taxPolicies, setTaxPolicies] = useState<StoreTaxPolicy[]>([]);
  // Array of country codes selected/checked by user for tax declaration management
  const [selectedCountryCodes, setSelectedCountryCodes] = useState<StorefrontCountryCode[]>([]);
  const [checklistOpen, setChecklistOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMode, setFilterMode] = useState<"all" | "configured_only">("all");

  useEffect(() => {
    if (taxPoliciesQuery.data) {
      setTaxPolicies(taxPoliciesQuery.data);
      
      // Determine initial active tax countries:
      // Include any country with existing policy or explicitly configured displayMode/notice,
      // plus the store primary country and visible market countries if list is empty.
      const configuredCodes = taxPoliciesQuery.data
        .filter(p => p.displayMode !== "to_confirm" || p.notice.trim().length > 0)
        .map(p => p.countryCode as StorefrontCountryCode);

      const initialCodes = Array.from(
        new Set([
          ...configuredCodes,
          ...taxPoliciesQuery.data.map(p => p.countryCode as StorefrontCountryCode),
          ...(activeStoreMarketCountries.length > 0 ? activeStoreMarketCountries : [primaryCountry]),
        ])
      ).filter(Boolean) as StorefrontCountryCode[];

      setSelectedCountryCodes(initialCodes.length > 0 ? initialCodes : [primaryCountry as StorefrontCountryCode]);
    }
  }, [taxPoliciesQuery.data, activeStoreMarketCountries, primaryCountry]);

  // Handle local state updates
  const setTaxPolicy = (countryCode: StorefrontCountryCode, patch: Partial<StoreTaxPolicy>) => {
    setTaxPolicies((current) => {
      const existing = current.find((p) => p.countryCode === countryCode);
      if (existing) {
        return current.map((p) => (p.countryCode === countryCode ? { ...p, ...patch } : p));
      }
      return [...current, { countryCode, displayMode: "to_confirm", notice: "", ...patch }];
    });
  };

  const removeCountryFromTax = (countryCode: StorefrontCountryCode) => {
    setSelectedCountryCodes((current) => current.filter((code) => code !== countryCode));
    setTaxPolicies((current) => current.filter((p) => p.countryCode !== countryCode));
    toast.info(`Pays (${countryCode}) retiré de la déclaration fiscale.`);
  };

  const toggleCountryInChecklist = (code: StorefrontCountryCode) => {
    setSelectedCountryCodes((current) => {
      if (current.includes(code)) {
        return current.filter((c) => c !== code);
      }
      return [...current, code];
    });
  };

  const selectDefaultMarketsOnly = () => {
    const defaults = Array.from(
      new Set([primaryCountry, ...activeStoreMarketCountries])
    ).filter(Boolean) as StorefrontCountryCode[];
    setSelectedCountryCodes(defaults);
    toast.message(`Sélection réinitialisée aux marchés actifs de la boutique (${defaults.length} pays).`);
  };

  const clearAllSelectedCountries = () => {
    setSelectedCountryCodes([]);
  };

  // Search filtering in country list (240+ countries)
  const filteredCountriesForChecklist = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return storefrontCountryChoices;
    return storefrontCountryChoices.filter(
      (c) => c.label.toLowerCase().includes(q) || c.code.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  // Countries to display as active cards in main form
  const activeCardsToDisplay = useMemo(() => {
    let list = selectedCountryCodes;
    if (filterMode === "configured_only") {
      list = list.filter((code) => {
        const policy = taxPolicies.find((p) => p.countryCode === code);
        return policy && (policy.displayMode !== "to_confirm" || policy.notice.trim().length > 0);
      });
    }
    return list;
  }, [selectedCountryCodes, taxPolicies, filterMode]);

  const handleSave = () => {
    // Only validate policies for currently selected countries
    const activePolicies = selectedCountryCodes.map((code) => {
      const existing = taxPolicies.find((p) => p.countryCode === code);
      return (
        existing || {
          countryCode: code,
          displayMode: "to_confirm" as const,
          notice: "",
        }
      );
    });

    const invalid = activePolicies.some(
      (p) => p.displayMode !== "to_confirm" && p.notice.trim().length < 2
    );

    if (invalid) {
      toast.error("Veuillez renseigner une mention publique validée pour chaque pays actif en mode 'Taxes comprises' ou 'Taxe non collectée'.");
      return;
    }

    saveTaxPolicies.mutate(
      activePolicies.map((p) => ({
        ...p,
        notice: p.notice.trim(),
      }))
    );
  };

  return (
    <Card className="border-violet-200 shadow-sm">
      <CardHeader className="bg-gradient-to-r from-violet-50/80 via-purple-50/40 to-white pb-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl font-bold text-slate-900">
              <Globe2 className="h-5 w-5 text-violet-700" /> Fiscalité par marché — déclaration
            </CardTitle>
            <CardDescription className="mt-1.5 max-w-2xl text-sm text-slate-600">
              Préparez et déclarez la mention fiscale publique affichée aux clients selon leur pays. Sélectionnez uniquement les marchés visés grâce à la checklist pour garder une page fluide.
            </CardDescription>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setChecklistOpen(true)}
              className="border-violet-300 bg-white text-violet-950 hover:bg-violet-50"
            >
              <CheckSquare className="mr-2 h-4 w-4 text-violet-700" />
              Gérer / Cocher les pays ({selectedCountryCodes.length})
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              disabled={saveTaxPolicies.isPending || taxPoliciesQuery.isLoading}
              className="bg-violet-700 hover:bg-violet-800 text-white"
            >
              <Save className="mr-2 h-4 w-4" />
              {saveTaxPolicies.isPending ? "Enregistrement…" : "Enregistrer"}
            </Button>
          </div>
        </div>

        {/* Status banner */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-violet-100 bg-white p-3 text-xs text-slate-700">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-violet-200 bg-violet-50 font-bold text-violet-900">
              {selectedCountryCodes.length} pays sélectionné{selectedCountryCodes.length > 1 ? "s" : ""}
            </Badge>
            <span className="hidden sm:inline text-slate-400">|</span>
            <span className="truncate max-w-md font-medium text-slate-700">
              {selectedCountryCodes.slice(0, 5).map((code) => {
                const choice = storefrontCountryChoices.find((c) => c.code === code);
                return choice?.label || code;
              }).join(", ")}
              {selectedCountryCodes.length > 5 ? ` et ${selectedCountryCodes.length - 5} autres` : ""}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setFilterMode("all")}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                filterMode === "all"
                  ? "bg-violet-100 text-violet-900 font-semibold"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              Tous les cochés ({selectedCountryCodes.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterMode("configured_only")}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                filterMode === "configured_only"
                  ? "bg-violet-100 text-violet-900 font-semibold"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              Renseignés uniquement
            </button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-5 space-y-4">
        {taxPoliciesQuery.isLoading ? (
          <div className="h-40 animate-pulse rounded-xl bg-slate-100" />
        ) : (
          <>
            <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3.5 text-xs leading-5 text-amber-950 flex items-start gap-2.5">
              <AlertCircle className="h-4 w-4 shrink-0 text-amber-700 mt-0.5" />
              <div>
                <strong className="font-semibold text-amber-900 block">Information importante :</strong>
                Ce réglage ne calcule aucun taux automatisé. Il publie uniquement la phrase explicative validée pour chaque marché sélectionné lors du passage de commande ou sur les fiches produits.
              </div>
            </div>

            {selectedCountryCodes.length === 0 ? (
              <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-8 text-center space-y-3">
                <Globe2 className="mx-auto h-10 w-10 text-slate-400" />
                <p className="text-sm font-semibold text-slate-800">Aucun pays sélectionné pour la déclaration fiscale</p>
                <p className="max-w-md mx-auto text-xs text-slate-500">
                  Cliquez sur le bouton ci-dessous pour ouvrir la liste des 240+ pays et cocher uniquement les marchés que vous désirez activer.
                </p>
                <Button
                  type="button"
                  onClick={() => setChecklistOpen(true)}
                  className="bg-violet-700 hover:bg-violet-800 text-white min-h-10 px-5"
                >
                  <CheckSquare className="mr-2 h-4 w-4" />
                  Ouvrir la checklist des pays
                </Button>
              </div>
            ) : activeCardsToDisplay.length === 0 ? (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-center text-xs text-slate-600">
                Aucun pays ne correspond au filtre 'Renseignés uniquement'.{" "}
                <button
                  type="button"
                  onClick={() => setFilterMode("all")}
                  className="text-violet-700 font-semibold underline ml-1"
                >
                  Afficher tous les {selectedCountryCodes.length} pays cochés
                </button>
              </div>
            ) : (
              <div className="grid gap-4">
                {activeCardsToDisplay.map((countryCode) => {
                  const country = storefrontCountryChoices.find((c) => c.code === countryCode);
                  const policy = taxPolicies.find((p) => p.countryCode === countryCode);
                  const mode = policy?.displayMode || "to_confirm";
                  const notice = policy?.notice || "";
                  const isVisibleInStore = activeStoreMarketCountries.includes(countryCode);

                  return (
                    <section
                      key={countryCode}
                      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs transition-all hover:border-violet-300"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                          <span className="inline-grid h-7 w-9 place-items-center rounded bg-slate-100 text-xs font-bold font-mono text-slate-800">
                            {countryCode}
                          </span>
                          <div>
                            <p className="text-sm font-bold text-slate-900">
                              {country?.label || countryCode}
                            </p>
                            <p className="text-xs text-slate-500">
                              {isVisibleInStore
                                ? "✓ Marché actuellement visible sur votre boutique"
                                : "Marché secondaire (mention conservée pour ce pays)"}
                            </p>
                          </div>
                        </div>

                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => removeCountryFromTax(countryCode)}
                          className="h-8 text-xs text-slate-500 hover:bg-red-50 hover:text-red-700"
                        >
                          <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Retirer
                        </Button>
                      </div>

                      <div className="mt-3 grid gap-4 md:grid-cols-[220px_1fr]">
                        <div className="space-y-1.5">
                          <Label htmlFor={`tax-mode-${countryCode}`} className="text-xs font-semibold text-slate-700">
                            Statut de la mention
                          </Label>
                          <select
                            id={`tax-mode-${countryCode}`}
                            value={mode}
                            onChange={(e) =>
                              setTaxPolicy(countryCode, {
                                displayMode: e.target.value as StoreTaxPolicy["displayMode"],
                              })
                            }
                            className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-900 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                          >
                            <option value="to_confirm">À confirmer — ne pas afficher</option>
                            <option value="included">Prix affichés taxes comprises</option>
                            <option value="not_collected">Taxe non collectée — formulation requise</option>
                          </select>
                        </div>

                        <div className="space-y-1.5">
                          <Label htmlFor={`tax-notice-${countryCode}`} className="text-xs font-semibold text-slate-700">
                            Mention publique à afficher au client
                          </Label>
                          <Textarea
                            id={`tax-notice-${countryCode}`}
                            rows={2}
                            maxLength={360}
                            disabled={mode === "to_confirm"}
                            value={notice}
                            placeholder="Ex. Prix affichés taxes comprises selon le régime applicable à cette vente."
                            onChange={(e) => setTaxPolicy(countryCode, { notice: e.target.value })}
                            className="text-xs resize-none rounded-xl"
                          />
                          <div className="flex items-center justify-between text-[11px] text-slate-400">
                            <span>
                              {mode === "to_confirm"
                                ? "La mention sera masquée sur la boutique tant que le statut reste 'À confirmer'."
                                : "Visuel validé pour la boutique et la fiche de panier."}
                            </span>
                            <span>{notice.length}/360 char.</span>
                          </div>
                        </div>
                      </div>
                    </section>
                  );
                })}
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4">
              <p className="max-w-xl text-xs text-slate-500">
                Vous pouvez ajouter ou retirer des pays à tout moment. Seules les fiches cochées sont enregistrées et conservées dans le profil légal de cette boutique.
              </p>

              <Button
                type="button"
                onClick={handleSave}
                disabled={saveTaxPolicies.isPending}
                className="bg-violet-700 hover:bg-violet-800 text-white min-h-10"
              >
                <Save className="mr-2 h-4 w-4" />
                {saveTaxPolicies.isPending ? "Enregistrement en cours…" : "Enregistrer les mentions fiscales"}
              </Button>
            </div>
          </>
        )}
      </CardContent>

      {/* Checklist Selection Modal */}
      <Dialog open={checklistOpen} onOpenChange={setChecklistOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-6">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg font-bold text-slate-900">
              <CheckSquare className="h-5 w-5 text-violet-700" /> Checklist des pays — Fiscalité & marché
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-600">
              Cochez les pays pour lesquels vous souhaitez rédiger ou conserver une déclaration fiscale publique.
            </DialogDescription>
          </DialogHeader>

          {/* Search bar & quick presets */}
          <div className="space-y-3 py-2 border-y border-slate-100">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Chercher un pays (ex. Algérie, France, Suisse, Canada, Maroc...)"
                className="pl-9 h-10 text-xs rounded-xl"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={selectDefaultMarketsOnly}
                  className="h-8 text-xs border-violet-200 text-violet-900 bg-violet-50 hover:bg-violet-100"
                >
                  Garder marchés de la boutique ({Array.from(new Set([primaryCountry, ...activeStoreMarketCountries])).length})
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={clearAllSelectedCountries}
                  className="h-8 text-xs text-slate-500 hover:text-slate-900"
                >
                  Tout décocher
                </Button>
              </div>

              <span className="text-xs font-semibold text-slate-700">
                {selectedCountryCodes.length} / {storefrontCountryChoices.length} pays cochés
              </span>
            </div>
          </div>

          {/* Scrollable list of 240+ countries */}
          <div className="flex-1 overflow-y-auto pr-1 py-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
            {filteredCountriesForChecklist.map((c) => {
              const isChecked = selectedCountryCodes.includes(c.code);
              return (
                <label
                  key={c.code}
                  className={`flex items-center justify-between p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                    isChecked
                      ? "border-violet-500 bg-violet-50/70 font-semibold text-violet-950"
                      : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 pr-2">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleCountryInChecklist(c.code)}
                      className="h-4 w-4 rounded border-slate-300 text-violet-700 focus:ring-violet-500"
                    />
                    <span className="truncate">{c.label}</span>
                  </div>
                  <span className="text-[10px] font-mono uppercase text-slate-400 shrink-0 font-bold">
                    {c.code}
                  </span>
                </label>
              );
            })}

            {filteredCountriesForChecklist.length === 0 && (
              <p className="col-span-2 py-8 text-center text-xs text-slate-500">
                Aucun pays trouvé pour "{searchQuery}".
              </p>
            )}
          </div>

          <DialogFooter className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              {selectedCountryCodes.length} pays affiché{selectedCountryCodes.length > 1 ? "s" : ""} dans le formulaire
            </span>
            <Button
              type="button"
              onClick={() => {
                setChecklistOpen(false);
                toast.success(`${selectedCountryCodes.length} pays prêts pour l'édition de leur déclaration fiscale.`);
              }}
              className="bg-violet-700 hover:bg-violet-800 text-white text-xs min-h-9 px-5"
            >
              Valider la sélection ({selectedCountryCodes.length})
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
