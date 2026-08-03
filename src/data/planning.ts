// LEONI WORKFORCE JOURNEY — Données du module « Planning des formations ».
// Toutes les personnes, matricules et sessions sont fictives.

export type StatutSession =
  | "Brouillon"
  | "À confirmer"
  | "Planifiée"
  | "Confirmée"
  | "En cours"
  | "Terminée"
  | "Reportée"
  | "Annulée";

export const STATUTS_SESSION: StatutSession[] = [
  "Brouillon",
  "À confirmer",
  "Planifiée",
  "Confirmée",
  "En cours",
  "Terminée",
  "Reportée",
  "Annulée",
];

export type TypeSession =
  | "Formation théorique"
  | "Formation pratique"
  | "QCM"
  | "Test"
  | "Rattrapage"
  | "Évaluation";

export const TYPES_SESSION: TypeSession[] = [
  "Formation théorique",
  "Formation pratique",
  "QCM",
  "Test",
  "Rattrapage",
  "Évaluation",
];

export type StatutParticipant =
  | "Confirmé"
  | "Invitation envoyée"
  | "Lu"
  | "Absent prévu"
  | "En attente";

export interface ParticipantSession {
  workerId: string;
  nom: string;
  poste: string;
  statut: StatutParticipant;
}

export interface EntreeJournal {
  horodatage: string;
  action: string;
  detail?: string;
  auteur: string;
}

export interface SessionPlanning {
  id: string;
  formationCode: string;
  formationNom: string;
  moduleNom: string;
  type: TypeSession;
  date: string; // YYYY-MM-DD
  debut: string; // HH:MM
  fin: string; // HH:MM
  site: string;
  batiment: string;
  salleId: string;
  formateurId: string;
  coFormateurId?: string;
  groupe: string;
  capacite: number;
  participants: ParticipantSession[];
  statut: StatutSession;
  instructions: string;
  materiel: string;
  notifications: { envoyees: number; lues: number };
  presencesSaisies: number;
  evaluationsSaisies: number;
  observations: number;
  journal: EntreeJournal[];
}

/* ------------------------------ Formateurs ------------------------------ */

export interface Formateur {
  id: string;
  nom: string;
  matricule: string;
  fonction: string;
  site: string;
  departement: string;
  centre: string;
  responsable: string;
  telephone: string;
  email: string;
  specialites: string[];
  formations: string[];
  certifications: string[];
  habilitations: string[];
  langues: string[];
  capaciteHebdo: number;
  disponibilites: string;
  conges: string[];
  indisponibilites: string[];
  performance: {
    sessionsRealisees: number;
    heuresDispensees: number;
    participantsFormes: number;
    tauxReussite: number;
    satisfaction: number;
    tauxPresenceParticipants: number;
    evaluationsCompletees: number;
    tauxCloture: number;
    delaiSaisieSuivi: string;
    sessionsAnnulees: number;
  };
}

