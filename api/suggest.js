const WINDOW_MS = 60_000
const MAX_REQUESTS = 12

function rateLimit(request) {
  const address = String(request.headers['x-forwarded-for'] || 'unknown').split(',')[0].trim()
  const now = Date.now()
  const store = globalThis.__lunchRateLimit || (globalThis.__lunchRateLimit = new Map())
  const entry = store.get(address)
  if (!entry || now - entry.start >= WINDOW_MS) {
    store.set(address, { start: now, count: 1 })
    return false
  }
  entry.count += 1
  return entry.count > MAX_REQUESTS
}

export default async function handler(request, response) {
  response.setHeader('Cache-Control', 'no-store')
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST')
    return response.status(405).json({ error: 'Method not allowed.' })
  }

  const origin = request.headers.origin
  const host = request.headers.host
  if (!origin || !host || new URL(origin).host !== host) {
    return response.status(403).json({ error: 'Requests must come from this website.' })
  }
  if (rateLimit(request)) return response.status(429).json({ error: 'Please wait before requesting another suggestion.' })
  if (!process.env.OPENAI_API_KEY) return response.status(503).json({ error: 'Hosted AI is not configured.' })

  const { weather, recipe, preferences = '' } = request.body || {}
  if (!weather || !recipe || typeof preferences !== 'string' || JSON.stringify(request.body).length > 20_000) {
    return response.status(400).json({ error: 'Invalid suggestion request.' })
  }

  const prompt = [
    'You write a brief, grounded lunch suggestion explanation for a public recipe website.',
    'Use only the provided weather and selected library recipe. Do not change the dish, ingredients, or method.',
    'Write two concise sentences that explicitly recommend the selected dish for the measured weather: cite the current temperature (and feels-like temperature when available), mention the forecast and rain chance when available, then connect the recipe to matching weather tags or its description.',
    'Name the recipe country and cuisine only when the provided recipe includes them. Do not invent missing cuisine details or claim rain is certain unless the forecast supports it. Offer one practical serving or drink tip. Respect stated dietary preferences; if the selected recipe appears incompatible, say so briefly instead of claiming it meets them.',
    `User preferences: ${preferences || 'None specified.'}`,
    `Weather data: ${JSON.stringify(weather)}`,
    `Selected recipe from the local library: ${JSON.stringify(recipe)}`,
  ].join('\n\n')

  try {
    const apiResponse = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || 'gpt-6-astra',
        input: prompt,
        max_output_tokens: 220,
      }),
    })
    const data = await apiResponse.json()
    if (!apiResponse.ok) {
      console.error('OpenAI Responses API error:', data.error?.type || apiResponse.status)
      return response.status(502).json({ error: 'The hosted recipe assistant is temporarily unavailable.' })
    }
    const reason = typeof data.output_text === 'string' ? data.output_text.trim() : ''
    if (!reason) return response.status(502).json({ error: 'The hosted assistant returned no suggestion.' })
    return response.status(200).json({ reason })
  } catch {
    return response.status(502).json({ error: 'The hosted recipe assistant is temporarily unavailable.' })
  }
}
