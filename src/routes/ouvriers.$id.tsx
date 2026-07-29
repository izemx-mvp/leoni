import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  CalendarDays,
  ChevronRight,
  MessageSquare,
  MoreHorizontal,
  Plus,
  Shuffle,
} from "lucide-react";
import {
  Avatar,
  Barre,
  Btn,
  Field,
  IAWarning,
  PageHeader,
  Panel,
  ProgressionCell,
  RisqueBadge,
  StatutBadge,
  Table,
  Tag,
  Td,
  Th,
  Tr,
} from "@/components/leoni/kit";
import { useLeoni } from "@/lib/leoni-store";
import { DossierOuvrier } from "@/components/leoni/ouvriers/DossierOuvrier";

export const Route = createFileRoute("/ouvriers/$id")({
  head: () => ({
    meta: [
      { title: "Fiche ouvrier 360° — LEONI Workforce Journey" },
      { name: "description", content: "Dossier opérateur 360° : synthèse, parcours de formation, présence, évaluations, suivi, analyse IA et décision RH tracée." },
      { property: "og:title", content: "Fiche ouvrier 360° — LEONI Workforce Journey" },
      { property: "og:description", content: "Le dossier central du parcours d'intégration d'un opérateur." },
    ],
  }),
  component: FicheOuvrier,
});

const SECTIONS = [
  "1. Synthèse",
  "2. Dossier",
  "3. Parcours & formation",
  "4. Présence",
  "5. Évaluations & compétences",
  "6. Suivi & événements",
  "7. Communications & documents",
  "8. Analyse & décision",
  "9. Historique",
];

const DECISIONS = [
  "CONFIRMER",
  "CONFIRMER SOUS RÉSERVE",
  "PROLONGER LA FORMATION",
  "RÉORIENTER",
  "SUSPENDRE",
  "ARRÊTER LE PARCOURS",
];

const tooltipStyle = {
  backgroundColor: "var(--popover)",
  border: "1px solid var(--border)",
  borderRadius: 6,
  fontSize: 12,
  color: "var(--popover-foreground)",
};

