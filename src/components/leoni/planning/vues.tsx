import { cn } from "@/lib/utils";
import { Table, Td, Th, Tr, Tag, Avatar } from "@/components/leoni/kit";
import {
  FORMATEURS,
  JOURS_COURT,
  MOIS_FR,
  SALLES,
  ajouterJours,
  dureeMin,
  dureeTexte,
  formateurParId,
  formatLong,
  minutes,
  parseIso,
  salleParId,
  type SessionPlanning,
} from "@/data/planning";
import { SessionCarte, tonSessionStatut } from "./commun";

const H_DEBUT = 7;
const H_FIN = 19;
const PX_H = 64;
export const HEURES = Array.from({ length: H_FIN - H_DEBUT + 1 }, (_, i) => H_DEBUT + i);

const topDe = (s: SessionPlanning) => ((minutes(s.debut) - H_DEBUT * 60) / 60) * PX_H;
const hauteurDe = (s: SessionPlanning) => Math.max(38, (dureeMin(s) / 60) * PX_H);

function heureDepuisY(y: number) {
  const totalMin = H_DEBUT * 60 + Math.round(y / PX_H * 4) * 15;
  const clamp = Math.min(H_FIN * 60 - 30, Math.max(H_DEBUT * 60, totalMin));
  return `${String(Math.floor(clamp / 60)).padStart(2, "0")}:${String(clamp % 60).padStart(2, "0")}`;
}

interface VueProps {
  sessions: SessionPlanning[];
  conflits: Set<string>;
  onOuvrir: (id: string) => void;
  onDeplacer: (id: string, date: string, debut: string) => void;
  onCreerCreneau?: (date: string, debut: string) => void;
}

/* ------------------------------ Grille jours ----------------------------- */

function ColonneHeures() {
  return (
    <div className="w-14 shrink-0">
      <div className="h-10 border-b border-border" />
      {HEURES.slice(0, -1).map((h) => (
        <div key={h} className="num relative border-b border-border/60 text-[10px] text-muted-foreground" style={{ height: PX_H }}>
          <span className="absolute -top-1.5 right-2">{String(h).padStart(2, "0")}:00</span>
        </div>
      ))}
    </div>
  );
}

