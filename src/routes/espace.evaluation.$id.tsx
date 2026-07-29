import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AlarmClock, ArrowLeft, ArrowRight, CheckCircle2, Send, XCircle } from "lucide-react";
import { useEspace, type ReponsesQcm } from "@/lib/espace-store";
import { BarreProgression, BoutonE, Carte, FeuilleModale, Puce, VideE, inputE } from "@/components/espace/kit";
import type { ResultatOuvrier } from "@/data/espace-ouvrier";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/espace/evaluation/$id")({
  head: () => ({
    meta: [
      { title: "Passer une évaluation — Espace Ouvrier LEONI" },
      { name: "description", content: "Interface de passage du QCM : questions, chronomètre et résultat immédiat." },
      { property: "og:title", content: "Passer une évaluation — Espace Ouvrier LEONI" },
      { property: "og:description", content: "Passez votre QCM et obtenez votre résultat immédiatement." },
    ],
  }),
  component: PassageQcm,
});

function PassageQcm() {
  const { id } = useParams({ from: "/espace/evaluation/$id" });
  const navigate = useNavigate();
  const { evaluations, brouillonQcm, sauverBrouillon, terminerEvaluation } = useEspace();
  const evaluation = evaluations.find((e) => e.id === id);

  const [demarre, setDemarre] = useState(false);
  const [index, setIndex] = useState(0);
  const [reponses, setReponses] = useState<ReponsesQcm>(brouillonQcm[id] ?? {});
  const [secondes, setSecondes] = useState(0);
  const [confirmer, setConfirmer] = useState(false);
  const [resultat, setResultat] = useState<ResultatOuvrier | null>(null);

  const restant = useMemo(
    () => Math.max(0, (evaluation?.dureeMinutes ?? 0) * 60 - secondes),
    [evaluation, secondes],
  );

  useEffect(() => {
    if (!demarre || resultat) return;
    const t = setInterval(() => setSecondes((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [demarre, resultat]);

  useEffect(() => {
    if (demarre && !resultat) sauverBrouillon(id, reponses);
  }, [reponses, demarre, resultat, id, sauverBrouillon]);

  if (!evaluation) return <VideE texte="Évaluation introuvable." />;

  const question = evaluation.questions[index];
  const total = evaluation.questions.length;
  const repondues = evaluation.questions.filter((q) => {
    const r = reponses[q.id];
    return Array.isArray(r) ? r.length > 0 : typeof r === "string" && r.trim().length > 0;
  }).length;

  const valider = () => {
    const res = terminerEvaluation(id, reponses, secondes);
    setConfirmer(false);
    if (res) setResultat(res);
  };

  const mmss = `${String(Math.floor(restant / 60)).padStart(2, "0")}:${String(restant % 60).padStart(2, "0")}`;

  if (resultat) {
    return (
      <>
        <Carte className={cn(resultat.reussi ? "bg-[var(--success)]/10" : "bg-[var(--critical)]/10")}>
          <div className="flex items-center gap-3">
            {resultat.reussi ? (
              <CheckCircle2 className="size-8 text-[var(--success)]" />
            ) : (
              <XCircle className="size-8 text-[var(--critical)]" />
            )}
            <div>
              <p className="text-lg font-black tracking-tight">
                {resultat.reussi ? "Évaluation réussie" : "Évaluation non validée"}
              </p>
              <p className="text-xs text-muted-foreground">
                {resultat.bonnes}/{resultat.total} bonnes réponses · seuil {resultat.seuil} %
              </p>
            </div>
            <span className="ml-auto text-3xl font-black">{resultat.score} %</span>
          </div>
          <div className="mt-3">
            <BarreProgression valeur={resultat.score} ton={resultat.reussi ? "success" : "critical"} />
          </div>
        </Carte>

        <Carte>
          <p className="text-sm font-bold">Analyse par thème</p>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            <div className="rounded-xl bg-[var(--success)]/10 p-3">
              <p className="text-[11px] font-bold text-[var(--success)]">Points forts</p>
              <ul className="mt-1 text-[11px] text-muted-foreground">
                {resultat.pointsForts.map((p) => (
                  <li key={p}>• {p}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl bg-[var(--warning)]/12 p-3">
              <p className="text-[11px] font-bold text-[var(--warning)]">À revoir</p>
              <ul className="mt-1 text-[11px] text-muted-foreground">
                {resultat.aRevoir.length === 0 && <li>• Rien à signaler</li>}
                {resultat.aRevoir.map((p) => (
                  <li key={p}>• {p}</li>
                ))}
              </ul>
            </div>
          </div>
          {resultat.rattrapage && (
            <p className="mt-3 rounded-xl bg-[var(--brand-soft)] p-3 text-xs font-medium text-[var(--brand)]">
              Un rattrapage vous est proposé le {resultat.rattrapage.date} à {resultat.rattrapage.heure} —{" "}
              {resultat.rattrapage.salle}
            </p>
          )}
          <p className="mt-3 text-[11px] text-muted-foreground">
            Votre résultat a été transmis à votre formateur et enregistré dans votre dossier.
          </p>
        </Carte>

        <BoutonE className="w-full" onClick={() => navigate({ to: "/espace/evaluations" })}>
          Retour à mes évaluations
        </BoutonE>
      </>
    );
  }

  if (!demarre) {
    return (
      <Carte>
        <p className="text-lg font-black tracking-tight">{evaluation.titre}</p>
        <p className="text-xs text-muted-foreground">{evaluation.module}</p>
        <div className="mt-4 space-y-1.5 text-sm">
          <p>• {total} questions</p>
          <p>• Durée : {evaluation.dureeMinutes} minutes</p>
          <p>• Seuil de réussite : {evaluation.seuil} %</p>
          <p>• Tentatives restantes : {evaluation.tentativesMax - evaluation.tentativesUtilisees}</p>
        </div>
        <p className="mt-4 rounded-xl bg-muted p-3 text-xs text-muted-foreground">{evaluation.instructions}</p>
        <BoutonE className="mt-4 w-full" taille="lg" onClick={() => setDemarre(true)}>
          Démarrer
        </BoutonE>
        <BoutonE className="mt-2 w-full" variante="fantome" onClick={() => navigate({ to: "/espace/evaluations" })}>
          Annuler
        </BoutonE>
      </Carte>
    );
  }

  const rep = reponses[question.id];
  const multi = question.type === "Choix multiples";

  const cocher = (i: number) => {
    setReponses((prev) => {
      const actuel = Array.isArray(prev[question.id]) ? (prev[question.id] as number[]) : [];
      if (multi) {
        return { ...prev, [question.id]: actuel.includes(i) ? actuel.filter((x) => x !== i) : [...actuel, i] };
      }
      return { ...prev, [question.id]: [i] };
    });
  };

  return (
    <>
      <Carte>
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-bold">
            Question {index + 1} / {total}
          </p>
          <Puce ton={restant < 120 ? "critical" : "brand"}>
            <AlarmClock className="size-3.5" /> {mmss}
          </Puce>
        </div>
        <div className="mt-2">
          <BarreProgression valeur={(repondues / total) * 100} />
          <p className="mt-1 text-[11px] text-muted-foreground">{repondues} question(s) répondue(s)</p>
        </div>
      </Carte>

      <Carte>
        <Puce ton="info">{question.type}</Puce>
        <p className="mt-3 text-base font-semibold leading-snug">{question.enonce}</p>
        {question.aide && <p className="mt-1 text-xs text-muted-foreground">{question.aide}</p>}

        <div className="mt-4 space-y-2">
          {question.type === "Réponse courte" ? (
            <textarea
              className={inputE}
              rows={4}
              value={typeof rep === "string" ? rep : ""}
              onChange={(e) => setReponses((p) => ({ ...p, [question.id]: e.target.value }))}
              placeholder="Votre réponse…"
            />
          ) : (
            (question.options ?? []).map((o, i) => {
              const choisi = Array.isArray(rep) && rep.includes(i);
              return (
                <button
                  key={o}
                  onClick={() => cocher(i)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl border p-3.5 text-left text-sm transition-colors",
                    choisi ? "border-[var(--brand)] bg-[var(--brand-soft)]" : "border-border hover:bg-[var(--hover)]",
                  )}
                >
                  <span
                    className={cn(
                      "flex size-5 shrink-0 items-center justify-center border-2",
                      multi ? "rounded-md" : "rounded-full",
                      choisi ? "border-[var(--brand)] bg-[var(--brand)]" : "border-border",
                    )}
                  >
                    {choisi && <CheckCircle2 className="size-3.5 text-[var(--brand-foreground)]" />}
                  </span>
                  <span>{o}</span>
                </button>
              );
            })
          )}
        </div>
      </Carte>

      <div className="flex gap-2">
        <BoutonE variante="secondaire" onClick={() => setIndex((i) => Math.max(0, i - 1))} disabled={index === 0}>
          <ArrowLeft className="size-4" /> Précédent
        </BoutonE>
        {index < total - 1 ? (
          <BoutonE className="flex-1" onClick={() => setIndex((i) => i + 1)}>
            Suivant <ArrowRight className="size-4" />
          </BoutonE>
        ) : (
          <BoutonE className="flex-1" onClick={() => setConfirmer(true)}>
            <Send className="size-4" /> Terminer
          </BoutonE>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5">
        {evaluation.questions.map((q, i) => {
          const ok = Array.isArray(reponses[q.id])
            ? (reponses[q.id] as number[]).length > 0
            : typeof reponses[q.id] === "string" && (reponses[q.id] as string).trim().length > 0;
          return (
            <button
              key={q.id}
              onClick={() => setIndex(i)}
              className={cn(
                "size-8 rounded-lg border text-xs font-semibold",
                i === index && "border-[var(--brand)]",
                ok ? "bg-[var(--brand-soft)] text-[var(--brand)]" : "border-border text-muted-foreground",
              )}
            >
              {i + 1}
            </button>
          );
        })}
      </div>

      {confirmer && (
        <FeuilleModale
          titre="Terminer l'évaluation ?"
          onClose={() => setConfirmer(false)}
          pied={
            <>
              <BoutonE variante="secondaire" className="flex-1" onClick={() => setConfirmer(false)}>
                Continuer
              </BoutonE>
              <BoutonE className="flex-1" onClick={valider}>
                Valider mes réponses
              </BoutonE>
            </>
          }
        >
          <p className="text-sm text-muted-foreground">
            Vous avez répondu à {repondues} question(s) sur {total}. Après validation, votre résultat sera calculé et
            transmis à votre formateur.
          </p>
        </FeuilleModale>
      )}
    </>
  );
}
