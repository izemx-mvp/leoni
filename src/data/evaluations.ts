/* ------------------------------------------------------------------ */
/* MODULE ÉVALUATIONS — Single Source of Truth                         */
/* evaluationId / questionId / assignmentId / attemptId / resultId     */
/* ------------------------------------------------------------------ */

export const TYPES_EVALUATION = [
  "QCM",
  "Quiz",
  "Test théorique",
  "Test pratique",
  "Évaluation finale",
  "Test sécurité",
  "Test de connaissances",
  "Évaluation de compétence",
] as const;
export type TypeEvaluation = (typeof TYPES_EVALUATION)[number];

export const STATUTS_EVALUATION = [
  "Brouillon",
  "Prêt à publier",
  "Programmé",
  "Ouvert",
  "En cours",
  "Terminé",
  "Archivé",
  "Annulé",
] as const;
export type StatutEvaluation = (typeof STATUTS_EVALUATION)[number];

export const TYPES_QUESTION = [
  "Choix unique",
  "Choix multiples",
  "Vrai / Faux",
  "Réponse courte",
  "Mise en situation",
  "Question avec image",
  "Question avec document",
  "Question pratique",
] as const;
export type TypeQuestion = (typeof TYPES_QUESTION)[number];

export const CATEGORIES_QUESTION = [
  "Sécurité",
  "EPI",
  "Câblage",
  "Assemblage",
  "Qualité",
  "Contrôle",
  "Process industriel",
  "Lecture instructions",
  "Maintenance",
  "Logistique",
];

export const DIFFICULTES = ["Facile", "Moyenne", "Difficile"] as const;
export type Difficulte = (typeof DIFFICULTES)[number];

export const NIVEAUX_COMPETENCE = ["Non évaluée", "En acquisition", "Acquise", "Maîtrisée"] as const;

export interface Question {
  questionId: string;
  numero: number;
  intitule: string;
  description?: string;
  type: TypeQuestion;
  reponses: string[];
  bonneReponse: string;
  explication: string;
  points: number;
  categorie: string;
  competence: string;
  difficulte: Difficulte;
  obligatoire: boolean;
  /* bibliothèque */
  formation?: string;
  module?: string;
  utilisations?: number;
  tauxReussite?: number;
  derniereUtilisation?: string;
  createur?: string;
  archivee?: boolean;
  tempsMoyen?: string;
}

export type StatutParticipant =
  | "Non commencé"
  | "En cours"
  | "Terminé"
  | "Absent"
  | "Expiré";

export interface Reponse {
  questionId: string;
  donnee: string;
  correcte: boolean;
  points: number;
}

export interface Participant {
  assignmentId: string;
  attemptId: string;
  resultId: string;
  workerId: string;
  ouvrier: string;
  site: string;
  groupe: string;
  statut: StatutParticipant;
  debut: string;
  fin: string;
  duree: string;
  tentative: number;
  score: number | null;
  progression?: string;
  notification: "Envoyé" | "Distribué" | "Lu" | "Ouvert";
  reponses: Reponse[];
}

export interface CriterePratique {
  critere: string;
  note: number;
  max: number;
}

export interface Evaluation {
  evaluationId: string;
  code: string;
  titre: string;
  description: string;
  type: TypeEvaluation;
  formation: string;
  module: string;
  competence: string;
  site: string;
  langue: string;
  niveau: "Débutant" | "Intermédiaire" | "Avancé";
  statut: StatutEvaluation;
  dateCreation: string;
  datePassage: string;
  ouverture: string;
  fermeture: string;
  duree: number;
  seuil: number;
  tentatives: number;
  ordreQuestionsAleatoire: boolean;
  ordreReponsesAleatoire: boolean;
  resultatImmediat: boolean;
  afficherBonnesReponses: boolean;
  retourArriere: boolean;
  pleinEcran: boolean;
  validationAuto: boolean;
  rappels: string[];
  canaux: string[];
  createur: string;
  questions: Question[];
  participants: Participant[];
  criteres?: CriterePratique[];
  commentaireFormateur?: string;
}

export interface EntreeAudit {
  id: string;
  date: string;
  utilisateur: string;
  evaluationId: string;
  action: string;
  detail: string;
}

export interface Rattrapage {
  id: string;
  workerId: string;
  ouvrier: string;
  evaluationId: string;
  evaluation: string;
  score: number;
  seuil: number;
  tentative: string;
  site: string;
  statut: "À programmer" | "Programmé" | "Réalisé";
  date?: string;
  heure?: string;
  lieu?: string;
  formateur?: string;
}

/* ------------------------------ Questions ----------------------------- */

