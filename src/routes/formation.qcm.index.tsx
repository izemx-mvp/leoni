import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Btn, Onglets, PageHeader } from "@/components/leoni/kit";
import { VueEnsemble } from "@/components/leoni/evaluations/VueEnsemble";
import { ListeEvaluations } from "@/components/leoni/evaluations/ListeEvaluations";
import { Bibliotheque } from "@/components/leoni/evaluations/Bibliotheque";
import { Sessions } from "@/components/leoni/evaluations/Sessions";
import { Resultats } from "@/components/leoni/evaluations/Resultats";
import { Rattrapages } from "@/components/leoni/evaluations/Rattrapages";
import { Affectations } from "@/components/leoni/evaluations/Affectations";
import { DroitsPanel, Historique } from "@/components/leoni/evaluations/Historique";

const ONGLETS = [
  "Vue d'ensemble",
  "Toutes les évaluations",
  "Affectations",
  "Sessions en cours",
  "Résultats",
  "Rattrapages",
  "Bibliothèque de questions",
  "Historique & audit",
] as const;

export const Route = createFileRoute("/formation/qcm/")({
  validateSearch: (s: Record<string, unknown>) => ({
    onglet: (typeof s.onglet === "string" && (ONGLETS as readonly string[]).includes(s.onglet)
      ? s.onglet
      : "Vue d'ensemble") as string,
  }),
  head: () => ({
    meta: [
      { title: "Évaluations & QCM — LEONI Workforce Journey" },
      {
        name: "description",
        content:
          "Pilotage complet des évaluations LEONI : création de QCM, bibliothèque de questions, affectations, sessions en direct, résultats, rattrapages et audit.",
      },
      { property: "og:title", content: "Évaluations & QCM — LEONI Workforce Journey" },
      { property: "og:description", content: "Créer, diffuser, suivre et analyser les évaluations des opérateurs." },
    ],
  }),
  component: QcmPage,
});

function QcmPage() {
  const { onglet } = Route.useSearch();
  const navigate = useNavigate();
  const setOnglet = (v: string) => navigate({ to: "/formation/qcm", search: { onglet: v } });

  return (
    <>
      <PageHeader
        titre="Évaluations & QCM"
        sousTitre="Créer, diffuser, suivre et analyser toutes les évaluations des opérateurs — théoriques, pratiques et de sécurité"
        fil={[{ label: "Formation" }, { label: "Évaluations & QCM" }]}
        actions={
          <>
            <Btn onClick={() => setOnglet("Bibliothèque de questions")}>Bibliothèque de questions</Btn>
            <Btn variant="primary" onClick={() => navigate({ to: "/formation/qcm/nouvelle" })}>
              + Nouvelle évaluation
            </Btn>
          </>
        }
      />

      <Onglets valeurs={[...ONGLETS]} actif={onglet} onChange={setOnglet} />

      {onglet === "Vue d'ensemble" && <VueEnsemble />}
      {onglet === "Toutes les évaluations" && <ListeEvaluations />}
      {onglet === "Affectations" && <Affectations />}
      {onglet === "Sessions en cours" && <Sessions />}
      {onglet === "Résultats" && <Resultats />}
      {onglet === "Rattrapages" && <Rattrapages />}
      {onglet === "Bibliothèque de questions" && <Bibliotheque />}
      {onglet === "Historique & audit" && (
        <div className="space-y-4">
          <Historique />
          <DroitsPanel />
        </div>
      )}
    </>
  );
}
