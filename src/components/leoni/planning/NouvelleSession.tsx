import { useState } from "react";
import { Btn, Champ, Input, Modale, Tag, Textarea } from "@/components/leoni/kit";
import {
  FORMATEURS,
  FORMATIONS_PLANNING,
  GROUPES,
  SALLES,
  TYPES_SESSION,
  formateurParId,
  salleParId,
  type SessionPlanning,
} from "@/data/planning";
import { actionsPlanning, detecterConflits } from "@/lib/planning-store";

export function NouvelleSession({
  sessions,
  initial,
  onClose,
  onCree,
}: {
  sessions: SessionPlanning[];
  initial?: { date: string; debut: string };
  onClose: () => void;
  onCree: (message: string) => void;
}) {
  const [formation, setFormation] = useState(FORMATIONS_PLANNING[0]);
  const [moduleNom, setModuleNom] = useState(FORMATIONS_PLANNING[0].modules[0]);
  const [type, setType] = useState<string>("Théorie");
  const [date, setDate] = useState(initial?.date ?? "2026-07-30");
  const [debut, setDebut] = useState(initial?.debut ?? "08:00");
  const [fin, setFin] = useState("10:00");
  const [groupe, setGroupe] = useState(GROUPES[0].code);
  const [formateurNom, setFormateurNom] = useState(FORMATEURS[0].nom);
  const [salleNom, setSalleNom] = useState(SALLES[0].nom);
  const [instructions, setInstructions] = useState("Présence 10 minutes avant, EPI obligatoires.");
  const [materiel, setMateriel] = useState("Support de cours, EPI");

  const formateurId = FORMATEURS.find((f) => f.nom === formateurNom)!.id;
  const salle = SALLES.find((s) => s.nom === salleNom)!;
  const groupeObj = GROUPES.find((g) => g.code === groupe)!;

  const conflits = detecterConflits(
    { date, debut, fin, formateurId, salleId: salle.id, groupe, capacite: salle.capacite, participants: [] },
    sessions,
  );

  const creer = (statut: SessionPlanning["statut"]) => {
    actionsPlanning.creer({
      formationCode: formation.code,
      formationNom: formation.nom,
      moduleNom,
      type: type as SessionPlanning["type"],
      date,
      debut,
      fin,
      site: salle.site,
      batiment: salle.batiment,
      salleId: salle.id,
      formateurId,
      groupe,
      capacite: Math.min(salle.capacite, groupeObj.effectif),
      participants: [],
      statut,
      instructions,
      materiel,
      notifications: { envoyees: 0, lues: 0 },
      presencesSaisies: 0,
      evaluationsSaisies: 0,
      observations: 0,
    });
    onCree(statut === "Brouillon" ? "Session enregistrée en brouillon" : "Session planifiée et confirmée");
    onClose();
  };

  return (
    <Modale
      titre="Nouvelle session de formation"
      sousTitre="Vérification automatique des conflits formateur, salle et groupe"
      onClose={onClose}
      large
      footer={
        <>
          <Btn size="sm" onClick={onClose}>
            Fermer
          </Btn>
          <Btn size="sm" onClick={() => creer("Brouillon")}>
            Enregistrer en brouillon
          </Btn>
          <Btn size="sm" variant="primary" disabled={conflits.length > 0} onClick={() => creer("Confirmée")}>
            Planifier & confirmer
          </Btn>
        </>
      }
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <Champ
          label="Formation"
          value={formation.nom}
          onChange={(v) => {
            const f = FORMATIONS_PLANNING.find((x) => x.nom === v)!;
            setFormation(f);
            setModuleNom(f.modules[0]);
          }}
          options={FORMATIONS_PLANNING.map((f) => f.nom)}
        />
        <Champ label="Module" value={moduleNom} onChange={setModuleNom} options={formation.modules} />
        <Champ label="Type de session" value={type} onChange={setType} options={TYPES_SESSION} />
        <Input label="Date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        <Input label="Heure de début" type="time" value={debut} onChange={(e) => setDebut(e.target.value)} />
        <Input label="Heure de fin" type="time" value={fin} onChange={(e) => setFin(e.target.value)} />
        <Champ label="Groupe" value={groupe} onChange={setGroupe} options={GROUPES.map((g) => g.code)} />
        <Champ label="Formateur" value={formateurNom} onChange={setFormateurNom} options={FORMATEURS.map((f) => f.nom)} />
        <Champ label="Salle" value={salleNom} onChange={setSalleNom} options={SALLES.map((s) => s.nom)} />
        <div className="rounded-sm border border-border px-3 py-2 text-[11px] text-muted-foreground">
          <p>
            {salle.type} · {salle.site} · {salle.batiment}
          </p>
          <p className="num">Capacité {salle.capacite} · Groupe {groupeObj.effectif} personnes</p>
          <p>Équipements : {salle.equipements.join(", ")}</p>
        </div>
        <div className="sm:col-span-2">
          <Textarea label="Instructions aux participants" rows={2} value={instructions} onChange={(e) => setInstructions(e.target.value)} />
        </div>
        <div className="sm:col-span-2">
          <Textarea label="Matériel requis" rows={2} value={materiel} onChange={(e) => setMateriel(e.target.value)} />
        </div>
      </div>

      <div className="mt-4 rounded-md border border-border p-3">
        <p className="label-xs mb-2">Contrôle des conflits</p>
        {conflits.length === 0 ? (
          <p className="text-[11px] text-[var(--success)]">
            Aucun conflit détecté : {formateurParId(formateurId)?.nom} et {salleParId(salle.id)?.nom} sont disponibles sur ce créneau.
          </p>
        ) : (
          <ul className="space-y-1">
            {conflits.map((c, i) => (
              <li key={i} className="flex items-start gap-2 text-[11px]">
                <Tag ton="critical">{c.type}</Tag>
                <span className="text-[var(--critical)]">{c.message}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Modale>
  );
}
