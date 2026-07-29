// LEONI WORKFORCE JOURNEY — Données du pôle « Formation » (sessions & suivi, suivi & qualité).
// Source unique : les sessions viennent de src/data/planning.ts, les ouvriers de src/data/leoni.ts.
// Ce fichier n'ajoute QUE les objets propres au suivi (journées, actions correctives, incidents, feedbacks).

/* ------------------------- Suivi quotidien : critères ------------------------- */

export const CRITERES_SUIVI = [
  { cle: "participation", label: "Participation" },
  { cle: "comprehension", label: "Compréhension" },
  { cle: "autonomie", label: "Autonomie" },
  { cle: "qualite", label: "Qualité du travail" },
  { cle: "comportement", label: "Comportement" },
  { cle: "consignes", label: "Respect des consignes" },
  { cle: "securite", label: "Sécurité & EPI" },
] as const;

export type CleCritere = (typeof CRITERES_SUIVI)[number]["cle"];

export type PresenceJour = "Présent" | "Retard" | "Absent justifié" | "Absent non justifié";
export const PRESENCES_JOUR: PresenceJour[] = ["Présent", "Retard", "Absent justifié", "Absent non justifié"];

export interface LigneSuiviJour {
  workerId: string;
  presence: PresenceJour;
  retardMin: number;
  notes: Record<CleCritere, number>; // 1 à 5
  commentaire: string;
  actionCorrective: string;
}

export interface SuiviJour {
  id: string;
  date: string;
  sessionId: string;
  groupe: string;
  formateurId: string;
  statut: "Brouillon" | "Validé";
  lignes: LigneSuiviJour[];
}

export const ACTIONS_CORRECTIVES_TYPES = [
  "Aucune",
  "Accompagnement individuel",
  "Session de renforcement",
  "Rattrapage QCM",
  "Entretien formateur",
  "Rappel consignes sécurité",
  "Signalement RH",
];

/* ------------------------------ Actions correctives -------------------------- */

export const STATUTS_ACTION = ["À faire", "Planifiée", "En cours", "À vérifier", "Terminée", "Annulée"] as const;
export type StatutAction = (typeof STATUTS_ACTION)[number];

export interface ActionCorrective {
  id: string;
  ouvrier: string;
  ouvrierId: string;
  groupe: string;
  origine: string;
  probleme: string;
  action: string;
  responsable: string;
  creee: string;
  echeance: string;
  statut: StatutAction;
  priorite: "Basse" | "Moyenne" | "Haute" | "Critique";
}

