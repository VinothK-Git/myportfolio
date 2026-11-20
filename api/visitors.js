const COUNTER_KEY = 'vinothk-portfolio-visitors-20261120-7d84bb893ded4a04a7873a9b2d8b17f6'

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

  const action = new URL(request.url, `https://${host}`).searchParams.get('action')
  if (!['get', 'hit'].includes(action)) {
    return response.status(400).json({ error: 'Invalid counter action.' })
  }

  try {
    const result = await fetch(`https://countapi.mileshilliard.com/api/v1/${action}/${COUNTER_KEY}`, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(5000),
    })
    const data = await result.json()
    const count = Number(data.value)
    if (!result.ok || !Number.isSafeInteger(count) || count < 0) {
      return response.status(502).json({ error: 'The visitor counter is temporarily unavailable.' })
    }
    return response.status(200).json({ count })
  } catch {
    return response.status(502).json({ error: 'The visitor counter is temporarily unavailable.' })
  }
}
