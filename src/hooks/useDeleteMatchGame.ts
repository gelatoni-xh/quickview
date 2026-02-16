import { useState } from 'react'
import { deleteMatchGame } from '../services/matchGameApi'

export function useDeleteMatchGame() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const deleteGame = async (gameId: number): Promise<boolean> => {
        try {
            setLoading(true)
            setError(null)

            const result = await deleteMatchGame(gameId)
            if (!result.success) {
                setError(result.message || '删除比赛失败')
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

    return { deleteGame, loading, error }
}
