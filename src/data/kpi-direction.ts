/**
 * KPI & pilotage direction — tableau de bord exécutif consolidé.
 * Cohérent avec src/data/leoni.ts, retention.ts, satisfaction.ts, postes-critiques.ts.
 */

export type TendanceSens = "hausse" | "baisse" | "stable";

export interface PonderationHealthScore {
  domaine: string;
  poids: number;
  valeur: number; // score du domaine 0-100
  description: string;
}

export const PONDERATIONS_HEALTH_SCORE: PonderationHealthScore[] = [
  { domaine: "Recrutement", poids: 20, valeur: 82, description: "Couverture des besoins, délai de cycle, qualité du recrutement" },
  { domaine: "Formation", poids: 15, valeur: 84, description: "Taux de réussite QCM, score pédagogique moyen, progression" },
  { domaine: "Conformité postes critiques", poids: 20, valeur: 76, description: "Part des postes critiques conformes aux exigences" },
  { domaine: "Présence", poids: 15, valeur: 94, description: "Taux de présence global multi-sites" },
  { domaine: "Satisfaction", poids: 10, valeur: 71, description: "Moyenne des réponses Mood du mois" },
  { domaine: "Rétention", poids: 15, valeur: 82, description: "Rétention à 90 jours et turnover mensuel maîtrisé" },
  { domaine: "Réclamations", poids: 5, valeur: 68, description: "Taux et délai de résolution des réclamations" },
];

export const HEALTH_SCORE_HISTORIQUE = [
  { mois: "Fév", score: 74 },
  { mois: "Mars", score: 75 },
  { mois: "Avr", score: 73 },
  { mois: "Mai", score: 76 },
  { mois: "Juin", score: 79 },
  { mois: "Juil", score: 80 },
];

export interface DomaineScorecard {
  domaine: string;
  kpi: string;
  valeur: number;
  unite: string;
  cible: number;
  serie: number[];
  responsable: string;
}

export const DOMAINES_SCORECARD: DomaineScorecard[] = [
  { domaine: "Recrutement", kpi: "Taux de couverture des besoins", valeur: 80, unite: "%", cible: 90, serie: [71, 74, 76, 78, 79, 80], responsable: "Yassine Alaoui" },
  { domaine: "Formation", kpi: "Taux de réussite QCM", valeur: 82, unite: "%", cible: 85, serie: [75, 77, 79, 80, 81, 82], responsable: "Salma Bennis" },
  { domaine: "Conformité postes critiques", kpi: "Part de conformité", valeur: 76, unite: "%", cible: 95, serie: [68, 70, 72, 74, 75, 76], responsable: "Rachida Ouazzani" },
  { domaine: "Présence", kpi: "Taux de présence global", valeur: 94.2, unite: "%", cible: 96, serie: [92.8, 93.1, 93.6, 93.9, 94.0, 94.2], responsable: "Imane El Fassi" },
  { domaine: "Satisfaction", kpi: "Score Mood moyen (/5)", valeur: 3.55, unite: "/5", cible: 4, serie: [3.7, 3.65, 3.6, 3.5, 3.5, 3.55], responsable: "Hanane Tazi" },
  { domaine: "Rétention", kpi: "Rétention à 90 jours", valeur: 84, unite: "%", cible: 88, serie: [81, 82, 83, 83, 84, 84], responsable: "Amina Rajouh" },
  { domaine: "Turnover", kpi: "Turnover mensuel", valeur: 3.2, unite: "%", cible: 2.5, serie: [2.6, 2.9, 3.4, 3.1, 2.8, 3.2], responsable: "Amina Rajouh" },
  { domaine: "Réclamations", kpi: "Taux de résolution", valeur: 87, unite: "%", cible: 95, serie: [80, 82, 84, 85, 86, 87], responsable: "Karim Sebti" },
];

export function statutEcart(valeur: number, cible: number, inverse = false): "success" | "warning" | "critical" {
  const ecart = inverse ? cible - valeur : valeur - cible;
  const ratio = ecart / cible;
  if (inverse) {
    if (valeur <= cible) return "success";
    if (ratio > -0.15) return "warning";
    return "critical";
  }
  if (valeur >= cible) return "success";
  if (ratio > -0.1) return "warning";
  return "critical";
}

