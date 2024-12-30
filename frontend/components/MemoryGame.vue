<template>
    <div ref="container" class="mg-c-game__container">
        <div class="mg-c-game__meta">
            <div v-if="!gameState.gameInProcess" class="mg-c-game__actions">
                <DifficultyButton
                    difficulty="easy"
                    title="Łatwy"
                    @set-difficulty="handleDifficultyChange"
                />
                <DifficultyButton
                    difficulty="medium"
                    title="Średni"
                    @set-difficulty="handleDifficultyChange"
                />
                <DifficultyButton
                    difficulty="hard"
                    title="Trudny"
                    @set-difficulty="handleDifficultyChange"
                />
            </div>
            <div v-if="gameState.gameInProcess" class="mg-c-game__actions">
                <button class="mg-c-button" @click="resetGame">Resetuj</button>
            </div>
            <div class="mg-c-game__stats">
                <div class="mg-c-game__meta-info">
                    Czas gry: {{ elapsedTime }}
                </div>
                <div class="mg-c-game__meta-info">
                    Liczba prób: {{ numberOfAttempts }}
                </div>
            </div>
        </div>

        <canvas ref="canvas" @click="handleClick" />
        <GameHistory />
    </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted, toRefs } from 'vue';
import { getItemRarity, availableCardsSet } from '@/utils/cardsSet';
import { getDifficultyName } from '@/utils/getDifficultyName';

import type {
    Card,
    GameDifficultyNames,
    GameDifficulty,
} from '@/types/MemoryGame';

const { elapsedTime, startTimer, stopTimer, resetTimer } = useTimer();
const { saveGameHistory } = useHistory();

const canvas = ref<HTMLCanvasElement | null>(null);
const container = ref<HTMLDivElement | null>(null);
const shuffledCards = ref<Card[]>([]);
const gameDate = ref<Date | null>(null);

let currentGameDifficulty: GameDifficultyNames = 'easy';
let flippedCardContent: Array<Card> = [];

const { initCanvas, drawSingleCard, calcDimentions } = useDrawer(
    container,
    canvas,
    shuffledCards,
);

const cards: Card[] = [];

availableCardsSet.forEach((weaponeId, index) => {
    cards.push({
        id: `${weaponeId}_${index}`,
        image: `/images/wp_${weaponeId}.png`,
        rarity: getItemRarity(weaponeId),
        isMatched: false,
    });
    cards.push({
        id: `${weaponeId}_${index + 1}`,
        image: `/images/wp_${weaponeId}.png`,
        rarity: getItemRarity(weaponeId),
        isMatched: false,
    });
});

const gameSettings = {
    easy: {
        cards: 12,
        cardsPerRow: 4,
    },
    medium: {
        cards: 16,
        cardsPerRow: 4,
    },
    hard: {
        cards: 24,
        cardsPerRow: 6,
    },
};

const gameState = reactive({
    matchedPairs: 0,
    numberOfAttempts: 0,
    gameInProcess: false,
});

const { matchedPairs, numberOfAttempts, gameInProcess } = toRefs(gameState);

onMounted(() => {
    const gameDifficulty = getGameDifficulty();
    shuffle(gameDifficulty.cards);
    initCanvas(gameDifficulty, flippedCardContent);
});

function shuffle(count: number): void {
    const array = cards.slice(0, count);

    for (let i = array.length - 2; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }

    array.forEach((card) => {
        card.isMatched = false;
    });
    shuffledCards.value = array;
}

function handleDifficultyChange(level: GameDifficultyNames) {
    resetGameValues();
    currentGameDifficulty = level;
    const gameDifficulty = getGameDifficulty();
    shuffle(gameDifficulty.cards);
    initCanvas(gameDifficulty, flippedCardContent);
    resetTimer();
}

function resetGame() {
    if (!isGameFinished()) {
        saveGameHistory({
            date: gameDate.value!,
            difficulty: getDifficultyName(currentGameDifficulty),
            attempts: numberOfAttempts.value,
            time: elapsedTime.value,
            success: false,
        });
    }

    resetGameValues();
    const gameDifficulty = getGameDifficulty();
    shuffle(gameDifficulty.cards);
    initCanvas(gameDifficulty, flippedCardContent);
    resetTimer();
}

function resetGameValues() {
    numberOfAttempts.value = 0;
    matchedPairs.value = 0;
    gameInProcess.value = false;
    gameDate.value = null;
    flippedCardContent = [];
}

function handleClick(event: MouseEvent) {
    if (!isGameFinished()) {
        startTimer();
    }

    gameDate.value = new Date();
    gameInProcess.value = true;

    const gameDifficulty = getGameDifficulty();
    const { cardDimension } = calcDimentions(gameDifficulty);

    const rect = canvas.value!.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    let clickedCardIndex = -1;
    const clickedCard = shuffledCards.value.find((card, index) => {
        const cardX = (index % gameDifficulty.cardsPerRow) * cardDimension;
        const cardY =
            Math.floor(index / gameDifficulty.cardsPerRow) * cardDimension;

        clickedCardIndex = index;
        return (
            x >= cardX &&
            x <= cardX + cardDimension &&
            y >= cardY &&
            y <= cardY + cardDimension &&
            !card.isMatched
        );
    });

    if (
        !clickedCard ||
        clickedCardIndex < 0 ||
        flippedCardContent.length === 2 ||
        flippedCardContent.some((card) => card.id === clickedCard.id)
    ) {
        return;
    }

    playOpenAudio();
    flippedCardContent.push(clickedCard);

    if (flippedCardContent[0]?.image === flippedCardContent[1]?.image) {
        flippedCardContent.forEach((card) => {
            card.isMatched = true;
        });
        matchedPairs.value++;
        numberOfAttempts.value++;
        playSuccessAudio();
        flippedCardContent = [];
    } else if (flippedCardContent.length === 2) {
        numberOfAttempts.value++;
        setTimeout(() => {
            const cardsToHide = [...flippedCardContent];
            flippedCardContent = [];
            cardsToHide.forEach((card) => {
                const cardIndex = shuffledCards.value.findIndex(
                    (shuffledCard) => shuffledCard.id === card.id,
                );
                drawSingleCard(
                    card,
                    cardIndex,
                    gameDifficulty.cardsPerRow,
                    cardDimension,
                    flippedCardContent,
                );
            });
        }, 300);
    }

    if (isGameFinished()) {
        stopTimer();
        saveGameHistory({
            date: gameDate.value,
            difficulty: getDifficultyName(currentGameDifficulty),
            attempts: numberOfAttempts.value,
            time: elapsedTime.value,
            success: true,
        });
        gameDate.value = null;
        gameInProcess.value = false;
    }

    drawSingleCard(
        clickedCard,
        clickedCardIndex!,
        gameDifficulty.cardsPerRow,
        cardDimension,
        flippedCardContent,
    );
}

function getGameDifficulty(): GameDifficulty {
    return gameSettings[currentGameDifficulty];
}

function isGameFinished() {
    return matchedPairs.value === gameSettings[currentGameDifficulty].cards / 2;
}

const playSuccessAudio = () => {
    const successAudio = new Audio('/sounds/success.mp3');
    successAudio.volume = 0.1;
    successAudio.play();
};

const playOpenAudio = () => {
    const clickAudio = new Audio('/sounds/click.mp3');
    clickAudio.volume = 0.1;
    clickAudio.play();
};
</script>
