<template>
    <div class="mg-c-parallax__container">
        <div
            v-for="(layer, index) in layers"
            :key="index"
            class="mg-c-parallax__layer"
            :style="{
                transform: `translateY(${layer.offsetY}px)`,
                backgroundImage: `url(${layer.image})`,
            }"
        />
    </div>
</template>

<script>
export default {
    data() {
        return {
            layers: [
                { image: '/images/map.webp', speed: 0, offsetY: 0 },
                { image: '/images/ct_t.png', speed: 0.4, offsetY: 0 },
            ],
            lastScrollY: 0,
            ticking: false,
        };
    },
    mounted() {
        window.addEventListener('scroll', this.onScroll);
    },
    beforeUnmount() {
        window.removeEventListener('scroll', this.onScroll);
    },
    methods: {
        onScroll() {
            this.lastScrollY = window.scrollY;

            if (!this.ticking) {
                window.requestAnimationFrame(this.updateParallax);
                this.ticking = true;
            }
        },
        updateParallax() {
            this.layers = this.layers.map((layer) => ({
                ...layer,
                offsetY: this.lastScrollY * layer.speed,
            }));

            this.ticking = false;
        },
    },
};
</script>
