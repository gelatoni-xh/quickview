import { useState } from 'react'
import { updateActivityTag } from '../services/activityApi'
import type { ActivityOperationResponse } from '../types/activity'

interface UpdateTagParams {
    id: number
    name?: string
    color?: string
}

export function useUpdateActivityTag() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const updateTag = async (params: UpdateTagParams) => {
        try {
            setLoading(true)
            setError(null)

            const result = await updateActivityTag(params)
            const response = result as unknown as ActivityOperationResponse
            
            if (!response.success) {
                setError(response.message || '更新标签失败')
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

    return { updateTag, loading, error }
}
