import { useState } from "react";
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Panel, Table, Td, Th, Tr, Select, Tag, Btn } from "@/components/leoni/kit";
import { KpiExec, SectionExec, BarresComparees } from "./kit";
import type { CtxPilotage } from "./contexte";
import {
  COHORTE_JUILLET,
  EARLY_TURNOVER,
  MOTIFS_DEPART_PARETO,
  OBJECTIF_TURNOVER,
  RETENTION_KPI,
  TURNOVER_SEGMENTS,
  cumul,
  pondere,
  serieConsolidee,
} from "@/data/pilotage";

const DIMENSIONS = ["Site", "Poste", "Ancienneté", "Shift", "Criticité"];
const AXES_EARLY: { cle: keyof typeof EARLY_TURNOVER; label: string }[] = [
  { cle: "parSite", label: "Par site" },
  { cle: "parPoste", label: "Par poste" },
  { cle: "parFormation", label: "Par formation" },
  { cle: "parTransport", label: "Par transport" },
  { cle: "parShift", label: "Par shift" },
];

export function RetentionTurnover({ ctx }: { ctx: CtxPilotage }) {
  const { fiches, objectifs, mois } = ctx;
  const [dimension, setDimension] = useState("Site");
  const [axeEarly, setAxeEarly] = useState<string>("parSite");
  const [comparerSites, setComparerSites] = useState(false);

  const turnoverMensuel = pondere(fiches, "turnoverMensuel");
  const turnover12 = pondere(fiches, "turnover12");
  const retention90 = pondere(fiches, "retention90", 0);
  const part = fiches.length / 5;
  const serie = serieConsolidee(fiches, "serieTurnover", 12).map((s) => ({ mois: s.mois, reel: s.valeur, objectif: OBJECTIF_TURNOVER / 12 + 3.2 }));
  const serieParSite = serieConsolidee(fiches, "serieTurnover", 12).map((s, i) => {
    const point: Record<string, number | string> = { mois: s.mois };
    fiches.forEach((f) => (point[f.site] = f.serieTurnover[i]));
    return point;
  });
  const couleurs = ["var(--critical)", "var(--brand)", "var(--info)", "var(--warning)", "var(--success)"];
  const pareto = MOTIFS_DEPART_PARETO.reduce<{ motif: string; part: number; cumul: number }[]>((acc, m) => {
    const cum = (acc[acc.length - 1]?.cumul ?? 0) + m.part;
    acc.push({ ...m, cumul: cum });
    return acc;
  }, []);
  const maxCohorte = COHORTE_JUILLET[0].valeur;

  return (
    <div className="space-y-8">
      <SectionExec titre="Rétention & turnover" sousTitre="Indicateurs clés de fidélisation">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5">
          <KpiExec label="Turnover mensuel" valeur={String(turnoverMensuel)} unite="%" objectif={objectifs ? "< 4 %" : undefined} etat={turnoverMensuel > 4 ? "Critique" : "Bon"} serie={serieConsolidee(fiches, "serieTurnover", mois).map((s) => s.valeur)} />
          <KpiExec label="Turnover 12 mois" valeur={String(turnover12)} unite="%" delta="↑ +2,1 pts" deltaSens="negatif" objectif={objectifs ? "< 15 %" : undefined} etat={turnover12 > 15 ? "Critique" : "Bon"} />
          <KpiExec label="Départs" valeur={String(Math.round(RETENTION_KPI.departs * part))} etat="À surveiller" />
          <KpiExec label="Départs < 30 jours" valeur={String(cumul(fiches, "departs30"))} objectif={objectifs ? "< 15" : undefined} etat="Critique" />
          <KpiExec label="Départs < 90 jours" valeur={String(cumul(fiches, "departs90"))} etat="À surveiller" />
          <KpiExec label="Rétention J+30" valeur={String(RETENTION_KPI.retention30)} unite="%" objectif={objectifs ? "95 %" : undefined} etat="À surveiller" />
          <KpiExec label="Rétention J+90" valeur={String(retention90)} unite="%" objectif={objectifs ? "90 %" : undefined} etat={retention90 >= 90 ? "Bon" : "À surveiller"} serie={serieConsolidee(fiches, "serieRetention", mois).map((s) => s.valeur)} />
          <KpiExec label="Ancienneté moyenne au départ" valeur={String(RETENTION_KPI.ancienneteMoyenneDepart)} unite="jours" etat="À surveiller" />
          <KpiExec label="Départs pendant formation" valeur={String(Math.round(RETENTION_KPI.departsFormation * part))} etat="À surveiller" onDrill={() => ctx.aller("Formation & intégration")} />
          <KpiExec label="Départs après confirmation" valeur={String(Math.round(RETENTION_KPI.departsApresConfirmation * part))} etat="Bon" />
        </div>
      </SectionExec>

      <SectionExec
        titre="Évolution du turnover"
        sousTitre="Réel vs objectif sur 12 mois"
        action={
          <Btn size="sm" variant={comparerSites ? "primary" : "secondary"} onClick={() => setComparerSites((v) => !v)}>
            {comparerSites ? "Vue consolidée" : "Comparer les sites"}
          </Btn>
        }
      >
        <Panel>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={comparerSites ? serieParSite : serie} margin={{ left: -18 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="mois" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} unit="%" />
                <Tooltip contentStyle={{ fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                {comparerSites ? (
                  fiches.map((f, i) => <Line key={f.site} type="monotone" dataKey={f.site} stroke={couleurs[i % couleurs.length]} strokeWidth={2} dot={false} />)
                ) : (
                  <>
                    <Line type="monotone" dataKey="reel" name="Turnover réel" stroke="var(--critical)" strokeWidth={2.4} dot={false} />
                    <ReferenceLine y={4} stroke="var(--success)" strokeDasharray="4 4" label={{ value: "Objectif 4 %", fontSize: 10, fill: "var(--success)" }} />
                  </>
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </SectionExec>

      <div className="grid gap-4 xl:grid-cols-2">
        <Panel title="Motifs de départ — Pareto" subtitle="Top 3 facteurs : transport, conditions de travail, horaires">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pareto} margin={{ left: -18 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="motif" tick={{ fontSize: 9 }} interval={0} angle={-20} textAnchor="end" height={60} />
                <YAxis tick={{ fontSize: 11 }} unit="%" />
                <Tooltip contentStyle={{ fontSize: 12 }} />
                <Bar dataKey="part" name="Part des départs" fill="var(--critical)" radius={[3, 3, 0, 0]} />
                <Line type="monotone" dataKey="cumul" name="Cumul" stroke="var(--brand)" strokeWidth={2} dot={false} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {MOTIFS_DEPART_PARETO.slice(0, 3).map((m, i) => (
              <Tag key={m.motif} ton={i === 0 ? "critical" : "warning"}>
                #{i + 1} {m.motif} — {m.part} %
              </Tag>
            ))}
          </div>
        </Panel>

        <Panel
          title="Turnover par segment"
          subtitle="Basculez la dimension d'analyse"
          action={<Select value={dimension} onChange={setDimension} options={DIMENSIONS} className="h-8 text-xs" />}
        >
          <BarresComparees donnees={TURNOVER_SEGMENTS[dimension]} objectif={4} inverse />
        </Panel>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Panel title="Cohorte Juillet 2026" subtitle="Courbe de survie de l'intégration au J+90">
          <div className="space-y-2">
            {COHORTE_JUILLET.map((e, i) => (
              <div key={e.etape}>
                <div className="flex items-baseline justify-between text-xs">
                  <span className="font-medium">{e.etape}</span>
                  <span className="num text-muted-foreground">
                    {e.valeur} <span className="text-[10px]">({Math.round((e.valeur / maxCohorte) * 100)} %)</span>
                  </span>
                </div>
                <div className="mt-1 h-6 overflow-hidden rounded-sm bg-muted">
                  <div className="h-full rounded-sm bg-[var(--brand)]" style={{ width: `${(e.valeur / maxCohorte) * 100}%`, opacity: 1 - i * 0.1 }} />
                </div>
              </div>
            ))}
          </div>
          <p className="mt-3 text-[11px] text-muted-foreground">
            Perte totale de {maxCohorte - COHORTE_JUILLET[COHORTE_JUILLET.length - 1].valeur} personnes entre la sélection et le J+90.
          </p>
        </Panel>

        <Panel
          title="Early turnover"
          subtitle="Départs avant 30 jours — indicateur prioritaire"
          action={<Select value={axeEarly} onChange={setAxeEarly} options={AXES_EARLY.map((a) => a.cle as string)} render={(v) => AXES_EARLY.find((a) => a.cle === v)?.label ?? v} className="h-8 text-xs" />}
        >
          <div className="mb-4 grid grid-cols-3 gap-3">
            <div className="rounded-md border border-border p-3">
              <p className="label-xs">Départs</p>
              <p className="num mt-1 text-2xl font-semibold">{EARLY_TURNOVER.departs}</p>
            </div>
            <div className="rounded-md border border-border p-3">
              <p className="label-xs">Taux</p>
              <p className="num mt-1 text-2xl font-semibold text-[var(--critical)]">{EARLY_TURNOVER.taux} %</p>
            </div>
            <div className="rounded-md border border-border p-3">
              <p className="label-xs">Objectif</p>
              <p className="num mt-1 text-2xl font-semibold">&lt; {EARLY_TURNOVER.objectif} %</p>
            </div>
          </div>
          <BarresComparees donnees={EARLY_TURNOVER[axeEarly as "parSite"] as { label: string; valeur: number }[]} objectif={EARLY_TURNOVER.objectif} inverse />
        </Panel>
      </div>

      <SectionExec titre="Turnover par site" sousTitre="Comparaison directe sur la période">
        <Panel>
          <Table>
            <thead>
              <tr>
                <Th>Site</Th>
                <Th>Turnover mensuel</Th>
                <Th>Turnover 12 mois</Th>
                <Th>Rétention 90 j</Th>
                <Th>Départs &lt; 30 j</Th>
                <Th>Motif dominant</Th>
                <Th />
              </tr>
            </thead>
            <tbody>
              {[...fiches]
                .sort((a, b) => b.turnoverMensuel - a.turnoverMensuel)
                .map((f) => (
                  <Tr key={f.site}>
                    <Td className="font-medium">{f.site}</Td>
                    <Td className={f.turnoverMensuel > 4 ? "num text-[var(--critical)]" : "num"}>{f.turnoverMensuel} %</Td>
                    <Td className="num">{f.turnover12} %</Td>
                    <Td className="num">{f.retention90} %</Td>
                    <Td className="num">{f.departs30}</Td>
                    <Td>{f.site === "Bouskoura" ? "Transport" : f.site === "Bouznika" ? "Horaires / shifts" : "Opportunité externe"}</Td>
                    <Td>
                      <Btn size="sm" variant="ghost" onClick={() => ctx.creerPlan(`Turnover ${f.site}`, `Ramener le turnover mensuel de ${f.turnoverMensuel} % à 4 %`)}>
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
