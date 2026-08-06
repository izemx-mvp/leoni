// LEONI WORKFORCE JOURNEY — Données enrichies pour le module « Postes & campagnes ».
// Ce fichier complète src/data/postes-critiques.ts et src/data/leoni.ts sans les modifier.
// Toutes les données sont fictives mais cohérentes avec le référentiel des postes.

import type { Site } from "@/data/leoni";
import { POSTES_DETAIL, posteDe } from "@/data/postes-critiques";

/* ------------------------------------------------------------------ */
/* Besoins en effectifs                                                */
/* ------------------------------------------------------------------ */

export type PrioriteBesoin = "Critique" | "Élevée" | "Moyenne" | "Faible";
export type StatutBesoin = "Ouvert" | "En cours" | "Pourvu" | "En retard";

export interface BesoinDetail {
  code: string;
  posteCode: string;
  site: Site;
  atelier: string;
  volume: number;
  pourvus: number;
  echeance: string;
  priorite: PrioriteBesoin;
  campagneCode?: string;
  statut: StatutBesoin;
}

export const BESOINS_DETAIL: BesoinDetail[] = [
  {
    code: "BES-114",
    posteCode: "PST-CBL-01",
    site: "Bouskoura",
    atelier: "Câblage A",
    volume: 60,
    pourvus: 38,
    echeance: "30/09/2026",
    priorite: "Élevée",
    campagneCode: "CAM-2026-07",
    statut: "En cours",
  },
  {
    code: "BES-115",
    posteCode: "PST-CQ-01",
    site: "Bouskoura",
    atelier: "Contrôle final",
    volume: 20,
    pourvus: 11,
    echeance: "15/09/2026",
    priorite: "Critique",
    campagneCode: "CAM-2026-06",
    statut: "En cours",
  },
  {
    code: "BES-116",
    posteCode: "PST-CUT-01",
    site: "Aïn Sebaâ",
    atelier: "Coupe",
    volume: 25,
    pourvus: 9,
    echeance: "31/08/2026",
    priorite: "Critique",
    campagneCode: "CAM-2026-05",
    statut: "En retard",
  },
  {
    code: "BES-117",
    posteCode: "PST-ASM-01",
    site: "Bouznika",
    atelier: "Assemblage B",
    volume: 35,
    pourvus: 21,
    echeance: "31/10/2026",
    priorite: "Moyenne",
    campagneCode: "CAM-2026-08",
    statut: "En cours",
  },
  {
    code: "BES-118",
    posteCode: "PST-SEC-01",
    site: "Berrechid",
    atelier: "Bancs d'essai",
    volume: 12,
    pourvus: 3,
    echeance: "20/09/2026",
    priorite: "Critique",
    campagneCode: "CAM-2026-06",
    statut: "En retard",
  },
  {
    code: "BES-119",
    posteCode: "PST-TL-01",
    site: "Bouskoura",
    atelier: "Maintenance ligne",
    volume: 8,
    pourvus: 5,
    echeance: "10/10/2026",
    priorite: "Élevée",
    campagneCode: "CAM-2026-09",
    statut: "En cours",
  },
  {
    code: "BES-120",
    posteCode: "PST-LOG-01",
    site: "Berrechid",
    atelier: "Magasin",
    volume: 10,
    pourvus: 8,
    echeance: "05/09/2026",
    priorite: "Faible",
    statut: "Pourvu",
  },
  {
    code: "BES-121",
    posteCode: "PST-CBL-01",
    site: "Agadir",
    atelier: "Assemblage AG1",
    volume: 30,
    pourvus: 12,
    echeance: "15/11/2026",
    priorite: "Moyenne",
    campagneCode: "CAM-2026-05",
    statut: "Ouvert",
  },
];

export function posteDuBesoin(b: BesoinDetail) {
  return posteDe(b.posteCode) ?? POSTES_DETAIL.find((p) => p.code === b.posteCode);
}

