import { createFileRoute } from "@tanstack/react-router";
import { CalendarDays, CheckCircle2, Circle, Clock, MapPin, User } from "lucide-react";
import { useEspace } from "@/lib/espace-store";
import { PLANNING_ESPACE, AUJOURDHUI } from "@/data/espace-ouvrier";
import { BarreProgression, Carte, KpiE, Puce, SectionTitre, VideE, tonStatutOuvrier } from "@/components/espace/kit";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/espace/formation")({
  head: () => ({
    meta: [
      { title: "Ma formation — Espace Ouvrier LEONI" },
      { name: "description", content: "Parcours de formation, modules validés, planning et évaluations du formateur." },
      { property: "og:title", content: "Ma formation — Espace Ouvrier LEONI" },
      { property: "og:description", content: "Suivez votre parcours, vos modules et votre planning de formation." },
    ],
  }),
  component: MaFormation,
});

function MaFormation() {
  const { ouvrier } = useEspace();
  if (!ouvrier) return <VideE texte="Fiche ouvrier introuvable." />;

  const jours = [...new Set(PLANNING_ESPACE.map((c) => c.jour))];
  const feedbacks = ouvrier.evenements.filter((e) => e.type === "Feedback" || e.type === "Observation").slice(0, 6);

  return (
    <>
      <Carte>
        <SectionTitre titre="Mon parcours" />
        <p className="text-sm font-semibold">{ouvrier.parcoursLibelle}</p>
        <p className="text-xs text-muted-foreground">
          Formateur : {ouvrier.formateur} · Groupe {ouvrier.groupe} · {ouvrier.atelier}
        </p>
        <div className="mt-4">
          <div className="mb-1.5 flex items-center justify-between text-xs font-semibold">
            <span>
              Jour {ouvrier.jour} sur {ouvrier.jourTotal}
            </span>
            <span className="text-[var(--brand)]">{ouvrier.progression} %</span>
          </div>
          <BarreProgression valeur={ouvrier.progression} />
        </div>
        <div className="mt-4 grid grid-cols-3 gap-3">
          <KpiE label="Modules validés" valeur={ouvrier.modules.filter((m) => m.statut.startsWith("Validé")).length} sous={`sur ${ouvrier.modules.length}`} />
          <KpiE label="Score moyen" valeur={`${ouvrier.score} %`} ton={ouvrier.score >= 70 ? "success" : "warning"} />
          <KpiE label="Présence" valeur={`${ouvrier.presence} %`} ton={ouvrier.presence >= 90 ? "success" : "warning"} />
        </div>
      </Carte>

      <section>
        <SectionTitre titre="Étapes du parcours" />
        <ol className="relative space-y-3 border-l border-border pl-5">
          {ouvrier.modules.map((m) => {
            const fait = m.statut.startsWith("Validé");
            const encours = m.statut === "En cours";
            return (
              <li key={m.code} className="relative">
                <span
                  className={cn(
                    "absolute -left-[27px] top-1 flex size-4 items-center justify-center rounded-full bg-background",
                    fait ? "text-[var(--success)]" : encours ? "text-[var(--brand)]" : "text-muted-foreground",
                  )}
                >
                  {fait ? <CheckCircle2 className="size-4" /> : <Circle className="size-4" />}
                </span>
                <Carte>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{m.nom}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {m.code}
                        {m.date ? ` · ${m.date}` : ""}
                        {m.formateur ? ` · ${m.formateur}` : ""}
                      </p>
                    </div>
                    <Puce ton={tonStatutOuvrier(m.statut)}>{m.statut}</Puce>
                  </div>
                  {typeof m.score === "number" && (
                    <p className="mt-2 text-xs font-semibold text-[var(--brand)]">Score : {m.score} %</p>
                  )}
                  {m.commentaire && <p className="mt-1 text-xs text-muted-foreground">{m.commentaire}</p>}
                </Carte>
              </li>
            );
          })}
        </ol>
      </section>

      <section>
        <SectionTitre titre="Mon planning de la semaine" />
        <div className="space-y-4">
          {jours.map((j) => (
            <div key={j}>
              <p className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <CalendarDays className="size-3.5" />
                {PLANNING_ESPACE.find((c) => c.jour === j)?.jourLibelle}
                {j === AUJOURDHUI && <Puce ton="brand">Aujourd'hui</Puce>}
              </p>
              <div className="space-y-2.5">
                {PLANNING_ESPACE.filter((c) => c.jour === j).map((c) => (
                  <Carte key={c.id}>
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold">{c.titre}</p>
                      <Puce ton={tonStatutOuvrier(c.statut)}>{c.statut}</Puce>
                    </div>
                    <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="size-3" /> {c.debut} – {c.fin}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="size-3" /> {c.lieu}
                      </span>
                      <span className="flex items-center gap-1">
                        <User className="size-3" /> {c.formateur}
                      </span>
                    </div>
                  </Carte>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <SectionTitre titre="Retours de mon formateur" />
        <div className="space-y-2.5">
          {feedbacks.length === 0 && <VideE texte="Aucun retour pour le moment." />}
          {feedbacks.map((e) => (
            <Carte key={e.id}>
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-semibold">{e.titre}</p>
                <Puce
                  ton={
                    e.tonalite === "Positive"
                      ? "success"
                      : e.tonalite === "Critique"
                        ? "critical"
                        : e.tonalite === "Négative"
                          ? "warning"
                          : "neutral"
                  }
                >
                  {e.tonalite}
                </Puce>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{e.contenu}</p>
              <p className="mt-2 text-[11px] text-muted-foreground">
                {e.auteur} · {e.date}
              </p>
            </Carte>
          ))}
        </div>
      </section>
    </>
  );
}
