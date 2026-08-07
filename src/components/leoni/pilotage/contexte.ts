import type { FicheSite } from "@/data/pilotage";

export interface CtxPilotage {
  /** Sites retenus par les filtres actifs. */
  fiches: FicheSite[];
  /** Nombre de mois affichés selon la période. */
  mois: number;
  /** Comparer avec la période précédente. */
  comparer: boolean;
  /** Afficher les objectifs. */
  objectifs: boolean;
  /** Navigation vers un autre onglet (drill-down niveau 2). */
  aller: (onglet: string) => void;
  /** Ouvre le panneau d'analyse détaillée (niveau 3). */
  analyser: (titre: string, contenu: string[], onglet?: string) => void;
  /** Crée un plan d'action depuis une alerte ou un risque. */
  creerPlan: (sujet: string, objectif: string) => void;
}
