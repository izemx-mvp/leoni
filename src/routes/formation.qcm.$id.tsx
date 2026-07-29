import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { Barre, Btn, Kpi, Onglets, PageHeader, Panel, StatutBadge, Table, Tag, Td, Th, Tr, Vide } from "@/components/leoni/kit";
import { AuditEvaluation } from "@/components/leoni/evaluations/Historique";
import { Rattrapages } from "@/components/leoni/evaluations/Rattrapages";
import { ResultatModale } from "@/components/leoni/evaluations/ResultatModale";
import { analyseQuestions, statsEvaluation, tonTaux, useEvaluations } from "@/lib/evaluations-store";
import { useLeoni } from "@/lib/leoni-store";
import { useState } from "react";

const ONGLETS = ["Vue d'ensemble", "Questions", "Participants", "Résultats", "Rattrapages", "Paramètres", "Historique"];

export const Route = createFileRoute("/formation/qcm/$id")({
  validateSearch: (s: Record<string, unknown>) => ({
    onglet: (typeof s.onglet === "string" && ONGLETS.includes(s.onglet) ? s.onglet : "Vue d'ensemble") as string,
  }),
  head: () => ({
    meta: [
      { title: "Détail de l'évaluation — LEONI Workforce Journey" },
      { name: "description", content: "Détail d'une évaluation LEONI : questions, participants, résultats, rattrapages, paramètres et audit." },
      { property: "og:title", content: "Détail de l'évaluation — LEONI Workforce Journey" },
      { property: "og:description", content: "Suivi complet d'une évaluation et de ses résultats." },
    ],
  }),
  component: DetailEvaluation,
});

