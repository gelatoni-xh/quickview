/**
 * 活动标签管理区
 */
import { Plus, Trash2, X } from 'lucide-react'
import { useState } from 'react'
import type { ActivityTag } from '../../../types/activity'
import { useCreateActivityTag } from '../../../hooks/useCreateActivityTag'
import { useUpdateActivityTag } from '../../../hooks/useUpdateActivityTag'
import { useDeleteActivityTag } from '../../../hooks/useDeleteActivityTag'

interface Props {
    tags: ActivityTag[]
    loading: boolean
    onRefresh: () => void
}

const defaultColors = ['#1F7AE0', '#00B28A', '#FF8A00', '#E54D2E', '#6E56CF', '#2E7D6D']

export default function ActivityTagManager({ tags, loading, onRefresh }: Props) {
    const [collapsed, setCollapsed] = useState(false)
    const [showCreate, setShowCreate] = useState(false)
    const [newName, setNewName] = useState('')
    const [newColor, setNewColor] = useState(defaultColors[0])

    const [editingId, setEditingId] = useState<number | null>(null)
    const [editingName, setEditingName] = useState('')
    const [editingColor, setEditingColor] = useState('#1F7AE0')

    const { createTag, loading: createLoading, error: createError } = useCreateActivityTag()
    const { updateTag, loading: updateLoading, error: updateError } = useUpdateActivityTag()
    const { deleteTag, loading: deleteLoading, error: deleteError } = useDeleteActivityTag()

    const startEdit = (tag: ActivityTag) => {
        setEditingId(tag.id)
        setEditingName(tag.name)
        setEditingColor(tag.color)
    }

    const resetCreate = () => {
        setNewName('')
        setNewColor(defaultColors[0])
        setShowCreate(false)
    }

    const handleCreate = async () => {
        if (!newName.trim()) {
            alert('标签名称不能为空')
            return
        }
        const ok = await createTag({ name: newName.trim(), color: newColor })
        if (ok) {
            resetCreate()
            onRefresh()
        }
    }

    const handleUpdate = async () => {
        if (!editingId) {
            return
        }
        if (!editingName.trim()) {
            alert('标签名称不能为空')
            return
        }
        const ok = await updateTag({ id: editingId, name: editingName.trim(), color: editingColor })
        if (ok) {
            setEditingId(null)
            onRefresh()
        }
    }

    const handleDelete = async (id: number) => {
        if (!confirm('确定删除该标签吗？若标签被使用会失败。')) {
            return
        }
        const ok = await deleteTag({ id })
        if (ok) {
            onRefresh()
        }
    }

    const mergedError = createError || updateError || deleteError

    return (
        <div className="bg-white rounded-lg border shadow-sm">
            <div className="flex items-center justify-between px-4 py-3 border-b">
                <div>
                    <h3 className="font-semibold">活动标签</h3>
                    <p className="text-xs text-gray-500 mt-1">颜色是活动的视觉索引</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className="text-xs text-gray-500 hover:text-gray-700"
                    >
                        {collapsed ? '展开' : '收起'}
                    </button>
                    <button
                        onClick={() => setShowCreate(true)}
                        className="p-1 rounded hover:bg-gray-100 text-gray-600"
                        aria-label="新增标签"
                        disabled={loading}
                    >
                        <Plus size={16} />
                    </button>
                </div>
            </div>

            {!collapsed && (
                <div className="p-4">
                    {loading && <div className="text-sm text-gray-500">Loading...</div>}
                    {!loading && tags.length === 0 && (
                        <div className="text-sm text-gray-400">暂无标签，先创建一个颜色标签吧。</div>
                    )}

                    <div className="space-y-3">
                        {tags.map((tag) => (
                            <div
                                key={tag.id}
                                className="flex items-center justify-between gap-2 p-2 rounded-lg border border-gray-100 hover:border-gray-200"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="w-4 h-4 rounded-full" style={{ backgroundColor: tag.color }} />
                                    <div>
                                        <div className="text-sm font-medium">{tag.name}</div>
                                        <div className="text-xs text-gray-400">{tag.color}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => startEdit(tag)}
                                        className="text-xs text-gray-500 hover:text-gray-800"
                                    >
                                        编辑
                                    </button>
                                    <button
                                        onClick={() => handleDelete(tag.id)}
                                        className="text-xs text-red-500 hover:text-red-600"
                                        disabled={deleteLoading}
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {mergedError && <div className="text-sm text-red-500 mt-3">{mergedError}</div>}
                </div>
            )}

            {showCreate && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className="w-full max-w-md bg-white rounded shadow-lg p-5">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold">新增标签</h3>
                            <button onClick={resetCreate} aria-label="关闭">
                                <X size={18} />
                            </button>
                        </div>
                        <input
                            className="w-full border rounded px-3 py-2 mb-3 text-sm"
                            placeholder="标签名称"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                        />
                        <div className="flex items-center gap-2 mb-3">
                            <input
                                type="color"
                                value={newColor}
                                onChange={(e) => setNewColor(e.target.value)}
                                className="w-12 h-10 border rounded"
                            />
                            <div className="flex flex-wrap gap-2">
                                {defaultColors.map((color) => (
                                    <button
                                        key={color}
                                        onClick={() => setNewColor(color)}
                                        className={`w-6 h-6 rounded-full border ${
                                            newColor === color ? 'border-gray-900' : 'border-gray-200'
                                        }`}
                                        style={{ backgroundColor: color }}
                                    />
                                ))}
                            </div>
                        </div>
                        {createError && <div className="text-sm text-red-500 mb-2">{createError}</div>}
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={resetCreate}
                                className="px-3 py-1 text-sm rounded border"
                                disabled={createLoading}
                            >
                                取消
                            </button>
                            <button
                                onClick={handleCreate}
                                className="px-3 py-1 text-sm rounded bg-blue-600 text-white disabled:opacity-50"
                                disabled={createLoading}
                            >
                                {createLoading ? '创建中...' : '创建'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {editingId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className="w-full max-w-md bg-white rounded shadow-lg p-5">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold">编辑标签</h3>
                            <button onClick={() => setEditingId(null)} aria-label="关闭">
                                <X size={18} />
                            </button>
                        </div>
                        <input
                            className="w-full border rounded px-3 py-2 mb-3 text-sm"
                            placeholder="标签名称"
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                        />
                        <div className="flex items-center gap-2 mb-3">
                            <input
                                type="color"
                                value={editingColor}
                                onChange={(e) => setEditingColor(e.target.value)}
                                className="w-12 h-10 border rounded"
                            />
                            <div className="flex flex-wrap gap-2">
                                {defaultColors.map((color) => (
                                    <button
                                        key={color}
                                        onClick={() => setEditingColor(color)}
                                        className={`w-6 h-6 rounded-full border ${
                                            editingColor === color ? 'border-gray-900' : 'border-gray-200'
                                        }`}
                                        style={{ backgroundColor: color }}
                                    />
                                ))}
                            </div>
                        </div>
                        {updateError && <div className="text-sm text-red-500 mb-2">{updateError}</div>}
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setEditingId(null)}
                                className="px-3 py-1 text-sm rounded border"
                                disabled={updateLoading}
                            >
                                取消
                            </button>
                            <button
                                onClick={handleUpdate}
                                className="px-3 py-1 text-sm rounded bg-blue-600 text-white disabled:opacity-50"
                                disabled={updateLoading}
                            >
                                {updateLoading ? '保存中...' : '保存'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
