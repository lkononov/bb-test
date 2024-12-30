import { ref, onUnmounted } from 'vue';

export function useTimer() {
    const startTime = ref<number | null>(null);
    const currentTime = ref<number | null>(null);
    const interval = ref<NodeJS.Timeout | null>(null);

    const startTimer = () => {
        if (interval.value) {
            return;
        }

        startTime.value = Date.now();
        currentTime.value = Date.now();
        interval.value = setInterval(() => {
            currentTime.value = Date.now();
        }, 100);
    };

    const elapsedTime = computed(() => {
        if (!startTime.value || !currentTime.value) {
            return '00:00:00';
        }

        const elapsed = currentTime.value - startTime.value;
        const hours = String(Math.floor(elapsed / 3600000)).padStart(2, '0');
        const minutes = String(
            Math.floor((elapsed % 3600000) / 60000),
        ).padStart(2, '0');
        const seconds = String(Math.floor((elapsed % 60000) / 1000)).padStart(
            2,
            '0',
        );
        return `${hours}:${minutes}:${seconds}`;
    });

    const stopTimer = () => {
        if (interval.value) {
            clearInterval(interval.value);
            interval.value = null;
        }
    };

    const resetTimer = () => {
        stopTimer();
        startTime.value = null;
        currentTime.value = null;
    };

    onUnmounted(() => {
        stopTimer();
    });

    return { elapsedTime, startTimer, stopTimer, resetTimer };
}
