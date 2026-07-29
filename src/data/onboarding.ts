/**
 * Pré-intégration / onboarding opérateur.
 * Source unique de vérité : documents, équipements, badge, casier, transport,
 * consignes et communications d'un futur ouvrier.
 */

export type StatutDocument =
  | "Non demandé"
  | "Demandé"
  | "En attente"
  | "Reçu"
  | "À vérifier"
  | "Validé"
  | "Refusé / non conforme"
  | "À remplacer"
  | "Expiré"
  | "Non applicable";

export type ModeRemise =
  | "À envoyer en ligne"
  | "À apporter le jour d'intégration"
  | "À remettre au service RH"
  | "À compléter sur place";

export type CategorieDocument =
  | "A — Identité"
  | "B — Sécurité sociale & administratif"
  | "C — Formation & qualifications"
  | "D — Santé / aptitude"
  | "E — Documents contractuels"
  | "F — Autres";

export interface DocumentOnboarding {
  id: string;
  nom: string;
  categorie: CategorieDocument;
  obligatoire: boolean;
  dateLimite: string;
  format: string;
  copies: number;
  originalRequis: boolean;
  commentaire: string;
  mode: ModeRemise;
  statut: StatutDocument;
  demandeLe?: string;
  recuLe?: string;
  valideLe?: string;
  validePar?: string;
}

export interface ModeleDocument {
  id: string;
  nom: string;
  categorie: CategorieDocument;
  obligatoireParDefaut: boolean;
  modeParDefaut: ModeRemise;
  format: string;
  originalRequis: boolean;
  copies: number;
  presetOperateur?: boolean;
}

