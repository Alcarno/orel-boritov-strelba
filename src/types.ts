export type Category = 'chlapci-do-15' | 'divky-do-15' | 'muzi-od-16' | 'zeny-od-16';

export type CompetitionType = 'jarni' | 'podzimni';

export interface Player {
  id: string;
  name: string;
  category: Category;
  createdAt: string;
}

export interface Competition {
  id: string;
  type: CompetitionType;
  year: number;
  date: string;
  locked: boolean;
  password: string | null;
}

export interface Result {
  id: string;
  playerId: string;
  competitionId: string;
  round1: number | null; // 0-50
  round2: number | null; // 0-50
  rozstrel: number | null; // 0-50, tiebreaker
  total: number; // round1 + round2 (rozstrel se nepřičítá)
  categoryAtTime: Category;
  createdAt: string;
}

export const ALLOWED_TRANSFERS: Partial<Record<Category, Category>> = {
  'chlapci-do-15': 'muzi-od-16',
  'divky-do-15': 'zeny-od-16',
};

export interface PlayerWithResults extends Player {
  results: Result[];
}

export interface CategoryResult {
  player: Player;
  result: Result;
  position: number;
}

export interface PoolTieGroup {
  total: number;
  players: { player: Player; result: Result; category: Category }[];
}

export interface PoolInfo {
  name: string;
  categories: [Category, Category];
  ties: PoolTieGroup[];
}

export interface CompetitionResults {
  competition: Competition;
  categoryResults: {
    [key in Category]: CategoryResult[];
  };
  absoluteWinners: {
    player: Player;
    result: Result;
  }[];
  pools: PoolInfo[];
  allResultsComplete: boolean;
}

export const CATEGORY_POOLS: { name: string; categories: [Category, Category] }[] = [
  { name: 'Dospělí', categories: ['muzi-od-16', 'zeny-od-16'] },
  { name: 'Mládež', categories: ['chlapci-do-15', 'divky-do-15'] },
];

export const CATEGORY_LABELS: Record<Category, string> = {
  'chlapci-do-15': 'Chlapci do 14,99 let',
  'divky-do-15': 'Dívky do 14,99 let',
  'muzi-od-16': 'Muži od 15 let',
  'zeny-od-16': 'Ženy od 15 let',
};

export const COMPETITION_TYPE_LABELS: Record<CompetitionType, string> = {
  'jarni': 'Jarní střelby',
  'podzimni': 'Podzimní střelby',
};




