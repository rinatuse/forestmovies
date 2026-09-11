import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useMoviesStore } from '../movies'

describe('movies store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    global.fetch = vi.fn()
  })

  it('загружает и сохраняет список фильмов при успешном ответе', async () => {
    const fakeResponse = {
      page: 1,
      results: [
        {
          id: 1,
          title: 'Тестовый фильм',
          poster_path: null,
          release_date: '2024-01-01',
          vote_average: 7.5,
          overview: 'Описание',
        },
      ],
      total_pages: 3,
      total_results: 50,
    }

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => fakeResponse,
    })

    const store = useMoviesStore()
    await store.fetchMovies()

    expect(store.movies).toHaveLength(1)
    expect(store.movies[0]?.title).toBe('Тестовый фильм')
    expect(store.totalPages).toBe(3)
    expect(store.loading).toBe(false)
  })
})
