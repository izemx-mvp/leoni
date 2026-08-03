// LEONI WORKFORCE JOURNEY — jeu de données de démonstration.
// Toutes les personnes, matricules, scores et événements sont fictifs.

import { DOSSIER_DEMO, dossierPourOuvrier, type DossierOnboarding } from "@/data/onboarding";


export const SITES = [
  "Aïn Sebaâ",
  "Bouskoura",
  "Bouskoura – Ouled Saleh",
  "Berrechid",
  "Bouznika",
  "Agadir",
] as const;

export const SITES_PARAMETRAGE = [...SITES, "Kénitra – futur site"];

export type Site = (typeof SITES)[number];

export const UTILISATEUR = {
  nom: "Amina Rajouh",
  role: "Responsable RH Maroc",
  perimetre: "Tous les sites",
  initiales: "NE",
};

/* ------------------------------------------------------------------ */
/* Candidats                                                           */
/* ------------------------------------------------------------------ */

export type StatutCandidature =
  | "Décision en attente"
  | "Entretien planifié"
  | "Entretien requis"
  | "Analyse RH"
  | "Revue RH"
  | "Décision RH"
  | "Présélectionnée"
  | "Présélectionné"
  | "Nouvelle candidature"
  | "Brouillon"
  | "Retenu"
  | "Refusé"
  | "Vivier";

export interface ScoreDetail {
  label: string;
  valeur: number;
}

export interface Candidat {
  id: string;
  nom: string;
  poste: string;
  site: Site;
  ville: string;
  source: string;
  date: string;
  score: number;
  recommandation: string;
  entretien: string;
  statut: StatutCandidature;
  recruteur: string;
  telephone: string;
  email: string;
  formation: string;
  experience: string;
  competences: string[];
  disponibilite: string;
  mobilite: string;
  langues: string;
  documents: { nom: string; date: string; statut: string }[];
  detailScore: ScoreDetail[];
  forces: string[];
  vigilances: string[];
  ouvrierId?: string;
  origine?: "IA" | "Manuelle" | "Import";
  brouillon?: boolean;
  cin?: string;
  dateNaissance?: string;
  adresse?: string;
  niveauEtude?: string;
  permis?: string;
  shift?: string;
  commentaireRH?: string;
  experiences?: { poste: string; entreprise: string; ville: string; periode: string; duree: string; competences: string[] }[];
  tracabilite?: { champ: string; source: string; confiance?: number }[];
  audit?: { date: string; heure: string; libelle: string }[];
}


export const CANDIDATS: Candidat[] = [
  {
    id: "CAN-2026-01248",
    nom: "Sara Amrani",
    poste: "Opératrice câblage",
    site: "Bouskoura",
    ville: "Casablanca",
    source: "Portail carrière",
    date: "18/07/2026",
    score: 91,
    recommandation: "Fortement recommandée",
    entretien: "Entretien réalisé",
    statut: "Décision en attente",
    recruteur: "Yassine Alaoui",
    telephone: "+212 6 61 04 18 22",
    email: "sara.amrani@example.ma",
    formation: "Baccalauréat scientifique + formation OFPPT électricité",
    experience: "2 ans en assemblage de faisceaux électriques",
    competences: ["Assemblage", "Lecture de plans", "Contrôle visuel", "Sécurité EPI"],
    disponibilite: "Immédiate",
    mobilite: "Casablanca et périphérie",
    langues: "Arabe (natif), Français (courant), Anglais (élémentaire)",
    documents: [
      { nom: "CV", date: "18/07/2026", statut: "Vérifié" },
      { nom: "CIN", date: "18/07/2026", statut: "Vérifié" },
      { nom: "Diplôme OFPPT", date: "18/07/2026", statut: "Vérifié" },
    ],
    detailScore: [
      { label: "Adéquation poste", valeur: 94 },
      { label: "Expérience", valeur: 86 },
      { label: "Apprentissage", valeur: 92 },
      { label: "Disponibilité", valeur: 100 },
      { label: "Mobilité", valeur: 88 },
      { label: "Comportement", valeur: 89 },
    ],
    forces: [
      "Expérience industrielle",
      "Apprentissage rapide",
      "Disponibilité immédiate",
      "Bonne stabilité",
      "Forte compatibilité",
    ],
    vigilances: ["Contrôle final à renforcer", "Anglais élémentaire"],
    ouvrierId: "LMA-BOU-2026-0418",
  },
  {
    id: "CAN-2026-01249",
    nom: "Youssef El Mansouri",
    poste: "Contrôleur qualité",
    site: "Berrechid",
    ville: "Settat",
    source: "Cooptation",
    date: "19/07/2026",
    score: 84,
    recommandation: "Recommandé",
    entretien: "Planifié",
    statut: "Entretien planifié",
    recruteur: "Imane El Fassi",
    telephone: "+212 6 62 77 31 05",
    email: "y.elmansouri@example.ma",
    formation: "DUT Génie industriel",
    experience: "3 ans en contrôle qualité sous-traitance automobile",
    competences: ["Contrôle dimensionnel", "AQL", "Reporting qualité"],
    disponibilite: "Sous 15 jours",
    mobilite: "Région Casablanca-Settat",
    langues: "Arabe, Français (courant)",
    documents: [
      { nom: "CV", date: "19/07/2026", statut: "Vérifié" },
      { nom: "CIN", date: "19/07/2026", statut: "Vérifié" },
    ],
    detailScore: [
      { label: "Adéquation poste", valeur: 88 },
      { label: "Expérience", valeur: 90 },
      { label: "Apprentissage", valeur: 80 },
      { label: "Disponibilité", valeur: 74 },
      { label: "Mobilité", valeur: 82 },
      { label: "Comportement", valeur: 85 },
    ],
    forces: ["Expérience qualité solide", "Rigueur documentaire"],
    vigilances: ["Disponibilité différée", "Peu d'expérience câblage"],
  },
  {
    id: "CAN-2026-01250",
    nom: "Imane Zahraoui",
    poste: "Opératrice assemblage",
    site: "Bouskoura",
    ville: "Casablanca",
    source: "Agence",
    date: "19/07/2026",
    score: 76,
    recommandation: "Sous réserve",
    entretien: "À planifier",
    statut: "Entretien requis",
    recruteur: "Yassine Alaoui",
    telephone: "+212 6 70 12 44 90",
    email: "imane.zahraoui@example.ma",
    formation: "Baccalauréat technique",
    experience: "1 an en atelier textile",
    competences: ["Travail en série", "Dextérité", "Travail en équipe"],
    disponibilite: "Immédiate",
    mobilite: "Casablanca",
    langues: "Arabe, Français (intermédiaire)",
    documents: [
      { nom: "CV", date: "19/07/2026", statut: "Vérifié" },
      { nom: "CIN", date: "19/07/2026", statut: "À fournir" },
    ],
    detailScore: [
      { label: "Adéquation poste", valeur: 78 },
      { label: "Expérience", valeur: 62 },
      { label: "Apprentissage", valeur: 84 },
      { label: "Disponibilité", valeur: 100 },
      { label: "Mobilité", valeur: 76 },
      { label: "Comportement", valeur: 80 },
    ],
    forces: ["Bonne dextérité", "Disponibilité immédiate"],
    vigilances: ["Expérience automobile absente", "CIN manquante"],
  },
  {
    id: "CAN-2026-01251",
    nom: "Hamza Alaoui",
    poste: "Opérateur coupe",
    site: "Bouznika",
    ville: "Mohammedia",
    source: "Campagne",
    date: "20/07/2026",
    score: 58,
    recommandation: "À examiner",
    entretien: "Non requis",
    statut: "Analyse RH",
    recruteur: "Salma Berrada",
    telephone: "+212 6 55 90 12 33",
    email: "hamza.alaoui@example.ma",
    formation: "Niveau baccalauréat",
    experience: "Sans expérience industrielle",
    competences: ["Ponctualité", "Motivation"],
    disponibilite: "Immédiate",
    mobilite: "Mohammedia – Bouznika",
    langues: "Arabe, Français (notions)",
    documents: [{ nom: "CV", date: "20/07/2026", statut: "Vérifié" }],
    detailScore: [
      { label: "Adéquation poste", valeur: 60 },
      { label: "Expérience", valeur: 30 },
      { label: "Apprentissage", valeur: 70 },
      { label: "Disponibilité", valeur: 100 },
      { label: "Mobilité", valeur: 65 },
      { label: "Comportement", valeur: 72 },
    ],
    forces: ["Grande disponibilité", "Motivation exprimée"],
    vigilances: ["Aucune expérience industrielle", "Formation longue nécessaire"],
  },
  {
    id: "CAN-2026-01252",
    nom: "Salma Chafai",
    poste: "Opératrice câblage",
    site: "Aïn Sebaâ",
    ville: "Casablanca",
    source: "Email",
    date: "20/07/2026",
    score: 42,
    recommandation: "Non recommandée",
    entretien: "-",
    statut: "Revue RH",
    recruteur: "Imane El Fassi",
    telephone: "+212 6 44 18 77 21",
    email: "salma.chafai@example.ma",
    formation: "Collège",
    experience: "Sans expérience",
    competences: ["Travail en équipe"],
    disponibilite: "Sous 1 mois",
    mobilite: "Aïn Sebaâ uniquement",
    langues: "Arabe",
    documents: [{ nom: "CV", date: "20/07/2026", statut: "Incomplet" }],
    detailScore: [
      { label: "Adéquation poste", valeur: 44 },
      { label: "Expérience", valeur: 20 },
      { label: "Apprentissage", valeur: 55 },
      { label: "Disponibilité", valeur: 60 },
      { label: "Mobilité", valeur: 40 },
      { label: "Comportement", valeur: 62 },
    ],
    forces: ["Motivation"],
    vigilances: ["Dossier incomplet", "Profil éloigné du besoin"],
  },
  {
    id: "CAN-2026-01253",
    nom: "Mehdi Berrada",
    poste: "Technicien ligne",
    site: "Berrechid",
    ville: "Berrechid",
    source: "Portail",
    date: "16/07/2026",
    score: 88,
    recommandation: "Fortement recommandé",
    entretien: "Réalisé",
    statut: "Décision RH",
    recruteur: "Hamza Idrissi",
    telephone: "+212 6 12 08 66 47",
    email: "mehdi.berrada@example.ma",
    formation: "BTS Maintenance industrielle",
    experience: "4 ans en ligne de production",
    competences: ["Maintenance niveau 1", "Réglages ligne", "TPM"],
    disponibilite: "Immédiate",
    mobilite: "Berrechid – Settat",
    langues: "Arabe, Français (courant)",
    documents: [
      { nom: "CV", date: "16/07/2026", statut: "Vérifié" },
      { nom: "CIN", date: "16/07/2026", statut: "Vérifié" },
    ],
    detailScore: [
      { label: "Adéquation poste", valeur: 90 },
      { label: "Expérience", valeur: 92 },
      { label: "Apprentissage", valeur: 84 },
      { label: "Disponibilité", valeur: 100 },
      { label: "Mobilité", valeur: 80 },
      { label: "Comportement", valeur: 86 },
    ],
    forces: ["Expérience ligne confirmée", "Autonomie technique"],
    vigilances: ["Exigence salariale à valider"],
    ouvrierId: "LMA-BER-2026-0312",
  },
  {
    id: "CAN-2026-01254",
    nom: "Aya Benomar",
    poste: "Opératrice contrôle",
    site: "Bouznika",
    ville: "Rabat",
    source: "Établissement partenaire",
    date: "21/07/2026",
    score: 69,
    recommandation: "Entretien requis",
    entretien: "À planifier",
    statut: "Présélectionnée",
    recruteur: "Salma Berrada",
    telephone: "+212 6 33 55 02 18",
    email: "aya.benomar@example.ma",
    formation: "Bac + formation qualité",
    experience: "Stage de 6 mois en contrôle",
    competences: ["Contrôle visuel", "Traçabilité"],
    disponibilite: "Sous 1 semaine",
    mobilite: "Rabat – Bouznika",
    langues: "Arabe, Français (courant)",
    documents: [{ nom: "CV", date: "21/07/2026", statut: "Vérifié" }],
    detailScore: [
      { label: "Adéquation poste", valeur: 72 },
      { label: "Expérience", valeur: 55 },
      { label: "Apprentissage", valeur: 80 },
      { label: "Disponibilité", valeur: 85 },
      { label: "Mobilité", valeur: 66 },
      { label: "Comportement", valeur: 78 },
    ],
    forces: ["Formation qualité récente", "Bonne présentation"],
    vigilances: ["Expérience limitée", "Trajet quotidien important"],
  },
  {
    id: "CAN-2026-01255",
    nom: "Rachid El Idrissi",
    poste: "Opérateur câblage",
    site: "Agadir",
    ville: "Agadir",
    source: "Campagne locale",
    date: "21/07/2026",
    score: 81,
    recommandation: "Recommandé",
    entretien: "-",
    statut: "Présélectionné",
    recruteur: "Hanane Tazi",
    telephone: "+212 6 88 41 09 76",
    email: "r.elidrissi@example.ma",
    formation: "Bac professionnel électrotechnique",
    experience: "18 mois en câblage",
    competences: ["Câblage", "Sertissage", "Lecture de plans"],
    disponibilite: "Immédiate",
    mobilite: "Agadir",
    langues: "Arabe, Français (intermédiaire)",
    documents: [
      { nom: "CV", date: "21/07/2026", statut: "Vérifié" },
      { nom: "CIN", date: "21/07/2026", statut: "Vérifié" },
    ],
    detailScore: [
      { label: "Adéquation poste", valeur: 86 },
      { label: "Expérience", valeur: 78 },
      { label: "Apprentissage", valeur: 82 },
      { label: "Disponibilité", valeur: 100 },
      { label: "Mobilité", valeur: 70 },
      { label: "Comportement", valeur: 80 },
    ],
    forces: ["Expérience câblage directe", "Ancrage local"],
    vigilances: ["Mobilité inter-sites limitée"],
  },
];

