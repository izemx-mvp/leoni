import { createFileRoute } from "@tanstack/react-router";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  COMPETENCES_ACQUISES,
  DELAIS_ETAPES,
  EVOLUTION_MENSUELLE,
  EVOLUTION_RECLAMATIONS,
  FORMATION_PAR_PARCOURS,
  FUNNEL,
  MOTIFS_ABSENCE,
  MOTIFS_REFUS,
  PERFORMANCE_FORMATEURS,
  POPULATION_RISQUE,
  PRESENCE_PAR_SITE,
  PROGRESSION_HEBDO,
  QUALITE_RECRUTEMENT,
  RECRUTEMENT_PAR_POSTE,
  REPARTITION_SITES,
  RESULTATS_MODULES,
  SOURCES_CANDIDATURES,
  TAUX_PRESENCE_GLOBAL,
} from "@/data/leoni";
import { Barre, Btn, Kpi, PageHeader, Panel, Table, Tag, Td, Th, Tr } from "@/components/leoni/kit";
import { useLeoni } from "@/lib/leoni-store";
import { SatisfactionRetention } from "@/components/leoni/reporting/SatisfactionRetention";

export const Route = createFileRoute("/reporting")({
  head: () => ({
    meta: [
      { title: "Reporting & analyses — LEONI Workforce Journey" },
      {
        name: "description",
        content:
          "Rapports consolidés LEONI Maroc : recrutement, formation, présence, performance, risques et réclamations, avec indicateurs détaillés multi-sites.",
      },
      { property: "og:title", content: "Reporting & analyses — LEONI Workforce Journey" },
      { property: "og:description", content: "Analyses consolidées du recrutement, de la formation et de la performance." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ReportingPage,
});

const COULEURS = ["var(--brand)", "var(--info)", "var(--success)", "var(--warning)", "var(--critical)", "var(--neutral)"];

const tooltipStyle = {
  backgroundColor: "var(--popover)",
  border: "1px solid var(--border)",
  borderRadius: 6,
  fontSize: 12,
  color: "var(--popover-foreground)",
};

function SectionTitre({ code, titre, sousTitre }: { code: string; titre: string; sousTitre: string }) {
  return (
    <div className="mb-3 mt-8 flex items-baseline gap-3 border-b border-border pb-2 first:mt-0">
      <span className="num text-xs font-semibold text-[var(--brand)]">{code}</span>
      <h2 className="text-sm font-semibold tracking-tight">{titre}</h2>
      <p className="text-xs text-muted-foreground">{sousTitre}</p>
    </div>
  );
}

function ReportingPage() {
  const { ouvriers, candidats, reclamations, pousserNotification } = useLeoni();

  const scoreMoyenCandidats = Math.round(candidats.reduce((s, c) => s + c.score, 0) / candidats.length);
  const scoreMoyenOuvriers = Math.round(ouvriers.reduce((s, o) => s + o.score, 0) / ouvriers.length);
  const ponctualiteMoyenne = Math.round(ouvriers.reduce((s, o) => s + o.ponctualite, 0) / ouvriers.length);
  const totalCandidatures = SOURCES_CANDIDATURES.reduce((s, x) => s + x.candidatures, 0);
  const delaiTotal = DELAIS_ETAPES.reduce((s, d) => s + d.jours, 0).toFixed(1).replace(".", ",");

  const exporter = (nom: string) =>
    pousserNotification({ titre: "Export lancé", detail: `Rapport « ${nom} » généré au format Excel.`, ton: "success" });

  return (
    <>
      <PageHeader
        titre="Reporting & analyses"
        sousTitre="Rapports consolidés multi-sites — recrutement, formation, présence, performance, risques et réclamations"
        fil={[{ label: "Reporting" }, { label: "Rapports & analyses" }]}
        actions={
          <>
            <Btn variant="secondary" onClick={() => exporter("Reporting global")}>
              Export Excel
            </Btn>
            <Btn variant="primary" onClick={() => exporter("Synthèse direction PDF")}>
              Synthèse direction
            </Btn>
          </>
        }
      />

      {/* ------------------------------ Synthèse ------------------------------ */}
      <SectionTitre code="01" titre="Synthèse générale" sousTitre="Indicateurs clés de la période — juillet 2026" />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
        <Kpi label="Candidatures reçues" valeur="1 248" delta="+12,4 %" ton="brand" />
        <Kpi label="Recrutés" valeur={84} delta="+7,7 %" ton="success" />
        <Kpi label="En formation" valeur={214} ton="info" />
        <Kpi label="Taux de présence" valeur={TAUX_PRESENCE_GLOBAL} suffixe="%" ton="success" />
        <Kpi label="Score IA moyen" valeur={scoreMoyenCandidats} suffixe="%" ton="warning" />
        <Kpi label="Réclamations ouvertes" valeur={reclamations.filter((r) => !["Résolue", "Clôturée"].includes(r.statut)).length} ton="critical" />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <Panel title="Évolution complète du parcours" subtitle="Candidatures, analyses IA, entretiens, recrutements et intégrations" className="xl:col-span-2">
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={EVOLUTION_MENSUELLE}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="mois" stroke="var(--muted-foreground)" fontSize={11} />
              <YAxis stroke="var(--muted-foreground)" fontSize={11} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="candidatures" name="Candidatures" fill="var(--brand-soft)" radius={[3, 3, 0, 0]} />
              <Bar dataKey="analysees" name="Analysées IA" fill="var(--brand)" radius={[3, 3, 0, 0]} />
              <Line type="monotone" dataKey="entretiens" name="Entretiens" stroke="var(--info)" strokeWidth={2} />
              <Line type="monotone" dataKey="recrutes" name="Recrutés" stroke="var(--success)" strokeWidth={2} />
              <Line type="monotone" dataKey="integres" name="Intégrés" stroke="var(--warning)" strokeWidth={2} />
            </ComposedChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title="Répartition des candidats par site" subtitle="Volume et part relative">
          <ResponsiveContainer width="100%" height={230}>
            <PieChart>
              <Pie data={REPARTITION_SITES} dataKey="valeur" nameKey="site" innerRadius={50} outerRadius={85} paddingAngle={2} stroke="var(--card)">
                {REPARTITION_SITES.map((_, i) => (
                  <Cell key={i} fill={COULEURS[i % COULEURS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5">
            {REPARTITION_SITES.map((r, i) => (
              <div key={r.site} className="flex items-center gap-2 text-[11px]">
                <span className="size-2 rounded-sm" style={{ background: COULEURS[i % COULEURS.length] }} />
                <span className="truncate text-muted-foreground">{r.site}</span>
                <span className="num ml-auto">{r.valeur}</span>
                <span className="num w-9 text-right text-muted-foreground">{r.part} %</span>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      {/* ----------------------------- Recrutement ---------------------------- */}
      <SectionTitre code="02" titre="Recrutement" sousTitre="Sourcing, entonnoir, délais, qualité et couverture des besoins" />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <Kpi label="Candidatures suivies" valeur={totalCandidatures} ton="brand" />
        <Kpi label="Taux de conversion" valeur="6,7" suffixe="%" ton="success" />
        <Kpi label="Délai moyen de cycle" valeur={delaiTotal} suffixe="jours" ton="info" />
        <Kpi label="Coût moyen par recruté" valeur="1 340" suffixe="MAD" ton="warning" />
        <Kpi label="Taux d'acceptation offre" valeur={92} suffixe="%" ton="success" />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Panel title="Entonnoir de recrutement" subtitle="Volumes par étape">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={FUNNEL} layout="vertical" margin={{ left: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
              <XAxis type="number" stroke="var(--muted-foreground)" fontSize={11} />
              <YAxis type="category" dataKey="etape" stroke="var(--muted-foreground)" fontSize={11} width={110} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="valeur" name="Candidats" fill="var(--brand)" radius={[0, 3, 3, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title="Délais moyens par étape" subtitle="En jours ouvrés">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={DELAIS_ETAPES} layout="vertical" margin={{ left: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
              <XAxis type="number" stroke="var(--muted-foreground)" fontSize={11} />
              <YAxis type="category" dataKey="etape" stroke="var(--muted-foreground)" fontSize={11} width={150} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v) => `${v} j`} />
              <Bar dataKey="jours" name="Jours" fill="var(--info)" radius={[0, 3, 3, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Panel>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <Panel title="Performance des canaux de sourcing" className="xl:col-span-2" bodyClassName="p-0">
          <Table>
            <thead>
              <tr>
                <Th>Canal</Th>
                <Th>Candidatures</Th>
                <Th>Retenus</Th>
                <Th>Taux de rendement</Th>
                <Th>Coût / candidature</Th>
              </tr>
            </thead>
            <tbody>
              {SOURCES_CANDIDATURES.map((s) => {
                const taux = Math.round((s.retenus / s.candidatures) * 1000) / 10;
                return (
                  <Tr key={s.source}>
                    <Td className="font-medium">{s.source}</Td>
                    <Td className="num">{s.candidatures}</Td>
                    <Td className="num">{s.retenus}</Td>
                    <Td>
                      <div className="flex min-w-32 items-center gap-2">
                        <Barre valeur={taux * 10} ton={taux >= 8 ? "success" : taux >= 5 ? "brand" : "warning"} />
                        <span className="num w-10 text-right text-xs">{taux.toString().replace(".", ",")} %</span>
                      </div>
                    </Td>
                    <Td className="num text-muted-foreground">{s.coutMAD} MAD</Td>
                  </Tr>
                );
              })}
            </tbody>
          </Table>
        </Panel>

        <Panel title="Motifs de refus" subtitle="Répartition des décisions négatives">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={MOTIFS_REFUS} layout="vertical" margin={{ left: 30 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
              <XAxis type="number" stroke="var(--muted-foreground)" fontSize={11} />
              <YAxis type="category" dataKey="motif" stroke="var(--muted-foreground)" fontSize={10} width={130} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="nombre" name="Candidats" fill="var(--critical)" radius={[0, 3, 3, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Panel>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Panel title="Couverture des besoins par poste" bodyClassName="p-0">
          <Table>
            <thead>
              <tr>
                <Th>Poste</Th>
                <Th>Besoin</Th>
                <Th>Recrutés</Th>
                <Th>Couverture</Th>
              </tr>
            </thead>
            <tbody>
              {RECRUTEMENT_PAR_POSTE.map((p) => (
                <Tr key={p.poste}>
                  <Td className="font-medium">{p.poste}</Td>
                  <Td className="num">{p.besoin}</Td>
                  <Td className="num">{p.recrutes}</Td>
                  <Td>
                    <div className="flex min-w-32 items-center gap-2">
                      <Barre valeur={p.tauxCouverture} ton={p.tauxCouverture >= 85 ? "success" : p.tauxCouverture >= 75 ? "brand" : "warning"} />
                      <span className="num w-9 text-right text-xs">{p.tauxCouverture} %</span>
                    </div>
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        </Panel>

        <Panel title="Qualité du recrutement" subtitle="Évaluation post-intégration (base 100)">
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={QUALITE_RECRUTEMENT} outerRadius={95}>
              <PolarGrid stroke="var(--border)" />
              <PolarAngleAxis dataKey="critere" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} />
              <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 9, fill: "var(--muted-foreground)" }} />
              <Radar dataKey="valeur" stroke="var(--brand)" fill="var(--brand)" fillOpacity={0.25} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v) => `${v} / 100`} />
            </RadarChart>
          </ResponsiveContainer>
        </Panel>
      </div>

      {/* ------------------------------ Formation ----------------------------- */}
      <SectionTitre code="03" titre="Formation" sousTitre="Parcours, modules, progression pédagogique, formateurs et compétences" />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <Kpi label="Opérateurs en formation" valeur={214} ton="brand" />
        <Kpi label="Score pédagogique moyen" valeur={scoreMoyenOuvriers} suffixe="%" ton="success" />
        <Kpi label="Taux de réussite QCM" valeur={82} suffixe="%" ton="info" />
        <Kpi label="Modules validés (mois)" valeur={412} ton="success" />
        <Kpi label="Rattrapages en cours" valeur={14} ton="warning" />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <Panel title="Résultats par module de formation" subtitle="Taux de réussite et d'échec" className="xl:col-span-2">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={RESULTATS_MODULES}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="module" stroke="var(--muted-foreground)" fontSize={10} interval={0} angle={-12} textAnchor="end" height={60} />
              <YAxis stroke="var(--muted-foreground)" fontSize={11} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v) => `${v} %`} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="reussite" name="Réussite %" stackId="a" fill="var(--success)" radius={[0, 0, 0, 0]} />
              <Bar dataKey="echec" name="Échec %" stackId="a" fill="var(--critical)" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title="Compétences acquises" subtitle="Niveau moyen de maîtrise">
          <div className="space-y-3">
            {COMPETENCES_ACQUISES.map((c) => (
              <div key={c.competence}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{c.competence}</span>
                  <span className="num">{c.niveau} %</span>
                </div>
                <Barre valeur={c.niveau} ton={c.niveau >= 85 ? "success" : c.niveau >= 70 ? "brand" : "warning"} />
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <Panel title="Progression pédagogique hebdomadaire" subtitle="Score moyen, présence et modules validés" className="xl:col-span-2">
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={PROGRESSION_HEBDO}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="semaine" stroke="var(--muted-foreground)" fontSize={11} />
              <YAxis stroke="var(--muted-foreground)" fontSize={11} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Area type="monotone" dataKey="scoreMoyen" name="Score moyen %" stroke="var(--brand)" fill="var(--brand)" fillOpacity={0.18} strokeWidth={2} />
              <Area type="monotone" dataKey="presence" name="Présence %" stroke="var(--success)" fill="var(--success)" fillOpacity={0.12} strokeWidth={2} />
              <Line type="monotone" dataKey="validations" name="Modules validés" stroke="var(--warning)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title="Performance des formateurs" bodyClassName="p-0">
          <Table>
            <thead>
              <tr>
                <Th>Formateur</Th>
                <Th>Sessions</Th>
                <Th>Réussite</Th>
                <Th>Satisf.</Th>
              </tr>
            </thead>
            <tbody>
              {PERFORMANCE_FORMATEURS.map((f) => (
                <Tr key={f.formateur}>
                  <Td className="font-medium">{f.formateur}</Td>
                  <Td className="num">{f.sessions}</Td>
                  <Td>
                    <Tag ton={f.tauxReussite >= 85 ? "success" : f.tauxReussite >= 78 ? "warning" : "critical"}>{f.tauxReussite} %</Tag>
                  </Td>
                  <Td className="num text-muted-foreground">{f.satisfaction.toString().replace(".", ",")} / 5</Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        </Panel>
      </div>

      <Panel title="Bilan par parcours de formation" className="mt-4" bodyClassName="p-0">
        <Table>
          <thead>
            <tr>
              <Th>Parcours</Th>
              <Th>Inscrits</Th>
              <Th>Validés</Th>
              <Th>En cours</Th>
              <Th>Arrêtés</Th>
              <Th>Taux de réussite</Th>
            </tr>
          </thead>
          <tbody>
            {FORMATION_PAR_PARCOURS.map((p) => (
              <Tr key={p.parcours}>
                <Td className="font-medium">{p.parcours}</Td>
                <Td className="num">{p.inscrits}</Td>
                <Td className="num">{p.valides}</Td>
                <Td className="num">{p.enCours}</Td>
                <Td className="num">{p.arretes}</Td>
                <Td>
                  <div className="flex min-w-36 items-center gap-2">
                    <Barre valeur={p.tauxReussite} ton={p.tauxReussite >= 85 ? "success" : p.tauxReussite >= 72 ? "brand" : "warning"} />
                    <span className="num w-9 text-right text-xs">{p.tauxReussite} %</span>
                  </div>
                </Td>
              </Tr>
            ))}
          </tbody>
        </Table>
      </Panel>

      {/* ------------------------------ Présence ------------------------------ */}
      <SectionTitre code="04" titre="Présence & assiduité" sousTitre="Taux par site, ponctualité, motifs d'absence" />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label="Taux de présence global" valeur={TAUX_PRESENCE_GLOBAL} suffixe="%" ton="success" />
        <Kpi label="Ponctualité moyenne" valeur={ponctualiteMoyenne} suffixe="%" ton="info" />
        <Kpi label="Opérateurs sous 80 %" valeur={ouvriers.filter((o) => o.presence < 80).length} ton="critical" />
        <Kpi label="Absences du mois" valeur={117} ton="warning" />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <Panel title="Présence et ponctualité par site" className="xl:col-span-2">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={PRESENCE_PAR_SITE}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="site" stroke="var(--muted-foreground)" fontSize={11} />
              <YAxis domain={[70, 100]} stroke="var(--muted-foreground)" fontSize={11} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v) => `${v} %`} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="presence" name="Présence %" fill="var(--brand)" radius={[3, 3, 0, 0]} />
              <Bar dataKey="ponctualite" name="Ponctualité %" fill="var(--info)" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title="Motifs d'absence" subtitle="Cumul du mois">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={MOTIFS_ABSENCE} dataKey="nombre" nameKey="motif" outerRadius={90} label={{ fontSize: 10 }}>
                {MOTIFS_ABSENCE.map((_, i) => (
                  <Cell key={i} fill={COULEURS[i % COULEURS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
        </Panel>
      </div>

      <Panel title="Assiduité détaillée par opérateur" className="mt-4" bodyClassName="p-0">
        <div className="max-h-[360px] overflow-y-auto">
          <Table>
            <thead>
              <tr>
                <Th>Opérateur</Th>
                <Th>Site</Th>
                <Th>Présence</Th>
                <Th>Ponctualité</Th>
                <Th>Score</Th>
                <Th>Statut</Th>
              </tr>
            </thead>
            <tbody>
              {ouvriers.map((o) => (
                <Tr key={o.id}>
                  <Td className="font-medium">{o.nom}</Td>
                  <Td className="text-muted-foreground">{o.site}</Td>
                  <Td className="num">{o.presence} %</Td>
                  <Td className="num">{o.ponctualite} %</Td>
                  <Td className="num">{o.score} %</Td>
                  <Td>
                    <Tag ton={o.presence >= 90 ? "success" : o.presence >= 80 ? "warning" : "critical"}>{o.statut}</Tag>
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        </div>
      </Panel>

      {/* -------------------------- Risques & qualité -------------------------- */}
      <SectionTitre code="05" titre="Risques & réclamations" sousTitre="Population exposée, alertes et traitement des réclamations" />
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Population par niveau de risque">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={POPULATION_RISQUE} dataKey="valeur" nameKey="niveau" outerRadius={95} label>
                {POPULATION_RISQUE.map((_, i) => (
                  <Cell key={i} fill={["var(--success)", "var(--warning)", "var(--critical)"][i]} />
                ))}
              </Pie>
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title="Opérateurs les plus exposés" bodyClassName="p-0">
          <Table>
            <thead>
              <tr>
                <Th>Opérateur</Th>
                <Th>Score</Th>
                <Th>Présence</Th>
                <Th>Risque</Th>
              </tr>
            </thead>
            <tbody>
              {[...ouvriers]
                .sort((a, b) => a.score - b.score)
                .slice(0, 8)
                .map((o) => (
                  <Tr key={o.id}>
                    <Td className="font-medium">{o.nom}</Td>
                    <Td className="num">{o.score} %</Td>
                    <Td className="num">{o.presence} %</Td>
                    <Td>
                      <Tag ton={o.risque === "Critique" ? "critical" : o.risque === "Élevé" ? "warning" : "success"}>{o.risque}</Tag>
                    </Td>
                  </Tr>
                ))}
            </tbody>
          </Table>
        </Panel>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label="Réclamations totales" valeur={reclamations.length} ton="brand" />
        <Kpi label="Critiques" valeur={reclamations.filter((r) => r.priorite === "Critique").length} ton="critical" />
        <Kpi label="Résolues" valeur={reclamations.filter((r) => ["Résolue", "Clôturée"].includes(r.statut)).length} ton="success" />
        <Kpi label="Délai moyen de résolution" valeur="2,8" suffixe="jours" ton="info" />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Panel title="Réclamations par catégorie">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart
              data={[...new Set(reclamations.map((r) => r.categorie))].map((c) => ({
                categorie: c,
                total: reclamations.filter((r) => r.categorie === c).length,
              }))}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="categorie" stroke="var(--muted-foreground)" fontSize={11} />
              <YAxis stroke="var(--muted-foreground)" fontSize={11} allowDecimals={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="total" name="Réclamations" fill="var(--brand)" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title="Évolution des réclamations" subtitle="Ouvertes vs résolues">
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={EVOLUTION_RECLAMATIONS}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="mois" stroke="var(--muted-foreground)" fontSize={11} />
              <YAxis stroke="var(--muted-foreground)" fontSize={11} allowDecimals={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="ouvertes" name="Ouvertes" stroke="var(--warning)" strokeWidth={2} />
              <Line type="monotone" dataKey="resolues" name="Résolues" stroke="var(--success)" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </Panel>
      </div>

      <SectionTitre
        code="06"
        titre="Satisfaction, départs & rétention"
        sousTitre="Satisfaction quotidienne, turnover, motifs de départ, cohortes et risque de départ précoce"
      />
      <SatisfactionRetention onExport={exporter} />

      <p className="mt-6 text-[11px] text-muted-foreground">
        Rapports actualisés à chaque action réalisée dans l'application — prototype de démonstration LEONI Maroc.
      </p>
    </>
  );
}
