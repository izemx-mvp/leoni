// Helpers & référentiels pour le module Réclamations (backoffice + Espace Ouvrier).
import type { Reclamation, StatutReclamation } from "@/data/leoni";

export const STATUTS_OUVERTS: StatutReclamation[] = ["Nouvelle", "Assignée", "En cours", "En attente ouvrier", "Escaladée"];
export const STATUTS_FERMES: StatutReclamation[] = ["Résolue", "Clôturée", "Rejetée"];

export const ETAPES_WORKFLOW: StatutReclamation[] = [
  "Nouvelle",
  "Assignée",
  "En cours",
  "En attente ouvrier",
  "Résolue",
  "Clôturée",
];

export function slaHeures(priorite: string): number {
  switch (priorite) {
    case "Critique":
      return 24;
    case "Haute":
    case "Élevée":
      return 48;
    case "Normale":
      return 96;
    default:
      return 168;
  }
}

export function estSlaRisque(r: Reclamation): boolean {
  if (r.slaRespecte !== undefined) return !r.slaRespecte && STATUTS_OUVERTS.includes(r.statut);
  return STATUTS_OUVERTS.includes(r.statut) && (r.priorite === "Critique" || r.priorite === "Haute");
}

export function delaiResolutionJours(r: Reclamation): number | undefined {
  if (!r.dateResolution) return undefined;
  const parse = (d: string) => {
    const [j, m, a] = d.split("/").map(Number);
    return new Date(a, m - 1, j).getTime();
  };
  try {
    return Math.max(0, Math.round((parse(r.dateResolution) - parse(r.date)) / 86400000));
  } catch {
    return undefined;
  }
}

export function moyenne(nombres: number[]): number {
  if (!nombres.length) return 0;
  return Math.round((nombres.reduce((s, n) => s + n, 0) / nombres.length) * 10) / 10;
}

export function topN<T extends string>(valeurs: T[], n = 3): { label: T; total: number }[] {
  const compte = new Map<T, number>();
  valeurs.forEach((v) => compte.set(v, (compte.get(v) ?? 0) + 1));
  return [...compte.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([label, total]) => ({ label, total }));
}

/** Évolution mensuelle simulée à partir du volume actuel (démonstration). */
export const EVOLUTION_MENSUELLE = [
  { mois: "Fév", volume: 9, resolues: 7 },
  { mois: "Mar", volume: 12, resolues: 10 },
  { mois: "Avr", volume: 10, resolues: 9 },
  { mois: "Mai", volume: 14, resolues: 11 },
  { mois: "Juin", volume: 13, resolues: 12 },
  { mois: "Juil", volume: 12, resolues: 8 },
];

export const FORMATEURS_RECLAMATIONS = ["Salma Bennis", "Nabil Cherkaoui", "Youssef Tahiri"];
export const LIGNES_TRANSPORT_RECLAMATIONS = ["TR-BSK-14", "TR-BER-03", "TR-BZN-07", "TR-AGA-02"];

export function tonPriorite(p: string): "critical" | "warning" | "info" | "neutral" {
  if (p === "Critique") return "critical";
  if (p === "Haute" || p === "Élevée") return "warning";
  if (p === "Normale") return "info";
  return "neutral";
}

export function tonStatutReclamation(s: StatutReclamation): "success" | "critical" | "warning" | "info" | "neutral" {
  if (s === "Résolue" || s === "Clôturée") return "success";
  if (s === "Escaladée" || s === "Rejetée") return "critical";
  if (s === "En attente ouvrier") return "warning";
  if (s === "Nouvelle") return "info";
  return "neutral";
}
