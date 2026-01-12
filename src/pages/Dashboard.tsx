type Todo = {
    id: number
    title: string
    completed: boolean
}

type DashboardProps = {
    todos: Todo[]
}

export default function Dashboard({ todos }: DashboardProps) {
    return (
        <main className="flex-1 p-6 overflow-auto">
            <h1 className="text-2xl font-semibold mb-6">Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {todos.map(todo => (
                    <div key={todo.id} className="bg-white rounded-lg shadow-sm p-4">
                        <div className="text-sm text-gray-500 mb-2">Todo #{todo.id}</div>
                        <div className="font-medium">{todo.title}</div>
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
    )
}