export const BIBLIOTHEQUE: Question[] = [
  {
    questionId: "Q-SEC-001", numero: 1,
    intitule: "Quelle est la première action à effectuer avant d'entrer dans une zone de production ?",
    type: "Choix unique",
    reponses: ["Vérifier son téléphone", "Porter les EPI requis", "Commencer directement son poste", "Consulter son planning"],
    bonneReponse: "Porter les EPI requis",
    explication: "Le port des EPI est obligatoire avant tout franchissement de la ligne jaune.",
    points: 1, categorie: "Sécurité", competence: "Sécurité industrielle", difficulte: "Facile", obligatoire: true,
    formation: "FOR-CBL-01", module: "Sécurité & EPI", utilisations: 24, tauxReussite: 96, derniereUtilisation: "28/07/2026", createur: "Salma Bennis", tempsMoyen: "32 s",
  },
  {
    questionId: "Q-SEC-002", numero: 2,
    intitule: "Le port des lunettes de protection est obligatoire en zone coupe.",
    type: "Vrai / Faux",
    reponses: ["Vrai", "Faux"], bonneReponse: "Vrai",
    explication: "Les projections de fils imposent une protection oculaire permanente.",
    points: 1, categorie: "EPI", competence: "Sécurité industrielle", difficulte: "Facile", obligatoire: true,
    formation: "FOR-SEC-01", module: "EPI", utilisations: 19, tauxReussite: 93, derniereUtilisation: "28/07/2026", createur: "Salma Bennis", tempsMoyen: "21 s",
  },
  {
    questionId: "Q-SEC-003", numero: 3,
    intitule: "Port des EPI en zone coupe : quels équipements sont exigés ?",
    type: "Choix multiples",
    reponses: ["Gants anti-coupure", "Lunettes de protection", "Casque de chantier", "Chaussures de sécurité"],
    bonneReponse: "Gants anti-coupure, Lunettes de protection, Chaussures de sécurité",
    explication: "Le casque n'est pas requis en zone coupe, contrairement aux trois autres EPI.",
    points: 2, categorie: "EPI", competence: "Sécurité industrielle", difficulte: "Moyenne", obligatoire: true,
    formation: "FOR-SEC-01", module: "EPI", utilisations: 21, tauxReussite: 96, derniereUtilisation: "28/07/2026", createur: "Amina Rajouh", tempsMoyen: "48 s",
  },
  {
    questionId: "Q-SEC-007", numero: 7,
    intitule: "Consignes d'évacuation : où se rendre en cas d'alarme incendie ?",
    type: "Choix unique",
    reponses: ["Au vestiaire", "Au point de rassemblement du site", "Au parking visiteurs", "Rester à son poste"],
    bonneReponse: "Au point de rassemblement du site",
    explication: "Chaque atelier dispose d'un point de rassemblement balisé en extérieur.",
    points: 1, categorie: "Sécurité", competence: "Sécurité industrielle", difficulte: "Facile", obligatoire: true,
    formation: "FOR-SEC-01", module: "Consignes site", utilisations: 18, tauxReussite: 88, derniereUtilisation: "28/07/2026", createur: "Salma Bennis", tempsMoyen: "38 s",
  },
  {
    questionId: "Q-CBL-011", numero: 11,
    intitule: "Manipulation des connecteurs : quelle pratique garantit l'absence de déformation des clips ?",
    type: "Mise en situation",
    reponses: [
      "Insérer le connecteur en biais puis forcer",
      "Aligner le détrompeur et pousser jusqu'au clic",
      "Utiliser une pince pour comprimer le corps",
      "Chauffer légèrement le plastique",
    ],
    bonneReponse: "Aligner le détrompeur et pousser jusqu'au clic",
    explication: "Le clic confirme le verrouillage primaire, sans contrainte mécanique sur les clips.",
    points: 1, categorie: "Câblage", competence: "Assemblage connecteur", difficulte: "Difficile", obligatoire: true,
    formation: "FOR-CBL-01", module: "Techniques assemblage", utilisations: 16, tauxReussite: 71, derniereUtilisation: "28/07/2026", createur: "Karim Sebti", tempsMoyen: "1 min 12 s",
  },
  {
    questionId: "Q-SEC-014", numero: 14,
    intitule: "Signalement d'un incident : quel est le circuit correct ?",
    type: "Choix unique",
    reponses: [
      "Prévenir un collègue et continuer",
      "Alerter immédiatement le superviseur puis remplir la fiche incident",
      "Attendre la fin du poste pour en parler",
      "Noter l'incident dans son carnet personnel",
    ],
    bonneReponse: "Alerter immédiatement le superviseur puis remplir la fiche incident",
    explication: "Toute anomalie doit être remontée sans délai puis tracée par une fiche incident.",
    points: 1, categorie: "Sécurité", competence: "Sécurité industrielle", difficulte: "Difficile", obligatoire: true,
    formation: "FOR-SEC-01", module: "Consignes site", utilisations: 22, tauxReussite: 64, derniereUtilisation: "28/07/2026", createur: "Salma Bennis", tempsMoyen: "1 min 04 s",
  },
  {
    questionId: "Q-QLT-018", numero: 18,
    intitule: "Contrôle final avant expédition : quel document doit accompagner le faisceau ?",
    type: "Question avec document",
    reponses: ["Le bon de livraison seul", "La fiche de contrôle qualité signée", "Le planning de production", "Aucun document"],
    bonneReponse: "La fiche de contrôle qualité signée",
    explication: "La traçabilité impose une fiche de contrôle signée par le contrôleur.",
    points: 1, categorie: "Contrôle", competence: "Contrôle qualité", difficulte: "Difficile", obligatoire: true,
    formation: "FOR-QC-01", module: "Contrôle qualité", utilisations: 14, tauxReussite: 58, derniereUtilisation: "28/07/2026", createur: "Amina Rajouh", tempsMoyen: "1 min 21 s",
  },
  {
    questionId: "Q-QLT-004", numero: 4,
    intitule: "Que signifie un défaut de type « crimp insuffisant » ?",
    type: "Choix unique",
    reponses: ["Sertissage trop serré", "Sertissage incomplet du contact", "Fil trop long", "Connecteur mal référencé"],
    bonneReponse: "Sertissage incomplet du contact",
    explication: "Un crimp insuffisant provoque une résistance de contact et un risque d'arrachement.",
    points: 1, categorie: "Qualité", competence: "Contrôle qualité", difficulte: "Moyenne", obligatoire: true,
    formation: "FOR-QC-01", module: "Principes qualité", utilisations: 12, tauxReussite: 81, derniereUtilisation: "24/07/2026", createur: "Karim Sebti", tempsMoyen: "44 s",
  },
  {
    questionId: "Q-CBL-005", numero: 5,
    intitule: "Identifier sur le schéma la position du connecteur C12.",
    type: "Question avec image",
    reponses: ["Repère A", "Repère B", "Repère C", "Repère D"],
    bonneReponse: "Repère C",
    explication: "Le connecteur C12 se situe en sortie de branche moteur, repère C du plan.",
    points: 2, categorie: "Lecture instructions", competence: "Lecture de plan", difficulte: "Moyenne", obligatoire: false,
    formation: "FOR-CBL-01", module: "Introduction câblage", utilisations: 9, tauxReussite: 77, derniereUtilisation: "24/07/2026", createur: "Karim Sebti", tempsMoyen: "1 min 08 s",
  },
  {
    questionId: "Q-CBL-006", numero: 6,
    intitule: "Citez la première étape de préparation du poste de câblage.",
    type: "Réponse courte",
    reponses: [],
    bonneReponse: "Vérifier la propreté et la conformité de la planche de câblage",
    explication: "La préparation du poste conditionne la qualité et la sécurité du montage.",
    points: 1, categorie: "Process industriel", competence: "Préparation poste", difficulte: "Moyenne", obligatoire: false,
    formation: "FOR-CBL-01", module: "Introduction câblage", utilisations: 7, tauxReussite: 74, derniereUtilisation: "24/07/2026", createur: "Salma Bennis", tempsMoyen: "1 min 30 s",
  },
  {
    questionId: "Q-ASM-009", numero: 9,
    intitule: "Réaliser l'assemblage d'un connecteur 12 voies selon l'instruction IT-114.",
    type: "Question pratique",
    reponses: [],
    bonneReponse: "Assemblage conforme, verrouillage secondaire posé, test de traction validé",
    explication: "Évaluée par le formateur sur poste selon la grille pratique.",
    points: 5, categorie: "Assemblage", competence: "Assemblage connecteur", difficulte: "Difficile", obligatoire: true,
    formation: "FOR-CBL-01", module: "Techniques assemblage", utilisations: 6, tauxReussite: 74, derniereUtilisation: "22/07/2026", createur: "Karim Sebti", tempsMoyen: "8 min",
  },
  {
    questionId: "Q-MNT-002", numero: 12,
    intitule: "Quelle action est interdite à l'opérateur sur une machine de coupe ?",
    type: "Choix unique",
    reponses: ["Nettoyer le poste", "Changer une lame", "Signaler une anomalie", "Arrêter la machine"],
    bonneReponse: "Changer une lame",
    explication: "Le changement de lame relève exclusivement de la maintenance habilitée.",
    points: 1, categorie: "Maintenance", competence: "Sécurité industrielle", difficulte: "Facile", obligatoire: true,
    formation: "FOR-SEC-01", module: "Risques industriels", utilisations: 11, tauxReussite: 90, derniereUtilisation: "20/07/2026", createur: "Amina Rajouh", tempsMoyen: "35 s",
  },
  {
    questionId: "Q-LOG-001", numero: 13,
    intitule: "Où déposer un faisceau terminé en attente de contrôle ?",
    type: "Choix unique",
    reponses: ["Sur la zone d'expédition", "Sur le rack de contrôle intermédiaire", "Au sol près du poste", "Dans le chariot rebut"],
    bonneReponse: "Sur le rack de contrôle intermédiaire",
    explication: "Le flux impose un passage par le rack de contrôle avant expédition.",
    points: 1, categorie: "Logistique", competence: "Flux logistique", difficulte: "Facile", obligatoire: false,
    formation: "FOR-QC-01", module: "Contrôle qualité", utilisations: 8, tauxReussite: 85, derniereUtilisation: "20/07/2026", createur: "Karim Sebti", tempsMoyen: "29 s",
  },
  {
    questionId: "Q-SEC-020", numero: 20,
    intitule: "Un collègue ne porte pas ses gants. Que faites-vous ?",
    type: "Mise en situation",
    reponses: [
      "Rien, ce n'est pas mon rôle",
      "Lui rappeler la consigne et alerter le superviseur si besoin",
      "Lui prêter mes gants",
      "Le signaler en fin de semaine",
    ],
    bonneReponse: "Lui rappeler la consigne et alerter le superviseur si besoin",
    explication: "La sécurité est une responsabilité collective et immédiate.",
    points: 1, categorie: "Sécurité", competence: "Sécurité industrielle", difficulte: "Moyenne", obligatoire: true,
    formation: "FOR-SEC-01", module: "Consignes site", utilisations: 15, tauxReussite: 83, derniereUtilisation: "28/07/2026", createur: "Salma Bennis", tempsMoyen: "52 s",
  },
];

