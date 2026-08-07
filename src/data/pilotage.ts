/**
 * Pilotage Direction — jeu de données exécutif consolidé (MVP / démonstration).
 * 12 mois glissants, 5 sites, différenciés volontairement :
 *  - Bouskoura : turnover élevé, transport dégradé, satisfaction moyenne
 *  - Berrechid : bonne rétention, bonne satisfaction, poste critique QC sous-couvert
 *  - Bouznika  : absentéisme élevé
 *  - Agadir    : recrutement lent
 *  - Aïn Sebaâ : profil équilibré
 */

export type Etat = "Bon" | "À surveiller" | "Critique";
export type Ton = "brand" | "success" | "warning" | "critical" | "info" | "neutral";

export const tonEtat = (e: Etat): Ton => (e === "Bon" ? "success" : e === "À surveiller" ? "warning" : "critical");

export const MOIS_12 = [
  "Août",
  "Sept",
  "Oct",
  "Nov",
  "Déc",
  "Janv",
  "Févr",
  "Mars",
  "Avr",
  "Mai",
  "Juin",
  "Juil",
];

export const SITES_PILOTAGE = ["Bouskoura", "Berrechid", "Bouznika", "Aïn Sebaâ", "Agadir"] as const;
export type SitePilotage = (typeof SITES_PILOTAGE)[number];

export const REGIONS = ["Toutes les régions", "Casablanca-Settat", "Souss-Massa"];
export const DEPARTEMENTS = ["Tous les départements", "Production", "Qualité", "Logistique", "Maintenance"];
export const POSTES_FILTRE = ["Tous les postes", "Opérateur câblage", "Contrôleur qualité", "Opérateur coupe", "Technicien de ligne"];
export const CRITICITES = ["Toutes criticités", "Postes critiques", "Postes standards"];
export const PERIODES = ["Ce mois", "Trimestre", "Année", "12 derniers mois", "Période personnalisée"];

export const MOIS_PAR_PERIODE: Record<string, number> = {
  "Ce mois": 1,
  Trimestre: 3,
  Année: 12,
  "12 derniers mois": 12,
  "Période personnalisée": 6,
};

/* ------------------------------------------------------------------ */
/* Fiche consolidée par site                                           */
/* ------------------------------------------------------------------ */

export interface FicheSite {
  site: SitePilotage;
  region: string;
  effectif: number;
  variationEffectif: number; // %
  besoinsOuverts: number;
  couvertureRecrutement: number; // %
  delaiRecrutement: number; // jours
  postesCritiques: number;
  postesCritiquesNonCouverts: number;
  conformitePostesCritiques: number; // %
  reussiteFormation: number; // %
  retention90: number; // %
  turnoverMensuel: number; // %
  turnover12: number; // %
  departs30: number;
  departs90: number;
  ouvriersRisque: number;
  ouvriersRisqueEleve: number;
  absenteisme: number; // %
  satisfaction: number; // /5
  reclamationsCritiques: number;
  reclamationsPour1000: number;
  slaDepasse: number;
  risqueGlobal: Etat;
  serieTurnover: number[];
  serieRetention: number[];
  serieSatisfaction: number[];
  serieAbsenteisme: number[];
  serieEffectif: number[];
}

