import { useState } from 'react'
import { createOrUpdateActivityBlock } from '../services/activityApi'
import type { ActivityOperationResponse } from '../types/activity'

interface CreateOrUpdateParams {
    tagId: number
    activityDate: string
    startTime: string
    endTime: string
    detail?: string | null
}

export function useCreateOrUpdateActivityBlock() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const createOrUpdate = async (params: CreateOrUpdateParams) => {
        try {
            setLoading(true)
            setError(null)

            const result = await createOrUpdateActivityBlock(params)
            const response = result as unknown as ActivityOperationResponse
            
            if (!response.success) {
                setError(response.message || '保存活动记录失败')
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

    return { createOrUpdate, loading, error }
}
