<script setup lang="ts">
import { NCard } from 'naive-ui'
import type { Movie } from '@/stores/movies'

defineProps<{
  movie: Movie
}>()
</script>

<template>
  <RouterLink :to="{ name: 'movie-detail', params: { id: movie.id } }">
    <n-card>
      <img
        v-if="movie.poster_path"
        :src="`https://image.tmdb.org/t/p/w185${movie.poster_path}`"
        :alt="movie.title"
        loading="lazy"
      />
      <div v-else class="no-poster">Нет постера</div>
      <h3>{{ movie.title }}</h3>
      <p>{{ movie.release_date }} · ⭐ {{ movie.vote_average.toFixed(1) }}</p>
    </n-card>
  </RouterLink>
</template>