/* --------------------------- Jeux de réponses -------------------------- */

const Q_SEC = [
  "Q-SEC-001", "Q-SEC-002", "Q-SEC-003", "Q-QLT-004", "Q-CBL-005",
  "Q-CBL-006", "Q-SEC-007", "Q-QLT-018", "Q-MNT-002", "Q-LOG-001",
  "Q-CBL-011", "Q-SEC-014", "Q-SEC-020",
];

function questionsDe(ids: string[]): Question[] {
  return ids
    .map((id) => BIBLIOTHEQUE.find((q) => q.questionId === id))
    .filter((q): q is Question => Boolean(q))
    .map((q, i) => ({ ...q, numero: i + 1 }));
}

/** Génère des réponses cohérentes avec le score obtenu (SSOT déterministe). */
function reponsesPour(questions: Question[], score: number): Reponse[] {
  const total = questions.reduce((s, q) => s + q.points, 0);
  let aObtenir = Math.round((score / 100) * total);
  return questions.map((q) => {
    const correcte = aObtenir >= q.points;
    if (correcte) aObtenir -= q.points;
    return {
      questionId: q.questionId,
      donnee: correcte ? q.bonneReponse : q.reponses.find((r) => r !== q.bonneReponse) ?? "Sans réponse",
      correcte,
      points: correcte ? q.points : 0,
    };
  });
}

