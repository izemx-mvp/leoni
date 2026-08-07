import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type Context,
  type ReactNode,
} from "react";
import {
  RECLAMATIONS_V2,
  UTILISATEUR_COURANT,
  equipePourCategorie,
  type ActionRec,
  type EquipeRec,
  type PrioriteRec,
  type Rec,
  type SatisfactionRec,
  type StatutActionRec,
  type StatutRec,
} from "@/data/reclamations-v2";

function horodatage() {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return {
    date: `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()}`,
    heure: `${p(d.getHours())}:${p(d.getMinutes())}`,
  };
}

let compteur = 96;

export interface FinalisationRec {
  type: string;
  action: string;
  message: string;
  noteInterne?: string;
  demanderSatisfaction: boolean;
}

interface RecCtx {
  reclamations: Rec[];
  prendreEnCharge: (id: string, responsable?: string) => void;
  assigner: (id: string, responsable: string, equipe?: EquipeRec) => void;
  changerPriorite: (id: string, priorite: PrioriteRec) => void;
  envoyerMessage: (id: string, texte: string, interne: boolean) => void;
  ajouterAction: (id: string, action: Omit<ActionRec, "id">) => void;
  changerStatutAction: (id: string, actionId: string, statut: StatutActionRec) => void;
  traiter: (id: string, f: FinalisationRec) => void;
  remettreEnTraitement: (id: string, motif: string) => void;
  enregistrerSatisfaction: (id: string, s: Omit<SatisfactionRec, "date">) => void;
  marquerLu: (id: string) => void;
  creer: (r: { categorie: string; sousCategorie: string; objet: string; description: string; ouvrier?: string; matricule?: string; site?: string; poste?: string; priorite?: PrioriteRec }) => string;
}

const ref = globalThis as unknown as { __recCtx?: Context<RecCtx | null> };
const RecContext: Context<RecCtx | null> = ref.__recCtx ?? (ref.__recCtx = createContext<RecCtx | null>(null));

