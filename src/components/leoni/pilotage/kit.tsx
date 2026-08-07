import { cn } from "@/lib/utils";
import type { ReactNode } from "react";
import { Tag, type Ton } from "@/components/leoni/kit";
import type { Etat } from "@/data/pilotage";
import { tonEtat } from "@/data/pilotage";

const COULEUR: Record<Ton, string> = {
  brand: "var(--brand)",
  success: "var(--success)",
  warning: "var(--warning)",
  critical: "var(--critical)",
  info: "var(--info)",
  neutral: "var(--neutral)",
};

/* ------------------------------- Sparkline ------------------------------- */

export function Sparkline({ valeurs, ton = "brand", largeur = 96, hauteur = 26 }: { valeurs: number[]; ton?: Ton; largeur?: number; hauteur?: number }) {
  if (valeurs.length < 2) return null;
  const min = Math.min(...valeurs);
  const max = Math.max(...valeurs);
  const amp = max - min || 1;
  const pts = valeurs.map((v, i) => {
    const x = (i / (valeurs.length - 1)) * largeur;
    const y = hauteur - ((v - min) / amp) * (hauteur - 4) - 2;
    return `${x},${y}`;
  });
  return (
    <svg width={largeur} height={hauteur} viewBox={`0 0 ${largeur} ${hauteur}`} className="overflow-visible">
      <polygon points={`0,${hauteur} ${pts.join(" ")} ${largeur},${hauteur}`} fill={COULEUR[ton]} opacity={0.12} />
      <polyline points={pts.join(" ")} fill="none" stroke={COULEUR[ton]} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={largeur} cy={pts[pts.length - 1].split(",")[1]} r={2.2} fill={COULEUR[ton]} />
    </svg>
  );
}

/* ------------------------------ KPI exécutif ----------------------------- */

export interface KpiExecProps {
  label: string;
  valeur: string;
  unite?: string;
  delta?: string;
  deltaSens?: "positif" | "negatif" | "neutre";
  objectif?: string;
  etat: Etat;
  serie?: number[];
  detail?: string;
  onDrill?: () => void;
  compact?: boolean;
}

export function KpiExec({ label, valeur, unite, delta, deltaSens = "neutre", objectif, etat, serie, detail, onDrill }: KpiExecProps) {
  const ton = tonEtat(etat);
  const deltaClass =
    deltaSens === "positif" ? "text-[var(--success)]" : deltaSens === "negatif" ? "text-[var(--critical)]" : "text-muted-foreground";
  return (
    <button
      type="button"
      onClick={onDrill}
      disabled={!onDrill}
      className={cn(
        "group relative flex w-full flex-col overflow-hidden rounded-lg border border-border bg-card p-4 text-left transition-all",
        onDrill && "hover:-translate-y-px hover:border-[color-mix(in_oklab,var(--brand)_45%,var(--border))] hover:shadow-[0_8px_24px_-16px_rgba(0,0,0,0.45)]",
      )}
    >
      <span className="absolute inset-x-0 top-0 h-[2px]" style={{ background: COULEUR[ton] }} />
      <div className="flex items-start justify-between gap-2">
        <p className="text-[10px] font-semibold uppercase tracking-[0.09em] text-muted-foreground">{label}</p>
        <span className="mt-0.5 size-1.5 shrink-0 rounded-full" style={{ background: COULEUR[ton] }} />
      </div>
      <div className="mt-3 flex items-baseline gap-1">
        <span className="num text-[26px] font-semibold leading-none tracking-tight">{valeur}</span>
        {unite && <span className="text-xs text-muted-foreground">{unite}</span>}
      </div>
      <div className="mt-2 flex items-end justify-between gap-2">
        <div className="min-w-0">
          {delta && <p className={cn("text-[11px] font-medium", deltaClass)}>{delta}</p>}
          {objectif && <p className="text-[11px] text-muted-foreground">Objectif : {objectif}</p>}
          {detail && <p className="text-[11px] text-muted-foreground">{detail}</p>}
        </div>
        {serie && serie.length > 1 && <Sparkline valeurs={serie} ton={ton} largeur={72} hauteur={22} />}
      </div>
      <div className="mt-3 flex items-center justify-between border-t border-border pt-2">
        <Tag ton={ton}>{etat}</Tag>
        {onDrill && <span className="text-[10px] text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">Analyser →</span>}
      </div>
    </button>
  );
}

