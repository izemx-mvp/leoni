import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/leoni/kit";
import { BoiteTraitement } from "@/components/leoni/reclamations/BoiteTraitement";
import { VueEnsemble } from "@/components/leoni/reclamations/VueEnsemble";
import { SatisfactionTab } from "@/components/leoni/reclamations/Satisfaction";
import { Analyse } from "@/components/leoni/reclamations/Analyse";
import { BoutonR } from "@/components/leoni/reclamations/kit";

const ONGLETS = ["Vue d'ensemble", "Boîte de traitement", "Satisfaction", "Analyse"] as const;
type Onglet = (typeof ONGLETS)[number];

export const Route = createFileRoute("/reclamations")({
  head: () => ({
    meta: [
      { title: "Réclamations — LEONI Workforce Journey" },
      {
        name: "description",
        content:
          "Service desk des réclamations ouvriers LEONI : boîte de traitement, SLA, conversation, actions et satisfaction après traitement.",
      },
      { property: "og:title", content: "Réclamations — LEONI Workforce Journey" },
      { property: "og:description", content: "Workflow simple en 3 statuts, traitement riche : assignation, SLA, conversation, actions, satisfaction." },
    ],
  }),
  validateSearch: (s: Record<string, unknown>): { onglet?: Onglet } => ({
    onglet: ONGLETS.includes(s.onglet as Onglet) ? (s.onglet as Onglet) : undefined,
  }),
  component: ReclamationsPage,
});

function ReclamationsPage() {
  const { onglet } = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const actif: Onglet = onglet ?? "Vue d'ensemble";
  const [message, setMessage] = useState<string | null>(null);

  const aller = (o: string) => navigate({ search: { onglet: o as Onglet } });

  return (
    <>
      <PageHeader
        titre="Réclamations"
        sousTitre="Service desk des réclamations ouvriers — Nouveau, En cours de traitement, Traité"
        fil={[{ label: "Réclamations" }]}
        actions={
          <BoutonR variante="primaire" onClick={() => setMessage("Nouvelle réclamation : à saisir depuis l'Espace Ouvrier ou un entretien RH.")}>
            + Nouvelle réclamation
          </BoutonR>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-1 border-b border-border">
        {ONGLETS.map((o) => (
          <button
            key={o}
            onClick={() => aller(o)}
            className={`-mb-px border-b-2 px-3 py-2 text-xs transition-colors ${
              o === actif
                ? "border-[var(--brand)] font-medium text-[var(--brand)]"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {o}
          </button>
        ))}
      </div>

      {actif === "Vue d'ensemble" && <VueEnsemble aller={aller} />}
      {actif === "Boîte de traitement" && <BoiteTraitement />}
      {actif === "Satisfaction" && <SatisfactionTab />}
      {actif === "Analyse" && <Analyse onAction={(t) => setMessage(`Action corrective créée pour « ${t} ».`)} />}

      {message && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-2.5 text-xs shadow-lg">
          {message}
          <button onClick={() => setMessage(null)} className="text-muted-foreground hover:text-foreground" aria-label="Fermer">
            ×
          </button>
        </div>
      )}
    </>
  );
}