export function ReclamationsProvider({ children }: { children: ReactNode }) {
  const [reclamations, setRec] = useState<Rec[]>(RECLAMATIONS_V2);

  const patch = useCallback((id: string, fn: (r: Rec) => Rec) => {
    setRec((prev) => prev.map((r) => (r.id === id ? fn(r) : r)));
  }, []);

  const journal = (r: Rec, texte: string, auteur = UTILISATEUR_COURANT): Rec => {
    const { date, heure } = horodatage();
    return { ...r, historique: [...r.historique, { id: `EV-${Date.now()}-${Math.random()}`, date, heure, auteur, texte }] };
  };

  const messageSysteme = (r: Rec, texte: string): Rec => {
    const { date, heure } = horodatage();
    return { ...r, messages: [...r.messages, { id: `MS-${Date.now()}-${Math.random()}`, auteur: "Système", role: "system", date, heure, texte }] };
  };

  const prendreEnCharge = useCallback(
    (id: string, responsable = UTILISATEUR_COURANT) => {
      patch(id, (r) => {
        let n: Rec = { ...r, assigneA: responsable, nonLu: false };
        if (r.statut === "new") {
          n = { ...n, statut: "in_progress" };
          n = messageSysteme(n, "Statut changé : Nouveau → En cours de traitement");
        }
        return journal(n, `Prise en charge par ${responsable}`);
      });
    },
    [patch],
  );

  const assigner = useCallback(
    (id: string, responsable: string, equipe?: EquipeRec) => {
      patch(id, (r) => {
        let n: Rec = { ...r, assigneA: responsable, equipe: equipe ?? r.equipe };
        if (r.statut === "new") {
          n = { ...n, statut: "in_progress" };
          n = messageSysteme(n, "Statut changé : Nouveau → En cours de traitement");
        }
        return journal(n, `Assignée à ${responsable} — équipe ${equipe ?? r.equipe}`);
      });
    },
    [patch],
  );

  const changerPriorite = useCallback(
    (id: string, priorite: PrioriteRec) => patch(id, (r) => journal({ ...r, priorite }, `Priorité modifiée → ${priorite}`)),
    [patch],
  );

  const envoyerMessage = useCallback(
    (id: string, texte: string, interne: boolean) => {
      const { date, heure } = horodatage();
      patch(id, (r) => ({
        ...r,
        messages: [...r.messages, { id: `M-${Date.now()}`, auteur: UTILISATEUR_COURANT, role: "responsable", date, heure, texte, interne }],
      }));
    },
    [patch],
  );

  const ajouterAction = useCallback(
    (id: string, action: Omit<ActionRec, "id">) =>
      patch(id, (r) => journal({ ...r, actions: [...r.actions, { ...action, id: `A-${Date.now()}` }] }, `Action ajoutée : ${action.titre}`)),
    [patch],
  );

  const changerStatutAction = useCallback(
    (id: string, actionId: string, statut: StatutActionRec) =>
      patch(id, (r) => ({ ...r, actions: r.actions.map((a) => (a.id === actionId ? { ...a, statut } : a)) })),
    [patch],
  );

  const traiter = useCallback(
    (id: string, f: FinalisationRec) => {
      const { date, heure } = horodatage();
      patch(id, (r) => {
        let n: Rec = {
          ...r,
          statut: "resolved",
          messages: [...r.messages, { id: `M-${Date.now()}`, auteur: UTILISATEUR_COURANT, role: "responsable", date, heure, texte: f.message }],
          resolution: { type: f.type, action: f.action, traitePar: r.assigneA ?? UTILISATEUR_COURANT, date, heure, duree: `${Math.max(1, Math.floor(r.minutes / 60))}h${String(r.minutes % 60).padStart(2, "0")}` },
        };
        if (f.noteInterne?.trim()) {
          n = { ...n, messages: [...n.messages, { id: `MI-${Date.now()}`, auteur: UTILISATEUR_COURANT, role: "responsable", date, heure, texte: f.noteInterne, interne: true }] };
        }
        n = messageSysteme(n, "Statut changé : En cours de traitement → Traité");
        n = journal(n, `Réclamation traitée — ${f.type}`);
        if (f.demanderSatisfaction) n = journal(n, "Demande de satisfaction envoyée à l'ouvrier");
        return n;
      });
    },
    [patch],
  );

  const remettreEnTraitement = useCallback(
    (id: string, motif: string) => {
      patch(id, (r) => {
        let n: Rec = { ...r, statut: "in_progress" };
        n = messageSysteme(n, "Statut changé : Traité → En cours de traitement");
        return journal(n, `Réclamation remise en traitement suite au retour de l'ouvrier. ${motif}`.trim());
      });
    },
    [patch],
  );

  const enregistrerSatisfaction = useCallback(
    (id: string, s: Omit<SatisfactionRec, "date">) => {
      const { date } = horodatage();
      patch(id, (r) => journal({ ...r, satisfaction: { ...s, date } }, `Satisfaction enregistrée : ${s.note} / 5 — résolution ${s.resolution}`));
    },
    [patch],
  );

  const marquerLu = useCallback((id: string) => patch(id, (r) => (r.nonLu ? { ...r, nonLu: false } : r)), [patch]);

  const creer = useCallback<RecCtx["creer"]>((r) => {
    const { date, heure } = horodatage();
    const id = `REC-2026-${++compteur}`;
    const nouvelle: Rec = {
      id,
      objet: r.objet,
      description: r.description,
      ouvrier: r.ouvrier ?? "Sara Amrani",
      matricule: r.matricule ?? "LMA-BOU-2026-0418",
      poste: r.poste ?? "Opératrice câblage",
      site: r.site ?? "Bouskoura",
      categorie: r.categorie,
      sousCategorie: r.sousCategorie,
      priorite: r.priorite ?? "Normale",
      source: "Espace Ouvrier",
      statut: "new",
      creeLe: date,
      creeA: heure,
      minutes: 1,
      equipe: equipePourCategorie(r.categorie),
      slaPriseEnCharge: `${date} +2 h`,
      slaResolution: `${date} +24 h`,
      slaStatut: "ok",
      nonLu: true,
      messages: [{ id: `M-${Date.now()}`, auteur: r.ouvrier ?? "Sara Amrani", role: "ouvrier", date, heure, texte: r.description }],
      actions: [],
      historique: [{ id: `H-${Date.now()}`, date, heure, auteur: r.ouvrier ?? "Sara Amrani", texte: "Réclamation créée depuis l'Espace Ouvrier" }],
      piecesJointes: [],
    };
    setRec((prev) => [nouvelle, ...prev]);
    return id;
  }, []);

  const valeur = useMemo<RecCtx>(
    () => ({
      reclamations,
      prendreEnCharge,
      assigner,
      changerPriorite,
      envoyerMessage,
      ajouterAction,
      changerStatutAction,
      traiter,
      remettreEnTraitement,
      enregistrerSatisfaction,
      marquerLu,
      creer,
    }),
    [reclamations, prendreEnCharge, assigner, changerPriorite, envoyerMessage, ajouterAction, changerStatutAction, traiter, remettreEnTraitement, enregistrerSatisfaction, marquerLu, creer],
  );

  return <RecContext.Provider value={valeur}>{children}</RecContext.Provider>;
}

export function useRec(): RecCtx {
  const ctx = useContext(RecContext);
  if (!ctx) throw new Error("useRec doit être utilisé dans ReclamationsProvider");
  return ctx;
}

export function statutOuvrier(s: StatutRec): "En cours" | "Traitées" {
  return s === "resolved" ? "Traitées" : "En cours";
}
