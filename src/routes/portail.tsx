import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Building2, GraduationCap, LayoutDashboard, ShieldCheck, Smartphone, Users } from "lucide-react";

export const Route = createFileRoute("/portail")({
  head: () => ({
    meta: [
      { title: "Portail LEONI — Choisir votre espace" },
      {
        name: "description",
        content:
          "Point d'entrée LEONI Workforce Journey : accédez au Backoffice RH ou à l'Espace Ouvrier depuis une seule page.",
      },
      { property: "og:title", content: "Portail LEONI — Choisir votre espace" },
      { property: "og:description", content: "Accédez au Backoffice RH ou à l'Espace Ouvrier LEONI Maroc." },
    ],
  }),
  component: Portail,
});

const CARTES = [
  {
    to: "/",
    titre: "Backoffice RH",
    sous: "Direction, RH, formateurs",
    texte:
      "Pilotage workforce, recrutement, formation, évaluations, postes critiques, réclamations et KPI Direction.",
    icone: LayoutDashboard,
    points: ["Pilotage Direction", "Recrutement & intégration", "Réclamations & SLA"],
    cta: "Entrer dans le Backoffice",
  },
  {
    to: "/espace",
    titre: "Espace Ouvrier",
    sous: "Opérateurs & opératrices",
    texte:
      "Formation du jour, évaluations QCM, présence, documents, demandes, réclamations et assistant personnel.",
    icone: Smartphone,
    points: ["Ma formation & mes QCM", "Mes documents & demandes", "Assistant LEONI"],
    cta: "Entrer dans l'Espace Ouvrier",
  },
];

function Portail() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-5xl px-5 py-12 lg:py-20">
        <header className="flex items-center gap-3">
          <span className="flex size-12 items-center justify-center rounded-2xl bg-[var(--brand)] text-sm font-black text-[var(--brand-foreground)]">
            LNI
          </span>
          <div>
            <p className="text-lg font-black tracking-tight">LEONI Workforce Journey</p>
            <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Maroc · 5 sites</p>
          </div>
        </header>

        <div className="mt-10 max-w-2xl">
          <h1 className="text-3xl font-black tracking-tight lg:text-4xl">Choisissez votre espace</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Une seule porte d'entrée pour les équipes RH et les opérateurs. Vous pouvez revenir sur cette page à tout
            moment depuis l'en-tête de chaque espace.
          </p>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {CARTES.map((c) => (
            <Link
              key={c.to}
              to={c.to}
              className="group flex flex-col rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:border-[var(--brand)] hover:shadow-md"
            >
              <span className="flex size-12 items-center justify-center rounded-xl bg-[var(--brand-soft)] text-[var(--brand)]">
                <c.icone className="size-6" />
              </span>
              <p className="mt-4 text-lg font-bold tracking-tight">{c.titre}</p>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">{c.sous}</p>
              <p className="mt-3 text-sm text-muted-foreground">{c.texte}</p>
              <ul className="mt-4 space-y-1.5">
                {c.points.map((p) => (
                  <li key={p} className="flex items-center gap-2 text-xs text-foreground/80">
                    <span className="size-1.5 rounded-full bg-[var(--brand)]" /> {p}
                  </li>
                ))}
              </ul>
              <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--brand)]">
                {c.cta}
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          ))}
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          {[
            { icone: Users, t: "1 240 opérateurs suivis" },
            { icone: GraduationCap, t: "Parcours d'intégration 10 jours" },
            { icone: Building2, t: "Bouskoura · Berrechid · Bouznika · Aïn Sebaâ · Agadir" },
          ].map((s) => (
            <div key={s.t} className="flex items-center gap-2.5 rounded-xl border border-border bg-card px-4 py-3">
              <s.icone className="size-4 shrink-0 text-[var(--brand)]" />
              <p className="text-xs text-muted-foreground">{s.t}</p>
            </div>
          ))}
        </div>

        <p className="mt-8 flex items-start gap-2 text-[11px] text-muted-foreground">
          <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-[var(--brand)]" />
          Chaque espace n'affiche que les informations autorisées pour votre rôle. Les commentaires internes RH ne sont
          jamais visibles côté opérateur.
        </p>
      </div>
    </div>
  );
}
