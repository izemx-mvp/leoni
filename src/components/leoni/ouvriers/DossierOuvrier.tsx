import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { AlertTriangle, Check, ChevronRight, Send } from "lucide-react";
import type { Candidat, Ouvrier } from "@/data/leoni";
import {
  Barre,
  Btn,
  Field,
  Input,
  Onglets,
  Panel,
  Select,
  Stat,
  StatutBadge,
  Table,
  Tag,
  Td,
  Textarea,
  Th,
  Tr,
  Vide,
} from "@/components/leoni/kit";
import { useLeoni } from "@/lib/leoni-store";
import {
  CATALOGUE_CONSIGNES,
  HORAIRES_FORMATION,
  LIEUX_FORMATION,
  LIGNES_TRANSPORT,
  PARCOURS_FORMATION,
  STATUTS_BADGE,
  STATUTS_CASIER,
  STATUTS_DOCUMENT,
  STATUTS_EQUIPEMENT,
  STATUTS_TRANSPORT,
  TYPES_CARTE,
  alertesOnboarding,
  dateFinFormation,
  documentsManquants,
  formationParDefaut,
  kpiDocuments,
  messageRelanceDocuments,
  progressionOnboarding,
  type StatutBadge as TStatutBadge,
  type StatutCasier,
  type StatutDocument,
  type StatutEquipement,
  type StatutTransport,
} from "@/data/onboarding";


const SOUS_ONGLETS = [
  "Identité",
  "Administratif",
  "Documents",
  "Pré-intégration",
  "Affectation",
  "EPI & accès",
  "Transport",
];

function tonDoc(s: StatutDocument) {
  if (s === "Validé") return "success" as const;
  if (s === "Reçu" || s === "À vérifier") return "info" as const;
  if (s === "Refusé / non conforme" || s === "Expiré" || s === "À remplacer") return "critical" as const;
  if (s === "Non applicable") return "neutral" as const;
  return "warning" as const;
}

