import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type Context,
  type ReactNode,
} from "react";
import { useLeoni } from "@/lib/leoni-store";
import type { Ouvrier } from "@/data/leoni";
import {
  AVERTISSEMENTS_INITIAUX,
  DEMANDES_INITIALES,
  DOCUMENTS_ESPACE,
  EVALUATIONS_OUVRIER,
  NOTIFS_OUVRIER,
  OUVRIER_DEMO_ID,
  RESULTATS_INITIAUX,
  type AvertissementEspace,
  type DemandeEspace,
  type DocumentEspace,
  type EvaluationOuvrier,
  type NotificationOuvrier,
  type ResultatOuvrier,
  type StatutDemande,
  type StatutDocumentOuvrier,
} from "@/data/espace-ouvrier";

function horodatage() {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return {
    date: `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()}`,
    heure: `${p(d.getHours())}:${p(d.getMinutes())}`,
  };
}

export interface ReponsesQcm {
  [questionId: string]: number[] | string;
}

interface EspaceCtx {
  connecte: boolean;
  modeDemo: boolean;
  langue: string;
  setLangue: (l: string) => void;
  connexion: (identifiant: string, demo?: boolean) => boolean;
  deconnexion: () => void;
  ouvrier: Ouvrier | undefined;
  evaluations: EvaluationOuvrier[];
  resultats: ResultatOuvrier[];
  documents: DocumentEspace[];
  demandes: DemandeEspace[];
  avertissements: AvertissementEspace[];
  notifications: NotificationOuvrier[];
  nonLues: number;
  marquerNotifsLues: () => void;
  brouillonQcm: Record<string, ReponsesQcm>;
  sauverBrouillon: (evalId: string, reponses: ReponsesQcm) => void;
  terminerEvaluation: (evalId: string, reponses: ReponsesQcm, secondes: number) => ResultatOuvrier | undefined;
  envoyerDocument: (docId: string, fichier: string, taille: string) => void;
  creerDemande: (d: { type: string; objet: string; description: string; urgence: DemandeEspace["urgence"]; piece?: string }) => string;
  repondreDemande: (id: string, texte: string) => void;
  changerStatutDemande: (id: string, statut: StatutDemande) => void;
  creerReclamationOuvrier: (r: { categorie: string; objet: string; description: string; priorite: "Critique" | "Élevée" | "Normale" | "Faible"; confidentielle: boolean }) => string;
  accuserLecture: (avertissementId: string) => void;
  pousserNotifOuvrier: (n: Omit<NotificationOuvrier, "id" | "lu" | "date">) => void;
}

const globalRef = globalThis as unknown as { __espaceContext?: Context<EspaceCtx | null> };
const EspaceContext: Context<EspaceCtx | null> =
  globalRef.__espaceContext ?? (globalRef.__espaceContext = createContext<EspaceCtx | null>(null));

