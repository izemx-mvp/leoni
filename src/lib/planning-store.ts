import { useSyncExternalStore } from "react";
import {
  FORMATEURS,
  SALLES,
  SESSIONS_PLANNING,
  dureeMin,
  formatCourtNum,
  minutes,
  salleParId,
  type SessionPlanning,
  type StatutSession,
} from "@/data/planning";

/* ------------------------------ Store minimal ---------------------------- */

let etat: SessionPlanning[] = SESSIONS_PLANNING.map((s) => ({ ...s }));
const abonnes = new Set<() => void>();

function publier(next: SessionPlanning[]) {
  etat = next;
  abonnes.forEach((f) => f());
}

function abonner(f: () => void) {
  abonnes.add(f);
  return () => abonnes.delete(f);
}

export function useSessions() {
  return useSyncExternalStore(
    abonner,
    () => etat,
    () => etat,
  );
}

function horodatage() {
  return `${formatCourtNum(new Date().toISOString().slice(0, 10)).slice(0, 5)} — ${new Date()
    .toTimeString()
    .slice(0, 5)}`;
}

function tracer(s: SessionPlanning, action: string, detail?: string, auteur = "Nadia El Ghali"): SessionPlanning {
  return { ...s, journal: [...s.journal, { horodatage: horodatage(), action, detail, auteur }] };
}

function majSession(id: string, fn: (s: SessionPlanning) => SessionPlanning) {
  publier(etat.map((s) => (s.id === id ? fn(s) : s)));
}

/* --------------------------------- Actions -------------------------------- */

export const actionsPlanning = {
  deplacer(id: string, date: string, debut: string) {
    majSession(id, (s) => {
      const duree = dureeMin(s);
      const finMin = minutes(debut) + duree;
      const fin = `${String(Math.floor(finMin / 60)).padStart(2, "0")}:${String(finMin % 60).padStart(2, "0")}`;
      return tracer(
        { ...s, date, debut, fin },
        "Session déplacée",
        `${s.date} ${s.debut} → ${date} ${debut}`,
      );
    });
  },
  modifier(id: string, patch: Partial<SessionPlanning>, libelle = "Session modifiée") {
    majSession(id, (s) => tracer({ ...s, ...patch }, libelle));
  },
  changerStatut(id: string, statut: StatutSession) {
    majSession(id, (s) => tracer({ ...s, statut }, "Statut modifié", `${s.statut} → ${statut}`));
  },
  dupliquer(id: string) {
    const src = etat.find((s) => s.id === id);
    if (!src) return;
    const copie: SessionPlanning = {
      ...src,
      id: `SES-${Math.floor(Math.random() * 9000) + 9000}`,
      statut: "Brouillon",
      notifications: { envoyees: 0, lues: 0 },
      journal: [{ horodatage: horodatage(), action: "Session dupliquée", detail: src.id, auteur: "Nadia El Ghali" }],
    };
    publier([...etat, copie]);
    return copie.id;
  },
  supprimer(id: string) {
    publier(etat.filter((s) => s.id !== id));
  },
  creer(s: Omit<SessionPlanning, "id" | "journal">) {
    const nouvelle: SessionPlanning = {
      ...s,
      id: `SES-${Math.floor(Math.random() * 9000) + 9000}`,
      journal: [{ horodatage: horodatage(), action: "Session créée", auteur: "Nadia El Ghali" }],
    };
    publier([...etat, nouvelle]);
    return nouvelle.id;
  },
  retirerParticipant(id: string, workerId: string) {
    majSession(id, (s) =>
      tracer({ ...s, participants: s.participants.filter((p) => p.workerId !== workerId) }, "Participant retiré", workerId),
    );
  },
  notifier(id: string) {
    majSession(id, (s) =>
      tracer(
        { ...s, notifications: { envoyees: s.participants.length, lues: s.notifications.lues } },
        "Notifications envoyées",
        `${s.participants.length} participants`,
      ),
    );
  },
  reinitialiser() {
    publier(SESSIONS_PLANNING.map((s) => ({ ...s })));
  },
};

/* -------------------------------- Conflits -------------------------------- */

export interface Conflit {
  type: "Formateur" | "Salle" | "Groupe" | "Participant" | "Capacité" | "Indisponibilité";
  message: string;
}

const chevauche = (a: { debut: string; fin: string }, b: { debut: string; fin: string }) =>
  minutes(a.debut) < minutes(b.fin) && minutes(b.debut) < minutes(a.fin);

