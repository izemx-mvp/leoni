import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  ALERTES,
  CANDIDATS,
  OUVRIERS,
  RECLAMATIONS,
  ENTRETIENS,
  type Alerte,
  type Candidat,
  type ColonneKanban,
  type Entretien,
  type EvenementSuivi,
  type Ouvrier,
  type Reclamation,
  type StatutCandidature,
} from "@/data/leoni";
import type { CommunicationOnboarding, DossierOnboarding } from "@/data/onboarding";


export type Theme = "light" | "dark" | "system";

export interface Notification {
  id: string;
  titre: string;
  detail: string;
  date: string;
  ton: "info" | "success" | "warning" | "critical";
  lu: boolean;
}

const NOTIFS_INITIALES: Notification[] = [
  { id: "N1", titre: "Réclamation critique", detail: "REC-2026-081 — Absence de gants de protection (Bouskoura)", date: "il y a 12 min", ton: "critical", lu: false },
  { id: "N2", titre: "Risque élevé détecté", detail: "Khadija Rami — présence 72 %, score 46 %", date: "il y a 41 min", ton: "critical", lu: false },
  { id: "N3", titre: "Décision RH en attente", detail: "Sara Amrani — CAN-2026-01248", date: "il y a 1 h", ton: "warning", lu: false },
  { id: "N4", titre: "Score IA élevé", detail: "Mehdi Berrada — 88 % sur Technicien ligne", date: "il y a 3 h", ton: "info", lu: true },
  { id: "N5", titre: "Entretien demain", detail: "Youssef El Mansouri — 29/07 à 10:30", date: "il y a 5 h", ton: "info", lu: true },
  { id: "N6", titre: "Test échoué", detail: "QCM-SEC-01 — Khadija Rami 55 %", date: "hier", ton: "warning", lu: true },
];

function horodatage() {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return { date: `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()}`, heure: `${p(d.getHours())}:${p(d.getMinutes())}` };
}

interface Ctx {
  theme: Theme;
  setTheme: (t: Theme) => void;
  site: string;
  setSite: (s: string) => void;
  langue: string;
  setLangue: (l: string) => void;
  candidats: Candidat[];
  ouvriers: Ouvrier[];
  entretiens: Entretien[];
  reclamations: Reclamation[];
  alertes: Alerte[];
  notifications: Notification[];
  marquerLues: () => void;
  pousserNotification: (n: Omit<Notification, "id" | "date" | "lu">) => void;
  changerStatutCandidat: (id: string, statut: StatutCandidature, motif?: string) => void;
  planifierEntretien: (candidatId: string, date: string, heure: string, type: string) => void;
  evaluerEntretien: (entretienId: string, note: number) => void;
  transformerEnOuvrier: (candidatId: string) => string | undefined;
  ajouterEvenement: (ouvrierId: string, e: Omit<EvenementSuivi, "id">) => void;
  enregistrerPresence: (ouvrierId: string, statut: "Présente" | "Retard" | "Absence" | "Autorisation", detail: string) => void;
  validerJournee: (ouvrierId: string, score: number, observation: string) => void;
  deciderParcours: (ouvrierId: string, decision: string, commentaire: string, motif?: string) => void;
  deplacerReclamation: (id: string, statut: ColonneKanban) => void;
  creerReclamation: (r: Omit<Reclamation, "id" | "date" | "statut">) => void;
  creerCandidature: (c: Omit<Candidat, "id" | "date">) => Candidat;
  lancerTalentFit: (candidatId: string) => void;
  preIntegrerCandidat: (
    candidatId: string,
    dossier: DossierOnboarding,
    decision?: { commentaire: string; responsable: string },
  ) => string | undefined;
  majOnboarding: (ouvrierId: string, maj: (d: DossierOnboarding) => DossierOnboarding) => void;
  finaliserAccueil: (ouvrierId: string) => void;

}

const LeoniContext = createContext<Ctx | null>(null);

const matriculeSite: Record<string, string> = {
  Bouskoura: "BOU",
  "Bouskoura – Ouled Saleh": "BOS",
  Berrechid: "BER",
  Bouznika: "BZN",
  Agadir: "AGA",
  "Aïn Sebaâ": "ASB",
};