const QUESTIONS_SEC = questionsDe(Q_SEC);

function participant(
  n: number,
  ouvrier: string,
  workerId: string,
  site: string,
  groupe: string,
  statut: StatutParticipant,
  score: number | null,
  debut = "",
  fin = "",
  duree = "",
  progression?: string,
): Participant {
  return {
    assignmentId: `AFF-SEC-${String(n).padStart(3, "0")}`,
    attemptId: `ATT-SEC-${String(n).padStart(3, "0")}`,
    resultId: `RES-SEC-${String(n).padStart(3, "0")}`,
    workerId,
    ouvrier,
    site,
    groupe,
    statut,
    debut,
    fin,
    duree,
    tentative: 1,
    score,
    progression,
    notification: statut === "Non commencé" ? "Distribué" : "Lu",
    reponses: score === null ? [] : reponsesPour(QUESTIONS_SEC, score),
  };
}

const PARTICIPANTS_SEC: Participant[] = [
  participant(1, "Sara Amrani", "LMA-BOU-2026-0418", "Bouskoura", "CBL-07", "Terminé", 95, "28/07 09:02", "28/07 09:18", "16 min"),
  participant(2, "Mehdi Berrada", "LMA-BER-2026-0312", "Berrechid", "QC-04", "Terminé", 82, "28/07 09:11", "28/07 09:31", "20 min"),
  participant(3, "Mariam Lahlou", "LMA-BOU-2026-0435", "Bouskoura", "CBL-07", "Terminé", 78, "28/07 09:05", "28/07 09:23", "18 min"),
  participant(4, "Khadija Rami", "LMA-BOU-2026-0395", "Bouskoura", "CBL-07", "Terminé", 55, "28/07 09:07", "28/07 09:28", "21 min"),
  participant(5, "Anas El Fassi", "LMA-BZN-2026-0208", "Bouznika", "ASM-02", "Terminé", 90, "28/07 09:03", "28/07 09:20", "17 min"),
  participant(6, "Youssef El Mansouri", "LMA-BOU-2026-0442", "Bouskoura", "CBL-07", "En cours", null, "28/07 09:14", "", "", "Question 14/20"),
  participant(7, "Imane Ouazzani", "LMA-BER-2026-0331", "Berrechid", "QC-04", "En cours", null, "28/07 09:16", "", "", "Question 8/20"),
  participant(8, "Hicham Naciri", "LMA-BOU-2026-0402", "Bouskoura", "CBL-07", "Non commencé", null),
  participant(9, "Salma Draoui", "LMA-BZN-2026-0219", "Bouznika", "ASM-02", "Non commencé", null),
  participant(10, "Rachid Bouhlal", "LMA-BER-2026-0348", "Berrechid", "QC-04", "Absent", null),
];

