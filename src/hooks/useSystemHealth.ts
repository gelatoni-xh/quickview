import { useEffect, useState } from 'react'

interface HealthResponse {
    status: string
}

export function useSystemHealth() {
    const [data, setData] = useState<HealthResponse | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        fetch('/api/system/health')
            .then(res => {
                if (!res.ok) {
                    throw new Error(`HTTP ${res.status}`)
                }
                return res.json()
            })
            .then(json => {
                setData(json)
            })
            .catch(err => {
                setError(err.message || 'Unknown error')
            })
            .finally(() => {
                setLoading(false)
            })
    }, [])

    return { data, loading, error }
}