export const ACTIONS_CORRECTIVES: ActionCorrective[] = [
  {
    id: "AC-2026-041",
    ouvrier: "Mariam Lahlou",
    ouvrierId: "LMA-BOU-2026-0435",
    groupe: "CBL-07",
    origine: "Test Contrôle qualité",
    probleme: "Score 62 % — inférieur au seuil de 80 %",
    action: "Session de renforcement contrôle final (2 h) puis rattrapage QCM",
    responsable: "Nabil Cherkaoui",
    creee: "27/07/2026",
    echeance: "02/08/2026",
    statut: "Planifiée",
    priorite: "Haute",
  },
  {
    id: "AC-2026-042",
    ouvrier: "Khadija Rami",
    ouvrierId: "LMA-BOU-2026-0395",
    groupe: "CBL-07",
    origine: "QCM Sécurité & EPI",
    probleme: "Score 55 % — sécurité non validée, poste bloqué",
    action: "Reprise du module Sécurité & EPI + rattrapage encadré",
    responsable: "Salma Bennis",
    creee: "28/07/2026",
    echeance: "31/07/2026",
    statut: "En cours",
    priorite: "Critique",
  },
  {
    id: "AC-2026-039",
    ouvrier: "Ayoub Najjar",
    ouvrierId: "LMA-BZK-2026-0088",
    groupe: "CUT-03",
    origine: "Observations formateur (3 négatives)",
    probleme: "Non-respect répété des consignes de sertissage",
    action: "Entretien formateur + démonstration guidée sur poste coupe",
    responsable: "Youssef Tahiri",
    creee: "24/07/2026",
    echeance: "29/07/2026",
    statut: "À vérifier",
    priorite: "Haute",
  },
  {
    id: "AC-2026-036",
    ouvrier: "Hicham Ouali",
    ouvrierId: "LMA-BER-2026-0121",
    groupe: "QC-04",
    origine: "Absences répétées",
    probleme: "3 absences non justifiées sur 10 jours",
    action: "Convocation RH et plan de présence signé",
    responsable: "Nadia El Ghali",
    creee: "22/07/2026",
    echeance: "26/07/2026",
    statut: "Terminée",
    priorite: "Moyenne",
  },
  {
    id: "AC-2026-044",
    ouvrier: "Imane Sabri",
    ouvrierId: "LMA-BOU-2026-0447",
    groupe: "SEC-02",
    origine: "Évaluation pratique",
    probleme: "Cadence insuffisante sur contrôle visuel (68 % de l'objectif)",
    action: "Tutorat par une opératrice confirmée pendant 3 jours",
    responsable: "Salma Bennis",
    creee: "28/07/2026",
    echeance: "05/08/2026",
    statut: "À faire",
    priorite: "Moyenne",
  },
  {
    id: "AC-2026-045",
    ouvrier: "Rachid Talbi",
    ouvrierId: "LMA-BZK-2026-0093",
    groupe: "CUT-03",
    origine: "Incident matériel",
    probleme: "Utilisation d'une presse sans contrôle préalable",
    action: "Re-briefing sécurité machine avant reprise de poste",
    responsable: "Youssef Tahiri",
    creee: "26/07/2026",
    echeance: "30/07/2026",
    statut: "En cours",
    priorite: "Critique",
  },
  {
    id: "AC-2026-030",
    ouvrier: "Fatima Zahra Idrissi",
    ouvrierId: "LMA-BER-2026-0134",
    groupe: "QC-04",
    origine: "Feedback formation",
    probleme: "Support de cours AQL jugé incomplet par le groupe",
    action: "Mise à jour du support et re-diffusion aux 12 participants",
    responsable: "Nabil Cherkaoui",
    creee: "20/07/2026",
    echeance: "24/07/2026",
    statut: "Terminée",
    priorite: "Basse",
  },
  {
    id: "AC-2026-046",
    ouvrier: "Yassine Bennani",
    ouvrierId: "LMA-BOU-2026-0402",
    groupe: "CBL-08",
    origine: "Suivi quotidien",
    probleme: "Autonomie 2/5 sur préparation composants depuis 4 jours",
    action: "Accompagnement individuel quotidien (30 min) pendant 1 semaine",
    responsable: "Salma Bennis",
    creee: "27/07/2026",
    echeance: "03/08/2026",
    statut: "Planifiée",
    priorite: "Moyenne",
  },
  {
    id: "AC-2026-047",
    ouvrier: "Sara Amrani",
    ouvrierId: "LMA-BOU-2026-0418",
    groupe: "CBL-07",
    origine: "Contrôle qualité ligne",
    probleme: "2 défauts de sertissage détectés lors du contrôle final",
    action: "Reprise ciblée du module Contrôle visuel",
    responsable: "Salma Bennis",
    creee: "28/07/2026",
    echeance: "04/08/2026",
    statut: "À faire",
    priorite: "Moyenne",
  },
  {
    id: "AC-2026-034",
    ouvrier: "Anas El Fassi",
    ouvrierId: "LMA-BZN-2026-0208",
    groupe: "CUT-03",
    origine: "Retards répétés",
    probleme: "5 retards de plus de 15 min en deux semaines",
    action: "Rappel du règlement + point hebdomadaire de ponctualité",
    responsable: "Nadia El Ghali",
    creee: "21/07/2026",
    echeance: "25/07/2026",
    statut: "Annulée",
    priorite: "Basse",
  },
  {
    id: "AC-2026-048",
    ouvrier: "Mehdi Berrada",
    ouvrierId: "LMA-BER-2026-0312",
    groupe: "QC-04",
    origine: "QCM Lecture d'instructions",
    probleme: "Score 64 % — compréhension des plans insuffisante",
    action: "Atelier lecture de plans (3 h) avant rattrapage",
    responsable: "Nabil Cherkaoui",
    creee: "28/07/2026",
    echeance: "01/08/2026",
    statut: "Planifiée",
    priorite: "Haute",
  },
];

/* ---------------------------------- Incidents -------------------------------- */

export const TYPES_INCIDENT = [
  "Sécurité",
  "Matériel",
  "Organisation",
  "Qualité",
  "Comportement",
  "Santé / malaise",
  "Autre",
] as const;
export type TypeIncident = (typeof TYPES_INCIDENT)[number];

