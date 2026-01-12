import { useEffect, useState } from 'react'
import Sidebar from './components/layout/Sidebar'
import Header from './components/layout/Header'
import Dashboard from './pages/Dashboard'

type Todo = {
    id: number
    title: string
    completed: boolean
}

export default function App() {
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [todos, setTodos] = useState<Todo[]>([])

    useEffect(() => {
        fetch('https://jsonplaceholder.typicode.com/todos?_limit=8')
            .then(res => res.json())
            .then(data => setTodos(data))
    }, [])

    return (
        <div className="h-screen flex bg-gray-100">
            <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
            <div className="flex flex-col flex-1">
                <Header setSidebarOpen={setSidebarOpen} />
                <Dashboard todos={todos} />
            </div>
        </div>
    )
}
