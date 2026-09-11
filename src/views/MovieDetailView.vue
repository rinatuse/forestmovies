<script setup lang="ts">
import { watch, onUnmounted } from 'vue'
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

watch(
  () => movieDetail.value?.title,
  (title) => {
    document.title = title ? `${title} — ForestMovies` : 'ForestMovies — киноафиша'
  },
)

onUnmounted(() => {
  document.title = 'ForestMovies — киноафиша'
})
</script>

<template>
  <div class="detail-page">
    <RouterLink to="/" class="back-link">← Все фильмы</RouterLink>

    <div v-if="loading" class="detail-loading">
      <span class="spinner"></span>
    </div>
    <div v-else-if="error" class="error-state">
      <p class="error-title">Сеанс не состоится</p>
      <p class="error-subtitle">{{ error }}</p>
      <RouterLink to="/" class="error-retry">Вернуться к афише</RouterLink>
    </div>
    <div v-else-if="movieDetail" class="detail-content">
      <div class="detail-poster">
        <img
          v-if="movieDetail.poster_path"
          :src="`https://image.tmdb.org/t/p/w500${movieDetail.poster_path}`"
          :alt="movieDetail.title"
        />
      </div>
      <div class="detail-info">
        <h1>{{ movieDetail.title }}</h1>
        <p v-if="movieDetail.tagline" class="tagline">{{ movieDetail.tagline }}</p>

        <div class="detail-meta">
          <span class="detail-date">{{ movieDetail.release_date }}</span>
          <span v-if="movieDetail.runtime" class="detail-runtime"
            >{{ movieDetail.runtime }} мин</span
          >
          <span class="detail-rating">{{ movieDetail.vote_average.toFixed(1) }}</span>
        </div>

        <div v-if="movieDetail.genres.length" class="detail-genres">
          <RouterLink
            v-for="genre in movieDetail.genres"
            :key="genre.id"
            :to="{ path: '/', query: { genre: genre.id } }"
            class="genre-badge"
          >
            {{ genre.name }}
          </RouterLink>
        </div>

        <p v-if="movieDetail.overview" class="overview">{{ movieDetail.overview }}</p>
        <p v-else class="overview overview--empty">Описание пока недоступно</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.detail-page {
  max-width: 1000px;
  margin: 0 auto;
  padding: 32px 24px;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--color-text-muted);
  text-decoration: none;
  font-family: var(--font-display);
  text-transform: uppercase;
  letter-spacing: 0.03em;
  font-size: 13px;
  margin-bottom: 24px;
  transition: color 0.2s ease;
}

.back-link:hover {
  color: var(--color-accent);
}

.detail-content {
  display: flex;
  flex-wrap: wrap;
  gap: 32px;
}

.detail-poster {
  flex: 0 0 360px;
}

.detail-poster img {
  width: 100%;
  aspect-ratio: 2 / 3;
  object-fit: cover;
  display: block;
  border-radius: 4px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
}

.detail-info {
  flex: 1 1 280px;
}

.detail-info h1 {
  margin: 0 0 8px;
  font-family: var(--font-display);
  font-size: 36px;
  font-weight: 700;
  letter-spacing: 0.03em;
  text-transform: uppercase;
  color: var(--color-text);
}

.tagline {
  margin: 0 0 16px;
  font-style: italic;
  color: var(--color-text-muted);
  font-size: 15px;
}

.detail-meta {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
}

.detail-date,
.detail-runtime {
  color: var(--color-text-muted);
  font-size: 14px;
}

.detail-rating {
  background: var(--color-accent);
  color: var(--color-bg);
  font-weight: 700;
  font-size: 14px;
  padding: 3px 12px 3px 10px;
  border-radius: 10px 3px 3px 10px;
  border-right: 2px dashed var(--color-bg);
}

.detail-genres {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 20px;
}

.overview {
  line-height: 1.6;
  color: var(--color-text);
}

.overview--empty {
  font-style: italic;
  color: var(--color-text-muted);
}

.detail-loading {
  display: flex;
  justify-content: center;
  padding: 80px 0;
}

.detail-loading .spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--color-text-muted);
  border-top-color: var(--color-accent);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 80px 24px;
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
  text-decoration: none;
  display: inline-block;
  transition: background-color 0.2s ease;
}

.error-retry:hover {
  background-color: #f5bb5e;
}

.genre-badge {
  padding: 4px 14px;
  border: 1px solid var(--color-text-muted);
  border-radius: 20px;
  color: var(--color-text-muted);
  font-family: var(--font-display);
  font-size: 12px;
  letter-spacing: 0.03em;
  text-transform: uppercase;
  text-decoration: none;
  transition:
    border-color 0.2s ease,
    color 0.2s ease;
}

.genre-badge:hover {
  border-color: var(--color-accent);
  color: var(--color-text);
}
</style>