export const FICHES_SITES: FicheSite[] = [
  {
    site: "Bouskoura",
    region: "Casablanca-Settat",
    effectif: 5720,
    variationEffectif: 3.4,
    besoinsOuverts: 168,
    couvertureRecrutement: 72,
    delaiRecrutement: 26,
    postesCritiques: 14,
    postesCritiquesNonCouverts: 5,
    conformitePostesCritiques: 78,
    reussiteFormation: 83,
    retention90: 79,
    turnoverMensuel: 6.2,
    turnover12: 24.1,
    departs30: 14,
    departs90: 21,
    ouvriersRisque: 48,
    ouvriersRisqueEleve: 19,
    absenteisme: 4.8,
    satisfaction: 3.4,
    reclamationsCritiques: 4,
    reclamationsPour1000: 14.2,
    slaDepasse: 2,
    risqueGlobal: "Critique",
    serieTurnover: [4.1, 4.3, 4.6, 4.4, 4.9, 5.1, 5.0, 5.4, 5.6, 5.8, 6.0, 6.2],
    serieRetention: [86, 85, 85, 84, 83, 83, 82, 81, 81, 80, 80, 79],
    serieSatisfaction: [3.9, 3.9, 3.8, 3.8, 3.7, 3.7, 3.6, 3.6, 3.5, 3.5, 3.4, 3.4],
    serieAbsenteisme: [3.9, 4.0, 4.1, 4.0, 4.2, 4.3, 4.4, 4.5, 4.5, 4.6, 4.7, 4.8],
    serieEffectif: [5530, 5552, 5578, 5590, 5601, 5618, 5640, 5662, 5678, 5690, 5704, 5720],
  },
  {
    site: "Berrechid",
    region: "Casablanca-Settat",
    effectif: 4910,
    variationEffectif: 2.6,
    besoinsOuverts: 96,
    couvertureRecrutement: 84,
    delaiRecrutement: 19,
    postesCritiques: 11,
    postesCritiquesNonCouverts: 3,
    conformitePostesCritiques: 91,
    reussiteFormation: 89,
    retention90: 88,
    turnoverMensuel: 3.1,
    turnover12: 12.7,
    departs30: 5,
    departs90: 8,
    ouvriersRisque: 21,
    ouvriersRisqueEleve: 6,
    absenteisme: 2.9,
    satisfaction: 4.1,
    reclamationsCritiques: 1,
    reclamationsPour1000: 7.1,
    slaDepasse: 0,
    risqueGlobal: "Bon",
    serieTurnover: [3.6, 3.5, 3.5, 3.4, 3.4, 3.3, 3.3, 3.2, 3.2, 3.1, 3.1, 3.1],
    serieRetention: [84, 84, 85, 85, 86, 86, 87, 87, 87, 88, 88, 88],
    serieSatisfaction: [3.9, 3.9, 4.0, 4.0, 4.0, 4.1, 4.1, 4.1, 4.0, 4.1, 4.1, 4.1],
    serieAbsenteisme: [3.3, 3.2, 3.2, 3.1, 3.1, 3.0, 3.0, 3.0, 2.9, 2.9, 2.9, 2.9],
    serieEffectif: [4720, 4744, 4768, 4790, 4808, 4822, 4840, 4858, 4872, 4886, 4898, 4910],
  },
  {
    site: "Bouznika",
    region: "Casablanca-Settat",
    effectif: 2840,
    variationEffectif: 1.8,
    besoinsOuverts: 74,
    couvertureRecrutement: 76,
    delaiRecrutement: 23,
    postesCritiques: 8,
    postesCritiquesNonCouverts: 2,
    conformitePostesCritiques: 80,
    reussiteFormation: 81,
    retention90: 83,
    turnoverMensuel: 4.4,
    turnover12: 17.9,
    departs30: 7,
    departs90: 10,
    ouvriersRisque: 26,
    ouvriersRisqueEleve: 9,
    absenteisme: 7.4,
    satisfaction: 3.7,
    reclamationsCritiques: 2,
    reclamationsPour1000: 11.4,
    slaDepasse: 1,
    risqueGlobal: "À surveiller",
    serieTurnover: [3.8, 3.9, 4.0, 4.1, 4.0, 4.2, 4.2, 4.3, 4.3, 4.4, 4.4, 4.4],
    serieRetention: [86, 86, 85, 85, 85, 84, 84, 84, 83, 83, 83, 83],
    serieSatisfaction: [3.9, 3.9, 3.8, 3.8, 3.8, 3.8, 3.7, 3.7, 3.7, 3.7, 3.7, 3.7],
    serieAbsenteisme: [5.4, 5.7, 5.9, 6.1, 6.3, 6.5, 6.7, 6.8, 7.0, 7.1, 7.3, 7.4],
    serieEffectif: [2760, 2768, 2776, 2784, 2792, 2800, 2808, 2816, 2822, 2830, 2836, 2840],
  },
  {
    site: "Aïn Sebaâ",
    region: "Casablanca-Settat",
    effectif: 3210,
    variationEffectif: 2.1,
    besoinsOuverts: 62,
    couvertureRecrutement: 81,
    delaiRecrutement: 21,
    postesCritiques: 7,
    postesCritiquesNonCouverts: 1,
    conformitePostesCritiques: 86,
    reussiteFormation: 85,
    retention90: 86,
    turnoverMensuel: 3.4,
    turnover12: 14.6,
    departs30: 4,
    departs90: 6,
    ouvriersRisque: 15,
    ouvriersRisqueEleve: 4,
    absenteisme: 3.3,
    satisfaction: 4.0,
    reclamationsCritiques: 1,
    reclamationsPour1000: 8.2,
    slaDepasse: 0,
    risqueGlobal: "Bon",
    serieTurnover: [3.7, 3.7, 3.6, 3.6, 3.5, 3.5, 3.5, 3.4, 3.4, 3.4, 3.4, 3.4],
    serieRetention: [83, 83, 84, 84, 85, 85, 85, 86, 86, 86, 86, 86],
    serieSatisfaction: [3.8, 3.8, 3.9, 3.9, 3.9, 4.0, 4.0, 4.0, 4.0, 4.0, 4.0, 4.0],
    serieAbsenteisme: [3.6, 3.6, 3.5, 3.5, 3.4, 3.4, 3.4, 3.3, 3.3, 3.3, 3.3, 3.3],
    serieEffectif: [3090, 3106, 3122, 3138, 3150, 3162, 3174, 3184, 3192, 3200, 3206, 3210],
  },
  {
    site: "Agadir",
    region: "Souss-Massa",
    effectif: 3738,
    variationEffectif: 2.4,
    besoinsOuverts: 86,
    couvertureRecrutement: 61,
    delaiRecrutement: 38,
    postesCritiques: 9,
    postesCritiquesNonCouverts: 1,
    conformitePostesCritiques: 76,
    reussiteFormation: 82,
    retention90: 84,
    turnoverMensuel: 3.9,
    turnover12: 16.2,
    departs30: 4,
    departs90: 7,
    ouvriersRisque: 17,
    ouvriersRisqueEleve: 4,
    absenteisme: 3.6,
    satisfaction: 3.8,
    reclamationsCritiques: 1,
    reclamationsPour1000: 9.4,
    slaDepasse: 0,
    risqueGlobal: "À surveiller",
    serieTurnover: [3.4, 3.5, 3.5, 3.6, 3.6, 3.7, 3.7, 3.8, 3.8, 3.8, 3.9, 3.9],
    serieRetention: [86, 86, 86, 85, 85, 85, 85, 84, 84, 84, 84, 84],
    serieSatisfaction: [3.9, 3.9, 3.9, 3.8, 3.8, 3.8, 3.8, 3.8, 3.8, 3.8, 3.8, 3.8],
    serieAbsenteisme: [3.4, 3.4, 3.5, 3.5, 3.5, 3.5, 3.6, 3.6, 3.6, 3.6, 3.6, 3.6],
    serieEffectif: [3610, 3622, 3636, 3650, 3664, 3676, 3690, 3702, 3714, 3724, 3732, 3738],
  },
];

export const ficheSite = (site: string) => FICHES_SITES.find((f) => f.site === site);

export function sitesFiltres(site: string, region: string): FicheSite[] {
  return FICHES_SITES.filter(
    (f) => (site === "Tous les sites" || f.site === site) && (region === "Toutes les régions" || f.region === region),
  );
}

const somme = (l: number[]) => l.reduce((s, n) => s + n, 0);
const arrondi = (n: number, d = 1) => Math.round(n * 10 ** d) / 10 ** d;

/** Moyenne pondérée par l'effectif d'une clé numérique. */
export function pondere(fiches: FicheSite[], cle: keyof FicheSite, d = 1): number {
  const total = somme(fiches.map((f) => f.effectif));
  if (!total) return 0;
  return arrondi(somme(fiches.map((f) => (f[cle] as number) * f.effectif)) / total, d);
}

export function cumul(fiches: FicheSite[], cle: keyof FicheSite): number {
  return somme(fiches.map((f) => f[cle] as number));
}

