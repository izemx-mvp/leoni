import { createFileRoute } from "@tanstack/react-router";
import { Bus, CreditCard, IdCard, LogOut, Moon, ShieldCheck, Shirt, Sun } from "lucide-react";
import { useEspace } from "@/lib/espace-store";
import { useLeoni } from "@/lib/leoni-store";
import { BoutonE, Carte, Puce, SectionTitre, VideE, inputE, tonStatutOuvrier } from "@/components/espace/kit";

export const Route = createFileRoute("/espace/profil")({
  head: () => ({
    meta: [
      { title: "Mon profil — Espace Ouvrier LEONI" },
      { name: "description", content: "Vos informations, votre badge, vos EPI, votre vestiaire et votre transport." },
      { property: "og:title", content: "Mon profil — Espace Ouvrier LEONI" },
      { property: "og:description", content: "Consultez vos informations, EPI, badge et transport." },
    ],
  }),
  component: Profil;
});

function Profil() {
  return null;
}
