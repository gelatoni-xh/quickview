import { useState } from 'react'
import Sidebar from './components/layout/Sidebar.tsx'
import Header from './components/layout/Header.tsx'
import Dashboard from './pages/Dashboard.tsx'

export default function App() {
    const [sidebarOpen, setSidebarOpen] = useState(false)

    return (
        <div className="h-screen flex bg-gray-100">
            <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
            <div className="flex flex-col flex-1">
                <Header setSidebarOpen={setSidebarOpen} />
                <Dashboard />
            </div>
        </div>
    )
}
