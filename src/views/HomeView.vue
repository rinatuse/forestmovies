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
const { width: containerWidth } = useElementSize(scrollContainer)
const CARD_WIDTH = 220
const columnCount = computed(() => Math.max(1, Math.floor(containerWidth.value / CARD_WIDTH)))

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
    <SearchBar v-model="searchQuery" />
    <ul v-if="loading && movies.length === 0">
      <MovieCardSkeleton v-for="n in 8" :key="n" />
    </ul>
    <p v-else-if="error">{{ error }}</p>
    <template v-else>
      <div
        ref="scrollContainer"
        style="flex: 1; min-height: 0; overflow-y: auto; position: relative"
      >
        <div :style="{ height: totalSize + 'px', position: 'relative' }">
          <div
            v-for="virtualItem in virtualItems"
            :key="virtualItem.index"
            :data-index="virtualItem.index"
            :ref="(el) => rowVirtualizer.measureElement(el as Element)"
            :style="{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              transform: `translateY(${virtualItem.start}px)`,
              display: 'grid',
              gridTemplateColumns: `repeat(${columnCount}, 1fr)`,
              gap: '12px',
              paddingBottom: '12px',
            }"
          >
            <MovieCard v-for="movie in rows[virtualItem.index]" :key="movie.id" :movie="movie" />
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped></style>