export function couvertureBesoin(b: BesoinDetail): number {
  return b.volume ? Math.round((b.pourvus / b.volume) * 100) : 0;
}

/* ------------------------------------------------------------------ */
/* Campagnes de recrutement                                            */
/* ------------------------------------------------------------------ */

export type StatutCampagne = "Planifiée" | "En cours" | "Clôturée";

export interface CanalSourcing {
  nom: string;
  part: number; // % des candidatures reçues
  recus: number;
  retenus: number;
  coutMoyen: number; // MAD par candidature sourcée
}

export interface CampagneDetail {
  code: string;
  nom: string;
  site: Site;
  objectif: number;
  recus: number;
  preselectionnes: number;
  entretiens: number;
  retenus: number;
  integres: number;
  coutParRecrutement: number;
  canalPrincipal: string;
  canaux: CanalSourcing[];
  periodeDebut: string;
  periodeFin: string;
  statut: StatutCampagne;
  postesCodes: string[];
}

export const CAMPAGNES_DETAIL: CampagneDetail[] = [
  {
    code: "CAM-2026-07",
    nom: "Campagne câblage Bouskoura",
    site: "Bouskoura",
    objectif: 120,
    recus: 486,
    preselectionnes: 210,
    entretiens: 96,
    retenus: 38,
    integres: 31,
    coutParRecrutement: 1350,
    canalPrincipal: "Portail carrière",
    canaux: [
      { nom: "Portail carrière", part: 42, recus: 204, retenus: 18, coutMoyen: 220 },
      { nom: "Agences ANAPEC", part: 26, recus: 126, retenus: 9, coutMoyen: 310 },
      { nom: "Cooptation", part: 18, recus: 87, retenus: 7, coutMoyen: 150 },
      { nom: "Campagne locale", part: 14, recus: 69, retenus: 4, coutMoyen: 280 },
    ],
    periodeDebut: "01/07/2026",
    periodeFin: "30/09/2026",
    statut: "En cours",
    postesCodes: ["PST-CBL-01"],
  },
  {
    code: "CAM-2026-06",
    nom: "Campagne qualité Berrechid",
    site: "Berrechid",
    objectif: 40,
    recus: 214,
    preselectionnes: 88,
    entretiens: 47,
    retenus: 17,
    integres: 14,
    coutParRecrutement: 2100,
    canalPrincipal: "Cooptation",
    canaux: [
      { nom: "Cooptation", part: 36, recus: 77, retenus: 8, coutMoyen: 180 },
      { nom: "Portail carrière", part: 30, recus: 64, retenus: 5, coutMoyen: 230 },
      { nom: "Écoles techniques (OFPPT)", part: 22, recus: 47, retenus: 3, coutMoyen: 420 },
      { nom: "Agences ANAPEC", part: 12, recus: 26, retenus: 1, coutMoyen: 350 },
    ],
    periodeDebut: "15/06/2026",
    periodeFin: "20/09/2026",
    statut: "En cours",
    postesCodes: ["PST-CQ-01", "PST-SEC-01"],
  },
  {
    code: "CAM-2026-05",
    nom: "Campagne locale Agadir",
    site: "Agadir",
    objectif: 60,
    recus: 168,
    preselectionnes: 72,
    entretiens: 40,
    retenus: 21,
    integres: 19,
    coutParRecrutement: 980,
    canalPrincipal: "Campagne locale",
    canaux: [
      { nom: "Campagne locale", part: 48, recus: 81, retenus: 12, coutMoyen: 160 },
      { nom: "Portail carrière", part: 27, recus: 45, retenus: 6, coutMoyen: 210 },
      { nom: "Agence locale", part: 25, recus: 42, retenus: 3, coutMoyen: 240 },
    ],
    periodeDebut: "01/05/2026",
    periodeFin: "15/08/2026",
    statut: "Clôturée",
    postesCodes: ["PST-CBL-01", "PST-CUT-01"],
  },
  {
    code: "CAM-2026-08",
    nom: "Campagne assemblage Bouznika",
    site: "Bouznika",
    objectif: 45,
    recus: 197,
    preselectionnes: 84,
    entretiens: 39,
    retenus: 21,
    integres: 16,
    coutParRecrutement: 1180,
    canalPrincipal: "Portail carrière",
    canaux: [
      { nom: "Portail carrière", part: 40, recus: 79, retenus: 9, coutMoyen: 225 },
      { nom: "Agences ANAPEC", part: 33, recus: 65, retenus: 7, coutMoyen: 300 },
      { nom: "Cooptation", part: 27, recus: 53, retenus: 5, coutMoyen: 160 },
    ],
    periodeDebut: "10/07/2026",
    periodeFin: "31/10/2026",
    statut: "En cours",
    postesCodes: ["PST-ASM-01"],
  },
  {
    code: "CAM-2026-09",
    nom: "Campagne maintenance Bouskoura",
    site: "Bouskoura",
    objectif: 15,
    recus: 58,
    preselectionnes: 26,
    entretiens: 14,
    retenus: 5,
    integres: 4,
    coutParRecrutement: 2650,
    canalPrincipal: "Écoles techniques (OFPPT)",
    canaux: [
      { nom: "Écoles techniques (OFPPT)", part: 45, recus: 26, retenus: 3, coutMoyen: 480 },
      { nom: "Portail carrière", part: 31, recus: 18, retenus: 1, coutMoyen: 240 },
      { nom: "Cooptation", part: 24, recus: 14, retenus: 1, coutMoyen: 180 },
    ],
    periodeDebut: "01/08/2026",
    periodeFin: "10/10/2026",
    statut: "En cours",
    postesCodes: ["PST-TL-01"],
  },
];

