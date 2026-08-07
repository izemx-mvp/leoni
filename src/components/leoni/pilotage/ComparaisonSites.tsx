import { useState } from "react";
import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer, Tooltip } from "recharts";
import { Panel, Table, Td, Th, Tr, Select, Tag } from "@/components/leoni/kit";
import { SectionExec, EtatTag, Heatmap } from "./kit";
import type { CtxPilotage } from "./contexte";
import type { FicheSite } from "@/data/pilotage";

const INDICATEURS: { cle: keyof FicheSite; label: string; unite: string; inverse?: boolean; objectif: number }[] = [
  { cle: "turnoverMensuel", label: "Turnover mensuel", unite: "%", inverse: true, objectif: 4 },
  { cle: "retention90", label: "Rétention 90 j", unite: "%", objectif: 90 },
  { cle: "couvertureRecrutement", label: "Couverture recrutement", unite: "%", objectif: 85 },
  { cle: "delaiRecrutement", label: "Délai recrutement", unite: "j", inverse: true, objectif: 25 },
  { cle: "reussiteFormation", label: "Réussite formation", unite: "%", objectif: 85 },
  { cle: "conformitePostesCritiques", label: "Conformité postes critiques", unite: "%", objectif: 95 },
  { cle: "satisfaction", label: "Satisfaction", unite: "/5", objectif: 4 },
  { cle: "absenteisme", label: "Absentéisme", unite: "%", inverse: true, objectif: 5 },
  { cle: "departs30", label: "Départs < 30 j", unite: "", inverse: true, objectif: 6 },
  { cle: "reclamationsPour1000", label: "Réclamations / 1 000", unite: "", inverse: true, objectif: 9 },
];

function score(f: FicheSite): number {
  const s = INDICATEURS.reduce((acc, i) => {
    const v = f[i.cle] as number;
    const r = i.inverse ? i.objectif / Math.max(v, 0.1) : v / i.objectif;
    return acc + Math.min(1.15, r);
  }, 0);
  return Math.round((s / INDICATEURS.length) * 100);
}