function DetailEvaluation() {
  const { id } = Route.useParams();
  const { onglet } = Route.useSearch();
  const navigate = useNavigate();
  const { getEvaluation, publier, cloturer, relancer, prolonger, dupliquer, changerStatut } = useEvaluations();
  const { pousserNotification } = useLeoni();
  const [resultat, setResultat] = useState<string | null>(null);

  const e = getEvaluation(id);
  if (!e) {
    return (
      <Panel title="Évaluation introuvable">
        <Vide texte="Cette évaluation n'existe plus ou a été supprimée." />
        <Btn onClick={() => navigate({ to: "/formation/qcm", search: { onglet: "Toutes les évaluations" } })}>Retour à la liste</Btn>
      </Panel>
    );
  }

  const s = statsEvaluation(e);
  const analyse = analyseQuestions(e);
  const setOnglet = (v: string) => navigate({ to: "/formation/qcm/$id", params: { id }, search: { onglet: v } });
  const participant = e.participants.find((p) => p.resultId === resultat);

  return (
    <>
      <PageHeader
        titre={`${e.code} — ${e.titre}`}
        sousTitre={`${e.type} · ${e.formation} · ${e.module} · ${e.site} · ${e.questions.length} questions · ${e.duree} min · seuil ${e.seuil} %`}
        fil={[{ label: "Formation" }, { label: "Évaluations & QCM" }, { label: e.code }]}
        actions={
          <>
            <Btn onClick={() => { relancer(e.evaluationId); pousserNotification({ titre: "Rappel envoyé", detail: e.code, ton: "info" }); }}>Relancer</Btn>
            <Btn onClick={() => { const c = dupliquer(e.evaluationId); if (c) navigate({ to: "/formation/qcm/$id", params: { id: c.evaluationId }, search: { onglet: "Vue d'ensemble" } }); }}>Dupliquer</Btn>
            {e.statut === "Brouillon" || e.statut === "Programmé" ? (
              <Btn variant="primary" onClick={() => { publier(e.evaluationId); pousserNotification({ titre: "Évaluation publiée", detail: `${e.code} diffusée à ${s.affectes} participant(s)`, ton: "success" }); }}>
                Publier
              </Btn>
            ) : e.statut === "Ouvert" || e.statut === "En cours" ? (
              <Btn variant="primary" onClick={() => { cloturer(e.evaluationId); pousserNotification({ titre: "Session clôturée", detail: e.code, ton: "warning" }); }}>
                Clôturer la session
              </Btn>
            ) : (
              <Btn onClick={() => { changerStatut(e.evaluationId, "Archivé"); pousserNotification({ titre: "Évaluation archivée", detail: e.code, ton: "info" }); }}>
                Archiver
              </Btn>
            )}
          </>
        }
      />

      <Onglets valeurs={ONGLETS} actif={onglet} onChange={setOnglet} />

      {onglet === "Vue d'ensemble" && (
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            <Kpi label="Affectés" valeur={s.affectes} ton="brand" />
            <Kpi label="Terminés" valeur={s.termines} ton="info" />
            <Kpi label="Taux de participation" valeur={Math.round((s.termines / Math.max(1, s.affectes)) * 100)} suffixe="%" ton={tonTaux(Math.round((s.termines / Math.max(1, s.affectes)) * 100))} />
            <Kpi label="Taux de réussite" valeur={Math.round((s.reussis / Math.max(1, s.termines)) * 100)} suffixe="%" ton={tonTaux(Math.round((s.reussis / Math.max(1, s.termines)) * 100))} />
            <Kpi label="Score moyen" valeur={s.scoreMoyen} suffixe="%" ton={tonTaux(s.scoreMoyen)} />
          </div>
          <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
            <Panel title="Description & objectif pédagogique">
              <p className="text-sm text-muted-foreground">{e.description || "Aucune description renseignée."}</p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <Ligne label="Statut" valeur={<StatutBadge valeur={e.statut} />} />
                <Ligne label="Créateur" valeur={e.createur} />
                <Ligne label="Date de passage" valeur={`${e.datePassage} — ${e.ouverture} à ${e.fermeture}`} />
                <Ligne label="Compétence évaluée" valeur={e.competence} />
                <Ligne label="Langue / niveau" valeur={`${e.langue} · ${e.niveau}`} />
                <Ligne label="Tentatives" valeur={`${e.tentatives} autorisée(s)`} />
              </div>
            </Panel>
            <Panel title="Questions les plus échouées" subtitle="Taux de réussite par question">
              <ul className="space-y-3">
                {analyse.slice(0, 8).map((a) => (
                  <li key={a.questionId}>
                    <div className="mb-1 flex items-center justify-between gap-3 text-xs">
                      <span className="truncate">{a.numero}. {a.intitule}</span>
                      <span className="num font-medium">{a.taux} %</span>
                    </div>
                    <Barre valeur={a.taux} ton={tonTaux(a.taux)} />
                  </li>
                ))}
              </ul>
              {!analyse.length && <Vide texte="Aucune réponse enregistrée pour l'instant." />}
            </Panel>
          </div>
        </div>
      )}

      {onglet === "Questions" && (
        <Panel title={`Questions (${e.questions.length})`} subtitle={`Total ${e.questions.reduce((t, q) => t + q.points, 0)} point(s)`} bodyClassName="p-0">
          <Table>
            <thead>
              <tr><Th>#</Th><Th>Intitulé</Th><Th>Type</Th><Th>Catégorie</Th><Th>Compétence</Th><Th>Difficulté</Th><Th>Points</Th><Th>Bonne réponse</Th></tr>
            </thead>
            <tbody>
              {e.questions.map((q) => (
                <Tr key={q.questionId}>
                  <Td className="num text-xs">{q.numero}</Td>
                  <Td className="max-w-[320px]">{q.intitule}</Td>
                  <Td><Tag ton="info">{q.type}</Tag></Td>
                  <Td className="text-xs text-muted-foreground">{q.categorie}</Td>
                  <Td className="text-xs">{q.competence}</Td>
                  <Td><Tag ton={q.difficulte === "Difficile" ? "critical" : q.difficulte === "Moyenne" ? "warning" : "success"}>{q.difficulte}</Tag></Td>
                  <Td className="num text-xs">{q.points}</Td>
                  <Td className="text-xs text-[var(--success)]">{q.bonneReponse}</Td>
                </Tr>
              ))}
            </tbody>
          </Table>
          {!e.questions.length && <Vide texte="Aucune question dans cette évaluation." />}
        </Panel>
      )}

      {onglet === "Participants" && (
        <Panel title={`Participants (${e.participants.length})`} bodyClassName="p-0">
          <Table>
            <thead>
              <tr><Th>Ouvrier</Th><Th>Matricule</Th><Th>Site</Th><Th>Groupe</Th><Th>Notification</Th><Th>Statut</Th><Th>Progression</Th><Th>Tentative</Th></tr>
            </thead>
            <tbody>
              {e.participants.map((p) => (
                <Tr key={p.assignmentId}>
                  <Td className="font-medium">
                    <Link to="/ouvriers/$id" params={{ id: p.workerId }} className="hover:text-[var(--brand)]">{p.ouvrier}</Link>
                  </Td>
                  <Td className="num text-xs text-[var(--brand)]">{p.workerId}</Td>
                  <Td className="text-xs">{p.site}</Td>
                  <Td className="text-xs">{p.groupe}</Td>
                  <Td><Tag ton="info">{p.notification}</Tag></Td>
                  <Td><StatutBadge valeur={p.statut} /></Td>
                  <Td className="num text-xs">{p.progression ?? "—"}</Td>
                  <Td className="num text-xs">{p.tentative}</Td>
                </Tr>
              ))}
            </tbody>
          </Table>
          {!e.participants.length && <Vide texte="Aucun participant affecté." />}
        </Panel>
      )}

      {onglet === "Résultats" && (
        <Panel title="Résultats des participants" subtitle="Cliquez sur une ligne pour ouvrir la copie détaillée" bodyClassName="p-0">
          <Table>
            <thead>
              <tr><Th>Ouvrier</Th><Th>Matricule</Th><Th>Début</Th><Th>Fin</Th><Th>Durée</Th><Th>Score</Th><Th>Résultat</Th></tr>
            </thead>
            <tbody>
              {e.participants.filter((p) => p.score !== null).map((p) => (
                <Tr key={p.resultId} onClick={() => setResultat(p.resultId)} title="Ouvrir la copie">
                  <Td className="font-medium">{p.ouvrier}</Td>
                  <Td className="num text-xs text-[var(--brand)]">{p.workerId}</Td>
                  <Td className="num text-xs">{p.debut}</Td>
                  <Td className="num text-xs">{p.fin}</Td>
                  <Td className="num text-xs">{p.duree}</Td>
                  <Td className="num font-medium">{p.score} %</Td>
                  <Td><Tag ton={(p.score ?? 0) >= e.seuil ? "success" : "critical"}>{(p.score ?? 0) >= e.seuil ? "Réussi" : "Échoué"}</Tag></Td>
                </Tr>
              ))}
            </tbody>
          </Table>
          {!e.participants.some((p) => p.score !== null) && <Vide texte="Aucun résultat disponible pour l'instant." />}
        </Panel>
      )}

      {onglet === "Rattrapages" && <Rattrapages evaluationId={e.evaluationId} />}

      {onglet === "Paramètres" && (
        <Panel title="Paramètres de passage">
          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
            <Ligne label="Durée" valeur={`${e.duree} minutes`} />
            <Ligne label="Seuil de réussite" valeur={`${e.seuil} %`} />
            <Ligne label="Tentatives autorisées" valeur={`${e.tentatives}`} />
            <Ligne label="Ordre des questions aléatoire" valeur={e.ordreQuestionsAleatoire ? "Oui" : "Non"} />
            <Ligne label="Ordre des réponses aléatoire" valeur={e.ordreReponsesAleatoire ? "Oui" : "Non"} />
            <Ligne label="Résultat immédiat" valeur={e.resultatImmediat ? "Oui" : "Non"} />
            <Ligne label="Afficher les bonnes réponses" valeur={e.afficherBonnesReponses ? "Oui" : "Non"} />
            <Ligne label="Retour en arrière" valeur={e.retourArriere ? "Autorisé" : "Bloqué"} />
            <Ligne label="Plein écran obligatoire" valeur={e.pleinEcran ? "Oui" : "Non"} />
            <Ligne label="Correction automatique" valeur={e.validationAuto ? "Oui" : "Manuelle"} />
            <Ligne label="Rappels" valeur={e.rappels.join(" · ") || "—"} />
            <Ligne label="Canaux" valeur={e.canaux.join(", ")} />
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Btn onClick={() => { prolonger(e.evaluationId, "18:00"); pousserNotification({ titre: "Délai prolongé", detail: `${e.code} — fermeture repoussée à 18:00`, ton: "info" }); }}>
              Prolonger le délai
            </Btn>
          </div>
        </Panel>
      )}

      {onglet === "Historique" && <AuditEvaluation evaluationId={e.evaluationId} />}

      {participant && <ResultatModale evaluation={e} participant={participant} onClose={() => setResultat(null)} />}
    </>
  );
}

function Ligne({ label, valeur }: { label: string; valeur: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-sm border border-border px-3 py-2">
      <span className="label-xs">{label}</span>
      <span className="text-sm font-medium">{valeur}</span>
    </div>
  );
}
