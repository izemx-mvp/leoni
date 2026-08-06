import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Panel, Tag } from "@/components/leoni/kit";
import { POSTES_DETAIL, POSTES_CRITIQUES } from "@/data/postes-critiques";
import { BESOINS_DETAIL, CANAUX_GLOBAUX, SERIE_BESOINS_MENSUELLE, efficaciteCanal, couvertureBesoin } from "@/data/postes-campagnes";

const COULEURS = ["var(--brand)", "var(--success)", "var(--warning)", "var(--critical)", "var(--info)", "var(--neutral)"];

function parSite() {
  const map = new Map<string, { site: string; volume: number; pourvus: number }>();
  for (const b of BESOINS_DETAIL) {
    const e = map.get(b.site) ?? { site: b.site, volume: 0, pourvus: 0 };
    e.volume += b.volume;
    e.pourvus += b.pourvus;
    map.set(b.site, e);
  }
  return Array.from(map.values()).map((e) => ({ ...e, couverture: e.volume ? Math.round((e.pourvus / e.volume) * 100) : 0 }));
}

function parFamille() {
  const map = new Map<string, { famille: string; ouverts: number; effectifCible: number }>();
  for (const p of POSTES_DETAIL) {
    const e = map.get(p.famille) ?? { famille: p.famille, ouverts: 0, effectifCible: 0 };
    e.ouverts += p.ouverts;
    e.effectifCible += p.effectifCible;
    map.set(p.famille, e);
  }
  return Array.from(map.values()).map((e) => ({ ...e, tension: e.effectifCible ? Math.round((e.ouverts / e.effectifCible) * 1000) / 10 : 0 }));
}

function delaiParPoste() {
  return [...POSTES_DETAIL]
    .sort((a, b) => b.delaiMoyenJours - a.delaiMoyenJours)
    .slice(0, 8)
    .map((p) => ({ nom: p.nom.length > 22 ? p.nom.slice(0, 20) + "…" : p.nom, delai: p.delaiMoyenJours, critique: p.isCritical }));
}

export function AnalysesPostes() {
  const sites = parSite();
  const familles = parFamille();
  const delais = delaiParPoste();
  const partCritique = [
    { nom: "Postes critiques", valeur: POSTES_CRITIQUES.length },
    { nom: "Postes non critiques", valeur: POSTES_DETAIL.length - POSTES_CRITIQUES.length },
  ];
  const retards = BESOINS_DETAIL.filter((b) => b.statut === "En retard").length;
  const objectifGlobal = 100;
  const couvertureMoyenne = Math.round(BESOINS_DETAIL.reduce((s, b) => s + couvertureBesoin(b), 0) / BESOINS_DETAIL.length);

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <Panel title="Couverture des besoins par site" subtitle="Volume ouvert vs pourvus, taux de couverture (%)">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={sites} margin={{ left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="site" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="volume" name="Volume besoin" fill="var(--neutral)" radius={[3, 3, 0, 0]} />
              <Bar dataKey="pourvus" name="Pourvus" fill="var(--brand)" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Panel>

      <Panel title="Tension par famille de poste" subtitle="Postes ouverts rapportés à l'effectif cible (%)">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={familles} margin={{ left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="famille" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} unit="%" />
              <Tooltip contentStyle={{ fontSize: 12 }} formatter={(v: number) => `${v} %`} />
              <Bar dataKey="tension" name="Tension" radius={[3, 3, 0, 0]}>
                {familles.map((f, i) => (
                  <Cell key={f.famille} fill={f.tension >= 8 ? "var(--critical)" : f.tension >= 4 ? "var(--warning)" : "var(--brand)"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Panel>

      <Panel title="Délai moyen de pourvoi par poste" subtitle="En jours — top 8 postes les plus longs à pourvoir">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={delais} layout="vertical" margin={{ left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="nom" width={150} tick={{ fontSize: 10 }} />
              <Tooltip contentStyle={{ fontSize: 12 }} formatter={(v: number) => `${v} jours`} />
              <Bar dataKey="delai" name="Délai (jours)" radius={[0, 3, 3, 0]}>
                {delais.map((d) => (
                  <Cell key={d.nom} fill={d.critique ? "var(--critical)" : "var(--brand)"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Panel>

      <Panel title="Part des postes critiques" subtitle={`${POSTES_CRITIQUES.length} postes critiques sur ${POSTES_DETAIL.length} au référentiel`}>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={partCritique} dataKey="valeur" nameKey="nom" innerRadius={55} outerRadius={85} paddingAngle={2}>
                {partCritique.map((_, i) => (
                  <Cell key={i} fill={i === 0 ? "var(--critical)" : "var(--neutral)"} />
                ))}
              </Pie>
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </Panel>

      <Panel title="Évolution mensuelle — besoins vs pourvus" subtitle="Cumul des postes ouverts et des postes pourvus">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={SERIE_BESOINS_MENSUELLE} margin={{ left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="mois" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Area type="monotone" dataKey="besoinsOuverts" name="Besoins ouverts" stroke="var(--neutral)" fill="var(--neutral)" fillOpacity={0.25} />
              <Area type="monotone" dataKey="pourvus" name="Pourvus" stroke="var(--brand)" fill="var(--brand)" fillOpacity={0.35} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Panel>

      <Panel title="Efficacité des campagnes par canal" subtitle="Taux de transformation reçus → retenus (%)">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={CANAUX_GLOBAUX.map((c) => ({ nom: c.nom, efficacite: efficaciteCanal(c) }))} margin={{ left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="nom" tick={{ fontSize: 10 }} interval={0} angle={-15} textAnchor="end" height={55} />
              <YAxis tick={{ fontSize: 11 }} unit="%" />
              <Tooltip contentStyle={{ fontSize: 12 }} formatter={(v: number) => `${v} %`} />
              <Bar dataKey="efficacite" name="Efficacité" fill="var(--info)" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Panel>

      <Panel title="Prévision d'atteinte des objectifs" subtitle="Couverture actuelle des besoins vs objectif de fin de période">
        <div className="flex h-64 flex-col justify-center gap-4 px-2">
          <div className="flex items-baseline justify-between">
            <span className="text-sm text-muted-foreground">Couverture moyenne actuelle des besoins</span>
            <span className="num text-2xl font-semibold">{couvertureMoyenne} %</span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-[var(--brand)]"
              style={{ width: `${Math.min(100, couvertureMoyenne)}%` }}
            />
            <div className="relative -mt-2.5 h-2.5 w-full">
              <div className="absolute top-0 h-2.5 w-px bg-foreground/60" style={{ left: `${objectifGlobal}%` }} />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Objectif de couverture fixé à {objectifGlobal} % en fin de période. Au rythme actuel des campagnes actives,{" "}
            {retards > 0 ? (
              <>
                <Tag ton="critical">{retards} besoin(s) en retard</Tag> nécessitent une action prioritaire pour tenir
                les échéances.
              </>
            ) : (
              "aucun besoin n'est en retard sur son échéance."
            )}
          </p>
        </div>
      </Panel>
    </div>
  );
}
