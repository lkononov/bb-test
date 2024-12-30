<template>
    <div class="mg-c-parallax__container">
        <div
            v-for="(layer, index) in layers"
            :key="index"
            class="mg-c-parallax__layer"
            :style="{
                transform: `translate(${layer.offsetX}px, ${layer.offsetY}px) scale(${layer.scale})`,
                backgroundImage: `url(${layer.image})`,
            }"
        />
    </div>
</template>

<script>
import eventBus from '@/composables/useEventBus';

export default {
    data() {
        return {
            layers: [
                {
                    image: '/images/map.webp',
                    speed: 0.2,
                    scale: 1.1,
                    offsetX: 0,
                    offsetY: 0,
                },
                {
                    image: '/images/ct_t.png',
                    speed: 0.6,
                    scale: 1.1,
                    offsetX: 0,
                    offsetY: 0,
                },
            ],
            mouseX: 0,
            mouseY: 0,
        };
    },
    mounted() {
        this.$watch(
            () => [eventBus.evMove],
            ([evMove]) => {
                if (!evMove) {
                    return;
                }

                this.onMove(evMove);
            },
        );
    },
    methods: {
        onMove(event) {
            const centerX = window.innerWidth / 2;
            const centerY = window.innerHeight / 2;

            this.mouseX = (event.clientX - centerX) / centerX;
            this.mouseY = (event.clientY - centerY) / centerY;

            this.updateLayerOffsets();
        },
        updateLayerOffsets() {
            this.layers = this.layers.map((layer) => ({
                ...layer,
                offsetX: this.mouseX * layer.speed * 50,
                offsetY: this.mouseY * layer.speed * 50,
            }));
        },
    },
};
</script>
