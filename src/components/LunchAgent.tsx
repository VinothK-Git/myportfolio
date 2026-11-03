import { FormEvent, useState } from 'react'
import './LunchAgent.css'

type Recipe = {
  id: string
  name: string
  country: string
  cuisine: string
  description: string
  seasons: string[]
  weather: string[]
  tags: string[]
  servings: number
  time_minutes: number
  ingredients: string[]
  steps: string[]
  substitution: string
  drink_pairing: string
}

type Weather = {
  location: string
  country: string
  country_code: string
  date: string
  season: string
  current_conditions: string
  current_temperature_c: number | null
  feels_like_c: number | null
  current_precipitation_mm: number | null
  forecast_conditions: string
  high_c: number | null
  low_c: number | null
  rain_probability_percent: number | null
  weather_tags: string[]
}

type Suggestion = { weather: Weather; recipe: Recipe; reason: string; generated: boolean }

function cuisineFor(recipe: Recipe) {
  return recipe.cuisine || (recipe.country === 'India' ? 'South Indian' : '')
}

const defaultLocation = 'Visakhapatnam, Andhra Pradesh'
const defaultCountryCode = 'IN'
const countries = [
  ['AR', 'Argentina'], ['AU', 'Australia'], ['BR', 'Brazil'], ['CA', 'Canada'],
  ['CN', 'China'], ['EG', 'Egypt'], ['ET', 'Ethiopia'], ['FR', 'France'],
  ['DE', 'Germany'], ['GR', 'Greece'], ['IN', 'India'], ['ID', 'Indonesia'],
  ['IT', 'Italy'], ['JP', 'Japan'], ['LB', 'Lebanon'], ['MX', 'Mexico'],
  ['MA', 'Morocco'], ['NP', 'Nepal'], ['NG', 'Nigeria'], ['PE', 'Peru'],
  ['PH', 'Philippines'], ['PT', 'Portugal'], ['KR', 'South Korea'], ['ES', 'Spain'],
  ['LK', 'Sri Lanka'], ['TH', 'Thailand'], ['TR', 'Türkiye'],
  ['AE', 'United Arab Emirates'], ['GB', 'United Kingdom'], ['US', 'United States'],
  ['VN', 'Vietnam'],
] as const

function seasonFor(latitude: number, month: number) {
  if (Math.abs(latitude) < 23.5) return 'tropical'
  const northern = ['winter', 'winter', 'spring', 'spring', 'spring', 'summer', 'summer', 'summer', 'autumn', 'autumn', 'autumn', 'winter']
  const season = northern[month - 1]
  return latitude < 0 ? ({ winter: 'summer', summer: 'winter', spring: 'autumn', autumn: 'spring' } as Record<string, string>)[season] : season
}

function describeCode(code: number) {
  if (code === 0) return 'clear'
  if ([1, 2].includes(code)) return 'partly cloudy'
  if (code === 3) return 'overcast'
  if ([45, 48].includes(code)) return 'foggy'
  if ([51, 53, 55, 56, 57].includes(code)) return 'drizzle'
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return 'rain or showers'
  if ([95, 96, 99].includes(code)) return 'thunderstorms'
  return 'variable conditions'
}