/* ------------------------------------------------------------------ */
/* Entretiens                                                          */
/* ------------------------------------------------------------------ */

export interface Entretien {
  id: string;
  candidatId: string;
  candidat: string;
  date: string;
  heure: string;
  type: string;
  statut: "Réalisé" | "Planifié" | "Confirmé" | "À confirmer";
  note?: number;
  evaluateur: string;
  site: Site;
}

export const ENTRETIENS: Entretien[] = [
  {
    id: "ENT-0431",
    candidatId: "CAN-2026-01248",
    candidat: "Sara Amrani",
    date: "2026-07-28",
    heure: "09:00",
    type: "Entretien RH",
    statut: "Réalisé",
    note: 4.6,
    evaluateur: "Yassine Alaoui",
    site: "Bouskoura",
  },
  {
    id: "ENT-0432",
    candidatId: "CAN-2026-01249",
    candidat: "Youssef El Mansouri",
    date: "2026-07-29",
    heure: "10:30",
    type: "Entretien technique",
    statut: "Planifié",
    evaluateur: "Imane El Fassi",
    site: "Berrechid",
  },
  {
    id: "ENT-0433",
    candidatId: "CAN-2026-01250",
    candidat: "Imane Zahraoui",
    date: "2026-07-30",
    heure: "14:00",
    type: "Entretien RH",
    statut: "Confirmé",
    evaluateur: "Yassine Alaoui",
    site: "Bouskoura",
  },
  {
    id: "ENT-0434",
    candidatId: "CAN-2026-01253",
    candidat: "Mehdi Berrada",
    date: "2026-07-27",
    heure: "11:00",
    type: "Entretien technique",
    statut: "Réalisé",
    note: 4.4,
    evaluateur: "Hamza Idrissi",
    site: "Berrechid",
  },
  {
    id: "ENT-0435",
    candidatId: "CAN-2026-01254",
    candidat: "Aya Benomar",
    date: "2026-07-31",
    heure: "09:30",
    type: "Entretien collectif",
    statut: "À confirmer",
    evaluateur: "Salma Berrada",
    site: "Bouznika",
  },
];

export const CRITERES_ENTRETIEN = [
  "Motivation",
  "Communication",
  "Compréhension poste",
  "Disponibilité",
  "Comportement",
  "Capacité d'apprentissage",
  "Respect des consignes",
  "Potentiel",
];

/* ------------------------------------------------------------------ */
/* Ouvriers                                                            */
/* ------------------------------------------------------------------ */

export type StatutOuvrier =
  | "À intégrer"
  | "En formation"
  | "À évaluer"
  | "À confirmer"
  | "Confirmé"
  | "À risque"
  | "Suspendu"
  | "Parcours arrêté";

export type Risque = "Faible" | "Moyen" | "Élevé" | "Critique";

export interface JourneeFormation {
  date: string;
  jour: number;
  module: string;
  formateur: string;
  presence: "Présente" | "Présent" | "Retard" | "Absence" | "Autorisation";
  retardMin?: number;
  participation: string;
  comprehension: string;
  comportement: string;
  score: number;
  observation: string;
  actionCorrective?: string;
  statut: "Validée" | "Validée sous réserve" | "Non validée";
}

export interface Presence {
  date: string;
  shift: string;
  entree: string;
  sortie: string;
  statut: "Présente" | "Présent" | "Retard" | "Absence" | "Autorisation" | "Repos";
  retard?: string;
  justificatif?: string;
  impact?: string;
}

