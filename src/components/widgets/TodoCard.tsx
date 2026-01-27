/**
 * TODO 卡片组件
 *
 * Dashboard 页面的 TODO Widget，展示 TODO 列表和标签筛选。
 *
 * 功能：
 * - 标签列表展示和筛选
 * - TODO 列表展示
 * - 新增标签
 * - 新增 TODO
 * - 编辑 TODO（切换完成状态、修改内容）
 */
import { useState } from 'react'
import { Plus, Tag, Trash2 } from 'lucide-react'
import { useTodoTags } from '../../hooks/useTodoTags'
import { useTodoItems } from '../../hooks/useTodoItems'
import { useUpdateTodoItem } from '../../hooks/useUpdateTodoItem'
import { useDeleteTodoItem } from '../../hooks/useDeleteTodoItem'
import { useDeleteTodoTag } from '../../hooks/useDeleteTodoTag'
import { useAuth } from '../../hooks/useAuth'
import { PERMISSIONS } from '../../constants/permissions'
import TodoItemRow from './todo/TodoItemRow'
import {TodoEditorModal} from './todo/TodoEditorModal'
import TagEditorModal from './todo/TagEditorModal'
import type { TodoItem } from '../../types/todo'

export default function TodoCard() {
    // 当前选中的标签 ID，null 表示显示全部
    const [selectedTagId, setSelectedTagId] = useState<number | null>(null)

    // 数据获取
    const { data: tags, loading: tagsLoading, refresh: refreshTags } = useTodoTags()
    const { data: items, loading: itemsLoading, error: itemsError, refresh: refreshItems } = useTodoItems(selectedTagId)

    // 更新 TODO
    const { updateItem } = useUpdateTodoItem()

    const { deleteItem } = useDeleteTodoItem()
    const { deleteTag } = useDeleteTodoTag()

    const { hasPermission } = useAuth()
    const canTodo = hasPermission(PERMISSIONS.TODO)

    // 弹窗状态
    const [showTagModal, setShowTagModal] = useState(false)
    const [showTodoModal, setShowTodoModal] = useState(false)
    const [editingTodo, setEditingTodo] = useState<TodoItem | null>(null)

    // 刷新所有数据
    const refreshAll = () => {
        refreshTags()
        refreshItems()
    }

    // 切换 TODO 完成状态
    const handleToggleComplete = async (item: TodoItem) => {
        const ok = await updateItem({
            id: item.id,
            completed: !item.completed,
        })
        if (ok) {
            refreshItems()
        }
    }

    // 打开编辑弹窗
    const handleEdit = (item: TodoItem) => {
        setEditingTodo(item)
        setShowTodoModal(true)
    }

    // 打开新增弹窗
    const handleAddTodo = () => {
        setEditingTodo(null)
        setShowTodoModal(true)
    }

    const handleDeleteItem = async (item: TodoItem) => {
        if (!canTodo) {
            return
        }
        const ok = window.confirm('确定删除该 TODO 吗？')
        if (!ok) {
            return
        }
        const success = await deleteItem(item.id)
        if (success) {
            refreshItems()
        }
    }

    const handleDeleteTag = async (tagId: number) => {
        if (!canTodo) {
            return
        }
        const ok = window.confirm('确定删除该标签吗？删除后关联该标签的 TODO 会取消关联。')
        if (!ok) {
            return
        }
        const success = await deleteTag(tagId)
        if (success) {
            if (selectedTagId === tagId) {
                setSelectedTagId(null)
            }
            refreshAll()
        }
    }

    const loading = tagsLoading || itemsLoading

    return (
        <>
            <div className="p-4 border rounded shadow flex flex-col">
                {/* 卡片头部 */}
                <div className="flex items-center justify-between mb-3">
                    <h2 className="font-semibold">TODO</h2>
                    <div className="flex items-center gap-1">
                        {/* 新增标签按钮 */}
                        {canTodo && (
                            <button
                                onClick={() => setShowTagModal(true)}
                                className="p-1 rounded hover:bg-gray-100 text-gray-600"
                                title="新增标签"
                            >
                                <Tag size={16} />
                            </button>
                        )}
                        {/* 新增 TODO 按钮 */}
                        {canTodo && (
                            <button
                                onClick={handleAddTodo}
                                className="p-1 rounded hover:bg-gray-100 text-gray-600"
                                title="新增 TODO"
                            >
                                <Plus size={18} />
                            </button>
                        )}
                    </div>
                </div>

                {/* 标签筛选栏 */}
                <div className="flex flex-wrap gap-1 mb-3">
                    <button
                        onClick={() => setSelectedTagId(null)}
                        className={`px-2 py-0.5 text-xs rounded-full border transition-colors
                            ${selectedTagId === null
                                ? 'bg-blue-500 text-white border-blue-500'
                                : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'}`}
                    >
                        全部
                    </button>
                    {tags.map((tag) => (
                        <div
                            key={tag.id}
                            className="flex items-center"
                        >
                            <button
                                onClick={() => setSelectedTagId(tag.id)}
                                className={`px-2 py-0.5 text-xs rounded-full border transition-colors
                                    ${selectedTagId === tag.id
                                        ? 'bg-blue-500 text-white border-blue-500'
                                        : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'}`}
                            >
                                {tag.name}
                            </button>
                            {canTodo && (
                                <button
                                    className="ml-0.5 p-1 text-gray-400 hover:text-red-600"
                                    title="删除标签"
                                    aria-label="删除标签"
                                    onClick={() => handleDeleteTag(tag.id)}
                                >
                                    <Trash2 size={12} />
                                </button>
                            )}
                        </div>
                    ))}
                </div>

                {/* 加载状态 */}
                {loading && <div className="text-sm text-gray-500">Loading...</div>}

                {/* 错误状态 */}
                {itemsError && <div className="text-sm text-red-500">{itemsError}</div>}

                {/* 空状态 */}
                {!loading && !itemsError && items.length === 0 && (
                    <div className="text-sm text-gray-400">暂无 TODO</div>
                )}

                {/* TODO 列表 */}
                <div className="flex-1 overflow-auto max-h-64">
                    {items.map((item) => (
                        <TodoItemRow
                            key={item.id}
                            item={item}
                            onToggleComplete={handleToggleComplete}
                            onEdit={handleEdit}
                            canDelete={canTodo}
                            onDelete={handleDeleteItem}
                        />
                    ))}
                </div>
            </div>

            {/* 新增标签弹窗 */}
            {showTagModal && (
                <TagEditorModal
                    onClose={() => setShowTagModal(false)}
                    onSuccess={() => {
                        setShowTagModal(false)
                        refreshAll()
                    }}
                />
            )}

            {/* 新增/编辑 TODO 弹窗 */}
            {showTodoModal && (
                <TodoEditorModal
                    todo={editingTodo}
                    tags={tags}
                    defaultTagId={selectedTagId}
                    onClose={() => {
                        setShowTodoModal(false)
                        setEditingTodo(null)
                    }}
                    onSuccess={() => {
                        setShowTodoModal(false)
                        setEditingTodo(null)
                        refreshAll()
                    }}
                />
            )}
        </>
    )
}
