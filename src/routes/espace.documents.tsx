import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Camera, CheckCircle2, Download, FileText, Upload } from "lucide-react";
import { useEspace } from "@/lib/espace-store";
import { BoutonE, Carte, ChampE, FeuilleModale, KpiE, Puce, SectionTitre, VideE, inputE, tonStatutOuvrier } from "@/components/espace/kit";
import type { DocumentEspace } from "@/data/espace-ouvrier";

export const Route = createFileRoute("/espace/documents")({
  head: () => ({
    meta: [
      { title: "Mes documents — Espace Ouvrier LEONI" },
      { name: "description", content: "Documents demandés par les RH, dépôt de fichiers et documents personnels." },
      { property: "og:title", content: "Mes documents — Espace Ouvrier LEONI" },
      { property: "og:description", content: "Déposez vos documents et suivez leur validation." },
    ],
  }),
  component: Documents,
});

function Documents() {
  const { documents, envoyerDocument } = useEspace();
  const [cible, setCible] = useState<DocumentEspace | null>(null);
  const [nomFichier, setNomFichier] = useState("");
  const [confirme, setConfirme] = useState("");

  const demandes = documents.filter((d) => d.categorie === "Demandé");
  const perso = documents.filter((d) => d.categorie === "Personnel");
  const aFournir = demandes.filter((d) => d.statut === "À fournir" || d.statut === "À remplacer").length;

  const envoyer = () => {
    if (!cible) return;
    const nom = nomFichier.trim() || `${cible.id.toLowerCase()}-scan.jpg`;
    envoyerDocument(cible.id, nom, "1,1 Mo");
    setConfirme(cible.nom);
    setCible(null);
    setNomFichier("");
  };

  return (
    <>
      <div className="grid grid-cols-3 gap-3">
        <KpiE label="À fournir" valeur={aFournir} ton={aFournir ? "critical" : "success"} />
        <KpiE label="En vérification" valeur={documents.filter((d) => d.statut === "En vérification" || d.statut === "Envoyé").length} ton="warning" />
        <KpiE label="Validés" valeur={documents.filter((d) => d.statut === "Validé").length} ton="success" />
      </div>

      <section>
        <SectionTitre titre="Documents demandés" />
        <div className="space-y-2.5">
          {demandes.length === 0 && <VideE texte="Aucun document demandé." />}
          {demandes.map((d) => (
            <Carte key={d.id}>
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{d.nom}</p>
                  <p className="text-[11px] text-muted-foreground">
                    Demandé par {d.demandePar} le {d.dateDemande}
                    {d.dateLimite ? ` · à fournir avant le ${d.dateLimite}` : ""}
                  </p>
                </div>
                <Puce ton={tonStatutOuvrier(d.statut)}>{d.statut}</Puce>
              </div>
              {d.motif && (
                <p className="mt-2 rounded-xl bg-[var(--warning)]/12 p-2.5 text-[11px] text-[var(--warning)]">
                  Motif : {d.motif}
                </p>
              )}
              {d.fichier && (
                <p className="mt-2 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <FileText className="size-3.5" /> {d.fichier} · {d.taille} · déposé le {d.dateDepot}
                </p>
              )}
              {(d.statut === "À fournir" || d.statut === "À remplacer") && (
                <BoutonE className="mt-3 w-full" onClick={() => setCible(d)}>
                  <Upload className="size-4" /> Envoyer le document
                </BoutonE>
              )}
            </Carte>
          ))}
        </div>
      </section>

      <section>
        <SectionTitre titre="Mes documents personnels" />
        <div className="space-y-2.5">
          {perso.map((d) => (
            <Carte key={d.id} className="flex items-center gap-3">
              <FileText className="size-5 shrink-0 text-[var(--brand)]" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{d.nom}</p>
                <p className="text-[11px] text-muted-foreground">
                  {d.fichier} · {d.taille} · {d.dateDepot}
                </p>
              </div>
              <Puce ton={tonStatutOuvrier(d.statut)}>{d.statut}</Puce>
              <Download className="size-4 shrink-0 text-muted-foreground" />
            </Carte>
          ))}
        </div>
      </section>

      {cible && (
        <FeuilleModale
          titre={`Envoyer : ${cible.nom}`}
          onClose={() => setCible(null)}
          pied={
            <>
              <BoutonE variante="secondaire" className="flex-1" onClick={() => setCible(null)}>
                Annuler
              </BoutonE>
              <BoutonE className="flex-1" onClick={envoyer}>
                Envoyer
              </BoutonE>
            </>
          }
        >
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setNomFichier(`${cible.id.toLowerCase()}-photo.jpg`)}
                className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border p-5 text-xs font-semibold"
              >
                <Camera className="size-6 text-[var(--brand)]" /> Prendre une photo
              </button>
              <button
                onClick={() => setNomFichier(`${cible.id.toLowerCase()}-scan.pdf`)}
                className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border p-5 text-xs font-semibold"
              >
                <Upload className="size-6 text-[var(--brand)]" /> Choisir un fichier
              </button>
            </div>
            <ChampE label="Fichier sélectionné" aide="Formats acceptés : JPG, PNG, PDF — 5 Mo maximum.">
              <input className={inputE} value={nomFichier} onChange={(e) => setNomFichier(e.target.value)} placeholder="aucun fichier" />
            </ChampE>
          </div>
        </FeuilleModale>
      )}

      {confirme && (
        <FeuilleModale
          titre="Document envoyé"
          onClose={() => setConfirme("")}
          pied={
            <BoutonE className="w-full" onClick={() => setConfirme("")}>
              Fermer
            </BoutonE>
          }
        >
          <p className="flex items-start gap-2 text-sm text-muted-foreground">
            <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-[var(--success)]" />
            {confirme} a bien été transmis au service RH. Vous serez notifié dès sa validation.
          </p>
        </FeuilleModale>
      )}
    </>
  );
}
