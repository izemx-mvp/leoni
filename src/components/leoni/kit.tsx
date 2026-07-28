import { cn } from "@/lib/utils";
import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";

/* --------------------------------- Panel -------------------------------- */

export function Panel({
  title,
  subtitle,
  action,
  children,
  className,
  bodyClassName,
}: {
  title?: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <section className={cn("rounded-md border border-border bg-card", className)}>
      {(title || action) && (
        <header className="flex items-center justify-between gap-4 border-b border-border px-4 py-3">
          <div>
            {title && <h2 className="text-sm font-semibold tracking-tight">{title}</h2>}
            {subtitle && <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>}
          </div>
          {action}
        </header>
      )}
      <div className={cn("p-4", bodyClassName)}>{children}</div>
    </section>
  );
}

/* --------------------------------- Badge -------------------------------- */

type Ton = "brand" | "success" | "warning" | "critical" | "info" | "neutral";

const TONS: Record<Ton, string> = {
  brand: "text-[var(--brand)] bg-[var(--brand-soft)] border-[color-mix(in_oklab,var(--brand)_35%,transparent)]",
  success: "text-[var(--success)] bg-[color-mix(in_oklab,var(--success)_12%,transparent)] border-[color-mix(in_oklab,var(--success)_30%,transparent)]",
  warning: "text-[var(--warning)] bg-[color-mix(in_oklab,var(--warning)_14%,transparent)] border-[color-mix(in_oklab,var(--warning)_32%,transparent)]",
  critical: "text-[var(--critical)] bg-[color-mix(in_oklab,var(--critical)_12%,transparent)] border-[color-mix(in_oklab,var(--critical)_32%,transparent)]",
  info: "text-[var(--info)] bg-[color-mix(in_oklab,var(--info)_12%,transparent)] border-[color-mix(in_oklab,var(--info)_30%,transparent)]",
  neutral: "text-muted-foreground bg-muted border-border",
};

export function Tag({ children, ton = "neutral", className }: { children: ReactNode; ton?: Ton; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 whitespace-nowrap rounded-sm border px-1.5 py-0.5 text-[11px] font-medium leading-4",
        TONS[ton],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function tonStatut(v: string): Ton {
  const s = v.toLowerCase();
  if (/confirmé|retenu|validé|réussi|acquise|maîtrisée|résolue|clôturée|favorable|lu|ouvert|distribué|présent/.test(s)) return "success";
  if (/risque|critique|échou|refus|arrêté|suspendu|absence|élevé|non validée|échec/.test(s)) return "critical";
  if (/attente|réserve|retard|moyen|prolong|à confirmer|à qualifier|escaladée|à planifier|à évaluer/.test(s)) return "warning";
  if (/formation|en cours|planifié|affectée|analyse|revue|présélection|intégrer|nouvelle/.test(s)) return "info";
  return "neutral";
}

export function StatutBadge({ valeur }: { valeur: string }) {
  return <Tag ton={tonStatut(valeur)}>{valeur}</Tag>;
}

export function RisqueBadge({ valeur }: { valeur: string }) {
  const ton: Ton = valeur === "Faible" ? "success" : valeur === "Moyen" ? "warning" : "critical";
  return (
    <Tag ton={ton}>
      <span className="size-1.5 rounded-full bg-current" />
      {valeur}
    </Tag>
  );
}

/* -------------------------------- Buttons ------------------------------- */

export function Btn({
  children,
  variant = "secondary",
  size = "md",
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md";
}) {
  return (
    <button
      {...props}
      className={cn(
        "inline-flex items-center justify-center gap-1.5 rounded-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] disabled:opacity-50",
        size === "sm" ? "h-7 px-2.5 text-xs" : "h-9 px-3.5 text-sm",
        variant === "primary" &&
          "bg-[var(--brand)] text-[var(--brand-foreground)] hover:brightness-110",
        variant === "secondary" && "border border-border bg-transparent hover:bg-[var(--hover)]",
        variant === "ghost" && "hover:bg-[var(--hover)]",
        variant === "danger" && "bg-[var(--critical)] text-white hover:brightness-110",
        className,
      )}
    >
      {children}
    </button>
  );
}

/* --------------------------------- KPI ---------------------------------- */

export function Kpi({
  label,
  valeur,
  delta,
  ton = "brand",
  suffixe,
}: {
  label: string;
  valeur: string | number;
  delta?: string;
  ton?: Ton;
  suffixe?: string;
}) {
  const bar: Record<Ton, string> = {
    brand: "bg-[var(--brand)]",
    success: "bg-[var(--success)]",
    warning: "bg-[var(--warning)]",
    critical: "bg-[var(--critical)]",
    info: "bg-[var(--info)]",
    neutral: "bg-[var(--neutral)]",
  };
  return (
    <div className="relative overflow-hidden rounded-md border border-border bg-card p-3.5">
      <span className={cn("absolute inset-y-0 left-0 w-[3px]", bar[ton])} />
      <p className="label-xs">{label}</p>
      <div className="mt-2 flex items-baseline gap-1.5">
        <span className="num text-2xl font-semibold tracking-tight">{valeur}</span>
        {suffixe && <span className="text-xs text-muted-foreground">{suffixe}</span>}
      </div>
      {delta && <p className="mt-1 text-[11px] font-medium text-[var(--success)]">{delta}</p>}
    </div>
  );
}

/* ------------------------------- Progress -------------------------------- */

export function Barre({ valeur, ton = "brand" }: { valeur: number; ton?: Ton }) {
  const colors: Record<Ton, string> = {
    brand: "bg-[var(--brand)]",
    success: "bg-[var(--success)]",
    warning: "bg-[var(--warning)]",
    critical: "bg-[var(--critical)]",
    info: "bg-[var(--info)]",
    neutral: "bg-[var(--neutral)]",
  };
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
      <div className={cn("h-full rounded-full transition-all", colors[ton])} style={{ width: `${Math.min(100, valeur)}%` }} />
    </div>
  );
}

export function ProgressionCell({ valeur }: { valeur: number }) {
  return (
    <div className="flex min-w-28 items-center gap-2">
      <Barre valeur={valeur} ton={valeur >= 75 ? "success" : valeur >= 50 ? "brand" : "warning"} />
      <span className="num w-9 text-right text-xs text-muted-foreground">{valeur} %</span>
    </div>
  );
}

/* --------------------------------- Table -------------------------------- */

export function Table({ children }: { children: ReactNode }) {
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full border-collapse text-sm">{children}</table>
    </div>
  );
}

