import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Barre, Btn, Kpi, Panel, Select, Table, Tag, Td, Th, Tr } from "@/components/leoni/kit";
import {
  COHORTES,
  CORRELATIONS,
  DEPARTS,
  FORMULES_KPI,
  FUNNEL_RETENTION,
  KPI_PEOPLE,
  KPI_SITES_PEOPLE,
  MOTIFS_DEPART_STATS,
  RISQUES_DEPART,
  TURNOVER_MENSUEL,
  tonRisque,
} from "@/data/retention";
import {
  evolutionJournaliere,
  mood,
  moyenne,
  parCategorie,
  parFormateur,
  parSite,
  repartition,
  themesCommentaires,
} from "@/data/satisfaction";
import { useLeoni } from "@/lib/leoni-store";

const tooltipStyle = {
  backgroundColor: "var(--popover)",
  border: "1px solid var(--border)",
  borderRadius: 6,
  fontSize: 12,
  color: "var(--popover-foreground)",
};

/** Section « Satisfaction, départs & rétention » du reporting. */
export function SatisfactionRetention({ onExport }: { onExport: (nom: string) => void }) {
  const { moods, configSatisfaction, alertesSatisfaction, actionsSatisfaction, creerActionSatisfaction } = useLeoni();
  const [siteFiltre, setSiteFiltre] = useState("Tous les sites");
  const [vue, setVue] = useState<"Tous" | "Nominatif" | "Anonyme">("Tous");

  const liste = useMemo(
    () =>
      moods.filter(
        (m) =>
          (siteFiltre === "Tous les sites" || m.site === siteFiltre) &&
          (vue === "Tous" || (vue === "Anonyme" ? m.anonyme : !m.anonyme)),
      ),
    [moods, siteFiltre, vue],
  );

  const negatifs = liste.filter((m) => m.score <= 2).length;
  const seuilAtteint = liste.length >= configSatisfaction.seuilConfidentialite;

  return (
    <>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <Select
          value={siteFiltre}
          onChange={setSiteFiltre}
          options={["Tous les sites", ...KPI_SITES_PEOPLE.map((s) => s.site)]}
        />
        <Select value={vue} onChange={(v) => setVue(v as typeof vue)} options={["Tous", "Nominatif", "Anonyme"]} />
        <span className="text-xs text-muted-foreground">
          {liste.length} réponse(s) — anonymat « {configSatisfaction.anonymat} », seuil de confidentialité{" "}
          {configSatisfaction.seuilConfidentialite}
        </span>
        <Btn size="sm" variant="secondary" className="ml-auto" onClick={() => onExport("Satisfaction & rétention")}>
          Export Excel
        </Btn>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
        <Kpi label="Satisfaction moyenne" valeur={`${moyenne(liste)} / 5`} ton={moyenne(liste) >= 3.5 ? "success" : "warning"} />
        <Kpi label="Réponses négatives" valeur={negatifs} ton="critical" />
        <Kpi label="Turnover mensuel" valeur={`${String(KPI_PEOPLE.turnoverMensuel).replace(".", ",")} %`} ton="warning" />
        <Kpi label="Turnover 12 mois" valeur={`${String(KPI_PEOPLE.turnover12Mois).replace(".", ",")} %`} />
        <Kpi label="Rétention 30 j" valeur={`${KPI_PEOPLE.retention30} %`} ton="success" />
        <Kpi label="Ouvriers à risque" valeur={KPI_PEOPLE.risqueDepart} ton="critical" />
      </div>

      {!seuilAtteint && (
        <p className="mt-3 rounded-sm border border-[var(--warning)]/40 bg-[var(--warning)]/10 p-2.5 text-xs text-[var(--warning)]">
          Volume de réponses insuffisant pour afficher un détail sur ce périmètre (seuil de confidentialité :{" "}
          {configSatisfaction.seuilConfidentialite} réponses).
        </p>
      )}

      <div className="mt-4 grid gap-3 xl:grid-cols-3">
        <Panel title="Évolution de la satisfaction" subtitle="Moyenne quotidienne et volume de réponses" className="xl:col-span-2">
          <ResponsiveContainer width="100%" height={260}>
            <ComposedChart data={evolutionJournaliere(liste)}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="date" stroke="var(--muted-foreground)" fontSize={11} />
              <YAxis yAxisId="l" domain={[1, 5]} stroke="var(--muted-foreground)" fontSize={11} />
              <YAxis yAxisId="r" orientation="right" stroke="var(--muted-foreground)" fontSize={11} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar yAxisId="r" dataKey="reponses" name="Réponses" fill="var(--brand)" opacity={0.25} radius={[3, 3, 0, 0]} />
              <Line yAxisId="l" type="monotone" dataKey="moyenne" name="Satisfaction / 5" stroke="var(--brand)" strokeWidth={2} />
            </ComposedChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title="Répartition des réponses" subtitle="Échelle émoticônes 1 à 5">
          <div className="space-y-2.5">
            {repartition(liste).map((r) => (
              <div key={r.score} className="flex items-center gap-2">
                <span className="w-6 text-lg leading-none">{r.emoji}</span>
                <span className="w-24 shrink-0 text-xs text-muted-foreground">{r.libelle}</span>
                <div className="flex-1">
                  <Barre valeur={r.part} ton={r.score >= 4 ? "success" : r.score === 3 ? "warning" : "critical"} />
                </div>
                <span className="num w-14 text-right text-xs">{r.nombre} · {r.part} %</span>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <div className="mt-3 grid gap-3 xl:grid-cols-3">
        <Panel title="Satisfaction par site" bodyClassName="p-0">
          <Table>
            <thead>
              <tr>
                <Th>Site</Th><Th>Réponses</Th><Th>Moyenne</Th><Th>Négatifs</Th>
              </tr>
            </thead>
            <tbody>
              {parSite(liste).map((s) => (
                <Tr key={s.cle}>
                  <Td className="font-medium">{s.cle}</Td>
                  <Td className="num">{s.reponses}</Td>
                  <Td className="num">{s.moyenne}</Td>
                  <Td><Tag ton={s.partNegatifs > 25 ? "critical" : s.partNegatifs > 15 ? "warning" : "success"}>{s.partNegatifs} %</Tag></Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        </Panel>

        <Panel title="Satisfaction par catégorie" bodyClassName="p-0">
          <Table>
            <thead>
              <tr>
                <Th>Catégorie</Th><Th>Réponses</Th><Th>Moyenne</Th><Th>Négatifs</Th>
              </tr>
            </thead>
            <tbody>
              {parCategorie(liste).slice(0, 8).map((c) => (
                <Tr key={c.cle}>
                  <Td className="font-medium">{c.cle}</Td>
                  <Td className="num">{c.reponses}</Td>
                  <Td className="num">{c.moyenne}</Td>
                  <Td><Tag ton={c.partNegatifs > 25 ? "critical" : c.partNegatifs > 15 ? "warning" : "success"}>{c.partNegatifs} %</Tag></Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        </Panel>

        <Panel title="Satisfaction par formateur" bodyClassName="p-0">
          <Table>
            <thead>
              <tr>
                <Th>Formateur</Th><Th>Réponses</Th><Th>Moyenne</Th><Th>Positifs</Th>
              </tr>
            </thead>
            <tbody>
              {parFormateur(liste).map((f) => (
                <Tr key={f.cle}>
                  <Td className="font-medium">{f.cle}</Td>
                  <Td className="num">{f.reponses}</Td>
                  <Td className="num">{f.moyenne}</Td>
                  <Td className="num">{f.positifs}</Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        </Panel>
      </div>

      <div className="mt-3 grid gap-3 xl:grid-cols-2">
        <Panel title="Thèmes détectés dans les commentaires" subtitle="Analyse automatique des retours libres" bodyClassName="p-0">
          <Table>
            <thead>
              <tr>
                <Th>Thème</Th><Th>Occurrences</Th><Th>Satisfaction associée</Th>
              </tr>
            </thead>
            <tbody>
              {themesCommentaires(liste).map((t) => (
                <Tr key={t.theme}>
                  <Td className="font-medium">{t.theme}</Td>
                  <Td className="num">{t.occurrences}</Td>
                  <Td className="num">{t.moyenne} / 5</Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        </Panel>

        <Panel title="Alertes satisfaction" subtitle="Signaux collectifs et nominatifs" bodyClassName="p-0">
          <Table>
            <thead>
              <tr>
                <Th>Alerte</Th><Th>Type</Th><Th>Signal</Th><Th>Gravité</Th><Th>Action</Th>
              </tr>
            </thead>
            <tbody>
              {alertesSatisfaction.map((a) => (
                <Tr key={a.id}>
                  <Td className="font-medium">{a.sujet}{a.ouvrier ? ` · ${a.ouvrier}` : ""}</Td>
                  <Td className="text-muted-foreground">{a.type}</Td>
                  <Td className="max-w-64 text-xs text-muted-foreground">{a.signal}</Td>
                  <Td><Tag ton={a.gravite === "Critique" ? "critical" : a.gravite === "Élevée" ? "warning" : "neutral"}>{a.gravite}</Tag></Td>
                  <Td>
                    <Btn
                      size="sm"
                      onClick={() =>
                        creerActionSatisfaction({
                          sujet: `${a.sujet} — ${a.site}`,
                          action: a.action,
                          responsable: "Amina Rajouh",
                          echeance: "15/08/2026",
                          statut: "Planifiée",
                          origine: a.id,
                        })
                      }
                    >
                      Créer l'action
                    </Btn>
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        </Panel>
      </div>

      <Panel title="Actions correctives issues de la satisfaction" className="mt-3" bodyClassName="p-0">
        <Table>
          <thead>
            <tr>
              <Th>Référence</Th><Th>Sujet</Th><Th>Action</Th><Th>Responsable</Th><Th>Échéance</Th><Th>Statut</Th><Th>Origine</Th>
            </tr>
          </thead>
          <tbody>
            {actionsSatisfaction.map((a) => (
              <Tr key={a.id}>
                <Td className="num text-xs text-[var(--brand)]">{a.id}</Td>
                <Td className="font-medium">{a.sujet}</Td>
                <Td className="text-muted-foreground">{a.action}</Td>
                <Td className="text-muted-foreground">{a.responsable}</Td>
                <Td className="num">{a.echeance}</Td>
                <Td><Tag ton={a.statut === "Terminée" ? "success" : a.statut === "En cours" ? "info" : "neutral"}>{a.statut}</Tag></Td>
                <Td className="num text-xs text-muted-foreground">{a.origine}</Td>
              </Tr>
            ))}
          </tbody>
        </Table>
      </Panel>

      <div className="mt-4 grid gap-3 xl:grid-cols-3">
        <Panel title="Turnover mensuel" subtitle="Départs, intégrations et taux de turnover" className="xl:col-span-2">
          <ResponsiveContainer width="100%" height={260}>
            <ComposedChart data={TURNOVER_MENSUEL}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="mois" stroke="var(--muted-foreground)" fontSize={11} />
              <YAxis yAxisId="l" stroke="var(--muted-foreground)" fontSize={11} />
              <YAxis yAxisId="r" orientation="right" stroke="var(--muted-foreground)" fontSize={11} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar yAxisId="l" dataKey="integres" name="Intégrations" fill="var(--success)" radius={[3, 3, 0, 0]} />
              <Bar yAxisId="l" dataKey="departs" name="Départs" fill="var(--critical)" radius={[3, 3, 0, 0]} />
              <Line yAxisId="r" type="monotone" dataKey="turnover" name="Turnover %" stroke="var(--brand)" strokeWidth={2} />
            </ComposedChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title="Entonnoir de rétention" subtitle="Du candidat retenu à 90 jours d'ancienneté">
          <div className="space-y-2.5">
            {FUNNEL_RETENTION.map((e) => (
              <div key={e.etape}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span>{e.etape}</span>
                  <span className="num font-medium">{e.valeur} %</span>
                </div>
                <Barre valeur={e.valeur} ton={e.valeur >= 80 ? "success" : e.valeur >= 70 ? "warning" : "critical"} />
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <div className="mt-3 grid gap-3 xl:grid-cols-2">
        <Panel title="Motifs de départ" subtitle="Répartition des départs de la période">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={MOTIFS_DEPART_STATS} layout="vertical" margin={{ left: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
              <XAxis type="number" stroke="var(--muted-foreground)" fontSize={11} />
              <YAxis type="category" dataKey="motif" stroke="var(--muted-foreground)" fontSize={10} width={140} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="nombre" name="Départs" fill="var(--critical)" radius={[0, 3, 3, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title="Comparaison des sites" subtitle="Turnover, satisfaction et signalements" bodyClassName="p-0">
          <Table>
            <thead>
              <tr>
                <Th>Site</Th><Th>Effectif</Th><Th>Départs</Th><Th>Turnover</Th><Th>Satisfaction</Th><Th>Transport</Th><Th>Terrain</Th><Th>Risque</Th>
              </tr>
            </thead>
            <tbody>
              {KPI_SITES_PEOPLE.map((s) => (
                <Tr key={s.site}>
                  <Td className="font-medium">{s.site}</Td>
                  <Td className="num">{s.effectif.toLocaleString("fr-FR")}</Td>
                  <Td className="num">{s.departs}</Td>
                  <Td className="num">{String(s.turnover).replace(".", ",")} %</Td>
                  <Td className="num">{String(s.satisfaction).replace(".", ",")}</Td>
                  <Td className="num">{s.transport}</Td>
                  <Td className="num">{s.terrain}</Td>
                  <Td><Tag ton={tonRisque(s.risque)}>{s.risque}</Tag></Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        </Panel>
      </div>

      <div className="mt-3 grid gap-3 xl:grid-cols-2">
        <Panel title="Départs récents" subtitle="Type, motif et ancienneté" bodyClassName="p-0">
          <Table>
            <thead>
              <tr>
                <Th>Référence</Th><Th>Ouvrier</Th><Th>Site</Th><Th>Poste</Th><Th>Ancienneté</Th><Th>Type</Th><Th>Motif principal</Th><Th>Satisfaction</Th><Th>Entretien</Th>
              </tr>
            </thead>
            <tbody>
              {DEPARTS.map((d) => (
                <Tr key={d.id}>
                  <Td className="num text-xs text-[var(--brand)]">{d.id}</Td>
                  <Td className="font-medium">{d.ouvrier}</Td>
                  <Td className="text-muted-foreground">{d.site}</Td>
                  <Td className="text-muted-foreground">
                    {d.poste} {d.posteCritique && <Tag ton="critical">Critique</Tag>}
                  </Td>
                  <Td className="num">{d.ancienneteJours} j</Td>
                  <Td className="text-xs">{d.type}</Td>
                  <Td className="text-xs text-muted-foreground">{d.motifPrincipal}</Td>
                  <Td className="num">{String(d.satisfaction).replace(".", ",")}</Td>
                  <Td><Tag ton={d.entretienDepart ? "success" : "warning"}>{d.entretienDepart ? "Réalisé" : "Non réalisé"}</Tag></Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        </Panel>

        <Panel title="Risque de départ précoce (IA)" subtitle="Score calculé sur la satisfaction, la présence et la formation" bodyClassName="p-0">
          <Table>
            <thead>
              <tr>
                <Th>Ouvrier</Th><Th>Site</Th><Th>Ancienneté</Th><Th>Score</Th><Th>Niveau</Th><Th>Facteurs</Th><Th>Action recommandée</Th>
              </tr>
            </thead>
            <tbody>
              {RISQUES_DEPART.map((r) => (
                <Tr key={r.ouvrierId}>
                  <Td className="font-medium">{r.ouvrier}</Td>
                  <Td className="text-muted-foreground">{r.site}</Td>
                  <Td className="num">{r.ancienneteJours} j</Td>
                  <Td className="num font-medium">{r.score}</Td>
                  <Td><Tag ton={tonRisque(r.niveau)}>{r.niveau}</Tag></Td>
                  <Td className="max-w-64 text-xs text-muted-foreground">{r.facteurs.join(" · ")}</Td>
                  <Td className="text-xs">{r.action}</Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        </Panel>
      </div>

      <div className="mt-3 grid gap-3 xl:grid-cols-3">
        <Panel title="Cohortes d'intégration" bodyClassName="p-0">
          <Table>
            <thead>
              <tr>
                <Th>Cohorte</Th><Th>Intégrés</Th><Th>Actifs J+30</Th><Th>Rétention</Th><Th>Réussite</Th>
              </tr>
            </thead>
            <tbody>
              {COHORTES.map((c) => (
                <Tr key={c.cohorte}>
                  <Td className="font-medium">{c.cohorte}</Td>
                  <Td className="num">{c.integres}</Td>
                  <Td className="num">{c.actifs30}</Td>
                  <Td className="num">{String(c.retention).replace(".", ",")} %</Td>
                  <Td className="num">{c.reussite} %</Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        </Panel>

        <Panel title="Satisfaction ↔ turnover" subtitle="Signaux associés, sans lien de causalité établi" bodyClassName="p-0">
          <Table>
            <thead>
              <tr>
                <Th>Site</Th><Th>Satisfaction transport</Th><Th>Départs transport</Th><Th>Turnover</Th><Th>Lecture</Th>
              </tr>
            </thead>
            <tbody>
              {CORRELATIONS.map((c) => (
                <Tr key={c.site}>
                  <Td className="font-medium">{c.site}</Td>
                  <Td className="num">{String(c.satisfactionTransport).replace(".", ",")}</Td>
                  <Td className="num">{c.departsTransport}</Td>
                  <Td className="num">{String(c.turnover).replace(".", ",")} %</Td>
                  <Td className="text-xs text-muted-foreground">{c.lecture}</Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        </Panel>

        <Panel title="Méthode de calcul" subtitle="Formules utilisées pour les indicateurs" bodyClassName="p-0">
          <Table>
            <thead>
              <tr>
                <Th>Indicateur</Th><Th>Formule</Th><Th>Calcul</Th>
              </tr>
            </thead>
            <tbody>
              {FORMULES_KPI.map((f) => (
                <Tr key={f.kpi}>
                  <Td className="font-medium">{f.kpi}</Td>
                  <Td className="text-xs text-muted-foreground">{f.formule}</Td>
                  <Td className="num text-xs">{f.detail}</Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        </Panel>
      </div>

      <p className="mt-3 text-[11px] text-muted-foreground">
        Les réponses anonymes ({moods.filter((m) => m.anonyme).length}) alimentent uniquement les statistiques
        collectives : aucune n'est rattachée à une fiche individuelle. Dernier retour reçu :{" "}
        {moods[0] ? `${mood(moods[0].score).emoji} ${moods[0].categorie} — ${moods[0].date}` : "—"}.
      </p>
    </>
  );
}