/* ---------------------------- Évaluations ----------------------------- */

export const EVALUATIONS_INITIALES: Evaluation[] = [
  {
    evaluationId: "EVA-001",
    code: "QCM-SEC-01",
    titre: "Sécurité et EPI",
    description: "Évaluation des connaissances sécurité, port des EPI et conduite à tenir en cas d'incident.",
    type: "QCM",
    formation: "FOR-CBL-01 – Intégration opérateur câblage",
    module: "Sécurité & EPI",
    competence: "Sécurité industrielle",
    site: "Tous les sites",
    langue: "Français",
    niveau: "Débutant",
    statut: "Terminé",
    dateCreation: "15/07/2026",
    datePassage: "28/07/2026",
    ouverture: "28/07/2026 08:00",
    fermeture: "28/07/2026 17:00",
    duree: 25,
    seuil: 80,
    tentatives: 2,
    ordreQuestionsAleatoire: true,
    ordreReponsesAleatoire: true,
    resultatImmediat: true,
    afficherBonnesReponses: true,
    retourArriere: false,
    pleinEcran: true,
    validationAuto: true,
    rappels: ["24 h avant", "2 h avant", "30 min avant"],
    canaux: ["WhatsApp", "Email", "Notification"],
    createur: "Salma Bennis",
    questions: QUESTIONS_SEC,
    participants: PARTICIPANTS_SEC,
  },
  {
    evaluationId: "EVA-002",
    code: "QCM-CBL-04",
    titre: "Fondamentaux du câblage",
    description: "Contrôle des acquis sur la lecture de plan, la préparation de poste et le sertissage.",
    type: "QCM",
    formation: "FOR-CBL-01 – Intégration opérateur câblage",
    module: "Introduction câblage",
    competence: "Lecture de plan",
    site: "Bouskoura",
    langue: "Français",
    niveau: "Débutant",
    statut: "En cours",
    dateCreation: "19/07/2026",
    datePassage: "30/07/2026",
    ouverture: "30/07/2026 08:30",
    fermeture: "30/07/2026 16:00",
    duree: 20,
    seuil: 75,
    tentatives: 2,
    ordreQuestionsAleatoire: true,
    ordreReponsesAleatoire: false,
    resultatImmediat: true,
    afficherBonnesReponses: false,
    retourArriere: true,
    pleinEcran: false,
    validationAuto: true,
    rappels: ["24 h avant", "2 h avant"],
    canaux: ["WhatsApp", "Notification"],
    createur: "Karim Sebti",
    questions: questionsDe(["Q-CBL-005", "Q-CBL-006", "Q-CBL-011", "Q-QLT-004", "Q-LOG-001"]),
    participants: [
      {
        assignmentId: "AFF-CBL-001", attemptId: "ATT-CBL-001", resultId: "RES-CBL-001",
        workerId: "LMA-BOU-2026-0418", ouvrier: "Sara Amrani", site: "Bouskoura", groupe: "CBL-07",
        statut: "Terminé", debut: "30/07 08:35", fin: "30/07 08:52", duree: "17 min", tentative: 1, score: 88,
        notification: "Lu", reponses: [],
      },
      {
        assignmentId: "AFF-CBL-002", attemptId: "ATT-CBL-002", resultId: "RES-CBL-002",
        workerId: "LMA-BOU-2026-0435", ouvrier: "Mariam Lahlou", site: "Bouskoura", groupe: "CBL-07",
        statut: "Terminé", debut: "30/07 08:36", fin: "30/07 08:58", duree: "22 min", tentative: 1, score: 72,
        notification: "Lu", reponses: [],
      },
      {
        assignmentId: "AFF-CBL-003", attemptId: "ATT-CBL-003", resultId: "RES-CBL-003",
        workerId: "LMA-BOU-2026-0402", ouvrier: "Hicham Naciri", site: "Bouskoura", groupe: "CBL-07",
        statut: "En cours", debut: "30/07 08:40", fin: "", duree: "", tentative: 1, score: null,
        progression: "Question 3/5", notification: "Ouvert", reponses: [],
      },
    ],
  },
  {
    evaluationId: "EVA-003",
    code: "TEST-QLT-03",
    titre: "Contrôle qualité final",
    description: "Test théorique de validation des règles de contrôle avant expédition.",
    type: "Test théorique",
    formation: "FOR-QC-01 – Contrôle qualité",
    module: "Contrôle qualité",
    competence: "Contrôle qualité",
    site: "Berrechid",
    langue: "Français",
    niveau: "Intermédiaire",
    statut: "Programmé",
    dateCreation: "22/07/2026",
    datePassage: "31/07/2026",
    ouverture: "31/07/2026 09:00",
    fermeture: "31/07/2026 12:00",
    duree: 30,
    seuil: 80,
    tentatives: 2,
    ordreQuestionsAleatoire: false,
    ordreReponsesAleatoire: false,
    resultatImmediat: false,
    afficherBonnesReponses: false,
    retourArriere: true,
    pleinEcran: true,
    validationAuto: false,
    rappels: ["24 h avant"],
    canaux: ["Email", "Notification"],
    createur: "Amina Rajouh",
    questions: questionsDe(["Q-QLT-004", "Q-QLT-018", "Q-LOG-001"]),
    participants: [],
  },
  {
    evaluationId: "EVA-004",
    code: "TEST-PRAT-01",
    titre: "Assemblage connecteur – validation pratique",
    description: "Évaluation pratique sur poste réalisée par le formateur selon la grille de 7 critères.",
    type: "Test pratique",
    formation: "FOR-CBL-01 – Intégration opérateur câblage",
    module: "Techniques assemblage",
    competence: "Assemblage connecteur",
    site: "Bouskoura",
    langue: "Français",
    niveau: "Intermédiaire",
    statut: "Brouillon",
    dateCreation: "25/07/2026",
    datePassage: "01/08/2026",
    ouverture: "01/08/2026 08:00",
    fermeture: "01/08/2026 12:00",
    duree: 45,
    seuil: 70,
    tentatives: 1,
    ordreQuestionsAleatoire: false,
    ordreReponsesAleatoire: false,
    resultatImmediat: false,
    afficherBonnesReponses: false,
    retourArriere: false,
    pleinEcran: false,
    validationAuto: false,
    rappels: ["24 h avant"],
    canaux: ["WhatsApp"],
    createur: "Karim Sebti",
    questions: questionsDe(["Q-ASM-009"]),
    participants: [],
    criteres: [
      { critere: "Préparation du poste", note: 4, max: 5 },
      { critere: "Respect des instructions", note: 4, max: 5 },
      { critere: "Précision", note: 3, max: 5 },
      { critere: "Qualité d'assemblage", note: 4, max: 5 },
      { critere: "Temps de réalisation", note: 3, max: 5 },
      { critere: "Sécurité", note: 5, max: 5 },
      { critere: "Autonomie", note: 3, max: 5 },
    ],
    commentaireFormateur:
      "Geste maîtrisé sur le verrouillage primaire. À renforcer : cadence et autocontrôle avant passage au rack.",
  },
  {
    evaluationId: "EVA-005",
    code: "QCM-CBL-02",
    titre: "Introduction au câblage",
    description: "QCM de fin de module d'introduction au câblage.",
    type: "QCM",
    formation: "FOR-CBL-01 – Intégration opérateur câblage",
    module: "Introduction câblage",
    competence: "Lecture de plan",
    site: "Bouskoura",
    langue: "Français",
    niveau: "Débutant",
    statut: "Terminé",
    dateCreation: "12/07/2026",
    datePassage: "24/07/2026",
    ouverture: "24/07/2026 08:00",
    fermeture: "24/07/2026 12:00",
    duree: 20,
    seuil: 75,
    tentatives: 2,
    ordreQuestionsAleatoire: true,
    ordreReponsesAleatoire: true,
    resultatImmediat: true,
    afficherBonnesReponses: true,
    retourArriere: false,
    pleinEcran: false,
    validationAuto: true,
    rappels: ["24 h avant"],
    canaux: ["WhatsApp"],
    createur: "Karim Sebti",
    questions: questionsDe(["Q-CBL-005", "Q-CBL-006", "Q-QLT-004"]),
    participants: [
      {
        assignmentId: "AFF-C2-001", attemptId: "ATT-C2-001", resultId: "RES-C2-001",
        workerId: "LMA-BOU-2026-0418", ouvrier: "Sara Amrani", site: "Bouskoura", groupe: "CBL-07",
        statut: "Terminé", debut: "24/07 08:10", fin: "24/07 08:27", duree: "17 min", tentative: 1, score: 82,
        notification: "Lu", reponses: [],
      },
      {
        assignmentId: "AFF-C2-002", attemptId: "ATT-C2-002", resultId: "RES-C2-002",
        workerId: "LMA-BER-2026-0312", ouvrier: "Mehdi Berrada", site: "Berrechid", groupe: "QC-04",
        statut: "Terminé", debut: "24/07 08:12", fin: "24/07 08:33", duree: "21 min", tentative: 1, score: 91,
        notification: "Lu", reponses: [],
      },
      {
        assignmentId: "AFF-C2-003", attemptId: "ATT-C2-003", resultId: "RES-C2-003",
        workerId: "LMA-BOU-2026-0395", ouvrier: "Khadija Rami", site: "Bouskoura", groupe: "CBL-07",
        statut: "Terminé", debut: "24/07 08:15", fin: "24/07 08:39", duree: "24 min", tentative: 1, score: 61,
        notification: "Lu", reponses: [],
      },
    ],
  },
  {
    evaluationId: "EVA-006",
    code: "TEST-QLT-01",
    titre: "Principes qualité",
    description: "Test de connaissances sur les principes qualité LEONI et les défauts majeurs.",
    type: "Test de connaissances",
    formation: "FOR-QC-01 – Contrôle qualité",
    module: "Principes qualité",
    competence: "Contrôle qualité",
    site: "Berrechid",
    langue: "Français",
    niveau: "Intermédiaire",
    statut: "Terminé",
    dateCreation: "10/07/2026",
    datePassage: "20/07/2026",
    ouverture: "20/07/2026 09:00",
    fermeture: "20/07/2026 12:00",
    duree: 25,
    seuil: 80,
    tentatives: 2,
    ordreQuestionsAleatoire: false,
    ordreReponsesAleatoire: true,
    resultatImmediat: true,
    afficherBonnesReponses: true,
    retourArriere: true,
    pleinEcran: false,
    validationAuto: true,
    rappels: ["24 h avant", "2 h avant"],
    canaux: ["Email"],
    createur: "Amina Rajouh",
    questions: questionsDe(["Q-QLT-004", "Q-QLT-018", "Q-LOG-001", "Q-MNT-002"]),
    participants: [
      {
        assignmentId: "AFF-Q1-001", attemptId: "ATT-Q1-001", resultId: "RES-Q1-001",
        workerId: "LMA-BER-2026-0312", ouvrier: "Mehdi Berrada", site: "Berrechid", groupe: "QC-04",
        statut: "Terminé", debut: "20/07 09:05", fin: "20/07 09:24", duree: "19 min", tentative: 1, score: 86,
        notification: "Lu", reponses: [],
      },
      {
        assignmentId: "AFF-Q1-002", attemptId: "ATT-Q1-002", resultId: "RES-Q1-002",
        workerId: "LMA-BER-2026-0331", ouvrier: "Imane Ouazzani", site: "Berrechid", groupe: "QC-04",
        statut: "Terminé", debut: "20/07 09:04", fin: "20/07 09:27", duree: "23 min", tentative: 1, score: 74,
        notification: "Lu", reponses: [],
      },
    ],
  },
  {
    evaluationId: "EVA-007",
    code: "TEST-PRAT-00",
    titre: "Assemblage connecteur – Sara Amrani",
    description: "Évaluation pratique réalisée sur poste par le formateur.",
    type: "Test pratique",
    formation: "FOR-CBL-01 – Intégration opérateur câblage",
    module: "Techniques assemblage",
    competence: "Assemblage connecteur",
    site: "Bouskoura",
    langue: "Français",
    niveau: "Intermédiaire",
    statut: "Terminé",
    dateCreation: "18/07/2026",
    datePassage: "22/07/2026",
    ouverture: "22/07/2026 08:00",
    fermeture: "22/07/2026 12:00",
    duree: 45,
    seuil: 70,
    tentatives: 1,
    ordreQuestionsAleatoire: false,
    ordreReponsesAleatoire: false,
    resultatImmediat: false,
    afficherBonnesReponses: false,
    retourArriere: false,
    pleinEcran: false,
    validationAuto: false,
    rappels: [],
    canaux: ["Notification"],
    createur: "Karim Sebti",
    questions: questionsDe(["Q-ASM-009"]),
    participants: [
      {
        assignmentId: "AFF-P0-001", attemptId: "ATT-P0-001", resultId: "RES-P0-001",
        workerId: "LMA-BOU-2026-0418", ouvrier: "Sara Amrani", site: "Bouskoura", groupe: "CBL-07",
        statut: "Terminé", debut: "22/07 08:30", fin: "22/07 09:12", duree: "42 min", tentative: 1, score: 91,
        notification: "Lu", reponses: [],
      },
    ],
    criteres: [
      { critere: "Préparation du poste", note: 5, max: 5 },
      { critere: "Respect des instructions", note: 5, max: 5 },
      { critere: "Précision", note: 4, max: 5 },
      { critere: "Qualité d'assemblage", note: 5, max: 5 },
      { critere: "Temps de réalisation", note: 4, max: 5 },
      { critere: "Sécurité", note: 5, max: 5 },
      { critere: "Autonomie", note: 4, max: 5 },
    ],
    commentaireFormateur: "Très bonne autonomie, gestes conformes à l'instruction IT-114.",
  },
];