async function loadSuggestion(locationName: string, countryCode: string, preferences: string) {
  const geoParams = new URLSearchParams({ name: locationName, count: '5', language: 'en', format: 'json' })
  if (countryCode.trim()) geoParams.set('countryCode', countryCode.trim().toUpperCase())
  const geoResponse = await fetch(`https://geocoding-api.open-meteo.com/v1/search?${geoParams}`)
  if (!geoResponse.ok) throw new Error('Could not look up that location. Check its spelling and try again.')
  const geoData = await geoResponse.json()
  const place = geoData.results?.[0]
  if (!place) throw new Error('No matching city found. Try adding its state or country.')

  const forecastParams = new URLSearchParams({
    latitude: String(place.latitude), longitude: String(place.longitude), timezone: place.timezone || 'auto',
    current: 'temperature_2m,apparent_temperature,precipitation,weather_code',
    daily: 'temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,weather_code',
    forecast_days: '1',
  })
  const forecastResponse = await fetch(`https://api.open-meteo.com/v1/forecast?${forecastParams}`)
  if (!forecastResponse.ok) throw new Error('Could not load the forecast right now. Please try again.')
  const forecast = await forecastResponse.json()
  const current = forecast.current
  const daily = forecast.daily
  const code = Number(current.weather_code)
  const dailyCode = Number(daily.weather_code?.[0] ?? code)
  const chance = daily.precipitation_probability_max?.[0] ?? null
  const rain = daily.precipitation_sum?.[0] ?? 0
  const high = daily.temperature_2m_max?.[0] ?? null
  const low = daily.temperature_2m_min?.[0] ?? null
  const forecastConditions = describeCode(dailyCode)
  const weatherTags = new Set<string>()
  if ((chance ?? 0) >= 45 || rain >= 2 || ['rain or showers', 'thunderstorms', 'drizzle'].includes(forecastConditions)) weatherTags.add('rainy')
  const mealTemperature = Number(current.temperature_2m ?? current.apparent_temperature ?? high)
  if (mealTemperature >= 30 || (high ?? 0) >= 34) weatherTags.add('hot')
  else if (mealTemperature <= 18 || (high ?? 99) <= 22) weatherTags.add('cool')
  if (['overcast', 'partly cloudy'].includes(forecastConditions)) weatherTags.add('cloudy')

  const country = place.country || 'Unknown country'
  const weather: Weather = {
    location: [place.name, place.admin1, country].filter(Boolean).filter((x: string, i: number, a: string[]) => a.indexOf(x) === i).join(', '),
    country,
    country_code: place.country_code || '',
    date: daily.time?.[0] || new Date().toISOString().slice(0, 10),
    season: seasonFor(Number(place.latitude), Number(daily.time?.[0]?.slice(5, 7) || new Date().getMonth() + 1)),
    current_conditions: describeCode(code),
    current_temperature_c: current.temperature_2m ?? null,
    feels_like_c: current.apparent_temperature ?? null,
    current_precipitation_mm: current.precipitation ?? null,
    forecast_conditions: forecastConditions,
    high_c: high,
    low_c: low,
    rain_probability_percent: chance,
    weather_tags: [...weatherTags],
  }

  const recipeResponse = await fetch('/recipes.json')
  if (!recipeResponse.ok) throw new Error('The recipe library could not be loaded. Please refresh and try again.')
  const recipes: Recipe[] = await recipeResponse.json()
  const localRecipes = recipes.filter(recipe => recipe.country.toLowerCase() === country.toLowerCase())
  const pool = localRecipes.length ? localRecipes : recipes
  const queryTerms = new Set(`${weather.season} ${weather.weather_tags.join(' ')} ${weather.forecast_conditions} ${preferences}`.toLowerCase().match(/[a-z]+/g) || [])
    const ranked = pool.map(recipe => {
    const terms = new Set(`${recipe.name} ${recipe.description} ${cuisineFor(recipe)} ${recipe.tags.join(' ')}`.toLowerCase().match(/[a-z]+/g) || [])
    const overlap = [...queryTerms].filter(term => terms.has(term)).length / Math.max(1, queryTerms.size)
    const season = recipe.seasons.includes(weather.season) ? 0.25 : 0
    const weatherScore = weather.weather_tags.filter(tag => recipe.weather.includes(tag)).length * 0.3
    return { recipe, score: overlap + season + weatherScore }
  }).sort((a, b) => b.score - a.score)
  const recipe = ranked[0]?.recipe
  if (!recipe) throw new Error('There are no recipes in the library yet.')

  const cuisine = cuisineFor(recipe)
  const currentTemperature = weather.current_temperature_c == null ? 'current temperature unavailable' : `${Math.round(weather.current_temperature_c)}°C now${weather.feels_like_c == null ? '' : ` (feels like ${Math.round(weather.feels_like_c)}°C)`}`
  const rainForecast = weather.rain_probability_percent == null ? '' : ` with a ${weather.rain_probability_percent}% rain chance`
  const matchingWeather = weather.weather_tags.filter(tag => recipe.weather.includes(tag))
  const weatherFit = matchingWeather.length
    ? `The recipe library tags it as a match for ${matchingWeather.join(' and ')} weather.`
    : `It was selected from the local recipe library for the ${weather.season === 'tropical' ? 'local tropical climate' : `${weather.season} season`}.`
  const defaultReason = `With ${currentTemperature}, ${weather.forecast_conditions} in today’s forecast${rainForecast}, I recommend ${recipe.name} for lunch. ${weatherFit}`
  let reason = defaultReason
  let generated = false
  if (import.meta.env.VITE_HOSTED_AI === 'true') {
    try {
      const aiResponse = await fetch('/api/suggest', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weather, recipe, preferences }),
      })
      if (aiResponse.ok) {
        const result = await aiResponse.json()
        if (typeof result.reason === 'string' && result.reason.trim()) {
          reason = result.reason.trim()
          generated = true
        }
      }
    } catch {
      // The recipe library remains usable when the optional hosted model is unavailable.
    }
  }
  return { weather, recipe, reason, generated } satisfies Suggestion
}

