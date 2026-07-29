import { useMemo } from "react";
import type { Evaluation, Participant } from "@/data/evaluations";
import { Barre, Btn, Modale, Panel, Stat, Table, Tag, Td, Th, Tr } from "@/components/leoni/kit";

export function ResultatModale({
  evaluation,
  participant,
  onClose,
  onRattrapage,
}: {
  evaluation: Evaluation;
  participant: Participant;
  onClose: () => void;
  onRattrapage?: () => void;
}) {
  const reussi = (participant.score ?? 0) >= evaluation.seuil;

  const reponses = useMemo(() => {
    if (participant.reponses.length) return participant.reponses;
    // Reconstitution déterministe pour les évaluations sans détail saisi
    const total = evaluation.questions.reduce((s, q) => s + q.points, 0);
    let restant = Math.round(((participant.score ?? 0) / 100) * total);
    return evaluation.questions.map((q) => {
      const correcte = restant >= q.points;
      if (correcte) restant -= q.points;
      return {
        questionId: q.questionId,
        donnee: correcte ? q.bonneReponse : q.reponses.find((r) => r !== q.bonneReponse) ?? "Sans réponse",
        correcte,
        points: correcte ? q.points : 0,
      };
    });
  }, [evaluation, participant]);

  const parCategorie = useMemo(() => {
    const m = new Map<string, { ok: number; total: number }>();
    evaluation.questions.forEach((q) => {
      const r = reponses.find((x) => x.questionId === q.questionId);
      const c = m.get(q.categorie) ?? { ok: 0, total: 0 };
      c.total += 1;
      if (r?.correcte) c.ok += 1;
      m.set(q.categorie, c);
    });
    return [...m.entries()].map(([categorie, v]) => ({ categorie, taux: Math.round((v.ok / v.total) * 100) }));
  }, [evaluation.questions, reponses]);

  const forts = parCategorie.filter((c) => c.taux >= 85).map((c) => c.categorie);
  const faibles = parCategorie.filter((c) => c.taux < 85).map((c) => c.categorie);
  const pointsObtenus = reponses.reduce((s, r) => s + r.points, 0);
  const pointsTotal = evaluation.questions.reduce((s, q) => s + q.points, 0);

  return (
    <Modale
      large
      titre={`${participant.ouvrier} — ${evaluation.titre}`}
      sousTitre={`${participant.workerId} · ${evaluation.code} · ${evaluation.datePassage} · tentative ${participant.tentative}/${evaluation.tentatives}`}
      onClose={onClose}
      footer={
        <>
          {!reussi && onRattrapage && (
            <Btn variant="primary" onClick={onRattrapage}>
              Programmer un rattrapage
            </Btn>
          )}
          <Btn onClick={onClose}>Fermer</Btn>
        </>
      }
    >
      <div className="mb-4 grid gap-3 sm:grid-cols-4">
        <Stat label="Score" valeur={`${participant.score} / 100`} ton={reussi ? "success" : "critical"} />
        <Stat label="Points" valeur={`${pointsObtenus} / ${pointsTotal}`} />
        <Stat label="Durée" valeur={participant.duree || "—"} />
        <Stat label="Résultat" valeur={reussi ? "RÉUSSI" : "ÉCHOUÉ"} ton={reussi ? "success" : "critical"} />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <Panel title="Détail par question" bodyClassName="p-0">
          <Table>
            <thead>
              <tr>
                <Th>N°</Th>
                <Th>Question</Th>
                <Th>Réponse donnée</Th>
                <Th>Bonne réponse</Th>
                <Th>Points</Th>
                <Th>Catégorie</Th>
              </tr>
            </thead>
            <tbody>
              {evaluation.questions.map((q, i) => {
                const r = reponses.find((x) => x.questionId === q.questionId);
                return (
                  <Tr key={q.questionId}>
                    <Td className="num text-xs text-muted-foreground">Q{i + 1}</Td>
                    <Td className="max-w-[240px] truncate text-xs" >{q.intitule}</Td>
                    <Td className="text-xs">
                      <Tag ton={r?.correcte ? "success" : "critical"}>{r?.correcte ? "Bonne réponse" : "Mauvaise réponse"}</Tag>
                      <span className="mt-1 block max-w-[200px] truncate text-[11px] text-muted-foreground">{r?.donnee}</span>
                    </Td>
                    <Td className="max-w-[180px] truncate text-[11px] text-muted-foreground">{q.bonneReponse}</Td>
                    <Td className="num text-xs">{r?.points ?? 0}/{q.points}</Td>
                    <Td className="text-xs">{q.categorie}</Td>
                  </Tr>
                );
              })}
            </tbody>
          </Table>
        </Panel>

        <div className="space-y-4">
          <Panel title="Analyse par domaine">
            <ul className="space-y-3">
              {parCategorie.map((c) => (
                <li key={c.categorie}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span>{c.categorie}</span>
                    <span className="num font-medium">{c.taux} %</span>
                  </div>
                  <Barre valeur={c.taux} ton={c.taux >= 80 ? "success" : c.taux >= 60 ? "warning" : "critical"} />
                </li>
              ))}
            </ul>
          </Panel>
          <Panel title="Synthèse">
            <p className="label-xs">Points forts</p>
            <p className="mt-1 text-xs">{forts.length ? forts.join(", ") : "Aucun domaine maîtrisé à ce stade."}</p>
            <p className="label-xs mt-3">Axes d'amélioration</p>
            <p className="mt-1 text-xs">{faibles.length ? faibles.join(", ") : "Aucun axe critique identifié."}</p>
            <p className="label-xs mt-3">Impact</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Ce résultat alimente la fiche ouvrier 360°, la matrice de compétences ({evaluation.competence}) et le
              Worker Readiness Score.
            </p>
          </Panel>
        </div>
      </div>
    </Modale>
  );
}