export interface EvenementSuivi {
  id: string;
  date: string;
  type: "Observation" | "Alerte" | "Feedback" | "Incident" | "Réclamation" | "Action corrective";
  auteur: string;
  tonalite: "Positive" | "Neutre" | "Négative" | "Critique";
  titre: string;
  contenu: string;
  statut?: string;
}

export interface HistoriqueEntree {
  id: string;
  date: string;
  heure: string;
  utilisateur: string;
  type: string;
  action: string;
  avant: string;
  apres: string;
}

export interface Ouvrier {
  id: string;
  candidatId?: string;
  nom: string;
  poste: string;
  site: Site;
  atelier: string;
  groupe: string;
  parcours: string;
  parcoursLibelle: string;
  jour: number;
  jourTotal: number;
  progression: number;
  score: number;
  presence: number;
  ponctualite: number;
  risque: Risque;
  statut: StatutOuvrier;
  dateIntegration: string;
  formateur: string;
  prochaineAction: string;
  prochaineEtape?: { date: string; heure: string; libelle: string; lieu: string };
  identite: {
    naissance: string;
    cin: string;
    telephone: string;
    email: string;
    adresse: string;
    ville: string;
    contactUrgence: string;
  };
  situation: { departement: string; equipe: string; shift: string; manager: string };
  modules: { code: string; nom: string; statut: "Validé" | "Validé sous réserve" | "En cours" | "À venir"; score?: number; date?: string; formateur?: string; commentaire?: string }[];
  journal: JourneeFormation[];
  presences: Presence[];
  tests: { nom: string; score: number; statut: "Réussi" | "Échoué"; date: string }[];
  pratiques: { nom: string; note: number; dimensions: Record<string, number> }[];
  competences: { nom: string; niveau: number; etat: "Non évaluée" | "En acquisition" | "Acquise" | "Maîtrisée" }[];
  evenements: EvenementSuivi[];
  communications: { date: string; canal: "WhatsApp" | "Email" | "Notification"; objet: string; statut: string }[];
  documents: { nom: string; date: string; statut: string; expiration?: string }[];
  readiness: { global: number; sous: { label: string; valeur: number }[]; tendance: string; forts: string[]; surveiller: string[]; recommandation: string; confiance: number };
  courbe: { jour: string; score: number }[];
  historique: HistoriqueEntree[];
  decision?: { decision: string; commentaire: string; responsable: string; date: string; motif?: string };
  onboarding?: DossierOnboarding;
}


const sara: Ouvrier = {
  id: "LMA-BOU-2026-0418",
  candidatId: "CAN-2026-01248",
  nom: "Sara Amrani",
  poste: "Opératrice câblage",
  site: "Bouskoura",
  atelier: "Câblage A",
  groupe: "CBL-07",
  parcours: "FOR-CBL-01",
  parcoursLibelle: "Intégration opérateur câblage",
  jour: 7,
  jourTotal: 10,
  progression: 72,
  score: 86,
  presence: 96,
  ponctualite: 92,
  risque: "Faible",
  statut: "En formation",
  dateIntegration: "20/07/2026",
  formateur: "Salma Bennis",
  prochaineAction: "Évaluation pratique finale dans 2 jours",
  prochaineEtape: {
    date: "31 juillet 2026",
    heure: "08:30",
    libelle: "Évaluation pratique finale",
    lieu: "Atelier A3",
  },
  identite: {
    naissance: "14/03/2001",
    cin: "BK 482 913",
    telephone: "+212 6 61 04 18 22",
    email: "sara.amrani@example.ma",
    adresse: "Rue 12, Hay El Farah",
    ville: "Casablanca",
    contactUrgence: "Nadia Amrani — +212 6 61 04 18 90",
  },
  situation: {
    departement: "Production câblage",
    equipe: "Équipe B",
    shift: "08:00 – 17:00",
    manager: "Rachida Ouazzani",
  },
  modules: [
    { code: "01", nom: "Présentation LEONI", statut: "Validé", score: 90, date: "20/07/2026", formateur: "Salma Bennis" },
    { code: "02", nom: "Culture industrielle", statut: "Validé", score: 84, date: "20/07/2026", formateur: "Salma Bennis" },
    { code: "03", nom: "Sécurité & EPI", statut: "Validé", score: 95, date: "24/07/2026", formateur: "Karim Sebti" },
    { code: "04", nom: "Introduction câblage", statut: "Validé", score: 82, date: "21/07/2026", formateur: "Salma Bennis" },
    { code: "05", nom: "Lecture instructions", statut: "Validé sous réserve", score: 78, date: "21/07/2026", formateur: "Salma Bennis", commentaire: "Révision guidée réalisée le 21/07." },
    { code: "06", nom: "Préparation composants", statut: "Validé", score: 88, date: "22/07/2026", formateur: "Salma Bennis" },
    { code: "07", nom: "Assemblage", statut: "En cours", score: 91, date: "29/07/2026", formateur: "Salma Bennis" },
    { code: "08", nom: "Contrôle visuel", statut: "À venir" },
    { code: "09", nom: "Contrôle qualité", statut: "À venir" },
    { code: "10", nom: "Évaluation finale", statut: "À venir" },
  ],
  journal: [
    {
      date: "20/07/2026",
      jour: 1,
      module: "Introduction au câblage automobile",
      formateur: "Salma Bennis",
      presence: "Présente",
      participation: "Très bonne",
      comprehension: "Bonne",
      comportement: "Très bon",
      score: 82,
      observation: "Bonne compréhension des principes généraux.",
      statut: "Validée",
    },
    {
      date: "21/07/2026",
      jour: 2,
      module: "Lecture des plans de câblage",
      formateur: "Salma Bennis",
      presence: "Présente",
      participation: "Bonne",
      comprehension: "Moyenne",
      comportement: "Très bon",
      score: 78,
      observation: "Quelques difficultés avec les symboles techniques.",
      actionCorrective: "Révision guidée de 30 minutes.",
      statut: "Validée sous réserve",
    },
    {
      date: "22/07/2026",
      jour: 3,
      module: "Techniques d'assemblage",
      formateur: "Salma Bennis",
      presence: "Présente",
      participation: "Excellente",
      comprehension: "Très bonne",
      comportement: "Très bon",
      score: 91,
      observation: "Très bonne maîtrise pratique.",
      statut: "Validée",
    },
    {
      date: "23/07/2026",
      jour: 4,
      module: "Contrôle qualité",
      formateur: "Salma Bennis",
      presence: "Retard",
      retardMin: 20,
      participation: "Bonne",
      comprehension: "Bonne",
      comportement: "Bon",
      score: 84,
      observation: "Travail correct. Vigilance nécessaire sur le contrôle final.",
      statut: "Validée",
    },
    {
      date: "24/07/2026",
      jour: 5,
      module: "Sécurité et EPI",
      formateur: "Karim Sebti",
      presence: "Présente",
      participation: "Très bonne",
      comprehension: "Très bonne",
      comportement: "Très bon",
      score: 95,
      observation: "Consignes de sécurité parfaitement restituées.",
      statut: "Validée",
    },
  ],
  presences: [
    { date: "20/07/2026", shift: "08:00 – 17:00", entree: "08:00", sortie: "17:00", statut: "Présente" },
    { date: "21/07/2026", shift: "08:00 – 17:00", entree: "08:01", sortie: "17:00", statut: "Présente" },
    { date: "22/07/2026", shift: "08:00 – 17:00", entree: "07:56", sortie: "17:00", statut: "Présente" },
    { date: "23/07/2026", shift: "08:00 – 17:00", entree: "08:20", sortie: "17:00", statut: "Retard", retard: "20 min", impact: "Aucun impact module" },
    { date: "24/07/2026", shift: "08:00 – 17:00", entree: "07:58", sortie: "17:00", statut: "Présente" },
    { date: "27/07/2026", shift: "08:00 – 17:00", entree: "07:59", sortie: "17:00", statut: "Présente" },
    { date: "28/07/2026", shift: "08:00 – 17:00", entree: "07:55", sortie: "17:00", statut: "Présente" },
  ],
  tests: [
    { nom: "Sécurité & EPI", score: 95, statut: "Réussi", date: "24/07/2026" },
    { nom: "Introduction câblage", score: 82, statut: "Réussi", date: "21/07/2026" },
    { nom: "Lecture instructions", score: 78, statut: "Réussi", date: "22/07/2026" },
    { nom: "Qualité", score: 84, statut: "Réussi", date: "23/07/2026" },
  ],
  pratiques: [
    {
      nom: "Assemblage connecteur",
      note: 4.5,
      dimensions: { Qualité: 4.6, Vitesse: 4.2, Autonomie: 4.4, Précision: 4.7, "Respect process": 4.5, Sécurité: 4.8 },
    },
    {
      nom: "Lecture instruction",
      note: 3.8,
      dimensions: { Qualité: 3.9, Vitesse: 3.6, Autonomie: 3.5, Précision: 3.8, "Respect process": 4.0, Sécurité: 4.2 },
    },
    {
      nom: "Contrôle visuel",
      note: 4.1,
      dimensions: { Qualité: 4.2, Vitesse: 3.9, Autonomie: 4.0, Précision: 4.1, "Respect process": 4.2, Sécurité: 4.4 },
    },
  ],
  competences: [
    { nom: "Lecture instructions", niveau: 3, etat: "Acquise" },
    { nom: "Assemblage", niveau: 3, etat: "Acquise" },
    { nom: "Contrôle qualité", niveau: 2, etat: "En acquisition" },
    { nom: "Sécurité", niveau: 4, etat: "Maîtrisée" },
    { nom: "Utilisation équipements", niveau: 3, etat: "Acquise" },
  ],
  evenements: [
    {
      id: "EVT-2211",
      date: "27/07/2026",
      type: "Observation",
      auteur: "Salma Bennis",
      tonalite: "Positive",
      titre: "Observation formateur",
      contenu:
        "Sara progresse rapidement sur les opérations d'assemblage et démontre une bonne autonomie.",
    },
    {
      id: "EVT-2198",
      date: "21/07/2026",
      type: "Action corrective",
      auteur: "Salma Bennis",
      tonalite: "Neutre",
      titre: "Révision guidée — Lecture des plans",
      contenu: "Révision guidée de 30 minutes. Résultat : amélioration constatée.",
      statut: "Terminée",
    },
    {
      id: "EVT-2205",
      date: "26/07/2026",
      type: "Feedback",
      auteur: "Sara Amrani",
      tonalite: "Positive",
      titre: "Feedback formation",
      contenu: "La formation pratique était claire aujourd'hui.",
    },
  ],
  communications: [
    { date: "28/07/2026", canal: "WhatsApp", objet: "Rappel QCM", statut: "Lu" },
    { date: "25/07/2026", canal: "Email", objet: "Planning semaine 2", statut: "Ouvert" },
    { date: "20/07/2026", canal: "WhatsApp", objet: "Bienvenue et planning", statut: "Lu" },
  ],
  documents: [
    { nom: "Contrat", date: "20/07/2026", statut: "Signé" },
    { nom: "Pièce d'identité", date: "18/07/2026", statut: "Vérifiée" },
    { nom: "Diplôme OFPPT", date: "18/07/2026", statut: "Vérifié" },
    { nom: "Attestation sécurité", date: "24/07/2026", statut: "Émise", expiration: "24/07/2028" },
    { nom: "Planning formation", date: "20/07/2026", statut: "Communiqué" },
  ],
  readiness: {
    global: 86,
    sous: [
      { label: "Formation", valeur: 87 },
      { label: "Présence", valeur: 96 },
      { label: "Compétences", valeur: 83 },
      { label: "Évaluation pratique", valeur: 85 },
      { label: "Comportement", valeur: 88 },
      { label: "Sécurité", valeur: 95 },
    ],
    tendance: "Positive ↑",
    forts: [
      "Progression régulière",
      "Bonne ponctualité",
      "Résultats satisfaisants",
      "Bonne maîtrise sécurité",
      "Autonomie en progression",
    ],
    surveiller: ["Contrôle qualité final", "Lecture de certaines instructions complexes"],
    recommandation:
      "Le parcours de Sara Amrani présente une évolution positive. Les résultats pédagogiques, la présence et les évaluations terrain sont compatibles avec une confirmation, sous réserve de valider l'évaluation pratique finale.",
    confiance: 92,
  },
  courbe: [
    { jour: "J1", score: 71 },
    { jour: "J2", score: 74 },
    { jour: "J3", score: 81 },
    { jour: "J4", score: 82 },
    { jour: "J5", score: 87 },
    { jour: "J6", score: 85 },
    { jour: "J7", score: 86 },
  ],
  historique: [
    { id: "H1", date: "20/07/2026", heure: "08:03", utilisateur: "Système", type: "Parcours", action: "Début parcours FOR-CBL-01", avant: "—", apres: "En formation" },
    { id: "H2", date: "20/07/2026", heure: "17:14", utilisateur: "Salma Bennis", type: "Journal", action: "Jour 1 validé", avant: "En cours", apres: "Validée" },
    { id: "H3", date: "21/07/2026", heure: "15:20", utilisateur: "Salma Bennis", type: "Action corrective", action: "Action corrective créée", avant: "—", apres: "Révision guidée" },
    { id: "H4", date: "22/07/2026", heure: "17:12", utilisateur: "Salma Bennis", type: "Module", action: "Module Assemblage validé", avant: "En cours", apres: "Validé" },
    { id: "H5", date: "23/07/2026", heure: "08:20", utilisateur: "Pointeuse A3", type: "Présence", action: "Retard enregistré – 20 min", avant: "Présente", apres: "Retard" },
    { id: "H6", date: "24/07/2026", heure: "15:42", utilisateur: "Karim Sebti", type: "QCM", action: "QCM Sécurité validé – 95 %", avant: "—", apres: "95 %" },
    { id: "H7", date: "27/07/2026", heure: "16:30", utilisateur: "Salma Bennis", type: "Observation", action: "Observation formateur ajoutée", avant: "—", apres: "Positive" },
    { id: "H8", date: "28/07/2026", heure: "11:00", utilisateur: "Worker Readiness AI", type: "Score", action: "Score IA recalculé", avant: "84", apres: "86" },
  ],
};