/* ------------------------------ Titre section ---------------------------- */

export function SectionExec({
  titre,
  sousTitre,
  action,
  children,
  className,
}: {
  titre: string;
  sousTitre?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("space-y-3", className)}>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">{titre}</h2>
          {sousTitre && <p className="mt-1 text-sm text-foreground/80">{sousTitre}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

/* --------------------------------- Jauge --------------------------------- */

export function JaugeObjectif({
  valeur,
  objectif,
  max,
  unite,
  inverse,
}: {
  valeur: number;
  objectif: number;
  max?: number;
  unite?: string;
  inverse?: boolean;
}) {
  const plafond = max ?? Math.max(valeur, objectif) * 1.35;
  const bon = inverse ? valeur <= objectif : valeur >= objectif;
  const proche = inverse ? valeur <= objectif * 1.15 : valeur >= objectif * 0.9;
  const ton: Ton = bon ? "success" : proche ? "warning" : "critical";
  return (
    <div>
      <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(100, (valeur / plafond) * 100)}%`, background: COULEUR[ton] }} />
      </div>
      <div className="relative h-3">
        <span
          className="absolute top-0 -translate-x-1/2 text-[10px] text-muted-foreground"
          style={{ left: `${Math.min(100, (objectif / plafond) * 100)}%` }}
        >
          ▲ {objectif}
          {unite}
        </span>
      </div>
    </div>
  );
}

/* -------------------------------- Heatmap -------------------------------- */

export function Heatmap({
  lignes,
  colonnes,
  valeur,
  format,
  seuils,
  onCellule,
}: {
  lignes: { site: string; valeurs: Record<string, number> }[];
  colonnes: string[];
  valeur?: string;
  format?: (v: number) => string;
  seuils: { bon: number; moyen: number };
  onCellule?: (site: string, colonne: string, v: number) => void;
}) {
  const couleur = (v: number) =>
    v >= seuils.bon
      ? "color-mix(in oklab, var(--success) 22%, transparent)"
      : v >= seuils.moyen
        ? "color-mix(in oklab, var(--warning) 26%, transparent)"
        : "color-mix(in oklab, var(--critical) 24%, transparent)";
  const texte = (v: number) => (v >= seuils.bon ? "var(--success)" : v >= seuils.moyen ? "var(--warning)" : "var(--critical)");
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-separate border-spacing-1 text-sm">
        <thead>
          <tr>
            <th className="w-40 px-2 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{valeur ?? "Site"}</th>
            {colonnes.map((c) => (
              <th key={c} className="px-2 pb-1 text-center text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {lignes.map((l) => (
            <tr key={l.site}>
              <td className="whitespace-nowrap px-2 text-xs font-medium">{l.site}</td>
              {colonnes.map((c) => {
                const v = l.valeurs[c];
                return (
                  <td key={c} className="p-0">
                    <button
                      type="button"
                      onClick={() => onCellule?.(l.site, c, v)}
                      className="num h-11 w-full rounded-md text-center text-sm font-semibold transition-transform hover:scale-[1.03]"
                      style={{ background: couleur(v), color: texte(v) }}
                    >
                      {format ? format(v) : v}
                    </button>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ------------------------------ Barres simples --------------------------- */

export function BarresComparees({
  donnees,
  unite = "%",
  objectif,
  inverse,
}: {
  donnees: { label: string; valeur: number }[];
  unite?: string;
  objectif?: number;
  inverse?: boolean;
}) {
  const max = Math.max(...donnees.map((d) => d.valeur), objectif ?? 0) * 1.1 || 1;
  return (
    <div className="space-y-2.5">
      {donnees.map((d) => {
        const depasse = objectif !== undefined && (inverse ? d.valeur > objectif : d.valeur < objectif);
        return (
          <div key={d.label} className="flex items-center gap-3">
            <span className="w-40 shrink-0 truncate text-xs text-muted-foreground">{d.label}</span>
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full"
                style={{ width: `${(d.valeur / max) * 100}%`, background: depasse ? "var(--critical)" : "var(--brand)" }}
              />
            </div>
            <span className="num w-14 shrink-0 text-right text-xs font-medium">
              {d.valeur}
              {unite}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export function EtatTag({ etat }: { etat: Etat }) {
  return <Tag ton={tonEtat(etat)}>{etat}</Tag>;
}
