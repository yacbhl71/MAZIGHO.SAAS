import { useState } from "react";
import { Copy, Download, ImagePlus, Loader2, ShieldCheck, Sparkles, WandSparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

type ImageFormat = "hero" | "story" | "square";
type ImageStyle = "editorial" | "soft" | "bold";

export default function OwnerImageGenerator({ storeName }: { storeName?: string }) {
  const [subject, setSubject] = useState("");
  const [format, setFormat] = useState<ImageFormat>("hero");
  const [style, setStyle] = useState<ImageStyle>("editorial");
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  const generate = trpc.owner.assistant.generateStorefrontImage.useMutation({
    onSuccess: result => {
      setGeneratedImage(result.url);
      toast.success("Visuel généré avec succès pour votre boutique !");
    },
    onError: error => {
      toast.error(error.message || "La génération d'image a échoué.");
    },
  });

  const canGenerate = subject.trim().length >= 12 && !generate.isPending;

  const copyUrlToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success("URL du visuel copié ! Vous pouvez l'insérer dans un produit ou une bannière.");
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto" data-testid="owner-image-generator">
      <Card className="border-fuchsia-200 bg-gradient-to-br from-fuchsia-50 via-white to-violet-50 shadow-sm">
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Badge className="border-0 bg-fuchsia-900 text-white font-semibold">Studio Visuel IA Boutique</Badge>
                <Badge variant="outline" className="border-fuchsia-300 bg-white text-fuchsia-950 font-semibold">Gemini Flash Motorisé</Badge>
              </div>
              <CardTitle className="mt-3 flex items-center gap-2 text-2xl text-fuchsia-950">
                <WandSparkles className="h-6 w-6 text-fuchsia-700" /> Générateur d’images IA pour {storeName || "votre boutique"}
              </CardTitle>
              <CardDescription className="mt-1.5 max-w-3xl leading-6 text-slate-600">
                Créez des visuels originaux et de haute qualité pour vos bannières d’accueil, fiches produits et cartes de collection sans quitter votre espace de gestion.
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="owner-image-subject" className="text-sm font-semibold text-slate-800">
              Sujet et ambiance du visuel
            </Label>
            <Textarea
              id="owner-image-subject"
              value={subject}
              onChange={event => setSubject(event.target.value)}
              maxLength={420}
              rows={4}
              placeholder="Ex. Une montre de luxe en acier brossé posée sur un coussin en velours noir, éclairage de studio professionnel, reflets dorés et ambiance raffinée."
            />
            <p className="text-xs leading-5 text-slate-500">
              Décrivez le produit, les matières, les couleurs et le style souhaités (12 à 420 caractères).
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="owner-image-format" className="text-sm font-semibold text-slate-800">Format</Label>
              <select
                id="owner-image-format"
                value={format}
                onChange={event => setFormat(event.target.value as ImageFormat)}
                className="flex h-11 w-full rounded-md border border-input bg-white px-3 text-sm focus:ring-2 focus:ring-fuchsia-500"
              >
                <option value="hero">Hero wide — bannière d'accueil (16:9)</option>
                <option value="story">Mobile Story — carte verticale (9:16)</option>
                <option value="square">Catalogue Produit — carré (1:1)</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="owner-image-style" className="text-sm font-semibold text-slate-800">Direction artistique</Label>
              <select
                id="owner-image-style"
                value={style}
                onChange={event => setStyle(event.target.value as ImageStyle)}
                className="flex h-11 w-full rounded-md border border-input bg-white px-3 text-sm focus:ring-2 focus:ring-fuchsia-500"
              >
                <option value="editorial">Éditoriale — raffinée et naturelle</option>
                <option value="soft">Douce — lumineuse et chaleureuse</option>
                <option value="bold">Affirmée — contrastée et moderne</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-3 rounded-xl border border-violet-200 bg-white/85 p-4 text-sm leading-6 text-violet-950 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-violet-700" />
              <p>
                <strong>Isolation & sécurité.</strong> Les visuels générés sont autonomes et disponibles dans le stockage privé de votre boutique.
              </p>
            </div>
            <Button
              type="button"
              className="min-h-11 shrink-0 bg-fuchsia-700 hover:bg-fuchsia-800 font-semibold"
              disabled={!canGenerate}
              onClick={() => generate.mutate({ subject: subject.trim(), format, style })}
            >
              {generate.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Génération en cours…
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" /> Générer le visuel IA
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {generate.isPending && (
        <Card className="border-fuchsia-200">
          <CardContent className="flex items-center gap-3 p-6 text-sm text-fuchsia-950 font-medium">
            <Loader2 className="h-5 w-5 animate-spin text-fuchsia-700" />
            Création de votre visuel par le moteur IA… Cela prend 3 à 5 secondes.
          </CardContent>
        </Card>
      )}

      {generatedImage && (
        <Card className="overflow-hidden border-emerald-200 bg-emerald-50/40" data-testid="owner-image-result">
          <CardHeader>
            <CardTitle className="text-emerald-950 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-emerald-700" /> Visuel généré et prêt
            </CardTitle>
            <CardDescription className="mt-1">
              Copiez l'URL pour l'utiliser directement dans vos fiches produits, diapositives de carrousel ou bannières de vitrine.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="overflow-hidden rounded-xl border border-emerald-100 bg-white shadow-inner">
              <img
                src={generatedImage}
                alt="Visuel généré par IA"
                className="max-h-[580px] w-full object-contain"
              />
            </div>

            <div className="flex flex-wrap gap-3">
              <Button asChild className="min-h-11 bg-emerald-700 hover:bg-emerald-800">
                <a href={generatedImage} target="_blank" rel="noreferrer">
                  <Download className="mr-2 h-4 w-4" /> Telecharger / Ouvrir l'image
                </a>
              </Button>
              <Button
                type="button"
                variant="outline"
                className="min-h-11 border-emerald-300 text-emerald-900 hover:bg-emerald-100"
                onClick={() => copyUrlToClipboard(generatedImage)}
              >
                <Copy className="mr-2 h-4 w-4" /> Copier l'URL du visuel
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="min-h-11 text-slate-700 hover:bg-slate-100"
                onClick={() => setGeneratedImage(null)}
              >
                Générer une autre variante
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
