/* Modèle de données du parcours "Nouvelle candidature" (saisie manuelle ou assistée par IA).
   Toutes les données produites ici sont FICTIVES et destinées à la démonstration. */

export const SOURCES_CANDIDATURE = [
  "Portail carrière",
  "Email",
  "Candidature spontanée",
  "Cooptation",
  "Agence",
  "Établissement partenaire",
  "Campagne recrutement",
  "Salon / événement",
  "Import RH",
  "Autre",
] as const;

export const DISPONIBILITES = [
  "Immédiate",
  "Sous 1 semaine",
  "Sous 15 jours",
  "Sous 1 mois",
  "Autre",
] as const;

export const SHIFTS = ["Matin", "Après-midi", "Nuit", "Équipes alternées"] as const;

export const NIVEAUX_ETUDE = [
  "Sans diplôme",
  "Collège",
  "Baccalauréat",
  "Qualification OFPPT",
  "Technicien",
  "Technicien spécialisé",
  "Bac +2",
  "Bac +3 et plus",
] as const;

export const TYPES_DOCUMENT = ["CV", "CIN", "Diplôme", "Certificat de travail", "Attestation", "Permis", "Autre"] as const;
export type TypeDocument = (typeof TYPES_DOCUMENT)[number];

export interface DocumentImporte {
  id: string;
  nom: string;
  type: TypeDocument;
  taille: string;
  date: string;
  statut: "Importé" | "Analysé" | "Illisible";
}

export interface ChampExtrait {
  cle: string;
  label: string;
  valeur: string;
  source: "CV" | "CIN" | "CV + CIN" | "Saisie RH";
  confiance: number;
}

export interface ExperienceExtraite {
  id: string;
  poste: string;
  entreprise: string;
  ville: string;
  periode: string;
  duree: string;
  competences: string[];
}

export interface ResultatExtraction {
  champs: ChampExtrait[];
  experiences: ExperienceExtraite[];
  competences: string[];
  langues: { langue: string; niveau: string }[];
  manquants: string[];
  anomalies: string[];
  suggestions: { poste: string; compatibilite: number }[];
}

export const ETAPES_ANALYSE = [
  "Document détecté",
  "Lecture du CV",
  "Identification du candidat",
  "Extraction des coordonnées",
  "Identification de l'expérience",
  "Extraction de la formation",
  "Lecture de la CIN",
  "Vérification des informations",
  "Recherche de doublon",
] as const;

const PROFILS_DEMO: {
  prenom: string;
  nom: string;
  ville: string;
  telephone: string;
  email: string;
  adresse: string;
  naissance: string;
  cin: string;
  niveau: string;
  diplome: string;
  specialite: string;
  etablissement: string;
  annee: string;
  experiences: ExperienceExtraite[];
  competences: string[];
  langues: { langue: string; niveau: string }[];
  suggestions: { poste: string; compatibilite: number }[];
}[] = [
  {
    prenom: "Sara",
    nom: "Amrani",
    ville: "Casablanca",
    telephone: "+212 6 12 34 56 78",
    email: "sara.amrani@example.ma",
    adresse: "Rés. El Manar, Hay Hassani, Casablanca",
    naissance: "12/05/2001",
    cin: "XX000000",
    niveau: "Technicien spécialisé",
    diplome: "Technicien spécialisé",
    specialite: "Électromécanique",
    etablissement: "ISTA Casablanca",
    annee: "2023",
    experiences: [
      {
        id: "EXP-1",
        poste: "Opératrice de production",
        entreprise: "Société industrielle (fictive)",
        ville: "Casablanca",
        periode: "Janvier 2024 → Juin 2026",
        duree: "2 ans 6 mois",
        competences: ["Assemblage", "Contrôle visuel", "Respect des procédures", "Travail en équipe"],
      },
      {
        id: "EXP-2",
        poste: "Aide-opératrice câblage",
        entreprise: "Atelier de câblage (fictif)",
        ville: "Bouskoura",
        periode: "Septembre 2023 → Décembre 2023",
        duree: "4 mois",
        competences: ["Câblage", "Sertissage", "Lecture d'instructions"],
      },
    ],
    competences: ["Production industrielle", "Assemblage", "Contrôle qualité", "Câblage", "Sécurité industrielle", "Travail en équipe"],
    langues: [
      { langue: "Arabe", niveau: "Courant" },
      { langue: "Français", niveau: "Bon" },
      { langue: "Anglais", niveau: "Débutant" },
    ],
    suggestions: [
      { poste: "Opératrice câblage", compatibilite: 91 },
      { poste: "Opératrice assemblage", compatibilite: 84 },
      { poste: "Contrôleur qualité", compatibilite: 72 },
    ],
  },
  {
    prenom: "Imane",
    nom: "Bennani",
    ville: "Berrechid",
    telephone: "+212 6 45 22 07 19",
    email: "imane.bennani@example.ma",
    adresse: "Lot Al Amal, Berrechid",
    naissance: "03/09/1999",
    cin: "XX111111",
    niveau: "Baccalauréat",
    diplome: "Baccalauréat scientifique",
    specialite: "Sciences physiques",
    etablissement: "Lycée Al Massira, Berrechid",
    annee: "2019",
    experiences: [
      {
        id: "EXP-1",
        poste: "Contrôleuse qualité",
        entreprise: "Unité de production (fictive)",
        ville: "Berrechid",
        periode: "Mars 2022 → Mai 2026",
        duree: "4 ans 2 mois",
        competences: ["Contrôle qualité", "Traçabilité", "Reporting terrain"],
      },
    ],
    competences: ["Contrôle qualité", "Traçabilité", "Lecture de plans", "Sécurité industrielle"],
    langues: [
      { langue: "Arabe", niveau: "Courant" },
      { langue: "Français", niveau: "Moyen" },
    ],
    suggestions: [
      { poste: "Contrôleur qualité", compatibilite: 88 },
      { poste: "Opératrice assemblage", compatibilite: 76 },
      { poste: "Opératrice câblage", compatibilite: 69 },
    ],
  },
];

