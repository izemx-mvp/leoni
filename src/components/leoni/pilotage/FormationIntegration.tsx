import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Panel, Table, Td, Th, Tr, IAWarning } from "@/components/leoni/kit";
import { KpiExec, SectionExec, EtatTag, BarresComparees } from "./kit";
import type { CtxPilotage } from "./contexte";
import {
  DEPARTS_FORMATION,
  EVOLUTION_RESULTATS,
  EXCEPTIONS_FORMATEURS,
  FORMATION_KPI,
  MENTION_FORMATEURS,
  MODULES_DIFFICILES,
  PARCOURS_RISQUE,
  pondere,
} from "@/data/pilotage";

export function FormationIntegration({ ctx }: { ctx: CtxPilotage }) {
  const { fiches, objectifs } = ctx;
  const reussite = pondere(fiches, "reussiteFormation", 0);
  const part = fiches.length / 5;

  return (
    <div className="space-y-8">
      <SectionExec titre="Formation & intégration" sousTitre="Performance pédagogique consolidée">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5">
          <KpiExec label="Ouvriers en formation" valeur={String(Math.round(FORMATION_KPI.enFormation * part))} etat="Bon" />
          <KpiExec label="Taux de complétion" valeur={String(FORMATION_KPI.completion)} unite="%" objectif={objectifs ? "90 %" : undefined} etat="Bon" />
          <KpiExec label="Taux de réussite" valeur={String(reussite)} unite="%" objectif={objectifs ? "85 %" : undefined} etat={reussite >= 85 ? "Bon" : "À surveiller"} serie={EVOLUTION_RESULTATS.map((e) => e.reussite)} />
          <KpiExec label="Taux d'échec" valeur={String(100 - reussite)} unite="%" objectif={objectifs ? "< 15 %" : undefined} etat={100 - reussite > 15 ? "À surveiller" : "Bon"} />
          <KpiExec label="Prolongations" valeur={String(Math.round(FORMATION_KPI.prolongations * part))} etat="À surveiller" />
          <KpiExec label="Parcours arrêtés" valeur={String(Math.round(FORMATION_KPI.parcoursArretes * part))} etat="À surveiller" onDrill={() => ctx.aller("Rétention & turnover")} />
          <KpiExec label="Rattrapages" valeur={String(Math.round(FORMATION_KPI.rattrapages * part))} etat="À surveiller" />
          <KpiExec label="Présence formation" valeur={String(FORMATION_KPI.presence)} unite="%" objectif={objectifs ? "95 %" : undefined} etat="Bon" />
          <KpiExec label="Satisfaction formation" valeur={String(FORMATION_KPI.satisfaction)} unite="/ 5" etat="Bon" />
        </div>
      </SectionExec>

      <div className="grid gap-4 xl:grid-cols-2">
        <Panel title="Taux de réussite par site" subtitle="Comparaison inter-sites">
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={fiches.map((f) => ({ site: f.site, reussite: f.reussiteFormation }))} margin={{ left: -12 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="site" tick={{ fontSize: 10 }} interval={0} angle={-12} textAnchor="end" height={50} />
                <YAxis tick={{ fontSize: 11 }} unit="%" domain={[60, 100]} />
                <Tooltip contentStyle={{ fontSize: 12 }} />
                <Bar dataKey="reussite" name="Réussite %" fill="var(--brand)" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Évolution des résultats" subtitle="Réussite et échec sur 12 mois">
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={EVOLUTION_RESULTATS} margin={{ left: -18 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="mois" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} unit="%" />
                <Tooltip contentStyle={{ fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="reussite" name="Réussite" stroke="var(--success)" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="echec" name="Échec" stroke="var(--critical)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Modules les plus difficiles" subtitle="Taux d'échec par module">
          <BarresComparees donnees={MODULES_DIFFICILES.map((m) => ({ label: m.module, valeur: m.echec }))} objectif={15} inverse />
        </Panel>

        <Panel title="Départs pendant la formation" subtitle="Volume mensuel">
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={DEPARTS_FORMATION} margin={{ left: -18 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="mois" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ fontSize: 12 }} />
                <Bar dataKey="departs" name="Départs" fill="var(--warning)" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>

      <SectionExec titre="Top 5 parcours à risque" sousTitre="Réussite, départs et satisfaction associés">
        <Panel>
          <Table>
            <thead>
              <tr>
                <Th>Formation</Th>
                <Th>Participants</Th>
                <Th>Réussite</Th>
                <Th>Départs</Th>
                <Th>Satisfaction</Th>
                <Th>Risque</Th>
              </tr>
            </thead>
            <tbody>
              {PARCOURS_RISQUE.map((p) => (
                <Tr key={p.parcours} onClick={() => ctx.analyser(p.parcours, [
                  `${p.participants} participants — ${p.reussite} % de réussite.`,
                  `${p.departs} départs constatés pendant ou juste après le parcours.`,
                  `Satisfaction moyenne : ${p.satisfaction} / 5.`,
                  "Analyse recommandée : contenu du module, rythme, encadrement et conditions d'accueil terrain.",
                ])}>
                  <Td className="font-medium">{p.parcours}</Td>
                  <Td className="num">{p.participants}</Td>
                  <Td className="num">{p.reussite} %</Td>
                  <Td className="num">{p.departs}</Td>
                  <Td className="num">{p.satisfaction} / 5</Td>
                  <Td>
                    <EtatTag etat={p.risque} />
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        </Panel>
      </SectionExec>

      <SectionExec titre="Signaux formation — niveau manager" sousTitre="Indicateurs agrégés par périmètre, sans analyse individuelle par défaut">
        <Panel>
          <Table>
            <thead>
              <tr>
                <Th>Périmètre</Th>
                <Th>Réponses</Th>
                <Th>Satisfaction</Th>
                <Th>Signalements</Th>
                <Th>Tendance</Th>
                <Th>À analyser</Th>
              </tr>
            </thead>
            <tbody>
              {EXCEPTIONS_FORMATEURS.map((f) => (
                <Tr key={f.perimetre}>
                  <Td className="font-medium">{f.perimetre}</Td>
                  <Td className="num">{f.reponses}</Td>
                  <Td className="num">{f.satisfaction} / 5</Td>
                  <Td className="num">{f.signalements}</Td>
                  <Td className={f.tendance === "baisse" ? "text-[var(--critical)]" : "text-[var(--success)]"}>
                    {f.tendance === "baisse" ? "▼ en baisse" : "▲ en hausse"}
                  </Td>
                  <Td>
                    <EtatTag etat={f.satisfaction < 3.5 ? "Critique" : f.satisfaction < 3.9 ? "À surveiller" : "Bon"} />
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
          <IAWarning texte={MENTION_FORMATEURS} />
        </Panel>
      </SectionExec>
    </div>
  );
}
