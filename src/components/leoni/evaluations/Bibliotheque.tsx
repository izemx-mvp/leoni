import { useMemo, useState } from "react";
import {
  CATEGORIES_QUESTION,
  DIFFICULTES,
  TYPES_QUESTION,
  type Difficulte,
  type Question,
  type TypeQuestion,
} from "@/data/evaluations";
import {
  Btn,
  Champ,
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
  Vide,
} from "@/components/leoni/kit";
import { tonTaux, useEvaluations } from "@/lib/evaluations-store";
import { useLeoni } from "@/lib/leoni-store";

const VIDE: Question = {
  questionId: "",
  numero: 0,
  intitule: "",
  description: "",
  type: "Choix unique",
  reponses: ["", "", "", ""],
  bonneReponse: "",
  explication: "",
  points: 1,
  categorie: "Sécurité",
  competence: "Sécurité industrielle",
  difficulte: "Facile",
  obligatoire: true,
  formation: "FOR-CBL-01",
  module: "Sécurité & EPI",
  utilisations: 0,
  tauxReussite: 0,
  derniereUtilisation: "—",
  createur: "Salma Bennis",
};

export function Bibliotheque() {
  const { bibliotheque, evaluations, creerQuestion, majQuestion, dupliquerQuestion, archiverQuestion, ajouterQuestions } =
    useEvaluations();
  const { pousserNotification } = useLeoni();

  const [categorie, setCategorie] = useState("Toutes");
  const [type, setType] = useState("Tous");
  const [difficulte, setDifficulte] = useState("Toutes");
  const [q, setQ] = useState("");
  const [selection, setSelection] = useState<string[]>([]);
  const [form, setForm] = useState<Question | null>(null);
  const [ajoutOuvert, setAjoutOuvert] = useState(false);
  const [cible, setCible] = useState(evaluations[0]?.evaluationId ?? "");

  const lignes = useMemo(
    () =>
      bibliotheque.filter(
        (x) =>
          (categorie === "Toutes" || x.categorie === categorie) &&
          (type === "Tous" || x.type === type) &&
          (difficulte === "Toutes" || x.difficulte === difficulte) &&
          (q === "" || x.intitule.toLowerCase().includes(q.toLowerCase())),
      ),
    [bibliotheque, categorie, type, difficulte, q],
  );

  const bascule = (id: string) =>
    setSelection((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const enregistrer = () => {
    if (!form) return;
    if (form.questionId) {
      majQuestion(form.questionId, form);
      pousserNotification({ titre: "Question modifiée", detail: form.intitule.slice(0, 60), ton: "info" });
    } else {
      creerQuestion({ ...form, questionId: `Q-NEW-${Date.now().toString().slice(-5)}` });
      pousserNotification({ titre: "Question créée", detail: form.intitule.slice(0, 60), ton: "success" });
    }
    setForm(null);
  };

  return (
    <>
      <Panel
        title={`Bibliothèque de questions (${lignes.length})`}
        subtitle="Banque réutilisable de questions, partagée par toutes les évaluations"
        bodyClassName="p-0"
        action={
          <div className="flex gap-2">
            <Btn size="sm" disabled={!selection.length} onClick={() => setAjoutOuvert(true)}>
              Ajouter les questions sélectionnées ({selection.length})
            </Btn>
            <Btn size="sm" variant="primary" onClick={() => setForm({ ...VIDE })}>
              + Créer une question
            </Btn>
          </div>
        }
      >
        <div className="flex flex-wrap items-center gap-2 border-b border-border p-3">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Rechercher une question…"
            className="h-9 min-w-56 flex-1 rounded-sm border border-border bg-card px-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]"
          />
          <Select value={categorie} onChange={setCategorie} options={["Toutes", ...CATEGORIES_QUESTION]} />
          <Select value={type} onChange={setType} options={["Tous", ...TYPES_QUESTION]} />
          <Select value={difficulte} onChange={setDifficulte} options={["Toutes", ...DIFFICULTES]} />
        </div>

        <Table>
          <thead>
            <tr>
              <Th />
              <Th>Question</Th><Th>Catégorie</Th><Th>Formation</Th><Th>Module</Th><Th>Compétence</Th>
              <Th>Type</Th><Th>Difficulté</Th><Th>Utilisations</Th><Th>Réussite</Th><Th>Dernière util.</Th>
              <Th>Créateur</Th><Th>Actions</Th>
            </tr>
          </thead>
          <tbody>
            {lignes.map((x) => (
              <Tr key={x.questionId} className={x.archivee ? "opacity-50" : undefined}>
                <Td>
                  <input type="checkbox" checked={selection.includes(x.questionId)} onChange={() => bascule(x.questionId)} />
                </Td>
                <Td className="max-w-[280px] truncate font-medium">{x.intitule}</Td>
                <Td className="text-xs">{x.categorie}</Td>
                <Td className="text-xs text-muted-foreground">{x.formation}</Td>
                <Td className="text-xs text-muted-foreground">{x.module}</Td>
                <Td className="text-xs">{x.competence}</Td>
                <Td><Tag ton="info">{x.type}</Tag></Td>
                <Td><Tag ton={x.difficulte === "Facile" ? "success" : x.difficulte === "Moyenne" ? "warning" : "critical"}>{x.difficulte}</Tag></Td>
                <Td className="num">{x.utilisations}</Td>
                <Td><Tag ton={tonTaux(x.tauxReussite ?? 0)}>{x.tauxReussite} %</Tag></Td>
                <Td className="num text-xs text-muted-foreground">{x.derniereUtilisation}</Td>
                <Td className="text-xs">{x.createur}</Td>
                <Td>
                  <div className="flex gap-1">
                    <Btn size="sm" onClick={() => setForm(x)}>Modifier</Btn>
                    <Btn size="sm" onClick={() => dupliquerQuestion(x.questionId)}>Dupliquer</Btn>
                    <Btn size="sm" onClick={() => archiverQuestion(x.questionId)}>{x.archivee ? "Restaurer" : "Archiver"}</Btn>
                  </div>
                </Td>
              </Tr>
            ))}
          </tbody>
        </Table>
        {!lignes.length && <Vide texte="Aucune question ne correspond aux filtres." />}
      </Panel>

      {ajoutOuvert && (
        <Modale
          titre="Ajouter les questions sélectionnées"
          sousTitre={`${selection.length} question(s) — choisissez l'évaluation cible`}
          onClose={() => setAjoutOuvert(false)}
          footer={
            <>
              <Btn onClick={() => setAjoutOuvert(false)}>Annuler</Btn>
              <Btn
                variant="primary"
                onClick={() => {
                  const questions = bibliotheque.filter((x) => selection.includes(x.questionId));
                  ajouterQuestions(cible, questions);
                  pousserNotification({
                    titre: "Questions ajoutées",
                    detail: `${questions.length} question(s) ajoutée(s) à l'évaluation`,
                    ton: "success",
                  });
                  setSelection([]);
                  setAjoutOuvert(false);
                }}
              >
                Ajouter
              </Btn>
            </>
          }
        >
          <Champ
            label="Évaluation cible"
            value={cible}
            onChange={setCible}
            options={evaluations.map((e) => e.evaluationId)}
          />
          <p className="mt-2 text-xs text-muted-foreground">
            {evaluations.find((e) => e.evaluationId === cible)?.code} —{" "}
            {evaluations.find((e) => e.evaluationId === cible)?.titre}
          </p>
        </Modale>
      )}

      {form && (
        <EditeurQuestion form={form} setForm={setForm} onSave={enregistrer} onClose={() => setForm(null)} />
      )}
    </>
  );
}

export function EditeurQuestion({
  form,
  setForm,
  onSave,
  onClose,
}: {
  form: Question;
  setForm: (q: Question) => void;
  onSave: () => void;
  onClose: () => void;
}) {
  const maj = (patch: Partial<Question>) => setForm({ ...form, ...patch });
  return (
    <Modale
      large
      titre={form.questionId ? "Modifier la question" : "Créer une question"}
      sousTitre="Toutes les métadonnées alimentent la bibliothèque et l'analyse par question"
      onClose={onClose}
      footer={
        <>
          <Btn onClick={onClose}>Annuler</Btn>
          <Btn variant="primary" onClick={onSave}>Enregistrer</Btn>
        </>
      }
    >
      <div className="grid gap-3 md:grid-cols-2">
        <div className="md:col-span-2">
          <Input label="Intitulé de la question" value={form.intitule} onChange={(e) => maj({ intitule: e.target.value })} />
        </div>
        <div className="md:col-span-2">
          <Textarea label="Description (facultative)" rows={2} value={form.description ?? ""} onChange={(e) => maj({ description: e.target.value })} />
        </div>
        <Champ label="Type de question" value={form.type} onChange={(v) => maj({ type: v as TypeQuestion })} options={[...TYPES_QUESTION]} />
        <Champ label="Catégorie" value={form.categorie} onChange={(v) => maj({ categorie: v })} options={CATEGORIES_QUESTION} />
        <Input label="Compétence évaluée" value={form.competence} onChange={(e) => maj({ competence: e.target.value })} />
        <Champ label="Difficulté" value={form.difficulte} onChange={(v) => maj({ difficulte: v as Difficulte })} options={[...DIFFICULTES]} />
        <Input label="Formation" value={form.formation ?? ""} onChange={(e) => maj({ formation: e.target.value })} />
        <Input label="Module" value={form.module ?? ""} onChange={(e) => maj({ module: e.target.value })} />
        <Input label="Points" type="number" value={form.points} onChange={(e) => maj({ points: Number(e.target.value) })} />
        <Champ label="Obligatoire" value={form.obligatoire ? "Oui" : "Non"} onChange={(v) => maj({ obligatoire: v === "Oui" })} options={["Oui", "Non"]} />

        <div className="md:col-span-2">
          <p className="label-xs mb-1">Réponses proposées</p>
          <div className="space-y-2">
            {form.reponses.map((r, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  type="radio"
                  name="bonne"
                  checked={form.bonneReponse === r && r !== ""}
                  onChange={() => maj({ bonneReponse: r })}
                  title="Marquer comme bonne réponse"
                />
                <input
                  value={r}
                  onChange={(e) => {
                    const arr = [...form.reponses];
                    arr[i] = e.target.value;
                    maj({ reponses: arr });
                  }}
                  placeholder={`Réponse ${String.fromCharCode(65 + i)}`}
                  className="h-9 flex-1 rounded-sm border border-border bg-card px-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]"
                />
                <Btn size="sm" onClick={() => maj({ reponses: form.reponses.filter((_, j) => j !== i) })}>Supprimer</Btn>
              </div>
            ))}
          </div>
          <Btn size="sm" className="mt-2" onClick={() => maj({ reponses: [...form.reponses, ""] })}>+ Ajouter une réponse</Btn>
        </div>

        <div className="md:col-span-2">
          <Textarea label="Explication de la bonne réponse" rows={2} value={form.explication} onChange={(e) => maj({ explication: e.target.value })} />
        </div>
        <div className="md:col-span-2 flex flex-wrap gap-2">
          <Btn size="sm">Ajouter une image</Btn>
          <Btn size="sm">Ajouter un document</Btn>
        </div>
      </div>
    </Modale>
  );
}
