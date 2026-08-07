// Module Réclamations — modèle unique : 3 statuts seulement (new / in_progress / resolved).
// Toute la richesse fonctionnelle passe par priorité, assignation, équipe, SLA,
// conversation, actions, pièces jointes, satisfaction, historique.

export type StatutRec = "new" | "in_progress" | "resolved";

export const LIBELLE_STATUT: Record<StatutRec, string> = {
  new: "Nouveau",
  in_progress: "En cours de traitement",
  resolved: "Traité",
};

export const STATUTS: StatutRec[] = ["new", "in_progress", "resolved"];

export type PrioriteRec = "Normale" | "Élevée" | "Critique";
export const PRIORITES: PrioriteRec[] = ["Normale", "Élevée", "Critique"];

export type SlaStatut = "ok" | "risque" | "depasse";
export const LIBELLE_SLA: Record<SlaStatut, string> = {
  ok: "Dans les temps",
  risque: "À risque",
  depasse: "Dépassé",
};

export type EquipeRec =
  | "RH"
  | "Formation"
  | "Transport"
  | "Sécurité"
  | "Production"
  | "Qualité"
  | "Maintenance"
  | "Administration"
  | "IT";

export const EQUIPES: EquipeRec[] = [
  "RH",
  "Formation",
  "Transport",
  "Sécurité",
  "Production",
  "Qualité",
  "Maintenance",
  "Administration",
  "IT",
];

export const TAXONOMIE: Record<string, string[]> = {
  Transport: ["Retard", "Trajet", "Point de ramassage", "Bus absent", "Surcharge", "Comportement", "Autre"],
  Formation: ["Contenu", "Rythme", "Organisation", "Planning", "Autre"],
  Formateur: ["Accompagnement", "Explication", "Disponibilité", "Communication", "Autre"],
  Terrain: ["Intégration", "Organisation", "Manager", "Environnement", "Charge", "Autre"],
  EPI: ["Non remis", "Taille incorrecte", "Matériel défectueux", "Remplacement", "Autre"],
  Sécurité: ["Poste dangereux", "Signalisation", "Incident", "Autre"],
  Planning: ["Shift", "Horaires", "Congés", "Modification", "Autre"],
  Administratif: ["Contrat", "Paie", "Attestation", "Badge", "Autre"],
  Matériel: ["Outillage", "Machine", "Poste de travail", "Autre"],
  Autre: ["Autre"],
};

export const CATEGORIES = Object.keys(TAXONOMIE);

/** Règles d'affectation automatique catégorie → équipe. */
export function equipePourCategorie(categorie: string): EquipeRec {
  switch (categorie) {
    case "Transport":
      return "Transport";
    case "EPI":
    case "Sécurité":
      return "Sécurité";
    case "Formation":
    case "Formateur":
      return "Formation";
    case "Terrain":
      return "Production";
    case "Matériel":
      return "Maintenance";
    case "Administratif":
      return "Administration";
    default:
      return "RH";
  }
}

export const SOURCES = ["Espace Ouvrier", "WhatsApp", "Entretien RH", "Boîte à idées", "Superviseur"] as const;
export type SourceRec = (typeof SOURCES)[number];

export const TYPES_SOLUTION = [
  "Problème corrigé",
  "Information fournie",
  "Transport modifié",
  "Équipement remis",
  "Planning corrigé",
  "Intervention réalisée",
  "Entretien réalisé",
  "Autre",
] as const;

export interface MessageRec {
  id: string;
  auteur: string;
  role: "ouvrier" | "responsable" | "system";
  date: string;
  heure: string;
  texte: string;
  interne?: boolean;
}

export type StatutActionRec = "À faire" | "En cours" | "Terminée";

export interface ActionRec {
  id: string;
  titre: string;
  responsable: string;
  echeance: string;
  statut: StatutActionRec;
}

export interface EvenementRec {
  id: string;
  date: string;
  heure: string;
  auteur: string;
  texte: string;
}

export interface PieceJointeRec {
  id: string;
  nom: string;
  type: "Photo" | "Document";
  taille: string;
}

