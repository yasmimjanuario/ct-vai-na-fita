"use client";

import "./bracket-chain.css";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";

type CategoryId = string;
type Team = { id: string; player1: string; player2: string; seed: number; losses: number; eliminated: boolean };
type MatchSource = { type: "team" | "winner" | "loser"; ref: string };
type Match = { id: string; number: number; round: number; bracket: "principal" | "repescagem"; sourceA: MatchSource; sourceB: MatchSource; winner?: string; bye?: boolean };
type Tournament = { teams: Team[]; matches: Match[]; round: number; started: boolean; champion?: string; runnerUp?: string };

const emptyTournament = (): Tournament => ({ teams: [], matches: [], round: 0, started: false });
const storageKey = "ct-vai-na-fita-torneio-v3";

const mistoEscolinhaTeams: Team[] = [
  { id: "nathalia-max", player1: "Nathalia", player2: "Max", seed: 1, losses: 0, eliminated: false },
  { id: "thamires-renan", player1: "Thamires", player2: "Renan", seed: 2, losses: 0, eliminated: false },
  { id: "mariana-lucas", player1: "Mariana", player2: "Lucas", seed: 3, losses: 0, eliminated: false },
  { id: "nathalia-chokito", player1: "Nathalia", player2: "Chokito", seed: 4, losses: 1, eliminated: false },
  { id: "malu-belas", player1: "Malu", player2: "Belas", seed: 5, losses: 1, eliminated: false },
  { id: "thais-daniel", player1: "Thais", player2: "Daniel", seed: 6, losses: 0, eliminated: false },
  { id: "maria-clara-pk", player1: "Maria Clara", player2: "PK", seed: 7, losses: 0, eliminated: false },
  { id: "gisele-mello", player1: "Gisele", player2: "Mello", seed: 8, losses: 0, eliminated: false },
  { id: "pietra-tinoco", player1: "Pietra", player2: "Tinoco", seed: 9, losses: 1, eliminated: false },
  { id: "veronica-miguel", player1: "Verônica", player2: "Miguel", seed: 10, losses: 1, eliminated: false },
  { id: "tays-renan", player1: "Tays", player2: "Renan", seed: 11, losses: 1, eliminated: false },
  { id: "dalila-denis", player1: "Dalila", player2: "Dênis", seed: 12, losses: 0, eliminated: false },
  { id: "brenda-sunny", player1: "Brenda", player2: "Sunny", seed: 13, losses: 0, eliminated: false },
];

const mistoEscolinhaAtualizado = (): Tournament => ({
  teams: mistoEscolinhaTeams,
  started: true,
  round: 2,
  matches: [
    { id: "jogo-1", number: 1, round: 1, bracket: "principal", sourceA: { type: "team", ref: "gisele-mello" }, sourceB: { type: "team", ref: "pietra-tinoco" }, winner: "gisele-mello" },
    { id: "jogo-2", number: 2, round: 1, bracket: "principal", sourceA: { type: "team", ref: "nathalia-chokito" }, sourceB: { type: "team", ref: "brenda-sunny" }, winner: "brenda-sunny" },
    { id: "jogo-3", number: 3, round: 1, bracket: "principal", sourceA: { type: "team", ref: "malu-belas" }, sourceB: { type: "team", ref: "dalila-denis" }, winner: "dalila-denis" },
    { id: "jogo-4", number: 4, round: 1, bracket: "principal", sourceA: { type: "team", ref: "maria-clara-pk" }, sourceB: { type: "team", ref: "veronica-miguel" }, winner: "maria-clara-pk" },
    { id: "jogo-5", number: 5, round: 1, bracket: "principal", sourceA: { type: "team", ref: "thais-daniel" }, sourceB: { type: "team", ref: "tays-renan" }, winner: "thais-daniel" },
    { id: "jogo-6", number: 6, round: 2, bracket: "principal", sourceA: { type: "team", ref: "nathalia-max" }, sourceB: { type: "winner", ref: "1" } },
    { id: "jogo-7", number: 7, round: 2, bracket: "principal", sourceA: { type: "winner", ref: "2" }, sourceB: { type: "winner", ref: "3" } },
    { id: "jogo-8", number: 8, round: 2, bracket: "principal", sourceA: { type: "team", ref: "thamires-renan" }, sourceB: { type: "winner", ref: "4" } },
    { id: "jogo-9", number: 9, round: 2, bracket: "principal", sourceA: { type: "team", ref: "mariana-lucas" }, sourceB: { type: "winner", ref: "5" } },
    { id: "jogo-10", number: 10, round: 2, bracket: "repescagem", sourceA: { type: "loser", ref: "2" }, sourceB: { type: "loser", ref: "3" } },
    { id: "jogo-11", number: 11, round: 3, bracket: "repescagem", sourceA: { type: "team", ref: "pietra-tinoco" }, sourceB: { type: "winner", ref: "10" } },
    { id: "jogo-12", number: 12, round: 2, bracket: "repescagem", sourceA: { type: "loser", ref: "4" }, sourceB: { type: "loser", ref: "5" } },
  ],
});

