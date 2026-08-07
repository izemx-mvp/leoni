import { Area, AreaChart, CartesianGrid, PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Panel, Table, Td, Th, Tr, Tag, IAWarning } from "@/components/leoni/kit";
import { KpiExec, SectionExec, Heatmap } from "./kit";
import type { CtxPilotage } from "./contexte";
import {
  CATEGORIES_HEATMAP,
  CATEGORIES_SATISFACTION,
  HEATMAP_SATISFACTION,
  MENTION_CONFIDENTIALITE,
  SATISFACTION_30J,
  SATISFACTION_KPI,
  TOP_IRRITANTS,
  pondere,
} from "@/data/pilotage";

export function SatisfactionClimat({ ctx }: { ctx: CtxPilotage }) {
  const { fiches, objectifs } = ctx;
  const sites = fiches.map((f) => f.site as string);
  const globale = pondere(fiches, "satisfaction");
  const lignes = HEATMAP_SATISFACTION.filter((l) => sites.includes(l.site));

  return (
    <div className="space-y-8">
      <SectionExec titre="Satisfaction & climat social" sousTitre="Indicateurs agrégés — aucun commentaire individuel exposé">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
          <KpiExec label="Satisfaction globale" valeur={String(globale)} unite="/ 5" objectif={objectifs ? "4,0" : undefined} etat={globale >= 4 ? "Bon" : globale >= 3.5 ? "À surveiller" : "Critique"} serie={SATISFACTION_30J.map((s) => s.score)} />
          <KpiExec label="Mood moyen" valeur={String(SATISFACTION_KPI.mood)} unite="/ 5" etat="À surveiller" />
          <KpiExec label="Taux de participation" valeur={String(SATISFACTION_KPI.participation)} unite="%" objectif={objectifs ? "75 %" : undefined} etat="À surveiller" />
          <KpiExec label="Réponses négatives" valeur={String(SATISFACTION_KPI.moodNegatif)} unite="%" etat="À surveiller" />
          <KpiExec label="Commentaires collectés" valeur={SATISFACTION_KPI.commentaires.toLocaleString("fr-FR")} etat="Bon" detail="Contenus non exposés à ce niveau" />
          <KpiExec label="Alertes déclenchées" valeur={String(SATISFACTION_KPI.alertes)} etat="Critique" onDrill={() => ctx.aller("Risques & alertes")} />
        </div>
      </SectionExec>

      <div className="grid gap-4 xl:grid-cols-2">
        <Panel title="Évolution de la satisfaction" subtitle="30 derniers jours">
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={SATISFACTION_30J} margin={{ left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="jour" tick={{ fontSize: 10 }} interval={2} />
                <YAxis tick={{ fontSize: 11 }} domain={[3, 4.5]} />
                <Tooltip contentStyle={{ fontSize: 12 }} />
                <Area type="monotone" dataKey="score" name="Satisfaction" stroke="var(--brand)" fill="var(--brand)" fillOpacity={0.22} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Satisfaction par catégorie" subtitle="Formation, transport, terrain, sécurité, organisation">
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={CATEGORIES_SATISFACTION} outerRadius={90}>
                <PolarGrid stroke="var(--border)" />
                <PolarAngleAxis dataKey="categorie" tick={{ fontSize: 11 }} />
                <PolarRadiusAxis domain={[0, 5]} tick={{ fontSize: 9 }} />
                <Radar name="Score" dataKey="score" stroke="var(--brand)" fill="var(--brand)" fillOpacity={0.3} />
                <Tooltip contentStyle={{ fontSize: 12 }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>

      <SectionExec titre="Heatmap satisfaction" sousTitre="Site × catégorie — repérage immédiat des zones critiques">
        <Panel>
          <Heatmap
            lignes={lignes}
            colonnes={CATEGORIES_HEATMAP}
            seuils={{ bon: 3.9, moyen: 3.3 }}
            format={(v) => v.toFixed(1)}
            onCellule={(site, colonne, v) =>
              ctx.analyser(`${colonne} — ${site}`, [
                `Score moyen : ${v.toFixed(1)} / 5.`,
                v < 3.3 ? "Zone critique : forte probabilité de lien avec les départs précoces." : v < 3.9 ? "Zone à surveiller : dégradation possible à court terme." : "Zone saine.",
                "Les verbatims individuels restent confidentiels.",
              ], colonne === "Transport" ? "Réclamations & irritants" : undefined)
            }
          />
        </Panel>
      </SectionExec>

      <SectionExec titre="Top irritants" sousTitre="Signalements, variation et impact estimé sur le turnover">
        <Panel>
          <Table>
            <thead>
              <tr>
                <Th>Irritant</Th>
                <Th>Signalements</Th>
                <Th>Variation</Th>
                <Th>Site le plus impacté</Th>
                <Th>Impact turnover</Th>
              </tr>
            </thead>
            <tbody>
              {TOP_IRRITANTS.map((i) => (
                <Tr key={i.irritant} onClick={() => ctx.analyser(`Irritant ${i.irritant}`, [
                  `${i.signalements} signalements sur la période (${i.variation > 0 ? "+" : ""}${i.variation} %).`,
                  `Site le plus impacté : ${i.site}.`,
                  `Impact estimé sur le turnover : ${i.impactTurnover}.`,
                ], "Réclamations & irritants")}>
                  <Td className="font-medium">{i.irritant}</Td>
                  <Td className="num">{i.signalements}</Td>
                  <Td className={i.variation > 0 ? "num text-[var(--critical)]" : "num text-[var(--success)]"}>
                    {i.variation > 0 ? "▲ +" : "▼ "}
                    {Math.abs(i.variation)} %
                  </Td>
                  <Td>{i.site}</Td>
                  <Td>
                    <Tag ton={i.impactTurnover === "Élevé" ? "critical" : i.impactTurnover === "Modéré" ? "warning" : "neutral"}>{i.impactTurnover}</Tag>
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
          <IAWarning texte={MENTION_CONFIDENTIALITE} />
        </Panel>
      </SectionExec>
    </div>
  );
}
