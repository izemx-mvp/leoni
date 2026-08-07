import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Panel, Tag, Btn, Table, Td, Th, Tr, Barre } from "@/components/leoni/kit";
import { KpiExec, SectionExec, Sparkline, EtatTag } from "./kit";
import type { CtxPilotage } from "./contexte";
import {
  ALERTES_DIRECTION,
  COMPOSANTES_HEALTH,
  HEALTH_CRITIQUES,
  HEALTH_HISTORIQUE,
  HEALTH_POSITIFS,
  HEALTH_SCORE,
  MENTION_INDICE,
  PLANS_ACTION,
  RECLAMATIONS_KPI,
  SYNTHESE_MOIS,
  TOP_IRRITANTS,
  TOP_RISQUES,
  cumul,
  pondere,
  serieConsolidee,
  tonPlan,
  tonEtat,
  type Etat,
} from "@/data/pilotage";

const COURBES = [
  { cle: "turnover", label: "Turnover", couleur: "var(--critical)", source: "serieTurnover" as const },
  { cle: "retention", label: "Rétention J+90", couleur: "var(--success)", source: "serieRetention" as const },
  { cle: "satisfaction", label: "Satisfaction", couleur: "var(--info)", source: "serieSatisfaction" as const },
  { cle: "absenteisme", label: "Absentéisme", couleur: "var(--warning)", source: "serieAbsenteisme" as const },
];