export interface SatisfactionRec {
  resolution: "Oui" | "Partiellement" | "Non";
  note: number;
  rapidite?: number;
  qualite?: number;
  communication?: number;
  commentaire?: string;
  date: string;
}

export interface ResolutionRec {
  type: string;
  action: string;
  traitePar: string;
  date: string;
  heure: string;
  duree: string;
}

export interface Rec {
  id: string;
  objet: string;
  description: string;
  ouvrier: string;
  matricule: string;
  poste: string;
  site: string;
  categorie: string;
  sousCategorie: string;
  priorite: PrioriteRec;
  source: SourceRec;
  statut: StatutRec;
  creeLe: string;
  creeA: string;
  minutes: number; // ancienneté simulée en minutes
  equipe: EquipeRec;
  assigneA?: string;
  slaPriseEnCharge: string;
  slaResolution: string;
  slaStatut: SlaStatut;
  nonLu?: boolean;
  messages: MessageRec[];
  actions: ActionRec[];
  historique: EvenementRec[];
  piecesJointes: PieceJointeRec[];
  satisfaction?: SatisfactionRec;
  resolution?: ResolutionRec;
}

export const RESPONSABLES = [
  "Nadia El Ghali",
  "Hicham Saidi",
  "Salma Bennis",
  "Youssef Amrani",
  "Karim Sebti",
  "Otmane Rifi",
  "Nabil Cherkaoui",
];

export const UTILISATEUR_COURANT = "Nadia El Ghali";

const SITES_REC = ["Bouskoura", "Berrechid", "Bouznika", "Aïn Sebaâ", "Agadir"];

const OUVRIERS = [
  ["Sara Amrani", "Opératrice câblage"],
  ["Khadija Rami", "Opératrice câblage"],
  ["Mariam Lahlou", "Opératrice assemblage"],
  ["Anas El Fassi", "Opérateur coupe"],
  ["Mehdi Berrada", "Technicien ligne"],
  ["Imane Zahraoui", "Opératrice contrôle"],
  ["Ayoub Najjar", "Opérateur coupe"],
  ["Fatima Ouazzani", "Opératrice câblage"],
  ["Rachid Bekkali", "Cariste"],
  ["Nawal Idrissi", "Opératrice assemblage"],
  ["Hamza Toufiq", "Opérateur presse"],
  ["Salma Kadiri", "Opératrice contrôle"],
];

