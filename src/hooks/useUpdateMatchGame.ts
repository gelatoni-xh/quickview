import { useState } from 'react'
import { updateMatchGame } from '../services/matchGameApi'
import type { MatchGameUpsertRequest } from '../services/matchGameApi'

export function useUpdateMatchGame() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const update = async (req: MatchGameUpsertRequest): Promise<boolean> => {
        try {
            setLoading(true)
            setError(null)

            const result = await updateMatchGame(req)
            if (!result.success) {
                setError(result.message || '更新比赛失败')
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

    return { update, loading, error }
}
