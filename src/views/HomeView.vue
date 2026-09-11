<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useMoviesStore } from '@/stores/movies'
import { watch, ref, onMounted, computed } from 'vue'
import SearchBar from '@/components/SearchBar.vue'
import MovieCardSkeleton from '@/components/MovieCardSkeleton.vue'
import MovieCard from '@/components/MovieCard.vue'
import { useDebounceFn, useElementSize } from '@vueuse/core'
import { measureElement, useVirtualizer } from '@tanstack/vue-virtual'

const store = useMoviesStore()

const { movies, loading, error } = storeToRefs(store)
const { fetchMovies, fetchNextPage } = store

const searchQuery = ref('')
const debouncedFetchMovies = useDebounceFn((query: string) => {
  fetchMovies(query)
}, 400)

watch(searchQuery, (newQuery) => {
  debouncedFetchMovies(newQuery)
})

const scrollContainer = ref<HTMLElement | null>(null)
const gridWrapper = ref<HTMLElement | null>(null)
const { width: containerWidth } = useElementSize(gridWrapper)
const CARD_WIDTH = 220
const columnCount = computed(() =>
  Math.min(8, Math.max(1, Math.floor(containerWidth.value / CARD_WIDTH))),
)

const rows = computed(() => {
  const result: (typeof movies.value)[] = []
  for (let i = 0; i < movies.value.length; i += columnCount.value) {
    result.push(movies.value.slice(i, i + columnCount.value))
  }
  return result
})

const virtualizerOptions = computed(() => ({
  count: rows.value.length,
  getScrollElement: () => scrollContainer.value,
  estimateSize: () => 320,
  overscan: 5,
  measureElement,
}))

const rowVirtualizer = useVirtualizer(virtualizerOptions)
const virtualItems = computed(() => rowVirtualizer.value.getVirtualItems())
const totalSize = computed(() => rowVirtualizer.value.getTotalSize())

watch(virtualItems, (items) => {
  const lastItem = items.at(-1)
  if (!lastItem) return

  if (lastItem.index >= rows.value.length - 1) {
    fetchNextPage()
  }
})

onMounted(() => {
  fetchMovies()
})
</script>

<template>
  <div style="display: flex; flex-direction: column; height: 100vh">
    <header class="marquee">
      <h1>Forest<span>Movies</span></h1>
    </header>
    <div class="search-wrapper">
      <SearchBar v-model="searchQuery" />
    </div>
    <ul
      v-if="loading && movies.length === 0"
      class="skeleton-grid"
      :style="{ gridTemplateColumns: `repeat(${columnCount}, 1fr)` }"
    >
      <MovieCardSkeleton v-for="n in 8" :key="n" />
    </ul>
    <div v-else-if="error" class="error-state">
      <p class="error-title">Сеанс не состоится</p>
      <p class="error-subtitle">{{ error }}</p>
      <button class="error-retry" @click="fetchMovies(searchQuery)">Попробовать снова</button>
    </div>
    <div v-else-if="movies.length === 0 && searchQuery" class="empty-state">
      <p class="empty-title">В прокате такого нет</p>
      <div class="empty-divider"></div>
      <p class="empty-subtitle">Проверьте название или попробуйте другой запрос</p>
    </div>
    <template v-else>
      <div
        ref="scrollContainer"
        class="scroll-container"
        style="flex: 1; min-height: 0; overflow-y: auto; position: relative; padding: 0 24px"
      >
        <div
          ref="gridWrapper"
          :style="{
            height: totalSize + 'px',
            position: 'relative',
            maxWidth: '1600px',
            margin: '0 auto',
          }"
        >
          <div
            v-for="virtualItem in virtualItems"
            :key="virtualItem.index"
            :data-index="virtualItem.index"
            :ref="(el) => rowVirtualizer.measureElement(el as Element)"
            :style="{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              transform: `translateY(${virtualItem.start}px)`,
              display: 'grid',
              gridTemplateColumns: `repeat(${columnCount}, 1fr)`,
              gap: '12px',
              paddingBottom: '12px',
              paddingLeft: '24px',
              paddingRight: '24px',
              boxSizing: 'border-box',
            }"
          >
            <MovieCard v-for="movie in rows[virtualItem.index]" :key="movie.id" :movie="movie" />
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.marquee {
  padding: 24px 24px 16px;
  text-align: center;
}

.marquee h1 {
  margin: 0;
  font-family: var(--font-display);
  font-size: 32px;
  font-weight: 700;
  letter-spacing: 0.04em;
  color: var(--color-text);
}

.marquee span {
  color: var(--color-accent);
}

.scroll-container {
  scrollbar-width: thin;
  scrollbar-color: var(--color-accent) var(--color-surface);
}

.scroll-container::-webkit-scrollbar {
  width: 10px;
}

.scroll-container::-webkit-scrollbar-track {
  background: var(--color-surface);
}

.scroll-container::-webkit-scrollbar-thumb {
  background-color: var(--color-accent);
  border-radius: 6px;
  border: 2px solid var(--color-surface);
}
.search-wrapper {
  width: 100%;
  max-width: 1600px;
  margin: 0 auto;
  padding: 0 24px 16px;
  box-sizing: border-box;
}

.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 24px;
}

.empty-title {
  margin: 0;
  font-family: var(--font-display);
  font-size: 28px;
  font-weight: 700;
  letter-spacing: 0.03em;
  text-transform: uppercase;
  color: var(--color-text);
}

.empty-divider {
  width: 160px;
  height: 0;
  margin: 20px 0;
  border-top: 2px dashed var(--color-accent);
}

.empty-subtitle {
  margin: 0;
  color: var(--color-text-muted);
  font-size: 15px;
}

.skeleton-grid {
  display: grid;
  gap: 12px;
  padding: 0 24px;
  margin: 0 auto;
  width: 100%;
  max-width: 1600px;
  list-style: none;
  box-sizing: border-box;
}

.error-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 24px;
  gap: 12px;
}

.error-title {
  margin: 0;
  font-family: var(--font-display);
  font-size: 28px;
  font-weight: 700;
  letter-spacing: 0.03em;
  text-transform: uppercase;
  color: var(--color-text);
}

.error-subtitle {
  margin: 0;
  color: var(--color-text-muted);
  font-size: 14px;
}

.error-retry {
  margin-top: 12px;
  padding: 10px 28px;
  background: var(--color-accent);
  color: var(--color-bg);
  border: none;
  border-radius: 4px;
  font-family: var(--font-display);
  font-weight: 500;
  letter-spacing: 0.03em;
  text-transform: uppercase;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.error-retry:hover {
  background-color: #f5bb5e;
}
</style>
