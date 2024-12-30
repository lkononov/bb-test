import { onMounted, reactive } from 'vue';
import { useLocalStorage } from '@/utils/useLocalStorage';
import type { GameHistory } from '@/types/MemoryGame';

const LS_HISTORY_KEY = 'gameHistory';

const history = reactive({
    rows: [] as Array<GameHistory>,
});

export function useHistory() {
    const { getItem, setItem } = useLocalStorage();

    function saveGameHistory(gameData: GameHistory) {
        if (!gameData.date || !gameData.time) {
            return;
        }

        let gameHistory = getItem<Array<GameHistory>>(LS_HISTORY_KEY) || [];

        if (gameHistory.length) {
            gameHistory.unshift(gameData);
        } else {
            gameHistory = [gameData];
        }
        history.rows = gameHistory;

        setItem<Array<GameHistory>>(LS_HISTORY_KEY, gameHistory);
    }

    onMounted(() => {
        const gameHistory = getItem<Array<GameHistory>>(LS_HISTORY_KEY);
        if (gameHistory) {
            history.rows = gameHistory;
        }
    });

    return { history, saveGameHistory };
}
