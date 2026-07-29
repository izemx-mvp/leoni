import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowRight,
  CalendarPlus,
  Check,
  FileText,
  MessageSquare,
  Sparkles,
  UserPlus,
  X,
} from "lucide-react";
import { CRITERES_ENTRETIEN } from "@/data/leoni";
import {
  Avatar,
  Barre,
  Btn,
  Field,
  IAWarning,
  PageHeader,
  Panel,
  StatutBadge,
  Tag,
  Table,
  Td,
  Th,
  Tr,
} from "@/components/leoni/kit";
import { useLeoni } from "@/lib/leoni-store";

export const Route = createFileRoute("/recrutement/candidat/$id")({
  head: () => ({
    meta: [
      { title: "Fiche candidat — LEONI Workforce Journey" },
      { name: "description", content: "Dossier candidat consolidé : profil, analyse Talent Fit AI, entretien, communication et décision RH." },
      { property: "og:title", content: "Fiche candidat — LEONI Workforce Journey" },
      { property: "og:description", content: "Dossier candidat 360° du recrutement opérateur." },
    ],
  }),
  component: FicheCandidat,
});

const SECTIONS = [
  "01 Profil",
  "02 Candidature",
  "03 Analyse IA",
  "04 Entretien",
  "05 Communication",
  "06 Décision",
];

