import { cn } from "@/lib/utils";
import { Tag } from "@/components/leoni/kit";
import {
  dureeTexte,
  formateurParId,
  salleParId,
  type SessionPlanning,
  type StatutSession,
} from "@/data/planning";

/* ------------------------------- Couleurs -------------------------------- */

export interface Palette {
  bord: string;
  fond: string;
  accent: string;
}

export function paletteSession(s: SessionPlanning, conflit = false): Palette {
  if (conflit)
    return {
      bord: "border-[color-mix(in_oklab,var(--critical)_45%,transparent)]",
      fond: "bg-[color-mix(in_oklab,var(--critical)_10%,transparent)]",
      accent: "bg-[var(--critical)]",
    };
  if (s.statut === "Annulée")
    return { bord: "border-border", fond: "bg-muted/60", accent: "bg-[var(--neutral)]" };
  if (s.statut === "Brouillon")
    return { bord: "border-dashed border-border", fond: "bg-muted/40", accent: "bg-[var(--neutral)]" };
  if (s.statut === "Terminée")
    return {
      bord: "border-[color-mix(in_oklab,var(--success)_35%,transparent)]",
      fond: "bg-[color-mix(in_oklab,var(--success)_9%,transparent)]",
      accent: "bg-[var(--success)]",
    };
  if (s.type === "Rattrapage" || s.statut === "Reportée")
    return {
      bord: "border-[color-mix(in_oklab,var(--warning)_38%,transparent)]",
      fond: "bg-[color-mix(in_oklab,var(--warning)_10%,transparent)]",
      accent: "bg-[var(--warning)]",
    };
  if (s.type === "Évaluation" || s.type === "QCM" || s.type === "Test")
    return {
      bord: "border-[color-mix(in_oklab,var(--info)_38%,transparent)]",
      fond: "bg-[color-mix(in_oklab,var(--info)_10%,transparent)]",
      accent: "bg-[var(--info)]",
    };
  return {
    bord: "border-[color-mix(in_oklab,var(--brand)_35%,transparent)]",
    fond: "bg-[var(--brand-soft)]",
    accent: "bg-[var(--brand)]",
  };
}

export function tonSessionStatut(
  s: StatutSession,
): "brand" | "success" | "warning" | "critical" | "info" | "neutral" {
  switch (s) {
    case "Confirmée":
      return "success";
    case "Terminée":
      return "success";
    case "En cours":
      return "brand";
    case "Planifiée":
      return "info";
    case "À confirmer":
      return "warning";
    case "Reportée":
      return "warning";
    case "Annulée":
      return "critical";
    default:
      return "neutral";
  }
}

/* --------------------------------- Icônes -------------------------------- */

export function Icone({ nom, className }: { nom: "horloge" | "user" | "salle" | "groupe"; className?: string }) {
  const commun = cn("size-3 shrink-0 opacity-70", className);
  if (nom === "horloge")
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={commun}>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </svg>
    );
  if (nom === "user")
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={commun}>
        <circle cx="12" cy="8" r="3.5" />
        <path d="M5 20c1.5-3.5 4-5 7-5s5.5 1.5 7 5" />
      </svg>
    );
  if (nom === "salle")
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={commun}>
        <path d="M4 20V6l8-3v17" />
        <path d="M12 20h8V9h-8" />
      </svg>
    );
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={commun}>
      <circle cx="9" cy="9" r="3" />
      <path d="M3 19c1-3 3-4.5 6-4.5S14 16 15 19" />
      <path d="M16 8.5a3 3 0 0 1 0 5M18 19c-.4-1.6-1-2.9-1.8-3.8" />
    </svg>
  );
}

/* ------------------------------ Carte session ---------------------------- */