/* ------------------------------------------------------------------ */
/* Benchmarking multi-sites                                            */
/* ------------------------------------------------------------------ */

export interface SiteKpi {
  site: string;
  effectif: number;
  couvertureBesoins: number;
  reussiteQcm: number;
  conformitePostesCritiques: number;
  presence: number;
  satisfaction: number;
  retention90: number;
  turnover: number;
  reclamationsResolues: number;
}

export const SITES_KPI: SiteKpi[] = [
  { site: "Bouskoura", effectif: 3240, couvertureBesoins: 78, reussiteQcm: 79, conformitePostesCritiques: 71, presence: 94, satisfaction: 3.4, retention90: 79, turnover: 3.8, reclamationsResolues: 82 },
  { site: "Bouskoura – Ouled Saleh", effectif: 2480, couvertureBesoins: 82, reussiteQcm: 81, conformitePostesCritiques: 77, presence: 93, satisfaction: 3.6, retention90: 83, turnover: 3.3, reclamationsResolues: 85 },
  { site: "Berrechid", effectif: 2910, couvertureBesoins: 88, reussiteQcm: 89, conformitePostesCritiques: 91, presence: 96, satisfaction: 4.1, retention90: 91, turnover: 2.1, reclamationsResolues: 94 },
  { site: "Bouznika", effectif: 1860, couvertureBesoins: 80, reussiteQcm: 80, conformitePostesCritiques: 74, presence: 90, satisfaction: 3.8, retention90: 85, turnover: 2.7, reclamationsResolues: 88 },
  { site: "Agadir", effectif: 2240, couvertureBesoins: 79, reussiteQcm: 78, conformitePostesCritiques: 70, presence: 95, satisfaction: 3.7, retention90: 82, turnover: 3.1, reclamationsResolues: 86 },
  { site: "Aïn Sebaâ", effectif: 1690, couvertureBesoins: 85, reussiteQcm: 83, conformitePostesCritiques: 80, presence: 92, satisfaction: 4.0, retention90: 88, turnover: 2.3, reclamationsResolues: 90 },
];

export const INDICATEURS_BENCHMARK: { cle: keyof SiteKpi; label: string; unite: string; inverse?: boolean }[] = [
  { cle: "couvertureBesoins", label: "Couverture des besoins", unite: "%" },
  { cle: "reussiteQcm", label: "Réussite QCM", unite: "%" },
  { cle: "conformitePostesCritiques", label: "Conformité postes critiques", unite: "%" },
  { cle: "presence", label: "Présence", unite: "%" },
  { cle: "satisfaction", label: "Satisfaction", unite: "/5" },
  { cle: "retention90", label: "Rétention 90 j", unite: "%" },
  { cle: "turnover", label: "Turnover", unite: "%", inverse: true },
  { cle: "reclamationsResolues", label: "Réclamations résolues", unite: "%" },
];

/* ------------------------------------------------------------------ */
/* Centre de risques                                                   */
/* ------------------------------------------------------------------ */

export type Severite = "Critique" | "Élevée" | "Moyenne" | "Faible";

export interface RisqueDirection {
  id: string;
  risque: string;
  domaine: string;
  severite: Severite;
  impact: string;
  tendance: TendanceSens;
  siteConcerne: string;
  responsable: string;
  actionRecommandee: string;
  indicateur: string;
}

