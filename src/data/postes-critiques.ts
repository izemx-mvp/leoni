// LEONI WORKFORCE JOURNEY — Postes : source unique de vérité.
// Le champ `isCritical` n'existe QUE sur le poste. Candidatures, ouvriers,
// besoins, campagnes et affectations lisent la criticité depuis cet objet.

import type { Candidat, Ouvrier } from "@/data/leoni";

/* ------------------------------------------------------------------ */
/* Modèle                                                              */
/* ------------------------------------------------------------------ */

export interface CompetenceRequise {
  nom: string;
  niveauMin: number; // sur 4
  bloquante: boolean;
  validation: string;
  validite: string;
}

export interface ExperienceRequise {
  minimum: string;
  type: string;
  secteur: string;
  postePrecedent: string;
  obligatoire: boolean;
}

export interface SeuilsPoste {
  scoreCandidat: number;
  scoreFormation: number;
  presence: number;
  competenceMin: number;
  tentativesMax: number;
  dureeConformite: string;
}

export interface ExigencesPoste {
  competences: CompetenceRequise[];
  experience: ExperienceRequise;
  formations: { nom: string; type: string; bloquante: boolean }[];
  tests: { nom: string; type: string; scoreMin: number; bloquant: boolean }[];
  documents: { nom: string; bloquant: boolean }[];
  seuils: SeuilsPoste;
  habilitations: string[];
}

export type StatutPoste = "Actif" | "Suspendu" | "Clôturé";

export interface Poste {
  code: string;
  nom: string;
  famille: string;
  departement: string;
  site: string;
  atelier: string;
  ligne: string;
  responsable: string;
  description: string;
  missions: string[];
  horaires: string;
  contrat: string;
  statut: StatutPoste;
  dateCreation: string;
  majLe: string;
  parcours: string;
  /** Postes ouverts (besoins cumulés). */
  ouverts: number;
  candidatsActifs: number;
  ouvriersAffectes: number;
  effectifCible: number;
  delaiMoyenJours: number;
  /** SOURCE UNIQUE DE VÉRITÉ de la criticité. */
  isCritical: boolean;
  exigences?: ExigencesPoste;
  /** Libellés alternatifs utilisés dans les jeux de données historiques. */
  alias?: string[];
}

const SEUILS_STANDARD: SeuilsPoste = {
  scoreCandidat: 60,
  scoreFormation: 60,
  presence: 90,
  competenceMin: 2,
  tentativesMax: 3,
  dureeConformite: "30 jours",
};

const SEUILS_CRITIQUES: SeuilsPoste = {
  scoreCandidat: 75,
  scoreFormation: 70,
  presence: 95,
  competenceMin: 3,
  tentativesMax: 2,
  dureeConformite: "15 jours",
};

/* ------------------------------------------------------------------ */
/* Référentiel des postes                                              */
/* ------------------------------------------------------------------ */