const initialData = (): Record<CategoryId, Tournament> => ({
  "misto-escolinha": mistoEscolinhaAtualizado(),
  "iniciante-masculino": emptyTournament(),
});

function categoryName(id: string) {
  return id.replace(/[-_]+/g, " ").replace(/\b\p{L}/gu, (letter) => letter.toLocaleUpperCase("pt-BR"));
}

function teamName(team?: Team) {
  return team ? `${team.player1} & ${team.player2}` : "Dupla não encontrada";
}

function createRound(teams: Team[], round: number, firstNumber = 1): Match[] {
  const active = teams.filter((team) => !team.eliminated);
  const matches: Match[] = [];

  if (active.length === 2) {
    return [{
      id: `${round}-final-${active[0].id}-${active[1].id}`, number: firstNumber,
      round, bracket: "principal",
      sourceA: { type: "team", ref: active[0].id }, sourceB: { type: "team", ref: active[1].id },
    }];
  }

  ([0, 1] as const).forEach((losses) => {
    const pool = active.filter((team) => team.losses === losses).sort((a, b) => a.seed - b.seed);
    for (let index = 0; index + 1 < pool.length; index += 2) {
      matches.push({
        id: `${round}-${losses}-${pool[index].id}-${pool[index + 1].id}`, number: firstNumber + matches.length,
        round,
        bracket: losses === 0 ? "principal" : "repescagem",
        sourceA: { type: "team", ref: pool[index].id },
        sourceB: { type: "team", ref: pool[index + 1].id },
      });
    }
    if (pool.length % 2 === 1) {
      const team = pool[pool.length - 1];
      matches.push({
        id: `${round}-${losses}-bye-${team.id}`,
        number: firstNumber + matches.length,
        round,
        bracket: losses === 0 ? "principal" : "repescagem",
        sourceA: { type: "team", ref: team.id },
        sourceB: { type: "team", ref: team.id },
        winner: team.id,
        bye: true,
      });
    }
  });

  return matches;
}

function createFirstPhase(teams: Team[]): Match[] {
  const ordered = [...teams].sort((a, b) => a.seed - b.seed);
  const matches: Match[] = [];
  for (let index = 0; index + 1 < ordered.length; index += 2) {
    const number = matches.length + 1;
    matches.push({
      id: `jogo-${number}`,
      number,
      round: 1,
      bracket: "principal",
      sourceA: { type: "team", ref: ordered[index].id },
      sourceB: { type: "team", ref: ordered[index + 1].id },
    });
  }
  if (ordered.length % 2 === 1) {
    const team = ordered[ordered.length - 1];
    const number = matches.length + 1;
    matches.push({
      id: `jogo-${number}-folga`, number, round: 1, bracket: "principal",
      sourceA: { type: "team", ref: team.id }, sourceB: { type: "team", ref: team.id },
      winner: team.id, bye: true,
    });
  }
  return matches;
}

