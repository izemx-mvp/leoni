import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AlertTriangle, CalendarDays, CheckCircle2, Clock, Info } from "lucide-react";
import { useEspace } from "@/lib/espace-store";
import { BoutonE, Carte, FeuilleModale, KpiE, Puce, SectionTitre, VideE, tonStatutOuvrier } from "@/components/espace/kit";
import type { AvertissementEspace } from "@/data/espace-ouvrier";

export const Route = createFileRoute("/espace/presence")({
  head: () => ({
    meta: [
      { title: "Ma présence — Espace Ouvrier LEONI" },
      { name: "description", content: "Historique de présence, retards, absences et avertissements à consulter." },
      { property: "og:title", content: "Ma présence — Espace Ouvrier LEONI" },
      { property: "og:description", content: "Suivez votre présence, vos retards et vos avertissements." },
    ],
  }),
  component: Presence,
});

function Presence() {
  const { ouvrier, avertissements, accuserLecture } = useEspace();
  const [ouvert, setOuvert] = useState<AvertissementEspace | null>(null);
  if (!ouvrier) return <VideE texte="Fiche ouvrier introuvable." />;

  const presences = ouvrier.presences;
  const absences = presences.filter((p) => p.statut === "Absence").length;
  const retards = presences.filter((p) => p.statut === "Retard").length;

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <KpiE label="Présence" valeur={`${ouvrier.presence} %`} ton={ouvrier.presence >= 90 ? "success" : "warning"} />
        <KpiE label="Ponctualité" valeur={`${ouvrier.ponctualite} %`} ton={ouvrier.ponctualite >= 90 ? "success" : "warning"} />
        <KpiE label="Absences" valeur={absences} ton={absences ? "critical" : "success"} />
        <KpiE label="Retards" valeur={retards} ton={retards ? "warning" : "success"} />
      </div>

      <section>
        <SectionTitre titre={`Avertissements (${avertissements.filter((a) => !a.lu).length} à lire)`} />
        <div className="space-y-2.5">
          {avertissements.length === 0 && <VideE texte="Aucun avertissement." />}
          {avertissements.map((a) => (
            <Carte key={a.id} onClick={() => setOuvert(a)}>
              <div className="flex items-start gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[var(--warning)]/15 text-[var(--warning)]">
                  {a.niveau === "Information" ? <Info className="size-5" /> : <AlertTriangle className="size-5" />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{a.objet}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {a.type} · {a.date}
                  </p>
                </div>
                <Puce ton={a.lu ? "success" : "warning"}>{a.lu ? "Lu" : "À consulter"}</Puce>
              </div>
            </Carte>
          ))}
        </div>
      </section>

      <section>
        <SectionTitre titre="Mon historique de présence" />
        <div className="space-y-2">
          {presences.map((p, i) => (
            <Carte key={`${p.date}-${i}`} className="flex items-center gap-3 py-3">
              <CalendarDays className="size-4 shrink-0 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">{p.date}</p>
                <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
                  <Clock className="size-3" /> {p.entree} – {p.sortie} · {p.shift}
                  {p.retard ? ` · retard ${p.retard}` : ""}
                </p>
                {p.justificatif && <p className="text-[11px] text-muted-foreground">Justificatif : {p.justificatif}</p>}
              </div>
              <Puce ton={tonStatutOuvrier(p.statut)}>{p.statut}</Puce>
            </Carte>
          ))}
        </div>
      </section>

      {ouvert && (
        <FeuilleModale
          titre={ouvert.objet}
          onClose={() => setOuvert(null)}
          pied={
            ouvert.lu ? (
              <BoutonE variante="secondaire" className="w-full" onClick={() => setOuvert(null)}>
                Fermer
              </BoutonE>
            ) : (
              <>
                <BoutonE variante="secondaire" className="flex-1" onClick={() => setOuvert(null)}>
                  Plus tard
                </BoutonE>
                <BoutonE
                  className="flex-1"
                  onClick={() => {
                    accuserLecture(ouvert.id);
                    setOuvert(null);
                  }}
                >
                  <CheckCircle2 className="size-4" /> J'ai lu et compris
                </BoutonE>
              </>
            )
          }
        >
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <Puce ton="warning">{ouvert.niveau}</Puce>
              <Puce ton="neutral">{ouvert.type}</Puce>
              <Puce ton="neutral">{ouvert.date}</Puce>
            </div>
            <p className="text-sm leading-relaxed">{ouvert.messageOuvrier}</p>
            {ouvert.lu && (
              <p className="text-[11px] text-muted-foreground">
                Accusé de lecture enregistré le {ouvert.lu.date} à {ouvert.lu.heure}.
              </p>
            )}
          </div>
        </FeuilleModale>
      )}
    </>
  );
}