export function LeoniProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("light");
  const [site, setSite] = useState("Tous les sites");
  const [langue, setLangue] = useState("FR");
  const [candidats, setCandidats] = useState<Candidat[]>(CANDIDATS);
  const [ouvriers, setOuvriers] = useState<Ouvrier[]>(OUVRIERS);
  const [entretiens, setEntretiens] = useState<Entretien[]>(ENTRETIENS);
  const [reclamations, setReclamations] = useState<Reclamation[]>(RECLAMATIONS);
  const [alertes, setAlertes] = useState<Alerte[]>(ALERTES);
  const [notifications, setNotifications] = useState<Notification[]>(NOTIFS_INITIALES);

  useEffect(() => {
    const saved = (localStorage.getItem("leoni-theme") as Theme) ?? "light";
    setThemeState(saved);
  }, []);

  useEffect(() => {
    const apply = () => {
      const dark =
        theme === "dark" ||
        (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
      document.documentElement.classList.toggle("dark", dark);
    };
    apply();
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [theme]);

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
    localStorage.setItem("leoni-theme", t);
  }, []);

  const pousserNotification = useCallback((n: Omit<Notification, "id" | "date" | "lu">) => {
    setNotifications((prev) => [
      { ...n, id: `N-${Date.now()}`, date: "à l'instant", lu: false },
      ...prev,
    ]);
  }, []);

  const marquerLues = useCallback(
    () => setNotifications((prev) => prev.map((n) => ({ ...n, lu: true }))),
    [],
  );

  const journaliser = useCallback(
    (ouvrierId: string, type: string, action: string, avant: string, apres: string) => {
      const { date, heure } = horodatage();
      setOuvriers((prev) =>
        prev.map((o) =>
          o.id === ouvrierId
            ? {
                ...o,
                historique: [
                  ...o.historique,
                  { id: `H-${Date.now()}`, date, heure, utilisateur: "Nadia El Ghali", type, action, avant, apres },
                ],
              }
            : o,
        ),
      );
    },
    [],
  );

  const changerStatutCandidat = useCallback(
    (id: string, statut: StatutCandidature, motif?: string) => {
      setCandidats((prev) => prev.map((c) => (c.id === id ? { ...c, statut } : c)));
      const c = CANDIDATS.find((x) => x.id === id);
      pousserNotification({
        titre: "Décision candidature",
        detail: `${c?.nom ?? id} — ${statut}${motif ? ` (${motif})` : ""}`,
        ton: statut === "Refusé" ? "warning" : "success",
      });
    },
    [pousserNotification],
  );

  const planifierEntretien = useCallback(
    (candidatId: string, date: string, heure: string, type: string) => {
      const c = candidats.find((x) => x.id === candidatId);
      if (!c) return;
      setEntretiens((prev) => [
        ...prev,
        {
          id: `ENT-${Math.floor(Math.random() * 9000 + 1000)}`,
          candidatId,
          candidat: c.nom,
          date,
          heure,
          type,
          statut: "Planifié",
          evaluateur: c.recruteur,
          site: c.site,
        },
      ]);
      setCandidats((prev) =>
        prev.map((x) =>
          x.id === candidatId ? { ...x, statut: "Entretien planifié", entretien: "Planifié" } : x,
        ),
      );
      pousserNotification({
        titre: "Entretien planifié",
        detail: `${c.nom} — ${type} le ${date} à ${heure}`,
        ton: "info",
      });
    },
    [candidats, pousserNotification],
  );

  const evaluerEntretien = useCallback(
    (entretienId: string, note: number) => {
      setEntretiens((prev) =>
        prev.map((e) => (e.id === entretienId ? { ...e, statut: "Réalisé", note } : e)),
      );
      const e = entretiens.find((x) => x.id === entretienId);
      if (e) {
        setCandidats((prev) =>
          prev.map((c) =>
            c.id === e.candidatId
              ? { ...c, statut: "Décision en attente", entretien: "Entretien réalisé" }
              : c,
          ),
        );
        pousserNotification({
          titre: "Entretien évalué",
          detail: `${e.candidat} — note ${note.toFixed(1)}/5`,
          ton: "success",
        });
      }
    },
    [entretiens, pousserNotification],
  );

  const transformerEnOuvrier = useCallback(
    (candidatId: string) => {
      const c = candidats.find((x) => x.id === candidatId);
      if (!c) return undefined;
      const existant = ouvriers.find((o) => o.candidatId === candidatId);
      if (existant) return existant.id;
      const code = matriculeSite[c.site] ?? "LMA";
      const matricule = `LMA-${code}-2026-${Math.floor(Math.random() * 900 + 100)}`;
      const modele = OUVRIERS[0];
      const { date, heure } = horodatage();
      const nouveau: Ouvrier = {
        ...modele,
        id: matricule,
        candidatId,
        nom: c.nom,
        poste: c.poste,
        site: c.site,
        atelier: "À affecter",
        groupe: "À affecter",
        jour: 0,
        progression: 0,
        score: 0,
        presence: 100,
        ponctualite: 100,
        risque: "Faible",
        statut: "À intégrer",
        dateIntegration: date,
        prochaineAction: "Affecter à un parcours de formation",
        prochaineEtape: undefined,
        identite: { ...modele.identite, telephone: c.telephone, email: c.email, ville: c.ville },
        journal: [],
        presences: [],
        tests: [],
        evenements: [],
        communications: [],
        courbe: [],
        modules: modele.modules.map((m) => ({ code: m.code, nom: m.nom, statut: "À venir" as const })),
        historique: [
          { id: `H-${Date.now()}`, date, heure, utilisateur: "Nadia El Ghali", type: "Création", action: "Fiche ouvrier créée depuis la candidature", avant: candidatId, apres: matricule },
        ],
      };
      setOuvriers((prev) => [nouveau, ...prev]);
      setCandidats((prev) =>
        prev.map((x) => (x.id === candidatId ? { ...x, statut: "Retenu", ouvrierId: matricule } : x)),
      );
      pousserNotification({
        titre: "Fiche ouvrier créée",
        detail: `${c.nom} — matricule ${matricule} · Action : affecter à un parcours`,
        ton: "success",
      });
      return matricule;
    },
    [candidats, ouvriers, pousserNotification],
  );

  const ajouterEvenement = useCallback(
    (ouvrierId: string, e: Omit<EvenementSuivi, "id">) => {
      setOuvriers((prev) =>
        prev.map((o) =>
          o.id === ouvrierId
            ? { ...o, evenements: [{ ...e, id: `EVT-${Date.now()}` }, ...o.evenements] }
            : o,
        ),
      );
      journaliser(ouvrierId, e.type, `${e.type} ajouté(e) : ${e.titre}`, "—", e.tonalite);
      pousserNotification({ titre: e.type, detail: `${e.titre} — ${e.contenu.slice(0, 60)}`, ton: e.tonalite === "Négative" || e.tonalite === "Critique" ? "warning" : "info" });
    },
    [journaliser, pousserNotification],
  );

  const enregistrerPresence = useCallback(
    (ouvrierId: string, statut: "Présente" | "Retard" | "Absence" | "Autorisation", detail: string) => {
      const { date } = horodatage();
      setOuvriers((prev) =>
        prev.map((o) => {
          if (o.id !== ouvrierId) return o;
          const presence =
            statut === "Absence" ? Math.max(0, o.presence - 4) : o.presence;
          const ponctualite = statut === "Retard" ? Math.max(0, o.ponctualite - 3) : o.ponctualite;
          const risque: Ouvrier["risque"] =
            presence < 80 || o.score < 60 ? "Élevé" : presence < 90 ? "Moyen" : o.risque;
          return {
            ...o,
            presence,
            ponctualite,
            risque,
            presences: [
              ...o.presences,
              {
                date,
                shift: o.situation.shift,
                entree: statut === "Absence" ? "—" : "08:00",
                sortie: statut === "Absence" ? "—" : "17:00",
                statut: statut === "Présente" ? "Présente" : statut,
                retard: statut === "Retard" ? detail : undefined,
                impact: statut === "Absence" ? "Rattrapage à planifier" : undefined,
              },
            ],
            evenements:
              statut === "Absence" || statut === "Retard"
                ? [
                    {
                      id: `EVT-${Date.now()}`,
                      date,
                      type: "Alerte" as const,
                      auteur: "Système",
                      tonalite: "Négative" as const,
                      titre: statut === "Absence" ? "Absence enregistrée" : "Retard enregistré",
                      contenu: `${statut} du ${date}. ${detail}`,
                    },
                    ...o.evenements,
                  ]
                : o.evenements,
          };
        }),
      );
      journaliser(ouvrierId, "Présence", `${statut} enregistré(e)`, "Présente", `${statut} ${detail}`);
      pousserNotification({
        titre: `Présence — ${statut}`,
        detail: `${ouvriers.find((o) => o.id === ouvrierId)?.nom ?? ouvrierId} · ${detail}`,
        ton: statut === "Absence" ? "warning" : "info",
      });
    },
    [journaliser, ouvriers, pousserNotification],
  );

  const validerJournee = useCallback(
    (ouvrierId: string, score: number, observation: string) => {
      const { date } = horodatage();
      setOuvriers((prev) =>
        prev.map((o) => {
          if (o.id !== ouvrierId) return o;
          const jour = Math.min(o.jourTotal, o.jour + 1);
          const nouveauScore = Math.round((o.score * 3 + score) / 4);
          return {
            ...o,
            jour,
            progression: Math.min(100, Math.round((jour / o.jourTotal) * 100)),
            score: nouveauScore,
            courbe: [...o.courbe, { jour: `J${jour}`, score: nouveauScore }],
            journal: [
              ...o.journal,
              {
                date,
                jour,
                module: o.modules.find((m) => m.statut === "En cours")?.nom ?? "Module du jour",
                formateur: o.formateur,
                presence: "Présente",
                participation: "Bonne",
                comprehension: "Bonne",
                comportement: "Très bon",
                score,
                observation,
                statut: score >= 75 ? "Validée" : "Validée sous réserve",
              },
            ],
            readiness: { ...o.readiness, global: nouveauScore },
          };
        }),
      );
      journaliser(ouvrierId, "Journal", "Journée validée", "En cours", `Score ${score} %`);
      pousserNotification({ titre: "Journée validée", detail: `Score du jour : ${score} %`, ton: "success" });
    },
    [journaliser, pousserNotification],
  );

  const deciderParcours = useCallback(
    (ouvrierId: string, decision: string, commentaire: string, motif?: string) => {
      const { date } = horodatage();
      const map: Record<string, Ouvrier["statut"]> = {
        CONFIRMER: "Confirmé",
        "CONFIRMER SOUS RÉSERVE": "Confirmé",
        "PROLONGER LA FORMATION": "En formation",
        RÉORIENTER: "À évaluer",
        SUSPENDRE: "Suspendu",
        "ARRÊTER LE PARCOURS": "Parcours arrêté",
      };
      setOuvriers((prev) =>
        prev.map((o) =>
          o.id === ouvrierId
            ? {
                ...o,
                statut: map[decision] ?? o.statut,
                decision: { decision, commentaire, responsable: "Nadia El Ghali", date, motif },
              }
            : o,
        ),
      );
      journaliser(ouvrierId, "Décision", `Décision RH : ${decision}`, "À confirmer", decision);
      pousserNotification({
        titre: "Décision RH enregistrée",
        detail: `${ouvriers.find((o) => o.id === ouvrierId)?.nom ?? ouvrierId} — ${decision}`,
        ton: decision.startsWith("CONFIRMER") ? "success" : "warning",
      });
    },
    [journaliser, ouvriers, pousserNotification],
  );

  const deplacerReclamation = useCallback((id: string, statut: ColonneKanban) => {
    setReclamations((prev) => prev.map((r) => (r.id === id ? { ...r, statut } : r)));
  }, []);

  const creerReclamation = useCallback(
    (r: Omit<Reclamation, "id" | "date" | "statut">) => {
      const { date } = horodatage();
      const id = `REC-2026-${Math.floor(Math.random() * 900 + 100)}`;
      setReclamations((prev) => [{ ...r, id, date, statut: "Nouvelle" }, ...prev]);
      setAlertes((prev) => [
        {
          id: `ALR-${Math.floor(Math.random() * 900 + 100)}`,
          type: `Réclamation ${r.categorie} — ${r.objet}`,
          personne: r.ouvrier,
          site: r.site,
          priorite: r.priorite === "Critique" ? "Critique" : "Moyenne",
          date,
          proprietaire: r.responsable,
          cta: "Ouvrir la réclamation",
          lien: "/suivi/reclamations",
        },
        ...prev,
      ]);
      pousserNotification({ titre: "Réclamation créée", detail: `${id} — ${r.objet}`, ton: r.priorite === "Critique" ? "critical" : "info" });
    },
    [pousserNotification],
  );

  const creerCandidature = useCallback(
    (c: Omit<Candidat, "id" | "date">) => {
      const { date } = horodatage();
      const candidat: Candidat = { ...c, id: "", date };
      setCandidats((prev) => {
        let n = 1250;
        while (prev.some((x) => x.id === `CAN-2026-${String(n).padStart(5, "0")}`)) n += 1;
        candidat.id = `CAN-2026-${String(n).padStart(5, "0")}`;
        return [candidat, ...prev];
      });
      pousserNotification({
        titre: candidat.brouillon ? "Brouillon de candidature enregistré" : "Candidature créée",
        detail: `${candidat.id} — ${candidat.nom} · ${candidat.poste}`,
        ton: candidat.brouillon ? "info" : "success",
      });
      return candidat;
    },
    [pousserNotification],
  );

  const lancerTalentFit = useCallback(
    (candidatId: string) => {
      const { date, heure } = horodatage();
      setCandidats((prev) =>
        prev.map((c) => {
          if (c.id !== candidatId) return c;
          const detail = [
            { label: "Adéquation poste", valeur: 70 + Math.floor(Math.random() * 25) },
            { label: "Expérience", valeur: 65 + Math.floor(Math.random() * 30) },
            { label: "Apprentissage", valeur: 70 + Math.floor(Math.random() * 25) },
            { label: "Disponibilité", valeur: c.disponibilite === "Immédiate" ? 100 : 80 },
            { label: "Mobilité", valeur: c.mobilite?.toLowerCase().startsWith("oui") ? 92 : 70 },
            { label: "Comportement", valeur: 75 + Math.floor(Math.random() * 20) },
          ];
          const score = Math.round(detail.reduce((s, d) => s + d.valeur, 0) / detail.length);
          return {
            ...c,
            score,
            detailScore: detail,
            recommandation: score >= 80 ? "Fortement recommandé" : score >= 65 ? "Recommandé" : "À qualifier",
            statut: score >= 70 ? ("Présélectionné" as const) : c.statut,
            audit: [...(c.audit ?? []), { date, heure, libelle: `Talent Fit AI lancé — score ${score} %` }],
          };
        }),
      );
      pousserNotification({ titre: "Talent Fit AI lancé", detail: `Scoring de compatibilité calculé pour ${candidatId}`, ton: "info" });
    },
    [pousserNotification],
  );

  /** Pré-intégration : crée la fiche ouvrier « À intégrer » avec son dossier d'onboarding. */
  const preIntegrerCandidat = useCallback(
    (candidatId: string, dossier: DossierOnboarding, decision?: { commentaire: string; responsable: string }) => {
      const c = candidats.find((x) => x.id === candidatId);
      if (!c) return undefined;
      const existant = ouvriers.find((o) => o.candidatId === candidatId);
      const code = matriculeSite[c.site] ?? "LMA";
      const matricule = existant?.id ?? `LMA-${code}-2026-${Math.floor(Math.random() * 900 + 100)}`;
      const modele = OUVRIERS[0];
      const { date, heure } = horodatage();
      const dossierComplet: DossierOnboarding = { ...dossier, candidatId };

      if (existant) {
        setOuvriers((prev) =>
          prev.map((o) => (o.id === existant.id ? { ...o, onboarding: dossierComplet, statut: "À intégrer" } : o)),
        );
      } else {
        const nouveau: Ouvrier = {
          ...modele,
          id: matricule,
          candidatId,
          nom: c.nom,
          poste: dossier.arrivee.poste || c.poste,
          site: c.site,
          atelier: dossier.arrivee.atelier || "À affecter",
          groupe: "À affecter",
          jour: 0,
          progression: 0,
          score: 0,
          presence: 100,
          ponctualite: 100,
          risque: "Faible",
          statut: "À intégrer",
          dateIntegration: dossier.arrivee.date,
          prochaineAction: `Intégration prévue le ${dossier.arrivee.date} à ${dossier.arrivee.heure}`,
          prochaineEtape: {
            date: dossier.arrivee.date,
            heure: dossier.arrivee.heure,
            libelle: "Accueil et intégration",
            lieu: dossier.arrivee.pointAccueil,
          },
          identite: { ...modele.identite, telephone: c.telephone, email: c.email, ville: c.ville },
          situation: { ...modele.situation, departement: dossier.arrivee.departement },
          journal: [],
          presences: [],
          tests: [],
          evenements: [],
          communications: dossier.communications.map((m: CommunicationOnboarding) => ({
            date: m.date,
            canal: m.canal,
            objet: m.objet,
            statut: m.statut,
          })),
          courbe: [],
          modules: modele.modules.map((m) => ({ code: m.code, nom: m.nom, statut: "À venir" as const })),
          documents: [],
          onboarding: dossierComplet,
          decision: decision
            ? { decision: "Retenu", commentaire: decision.commentaire, responsable: decision.responsable, date }
            : undefined,
          historique: [
            { id: `H-${Date.now()}`, date, heure, utilisateur: decision?.responsable ?? "Nadia El Ghali", type: "Création", action: "Fiche ouvrier créée depuis la décision RH « Retenu »", avant: candidatId, apres: matricule },
          ],
        };
        setOuvriers((prev) => [nouveau, ...prev]);
      }

      setCandidats((prev) =>
        prev.map((x) =>
          x.id === candidatId
            ? {
                ...x,
                statut: "Retenu",
                ouvrierId: matricule,
                audit: [...(x.audit ?? []), { date, heure, libelle: `Décision RH « Retenu » — pré-intégration créée (${matricule})` }],
              }
            : x,
        ),
      );
      pousserNotification({
        titre: "Pré-intégration créée",
        detail: `${c.nom} — matricule ${matricule} · arrivée le ${dossier.arrivee.date} à ${dossier.arrivee.heure}`,
        ton: "success",
      });
      return matricule;
    },
    [candidats, ouvriers, pousserNotification],
  );

  /** Mise à jour partielle du dossier d'onboarding d'un ouvrier. */
  const majOnboarding = useCallback(
    (ouvrierId: string, maj: (d: DossierOnboarding) => DossierOnboarding) => {
      setOuvriers((prev) =>
        prev.map((o) => (o.id === ouvrierId && o.onboarding ? { ...o, onboarding: maj(o.onboarding) } : o)),
      );
    },
    [],
  );

  /** Clôture de l'accueil : l'ouvrier passe en intégration effective. */
  const finaliserAccueil = useCallback(
    (ouvrierId: string) => {
      const { date, heure } = horodatage();
      setOuvriers((prev) =>
        prev.map((o) =>
          o.id === ouvrierId
            ? {
                ...o,
                statut: "En formation",
                prochaineAction: "Démarrer le parcours d'intégration",
                onboarding: o.onboarding ? { ...o.onboarding, accueilFinalise: true } : o.onboarding,
                historique: [
                  { id: `H-${Date.now()}`, date, heure, utilisateur: "Nadia El Ghali", type: "Intégration", action: "Accueil finalisé — passage en formation", avant: "À intégrer", apres: "En formation" },
                  ...o.historique,
                ],
              }
            : o,
        ),
      );
      pousserNotification({ titre: "Accueil finalisé", detail: `${ouvrierId} — intégration démarrée`, ton: "success" });
    },
    [pousserNotification],
  );



  const value = useMemo<Ctx>(
    () => ({
      theme,
      setTheme,
      site,
      setSite,
      langue,
      setLangue,
      candidats,
      ouvriers,
      entretiens,
      reclamations,
      alertes,
      notifications,
      marquerLues,
      pousserNotification,
      changerStatutCandidat,
      planifierEntretien,
      evaluerEntretien,
      transformerEnOuvrier,
      ajouterEvenement,
      enregistrerPresence,
      validerJournee,
      deciderParcours,
      deplacerReclamation,
      creerReclamation,
      creerCandidature,
      lancerTalentFit,
      preIntegrerCandidat,
      majOnboarding,
      finaliserAccueil,
    }),
    [theme, setTheme, site, langue, candidats, ouvriers, entretiens, reclamations, alertes, notifications, marquerLues, pousserNotification, changerStatutCandidat, planifierEntretien, evaluerEntretien, transformerEnOuvrier, ajouterEvenement, enregistrerPresence, validerJournee, deciderParcours, deplacerReclamation, creerReclamation, creerCandidature, lancerTalentFit, preIntegrerCandidat, majOnboarding, finaliserAccueil],
  );

  return <LeoniContext.Provider value={value}>{children}</LeoniContext.Provider>;
}

export function useLeoni() {
  const ctx = useContext(LeoniContext);
  if (!ctx) throw new Error("useLeoni doit être utilisé dans LeoniProvider");
  return ctx;
}
