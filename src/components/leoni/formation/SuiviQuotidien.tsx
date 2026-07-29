import { useMemo, useState } from "react";
import {
  Barre,
  Btn,
  Champ,
  Input,
  Panel,
  Select,
  Stat,
  Table,
  Tag,
  Td,
  Th,
  Tr,
  Vide,
} from "@/components/leoni/kit";
import {
  ACTIONS_CORRECTIVES_TYPES,
  CRITERES_SUIVI,
  PRESENCES_JOUR,
  type CleCritere,
  type LigneSuiviJour,
  type PresenceJour,
} from "@/data/formation-suivi";
import { formatLong } from "@/data/planning";
import { actionsFormation, useFormation, type GroupeDetail } from "@/lib/formation-store";

const notesVides = (): Record<CleCritere, number> =>
  Object.fromEntries(CRITERES_SUIVI.map((c) => [c.cle, 4])) as Record<CleCritere, number>;

export function SuiviQuotidien({
  groupes,
  groupeInitial,
  onAction,
}: {
  groupes: GroupeDetail[];
  groupeInitial?: string;
  onAction: (message: string) => void;
}) {
  const { suivis } = useFormation();
  const [date, setDate] = useState("2026-07-29");
  const [codeGroupe, setCodeGroupe] = useState(groupeInitial ?? groupes[0]?.code ?? "");
  const groupe = groupes.find((g) => g.code === codeGroupe) ?? groupes[0];

  const [lignes, setLignes] = useState<Record<string, LigneSuiviJour>>({});

  const participants = groupe?.participants ?? [];
  const ligne = (workerId: string): LigneSuiviJour =>
    lignes[workerId] ?? {
      workerId,
      presence: "Présent",
      retardMin: 0,
      notes: notesVides(),
      commentaire: "",
      actionCorrective: "Aucune",
    };

  const set = (workerId: string, patch: Partial<LigneSuiviJour>) =>
    setLignes((prev) => ({ ...prev, [workerId]: { ...ligne(workerId), ...patch } }));

  const stats = useMemo(() => {
    const l = participants.map((p) => ligne(p.workerId));
    const presents = l.filter((x) => x.presence === "Présent").length;
    const retards = l.filter((x) => x.presence === "Retard").length;
    const absents = l.filter((x) => x.presence.startsWith("Absent")).length;
    const moyennes = l.length
      ? Math.round(
          (l.reduce((s, x) => s + CRITERES_SUIVI.reduce((a, c) => a + x.notes[c.cle], 0) / CRITERES_SUIVI.length, 0) /
            l.length) *
            20,
        )
      : 0;
    const actions = l.filter((x) => x.actionCorrective !== "Aucune").length;
    return { presents, retards, absents, moyennes, actions };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lignes, participants]);

  const enregistrer = (statut: "Brouillon" | "Validé") => {
    if (!groupe) return;
    const toutes = participants.map((p) => ligne(p.workerId));
    actionsFormation.enregistrerSuivi({
      date,
      sessionId: groupe.sessions[0]?.id ?? "",
      groupe: groupe.code,
      formateurId: groupe.formateurId,
      statut,
      lignes: toutes,
    });
    toutes
      .filter((l) => l.actionCorrective !== "Aucune")
      .forEach((l) => {
        const p = participants.find((x) => x.workerId === l.workerId)!;
        actionsFormation.creerAction({
          ouvrier: p.nom,
          ouvrierId: p.workerId,
          groupe: groupe.code,
          origine: `Suivi quotidien du ${formatLong(date)}`,
          probleme: l.commentaire || "Point de vigilance relevé par le formateur",
          action: l.actionCorrective,
          responsable: groupe.formateur,
          creee: formatLong(date),
          echeance: formatLong(date),
          statut: "À faire",
          priorite: l.presence === "Absent non justifié" ? "Haute" : "Moyenne",
        });
      });
    onAction(
      statut === "Validé"
        ? `Suivi quotidien validé — ${groupe.code} (${participants.length} participants, ${stats.actions} action(s) corrective(s))`
        : `Suivi quotidien enregistré en brouillon — ${groupe.code}`,
    );
  };

  const dejaSaisi = suivis.find((s) => s.date === date && s.groupe === codeGroupe);

  return (
    <div className="space-y-4">
      <Panel title="Journée de formation" subtitle="Sélection de la date et du groupe à évaluer">
        <div className="grid gap-3 sm:grid-cols-4">
          <Input label="Date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          <Champ label="Groupe" value={codeGroupe} onChange={setCodeGroupe} options={groupes.map((g) => g.code)} />
          <div className="rounded-sm border border-border px-3 py-2 text-[11px] text-muted-foreground">
            <p>{groupe?.formation ?? "—"}</p>
            <p>
              {groupe?.site} · Formateur {groupe?.formateur}
            </p>
          </div>
          <div className="flex items-end gap-2">
            <Btn size="sm" onClick={() => enregistrer("Brouillon")}>
              Brouillon
            </Btn>
            <Btn size="sm" variant="primary" onClick={() => enregistrer("Validé")}>
              Valider la journée
            </Btn>
          </div>
        </div>
        {dejaSaisi && (
          <p className="mt-2 text-[11px] text-[var(--warning)]">
            Un suivi existe déjà pour cette date et ce groupe ({dejaSaisi.id}, {dejaSaisi.statut}) — l'enregistrement le
            mettra à jour.
          </p>
        )}
      </Panel>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <Stat label="Présents" valeur={stats.presents} ton="success" />
        <Stat label="Retards" valeur={stats.retards} />
        <Stat label="Absents" valeur={stats.absents} ton="critical" />
        <Stat label="Note moyenne du jour" valeur={`${stats.moyennes} %`} />
        <Stat label="Actions correctives" valeur={stats.actions} />
      </div>

      <Panel title="Évaluation quotidienne par participant" bodyClassName="p-0">
        {participants.length === 0 ? (
          <Vide texte="Aucun participant dans ce groupe." />
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Participant</Th>
                <Th>Présence</Th>
                <Th>Retard</Th>
                {CRITERES_SUIVI.map((c) => (
                  <Th key={c.cle}>{c.label}</Th>
                ))}
                <Th>Moyenne</Th>
                <Th>Commentaire</Th>
                <Th>Action corrective</Th>
              </tr>
            </thead>
            <tbody>
              {participants.map((p) => {
                const l = ligne(p.workerId);
                const moyenne = Math.round(
                  (CRITERES_SUIVI.reduce((a, c) => a + l.notes[c.cle], 0) / CRITERES_SUIVI.length) * 20,
                );
                return (
                  <Tr key={p.workerId}>
                    <Td>
                      <span className="font-medium">{p.nom}</span>
                      <span className="num block text-[11px] text-muted-foreground">{p.workerId}</span>
                    </Td>
                    <Td>
                      <Select
                        value={l.presence}
                        onChange={(v) => set(p.workerId, { presence: v as PresenceJour })}
                        options={PRESENCES_JOUR}
                        className="h-7 text-xs"
                      />
                    </Td>
                    <Td>
                      <input
                        type="number"
                        min={0}
                        max={120}
                        value={l.retardMin}
                        onChange={(e) => set(p.workerId, { retardMin: Number(e.target.value) })}
                        className="num h-7 w-14 rounded-sm border border-border bg-card px-1.5 text-xs outline-none focus:ring-2 focus:ring-[var(--ring)]"
                      />
                    </Td>
                    {CRITERES_SUIVI.map((c) => (
                      <Td key={c.cle}>
                        <Select
                          value={String(l.notes[c.cle])}
                          onChange={(v) => set(p.workerId, { notes: { ...l.notes, [c.cle]: Number(v) } })}
                          options={["1", "2", "3", "4", "5"]}
                          className="h-7 w-14 text-xs"
                        />
                      </Td>
                    ))}
                    <Td>
                      <div className="w-16">
                        <Barre valeur={moyenne} ton={moyenne >= 80 ? "success" : moyenne >= 60 ? "warning" : "critical"} />
                      </div>
                    </Td>
                    <Td>
                      <input
                        value={l.commentaire}
                        placeholder="Observation du formateur"
                        onChange={(e) => set(p.workerId, { commentaire: e.target.value })}
                        className="h-7 w-44 rounded-sm border border-border bg-card px-2 text-xs outline-none focus:ring-2 focus:ring-[var(--ring)]"
                      />
                    </Td>
                    <Td>
                      <Select
                        value={l.actionCorrective}
                        onChange={(v) => set(p.workerId, { actionCorrective: v })}
                        options={ACTIONS_CORRECTIVES_TYPES}
                        className="h-7 text-xs"
                      />
                    </Td>
                  </Tr>
                );
              })}
            </tbody>
          </Table>
        )}
      </Panel>

      <Panel title="Historique des suivis enregistrés" bodyClassName="p-0">
        <Table>
          <thead>
            <tr>
              <Th>Référence</Th>
              <Th>Date</Th>
              <Th>Groupe</Th>
              <Th>Participants</Th>
              <Th>Absents</Th>
              <Th>Actions</Th>
              <Th>Statut</Th>
            </tr>
          </thead>
          <tbody>
            {suivis.map((s) => (
              <Tr key={s.id}>
                <Td className="num text-xs text-[var(--brand)]">{s.id}</Td>
                <Td className="num">{formatLong(s.date)}</Td>
                <Td className="font-medium">{s.groupe}</Td>
                <Td className="num">{s.lignes.length}</Td>
                <Td className="num">{s.lignes.filter((l) => l.presence.startsWith("Absent")).length}</Td>
                <Td className="num">{s.lignes.filter((l) => l.actionCorrective !== "Aucune").length}</Td>
                <Td>
                  <Tag ton={s.statut === "Validé" ? "success" : "neutral"}>{s.statut}</Tag>
                </Td>
              </Tr>
            ))}
          </tbody>
        </Table>
      </Panel>
    </div>
  );
}
