import { createFileRoute } from "@tanstack/react-router";
import { Bus, CreditCard, IdCard, LogOut, Moon, ShieldCheck, Shirt, Sun, Monitor } from "lucide-react";
import { useEspace } from "@/lib/espace-store";
import { useLeoni } from "@/lib/leoni-store";
import { BoutonE, Carte, Puce, SectionTitre, VideE, inputE, tonStatutOuvrier } from "@/components/espace/kit";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/espace/profil")({
  head: () => ({
    meta: [
      { title: "Mon profil — Espace Ouvrier LEONI" },
      { name: "description", content: "Vos informations, votre badge, vos EPI, votre vestiaire et votre transport." },
      { property: "og:title", content: "Mon profil — Espace Ouvrier LEONI" },
      { property: "og:description", content: "Consultez vos informations, EPI, badge et transport." },
    ],
  }),
  component: Profil,
});

function Ligne({ label, valeur }: { label: string; valeur?: string }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-border py-2 last:border-0">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-right text-xs font-semibold">{valeur || "—"}</span>
    </div>
  );
}

function Profil() {
  const { ouvrier, deconnexion, langue, setLangue } = useEspace();
  const { theme, setTheme } = useLeoni();
  if (!ouvrier) return <VideE texte="Fiche ouvrier introuvable." />;

  const ob = ouvrier.onboarding;

  return (
    <>
      <Carte>
        <div className="flex items-center gap-3">
          <span className="flex size-14 items-center justify-center rounded-2xl bg-[var(--brand)] text-lg font-black text-[var(--brand-foreground)]">
            {ouvrier.nom
              .split(" ")
              .map((m) => m[0])
              .join("")
              .slice(0, 2)}
          </span>
          <div className="min-w-0">
            <p className="truncate text-lg font-black tracking-tight">{ouvrier.nom}</p>
            <p className="truncate text-xs text-muted-foreground">
              {ouvrier.poste} · {ouvrier.site}
            </p>
            <p className="mt-1 text-[11px] text-muted-foreground">Matricule {ouvrier.id}</p>
          </div>
        </div>
      </Carte>

      <section>
        <SectionTitre titre="Mes informations" />
        <Carte>
          <Ligne label="CIN" valeur={ouvrier.identite.cin} />
          <Ligne label="Date de naissance" valeur={ouvrier.identite.naissance} />
          <Ligne label="Téléphone" valeur={ouvrier.identite.telephone} />
          <Ligne label="Email" valeur={ouvrier.identite.email} />
          <Ligne label="Adresse" valeur={`${ouvrier.identite.adresse}, ${ouvrier.identite.ville}`} />
          <Ligne label="Contact d'urgence" valeur={ouvrier.identite.contactUrgence} />
          <Ligne label="Atelier / groupe" valeur={`${ouvrier.atelier} · ${ouvrier.groupe}`} />
          <Ligne label="Shift" valeur={ouvrier.situation.shift} />
          <Ligne label="Formateur" valeur={ouvrier.formateur} />
          <p className="mt-3 text-[11px] text-muted-foreground">
            Une information est incorrecte ? Créez une demande RH depuis « Mes demandes ».
          </p>
        </Carte>
      </section>

      {ob && (
        <>
          <section>
            <SectionTitre titre="Mon badge et mes accès" />
            <Carte>
              <div className="flex items-center gap-3">
                <IdCard className="size-5 text-[var(--brand)]" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">Badge {ob.badge.numero || "en préparation"}</p>
                  <p className="text-[11px] text-muted-foreground">Zones autorisées : {ob.badge.zones || "—"}</p>
                </div>
                <Puce ton={tonStatutOuvrier(ob.badge.statut)}>{ob.badge.statut}</Puce>
              </div>
              {ob.carte && (
                <div className="mt-3 flex items-center gap-3 border-t border-border pt-3">
                  <CreditCard className="size-5 text-[var(--brand)]" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">
                      {ob.carte.type} — {ob.carte.numero}
                    </p>
                    <p className="text-[11px] text-muted-foreground">Validité : {ob.carte.validite}</p>
                  </div>
                  <Puce ton={tonStatutOuvrier(ob.carte.statut)}>{ob.carte.statut}</Puce>
                </div>
              )}
              {ob.badge.instruction && (
                <p className="mt-3 rounded-xl bg-muted p-3 text-[11px] text-muted-foreground">{ob.badge.instruction}</p>
              )}
            </Carte>
          </section>

          <section>
            <SectionTitre titre="Mes EPI" />
            <Carte>
              <p className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                <Shirt className="size-4" /> Tailles : blouse {ob.tailles.blouse} · gilet {ob.tailles.gilet} · gants{" "}
                {ob.tailles.gants} · chaussures {ob.tailles.chaussures}
              </p>
              <div className="mt-3 space-y-2">
                {ob.equipements
                  .filter((e) => e.requis)
                  .map((e) => (
                    <div key={e.id} className="flex items-center gap-3 border-b border-border pb-2 last:border-0">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{e.nom}</p>
                        <p className="text-[11px] text-muted-foreground">
                          Taille {e.taille || "—"} · quantité {e.quantite}
                          {e.dateRemise ? ` · remis le ${e.dateRemise}` : ""}
                        </p>
                      </div>
                      <Puce ton={tonStatutOuvrier(e.statut)}>{e.statut}</Puce>
                    </div>
                  ))}
              </div>
              <p className="mt-3 text-[11px] text-muted-foreground">
                EPI usé ou non conforme ? Déposez une réclamation catégorie « EPI ».
              </p>
            </Carte>
          </section>

          <section>
            <SectionTitre titre="Mon vestiaire" />
            <Carte>
              <Ligne label="Vestiaire" valeur={ob.vestiaire.vestiaire} />
              <Ligne label="Casier" valeur={ob.vestiaire.casier} />
              <Ligne label="Clé" valeur={ob.vestiaire.cle} />
              <Ligne label="Statut" valeur={ob.vestiaire.statut} />
            </Carte>
          </section>

          <section>
            <SectionTitre titre="Mon transport" />
            <Carte>
              <p className="flex items-center gap-2 text-sm font-semibold">
                <Bus className="size-4 text-[var(--brand)]" /> {ob.transport.ligne || "Aucune ligne affectée"}
              </p>
              <div className="mt-2">
                <Ligne label="Point de ramassage" valeur={ob.transport.point} />
                <Ligne label="Zone / ville" valeur={`${ob.transport.zone} · ${ob.transport.ville}`} />
                <Ligne label="Horaire aller" valeur={ob.transport.heureAller} />
                <Ligne label="Horaire retour" valeur={ob.transport.heureRetour} />
                <Ligne label="Transporteur" valeur={`${ob.transport.transporteur} · ${ob.transport.contact}`} />
              </div>
              <p className="mt-3 text-[11px] text-muted-foreground">
                Pour changer de point de ramassage, créez une demande « Changement point transport ».
              </p>
            </Carte>
          </section>
        </>
      )}

      <section>
        <SectionTitre titre="Préférences" />
        <Carte>
          <p className="mb-2 text-xs font-semibold text-muted-foreground">Langue de l'interface</p>
          <select className={inputE} value={langue} onChange={(e) => setLangue(e.target.value)}>
            <option value="FR">Français</option>
            <option value="AR">العربية</option>
            <option value="EN">English</option>
          </select>

          <p className="mb-2 mt-4 text-xs font-semibold text-muted-foreground">Apparence</p>
          <div className="flex gap-2">
            {(
              [
                ["light", Sun, "Clair"],
                ["dark", Moon, "Sombre"],
                ["system", Monitor, "Système"],
              ] as const
            ).map(([k, I, label]) => (
              <button
                key={k}
                onClick={() => setTheme(k)}
                className={cn(
                  "flex flex-1 flex-col items-center gap-1.5 rounded-xl border p-3 text-[11px] font-semibold",
                  theme === k ? "border-[var(--brand)] bg-[var(--brand-soft)] text-[var(--brand)]" : "border-border",
                )}
              >
                <I className="size-4" />
                {label}
              </button>
            ))}
          </div>
        </Carte>
      </section>

      <Carte>
        <p className="flex items-start gap-2 text-[11px] text-muted-foreground">
          <ShieldCheck className="mt-0.5 size-4 shrink-0 text-[var(--brand)]" />
          Confidentialité : vous ne voyez que les informations qui vous concernent. Les commentaires internes RH, les
          scores IA de recrutement et les données des autres opérateurs ne sont jamais affichés dans cet espace.
        </p>
      </Carte>

      <BoutonE variante="secondaire" className="w-full" onClick={deconnexion}>
        <LogOut className="size-4" /> Déconnexion
      </BoutonE>
    </>
  );
}
