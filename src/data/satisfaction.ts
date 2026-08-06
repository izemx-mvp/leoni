/**
 * Satisfaction quotidienne & mood — objet unique `Mood`, nominatif ou anonyme.
 * Les réponses anonymes ne sont jamais rattachées à une fiche individuelle.
 */

export const CATEGORIES_MOOD = [
  "Formation",
  "Formateur",
  "Transport",
  "Terrain",
  "Organisation",
  "Planning",
  "Matériel",
  "EPI",
  "Sécurité",
  "Manager",
  "Équipe",
  "Conditions de travail",
  "Administratif",
  "Autre",
];

export const ECHELLE_MOOD = [
  { score: 1, emoji: "😡", libelle: "Très mauvaise" },
  { score: 2, emoji: "😟", libelle: "Mauvaise" },
  { score: 3, emoji: "😐", libelle: "Moyenne" },
  { score: 4, emoji: "🙂", libelle: "Bonne" },
  { score: 5, emoji: "😄", libelle: "Très bonne" },
];

export function mood(score: number) {
  return ECHELLE_MOOD.find((m) => m.score === score) ?? ECHELLE_MOOD[2];
}

export interface Mood {
  id: string;
  date: string;
  score: number;
  categorie: string;
  commentaire?: string;
  anonyme: boolean;
  site: string;
  formation: string;
  groupe: string;
  formateur: string;
  ouvrierId: string | null;
  ouvrierNom: string | null;
  statut: "Nouveau" | "À analyser" | "Analysé" | "Action créée";
}

export interface ConfigSatisfaction {
  echelle: "Émoticônes" | "Étoiles";
  frequence: string;
  anonymat: "Autorisé" | "Obligatoire" | "Désactivé";
  seuilConfidentialite: number;
  rappelHeure: string;
  canaux: string[];
}

export const CONFIG_SATISFACTION_DEFAUT: ConfigSatisfaction = {
  echelle: "Émoticônes",
  frequence: "Tous les jours",
  anonymat: "Autorisé",
  seuilConfidentialite: 5,
  rappelHeure: "17:30",
  canaux: ["Notification application", "WhatsApp"],
};

export const FREQUENCES_SATISFACTION = [
  "Tous les jours",
  "Jours de formation seulement",
  "Jours travaillés seulement",
  "Fin de journée",
  "Après chaque session",
];

const SARA = {
  ouvrierId: "LMA-BOU-2026-0418",
  ouvrierNom: "Sara Amrani",
  site: "Bouskoura",
  formation: "Intégration opérateur câblage",
  groupe: "CBL-07",
  formateur: "Nadia El Fassi",
};

export const MOODS_SARA: Mood[] = [
  { id: "MD-S1", date: "05/08/2026", score: 2, categorie: "Transport", commentaire: "Le bus de la ligne TR-BSK-14 est encore arrivé en retard.", anonyme: false, statut: "À analyser", ...SARA },
  { id: "MD-S2", date: "04/08/2026", score: 2, categorie: "Transport", commentaire: "Point de ramassage trop éloigné de chez moi.", anonyme: false, statut: "À analyser", ...SARA },
  { id: "MD-S3", date: "03/08/2026", score: 2, categorie: "Organisation", commentaire: "Beaucoup d'attente avant le démarrage de l'atelier.", anonyme: false, statut: "Action créée", ...SARA },
  { id: "MD-S4", date: "02/08/2026", score: 3, categorie: "Formation", anonyme: false, statut: "Analysé", ...SARA },
  { id: "MD-S5", date: "01/08/2026", score: 4, categorie: "Formateur", commentaire: "Explications claires.", anonyme: false, statut: "Analysé", ...SARA },
  { id: "MD-S6", date: "31/07/2026", score: 4, categorie: "Formation", anonyme: false, statut: "Analysé", ...SARA },
  { id: "MD-S7", date: "30/07/2026", score: 3, categorie: "Terrain", anonyme: false, statut: "Analysé", ...SARA },
];

