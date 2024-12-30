export type GameHistory = {
    date: Date;
    difficulty: string;
    attempts: number;
    time: string;
    success: boolean;
};

export interface Card {
    id: string;
    image: string;
    rarity: string;
    isMatched: boolean;
}

export type GameDifficultyNames = 'easy' | 'medium' | 'hard';

export type GameDifficulty = {
    cards: number;
    cardsPerRow: number;
};

export type RarityColors = Record<string, [string, string, string]>;