export const FORMATEURS: Formateur[] = [
  {
    id: "FRM-01",
    nom: "Salma Bennis",
    matricule: "LEO-FRM-0142",
    fonction: "Formatrice industrielle",
    site: "Bouskoura",
    departement: "Formation & Développement",
    centre: "Centre de formation Bouskoura",
    responsable: "Amina Rajouh",
    telephone: "+212 6 42 18 53 72",
    email: "salma.bennis@example.com",
    specialites: ["Câblage automobile", "Assemblage", "Sécurité & EPI", "Contrôle qualité"],
    formations: ["FOR-CBL-01", "FOR-SEC-01", "FOR-QC-01"],
    certifications: ["Sécurité industrielle", "Formation opérateurs câblage", "Qualité niveau 2"],
    habilitations: ["Habilitation électrique BS", "Formateur SST"],
    langues: ["Français", "Arabe"],
    capaciteHebdo: 30,
    disponibilites: "Lun–Ven 08:00 → 17:00",
    conges: ["17/08/2026 → 21/08/2026"],
    indisponibilites: ["Mercredi matin — comité pédagogique"],
    performance: {
      sessionsRealisees: 142,
      heuresDispensees: 618,
      participantsFormes: 1480,
      tauxReussite: 89,
      satisfaction: 4.7,
      tauxPresenceParticipants: 94,
      evaluationsCompletees: 96,
      tauxCloture: 98,
      delaiSaisieSuivi: "0,6 jour",
      sessionsAnnulees: 3,
    },
  },
  {
    id: "FRM-02",
    nom: "Nabil Cherkaoui",
    matricule: "LEO-FRM-0157",
    fonction: "Formateur qualité",
    site: "Berrechid",
    departement: "Qualité & Formation",
    centre: "Centre de formation Berrechid",
    responsable: "Imane El Fassi",
    telephone: "+212 6 61 07 34 15",
    email: "nabil.cherkaoui@example.com",
    specialites: ["Contrôle qualité", "AQL", "Défauthèque"],
    formations: ["FOR-QC-01", "FOR-SEC-01"],
    certifications: ["Auditeur qualité interne", "AQL niveau 2"],
    habilitations: ["Formateur qualité LEONI"],
    langues: ["Français", "Arabe", "Anglais"],
    capaciteHebdo: 30,
    disponibilites: "Lun–Ven 08:30 → 16:30",
    conges: [],
    indisponibilites: ["Vendredi après-midi — audit"],
    performance: {
      sessionsRealisees: 96,
      heuresDispensees: 402,
      participantsFormes: 870,
      tauxReussite: 82,
      satisfaction: 4.3,
      tauxPresenceParticipants: 91,
      evaluationsCompletees: 88,
      tauxCloture: 93,
      delaiSaisieSuivi: "1,2 jour",
      sessionsAnnulees: 6,
    },
  },
  {
    id: "FRM-03",
    nom: "Karim Sebti",
    matricule: "LEO-FRM-0108",
    fonction: "Formateur sécurité & HSE",
    site: "Bouskoura",
    departement: "HSE",
    centre: "Centre de formation Bouskoura",
    responsable: "Service Sécurité",
    telephone: "+212 6 70 22 91 40",
    email: "karim.sebti@example.com",
    specialites: ["Sécurité industrielle", "EPI", "Gestes & postures"],
    formations: ["FOR-SEC-01", "FOR-CBL-01"],
    certifications: ["Formateur SST", "Risque incendie niveau 2"],
    habilitations: ["Habilitation électrique B0", "Chariot cat. 3"],
    langues: ["Français", "Arabe"],
    capaciteHebdo: 30,
    disponibilites: "Lun–Ven 07:30 → 16:00",
    conges: [],
    indisponibilites: [],
    performance: {
      sessionsRealisees: 188,
      heuresDispensees: 512,
      participantsFormes: 2140,
      tauxReussite: 91,
      satisfaction: 4.7,
      tauxPresenceParticipants: 96,
      evaluationsCompletees: 94,
      tauxCloture: 97,
      delaiSaisieSuivi: "0,4 jour",
      sessionsAnnulees: 2,
    },
  },
  {
    id: "FRM-04",
    nom: "Otmane Rifi",
    matricule: "LEO-FRM-0173",
    fonction: "Formateur coupe & sertissage",
    site: "Bouznika",
    departement: "Production & Formation",
    centre: "Atelier école Bouznika",
    responsable: "Rachida Ouazzani",
    telephone: "+212 6 55 84 12 09",
    email: "otmane.rifi@example.com",
    specialites: ["Coupe", "Sertissage", "Paramétrage machines"],
    formations: ["FOR-CUT-01", "FOR-SEC-01"],
    certifications: ["Réglage machines coupe", "Maintenance niveau 1"],
    habilitations: ["Consignation machines"],
    langues: ["Français", "Arabe"],
    capaciteHebdo: 30,
    disponibilites: "Lun–Ven 07:00 → 15:30",
    conges: ["03/08/2026 → 07/08/2026"],
    indisponibilites: ["Jeudi 30/07 — maintenance atelier"],
    performance: {
      sessionsRealisees: 74,
      heuresDispensees: 356,
      participantsFormes: 640,
      tauxReussite: 76,
      satisfaction: 4.1,
      tauxPresenceParticipants: 88,
      evaluationsCompletees: 79,
      tauxCloture: 90,
      delaiSaisieSuivi: "1,8 jour",
      sessionsAnnulees: 9,
    },
  },
  {
    id: "FRM-05",
    nom: "Hind Zeroual",
    matricule: "LEO-FRM-0191",
    fonction: "Formatrice intégration",
    site: "Aïn Sebaâ",
    departement: "Formation & Développement",
    centre: "Centre de formation Aïn Sebaâ",
    responsable: "Amina Rajouh",
    telephone: "+212 6 12 47 66 31",
    email: "hind.zeroual@example.com",
    specialites: ["Intégration", "Culture industrielle", "Lecture d'instructions"],
    formations: ["FOR-CBL-01", "FOR-SEC-01"],
    certifications: ["Pédagogie pour adultes", "Onboarding LEONI"],
    habilitations: ["Formateur interne niveau 2"],
    langues: ["Français", "Arabe", "Anglais"],
    capaciteHebdo: 28,
    disponibilites: "Lun–Ven 08:00 → 16:30",
    conges: [],
    indisponibilites: [],
    performance: {
      sessionsRealisees: 61,
      heuresDispensees: 288,
      participantsFormes: 720,
      tauxReussite: 85,
      satisfaction: 4.5,
      tauxPresenceParticipants: 92,
      evaluationsCompletees: 90,
      tauxCloture: 95,
      delaiSaisieSuivi: "0,9 jour",
      sessionsAnnulees: 4,
    },
  },
  {
    id: "FRM-06",
    nom: "Youssef Ammari",
    matricule: "LEO-FRM-0204",
    fonction: "Formateur technique câblage",
    site: "Agadir",
    departement: "Formation & Développement",
    centre: "Centre de formation Agadir",
    responsable: "Yassine Alaoui",
    telephone: "+212 6 39 55 20 87",
    email: "youssef.ammari@example.com",
    specialites: ["Câblage", "Assemblage", "Contrôle visuel"],
    formations: ["FOR-CBL-01", "FOR-QC-01"],
    certifications: ["Câblage automobile niveau 3"],
    habilitations: ["Formateur interne niveau 1"],
    langues: ["Français", "Arabe"],
    capaciteHebdo: 30,
    disponibilites: "Lun–Ven 08:00 → 17:00",
    conges: [],
    indisponibilites: [],
    performance: {
      sessionsRealisees: 48,
      heuresDispensees: 214,
      participantsFormes: 512,
      tauxReussite: 80,
      satisfaction: 4.2,
      tauxPresenceParticipants: 90,
      evaluationsCompletees: 83,
      tauxCloture: 92,
      delaiSaisieSuivi: "1,1 jour",
      sessionsAnnulees: 5,
    },
  },
];

