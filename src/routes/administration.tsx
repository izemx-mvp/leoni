import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  ATELIERS,
  AUDIT,
  AUTOMATISATIONS,
  COMPETENCES_REF,
  PONDERATIONS_IA,
  POSTES,
  ROLES,
  SITES_PARAMETRAGE,
  UTILISATEURS,
} from "@/data/leoni";
import { Barre, Btn, IAWarning, Kpi, PageHeader, Panel, Table, Tag, Td, Th, Tr } from "@/components/leoni/kit";
import { useLeoni } from "@/lib/leoni-store";
import { ParametresOnboarding } from "@/components/leoni/administration/ParametresOnboarding";

const VUES = ["Utilisateurs", "Sites", "Postes", "Onboarding", "IA", "Automatisations", "Audit"];

export const Route = createFileRoute("/administration")({
  validateSearch: (s: Record<string, unknown>) => ({
    vue: typeof s.vue === "string" && VUES.includes(s.vue) ? s.vue : "Utilisateurs",
  }),
  head: () => ({
    meta: [
      { title: "Administration & paramètres — LEONI Workforce Journey" },
      { name: "description", content: "Administration LEONI Workforce Journey : utilisateurs et rôles, sites et ateliers, postes, pondérations IA, automatisations et journal d'audit." },
      { property: "og:title", content: "Administration & paramètres — LEONI Workforce Journey" },
      { property: "og:description", content: "Gestion des accès, référentiels, paramètres IA et traçabilité." },
    ],
  }),
  component: AdministrationPage,
});

