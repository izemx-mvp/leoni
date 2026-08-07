import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  MessageSquare,
  MoreHorizontal,
  Paperclip,
  Plus,
  Search,
  Send,
  Lock,
  UserPlus,
} from "lucide-react";
import {
  AvatarRec,
  BadgeSla,
  BadgeStatut,
  Bloc,
  BoutonR,
  Carte,
  Chip,
  Etoiles,
  Ligne,
  PrioriteIndic,
  Squelette,
  VideR,
} from "./kit";
import { useRec } from "@/lib/reclamations-store";
import {
  CATEGORIES,
  EQUIPES,
  LIBELLE_STATUT,
  PRIORITES,
  RESPONSABLES,
  SOURCES,
  TYPES_SOLUTION,
  UTILISATEUR_COURANT,
  tempsEcoule,
  type EquipeRec,
  type PrioriteRec,
  type Rec,
  type StatutRec,
} from "@/data/reclamations-v2";

const SITES = ["Bouskoura", "Berrechid", "Bouznika", "Aïn Sebaâ", "Agadir"];

type Vue =
  | "toutes"
  | "new"
  | "in_progress"
  | "resolved"
  | "miennes"
  | "non_assignees"
  | "critiques"
  | "sla_risque"
  | "sla_depasse";

const VUES: { cle: Vue; label: string }[] = [
  { cle: "toutes", label: "Toutes" },
  { cle: "new", label: "Nouvelles" },
  { cle: "in_progress", label: "En cours de traitement" },
  { cle: "resolved", label: "Traitées" },
];

const VUES_2: { cle: Vue; label: string }[] = [
  { cle: "miennes", label: "Mes réclamations" },
  { cle: "non_assignees", label: "Non assignées" },
  { cle: "critiques", label: "Critiques" },
  { cle: "sla_risque", label: "SLA à risque" },
  { cle: "sla_depasse", label: "SLA dépassé" },
];

interface Filtres {
  site: string;
  categorie: string;
  priorite: string;
  responsable: string;
  equipe: string;
  source: string;
  satisfaction: string;
  sla: string;
}

const FILTRES_VIDES: Filtres = {
  site: "",
  categorie: "",
  priorite: "",
  responsable: "",
  equipe: "",
  source: "",
  satisfaction: "",
  sla: "",
};

const selectCls =
  "h-8 rounded-lg border border-border bg-card px-2 text-[11px] text-foreground outline-none transition-colors focus:border-[var(--brand)]";