/** Série consolidée pondérée par l'effectif, tronquée à la période. */
export function serieConsolidee(fiches: FicheSite[], cle: keyof FicheSite, mois: number): { mois: string; valeur: number }[] {
  const total = somme(fiches.map((f) => f.effectif));
  const points = MOIS_12.map((m, i) => ({
    mois: m,
    valeur: arrondi(somme(fiches.map((f) => (f[cle] as number[])[i] * f.effectif)) / (total || 1), 2),
  }));
  return points.slice(Math.max(0, 12 - mois));
}

/* ------------------------------------------------------------------ */
/* Health score exécutif                                               */
/* ------------------------------------------------------------------ */

export const COMPOSANTES_HEALTH = [
  { domaine: "Recrutement", valeur: 74, poids: 18, onglet: "Recrutement" },
  { domaine: "Formation", valeur: 82, poids: 14, onglet: "Formation & intégration" },
  { domaine: "Rétention", valeur: 69, poids: 20, onglet: "Rétention & turnover" },
  { domaine: "Satisfaction", valeur: 76, poids: 14, onglet: "Satisfaction & climat" },
  { domaine: "Présence", valeur: 84, poids: 12, onglet: "Workforce" },
  { domaine: "Conformité postes critiques", valeur: 81, poids: 14, onglet: "Postes critiques" },
  { domaine: "Réclamations", valeur: 73, poids: 8, onglet: "Réclamations & irritants" },
];

export const HEALTH_SCORE = 78;
export const HEALTH_HISTORIQUE = [72, 73, 75, 76, 75, 77, 78, 79, 78, 78, 79, 78];

export const HEALTH_POSITIFS = [
  "Taux de réussite formation élevé et stable (84 %).",
  "Présence maîtrisée sur l'ensemble des sites hors Bouznika.",
  "Rétention et satisfaction solides sur Berrechid et Aïn Sebaâ.",
];
export const HEALTH_CRITIQUES = [
  "Turnover en hausse de 2,1 pts sur 12 mois, concentré sur Bouskoura.",
  "Couverture insuffisante de plusieurs postes critiques (contrôle final).",
  "Satisfaction transport en baisse continue depuis 5 mois.",
];

export const MENTION_INDICE =
  "Indice synthétique d'aide au pilotage. Il doit être interprété avec les indicateurs détaillés.";

/* ------------------------------------------------------------------ */
/* Synthèse automatique                                                */
/* ------------------------------------------------------------------ */

export const SYNTHESE_MOIS =
  "Le turnover progresse de 2,1 points sur les 12 derniers mois, principalement sur Bouskoura et Bouznika. La satisfaction transport reste le principal irritant identifié. La couverture des postes critiques atteint 81 %, avec 4 postes présentant un niveau de risque élevé. La performance formation reste stable avec 84 % de réussite.";

/* ------------------------------------------------------------------ */
/* Top risques                                                         */
/* ------------------------------------------------------------------ */

export interface RisqueExec {
  id: string;
  rang: string;
  titre: string;
  perimetre: string;
  categorie: string;
  niveau: Etat;
  indicateur: string;
  variation: string;
  facteur: string;
  impact: string;
  tendance: "hausse" | "baisse" | "stable";
  responsable: string;
  echeance: string;
  action: string;
  probabilite: number; // 0-100
  gravite: number; // 0-100
  onglet: string;
}

export const TOP_RISQUES: RisqueExec[] = [
  {
    id: "RSK-01",
    rang: "01",
    titre: "Turnover Bouskoura",
    perimetre: "Site Bouskoura",
    categorie: "Risque turnover",
    niveau: "Critique",
    indicateur: "6,2 % mensuel",
    variation: "+38 % vs trimestre précédent",
    facteur: "Transport",
    impact: "Perte de capacité de production sur les lignes câblage",
    tendance: "hausse",
    responsable: "Directeur site Bouskoura",
    echeance: "30/09/2026",
    action: "Audit des lignes de transport et entretiens de cohorte",
    probabilite: 85,
    gravite: 88,
    onglet: "Rétention & turnover",
  },
  {
    id: "RSK-02",
    rang: "02",
    titre: "Poste critique Contrôle final",
    perimetre: "Berrechid",
    categorie: "Risque poste critique",
    niveau: "Critique",
    indicateur: "Couverture 42 %",
    variation: "Besoin 38 — affectés conformes 16",
    facteur: "Compétence qualité manquante",
    impact: "Exposition qualité client et risque d'arrêt de ligne",
    tendance: "stable",
    responsable: "Direction industrielle",
    echeance: "15/09/2026",
    action: "Accélérer la campagne de recrutement et l'habilitation qualité",
    probabilite: 60,
    gravite: 92,
    onglet: "Postes critiques",
  },
  {
    id: "RSK-03",
    rang: "03",
    titre: "Satisfaction transport",
    perimetre: "Bouskoura",
    categorie: "Risque transport",
    niveau: "Critique",
    indicateur: "2,6 / 5",
    variation: "-18 % en 30 jours",
    facteur: "Ligne TR-BSK-14 — retards récurrents",
    impact: "17 départs associés sur le trimestre",
    tendance: "hausse",
    responsable: "Direction RH",
    echeance: "20/09/2026",
    action: "Audit des lignes et révision des points de ramassage",
    probabilite: 80,
    gravite: 70,
    onglet: "Satisfaction & climat",
  },
  {
    id: "RSK-04",
    rang: "04",
    titre: "Absentéisme groupe CBL-08",
    perimetre: "Bouznika",
    categorie: "Risque absentéisme",
    niveau: "Critique",
    indicateur: "11,8 %",
    variation: "Objectif < 5 %",
    facteur: "Planning et rotations de shift",
    impact: "Cadence de production dégradée",
    tendance: "hausse",
    responsable: "Manager production",
    echeance: "10/09/2026",
    action: "Analyse formateur / planning / transport du groupe",
    probabilite: 75,
    gravite: 62,
    onglet: "Workforce",
  },
  {
    id: "RSK-05",
    rang: "05",
    titre: "Réclamations EPI",
    perimetre: "Multi-sites",
    categorie: "Risque réclamations",
    niveau: "À surveiller",
    indicateur: "+43 % sur 30 jours",
    variation: "61 signalements",
    facteur: "Ruptures d'approvisionnement EPI",
    impact: "Risque sécurité et dégradation du climat",
    tendance: "hausse",
    responsable: "HSE",
    echeance: "05/09/2026",
    action: "Revue du stock EPI et du circuit de dotation",
    probabilite: 65,
    gravite: 55,
    onglet: "Réclamations & irritants",
  },
  {
    id: "RSK-06",
    rang: "06",
    titre: "Recrutement lent Agadir",
    perimetre: "Agadir",
    categorie: "Risque recrutement",
    niveau: "À surveiller",
    indicateur: "Délai 38 jours",
    variation: "Couverture 61 %",
    facteur: "Sourcing local insuffisant",
    impact: "Retard de montée en charge du site",
    tendance: "stable",
    responsable: "Direction RH",
    echeance: "30/09/2026",
    action: "Campagne de sourcing régionale et partenariats OFPPT",
    probabilite: 55,
    gravite: 58,
    onglet: "Recrutement",
  },
  {
    id: "RSK-07",
    rang: "07",
    titre: "Échec formation module Qualité",
    perimetre: "Bouskoura, Bouznika",
    categorie: "Risque formation",
    niveau: "À surveiller",
    indicateur: "Taux d'échec 27 %",
    variation: "+6 pts sur 3 mois",
    facteur: "Module contrôle qualité trop dense",
    impact: "Allongement des parcours et retards d'affectation",
    tendance: "hausse",
    responsable: "Responsable formation",
    echeance: "25/09/2026",
    action: "Refonte du module et renforcement du tutorat",
    probabilite: 60,
    gravite: 45,
    onglet: "Formation & intégration",
  },
  {
    id: "RSK-08",
    rang: "08",
    titre: "Conformité documentaire",
    perimetre: "Multi-sites",
    categorie: "Risque conformité",
    niveau: "À surveiller",
    indicateur: "112 documents critiques manquants",
    variation: "Conformité 81 %",
    facteur: "Habilitations expirées non renouvelées",
    impact: "Affectations bloquées sur postes critiques",
    tendance: "baisse",
    responsable: "Direction RH",
    echeance: "12/09/2026",
    action: "Plan de régularisation documentaire",
    probabilite: 45,
    gravite: 66,
    onglet: "Postes critiques",
  },
];

