const epic = [1, 2, 4];
const rare = [5, 11, 7, 3];
const common = [9, 10, 6, 8];
const legendary = [12];

export function getItemRarity(weaponeId: number) {
    if (common.includes(weaponeId)) {
        return 'common';
    }
    if (rare.includes(weaponeId)) {
        return 'rare';
    }
    if (epic.includes(weaponeId)) {
        return 'epic';
    }
    return 'legendary';
}

export const availableCardsSet = [...epic, ...rare, ...common, ...legendary];
