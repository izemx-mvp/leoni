/**
 * Espace Ouvrier — objets partagés avec le Backoffice.
 * Chaque objet porte une visibilité (`internal` | `worker-visible`) : seuls les
 * éléments `worker-visible` sont exposés dans l'Espace Ouvrier.
 */

export type Visibilite = "internal" | "worker-visible";

export const OUVRIER_DEMO_ID = "LMA-BOU-2026-0418";

/* ------------------------------ Évaluations ------------------------------ */

export type TypeQuestion =
  | "Choix unique"
  | "Choix multiples"
  | "Vrai / Faux"
  | "Réponse courte"
  | "Image"
  | "Document"
  | "Mise en situation";

export interface QuestionQcm {
  id: string;
  type: TypeQuestion;
  enonce: string;
  aide?: string;
  options?: string[];
  bonnes?: number[];
  reponseAttendue?: string;
  theme: string;
}

export interface EvaluationOuvrier {
  id: string;
  titre: string;
  type: "QCM" | "Test pratique";
  module: string;
  questions: QuestionQcm[];
  dureeMinutes: number;
  seuil: number;
  tentativesMax: number;
  tentativesUtilisees: number;
  limite: string;
  statut: "À passer" | "En cours" | "Terminée";
  resultatImmediat: boolean;
  instructions: string;
  visibilite: Visibilite;
}

export interface ResultatOuvrier {
  id: string;
  evaluationId: string;
  titre: string;
  type: "QCM" | "Test pratique";
  date: string;
  score: number;
  seuil: number;
  reussi: boolean;
  tentative: number;
  dureeMinutes: number;
  bonnes?: number;
  total?: number;
  pointsForts: string[];
  aRevoir: string[];
  evaluateur?: string;
  criteres?: { label: string; note: number; sur: number }[];
  rattrapage?: { date: string; heure: string; salle: string };
}

const QUESTIONS_SECURITE: QuestionQcm[] = [
  {
    id: "Q1",
    type: "Choix unique",
    theme: "Sécurité générale",
    enonce: "Quelle est la première action avant d'entrer dans une zone de production ?",
    options: ["Vérifier son téléphone", "Porter les EPI requis", "Commencer son poste", "Consulter le planning"],
    bonnes: [1],
  },
  {
    id: "Q2",
    type: "Choix multiples",
    theme: "EPI",
    enonce: "Quels équipements sont obligatoires dans l'atelier câblage ? (plusieurs réponses)",
    options: ["Blouse", "Chaussures de sécurité", "Casque de chantier", "Gilet de signalisation"],
    bonnes: [0, 1, 3],
  },
  {
    id: "Q3",
    type: "Vrai / Faux",
    theme: "EPI",
    enonce: "Des gants abîmés peuvent être utilisés jusqu'à la fin du poste.",
    options: ["Vrai", "Faux"],
    bonnes: [1],
  },
  {
    id: "Q4",
    type: "Choix unique",
    theme: "Gestion incident",
    enonce: "Vous constatez une fuite d'huile près d'une ligne. Que faites-vous en premier ?",
    options: [
      "Vous nettoyez seule immédiatement",
      "Vous signalez au superviseur et balisez la zone",
      "Vous continuez votre poste",
      "Vous prévenez la fin de journée",
    ],
    bonnes: [1],
  },
  {
    id: "Q5",
    type: "Image",
    theme: "Sécurité générale",
    enonce: "Le pictogramme affiché à l'entrée de la zone coupe signifie :",
    aide: "Pictogramme rond bleu représentant une paire de lunettes.",
    options: ["Interdiction de passer", "Port des lunettes obligatoire", "Danger électrique", "Sortie de secours"],
    bonnes: [1],
  },
  {
    id: "Q6",
    type: "Mise en situation",
    theme: "Gestion incident",
    enonce:
      "Une collègue se coupe légèrement le doigt sur un connecteur. Quelle est la bonne séquence d'actions ?",
    options: [
      "Terminer la série puis l'accompagner à l'infirmerie",
      "Arrêter le poste, alerter le secouriste et déclarer l'incident",
      "Lui donner un pansement et ne rien signaler",
      "Appeler directement la direction",
    ],
    bonnes: [1],
  },
  {
    id: "Q7",
    type: "Vrai / Faux",
    theme: "Sécurité générale",
    enonce: "Les issues de secours peuvent servir de zone de stockage temporaire.",
    options: ["Vrai", "Faux"],
    bonnes: [1],
  },
  {
    id: "Q8",
    type: "Réponse courte",
    theme: "EPI",
    enonce: "Que signifie l'abréviation EPI ?",
    reponseAttendue: "équipement de protection individuelle",
  },
  {
    id: "Q9",
    type: "Document",
    theme: "Sécurité générale",
    enonce:
      "Selon la consigne LEONI SEC-04 remise en formation, à quelle fréquence l'état des EPI doit-il être vérifié ?",
    aide: "Document de référence : Consigne SEC-04 — Contrôle des équipements.",
    options: ["Chaque semaine", "Avant chaque prise de poste", "Une fois par mois", "À la demande du superviseur"],
    bonnes: [1],
  },
  {
    id: "Q10",
    type: "Choix unique",
    theme: "Gestion incident",
    enonce: "En cas d'évacuation, où devez-vous vous rendre ?",
    options: ["Au vestiaire", "Au point de rassemblement PR-2", "Au parking visiteurs", "À la cantine"],
    bonnes: [1],
  },
];

