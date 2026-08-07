import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Btn, Modale, Onglets, PageHeader, Panel, Select, Tag } from "@/components/leoni/kit";
import type { CtxPilotage } from "@/components/leoni/pilotage/contexte";
import { VueExecutive } from "@/components/leoni/pilotage/VueExecutive";
import { Workforce } from "@/components/leoni/pilotage/Workforce";
import { Recrutement } from "@/components/leoni/pilotage/Recrutement";
import { PostesCritiques } from "@/components/leoni/pilotage/PostesCritiques";
import { FormationIntegration } from "@/components/leoni/pilotage/FormationIntegration";
import { RetentionTurnover } from "@/components/leoni/pilotage/RetentionTurnover";
import { SatisfactionClimat } from "@/components/leoni/pilotage/SatisfactionClimat";
import { ReclamationsIrritants } from "@/components/leoni/pilotage/ReclamationsIrritants";
import { RisquesAlertes } from "@/components/leoni/pilotage/RisquesAlertes";
import { ComparaisonSites } from "@/components/leoni/pilotage/ComparaisonSites";
import {
  CRITICITES,
  DEPARTEMENTS,
  MENTION_CONFIDENTIALITE,
  MOIS_PAR_PERIODE,
  PERIMETRES,
  PERIODES,
  POSTES_FILTRE,
  REGIONS,
  ROLES_AUTORISES,
  SITES_PILOTAGE,
  sitesFiltres,
} from "@/data/pilotage";

