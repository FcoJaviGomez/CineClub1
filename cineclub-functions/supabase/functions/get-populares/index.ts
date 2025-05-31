// functions/get-populares/index.ts

import { serve } from 'https://deno.land/std/http/server.ts'

serve(async (_req) => {
  const tmdbApiKey = Deno.env.get('TMDB_API_KEY')!

  const response = await fetch(`https://api.themoviedb.org/3/movie/popular?api_key=${tmdbApiKey}&language=es-ES&page=1`)
  const data = await response.json()

  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' },
    status: 200
  })
})