export const formateurParId = (id: string) => FORMATEURS.find((f) => f.id === id);

/* --------------------------------- Salles ------------------------------- */

export interface Salle {
  id: string;
  nom: string;
  site: string;
  batiment: string;
  capacite: number;
  type: string;
  equipements: string[];
}

export const SALLES: Salle[] = [
  { id: "SAL-F12", nom: "Salle F12", site: "Bouskoura", batiment: "Bâtiment F", capacite: 18, type: "Formation théorique", equipements: ["Écran", "Projecteur", "PC formateur"] },
  { id: "SAL-F10", nom: "Salle F10", site: "Bouskoura", batiment: "Bâtiment F", capacite: 14, type: "Formation théorique", equipements: ["Écran", "Paperboard"] },
  { id: "SAL-A3", nom: "Atelier A3", site: "Bouskoura", batiment: "Atelier école", capacite: 16, type: "Formation pratique", equipements: ["12 postes câblage", "Tables d'assemblage", "EPI"] },
  { id: "SAL-Q02", nom: "Salle Q02", site: "Berrechid", batiment: "Bâtiment Q", capacite: 12, type: "Formation théorique", equipements: ["Écran", "Défauthèque", "Loupes"] },
  { id: "SAL-S01", nom: "Salle S01", site: "Bouskoura", batiment: "Bâtiment S", capacite: 24, type: "Amphithéâtre sécurité", equipements: ["Vidéoprojecteur", "Sono", "Mannequin SST"] },
  { id: "SAL-C1", nom: "Atelier C1", site: "Bouznika", batiment: "Atelier coupe", capacite: 10, type: "Formation pratique", equipements: ["3 machines coupe", "Presses sertissage"] },
  { id: "SAL-N04", nom: "Salle N04", site: "Aïn Sebaâ", batiment: "Bâtiment N", capacite: 20, type: "Formation théorique", equipements: ["Écran", "PC formateur"] },
  { id: "SAL-G07", nom: "Salle G07", site: "Agadir", batiment: "Bâtiment G", capacite: 16, type: "Formation mixte", equipements: ["Écran", "6 postes câblage"] },
];

