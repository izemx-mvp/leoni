import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { MessageCircle, Plus, Send } from "lucide-react";
import { useEspace } from "@/lib/espace-store";
import { BoutonE, Carte, ChampE, FeuilleModale, KpiE, Puce, SectionTitre, VideE, inputE, tonStatutOuvrier } from "@/components/espace/kit";
import { TYPES_DEMANDE, type DemandeEspace } from "@/data/espace-ouvrier";

export const Route = createFileRoute("/espace/demandes")({
  head: () => ({
    meta: [
      { title: "Mes demandes — Espace Ouvrier LEONI" },
      { name: "description", content: "Créez et suivez vos demandes RH : attestations, transport, planning, équipement." },
      { property: "og:title", content: "Mes demandes — Espace Ouvrier LEONI" },
      { property: "og:description", content: "Créez et suivez vos demandes auprès du service RH." },
    ],
  }),
  component: Demandes,
});

function Demandes() {
  const { demandes, creerDemande, repondreDemande } = useEspace();
  const [nouvelle, setNouvelle] = useState(false);
  const [detail, setDetail] = useState<DemandeEspace | null>(null);
  const [reponse, setReponse] = useState("");
  const [form, setForm] = useState({ type: TYPES_DEMANDE[0], objet: "", description: "", urgence: "Normale" as DemandeEspace["urgence"] });
  const [cree, setCree] = useState("");

  const enCours = demandes.filter((d) => !["Traitée", "Clôturée", "Refusée"].includes(d.statut));
  const courante = detail ? (demandes.find((d) => d.id === detail.id) ?? detail) : null;

  const envoyer = () => {
    if (!form.objet.trim() || !form.description.trim()) return;
    const id = creerDemande(form);
    setCree(id);
    setNouvelle(false);
    setForm({ type: TYPES_DEMANDE[0], objet: "", description: "", urgence: "Normale" });
  };

  return (
    <>
      <div className="grid grid-cols-3 gap-3">
        <KpiE label="En cours" valeur={enCours.length} ton={enCours.length ? "warning" : "success"} />
        <KpiE label="Traitées" valeur={demandes.filter((d) => d.statut === "Traitée").length} ton="success" />
        <KpiE label="Total" valeur={demandes.length} />
      </div>

      <BoutonE className="w-full" taille="lg" onClick={() => setNouvelle(true)}>
        <Plus className="size-4" /> Nouvelle demande
      </BoutonE>

      <section>
        <SectionTitre titre="Mes demandes" />
        <div className="space-y-2.5">
          {demandes.length === 0 && <VideE texte="Aucune demande." />}
          {demandes.map((d) => (
            <Carte key={d.id} onClick={() => setDetail(d)}>
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{d.objet}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {d.id} · {d.type} · {d.date}
                  </p>
                </div>
                <Puce ton={tonStatutOuvrier(d.statut)}>{d.statut}</Puce>
              </div>
              <p className="mt-2 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <MessageCircle className="size-3.5" /> {d.fil.length} message(s) · {d.responsable}
              </p>
            </Carte>
          ))}
        </div>
      </section>

      {nouvelle && (
        <FeuilleModale
          titre="Nouvelle demande"
          onClose={() => setNouvelle(false)}
          pied={
            <>
              <BoutonE variante="secondaire" className="flex-1" onClick={() => setNouvelle(false)}>
                Annuler
              </BoutonE>
              <BoutonE className="flex-1" onClick={envoyer}>
                <Send className="size-4" /> Envoyer
              </BoutonE>
            </>
          }
        >
          <div className="space-y-3">
            <ChampE label="Type de demande">
              <select className={inputE} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                {TYPES_DEMANDE.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </ChampE>
            <ChampE label="Objet">
              <input className={inputE} value={form.objet} onChange={(e) => setForm({ ...form, objet: e.target.value })} placeholder="Ex. Attestation de formation" />
            </ChampE>
            <ChampE label="Description">
              <textarea className={inputE} rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Expliquez votre demande…" />
            </ChampE>
            <ChampE label="Urgence">
              <select
                className={inputE}
                value={form.urgence}
                onChange={(e) => setForm({ ...form, urgence: e.target.value as DemandeEspace["urgence"] })}
              >
                <option>Normale</option>
                <option>Élevée</option>
                <option>Urgente</option>
              </select>
            </ChampE>
          </div>
        </FeuilleModale>
      )}

      {courante && (
        <FeuilleModale
          titre={courante.objet}
          onClose={() => {
            setDetail(null);
            setReponse("");
          }}
          pied={
            <>
              <input className={inputE} value={reponse} onChange={(e) => setReponse(e.target.value)} placeholder="Écrire un message…" />
              <BoutonE
                onClick={() => {
                  if (!reponse.trim()) return;
                  repondreDemande(courante.id, reponse.trim());
                  setReponse("");
                }}
              >
                <Send className="size-4" />
              </BoutonE>
            </>
          }
        >
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <Puce ton={tonStatutOuvrier(courante.statut)}>{courante.statut}</Puce>
              <Puce ton="neutral">{courante.id}</Puce>
              <Puce ton="neutral">{courante.type}</Puce>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Responsable : {courante.responsable} · dernière mise à jour {courante.maj}
            </p>
            <div className="space-y-2">
              {courante.fil.map((m, i) => (
                <div
                  key={i}
                  className={
                    m.role === "Ouvrier"
                      ? "ml-8 rounded-2xl bg-[var(--brand-soft)] p-3"
                      : "mr-8 rounded-2xl border border-border p-3"
                  }
                >
                  <p className="text-[11px] font-semibold">
                    {m.auteur} · {m.date}
                  </p>
                  <p className="mt-1 text-sm">{m.texte}</p>
                </div>
              ))}
            </div>
          </div>
        </FeuilleModale>
      )}

      {cree && (
        <FeuilleModale
          titre="Demande envoyée"
          onClose={() => setCree("")}
          pied={
            <BoutonE className="w-full" onClick={() => setCree("")}>
              Fermer
            </BoutonE>
          }
        >
          <p className="text-sm text-muted-foreground">
            Votre demande <span className="font-semibold text-foreground">{cree}</span> a été transmise au service RH.
            Vous serez notifié à chaque mise à jour.
          </p>
        </FeuilleModale>
      )}
    </>
  );
}