export const CATALOGUE_DOCUMENTS: ModeleDocument[] = [
  // A — Identité
  { id: "DOC-CIN", nom: "Copie CIN recto / verso", categorie: "A — Identité", obligatoireParDefaut: true, modeParDefaut: "À envoyer en ligne", format: "PDF / JPG / copie papier", originalRequis: true, copies: 2, presetOperateur: true },
  { id: "DOC-PASS", nom: "Passeport", categorie: "A — Identité", obligatoireParDefaut: false, modeParDefaut: "À envoyer en ligne", format: "PDF / JPG", originalRequis: false, copies: 1 },
  { id: "DOC-SEJOUR", nom: "Titre / carte de séjour si applicable", categorie: "A — Identité", obligatoireParDefaut: false, modeParDefaut: "À remettre au service RH", format: "PDF / JPG", originalRequis: true, copies: 1 },
  { id: "DOC-NAISSANCE", nom: "Extrait d'acte de naissance", categorie: "A — Identité", obligatoireParDefaut: false, modeParDefaut: "À apporter le jour d'intégration", format: "Original papier", originalRequis: true, copies: 1 },
  { id: "DOC-PHOTOS", nom: "Photos d'identité", categorie: "A — Identité", obligatoireParDefaut: true, modeParDefaut: "À apporter le jour d'intégration", format: "Tirage papier", originalRequis: true, copies: 2, presetOperateur: true },
  { id: "DOC-DOMICILE", nom: "Justificatif de domicile", categorie: "A — Identité", obligatoireParDefaut: false, modeParDefaut: "À envoyer en ligne", format: "PDF / JPG", originalRequis: false, copies: 1 },
  // B — Sécurité sociale & administratif
  { id: "DOC-CNSS", nom: "Numéro / carte CNSS", categorie: "B — Sécurité sociale & administratif", obligatoireParDefaut: true, modeParDefaut: "À apporter le jour d'intégration", format: "PDF / JPG / copie papier", originalRequis: false, copies: 1, presetOperateur: true },
  { id: "DOC-CNSS-IMM", nom: "Formulaire d'immatriculation CNSS si nécessaire", categorie: "B — Sécurité sociale & administratif", obligatoireParDefaut: false, modeParDefaut: "À compléter sur place", format: "Formulaire RH", originalRequis: true, copies: 1 },
  { id: "DOC-RIB", nom: "RIB bancaire", categorie: "B — Sécurité sociale & administratif", obligatoireParDefaut: true, modeParDefaut: "À envoyer en ligne", format: "PDF / photo lisible", originalRequis: false, copies: 1, presetOperateur: true },
  { id: "DOC-BANQUE", nom: "Coordonnées bancaires", categorie: "B — Sécurité sociale & administratif", obligatoireParDefaut: false, modeParDefaut: "À compléter sur place", format: "Formulaire RH", originalRequis: false, copies: 1 },
  { id: "DOC-FAMILLE", nom: "Situation familiale si nécessaire au dossier administratif", categorie: "B — Sécurité sociale & administratif", obligatoireParDefaut: false, modeParDefaut: "À compléter sur place", format: "Formulaire RH", originalRequis: false, copies: 1 },
  // C — Formation & qualifications
  { id: "DOC-DIPLOME", nom: "Copie du diplôme", categorie: "C — Formation & qualifications", obligatoireParDefaut: true, modeParDefaut: "À envoyer en ligne", format: "PDF / JPG", originalRequis: true, copies: 1, presetOperateur: true },
  { id: "DOC-ATT-FORM", nom: "Attestation de formation", categorie: "C — Formation & qualifications", obligatoireParDefaut: false, modeParDefaut: "À envoyer en ligne", format: "PDF / JPG", originalRequis: false, copies: 1 },
  { id: "DOC-QUALIF", nom: "Certificat de qualification", categorie: "C — Formation & qualifications", obligatoireParDefaut: false, modeParDefaut: "À envoyer en ligne", format: "PDF / JPG", originalRequis: false, copies: 1 },
  { id: "DOC-ATT-TRAV", nom: "Attestation / certificat de travail", categorie: "C — Formation & qualifications", obligatoireParDefaut: false, modeParDefaut: "À envoyer en ligne", format: "PDF / JPG", originalRequis: false, copies: 1, presetOperateur: true },
  { id: "DOC-STAGE", nom: "Attestation de stage", categorie: "C — Formation & qualifications", obligatoireParDefaut: false, modeParDefaut: "À envoyer en ligne", format: "PDF / JPG", originalRequis: false, copies: 1 },
  { id: "DOC-PERMIS", nom: "Permis de conduire si requis", categorie: "C — Formation & qualifications", obligatoireParDefaut: false, modeParDefaut: "À apporter le jour d'intégration", format: "Copie papier", originalRequis: true, copies: 1 },
  { id: "DOC-HABIL", nom: "Habilitation spécifique", categorie: "C — Formation & qualifications", obligatoireParDefaut: false, modeParDefaut: "À remettre au service RH", format: "PDF", originalRequis: true, copies: 1 },
  { id: "DOC-CERTIF", nom: "Certification métier", categorie: "C — Formation & qualifications", obligatoireParDefaut: false, modeParDefaut: "À envoyer en ligne", format: "PDF", originalRequis: false, copies: 1 },
  // D — Santé / aptitude
  { id: "DOC-APTITUDE", nom: "Certificat médical / aptitude au poste si requis", categorie: "D — Santé / aptitude", obligatoireParDefaut: true, modeParDefaut: "À remettre au service RH", format: "Document médecine du travail", originalRequis: true, copies: 1, presetOperateur: true },
  { id: "DOC-VISITE", nom: "Visite médicale d'embauche à programmer", categorie: "D — Santé / aptitude", obligatoireParDefaut: false, modeParDefaut: "À compléter sur place", format: "Convocation interne", originalRequis: false, copies: 1 },
  { id: "DOC-APT-SPE", nom: "Document d'aptitude spécifique au poste si applicable", categorie: "D — Santé / aptitude", obligatoireParDefaut: false, modeParDefaut: "À remettre au service RH", format: "Document médecine du travail", originalRequis: true, copies: 1 },
  // E — Documents contractuels
  { id: "DOC-CONTRAT", nom: "Contrat de travail", categorie: "E — Documents contractuels", obligatoireParDefaut: true, modeParDefaut: "À compléter sur place", format: "Signature sur site", originalRequis: true, copies: 2 },
  { id: "DOC-FICHE-SAL", nom: "Fiche salarié", categorie: "E — Documents contractuels", obligatoireParDefaut: false, modeParDefaut: "À compléter sur place", format: "Formulaire RH", originalRequis: true, copies: 1 },
  { id: "DOC-RI", nom: "Règlement intérieur / accusé de réception", categorie: "E — Documents contractuels", obligatoireParDefaut: false, modeParDefaut: "À compléter sur place", format: "Signature sur site", originalRequis: true, copies: 1 },
  { id: "DOC-CHARTE-SEC", nom: "Charte sécurité", categorie: "E — Documents contractuels", obligatoireParDefaut: false, modeParDefaut: "À compléter sur place", format: "Signature sur site", originalRequis: true, copies: 1 },
  { id: "DOC-CHARTE-IT", nom: "Charte informatique si applicable", categorie: "E — Documents contractuels", obligatoireParDefaut: false, modeParDefaut: "À compléter sur place", format: "Signature sur site", originalRequis: false, copies: 1 },
  { id: "DOC-CONSENT", nom: "Autorisation / consentement administratif", categorie: "E — Documents contractuels", obligatoireParDefaut: false, modeParDefaut: "À compléter sur place", format: "Formulaire RH", originalRequis: true, copies: 1 },
  { id: "DOC-CONFID", nom: "Engagement confidentialité si nécessaire", categorie: "E — Documents contractuels", obligatoireParDefaut: false, modeParDefaut: "À compléter sur place", format: "Signature sur site", originalRequis: true, copies: 1 },
  // F — Autres
  { id: "DOC-AUTRE", nom: "Autre document", categorie: "F — Autres", obligatoireParDefaut: false, modeParDefaut: "À remettre au service RH", format: "Libre", originalRequis: false, copies: 1 },
];