function ColonneJour({
  date,
  sessions,
  conflits,
  onOuvrir,
  onDeplacer,
  onCreerCreneau,
  large,
}: VueProps & { date: string; large?: boolean }) {
  const dujour = sessions.filter((s) => s.date === date);
  const aujourdhui = date === new Date().toISOString().slice(0, 10);
  const d = parseIso(date);

  return (
    <div className="min-w-0 flex-1 border-l border-border">
      <div
        className={cn(
          "flex h-10 items-center justify-center gap-1.5 border-b border-border text-[11px] font-semibold",
          aujourdhui && "bg-[var(--brand-soft)] text-[var(--brand)]",
        )}
      >
        <span>{JOURS_COURT[(d.getDay() + 6) % 7]}</span>
        <span className="num text-muted-foreground">
          {String(d.getDate()).padStart(2, "0")}/{String(d.getMonth() + 1).padStart(2, "0")}
        </span>
        {dujour.length > 0 && <span className="num rounded-sm bg-muted px-1 text-[9px]">{dujour.length}</span>}
      </div>
      <div
        className="relative"
        style={{ height: (H_FIN - H_DEBUT) * PX_H }}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          const id = e.dataTransfer.getData("text/session");
          const y = e.clientY - e.currentTarget.getBoundingClientRect().top;
          if (id) onDeplacer(id, date, heureDepuisY(y));
        }}
        onDoubleClick={(e) => {
          const y = e.clientY - e.currentTarget.getBoundingClientRect().top;
          onCreerCreneau?.(date, heureDepuisY(y));
        }}
      >
        {HEURES.slice(0, -1).map((h) => (
          <div key={h} className="border-b border-border/60" style={{ height: PX_H }} />
        ))}
        {dujour.map((s, i, arr) => {
          const chevauchants = arr.filter(
            (o) => minutes(o.debut) < minutes(s.fin) && minutes(s.debut) < minutes(o.fin),
          );
          const idx = chevauchants.findIndex((o) => o.id === s.id);
          const n = chevauchants.length;
          return (
            <SessionCarte
              key={s.id}
              session={s}
              conflit={conflits.has(s.id)}
              compacte={!large && hauteurDe(s) < 80}
              onClick={() => onOuvrir(s.id)}
              onDragStart={() => undefined}
              className="absolute px-0.5"
              style={{
                top: topDe(s),
                height: hauteurDe(s),
                left: `${(idx / n) * 100}%`,
                width: `${100 / n}%`,
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

/* -------------------------------- Semaine -------------------------------- */

export function VueSemaine({ debutSemaine, nbJours = 6, ...props }: VueProps & { debutSemaine: string; nbJours?: number }) {
  const jours = Array.from({ length: nbJours }, (_, i) => ajouterJours(debutSemaine, i));
  return (
    <div className="overflow-x-auto rounded-md border border-border bg-card">
      <div className="flex min-w-[880px]" onDragStart={(e) => {
        const el = (e.target as HTMLElement).closest("article");
        const carte = el?.parentElement as HTMLElement | null;
        const id = carte?.dataset.sessionId;
        if (id) e.dataTransfer.setData("text/session", id);
      }}>
        <ColonneHeures />
        {jours.map((j) => (
          <ColonneJourWrapper key={j} date={j} {...props} />
        ))}
      </div>
    </div>
  );
}

function ColonneJourWrapper(props: VueProps & { date: string; large?: boolean }) {
  return (
    <div className="min-w-0 flex-1" onDragStart={() => undefined}>
      <ColonneJourAvecId {...props} />
    </div>
  );
}

function ColonneJourAvecId(props: VueProps & { date: string; large?: boolean }) {
  return <ColonneJour {...props} />;
}

/* ---------------------------------- Jour --------------------------------- */

export function VueJour({ date, ...props }: VueProps & { date: string }) {
  const dujour = props.sessions.filter((s) => s.date === date);
  return (
    <div className="grid gap-3 lg:grid-cols-[1fr_320px]">
      <div className="overflow-hidden rounded-md border border-border bg-card">
        <div className="flex" onDragStart={(e) => {
          const carte = (e.target as HTMLElement).closest("[data-session-id]") as HTMLElement | null;
          if (carte?.dataset.sessionId) e.dataTransfer.setData("text/session", carte.dataset.sessionId);
        }}>
          <ColonneHeures />
          <ColonneJour date={date} large {...props} />
        </div>
      </div>
      <aside className="rounded-md border border-border bg-card p-3">
        <p className="label-xs mb-2">Résumé du {formatLong(date)}</p>
        <ul className="space-y-2">
          {dujour.map((s) => (
            <li
              key={s.id}
              onClick={() => props.onOuvrir(s.id)}
              className="cursor-pointer rounded-sm border border-border p-2 text-xs hover:bg-[var(--hover)]"
            >
              <p className="num text-[10px] text-muted-foreground">
                {s.debut} – {s.fin} · {dureeTexte(s)}
              </p>
              <p className="font-semibold">{s.groupe} — {s.moduleNom}</p>
              <p className="text-[11px] text-muted-foreground">
                {formateurParId(s.formateurId)?.nom} · {salleParId(s.salleId)?.nom}
              </p>
              <div className="mt-1 flex items-center gap-1">
                <Tag ton={tonSessionStatut(s.statut)}>{s.statut}</Tag>
                <span className="num text-[10px] text-muted-foreground">{s.participants.length} inscrits</span>
              </div>
            </li>
          ))}
          {dujour.length === 0 && <li className="py-6 text-center text-xs text-muted-foreground">Journée libre.</li>}
        </ul>
      </aside>
    </div>
  );
}

/* ---------------------------------- Mois --------------------------------- */

export function VueMois({ mois, sessions, conflits, onOuvrir, onDeplacer }: VueProps & { mois: string }) {
  const premier = parseIso(`${mois}-01`);
  const debut = ajouterJours(`${mois}-01`, -((premier.getDay() + 6) % 7));
  const cases = Array.from({ length: 42 }, (_, i) => ajouterJours(debut, i));

  return (
    <div className="overflow-hidden rounded-md border border-border bg-card">
      <div className="grid grid-cols-7 border-b border-border">
        {JOURS_COURT.map((j) => (
          <div key={j} className="px-2 py-2 text-center text-[11px] font-semibold text-muted-foreground">
            {j}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {cases.map((d) => {
          const dujour = sessions.filter((s) => s.date === d);
          const horsMois = !d.startsWith(mois);
          return (
            <div
              key={d}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                const id = e.dataTransfer.getData("text/session");
                if (id) onDeplacer(id, d, sessions.find((s) => s.id === id)?.debut ?? "08:00");
              }}
              className={cn("min-h-28 border-b border-l border-border p-1", horsMois && "bg-muted/40")}
            >
              <p className={cn("num mb-1 text-[10px]", horsMois ? "text-muted-foreground/60" : "text-muted-foreground")}>
                {parseIso(d).getDate()}
              </p>
              <div className="space-y-1">
                {dujour.slice(0, 3).map((s) => (
                  <SessionCarte
                    key={s.id}
                    session={s}
                    conflit={conflits.has(s.id)}
                    compacte
                    onClick={() => onOuvrir(s.id)}
                    onDragStart={() => undefined}
                  />
                ))}
                {dujour.length > 3 && (
                  <p className="num px-1 text-[10px] text-[var(--brand)]">+{dujour.length - 3} autres</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------- Planning ressources --------------------------- */

export function VueRessources({
  axe,
  debutSemaine,
  sessions,
  conflits,
  onOuvrir,
}: VueProps & { axe: "Formateur" | "Salle"; debutSemaine: string }) {
  const jours = Array.from({ length: 6 }, (_, i) => ajouterJours(debutSemaine, i));
  const lignes =
    axe === "Formateur"
      ? FORMATEURS.map((f) => ({ id: f.id, nom: f.nom, sous: `${f.fonction} · ${f.site}` }))
      : SALLES.map((s) => ({ id: s.id, nom: s.nom, sous: `${s.type} · ${s.capacite} places` }));

  return (
    <div className="overflow-x-auto rounded-md border border-border bg-card">
      <table className="w-full min-w-[900px] border-collapse">
        <thead>
          <tr className="border-b border-border bg-muted/50">
            <th className="w-52 px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              {axe}
            </th>
            {jours.map((j) => (
              <th key={j} className="border-l border-border px-2 py-2 text-[11px] font-semibold">
                {JOURS_COURT[(parseIso(j).getDay() + 6) % 7]}{" "}
                <span className="num text-muted-foreground">{parseIso(j).getDate()}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {lignes.map((l) => (
            <tr key={l.id} className="border-b border-border align-top">
              <td className="px-3 py-2">
                <div className="flex items-center gap-2">
                  <Avatar nom={l.nom} size={26} />
                  <div className="min-w-0">
                    <p className="truncate text-xs font-medium">{l.nom}</p>
                    <p className="truncate text-[10px] text-muted-foreground">{l.sous}</p>
                  </div>
                </div>
              </td>
              {jours.map((j) => {
                const cellules = sessions.filter(
                  (s) => s.date === j && (axe === "Formateur" ? s.formateurId === l.id : s.salleId === l.id),
                );
                return (
                  <td key={j} className="min-w-32 border-l border-border p-1">
                    <div className="space-y-1">
                      {cellules.map((s) => (
                        <SessionCarte
                          key={s.id}
                          session={s}
                          conflit={conflits.has(s.id)}
                          compacte
                          onClick={() => onOuvrir(s.id)}
                        />
                      ))}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* --------------------------------- Liste --------------------------------- */

export function VueListe({ sessions, conflits, onOuvrir }: VueProps) {
  const triees = [...sessions].sort((a, b) => (a.date + a.debut).localeCompare(b.date + b.debut));
  return (
    <div className="overflow-hidden rounded-md border border-border bg-card">
      <Table>
        <thead>
          <tr>
            <Th>Date</Th>
            <Th>Horaire</Th>
            <Th>Durée</Th>
            <Th>Formation / module</Th>
            <Th>Groupe</Th>
            <Th>Formateur</Th>
            <Th>Salle</Th>
            <Th>Site</Th>
            <Th className="text-right">Inscrits</Th>
            <Th>Statut</Th>
          </tr>
        </thead>
        <tbody>
          {triees.map((s) => (
            <Tr key={s.id} onDoubleClick={() => onOuvrir(s.id)} onClick={() => onOuvrir(s.id)}>
              <Td className="num whitespace-nowrap">{formatLong(s.date).replace(/^\w+ /, "")}</Td>
              <Td className="num whitespace-nowrap">
                {s.debut} – {s.fin}
              </Td>
              <Td className="num">{dureeTexte(s)}</Td>
              <Td>
                <p className="font-medium">{s.moduleNom}</p>
                <p className="text-[11px] text-muted-foreground">{s.formationNom}</p>
              </Td>
              <Td>{s.groupe}</Td>
              <Td>{formateurParId(s.formateurId)?.nom}</Td>
              <Td>{salleParId(s.salleId)?.nom}</Td>
              <Td>{s.site}</Td>
              <Td className="num text-right">
                {s.participants.length}/{s.capacite}
              </Td>
              <Td>
                <div className="flex items-center gap-1">
                  <Tag ton={tonSessionStatut(s.statut)}>{s.statut}</Tag>
                  {conflits.has(s.id) && <Tag ton="critical">Conflit</Tag>}
                </div>
              </Td>
            </Tr>
          ))}
        </tbody>
      </Table>
      {triees.length === 0 && <p className="px-4 py-8 text-center text-xs text-muted-foreground">Aucune session.</p>}
    </div>
  );
}

export const libelleMois = (mois: string) => {
  const [a, m] = mois.split("-");
  return `${MOIS_FR[Number(m) - 1]} ${a}`;
};
