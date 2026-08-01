"use client";

import Image from "next/image";
import { FormEvent, useEffect, useMemo, useState } from "react";

type CategoryId = "misto-escolinha" | "iniciante-masculino";
type Team = { id: string; player1: string; player2: string; seed: number; losses: number; eliminated: boolean };
type Match = { id: string; round: number; bracket: "principal" | "repescagem"; teamA: string; teamB: string; winner?: string };
type Tournament = { teams: Team[]; matches: Match[]; round: number; started: boolean; champion?: string; runnerUp?: string };

const categories: { id: CategoryId; name: string; description: string }[] = [
  { id: "misto-escolinha", name: "Misto Escolinha", description: "Categoria mista para alunos da escolinha" },
  { id: "iniciante-masculino", name: "Iniciante Masculino", description: "Categoria masculina nível iniciante" },
];

const emptyTournament = (): Tournament => ({ teams: [], matches: [], round: 0, started: false });
const storageKey = "ct-vai-na-fita-torneio-v2";

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
    { id: "fase1-gisele-pietra", round: 1, bracket: "principal", teamA: "gisele-mello", teamB: "pietra-tinoco", winner: "gisele-mello" },
    { id: "fase1-nathalia-brenda", round: 1, bracket: "principal", teamA: "nathalia-chokito", teamB: "brenda-sunny", winner: "brenda-sunny" },
    { id: "fase1-malu-dalila", round: 1, bracket: "principal", teamA: "malu-belas", teamB: "dalila-denis", winner: "dalila-denis" },
    { id: "fase1-maria-veronica", round: 1, bracket: "principal", teamA: "maria-clara-pk", teamB: "veronica-miguel", winner: "maria-clara-pk" },
    { id: "fase1-thais-tays", round: 1, bracket: "principal", teamA: "thais-daniel", teamB: "tays-renan", winner: "thais-daniel" },
    { id: "fase2-nathalia-gisele", round: 2, bracket: "principal", teamA: "nathalia-max", teamB: "gisele-mello" },
    { id: "fase2-brenda-dalila", round: 2, bracket: "principal", teamA: "brenda-sunny", teamB: "dalila-denis" },
    { id: "fase2-thamires-maria", round: 2, bracket: "principal", teamA: "thamires-renan", teamB: "maria-clara-pk" },
    { id: "fase2-mariana-thais", round: 2, bracket: "principal", teamA: "mariana-lucas", teamB: "thais-daniel" },
    { id: "repescagem-nathalia-malu", round: 2, bracket: "repescagem", teamA: "nathalia-chokito", teamB: "malu-belas" },
    { id: "repescagem-veronica-tays", round: 2, bracket: "repescagem", teamA: "veronica-miguel", teamB: "tays-renan" },
  ],
});

const initialData = (): Record<CategoryId, Tournament> => ({
  "misto-escolinha": mistoEscolinhaAtualizado(),
  "iniciante-masculino": emptyTournament(),
});

function teamName(team?: Team) {
  return team ? `${team.player1} & ${team.player2}` : "Dupla não encontrada";
}

function createRound(teams: Team[], round: number): Match[] {
  const active = teams.filter((team) => !team.eliminated);
  const matches: Match[] = [];

  ([0, 1] as const).forEach((losses) => {
    const pool = active.filter((team) => team.losses === losses).sort((a, b) => a.seed - b.seed);
    for (let index = 0; index + 1 < pool.length; index += 2) {
      matches.push({
        id: `${round}-${losses}-${pool[index].id}-${pool[index + 1].id}`,
        round,
        bracket: losses === 0 ? "principal" : "repescagem",
        teamA: pool[index].id,
        teamB: pool[index + 1].id,
      });
    }
  });

  if (!matches.length && active.length === 2) {
    matches.push({
      id: `${round}-final-${active[0].id}-${active[1].id}`,
      round,
      bracket: "principal",
      teamA: active[0].id,
      teamB: active[1].id,
    });
  }
  return matches;
}