function ouvrierSimple(o: Partial<Ouvrier> & Pick<Ouvrier, "id" | "nom" | "poste" | "site" | "progression" | "score" | "presence" | "risque" | "statut">): Ouvrier {
  return {
    ...sara,
    ...o,
    candidatId: o.candidatId,
    atelier: o.atelier ?? "Câblage A",
    groupe: o.groupe ?? "CBL-07",
    parcours: o.parcours ?? "FOR-CBL-01",
    parcoursLibelle: o.parcoursLibelle ?? "Intégration opérateur câblage",
    jour: o.jour ?? Math.max(1, Math.round((o.progression / 100) * 10)),
    ponctualite: o.ponctualite ?? Math.max(60, o.presence - 4),
    identite: { ...sara.identite, ...(o.identite ?? {}) },
    readiness: o.readiness ?? {
      global: o.score,
      sous: [
        { label: "Formation", valeur: o.score },
        { label: "Présence", valeur: o.presence },
        { label: "Compétences", valeur: Math.max(20, o.score - 6) },
        { label: "Évaluation pratique", valeur: Math.max(20, o.score - 3) },
        { label: "Comportement", valeur: Math.min(100, o.score + 2) },
        { label: "Sécurité", valeur: Math.min(100, o.score + 5) },
      ],
      tendance: o.risque === "Élevé" ? "Négative ↓" : o.risque === "Moyen" ? "Stable →" : "Positive ↑",
      forts: sara.readiness.forts.slice(0, 3),
      surveiller: o.risque === "Faible" ? ["Contrôle qualité final"] : ["Assiduité", "Résultats des tests"],
      recommandation:
        o.risque === "Élevé"
          ? `Le parcours de ${o.nom} présente des signaux de fragilité (présence et résultats). Une prolongation encadrée ou une réorientation est à étudier avec le responsable d'atelier.`
          : `Le parcours de ${o.nom} évolue conformément aux attentes du poste. Poursuivre le suivi standard et confirmer à l'issue de l'évaluation finale.`,
      confiance: o.risque === "Faible" ? 90 : 78,
    },
  } as Ouvrier;
}