/* ------------------------------------------------------------------ */
/* Alertes direction                                                   */
/* ------------------------------------------------------------------ */

export interface AlerteDirection {
  id: string;
  titre: string;
  perimetre: string;
  regle: string;
  valeur: string;
  score: number;
  niveau: Etat;
  onglet: string;
}

export const ALERTES_DIRECTION: AlerteDirection[] = [
  { id: "ALT-01", titre: "Turnover site supérieur à l'objectif +20 %", perimetre: "Bouskoura", regle: "Turnover > objectif + 20 %", valeur: "6,2 % vs objectif 4,0 %", score: 92, niveau: "Critique", onglet: "Rétention & turnover" },
  { id: "ALT-02", titre: "Poste critique couverture < 50 %", perimetre: "Berrechid — Contrôle final", regle: "Couverture poste critique < 50 %", valeur: "42 %", score: 89, niveau: "Critique", onglet: "Postes critiques" },
  { id: "ALT-03", titre: "Satisfaction inférieure à 3/5", perimetre: "Bouskoura — Transport", regle: "Satisfaction catégorie < 3", valeur: "2,6 / 5", score: 84, niveau: "Critique", onglet: "Satisfaction & climat" },
  { id: "ALT-04", titre: "Absentéisme supérieur à 10 %", perimetre: "Bouznika — Groupe CBL-08", regle: "Absentéisme groupe > 10 %", valeur: "11,8 %", score: 78, niveau: "Critique", onglet: "Workforce" },
  { id: "ALT-05", titre: "Réclamations critiques doublées", perimetre: "Multi-sites — EPI", regle: "Réclamations critiques x2 sur 30 j", valeur: "+43 %", score: 71, niveau: "Élevée" as unknown as Etat, onglet: "Réclamations & irritants" },
  { id: "ALT-06", titre: "SLA critique dépassé", perimetre: "Bouskoura", regle: "SLA réclamation critique dépassé", valeur: "3 dossiers", score: 68, niveau: "À surveiller", onglet: "Réclamations & irritants" },
  { id: "ALT-07", titre: "Départ massif sur une cohorte", perimetre: "Cohorte Juin 2026 — Bouskoura", regle: "Départs cohorte > 15 %", valeur: "18 départs / 84", score: 66, niveau: "À surveiller", onglet: "Rétention & turnover" },
  { id: "ALT-08", titre: "Formation avec taux d'échec > 25 %", perimetre: "Module Contrôle qualité", regle: "Échec module > 25 %", valeur: "27 %", score: 61, niveau: "À surveiller", onglet: "Formation & intégration" },
  { id: "ALT-09", titre: "Départs liés au transport en hausse", perimetre: "Bouskoura, Bouznika", regle: "Motif transport en hausse > 20 %", valeur: "+27 %", score: 59, niveau: "À surveiller", onglet: "Rétention & turnover" },
  { id: "ALT-10", titre: "Poste critique non conforme", perimetre: "Agadir — Essais électriques", regle: "Conformité poste critique < 80 %", valeur: "76 %", score: 54, niveau: "À surveiller", onglet: "Postes critiques" },
];

/* ------------------------------------------------------------------ */
/* Plans d'action stratégiques                                         */
/* ------------------------------------------------------------------ */

export type StatutPlan = "À lancer" | "En cours" | "En retard" | "Terminé";

export interface PlanAction {
  id: string;
  sujet: string;
  objectif: string;
  responsable: string;
  kpiCible: string;
  valeurDepart: string;
  cible: string;
  valeurActuelle: string;
  echeance: string;
  avancement: number;
  statut: StatutPlan;
  actions: string[];
}

