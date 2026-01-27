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
            className={`w-56 bg-white border-r fixed inset-y-0 left-0 z-40 transform transition-transform duration-200
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}
        >
            {/* 侧边栏头部：Logo 和关闭按钮 */}
            <div className="flex items-center justify-between p-4 border-b">
                <div className="font-bold text-lg">QuickView</div>
                <button
                    onClick={() => setSidebarOpen(false)}
                    className="text-gray-500 hover:text-black text-lg leading-none"
                    aria-label="Close sidebar"
                >
                    ×
                </button>
            </div>

            {/* 导航菜单 */}
            <nav className="px-4 space-y-2">
                <Link 
                    to="/dashboard" 
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100"
                    onClick={() => setSidebarOpen(false)}
                >
                    Dashboard
                </Link>
                {/* 只有有权限的用户才能看到Activity Log链接 */}
                {hasPermission(PERMISSIONS.ACTIVITY) && (
                    <Link 
                        to="/activity-log" 
                        className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100"
                        onClick={() => setSidebarOpen(false)}
                    >
                        Activity Log
                    </Link>
                )}
                {hasPermission(PERMISSIONS.USER_PERMISSION_MGMT) && (
                    <Link
                        to="/user-permission-mgmt"
                        className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100"
                        onClick={() => setSidebarOpen(false)}
                    >
                        权限管理
                    </Link>
                )}
            </nav>
        </aside>
    )
}