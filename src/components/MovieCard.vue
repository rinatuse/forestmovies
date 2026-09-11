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
      <div class="meta">
        <span class="date">{{ movie.release_date }}</span>
        <span class="rating">{{ movie.vote_average.toFixed(1) }}</span>
      </div>
    </n-card>
  </RouterLink>
</template>

<style scoped>
a {
  min-width: 0;
  height: 100%;
  overflow: hidden;
  display: block;
}

a,
a:visited {
  color: inherit;
  text-decoration: none;
}

a:hover img {
  transform: scale(1.05);
}

:deep(.n-card) {
  height: 100%;
}

img {
  width: calc(100% + 48px);
  margin: -20px -24px 12px;
  aspect-ratio: 2 / 3;
  height: auto;
  display: block;
  object-fit: cover;
  transition: transform 0.5s ease;
}

h3 {
  min-height: 2.8em;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  font-family: var(--font-display);
  font-weight: 500;
  letter-spacing: 0.02em;
  text-transform: uppercase;
}

.meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.date {
  color: var(--color-text-muted);
  font-size: 13px;
}

.rating {
  background: var(--color-accent);
  color: var(--color-bg);
  font-weight: 700;
  font-size: 13px;
  padding: 2px 10px 2px 8px;
  border-radius: 10px 3px 3px 10px;
  border-right: 2px dashed var(--color-bg);
}
</style>
