import { useMemo, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { CheckCircle2, FileText, IdCard, Loader2, Sparkles, Trash2, UploadCloud, UserPlus } from "lucide-react";
import { POSTES, SITES, type Candidat, type Site } from "@/data/leoni";
import {
  analyserDocuments,
  DISPONIBILITES,
  ETAPES_ANALYSE,
  niveauConfiance,
  NIVEAUX_ETUDE,
  SHIFTS,
  SOURCES_CANDIDATURE,
  TYPES_DOCUMENT,
  type ChampExtrait,
  type DocumentImporte,
  type ExperienceExtraite,
  type ResultatExtraction,
  type TypeDocument,
} from "@/data/candidature-intake";
import { Barre, Btn, Champ, IAWarning, Input, Modale, Panel, Table, Tag, Td, Textarea, Th, Toggle, Tr, Vide } from "@/components/leoni/kit";
import { useLeoni } from "@/lib/leoni-store";

type Mode = "choix" | "ia" | "manuel" | "import";

const ETAPES_IA = ["Documents", "Analyse IA", "Vérification", "Poste & candidature", "Validation"];
const ETAPES_MANUEL = ["Identité", "Coordonnées", "Profil", "Poste", "Documents", "Validation"];
const RECRUTEURS = ["Nadia El Ghali", "Yassine Alaoui", "Hind Bekkali", "Otmane Rifi"];
const OPERATRICE = "Nadia El Ghali";

function taille(octets: number) {
  return octets > 1_000_000 ? `${(octets / 1_048_576).toFixed(1)} Mo` : `${Math.max(1, Math.round(octets / 1024))} Ko`;
}
function maintenant() {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return { date: `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()}`, heure: `${p(d.getHours())}:${p(d.getMinutes())}` };
}

/* ------------------------------ Zone de dépôt ----------------------------- */

function Depot({
  titre,
  sousTitre,
  formats,
  bouton,
  icone,
  onFichiers,
}: {
  titre: string;
  sousTitre: string;
  formats: string;
  bouton: string;
  icone: React.ReactNode;
  onFichiers: (f: FileList) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [survol, setSurvol] = useState(false);
  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setSurvol(true);
      }}
      onDragLeave={() => setSurvol(false)}
      onDrop={(e) => {
        e.preventDefault();
        setSurvol(false);
        if (e.dataTransfer.files.length) onFichiers(e.dataTransfer.files);
      }}
      className={`flex flex-col items-center gap-2 rounded-md border border-dashed p-5 text-center transition-colors ${
        survol ? "border-[var(--brand)] bg-[var(--selected)]" : "border-border bg-card"
      }`}
    >
      <span className="text-[var(--brand)]">{icone}</span>
      <p className="text-sm font-medium">{titre}</p>
      <p className="text-xs text-muted-foreground">{sousTitre}</p>
      <p className="label-xs">Formats acceptés : {formats}</p>
      <Btn size="sm" variant="secondary" onClick={() => ref.current?.click()}>
        <UploadCloud className="size-3.5" /> {bouton}
      </Btn>
      <input
        ref={ref}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => e.target.files && onFichiers(e.target.files)}
      />
    </div>
  );
}

/* --------------------------- Indicateur confiance -------------------------- */

function Confiance({ valeur }: { valeur: number }) {
  if (!valeur) return <Tag ton="neutral">Non détecté</Tag>;
  const n = niveauConfiance(valeur);
  return (
    <span title={`Niveau de confiance de l'extraction : ${valeur} %`}>
      <Tag ton={n.ton}>
        <span className="num">{valeur} %</span> · {n.label}
      </Tag>
    </span>
  );
}

function ChampVerif({
  champ,
  onChange,
  options,
}: {
  champ: ChampExtrait;
  onChange: (v: string) => void;
  options?: string[];
}) {
  return (
    <div className="rounded-sm border border-border p-2.5">
      <div className="mb-1 flex items-center justify-between gap-2">
        <span className="label-xs">{champ.label}</span>
        <Confiance valeur={champ.confiance} />
      </div>
      {options ? (
        <Champ label="" value={champ.valeur || options[0]} onChange={onChange} options={options} />
      ) : (
        <Input value={champ.valeur} onChange={(e) => onChange(e.target.value)} placeholder="À compléter" />
      )}
      <p className="mt-1 text-[11px] text-muted-foreground">Source : {champ.valeur ? champ.source : "à saisir par le RH"}</p>
    </div>
  );
}

/* ================================ Composant =============================== */

