import { Category, Player, Result, Competition } from '../types';
import { storage } from './storage';
import { COMPETITION_TYPE_LABELS } from '../types';

export interface CategoryMaxResult {
  category: Category;
  maxScore: number;
  player: Player;
  competition: Competition;
  result: Result;
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
  };
}



