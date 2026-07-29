import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowUpDown, ChevronDown, Download, Settings2, Sparkles } from "lucide-react";
import { SITES } from "@/data/leoni";
import {
  Barre,
  Btn,
  PageHeader,
  Panel,
  Select,
  StatutBadge,
  Table,
  Tag,
  Td,
  Th,
  Tr,
  Avatar,
} from "@/components/leoni/kit";
import { useLeoni } from "@/lib/leoni-store";
import { NouvelleCandidature } from "@/components/leoni/recrutement/NouvelleCandidature";

export const Route = createFileRoute("/recrutement/candidatures")({
  validateSearch: (s: Record<string, unknown>) => ({
    vue: typeof s.vue === "string" ? s.vue : "Toutes",
  }),
  head: () => ({
    meta: [
      { title: "Candidatures — LEONI Workforce Journey" },
      { name: "description", content: "Traitement des candidatures opérateurs : scoring Talent Fit AI, présélection, entretiens et décisions RH multi-sites." },
      { property: "og:title", content: "Candidatures — LEONI Workforce Journey" },
      { property: "og:description", content: "Pipeline de recrutement des opérateurs LEONI Maroc." },
    ],
  }),
  component: Candidatures,
});

const COLONNES = [
  "Référence",
  "Candidat",
  "Poste",
  "Site",
  "Ville",
  "Source",
  "Date",
  "Score IA",
  "Recommandation",
  "Entretien",
  "Statut",
  "Création",
  "Recruteur",
] as const;

