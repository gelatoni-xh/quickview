/**
 * 应用程序根组件
 *
 * 定义应用的整体布局结构：
 * - Sidebar: 可折叠的侧边导航栏
 * - Header: 顶部标题栏，包含侧边栏开关按钮
 * - Dashboard: 主内容区域，展示各种 Widget
 *
 * 布局采用 Flexbox，侧边栏为固定宽度，主内容区自适应。
 */
import { useState } from 'react'
import Sidebar from './components/layout/Sidebar.tsx'
import Header from './components/layout/Header.tsx'
import Dashboard from './pages/Dashboard.tsx'

export default function App() {
    // 控制侧边栏的显示/隐藏状态
    const [sidebarOpen, setSidebarOpen] = useState(false)

    return (
        <div className="h-screen flex bg-gray-100">
            {/* 侧边导航栏 - 移动端默认隐藏，点击按钮展开 */}
            <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

            {/* 主内容区域 */}
            <div className="flex flex-col flex-1">
                <Header setSidebarOpen={setSidebarOpen} />
                <Dashboard />
            </div>
        </div>
    )
}