export const EVALUATIONS_OUVRIER: EvaluationOuvrier[] = [
  {
    id: "QCM-SEC-01",
    titre: "Sécurité & EPI",
    type: "QCM",
    module: "03 — Sécurité & EPI",
    questions: QUESTIONS_SECURITE,
    dureeMinutes: 25,
    seuil: 80,
    tentativesMax: 2,
    tentativesUtilisees: 0,
    limite: "28/07/2026 17:00",
    statut: "À passer",
    resultatImmediat: true,
    instructions:
      "Répondez à l'ensemble des questions. Vous pouvez revenir en arrière tant que le temps n'est pas écoulé. Vos réponses sont sauvegardées automatiquement.",
    visibilite: "worker-visible",
  },
  {
    id: "QCM-CQ-02",
    titre: "Contrôle qualité",
    type: "QCM",
    module: "09 — Contrôle qualité",
    questions: QUESTIONS_SECURITE.slice(0, 6).map((q, i) => ({ ...q, id: `CQ${i + 1}` })),
    dureeMinutes: 20,
    seuil: 75,
    tentativesMax: 2,
    tentativesUtilisees: 0,
    limite: "30/07/2026 14:00",
    statut: "À passer",
    resultatImmediat: false,
    instructions: "Évaluation programmée à l'issue du module Contrôle qualité du 30 juillet.",
    visibilite: "worker-visible",
  },
];

export const RESULTATS_INITIAUX: ResultatOuvrier[] = [
  {
    id: "RES-0031",
    evaluationId: "QCM-CBL-01",
    titre: "Introduction câblage",
    type: "QCM",
    date: "24/07/2026",
    score: 82,
    seuil: 75,
    reussi: true,
    tentative: 1,
    dureeMinutes: 14,
    bonnes: 16,
    total: 20,
    pointsForts: ["Repérage des connecteurs", "Vocabulaire technique"],
    aRevoir: ["Codes couleurs faisceaux"],
  },
  {
    id: "RES-0028",
    evaluationId: "PRA-ASM-01",
    titre: "Assemblage connecteur",
    type: "Test pratique",
    date: "22/07/2026",
    score: 91,
    seuil: 75,
    reussi: true,
    tentative: 1,
    dureeMinutes: 45,
    pointsForts: ["Gestes précis", "Respect des consignes de sécurité"],
    aRevoir: ["Cadence à consolider"],
    evaluateur: "Salma Bennis",
    criteres: [
      { label: "Précision", note: 4.5, sur: 5 },
      { label: "Sécurité", note: 5, sur: 5 },
      { label: "Qualité", note: 4.4, sur: 5 },
      { label: "Autonomie", note: 4, sur: 5 },
    ],
  },
  {
    id: "RES-0024",
    evaluationId: "QCM-LEC-01",
    titre: "Lecture des plans de câblage",
    type: "QCM",
    date: "21/07/2026",
    score: 78,
    seuil: 75,
    reussi: true,
    tentative: 1,
    dureeMinutes: 18,
    bonnes: 14,
    total: 18,
    pointsForts: ["Lecture de nomenclature"],
    aRevoir: ["Symboles techniques"],
  },
];

