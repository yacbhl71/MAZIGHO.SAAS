import { useState, useEffect } from "react";
import { Gift, Sparkles, X, CheckCircle2, Loader2, Trophy } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import type { SpinToWinReward } from "@shared/spinToWinGamification";

export default function SpinToWinPopup() {
  const settingsQuery = trpc.spinToWin.getSettings.useQuery();
  const claimReward = trpc.spinToWin.claimReward.useMutation();

  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [isSpinning, setIsSpinning] = useState(false);
  const [wonReward, setWonReward] = useState<SpinToWinReward | null>(null);
  const [rotationDegrees, setRotationDegrees] = useState(0);

  const settings = settingsQuery.data;

  useEffect(() => {
    // Show popup once after 6 seconds if enabled and not already dismissed/claimed
    if (settings?.enabled && !localStorage.getItem("mazigho_spintowin_dismissed")) {
      const timer = setTimeout(() => {
        setOpen(true);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [settings?.enabled]);

  if (!settings?.enabled || !settings.rewards.length) return null;

  const rewards = settings.rewards;
  const numSegments = rewards.length;
  const segmentAngle = 360 / numSegments;

  const spin = () => {
    if (!email.trim() || !email.includes("@")) {
      toast.error("Veuillez entrer une adresse email valide.");
      return;
    }

    setIsSpinning(true);

    // Pick winning reward based on probability weight
    const totalWeight = rewards.reduce((sum, r) => sum + r.probabilityWeight, 0);
    let randomNum = Math.random() * totalWeight;
    let selectedIndex = 0;

    for (let i = 0; i < rewards.length; i++) {
      if (randomNum < rewards[i].probabilityWeight) {
        selectedIndex = i;
        break;
      }
      randomNum -= rewards[i].probabilityWeight;
    }

    const reward = rewards[selectedIndex];

    // Calculate rotation to align winning segment to top pointer (270 degrees)
    const extraTurns = 5; // 5 full spins
    const targetSegmentCenterAngle = selectedIndex * segmentAngle + segmentAngle / 2;
    const finalDegree = 360 * extraTurns + (360 - targetSegmentCenterAngle);

    setRotationDegrees(finalDegree);

    setTimeout(() => {
      setIsSpinning(false);
      setWonReward(reward);
      claimReward.mutate({
        email: email.trim(),
        rewardCode: reward.code,
        rewardLabel: reward.label,
      });
      localStorage.setItem("mazigho_spintowin_dismissed", "1");
    }, 4000);
  };

  const close = () => {
    setOpen(false);
    localStorage.setItem("mazigho_spintowin_dismissed", "1");
  };

  return (
    <>
      {/* Floating launcher trigger if user dismissed it */}
      {!open && settings.enabled && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="fixed bottom-6 left-6 z-40 flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 px-4 py-3 text-sm font-bold text-white shadow-2xl transition hover:scale-105"
        >
          <Gift className="h-5 w-5 animate-bounce" />
          <span>Roue Privilège</span>
        </button>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg border-amber-300 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-6 text-white shadow-2xl">
          <button
            type="button"
            onClick={close}
            className="absolute right-4 top-4 rounded-full p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-slate-950 shadow-lg">
              <Trophy className="h-6 w-6" />
            </div>
            <h2 className="mt-3 text-2xl font-bold tracking-tight text-amber-300">{settings.title}</h2>
            <p className="mt-1 text-xs text-slate-300">{settings.description}</p>
          </div>

          {/* Spinning Wheel Container */}
          <div className="relative my-6 flex justify-center overflow-hidden py-4">
            {/* Pointer */}
            <div className="absolute top-1 z-20 h-0 w-0 border-x-[12px] border-x-transparent border-t-[20px] border-t-amber-400 drop-shadow-md" />

            {/* Wheel Canvas / SVG */}
            <div
              className="relative h-64 w-64 rounded-full border-4 border-amber-400/80 shadow-2xl transition-transform duration-[4000ms] ease-out"
              style={{ transform: `rotate(${rotationDegrees}deg)` }}
            >
              <svg viewBox="0 0 100 100" className="h-full w-full rounded-full">
                {rewards.map((r, i) => {
                  const startAngle = (i * 360) / numSegments;
                  const endAngle = ((i + 1) * 360) / numSegments;
                  const x1 = 50 + 50 * Math.cos((Math.PI * startAngle) / 180);
                  const y1 = 50 + 50 * Math.sin((Math.PI * startAngle) / 180);
                  const x2 = 50 + 50 * Math.cos((Math.PI * endAngle) / 180);
                  const y2 = 50 + 50 * Math.sin((Math.PI * endAngle) / 180);
                  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
                  const pathData = `M 50 50 L ${x1} ${y1} A 50 50 0 ${largeArc} 1 ${x2} ${y2} Z`;
                  const colors = ["#b45309", "#78350f", "#d97706", "#92400e", "#ea580c", "#c2410c"];
                  const color = colors[i % colors.length];

                  return (
                    <g key={r.id}>
                      <path d={pathData} fill={color} stroke="#fbbf24" strokeWidth="0.5" />
                      <text
                        x="50"
                        y="20"
                        transform={`rotate(${startAngle + segmentAngle / 2}, 50, 50)`}
                        fill="#fff"
                        fontSize="4"
                        fontWeight="bold"
                        textAnchor="middle"
                      >
                        {r.discountPercent > 0 ? `-${r.discountPercent}%` : r.label.slice(0, 10)}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>

          {!wonReward ? (
            <div className="space-y-3">
              <Input
                type="email"
                placeholder="Entrez votre e-mail pour tourner..."
                value={email}
                onChange={e => setEmail(e.target.value)}
                disabled={isSpinning}
                className="bg-slate-900 border-amber-500/40 text-white placeholder:text-slate-500 h-11"
              />
              <Button
                type="button"
                onClick={spin}
                disabled={isSpinning || !email.trim()}
                className="w-full min-h-11 bg-gradient-to-r from-amber-500 to-orange-600 font-bold text-slate-950 hover:from-amber-400 hover:to-orange-500 text-base"
              >
                {isSpinning ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Sparkles className="mr-2 h-5 w-5" />}
                {isSpinning ? "La roue tourne..." : "Tourner la roue !"}
              </Button>
            </div>
          ) : (
            <div className="rounded-2xl border border-amber-400/40 bg-amber-500/10 p-5 text-center space-y-3">
              <div className="flex items-center justify-center gap-2 text-amber-300 font-bold text-lg">
                <CheckCircle2 className="h-6 w-6 text-amber-400" />
                <span>Félicitations ! Vous avez gagné :</span>
              </div>
              <p className="text-xl font-extrabold text-white">{wonReward.label}</p>
              <div className="inline-block rounded-xl border border-dashed border-amber-400 bg-slate-900 px-5 py-2 font-mono text-xl font-bold tracking-widest text-amber-300">
                {wonReward.code}
              </div>
              <p className="text-xs text-slate-300">Un e-mail de confirmation a été enregistré pour {email}. Utilisez ce code lors de la validation de votre panier !</p>
              <Button onClick={close} className="w-full min-h-11 bg-amber-400 text-slate-950 hover:bg-amber-300 font-bold">
                Profiter de l'offre
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
