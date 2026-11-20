import { useEffect, useState } from 'react'

const VISITED_KEY = 'vinoth-portfolio-counted-v1'

export default function VisitorCount() {
  const [count, setCount] = useState<number | null>(null)

  useEffect(() => {
    let alreadyCounted = false
    try {
      alreadyCounted = localStorage.getItem(VISITED_KEY) === 'yes'
      if (!alreadyCounted) localStorage.setItem(VISITED_KEY, 'yes')
    } catch {
      // Continue without browser storage; the counter still works for this visit.
    }

    let active = true
    const action = alreadyCounted ? 'get' : 'hit'
    fetch(`/api/visitors?action=${action}`, { method: 'POST', cache: 'no-store' })
      .then(async response => {
        if (!response.ok) throw new Error('Visitor count unavailable')
        return response.json() as Promise<{ count: number }>
      })
      .then(result => {
        if (active && Number.isFinite(result.count)) setCount(result.count)
      })
      .catch(() => {
        if (!alreadyCounted) {
          try { localStorage.removeItem(VISITED_KEY) } catch { /* Storage may be disabled. */ }
        }
      })

    return () => { active = false }
  }, [])

  return <span className="visitor-count" aria-label={`${count?.toLocaleString() ?? 'Loading'} visitors`}>
    <span>Visitors</span><strong>{count?.toLocaleString() ?? '—'}</strong>
  </span>
}
