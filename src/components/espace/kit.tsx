import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Carte({
  children,
  className,
  onClick,
}: {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  const Comp = onClick ? "button" : "div";
  return (
    <Comp
      onClick={onClick}
      className={cn(
        "w-full rounded-2xl border border-border bg-card p-4 text-left shadow-sm",
        onClick && "transition-colors hover:bg-[var(--hover)]",
        className,
      )}
    >
      {children}
    </Comp>
  );
}

export function SectionTitre({ titre, action }: { titre: string; action?: ReactNode }) {
  return (
    <div className="mb-3 flex items-center justify-between gap-3">
      <h2 className="text-base font-bold tracking-tight">{titre}</h2>
      {action}
    </div>
  );
}

export type TonE = "brand" | "success" | "warning" | "critical" | "info" | "neutral";

const TONS: Record<TonE, string> = {
  brand: "bg-[var(--brand-soft)] text-[var(--brand)]",
  success: "bg-[var(--success)]/12 text-[var(--success)]",
  warning: "bg-[var(--warning)]/15 text-[var(--warning)]",
  critical: "bg-[var(--critical)]/12 text-[var(--critical)]",
  info: "bg-[var(--info)]/12 text-[var(--info)]",
  neutral: "bg-muted text-muted-foreground",
};

export function Puce({ children, ton = "neutral" }: { children: ReactNode; ton?: TonE }) {
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold", TONS[ton])}>
      {children}
    </span>
  );
}

export function tonStatutOuvrier(v: string): TonE {
  const s = v.toLowerCase();
  if (["validé", "réussi", "terminé", "présent", "présente", "traitée", "résolue", "acquise"].some((x) => s.includes(x)))
    return "success";
  if (["retard", "en attente", "à fournir", "en vérification", "envoyé", "en cours", "à remplacer", "besoin"].some((x) => s.includes(x)))
    return "warning";
  if (["absent", "refusé", "échoué", "non validé", "critique"].some((x) => s.includes(x))) return "critical";
  if (["à venir", "à passer", "reçue", "envoyée"].some((x) => s.includes(x))) return "info";
  return "neutral";
}

export function BoutonE({
  children,
  onClick,
  variante = "primaire",
  taille = "md",
  className,
  type = "button",
  disabled,
}: {
  children: ReactNode;
  onClick?: () => void;
  variante?: "primaire" | "secondaire" | "fantome" | "danger";
  taille?: "sm" | "md" | "lg";
  className?: string;
  type?: "button" | "submit";
  disabled?: boolean;
}) {
  const v = {
    primaire: "bg-[var(--brand)] text-[var(--brand-foreground)] hover:opacity-90",
    secondaire: "border border-border bg-card hover:bg-[var(--hover)]",
    fantome: "text-muted-foreground hover:bg-[var(--hover)]",
    danger: "bg-[var(--critical)] text-white hover:opacity-90",
  }[variante];
  const t = { sm: "h-9 px-3 text-xs", md: "h-11 px-4 text-sm", lg: "h-12 px-5 text-sm" }[taille];
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50",
        v,
        t,
        className,
      )}
    >
      {children}
    </button>
  );
}

export function BarreProgression({ valeur, ton = "brand" }: { valeur: number; ton?: TonE }) {
  const couleur =
    ton === "success" ? "var(--success)" : ton === "warning" ? "var(--warning)" : ton === "critical" ? "var(--critical)" : "var(--brand)";
  return (
    <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
      <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(100, Math.max(0, valeur))}%`, background: couleur }} />
    </div>
  );
}

export function KpiE({ label, valeur, sous, ton = "brand" }: { label: string; valeur: ReactNode; sous?: string; ton?: TonE }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-3.5">
      <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className={cn("mt-1 text-2xl font-black tracking-tight", ton === "critical" && "text-[var(--critical)]", ton === "warning" && "text-[var(--warning)]", ton === "success" && "text-[var(--success)]")}>
        {valeur}
      </p>
      {sous && <p className="mt-0.5 text-[11px] text-muted-foreground">{sous}</p>}
    </div>
  );
}

export function ChampE({ label, children, aide }: { label: string; children: ReactNode; aide?: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">{label}</span>
      {children}
      {aide && <span className="mt-1 block text-[11px] text-muted-foreground">{aide}</span>}
    </label>
  );
}

export const inputE =
  "w-full rounded-xl border border-border bg-background px-3.5 py-3 text-sm outline-none focus:border-[var(--brand)]";

export function FeuilleModale({
  titre,
  onClose,
  children,
  pied,
}: {
  titre: string;
  onClose: () => void;
  children: ReactNode;
  pied?: ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/50 sm:items-center" onClick={onClose}>
      <div
        className="max-h-[92vh] w-full overflow-y-auto rounded-t-3xl border border-border bg-card p-5 sm:max-w-lg sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-border sm:hidden" />
        <h3 className="mb-4 text-lg font-bold tracking-tight">{titre}</h3>
        {children}
        {pied && <div className="mt-5 flex gap-2">{pied}</div>}
      </div>
    </div>
  );
}

export function VideE({ texte }: { texte: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
      {texte}
    </div>
  );
}
