import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { FORMATEURS, LIEUX } from "@/data/evaluations";
import { Btn, Champ, Input, Kpi, Modale, Panel, Table, Tag, Td, Textarea, Th, Tr, Vide } from "@/components/leoni/kit";
import { useEvaluations } from "@/lib/evaluations-store";
import { useLeoni } from "@/lib/leoni-store";

export function Rattrapages({ evaluationId }: { evaluationId?: string }) {
  const { rattrapages, programmerRattrapages } = useEvaluations();
  const { pousserNotification } = useLeoni();
  const lignes = rattrapages.filter((r) => !evaluationId || r.evaluationId === evaluationId);

  const [selection, setSelection] = useState<string[]>([]);
  const [ouvert, setOuvert] = useState(false);
  const [date, setDate] = useState("03/08/2026");
  const [heure, setHeure] = useState("09:00");
  const [lieu, setLieu] = useState(LIEUX[0]);
  const [duree, setDuree] = useState("30");
  const [formateur, setFormateur] = useState(FORMATEURS[0]);
  const [message, setMessage] = useState(
    "Bonjour, une session de rattrapage vous a été programmée. Merci de vous présenter 10 minutes avant le début.",
  );

  const bascule = (id: string) => setSelection((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  return (
    <>
      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <Kpi label="À programmer" valeur={lignes.filter((r) => r.statut === "À programmer").length} ton="critical" />
        <Kpi label="Programmés" valeur={lignes.filter((r) => r.statut === "Programmé").length} ton="warning" />
        <Kpi label="Réalisés" valeur={lignes.filter((r) => r.statut === "Réalisé").length} ton="success" />
      </div>

      <Panel
        title={`Rattrapages (${lignes.length})`}
        subtitle="Opérateurs sous le seuil de réussite, toutes évaluations confondues"
        bodyClassName="p-0"
        action={
          <Btn variant="primary" size="sm" disabled={!selection.length} onClick={() => setOuvert(true)}>
            Programmer les rattrapages sélectionnés ({selection.length})
          </Btn>
        }
      >
        <Table>
          <thead>
            <tr>
              <Th />
              <Th>Ouvrier</Th><Th>Matricule</Th><Th>Évaluation</Th><Th>Score</Th><Th>Seuil</Th><Th>Tentative</Th>
              <Th>Site</Th><Th>Statut rattrapage</Th><Th>Séance</Th>
            </tr>
          </thead>
          <tbody>
            {lignes.map((r) => (
              <Tr key={r.id}>
                <Td>
                  <input
                    type="checkbox"
                    checked={selection.includes(r.id)}
                    onChange={() => bascule(r.id)}
                    disabled={r.statut !== "À programmer"}
                  />
                </Td>
                <Td className="font-medium">
                  <Link to="/ouvriers/$id" params={{ id: r.workerId }} className="hover:text-[var(--brand)]">{r.ouvrier}</Link>
                </Td>
                <Td className="num text-xs text-[var(--brand)]">{r.workerId}</Td>
                <Td className="text-xs">{r.evaluation}</Td>
                <Td className="num font-medium text-[var(--critical)]">{r.score} %</Td>
                <Td className="num text-xs">{r.seuil} %</Td>
                <Td className="num text-xs">{r.tentative}</Td>
                <Td className="text-xs">{r.site}</Td>
                <Td><Tag ton={r.statut === "Programmé" ? "warning" : r.statut === "Réalisé" ? "success" : "critical"}>{r.statut}</Tag></Td>
                <Td className="text-xs text-muted-foreground">
                  {r.date ? `${r.date} ${r.heure} — ${r.lieu} (${r.formateur})` : "—"}
                </Td>
              </Tr>
            ))}
          </tbody>
        </Table>
        {!lignes.length && <Vide texte="Aucun rattrapage en attente." />}
      </Panel>

      {ouvert && (
        <Modale
          titre="Programmer une session de rattrapage"
          sousTitre={`${selection.length} participant(s) sélectionné(s)`}
          onClose={() => setOuvert(false)}
          footer={
            <>
              <Btn onClick={() => setOuvert(false)}>Annuler</Btn>
              <Btn
                variant="primary"
                onClick={() => {
                  programmerRattrapages(selection, { date, heure, lieu, formateur });
                  pousserNotification({
                    titre: "Rattrapages programmés",
                    detail: `${selection.length} participant(s) — ${date} à ${heure} (${lieu})`,
                    ton: "warning",
                  });
                  setSelection([]);
                  setOuvert(false);
                }}
              >
                Programmer et notifier
              </Btn>
            </>
          }
        >
          <div className="mb-3 rounded-sm border border-border p-3 text-xs">
            {rattrapages
              .filter((r) => selection.includes(r.id))
              .map((r) => (
                <p key={r.id}>
                  {r.ouvrier} — {r.evaluation} ({r.score} % / seuil {r.seuil} %)
                </p>
              ))}
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <Input label="Date" value={date} onChange={(e) => setDate(e.target.value)} />
            <Input label="Heure" value={heure} onChange={(e) => setHeure(e.target.value)} />
            <Champ label="Lieu" value={lieu} onChange={setLieu} options={LIEUX} />
            <Input label="Durée (minutes)" value={duree} onChange={(e) => setDuree(e.target.value)} />
            <Champ label="Formateur / superviseur" value={formateur} onChange={setFormateur} options={FORMATEURS} />
            <Input label="Tentative" value="2/2" readOnly />
            <div className="md:col-span-2">
              <Textarea label="Message aux participants" rows={3} value={message} onChange={(e) => setMessage(e.target.value)} />
            </div>
          </div>
          <p className="mt-3 text-[11px] text-muted-foreground">
            À la validation : notification envoyée, séance ajoutée au planning, fiche ouvrier et historique mis à jour.
          </p>
        </Modale>
      )}
    </>
  );
}