/* -------------------------------- Documents ------------------------------- */

export type StatutDocumentOuvrier =
  | "À fournir"
  | "Envoyé"
  | "En vérification"
  | "Validé"
  | "À remplacer"
  | "Refusé";

export interface DocumentEspace {
  id: string;
  nom: string;
  categorie: "Demandé" | "Personnel";
  demandePar?: string;
  dateDemande?: string;
  dateLimite?: string;
  statut: StatutDocumentOuvrier;
  motif?: string;
  fichier?: string;
  taille?: string;
  dateDepot?: string;
  visibilite: Visibilite;
}

export const DOCUMENTS_ESPACE: DocumentEspace[] = [
  { id: "DOC-RIB", nom: "RIB bancaire", categorie: "Demandé", demandePar: "RH Site Bouskoura", dateDemande: "28/07/2026", dateLimite: "01/08/2026", statut: "À fournir", visibilite: "worker-visible" },
  { id: "DOC-CNSS", nom: "Carte CNSS", categorie: "Demandé", demandePar: "RH Site Bouskoura", dateDemande: "26/07/2026", dateLimite: "03/08/2026", statut: "À remplacer", motif: "Le document n'est pas suffisamment lisible.", visibilite: "worker-visible" },
  { id: "DOC-DIP", nom: "Diplôme / attestation scolaire", categorie: "Demandé", demandePar: "RH Site Bouskoura", dateDemande: "21/07/2026", statut: "En vérification", fichier: "diplome-sara.pdf", taille: "1,2 Mo", dateDepot: "22/07/2026", visibilite: "worker-visible" },
  { id: "DOC-CJ", nom: "Casier judiciaire", categorie: "Demandé", demandePar: "RH Site Bouskoura", dateDemande: "29/07/2026", dateLimite: "12/08/2026", statut: "À fournir", motif: "Document obligatoire pour les postes critiques (contrôle final, qualité).", visibilite: "worker-visible" },
  { id: "DOC-CIN", nom: "CIN (recto/verso)", categorie: "Personnel", statut: "Validé", fichier: "cin-sara.jpg", taille: "820 Ko", dateDepot: "18/07/2026", visibilite: "worker-visible" },
  { id: "DOC-CTR", nom: "Contrat de formation signé", categorie: "Personnel", statut: "Validé", fichier: "contrat-formation.pdf", taille: "460 Ko", dateDepot: "20/07/2026", visibilite: "worker-visible" },
  { id: "DOC-ATT", nom: "Attestation de présence — juillet", categorie: "Personnel", statut: "Validé", fichier: "attestation-juillet.pdf", taille: "180 Ko", dateDepot: "27/07/2026", visibilite: "worker-visible" },
];

/* --------------------------------- Demandes ------------------------------- */

export const TYPES_DEMANDE = [
  "Demande d'attestation",
  "Demande administrative",
  "Demande de document",
  "Demande transport",
  "Changement point transport",
  "Demande d'autorisation",
  "Demande liée à la formation",
  "Demande d'information",
  "Demande liée au planning",
  "Demande d'équipement",
  "Autre",
];

export type StatutDemande =
  | "Envoyée"
  | "Reçue"
  | "En cours"
  | "Besoin d'information"
  | "Traitée"
  | "Refusée"
  | "Clôturée";

export interface MessageFil {
  auteur: string;
  role: "Ouvrier" | "RH";
  date: string;
  texte: string;
}

export interface DemandeEspace {
  id: string;
  ouvrierId: string;
  type: string;
  objet: string;
  description: string;
  urgence: "Normale" | "Élevée" | "Urgente";
  piece?: string;
  statut: StatutDemande;
  date: string;
  maj: string;
  responsable: string;
  fil: MessageFil[];
}

