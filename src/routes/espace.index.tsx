import { createFileRoute, Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowRight,
  Bot,
  Bus,
  CalendarClock,
  ClipboardCheck,
  FileText,
  GraduationCap,
  MapPin,
  Send,
} from "lucide-react";
import { useEspace } from "@/lib/espace-store";
import { AUJOURDHUI, PLANNING_ESPACE } from "@/data/espace-ouvrier";
import { BarreProgression, Carte, KpiE, Puce, SectionTitre, VideE, tonStatutOuvrier } from "@/components/espace/kit";

export const Route = createFileRoute("/espace/")({
  head: () => ({
    meta: [
      { title: "Accueil — Espace Ouvrier LEONI" },
      { name: "description", content: "Vos tâches du jour, votre planning et votre progression de formation." },
      { property: "og:title", content: "Accueil — Espace Ouvrier LEONI" },
      { property: "og:description", content: "Tâches du jour, planning et progression de la formation." },
    ],
  }),
  component: Accueil,
});

function Accueil() {
  const { ouvrier, evaluations, documents, avertissements, demandes } = useEspace();
  if (!ouvrier) return <VideE texte="Fiche ouvrier introuvable." />;

  const qcmAPasser = evaluations.filter((e) => e.statut !== "Terminée");
  const docsAFournir = documents.filter((d) => d.statut === "À fournir" || d.statut === "À remplacer");
  const avtNonLus = avertissements.filter((a) => !a.lu);
  const demandesOuvertes = demandes.filter((d) => !["Traitée", "Clôturée", "Refusée"].includes(d.statut));
  const jourdhui = PLANNING_ESPACE.filter((c) => c.jour === AUJOURDHUI);

  const taches = [
    ...qcmAPasser.map((e) => ({
      icone: ClipboardCheck,
      titre: `Passer le QCM « ${e.titre} »`,
      detail: `Avant le ${e.limite} · ${e.dureeMinutes} min · seuil ${e.seuil} %`,
      to: "/espace/evaluations",
      ton: "warning" as const,
    })),
    ...docsAFournir.map((d) => ({
      icone: FileText,
      titre: `Envoyer : ${d.nom}`,
      detail: d.motif ?? (d.dateLimite ? `À fournir avant le ${d.dateLimite}` : "Document demandé par les RH"),
      to: "/espace/documents",
      ton: "critical" as const,
    })),
    ...avtNonLus.map((a) => ({
      icone: AlertTriangle,
      titre: `Prendre connaissance : ${a.objet}`,
      detail: `${a.niveau} · ${a.date}`,
      to: "/espace/presence",
      ton: "critical" as const,
    })),
  ];

  return (
    <>
      <Carte className="bg-[var(--brand-soft)]">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--brand)]">
              {ouvrier.parcoursLibelle}
            </p>
            <p className="mt-1 truncate text-lg font-black tracking-tight">{ouvrier.nom}</p>
            <p className="text-xs text-muted-foreground">
              {ouvrier.poste} · {ouvrier.site} · Groupe {ouvrier.groupe}
            </p>
          </div>
          <Puce ton={tonStatutOuvrier(ouvrier.statut)}>{ouvrier.statut}</Puce>
        </div>
        <div className="mt-4">
          <div className="mb-1.5 flex items-center justify-between text-xs font-semibold">
            <span>
              Jour {ouvrier.jour} / {ouvrier.jourTotal}
            </span>
            <span className="text-[var(--brand)]">{ouvrier.progression} %</span>
          </div>
          <BarreProgression valeur={ouvrier.progression} />
        </div>
      </Carte>

      <section>
        <SectionTitre titre={`À faire aujourd'hui (${taches.length})`} />
        <div className="space-y-2.5">
          {taches.length === 0 && <VideE texte="Rien à faire pour le moment. Bonne journée !" />}
          {taches.map((t, i) => (
            <Link key={i} to={t.to} className="block">
              <Carte className="flex items-center gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[var(--brand-soft)] text-[var(--brand)]">
                  <t.icone className="size-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold">{t.titre}</span>
                  <span className="block truncate text-xs text-muted-foreground">{t.detail}</span>
                </span>
                <ArrowRight className="size-4 shrink-0 text-muted-foreground" />
              </Carte>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <SectionTitre
          titre="Mon planning du jour"
          action={
            <Link to="/espace/formation" className="text-xs font-semibold text-[var(--brand)]">
              Tout voir
            </Link>
          }
        />
        <div className="space-y-2.5">
          {jourdhui.map((c) => (
            <Carte key={c.id} className="flex items-center gap-3">
              <div className="w-16 shrink-0 text-center">
                <p className="text-sm font-black">{c.debut}</p>
                <p className="text-[11px] text-muted-foreground">{c.fin}</p>
              </div>
              <div className="min-w-0 flex-1 border-l border-border pl-3">
                <p className="truncate text-sm font-semibold">{c.titre}</p>
                <p className="flex items-center gap-1 truncate text-xs text-muted-foreground">
                  <MapPin className="size-3" /> {c.lieu} · {c.formateur}
                </p>
              </div>
              <Puce ton={tonStatutOuvrier(c.statut)}>{c.statut}</Puce>
            </Carte>
          ))}
        </div>
      </section>

      <section>
        <SectionTitre titre="Mes indicateurs" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <KpiE label="Progression" valeur={`${ouvrier.progression} %`} sous={`Jour ${ouvrier.jour}/${ouvrier.jourTotal}`} />
          <KpiE label="Score moyen" valeur={`${ouvrier.score} %`} sous="Tests & pratique" ton={ouvrier.score >= 70 ? "success" : "warning"} />
          <KpiE label="Présence" valeur={`${ouvrier.presence} %`} ton={ouvrier.presence >= 90 ? "success" : "warning"} />
          <KpiE label="Ponctualité" valeur={`${ouvrier.ponctualite} %`} ton={ouvrier.ponctualite >= 90 ? "success" : "warning"} />
        </div>
      </section>

      <section>
        <SectionTitre titre="Accès rapides" />
        <div className="grid grid-cols-2 gap-3">
          {[
            { to: "/espace/formation", label: "Ma formation", icone: GraduationCap },
            { to: "/espace/evaluations", label: "Mes évaluations", icone: ClipboardCheck },
            { to: "/espace/demandes", label: `Mes demandes (${demandesOuvertes.length})`, icone: Send },
            { to: "/espace/assistant", label: "Assistant LEONI", icone: Bot },
          ].map((a) => (
            <Link key={a.to} to={a.to}>
              <Carte className="flex flex-col gap-2">
                <a.icone className="size-5 text-[var(--brand)]" />
                <span className="text-sm font-semibold">{a.label}</span>
              </Carte>
            </Link>
          ))}
        </div>
      </section>

      {ouvrier.onboarding?.transport && (
        <Carte>
          <p className="flex items-center gap-2 text-sm font-bold">
            <Bus className="size-4 text-[var(--brand)]" /> Mon transport
          </p>
          <p className="mt-1.5 text-xs text-muted-foreground">
            {ouvrier.onboarding.transport.ligne} · départ {ouvrier.onboarding.transport.heureAller} depuis{" "}
            {ouvrier.onboarding.transport.point}
          </p>

          <Link to="/espace/profil" className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-[var(--brand)]">
            <CalendarClock className="size-3.5" /> Voir les détails
          </Link>
        </Carte>
      )}
    </>
  );
}
