<script setup lang="ts">
import { watch } from 'vue'
import { useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useMoviesStore } from '@/stores/movies'

const route = useRoute()
const store = useMoviesStore()
const { movieDetail, loading, error } = storeToRefs(store)
const { fetchMovieDetail } = store

watch(
  () => route.params.id,
  (newId) => {
    fetchMovieDetail(newId as string)
  },
  { immediate: true },
)
</script>

<template>
  <p v-if="loading">Загрузка...</p>
  <p v-else-if="error">{{ error }}</p>
  <div v-else-if="movieDetail">
    <h1>{{ movieDetail.title }}</h1>
    <p v-if="movieDetail.tagline">{{ movieDetail.tagline }}</p>
    <p>{{ movieDetail.overview }}</p>
    <p>
      {{ movieDetail.release_date }} · {{ movieDetail.runtime }} мин · ⭐
      {{ movieDetail.vote_average.toFixed(1) }}
    </p>
    <p>{{ movieDetail.genres.map((g) => g.name).join(', ') }}</p>
  </div>
</template>