/* ------------------------------ Rattrapages ---------------------------- */

export const RATTRAPAGES_INITIAUX: Rattrapage[] = [
  {
    id: "RAT-001", workerId: "LMA-BOU-2026-0435", ouvrier: "Mariam Lahlou",
    evaluationId: "EVA-001", evaluation: "Sécurité et EPI", score: 78, seuil: 80,
    tentative: "1/2", site: "Bouskoura", statut: "À programmer",
  },
  {
    id: "RAT-002", workerId: "LMA-BOU-2026-0395", ouvrier: "Khadija Rami",
    evaluationId: "EVA-001", evaluation: "Sécurité et EPI", score: 55, seuil: 80,
    tentative: "1/2", site: "Bouskoura", statut: "À programmer",
  },
  {
    id: "RAT-003", workerId: "LMA-BOU-2026-0435", ouvrier: "Mariam Lahlou",
    evaluationId: "EVA-002", evaluation: "Fondamentaux du câblage", score: 72, seuil: 75,
    tentative: "1/2", site: "Bouskoura", statut: "À programmer",
  },
  {
    id: "RAT-004", workerId: "LMA-BOU-2026-0395", ouvrier: "Khadija Rami",
    evaluationId: "EVA-005", evaluation: "Introduction au câblage", score: 61, seuil: 75,
    tentative: "1/2", site: "Bouskoura", statut: "Programmé",
    date: "03/08/2026", heure: "09:00", lieu: "Salle formation B – Bouskoura", formateur: "Karim Sebti",
  },
  {
    id: "RAT-005", workerId: "LMA-BER-2026-0331", ouvrier: "Imane Ouazzani",
    evaluationId: "EVA-006", evaluation: "Principes qualité", score: 74, seuil: 80,
    tentative: "1/2", site: "Berrechid", statut: "À programmer",
  },
];

