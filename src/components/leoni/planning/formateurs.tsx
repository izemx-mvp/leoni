import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Avatar, Barre, Btn, Modale, Onglets, Panel, Stat, Tag } from "@/components/leoni/kit";
import {
  FORMATEURS,
  dureeTexte,
  formatLong,
  salleParId,
  type Formateur,
  type SessionPlanning,
} from "@/data/planning";
import type { ChargeFormateur } from "@/lib/planning-store";
import { tonSessionStatut } from "./commun";

const tonCharge = (e: ChargeFormateur["etat"]) =>
  e === "Surcharge" ? "critical" : e === "Complet" ? "critical" : e === "Charge élevée" ? "warning" : e === "Charge normale" ? "info" : "success";

const barreCharge = (taux: number) => (taux > 100 ? "critical" : taux >= 90 ? "critical" : taux >= 70 ? "warning" : "success");

/* ------------------------------- Hover card ------------------------------ */

export function FormateurHover({
  formateur,
  charge,
  onOuvrirFiche,
  children,
}: {
  formateur: Formateur;
  charge: ChargeFormateur;
  onOuvrirFiche: () => void;
  children: ReactNode;
}) {
  return (
    <div className="group/frm relative">
      {children}
      <div className="pointer-events-none absolute left-0 top-full z-40 mt-1 hidden w-80 rounded-md border border-border bg-card p-3 shadow-xl group-hover/frm:block group-hover/frm:pointer-events-auto">
        <div className="flex items-center gap-2.5">
          <Avatar nom={formateur.nom} size={40} />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{formateur.nom}</p>
            <p className="truncate text-[11px] text-muted-foreground">{formateur.fonction}</p>
            <p className="text-[11px] text-muted-foreground">Site {formateur.site}</p>
          </div>
          <Tag ton={tonCharge(charge.etat)} className="ml-auto">
            {charge.etat}
          </Tag>
        </div>

        <dl className="mt-3 space-y-1 border-t border-border pt-2 text-[11px]">
          <Ligne label="Téléphone" valeur={formateur.telephone} />
          <Ligne label="Email" valeur={formateur.email} />
          <Ligne label="Spécialités" valeur={formateur.specialites.join(", ")} />
          <Ligne label="Certifications" valeur={formateur.certifications.join(", ")} />
          <Ligne label="Langues" valeur={formateur.langues.join(", ")} />
          <Ligne label="Charge période" valeur={`${charge.heures} h / ${charge.capacite} h`} />
          <Ligne label="Sessions" valeur={`${charge.sessions} session(s)`} />
          <Ligne label="Participants" valeur={`${charge.participants} prévus`} />
          <Ligne
            label="Prochaine session"
            valeur={
              charge.prochaine
                ? `${charge.prochaine.groupe} · ${formatLong(charge.prochaine.date).split(" ").slice(0, 3).join(" ")} · ${charge.prochaine.debut}`
                : "Aucune"
            }
          />
          <Ligne label="Disponibilité" valeur={formateur.disponibilites} />
        </dl>

        <Btn size="sm" variant="secondary" className="mt-3 w-full" onClick={onOuvrirFiche}>
          Voir profil & planning
        </Btn>
      </div>
    </div>
  );
}

function Ligne({ label, valeur }: { label: string; valeur: string }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="shrink-0 text-muted-foreground">{label}</dt>
      <dd className="truncate text-right">{valeur}</dd>
    </div>
  );
}

/* --------------------------- Charge & disponibilité ---------------------- */