const OUVRIERS_BRUTS: Ouvrier[] = [
  sara,
  {
    ...ouvrierSimple({
      id: "LMA-BOU-2026-0421",
      candidatId: "CAN-2026-01261",
      nom: "Nawal Chafik",
      poste: "Opératrice câblage",
      site: "Bouskoura",
      atelier: "Câblage B",
      groupe: "À affecter",
      progression: 0,
      score: 0,
      presence: 100,
      risque: "Faible",
      statut: "À intégrer",
      formateur: "Salma Bennis",
      dateIntegration: "03/08/2026",
      prochaineAction: "Intégration prévue le 03/08/2026 à 08:00 — 2 documents obligatoires manquants",
    }),
    onboarding: DOSSIER_DEMO,
  },
  ouvrierSimple({
    id: "LMA-BER-2026-0312",
    candidatId: "CAN-2026-01253",
    nom: "Mehdi Berrada",
    poste: "Technicien de ligne",
    site: "Berrechid",
    atelier: "Ligne B2",
    groupe: "QC-04",
    progression: 64,
    score: 79,
    presence: 88,
    risque: "Moyen",
    statut: "En formation",
    formateur: "Nabil Cherkaoui",
    dateIntegration: "18/07/2026",
    prochaineAction: "Rattrapage lecture d'instructions",
  }),
  ouvrierSimple({
    id: "LMA-BZN-2026-0208",
    nom: "Anas El Fassi",
    poste: "Opérateur coupe",
    site: "Bouznika",
    atelier: "Coupe C1",
    groupe: "CUT-03",
    parcours: "FOR-CUT-01",
    parcoursLibelle: "Opérateur coupe",
    progression: 100,
    score: 88,
    presence: 98,
    risque: "Faible",
    statut: "À confirmer",
    formateur: "Otmane Rifi",
    dateIntegration: "10/07/2026",
    prochaineAction: "Décision RH de confirmation",
  }),
  ouvrierSimple({
    id: "LMA-BOU-2026-0395",
    nom: "Khadija Rami",
    poste: "Opératrice assemblage",
    site: "Bouskoura",
    atelier: "Câblage B",
    groupe: "CBL-08",
    progression: 48,
    score: 46,
    presence: 72,
    risque: "Élevé",
    statut: "À risque",
    formateur: "Salma Bennis",
    dateIntegration: "15/07/2026",
    prochaineAction: "Entretien de recadrage RH",
  }),
  ouvrierSimple({
    id: "LMA-BER-2026-0279",
    nom: "Othmane Benali",
    poste: "Contrôleur qualité",
    site: "Berrechid",
    atelier: "Qualité Q1",
    groupe: "QC-04",
    parcours: "FOR-QC-01",
    parcoursLibelle: "Contrôleur qualité",
    progression: 100,
    score: 91,
    presence: 97,
    risque: "Faible",
    statut: "Confirmé",
    formateur: "Nabil Cherkaoui",
    dateIntegration: "01/07/2026",
    prochaineAction: "Affectation poste définitif",
  }),
  ouvrierSimple({
    id: "LMA-BOU-2026-0435",
    nom: "Mariam Lahlou",
    poste: "Opératrice câblage",
    site: "Bouskoura",
    atelier: "Câblage A",
    groupe: "CBL-08",
    progression: 35,
    score: 74,
    presence: 86,
    risque: "Moyen",
    statut: "En formation",
    formateur: "Salma Bennis",
    dateIntegration: "24/07/2026",
    prochaineAction: "Suivi module sécurité",
  }),
];

/** Chaque ouvrier dispose d'un dossier de pré-intégration (EPI, badge, transport…) — modifiable dans sa fiche. */
export const OUVRIERS: Ouvrier[] = OUVRIERS_BRUTS.map((o) => ({
  ...o,
  onboarding: o.onboarding ?? dossierPourOuvrier(o),
}));

/* ------------------------------------------------------------------ */
/* Dashboard                                                           */
/* ------------------------------------------------------------------ */

export const KPIS = [
  { label: "Candidatures reçues", valeur: "1 248", delta: "+12,4 %", ton: "brand" },
  { label: "Analysées par IA", valeur: "864", ton: "brand" },
  { label: "Présélectionnées", valeur: "396", ton: "brand" },
  { label: "Entretiens", valeur: "126", ton: "info" },
  { label: "Retenus", valeur: "84", ton: "success" },
  { label: "En formation", valeur: "214", ton: "info" },
  { label: "À confirmer", valeur: "52", ton: "warning" },
  { label: "À risque", valeur: "17", ton: "critical" },
  { label: "Absences aujourd'hui", valeur: "28", ton: "warning" },
  { label: "Réclamations ouvertes", valeur: "19", ton: "warning" },
  { label: "Alertes critiques", valeur: "4", ton: "critical" },
];

export const FUNNEL = [
  { etape: "Candidatures", valeur: 1248 },
  { etape: "Analysées", valeur: 864 },
  { etape: "Présélectionnées", valeur: 396 },
  { etape: "Entretiens", valeur: 126 },
  { etape: "Retenues", valeur: 84 },
  { etape: "Intégrées", valeur: 71 },
];

export const EVOLUTION_MENSUELLE = [
  { mois: "Jan", candidatures: 745, analysees: 512, entretiens: 78, recrutes: 49, integres: 41, abandons: 8 },
  { mois: "Fév", candidatures: 810, analysees: 564, entretiens: 84, recrutes: 55, integres: 46, abandons: 9 },
  { mois: "Mar", candidatures: 892, analysees: 621, entretiens: 92, recrutes: 61, integres: 52, abandons: 9 },
  { mois: "Avr", candidatures: 940, analysees: 668, entretiens: 101, recrutes: 66, integres: 57, abandons: 10 },
  { mois: "Mai", candidatures: 1011, analysees: 712, entretiens: 108, recrutes: 71, integres: 62, abandons: 9 },
  { mois: "Juin", candidatures: 1102, analysees: 795, entretiens: 117, recrutes: 78, integres: 66, abandons: 12 },
  { mois: "Juil", candidatures: 1248, analysees: 864, entretiens: 126, recrutes: 84, integres: 71, abandons: 13 },
];

export const REPARTITION_SITES = [
  { site: "Bouskoura", part: 31, valeur: 387, recrutes: 26, enFormation: 68 },
  { site: "Berrechid", part: 22, valeur: 275, recrutes: 19, enFormation: 47 },
  { site: "Aïn Sebaâ", part: 17, valeur: 212, recrutes: 14, enFormation: 36 },
  { site: "Bouznika", part: 14, valeur: 175, recrutes: 12, enFormation: 29 },
  { site: "Agadir", part: 12, valeur: 149, recrutes: 10, enFormation: 24 },
  { site: "Autres", part: 4, valeur: 50, recrutes: 3, enFormation: 10 },
];

export const RESULTATS_FORMATION = [
  { label: "Réussite", part: 84, module: "Réussite", reussite: 84, echec: 16 },
  { label: "Prolongation", part: 9, module: "Prolongation", reussite: 9, echec: 0 },
  { label: "Arrêt", part: 4, module: "Arrêt", reussite: 0, echec: 4 },
  { label: "En cours", part: 3, module: "En cours", reussite: 3, echec: 0 },
];

export const POPULATION_RISQUE = [
  { niveau: "Faible", nombre: 164, valeur: 164 },
  { niveau: "Moyen", nombre: 33, valeur: 33 },
  { niveau: "Élevé", nombre: 17, valeur: 17 },
];

/* ---------------------- Reporting : recrutement ---------------------- */

export const SOURCES_CANDIDATURES = [
  { source: "Cooptation opérateurs", candidatures: 384, retenus: 31, coutMAD: 180 },
  { source: "Job dating régional", candidatures: 296, retenus: 24, coutMAD: 320 },
  { source: "ANAPEC", candidatures: 241, retenus: 13, coutMAD: 90 },
  { source: "Candidatures spontanées", candidatures: 187, retenus: 9, coutMAD: 0 },
  { source: "Réseaux sociaux", candidatures: 140, retenus: 7, coutMAD: 260 },
];

export const DELAIS_ETAPES = [
  { etape: "Réception → analyse IA", jours: 0.4 },
  { etape: "Analyse → présélection", jours: 1.2 },
  { etape: "Présélection → entretien", jours: 2.6 },
  { etape: "Entretien → décision", jours: 1.8 },
  { etape: "Décision → intégration", jours: 4.3 },
];

export const QUALITE_RECRUTEMENT = [
  { critere: "Fiabilité du score IA", valeur: 88 },
  { critere: "Adéquation au poste", valeur: 81 },
  { critere: "Présence en formation", valeur: 94 },
  { critere: "Réussite des tests", valeur: 84 },
  { critere: "Maintien à 90 jours", valeur: 79 },
  { critere: "Satisfaction chef de ligne", valeur: 86 },
];

export const MOTIFS_REFUS = [
  { motif: "Score IA insuffisant", nombre: 218 },
  { motif: "Expérience non conforme", nombre: 141 },
  { motif: "Indisponibilité horaires", nombre: 96 },
  { motif: "Distance domicile-site", nombre: 74 },
  { motif: "Désistement candidat", nombre: 58 },
];

export const RECRUTEMENT_PAR_POSTE = [
  { poste: "Opérateur câblage", besoin: 120, recrutes: 96, tauxCouverture: 80 },
  { poste: "Opératrice assemblage", besoin: 80, recrutes: 71, tauxCouverture: 89 },
  { poste: "Contrôleur qualité", besoin: 45, recrutes: 34, tauxCouverture: 76 },
  { poste: "Opérateur coupe", besoin: 38, recrutes: 30, tauxCouverture: 79 },
  { poste: "Technicien ligne", besoin: 22, recrutes: 14, tauxCouverture: 64 },
];

/* ---------------------- Reporting : formation ------------------------ */

