/**
 * People & rétention — turnover, départs, motifs, cohortes et risque de départ précoce.
 */

export const TYPES_DEPART = [
  "Démission",
  "Fin de contrat",
  "Abandon de poste",
  "Rupture période d'essai",
  "Décision entreprise",
  "Inaptitude",
  "Mutation",
  "Autre",
];

export const MOTIFS_DEPART = [
  "Transport",
  "Problème avec formateur",
  "Problème avec manager",
  "Problème sur terrain",
  "Conditions de travail",
  "Horaires / shifts",
  "Rémunération",
  "Distance domicile-site",
  "Problème d'intégration",
  "Formation insuffisante",
  "Formation trop difficile",
  "Mauvaise affectation",
  "Charge de travail",
  "EPI / matériel",
  "Sécurité",
  "Santé",
  "Raisons personnelles",
  "Nouvelle opportunité",
  "Autre",
];

export const KPI_PEOPLE = {
  effectifActif: 20418,
  effectifMoyen: 20345,
  nouveauxIntegres: 214,
  departsMois: 68,
  turnoverMensuel: 3.2,
  turnover12Mois: 18.4,
  departsFormation: 21,
  departsAvant30: 34,
  departsAvant90: 49,
  retention30: 91,
  retention90: 84,
  risqueDepart: 127,
  satisfactionMoyenne: 3.8,
  periode: "01/07/2026 – 31/07/2026",
};

export const FORMULES_KPI = [
  { kpi: "Turnover mensuel", formule: "Départs ÷ effectif moyen × 100", detail: "68 ÷ 20 345 × 100 = 3,2 %" },
  { kpi: "Effectif moyen", formule: "(Effectif début + effectif fin) ÷ 2", detail: "(20 272 + 20 418) ÷ 2 = 20 345" },
  { kpi: "Rétention 30 jours", formule: "Intégrés actifs à J+30 ÷ intégrés × 100", detail: "196 ÷ 214 × 100 = 91,6 %" },
  { kpi: "Turnover 12 mois", formule: "Départs 12 mois ÷ effectif moyen 12 mois × 100", detail: "3 742 ÷ 20 340 × 100 = 18,4 %" },
];

export const TURNOVER_MENSUEL = [
  { mois: "Fév", turnover: 2.6, departs: 52, integres: 168 },
  { mois: "Mars", turnover: 2.9, departs: 58, integres: 182 },
  { mois: "Avr", turnover: 3.4, departs: 70, integres: 205 },
  { mois: "Mai", turnover: 3.1, departs: 64, integres: 196 },
  { mois: "Juin", turnover: 2.8, departs: 57, integres: 210 },
  { mois: "Juil", turnover: 3.2, departs: 68, integres: 214 },
];

export const KPI_SITES_PEOPLE = [
  { site: "Bouskoura", effectif: 3240, integres: 84, departs: 18, turnover: 3.8, departs30: 7, satisfaction: 3.4, transport: 24, formateur: 8, terrain: 17, risque: "Élevé" },
  { site: "Bouskoura – Ouled Saleh", effectif: 2480, integres: 51, departs: 12, turnover: 3.3, departs30: 5, satisfaction: 3.6, transport: 15, formateur: 5, terrain: 9, risque: "Moyen" },
  { site: "Berrechid", effectif: 2910, integres: 62, departs: 9, turnover: 2.1, departs30: 3, satisfaction: 4.1, transport: 7, formateur: 4, terrain: 8, risque: "Faible" },
  { site: "Bouznika", effectif: 1860, integres: 34, departs: 8, turnover: 2.7, departs30: 4, satisfaction: 3.8, transport: 5, formateur: 2, terrain: 6, risque: "Moyen" },
  { site: "Agadir", effectif: 2240, integres: 44, departs: 11, turnover: 3.1, departs30: 6, satisfaction: 3.7, transport: 14, formateur: 4, terrain: 9, risque: "Moyen" },
  { site: "Aïn Sebaâ", effectif: 1690, integres: 28, departs: 6, turnover: 2.3, departs30: 2, satisfaction: 4.0, transport: 4, formateur: 1, terrain: 4, risque: "Faible" },
];

