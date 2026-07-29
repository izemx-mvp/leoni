import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useState } from "react";
import { LogIn, ShieldCheck, Smartphone } from "lucide-react";
import { EspaceProvider, useEspace } from "@/lib/espace-store";
import { EspaceShell } from "@/components/espace/EspaceShell";
import { BoutonE, ChampE, inputE } from "@/components/espace/kit";
import { OUVRIER_DEMO_ID } from "@/data/espace-ouvrier";

export const Route = createFileRoute("/espace")({
  head: () => ({
    meta: [
      { title: "Espace Ouvrier — LEONI Workforce Journey" },
      {
        name: "description",
        content:
          "Espace personnel de l'opérateur LEONI : formation, évaluations, présence, documents, demandes et assistant.",
      },
      { property: "og:title", content: "Espace Ouvrier — LEONI Workforce Journey" },
      {
        property: "og:description",
        content: "Suivi de formation, QCM, présence, documents et demandes pour les opérateurs LEONI Maroc.",
      },
    ],
  }),
  component: EspaceLayout,
});

function EspaceLayout() {
  return (
    <EspaceProvider>
      <Garde />
    </EspaceProvider>
  );
}

function Garde() {
  const { connecte } = useEspace();
  if (!connecte) return <Connexion />;
  return (
    <EspaceShell>
      <Outlet />
    </EspaceShell>
  );
}

function Connexion() {
  const { connexion } = useEspace();
  const [identifiant, setIdentifiant] = useState("");
  const [code, setCode] = useState("");
  const [erreur, setErreur] = useState("");

  const valider = () => {
    if (!identifiant.trim() || code.trim().length < 4) {
      setErreur("Saisissez votre matricule (ou CIN) et votre code à 4 chiffres.");
      return;
    }
    if (!connexion(identifiant)) {
      setErreur("Identifiants non reconnus. Contactez le service RH de votre site.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 flex items-center gap-3">
          <span className="flex size-12 items-center justify-center rounded-2xl bg-[var(--brand)] text-sm font-black text-[var(--brand-foreground)]">
            LNI
          </span>
          <div>
            <p className="text-lg font-black tracking-tight">Espace Ouvrier</p>
            <p className="text-xs text-muted-foreground">LEONI Workforce Journey — Maroc</p>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <h1 className="text-base font-bold tracking-tight">Connexion</h1>
          <p className="mt-1 text-xs text-muted-foreground">
            Connectez-vous avec votre matricule LEONI ou votre numéro de CIN.
          </p>

          <div className="mt-5 space-y-4">
            <ChampE label="Matricule ou CIN" aide={`Exemple : ${OUVRIER_DEMO_ID}`}>
              <input
                className={inputE}
                value={identifiant}
                onChange={(e) => setIdentifiant(e.target.value)}
                placeholder="LMA-BOU-2026-0418"
                autoComplete="username"
              />
            </ChampE>
            <ChampE label="Code d'accès (4 chiffres)">
              <input
                className={inputE}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 4))}
                inputMode="numeric"
                placeholder="••••"
                type="password"
                autoComplete="current-password"
              />
            </ChampE>

            {erreur && (
              <p className="rounded-xl bg-[var(--critical)]/10 px-3 py-2 text-xs font-medium text-[var(--critical)]">
                {erreur}
              </p>
            )}

            <BoutonE className="w-full" taille="lg" onClick={valider}>
              <LogIn className="size-4" /> Se connecter
            </BoutonE>
            <BoutonE className="w-full" variante="secondaire" onClick={() => connexion(OUVRIER_DEMO_ID, true)}>
              <Smartphone className="size-4" /> Entrer en mode démo (Sara Amrani)
            </BoutonE>
          </div>

          <p className="mt-5 flex items-start gap-2 text-[11px] text-muted-foreground">
            <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-[var(--brand)]" />
            Vos données personnelles sont protégées. Vous ne voyez que les informations qui vous concernent : les
            commentaires internes RH ne sont jamais affichés.
          </p>
        </div>

        <a href="/" className="mt-4 block text-center text-xs text-muted-foreground underline">
          Retour au Backoffice RH
        </a>
      </div>
    </div>
  );
}
