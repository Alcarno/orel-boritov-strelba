import { Category, Player, Result, Competition } from '../types';
import { storage } from './storage';

export interface CategoryMaxResult {
  category: Category;
  maxScore: number;
  player: Player;
  competition: Competition;
  result: Result;
}

export interface CompetitionPlayerCount {
  competition: Competition;
  playerCount: number;
  perCategory: Partial<Record<Category, number>>;
}

export interface Statistics {
  categoryMaxResults: CategoryMaxResult[];
  overallMaxResult: {
    maxScore: number;
    player: Player;
    competition: Competition;
    result: Result;
  } | null;
  totalPlayers: number;
  totalCompetitions: number;
  totalResults: number;
  playersPerCompetition: CompetitionPlayerCount[];
}

export function calculateStatistics(): Statistics {
  const players = storage.players.getAll();
  const competitions = storage.competitions.getAll();
  const results = storage.results.getAll();

  const categoryMaxResults: CategoryMaxResult[] = [];
  const categories: Category[] = ['chlapci-do-15', 'divky-do-15', 'muzi-od-16', 'zeny-od-16'];

  categories.forEach(category => {
    const categoryPlayers = players.filter(p => p.category === category);
    let maxScore = -1;
    let maxResult: Result | null = null;
    let maxPlayer: Player | null = null;
    let maxCompetition: Competition | null = null;

    categoryPlayers.forEach(player => {
      const playerResults = results.filter(r => r.playerId === player.id);
      playerResults.forEach(result => {
        if (result.total > maxScore) {
          maxScore = result.total;
          maxResult = result;
          maxPlayer = player;
          maxCompetition = competitions.find(c => c.id === result.competitionId) || null;
        }
      });
    });

    if (maxResult && maxPlayer && maxCompetition) {
      categoryMaxResults.push({
        category,
        maxScore,
        player: maxPlayer,
        competition: maxCompetition,
        result: maxResult,
      });
    }
  });

  // Overall max result
  let overallMaxScore = -1;
  let overallMaxResult: Result | null = null;
  let overallMaxPlayer: Player | null = null;
  let overallMaxCompetition: Competition | null = null;

  results.forEach(result => {
    if (result.total > overallMaxScore) {
      overallMaxScore = result.total;
      overallMaxResult = result;
      overallMaxPlayer = players.find(p => p.id === result.playerId) || null;
      overallMaxCompetition = competitions.find(c => c.id === result.competitionId) || null;
    }
  });

  const playersPerCompetition: CompetitionPlayerCount[] = competitions
    .map(comp => {
      const compResults = results.filter(r => r.competitionId === comp.id);
      const uniquePlayerIds = new Set(compResults.map(r => r.playerId));
      const perCategory: Partial<Record<Category, number>> = {};
      compResults.forEach(r => {
        const cat = r.categoryAtTime || players.find(p => p.id === r.playerId)?.category;
        if (cat) perCategory[cat] = (perCategory[cat] || 0) + 1;
      });
      return { competition: comp, playerCount: uniquePlayerIds.size, perCategory };
    })
    .sort((a, b) => {
      if (a.competition.year !== b.competition.year) return b.competition.year - a.competition.year;
      return a.competition.type === 'podzimni' ? -1 : 1;
    });

  return {
    categoryMaxResults,
    overallMaxResult: overallMaxResult && overallMaxPlayer && overallMaxCompetition
      ? {
          maxScore: overallMaxScore,
          player: overallMaxPlayer,
          competition: overallMaxCompetition,
          result: overallMaxResult,
        }
      : null,
    totalPlayers: players.length,
    totalCompetitions: competitions.length,
    totalResults: results.length,
    playersPerCompetition,
  };
}



