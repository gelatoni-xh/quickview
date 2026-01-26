/**
 * 活动记录数据获取 Hook
 *
 * 获取指定日期的活动记录。
 */
import { useCallback, useEffect, useState, useRef } from 'react'
import { useActivityTags } from './useActivityTags'
import type { ActivityBlock, ActivityListResponse } from '../types/activity'

// 定义API返回的活动块数据类型（带tagId而不是完整的tag对象）
interface ApiActivityBlock {
    id: number
    startTime: string
    endTime: string
    tagId: number
    detail?: string | null
    activityDate: string
    createTime: string
}

export function useActivityBlocks(date: string) {
    const [data, setData] = useState<ActivityBlock[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    
    // 获取标签数据用于关联
    const { data: tagsData, loading: tagsLoading } = useActivityTags()

    // 使用 useRef 来存储标签数据，避免因标签数据变化导致的无限重渲染
    const tagsDataRef = useRef(tagsData);
    useEffect(() => {
        tagsDataRef.current = tagsData;
    }, [tagsData]);

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
            const result: ActivityListResponse<ApiActivityBlock[]> = await res.json()

            // 将API返回的原始数据转换为符合ActivityBlock类型的格式
            const transformedData = result.data.map((item: ApiActivityBlock) => {
                // 使用 ref 中的标签数据，避免闭包中捕获旧值
                const tag = tagsDataRef.current.find(tag => tag.id === item.tagId)
                
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
    }, [date]) // 只依赖于 date，不再依赖 tagsData

    useEffect(() => {
        // 只有在日期变化或标签数据加载完成后才重新获取数据
        if (!tagsLoading) {
            fetchData();
        }
    }, [date, tagsLoading, fetchData])

    return {
        data,
        loading,
        error,
        refresh: fetchData,
    }
}