export function NouvelleCandidature({ modeInitial = "choix", onClose }: { modeInitial?: Mode; onClose: () => void }) {
  const navigate = useNavigate();
  const { candidats, creerCandidature, lancerTalentFit } = useLeoni();
  const [mode, setMode] = useState<Mode>(modeInitial);
  const [etape, setEtape] = useState(0);

  /* --------- documents --------- */
  const [documents, setDocuments] = useState<DocumentImporte[]>([]);
  const [typeAjout, setTypeAjout] = useState<TypeDocument>("Diplôme");
  const ajouterFichiers = (files: FileList, type: TypeDocument) => {
    const { date } = maintenant();
    const nouveaux: DocumentImporte[] = Array.from(files).map((f, i) => ({
      id: `DOC-${Date.now()}-${i}`,
      nom: f.name,
      type,
      taille: taille(f.size),
      date,
      statut: "Importé",
    }));
    setDocuments((d) => [...d, ...nouveaux]);
  };

  /* --------- analyse IA --------- */
  const [analyse, setAnalyse] = useState<{ enCours: boolean; etape: number }>({ enCours: false, etape: 0 });
  const [resultat, setResultat] = useState<ResultatExtraction | null>(null);
  const [champs, setChamps] = useState<ChampExtrait[]>([]);
  const [experiences, setExperiences] = useState<ExperienceExtraite[]>([]);
  const [competences, setCompetences] = useState<string[]>([]);
  const [langues, setLangues] = useState<{ langue: string; niveau: string }[]>([]);
  const [modifies, setModifies] = useState<string[]>([]);
  const [journal, setJournal] = useState<{ date: string; heure: string; libelle: string }[]>([]);

  const tracer = (libelle: string) => {
    const { date, heure } = maintenant();
    setJournal((j) => [...j, { date, heure, libelle }]);
  };

  const lancerAnalyse = () => {
    setAnalyse({ enCours: true, etape: 0 });
    documents.forEach((d) => tracer(`${d.type} importé — ${d.nom}`));
    let i = 0;
    const timer = setInterval(() => {
      i += 1;
      setAnalyse({ enCours: true, etape: i });
      if (i >= ETAPES_ANALYSE.length) {
        clearInterval(timer);
        const r = analyserDocuments(documents);
        setResultat(r);
        setChamps(r.champs);
        setExperiences(r.experiences);
        setCompetences(r.competences);
        setLangues(r.langues);
        setDocuments((ds) => ds.map((d) => ({ ...d, statut: "Analysé" })));
        setAnalyse({ enCours: false, etape: ETAPES_ANALYSE.length });
        tracer("Extraction IA terminée");
      }
    }, 420);
  };

  const majChamp = (cle: string, v: string) => {
    setChamps((cs) => cs.map((c) => (c.cle === cle ? { ...c, valeur: v, source: c.valeur ? c.source : "Saisie RH" } : c)));
    setModifies((m) => (m.includes(cle) ? m : [...m, cle]));
  };
  const val = (cle: string) => champs.find((c) => c.cle === cle)?.valeur ?? "";
  const champ = (cle: string) => champs.find((c) => c.cle === cle);

  /* --------- saisie manuelle --------- */
  const [m, setM] = useState({
    nom: "",
    prenom: "",
    dateNaissance: "",
    cin: "",
    telephone: "",
    telephone2: "",
    email: "",
    adresse: "",
    ville: "",
    niveauEtude: NIVEAUX_ETUDE[3] as string,
    formation: "",
    experience: "",
    competences: "",
    langues: "",
    permis: "",
  });
  const setMan = (k: keyof typeof m, v: string) => setM((p) => ({ ...p, [k]: v }));

  /* --------- poste & candidature --------- */
  const [c, setC] = useState({
    poste: POSTES[0].nom,
    site: SITES[0] as string,
    source: SOURCES_CANDIDATURE[2] as string,
    disponibilite: DISPONIBILITES[0] as string,
    mobilite: true,
    shift: SHIFTS[3] as string,
    commentaire: "",
    recruteur: RECRUTEURS[0],
  });
  const setCand = (k: keyof typeof c, v: string | boolean) => setC((p) => ({ ...p, [k]: v }));
  const [scoringAuto, setScoringAuto] = useState(true);

  /* --------- identité consolidée (IA ou manuel) --------- */
  const identite = useMemo(() => {
    if (mode === "ia") {
      return {
        prenom: val("prenom"),
        nom: val("nom"),
        cin: val("cin"),
        dateNaissance: val("dateNaissance"),
        telephone: val("telephone"),
        email: val("email"),
        adresse: val("adresse"),
        ville: val("ville"),
        niveauEtude: val("niveauEtude"),
        permis: val("permis"),
        formation: [val("diplome"), val("specialite"), val("etablissement"), val("anneeDiplome")].filter(Boolean).join(" · "),
        experience: experiences.map((e) => `${e.poste} — ${e.entreprise} (${e.duree})`).join(" ; "),
        competences,
        langues: langues.map((l) => `${l.langue} (${l.niveau})`).join(", "),
      };
    }
    return {
      prenom: m.prenom,
      nom: m.nom,
      cin: m.cin,
      dateNaissance: m.dateNaissance,
      telephone: m.telephone,
      email: m.email,
      adresse: m.adresse,
      ville: m.ville,
      niveauEtude: m.niveauEtude,
      permis: m.permis,
      formation: m.formation,
      experience: m.experience,
      competences: m.competences.split(",").map((s) => s.trim()).filter(Boolean),
      langues: m.langues,
    };
  }, [mode, champs, experiences, competences, langues, m]);

  const nomComplet = `${identite.prenom} ${identite.nom}`.trim();

  /* --------- doublons --------- */
  const doublons = useMemo(() => {
    if (!nomComplet && !identite.telephone && !identite.email) return [];
    return candidats.filter(
      (x) =>
        (nomComplet && x.nom.toLowerCase() === nomComplet.toLowerCase()) ||
        (identite.telephone && x.telephone.replace(/\s/g, "") === identite.telephone.replace(/\s/g, "")) ||
        (identite.email && x.email.toLowerCase() === identite.email.toLowerCase()),
    );
  }, [candidats, nomComplet, identite.telephone, identite.email]);
  const [doublonIgnore, setDoublonIgnore] = useState(false);

  /* --------- création --------- */
  const [cree, setCree] = useState<Candidat | null>(null);

  const construire = (brouillon: boolean): Omit<Candidat, "id" | "date"> => {
    const { date, heure } = maintenant();
    const trace = mode === "ia" ? champs.filter((x) => x.valeur).map((x) => ({ champ: x.label, source: modifies.includes(x.cle) ? "Saisie RH (corrigé)" : x.source, confiance: x.confiance })) : [];
    return {
      nom: nomComplet || "Candidat sans nom",
      poste: c.poste,
      site: c.site as Site,
      ville: identite.ville || "—",
      source: c.source,
      score: 0,
      recommandation: "Scoring non lancé",
      entretien: "À planifier",
      statut: brouillon ? "Brouillon" : "Nouvelle candidature",
      recruteur: c.recruteur,
      telephone: identite.telephone || "—",
      email: identite.email || "—",
      formation: identite.formation || "—",
      experience: identite.experience || "—",
      competences: identite.competences,
      disponibilite: c.disponibilite,
      mobilite: c.mobilite ? "Oui" : "Non",
      langues: identite.langues || "—",
      documents: documents.map((d) => ({ nom: d.type, date: d.date, statut: d.statut === "Analysé" ? "Analysé par IA" : "Importé" })),
      detailScore: [],
      forces: [],
      vigilances: doublons.length ? ["Doublon potentiel détecté à la création"] : [],
      origine: mode === "ia" ? "IA" : mode === "import" ? "Import" : "Manuelle",
      brouillon,
      cin: identite.cin,
      dateNaissance: identite.dateNaissance,
      adresse: identite.adresse,
      niveauEtude: identite.niveauEtude,
      permis: identite.permis,
      shift: c.shift,
      commentaireRH: c.commentaire,
      experiences: mode === "ia" ? experiences.map(({ id: _id, ...e }) => e) : [],
      tracabilite: [
        ...trace,
        { champ: "Poste recherché", source: "Saisie RH" },
        { champ: "Site", source: "Saisie RH" },
        { champ: "Disponibilité", source: "Saisie RH" },
      ],
      audit: [
        ...journal,
        ...(mode === "ia" && modifies.length ? [{ date, heure, libelle: `${modifies.length} champ(s) corrigé(s) par ${OPERATRICE}` }] : []),
        { date, heure, libelle: brouillon ? "Brouillon enregistré" : "Candidature créée" },
      ],
    };
  };

  const valider = (brouillon: boolean) => {
    const nouveau = creerCandidature(construire(brouillon));
    setCree(nouveau);
    if (!brouillon && scoringAuto) setTimeout(() => lancerTalentFit(nouveau.id), 400);
  };

  const reinitialiser = () => {
    setCree(null);
    setMode("choix");
    setEtape(0);
    setDocuments([]);
    setResultat(null);
    setChamps([]);
    setExperiences([]);
    setCompetences([]);
    setLangues([]);
    setModifies([]);
    setJournal([]);
    setDoublonIgnore(false);
  };

  /* ------------------------------- rendu ---------------------------------- */

  const etapes = mode === "ia" ? ETAPES_IA : ETAPES_MANUEL;

  if (cree) {
    return (
      <Modale
        titre="Candidature créée avec succès"
        sousTitre={`Référence ${cree.id} · ${cree.statut}`}
        onClose={onClose}
        footer={
          <>
            <Btn variant="secondary" onClick={reinitialiser}>Créer une autre candidature</Btn>
            <Btn
              variant="primary"
              onClick={() => {
                onClose();
                navigate({ to: "/recrutement/candidat/$id", params: { id: cree.id } });
              }}
            >
              Ouvrir la fiche candidat
            </Btn>
          </>
        }
      >
        <div className="flex items-start gap-3 rounded-sm border border-[var(--brand)] bg-[var(--selected)] p-3">
          <CheckCircle2 className="mt-0.5 size-5 text-[var(--brand)]" />
          <div>
            <p className="text-sm font-medium">{cree.nom} — {cree.poste}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Référence {cree.id} · créée le {cree.date} par {OPERATRICE} · statut « {cree.statut} »
            </p>
          </div>
        </div>
        {!cree.brouillon && (
          <div className="mt-3 flex flex-wrap items-center gap-2 rounded-sm border border-border p-3">
            <Sparkles className="size-4 text-[var(--brand)]" />
            <span className="text-xs">
              {scoringAuto ? "Talent Fit AI a été lancé automatiquement sur cette candidature." : "L'analyse de compatibilité n'a pas encore été lancée."}
            </span>
            {!scoringAuto && (
              <Btn size="sm" variant="secondary" onClick={() => lancerTalentFit(cree.id)}>
                Lancer l'analyse de compatibilité IA
              </Btn>
            )}
          </div>
        )}
        <div className="mt-3">
          <p className="label-xs mb-1">Journal d'audit</p>
          <ul className="space-y-1 rounded-sm border border-border p-3 text-xs">
            {(cree.audit ?? []).map((a, i) => (
              <li key={i} className="flex gap-3">
                <span className="num w-24 shrink-0 text-muted-foreground">{a.date} {a.heure}</span>
                <span>{a.libelle}</span>
              </li>
            ))}
          </ul>
        </div>
      </Modale>
    );
  }

  if (mode === "choix") {
    return (
      <Modale
        titre="Créer une candidature"
        sousTitre="Ajoutez manuellement un candidat ou utilisez l'IA pour extraire automatiquement les informations depuis ses documents."
        onClose={onClose}
        large
      >
        <div className="grid gap-3 md:grid-cols-2">
          <button
            onClick={() => { setMode("ia"); setEtape(0); }}
            className="flex flex-col items-start gap-2 rounded-md border border-[var(--brand)] bg-[var(--selected)] p-4 text-left transition-colors hover:brightness-105"
          >
            <div className="flex w-full items-center justify-between">
              <Sparkles className="size-6 text-[var(--brand)]" />
              <Tag ton="info">RECOMMANDÉ</Tag>
            </div>
            <p className="text-sm font-semibold">Saisie assistée par IA</p>
            <p className="text-xs text-muted-foreground">
              Importez le CV et la pièce d'identité du candidat. L'IA extrait automatiquement les informations et prépare la fiche candidat.
            </p>
            <span className="mt-2 inline-flex h-8 items-center rounded-sm bg-[var(--brand)] px-3 text-xs font-medium text-[var(--brand-foreground)]">
              Commencer avec l'IA
            </span>
          </button>

          <button
            onClick={() => { setMode("manuel"); setEtape(0); }}
            className="flex flex-col items-start gap-2 rounded-md border border-border bg-card p-4 text-left transition-colors hover:bg-[var(--hover)]"
          >
            <UserPlus className="size-6 text-[var(--brand)]" />
            <p className="text-sm font-semibold">Saisie manuelle</p>
            <p className="text-xs text-muted-foreground">Saisissez directement les informations du candidat dans le formulaire.</p>
            <span className="mt-2 inline-flex h-8 items-center rounded-sm border border-border px-3 text-xs font-medium">
              Saisir manuellement
            </span>
          </button>
        </div>
        <button
          onClick={() => setMode("import")}
          className="mt-3 w-full rounded-sm border border-dashed border-border px-3 py-2 text-left text-xs text-muted-foreground hover:bg-[var(--hover)]"
        >
          Importer plusieurs candidatures (traitement par lot de CV)
        </button>
        <IAWarning texte="LEONI CANDIDATE INTAKE AI prépare uniquement la saisie : lecture des documents, structuration des données et détection des incohérences. La validation de la candidature reste humaine." />
      </Modale>
    );
  }

  if (mode === "import") {
    return <ImportMultiple onClose={onClose} onRetour={() => setMode("choix")} />;
  }

  /* -------- footer commun -------- */
  const footer = (
    <>
      <Btn variant="ghost" onClick={() => (etape === 0 ? setMode("choix") : setEtape((e) => e - 1))}>
        {etape === 0 ? "Retour" : "Précédent"}
      </Btn>
      <Btn variant="secondary" onClick={() => valider(true)}>Enregistrer comme brouillon</Btn>
      {etape < etapes.length - 1 ? (
        <Btn
          variant="primary"
          disabled={mode === "ia" && etape === 1 && !resultat}
          onClick={() => setEtape((e) => e + 1)}
        >
          Suivant
        </Btn>
      ) : (
        <Btn variant="primary" disabled={doublons.length > 0 && !doublonIgnore} onClick={() => valider(false)}>
          Créer la candidature
        </Btn>
      )}
    </>
  );

  return (
    <Modale
      titre={mode === "ia" ? "Créer une candidature — saisie assistée par IA" : "Créer une candidature — saisie manuelle"}
      sousTitre={
        mode === "ia"
          ? "LEONI CANDIDATE INTAKE AI lit les documents, pré-remplit la fiche et signale les informations à vérifier."
          : "Renseignez le dossier candidat. La structure de données est identique à celle produite par l'IA."
      }
      onClose={onClose}
      large
      footer={footer}
    >
      <div className="mb-4 flex flex-wrap gap-2">
        {etapes.map((e, i) => (
          <button
            key={e}
            onClick={() => setEtape(i)}
            className={`flex items-center gap-2 rounded-sm border px-3 py-1.5 text-xs font-medium ${
              i === etape ? "border-[var(--brand)] bg-[var(--selected)] text-[var(--brand)]" : "border-border text-muted-foreground"
            }`}
          >
            <span className="num">{i + 1}</span> {e}
          </button>
        ))}
      </div>

      {mode === "ia" && (
        <>
          {etape === 0 && (
            <div className="space-y-3">
              <p className="text-sm font-medium">Importer les documents du candidat</p>
              <div className="grid gap-3 md:grid-cols-2">
                <Depot
                  titre="Document principal — CV"
                  sousTitre="Fortement recommandé pour une extraction complète"
                  formats="PDF, DOC, DOCX, JPG, PNG"
                  bouton="Importer le CV"
                  icone={<FileText className="size-6" />}
                  onFichiers={(f) => ajouterFichiers(f, "CV")}
                />
                <Depot
                  titre="Pièce d'identité — Carte nationale / CIN"
                  sousTitre="Peut être ajoutée plus tard selon le processus RH"
                  formats="PDF, JPG, PNG"
                  bouton="Importer la CIN"
                  icone={<IdCard className="size-6" />}
                  onFichiers={(f) => ajouterFichiers(f, "CIN")}
                />
              </div>

              <div className="flex flex-wrap items-end gap-2 rounded-sm border border-border p-3">
                <div className="w-56">
                  <Champ label="+ Ajouter un autre document" value={typeAjout} onChange={(v) => setTypeAjout(v as TypeDocument)} options={TYPES_DOCUMENT.filter((t) => t !== "CV" && t !== "CIN") as unknown as string[]} />
                </div>
                <label className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-sm border border-border px-3 text-sm hover:bg-[var(--hover)]">
                  <UploadCloud className="size-3.5" /> Importer
                  <input type="file" multiple className="hidden" onChange={(e) => e.target.files && ajouterFichiers(e.target.files, typeAjout)} />
                </label>
              </div>

              <Panel title={`Documents importés (${documents.length})`} bodyClassName="p-0">
                <Table>
                  <thead>
                    <tr><Th>Nom du fichier</Th><Th>Type</Th><Th>Taille</Th><Th>Date d'import</Th><Th>Statut</Th><Th /></tr>
                  </thead>
                  <tbody>
                    {documents.map((d) => (
                      <Tr key={d.id}>
                        <Td className="max-w-[220px] truncate">{d.nom}</Td>
                        <Td><Tag ton="info">{d.type}</Tag></Td>
                        <Td className="num text-xs">{d.taille}</Td>
                        <Td className="num text-xs">{d.date}</Td>
                        <Td><Tag ton={d.statut === "Illisible" ? "critical" : "success"}>{d.statut}</Tag></Td>
                        <Td>
                          <Btn size="sm" variant="ghost" onClick={() => setDocuments((ds) => ds.filter((x) => x.id !== d.id))}>
                            <Trash2 className="size-3.5" />
                          </Btn>
                        </Td>
                      </Tr>
                    ))}
                  </tbody>
                </Table>
                {!documents.length && <Vide texte="Aucun document importé pour le moment." />}
              </Panel>

              {(!documents.some((d) => d.type === "CV") || !documents.some((d) => d.type === "CIN")) && (
                <p className="rounded-sm border border-dashed border-border px-3 py-2 text-xs text-muted-foreground">
                  Information manquante — pourra être complétée ultérieurement.
                </p>
              )}

              <div className="flex justify-end">
                <Btn variant="primary" disabled={!documents.length} onClick={() => { setEtape(1); lancerAnalyse(); }}>
                  <Sparkles className="size-3.5" /> Analyser avec l'IA
                </Btn>
              </div>
            </div>
          )}

          {etape === 1 && (
            <div className="space-y-3">
              <Panel title="LEONI CANDIDATE INTAKE AI" subtitle="Analyse des documents…">
                <Barre valeur={Math.round((analyse.etape / ETAPES_ANALYSE.length) * 100)} />
                <ul className="mt-3 space-y-1 text-xs">
                  {ETAPES_ANALYSE.map((e, i) => (
                    <li key={e} className="flex items-center gap-2">
                      {i < analyse.etape ? (
                        <CheckCircle2 className="size-3.5 text-[var(--success)]" />
                      ) : analyse.enCours && i === analyse.etape ? (
                        <Loader2 className="size-3.5 animate-spin text-[var(--brand)]" />
                      ) : (
                        <span className="size-3.5 rounded-full border border-border" />
                      )}
                      <span className={i < analyse.etape ? "" : "text-muted-foreground"}>{e}</span>
                    </li>
                  ))}
                </ul>
              </Panel>

              {resultat && (
                <Panel title="Analyse terminée" subtitle="Synthèse de l'extraction documentaire">
                  <div className="grid gap-3 md:grid-cols-5">
                    <Recap label="Documents analysés" valeur={String(documents.length)} />
                    <Recap label="Informations détectées" valeur={String(resultat.champs.filter((x) => x.valeur).length)} />
                    <Recap label="Informations à vérifier" valeur={String(resultat.champs.filter((x) => x.valeur && x.confiance < 90).length)} />
                    <Recap label="Informations manquantes" valeur={String(resultat.champs.filter((x) => !x.valeur).length)} />
                    <Recap label="Doublon potentiel" valeur={doublons.length ? `${doublons.length} trouvé(s)` : "Aucun"} />
                  </div>
                  {resultat.anomalies.map((a) => (
                    <p key={a} className="mt-2 rounded-sm border border-[var(--warning)] px-3 py-2 text-xs">{a}</p>
                  ))}
                  <div className="mt-3 flex justify-end">
                    <Btn variant="primary" onClick={() => setEtape(2)}>Vérifier les informations</Btn>
                  </div>
                  <IAWarning texte="Les informations ne sont pas encore enregistrées : elles doivent être vérifiées et validées par le RH." />
                </Panel>
              )}
            </div>
          )}

          {etape === 2 && resultat && (
            <div className="space-y-3">
              {doublons.length > 0 && (
                <Panel title="Candidat potentiellement déjà existant" subtitle="Correspondance sur le nom, le téléphone ou l'email">
                  {doublons.map((d) => (
                    <div key={d.id} className="flex flex-wrap items-center gap-3 rounded-sm border border-[var(--warning)] p-3 text-xs">
                      <span className="font-medium">{d.nom}</span>
                      <span className="num text-[var(--brand)]">{d.id}</span>
                      <span className="text-muted-foreground">Dernière candidature : {d.date}</span>
                      <span>Statut : {d.statut}</span>
                      <div className="ml-auto flex gap-2">
                        <Btn size="sm" variant="secondary" onClick={() => { onClose(); navigate({ to: "/recrutement/candidat/$id", params: { id: d.id } }); }}>
                          Voir la fiche existante
                        </Btn>
                        <Btn size="sm" variant="secondary" onClick={() => setDoublonIgnore(true)}>Créer quand même</Btn>
                        <Btn size="sm" variant="secondary" onClick={() => { setDoublonIgnore(true); majChamp("telephone", d.telephone); majChamp("email", d.email); }}>
                          Fusionner les informations
                        </Btn>
                      </div>
                    </div>
                  ))}
                </Panel>
              )}

              <Panel title="Identité" subtitle="Données issues du CV et de la pièce d'identité">
                <div className="grid gap-2 md:grid-cols-3">
                  {["prenom", "nom", "cin", "dateNaissance", "ville"].map((k) => {
                    const ch = champ(k);
                    return ch ? <ChampVerif key={k} champ={ch} onChange={(v) => majChamp(k, v)} /> : null;
                  })}
                </div>
              </Panel>

              <Panel title="Coordonnées">
                <div className="grid gap-2 md:grid-cols-3">
                  {["telephone", "telephone2", "email", "adresse"].map((k) => {
                    const ch = champ(k);
                    return ch ? <ChampVerif key={k} champ={ch} onChange={(v) => majChamp(k, v)} /> : null;
                  })}
                </div>
              </Panel>

              <Panel title="Formation">
                <div className="grid gap-2 md:grid-cols-3">
                  {["niveauEtude", "diplome", "specialite", "etablissement", "anneeDiplome", "permis"].map((k) => {
                    const ch = champ(k);
                    return ch ? <ChampVerif key={k} champ={ch} onChange={(v) => majChamp(k, v)} /> : null;
                  })}
                </div>
              </Panel>

              <Panel
                title={`Expériences professionnelles (${experiences.length})`}
                action={
                  <Btn
                    size="sm"
                    onClick={() =>
                      setExperiences((e) => [...e, { id: `EXP-${Date.now()}`, poste: "", entreprise: "", ville: "", periode: "", duree: "", competences: [] }])
                    }
                  >
                    + Ajouter expérience
                  </Btn>
                }
              >
                <div className="space-y-2">
                  {experiences.map((e, i) => (
                    <div key={e.id} className="rounded-sm border border-border p-3">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="label-xs">Expérience {i + 1}</span>
                        <Btn size="sm" variant="ghost" onClick={() => setExperiences((x) => x.filter((y) => y.id !== e.id))}>
                          <Trash2 className="size-3.5" /> Supprimer
                        </Btn>
                      </div>
                      <div className="grid gap-2 md:grid-cols-3">
                        <Input label="Poste occupé" value={e.poste} onChange={(ev) => setExperiences((x) => x.map((y) => (y.id === e.id ? { ...y, poste: ev.target.value } : y)))} />
                        <Input label="Entreprise" value={e.entreprise} onChange={(ev) => setExperiences((x) => x.map((y) => (y.id === e.id ? { ...y, entreprise: ev.target.value } : y)))} />
                        <Input label="Ville" value={e.ville} onChange={(ev) => setExperiences((x) => x.map((y) => (y.id === e.id ? { ...y, ville: ev.target.value } : y)))} />
                        <Input label="Période" value={e.periode} onChange={(ev) => setExperiences((x) => x.map((y) => (y.id === e.id ? { ...y, periode: ev.target.value } : y)))} />
                        <Input label="Durée" value={e.duree} onChange={(ev) => setExperiences((x) => x.map((y) => (y.id === e.id ? { ...y, duree: ev.target.value } : y)))} />
                      </div>
                      {e.competences.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {e.competences.map((k) => <Tag key={k}>{k}</Tag>)}
                        </div>
                      )}
                    </div>
                  ))}
                  {!experiences.length && <Vide texte="Aucune expérience détectée." />}
                </div>
              </Panel>

              <div className="grid gap-3 md:grid-cols-2">
                <Panel title="Compétences détectées">
                  <ListeTags valeurs={competences} onChange={setCompetences} placeholder="Ajouter une compétence" />
                </Panel>
                <Panel title="Langues">
                  <div className="space-y-2">
                    {langues.map((l, i) => (
                      <div key={l.langue} className="grid grid-cols-2 gap-2">
                        <Input value={l.langue} onChange={(e) => setLangues((x) => x.map((y, j) => (j === i ? { ...y, langue: e.target.value } : y)))} />
                        <Champ label="" value={l.niveau} onChange={(v) => setLangues((x) => x.map((y, j) => (j === i ? { ...y, niveau: v } : y)))} options={["Débutant", "Moyen", "Bon", "Courant", "Bilingue"]} />
                      </div>
                    ))}
                    <Btn size="sm" onClick={() => setLangues((x) => [...x, { langue: "Nouvelle langue", niveau: "Débutant" }])}>+ Ajouter une langue</Btn>
                  </div>
                </Panel>
              </div>

              <Panel title="Informations à compléter" subtitle="Non détectées dans les documents — à renseigner par le RH">
                <div className="grid gap-2 md:grid-cols-3">
                  <Champ label="Disponibilité" value={c.disponibilite} onChange={(v) => setCand("disponibilite", v)} options={[...DISPONIBILITES]} />
                  <Toggle label="Mobilité géographique" actif={c.mobilite} onChange={(v) => setCand("mobilite", v)} />
                  <Champ label="Travail en équipes alternées" value={c.shift} onChange={(v) => setCand("shift", v)} options={[...SHIFTS]} />
                </div>
              </Panel>
            </div>
          )}

          {etape === 3 && <PosteEtCandidature c={c} setCand={setCand} suggestions={resultat?.suggestions ?? []} />}
          {etape === 4 && (
            <Resume
              identite={identite}
              c={c}
              documents={documents}
              detectes={champs.filter((x) => x.valeur).length}
              modifies={modifies.length}
              scoringAuto={scoringAuto}
              setScoringAuto={setScoringAuto}
              doublons={doublons.length}
              origine="IA"
            />
          )}
        </>
      )}

      {mode === "manuel" && (
        <>
          {etape === 0 && (
            <Panel title="Identité">
              <div className="grid gap-3 md:grid-cols-2">
                <Input label="Nom *" value={m.nom} onChange={(e) => setMan("nom", e.target.value)} />
                <Input label="Prénom *" value={m.prenom} onChange={(e) => setMan("prenom", e.target.value)} />
                <Input label="Date de naissance" placeholder="JJ/MM/AAAA" value={m.dateNaissance} onChange={(e) => setMan("dateNaissance", e.target.value)} />
                <Input label="CIN" value={m.cin} onChange={(e) => setMan("cin", e.target.value)} />
              </div>
            </Panel>
          )}
          {etape === 1 && (
            <Panel title="Coordonnées">
              <div className="grid gap-3 md:grid-cols-2">
                <Input label="Téléphone principal *" value={m.telephone} onChange={(e) => setMan("telephone", e.target.value)} />
                <Input label="Téléphone secondaire" value={m.telephone2} onChange={(e) => setMan("telephone2", e.target.value)} />
                <Input label="Email" value={m.email} onChange={(e) => setMan("email", e.target.value)} />
                <Input label="Ville" value={m.ville} onChange={(e) => setMan("ville", e.target.value)} />
                <div className="md:col-span-2">
                  <Input label="Adresse" value={m.adresse} onChange={(e) => setMan("adresse", e.target.value)} />
                </div>
              </div>
            </Panel>
          )}
          {etape === 2 && (
            <Panel title="Profil">
              <div className="grid gap-3 md:grid-cols-2">
                <Champ label="Niveau d'étude" value={m.niveauEtude} onChange={(v) => setMan("niveauEtude", v)} options={[...NIVEAUX_ETUDE]} />
                <Input label="Formation / diplôme" value={m.formation} onChange={(e) => setMan("formation", e.target.value)} />
                <Input label="Permis de conduire" value={m.permis} onChange={(e) => setMan("permis", e.target.value)} />
                <Input label="Langues" placeholder="Arabe (courant), Français (bon)" value={m.langues} onChange={(e) => setMan("langues", e.target.value)} />
                <div className="md:col-span-2">
                  <Textarea label="Expérience professionnelle" rows={3} value={m.experience} onChange={(e) => setMan("experience", e.target.value)} />
                </div>
                <div className="md:col-span-2">
                  <Input label="Compétences (séparées par des virgules)" value={m.competences} onChange={(e) => setMan("competences", e.target.value)} />
                </div>
              </div>
            </Panel>
          )}
          {etape === 3 && <PosteEtCandidature c={c} setCand={setCand} suggestions={[]} />}
          {etape === 4 && (
            <div className="space-y-3">
              <div className="grid gap-3 md:grid-cols-2">
                <Depot titre="CV" sousTitre="Optionnel à ce stade" formats="PDF, DOC, DOCX, JPG, PNG" bouton="Importer le CV" icone={<FileText className="size-6" />} onFichiers={(f) => ajouterFichiers(f, "CV")} />
                <Depot titre="CIN" sousTitre="Peut être fournie plus tard" formats="PDF, JPG, PNG" bouton="Importer la CIN" icone={<IdCard className="size-6" />} onFichiers={(f) => ajouterFichiers(f, "CIN")} />
              </div>
              <Panel title={`Documents (${documents.length})`} bodyClassName="p-0">
                <Table>
                  <thead><tr><Th>Fichier</Th><Th>Type</Th><Th>Taille</Th><Th>Statut</Th><Th /></tr></thead>
                  <tbody>
                    {documents.map((d) => (
                      <Tr key={d.id}>
                        <Td className="max-w-[220px] truncate">{d.nom}</Td>
                        <Td><Tag ton="info">{d.type}</Tag></Td>
                        <Td className="num text-xs">{d.taille}</Td>
                        <Td><Tag ton="success">{d.statut}</Tag></Td>
                        <Td><Btn size="sm" variant="ghost" onClick={() => setDocuments((ds) => ds.filter((x) => x.id !== d.id))}><Trash2 className="size-3.5" /></Btn></Td>
                      </Tr>
                    ))}
                  </tbody>
                </Table>
                {!documents.length && <Vide texte="Information manquante — pourra être complétée ultérieurement." />}
              </Panel>
            </div>
          )}
          {etape === 5 && (
            <Resume
              identite={identite}
              c={c}
              documents={documents}
              detectes={0}
              modifies={0}
              scoringAuto={scoringAuto}
              setScoringAuto={setScoringAuto}
              doublons={doublons.length}
              origine="Manuelle"
            />
          )}
        </>
      )}
    </Modale>
  );
}

