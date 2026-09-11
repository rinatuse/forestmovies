export default async function handler(req, res) {
  const TMDB_API_KEY = process.env.TMDB_API_KEY
  const TMDB_BASE_URL = 'https://api.themoviedb.org/3'

  const { path, ...restQuery } = req.query
  const url = new URL(`${TMDB_BASE_URL}/${path}`)

  for (const [key, value] of Object.entries(restQuery)) {
    url.searchParams.set(key, value)
  }
  url.searchParams.set('api_key', TMDB_API_KEY)

  const response = await fetch(url)
  const data = await response.json()
  res.status(response.status).json(data)
}
