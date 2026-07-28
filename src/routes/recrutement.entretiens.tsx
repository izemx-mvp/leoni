import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CRITERES_ENTRETIEN, JOURS_SEMAINE } from "@/data/leoni";
import {
  Barre,
  Btn,
  PageHeader,
  Panel,
  StatutBadge,
  Table,
  Td,
  Th,
  Tr,
  Tag,
} from "@/components/leoni/kit";
import { useLeoni } from "@/lib/leoni-store";

export const Route = createFileRoute("/recrutement/entretiens")({
  head: () => ({
    meta: [
      { title: "Entretiens — LEONI Workforce Journey" },
      { name: "description", content: "Planification et évaluation des entretiens RH, techniques et collectifs des candidats opérateurs LEONI Maroc." },
      { property: "og:title", content: "Entretiens — LEONI Workforce Journey" },
      { property: "og:description", content: "Calendrier, semaine et liste des entretiens de recrutement." },
    ],
  }),
  component: Entretiens,
});

const DATES_SEMAINE = ["2026-07-27", "2026-07-28", "2026-07-29", "2026-07-30", "2026-07-31"];

function Entretiens() {
  const { entretiens, evaluerEntretien } = useLeoni();
  const [vue, setVue] = useState<"Calendrier" | "Semaine" | "Liste">("Semaine");
  const [selection, setSelection] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, number>>(
    Object.fromEntries(CRITERES_ENTRETIEN.map((c) => [c, 4])),
  );
  const moyenne = Object.values(notes).reduce((a, b) => a + b, 0) / CRITERES_ENTRETIEN.length;

  return (
    <>
      <PageHeader
        titre="Entretiens"
        sousTitre="126 entretiens sur la période — 7 comptes rendus manquants"
        fil={[{ label: "Recrutement" }, { label: "Entretiens" }]}
        actions={
          <div className="flex rounded-sm border border-border p-0.5">
            {(["Calendrier", "Semaine", "Liste"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setVue(v)}
                className={
                  v === vue
                    ? "rounded-sm bg-[var(--selected)] px-3 py-1.5 text-xs font-medium text-[var(--brand)]"
                    : "px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground"
                }
              >
                {v}
              </button>
            ))}
          </div>
        }
      />

      {vue === "Semaine" && (
        <Panel title="Semaine du 27 au 31 juillet 2026" bodyClassName="p-0">
          <div className="grid grid-cols-1 divide-y divide-border md:grid-cols-5 md:divide-x md:divide-y-0">
            {DATES_SEMAINE.map((d, i) => (
              <div key={d} className="min-h-56 p-3">
                <p className="label-xs">{JOURS_SEMAINE[i]}</p>
                <div className="mt-2 space-y-2">
                  {entretiens
                    .filter((e) => e.date === d)
                    .map((e) => (
                      <button
                        key={e.id}
                        onClick={() => setSelection(e.id)}
                        className="w-full rounded-sm border-l-2 border-[var(--brand)] bg-[var(--brand-soft)] p-2 text-left"
                      >
                        <p className="num text-[10px] text-[var(--brand)]">{e.heure}</p>
                        <p className="truncate text-xs font-medium">{e.candidat}</p>
                        <p className="truncate text-[10px] text-muted-foreground">{e.type}</p>
                        <div className="mt-1">
                          <StatutBadge valeur={e.statut} />
                        </div>
                      </button>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </Panel>
      )}

      {vue === "Calendrier" && (
        <Panel title="Juillet 2026">
          <div className="grid grid-cols-7 gap-1 text-center text-[11px] text-muted-foreground">
            {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map((j) => (
              <div key={j} className="py-1 font-semibold">{j}</div>
            ))}
            {Array.from({ length: 31 }, (_, i) => i + 1).map((jour) => {
              const iso = `2026-07-${String(jour).padStart(2, "0")}`;
              const evts = entretiens.filter((e) => e.date === iso);
              return (
                <div
                  key={jour}
                  className={`min-h-20 rounded-sm border border-border p-1 text-left ${
                    evts.length ? "bg-[var(--brand-soft)]" : "bg-card"
                  }`}
                >
                  <span className="num text-[10px] font-semibold text-foreground">{jour}</span>
                  {evts.map((e) => (
                    <p key={e.id} className="mt-0.5 truncate text-[10px] text-[var(--brand)]">
                      {e.heure} {e.candidat.split(" ")[0]}
                    </p>
                  ))}
                </div>
              );
            })}
          </div>
        </Panel>
      )}

      {vue === "Liste" && (
        <Panel bodyClassName="p-0">
          <Table>
            <thead>
              <tr>
                <Th>Référence</Th>
                <Th>Candidat</Th>
                <Th>Date</Th>
                <Th>Type</Th>
                <Th>Site</Th>
                <Th>Évaluateur</Th>
                <Th>Statut</Th>
                <Th>Note</Th>
                <Th />
              </tr>
            </thead>
            <tbody>
              {entretiens.map((e) => (
                <Tr key={e.id}>
                  <Td className="num text-xs">{e.id}</Td>
                  <Td className="font-medium">{e.candidat}</Td>
                  <Td className="num">{e.date} · {e.heure}</Td>
                  <Td className="text-muted-foreground">{e.type}</Td>
                  <Td className="text-muted-foreground">{e.site}</Td>
                  <Td className="text-muted-foreground">{e.evaluateur}</Td>
                  <Td><StatutBadge valeur={e.statut} /></Td>
                  <Td className="num">{e.note ? `${e.note.toFixed(1)}/5` : "—"}</Td>
                  <Td>
                    <button className="text-xs text-[var(--brand)] hover:underline" onClick={() => setSelection(e.id)}>
                      Évaluer
                    </button>
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        </Panel>
      )}

      {selection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setSelection(null)}>
          <div className="w-full max-w-lg rounded-md border border-border bg-card p-5" onClick={(ev) => ev.stopPropagation()}>
            <h3 className="text-sm font-semibold">
              Compte rendu d'entretien — {entretiens.find((e) => e.id === selection)?.candidat}
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              {entretiens.find((e) => e.id === selection)?.type} ·{" "}
              {entretiens.find((e) => e.id === selection)?.date}
            </p>
            <div className="mt-4 space-y-2">
              {CRITERES_ENTRETIEN.map((c) => (
                <div key={c} className="flex items-center gap-3 text-xs">
                  <span className="w-44 text-muted-foreground">{c}</span>
                  <input
                    type="range"
                    min={1}
                    max={5}
                    step={0.5}
                    value={notes[c]}
                    onChange={(e) => setNotes({ ...notes, [c]: Number(e.target.value) })}
                    className="flex-1 accent-[var(--brand)]"
                  />
                  <span className="num w-8 text-right">{notes[c]}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 flex items-center gap-3">
              <Tag ton="brand">Moyenne {moyenne.toFixed(1)}/5</Tag>
              <Barre valeur={(moyenne / 5) * 100} />
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <Btn variant="ghost" onClick={() => setSelection(null)}>Fermer</Btn>
              <Btn
                variant="primary"
                onClick={() => {
                  evaluerEntretien(selection, moyenne);
                  setSelection(null);
                }}
              >
                Valider le compte rendu
              </Btn>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