/* ------------------------------- sous-vues -------------------------------- */

function Recap({ label, valeur }: { label: string; valeur: string }) {
  return (
    <div className="rounded-sm border border-border p-3">
      <p className="label-xs">{label}</p>
      <p className="num mt-1 text-sm font-semibold">{valeur}</p>
    </div>
  );
}

function ListeTags({ valeurs, onChange, placeholder }: { valeurs: string[]; onChange: (v: string[]) => void; placeholder: string }) {
  const [saisie, setSaisie] = useState("");
  return (
    <>
      <div className="flex flex-wrap gap-1.5">
        {valeurs.map((v) => (
          <button key={v} onClick={() => onChange(valeurs.filter((x) => x !== v))} title="Supprimer">
            <Tag ton="info">{v} ✕</Tag>
          </button>
        ))}
        {!valeurs.length && <span className="text-xs text-muted-foreground">Aucune compétence.</span>}
      </div>
      <div className="mt-2 flex gap-2">
        <Input value={saisie} placeholder={placeholder} onChange={(e) => setSaisie(e.target.value)} />
        <Btn
          size="sm"
          onClick={() => {
            if (saisie.trim()) onChange([...valeurs, saisie.trim()]);
            setSaisie("");
          }}
        >
          Ajouter
        </Btn>
      </div>
    </>
  );
}

