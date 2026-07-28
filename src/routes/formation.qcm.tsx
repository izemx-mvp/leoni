import { createFileRoute } from "@tanstack/react-router";
import { QCM } from "@/data/leoni";
import { Barre, Btn, Kpi, PageHeader, Panel, Table, Tag, Td, Th, Tr } from "@/components/leoni/kit";
import { useLeoni } from "@/lib/leoni-store";

export const Route = createFileRoute("/formation/qcm")({
  head: () => ({
    meta: [
      { title: "QCM, tests & rattrapages — LEONI Workforce Journey" },
      { name: "description", content: "Résultats des QCM de formation LEONI : scores par opérateur, analyse par question et programmation des rattrapages." },
      { property: "og:title", content: "QCM, tests & rattrapages — LEONI Workforce Journey" },
      { property: "og:description", content: "Résultats des tests de connaissances et gestion des rattrapages." },
    ],
  }),
  component: QcmPage,
});

function QcmPage() {
  const { pousserNotification } = useLeoni();
  const echecs = QCM.resultats.filter((r) => r.score < QCM.seuil);
  const moyenne = Math.round(QCM.resultats.reduce((s, r) => s + r.score, 0) / QCM.resultats.length);

  return (
    <>
      <PageHeader
        titre="QCM, tests & rattrapages"
        sousTitre={`${QCM.code} — ${QCM.nom} · ${QCM.questions} questions · ${QCM.duree} · seuil ${QCM.seuil} %`}
        fil={[{ label: "Formation" }, { label: "QCM & tests" }]}
        actions={
          <Btn
            variant="primary"
            onClick={() =>
              pousserNotification({
                titre: "Rattrapages programmés",
                detail: `${echecs.length} opérateur(s) convoqué(s) pour ${QCM.code}.`,
                ton: "warning",
              })
            }
          >
            Programmer les rattrapages
          </Btn>
        }
      />

      <div className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label="Participants évalués" valeur={QCM.resultats.length} ton="brand" />
        <Kpi label="Score moyen" valeur={moyenne} suffixe="%" ton={moyenne >= QCM.seuil ? "success" : "warning"} />
        <Kpi label="Sous le seuil" valeur={echecs.length} ton="critical" />
        <Kpi label="Temps moyen" valeur={QCM.tempsMoyen} ton="info" />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        <Panel title="Résultats par opérateur" bodyClassName="p-0">
          <Table>
            <thead>
              <tr><Th>Opérateur</Th><Th>Matricule</Th><Th>Score</Th><Th>Résultat</Th><Th>Action</Th></tr>
            </thead>
            <tbody>
              {QCM.resultats.map((r) => (
                <Tr key={r.id}>
                  <Td className="font-medium">{r.ouvrier}</Td>
                  <Td className="num text-xs text-[var(--brand)]">{r.id}</Td>
                  <Td className="num font-medium">{r.score} %</Td>
                  <Td><Tag ton={r.score >= QCM.seuil ? "success" : "critical"}>{r.score >= QCM.seuil ? "Réussi" : "Échoué"}</Tag></Td>
                  <Td>
                    {r.score < QCM.seuil ? (
                      <Btn
                        size="sm"
                        onClick={() =>
                          pousserNotification({ titre: "Rattrapage planifié", detail: `${r.ouvrier} — ${QCM.code}`, ton: "warning" })
                        }
                      >
                        Planifier un rattrapage
                      </Btn>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        </Panel>

        <Panel title="Analyse par question" subtitle="Taux de réussite">
          <ul className="space-y-3">
            {QCM.analyse.map((a) => (
              <li key={a.question}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span>{a.question}</span>
                  <span className="num font-medium">{a.reussite} %</span>
                </div>
                <Barre valeur={a.reussite} ton={a.reussite >= 80 ? "success" : a.reussite >= 65 ? "warning" : "critical"} />
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </>
  );
}