export const FUNNEL_RETENTION = [
  { etape: "Candidats retenus", valeur: 100 },
  { etape: "Intégrés", valeur: 92 },
  { etape: "Formation terminée", valeur: 84 },
  { etape: "Confirmés", valeur: 78 },
  { etape: "Actifs à 30 jours", valeur: 73 },
  { etape: "Actifs à 90 jours", valeur: 66 },
];

export const MOTIFS_DEPART_STATS = [
  { motif: "Transport", nombre: 17, part: 25 },
  { motif: "Problème sur terrain", nombre: 11, part: 16 },
  { motif: "Formation trop difficile", nombre: 9, part: 13 },
  { motif: "Problème avec formateur", nombre: 7, part: 10 },
  { motif: "Raisons personnelles", nombre: 6, part: 9 },
  { motif: "Nouvelle opportunité", nombre: 6, part: 9 },
  { motif: "Distance domicile-site", nombre: 5, part: 7 },
  { motif: "Santé", nombre: 4, part: 6 },
  { motif: "Autre", nombre: 3, part: 5 },
];

export const COHORTES = [
  { cohorte: "Mai 2026", integres: 196, actifs30: 176, departs: 20, retention: 89.8, reussite: 82 },
  { cohorte: "Juin 2026", integres: 210, actifs30: 189, departs: 21, retention: 90.0, reussite: 84 },
  { cohorte: "Juillet 2026", integres: 214, actifs30: 196, departs: 18, retention: 91.6, reussite: 86 },
  { cohorte: "Juillet 2026 — Bouskoura", integres: 84, actifs30: 74, departs: 10, retention: 88.1, reussite: 84 },
  { cohorte: "Juillet 2026 — Berrechid", integres: 62, actifs30: 59, departs: 3, retention: 95.2, reussite: 88 },
];

export interface Depart {
  id: string;
  ouvrier: string;
  matricule: string;
  site: string;
  poste: string;
  posteCritique: boolean;
  dateDepart: string;
  ancienneteJours: number;
  type: string;
  motifPrincipal: string;
  formateur: string;
  groupe: string;
  satisfaction: number;
  pendantFormation: boolean;
  entretienDepart: boolean;
}

export const DEPARTS: Depart[] = [
  { id: "DEP-2026-041", ouvrier: "Khadija Rami", matricule: "LMA-BER-2026-0392", site: "Berrechid", poste: "Contrôleur qualité", posteCritique: true, dateDepart: "29/07/2026", ancienneteJours: 27, type: "Rupture période d'essai", motifPrincipal: "Formation trop difficile", formateur: "Hind Bekkali", groupe: "QLT-01", satisfaction: 2.4, pendantFormation: true, entretienDepart: true },
  { id: "DEP-2026-040", ouvrier: "Anas Bouzid", matricule: "LMA-BOU-2026-0361", site: "Bouskoura", poste: "Opérateur câblage", posteCritique: false, dateDepart: "24/07/2026", ancienneteJours: 39, type: "Abandon de poste", motifPrincipal: "Transport", formateur: "Nadia El Fassi", groupe: "CBL-07", satisfaction: 2.1, pendantFormation: false, entretienDepart: false },
  { id: "DEP-2026-039", ouvrier: "Salma Cherkaoui", matricule: "LMA-AGA-2026-0344", site: "Agadir", poste: "Opératrice assemblage", posteCritique: false, dateDepart: "21/07/2026", ancienneteJours: 31, type: "Démission", motifPrincipal: "Nouvelle opportunité", formateur: "Hanane Tazi", groupe: "ASM-04", satisfaction: 3.6, pendantFormation: false, entretienDepart: true },
  { id: "DEP-2026-038", ouvrier: "Yassine Kabbaj", matricule: "LMA-BOU-2026-0327", site: "Bouskoura", poste: "Technicien de ligne", posteCritique: true, dateDepart: "18/07/2026", ancienneteJours: 47, type: "Décision entreprise", motifPrincipal: "Mauvaise affectation", formateur: "Karim Lahlou", groupe: "CBL-08", satisfaction: 2.9, pendantFormation: false, entretienDepart: true },
  { id: "DEP-2026-037", ouvrier: "Imane Ouazzani", matricule: "LMA-BOU-2026-0318", site: "Bouskoura", poste: "Opérateur contrôle final", posteCritique: true, dateDepart: "12/07/2026", ancienneteJours: 32, type: "Démission", motifPrincipal: "Problème d'intégration", formateur: "Nadia El Fassi", groupe: "QLT-02", satisfaction: 2.3, pendantFormation: true, entretienDepart: true },
  { id: "DEP-2026-036", ouvrier: "Hamza Idrissi", matricule: "LMA-BZN-2026-0301", site: "Bouznika", poste: "Opérateur coupe", posteCritique: false, dateDepart: "05/07/2026", ancienneteJours: 48, type: "Inaptitude", motifPrincipal: "Santé", formateur: "Otmane Rifi", groupe: "CUT-03", satisfaction: 3.9, pendantFormation: false, entretienDepart: true },
];