export const DEMANDES_INITIALES: DemandeEspace[] = [
  {
    id: "DEM-2026-00381",
    ouvrierId: OUVRIER_DEMO_ID,
    type: "Changement point transport",
    objet: "Changement de point de ramassage",
    description: "Je souhaite changer mon point de transport suite à un déménagement.",
    urgence: "Normale",
    statut: "En cours",
    date: "28/07/2026 10:04",
    maj: "28/07/2026 14:02",
    responsable: "Services généraux",
    fil: [
      { auteur: "Sara Amrani", role: "Ouvrier", date: "28/07 10:04", texte: "Je souhaite changer mon point de transport." },
      { auteur: "RH Site", role: "RH", date: "28/07 11:32", texte: "Merci de nous indiquer votre nouveau quartier." },
      { auteur: "Sara Amrani", role: "Ouvrier", date: "28/07 11:41", texte: "Hay Hassani." },
      { auteur: "RH Site", role: "RH", date: "28/07 14:02", texte: "Votre demande est en cours de traitement." },
    ],
  },
  {
    id: "DEM-2026-00374",
    ouvrierId: OUVRIER_DEMO_ID,
    type: "Demande d'attestation",
    objet: "Attestation de formation en cours",
    description: "Attestation demandée pour un dossier administratif.",
    urgence: "Normale",
    statut: "Traitée",
    date: "24/07/2026 09:15",
    maj: "26/07/2026 16:40",
    responsable: "RH Site Bouskoura",
    fil: [
      { auteur: "Sara Amrani", role: "Ouvrier", date: "24/07 09:15", texte: "Bonjour, j'ai besoin d'une attestation de formation." },
      { auteur: "RH Site", role: "RH", date: "26/07 16:40", texte: "Votre attestation est disponible dans « Mes documents »." },
    ],
  },
];

/* ------------------------------ Avertissements ---------------------------- */

export interface AvertissementEspace {
  id: string;
  ouvrierId: string;
  type: "Retard" | "Absence" | "Formation" | "Sécurité" | "Comportement" | "Document" | "Test";
  objet: string;
  niveau: "Information" | "Attention" | "Avertissement écrit";
  date: string;
  messageOuvrier: string;
  commentaireInterne: string;
  visibilite: Visibilite;
  lu?: { date: string; heure: string };
}

export const AVERTISSEMENTS_INITIAUX: AvertissementEspace[] = [
  {
    id: "AVT-2026-0142",
    ouvrierId: OUVRIER_DEMO_ID,
    type: "Retard",
    objet: "Retard répété",
    niveau: "Attention",
    date: "28/07/2026",
    messageOuvrier:
      "Deux retards ont été enregistrés cette semaine. Merci de respecter les horaires de début de poste.",
    commentaireInterne: "À surveiller sur la semaine 31 — impact ponctualité 92 %.",
    visibilite: "worker-visible",
  },
  {
    id: "AVT-2026-0128",
    ouvrierId: OUVRIER_DEMO_ID,
    type: "Document",
    objet: "Documents administratifs incomplets",
    niveau: "Information",
    date: "26/07/2026",
    messageOuvrier: "Votre dossier administratif est incomplet : RIB et carte CNSS restent à fournir.",
    commentaireInterne: "Relance automatique paramétrée à J+3.",
    visibilite: "worker-visible",
    lu: { date: "26/07/2026", heure: "18:20" },
  },
];

/* ------------------------------- Notifications ---------------------------- */

export interface NotificationOuvrier {
  id: string;
  categorie:
    | "Formation"
    | "Test"
    | "Document"
    | "Présence"
    | "Avertissement"
    | "Demande"
    | "Réclamation"
    | "Transport"
    | "RH";
  titre: string;
  message: string;
  date: string;
  priorite: "Haute" | "Normale" | "Basse";
  lu: boolean;
  action?: { label: string; to: string };
}

export const NOTIFS_OUVRIER: NotificationOuvrier[] = [
  { id: "NO-1", categorie: "Test", titre: "Nouveau QCM disponible", message: "Sécurité & EPI — à passer aujourd'hui avant 17:00.", date: "Aujourd'hui 08:05", priorite: "Haute", lu: false, action: { label: "Commencer", to: "/espace/evaluations" } },
  { id: "NO-2", categorie: "Document", titre: "Votre RIB est demandé", message: "Le service RH attend votre RIB avant le 01/08.", date: "Aujourd'hui 07:50", priorite: "Haute", lu: false, action: { label: "Envoyer", to: "/espace/documents" } },
  { id: "NO-3", categorie: "Avertissement", titre: "Avertissement à consulter", message: "Retard répété — merci d'en prendre connaissance.", date: "Aujourd'hui 07:30", priorite: "Haute", lu: false, action: { label: "Consulter", to: "/espace/presence" } },
  { id: "NO-4", categorie: "Formation", titre: "Votre planning a été modifié", message: "Contrôle qualité déplacé au 29/07 à 09:00 (salle F12).", date: "Hier 17:12", priorite: "Normale", lu: false, action: { label: "Voir le planning", to: "/espace/formation" } },
  { id: "NO-5", categorie: "Demande", titre: "Demande DEM-2026-00381 mise à jour", message: "Votre demande de changement de transport est en cours.", date: "Hier 14:02", priorite: "Normale", lu: true, action: { label: "Suivre", to: "/espace/demandes" } },
  { id: "NO-6", categorie: "Document", titre: "Votre document CIN a été validé", message: "Merci, votre CIN est conforme.", date: "18/07 11:20", priorite: "Basse", lu: true },
];

