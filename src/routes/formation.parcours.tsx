import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PARCOURS } from "@/data/leoni";
import { Barre, Btn, Kpi, PageHeader, Panel, Table, Tag, Td, Th, Tr } from "@/components/leoni/kit";

export const Route = createFileRoute("/formation/parcours")({
  head: () => ({
    meta: [
      { title: "Parcours de formation — LEONI Workforce Journey" },
      { name: "description", content: "Catalogue des parcours d'intégration LEONI Maroc : modules, durée, seuils de validation et effectifs inscrits." },
      { property: "og:title", content: "Parcours de formation — LEONI Workforce Journey" },
      { property: "og:description", content: "Catalogue des parcours d'intégration et de qualification des opérateurs." },
    ],
  }),
  component: ParcoursPage,
});

function ParcoursPage() {
  const [selection, setSelection] = useState(PARCOURS[0].code);
  const parcours = PARCOURS.find((p) => p.code === selection)!;

  return (
    <>
      <PageHeader
        titre="Parcours de formation"
        sousTitre="Référentiel des parcours d'intégration et de qualification des opérateurs"
        fil={[{ label: "Formation" }, { label: "Parcours" }]}
        actions={<Btn variant="primary">Nouveau parcours</Btn>}
      />

      <div className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label="Parcours actifs" valeur={PARCOURS.length} ton="brand" />
        <Kpi label="Opérateurs inscrits" valeur={PARCOURS.reduce((s, p) => s + p.inscrits, 0)} ton="info" />
        <Kpi label="Modules référencés" valeur={PARCOURS.reduce((s, p) => s + p.modules.length, 0)} ton="neutral" />
        <Kpi label="Seuil moyen de validation" valeur={Math.round(PARCOURS.reduce((s, p) => s + p.seuil, 0) / PARCOURS.length)} suffixe="%" ton="success" />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <Panel title="Catalogue des parcours" bodyClassName="p-0">
          <Table>
            <thead>
              <tr>
                <Th>Code</Th><Th>Parcours</Th><Th>Durée</Th><Th>Modules</Th><Th>Seuil</Th><Th>Présence min.</Th><Th>Inscrits</Th>
              </tr>
            </thead>
            <tbody>
              {PARCOURS.map((p) => (
                <Tr key={p.code} onClick={() => setSelection(p.code)} className={p.code === selection ? "bg-[var(--selected)]" : ""}>
                  <Td className="num text-xs text-[var(--brand)]">{p.code}</Td>
                  <Td className="font-medium">{p.nom}</Td>
                  <Td className="num text-muted-foreground">{p.duree}</Td>
                  <Td className="num">{p.modules.length}</Td>
                  <Td className="num">{p.seuil} %</Td>
                  <Td className="num">{p.presenceMin} %</Td>
                  <Td className="num font-medium">{p.inscrits}</Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        </Panel>

        <Panel title={parcours.nom} subtitle={`${parcours.code} — ${parcours.duree}`}>
          <div className="mb-4 flex flex-wrap gap-2">
            <Tag ton="brand">Seuil {parcours.seuil} %</Tag>
            <Tag ton="info">Présence min. {parcours.presenceMin} %</Tag>
            <Tag ton="neutral">{parcours.inscrits} inscrits</Tag>
          </div>
          <ol className="space-y-2">
            {parcours.modules.map((m, i) => (
              <li key={m} className="flex items-center gap-3 rounded-sm border border-border px-3 py-2">
                <span className="num flex size-6 items-center justify-center rounded-sm bg-[var(--brand-soft)] text-[11px] font-semibold text-[var(--brand)]">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="flex-1 text-sm">{m}</span>
                <div className="w-20">
                  <Barre valeur={Math.max(20, 100 - i * 8)} ton="brand" />
                </div>
              </li>
            ))}
          </ol>
        </Panel>
      </div>
    </>
  );
}
