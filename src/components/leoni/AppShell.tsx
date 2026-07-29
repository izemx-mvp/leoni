import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  Activity,
  AlertTriangle,
  Bell,
  Building2,
  Check,
  ChevronDown,
  ClipboardList,
  Cog,
  FileBarChart,
  GraduationCap,
  LayoutGrid,
  Lightbulb,
  MessageSquare,
  Monitor,
  Moon,
  Search,
  Sun,
  UserRound,
  Users,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLeoni } from "@/lib/leoni-store";
import { SITES, UTILISATEUR } from "@/data/leoni";
import { Avatar, Btn, Tag } from "./kit";

interface NavItem {
  label: string;
  to: string;
  search?: Record<string, string>;
}

const NAV: { code: string; titre: string; icone: typeof LayoutGrid; items: NavItem[] }[] = [
  {
    code: "01",
    titre: "Pilotage",
    icone: LayoutGrid,
    items: [
      { label: "Dashboard global", to: "/" },
      { label: "Rapports & analyses", to: "/reporting" },
      { label: "Population ouvrière", to: "/ouvriers", search: { statut: "Tous" } },
      { label: "Alertes & risques", to: "/pilotage/alertes" },
    ],
  },
  {
    code: "02",
    titre: "Recrutement",
    icone: ClipboardList,
    items: [
      { label: "Candidatures", to: "/recrutement/candidatures", search: { vue: "Toutes" } },
      { label: "Présélection IA", to: "/recrutement/candidatures", search: { vue: "Présélection IA" } },
      { label: "Entretiens", to: "/recrutement/entretiens" },
      { label: "Décisions RH", to: "/recrutement/candidatures", search: { vue: "Décisions RH" } },
      { label: "Vivier", to: "/recrutement/candidatures", search: { vue: "Vivier" } },
      { label: "Campagnes", to: "/recrutement/campagnes" },
      { label: "Besoins / postes", to: "/recrutement/campagnes" },
    ],
  },
  {
    code: "03",
    titre: "Ouvriers",
    icone: Users,
    items: [
      { label: "Tous les ouvriers", to: "/ouvriers", search: { statut: "Tous" } },
    ],
  },
  {
    code: "04",
    titre: "Formation",
    icone: GraduationCap,
    items: [
      { label: "Parcours", to: "/formation/parcours" },
      { label: "Sessions", to: "/formation/sessions" },
      { label: "Groupes", to: "/formation/sessions" },
      { label: "Planning", to: "/formation/planning" },
      { label: "Suivi quotidien", to: "/formation/sessions" },
      { label: "QCM & tests", to: "/formation/qcm" },
      { label: "Rattrapages", to: "/formation/qcm" },
    ],
  },
  {
    code: "05",
    titre: "Présences",
    icone: Activity,
    items: [
      { label: "Présences", to: "/presences", search: { vue: "Présences" } },
      { label: "Absences", to: "/presences", search: { vue: "Absences" } },
      { label: "Retards", to: "/presences", search: { vue: "Retards" } },
      { label: "Calendrier", to: "/presences", search: { vue: "Calendrier" } },
    ],
  },
  {
    code: "06",
    titre: "Suivi & qualité",
    icone: AlertTriangle,
    items: [
      { label: "Observations", to: "/suivi/observations" },
      { label: "Feedbacks", to: "/suivi/observations" },
      { label: "Alertes", to: "/pilotage/alertes" },
      { label: "Réclamations", to: "/suivi/reclamations" },
    ],
  },
  {
    code: "07",
    titre: "Communication",
    icone: MessageSquare,
    items: [
      { label: "WhatsApp & Emails", to: "/communication" },
      { label: "Templates", to: "/communication" },
      { label: "Historique", to: "/communication" },
    ],
  },
  {
    code: "08",
    titre: "Reporting",
    icone: FileBarChart,
    items: [{ label: "Rapports & analyses", to: "/reporting" }],
  },
  {
    code: "09",
    titre: "Administration",
    icone: Cog,
    items: [
      { label: "Utilisateurs & rôles", to: "/administration", search: { vue: "Utilisateurs" } },
      { label: "Sites & ateliers", to: "/administration", search: { vue: "Sites" } },
      { label: "Postes & compétences", to: "/administration", search: { vue: "Postes" } },
      { label: "Paramètres IA", to: "/administration", search: { vue: "IA" } },
      { label: "Automatisations", to: "/administration", search: { vue: "Automatisations" } },
      { label: "Audit", to: "/administration", search: { vue: "Audit" } },
    ],
  },
];

function Sidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const search = useRouterState({ select: (s) => s.location.search as Record<string, string> });
  const [ouverts, setOuverts] = useState<string[]>(["01", "02", "03"]);

  useEffect(() => {
    const groupe = NAV.find((g) => g.items.some((i) => pathname.startsWith(i.to) && i.to !== "/"));
    if (groupe) setOuverts((prev) => (prev.includes(groupe.code) ? prev : [...prev, groupe.code]));
  }, [pathname]);

  const actif = (i: NavItem) => {
    if (i.to === "/") return pathname === "/";
    if (pathname !== i.to) return false;
    if (!i.search) return true;
    return Object.entries(i.search).every(([k, v]) => (search[k] ?? "") === v);
  };

  return (
    <aside className="hidden w-[264px] shrink-0 flex-col border-r border-border bg-[var(--sidebar)] lg:flex">
      <div className="flex h-14 items-center gap-2.5 border-b border-border px-4">
        <span className="flex size-8 items-center justify-center rounded-sm bg-[var(--brand)] text-[13px] font-black tracking-tighter text-[var(--brand-foreground)]">
          LNI
        </span>
        <div className="leading-tight">
          <p className="text-[13px] font-semibold tracking-tight">LEONI</p>
          <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            Workforce Journey
          </p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-3">
        {NAV.map((groupe) => {
          const open = ouverts.includes(groupe.code);
          const Icone = groupe.icone;
          return (
            <div key={groupe.code} className="mb-0.5">
              <button
                onClick={() =>
                  setOuverts((p) =>
                    p.includes(groupe.code) ? p.filter((c) => c !== groupe.code) : [...p, groupe.code],
                  )
                }
                className="flex w-full items-center gap-2 rounded-sm px-2 py-2 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground transition-colors hover:bg-[var(--hover)] hover:text-foreground"
              >
                <Icone className="size-3.5" />
                <span className="num text-[10px] opacity-60">{groupe.code}</span>
                <span className="flex-1 truncate">{groupe.titre}</span>
                <ChevronDown className={cn("size-3.5 transition-transform", !open && "-rotate-90")} />
              </button>
              {open && (
                <ul className="mb-1 ml-[15px] border-l border-border pl-2">
                  {groupe.items.map((item) => (
                    <li key={groupe.code + item.label}>
                      <Link
                        to={item.to}
                        search={item.search as never}
                        className={cn(
                          "-ml-[9px] flex items-center gap-2 rounded-sm py-1.5 pl-2.5 pr-2 text-[13px] transition-colors",
                          actif(item)
                            ? "bg-[var(--selected)] font-medium text-[var(--brand)]"
                            : "text-foreground/75 hover:bg-[var(--hover)] hover:text-foreground",
                        )}
                      >
                        <span
                          className={cn(
                            "size-1 shrink-0 rounded-full",
                            actif(item) ? "bg-[var(--brand)]" : "bg-transparent",
                          )}
                        />
                        <span className="truncate">{item.label}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </nav>

      <div className="border-t border-border p-3">
        <div className="rounded-sm border border-border bg-[var(--brand-soft)] p-3">
          <p className="flex items-center gap-1.5 text-[11px] font-semibold text-[var(--brand)]">
            <Lightbulb className="size-3.5" /> Moteurs IA actifs
          </p>
          <p className="mt-1 text-[11px] text-muted-foreground">
            Talent Fit AI · Worker Readiness AI — l'IA recommande, l'humain décide.
          </p>
        </div>
      </div>
    </aside>
  );
}

/* ------------------------------ Recherche -------------------------------- */

function RechercheGlobale({ onClose }: { onClose: () => void }) {
  const { candidats, ouvriers, reclamations } = useLeoni();
  const [q, setQ] = useState("");
  const resultats = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return [];
    const r: { type: string; titre: string; detail: string; to: string; params?: Record<string, string> }[] = [];
    ouvriers
      .filter((o) => `${o.nom} ${o.id} ${o.poste} ${o.identite.cin} ${o.groupe}`.toLowerCase().includes(t))
      .forEach((o) => r.push({ type: "Ouvrier", titre: o.nom, detail: `${o.id} · ${o.poste} · ${o.site}`, to: "/ouvriers/$id", params: { id: o.id } }));
    candidats
      .filter((c) => `${c.nom} ${c.id} ${c.poste}`.toLowerCase().includes(t))
      .forEach((c) => r.push({ type: "Candidature", titre: c.nom, detail: `${c.id} · ${c.poste} · ${c.site}`, to: "/recrutement/candidat/$id", params: { id: c.id } }));
    reclamations
      .filter((x) => `${x.id} ${x.objet} ${x.ouvrier}`.toLowerCase().includes(t))
      .forEach((x) => r.push({ type: "Réclamation", titre: x.objet, detail: `${x.id} · ${x.ouvrier}`, to: "/suivi/reclamations" }));
    return r.slice(0, 12);
  }, [q, candidats, ouvriers, reclamations]);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 p-4 pt-24" onClick={onClose}>
      <div
        className="w-full max-w-2xl overflow-hidden rounded-md border border-border bg-card shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 border-b border-border px-4">
          <Search className="size-4 text-muted-foreground" />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Rechercher un candidat, un ouvrier, un matricule, une CIN, une réclamation…"
            className="h-12 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="size-4" />
          </button>
        </div>
        <div className="max-h-96 overflow-y-auto p-2">
          {!q && (
            <p className="px-3 py-6 text-center text-xs text-muted-foreground">
              Exemple : « Sara », « LMA-BOU », « REC-2026 »
            </p>
          )}
          {q && resultats.length === 0 && (
            <p className="px-3 py-6 text-center text-xs text-muted-foreground">Aucun résultat.</p>
          )}
          {resultats.map((r, i) => (
            <Link
              key={i}
              to={r.to}
              params={r.params as never}
              onClick={onClose}
              className="flex items-center gap-3 rounded-sm px-3 py-2 hover:bg-[var(--hover)]"
            >
              <Tag ton={r.type === "Ouvrier" ? "brand" : r.type === "Candidature" ? "info" : "warning"}>
                {r.type}
              </Tag>
              <span className="flex-1 truncate text-sm">{r.titre}</span>
              <span className="truncate text-xs text-muted-foreground">{r.detail}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

/* -------------------------------- Header --------------------------------- */

function Header() {
  const { theme, setTheme, site, setSite, langue, setLangue, notifications, marquerLues } = useLeoni();
  const [recherche, setRecherche] = useState(false);
  const [panneau, setPanneau] = useState<"notifs" | "user" | "site" | null>(null);
  const nonLues = notifications.filter((n) => !n.lu).length;

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setRecherche(true);
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b border-border bg-[var(--surface)] px-4">
      <button
        onClick={() => setRecherche(true)}
        className="flex h-9 flex-1 max-w-md items-center gap-2 rounded-sm border border-border px-3 text-sm text-muted-foreground transition-colors hover:bg-[var(--hover)]"
      >
        <Search className="size-4" />
        <span className="truncate">Recherche globale…</span>
        <kbd className="ml-auto hidden rounded-sm border border-border px-1.5 py-0.5 text-[10px] sm:block">
          ⌘K
        </kbd>
      </button>

      <div className="ml-auto flex items-center gap-1.5">
        <div className="relative">
          <button
            onClick={() => setPanneau(panneau === "site" ? null : "site")}
            className="flex h-9 items-center gap-2 rounded-sm border border-border px-2.5 text-xs font-medium hover:bg-[var(--hover)]"
          >
            <Building2 className="size-3.5 text-[var(--brand)]" />
            <span className="hidden max-w-32 truncate sm:block">{site}</span>
            <ChevronDown className="size-3" />
          </button>
          {panneau === "site" && (
            <div className="absolute right-0 top-11 z-50 w-60 rounded-md border border-border bg-popover p-1 shadow-xl">
              {["Tous les sites", ...SITES].map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setSite(s);
                    setPanneau(null);
                  }}
                  className="flex w-full items-center justify-between rounded-sm px-2.5 py-2 text-left text-sm hover:bg-[var(--hover)]"
                >
                  {s}
                  {site === s && <Check className="size-3.5 text-[var(--brand)]" />}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="hidden items-center rounded-sm border border-border p-0.5 md:flex">
          {(
            [
              ["light", Sun, "Clair"],
              ["dark", Moon, "Sombre"],
              ["system", Monitor, "Système"],
            ] as const
          ).map(([k, I, label]) => (
            <button
              key={k}
              title={label}
              onClick={() => setTheme(k)}
              className={cn(
                "flex size-7 items-center justify-center rounded-sm transition-colors",
                theme === k ? "bg-[var(--selected)] text-[var(--brand)]" : "text-muted-foreground hover:bg-[var(--hover)]",
              )}
            >
              <I className="size-3.5" />
            </button>
          ))}
        </div>

        <select
          value={langue}
          onChange={(e) => setLangue(e.target.value)}
          className="hidden h-9 rounded-sm border border-border bg-transparent px-2 text-xs md:block"
        >
          <option>FR</option>
          <option>AR</option>
          <option>EN</option>
        </select>

        <div className="relative">
          <button
            onClick={() => setPanneau(panneau === "notifs" ? null : "notifs")}
            className="relative flex size-9 items-center justify-center rounded-sm border border-border hover:bg-[var(--hover)]"
          >
            <Bell className="size-4" />
            {nonLues > 0 && (
              <span className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-[var(--critical)] text-[9px] font-bold text-white">
                {nonLues}
              </span>
            )}
          </button>
          {panneau === "notifs" && (
            <div className="absolute right-0 top-11 z-50 w-96 rounded-md border border-border bg-popover shadow-xl">
              <div className="flex items-center justify-between border-b border-border px-3 py-2">
                <span className="text-sm font-semibold">Notifications</span>
                <Btn size="sm" variant="ghost" onClick={marquerLues}>
                  Tout marquer comme lu
                </Btn>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={cn(
                      "border-b border-border px-3 py-2.5 last:border-0",
                      !n.lu && "bg-[var(--selected)]/40",
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <Tag
                        ton={n.ton === "critical" ? "critical" : n.ton === "warning" ? "warning" : n.ton === "success" ? "success" : "info"}
                      >
                        {n.titre}
                      </Tag>
                      <span className="ml-auto text-[10px] text-muted-foreground">{n.date}</span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{n.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="relative">
          <button
            onClick={() => setPanneau(panneau === "user" ? null : "user")}
            className="flex h-9 items-center gap-2 rounded-sm border border-border px-1.5 hover:bg-[var(--hover)]"
          >
            <Avatar nom={UTILISATEUR.nom} size={24} />
            <span className="hidden text-xs font-medium lg:block">{UTILISATEUR.nom}</span>
            <ChevronDown className="size-3" />
          </button>
          {panneau === "user" && (
            <div className="absolute right-0 top-11 z-50 w-64 rounded-md border border-border bg-popover p-3 shadow-xl">
              <div className="flex items-center gap-2.5">
                <Avatar nom={UTILISATEUR.nom} size={36} />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{UTILISATEUR.nom}</p>
                  <p className="truncate text-xs text-muted-foreground">{UTILISATEUR.role}</p>
                </div>
              </div>
              <div className="mt-3 space-y-1 border-t border-border pt-3 text-xs text-muted-foreground">
                <p>Périmètre : {UTILISATEUR.perimetre}</p>
                <p>MFA : activé · SSO : LEONI ID</p>
                <p>Dernière connexion : 28/07/2026 07:42</p>
              </div>
              <div className="mt-3 flex gap-2">
                <Btn size="sm" variant="secondary" className="flex-1">
                  <UserRound className="size-3.5" /> Profil
                </Btn>
                <Btn size="sm" variant="ghost" className="flex-1">
                  Déconnexion
                </Btn>
              </div>
            </div>
          )}
        </div>
      </div>

      {recherche && <RechercheGlobale onClose={() => setRecherche(false)} />}
      {panneau && <div className="fixed inset-0 z-40" onClick={() => setPanneau(null)} />}
    </header>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen w-full bg-background">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header />
        <main className="flex-1 px-4 py-5 lg:px-6">{children}</main>
      </div>
    </div>
  );
}
