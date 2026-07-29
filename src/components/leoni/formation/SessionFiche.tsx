import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Barre, Btn, Field, Modale, Onglets, Stat, Table, Tag, Td, Th, Tr, Vide } from "@/components/leoni/kit";
import {
  dureeTexte,
  formatLong,
  formateurParId,
  salleParId,
  type SessionPlanning,
} from "@/data/planning";
import { actionsPlanning } from "@/lib/planning-store";
import { progressionSession } from "@/lib/formation-store";
import { statutMetier, tonStatutMetier } from "./statuts";

const ONGLETS = ["Informations", "Participants", "Présence", "Évaluations", "Observations", "Journal"];

export function SessionFiche({
  session,
  onClose,
  onAction,
}: {
  session: SessionPlanning;
  onClose: () => void;
  onAction: (message: string) => void;
}) {
  const [onglet, setOnglet] = useState(ONGLETS[0]);
  const formateur = formateurParId(session.formateurId);
  const salle = salleParId(session.salleId);
  const metier = statutMetier(session);
  const presents = session.presencesSaisies;
  const total = session.participants.length;

  return (
    <Modale
      large
      titre={`${session.formationNom} — ${session.moduleNom}`}
      sousTitre={`${session.id} · ${formatLong(session.date)} · ${session.debut}–${session.fin} · ${session.groupe}`}
      onClose={onClose}
      footer={
        <>
          <Btn size="sm" onClick={onClose}>
            Fermer
          </Btn>
          <Btn
            size="sm"
            onClick={() => {
              actionsPlanning.dupliquer(session.id);
              onAction(`Session ${session.id} dupliquée`);
            }}
          >
            Dupliquer
          </Btn>
          <Btn
            size="sm"
            onClick={() => {
              actionsPlanning.changerStatut(session.id, "Reportée");
              onAction(`Session ${session.id} suspendue`);
            }}
          >
            Suspendre
          </Btn>
          <Btn
            size="sm"
            variant="primary"
            onClick={() => {
              actionsPlanning.changerStatut(session.id, "Terminée");
              onAction(`Session ${session.id} clôturée`);
              onClose();
            }}
          >
            Clôturer la session
          </Btn>
        </>
      }
    >
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <Tag ton={tonStatutMetier(metier)}>{metier}</Tag>
        <Tag ton="neutral">{session.type}</Tag>
        <Tag ton="info">{session.site}</Tag>
        <span className="ml-auto text-[11px] text-muted-foreground">
          Avancement {progressionSession(session)} %
        </span>
      </div>

      <Onglets valeurs={ONGLETS} actif={onglet} onChange={setOnglet} />

      {onglet === "Informations" && (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1 rounded-md border border-border p-3">
            <Field label="Formation" value={`${session.formationCode} — ${session.formationNom}`} />
            <Field label="Module" value={session.moduleNom} />
            <Field label="Durée" value={dureeTexte(session)} />
            <Field label="Groupe" value={session.groupe} />
            <Field label="Capacité" value={`${total} / ${session.capacite}`} />
          </div>
          <div className="space-y-1 rounded-md border border-border p-3">
            <Field label="Formateur" value={formateur?.nom ?? "—"} />
            <Field label="Salle" value={`${salle?.nom ?? "—"} · ${session.batiment}`} />
            <Field label="Site" value={session.site} />
            <Field label="Convocations" value={`${session.notifications.envoyees} envoyées · ${session.notifications.lues} lues`} />
          </div>
          <div className="rounded-md border border-border p-3 sm:col-span-2">
            <p className="label-xs">Instructions aux participants</p>
            <p className="mt-1 text-sm">{session.instructions}</p>
            <p className="label-xs mt-3">Matériel requis</p>
            <p className="mt-1 text-sm">{session.materiel}</p>
          </div>
        </div>
      )}

      {onglet === "Participants" && (
        <Table>
          <thead>
            <tr>
              <Th>Matricule</Th>
              <Th>Nom</Th>
              <Th>Poste</Th>
              <Th>Statut convocation</Th>
              <Th>Fiche</Th>
            </tr>
          </thead>
          <tbody>
            {session.participants.map((p) => (
              <Tr key={p.workerId}>
                <Td className="num text-xs text-[var(--brand)]">{p.workerId}</Td>
                <Td className="font-medium">{p.nom}</Td>
                <Td className="text-muted-foreground">{p.poste}</Td>
                <Td>
                  <Tag ton={p.statut === "Confirmé" || p.statut === "Lu" ? "success" : p.statut === "Absent prévu" ? "critical" : "info"}>
                    {p.statut}
                  </Tag>
                </Td>
                <Td>
                  <Link to="/ouvriers/$id" params={{ id: p.workerId }} className="text-xs text-[var(--brand)] hover:underline">
                    Ouvrir la fiche 360°
                  </Link>
                </Td>
              </Tr>
            ))}
            {total === 0 && (
              <tr>
                <td colSpan={5}>
                  <Vide texte="Aucun participant affecté à cette session." />
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      )}

      {onglet === "Présence" && (
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-4">
            <Stat label="Présences saisies" valeur={`${presents} / ${total}`} />
            <Stat label="Taux de présence" valeur={`${total ? Math.round((presents / total) * 100) : 0} %`} ton="success" />
            <Stat label="Retards" valeur={Math.max(0, Math.round(total * 0.08))} />
            <Stat label="Absences" valeur={Math.max(0, total - presents)} ton="critical" />
          </div>
          <Barre valeur={total ? Math.round((presents / total) * 100) : 0} ton="success" />
          <Btn size="sm" variant="primary" onClick={() => onAction(`Feuille de présence ouverte — ${session.groupe}`)}>
            Saisir la feuille de présence
          </Btn>
        </div>
      )}

      {onglet === "Évaluations" && (
        <div className="grid gap-3 sm:grid-cols-3">
          <Stat label="Évaluations saisies" valeur={`${session.evaluationsSaisies} / ${total}`} />
          <Stat label="Type" valeur={session.type} />
          <Stat label="Observations" valeur={session.observations} />
          <div className="sm:col-span-3">
            <Link to="/formation/qcm" search={{ onglet: "Résultats" }} className="text-xs text-[var(--brand)] hover:underline">
              Voir les résultats QCM liés au groupe {session.groupe}
            </Link>
          </div>
        </div>
      )}

      {onglet === "Observations" && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">
            {session.observations} observation(s) formateur enregistrée(s) pour cette session.
          </p>
          <Link to="/formation/qualite" search={{ onglet: "Observations" }} className="text-xs text-[var(--brand)] hover:underline">
            Ouvrir le suivi & qualité
          </Link>
        </div>
      )}

      {onglet === "Journal" && (
        <ul className="space-y-2">
          {session.journal.map((j, i) => (
            <li key={i} className="rounded-sm border border-border px-3 py-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-medium">{j.action}</span>
                <span className="num text-muted-foreground">{j.horodatage}</span>
              </div>
              {j.detail && <p className="mt-0.5 text-muted-foreground">{j.detail}</p>}
              <p className="mt-0.5 text-muted-foreground">Par {j.auteur}</p>
            </li>
          ))}
          {session.journal.length === 0 && <Vide texte="Aucune entrée de journal." />}
        </ul>
      )}
    </Modale>
  );
}