export interface Incident {
  id: string;
  date: string;
  type: TypeIncident;
  sessionId: string;
  session: string;
  groupe: string;
  site: string;
  ouvrier: string;
  ouvrierId?: string;
  description: string;
  gravite: "Mineure" | "Modérée" | "Majeure" | "Critique";
  responsable: string;
  actionImmediate: string;
  statut: "Ouvert" | "En traitement" | "Clôturé";
}

export const INCIDENTS: Incident[] = [
  {
    id: "INC-2026-012",
    date: "27/07/2026",
    type: "Sécurité",
    sessionId: "SES-1042",
    session: "Sécurité industrielle & EPI — EPI",
    groupe: "SEC-02",
    site: "Bouskoura",
    ouvrier: "Rachid Talbi",
    ouvrierId: "LMA-BZK-2026-0093",
    description: "Manipulation d'une presse de sertissage sans lunettes de protection pendant la démonstration.",
    gravite: "Majeure",
    responsable: "Youssef Tahiri",
    actionImmediate: "Arrêt immédiat de l'exercice, re-briefing EPI du groupe entier.",
    statut: "En traitement",
  },
  {
    id: "INC-2026-013",
    date: "28/07/2026",
    type: "Santé / malaise",
    sessionId: "SES-1051",
    session: "Intégration opérateur câblage — Techniques assemblage",
    groupe: "CBL-07",
    site: "Bouskoura",
    ouvrier: "Khadija Rami",
    ouvrierId: "LMA-BOU-2026-0395",
    description: "Malaise en fin de matinée, prise en charge par l'infirmerie du site.",
    gravite: "Modérée",
    responsable: "Salma Bennis",
    actionImmediate: "Accompagnement infirmerie, session reportée pour la participante.",
    statut: "Clôturé",
  },
  {
    id: "INC-2026-014",
    date: "28/07/2026",
    type: "Matériel",
    sessionId: "SES-1067",
    session: "Contrôleur qualité — Défauthèque",
    groupe: "QC-04",
    site: "Berrechid",
    ouvrier: "—",
    description: "Vidéoprojecteur de la salle Qualité 1 hors service : support projeté indisponible.",
    gravite: "Mineure",
    responsable: "Nabil Cherkaoui",
    actionImmediate: "Basculement en salle Qualité 2, ticket maintenance ouvert.",
    statut: "Ouvert",
  },
];

/* ---------------------------------- Feedbacks -------------------------------- */

export const CATEGORIES_FEEDBACK = [
  "Formation",
  "Formateur",
  "Organisation",
  "Matériel / EPI",
  "Compréhension",
  "Conditions de formation",
] as const;
export type CategorieFeedback = (typeof CATEGORIES_FEEDBACK)[number];

export interface FeedbackFormation {
  id: string;
  date: string;
  ouvrier: string;
  ouvrierId?: string;
  groupe: string;
  site: string;
  categorie: CategorieFeedback;
  sentiment: "Positif" | "Neutre" | "Critique";
  message: string;
  traite: boolean;
}

export const FEEDBACKS_FORMATION: FeedbackFormation[] = [
  {
    id: "FB-2026-101",
    date: "28/07/2026",
    ouvrier: "Sara Amrani",
    ouvrierId: "LMA-BOU-2026-0418",
    groupe: "CBL-07",
    site: "Bouskoura",
    categorie: "Formation",
    sentiment: "Positif",
    message: "La partie pratique était très claire, les démonstrations aident beaucoup.",
    traite: true,
  },
  {
    id: "FB-2026-102",
    date: "28/07/2026",
    ouvrier: "Khadija Rami",
    ouvrierId: "LMA-BOU-2026-0395",
    groupe: "CBL-07",
    site: "Bouskoura",
    categorie: "Matériel / EPI",
    sentiment: "Critique",
    message: "Je n'ai pas reçu les équipements nécessaires (gants taille S) avant l'atelier.",
    traite: false,
  },
  {
    id: "FB-2026-103",
    date: "27/07/2026",
    ouvrier: "Hicham Ouali",
    ouvrierId: "LMA-BER-2026-0121",
    groupe: "QC-04",
    site: "Berrechid",
    categorie: "Compréhension",
    sentiment: "Neutre",
    message: "Le module AQL va un peu vite, il faudrait plus d'exemples chiffrés.",
    traite: false,
  },
  {
    id: "FB-2026-104",
    date: "27/07/2026",
    ouvrier: "Imane Sabri",
    ouvrierId: "LMA-BOU-2026-0447",
    groupe: "SEC-02",
    site: "Bouskoura",
    categorie: "Formateur",
    sentiment: "Positif",
    message: "Salma explique très bien et prend le temps de revenir sur les points difficiles.",
    traite: true,
  },
  {
    id: "FB-2026-105",
    date: "26/07/2026",
    ouvrier: "Ayoub Najjar",
    ouvrierId: "LMA-BZK-2026-0088",
    groupe: "CUT-03",
    site: "Bouznika",
    categorie: "Conditions de formation",
    sentiment: "Critique",
    message: "L'atelier coupe est très bruyant, difficile de suivre les consignes orales.",
    traite: false,
  },
  {
    id: "FB-2026-106",
    date: "26/07/2026",
    ouvrier: "Fatima Zahra Idrissi",
    ouvrierId: "LMA-BER-2026-0134",
    groupe: "QC-04",
    site: "Berrechid",
    categorie: "Organisation",
    sentiment: "Neutre",
    message: "Les horaires changent parfois la veille, ce serait bien d'être prévenues plus tôt.",
    traite: true,
  },
  {
    id: "FB-2026-107",
    date: "25/07/2026",
    ouvrier: "Yassine Bennani",
    ouvrierId: "LMA-BOU-2026-0402",
    groupe: "CBL-08",
    site: "Bouskoura",
    categorie: "Formation",
    sentiment: "Positif",
    message: "Les fiches d'instructions simplifiées sont vraiment utiles sur poste.",
    traite: true,
  },
];

