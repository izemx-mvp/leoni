import { useState } from "react";
import { SITES } from "@/data/leoni";
import { Btn, Panel, Select, Table, Tag, Td, Th, Tr } from "@/components/leoni/kit";
import { useLeoni } from "@/lib/leoni-store";
import {
  CATALOGUE_CONSIGNES,
  CATALOGUE_DOCUMENTS,
  CATALOGUE_EPI,
  EQUIPEMENTS_PAR_POSTE,
  LIGNES_TRANSPORT,
  POINTS_ACCUEIL,
} from "@/data/onboarding";

/** Paramétrage des valeurs par défaut de la pré-intégration (par site et par poste). */
export function ParametresOnboarding() {
  const { pousserNotification } = useLeoni();
  const [site, setSite] = useState(SITES[1]);
  const [poste, setPoste] = useState(Object.keys(EQUIPEMENTS_PAR_POSTE)[0]);
  const [heure, setHeure] = useState("08:00");
  const [point, setPoint] = useState(POINTS_ACCUEIL[0]);
  const [contact, setContact] = useState("Nadia El Ghali");
  const [telephone, setTelephone] = useState("+212 5 22 87 41 00");
  const [docs, setDocs] = useState<string[]>(CATALOGUE_DOCUMENTS.filter((d) => d.presetOperateur).map((d) => d.id));
  const [epi, setEpi] = useState<string[]>(EQUIPEMENTS_PAR_POSTE[poste] ?? []);
  const [consignes, setConsignes] = useState<string[]>(CATALOGUE_CONSIGNES.filter((c) => c.presetOperateur).map((c) => c.id));

  const bascule = (l: string[], set: (v: string[]) => void, id: string) =>
    set(l.includes(id) ? l.filter((x) => x !== id) : [...l, id]);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Panel title="Contexte du paramétrage" className="lg:col-span-2">
        <div className="flex flex-wrap items-end gap-3">
          <label className="block">
            <span className="label-xs">Site</span>
            <div className="mt-1"><Select value={site} onChange={setSite} options={[...SITES]} /></div>
          </label>
          <label className="block">
            <span className="label-xs">Poste</span>
            <div className="mt-1">
              <Select
                value={poste}
                onChange={(v) => {
                  setPoste(v);
                  setEpi(EQUIPEMENTS_PAR_POSTE[v] ?? []);
                }}
                options={Object.keys(EQUIPEMENTS_PAR_POSTE)}
              />
            </div>
          </label>
          <label className="block">
            <span className="label-xs">Heure d'arrivée par défaut</span>
            <input type="time" value={heure} onChange={(e) => setHeure(e.target.value)} className="mt-1 block h-9 rounded-sm border border-border bg-card px-2 text-sm" />
          </label>
          <label className="block">
            <span className="label-xs">Point d'accueil</span>
            <div className="mt-1"><Select value={point} onChange={setPoint} options={POINTS_ACCUEIL} /></div>
          </label>
          <label className="block">
            <span className="label-xs">Contact RH</span>
            <input value={contact} onChange={(e) => setContact(e.target.value)} className="mt-1 block h-9 rounded-sm border border-border bg-card px-2 text-sm" />
          </label>
          <label className="block">
            <span className="label-xs">Téléphone RH</span>
            <input value={telephone} onChange={(e) => setTelephone(e.target.value)} className="mt-1 block h-9 w-44 rounded-sm border border-border bg-card px-2 text-sm" />
          </label>
          <Btn
            variant="primary"
            className="ml-auto"
            onClick={() =>
              pousserNotification({
                titre: "Paramètres d'intégration enregistrés",
                detail: `${site} · ${poste} — ${docs.length} documents, ${epi.length} EPI, ${consignes.length} consignes`,
                ton: "success",
              })
            }
          >
            Enregistrer le modèle
          </Btn>
        </div>
      </Panel>

      <Panel title="Documents demandés par défaut" bodyClassName="p-0">
        <div className="max-h-80 overflow-auto">
          <Table>
            <thead>
              <tr><Th>Actif</Th><Th>Document</Th><Th>Catégorie</Th><Th>Mode</Th></tr>
            </thead>
            <tbody>
              {CATALOGUE_DOCUMENTS.map((d) => (
                <Tr key={d.id}>
                  <Td><input type="checkbox" className="accent-[var(--brand)]" checked={docs.includes(d.id)} onChange={() => bascule(docs, setDocs, d.id)} /></Td>
                  <Td className="font-medium">{d.nom}</Td>
                  <Td className="text-xs text-muted-foreground">{d.categorie}</Td>
                  <Td className="text-xs text-muted-foreground">{d.modeParDefaut}</Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        </div>
      </Panel>

      <div className="grid content-start gap-4">
        <Panel title={`Équipements par défaut — ${poste}`}>
          <div className="grid gap-1.5">
            {CATALOGUE_EPI.map((e) => (
              <label key={e.id} className="flex items-center gap-2 text-xs">
                <input type="checkbox" className="accent-[var(--brand)]" checked={epi.includes(e.id)} onChange={() => bascule(epi, setEpi, e.id)} />
                {e.nom}
                <Tag>{e.tailleType}</Tag>
              </label>
            ))}
          </div>
        </Panel>

        <Panel title={`Lignes de transport — ${site}`} bodyClassName="p-0">
          <Table>
            <thead>
              <tr><Th>Ligne</Th><Th>Point</Th><Th>Aller</Th><Th>Retour</Th></tr>
            </thead>
            <tbody>
              {LIGNES_TRANSPORT.filter((l) => l.site === site).map((l) => (
                <Tr key={l.ligne}>
                  <Td className="num font-medium">{l.ligne}</Td>
                  <Td className="text-muted-foreground">{l.point}</Td>
                  <Td className="num">{l.aller}</Td>
                  <Td className="num">{l.retour}</Td>
                </Tr>
              ))}
              {LIGNES_TRANSPORT.filter((l) => l.site === site).length === 0 && (
                <Tr><Td className="text-xs text-muted-foreground">Aucune ligne configurée pour ce site.</Td></Tr>
              )}
            </tbody>
          </Table>
        </Panel>
      </div>

      <Panel title="Consignes envoyées par défaut" className="lg:col-span-2">
        <div className="grid gap-3 md:grid-cols-3">
          {CATALOGUE_CONSIGNES.map((c) => (
            <label key={c.id} className="flex items-start gap-2 text-xs">
              <input type="checkbox" className="mt-0.5 accent-[var(--brand)]" checked={consignes.includes(c.id)} onChange={() => bascule(consignes, setConsignes, c.id)} />
              <span className="text-muted-foreground"><strong className="text-foreground">{c.categorie}</strong> — {c.texte}</span>
            </label>
          ))}
        </div>
      </Panel>
    </div>
  );
}
