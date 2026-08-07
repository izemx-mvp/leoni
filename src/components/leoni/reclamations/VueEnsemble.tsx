import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AlertTriangle } from "lucide-react";
import { Bloc, BarreValeur, Carte, KpiRec } from "./kit";
import { useRec } from "@/lib/reclamations-store";
import { A_SURVEILLER, DELAI_PAR_CATEGORIE, SATISFACTION_MENSUELLE, VOLUME_MENSUEL, moyenneNotes } from "@/data/reclamations-v2";

export function VueEnsemble({ aller }: { aller: (vue: string) => void }) {
  const { reclamations } = useRec();

  const nouvelles = reclamations.filter((r) => r.statut === "new").length;
  const enCours = reclamations.filter((r) => r.statut === "in_progress").length;
  const traitees = reclamations.filter((r) => r.statut === "resolved").length;
  const critiques = reclamations.filter((r) => r.priorite === "Critique" && r.statut !== "resolved").length;
  const notes = reclamations.map((r) => r.satisfaction?.note).filter((n): n is number => typeof n === "number");
  const satisfaction = moyenneNotes(notes);
  const taux = notes.length ? Math.round((notes.filter((n) => n >= 4).length / notes.length) * 100) : 0;

  const parCategorie = Object.entries(
    reclamations.reduce<Record<string, number>>((acc, r) => ({ ...acc, [r.categorie]: (acc[r.categorie] ?? 0) + 1 }), {}),
  )
    .map(([categorie, volume]) => ({ categorie, volume }))
    .sort((a, b) => b.volume - a.volume);
  const maxCat = parCategorie[0]?.volume ?? 1;

  return (
    <div className="space-y-4">
      <div className="grid gap-2.5 sm:grid-cols-3 xl:grid-cols-5">
        <KpiRec label="Nouvelles" valeur={String(nouvelles)} ton="brand" sous="En attente de prise en charge" />
        <KpiRec label="En cours" valeur={String(enCours)} ton="warning" sous="Traitement engagé" />
        <KpiRec label="Traitées ce mois" valeur={String(186 + traitees - 30)} ton="success" sous="Clôturées après solution" />
        <KpiRec label="Critiques ouvertes" valeur={String(critiques)} ton="critical" sous="Priorité maximale" />
        <KpiRec label="1ʳᵉ prise en charge" valeur="1h42" sous="Délai moyen" />
        <KpiRec label="Temps moyen de traitement" valeur="16h18" sous="De la création à la solution" />
        <KpiRec label="Satisfaction après traitement" valeur={`${satisfaction || 4.2} / 5`} ton="success" sous="Retours ouvriers" />
        <KpiRec label="Taux de satisfaction" valeur={`${taux || 84} %`} sous="Notes ≥ 4 / 5" />
        <KpiRec label="Réclamations / 1 000 ouvriers" valeur="9,4" sous="Objectif < 9" ton="warning" />
      </div>

      <Bloc titre="À surveiller">
        <div className="grid gap-2 sm:grid-cols-2">
          {A_SURVEILLER.map((a) => (
            <div
              key={a.texte}
              className="flex items-start gap-2.5 rounded-lg border border-border px-3 py-2.5 transition-colors hover:bg-[var(--hover)]"
            >
              <AlertTriangle
                className="mt-0.5 size-3.5 shrink-0"
                style={{ color: a.ton === "critical" ? "var(--critical)" : "var(--warning)" }}
              />
              <p className="text-xs text-foreground">{a.texte}</p>
            </div>
          ))}
        </div>
      </Bloc>

      <div className="grid gap-3 xl:grid-cols-2">
        <Bloc titre="Évolution du volume de réclamations">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={VOLUME_MENSUEL} margin={{ left: -20, top: 6 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="mois" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Line type="monotone" dataKey="volume" name="Reçues" stroke="var(--brand)" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="traitees" name="Traitées" stroke="var(--success)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Bloc>

        <Bloc titre="Répartition par catégorie" action={<button onClick={() => aller("Analyse")} className="text-[11px] text-[var(--brand)] hover:underline">Analyser</button>}>
          <div className="space-y-2.5">
            {parCategorie.slice(0, 8).map((c) => (
              <div key={c.categorie} className="flex items-center gap-3">
                <span className="w-28 shrink-0 truncate text-[11px] text-muted-foreground">{c.categorie}</span>
                <BarreValeur valeur={c.volume} max={maxCat} />
                <span className="num w-7 shrink-0 text-right text-[11px] font-medium tabular-nums">{c.volume}</span>
              </div>
            ))}
          </div>
        </Bloc>

        <Bloc titre="Temps moyen de traitement par catégorie">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={DELAI_PAR_CATEGORIE} margin={{ left: -20, top: 6 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="categorie" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} interval={0} angle={-14} textAnchor="end" height={46} />
                <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} unit=" h" />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} formatter={(v: number) => [`${v} h`, "Délai moyen"]} />
                <Bar dataKey="heures" fill="var(--brand)" radius={[4, 4, 0, 0]} maxBarSize={34} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Bloc>

        <Bloc titre="Satisfaction après traitement">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={SATISFACTION_MENSUELLE} margin={{ left: -20, top: 6 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="mois" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis domain={[3, 5]} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} formatter={(v: number) => [`${v} / 5`, "Satisfaction"]} />
                <Line type="monotone" dataKey="note" stroke="var(--success)" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Bloc>
      </div>

      <Carte className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
        <p className="text-xs text-muted-foreground">
          {nouvelles + enCours} réclamations actives · {critiques} critiques nécessitent un arbitrage aujourd'hui.
        </p>
        <button onClick={() => aller("Boîte de traitement")} className="text-xs font-medium text-[var(--brand)] hover:underline">
          Ouvrir la boîte de traitement →
        </button>
      </Carte>
    </div>
  );
}