export const PLANS_ACTION: PlanAction[] = [
  {
    id: "PLA-2026-011",
    sujet: "Turnover élevé Bouskoura",
    objectif: "Réduire l'early turnover de 8,4 % à 5 %",
    responsable: "Directeur site",
    kpiCible: "Early turnover",
    valeurDepart: "8,4 %",
    cible: "5,0 %",
    valeurActuelle: "7,6 %",
    echeance: "30/09/2026",
    avancement: 45,
    statut: "En cours",
    actions: ["Analyser le transport", "Entretiens cohortes récentes", "Revoir l'accueil terrain", "Analyser la satisfaction"],
  },
  {
    id: "PLA-2026-012",
    sujet: "Couverture poste contrôle final Berrechid",
    objectif: "Porter la couverture de 42 % à 85 %",
    responsable: "Direction industrielle",
    kpiCible: "Couverture poste critique",
    valeurDepart: "42 %",
    cible: "85 %",
    valeurActuelle: "51 %",
    echeance: "15/10/2026",
    avancement: 32,
    statut: "En cours",
    actions: ["Campagne de recrutement dédiée", "Habilitation qualité accélérée", "Mobilité interne"],
  },
  {
    id: "PLA-2026-013",
    sujet: "Audit transport Bouskoura",
    objectif: "Remonter la satisfaction transport de 2,6 à 3,5",
    responsable: "Direction RH",
    kpiCible: "Satisfaction transport",
    valeurDepart: "2,6 / 5",
    cible: "3,5 / 5",
    valeurActuelle: "2,8 / 5",
    echeance: "20/09/2026",
    avancement: 60,
    statut: "En cours",
    actions: ["Audit des lignes", "Révision des points de ramassage", "Enquête ciblée"],
  },
  {
    id: "PLA-2026-014",
    sujet: "Absentéisme Bouznika",
    objectif: "Ramener l'absentéisme sous 5 %",
    responsable: "Manager production",
    kpiCible: "Absentéisme site",
    valeurDepart: "7,4 %",
    cible: "5,0 %",
    valeurActuelle: "7,4 %",
    echeance: "31/08/2026",
    avancement: 15,
    statut: "En retard",
    actions: ["Analyse des motifs", "Revue des rotations de shift"],
  },
  {
    id: "PLA-2026-009",
    sujet: "Refonte module Contrôle qualité",
    objectif: "Réduire le taux d'échec sous 15 %",
    responsable: "Responsable formation",
    kpiCible: "Taux d'échec module",
    valeurDepart: "27 %",
    cible: "15 %",
    valeurActuelle: "16 %",
    echeance: "31/07/2026",
    avancement: 100,
    statut: "Terminé",
    actions: ["Refonte pédagogique", "Tutorat renforcé"],
  },
];

export const tonPlan = (s: StatutPlan): Ton =>
  s === "Terminé" ? "success" : s === "En retard" ? "critical" : s === "En cours" ? "info" : "neutral";

/* ------------------------------------------------------------------ */
/* Workforce                                                           */
/* ------------------------------------------------------------------ */

export const WORKFORCE_KPI = {
  entrees: 214,
  sorties: 146,
  aIntegrer: 88,
  enFormation: 412,
  confirmes: 19340,
  suspendus: 64,
  postesVacants: 486,
};

export const ANCIENNETE_SEGMENTS = [
  { segment: "< 30 jours", population: 612, turnover: 8.4, satisfaction: 3.5 },
  { segment: "30–90 jours", population: 1148, turnover: 6.1, satisfaction: 3.6 },
  { segment: "3–12 mois", population: 4720, turnover: 3.8, satisfaction: 3.8 },
  { segment: "1–3 ans", population: 8460, turnover: 2.2, satisfaction: 3.9 },
  { segment: "> 3 ans", population: 5478, turnover: 1.4, satisfaction: 4.1 },
];

export const REPARTITION_POSTE = [
  { nom: "Opérateur câblage", valeur: 8420 },
  { nom: "Opérateur assemblage", valeur: 4380 },
  { nom: "Contrôleur qualité", valeur: 2610 },
  { nom: "Opérateur coupe", valeur: 2140 },
  { nom: "Technicien de ligne", valeur: 1480 },
  { nom: "Support / logistique", valeur: 1388 },
];

export const REPARTITION_SHIFT = [
  { nom: "Shift A (matin)", valeur: 8120, absenteisme: 3.4 },
  { nom: "Shift B (après-midi)", valeur: 7460, absenteisme: 4.2 },
  { nom: "Shift C (nuit)", valeur: 4838, absenteisme: 6.1 },
];

/* ------------------------------------------------------------------ */
/* Recrutement                                                         */
/* ------------------------------------------------------------------ */

export const FUNNEL_RECRUTEMENT = [
  { etape: "Besoins", valeur: 486 },
  { etape: "Candidatures", valeur: 2140 },
  { etape: "Présélection", valeur: 1284 },
  { etape: "Entretiens", valeur: 742 },
  { etape: "Retenus", valeur: 386 },
  { etape: "Intégrés", valeur: 316 },
];

export const POSTES_TENSION = [
  { poste: "Contrôleur qualité — contrôle final", site: "Berrechid", critique: true, besoin: 38, recrute: 16, delai: 41, risque: "Critique" as Etat },
  { poste: "Technicien essais électriques", site: "Agadir", critique: true, besoin: 24, recrute: 11, delai: 47, risque: "Critique" as Etat },
  { poste: "Opérateur contrôle final", site: "Bouskoura", critique: true, besoin: 40, recrute: 31, delai: 29, risque: "À surveiller" as Etat },
  { poste: "Opérateur câblage complexe", site: "Bouskoura", critique: false, besoin: 86, recrute: 62, delai: 24, risque: "À surveiller" as Etat },
  { poste: "Opérateur coupe", site: "Bouznika", critique: false, besoin: 44, recrute: 34, delai: 21, risque: "À surveiller" as Etat },
  { poste: "Technicien maintenance", site: "Agadir", critique: true, besoin: 18, recrute: 12, delai: 36, risque: "À surveiller" as Etat },
  { poste: "Opérateur assemblage", site: "Aïn Sebaâ", critique: false, besoin: 52, recrute: 45, delai: 18, risque: "Bon" as Etat },
  { poste: "Magasinier", site: "Berrechid", critique: false, besoin: 16, recrute: 14, delai: 17, risque: "Bon" as Etat },
  { poste: "Opérateur sertissage", site: "Bouskoura", critique: false, besoin: 34, recrute: 25, delai: 26, risque: "À surveiller" as Etat },
  { poste: "Contrôleur réception", site: "Bouznika", critique: true, besoin: 12, recrute: 7, delai: 33, risque: "À surveiller" as Etat },
];

