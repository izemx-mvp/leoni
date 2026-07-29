import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Btn, Panel, Select, Table, Tag, Td, Th, Tr, Vide } from "@/components/leoni/kit";
import { ResultatModale } from "@/components/leoni/evaluations/ResultatModale";
import { toutesLignesResultats, useEvaluations } from "@/lib/evaluations-store";
import { useLeoni } from "@/lib/leoni-store";

export function Resultats() {
  const { evaluations } = useEvaluations();
  const { pousserNotification } = useLeoni();
  const toutes = useMemo(() => toutesLignesResultats(evaluations), [evaluations]);

  const [evaluation, setEvaluation] = useState("Toutes");
  const [site, setSite] = useState("Tous");
  const [groupe, setGroupe] = useState("Tous");
  const [formation, setFormation] = useState("Toutes");
  const [resultat, setResultat] = useState("Tous");
  const [scoreMin, setScoreMin] = useState("0");
  const [q, setQ] = useState("");
  const [ouvert, setOuvert] = useState<string | null>(null);

  const lignes = toutes.filter(
    (l) =>
      (evaluation === "Toutes" || l.code === evaluation) &&
      (site === "Tous" || l.site === site) &&
      (groupe === "Tous" || l.groupe === groupe) &&
      (formation === "Toutes" || l.formation === formation) &&
      (resultat === "Tous" || l.resultat === resultat) &&
      l.score >= Number(scoreMin) &&
      (q === "" || `${l.ouvrier} ${l.workerId}`.toLowerCase().includes(q.toLowerCase())),
  );

  const detail = (() => {
    if (!ouvert) return null;
    for (const e of evaluations) {
      const p = e.participants.find((x) => x.resultId === ouvert);
      if (p) return { e, p };
    }
    return null;
  })();

  return (
    <>
      <Panel
        title={`Résultats (${lignes.length})`}
        subtitle="Toutes les tentatives, toutes évaluations confondues — cliquez pour ouvrir le détail"
        bodyClassName="p-0"
        action={
          <Btn size="sm" onClick={() => pousserNotification({ titre: "Export généré", detail: `${lignes.length} résultat(s) exporté(s) en Excel`, ton: "success" })}>
            Exporter les résultats
          </Btn>
        }
      >
        <div className="flex flex-wrap items-center gap-2 border-b border-border p-3">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Ouvrier ou matricule…"
            className="h-9 min-w-52 flex-1 rounded-sm border border-border bg-card px-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]"
          />
          <Select value={evaluation} onChange={setEvaluation} options={["Toutes", ...new Set(toutes.map((l) => l.code))]} />
          <Select value={formation} onChange={setFormation} options={["Toutes", ...new Set(toutes.map((l) => l.formation))]} />
          <Select value={site} onChange={setSite} options={["Tous", ...new Set(toutes.map((l) => l.site))]} />
          <Select value={groupe} onChange={setGroupe} options={["Tous", ...new Set(toutes.map((l) => l.groupe))]} />
          <Select value={resultat} onChange={setResultat} options={["Tous", "Réussi", "Échoué"]} />
          <Select value={scoreMin} onChange={setScoreMin} options={["0", "60", "70", "80", "90"]} />
        </div>

        <Table>
          <thead>
            <tr>
              <Th>Date</Th><Th>Évaluation</Th><Th>Type</Th><Th>Ouvrier</Th><Th>Matricule</Th><Th>Formation</Th>
              <Th>Site</Th><Th>Tentative</Th><Th>Score</Th><Th>Résultat</Th><Th>Durée</Th>
            </tr>
          </thead>
          <tbody>
            {lignes.map((l) => (
              <Tr key={l.resultId} onClick={() => setOuvert(l.resultId)} title="Ouvrir le détail du résultat">
                <Td className="num text-xs">{l.date}</Td>
                <Td className="font-medium">{l.code} — {l.evaluation}</Td>
                <Td><Tag ton="info">{l.type}</Tag></Td>
                <Td>
                  <Link to="/ouvriers/$id" params={{ id: l.workerId }} className="hover:text-[var(--brand)]">{l.ouvrier}</Link>
                </Td>
                <Td className="num text-xs text-[var(--brand)]">{l.workerId}</Td>
                <Td className="max-w-[200px] truncate text-xs text-muted-foreground">{l.formation}</Td>
                <Td className="text-xs">{l.site}</Td>
                <Td className="num text-xs">{l.tentative}</Td>
                <Td className="num font-medium">{l.score} %</Td>
                <Td><Tag ton={l.resultat === "Réussi" ? "success" : "critical"}>{l.resultat}</Tag></Td>
                <Td className="num text-xs text-muted-foreground">{l.duree}</Td>
              </Tr>
            ))}
          </tbody>
        </Table>
        {!lignes.length && <Vide texte="Aucun résultat pour ces filtres." />}
      </Panel>

      {detail && (
        <ResultatModale evaluation={detail.e} participant={detail.p} onClose={() => setOuvert(null)} />
      )}
    </>
  );
}
