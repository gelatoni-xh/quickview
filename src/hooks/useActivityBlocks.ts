import { useCallback, useEffect, useState, useRef } from 'react'
import { getActivityBlocksByDate } from '../services/activityApi'
import { useActivityTags } from './useActivityTags'
import type { ActivityBlock } from '../types/activity'

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
    
    const { data: tagsData, loading: tagsLoading } = useActivityTags()
    const tagsDataRef = useRef(tagsData);
    
    useEffect(() => {
        tagsDataRef.current = tagsData;
    }, [tagsData]);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true)
            setError(null)

            const result = await getActivityBlocksByDate(date)
            const transformedData = result.data.map((item: ApiActivityBlock) => {
                const tag = tagsDataRef.current.find(tag => tag.id === item.tagId)
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
    }, [date])

    useEffect(() => {
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