export function ChargeFormateurs({
  charges,
  sessions,
  onOuvrirFiche,
}: {
  charges: ChargeFormateur[];
  sessions: SessionPlanning[];
  onOuvrirFiche: (id: string) => void;
}) {
  return (
    <Panel
      title="Charge & disponibilité des formateurs"
      subtitle="Survolez un formateur pour voir sa fiche rapide"
      className="mt-4"
      bodyClassName="p-0"
    >
      <ul className="divide-y divide-border">
        {charges.map((c) => {
          const f = FORMATEURS.find((x) => x.id === c.formateurId)!;
          const prochaines = sessions.filter((s) => s.formateurId === f.id).length;
          return (
            <li key={c.formateurId} className="px-4 py-3">
              <FormateurHover formateur={f} charge={c} onOuvrirFiche={() => onOuvrirFiche(f.id)}>
                <div className="flex flex-wrap items-center gap-3">
                  <Avatar nom={f.nom} size={32} />
                  <div className="min-w-40">
                    <button
                      onClick={() => onOuvrirFiche(f.id)}
                      className="text-sm font-medium hover:text-[var(--brand)]"
                    >
                      {f.nom}
                    </button>
                    <p className="text-[11px] text-muted-foreground">
                      {f.fonction} · {f.site}
                    </p>
                  </div>
                  <div className="num w-28 text-xs text-muted-foreground">
                    {c.heures}h / {c.capacite}h
                  </div>
                  <div className="w-40">
                    <Barre valeur={Math.min(100, c.taux)} ton={barreCharge(c.taux)} />
                  </div>
                  <span className={cn("num w-12 text-xs font-semibold", c.taux > 100 && "text-[var(--critical)]")}>
                    {c.taux} %
                  </span>
                  <span className="num text-xs text-muted-foreground">{prochaines} sessions</span>
                  <span className="num text-xs text-muted-foreground">{c.participants} participants</span>
                  <Tag ton={tonCharge(c.etat)} className="ml-auto">
                    {c.etat}
                  </Tag>
                </div>
              </FormateurHover>
            </li>
          );
        })}
      </ul>
    </Panel>
  );
}

/* --------------------------- Fiche formateur ----------------------------- */