export function BoiteTraitement() {
  const { reclamations, marquerLu } = useRec();
  const [vue, setVue] = useState<Vue>("toutes");
  const [q, setQ] = useState("");
  const [filtres, setFiltres] = useState<Filtres>(FILTRES_VIDES);
  const [ouvrirFiltres, setOuvrirFiltres] = useState(false);
  const [selection, setSelection] = useState<string | null>("REC-2026-091");
  const [chargement, setChargement] = useState(true);
  const [toast, setToast] = useState<string | null>(null);
  const [detailMobile, setDetailMobile] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setChargement(false), 320);
    return () => clearTimeout(t);
  }, []);

  const notifier = (m: string) => {
    setToast(m);
    setTimeout(() => setToast(null), 2600);
  };

  const compteur = (cle: Vue) => filtrerVue(reclamations, cle).length;

  const liste = useMemo(() => {
    let l = filtrerVue(reclamations, vue);
    const t = q.trim().toLowerCase();
    if (t) {
      l = l.filter((r) =>
        [r.id, r.ouvrier, r.matricule, r.objet, r.categorie, r.assigneA ?? ""].join(" ").toLowerCase().includes(t),
      );
    }
    if (filtres.site) l = l.filter((r) => r.site === filtres.site);
    if (filtres.categorie) l = l.filter((r) => r.categorie === filtres.categorie);
    if (filtres.priorite) l = l.filter((r) => r.priorite === filtres.priorite);
    if (filtres.responsable) l = l.filter((r) => r.assigneA === filtres.responsable);
    if (filtres.equipe) l = l.filter((r) => r.equipe === filtres.equipe);
    if (filtres.source) l = l.filter((r) => r.source === filtres.source);
    if (filtres.sla) l = l.filter((r) => r.slaStatut === filtres.sla);
    if (filtres.satisfaction) l = l.filter((r) => String(r.satisfaction?.note ?? "") === filtres.satisfaction);
    return [...l].sort((a, b) => a.minutes - b.minutes);
  }, [reclamations, vue, q, filtres]);

  const courante = reclamations.find((r) => r.id === selection) ?? null;

  const chips = Object.entries(filtres).filter(([, v]) => v);

  const choisir = (id: string) => {
    setSelection(id);
    setDetailMobile(true);
    marquerLu(id);
  };

  return (
    <div className="relative">
      <div className="grid gap-3 lg:grid-cols-[210px_minmax(0,1fr)] xl:grid-cols-[210px_minmax(320px,400px)_minmax(0,1fr)]">
        {/* ZONE GAUCHE */}
        <aside className="hidden lg:block">
          <Carte className="sticky top-4 p-2">
            <nav className="space-y-0.5">
              {VUES.map((v) => (
                <ItemVue key={v.cle} actif={vue === v.cle} label={v.label} total={compteur(v.cle)} onClick={() => setVue(v.cle)} />
              ))}
              <div className="my-2 h-px bg-border" />
              {VUES_2.map((v) => (
                <ItemVue key={v.cle} actif={vue === v.cle} label={v.label} total={compteur(v.cle)} onClick={() => setVue(v.cle)} />
              ))}
            </nav>
          </Carte>
        </aside>

        {/* ZONE CENTRALE */}
        <section className={`${detailMobile ? "hidden xl:block" : "block"} min-w-0`}>
          <Carte className="overflow-hidden">
            <div className="border-b border-border p-2.5">
              <div className="flex items-center gap-2">
                <div className="relative min-w-0 flex-1">
                  <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                  <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Rechercher une réclamation, un ouvrier, une référence…"
                    className="h-8 w-full rounded-lg border border-border bg-background pl-8 pr-2 text-[11px] outline-none transition-colors placeholder:text-muted-foreground focus:border-[var(--brand)]"
                  />
                </div>
                <BoutonR taille="sm" onClick={() => setOuvrirFiltres((v) => !v)} variante={ouvrirFiltres ? "primaire" : "secondaire"}>
                  Filtres
                </BoutonR>
              </div>

              {ouvrirFiltres && (
                <div className="mt-2 grid grid-cols-2 gap-1.5">
                  <SelectF valeur={filtres.site} onChange={(v) => setFiltres({ ...filtres, site: v })} label="Site" options={SITES} />
                  <SelectF valeur={filtres.categorie} onChange={(v) => setFiltres({ ...filtres, categorie: v })} label="Catégorie" options={CATEGORIES} />
                  <SelectF valeur={filtres.priorite} onChange={(v) => setFiltres({ ...filtres, priorite: v })} label="Priorité" options={[...PRIORITES]} />
                  <SelectF valeur={filtres.responsable} onChange={(v) => setFiltres({ ...filtres, responsable: v })} label="Responsable" options={RESPONSABLES} />
                  <SelectF valeur={filtres.equipe} onChange={(v) => setFiltres({ ...filtres, equipe: v })} label="Équipe" options={[...EQUIPES]} />
                  <SelectF valeur={filtres.source} onChange={(v) => setFiltres({ ...filtres, source: v })} label="Source" options={[...SOURCES]} />
                  <SelectF valeur={filtres.sla} onChange={(v) => setFiltres({ ...filtres, sla: v })} label="SLA" options={["ok", "risque", "depasse"]} />
                  <SelectF valeur={filtres.satisfaction} onChange={(v) => setFiltres({ ...filtres, satisfaction: v })} label="Satisfaction" options={["1", "2", "3", "4", "5"]} />
                </div>
              )}

              {chips.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {chips.map(([k, v]) => (
                    <Chip key={k} onRemove={() => setFiltres({ ...filtres, [k]: "" })}>
                      {v}
                    </Chip>
                  ))}
                  <button onClick={() => setFiltres(FILTRES_VIDES)} className="text-[11px] text-muted-foreground hover:text-foreground">
                    Tout effacer
                  </button>
                </div>
              )}
            </div>

            <div className="max-h-[calc(100vh-230px)] overflow-y-auto">
              {chargement ? (
                <Squelette lignes={6} />
              ) : liste.length === 0 ? (
                <VideR texte="Aucune réclamation ne correspond à cette vue." />
              ) : (
                <ul className="divide-y divide-border">
                  {liste.map((r) => (
                    <li key={r.id}>
                      <button
                        onClick={() => choisir(r.id)}
                        className={`w-full px-3.5 py-3 text-left transition-colors ${
                          selection === r.id ? "bg-[var(--selected)]" : "hover:bg-[var(--hover)]"
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          <AvatarRec nom={r.ouvrier} />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="num text-[10px] text-[var(--brand)]">{r.id}</span>
                              {r.nonLu && <span className="size-1.5 rounded-full bg-[var(--brand)]" title="Nouveau message" />}
                              <span className="ml-auto shrink-0 text-[10px] text-muted-foreground">{tempsEcoule(r.minutes)}</span>
                            </div>
                            <p className="mt-0.5 truncate text-xs font-semibold">{r.objet}</p>
                            <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                              {r.ouvrier} · {r.site} · {r.categorie}
                            </p>
                            <div className="mt-1.5 flex flex-wrap items-center gap-2">
                              <BadgeStatut statut={r.statut} compact />
                              <PrioriteIndic priorite={r.priorite} />
                              {r.statut !== "resolved" && r.slaStatut !== "ok" && <BadgeSla statut={r.slaStatut} />}
                            </div>
                          </div>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </Carte>
        </section>

        {/* ZONE DROITE */}
        <section className={`${detailMobile ? "block" : "hidden xl:block"} min-w-0`}>
          {courante ? (
            <Detail rec={courante} onRetour={() => setDetailMobile(false)} notifier={notifier} />
          ) : (
            <Carte className="grid h-72 place-items-center">
              <p className="text-xs text-muted-foreground">Sélectionnez une réclamation pour la traiter.</p>
            </Carte>
          )}
        </section>
      </div>

      {toast && (
        <div className="fixed bottom-5 right-5 z-50 animate-in fade-in slide-in-from-bottom-2 rounded-xl border border-border bg-card px-4 py-2.5 text-xs font-medium shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}

function filtrerVue(liste: Rec[], vue: Vue): Rec[] {
  switch (vue) {
    case "new":
    case "in_progress":
    case "resolved":
      return liste.filter((r) => r.statut === (vue as StatutRec));
    case "miennes":
      return liste.filter((r) => r.assigneA === UTILISATEUR_COURANT);
    case "non_assignees":
      return liste.filter((r) => !r.assigneA);
    case "critiques":
      return liste.filter((r) => r.priorite === "Critique" && r.statut !== "resolved");
    case "sla_risque":
      return liste.filter((r) => r.slaStatut === "risque" && r.statut !== "resolved");
    case "sla_depasse":
      return liste.filter((r) => r.slaStatut === "depasse" && r.statut !== "resolved");
    default:
      return liste;
  }
}

function ItemVue({ actif, label, total, onClick }: { actif: boolean; label: string; total: number; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 text-left text-[11px] transition-colors ${
        actif ? "bg-[var(--selected)] font-medium text-[var(--brand)]" : "text-muted-foreground hover:bg-[var(--hover)] hover:text-foreground"
      }`}
    >
      <span className="truncate">{label}</span>
      <span className="num shrink-0 tabular-nums text-[10px] opacity-70">{total}</span>
    </button>
  );
}

function SelectF({ valeur, onChange, label, options }: { valeur: string; onChange: (v: string) => void; label: string; options: string[] }) {
  return (
    <select className={selectCls} value={valeur} onChange={(e) => onChange(e.target.value)}>
      <option value="">{label}</option>
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
}

/* ------------------------------- Panneau détail ------------------------------- */

function Detail({ rec, onRetour, notifier }: { rec: Rec; onRetour: () => void; notifier: (m: string) => void }) {
  const { prendreEnCharge, assigner, changerPriorite, envoyerMessage, ajouterAction, changerStatutAction, traiter, remettreEnTraitement } = useRec();
  const [texte, setTexte] = useState("");
  const [interne, setInterne] = useState(false);
  const [menu, setMenu] = useState(false);
  const [modaleAssigner, setModaleAssigner] = useState(false);
  const [modaleTraiter, setModaleTraiter] = useState(false);
  const [modaleAction, setModaleAction] = useState(false);
  const filDiscussion = useRef<HTMLDivElement>(null);

  useEffect(() => {
    filDiscussion.current?.scrollTo({ top: filDiscussion.current.scrollHeight, behavior: "smooth" });
  }, [rec.messages.length, rec.id]);

  const envoyer = () => {
    if (!texte.trim()) return;
    envoyerMessage(rec.id, texte.trim(), interne);
    setTexte("");
    notifier(interne ? "Note interne enregistrée" : "Réponse envoyée à l'ouvrier");
  };

  return (
    <div className="space-y-3">
      <Carte className="overflow-hidden">
        <div className="border-b border-border px-4 py-3">
          <div className="flex items-start gap-3">
            <button onClick={onRetour} className="xl:hidden" aria-label="Retour à la liste">
              <ArrowLeft className="size-4 text-muted-foreground" />
            </button>
            <div className="min-w-0 flex-1">
              <p className="num text-[10px] text-[var(--brand)]">{rec.id}</p>
              <h2 className="truncate text-sm font-semibold">{rec.objet}</h2>
              <div className="mt-1.5 flex flex-wrap items-center gap-2">
                <BadgeStatut statut={rec.statut} />
                <PrioriteIndic priorite={rec.priorite} />
                <BadgeSla statut={rec.slaStatut} />
              </div>
            </div>
            <div className="relative shrink-0">
              <button onClick={() => setMenu((v) => !v)} className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-[var(--hover)]" aria-label="Plus d'actions">
                <MoreHorizontal className="size-4" />
              </button>
              {menu && (
                <div className="absolute right-0 z-20 mt-1 w-52 rounded-xl border border-border bg-card p-1 shadow-lg">
                  {PRIORITES.map((p) => (
                    <button
                      key={p}
                      onClick={() => {
                        changerPriorite(rec.id, p as PrioriteRec);
                        setMenu(false);
                        notifier(`Priorité modifiée : ${p}`);
                      }}
                      className="block w-full rounded-lg px-2.5 py-1.5 text-left text-[11px] hover:bg-[var(--hover)]"
                    >
                      Priorité → {p}
                    </button>
                  ))}
                  <div className="my-1 h-px bg-border" />
                  <button onClick={() => { setMenu(false); notifier("Observateur ajouté"); }} className="block w-full rounded-lg px-2.5 py-1.5 text-left text-[11px] hover:bg-[var(--hover)]">
                    Ajouter un observateur
                  </button>
                  <button onClick={() => { setMenu(false); notifier("Export généré"); }} className="block w-full rounded-lg px-2.5 py-1.5 text-left text-[11px] hover:bg-[var(--hover)]">
                    Exporter la réclamation
                  </button>
                  <button onClick={() => { setMenu(false); notifier(`Fiche ouvrier ${rec.ouvrier}`); }} className="block w-full rounded-lg px-2.5 py-1.5 text-left text-[11px] hover:bg-[var(--hover)]">
                    Voir la fiche ouvrier
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {rec.statut !== "resolved" && (
              <>
                <BoutonR
                  taille="sm"
                  variante="primaire"
                  onClick={() => {
                    prendreEnCharge(rec.id);
                    notifier("Réclamation prise en charge");
                  }}
                >
                  <UserPlus className="size-3.5" /> Prendre en charge
                </BoutonR>
                <BoutonR taille="sm" onClick={() => setModaleAssigner(true)}>
                  Assigner
                </BoutonR>
                <BoutonR taille="sm" onClick={() => setModaleTraiter(true)}>
                  <CheckCircle2 className="size-3.5" /> Traiter
                </BoutonR>
              </>
            )}
            {rec.statut === "resolved" && (
              <BoutonR
                taille="sm"
                onClick={() => {
                  remettreEnTraitement(rec.id, "Le problème persiste selon l'ouvrier.");
                  notifier("Réclamation remise en traitement");
                }}
              >
                Remettre en traitement
              </BoutonR>
            )}
          </div>
        </div>

        {rec.statut === "resolved" && rec.resolution && (
          <div className="border-b border-border bg-[var(--success)]/5 px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--success)]">Traité</p>
            <div className="mt-1 grid gap-x-6 sm:grid-cols-2">
              <Ligne label="Date" valeur={`${rec.resolution.date} – ${rec.resolution.heure}`} />
              <Ligne label="Traité par" valeur={rec.resolution.traitePar} />
              <Ligne label="Durée totale" valeur={rec.resolution.duree} />
              <Ligne label="Solution" valeur={rec.resolution.action} />
            </div>
          </div>
        )}
      </Carte>

      <div className="grid gap-3 2xl:grid-cols-[minmax(0,1fr)_260px]">
        <div className="min-w-0 space-y-3">
          <Bloc titre="Description">
            <p className="text-xs leading-relaxed text-foreground">{rec.description}</p>
            {rec.piecesJointes.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {rec.piecesJointes.map((p) => (
                  <span key={p.id} className="inline-flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1 text-[11px] text-muted-foreground">
                    <Paperclip className="size-3" /> {p.nom} · {p.taille}
                  </span>
                ))}
              </div>
            )}
          </Bloc>

          <Bloc titre="Conversation">
            <div ref={filDiscussion} className="max-h-72 space-y-3 overflow-y-auto pr-1">
              {rec.messages.map((m) =>
                m.role === "system" ? (
                  <p key={m.id} className="text-center text-[10px] uppercase tracking-[0.06em] text-muted-foreground">
                    {m.heure} · {m.texte}
                  </p>
                ) : (
                  <div key={m.id} className={`flex gap-2.5 ${m.role === "responsable" ? "flex-row-reverse" : ""}`}>
                    <AvatarRec nom={m.auteur} taille={26} />
                    <div className={`min-w-0 max-w-[80%] ${m.role === "responsable" ? "text-right" : ""}`}>
                      <p className="text-[10px] text-muted-foreground">
                        {m.auteur} · {m.heure}
                        {m.interne && " · note interne"}
                      </p>
                      <div
                        className={`mt-1 inline-block rounded-xl px-3 py-2 text-left text-[11px] leading-relaxed ${
                          m.interne
                            ? "border border-dashed border-[var(--warning)]/40 bg-[var(--warning)]/5 text-foreground"
                            : m.role === "responsable"
                              ? "bg-[var(--brand)]/10 text-foreground"
                              : "bg-[var(--hover)] text-foreground"
                        }`}
                      >
                        {m.interne && <Lock className="mr-1.5 inline size-3 text-[var(--warning)]" />}
                        {m.texte}
                      </div>
                    </div>
                  </div>
                ),
              )}
            </div>

            <div className="mt-3 rounded-xl border border-border">
              <div className="flex items-center gap-1 border-b border-border p-1.5">
                <button
                  onClick={() => setInterne(false)}
                  className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] transition-colors ${!interne ? "bg-[var(--brand)]/10 font-medium text-[var(--brand)]" : "text-muted-foreground hover:bg-[var(--hover)]"}`}
                >
                  <MessageSquare className="size-3" /> Réponse à l'ouvrier
                </button>
                <button
                  onClick={() => setInterne(true)}
                  className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] transition-colors ${interne ? "bg-[var(--warning)]/10 font-medium text-[var(--warning)]" : "text-muted-foreground hover:bg-[var(--hover)]"}`}
                >
                  <Lock className="size-3" /> Note interne
                </button>
              </div>
              <textarea
                rows={3}
                value={texte}
                onChange={(e) => setTexte(e.target.value)}
                placeholder={interne ? "Note visible uniquement par les équipes internes…" : "Votre réponse à l'ouvrier…"}
                className="w-full resize-none bg-transparent px-3 py-2 text-[11px] outline-none placeholder:text-muted-foreground"
              />
              <div className="flex justify-end border-t border-border p-1.5">
                <BoutonR taille="sm" variante="primaire" onClick={envoyer} disabled={!texte.trim()}>
                  <Send className="size-3" /> Envoyer
                </BoutonR>
              </div>
            </div>
          </Bloc>

          <Bloc
            titre="Actions"
            action={
              <button onClick={() => setModaleAction(true)} className="inline-flex items-center gap-1 text-[11px] text-[var(--brand)] hover:underline">
                <Plus className="size-3" /> Ajouter une action
              </button>
            }
          >
            {rec.actions.length === 0 ? (
              <p className="text-[11px] text-muted-foreground">Aucune action interne enregistrée.</p>
            ) : (
              <div className="divide-y divide-border">
                {rec.actions.map((a) => (
                  <div key={a.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 py-2">
                    <span className="min-w-0 flex-1 truncate text-[11px] font-medium">{a.titre}</span>
                    <span className="text-[11px] text-muted-foreground">{a.responsable}</span>
                    <span className="num text-[11px] text-muted-foreground">{a.echeance}</span>
                    <select
                      className={selectCls}
                      value={a.statut}
                      onChange={(e) => changerStatutAction(rec.id, a.id, e.target.value as typeof a.statut)}
                    >
                      <option>À faire</option>
                      <option>En cours</option>
                      <option>Terminée</option>
                    </select>
                  </div>
                ))}
              </div>
            )}
          </Bloc>

          {rec.satisfaction && (
            <Bloc titre="Satisfaction">
              <div className="grid gap-x-6 sm:grid-cols-2">
                <Ligne label="Résolution" valeur={rec.satisfaction.resolution} />
                <Ligne label="Note" valeur={<span className="inline-flex items-center gap-1.5"><Etoiles note={rec.satisfaction.note} /> {rec.satisfaction.note} / 5</span>} />
                <Ligne label="Rapidité" valeur={`${rec.satisfaction.rapidite ?? "—"} / 5`} />
                <Ligne label="Communication" valeur={`${rec.satisfaction.communication ?? "—"} / 5`} />
              </div>
              {rec.satisfaction.commentaire && (
                <p className="mt-2 rounded-lg bg-[var(--hover)] px-3 py-2 text-[11px] italic text-muted-foreground">« {rec.satisfaction.commentaire} »</p>
              )}
            </Bloc>
          )}
        </div>

        <div className="space-y-3">
          <Bloc titre="Résumé">
            <div className="divide-y divide-border">
              <Ligne label="Ouvrier" valeur={rec.ouvrier} />
              <Ligne label="Matricule" valeur={<span className="num">{rec.matricule}</span>} />
              <Ligne label="Site" valeur={rec.site} />
              <Ligne label="Poste" valeur={rec.poste} />
              <Ligne label="Catégorie" valeur={rec.categorie} />
              <Ligne label="Sous-catégorie" valeur={rec.sousCategorie} />
              <Ligne label="Créée" valeur={`${rec.creeLe} – ${rec.creeA}`} />
              <Ligne label="Canal" valeur={rec.source} />
              <Ligne label="Priorité" valeur={rec.priorite} />
            </div>
          </Bloc>

          <Bloc titre="Prise en charge">
            <div className="divide-y divide-border">
              <Ligne label="Équipe" valeur={rec.equipe} />
              <Ligne label="Responsable" valeur={rec.assigneA ?? <span className="text-muted-foreground">Non assigné</span>} />
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <BoutonR
                taille="sm"
                variante="primaire"
                onClick={() => {
                  prendreEnCharge(rec.id, UTILISATEUR_COURANT);
                  notifier(`Assignée à ${UTILISATEUR_COURANT}`);
                }}
              >
                M'assigner
              </BoutonR>
              <BoutonR taille="sm" onClick={() => setModaleAssigner(true)}>
                Choisir responsable
              </BoutonR>
            </div>
          </Bloc>

          <Bloc titre="SLA">
            <div className="divide-y divide-border">
              <Ligne label="1ʳᵉ prise en charge" valeur={<span className="num">{rec.slaPriseEnCharge}</span>} />
              <Ligne label="Résolution cible" valeur={<span className="num">{rec.slaResolution}</span>} />
            </div>
            <div className="mt-2">
              <BadgeSla statut={rec.slaStatut} />
            </div>
          </Bloc>

          <Bloc titre="Historique">
            <ol className="space-y-2.5">
              {rec.historique.map((h) => (
                <li key={h.id} className="flex gap-2.5">
                  <Clock className="mt-0.5 size-3 shrink-0 text-muted-foreground" />
                  <div className="min-w-0">
                    <p className="text-[11px] leading-snug">{h.texte}</p>
                    <p className="num text-[10px] text-muted-foreground">
                      {h.date} · {h.heure} · {h.auteur}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </Bloc>
        </div>
      </div>

      {modaleAssigner && (
        <ModaleAssigner
          rec={rec}
          onClose={() => setModaleAssigner(false)}
          onValider={(resp, eq) => {
            assigner(rec.id, resp, eq);
            setModaleAssigner(false);
            notifier(`Assignée à ${resp} — équipe ${eq}`);
          }}
        />
      )}

      {modaleTraiter && (
        <ModaleTraiter
          onClose={() => setModaleTraiter(false)}
          onValider={(f) => {
            traiter(rec.id, f);
            setModaleTraiter(false);
            notifier("Réclamation marquée comme traitée");
          }}
        />
      )}

      {modaleAction && (
        <ModaleAction
          onClose={() => setModaleAction(false)}
          onValider={(a) => {
            ajouterAction(rec.id, a);
            setModaleAction(false);
            notifier("Action ajoutée");
          }}
        />
      )}
    </div>
  );
}

/* --------------------------------- Modales ---------------------------------- */

function Cadre({ titre, sous, children, pied, onClose }: { titre: string; sous?: string; children: React.ReactNode; pied: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4 backdrop-blur-sm animate-in fade-in" onClick={onClose}>
      <div
        className="w-full max-w-lg animate-in zoom-in-95 overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-border px-5 py-3.5">
          <h3 className="text-sm font-semibold">{titre}</h3>
          {sous && <p className="mt-0.5 text-[11px] text-muted-foreground">{sous}</p>}
        </div>
        <div className="max-h-[65vh] overflow-y-auto p-5">{children}</div>
        <div className="flex justify-end gap-2 border-t border-border px-5 py-3">{pied}</div>
      </div>
    </div>
  );
}

function Champ({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] font-medium text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

const champCls =
  "w-full rounded-lg border border-border bg-background px-2.5 py-2 text-[11px] outline-none transition-colors focus:border-[var(--brand)]";

function ModaleAssigner({ rec, onClose, onValider }: { rec: Rec; onClose: () => void; onValider: (r: string, e: EquipeRec) => void }) {
  const [resp, setResp] = useState(rec.assigneA ?? RESPONSABLES[0]);
  const [equipe, setEquipe] = useState<EquipeRec>(rec.equipe);
  return (
    <Cadre
      titre="Assigner la réclamation"
      sous="L'assignation fait automatiquement passer la réclamation en cours de traitement."
      onClose={onClose}
      pied={
        <>
          <BoutonR onClick={onClose}>Annuler</BoutonR>
          <BoutonR variante="primaire" onClick={() => onValider(resp, equipe)}>
            Assigner
          </BoutonR>
        </>
      }
    >
      <div className="space-y-3">
        <Champ label="Équipe">
          <select className={champCls} value={equipe} onChange={(e) => setEquipe(e.target.value as EquipeRec)}>
            {EQUIPES.map((e) => (
              <option key={e}>{e}</option>
            ))}
          </select>
        </Champ>
        <Champ label="Responsable">
          <select className={champCls} value={resp} onChange={(e) => setResp(e.target.value)}>
            {RESPONSABLES.map((r) => (
              <option key={r}>{r}</option>
            ))}
          </select>
        </Champ>
      </div>
    </Cadre>
  );
}

function ModaleTraiter({
  onClose,
  onValider,
}: {
  onClose: () => void;
  onValider: (f: { type: string; action: string; message: string; noteInterne?: string; demanderSatisfaction: boolean }) => void;
}) {
  const [type, setType] = useState<string>(TYPES_SOLUTION[0]);
  const [action, setAction] = useState("");
  const [message, setMessage] = useState("");
  const [note, setNote] = useState("");
  const [satisfaction, setSatisfaction] = useState(true);
  return (
    <Cadre
      titre="Finaliser le traitement"
      sous="La réclamation passera à l'état TRAITÉ, état final du workflow."
      onClose={onClose}
      pied={
        <>
          <BoutonR onClick={onClose}>Annuler</BoutonR>
          <BoutonR
            variante="primaire"
            disabled={!action.trim() || !message.trim()}
            onClick={() => onValider({ type, action, message, noteInterne: note, demanderSatisfaction: satisfaction })}
          >
            Marquer comme traitée
          </BoutonR>
        </>
      }
    >
      <div className="space-y-3">
        <Champ label="Type de solution">
          <select className={champCls} value={type} onChange={(e) => setType(e.target.value)}>
            {TYPES_SOLUTION.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </Champ>
        <Champ label="Action réalisée">
          <input className={champCls} value={action} onChange={(e) => setAction(e.target.value)} placeholder="Ex. Trajet alternatif affecté" />
        </Champ>
        <Champ label="Message à l'ouvrier">
          <textarea rows={3} className={`${champCls} resize-none`} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Expliquez la solution apportée…" />
        </Champ>
        <Champ label="Note interne (facultatif)">
          <textarea rows={2} className={`${champCls} resize-none`} value={note} onChange={(e) => setNote(e.target.value)} />
        </Champ>
        <label className="flex items-center gap-2 text-[11px]">
          <input type="checkbox" checked={satisfaction} onChange={(e) => setSatisfaction(e.target.checked)} className="size-3.5 accent-[var(--brand)]" />
          Envoyer une demande de satisfaction à l'ouvrier
        </label>
      </div>
    </Cadre>
  );
}

function ModaleAction({
  onClose,
  onValider,
}: {
  onClose: () => void;
  onValider: (a: { titre: string; responsable: string; echeance: string; statut: "À faire" | "En cours" | "Terminée" }) => void;
}) {
  const [titre, setTitre] = useState("");
  const [responsable, setResponsable] = useState(RESPONSABLES[0]);
  const [echeance, setEcheance] = useState("Aujourd'hui 17:00");
  const [statut, setStatut] = useState<"À faire" | "En cours" | "Terminée">("À faire");
  return (
    <Cadre
      titre="Ajouter une action"
      sous="Les actions ont leur propre cycle de vie, indépendant du statut de la réclamation."
      onClose={onClose}
      pied={
        <>
          <BoutonR onClick={onClose}>Annuler</BoutonR>
          <BoutonR variante="primaire" disabled={!titre.trim()} onClick={() => onValider({ titre, responsable, echeance, statut })}>
            Ajouter
          </BoutonR>
        </>
      }
    >
      <div className="space-y-3">
        <Champ label="Intitulé">
          <input className={champCls} value={titre} onChange={(e) => setTitre(e.target.value)} placeholder="Ex. Contacter le transporteur" />
        </Champ>
        <Champ label="Responsable">
          <select className={champCls} value={responsable} onChange={(e) => setResponsable(e.target.value)}>
            {RESPONSABLES.map((r) => (
              <option key={r}>{r}</option>
            ))}
          </select>
        </Champ>
        <Champ label="Échéance">
          <input className={champCls} value={echeance} onChange={(e) => setEcheance(e.target.value)} />
        </Champ>
        <Champ label="Statut">
          <select className={champCls} value={statut} onChange={(e) => setStatut(e.target.value as typeof statut)}>
            <option>À faire</option>
            <option>En cours</option>
            <option>Terminée</option>
          </select>
        </Champ>
      </div>
    </Cadre>
  );
}

export { LIBELLE_STATUT };
