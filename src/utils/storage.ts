import { Player, Competition, Result } from '../types';

const STORAGE_KEYS = {
  PLAYERS: 'orel_boritov_players',
  COMPETITIONS: 'orel_boritov_competitions',
  RESULTS: 'orel_boritov_results',
};

export const storage = {
  players: {
    getAll: (): Player[] => {
      const data = localStorage.getItem(STORAGE_KEYS.PLAYERS);
      return data ? JSON.parse(data) : [];
    },
    save: (players: Player[]): void => {
      localStorage.setItem(STORAGE_KEYS.PLAYERS, JSON.stringify(players));
    },
    add: (player: Player): void => {
      const players = storage.players.getAll();
      players.push(player);
      storage.players.save(players);
    },
    update: (player: Player): void => {
      const players = storage.players.getAll();
      const index = players.findIndex(p => p.id === player.id);
      if (index !== -1) {
        players[index] = player;
        storage.players.save(players);
      }
    },
    getById: (id: string): Player | undefined => {
      const players = storage.players.getAll();
      return players.find(p => p.id === id);
    },
  },
  competitions: {
    getAll: (): Competition[] => {
      const data = localStorage.getItem(STORAGE_KEYS.COMPETITIONS);
      return data ? JSON.parse(data) : [];
    },
    save: (competitions: Competition[]): void => {
      localStorage.setItem(STORAGE_KEYS.COMPETITIONS, JSON.stringify(competitions));
    },
    add: (competition: Competition): void => {
      const competitions = storage.competitions.getAll();
      competitions.push(competition);
      storage.competitions.save(competitions);
    },
    getById: (id: string): Competition | undefined => {
      const competitions = storage.competitions.getAll();
      return competitions.find(c => c.id === id);
    },
  },
  results: {
    getAll: (): Result[] => {
      const data = localStorage.getItem(STORAGE_KEYS.RESULTS);
      return data ? JSON.parse(data) : [];
    },
    save: (results: Result[]): void => {
      localStorage.setItem(STORAGE_KEYS.RESULTS, JSON.stringify(results));
    },
    add: (result: Result): void => {
      const results = storage.results.getAll();
      results.push(result);
      storage.results.save(results);
    },
    getByCompetitionId: (competitionId: string): Result[] => {
      const results = storage.results.getAll();
      return results.filter(r => r.competitionId === competitionId);
    },
    getByPlayerId: (playerId: string): Result[] => {
      const results = storage.results.getAll();
      return results.filter(r => r.playerId === playerId);
    },
    update: (result: Result): void => {
      const results = storage.results.getAll();
      const index = results.findIndex(r => r.id === result.id);
      if (index !== -1) {
        results[index] = result;
        storage.results.save(results);
      }
    },
  },
};