/* --------------------------------- Planning ------------------------------- */

export interface CreneauEspace {
  id: string;
  jour: string;
  jourLibelle: string;
  debut: string;
  fin: string;
  titre: string;
  lieu: string;
  site: string;
  formateur: string;
  statut: "À venir" | "En cours" | "Terminé";
}

export const PLANNING_ESPACE: CreneauEspace[] = [
  { id: "CR1", jour: "2026-07-28", jourLibelle: "Mardi 28 juillet", debut: "08:30", fin: "12:00", titre: "Introduction au câblage", lieu: "Salle F12", site: "Bouskoura", formateur: "Salma Bennis", statut: "Terminé" },
  { id: "CR2", jour: "2026-07-28", jourLibelle: "Mardi 28 juillet", debut: "13:30", fin: "17:00", titre: "Techniques d'assemblage", lieu: "Atelier A3", site: "Bouskoura", formateur: "Salma Bennis", statut: "En cours" },
  { id: "CR3", jour: "2026-07-29", jourLibelle: "Mercredi 29 juillet", debut: "09:00", fin: "12:00", titre: "Contrôle qualité", lieu: "Salle F12", site: "Bouskoura", formateur: "Otmane Rifi", statut: "À venir" },
  { id: "CR4", jour: "2026-07-29", jourLibelle: "Mercredi 29 juillet", debut: "13:30", fin: "16:30", titre: "Contrôle visuel des faisceaux", lieu: "Atelier A3", site: "Bouskoura", formateur: "Salma Bennis", statut: "À venir" },
  { id: "CR5", jour: "2026-07-30", jourLibelle: "Jeudi 30 juillet", debut: "09:00", fin: "12:00", titre: "Atelier qualité + QCM Contrôle qualité", lieu: "Salle F12", site: "Bouskoura", formateur: "Otmane Rifi", statut: "À venir" },
  { id: "CR6", jour: "2026-07-31", jourLibelle: "Vendredi 31 juillet", debut: "08:30", fin: "12:00", titre: "Évaluation pratique finale", lieu: "Atelier A3", site: "Bouskoura", formateur: "Salma Bennis", statut: "À venir" },
];

export const AUJOURDHUI = "2026-07-28";
export const AUJOURDHUI_LIBELLE = "Mardi 28 juillet 2026";

/* -------------------------------- Assistant ------------------------------- */

export const SUGGESTIONS_ASSISTANT = [
  "Quand est ma prochaine formation ?",
  "Quel document dois-je fournir ?",
  "Quel est mon score au dernier QCM ?",
  "Quel est mon trajet de transport ?",
  "Comment faire une réclamation ?",
  "Pourquoi ai-je un avertissement ?",
  "Je veux demander une attestation",
];

/* ------------------------ Paramétrage Espace Ouvrier ---------------------- */

export const MODULES_ESPACE = [
  { code: "accueil", label: "Accueil", actif: true },
  { code: "formation", label: "Ma formation", actif: true },
  { code: "evaluations", label: "Mes évaluations", actif: true },
  { code: "presence", label: "Ma présence", actif: true },
  { code: "documents", label: "Mes documents", actif: true },
  { code: "demandes", label: "Mes demandes", actif: true },
  { code: "reclamations", label: "Réclamations", actif: true },
  { code: "assistant", label: "Assistant", actif: true },
  { code: "profil", label: "Mon profil", actif: true },
];

export const CATEGORIES_RECLAMATION_OUVRIER = [
  "Formation",
  "Sécurité",
  "EPI",
  "Transport",
  "Organisation",
  "Comportement",
  "Conditions de travail",
  "Matériel",
  "Planning",
  "RH",
  "Autre",
];