function Candidatures() {
  const { vue } = Route.useSearch();
  const navigate = useNavigate();
  const { candidats } = useLeoni();
  const [q, setQ] = useState("");
  const [site, setSite] = useState("Tous les sites");
  const [statut, setStatut] = useState("Tous les statuts");
  const [scoreMin, setScoreMin] = useState(0);
  const [tri, setTri] = useState<{ col: string; asc: boolean }>({ col: "Score IA", asc: false });
  const [page, setPage] = useState(1);
  const [selection, setSelection] = useState<string[]>([]);
  const [colonnes, setColonnes] = useState<string[]>([...COLONNES]);
  const [configOuvert, setConfigOuvert] = useState(false);
  const [menuCreation, setMenuCreation] = useState(false);
  const [creation, setCreation] = useState<"choix" | "ia" | "manuel" | "import" | null>(null);
  const parPage = 6;

  const filtres = useMemo(() => {
    let l = candidats.filter(
      (c) =>
        `${c.nom} ${c.id} ${c.poste} ${c.ville}`.toLowerCase().includes(q.toLowerCase()) &&
        (site === "Tous les sites" || c.site === site) &&
        (statut === "Tous les statuts" || c.statut === statut) &&
        c.score >= scoreMin,
    );
    if (vue === "Présélection IA") l = l.filter((c) => c.score >= 70);
    if (vue === "Décisions RH") l = l.filter((c) => /Décision/.test(c.statut));
    if (vue === "Vivier") l = l.filter((c) => c.score >= 55 && c.score < 80);
    const dir = tri.asc ? 1 : -1;
    return [...l].sort((a, b) => {
      if (tri.col === "Score IA") return (a.score - b.score) * dir;
      if (tri.col === "Candidat") return a.nom.localeCompare(b.nom) * dir;
      if (tri.col === "Site") return a.site.localeCompare(b.site) * dir;
      return a.id.localeCompare(b.id) * dir;
    });
  }, [candidats, q, site, statut, scoreMin, vue, tri]);

  const pages = Math.max(1, Math.ceil(filtres.length / parPage));
  const visibles = filtres.slice((page - 1) * parPage, page * parPage);

  const trier = (col: string) => setTri((t) => ({ col, asc: t.col === col ? !t.asc : false }));
  const affiche = (c: string) => colonnes.includes(c);

  return (
    <>
      <PageHeader
        titre="Candidatures"
        sousTitre="Réception automatique, lecture IA des documents et qualification RH"
        fil={[{ label: "Recrutement" }, { label: vue === "Toutes" ? "Candidatures" : vue }]}
        actions={
          <>
            <Btn variant="secondary" onClick={() => setConfigOuvert((v) => !v)}>
              <Settings2 className="size-3.5" /> Colonnes
            </Btn>
            <Btn variant="secondary">
              <Download className="size-3.5" /> Export CSV
            </Btn>
            <div className="relative flex">
              <Btn variant="primary" className="rounded-r-none" onClick={() => setCreation("choix")}>
                Nouvelle candidature
              </Btn>
              <Btn
                variant="primary"
                aria-label="Options de création"
                className="rounded-l-none border-l border-black/15 px-2"
                onClick={() => setMenuCreation((v) => !v)}
              >
                <ChevronDown className="size-3.5" />
              </Btn>
              {menuCreation && (
                <div className="absolute right-0 top-10 z-30 w-52 overflow-hidden rounded-sm border border-border bg-card shadow-lg">
                  {[
                    { label: "Créer avec l'IA", mode: "ia" as const },
                    { label: "Saisie manuelle", mode: "manuel" as const },
                    { label: "Import multiple", mode: "import" as const },
                  ].map((o) => (
                    <button
                      key={o.mode}
                      onClick={() => {
                        setMenuCreation(false);
                        setCreation(o.mode);
                      }}
                      className="block w-full px-3 py-2 text-left text-xs hover:bg-[var(--hover)]"
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </>

        }
      />

      <div className="mb-4 flex flex-wrap gap-2">
        {["Toutes", "Présélection IA", "Décisions RH", "Vivier"].map((v) => (
          <button
            key={v}
            onClick={() => navigate({ to: "/recrutement/candidatures", search: { vue: v } })}
            className={
              v === vue
                ? "rounded-sm border border-[var(--brand)] bg-[var(--selected)] px-3 py-1.5 text-xs font-medium text-[var(--brand)]"
                : "rounded-sm border border-border px-3 py-1.5 text-xs text-muted-foreground hover:bg-[var(--hover)]"
            }
          >
            {v}
          </button>
        ))}
      </div>

      {configOuvert && (
        <div className="mb-4 flex flex-wrap gap-3 rounded-md border border-border bg-card p-3">
          {COLONNES.map((c) => (
            <label key={c} className="flex items-center gap-1.5 text-xs">
              <input
                type="checkbox"
                checked={affiche(c)}
                onChange={() =>
                  setColonnes((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]))
                }
                className="accent-[var(--brand)]"
              />
              {c}
            </label>
          ))}
        </div>
      )}

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <input
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setPage(1);
          }}
          placeholder="Rechercher un candidat, une référence, un poste…"
          className="h-9 w-72 rounded-sm border border-border bg-card px-3 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]"
        />
        <Select value={site} onChange={setSite} options={["Tous les sites", ...SITES]} />
        <Select
          value={statut}
          onChange={setStatut}
          options={[
            "Tous les statuts",
            "Décision en attente",
            "Entretien planifié",
            "Entretien requis",
            "Analyse RH",
            "Revue RH",
            "Décision RH",
            "Présélectionnée",
            "Présélectionné",
            "Retenu",
          ]}
        />
        <label className="flex items-center gap-2 rounded-sm border border-border bg-card px-3 py-1.5 text-xs">
          Score IA ≥ <span className="num w-8 font-semibold">{scoreMin}</span>
          <input
            type="range"
            min={0}
            max={100}
            step={5}
            value={scoreMin}
            onChange={(e) => setScoreMin(Number(e.target.value))}
            className="w-28 accent-[var(--brand)]"
          />
        </label>
        <span className="ml-auto text-xs text-muted-foreground">
          {filtres.length} candidature(s) · {selection.length} sélectionnée(s)
        </span>
      </div>

      {selection.length > 0 && (
        <div className="mb-3 flex flex-wrap items-center gap-2 rounded-sm border border-[var(--brand)] bg-[var(--selected)] px-3 py-2 text-xs">
          <Sparkles className="size-3.5 text-[var(--brand)]" />
          Action groupée sur {selection.length} candidature(s)
          <Btn size="sm" variant="secondary">Envoyer un message</Btn>
          <Btn size="sm" variant="secondary">Ajouter au vivier</Btn>
          <Btn size="sm" variant="ghost" onClick={() => setSelection([])}>Annuler</Btn>
        </div>
      )}

      <Panel bodyClassName="p-0">
        <div className="max-h-[560px] overflow-auto">
          <Table>
            <thead>
              <tr>
                <Th className="w-9">
                  <input
                    type="checkbox"
                    className="accent-[var(--brand)]"
                    checked={selection.length === visibles.length && visibles.length > 0}
                    onChange={(e) => setSelection(e.target.checked ? visibles.map((c) => c.id) : [])}
                  />
                </Th>
                {COLONNES.filter(affiche).map((c) => (
                  <Th key={c}>
                    <button className="inline-flex items-center gap-1 hover:text-foreground" onClick={() => trier(c)}>
                      {c}
                      {["Référence", "Candidat", "Site", "Score IA"].includes(c) && <ArrowUpDown className="size-3" />}
                    </button>
                  </Th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visibles.map((c) => (
                <Tr key={c.id}>
                  <Td>
                    <input
                      type="checkbox"
                      className="accent-[var(--brand)]"
                      checked={selection.includes(c.id)}
                      onChange={() =>
                        setSelection((p) => (p.includes(c.id) ? p.filter((x) => x !== c.id) : [...p, c.id]))
                      }
                    />
                  </Td>
                  {affiche("Référence") && (
                    <Td>
                      <Link
                        to="/recrutement/candidat/$id"
                        params={{ id: c.id }}
                        className="num text-xs font-medium text-[var(--brand)] hover:underline"
                      >
                        {c.id}
                      </Link>
                    </Td>
                  )}
                  {affiche("Candidat") && (
                    <Td>
                      <Link to="/recrutement/candidat/$id" params={{ id: c.id }} className="flex items-center gap-2">
                        <Avatar nom={c.nom} size={28} />
                        <span className="font-medium">{c.nom}</span>
                      </Link>
                    </Td>
                  )}
                  {affiche("Poste") && <Td className="text-muted-foreground">{c.poste}</Td>}
                  {affiche("Site") && <Td className="text-muted-foreground">{c.site}</Td>}
                  {affiche("Ville") && <Td className="text-muted-foreground">{c.ville}</Td>}
                  {affiche("Source") && <Td className="text-muted-foreground">{c.source}</Td>}
                  {affiche("Date") && <Td className="num text-muted-foreground">{c.date}</Td>}
                  {affiche("Score IA") && (
                    <Td>
                      <div className="flex w-24 items-center gap-2">
                        <Barre valeur={c.score} ton={c.score >= 80 ? "success" : c.score >= 60 ? "brand" : "critical"} />
                        <span className="num text-xs font-semibold">{c.score} %</span>
                      </div>
                    </Td>
                  )}
                  {affiche("Recommandation") && (
                    <Td>
                      <Tag ton={c.score >= 80 ? "success" : c.score >= 60 ? "warning" : "critical"}>{c.recommandation}</Tag>
                    </Td>
                  )}
                  {affiche("Entretien") && <Td className="text-muted-foreground">{c.entretien}</Td>}
                  {affiche("Statut") && (
                    <Td>
                      <StatutBadge valeur={c.statut} />
                    </Td>
                  )}
                  {affiche("Création") && (
                    <Td>
                      <Tag ton={c.origine === "IA" ? "brand" : "neutral"}>{c.origine ?? "Manuelle"}</Tag>
                    </Td>
                  )}
                  {affiche("Recruteur") && <Td className="text-muted-foreground">{c.recruteur}</Td>}
                </Tr>
              ))}
            </tbody>
          </Table>
        </div>
        <div className="flex items-center justify-between border-t border-border px-3 py-2 text-xs text-muted-foreground">
          <span>
            Page {page} / {pages}
          </span>
          <div className="flex gap-2">
            <Btn size="sm" variant="secondary" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
              Précédent
            </Btn>
            <Btn size="sm" variant="secondary" disabled={page === pages} onClick={() => setPage((p) => p + 1)}>
              Suivant
            </Btn>
          </div>
        </div>
      </Panel>

      {creation && <NouvelleCandidature modeInitial={creation} onClose={() => setCreation(null)} />}
    </>
  );
}
