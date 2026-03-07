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
    locked: (row.locked as boolean) ?? false,
    password: (row.password as string) ?? null,
  };
}

function competitionToDb(comp: Competition) {
  return {
    id: comp.id,
    type: comp.type,
    year: comp.year,
    date: comp.date,
    locked: comp.locked,
    password: comp.password,
  };
}

function resultFromDb(row: Record<string, unknown>): Result {
  return {
    id: row.id as string,
    playerId: row.player_id as string,
    competitionId: row.competition_id as string,
    round1: row.round1 as number | null,
    round2: row.round2 as number | null,
    rozstrel: (row.rozstrel as number | null) ?? null,
    total: row.total as number,
    categoryAtTime: (row.category_at_time as Result['categoryAtTime']) ?? 'chlapci-do-15',
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
    rozstrel: result.rozstrel,
    total: result.total,
    category_at_time: result.categoryAtTime,
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
    delete: (id: string): void => {
      playersCache = playersCache.filter(p => p.id !== id);
      supabase.from('players').delete().eq('id', id).then(({ error }) => {
        if (error) console.error('Supabase delete player error:', error);
      });
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
    update: (competition: Competition): void => {
      const index = competitionsCache.findIndex(c => c.id === competition.id);
      if (index !== -1) {
        competitionsCache[index] = competition;
        supabase.from('competitions').update(competitionToDb(competition)).eq('id', competition.id).then(({ error }) => {
          if (error) console.error('Supabase update competition error:', error);
        });
      }
    },
    delete: (id: string): void => {
      competitionsCache = competitionsCache.filter(c => c.id !== id);
      supabase.from('competitions').delete().eq('id', id).then(({ error }) => {
        if (error) console.error('Supabase delete competition error:', error);
      });
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
    delete: (id: string): void => {
      resultsCache = resultsCache.filter(r => r.id !== id);
      supabase.from('results').delete().eq('id', id).then(({ error }) => {
        if (error) console.error('Supabase delete result error:', error);
      });
    },
    deleteByPlayerId: (playerId: string): void => {
      resultsCache = resultsCache.filter(r => r.playerId !== playerId);
      supabase.from('results').delete().eq('player_id', playerId).then(({ error }) => {
        if (error) console.error('Supabase delete results by player error:', error);
      });
    },
    deleteByCompetitionId: (competitionId: string): void => {
      resultsCache = resultsCache.filter(r => r.competitionId !== competitionId);
      supabase.from('results').delete().eq('competition_id', competitionId).then(({ error }) => {
        if (error) console.error('Supabase delete results by competition error:', error);
      });
    },
  },
};
