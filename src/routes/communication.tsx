import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { HISTORIQUE_COMMUNICATION, TEMPLATES } from "@/data/leoni";
import { Btn, Kpi, PageHeader, Panel, Select, Table, Tag, Td, Th, Tr } from "@/components/leoni/kit";
import { useLeoni } from "@/lib/leoni-store";

export const Route = createFileRoute("/communication")({
  head: () => ({
    meta: [
      { title: "Communication opérateurs — LEONI Workforce Journey" },
      { name: "description", content: "Envoi WhatsApp et email aux opérateurs LEONI Maroc : bibliothèque de templates, campagnes ciblées et historique de distribution." },
      { property: "og:title", content: "Communication opérateurs — LEONI Workforce Journey" },
      { property: "og:description", content: "Templates WhatsApp / email et historique des envois aux opérateurs." },
    ],
  }),
  component: CommunicationPage,
});

function CommunicationPage() {
  const { pousserNotification } = useLeoni();
  const [template, setTemplate] = useState(TEMPLATES[0].nom);
  const [cible, setCible] = useState("Groupe CBL-08");
  const [message, setMessage] = useState(
    "Bonjour, votre session de formation de demain se tiendra en Salle F12 à 08h30. Merci de vous présenter 10 minutes en avance avec votre badge et vos EPI.",
  );
  const [canal, setCanal] = useState("WhatsApp");

  return (
    <>
      <PageHeader
        titre="Communication"
        sousTitre="WhatsApp, email et notifications internes — chaque envoi est tracé dans le dossier de l'opérateur"
        fil={[{ label: "Communication" }, { label: "Envois & historique" }]}
      />

      <div className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label="Messages envoyés (30 j)" valeur="2 863" ton="brand" />
        <Kpi label="Taux de lecture" valeur={91} suffixe="%" ton="success" />
        <Kpi label="Templates actifs" valeur={TEMPLATES.length} ton="info" />
        <Kpi label="Échecs de distribution" valeur={7} ton="warning" />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_1.1fr]">
        <Panel title="Nouvel envoi" subtitle="Composer un message à partir d'un template">
          <div className="space-y-3">
            <div>
              <p className="label-xs mb-1">Destinataire</p>
              <Select
                value={cible}
                onChange={setCible}
                options={["Groupe CBL-08", "Groupe CBL-07", "Groupe QC-04", "Sara Amrani", "Khadija Rami", "Tous les opérateurs Bouskoura"]}
                className="w-full"
              />
            </div>
            <div>
              <p className="label-xs mb-1">Template</p>
              <Select value={template} onChange={setTemplate} options={TEMPLATES.map((t) => t.nom)} className="w-full" />
            </div>
            <div>
              <p className="label-xs mb-1">Canal</p>
              <Select value={canal} onChange={setCanal} options={["WhatsApp", "Email", "Notification interne"]} className="w-full" />
            </div>
            <div>
              <p className="label-xs mb-1">Message</p>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={6}
                className="w-full rounded-sm border border-border bg-card p-3 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]"
              />
            </div>
            <div className="flex gap-2">
              <Btn
                variant="primary"
                onClick={() =>
                  pousserNotification({ titre: "Message envoyé", detail: `${canal} — ${template} → ${cible}`, ton: "success" })
                }
              >
                Envoyer
              </Btn>
              <Btn onClick={() => pousserNotification({ titre: "Brouillon enregistré", detail: `${template} → ${cible}`, ton: "info" })}>
                Enregistrer le brouillon
              </Btn>
            </div>
          </div>
        </Panel>

        <div className="space-y-4">
          <Panel title="Bibliothèque de templates" bodyClassName="p-0">
            <div className="max-h-72 overflow-auto">
              <Table>
                <thead>
                  <tr><Th>Code</Th><Th>Template</Th><Th>Canal</Th><Th>Utilisations</Th><Th /></tr>
                </thead>
                <tbody>
                  {TEMPLATES.map((t) => (
                    <Tr key={t.code}>
                      <Td className="num text-xs text-[var(--brand)]">{t.code}</Td>
                      <Td className="font-medium">{t.nom}</Td>
                      <Td><Tag ton={t.canal === "WhatsApp" ? "success" : t.canal === "Email" ? "info" : "neutral"}>{t.canal}</Tag></Td>
                      <Td className="num">{t.usage}</Td>
                      <Td>
                        <Btn size="sm" onClick={() => { setTemplate(t.nom); setCanal(t.canal); }}>Utiliser</Btn>
                      </Td>
                    </Tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </Panel>

          <Panel title="Historique des envois" bodyClassName="p-0">
            <Table>
              <thead>
                <tr><Th>Date</Th><Th>Destinataire</Th><Th>Canal</Th><Th>Template</Th><Th>Statut</Th></tr>
              </thead>
              <tbody>
                {HISTORIQUE_COMMUNICATION.map((h) => (
                  <Tr key={h.date + h.destinataire}>
                    <Td className="num text-xs">{h.date}</Td>
                    <Td className="font-medium">{h.destinataire}</Td>
                    <Td className="text-muted-foreground">{h.canal}</Td>
                    <Td className="text-muted-foreground">{h.template}</Td>
                    <Td><Tag ton={h.statut === "Échec" ? "critical" : h.statut === "Envoyé" ? "neutral" : "success"}>{h.statut}</Tag></Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
          </Panel>
        </div>
      </div>
    </>
  );
}
