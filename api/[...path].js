export default async function handler(req, res) {
  const TMDB_API_KEY = process.env.TMDB_API_KEY
  const TMDB_BASE_URL = 'https://api.themoviedb.org/3'

  const tmdbPath = req.query.path.join('/')
  const url = new URL(`${TMDB_BASE_URL}/${tmdbPath}`)

  for (const [key, value] of Object.entries(req.query)) {
    if (key !== 'path') url.searchParams.set(key, value)
  }
  url.searchParams.set('api_key', TMDB_API_KEY)

  const response = await fetch(url)
  const data = await response.json()
  res.status(response.status).json(data)
}
