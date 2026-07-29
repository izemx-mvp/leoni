import { useState } from "react";
import { cn } from "@/lib/utils";
import { Avatar, Barre, Btn, Champ, Input, Onglets, Tag, Textarea } from "@/components/leoni/kit";
import {
  FORMATEURS,
  GROUPES,
  SALLES,
  STATUTS_SESSION,
  dureeTexte,
  formateurParId,
  formatLong,
  salleParId,
  type SessionPlanning,
} from "@/data/planning";
import { actionsPlanning, detecterConflits, type Conflit } from "@/lib/planning-store";
import { tonSessionStatut } from "./commun";

const tonParticipant = (s: string) =>
  s === "Confirmé" ? "success" : s === "Lu" ? "info" : s === "Absent prévu" ? "critical" : s === "Invitation envoyée" ? "brand" : "neutral";

export function SessionDrawer({
  session,
  sessions,
  onClose,
  onOuvrirFormateur,
  onNotifier,
}: {
  session: SessionPlanning;
  sessions: SessionPlanning[];
  onClose: () => void;
  onOuvrirFormateur: (id: string) => void;
  onNotifier: (message: string) => void;
}) {
  const [onglet, setOnglet] = useState("Détails");
  const [edition, setEdition] = useState(false);
  const [brouillon, setBrouillon] = useState(session);

  const conflits: Conflit[] = detecterConflits(edition ? brouillon : session, sessions, session.id);
  const formateur = formateurParId(session.formateurId);
  const salle = salleParId(session.salleId);
  const remplissage = Math.round((session.participants.length / session.capacite) * 100);

  const enregistrer = () => {
    actionsPlanning.modifier(session.id, {
      date: brouillon.date,
      debut: brouillon.debut,
      fin: brouillon.fin,
      formateurId: brouillon.formateurId,
      salleId: brouillon.salleId,
      groupe: brouillon.groupe,
      statut: brouillon.statut,
      instructions: brouillon.instructions,
      materiel: brouillon.materiel,
      capacite: brouillon.capacite,
    });
    setEdition(false);
    onNotifier("Session mise à jour");
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-[2px]" onClick={onClose}>
      <aside
        onClick={(e) => e.stopPropagation()}
        className="flex h-full w-full max-w-2xl flex-col border-l border-border bg-card shadow-2xl"
      >
        <header className="border-b border-border px-4 py-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="num text-[11px] text-muted-foreground">{session.id} · {session.formationCode}</p>
              <h2 className="text-sm font-semibold tracking-tight">
                {session.groupe} — {session.moduleNom}
              </h2>
              <p className="num mt-0.5 text-xs text-muted-foreground">
                {formatLong(session.date)} · {session.debut} – {session.fin} ({dureeTexte(session)})
              </p>
            </div>
            <button onClick={onClose} aria-label="Fermer" className="rounded-sm px-2 py-1 text-sm text-muted-foreground hover:bg-[var(--hover)]">
              ✕
            </button>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <Tag ton={tonSessionStatut(session.statut)}>{session.statut}</Tag>
            <Tag ton="info">{session.type}</Tag>
            <Tag ton="neutral">{session.site}</Tag>
            {conflits.length > 0 && <Tag ton="critical">{conflits.length} conflit(s)</Tag>}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4">
          {conflits.length > 0 && (
            <ul className="mb-3 space-y-1 rounded-md border border-[color-mix(in_oklab,var(--critical)_35%,transparent)] bg-[color-mix(in_oklab,var(--critical)_8%,transparent)] p-3">
              {conflits.map((c, i) => (
                <li key={i} className="text-[11px] text-[var(--critical)]">
                  <span className="font-semibold">{c.type} :</span> {c.message}
                </li>
              ))}
            </ul>
          )}

          <Onglets
            valeurs={["Détails", "Participants", "Notifications", "Journal"]}
            actif={onglet}
            onChange={setOnglet}
          />

          {onglet === "Détails" &&
            (edition ? (
              <div className="grid gap-3 sm:grid-cols-2">
                <Input
                  label="Date"
                  type="date"
                  value={brouillon.date}
                  onChange={(e) => setBrouillon({ ...brouillon, date: e.target.value })}
                />
                <div className="grid grid-cols-2 gap-2">
                  <Input label="Début" type="time" value={brouillon.debut} onChange={(e) => setBrouillon({ ...brouillon, debut: e.target.value })} />
                  <Input label="Fin" type="time" value={brouillon.fin} onChange={(e) => setBrouillon({ ...brouillon, fin: e.target.value })} />
                </div>
                <Champ
                  label="Formateur"
                  value={formateurParId(brouillon.formateurId)?.nom ?? ""}
                  onChange={(v) => setBrouillon({ ...brouillon, formateurId: FORMATEURS.find((f) => f.nom === v)!.id })}
                  options={FORMATEURS.map((f) => f.nom)}
                />
                <Champ
                  label="Salle"
                  value={salleParId(brouillon.salleId)?.nom ?? ""}
                  onChange={(v) => {
                    const s = SALLES.find((x) => x.nom === v)!;
                    setBrouillon({ ...brouillon, salleId: s.id, site: s.site, batiment: s.batiment });
                  }}
                  options={SALLES.map((s) => s.nom)}
                />
                <Champ
                  label="Groupe"
                  value={brouillon.groupe}
                  onChange={(v) => setBrouillon({ ...brouillon, groupe: v })}
                  options={GROUPES.map((g) => g.code)}
                />
                <Champ
                  label="Statut"
                  value={brouillon.statut}
                  onChange={(v) => setBrouillon({ ...brouillon, statut: v as SessionPlanning["statut"] })}
                  options={STATUTS_SESSION}
                />
                <Input
                  label="Capacité"
                  type="number"
                  value={brouillon.capacite}
                  onChange={(e) => setBrouillon({ ...brouillon, capacite: Number(e.target.value) })}
                />
                <div className="sm:col-span-2">
                  <Textarea
                    label="Instructions"
                    rows={3}
                    value={brouillon.instructions}
                    onChange={(e) => setBrouillon({ ...brouillon, instructions: e.target.value })}
                  />
                </div>
                <div className="sm:col-span-2">
                  <Textarea
                    label="Matériel requis"
                    rows={2}
                    value={brouillon.materiel}
                    onChange={(e) => setBrouillon({ ...brouillon, materiel: e.target.value })}
                  />
                </div>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                <Bloc titre="Formation">
                  <L k="Formation" v={session.formationNom} />
                  <L k="Module" v={session.moduleNom} />
                  <L k="Type" v={session.type} />
                  <L k="Durée" v={dureeTexte(session)} />
                </Bloc>
                <Bloc titre="Lieu">
                  <L k="Site" v={session.site} />
                  <L k="Bâtiment" v={session.batiment} />
                  <L k="Salle" v={`${salle?.nom} (${salle?.capacite} places)`} />
                  <L k="Équipements" v={salle?.equipements.join(", ") ?? "—"} />
                </Bloc>
                <Bloc titre="Formateur">
                  <div className="flex items-center gap-2">
                    <Avatar nom={formateur?.nom ?? "?"} size={30} />
                    <div>
                      <button onClick={() => onOuvrirFormateur(session.formateurId)} className="text-xs font-medium hover:text-[var(--brand)]">
                        {formateur?.nom}
                      </button>
                      <p className="text-[10px] text-muted-foreground">{formateur?.fonction}</p>
                    </div>
                  </div>
                  <L k="Téléphone" v={formateur?.telephone ?? "—"} />
                  <L k="Email" v={formateur?.email ?? "—"} />
                </Bloc>
                <Bloc titre="Suivi">
                  <L k="Présences saisies" v={`${session.presencesSaisies} / ${session.participants.length}`} />
                  <L k="Évaluations saisies" v={`${session.evaluationsSaisies} / ${session.participants.length}`} />
                  <L k="Observations" v={`${session.observations}`} />
                  <L k="Notifications" v={`${session.notifications.envoyees} envoyées · ${session.notifications.lues} lues`} />
                </Bloc>
                <div className="sm:col-span-2">
                  <Bloc titre="Instructions & matériel">
                    <p className="text-[11px]">{session.instructions}</p>
                    <p className="mt-1 text-[11px] text-muted-foreground">Matériel : {session.materiel}</p>
                  </Bloc>
                </div>
              </div>
            ))}

          {onglet === "Participants" && (
            <>
              <div className="mb-2 flex items-center gap-3">
                <div className="w-40">
                  <Barre valeur={Math.min(100, remplissage)} ton={remplissage > 100 ? "critical" : "brand"} />
                </div>
                <span className="num text-xs text-muted-foreground">
                  {session.participants.length} / {session.capacite} inscrits ({remplissage} %)
                </span>
              </div>
              <ul className="divide-y divide-border rounded-md border border-border">
                {session.participants.map((p) => (
                  <li key={p.workerId} className="flex items-center gap-2 px-3 py-2 text-xs">
                    <Avatar nom={p.nom} size={26} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{p.nom}</p>
                      <p className="num truncate text-[10px] text-muted-foreground">
                        {p.workerId} · {p.poste}
                      </p>
                    </div>
                    <Tag ton={tonParticipant(p.statut)}>{p.statut}</Tag>
                    <Btn
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        actionsPlanning.retirerParticipant(session.id, p.workerId);
                        onNotifier(`${p.nom} retiré(e) de la session`);
                      }}
                    >
                      Retirer
                    </Btn>
                  </li>
                ))}
                {session.participants.length === 0 && (
                  <li className="px-3 py-6 text-center text-xs text-muted-foreground">Aucun participant affecté.</li>
                )}
              </ul>
            </>
          )}

          {onglet === "Notifications" && (
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-2">
                <Compteur label="Invitations envoyées" v={session.notifications.envoyees} />
                <Compteur label="Lues" v={session.notifications.lues} />
                <Compteur label="Confirmées" v={session.participants.filter((p) => p.statut === "Confirmé").length} />
              </div>
              <div className="rounded-md border border-border p-3 text-[11px]">
                <p className="label-xs mb-1">Message type</p>
                <p className="text-muted-foreground">
                  Bonjour, votre session « {session.moduleNom} » ({session.groupe}) est prévue le{" "}
                  {formatLong(session.date)} de {session.debut} à {session.fin}, {salle?.nom} — {session.site}. Merci de
                  vous présenter 10 minutes avant avec vos EPI.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Btn
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    actionsPlanning.notifier(session.id);
                    onNotifier(`Convocations envoyées à ${session.participants.length} participants`);
                  }}
                >
                  Envoyer les convocations
                </Btn>
                <Btn size="sm" onClick={() => onNotifier("Rappel WhatsApp programmé la veille à 18:00")}>
                  Programmer un rappel
                </Btn>
              </div>
            </div>
          )}

          {onglet === "Journal" && (
            <ul className="divide-y divide-border rounded-md border border-border text-[11px]">
              {[...session.journal].reverse().map((j, i) => (
                <li key={i} className="px-3 py-2">
                  <div className="flex justify-between gap-2">
                    <span className="font-medium">{j.action}</span>
                    <span className="num text-muted-foreground">{j.horodatage}</span>
                  </div>
                  {j.detail && <p className="text-muted-foreground">{j.detail}</p>}
                  <p className="text-muted-foreground">par {j.auteur}</p>
                </li>
              ))}
            </ul>
          )}
        </div>

        <footer className="flex flex-wrap items-center gap-2 border-t border-border px-4 py-3">
          {edition ? (
            <>
              <Btn variant="primary" size="sm" onClick={enregistrer} disabled={conflits.length > 0}>
                Enregistrer
              </Btn>
              <Btn size="sm" onClick={() => { setBrouillon(session); setEdition(false); }}>
                Annuler
              </Btn>
              {conflits.length > 0 && <span className="text-[11px] text-[var(--critical)]">Résolvez les conflits pour enregistrer.</span>}
            </>
          ) : (
            <>
              <Btn variant="primary" size="sm" onClick={() => { setBrouillon(session); setEdition(true); }}>
                Modifier
              </Btn>
              <Btn
                size="sm"
                onClick={() => {
                  actionsPlanning.changerStatut(session.id, session.statut === "Confirmée" ? "Planifiée" : "Confirmée");
                  onNotifier("Statut mis à jour");
                }}
              >
                {session.statut === "Confirmée" ? "Repasser en planifiée" : "Confirmer"}
              </Btn>
              <Btn size="sm" onClick={() => { actionsPlanning.dupliquer(session.id); onNotifier("Session dupliquée en brouillon"); }}>
                Dupliquer
              </Btn>
              <Btn
                size="sm"
                onClick={() => {
                  actionsPlanning.changerStatut(session.id, "Reportée");
                  onNotifier("Session marquée comme reportée");
                }}
              >
                Reporter
              </Btn>
              <Btn
                variant="danger"
                size="sm"
                className="ml-auto"
                onClick={() => {
                  actionsPlanning.changerStatut(session.id, "Annulée");
                  onNotifier("Session annulée — participants notifiés");
                }}
              >
                Annuler la session
              </Btn>
            </>
          )}
        </footer>
      </aside>
    </div>
  );
}

function Bloc({ titre, children }: { titre: string; children: React.ReactNode }) {
  return (
    <section className="rounded-md border border-border p-3">
      <p className="label-xs mb-2">{titre}</p>
      <div className="space-y-1">{children}</div>
    </section>
  );
}

function L({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-3 text-[11px]">
      <span className="shrink-0 text-muted-foreground">{k}</span>
      <span className="truncate text-right">{v}</span>
    </div>
  );
}

function Compteur({ label, v }: { label: string; v: number }) {
  return (
    <div className={cn("rounded-sm border border-border px-3 py-2")}>
      <p className="label-xs">{label}</p>
      <p className="num mt-1 text-lg font-semibold">{v}</p>
    </div>
  );
}
