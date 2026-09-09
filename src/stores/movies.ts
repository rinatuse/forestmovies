import { ref } from 'vue'
import { defineStore } from 'pinia'
import { z } from 'zod'

type Movie = z.infer<typeof MovieSchema>

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

const API_KEY = import.meta.env.VITE_TMDB_API_KEY
const BASE_URL = 'https://api.themoviedb.org/3'

export const useMoviesStore = defineStore('movies', () => {
  const movies = ref<Movie[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const currentPage = ref(1)
  const totalPages = ref(1)

  async function fetchMovies(query = '', page = 1) {
    loading.value = true
    error.value = null
    const endpoint = query
      ? `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}&page=${page}`
      : `${BASE_URL}/movie/popular?api_key=${API_KEY}&page=${page}`

    try {
      const response = await fetch(endpoint)

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
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Не удалось загрузить фильмы'
      movies.value = []
    } finally {
      loading.value = false
    }
  }

  return { movies, loading, error, currentPage, totalPages, fetchMovies }
})
