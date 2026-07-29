import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCheck } from "lucide-react";
import { useEspace } from "@/lib/espace-store";
import { BoutonE, Carte, Puce, SectionTitre, VideE } from "@/components/espace/kit";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/espace/notifications")({
  head: () => ({
    meta: [
      { title: "Mes notifications — Espace Ouvrier LEONI" },
      { name: "description", content: "Alertes formation, tests, documents, présence et demandes RH." },
      { property: "og:title", content: "Mes notifications — Espace Ouvrier LEONI" },
      { property: "og:description", content: "Toutes vos notifications de formation, documents et demandes." },
    ],
  }),
  component: Notifications,
});

function Notifications() {
  const { notifications, marquerNotifsLues, nonLues } = useEspace();

  return (
    <>
      <SectionTitre
        titre={`Notifications (${nonLues} non lues)`}
        action={
          <BoutonE variante="fantome" taille="sm" onClick={marquerNotifsLues}>
            <CheckCheck className="size-4" /> Tout marquer comme lu
          </BoutonE>
        }
      />
      <div className="space-y-2.5">
        {notifications.length === 0 && <VideE texte="Aucune notification." />}
        {notifications.map((n) => (
          <Carte key={n.id} className={cn(!n.lu && "border-[var(--brand)]/40 bg-[var(--brand-soft)]/40")}>
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{n.titre}</p>
                <p className="text-xs text-muted-foreground">{n.message}</p>
              </div>
              <Puce ton={n.priorite === "Haute" ? "critical" : n.priorite === "Normale" ? "info" : "neutral"}>
                {n.categorie}
              </Puce>
            </div>
            <div className="mt-2 flex items-center justify-between gap-2">
              <span className="text-[11px] text-muted-foreground">{n.date}</span>
              {n.action && (
                <Link to={n.action.to} className="text-xs font-semibold text-[var(--brand)]">
                  {n.action.label}
                </Link>
              )}
            </div>
          </Carte>
        ))}
      </div>
    </>
  );
}