export const RESULTATS_MODULES = [
  { module: "Sécurité & EPI", reussite: 92, echec: 8, moyenne: 87, inscrits: 214 },
  { module: "Introduction câblage", reussite: 86, echec: 14, moyenne: 81, inscrits: 96 },
  { module: "Techniques assemblage", reussite: 78, echec: 22, moyenne: 74, inscrits: 96 },
  { module: "Contrôle visuel", reussite: 81, echec: 19, moyenne: 77, inscrits: 138 },
  { module: "Contrôle qualité", reussite: 74, echec: 26, moyenne: 71, inscrits: 42 },
  { module: "Paramétrage coupe", reussite: 69, echec: 31, moyenne: 68, inscrits: 38 },
];

export const PROGRESSION_HEBDO = [
  { semaine: "S23", scoreMoyen: 62, presence: 91, validations: 18 },
  { semaine: "S24", scoreMoyen: 66, presence: 92, validations: 24 },
  { semaine: "S25", scoreMoyen: 69, presence: 93, validations: 27 },
  { semaine: "S26", scoreMoyen: 73, presence: 94, validations: 31 },
  { semaine: "S27", scoreMoyen: 76, presence: 93, validations: 29 },
  { semaine: "S28", scoreMoyen: 79, presence: 95, validations: 35 },
  { semaine: "S29", scoreMoyen: 82, presence: 94, validations: 38 },
];

export const FORMATION_PAR_PARCOURS = [
  { parcours: "Intégration câblage", inscrits: 96, valides: 78, enCours: 12, arretes: 6, tauxReussite: 81 },
  { parcours: "Contrôleur qualité", inscrits: 42, valides: 31, enCours: 8, arretes: 3, tauxReussite: 74 },
  { parcours: "Opérateur coupe", inscrits: 38, valides: 27, enCours: 9, arretes: 2, tauxReussite: 71 },
  { parcours: "Sécurité industrielle", inscrits: 214, valides: 197, enCours: 12, arretes: 5, tauxReussite: 92 },
];

export const PERFORMANCE_FORMATEURS = [
  { formateur: "Salma Bennis", sessions: 42, apprenants: 148, tauxReussite: 88, satisfaction: 4.6 },
  { formateur: "Nabil Cherkaoui", sessions: 31, apprenants: 96, tauxReussite: 82, satisfaction: 4.3 },
  { formateur: "Karim Sebti", sessions: 28, apprenants: 214, tauxReussite: 91, satisfaction: 4.7 },
  { formateur: "Otmane Rifi", sessions: 24, apprenants: 74, tauxReussite: 76, satisfaction: 4.1 },
];

export const COMPETENCES_ACQUISES = [
  { competence: "Lecture d'instructions", niveau: 88 },
  { competence: "Sertissage", niveau: 74 },
  { competence: "Contrôle visuel", niveau: 82 },
  { competence: "Respect des consignes HSE", niveau: 93 },
  { competence: "Cadence de production", niveau: 69 },
  { competence: "Travail en équipe", niveau: 85 },
];

/* ---------------------- Reporting : présence & perf ------------------ */

export const PRESENCE_PAR_SITE = [
  { site: "Bouskoura", presence: 94, ponctualite: 91, absences: 12 },
  { site: "Berrechid", presence: 96, ponctualite: 93, absences: 7 },
  { site: "Aïn Sebaâ", presence: 92, ponctualite: 88, absences: 9 },
  { site: "Bouznika", presence: 90, ponctualite: 86, absences: 11 },
  { site: "Agadir", presence: 95, ponctualite: 92, absences: 5 },
];

export const MOTIFS_ABSENCE = [
  { motif: "Maladie", nombre: 42 },
  { motif: "Transport", nombre: 27 },
  { motif: "Familial", nombre: 19 },
  { motif: "Non justifiée", nombre: 16 },
  { motif: "Autorisation", nombre: 13 },
];

export const EVOLUTION_RECLAMATIONS = [
  { mois: "Mar", ouvertes: 14, resolues: 11 },
  { mois: "Avr", ouvertes: 17, resolues: 15 },
  { mois: "Mai", ouvertes: 21, resolues: 18 },
  { mois: "Juin", ouvertes: 19, resolues: 19 },
  { mois: "Juil", ouvertes: 24, resolues: 21 },
];

export const TAUX_PRESENCE_GLOBAL = 94.2;

export interface Alerte {
  id: string;
  type: string;
  personne: string;
  site: Site | "Multi-sites";
  priorite: "Critique" | "Élevée" | "Moyenne" | "Faible";
  date: string;
  proprietaire: string;
  cta: string;
  lien?: string;
}

export const ALERTES: Alerte[] = [
  { id: "ALR-501", type: "12 candidatures sans décision depuis > 5 jours", personne: "Portefeuille recrutement", site: "Multi-sites", priorite: "Élevée", date: "28/07/2026", proprietaire: "Yassine Alaoui", cta: "Traiter les décisions", lien: "/recrutement/candidatures" },
  { id: "ALR-502", type: "7 entretiens sans compte rendu", personne: "Équipe recrutement", site: "Multi-sites", priorite: "Moyenne", date: "28/07/2026", proprietaire: "Imane El Fassi", cta: "Compléter les CR", lien: "/recrutement/entretiens" },
  { id: "ALR-503", type: "5 ouvriers avec présence < 80 %", personne: "Khadija Rami +4", site: "Bouskoura", priorite: "Élevée", date: "28/07/2026", proprietaire: "Rachida Ouazzani", cta: "Voir présences", lien: "/presences" },
  { id: "ALR-504", type: "4 ouvriers avec score < 50 %", personne: "Khadija Rami +3", site: "Bouskoura", priorite: "Critique", date: "27/07/2026", proprietaire: "Salma Bennis", cta: "Ouvrir les dossiers", lien: "/ouvriers" },
  { id: "ALR-505", type: "3 ouvriers avec 2 absences consécutives", personne: "Ayoub Najjar +2", site: "Bouznika", priorite: "Élevée", date: "27/07/2026", proprietaire: "Otmane Rifi", cta: "Planifier rattrapage", lien: "/presences" },
  { id: "ALR-506", type: "2 formations sécurité non validées", personne: "Khadija Rami, Ayoub Najjar", site: "Bouskoura", priorite: "Critique", date: "26/07/2026", proprietaire: "Karim Sebti", cta: "Programmer rattrapage", lien: "/formation/qcm" },
  { id: "ALR-507", type: "2 réclamations EPI critiques", personne: "Khadija Rami", site: "Bouskoura", priorite: "Critique", date: "26/07/2026", proprietaire: "Service Sécurité", cta: "Ouvrir la réclamation", lien: "/suivi/reclamations" },
  { id: "ALR-508", type: "1 parcours avec recommandation IA d'arrêt", personne: "Ayoub Najjar", site: "Bouznika", priorite: "Critique", date: "25/07/2026", proprietaire: "Amina Rajouh", cta: "Décision RH", lien: "/ouvriers" },
];

/* ------------------------------------------------------------------ */
/* Formation                                                           */
/* ------------------------------------------------------------------ */

export const PARCOURS = [
  {
    code: "FOR-CBL-01",
    nom: "Intégration opérateur câblage",
    duree: "10 jours",
    seuil: 75,
    presenceMin: 90,
    modules: [
      "Présentation LEONI",
      "Culture industrielle",
      "Sécurité & EPI",
      "Introduction câblage",
      "Lecture instructions",
      "Préparation composants",
      "Techniques assemblage",
      "Contrôle visuel",
      "Contrôle qualité",
      "Évaluation finale",
    ],
    inscrits: 96,
  },
  { code: "FOR-QC-01", nom: "Contrôleur qualité", duree: "12 jours", seuil: 80, presenceMin: 90, modules: ["Fondamentaux qualité", "Plans de contrôle", "AQL", "Défauthèque", "Reporting", "Évaluation finale"], inscrits: 42 },
  { code: "FOR-CUT-01", nom: "Opérateur coupe", duree: "8 jours", seuil: 75, presenceMin: 90, modules: ["Sécurité machines", "Paramétrage coupe", "Sertissage", "Contrôle", "Évaluation finale"], inscrits: 38 },
  { code: "FOR-SEC-01", nom: "Sécurité industrielle & EPI", duree: "1 jour", seuil: 80, presenceMin: 100, modules: ["Risques industriels", "EPI", "Consignes site", "QCM final"], inscrits: 214 },
];

export const SESSIONS = [
  { id: "SES-1201", groupe: "CBL-07", module: "Introduction câblage", salle: "Salle F12", debut: "08:30", fin: "12:00", jour: 2, formateur: "Salma Bennis", site: "Bouskoura", participants: 14 },
  { id: "SES-1202", groupe: "CBL-08", module: "Assemblage", salle: "Atelier A3", debut: "13:30", fin: "17:00", jour: 2, formateur: "Salma Bennis", site: "Bouskoura", participants: 12 },
  { id: "SES-1203", groupe: "QC-04", module: "Contrôle qualité", salle: "Salle Q02", debut: "09:00", fin: "12:00", jour: 3, formateur: "Nabil Cherkaoui", site: "Berrechid", participants: 10 },
  { id: "SES-1204", groupe: "SEC-02", module: "Sécurité", salle: "Salle S01", debut: "14:00", fin: "16:00", jour: 4, formateur: "Karim Sebti", site: "Bouskoura", participants: 22 },
  { id: "SES-1205", groupe: "CUT-03", module: "Équipements coupe", salle: "Atelier C1", debut: "08:00", fin: "11:30", jour: 5, formateur: "Otmane Rifi", site: "Bouznika", participants: 9 },
];