export function DossierOuvrier({ o, candidat }: { o: Ouvrier; candidat?: Candidat }) {
  const { majOnboarding, finaliserAccueil, pousserNotification } = useLeoni();
  const [tab, setTab] = useState(SOUS_ONGLETS[0]);
  const d = o.onboarding;

  // Formation d'intégration : générée par défaut à l'affectation, mais modifiable.
  const formation =
    d?.formation ??
    formationParDefaut({
      dateArrivee: d?.arrivee.date ?? o.dateIntegration,
      poste: o.poste,
      atelier: o.atelier,
      formateur: o.formateur,
      groupe: o.groupe,
    });
  const majFormation = (patch: Partial<typeof formation>) =>
    majOnboarding(o.id, (dd) => ({ ...dd, formation: { ...(dd.formation ?? formation), ...patch } }));
  const basculerConsigne = (id: string) =>
    majOnboarding(o.id, (dd) => ({
      ...dd,
      consignes: dd.consignes.includes(id) ? dd.consignes.filter((x) => x !== id) : [...dd.consignes, id],
    }));


  const vide = (texte: string) => (
    <Panel title="Pré-intégration">
      <Vide texte={texte} />
    </Panel>
  );

  return (
    <>
      <Onglets valeurs={SOUS_ONGLETS} actif={tab} onChange={setTab} />

      {tab === "Identité" && <SyntheseReclamations nom={o.nom} />}


      {tab === "Identité" && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Panel title="Identité">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Nom & prénom" value={o.nom} />
              <Field label="Date de naissance" value={o.identite.naissance} />
              <Field label="CIN" value={o.identite.cin} />
              <Field label="Téléphone" value={o.identite.telephone} />
              <Field label="Email" value={o.identite.email} />
              <Field label="Adresse" value={o.identite.adresse} />
              <Field label="Ville" value={o.identite.ville} />
              <Field label="Contact d'urgence" value={o.identite.contactUrgence} />
            </div>
          </Panel>
          <Panel title="Origine recrutement">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Référence candidature" value={o.candidatId ?? "—"} />
              <Field label="Source" value={candidat?.source ?? "Portail carrière"} />
              <Field label="Date de candidature" value={candidat?.date ?? "—"} />
              <Field label="Score IA initial" value={candidat ? `${candidat.score} %` : "—"} />
              <Field label="Entretien" value={candidat?.entretien ?? "—"} />
              <Field label="Recruteur" value={candidat?.recruteur ?? "—"} />
              <Field label="Décision RH" value={o.decision?.decision ?? "Retenu"} />
            </div>
            {o.candidatId && (
              <Link
                to="/recrutement/candidat/$id"
                params={{ id: o.candidatId }}
                className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-[var(--brand)] hover:underline"
              >
                Ouvrir le dossier candidat original <ChevronRight className="size-3" />
              </Link>
            )}
          </Panel>
        </div>
      )}

      {tab === "Administratif" && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Panel title="Situation professionnelle">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Matricule" value={o.id} />
              <Field label="Site" value={o.site} />
              <Field label="Département" value={o.situation.departement} />
              <Field label="Atelier" value={o.atelier} />
              <Field label="Poste" value={o.poste} />
              <Field label="Équipe" value={o.situation.equipe} />
              <Field label="Shift" value={o.situation.shift} />
              <Field label="Manager" value={o.situation.manager} />
              <Field label="Date d'entrée" value={o.dateIntegration} />
            </div>
          </Panel>
          <Panel title="Dossier administratif">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Contrat" value={o.decision?.decision === "Retenu" ? "En cours de signature" : "Actif"} />
              <Field label="Responsable RH" value={d?.arrivee.contactRH ?? "Amina Rajouh"} />
              <Field label="Téléphone RH" value={d?.arrivee.telephoneRH ?? "+212 5 22 87 41 00"} />
              <Field label="Visite médicale" value={d?.preparation.find((c) => c.label === "Visite médicale programmée")?.fait ? "Programmée" : "À programmer"} />
              <Field label="CNSS" value={d ? (d.documents.find((x) => x.id === "DOC-CNSS")?.statut ?? "—") : "Enregistré"} />
              <Field label="RIB" value={d ? (d.documents.find((x) => x.id === "DOC-RIB")?.statut ?? "—") : "Enregistré"} />
            </div>
          </Panel>
        </div>
      )}

      {tab === "Documents" && (
        <div className="grid gap-4">
          {d ? (
            <>
              <div className="grid gap-3 sm:grid-cols-4">
                <Stat label="Documents requis" valeur={kpiDocuments(d).requis} />
                <Stat label="Reçus" valeur={kpiDocuments(d).recus} />
                <Stat label="Validés" valeur={kpiDocuments(d).valides} ton="success" />
                <Stat label="Manquants" valeur={kpiDocuments(d).manquants} ton={kpiDocuments(d).manquants ? "critical" : undefined} />
              </div>
              <Panel
                title="Documents demandés"
                bodyClassName="p-0"
                action={
                  <Btn
                    size="sm"
                    variant="secondary"
                    onClick={() =>
                      pousserNotification({
                        titre: "Relance documents envoyée",
                        detail: messageRelanceDocuments(o.nom, d).slice(0, 90),
                        ton: "info",
                      })
                    }
                  >
                    <Send className="size-3.5" /> Relancer le salarié
                  </Btn>
                }
              >
                <Table>
                  <thead>
                    <tr>
                      <Th>Document</Th><Th>Catégorie</Th><Th>Obligatoire</Th><Th>Mode</Th>
                      <Th>Date limite</Th><Th>Copies</Th><Th>Statut</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {d.documents.map((doc) => (
                      <Tr key={doc.id}>
                        <Td className="font-medium">{doc.nom}</Td>
                        <Td className="text-xs text-muted-foreground">{doc.categorie}</Td>
                        <Td>{doc.obligatoire ? <Tag ton="brand">Obligatoire</Tag> : <Tag>Facultatif</Tag>}</Td>
                        <Td className="text-xs text-muted-foreground">{doc.mode}</Td>
                        <Td className="num text-xs text-muted-foreground">{doc.dateLimite || "—"}</Td>
                        <Td className="num">{doc.copies}{doc.originalRequis ? " + original" : ""}</Td>
                        <Td>
                          <Select
                            value={doc.statut}
                            options={STATUTS_DOCUMENT}
                            onChange={(v) =>
                              majOnboarding(o.id, (dd) => ({
                                ...dd,
                                documents: dd.documents.map((x) => (x.id === doc.id ? { ...x, statut: v as StatutDocument } : x)),
                              }))
                            }
                          />
                        </Td>
                      </Tr>
                    ))}
                  </tbody>
                </Table>
              </Panel>
              {documentsManquants(d).length > 0 && (
                <Panel title="Documents manquants">
                  <div className="flex flex-wrap gap-2">
                    {documentsManquants(d).map((m) => (
                      <Tag key={m.id} ton={m.obligatoire ? "critical" : "warning"}>{m.nom}</Tag>
                    ))}
                  </div>
                </Panel>
              )}
            </>
          ) : (
            <Panel title="Documents" bodyClassName="p-0">
              <Table>
                <thead>
                  <tr><Th>Document</Th><Th>Date</Th><Th>Statut</Th><Th>Expiration</Th></tr>
                </thead>
                <tbody>
                  {o.documents.map((doc) => (
                    <Tr key={doc.nom}>
                      <Td className="font-medium">{doc.nom}</Td>
                      <Td className="num text-muted-foreground">{doc.date}</Td>
                      <Td><StatutBadge valeur={doc.statut} /></Td>
                      <Td className="num text-muted-foreground">{doc.expiration ?? "—"}</Td>
                    </Tr>
                  ))}
                </tbody>
              </Table>
            </Panel>
          )}
        </div>
      )}

      {tab === "Pré-intégration" &&
        (d ? (
          <div className="grid gap-4 lg:grid-cols-2">
            <Panel title="Arrivée prévue">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Date" value={d.arrivee.date} />
                <Field label="Heure" value={d.arrivee.heure} />
                <Field label="Site" value={d.arrivee.site} />
                <Field label="Point d'accueil" value={d.arrivee.pointAccueil} />
                <Field label="Département" value={d.arrivee.departement} />
                <Field label="Contact RH" value={`${d.arrivee.contactRH} — ${d.arrivee.telephoneRH}`} />
              </div>
              <div className="mt-4">
                <p className="label-xs mb-1">Progression de la préparation</p>
                <div className="flex items-center gap-2">
                  <Barre valeur={progressionOnboarding(d)} />
                  <span className="num text-xs font-semibold">{progressionOnboarding(d)} %</span>
                </div>
              </div>
            </Panel>

            <Panel title="Alertes de pré-intégration">
              {alertesOnboarding(d).length === 0 ? (
                <p className="flex items-center gap-2 text-xs text-[var(--success)]">
                  <Check className="size-4" /> Aucun blocage — le dossier est prêt.
                </p>
              ) : (
                <div className="grid gap-1.5">
                  {alertesOnboarding(d).map((a) => (
                    <div key={a.texte} className="flex items-start gap-2 text-xs">
                      <AlertTriangle className={a.niveau === "critical" ? "mt-0.5 size-3.5 text-[var(--critical)]" : "mt-0.5 size-3.5 text-[var(--warning)]"} />
                      {a.texte}
                    </div>
                  ))}
                </div>
              )}
            </Panel>

            <Panel title="Checklist de préparation">
              <div className="grid gap-1.5 sm:grid-cols-2">
                {d.preparation.map((c) => (
                  <label key={c.id} className="flex items-center gap-2 text-xs">
                    <input
                      type="checkbox"
                      className="accent-[var(--brand)]"
                      checked={c.fait}
                      onChange={() =>
                        majOnboarding(o.id, (dd) => ({
                          ...dd,
                          preparation: dd.preparation.map((x) => (x.id === c.id ? { ...x, fait: !x.fait } : x)),
                        }))
                      }
                    />
                    {c.label}
                  </label>
                ))}
              </div>
            </Panel>

            <Panel
              title="Check-in du jour d'intégration"
              action={
                <Btn
                  size="sm"
                  variant="primary"
                  disabled={d.accueilFinalise}
                  onClick={() => finaliserAccueil(o.id)}
                >
                  {d.accueilFinalise ? "Accueil finalisé" : "Finaliser l'accueil"}
                </Btn>
              }
            >
              <div className="grid gap-1.5 sm:grid-cols-2">
                {d.checkin.map((c) => (
                  <label key={c.id} className="flex items-center gap-2 text-xs">
                    <input
                      type="checkbox"
                      className="accent-[var(--brand)]"
                      checked={c.fait}
                      onChange={() =>
                        majOnboarding(o.id, (dd) => ({
                          ...dd,
                          checkin: dd.checkin.map((x) => (x.id === c.id ? { ...x, fait: !x.fait } : x)),
                        }))
                      }
                    />
                    {c.label}
                  </label>
                ))}
              </div>
            </Panel>

            <Panel
              title="Formation d'intégration"
              className="lg:col-span-2"
              action={<Tag ton="brand">Généré par défaut · modifiable</Tag>}
            >
              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <p className="label-xs mb-1">Parcours de formation</p>
                  <Select
                    className="w-full"
                    value={PARCOURS_FORMATION.includes(formation.parcours) ? formation.parcours : PARCOURS_FORMATION[0]}
                    options={PARCOURS_FORMATION}
                    onChange={(v) => majFormation({ parcours: v })}
                  />
                </div>
                <Input
                  label="Date de début de formation"
                  value={formation.dateDebut}
                  placeholder="JJ/MM/AAAA"
                  onChange={(e) => majFormation({ dateDebut: e.target.value })}
                />
                <Input
                  label="Durée (jours ouvrés)"
                  type="number"
                  min={1}
                  value={formation.dureeJours}
                  onChange={(e) => majFormation({ dureeJours: Number(e.target.value) || 1 })}
                />
                <div>
                  <p className="label-xs mb-1">Horaire</p>
                  <Select
                    className="w-full"
                    value={HORAIRES_FORMATION.includes(formation.horaire) ? formation.horaire : HORAIRES_FORMATION[0]}
                    options={HORAIRES_FORMATION}
                    onChange={(v) => majFormation({ horaire: v })}
                  />
                </div>
                <div>
                  <p className="label-xs mb-1">Lieu</p>
                  <Select
                    className="w-full"
                    value={LIEUX_FORMATION.includes(formation.lieu) ? formation.lieu : LIEUX_FORMATION[0]}
                    options={LIEUX_FORMATION}
                    onChange={(v) => majFormation({ lieu: v })}
                  />
                </div>
                <Input
                  label="Formateur"
                  value={formation.formateur}
                  onChange={(e) => majFormation({ formateur: e.target.value })}
                />
                <Input
                  label="Groupe de formation"
                  value={formation.groupe}
                  onChange={(e) => majFormation({ groupe: e.target.value })}
                />
                <Field label="Date de fin prévisionnelle" value={dateFinFormation(formation)} />
                <Field label="Poste visé" value={`${o.poste} — ${o.atelier}`} />
              </div>
              <div className="mt-3">
                <Textarea
                  label="Instructions et consignes envoyées à l'ouvrier"
                  rows={4}
                  value={formation.instructions}
                  onChange={(e) => majFormation({ instructions: e.target.value })}
                />
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Btn
                  size="sm"
                  variant="secondary"
                  onClick={() =>
                    pousserNotification({
                      titre: "Consignes de formation envoyées",
                      detail: `${o.nom} — début le ${formation.dateDebut} (${formation.dureeJours} j).`,
                      ton: "info",
                    })
                  }
                >
                  <Send className="size-3.5" /> Envoyer les instructions au salarié
                </Btn>
                <span className="text-xs text-muted-foreground">
                  Du {formation.dateDebut} au {dateFinFormation(formation)} · {formation.horaire} · {formation.lieu}
                </span>
              </div>
            </Panel>

            <Panel title="Consignes communiquées" className="lg:col-span-2">
              <div className="grid gap-1.5 sm:grid-cols-2">
                {CATALOGUE_CONSIGNES.filter((c) => c.active).map((c) => (
                  <label key={c.id} className="flex items-start gap-2 text-xs">
                    <input
                      type="checkbox"
                      className="mt-0.5 accent-[var(--brand)]"
                      checked={d.consignes.includes(c.id)}
                      onChange={() => basculerConsigne(c.id)}
                    />
                    <span>
                      <span className="text-muted-foreground">[{c.categorie}]</span> {c.texte}
                    </span>
                  </label>
                ))}
              </div>
            </Panel>


            <Panel title="Communications d'intégration" bodyClassName="p-0">
              {d.communications.length === 0 ? (
                <Vide texte="Aucun message envoyé." />
              ) : (
                <Table>
                  <thead>
                    <tr><Th>Date</Th><Th>Canal</Th><Th>Objet</Th><Th>Statut</Th></tr>
                  </thead>
                  <tbody>
                    {d.communications.map((c) => (
                      <Tr key={c.id}>
                        <Td className="num text-muted-foreground">{c.date} {c.heure}</Td>
                        <Td><Tag ton="brand">{c.canal}</Tag></Td>
                        <Td className="max-w-64 truncate">{c.objet}</Td>
                        <Td className="text-muted-foreground">{c.statut}</Td>
                      </Tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Panel>
          </div>
        ) : (
          vide("Aucun dossier de pré-intégration — cet opérateur est déjà intégré.")
        ))}

      {tab === "Affectation" && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Panel title="Affectation">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Poste" value={o.poste} />
              <Field label="Atelier / ligne" value={o.atelier} />
              <Field label="Groupe de formation" value={o.groupe} />
              <Field label="Parcours" value={o.parcoursLibelle} />
              <Field label="Formateur" value={o.formateur} />
              <Field label="Manager" value={o.situation.manager} />
              <Field label="Équipe" value={o.situation.equipe} />
              <Field label="Shift" value={o.situation.shift} />
            </div>
          </Panel>
          <Panel title="Prochaine étape">
            {o.prochaineEtape ? (
              <div className="grid grid-cols-2 gap-4">
                <Field label="Date" value={o.prochaineEtape.date} />
                <Field label="Heure" value={o.prochaineEtape.heure} />
                <Field label="Libellé" value={o.prochaineEtape.libelle} />
                <Field label="Lieu" value={o.prochaineEtape.lieu} />
              </div>
            ) : (
              <Vide texte="Aucune étape planifiée." />
            )}
            <p className="mt-3 text-xs text-muted-foreground">{o.prochaineAction}</p>
          </Panel>
        </div>
      )}

      {tab === "EPI & accès" &&
        (d ? (
          <div className="grid gap-4 lg:grid-cols-2">
            <Panel title="Badge affecté">
              <div className="grid gap-3 sm:grid-cols-2">
                <Input
                  label="Numéro de badge"
                  value={d.badge.numero}
                  placeholder="À attribuer"
                  onChange={(e) =>
                    majOnboarding(o.id, (dd) => ({ ...dd, badge: { ...dd.badge, numero: e.target.value } }))
                  }
                />
                <Input
                  label="Zones d'accès"
                  value={d.badge.zones}
                  onChange={(e) =>
                    majOnboarding(o.id, (dd) => ({ ...dd, badge: { ...dd.badge, zones: e.target.value } }))
                  }
                />
                <div>
                  <p className="label-xs mb-1">Statut du badge</p>
                  <Select
                    className="w-full"
                    value={d.badge.statut}
                    options={STATUTS_BADGE}
                    onChange={(v) => majOnboarding(o.id, (dd) => ({ ...dd, badge: { ...dd.badge, statut: v as TStatutBadge } }))}
                  />
                </div>
                <Field label="Instruction" value={d.badge.instruction} />
              </div>
            </Panel>

            <Panel title="Carte affectée">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="label-xs mb-1">Type de carte</p>
                  <Select
                    className="w-full"
                    value={d.carte?.type && TYPES_CARTE.includes(d.carte.type) ? d.carte.type : TYPES_CARTE[0]}
                    options={TYPES_CARTE}
                    onChange={(v) =>
                      majOnboarding(o.id, (dd) => ({
                        ...dd,
                        carte: { type: v, numero: dd.carte?.numero ?? "", statut: dd.carte?.statut ?? "À préparer", validite: dd.carte?.validite ?? "" },
                      }))
                    }
                  />
                </div>
                <Input
                  label="Numéro de carte"
                  value={d.carte?.numero ?? ""}
                  placeholder="Non affectée"
                  onChange={(e) =>
                    majOnboarding(o.id, (dd) => ({
                      ...dd,
                      carte: { type: dd.carte?.type ?? TYPES_CARTE[0], numero: e.target.value, statut: dd.carte?.statut ?? "À préparer", validite: dd.carte?.validite ?? "" },
                    }))
                  }
                />
                <div>
                  <p className="label-xs mb-1">Statut</p>
                  <Select
                    className="w-full"
                    value={d.carte?.statut ?? "À préparer"}
                    options={STATUTS_BADGE}
                    onChange={(v) =>
                      majOnboarding(o.id, (dd) => ({
                        ...dd,
                        carte: { type: dd.carte?.type ?? TYPES_CARTE[0], numero: dd.carte?.numero ?? "", statut: v as TStatutBadge, validite: dd.carte?.validite ?? "" },
                      }))
                    }
                  />
                </div>
                <Input
                  label="Validité"
                  value={d.carte?.validite ?? ""}
                  placeholder="JJ/MM/AAAA"
                  onChange={(e) =>
                    majOnboarding(o.id, (dd) => ({
                      ...dd,
                      carte: { type: dd.carte?.type ?? TYPES_CARTE[0], numero: dd.carte?.numero ?? "", statut: dd.carte?.statut ?? "À préparer", validite: e.target.value },
                    }))
                  }
                />
              </div>
            </Panel>

            <Panel title="Vestiaire et casier">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Vestiaire" value={d.vestiaire.vestiaire || "—"} />
                <Field label="Casier" value={d.vestiaire.casier || "Non attribué"} />
              </div>
              <div className="mt-3 w-56">
                <p className="label-xs mb-1">Statut</p>
                <Select
                  value={d.vestiaire.statut}
                  options={STATUTS_CASIER}
                  onChange={(v) => majOnboarding(o.id, (dd) => ({ ...dd, vestiaire: { ...dd.vestiaire, statut: v as StatutCasier } }))}
                />
              </div>
            </Panel>

            <Panel title="Tailles du salarié">
              <div className="grid gap-3 sm:grid-cols-4">
                {(["blouse", "gilet", "chaussures", "gants"] as const).map((k) => (
                  <Input
                    key={k}
                    label={k === "chaussures" ? "Pointure" : k[0].toUpperCase() + k.slice(1)}
                    value={d.tailles[k]}
                    onChange={(e) =>
                      majOnboarding(o.id, (dd) => ({ ...dd, tailles: { ...dd.tailles, [k]: e.target.value } }))
                    }
                  />
                ))}
              </div>
            </Panel>

            <Panel title="Équipements de protection affectés" bodyClassName="p-0" className="lg:col-span-2">
              <Table>
                <thead>
                  <tr><Th>Équipement</Th><Th>Taille</Th><Th>Quantité</Th><Th>Statut</Th></tr>
                </thead>
                <tbody>
                  {d.equipements.map((e) => (
                    <Tr key={e.id}>
                      <Td className="font-medium">{e.nom}</Td>
                      <Td>
                        <Input
                          value={e.taille}
                          placeholder="—"
                          className="h-8 w-20"
                          onChange={(ev) =>
                            majOnboarding(o.id, (dd) => ({
                              ...dd,
                              equipements: dd.equipements.map((x) => (x.id === e.id ? { ...x, taille: ev.target.value } : x)),
                            }))
                          }
                        />
                      </Td>
                      <Td className="num">{e.quantite}</Td>

                      <Td>
                        <Select
                          value={e.statut}
                          options={STATUTS_EQUIPEMENT}
                          onChange={(v) =>
                            majOnboarding(o.id, (dd) => ({
                              ...dd,
                              equipements: dd.equipements.map((x) => (x.id === e.id ? { ...x, statut: v as StatutEquipement } : x)),
                            }))
                          }
                        />
                      </Td>
                    </Tr>
                  ))}
                </tbody>
              </Table>
            </Panel>
          </div>
        ) : (
          vide("Aucun dossier EPI de pré-intégration pour cet opérateur."))
        )}

      {tab === "Transport" &&
        (d ? (
          <div className="grid gap-4 lg:grid-cols-2">
            <Panel
              title="Transport du personnel"
              action={<Tag ton="brand">Modifiable</Tag>}
            >
              <label className="mb-3 flex items-center gap-2 text-xs">
                <input
                  type="checkbox"
                  className="accent-[var(--brand)]"
                  checked={d.transport.besoin}
                  onChange={() =>
                    majOnboarding(o.id, (dd) => ({ ...dd, transport: { ...dd.transport, besoin: !dd.transport.besoin } }))
                  }
                />
                Le salarié utilise le transport du personnel
              </label>

              {d.transport.besoin ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <p className="label-xs mb-1">Ligne de ramassage</p>
                    <Select
                      className="w-full"
                      value={d.transport.ligne || "À définir"}
                      options={["À définir", ...LIGNES_TRANSPORT.map((l) => l.ligne)]}
                      render={(v) => {
                        const l = LIGNES_TRANSPORT.find((x) => x.ligne === v);
                        return l ? `${l.ligne} — ${l.point} (${l.aller})` : v;
                      }}
                      onChange={(v) =>
                        majOnboarding(o.id, (dd) => {
                          const l = LIGNES_TRANSPORT.find((x) => x.ligne === v);
                          return {
                            ...dd,
                            transport: l
                              ? {
                                  ...dd.transport,
                                  ligne: l.ligne,
                                  point: l.point,
                                  zone: l.zone,
                                  heureAller: l.aller,
                                  heureRetour: l.retour,
                                  transporteur: l.transporteur,
                                  contact: l.contact,
                                  statut: dd.transport.statut === "À définir" ? "Trajet proposé" : dd.transport.statut,
                                }
                              : { ...dd.transport, ligne: "" },
                          };
                        })
                      }
                    />
                  </div>
                  <Input
                    label="Point de ramassage"
                    value={d.transport.point}
                    placeholder="À définir"
                    onChange={(e) => majOnboarding(o.id, (dd) => ({ ...dd, transport: { ...dd.transport, point: e.target.value } }))}
                  />
                  <Input
                    label="Zone"
                    value={d.transport.zone}
                    onChange={(e) => majOnboarding(o.id, (dd) => ({ ...dd, transport: { ...dd.transport, zone: e.target.value } }))}
                  />
                  <Input
                    label="Ville"
                    value={d.transport.ville}
                    onChange={(e) => majOnboarding(o.id, (dd) => ({ ...dd, transport: { ...dd.transport, ville: e.target.value } }))}
                  />
                  <Input
                    label="Heure aller"
                    value={d.transport.heureAller}
                    onChange={(e) => majOnboarding(o.id, (dd) => ({ ...dd, transport: { ...dd.transport, heureAller: e.target.value } }))}
                  />
                  <Input
                    label="Heure retour"
                    value={d.transport.heureRetour}
                    onChange={(e) => majOnboarding(o.id, (dd) => ({ ...dd, transport: { ...dd.transport, heureRetour: e.target.value } }))}
                  />
                  <Field label="Transporteur" value={d.transport.transporteur || "—"} />
                  <Field label="Contact transporteur" value={d.transport.contact || "—"} />
                </div>
              ) : (
                <Vide texte="Le salarié n'utilise pas le transport du personnel." />
              )}
              <div className="mt-3 w-64">
                <p className="label-xs mb-1">Statut du transport</p>
                <Select
                  className="w-full"
                  value={d.transport.statut}
                  options={STATUTS_TRANSPORT}
                  onChange={(v) => majOnboarding(o.id, (dd) => ({ ...dd, transport: { ...dd.transport, statut: v as StatutTransport } }))}
                />
              </div>
            </Panel>

            <Panel title="Communication au salarié">
              <label className="flex items-center gap-2 text-xs">
                <input
                  type="checkbox"
                  className="accent-[var(--brand)]"
                  checked={d.transport.communique}
                  onChange={() => majOnboarding(o.id, (dd) => ({ ...dd, transport: { ...dd.transport, communique: !dd.transport.communique } }))}
                />
                Trajet communiqué au salarié
              </label>
              <label className="mt-2 flex items-center gap-2 text-xs">
                <input
                  type="checkbox"
                  className="accent-[var(--brand)]"
                  checked={d.transport.luWhatsApp}
                  onChange={() => majOnboarding(o.id, (dd) => ({ ...dd, transport: { ...dd.transport, luWhatsApp: !dd.transport.luWhatsApp } }))}
                />
                Message WhatsApp lu par le salarié
              </label>
            </Panel>
          </div>
        ) : (
          vide("Aucune information transport de pré-intégration."))
        )}
    </>
  );
}
