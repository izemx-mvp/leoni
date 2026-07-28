import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ArrowUpRight, Download } from "lucide-react";
import {
  ALERTES,
  EVOLUTION_MENSUELLE,
  FUNNEL,
  KPIS,
  POPULATION_RISQUE,
  REPARTITION_SITES,
  RESULTATS_FORMATION,
  SITES,
  TAUX_PRESENCE_GLOBAL,
} from "@/data/leoni";
import { Barre, Btn, Kpi, Panel, PageHeader, Select, Tag, Table, Td, Th, Tr } from "@/components/leoni/kit";
import { useLeoni } from "@/lib/leoni-store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Pilotage Workforce — LEONI Workforce Journey" },
      {
        name: "description",
        content:
          "Pilotage du recrutement, de la formation et de l'intégration des opérateurs LEONI Maroc : KPI, funnel, risques et alertes multi-sites.",
      },
      { property: "og:title", content: "Pilotage Workforce — LEONI Workforce Journey" },
      {
        property: "og:description",
        content: "Tableau de bord multi-sites du parcours candidat et opérateur.",
      },
    ],
  }),
  component: Dashboard,
});

const tooltipStyle = {
  backgroundColor: "var(--popover)",
  border: "1px solid var(--border)",
  borderRadius: 6,
  fontSize: 12,
  color: "var(--popover-foreground)",
};