const SUJETS: { cat: string; sous: string; objet: string; desc: string }[] = [
  { cat: "Transport", sous: "Bus absent", objet: "Transport non arrivé", desc: "Le bus prévu ce matin n'est pas passé au point de ramassage." },
  { cat: "Transport", sous: "Retard", objet: "Bus en retard de 40 minutes", desc: "La ligne TR-BSK-14 arrive systématiquement en retard depuis lundi." },
  { cat: "Transport", sous: "Point de ramassage", objet: "Changement point de transport", desc: "Le point de ramassage actuel est trop éloigné de mon domicile." },
  { cat: "Transport", sous: "Surcharge", objet: "Bus surchargé le matin", desc: "Nous voyageons debout sur tout le trajet, le bus est plein." },
  { cat: "EPI", sous: "Non remis", objet: "Gants non remis", desc: "Je n'ai pas reçu mes gants de protection depuis mon affectation au poste." },
  { cat: "EPI", sous: "Taille incorrecte", objet: "Chaussures à la mauvaise taille", desc: "Les chaussures de sécurité fournies sont trop petites." },
  { cat: "EPI", sous: "Matériel défectueux", objet: "Lunettes de protection rayées", desc: "Les lunettes fournies sont rayées et gênent la vision." },
  { cat: "Planning", sous: "Modification", objet: "Planning modifié sans préavis", desc: "Mon shift a été modifié la veille au soir sans information préalable." },
  { cat: "Planning", sous: "Shift", objet: "Demande de changement de shift", desc: "Je souhaite passer du shift de nuit au shift du matin pour raisons de transport." },
  { cat: "Formation", sous: "Rythme", objet: "Rythme de formation trop rapide", desc: "Le module câblage avance trop vite, je n'arrive pas à suivre les exercices." },
  { cat: "Formation", sous: "Organisation", objet: "Question formation", desc: "Je souhaite savoir si le module sertissage sera rattrapé cette semaine." },
  { cat: "Formateur", sous: "Disponibilité", objet: "Formateur indisponible", desc: "Le formateur n'était pas présent lors des deux dernières séances pratiques." },
  { cat: "Formateur", sous: "Explication", objet: "Explications insuffisantes", desc: "Les consignes du poste ne sont pas expliquées assez clairement." },
  { cat: "Terrain", sous: "Intégration", objet: "Intégration difficile en ligne", desc: "Je n'ai pas eu de tuteur lors de mes premiers jours en production." },
  { cat: "Terrain", sous: "Charge", objet: "Cadence trop élevée", desc: "La cadence demandée sur la ligne ne permet pas de respecter les contrôles." },
  { cat: "Matériel", sous: "Outillage", objet: "Pince de sertissage défectueuse", desc: "La pince du poste 14 ne serre plus correctement les connecteurs." },
  { cat: "Administratif", sous: "Badge", objet: "Badge d'accès non fonctionnel", desc: "Mon badge ne fonctionne plus au portique de l'atelier B." },
  { cat: "Administratif", sous: "Attestation", objet: "Attestation de travail non reçue", desc: "J'ai demandé une attestation de travail il y a deux semaines." },
  { cat: "Sécurité", sous: "Signalisation", objet: "Marquage au sol effacé", desc: "Le marquage des allées de circulation est effacé près du poste 22." },
  { cat: "Autre", sous: "Autre", objet: "Casier vestiaire non attribué", desc: "Aucun casier ne m'a été attribué depuis mon arrivée." },
];

const SOLUTIONS = [
  { type: "Transport modifié", action: "Trajet alternatif affecté" },
  { type: "Équipement remis", action: "EPI remis en main propre" },
  { type: "Planning corrigé", action: "Shift rétabli sur le planning" },
  { type: "Information fournie", action: "Réponse détaillée transmise à l'ouvrier" },
  { type: "Intervention réalisée", action: "Intervention maintenance réalisée sur le poste" },
  { type: "Entretien réalisé", action: "Entretien RH réalisé avec l'ouvrier" },
  { type: "Problème corrigé", action: "Anomalie corrigée et vérifiée sur site" },
];

const COMMENTAIRES = [
  "Le problème est réglé mais j'ai attendu longtemps.",
  "Réponse rapide et claire, merci.",
  "Traitement correct, la communication pourrait être améliorée.",
  "Le souci est revenu deux jours après.",
  "Très bonne prise en charge de l'équipe.",
];

let graine = 20260807;
function rnd() {
  graine = (graine * 1103515245 + 12345) % 2147483648;
  return graine / 2147483648;
}
function pick<T>(a: T[]): T {
  return a[Math.floor(rnd() * a.length)];
}
function pad(n: number) {
  return String(n).padStart(2, "0");
}
function heureDe(minutes: number) {
  const base = 7 * 60 + 12;
  const t = ((base + minutes) % 1440 + 1440) % 1440;
  return `${pad(Math.floor(t / 60))}:${pad(t % 60)}`;
}
function dateDe(joursAvant: number) {
  const d = new Date(2026, 7, 7);
  d.setDate(d.getDate() - joursAvant);
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
}

