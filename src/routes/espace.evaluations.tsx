import { createFileRoute, Link } from "@tanstack/react-router";
import { AlarmClock, Award, FileQuestion, RefreshCcw, Target } from "lucide-react";
import { useEspace } from "@/lib/espace-store";
import { BarreProgression, BoutonE, Carte, KpiE, Puce, SectionTitre, VideE } from "@/components/espace/kit";

export const Route = createFileRoute("/espace/evaluations")({
  head: () => ({
    meta: [
      { title: "Mes évaluations — Espace Ouvrier LEONI" },
      { name: "description", content: "QCM à passer, résultats détaillés, points forts et rattrapages." },
      { property: "og:title", content: "Mes évaluations — Espace Ouvrier LEONI" },
      { property: "og:description", content: "Passez vos QCM et consultez vos résultats détaillés." },
    ],
  }),
  component: Evaluations,
});

function Evaluations() {
  const { evaluations, resultats } = useEspace();
  const aPasser = evaluations.filter((e) => e.statut !== "Terminée" && e.visibilite === "worker-visible");
  const moyenne = resultats.length ? Math.round(resultats.reduce((s, r) => s + r.score, 0) / resultats.length) : 0;
  const reussis = resultats.filter((r) => r.reussi).length;

  return (
    <>
      <div className="grid grid-cols-3 gap-3">
        <KpiE label="À passer" valeur={aPasser.length} ton={aPasser.length ? "warning" : "success"} />
        <KpiE label="Moyenne" valeur={`${moyenne} %`} ton={moyenne >= 70 ? "success" : "warning"} />
        <KpiE label="Réussis" valeur={`${reussis}/${resultats.length}`} />
      </div>

      <section>
        <SectionTitre titre="À passer" />
        <div className="space-y-2.5">
          {aPasser.length === 0 && <VideE texte="Aucune évaluation en attente." />}
          {aPasser.map((e) => (
            <Carte key={e.id}>
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold">{e.titre}</p>
                  <p className="text-xs text-muted-foreground">{e.module}</p>
                </div>
                <Puce ton="warning">{e.statut}</Puce>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-muted-foreground sm:grid-cols-4">
                <span className="flex items-center gap-1">
                  <FileQuestion className="size-3.5" /> {e.questions.length} questions
                </span>
                <span className="flex items-center gap-1">
                  <AlarmClock className="size-3.5" /> {e.dureeMinutes} min
                </span>
                <span className="flex items-center gap-1">
                  <Target className="size-3.5" /> Seuil {e.seuil} %
                </span>
                <span className="flex items-center gap-1">
                  <RefreshCcw className="size-3.5" /> {e.tentativesMax - e.tentativesUtilisees} tentative(s)
                </span>
              </div>
              <p className="mt-2 text-[11px] text-muted-foreground">À passer avant le {e.limite}</p>
              <Link to="/espace/evaluation/$id" params={{ id: e.id }} className="mt-3 block">
                <BoutonE className="w-full">Commencer l'évaluation</BoutonE>
              </Link>
            </Carte>
          ))}
        </div>
      </section>

      <section>
        <SectionTitre titre="Mes résultats" />
        <div className="space-y-2.5">
          {resultats.length === 0 && <VideE texte="Aucun résultat pour le moment." />}
          {resultats.map((r) => (
            <Carte key={r.id}>
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold">{r.titre}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {r.type} · {r.date} · tentative {r.tentative}
                    {r.evaluateur ? ` · ${r.evaluateur}` : ""}
                  </p>
                </div>
                <Puce ton={r.reussi ? "success" : "critical"}>{r.reussi ? "Réussi" : "Non validé"}</Puce>
              </div>

              <div className="mt-3 flex items-center gap-3">
                <span className="text-2xl font-black">{r.score} %</span>
                <div className="flex-1">
                  <BarreProgression valeur={r.score} ton={r.reussi ? "success" : "critical"} />
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    Seuil {r.seuil} %{r.total ? ` · ${r.bonnes}/${r.total} bonnes réponses` : ""} · {r.dureeMinutes} min
                  </p>
                </div>
              </div>

              {r.criteres && (
                <div className="mt-3 space-y-1.5">
                  {r.criteres.map((c) => (
                    <div key={c.label} className="flex items-center gap-2 text-xs">
                      <span className="w-40 shrink-0 truncate text-muted-foreground">{c.label}</span>
                      <BarreProgression valeur={(c.note / c.sur) * 100} />
                      <span className="w-10 shrink-0 text-right font-semibold">
                        {c.note}/{c.sur}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <div className="rounded-xl bg-[var(--success)]/10 p-3">
                  <p className="flex items-center gap-1.5 text-[11px] font-bold text-[var(--success)]">
                    <Award className="size-3.5" /> Points forts
                  </p>
                  <ul className="mt-1 space-y-0.5 text-[11px] text-muted-foreground">
                    {r.pointsForts.map((p) => (
                      <li key={p}>• {p}</li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-xl bg-[var(--warning)]/12 p-3">
                  <p className="text-[11px] font-bold text-[var(--warning)]">À revoir</p>
                  <ul className="mt-1 space-y-0.5 text-[11px] text-muted-foreground">
                    {r.aRevoir.length === 0 && <li>• Rien à signaler</li>}
                    {r.aRevoir.map((p) => (
                      <li key={p}>• {p}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {r.rattrapage && (
                <p className="mt-3 rounded-xl bg-[var(--brand-soft)] p-3 text-xs font-medium text-[var(--brand)]">
                  Rattrapage programmé le {r.rattrapage.date} à {r.rattrapage.heure} — {r.rattrapage.salle}
                </p>
              )}
            </Carte>
          ))}
        </div>
      </section>
    </>
  );
}