export interface RisqueDepart {
  ouvrierId: string;
  ouvrier: string;
  site: string;
  groupe: string;
  poste: string;
  ancienneteJours: number;
  niveau: "Faible" | "Moyen" | "Élevé" | "Critique";
  score: number;
  facteurs: string[];
  action: string;
}

export const RISQUES_DEPART: RisqueDepart[] = [
  { ouvrierId: "LMA-BOU-2026-0421", ouvrier: "Nawal Fadli", site: "Bouskoura", groupe: "CBL-08", poste: "Opérateur contrôle final", ancienneteJours: 12, niveau: "Critique", score: 84, facteurs: ["4 réponses négatives consécutives", "Score formation 52 %", "1 avertissement écrit"], action: "Entretien RH immédiat" },
  { ouvrierId: "LMA-BOU-2026-0418", ouvrier: "Sara Amrani", site: "Bouskoura", groupe: "CBL-07", poste: "Opératrice câblage", ancienneteJours: 19, niveau: "Élevé", score: 72, facteurs: ["Satisfaction 2,1 / 5 sur 7 jours", "3 retards en 2 semaines", "2 signalements transport"], action: "Planifier un entretien de suivi" },
  { ouvrierId: "LMA-BOU-2026-0412", ouvrier: "Rachid Bennis", site: "Bouskoura", groupe: "CBL-07", poste: "Technicien de ligne", ancienneteJours: 41, niveau: "Élevé", score: 68, facteurs: ["Habilitation expirée", "Commentaires terrain négatifs"], action: "Replanifier l'habilitation" },
  { ouvrierId: "LMA-BER-2026-0407", ouvrier: "Hamza Idrissi", site: "Berrechid", groupe: "QLT-01", poste: "Contrôleur qualité", ancienneteJours: 26, niveau: "Moyen", score: 54, facteurs: ["Progression à l'arrêt", "Demande de changement de poste"], action: "Revue de parcours" },
  { ouvrierId: "LMA-AGA-2026-0399", ouvrier: "Salma Bennani", site: "Agadir", groupe: "ASM-04", poste: "Opératrice assemblage", ancienneteJours: 33, niveau: "Moyen", score: 49, facteurs: ["2 signalements transport", "Absentéisme 8 %"], action: "Vérifier la ligne de ramassage" },
];

export const CORRELATIONS = [
  { site: "Bouskoura", satisfactionTransport: 2.9, departsTransport: 17, turnover: 3.8, lecture: "Corrélation potentielle à analyser" },
  { site: "Agadir", satisfactionTransport: 3.3, departsTransport: 4, turnover: 3.1, lecture: "Signal associé" },
  { site: "Berrechid", satisfactionTransport: 4.0, departsTransport: 2, turnover: 2.1, lecture: "Aucun signal notable" },
  { site: "Bouznika", satisfactionTransport: 3.8, departsTransport: 1, turnover: 2.7, lecture: "À surveiller" },
];

export const tonRisque = (n: string) => (n === "Faible" ? "success" : n === "Moyen" ? "warning" : "critical");
