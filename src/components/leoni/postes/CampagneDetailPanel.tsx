import { Panel, Tag, Barre } from "@/components/leoni/kit";
import { BadgeCritique } from "@/components/leoni/postes/BadgeCritique";
import { posteDe } from "@/data/postes-critiques";
import { tauxCouvertureCampagne, type CampagneDetail } from "@/data/postes-campagnes";

const ETAPES: { label: string; cle: keyof CampagneDetail }[] = [
  { label: "Reçus", cle: "recus" },
  { label: "Présélectionnés", cle: "preselectionnes" },
  { label: "Entretiens", cle: "entretiens" },
  { label: "Retenus", cle: "retenus" },
  { label: "Intégrés", cle: "integres" },
];

export function CampagneDetailPanel({ campagne }: { campagne: CampagneDetail }) {
  const max = campagne.recus || 1;
  return (
    <Panel
      title={`${campagne.code} — ${campagne.nom}`}
      subtitle={`${campagne.site} · ${campagne.periodeDebut} → ${campagne.periodeFin}`}
      action={<Tag ton={campagne.statut === "En cours" ? "info" : campagne.statut === "Clôturée" ? "neutral" : "warning"}>{campagne.statut}</Tag>}
    >
      <div className="grid gap-5 lg:grid-cols-2">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Entonnoir de recrutement</p>
          <div className="space-y-2">
            {ETAPES.map((e) => {
              const valeur = Number(campagne[e.cle]);
              const largeur = Math.max(6, Math.round((valeur / max) * 100));
              return (
                <div key={e.label} className="flex items-center gap-2 text-xs">
                  <span className="w-28 shrink-0 text-muted-foreground">{e.label}</span>
                  <div className="h-5 flex-1 overflow-hidden rounded-sm bg-muted">
                    <div
                      className="flex h-full items-center rounded-sm bg-[var(--brand)] px-2 text-[11px] font-semibold text-[var(--brand-foreground)]"
                      style={{ width: `${largeur}%` }}
                    >
                      <span className="num">{valeur}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Taux de couverture de l'objectif :{" "}
            <span className="num font-semibold text-foreground">{tauxCouvertureCampagne(campagne)} %</span> · Coût moyen
            estimé par recrutement :{" "}
            <span className="num font-semibold text-foreground">{campagne.coutParRecrutement.toLocaleString("fr-FR")} MAD</span>
          </p>
        </div>

        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Canaux de sourcing</p>
          <div className="space-y-2">
            {campagne.canaux.map((c) => (
              <div key={c.nom} className="rounded-sm border border-border p-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium">{c.nom}</span>
                  <span className="text-muted-foreground">{c.part} % des reçus</span>
                </div>
                <div className="mt-1.5">
                  <Barre valeur={c.part} />
                </div>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  {c.recus} reçus · {c.retenus} retenus · coût moyen {c.coutMoyen.toLocaleString("fr-FR")} MAD
                </p>
              </div>
            ))}
          </div>

          <p className="mb-2 mt-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Postes couverts</p>
          <div className="flex flex-wrap gap-1.5">
            {campagne.postesCodes.map((code) => {
              const p = posteDe(code);
              return (
                <span key={code} className="inline-flex items-center gap-1.5 rounded-sm border border-border bg-[var(--hover)] px-2 py-1 text-xs">
                  {p?.nom ?? code}
                  <BadgeCritique poste={code} compact />
                </span>
              );
            })}
          </div>
        </div>
      </div>
    </Panel>
  );
}