/* --------------------------- Suivis quotidiens existants ---------------------- */

const notes = (v: number[]): Record<CleCritere, number> => ({
  participation: v[0],
  comprehension: v[1],
  autonomie: v[2],
  qualite: v[3],
  comportement: v[4],
  consignes: v[5],
  securite: v[6],
});

export const SUIVIS_INITIAUX: SuiviJour[] = [
  {
    id: "SUI-2026-0181",
    date: "2026-07-28",
    sessionId: "",
    groupe: "CBL-07",
    formateurId: "FRM-01",
    statut: "Validé",
    lignes: [
      {
        workerId: "LMA-BOU-2026-0418",
        presence: "Présent",
        retardMin: 0,
        notes: notes([5, 5, 4, 5, 5, 5, 5]),
        commentaire: "Très bonne autonomie sur les opérations d'assemblage.",
        actionCorrective: "Aucune",
      },
      {
        workerId: "LMA-BOU-2026-0435",
        presence: "Retard",
        retardMin: 12,
        notes: notes([3, 3, 2, 3, 4, 3, 4]),
        commentaire: "Difficultés sur le contrôle final, gestes à sécuriser.",
        actionCorrective: "Session de renforcement",
      },
      {
        workerId: "LMA-BOU-2026-0395",
        presence: "Absent justifié",
        retardMin: 0,
        notes: notes([0, 0, 0, 0, 0, 0, 0]),
        commentaire: "Absence justifiée — certificat médical remis.",
        actionCorrective: "Rattrapage QCM",
      },
    ],
  },
];

/* ------------------------------ Alertes formation ----------------------------- */

export const TYPES_ALERTE_FORMATION = [
  "Score faible",
  "Absences répétées",
  "Retards",
  "Échec évaluation",
  "Sécurité non validée",
  "Observation négative répétée",
  "Compétence non acquise",
  "Action corrective en retard",
  "Incident",
] as const;
export type TypeAlerteFormation = (typeof TYPES_ALERTE_FORMATION)[number];

export interface AlerteFormation {
  id: string;
  date: string;
  ouvrier: string;
  ouvrierId?: string;
  groupe: string;
  type: TypeAlerteFormation;
  origine: string;
  priorite: "Basse" | "Moyenne" | "Haute" | "Critique";
  responsable: string;
  statut: "Ouverte" | "En traitement" | "Résolue";
  action: string;
}

