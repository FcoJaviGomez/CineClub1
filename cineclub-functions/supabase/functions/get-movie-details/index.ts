import { serve } from 'https://deno.land/std/http/server.ts'

serve(async (req) => {
  const tmdbApiKey = Deno.env.get('TMDB_API_KEY')!
  const { id } = await req.json()

  if (!id) {
    return new Response(JSON.stringify({ error: 'ID requerido' }), { status: 400 })
  }

  const res = await fetch(`https://api.themoviedb.org/3/movie/${id}?api_key=${tmdbApiKey}&language=es-ES`)
  const data = await res.json()

  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' }
  })
})