function construire(index: number, statut: StatutRec, n: number): Rec {
  const sujet = SUJETS[Math.floor(rnd() * SUJETS.length)];
  const [ouvrier, poste] = pick(OUVRIERS);
  const site = pick(SITES_REC);
  const priorite: PrioriteRec = rnd() > 0.82 ? "Critique" : rnd() > 0.5 ? "Élevée" : "Normale";
  const equipe = equipePourCategorie(sujet.cat);
  const minutes = statut === "new" ? Math.floor(rnd() * 900) + 8 : statut === "in_progress" ? Math.floor(rnd() * 4000) + 400 : Math.floor(rnd() * 40000) + 2000;
  const jours = Math.floor(minutes / 1440);
  const date = dateDe(jours);
  const heure = heureDe(-minutes % 600);
  const id = `REC-2026-${pad(n)}`;
  const assigneA = statut === "new" ? undefined : pick(RESPONSABLES);
  const slaStatut: SlaStatut =
    statut === "resolved" ? (rnd() > 0.2 ? "ok" : "depasse") : priorite === "Critique" && minutes > 600 ? "depasse" : minutes > 1400 ? "risque" : rnd() > 0.75 ? "risque" : "ok";

  const messages: MessageRec[] = [
    { id: `${id}-M1`, auteur: ouvrier, role: "ouvrier", date, heure, texte: sujet.desc },
  ];
  const historique: EvenementRec[] = [
    { id: `${id}-H1`, date, heure, auteur: ouvrier, texte: "Réclamation créée" },
  ];
  const actions: ActionRec[] = [];

  if (statut !== "new" && assigneA) {
    const h2 = heureDe(-minutes % 600 + 20);
    messages.push({ id: `${id}-M2`, auteur: assigneA, role: "responsable", date, heure: h2, texte: `Bonjour ${ouvrier.split(" ")[0]}, nous prenons en charge votre demande avec l'équipe ${equipe}.` });
    messages.push({ id: `${id}-M3`, auteur: "Système", role: "system", date, heure: h2, texte: "Statut changé : Nouveau → En cours de traitement" });
    historique.push({ id: `${id}-H2`, date, heure: h2, auteur: assigneA, texte: `Prise en charge — équipe ${equipe}` });
    actions.push({
      id: `${id}-A1`,
      titre: sujet.cat === "Transport" ? "Contacter le transporteur" : sujet.cat === "EPI" ? "Vérifier le stock magasin" : "Analyser la situation sur le terrain",
      responsable: pick(RESPONSABLES),
      echeance: `${date} 16:00`,
      statut: statut === "resolved" ? "Terminée" : rnd() > 0.5 ? "En cours" : "À faire",
    });
  }

  let resolution: ResolutionRec | undefined;
  let satisfaction: SatisfactionRec | undefined;

  if (statut === "resolved") {
    const sol = pick(SOLUTIONS);
    const hR = heureDe(-minutes % 600 + 122);
    resolution = { ...sol, traitePar: assigneA ?? UTILISATEUR_COURANT, date, heure: hR, duree: `${Math.floor(rnd() * 6) + 1}h${pad(Math.floor(rnd() * 59))}` };
    messages.push({ id: `${id}-M4`, auteur: assigneA ?? UTILISATEUR_COURANT, role: "responsable", date, heure: hR, texte: `${sol.action}. N'hésitez pas à revenir vers nous si le problème persiste.` });
    messages.push({ id: `${id}-M5`, auteur: "Système", role: "system", date, heure: hR, texte: "Statut changé : En cours de traitement → Traité" });
    historique.push({ id: `${id}-H3`, date, heure: hR, auteur: assigneA ?? UTILISATEUR_COURANT, texte: `Réclamation traitée — ${sol.type}` });
    if (rnd() > 0.32) {
      const note = Math.max(1, Math.min(5, Math.round(rnd() * 4) + 1));
      satisfaction = {
        resolution: note >= 4 ? "Oui" : note === 3 ? "Partiellement" : "Non",
        note,
        rapidite: Math.max(1, Math.min(5, note + (rnd() > 0.5 ? 1 : -1))),
        qualite: Math.max(1, Math.min(5, note)),
        communication: Math.max(1, Math.min(5, note + (rnd() > 0.6 ? 1 : 0))),
        commentaire: pick(COMMENTAIRES),
        date,
      };
    }
  }

  return {
    id,
    objet: sujet.objet,
    description: sujet.desc,
    ouvrier,
    matricule: `LMA-${site.slice(0, 3).toUpperCase()}-2026-0${300 + index}`,
    poste,
    site,
    categorie: sujet.cat,
    sousCategorie: sujet.sous,
    priorite,
    source: pick([...SOURCES]),
    statut,
    creeLe: date,
    creeA: heure,
    minutes,
    equipe,
    assigneA,
    slaPriseEnCharge: `${date} ${heureDe(-minutes % 600 + 48)}`,
    slaResolution: `${date} ${heureDe(-minutes % 600 + 290)}`,
    slaStatut,
    nonLu: statut !== "resolved" && rnd() > 0.72,
    messages,
    actions,
    historique,
    piecesJointes: rnd() > 0.65 ? [{ id: `${id}-PJ`, nom: `photo_${sujet.cat.toLowerCase()}.jpg`, type: "Photo", taille: "1,2 Mo" }] : [],
    satisfaction,
    resolution,
  };
}