export const salleParId = (id: string) => SALLES.find((s) => s.id === id);

/* -------------------------------- Groupes ------------------------------- */

export interface Groupe {
  code: string;
  site: string;
  atelier: string;
  posteCible: string;
  effectif: number;
}

export const GROUPES: Groupe[] = [
  { code: "CBL-07", site: "Bouskoura", atelier: "Atelier A", posteCible: "Opérateur câblage", effectif: 14 },
  { code: "CBL-08", site: "Bouskoura", atelier: "Atelier B", posteCible: "Opérateur câblage", effectif: 12 },
  { code: "QC-04", site: "Berrechid", atelier: "Ligne qualité", posteCible: "Contrôleur qualité", effectif: 10 },
  { code: "SEC-02", site: "Bouskoura", atelier: "Multi-ateliers", posteCible: "Tous postes", effectif: 22 },
  { code: "CUT-03", site: "Bouznika", atelier: "Atelier coupe", posteCible: "Opérateur coupe", effectif: 9 },
  { code: "INT-11", site: "Aïn Sebaâ", atelier: "Atelier D", posteCible: "Opérateur assemblage", effectif: 16 },
  { code: "AGD-05", site: "Agadir", atelier: "Atelier G", posteCible: "Opérateur câblage", effectif: 13 },
];

/* ----------------------------- Formations ------------------------------- */

export const FORMATIONS_PLANNING = [
  {
    code: "FOR-CBL-01",
    nom: "Intégration opérateur câblage",
    modules: ["Sécurité & EPI", "Introduction câblage", "Lecture instructions", "Préparation composants", "Techniques assemblage", "Contrôle visuel"],
  },
  { code: "FOR-QC-01", nom: "Contrôleur qualité", modules: ["Fondamentaux qualité", "Plans de contrôle", "AQL", "Défauthèque", "Reporting qualité"] },
  { code: "FOR-CUT-01", nom: "Opérateur coupe", modules: ["Sécurité machines", "Paramétrage coupe", "Sertissage", "Contrôle coupe"] },
  { code: "FOR-SEC-01", nom: "Sécurité industrielle & EPI", modules: ["Risques industriels", "EPI", "Consignes site", "QCM final"] },
];

export const MODULES_PLANNING = [...new Set(FORMATIONS_PLANNING.flatMap((f) => f.modules))];

/* ------------------------------ Participants ---------------------------- */