function ensureFirstPhase(tournament: Tournament): Tournament {
  if (tournament.teams.length < 2) return tournament;
  const firstPhase = tournament.matches.filter((match) => match.round === 1);
  const hasResult = firstPhase.some((match) => match.winner && !match.bye && match.sourceA.ref !== match.sourceB.ref);
  const represented = new Set(firstPhase.flatMap((match) => [match.sourceA.ref, match.sourceB.ref]));
  const isComplete = tournament.teams.every((team) => represented.has(team.id));
  if (tournament.matches.length && (hasResult || isComplete)) return tournament;
  return { ...tournament, started: true, round: 1, matches: createFirstPhase(tournament.teams) };
}

export default function TournamentPage() {
  const [category, setCategory] = useState<CategoryId>("misto-escolinha");
  const [data, setData] = useState<Record<CategoryId, Tournament>>(initialData);
  const [player1, setPlayer1] = useState("");
  const [player2, setPlayer2] = useState("");
  const [hydrated, setHydrated] = useState(false);
  const [syncStatus, setSyncStatus] = useState<"loading" | "synced" | "offline" | "saving">("loading");

  const categories = useMemo(
    () => Object.keys(data).map((id) => ({ id, name: categoryName(id), description: "Categoria cadastrada na planilha" })),
    [data],
  );

  useEffect(() => {
    let active = true;
    async function loadShared() {
      try {
        const response = await fetch("/api/tournament", { cache: "no-store" });
        if (!response.ok) throw new Error("indisponível");
        const result = await response.json();
        if (active && result.data && Object.keys(result.data).length) {
          const prepared = Object.fromEntries(
            Object.entries(result.data as Record<CategoryId, Tournament>).map(([id, item]) => [id, ensureFirstPhase(item)]),
          );
          setData(prepared);
          setCategory((current) => prepared[current] ? current : Object.keys(prepared)[0]);
        }
        if (active) setSyncStatus("synced");
      } catch {
        const saved = window.localStorage.getItem(storageKey);
        if (saved && active) try { setData(JSON.parse(saved)); } catch { /* usa a chave inicial */ }
        if (active) setSyncStatus("offline");
      } finally { if (active) setHydrated(true); }
    }
    loadShared();
    const timer = window.setInterval(loadShared, 10000);
    return () => { active = false; window.clearInterval(timer); };
  }, []);

  useEffect(() => {
    if (hydrated) window.localStorage.setItem(storageKey, JSON.stringify(data));
  }, [data, hydrated]);

  async function saveShared(nextData: Record<CategoryId, Tournament>) {
    setSyncStatus("saving");
    try {
      const response = await fetch("/api/tournament", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ data: nextData }) });
      if (!response.ok) throw new Error("não salvou");
      setSyncStatus("synced");
    } catch { setSyncStatus("offline"); }
  }

  const tournament = data[category] || emptyTournament();
  const categoryInfo = categories.find((item) => item.id === category) || { id: category, name: categoryName(category), description: "Categoria cadastrada na planilha" };
  const activeTeams = tournament.teams.filter((team) => !team.eliminated);
  const currentMatches = tournament.matches.filter((match) => match.round === tournament.round);
  const roundComplete = currentMatches.length > 0 && currentMatches.every((match) => match.winner);

  const standings = useMemo(
    () => [...tournament.teams].sort((a, b) => Number(a.eliminated) - Number(b.eliminated) || a.losses - b.losses || a.seed - b.seed),
    [tournament.teams],
  );

  function updateTournament(next: Tournament) {
    setData((current) => {
      const nextData = { ...current, [category]: next };
      window.localStorage.setItem(storageKey, JSON.stringify(nextData));
      void saveShared(nextData);
      return nextData;
    });
  }

  function resolveSource(source: MatchSource): string | undefined {
    if (source.type === "team") return source.ref;
    const origin = tournament.matches.find((item) => item.number === Number(source.ref));
    if (!origin?.winner) return undefined;
    if (source.type === "winner") return origin.winner;
    const originA = resolveSource(origin.sourceA);
    const originB = resolveSource(origin.sourceB);
    return originA === origin.winner ? originB : originA;
  }

  function sourceLabel(source: MatchSource) {
    if (source.type === "team") return teamName(tournament.teams.find((team) => team.id === source.ref));
    return `${source.type === "winner" ? "Vencedor" : "Perdedor"} do Jogo ${source.ref}`;
  }

  function addTeam(event: FormEvent) {
    event.preventDefault();
    if (!player1.trim() || !player2.trim() || tournament.started) return;
    const team: Team = {
      id: crypto.randomUUID(), player1: player1.trim(), player2: player2.trim(),
      seed: tournament.teams.length + 1, losses: 0, eliminated: false,
    };
    updateTournament({ ...tournament, teams: [...tournament.teams, team] });
    setPlayer1(""); setPlayer2("");
  }

  function moveTeam(index: number, direction: -1 | 1) {
    if (tournament.started) return;
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= tournament.teams.length) return;
    const teams = [...tournament.teams];
    [teams[index], teams[nextIndex]] = [teams[nextIndex], teams[index]];
    updateTournament({ ...tournament, teams: teams.map((team, seed) => ({ ...team, seed: seed + 1 })) });
  }

  function removeTeam(id: string) {
    if (tournament.started) return;
    const teams = tournament.teams.filter((team) => team.id !== id).map((team, seed) => ({ ...team, seed: seed + 1 }));
    updateTournament({ ...tournament, teams });
  }

  function startTournament() {
    if (tournament.teams.length < 2) return;
    const round = 1;
    updateTournament({ ...tournament, started: true, round, matches: createFirstPhase(tournament.teams) });
  }

  function selectWinner(matchId: string, winnerId: string) {
    const match = tournament.matches.find((item) => item.id === matchId);
    if (!match || match.winner) return;
    const resolvedTeamA = resolveSource(match.sourceA);
    const resolvedTeamB = resolveSource(match.sourceB);
    if (!resolvedTeamA || !resolvedTeamB) return;
    const loserId = resolvedTeamA === winnerId ? resolvedTeamB : resolvedTeamA;
    const teams = tournament.teams.map((team) => {
      if (team.id !== loserId) return team;
      const losses = team.losses + 1;
      return { ...team, losses, eliminated: losses >= 2 };
    });
    let matches = tournament.matches.map((item) => item.id === matchId ? { ...item, winner: winnerId } : item);
    const currentPhase = matches.filter((item) => item.round === match.round);
    const phaseFinished = currentPhase.length > 0 && currentPhase.every((item) => item.winner);

    if (phaseFinished) {
      const alive = teams.filter((team) => !team.eliminated);
      if (alive.length === 1) {
        updateTournament({ ...tournament, teams, matches, champion: alive[0].id, runnerUp: loserId });
        return;
      }
      const nextRoundNumber = Math.max(...matches.map((item) => item.number), 0) + 1;
      const followingRound = match.round + 1;
      if (!matches.some((item) => item.round === followingRound)) {
        matches = [...matches, ...createRound(teams, followingRound, nextRoundNumber)];
      }
      updateTournament({ ...tournament, teams, matches, round: followingRound });
      return;
    }
    updateTournament({ ...tournament, teams, matches });
  }

  function resetTournament() {
    if (!window.confirm(`Reiniciar a categoria ${categoryInfo.name}? Todos os resultados serão apagados.`)) return;
    updateTournament(emptyTournament());
  }

  return (
    <main className="tournament-page">
      <header className="tournament-header">
        <Link href="/" aria-label="Voltar para o site do CT">
          <Image src="/brand/logo-horizontal-branca.png" alt="CT Vai na Fita" width={190} height={70} priority />
        </Link>
        <div>
          <span className="tournament-kicker">CAMPEONATO CT VAI NA FITA</span>
          <h1>Chaveamento do torneio</h1>
          <p>Duas vidas na areia: a dupla só é eliminada após a segunda derrota.</p>
        </div>
      </header>

      <nav className="category-tabs" aria-label="Categorias do torneio">
        {categories.map((item) => (
          <button key={item.id} className={category === item.id ? "active" : ""} onClick={() => setCategory(item.id)}>
            <strong>{item.name}</strong><span>{item.description}</span>
          </button>
        ))}
      </nav>

      <section className="tournament-summary">
        <div><span>Categoria</span><strong>{categoryInfo.name}</strong></div>
        <div><span>Duplas</span><strong>{tournament.teams.length}</strong></div>
        <div><span>Na disputa</span><strong>{activeTeams.length}</strong></div>
        <div><span>Rodada</span><strong>{tournament.round || "—"}</strong></div>
        <div><span>Dados</span><strong>{syncStatus === "synced" ? "Compartilhados" : syncStatus === "saving" ? "Salvando…" : syncStatus === "loading" ? "Carregando…" : "Modo local"}</strong></div>
      </section>

      {!tournament.started ? (
        <section className="setup-grid">
          <div className="panel">
            <div className="panel-heading"><span className="step-number">1</span><div><h2>Adicionar duplas</h2><p>Digite os atletas na ordem atual da competição.</p></div></div>
            <form className="team-form" onSubmit={addTeam}>
              <label>Atleta 1<input value={player1} onChange={(e) => setPlayer1(e.target.value)} placeholder="Nome do primeiro atleta" /></label>
              <span className="team-plus">+</span>
              <label>Atleta 2<input value={player2} onChange={(e) => setPlayer2(e.target.value)} placeholder="Nome do segundo atleta" /></label>
              <button className="primary-action" type="submit">Adicionar dupla</button>
            </form>
          </div>

          <div className="panel">
            <div className="panel-heading"><span className="step-number">2</span><div><h2>Definir ordem</h2><p>Use as setas para reproduzir a ordem oficial.</p></div></div>
            {tournament.teams.length ? <ol className="seed-list">
              {tournament.teams.map((team, index) => <li key={team.id}>
                <span className="seed">{index + 1}</span><strong>{teamName(team)}</strong>
                <div className="seed-actions">
                  <button onClick={() => moveTeam(index, -1)} disabled={index === 0} aria-label="Subir dupla">↑</button>
                  <button onClick={() => moveTeam(index, 1)} disabled={index === tournament.teams.length - 1} aria-label="Descer dupla">↓</button>
                  <button className="remove" onClick={() => removeTeam(team.id)} aria-label="Remover dupla">×</button>
                </div>
              </li>)}
            </ol> : <div className="empty-state"><span>🏐</span><p>As duplas adicionadas aparecerão aqui.</p></div>}
            <button className="start-action" onClick={startTournament} disabled={tournament.teams.length < 2}>Montar chave com {tournament.teams.length} duplas <span>→</span></button>
          </div>
        </section>
      ) : (
        <>
          {tournament.champion ? (
            <section className="podium-panel">
              <span className="trophy">🏆</span><p>CAMPEÕES • {categoryInfo.name}</p>
              <h2>{teamName(tournament.teams.find((team) => team.id === tournament.champion))}</h2>
              {tournament.runnerUp && <span>Vice-campeões: {teamName(tournament.teams.find((team) => team.id === tournament.runnerUp))}</span>}
              <button className="secondary-action" onClick={resetTournament}>Criar novo torneio</button>
            </section>
          ) : (
            <section className="bracket-section">
              <div className="bracket-title"><div><span>RODADA {tournament.round}</span><h2>Partidas atuais</h2></div><div className="legend"><span><i className="life life-green" />0 derrotas</span><span><i className="life life-yellow" />1 derrota</span></div></div>
              <p className="gesture-hint">Arraste para os lados e use dois dedos para aproximar ou afastar.</p>
              <div className="bracket-scroll" tabIndex={0} aria-label="Chaveamento com rolagem horizontal">
              <div className="bracket-zoom-content">
              <div className="bracket-columns bracket-path">
                {Array.from(new Set(tournament.matches.map((match) => match.round))).sort((a, b) => a - b).map((round, roundIndex, rounds) => {
                  const matches = tournament.matches.filter((match) => match.round === round).sort((a, b) => a.number - b.number);
                  const phaseName = roundIndex === rounds.length - 1 ? "Final" : roundIndex === rounds.length - 2 ? "Semifinal" : `Fase ${round}`;
                  return <div className="bracket-column phase-column" key={round}>
                    <div className="column-heading"><span>FASE {round}</span><h3>{phaseName}</h3></div>
                    {matches.length ? matches.map((match) => {
                      const teamIds = [resolveSource(match.sourceA), resolveSource(match.sourceB)];
                      const sources = [match.sourceA, match.sourceB];
                      const isBye = Boolean(match.bye) || (match.sourceA.type === "team" && match.sourceB.type === "team" && match.sourceA.ref === match.sourceB.ref);
                      const dependent = sources.some((source) => source.type !== "team");
                      if (isBye) {
                        const team = tournament.teams.find((item) => item.id === teamIds[0]);
                        return <div className="match-card bye-match" key={match.id}>
                          <span className="match-label">FOLGA • {match.bracket === "repescagem" ? "REPESCAGEM" : "CHAVE PRINCIPAL"}</span>
                          <div className="waiting-team"><span className="seed">{team?.seed}</span><strong>{teamName(team)}</strong><span className="loss-badge">AVANÇA</span></div>
                        </div>;
                      }
                      return <div className={`match-card ${match.bracket} ${dependent ? "dependent-match" : ""}`} key={match.id}>
                      <span className="match-label">JOGO {match.number} • {match.bracket === "repescagem" ? "REPESCAGEM" : "CHAVE PRINCIPAL"}</span>
                      <p className="match-route">Jogo {match.number} — {sourceLabel(match.sourceA)} × {sourceLabel(match.sourceB)}</p>
                      {teamIds.map((teamId, sourceIndex) => {
                        if (!teamId) return <div className="waiting-team" key={`waiting-${sourceIndex}`}><span className="seed">?</span><strong>{sourceLabel(sources[sourceIndex])}</strong><span className="loss-badge">AGUARDANDO</span></div>;
                        const team = tournament.teams.find((item) => item.id === teamId)!;
                        return <button key={teamId} className={match.winner === teamId ? "winner" : match.winner ? "loser" : ""} onClick={() => selectWinner(match.id, teamId)} disabled={Boolean(match.winner)}>
                          <span className="seed">{team.seed}</span><strong>{teamName(team)}</strong><span className="loss-badge">{team.losses}D</span>
                        </button>;
                      })}
                      {!match.winner && <small>{teamIds.every(Boolean) ? "Toque na dupla vencedora" : "Aguardando o jogo anterior"}</small>}
                    </div>}) : <div className="bracket-empty">Nenhuma partida nesta chave agora.</div>}
                  </div>;
                })}
              </div>
              </div>
              </div>
              {roundComplete && <p className="phase-auto-note">Fase concluída — preparando automaticamente os próximos jogos.</p>}
            </section>
          )}

          <section className="standings-panel">
            <div className="panel-heading"><span className="step-number">{tournament.champion ? "✓" : tournament.round}</span><div><h2>Situação das duplas</h2><p>Acompanhe vidas, eliminações e classificação.</p></div></div>
            <div className="standings-table">
              {standings.map((team) => <div className={team.eliminated ? "eliminated" : ""} key={team.id}>
                <span className="seed">{team.seed}</span><strong>{teamName(team)}</strong>
                <span className={`status ${team.eliminated ? "out" : team.losses ? "warning" : "safe"}`}>{team.eliminated ? "Eliminada" : team.losses ? "1 vida" : "2 vidas"}</span>
              </div>)}
            </div>
            {!tournament.champion && <button className="reset-link" onClick={resetTournament}>Reiniciar esta categoria</button>}
          </section>
        </>
      )}
      <footer className="tournament-footer"><span>CT VAI NA FITA</span><p>Chaveamento compartilhado e atualizado automaticamente.</p></footer>
    </main>
  );
}
