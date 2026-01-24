/**
 * 公告 Widget 组件（简化版）
 *
 * 展示公告列表的简单 Widget，不包含新增功能。
 * 适用于只需要展示公告的场景。
 *
 * 注意：如果需要新增公告功能，请使用 NoticeCard 组件。
 *
 * @see NoticeCard 带新增功能的完整版公告卡片
 */
import { useNotices } from '../../../hooks/useNotices'
import NoticeItem from '../notice/NoticeItem'

export default function NoticeWidget() {
    // 获取公告数据，默认显示 10 条
    const { data, loading, error } = useNotices(1, 10)

    // 加载状态
    if (loading) return <div>Loading notices...</div>

    // 错误状态
    if (error) return <div>Error: {error}</div>

    // 空状态
    if (data.length === 0) return <div>No notices</div>

    return (
        <div className="p-4 border rounded shadow">
            <h2 className="font-semibold mb-3">公告</h2>

            {/* 公告列表 */}
            <div className="space-y-3">
                {data.map((notice, idx) => (
                    <NoticeItem key={idx} notice={notice} />
                ))}
            </div>
        </div>
    )
}