export const CATEGORIES_DOCUMENTS: CategorieDocument[] = [
  "A — Identité",
  "B — Sécurité sociale & administratif",
  "C — Formation & qualifications",
  "D — Santé / aptitude",
  "E — Documents contractuels",
  "F — Autres",
];

export const MODES_REMISE: ModeRemise[] = [
  "À envoyer en ligne",
  "À apporter le jour d'intégration",
  "À remettre au service RH",
  "À compléter sur place",
];

export const STATUTS_DOCUMENT: StatutDocument[] = [
  "Non demandé",
  "Demandé",
  "En attente",
  "Reçu",
  "À vérifier",
  "Validé",
  "Refusé / non conforme",
  "À remplacer",
  "Expiré",
  "Non applicable",
];

/* ---------------- Équipements / EPI ---------------- */

export type StatutEquipement =
  | "À préparer"
  | "Disponible"
  | "À commander"
  | "Remis"
  | "À remplacer"
  | "Non applicable";

export const STATUTS_EQUIPEMENT: StatutEquipement[] = [
  "À préparer",
  "Disponible",
  "À commander",
  "Remis",
  "À remplacer",
  "Non applicable",
];

export interface EquipementOnboarding {
  id: string;
  nom: string;
  requis: boolean;
  taille: string;
  quantite: number;
  statut: StatutEquipement;
  dateRemise?: string;
  remisPar?: string;
  recuPar?: string;
}

export const CATALOGUE_EPI: { id: string; nom: string; tailleType: "Vêtement" | "Pointure" | "Aucune"; presetOperateur?: boolean }[] = [
  { id: "EPI-GILET", nom: "Gilet", tailleType: "Vêtement", presetOperateur: true },
  { id: "EPI-BLOUSE", nom: "Blouse", tailleType: "Vêtement", presetOperateur: true },
  { id: "EPI-CHAUSSURES", nom: "Chaussures de sécurité", tailleType: "Pointure", presetOperateur: true },
  { id: "EPI-GANTS", nom: "Gants", tailleType: "Vêtement", presetOperateur: true },
  { id: "EPI-LUNETTES", nom: "Lunettes de protection", tailleType: "Aucune" },
  { id: "EPI-CASQUE", nom: "Casque si nécessaire", tailleType: "Aucune" },
  { id: "EPI-AUDITIVE", nom: "Protection auditive", tailleType: "Aucune" },
  { id: "EPI-BADGE", nom: "Badge / porte-badge", tailleType: "Aucune", presetOperateur: true },
  { id: "EPI-AUTRE", nom: "Autre EPI", tailleType: "Aucune" },
];