export interface CampagneExec {
  campagne: string;
  site: string;
  objectif: number;
  candidatures: number;
  retenus: number;
  integres: number;
  dateCible: string;
  statut: "En retard" | "Critique" | "Fort volume";
}

export const CAMPAGNES_EXEC: CampagneExec[] = [
  { campagne: "Ramp-up câblage T3", site: "Bouskoura", objectif: 180, candidatures: 640, retenus: 148, integres: 118, dateCible: "15/09/2026", statut: "Fort volume" },
  { campagne: "Contrôle final qualité", site: "Berrechid", objectif: 38, candidatures: 96, retenus: 21, integres: 16, dateCible: "31/08/2026", statut: "Critique" },
  { campagne: "Essais électriques", site: "Agadir", objectif: 24, candidatures: 58, retenus: 14, integres: 11, dateCible: "30/08/2026", statut: "En retard" },
  { campagne: "Coupe & sertissage", site: "Bouznika", objectif: 60, candidatures: 182, retenus: 52, integres: 41, dateCible: "20/09/2026", statut: "En retard" },
  { campagne: "Assemblage renfort", site: "Aïn Sebaâ", objectif: 52, candidatures: 214, retenus: 49, integres: 45, dateCible: "10/10/2026", statut: "Fort volume" },
];

/* ------------------------------------------------------------------ */
/* Postes critiques                                                    */
/* ------------------------------------------------------------------ */

export const POSTES_CRITIQUES_KPI = {
  actifs: 49,
  besoinTotal: 412,
  effectifAffecte: 318,
  ouvriersConformes: 258,
  sousReserve: 44,
  nonConformes: 16,
  affectationsBloquees: 23,
  documentsManquants: 112,
  competencesManquantes: 67,
  habilitationsExpirees: 38,
};

export const POSTES_CRITIQUES_LISTE = [
  "Contrôle final",
  "Essais électriques",
  "Sertissage haute tension",
  "Contrôle réception",
  "Maintenance ligne",
];

/** Heatmap sites × postes critiques : taux de couverture (%) */
export const HEATMAP_POSTES: { site: string; valeurs: Record<string, number> }[] = [
  { site: "Bouskoura", valeurs: { "Contrôle final": 60, "Essais électriques": 78, "Sertissage haute tension": 84, "Contrôle réception": 72, "Maintenance ligne": 88 } },
  { site: "Berrechid", valeurs: { "Contrôle final": 42, "Essais électriques": 91, "Sertissage haute tension": 93, "Contrôle réception": 88, "Maintenance ligne": 90 } },
  { site: "Bouznika", valeurs: { "Contrôle final": 74, "Essais électriques": 66, "Sertissage haute tension": 81, "Contrôle réception": 58, "Maintenance ligne": 86 } },
  { site: "Aïn Sebaâ", valeurs: { "Contrôle final": 82, "Essais électriques": 87, "Sertissage haute tension": 90, "Contrôle réception": 84, "Maintenance ligne": 92 } },
  { site: "Agadir", valeurs: { "Contrôle final": 71, "Essais électriques": 46, "Sertissage haute tension": 77, "Contrôle réception": 69, "Maintenance ligne": 74 } },
];

export const EXCEPTIONS_POSTES_CRITIQUES = [
  { poste: "Contrôle final", site: "Berrechid", besoin: 38, affectes: 22, conformes: 16, couverture: 42, blocage: "Habilitation qualité", risque: "Critique" as Etat },
  { poste: "Essais électriques", site: "Agadir", besoin: 24, affectes: 14, conformes: 11, couverture: 46, blocage: "Compétence technique", risque: "Critique" as Etat },
  { poste: "Contrôle final", site: "Bouskoura", besoin: 40, affectes: 31, conformes: 24, couverture: 60, blocage: "Compétence qualité", risque: "Critique" as Etat },
  { poste: "Contrôle réception", site: "Bouznika", besoin: 12, affectes: 8, conformes: 7, couverture: 58, blocage: "Documents manquants", risque: "À surveiller" as Etat },
  { poste: "Essais électriques", site: "Bouznika", besoin: 15, affectes: 11, conformes: 10, couverture: 66, blocage: "Habilitation expirée", risque: "À surveiller" as Etat },
  { poste: "Contrôle final", site: "Agadir", besoin: 21, affectes: 16, conformes: 15, couverture: 71, blocage: "Documents manquants", risque: "À surveiller" as Etat },
];

/* ------------------------------------------------------------------ */
/* Formation & intégration                                             */
/* ------------------------------------------------------------------ */

export const FORMATION_KPI = {
  enFormation: 412,
  completion: 88,
  reussite: 84,
  echec: 16,
  prolongations: 37,
  parcoursArretes: 21,
  rattrapages: 58,
  presence: 93,
  satisfaction: 4.2,
};

export const REUSSITE_PAR_SITE = FICHES_SITES.map((f) => ({ site: f.site, reussite: f.reussiteFormation }));

export const EVOLUTION_RESULTATS = MOIS_12.map((m, i) => ({
  mois: m,
  reussite: [79, 80, 80, 81, 82, 82, 83, 83, 84, 84, 84, 84][i],
  echec: [21, 20, 20, 19, 18, 18, 17, 17, 16, 16, 16, 16][i],
}));

export const MODULES_DIFFICILES = [
  { module: "Contrôle qualité avancé", echec: 27, participants: 186 },
  { module: "Essais électriques", echec: 24, participants: 118 },
  { module: "Paramétrage coupe", echec: 19, participants: 164 },
  { module: "Sertissage haute tension", echec: 16, participants: 142 },
  { module: "Sécurité & EPI", echec: 8, participants: 412 },
];

export const DEPARTS_FORMATION = MOIS_12.map((m, i) => ({ mois: m, departs: [14, 15, 16, 15, 17, 18, 18, 19, 20, 21, 21, 21][i] }));