const VIVIER = [
  ["LMA-BOU-2026-0418", "Sara Amrani", "Opératrice câblage"],
  ["LMA-BOU-2026-0435", "Mariam Lahlou", "Opératrice câblage"],
  ["LMA-BOU-2026-0395", "Khadija Rami", "Opératrice assemblage"],
  ["LMA-BOU-2026-0402", "Yassine Bennani", "Opérateur câblage"],
  ["LMA-BOU-2026-0447", "Imane Sabri", "Opératrice contrôle"],
  ["LMA-BER-2026-0121", "Hicham Ouali", "Contrôleur qualité"],
  ["LMA-BER-2026-0134", "Fatima Zahra Idrissi", "Contrôleuse qualité"],
  ["LMA-BZK-2026-0088", "Ayoub Najjar", "Opérateur coupe"],
  ["LMA-BZK-2026-0093", "Rachid Talbi", "Opérateur coupe"],
  ["LMA-AIN-2026-0311", "Nawal Chraibi", "Opératrice assemblage"],
  ["LMA-AIN-2026-0324", "Soufiane Kabbaj", "Opérateur assemblage"],
  ["LMA-AGD-2026-0207", "Latifa Boukhris", "Opératrice câblage"],
  ["LMA-AGD-2026-0219", "Mehdi Zouhair", "Opérateur câblage"],
  ["LMA-BOU-2026-0461", "Salma Hakimi", "Opératrice câblage"],
  ["LMA-BOU-2026-0472", "Anas Belkadi", "Opérateur assemblage"],
  ["LMA-BER-2026-0142", "Sanaa Mouline", "Contrôleuse qualité"],
  ["LMA-BOU-2026-0480", "Omar Fassi", "Opérateur câblage"],
  ["LMA-AIN-2026-0338", "Zineb Haddadi", "Opératrice assemblage"],
  ["LMA-AGD-2026-0231", "Hamza Bouzid", "Opérateur câblage"],
  ["LMA-BZK-2026-0101", "Meryem Sefrioui", "Opératrice coupe"],
  ["LMA-BOU-2026-0491", "Bilal Tazi", "Opérateur câblage"],
  ["LMA-BOU-2026-0503", "Houda Naciri", "Opératrice contrôle"],
  ["LMA-BER-2026-0155", "Younes Berrada", "Contrôleur qualité"],
  ["LMA-AIN-2026-0349", "Amal Regragui", "Opératrice assemblage"],
] as const;

const STATUTS_PART: StatutParticipant[] = ["Confirmé", "Invitation envoyée", "Lu", "En attente", "Absent prévu"];

/* --------------------------- Générateur sessions ------------------------- */

function alea(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) % 2147483648;
    return s / 2147483648;
  };
}

const AUJOURDHUI = "2026-07-29";
export const DATE_REFERENCE = AUJOURDHUI;

