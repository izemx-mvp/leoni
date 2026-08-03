import { useSyncExternalStore } from "react";
import {
  ACTIONS_CORRECTIVES,
  ALERTES_FORMATION,
  FEEDBACKS_FORMATION,
  INCIDENTS,
  SUIVIS_INITIAUX,
  type ActionCorrective,
  type AlerteFormation,
  type FeedbackFormation,
  type Incident,
  type StatutAction,
  type SuiviJour,
} from "@/data/formation-suivi";
import { FORMATEURS, formateurParId, type SessionPlanning } from "@/data/planning";

/* --------------------------------- Store ---------------------------------- */

interface EtatFormation {
  suivis: SuiviJour[];
  actions: ActionCorrective[];
  incidents: Incident[];
  feedbacks: FeedbackFormation[];
  alertes: AlerteFormation[];
}

let etat: EtatFormation = {
  suivis: SUIVIS_INITIAUX.map((s) => ({ ...s })),
  actions: ACTIONS_CORRECTIVES.map((a) => ({ ...a })),
  incidents: INCIDENTS.map((i) => ({ ...i })),
  feedbacks: FEEDBACKS_FORMATION.map((f) => ({ ...f })),
  alertes: ALERTES_FORMATION.map((a) => ({ ...a })),
};

const abonnes = new Set<() => void>();
const publier = (next: EtatFormation) => {
  etat = next;
  abonnes.forEach((f) => f());
};
const abonner = (f: () => void) => {
  abonnes.add(f);
  return () => abonnes.delete(f);
};

export function useFormation() {
  return useSyncExternalStore(
    abonner,
    () => etat,
    () => etat,
  );
}

const id = (prefixe: string) => `${prefixe}-${Math.floor(Math.random() * 900) + 100}`;

export const actionsFormation = {
  enregistrerSuivi(suivi: Omit<SuiviJour, "id">) {
    const existant = etat.suivis.find((s) => s.date === suivi.date && s.groupe === suivi.groupe);
    if (existant) {
      publier({
        ...etat,
        suivis: etat.suivis.map((s) => (s.id === existant.id ? { ...existant, ...suivi } : s)),
      });
      return existant.id;
    }
    const nouveau: SuiviJour = { ...suivi, id: id("SUI-2026") };
    publier({ ...etat, suivis: [nouveau, ...etat.suivis] });
    return nouveau.id;
  },
  creerAction(a: Omit<ActionCorrective, "id">) {
    publier({ ...etat, actions: [{ ...a, id: id("AC-2026") }, ...etat.actions] });
  },
  changerStatutAction(idAction: string, statut: StatutAction) {
    publier({
      ...etat,
      actions: etat.actions.map((a) => (a.id === idAction ? { ...a, statut } : a)),
    });
  },
  changerStatutAlerte(idAlerte: string, statut: AlerteFormation["statut"]) {
    publier({
      ...etat,
      alertes: etat.alertes.map((a) => (a.id === idAlerte ? { ...a, statut } : a)),
    });
  },
  changerStatutIncident(idIncident: string, statut: Incident["statut"]) {
    publier({
      ...etat,
      incidents: etat.incidents.map((i) => (i.id === idIncident ? { ...i, statut } : i)),
    });
  },
  traiterFeedback(idFeedback: string) {
    const fb = etat.feedbacks.find((f) => f.id === idFeedback);
    if (!fb) return;
    const alertes =
      fb.sentiment === "Critique"
        ? [
            {
              id: id("ALF-2026"),
              date: fb.date,
              ouvrier: fb.ouvrier,
              ouvrierId: fb.ouvrierId,
              groupe: fb.groupe,
              type: "Incident" as const,
              origine: `Feedback ${fb.id} — ${fb.categorie}`,
              priorite: "Moyenne" as const,
              responsable: "Amina Rajouh",
              statut: "Ouverte" as const,
              action: "Traitement du feedback critique",
            },
            ...etat.alertes,
          ]
        : etat.alertes;
    publier({
      ...etat,
      feedbacks: etat.feedbacks.map((f) => (f.id === idFeedback ? { ...f, traite: true } : f)),
      alertes,
    });
  },
  creerIncident(i: Omit<Incident, "id">) {
    publier({ ...etat, incidents: [{ ...i, id: id("INC-2026") }, ...etat.incidents] });
  },
};

/* ------------------------- Dérivations : groupes ---------------------------- */

export interface GroupeDetail {
  code: string;
  formationCode: string;
  formation: string;
  site: string;
  formateur: string;
  formateurId: string;
  debut: string;
  fin: string;
  sessions: SessionPlanning[];
  participants: { workerId: string; nom: string; poste: string }[];
  capacite: number;
  progression: number;
  statut: string;
}

const STATUTS_TERMINES = ["Terminée", "Annulée"];

export function groupesDepuisSessions(sessions: SessionPlanning[]): GroupeDetail[] {
  const map = new Map<string, SessionPlanning[]>();
  sessions.forEach((s) => {
    map.set(s.groupe, [...(map.get(s.groupe) ?? []), s]);
  });
  return [...map.entries()]
    .map(([code, liste]) => {
      const triees = [...liste].sort((a, b) => a.date.localeCompare(b.date));
      const principale = triees[0];
      const terminees = triees.filter((s) => s.statut === "Terminée").length;
      const participants = new Map<string, { workerId: string; nom: string; poste: string }>();
      triees.forEach((s) => s.participants.forEach((p) => participants.set(p.workerId, p)));
      const enCours = triees.some((s) => !STATUTS_TERMINES.includes(s.statut));
      return {
        code,
        formationCode: principale.formationCode,
        formation: principale.formationNom,
        site: principale.site,
        formateur: formateurParId(principale.formateurId)?.nom ?? "—",
        formateurId: principale.formateurId,
        debut: triees[0].date,
        fin: triees[triees.length - 1].date,
        sessions: triees,
        participants: [...participants.values()],
        capacite: Math.max(...triees.map((s) => s.capacite)),
        progression: Math.round((terminees / triees.length) * 100),
        statut: enCours ? (terminees > 0 ? "En cours" : "À venir") : "Clôturé",
      };
    })
    .sort((a, b) => a.code.localeCompare(b.code));
}

/* ------------------------- Dérivations : sessions --------------------------- */

export function progressionSession(s: SessionPlanning) {
  if (s.statut === "Terminée") return 100;
  if (s.statut === "Brouillon" || s.statut === "Annulée") return 0;
  const total = Math.max(1, s.participants.length);
  return Math.min(96, Math.round(((s.presencesSaisies + s.evaluationsSaisies) / (total * 2)) * 100));
}

export function chargeFormateurNom(nom: string) {
  return FORMATEURS.find((f) => f.nom === nom);
}
