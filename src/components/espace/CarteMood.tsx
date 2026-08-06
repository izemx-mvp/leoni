import { useMemo, useState } from "react";
import { CheckCircle2, EyeOff, Smile, TrendingDown } from "lucide-react";
import { useLeoni } from "@/lib/leoni-store";
import { CATEGORIES_MOOD, ECHELLE_MOOD, mood as moodInfo } from "@/data/satisfaction";
import { BoutonE, Carte, ChampE, Puce, inputE } from "@/components/espace/kit";

const dateDuJour = () => {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()}`;
};

/**
 * Carte « Comment s'est passée votre journée ? » — réponse quotidienne,
 * nominative ou anonyme, une seule fois par jour.
 */
export function CarteMood({
  ouvrierId,
  ouvrierNom,
  site,
  formation,
  groupe,
  formateur,
}: {
  ouvrierId: string;
  ouvrierNom: string;
  site: string;
  formation: string;
  groupe: string;
  formateur: string;
}) {
  const { moods, configSatisfaction, enregistrerMood } = useLeoni();
  const aujourdhui = dateDuJour();
  const [score, setScore] = useState<number | null>(null);
  const [categorie, setCategorie] = useState("Formation");
  const [commentaire, setCommentaire] = useState("");
  const [anonyme, setAnonyme] = useState(configSatisfaction.anonymat === "Obligatoire");
  const [envoye, setEnvoye] = useState(false);

  const mesMoods = useMemo(() => moods.filter((m) => m.ouvrierId === ouvrierId).slice(0, 7), [moods, ouvrierId]);
  const dejaRepondu = envoye || mesMoods.some((m) => m.date === aujourdhui);
  const moyenne7 = mesMoods.length
    ? Number((mesMoods.reduce((a, m) => a + m.score, 0) / mesMoods.length).toFixed(1))
    : 0;
  const baisse = mesMoods.length >= 3 && mesMoods.slice(0, 3).every((m) => m.score <= 2);

  const valider = () => {
    if (score === null) return;
    enregistrerMood({
      date: aujourdhui,
      score,
      categorie,
      commentaire: commentaire.trim() || undefined,
      anonyme,
      site,
      formation,
      groupe,
      formateur,
      ouvrierId: anonyme ? null : ouvrierId,
      ouvrierNom: anonyme ? null : ouvrierNom,
    });
    setEnvoye(true);
    setScore(null);
    setCommentaire("");
  };

  return (
    <Carte>
      <div className="flex items-start justify-between gap-2">
        <p className="flex items-center gap-2 text-sm font-bold">
          <Smile className="size-4 text-[var(--brand)]" /> Comment s'est passée votre journée ?
        </p>
        {mesMoods.length > 0 && (
          <Puce ton={moyenne7 >= 3.5 ? "success" : moyenne7 >= 2.5 ? "warning" : "critical"}>{moyenne7} / 5</Puce>
        )}
      </div>

      {dejaRepondu ? (
        <p className="mt-2 flex items-start gap-2 text-xs text-muted-foreground">
          <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[var(--success)]" />
          Merci, votre réponse du jour a bien été enregistrée. Vos réponses aident LEONI à améliorer la formation,
          le transport et les conditions de travail.
        </p>
      ) : (
        <>
          <div className="mt-3 flex items-center justify-between gap-1">
            {ECHELLE_MOOD.map((e) => (
              <button
                key={e.score}
                onClick={() => setScore(e.score)}
                aria-label={e.libelle}
                className={`flex flex-1 flex-col items-center gap-1 rounded-xl border px-1 py-2 transition ${
                  score === e.score ? "border-[var(--brand)] bg-[var(--brand-soft)]" : "border-border bg-card"
                }`}
              >
                <span className="text-2xl leading-none">{e.emoji}</span>
                <span className="text-[10px] font-semibold text-muted-foreground">{e.score}</span>
              </button>
            ))}
          </div>

          {score !== null && (
            <div className="mt-3 space-y-2.5">
              <ChampE label="Sur quoi porte votre réponse ?">
                <select className={inputE} value={categorie} onChange={(e) => setCategorie(e.target.value)}>
                  {CATEGORIES_MOOD.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </ChampE>
              <ChampE label="Commentaire (facultatif)" aide="Décrivez ce qui s'est bien ou mal passé.">
                <textarea
                  className={`${inputE} h-20 py-2`}
                  value={commentaire}
                  onChange={(e) => setCommentaire(e.target.value)}
                  placeholder="Exemple : le bus de la ligne TR-BSK-14 est arrivé avec 25 minutes de retard."
                />
              </ChampE>
              {configSatisfaction.anonymat !== "Désactivé" && (
                <label className="flex items-start gap-2 rounded-xl border border-border p-2.5 text-xs">
                  <input
                    type="checkbox"
                    className="mt-0.5 accent-[var(--brand)]"
                    checked={anonyme}
                    disabled={configSatisfaction.anonymat === "Obligatoire"}
                    onChange={(e) => setAnonyme(e.target.checked)}
                  />
                  <span>
                    <span className="flex items-center gap-1 font-semibold">
                      <EyeOff className="size-3.5" /> Répondre anonymement
                    </span>
                    <span className="text-muted-foreground">
                      Votre réponse ne sera rattachée à aucune fiche individuelle : elle alimente uniquement les
                      statistiques du site et du groupe.
                    </span>
                  </span>
                </label>
              )}
              <BoutonE className="w-full" onClick={valider}>
                Envoyer ma réponse
              </BoutonE>
            </div>
          )}
        </>
      )}

      {mesMoods.length > 0 && (
        <div className="mt-3 border-t border-border pt-3">
          <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Mes 7 derniers jours
          </p>
          <div className="flex items-end gap-1.5">
            {[...mesMoods].reverse().map((m) => (
              <div key={m.id} className="flex flex-1 flex-col items-center gap-0.5" title={`${m.date} · ${m.categorie}`}>
                <span className="text-lg leading-none">{moodInfo(m.score).emoji}</span>
                <span className="text-[9px] text-muted-foreground">{m.date.slice(0, 5)}</span>
              </div>
            ))}
          </div>
          {baisse && (
            <p className="mt-2 flex items-start gap-1.5 rounded-xl bg-[var(--warning)]/12 p-2.5 text-[11px] text-[var(--warning)]">
              <TrendingDown className="mt-0.5 size-3.5 shrink-0" />
              Vos dernières réponses sont négatives. Les RH ont été alertées et un entretien de suivi peut vous être
              proposé.
            </p>
          )}
        </div>
      )}
    </Carte>
  );
}
