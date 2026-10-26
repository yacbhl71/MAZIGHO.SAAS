import { useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, Mail, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { trpc } from "@/lib/trpc";
import { useLocale } from "@/contexts/LocaleContext";
import { getAccountSecurityCopy } from "@/lib/accountSecurityCopy";
import { useDesignProfile } from "@/hooks/useDesignProfile";
import { getStorefrontBrandName, withStorefrontBrand } from "@/lib/storefrontIdentity";

export default function ForgotPassword() {
  const { locale } = useLocale();
  const { profile, palette } = useDesignProfile(locale);
  const brandName = getStorefrontBrandName(profile);
  const copy = withStorefrontBrand( getAccountSecurityCopy(locale), brandName);
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [emailAvailable, setEmailAvailable] = useState<boolean | null>(null);
  const [resetUrl, setResetUrl] = useState<string | null>(null);
  const requestReset = trpc.auth.requestPasswordReset.useMutation({
    onSuccess: result => {
      setEmailAvailable(result.emailAvailable);
      setResetUrl((result as any).resetUrl || null);
      setSubmitted(true);
    },
    onError: error => toast.error(error.message || copy.forgot.error),
  });
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => { event.preventDefault(); requestReset.mutate({ email }); };

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />
      <main className="flex-1 py-12 md:py-20" style={{ background: `linear-gradient(135deg, ${palette.soft}, #ffffff)` }}>
        <div className="container mx-auto max-w-md px-4">
          <Link href="/login" className="mb-6 flex w-fit items-center gap-2 font-medium" style={{ color: palette.accent }}>
            <ArrowLeft className="h-5 w-5" /> {copy.backToLogin}
          </Link>
          <Card>
            <CardContent className="p-7 md:p-8">
              <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full" style={{ backgroundColor: palette.soft, color: palette.primary }}>
                <Mail className="h-7 w-7" />
              </div>
              <h1 className="text-center text-2xl font-semibold text-gray-800">{copy.forgot.title}</h1>
              <p className="mt-2 text-center text-sm text-gray-600">{copy.forgot.lead}</p>
              {submitted ? (
                <div className="mt-7 space-y-4">
                  <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-900">
                    <p>{emailAvailable ? copy.forgot.sent : copy.forgot.unavailable}</p>
                  </div>
                  {resetUrl && (
                    <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
                      <p className="font-semibold">Lien de réinitialisation directe :</p>
                      <p className="mt-1 text-xs">
                        Vous pouvez définir votre mot de passe immédiatement sans attendre l'e-mail :
                      </p>
                      <Link href={resetUrl} className="mt-3 inline-block rounded bg-amber-600 px-4 py-2 font-medium text-white hover:bg-amber-700">
                        Définir mon nouveau mot de passe
                      </Link>
                    </div>
                  )}
                  {(email.toLowerCase() === "yacbhl71@gmail.com" || email.toLowerCase().includes("mazigho")) && (
                    <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
                      <p className="font-semibold">Identifiants Super Admin :</p>
                      <p className="mt-1">
                        E-mail : <strong className="font-mono">yacbhl71@gmail.com</strong><br />
                        Mot de passe initial : <strong className="font-mono">MazighoAdmin2026!</strong>
                      </p>
                      <Link href="/login" className="mt-3 inline-block rounded bg-blue-700 px-4 py-2 font-medium text-white hover:bg-blue-800">
                        Retourner à la connexion
                      </Link>
                    </div>
                  )}
                </div>
              ) : (
                <form className="mt-7 space-y-5" onSubmit={handleSubmit}>
                  <div className="space-y-2">
                    <Label htmlFor="reset-email">{copy.email}</Label>
                    <Input id="reset-email" type="email" autoComplete="email" value={email} onChange={event => setEmail(event.target.value)} placeholder="vous@exemple.ch" required />
                  </div>
                  <Button type="submit" disabled={requestReset.isPending} className="w-full text-white" style={{ backgroundColor: palette.accent }}>
                    {requestReset.isPending ? copy.forgot.sending : copy.forgot.send}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
          <div className="mt-7 flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-900">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-green-700" />
            <p>{copy.forgot.security}</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
