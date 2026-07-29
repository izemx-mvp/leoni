import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Barre,
  Btn,
  Kpi,
  PageHeader,
  Panel,
  ProgressionCell,
  Select,
  Stat,
  Table,
  Tag,
  Td,
  Th,
  Tr,
  Vide,
} from "@/components/leoni/kit";
import { OUVRIERS, SITES } from "@/data/leoni";
import { FORMATIONS_PLANNING, formateurParId, formatLong, salleParId, TYPES_SESSION } from "@/data/planning";
import { useSessions } from "@/lib/planning-store";
import { groupesDepuisSessions, progressionSession, useFormation } from "@/lib/formation-store";
import { useLeoni } from "@/lib/leoni-store";
import { SessionFiche } from "@/components/leoni/formation/SessionFiche";
import { GroupeFiche } from "@/components/leoni/formation/GroupeFiche";
import { SuiviQuotidien } from "@/components/leoni/formation/SuiviQuotidien";
import { STATUTS_METIER, statutMetier, tonStatutMetier } from "@/components/leoni/formation/statuts";
import { Onglets } from "@/components/leoni/kit";

const ONGLETS = ["Vue d'ensemble", "Sessions", "Groupes", "Participants", "Suivi quotidien", "Sessions clôturées"] as const;

export const Route = createFileRoute("/formation/sessions")({
  validateSearch: (s: Record<string, unknown>) => ({
    onglet: (typeof s.onglet === "string" && (ONGLETS as readonly string[]).includes(s.onglet)
      ? s.onglet
      : "Vue d'ensemble") as string,
  }),
  head: () => ({
    meta: [
      { title: "Sessions & suivi — LEONI Workforce Journey" },
      {
        name: "description",
        content:
          "Pilotage des sessions de formation LEONI : vue d'ensemble, sessions, groupes, participants, suivi quotidien du formateur et sessions clôturées.",
      },
      { property: "og:title", content: "Sessions & suivi — LEONI Workforce Journey" },
      { property: "og:description", content: "Sessions, groupes, participants et suivi quotidien des opérateurs en formation." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SessionsPage,
});

function SessionsPage() {
  const { onglet } = Route.useSearch();
  const navigate = useNavigate();
  const setOnglet = (v: string) => navigate({ to: "/formation/sessions", search: { onglet: v } });
  const { pousserNotification } = useLeoni();
  const sessions = useSessions();
  const { suivis, actions } = useFormation();

  const [site, setSite] = useState("Tous les sites");
  const [formation, setFormation] = useState("Toutes les formations");
  const [statut, setStatut] = useState("Tous les statuts");
  const [type, setType] = useState("Tous les types");
  const [recherche, setRecherche] = useState("");
  const [sessionOuverte, setSessionOuverte] = useState<string | null>(null);
  const [groupeOuvert, setGroupeOuvert] = useState<string | null>(null);

  const notifier = (message: string) => pousserNotification({ titre: "Formation", detail: message, ton: "success" });

  const groupes = useMemo(() => groupesDepuisSessions(sessions), [sessions]);

  const filtrees = sessions.filter((s) => {
    const q = recherche.trim().toLowerCase();
    return (
      (site === "Tous les sites" || s.site === site) &&
      (formation === "Toutes les formations" || s.formationNom === formation) &&
      (statut === "Tous les statuts" || statutMetier(s) === statut) &&
      (type === "Tous les types" || s.type === type) &&
      (q === "" ||
        [s.id, s.groupe, s.moduleNom, s.formationNom, formateurParId(s.formateurId)?.nom ?? ""]
          .join(" ")
          .toLowerCase()
          .includes(q))
    );
  });

  const enCours = sessions.filter((s) => s.statut === "En cours");
  const aVenir = sessions.filter((s) => ["Planifiée", "Confirmée", "À confirmer"].includes(s.statut));
  const cloturees = sessions.filter((s) => s.statut === "Terminée");
  const participantsTotal = new Set(sessions.flatMap((s) => s.participants.map((p) => p.workerId))).size;
  const presenceMoyenne = Math.round(
    (sessions.reduce((a, s) => a + s.presencesSaisies, 0) /
      Math.max(1, sessions.reduce((a, s) => a + s.participants.length, 0))) *
      100,
  );

  const session = sessions.find((s) => s.id === sessionOuverte) ?? null;
  const groupe = groupes.find((g) => g.code === groupeOuvert) ?? null;

  return (
    <>
      <PageHeader
        titre="Sessions & suivi"
        sousTitre="Sessions, groupes, participants et suivi quotidien des formations — un seul espace de pilotage"
        fil={[{ label: "Formation" }, { label: "Sessions & suivi" }]}
        actions={
          <>
            <Btn onClick={() => setOnglet("Suivi quotidien")}>Suivi quotidien</Btn>
            <Btn variant="primary" onClick={() => navigate({ to: "/formation/planning" })}>
              + Créer une session
            </Btn>
          </>
        }
      />

      <Onglets valeurs={[...ONGLETS]} actif={onglet} onChange={setOnglet} />

      {onglet === "Vue d'ensemble" && (
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            <Kpi label="Sessions en cours" valeur={enCours.length} ton="info" />
            <Kpi label="Sessions à venir" valeur={aVenir.length} ton="brand" />
            <Kpi label="Groupes actifs" valeur={groupes.filter((g) => g.statut !== "Clôturé").length} ton="neutral" />
            <Kpi label="Participants en formation" valeur={participantsTotal} ton="success" />
            <Kpi label="Présence moyenne" valeur={presenceMoyenne} suffixe="%" ton="success" />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Panel title="Sessions du jour et à venir" subtitle="7 prochaines sessions" bodyClassName="p-0">
              <Table>
                <thead>
                  <tr>
                    <Th>Date</Th>
                    <Th>Formation / module</Th>
                    <Th>Groupe</Th>
                    <Th>Formateur</Th>
                    <Th>Statut</Th>
                  </tr>
                </thead>
                <tbody>
                  {[...aVenir, ...enCours]
                    .sort((a, b) => a.date.localeCompare(b.date))
                    .slice(0, 7)
                    .map((s) => (
                      <Tr key={s.id} onDoubleClick={() => setSessionOuverte(s.id)} title="Double-cliquer pour ouvrir la session">
                        <Td className="num">{formatLong(s.date)}</Td>
                        <Td>
                          <span className="font-medium">{s.moduleNom}</span>
                          <span className="block text-[11px] text-muted-foreground">{s.formationNom}</span>
                        </Td>
                        <Td>{s.groupe}</Td>
                        <Td className="text-muted-foreground">{formateurParId(s.formateurId)?.nom}</Td>
                        <Td>
                          <Tag ton={tonStatutMetier(statutMetier(s))}>{statutMetier(s)}</Tag>
                        </Td>
                      </Tr>
                    ))}
                </tbody>
              </Table>
            </Panel>

            <Panel title="Points de contrôle du jour" subtitle="Complétude du suivi opérationnel">
              <ul className="space-y-2 text-sm">
                <li className="flex items-center justify-between rounded-sm border border-border px-3 py-2">
                  Feuilles de présence saisies
                  <Tag ton="success">
                    {sessions.reduce((a, s) => a + (s.presencesSaisies > 0 ? 1 : 0), 0)} / {sessions.length}
                  </Tag>
                </li>
                <li className="flex items-center justify-between rounded-sm border border-border px-3 py-2">
                  Évaluations du jour validées
                  <Tag ton="warning">
                    {sessions.reduce((a, s) => a + (s.evaluationsSaisies > 0 ? 1 : 0), 0)} / {sessions.length}
                  </Tag>
                </li>
                <li className="flex items-center justify-between rounded-sm border border-border px-3 py-2">
                  Observations formateur saisies
                  <Tag ton="info">{sessions.reduce((a, s) => a + s.observations, 0)}</Tag>
                </li>
                <li className="flex items-center justify-between rounded-sm border border-border px-3 py-2">
                  Suivis quotidiens enregistrés
                  <Tag ton="brand">{suivis.length}</Tag>
                </li>
                <li className="flex items-center justify-between rounded-sm border border-border px-3 py-2">
                  Actions correctives ouvertes
                  <Tag ton="critical">{actions.filter((a) => !["Terminée", "Annulée"].includes(a.statut)).length}</Tag>
                </li>
              </ul>
            </Panel>
          </div>

          <Panel title="Avancement des groupes" bodyClassName="p-0">
            <Table>
              <thead>
                <tr>
                  <Th>Groupe</Th>
                  <Th>Formation</Th>
                  <Th>Site</Th>
                  <Th>Formateur</Th>
                  <Th>Participants</Th>
                  <Th>Avancement</Th>
                  <Th>Statut</Th>
                </tr>
              </thead>
              <tbody>
                {groupes.map((g) => (
                  <Tr key={g.code} onDoubleClick={() => setGroupeOuvert(g.code)} title="Double-cliquer pour ouvrir le groupe">
                    <Td className="num font-medium text-[var(--brand)]">{g.code}</Td>
                    <Td>{g.formation}</Td>
                    <Td className="text-muted-foreground">{g.site}</Td>
                    <Td className="text-muted-foreground">{g.formateur}</Td>
                    <Td className="num">{g.participants.length}</Td>
                    <Td>
                      <ProgressionCell valeur={g.progression} />
                    </Td>
                    <Td>
                      <Tag ton={g.statut === "En cours" ? "info" : g.statut === "Clôturé" ? "success" : "neutral"}>{g.statut}</Tag>
                    </Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
          </Panel>
        </div>
      )}

      {(onglet === "Sessions" || onglet === "Sessions clôturées") && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <input
              value={recherche}
              onChange={(e) => setRecherche(e.target.value)}
              placeholder="Rechercher une session, un groupe, un formateur…"
              className="h-9 w-72 rounded-sm border border-border bg-card px-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]"
            />
            <Select value={site} onChange={setSite} options={["Tous les sites", ...SITES]} />
            <Select
              value={formation}
              onChange={setFormation}
              options={["Toutes les formations", ...FORMATIONS_PLANNING.map((f) => f.nom)]}
            />
            <Select value={type} onChange={setType} options={["Tous les types", ...TYPES_SESSION]} />
            {onglet === "Sessions" && (
              <Select value={statut} onChange={setStatut} options={["Tous les statuts", ...STATUTS_METIER]} />
            )}
            <span className="ml-auto text-xs text-muted-foreground">
              {(onglet === "Sessions" ? filtrees : filtrees.filter((s) => s.statut === "Terminée")).length} session(s)
            </span>
          </div>

          <Panel
            title={onglet === "Sessions" ? "Toutes les sessions" : "Sessions clôturées"}
            subtitle="Double-cliquer sur une ligne pour ouvrir la fiche session"
            bodyClassName="p-0"
          >
            <Table>
              <thead>
                <tr>
                  <Th>Session</Th>
                  <Th>Date</Th>
                  <Th>Horaire</Th>
                  <Th>Formation / module</Th>
                  <Th>Type</Th>
                  <Th>Groupe</Th>
                  <Th>Formateur</Th>
                  <Th>Salle</Th>
                  <Th>Participants</Th>
                  <Th>Avancement</Th>
                  <Th>Statut</Th>
                  <Th>Action</Th>
                </tr>
              </thead>
              <tbody>
                {(onglet === "Sessions" ? filtrees : filtrees.filter((s) => s.statut === "Terminée")).map((s) => (
                  <Tr key={s.id} onDoubleClick={() => setSessionOuverte(s.id)} title="Double-cliquer pour ouvrir la fiche session">
                    <Td className="num text-xs text-[var(--brand)]">{s.id}</Td>
                    <Td className="num">{formatLong(s.date)}</Td>
                    <Td className="num">
                      {s.debut} – {s.fin}
                    </Td>
                    <Td>
                      <span className="font-medium">{s.moduleNom}</span>
                      <span className="block text-[11px] text-muted-foreground">{s.formationNom}</span>
                    </Td>
                    <Td className="text-muted-foreground">{s.type}</Td>
                    <Td>{s.groupe}</Td>
                    <Td className="text-muted-foreground">{formateurParId(s.formateurId)?.nom}</Td>
                    <Td className="text-muted-foreground">{salleParId(s.salleId)?.nom}</Td>
                    <Td className="num">
                      {s.participants.length} / {s.capacite}
                    </Td>
                    <Td>
                      <div className="w-16">
                        <Barre valeur={progressionSession(s)} ton="brand" />
                      </div>
                    </Td>
                    <Td>
                      <Tag ton={tonStatutMetier(statutMetier(s))}>{statutMetier(s)}</Tag>
                    </Td>
                    <Td>
                      <Btn size="sm" onClick={() => setSessionOuverte(s.id)}>
                        Ouvrir
                      </Btn>
                    </Td>
                  </Tr>
                ))}
                {filtrees.length === 0 && (
                  <tr>
                    <td colSpan={12}>
                      <Vide texte="Aucune session ne correspond aux filtres." />
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </Panel>

          {onglet === "Sessions clôturées" && (
            <div className="grid gap-3 sm:grid-cols-4">
              <Stat label="Sessions clôturées" valeur={cloturees.length} ton="success" />
              <Stat label="Heures dispensées" valeur={cloturees.length * 2} />
              <Stat
                label="Participants formés"
                valeur={new Set(cloturees.flatMap((s) => s.participants.map((p) => p.workerId))).size}
              />
              <Stat label="Observations recueillies" valeur={cloturees.reduce((a, s) => a + s.observations, 0)} />
            </div>
          )}
        </div>
      )}

      {onglet === "Groupes" && (
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Kpi label="Groupes" valeur={groupes.length} ton="brand" />
            <Kpi label="En cours" valeur={groupes.filter((g) => g.statut === "En cours").length} ton="info" />
            <Kpi label="À venir" valeur={groupes.filter((g) => g.statut === "À venir").length} ton="neutral" />
            <Kpi label="Clôturés" valeur={groupes.filter((g) => g.statut === "Clôturé").length} ton="success" />
          </div>
          <Panel title="Groupes de formation" subtitle="Double-cliquer pour ouvrir la fiche groupe" bodyClassName="p-0">
            <Table>
              <thead>
                <tr>
                  <Th>Code</Th>
                  <Th>Formation</Th>
                  <Th>Site</Th>
                  <Th>Formateur référent</Th>
                  <Th>Période</Th>
                  <Th>Sessions</Th>
                  <Th>Participants</Th>
                  <Th>Avancement</Th>
                  <Th>Statut</Th>
                  <Th>Action</Th>
                </tr>
              </thead>
              <tbody>
                {groupes.map((g) => (
                  <Tr key={g.code} onDoubleClick={() => setGroupeOuvert(g.code)}>
                    <Td className="num font-medium text-[var(--brand)]">{g.code}</Td>
                    <Td>{g.formation}</Td>
                    <Td className="text-muted-foreground">{g.site}</Td>
                    <Td className="text-muted-foreground">{g.formateur}</Td>
                    <Td className="num text-xs">
                      {formatLong(g.debut)} → {formatLong(g.fin)}
                    </Td>
                    <Td className="num">{g.sessions.length}</Td>
                    <Td className="num">
                      {g.participants.length} / {g.capacite}
                    </Td>
                    <Td>
                      <ProgressionCell valeur={g.progression} />
                    </Td>
                    <Td>
                      <Tag ton={g.statut === "En cours" ? "info" : g.statut === "Clôturé" ? "success" : "neutral"}>{g.statut}</Tag>
                    </Td>
                    <Td>
                      <Btn size="sm" onClick={() => setGroupeOuvert(g.code)}>
                        Ouvrir
                      </Btn>
                    </Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
          </Panel>
        </div>
      )}

      {onglet === "Participants" && <ParticipantsTab />}

      {onglet === "Suivi quotidien" && (
        <SuiviQuotidien groupes={groupes} groupeInitial={groupeOuvert ?? undefined} onAction={notifier} />
      )}

      {session && <SessionFiche session={session} onClose={() => setSessionOuverte(null)} onAction={notifier} />}
      {groupe && (
        <GroupeFiche
          groupe={groupe}
          onClose={() => setGroupeOuvert(null)}
          onSuivi={() => {
            setGroupeOuvert(null);
            setOnglet("Suivi quotidien");
          }}
        />
      )}
    </>
  );
}

function ParticipantsTab() {
  const navigate = useNavigate();
  const [groupe, setGroupe] = useState("Tous les groupes");
  const [risque, setRisque] = useState("Tous les risques");
  const [recherche, setRecherche] = useState("");

  const groupes = [...new Set(OUVRIERS.map((o) => o.groupe))];
  const liste = OUVRIERS.filter(
    (o) =>
      (groupe === "Tous les groupes" || o.groupe === groupe) &&
      (risque === "Tous les risques" || o.risque === risque) &&
      (recherche === "" || `${o.nom} ${o.id}`.toLowerCase().includes(recherche.toLowerCase())),
  );

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label="Participants suivis" valeur={liste.length} ton="brand" />
        <Kpi
          label="Progression moyenne"
          valeur={Math.round(liste.reduce((a, o) => a + o.progression, 0) / Math.max(1, liste.length))}
          suffixe="%"
          ton="info"
        />
        <Kpi
          label="Présence moyenne"
          valeur={Math.round(liste.reduce((a, o) => a + o.presence, 0) / Math.max(1, liste.length))}
          suffixe="%"
          ton="success"
        />
        <Kpi label="À risque élevé" valeur={liste.filter((o) => o.risque === "Élevé").length} ton="critical" />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <input
          value={recherche}
          onChange={(e) => setRecherche(e.target.value)}
          placeholder="Rechercher un participant…"
          className="h-9 w-64 rounded-sm border border-border bg-card px-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]"
        />
        <Select value={groupe} onChange={setGroupe} options={["Tous les groupes", ...groupes]} />
        <Select value={risque} onChange={setRisque} options={["Tous les risques", "Faible", "Moyen", "Élevé"]} />
        <span className="ml-auto text-xs text-muted-foreground">{liste.length} participant(s)</span>
      </div>

      <Panel title="Participants en formation" subtitle="Double-cliquer pour ouvrir la fiche ouvrier 360°" bodyClassName="p-0">
        <Table>
          <thead>
            <tr>
              <Th>Matricule</Th>
              <Th>Nom</Th>
              <Th>Groupe</Th>
              <Th>Parcours</Th>
              <Th>Jour</Th>
              <Th>Progression</Th>
              <Th>Score</Th>
              <Th>Présence</Th>
              <Th>Risque</Th>
              <Th>Prochaine action</Th>
            </tr>
          </thead>
          <tbody>
            {liste.map((o) => (
              <Tr key={o.id} onDoubleClick={() => navigate({ to: "/ouvriers/$id", params: { id: o.id } })}>
                <Td className="num text-xs text-[var(--brand)]">{o.id}</Td>
                <Td className="font-medium">{o.nom}</Td>
                <Td>{o.groupe}</Td>
                <Td className="text-muted-foreground">{o.parcoursLibelle}</Td>
                <Td className="num">
                  {o.jour} / {o.jourTotal}
                </Td>
                <Td>
                  <ProgressionCell valeur={o.progression} />
                </Td>
                <Td className="num">{o.score} %</Td>
                <Td className="num">{o.presence} %</Td>
                <Td>
                  <Tag ton={o.risque === "Élevé" ? "critical" : o.risque === "Moyen" ? "warning" : "success"}>{o.risque}</Tag>
                </Td>
                <Td className="text-muted-foreground">{o.prochaineAction}</Td>
              </Tr>
            ))}
          </tbody>
        </Table>
      </Panel>
    </div>
  );
}
