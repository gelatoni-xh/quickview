import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { PERMISSIONS } from '../../constants/permissions'

/**
 * 侧边导航栏组件
 *
 * 可折叠的侧边导航栏，包含应用 Logo 和导航菜单。
 * 使用 CSS transform 实现平滑的展开/收起动画。
 *
 * 特性：
 * - 固定定位，覆盖在主内容之上
 * - 支持平滑的滑入/滑出动画
 * - 包含关闭按钮
 */

/** Sidebar 组件的 Props 类型 */
type SidebarProps = {
    /** 侧边栏是否打开 */
    sidebarOpen: boolean
    /** 设置侧边栏打开/关闭状态的函数 */
    setSidebarOpen: (open: boolean) => void
}

export default function Sidebar({ sidebarOpen, setSidebarOpen }: SidebarProps) {
    const { hasPermission } = useAuth();

    return (
        <aside
            className={`w-56 bg-cyber-surface border-r border-cyber-border fixed inset-y-0 left-0 z-40 transform transition-transform duration-200 print:hidden shadow-cyber
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}
        >
            {/* 侧边栏头部：Logo 和关闭按钮 */}
            <div className="flex items-center justify-between p-4 border-b border-cyber-border">
                <div className="font-bold text-lg text-cyber-accent tracking-widest">Gelatoni</div>
                <button
                    onClick={() => setSidebarOpen(false)}
                    className="text-cyber-muted hover:text-cyber-accent text-lg leading-none transition-colors"
                    aria-label="Close sidebar"
                >
                    ×
                </button>
            </div>

            {/* 导航菜单 */}
            <nav className="px-4 py-2 space-y-1">
                {hasPermission(PERMISSIONS.DASHBOARD) && (
                    <Link
                        to="/dashboard"
                        className="block px-3 py-2 rounded text-sm font-medium text-cyber-text hover:text-cyber-accent hover:bg-cyber-border/30 transition-colors"
                        onClick={() => setSidebarOpen(false)}
                    >
                        Dashboard
                    </Link>
                )}
                {hasPermission(PERMISSIONS.BLOG_VIEW) && (
                    <Link
                        to="/blog"
                        className="block px-3 py-2 rounded text-sm font-medium text-cyber-text hover:text-cyber-accent hover:bg-cyber-border/30 transition-colors"
                        onClick={() => setSidebarOpen(false)}
                    >
                        博客
                    </Link>
                )}
                {hasPermission(PERMISSIONS.RESUME) && (
                    <Link
                        to="/resume"
                        className="block px-3 py-2 rounded text-sm font-medium text-cyber-text hover:text-cyber-accent hover:bg-cyber-border/30 transition-colors"
                        onClick={() => setSidebarOpen(false)}
                    >
                        简历
                    </Link>
                )}
                {hasPermission(PERMISSIONS.ACTIVITY) && (
                    <Link
                        to="/activity-log"
                        className="block px-3 py-2 rounded text-sm font-medium text-cyber-text hover:text-cyber-accent hover:bg-cyber-border/30 transition-colors"
                        onClick={() => setSidebarOpen(false)}
                    >
                        Activity Log
                    </Link>
                )}
                {hasPermission(PERMISSIONS.MATCH) && (
                    <Link
                        to="/2k-games"
                        className="block px-3 py-2 rounded text-sm font-medium text-cyber-text hover:text-cyber-accent hover:bg-cyber-border/30 transition-colors"
                        onClick={() => setSidebarOpen(false)}
                    >
                        2K Games
                    </Link>
                )}
                <Link
                    to="/ai-chat"
                    className="block px-3 py-2 rounded text-sm font-medium text-cyber-text hover:text-cyber-accent hover:bg-cyber-border/30 transition-colors"
                    onClick={() => setSidebarOpen(false)}
                >
                    LLM / Agent
                </Link>
                {hasPermission(PERMISSIONS.USER_PERMISSION_MGMT) && (
                    <Link
                        to="/user-permission-mgmt"
                        className="block px-3 py-2 rounded text-sm font-medium text-cyber-text hover:text-cyber-accent hover:bg-cyber-border/30 transition-colors"
                        onClick={() => setSidebarOpen(false)}
                    >
                        权限管理
                    </Link>
                )}
            </nav>
        </aside>
    )
}