import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { JOURS_SEMAINE, SESSIONS, SITES } from "@/data/leoni";
import { Btn, Kpi, PageHeader, Panel, Select, Table, Tag, Td, Th, Tr } from "@/components/leoni/kit";
import { useLeoni } from "@/lib/leoni-store";

export const Route = createFileRoute("/formation/sessions")({
  head: () => ({
    meta: [
      { title: "Sessions & groupes — LEONI Workforce Journey" },
      { name: "description", content: "Gestion des sessions de formation LEONI : groupes, formateurs, salles, horaires et suivi quotidien des participants." },
      { property: "og:title", content: "Sessions & groupes — LEONI Workforce Journey" },
      { property: "og:description", content: "Sessions de formation, groupes et suivi quotidien des opérateurs." },
    ],
  }),
  component: SessionsPage,
});

function SessionsPage() {
  const { pousserNotification } = useLeoni();
  const [site, setSite] = useState("Tous les sites");
  const [formateur, setFormateur] = useState("Tous les formateurs");

  const formateurs = useMemo(() => ["Tous les formateurs", ...new Set(SESSIONS.map((s) => s.formateur))], []);
  const liste = SESSIONS.filter(
    (s) => (site === "Tous les sites" || s.site === site) && (formateur === "Tous les formateurs" || s.formateur === formateur),
  );

  return (
    <>
      <PageHeader
        titre="Sessions & groupes"
        sousTitre="Suivi quotidien des sessions de formation, des groupes et des formateurs"
        fil={[{ label: "Formation" }, { label: "Sessions" }]}
        actions={
          <Btn
            variant="primary"
            onClick={() =>
              pousserNotification({ titre: "Session créée", detail: "Nouvelle session ajoutée au planning de la semaine.", ton: "success" })
            }
          >
            Créer une session
          </Btn>
        }
      />

      <div className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label="Sessions cette semaine" valeur={SESSIONS.length} ton="brand" />
        <Kpi label="Participants" valeur={SESSIONS.reduce((s, x) => s + x.participants, 0)} ton="info" />
        <Kpi label="Groupes actifs" valeur={new Set(SESSIONS.map((s) => s.groupe)).size} ton="neutral" />
        <Kpi label="Formateurs mobilisés" valeur={new Set(SESSIONS.map((s) => s.formateur)).size} ton="success" />
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Select value={site} onChange={setSite} options={["Tous les sites", ...SITES]} />
        <Select value={formateur} onChange={setFormateur} options={formateurs} />
        <span className="ml-auto text-xs text-muted-foreground">{liste.length} session(s)</span>
      </div>

      <Panel title="Sessions planifiées" bodyClassName="p-0">
        <Table>
          <thead>
            <tr>
              <Th>Session</Th><Th>Groupe</Th><Th>Module</Th><Th>Jour</Th><Th>Horaire</Th><Th>Salle</Th><Th>Formateur</Th><Th>Site</Th><Th>Participants</Th><Th>Suivi</Th>
            </tr>
          </thead>
          <tbody>
            {liste.map((s) => (
              <Tr key={s.id}>
                <Td className="num text-xs text-[var(--brand)]">{s.id}</Td>
                <Td className="font-medium">{s.groupe}</Td>
                <Td>{s.module}</Td>
                <Td className="text-muted-foreground">{JOURS_SEMAINE[s.jour - 1]}</Td>
                <Td className="num">{s.debut} – {s.fin}</Td>
                <Td className="text-muted-foreground">{s.salle}</Td>
                <Td>{s.formateur}</Td>
                <Td className="text-muted-foreground">{s.site}</Td>
                <Td className="num">{s.participants}</Td>
                <Td>
                  <Btn
                    size="sm"
                    onClick={() =>
                      pousserNotification({
                        titre: "Feuille de présence ouverte",
                        detail: `${s.groupe} — ${s.module} (${s.participants} participants)`,
                        ton: "info",
                      })
                    }
                  >
                    Saisir la présence
                  </Btn>
                </Td>
              </Tr>
            ))}
          </tbody>
        </Table>
      </Panel>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Panel title="Groupes en cours">
          <ul className="space-y-2">
            {[...new Set(SESSIONS.map((s) => s.groupe))].map((g) => {
              const sess = SESSIONS.filter((s) => s.groupe === g);
              return (
                <li key={g} className="flex items-center justify-between rounded-sm border border-border px-3 py-2 text-sm">
                  <span className="font-medium">{g}</span>
                  <span className="text-xs text-muted-foreground">{sess[0].site} · {sess[0].formateur}</span>
                  <Tag ton="info">{sess[0].participants} opérateurs</Tag>
                </li>
              );
            })}
          </ul>
        </Panel>
        <Panel title="Suivi quotidien" subtitle="Points de contrôle du jour">
          <ul className="space-y-2 text-sm">
            <li className="flex items-center justify-between rounded-sm border border-border px-3 py-2">Feuilles de présence saisies <Tag ton="success">4 / 5</Tag></li>
            <li className="flex items-center justify-between rounded-sm border border-border px-3 py-2">Évaluations du jour validées <Tag ton="warning">3 / 5</Tag></li>
            <li className="flex items-center justify-between rounded-sm border border-border px-3 py-2">Observations formateur saisies <Tag ton="success">12</Tag></li>
            <li className="flex items-center justify-between rounded-sm border border-border px-3 py-2">Rattrapages à programmer <Tag ton="critical">2</Tag></li>
          </ul>
        </Panel>
      </div>
    </>
  );
}