export function EspaceProvider({ children }: { children: ReactNode }) {
  const { ouvriers, majOuvrier, pousserNotification, creerReclamation, ajouterEvenement } = useLeoni();

  const [connecte, setConnecte] = useState(false);
  const [modeDemo, setModeDemo] = useState(false);
  const [langue, setLangue] = useState("FR");
  const [evaluations, setEvaluations] = useState<EvaluationOuvrier[]>(EVALUATIONS_OUVRIER);
  const [resultats, setResultats] = useState<ResultatOuvrier[]>(RESULTATS_INITIAUX);
  const [documents, setDocuments] = useState<DocumentEspace[]>(DOCUMENTS_ESPACE);
  const [demandes, setDemandes] = useState<DemandeEspace[]>(DEMANDES_INITIALES);
  const [avertissements, setAvertissements] = useState<AvertissementEspace[]>(AVERTISSEMENTS_INITIAUX);
  const [notifications, setNotifications] = useState<NotificationOuvrier[]>(NOTIFS_OUVRIER);
  const [brouillonQcm, setBrouillon] = useState<Record<string, ReponsesQcm>>({});

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem("espace-ouvrier-connecte") === "1") setConnecte(true);
    if (sessionStorage.getItem("espace-ouvrier-demo") === "1") setModeDemo(true);
  }, []);

  const ouvrier = useMemo(() => ouvriers.find((o) => o.id === OUVRIER_DEMO_ID), [ouvriers]);

  const connexion = useCallback((identifiant: string, demo = false) => {
    const ok =
      demo ||
      identifiant.trim().toUpperCase() === OUVRIER_DEMO_ID ||
      identifiant.replace(/\s/g, "").endsWith("0418") ||
      identifiant.toLowerCase().includes("sara");
    if (ok) {
      setConnecte(true);
      setModeDemo(demo);
      sessionStorage.setItem("espace-ouvrier-connecte", "1");
      sessionStorage.setItem("espace-ouvrier-demo", demo ? "1" : "0");
    }
    return ok;
  }, []);

  const deconnexion = useCallback(() => {
    setConnecte(false);
    setModeDemo(false);
    sessionStorage.removeItem("espace-ouvrier-connecte");
    sessionStorage.removeItem("espace-ouvrier-demo");
  }, []);

  const pousserNotifOuvrier = useCallback((n: Omit<NotificationOuvrier, "id" | "lu" | "date">) => {
    const { heure } = horodatage();
    setNotifications((prev) => [{ ...n, id: `NO-${Date.now()}`, date: `Aujourd'hui ${heure}`, lu: false }, ...prev]);
  }, []);

  const marquerNotifsLues = useCallback(
    () => setNotifications((prev) => prev.map((n) => ({ ...n, lu: true }))),
    [],
  );

  const sauverBrouillon = useCallback((evalId: string, reponses: ReponsesQcm) => {
    setBrouillon((prev) => ({ ...prev, [evalId]: reponses }));
  }, []);

  /* ---------------- QCM : correction + synchronisation Backoffice --------- */

  const terminerEvaluation = useCallback(
    (evalId: string, reponses: ReponsesQcm, secondes: number) => {
      const ev = evaluations.find((e) => e.id === evalId);
      if (!ev) return undefined;
      const { date, heure } = horodatage();

      let bonnes = 0;
      const parTheme: Record<string, { ok: number; total: number }> = {};
      ev.questions.forEach((q) => {
        const rep = reponses[q.id];
        let juste = false;
        if (q.type === "Réponse courte") {
          const attendu = (q.reponseAttendue ?? "").toLowerCase();
          const saisie = String(rep ?? "").toLowerCase();
          juste = saisie.length > 3 && (saisie.includes(attendu.slice(0, 12)) || attendu.includes(saisie));
        } else {
          const sel = Array.isArray(rep) ? [...rep].sort() : [];
          const att = [...(q.bonnes ?? [])].sort();
          juste = sel.length === att.length && sel.every((v, i) => v === att[i]);
        }
        if (juste) bonnes += 1;
        const t = (parTheme[q.theme] ??= { ok: 0, total: 0 });
        t.total += 1;
        if (juste) t.ok += 1;
      });

      const total = ev.questions.length;
      const score = Math.round((bonnes / total) * 100);
      const reussi = score >= ev.seuil;
      const tentative = ev.tentativesUtilisees + 1;
      const tentativesRestantes = ev.tentativesMax - tentative;

      const pointsForts = Object.entries(parTheme)
        .filter(([, t]) => t.ok / t.total >= 0.75)
        .map(([nom]) => nom);
      const aRevoir = Object.entries(parTheme)
        .filter(([, t]) => t.ok / t.total < 0.75)
        .map(([nom]) => nom);

      const resultat: ResultatOuvrier = {
        id: `RES-${Date.now().toString().slice(-5)}`,
        evaluationId: ev.id,
        titre: ev.titre,
        type: "QCM",
        date,
        score,
        seuil: ev.seuil,
        reussi,
        tentative,
        dureeMinutes: Math.max(1, Math.round(secondes / 60)),
        bonnes,
        total,
        pointsForts: pointsForts.length ? pointsForts : ["Participation complète"],
        aRevoir,
        rattrapage:
          !reussi && tentativesRestantes >= 0
            ? { date: "31/07/2026", heure: "14:00", salle: "Salle S01" }
            : undefined,
      };

      setResultats((prev) => [resultat, ...prev]);
      setEvaluations((prev) =>
        prev.map((e) =>
          e.id === evalId
            ? {
                ...e,
                tentativesUtilisees: tentative,
                statut: reussi || tentative >= e.tentativesMax ? "Terminée" : "À passer",
              }
            : e,
        ),
      );
      setBrouillon((prev) => {
        const c = { ...prev };
        delete c[evalId];
        return c;
      });

      // Synchronisation Backoffice : fiche ouvrier, tests, compétences, historique.
      majOuvrier(OUVRIER_DEMO_ID, (o) => {
        const nouveauScore = Math.round((o.score * 3 + score) / 4);
        return {
          ...o,
          score: nouveauScore,
          tests: [...o.tests, { nom: ev.titre, score, statut: reussi ? "Réussi" : "Échoué", date }],
          competences: o.competences.map((c) =>
            ev.titre.toLowerCase().includes(c.nom.slice(0, 6).toLowerCase())
              ? { ...c, niveau: Math.max(c.niveau, Math.round(score / 20)), etat: reussi ? "Acquise" : c.etat }
              : c,
          ),
          readiness: { ...o.readiness, global: nouveauScore },
          evenements: [
            {
              id: `EVT-${Date.now()}`,
              date,
              type: "Feedback",
              auteur: "Espace Ouvrier",
              tonalite: reussi ? "Positive" : "Négative",
              titre: `Évaluation ${ev.titre} — ${score} %`,
              contenu: `Passée depuis l'Espace Ouvrier (tentative ${tentative}). Résultat : ${reussi ? "réussi" : "non validé"}.`,
            },
            ...o.evenements,
          ],
          historique: [
            {
              id: `H-${Date.now()}`,
              date,
              heure,
              utilisateur: o.nom,
              type: "Évaluation",
              action: `QCM ${ev.titre} passé depuis l'Espace Ouvrier`,
              avant: "À passer",
              apres: `${score} % — ${reussi ? "Réussi" : "Non validé"}`,
            },
            ...o.historique,
          ],
        };
      });

      pousserNotification({
        titre: reussi ? "QCM réussi (Espace Ouvrier)" : "QCM non validé (Espace Ouvrier)",
        detail: `${ouvrier?.nom ?? OUVRIER_DEMO_ID} — ${ev.titre} : ${score} %`,
        ton: reussi ? "success" : "warning",
      });
      pousserNotifOuvrier({
        categorie: "Test",
        titre: reussi ? `QCM ${ev.titre} réussi` : `QCM ${ev.titre} non validé`,
        message: `Score : ${score} % (seuil ${ev.seuil} %).`,
        priorite: reussi ? "Normale" : "Haute",
        action: { label: "Voir le détail", to: "/espace/evaluations" },
      });

      return resultat;
    },
    [evaluations, majOuvrier, ouvrier, pousserNotification, pousserNotifOuvrier],
  );

  /* -------------------------------- Documents ----------------------------- */

  const envoyerDocument = useCallback(
    (docId: string, fichier: string, taille: string) => {
      const { date, heure } = horodatage();
      const doc = documents.find((d) => d.id === docId);
      const statut: StatutDocumentOuvrier = "Envoyé";
      setDocuments((prev) =>
        prev.map((d) => (d.id === docId ? { ...d, statut, fichier, taille, dateDepot: date, motif: undefined } : d)),
      );
      majOuvrier(OUVRIER_DEMO_ID, (o) => ({
        ...o,
        documents: [
          ...o.documents.filter((d) => d.nom !== (doc?.nom ?? "")),
          { nom: doc?.nom ?? docId, date, statut: "Reçu – à vérifier" },
        ],
        onboarding: o.onboarding
          ? {
              ...o.onboarding,
              documents: o.onboarding.documents.map((d) =>
                d.nom === doc?.nom ? { ...d, statut: "Reçu" as typeof d.statut, date } : d,
              ),
            }
          : o.onboarding,
        historique: [
          {
            id: `H-${Date.now()}`,
            date,
            heure,
            utilisateur: o.nom,
            type: "Document",
            action: `${doc?.nom ?? docId} déposé depuis l'Espace Ouvrier`,
            avant: "À fournir",
            apres: "Reçu – à vérifier",
          },
          ...o.historique,
        ],
      }));
      pousserNotification({
        titre: "Document reçu (Espace Ouvrier)",
        detail: `${ouvrier?.nom ?? OUVRIER_DEMO_ID} — ${doc?.nom ?? docId} à vérifier`,
        ton: "info",
      });
      pousserNotifOuvrier({
        categorie: "Document",
        titre: "Document envoyé",
        message: `${doc?.nom ?? docId} — en attente de vérification.`,
        priorite: "Normale",
        action: { label: "Suivre", to: "/espace/documents" },
      });
    },
    [documents, majOuvrier, ouvrier, pousserNotification, pousserNotifOuvrier],
  );

  /* --------------------------------- Demandes ----------------------------- */

  const creerDemande = useCallback(
    (d: { type: string; objet: string; description: string; urgence: DemandeEspace["urgence"]; piece?: string }) => {
      const { date, heure } = horodatage();
      const id = `DEM-2026-${String(Math.floor(Math.random() * 400 + 380)).padStart(5, "0")}`;
      const demande: DemandeEspace = {
        id,
        ouvrierId: OUVRIER_DEMO_ID,
        type: d.type,
        objet: d.objet,
        description: d.description,
        urgence: d.urgence,
        piece: d.piece,
        statut: "Envoyée",
        date: `${date} ${heure}`,
        maj: `${date} ${heure}`,
        responsable: "RH Site Bouskoura",
        fil: [{ auteur: ouvrier?.nom ?? "Ouvrier", role: "Ouvrier", date: `${date} ${heure}`, texte: d.description }],
      };
      setDemandes((prev) => [demande, ...prev]);
      majOuvrier(OUVRIER_DEMO_ID, (o) => ({
        ...o,
        evenements: [
          {
            id: `EVT-${Date.now()}`,
            date,
            type: "Observation",
            auteur: o.nom,
            tonalite: "Neutre",
            titre: `Demande ${id} — ${d.type}`,
            contenu: `${d.objet} : ${d.description}`,
          },
          ...o.evenements,
        ],
      }));
      pousserNotification({
        titre: "Nouvelle demande ouvrier",
        detail: `${id} — ${ouvrier?.nom ?? ""} · ${d.type}`,
        ton: d.urgence === "Urgente" ? "warning" : "info",
      });
      return id;
    },
    [majOuvrier, ouvrier, pousserNotification],
  );

  const repondreDemande = useCallback(
    (id: string, texte: string) => {
      const { date, heure } = horodatage();
      setDemandes((prev) =>
        prev.map((d) =>
          d.id === id
            ? {
                ...d,
                maj: `${date} ${heure}`,
                fil: [...d.fil, { auteur: ouvrier?.nom ?? "Ouvrier", role: "Ouvrier", date: `${date} ${heure}`, texte }],
              }
            : d,
        ),
      );
    },
    [ouvrier],
  );

  const changerStatutDemande = useCallback((id: string, statut: StatutDemande) => {
    const { date, heure } = horodatage();
    setDemandes((prev) => prev.map((d) => (d.id === id ? { ...d, statut, maj: `${date} ${heure}` } : d)));
  }, []);

  /* ------------------------------- Réclamations --------------------------- */

  const creerReclamationOuvrier = useCallback(
    (r: { categorie: string; objet: string; description: string; priorite: "Critique" | "Élevée" | "Normale" | "Faible"; confidentielle: boolean }) => {
      const id = `REC-2026-${Math.floor(Math.random() * 90 + 90)}`;
      creerReclamation({
        objet: r.objet,
        ouvrier: ouvrier?.nom ?? "Sara Amrani",
        ouvrierId: OUVRIER_DEMO_ID,
        site: ouvrier?.site ?? "Bouskoura",
        categorie: r.categorie,
        priorite: r.priorite,
        responsable: r.categorie === "EPI" || r.categorie === "Sécurité" ? "Service Sécurité" : "RH Site Bouskoura",
      });
      ajouterEvenement(OUVRIER_DEMO_ID, {
        date: horodatage().date,
        type: "Réclamation",
        auteur: ouvrier?.nom ?? "Sara Amrani",
        tonalite: r.priorite === "Critique" ? "Critique" : "Négative",
        titre: `Réclamation ${r.categorie} — ${r.objet}`,
        contenu: `${r.description}${r.confidentielle ? " (déclarée confidentielle)" : ""}`,
      });
      pousserNotifOuvrier({
        categorie: "Réclamation",
        titre: "Réclamation envoyée",
        message: `${r.objet} — prise en charge en cours.`,
        priorite: "Normale",
        action: { label: "Suivre", to: "/espace/reclamations" },
      });
      return id;
    },
    [ajouterEvenement, creerReclamation, ouvrier, pousserNotifOuvrier],
  );

  /* ------------------------------ Avertissements -------------------------- */

  const accuserLecture = useCallback(
    (avertissementId: string) => {
      const { date, heure } = horodatage();
      setAvertissements((prev) =>
        prev.map((a) => (a.id === avertissementId ? { ...a, lu: { date, heure } } : a)),
      );
      const avt = avertissements.find((a) => a.id === avertissementId);
      majOuvrier(OUVRIER_DEMO_ID, (o) => ({
        ...o,
        historique: [
          {
            id: `H-${Date.now()}`,
            date,
            heure,
            utilisateur: o.nom,
            type: "Avertissement",
            action: `Accusé de lecture — ${avt?.objet ?? avertissementId}`,
            avant: "À consulter",
            apres: `Lu par l'ouvrier le ${date} à ${heure}`,
          },
          ...o.historique,
        ],
      }));
      pousserNotification({
        titre: "Avertissement lu par l'ouvrier",
        detail: `${ouvrier?.nom ?? ""} — ${avt?.objet ?? avertissementId} · ${date} à ${heure}`,
        ton: "info",
      });
    },
    [avertissements, majOuvrier, ouvrier, pousserNotification],
  );

  const nonLues = notifications.filter((n) => !n.lu).length;

  const value = useMemo<EspaceCtx>(
    () => ({
      connecte,
      modeDemo,
      langue,
      setLangue,
      connexion,
      deconnexion,
      ouvrier,
      evaluations,
      resultats,
      documents,
      demandes,
      avertissements,
      notifications,
      nonLues,
      marquerNotifsLues,
      brouillonQcm,
      sauverBrouillon,
      terminerEvaluation,
      envoyerDocument,
      creerDemande,
      repondreDemande,
      changerStatutDemande,
      creerReclamationOuvrier,
      accuserLecture,
      pousserNotifOuvrier,
    }),
    [connecte, modeDemo, langue, connexion, deconnexion, ouvrier, evaluations, resultats, documents, demandes, avertissements, notifications, nonLues, marquerNotifsLues, brouillonQcm, sauverBrouillon, terminerEvaluation, envoyerDocument, creerDemande, repondreDemande, changerStatutDemande, creerReclamationOuvrier, accuserLecture, pousserNotifOuvrier],
  );

  return <EspaceContext.Provider value={value}>{children}</EspaceContext.Provider>;
}

export function useEspace() {
  const ctx = useContext(EspaceContext);
  if (!ctx) throw new Error("useEspace doit être utilisé dans EspaceProvider");
  return ctx;
}
