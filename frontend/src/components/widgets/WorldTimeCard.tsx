import { useWorldTime } from '../../hooks/useWorldTime'

export default function WorldTimeCard() {
    const { data, loading, error } = useWorldTime()

    if (loading) return <div>Loading world time...</div>
    if (error) return <div>Error: {error}</div>
    if (!data) return <div>No data</div>

    return (
        <div className="grid grid-cols-1 gap-4">
            {data.timezones.map(tz => (
                <div key={tz.timezone} className="p-4 border rounded shadow">
                    <h2 className="font-semibold">{tz.timezone}</h2>
                    {tz.error ? (
                        <p className="text-red-500">{tz.error}</p>
                    ) : (
                        <>
                            <p>{tz.datetime}</p>
                            <p>UTC offset: {tz.utc_offset}</p>
                            {tz.attempts !== undefined && <p>Attempts: {tz.attempts}</p>}
                        </>
                    )}
                </div>
            ))}
            <p className="text-sm text-gray-500 mt-2">
                Updated at: {data.updated_at}
            </p>
        </div>
    )
}