export function tauxCouvertureCampagne(c: CampagneDetail): number {
  return c.objectif ? Math.round((c.retenus / c.objectif) * 100) : 0;
}

/* ------------------------------------------------------------------ */
/* Séries mensuelles — besoins vs pourvus                              */
/* ------------------------------------------------------------------ */

export interface PointMensuel {
  mois: string;
  besoinsOuverts: number;
  pourvus: number;
}

export const SERIE_BESOINS_MENSUELLE: PointMensuel[] = [
  { mois: "Mars", besoinsOuverts: 148, pourvus: 96 },
  { mois: "Avril", besoinsOuverts: 162, pourvus: 108 },
  { mois: "Mai", besoinsOuverts: 175, pourvus: 121 },
  { mois: "Juin", besoinsOuverts: 190, pourvus: 134 },
  { mois: "Juillet", besoinsOuverts: 204, pourvus: 147 },
  { mois: "Août", besoinsOuverts: 200, pourvus: 154 },
];

/* ------------------------------------------------------------------ */
/* Canaux de sourcing — synthèse globale                               */
/* ------------------------------------------------------------------ */

export interface CanalGlobal {
  nom: string;
  recus: number;
  retenus: number;
  coutMoyen: number;
}

export const CANAUX_GLOBAUX: CanalGlobal[] = (() => {
  const map = new Map<string, CanalGlobal>();
  for (const c of CAMPAGNES_DETAIL) {
    for (const canal of c.canaux) {
      const existant = map.get(canal.nom);
      if (existant) {
        existant.recus += canal.recus;
        existant.retenus += canal.retenus;
        existant.coutMoyen = Math.round((existant.coutMoyen + canal.coutMoyen) / 2);
      } else {
        map.set(canal.nom, { nom: canal.nom, recus: canal.recus, retenus: canal.retenus, coutMoyen: canal.coutMoyen });
      }
    }
  }
  return Array.from(map.values()).sort((a, b) => b.recus - a.recus);
})();

export function efficaciteCanal(c: CanalGlobal): number {
  return c.recus ? Math.round((c.retenus / c.recus) * 100) : 0;
}
