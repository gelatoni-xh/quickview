import { useState } from 'react'
import { createPermission, updatePermission } from '../services/rbacApi'

export function useCreateOrUpdatePermission() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const create = async (params: { permissionCode: string; permissionName: string }): Promise<boolean> => {
        try {
            setLoading(true)
            setError(null)

            const result = await createPermission(params)

            if (!result.success) {
                setError(result.message || '创建权限失败')
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

    const update = async (params: { id: number; permissionCode: string; permissionName: string }): Promise<boolean> => {
        try {
            setLoading(true)
            setError(null)

            const result = await updatePermission(params)

            if (!result.success) {
                setError(result.message || '更新权限失败')
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
