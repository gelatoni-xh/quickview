import { useState } from 'react'
import { createRole, updateRole } from '../services/rbacApi'

export function useCreateOrUpdateRole() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const create = async (params: { roleCode: string; roleName: string; status: number }): Promise<boolean> => {
        try {
            setLoading(true)
            setError(null)

            const result = await createRole(params)

            if (!result.success) {
                setError(result.message || '创建角色失败')
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

    const update = async (params: { id: number; roleCode: string; roleName: string; status: number }): Promise<boolean> => {
        try {
            setLoading(true)
            setError(null)

            const result = await updateRole(params)

            if (!result.success) {
                setError(result.message || '更新角色失败')
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

    return { create, update, loading, error }
}
