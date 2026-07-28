import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo } from "react";
import { ABSENCES, JOURS_SEMAINE, SITES, TAUX_PRESENCE_GLOBAL } from "@/data/leoni";
import { Barre, Btn, Kpi, PageHeader, Panel, Select, Table, Tag, Td, Th, Tr } from "@/components/leoni/kit";
import { useLeoni } from "@/lib/leoni-store";

const VUES = ["Présences", "Absences", "Retards", "Calendrier"];

export const Route = createFileRoute("/presences")({
  validateSearch: (s: Record<string, unknown>) => ({
    vue: typeof s.vue === "string" && VUES.includes(s.vue) ? s.vue : "Présences",
    site: typeof s.site === "string" ? s.site : "Tous les sites",
  }),
  head: () => ({
    meta: [
      { title: "Présences & absences — LEONI Workforce Journey" },
      { name: "description", content: "Suivi des présences, absences et retards des opérateurs LEONI Maroc, avec calendrier hebdomadaire et justificatifs." },
      { property: "og:title", content: "Présences & absences — LEONI Workforce Journey" },
      { property: "og:description", content: "Pointage quotidien, absences justifiées et retards par site." },
    ],
  }),
  component: PresencesPage,
});

function PresencesPage() {
  const { vue, site } = Route.useSearch();
  const navigate = useNavigate();
  const { ouvriers, pousserNotification } = useLeoni();

  const population = useMemo(
    () => ouvriers.filter((o) => site === "Tous les sites" || o.site === site),
    [ouvriers, site],
  );
  const absences = ABSENCES.filter((a) => site === "Tous les sites" || a.site === site);
  const retards = absences.filter((a) => a.type === "Retard");

  return (
    <>
      <PageHeader
        titre="Présences & absences"
        sousTitre="Pointage quotidien des opérateurs en formation et en intégration"
        fil={[{ label: "Présences" }, { label: vue }]}
        actions={<Btn variant="secondary">Export Excel</Btn>}
      />

      <div className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label="Taux de présence global" valeur={TAUX_PRESENCE_GLOBAL} suffixe="%" ton="success" />
        <Kpi label="Absences enregistrées" valeur={absences.filter((a) => a.type !== "Retard").length} ton="warning" />
        <Kpi label="Retards" valeur={retards.length} ton="warning" />
        <Kpi label="Opérateurs suivis" valeur={population.length} ton="brand" />
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        {VUES.map((v) => (
          <button
            key={v}
            onClick={() => navigate({ to: "/presences", search: { vue: v, site } })}
            className={
              v === vue
                ? "rounded-sm border border-[var(--brand)] bg-[var(--selected)] px-3 py-1.5 text-xs font-medium text-[var(--brand)]"
                : "rounded-sm border border-border px-3 py-1.5 text-xs text-muted-foreground hover:bg-[var(--hover)]"
            }
          >
            {v}
          </button>
        ))}
        <Select
          className="ml-auto"
          value={site}
          onChange={(s) => navigate({ to: "/presences", search: { vue, site: s } })}
          options={["Tous les sites", ...SITES]}
        />
      </div>

      {vue === "Présences" && (
        <Panel title="Présence par opérateur" bodyClassName="p-0">
          <Table>
            <thead>
              <tr><Th>Opérateur</Th><Th>Matricule</Th><Th>Site</Th><Th>Groupe</Th><Th>Présence</Th><Th>Ponctualité</Th><Th>Statut</Th></tr>
            </thead>
            <tbody>
              {population.map((o) => (
                <Tr key={o.id} onDoubleClick={() => navigate({ to: "/ouvriers/$id", params: { id: o.id } })} title="Double-cliquer pour ouvrir la fiche">
                  <Td className="font-medium">{o.nom}</Td>
                  <Td className="num text-xs text-[var(--brand)]">{o.id}</Td>
                  <Td className="text-muted-foreground">{o.site}</Td>
                  <Td className="text-muted-foreground">{o.groupe}</Td>
                  <Td>
                    <div className="flex min-w-28 items-center gap-2">
                      <Barre valeur={o.presence} ton={o.presence >= 90 ? "success" : o.presence >= 80 ? "warning" : "critical"} />
                      <span className="num w-10 text-right text-xs">{o.presence} %</span>
                    </div>
                  </Td>
                  <Td className="num">{o.ponctualite} %</Td>
                  <Td><Tag ton={o.presence >= 90 ? "success" : o.presence >= 80 ? "warning" : "critical"}>{o.presence >= 90 ? "Conforme" : o.presence >= 80 ? "À surveiller" : "Sous le seuil"}</Tag></Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        </Panel>
      )}

      {(vue === "Absences" || vue === "Retards") && (
        <Panel title={vue} bodyClassName="p-0">
          <Table>
            <thead>
              <tr><Th>Référence</Th><Th>Opérateur</Th><Th>Site</Th><Th>Date</Th><Th>Type</Th><Th>Durée</Th><Th>Statut</Th><Th>Action</Th></tr>
            </thead>
            <tbody>
              {(vue === "Retards" ? retards : absences.filter((a) => a.type !== "Retard")).map((a) => (
                <Tr key={a.id}>
                  <Td className="num text-xs text-[var(--brand)]">{a.id}</Td>
                  <Td className="font-medium">{a.ouvrier}</Td>
                  <Td className="text-muted-foreground">{a.site}</Td>
                  <Td className="num">{a.date}</Td>
                  <Td>{a.type}</Td>
                  <Td className="num text-muted-foreground">{a.duree}</Td>
                  <Td><Tag ton={/valid|reçu/i.test(a.statut) ? "success" : /rattrapage/i.test(a.statut) ? "critical" : "warning"}>{a.statut}</Tag></Td>
                  <Td>
                    <Btn size="sm" onClick={() => pousserNotification({ titre: "Absence traitée", detail: `${a.id} — ${a.ouvrier}`, ton: "info" })}>
                      Traiter
                    </Btn>
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        </Panel>
      )}

      {vue === "Calendrier" && (
        <Panel title="Calendrier hebdomadaire" subtitle="Semaine du 27 au 31 juillet 2026">
          <div className="grid gap-3 md:grid-cols-5">
            {JOURS_SEMAINE.map((j, i) => (
              <div key={j} className="rounded-sm border border-border p-2">
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{j}</p>
                <p className="num text-2xl font-semibold">{[96, 94, 92, 95, 93][i]} %</p>
                <p className="mt-1 text-[11px] text-muted-foreground">présence du jour</p>
                <div className="mt-2 space-y-1">
                  <Tag ton="warning">{[4, 6, 8, 5, 7][i]} absences</Tag>
                  <Tag ton="info">{[2, 3, 1, 4, 2][i]} retards</Tag>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      )}
    </>
  );
}
