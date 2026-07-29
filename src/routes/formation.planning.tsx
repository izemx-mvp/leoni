import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Btn, Champ, Input, Kpi, Onglets, PageHeader, Panel, Select, Tag } from "@/components/leoni/kit";
import {
  FORMATEURS,
  FORMATIONS_PLANNING,
  GROUPES,
  SALLES,
  STATUTS_SESSION,
  TYPES_SESSION,
  ajouterJours,
  dureeMin,
  formatCourt,
  formateurParId,
  formatLong,
  isoDe,
  lundiDe,
  type SessionPlanning,
} from "@/data/planning";
import {
  actionsPlanning,
  calculerCharges,
  sessionsEnConflit,
  useSessions,
} from "@/lib/planning-store";
import { AucuneSession } from "@/components/leoni/planning/commun";
import { VueJour, VueListe, VueMois, VueRessources, VueSemaine, libelleMois } from "@/components/leoni/planning/vues";
import { SessionDrawer } from "@/components/leoni/planning/SessionDrawer";
import { NouvelleSession } from "@/components/leoni/planning/NouvelleSession";
import { ChargeFormateurs, FicheFormateur } from "@/components/leoni/planning/formateurs";
import { useLeoni } from "@/lib/leoni-store";

export const Route = createFileRoute("/formation/planning")({
  head: () => ({
    meta: [
      { title: "Planning de formation — LEONI Workforce Journey" },
      {
        name: "description",
        content:
          "Espace de pilotage du planning de formation LEONI Maroc : vues jour, semaine, mois, ressources, détection des conflits, charge des formateurs et convocations.",
      },
      { property: "og:title", content: "Planning de formation — LEONI Workforce Journey" },
      {
        property: "og:description",
        content: "Planification des sessions, gestion des formateurs, salles, groupes et conflits en temps réel.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PlanningPage,
});

const VUES = ["Jour", "Semaine", "Mois", "Formateurs", "Salles", "Liste"] as const;
type Vue = (typeof VUES)[number];

const TOUS = "Tous";

function PlanningPage() {
  const { pousserNotification } = useLeoni();
  const sessions = useSessions();

  const [vue, setVue] = useState<Vue>("Semaine");
  const [date, setDate] = useState("2026-07-29");
  const [recherche, setRecherche] = useState("");
  const [site, setSite] = useState(TOUS);
  const [formateur, setFormateur] = useState(TOUS);
  const [salle, setSalle] = useState(TOUS);
  const [groupe, setGroupe] = useState(TOUS);
  const [formation, setFormation] = useState(TOUS);
  const [type, setType] = useState(TOUS);
  const [statut, setStatut] = useState(TOUS);
  const [filtresOuverts, setFiltresOuverts] = useState(false);

  const [selection, setSelection] = useState<string | null>(null);
  const [ficheFormateur, setFicheFormateur] = useState<string | null>(null);
  const [creation, setCreation] = useState<{ date: string; debut: string } | null>(null);

  const semaine = lundiDe(date);
  const mois = date.slice(0, 7);

  const notifier = (message: string, detail = "") =>
    pousserNotification({ titre: message, detail, ton: "info" });

  /* -------------------------------- Filtres ------------------------------- */

  const filtrees = useMemo(() => {
    const q = recherche.trim().toLowerCase();
    return sessions.filter((s) => {
      if (site !== TOUS && s.site !== site) return false;
      if (formateur !== TOUS && formateurParId(s.formateurId)?.nom !== formateur) return false;
      if (salle !== TOUS && s.salleId !== salle) return false;
      if (groupe !== TOUS && s.groupe !== groupe) return false;
      if (formation !== TOUS && s.formationNom !== formation) return false;
      if (type !== TOUS && s.type !== type) return false;
      if (statut !== TOUS && s.statut !== statut) return false;
      if (!q) return true;
      return [s.groupe, s.moduleNom, s.formationNom, s.site, s.id, formateurParId(s.formateurId)?.nom ?? "", s.type]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [sessions, recherche, site, formateur, salle, groupe, formation, type, statut]);

  const periode = useMemo(() => {
    if (vue === "Jour") return filtrees.filter((s) => s.date === date);
    if (vue === "Mois") return filtrees.filter((s) => s.date.startsWith(mois));
    if (vue === "Liste") return filtrees;
    const fin = ajouterJours(semaine, 6);
    return filtrees.filter((s) => s.date >= semaine && s.date < fin);
  }, [filtrees, vue, date, mois, semaine]);

  const conflits = useMemo(() => sessionsEnConflit(periode), [periode]);
  const charges = useMemo(() => calculerCharges(periode), [periode]);

  const heures = Math.round((periode.reduce((a, s) => a + dureeMin(s), 0) / 60) * 10) / 10;
  const participants = periode.reduce((a, s) => a + s.participants.length, 0);
  const remplissage = periode.length
    ? Math.round((participants / periode.reduce((a, s) => a + s.capacite, 0)) * 100)
    : 0;
  const aConfirmer = periode.filter((s) => s.statut === "À confirmer" || s.statut === "Brouillon").length;
  const annulees = periode.filter((s) => s.statut === "Annulée").length;
  const surcharges = charges.filter((c) => c.taux > 100).length;

  const filtresActifs =
    [site, formateur, salle, groupe, formation, type, statut].filter((v) => v !== TOUS).length + (recherche ? 1 : 0);

  const reinitialiser = () => {
    setRecherche("");
    setSite(TOUS);
    setFormateur(TOUS);
    setSalle(TOUS);
    setGroupe(TOUS);
    setFormation(TOUS);
    setType(TOUS);
    setStatut(TOUS);
  };

  const deplacer = (id: string, d: string, debut: string) => {
    const s = sessions.find((x) => x.id === id);
    if (!s) return;
    actionsPlanning.deplacer(id, d, debut);
    notifier("Session déplacée", `${s.groupe} — ${s.moduleNom} : ${formatCourt(d)} à ${debut}.`);
  };

  const sessionSelection = sessions.find((s) => s.id === selection) ?? null;
  const decalage = vue === "Jour" ? 1 : vue === "Mois" ? 30 : 7;

  const libellePeriode =
    vue === "Jour"
      ? formatLong(date)
      : vue === "Mois"
        ? libelleMois(mois)
        : `Semaine du ${formatCourt(semaine)} au ${formatCourt(ajouterJours(semaine, 5))}`;

  return (
    <>
      <PageHeader
        titre="Planning de formation"
        sousTitre="Pilotage des sessions, formateurs, salles et groupes — détection automatique des conflits"
        fil={[{ label: "Formation" }, { label: "Planning" }]}
        actions={
          <>
            <Btn size="sm" onClick={() => { actionsPlanning.reinitialiser(); notifier("Planning réinitialisé"); }}>
              Réinitialiser le planning
            </Btn>
            <Btn
              size="sm"
              onClick={() => {
                const total = periode.reduce((a, s) => a + s.participants.length, 0);
                periode.forEach((s) => actionsPlanning.notifier(s.id));
                notifier("Convocations envoyées", `${total} participants notifiés sur la période affichée.`);
              }}
            >
              Notifier la période
            </Btn>
            <Btn size="sm" variant="primary" onClick={() => setCreation({ date, debut: "08:00" })}>
              + Nouvelle session
            </Btn>
          </>
        }
      />

      {/* KPI */}
      <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <Kpi label="Sessions planifiées" valeur={periode.length} />
        <Kpi label="Heures de formation" valeur={heures} suffixe="h" />
        <Kpi label="Participants attendus" valeur={participants} />
        <Kpi label="Taux de remplissage" valeur={remplissage} suffixe="%" ton={remplissage < 60 ? "warning" : "success"} />
        <Kpi label="Sessions à confirmer" valeur={aConfirmer} ton={aConfirmer > 0 ? "warning" : "success"} />
        <Kpi label="Conflits détectés" valeur={conflits.size} ton={conflits.size > 0 ? "critical" : "success"} />
      </div>

      {/* Barre de pilotage */}
      <Panel className="mb-4" bodyClassName="p-3">
        <div className="flex flex-wrap items-center gap-2">
          <Input
            placeholder="Rechercher une session, un groupe, un module, un formateur…"
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            className="min-w-64 flex-1"
          />
          <div className="flex items-center gap-1">
            <Btn size="sm" onClick={() => setDate(ajouterJours(date, -decalage))} aria-label="Période précédente">
              ‹
            </Btn>
            <Btn size="sm" onClick={() => setDate("2026-07-29")}>
              Aujourd'hui
            </Btn>
            <Btn size="sm" onClick={() => setDate(ajouterJours(date, decalage))} aria-label="Période suivante">
              ›
            </Btn>
          </div>
          <input
            type="date"
            value={date}
            onChange={(e) => e.target.value && setDate(e.target.value)}
            className="h-9 rounded-sm border border-border bg-card px-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]"
          />
          <Select
            value={vue}
            onChange={(v) => setVue(v as Vue)}
            options={[...VUES]}
            className="min-w-32"
          />
          <Btn size="sm" onClick={() => setFiltresOuverts((v) => !v)}>
            Filtres {filtresActifs > 0 && <span className="num">({filtresActifs})</span>}
          </Btn>
        </div>

        {filtresOuverts && (
          <div className="mt-3 grid gap-2 border-t border-border pt-3 sm:grid-cols-2 lg:grid-cols-4">
            <Champ label="Site" value={site} onChange={setSite} options={[TOUS, ...new Set(SALLES.map((s) => s.site))]} />
            <Champ label="Formateur" value={formateur} onChange={setFormateur} options={[TOUS, ...FORMATEURS.map((f) => f.nom)]} />
            <Champ label="Salle" value={salle} onChange={setSalle} options={[TOUS, ...SALLES.map((s) => s.id)]} />
            <Champ label="Groupe" value={groupe} onChange={setGroupe} options={[TOUS, ...GROUPES.map((g) => g.code)]} />
            <Champ label="Formation" value={formation} onChange={setFormation} options={[TOUS, ...FORMATIONS_PLANNING.map((f) => f.nom)]} />
            <Champ label="Type" value={type} onChange={setType} options={[TOUS, ...TYPES_SESSION]} />
            <Champ label="Statut" value={statut} onChange={setStatut} options={[TOUS, ...STATUTS_SESSION]} />
            <div className="flex items-end">
              <Btn size="sm" className="w-full" onClick={reinitialiser}>
                Effacer les filtres
              </Btn>
            </div>
          </div>
        )}

        <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
          <span className="font-medium text-foreground">{libellePeriode}</span>
          <span>· {periode.length} session(s) affichée(s)</span>
          {annulees > 0 && <Tag ton="neutral">{annulees} annulée(s)</Tag>}
          {surcharges > 0 && <Tag ton="critical">{surcharges} formateur(s) en surcharge</Tag>}
          {conflits.size > 0 && <Tag ton="critical">{conflits.size} session(s) en conflit</Tag>}
          <span className="ml-auto">Glissez une session pour la déplacer · double-clic sur une plage libre pour créer</span>
        </div>
      </Panel>

      {/* Vues */}
      {periode.length === 0 ? (
        <AucuneSession filtres={filtresActifs > 0} onCreer={() => setCreation({ date, debut: "08:00" })} />
      ) : vue === "Jour" ? (
        <VueJour
          date={date}
          sessions={periode}
          conflits={conflits}
          onOuvrir={setSelection}
          onDeplacer={deplacer}
          onCreerCreneau={(d, h) => setCreation({ date: d, debut: h })}
        />
      ) : vue === "Semaine" ? (
        <VueSemaine
          debutSemaine={semaine}
          sessions={periode}
          conflits={conflits}
          onOuvrir={setSelection}
          onDeplacer={deplacer}
          onCreerCreneau={(d, h) => setCreation({ date: d, debut: h })}
        />
      ) : vue === "Mois" ? (
        <VueMois mois={mois} sessions={periode} conflits={conflits} onOuvrir={setSelection} onDeplacer={deplacer} />
      ) : vue === "Liste" ? (
        <VueListe sessions={periode} conflits={conflits} onOuvrir={setSelection} onDeplacer={deplacer} />
      ) : (
        <VueRessources
          axe={vue === "Formateurs" ? "Formateur" : "Salle"}
          debutSemaine={semaine}
          sessions={periode}
          conflits={conflits}
          onOuvrir={setSelection}
          onDeplacer={deplacer}
        />
      )}

      <ChargeFormateurs charges={charges} sessions={periode} onOuvrirFiche={setFicheFormateur} />

      <OccupationSalles sessions={periode} />

      {sessionSelection && (
        <SessionDrawer
          session={sessionSelection}
          sessions={sessions}
          onClose={() => setSelection(null)}
          onOuvrirFormateur={(id) => setFicheFormateur(id)}
          onNotifier={(m) => notifier(m)}
        />
      )}

      {ficheFormateur && (
        <FicheFormateur
          formateur={FORMATEURS.find((f) => f.id === ficheFormateur)!}
          charge={charges.find((c) => c.formateurId === ficheFormateur)!}
          sessions={filtrees}
          onClose={() => setFicheFormateur(null)}
        />
      )}

      {creation && (
        <NouvelleSession
          sessions={sessions}
          initial={creation}
          onClose={() => setCreation(null)}
          onCree={(m) => notifier(m)}
        />
      )}
    </>
  );
}

function OccupationSalles({ sessions }: { sessions: SessionPlanning[] }) {
  return (
    <Panel className="mt-4" title="Occupation des salles" subtitle="Heures occupées sur la période affichée" bodyClassName="p-0">
      <ul className="divide-y divide-border">
        {SALLES.map((s) => {
          const siennes = sessions.filter((x) => x.salleId === s.id && x.statut !== "Annulée");
          const h = Math.round((siennes.reduce((a, x) => a + dureeMin(x), 0) / 60) * 10) / 10;
          const taux = Math.min(100, Math.round((h / 40) * 100));
          return (
            <li key={s.id} className="flex flex-wrap items-center gap-3 px-4 py-2.5 text-xs">
              <span className="w-28 font-medium">{s.nom}</span>
              <span className="w-40 text-muted-foreground">
                {s.type} · {s.site}
              </span>
              <span className="num w-20 text-muted-foreground">{s.capacite} places</span>
              <div className="h-1.5 w-40 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full bg-[var(--brand)]"
                  style={{ width: `${taux}%` }}
                />
              </div>
              <span className="num w-16">{h} h</span>
              <span className="num text-muted-foreground">{siennes.length} session(s)</span>
              <Tag ton={taux >= 90 ? "critical" : taux >= 60 ? "warning" : "success"} className="ml-auto">
                {taux >= 90 ? "Saturée" : taux >= 60 ? "Bien occupée" : "Disponible"}
              </Tag>
            </li>
          );
        })}
      </ul>
    </Panel>
  );
}
