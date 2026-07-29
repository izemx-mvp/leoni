import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, ShieldAlert } from "lucide-react";
import { useEspace } from "@/lib/espace-store";
import { useLeoni } from "@/lib/leoni-store";
import { BoutonE, Carte, ChampE, FeuilleModale, Puce, SectionTitre, VideE, inputE, tonStatutOuvrier } from "@/components/espace/kit";
import { CATEGORIES_RECLAMATION_OUVRIER, OUVRIER_DEMO_ID } from "@/data/espace-ouvrier";

export const Route = createFileRoute("/espace/reclamations")({
  head: () => ({
    meta: [
      { title: "Mes réclamations — Espace Ouvrier LEONI" },
      { name: "description", content: "Signalez un problème de sécurité, d'EPI, de transport ou d'organisation." },
      { property: "og:title", content: "Mes réclamations — Espace Ouvrier LEONI" },
      { property: "og:description", content: "Déposez une réclamation et suivez son traitement." },
    ],
  }),
  component: Reclamations,
});

function Reclamations() {
  const { creerReclamationOuvrier } = useEspace();
  const { reclamations } = useLeoni();
  const [nouvelle, setNouvelle] = useState(false);
  const [cree, setCree] = useState(false);
  const [form, setForm] = useState({
    categorie: CATEGORIES_RECLAMATION_OUVRIER[0],
    objet: "",
    description: "",
    priorite: "Normale" as "Critique" | "Élevée" | "Normale" | "Faible",
    confidentielle: false,
  });

  const miennes = reclamations.filter((r) => r.ouvrierId === OUVRIER_DEMO_ID || r.ouvrier === "Sara Amrani");

  const envoyer = () => {
    if (!form.objet.trim() || !form.description.trim()) return;
    creerReclamationOuvrier(form);
    setNouvelle(false);
    setCree(true);
    setForm({ categorie: CATEGORIES_RECLAMATION_OUVRIER[0], objet: "", description: "", priorite: "Normale", confidentielle: false });
  };

  return (
    <>
      <Carte className="bg-[var(--brand-soft)]">
        <p className="flex items-center gap-2 text-sm font-bold text-[var(--brand)]">
          <ShieldAlert className="size-4" /> Votre voix compte
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Toute réclamation est transmise au responsable concerné et suivie jusqu'à sa résolution. Une réclamation
          déclarée confidentielle n'est visible que par le service RH.
        </p>
      </Carte>

      <BoutonE className="w-full" taille="lg" onClick={() => setNouvelle(true)}>
        <Plus className="size-4" /> Nouvelle réclamation
      </BoutonE>

      <section>
        <SectionTitre titre="Mes réclamations" />
        <div className="space-y-2.5">
          {miennes.length === 0 && <VideE texte="Aucune réclamation déposée." />}
          {miennes.map((r) => (
            <Carte key={r.id}>
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{r.objet}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {r.id} · {r.categorie} · {r.date}
                  </p>
                </div>
                <Puce ton={tonStatutOuvrier(r.statut)}>{r.statut}</Puce>
              </div>
              <p className="mt-2 text-[11px] text-muted-foreground">
                Priorité {r.priorite} · pris en charge par {r.responsable}
              </p>
              {r.resolution && (
                <p className="mt-2 rounded-xl bg-[var(--success)]/10 p-2.5 text-[11px] text-[var(--success)]">
                  {r.resolution}
                </p>
              )}
            </Carte>
          ))}
        </div>
      </section>

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
              <select className={inputE} value={form.categorie} onChange={(e) => setForm({ ...form, categorie: e.target.value })}>
                {CATEGORIES_RECLAMATION_OUVRIER.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </ChampE>
            <ChampE label="Objet">
              <input className={inputE} value={form.objet} onChange={(e) => setForm({ ...form, objet: e.target.value })} placeholder="Ex. Gants de protection usés" />
            </ChampE>
            <ChampE label="Description">
              <textarea className={inputE} rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Décrivez la situation…" />
            </ChampE>
            <ChampE label="Priorité">
              <select
                className={inputE}
                value={form.priorite}
                onChange={(e) => setForm({ ...form, priorite: e.target.value as typeof form.priorite })}
              >
                <option>Faible</option>
                <option>Normale</option>
                <option>Élevée</option>
                <option>Critique</option>
              </select>
            </ChampE>
            <label className="flex items-center gap-2 text-xs">
              <input
                type="checkbox"
                checked={form.confidentielle}
                onChange={(e) => setForm({ ...form, confidentielle: e.target.checked })}
                className="size-4"
              />
              Traiter cette réclamation de façon confidentielle
            </label>
          </div>
        </FeuilleModale>
      )}

      {cree && (
        <FeuilleModale
          titre="Réclamation envoyée"
          onClose={() => setCree(false)}
          pied={
            <BoutonE className="w-full" onClick={() => setCree(false)}>
              Fermer
            </BoutonE>
          }
        >
          <p className="text-sm text-muted-foreground">
            Votre réclamation a été enregistrée et affectée au responsable concerné. Vous serez informé de son
            avancement.
          </p>
        </FeuilleModale>
      )}
    </>
  );
}
