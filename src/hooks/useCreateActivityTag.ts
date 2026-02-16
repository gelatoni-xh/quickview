import { useState } from 'react'
import { createActivityTag } from '../services/activityApi'
import type { ActivityOperationResponse } from '../types/activity'

interface CreateTagParams {
    name: string
    color: string
}

export function useCreateActivityTag() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const createTag = async (params: CreateTagParams) => {
        try {
            setLoading(true)
            setError(null)

            const result = await createActivityTag(params)
            const response = result as unknown as ActivityOperationResponse
            
            if (!response.success) {
                setError(response.message || '创建标签失败')
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

    return { createTag, loading, error }
}