export default function LunchAgent() {
  const [location, setLocation] = useState(defaultLocation)
  const [countryCode, setCountryCode] = useState(defaultCountryCode)
  const [preferences, setPreferences] = useState('')
  const [suggestion, setSuggestion] = useState<Suggestion | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setSuggestion(null)
    setLoading(true)
    try {
      setSuggestion(await loadSuggestion(location.trim(), countryCode, preferences.trim()))
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const recipe = suggestion?.recipe
  const cuisine = recipe ? cuisineFor(recipe) : ''
  const weather = suggestion?.weather
  return <section className="lunch wrap" id="lunch">
    <div className="section-head"><span>(03)</span><h2>Lunch, by place & weather</h2><span>42 recipes · 31 countries</span></div>
    <div className="lunch-layout">
      <div className="lunch-intro">
        <p className="eyebrow"><span className="line"/>The lunch agent</p>
        <h3>A good lunch<br/><em>starts somewhere.</em></h3>
        <p>Tell me where you are. I’ll check today’s weather and find a recipe from that country when it’s in the library.</p>
        <div className="lunch-meta"><span>LIVE FORECAST</span><span>COUNTRY-AWARE RAG</span></div>
      </div>
      <div className="lunch-panel">
        <form className="lunch-form" onSubmit={submit}>
          <label>City or region<input value={location} onChange={event => setLocation(event.target.value)} placeholder="e.g. Visakhapatnam, Andhra Pradesh" required/></label>
          <label>Country<select value={countryCode} onChange={event => { setCountryCode(event.target.value); setLocation('') }} required>
            {countries.map(([code, name]) => <option key={code} value={code}>{name}</option>)}
          </select></label>
          <label className="wide">Food preferences <span className="optional">optional</span><input value={preferences} onChange={event => setPreferences(event.target.value)} placeholder="Vegetarian, no peanuts, mild spice"/></label>
          <button className="lunch-submit" type="submit" disabled={loading}>{loading ? 'Finding a recipe…' : 'Find my lunch'} <span>↗</span></button>
        </form>
        {error && <p className="lunch-error" role="alert">{error}</p>}
        {suggestion && recipe && weather && <article className="lunch-result" aria-live="polite">
          <section className="lunch-weather-card" aria-label="Current weather">
            <div className="lunch-weather-heading"><div><span className="lunch-weather-kicker">Current weather · {weather.date}</span><span className="lunch-weather-place">{weather.location}</span></div><span className="lunch-weather-icon" aria-hidden="true">{/ rain|shower|drizzle|thunderstorm/i.test(weather.current_conditions) ? '☂' : /cloud|overcast|fog/i.test(weather.current_conditions) ? '☁' : '☀'}</span></div>
            <div className="lunch-weather-main"><strong>{weather.current_temperature_c == null ? '—' : Math.round(weather.current_temperature_c)}°</strong><div><b>{weather.current_conditions}</b><span>Feels like {weather.feels_like_c == null ? '—' : Math.round(weather.feels_like_c)}°C</span></div></div>
            <p className="lunch-weather-outlook">Today’s forecast: <b>{weather.forecast_conditions}</b></p>
            <div className="lunch-weather-stats"><span><b>{weather.high_c ?? '—'}°</b><small>High</small></span><span><b>{weather.low_c ?? '—'}°</b><small>Low</small></span><span><b>{weather.rain_probability_percent ?? '—'}%</b><small>Rain chance</small></span><span><b>{weather.current_precipitation_mm ?? 0} mm</b><small>Now</small></span></div>
          </section>
          <div className="lunch-result-top"><div><span className="lunch-recipe-id">{recipe.id} · {suggestion.generated ? 'AI-ASSISTED' : 'LIBRARY MATCH'}</span><h4>{recipe.name}</h4></div><span className="lunch-country">{recipe.country}</span></div>
          <p className="lunch-cuisine">{cuisine ? `${cuisine} · ` : ''}{recipe.servings} servings · {recipe.time_minutes} min</p>
          <h5>Why it fits today’s weather</h5>
          <p className="lunch-reason">{suggestion.reason}</p>
          <h5>Ingredients</h5><ul>{recipe.ingredients.map(item => <li key={item}>{item}</li>)}</ul>
          <h5>Method</h5><ol>{recipe.steps.map((step, index) => <li key={`${index}-${step}`}>{step}</li>)}</ol>
          <p className="lunch-extra"><b>Substitution:</b> {recipe.substitution}</p>
          <p className="lunch-extra"><b>Drink:</b> {recipe.drink_pairing}</p>
        </article>}
      </div>
    </div>
    <p className="lunch-attribution">Weather by Open-Meteo · Recipe picks are grounded in the local recipe library.</p>
  </section>
}