export function ComparaisonSites({ ctx }: { ctx: CtxPilotage }) {
  const { fiches } = ctx;
  const [indicateur, setIndicateur] = useState(INDICATEURS[0].label);
  const def = INDICATEURS.find((i) => i.label === indicateur)!;
  const classement = [...fiches].map((f) => ({ fiche: f, score: score(f) })).sort((a, b) => b.score - a.score);
  const meilleur = classement[0];
  const pire = classement[classement.length - 1];

  const lignes = fiches.map((f) => ({
    site: f.site,
    valeurs: Object.fromEntries(INDICATEURS.map((i) => [i.label, f[i.cle] as number])),
  }));
  const radar = INDICATEURS.slice(0, 6).map((i) => {
    const point: Record<string, number | string> = { indicateur: i.label };
    fiches.forEach((f) => {
      const v = f[i.cle] as number;
      point[f.site] = Math.round(Math.min(115, (i.inverse ? i.objectif / Math.max(v, 0.1) : v / i.objectif) * 100));
    });
    return point;
  });
  const couleurs = ["var(--brand)", "var(--critical)", "var(--info)", "var(--warning)", "var(--success)"];

  return (
    <div className="space-y-8">
      <SectionExec titre="Classement des sites" sousTitre="Score global composite pondéré sur 10 indicateurs de pilotage">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <Panel>
            <p className="label-xs">Site le plus performant</p>
            <p className="mt-1 text-lg font-semibold">{meilleur.fiche.site}</p>
            <p className="num mt-1 text-3xl font-semibold text-[var(--success)]">{meilleur.score}</p>
          </Panel>
          <Panel>
            <p className="label-xs">Site le plus en difficulté</p>
            <p className="mt-1 text-lg font-semibold">{pire.fiche.site}</p>
            <p className="num mt-1 text-3xl font-semibold text-[var(--critical)]">{pire.score}</p>
          </Panel>
          <Panel>
            <p className="label-xs">Écart entre sites</p>
            <p className="mt-1 text-lg font-semibold">Dispersion</p>
            <p className="num mt-1 text-3xl font-semibold">{meilleur.score - pire.score} pts</p>
          </Panel>
        </div>
      </SectionExec>

      <Panel title="Classement détaillé" subtitle="Rang, score et indicateurs clés">
        <Table>
          <thead>
            <tr>
              <Th>Rang</Th>
              <Th>Site</Th>
              <Th>Score</Th>
              <Th>Effectif</Th>
              <Th>Turnover</Th>
              <Th>Rétention 90 j</Th>
              <Th>Couverture</Th>
              <Th>Conformité</Th>
              <Th>Satisfaction</Th>
              <Th>État</Th>
            </tr>
          </thead>
          <tbody>
            {classement.map((c, i) => (
              <Tr key={c.fiche.site} onClick={() => ctx.analyser(c.fiche.site, [
                `Score global : ${c.score} / 100 (rang ${i + 1} sur ${classement.length}).`,
                `Turnover mensuel ${c.fiche.turnoverMensuel} % — rétention 90 jours ${c.fiche.retention90} %.`,
                `Couverture recrutement ${c.fiche.couvertureRecrutement} % en ${c.fiche.delaiRecrutement} jours.`,
                `Conformité postes critiques ${c.fiche.conformitePostesCritiques} %.`,
                `Satisfaction ${c.fiche.satisfaction} / 5 — absentéisme ${c.fiche.absenteisme} %.`,
              ])}>
                <Td className="num text-muted-foreground">{i + 1}</Td>
                <Td className="font-medium">{c.fiche.site}</Td>
                <Td className="num font-semibold">{c.score}</Td>
                <Td className="num">{c.fiche.effectif.toLocaleString("fr-FR")}</Td>
                <Td className={c.fiche.turnoverMensuel > 4 ? "num text-[var(--critical)]" : "num"}>{c.fiche.turnoverMensuel} %</Td>
                <Td className="num">{c.fiche.retention90} %</Td>
                <Td className="num">{c.fiche.couvertureRecrutement} %</Td>
                <Td className="num">{c.fiche.conformitePostesCritiques} %</Td>
                <Td className="num">{c.fiche.satisfaction} / 5</Td>
                <Td>
                  <EtatTag etat={c.score >= 92 ? "Bon" : c.score >= 82 ? "À surveiller" : "Critique"} />
                </Td>
              </Tr>
            ))}
          </tbody>
        </Table>
      </Panel>

      <div className="grid gap-4 xl:grid-cols-2">
        <Panel
          title="Heatmap multi-indicateurs"
          subtitle="Comparaison directe site par site"
          action={<Select value={indicateur} onChange={setIndicateur} options={INDICATEURS.map((i) => i.label)} className="h-8 text-xs" />}
        >
          <Heatmap
            lignes={lignes}
            colonnes={[def.label]}
            seuils={def.inverse ? { bon: -Infinity, moyen: -Infinity } : { bon: def.objectif, moyen: def.objectif * 0.85 }}
            format={(v) => `${v}${def.unite}`}
            onCellule={(site, colonne, v) => ctx.analyser(`${colonne} — ${site}`, [`Valeur : ${v}${def.unite} — objectif ${def.objectif}${def.unite}.`])}
          />
          <div className="mt-4">
            <Heatmap
              lignes={lignes}
              colonnes={INDICATEURS.filter((i) => !i.inverse).map((i) => i.label)}
              seuils={{ bon: 88, moyen: 78 }}
              format={(v) => String(v)}
            />
          </div>
        </Panel>

        <Panel title="Profil comparé des sites" subtitle="Performance relative à l'objectif (100 = objectif atteint)">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radar} outerRadius={110}>
                <PolarGrid stroke="var(--border)" />
                <PolarAngleAxis dataKey="indicateur" tick={{ fontSize: 9 }} />
                <PolarRadiusAxis domain={[0, 120]} tick={{ fontSize: 9 }} />
                {fiches.map((f, i) => (
                  <Radar key={f.site} name={f.site} dataKey={f.site} stroke={couleurs[i % couleurs.length]} fill={couleurs[i % couleurs.length]} fillOpacity={0.12} />
                ))}
                <Tooltip contentStyle={{ fontSize: 12 }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {fiches.map((f, i) => (
              <span key={f.site} className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <span className="h-2 w-2 rounded-full" style={{ background: couleurs[i % couleurs.length] }} />
                {f.site}
              </span>
            ))}
          </div>
        </Panel>
      </div>

      <SectionExec titre="Meilleures pratiques identifiées" sousTitre="Sites de référence par indicateur — base de partage inter-sites">
        <Panel>
          <div className="flex flex-wrap gap-2">
            {INDICATEURS.map((i) => {
              const best = [...fiches].sort((a, b) => (i.inverse ? (a[i.cle] as number) - (b[i.cle] as number) : (b[i.cle] as number) - (a[i.cle] as number)))[0];
              return (
                <Tag key={i.label} ton="success">
                  {i.label} : {best.site} ({String(best[i.cle])}
                  {i.unite})
                </Tag>
              );
            })}
          </div>
        </Panel>
      </SectionExec>
    </div>
  );
}
