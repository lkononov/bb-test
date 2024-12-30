<template>
    <div @mousemove="onMove">
        <BackgroundsLayers v-show="!isMobile" />
        <BackgroundsLayersMobile v-show="isMobile" />
        <MemoryGame />
    </div>
</template>
<script setup>
import eventBus from '@/composables/useEventBus';

const { isMobile } = useIsMobile();

const onMove = (event) => {
    eventBus.evMove = event;
};
</script>
