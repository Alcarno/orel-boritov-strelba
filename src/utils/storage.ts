import { Player, Competition, Result } from '../types';
import { supabase } from './supabase';

let playersCache: Player[] = [];
let competitionsCache: Competition[] = [];
let resultsCache: Result[] = [];

// DB row -> TypeScript object mappers

function playerFromDb(row: Record<string, unknown>): Player {
  return {
    id: row.id as string,
    name: row.name as string,
    category: row.category as Player['category'],
    createdAt: row.created_at as string,
  };
}

function playerToDb(player: Player) {
  return {
    id: player.id,
    name: player.name,
    category: player.category,
    created_at: player.createdAt,
  };
}

function competitionFromDb(row: Record<string, unknown>): Competition {
  return {
    id: row.id as string,
    type: row.type as Competition['type'],
    year: row.year as number,
    date: row.date as string,
  };
}

function competitionToDb(comp: Competition) {
  return {
    id: comp.id,
    type: comp.type,
    year: comp.year,
    date: comp.date,
  };
}

function resultFromDb(row: Record<string, unknown>): Result {
  return {
    id: row.id as string,
    playerId: row.player_id as string,
    competitionId: row.competition_id as string,
    round1: row.round1 as number,
    round2: row.round2 as number,
    total: row.total as number,
    createdAt: row.created_at as string,
  };
}

function resultToDb(result: Result) {
  return {
    id: result.id,
    player_id: result.playerId,
    competition_id: result.competitionId,
    round1: result.round1,
    round2: result.round2,
    total: result.total,
    created_at: result.createdAt,
  };
}

export async function initStorage(): Promise<void> {
  const [playersRes, competitionsRes, resultsRes] = await Promise.all([
    supabase.from('players').select('*'),
    supabase.from('competitions').select('*'),
    supabase.from('results').select('*'),
  ]);

  if (playersRes.error) throw new Error(`Failed to load players: ${playersRes.error.message}`);
  if (competitionsRes.error) throw new Error(`Failed to load competitions: ${competitionsRes.error.message}`);
  if (resultsRes.error) throw new Error(`Failed to load results: ${resultsRes.error.message}`);

  playersCache = (playersRes.data || []).map(playerFromDb);
  competitionsCache = (competitionsRes.data || []).map(competitionFromDb);
  resultsCache = (resultsRes.data || []).map(resultFromDb);
}

export const storage = {
  players: {
    getAll: (): Player[] => playersCache,
    save: (players: Player[]): void => {
      playersCache = players;
    },
    add: (player: Player): void => {
      playersCache.push(player);
      supabase.from('players').insert(playerToDb(player)).then(({ error }) => {
        if (error) console.error('Supabase insert player error:', error);
      });
    },
    update: (player: Player): void => {
      const index = playersCache.findIndex(p => p.id === player.id);
      if (index !== -1) {
        playersCache[index] = player;
        supabase.from('players').update(playerToDb(player)).eq('id', player.id).then(({ error }) => {
          if (error) console.error('Supabase update player error:', error);
        });
      }
    },
    getById: (id: string): Player | undefined => {
      return playersCache.find(p => p.id === id);
    },
  },

  competitions: {
    getAll: (): Competition[] => competitionsCache,
    save: (competitions: Competition[]): void => {
      competitionsCache = competitions;
    },
    add: (competition: Competition): void => {
      competitionsCache.push(competition);
      supabase.from('competitions').insert(competitionToDb(competition)).then(({ error }) => {
        if (error) console.error('Supabase insert competition error:', error);
      });
    },
    getById: (id: string): Competition | undefined => {
      return competitionsCache.find(c => c.id === id);
    },
  },

  results: {
    getAll: (): Result[] => resultsCache,
    save: (results: Result[]): void => {
      resultsCache = results;
    },
    add: (result: Result): void => {
      resultsCache.push(result);
      supabase.from('results').insert(resultToDb(result)).then(({ error }) => {
        if (error) console.error('Supabase insert result error:', error);
      });
    },
    getByCompetitionId: (competitionId: string): Result[] => {
      return resultsCache.filter(r => r.competitionId === competitionId);
    },
    getByPlayerId: (playerId: string): Result[] => {
      return resultsCache.filter(r => r.playerId === playerId);
    },
    update: (result: Result): void => {
      const index = resultsCache.findIndex(r => r.id === result.id);
      if (index !== -1) {
        resultsCache[index] = result;
        supabase.from('results').update(resultToDb(result)).eq('id', result.id).then(({ error }) => {
          if (error) console.error('Supabase update result error:', error);
        });
      }
    },
  },
};
