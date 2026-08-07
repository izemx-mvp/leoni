import { Panel, Table, Td, Th, Tr, Tag, Btn } from "@/components/leoni/kit";
import { KpiExec, SectionExec, EtatTag, Heatmap } from "./kit";
import type { CtxPilotage } from "./contexte";
import {
  EXCEPTIONS_POSTES_CRITIQUES,
  HEATMAP_POSTES,
  POSTES_CRITIQUES_KPI,
  POSTES_CRITIQUES_LISTE,
  pondere,
} from "@/data/pilotage";

export function PostesCritiques({ ctx }: { ctx: CtxPilotage }) {
  const { fiches, objectifs } = ctx;
  const sites = fiches.map((f) => f.site as string);
  const part = fiches.length / 5;
  const p = (n: number) => Math.max(1, Math.round(n * part));
  const conformite = pondere(fiches, "conformitePostesCritiques", 0);
  const lignes = HEATMAP_POSTES.filter((l) => sites.includes(l.site));
  const exceptions = EXCEPTIONS_POSTES_CRITIQUES.filter((e) => sites.includes(e.site));

  return (
    <div className="space-y-8">
      <SectionExec titre="Postes critiques — vue direction" sousTitre="Couverture, conformité et blocages">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5">
          <KpiExec label="Postes critiques actifs" valeur={String(p(POSTES_CRITIQUES_KPI.actifs))} etat="Bon" />
          <KpiExec label="Besoin total" valeur={String(p(POSTES_CRITIQUES_KPI.besoinTotal))} etat="À surveiller" />
          <KpiExec label="Effectif affecté" valeur={String(p(POSTES_CRITIQUES_KPI.effectifAffecte))} etat="À surveiller" />
          <KpiExec label="Taux de couverture" valeur={String(Math.round((POSTES_CRITIQUES_KPI.effectifAffecte / POSTES_CRITIQUES_KPI.besoinTotal) * 100))} unite="%" objectif={objectifs ? "90 %" : undefined} etat="Critique" />
          <KpiExec label="Conformité" valeur={String(conformite)} unite="%" objectif={objectifs ? "95 %" : undefined} etat={conformite >= 90 ? "Bon" : "À surveiller"} />
          <KpiExec label="Ouvriers conformes" valeur={String(p(POSTES_CRITIQUES_KPI.ouvriersConformes))} etat="Bon" />
          <KpiExec label="Sous réserve" valeur={String(p(POSTES_CRITIQUES_KPI.sousReserve))} etat="À surveiller" />
          <KpiExec label="Non conformes" valeur={String(p(POSTES_CRITIQUES_KPI.nonConformes))} etat="Critique" />
          <KpiExec label="Affectations bloquées" valeur={String(p(POSTES_CRITIQUES_KPI.affectationsBloquees))} etat="Critique" />
          <KpiExec label="Documents critiques manquants" valeur={String(p(POSTES_CRITIQUES_KPI.documentsManquants))} etat="À surveiller" />
          <KpiExec label="Compétences manquantes" valeur={String(p(POSTES_CRITIQUES_KPI.competencesManquantes))} etat="À surveiller" />
          <KpiExec label="Habilitations expirées" valeur={String(p(POSTES_CRITIQUES_KPI.habilitationsExpirees))} etat="Critique" />
        </div>
      </SectionExec>

      <SectionExec titre="Heatmap postes critiques" sousTitre="Taux de couverture par site et par poste — vert conforme, orange sous réserve, rouge à risque">
        <Panel>
          <Heatmap
            lignes={lignes}
            colonnes={POSTES_CRITIQUES_LISTE}
            seuils={{ bon: 85, moyen: 65 }}
            format={(v) => `${v} %`}
            onCellule={(site, colonne, v) =>
              ctx.analyser(`${colonne} — ${site}`, [
                `Taux de couverture : ${v} %.`,
                v < 65 ? "Poste sous-couvert : risque d'arrêt de ligne et exposition qualité." : v < 85 ? "Couverture partielle : affectations sous réserve à régulariser." : "Poste conforme aux exigences.",
                "Détail nominatif accessible uniquement via un drill-down autorisé.",
              ])
            }
          />
        </Panel>
      </SectionExec>

      <SectionExec titre="Exceptions à traiter" sousTitre="Seuls les postes présentant un écart sont affichés">
        <Panel>
          <Table>
            <thead>
              <tr>
                <Th>Poste</Th>
                <Th>Site</Th>
                <Th>Besoin</Th>
                <Th>Affectés</Th>
                <Th>Conformes</Th>
                <Th>Couverture</Th>
                <Th>Principal blocage</Th>
                <Th>Risque</Th>
                <Th />
              </tr>
            </thead>
            <tbody>
              {exceptions.map((e) => (
                <Tr key={e.poste + e.site}>
                  <Td className="font-medium">{e.poste}</Td>
                  <Td>{e.site}</Td>
                  <Td className="num">{e.besoin}</Td>
                  <Td className="num">{e.affectes}</Td>
                  <Td className="num">{e.conformes}</Td>
                  <Td className={e.couverture < 60 ? "num font-semibold text-[var(--critical)]" : "num"}>{e.couverture} %</Td>
                  <Td>
                    <Tag ton="warning">{e.blocage}</Tag>
                  </Td>
                  <Td>
                    <EtatTag etat={e.risque} />
                  </Td>
                  <Td>
                    <Btn size="sm" variant="ghost" onClick={() => ctx.creerPlan(`${e.poste} — ${e.site}`, `Porter la couverture de ${e.couverture} % à 85 %`)}>
                      Plan
                    </Btn>
                  </Td>
                </Tr>
              ))}
              {exceptions.length === 0 && (
                <tr>
                  <Td className="py-8 text-center text-xs text-muted-foreground">Aucune exception sur le périmètre sélectionné.</Td>
                </tr>
              )}
            </tbody>
          </Table>
        </Panel>
      </SectionExec>
    </div>
  );
}
