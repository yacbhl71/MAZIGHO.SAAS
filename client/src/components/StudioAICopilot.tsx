import { useState } from "react";
import { RotateCcw, ShieldCheck, Sparkles } from "lucide-react";
import { AIChatBox, type Message } from "@/components/AIChatBox";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

const initialMessages: Message[] = [{ role: "system", content: "Vous êtes le copilote de MAZIGHO Studio." }];

export default function StudioAICopilot() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const chat = trpc.admin.studio.assistant.chat.useMutation({
    onSuccess: response => setMessages(current => [...current, { role: "assistant", content: response.answer }]),
    onError: error => toast.error(error.message || "Le copilote Studio est momentanément indisponible."),
  });

  const sendMessage = (content: string) => {
    const nextMessages = [...messages, { role: "user" as const, content }];
    setMessages(nextMessages);
    chat.mutate({
      messages: nextMessages
        .filter((message): message is Message & { role: "user" | "assistant" } => message.role !== "system")
        .map(message => ({ role: message.role, content: message.content })),
    });
  };

  const copyDraft = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      toast.success("Synthèse copiée dans le presse-papiers.");
    } catch {
      toast.error("La copie n’a pas pu être effectuée sur cet appareil.");
    }
  };

  return (
    <section id="studio-ai" className="scroll-mt-6 rounded-2xl border border-fuchsia-200 bg-gradient-to-br from-violet-50 via-white to-fuchsia-50 p-5 shadow-sm md:p-6" data-testid="studio-ai-copilot">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-violet-700">Pilotage augmenté</p>
          <h2 className="mt-1 flex items-center gap-2 text-2xl font-bold tracking-tight text-violet-950"><Sparkles className="h-6 w-6" /> Copilote IA Studio</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-violet-900">Analysez l’état global de la plateforme, préparez un plan d’action et rédigez des messages opérateur. Le copilote ne modifie aucune boutique.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-800"><ShieldCheck className="mr-1 h-3.5 w-3.5" /> Indicateurs opérateur · sans données client ni secrets</Badge>
          <button type="button" onClick={() => setMessages(initialMessages)} disabled={chat.isPending || messages.length <= 1} className="inline-flex min-h-10 items-center gap-2 rounded-md border border-violet-200 bg-white px-3 text-xs font-semibold text-violet-800 transition hover:bg-violet-50 disabled:cursor-not-allowed disabled:opacity-50"><RotateCcw className="h-3.5 w-3.5" /> Nouvelle conversation</button>
        </div>
      </div>
      <Card className="mt-5 border-violet-200 bg-white/80">
        <CardHeader>
          <CardTitle className="text-base">Conseiller & Guide Opérationnel Studio</CardTitle>
          <CardDescription>
            Votre copilote pour orienter les marchands, débloquer les thèmes, vérifier les configurations avant ouverture et trouver immédiatement des solutions techniques.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Quick Operator Procedure Chips */}
          <div className="rounded-xl border border-violet-200 bg-violet-50/50 p-3">
            <p className="text-xs font-bold uppercase tracking-wider text-violet-900">
              Procédures Studio & Assistance Marchands
            </p>
            <div className="mt-2.5 flex flex-wrap gap-2">
              {[
                {
                  label: "👑 Débloquer un thème Shopify",
                  prompt: "Explique-moi les étapes dans Studio pour attribuer ou débloquer un thème Shopify Premium selon l'abonnement du client (Free, Basic, Pro, VIP).",
                },
                {
                  label: "🔍 Checklist passage en production",
                  prompt: "Quels sont tous les contrôles obligatoires (produits, devises, paiement, livraisons, politique de retour) à vérifier avant d'activer une boutique en production ?",
                },
                {
                  label: "🇩🇿 Guider un marchand Algérie (58 wilayas & COD)",
                  prompt: "Comment guider un marchand pour configurer la livraison sur les 58 wilayas d'Algérie et le paiement à la livraison (Cash on Delivery) ?",
                },
                {
                  label: "🌐 Dépannage Domaine & DNS",
                  prompt: "Quelles sont les vérifications et étapes pas-à-pas pour résoudre un problème de connexion de nom de domaine personnalisé ou de certificat SSL ?",
                },
              ].map(guide => (
                <button
                  key={guide.label}
                  type="button"
                  onClick={() => sendMessage(guide.prompt)}
                  disabled={chat.isPending}
                  className="rounded-lg border border-violet-200 bg-white px-3 py-1.5 text-xs font-semibold text-violet-900 transition hover:bg-violet-100 hover:border-violet-300 active:scale-95 text-left disabled:opacity-50"
                >
                  {guide.label}
                </button>
              ))}
            </div>
          </div>

          <AIChatBox
            messages={messages}
            onSendMessage={sendMessage}
            onCopyAssistantMessage={copyDraft}
            isLoading={chat.isPending}
            placeholder="Ex. Comment guider un client sur la configuration des variantes ? Ou vérifier les boutiques en attente..."
            height="min(560px, 64vh)"
            emptyStateMessage="Bonjour Opérateur Studio ! Quelle opération ou boutique souhaitez-vous analyser ?"
            suggestedPrompts={[
              "Résume l’état global des boutiques et les points d’attention.",
              "Quelles sont les étapes pour débloquer un thème Shopify Premium à un client ?",
              "Propose une checklist complète pour préparer une boutique avant ouverture.",
              "Rédige un message pas-à-pas pour aider un commerçant à configurer ses livraisons.",
            ]}
          />
        </CardContent>
      </Card>
      <p className="mt-4 text-xs leading-5 text-violet-900">Aucun secret, mot de passe, jeton, numéro de carte, contenu client ou donnée fournisseur détaillée n’est transmis au modèle.</p>
    </section>
  );
}