function Dashboard() {
  const { alertes, site, setSite } = useLeoni();
  const [periode, setPeriode] = useState("7 derniers jours");
  const [departement, setDepartement] = useState("Tous les départements");
  const [poste, setPoste] = useState("Tous les postes");

  return (
    <>
      <PageHeader
        titre="Pilotage Workforce"
        sousTitre="Vue consolidée du recrutement, de la formation et de l'intégration des opérateurs — LEONI Maroc"
        fil={[{ label: "Pilotage" }, { label: "Dashboard global" }]}
        actions={
          <>
            <Btn variant="secondary">
              <Download className="size-3.5" /> Exporter
            </Btn>
            <Btn variant="primary">Nouvelle campagne</Btn>
          </>
        }
      />

      <div className="mb-5 flex flex-wrap items-center gap-2 rounded-md border border-border bg-card p-2">
        <span className="label-xs px-1.5">Filtres</span>
        <Select value={periode} onChange={setPeriode} options={["7 derniers jours", "30 derniers jours", "Trimestre en cours", "Année 2026"]} />
        <Select value={site} onChange={setSite} options={["Tous les sites", ...SITES]} />
        <Select value={departement} onChange={setDepartement} options={["Tous les départements", "Production câblage", "Qualité", "Maintenance", "Coupe"]} />
        <Select value={poste} onChange={setPoste} options={["Tous les postes", "Opérateur câblage", "Opératrice assemblage", "Contrôleur qualité", "Opérateur coupe", "Technicien ligne"]} />
        <span className="ml-auto px-2 text-xs text-muted-foreground">
          Données au 28/07/2026 — 08:15
        </span>
      </div>

      <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {KPIS.map((k) => (
          <Kpi key={k.label} label={k.label} valeur={k.valeur} delta={k.delta} ton={k.ton as never} />
        ))}
      </div>

      <div className="mb-5 grid gap-4 xl:grid-cols-3">
        <Panel title="Funnel de recrutement" subtitle="Du dépôt de candidature à l'intégration" className="xl:col-span-2">
          <div className="space-y-2.5">
            {FUNNEL.map((f, i) => {
              const pct = Math.round((f.valeur / FUNNEL[0].valeur) * 100);
              return (
                <div key={f.etape} className="flex items-center gap-3">
                  <span className="w-32 shrink-0 text-xs text-muted-foreground">{f.etape}</span>
                  <div className="h-6 flex-1 overflow-hidden rounded-sm bg-muted">
                    <div
                      className="flex h-full items-center justify-end rounded-sm px-2 text-[11px] font-semibold text-[var(--brand-foreground)]"
                      style={{
                        width: `${pct}%`,
                        background: `color-mix(in oklab, var(--brand) ${100 - i * 9}%, var(--brand-2))`,
                      }}
                    >
                      {f.valeur.toLocaleString("fr-FR")}
                    </div>
                  </div>
                  <span className="num w-10 text-right text-xs text-muted-foreground">{pct} %</span>
                </div>
              );
            })}
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Taux de conversion global candidature → intégration : <strong className="text-foreground">5,7 %</strong>
          </p>
        </Panel>

        <Panel title="Taux de présence" subtitle="Population en formation, tous sites">
          <div className="flex items-center gap-5">
            <div className="relative flex size-28 items-center justify-center">
              <svg viewBox="0 0 36 36" className="size-28 -rotate-90">
                <circle cx="18" cy="18" r="15.5" fill="none" stroke="var(--muted)" strokeWidth="3" />
                <circle
                  cx="18"
                  cy="18"
                  r="15.5"
                  fill="none"
                  stroke="var(--brand)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray={`${TAUX_PRESENCE_GLOBAL} 100`}
                  pathLength={100}
                />
              </svg>
              <span className="num absolute text-xl font-semibold">{TAUX_PRESENCE_GLOBAL} %</span>
            </div>
            <div className="space-y-2 text-xs">
              <p className="text-muted-foreground">Objectif groupe : 95 %</p>
              <p>Absences aujourd'hui : <strong>28</strong></p>
              <p>Retards aujourd'hui : <strong>41</strong></p>
              <p>Autorisations : <strong>12</strong></p>
            </div>
          </div>
          <div className="mt-5 space-y-3">
            <p className="label-xs">Population à risque</p>
            {POPULATION_RISQUE.map((r) => (
              <div key={r.niveau} className="flex items-center gap-3">
                <span className="w-14 text-xs text-muted-foreground">{r.niveau}</span>
                <Barre
                  valeur={(r.nombre / 214) * 100}
                  ton={r.niveau === "Faible" ? "success" : r.niveau === "Moyen" ? "warning" : "critical"}
                />
                <span className="num w-8 text-right text-xs">{r.nombre}</span>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <div className="mb-5 grid gap-4 xl:grid-cols-3">
        <Panel title="Évolution mensuelle des candidatures" subtitle="Janvier → juillet 2026" className="xl:col-span-2">
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={EVOLUTION_MENSUELLE} margin={{ top: 10, right: 10, left: -18, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="mois" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Line type="monotone" dataKey="candidatures" stroke="var(--brand)" strokeWidth={2.5} dot={{ r: 3, fill: "var(--brand)" }} />
            </LineChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title="Répartition des candidats par site">
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={REPARTITION_SITES} dataKey="part" nameKey="site" innerRadius={52} outerRadius={80} paddingAngle={2} stroke="var(--card)">
                {REPARTITION_SITES.map((_, i) => (
                  <Cell
                    key={i}
                    fill={
                      ["var(--brand)", "var(--brand-2)", "var(--info)", "var(--success)", "var(--warning)", "var(--neutral)"][i]
                    }
                  />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} formatter={(v) => `${v} %`} />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-1.5">
            {REPARTITION_SITES.map((r, i) => (
              <div key={r.site} className="flex items-center gap-1.5 text-[11px]">
                <span
                  className="size-2 rounded-sm"
                  style={{ background: ["var(--brand)", "var(--brand-2)", "var(--info)", "var(--success)", "var(--warning)", "var(--neutral)"][i] }}
                />
                <span className="truncate text-muted-foreground">{r.site}</span>
                <span className="num ml-auto">{r.part} %</span>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <div className="mb-5 grid gap-4 xl:grid-cols-3">
        <Panel title="Résultats de formation" subtitle="Parcours clôturés sur la période">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={RESULTATS_FORMATION} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v) => `${v} %`} />
              <Bar dataKey="part" radius={[3, 3, 0, 0]}>
                {RESULTATS_FORMATION.map((r, i) => (
                  <Cell key={i} fill={["var(--success)", "var(--warning)", "var(--critical)", "var(--brand)"][i]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title="Alertes & risques" subtitle={`${alertes.length} alertes ouvertes`} className="xl:col-span-2" bodyClassName="p-0">
          <div className="max-h-[320px] overflow-y-auto">
            <Table>
              <thead>
                <tr>
                  <Th>Type</Th>
                  <Th>Personne / périmètre</Th>
                  <Th>Site</Th>
                  <Th>Priorité</Th>
                  <Th>Date</Th>
                  <Th>Propriétaire</Th>
                  <Th />
                </tr>
              </thead>
              <tbody>
                {alertes.map((a) => (
                  <Tr key={a.id}>
                    <Td className="max-w-[280px]">
                      <span className="line-clamp-1 font-medium">{a.type}</span>
                    </Td>
                    <Td className="text-muted-foreground">{a.personne}</Td>
                    <Td className="text-muted-foreground">{a.site}</Td>
                    <Td>
                      <Tag ton={a.priorite === "Critique" ? "critical" : a.priorite === "Élevée" ? "warning" : "neutral"}>
                        {a.priorite}
                      </Tag>
                    </Td>
                    <Td className="num text-muted-foreground">{a.date}</Td>
                    <Td className="text-muted-foreground">{a.proprietaire}</Td>
                    <Td>
                      <Link
                        to={a.lien ?? "/pilotage/alertes"}
                        className="inline-flex items-center gap-1 whitespace-nowrap text-xs font-medium text-[var(--brand)] hover:underline"
                      >
                        {a.cta} <ArrowUpRight className="size-3" />
                      </Link>
                    </Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Panel>
      </div>

      <p className="text-[11px] text-muted-foreground">
        Prototype de démonstration — {ALERTES.length} règles d'alerte actives. Les analyses IA constituent une aide à la
        décision : la décision finale appartient aux équipes RH.
      </p>
    </>
  );
}
