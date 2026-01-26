/**
 * 活动记录数据获取 Hook
 *
 * 获取指定日期的活动记录。
 */
import { useCallback, useEffect, useState } from 'react'
import { useActivityTags } from './useActivityTags'
import type { ActivityBlock, ActivityListResponse } from '../types/activity'

export function useActivityBlocks(date: string) {
    const [data, setData] = useState<ActivityBlock[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    
    // 获取标签数据用于关联
    const { data: tagsData} = useActivityTags()

    const fetchData = useCallback(async () => {
        try {
            setLoading(true)
            setError(null)

            const token = localStorage.getItem('token')
            const headers: HeadersInit = {}
            if (token) {
                headers['Authorization'] = `Bearer ${token}`
            }

            const res = await fetch(`/api/activity/block/listByDate?date=${date}`, { headers })
            const result: ActivityListResponse<any[]> = await res.json()

            // 将API返回的原始数据转换为符合ActivityBlock类型的格式
            const transformedData = result.data.map((item: any) => {
                // 查找对应的标签
                const tag = tagsData.find(tag => tag.id === item.tagId)
                
                // 如果找不到标签，使用默认值
                const tagInfo = tag || {
                    id: item.tagId,
                    name: '未知标签',
                    color: '#ccc'
                }

                return {
                    id: item.id,
                    startTime: item.startTime,
                    endTime: item.endTime,
                    tag: tagInfo,
                    detail: item.detail || null
                }
            })

            setData(transformedData)
        } catch (err) {
            setError(err instanceof Error ? err.message : String(err))
        } finally {
            setLoading(false)
        }
    }, [date, tagsData])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    return {
        data,
        loading,
        error,
        refresh: fetchData,
    }
}