/* --------------------------------- Audit -------------------------------- */

export const AUDIT_INITIAL: EntreeAudit[] = [
  { id: "AUD-001", date: "15/07/2026 10:24", utilisateur: "Salma Bennis", evaluationId: "EVA-001", action: "Création", detail: "Création de QCM-SEC-01 — Sécurité et EPI" },
  { id: "AUD-002", date: "16/07/2026 15:31", utilisateur: "Salma Bennis", evaluationId: "EVA-001", action: "Modification", detail: "Ajout de 4 questions depuis la bibliothèque" },
  { id: "AUD-003", date: "22/07/2026 11:05", utilisateur: "Karim Sebti", evaluationId: "EVA-007", action: "Correction", detail: "Grille pratique saisie — Sara Amrani 26/35" },
  { id: "AUD-004", date: "25/07/2026 09:00", utilisateur: "Amina Rajouh", evaluationId: "EVA-001", action: "Publication", detail: "Publication et diffusion à 120 participants" },
  { id: "AUD-005", date: "25/07/2026 09:01", utilisateur: "Système", evaluationId: "EVA-001", action: "Affectation", detail: "Génération de 120 affectations (WhatsApp, Email)" },
  { id: "AUD-006", date: "28/07/2026 09:18", utilisateur: "Sara Amrani", evaluationId: "EVA-001", action: "Passage", detail: "Évaluation terminée — 95 %" },
  { id: "AUD-007", date: "28/07/2026 09:28", utilisateur: "Khadija Rami", evaluationId: "EVA-001", action: "Résultat", detail: "Évaluation terminée — 55 % (échec)" },
  { id: "AUD-008", date: "28/07/2026 09:35", utilisateur: "Système", evaluationId: "EVA-001", action: "Rattrapage", detail: "2 besoins de rattrapage créés" },
];