function FicheOuvrier() {
  const { id } = Route.useParams();
  const {
    ouvriers,
    candidats,
    ajouterEvenement,
    enregistrerPresence,
    validerJournee,
    deciderParcours,
    pousserNotification,
  } = useLeoni();
  const o = ouvriers.find((x) => x.id === id);
  const [section, setSection] = useState(SECTIONS[0]);
  const [sousOngletFormation, setSousOnglet] = useState("Modules");
  const [modale, setModale] = useState<null | "observation" | "absence" | "evaluation" | "message" | "decision" | "affectation">(null);
  const [menu, setMenu] = useState(false);
  const [obs, setObs] = useState({ tonalite: "Positive", texte: "" });
  const [abs, setAbs] = useState({ type: "Absence", detail: "Journée complète" });
  const [evalJour, setEval] = useState({ score: 85, observation: "" });
  const [dec, setDec] = useState({ decision: "CONFIRMER", commentaire: "", motif: "" });
  const [filtreEvt, setFiltre] = useState("Tous");
  const [module, setModule] = useState<string | null>(null);

  if (!o) return <p className="text-sm text-muted-foreground">Fiche ouvrier introuvable.</p>;

  const candidat = candidats.find((c) => c.id === o.candidatId);
  const evenements = o.evenements.filter((e) => filtreEvt === "Tous" || e.type === filtreEvt);
  const moyenneTests = o.tests.length
    ? (o.tests.reduce((a, b) => a + b.score, 0) / o.tests.length).toFixed(2)
    : "—";
  const radar = o.readiness.sous.map((s) => ({ critere: s.label, valeur: s.valeur }));

  return (
    <>
      <PageHeader
        titre={o.nom}
        sousTitre={`${o.poste} · ${o.site} · Atelier ${o.atelier} · Groupe ${o.groupe}`}
        fil={[{ label: "Ouvriers" }, { label: "Tous les ouvriers", to: "/ouvriers" }, { label: o.id }]}
      />

      {/* Header permanent */}
      <div className="mb-5 rounded-md border border-border bg-card">
        <div className="flex flex-wrap items-start gap-5 p-4">
          <Avatar nom={o.nom} size={64} />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-semibold">{o.nom}</h2>
              <StatutBadge valeur={o.statut} />
            </div>
            <p className="num mt-1 text-xs text-muted-foreground">{o.id}</p>
            <div className="mt-2 grid grid-cols-2 gap-x-6 gap-y-1.5 text-xs md:grid-cols-3">
              <Field label="Poste" value={o.poste} />
              <Field label="Site" value={o.site} />
              <Field label="Atelier" value={o.atelier} />
              <Field label="Groupe" value={o.groupe} />
              <Field label="Intégration" value={o.dateIntegration} />
              <Field label="Formateur" value={o.formateur} />
            </div>
          </div>
          <div className="ml-auto grid grid-cols-2 gap-2 lg:grid-cols-4">
            {[
              { l: "Progression", v: `${o.progression} %` },
              { l: "Score global", v: `${o.score} %` },
              { l: "Présence", v: `${o.presence} %` },
              { l: "Risque", v: o.risque },
            ].map((k) => (
              <div key={k.l} className="min-w-28 rounded-sm border border-border p-2.5">
                <p className="label-xs">{k.l}</p>
                <p
                  className={
                    k.l === "Risque"
                      ? `mt-1 text-lg font-semibold ${o.risque === "Faible" ? "text-[var(--success)]" : o.risque === "Moyen" ? "text-[var(--warning)]" : "text-[var(--critical)]"}`
                      : "num mt-1 text-lg font-semibold"
                  }
                >
                  {k.v}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 border-t border-border px-4 py-3">
          <Tag ton="brand">Prochaine action : {o.prochaineAction}</Tag>
          <div className="ml-auto flex flex-wrap gap-2">
            <Btn size="sm" variant="secondary" onClick={() => setModale("observation")}>
              <Plus className="size-3" /> Observation
            </Btn>
            <Btn size="sm" variant="secondary" onClick={() => setModale("absence")}>
              <Plus className="size-3" /> Absence / retard
            </Btn>
            <Btn size="sm" variant="secondary" onClick={() => setModale("evaluation")}>
              <Plus className="size-3" /> Évaluation du jour
            </Btn>
            <Btn size="sm" variant="secondary" onClick={() => setModale("message")}>
              <MessageSquare className="size-3" /> Message
            </Btn>
            <Link to="/formation/planning">
              <Btn size="sm" variant="secondary">
                <CalendarDays className="size-3" /> Planning
              </Btn>
            </Link>
            <Btn size="sm" variant="secondary" onClick={() => setModale("affectation")}>
              <Shuffle className="size-3" /> Affectation
            </Btn>
            <div className="relative">
              <Btn size="sm" variant="secondary" onClick={() => setMenu((v) => !v)}>
                <MoreHorizontal className="size-3.5" />
              </Btn>
              {menu && (
                <div className="absolute right-0 top-9 z-50 w-56 rounded-md border border-border bg-popover p-1 shadow-xl">
                  {["Prolonger le parcours", "Suspendre", "Réorienter", "Arrêter le parcours"].map((a) => (
                    <button
                      key={a}
                      onClick={() => {
                        setMenu(false);
                        setDec({
                          decision:
                            a === "Suspendre" ? "SUSPENDRE" : a === "Réorienter" ? "RÉORIENTER" : a === "Arrêter le parcours" ? "ARRÊTER LE PARCOURS" : "PROLONGER LA FORMATION",
                          commentaire: "",
                          motif: "",
                        });
                        setModale("decision");
                      }}
                      className="block w-full rounded-sm px-2.5 py-2 text-left text-sm text-[var(--critical)] hover:bg-[var(--hover)]"
                    >
                      {a}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-1 border-b border-border">
        {SECTIONS.map((s) => (
          <button
            key={s}
            onClick={() => setSection(s)}
            className={
              s === section
                ? "-mb-px border-b-2 border-[var(--brand)] px-3 py-2 text-xs font-medium text-[var(--brand)]"
                : "-mb-px border-b-2 border-transparent px-3 py-2 text-xs text-muted-foreground hover:text-foreground"
            }
          >
            {s}
          </button>
        ))}
      </div>

      {/* 1. SYNTHÈSE */}
      {section === SECTIONS[0] && (
        <div className="grid gap-4 xl:grid-cols-3">
          <Panel title="Situation actuelle" className="xl:col-span-2">
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              <Field label="Statut" value={<StatutBadge valeur={o.statut} />} />
              <Field label="Jour actuel" value={`Jour ${o.jour} / ${o.jourTotal}`} />
              <Field label="Parcours" value={`${o.parcours} – ${o.parcoursLibelle}`} />
              <Field label="Groupe" value={o.groupe} />
              <Field label="Formateur principal" value={o.formateur} />
              <Field label="Atelier cible" value={o.atelier} />
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
              {[
                { l: "Progression", v: `${o.progression} %` },
                { l: "Score pédagogique", v: `${o.score} %` },
                { l: "Présence", v: `${o.presence} %` },
                { l: "Ponctualité", v: `${o.ponctualite} %` },
                { l: "Compétences validées", v: `${o.competences.filter((c) => c.niveau >= 3).length} / ${o.competences.length + 5}` },
                { l: "Tests réussis", v: `${o.tests.filter((t) => t.statut === "Réussi").length} / 5` },
                { l: "Incidents", v: String(o.evenements.filter((e) => e.type === "Incident").length) },
                { l: "Actions ouvertes", v: String(o.evenements.filter((e) => e.type === "Action corrective" && e.statut !== "Terminée").length + 1) },
              ].map((k) => (
                <div key={k.l} className="rounded-sm border border-border p-2.5">
                  <p className="label-xs">{k.l}</p>
                  <p className="num mt-1 text-base font-semibold">{k.v}</p>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="Analyse actuelle">
            <Field label="Risque" value={<RisqueBadge valeur={o.risque} />} />
            <div className="mt-3">
              <Field label="Tendance" value={o.readiness.tendance} />
            </div>
            <div className="mt-3">
              <Field label="Recommandation actuelle" value={o.risque === "Faible" ? "Poursuivre le parcours normalement" : "Renforcer le suivi et planifier un point RH"} />
            </div>
            <div className="mt-4 rounded-sm border border-border bg-[var(--brand-soft)] p-3">
              <p className="label-xs">Prochaine étape</p>
              {o.prochaineEtape ? (
                <>
                  <p className="num mt-1 text-sm font-semibold">
                    {o.prochaineEtape.date} · {o.prochaineEtape.heure}
                  </p>
                  <p className="text-sm">{o.prochaineEtape.libelle}</p>
                  <p className="text-xs text-muted-foreground">{o.prochaineEtape.lieu}</p>
                </>
              ) : (
                <p className="mt-1 text-sm">{o.prochaineAction}</p>
              )}
            </div>
          </Panel>

          <Panel title="Évolution du parcours" subtitle="Score pédagogique jour par jour" className="xl:col-span-2">
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={o.courbe} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="jour" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                <YAxis domain={[60, 100]} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="score" stroke="var(--brand)" strokeWidth={2.5} dot={{ r: 3, fill: "var(--brand)" }} />
              </LineChart>
            </ResponsiveContainer>
          </Panel>

          <Panel title="Derniers événements">
            <ol className="space-y-3">
              {[...o.evenements].slice(0, 4).map((e) => (
                <li key={e.id} className="flex gap-3">
                  <span
                    className={`mt-1.5 size-2 shrink-0 rounded-full ${
                      e.tonalite === "Positive" ? "bg-[var(--success)]" : e.tonalite === "Négative" || e.tonalite === "Critique" ? "bg-[var(--critical)]" : "bg-[var(--brand)]"
                    }`}
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-medium">{e.titre}</p>
                    <p className="num text-[11px] text-muted-foreground">{e.date} · {e.auteur}</p>
                  </div>
                </li>
              ))}
              {o.journal.slice(-2).reverse().map((j) => (
                <li key={j.date} className="flex gap-3">
                  <span className="mt-1.5 size-2 shrink-0 rounded-full bg-[var(--brand)]" />
                  <div>
                    <p className="text-xs font-medium">{j.module} — {j.statut}</p>
                    <p className="num text-[11px] text-muted-foreground">{j.date} · score {j.score} %</p>
                  </div>
                </li>
              ))}
            </ol>
          </Panel>
        </div>
      )}

      {/* 2. DOSSIER */}
      {section === SECTIONS[1] && <DossierOuvrier o={o} candidat={candidat} />}

      {/* 3. PARCOURS & FORMATION */}
      {section === SECTIONS[2] && (
        <>
          <Panel className="mb-4">
            <div className="flex flex-wrap items-center gap-6">
              <div>
                <p className="label-xs">Parcours actif</p>
                <p className="mt-1 text-sm font-semibold">{o.parcours} — {o.parcoursLibelle}</p>
                <p className="text-xs text-muted-foreground">{o.jourTotal} jours · seuil de réussite 75 % · présence minimale 90 %</p>
              </div>
              <div className="min-w-64 flex-1">
                <ProgressionCell valeur={o.progression} />
              </div>
            </div>
          </Panel>

          <div className="mb-4 flex gap-1 border-b border-border">
            {["Modules", "Journal de formation"].map((s) => (
              <button
                key={s}
                onClick={() => setSousOnglet(s)}
                className={
                  s === sousOngletFormation
                    ? "-mb-px border-b-2 border-[var(--brand)] px-3 py-2 text-sm font-medium text-[var(--brand)]"
                    : "-mb-px border-b-2 border-transparent px-3 py-2 text-sm text-muted-foreground hover:text-foreground"
                }
              >
                {s}
              </button>
            ))}
          </div>

          {sousOngletFormation === "Modules" && (
            <Panel title="Progression par module" subtitle="Cliquer sur un module pour ouvrir le détail">
              <div className="space-y-2">
                {o.modules.map((m) => (
                  <button
                    key={m.code}
                    onClick={() => setModule(m.code)}
                    className="flex w-full items-center gap-3 rounded-sm border border-border p-3 text-left transition-colors hover:bg-[var(--hover)]"
                  >
                    <span
                      className={`num flex size-7 shrink-0 items-center justify-center rounded-sm text-[11px] font-semibold ${
                        m.statut === "Validé"
                          ? "bg-[color-mix(in_oklab,var(--success)_15%,transparent)] text-[var(--success)]"
                          : m.statut === "En cours"
                            ? "bg-[var(--brand-soft)] text-[var(--brand)]"
                            : m.statut === "Validé sous réserve"
                              ? "bg-[color-mix(in_oklab,var(--warning)_15%,transparent)] text-[var(--warning)]"
                              : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {m.code}
                    </span>
                    <span className="flex-1 text-sm font-medium">{m.nom}</span>
                    {m.score && <span className="num text-xs text-muted-foreground">{m.score} %</span>}
                    <StatutBadge valeur={m.statut} />
                    <ChevronRight className="size-4 text-muted-foreground" />
                  </button>
                ))}
              </div>
            </Panel>
          )}

          {sousOngletFormation === "Journal de formation" && (
            <div className="space-y-3">
              {o.journal.length === 0 && (
                <Panel><p className="text-sm text-muted-foreground">Aucune journée enregistrée : l'opérateur n'a pas encore démarré son parcours.</p></Panel>
              )}
              {o.journal.map((j) => (
                <div key={j.date} className="rounded-md border border-border bg-card p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="num rounded-sm bg-[var(--brand-soft)] px-2 py-0.5 text-xs font-semibold text-[var(--brand)]">
                      Jour {j.jour}
                    </span>
                    <span className="num text-xs text-muted-foreground">{j.date}</span>
                    <span className="text-sm font-medium">{j.module}</span>
                    <StatutBadge valeur={j.statut} />
                    <span className="num ml-auto text-sm font-semibold">{j.score} %</span>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-5">
                    <Field label="Formateur" value={j.formateur} />
                    <Field label="Présence" value={<StatutBadge valeur={j.presence} />} />
                    <Field label="Participation" value={j.participation} />
                    <Field label="Compréhension" value={j.comprehension} />
                    <Field label="Comportement" value={j.comportement} />
                  </div>
                  <p className="mt-3 text-sm">{j.observation}</p>
                  {j.actionCorrective && (
                    <p className="mt-2 rounded-sm border border-[color-mix(in_oklab,var(--warning)_35%,transparent)] bg-[color-mix(in_oklab,var(--warning)_10%,transparent)] px-3 py-2 text-xs">
                      Action corrective : {j.actionCorrective}
                    </p>
                  )}
                  {j.retardMin && (
                    <p className="mt-2 text-xs text-[var(--warning)]">Retard enregistré : {j.retardMin} minutes (répercuté sur la ponctualité).</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* 4. PRÉSENCE */}
      {section === SECTIONS[3] && (
        <div className="grid gap-4 xl:grid-cols-3">
          <Panel title="Indicateurs de présence" className="xl:col-span-1">
            <div className="grid grid-cols-2 gap-3">
              {[
                { l: "Taux de présence", v: `${o.presence} %` },
                { l: "Retards", v: String(o.presences.filter((p) => p.statut === "Retard").length) },
                { l: "Absences", v: String(o.presences.filter((p) => p.statut === "Absence").length) },
                { l: "Absences justifiées", v: "0" },
                { l: "Autorisations", v: "1" },
                { l: "Ponctualité", v: `${o.ponctualite} %` },
              ].map((k) => (
                <div key={k.l} className="rounded-sm border border-border p-2.5">
                  <p className="label-xs">{k.l}</p>
                  <p className="num mt-1 text-base font-semibold">{k.v}</p>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <p className="label-xs mb-2">Calendrier individuel — juillet 2026</p>
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: 31 }, (_, i) => i + 1).map((jour) => {
                  const p = o.presences.find((x) => x.date.startsWith(String(jour).padStart(2, "0")));
                  const couleur = !p
                    ? "bg-muted text-muted-foreground"
                    : p.statut === "Retard"
                      ? "bg-[var(--warning)] text-black"
                      : p.statut === "Absence"
                        ? "bg-[var(--critical)] text-white"
                        : p.statut === "Autorisation"
                          ? "bg-[var(--info)] text-white"
                          : "bg-[var(--success)] text-white";
                  return (
                    <span key={jour} className={`num flex h-7 items-center justify-center rounded-sm text-[10px] font-medium ${couleur}`}>
                      {jour}
                    </span>
                  );
                })}
              </div>
              <div className="mt-2 flex flex-wrap gap-2 text-[10px] text-muted-foreground">
                <span>■ Vert présent</span><span>■ Orange retard</span><span>■ Rouge absence</span><span>■ Bleu autorisation</span><span>■ Gris repos</span>
              </div>
            </div>
          </Panel>

          <Panel title="Détail des pointages" className="xl:col-span-2" bodyClassName="p-0">
            <Table>
              <thead>
                <tr><Th>Date</Th><Th>Shift</Th><Th>Entrée</Th><Th>Sortie</Th><Th>Statut</Th><Th>Retard</Th><Th>Justificatif</Th><Th>Impact formation</Th></tr>
              </thead>
              <tbody>
                {o.presences.map((p, i) => (
                  <Tr key={i}>
                    <Td className="num">{p.date}</Td>
                    <Td className="text-muted-foreground">{p.shift}</Td>
                    <Td className="num">{p.entree}</Td>
                    <Td className="num">{p.sortie}</Td>
                    <Td><StatutBadge valeur={p.statut} /></Td>
                    <Td className="num text-muted-foreground">{p.retard ?? "—"}</Td>
                    <Td className="text-muted-foreground">{p.justificatif ?? "—"}</Td>
                    <Td className="text-muted-foreground">{p.impact ?? "Aucun"}</Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
            <p className="border-t border-border px-4 py-2 text-[11px] text-muted-foreground">
              Une absence saisie ici alimente automatiquement le journal de formation, le taux de présence, le calcul de
              risque, la proposition de rattrapage et l'historique.
            </p>
          </Panel>
        </div>
      )}

      {/* 5. ÉVALUATIONS */}
      {section === SECTIONS[4] && (
        <div className="grid gap-4 xl:grid-cols-3">
          <Panel title="A — Tests & QCM" bodyClassName="p-0">
            <Table>
              <thead><tr><Th>Test</Th><Th>Score</Th><Th>Statut</Th><Th>Date</Th></tr></thead>
              <tbody>
                {o.tests.map((t) => (
                  <Tr key={t.nom}>
                    <Td className="font-medium">{t.nom}</Td>
                    <Td className="num">{t.score} %</Td>
                    <Td><StatutBadge valeur={t.statut} /></Td>
                    <Td className="num text-muted-foreground">{t.date}</Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
            <p className="border-t border-border px-4 py-2 text-xs">
              Score moyen des tests : <strong className="num">{moyenneTests} %</strong>
            </p>
          </Panel>

          <Panel title="B — Évaluations pratiques">
            <div className="space-y-4">
              {o.pratiques.map((p) => (
                <div key={p.nom}>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{p.nom}</span>
                    <span className="num text-sm">{p.note} / 5</span>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1.5">
                    {Object.entries(p.dimensions).map(([d, v]) => (
                      <div key={d} className="flex items-center gap-2">
                        <span className="w-24 text-[11px] text-muted-foreground">{d}</span>
                        <Barre valeur={(v / 5) * 100} />
                        <span className="num text-[11px]">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="C — Matrice de compétences">
            <div className="space-y-3">
              {o.competences.map((c) => (
                <div key={c.nom}>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium">{c.nom}</span>
                    <Tag ton={c.niveau >= 4 ? "success" : c.niveau >= 3 ? "brand" : "warning"}>{c.etat}</Tag>
                  </div>
                  <div className="mt-1.5 flex gap-1">
                    {[1, 2, 3, 4].map((n) => (
                      <span
                        key={n}
                        className={`h-2 flex-1 rounded-sm ${n <= c.niveau ? "bg-[var(--brand)]" : "bg-muted"}`}
                      />
                    ))}
                    <span className="num ml-2 text-[11px] text-muted-foreground">{c.niveau}/4</span>
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-4 text-[11px] text-muted-foreground">
              États : Non évaluée · En acquisition · Acquise · Maîtrisée
            </p>
          </Panel>
        </div>
      )}

      {/* 6. SUIVI */}
      {section === SECTIONS[5] && (
        <>
          <div className="mb-4 flex flex-wrap gap-2">
            {["Tous", "Observation", "Alerte", "Feedback", "Incident", "Réclamation", "Action corrective"].map((f) => (
              <button
                key={f}
                onClick={() => setFiltre(f)}
                className={
                  f === filtreEvt
                    ? "rounded-sm border border-[var(--brand)] bg-[var(--selected)] px-3 py-1.5 text-xs font-medium text-[var(--brand)]"
                    : "rounded-sm border border-border px-3 py-1.5 text-xs text-muted-foreground hover:bg-[var(--hover)]"
                }
              >
                {f}
              </button>
            ))}
            <Btn size="sm" variant="primary" className="ml-auto" onClick={() => setModale("observation")}>
              Ajouter une observation
            </Btn>
          </div>
          <div className="space-y-3">
            {evenements.map((e) => (
              <div key={e.id} className="rounded-md border border-border bg-card p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Tag ton={e.tonalite === "Positive" ? "success" : e.tonalite === "Critique" || e.tonalite === "Négative" ? "critical" : "info"}>
                    {e.type}
                  </Tag>
                  <span className="text-sm font-medium">{e.titre}</span>
                  {e.statut && <StatutBadge valeur={e.statut} />}
                  <span className="num ml-auto text-xs text-muted-foreground">{e.date} · {e.auteur}</span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{e.contenu}</p>
              </div>
            ))}
            {evenements.length === 0 && <Panel><p className="text-sm text-muted-foreground">Aucun événement pour ce filtre.</p></Panel>}
          </div>
        </>
      )}

      {/* 7. COMMUNICATIONS */}
      {section === SECTIONS[6] && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Panel
            title="Communications"
            action={<Btn size="sm" variant="secondary" onClick={() => setModale("message")}>Envoyer un message</Btn>}
            bodyClassName="p-0"
          >
            <Table>
              <thead><tr><Th>Date</Th><Th>Canal</Th><Th>Objet</Th><Th>Statut</Th></tr></thead>
              <tbody>
                {o.communications.map((c, i) => (
                  <Tr key={i}>
                    <Td className="num">{c.date}</Td>
                    <Td><Tag ton={c.canal === "WhatsApp" ? "success" : "info"}>{c.canal}</Tag></Td>
                    <Td>{c.objet}</Td>
                    <Td><StatutBadge valeur={c.statut} /></Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
          </Panel>
          <Panel title="Documents" bodyClassName="p-0">
            <Table>
              <thead><tr><Th>Document</Th><Th>Date</Th><Th>Statut</Th><Th>Expiration</Th></tr></thead>
              <tbody>
                {o.documents.map((d) => (
                  <Tr key={d.nom}>
                    <Td className="font-medium">{d.nom}</Td>
                    <Td className="num text-muted-foreground">{d.date}</Td>
                    <Td><StatutBadge valeur={d.statut} /></Td>
                    <Td className="num text-muted-foreground">{d.expiration ?? "—"}</Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
          </Panel>
        </div>
      )}

      {/* 8. ANALYSE & DÉCISION */}
      {section === SECTIONS[7] && (
        <div className="grid gap-4 xl:grid-cols-3">
          <Panel title="Worker Readiness Score" subtitle="Agrégation pondérée du parcours" className="xl:col-span-2">
            <div className="flex flex-wrap items-center gap-8">
              <div>
                <p className="num text-5xl font-semibold text-[var(--brand)]">{o.readiness.global}</p>
                <p className="text-xs text-muted-foreground">/ 100 · confiance IA {o.readiness.confiance} %</p>
                <div className="mt-2 flex gap-2">
                  <Tag ton="brand">{o.readiness.tendance}</Tag>
                  <RisqueBadge valeur={o.risque} />
                </div>
              </div>
              <div className="min-w-56 flex-1 space-y-2">
                {o.readiness.sous.map((s) => (
                  <div key={s.label} className="flex items-center gap-3">
                    <span className="w-36 text-xs text-muted-foreground">{s.label}</span>
                    <Barre valeur={s.valeur} ton={s.valeur >= 85 ? "success" : s.valeur >= 70 ? "brand" : "warning"} />
                    <span className="num w-8 text-right text-xs">{s.valeur}</span>
                  </div>
                ))}
              </div>
              <ResponsiveContainer width={260} height={220}>
                <RadarChart data={radar} outerRadius={80}>
                  <PolarGrid stroke="var(--border)" />
                  <PolarAngleAxis dataKey="critere" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} />
                  <Radar dataKey="valeur" stroke="var(--brand)" fill="var(--brand)" fillOpacity={0.25} />
                  <Tooltip contentStyle={tooltipStyle} />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div>
                <p className="label-xs">Points forts</p>
                <ul className="mt-2 space-y-1.5 text-sm">
                  {o.readiness.forts.map((f) => (
                    <li key={f} className="flex gap-2"><span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-[var(--success)]" />{f}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="label-xs">Points à surveiller</p>
                <ul className="mt-2 space-y-1.5 text-sm">
                  {o.readiness.surveiller.map((f) => (
                    <li key={f} className="flex gap-2"><span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-[var(--warning)]" />{f}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-4 rounded-sm border border-border bg-[var(--brand-soft)] p-3">
              <p className="label-xs">Recommandation Worker Readiness AI</p>
              <p className="mt-1.5 text-sm">{o.readiness.recommandation}</p>
            </div>
            <IAWarning texte="La recommandation IA constitue une aide à la décision et ne remplace pas la validation humaine." />
          </Panel>

          <Panel title="Panel de décision RH">
            <div className="space-y-2 text-xs">
              {[
                ["Formation", `${o.readiness.sous[0].valeur} %`],
                ["Présence", `${o.presence} %`],
                ["Compétences", `${o.readiness.sous[2].valeur} %`],
                ["Comportement", `${o.readiness.sous[4].valeur} %`],
                ["Risque", o.risque],
                ["Avis formateur", o.risque === "Faible" ? "Favorable" : "Réservé"],
                ["Avis responsable atelier", o.risque === "Faible" ? "Favorable" : "À arbitrer"],
                ["IA", o.risque === "Faible" ? "Confirmation recommandée" : "Prolongation recommandée"],
              ].map(([l, v]) => (
                <div key={l} className="flex items-center justify-between border-b border-border pb-1.5">
                  <span className="text-muted-foreground">{l}</span>
                  <span className="num font-medium">{v}</span>
                </div>
              ))}
            </div>
            {o.decision ? (
              <div className="mt-4 rounded-sm border border-border p-3 text-xs">
                <p className="label-xs">Décision enregistrée</p>
                <p className="mt-1 text-sm font-semibold">{o.decision.decision}</p>
                <p className="mt-1 text-muted-foreground">{o.decision.commentaire}</p>
                <p className="num mt-1 text-muted-foreground">{o.decision.responsable} · {o.decision.date}</p>
              </div>
            ) : (
              <Btn variant="primary" className="mt-4 w-full" onClick={() => setModale("decision")}>
                Prendre la décision finale
              </Btn>
            )}
          </Panel>
        </div>
      )}

      {/* 9. HISTORIQUE */}
      {section === SECTIONS[8] && (
        <Panel title="Audit trail" subtitle="Journal immuable des événements du dossier" bodyClassName="p-0">
          <Table>
            <thead>
              <tr><Th>Date</Th><Th>Heure</Th><Th>Utilisateur</Th><Th>Type</Th><Th>Action</Th><Th>Ancienne valeur</Th><Th>Nouvelle valeur</Th></tr>
            </thead>
            <tbody>
              {[...o.historique].reverse().map((h) => (
                <Tr key={h.id}>
                  <Td className="num">{h.date}</Td>
                  <Td className="num text-muted-foreground">{h.heure}</Td>
                  <Td>{h.utilisateur}</Td>
                  <Td><Tag ton="neutral">{h.type}</Tag></Td>
                  <Td>{h.action}</Td>
                  <Td className="text-muted-foreground">{h.avant}</Td>
                  <Td className="font-medium">{h.apres}</Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        </Panel>
      )}

      {/* Détail module */}
      {module && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setModule(null)}>
          <div className="w-full max-w-lg rounded-md border border-border bg-card p-5" onClick={(e) => e.stopPropagation()}>
            {(() => {
              const m = o.modules.find((x) => x.code === module)!;
              return (
                <>
                  <h3 className="text-sm font-semibold">Module {m.code} — {m.nom}</h3>
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <Field label="Statut" value={<StatutBadge valeur={m.statut} />} />
                    <Field label="Date" value={m.date ?? "À planifier"} />
                    <Field label="Formateur" value={m.formateur ?? o.formateur} />
                    <Field label="Durée" value="1 journée" />
                    <Field label="Présence" value={m.statut === "À venir" ? "—" : "Présente"} />
                    <Field label="Score" value={m.score ? `${m.score} %` : "—"} />
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">
                    {m.commentaire ?? "Aucun commentaire particulier du formateur sur ce module."}
                  </p>
                  <div className="mt-4 flex justify-end">
                    <Btn variant="secondary" onClick={() => setModule(null)}>Fermer</Btn>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* Modales d'action */}
      {modale && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setModale(null)}>
          <div className="w-full max-w-lg rounded-md border border-border bg-card p-5" onClick={(e) => e.stopPropagation()}>
            {modale === "observation" && (
              <>
                <h3 className="text-sm font-semibold">Ajouter une observation — {o.nom}</h3>
                <label className="mt-4 block text-xs">
                  Tonalité
                  <select
                    value={obs.tonalite}
                    onChange={(e) => setObs({ ...obs, tonalite: e.target.value })}
                    className="mt-1 h-9 w-full rounded-sm border border-border bg-card px-2 text-sm"
                  >
                    <option>Positive</option><option>Neutre</option><option>Négative</option>
                  </select>
                </label>
                <textarea
                  value={obs.texte}
                  onChange={(e) => setObs({ ...obs, texte: e.target.value })}
                  rows={4}
                  placeholder="Observation du formateur…"
                  className="mt-3 w-full rounded-sm border border-border bg-card p-2 text-sm"
                />
                <div className="mt-4 flex justify-end gap-2">
                  <Btn variant="ghost" onClick={() => setModale(null)}>Annuler</Btn>
                  <Btn
                    variant="primary"
                    disabled={!obs.texte.trim()}
                    onClick={() => {
                      ajouterEvenement(o.id, {
                        date: "28/07/2026",
                        type: "Observation",
                        auteur: o.formateur,
                        tonalite: obs.tonalite as never,
                        titre: "Observation formateur",
                        contenu: obs.texte,
                      });
                      setObs({ tonalite: "Positive", texte: "" });
                      setModale(null);
                    }}
                  >
                    Enregistrer
                  </Btn>
                </div>
              </>
            )}

            {modale === "absence" && (
              <>
                <h3 className="text-sm font-semibold">Saisir une absence ou un retard — {o.nom}</h3>
                <div className="mt-4 space-y-3 text-xs">
                  <label className="block">
                    Type
                    <select
                      value={abs.type}
                      onChange={(e) => setAbs({ ...abs, type: e.target.value })}
                      className="mt-1 h-9 w-full rounded-sm border border-border bg-card px-2 text-sm"
                    >
                      <option>Absence</option><option>Retard</option><option>Autorisation</option>
                    </select>
                  </label>
                  <label className="block">
                    Détail
                    <input
                      value={abs.detail}
                      onChange={(e) => setAbs({ ...abs, detail: e.target.value })}
                      className="mt-1 h-9 w-full rounded-sm border border-border bg-card px-2 text-sm"
                    />
                  </label>
                  <p className="text-muted-foreground">
                    La saisie met à jour la présence, le journal de formation, la ponctualité, le calcul de risque et
                    l'historique.
                  </p>
                </div>
                <div className="mt-4 flex justify-end gap-2">
                  <Btn variant="ghost" onClick={() => setModale(null)}>Annuler</Btn>
                  <Btn
                    variant="primary"
                    onClick={() => {
                      enregistrerPresence(o.id, abs.type as never, abs.detail);
                      setModale(null);
                    }}
                  >
                    Enregistrer
                  </Btn>
                </div>
              </>
            )}

            {modale === "evaluation" && (
              <>
                <h3 className="text-sm font-semibold">Évaluation de la journée — {o.nom}</h3>
                <label className="mt-4 flex items-center gap-3 text-xs">
                  Score du jour
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={evalJour.score}
                    onChange={(e) => setEval({ ...evalJour, score: Number(e.target.value) })}
                    className="flex-1 accent-[var(--brand)]"
                  />
                  <span className="num w-10 text-right font-semibold">{evalJour.score} %</span>
                </label>
                <textarea
                  value={evalJour.observation}
                  onChange={(e) => setEval({ ...evalJour, observation: e.target.value })}
                  rows={3}
                  placeholder="Observation du jour"
                  className="mt-3 w-full rounded-sm border border-border bg-card p-2 text-sm"
                />
                <div className="mt-4 flex justify-end gap-2">
                  <Btn variant="ghost" onClick={() => setModale(null)}>Annuler</Btn>
                  <Btn
                    variant="primary"
                    onClick={() => {
                      validerJournee(o.id, evalJour.score, evalJour.observation || "Journée validée par le formateur.");
                      setModale(null);
                    }}
                  >
                    Valider la journée
                  </Btn>
                </div>
              </>
            )}

            {modale === "message" && (
              <>
                <h3 className="text-sm font-semibold">Message à {o.nom}</h3>
                <select className="mt-3 h-9 w-full rounded-sm border border-border bg-card px-2 text-sm">
                  <option>WhatsApp</option><option>Email</option><option>Notification interne</option>
                </select>
                <textarea
                  rows={4}
                  defaultValue="Bonjour, votre évaluation pratique finale est planifiée le 31/07 à 08:30 en atelier A3."
                  className="mt-3 w-full rounded-sm border border-border bg-card p-2 text-sm"
                />
                <div className="mt-4 flex justify-end gap-2">
                  <Btn variant="ghost" onClick={() => setModale(null)}>Annuler</Btn>
                  <Btn
                    variant="primary"
                    onClick={() => {
                      pousserNotification({ titre: "Message envoyé", detail: `${o.nom} — WhatsApp distribué`, ton: "success" });
                      setModale(null);
                    }}
                  >
                    Envoyer
                  </Btn>
                </div>
              </>
            )}

            {modale === "affectation" && (
              <>
                <h3 className="text-sm font-semibold">Changer l'affectation — {o.nom}</h3>
                <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                  <label className="block">
                    Atelier
                    <select className="mt-1 h-9 w-full rounded-sm border border-border bg-card px-2 text-sm" defaultValue={o.atelier}>
                      <option>Câblage A</option><option>Câblage B</option><option>Ligne B2</option><option>Qualité Q1</option><option>Coupe C1</option>
                    </select>
                  </label>
                  <label className="block">
                    Groupe
                    <select className="mt-1 h-9 w-full rounded-sm border border-border bg-card px-2 text-sm" defaultValue={o.groupe}>
                      <option>CBL-07</option><option>CBL-08</option><option>QC-04</option><option>CUT-03</option><option>SEC-02</option>
                    </select>
                  </label>
                  <label className="col-span-2 block">
                    Parcours de formation
                    <select className="mt-1 h-9 w-full rounded-sm border border-border bg-card px-2 text-sm" defaultValue={o.parcours}>
                      <option>FOR-CBL-01</option><option>FOR-QC-01</option><option>FOR-CUT-01</option><option>FOR-SEC-01</option>
                    </select>
                  </label>
                </div>
                <div className="mt-4 flex justify-end gap-2">
                  <Btn variant="ghost" onClick={() => setModale(null)}>Annuler</Btn>
                  <Btn
                    variant="primary"
                    onClick={() => {
                      pousserNotification({ titre: "Affectation mise à jour", detail: `${o.nom} — planning communiqué automatiquement`, ton: "success" });
                      setModale(null);
                    }}
                  >
                    Appliquer et envoyer le planning
                  </Btn>
                </div>
              </>
            )}

            {modale === "decision" && (
              <>
                <h3 className="text-sm font-semibold">Décision finale — {o.nom}</h3>
                <div className="mt-4 space-y-3 text-xs">
                  <label className="block">
                    Décision
                    <select
                      value={dec.decision}
                      onChange={(e) => setDec({ ...dec, decision: e.target.value })}
                      className="mt-1 h-9 w-full rounded-sm border border-border bg-card px-2 text-sm"
                    >
                      {DECISIONS.map((d) => (
                        <option key={d}>{d}</option>
                      ))}
                    </select>
                  </label>
                  <label className="block">
                    Commentaire <span className="text-[var(--critical)]">*</span>
                    <textarea
                      value={dec.commentaire}
                      onChange={(e) => setDec({ ...dec, commentaire: e.target.value })}
                      rows={3}
                      className="mt-1 w-full rounded-sm border border-border bg-card p-2 text-sm"
                    />
                  </label>
                  {["RÉORIENTER", "SUSPENDRE", "ARRÊTER LE PARCOURS"].includes(dec.decision) && (
                    <label className="block">
                      Motif <span className="text-[var(--critical)]">*</span>
                      <input
                        value={dec.motif}
                        onChange={(e) => setDec({ ...dec, motif: e.target.value })}
                        className="mt-1 h-9 w-full rounded-sm border border-border bg-card px-2 text-sm"
                      />
                    </label>
                  )}
                  <p className="text-muted-foreground">Responsable : Nadia El Ghali · Date : 28/07/2026</p>
                </div>
                <div className="mt-4 flex justify-end gap-2">
                  <Btn variant="ghost" onClick={() => setModale(null)}>Annuler</Btn>
                  <Btn
                    variant="primary"
                    disabled={
                      !dec.commentaire.trim() ||
                      (["RÉORIENTER", "SUSPENDRE", "ARRÊTER LE PARCOURS"].includes(dec.decision) && !dec.motif.trim())
                    }
                    onClick={() => {
                      deciderParcours(o.id, dec.decision, dec.commentaire, dec.motif);
                      setModale(null);
                    }}
                  >
                    Enregistrer la décision
                  </Btn>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
