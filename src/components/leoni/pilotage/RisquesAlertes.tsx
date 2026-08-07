import { Panel, Table, Td, Th, Tr, Tag, Btn, IAWarning } from "@/components/leoni/kit";
import { SectionExec, EtatTag } from "./kit";
import type { CtxPilotage } from "./contexte";
import {
  ALERTES_DIRECTION,
  FORECAST,
  KPI_PREDICTIFS,
  MENTION_FORECAST,
  PLANS_ACTION,
  TOP_RISQUES,
  tonPlan,
} from "@/data/pilotage";

export function RisquesAlertes({ ctx }: { ctx: CtxPilotage }) {
  return (
    <div className="space-y-8">
      <SectionExec titre="Matrice des risques" sousTitre="Probabilité × gravité — cliquez un risque pour l'analyser">
        <Panel>
          <div className="relative h-[380px] rounded-md border border-border bg-[linear-gradient(135deg,color-mix(in_oklab,var(--success)_12%,transparent),color-mix(in_oklab,var(--warning)_12%,transparent)_50%,color-mix(in_oklab,var(--critical)_16%,transparent))]">
            <span className="absolute bottom-2 left-3 text-[10px] uppercase tracking-wider text-muted-foreground">Probabilité →</span>
            <span className="absolute left-3 top-3 text-[10px] uppercase tracking-wider text-muted-foreground">↑ Gravité</span>
            {TOP_RISQUES.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => ctx.analyser(r.titre, [
                  `${r.categorie} — ${r.perimetre}.`,
                  `Indicateur : ${r.indicateur} (${r.variation}).`,
                  `Facteur principal : ${r.facteur}.`,
                  `Impact : ${r.impact}.`,
                  `Responsable : ${r.responsable} — échéance ${r.echeance}.`,
                  `Action recommandée : ${r.action}.`,
                ], r.onglet)}
                title={`${r.titre} — ${r.niveau}`}
                className="absolute -translate-x-1/2 translate-y-1/2 rounded-full border-2 border-card px-2 py-1 text-[10px] font-semibold text-white shadow-sm transition-transform hover:scale-110"
                style={{
                  left: `${r.probabilite}%`,
                  bottom: `${r.gravite}%`,
                  background: r.niveau === "Critique" ? "var(--critical)" : r.niveau === "À surveiller" ? "var(--warning)" : "var(--success)",
                }}
              >
                {r.rang}
              </button>
            ))}
          </div>
        </Panel>
      </SectionExec>

      <SectionExec titre="Registre des risques" sousTitre="Classement par gravité et probabilité">
        <Panel>
          <Table>
            <thead>
              <tr>
                <Th>#</Th>
                <Th>Risque</Th>
                <Th>Catégorie</Th>
                <Th>Périmètre</Th>
                <Th>Indicateur</Th>
                <Th>Tendance</Th>
                <Th>Impact</Th>
                <Th>Responsable</Th>
                <Th>Échéance</Th>
                <Th>Niveau</Th>
                <Th />
              </tr>
            </thead>
            <tbody>
              {TOP_RISQUES.map((r) => (
                <Tr key={r.id}>
                  <Td className="num text-muted-foreground">{r.rang}</Td>
                  <Td className="font-medium">{r.titre}</Td>
                  <Td>{r.categorie}</Td>
                  <Td>{r.perimetre}</Td>
                  <Td className="num">{r.indicateur}</Td>
                  <Td className={r.tendance === "hausse" ? "text-[var(--critical)]" : r.tendance === "baisse" ? "text-[var(--success)]" : "text-muted-foreground"}>
                    {r.tendance === "hausse" ? "▲" : r.tendance === "baisse" ? "▼" : "="} {r.variation}
                  </Td>
                  <Td className="max-w-[240px] text-xs text-muted-foreground">{r.impact}</Td>
                  <Td>{r.responsable}</Td>
                  <Td>{r.echeance}</Td>
                  <Td>
                    <EtatTag etat={r.niveau} />
                  </Td>
                  <Td>
                    <Btn size="sm" variant="ghost" onClick={() => ctx.creerPlan(r.titre, r.action)}>
                      Plan
                    </Btn>
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        </Panel>
      </SectionExec>

      <SectionExec titre="Alertes automatiques" sousTitre="Règles de seuil déclenchées sur la période — triées par score de priorité">
        <Panel>
          <Table>
            <thead>
              <tr>
                <Th>Alerte</Th>
                <Th>Périmètre</Th>
                <Th>Règle</Th>
                <Th>Valeur</Th>
                <Th>Score</Th>
                <Th>Niveau</Th>
                <Th />
              </tr>
            </thead>
            <tbody>
              {[...ALERTES_DIRECTION]
                .sort((a, b) => b.score - a.score)
                .map((a) => (
                  <Tr key={a.id} onClick={() => ctx.aller(a.onglet)}>
                    <Td className="font-medium">{a.titre}</Td>
                    <Td>{a.perimetre}</Td>
                    <Td className="text-xs text-muted-foreground">{a.regle}</Td>
                    <Td className="num">{a.valeur}</Td>
                    <Td className="num font-semibold">{a.score}</Td>
                    <Td>
                      <Tag ton={a.score >= 80 ? "critical" : a.score >= 65 ? "warning" : "info"}>{String(a.niveau)}</Tag>
                    </Td>
                    <Td>
                      <Btn size="sm" variant="ghost" onClick={() => ctx.creerPlan(a.titre, `Revenir sous le seuil de la règle : ${a.regle}`)}>
                        Plan
                      </Btn>
                    </Td>
                  </Tr>
                ))}
            </tbody>
          </Table>
        </Panel>
      </SectionExec>

      <div className="grid gap-4 xl:grid-cols-2">
        <Panel title="Forecast à 30 jours" subtitle="Projection indicative">
          <div className="space-y-3">
            {FORECAST.map((f) => (
              <div key={f.indicateur} className="rounded-md border border-border p-3">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs font-medium">{f.indicateur}</span>
                  <span className="num text-lg font-semibold">{f.valeur}</span>
                </div>
                <p className="mt-1 text-[11px] text-muted-foreground">Fourchette : {f.fourchette}</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {f.facteurs.map((x) => (
                    <Tag key={x} ton="neutral">
                      {x}
                    </Tag>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <IAWarning texte={MENTION_FORECAST} />
        </Panel>

        <Panel title="KPI prédictifs" subtitle="Populations et périmètres à surveiller">
          <Table>
            <thead>
              <tr>
                <Th>KPI</Th>
                <Th>Valeur</Th>
                <Th>Facteurs</Th>
              </tr>
            </thead>
            <tbody>
              {KPI_PREDICTIFS.map((k) => (
                <Tr key={k.kpi}>
                  <Td className="font-medium">{k.kpi}</Td>
                  <Td className="num">{k.valeur}</Td>
                  <Td className="text-xs text-muted-foreground">{k.facteurs}</Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        </Panel>
      </div>

      <SectionExec titre="Plans d'action stratégiques" sousTitre="Suivi des décisions prises au niveau Direction">
        <Panel>
          <Table>
            <thead>
              <tr>
                <Th>Plan</Th>
                <Th>Responsable</Th>
                <Th>KPI cible</Th>
                <Th>Départ</Th>
                <Th>Actuel</Th>
                <Th>Cible</Th>
                <Th>Avancement</Th>
                <Th>Échéance</Th>
                <Th>Statut</Th>
              </tr>
            </thead>
            <tbody>
              {PLANS_ACTION.map((p) => (
                <Tr key={p.id} onClick={() => ctx.analyser(p.sujet, [p.objectif, `Responsable : ${p.responsable}.`, `Échéance : ${p.echeance}.`, ...p.actions.map((a) => `• ${a}`)])}>
                  <Td className="font-medium">
                    {p.sujet}
                    <span className="block text-[11px] text-muted-foreground">{p.objectif}</span>
                  </Td>
                  <Td>{p.responsable}</Td>
                  <Td>{p.kpiCible}</Td>
                  <Td className="num">{p.valeurDepart}</Td>
                  <Td className="num font-semibold">{p.valeurActuelle}</Td>
                  <Td className="num">{p.cible}</Td>
                  <Td>
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-20 overflow-hidden rounded-full bg-muted">
                        <div className="h-full rounded-full bg-[var(--brand)]" style={{ width: `${p.avancement}%` }} />
                      </div>
                      <span className="num text-xs">{p.avancement} %</span>
                    </div>
                  </Td>
                  <Td>{p.echeance}</Td>
                  <Td>
                    <Tag ton={tonPlan(p.statut)}>{p.statut}</Tag>
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