export function VueExecutive({ ctx }: { ctx: CtxPilotage }) {
  const { fiches, mois, comparer, objectifs } = ctx;
  const [visibles, setVisibles] = useState<string[]>(["turnover", "retention", "satisfaction", "absenteisme"]);

  const effectif = cumul(fiches, "effectif");
  const besoins = cumul(fiches, "besoinsOuverts");
  const couverture = pondere(fiches, "couvertureRecrutement", 0);
  const nonCouverts = cumul(fiches, "postesCritiquesNonCouverts");
  const retention90 = pondere(fiches, "retention90", 0);
  const turnover12 = pondere(fiches, "turnover12");
  const departs30 = cumul(fiches, "departs30");
  const risque = cumul(fiches, "ouvriersRisque");
  const risqueEleve = cumul(fiches, "ouvriersRisqueEleve");
  const satisfaction = pondere(fiches, "satisfaction");
  const absenteisme = pondere(fiches, "absenteisme");
  const reclamations = cumul(fiches, "reclamationsCritiques");
  const sla = cumul(fiches, "slaDepasse");
  const reussite = pondere(fiches, "reussiteFormation", 0);
  const conformite = pondere(fiches, "conformitePostesCritiques", 0);

  const serie = (cle: "serieTurnover" | "serieRetention" | "serieSatisfaction" | "serieAbsenteisme" | "serieEffectif") =>
    serieConsolidee(fiches, cle, mois).map((p) => p.valeur);

  const tendances = useMemo(() => {
    const t = serieConsolidee(fiches, "serieTurnover", 12);
    const r = serieConsolidee(fiches, "serieRetention", 12);
    const s = serieConsolidee(fiches, "serieSatisfaction", 12);
    const a = serieConsolidee(fiches, "serieAbsenteisme", 12);
    return t.map((p, i) => ({
      mois: p.mois,
      turnover: p.valeur,
      retention: r[i].valeur,
      satisfaction: s[i].valeur,
      absenteisme: a[i].valeur,
    }));
  }, [fiches]);

  const cmp = (v: number, prev: number, unite: string, inverse = false) => {
    if (!comparer) return undefined;
    const d = Math.round((v - prev) * 10) / 10;
    const sens = d === 0 ? "neutre" : (d > 0) !== inverse ? "positif" : "negatif";
    return { texte: `${d > 0 ? "+" : ""}${d} ${unite} vs période précédente`, sens } as const;
  };

  const kpis: {
    label: string;
    valeur: string;
    unite?: string;
    delta?: string;
    sens?: "positif" | "negatif" | "neutre";
    objectif?: string;
    detail?: string;
    etat: Etat;
    serie?: number[];
    onglet: string;
  }[] = [
    { label: "Effectif actif", valeur: effectif.toLocaleString("fr-FR"), delta: "+2,8 % sur 12 mois", sens: "positif", etat: "Bon", serie: serie("serieEffectif"), onglet: "Workforce" },
    { label: "Besoins de recrutement ouverts", valeur: String(besoins), detail: `Taux de couverture : ${couverture} %`, etat: couverture >= 80 ? "Bon" : "À surveiller", objectif: objectifs ? "couverture 85 %" : undefined, onglet: "Recrutement" },
    { label: "Postes critiques non couverts", valeur: String(nonCouverts), detail: "Dont 4 en niveau critique", etat: "Critique", objectif: objectifs ? "0" : undefined, onglet: "Postes critiques" },
    { label: "Taux de rétention J+90", valeur: `${retention90}`, unite: "%", delta: `Écart objectif : ${retention90 - 90} pts`, sens: "negatif", objectif: objectifs ? "90 %" : undefined, etat: retention90 >= 90 ? "Bon" : "À surveiller", serie: serie("serieRetention"), onglet: "Rétention & turnover" },
    { label: "Turnover 12 mois", valeur: `${turnover12}`, unite: "%", delta: "↑ +2,1 pts", sens: "negatif", objectif: objectifs ? "< 15 %" : undefined, etat: turnover12 > 15 ? "Critique" : "Bon", serie: serie("serieTurnover"), onglet: "Rétention & turnover" },
    { label: "Départs < 30 jours", valeur: String(departs30), detail: "Early turnover 8,4 %", objectif: objectifs ? "< 5 %" : undefined, etat: "Critique", onglet: "Rétention & turnover" },
    { label: "Ouvriers à risque", valeur: String(risque), detail: `Risque élevé : ${risqueEleve}`, etat: "À surveiller", onglet: "Risques" },
    { label: "Satisfaction globale", valeur: `${satisfaction}`, unite: "/ 5", delta: "↓ -0,2 sur 3 mois", sens: "negatif", objectif: objectifs ? "4,0 / 5" : undefined, etat: satisfaction >= 4 ? "Bon" : "À surveiller", serie: serie("serieSatisfaction"), onglet: "Satisfaction & climat" },
    { label: "Absentéisme", valeur: `${absenteisme}`, unite: "%", objectif: objectifs ? "< 3,5 %" : undefined, etat: absenteisme > 3.5 ? "À surveiller" : "Bon", serie: serie("serieAbsenteisme"), onglet: "Workforce" },
    { label: "Réclamations critiques", valeur: String(reclamations), detail: `Dont SLA dépassé : ${sla}`, etat: reclamations > 5 ? "Critique" : "À surveiller", onglet: "Réclamations & irritants" },
    { label: "Formation — taux de réussite", valeur: `${reussite}`, unite: "%", objectif: objectifs ? "85 %" : undefined, etat: reussite >= 84 ? "Bon" : "À surveiller", onglet: "Formation & intégration" },
    { label: "Conformité postes critiques", valeur: `${conformite}`, unite: "%", objectif: objectifs ? "95 %" : undefined, etat: conformite >= 90 ? "Bon" : "À surveiller", onglet: "Postes critiques" },
  ];

  const risquesTop = TOP_RISQUES.slice(0, 5);
  const alertesTop = [...ALERTES_DIRECTION].sort((a, b) => b.score - a.score).slice(0, 5);
  const plans = PLANS_ACTION.filter((p) => p.statut !== "Terminé");

  return (
    <div className="space-y-8">
      {/* Synthèse */}
      <section className="rounded-lg border border-[color-mix(in_oklab,var(--brand)_35%,var(--border))] bg-[var(--brand-soft)] p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--brand)]">Synthèse du mois</h2>
          <Tag ton="brand">Générée automatiquement</Tag>
        </div>
        <p className="mt-3 max-w-4xl text-[15px] leading-relaxed text-foreground/90">{SYNTHESE_MOIS}</p>
        <Btn size="sm" className="mt-4" onClick={() => ctx.analyser("Analyse complète de la synthèse", [
          "Turnover 12 mois : 18,4 % (+2,1 pts). Contribution principale : Bouskoura (24,1 %) et Bouznika (17,9 %).",
          "Satisfaction transport : 2,9 / 5 en moyenne, 2,6 / 5 à Bouskoura, en baisse continue depuis 5 mois.",
          "Postes critiques : 81 % de conformité, 12 postes non couverts dont 4 en niveau critique.",
          "Formation : 84 % de réussite, stable, avec un point d'attention sur le module contrôle qualité (27 % d'échec).",
        ])}>
          Voir l'analyse complète
        </Btn>
      </section>

      {/* KPI stratégiques */}
      <SectionExec titre="KPI stratégiques" sousTitre="Douze indicateurs de pilotage — cliquez pour analyser">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          {kpis.map((k) => (
            <KpiExec
              key={k.label}
              label={k.label}
              valeur={k.valeur}
              unite={k.unite}
              delta={k.delta}
              deltaSens={k.sens}
              objectif={k.objectif}
              detail={k.detail}
              etat={k.etat}
              serie={k.serie}
              onDrill={() => ctx.aller(k.onglet)}
            />
          ))}
        </div>
      </SectionExec>

      {/* Health score */}
      <SectionExec titre="Executive health score" sousTitre="Indice global Workforce consolidé">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)]">
          <Panel>
            <div className="flex items-end gap-3">
              <span className="num text-[56px] font-semibold leading-none tracking-tight">{HEALTH_SCORE}</span>
              <span className="mb-2 text-sm text-muted-foreground">/ 100</span>
            </div>
            <div className="mt-3 flex items-center gap-3">
              <Tag ton="neutral">Tendance : stable</Tag>
              <Sparkline valeurs={HEALTH_HISTORIQUE} ton="brand" largeur={120} hauteur={28} />
            </div>
            <p className="mt-4 text-[11px] leading-relaxed text-muted-foreground">{MENTION_INDICE}</p>
          </Panel>
          <div className="grid gap-3 sm:grid-cols-2">
            <Panel title="Sous-composantes" bodyClassName="space-y-2.5">
              {COMPOSANTES_HEALTH.map((c) => (
                <button key={c.domaine} type="button" onClick={() => ctx.aller(c.onglet)} className="flex w-full items-center gap-3 text-left">
                  <span className="w-44 shrink-0 truncate text-xs">{c.domaine}</span>
                  <Barre valeur={c.valeur} ton={c.valeur >= 80 ? "success" : c.valeur >= 72 ? "warning" : "critical"} />
                  <span className="num w-8 shrink-0 text-right text-xs font-semibold">{c.valeur}</span>
                </button>
              ))}
            </Panel>
            <div className="grid gap-3">
              <Panel title="Points positifs">
                <ul className="space-y-1.5 text-xs text-foreground/85">
                  {HEALTH_POSITIFS.map((p) => (
                    <li key={p} className="flex gap-2">
                      <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-[var(--success)]" />
                      {p}
                    </li>
                  ))}
                </ul>
              </Panel>
              <Panel title="Points critiques">
                <ul className="space-y-1.5 text-xs text-foreground/85">
                  {HEALTH_CRITIQUES.map((p) => (
                    <li key={p} className="flex gap-2">
                      <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-[var(--critical)]" />
                      {p}
                    </li>
                  ))}
                </ul>
              </Panel>
            </div>
          </div>
        </div>
      </SectionExec>

      {/* Top risques */}
      <SectionExec titre="Top risques à surveiller" sousTitre="Classés par impact et urgence" action={<Btn size="sm" onClick={() => ctx.aller("Risques")}>Ouvrir le centre de risques</Btn>}>
        <div className="grid gap-3 lg:grid-cols-2 2xl:grid-cols-3">
          {risquesTop.map((r) => (
            <article key={r.id} className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span className="num text-lg font-semibold text-muted-foreground">{r.rang}</span>
                  <div>
                    <h3 className="text-sm font-semibold">{r.titre}</h3>
                    <p className="text-xs text-muted-foreground">{r.perimetre}</p>
                  </div>
                </div>
                <EtatTag etat={r.niveau} />
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="label-xs">Indicateur</p>
                  <p className="num mt-0.5 font-semibold">{r.indicateur}</p>
                </div>
                <div>
                  <p className="label-xs">Tendance</p>
                  <p className="mt-0.5">{r.variation}</p>
                </div>
                <div>
                  <p className="label-xs">Facteur principal</p>
                  <p className="mt-0.5">{r.facteur}</p>
                </div>
                <div>
                  <p className="label-xs">Responsable</p>
                  <p className="mt-0.5">{r.responsable}</p>
                </div>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">Impact : {r.impact}</p>
              <p className="mt-1 text-xs">Action recommandée : {r.action}</p>
              <div className="mt-3 flex gap-2">
                <Btn size="sm" onClick={() => ctx.aller(r.onglet)}>Analyser</Btn>
                <Btn size="sm" variant="ghost" onClick={() => ctx.creerPlan(r.titre, r.action)}>Plan d'action</Btn>
              </div>
            </article>
          ))}
        </div>
      </SectionExec>

      {/* Tendances */}
      <SectionExec
        titre="Tendances sur 12 mois"
        sousTitre="Turnover, rétention, satisfaction et absentéisme"
        action={
          <div className="flex flex-wrap gap-1.5">
            {COURBES.map((c) => {
              const on = visibles.includes(c.cle);
              return (
                <button
                  key={c.cle}
                  onClick={() => setVisibles((p) => (on ? p.filter((x) => x !== c.cle) : [...p, c.cle]))}
                  className="flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] transition-colors"
                  style={{ borderColor: on ? c.couleur : "var(--border)", color: on ? c.couleur : "var(--muted-foreground)" }}
                >
                  <span className="size-1.5 rounded-full" style={{ background: on ? c.couleur : "var(--neutral)" }} />
                  {c.label}
                </button>
              );
            })}
          </div>
        }
      >
        <Panel bodyClassName="pt-5">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={tendances} margin={{ left: -18, right: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="mois" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ fontSize: 12 }} />
                {COURBES.filter((c) => visibles.includes(c.cle)).map((c) => (
                  <Line key={c.cle} type="monotone" dataKey={c.cle} name={c.label} stroke={c.couleur} strokeWidth={2} dot={false} />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </SectionExec>

      {/* Comparaison sites + postes critiques */}
      <div className="grid gap-4 xl:grid-cols-2">
        <Panel title="Sites à surveiller" subtitle="Turnover, satisfaction et risque global" action={<Btn size="sm" variant="ghost" onClick={() => ctx.aller("Comparaison sites")}>Benchmark</Btn>}>
          <Table>
            <thead>
              <tr>
                <Th>Site</Th>
                <Th>Turnover</Th>
                <Th>Rétention 90 j</Th>
                <Th>Satisfaction</Th>
                <Th>Risque</Th>
              </tr>
            </thead>
            <tbody>
              {[...fiches]
                .sort((a, b) => b.turnoverMensuel - a.turnoverMensuel)
                .map((f) => (
                  <Tr key={f.site} onClick={() => ctx.aller("Comparaison sites")}>
                    <Td className="font-medium">{f.site}</Td>
                    <Td className="num">{f.turnoverMensuel} %</Td>
                    <Td className="num">{f.retention90} %</Td>
                    <Td className="num">{f.satisfaction} / 5</Td>
                    <Td>
                      <EtatTag etat={f.risqueGlobal} />
                    </Td>
                  </Tr>
                ))}
            </tbody>
          </Table>
        </Panel>

        <Panel title="Top irritants Workforce" subtitle="Volume de signalements sur 30 jours" action={<Btn size="sm" variant="ghost" onClick={() => ctx.aller("Satisfaction & climat")}>Détail</Btn>}>
          <Table>
            <thead>
              <tr>
                <Th>Irritant</Th>
                <Th>Signalements</Th>
                <Th>Variation</Th>
                <Th>Site principal</Th>
                <Th>Impact turnover</Th>
              </tr>
            </thead>
            <tbody>
              {TOP_IRRITANTS.map((i) => (
                <Tr key={i.irritant}>
                  <Td className="font-medium">{i.irritant}</Td>
                  <Td className="num">{i.signalements}</Td>
                  <Td className={i.variation > 0 ? "num text-[var(--critical)]" : "num text-[var(--success)]"}>
                    {i.variation > 0 ? "+" : ""}
                    {i.variation} %
                  </Td>
                  <Td>{i.site}</Td>
                  <Td>{i.impactTurnover}</Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        </Panel>
      </div>

      {/* Turnover / satisfaction visuels */}
      <div className="grid gap-4 xl:grid-cols-2">
        <Panel title="Turnover vs objectif" subtitle="Consolidé sur la période">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={tendances} margin={{ left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="mois" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} unit="%" />
                <Tooltip contentStyle={{ fontSize: 12 }} />
                <Area type="monotone" dataKey="turnover" name="Turnover" stroke="var(--critical)" fill="var(--critical)" fillOpacity={0.18} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>
        <Panel title="Satisfaction & réclamations" subtitle="Signal climat social">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-md border border-border p-3">
              <p className="label-xs">Satisfaction globale</p>
              <p className="num mt-1 text-2xl font-semibold">{satisfaction} / 5</p>
              <p className="mt-1 text-[11px] text-[var(--critical)]">↓ -0,2 sur 3 mois</p>
            </div>
            <div className="rounded-md border border-border p-3">
              <p className="label-xs">Réclamations ouvertes</p>
              <p className="num mt-1 text-2xl font-semibold">{RECLAMATIONS_KPI.ouvertes}</p>
              <p className="mt-1 text-[11px] text-muted-foreground">Dont {RECLAMATIONS_KPI.critiques} critiques</p>
            </div>
            <div className="rounded-md border border-border p-3">
              <p className="label-xs">Temps moyen de résolution</p>
              <p className="num mt-1 text-2xl font-semibold">{RECLAMATIONS_KPI.tempsResolution} j</p>
            </div>
            <div className="rounded-md border border-border p-3">
              <p className="label-xs">Satisfaction traitement</p>
              <p className="num mt-1 text-2xl font-semibold">{RECLAMATIONS_KPI.satisfactionTraitement} / 5</p>
            </div>
          </div>
        </Panel>
      </div>

      {/* Alertes */}
      <SectionExec titre="Alertes direction" sousTitre="Seuils de pilotage dépassés" action={<Btn size="sm" variant="ghost" onClick={() => ctx.aller("Risques")}>Toutes les alertes</Btn>}>
        <div className="grid gap-2">
          {alertesTop.map((a) => (
            <div key={a.id} className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-card px-4 py-3">
              <span
                className="num flex size-11 shrink-0 items-center justify-center rounded-md text-sm font-semibold"
                style={{
                  background: `color-mix(in oklab, var(--${a.score >= 80 ? "critical" : a.score >= 65 ? "warning" : "info"}) 14%, transparent)`,
                  color: `var(--${a.score >= 80 ? "critical" : a.score >= 65 ? "warning" : "info"})`,
                }}
              >
                {a.score}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{a.titre}</p>
                <p className="text-xs text-muted-foreground">
                  {a.perimetre} — {a.valeur}
                </p>
              </div>
              <Tag ton={tonEtat(a.niveau)}>{a.niveau}</Tag>
              <Btn size="sm" variant="ghost" onClick={() => ctx.aller(a.onglet)}>Ouvrir</Btn>
              <Btn size="sm" onClick={() => ctx.creerPlan(a.titre, `Ramener ${a.valeur} sous le seuil défini par la règle : ${a.regle}`)}>Plan d'action</Btn>
            </div>
          ))}
        </div>
      </SectionExec>

      {/* Plans d'action */}
      <SectionExec titre="Plans d'action stratégiques" sousTitre={`${plans.length} plans ouverts — ${PLANS_ACTION.filter((p) => p.statut === "En retard").length} en retard`}>
        <Panel>
          <Table>
            <thead>
              <tr>
                <Th>Sujet</Th>
                <Th>Responsable</Th>
                <Th>KPI cible</Th>
                <Th>Départ</Th>
                <Th>Objectif</Th>
                <Th>Actuel</Th>
                <Th>Avancement</Th>
                <Th>Statut</Th>
              </tr>
            </thead>
            <tbody>
              {PLANS_ACTION.map((p) => (
                <Tr key={p.id} onClick={() => ctx.analyser(p.sujet, [p.objectif, ...p.actions.map((a) => `Action : ${a}`), `Échéance : ${p.echeance}`])}>
                  <Td className="font-medium">{p.sujet}</Td>
                  <Td>{p.responsable}</Td>
                  <Td>{p.kpiCible}</Td>
                  <Td className="num">{p.valeurDepart}</Td>
                  <Td className="num">{p.cible}</Td>
                  <Td className="num">{p.valeurActuelle}</Td>
                  <Td>
                    <div className="flex items-center gap-2">
                      <Barre valeur={p.avancement} ton={p.avancement >= 80 ? "success" : "brand"} />
                      <span className="num text-xs">{p.avancement} %</span>
                    </div>
                  </Td>
                  <Td>
                    <Tag ton={tonPlan(p.statut)}>{p.statut}</Tag>
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        </Panel>
      </SectionExec>
    </div>
  );
}
