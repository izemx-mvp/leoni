import { useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { AlertTriangle, Check, FileText, Mail, MessageCircle, Package, ShieldCheck, Sparkles, Truck } from "lucide-react";
import type { Candidat } from "@/data/leoni";
import {
  Btn,
  Input,
  Modale,
  Panel,
  Select,
  Table,
  Tag,
  Td,
  Textarea,
  Th,
  Tr,
} from "@/components/leoni/kit";
import { useLeoni } from "@/lib/leoni-store";
import {
  CATALOGUE_CONSIGNES,
  CATALOGUE_DOCUMENTS,
  CATEGORIES_CONSIGNES,
  CATEGORIES_DOCUMENTS,
  CHECKLIST_JOUR_J,
  CHECKLIST_PREPARATION,
  INSTRUCTIONS_BADGE,
  LIGNES_TRANSPORT,
  MODES_REMISE,
  POINTS_ACCUEIL,
  STATUTS_BADGE,
  STATUTS_CASIER,
  STATUTS_EQUIPEMENT,
  STATUTS_TRANSPORT,
  checklistDepuis,
  consignesPreselectionnees,
  dateCourte,
  documentDepuisModele,
  documentsPreselectionnes,
  equipementsPourPoste,
  genererMessage,
  type DocumentOnboarding,
  type DossierOnboarding,
  type EquipementOnboarding,
  type ModeRemise,
  type StatutBadge,
  type StatutCasier,
  type StatutEquipement,
  type StatutTransport,
} from "@/data/onboarding";

const ETAPES = [
  { n: 1, titre: "Décision RH", icone: ShieldCheck },
  { n: 2, titre: "Dossier & documents", icone: FileText },
  { n: 3, titre: "Préparation intégration", icone: Package },
  { n: 4, titre: "Communication", icone: MessageCircle },
  { n: 5, titre: "Validation", icone: Check },
];

const TAILLES_VETEMENT = ["", "XS", "S", "M", "L", "XL", "XXL"];
const POINTURES = ["", "36", "37", "38", "39", "40", "41", "42", "43", "44", "45"];

function isoDansJours(n: number) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

export function DecisionRetenu({ candidat, onClose }: { candidat: Candidat; onClose: () => void }) {
  const navigate = useNavigate();
  const { preIntegrerCandidat } = useLeoni();
  const [etape, setEtape] = useState(1);

  // Étape 1
  const [commentaire, setCommentaire] = useState(
    `Profil validé pour le poste de ${candidat.poste} — score Talent Fit ${candidat.score} %.`,
  );
  const [responsable, setResponsable] = useState("Amina Rajouh");
  const [typeContrat, setTypeContrat] = useState("CDD 6 mois");

  // Arrivée
  const [dateArrivee, setDateArrivee] = useState(isoDansJours(7));
  const [heureArrivee, setHeureArrivee] = useState("08:00");
  const [pointAccueil, setPointAccueil] = useState(POINTS_ACCUEIL[0]);
  const [departement, setDepartement] = useState("Production câblage");
  const [poste, setPoste] = useState(candidat.poste);
  const [atelier, setAtelier] = useState("À affecter");
  const [contactRH, setContactRH] = useState("Amina Rajouh");
  const [telephoneRH, setTelephoneRH] = useState("+212 5 22 87 41 00");

  // Étape 2
  const [documents, setDocuments] = useState<DocumentOnboarding[]>(() => documentsPreselectionnes(isoDansJours(5)));
  const [ajoutDoc, setAjoutDoc] = useState(CATALOGUE_DOCUMENTS[0].id);

  // Étape 3
  const [badgeStatut, setBadgeStatut] = useState<StatutBadge>("À préparer");
  const [badgeNumero, setBadgeNumero] = useState("");
  const [badgeZones, setBadgeZones] = useState("Zone production · Vestiaires · Réfectoire");
  const [badgeInstruction, setBadgeInstruction] = useState(INSTRUCTIONS_BADGE[0]);
  const [equipements, setEquipements] = useState<EquipementOnboarding[]>(() => equipementsPourPoste(candidat.poste));
  const [tailles, setTailles] = useState({ blouse: "M", gilet: "M", chaussures: "38", gants: "M" });
  const [casierStatut, setCasierStatut] = useState<StatutCasier>("À affecter");
  const [vestiaire, setVestiaire] = useState("Vestiaire femmes B");
  const [casier, setCasier] = useState("");
  const [besoinTransport, setBesoinTransport] = useState(true);
  const [ligneId, setLigneId] = useState("");
  const [transportStatut, setTransportStatut] = useState<StatutTransport>("Demandé");
  const [preparation, setPreparation] = useState(() =>
    checklistDepuis(CHECKLIST_PREPARATION, ["Matricule créé", "Planning intégration préparé"]),
  );
  const [consignes, setConsignes] = useState<string[]>(() => consignesPreselectionnees());

  // Étape 4
  const [canal, setCanal] = useState<"WhatsApp" | "Email">("WhatsApp");
  const [messageEdite, setMessageEdite] = useState<string | null>(null);
  const [envoiPlanifie, setEnvoiPlanifie] = useState("Immédiat");

  const ligne = LIGNES_TRANSPORT.find((l) => l.ligne === ligneId);

  const dossier = useMemo<DossierOnboarding>(
    () => ({
      candidatId: candidat.id,
      arrivee: {
        date: dateCourte(dateArrivee),
        heure: heureArrivee,
        site: candidat.site,
        pointAccueil,
        contactRH,
        telephoneRH,
        departement,
        poste,
        atelier,
      },
      badge: {
        statut: badgeStatut,
        numero: badgeNumero,
        dateCreation: "",
        dateRemise: "",
        dateActivation: "",
        zones: badgeZones,
        instruction: badgeInstruction,
      },
      documents,
      equipements: equipements.map((e) => ({
        ...e,
        taille:
          e.id === "EPI-BLOUSE"
            ? tailles.blouse
            : e.id === "EPI-GILET"
              ? tailles.gilet
              : e.id === "EPI-CHAUSSURES"
                ? tailles.chaussures
                : e.id === "EPI-GANTS"
                  ? tailles.gants
                  : e.taille,
      })),
      tailles,
      vestiaire: {
        statut: casierStatut,
        vestiaire,
        casier,
        cle: "",
        dateRemise: "",
        checklist: checklistDepuis(["Casier attribué", "Clé remise", "Casier communiqué au salarié"]),
      },
      transport: {
        statut: besoinTransport ? transportStatut : "Non nécessaire",
        besoin: besoinTransport,
        ville: candidat.ville,
        zone: ligne?.zone ?? "",
        point: ligne?.point ?? "",
        ligne: ligne?.ligne ?? "",
        heureAller: ligne?.aller ?? "",
        heureRetour: ligne?.retour ?? "",
        transporteur: ligne?.transporteur ?? "",
        contact: ligne?.contact ?? "",
        communique: false,
        luWhatsApp: false,
      },
      preparation,
      checkin: checklistDepuis(CHECKLIST_JOUR_J),
      consignes,
      communications: [],
      accueilFinalise: false,
    }),
    [
      candidat, dateArrivee, heureArrivee, pointAccueil, contactRH, telephoneRH, departement, poste, atelier,
      badgeStatut, badgeNumero, badgeZones, badgeInstruction, documents, equipements, tailles, casierStatut,
      vestiaire, casier, besoinTransport, transportStatut, ligne, preparation, consignes,
    ],
  );

  const messageGenere = useMemo(() => genererMessage(canal, candidat.nom, dossier), [canal, candidat.nom, dossier]);
  const corps = messageEdite ?? messageGenere.corps;

  const docsObligatoiresManquants = documents.filter((d) => d.obligatoire).length === 0;

  const valider = () => {
    const dossierFinal: DossierOnboarding = {
      ...dossier,
      communications: [
        {
          id: `COM-${Date.now()}`,
          date: dateCourte(new Date().toISOString().slice(0, 10)),
          heure: new Date().toTimeString().slice(0, 5),
          canal,
          objet: messageGenere.objet,
          contenu: corps,
          statut: envoiPlanifie === "Immédiat" ? "Envoyé" : `Planifié — ${envoiPlanifie}`,
          etapes: ["Message généré", "Message validé RH", envoiPlanifie === "Immédiat" ? "Envoyé" : "Programmé"],
        },
      ],
    };
    const matricule = preIntegrerCandidat(candidat.id, dossierFinal, { commentaire, responsable });
    onClose();
    if (matricule) navigate({ to: "/ouvriers/$id", params: { id: matricule } });
  };

  const setDoc = (id: string, maj: Partial<DocumentOnboarding>) =>
    setDocuments((prev) => prev.map((d) => (d.id === id ? { ...d, ...maj } : d)));
  const setEquip = (id: string, maj: Partial<EquipementOnboarding>) =>
    setEquipements((prev) => prev.map((e) => (e.id === id ? { ...e, ...maj } : e)));

  return (
    <Modale
      large
      titre={`Décision RH — Candidat retenu · ${candidat.nom}`}
      sousTitre={`${candidat.id} · ${candidat.poste} · ${candidat.site} — préparation complète de la pré-intégration`}
      onClose={onClose}
      footer={
        <>
          <Btn variant="ghost" onClick={onClose}>
            Annuler
          </Btn>
          {etape > 1 && (
            <Btn variant="secondary" onClick={() => setEtape((e) => e - 1)}>
              Précédent
            </Btn>
          )}
          {etape < 5 ? (
            <Btn variant="primary" onClick={() => setEtape((e) => e + 1)}>
              Continuer
            </Btn>
          ) : (
            <Btn variant="primary" onClick={valider}>
              Valider et créer la fiche ouvrier
            </Btn>
          )}
        </>
      }
    >
      {/* Stepper */}
      <div className="mb-4 flex flex-wrap items-center gap-1.5">
        {ETAPES.map((e) => {
          const Icone = e.icone;
          const actif = e.n === etape;
          const fait = e.n < etape;
          return (
            <button
              key={e.n}
              onClick={() => setEtape(e.n)}
              className={
                actif
                  ? "flex items-center gap-1.5 rounded-sm border border-[var(--brand)] bg-[var(--selected)] px-2.5 py-1.5 text-xs font-medium text-[var(--brand)]"
                  : fait
                    ? "flex items-center gap-1.5 rounded-sm border border-border px-2.5 py-1.5 text-xs text-[var(--success)]"
                    : "flex items-center gap-1.5 rounded-sm border border-border px-2.5 py-1.5 text-xs text-muted-foreground"
              }
            >
              <Icone className="size-3.5" />
              {e.n}. {e.titre}
            </button>
          );
        })}
      </div>

      {/* Étape 1 — Décision RH */}
      {etape === 1 && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Panel title="Décision">
            <div className="mb-3 flex items-center gap-2 rounded-sm border border-[var(--success)] bg-[var(--success)]/10 px-3 py-2 text-xs">
              <ShieldCheck className="size-4 text-[var(--success)]" />
              Décision retenue : <strong>Candidat retenu</strong> — un dossier ouvrier sera créé automatiquement.
            </div>
            <div className="grid gap-3">
              <Textarea label="Commentaire de décision" rows={4} value={commentaire} onChange={(e) => setCommentaire(e.target.value)} />
              <Input label="Responsable de la décision" value={responsable} onChange={(e) => setResponsable(e.target.value)} />
              <label className="block">
                <span className="label-xs">Type de contrat envisagé</span>
                <div className="mt-1">
                  <Select value={typeContrat} onChange={setTypeContrat} options={["CDD 6 mois", "CDD 12 mois", "CDI", "Intérim", "Contrat d'insertion"]} />
                </div>
              </label>
            </div>
          </Panel>
          <Panel title="Date et lieu d'intégration">
            <div className="grid gap-3 sm:grid-cols-2">
              <Input label="Date d'intégration" type="date" value={dateArrivee} onChange={(e) => setDateArrivee(e.target.value)} />
              <Input label="Heure d'arrivée" type="time" value={heureArrivee} onChange={(e) => setHeureArrivee(e.target.value)} />
              <Input label="Site" value={candidat.site} readOnly />
              <label className="block">
                <span className="label-xs">Point d'accueil</span>
                <div className="mt-1">
                  <Select value={pointAccueil} onChange={setPointAccueil} options={POINTS_ACCUEIL} />
                </div>
              </label>
              <Input label="Département" value={departement} onChange={(e) => setDepartement(e.target.value)} />
              <Input label="Poste" value={poste} onChange={(e) => setPoste(e.target.value)} />
              <Input label="Atelier / ligne" value={atelier} onChange={(e) => setAtelier(e.target.value)} />
              <Input label="Contact RH" value={contactRH} onChange={(e) => setContactRH(e.target.value)} />
              <Input label="Téléphone RH" value={telephoneRH} onChange={(e) => setTelephoneRH(e.target.value)} />
            </div>
          </Panel>
        </div>
      )}

      {/* Étape 2 — Documents */}
      {etape === 2 && (
        <div className="grid gap-4">
          <div className="flex flex-wrap items-end gap-2 rounded-md border border-border bg-card p-3">
            <label className="block">
              <span className="label-xs">Ajouter un document au dossier</span>
              <div className="mt-1">
                <Select
                  value={ajoutDoc}
                  onChange={setAjoutDoc}
                  options={CATALOGUE_DOCUMENTS.map((d) => d.id)}
                  render={(id) => CATALOGUE_DOCUMENTS.find((d) => d.id === id)?.nom ?? id}
                />
              </div>
            </label>
            <Btn
              variant="secondary"
              onClick={() => {
                const m = CATALOGUE_DOCUMENTS.find((d) => d.id === ajoutDoc);
                if (m && !documents.some((d) => d.id === m.id))
                  setDocuments((p) => [...p, documentDepuisModele(m, isoDansJours(5))]);
              }}
            >
              Ajouter
            </Btn>
            <span className="ml-auto text-xs text-muted-foreground">
              {documents.length} document(s) — {documents.filter((d) => d.obligatoire).length} obligatoire(s)
            </span>
          </div>

          {docsObligatoiresManquants && (
            <div className="flex items-center gap-2 rounded-sm border border-[var(--warning)] bg-[var(--warning)]/10 px-3 py-2 text-xs">
              <AlertTriangle className="size-4 text-[var(--warning)]" /> Aucun document obligatoire sélectionné.
            </div>
          )}

          {CATEGORIES_DOCUMENTS.filter((c) => documents.some((d) => d.categorie === c)).map((cat) => (
            <Panel key={cat} title={cat} bodyClassName="p-0">
              <Table>
                <thead>
                  <tr>
                    <Th>Document</Th><Th>Obligatoire</Th><Th>Mode de remise</Th><Th>Date limite</Th>
                    <Th>Copies</Th><Th>Original</Th><Th>Commentaire</Th><Th />
                  </tr>
                </thead>
                <tbody>
                  {documents.filter((d) => d.categorie === cat).map((d) => (
                    <Tr key={d.id}>
                      <Td className="font-medium">{d.nom}</Td>
                      <Td>
                        <input type="checkbox" className="accent-[var(--brand)]" checked={d.obligatoire} onChange={() => setDoc(d.id, { obligatoire: !d.obligatoire })} />
                      </Td>
                      <Td>
                        <Select value={d.mode} onChange={(v) => setDoc(d.id, { mode: v as ModeRemise })} options={MODES_REMISE} />
                      </Td>
                      <Td>
                        <input type="date" value={d.dateLimite} onChange={(e) => setDoc(d.id, { dateLimite: e.target.value })} className="h-8 rounded-sm border border-border bg-card px-2 text-xs" />
                      </Td>
                      <Td>
                        <input type="number" min={1} max={5} value={d.copies} onChange={(e) => setDoc(d.id, { copies: Number(e.target.value) })} className="num h-8 w-14 rounded-sm border border-border bg-card px-2 text-xs" />
                      </Td>
                      <Td>
                        <input type="checkbox" className="accent-[var(--brand)]" checked={d.originalRequis} onChange={() => setDoc(d.id, { originalRequis: !d.originalRequis })} />
                      </Td>
                      <Td>
                        <input value={d.commentaire} placeholder="Précision…" onChange={(e) => setDoc(d.id, { commentaire: e.target.value })} className="h-8 w-40 rounded-sm border border-border bg-card px-2 text-xs" />
                      </Td>
                      <Td>
                        <Btn size="sm" variant="ghost" onClick={() => setDocuments((p) => p.filter((x) => x.id !== d.id))}>
                          Retirer
                        </Btn>
                      </Td>
                    </Tr>
                  ))}
                </tbody>
              </Table>
            </Panel>
          ))}
        </div>
      )}

      {/* Étape 3 — Préparation */}
      {etape === 3 && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Panel title="Badge et accès">
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="label-xs">Statut du badge</span>
                <div className="mt-1"><Select value={badgeStatut} onChange={(v) => setBadgeStatut(v as StatutBadge)} options={STATUTS_BADGE} /></div>
              </label>
              <Input label="Numéro de badge" value={badgeNumero} placeholder="Attribué à la création" onChange={(e) => setBadgeNumero(e.target.value)} />
              <Input label="Zones autorisées" className="sm:col-span-2" value={badgeZones} onChange={(e) => setBadgeZones(e.target.value)} />
              <label className="block sm:col-span-2">
                <span className="label-xs">Instruction communiquée au salarié</span>
                <div className="mt-1"><Select value={badgeInstruction} onChange={setBadgeInstruction} options={INSTRUCTIONS_BADGE} /></div>
              </label>
            </div>
          </Panel>

          <Panel title="Vestiaire et casier">
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="label-xs">Statut</span>
                <div className="mt-1"><Select value={casierStatut} onChange={(v) => setCasierStatut(v as StatutCasier)} options={STATUTS_CASIER} /></div>
              </label>
              <Input label="Vestiaire" value={vestiaire} onChange={(e) => setVestiaire(e.target.value)} />
              <Input label="Numéro de casier" value={casier} placeholder="Ex. 214" onChange={(e) => setCasier(e.target.value)} />
            </div>
          </Panel>

          <Panel title="Équipements et tenue" bodyClassName="p-0" className="lg:col-span-2">
            <div className="flex flex-wrap gap-3 border-b border-border p-3">
              {[
                { k: "blouse" as const, l: "Taille blouse", o: TAILLES_VETEMENT },
                { k: "gilet" as const, l: "Taille gilet", o: TAILLES_VETEMENT },
                { k: "chaussures" as const, l: "Pointure", o: POINTURES },
                { k: "gants" as const, l: "Taille gants", o: TAILLES_VETEMENT },
              ].map((t) => (
                <label key={t.k} className="block">
                  <span className="label-xs">{t.l}</span>
                  <div className="mt-1">
                    <Select value={tailles[t.k]} onChange={(v) => setTailles((p) => ({ ...p, [t.k]: v }))} options={t.o} />
                  </div>
                </label>
              ))}
            </div>
            <Table>
              <thead>
                <tr><Th>Équipement</Th><Th>Requis</Th><Th>Quantité</Th><Th>Statut</Th></tr>
              </thead>
              <tbody>
                {equipements.map((e) => (
                  <Tr key={e.id}>
                    <Td className="font-medium">{e.nom}</Td>
                    <Td><input type="checkbox" className="accent-[var(--brand)]" checked={e.requis} onChange={() => setEquip(e.id, { requis: !e.requis })} /></Td>
                    <Td><input type="number" min={1} max={5} value={e.quantite} onChange={(ev) => setEquip(e.id, { quantite: Number(ev.target.value) })} className="num h-8 w-14 rounded-sm border border-border bg-card px-2 text-xs" /></Td>
                    <Td><Select value={e.statut} onChange={(v) => setEquip(e.id, { statut: v as StatutEquipement })} options={STATUTS_EQUIPEMENT} /></Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
          </Panel>

          <Panel title="Transport">
            <label className="mb-3 flex items-center gap-2 text-xs">
              <input type="checkbox" className="accent-[var(--brand)]" checked={besoinTransport} onChange={() => setBesoinTransport((v) => !v)} />
              Le salarié a besoin du transport du personnel
            </label>
            {besoinTransport && (
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block sm:col-span-2">
                  <span className="label-xs">Ligne / point de ramassage</span>
                  <div className="mt-1">
                    <Select
                      value={ligneId}
                      onChange={setLigneId}
                      options={["", ...LIGNES_TRANSPORT.map((l) => l.ligne)]}
                      render={(v) => {
                        const l = LIGNES_TRANSPORT.find((x) => x.ligne === v);
                        return l ? `${l.ligne} — ${l.point} (${l.aller})` : "À définir";
                      }}
                    />
                  </div>
                </label>
                <label className="block">
                  <span className="label-xs">Statut transport</span>
                  <div className="mt-1"><Select value={transportStatut} onChange={(v) => setTransportStatut(v as StatutTransport)} options={STATUTS_TRANSPORT.filter((s) => s !== "Non nécessaire")} /></div>
                </label>
                {ligne && (
                  <div className="rounded-sm border border-border p-3 text-xs text-muted-foreground">
                    <p className="flex items-center gap-1.5 font-medium text-foreground"><Truck className="size-3.5" /> {ligne.transporteur}</p>
                    <p className="mt-1">Aller {ligne.aller} · Retour {ligne.retour}</p>
                    <p>Contact : {ligne.contact}</p>
                  </div>
                )}
              </div>
            )}
          </Panel>

          <Panel title="Checklist de préparation">
            <div className="grid gap-1.5 sm:grid-cols-2">
              {preparation.map((c) => (
                <label key={c.id} className="flex items-center gap-2 text-xs">
                  <input
                    type="checkbox"
                    className="accent-[var(--brand)]"
                    checked={c.fait}
                    onChange={() => setPreparation((p) => p.map((x) => (x.id === c.id ? { ...x, fait: !x.fait } : x)))}
                  />
                  {c.label}
                </label>
              ))}
            </div>
          </Panel>

          <Panel title="Consignes communiquées" className="lg:col-span-2">
            <div className="grid gap-3 md:grid-cols-3">
              {CATEGORIES_CONSIGNES.map((cat) => (
                <div key={cat}>
                  <p className="label-xs mb-1">{cat}</p>
                  <div className="grid gap-1">
                    {CATALOGUE_CONSIGNES.filter((c) => c.categorie === cat).map((c) => (
                      <label key={c.id} className="flex items-start gap-2 text-xs">
                        <input
                          type="checkbox"
                          className="mt-0.5 accent-[var(--brand)]"
                          checked={consignes.includes(c.id)}
                          onChange={() =>
                            setConsignes((p) => (p.includes(c.id) ? p.filter((x) => x !== c.id) : [...p, c.id]))
                          }
                        />
                        <span className="text-muted-foreground">{c.texte}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      )}

      {/* Étape 4 — Communication */}
      {etape === 4 && (
        <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
          <div className="grid content-start gap-3">
            <Panel title="Canal">
              <div className="grid gap-2">
                {(["WhatsApp", "Email"] as const).map((c) => (
                  <button
                    key={c}
                    onClick={() => {
                      setCanal(c);
                      setMessageEdite(null);
                    }}
                    className={
                      canal === c
                        ? "flex items-center gap-2 rounded-sm border border-[var(--brand)] bg-[var(--selected)] px-3 py-2 text-xs font-medium text-[var(--brand)]"
                        : "flex items-center gap-2 rounded-sm border border-border px-3 py-2 text-xs text-muted-foreground hover:bg-[var(--hover)]"
                    }
                  >
                    {c === "WhatsApp" ? <MessageCircle className="size-3.5" /> : <Mail className="size-3.5" />}
                    {c}
                  </button>
                ))}
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                Destinataire : {canal === "WhatsApp" ? candidat.telephone : candidat.email}
              </p>
            </Panel>
            <Panel title="Envoi">
              <Select value={envoiPlanifie} onChange={setEnvoiPlanifie} options={["Immédiat", "Ce soir 18:00", "Demain 09:00", "J-2 avant l'intégration"]} />
              <Btn className="mt-3 w-full" variant="secondary" onClick={() => setMessageEdite(null)}>
                <Sparkles className="size-3.5" /> Régénérer le message
              </Btn>
            </Panel>
            <Panel title="Variables injectées">
              <div className="grid gap-1 text-xs text-muted-foreground">
                <span>Nom : {candidat.nom}</span>
                <span>Poste : {poste}</span>
                <span>Site : {candidat.site}</span>
                <span>Date : {dateCourte(dateArrivee)} — {heureArrivee}</span>
                <span>Documents : {documents.length}</span>
                <span>Transport : {ligne?.ligne ?? (besoinTransport ? "à définir" : "non nécessaire")}</span>
              </div>
            </Panel>
          </div>
          <Panel title={canal === "Email" ? `Objet : ${messageGenere.objet}` : "Aperçu du message WhatsApp"}>
            <Textarea rows={22} value={corps} onChange={(e) => setMessageEdite(e.target.value)} className="font-mono text-xs" />
          </Panel>
        </div>
      )}

      {/* Étape 5 — Validation */}
      {etape === 5 && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Panel title="Récapitulatif de la pré-intégration">
            <div className="grid gap-2 text-xs">
              {[
                ["Candidat", `${candidat.nom} · ${candidat.id}`],
                ["Décision", "Retenu"],
                ["Contrat envisagé", typeContrat],
                ["Poste / département", `${poste} · ${departement}`],
                ["Site / atelier", `${candidat.site} · ${atelier}`],
                ["Arrivée", `${dateCourte(dateArrivee)} à ${heureArrivee} — ${pointAccueil}`],
                ["Documents demandés", `${documents.length} (${documents.filter((d) => d.obligatoire).length} obligatoires)`],
                ["Badge", `${badgeStatut} · ${badgeZones}`],
                ["Équipements", equipements.filter((e) => e.requis).map((e) => e.nom).join(", ") || "—"],
                ["Vestiaire", `${casierStatut}${casier ? ` · casier ${casier}` : ""}`],
                ["Transport", besoinTransport ? (ligne ? `${ligne.ligne} — ${ligne.point} (${ligne.aller})` : "À définir") : "Non nécessaire"],
                ["Consignes", `${consignes.length} consigne(s) communiquée(s)`],
                ["Communication", `${canal} — ${envoiPlanifie}`],
              ].map(([l, v]) => (
                <div key={l} className="flex justify-between gap-4 border-b border-border pb-1">
                  <span className="text-muted-foreground">{l}</span>
                  <span className="text-right font-medium">{v}</span>
                </div>
              ))}
            </div>
          </Panel>
          <div className="grid content-start gap-4">
            <Panel title="Ce qui sera créé automatiquement">
              <ul className="grid gap-1.5 text-xs text-muted-foreground">
                {[
                  "Fiche ouvrier au statut « À intégrer » avec matricule",
                  "Dossier documents avec suivi par statut",
                  "Checklist de préparation et check-in du jour J",
                  "Dossier badge, EPI, vestiaire et transport",
                  "Message d'intégration archivé dans les communications",
                  "Alertes de pré-intégration si éléments manquants",
                ].map((t) => (
                  <li key={t} className="flex items-start gap-2">
                    <Check className="mt-0.5 size-3.5 text-[var(--success)]" /> {t}
                  </li>
                ))}
              </ul>
            </Panel>
            <Panel title="Points de vigilance">
              <div className="grid gap-1.5 text-xs">
                {[
                  !documents.some((d) => d.obligatoire) && "Aucun document obligatoire défini",
                  besoinTransport && !ligne && "Transport nécessaire mais aucune ligne affectée",
                  casierStatut !== "Affecté" && "Casier non encore affecté",
                  badgeStatut === "À préparer" && "Badge non encore préparé",
                  atelier === "À affecter" && "Atelier / ligne non défini",
                ]
                  .filter(Boolean)
                  .map((t) => (
                    <div key={String(t)} className="flex items-start gap-2 text-muted-foreground">
                      <AlertTriangle className="mt-0.5 size-3.5 text-[var(--warning)]" /> {t}
                    </div>
                  ))}
                <Tag ton="info">Ces points restent modifiables depuis la fiche ouvrier.</Tag>
              </div>
            </Panel>
          </div>
        </div>
      )}
    </Modale>
  );
}
