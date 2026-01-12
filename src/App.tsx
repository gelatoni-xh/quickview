import {useEffect, useState} from 'react'

// 定义Todo数据类型结构
type Todo = {
    id: number
    title: string
    completed: boolean
}

/**
 * 主应用组件 - 实现带侧边栏的待办事项看板界面
 *
 * 功能特性：
 * - 响应式布局设计
 * - 可折叠侧边栏菜单
 * - 从外部API获取待办事项数据
 * - 待办事项卡片展示（完成/未完成状态区分）
 *
 * @returns JSX.Element 返回完整的应用界面组件
 */
export default function App() {
    // 侧边栏状态管理
    const [sidebarOpen, setSidebarOpen] = useState(false)

    // 待办事项列表状态管理
    const [todos, setTodos] = useState<Todo[]>([])

    // 组件挂载时获取待办事项数据
    useEffect(() => {
        fetch('https://jsonplaceholder.typicode.com/todos?_limit=8')
            .then(res => res.json())
            .then(data => setTodos(data))
    }, [])

    return (
        <div className="h-screen flex bg-gray-100">
            {/* 左侧导航菜单 */}
            <aside
                className={`w-56 bg-white border-r fixed inset-y-0 left-0 z-40 transform transition-transform duration-200
    ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
  `}
            >
                <div className="flex items-center justify-between p-4 border-b">
                    <div className="font-bold text-lg">
                        QuickView
                    </div>

                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="text-gray-500 hover:text-black text-lg leading-none"
                        aria-label="Close sidebar"
                    >
                        ×
                    </button>
                </div>

                <nav className="px-4 space-y-2">
                    <div className="text-sm text-gray-600 font-medium">
                        Home
                    </div>
                </nav>
            </aside>

            {/* 侧边栏开启按钮 */}
            <button
                onClick={() => setSidebarOpen(true)}
                className="mb-4 inline-flex items-center px-3 py-2 text-sm bg-white border rounded shadow-sm hover:bg-gray-50"
            >
                ☰
            </button>

            {/* 主内容区域 */}
            <main className="flex-1 p-6 overflow-auto">
                <h1 className="text-2xl font-semibold mb-6">
                    Dashboard
                </h1>

                {/* 待办事项网格布局 */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {todos.map(todo => (
                        <div
                            key={todo.id}
                            className="bg-white rounded-lg shadow-sm p-4"
                        >
                            <div className="text-sm text-gray-500 mb-2">
                                Todo #{todo.id}
                            </div>
                            <div className="font-medium">
                                {todo.title}
                            </div>
                            <div
                                className={`mt-3 text-sm ${
                                    todo.completed ? 'text-green-600' : 'text-yellow-600'
                                }`}
                            >
                                {todo.completed ? 'Completed' : 'Pending'}
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    )
}

