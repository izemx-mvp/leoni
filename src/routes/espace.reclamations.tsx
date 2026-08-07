import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus, ShieldAlert } from "lucide-react";
import { BoutonE, Carte, ChampE, FeuilleModale, Puce, VideE, inputE } from "@/components/espace/kit";
import { useRec } from "@/lib/reclamations-store";
import { TAXONOMIE, type Rec } from "@/data/reclamations-v2";

export const Route = createFileRoute("/espace/reclamations")({
  head: () => ({
    meta: [
      { title: "Mes réclamations — Espace Ouvrier LEONI" },
      { name: "description", content: "Signalez un problème de transport, d'EPI, de formation ou d'organisation et suivez son traitement." },
      { property: "og:title", content: "Mes réclamations — Espace Ouvrier LEONI" },
      { property: "og:description", content: "Déposez une réclamation, suivez la réponse et évaluez la solution." },
    ],
  }),
  component: ReclamationsOuvrier,
});

const OUVRIER = "Sara Amrani";
const CATEGORIES_OUVRIER = Object.keys(TAXONOMIE);

function ReclamationsOuvrier() {
  const { reclamations, creer, enregistrerSatisfaction } = useRec();
  const [onglet, setOnglet] = useState<"En cours" | "Traitées">("En cours");
  const [nouvelle, setNouvelle] = useState(false);
  const [reference, setReference] = useState<string | null>(null);
  const [evaluer, setEvaluer] = useState<Rec | null>(null);
  const [form, setForm] = useState({
    categorie: CATEGORIES_OUVRIER[0],
    sousCategorie: TAXONOMIE[CATEGORIES_OUVRIER[0]][0],
    objet: "",
    description: "",
  });

  const miennes = useMemo(() => reclamations.filter((r) => r.ouvrier === OUVRIER), [reclamations]);
  const liste = miennes.filter((r) => (onglet === "Traitées" ? r.statut === "resolved" : r.statut !== "resolved"));

  const envoyer = () => {
    if (!form.objet.trim() || !form.description.trim()) return;
    const id = creer({ ...form, ouvrier: OUVRIER });
    setNouvelle(false);
    setReference(id);
    setForm({ categorie: CATEGORIES_OUVRIER[0], sousCategorie: TAXONOMIE[CATEGORIES_OUVRIER[0]][0], objet: "", description: "" });
  };

  return (
    <>
      <Carte className="bg-[var(--brand-soft)]">
        <p className="flex items-center gap-2 text-sm font-bold text-[var(--brand)]">
          <ShieldAlert className="size-4" /> Votre voix compte
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Chaque réclamation est prise en charge par une équipe responsable et suivie jusqu'à sa résolution.
        </p>
      </Carte>

      <BoutonE className="w-full" taille="lg" onClick={() => setNouvelle(true)}>
        <Plus className="size-4" /> Nouvelle réclamation
      </BoutonE>

      <div className="flex gap-1 rounded-2xl bg-muted p-1">
        {(["En cours", "Traitées"] as const).map((o) => (
          <button
            key={o}
            onClick={() => setOnglet(o)}
            className={`flex-1 rounded-xl px-3 py-2 text-xs font-semibold transition-colors ${
              onglet === o ? "bg-card text-[var(--brand)] shadow-sm" : "text-muted-foreground"
            }`}
          >
            {o}
          </button>
        ))}
      </div>

      <div className="space-y-2.5">
        {liste.length === 0 && <VideE texte="Aucune réclamation dans cet onglet." />}
        {liste.map((r) => {
          const derniere = [...r.messages].reverse().find((m) => m.role !== "system" && !m.interne);
          return (
            <Carte key={r.id}>
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{r.objet}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {r.id} · {r.categorie} · {r.creeLe}
                  </p>
                </div>
                <Puce ton={r.statut === "resolved" ? "success" : "warning"}>{r.statut === "resolved" ? "Traité" : "En cours"}</Puce>
              </div>

              {derniere && (
                <p className="mt-2 rounded-xl bg-muted p-2.5 text-[11px] text-muted-foreground">
                  <span className="font-semibold text-foreground">{derniere.auteur}</span> · {derniere.heure} — {derniere.texte}
                </p>
              )}

              {r.statut === "resolved" && r.resolution && (
                <div className="mt-2 rounded-xl bg-[var(--success)]/10 p-2.5 text-[11px] text-[var(--success)]">
                  <p className="font-semibold">Votre réclamation a été traitée</p>
                  <p className="mt-0.5">Solution : {r.resolution.action}</p>
                </div>
              )}

              {r.statut === "resolved" && !r.satisfaction && (
                <BoutonE variante="secondaire" className="mt-2 w-full" onClick={() => setEvaluer(r)}>
                  Évaluer la solution
                </BoutonE>
              )}

              {r.satisfaction && (
                <p className="mt-2 text-[11px] text-muted-foreground">
                  Votre évaluation : {r.satisfaction.note} / 5 · résolution {r.satisfaction.resolution.toLowerCase()}
                </p>
              )}
            </Carte>
          );
        })}
      </div>

      {nouvelle && (
        <FeuilleModale
          titre="Nouvelle réclamation"
          onClose={() => setNouvelle(false)}
          pied={
            <>
              <BoutonE variante="secondaire" className="flex-1" onClick={() => setNouvelle(false)}>
                Annuler
              </BoutonE>
              <BoutonE className="flex-1" onClick={envoyer}>
                Envoyer
              </BoutonE>
            </>
          }
        >
          <div className="space-y-3">
            <ChampE label="Catégorie">
              <select
                className={inputE}
                value={form.categorie}
                onChange={(e) => setForm({ ...form, categorie: e.target.value, sousCategorie: TAXONOMIE[e.target.value][0] })}
              >
                {CATEGORIES_OUVRIER.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </ChampE>
            <ChampE label="Sujet">
              <select className={inputE} value={form.sousCategorie} onChange={(e) => setForm({ ...form, sousCategorie: e.target.value })}>
                {TAXONOMIE[form.categorie].map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </ChampE>
            <ChampE label="Objet">
              <input className={inputE} value={form.objet} onChange={(e) => setForm({ ...form, objet: e.target.value })} placeholder="Ex. Bus non passé ce matin" />
            </ChampE>
            <ChampE label="Description">
              <textarea className={inputE} rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Décrivez la situation…" />
            </ChampE>
            <ChampE label="Photo / document">
              <input type="file" className={inputE} />
            </ChampE>
          </div>
        </FeuilleModale>
      )}

      {reference && (
        <FeuilleModale
          titre="Réclamation envoyée"
          onClose={() => setReference(null)}
          pied={
            <BoutonE className="w-full" onClick={() => setReference(null)}>
              Fermer
            </BoutonE>
          }
        >
          <p className="text-sm text-muted-foreground">Votre réclamation a été envoyée.</p>
          <p className="mt-2 text-sm font-semibold">Référence : {reference}</p>
        </FeuilleModale>
      )}

      {evaluer && <ModaleSatisfaction rec={evaluer} onClose={() => setEvaluer(null)} onValider={(s) => { enregistrerSatisfaction(evaluer.id, s); setEvaluer(null); }} />}
    </>
  );
}

function ModaleSatisfaction({
  rec,
  onClose,
  onValider,
}: {
  rec: Rec;
  onClose: () => void;
  onValider: (s: { resolution: "Oui" | "Partiellement" | "Non"; note: number; rapidite: number; qualite: number; communication: number; commentaire: string }) => void;
}) {
  const [resolution, setResolution] = useState<"Oui" | "Partiellement" | "Non">("Oui");
  const [note, setNote] = useState(5);
  const [rapidite, setRapidite] = useState(4);
  const [qualite, setQualite] = useState(4);
  const [communication, setCommunication] = useState(4);
  const [commentaire, setCommentaire] = useState("");

  return (
    <FeuilleModale
      titre="Votre réclamation a été traitée"
      onClose={onClose}
      pied={
        <BoutonE className="w-full" onClick={() => onValider({ resolution, note, rapidite, qualite, communication, commentaire })}>
          Envoyer mon évaluation
        </BoutonE>
      }
    >
      <div className="space-y-4">
        <p className="rounded-xl bg-muted p-3 text-xs text-muted-foreground">Solution : {rec.resolution?.action}</p>

        <ChampE label="La solution répond-elle à votre problème ?">
          <div className="flex gap-2">
            {(["Oui", "Partiellement", "Non"] as const).map((o) => (
              <button
                key={o}
                onClick={() => setResolution(o)}
                className={`flex-1 rounded-xl border px-2 py-2 text-xs font-medium transition-colors ${
                  resolution === o ? "border-[var(--brand)] bg-[var(--brand-soft)] text-[var(--brand)]" : "border-border text-muted-foreground"
                }`}
              >
                {o}
              </button>
            ))}
          </div>
        </ChampE>

        <ChampE label="Satisfaction globale">
          <Notes valeur={note} onChange={setNote} />
        </ChampE>
        <ChampE label="Rapidité (facultatif)">
          <Notes valeur={rapidite} onChange={setRapidite} />
        </ChampE>
        <ChampE label="Qualité de la réponse (facultatif)">
          <Notes valeur={qualite} onChange={setQualite} />
        </ChampE>
        <ChampE label="Communication (facultatif)">
          <Notes valeur={communication} onChange={setCommunication} />
        </ChampE>
        <ChampE label="Commentaire (facultatif)">
          <textarea className={inputE} rows={3} value={commentaire} onChange={(e) => setCommentaire(e.target.value)} />
        </ChampE>
      </div>
    </FeuilleModale>
  );
}

function Notes({ valeur, onChange }: { valeur: number; onChange: (n: number) => void }) {
  return (
    <div className="flex gap-1.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          onClick={() => onChange(i)}
          aria-label={`${i} étoiles`}
          className="text-2xl leading-none transition-transform active:scale-90"
          style={{ color: i <= valeur ? "var(--warning)" : "var(--border)" }}
        >
          ★
        </button>
      ))}
    </div>
  );
}