export const PARCOURS_RISQUE = [
  { parcours: "Contrôle final — Berrechid", participants: 42, reussite: 68, departs: 7, satisfaction: 3.4, risque: "Critique" as Etat },
  { parcours: "Essais électriques — Agadir", participants: 26, reussite: 71, departs: 4, satisfaction: 3.5, risque: "Critique" as Etat },
  { parcours: "Câblage complexe — Bouskoura", participants: 88, reussite: 78, departs: 9, satisfaction: 3.6, risque: "À surveiller" as Etat },
  { parcours: "Coupe — Bouznika", participants: 54, reussite: 80, departs: 5, satisfaction: 3.7, risque: "À surveiller" as Etat },
  { parcours: "Assemblage — Aïn Sebaâ", participants: 61, reussite: 88, departs: 2, satisfaction: 4.1, risque: "Bon" as Etat },
];

export const EXCEPTIONS_FORMATEURS = [
  { perimetre: "Périmètre formation A — Bouskoura", reponses: 148, satisfaction: 3.2, signalements: 11, tendance: "baisse" as const },
  { perimetre: "Périmètre formation C — Bouznika", reponses: 96, satisfaction: 3.4, signalements: 7, tendance: "baisse" as const },
  { perimetre: "Périmètre formation B — Berrechid", reponses: 132, satisfaction: 4.3, signalements: 1, tendance: "hausse" as const },
];

export const MENTION_FORMATEURS =
  "Indicateurs agrégés par périmètre. Aucune responsabilité individuelle ne peut être établie automatiquement : ces signaux nécessitent une analyse managériale contradictoire.";

/* ------------------------------------------------------------------ */
/* Rétention & turnover                                                */
/* ------------------------------------------------------------------ */

export const RETENTION_KPI = {
  turnoverMensuel: 4.4,
  turnover12: 18.4,
  departs: 146,
  departs30: 34,
  departs90: 52,
  retention30: 91,
  retention90: 84,
  ancienneteMoyenneDepart: 118,
  departsFormation: 21,
  departsApresConfirmation: 79,
};

export const OBJECTIF_TURNOVER = 15;

export const MOTIFS_DEPART_PARETO = [
  { motif: "Transport", part: 24 },
  { motif: "Conditions de travail", part: 18 },
  { motif: "Horaires / shifts", part: 14 },
  { motif: "Opportunité externe", part: 12 },
  { motif: "Problème terrain", part: 10 },
  { motif: "Formation", part: 8 },
  { motif: "Manager / relation", part: 6 },
  { motif: "Autre", part: 8 },
];

export const TURNOVER_SEGMENTS: Record<string, { label: string; valeur: number }[]> = {
  Site: FICHES_SITES.map((f) => ({ label: f.site, valeur: f.turnoverMensuel })),
  Poste: [
    { label: "Opérateur câblage", valeur: 5.2 },
    { label: "Contrôleur qualité", valeur: 3.4 },
    { label: "Opérateur coupe", valeur: 4.8 },
    { label: "Technicien de ligne", valeur: 2.6 },
    { label: "Opérateur assemblage", valeur: 4.1 },
  ],
  Ancienneté: ANCIENNETE_SEGMENTS.map((s) => ({ label: s.segment, valeur: s.turnover })),
  Shift: [
    { label: "Shift A", valeur: 3.2 },
    { label: "Shift B", valeur: 4.3 },
    { label: "Shift C", valeur: 6.4 },
  ],
  Criticité: [
    { label: "Postes critiques", valeur: 3.1 },
    { label: "Postes standards", valeur: 4.8 },
  ],
};

export const COHORTE_JUILLET = [
  { etape: "Retenus", valeur: 214 },
  { etape: "Intégrés", valeur: 198 },
  { etape: "Fin formation", valeur: 183 },
  { etape: "Actifs J+30", valeur: 177 },
  { etape: "Actifs J+60", valeur: 169 },
  { etape: "Actifs J+90", valeur: 162 },
];

export const EARLY_TURNOVER = {
  departs: 34,
  taux: 8.4,
  objectif: 5,
  parSite: [
    { label: "Bouskoura", valeur: 11.9 },
    { label: "Bouznika", valeur: 8.6 },
    { label: "Agadir", valeur: 7.1 },
    { label: "Aïn Sebaâ", valeur: 5.2 },
    { label: "Berrechid", valeur: 4.4 },
  ],
  parPoste: [
    { label: "Opérateur câblage", valeur: 10.2 },
    { label: "Opérateur coupe", valeur: 8.8 },
    { label: "Assemblage", valeur: 7.4 },
    { label: "Contrôle qualité", valeur: 5.1 },
  ],
  parFormation: [
    { label: "Contrôle final", valeur: 12.4 },
    { label: "Câblage complexe", valeur: 9.1 },
    { label: "Coupe", valeur: 7.8 },
    { label: "Assemblage", valeur: 4.9 },
  ],
  parTransport: [
    { label: "Ligne TR-BSK-14", valeur: 14.6 },
    { label: "Ligne TR-BZN-07", valeur: 9.2 },
    { label: "Ligne TR-BER-03", valeur: 4.8 },
    { label: "Sans transport", valeur: 6.1 },
  ],
  parShift: [
    { label: "Shift C", valeur: 12.1 },
    { label: "Shift B", valeur: 8.0 },
    { label: "Shift A", valeur: 5.9 },
  ],
};

/* ------------------------------------------------------------------ */
/* Satisfaction & climat                                               */
/* ------------------------------------------------------------------ */

export const SATISFACTION_KPI = {
  globale: 3.8,
  mood: 3.6,
  participation: 68,
  moodNegatif: 18,
  commentaires: 1284,
  alertes: 14,
};

export const SATISFACTION_30J = Array.from({ length: 15 }, (_, i) => ({
  jour: `J-${28 - i * 2}`,
  score: Math.round((4.0 - i * 0.016 - (i % 3 === 0 ? 0.05 : 0)) * 100) / 100,
}));

export const CATEGORIES_SATISFACTION = [
  { categorie: "Sécurité", score: 4.3 },
  { categorie: "Formation", score: 4.2 },
  { categorie: "Organisation", score: 3.5 },
  { categorie: "Terrain", score: 3.4 },
  { categorie: "Transport", score: 2.9 },
];

