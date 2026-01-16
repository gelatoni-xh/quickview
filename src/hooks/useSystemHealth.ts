import { useEffect, useState } from 'react'

interface SystemHealth {
    status: string
    env: string
}

export function useSystemHealth() {
    const [data, setData] = useState<SystemHealth | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        let cancelled = false

        fetch('/api/system/health')
            .then(async (res) => {
                if (!res.ok) {
                    throw new Error(`HTTP ${res.status}`)
                }
                return res.json()
            })
            .then((json: SystemHealth) => {
                if (!cancelled) setData(json)
            })
            .catch((e: unknown) => {
                if (!cancelled) {
                    setError(e instanceof Error ? e.message : String(e))
                }
            })
            .finally(() => {
                if (!cancelled) setLoading(false)
            })

        return () => {
            cancelled = true
        }
    }, [])

    return { data, loading, error }
}
