import type { SessionPlanning, StatutSession } from "@/data/planning";
import type { Ton } from "@/components/leoni/kit";

/** Libellé métier « Sessions & suivi » d'un statut de session (objet unique, vue différente). */
export function statutMetier(s: SessionPlanning): string {
  switch (s.statut) {
    case "Brouillon":
      return "Brouillon";
    case "À confirmer":
    case "Planifiée":
    case "Confirmée":
      return "À venir";
    case "En cours":
      return s.presencesSaisies > 0 && s.evaluationsSaisies > 0 ? "À clôturer" : "En cours";
    case "Terminée":
      return "Clôturée";
    case "Reportée":
      return "Suspendue";
    case "Annulée":
      return "Annulée";
    default:
      return s.statut;
  }
}

export const STATUTS_METIER = [
  "Brouillon",
  "À venir",
  "En cours",
  "À clôturer",
  "Clôturée",
  "Suspendue",
  "Annulée",
];

export function tonStatutMetier(v: string): Ton {
  if (v === "Clôturée") return "success";
  if (v === "En cours") return "info";
  if (v === "À clôturer") return "warning";
  if (v === "Annulée" || v === "Suspendue") return "critical";
  if (v === "À venir") return "brand";
  return "neutral";
}

export const STATUTS_SOURCE: Record<string, StatutSession[]> = {
  Brouillon: ["Brouillon"],
  "À venir": ["À confirmer", "Planifiée", "Confirmée"],
  "En cours": ["En cours"],
  "À clôturer": ["En cours"],
  Clôturée: ["Terminée"],
  Suspendue: ["Reportée"],
  Annulée: ["Annulée"],
};

export function formatFr(d: string) {
  const [a, m, j] = d.split("-");
  return `${j}/${m}/${a}`;
}
