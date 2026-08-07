import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Panel, Table, Td, Th, Tr, Tag, Btn } from "@/components/leoni/kit";
import { KpiExec, SectionExec, EtatTag } from "./kit";
import type { CtxPilotage } from "./contexte";
import { CAMPAGNES_EXEC, FUNNEL_RECRUTEMENT, POSTES_TENSION, cumul, pondere } from "@/data/pilotage";

export function Recrutement({ ctx }: { ctx: CtxPilotage }) {
  const { fiches, objectifs } = ctx;
  const besoins = cumul(fiches, "besoinsOuverts");
  const couverture = pondere(fiches, "couvertureRecrutement", 0);
  const delai = pondere(fiches, "delaiRecrutement", 0);
  const part = cumul(fiches, "effectif") / 20418;
  const recrute = Math.round(besoins * (couverture / 100));
  const funnel = FUNNEL_RECRUTEMENT.map((f) => ({ ...f, valeur: Math.round(f.valeur * part) }));
  const maxFunnel = funnel[0].valeur || 1;
  const sitesConcernes = fiches.map((f) => f.site);
  const postes = POSTES_TENSION.filter((p) => sitesConcernes.includes(p.site as never)).slice(0, 10);
  const campagnes = CAMPAGNES_EXEC.filter((c) => sitesConcernes.includes(c.site as never));

  return (
    <div className="space-y-8">
      <SectionExec titre="Performance recrutement" sousTitre="Vue direction — sans détail candidat">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5">
          <KpiExec label="Besoins ouverts" valeur={String(besoins)} etat={besoins > 300 ? "À surveiller" : "Bon"} />
          <KpiExec label="Effectif demandé" valeur={String(Math.round(besoins * 1.08))} etat="Bon" />
          <KpiExec label="Effectif recruté" valeur={String(recrute)} etat="Bon" />
          <KpiExec label="Taux de couverture" valeur={String(couverture)} unite="%" objectif={objectifs ? "85 %" : undefined} etat={couverture >= 85 ? "Bon" : couverture >= 70 ? "À surveiller" : "Critique"} />
          <KpiExec label="Délai moyen de recrutement" valeur={String(delai)} unite="jours" objectif={objectifs ? "< 25 j" : undefined} etat={delai <= 25 ? "Bon" : "À surveiller"} />
          <KpiExec label="Campagnes actives" valeur={String(campagnes.length)} etat="Bon" />
          <KpiExec label="Campagnes en retard" valeur={String(campagnes.filter((c) => c.statut === "En retard").length)} etat="À surveiller" />
          <KpiExec label="Postes en tension" valeur={String(postes.filter((p) => p.risque !== "Bon").length)} etat="À surveiller" />
          <KpiExec label="Postes critiques sans candidat conforme" valeur={String(postes.filter((p) => p.critique && p.recrute / p.besoin < 0.5).length)} etat="Critique" onDrill={() => ctx.aller("Postes critiques")} />
        </div>
      </SectionExec>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
        <Panel title="Entonnoir de recrutement" subtitle="Du besoin à l'intégration">
          <div className="space-y-2">
            {funnel.map((f, i) => {
              const ratio = f.valeur / maxFunnel;
              const conv = i === 0 ? null : Math.round((f.valeur / funnel[i - 1].valeur) * 100);
              return (
                <div key={f.etape}>
                  <div className="flex items-baseline justify-between text-xs">
                    <span className="font-medium">{f.etape}</span>
                    <span className="num text-muted-foreground">
                      {f.valeur.toLocaleString("fr-FR")}
                      {conv !== null && <span className="ml-2 text-[10px]">({conv} %)</span>}
                    </span>
                  </div>
                  <div className="mt-1 h-6 overflow-hidden rounded-sm bg-muted">
                    <div className="h-full rounded-sm bg-[var(--brand)]" style={{ width: `${Math.max(6, ratio * 100)}%`, opacity: 1 - i * 0.11 }} />
                  </div>
                </div>
              );
            })}
          </div>
        </Panel>

        <Panel title="Top 10 postes en tension" subtitle="Couverture, délai et niveau de risque">
          <Table>
            <thead>
              <tr>
                <Th>Poste</Th>
                <Th>Criticité</Th>
                <Th>Besoin</Th>
                <Th>Recruté</Th>
                <Th>Couverture</Th>
                <Th>Délai</Th>
                <Th>Risque</Th>
              </tr>
            </thead>
            <tbody>
              {postes.map((p) => {
                const couv = Math.round((p.recrute / p.besoin) * 100);
                return (
                  <Tr key={p.poste + p.site} onClick={() => ctx.analyser(`${p.poste} — ${p.site}`, [
                    `Besoin : ${p.besoin} — recruté : ${p.recrute} (couverture ${couv} %).`,
                    `Délai moyen de recrutement : ${p.delai} jours.`,
                    p.critique ? "Poste critique : affectation conditionnée à la conformité documentaire et aux habilitations." : "Poste standard.",
                    `Niveau de risque : ${p.risque}.`,
                  ], p.critique ? "Postes critiques" : undefined)}>
                    <Td className="font-medium">
                      {p.poste}
                      <span className="block text-[11px] text-muted-foreground">{p.site}</span>
                    </Td>
                    <Td>{p.critique ? <Tag ton="critical">Critique</Tag> : <Tag ton="neutral">Standard</Tag>}</Td>
                    <Td className="num">{p.besoin}</Td>
                    <Td className="num">{p.recrute}</Td>
                    <Td className={couv < 50 ? "num text-[var(--critical)]" : "num"}>{couv} %</Td>
                    <Td className="num">{p.delai} j</Td>
                    <Td>
                      <EtatTag etat={p.risque} />
                    </Td>
                  </Tr>
                );
              })}
            </tbody>
          </Table>
        </Panel>
      </div>

      <SectionExec titre="Performance des campagnes" sousTitre="Campagnes en retard, critiques ou à fort volume uniquement">
        <Panel>
          <Table>
            <thead>
              <tr>
                <Th>Campagne</Th>
                <Th>Objectif</Th>
                <Th>Candidatures</Th>
                <Th>Retenus</Th>
                <Th>Intégrés</Th>
                <Th>Conversion</Th>
                <Th>Avancement</Th>
                <Th>Date cible</Th>
                <Th>Statut</Th>
                <Th />
              </tr>
            </thead>
            <tbody>
              {campagnes.map((c) => {
                const conv = Math.round((c.retenus / c.candidatures) * 100);
                const av = Math.round((c.integres / c.objectif) * 100);
                return (
                  <Tr key={c.campagne}>
                    <Td className="font-medium">
                      {c.campagne}
                      <span className="block text-[11px] text-muted-foreground">{c.site}</span>
                    </Td>
                    <Td className="num">{c.objectif}</Td>
                    <Td className="num">{c.candidatures}</Td>
                    <Td className="num">{c.retenus}</Td>
                    <Td className="num">{c.integres}</Td>
                    <Td className="num">{conv} %</Td>
                    <Td className={av < 60 ? "num text-[var(--critical)]" : "num"}>{av} %</Td>
                    <Td>{c.dateCible}</Td>
                    <Td>
                      <Tag ton={c.statut === "Critique" ? "critical" : c.statut === "En retard" ? "warning" : "info"}>{c.statut}</Tag>
                    </Td>
                    <Td>
                      <Btn size="sm" variant="ghost" onClick={() => ctx.creerPlan(`Campagne ${c.campagne}`, `Atteindre ${c.objectif} intégrations avant le ${c.dateCible}`)}>
                        Plan
                      </Btn>
                    </Td>
                  </Tr>
                );
              })}
            </tbody>
          </Table>
        </Panel>
      </SectionExec>

      <Panel title="Couverture des besoins par site" subtitle="Comparaison inter-sites">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={fiches.map((f) => ({ site: f.site, couverture: f.couvertureRecrutement, delai: f.delaiRecrutement }))} margin={{ left: -12 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="site" tick={{ fontSize: 10 }} interval={0} angle={-12} textAnchor="end" height={50} />
              <YAxis tick={{ fontSize: 11 }} unit="%" />
              <Tooltip contentStyle={{ fontSize: 12 }} />
              <Bar dataKey="couverture" name="Couverture %" fill="var(--brand)" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Panel>
    </div>
  );
}