function genererJeu(): Rec[] {
  const liste: Rec[] = [];
  let n = 100;
  for (let i = 0; i < 12; i++) liste.push(construire(i, "new", n--));
  for (let i = 0; i < 18; i++) liste.push(construire(i + 12, "in_progress", n--));
  for (let i = 0; i < 30; i++) liste.push(construire(i + 30, "resolved", n--));
  return liste;
}

const GENERES = genererJeu();

/** Réclamations mises en avant (exemples de référence du cahier des charges). */
const VEDETTES: Rec[] = [
  {
    ...GENERES[0],
    id: "REC-2026-091",
    objet: "Transport non arrivé",
    description: "Le bus prévu ce matin n'est pas passé au point de ramassage.",
    ouvrier: "Sara Amrani",
    matricule: "LMA-BOU-2026-0418",
    poste: "Opératrice câblage",
    site: "Bouskoura",
    categorie: "Transport",
    sousCategorie: "Bus absent",
    priorite: "Élevée",
    source: "Espace Ouvrier",
    statut: "new",
    creeLe: "07/08/2026",
    creeA: "07:12",
    minutes: 12,
    equipe: "Transport",
    assigneA: undefined,
    slaPriseEnCharge: "07/08/2026 08:00",
    slaResolution: "07/08/2026 12:00",
    slaStatut: "risque",
    nonLu: true,
    messages: [
      { id: "V1-M1", auteur: "Sara Amrani", role: "ouvrier", date: "07/08/2026", heure: "07:12", texte: "Le bus n'est pas passé ce matin au point de ramassage." },
    ],
    actions: [],
    historique: [{ id: "V1-H1", date: "07/08/2026", heure: "07:12", auteur: "Sara Amrani", texte: "Réclamation créée depuis l'Espace Ouvrier" }],
    piecesJointes: [],
    satisfaction: undefined,
    resolution: undefined,
  },
  {
    ...GENERES[1],
    id: "REC-2026-092",
    objet: "Gants non remis",
    description: "Je n'ai toujours pas reçu mes gants de protection depuis mon affectation.",
    ouvrier: "Khadija Rami",
    matricule: "LMA-BOU-2026-0395",
    poste: "Opératrice câblage",
    site: "Bouskoura",
    categorie: "EPI",
    sousCategorie: "Non remis",
    priorite: "Critique",
    source: "Espace Ouvrier",
    statut: "in_progress",
    creeLe: "07/08/2026",
    creeA: "06:40",
    minutes: 220,
    equipe: "Sécurité",
    assigneA: "Hicham Saidi",
    slaPriseEnCharge: "07/08/2026 07:30",
    slaResolution: "07/08/2026 11:00",
    slaStatut: "risque",
    nonLu: true,
    messages: [
      { id: "V2-M1", auteur: "Khadija Rami", role: "ouvrier", date: "07/08/2026", heure: "06:40", texte: "Je travaille sans gants depuis deux jours au poste 12." },
      { id: "V2-M2", auteur: "Hicham Saidi", role: "responsable", date: "07/08/2026", heure: "07:05", texte: "Bonjour Khadija, je vérifie immédiatement le stock magasin." },
      { id: "V2-M3", auteur: "Système", role: "system", date: "07/08/2026", heure: "07:05", texte: "Statut changé : Nouveau → En cours de traitement" },
      { id: "V2-M4", auteur: "Hicham Saidi", role: "responsable", date: "07/08/2026", heure: "07:10", texte: "Stock T7 épuisé, commande urgente lancée.", interne: true },
    ],
    actions: [
      { id: "V2-A1", titre: "Réapprovisionner gants T7/T8", responsable: "Karim Sebti", echeance: "07/08/2026 10:00", statut: "En cours" },
      { id: "V2-A2", titre: "Remise EPI provisoire à l'ouvrière", responsable: "Hicham Saidi", echeance: "07/08/2026 08:30", statut: "Terminée" },
    ],
    historique: [
      { id: "V2-H1", date: "07/08/2026", heure: "06:40", auteur: "Khadija Rami", texte: "Réclamation créée" },
      { id: "V2-H2", date: "07/08/2026", heure: "07:05", auteur: "Hicham Saidi", texte: "Prise en charge — équipe Sécurité" },
    ],
    piecesJointes: [{ id: "V2-PJ", nom: "poste_12.jpg", type: "Photo", taille: "0,9 Mo" }],
    satisfaction: undefined,
    resolution: undefined,
  },
  {
    ...GENERES[2],
    id: "REC-2026-093",
    objet: "Planning modifié sans préavis",
    description: "Mon shift a été modifié la veille au soir sans information préalable.",
    ouvrier: "Mariam Lahlou",
    matricule: "LMA-BOU-2026-0435",
    poste: "Opératrice assemblage",
    site: "Bouskoura",
    categorie: "Planning",
    sousCategorie: "Modification",
    priorite: "Normale",
    source: "WhatsApp",
    statut: "in_progress",
    creeLe: "06/08/2026",
    creeA: "18:20",
    minutes: 1180,
    equipe: "RH",
    assigneA: "Salma Bennis",
    slaPriseEnCharge: "06/08/2026 19:30",
    slaResolution: "08/08/2026 12:00",
    slaStatut: "ok",
    nonLu: false,
    messages: [
      { id: "V3-M1", auteur: "Mariam Lahlou", role: "ouvrier", date: "06/08/2026", heure: "18:20", texte: "Mon planning a changé sans que je sois prévenue." },
      { id: "V3-M2", auteur: "Salma Bennis", role: "responsable", date: "06/08/2026", heure: "19:02", texte: "Bonjour Mariam, je regarde avec la coordination production." },
      { id: "V3-M3", auteur: "Système", role: "system", date: "06/08/2026", heure: "19:02", texte: "Statut changé : Nouveau → En cours de traitement" },
    ],
    actions: [{ id: "V3-A1", titre: "Vérifier la règle de préavis planning", responsable: "Otmane Rifi", echeance: "08/08/2026 09:00", statut: "À faire" }],
    historique: [
      { id: "V3-H1", date: "06/08/2026", heure: "18:20", auteur: "Mariam Lahlou", texte: "Réclamation créée" },
      { id: "V3-H2", date: "06/08/2026", heure: "19:02", auteur: "Salma Bennis", texte: "Prise en charge — équipe RH" },
    ],
    piecesJointes: [],
    satisfaction: undefined,
    resolution: undefined,
  },
  {
    ...GENERES[3],
    id: "REC-2026-094",
    objet: "Question formation",
    description: "Je souhaite savoir si le module sertissage sera rattrapé cette semaine.",
    ouvrier: "Anas El Fassi",
    matricule: "LMA-BZN-2026-0208",
    poste: "Opérateur coupe",
    site: "Bouznika",
    categorie: "Formation",
    sousCategorie: "Organisation",
    priorite: "Normale",
    source: "Espace Ouvrier",
    statut: "resolved",
    creeLe: "05/08/2026",
    creeA: "09:05",
    minutes: 3200,
    equipe: "Formation",
    assigneA: "Salma Bennis",
    slaPriseEnCharge: "05/08/2026 10:00",
    slaResolution: "06/08/2026 12:00",
    slaStatut: "ok",
    nonLu: false,
    messages: [
      { id: "V4-M1", auteur: "Anas El Fassi", role: "ouvrier", date: "05/08/2026", heure: "09:05", texte: "Le module sertissage sera-t-il rattrapé ?" },
      { id: "V4-M2", auteur: "Salma Bennis", role: "responsable", date: "05/08/2026", heure: "11:40", texte: "Oui, une séance de rattrapage est planifiée jeudi à 14:00." },
      { id: "V4-M3", auteur: "Système", role: "system", date: "05/08/2026", heure: "11:41", texte: "Statut changé : En cours de traitement → Traité" },
    ],
    actions: [{ id: "V4-A1", titre: "Inscrire l'ouvrier à la séance de rattrapage", responsable: "Salma Bennis", echeance: "05/08/2026 12:00", statut: "Terminée" }],
    historique: [
      { id: "V4-H1", date: "05/08/2026", heure: "09:05", auteur: "Anas El Fassi", texte: "Réclamation créée" },
      { id: "V4-H2", date: "05/08/2026", heure: "11:41", auteur: "Salma Bennis", texte: "Réclamation traitée — Information fournie" },
    ],
    piecesJointes: [],
    resolution: { type: "Information fournie", action: "Séance de rattrapage communiquée et inscription réalisée", traitePar: "Salma Bennis", date: "05/08/2026", heure: "11:41", duree: "2h36" },
    satisfaction: { resolution: "Oui", note: 5, rapidite: 5, qualite: 5, communication: 5, commentaire: "Réponse rapide et claire, merci.", date: "05/08/2026" },
  },
  {
    ...GENERES[4],
    id: "REC-2026-095",
    objet: "Changement point de transport",
    description: "Le point de ramassage actuel est trop éloigné de mon domicile.",
    ouvrier: "Mehdi Berrada",
    matricule: "LMA-BER-2026-0312",
    poste: "Technicien ligne",
    site: "Berrechid",
    categorie: "Transport",
    sousCategorie: "Point de ramassage",
    priorite: "Élevée",
    source: "Entretien RH",
    statut: "resolved",
    creeLe: "04/08/2026",
    creeA: "08:30",
    minutes: 4600,
    equipe: "Transport",
    assigneA: "Youssef Amrani",
    slaPriseEnCharge: "04/08/2026 09:30",
    slaResolution: "05/08/2026 12:00",
    slaStatut: "depasse",
    nonLu: false,
    messages: [
      { id: "V5-M1", auteur: "Mehdi Berrada", role: "ouvrier", date: "04/08/2026", heure: "08:30", texte: "Je marche 25 minutes jusqu'au point de ramassage." },
      { id: "V5-M2", auteur: "Youssef Amrani", role: "responsable", date: "04/08/2026", heure: "10:15", texte: "Nous étudions un rattachement à la ligne TR-BER-03." },
      { id: "V5-M3", auteur: "Youssef Amrani", role: "responsable", date: "05/08/2026", heure: "16:20", texte: "Un nouveau point de transport vous a été affecté sur la ligne TR-BER-03." },
      { id: "V5-M4", auteur: "Système", role: "system", date: "05/08/2026", heure: "16:21", texte: "Statut changé : En cours de traitement → Traité" },
    ],
    actions: [{ id: "V5-A1", titre: "Mettre à jour la fiche transport", responsable: "Youssef Amrani", echeance: "05/08/2026 17:00", statut: "Terminée" }],
    historique: [
      { id: "V5-H1", date: "04/08/2026", heure: "08:30", auteur: "Mehdi Berrada", texte: "Réclamation créée" },
      { id: "V5-H2", date: "05/08/2026", heure: "16:21", auteur: "Youssef Amrani", texte: "Réclamation traitée — Transport modifié" },
    ],
    piecesJointes: [],
    resolution: { type: "Transport modifié", action: "Nouveau point de ramassage affecté sur la ligne TR-BER-03", traitePar: "Youssef Amrani", date: "05/08/2026", heure: "16:21", duree: "31h51" },
    satisfaction: { resolution: "Partiellement", note: 3, rapidite: 2, qualite: 4, communication: 3, commentaire: "Le problème est réglé mais j'ai attendu longtemps.", date: "06/08/2026" },
  },
];

