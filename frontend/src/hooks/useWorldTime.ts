import { useState, useEffect } from 'react'

export interface TimezoneData {
    timezone: string
    datetime: string
    unixtime: number
    utc_offset: string
    attempts?: number
    error?: string
}

export interface WorldTime {
    updated_at: string
    timezones: TimezoneData[]
}

export function useWorldTime() {
    const [data, setData] = useState<WorldTime | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch('/data/worldtime.json')
                if (!res.ok) throw new Error(`HTTP ${res.status}`)
                const json: WorldTime = await res.json()
                setData(json)
            } catch (err: unknown) {
                if (err instanceof Error) {
                    setError(err.message)
                } else {
                    setError(String(err))
                }
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [])

    return { data, loading, error }
}
