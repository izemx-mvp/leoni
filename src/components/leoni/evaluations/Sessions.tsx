import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Barre, Btn, Kpi, Panel, StatutBadge, Table, Tag, Td, Th, Tr, Vide } from "@/components/leoni/kit";
import { statsEvaluation, useEvaluations } from "@/lib/evaluations-store";
import { useLeoni } from "@/lib/leoni-store";

export function Sessions() {
  const { evaluations, relancer, prolonger, cloturer } = useEvaluations();
  const { pousserNotification } = useLeoni();
  const enCours = evaluations.filter((e) => e.statut === "En cours" || e.statut === "Ouvert");
  const [selection, setSelection] = useState(enCours[0]?.evaluationId ?? "");
  const evaluation = enCours.find((e) => e.evaluationId === selection) ?? enCours[0];

  if (!evaluation) return <Vide texte="Aucune session en cours actuellement." />;
  const s = statsEvaluation(evaluation);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {enCours.map((e) => (
          <button
            key={e.evaluationId}
            onClick={() => setSelection(e.evaluationId)}
            className={
              e.evaluationId === evaluation.evaluationId
                ? "rounded-sm border border-[var(--brand)] bg-[var(--selected)] px-3 py-1.5 text-xs font-medium text-[var(--brand)]"
                : "rounded-sm border border-border px-3 py-1.5 text-xs hover:bg-[var(--hover)]"
            }
          >
            {e.code} — {e.titre}
          </button>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <Kpi label="Participants affectés" valeur={s.affectes} ton="brand" />
        <Kpi label="Terminés" valeur={s.termines} ton="success" />
        <Kpi label="En cours" valeur={evaluation.participants.filter((p) => p.statut === "En cours").length} ton="info" />
        <Kpi label="Non commencés" valeur={evaluation.participants.filter((p) => p.statut === "Non commencé").length} ton="warning" />
        <Kpi label="Absents" valeur={s.absents} ton="critical" />
      </div>

      <Panel
        title="Suivi en temps réel"
        subtitle={`${evaluation.code} · ouverture ${evaluation.ouverture} · fermeture ${evaluation.fermeture}`}
        bodyClassName="p-0"
        action={
          <div className="flex flex-wrap gap-2">
            <Btn size="sm" onClick={() => { relancer(evaluation.evaluationId); pousserNotification({ titre: "Rappel envoyé", detail: `${evaluation.code} — participants non terminés`, ton: "info" }); }}>
              Envoyer un rappel
            </Btn>
            <Btn size="sm" onClick={() => { prolonger(evaluation.evaluationId, `${evaluation.datePassage} 19:00`); pousserNotification({ titre: "Délai prolongé", detail: `${evaluation.code} — fermeture 19:00`, ton: "info" }); }}>
              Prolonger le délai
            </Btn>
            <Btn size="sm" variant="primary" onClick={() => { cloturer(evaluation.evaluationId); pousserNotification({ titre: "Session clôturée", detail: evaluation.code, ton: "warning" }); }}>
              Clôturer la session
            </Btn>
          </div>
        }
      >
        <div className="border-b border-border px-4 py-3">
          <div className="mb-1 flex items-center justify-between text-xs">
            <span>Avancement global</span>
            <span className="num font-medium">{s.affectes ? Math.round((s.termines / s.affectes) * 100) : 0} %</span>
          </div>
          <Barre valeur={s.affectes ? (s.termines / s.affectes) * 100 : 0} ton="brand" />
        </div>
        <Table>
          <thead>
            <tr><Th>Ouvrier</Th><Th>Matricule</Th><Th>Groupe</Th><Th>Statut</Th><Th>Progression</Th><Th>Score</Th><Th>Notification</Th></tr>
          </thead>
          <tbody>
            {evaluation.participants.map((p) => (
              <Tr key={p.assignmentId}>
                <Td className="font-medium">
                  <Link to="/ouvriers/$id" params={{ id: p.workerId }} className="hover:text-[var(--brand)]">{p.ouvrier}</Link>
                </Td>
                <Td className="num text-xs text-[var(--brand)]">{p.workerId}</Td>
                <Td className="text-xs">{p.groupe}</Td>
                <Td><StatutBadge valeur={p.statut} /></Td>
                <Td className="text-xs text-muted-foreground">{p.progression ?? (p.statut === "Terminé" ? "Terminé" : "—")}</Td>
                <Td className="num">{p.score !== null ? `${p.score} %` : "—"}</Td>
                <Td><Tag ton="info">{p.notification}</Tag></Td>
              </Tr>
            ))}
          </tbody>
        </Table>
      </Panel>
    </div>
  );
}
