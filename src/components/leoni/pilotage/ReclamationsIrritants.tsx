import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Panel, Table, Td, Th, Tr, Btn } from "@/components/leoni/kit";
import { KpiExec, SectionExec, BarresComparees } from "./kit";
import type { CtxPilotage } from "./contexte";
import {
  RECLAMATIONS_12_SEMAINES,
  RECLAMATIONS_CATEGORIE,
  RECLAMATIONS_KPI,
  RECLAMATIONS_SITE,
  RESOLUTION_REPARTITION,
  SATISFACTION_RECLAMATION_CATEGORIE,
  TOP_IRRITANTS,
  pondere,
} from "@/data/pilotage";

export function ReclamationsIrritants({ ctx }: { ctx: CtxPilotage }) {
  const { fiches, objectifs } = ctx;
  const sites = fiches.map((f) => f.site as string);
  const part = fiches.length / 5;
  const pour1000 = pondere(fiches, "reclamationsPour1000");
  const parSite = RECLAMATIONS_SITE.filter((r) => sites.includes(r.site));

  return (
    <div className="space-y-8">
      <SectionExec titre="Réclamations & irritants" sousTitre="Volume, criticité et qualité de traitement">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          <KpiExec label="Réclamations ouvertes" valeur={String(Math.round(RECLAMATIONS_KPI.ouvertes * part))} etat="À surveiller" />
          <KpiExec label="Réclamations critiques" valeur={String(Math.round(RECLAMATIONS_KPI.critiques * part))} etat="Critique" />
          <KpiExec label="SLA dépassé" valeur={String(RECLAMATIONS_KPI.slaDepasse)} objectif={objectifs ? "0" : undefined} etat="Critique" />
          <KpiExec label="Temps moyen de résolution" valeur={String(RECLAMATIONS_KPI.tempsResolution)} unite="jours" objectif={objectifs ? "< 3 j" : undefined} etat="À surveiller" />
          <KpiExec label="Satisfaction du traitement" valeur={String(RECLAMATIONS_KPI.satisfactionTraitement)} unite="/ 5" etat="Bon" />
          <KpiExec label="Réouvertures" valeur={String(RECLAMATIONS_KPI.reouvertures)} etat="À surveiller" />
          <KpiExec label="Réclamations / 1 000 ouvriers" valeur={String(pour1000)} objectif={objectifs ? "< 9" : undefined} etat={pour1000 > 10 ? "À surveiller" : "Bon"} />
          <KpiExec label="Irritant n°1" valeur={TOP_IRRITANTS[0].irritant} etat="Critique" detail={`${TOP_IRRITANTS[0].signalements} signalements`} onDrill={() => ctx.aller("Satisfaction & climat")} />
        </div>
      </SectionExec>

      <div className="grid gap-4 xl:grid-cols-2">
        <Panel title="Volume par catégorie" subtitle="Répartition des réclamations">
          <BarresComparees donnees={RECLAMATIONS_CATEGORIE.map((c) => ({ label: c.categorie, valeur: c.volume }))} unite="" />
        </Panel>

        <Panel title="Volume par site" subtitle="Total et part critique">
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={parSite} margin={{ left: -18 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="site" tick={{ fontSize: 10 }} interval={0} angle={-12} textAnchor="end" height={50} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="volume" name="Volume" fill="var(--brand)" radius={[3, 3, 0, 0]} />
                <Bar dataKey="critiques" name="Critiques" fill="var(--critical)" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Évolution sur 12 semaines" subtitle="Volume reçu vs résolu">
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={RECLAMATIONS_12_SEMAINES} margin={{ left: -18 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="semaine" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="volume" name="Reçues" stroke="var(--warning)" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="resolues" name="Résolues" stroke="var(--success)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Qualité de résolution" subtitle="Répartition et satisfaction par catégorie">
          <div className="space-y-2">
            {RESOLUTION_REPARTITION.map((r) => (
              <div key={r.type} className="flex items-center gap-3">
                <span className="w-40 shrink-0 text-xs text-muted-foreground">{r.type}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${r.part}%`, background: r.type === "Non résolue" ? "var(--critical)" : r.type === "Résolution partielle" ? "var(--warning)" : "var(--success)" }}
                  />
                </div>
                <span className="num w-12 text-right text-xs font-medium">{r.part} %</span>
              </div>
            ))}
          </div>
          <div className="mt-5 border-t border-border pt-4">
            <p className="label-xs mb-2">Satisfaction après traitement</p>
            <BarresComparees donnees={SATISFACTION_RECLAMATION_CATEGORIE.map((s) => ({ label: s.categorie, valeur: s.score }))} unite=" / 5" objectif={4} />
          </div>
        </Panel>
      </div>

      <SectionExec titre="Irritants à traiter en priorité" sousTitre="Corrélation signalements / turnover">
        <Panel>
          <Table>
            <thead>
              <tr>
                <Th>Irritant</Th>
                <Th>Signalements</Th>
                <Th>Variation</Th>
                <Th>Site</Th>
                <Th>Impact turnover</Th>
                <Th />
              </tr>
            </thead>
            <tbody>
              {TOP_IRRITANTS.map((i) => (
                <Tr key={i.irritant}>
                  <Td className="font-medium">{i.irritant}</Td>
                  <Td className="num">{i.signalements}</Td>
                  <Td className={i.variation > 0 ? "num text-[var(--critical)]" : "num text-[var(--success)]"}>
                    {i.variation > 0 ? "+" : ""}
                    {i.variation} %
                  </Td>
                  <Td>{i.site}</Td>
                  <Td>{i.impactTurnover}</Td>
                  <Td>
                    <Btn size="sm" variant="ghost" onClick={() => ctx.creerPlan(`Irritant ${i.irritant}`, `Réduire les signalements de ${i.signalements} à ${Math.round(i.signalements * 0.6)}`)}>
                      Plan
                    </Btn>
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        </Panel>
      </SectionExec>
    </div>
  );
}
