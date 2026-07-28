import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AlertTriangle, ArrowUpRight } from "lucide-react";
import { PageHeader, Panel, Select, Tag, Btn } from "@/components/leoni/kit";
import { useLeoni } from "@/lib/leoni-store";

export const Route = createFileRoute("/pilotage/alertes")({
  head: () => ({
    meta: [
      { title: "Alertes & risques — LEONI Workforce Journey" },
      { name: "description", content: "Centre d'alertes opérationnelles : présence, scores, sécurité, décisions RH en attente sur les sites LEONI Maroc." },
      { property: "og:title", content: "Alertes & risques — LEONI Workforce Journey" },
      { property: "og:description", content: "Suivi centralisé des alertes et des risques workforce." },
    ],
  }),
  component: Alertes,
});

function Alertes() {
  const { alertes, ouvriers } = useLeoni();
  const [priorite, setPriorite] = useState("Toutes les priorités");
  const [siteFiltre, setSiteFiltre] = useState("Tous les sites");

  const liste = alertes.filter(
    (a) =>
      (priorite === "Toutes les priorités" || a.priorite === priorite) &&
      (siteFiltre === "Tous les sites" || a.site === siteFiltre),
  );

  const risques = ouvriers.filter((o) => o.risque !== "Faible");

  return (
    <>
      <PageHeader
        titre="Alertes & risques"
        sousTitre="Règles automatiques de détection appliquées à la population candidats et opérateurs"
        fil={[{ label: "Pilotage", to: "/" }, { label: "Alertes & risques" }]}
        actions={<Btn variant="secondary">Configurer les règles</Btn>}
      />

      <div className="mb-5 flex flex-wrap gap-2">
        <Select value={priorite} onChange={setPriorite} options={["Toutes les priorités", "Critique", "Élevée", "Moyenne", "Faible"]} />
        <Select
          value={siteFiltre}
          onChange={setSiteFiltre}
          options={["Tous les sites", "Multi-sites", "Bouskoura", "Berrechid", "Bouznika", "Agadir", "Aïn Sebaâ"]}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <div className="space-y-3 xl:col-span-2">
          {liste.map((a) => (
            <div key={a.id} className="rounded-md border border-border bg-card p-4">
              <div className="flex flex-wrap items-center gap-2">
                <AlertTriangle
                  className={
                    a.priorite === "Critique"
                      ? "size-4 text-[var(--critical)]"
                      : a.priorite === "Élevée"
                        ? "size-4 text-[var(--warning)]"
                        : "size-4 text-muted-foreground"
                  }
                />
                <h3 className="text-sm font-semibold">{a.type}</h3>
                <Tag ton={a.priorite === "Critique" ? "critical" : a.priorite === "Élevée" ? "warning" : "neutral"}>
                  {a.priorite}
                </Tag>
                <span className="num ml-auto text-xs text-muted-foreground">{a.date}</span>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3 text-xs md:grid-cols-4">
                <div>
                  <p className="label-xs">Personne</p>
                  <p className="mt-1">{a.personne}</p>
                </div>
                <div>
                  <p className="label-xs">Site</p>
                  <p className="mt-1">{a.site}</p>
                </div>
                <div>
                  <p className="label-xs">Propriétaire</p>
                  <p className="mt-1">{a.proprietaire}</p>
                </div>
                <div>
                  <p className="label-xs">Référence</p>
                  <p className="num mt-1">{a.id}</p>
                </div>
              </div>
              <div className="mt-3 flex justify-end">
                <Link to={a.lien ?? "/"} className="inline-flex items-center gap-1 text-xs font-medium text-[var(--brand)] hover:underline">
                  {a.cta} <ArrowUpRight className="size-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        <Panel title="Opérateurs à surveiller" subtitle="Risque moyen, élevé ou critique">
          <div className="space-y-3">
            {risques.map((o) => (
              <Link
                key={o.id}
                to="/ouvriers/$id"
                params={{ id: o.id }}
                className="block rounded-sm border border-border p-3 transition-colors hover:bg-[var(--hover)]"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{o.nom}</span>
                  <Tag ton={o.risque === "Moyen" ? "warning" : "critical"}>{o.risque}</Tag>
                </div>
                <p className="num mt-1 text-[11px] text-muted-foreground">
                  {o.id} · {o.site} · score {o.score} % · présence {o.presence} %
                </p>
                <p className="mt-1.5 text-xs text-muted-foreground">Action : {o.prochaineAction}</p>
              </Link>
            ))}
          </div>
        </Panel>
      </div>
    </>
  );
}
