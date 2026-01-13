import WorldTimeCard from '../components/widgets/WorldTimeCard.tsx'

export default function Dashboard() {
    return (
        <main className="flex-1 p-6 overflow-auto">
            <h1 className="text-2xl font-semibold mb-6">Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <WorldTimeCard />
                {/* 以后可以继续加 Widget */}
            </div>
        </main>
    )
}