import { useState } from 'react'
import { deleteActivityTag } from '../services/activityApi'
import type { ActivityOperationResponse } from '../types/activity'

interface DeleteTagParams {
    id: number
}

export function useDeleteActivityTag() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const deleteTag = async (params: DeleteTagParams) => {
        try {
            setLoading(true)
            setError(null)

            const result = await deleteActivityTag(params)
            const response = result as unknown as ActivityOperationResponse
            
            if (!response.success) {
                setError(response.message || '删除标签失败')
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

    return { deleteTag, loading, error }
}
