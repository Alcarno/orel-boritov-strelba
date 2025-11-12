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
}

export interface Result {
  id: string;
  playerId: string;
  competitionId: string;
  round1: number; // 0-50
  round2: number; // 0-50
  total: number; // round1 + round2
  createdAt: string;
}

export interface PlayerWithResults extends Player {
  results: Result[];
}

export interface CategoryResult {
  player: Player;
  result: Result;
  position: number;
}

export interface CompetitionResults {
  competition: Competition;
  categoryResults: {
    [key in Category]: CategoryResult[];
  };
  absoluteWinner: {
    player: Player;
    result: Result;
  } | null;
}

export const CATEGORY_LABELS: Record<Category, string> = {
  'chlapci-do-15': 'Chlapci do 15 let',
  'divky-do-15': 'Dívky do 15 let',
  'muzi-od-16': 'Muži od 16 let',
  'zeny-od-16': 'Ženy od 16 let',
};

export const COMPETITION_TYPE_LABELS: Record<CompetitionType, string> = {
  'jarni': 'Jarní střelby',
  'podzimni': 'Podzimní střelby',
};