export const POSTES_DETAIL: Poste[] = [
  {
    code: "PST-CQ-01",
    nom: "Contrôleur qualité final",
    famille: "Qualité",
    departement: "Qualité",
    site: "Bouskoura",
    atelier: "Contrôle final",
    ligne: "Ligne CF-02",
    responsable: "Rachida Ouazzani",
    description:
      "Contrôle final des faisceaux électriques avant expédition client : conformité électrique, visuelle et documentaire.",
    missions: [
      "Réaliser les contrôles électriques et visuels de fin de ligne",
      "Enregistrer les non-conformités et isoler les pièces suspectes",
      "Appliquer les instructions techniques et les standards qualité client",
      "Alerter la production en cas de dérive récurrente",
    ],
    horaires: "Shift A — 06:00 / 14:00",
    contrat: "CDI après période d'essai",
    statut: "Actif",
    dateCreation: "12/01/2026",
    majLe: "04/08/2026",
    parcours: "FOR-QC-01",
    ouverts: 3,
    candidatsActifs: 18,
    ouvriersAffectes: 42,
    effectifCible: 58,
    delaiMoyenJours: 17,
    isCritical: true,
    alias: ["Contrôleur qualité", "Contrôleuse qualité", "Opérateur contrôle final", "Contrôle final"],
    exigences: {
      competences: [
        { nom: "Sécurité industrielle", niveauMin: 4, bloquante: true, validation: "QCM + formation", validite: "12 mois" },
        { nom: "Contrôle qualité", niveauMin: 3, bloquante: true, validation: "Évaluation pratique", validite: "12 mois" },
        { nom: "Lecture instructions", niveauMin: 3, bloquante: true, validation: "Test pratique", validite: "24 mois" },
        { nom: "Précision d'assemblage", niveauMin: 3, bloquante: false, validation: "Observation formateur", validite: "12 mois" },
        { nom: "Traçabilité documentaire", niveauMin: 2, bloquante: false, validation: "Observation formateur", validite: "24 mois" },
      ],
      experience: {
        minimum: "12 mois",
        type: "Contrôle qualité ou production industrielle",
        secteur: "Automobile / câblage",
        postePrecedent: "Opérateur câblage ou assemblage",
        obligatoire: true,
      },
      formations: [
        { nom: "Formation sécurité industrielle", type: "Sécurité", bloquante: true },
        { nom: "Formation contrôle final", type: "Métier", bloquante: true },
        { nom: "Standards qualité client", type: "Qualité", bloquante: true },
      ],
      tests: [
        { nom: "QCM sécurité", type: "QCM", scoreMin: 80, bloquant: true },
        { nom: "Test contrôle final", type: "Théorique", scoreMin: 70, bloquant: true },
        { nom: "Évaluation pratique", type: "Pratique", scoreMin: 70, bloquant: true },
      ],
      documents: [
        { nom: "CIN", bloquant: true },
        { nom: "Casier judiciaire", bloquant: true },
        { nom: "Diplôme", bloquant: true },
        { nom: "Aptitude médicale", bloquant: true },
        { nom: "Attestation de travail", bloquant: false },
        { nom: "Habilitation poste", bloquant: false },
      ],
      seuils: SEUILS_CRITIQUES,
      habilitations: ["Habilitation contrôle final", "Habilitation sécurité niveau 2"],
    },
  },
  {
    code: "PST-SEC-01",
    nom: "Opérateur essais électriques",
    famille: "Qualité",
    departement: "Qualité",
    site: "Berrechid",
    atelier: "Bancs d'essai",
    ligne: "Banc BE-04",
    responsable: "Karim Sebti",
    description: "Conduite des bancs d'essai électriques et validation des faisceaux haute tension.",
    missions: [
      "Exécuter les séquences d'essai sur banc",
      "Consigner les résultats et rebuts",
      "Respecter strictement les consignes de sécurité haute tension",
    ],
    horaires: "Shift B — 14:00 / 22:00",
    contrat: "CDD 6 mois renouvelable",
    statut: "Actif",
    dateCreation: "03/02/2026",
    majLe: "01/08/2026",
    parcours: "FOR-QC-01",
    ouverts: 2,
    candidatsActifs: 9,
    ouvriersAffectes: 16,
    effectifCible: 24,
    delaiMoyenJours: 19,
    isCritical: true,
    alias: ["Opérateur essais", "Essais électriques"],
    exigences: {
      competences: [
        { nom: "Sécurité industrielle", niveauMin: 4, bloquante: true, validation: "QCM + formation", validite: "12 mois" },
        { nom: "Lecture instructions", niveauMin: 3, bloquante: true, validation: "Test pratique", validite: "24 mois" },
        { nom: "Contrôle qualité", niveauMin: 3, bloquante: true, validation: "Évaluation pratique", validite: "12 mois" },
        { nom: "Rigueur process", niveauMin: 3, bloquante: false, validation: "Observation formateur", validite: "12 mois" },
      ],
      experience: {
        minimum: "6 mois",
        type: "Production industrielle",
        secteur: "Automobile / électronique",
        postePrecedent: "Opérateur câblage",
        obligatoire: true,
      },
      formations: [
        { nom: "Formation sécurité industrielle", type: "Sécurité", bloquante: true },
        { nom: "Habilitation banc d'essai", type: "Habilitation", bloquante: true },
      ],
      tests: [
        { nom: "QCM sécurité", type: "QCM", scoreMin: 80, bloquant: true },
        { nom: "Test théorique essais", type: "Théorique", scoreMin: 70, bloquant: true },
      ],
      documents: [
        { nom: "CIN", bloquant: true },
        { nom: "Casier judiciaire", bloquant: true },
        { nom: "Aptitude médicale", bloquant: true },
        { nom: "Diplôme", bloquant: false },
      ],
      seuils: SEUILS_CRITIQUES,
      habilitations: ["Habilitation électrique BE Essai"],
    },
  },
  {
    code: "PST-TL-01",
    nom: "Technicien de ligne",
    famille: "Maintenance",
    departement: "Maintenance",
    site: "Bouskoura",
    atelier: "Maintenance ligne",
    ligne: "Lignes CBL 1-6",
    responsable: "Otmane Rifi",
    description: "Maintenance préventive et curative des équipements de câblage.",
    missions: [
      "Assurer les interventions de premier niveau",
      "Consigner les équipements avant intervention",
      "Suivre le plan de maintenance préventive",
    ],
    horaires: "Shift A / B en rotation",
    contrat: "CDI",
    statut: "Actif",
    dateCreation: "22/01/2026",
    majLe: "29/07/2026",
    parcours: "FOR-QC-01",
    ouverts: 2,
    candidatsActifs: 7,
    ouvriersAffectes: 11,
    effectifCible: 15,
    delaiMoyenJours: 21,
    isCritical: true,
    alias: ["Technicien ligne", "Technicien maintenance"],
    exigences: {
      competences: [
        { nom: "Sécurité industrielle", niveauMin: 4, bloquante: true, validation: "QCM + formation", validite: "12 mois" },
        { nom: "Lecture instructions", niveauMin: 3, bloquante: true, validation: "Test pratique", validite: "24 mois" },
        { nom: "Maintenance premier niveau", niveauMin: 3, bloquante: true, validation: "Évaluation pratique", validite: "12 mois" },
      ],
      experience: {
        minimum: "24 mois",
        type: "Maintenance industrielle",
        secteur: "Industrie",
        postePrecedent: "Technicien maintenance",
        obligatoire: true,
      },
      formations: [
        { nom: "Formation sécurité industrielle", type: "Sécurité", bloquante: true },
        { nom: "Consignation / déconsignation", type: "Habilitation", bloquante: true },
      ],
      tests: [
        { nom: "QCM sécurité", type: "QCM", scoreMin: 80, bloquant: true },
        { nom: "Test pratique maintenance", type: "Pratique", scoreMin: 70, bloquant: true },
      ],
      documents: [
        { nom: "CIN", bloquant: true },
        { nom: "Diplôme", bloquant: true },
        { nom: "Aptitude médicale", bloquant: true },
        { nom: "Habilitation poste", bloquant: true },
      ],
      seuils: SEUILS_CRITIQUES,
      habilitations: ["Habilitation électrique BR", "Consignation"],
    },
  },
  {
    code: "PST-CBL-01",
    nom: "Opérateur / Opératrice câblage",
    famille: "Production",
    departement: "Production",
    site: "Bouskoura",
    atelier: "Câblage A",
    ligne: "Lignes CBL 1-6",
    responsable: "Rachida Ouazzani",
    description: "Assemblage des faisceaux électriques sur planche selon instructions techniques.",
    missions: [
      "Assembler les faisceaux conformément aux instructions",
      "Réaliser l'auto-contrôle visuel",
      "Respecter les cadences et les règles EPI",
    ],
    horaires: "Shift A — 06:00 / 14:00",
    contrat: "CDD 6 mois",
    statut: "Actif",
    dateCreation: "05/01/2026",
    majLe: "05/08/2026",
    parcours: "FOR-CBL-01",
    ouverts: 8,
    candidatsActifs: 96,
    ouvriersAffectes: 214,
    effectifCible: 260,
    delaiMoyenJours: 11,
    isCritical: false,
    alias: ["Opératrice câblage", "Opérateur câblage", "Opérateur cablage"],
  },
  {
    code: "PST-ASM-01",
    nom: "Opérateur / Opératrice assemblage",
    famille: "Production",
    departement: "Production",
    site: "Bouznika",
    atelier: "Assemblage B",
    ligne: "Lignes ASM 1-4",
    responsable: "Otmane Rifi",
    description: "Assemblage et routage des sous-ensembles de faisceaux.",
    missions: ["Assembler les sous-ensembles", "Contrôler visuellement", "Alimenter la ligne aval"],
    horaires: "Shift B — 14:00 / 22:00",
    contrat: "CDD 6 mois",
    statut: "Actif",
    dateCreation: "05/01/2026",
    majLe: "02/08/2026",
    parcours: "FOR-CBL-01",
    ouverts: 5,
    candidatsActifs: 61,
    ouvriersAffectes: 128,
    effectifCible: 150,
    delaiMoyenJours: 12,
    isCritical: false,
    alias: ["Opératrice assemblage", "Opérateur assemblage"],
  },
  {
    code: "PST-CUT-01",
    nom: "Opérateur coupe",
    famille: "Production",
    departement: "Production",
    site: "Aïn Sebaâ",
    atelier: "Coupe",
    ligne: "Machines CUT 1-8",
    responsable: "Rachida Ouazzani",
    description: "Conduite des machines de coupe et sertissage automatique.",
    missions: ["Régler et alimenter les machines", "Contrôler les longueurs", "Signaler les dérives"],
    horaires: "Shift A / B en rotation",
    contrat: "CDD 6 mois",
    statut: "Actif",
    dateCreation: "10/01/2026",
    majLe: "28/07/2026",
    parcours: "FOR-CUT-01",
    ouverts: 3,
    candidatsActifs: 24,
    ouvriersAffectes: 47,
    effectifCible: 58,
    delaiMoyenJours: 13,
    isCritical: false,
    alias: ["Opératrice coupe", "Opérateur coupe et sertissage"],
  },
  {
    code: "PST-LOG-01",
    nom: "Agent logistique interne",
    famille: "Logistique",
    departement: "Logistique",
    site: "Berrechid",
    atelier: "Magasin",
    ligne: "Zone expédition",
    responsable: "Imane El Fassi",
    description: "Préparation, stockage et acheminement des composants vers les lignes.",
    missions: ["Préparer les kits de production", "Gérer les emplacements", "Suivre les inventaires tournants"],
    horaires: "Shift A — 06:00 / 14:00",
    contrat: "CDD 6 mois",
    statut: "Actif",
    dateCreation: "18/01/2026",
    majLe: "24/07/2026",
    parcours: "FOR-CBL-01",
    ouverts: 1,
    candidatsActifs: 12,
    ouvriersAffectes: 33,
    effectifCible: 38,
    delaiMoyenJours: 14,
    isCritical: false,
    alias: ["Agent logistique", "Magasinier"],
  },
];