export const EQUIPEMENTS_PAR_POSTE: Record<string, string[]> = {
  "Opératrice câblage": ["EPI-GILET", "EPI-BLOUSE", "EPI-CHAUSSURES", "EPI-GANTS", "EPI-BADGE"],
  "Opérateur câblage": ["EPI-GILET", "EPI-BLOUSE", "EPI-CHAUSSURES", "EPI-GANTS", "EPI-BADGE"],
  "Opérateur coupe": ["EPI-GILET", "EPI-CHAUSSURES", "EPI-GANTS", "EPI-LUNETTES", "EPI-BADGE"],
  "Technicien de ligne": ["EPI-GILET", "EPI-CHAUSSURES", "EPI-LUNETTES", "EPI-AUDITIVE", "EPI-BADGE"],
  "Contrôleuse qualité": ["EPI-BLOUSE", "EPI-CHAUSSURES", "EPI-BADGE"],
};

/* ---------------- Badge / casier / transport ---------------- */

export type StatutBadge = "À préparer" | "Commandé" | "Prêt" | "Remis" | "Activé";
export const STATUTS_BADGE: StatutBadge[] = ["À préparer", "Commandé", "Prêt", "Remis", "Activé"];

export const INSTRUCTIONS_BADGE = [
  "Badge à récupérer à l'accueil sécurité",
  "Badge remis par RH",
  "Badge créé lors du premier jour",
];

export type StatutCasier = "Non affecté" | "À affecter" | "Affecté";
export const STATUTS_CASIER: StatutCasier[] = ["Non affecté", "À affecter", "Affecté"];

export type StatutTransport =
  | "À définir"
  | "Non nécessaire"
  | "Demandé"
  | "Trajet proposé"
  | "Confirmé"
  | "Communiqué au salarié";

export const STATUTS_TRANSPORT: StatutTransport[] = [
  "À définir",
  "Non nécessaire",
  "Demandé",
  "Trajet proposé",
  "Confirmé",
  "Communiqué au salarié",
];

export const LIGNES_TRANSPORT = [
  { ligne: "TR-BSK-14", site: "Bouskoura", zone: "Hay Hassani", point: "Hay Hassani – Point 03", aller: "06:35", retour: "17:25", transporteur: "Casa Transport Services", contact: "+212 6 62 18 44 07" },
  { ligne: "TR-BSK-07", site: "Bouskoura", zone: "Sidi Maârouf", point: "Sidi Maârouf – Point 01", aller: "06:20", retour: "17:40", transporteur: "Casa Transport Services", contact: "+212 6 62 18 44 07" },
  { ligne: "TR-BER-02", site: "Berrechid", zone: "Centre Berrechid", point: "Gare routière – Point 02", aller: "06:10", retour: "17:15", transporteur: "Chaouia Trans", contact: "+212 6 61 90 22 15" },
  { ligne: "TR-BZN-05", site: "Bouznika", zone: "Bouznika centre", point: "Place Al Massira – Point 05", aller: "06:45", retour: "17:30", transporteur: "Trans Atlantique", contact: "+212 6 67 55 12 08" },
  { ligne: "TR-AGA-03", site: "Agadir", zone: "Dcheira", point: "Dcheira – Point 03", aller: "06:25", retour: "17:20", transporteur: "Souss Mobilité", contact: "+212 6 63 74 90 11" },
];

export const POINTS_ACCUEIL = [
  "Accueil principal / Poste de sécurité",
  "Accueil RH — Bâtiment administratif",
  "Poste de sécurité — Entrée personnel",
  "Salle d'accueil formation",
];

/* ---------------- Consignes ---------------- */

export type CategorieConsigne = "Arrivée" | "Documents" | "Tenue" | "Sécurité" | "Transport" | "Intégration";

