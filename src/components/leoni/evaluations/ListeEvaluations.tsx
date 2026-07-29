import { useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { STATUTS_EVALUATION, TYPES_EVALUATION } from "@/data/evaluations";
import { Btn, Panel, Select, StatutBadge, Table, Tag, Td, Th, Tr, Vide } from "@/components/leoni/kit";
import { statsEvaluation, useEvaluations } from "@/lib/evaluations-store";
import { useLeoni } from "@/lib/leoni-store";

export function ListeEvaluations() {
  const navigate = useNavigate();
  const { evaluations, publier, programmer, dupliquer, changerStatut, supprimer } = useEvaluations();
  const { pousserNotification } = useLeoni();

  const [statut, setStatut] = useState("Tous");
  const [type, setType] = useState("Tous");
  const [site, setSite] = useState("Tous");
  const [formation, setFormation] = useState("Toutes");
  const [createur, setCreateur] = useState("Tous");
  const [scoreMin, setScoreMin] = useState("0");
  const [participationMin, setParticipationMin] = useState("0");
  const [q, setQ] = useState("");
  const [menu, setMenu] = useState<string | null>(null);

  const sites = ["Tous", ...new Set(evaluations.map((e) => e.site))];
  const formations = ["Toutes", ...new Set(evaluations.map((e) => e.formation))];
  const createurs = ["Tous", ...new Set(evaluations.map((e) => e.createur))];

  const lignes = useMemo(
    () =>
      evaluations
        .map((e) => ({ e, s: statsEvaluation(e) }))
        .filter(({ e, s }) => {
          const participation = s.affectes ? (s.termines / s.affectes) * 100 : 0;
          return (
            (statut === "Tous" || e.statut === statut) &&
            (type === "Tous" || e.type === type) &&
            (site === "Tous" || e.site === site) &&
            (formation === "Toutes" || e.formation === formation) &&
            (createur === "Tous" || e.createur === createur) &&
            s.scoreMoyen >= Number(scoreMin) &&
            participation >= Number(participationMin) &&
            (q === "" || `${e.code} ${e.titre} ${e.module}`.toLowerCase().includes(q.toLowerCase()))
          );
        }),
    [evaluations, statut, type, site, formation, createur, scoreMin, participationMin, q],
  );

  const ouvrir = (id: string, onglet = "Vue d'ensemble") =>
    navigate({ to: "/formation/qcm/$id", params: { id }, search: { onglet } });

  return (
    <Panel
      title={`Toutes les évaluations (${lignes.length})`}
      subtitle="Double-cliquez sur une ligne pour ouvrir la fiche évaluation"
      bodyClassName="p-0"
      action={
        <Btn variant="primary" size="sm" onClick={() => navigate({ to: "/formation/qcm/nouvelle" })}>
          + Nouvelle évaluation
        </Btn>
      }
    >
      <div className="flex flex-wrap items-end gap-2 border-b border-border p-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Rechercher un code, un titre, un module…"
          className="h-9 min-w-56 flex-1 rounded-sm border border-border bg-card px-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]"
        />
        <Select value={statut} onChange={setStatut} options={["Tous", ...STATUTS_EVALUATION]} />
        <Select value={type} onChange={setType} options={["Tous", ...TYPES_EVALUATION]} />
        <Select value={site} onChange={setSite} options={sites} />
        <Select value={formation} onChange={setFormation} options={formations} />
        <Select value={createur} onChange={setCreateur} options={createurs} />
        <Select value={scoreMin} onChange={setScoreMin} options={["0", "60", "70", "80", "90"]} />
        <Select value={participationMin} onChange={setParticipationMin} options={["0", "50", "75", "90"]} />
      </div>

      <Table>
        <thead>
          <tr>
            <Th>Code</Th><Th>Titre</Th><Th>Type</Th><Th>Formation / module</Th><Th>Site</Th><Th>Statut</Th>
            <Th>Créée le</Th><Th>Passage</Th><Th>Particip.</Th><Th>Terminés</Th><Th>Score moy.</Th><Th>Seuil</Th>
            <Th>Créateur</Th><Th>Actions</Th>
          </tr>
        </thead>
        <tbody>
          {lignes.map(({ e, s }) => (
            <Tr key={e.evaluationId} onDoubleClick={() => ouvrir(e.evaluationId)} title="Double-clic : ouvrir la fiche">
              <Td className="num text-xs font-medium text-[var(--brand)]">{e.code}</Td>
              <Td className="font-medium">{e.titre}</Td>
              <Td><Tag ton="info">{e.type}</Tag></Td>
              <Td className="text-xs text-muted-foreground">{e.module}</Td>
              <Td className="text-xs">{e.site}</Td>
              <Td><StatutBadge valeur={e.statut} /></Td>
              <Td className="num text-xs text-muted-foreground">{e.dateCreation}</Td>
              <Td className="num text-xs">{e.datePassage}</Td>
              <Td className="num">{s.affectes}</Td>
              <Td className="num">{s.termines}</Td>
              <Td className="num">{s.scoreMoyen ? `${s.scoreMoyen} %` : "—"}</Td>
              <Td className="num text-xs">{e.seuil} %</Td>
              <Td className="text-xs">{e.createur}</Td>
              <Td>
                <div className="relative">
                  <Btn size="sm" onClick={() => setMenu(menu === e.evaluationId ? null : e.evaluationId)}>
                    Actions ▾
                  </Btn>
                  {menu === e.evaluationId && (
                    <div className="absolute right-0 z-20 mt-1 w-52 rounded-sm border border-border bg-card p-1 shadow-lg">
                      {[
                        { l: "Voir", f: () => ouvrir(e.evaluationId) },
                        { l: "Modifier", f: () => ouvrir(e.evaluationId, "Questions") },
                        {
                          l: "Dupliquer",
                          f: () => {
                            dupliquer(e.evaluationId);
                            pousserNotification({ titre: "Évaluation dupliquée", detail: `${e.code} → brouillon`, ton: "info" });
                          },
                        },
                        {
                          l: "Publier",
                          f: () => {
                            publier(e.evaluationId);
                            pousserNotification({ titre: "Évaluation publiée", detail: `${e.code} diffusée aux participants`, ton: "success" });
                          },
                        },
                        { l: "Affecter", f: () => ouvrir(e.evaluationId, "Participants") },
                        { l: "Voir résultats", f: () => ouvrir(e.evaluationId, "Résultats") },
                        { l: "Programmer", f: () => { programmer(e.evaluationId); pousserNotification({ titre: "Évaluation programmée", detail: `${e.code} — ${e.datePassage}`, ton: "info" }); } },
                        { l: "Programmer rattrapage", f: () => ouvrir(e.evaluationId, "Rattrapages") },
                        { l: "Archiver", f: () => { changerStatut(e.evaluationId, "Archivé"); pousserNotification({ titre: "Évaluation archivée", detail: e.code, ton: "info" }); } },
                        { l: "Supprimer", f: () => { supprimer(e.evaluationId); pousserNotification({ titre: "Évaluation supprimée", detail: e.code, ton: "warning" }); } },
                      ].map((a) => (
                        <button
                          key={a.l}
                          onClick={() => { a.f(); setMenu(null); }}
                          className="block w-full rounded-sm px-2 py-1.5 text-left text-xs hover:bg-[var(--hover)]"
                        >
                          {a.l}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </Td>
            </Tr>
          ))}
        </tbody>
      </Table>
      {!lignes.length && <Vide texte="Aucune évaluation ne correspond aux filtres sélectionnés." />}
    </Panel>
  );
}
