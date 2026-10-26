import { useState } from "react";
import { Sparkles, Wand2, Loader2, CheckCircle2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export interface QuickAiFillResult {
  name: string;
  slug: string;
  shortDescription: string;
  longDescription: string;
}

interface OwnerQuickAiProductFillProps {
  currentName: string;
  categoryName?: string;
  onApply: (result: QuickAiFillResult) => void;
}

export default function OwnerQuickAiProductFill({
  currentName,
  categoryName,
  onApply,
}: OwnerQuickAiProductFillProps) {
  const [keyword, setKeyword] = useState("");
  const [tone, setTone] = useState<"premium" | "persuasive" | "minimalist" | "eco" | "direct">("premium");
  const [lastGenerated, setLastGenerated] = useState(false);

  const generateMutation = trpc.aiStudio.generateCopy.useMutation({
    onSuccess: (data) => {
      const slug = data.title
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
        .slice(0, 80);

      const bulletsText = data.bulletPoints?.length
        ? `\n\nPoints forts & Bénéfices :\n${data.bulletPoints.map((b: string) => `• ${b}`).join("\n")}`
        : "";

      const seoFooter = data.keywords?.length
        ? `\n\nMots-clés associés : ${data.keywords.join(", ")}`
        : "";

      onApply({
        name: data.title,
        slug,
        shortDescription: data.tagline || data.seoDescription || data.description.slice(0, 160),
        longDescription: `${data.description}${bulletsText}${seoFooter}`,
      });

      setLastGenerated(true);
      toast.success("Fiche produit rédigée et remplie automatiquement par l'IA !");
    },
    onError: (err) => {
      toast.error(err.message || "Impossible de générer la fiche pour le moment.");
    },
  });

  const handleGenerate = () => {
    const targetTitle = (keyword.trim() || currentName.trim());
    if (targetTitle.length < 2) {
      toast.error("Saisissez au moins un mot-clé ou un nom de produit (ex. Coffret Huile d'Argan Bio).");
      return;
    }
    generateMutation.mutate({
      title: targetTitle,
      category: categoryName,
      tone,
      language: "fr",
    });
  };

  return (
    <div className="rounded-2xl border border-violet-200 bg-gradient-to-r from-violet-50/90 via-fuchsia-50/60 to-violet-50/90 p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-700 text-white shadow-sm">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-bold text-violet-950">Générateur IA de Fiche Produit en 1 Clic</p>
              <Badge className="border-0 bg-violet-700 text-[10px] text-white">Ultra-Rapide</Badge>
            </div>
            <p className="text-xs text-violet-800">
              Indiquez un simple mot-clé : l’IA rédige instantanément le titre vendeur, l’accroche, les arguments à puces et le slug SEO.
            </p>
          </div>
        </div>

        {lastGenerated && (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
            <CheckCircle2 className="h-3.5 w-3.5" /> Contenu appliqué
          </span>
        )}
      </div>

      <div className="mt-3 grid gap-2.5 sm:grid-cols-12">
        <div className="sm:col-span-6">
          <Input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder={currentName ? `Idée ou mot-clé (actuel : ${currentName})` : "Ex. Sac cabas cuir artisanal, Miel de Jujubier pur..."}
            className="h-10 bg-white text-xs sm:text-sm border-violet-200 focus-visible:ring-violet-600"
          />
        </div>

        <div className="sm:col-span-3">
          <select
            aria-label="Ton de rédaction IA"
            value={tone}
            onChange={(e) => setTone(e.target.value as any)}
            className="h-10 w-full rounded-md border border-violet-200 bg-white px-3 text-xs font-medium text-slate-800"
          >
            <option value="premium">Ton : Luxe & Premium</option>
            <option value="persuasive">Ton : Vendeur & Persuasif</option>
            <option value="eco">Ton : Naturel & Authentique</option>
            <option value="minimalist">Ton : Épuré & Suisse</option>
            <option value="direct">Ton : Direct & Efficace</option>
          </select>
        </div>

        <div className="sm:col-span-3">
          <Button
            type="button"
            onClick={handleGenerate}
            disabled={generateMutation.isPending}
            className="h-10 w-full bg-violet-700 hover:bg-violet-800 text-white font-semibold text-xs gap-1.5 shadow-sm"
          >
            {generateMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Rédaction IA…
              </>
            ) : (
              <>
                <Wand2 className="h-4 w-4" />
                Générer la fiche
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
