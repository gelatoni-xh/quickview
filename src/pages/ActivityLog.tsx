/**
 * 活动记录页面
 *
 * 用于直观回顾一天的时间结构。
 */
import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { useActivityTags } from '../hooks/useActivityTags'
import { useActivityBlocks } from '../hooks/useActivityBlocks'
import type { ActivityBlock } from '../types/activity'
import ActivityBlockModal from '../components/widgets/activity/ActivityBlockModal'
import ActivityTagManager from '../components/widgets/activity/ActivityTagManager'

const slotHeight = 28
const totalSlots = 48

const formatDate = (date: Date) => date.toISOString().slice(0, 10)

const formatDisplayDate = (date: Date) => {
    return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'short',
    })
}

const formatTime = (minutes: number) => {
    const hour = Math.floor(minutes / 60)
    const minute = minutes % 60
    return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
}

const parseTime = (time: string) => {
    const [hour, minute] = time.slice(0, 5).split(':').map(Number)
    return hour * 60 + minute
}

export default function ActivityLog() {
    const [currentDate, setCurrentDate] = useState(() => new Date())
    const [modalOpen, setModalOpen] = useState(false)
    const [selectedBlock, setSelectedBlock] = useState<ActivityBlock | null>(null)
    const [selectedStart, setSelectedStart] = useState('08:00')
    const [selectedEnd, setSelectedEnd] = useState('08:30')

    const dateString = useMemo(() => formatDate(currentDate), [currentDate])

    const {
        data: tags,
        loading: tagsLoading,
        error: tagsError,
        refresh: refreshTags,
    } = useActivityTags()
    const {
        data: blocks,
        loading: blocksLoading,
        error: blocksError,
        refresh: refreshBlocks,
    } = useActivityBlocks(dateString)

    const gridSlots = useMemo(() => {
        return Array.from({ length: totalSlots }, (_, index) => {
            const minutes = index * 30
            return {
                index,
                time: formatTime(minutes),
                minutes,
            }
        })
    }, [])

    const blockItems = useMemo(() => {
        return blocks.map((block) => {
            const start = parseTime(block.startTime)
            const end = parseTime(block.endTime)
            const top = (start / 30) * slotHeight
            const height = Math.max(((end - start) / 30) * slotHeight, slotHeight)
            return {
                ...block,
                start,
                end,
                top,
                height,
            }
        })
    }, [blocks])

    const handleShiftDate = (days: number) => {
        setCurrentDate((prev) => {
            const next = new Date(prev)
            next.setDate(next.getDate() + days)
            return next
        })
    }

    const openCreateModal = (start: string) => {
        setSelectedBlock(null)
        setSelectedStart(start)
        const [hour, minute] = start.split(':').map(Number)
        const nextMinutes = hour * 60 + minute + 30
        setSelectedEnd(formatTime(Math.min(nextMinutes, 24 * 60)))
        setModalOpen(true)
    }

    const openEditModal = (block: ActivityBlock) => {
        setSelectedBlock(block)
        setSelectedStart(block.startTime.slice(0, 5))
        setSelectedEnd(block.endTime.slice(0, 5))
        setModalOpen(true)
    }

    const refreshAll = () => {
        refreshBlocks()
        refreshTags()
    }

    const loading = tagsLoading || blocksLoading
    const error = blocksError || tagsError

    return (
        <main className="flex-1 p-6 overflow-auto bg-gradient-to-br from-slate-50 via-white to-sky-50">
            <div className="flex flex-col xl:flex-row gap-6">
                <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                        <div>
                            <h1 className="text-2xl font-semibold text-gray-900">活动记录</h1>
                            <p className="text-sm text-gray-500 mt-1">
                                通过色块回顾今天的时间结构
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => handleShiftDate(-1)}
                                className="px-3 py-2 text-sm rounded border bg-white shadow-sm hover:bg-gray-50"
                            >
                                <ChevronLeft size={16} className="inline-block mr-1" />
                                前一天
                            </button>
                            <button
                                onClick={() => setCurrentDate(new Date())}
                                className="px-3 py-2 text-sm rounded border bg-white shadow-sm hover:bg-gray-50"
                            >
                                今天
                            </button>
                            <button
                                onClick={() => handleShiftDate(1)}
                                className="px-3 py-2 text-sm rounded border bg-white shadow-sm hover:bg-gray-50"
                            >
                                后一天
                                <ChevronRight size={16} className="inline-block ml-1" />
                            </button>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                        <div className="flex items-center justify-between px-4 py-3 border-b">
                            <div>
                                <h2 className="font-semibold">{formatDisplayDate(currentDate)}</h2>
                                <p className="text-xs text-gray-500 mt-1">48 个半小时视图</p>
                            </div>
                            <button
                                onClick={() => openCreateModal('09:00')}
                                className="inline-flex items-center gap-1 px-3 py-1.5 text-sm rounded-full border border-blue-200 text-blue-600 hover:bg-blue-50"
                            >
                                <Plus size={14} />
                                新增记录
                            </button>
                        </div>

                        {loading && (
                            <div className="p-6 space-y-3">
                                {Array.from({ length: 8 }).map((_, index) => (
                                    <div
                                        key={`skeleton-${index}`}
                                        className="h-6 bg-gray-100 rounded animate-pulse"
                                    />
                                ))}
                            </div>
                        )}

                        {!loading && error && (
                            <div className="p-6 text-sm text-red-500">{error}</div>
                        )}

                        {!loading && !error && (
                            <div className="p-4">
                                <div className="flex gap-4">
                                    <div className="w-16 flex flex-col items-end text-xs text-gray-400">
                                        {gridSlots.map((slot) => (
                                            <div
                                                key={`label-${slot.index}`}
                                                className="h-7 flex items-center"
                                                style={{ height: slotHeight }}
                                            >
                                                {slot.time}
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex-1 relative border rounded-lg overflow-hidden bg-gradient-to-b from-white to-slate-50">
                                        {gridSlots.map((slot) => (
                                            <button
                                                key={`slot-${slot.index}`}
                                                className="w-full border-b border-dashed border-gray-200 text-left hover:bg-blue-50/60 transition-colors"
                                                style={{ height: slotHeight }}
                                                onClick={() => openCreateModal(slot.time)}
                                            >
                                                <span className="sr-only">{slot.time}</span>
                                            </button>
                                        ))}

                                        {blockItems.map((block) => (
                                            <button
                                                key={`block-${block.id}`}
                                                onClick={() => openEditModal(block)}
                                                className="absolute left-2 right-2 rounded-xl text-left text-sm text-white shadow-md group"
                                                style={{
                                                    top: block.top,
                                                    height: block.height,
                                                    backgroundColor: block.tag.color,
                                                }}
                                            >
                                                <div className="h-full flex flex-col justify-between p-2">
                                                    <div className="font-semibold text-sm">
                                                        {block.tag.name}
                                                    </div>
                                                    <div className="text-xs opacity-90">
                                                        {block.startTime.slice(0, 5)} - {block.endTime.slice(0, 5)}
                                                    </div>
                                                </div>
                                                <div className="pointer-events-none absolute left-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <div className="bg-gray-900 text-white text-xs rounded px-2 py-1 shadow-lg">
                                                        <div className="font-semibold">{block.tag.name}</div>
                                                        <div className="opacity-80">
                                                            {block.startTime.slice(0, 5)} - {block.endTime.slice(0, 5)}
                                                        </div>
                                                        {block.detail && <div className="mt-1">{block.detail}</div>}
                                                    </div>
                                                </div>
                                            </button>
                                        ))}

                                        {blocks.length === 0 && (
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <div className="text-sm text-gray-400">
                                                    今天还没有记录，点击时间格开始规划吧。
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="w-full xl:w-80 flex-shrink-0">
                    <ActivityTagManager
                        tags={tags}
                        loading={tagsLoading}
                        onRefresh={refreshTags}
                    />
                </div>
            </div>

            {modalOpen && (
                <ActivityBlockModal
                    date={dateString}
                    tags={tags}
                    block={selectedBlock}
                    defaultStart={selectedStart}
                    defaultEnd={selectedEnd}
                    onClose={() => setModalOpen(false)}
                    onSuccess={() => {
                        setModalOpen(false)
                        refreshAll()
                    }}
                />
            )}
        </main>
    )
}