export function detecterConflits(
  cible: Pick<SessionPlanning, "date" | "debut" | "fin" | "formateurId" | "salleId" | "groupe" | "capacite" | "participants">,
  sessions: SessionPlanning[],
  ignorerId?: string,
): Conflit[] {
  const conflits: Conflit[] = [];
  const memeCreneau = sessions.filter(
    (s) => s.id !== ignorerId && s.date === cible.date && s.statut !== "Annulée" && chevauche(s, cible),
  );

  const f = memeCreneau.find((s) => s.formateurId === cible.formateurId);
  if (f) {
    const nom = FORMATEURS.find((x) => x.id === cible.formateurId)?.nom ?? "Le formateur";
    conflits.push({ type: "Formateur", message: `${nom} anime déjà ${f.groupe} de ${f.debut} à ${f.fin}.` });
  }

  const sa = memeCreneau.find((s) => s.salleId === cible.salleId);
  if (sa) conflits.push({ type: "Salle", message: `${salleParId(cible.salleId)?.nom ?? "La salle"} est déjà occupée (${sa.groupe}).` });

  const g = memeCreneau.find((s) => s.groupe === cible.groupe);
  if (g) conflits.push({ type: "Groupe", message: `${cible.groupe} participe déjà à une autre session (${g.moduleNom}).` });

  const ids = new Set(cible.participants.map((p) => p.workerId));
  const occupes = new Set<string>();
  memeCreneau.forEach((s) => s.participants.forEach((p) => ids.has(p.workerId) && occupes.add(p.workerId)));
  if (occupes.size > 0)
    conflits.push({ type: "Participant", message: `${occupes.size} participant(s) ont déjà une autre activité sur ce créneau.` });

  const salle = salleParId(cible.salleId);
  if (salle && cible.participants.length > salle.capacite)
    conflits.push({
      type: "Capacité",
      message: `${salle.nom} est limitée à ${salle.capacite} personnes (${cible.participants.length} inscrits).`,
    });

  const formateur = FORMATEURS.find((x) => x.id === cible.formateurId);
  if (formateur?.indisponibilites.some((i) => i.includes(formatCourtNum(cible.date).slice(0, 5))))
    conflits.push({ type: "Indisponibilité", message: `${formateur.nom} est déclaré(e) indisponible sur cette date.` });

  return conflits;
}

export function sessionsEnConflit(sessions: SessionPlanning[]): Set<string> {
  const ko = new Set<string>();
  const actives = sessions.filter((s) => s.statut !== "Annulée");
  for (let i = 0; i < actives.length; i++) {
    for (let j = i + 1; j < actives.length; j++) {
      const a = actives[i];
      const b = actives[j];
      if (a.date !== b.date || !chevauche(a, b)) continue;
      if (a.formateurId === b.formateurId || a.salleId === b.salleId || a.groupe === b.groupe) {
        ko.add(a.id);
        ko.add(b.id);
      }
    }
  }
  return ko;
}

/* ------------------------------ Charge formateur -------------------------- */

export interface ChargeFormateur {
  formateurId: string;
  heures: number;
  capacite: number;
  taux: number;
  sessions: number;
  participants: number;
  etat: "Disponible" | "Charge normale" | "Charge élevée" | "Complet" | "Surcharge";
  prochaine?: SessionPlanning;
}

export function calculerCharges(sessions: SessionPlanning[]): ChargeFormateur[] {
  return FORMATEURS.map((f) => {
    const siennes = sessions.filter((s) => s.formateurId === f.id && s.statut !== "Annulée");
    const heures = Math.round((siennes.reduce((a, s) => a + dureeMin(s), 0) / 60) * 10) / 10;
    const taux = Math.round((heures / f.capaciteHebdo) * 100);
    const etat: ChargeFormateur["etat"] =
      taux > 100 ? "Surcharge" : taux >= 90 ? "Complet" : taux >= 70 ? "Charge élevée" : taux >= 40 ? "Charge normale" : "Disponible";
    return {
      formateurId: f.id,
      heures,
      capacite: f.capaciteHebdo,
      taux,
      sessions: siennes.length,
      participants: siennes.reduce((a, s) => a + s.participants.length, 0),
      etat,
      prochaine: siennes.sort((a, b) => (a.date + a.debut).localeCompare(b.date + b.debut))[0],
    };
  });
}

export const SALLES_PLANNING = SALLES;
