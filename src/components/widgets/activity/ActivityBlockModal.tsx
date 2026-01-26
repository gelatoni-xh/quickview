/**
 * 活动记录编辑弹窗
 */
import { X } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { ActivityBlock, ActivityTag } from '../../../types/activity'
import { useCreateOrUpdateActivityBlock } from '../../../hooks/useCreateOrUpdateActivityBlock'
import { useDeleteActivityBlock } from '../../../hooks/useDeleteActivityBlock'

interface Props {
    date: string
    tags: ActivityTag[]
    block?: ActivityBlock | null
    defaultStart: string
    defaultEnd: string
    onClose: () => void
    onSuccess: () => void
}

function buildTimeOptions() {
    const times: string[] = []
    for (let hour = 0; hour < 24; hour += 1) {
        for (let minute = 0; minute < 60; minute += 30) {
            const h = String(hour).padStart(2, '0')
            const m = String(minute).padStart(2, '0')
            times.push(`${h}:${m}`)
        }
    }
    times.push('24:00')
    return times
}

export default function ActivityBlockModal({
    date,
    tags,
    block,
    defaultStart,
    defaultEnd,
    onClose,
    onSuccess,
}: Props) {
    const timeOptions = useMemo(() => buildTimeOptions(), [])
    const [startTime, setStartTime] = useState(block?.startTime?.slice(0, 5) || defaultStart)
    const [endTime, setEndTime] = useState(block?.endTime?.slice(0, 5) || defaultEnd)
    const [tagId, setTagId] = useState<number>(block?.tag?.id || tags[0]?.id || 0)
    const [detail, setDetail] = useState(block?.detail || '')

    const { createOrUpdate, loading, error } = useCreateOrUpdateActivityBlock()
    const { removeBlock, loading: deleteLoading, error: deleteError } = useDeleteActivityBlock()

    const handleSubmit = async () => {
        if (!tagId) {
            alert('请先创建活动标签')
            return
        }
        if (endTime <= startTime) {
            alert('结束时间需要晚于开始时间')
            return
        }

        const ok = await createOrUpdate({
            tagId,
            activityDate: date,
            startTime,
            endTime,
            detail: detail.trim() || null,
        })
        if (ok) {
            onSuccess()
        }
    }

    const handleDelete = async () => {
        if (!block?.id) {
            return
        }
        const ok = await removeBlock({ id: block.id })
        if (ok) {
            onSuccess()
        }
    }

    const mergedError = error || deleteError

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="w-full max-w-xl bg-white rounded shadow-lg p-5">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-lg font-semibold">{block ? '编辑活动记录' : '新增活动记录'}</h3>
                        <p className="text-xs text-gray-500 mt-1">{date}</p>
                    </div>
                    <button onClick={onClose} aria-label="关闭">
                        <X size={18} />
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm text-gray-600 mb-1">开始时间</label>
                        <select
                            className="w-full border rounded px-3 py-2 text-sm"
                            value={startTime}
                            onChange={(e) => setStartTime(e.target.value)}
                        >
                            {timeOptions.map((time) => (
                                <option key={`start-${time}`} value={time}>
                                    {time}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm text-gray-600 mb-1">结束时间</label>
                        <select
                            className="w-full border rounded px-3 py-2 text-sm"
                            value={endTime}
                            onChange={(e) => setEndTime(e.target.value)}
                        >
                            {timeOptions.map((time) => (
                                <option key={`end-${time}`} value={time}>
                                    {time}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="mt-4">
                    <label className="block text-sm text-gray-600 mb-2">标签</label>
                    {tags.length === 0 ? (
                        <div className="text-sm text-gray-400">暂无标签，请先在右侧创建标签。</div>
                    ) : (
                        <div className="flex flex-wrap gap-2">
                            {tags.map((tag) => (
                                <button
                                    key={tag.id}
                                    onClick={() => setTagId(tag.id)}
                                    className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm border transition-colors ${
                                        tagId === tag.id
                                            ? 'border-gray-900 text-gray-900'
                                            : 'border-transparent text-gray-600 hover:border-gray-300'
                                    }`}
                                >
                                    <span
                                        className="w-3 h-3 rounded-full"
                                        style={{ backgroundColor: tag.color }}
                                    />
                                    {tag.name}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="mt-4">
                    <label className="block text-sm text-gray-600 mb-1">详细描述</label>
                    <textarea
                        className="w-full h-24 border rounded px-3 py-2 text-sm"
                        placeholder="记录这段时间的内容"
                        value={detail}
                        onChange={(e) => setDetail(e.target.value)}
                    />
                </div>

                {mergedError && <div className="text-sm text-red-500 mt-2">{mergedError}</div>}

                <div className="flex justify-between items-center mt-5">
                    <button
                        onClick={onClose}
                        className="px-3 py-1 text-sm rounded border"
                        disabled={loading || deleteLoading}
                    >
                        取消
                    </button>
                    <div className="flex items-center gap-2">
                        {block && (
                            <button
                                onClick={handleDelete}
                                className="px-3 py-1 text-sm rounded border border-red-200 text-red-600 hover:bg-red-50"
                                disabled={loading || deleteLoading}
                            >
                                {deleteLoading ? '删除中...' : '删除'}
                            </button>
                        )}
                        <button
                            onClick={handleSubmit}
                            disabled={loading || tags.length === 0}
                            className="px-4 py-1 text-sm rounded bg-blue-600 text-white disabled:opacity-50"
                        >
                            {loading ? '保存中...' : '保存'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
