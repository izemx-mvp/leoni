import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AlertTriangle, TrendingUp } from "lucide-react";
import { CANDIDATS, SITES } from "@/data/leoni";
import {
  Barre,
  Btn,
  Input,
  Kpi,
  Onglets,
  PageHeader,
  Panel,
  Select,
  StatutBadge,
  Table,
  Tag,
  Td,
  Th,
  Tr,
  Vide,
} from "@/components/leoni/kit";
import { BadgeCritique } from "@/components/leoni/postes/BadgeCritique";
import { FichePoste } from "@/components/leoni/postes/FichePoste";
import { CampagneDetailPanel } from "@/components/leoni/postes/CampagneDetailPanel";
import { AnalysesPostes } from "@/components/leoni/postes/AnalysesPostes";
import { POSTES_DETAIL, POSTES_CRITIQUES, posteDe, type Poste } from "@/data/postes-critiques";
import {
  BESOINS_DETAIL,
  CAMPAGNES_DETAIL,
  couvertureBesoin,
  posteDuBesoin,
  tauxCouvertureCampagne,
  type BesoinDetail,
  type CampagneDetail,
} from "@/data/postes-campagnes";

export const Route = createFileRoute("/recrutement/campagnes")({
  head: () => ({
    meta: [
      { title: "Postes & campagnes — LEONI Workforce Journey" },
      {
        name: "description",
        content:
          "Cockpit de pilotage des postes, des besoins en effectifs et des campagnes de recrutement par site industriel.",
      },
      { property: "og:title", content: "Postes & campagnes — LEONI Workforce Journey" },
      { property: "og:description", content: "Postes, criticité, besoins et campagnes de sourcing." },
    ],
  }),
  component: PostesCampagnes,
});

const ONGLETS = ["Vue d'ensemble", "Postes", "Besoins", "Campagnes", "Analyses"];

