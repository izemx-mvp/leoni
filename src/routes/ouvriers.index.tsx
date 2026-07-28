import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Download } from "lucide-react";
import { SITES } from "@/data/leoni";
import {
  Avatar,
  Btn,
  PageHeader,
  Panel,
  ProgressionCell,
  RisqueBadge,
  Select,
  StatutBadge,
  Table,
  Td,
  Th,
  Tr,
} from "@/components/leoni/kit";
import { useLeoni } from "@/lib/leoni-store";

export const Route = createFileRoute("/ouvriers/")({
  validateSearch: (s: Record<string, unknown>) => ({
    statut: typeof s.statut === "string" ? s.statut : "Tous",
  }),
  head: () => ({
    meta: [
      { title: "Population ouvrière — LEONI Workforce Journey" },
      { name: "description", content: "Annuaire des opérateurs LEONI Maroc : parcours, progression, scores, présence, risque et prochaine action par site." },
      { property: "og:title", content: "Population ouvrière — LEONI Workforce Journey" },
      { property: "og:description", content: "Suivi consolidé des opérateurs en intégration et en formation." },
    ],
  }),
  component: Ouvriers,
});

const QUICK = ["Tous", "À intégrer", "En formation", "À évaluer", "À confirmer", "À risque", "Confirmé"];

function Ouvriers() {
  const { statut } = Route.useSearch();
  const navigate = useNavigate();
  const { ouvriers } = useLeoni();
  const [q, setQ] = useState("");
  const [site, setSite] = useState("Tous les sites");
  const [atelier, setAtelier] = useState("Tous les ateliers");
  const [risque, setRisque] = useState("Tous les risques");
  const [scoreMin, setScoreMin] = useState(0);

  const liste = useMemo(
    () =>
      ouvriers.filter(
        (o) =>
          `${o.nom} ${o.id} ${o.poste} ${o.groupe}`.toLowerCase().includes(q.toLowerCase()) &&
          (statut === "Tous" || o.statut === statut) &&
          (site === "Tous les sites" || o.site === site) &&
          (atelier === "Tous les ateliers" || o.atelier === atelier) &&
          (risque === "Tous les risques" || o.risque === risque) &&
          o.score >= scoreMin,
      ),
    [ouvriers, q, statut, site, atelier, risque, scoreMin],
  );

  return (
    <>
      <PageHeader
        titre="Population ouvrière"
        sousTitre="Dossier unique par opérateur — les données de formation, présence et évaluation se consolident automatiquement"
        fil={[{ label: "Ouvriers" }, { label: statut === "Tous" ? "Tous les ouvriers" : statut }]}
        actions={
          <Btn variant="secondary">
            <Download className="size-3.5" /> Export Excel
          </Btn>
        }
      />

      <div className="mb-4 flex flex-wrap gap-2">
        {QUICK.map((s) => (
          <button
            key={s}
            onClick={() => navigate({ to: "/ouvriers", search: { statut: s } })}
            className={
              s === statut
                ? "rounded-sm border border-[var(--brand)] bg-[var(--selected)] px-3 py-1.5 text-xs font-medium text-[var(--brand)]"
                : "rounded-sm border border-border px-3 py-1.5 text-xs text-muted-foreground hover:bg-[var(--hover)]"
            }
          >
            {s}
            <span className="num ml-1.5 opacity-60">
              {s === "Tous" ? ouvriers.length : ouvriers.filter((o) => o.statut === s).length}
            </span>
          </button>
        ))}
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Rechercher un opérateur, un matricule, un groupe…"
          className="h-9 w-72 rounded-sm border border-border bg-card px-3 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]"
        />
        <Select value={site} onChange={setSite} options={["Tous les sites", ...SITES]} />
        <Select
          value={atelier}
          onChange={setAtelier}
          options={["Tous les ateliers", "Câblage A", "Câblage B", "Ligne B2", "Qualité Q1", "Coupe C1"]}
        />
        <Select value={risque} onChange={setRisque} options={["Tous les risques", "Faible", "Moyen", "Élevé", "Critique"]} />
        <label className="flex items-center gap-2 rounded-sm border border-border bg-card px-3 py-1.5 text-xs">
          Score ≥ <span className="num w-8 font-semibold">{scoreMin}</span>
          <input type="range" min={0} max={100} step={5} value={scoreMin} onChange={(e) => setScoreMin(Number(e.target.value))} className="w-24 accent-[var(--brand)]" />
        </label>
        <span className="ml-auto text-xs text-muted-foreground">{liste.length} opérateur(s)</span>
      </div>

      <Panel bodyClassName="p-0">
        <div className="max-h-[600px] overflow-auto">
          <Table>
            <thead>
              <tr>
                <Th>Ouvrier</Th><Th>Matricule</Th><Th>Site</Th><Th>Poste</Th><Th>Atelier</Th><Th>Parcours</Th><Th>Jour</Th>
                <Th>Progression</Th><Th>Score</Th><Th>Présence</Th><Th>Risque</Th><Th>Statut</Th><Th>Prochaine action</Th>
              </tr>
            </thead>
            <tbody>
              {liste.map((o) => (
                <Tr key={o.id}>
                  <Td>
                    <Link to="/ouvriers/$id" params={{ id: o.id }} className="flex items-center gap-2">
                      <Avatar nom={o.nom} size={28} />
                      <span className="font-medium">{o.nom}</span>
                    </Link>
                  </Td>
                  <Td className="num text-xs text-[var(--brand)]">{o.id}</Td>
                  <Td className="text-muted-foreground">{o.site}</Td>
                  <Td className="text-muted-foreground">{o.poste}</Td>
                  <Td className="text-muted-foreground">{o.atelier}</Td>
                  <Td className="num text-xs">{o.parcours}</Td>
                  <Td className="num text-muted-foreground">{o.jour}/{o.jourTotal}</Td>
                  <Td><ProgressionCell valeur={o.progression} /></Td>
                  <Td className="num font-medium">{o.score} %</Td>
                  <Td className="num">{o.presence} %</Td>
                  <Td><RisqueBadge valeur={o.risque} /></Td>
                  <Td><StatutBadge valeur={o.statut} /></Td>
                  <Td className="max-w-56 truncate text-xs text-muted-foreground">{o.prochaineAction}</Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        </div>
      </Panel>
    </>
  );
}