/* ------------------------------------------------------------------ */
/* Résolution poste ← libellé / code                                   */
/* ------------------------------------------------------------------ */

const normalise = (v: string) =>
  v
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

/** Retrouve le poste (source de vérité) depuis un code ou un intitulé libre. */
export function posteDe(reference?: string): Poste | undefined {
  if (!reference) return undefined;
  const ref = normalise(reference);
  const parCode = POSTES_DETAIL.find((p) => normalise(p.code) === ref);
  if (parCode) return parCode;
  const exact = POSTES_DETAIL.find(
    (p) => normalise(p.nom) === ref || (p.alias ?? []).some((a) => normalise(a) === ref),
  );
  if (exact) return exact;
  return POSTES_DETAIL.find(
    (p) =>
      normalise(p.nom).includes(ref) ||
      ref.includes(normalise(p.nom)) ||
      (p.alias ?? []).some((a) => ref.includes(normalise(a)) || normalise(a).includes(ref)),
  );
}

/** Criticité — toujours lue depuis la fiche poste. */
export function estCritique(reference?: string): boolean {
  return posteDe(reference)?.isCritical ?? false;
}

export function exigencesDe(reference?: string): ExigencesPoste | undefined {
  return posteDe(reference)?.exigences;
}

export function nombreExigences(reference?: string): number {
  const e = exigencesDe(reference);
  if (!e) return 0;
  return e.competences.length + e.tests.length + e.formations.length + e.documents.length + 1; // +1 expérience
}

