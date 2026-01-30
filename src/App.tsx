/**
 * 应用程序根组件
 *
 * 定义应用的整体布局结构：
 * - AuthProvider: 认证状态管理
 * - Sidebar: 可折叠的侧边导航栏
 * - Header: 顶部标题栏，包含侧边栏开关按钮和用户信息
 * - Dashboard: 主内容区域，展示各种 Widget
 *
 * 布局采用 Flexbox，侧边栏为固定宽度，主内容区自适应。
 */
import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import Sidebar from './components/layout/Sidebar.tsx'
import Header from './components/layout/Header.tsx'
import Dashboard from './pages/Dashboard.tsx'
import ActivityLog from './pages/ActivityLog.tsx'
import UserPermissionMgmt from './pages/UserPermissionMgmt.tsx'
import _2KGames from './pages/2KGames.tsx'

function AppContent() {
    // 控制侧边栏的显示/隐藏状态
    const [sidebarOpen, setSidebarOpen] = useState(false)

    return (
        <AuthProvider>
            <div className="h-screen flex bg-gray-100">
                {/* 侧边导航栏 - 移动端默认隐藏，点击按钮展开 */}
                <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

                {/* 主内容区域 */}
                <div className="flex flex-col flex-1">
                    <Header setSidebarOpen={setSidebarOpen} />
                    <Routes>
                        <Route path="/" element={<Navigate to="/dashboard" replace />} />
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/activity-log" element={<ActivityLog />} />
                        <Route path="/2k-games" element={<_2KGames />} />
                        <Route path="/user-permission-mgmt" element={<UserPermissionMgmt />} />
                    </Routes>
                </div>
            </div>
        </AuthProvider>
    )
}

export default function App() {
    return (
        <Router>
            <AppContent />
        </Router>
    )
}