export const JOURS_SEMAINE = ["Lundi 27", "Mardi 28", "Mercredi 29", "Jeudi 30", "Vendredi 31"];

export const QCM = {
  code: "QCM-SEC-01",
  nom: "Sécurité et EPI",
  questions: 20,
  duree: "25 minutes",
  seuil: 80,
  tentatives: 2,
  resultats: [
    { ouvrier: "Sara Amrani", id: "LMA-BOU-2026-0418", score: 95 },
    { ouvrier: "Mehdi Berrada", id: "LMA-BER-2026-0312", score: 82 },
    { ouvrier: "Mariam Lahlou", id: "LMA-BOU-2026-0435", score: 78 },
    { ouvrier: "Khadija Rami", id: "LMA-BOU-2026-0395", score: 55 },
    { ouvrier: "Anas El Fassi", id: "LMA-BZN-2026-0208", score: 90 },
  ],
  analyse: [
    { question: "Q3 — Port des EPI en zone coupe", reussite: 96 },
    { question: "Q7 — Consignes d'évacuation", reussite: 88 },
    { question: "Q11 — Manipulation des connecteurs", reussite: 71 },
    { question: "Q14 — Signalement d'un incident", reussite: 64 },
    { question: "Q18 — Contrôle final avant expédition", reussite: 58 },
  ],
  tempsMoyen: "18 min",
};

/* ------------------------------------------------------------------ */
/* Présences / absences                                                */
/* ------------------------------------------------------------------ */

export const ABSENCES = [
  { id: "ABS-3301", ouvrier: "Khadija Rami", ouvrierId: "LMA-BOU-2026-0395", date: "26/07/2026", type: "Absence non justifiée", duree: "Journée", statut: "En attente", site: "Bouskoura" },
  { id: "ABS-3302", ouvrier: "Mehdi Berrada", ouvrierId: "LMA-BER-2026-0312", date: "27/07/2026", type: "Retard", duree: "35 min", statut: "Validé", site: "Berrechid" },
  { id: "ABS-3303", ouvrier: "Sara Amrani", ouvrierId: "LMA-BOU-2026-0418", date: "31/07/2026", type: "Autorisation", duree: "2 h", statut: "Validée", site: "Bouskoura" },
  { id: "ABS-3304", ouvrier: "Mariam Lahlou", ouvrierId: "LMA-BOU-2026-0435", date: "28-29/07/2026", type: "Maladie", duree: "2 jours", statut: "Justificatif reçu", site: "Bouskoura" },
  { id: "ABS-3305", ouvrier: "Ayoub Najjar", ouvrierId: "LMA-BZN-2026-0512", date: "25/07/2026", type: "Absence test", duree: "Journée", statut: "Rattrapage nécessaire", site: "Bouznika" },
];

/* ------------------------------------------------------------------ */
/* Feedbacks / réclamations                                            */
/* ------------------------------------------------------------------ */

export const FEEDBACKS = [
  { id: "FB-118", auteur: "Sara Amrani", ouvrierId: "LMA-BOU-2026-0418", texte: "La formation pratique était claire aujourd'hui.", categorie: "Formation", sentiment: "Positif", date: "26/07/2026" },
  { id: "FB-119", auteur: "Khadija Rami", ouvrierId: "LMA-BOU-2026-0395", texte: "Je n'ai pas reçu mes gants de protection.", categorie: "EPI", sentiment: "Critique", date: "26/07/2026" },
  { id: "FB-120", auteur: "Anas El Fassi", ouvrierId: "LMA-BZN-2026-0208", texte: "J'ai besoin de plus d'explications sur le contrôle final.", categorie: "Formation", sentiment: "Moyen", date: "27/07/2026" },
];

export const COLONNES_KANBAN = [
  "Nouvelle",
  "À qualifier",
  "Affectée",
  "En cours",
  "En attente",
  "Escaladée",
  "Résolue",
  "Clôturée",
] as const;

export type ColonneKanban = (typeof COLONNES_KANBAN)[number];

export interface Reclamation {
  id: string;
  objet: string;
  ouvrier: string;
  ouvrierId?: string;
  site: Site;
  categorie: string;
  priorite: "Critique" | "Élevée" | "Normale" | "Faible";
  responsable: string;
  statut: ColonneKanban;
  date: string;
  resolution?: string;
}

export const RECLAMATIONS: Reclamation[] = [
  { id: "REC-2026-081", objet: "Absence de gants de protection", ouvrier: "Khadija Rami", ouvrierId: "LMA-BOU-2026-0395", site: "Bouskoura", categorie: "EPI", priorite: "Critique", responsable: "Service Sécurité", statut: "En cours", date: "26/07/2026" },
  { id: "REC-2026-079", objet: "Planning reçu tardivement", ouvrier: "Ayoub Najjar", site: "Bouznika", categorie: "Organisation", priorite: "Normale", responsable: "Coordination formation", statut: "Affectée", date: "24/07/2026" },
  { id: "REC-2026-075", objet: "Erreur d'affectation de groupe", ouvrier: "Mariam Lahlou", ouvrierId: "LMA-BOU-2026-0435", site: "Bouskoura", categorie: "Formation", priorite: "Élevée", responsable: "Salma Bennis", statut: "En attente", date: "23/07/2026" },
  { id: "REC-2026-072", objet: "Badge d'accès non fonctionnel", ouvrier: "Mehdi Berrada", ouvrierId: "LMA-BER-2026-0312", site: "Berrechid", categorie: "Accès", priorite: "Normale", responsable: "Services généraux", statut: "Résolue", date: "22/07/2026", resolution: "Badge réédité le 23/07." },
  { id: "REC-2026-070", objet: "Demande de changement de shift", ouvrier: "Anas El Fassi", ouvrierId: "LMA-BZN-2026-0208", site: "Bouznika", categorie: "Organisation", priorite: "Faible", responsable: "Otmane Rifi", statut: "Nouvelle", date: "21/07/2026" },
  { id: "REC-2026-068", objet: "Chaussures de sécurité à la mauvaise taille", ouvrier: "Imane Zahraoui", site: "Bouskoura", categorie: "EPI", priorite: "Élevée", responsable: "Service Sécurité", statut: "À qualifier", date: "21/07/2026" },
  { id: "REC-2026-064", objet: "Salle de formation surchargée", ouvrier: "Groupe CBL-08", site: "Bouskoura", categorie: "Organisation", priorite: "Normale", responsable: "Coordination formation", statut: "Escaladée", date: "19/07/2026" },
  { id: "REC-2026-060", objet: "Attestation de formation non reçue", ouvrier: "Othmane Benali", ouvrierId: "LMA-BER-2026-0279", site: "Berrechid", categorie: "Documents", priorite: "Faible", responsable: "RH Site", statut: "Clôturée", date: "16/07/2026", resolution: "Attestation transmise par email." },
];

/* ------------------------------------------------------------------ */
/* Communication                                                       */
/* ------------------------------------------------------------------ */

export const TEMPLATES = [
  { code: "TPL-01", nom: "Réception candidature", canal: "Email", usage: 1248 },
  { code: "TPL-02", nom: "Documents manquants", canal: "WhatsApp", usage: 214 },
  { code: "TPL-03", nom: "Invitation entretien", canal: "Email", usage: 126 },
  { code: "TPL-04", nom: "Rappel entretien", canal: "WhatsApp", usage: 118 },
  { code: "TPL-05", nom: "Candidature retenue", canal: "Email", usage: 84 },
  { code: "TPL-06", nom: "Candidature refusée", canal: "Email", usage: 302 },
  { code: "TPL-07", nom: "Convocation formation", canal: "WhatsApp", usage: 214 },
  { code: "TPL-08", nom: "Planning", canal: "Email", usage: 196 },
  { code: "TPL-09", nom: "Modification planning", canal: "WhatsApp", usage: 47 },
  { code: "TPL-10", nom: "Rappel QCM", canal: "WhatsApp", usage: 88 },
  { code: "TPL-11", nom: "Absence", canal: "WhatsApp", usage: 63 },
  { code: "TPL-12", nom: "Rattrapage", canal: "WhatsApp", usage: 29 },
  { code: "TPL-13", nom: "Consigne sécurité", canal: "Notification interne", usage: 214 },
  { code: "TPL-14", nom: "Réclamation", canal: "Email", usage: 19 },
];