export const POSTES_CRITIQUES = POSTES_DETAIL.filter((p) => p.isCritical);

/* ------------------------------------------------------------------ */
/* Moteur de conformité                                                */
/* ------------------------------------------------------------------ */

export type StatutConformite =
  | "Conforme"
  | "Conforme sous réserve"
  | "Non conforme"
  | "Bloqué"
  | "À évaluer";

export interface LigneConformite {
  categorie: "Compétence" | "Test" | "Formation" | "Document" | "Expérience" | "Aptitude" | "Présence" | "Habilitation";
  libelle: string;
  attendu: string;
  constate: string;
  conforme: boolean;
  bloquant: boolean;
}

export interface Conformite {
  poste?: Poste;
  critique: boolean;
  score: number;
  statut: StatutConformite;
  lignes: LigneConformite[];
  blocages: LigneConformite[];
  total: number;
  conformes: number;
  resume: { categorie: string; conformes: number; total: number }[];
  echeance: string;
}

export interface ProfilConformite {
  competences?: { nom: string; niveau: number }[];
  tests?: { nom: string; score: number; statut: string }[];
  documents?: { nom: string; statut: string }[];
  formations?: { nom: string; statut: string }[];
  experienceMois?: number;
  aptitude?: boolean;
  presence?: number;
  habilitations?: string[];
  score?: number;
}