export interface Consigne {
  id: string;
  categorie: CategorieConsigne;
  texte: string;
  active: boolean;
  presetOperateur?: boolean;
}

export const CATALOGUE_CONSIGNES: Consigne[] = [
  { id: "CS-A1", categorie: "Arrivée", texte: "Se présenter 15 minutes avant l'heure indiquée.", active: true, presetOperateur: true },
  { id: "CS-A2", categorie: "Arrivée", texte: "Présenter une pièce d'identité à l'accueil.", active: true, presetOperateur: true },
  { id: "CS-A3", categorie: "Arrivée", texte: "Se présenter au poste de sécurité.", active: true },
  { id: "CS-A4", categorie: "Arrivée", texte: "Demander le service Ressources Humaines.", active: true },
  { id: "CS-A5", categorie: "Arrivée", texte: "Ne pas accéder seul aux zones de production.", active: true },
  { id: "CS-D1", categorie: "Documents", texte: "Apporter les originaux des documents demandés pour vérification.", active: true, presetOperateur: true },
  { id: "CS-D2", categorie: "Documents", texte: "Les documents doivent être lisibles.", active: true },
  { id: "CS-D3", categorie: "Documents", texte: "Prévoir les copies demandées.", active: true },
  { id: "CS-D4", categorie: "Documents", texte: "Les documents manquants pourront retarder la finalisation du dossier.", active: true },
  { id: "CS-T1", categorie: "Tenue", texte: "Porter une tenue adaptée.", active: true, presetOperateur: true },
  { id: "CS-T2", categorie: "Tenue", texte: "Les EPI seront remis sur site.", active: true, presetOperateur: true },
  { id: "CS-T3", categorie: "Tenue", texte: "Les chaussures de sécurité sont obligatoires en zone de production après remise.", active: true },
  { id: "CS-T4", categorie: "Tenue", texte: "Respecter les consignes d'utilisation des EPI.", active: true },
  { id: "CS-S1", categorie: "Sécurité", texte: "Respecter les consignes du personnel d'accueil et de sécurité.", active: true, presetOperateur: true },
  { id: "CS-S2", categorie: "Sécurité", texte: "Le badge d'accès est personnel.", active: true },
  { id: "CS-S3", categorie: "Sécurité", texte: "Le prêt du badge est interdit.", active: true },
  { id: "CS-S4", categorie: "Sécurité", texte: "Respecter les zones autorisées.", active: true },
  { id: "CS-S5", categorie: "Sécurité", texte: "Signaler immédiatement tout incident.", active: true },
  { id: "CS-TR1", categorie: "Transport", texte: "Respecter l'heure du transport.", active: true },
  { id: "CS-TR2", categorie: "Transport", texte: "Se présenter en avance au point de ramassage.", active: true },
  { id: "CS-TR3", categorie: "Transport", texte: "Signaler tout changement de trajet au service concerné.", active: true },
  { id: "CS-I1", categorie: "Intégration", texte: "Une session d'accueil est prévue le premier jour.", active: true, presetOperateur: true },
  { id: "CS-I2", categorie: "Intégration", texte: "Une formation sécurité est obligatoire.", active: true, presetOperateur: true },
  { id: "CS-I3", categorie: "Intégration", texte: "Votre affectation définitive dépendra du parcours d'intégration prévu.", active: true },
];

export const CATEGORIES_CONSIGNES: CategorieConsigne[] = [
  "Arrivée",
  "Documents",
  "Tenue",
  "Sécurité",
  "Transport",
  "Intégration",
];

/* ---------------- Checklists ---------------- */

export interface ElementChecklist {
  id: string;
  label: string;
  fait: boolean;
  date?: string;
  par?: string;
}

export const CHECKLIST_PREPARATION: string[] = [
  "Matricule créé",
  "Badge préparé",
  "Casier affecté",
  "Gilet préparé",
  "Blouse préparée",
  "Chaussures préparées",
  "EPI préparés",
  "Transport défini",
  "Planning intégration préparé",
  "Formation affectée",
  "Responsable informé",
  "Formateur informé",
  "Atelier informé",
  "Visite médicale programmée",
  "Documents RH complets",
];