export function SessionCarte({
  session,
  conflit,
  compacte,
  onClick,
  onDragStart,
  style,
  className,
}: {
  session: SessionPlanning;
  conflit?: boolean;
  compacte?: boolean;
  onClick?: () => void;
  onDragStart?: (e: React.DragEvent) => void;
  style?: React.CSSProperties;
  className?: string;
}) {
  const p = paletteSession(session, conflit);
  const salle = salleParId(session.salleId);
  const formateur = formateurParId(session.formateurId);
  const remplissage = Math.round((session.participants.length / session.capacite) * 100);

  return (
    <div className={cn("group/session relative", className)} style={style}>
      <article
        draggable={!!onDragStart}
        onDragStart={onDragStart}
        onClick={onClick}
        className={cn(
          "h-full cursor-pointer overflow-hidden rounded-sm border p-1.5 text-left transition-shadow hover:shadow-md",
          p.bord,
          p.fond,
          session.statut === "Annulée" && "opacity-60",
        )}
      >
        <span className={cn("absolute inset-y-0 left-0 w-[3px]", p.accent)} />
        <div className="pl-1.5">
          <div className="flex items-center justify-between gap-1">
            <p className="num flex items-center gap-1 text-[10px] text-muted-foreground">
              <Icone nom="horloge" />
              {session.debut} – {session.fin}
            </p>
            {session.type === "Rattrapage" && (
              <span className="rounded-sm bg-[color-mix(in_oklab,var(--warning)_18%,transparent)] px-1 text-[9px] font-semibold uppercase text-[var(--warning)]">
                Rattrapage
              </span>
            )}
          </div>
          <p className="mt-0.5 truncate text-[11px] font-semibold">{session.groupe}</p>
          <p className="truncate text-[11px] text-muted-foreground">{session.moduleNom}</p>
          {!compacte && (
            <>
              <p className="mt-1 flex items-center gap-1 truncate text-[10px] text-muted-foreground">
                <Icone nom="user" />
                {formateur?.nom}
              </p>
              <p className="flex items-center gap-1 truncate text-[10px] text-muted-foreground">
                <Icone nom="salle" />
                {salle?.nom}
              </p>
              <div className="mt-1 flex items-center gap-1.5">
                <div className="h-1 flex-1 overflow-hidden rounded-full bg-muted">
                  <div
                    className={cn("h-full", remplissage > 100 ? "bg-[var(--critical)]" : p.accent)}
                    style={{ width: `${Math.min(100, remplissage)}%` }}
                  />
                </div>
                <span className="num text-[9px] text-muted-foreground">
                  {session.participants.length}/{session.capacite}
                </span>
              </div>
            </>
          )}
        </div>
      </article>

      {/* Tooltip */}
      <div className="pointer-events-none absolute left-1/2 top-full z-40 mt-1 hidden w-60 -translate-x-1/2 rounded-md border border-border bg-card p-3 shadow-xl group-hover/session:block">
        <p className="text-xs font-semibold">{session.groupe}</p>
        <p className="text-[11px] text-muted-foreground">{session.moduleNom}</p>
        <p className="num mt-2 text-[11px]">
          {session.debut} → {session.fin} · {dureeTexte(session)}
        </p>
        <dl className="mt-2 space-y-0.5 text-[11px] text-muted-foreground">
          <div className="flex justify-between gap-2">
            <dt>Formateur</dt>
            <dd className="text-foreground">{formateur?.nom}</dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt>Salle</dt>
            <dd className="text-foreground">{salle?.nom}</dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt>Participants</dt>
            <dd className="num text-foreground">
              {session.participants.length} / {session.capacite}
            </dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt>Places restantes</dt>
            <dd className="num text-foreground">{Math.max(0, session.capacite - session.participants.length)}</dd>
          </div>
        </dl>
        <div className="mt-2 flex items-center gap-1.5">
          <Tag ton={tonSessionStatut(session.statut)}>{session.statut}</Tag>
          {conflit && <Tag ton="critical">Conflit</Tag>}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------ Empty state ------------------------------ */

export function AucuneSession({ filtres, onCreer }: { filtres: boolean; onCreer: () => void }) {
  return (
    <div className="rounded-md border border-dashed border-border px-4 py-10 text-center">
      <p className="text-sm text-muted-foreground">
        {filtres ? "Aucune session ne correspond aux filtres sélectionnés." : "Aucune session planifiée"}
      </p>
      <button
        onClick={onCreer}
        className="mt-3 rounded-sm border border-border px-3 py-1.5 text-xs font-medium hover:bg-[var(--hover)]"
      >
        + Ajouter une session
      </button>
    </div>
  );
}
