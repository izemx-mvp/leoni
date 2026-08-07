import { Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Panel, Table, Td, Th, Tr, Tag } from "@/components/leoni/kit";
import { KpiExec, SectionExec, BarresComparees } from "./kit";
import type { CtxPilotage } from "./contexte";
import {
  ANCIENNETE_SEGMENTS,
  REPARTITION_POSTE,
  REPARTITION_SHIFT,
  WORKFORCE_KPI,
  cumul,
  pondere,
  serieConsolidee,
} from "@/data/pilotage";

const COULEURS = ["var(--brand)", "var(--info)", "var(--success)", "var(--warning)", "var(--critical)", "var(--neutral)"];

export function Workforce({ ctx }: { ctx: CtxPilotage }) {
  const { fiches, mois } = ctx;
  const effectif = cumul(fiches, "effectif");
  const part = effectif / 20418;
  const p = (n: number) => Math.round(n * part);
  const serieEffectif = serieConsolidee(fiches, "serieEffectif", mois);
  const serieAbs = serieConsolidee(fiches, "serieAbsenteisme", mois);
  const absenteisme = pondere(fiches, "absenteisme");

  return (
    <div className="space-y-8">
      <SectionExec titre="Indicateurs Workforce" sousTitre="Structure et mouvements de l'effectif">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5">
          <KpiExec label="Effectif actif" valeur={effectif.toLocaleString("fr-FR")} delta="+2,8 % sur 12 mois" deltaSens="positif" etat="Bon" serie={serieEffectif.map((s) => s.valeur)} />
          <KpiExec label="Entrées" valeur={String(p(WORKFORCE_KPI.entrees))} detail="Sur la période" etat="Bon" />
          <KpiExec label="Sorties" valeur={String(p(WORKFORCE_KPI.sorties))} detail="Sur la période" etat="À surveiller" onDrill={() => ctx.aller("Rétention & turnover")} />
          <KpiExec label="Solde net" valeur={`+${p(WORKFORCE_KPI.entrees) - p(WORKFORCE_KPI.sorties)}`} etat="Bon" />
          <KpiExec label="À intégrer" valeur={String(p(WORKFORCE_KPI.aIntegrer))} etat="Bon" />
          <KpiExec label="En formation" valeur={String(p(WORKFORCE_KPI.enFormation))} etat="Bon" onDrill={() => ctx.aller("Formation & intégration")} />
          <KpiExec label="Confirmés" valeur={p(WORKFORCE_KPI.confirmes).toLocaleString("fr-FR")} etat="Bon" />
          <KpiExec label="Suspendus" valeur={String(p(WORKFORCE_KPI.suspendus))} etat="À surveiller" />
          <KpiExec label="Postes vacants" valeur={String(cumul(fiches, "besoinsOuverts"))} etat="À surveiller" onDrill={() => ctx.aller("Recrutement")} />
          <KpiExec label="Absentéisme" valeur={`${absenteisme}`} unite="%" objectif="< 3,5 %" etat={absenteisme > 3.5 ? "À surveiller" : "Bon"} serie={serieAbs.map((s) => s.valeur)} />
        </div>
      </SectionExec>

      <div className="grid gap-4 xl:grid-cols-2">
        <Panel title="Effectif sur 12 mois" subtitle="Évolution consolidée">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={serieConsolidee(fiches, "serieEffectif", 12)} margin={{ left: -8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="mois" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} domain={["dataMin - 200", "dataMax + 200"]} />
                <Tooltip contentStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="valeur" name="Effectif moyen par site" stroke="var(--brand)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Répartition par site" subtitle="Effectif actif">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={fiches.map((f) => ({ site: f.site, effectif: f.effectif }))} margin={{ left: -12 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="site" tick={{ fontSize: 10 }} interval={0} angle={-12} textAnchor="end" height={50} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ fontSize: 12 }} />
                <Bar dataKey="effectif" name="Effectif" fill="var(--brand)" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Répartition par poste" subtitle="Familles de postes">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={REPARTITION_POSTE} dataKey="valeur" nameKey="nom" innerRadius={50} outerRadius={82} paddingAngle={2}>
                  {REPARTITION_POSTE.map((_, i) => (
                    <Cell key={i} fill={COULEURS[i % COULEURS.length]} />
                  ))}
                </Pie>
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Répartition par shift" subtitle="Effectif et absentéisme associé">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={REPARTITION_SHIFT} margin={{ left: -12 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="nom" tick={{ fontSize: 10 }} />
                <YAxis yAxisId="l" tick={{ fontSize: 11 }} />
                <YAxis yAxisId="r" orientation="right" tick={{ fontSize: 11 }} unit="%" />
                <Tooltip contentStyle={{ fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar yAxisId="l" dataKey="valeur" name="Effectif" fill="var(--brand)" radius={[3, 3, 0, 0]} />
                <Bar yAxisId="r" dataKey="absenteisme" name="Absentéisme %" fill="var(--warning)" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>

      <SectionExec titre="Analyse par ancienneté" sousTitre="Population, turnover et satisfaction par segment">
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,380px)]">
          <Panel>
            <Table>
              <thead>
                <tr>
                  <Th>Segment</Th>
                  <Th>Population</Th>
                  <Th>Turnover</Th>
                  <Th>Satisfaction</Th>
                  <Th>Lecture</Th>
                </tr>
              </thead>
              <tbody>
                {ANCIENNETE_SEGMENTS.map((s) => (
                  <Tr key={s.segment} onClick={() => ctx.aller("Rétention & turnover")}>
                    <Td className="font-medium">{s.segment}</Td>
                    <Td className="num">{s.population.toLocaleString("fr-FR")}</Td>
                    <Td className="num">{s.turnover} %</Td>
                    <Td className="num">{s.satisfaction} / 5</Td>
                    <Td>
                      <Tag ton={s.turnover > 6 ? "critical" : s.turnover > 3 ? "warning" : "success"}>
                        {s.turnover > 6 ? "Fragile" : s.turnover > 3 ? "À surveiller" : "Stable"}
                      </Tag>
                    </Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
          </Panel>
          <Panel title="Turnover par ancienneté" subtitle="Le risque se concentre sur les premiers jours">
            <BarresComparees donnees={ANCIENNETE_SEGMENTS.map((s) => ({ label: s.segment, valeur: s.turnover }))} objectif={5} inverse />
          </Panel>
        </div>
      </SectionExec>
    </div>
  );
}