export const RECLAMATIONS_V2: Rec[] = [...VEDETTES, ...GENERES.slice(5)];

/* ----------------------------- Séries analytiques ----------------------------- */

export const VOLUME_MENSUEL = [
  { mois: "Mar", volume: 168, traitees: 152 },
  { mois: "Avr", volume: 181, traitees: 170 },
  { mois: "Mai", volume: 174, traitees: 168 },
  { mois: "Juin", volume: 196, traitees: 179 },
  { mois: "Juil", volume: 211, traitees: 192 },
  { mois: "Août", volume: 224, traitees: 186 },
];

export const DELAI_PAR_CATEGORIE = [
  { categorie: "Transport", heures: 21.4 },
  { categorie: "EPI", heures: 12.8 },
  { categorie: "Planning", heures: 9.6 },
  { categorie: "Formation", heures: 14.2 },
  { categorie: "Terrain", heures: 18.1 },
  { categorie: "Administratif", heures: 26.3 },
];

export const SATISFACTION_MENSUELLE = [
  { mois: "Mar", note: 3.8 },
  { mois: "Avr", note: 3.9 },
  { mois: "Mai", note: 4.0 },
  { mois: "Juin", note: 4.1 },
  { mois: "Juil", note: 4.0 },
  { mois: "Août", note: 4.2 },
];

