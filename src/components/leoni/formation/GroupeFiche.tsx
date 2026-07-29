import { Link } from "@tanstack/react-router";
import { Barre, Btn, Field, Modale, Stat, Table, Tag, Td, Th, Tr, Vide } from "@/components/leoni/kit";
import { formatLong } from "@/data/planning";
import type { GroupeDetail } from "@/lib/formation-store";
import { statutMetier, tonStatutMetier } from "./statuts";

export function GroupeFiche({
  groupe,
  onClose,
  onSuivi,
}: {
  groupe: GroupeDetail;
  onClose: () => void;
  onSuivi: () => void;
}) {
  return (
    <Modale
      large
      titre={`Groupe ${groupe.code}`}
      sousTitre={`${groupe.formation} · ${groupe.site} · ${groupe.participants.length} participants`}
      onClose={onClose}
      footer={
        <>
          <Btn size="sm" onClick={onClose}>
            Fermer
          </Btn>
          <Btn size="sm" variant="primary" onClick={onSuivi}>
            Saisir le suivi quotidien
          </Btn>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1 rounded-md border border-border p-3">
          <Field label="Formation" value={`${groupe.formationCode} — ${groupe.formation}`} />
          <Field label="Formateur référent" value={groupe.formateur} />
          <Field label="Site" value={groupe.site} />
          <Field label="Période" value={`${formatLong(groupe.debut)} → ${formatLong(groupe.fin)}`} />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Stat label="Participants" valeur={groupe.participants.length} />
          <Stat label="Capacité" valeur={groupe.capacite} />
          <Stat label="Sessions" valeur={groupe.sessions.length} />
          <Stat label="Avancement" valeur={`${groupe.progression} %`} ton="success" />
          <div className="col-span-2">
            <Barre valeur={groupe.progression} ton="brand" />
          </div>
        </div>
      </div>

      <p className="label-xs mt-4 mb-2">Sessions du groupe</p>
      <Table>
        <thead>
          <tr>
            <Th>Date</Th>
            <Th>Module</Th>
            <Th>Type</Th>
            <Th>Horaire</Th>
            <Th>Statut</Th>
          </tr>
        </thead>
        <tbody>
          {groupe.sessions.map((s) => (
            <Tr key={s.id}>
              <Td className="num">{formatLong(s.date)}</Td>
              <Td>{s.moduleNom}</Td>
              <Td className="text-muted-foreground">{s.type}</Td>
              <Td className="num">
                {s.debut} – {s.fin}
              </Td>
              <Td>
                <Tag ton={tonStatutMetier(statutMetier(s))}>{statutMetier(s)}</Tag>
              </Td>
            </Tr>
          ))}
        </tbody>
      </Table>

      <p className="label-xs mt-4 mb-2">Participants</p>
      <Table>
        <thead>
          <tr>
            <Th>Matricule</Th>
            <Th>Nom</Th>
            <Th>Poste</Th>
            <Th>Fiche</Th>
          </tr>
        </thead>
        <tbody>
          {groupe.participants.map((p) => (
            <Tr key={p.workerId}>
              <Td className="num text-xs text-[var(--brand)]">{p.workerId}</Td>
              <Td className="font-medium">{p.nom}</Td>
              <Td className="text-muted-foreground">{p.poste}</Td>
              <Td>
                <Link to="/ouvriers/$id" params={{ id: p.workerId }} className="text-xs text-[var(--brand)] hover:underline">
                  Fiche 360°
                </Link>
              </Td>
            </Tr>
          ))}
          {groupe.participants.length === 0 && (
            <tr>
              <td colSpan={4}>
                <Vide texte="Aucun participant rattaché." />
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </Modale>
  );
}