export const CHECKLIST_JOUR_J: string[] = [
  "Identité vérifiée",
  "Documents papier récupérés",
  "Badge remis",
  "Badge activé",
  "Gilet remis",
  "Blouse remise",
  "Chaussures sécurité remises",
  "Autres EPI remis",
  "Casier communiqué",
  "Clé casier remise",
  "Trajet transport confirmé",
  "Responsable présenté",
  "Règlement / consignes communiqués",
  "Formation sécurité lancée",
];

/* ---------------- Dossier ---------------- */

export interface CommunicationOnboarding {
  id: string;
  date: string;
  heure: string;
  canal: "WhatsApp" | "Email";
  objet: string;
  contenu: string;
  statut: string;
  etapes: string[];
}

export interface DossierOnboarding {
  candidatId?: string;
  arrivee: {
    date: string;
    heure: string;
    site: string;
    pointAccueil: string;
    contactRH: string;
    telephoneRH: string;
    departement: string;
    poste: string;
    atelier: string;
  };
  badge: {
    statut: StatutBadge;
    numero: string;
    dateCreation: string;
    dateRemise: string;
    dateActivation: string;
    zones: string;
    instruction: string;
  };
  documents: DocumentOnboarding[];
  equipements: EquipementOnboarding[];
  tailles: { blouse: string; gilet: string; chaussures: string; gants: string };
  vestiaire: {
    statut: StatutCasier;
    vestiaire: string;
    casier: string;
    cle: string;
    dateRemise: string;
    checklist: ElementChecklist[];
  };
  transport: {
    statut: StatutTransport;
    besoin: boolean;
    ville: string;
    zone: string;
    point: string;
    ligne: string;
    heureAller: string;
    heureRetour: string;
    transporteur: string;
    contact: string;
    communique: boolean;
    luWhatsApp: boolean;
  };
  preparation: ElementChecklist[];
  checkin: ElementChecklist[];
  consignes: string[];
  communications: CommunicationOnboarding[];
  accueilFinalise: boolean;
}

/* ---------------- Fabrique ---------------- */

export function documentDepuisModele(m: ModeleDocument, dateLimite: string): DocumentOnboarding {
  return {
    id: m.id,
    nom: m.nom,
    categorie: m.categorie,
    obligatoire: m.obligatoireParDefaut,
    dateLimite,
    format: m.format,
    copies: m.copies,
    originalRequis: m.originalRequis,
    commentaire: "",
    mode: m.modeParDefaut,
    statut: "Non demandé",
  };
}

export function documentsPreselectionnes(dateLimite: string): DocumentOnboarding[] {
  return CATALOGUE_DOCUMENTS.filter((d) => d.presetOperateur).map((d) => documentDepuisModele(d, dateLimite));
}

export function equipementsPourPoste(poste: string): EquipementOnboarding[] {
  const ids = EQUIPEMENTS_PAR_POSTE[poste] ?? ["EPI-GILET", "EPI-CHAUSSURES", "EPI-BADGE"];
  return CATALOGUE_EPI.filter((e) => ids.includes(e.id)).map((e) => ({
    id: e.id,
    nom: e.nom,
    requis: true,
    taille: "",
    quantite: 1,
    statut: "À préparer" as StatutEquipement,
  }));
}

export function checklistDepuis(labels: string[], faits: string[] = []): ElementChecklist[] {
  return labels.map((label, i) => ({ id: `CK-${i}-${label.slice(0, 6)}`, label, fait: faits.includes(label) }));
}

export function consignesPreselectionnees(): string[] {
  return CATALOGUE_CONSIGNES.filter((c) => c.presetOperateur).map((c) => c.id);
}

/* ---------------- Indicateurs ---------------- */

