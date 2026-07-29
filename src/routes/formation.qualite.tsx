import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Btn, Kpi, Onglets, PageHeader, Panel, Select, Table, Tag, Td, Th, Tr, Vide } from "@/components/leoni/kit";
import { RECLAMATIONS, SITES } from "@/data/leoni";
import {
  CATEGORIES_FEEDBACK,
  EVOLUTION_ALERTES,
  INCIDENTS_PAR_FORMATION,
  OBSERVATIONS_PAR_TON,
  STATUTS_ACTION,
  TYPES_ALERTE_FORMATION,
  TYPES_INCIDENT,
} from "@/data/formation-suivi";
import { actionsFormation, useFormation } from "@/lib/formation-store";
import { useLeoni } from "@/lib/leoni-store";

const ONGLETS = [
  "Vue d'ensemble",
  "Observations",
  "Alertes",
  "Actions correctives",
  "Feedbacks",
  "Incidents",
  "Réclamations",
] as const;

export const Route = createFileRoute("/formation/qualite")({
  validateSearch: (s: Record<string, unknown>) => ({
    onglet: (typeof s.onglet === "string" && (ONGLETS as readonly string[]).includes(s.onglet)
      ? s.onglet
      : "Vue d'ensemble") as string,
  }),
  head: () => ({
    meta: [
      { title: "Suivi & qualité de la formation — LEONI Workforce Journey" },
      {
        name: "description",
        content:
          "Observations formateur, alertes, actions correctives, feedbacks, incidents et réclamations liés à la formation des opérateurs LEONI.",
      },
      { property: "og:title", content: "Suivi & qualité de la formation — LEONI Workforce Journey" },
      { property: "og:description", content: "Qualité pédagogique, alertes et actions correctives du parcours de formation." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: QualitePage,
});

const COULEURS = ["var(--brand)", "var(--info)", "var(--warning)", "var(--critical)", "var(--success)"];

function QualitePage() {
  const { onglet } = Route.useSearch();
  const navigate = useNavigate();
  const setOnglet = (v: string) => navigate({ to: "/formation/qualite", search: { onglet: v } });
  const { ouvriers, pousserNotification } = useLeoni();
  const { actions, alertes, feedbacks, incidents } = useFormation();

  const notifier = (detail: string) => pousserNotification({ titre: "Suivi & qualité", detail, ton: "success" });

  const observations = useMemo(
    () => ouvriers.flatMap((o) => o.evenements.map((e) => ({ ...e, ouvrier: o.nom, ouvrierId: o.id, site: o.site, groupe: o.groupe }))),
    [ouvriers],
  );

  const [tonalite, setTonalite] = useState("Toutes les tonalités");
  const [siteObs, setSiteObs] = useState("Tous les sites");
  const [typeAlerte, setTypeAlerte] = useState("Tous les types");
  const [statutAlerte, setStatutAlerte] = useState("Tous les statuts");
  const [statutAction, setStatutAction] = useState("Tous les statuts");
  const [categorieFb, setCategorieFb] = useState("Toutes les catégories");
  const [typeIncident, setTypeIncident] = useState("Tous les types");

  const tonObs = (t: string) =>
    t === "Positive" ? "success" : t === "Critique" ? "critical" : t === "Négative" ? "warning" : "neutral";

  const observationsFiltrees = observations.filter(
    (o) =>
      (tonalite === "Toutes les tonalités" || o.tonalite === tonalite) && (siteObs === "Tous les sites" || o.site === siteObs),
  );

  const alertesOuvertes = alertes.filter((a) => a.statut !== "Résolue");
  const actionsOuvertes = actions.filter((a) => !["Terminée", "Annulée"].includes(a.statut));

  return (
    <>
      <PageHeader
        titre="Suivi & qualité"
        sousTitre="Observations formateur, alertes, actions correctives, feedbacks et incidents du parcours de formation"
        fil={[{ label: "Formation" }, { label: "Suivi & qualité" }]}
        actions={
          <>
            <Btn onClick={() => setOnglet("Alertes")}>Alertes ouvertes ({alertesOuvertes.length})</Btn>
            <Btn variant="primary" onClick={() => notifier("Nouvelle observation ajoutée au dossier de l'opérateur.")}>
              + Nouvelle observation
            </Btn>
          </>
        }
      />

      <Onglets valeurs={[...ONGLETS]} actif={onglet} onChange={setOnglet} />

      {onglet === "Vue d'ensemble" && (
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            <Kpi label="Observations" valeur={observations.length} ton="brand" />
            <Kpi label="Alertes ouvertes" valeur={alertesOuvertes.length} ton="critical" />
            <Kpi label="Actions correctives" valeur={actionsOuvertes.length} ton="warning" />
            <Kpi label="Feedbacks reçus" valeur={feedbacks.length} ton="info" />
            <Kpi label="Incidents" valeur={incidents.length} ton="neutral" />
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <Panel title="Répartition des observations" subtitle="Par tonalité">
              <ResponsiveContainer width="100%" height={230}>
                <PieChart>
                  <Pie data={OBSERVATIONS_PAR_TON} dataKey="valeur" nameKey="nom" innerRadius={45} outerRadius={80}>
                    {OBSERVATIONS_PAR_TON.map((_, i) => (
                      <Cell key={i} fill={COULEURS[i % COULEURS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </Panel>
            <Panel title="Évolution des alertes" subtitle="Ouvertes vs résolues par semaine">
              <ResponsiveContainer width="100%" height={230}>
                <LineChart data={EVOLUTION_ALERTES}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="semaine" fontSize={11} />
                  <YAxis fontSize={11} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Line type="monotone" dataKey="ouvertes" stroke="var(--critical)" strokeWidth={2} />
                  <Line type="monotone" dataKey="resolues" stroke="var(--success)" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </Panel>
            <Panel title="Incidents par formation">
              <ResponsiveContainer width="100%" height={230}>
                <BarChart data={INCIDENTS_PAR_FORMATION}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="nom" fontSize={10} interval={0} angle={-12} textAnchor="end" height={50} />
                  <YAxis fontSize={11} />
                  <Tooltip />
                  <Bar dataKey="valeur" fill="var(--brand)" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Panel>
          </div>

          <Panel title="Priorités du jour" subtitle="Alertes critiques et actions en retard" bodyClassName="p-0">
            <Table>
              <thead>
                <tr>
                  <Th>Référence</Th>
                  <Th>Opérateur</Th>
                  <Th>Groupe</Th>
                  <Th>Sujet</Th>
                  <Th>Priorité</Th>
                  <Th>Responsable</Th>
                  <Th>Statut</Th>
                </tr>
              </thead>
              <tbody>
                {alertes
                  .filter((a) => a.priorite === "Critique" || a.priorite === "Haute")
                  .map((a) => (
                    <Tr key={a.id}>
                      <Td className="num text-xs text-[var(--brand)]">{a.id}</Td>
                      <Td className="font-medium">{a.ouvrier}</Td>
                      <Td>{a.groupe}</Td>
                      <Td className="text-muted-foreground">{a.origine}</Td>
                      <Td>
                        <Tag ton={a.priorite === "Critique" ? "critical" : "warning"}>{a.priorite}</Tag>
                      </Td>
                      <Td className="text-muted-foreground">{a.responsable}</Td>
                      <Td>
                        <Tag ton={a.statut === "Résolue" ? "success" : a.statut === "En traitement" ? "info" : "warning"}>
                          {a.statut}
                        </Tag>
                      </Td>
                    </Tr>
                  ))}
              </tbody>
            </Table>
          </Panel>
        </div>
      )}

      {onglet === "Observations" && (
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Kpi label="Observations" valeur={observationsFiltrees.length} ton="brand" />
            <Kpi label="Positives" valeur={observationsFiltrees.filter((o) => o.tonalite === "Positive").length} ton="success" />
            <Kpi label="Négatives" valeur={observationsFiltrees.filter((o) => o.tonalite === "Négative").length} ton="warning" />
            <Kpi label="Critiques" valeur={observationsFiltrees.filter((o) => o.tonalite === "Critique").length} ton="critical" />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Select
              value={tonalite}
              onChange={setTonalite}
              options={["Toutes les tonalités", "Positive", "Neutre", "Négative", "Critique"]}
            />
            <Select value={siteObs} onChange={setSiteObs} options={["Tous les sites", ...SITES]} />
            <span className="ml-auto text-xs text-muted-foreground">{observationsFiltrees.length} entrée(s)</span>
          </div>
          <Panel title="Journal des observations formateur" subtitle="Double-cliquer pour ouvrir la fiche ouvrier" bodyClassName="p-0">
            <Table>
              <thead>
                <tr>
                  <Th>Date</Th>
                  <Th>Opérateur</Th>
                  <Th>Groupe</Th>
                  <Th>Site</Th>
                  <Th>Type</Th>
                  <Th>Auteur</Th>
                  <Th>Tonalité</Th>
                  <Th>Observation</Th>
                </tr>
              </thead>
              <tbody>
                {observationsFiltrees.map((e) => (
                  <Tr
                    key={e.ouvrierId + e.id}
                    onDoubleClick={() => navigate({ to: "/ouvriers/$id", params: { id: e.ouvrierId } })}
                    title="Double-cliquer pour ouvrir la fiche ouvrier"
                  >
                    <Td className="num text-xs">{e.date}</Td>
                    <Td className="font-medium">{e.ouvrier}</Td>
                    <Td>{e.groupe}</Td>
                    <Td className="text-muted-foreground">{e.site}</Td>
                    <Td className="text-muted-foreground">{e.type}</Td>
                    <Td className="text-muted-foreground">{e.auteur}</Td>
                    <Td>
                      <Tag ton={tonObs(e.tonalite)}>{e.tonalite}</Tag>
                    </Td>
                    <Td className="max-w-96 truncate text-xs text-muted-foreground">
                      {e.titre} — {e.contenu}
                    </Td>
                  </Tr>
                ))}
                {observationsFiltrees.length === 0 && (
                  <tr>
                    <td colSpan={8}>
                      <Vide texte="Aucune observation pour ces filtres." />
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </Panel>
        </div>
      )}

      {onglet === "Alertes" && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Select value={typeAlerte} onChange={setTypeAlerte} options={["Tous les types", ...TYPES_ALERTE_FORMATION]} />
            <Select
              value={statutAlerte}
              onChange={setStatutAlerte}
              options={["Tous les statuts", "Ouverte", "En traitement", "Résolue"]}
            />
            <span className="ml-auto text-xs text-muted-foreground">{alertes.length} alerte(s)</span>
          </div>
          <Panel title="Alertes formation" subtitle="Générées par les scores, présences, observations et incidents" bodyClassName="p-0">
            <Table>
              <thead>
                <tr>
                  <Th>Référence</Th>
                  <Th>Date</Th>
                  <Th>Opérateur</Th>
                  <Th>Groupe</Th>
                  <Th>Type</Th>
                  <Th>Origine</Th>
                  <Th>Priorité</Th>
                  <Th>Responsable</Th>
                  <Th>Action</Th>
                  <Th>Statut</Th>
                  <Th />
                </tr>
              </thead>
              <tbody>
                {alertes
                  .filter(
                    (a) =>
                      (typeAlerte === "Tous les types" || a.type === typeAlerte) &&
                      (statutAlerte === "Tous les statuts" || a.statut === statutAlerte),
                  )
                  .map((a) => (
                    <Tr key={a.id}>
                      <Td className="num text-xs text-[var(--brand)]">{a.id}</Td>
                      <Td className="num text-xs">{a.date}</Td>
                      <Td className="font-medium">{a.ouvrier}</Td>
                      <Td>{a.groupe}</Td>
                      <Td className="text-muted-foreground">{a.type}</Td>
                      <Td className="text-muted-foreground">{a.origine}</Td>
                      <Td>
                        <Tag ton={a.priorite === "Critique" ? "critical" : a.priorite === "Haute" ? "warning" : "neutral"}>
                          {a.priorite}
                        </Tag>
                      </Td>
                      <Td className="text-muted-foreground">{a.responsable}</Td>
                      <Td className="text-xs text-muted-foreground">{a.action}</Td>
                      <Td>
                        <Tag ton={a.statut === "Résolue" ? "success" : a.statut === "En traitement" ? "info" : "warning"}>
                          {a.statut}
                        </Tag>
                      </Td>
                      <Td>
                        {a.statut !== "Résolue" && (
                          <Btn
                            size="sm"
                            onClick={() => {
                              actionsFormation.changerStatutAlerte(a.id, a.statut === "Ouverte" ? "En traitement" : "Résolue");
                              notifier(`Alerte ${a.id} mise à jour`);
                            }}
                          >
                            {a.statut === "Ouverte" ? "Prendre en charge" : "Clôturer"}
                          </Btn>
                        )}
                      </Td>
                    </Tr>
                  ))}
              </tbody>
            </Table>
          </Panel>
        </div>
      )}

      {onglet === "Actions correctives" && (
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Kpi label="Actions ouvertes" valeur={actionsOuvertes.length} ton="warning" />
            <Kpi label="En cours" valeur={actions.filter((a) => a.statut === "En cours").length} ton="info" />
            <Kpi label="Terminées" valeur={actions.filter((a) => a.statut === "Terminée").length} ton="success" />
            <Kpi label="Critiques" valeur={actions.filter((a) => a.priorite === "Critique").length} ton="critical" />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Select value={statutAction} onChange={setStatutAction} options={["Tous les statuts", ...STATUTS_ACTION]} />
            <span className="ml-auto text-xs text-muted-foreground">{actions.length} action(s)</span>
          </div>
          <Panel title="Actions correctives" subtitle="Issues des évaluations, du suivi quotidien et des incidents" bodyClassName="p-0">
            <Table>
              <thead>
                <tr>
                  <Th>Référence</Th>
                  <Th>Opérateur</Th>
                  <Th>Groupe</Th>
                  <Th>Origine</Th>
                  <Th>Problème</Th>
                  <Th>Action</Th>
                  <Th>Responsable</Th>
                  <Th>Échéance</Th>
                  <Th>Priorité</Th>
                  <Th>Statut</Th>
                  <Th />
                </tr>
              </thead>
              <tbody>
                {actions
                  .filter((a) => statutAction === "Tous les statuts" || a.statut === statutAction)
                  .map((a) => (
                    <Tr key={a.id}>
                      <Td className="num text-xs text-[var(--brand)]">{a.id}</Td>
                      <Td className="font-medium">{a.ouvrier}</Td>
                      <Td>{a.groupe}</Td>
                      <Td className="text-muted-foreground">{a.origine}</Td>
                      <Td className="max-w-64 text-xs text-muted-foreground">{a.probleme}</Td>
                      <Td className="max-w-64 text-xs">{a.action}</Td>
                      <Td className="text-muted-foreground">{a.responsable}</Td>
                      <Td className="num text-xs">{a.echeance}</Td>
                      <Td>
                        <Tag ton={a.priorite === "Critique" ? "critical" : a.priorite === "Haute" ? "warning" : "neutral"}>
                          {a.priorite}
                        </Tag>
                      </Td>
                      <Td>
                        <Tag
                          ton={
                            a.statut === "Terminée"
                              ? "success"
                              : a.statut === "Annulée"
                                ? "neutral"
                                : a.statut === "En cours"
                                  ? "info"
                                  : "warning"
                          }
                        >
                          {a.statut}
                        </Tag>
                      </Td>
                      <Td>
                        {!["Terminée", "Annulée"].includes(a.statut) && (
                          <Btn
                            size="sm"
                            onClick={() => {
                              actionsFormation.changerStatutAction(a.id, a.statut === "À faire" ? "En cours" : "Terminée");
                              notifier(`Action ${a.id} mise à jour`);
                            }}
                          >
                            {a.statut === "À faire" ? "Démarrer" : "Terminer"}
                          </Btn>
                        )}
                      </Td>
                    </Tr>
                  ))}
              </tbody>
            </Table>
          </Panel>
        </div>
      )}

      {onglet === "Feedbacks" && (
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Kpi label="Feedbacks" valeur={feedbacks.length} ton="brand" />
            <Kpi label="Positifs" valeur={feedbacks.filter((f) => f.sentiment === "Positif").length} ton="success" />
            <Kpi label="Critiques" valeur={feedbacks.filter((f) => f.sentiment === "Critique").length} ton="critical" />
            <Kpi label="Non traités" valeur={feedbacks.filter((f) => !f.traite).length} ton="warning" />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Select
              value={categorieFb}
              onChange={setCategorieFb}
              options={["Toutes les catégories", ...CATEGORIES_FEEDBACK]}
            />
            <span className="ml-auto text-xs text-muted-foreground">{feedbacks.length} feedback(s)</span>
          </div>
          <Panel title="Feedbacks des opérateurs sur la formation" bodyClassName="p-0">
            <Table>
              <thead>
                <tr>
                  <Th>Date</Th>
                  <Th>Opérateur</Th>
                  <Th>Groupe</Th>
                  <Th>Site</Th>
                  <Th>Catégorie</Th>
                  <Th>Sentiment</Th>
                  <Th>Message</Th>
                  <Th>Traitement</Th>
                </tr>
              </thead>
              <tbody>
                {feedbacks
                  .filter((f) => categorieFb === "Toutes les catégories" || f.categorie === categorieFb)
                  .map((f) => (
                    <Tr key={f.id}>
                      <Td className="num text-xs">{f.date}</Td>
                      <Td className="font-medium">{f.ouvrier}</Td>
                      <Td>{f.groupe}</Td>
                      <Td className="text-muted-foreground">{f.site}</Td>
                      <Td className="text-muted-foreground">{f.categorie}</Td>
                      <Td>
                        <Tag ton={f.sentiment === "Positif" ? "success" : f.sentiment === "Critique" ? "critical" : "neutral"}>
                          {f.sentiment}
                        </Tag>
                      </Td>
                      <Td className="max-w-96 text-xs text-muted-foreground">{f.message}</Td>
                      <Td>
                        {f.traite ? (
                          <Tag ton="success">Traité</Tag>
                        ) : (
                          <Btn
                            size="sm"
                            onClick={() => {
                              actionsFormation.traiterFeedback(f.id);
                              notifier(`Feedback ${f.id} traité`);
                            }}
                          >
                            Traiter
                          </Btn>
                        )}
                      </Td>
                    </Tr>
                  ))}
              </tbody>
            </Table>
          </Panel>
        </div>
      )}

      {onglet === "Incidents" && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Select value={typeIncident} onChange={setTypeIncident} options={["Tous les types", ...TYPES_INCIDENT]} />
            <span className="ml-auto text-xs text-muted-foreground">{incidents.length} incident(s)</span>
          </div>
          <Panel title="Incidents survenus en formation" bodyClassName="p-0">
            <Table>
              <thead>
                <tr>
                  <Th>Référence</Th>
                  <Th>Date</Th>
                  <Th>Type</Th>
                  <Th>Session</Th>
                  <Th>Groupe</Th>
                  <Th>Site</Th>
                  <Th>Opérateur</Th>
                  <Th>Description</Th>
                  <Th>Gravité</Th>
                  <Th>Action immédiate</Th>
                  <Th>Statut</Th>
                  <Th />
                </tr>
              </thead>
              <tbody>
                {incidents
                  .filter((i) => typeIncident === "Tous les types" || i.type === typeIncident)
                  .map((i) => (
                    <Tr key={i.id}>
                      <Td className="num text-xs text-[var(--brand)]">{i.id}</Td>
                      <Td className="num text-xs">{i.date}</Td>
                      <Td className="text-muted-foreground">{i.type}</Td>
                      <Td className="text-xs">{i.session}</Td>
                      <Td>{i.groupe}</Td>
                      <Td className="text-muted-foreground">{i.site}</Td>
                      <Td className="font-medium">{i.ouvrier}</Td>
                      <Td className="max-w-80 text-xs text-muted-foreground">{i.description}</Td>
                      <Td>
                        <Tag ton={i.gravite === "Critique" || i.gravite === "Majeure" ? "critical" : i.gravite === "Modérée" ? "warning" : "neutral"}>
                          {i.gravite}
                        </Tag>
                      </Td>
                      <Td className="max-w-64 text-xs">{i.actionImmediate}</Td>
                      <Td>
                        <Tag ton={i.statut === "Clôturé" ? "success" : i.statut === "En traitement" ? "info" : "warning"}>
                          {i.statut}
                        </Tag>
                      </Td>
                      <Td>
                        {i.statut !== "Clôturé" && (
                          <Btn
                            size="sm"
                            onClick={() => {
                              actionsFormation.changerStatutIncident(i.id, i.statut === "Ouvert" ? "En traitement" : "Clôturé");
                              notifier(`Incident ${i.id} mis à jour`);
                            }}
                          >
                            {i.statut === "Ouvert" ? "Traiter" : "Clôturer"}
                          </Btn>
                        )}
                      </Td>
                    </Tr>
                  ))}
              </tbody>
            </Table>
          </Panel>
        </div>
      )}

      {onglet === "Réclamations" && (
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Kpi label="Réclamations" valeur={RECLAMATIONS.length} ton="brand" />
            <Kpi label="En cours" valeur={RECLAMATIONS.filter((r) => r.statut === "En cours").length} ton="info" />
            <Kpi label="Résolues" valeur={RECLAMATIONS.filter((r) => r.statut === "Résolue").length} ton="success" />
            <Kpi label="Critiques" valeur={RECLAMATIONS.filter((r) => r.priorite === "Critique").length} ton="critical" />
          </div>
          <Panel title="Réclamations des opérateurs" subtitle="Suivi détaillé disponible dans le module dédié" bodyClassName="p-0">
            <Table>
              <thead>
                <tr>
                  <Th>Référence</Th>
                  <Th>Date</Th>
                  <Th>Objet</Th>
                  <Th>Opérateur</Th>
                  <Th>Site</Th>
                  <Th>Catégorie</Th>
                  <Th>Priorité</Th>
                  <Th>Responsable</Th>
                  <Th>Statut</Th>
                </tr>
              </thead>
              <tbody>
                {RECLAMATIONS.map((r) => (
                  <Tr key={r.id}>
                    <Td className="num text-xs text-[var(--brand)]">{r.id}</Td>
                    <Td className="num text-xs">{r.date}</Td>
                    <Td className="font-medium">{r.objet}</Td>
                    <Td>{r.ouvrier}</Td>
                    <Td className="text-muted-foreground">{r.site}</Td>
                    <Td className="text-muted-foreground">{r.categorie}</Td>
                    <Td>
                      <Tag ton={r.priorite === "Critique" ? "critical" : r.priorite === "Élevée" ? "warning" : "neutral"}>
                        {r.priorite}
                      </Tag>
                    </Td>
                    <Td className="text-muted-foreground">{r.responsable}</Td>
                    <Td>
                      <Tag ton={r.statut === "Résolue" ? "success" : r.statut === "En cours" ? "info" : "warning"}>{r.statut}</Tag>
                    </Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
          </Panel>
        </div>
      )}
    </>
  );
}
