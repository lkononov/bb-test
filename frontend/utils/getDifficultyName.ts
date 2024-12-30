import type { GameDifficultyNames } from '~/types/MemoryGame';

export function getDifficultyName(defficulty: GameDifficultyNames): string {
    switch (defficulty) {
        case 'easy':
            return 'Łatwy';
        case 'medium':
            return 'Średni';
        case 'hard':
            return 'Trudny';
        default:
            return 'Standard';
    }
}
