import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { COLONNES_KANBAN, SITES, type ColonneKanban } from "@/data/leoni";
import { Btn, Kpi, PageHeader, Panel, Select, Table, Tag, Td, Th, Tr } from "@/components/leoni/kit";
import { useLeoni } from "@/lib/leoni-store";

export const Route = createFileRoute("/suivi/reclamations")({
  head: () => ({
    meta: [
      { title: "Réclamations opérateurs — LEONI Workforce Journey" },
      { name: "description", content: "Gestion des réclamations des opérateurs LEONI Maroc : kanban de traitement, priorités, responsables et délais de résolution." },
      { property: "og:title", content: "Réclamations opérateurs — LEONI Workforce Journey" },
      { property: "og:description", content: "Kanban de traitement des réclamations par priorité et par site." },
    ],
  }),
  component: ReclamationsPage,
});

const TON_PRIORITE = { Critique: "critical", "Élevée": "warning", Normale: "info", Faible: "neutral" } as const;

function ReclamationsPage() {
  const { reclamations, deplacerReclamation, creerReclamation, pousserNotification } = useLeoni();
  const [vue, setVue] = useState<"Kanban" | "Tableau">("Kanban");
  const [site, setSite] = useState("Tous les sites");
  const [drag, setDrag] = useState<string | null>(null);

  const liste = reclamations.filter((r) => site === "Tous les sites" || r.site === site);

  const deposer = (statut: ColonneKanban) => {
    if (!drag) return;
    deplacerReclamation(drag, statut);
    pousserNotification({ titre: "Réclamation mise à jour", detail: `${drag} → ${statut}`, ton: "info" });
    setDrag(null);
  };

  return (
    <>
      <PageHeader
        titre="Réclamations opérateurs"
        sousTitre="Qualification, affectation et résolution des réclamations remontées du terrain"
        fil={[{ label: "Suivi & qualité" }, { label: "Réclamations" }]}
        actions={
          <Btn
            variant="primary"
            onClick={() => {
              creerReclamation({
                objet: "Nouvelle réclamation à qualifier",
                ouvrier: "Saisie RH",
                site: "Bouskoura",
                categorie: "Organisation",
                priorite: "Normale",
                responsable: "RH Site",
              });
              pousserNotification({ titre: "Réclamation créée", detail: "Ajoutée à la colonne « Nouvelle ».", ton: "success" });
            }}
          >
            Nouvelle réclamation
          </Btn>
        }
      />

      <div className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label="Réclamations ouvertes" valeur={liste.filter((r) => !["Résolue", "Clôturée"].includes(r.statut)).length} ton="brand" />
        <Kpi label="Critiques" valeur={liste.filter((r) => r.priorite === "Critique").length} ton="critical" />
        <Kpi label="Escaladées" valeur={liste.filter((r) => r.statut === "Escaladée").length} ton="warning" />
        <Kpi label="Résolues / clôturées" valeur={liste.filter((r) => ["Résolue", "Clôturée"].includes(r.statut)).length} ton="success" />
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        {(["Kanban", "Tableau"] as const).map((v) => (
          <button
            key={v}
            onClick={() => setVue(v)}
            className={
              v === vue
                ? "rounded-sm border border-[var(--brand)] bg-[var(--selected)] px-3 py-1.5 text-xs font-medium text-[var(--brand)]"
                : "rounded-sm border border-border px-3 py-1.5 text-xs text-muted-foreground hover:bg-[var(--hover)]"
            }
          >
            {v}
          </button>
        ))}
        <Select className="ml-auto" value={site} onChange={setSite} options={["Tous les sites", ...SITES]} />
      </div>

      {vue === "Kanban" ? (
        <div className="grid gap-3 md:grid-cols-4 xl:grid-cols-8">
          {COLONNES_KANBAN.map((col) => (
            <div
              key={col}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => deposer(col)}
              className="min-h-48 rounded-md border border-border bg-card p-2"
            >
              <p className="mb-2 flex items-center justify-between border-b border-border pb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                {col}
                <span className="num">{liste.filter((r) => r.statut === col).length}</span>
              </p>
              <div className="space-y-2">
                {liste
                  .filter((r) => r.statut === col)
                  .map((r) => (
                    <article
                      key={r.id}
                      draggable
                      onDragStart={() => setDrag(r.id)}
                      className="cursor-grab rounded-sm border border-border bg-background p-2 active:cursor-grabbing"
                    >
                      <p className="num text-[10px] text-[var(--brand)]">{r.id}</p>
                      <p className="mt-0.5 text-xs font-medium leading-snug">{r.objet}</p>
                      <p className="mt-1 text-[10px] text-muted-foreground">{r.ouvrier} · {r.site}</p>
                      <Tag ton={TON_PRIORITE[r.priorite]} className="mt-1">{r.priorite}</Tag>
                    </article>
                  ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <Panel bodyClassName="p-0">
          <Table>
            <thead>
              <tr><Th>Référence</Th><Th>Objet</Th><Th>Opérateur</Th><Th>Site</Th><Th>Catégorie</Th><Th>Priorité</Th><Th>Responsable</Th><Th>Statut</Th><Th>Date</Th></tr>
            </thead>
            <tbody>
              {liste.map((r) => (
                <Tr key={r.id}>
                  <Td className="num text-xs text-[var(--brand)]">{r.id}</Td>
                  <Td className="font-medium">{r.objet}</Td>
                  <Td>{r.ouvrier}</Td>
                  <Td className="text-muted-foreground">{r.site}</Td>
                  <Td className="text-muted-foreground">{r.categorie}</Td>
                  <Td><Tag ton={TON_PRIORITE[r.priorite]}>{r.priorite}</Tag></Td>
                  <Td className="text-muted-foreground">{r.responsable}</Td>
                  <Td><Tag ton={["Résolue", "Clôturée"].includes(r.statut) ? "success" : r.statut === "Escaladée" ? "critical" : "info"}>{r.statut}</Tag></Td>
                  <Td className="num text-xs">{r.date}</Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        </Panel>
      )}
    </>
  );
}