function FicheCandidat() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const {
    candidats,
    entretiens,
    planifierEntretien,
    evaluerEntretien,
    changerStatutCandidat,
    transformerEnOuvrier,
    pousserNotification,
  } = useLeoni();
  const candidat = candidats.find((c) => c.id === id);
  const [section, setSection] = useState(SECTIONS[0]);
  const [modale, setModale] = useState<null | "entretien" | "message" | "decision" | "evaluation">(null);
  const [preIntegration, setPreIntegration] = useState(false);
  const [form, setForm] = useState({ date: "2026-08-03", heure: "09:00", type: "Entretien RH" });
  const [message, setMessage] = useState("Bonjour, merci de confirmer votre disponibilité pour l'entretien.");
  const [decision, setDecision] = useState("Retenu");
  const [motif, setMotif] = useState("");
  const [notes, setNotes] = useState<Record<string, number>>(
    Object.fromEntries(CRITERES_ENTRETIEN.map((c) => [c, 4])),
  );

  if (!candidat) {
    return <p className="text-sm text-muted-foreground">Candidature introuvable.</p>;
  }

  const entretiensCandidat = entretiens.filter((e) => e.candidatId === candidat.id);
  const moyenne =
    Object.values(notes).reduce((a, b) => a + b, 0) / Object.values(notes).length;

  const valider = () => {
    if (decision === "Retenu") {
      setModale(null);
      setPreIntegration(true);
      return;
    }
    changerStatutCandidat(candidat.id, decision === "Refusé" ? "Refusé" : "Vivier", motif);
    setModale(null);
  };


  return (
    <>
      <PageHeader
        titre={candidat.nom}
        sousTitre={`${candidat.poste} · ${candidat.site} · Recruteur ${candidat.recruteur}`}
        fil={[
          { label: "Recrutement" },
          { label: "Candidatures", to: "/recrutement/candidatures" },
          { label: candidat.id },
        ]}
      />

      <div className="mb-5 rounded-md border border-border bg-card p-4">
        <div className="flex flex-wrap items-center gap-4">
          <Avatar nom={candidat.nom} size={56} />
          <div className="min-w-0">
            <p className="text-base font-semibold">{candidat.nom}</p>
            <p className="num text-xs text-muted-foreground">
              {candidat.id} · {candidat.poste} · {candidat.site}
            </p>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              <StatutBadge valeur={candidat.statut} />
              <Tag ton={candidat.score >= 80 ? "success" : candidat.score >= 60 ? "warning" : "critical"}>
                Talent Fit AI {candidat.score} %
              </Tag>
              {candidat.ouvrierId && (
                <Link to="/ouvriers/$id" params={{ id: candidat.ouvrierId }}>
                  <Tag ton="brand">Fiche ouvrier {candidat.ouvrierId}</Tag>
                </Link>
              )}
            </div>
          </div>
          <div className="ml-auto flex flex-wrap gap-2">
            <Btn variant="secondary" onClick={() => setModale("entretien")}>
              <CalendarPlus className="size-3.5" /> Planifier entretien
            </Btn>
            <Btn
              variant="secondary"
              onClick={() =>
                pousserNotification({
                  titre: "Documents demandés",
                  detail: `${candidat.nom} — relance documents envoyée par WhatsApp`,
                  ton: "info",
                })
              }
            >
              <FileText className="size-3.5" /> Demander documents
            </Btn>
            <Btn variant="secondary" onClick={() => setModale("message")}>
              <MessageSquare className="size-3.5" /> Envoyer message
            </Btn>
            <Btn variant="secondary" onClick={() => changerStatutCandidat(candidat.id, "Vivier")}>
              <UserPlus className="size-3.5" /> Ajouter au vivier
            </Btn>
            <Btn variant="primary" onClick={() => { setDecision("Retenu"); setModale("decision"); }}>
              <Check className="size-3.5" /> Retenir
            </Btn>
            <Btn variant="danger" onClick={() => { setDecision("Refusé"); setModale("decision"); }}>
              <X className="size-3.5" /> Refuser
            </Btn>
          </div>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-1 border-b border-border">
        {SECTIONS.map((s) => (
          <button
            key={s}
            onClick={() => setSection(s)}
            className={
              s === section
                ? "-mb-px border-b-2 border-[var(--brand)] px-3 py-2 text-sm font-medium text-[var(--brand)]"
                : "-mb-px border-b-2 border-transparent px-3 py-2 text-sm text-muted-foreground hover:text-foreground"
            }
          >
            {s}
          </button>
        ))}
      </div>

      {section === SECTIONS[0] && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Panel title="Coordonnées">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Téléphone" value={candidat.telephone} />
              <Field label="Email" value={candidat.email} />
              <Field label="Ville" value={candidat.ville} />
              <Field label="Mobilité" value={candidat.mobilite} />
              <Field label="Disponibilité" value={candidat.disponibilite} />
              <Field label="Langues" value={candidat.langues} />
            </div>
          </Panel>
          <Panel title="Formation & expérience">
            <div className="space-y-4">
              <Field label="Formation" value={candidat.formation} />
              <Field label="Expérience" value={candidat.experience} />
              <div>
                <p className="label-xs">Compétences</p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {candidat.competences.map((c) => (
                    <Tag key={c} ton="brand">
                      {c}
                    </Tag>
                  ))}
                </div>
              </div>
            </div>
          </Panel>
        </div>
      )}

      {section === SECTIONS[1] && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Panel title="Candidature">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Poste" value={candidat.poste} />
              <Field label="Site" value={candidat.site} />
              <Field label="Source" value={candidat.source} />
              <Field label="Date de réception" value={candidat.date} />
              <Field label="Recruteur" value={candidat.recruteur} />
              <Field label="Statut" value={<StatutBadge valeur={candidat.statut} />} />
            </div>
          </Panel>
          <Panel title="Documents" bodyClassName="p-0">
            <Table>
              <thead>
                <tr>
                  <Th>Document</Th>
                  <Th>Date</Th>
                  <Th>Statut</Th>
                  <Th />
                </tr>
              </thead>
              <tbody>
                {candidat.documents.map((d) => (
                  <Tr key={d.nom}>
                    <Td className="font-medium">{d.nom}</Td>
                    <Td className="num text-muted-foreground">{d.date}</Td>
                    <Td>
                      <StatutBadge valeur={d.statut} />
                    </Td>
                    <Td>
                      <button className="text-xs text-[var(--brand)] hover:underline">Aperçu</button>
                    </Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
          </Panel>
        </div>
      )}

      {section === SECTIONS[2] && (
        <div className="grid gap-4 lg:grid-cols-3">
          <Panel title="Talent Fit AI" subtitle="Analyse automatique du profil vs besoin" className="lg:col-span-2">
            <div className="flex flex-wrap items-center gap-6">
              <div>
                <p className="label-xs">Score global</p>
                <p className="num mt-1 text-4xl font-semibold text-[var(--brand)]">{candidat.score} %</p>
                <Tag ton={candidat.score >= 80 ? "success" : "warning"} className="mt-2">
                  {candidat.recommandation}
                </Tag>
              </div>
              <div className="min-w-64 flex-1 space-y-2.5">
                {candidat.detailScore.map((d) => (
                  <div key={d.label} className="flex items-center gap-3">
                    <span className="w-40 text-xs text-muted-foreground">{d.label}</span>
                    <Barre valeur={d.valeur} ton={d.valeur >= 80 ? "success" : d.valeur >= 60 ? "brand" : "critical"} />
                    <span className="num w-10 text-right text-xs font-medium">{d.valeur} %</span>
                  </div>
                ))}
              </div>
            </div>
            <IAWarning texte="Cette analyse constitue une aide à la décision. La décision finale appartient aux équipes RH." />
          </Panel>
          <Panel title="Lecture IA du dossier">
            <p className="label-xs">Points forts</p>
            <ul className="mt-2 space-y-1.5 text-sm">
              {candidat.forces.map((f) => (
                <li key={f} className="flex gap-2">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-[var(--success)]" />
                  {f}
                </li>
              ))}
            </ul>
            <p className="label-xs mt-4">Points de vigilance</p>
            <ul className="mt-2 space-y-1.5 text-sm">
              {candidat.vigilances.map((f) => (
                <li key={f} className="flex gap-2">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-[var(--warning)]" />
                  {f}
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      )}

      {section === SECTIONS[3] && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Panel
            title="Planning des entretiens"
            action={
              <Btn size="sm" variant="secondary" onClick={() => setModale("entretien")}>
                Planifier
              </Btn>
            }
            bodyClassName="p-0"
          >
            <Table>
              <thead>
                <tr>
                  <Th>Date</Th>
                  <Th>Type</Th>
                  <Th>Évaluateur</Th>
                  <Th>Statut</Th>
                  <Th>Note</Th>
                  <Th />
                </tr>
              </thead>
              <tbody>
                {entretiensCandidat.length === 0 && (
                  <Tr>
                    <Td className="text-muted-foreground">Aucun entretien planifié.</Td>
                    <Td /><Td /><Td /><Td /><Td />
                  </Tr>
                )}
                {entretiensCandidat.map((e) => (
                  <Tr key={e.id}>
                    <Td className="num">{e.date} · {e.heure}</Td>
                    <Td>{e.type}</Td>
                    <Td className="text-muted-foreground">{e.evaluateur}</Td>
                    <Td>
                      <StatutBadge valeur={e.statut} />
                    </Td>
                    <Td className="num">{e.note ? `${e.note}/5` : "—"}</Td>
                    <Td>
                      <button className="text-xs text-[var(--brand)] hover:underline" onClick={() => setModale("evaluation")}>
                        Évaluer
                      </button>
                    </Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
          </Panel>
          <Panel title="Grille d'évaluation" subtitle="Critères standards LEONI Maroc">
            <div className="space-y-2.5">
              {CRITERES_ENTRETIEN.map((c) => (
                <div key={c} className="flex items-center gap-3">
                  <span className="w-48 text-xs text-muted-foreground">{c}</span>
                  <Barre valeur={(notes[c] / 5) * 100} />
                  <span className="num w-8 text-right text-xs">{notes[c]}/5</span>
                </div>
              ))}
            </div>
            <p className="mt-4 text-sm">
              Moyenne : <strong className="num text-[var(--brand)]">{moyenne.toFixed(1)}/5</strong>
            </p>
          </Panel>
        </div>
      )}

      {section === SECTIONS[4] && (
        <Panel title="Communications" subtitle="Emails, WhatsApp et relances" bodyClassName="p-0">
          <Table>
            <thead>
              <tr>
                <Th>Date</Th>
                <Th>Canal</Th>
                <Th>Objet</Th>
                <Th>Statut</Th>
              </tr>
            </thead>
            <tbody>
              <Tr>
                <Td className="num">{candidat.date}</Td>
                <Td>Email</Td>
                <Td>Accusé de réception de candidature</Td>
                <Td><StatutBadge valeur="Ouvert" /></Td>
              </Tr>
              <Tr>
                <Td className="num">{candidat.date}</Td>
                <Td>WhatsApp</Td>
                <Td>Confirmation des documents reçus</Td>
                <Td><StatutBadge valeur="Lu" /></Td>
              </Tr>
              {candidat.entretien !== "-" && (
                <Tr>
                  <Td className="num">26/07/2026</Td>
                  <Td>WhatsApp</Td>
                  <Td>Invitation à l'entretien</Td>
                  <Td><StatutBadge valeur="Répondu" /></Td>
                </Tr>
              )}
            </tbody>
          </Table>
        </Panel>
      )}

      {section === SECTIONS[5] && (
        <div className="grid gap-4 lg:grid-cols-3">
          <Panel title="Décision RH" className="lg:col-span-2">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Avis recruteur" value={candidat.score >= 70 ? "Favorable" : "Réservé"} />
              <Field label="Avis RH" value={candidat.score >= 80 ? "Favorable" : "À arbitrer"} />
              <Field label="Recommandation IA" value={candidat.recommandation} />
              <Field label="Statut actuel" value={<StatutBadge valeur={candidat.statut} />} />
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              <Btn variant="primary" onClick={() => { setDecision("Retenu"); setModale("decision"); }}>
                Retenir et créer la fiche ouvrier <ArrowRight className="size-3.5" />
              </Btn>
              <Btn variant="secondary" onClick={() => { setDecision("Vivier"); setModale("decision"); }}>
                Placer au vivier
              </Btn>
              <Btn variant="danger" onClick={() => { setDecision("Refusé"); setModale("decision"); }}>
                Refuser
              </Btn>
            </div>
            <IAWarning texte="La recommandation IA constitue une aide à la décision et ne remplace pas la validation humaine." />
          </Panel>
          <Panel title="Impact de la décision">
            <ol className="space-y-2 text-xs text-muted-foreground">
              {[
                "Statut candidat = Retenu",
                "Génération du matricule",
                "Création de la fiche ouvrier",
                "Transfert identité, documents, poste, scoring, entretien",
                "Création de l'action « Affecter à un parcours de formation »",
              ].map((t, i) => (
                <li key={t} className="flex gap-2">
                  <span className="num flex size-5 shrink-0 items-center justify-center rounded-sm bg-[var(--brand-soft)] text-[10px] font-semibold text-[var(--brand)]">
                    {i + 1}
                  </span>
                  {t}
                </li>
              ))}
            </ol>
          </Panel>
        </div>
      )}

      {modale && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setModale(null)}>
          <div className="w-full max-w-lg rounded-md border border-border bg-card p-5" onClick={(e) => e.stopPropagation()}>
            {modale === "entretien" && (
              <>
                <h3 className="text-sm font-semibold">Planifier un entretien — {candidat.nom}</h3>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <label className="text-xs">
                    Date
                    <input
                      type="date"
                      value={form.date}
                      onChange={(e) => setForm({ ...form, date: e.target.value })}
                      className="mt-1 h-9 w-full rounded-sm border border-border bg-card px-2 text-sm"
                    />
                  </label>
                  <label className="text-xs">
                    Heure
                    <input
                      type="time"
                      value={form.heure}
                      onChange={(e) => setForm({ ...form, heure: e.target.value })}
                      className="mt-1 h-9 w-full rounded-sm border border-border bg-card px-2 text-sm"
                    />
                  </label>
                  <label className="col-span-2 text-xs">
                    Type d'entretien
                    <select
                      value={form.type}
                      onChange={(e) => setForm({ ...form, type: e.target.value })}
                      className="mt-1 h-9 w-full rounded-sm border border-border bg-card px-2 text-sm"
                    >
                      <option>Entretien RH</option>
                      <option>Entretien technique</option>
                      <option>Entretien collectif</option>
                    </select>
                  </label>
                </div>
                <div className="mt-5 flex justify-end gap-2">
                  <Btn variant="ghost" onClick={() => setModale(null)}>Annuler</Btn>
                  <Btn
                    variant="primary"
                    onClick={() => {
                      planifierEntretien(candidat.id, form.date, form.heure, form.type);
                      setModale(null);
                    }}
                  >
                    Confirmer
                  </Btn>
                </div>
              </>
            )}

            {modale === "message" && (
              <>
                <h3 className="text-sm font-semibold">Message WhatsApp — {candidat.nom}</h3>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={5}
                  className="mt-3 w-full rounded-sm border border-border bg-card p-2 text-sm"
                />
                <div className="mt-4 flex justify-end gap-2">
                  <Btn variant="ghost" onClick={() => setModale(null)}>Annuler</Btn>
                  <Btn
                    variant="primary"
                    onClick={() => {
                      pousserNotification({ titre: "Message envoyé", detail: `${candidat.nom} — WhatsApp distribué`, ton: "success" });
                      setModale(null);
                    }}
                  >
                    Envoyer
                  </Btn>
                </div>
              </>
            )}

            {modale === "evaluation" && (
              <>
                <h3 className="text-sm font-semibold">Évaluation d'entretien — {candidat.nom}</h3>
                <div className="mt-4 space-y-2">
                  {CRITERES_ENTRETIEN.map((c) => (
                    <label key={c} className="flex items-center gap-3 text-xs">
                      <span className="w-44 text-muted-foreground">{c}</span>
                      <input
                        type="range"
                        min={1}
                        max={5}
                        step={0.5}
                        value={notes[c]}
                        onChange={(e) => setNotes({ ...notes, [c]: Number(e.target.value) })}
                        className="flex-1 accent-[var(--brand)]"
                      />
                      <span className="num w-8 text-right">{notes[c]}</span>
                    </label>
                  ))}
                </div>
                <p className="mt-3 text-sm">Moyenne : <strong className="num">{moyenne.toFixed(1)}/5</strong></p>
                <div className="mt-4 flex justify-end gap-2">
                  <Btn variant="ghost" onClick={() => setModale(null)}>Annuler</Btn>
                  <Btn
                    variant="primary"
                    onClick={() => {
                      const e = entretiensCandidat[0];
                      if (e) evaluerEntretien(e.id, moyenne);
                      setModale(null);
                    }}
                  >
                    Enregistrer le compte rendu
                  </Btn>
                </div>
              </>
            )}

            {modale === "decision" && (
              <>
                <h3 className="flex items-center gap-2 text-sm font-semibold">
                  <Sparkles className="size-4 text-[var(--brand)]" /> Décision RH — {candidat.nom}
                </h3>
                <div className="mt-4 space-y-3 text-xs">
                  <label className="block">
                    Décision
                    <select
                      value={decision}
                      onChange={(e) => setDecision(e.target.value)}
                      className="mt-1 h-9 w-full rounded-sm border border-border bg-card px-2 text-sm"
                    >
                      <option>Retenu</option>
                      <option>Vivier</option>
                      <option>Refusé</option>
                    </select>
                  </label>
                  <label className="block">
                    Motif / commentaire {decision === "Refusé" && <span className="text-[var(--critical)]">*</span>}
                    <textarea
                      value={motif}
                      onChange={(e) => setMotif(e.target.value)}
                      rows={3}
                      className="mt-1 w-full rounded-sm border border-border bg-card p-2 text-sm"
                      placeholder="Justification de la décision"
                    />
                  </label>
                  <p className="text-muted-foreground">Responsable : Nadia El Ghali · Date : 28/07/2026</p>
                </div>
                <div className="mt-5 flex justify-end gap-2">
                  <Btn variant="ghost" onClick={() => setModale(null)}>Annuler</Btn>
                  <Btn variant="primary" disabled={decision === "Refusé" && !motif.trim()} onClick={valider}>
                    Valider la décision
                  </Btn>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