function iso(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

const CRENEAUX: [string, string][] = [
  ["08:00", "10:00"],
  ["08:30", "12:00"],
  ["09:00", "12:00"],
  ["10:00", "12:00"],
  ["13:00", "15:00"],
  ["13:30", "17:00"],
  ["14:00", "16:00"],
  ["15:00", "17:00"],
];

function participants(rnd: () => number, n: number, offset: number): ParticipantSession[] {
  const out: ParticipantSession[] = [];
  for (let i = 0; i < n; i++) {
    const [workerId, nom, poste] = VIVIER[(offset + i * 3) % VIVIER.length];
    if (out.some((p) => p.workerId === workerId)) continue;
    out.push({ workerId, nom, poste, statut: STATUTS_PART[Math.floor(rnd() * 5)] });
  }
  return out;
}

function genererSessions(): SessionPlanning[] {
  const rnd = alea(20260727);
  const sessions: SessionPlanning[] = [];
  const debutPeriode = new Date("2026-07-20T00:00:00");
  let n = 1200;

  for (let jour = 0; jour < 28; jour++) {
    const d = new Date(debutPeriode);
    d.setDate(d.getDate() + jour);
    const dow = d.getDay();
    if (dow === 0) continue; // dimanche libre
    const nb = dow === 6 ? 1 : 2 + Math.floor(rnd() * 2);

    for (let k = 0; k < nb; k++) {
      const groupe = GROUPES[Math.floor(rnd() * GROUPES.length)];
      const formation = FORMATIONS_PLANNING[Math.floor(rnd() * FORMATIONS_PLANNING.length)];
      const moduleNom = formation.modules[Math.floor(rnd() * formation.modules.length)];
      const sallesSite = SALLES.filter((s) => s.site === groupe.site);
      const salle = (sallesSite.length ? sallesSite : SALLES)[Math.floor(rnd() * (sallesSite.length || SALLES.length))];
      const formateursSite = FORMATEURS.filter((f) => f.site === groupe.site);
      const formateur = (formateursSite.length ? formateursSite : FORMATEURS)[
        Math.floor(rnd() * (formateursSite.length || FORMATEURS.length))
      ];
      const [debut, fin] = CRENEAUX[(k * 3 + jour) % CRENEAUX.length];
      const dateIso = iso(d);

      let type: TypeSession = "Formation théorique";
      const r = rnd();
      if (r > 0.88) type = "Rattrapage";
      else if (r > 0.78) type = "QCM";
      else if (r > 0.7) type = "Évaluation";
      else if (r > 0.45) type = "Formation pratique";

      let statut: StatutSession;
      if (dateIso < AUJOURDHUI) statut = rnd() > 0.12 ? "Terminée" : "Annulée";
      else if (dateIso === AUJOURDHUI) statut = k === 0 ? "En cours" : "Confirmée";
      else {
        const s = rnd();
        statut = s > 0.82 ? "Planifiée" : s > 0.72 ? "À confirmer" : s > 0.66 ? "Reportée" : s > 0.6 ? "Brouillon" : "Confirmée";
      }

      const capacite = salle.capacite;
      const effectif = Math.max(4, Math.min(capacite + (rnd() > 0.92 ? 2 : 0), Math.round(groupe.effectif * (0.6 + rnd() * 0.6))));
      const parts = participants(rnd, effectif, n);
      const envoyees = statut === "Brouillon" ? 0 : parts.length;
      const code = type === "Rattrapage" ? `RAT-${groupe.code}` : groupe.code;

      sessions.push({
        id: `SES-${n++}`,
        formationCode: formation.code,
        formationNom: formation.nom,
        moduleNom: type === "Rattrapage" ? `Rattrapage ${moduleNom}` : moduleNom,
        type,
        date: dateIso,
        debut,
        fin,
        site: groupe.site,
        batiment: salle.batiment,
        salleId: salle.id,
        formateurId: formateur.id,
        groupe: code,
        capacite,
        participants: parts,
        statut,
        instructions: "Prévoir la feuille d'émargement et les supports pédagogiques du module.",
        materiel: salle.equipements.join(", "),
        notifications: { envoyees, lues: Math.round(envoyees * (0.6 + rnd() * 0.4)) },
        presencesSaisies: statut === "Terminée" ? parts.length : 0,
        evaluationsSaisies: statut === "Terminée" ? Math.max(0, parts.length - Math.floor(rnd() * 3)) : 0,
        observations: statut === "Terminée" ? Math.floor(rnd() * 9) : 0,
        journal: [
          { horodatage: "26/07 — 11:42", action: "Session créée", auteur: "Amina Rajouh" },
          { horodatage: "27/07 — 09:17", action: "Salle modifiée", detail: `F10 → ${salle.nom}`, auteur: formateur.nom },
          { horodatage: "27/07 — 15:30", action: "2 participants ajoutés", auteur: "Imane El Fassi" },
        ],
      });
    }
  }

  // Sessions repères garanties sur la semaine du 27/07
  sessions.push({
    id: "SES-1101",
    formationCode: "FOR-CBL-01",
    formationNom: "Intégration opérateur câblage",
    moduleNom: "Introduction câblage",
    type: "Formation théorique",
    date: "2026-07-28",
    debut: "08:30",
    fin: "12:00",
    site: "Bouskoura",
    batiment: "Bâtiment F",
    salleId: "SAL-F12",
    formateurId: "FRM-01",
    groupe: "CBL-07",
    capacite: 18,
    participants: participants(alea(7), 14, 0),
    statut: "Confirmée",
    instructions: "Support « Introduction câblage v4 » — remettre le livret opérateur.",
    materiel: "Écran, projecteur, PC formateur, livrets",
    notifications: { envoyees: 14, lues: 12 },
    presencesSaisies: 0,
    evaluationsSaisies: 0,
    observations: 0,
    journal: [
      { horodatage: "26/07 — 11:42", action: "Session créée", auteur: "Amina Rajouh" },
      { horodatage: "27/07 — 09:17", action: "Salle modifiée", detail: "F10 → F12", auteur: "Salma Bennis" },
      { horodatage: "27/07 — 15:30", action: "2 participants ajoutés", auteur: "Imane El Fassi" },
      { horodatage: "28/07 — 07:45", action: "Rappel envoyé aux participants", auteur: "Système" },
    ],
  });
  sessions.push({
    id: "SES-1102",
    formationCode: "FOR-SEC-01",
    formationNom: "Sécurité industrielle & EPI",
    moduleNom: "Rattrapage Sécurité & EPI",
    type: "Rattrapage",
    date: "2026-07-31",
    debut: "14:00",
    fin: "15:00",
    site: "Bouskoura",
    batiment: "Bâtiment S",
    salleId: "SAL-S01",
    formateurId: "FRM-03",
    groupe: "RAT-SEC-07",
    capacite: 24,
    participants: participants(alea(11), 5, 4),
    statut: "Planifiée",
    instructions: "Rattrapage QCM sécurité — 20 questions, seuil 80 %.",
    materiel: "Tablettes QCM",
    notifications: { envoyees: 5, lues: 3 },
    presencesSaisies: 0,
    evaluationsSaisies: 0,
    observations: 0,
    journal: [{ horodatage: "27/07 — 16:10", action: "Rattrapage programmé", auteur: "Karim Sebti" }],
  });

  return sessions.sort((a, b) => (a.date + a.debut).localeCompare(b.date + b.debut));
}

export const SESSIONS_PLANNING: SessionPlanning[] = genererSessions();

/* -------------------------------- Utilitaires --------------------------- */

export const minutes = (h: string) => Number(h.slice(0, 2)) * 60 + Number(h.slice(3, 5));
export const dureeMin = (s: { debut: string; fin: string }) => minutes(s.fin) - minutes(s.debut);
export const dureeTexte = (s: { debut: string; fin: string }) => {
  const m = dureeMin(s);
  return `${Math.floor(m / 60)}h${String(m % 60).padStart(2, "0")}`;
};

export const JOURS_COURT = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
export const MOIS_FR = [
  "janvier", "février", "mars", "avril", "mai", "juin",
  "juillet", "août", "septembre", "octobre", "novembre", "décembre",
];

export function parseIso(d: string) {
  return new Date(`${d}T00:00:00`);
}
export function isoDe(d: Date) {
  return iso(d);
}
export function ajouterJours(d: string, n: number) {
  const x = parseIso(d);
  x.setDate(x.getDate() + n);
  return iso(x);
}
export function lundiDe(d: string) {
  const x = parseIso(d);
  const dow = (x.getDay() + 6) % 7;
  x.setDate(x.getDate() - dow);
  return iso(x);
}
export function formatCourt(d: string) {
  const x = parseIso(d);
  return `${x.getDate()} ${MOIS_FR[x.getMonth()]}`;
}
export function formatLong(d: string) {
  const x = parseIso(d);
  const jours = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
  return `${jours[x.getDay()]} ${x.getDate()} ${MOIS_FR[x.getMonth()]} ${x.getFullYear()}`;
}
export function formatCourtNum(d: string) {
  const x = parseIso(d);
  return `${String(x.getDate()).padStart(2, "0")}/${String(x.getMonth() + 1).padStart(2, "0")}/${x.getFullYear()}`;
}