export function FicheFormateur({
  formateur,
  charge,
  sessions,
  onClose,
}: {
  formateur: Formateur;
  charge: ChargeFormateur;
  sessions: SessionPlanning[];
  onClose: () => void;
}) {
  const [onglet, setOnglet] = useState("Vue d'ensemble");
  const siennes = sessions
    .filter((s) => s.formateurId === formateur.id)
    .sort((a, b) => (a.date + a.debut).localeCompare(b.date + b.debut));
  const p = formateur.performance;

  return (
    <Modale titre={formateur.nom} sousTitre={`${formateur.fonction} · ${formateur.site}`} onClose={onClose} large>
      <div className="flex flex-wrap items-center gap-3 rounded-md border border-border p-3">
        <Avatar nom={formateur.nom} size={48} />
        <div>
          <p className="text-sm font-semibold">{formateur.nom}</p>
          <p className="text-xs text-muted-foreground">
            {formateur.matricule} · {formateur.centre}
          </p>
        </div>
        <Tag ton={tonCharge(charge.etat)} className="ml-auto">
          {charge.etat}
        </Tag>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-5">
        <Stat label="Charge période" valeur={`${charge.heures}h / ${charge.capacite}h`} />
        <Stat label="Sessions" valeur={charge.sessions} />
        <Stat label="Participants" valeur={charge.participants} />
        <Stat label="Satisfaction" valeur={`${p.satisfaction} / 5`} />
        <Stat label="Réussite moyenne" valeur={`${p.tauxReussite} %`} />
      </div>

      <div className="mt-4">
        <Onglets
          valeurs={["Vue d'ensemble", "Planning", "Formations", "Disponibilités", "Performance", "Historique"]}
          actif={onglet}
          onChange={setOnglet}
        />
      </div>

      {onglet === "Vue d'ensemble" && (
        <div className="grid gap-3 md:grid-cols-2">
          <Bloc titre="Contact">
            <Ligne label="Téléphone" valeur={formateur.telephone} />
            <Ligne label="Email" valeur={formateur.email} />
          </Bloc>
          <Bloc titre="Affectation">
            <Ligne label="Site principal" valeur={formateur.site} />
            <Ligne label="Département" valeur={formateur.departement} />
            <Ligne label="Centre" valeur={formateur.centre} />
            <Ligne label="Responsable" valeur={formateur.responsable} />
          </Bloc>
          <Bloc titre="Spécialités">
            <div className="flex flex-wrap gap-1">
              {formateur.specialites.map((s) => (
                <Tag key={s} ton="brand">
                  {s}
                </Tag>
              ))}
            </div>
          </Bloc>
          <Bloc titre="Certifications & habilitations">
            <div className="flex flex-wrap gap-1">
              {[...formateur.certifications, ...formateur.habilitations].map((s) => (
                <Tag key={s} ton="info">
                  {s}
                </Tag>
              ))}
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground">Langues : {formateur.langues.join(", ")}</p>
          </Bloc>
        </div>
      )}

      {onglet === "Planning" && (
        <ul className="divide-y divide-border rounded-md border border-border">
          {siennes.slice(0, 20).map((s) => (
            <li key={s.id} className="flex flex-wrap items-center gap-2 px-3 py-2 text-xs">
              <span className="num w-40 text-muted-foreground">{formatLong(s.date)}</span>
              <span className="num w-24">
                {s.debut} – {s.fin}
              </span>
              <span className="w-20 font-medium">{s.groupe}</span>
              <span className="flex-1 truncate text-muted-foreground">{s.moduleNom}</span>
              <span className="text-muted-foreground">{salleParId(s.salleId)?.nom}</span>
              <Tag ton={tonSessionStatut(s.statut)}>{s.statut}</Tag>
            </li>
          ))}
          {siennes.length === 0 && <li className="px-3 py-6 text-center text-xs text-muted-foreground">Aucune session sur la période.</li>}
        </ul>
      )}

      {onglet === "Formations" && (
        <ul className="space-y-2">
          {formateur.formations.map((f) => (
            <li key={f} className="rounded-sm border border-border px-3 py-2 text-sm">
              {f}
            </li>
          ))}
        </ul>
      )}

      {onglet === "Disponibilités" && (
        <div className="grid gap-3 md:grid-cols-3">
          <Bloc titre="Semaine type">
            <p className="text-xs">{formateur.disponibilites}</p>
          </Bloc>
          <Bloc titre="Congés">
            {formateur.conges.length ? (
              formateur.conges.map((c) => <p key={c} className="text-xs">{c}</p>)
            ) : (
              <p className="text-xs text-muted-foreground">Aucun congé déclaré.</p>
            )}
          </Bloc>
          <Bloc titre="Indisponibilités">
            {formateur.indisponibilites.length ? (
              formateur.indisponibilites.map((c) => <p key={c} className="text-xs">{c}</p>)
            ) : (
              <p className="text-xs text-muted-foreground">Aucune indisponibilité.</p>
            )}
          </Bloc>
        </div>
      )}

      {onglet === "Performance" && (
        <>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
            <Stat label="Sessions réalisées" valeur={p.sessionsRealisees} />
            <Stat label="Heures dispensées" valeur={`${p.heuresDispensees} h`} />
            <Stat label="Participants formés" valeur={p.participantsFormes} />
            <Stat label="Taux de présence" valeur={`${p.tauxPresenceParticipants} %`} />
            <Stat label="Satisfaction" valeur={`${p.satisfaction} / 5`} />
            <Stat label="Évaluations complétées" valeur={`${p.evaluationsCompletees} %`} />
            <Stat label="Taux de clôture" valeur={`${p.tauxCloture} %`} />
            <Stat label="Délai saisie suivi" valeur={p.delaiSaisieSuivi} />
          </div>
          <p className="mt-3 rounded-sm border border-dashed border-border px-3 py-2 text-[11px] text-muted-foreground">
            Le taux de réussite ({p.tauxReussite} %) ne constitue pas à lui seul une évaluation du formateur : il doit être lu
            avec l'assiduité des participants, la nature des modules et le nombre de sessions annulées ({p.sessionsAnnulees}).
          </p>
        </>
      )}

      {onglet === "Historique" && (
        <ul className="divide-y divide-border rounded-md border border-border text-xs">
          {siennes
            .flatMap((s) => s.journal.map((j) => ({ ...j, session: s })))
            .slice(0, 25)
            .map((j, i) => (
              <li key={i} className="flex flex-wrap items-center gap-2 px-3 py-2">
                <span className="num w-28 text-muted-foreground">{j.horodatage}</span>
                <span className="font-medium">{j.action}</span>
                {j.detail && <span className="text-muted-foreground">— {j.detail}</span>}
                <span className="ml-auto text-muted-foreground">
                  {j.session.groupe} · {dureeTexte(j.session)}
                </span>
              </li>
            ))}
        </ul>
      )}
    </Modale>
  );
}

function Bloc({ titre, children }: { titre: string; children: ReactNode }) {
  return (
    <section className="rounded-md border border-border p-3">
      <p className="label-xs mb-2">{titre}</p>
      <div className="space-y-1 text-[11px]">{children}</div>
    </section>
  );
}
