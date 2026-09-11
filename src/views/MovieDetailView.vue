<script setup lang="ts">
import { watch, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useMoviesStore } from '@/stores/movies'
import { NIcon } from 'naive-ui'
import { FilmOutline } from '@vicons/ionicons5'

const route = useRoute()
const store = useMoviesStore()
const { movieDetail, loading, error, similarMovies } = storeToRefs(store)
const { fetchMovieDetail, fetchSimilarMovies } = store

watch(
  () => route.params.id,
  (newId) => {
    fetchMovieDetail(newId as string)
    fetchSimilarMovies(newId as string)
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
  <div class="page-wrapper">
    <div
      v-if="movieDetail?.backdrop_path"
      class="backdrop"
      :style="{
        backgroundImage: `linear-gradient(to bottom, rgba(21, 18, 23, 0.2), var(--color-bg)), url(https://image.tmdb.org/t/p/w1280${movieDetail.backdrop_path})`,
      }"
    ></div>

    <div class="scroll-area">
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
        <template v-else-if="movieDetail">
          <div class="detail-content">
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

          <div v-if="similarMovies.length" class="similar-section">
            <h2 class="similar-title">Похожие фильмы</h2>
            <div class="similar-grid">
              <RouterLink
                v-for="movie in similarMovies.slice(0, 12)"
                :key="movie.id"
                :to="{ name: 'movie-detail', params: { id: movie.id } }"
                class="similar-card"
              >
                <div class="similar-card-poster">
                  <img
                    v-if="movie.poster_path"
                    :src="`https://image.tmdb.org/t/p/w185${movie.poster_path}`"
                    :alt="movie.title"
                    loading="lazy"
                  />
                  <div v-else class="similar-no-poster">
                    <n-icon :component="FilmOutline" size="28" />
                  </div>
                </div>
                <span class="similar-card-title">{{ movie.title }}</span>
              </RouterLink>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-wrapper {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.backdrop {
  flex-shrink: 0;
  width: 100%;
  height: 400px;
  background-size: cover;
  background-position: center;
}

.scroll-area {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: var(--color-accent) var(--color-surface);
}

.scroll-area::-webkit-scrollbar {
  width: 10px;
}

.scroll-area::-webkit-scrollbar-track {
  background: var(--color-surface);
}

.scroll-area::-webkit-scrollbar-thumb {
  background-color: var(--color-accent);
  border-radius: 6px;
  border: 2px solid var(--color-surface);
}

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

.similar-section {
  margin-top: 48px;
}

.similar-title {
  margin: 0 0 16px;
  font-family: var(--font-display);
  font-size: 20px;
  font-weight: 700;
  letter-spacing: 0.03em;
  text-transform: uppercase;
  color: var(--color-text);
}

.similar-grid {
  display: flex;
  gap: 16px;
  overflow-x: auto;
  padding-bottom: 12px;
  scrollbar-width: thin;
  scrollbar-color: var(--color-accent) var(--color-surface);
}

.similar-grid::-webkit-scrollbar {
  height: 8px;
}

.similar-grid::-webkit-scrollbar-track {
  background: var(--color-surface);
}

.similar-grid::-webkit-scrollbar-thumb {
  background-color: var(--color-accent);
  border-radius: 6px;
}

.similar-card {
  flex: 0 0 140px;
  color: inherit;
  text-decoration: none;
  display: block;
  min-width: 0;
}

.similar-card-poster {
  width: 100%;
  aspect-ratio: 2 / 3;
  background: var(--color-surface);
  overflow: hidden;
}

.similar-card-poster img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.similar-no-poster {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-muted);
}

.similar-card:hover img {
  transform: scale(1.04);
}

.similar-card-title {
  display: block;
  font-size: 13px;
  color: var(--color-text-muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