export const RISQUES_DIRECTION: RisqueDirection[] = [
  { id: "RSK-01", risque: "Couverture insuffisante des besoins critiques", domaine: "Recrutement", severite: "Critique", impact: "Retard de production sur lignes contrôle qualité et essais", tendance: "hausse", siteConcerne: "Bouskoura, Agadir", responsable: "Yassine Alaoui", actionRecommandee: "Renforcer le sourcing ciblé postes critiques et accélérer les délais de décision", indicateur: "Couverture 78 % (cible 90 %)" },
  { id: "RSK-02", risque: "Non-conformité des postes critiques", domaine: "Conformité", severite: "Critique", impact: "Exposition qualité/sécurité sur postes à risque client", tendance: "stable", siteConcerne: "Bouskoura, Agadir", responsable: "Rachida Ouazzani", actionRecommandee: "Plan de mise en conformité accéléré (habilitations et tests bloquants)", indicateur: "Conformité 76 % (cible 95 %)" },
  { id: "RSK-03", risque: "Turnover précoce (avant 30 jours)", domaine: "Rétention", severite: "Élevée", impact: "Surcoût de recrutement et perte de compétences en formation", tendance: "hausse", siteConcerne: "Bouskoura", responsable: "Amina Rajouh", actionRecommandee: "Renforcer le suivi des cohortes à risque et les entretiens à J+15", indicateur: "34 départs avant 30 jours (mois)" },
  { id: "RSK-04", risque: "Absentéisme élevé", domaine: "Présence", severite: "Moyenne", impact: "Perturbation des cadences de production", tendance: "stable", siteConcerne: "Bouznika, Aïn Sebaâ", responsable: "Imane El Fassi", actionRecommandee: "Analyser les motifs d'absence et renforcer les plans de présence", indicateur: "Présence 90-92 % sur 2 sites" },
  { id: "RSK-05", risque: "Réclamations transport récurrentes", domaine: "Satisfaction", severite: "Élevée", impact: "Dégradation de la satisfaction et risque de départ", tendance: "hausse", siteConcerne: "Bouskoura", responsable: "Hanane Tazi", actionRecommandee: "Réviser la ligne TR-BSK-14 et les points de ramassage", indicateur: "17 réclamations transport (mois)" },
  { id: "RSK-06", risque: "Échecs QCM en formation", domaine: "Formation", severite: "Moyenne", impact: "Allongement des parcours et retard d'intégration", tendance: "baisse", siteConcerne: "Berrechid, Bouznika", responsable: "Salma Bennis", actionRecommandee: "Renforcer le tutorat pour les modules Contrôle qualité et Paramétrage coupe", indicateur: "18 % d'échec moyen QCM" },
];

export const tonSeverite = (s: Severite) =>
  s === "Faible" ? "success" : s === "Moyenne" ? "warning" : s === "Élevée" ? "warning" : "critical";

/* ------------------------------------------------------------------ */
/* Plan d'actions correctives                                          */
/* ------------------------------------------------------------------ */

export type StatutActionDirection = "À planifier" | "En cours" | "En retard" | "Clôturée";

export interface ActionDirection {
  reference: string;
  risqueLie: string;
  action: string;
  responsable: string;
  echeance: string;
  avancement: number;
  statut: StatutActionDirection;
}

export const ACTIONS_DIRECTION: ActionDirection[] = [
  { reference: "PLA-2026-001", risqueLie: "RSK-01", action: "Lancer une campagne de sourcing ciblée postes critiques (Bouskoura, Agadir)", responsable: "Yassine Alaoui", echeance: "15/08/2026", avancement: 45, statut: "En cours" },
  { reference: "PLA-2026-002", risqueLie: "RSK-02", action: "Auditer et régulariser les habilitations manquantes sur postes critiques", responsable: "Rachida Ouazzani", echeance: "20/08/2026", avancement: 30, statut: "En cours" },
  { reference: "PLA-2026-003", risqueLie: "RSK-03", action: "Déployer un entretien systématique à J+15 pour les nouvelles cohortes", responsable: "Amina Rajouh", echeance: "10/08/2026", avancement: 70, statut: "En cours" },
  { reference: "PLA-2026-004", risqueLie: "RSK-05", action: "Réviser les horaires et arrêts de la ligne TR-BSK-14", responsable: "Hanane Tazi", echeance: "10/08/2026", avancement: 55, statut: "En cours" },
  { reference: "PLA-2026-005", risqueLie: "RSK-06", action: "Mettre en place un tutorat renforcé sur les modules à fort taux d'échec", responsable: "Salma Bennis", echeance: "05/08/2026", avancement: 100, statut: "Clôturée" },
  { reference: "PLA-2026-006", risqueLie: "RSK-04", action: "Analyser les motifs d'absence à Bouznika et Aïn Sebaâ", responsable: "Imane El Fassi", echeance: "28/07/2026", avancement: 20, statut: "En retard" },
];

export const tonStatutAction = (s: StatutActionDirection) =>
  s === "Clôturée" ? "success" : s === "En retard" ? "critical" : s === "En cours" ? "info" : "neutral";
