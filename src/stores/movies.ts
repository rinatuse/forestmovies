import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { z } from 'zod'

export type Movie = z.infer<typeof MovieSchema>

const MovieSchema = z.object({
  id: z.number(),
  title: z.string(),
  poster_path: z.string().nullable(),
  release_date: z.string(),
  vote_average: z.number(),
  overview: z.string(),
})

const TMDBResponseSchema = z.object({
  page: z.number(),
  results: z.array(MovieSchema),
  total_pages: z.number(),
  total_results: z.number(),
})

const GenreSchema = z.object({
  id: z.number(),
  name: z.string(),
})

const MovieDetailSchema = z.object({
  id: z.number(),
  title: z.string(),
  overview: z.string(),
  poster_path: z.string().nullable(),
  release_date: z.string(),
  vote_average: z.number(),
  runtime: z.number().nullable(),
  genres: z.array(GenreSchema),
  tagline: z.string().nullable(),
})

export type MovieDetail = z.infer<typeof MovieDetailSchema>

const API_KEY = import.meta.env.VITE_TMDB_API_KEY
const BASE_URL = 'https://api.themoviedb.org/3'
const userLanguage = navigator.language

export const useMoviesStore = defineStore('movies', () => {
  const movies = ref<Movie[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const currentPage = ref(1)
  const totalPages = ref(1)
  const movieDetail = ref<MovieDetail | null>(null)
  const currentQuery = ref('')
  const hasMore = computed(() => currentPage.value < totalPages.value)

  let detailAbortController: AbortController | null = null

  async function fetchMovieDetail(id: string) {
    detailAbortController?.abort()
    const controller = new AbortController()
    detailAbortController = controller

    loading.value = true
    error.value = null

    try {
      const response = await fetch(
        `${BASE_URL}/movie/${id}?api_key=${API_KEY}&language=${userLanguage}`,
        {
          signal: controller.signal,
        },
      )

      if (!response.ok) {
        throw new Error(`TMDB ответил с ошибкой: ${response.status}`)
      }

      const rawData = await response.json()
      const result = MovieDetailSchema.safeParse(rawData)

      if (!result.success) {
        throw new Error('TMDB прислал данные неожиданной структуры')
      }

      movieDetail.value = result.data
    } catch (e) {
      if (controller.signal.aborted) {
        return
      }
      error.value = e instanceof Error ? e.message : 'Не удалось загрузить фильм'
      movieDetail.value = null
    } finally {
      if (!controller.signal.aborted) {
        loading.value = false
      }
    }
  }

  let listAbortController: AbortController | null = null

  async function fetchNextPage() {
    if (!hasMore.value || loading.value) return

    listAbortController?.abort()
    const controller = new AbortController()
    listAbortController = controller

    loading.value = true
    error.value = null

    const nextPage = currentPage.value + 1
    const endpoint = currentQuery.value
      ? `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(currentQuery.value)}&page=${nextPage}&language=${userLanguage}`
      : `${BASE_URL}/movie/popular?api_key=${API_KEY}&page=${nextPage}&language=${userLanguage}`

    try {
      const response = await fetch(endpoint, {
        signal: controller.signal,
      })

      if (!response.ok) {
        throw new Error(`TMDB ответил с ошибкой: ${response.status}`)
      }

      const rawData = await response.json()
      const result = TMDBResponseSchema.safeParse(rawData)

      if (!result.success) {
        throw new Error('TMDB прислал данные неожиданной структуры')
      }

      movies.value.push(...result.data.results)
      currentPage.value = result.data.page
      totalPages.value = result.data.total_pages
    } catch (e) {
      if (controller.signal.aborted) {
        return
      }
      error.value = e instanceof Error ? e.message : 'Не удалось загрузить фильмы'
    } finally {
      if (!controller.signal.aborted) {
        loading.value = false
      }
    }
  }

  async function fetchMovies(query = '', page = 1) {
    listAbortController?.abort()
    const controller = new AbortController()
    listAbortController = controller

    loading.value = true
    error.value = null

    const endpoint = query
      ? `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}&page=${page}&language=${userLanguage}`
      : `${BASE_URL}/movie/popular?api_key=${API_KEY}&page=${page}&language=${userLanguage}`

    try {
      const response = await fetch(endpoint, {
        signal: controller.signal,
      })

      if (!response.ok) {
        throw new Error(`TMDB ответил с ошибкой: ${response.status}`)
      }

      const rawData = await response.json()
      const result = TMDBResponseSchema.safeParse(rawData)

      if (!result.success) {
        throw new Error('TMDB прислал данные неожиданной структуры')
      }

      movies.value = result.data.results
      currentPage.value = result.data.page
      totalPages.value = result.data.total_pages
      currentQuery.value = query
    } catch (e) {
      if (controller.signal.aborted) {
        return
      }
      error.value = e instanceof Error ? e.message : 'Не удалось загрузить фильмы'
      movies.value = []
    } finally {
      if (!controller.signal.aborted) {
        loading.value = false
      }
    }
  }

  return {
    movies,
    loading,
    error,
    currentPage,
    totalPages,
    movieDetail,
    hasMore,
    fetchMovieDetail,
    fetchMovies,
    fetchNextPage,
  }
})