function PostesCampagnes() {
  const [onglet, setOnglet] = useState(ONGLETS[0]);

  return (
    <>
      <PageHeader
        titre="Postes & campagnes"
        sousTitre="Référentiel des postes, criticité, besoins en effectifs et campagnes de recrutement"
        fil={[{ label: "Recrutement" }, { label: onglet }]}
        actions={<Btn variant="primary">Créer une campagne</Btn>}
      />

      <Onglets valeurs={ONGLETS} actif={onglet} onChange={setOnglet} />

      {onglet === "Vue d'ensemble" && <VueEnsemble />}
      {onglet === "Postes" && <OngletPostes />}
      {onglet === "Besoins" && <OngletBesoins />}
      {onglet === "Campagnes" && <OngletCampagnes />}
      {onglet === "Analyses" && <AnalysesPostes />}
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Vue d'ensemble                                                       */
/* ------------------------------------------------------------------ */

function VueEnsemble() {
  const postesActifs = POSTES_DETAIL.filter((p) => p.statut === "Actif").length;
  const besoinsOuverts = BESOINS_DETAIL.filter((b) => b.statut !== "Pourvu").length;
  const volumeTotal = BESOINS_DETAIL.reduce((s, b) => s + b.volume, 0);
  const pourvusTotal = BESOINS_DETAIL.reduce((s, b) => s + b.pourvus, 0);
  const tauxCouverture = volumeTotal ? Math.round((pourvusTotal / volumeTotal) * 100) : 0;
  const delaiMoyen = Math.round(POSTES_DETAIL.reduce((s, p) => s + p.delaiMoyenJours, 0) / POSTES_DETAIL.length);
  const candidaturesActives = CANDIDATS.filter((c) => !["Refusé", "Retenu"].includes(c.statut)).length;
  const effectifCible = POSTES_DETAIL.reduce((s, p) => s + p.effectifCible, 0);
  const effectifAffecte = POSTES_DETAIL.reduce((s, p) => s + p.ouvriersAffectes, 0);

  const parSite = useMemo(() => {
    const map = new Map<string, { site: string; cible: number; affecte: number }>();
    for (const p of POSTES_DETAIL) {
      const e = map.get(p.site) ?? { site: p.site, cible: 0, affecte: 0 };
      e.cible += p.effectifCible;
      e.affecte += p.ouvriersAffectes;
      map.set(p.site, e);
    }
    return Array.from(map.values());
  }, []);

  const parFamille = useMemo(() => {
    const map = new Map<string, { famille: string; cible: number; affecte: number }>();
    for (const p of POSTES_DETAIL) {
      const e = map.get(p.famille) ?? { famille: p.famille, cible: 0, affecte: 0 };
      e.cible += p.effectifCible;
      e.affecte += p.ouvriersAffectes;
      map.set(p.famille, e);
    }
    return Array.from(map.values());
  }, []);

  const topTension = useMemo(
    () =>
      [...POSTES_DETAIL]
        .map((p) => ({ p, tension: p.effectifCible ? p.ouverts / p.effectifCible : 0 }))
        .sort((a, b) => b.tension - a.tension)
        .slice(0, 5),
    [],
  );

  const alertes = useMemo(
    () => BESOINS_DETAIL.filter((b) => couvertureBesoin(b) < 50 || b.statut === "En retard"),
    [],
  );

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
        <Kpi label="Postes actifs" valeur={postesActifs} ton="brand" />
        <Kpi label="Postes critiques" valeur={POSTES_CRITIQUES.length} ton="critical" />
        <Kpi label="Besoins ouverts" valeur={besoinsOuverts} ton="warning" />
        <Kpi label="Taux de couverture" valeur={tauxCouverture} suffixe="%" ton="success" />
        <Kpi label="Délai moyen de pourvoi" valeur={delaiMoyen} suffixe="jours" ton="info" />
        <Kpi label="Candidatures actives" valeur={candidaturesActives} ton="brand" />
        <Kpi label="Effectif cible / affecté" valeur={`${effectifAffecte} / ${effectifCible}`} ton="neutral" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel title="Répartition par site" subtitle="Effectif cible vs affecté">
          <div className="space-y-2.5">
            {parSite.map((s) => (
              <div key={s.site}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="font-medium">{s.site}</span>
                  <span className="num text-muted-foreground">{s.affecte} / {s.cible}</span>
                </div>
                <Barre valeur={s.cible ? (s.affecte / s.cible) * 100 : 0} />
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Répartition par famille de poste" subtitle="Effectif cible vs affecté">
          <div className="space-y-2.5">
            {parFamille.map((f) => (
              <div key={f.famille}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="font-medium">{f.famille}</span>
                  <span className="num text-muted-foreground">{f.affecte} / {f.cible}</span>
                </div>
                <Barre valeur={f.cible ? (f.affecte / f.cible) * 100 : 0} ton="brand" />
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Top postes en tension" subtitle="Postes ouverts rapportés à l'effectif cible">
          <ul className="space-y-2.5">
            {topTension.map(({ p, tension }) => (
              <li key={p.code} className="flex items-center justify-between gap-2 text-xs">
                <span className="flex min-w-0 items-center gap-1.5">
                  <span className="truncate font-medium">{p.nom}</span>
                  <BadgeCritique poste={p.code} compact />
                </span>
                <Tag ton={tension > 0.1 ? "critical" : tension > 0.05 ? "warning" : "neutral"}>
                  {p.ouverts} ouverts · {Math.round(tension * 100)} %
                </Tag>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Alertes de couverture" subtitle="Besoins en retard ou couverts à moins de 50 %">
          {alertes.length === 0 ? (
            <Vide texte="Aucune alerte de couverture en cours." />
          ) : (
            <ul className="space-y-2">
              {alertes.map((b) => {
                const poste = posteDuBesoin(b);
                return (
                  <li key={b.code} className="flex items-start gap-2 rounded-sm border border-border p-2.5 text-xs">
                    <AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-[var(--critical)]" />
                    <div className="min-w-0 flex-1">
                      <p className="flex flex-wrap items-center gap-1.5 font-medium">
                        {poste?.nom ?? b.posteCode}
                        <BadgeCritique poste={b.posteCode} compact />
                      </p>
                      <p className="mt-0.5 text-muted-foreground">
                        {b.site} · {b.code} · couverture {couvertureBesoin(b)} % · échéance {b.echeance}
                      </p>
                    </div>
                    <StatutBadge valeur={b.statut} />
                  </li>
                );
              })}
            </ul>
          )}
        </Panel>

        <Panel title="Avancement des campagnes" subtitle="Progression vers l'objectif de recrutement">
          <div className="space-y-3">
            {CAMPAGNES_DETAIL.map((c) => (
              <div key={c.code}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="font-medium">{c.nom}</span>
                  <span className="num text-muted-foreground">
                    {c.retenus} / {c.objectif} · {tauxCouvertureCampagne(c)} %
                  </span>
                </div>
                <Barre
                  valeur={tauxCouvertureCampagne(c)}
                  ton={tauxCouvertureCampagne(c) >= 70 ? "success" : tauxCouvertureCampagne(c) >= 40 ? "warning" : "critical"}
                />
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Postes                                                               */
/* ------------------------------------------------------------------ */

function OngletPostes() {
  const [recherche, setRecherche] = useState("");
  const [site, setSite] = useState("Tous les sites");
  const [famille, setFamille] = useState("Toutes les familles");
  const [statut, setStatut] = useState("Tous les statuts");
  const [criticite, setCriticite] = useState("Toutes criticités");
  const [posteOuvert, setPosteOuvert] = useState<Poste | null>(null);

  const familles = useMemo(() => ["Toutes les familles", ...new Set(POSTES_DETAIL.map((p) => p.famille))], []);
  const listeSites = useMemo(() => ["Tous les sites", ...SITES], []);

  const postesFiltres = useMemo(() => {
    const ref = recherche.trim().toLowerCase();
    return POSTES_DETAIL.filter((p) => {
      if (site !== "Tous les sites" && p.site !== site) return false;
      if (famille !== "Toutes les familles" && p.famille !== famille) return false;
      if (statut !== "Tous les statuts" && p.statut !== statut) return false;
      if (criticite === "Critiques" && !p.isCritical) return false;
      if (criticite === "Non critiques" && p.isCritical) return false;
      if (ref && !`${p.code} ${p.nom} ${p.responsable}`.toLowerCase().includes(ref)) return false;
      return true;
    });
  }, [recherche, site, famille, statut, criticite]);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <Input
          placeholder="Rechercher un poste, un code, un responsable…"
          value={recherche}
          onChange={(e) => setRecherche(e.target.value)}
          className="w-64"
        />
        <Select value={site} onChange={setSite} options={listeSites} />
        <Select value={famille} onChange={setFamille} options={familles} />
        <Select value={statut} onChange={setStatut} options={["Tous les statuts", "Actif", "Suspendu", "Clôturé"]} />
        <Select value={criticite} onChange={setCriticite} options={["Toutes criticités", "Critiques", "Non critiques"]} />
        <span className="ml-auto text-xs text-muted-foreground">{postesFiltres.length} poste(s)</span>
      </div>

      <Panel bodyClassName="p-0">
        <Table>
          <thead>
            <tr>
              <Th>Code</Th>
              <Th>Poste</Th>
              <Th>Famille</Th>
              <Th>Site</Th>
              <Th>Atelier</Th>
              <Th>Responsable</Th>
              <Th>Cible / Affecté</Th>
              <Th>Ouverts</Th>
              <Th>Délai moyen</Th>
              <Th>Statut</Th>
              <Th>Criticité</Th>
            </tr>
          </thead>
          <tbody>
            {postesFiltres.map((p) => (
              <Tr
                key={p.code}
                onClick={() => setPosteOuvert(p)}
                onDoubleClick={() => setPosteOuvert(p)}
                title="Cliquer pour ouvrir la fiche poste"
              >
                <Td className="num text-xs text-[var(--brand)]">{p.code}</Td>
                <Td className="font-medium">{p.nom}</Td>
                <Td className="text-muted-foreground">{p.famille}</Td>
                <Td className="text-muted-foreground">{p.site}</Td>
                <Td className="text-muted-foreground">{p.atelier}</Td>
                <Td className="text-muted-foreground">{p.responsable}</Td>
                <Td className="num">{p.ouvriersAffectes} / {p.effectifCible}</Td>
                <Td className="num">{p.ouverts}</Td>
                <Td className="num text-muted-foreground">{p.delaiMoyenJours} j</Td>
                <Td><StatutBadge valeur={p.statut} /></Td>
                <Td><BadgeCritique poste={p.code} compact /></Td>
              </Tr>
            ))}
            {postesFiltres.length === 0 && (
              <tr>
                <td colSpan={11}>
                  <Vide texte="Aucun poste ne correspond aux filtres sélectionnés." />
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </Panel>

      {posteOuvert && <FichePoste poste={posteOuvert} onClose={() => setPosteOuvert(null)} />}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Besoins                                                              */
/* ------------------------------------------------------------------ */

function OngletBesoins() {
  const volumeTotal = BESOINS_DETAIL.reduce((s, b) => s + b.volume, 0);
  const pourvusTotal = BESOINS_DETAIL.reduce((s, b) => s + b.pourvus, 0);
  const couvertureGlobale = volumeTotal ? Math.round((pourvusTotal / volumeTotal) * 100) : 0;
  const enRetard = BESOINS_DETAIL.filter((b) => b.statut === "En retard").length;
  const critiques = BESOINS_DETAIL.filter((b) => b.priorite === "Critique").length;

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-4">
        <Kpi label="Besoins suivis" valeur={BESOINS_DETAIL.length} ton="brand" />
        <Kpi label="Couverture globale" valeur={couvertureGlobale} suffixe="%" ton="success" />
        <Kpi label="Besoins en retard" valeur={enRetard} ton="critical" />
        <Kpi label="Priorité critique" valeur={critiques} ton="warning" />
      </div>

      <Panel bodyClassName="p-0">
        <Table>
          <thead>
            <tr>
              <Th>Référence</Th>
              <Th>Poste</Th>
              <Th>Site</Th>
              <Th>Atelier</Th>
              <Th>Volume</Th>
              <Th>Pourvus</Th>
              <Th>Couverture</Th>
              <Th>Échéance</Th>
              <Th>Priorité</Th>
              <Th>Campagne</Th>
              <Th>Statut</Th>
            </tr>
          </thead>
          <tbody>
            {BESOINS_DETAIL.map((b: BesoinDetail) => {
              const poste = posteDuBesoin(b);
              const couverture = couvertureBesoin(b);
              return (
                <Tr key={b.code}>
                  <Td className="num text-xs text-[var(--brand)]">{b.code}</Td>
                  <Td>
                    <span className="flex items-center gap-1.5 font-medium">
                      {poste?.nom ?? b.posteCode}
                      <BadgeCritique poste={b.posteCode} compact />
                    </span>
                  </Td>
                  <Td className="text-muted-foreground">{b.site}</Td>
                  <Td className="text-muted-foreground">{b.atelier}</Td>
                  <Td className="num">{b.volume}</Td>
                  <Td className="num">{b.pourvus}</Td>
                  <Td>
                    <div className="flex w-32 items-center gap-2">
                      <Barre valeur={couverture} ton={couverture >= 70 ? "success" : couverture >= 40 ? "warning" : "critical"} />
                      <span className="num text-xs">{couverture} %</span>
                    </div>
                  </Td>
                  <Td className="num text-muted-foreground">{b.echeance}</Td>
                  <Td>
                    <Tag ton={b.priorite === "Critique" ? "critical" : b.priorite === "Élevée" ? "warning" : "neutral"}>
                      {b.priorite}
                    </Tag>
                  </Td>
                  <Td className="num text-xs text-muted-foreground">{b.campagneCode ?? "—"}</Td>
                  <Td><StatutBadge valeur={b.statut} /></Td>
                </Tr>
              );
            })}
          </tbody>
        </Table>
      </Panel>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Campagnes                                                            */
/* ------------------------------------------------------------------ */

function OngletCampagnes() {
  const [selection, setSelection] = useState<CampagneDetail | null>(CAMPAGNES_DETAIL[0] ?? null);

  return (
    <div className="space-y-4">
      <Panel bodyClassName="p-0">
        <Table>
          <thead>
            <tr>
              <Th>Code</Th>
              <Th>Campagne</Th>
              <Th>Site</Th>
              <Th>Objectif</Th>
              <Th>Reçus</Th>
              <Th>Retenus</Th>
              <Th>Couverture</Th>
              <Th>Coût / recrutement</Th>
              <Th>Canal principal</Th>
              <Th>Période</Th>
              <Th>Statut</Th>
            </tr>
          </thead>
          <tbody>
            {CAMPAGNES_DETAIL.map((c) => (
              <Tr
                key={c.code}
                onClick={() => setSelection(c)}
                className={selection?.code === c.code ? "bg-[var(--selected)]" : undefined}
                title="Cliquer pour voir le détail de la campagne"
              >
                <Td className="num text-xs text-[var(--brand)]">{c.code}</Td>
                <Td className="font-medium">{c.nom}</Td>
                <Td className="text-muted-foreground">{c.site}</Td>
                <Td className="num">{c.objectif}</Td>
                <Td className="num">{c.recus}</Td>
                <Td className="num">{c.retenus}</Td>
                <Td>
                  <div className="flex w-32 items-center gap-2">
                    <Barre valeur={tauxCouvertureCampagne(c)} />
                    <span className="num text-xs">{tauxCouvertureCampagne(c)} %</span>
                  </div>
                </Td>
                <Td className="num text-muted-foreground">{c.coutParRecrutement.toLocaleString("fr-FR")} MAD</Td>
                <Td className="text-muted-foreground">{c.canalPrincipal}</Td>
                <Td className="whitespace-nowrap text-xs text-muted-foreground">
                  {c.periodeDebut} → {c.periodeFin}
                </Td>
                <Td><StatutBadge valeur={c.statut} /></Td>
              </Tr>
            ))}
          </tbody>
        </Table>
      </Panel>

      {selection && <CampagneDetailPanel campagne={selection} />}
    </div>
  );
}