export const HEATMAP_SATISFACTION: { site: string; valeurs: Record<string, number> }[] = [
  { site: "Bouskoura", valeurs: { Formation: 4.0, Transport: 2.6, Terrain: 3.1, Sécurité: 4.4, Organisation: 3.3 } },
  { site: "Berrechid", valeurs: { Formation: 4.2, Transport: 3.8, Terrain: 3.9, Sécurité: 4.5, Organisation: 4.0 } },
  { site: "Bouznika", valeurs: { Formation: 4.1, Transport: 3.1, Terrain: 3.4, Sécurité: 4.2, Organisation: 3.2 } },
  { site: "Aïn Sebaâ", valeurs: { Formation: 4.3, Transport: 3.7, Terrain: 3.8, Sécurité: 4.4, Organisation: 3.9 } },
  { site: "Agadir", valeurs: { Formation: 4.1, Transport: 3.3, Terrain: 3.5, Sécurité: 4.2, Organisation: 3.6 } },
];

export const CATEGORIES_HEATMAP = ["Formation", "Transport", "Terrain", "Sécurité", "Organisation"];

export const TOP_IRRITANTS = [
  { irritant: "Transport", signalements: 184, variation: 27, site: "Bouskoura", impactTurnover: "Élevé" },
  { irritant: "Planning", signalements: 83, variation: 9, site: "Bouznika", impactTurnover: "Modéré" },
  { irritant: "EPI", signalements: 61, variation: 43, site: "Multi-sites", impactTurnover: "Modéré" },
  { irritant: "Terrain", signalements: 54, variation: -6, site: "Bouskoura", impactTurnover: "Modéré" },
  { irritant: "Formation", signalements: 38, variation: -12, site: "Agadir", impactTurnover: "Faible" },
];

/* ------------------------------------------------------------------ */
/* Réclamations                                                        */
/* ------------------------------------------------------------------ */

export const RECLAMATIONS_KPI = {
  ouvertes: 68,
  critiques: 9,
  slaDepasse: 3,
  tempsResolution: 3.4,
  satisfactionTraitement: 4.1,
  reouvertures: 6,
  pour1000: 10.4,
};

export const RECLAMATIONS_CATEGORIE = [
  { categorie: "Transport", volume: 184 },
  { categorie: "Planning", volume: 83 },
  { categorie: "EPI", volume: 61 },
  { categorie: "Terrain", volume: 54 },
  { categorie: "Administratif", volume: 47 },
  { categorie: "Formation", volume: 38 },
];

export const RECLAMATIONS_SITE = FICHES_SITES.map((f) => ({
  site: f.site,
  volume: Math.round((f.reclamationsPour1000 * f.effectif) / 1000),
  critiques: f.reclamationsCritiques,
}));

export const RECLAMATIONS_12_SEMAINES = Array.from({ length: 12 }, (_, i) => ({
  semaine: `S${i + 28}`,
  volume: [38, 41, 39, 44, 46, 43, 48, 52, 49, 55, 58, 61][i],
  resolues: [34, 38, 36, 40, 41, 40, 43, 45, 44, 48, 50, 52][i],
}));

export const RESOLUTION_REPARTITION = [
  { type: "Résolution complète", part: 76 },
  { type: "Résolution partielle", part: 17 },
  { type: "Non résolue", part: 7 },
];

export const SATISFACTION_RECLAMATION_CATEGORIE = [
  { categorie: "Administratif", score: 4.4 },
  { categorie: "Formation", score: 4.0 },
  { categorie: "EPI", score: 3.8 },
  { categorie: "Transport", score: 3.2 },
];

/* ------------------------------------------------------------------ */
/* Forecast & prédictif                                                */
/* ------------------------------------------------------------------ */

export const MENTION_FORECAST =
  "Projection indicative basée sur les tendances historiques du MVP. À interpréter comme une aide à la décision, jamais comme une certitude.";

export const FORECAST = [
  { indicateur: "Départs estimés à 30 jours", valeur: "74", fourchette: "62 – 86", facteurs: ["Turnover Bouskoura en hausse", "Cohorte juin fragilisée", "Irritant transport"] },
  { indicateur: "Besoin de recrutement à 30 jours", valeur: "512", fourchette: "470 – 560", facteurs: ["Départs projetés", "Ramp-up câblage T3"] },
  { indicateur: "Couverture postes critiques projetée", valeur: "78 %", fourchette: "74 – 83 %", facteurs: ["Habilitations en attente", "Campagne contrôle final"] },
  { indicateur: "Risque turnover global", valeur: "Élevé", fourchette: "Stable à dégradé", facteurs: ["Satisfaction transport", "Absentéisme Bouznika"] },
];

export const KPI_PREDICTIFS = [
  { kpi: "Population à risque de départ", valeur: "127 ouvriers", facteurs: "Satisfaction basse, absences répétées, ancienneté < 90 jours" },
  { kpi: "Besoins de recrutement anticipés", valeur: "512 postes", facteurs: "Départs projetés + montée en charge T4" },
  { kpi: "Postes critiques à risque de sous-couverture", valeur: "6 postes", facteurs: "Habilitations expirées, délais de sourcing" },
  { kpi: "Groupes de formation à risque", valeur: "4 groupes", facteurs: "Taux d'échec module qualité, absences en session" },
];

/* ------------------------------------------------------------------ */
/* Permissions & confidentialité                                       */
/* ------------------------------------------------------------------ */

export const ROLES_AUTORISES = ["Direction générale", "Direction RH", "Manager national", "Directeur de site", "Responsable stratégique"];

export const PERIMETRES: Record<string, string> = {
  "Direction générale": "Tous les sites",
  "Direction RH": "Tous les sites",
  "Manager national": "Tous les sites",
  "Directeur de site": "Bouskoura",
  "Responsable stratégique": "Tous les sites",
};

export const MENTION_CONFIDENTIALITE =
  "Module agrégé : les commentaires individuels, l'identité des réponses anonymes et les documents personnels ne sont pas exposés. Tout détail nominatif nécessite un drill-down autorisé.";
