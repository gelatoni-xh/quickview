import { useSystemHealth } from '../../hooks/useSystemHealth'

export default function SystemHealthCard() {
    const { data, loading, error } = useSystemHealth()

    if (loading) return <div>Loading system health...</div>
    if (error) return <div>Error: {error}</div>
    if (!data) return <div>No data</div>

    return (
        <div className="p-4 border rounded shadow">
            <h2 className="font-semibold mb-2">System Health</h2>

            <p
                className={
                    data.status === 'ok' ? 'text-green-600' : 'text-red-600'
                }
            >
                Status: {data.status}
            </p>

            <p className="text-sm text-gray-500 mt-1">
                Environment: {data.env}
            </p>
        </div>
    )
}