const contient = (a: string, b: string) => {
  const x = normalise(a);
  const y = normalise(b);
  return x.includes(y) || y.includes(x);
};

const docValide = (statut: string) => /valid|vérifi|verifi|conforme|reçu|recu|complet/i.test(statut);

function calculer(exigences: ExigencesPoste, profil: ProfilConformite, poste: Poste): Conformite {
  const lignes: LigneConformite[] = [];

  for (const c of exigences.competences) {
    const trouvee = (profil.competences ?? []).find((x) => contient(x.nom, c.nom));
    lignes.push({
      categorie: "Compétence",
      libelle: c.nom,
      attendu: `Niveau ${c.niveauMin}/4`,
      constate: trouvee ? `Niveau ${trouvee.niveau}/4` : "Non évaluée",
      conforme: !!trouvee && trouvee.niveau >= c.niveauMin,
      bloquant: c.bloquante,
    });
  }

  for (const t of exigences.tests) {
    const passe = (profil.tests ?? []).find((x) => contient(x.nom, t.nom));
    lignes.push({
      categorie: "Test",
      libelle: t.nom,
      attendu: `≥ ${t.scoreMin} %`,
      constate: passe ? `${passe.score} % — ${passe.statut}` : "Non passé",
      conforme: !!passe && passe.score >= t.scoreMin && !/échou|echou/i.test(passe.statut),
      bloquant: t.bloquant,
    });
  }

  for (const f of exigences.formations) {
    const suivie = (profil.formations ?? []).find((x) => contient(x.nom, f.nom));
    lignes.push({
      categorie: "Formation",
      libelle: f.nom,
      attendu: "Validée",
      constate: suivie ? suivie.statut : "Non planifiée",
      conforme: !!suivie && /valid/i.test(suivie.statut),
      bloquant: f.bloquante,
    });
  }

  for (const d of exigences.documents) {
    const doc = (profil.documents ?? []).find((x) => contient(x.nom, d.nom));
    lignes.push({
      categorie: "Document",
      libelle: d.nom,
      attendu: "Validé",
      constate: doc ? doc.statut : "Manquant",
      conforme: !!doc && docValide(doc.statut),
      bloquant: d.bloquant,
    });
  }

  const moisRequis = parseInt(exigences.experience.minimum, 10) || 0;
  const mois = profil.experienceMois ?? 0;
  lignes.push({
    categorie: "Expérience",
    libelle: exigences.experience.type,
    attendu: `≥ ${exigences.experience.minimum}`,
    constate: mois ? `${mois} mois` : "Non renseignée",
    conforme: mois >= moisRequis,
    bloquant: exigences.experience.obligatoire,
  });

  if (profil.aptitude !== undefined) {
    lignes.push({
      categorie: "Aptitude",
      libelle: "Aptitude médicale",
      attendu: "Validée",
      constate: profil.aptitude ? "Validée" : "En attente",
      conforme: profil.aptitude,
      bloquant: true,
    });
  }

  if (profil.presence !== undefined) {
    lignes.push({
      categorie: "Présence",
      libelle: "Présence en formation",
      attendu: `≥ ${exigences.seuils.presence} %`,
      constate: `${profil.presence} %`,
      conforme: profil.presence >= exigences.seuils.presence,
      bloquant: false,
    });
  }

  for (const h of exigences.habilitations) {
    const ok = (profil.habilitations ?? []).some((x) => contient(x, h));
    lignes.push({
      categorie: "Habilitation",
      libelle: h,
      attendu: "En cours de validité",
      constate: ok ? "Valide" : "Absente",
      conforme: ok,
      bloquant: false,
    });
  }

  const conformes = lignes.filter((l) => l.conforme).length;
  const score = lignes.length ? Math.round((conformes / lignes.length) * 100) : 0;
  const blocages = lignes.filter((l) => l.bloquant && !l.conforme);
  const rienEvalue = lignes.filter((l) => /Non |Manquant/i.test(l.constate)).length >= lignes.length - 1;

  let statut: StatutConformite;
  if (rienEvalue) statut = "À évaluer";
  else if (blocages.length >= 3) statut = "Bloqué";
  else if (blocages.length > 0) statut = score >= 70 ? "Conforme sous réserve" : "Non conforme";
  else statut = score >= 95 ? "Conforme" : "Conforme sous réserve";

  const categories = ["Compétence", "Test", "Formation", "Document", "Expérience", "Aptitude", "Habilitation"];
  const resume = categories
    .map((cat) => {
      const l = lignes.filter((x) => x.categorie === cat);
      return { categorie: cat, conformes: l.filter((x) => x.conforme).length, total: l.length };
    })
    .filter((r) => r.total > 0);

  return {
    poste,
    critique: true,
    score,
    statut,
    lignes,
    blocages,
    total: lignes.length,
    conformes,
    resume,
    echeance: "15/08/2026",
  };
}

