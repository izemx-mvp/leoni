import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Bloc, BarreValeur, BoutonR, Carte, KpiRec } from "./kit";
import { useRec } from "@/lib/reclamations-store";
import { DELAI_PAR_CATEGORIE, PROBLEMES_RECURRENTS, TOP_PROBLEMES, VOLUME_MENSUEL, moyenneNotes } from "@/data/reclamations-v2";

export function Analyse({ onAction }: { onAction: (titre: string) => void }) {
  const { reclamations } = useRec();
  const notes = reclamations.map((r) => r.satisfaction?.note).filter((n): n is number => typeof n === "number");

  const parSite = Object.entries(
    reclamations.reduce<Record<string, number>>((acc, r) => ({ ...acc, [r.site]: (acc[r.site] ?? 0) + 1 }), {}),
  )
    .map(([site, volume]) => ({ site, volume }))
    .sort((a, b) => b.volume - a.volume);

  const maxTop = TOP_PROBLEMES[0].volume;

  return (
    <div className="space-y-4">
      <div className="grid gap-2.5 sm:grid-cols-3 xl:grid-cols-6">
        <KpiRec label="Volume total" valeur={String(reclamations.length)} ton="brand" sous="Sur la période" />
        <KpiRec label="Catégories actives" valeur={String(new Set(reclamations.map((r) => r.categorie)).size)} />
        <KpiRec label="Sites concernés" valeur={String(parSite.length)} />
        <KpiRec label="Délai moyen" valeur="16h18" ton="warning" sous="Création → solution" />
        <KpiRec label="Satisfaction" valeur={`${moyenneNotes(notes) || 4.2} / 5`} ton="success" />
        <KpiRec label="Récurrence" valeur={`${PROBLEMES_RECURRENTS.length}`} ton="critical" sous="Problèmes récurrents détectés" />
      </div>

      <div className="grid gap-3 xl:grid-cols-2">
        <Bloc titre="Top problèmes">
          <div className="space-y-3">
            {TOP_PROBLEMES.map((p) => (
              <div key={p.categorie} className="space-y-1.5">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs font-medium">{p.categorie}</span>
                  <span className="flex items-center gap-2">
                    <span className="num text-xs font-semibold tabular-nums">{p.volume}</span>
                    <span
                      className="inline-flex items-center gap-0.5 text-[11px]"
                      style={{ color: p.variation > 0 ? "var(--critical)" : p.variation < 0 ? "var(--success)" : "var(--muted-foreground)" }}
                    >
                      {p.variation > 0 ? <ArrowUpRight className="size-3" /> : p.variation < 0 ? <ArrowDownRight className="size-3" /> : <Minus className="size-3" />}
                      {p.variation > 0 ? "+" : ""}
                      {p.variation} %
                    </span>
                  </span>
                </div>
                <BarreValeur valeur={p.volume} max={maxTop} couleur={p.variation > 10 ? "var(--critical)" : "var(--brand)"} />
              </div>
            ))}
          </div>
        </Bloc>

        <Bloc titre="Volume par site">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={parSite} margin={{ left: -20, top: 6 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="site" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} interval={0} angle={-14} textAnchor="end" height={46} />
                <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Bar dataKey="volume" fill="var(--brand)" radius={[4, 4, 0, 0]} maxBarSize={34} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Bloc>

        <Bloc titre="Délais par catégorie">
          <div className="space-y-2.5">
            {DELAI_PAR_CATEGORIE.map((d) => (
              <div key={d.categorie} className="flex items-center gap-3">
                <span className="w-28 shrink-0 truncate text-[11px] text-muted-foreground">{d.categorie}</span>
                <BarreValeur valeur={d.heures} max={30} couleur={d.heures > 20 ? "var(--critical)" : d.heures > 14 ? "var(--warning)" : "var(--success)"} />
                <span className="num w-14 shrink-0 text-right text-[11px] tabular-nums">{d.heures} h</span>
              </div>
            ))}
          </div>
        </Bloc>

        <Bloc titre="Volume mensuel vs traitement">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={VOLUME_MENSUEL} margin={{ left: -20, top: 6 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="mois" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Bar dataKey="volume" name="Reçues" fill="var(--brand)" radius={[4, 4, 0, 0]} maxBarSize={22} />
                <Bar dataKey="traitees" name="Traitées" fill="var(--success)" radius={[4, 4, 0, 0]} maxBarSize={22} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Bloc>
      </div>

      <section>
        <h3 className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">Problèmes récurrents</h3>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {PROBLEMES_RECURRENTS.map((p) => (
            <Carte key={p.titre} className="flex flex-col gap-3 p-4 transition-colors hover:border-[var(--brand)]/40">
              <div>
                <p className="text-xs font-semibold leading-snug">{p.titre}</p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">{p.site}</p>
              </div>
              <div className="space-y-1">
                <p className="num text-lg font-semibold tabular-nums">{p.volume}</p>
                <p className="text-[11px] text-muted-foreground">réclamations en {p.fenetre}</p>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-muted-foreground">Satisfaction</span>
                <span className="font-medium" style={{ color: p.satisfaction < 3 ? "var(--critical)" : "var(--warning)" }}>
                  {p.satisfaction} / 5
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-muted-foreground">Tendance</span>
                <span style={{ color: p.tendance === "En hausse" ? "var(--critical)" : p.tendance === "En baisse" ? "var(--success)" : "var(--muted-foreground)" }}>
                  {p.tendance}
                </span>
              </div>
              <BoutonR taille="sm" onClick={() => onAction(p.titre)} className="mt-auto w-full">
                Créer action corrective
              </BoutonR>
            </Carte>
          ))}
        </div>
      </section>
    </div>
  );
}
