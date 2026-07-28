import { createFileRoute, useNavigate } from "@tanstack/react-router";
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
import {
  EVOLUTION_MENSUELLE,
  FUNNEL,
  POPULATION_RISQUE,
  REPARTITION_SITES,
  RESULTATS_FORMATION,
  TAUX_PRESENCE_GLOBAL,
} from "@/data/leoni";
import { Btn, Kpi, PageHeader, Panel, Table, Tag, Td, Th, Tr } from "@/components/leoni/kit";
import { useLeoni } from "@/lib/leoni-store";

const VUES = ["Recrutement", "Formation", "Présence", "Performance", "Risques", "Réclamations"];

export const Route = createFileRoute("/reporting")({
  validateSearch: (s: Record<string, unknown>) => ({
    vue: typeof s.vue === "string" && VUES.includes(s.vue) ? s.vue : "Recrutement",
  }),
  head: () => ({
    meta: [
      { title: "Reporting & analyses — LEONI Workforce Journey" },
      { name: "description", content: "Tableaux de bord LEONI Maroc : recrutement, formation, présence, performance, risques et réclamations, exportables en Excel." },
      { property: "og:title", content: "Reporting & analyses — LEONI Workforce Journey" },
      { property: "og:description", content: "Analyses consolidées du recrutement, de la formation et de la performance." },
    ],
  }),
  component: ReportingPage,
});

const COULEURS = ["var(--brand)", "var(--info)", "var(--success)", "var(--warning)", "var(--critical)"];

