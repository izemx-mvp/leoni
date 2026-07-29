import { useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { OUVRIERS } from "@/data/leoni";
import { CATEGORIES_QUESTION, TYPES_EVALUATION, type Question } from "@/data/evaluations";
import { Btn, Champ, Input, PageHeader, Panel, Table, Tag, Td, Textarea, Th, Toggle, Tr, Vide } from "@/components/leoni/kit";
import { useEvaluations } from "@/lib/evaluations-store";
import { useLeoni } from "@/lib/leoni-store";

const ETAPES = ["Informations générales", "Questions", "Paramètres", "Affectation", "Récapitulatif"];

export const Route = createFileRoute("/formation/qcm/nouvelle")({
  head: () => ({
    meta: [
      { title: "Nouvelle évaluation — LEONI Workforce Journey" },
      { name: "description", content: "Assistant de création d'une évaluation LEONI : informations, questions, paramètres, affectation et publication." },
      { property: "og:title", content: "Nouvelle évaluation — LEONI Workforce Journey" },
      { property: "og:description", content: "Créer une évaluation en 5 étapes et la diffuser aux opérateurs." },
    ],
  }),
  component: NouvelleEvaluation,
});

function NouvelleEvaluation() {
  const navigate = useNavigate();
  const { bibliotheque, creer, publier } = useEvaluations();
  const { pousserNotification } = useLeoni();
  const [etape, setEtape] = useState(0);

  const [f, setF] = useState({
    code: "EVA-2026-014",
    titre: "",
    description: "",
    type: TYPES_EVALUATION[0] as string,
    formation: "Câblage niveau 1",
    module: "Module 3 — Sertissage",
    competence: "Sertissage",
    site: "Bouskoura",
    langue: "Français",
    niveau: "Débutant" as "Débutant" | "Intermédiaire" | "Avancé",
    datePassage: "05/08/2026",
    ouverture: "08:00",
    fermeture: "17:00",
    duree: "30",
    seuil: "70",
    tentatives: "2",
  });
  const set = (k: keyof typeof f, v: string) => setF((p) => ({ ...p, [k]: v }));

  const [params, setParams] = useState({
    ordreQuestionsAleatoire: true,
    ordreReponsesAleatoire: true,
    resultatImmediat: true,
    afficherBonnesReponses: false,
    retourArriere: true,
    pleinEcran: false,
    validationAuto: true,
    rappelJ1: true,
    rappelH1: true,
  });
  const setP = (k: keyof typeof params, v: boolean) => setParams((p) => ({ ...p, [k]: v }));

  const [questions, setQuestions] = useState<Question[]>([]);
  const [categorie, setCategorie] = useState("Toutes");
  const dispo = bibliotheque.filter(
    (q) => !q.archivee && (categorie === "Toutes" || q.categorie === categorie) && !questions.some((x) => x.questionId === q.questionId),
  );

  const [site, setSite] = useState("Tous");
  const [selection, setSelection] = useState<string[]>([]);
  const ouvriersFiltres = useMemo(
    () => OUVRIERS.filter((o) => site === "Tous" || o.site === site),
    [site],
  );

  const total = questions.reduce((s, q) => s + q.points, 0);
  const valide =
    (etape !== 0 || (f.titre.trim() !== "" && f.code.trim() !== "")) && (etape !== 1 || questions.length > 0);

  const enregistrer = (publierApres: boolean) => {
    const ev = creer({
      code: f.code,
      titre: f.titre || "Évaluation sans titre",
      description: f.description,
      type: f.type as never,
      formation: f.formation,
      module: f.module,
      competence: f.competence,
      site: f.site,
      langue: f.langue,
      niveau: f.niveau,
      statut: publierApres ? "Programmé" : "Brouillon",
      dateCreation: "29/07/2026",
      datePassage: f.datePassage,
      ouverture: f.ouverture,
      fermeture: f.fermeture,
      duree: Number(f.duree),
      seuil: Number(f.seuil),
      tentatives: Number(f.tentatives),
      ordreQuestionsAleatoire: params.ordreQuestionsAleatoire,
      ordreReponsesAleatoire: params.ordreReponsesAleatoire,
      resultatImmediat: params.resultatImmediat,
      afficherBonnesReponses: params.afficherBonnesReponses,
      retourArriere: params.retourArriere,
      pleinEcran: params.pleinEcran,
      validationAuto: params.validationAuto,
      rappels: [params.rappelJ1 && "J-1", params.rappelH1 && "H-1"].filter(Boolean) as string[],
      canaux: ["Application", "WhatsApp"],
      createur: "Responsable Formation",
      questions: questions.map((q, i) => ({ ...q, numero: i + 1 })),
      participants: OUVRIERS.filter((o) => selection.includes(o.id)).map((o, i) => ({
        assignmentId: `AFF-${Date.now().toString().slice(-4)}-${i}`,
        attemptId: `TEN-${Date.now().toString().slice(-4)}-${i}`,
        resultId: `RES-${Date.now().toString().slice(-4)}-${i}`,
        workerId: o.id,
        ouvrier: o.nom,
        site: o.site,
        groupe: o.atelier,
        statut: "Non commencé" as const,
        debut: "—",
        fin: "—",
        duree: "—",
        tentative: 1,
        score: null,
        notification: "Envoyé" as const,
        reponses: [],
      })),
    });
    if (publierApres) publier(ev.evaluationId);
    pousserNotification({
      titre: publierApres ? "Évaluation publiée" : "Brouillon enregistré",
      detail: `${f.code} — ${selection.length} participant(s) affecté(s)`,
      ton: publierApres ? "success" : "info",
    });
    navigate({ to: "/formation/qcm/$id", params: { id: ev.evaluationId }, search: { onglet: "Vue d'ensemble" } });
  };

  return (
    <>
      <PageHeader
        titre="Nouvelle évaluation"
        sousTitre="Assistant de création en 5 étapes — informations, questions, paramètres, affectation, publication"
        fil={[{ label: "Formation" }, { label: "Évaluations & QCM" }, { label: "Nouvelle" }]}
        actions={<Btn onClick={() => navigate({ to: "/formation/qcm", search: { onglet: "Toutes les évaluations" } })}>Annuler</Btn>}
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        {ETAPES.map((e, i) => (
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

      {etape === 0 && (
        <Panel title="Informations générales">
          <div className="grid gap-3 md:grid-cols-2">
            <Input label="Code évaluation" value={f.code} onChange={(e) => set("code", e.target.value)} />
            <Input label="Titre de l'évaluation" value={f.titre} onChange={(e) => set("titre", e.target.value)} placeholder="QCM sécurité — module 1" />
            <Champ label="Type d'évaluation" value={f.type} onChange={(v) => set("type", v)} options={[...TYPES_EVALUATION]} />
            <Champ label="Niveau" value={f.niveau} onChange={(v) => set("niveau", v)} options={["Débutant", "Intermédiaire", "Avancé"]} />
            <Input label="Formation associée" value={f.formation} onChange={(e) => set("formation", e.target.value)} />
            <Input label="Module associé" value={f.module} onChange={(e) => set("module", e.target.value)} />
            <Input label="Compétence évaluée" value={f.competence} onChange={(e) => set("competence", e.target.value)} />
            <Champ label="Site" value={f.site} onChange={(v) => set("site", v)} options={["Bouskoura", "Berrechid", "Aïn Sebaâ"]} />
            <Champ label="Langue" value={f.langue} onChange={(v) => set("langue", v)} options={["Français", "Arabe", "Bilingue"]} />
            <Input label="Date de passage" value={f.datePassage} onChange={(e) => set("datePassage", e.target.value)} />
            <div className="md:col-span-2">
              <Textarea label="Description / objectif pédagogique" rows={3} value={f.description} onChange={(e) => set("description", e.target.value)} />
            </div>
          </div>
        </Panel>
      )}

      {etape === 1 && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Panel
            title={`Questions de l'évaluation (${questions.length})`}
            subtitle={`Total ${total} point(s)`}
            bodyClassName="p-0"
          >
            <Table>
              <thead>
                <tr><Th>#</Th><Th>Question</Th><Th>Type</Th><Th>Points</Th><Th /></tr>
              </thead>
              <tbody>
                {questions.map((q, i) => (
                  <Tr key={q.questionId}>
                    <Td className="num text-xs">{i + 1}</Td>
                    <Td className="max-w-[260px] truncate">{q.intitule}</Td>
                    <Td><Tag ton="info">{q.type}</Tag></Td>
                    <Td className="num text-xs">{q.points}</Td>
                    <Td>
                      <Btn size="sm" onClick={() => setQuestions((s) => s.filter((x) => x.questionId !== q.questionId))}>Retirer</Btn>
                    </Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
            {!questions.length && <Vide texte="Ajoutez des questions depuis la bibliothèque." />}
          </Panel>

          <Panel title="Bibliothèque de questions" subtitle="Réutilisez les questions validées" bodyClassName="p-0">
            <div className="border-b border-border p-3">
              <Champ label="Catégorie" value={categorie} onChange={setCategorie} options={["Toutes", ...CATEGORIES_QUESTION]} />
            </div>
            <Table>
              <thead>
                <tr><Th>Question</Th><Th>Catégorie</Th><Th>Difficulté</Th><Th /></tr>
              </thead>
              <tbody>
                {dispo.map((q) => (
                  <Tr key={q.questionId}>
                    <Td className="max-w-[240px] truncate">{q.intitule}</Td>
                    <Td className="text-xs text-muted-foreground">{q.categorie}</Td>
                    <Td><Tag ton={q.difficulte === "Difficile" ? "critical" : q.difficulte === "Moyenne" ? "warning" : "success"}>{q.difficulte}</Tag></Td>
                    <Td><Btn size="sm" onClick={() => setQuestions((s) => [...s, q])}>Ajouter</Btn></Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
            {!dispo.length && <Vide texte="Aucune question disponible pour ce filtre." />}
          </Panel>
        </div>
      )}

      {etape === 2 && (
        <Panel title="Paramètres de passage">
          <div className="mb-4 grid gap-3 md:grid-cols-4">
            <Input label="Durée (minutes)" value={f.duree} onChange={(e) => set("duree", e.target.value)} />
            <Input label="Seuil de réussite (%)" value={f.seuil} onChange={(e) => set("seuil", e.target.value)} />
            <Input label="Tentatives autorisées" value={f.tentatives} onChange={(e) => set("tentatives", e.target.value)} />
            <Input label="Heure d'ouverture" value={f.ouverture} onChange={(e) => set("ouverture", e.target.value)} />
          </div>
          <div className="grid gap-2 md:grid-cols-2">
            <Toggle label="Ordre des questions aléatoire" checked={params.ordreQuestionsAleatoire} onChange={(v) => setP("ordreQuestionsAleatoire", v)} />
            <Toggle label="Ordre des réponses aléatoire" checked={params.ordreReponsesAleatoire} onChange={(v) => setP("ordreReponsesAleatoire", v)} />
            <Toggle label="Afficher le résultat immédiatement" checked={params.resultatImmediat} onChange={(v) => setP("resultatImmediat", v)} />
            <Toggle label="Afficher les bonnes réponses après le test" checked={params.afficherBonnesReponses} onChange={(v) => setP("afficherBonnesReponses", v)} />
            <Toggle label="Autoriser le retour en arrière" checked={params.retourArriere} onChange={(v) => setP("retourArriere", v)} />
            <Toggle label="Mode plein écran obligatoire" checked={params.pleinEcran} onChange={(v) => setP("pleinEcran", v)} />
            <Toggle label="Correction automatique" checked={params.validationAuto} onChange={(v) => setP("validationAuto", v)} />
            <Toggle label="Rappel J-1" checked={params.rappelJ1} onChange={(v) => setP("rappelJ1", v)} />
            <Toggle label="Rappel H-1" checked={params.rappelH1} onChange={(v) => setP("rappelH1", v)} />
          </div>
        </Panel>
      )}

      {etape === 3 && (
        <Panel
          title={`Affectation des participants (${selection.length} sélectionné(s))`}
          subtitle="Sélectionnez les opérateurs qui recevront l'évaluation"
          bodyClassName="p-0"
          action={
            <div className="flex gap-2">
              <Btn size="sm" onClick={() => setSelection(ouvriersFiltres.map((o) => o.id))}>Tout sélectionner</Btn>
              <Btn size="sm" onClick={() => setSelection([])}>Tout désélectionner</Btn>
            </div>
          }
        >
          <div className="border-b border-border p-3">
            <Champ label="Site" value={site} onChange={setSite} options={["Tous", ...new Set(OUVRIERS.map((o) => o.site))]} />
          </div>
          <Table>
            <thead>
              <tr><Th /><Th>Ouvrier</Th><Th>Matricule</Th><Th>Site</Th><Th>Atelier</Th><Th>Statut</Th></tr>
            </thead>
            <tbody>
              {ouvriersFiltres.map((o) => (
                <Tr key={o.id} onClick={() => setSelection((s) => (s.includes(o.id) ? s.filter((x) => x !== o.id) : [...s, o.id]))}>
                  <Td><input type="checkbox" readOnly checked={selection.includes(o.id)} /></Td>
                  <Td className="font-medium">{o.nom}</Td>
                  <Td className="num text-xs text-[var(--brand)]">{o.id}</Td>
                  <Td className="text-xs">{o.site}</Td>
                  <Td className="text-xs">{o.atelier}</Td>
                  <Td className="text-xs text-muted-foreground">{o.statut}</Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        </Panel>
      )}

      {etape === 4 && (
        <Panel title="Récapitulatif avant publication">
          <div className="grid gap-3 md:grid-cols-3">
            <Recap label="Code / titre" valeur={`${f.code} — ${f.titre || "Sans titre"}`} />
            <Recap label="Type" valeur={f.type} />
            <Recap label="Formation / module" valeur={`${f.formation} · ${f.module}`} />
            <Recap label="Questions" valeur={`${questions.length} question(s) — ${total} point(s)`} />
            <Recap label="Durée / seuil" valeur={`${f.duree} min · seuil ${f.seuil} %`} />
            <Recap label="Tentatives" valeur={f.tentatives} />
            <Recap label="Passage" valeur={`${f.datePassage} — ${f.ouverture} à ${f.fermeture}`} />
            <Recap label="Participants affectés" valeur={`${selection.length}`} />
            <Recap label="Canaux de diffusion" valeur="Application, WhatsApp" />
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Btn onClick={() => enregistrer(false)}>Enregistrer en brouillon</Btn>
            <Btn variant="primary" onClick={() => enregistrer(true)}>Publier et notifier les participants</Btn>
          </div>
        </Panel>
      )}

      <div className="mt-4 flex justify-between">
        <Btn disabled={etape === 0} onClick={() => setEtape((e) => e - 1)}>Précédent</Btn>
        <Btn variant="primary" disabled={etape === ETAPES.length - 1 || !valide} onClick={() => setEtape((e) => e + 1)}>
          Suivant
        </Btn>
      </div>
    </>
  );
}

function Recap({ label, valeur }: { label: string; valeur: string }) {
  return (
    <div className="rounded-sm border border-border p-3">
      <p className="label-xs">{label}</p>
      <p className="mt-1 text-sm font-medium">{valeur}</p>
    </div>
  );
}
