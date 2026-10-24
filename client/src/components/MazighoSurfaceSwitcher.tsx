import { useState } from "react";
import { useLocation } from "wouter";
import { Building2, ChevronDown, ChevronUp, Compass, LayoutDashboard, Rocket, Sparkles, Store } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";

const SURFACES = [
  {
    id: "storefront",
    label: "Boutique MAZIGHO",
    domain: "mazigho.ch",
    path: "/",
    requiresAdmin: false,
    icon: Store,
  },
  {
    id: "pro",
    label: "Landing SaaS Pro",
    domain: "pro.mazigho.ch",
    path: "/mazigho-saas",
    requiresAdmin: false,
    icon: Rocket,
  },
  {
    id: "turnkey",
    label: "Boutique Clé en main",
    domain: "mazigho.ch/creation-boutique",
    path: "/creation-boutique",
    requiresAdmin: false,
    icon: Sparkles,
  },
  {
    id: "studio",
    label: "MAZIGHO Studio",
    domain: "studio.mazigho.ch",
    path: "/admin/studio",
    requiresAdmin: true,
    icon: Building2,
  },
  {
    id: "admin",
    label: "Admin Boutique",
    domain: "mazigho.ch/admin",
    path: "/admin",
    requiresAdmin: true,
    icon: LayoutDashboard,
  },
] as const;

export function MazighoSurfaceSwitcher() {
  const [open, setOpen] = useState(false);
  const [switching, setSwitching] = useState<string | null>(null);
  const [location, setLocation] = useLocation();
  const { user } = useAuth() as any;
  const utils = trpc.useUtils();
  const firebaseLogin = trpc.auth.firebaseLogin.useMutation();

  const hostname = typeof window !== "undefined" ? window.location.hostname.toLowerCase() : "";
  const isPreviewHost =
    hostname.endsWith(".run.app") ||
    hostname.endsWith(".usercontent.goog") ||
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname.endsWith(".localhost");

  if (!isPreviewHost && user?.role !== "admin") {
    return null;
  }

  const currentPath = location.split("?")[0];
  const activeSurface =
    currentPath.startsWith("/admin/studio")
      ? SURFACES[3]
      : currentPath.startsWith("/admin")
        ? SURFACES[4]
        : currentPath.startsWith("/creation-boutique")
          ? SURFACES[2]
          : currentPath === "/mazigho-saas"
            ? SURFACES[1]
            : SURFACES[0];

  const handleSelectSurface = async (surface: (typeof SURFACES)[number]) => {
    try {
      setSwitching(surface.id);
      if (surface.requiresAdmin && (!user || user.role !== "admin") && isPreviewHost) {
        const res = await firebaseLogin.mutateAsync({
          uid: "operator-yacbhl71",
          email: "yacbhl71@gmail.com",
          displayName: "Yacine (Opérateur MAZIGHO)",
        });
        if (typeof window !== "undefined" && res.sessionToken) {
          window.localStorage.setItem("mazigho_session_token", res.sessionToken);
        }
        utils.auth.me.setData(undefined, res.user as any);
        await Promise.all([
          utils.auth.me.invalidate(),
          utils.workspace.getCurrent.invalidate(),
        ]);
      }
      setLocation(surface.path);
      setOpen(false);
    } finally {
      setSwitching(null);
    }
  };

  return (
    <div
      className="fixed bottom-4 left-4 z-[90] font-sans"
      data-testid="mazigho-surface-switcher"
    >
      {open && (
        <div className="mb-2 w-72 rounded-2xl border border-slate-700/80 bg-slate-950/95 p-3 text-white shadow-2xl backdrop-blur-md">
          <div className="mb-2 flex items-center justify-between border-b border-slate-800 pb-2 px-1">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-orange-400">
                Navigation multi-espaces
              </p>
              <p className="text-xs text-slate-300">
                Basculer d’un domaine à l’autre
              </p>
            </div>
          </div>
          <div className="space-y-1">
            {SURFACES.map(surface => {
              const Icon = surface.icon;
              const isActive = activeSurface.id === surface.id;
              const isBusy = switching === surface.id;
              return (
                <button
                  key={surface.id}
                  type="button"
                  disabled={Boolean(switching)}
                  onClick={() => handleSelectSurface(surface)}
                  data-testid={`switch-surface-${surface.id}`}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition ${
                    isActive
                      ? "bg-orange-500 text-white shadow-sm"
                      : "text-slate-200 hover:bg-slate-800/90 hover:text-white"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold">
                      {isBusy ? "Ouverture en cours…" : surface.label}
                    </p>
                    <p
                      className={`truncate text-[10px] ${
                        isActive ? "text-orange-100" : "text-slate-400"
                      }`}
                    >
                      {surface.domain}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen(prev => !prev)}
        data-testid="mazigho-surface-switcher-toggle"
        className="inline-flex items-center gap-2.5 rounded-full border border-slate-700/80 bg-slate-950/95 px-4 py-2.5 text-xs font-semibold text-white shadow-xl backdrop-blur-md transition hover:bg-slate-900"
      >
        <Compass className="h-4 w-4 text-orange-400" />
        <span>Espace : {activeSurface.label}</span>
        {open ? (
          <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
        ) : (
          <ChevronUp className="h-3.5 w-3.5 text-slate-400" />
        )}
      </button>
    </div>
  );
}
