import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Btn, Panel, Select, StatutBadge, Table, Tag, Td, Th, Tr, Vide } from "@/components/leoni/kit";
import { statsEvaluation, useEvaluations } from "@/lib/evaluations-store";

export function Historique() {
  const navigate = useNavigate();
  const { evaluations, audit } = useEvaluations();
  const [periode, setPeriode] = useState("Toutes");
  const [site, setSite] = useState("Tous");
  const [type, setType] = useState("Tous");

  const historique = evaluations
    .filter((e) => ["Terminé", "Archivé", "En cours"].includes(e.statut))
    .filter((e) => (site === "Tous" || e.site === site) && (type === "Tous" || e.type === type))
    .filter((e) => periode === "Toutes" || e.datePassage.slice(3, 10) === periode);

  return (
    <div className="space-y-4">
      <Panel
        title="Historique des évaluations"
        subtitle="Quelle évaluation, quand, par combien de personnes, avec quels résultats — cliquez pour ouvrir le détail complet"
        bodyClassName="p-0"
      >
        <div className="flex flex-wrap items-center gap-2 border-b border-border p-3">
          <Select value={periode} onChange={setPeriode} options={["Toutes", "07/2026", "08/2026"]} />
          <Select value={site} onChange={setSite} options={["Tous", ...new Set(evaluations.map((e) => e.site))]} />
          <Select value={type} onChange={setType} options={["Tous", ...new Set(evaluations.map((e) => e.type))]} />
        </div>
        <Table>
          <thead>
            <tr>
              <Th>Date</Th><Th>Code</Th><Th>Évaluation</Th><Th>Type</Th><Th>Formation</Th><Th>Site</Th>
              <Th>Participants</Th><Th>Terminés</Th><Th>Réussis</Th><Th>Échoués</Th><Th>Score moyen</Th>
              <Th>Créateur</Th><Th>Statut</Th>
            </tr>
          </thead>
          <tbody>
            {historique.map((e) => {
              const s = statsEvaluation(e);
              return (
                <Tr
                  key={e.evaluationId}
                  onClick={() => navigate({ to: "/formation/qcm/$id", params: { id: e.evaluationId }, search: { onglet: "Vue d'ensemble" } })}
                >
                  <Td className="num text-xs">{e.datePassage}</Td>
                  <Td className="num text-xs font-medium text-[var(--brand)]">{e.code}</Td>
                  <Td className="font-medium">{e.titre}</Td>
                  <Td><Tag ton="info">{e.type}</Tag></Td>
                  <Td className="max-w-[180px] truncate text-xs text-muted-foreground">{e.formation}</Td>
                  <Td className="text-xs">{e.site}</Td>
                  <Td className="num">{s.affectes}</Td>
                  <Td className="num">{s.termines}</Td>
                  <Td className="num text-[var(--success)]">{s.reussis}</Td>
                  <Td className="num text-[var(--critical)]">{s.echoues}</Td>
                  <Td className="num font-medium">{s.scoreMoyen ? `${s.scoreMoyen} %` : "—"}</Td>
                  <Td className="text-xs">{e.createur}</Td>
                  <Td><StatutBadge valeur={e.statut} /></Td>
                </Tr>
              );
            })}
          </tbody>
        </Table>
        {!historique.length && <Vide texte="Aucune évaluation dans l'historique pour ces filtres." />}
      </Panel>

      <Panel title="Journal d'audit" subtitle="Création, modification, publication, affectation, passage, résultat, correction, rattrapage, archivage" bodyClassName="p-0">
        <Table>
          <thead>
            <tr><Th>Date</Th><Th>Utilisateur</Th><Th>Évaluation</Th><Th>Action</Th><Th>Détail</Th></tr>
          </thead>
          <tbody>
            {audit.map((a) => {
              const e = evaluations.find((x) => x.evaluationId === a.evaluationId);
              return (
                <Tr key={a.id}>
                  <Td className="num text-xs">{a.date}</Td>
                  <Td className="text-xs font-medium">{a.utilisateur}</Td>
                  <Td className="num text-xs text-[var(--brand)]">{e?.code ?? a.evaluationId}</Td>
                  <Td><Tag ton="info">{a.action}</Tag></Td>
                  <Td className="text-xs text-muted-foreground">{a.detail}</Td>
                </Tr>
              );
            })}
          </tbody>
        </Table>
      </Panel>
    </div>
  );
}

export function AuditEvaluation({ evaluationId }: { evaluationId: string }) {
  const { audit } = useEvaluations();
  const lignes = audit.filter((a) => a.evaluationId === evaluationId);
  return (
    <Panel title="Historique & audit de l'évaluation" bodyClassName="p-0">
      <Table>
        <thead>
          <tr><Th>Date</Th><Th>Utilisateur</Th><Th>Action</Th><Th>Détail</Th></tr>
        </thead>
        <tbody>
          {lignes.map((a) => (
            <Tr key={a.id}>
              <Td className="num text-xs">{a.date}</Td>
              <Td className="text-xs font-medium">{a.utilisateur}</Td>
              <Td><Tag ton="info">{a.action}</Tag></Td>
              <Td className="text-xs text-muted-foreground">{a.detail}</Td>
            </Tr>
          ))}
        </tbody>
      </Table>
      {!lignes.length && <Vide texte="Aucun évènement enregistré pour cette évaluation." />}
      <p className="border-t border-border px-4 py-2 text-[11px] text-muted-foreground">
        Bouton d'export disponible pour la conformité — toutes les actions sont horodatées et nominatives.
      </p>
    </Panel>
  );
}

export function DroitsPanel() {
  return (
    <Panel title="Droits & permissions" subtitle="Application des rôles sur le module Évaluations">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { role: "Responsable Formation", droits: ["Créer", "Modifier", "Publier", "Voir résultats"] },
          { role: "Formateur", droits: ["Créer (si autorisé)", "Évaluer", "Voir son groupe"] },
          { role: "RH", droits: ["Voir résultats", "Voir historique"] },
          { role: "Ouvrier", droits: ["Passer les évaluations affectées"] },
          { role: "Administrateur", droits: ["Gestion complète du module"] },
        ].map((r) => (
          <div key={r.role} className="rounded-sm border border-border p-3">
            <p className="text-xs font-semibold">{r.role}</p>
            <ul className="mt-2 space-y-1">
              {r.droits.map((d) => (
                <li key={d} className="text-[11px] text-muted-foreground">• {d}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Panel>
  );
}

export function BoutonExport({ onExport }: { onExport: () => void }) {
  return <Btn size="sm" onClick={onExport}>Exporter</Btn>;
}