export function Th({ children, className }: { children?: ReactNode; className?: string }) {
  return (
    <th
      className={cn(
        "sticky top-0 z-10 whitespace-nowrap border-b border-border bg-card px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground",
        className,
      )}
    >
      {children}
    </th>
  );
}

export function Td({ children, className }: { children?: ReactNode; className?: string }) {
  return <td className={cn("border-b border-border px-3 py-2.5 align-middle", className)}>{children}</td>;
}

export function Tr({
  children,
  onClick,
  onDoubleClick,
  title,
  className,
}: {
  children: ReactNode;
  onClick?: () => void;
  onDoubleClick?: () => void;
  title?: string;
  className?: string;
}) {
  return (
    <tr
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      title={title}
      className={cn("transition-colors hover:bg-[var(--hover)]", (onClick || onDoubleClick) && "cursor-pointer", className)}
    >
      {children}
    </tr>
  );
}

/* ------------------------------ Page header ------------------------------ */

export function PageHeader({
  titre,
  sousTitre,
  fil,
  actions,
}: {
  titre: string;
  sousTitre?: string;
  fil: { label: string; to?: string }[];
  actions?: ReactNode;
}) {
  return (
    <div className="mb-5">
      <nav className="mb-2 flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground">
        {fil.map((f, i) => (
          <span key={f.label} className="flex items-center gap-1.5">
            {i > 0 && <span className="opacity-50">/</span>}
            {f.to ? (
              <Link to={f.to} className="hover:text-[var(--brand)]">
                {f.label}
              </Link>
            ) : (
              <span className="text-foreground">{f.label}</span>
            )}
          </span>
        ))}
      </nav>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">{titre}</h1>
          {sousTitre && <p className="mt-1 text-sm text-muted-foreground">{sousTitre}</p>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}

/* ------------------------------- Field ---------------------------------- */

export function Field({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="min-w-0">
      <p className="label-xs">{label}</p>
      <p className="mt-1 truncate text-sm">{value}</p>
    </div>
  );
}

export function Select({
  value,
  onChange,
  options,
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  className?: string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={cn(
        "h-9 rounded-sm border border-border bg-card px-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]",
        className,
      )}
    >
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
}

export function Avatar({ nom, size = 32 }: { nom: string; size?: number }) {
  const initiales = nom
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("");
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-sm bg-[var(--brand-soft)] font-semibold text-[var(--brand)]"
      style={{ width: size, height: size, fontSize: size / 2.8 }}
    >
      {initiales}
    </span>
  );
}

export function IAWarning({ texte }: { texte: string }) {
  return (
    <p className="mt-3 rounded-sm border border-dashed border-[color-mix(in_oklab,var(--brand)_40%,transparent)] bg-[var(--brand-soft)] px-3 py-2 text-[11px] text-foreground/80">
      {texte}
    </p>
  );
}