export const SATISFACTION_PAR_EQUIPE = [
  { equipe: "Transport", note: 3.4 },
  { equipe: "Sécurité", note: 3.9 },
  { equipe: "Formation", note: 4.5 },
  { equipe: "RH", note: 4.3 },
  { equipe: "Production", note: 4.0 },
  { equipe: "Maintenance", note: 4.1 },
];

export const TOP_PROBLEMES = [
  { categorie: "Transport", volume: 184, variation: 24 },
  { categorie: "EPI", volume: 96, variation: 8 },
  { categorie: "Planning", volume: 74, variation: -4 },
  { categorie: "Formation", volume: 51, variation: 12 },
  { categorie: "Terrain", volume: 38, variation: -9 },
];

export const PROBLEMES_RECURRENTS = [
  { titre: "Transport — Ligne TR-BSK-14", volume: 12, fenetre: "7 jours", satisfaction: 2.1, tendance: "En hausse" as const, site: "Bouskoura" },
  { titre: "EPI — Atelier Assemblage", volume: 9, fenetre: "14 jours", satisfaction: 2.8, tendance: "Stable" as const, site: "Bouskoura" },
  { titre: "Planning — Shift nuit Berrechid", volume: 7, fenetre: "10 jours", satisfaction: 3.2, tendance: "En baisse" as const, site: "Berrechid" },
  { titre: "Formateur — Module sertissage", volume: 6, fenetre: "14 jours", satisfaction: 3.0, tendance: "En hausse" as const, site: "Agadir" },
];

export const A_SURVEILLER = [
  { texte: "+32 % de réclamations transport cette semaine", ton: "critical" as const },
  { texte: "3 réclamations critiques non traitées", ton: "critical" as const },
  { texte: "Satisfaction EPI à 2,8 / 5", ton: "warning" as const },
  { texte: "Délai de traitement transport en hausse de 40 %", ton: "warning" as const },
];

/* ----------------------------- Helpers ----------------------------- */

export function tempsEcoule(minutes: number): string {
  if (minutes < 60) return `Il y a ${minutes} min`;
  if (minutes < 1440) return `Il y a ${Math.floor(minutes / 60)} h`;
  const j = Math.floor(minutes / 1440);
  return `Il y a ${j} j`;
}

export function initiales(nom: string): string {
  return nom
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((m) => m[0]?.toUpperCase() ?? "")
    .join("");
}

export function moyenneNotes(valeurs: number[]): number {
  if (!valeurs.length) return 0;
  return Math.round((valeurs.reduce((s, v) => s + v, 0) / valeurs.length) * 10) / 10;
}
