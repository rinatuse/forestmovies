<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useMoviesStore } from '@/stores/movies'
import { watch, ref, onMounted } from 'vue'
import SearchBar from '@/components/SearchBar.vue'
import MovieCard from '@/components/MovieCard.vue'
import { useDebounceFn } from '@vueuse/core'
import MovieCardSkeleton from '@/components/MovieCardSkeleton.vue'

const store = useMoviesStore()

const { movies, loading, error } = storeToRefs(store)
const { fetchMovies } = store

const searchQuery = ref('')
const debouncedFetchMovies = useDebounceFn((query: string) => {
  fetchMovies(query)
}, 400)

watch(searchQuery, (newQuery) => {
  debouncedFetchMovies(newQuery)
})

onMounted(() => {
  fetchMovies()
})
</script>

<template>
  <div>
    <SearchBar v-model="searchQuery" />
    <ul v-if="loading">
      <MovieCardSkeleton v-for="n in 8" :key="n" />
    </ul>
    <p v-else-if="error">{{ error }}</p>
    <ul v-else>
      <MovieCard v-for="movie in movies" :key="movie.id" :movie="movie" />
    </ul>
  </div>
</template>

<style scoped></style>