export function kpiDocuments(d: DossierOnboarding) {
  const actifs = d.documents.filter((x) => x.statut !== "Non applicable");
  const requis = actifs.length;
  const recus = actifs.filter((x) => ["Reçu", "À vérifier", "Validé"].includes(x.statut)).length;
  const valides = actifs.filter((x) => x.statut === "Validé").length;
  const manquants = requis - recus;
  const completion = requis === 0 ? 0 : Math.round(((recus + valides) / (requis * 2)) * 100);
  return { requis, recus, valides, manquants, completion };
}

export function documentsManquants(d: DossierOnboarding) {
  return d.documents.filter(
    (x) => x.statut !== "Non applicable" && !["Reçu", "À vérifier", "Validé"].includes(x.statut),
  );
}

export function progressionOnboarding(d: DossierOnboarding) {
  const doc = kpiDocuments(d);
  const prep = d.preparation.length ? d.preparation.filter((c) => c.fait).length / d.preparation.length : 0;
  const equip = d.equipements.length
    ? d.equipements.filter((e) => e.statut === "Disponible" || e.statut === "Remis").length / d.equipements.length
    : 1;
  const transport = d.transport.besoin
    ? ["Confirmé", "Communiqué au salarié"].includes(d.transport.statut)
      ? 1
      : d.transport.statut === "Trajet proposé"
        ? 0.5
        : 0
    : 1;
  const badge = ["Prêt", "Remis", "Activé"].includes(d.badge.statut) ? 1 : d.badge.statut === "Commandé" ? 0.5 : 0;
  return Math.round(((doc.completion / 100) * 0.35 + prep * 0.25 + equip * 0.2 + transport * 0.1 + badge * 0.1) * 100);
}

export function alertesOnboarding(d: DossierOnboarding): { niveau: "critical" | "warning"; texte: string }[] {
  const a: { niveau: "critical" | "warning"; texte: string }[] = [];
  const manquants = documentsManquants(d).filter((x) => x.obligatoire);
  if (manquants.length) a.push({ niveau: "critical", texte: `${manquants.length} document(s) obligatoire(s) manquant(s) à J-2` });
  if (d.transport.besoin && ["À définir", "Demandé"].includes(d.transport.statut))
    a.push({ niveau: "critical", texte: "Transport non défini à J-1" });
  if (!["Prêt", "Remis", "Activé"].includes(d.badge.statut)) a.push({ niveau: "warning", texte: "Badge non prêt à J-1" });
  if (d.equipements.some((e) => e.requis && e.statut === "À commander"))
    a.push({ niveau: "warning", texte: "EPI indisponible — commande en cours" });
  if (d.vestiaire.statut !== "Affecté") a.push({ niveau: "warning", texte: "Aucun casier affecté" });
  if (!d.preparation.find((c) => c.label === "Formation affectée")?.fait)
    a.push({ niveau: "warning", texte: "Formation initiale non planifiée" });
  if (!d.preparation.find((c) => c.label === "Visite médicale programmée")?.fait)
    a.push({ niveau: "warning", texte: "Visite médicale non planifiée" });
  return a;
}

export function blocagePrincipal(d: DossierOnboarding) {
  const al = alertesOnboarding(d);
  return al.length ? al[0].texte : "Aucun blocage";
}

/* ---------------- Génération du message ---------------- */

const MOIS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];

export function dateLongue(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const jours = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];
  return `${jours[d.getDay()]} ${d.getDate()} ${MOIS[d.getMonth()]} ${d.getFullYear()}`;
}

