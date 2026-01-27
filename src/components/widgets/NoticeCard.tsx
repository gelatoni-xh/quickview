/**
 * 公告卡片组件
 *
 * Dashboard 页面的公告 Widget，展示最新公告列表。
 *
 * 功能：
 * - 展示公告列表（默认显示 5 条）
 * - 新增公告按钮（打开编辑弹窗，需要 PERM_NOTICE_CREATE 权限）
 * - 加载状态和错误状态展示
 * - 查看全部按钮（预留功能）
 *
 * 使用的 Hook：
 * - useNotices: 获取公告列表数据
 * - useAuth: 权限检查
 */
import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useNotices } from '../../hooks/useNotices'
import { useAuth } from '../../hooks/useAuth'
import { PERMISSIONS } from '../../constants/permissions'
import NoticeItem from './notice/NoticeItem'
import NoticeEditorModal from './notice/NoticeEditorModal'

export default function NoticeCard() {
    // 获取公告数据，默认显示第 1 页，每页 5 条
    const { data, loading, error, refresh } = useNotices(1, 5)
    // 控制新增公告弹窗的显示状态
    const [open, setOpen] = useState(false)
    // 权限检查
    const { hasPermission } = useAuth()
    const canCreate = hasPermission(PERMISSIONS.NOTICE_CREATE)

    return (
        <>
            {/* 公告卡片容器 */}
            <div className="p-4 border rounded shadow flex flex-col relative">
                {/* 卡片头部：标题和新增按钮 */}
                <div className="flex items-center justify-between mb-3">
                    <h2 className="font-semibold">公告</h2>

                    {/* 只有拥有创建权限时才显示新增按钮 */}
                    {canCreate && (
                        <button
                            onClick={() => setOpen(true)}
                            className="p-1 rounded hover:bg-gray-100 text-gray-600"
                            title="新增公告"
                            aria-label="新增公告"
                        >
                            <Plus size={18} />
                        </button>
                    )}
                </div>

                {/* 加载状态 */}
                {loading && <div className="text-sm text-gray-500">Loading...</div>}

                {/* 错误状态 */}
                {error && <div className="text-sm text-red-500">{error}</div>}

                {/* 空状态 */}
                {!loading && !error && data.length === 0 && (
                    <div className="text-sm text-gray-400">暂无公告</div>
                )}

                {/* 公告列表 */}
                <div className="flex-1 space-y-3">
                    {data.map((notice) => (
                        <NoticeItem
                            key={notice.id}
                            notice={notice}
                            onDeleted={refresh}
                        />
                    ))}
                </div>

                {/* 卡片底部：查看全部按钮 */}
                <div className="mt-3 text-right">
                    <button className="text-sm text-blue-600 hover:underline">
                        查看全部
                    </button>
                </div>
            </div>

            {/* 新增公告弹窗 */}
            {open && (
                <NoticeEditorModal
                    onClose={() => setOpen(false)}
                    onSuccess={() => {
                        setOpen(false)
                        refresh() // 创建成功后刷新列表
                    }}
                />
            )}
        </>
    )
}
