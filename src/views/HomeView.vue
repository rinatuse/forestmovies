<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useMoviesStore } from '@/stores/movies'
import { watch, ref, onMounted, computed } from 'vue'
import SearchBar from '@/components/SearchBar.vue'
import MovieCardSkeleton from '@/components/MovieCardSkeleton.vue'
import MovieCard from '@/components/MovieCard.vue'
import { useDebounceFn } from '@vueuse/core'
import { useVirtualizer } from '@tanstack/vue-virtual'

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

const virtualizerOptions = computed(() => ({
  count: movies.value.length,
  getScrollElement: () => scrollContainer.value,
  estimateSize: () => 320,
  overscan: 5,
}))

const rowVirtualizer = useVirtualizer(virtualizerOptions)
const virtualItems = computed(() => rowVirtualizer.value.getVirtualItems())
const totalSize = computed(() => rowVirtualizer.value.getTotalSize())

watch(virtualItems, (items) => {
  const lastItem = items.at(-1)
  if (!lastItem) return

  if (lastItem.index >= movies.value.length - 5) {
    fetchNextPage()
  }
})

onMounted(() => {
  fetchMovies()
})
</script>

<template>
  <div>
    <SearchBar v-model="searchQuery" />
    <ul v-if="loading && movies.length === 0">
      <MovieCardSkeleton v-for="n in 8" :key="n" />
    </ul>
    <p v-else-if="error">{{ error }}</p>
    <template v-else>
      <div ref="scrollContainer" style="height: 800px; overflow-y: auto; position: relative">
        <div :style="{ height: totalSize + 'px', position: 'relative' }">
          <div
            v-for="virtualItem in virtualItems"
            :key="virtualItem.index"
            :style="{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: virtualItem.size + 'px',
              transform: `translateY(${virtualItem.start}px)`,
            }"
          >
            <MovieCard :movie="movies[virtualItem.index]!" />
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped></style>
