import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { JOURS_SEMAINE, SESSIONS } from "@/data/leoni";
import { Btn, PageHeader, Panel, Tag } from "@/components/leoni/kit";
import { useLeoni } from "@/lib/leoni-store";

export const Route = createFileRoute("/formation/planning")({
  head: () => ({
    meta: [
      { title: "Planning de formation — LEONI Workforce Journey" },
      { name: "description", content: "Planning hebdomadaire des formations LEONI Maroc : sessions par jour, salles, formateurs et déplacement des créneaux." },
      { property: "og:title", content: "Planning de formation — LEONI Workforce Journey" },
      { property: "og:description", content: "Planning hebdomadaire des sessions de formation par site et par formateur." },
    ],
  }),
  component: PlanningPage,
});

function PlanningPage() {
  const { pousserNotification } = useLeoni();
  const [creneaux, setCreneaux] = useState(SESSIONS.map((s) => ({ ...s })));
  const [drag, setDrag] = useState<string | null>(null);

  const deposer = (jour: number) => {
    if (!drag) return;
    const session = creneaux.find((c) => c.id === drag);
    if (session && session.jour !== jour) {
      setCreneaux((prev) => prev.map((c) => (c.id === drag ? { ...c, jour } : c)));
      pousserNotification({
        titre: "Session déplacée",
        detail: `${session.groupe} — ${session.module} déplacée au ${JOURS_SEMAINE[jour - 1]}.`,
        ton: "info",
      });
    }
    setDrag(null);
  };

  return (
    <>
      <PageHeader
        titre="Planning de formation"
        sousTitre="Semaine du 27 au 31 juillet 2026 — glissez une session pour la déplacer"
        fil={[{ label: "Formation" }, { label: "Planning" }]}
        actions={
          <Btn
            onClick={() => {
              setCreneaux(SESSIONS.map((s) => ({ ...s })));
              pousserNotification({ titre: "Planning réinitialisé", detail: "Les créneaux sont revenus à leur position d'origine.", ton: "info" });
            }}
          >
            Réinitialiser
          </Btn>
        }
      />

      <div className="grid gap-3 md:grid-cols-5">
        {JOURS_SEMAINE.map((jour, i) => {
          const dujour = creneaux.filter((c) => c.jour === i + 1);
          return (
            <div
              key={jour}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => deposer(i + 1)}
              className="min-h-56 rounded-md border border-border bg-card p-2"
            >
              <p className="mb-2 border-b border-border px-1 pb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                {jour}
              </p>
              <div className="space-y-2">
                {dujour.map((c) => (
                  <article
                    key={c.id}
                    draggable
                    onDragStart={() => setDrag(c.id)}
                    className="cursor-grab rounded-sm border-l-2 border-l-[var(--brand)] border border-border bg-[var(--brand-soft)] p-2 active:cursor-grabbing"
                  >
                    <p className="num text-[10px] text-muted-foreground">{c.debut} – {c.fin}</p>
                    <p className="mt-0.5 text-xs font-semibold">{c.groupe}</p>
                    <p className="text-[11px] text-muted-foreground">{c.module}</p>
                    <p className="mt-1 text-[10px] text-muted-foreground">{c.salle} · {c.formateur}</p>
                    <Tag ton="info" className="mt-1">{c.participants} pers.</Tag>
                  </article>
                ))}
                {dujour.length === 0 && (
                  <p className="rounded-sm border border-dashed border-border px-2 py-6 text-center text-[11px] text-muted-foreground">
                    Aucun créneau
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <Panel className="mt-4" title="Charge des formateurs">
        <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {[...new Set(creneaux.map((c) => c.formateur))].map((f) => (
            <li key={f} className="flex items-center justify-between rounded-sm border border-border px-3 py-2 text-sm">
              {f}
              <Tag ton="brand">{creneaux.filter((c) => c.formateur === f).length} session(s)</Tag>
            </li>
          ))}
        </ul>
      </Panel>
    </>
  );
}
