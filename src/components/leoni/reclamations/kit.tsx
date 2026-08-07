import type { ReactNode } from "react";
import { LIBELLE_SLA, LIBELLE_STATUT, initiales, type PrioriteRec, type SlaStatut, type StatutRec } from "@/data/reclamations-v2";

/* ---------------------------------- Surfaces --------------------------------- */

export function Carte({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-xl border border-border bg-card ${className}`}>{children}</div>;
}

export function Bloc({
  titre,
  action,
  children,
  className = "",
}: {
  titre?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Carte className={className}>
      {titre && (
        <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-2.5">
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">{titre}</h3>
          {action}
        </div>
      )}
      <div className="p-4">{children}</div>
    </Carte>
  );
}

/* ----------------------------------- Badges ---------------------------------- */

export function BadgeStatut({ statut, compact = false }: { statut: StatutRec; compact?: boolean }) {
  const styles: Record<StatutRec, string> = {
    new: "bg-[var(--brand)]/10 text-[var(--brand)] ring-[var(--brand)]/25",
    in_progress: "bg-[var(--warning)]/10 text-[var(--warning)] ring-[var(--warning)]/25",
    resolved: "bg-[var(--success)]/10 text-[var(--success)] ring-[var(--success)]/25",
  };
  const libelle = compact && statut === "in_progress" ? "En cours" : LIBELLE_STATUT[statut];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.06em] ring-1 ring-inset ${styles[statut]}`}>
      <span className="size-1.5 rounded-full bg-current" />
      {libelle}
    </span>
  );
}

export function PrioriteIndic({ priorite }: { priorite: PrioriteRec }) {
  const couleur = priorite === "Critique" ? "var(--critical)" : priorite === "Élevée" ? "var(--warning)" : "var(--muted-foreground)";
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
      <span className="size-1.5 rounded-full" style={{ background: couleur }} />
      {priorite}
    </span>
  );
}

export function BadgeSla({ statut }: { statut: SlaStatut }) {
  const styles: Record<SlaStatut, string> = {
    ok: "text-[var(--success)] ring-[var(--success)]/25",
    risque: "text-[var(--warning)] ring-[var(--warning)]/30",
    depasse: "text-[var(--critical)] ring-[var(--critical)]/30",
  };
  return (
    <span className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-medium ring-1 ring-inset ${styles[statut]}`}>
      SLA · {LIBELLE_SLA[statut]}
    </span>
  );
}

export function Chip({ children, onRemove }: { children: ReactNode; onRemove?: () => void }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-[var(--hover)] px-2.5 py-1 text-[11px] text-foreground">
      {children}
      {onRemove && (
        <button onClick={onRemove} className="text-muted-foreground transition-colors hover:text-foreground" aria-label="Retirer le filtre">
          ×
        </button>
      )}
    </span>
  );
}

/* ---------------------------------- Avatar ----------------------------------- */

export function AvatarRec({ nom, taille = 30 }: { nom: string; taille?: number }) {
  return (
    <span
      className="inline-grid shrink-0 place-items-center rounded-full bg-[var(--brand)]/10 font-semibold text-[var(--brand)]"
      style={{ width: taille, height: taille, fontSize: taille * 0.36 }}
    >
      {initiales(nom)}
    </span>
  );
}

/* ---------------------------------- Boutons ---------------------------------- */

export function BoutonR({
  children,
  onClick,
  variante = "secondaire",
  taille = "md",
  className = "",
  disabled,
  type = "button",
}: {
  children: ReactNode;
  onClick?: () => void;
  variante?: "primaire" | "secondaire" | "fantome" | "danger";
  taille?: "sm" | "md";
  className?: string;
  disabled?: boolean;
  type?: "button" | "submit";
}) {
  const base =
    "inline-flex items-center justify-center gap-1.5 rounded-lg font-medium transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-50";
  const tailles = { sm: "h-7 px-2.5 text-[11px]", md: "h-9 px-3.5 text-xs" };
  const variantes = {
    primaire: "bg-[var(--brand)] text-white hover:brightness-110 active:scale-[0.98]",
    secondaire: "border border-border bg-card text-foreground hover:bg-[var(--hover)]",
    fantome: "text-muted-foreground hover:bg-[var(--hover)] hover:text-foreground",
    danger: "border border-[var(--critical)]/30 text-[var(--critical)] hover:bg-[var(--critical)]/10",
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`${base} ${tailles[taille]} ${variantes[variante]} ${className}`}>
      {children}
    </button>
  );
}

/* ------------------------------------ KPI ------------------------------------ */

export function KpiRec({
  label,
  valeur,
  sous,
  ton = "neutral",
}: {
  label: string;
  valeur: string;
  sous?: string;
  ton?: "neutral" | "brand" | "warning" | "critical" | "success";
}) {
  const couleurs: Record<string, string> = {
    neutral: "text-foreground",
    brand: "text-[var(--brand)]",
    warning: "text-[var(--warning)]",
    critical: "text-[var(--critical)]",
    success: "text-[var(--success)]",
  };
  return (
    <Carte className="px-4 py-3.5 transition-colors hover:border-[var(--brand)]/40">
      <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-muted-foreground">{label}</p>
      <p className={`num mt-1.5 text-2xl font-semibold tabular-nums tracking-tight ${couleurs[ton]}`}>{valeur}</p>
      {sous && <p className="mt-0.5 text-[11px] text-muted-foreground">{sous}</p>}
    </Carte>
  );
}

/* ---------------------------------- Étoiles ---------------------------------- */

export function Etoiles({ note, taille = 13, onChange }: { note: number; taille?: number; onChange?: (n: number) => void }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          disabled={!onChange}
          onClick={() => onChange?.(i)}
          className={onChange ? "transition-transform hover:scale-110" : "cursor-default"}
          aria-label={`${i} étoile${i > 1 ? "s" : ""}`}
          style={{ fontSize: taille, lineHeight: 1, color: i <= note ? "var(--warning)" : "var(--border)" }}
        >
          ★
        </button>
      ))}
    </span>
  );
}

/* ----------------------------------- Divers ---------------------------------- */

export function Ligne({ label, valeur }: { label: string; valeur: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3 py-1.5">
      <span className="shrink-0 text-[11px] text-muted-foreground">{label}</span>
      <span className="min-w-0 text-right text-[11px] font-medium text-foreground">{valeur}</span>
    </div>
  );
}

export function VideR({ texte }: { texte: string }) {
  return <p className="py-10 text-center text-xs text-muted-foreground">{texte}</p>;
}

export function BarreValeur({ valeur, max, couleur = "var(--brand)" }: { valeur: number; max: number; couleur?: string }) {
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--hover)]">
      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(100, (valeur / max) * 100)}%`, background: couleur }} />
    </div>
  );
}

export function Squelette({ lignes = 3 }: { lignes?: number }) {
  return (
    <div className="space-y-2 p-4">
      {Array.from({ length: lignes }).map((_, i) => (
        <div key={i} className="h-12 animate-pulse rounded-lg bg-[var(--hover)]" />
      ))}
    </div>
  );
}
