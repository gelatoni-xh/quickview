import { useState } from 'react'
import { createMatchGame } from '../services/matchGameApi'
import type { MatchGameUpsertRequest } from '../services/matchGameApi'

export function useCreateMatchGame() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const create = async (req: MatchGameUpsertRequest): Promise<boolean> => {
        try {
            setLoading(true)
            setError(null)

            const result = await createMatchGame(req)
            if (!result.success) {
                setError(result.message || '创建比赛失败')
                return false
            }

            return true
        } catch (err) {
            setError(err instanceof Error ? err.message : String(err))
            return false
        } finally {
            setLoading(false)
        }
    }

    return { create, loading, error }
}
