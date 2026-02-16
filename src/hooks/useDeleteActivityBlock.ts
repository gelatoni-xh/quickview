import { useState } from 'react'
import { deleteActivityBlock } from '../services/activityApi'
import type { ActivityOperationResponse } from '../types/activity'

interface DeleteParams {
    id: number
}

export function useDeleteActivityBlock() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const removeBlock = async (params: DeleteParams) => {
        try {
            setLoading(true)
            setError(null)

            const result = await deleteActivityBlock(params)
            const response = result as unknown as ActivityOperationResponse
            
            if (!response.success) {
                setError(response.message || '删除活动记录失败')
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

    return { removeBlock, loading, error }
}