function ReportingPage() {
  const { vue } = Route.useSearch();
  const navigate = useNavigate();
  const { ouvriers, candidats, reclamations, pousserNotification } = useLeoni();

  return (
    <>
      <PageHeader
        titre="Reporting & analyses"
        sousTitre="Indicateurs consolidés multi-sites, actualisés à chaque action réalisée dans l'application"
        fil={[{ label: "Reporting" }, { label: vue }]}
        actions={
          <Btn variant="secondary" onClick={() => pousserNotification({ titre: "Export lancé", detail: `Rapport « ${vue} » généré au format Excel.`, ton: "success" })}>
            Export Excel
          </Btn>
        }
      />

      <div className="mb-4 flex flex-wrap gap-2">
        {VUES.map((v) => (
          <button
            key={v}
            onClick={() => navigate({ to: "/reporting", search: { vue: v } })}
            className={
              v === vue
                ? "rounded-sm border border-[var(--brand)] bg-[var(--selected)] px-3 py-1.5 text-xs font-medium text-[var(--brand)]"
                : "rounded-sm border border-border px-3 py-1.5 text-xs text-muted-foreground hover:bg-[var(--hover)]"
            }
          >
            {v}
          </button>
        ))}
      </div>

      {vue === "Recrutement" && (
        <>
          <div className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Kpi label="Candidatures suivies" valeur={candidats.length} ton="brand" />
            <Kpi label="Taux de conversion" valeur={17} suffixe="%" ton="success" />
            <Kpi label="Délai moyen de traitement" valeur="6,4 j" ton="info" />
            <Kpi label="Score IA moyen" valeur={Math.round(candidats.reduce((s, c) => s + c.score, 0) / candidats.length)} suffixe="%" ton="warning" />
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <Panel title="Entonnoir de recrutement">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={FUNNEL} layout="vertical" margin={{ left: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis type="number" stroke="var(--muted-foreground)" fontSize={11} />
                  <YAxis type="category" dataKey="etape" stroke="var(--muted-foreground)" fontSize={11} width={130} />
                  <Tooltip />
                  <Bar dataKey="valeur" fill="var(--brand)" radius={[0, 3, 3, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Panel>
            <Panel title="Répartition par site">
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={REPARTITION_SITES} dataKey="valeur" nameKey="site" outerRadius={95} label>
                    {REPARTITION_SITES.map((_, i) => (
                      <Cell key={i} fill={COULEURS[i % COULEURS.length]} />
                    ))}
                  </Pie>
                  <Legend />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Panel>
          </div>
        </>
      )}

      {vue === "Formation" && (
        <>
          <div className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Kpi label="Opérateurs en formation" valeur={ouvriers.filter((o) => o.statut === "En formation").length} ton="brand" />
            <Kpi label="Score pédagogique moyen" valeur={Math.round(ouvriers.reduce((s, o) => s + o.score, 0) / ouvriers.length)} suffixe="%" ton="success" />
            <Kpi label="Taux de réussite QCM" valeur={82} suffixe="%" ton="info" />
            <Kpi label="Rattrapages en cours" valeur={4} ton="warning" />
          </div>
          <Panel title="Résultats de formation par module">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={RESULTATS_FORMATION}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="module" stroke="var(--muted-foreground)" fontSize={11} />
                <YAxis stroke="var(--muted-foreground)" fontSize={11} />
                <Tooltip />
                <Legend />
                <Bar dataKey="reussite" name="Réussite %" fill="var(--success)" radius={[3, 3, 0, 0]} />
                <Bar dataKey="echec" name="Échec %" fill="var(--critical)" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Panel>
        </>
      )}

      {vue === "Présence" && (
        <>
          <div className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Kpi label="Taux de présence global" valeur={TAUX_PRESENCE_GLOBAL} suffixe="%" ton="success" />
            <Kpi label="Ponctualité moyenne" valeur={Math.round(ouvriers.reduce((s, o) => s + o.ponctualite, 0) / ouvriers.length)} suffixe="%" ton="info" />
            <Kpi label="Opérateurs sous 80 %" valeur={ouvriers.filter((o) => o.presence < 80).length} ton="critical" />
            <Kpi label="Absences du mois" valeur={38} ton="warning" />
          </div>
          <Panel title="Présence par opérateur" bodyClassName="p-0">
            <Table>
              <thead><tr><Th>Opérateur</Th><Th>Site</Th><Th>Présence</Th><Th>Ponctualité</Th><Th>Statut</Th></tr></thead>
              <tbody>
                {ouvriers.map((o) => (
                  <Tr key={o.id}>
                    <Td className="font-medium">{o.nom}</Td>
                    <Td className="text-muted-foreground">{o.site}</Td>
                    <Td className="num">{o.presence} %</Td>
                    <Td className="num">{o.ponctualite} %</Td>
                    <Td><Tag ton={o.presence >= 90 ? "success" : o.presence >= 80 ? "warning" : "critical"}>{o.statut}</Tag></Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
          </Panel>
        </>
      )}

      {vue === "Performance" && (
        <Panel title="Évolution mensuelle" subtitle="Candidatures, recrutements et intégrations">
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={EVOLUTION_MENSUELLE}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="mois" stroke="var(--muted-foreground)" fontSize={11} />
              <YAxis stroke="var(--muted-foreground)" fontSize={11} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="candidatures" stroke="var(--brand)" strokeWidth={2} />
              <Line type="monotone" dataKey="recrutes" stroke="var(--success)" strokeWidth={2} />
              <Line type="monotone" dataKey="integres" stroke="var(--info)" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </Panel>
      )}

      {vue === "Risques" && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Panel title="Population par niveau de risque">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={POPULATION_RISQUE} dataKey="valeur" nameKey="niveau" outerRadius={100} label>
                  {POPULATION_RISQUE.map((_, i) => (
                    <Cell key={i} fill={COULEURS[i % COULEURS.length]} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Panel>
          <Panel title="Opérateurs les plus exposés" bodyClassName="p-0">
            <Table>
              <thead><tr><Th>Opérateur</Th><Th>Score</Th><Th>Présence</Th><Th>Risque</Th></tr></thead>
              <tbody>
                {[...ouvriers].sort((a, b) => a.score - b.score).slice(0, 8).map((o) => (
                  <Tr key={o.id}>
                    <Td className="font-medium">{o.nom}</Td>
                    <Td className="num">{o.score} %</Td>
                    <Td className="num">{o.presence} %</Td>
                    <Td><Tag ton={o.risque === "Critique" ? "critical" : o.risque === "Élevé" ? "warning" : "success"}>{o.risque}</Tag></Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
          </Panel>
        </div>
      )}

      {vue === "Réclamations" && (
        <>
          <div className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Kpi label="Réclamations totales" valeur={reclamations.length} ton="brand" />
            <Kpi label="Critiques" valeur={reclamations.filter((r) => r.priorite === "Critique").length} ton="critical" />
            <Kpi label="Résolues" valeur={reclamations.filter((r) => ["Résolue", "Clôturée"].includes(r.statut)).length} ton="success" />
            <Kpi label="Délai moyen de résolution" valeur="2,8 j" ton="info" />
          </div>
          <Panel title="Réclamations par catégorie">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart
                data={[...new Set(reclamations.map((r) => r.categorie))].map((c) => ({
                  categorie: c,
                  total: reclamations.filter((r) => r.categorie === c).length,
                }))}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="categorie" stroke="var(--muted-foreground)" fontSize={11} />
                <YAxis stroke="var(--muted-foreground)" fontSize={11} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="total" fill="var(--brand)" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Panel>
        </>
      )}
    </>
  );
}
