import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ACTIONS_DIRECTION,
  DOMAINES_SCORECARD,
  HEALTH_SCORE_HISTORIQUE,
  INDICATEURS_BENCHMARK,
  PONDERATIONS_HEALTH_SCORE,
  RISQUES_DIRECTION,
  SITES_KPI,
  statutEcart,
  type SiteKpi,
  tonSeverite,
  tonStatutAction,
  type ActionDirection,
  type StatutActionDirection,
} from "@/data/kpi-direction";
import {
  Barre,
  Btn,
  Input,
  Kpi,
  Onglets,
  PageHeader,
  Panel,
  Select,
  Table,
  Tag,
  Td,
  Th,
  Tr,
  type Ton,
} from "@/components/leoni/kit";
import { useLeoni } from "@/lib/leoni-store";

export const Route = createFileRoute("/kpi")({
  head: () => ({
    meta: [
      { title: "KPI & pilotage direction — LEONI Workforce Journey" },
      {
        name: "description",
        content:
          "Tableau de bord exécutif consolidé LEONI Maroc : Management Health Score, scorecards par domaine, benchmarking multi-sites, centre de risques et plan d'actions correctives.",
      },
      { property: "og:title", content: "KPI & pilotage direction — LEONI Workforce Journey" },
      { property: "og:description", content: "Vision consolidée de la performance RH pour la direction, tous sites confondus." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: KpiDirectionPage,
});

const ONGLETS = ["Synthèse", "Domaines", "Sites", "Risques", "Plan d'actions"];

/* ------------------------------------------------------------------ */
/* Petits composants visuels                                           */
/* ------------------------------------------------------------------ */

function Sparkline({ valeurs, ton = "brand" }: { valeurs: number[]; ton?: Ton }) {
  const largeur = 100;
  const hauteur = 28;
  const min = Math.min(...valeurs);
  const max = Math.max(...valeurs);
  const amplitude = max - min || 1;
  const points = valeurs
    .map((v, i) => {
      const x = (i / (valeurs.length - 1)) * largeur;
      const y = hauteur - ((v - min) / amplitude) * hauteur;
      return `${x},${y}`;
    })
    .join(" ");
  const couleur: Record<Ton, string> = {
    brand: "var(--brand)",
    success: "var(--success)",
    warning: "var(--warning)",
    critical: "var(--critical)",
    info: "var(--info)",
    neutral: "var(--neutral)",
  };
  return (
    <svg width={largeur} height={hauteur} viewBox={`0 0 ${largeur} ${hauteur}`} className="overflow-visible">
      <polyline points={points} fill="none" stroke={couleur[ton]} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Jauge({ valeur }: { valeur: number }) {
  const taille = 180;
  const rayon = 70;
  const centre = taille / 2;
  const angleDebut = Math.PI;
  const angleFin = 0;
  const ratio = Math.min(100, Math.max(0, valeur)) / 100;
  const angle = angleDebut + (angleFin - angleDebut) * ratio;
  const x1 = centre + rayon * Math.cos(angleDebut);
  const y1 = centre - rayon * Math.sin(angleDebut) + 10;
  const x2 = centre + rayon * Math.cos(angleFin);
  const y2 = centre - rayon * Math.sin(angleFin) + 10;
  const xA = centre + rayon * Math.cos(angleDebut);
  const yA = centre - rayon * Math.sin(angleDebut) + 10;
  const xB = centre + rayon * Math.cos(angle);
  const yB = centre - rayon * Math.sin(angle) + 10;
  const ton = valeur >= 80 ? "var(--success)" : valeur >= 60 ? "var(--warning)" : "var(--critical)";
  return (
    <svg width={taille} height={taille / 2 + 24} viewBox={`0 0 ${taille} ${taille / 2 + 24}`}>
      <path d={`M ${x1} ${y1} A ${rayon} ${rayon} 0 0 1 ${x2} ${y2}`} fill="none" stroke="var(--muted)" strokeWidth={14} strokeLinecap="round" />
      <path d={`M ${xA} ${yA} A ${rayon} ${rayon} 0 ${ratio > 0.5 ? 1 : 0} 1 ${xB} ${yB}`} fill="none" stroke={ton} strokeWidth={14} strokeLinecap="round" />
      <text x={centre} y={centre - 4} textAnchor="middle" className="num" style={{ fontSize: 30, fontWeight: 700, fill: "var(--foreground)" }}>
        {Math.round(valeur)}
      </text>
      <text x={centre} y={centre + 16} textAnchor="middle" style={{ fontSize: 11, fill: "var(--muted-foreground)" }}>
        / 100
      </text>
    </svg>
  );
}

function TendanceTag({ actuel, precedent }: { actuel: number; precedent: number }) {
  const delta = Math.round((actuel - precedent) * 10) / 10;
  if (delta === 0) return <Tag ton="neutral">Stable</Tag>;
  const hausse = delta > 0;
  return (
    <Tag ton={hausse ? "success" : "critical"}>
      {hausse ? "▲" : "▼"} {Math.abs(delta)} pt vs mois précédent
    </Tag>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                 */
/* ------------------------------------------------------------------ */

function KpiDirectionPage() {
  const { pousserNotification } = useLeoni();
  const [onglet, setOnglet] = useState("Synthèse");
  const [actions, setActions] = useState<ActionDirection[]>(ACTIONS_DIRECTION);
  const [siteTri, setSiteTri] = useState<string>("couvertureBesoins");

  const healthScore = useMemo(
    () =>
      Math.round(
        PONDERATIONS_HEALTH_SCORE.reduce((s, p) => s + (p.valeur * p.poids) / 100, 0),
      ),
    [],
  );
  const scorePrecedent = HEALTH_SCORE_HISTORIQUE[HEALTH_SCORE_HISTORIQUE.length - 2].score;

  const [nouvelleAction, setNouvelleAction] = useState({
    risqueLie: RISQUES_DIRECTION[0].id,
    action: "",
    responsable: "",
    echeance: "",
  });

  const ajouterAction = () => {
    if (!nouvelleAction.action.trim() || !nouvelleAction.responsable.trim() || !nouvelleAction.echeance.trim()) {
      pousserNotification({ titre: "Champs manquants", detail: "Veuillez renseigner l'action, le responsable et l'échéance.", ton: "warning" });
      return;
    }
    const reference = `PLA-2026-${String(actions.length + 1).padStart(3, "0")}`;
    setActions((prev) => [
      ...prev,
      {
        reference,
        risqueLie: nouvelleAction.risqueLie,
        action: nouvelleAction.action,
        responsable: nouvelleAction.responsable,
        echeance: nouvelleAction.echeance,
        avancement: 0,
        statut: "À planifier",
      },
    ]);
    setNouvelleAction({ risqueLie: RISQUES_DIRECTION[0].id, action: "", responsable: "", echeance: "" });
    pousserNotification({ titre: "Action créée", detail: `${reference} ajoutée au plan d'actions.`, ton: "success" });
  };

  const avancerAction = (reference: string) => {
    setActions((prev) =>
      prev.map((a) => {
        if (a.reference !== reference) return a;
        const avancement = Math.min(100, a.avancement + 20);
        const statut: StatutActionDirection = avancement >= 100 ? "Clôturée" : "En cours";
        return { ...a, avancement, statut };
      }),
    );
  };

  const cloturerAction = (reference: string) => {
    setActions((prev) => prev.map((a) => (a.reference === reference ? { ...a, avancement: 100, statut: "Clôturée" } : a)));
    pousserNotification({ titre: "Action clôturée", detail: `${reference} a été marquée comme clôturée.`, ton: "success" });
  };

  const sitesTries = useMemo(() => {
    const config = INDICATEURS_BENCHMARK.find((i) => i.cle === siteTri);
    return [...SITES_KPI].sort((a, b) => {
      const va = a[siteTri as keyof typeof a] as number;
      const vb = b[siteTri as keyof typeof b] as number;
      return config?.inverse ? va - vb : vb - va;
    });
  }, [siteTri]);

  return (
    <>
      <PageHeader
        titre="KPI & pilotage direction"
        sousTitre="Tableau de bord exécutif consolidé — santé RH, performance multi-sites, risques et plan d'actions"
        fil={[{ label: "Pilotage" }, { label: "KPI & pilotage direction" }]}
        actions={
          <Btn
            variant="primary"
            onClick={() => pousserNotification({ titre: "Export lancé", detail: "Synthèse direction générée au format PDF.", ton: "success" })}
          >
            Exporter la synthèse direction
          </Btn>
        }
      />

      <Onglets valeurs={ONGLETS} actif={onglet} onChange={setOnglet} />

      {onglet === "Synthèse" && (
        <div className="space-y-4">
          <div className="grid gap-4 xl:grid-cols-3">
            <Panel title="Management Health Score" subtitle="Score composite global de la santé RH" className="xl:col-span-1">
              <div className="flex flex-col items-center">
                <Jauge valeur={healthScore} />
                <TendanceTag actuel={healthScore} precedent={scorePrecedent} />
              </div>
            </Panel>

            <Panel title="Formule de calcul" subtitle="Moyenne pondérée des scores de domaine (0–100)" className="xl:col-span-2" bodyClassName="p-0">
              <Table>
                <thead>
                  <tr>
                    <Th>Domaine</Th>
                    <Th>Pondération</Th>
                    <Th>Score du domaine</Th>
                    <Th>Contribution</Th>
                  </tr>
                </thead>
                <tbody>
                  {PONDERATIONS_HEALTH_SCORE.map((p) => (
                    <Tr key={p.domaine} title={p.description}>
                      <Td className="font-medium">{p.domaine}</Td>
                      <Td className="num">{p.poids} %</Td>
                      <Td>
                        <div className="flex min-w-32 items-center gap-2">
                          <Barre valeur={p.valeur} ton={p.valeur >= 80 ? "success" : p.valeur >= 65 ? "warning" : "critical"} />
                          <span className="num w-9 text-right text-xs">{p.valeur}</span>
                        </div>
                      </Td>
                      <Td className="num text-muted-foreground">{Math.round((p.valeur * p.poids) / 100)} pts</Td>
                    </Tr>
                  ))}
                  <Tr className="bg-[var(--selected)]">
                    <Td className="font-semibold">Score global (somme des contributions)</Td>
                    <Td className="num font-semibold">100 %</Td>
                    <Td />
                    <Td className="num font-semibold text-[var(--brand)]">{healthScore} pts</Td>
                  </Tr>
                </tbody>
              </Table>
            </Panel>
          </div>

          <Panel title="Évolution du Management Health Score" subtitle="Sur les 6 derniers mois">
            <div className="flex items-end gap-4">
              {HEALTH_SCORE_HISTORIQUE.map((h) => (
                <div key={h.mois} className="flex flex-1 flex-col items-center gap-1">
                  <div className="flex h-24 w-full items-end">
                    <div
                      className="w-full rounded-t-sm bg-[var(--brand)]"
                      style={{ height: `${(h.score / 100) * 96}px` }}
                      title={`${h.score} pts`}
                    />
                  </div>
                  <span className="num text-xs text-muted-foreground">{h.score}</span>
                  <span className="text-[11px] text-muted-foreground">{h.mois}</span>
                </div>
              ))}
            </div>
          </Panel>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Kpi label="Sites suivis" valeur={SITES_KPI.length} ton="brand" />
            <Kpi label="Risques actifs" valeur={RISQUES_DIRECTION.length} ton="critical" />
            <Kpi label="Actions en cours" valeur={actions.filter((a) => a.statut === "En cours").length} ton="info" />
            <Kpi label="Actions clôturées" valeur={actions.filter((a) => a.statut === "Clôturée").length} ton="success" />
          </div>
        </div>
      )}

      {onglet === "Domaines" && (
        <div className="grid gap-4 xl:grid-cols-2">
          {DOMAINES_SCORECARD.map((d) => {
            const inverse = d.domaine === "Turnover";
            const statut = statutEcart(d.valeur, d.cible, inverse);
            const ecart = Math.round((d.valeur - d.cible) * 10) / 10;
            return (
              <Panel key={d.kpi} title={d.domaine} subtitle={d.kpi}>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="num text-2xl font-semibold">{d.valeur}</span>
                      <span className="text-xs text-muted-foreground">{d.unite}</span>
                    </div>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      Cible : <span className="num">{d.cible}{d.unite}</span> · Écart :{" "}
                      <span className={`num ${ecart >= 0 !== inverse ? "text-[var(--critical)]" : "text-[var(--success)]"}`}>
                        {ecart > 0 ? "+" : ""}
                        {ecart}
                        {d.unite}
                      </span>
                    </p>
                    <p className="mt-1 text-[11px] text-muted-foreground">Responsable : {d.responsable}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Sparkline valeurs={d.serie} ton={statut} />
                    <Tag ton={statut}>{statut === "success" ? "Sur cible" : statut === "warning" ? "Sous surveillance" : "Écart critique"}</Tag>
                  </div>
                </div>
              </Panel>
            );
          })}
        </div>
      )}

      {onglet === "Sites" && (
        <Panel
          title="Benchmarking multi-sites"
          subtitle="Comparaison de tous les KPI sur les 6 sites LEONI Maroc"
          bodyClassName="p-0"
          action={
            <Select
              value={siteTri}
              onChange={setSiteTri}
              options={INDICATEURS_BENCHMARK.map((i) => i.cle)}
              render={(v) => `Trier par : ${INDICATEURS_BENCHMARK.find((i) => i.cle === v)?.label ?? v}`}
            />
          }
        >
          <Table>
            <thead>
              <tr>
                <Th>Rang</Th>
                <Th>Site</Th>
                <Th>Effectif</Th>
                {INDICATEURS_BENCHMARK.map((i) => (
                  <Th key={i.cle}>{i.label}</Th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sitesTries.map((s, idx) => {
                const config = INDICATEURS_BENCHMARK.find((i) => i.cle === siteTri)!;
                const moyenneGroupe =
                  SITES_KPI.reduce((sum, x) => sum + (x[siteTri as keyof SiteKpi] as number), 0) / SITES_KPI.length;
                const valeurTri = s[siteTri as keyof SiteKpi] as number;
                const ecart = Math.round((valeurTri - moyenneGroupe) * 10) / 10;
                return (
                  <Tr key={s.site}>
                    <Td className="num">
                      {idx === 0 && <Tag ton="success">#1 Meilleur</Tag>}
                      {idx === sitesTries.length - 1 && <Tag ton="critical">#{sitesTries.length} Pire</Tag>}
                      {idx !== 0 && idx !== sitesTries.length - 1 && <span className="text-muted-foreground">#{idx + 1}</span>}
                    </Td>
                    <Td className="font-medium">{s.site}</Td>
                    <Td className="num text-muted-foreground">{s.effectif.toLocaleString("fr-FR")}</Td>
                    {INDICATEURS_BENCHMARK.map((i) => (
                      <Td key={i.cle} className={i.cle === siteTri ? "num font-semibold text-[var(--brand)]" : "num text-muted-foreground"}>
                        {s[i.cle]}
                        {i.unite}
                      </Td>
                    ))}
                    <Td className="hidden" />
                  </Tr>
                );
              })}
            </tbody>
          </Table>
          <p className="border-t border-border px-4 py-2 text-[11px] text-muted-foreground">
            Écart du site le mieux classé à la moyenne du groupe sur « {INDICATEURS_BENCHMARK.find((i) => i.cle === siteTri)?.label} » :{" "}
            <span className="num font-medium text-foreground">
              {Math.round(
                ((sitesTries[0][siteTri as keyof SiteKpi] as number) -
                  SITES_KPI.reduce((sum, x) => sum + (x[siteTri as keyof SiteKpi] as number), 0) / SITES_KPI.length) *
                  10,
              ) / 10}
            </span>{" "}
            points vs moyenne groupe.
          </p>
        </Panel>
      )}

      {onglet === "Risques" && (
        <Panel title="Centre de risques" subtitle="Risques priorisés par sévérité — vision consolidée" bodyClassName="p-0">
          <Table>
            <thead>
              <tr>
                <Th>Réf.</Th>
                <Th>Risque</Th>
                <Th>Domaine</Th>
                <Th>Sévérité</Th>
                <Th>Impact</Th>
                <Th>Tendance</Th>
                <Th>Site(s)</Th>
                <Th>Responsable</Th>
                <Th>Action recommandée</Th>
              </tr>
            </thead>
            <tbody>
              {[...RISQUES_DIRECTION]
                .sort((a, b) => {
                  const ordre: Record<string, number> = { Critique: 0, Élevée: 1, Moyenne: 2, Faible: 3 };
                  return ordre[a.severite] - ordre[b.severite];
                })
                .map((r) => (
                  <Tr key={r.id}>
                    <Td className="num text-xs text-[var(--brand)]">{r.id}</Td>
                    <Td className="font-medium">
                      {r.risque}
                      <p className="mt-0.5 text-[11px] font-normal text-muted-foreground">{r.indicateur}</p>
                    </Td>
                    <Td className="text-muted-foreground">{r.domaine}</Td>
                    <Td>
                      <Tag ton={tonSeverite(r.severite)}>{r.severite}</Tag>
                    </Td>
                    <Td className="max-w-64 text-xs text-muted-foreground">{r.impact}</Td>
                    <Td>
                      <Tag ton={r.tendance === "hausse" ? "critical" : r.tendance === "baisse" ? "success" : "neutral"}>
                        {r.tendance === "hausse" ? "▲ Hausse" : r.tendance === "baisse" ? "▼ Baisse" : "— Stable"}
                      </Tag>
                    </Td>
                    <Td className="text-muted-foreground">{r.siteConcerne}</Td>
                    <Td className="text-muted-foreground">{r.responsable}</Td>
                    <Td className="max-w-72 text-xs">{r.actionRecommandee}</Td>
                  </Tr>
                ))}
            </tbody>
          </Table>
        </Panel>
      )}

      {onglet === "Plan d'actions" && (
        <div className="space-y-4">
          <Panel title="Ajouter une action corrective" subtitle="Rattacher une nouvelle action à un risque identifié">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
              <div>
                <span className="label-xs">Risque lié</span>
                <Select
                  value={nouvelleAction.risqueLie}
                  onChange={(v) => setNouvelleAction((p) => ({ ...p, risqueLie: v }))}
                  options={RISQUES_DIRECTION.map((r) => r.id)}
                  render={(v) => `${v} — ${RISQUES_DIRECTION.find((r) => r.id === v)?.risque ?? ""}`}
                  className="mt-1 w-full"
                />
              </div>
              <div className="xl:col-span-2">
                <Input
                  label="Action"
                  value={nouvelleAction.action}
                  onChange={(e) => setNouvelleAction((p) => ({ ...p, action: e.target.value }))}
                  placeholder="Décrire l'action corrective"
                />
              </div>
              <Input
                label="Responsable"
                value={nouvelleAction.responsable}
                onChange={(e) => setNouvelleAction((p) => ({ ...p, responsable: e.target.value }))}
                placeholder="Nom du responsable"
              />
              <Input
                label="Échéance"
                value={nouvelleAction.echeance}
                onChange={(e) => setNouvelleAction((p) => ({ ...p, echeance: e.target.value }))}
                placeholder="JJ/MM/AAAA"
              />
            </div>
            <div className="mt-3 flex justify-end">
              <Btn variant="primary" onClick={ajouterAction}>
                Ajouter l'action
              </Btn>
            </div>
          </Panel>

          <Panel title="Plan d'actions correctives" subtitle="Suivi de l'avancement des actions liées aux risques" bodyClassName="p-0">
            <Table>
              <thead>
                <tr>
                  <Th>Réf.</Th>
                  <Th>Risque lié</Th>
                  <Th>Action</Th>
                  <Th>Responsable</Th>
                  <Th>Échéance</Th>
                  <Th>Avancement</Th>
                  <Th>Statut</Th>
                  <Th>Suivi</Th>
                </tr>
              </thead>
              <tbody>
                {actions.map((a) => (
                  <Tr key={a.reference}>
                    <Td className="num text-xs text-[var(--brand)]">{a.reference}</Td>
                    <Td className="num text-xs text-muted-foreground">{a.risqueLie}</Td>
                    <Td className="max-w-72 font-medium">{a.action}</Td>
                    <Td className="text-muted-foreground">{a.responsable}</Td>
                    <Td className="num text-xs">{a.echeance}</Td>
                    <Td>
                      <div className="flex min-w-32 items-center gap-2">
                        <Barre valeur={a.avancement} ton={a.avancement >= 100 ? "success" : a.avancement >= 50 ? "brand" : "warning"} />
                        <span className="num w-9 text-right text-xs">{a.avancement} %</span>
                      </div>
                    </Td>
                    <Td>
                      <Tag ton={tonStatutAction(a.statut)}>{a.statut}</Tag>
                    </Td>
                    <Td>
                      <div className="flex gap-1.5">
                        <Btn size="sm" variant="secondary" disabled={a.statut === "Clôturée"} onClick={() => avancerAction(a.reference)}>
                          Avancer
                        </Btn>
                        <Btn size="sm" variant="danger" disabled={a.statut === "Clôturée"} onClick={() => cloturerAction(a.reference)}>
                          Clôturer
                        </Btn>
                      </div>
                    </Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
          </Panel>
        </div>
      )}
    </>
  );
}
