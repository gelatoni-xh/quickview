/**
 * Dashboard 页面组件
 *
 * 应用的主页面，采用响应式网格布局展示各种 Widget 卡片。
 * 当前包含：
 * - NoticeCard: 公告卡片，展示最新公告列表
 *
 * 响应式布局：
 * - 移动端: 1 列
 * - 平板: 2 列
 * - 桌面: 4 列
 */
import NoticeCard from "../components/widgets/NoticeCard.tsx";

export default function Dashboard() {
    return (
        <main className="flex-1 p-6 overflow-auto">
            <h1 className="text-2xl font-semibold mb-6">Dashboard</h1>

            {/* Widget 网格容器 - 响应式布局 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <NoticeCard />
                {/* 预留位置：可以继续添加其他 Widget，如 TODO 列表、统计卡片等 */}
            </div>
        </main>
    )
}