export const HISTORIQUE_COMMUNICATION = [
  { date: "28/07/2026 09:12", destinataire: "Sara Amrani", canal: "WhatsApp", template: "Rappel QCM", statut: "Lu" },
  { date: "28/07/2026 08:40", destinataire: "Groupe CBL-08", canal: "WhatsApp", template: "Modification planning", statut: "Distribué" },
  { date: "27/07/2026 17:05", destinataire: "Khadija Rami", canal: "WhatsApp", template: "Absence", statut: "Répondu" },
  { date: "27/07/2026 14:22", destinataire: "Youssef El Mansouri", canal: "Email", template: "Invitation entretien", statut: "Ouvert" },
  { date: "26/07/2026 10:03", destinataire: "Mariam Lahlou", canal: "Email", template: "Planning", statut: "Envoyé" },
  { date: "25/07/2026 16:48", destinataire: "Ayoub Najjar", canal: "WhatsApp", template: "Rattrapage", statut: "Échec" },
];

/* ------------------------------------------------------------------ */
/* Administration                                                      */
/* ------------------------------------------------------------------ */

export const ROLES = [
  "Super Admin",
  "Responsable RH Maroc",
  "RH Site",
  "Recruteur",
  "Responsable Formation",
  "Formateur",
  "Responsable Production",
  "Responsable Atelier",
  "Responsable Qualité",
  "Responsable Sécurité",
  "Direction",
  "Auditeur",
];

export const UTILISATEURS = [
  { nom: "Amina Rajouh", role: "Responsable RH Maroc", perimetre: "Tous les sites", statut: "Actif", mfa: "Activé" },
  { nom: "Yassine Alaoui", role: "Recruteur", perimetre: "Bouskoura", statut: "Actif", mfa: "Activé" },
  { nom: "Imane El Fassi", role: "RH Site", perimetre: "Berrechid", statut: "Actif", mfa: "Activé" },
  { nom: "Salma Bennis", role: "Formateur", perimetre: "Bouskoura", statut: "Actif", mfa: "Désactivé" },
  { nom: "Nabil Cherkaoui", role: "Responsable Formation", perimetre: "Berrechid", statut: "Actif", mfa: "Activé" },
  { nom: "Karim Sebti", role: "Responsable Sécurité", perimetre: "Tous les sites", statut: "Actif", mfa: "Activé" },
  { nom: "Otmane Rifi", role: "Responsable Atelier", perimetre: "Bouznika", statut: "Actif", mfa: "Désactivé" },
  { nom: "Hanane Tazi", role: "Recruteur", perimetre: "Agadir", statut: "Actif", mfa: "Activé" },
  { nom: "Rachida Ouazzani", role: "Responsable Production", perimetre: "Bouskoura", statut: "Suspendu", mfa: "Activé" },
];

export const AUTOMATISATIONS = [
  { id: "AUT-01", si: "Candidature reçue", alors: "Analyser le CV (Talent Fit AI)", actif: true, executions: 1248 },
  { id: "AUT-02", si: "Score IA > 80", alors: "Notifier le recruteur", actif: true, executions: 412 },
  { id: "AUT-03", si: "Candidat retenu", alors: "Créer la fiche ouvrier", actif: true, executions: 84 },
  { id: "AUT-04", si: "Ouvrier affecté à une formation", alors: "Envoyer le planning", actif: true, executions: 214 },
  { id: "AUT-05", si: "Absence en formation", alors: "Proposer un rattrapage", actif: true, executions: 63 },
  { id: "AUT-06", si: "Présence < 80 %", alors: "Créer une alerte RH", actif: true, executions: 27 },
  { id: "AUT-07", si: "Score < 60 %", alors: "Passer le risque à Élevé", actif: true, executions: 17 },
  { id: "AUT-08", si: "Parcours terminé", alors: "Calculer le Worker Readiness Score", actif: true, executions: 71 },
];

export const PONDERATIONS_IA = [
  { critere: "Évaluations", poids: 30 },
  { critere: "Compétences", poids: 20 },
  { critere: "Présence", poids: 15 },
  { critere: "Ponctualité", poids: 10 },
  { critere: "Observations formateur", poids: 10 },
  { critere: "Comportement", poids: 5 },
  { critere: "Sécurité", poids: 5 },
  { critere: "Incidents / actions", poids: 5 },
];

export const AUDIT = [
  { date: "28/07/2026 11:00", utilisateur: "Worker Readiness AI", module: "Ouvriers", action: "Recalcul du score", objet: "LMA-BOU-2026-0418", avant: "84", apres: "86" },
  { date: "28/07/2026 09:12", utilisateur: "Amina Rajouh", module: "Communication", action: "Envoi WhatsApp", objet: "Sara Amrani", avant: "—", apres: "Rappel QCM" },
  { date: "27/07/2026 16:30", utilisateur: "Salma Bennis", module: "Suivi", action: "Ajout observation", objet: "LMA-BOU-2026-0418", avant: "—", apres: "Observation positive" },
  { date: "27/07/2026 10:22", utilisateur: "Yassine Alaoui", module: "Recrutement", action: "Changement de statut", objet: "CAN-2026-01253", avant: "Entretien réalisé", apres: "Décision RH" },
  { date: "26/07/2026 15:04", utilisateur: "Service Sécurité", module: "Réclamations", action: "Prise en charge", objet: "REC-2026-081", avant: "À qualifier", apres: "En cours" },
  { date: "26/07/2026 08:31", utilisateur: "Système", module: "Présences", action: "Enregistrement absence", objet: "LMA-BOU-2026-0395", avant: "—", apres: "Absence non justifiée" },
];

export const ATELIERS = [
  { code: "ATL-CBLA", nom: "Câblage A", site: "Bouskoura", capacite: 240, responsable: "Rachida Ouazzani" },
  { code: "ATL-CBLB", nom: "Câblage B", site: "Bouskoura", capacite: 180, responsable: "Rachida Ouazzani" },
  { code: "ATL-LB2", nom: "Ligne B2", site: "Berrechid", capacite: 160, responsable: "Nabil Cherkaoui" },
  { code: "ATL-Q1", nom: "Qualité Q1", site: "Berrechid", capacite: 60, responsable: "Hind Bekkali" },
  { code: "ATL-C1", nom: "Coupe C1", site: "Bouznika", capacite: 120, responsable: "Otmane Rifi" },
  { code: "ATL-AG1", nom: "Assemblage AG1", site: "Agadir", capacite: 140, responsable: "Hanane Tazi" },
];

export const POSTES = [
  { code: "PST-001", nom: "Opérateur / Opératrice câblage", famille: "Production", parcours: "FOR-CBL-01", ouverts: 68 },
  { code: "PST-002", nom: "Opérateur / Opératrice assemblage", famille: "Production", parcours: "FOR-CBL-01", ouverts: 41 },
  { code: "PST-003", nom: "Opérateur coupe", famille: "Production", parcours: "FOR-CUT-01", ouverts: 22 },
  { code: "PST-004", nom: "Contrôleur qualité", famille: "Qualité", parcours: "FOR-QC-01", ouverts: 14 },
  { code: "PST-005", nom: "Technicien de ligne", famille: "Maintenance", parcours: "FOR-QC-01", ouverts: 9 },
];

export const COMPETENCES_REF = [
  "Lecture instructions",
  "Assemblage",
  "Contrôle qualité",
  "Sécurité",
  "Utilisation équipements",
  "Sertissage",
  "Traçabilité",
];

export const CAMPAGNES = [
  { code: "CAM-2026-07", nom: "Campagne câblage Bouskoura", site: "Bouskoura", objectif: 120, recus: 486, retenus: 38, statut: "En cours" },
  { code: "CAM-2026-06", nom: "Campagne qualité Berrechid", site: "Berrechid", objectif: 40, recus: 214, retenus: 17, statut: "En cours" },
  { code: "CAM-2026-05", nom: "Campagne locale Agadir", site: "Agadir", objectif: 60, recus: 168, retenus: 21, statut: "Clôturée" },
];

export const BESOINS = [
  { code: "BES-114", poste: "Opératrice câblage", site: "Bouskoura", volume: 60, pourvus: 38, echeance: "30/09/2026", priorite: "Élevée" },
  { code: "BES-115", poste: "Contrôleur qualité", site: "Berrechid", volume: 20, pourvus: 11, echeance: "15/09/2026", priorite: "Moyenne" },
  { code: "BES-116", poste: "Opérateur coupe", site: "Bouznika", volume: 25, pourvus: 9, echeance: "31/08/2026", priorite: "Critique" },
  { code: "BES-117", poste: "Opératrice assemblage", site: "Agadir", volume: 35, pourvus: 21, echeance: "31/10/2026", priorite: "Moyenne" },
];
