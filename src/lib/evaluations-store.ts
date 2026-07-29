import { useCallback, useSyncExternalStore } from "react";
import {
  AUDIT_INITIAL,
  BIBLIOTHEQUE,
  EVALUATIONS_INITIALES,
  RATTRAPAGES_INITIAUX,
  type EntreeAudit,
  type Evaluation,
  type Participant,
  type Question,
  type Rattrapage,
  type StatutEvaluation,
} from "@/data/evaluations";

/* ------------------------------------------------------------------ */
/* Store global (Single Source of Truth) — sans provider               */
/* ------------------------------------------------------------------ */

interface State {
  evaluations: Evaluation[];
  bibliotheque: Question[];
  rattrapages: Rattrapage[];
  audit: EntreeAudit[];
}

let state: State = {
  evaluations: EVALUATIONS_INITIALES,
  bibliotheque: BIBLIOTHEQUE,
  rattrapages: RATTRAPAGES_INITIAUX,
  audit: AUDIT_INITIAL,
};

const listeners = new Set<() => void>();
function emit() {
  listeners.forEach((l) => l());
}
function set(patch: Partial<State>) {
  state = { ...state, ...patch };
  emit();
}
function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}
function snapshot() {
  return state;
}

function maintenant() {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

function journaliser(evaluationId: string, action: string, detail: string, utilisateur = "Salma Bennis") {
  const entree: EntreeAudit = {
    id: `AUD-${Date.now()}`,
    date: maintenant(),
    utilisateur,
    evaluationId,
    action,
    detail,
  };
  set({ audit: [entree, ...state.audit] });
}

function majEval(evaluationId: string, patch: Partial<Evaluation>) {
  set({
    evaluations: state.evaluations.map((e) => (e.evaluationId === evaluationId ? { ...e, ...patch } : e)),
  });
}

/* ------------------------------ Dérivations ----------------------------- */

export function statsEvaluation(e: Evaluation) {
  const p = e.participants;
  const affectes = p.length;
  const commences = p.filter((x) => x.statut !== "Non commencé" && x.statut !== "Absent").length;
  const termines = p.filter((x) => x.statut === "Terminé").length;
  const absents = p.filter((x) => x.statut === "Absent").length;
  const nonTermines = p.filter((x) => x.statut === "En cours" || x.statut === "Expiré").length;
  const finis = p.filter((x) => x.score !== null);
  const reussis = finis.filter((x) => (x.score ?? 0) >= e.seuil).length;
  const echoues = finis.length - reussis;
  const scoreMoyen = finis.length ? Math.round(finis.reduce((s, x) => s + (x.score ?? 0), 0) / finis.length) : 0;
  const tempsMoyen = (() => {
    const durees = p.map((x) => parseInt(x.duree, 10)).filter((n) => !Number.isNaN(n));
    return durees.length ? `${Math.round(durees.reduce((a, b) => a + b, 0) / durees.length)} min` : "—";
  })();
  return { affectes, commences, termines, absents, nonTermines, reussis, echoues, scoreMoyen, tempsMoyen };
}

export function analyseQuestions(e: Evaluation) {
  return e.questions.map((q, i) => {
    const rep = e.participants.flatMap((p) => p.reponses).filter((r) => r.questionId === q.questionId);
    const nb = rep.length;
    const bonnes = rep.filter((r) => r.correcte).length;
    const taux = nb ? Math.round((bonnes / nb) * 100) : (q.tauxReussite ?? 0);
    return {
      ...q,
      rang: `Q${i + 1}`,
      nbReponses: nb,
      bonnes: nb ? bonnes : 0,
      mauvaises: nb ? nb - bonnes : 0,
      taux,
    };
  });
}

export function tonTaux(taux: number) {
  return taux >= 80 ? "success" : taux >= 60 ? "warning" : ("critical" as const);
}

export interface LigneResultat {
  resultId: string;
  date: string;
  evaluationId: string;
  code: string;
  evaluation: string;
  type: string;
  formation: string;
  site: string;
  groupe: string;
  workerId: string;
  ouvrier: string;
  tentative: string;
  score: number;
  seuil: number;
  resultat: "Réussi" | "Échoué";
  duree: string;
}

export function toutesLignesResultats(evaluations: Evaluation[]): LigneResultat[] {
  return evaluations.flatMap((e) =>
    e.participants
      .filter((p) => p.score !== null)
      .map<LigneResultat>((p) => ({
        resultId: p.resultId,
        date: e.datePassage,
        evaluationId: e.evaluationId,
        code: e.code,
        evaluation: e.titre,
        type: e.type,
        formation: e.formation,
        site: p.site,
        groupe: p.groupe,
        workerId: p.workerId,
        ouvrier: p.ouvrier,
        tentative: `${p.tentative}/${e.tentatives}`,
        score: p.score as number,
        seuil: e.seuil,
        resultat: (p.score as number) >= e.seuil ? "Réussi" : "Échoué",
        duree: p.duree || "—",
      })),
  );
}

/** Résultats d'un ouvrier — utilisé par la Fiche Ouvrier 360°. */
export function resultatsOuvrier(workerId: string): LigneResultat[] {
  return toutesLignesResultats(state.evaluations).filter((l) => l.workerId === workerId);
}

/** Matrice de compétences alimentée par les évaluations. */
export function competencesDepuisEvaluations(workerId: string) {
  const parCompetence = new Map<string, { scores: number[]; seuils: number[] }>();
  state.evaluations.forEach((e) => {
    e.participants
      .filter((p) => p.workerId === workerId && p.score !== null)
      .forEach((p) => {
        const c = parCompetence.get(e.competence) ?? { scores: [], seuils: [] };
        c.scores.push(p.score as number);
        c.seuils.push(e.seuil);
        parCompetence.set(e.competence, c);
      });
  });
  return [...parCompetence.entries()].map(([competence, v]) => {
    const moyenne = Math.round(v.scores.reduce((a, b) => a + b, 0) / v.scores.length);
    const seuil = Math.max(...v.seuils);
    const niveau =
      moyenne >= 90 ? "Maîtrisée" : moyenne >= seuil ? "Acquise" : moyenne >= seuil - 15 ? "En acquisition" : "Non évaluée";
    return { competence, moyenne, seuil, niveau, evaluations: v.scores.length };
  });
}

/* -------------------------------- Actions ------------------------------- */

export const actionsEvaluations = {
  creer(payload: Omit<Evaluation, "evaluationId">) {
    const evaluationId = `EVA-${String(state.evaluations.length + 1).padStart(3, "0")}-${Date.now().toString().slice(-4)}`;
    const evaluation: Evaluation = { ...payload, evaluationId };
    set({ evaluations: [evaluation, ...state.evaluations] });
    journaliser(evaluationId, "Création", `Création de ${payload.code} — ${payload.titre}`);
    return evaluation;
  },
  maj(id: string, patch: Partial<Evaluation>, detail = "Modification de l'évaluation") {
    majEval(id, patch);
    journaliser(id, "Modification", detail);
  },
  changerStatut(id: string, statut: StatutEvaluation) {
    majEval(id, { statut });
    journaliser(id, statut === "Archivé" ? "Archivage" : "Modification", `Statut → ${statut}`);
  },
  publier(id: string) {
    const e = state.evaluations.find((x) => x.evaluationId === id);
    if (!e) return;
    majEval(id, {
      statut: "Ouvert",
      participants: e.participants.map((p) => ({ ...p, notification: "Envoyé" as const })),
    });
    journaliser(id, "Publication", `Publication de ${e.code} — diffusion à ${e.participants.length} participant(s)`);
    journaliser(id, "Affectation", `Génération de ${e.participants.length} affectation(s) (${e.canaux.join(", ")})`);
  },
  programmer(id: string) {
    const e = state.evaluations.find((x) => x.evaluationId === id);
    if (!e) return;
    majEval(id, { statut: "Programmé" });
    journaliser(id, "Modification", `Évaluation programmée pour le ${e.datePassage}`);
  },
  dupliquer(id: string) {
    const e = state.evaluations.find((x) => x.evaluationId === id);
    if (!e) return;
    const copie: Evaluation = {
      ...e,
      evaluationId: `EVA-COPY-${Date.now().toString().slice(-5)}`,
      code: `${e.code}-COPIE`,
      titre: `${e.titre} (copie)`,
      statut: "Brouillon",
      participants: [],
      dateCreation: maintenant().slice(0, 10),
    };
    set({ evaluations: [copie, ...state.evaluations] });
    journaliser(copie.evaluationId, "Création", `Duplication de ${e.code}`);
    return copie;
  },
  supprimer(id: string) {
    const e = state.evaluations.find((x) => x.evaluationId === id);
    set({ evaluations: state.evaluations.filter((x) => x.evaluationId !== id) });
    if (e) journaliser(id, "Suppression", `Suppression de ${e.code}`);
  },
  ajouterQuestions(id: string, questions: Question[]) {
    const e = state.evaluations.find((x) => x.evaluationId === id);
    if (!e) return;
    const nouvelles = [...e.questions, ...questions].map((q, i) => ({ ...q, numero: i + 1 }));
    majEval(id, { questions: nouvelles });
    journaliser(id, "Modification", `Ajout de ${questions.length} question(s)`);
  },
  supprimerQuestion(id: string, questionId: string) {
    const e = state.evaluations.find((x) => x.evaluationId === id);
    if (!e) return;
    majEval(id, {
      questions: e.questions.filter((q) => q.questionId !== questionId).map((q, i) => ({ ...q, numero: i + 1 })),
    });
    journaliser(id, "Modification", `Suppression de la question ${questionId}`);
  },
  deplacerQuestion(id: string, index: number, direction: -1 | 1) {
    const e = state.evaluations.find((x) => x.evaluationId === id);
    if (!e) return;
    const cible = index + direction;
    if (cible < 0 || cible >= e.questions.length) return;
    const arr = [...e.questions];
    [arr[index], arr[cible]] = [arr[cible], arr[index]];
    majEval(id, { questions: arr.map((q, i) => ({ ...q, numero: i + 1 })) });
  },
  affecter(id: string, participants: Participant[]) {
    majEval(id, { participants });
    journaliser(id, "Affectation", `${participants.length} participant(s) affecté(s)`);
  },
  creerQuestion(q: Question) {
    set({ bibliotheque: [q, ...state.bibliotheque] });
  },
  majQuestion(questionId: string, patch: Partial<Question>) {
    set({ bibliotheque: state.bibliotheque.map((q) => (q.questionId === questionId ? { ...q, ...patch } : q)) });
  },
  dupliquerQuestion(questionId: string) {
    const q = state.bibliotheque.find((x) => x.questionId === questionId);
    if (!q) return;
    set({
      bibliotheque: [{ ...q, questionId: `${q.questionId}-C${Date.now().toString().slice(-3)}`, utilisations: 0 }, ...state.bibliotheque],
    });
  },
  archiverQuestion(questionId: string) {
    set({ bibliotheque: state.bibliotheque.map((q) => (q.questionId === questionId ? { ...q, archivee: !q.archivee } : q)) });
  },
  programmerRattrapages(
    ids: string[],
    form: { date: string; heure: string; lieu: string; formateur: string },
  ) {
    set({
      rattrapages: state.rattrapages.map((r) =>
        ids.includes(r.id) ? { ...r, statut: "Programmé" as const, ...form } : r,
      ),
    });
    state.rattrapages
      .filter((r) => ids.includes(r.id))
      .forEach((r) =>
        journaliser(r.evaluationId, "Rattrapage", `${r.ouvrier} — rattrapage programmé le ${form.date} à ${form.heure} (${form.lieu})`),
      );
  },
  creerRattrapage(r: Omit<Rattrapage, "id">) {
    const id = `RAT-${Date.now().toString().slice(-5)}`;
    set({ rattrapages: [{ ...r, id }, ...state.rattrapages] });
    journaliser(r.evaluationId, "Rattrapage", `Besoin de rattrapage créé pour ${r.ouvrier}`);
  },
  relancer(id: string) {
    const e = state.evaluations.find((x) => x.evaluationId === id);
    if (!e) return;
    journaliser(id, "Affectation", `Rappel envoyé aux participants n'ayant pas terminé (${e.canaux.join(", ")})`);
  },
  prolonger(id: string, nouvelleFermeture: string) {
    majEval(id, { fermeture: nouvelleFermeture });
    journaliser(id, "Modification", `Délai prolongé jusqu'au ${nouvelleFermeture}`);
  },
  cloturer(id: string) {
    const e = state.evaluations.find((x) => x.evaluationId === id);
    if (!e) return;
    majEval(id, {
      statut: "Terminé",
      participants: e.participants.map((p) =>
        p.statut === "En cours" || p.statut === "Non commencé" ? { ...p, statut: "Expiré" as const } : p,
      ),
    });
    journaliser(id, "Modification", `Session clôturée — ${e.code}`);
  },
  journaliser,
};

/* --------------------------------- Hook --------------------------------- */

export function useEvaluations() {
  const s = useSyncExternalStore(subscribe, snapshot, snapshot);
  const getEvaluation = useCallback(
    (id: string) => s.evaluations.find((e) => e.evaluationId === id || e.code === id),
    [s.evaluations],
  );
  return { ...s, ...actionsEvaluations, getEvaluation };
}
