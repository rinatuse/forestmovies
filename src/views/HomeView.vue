<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useMoviesStore } from '@/stores/movies'
import { watch, ref, onMounted, computed } from 'vue'
import SearchBar from '@/components/SearchBar.vue'
import MovieCardSkeleton from '@/components/MovieCardSkeleton.vue'
import MovieCard from '@/components/MovieCard.vue'
import { useDebounceFn, useElementSize, useScroll } from '@vueuse/core'
import { measureElement, useVirtualizer } from '@tanstack/vue-virtual'
import { NIcon } from 'naive-ui'
import { ChevronUpOutline } from '@vicons/ionicons5'
import { useRoute } from 'vue-router'

const store = useMoviesStore()

const { movies, loading, error, genres } = storeToRefs(store)
const { fetchMovies, fetchNextPage, fetchGenres } = store

const searchQuery = ref('')
const debouncedFetchMovies = useDebounceFn((query: string) => {
  fetchMovies(query)
}, 400)

watch(searchQuery, (newQuery) => {
  selectedGenreId.value = null
  debouncedFetchMovies(newQuery)
})

const scrollContainer = ref<HTMLElement | null>(null)
const { y: scrollY } = useScroll(scrollContainer)
const showScrollTop = computed(() => scrollY.value > 800)
const gridWrapper = ref<HTMLElement | null>(null)
const measureRef = ref<HTMLElement | null>(null)
const { width: containerWidth } = useElementSize(measureRef)
const selectedGenreId = ref<number | null>(null)
const route = useRoute()

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

function selectGenre(genreId: number) {
  if (selectedGenreId.value === genreId) {
    selectedGenreId.value = null
  } else {
    selectedGenreId.value = genreId
  }
  searchQuery.value = ''
  fetchMovies('', 1, selectedGenreId.value)
}

function scrollToTop() {
  scrollContainer.value?.scrollTo({ top: 0, behavior: 'smooth' })
}

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
  const genreFromUrl = route.query.genre ? Number(route.query.genre) : null
  if (genreFromUrl) {
    selectedGenreId.value = genreFromUrl
  }
  fetchMovies('', 1, genreFromUrl)
  fetchGenres()
})
</script>

<template>
  <div style="display: flex; flex-direction: column; height: 100vh">
    <header class="marquee">
      <h1>Forest<span>Movies</span></h1>
    </header>
    <div class="search-wrapper">
      <SearchBar v-model="searchQuery" />
      <div v-if="genres.length" class="genre-chips">
        <button
          v-for="genre in genres"
          :key="genre.id"
          class="genre-chip"
          :class="{ 'genre-chip--active': selectedGenreId === genre.id }"
          @click="selectGenre(genre.id)"
        >
          {{ genre.name }}
        </button>
      </div>
    </div>
    <div ref="measureRef" class="measure-line"></div>
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
      <button class="error-retry" @click="fetchMovies(searchQuery, 1, selectedGenreId)">
        Попробовать снова
      </button>
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
        <div v-if="loading && movies.length > 0" class="loading-more">
          <span class="spinner"></span>
          Загружаем ещё...
        </div>
      </div>
    </template>
  </div>
  <button v-if="showScrollTop" class="scroll-top-btn" @click="scrollToTop" aria-label="Наверх">
    <n-icon :component="ChevronUpOutline" size="24" />
  </button>
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

.measure-line {
  height: 0;
  overflow: hidden;
  width: 100%;
  max-width: 1600px;
  margin: 0 auto;
  padding: 0 24px;
  box-sizing: border-box;
}

.scroll-top-btn {
  position: fixed;
  bottom: 32px;
  right: 32px;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: none;
  background: var(--color-accent);
  color: var(--color-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
  transition: transform 0.15s ease;
}

.scroll-top-btn:hover {
  transform: translateY(-3px);
}

.genre-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}

.genre-chip {
  padding: 6px 16px;
  background: transparent;
  border: 1px solid var(--color-text-muted);
  border-radius: 20px;
  color: var(--color-text-muted);
  font-family: var(--font-display);
  font-size: 12px;
  letter-spacing: 0.03em;
  text-transform: uppercase;
  cursor: pointer;
  transition:
    border-color 0.2s ease,
    color 0.2s ease,
    background-color 0.2s ease;
}

.genre-chip:hover {
  border-color: var(--color-accent);
  color: var(--color-text);
}

.genre-chip--active {
  background: var(--color-accent);
  border-color: var(--color-accent);
  color: var(--color-bg);
}

.loading-more {
  max-width: 1600px;
  margin: 0 auto;
  padding: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: var(--color-text-muted);
  font-family: var(--font-display);
  font-size: 13px;
  letter-spacing: 0.03em;
  text-transform: uppercase;
}

.spinner {
  width: 18px;
  height: 18px;
  border: 2px solid var(--color-text-muted);
  border-top-color: var(--color-accent);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 640px) {
  .genre-chips {
    flex-wrap: nowrap;
    overflow-x: auto;
    padding-bottom: 8px;
    scrollbar-width: thin;
    scrollbar-color: var(--color-accent) var(--color-surface);
  }

  .genre-chips::-webkit-scrollbar {
    height: 6px;
  }

  .genre-chips::-webkit-scrollbar-thumb {
    background-color: var(--color-accent);
    border-radius: 6px;
  }

  .genre-chip {
    flex-shrink: 0;
  }
}
</style>
