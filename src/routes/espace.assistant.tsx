import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useRef, useState, useEffect } from "react";
import { Bot, Send, Sparkles } from "lucide-react";
import { useEspace } from "@/lib/espace-store";
import { BoutonE, Carte, VideE, inputE } from "@/components/espace/kit";
import { PLANNING_ESPACE, SUGGESTIONS_ASSISTANT } from "@/data/espace-ouvrier";

export const Route = createFileRoute("/espace/assistant")({
  head: () => ({
    meta: [
      { title: "Assistant — Espace Ouvrier LEONI" },
      { name: "description", content: "Assistant LEONI : réponses sur la formation, les documents, le transport et les démarches." },
      { property: "og:title", content: "Assistant — Espace Ouvrier LEONI" },
      { property: "og:description", content: "Posez vos questions sur votre parcours, vos documents et votre transport." },
    ],
  }),
  component: Assistant,
});

interface Msg {
  role: "ia" | "ouvrier";
  texte: string;
}

function Assistant() {
  const { ouvrier, documents, resultats, evaluations, avertissements } = useEspace();
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "ia",
      texte:
        "Bonjour, je suis l'assistant LEONI. Je peux vous renseigner sur votre formation, vos documents, vos évaluations, votre transport et vos démarches RH. Je ne remplace pas votre formateur ni le service RH.",
    },
  ]);
  const [saisie, setSaisie] = useState("");
  const fin = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fin.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const repondre = useMemo(
    () => (q: string) => {
      const t = q.toLowerCase();
      if (!ouvrier) return "Je n'ai pas accès à votre dossier pour le moment.";
      if (t.includes("formation") && (t.includes("prochaine") || t.includes("quand") || t.includes("planning"))) {
        const suivant = PLANNING_ESPACE.find((c) => c.statut === "À venir");
        return suivant
          ? `Votre prochaine séance : « ${suivant.titre} », ${suivant.jourLibelle} de ${suivant.debut} à ${suivant.fin}, ${suivant.lieu}, avec ${suivant.formateur}.`
          : "Aucune séance à venir n'est planifiée pour l'instant.";
      }
      if (t.includes("document")) {
        const manquants = documents.filter((d) => d.statut === "À fournir" || d.statut === "À remplacer");
        return manquants.length
          ? `Il vous reste ${manquants.length} document(s) à fournir : ${manquants.map((d) => d.nom).join(", ")}. Vous pouvez les envoyer depuis « Mes documents ».`
          : "Votre dossier documentaire est complet, merci.";
      }
      if (t.includes("qcm") || t.includes("score") || t.includes("test") || t.includes("évaluation") || t.includes("evaluation")) {
        const dernier = resultats[0];
        const aPasser = evaluations.filter((e) => e.statut !== "Terminée");
        return `${dernier ? `Votre dernier résultat : ${dernier.titre} — ${dernier.score} % (${dernier.reussi ? "réussi" : "non validé"}).` : "Aucun résultat enregistré."} ${aPasser.length ? `Il vous reste ${aPasser.length} évaluation(s) à passer.` : ""}`;
      }
      if (t.includes("transport") || t.includes("bus") || t.includes("trajet") || t.includes("ramassage")) {
        const tr = ouvrier.onboarding?.transport;
        return tr
          ? `Vous êtes rattachée à la ligne ${tr.ligne} — point de ramassage ${tr.point} (${tr.zone}), départ ${tr.heureAller}, retour ${tr.heureRetour}. Transporteur : ${tr.transporteur}.`
          : "Aucune ligne de transport n'est actuellement affectée à votre dossier.";
      }
      if (t.includes("avertissement")) {
        const a = avertissements[0];
        return a
          ? `Votre dernier avertissement (${a.niveau}) du ${a.date} concerne : ${a.objet}. ${a.messageOuvrier} Vous pouvez en accuser lecture dans « Ma présence ».`
          : "Vous n'avez aucun avertissement.";
      }
      if (t.includes("réclamation") || t.includes("reclamation") || t.includes("problème") || t.includes("probleme")) {
        return "Pour signaler un problème (EPI, sécurité, transport, organisation), ouvrez « Réclamations » puis « Nouvelle réclamation ». Votre demande est transmise au responsable concerné et suivie jusqu'à résolution.";
      }
      if (t.includes("attestation") || t.includes("demande")) {
        return "Pour une attestation ou toute démarche RH, ouvrez « Mes demandes » puis « Nouvelle demande ». Le délai habituel de traitement est de 48 heures ouvrées.";
      }
      if (t.includes("présence") || t.includes("presence") || t.includes("retard") || t.includes("absence")) {
        return `Votre taux de présence est de ${ouvrier.presence} % et votre ponctualité de ${ouvrier.ponctualite} %. Le détail jour par jour est disponible dans « Ma présence ».`;
      }
      if (t.includes("progression") || t.includes("parcours") || t.includes("où j")) {
        return `Vous êtes au jour ${ouvrier.jour} sur ${ouvrier.jourTotal} du parcours « ${ouvrier.parcoursLibelle} », soit ${ouvrier.progression} % de progression, avec un score moyen de ${ouvrier.score} %.`;
      }
      return "Je n'ai pas d'information certaine sur ce point. Je vous invite à créer une demande RH depuis « Mes demandes » : un responsable vous répondra directement.";
    },
    [avertissements, documents, evaluations, ouvrier, resultats],
  );

  const envoyer = (texte: string) => {
    const q = texte.trim();
    if (!q) return;
    setMessages((m) => [...m, { role: "ouvrier", texte: q }]);
    setSaisie("");
    setTimeout(() => setMessages((m) => [...m, { role: "ia", texte: repondre(q) }]), 400);
  };

  if (!ouvrier) return <VideE texte="Fiche ouvrier introuvable." />;

  return (
    <>
      <Carte className="flex items-center gap-3 bg-[var(--brand-soft)]">
        <span className="flex size-11 items-center justify-center rounded-xl bg-[var(--brand)] text-[var(--brand-foreground)]">
          <Bot className="size-5" />
        </span>
        <div>
          <p className="text-sm font-bold">Assistant LEONI</p>
          <p className="text-[11px] text-muted-foreground">
            Informatif uniquement — aucune décision RH n'est prise par l'assistant.
          </p>
        </div>
      </Carte>

      <div className="space-y-3">
        {messages.map((m, i) => (
          <div
            key={i}
            className={
              m.role === "ouvrier"
                ? "ml-10 rounded-2xl bg-[var(--brand)] p-3.5 text-sm text-[var(--brand-foreground)]"
                : "mr-10 rounded-2xl border border-border bg-card p-3.5 text-sm"
            }
          >
            {m.texte}
          </div>
        ))}
        <div ref={fin} />
      </div>

      <div>
        <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
          <Sparkles className="size-3.5" /> Questions fréquentes
        </p>
        <div className="flex flex-wrap gap-2">
          {SUGGESTIONS_ASSISTANT.map((s) => (
            <button
              key={s}
              onClick={() => envoyer(s)}
              className="rounded-full border border-border px-3 py-1.5 text-[11px] font-medium hover:bg-[var(--hover)]"
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="sticky bottom-24 flex gap-2 lg:bottom-4">
        <input
          className={inputE}
          value={saisie}
          onChange={(e) => setSaisie(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && envoyer(saisie)}
          placeholder="Posez votre question…"
        />
        <BoutonE onClick={() => envoyer(saisie)}>
          <Send className="size-4" />
        </BoutonE>
      </div>
    </>
  );
}
