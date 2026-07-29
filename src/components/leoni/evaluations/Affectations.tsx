import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Btn, Panel, StatutBadge, Table, Tag, Td, Th, Tr, Vide } from "@/components/leoni/kit";
import { statsEvaluation, useEvaluations } from "@/lib/evaluations-store";
import { useLeoni } from "@/lib/leoni-store";

export function Affectations() {
  const { evaluations, publier, relancer } = useEvaluations();
  const { pousserNotification } = useLeoni();
  const [apercu, setApercu] = useState<string | null>(null);

  const avecAffectations = evaluations.filter((e) => e.participants.length > 0);

  return (
    <div className="space-y-4">
      <Panel title="Affectations & diffusion" subtitle="Qui a reçu l'évaluation, sur quel canal, et où en est la diffusion" bodyClassName="p-0">
        <Table>
          <thead>
            <tr>
              <Th>Code</Th><Th>Évaluation</Th><Th>Cible</Th><Th>Affectés</Th><Th>Notifiés</Th><Th>Lu / ouvert</Th>
              <Th>Canaux</Th><Th>Rappels</Th><Th>Statut</Th><Th>Actions</Th>
            </tr>
          </thead>
          <tbody>
            {avecAffectations.map((e) => {
              const s = statsEvaluation(e);
              const lus = e.participants.filter((p) => p.notification === "Lu" || p.notification === "Ouvert").length;
              return (
                <Tr key={e.evaluationId}>
                  <Td className="num text-xs font-medium text-[var(--brand)]">{e.code}</Td>
                  <Td className="font-medium">{e.titre}</Td>
                  <Td className="text-xs text-muted-foreground">{e.formation} · {e.site}</Td>
                  <Td className="num">{s.affectes}</Td>
                  <Td className="num">{e.participants.length}</Td>
                  <Td className="num">{lus}</Td>
                  <Td className="text-xs">{e.canaux.join(", ")}</Td>
                  <Td className="text-xs text-muted-foreground">{e.rappels.join(" · ") || "—"}</Td>
                  <Td><StatutBadge valeur={e.statut} /></Td>
                  <Td>
                    <div className="flex flex-wrap gap-1">
                      <Btn size="sm" onClick={() => setApercu(e.evaluationId)}>Aperçu message</Btn>
                      <Btn size="sm" onClick={() => { publier(e.evaluationId); pousserNotification({ titre: "Diffusion effectuée", detail: `${e.code} — ${s.affectes} participant(s)`, ton: "success" }); }}>
                        Diffuser
                      </Btn>
                      <Btn size="sm" onClick={() => { relancer(e.evaluationId); pousserNotification({ titre: "Rappel envoyé", detail: e.code, ton: "info" }); }}>
                        Relancer
                      </Btn>
                    </div>
                  </Td>
                </Tr>
              );
            })}
          </tbody>
        </Table>
        {!avecAffectations.length && <Vide texte="Aucune affectation générée pour l'instant." />}
      </Panel>

      {apercu && (() => {
        const e = evaluations.find((x) => x.evaluationId === apercu)!;
        return (
          <Panel
            title="Aperçu de la notification envoyée aux participants"
            subtitle={`${e.code} — canaux : ${e.canaux.join(", ")}`}
            action={<Btn size="sm" onClick={() => setApercu(null)}>Fermer</Btn>}
          >
            <div className="max-w-md rounded-md border border-border bg-[var(--brand-soft)] p-4 text-sm">
              <p>Bonjour Sara,</p>
              <p className="mt-2">Une nouvelle évaluation vous a été affectée.</p>
              <p className="mt-2 font-semibold">{e.titre}</p>
              <p className="num mt-1 text-xs">Date : {e.datePassage}</p>
              <p className="num text-xs">Durée : {e.duree} minutes</p>
              <p className="num text-xs">Date limite : {e.fermeture}</p>
              <Btn variant="primary" size="sm" className="mt-3">Accéder au test</Btn>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {["Envoyé", "Distribué", "Lu", "Ouvert"].map((s) => (
                <Tag key={s} ton="info">{s}</Tag>
              ))}
            </div>
          </Panel>
        );
      })()}

      <Panel title="Participants affectés par évaluation" bodyClassName="p-0">
        <Table>
          <thead>
            <tr><Th>Évaluation</Th><Th>Ouvrier</Th><Th>Matricule</Th><Th>Site</Th><Th>Groupe</Th><Th>Notification</Th><Th>Statut</Th></tr>
          </thead>
          <tbody>
            {avecAffectations.flatMap((e) =>
              e.participants.map((p) => (
                <Tr key={p.assignmentId}>
                  <Td className="num text-xs text-[var(--brand)]">{e.code}</Td>
                  <Td className="font-medium">
                    <Link to="/ouvriers/$id" params={{ id: p.workerId }} className="hover:text-[var(--brand)]">{p.ouvrier}</Link>
                  </Td>
                  <Td className="num text-xs">{p.workerId}</Td>
                  <Td className="text-xs">{p.site}</Td>
                  <Td className="text-xs">{p.groupe}</Td>
                  <Td><Tag ton="info">{p.notification}</Tag></Td>
                  <Td><StatutBadge valeur={p.statut} /></Td>
                </Tr>
              )),
            )}
          </tbody>
        </Table>
      </Panel>
    </div>
  );
}