function AdministrationPage() {
  const { vue } = Route.useSearch();
  const navigate = useNavigate();
  const { pousserNotification } = useLeoni();
  const [ponderations, setPonderations] = useState(PONDERATIONS_IA.map((p) => ({ ...p })));
  const [automatisations, setAutomatisations] = useState(AUTOMATISATIONS.map((a) => ({ ...a })));
  const total = ponderations.reduce((s, p) => s + p.poids, 0);

  return (
    <>
      <PageHeader
        titre="Administration"
        sousTitre="Accès, référentiels, paramétrage du moteur IA et traçabilité des actions"
        fil={[{ label: "Administration" }, { label: vue }]}
      />

      <div className="mb-4 flex flex-wrap gap-2">
        {VUES.map((v) => (
          <button
            key={v}
            onClick={() => navigate({ to: "/administration", search: { vue: v } })}
            className={
              v === vue
                ? "rounded-sm border border-[var(--brand)] bg-[var(--selected)] px-3 py-1.5 text-xs font-medium text-[var(--brand)]"
                : "rounded-sm border border-border px-3 py-1.5 text-xs text-muted-foreground hover:bg-[var(--hover)]"
            }
          >
            {v}
          </button>
        ))}
      </div>

      {vue === "Utilisateurs" && (
        <>
          <div className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Kpi label="Utilisateurs" valeur={UTILISATEURS.length} ton="brand" />
            <Kpi label="Actifs" valeur={UTILISATEURS.filter((u) => u.statut === "Actif").length} ton="success" />
            <Kpi label="MFA activé" valeur={UTILISATEURS.filter((u) => u.mfa === "Activé").length} ton="info" />
            <Kpi label="Rôles disponibles" valeur={ROLES.length} ton="neutral" />
          </div>
          <Panel title="Utilisateurs & rôles" bodyClassName="p-0" action={<Btn size="sm" variant="primary" onClick={() => pousserNotification({ titre: "Invitation envoyée", detail: "Un nouvel accès a été créé.", ton: "success" })}>Inviter</Btn>}>
            <Table>
              <thead><tr><Th>Utilisateur</Th><Th>Rôle</Th><Th>Périmètre</Th><Th>MFA</Th><Th>Statut</Th></tr></thead>
              <tbody>
                {UTILISATEURS.map((u) => (
                  <Tr key={u.nom}>
                    <Td className="font-medium">{u.nom}</Td>
                    <Td className="text-muted-foreground">{u.role}</Td>
                    <Td className="text-muted-foreground">{u.perimetre}</Td>
                    <Td><Tag ton={u.mfa === "Activé" ? "success" : "warning"}>{u.mfa}</Tag></Td>
                    <Td><Tag ton={u.statut === "Actif" ? "success" : "critical"}>{u.statut}</Tag></Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
          </Panel>
        </>
      )}

      {vue === "Sites" && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Panel title="Sites LEONI Maroc">
            <ul className="space-y-2">
              {SITES_PARAMETRAGE.map((s) => (
                <li key={s} className="flex items-center justify-between rounded-sm border border-border px-3 py-2 text-sm">
                  {s}
                  <Tag ton={s.includes("futur") ? "warning" : "success"}>{s.includes("futur") ? "En projet" : "Opérationnel"}</Tag>
                </li>
              ))}
            </ul>
          </Panel>
          <Panel title="Ateliers" bodyClassName="p-0">
            <Table>
              <thead><tr><Th>Code</Th><Th>Atelier</Th><Th>Site</Th><Th>Capacité</Th><Th>Responsable</Th></tr></thead>
              <tbody>
                {ATELIERS.map((a) => (
                  <Tr key={a.code}>
                    <Td className="num text-xs text-[var(--brand)]">{a.code}</Td>
                    <Td className="font-medium">{a.nom}</Td>
                    <Td className="text-muted-foreground">{a.site}</Td>
                    <Td className="num">{a.capacite}</Td>
                    <Td className="text-muted-foreground">{a.responsable}</Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
          </Panel>
        </div>
      )}

      {vue === "Postes" && (
        <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
          <Panel title="Postes & parcours associés" bodyClassName="p-0">
            <Table>
              <thead><tr><Th>Code</Th><Th>Poste</Th><Th>Famille</Th><Th>Parcours</Th><Th>Postes ouverts</Th></tr></thead>
              <tbody>
                {POSTES.map((p) => (
                  <Tr key={p.code}>
                    <Td className="num text-xs text-[var(--brand)]">{p.code}</Td>
                    <Td className="font-medium">{p.nom}</Td>
                    <Td className="text-muted-foreground">{p.famille}</Td>
                    <Td className="num text-xs">{p.parcours}</Td>
                    <Td className="num">{p.ouverts}</Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
          </Panel>
          <Panel title="Référentiel de compétences">
            <div className="flex flex-wrap gap-2">
              {COMPETENCES_REF.map((c) => (
                <Tag key={c} ton="brand">{c}</Tag>
              ))}
            </div>
          </Panel>
        </div>
      )}

      {vue === "Onboarding" && <ParametresOnboarding />}

      {vue === "IA" && (
        <Panel
          title="Pondérations du Worker Readiness Score"
          subtitle={`Total actuel : ${total} % — doit être égal à 100 %`}
          action={
            <Btn
              size="sm"
              variant="primary"
              disabled={total !== 100}
              onClick={() => pousserNotification({ titre: "Pondérations enregistrées", detail: "Le moteur de scoring utilisera ces poids au prochain calcul.", ton: "success" })}
            >
              Enregistrer
            </Btn>
          }
        >
          <IAWarning texte="Le score est une aide à la décision. Toute décision RH reste validée par un responsable humain." />
          <ul className="mt-3 space-y-3">
            {ponderations.map((p, i) => (
              <li key={p.critere} className="flex items-center gap-3">
                <span className="w-52 text-sm">{p.critere}</span>
                <input
                  type="range"
                  min={0}
                  max={50}
                  step={5}
                  value={p.poids}
                  onChange={(e) =>
                    setPonderations((prev) => prev.map((x, j) => (j === i ? { ...x, poids: Number(e.target.value) } : x)))
                  }
                  className="w-48 accent-[var(--brand)]"
                />
                <span className="num w-10 text-sm font-medium">{p.poids} %</span>
                <div className="flex-1"><Barre valeur={p.poids * 2} /></div>
              </li>
            ))}
          </ul>
        </Panel>
      )}

      {vue === "Automatisations" && (
        <Panel title="Règles automatiques" bodyClassName="p-0">
          <Table>
            <thead><tr><Th>Règle</Th><Th>Si</Th><Th>Alors</Th><Th>Exécutions</Th><Th>État</Th></tr></thead>
            <tbody>
              {automatisations.map((a) => (
                <Tr key={a.id}>
                  <Td className="num text-xs text-[var(--brand)]">{a.id}</Td>
                  <Td className="font-medium">{a.si}</Td>
                  <Td className="text-muted-foreground">{a.alors}</Td>
                  <Td className="num">{a.executions}</Td>
                  <Td>
                    <Btn
                      size="sm"
                      onClick={() => {
                        setAutomatisations((prev) => prev.map((x) => (x.id === a.id ? { ...x, actif: !x.actif } : x)));
                        pousserNotification({ titre: a.actif ? "Règle désactivée" : "Règle activée", detail: `${a.id} — ${a.si}`, ton: a.actif ? "warning" : "success" });
                      }}
                    >
                      {a.actif ? "Active" : "Inactive"}
                    </Btn>
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        </Panel>
      )}

      {vue === "Audit" && (
        <Panel title="Journal d'audit" bodyClassName="p-0">
          <Table>
            <thead><tr><Th>Date</Th><Th>Utilisateur</Th><Th>Module</Th><Th>Action</Th><Th>Objet</Th><Th>Avant</Th><Th>Après</Th></tr></thead>
            <tbody>
              {AUDIT.map((a) => (
                <Tr key={a.date + a.objet}>
                  <Td className="num text-xs">{a.date}</Td>
                  <Td className="font-medium">{a.utilisateur}</Td>
                  <Td className="text-muted-foreground">{a.module}</Td>
                  <Td>{a.action}</Td>
                  <Td className="num text-xs text-[var(--brand)]">{a.objet}</Td>
                  <Td className="text-muted-foreground">{a.avant}</Td>
                  <Td>{a.apres}</Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        </Panel>
      )}
    </>
  );
}
