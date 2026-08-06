import { ShieldAlert, ShieldCheck } from "lucide-react";
import { Barre, Panel, Tag, tonStatut } from "@/components/leoni/kit";
import {
  estCritique,
  posteDe,
  tonConformite,
  type Conformite,
} from "@/data/postes-critiques";
import { cn } from "@/lib/utils";

/**
 * Badge de criticité — la valeur provient TOUJOURS de la fiche poste
 * (JobPosition.isCritical), jamais d'un champ dupliqué.
 */
export function BadgeCritique({
  poste,
  compact = false,
  masquerNonCritique = false,
  className,
}: {
  poste?: string;
  compact?: boolean;
  masquerNonCritique?: boolean;
  className?: string;
}) {
  const critique = estCritique(poste);
  if (!critique && masquerNonCritique) return null;

  const titre = critique
    ? "Ce poste nécessite des compétences, tests, formations et documents obligatoires spécifiques."
    : "Poste soumis au contrôle standard d'affectation.";

  return (
    <span
      title={titre}
      className={cn(
        "inline-flex items-center gap-1 rounded-sm border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
        critique
          ? "border-[color-mix(in_oklab,var(--critical)_40%,transparent)] bg-[color-mix(in_oklab,var(--critical)_12%,transparent)] text-[var(--critical)]"
          : "border-border bg-[var(--hover)] text-muted-foreground",
        className,
      )}
    >
      {critique ? <ShieldAlert className="size-3" /> : <ShieldCheck className="size-3" />}
      {compact ? (critique ? "Critique" : "Non critique") : critique ? "Poste critique" : "Poste non critique"}
    </span>
  );
}

/** Carte « Poste & criticité » utilisée sur les fiches candidat / ouvrier. */
export function CartePosteCriticite({ poste, conformite }: { poste?: string; conformite: Conformite }) {
  const p = posteDe(poste);
  return (
    <Panel title="Poste & criticité">
      <div className="grid gap-3 sm:grid-cols-2">
        <Info label="Poste visé" valeur={p?.nom ?? poste ?? "—"} />
        <Info label="Code poste" valeur={p?.code ?? "—"} />
        <Info label="Site" valeur={p?.site ?? "—"} />
        <Info label="Atelier" valeur={p?.atelier ?? "—"} />
        <Info label="Département" valeur={p?.departement ?? "—"} />
        <Info label="Criticité" valeur={<BadgeCritique poste={poste} compact />} />
      </div>
      {conformite.critique && (
        <div className="mt-3 grid gap-3 border-t border-border pt-3 sm:grid-cols-3">
          <Info label="Exigences obligatoires" valeur={<span className="num">{conformite.total}</span>} />
          <Info label="Éléments conformes" valeur={<span className="num">{conformite.conformes}</span>} />
          <Info
            label="Restant à évaluer"
            valeur={<span className="num">{conformite.total - conformite.conformes}</span>}
          />
        </div>
      )}
    </Panel>
  );
}

/** Carte de conformité détaillée (candidat ou ouvrier). */
export function CarteConformite({
  conformite,
  titre = "Conformité au poste",
  actions,
}: {
  conformite: Conformite;
  titre?: string;
  actions?: React.ReactNode;
}) {
  if (!conformite.critique) {
    return (
      <Panel title={titre}>
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <span className="text-muted-foreground">Criticité :</span>
          <Tag ton="neutral">Non critique</Tag>
          <span className="text-muted-foreground">Statut d'affectation :</span>
          <Tag ton="success">Conforme</Tag>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Poste non critique — contrôle standard d'affectation.
        </p>
      </Panel>
    );
  }

  return (
    <Panel title={titre} action={actions}>
      <div className="flex flex-wrap items-center gap-4">
        <div className="min-w-40">
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Conformité poste critique</p>
          <p className="num text-2xl font-semibold">{conformite.score} %</p>
        </div>
        <div className="w-40">
          <Barre
            valeur={conformite.score}
            ton={conformite.score >= 90 ? "success" : conformite.score >= 60 ? "warning" : "critical"}
          />
        </div>
        <Tag ton={tonConformite(conformite.statut)}>{conformite.statut}</Tag>
        <span className="text-xs text-muted-foreground">
          {conformite.conformes}/{conformite.total} éléments validés · {conformite.blocages.length} blocage(s) ·
          échéance {conformite.echeance}
        </span>
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-3 lg:grid-cols-4">
        {conformite.resume.map((r) => (
          <div key={r.categorie} className="rounded-sm border border-border bg-[var(--hover)] px-2.5 py-2">
            <p className="text-[11px] text-muted-foreground">{r.categorie}s</p>
            <p className="num text-sm font-semibold">
              {r.conformes} / {r.total}
            </p>
          </div>
        ))}
      </div>

      {conformite.blocages.length > 0 && (
        <div className="mt-3 rounded-sm border border-[color-mix(in_oklab,var(--critical)_40%,transparent)] bg-[color-mix(in_oklab,var(--critical)_8%,transparent)] p-3">
          <p className="mb-1.5 text-xs font-semibold text-[var(--critical)]">Éléments bloquants</p>
          <ul className="space-y-1 text-xs">
            {conformite.blocages.map((b) => (
              <li key={b.categorie + b.libelle}>
                • {b.libelle} — attendu {b.attendu}, constaté : {b.constate}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-3 overflow-hidden rounded-sm border border-border">
        <table className="w-full text-xs">
          <thead className="bg-[var(--hover)] text-left text-[11px] uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-2.5 py-1.5">Catégorie</th>
              <th className="px-2.5 py-1.5">Exigence</th>
              <th className="px-2.5 py-1.5">Attendu</th>
              <th className="px-2.5 py-1.5">Constaté</th>
              <th className="px-2.5 py-1.5">Bloquant</th>
              <th className="px-2.5 py-1.5">Statut</th>
            </tr>
          </thead>
          <tbody>
            {conformite.lignes.map((l) => (
              <tr key={l.categorie + l.libelle} className="border-t border-border">
                <td className="px-2.5 py-1.5 text-muted-foreground">{l.categorie}</td>
                <td className="px-2.5 py-1.5 font-medium">{l.libelle}</td>
                <td className="px-2.5 py-1.5 num text-muted-foreground">{l.attendu}</td>
                <td className="px-2.5 py-1.5 num">{l.constate}</td>
                <td className="px-2.5 py-1.5">{l.bloquant ? <Tag ton="critical">Oui</Tag> : <Tag>Non</Tag>}</td>
                <td className="px-2.5 py-1.5">
                  <Tag ton={l.conforme ? "success" : "warning"}>{l.conforme ? "Conforme" : "À traiter"}</Tag>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-[11px] text-muted-foreground">
        Conformité recalculée automatiquement depuis la fiche poste ({conformite.poste?.code}).
      </p>
    </Panel>
  );
}

function Info({ label, valeur }: { label: string; valeur: React.ReactNode }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="text-sm font-medium">{valeur}</p>
    </div>
  );
}

export { tonStatut };