export const Route = createFileRoute("/kpi")({
  head: () => ({
    meta: [
      { title: "Pilotage Direction — cockpit stratégique LEONI" },
      {
        name: "description",
        content:
          "Cockpit de pilotage Direction : santé sociale, risques, tendances 12 mois et comparaison des sites LEONI Maroc.",
      },
      { property: "og:title", content: "Pilotage Direction — cockpit stratégique LEONI" },
      {
        property: "og:description",
        content: "Vue exécutive consolidée : workforce, recrutement, postes critiques, rétention, satisfaction et risques.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PilotageDirection,
});

const ONGLETS = [
  "Vue exécutive",
  "Workforce",
  "Recrutement",
  "Postes critiques",
  "Formation & intégration",
  "Rétention & turnover",
  "Satisfaction & climat",
  "Réclamations & irritants",
  "Risques & alertes",
  "Comparaison sites",
];

const SITES_OPTIONS = ["Tous les sites", ...SITES_PILOTAGE];

function PilotageDirection() {
  const [onglet, setOnglet] = useState("Vue exécutive");
  const [periode, setPeriode] = useState("12 derniers mois");
  const [site, setSite] = useState("Tous les sites");
  const [region, setRegion] = useState(REGIONS[0]);
  const [departement, setDepartement] = useState(DEPARTEMENTS[0]);
  const [poste, setPoste] = useState(POSTES_FILTRE[0]);
  const [criticite, setCriticite] = useState(CRITICITES[0]);
  const [role, setRole] = useState(ROLES_AUTORISES[0]);
  const [comparer, setComparer] = useState(true);
  const [objectifs, setObjectifs] = useState(true);
  const [analyse, setAnalyse] = useState<{ titre: string; contenu: string[]; onglet?: string } | null>(null);
  const [plan, setPlan] = useState<{ sujet: string; objectif: string } | null>(null);

  const fiches = useMemo(() => sitesFiltres(site, region), [site, region]);
  const mois = MOIS_PAR_PERIODE[periode] ?? 12;

  const ctx: CtxPilotage = {
    fiches,
    mois,
    comparer,
    objectifs,
    aller: (o) => {
      setOnglet(o);
      setAnalyse(null);
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    analyser: (titre, contenu, o) => setAnalyse({ titre, contenu, onglet: o }),
    creerPlan: (sujet, objectif) => setPlan({ sujet, objectif }),
  };

  const filtresActifs = [
    site !== "Tous les sites" && site,
    region !== REGIONS[0] && region,
    departement !== DEPARTEMENTS[0] && departement,
    poste !== POSTES_FILTRE[0] && poste,
    criticite !== CRITICITES[0] && criticite,
  ].filter(Boolean) as string[];

  return (
    <div>
      <PageHeader
        titre="Pilotage Direction"
        sousTitre={`Cockpit stratégique — ${periode.toLowerCase()} · périmètre ${PERIMETRES[role] ?? "Tous les sites"}`}
        fil={[{ label: "Accueil", to: "/" }, { label: "Pilotage Direction" }]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Select value={role} onChange={setRole} options={ROLES_AUTORISES} className="h-9 text-xs" />
            <Btn variant={comparer ? "primary" : "secondary"} size="sm" onClick={() => setComparer((v) => !v)}>
              Comparaison N-1
            </Btn>
            <Btn variant={objectifs ? "primary" : "secondary"} size="sm" onClick={() => setObjectifs((v) => !v)}>
              Objectifs
            </Btn>
            <Btn variant="secondary" size="sm" onClick={() => window.print()}>
              Exporter
            </Btn>
          </div>
        }
      />

      <Panel className="mb-4" bodyClassName="p-3">
        <div className="flex flex-wrap items-center gap-2">
          <Select value={periode} onChange={setPeriode} options={PERIODES} className="h-9 text-xs" />
          <Select value={site} onChange={setSite} options={SITES_OPTIONS} className="h-9 text-xs" />
          <Select value={region} onChange={setRegion} options={REGIONS} className="h-9 text-xs" />
          <Select value={departement} onChange={setDepartement} options={DEPARTEMENTS} className="h-9 text-xs" />
          <Select value={poste} onChange={setPoste} options={POSTES_FILTRE} className="h-9 text-xs" />
          <Select value={criticite} onChange={setCriticite} options={CRITICITES} className="h-9 text-xs" />
          {filtresActifs.length > 0 && (
            <>
              <span className="mx-1 h-5 w-px bg-border" />
              {filtresActifs.map((f) => (
                <Tag key={f} ton="brand">
                  {f}
                </Tag>
              ))}
              <Btn
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSite("Tous les sites");
                  setRegion(REGIONS[0]);
                  setDepartement(DEPARTEMENTS[0]);
                  setPoste(POSTES_FILTRE[0]);
                  setCriticite(CRITICITES[0]);
                }}
              >
                Réinitialiser
              </Btn>
            </>
          )}
          <span className="ml-auto text-[11px] text-muted-foreground">
            {fiches.length} site(s) — {fiches.reduce((s, f) => s + f.effectif, 0).toLocaleString("fr-FR")} ouvriers
          </span>
        </div>
      </Panel>

      <Onglets valeurs={ONGLETS} actif={onglet} onChange={setOnglet} />

      {onglet === "Vue exécutive" && <VueExecutive ctx={ctx} />}
      {onglet === "Workforce" && <Workforce ctx={ctx} />}
      {onglet === "Recrutement" && <Recrutement ctx={ctx} />}
      {onglet === "Postes critiques" && <PostesCritiques ctx={ctx} />}
      {onglet === "Formation & intégration" && <FormationIntegration ctx={ctx} />}
      {onglet === "Rétention & turnover" && <RetentionTurnover ctx={ctx} />}
      {onglet === "Satisfaction & climat" && <SatisfactionClimat ctx={ctx} />}
      {onglet === "Réclamations & irritants" && <ReclamationsIrritants ctx={ctx} />}
      {onglet === "Risques & alertes" && <RisquesAlertes ctx={ctx} />}
      {onglet === "Comparaison sites" && <ComparaisonSites ctx={ctx} />}

      <p className="mt-8 border-t border-border pt-4 text-[11px] text-muted-foreground">{MENTION_CONFIDENTIALITE}</p>

      {analyse && (
        <Modale titre={analyse.titre} sousTitre="Analyse détaillée — niveau drill-down" onClose={() => setAnalyse(null)}>
          <ul className="space-y-2 text-sm">
            {analyse.contenu.map((c, i) => (
              <li key={i} className="text-foreground/85">
                {c}
              </li>
            ))}
          </ul>
          <div className="mt-5 flex flex-wrap gap-2">
            {analyse.onglet && (
              <Btn
                onClick={() => {
                  const o = analyse.onglet!;
                  setAnalyse(null);
                  setOnglet(o);
                }}
              >
                Ouvrir « {analyse.onglet} »
              </Btn>
            )}
            <Btn variant="secondary" onClick={() => setPlan({ sujet: analyse.titre, objectif: "Définir la cible et le responsable" })}>
              Créer un plan d'action
            </Btn>
            <Btn variant="ghost" onClick={() => setAnalyse(null)}>
              Fermer
            </Btn>
          </div>
        </Modale>
      )}

      {plan && (
        <Modale titre="Nouveau plan d'action" sousTitre={plan.sujet} onClose={() => setPlan(null)}>
          <div className="space-y-3 text-sm">
            <p className="text-foreground/85">
              Objectif proposé : <span className="font-medium">{plan.objectif}</span>
            </p>
            <p className="text-xs text-muted-foreground">
              Le plan sera rattaché au suivi stratégique de l'onglet « Risques & alertes » avec responsable, KPI cible et
              échéance à renseigner.
            </p>
          </div>
          <div className="mt-5 flex gap-2">
            <Btn
              onClick={() => {
                setPlan(null);
                setOnglet("Risques & alertes");
              }}
            >
              Enregistrer et suivre
            </Btn>
            <Btn variant="ghost" onClick={() => setPlan(null)}>
              Annuler
            </Btn>
          </div>
        </Modale>
      )}
    </div>
  );
}
