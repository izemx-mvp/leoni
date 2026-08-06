import { useState } from "react";
import { AlertTriangle, ShieldAlert } from "lucide-react";
import { Btn, Input, Modale, Select, Tag, Textarea } from "@/components/leoni/kit";
import type { Conformite, LigneConformite } from "@/data/postes-critiques";

/** Journalisation locale d'une dérogation encadrée (aucun store partagé n'existe pour cela). */
export interface Derogation {
  id: string;
  date: string;
  sujet: string;
  poste: string;
  contexte: string;
  motif: string;
  validateur: string;
  niveauApprobation: string;
  blocages: LigneConformite[];
}

const NIVEAUX_APPROBATION = ["Responsable de ligne", "Responsable RH site", "Direction Ressources Humaines"];

/**
 * Modale bloquante déclenchée lorsqu'une affectation / intégration / fin de formation
 * vise un poste critique alors que des exigences bloquantes ne sont pas satisfaites.
 * Deux issues : correction préalable (annulation) ou dérogation encadrée tracée.
 */
export function ModaleAffectationBloquee({
  sujet,
  poste,
  contexte,
  conformite,
  onClose,
  onCorrigerDabord,
  onDeroger,
}: {
  sujet: string;
  poste?: string;
  contexte: string;
  conformite: Conformite;
  onClose: () => void;
  onCorrigerDabord: () => void;
  onDeroger: (derogation: Omit<Derogation, "id" | "date">) => void;
}) {
  const [motif, setMotif] = useState("");
  const [validateur, setValidateur] = useState("Amina Rajouh");
  const [niveau, setNiveau] = useState(NIVEAUX_APPROBATION[1]);
  const [confirmation, setConfirmation] = useState(false);

  const blocages = conformite.blocages;

  const valider = () => {
    onDeroger({
      sujet,
      poste: poste ?? conformite.poste?.nom ?? "—",
      contexte,
      motif,
      validateur,
      niveauApprobation: niveau,
      blocages,
    });
    setConfirmation(true);
  };

  if (confirmation) {
    return (
      <Modale titre="Dérogation encadrée enregistrée" onClose={onClose} footer={<Btn variant="primary" onClick={onClose}>Fermer</Btn>}>
        <div className="flex items-start gap-3 rounded-sm border border-[var(--success)] bg-[var(--success)]/10 p-3 text-sm">
          <ShieldAlert className="mt-0.5 size-4 text-[var(--success)]" />
          <div>
            <p className="font-medium">{contexte} autorisée sous dérogation.</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Validateur : {validateur} · Niveau d'approbation : {niveau}. La dérogation a été journalisée avec les
              {" "}
              {blocages.length} blocage(s) constaté(s) pour {sujet} — {poste ?? conformite.poste?.nom}.
            </p>
          </div>
        </div>
      </Modale>
    );
  }

  return (
    <Modale
      titre={`Affectation bloquée — poste critique`}
      sousTitre={`${sujet} · ${poste ?? conformite.poste?.nom ?? "—"} · ${contexte}`}
      onClose={onClose}
      footer={
        <>
          <Btn variant="ghost" onClick={onClose}>
            Fermer
          </Btn>
          <Btn variant="secondary" onClick={onCorrigerDabord}>
            Corriger d'abord
          </Btn>
          <Btn
            variant="danger"
            disabled={!motif.trim() || !validateur.trim()}
            onClick={valider}
          >
            Confirmer la dérogation encadrée
          </Btn>
        </>
      }
    >
      <div className="flex items-start gap-3 rounded-sm border border-[color-mix(in_oklab,var(--critical)_40%,transparent)] bg-[color-mix(in_oklab,var(--critical)_8%,transparent)] p-3 text-sm">
        <AlertTriangle className="mt-0.5 size-4 shrink-0 text-[var(--critical)]" />
        <div>
          <p className="font-medium text-[var(--critical)]">
            {blocages.length} exigence(s) bloquante(s) non satisfaite(s) pour ce poste critique.
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {contexte} ne peut pas être validée en l'état sans une dérogation encadrée, motivée et approuvée.
          </p>
        </div>
      </div>

      <div className="mt-3 overflow-hidden rounded-sm border border-border">
        <table className="w-full text-xs">
          <thead className="bg-[var(--hover)] text-left text-[11px] uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-2.5 py-1.5">Exigence</th>
              <th className="px-2.5 py-1.5">Attendu</th>
              <th className="px-2.5 py-1.5">Constaté</th>
              <th className="px-2.5 py-1.5">Conséquence</th>
            </tr>
          </thead>
          <tbody>
            {blocages.map((b) => (
              <tr key={b.categorie + b.libelle} className="border-t border-border">
                <td className="px-2.5 py-1.5 font-medium">{b.libelle}</td>
                <td className="px-2.5 py-1.5 num text-muted-foreground">{b.attendu}</td>
                <td className="px-2.5 py-1.5 num text-[var(--critical)]">{b.constate}</td>
                <td className="px-2.5 py-1.5 text-muted-foreground">
                  {b.categorie === "Document" && /casier/i.test(b.libelle)
                    ? "Risque juridique et sécuritaire — non-conformité réglementaire"
                    : b.categorie === "Aptitude"
                      ? "Risque santé / sécurité au poste"
                      : b.categorie === "Test" || b.categorie === "Compétence"
                        ? "Risque qualité / non-maîtrise du poste critique"
                        : "Non-conformité aux exigences du poste critique"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-3 rounded-sm border border-border bg-[var(--hover)] p-3">
        <p className="text-xs font-semibold">Actions correctives proposées</p>
        <ul className="mt-1.5 space-y-1 text-xs text-muted-foreground">
          {blocages.map((b) => (
            <li key={b.categorie + b.libelle}>
              •{" "}
              {b.categorie === "Document"
                ? `Relancer le document « ${b.libelle} » auprès de l'intéressé(e)`
                : b.categorie === "Test"
                  ? `Programmer / reprogrammer le test « ${b.libelle} »`
                  : b.categorie === "Formation"
                    ? `Planifier la formation « ${b.libelle} »`
                    : b.categorie === "Aptitude"
                      ? "Programmer la visite médicale d'aptitude"
                      : `Faire évaluer la compétence « ${b.libelle} » (évaluation pratique)`}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-4 grid gap-3 border-t border-border pt-3 sm:grid-cols-2">
        <Textarea
          label="Motif de la dérogation *"
          rows={3}
          value={motif}
          onChange={(e) => setMotif(e.target.value)}
          placeholder="Justification opérationnelle de la dérogation encadrée…"
          className="sm:col-span-2"
        />
        <Input label="Validateur *" value={validateur} onChange={(e) => setValidateur(e.target.value)} />
        <label className="block">
          <span className="label-xs">Niveau d'approbation *</span>
          <div className="mt-1">
            <Select value={niveau} onChange={setNiveau} options={NIVEAUX_APPROBATION} />
          </div>
        </label>
      </div>
      <p className="mt-2 text-[11px] text-muted-foreground">
        La dérogation encadrée autorise l'affectation malgré les blocages ; elle est journalisée et reste
        consultable dans l'historique de l'opérateur.
      </p>
    </Modale>
  );
}

export function badgeConformiteCourt({ score }: Conformite) {
  return (
    <Tag ton={score >= 90 ? "success" : score >= 60 ? "warning" : "critical"}>{score} %</Tag>
  );
}
