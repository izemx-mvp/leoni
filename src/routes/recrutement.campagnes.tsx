import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { BESOINS, CAMPAGNES, POSTES } from "@/data/leoni";
import { Barre, Btn, PageHeader, Panel, StatutBadge, Table, Tag, Td, Th, Tr } from "@/components/leoni/kit";

export const Route = createFileRoute("/recrutement/campagnes")({
  head: () => ({
    meta: [
      { title: "Campagnes & besoins — LEONI Workforce Journey" },
      { name: "description", content: "Pilotage des campagnes de recrutement, des besoins en effectifs et des postes ouverts par site industriel." },
      { property: "og:title", content: "Campagnes & besoins — LEONI Workforce Journey" },
      { property: "og:description", content: "Campagnes de sourcing et besoins de production." },
    ],
  }),
  component: Campagnes,
});

function Campagnes() {
  const [onglet, setOnglet] = useState("Campagnes");

  return (
    <>
      <PageHeader
        titre="Campagnes & besoins"
        sousTitre="Sourcing volumique et couverture des besoins de production"
        fil={[{ label: "Recrutement" }, { label: onglet }]}
        actions={<Btn variant="primary">Créer une campagne</Btn>}
      />

      <div className="mb-4 flex gap-1 border-b border-border">
        {["Campagnes", "Besoins", "Postes"].map((o) => (
          <button
            key={o}
            onClick={() => setOnglet(o)}
            className={
              o === onglet
                ? "-mb-px border-b-2 border-[var(--brand)] px-3 py-2 text-sm font-medium text-[var(--brand)]"
                : "-mb-px border-b-2 border-transparent px-3 py-2 text-sm text-muted-foreground hover:text-foreground"
            }
          >
            {o}
          </button>
        ))}
      </div>

      {onglet === "Campagnes" && (
        <Panel bodyClassName="p-0">
          <Table>
            <thead>
              <tr>
                <Th>Code</Th><Th>Campagne</Th><Th>Site</Th><Th>Objectif</Th><Th>Candidatures</Th><Th>Retenus</Th><Th>Couverture</Th><Th>Statut</Th>
              </tr>
            </thead>
            <tbody>
              {CAMPAGNES.map((c) => (
                <Tr key={c.code}>
                  <Td className="num text-xs text-[var(--brand)]">{c.code}</Td>
                  <Td className="font-medium">{c.nom}</Td>
                  <Td className="text-muted-foreground">{c.site}</Td>
                  <Td className="num">{c.objectif}</Td>
                  <Td className="num">{c.recus}</Td>
                  <Td className="num">{c.retenus}</Td>
                  <Td>
                    <div className="flex w-32 items-center gap-2">
                      <Barre valeur={(c.retenus / c.objectif) * 100} />
                      <span className="num text-xs">{Math.round((c.retenus / c.objectif) * 100)} %</span>
                    </div>
                  </Td>
                  <Td><StatutBadge valeur={c.statut} /></Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        </Panel>
      )}

      {onglet === "Besoins" && (
        <Panel bodyClassName="p-0">
          <Table>
            <thead>
              <tr>
                <Th>Référence</Th><Th>Poste</Th><Th>Site</Th><Th>Volume</Th><Th>Pourvus</Th><Th>Couverture</Th><Th>Échéance</Th><Th>Priorité</Th>
              </tr>
            </thead>
            <tbody>
              {BESOINS.map((b) => (
                <Tr key={b.code}>
                  <Td className="num text-xs text-[var(--brand)]">{b.code}</Td>
                  <Td className="font-medium">{b.poste}</Td>
                  <Td className="text-muted-foreground">{b.site}</Td>
                  <Td className="num">{b.volume}</Td>
                  <Td className="num">{b.pourvus}</Td>
                  <Td>
                    <div className="flex w-32 items-center gap-2">
                      <Barre
                        valeur={(b.pourvus / b.volume) * 100}
                        ton={b.pourvus / b.volume > 0.6 ? "success" : "warning"}
                      />
                      <span className="num text-xs">{Math.round((b.pourvus / b.volume) * 100)} %</span>
                    </div>
                  </Td>
                  <Td className="num text-muted-foreground">{b.echeance}</Td>
                  <Td>
                    <Tag ton={b.priorite === "Critique" ? "critical" : b.priorite === "Élevée" ? "warning" : "neutral"}>
                      {b.priorite}
                    </Tag>
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        </Panel>
      )}

      {onglet === "Postes" && (
        <Panel bodyClassName="p-0">
          <Table>
            <thead>
              <tr>
                <Th>Code</Th><Th>Poste</Th><Th>Famille</Th><Th>Parcours associé</Th><Th>Postes ouverts</Th>
              </tr>
            </thead>
            <tbody>
              {POSTES.map((p) => (
                <Tr key={p.code}>
                  <Td className="num text-xs text-[var(--brand)]">{p.code}</Td>
                  <Td className="font-medium">{p.nom}</Td>
                  <Td className="text-muted-foreground">{p.famille}</Td>
                  <Td><Tag ton="brand">{p.parcours}</Tag></Td>
                  <Td className="num">{p.ouverts}</Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        </Panel>
      )}
    </>
  );
}
