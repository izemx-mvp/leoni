import { AlertTriangle } from "lucide-react";
import { Modale, Tag, Kpi } from "@/components/leoni/kit";
import { BadgeCritique } from "@/components/leoni/postes/BadgeCritique";
import type { Poste } from "@/data/postes-critiques";

export function FichePoste({ poste, onClose }: { poste: Poste; onClose: () => void }) {
  return (
    <Modale
      titre={poste.nom}
      sousTitre={`${poste.code} · ${poste.site} · ${poste.atelier}`}
      onClose={onClose}
      large
    >
      <div className="space-y-5">
        <div className="flex flex-wrap items-center gap-2">
          <BadgeCritique poste={poste.code} />
          <Tag ton={poste.statut === "Actif" ? "success" : poste.statut === "Suspendu" ? "warning" : "neutral"}>
            {poste.statut}
          </Tag>
          <Tag ton="brand">{poste.famille}</Tag>
          <Tag>{poste.departement}</Tag>
        </div>

        <div className="grid gap-3 sm:grid-cols-4">
          <Kpi label="Effectif cible" valeur={poste.effectifCible} ton="brand" />
          <Kpi label="Affectés" valeur={poste.ouvriersAffectes} ton="success" />
          <Kpi label="Postes ouverts" valeur={poste.ouverts} ton="warning" />
          <Kpi label="Délai moyen" valeur={poste.delaiMoyenJours} suffixe="jours" ton="info" />
        </div>

        <section>
          <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Description</h3>
          <p className="text-sm">{poste.description}</p>
        </section>

        <div className="grid gap-5 sm:grid-cols-2">
          <section>
            <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Missions</h3>
            <ul className="space-y-1 text-sm">
              {poste.missions.map((m) => (
                <li key={m}>• {m}</li>
              ))}
            </ul>
          </section>
          <section className="space-y-2 text-sm">
            <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Informations</h3>
            <p><span className="text-muted-foreground">Horaires : </span>{poste.horaires}</p>
            <p><span className="text-muted-foreground">Contrat : </span>{poste.contrat}</p>
            <p><span className="text-muted-foreground">Parcours d'intégration : </span><Tag ton="brand">{poste.parcours}</Tag></p>
            <p><span className="text-muted-foreground">Responsable : </span>{poste.responsable}</p>
            <p><span className="text-muted-foreground">Ligne : </span>{poste.ligne}</p>
            <p><span className="text-muted-foreground">Créé le : </span>{poste.dateCreation} · <span className="text-muted-foreground">MAJ : </span>{poste.majLe}</p>
          </section>
        </div>

        {poste.isCritical && poste.exigences && (
          <section className="space-y-3 border-t border-border pt-4">
            <div className="flex items-start gap-2 rounded-sm border border-[color-mix(in_oklab,var(--critical)_35%,transparent)] bg-[color-mix(in_oklab,var(--critical)_8%,transparent)] p-3">
              <AlertTriangle className="mt-0.5 size-4 shrink-0 text-[var(--critical)]" />
              <p className="text-xs text-foreground/90">
                Poste critique : toute exigence marquée « bloquante » empêche l'affectation d'un candidat ou d'un
                ouvrier tant qu'elle n'est pas satisfaite. Les seuils ci-dessous sont appliqués automatiquement par
                le moteur de conformité (score minimum, présence, tentatives autorisées).
              </p>
            </div>

            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Matrice des exigences
            </h3>

            <TableExigences titre="Compétences requises" cols={["Compétence", "Niveau min.", "Validation", "Validité", "Bloquant"]}>
              {poste.exigences.competences.map((c) => (
                <tr key={c.nom} className="border-t border-border">
                  <td className="px-2.5 py-1.5 font-medium">{c.nom}</td>
                  <td className="px-2.5 py-1.5 num">{c.niveauMin} / 4</td>
                  <td className="px-2.5 py-1.5 text-muted-foreground">{c.validation}</td>
                  <td className="px-2.5 py-1.5 text-muted-foreground">{c.validite}</td>
                  <td className="px-2.5 py-1.5">{c.bloquante ? <Tag ton="critical">Oui</Tag> : <Tag>Non</Tag>}</td>
                </tr>
              ))}
            </TableExigences>

            <div className="grid gap-3 sm:grid-cols-2">
              <TableExigences titre="Tests d'évaluation" cols={["Test", "Type", "Score min.", "Bloquant"]}>
                {poste.exigences.tests.map((t) => (
                  <tr key={t.nom} className="border-t border-border">
                    <td className="px-2.5 py-1.5 font-medium">{t.nom}</td>
                    <td className="px-2.5 py-1.5 text-muted-foreground">{t.type}</td>
                    <td className="px-2.5 py-1.5 num">{t.scoreMin} %</td>
                    <td className="px-2.5 py-1.5">{t.bloquant ? <Tag ton="critical">Oui</Tag> : <Tag>Non</Tag>}</td>
                  </tr>
                ))}
              </TableExigences>

              <TableExigences titre="Formations obligatoires" cols={["Formation", "Type", "Bloquante"]}>
                {poste.exigences.formations.map((f) => (
                  <tr key={f.nom} className="border-t border-border">
                    <td className="px-2.5 py-1.5 font-medium">{f.nom}</td>
                    <td className="px-2.5 py-1.5 text-muted-foreground">{f.type}</td>
                    <td className="px-2.5 py-1.5">{f.bloquante ? <Tag ton="critical">Oui</Tag> : <Tag>Non</Tag>}</td>
                  </tr>
                ))}
              </TableExigences>

              <TableExigences titre="Documents requis" cols={["Document", "Bloquant"]}>
                {poste.exigences.documents.map((d) => (
                  <tr key={d.nom} className="border-t border-border">
                    <td className="px-2.5 py-1.5 font-medium">{d.nom}</td>
                    <td className="px-2.5 py-1.5">{d.bloquant ? <Tag ton="critical">Oui</Tag> : <Tag>Non</Tag>}</td>
                  </tr>
                ))}
              </TableExigences>

              <div className="rounded-sm border border-border p-3">
                <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Expérience & habilitations
                </p>
                <p className="text-sm">
                  <span className="text-muted-foreground">Minimum : </span>
                  {poste.exigences.experience.minimum} — {poste.exigences.experience.type}
                  {poste.exigences.experience.obligatoire && <Tag ton="critical" className="ml-2">Obligatoire</Tag>}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">{poste.exigences.experience.secteur}</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {poste.exigences.habilitations.map((h) => (
                    <Tag key={h} ton="brand">{h}</Tag>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-sm border border-border bg-[var(--hover)] p-3">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                Seuils appliqués par le moteur de conformité
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-3">
                <Seuil label="Score candidat min." valeur={`${poste.exigences.seuils.scoreCandidat} %`} />
                <Seuil label="Score formation min." valeur={`${poste.exigences.seuils.scoreFormation} %`} />
                <Seuil label="Présence min." valeur={`${poste.exigences.seuils.presence} %`} />
                <Seuil label="Niveau compétence min." valeur={`${poste.exigences.seuils.competenceMin} / 4`} />
                <Seuil label="Tentatives max." valeur={poste.exigences.seuils.tentativesMax} />
                <Seuil label="Durée de mise en conformité" valeur={poste.exigences.seuils.dureeConformite} />
              </div>
            </div>
          </section>
        )}
      </div>
    </Modale>
  );
}

function TableExigences({ titre, cols, children }: { titre: string; cols: string[]; children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-sm border border-border">
      <p className="border-b border-border bg-[var(--hover)] px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        {titre}
      </p>
      <table className="w-full text-xs">
        <thead className="text-left text-[11px] uppercase tracking-wide text-muted-foreground">
          <tr>
            {cols.map((c) => (
              <th key={c} className="px-2.5 py-1.5">{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

function Seuil({ label, valeur }: { label: string; valeur: React.ReactNode }) {
  return (
    <div className="rounded-sm border border-border bg-card px-2 py-1.5">
      <p className="text-[10px] text-muted-foreground">{label}</p>
      <p className="num font-semibold">{valeur}</p>
    </div>
  );
}
