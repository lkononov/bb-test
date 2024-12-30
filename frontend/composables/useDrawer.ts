import { ref } from 'vue';
import type { Card, GameDifficulty, RarityColors } from '@/types/MemoryGame';

const rarityColors: RarityColors = {
    common: ['#1e1e1e', '#b8b8b8', '#1e1e1e'],
    rare: ['#1e1e1e', '#0033cc', '#1e1e1e'],
    epic: ['#1e1e1e', '#6600cc', '#1e1e1e'],
    legendary: ['#1e1e1e', '#ff9900', '#1e1e1e'],
    closed: ['#1e1e1e', '#0a0a0a', '#000000'],
};

export function useDrawer(
    container: Ref<HTMLDivElement | null>,
    canvas: Ref<HTMLCanvasElement | null>,
    shuffledCards: Ref<Card[]>,
) {
    const ctx = ref<CanvasRenderingContext2D | null>(null);

    function initCanvas(
        gameDifficulty: GameDifficulty,
        flippedCardContent: Card[],
    ) {
        const { canvasWidth, cardDimension, canvasHeight } =
            calcDimentions(gameDifficulty);

        canvas.value!.width = canvasWidth;
        canvas.value!.height = canvasHeight;
        ctx.value = canvas.value!.getContext('2d')!;

        drawCards(
            canvasWidth,
            canvasHeight,
            gameDifficulty.cardsPerRow,
            cardDimension,
            flippedCardContent,
        );
    }

    function drawCards(
        canvasWidth: number,
        canvasHeight: number,
        maxCardsInRow: number,
        cardDimension: number,
        flippedCardContent: Card[],
    ) {
        ctx.value!.clearRect(0, 0, canvasWidth, canvasHeight);

        shuffledCards.value.forEach((card, index) => {
            drawSingleCard(
                card,
                index,
                maxCardsInRow,
                cardDimension,
                flippedCardContent,
            );
        });
    }

    function drawSingleCard(
        card: Card,
        index: number,
        maxCardsInRow: number,
        cardDimension: number,
        flippedCardContent: Card[],
    ) {
        const x = (index % maxCardsInRow) * cardDimension;
        const y = Math.floor(index / maxCardsInRow) * cardDimension;

        if (
            card.isMatched ||
            flippedCardContent.some((flippedCard) => flippedCard.id === card.id)
        ) {
            drawGradientTile(card.rarity, x, y, cardDimension);
            drawImage(card.image, x, y, cardDimension);
        } else {
            drawGradientTile('closed', x, y, cardDimension);
        }
    }

    function drawGradientTile(
        rarity: string,
        x: number,
        y: number,
        cardDimension: number,
    ) {
        const gradient = ctx.value!.createLinearGradient(
            x,
            y,
            x + cardDimension,
            y + cardDimension,
        );
        const [color1, color2, color3] = rarityColors[rarity];
        gradient.addColorStop(0, color1);
        gradient.addColorStop(0.3, color2);
        gradient.addColorStop(0.6, color2);
        gradient.addColorStop(1, color3);

        ctx.value!.fillStyle = gradient;
        ctx.value!.fillRect(x, y, cardDimension, cardDimension);
    }

    function drawImage(
        imageSrc: string,
        x: number,
        y: number,
        cardDimension: number,
    ) {
        const image = new Image();
        image.src = imageSrc;
        const x16x12dimension = (cardDimension / 16) * 12;
        const xDiff = (cardDimension - x16x12dimension) / 2;
        image.onload = () => {
            ctx.value!.drawImage(
                image,
                x,
                y + xDiff,
                cardDimension,
                x16x12dimension,
            );
        };
    }

    function calcDimentions(gameDifficulty: GameDifficulty) {
        const containerWidth = container.value!.getBoundingClientRect().width;
        const canvasWidth = containerWidth > 800 ? 800 : containerWidth;
        const cardDimension = Math.round(
            canvasWidth / gameDifficulty.cardsPerRow,
        );
        const canvasHeight =
            (gameDifficulty.cards / gameDifficulty.cardsPerRow) *
                cardDimension +
            gameDifficulty.cards / gameDifficulty.cardsPerRow;

        return { canvasWidth, cardDimension, canvasHeight };
    }

    return {
        initCanvas,
        drawCards,
        drawSingleCard,
        drawGradientTile,
        drawImage,
        calcDimentions,
    };
}
