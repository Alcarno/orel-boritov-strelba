import { Player, Competition, Result, Category, CategoryResult, CompetitionResults, PoolInfo, PoolTieGroup, CATEGORY_POOLS } from '../types';
import { storage } from './storage';

function getSurname(name: string): string {
  const parts = name.split(',')[0].trim().split(/\s+/);
  return parts[parts.length - 1].toLowerCase();
}

function sortAndAssignPositions(resultsList: CategoryResult[]): void {
  resultsList.sort((a, b) => {
    if (b.result.total !== a.result.total) return b.result.total - a.result.total;
    const rozA = a.result.rozstrel ?? 0;
    const rozB = b.result.rozstrel ?? 0;
    if (rozB !== rozA) return rozB - rozA;
    return getSurname(a.player.name).localeCompare(getSurname(b.player.name), 'cs');
  });

  for (let i = 0; i < resultsList.length; i++) {
    if (i === 0) {
      resultsList[i].position = 1;
      continue;
    }
    const prev = resultsList[i - 1];
    const curr = resultsList[i];
    const sameTotal = curr.result.total === prev.result.total;
    const sameRozstrel = (curr.result.rozstrel ?? 0) === (prev.result.rozstrel ?? 0);

    if (sameTotal && sameRozstrel && prev.position > 3) {
      curr.position = prev.position;
    } else {
      curr.position = i + 1;
    }
  }
}

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

  results.forEach(result => {
    const player = players.find(p => p.id === result.playerId);
    if (!player) return;

    const category = result.categoryAtTime || player.category;
    categoryResults[category].push({
      player,
      result,
      position: 0,
    });
  });

  Object.keys(categoryResults).forEach(category => {
    sortAndAssignPositions(categoryResults[category as Category]);
  });

  const pools: PoolInfo[] = CATEGORY_POOLS.map(poolDef => {
    const poolPlayers: { player: Player; result: Result; category: Category }[] = [];
    for (const cat of poolDef.categories) {
      const top3 = categoryResults[cat].slice(0, 3);
      for (const cr of top3) {
        poolPlayers.push({ player: cr.player, result: cr.result, category: cat });
      }
    }

    const totalGroups = new Map<number, typeof poolPlayers>();
    for (const pp of poolPlayers) {
      const group = totalGroups.get(pp.result.total) || [];
      group.push(pp);
      totalGroups.set(pp.result.total, group);
    }

    const ties: PoolTieGroup[] = [];
    for (const [total, group] of totalGroups) {
      if (group.length > 1) {
        const hasCrossCategory = new Set(group.map(g => g.category)).size > 1;
        if (hasCrossCategory) {
          ties.push({ total, players: group });
        }
      }
    }
    ties.sort((a, b) => b.total - a.total);

    return { name: poolDef.name, categories: poolDef.categories, ties };
  });

  const categoryWinners: { player: Player; result: Result }[] = [];
  Object.values(categoryResults).forEach(catList => {
    if (catList.length > 0 && catList[0].position === 1) {
      categoryWinners.push({ player: catList[0].player, result: catList[0].result });
    }
  });

  categoryWinners.sort((a, b) => {
    if (b.result.total !== a.result.total) return b.result.total - a.result.total;
    return (b.result.rozstrel ?? 0) - (a.result.rozstrel ?? 0);
  });

  let absoluteWinners: { player: Player; result: Result }[] = [];
  if (categoryWinners.length > 0) {
    const best = categoryWinners[0];
    absoluteWinners = categoryWinners.filter(
      item => item.result.total === best.result.total
        && (item.result.rozstrel ?? 0) === (best.result.rozstrel ?? 0)
    );
  }

  return {
    competition,
    categoryResults,
    absoluteWinners,
    pools,
  };
}

export function getPlayerHistory(playerId: string): Array<{ competition: Competition; result: Result; position: number }> {
  const results = storage.results.getByPlayerId(playerId);
  const competitions = storage.competitions.getAll();

  return results
    .map(result => {
      const competition = competitions.find(c => c.id === result.competitionId);
      if (!competition) return null;

      let position = 0;
      try {
        const compResults = calculateResults(competition.id);
        for (const catResults of Object.values(compResults.categoryResults)) {
          const found = catResults.find(cr => cr.player.id === playerId);
          if (found) { position = found.position; break; }
        }
      } catch { /* ignore */ }

      return { competition, result, position };
    })
    .filter((item): item is { competition: Competition; result: Result; position: number } => item !== null)
    .sort((a, b) => {
      const valA = a.competition.year * 2 + (a.competition.type === 'podzimni' ? 1 : 0);
      const valB = b.competition.year * 2 + (b.competition.type === 'podzimni' ? 1 : 0);
      return valB - valA;
    });
}