/* -------------------------- Statistiques module ------------------------- */

export const EVAL_PAR_MOIS = [
  { mois: "Janvier", evaluations: 19 },
  { mois: "Février", evaluations: 23 },
  { mois: "Mars", evaluations: 28 },
  { mois: "Avril", evaluations: 31 },
  { mois: "Mai", evaluations: 26 },
  { mois: "Juin", evaluations: 32 },
  { mois: "Juillet", evaluations: 34 },
];

export const TAUX_REUSSITE_GLOBAL = [
  { label: "Réussi", valeur: 79, ton: "success" as const },
  { label: "Échoué", valeur: 14, ton: "critical" as const },
  { label: "Non terminé", valeur: 5, ton: "warning" as const },
  { label: "Absent", valeur: 2, ton: "neutral" as const },
];

export const SCORE_PAR_TYPE = [
  { type: "Sécurité", score: 86 },
  { type: "Qualité", score: 82 },
  { type: "Câblage", score: 79 },
  { type: "Assemblage", score: 84 },
  { type: "Contrôle", score: 76 },
];

export const KPIS_MODULE = {
  actives: 12,
  ceMois: 34,
  participantsPrevus: 486,
  participantsTermines: 421,
  tauxParticipation: 86.6,
  scoreMoyen: 81,
  sousSeuil: 47,
  rattrapagesAProgrammer: 18,
};

export const GROUPES = ["CBL-07", "QC-04", "ASM-02", "SEC-01"];
export const FORMATEURS = ["Karim Sebti", "Salma Bennis", "Amina Rajouh", "Youssef Tahiri"];
export const LIEUX = [
  "Salle formation A – Bouskoura",
  "Salle formation B – Bouskoura",
  "Salle polyvalente – Berrechid",
  "Atelier école – Bouznika",
];
