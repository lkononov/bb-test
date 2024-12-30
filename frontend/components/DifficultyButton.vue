<template>
    <button :class="computedClass" @click="setDifficulty">
        {{ title }}
    </button>
</template>

<script lang="ts">
export default {
    props: {
        difficulty: {
            type: String,
            required: true,
        },
        title: {
            type: String,
            required: true,
        },
    },
    emits: ['set-difficulty'],
    computed: {
        computedClass() {
            return `mg-c-button__difficulty ${this.$props.difficulty}`;
        },
    },
    methods: {
        setDifficulty() {
            this.$emit('set-difficulty', this.$props.difficulty);
        },
    },
};
</script>
