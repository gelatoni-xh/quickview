import { useState, useEffect } from 'react'
import { getRoleCodesByUser } from '../services/rbacApi'

export function useRoleCodesByUser(userId: number | null) {
    const [data, setData] = useState<string[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchRoleCodes = async () => {
        if (userId === null) {
            setData([])
            setLoading(false)
            return
        }

        try {
            setLoading(true)
            setError(null)
            
            const result = await getRoleCodesByUser(userId)
            
            if (!result.success) {
                setError(result.message || '获取用户角色失败')
                setData([])
            } else {
                setData(result.data || [])
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : String(err))
            setData([])
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchRoleCodes()
    }, [userId])

    return { data, loading, error, refresh: fetchRoleCodes }
}