const SITES_MOOD = ["Bouskoura", "Bouskoura – Ouled Saleh", "Berrechid", "Bouznika", "Agadir", "Aïn Sebaâ"];
const FORMATEURS_MOOD = ["Nadia El Fassi", "Karim Lahlou", "Hind Bekkali", "Otmane Rifi", "Hanane Tazi"];
const GROUPES_MOOD = ["CBL-07", "CBL-08", "QLT-01", "QLT-02", "ASM-04", "CUT-03"];
const FORMATIONS_MOOD = ["Intégration opérateur câblage", "Contrôle qualité", "Intégration assemblage", "Opérateur coupe"];
const COMMENTAIRES_MOOD: (string | undefined)[] = [
  "Le transport est arrivé en retard ce matin.",
  "Bonne journée, formateur disponible.",
  "Les consignes de sécurité ne sont pas claires.",
  "Gants non adaptés à ma taille.",
  "Le rythme de la formation est trop rapide.",
  "Ambiance de travail agréable dans le groupe.",
  "Point de ramassage trop éloigné.",
  "Manque de matériel sur le poste.",
  undefined,
  undefined,
];

export const MOODS_ANONYMES: Mood[] = Array.from({ length: 132 }, (_, i) => {
  const jour = Math.max(1, 5 - (i % 7));
  const score = [5, 4, 4, 3, 3, 2, 4, 5, 3, 2, 1, 4][i % 12];
  const anonyme = i % 3 !== 0;
  return {
    id: `MD-A${i + 1}`,
    date: `${String(jour).padStart(2, "0")}/08/2026`,
    score,
    categorie: CATEGORIES_MOOD[i % CATEGORIES_MOOD.length],
    commentaire: COMMENTAIRES_MOOD[i % COMMENTAIRES_MOOD.length],
    anonyme,
    site: SITES_MOOD[i % SITES_MOOD.length],
    formation: FORMATIONS_MOOD[i % FORMATIONS_MOOD.length],
    groupe: GROUPES_MOOD[i % GROUPES_MOOD.length],
    formateur: FORMATEURS_MOOD[i % FORMATEURS_MOOD.length],
    ouvrierId: anonyme ? null : `LMA-2026-${1000 + i}`,
    ouvrierNom: anonyme ? null : `Opérateur ${1000 + i}`,
    statut: score <= 2 ? "À analyser" : "Analysé",
  } satisfies Mood;
});

export const MOODS_INITIAUX: Mood[] = [...MOODS_SARA, ...MOODS_ANONYMES];

/* ------------------------------- Statistiques ---------------------------- */

export const moyenne = (l: Mood[]) =>
  l.length ? Number((l.reduce((a, m) => a + m.score, 0) / l.length).toFixed(1)) : 0;

export function repartition(l: Mood[]) {
  return ECHELLE_MOOD.map((e) => {
    const n = l.filter((m) => m.score === e.score).length;
    return { ...e, nombre: n, part: l.length ? Math.round((n / l.length) * 100) : 0 };
  });
}

export function evolutionJournaliere(l: Mood[]) {
  const dates = [...new Set(l.map((m) => m.date))].sort(
    (a, b) => Number(a.slice(0, 2)) - Number(b.slice(0, 2)),
  );
  return dates.map((d) => {
    const jour = l.filter((m) => m.date === d);
    return { date: d, moyenne: moyenne(jour), reponses: jour.length };
  });
}

export interface LigneStatMood {
  cle: string;
  reponses: number;
  moyenne: number;
  negatifs: number;
  partNegatifs: number;
  positifs: number;
}

function grouper(l: Mood[], cle: (m: Mood) => string): LigneStatMood[] {
  const cles = [...new Set(l.map(cle))];
  return cles
    .map((c) => {
      const sous = l.filter((m) => cle(m) === c);
      const negatifs = sous.filter((m) => m.score <= 2).length;
      return {
        cle: c,
        reponses: sous.length,
        moyenne: moyenne(sous),
        negatifs,
        partNegatifs: sous.length ? Math.round((negatifs / sous.length) * 100) : 0,
        positifs: sous.filter((m) => m.score >= 4).length,
      };
    })
    .sort((a, b) => a.moyenne - b.moyenne);
}

