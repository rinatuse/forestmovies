<script setup lang="ts">
import { NCard, NIcon } from 'naive-ui'
import { FilmOutline } from '@vicons/ionicons5'
import type { Movie } from '@/stores/movies'

defineProps<{
  movie: Movie
}>()
</script>

<template>
  <RouterLink :to="{ name: 'movie-detail', params: { id: movie.id } }">
    <n-card :bordered="false">
      <div class="poster">
        <img
          v-if="movie.poster_path"
          :src="`https://image.tmdb.org/t/p/w185${movie.poster_path}`"
          :alt="movie.title"
          loading="lazy"
        />
        <div v-else class="no-poster">
          <n-icon :component="FilmOutline" size="36" />
          <span>Постер недоступен</span>
        </div>
        <div v-if="movie.overview" class="overview">
          <p>{{ movie.overview }}</p>
        </div>
      </div>
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

a:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 4px;
}

:deep(.n-card) {
  height: 100%;
  background-color: var(--color-surface);
}

.poster {
  position: relative;
  width: calc(100% + 48px);
  margin: -20px -24px 12px;
  aspect-ratio: 2 / 3;
  overflow: hidden;
}

.poster img {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
  transition: transform 0.5s ease;
}

a:hover .poster img {
  transform: scale(1.05);
}

h3 {
  height: 2.8em;
  line-height: 1.4em;
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

.overview {
  position: absolute;
  inset: 0;
  padding: 16px;
  display: flex;
  align-items: flex-end;
  background: linear-gradient(
    to top,
    rgba(21, 18, 23, 0.95),
    rgba(21, 18, 23, 0.75) 60%,
    rgba(21, 18, 23, 0.2)
  );
  opacity: 0;
  transition: opacity 0.2s ease;
  pointer-events: none;
}

.overview p {
  margin: 0;
  color: var(--color-text);
  font-size: 13px;
  line-height: 1.5;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 6;
  line-clamp: 6;
  -webkit-box-orient: vertical;
}

a:hover .overview {
  opacity: 1;
  transition-delay: 0.4s;
}

.no-poster {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  background: linear-gradient(155deg, var(--color-surface), var(--color-bg));
  color: var(--color-text-muted);
}

.no-poster span {
  font-family: var(--font-display);
  font-size: 12px;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}
</style>