const NON_CRITIQUE = (poste?: Poste): Conformite => ({
  poste,
  critique: false,
  score: 100,
  statut: "Conforme",
  lignes: [],
  blocages: [],
  total: 0,
  conformes: 0,
  resume: [],
  echeance: "—",
});

/** Conformité générique poste ↔ profil. */
export function conformitePoste(reference: string | undefined, profil: ProfilConformite): Conformite {
  const poste = posteDe(reference);
  if (!poste?.isCritical || !poste.exigences) return NON_CRITIQUE(poste);
  return calculer(poste.exigences, profil, poste);
}

const moisDepuisTexte = (txt?: string) => {
  if (!txt) return 0;
  const ans = /(\d+)\s*an/.exec(txt);
  if (ans) return Number(ans[1]) * 12;
  const mois = /(\d+)\s*mois/.exec(txt);
  return mois ? Number(mois[1]) : 0;
};

const NIVEAUX: Record<string, number> = {
  "Non évaluée": 0,
  "En acquisition": 2,
  Acquise: 3,
  Maîtrisée: 4,
};

/** Conformité prévisionnelle d'un candidat (documents et tests partiels). */
export function conformiteCandidat(candidat: Candidat): Conformite {
  return conformitePoste(candidat.poste, {
    competences: (candidat.competences ?? []).map((c) => ({ nom: c, niveau: 3 })),
    documents: (candidat.documents ?? []).map((d) => ({ nom: d.nom, statut: d.statut })),
    tests: [],
    formations: [],
    experienceMois: moisDepuisTexte(candidat.experience),
    score: candidat.score,
  });
}

/** Conformité d'un ouvrier affecté. */
export function conformiteOuvrier(ouvrier: Ouvrier): Conformite {
  return conformitePoste(ouvrier.poste, {
    competences: (ouvrier.competences ?? []).map((c) => ({
      nom: c.nom,
      niveau: c.niveau || NIVEAUX[c.etat] || 0,
    })),
    tests: (ouvrier.tests ?? []).map((t) => ({ nom: t.nom, score: t.score, statut: t.statut })),
    documents: (ouvrier.documents ?? []).map((d) => ({ nom: d.nom, statut: d.statut })),
    formations: (ouvrier.modules ?? []).map((m) => ({ nom: m.nom, statut: m.statut })),
    experienceMois: 18,
    aptitude: (ouvrier.documents ?? []).some((d) => /aptitude|médical|medical/i.test(d.nom) && docValide(d.statut)),
    presence: ouvrier.presence,
    habilitations: (ouvrier.documents ?? [])
      .filter((d) => /habilitation/i.test(d.nom) && docValide(d.statut))
      .map((d) => d.nom),
    score: ouvrier.score,
  });
}

export function tonConformite(statut: StatutConformite) {
  switch (statut) {
    case "Conforme":
      return "success" as const;
    case "Conforme sous réserve":
      return "warning" as const;
    case "Non conforme":
    case "Bloqué":
      return "critical" as const;
    default:
      return "info" as const;
  }
}
