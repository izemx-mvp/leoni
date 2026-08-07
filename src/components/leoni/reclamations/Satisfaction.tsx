import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Bloc, BarreValeur, Etoiles, KpiRec } from "./kit";
import { useRec } from "@/lib/reclamations-store";
import { SATISFACTION_MENSUELLE, SATISFACTION_PAR_EQUIPE, moyenneNotes } from "@/data/reclamations-v2";

export function SatisfactionTab() {
  const { reclamations } = useRec();
  const traitees = reclamations.filter((r) => r.statut === "resolved");
  const avecRetour = traitees.filter((r) => r.satisfaction);
  const notes = avecRetour.map((r) => r.satisfaction!.note);
  const moyenne = moyenneNotes(notes) || 4.2;
  const tauxReponse = traitees.length ? Math.round((avecRetour.length / traitees.length) * 100) : 68;
  const part = (v: string) =>
    avecRetour.length ? Math.round((avecRetour.filter((r) => r.satisfaction!.resolution === v).length / avecRetour.length) * 100) : 0;

  const parGroupe = (cle: "categorie" | "site") => {
    const map = new Map<string, number[]>();
    avecRetour.forEach((r) => {
      const k = r[cle];
      map.set(k, [...(map.get(k) ?? []), r.satisfaction!.note]);
    });
    return [...map.entries()].map(([label, v]) => ({ label, note: moyenneNotes(v) })).sort((a, b) => a.note - b.note);
  };

  const parCategorie = parGroupe("categorie");
  const parSite = parGroupe("site");

  return (
    <div className="space-y-4">
      <div className="grid gap-2.5 sm:grid-cols-3 xl:grid-cols-5">
        <KpiRec label="Satisfaction moyenne" valeur={`${moyenne} / 5`} ton="success" sous={`${avecRetour.length} retours`} />
        <KpiRec label="Taux de réponse" valeur={`${tauxReponse} %`} sous="Après demande de satisfaction" />
        <KpiRec label="Résolution complète" valeur={`${part("Oui") || 76} %`} ton="success" sous="« Oui »" />
        <KpiRec label="Résolution partielle" valeur={`${part("Partiellement") || 17} %`} ton="warning" sous="« Partiellement »" />
        <KpiRec label="Problème persistant" valeur={`${part("Non") || 7} %`} ton="critical" sous="« Non »" />
      </div>

      <div className="grid gap-3 xl:grid-cols-2">
        <Bloc titre="Satisfaction par catégorie">
          <div className="space-y-2.5">
            {parCategorie.map((c) => (
              <div key={c.label} className="flex items-center gap-3">
                <span className="w-28 shrink-0 truncate text-[11px] text-muted-foreground">{c.label}</span>
                <BarreValeur valeur={c.note} max={5} couleur={c.note < 3 ? "var(--critical)" : c.note < 4 ? "var(--warning)" : "var(--success)"} />
                <span className="num w-12 shrink-0 text-right text-[11px] font-medium tabular-nums">{c.note} / 5</span>
              </div>
            ))}
          </div>
        </Bloc>

        <Bloc titre="Satisfaction par site">
          <div className="space-y-2.5">
            {parSite.map((c) => (
              <div key={c.label} className="flex items-center gap-3">
                <span className="w-28 shrink-0 truncate text-[11px] text-muted-foreground">{c.label}</span>
                <BarreValeur valeur={c.note} max={5} couleur={c.note < 3 ? "var(--critical)" : c.note < 4 ? "var(--warning)" : "var(--success)"} />
                <span className="num w-12 shrink-0 text-right text-[11px] font-medium tabular-nums">{c.note} / 5</span>
              </div>
            ))}
          </div>
        </Bloc>

        <Bloc titre="Satisfaction par équipe">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={SATISFACTION_PAR_EQUIPE} margin={{ left: -20, top: 6 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="equipe" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} interval={0} angle={-14} textAnchor="end" height={46} />
                <YAxis domain={[0, 5]} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} formatter={(v: number) => [`${v} / 5`, "Satisfaction"]} />
                <Bar dataKey="note" fill="var(--brand)" radius={[4, 4, 0, 0]} maxBarSize={34} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Bloc>

        <Bloc titre="Évolution de la satisfaction">
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

      <Bloc titre="Derniers retours ouvriers">
        <div className="divide-y divide-border">
          {avecRetour.slice(0, 8).map((r) => (
            <div key={r.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 py-2.5">
              <span className="num w-28 shrink-0 text-[11px] text-[var(--brand)]">{r.id}</span>
              <span className="min-w-0 flex-1 truncate text-xs font-medium">{r.objet}</span>
              <span className="text-[11px] text-muted-foreground">{r.ouvrier}</span>
              <Etoiles note={r.satisfaction!.note} />
              <span className="w-24 text-right text-[11px] text-muted-foreground">{r.satisfaction!.resolution}</span>
            </div>
          ))}
        </div>
      </Bloc>
    </div>
  );
}
