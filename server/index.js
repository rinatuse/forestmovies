import express from 'express'
import cors from 'cors'
import 'dotenv/config'

const app = express()
app.use(cors())

const TMDB_API_KEY = process.env.TMDB_API_KEY
const TMDB_BASE_URL = 'https://api.themoviedb.org/3'

app.get('/api/*', async (req, res) => {
  const tmdbPath = req.params[0]
  const url = new URL(`${TMDB_BASE_URL}/${tmdbPath}`)

  for (const [key, value] of Object.entries(req.query)) {
    url.searchParams.set(key, value)
  }
  url.searchParams.set('api_key', TMDB_API_KEY)

  const response = await fetch(url)
  const data = await response.json()
  res.status(response.status).json(data)
})

const PORT = process.env.PORT || 3001

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Прокси-сервер запущен на порту ${PORT}`)
})