/* Déduit un prénom/nom lisible depuis un nom de fichier type CV_Sara_Amrani.pdf */
function depuisNomFichier(nom: string): { prenom: string; nom: string } | null {
  const base = nom.replace(/\.[^.]+$/, "").replace(/^(cv|cin|doc)[-_ ]*/i, "");
  const parts = base.split(/[-_ ]+/).filter((p) => /^[A-Za-zÀ-ÿ']{3,}$/.test(p));
  if (parts.length < 2) return null;
  const cap = (s: string) => s[0].toUpperCase() + s.slice(1).toLowerCase();
  return { prenom: cap(parts[0]), nom: cap(parts[1]) };
}

export function analyserDocuments(documents: DocumentImporte[]): ResultatExtraction {
  const cv = documents.find((d) => d.type === "CV");
  const cin = documents.find((d) => d.type === "CIN");
  const base = PROFILS_DEMO[documents.length % 2 === 0 ? 0 : 0];
  const depuisFichier = cv ? depuisNomFichier(cv.nom) : null;
  const profil = { ...base, ...(depuisFichier ?? {}) };

  const sourceIdentite: ChampExtrait["source"] = cin ? "CV + CIN" : "CV";
  const champs: ChampExtrait[] = [
    { cle: "prenom", label: "Prénom", valeur: profil.prenom, source: sourceIdentite, confiance: cin ? 99 : 93 },
    { cle: "nom", label: "Nom", valeur: profil.nom, source: sourceIdentite, confiance: cin ? 99 : 93 },
    { cle: "cin", label: "Numéro CIN", valeur: cin ? profil.cin : "", source: "CIN", confiance: cin ? 95 : 0 },
    { cle: "dateNaissance", label: "Date de naissance", valeur: cin ? profil.naissance : "", source: "CIN", confiance: cin ? 97 : 0 },
    { cle: "telephone", label: "Téléphone principal", valeur: profil.telephone, source: "CV", confiance: 96 },
    { cle: "telephone2", label: "Téléphone secondaire", valeur: "", source: "CV", confiance: 0 },
    { cle: "email", label: "Email", valeur: profil.email, source: "CV", confiance: 94 },
    { cle: "adresse", label: "Adresse", valeur: profil.adresse, source: "CV", confiance: 72 },
    { cle: "ville", label: "Ville", valeur: profil.ville, source: "CV", confiance: 89 },
    { cle: "niveauEtude", label: "Niveau d'étude", valeur: profil.niveau, source: "CV", confiance: 91 },
    { cle: "diplome", label: "Diplôme", valeur: profil.diplome, source: "CV", confiance: 88 },
    { cle: "specialite", label: "Spécialité", valeur: profil.specialite, source: "CV", confiance: 85 },
    { cle: "etablissement", label: "Établissement", valeur: profil.etablissement, source: "CV", confiance: 87 },
    { cle: "anneeDiplome", label: "Année d'obtention", valeur: profil.annee, source: "CV", confiance: 90 },
    { cle: "permis", label: "Permis de conduire", valeur: "Permis B", source: "CV", confiance: 68 },
    { cle: "disponibilite", label: "Disponibilité", valeur: "", source: "CV", confiance: 54 },
    { cle: "mobilite", label: "Mobilité", valeur: "", source: "CV", confiance: 0 },
    { cle: "shift", label: "Travail en équipes alternées", valeur: "", source: "CV", confiance: 48 },
  ];

  const anomalies: string[] = [];
  if (!cv) anomalies.push("Aucun CV importé — l'extraction repose uniquement sur les autres documents.");
  if (cin && cin.statut === "Illisible") anomalies.push("Document de faible qualité — la CIN n'a pas pu être lue intégralement.");

  return {
    champs,
    experiences: profil.experiences,
    competences: profil.competences,
    langues: profil.langues,
    manquants: ["Disponibilité", "Mobilité", "Travail en équipes alternées"],
    anomalies,
    suggestions: profil.suggestions,
  };
}

export function niveauConfiance(c: number): { label: string; ton: "success" | "warning" | "critical" } {
  if (c > 90) return { label: "Fiable", ton: "success" };
  if (c >= 70) return { label: "À vérifier", ton: "warning" };
  return { label: "À confirmer", ton: "critical" };
}