function PosteEtCandidature({
  c,
  setCand,
  suggestions,
}: {
  c: { poste: string; site: string; source: string; disponibilite: string; mobilite: boolean; shift: string; commentaire: string; recruteur: string };
  setCand: (k: never, v: string | boolean) => void;
  suggestions: { poste: string; compatibilite: number }[];
}) {
  const set = setCand as (k: string, v: string | boolean) => void;
  return (
    <div className="space-y-3">
      {suggestions.length > 0 && (
        <Panel title="Postes suggérés par l'IA" subtitle="Suggestion indicative — le RH sélectionne le poste final">
          <div className="grid gap-2 md:grid-cols-3">
            {suggestions.map((s) => (
              <button
                key={s.poste}
                onClick={() => set("poste", s.poste)}
                className={`rounded-sm border p-3 text-left ${c.poste === s.poste ? "border-[var(--brand)] bg-[var(--selected)]" : "border-border hover:bg-[var(--hover)]"}`}
              >
                <p className="text-sm font-medium">{s.poste}</p>
                <p className="label-xs mt-1">Compatibilité estimée</p>
                <div className="mt-1 flex items-center gap-2">
                  <Barre valeur={s.compatibilite} ton={s.compatibilite >= 85 ? "success" : "brand"} />
                  <span className="num text-xs font-semibold">{s.compatibilite} %</span>
                </div>
              </button>
            ))}
          </div>
        </Panel>
      )}
      <Panel title="Poste & candidature">
        <div className="grid gap-3 md:grid-cols-3">
          <Champ label="Poste recherché *" value={c.poste} onChange={(v) => set("poste", v)} options={[...new Set([c.poste, ...POSTES.map((p) => p.nom), ...suggestions.map((s) => s.poste)])]} />
          <Champ label="Site *" value={c.site} onChange={(v) => set("site", v)} options={[...SITES]} />
          <Champ label="Source *" value={c.source} onChange={(v) => set("source", v)} options={[...SOURCES_CANDIDATURE]} />
          <Champ label="Disponibilité" value={c.disponibilite} onChange={(v) => set("disponibilite", v)} options={[...DISPONIBILITES]} />
          <Toggle label="Mobilité géographique" actif={c.mobilite} onChange={(v) => set("mobilite", v)} />
          <Champ label="Travail en équipe / shift" value={c.shift} onChange={(v) => set("shift", v)} options={[...SHIFTS]} />
          <Champ label="Recruteur responsable" value={c.recruteur} onChange={(v) => set("recruteur", v)} options={RECRUTEURS} />
          <div className="md:col-span-3">
            <Textarea label="Commentaire RH" rows={3} value={c.commentaire} onChange={(e) => set("commentaire", e.target.value)} />
          </div>
        </div>
      </Panel>
    </div>
  );
}