export default function TournamentPage() {
  const [category, setCategory] = useState<CategoryId>("misto-escolinha");
  const [data, setData] = useState<Record<CategoryId, Tournament>>(initialData);
  const [player1, setPlayer1] = useState("");
  const [player2, setPlayer2] = useState("");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem(storageKey);
    if (saved) {
      try { setData(JSON.parse(saved)); } catch { /* mantém uma chave nova */ }
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) window.localStorage.setItem(storageKey, JSON.stringify(data));
  }, [data, hydrated]);

  const tournament = data[category];
  const categoryInfo = categories.find((item) => item.id === category)!;
  const activeTeams = tournament.teams.filter((team) => !team.eliminated);
  const currentMatches = tournament.matches.filter((match) => match.round === tournament.round);
  const roundComplete = currentMatches.length > 0 && currentMatches.every((match) => match.winner);

  const standings = useMemo(
    () => [...tournament.teams].sort((a, b) => Number(a.eliminated) - Number(b.eliminated) || a.losses - b.losses || a.seed - b.seed),
    [tournament.teams],
  );

  function updateTournament(next: Tournament) {
    setData((current) => ({ ...current, [category]: next }));
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
    updateTournament({ ...tournament, started: true, round, matches: createRound(tournament.teams, round) });
  }

  function selectWinner(matchId: string, winnerId: string) {
    const match = tournament.matches.find((item) => item.id === matchId);
    if (!match || match.winner) return;
    const loserId = match.teamA === winnerId ? match.teamB : match.teamA;
    const teams = tournament.teams.map((team) => {
      if (team.id !== loserId) return team;
      const losses = team.losses + 1;
      return { ...team, losses, eliminated: losses >= 2 };
    });
    const matches = tournament.matches.map((item) => item.id === matchId ? { ...item, winner: winnerId } : item);
    updateTournament({ ...tournament, teams, matches });
  }

  function nextRound() {
    if (!roundComplete) return;
    const alive = tournament.teams.filter((team) => !team.eliminated);
    if (alive.length === 1) {
      const lastMatch = [...tournament.matches].reverse().find((match) => match.winner);
      const runnerUpId = lastMatch ? (lastMatch.teamA === alive[0].id ? lastMatch.teamB : lastMatch.teamA) : undefined;
      updateTournament({ ...tournament, champion: alive[0].id, runnerUp: runnerUpId });
      return;
    }
    const round = tournament.round + 1;
    updateTournament({ ...tournament, round, matches: [...tournament.matches, ...createRound(tournament.teams, round)] });
  }

  function resetTournament() {
    if (!window.confirm(`Reiniciar a categoria ${categoryInfo.name}? Todos os resultados serão apagados.`)) return;
    updateTournament(emptyTournament());
  }

  return (
    <main className="tournament-page">
      <header className="tournament-header">
        <a href="/" aria-label="Voltar para o site do CT">
          <Image src="/brand/logo-horizontal-branca.png" alt="CT Vai na Fita" width={190} height={70} priority />
        </a>
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
              <div className="bracket-columns">
                {(["principal", "repescagem"] as const).map((bracket) => {
                  const matches = currentMatches.filter((match) => match.bracket === bracket);
                  return <div className={`bracket-column ${bracket}`} key={bracket}>
                    <div className="column-heading"><span>{bracket === "principal" ? "CHAVE PRINCIPAL" : "REPESCAGEM"}</span><h3>{bracket === "principal" ? "Duplas invictas" : "Última chance"}</h3></div>
                    {matches.length ? matches.map((match, index) => <div className="match-card" key={match.id}>
                      <span className="match-label">JOGO {index + 1}</span>
                      {[match.teamA, match.teamB].map((teamId) => {
                        const team = tournament.teams.find((item) => item.id === teamId)!;
                        return <button key={teamId} className={match.winner === teamId ? "winner" : match.winner ? "loser" : ""} onClick={() => selectWinner(match.id, teamId)} disabled={Boolean(match.winner)}>
                          <span className="seed">{team.seed}</span><strong>{teamName(team)}</strong><span className="loss-badge">{team.losses}D</span>
                        </button>;
                      })}
                      {!match.winner && <small>Toque na dupla vencedora</small>}
                    </div>) : <div className="bracket-empty">Nenhuma partida nesta chave agora.</div>}
                  </div>;
                })}
              </div>
              {roundComplete && <button className="next-round" onClick={nextRound}>{activeTeams.length === 1 ? "Registrar campeões" : "Avançar para a próxima rodada"} <span>→</span></button>}
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
      <footer className="tournament-footer"><span>CT VAI NA FITA</span><p>Chaveamento salvo automaticamente neste aparelho.</p></footer>
    </main>
  );
}