export function dateCourte(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()}`;
}

function libelleEquipements(d: DossierOnboarding) {
  const noms = d.equipements.filter((e) => e.requis).map((e) => e.nom.toLowerCase());
  return noms.length ? noms.join(", ") : "";
}

export function genererMessage(canal: "WhatsApp" | "Email", nom: string, d: DossierOnboarding): { objet: string; corps: string } {
  const prenom = nom.split(" ")[0];
  const docs = d.documents.filter((x) => x.statut !== "Non applicable");
  const listeDocs = docs.map((x) => `• ${x.nom}${x.copies > 1 ? ` (${x.copies} exemplaires)` : ""}`).join("\n");
  const consignes = d.consignes
    .map((id) => CATALOGUE_CONSIGNES.find((c) => c.id === id)?.texte)
    .filter(Boolean)
    .map((t) => `• ${t}`)
    .join("\n");
  const transportBloc =
    d.transport.besoin && d.transport.ligne
      ? `\nTransport :\nPoint de ramassage : ${d.transport.point}\nLigne : ${d.transport.ligne}\nHeure : ${d.transport.heureAller}\nMerci de vous présenter au point de ramassage 10 minutes avant l'heure prévue.\n`
      : "";
  const equip = libelleEquipements(d);
  const objet = "Confirmation de votre candidature et informations d'intégration";

  if (canal === "WhatsApp") {
    const corps = `Bonjour ${prenom},

Nous avons le plaisir de vous informer que votre candidature au poste de ${d.arrivee.poste} sur notre site de ${d.arrivee.site} a été retenue.

Votre intégration est prévue le ${dateLongue(d.arrivee.date)} à ${d.arrivee.heure.replace(":", "h")}.

📍 Lieu : ${d.arrivee.site}
📌 Point d'accueil : ${d.arrivee.pointAccueil}

Afin de préparer votre intégration, merci de nous fournir les documents suivants :
${listeDocs}

Merci d'apporter les documents demandés au plus tard lors de votre intégration, sauf ceux indiqués comme devant être transmis en amont.

Pour votre arrivée :
• ${d.badge.instruction || "Votre badge sera préparé par l'équipe d'accueil."}
${equip ? `• Votre tenue et vos équipements de protection (${equip}) vous seront remis sur site.\n` : ""}• Votre casier vous sera communiqué lors de votre intégration.
${transportBloc}${consignes ? `\nConsignes importantes :\n${consignes}\n` : ""}
Pour toute question, vous pouvez contacter le service RH (${d.arrivee.contactRH} — ${d.arrivee.telephoneRH}).

Cordialement,
Équipe Ressources Humaines`;
    return { objet, corps };
  }

  const corps = `Bonjour ${nom},

Nous avons le plaisir de vous confirmer que votre candidature au poste de ${d.arrivee.poste} a été retenue.

Votre intégration est prévue :
Date : ${dateLongue(d.arrivee.date)}
Heure : ${d.arrivee.heure.replace(":", "h")}
Site : ${d.arrivee.site}
Point d'accueil : ${d.arrivee.pointAccueil}
Département : ${d.arrivee.departement}

DOCUMENTS À FOURNIR
${docs.map((x) => `- ${x.nom} — ${x.obligatoire ? "obligatoire" : "facultatif"} — ${x.mode}${x.dateLimite ? ` — avant le ${dateCourte(x.dateLimite)}` : ""}`).join("\n")}

VOTRE ARRIVÉE
- ${d.badge.instruction || "Badge préparé par l'équipe d'accueil"}
${equip ? `- Équipements remis sur site : ${equip}\n` : ""}- Vestiaire et casier communiqués lors de l'intégration
${
    d.transport.besoin && d.transport.ligne
      ? `\nTRANSPORT\n- Ligne : ${d.transport.ligne}\n- Point de ramassage : ${d.transport.point}\n- Heure aller : ${d.transport.heureAller}\n- Heure retour : ${d.transport.heureRetour}\n- Merci de vous présenter 10 minutes avant l'heure prévue.\n`
      : ""
  }${consignes ? `\nCONSIGNES\n${consignes}\n` : ""}
Contact RH : ${d.arrivee.contactRH}
Téléphone : ${d.arrivee.telephoneRH}

Cordialement,
Équipe Ressources Humaines`;
  return { objet, corps };
}

export function messageRelanceDocuments(nom: string, d: DossierOnboarding) {
  const prenom = nom.split(" ")[0];
  const manquants = documentsManquants(d);
  return `Bonjour ${prenom},

Dans le cadre de votre intégration, certains documents restent à nous transmettre :
${manquants.map((m) => `• ${m.nom}`).join("\n")}

Merci de nous les transmettre avant le ${dateCourte(d.arrivee.date)}.

Cordialement,
Service RH`;
}