function Resume({
  identite,
  c,
  documents,
  detectes,
  modifies,
  scoringAuto,
  setScoringAuto,
  doublons,
  origine,
}: {
  identite: { prenom: string; nom: string; ville: string; telephone: string; email: string };
  c: { poste: string; site: string; source: string; disponibilite: string; mobilite: boolean; shift: string };
  documents: DocumentImporte[];
  detectes: number;
  modifies: number;
  scoringAuto: boolean;
  setScoringAuto: (v: boolean) => void;
  doublons: number;
  origine: string;
}) {
  const aType = (t: TypeDocument) => documents.some((d) => d.type === t);
  return (
    <div className="space-y-3">
      <Panel title="Résumé de la candidature">
        <div className="grid gap-3 md:grid-cols-3">
          <Recap label="Candidat" valeur={`${identite.prenom} ${identite.nom}`.trim() || "—"} />
          <Recap label="Ville" valeur={identite.ville || "—"} />
          <Recap label="Contact" valeur={`${identite.telephone || "—"} · ${identite.email || "—"}`} />
          <Recap label="Poste" valeur={c.poste} />
          <Recap label="Site" valeur={c.site} />
          <Recap label="Source" valeur={c.source} />
          <Recap label="Disponibilité" valeur={c.disponibilite} />
          <Recap label="Mobilité" valeur={c.mobilite ? "Oui" : "Non"} />
          <Recap label="Shift" valeur={c.shift} />
        </div>
      </Panel>

      <div className="grid gap-3 md:grid-cols-2">
        <Panel title="Documents">
          <ul className="space-y-1 text-xs">
            {(["CV", "CIN", "Diplôme"] as TypeDocument[]).map((t) => (
              <li key={t} className="flex items-center justify-between">
                <span>{t}</span>
                {aType(t) ? <Tag ton="success">✓ Fourni</Tag> : <Tag ton="neutral">Non fourni</Tag>}
              </li>
            ))}
          </ul>
        </Panel>
        <Panel title="Données IA" subtitle={`Mode de création : ${origine}`}>
          {origine === "IA" ? (
            <>
              <ul className="space-y-1 text-xs">
                <li><span className="num font-semibold">{detectes}</span> champs détectés</li>
                <li><span className="num font-semibold">{Math.max(0, detectes - modifies)}</span> confirmés</li>
                <li><span className="num font-semibold">{modifies}</span> modifiés par le RH</li>
                <li>Doublon potentiel : {doublons ? `${doublons} candidat(s)` : "aucun"}</li>
              </ul>
              <IAWarning texte={`Les informations extraites par IA ont été vérifiées par ${OPERATRICE}.`} />
            </>
          ) : (
            <p className="text-xs text-muted-foreground">Candidature saisie manuellement — structure de données identique au parcours IA.</p>
          )}
        </Panel>
      </div>

      <Panel title="Après création">
        <Toggle label="Lancer automatiquement l'analyse de compatibilité Talent Fit AI" actif={scoringAuto} onChange={setScoringAuto} />
        <p className="mt-2 text-[11px] text-muted-foreground">
          Extraction documentaire et scoring de candidature sont deux fonctions IA distinctes : l'extraction prépare la fiche, le scoring évalue la compatibilité au poste.
        </p>
      </Panel>
    </div>
  );
}

