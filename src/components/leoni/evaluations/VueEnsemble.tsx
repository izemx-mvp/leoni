import { Link } from "@tanstack/react-router";
import {
  EVAL_PAR_MOIS,
  KPIS_MODULE,
  SCORE_PAR_TYPE,
  TAUX_REUSSITE_GLOBAL,
} from "@/data/evaluations";
import { Barre, Kpi, Panel, Table, Tag, Td, Th, Tr } from "@/components/leoni/kit";
import { analyseQuestions, tonTaux, useEvaluations } from "@/lib/evaluations-store";

export function VueEnsemble() {
  const { evaluations } = useEvaluations();
  const max = Math.max(...EVAL_PAR_MOIS.map((m) => m.evaluations));

  const questionsDifficiles = evaluations
    .flatMap((e) => analyseQuestions(e).map((q) => ({ ...q, evaluation: e.code, evaluationId: e.evaluationId })))
    .filter((q) => q.taux > 0)
    .sort((a, b) => a.taux - b.taux)
    .slice(0, 6);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label="Évaluations actives" valeur={KPIS_MODULE.actives} ton="brand" />
        <Kpi label="Évaluations ce mois" valeur={KPIS_MODULE.ceMois} ton="info" />
        <Kpi label="Participants prévus" valeur={KPIS_MODULE.participantsPrevus} ton="brand" />
        <Kpi label="Participants ayant terminé" valeur={KPIS_MODULE.participantsTermines} ton="success" />
        <Kpi label="Taux de participation" valeur={KPIS_MODULE.tauxParticipation} suffixe="%" ton="success" />
        <Kpi label="Score moyen" valeur={KPIS_MODULE.scoreMoyen} suffixe="%" ton="brand" />
        <Kpi label="Sous le seuil" valeur={KPIS_MODULE.sousSeuil} ton="critical" />
        <Kpi label="Rattrapages à programmer" valeur={KPIS_MODULE.rattrapagesAProgrammer} ton="warning" />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Panel title="Évaluations réalisées par mois" subtitle="Année 2026">
          <div className="flex h-48 items-end gap-3">
            {EVAL_PAR_MOIS.map((m) => (
              <div key={m.mois} className="flex flex-1 flex-col items-center gap-1.5">
                <span className="num text-[11px] font-medium">{m.evaluations}</span>
                <div
                  className="w-full rounded-sm bg-[var(--brand)]"
                  style={{ height: `${(m.evaluations / max) * 140}px` }}
                />
                <span className="text-[10px] text-muted-foreground">{m.mois.slice(0, 3)}</span>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Taux de réussite" subtitle="Toutes évaluations confondues">
          <ul className="space-y-3">
            {TAUX_REUSSITE_GLOBAL.map((t) => (
              <li key={t.label}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span>{t.label}</span>
                  <span className="num font-medium">{t.valeur} %</span>
                </div>
                <Barre valeur={t.valeur} ton={t.ton} />
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title="Score moyen par type d'évaluation">
          <ul className="space-y-3">
            {SCORE_PAR_TYPE.map((s) => (
              <li key={s.type}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span>{s.type}</span>
                  <span className="num font-medium">{s.score} %</span>
                </div>
                <Barre valeur={s.score} ton={s.score >= 80 ? "success" : "warning"} />
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title="Questions les plus échouées" subtitle="Identification automatique des questions à revoir" bodyClassName="p-0">
          <Table>
            <thead>
              <tr><Th>Question</Th><Th>Évaluation</Th><Th>Catégorie</Th><Th>Réussite</Th></tr>
            </thead>
            <tbody>
              {questionsDifficiles.map((q) => (
                <Tr key={q.questionId + q.evaluationId}>
                  <Td className="max-w-[260px] truncate text-xs">
                    <Link to="/formation/qcm/$id" params={{ id: q.evaluationId }} search={{ onglet: "Analyse" }} className="hover:text-[var(--brand)]">
                      {q.rang} — {q.intitule}
                    </Link>
                  </Td>
                  <Td className="text-xs text-muted-foreground">{q.evaluation}</Td>
                  <Td className="text-xs">{q.categorie}</Td>
                  <Td><Tag ton={tonTaux(q.taux)}>{q.taux} %</Tag></Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        </Panel>
      </div>
    </div>
  );
}
