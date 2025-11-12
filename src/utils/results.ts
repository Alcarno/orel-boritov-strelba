import { Player, Competition, Result, Category, CategoryResult, CompetitionResults } from '../types';
import { storage } from './storage';

export function calculateResults(competitionId: string): CompetitionResults {
  const competition = storage.competitions.getById(competitionId);
  if (!competition) {
    throw new Error('Competition not found');
  }

  const results = storage.results.getByCompetitionId(competitionId);
  const players = storage.players.getAll();

  const categoryResults: { [key in Category]: CategoryResult[] } = {
    'chlapci-do-15': [],
    'divky-do-15': [],
    'muzi-od-16': [],
    'zeny-od-16': [],
  };

  // Group results by category
  results.forEach(result => {
    const player = players.find(p => p.id === result.playerId);
    if (!player) return;

    const categoryResultsList = categoryResults[player.category];
    categoryResultsList.push({
      player,
      result,
      position: 0, // Will be set after sorting
    });
  });

  // Sort and assign positions for each category
  Object.keys(categoryResults).forEach(category => {
    const resultsList = categoryResults[category as Category];
    resultsList.sort((a, b) => b.result.total - a.result.total);
    resultsList.forEach((item, index) => {
      item.position = index + 1;
    });
  });

  // Find absolute winner
  let absoluteWinner: { player: Player; result: Result } | null = null;
  let maxTotal = -1;

  results.forEach(result => {
    if (result.total > maxTotal) {
      maxTotal = result.total;
      const player = players.find(p => p.id === result.playerId);
      if (player) {
        absoluteWinner = { player, result };
      }
    }
  });

  return {
    competition,
    categoryResults,
    absoluteWinner,
  };
}

export function getPlayerHistory(playerId: string): Array<{ competition: Competition; result: Result }> {
  const results = storage.results.getByPlayerId(playerId);
  const competitions = storage.competitions.getAll();

  return results
    .map(result => {
      const competition = competitions.find(c => c.id === result.competitionId);
      return competition ? { competition, result } : null;
    })
    .filter((item): item is { competition: Competition; result: Result } => item !== null)
    .sort((a, b) => {
      // Sort by year and type (jarni before podzimni)
      if (a.competition.year !== b.competition.year) {
        return b.competition.year - a.competition.year;
      }
      return a.competition.type === 'jarni' ? -1 : 1;
    });
}