/* --------------------------- Import multiple ------------------------------ */

function ImportMultiple({ onClose, onRetour }: { onClose: () => void; onRetour: () => void }) {
  const { creerCandidature } = useLeoni();
  const [fichiers, setFichiers] = useState<DocumentImporte[]>([]);
  const [traite, setTraite] = useState(false);

  const creerBrouillons = () => {
    const { date, heure } = maintenant();
    fichiers.forEach((f) => {
      const base = f.nom.replace(/\.[^.]+$/, "").replace(/^cv[-_ ]*/i, "").replace(/[-_]/g, " ");
      creerCandidature({
        nom: base || "Candidat importé",
        poste: POSTES[0].nom,
        site: SITES[0] as Site,
        ville: "—",
        source: "Import RH",
        score: 0,
        recommandation: "Scoring non lancé",
        entretien: "À planifier",
        statut: "Brouillon",
        recruteur: OPERATRICE,
        telephone: "—",
        email: "—",
        formation: "—",
        experience: "—",
        competences: [],
        disponibilite: "À confirmer",
        mobilite: "À confirmer",
        langues: "—",
        documents: [{ nom: "CV", date: f.date, statut: "Importé" }],
        detailScore: [],
        forces: [],
        vigilances: ["Brouillon issu d'un import de masse — à vérifier"],
        origine: "Import",
        brouillon: true,
        audit: [{ date, heure, libelle: `Brouillon créé par import multiple — ${f.nom}` }],
      });
    });
    setTraite(true);
  };

  return (
    <Modale
      titre="Importer plusieurs candidatures"
      sousTitre="Déposez plusieurs CV : le système crée un brouillon par candidat et signale les doublons potentiels."
      onClose={onClose}
      large
      footer={
        <>
          <Btn variant="ghost" onClick={onRetour}>Retour</Btn>
          <Btn variant="primary" disabled={!fichiers.length || traite} onClick={creerBrouillons}>
            Créer {fichiers.length || ""} brouillon(s)
          </Btn>
        </>
      }
    >
      <Depot
        titre="Lot de CV"
        sousTitre="Sélection multiple possible"
        formats="PDF, DOC, DOCX, JPG, PNG"
        bouton="Importer des CV"
        icone={<FileText className="size-6" />}
        onFichiers={(fs) => {
          const { date } = maintenant();
          setFichiers((p) => [
            ...p,
            ...Array.from(fs).map((f, i) => ({
              id: `IMP-${Date.now()}-${i}`,
              nom: f.name,
              type: "CV" as TypeDocument,
              taille: taille(f.size),
              date,
              statut: "Importé" as const,
            })),
          ]);
        }}
      />
      <Panel title={`CV importés (${fichiers.length})`} bodyClassName="p-0" className="mt-3">
        <Table>
          <thead><tr><Th>Fichier</Th><Th>Taille</Th><Th>Statut</Th></tr></thead>
          <tbody>
            {fichiers.map((f) => (
              <Tr key={f.id}>
                <Td className="max-w-[280px] truncate">{f.nom}</Td>
                <Td className="num text-xs">{f.taille}</Td>
                <Td><Tag ton={traite ? "success" : "info"}>{traite ? "Brouillon créé" : "En attente d'analyse"}</Tag></Td>
              </Tr>
            ))}
          </tbody>
        </Table>
        {!fichiers.length && <Vide texte="Aucun CV importé." />}
      </Panel>
      {traite && <IAWarning texte="Les brouillons sont disponibles dans la liste des candidatures avec le statut « Brouillon » — à vérifier et compléter par le RH." />}
    </Modale>
  );
}
