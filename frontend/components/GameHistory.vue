<template>
    <div class="mg-c-history__container">
        <h3 class="mg-c-history__title">Historia gier</h3>
        <div v-if="!history.rows.length" class="mg-c-history__no-history">
            Brak historii
        </div>
        <div
            v-for="row in history.rows"
            :key="row.date.toString()"
            class="mg-c-history__table-body"
        >
            <div class="mg-c-history__table-row">
                <span class="mg-c-history__table-row-title">Data gry:</span>
                {{
                    new Date(row.date).toLocaleString('pl-PL', {
                        timeZone: 'Europe/Warsaw',
                    })
                }}
            </div>
            <div class="mg-c-history__table-row">
                <span class="mg-c-history__table-row-title">
                    Poziom trudności:
                </span>
                {{ row.difficulty }}
            </div>
            <div class="mg-c-history__table-row">
                <span class="mg-c-history__table-row-title">Liczba prób:</span>
                {{ row.attempts }}
            </div>
            <div class="mg-c-history__table-row">
                <span class="mg-c-history__table-row-title">Czas gry:</span>
                {{ row.time }}
            </div>
            <div class="mg-c-history__table-row">
                <span class="mg-c-history__table-row-title">Wygrana:</span>
                {{ row.success ? 'Tak' : 'Nie' }}
            </div>
            <hr class="mg-c-history__underline" />
        </div>
    </div>
</template>

<script lang="ts" setup>
const { history } = useHistory();
</script>