export const parCategorie = (l: Mood[]) => grouper(l, (m) => m.categorie);
export const parSite = (l: Mood[]) => grouper(l, (m) => m.site);
export const parFormateur = (l: Mood[]) => grouper(l, (m) => m.formateur);
export const parGroupe = (l: Mood[]) => grouper(l, (m) => m.groupe);

export function themesCommentaires(l: Mood[]) {
  const themes = [
    { theme: "Retard transport", motsCles: ["retard", "bus"] },
    { theme: "Point de ramassage", motsCles: ["ramassage", "éloigné"] },
    { theme: "Rythme de formation", motsCles: ["rythme", "rapide"] },
    { theme: "EPI / tailles", motsCles: ["gants", "taille"] },
    { theme: "Sécurité / consignes", motsCles: ["sécurité", "consignes"] },
    { theme: "Matériel", motsCles: ["matériel", "poste"] },
    { theme: "Ambiance d'équipe", motsCles: ["ambiance", "groupe"] },
  ];
  const avec = l.filter((m) => m.commentaire);
  return themes
    .map((t) => {
      const occ = avec.filter((m) => t.motsCles.some((k) => (m.commentaire ?? "").toLowerCase().includes(k)));
      return { theme: t.theme, occurrences: occ.length, moyenne: moyenne(occ) };
    })
    .filter((t) => t.occurrences > 0)
    .sort((a, b) => b.occurrences - a.occurrences);
}

/* --------------------------------- Alertes ------------------------------- */

export interface AlerteSatisfaction {
  id: string;
  type: "Collective" | "Nominative";
  sujet: string;
  site: string;
  signal: string;
  gravite: "Critique" | "Élevée" | "Moyenne";
  action: string;
  ouvrier?: string;
  facteurs?: string[];
}

export const ALERTES_SATISFACTION: AlerteSatisfaction[] = [
  { id: "ALS-01", type: "Collective", sujet: "Transport", site: "Bouskoura", signal: "12 commentaires négatifs sur la ligne TR-BSK-14 en 3 jours", gravite: "Critique", action: "Contacter le responsable transport" },
  { id: "ALS-02", type: "Nominative", sujet: "Suivi individuel", site: "Bouskoura", signal: "3 réponses négatives consécutives", gravite: "Élevée", action: "Planifier un entretien de suivi", ouvrier: "Sara Amrani", facteurs: ["Transport", "Retards", "Organisation"] },
  { id: "ALS-03", type: "Collective", sujet: "Satisfaction site", site: "Bouskoura", signal: "Satisfaction du site sous 3 / 5 sur 5 jours consécutifs", gravite: "Élevée", action: "Investigation site (RH + production)" },
  { id: "ALS-04", type: "Collective", sujet: "EPI", site: "Agadir", signal: "5 commentaires similaires sur des gants non adaptés", gravite: "Moyenne", action: "Vérifier le stock de tailles EPI" },
  { id: "ALS-05", type: "Collective", sujet: "Formateur", site: "Bouskoura", signal: "Baisse de 20 % de la satisfaction formateur sur une semaine", gravite: "Moyenne", action: "Échange pédagogique avec le formateur et le groupe" },
];

export interface ActionCorrectiveSat {
  id: string;
  sujet: string;
  action: string;
  responsable: string;
  echeance: string;
  statut: "Planifiée" | "En cours" | "Terminée";
  origine: string;
}

export const ACTIONS_SATISFACTION: ActionCorrectiveSat[] = [
  { id: "ACS-01", sujet: "Retards ligne TR-BSK-14", action: "Réviser l'horaire de passage", responsable: "Responsable transport", echeance: "10/08/2026", statut: "Planifiée", origine: "ALS-01" },
  { id: "ACS-02", sujet: "Point de ramassage Ouled Saleh", action: "Étudier l'ajout d'un arrêt intermédiaire", responsable: "Responsable transport", echeance: "14/08/2026", statut: "En cours", origine: "MD-S3" },
  { id: "ACS-03", sujet: "Tailles EPI Agadir", action: "Réapprovisionner les gants T7 et T8", responsable: "Service Sécurité", echeance: "08/08/2026", statut: "Planifiée", origine: "ALS-04" },
];