export const ALERTES_FORMATION: AlerteFormation[] = [
  {
    id: "ALF-2026-201",
    date: "28/07/2026",
    ouvrier: "Khadija Rami",
    ouvrierId: "LMA-BOU-2026-0395",
    groupe: "CBL-07",
    type: "Sécurité non validée",
    origine: "QCM Sécurité & EPI — 55 %",
    priorite: "Critique",
    responsable: "Salma Bennis",
    statut: "En traitement",
    action: "Rattrapage encadré programmé le 31/07",
  },
  {
    id: "ALF-2026-202",
    date: "28/07/2026",
    ouvrier: "Mariam Lahlou",
    ouvrierId: "LMA-BOU-2026-0435",
    groupe: "CBL-07",
    type: "Score faible",
    origine: "Test Contrôle qualité — 62 %",
    priorite: "Haute",
    responsable: "Nabil Cherkaoui",
    statut: "Ouverte",
    action: "Session de renforcement à planifier",
  },
  {
    id: "ALF-2026-203",
    date: "27/07/2026",
    ouvrier: "Hicham Ouali",
    ouvrierId: "LMA-BER-2026-0121",
    groupe: "QC-04",
    type: "Absences répétées",
    origine: "3 absences non justifiées / 10 jours",
    priorite: "Haute",
    responsable: "Nadia El Ghali",
    statut: "Résolue",
    action: "Plan de présence signé",
  },
  {
    id: "ALF-2026-204",
    date: "27/07/2026",
    ouvrier: "Ayoub Najjar",
    ouvrierId: "LMA-BZK-2026-0088",
    groupe: "CUT-03",
    type: "Observation négative répétée",
    origine: "3 observations négatives consécutives",
    priorite: "Haute",
    responsable: "Youssef Tahiri",
    statut: "En traitement",
    action: "Entretien formateur réalisé, vérification en cours",
  },
  {
    id: "ALF-2026-205",
    date: "26/07/2026",
    ouvrier: "Anas El Fassi",
    ouvrierId: "LMA-BZN-2026-0208",
    groupe: "CUT-03",
    type: "Retards",
    origine: "5 retards > 15 min",
    priorite: "Moyenne",
    responsable: "Nadia El Ghali",
    statut: "Résolue",
    action: "Rappel du règlement intérieur",
  },
  {
    id: "ALF-2026-206",
    date: "26/07/2026",
    ouvrier: "Rachid Talbi",
    ouvrierId: "LMA-BZK-2026-0093",
    groupe: "CUT-03",
    type: "Incident",
    origine: "INC-2026-012 — presse sans EPI",
    priorite: "Critique",
    responsable: "Youssef Tahiri",
    statut: "En traitement",
    action: "Re-briefing sécurité avant reprise",
  },
  {
    id: "ALF-2026-207",
    date: "25/07/2026",
    ouvrier: "Imane Sabri",
    ouvrierId: "LMA-BOU-2026-0447",
    groupe: "SEC-02",
    type: "Compétence non acquise",
    origine: "Contrôle visuel — niveau 2/4",
    priorite: "Moyenne",
    responsable: "Salma Bennis",
    statut: "Ouverte",
    action: "Tutorat à mettre en place",
  },
  {
    id: "ALF-2026-208",
    date: "25/07/2026",
    ouvrier: "Mehdi Berrada",
    ouvrierId: "LMA-BER-2026-0312",
    groupe: "QC-04",
    type: "Échec évaluation",
    origine: "QCM Lecture d'instructions — 64 %",
    priorite: "Haute",
    responsable: "Nabil Cherkaoui",
    statut: "Ouverte",
    action: "Atelier lecture de plans puis rattrapage",
  },
  {
    id: "ALF-2026-209",
    date: "24/07/2026",
    ouvrier: "Ayoub Najjar",
    ouvrierId: "LMA-BZK-2026-0088",
    groupe: "CUT-03",
    type: "Action corrective en retard",
    origine: "AC-2026-039 — échéance 29/07",
    priorite: "Moyenne",
    responsable: "Youssef Tahiri",
    statut: "Ouverte",
    action: "Relance du responsable",
  },
];

/* ------------------------------ Séries graphiques ----------------------------- */

export const OBSERVATIONS_PAR_TON = [
  { nom: "Positive", valeur: 68 },
  { nom: "Neutre", valeur: 32 },
  { nom: "À surveiller", valeur: 12 },
  { nom: "Négative", valeur: 11 },
  { nom: "Critique", valeur: 3 },
];

export const EVOLUTION_ALERTES = [
  { semaine: "S26", ouvertes: 12, resolues: 9 },
  { semaine: "S27", ouvertes: 15, resolues: 11 },
  { semaine: "S28", ouvertes: 19, resolues: 13 },
  { semaine: "S29", ouvertes: 18, resolues: 16 },
  { semaine: "S30", ouvertes: 18, resolues: 14 },
];

export const INCIDENTS_PAR_FORMATION = [
  { nom: "Intégration câblage", valeur: 4 },
  { nom: "Contrôleur qualité", valeur: 2 },
  { nom: "Opérateur coupe", valeur: 5 },
  { nom: "Sécurité & EPI", valeur: 3 },
];
