import { Link, useRouterState } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import {
  Bell,
  Bot,
  CalendarCheck,
  ClipboardCheck,
  FileText,
  GraduationCap,
  Home,
  LayoutGrid,
  LogOut,
  MessageSquareWarning,
  Send,
  User,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useEspace } from "@/lib/espace-store";
import { AUJOURDHUI_LIBELLE } from "@/data/espace-ouvrier";

const MENU = [
  { to: "/espace", label: "Accueil", icone: Home, exact: true },
  { to: "/espace/formation", label: "Ma formation", icone: GraduationCap },
  { to: "/espace/evaluations", label: "Mes évaluations", icone: ClipboardCheck },
  { to: "/espace/presence", label: "Ma présence", icone: CalendarCheck },
  { to: "/espace/documents", label: "Mes documents", icone: FileText },
  { to: "/espace/demandes", label: "Mes demandes", icone: Send },
  { to: "/espace/reclamations", label: "Réclamations", icone: MessageSquareWarning },
  { to: "/espace/assistant", label: "Assistant", icone: Bot },
  { to: "/espace/profil", label: "Mon profil", icone: User },
];

const BOTTOM = [
  { to: "/espace", label: "Accueil", icone: Home, exact: true },
  { to: "/espace/formation", label: "Formation", icone: GraduationCap },
  { to: "/espace/evaluations", label: "Évaluations", icone: ClipboardCheck },
  { to: "/espace/demandes", label: "Demandes", icone: Send },
];

const PLUS = MENU.filter((m) => !BOTTOM.some((b) => b.to === m.to));

export function EspaceShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { ouvrier, nonLues, modeDemo, deconnexion } = useEspace();
  const [plus, setPlus] = useState(false);

  const actif = (to: string, exact?: boolean) => (exact ? pathname === to : pathname.startsWith(to));
  const prenom = (ouvrier?.nom ?? "").split(" ")[0];

  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Sidebar simple — desktop */}
      <aside className="hidden w-60 shrink-0 flex-col border-r border-border bg-[var(--sidebar)] lg:flex">
        <div className="flex h-16 items-center gap-2.5 border-b border-border px-4">
          <span className="flex size-9 items-center justify-center rounded-xl bg-[var(--brand)] text-[13px] font-black text-[var(--brand-foreground)]">
            LNI
          </span>
          <div className="leading-tight">
            <p className="text-sm font-bold tracking-tight">Espace Ouvrier</p>
            <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">LEONI Maroc</p>
          </div>
        </div>
        <nav className="flex-1 space-y-1 p-3">
          {MENU.map((m) => (
            <Link
              key={m.to}
              to={m.to}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                actif(m.to, m.exact)
                  ? "bg-[var(--selected)] text-[var(--brand)]"
                  : "text-foreground/75 hover:bg-[var(--hover)]",
              )}
            >
              <m.icone className="size-4.5 shrink-0" />
              <span className="truncate">{m.label}</span>
            </Link>
          ))}
        </nav>
        <div className="border-t border-border p-3">
          <button
            onClick={deconnexion}
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-muted-foreground hover:bg-[var(--hover)]"
          >
            <LogOut className="size-4" /> Déconnexion
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {modeDemo && (
          <div className="flex items-center justify-between gap-3 bg-[var(--brand)] px-4 py-2 text-[11px] font-semibold text-[var(--brand-foreground)]">
            <span className="truncate">MODE DÉMO — vue « {ouvrier?.nom} »</span>
            <a href="/portail" className="shrink-0 rounded-full bg-black/20 px-3 py-1">
              Retour au portail
            </a>
          </div>
        )}

        <header className="sticky top-0 z-40 flex h-16 items-center gap-3 border-b border-border bg-[var(--surface)] px-4">
          <div className="min-w-0 flex-1">
            <p className="truncate text-base font-bold tracking-tight">Bonjour {prenom}</p>
            <p className="truncate text-[11px] text-muted-foreground">{AUJOURDHUI_LIBELLE}</p>
          </div>
          <a
            href="/portail"
            className="flex h-11 items-center gap-1.5 rounded-xl border border-border px-3 text-xs font-semibold text-muted-foreground hover:bg-[var(--hover)]"
          >
            <LayoutGrid className="size-4" />
            <span className="hidden sm:block">Portail</span>
          </a>
          <Link
            to="/espace/notifications"
            className="relative flex size-11 items-center justify-center rounded-xl border border-border hover:bg-[var(--hover)]"
            aria-label="Notifications"
          >
            <Bell className="size-5" />
            {nonLues > 0 && (
              <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-[var(--critical)] text-[10px] font-bold text-white">
                {nonLues}
              </span>
            )}
          </Link>
        </header>

        <main className="flex-1 px-4 pb-28 pt-4 lg:px-8 lg:pb-10">
          <div className="mx-auto w-full max-w-3xl space-y-6">{children}</div>
        </main>

        {/* Bottom navigation — mobile & tablette */}
        <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-border bg-[var(--surface)] pb-[env(safe-area-inset-bottom)] lg:hidden">
          {BOTTOM.map((m) => (
            <Link
              key={m.to}
              to={m.to}
              className={cn(
                "flex flex-col items-center gap-1 py-2.5 text-[10px] font-medium",
                actif(m.to, m.exact) ? "text-[var(--brand)]" : "text-muted-foreground",
              )}
            >
              <m.icone className="size-5" />
              {m.label}
            </Link>
          ))}
          <button
            onClick={() => setPlus(true)}
            className="flex flex-col items-center gap-1 py-2.5 text-[10px] font-medium text-muted-foreground"
          >
            <LayoutGrid className="size-5" />
            Plus
          </button>
        </nav>

        {plus && (
          <div className="fixed inset-0 z-50 flex items-end bg-black/50 lg:hidden" onClick={() => setPlus(false)}>
            <div className="w-full rounded-t-3xl border border-border bg-card p-5" onClick={(e) => e.stopPropagation()}>
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-base font-bold">Plus</h3>
                <button onClick={() => setPlus(false)} aria-label="Fermer">
                  <X className="size-5 text-muted-foreground" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {PLUS.map((m) => (
                  <Link
                    key={m.to}
                    to={m.to}
                    onClick={() => setPlus(false)}
                    className="flex flex-col gap-2 rounded-2xl border border-border p-4 text-sm font-semibold"
                  >
                    <m.icone className="size-5 text-[var(--brand)]" />
                    {m.label}
                  </Link>
                ))}
              </div>
              <button
                onClick={deconnexion}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-border py-3 text-sm text-muted-foreground"
              >
                <LogOut className="size-4" /> Déconnexion
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
