import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { FEEDBACKS } from "@/data/leoni";
import { Btn, Kpi, PageHeader, Panel, Select, Table, Tag, Td, Th, Tr } from "@/components/leoni/kit";
import { useLeoni } from "@/lib/leoni-store";

export const Route = createFileRoute("/suivi/observations")({
  head: () => ({
    meta: [
      { title: "Observations & feedbacks — LEONI Workforce Journey" },
      { name: "description", content: "Observations formateur et feedbacks opérateurs LEONI Maroc : tonalité, catégorie, site et suivi des actions correctives." },
      { property: "og:title", content: "Observations & feedbacks — LEONI Workforce Journey" },
      { property: "og:description", content: "Observations terrain et retours des opérateurs consolidés par site." },
    ],
  }),
  component: ObservationsPage,
});

function ObservationsPage() {
  const navigate = useNavigate();
  const { ouvriers, pousserNotification } = useLeoni();
  const [tonalite, setTonalite] = useState("Toutes les tonalités");

  const observations = useMemo(
    () =>
      ouvriers
        .flatMap((o) => o.evenements.map((e) => ({ ...e, ouvrier: o.nom, ouvrierId: o.id, site: o.site })))
        .filter((e) => tonalite === "Toutes les tonalités" || e.tonalite === tonalite),
    [ouvriers, tonalite],
  );

  const ton = (t: string) => (t === "Positive" ? "success" : t === "Critique" ? "critical" : t === "Négative" ? "warning" : "neutral") as const;

  return (
    <>
      <PageHeader
        titre="Observations & feedbacks"
        sousTitre="Retours des formateurs et des opérateurs consolidés dans le dossier de chaque ouvrier"
        fil={[{ label: "Suivi & qualité" }, { label: "Observations" }]}
        actions={
          <Btn
            variant="primary"
            onClick={() => pousserNotification({ titre: "Observation enregistrée", detail: "Ajoutée au dossier de l'opérateur sélectionné.", ton: "success" })}
          >
            Nouvelle observation
          </Btn>
        }
      />

      <div className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label="Observations" valeur={observations.length} ton="brand" />
        <Kpi label="Positives" valeur={observations.filter((o) => o.tonalite === "Positive").length} ton="success" />
        <Kpi label="Critiques" valeur={observations.filter((o) => o.tonalite === "Critique").length} ton="critical" />
        <Kpi label="Feedbacks opérateurs" valeur={FEEDBACKS.length} ton="info" />
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Select value={tonalite} onChange={setTonalite} options={["Toutes les tonalités", "Positive", "Neutre", "Négative", "Critique"]} />
        <span className="ml-auto text-xs text-muted-foreground">{observations.length} entrée(s)</span>
      </div>

      <Panel title="Journal des observations" bodyClassName="p-0">
        <Table>
          <thead>
            <tr><Th>Date</Th><Th>Opérateur</Th><Th>Site</Th><Th>Type</Th><Th>Auteur</Th><Th>Tonalité</Th><Th>Observation</Th></tr>
          </thead>
          <tbody>
            {observations.map((e) => (
              <Tr key={e.ouvrierId + e.id} onDoubleClick={() => navigate({ to: "/ouvriers/$id", params: { id: e.ouvrierId } })} title="Double-cliquer pour ouvrir la fiche ouvrier">
                <Td className="num text-xs">{e.date}</Td>
                <Td className="font-medium">{e.ouvrier}</Td>
                <Td className="text-muted-foreground">{e.site}</Td>
                <Td className="text-muted-foreground">{e.type}</Td>
                <Td className="text-muted-foreground">{e.auteur}</Td>
                <Td><Tag ton={ton(e.tonalite)}>{e.tonalite}</Tag></Td>
                <Td className="max-w-96 truncate text-xs text-muted-foreground">{e.titre} — {e.contenu}</Td>
              </Tr>
            ))}
          </tbody>
        </Table>
      </Panel>

      <Panel className="mt-4" title="Feedbacks opérateurs">
        <ul className="space-y-2">
          {FEEDBACKS.map((f) => (
            <li key={f.id} className="rounded-sm border border-border px-3 py-2">
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span className="num text-[var(--brand)]">{f.id}</span>
                <span className="font-medium text-foreground">{f.auteur}</span>
                <span>{f.date}</span>
                <Tag ton={f.sentiment === "Positif" ? "success" : f.sentiment === "Critique" ? "critical" : "warning"}>{f.sentiment}</Tag>
                <Tag>{f.categorie}</Tag>
              </div>
              <p className="mt-1 text-sm">{f.texte}</p>
            </li>
          ))}
        </ul>
      </Panel>
    </>
  );
}
