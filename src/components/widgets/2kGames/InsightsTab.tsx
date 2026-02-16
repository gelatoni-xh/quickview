import { useState, useMemo } from 'react'
import type { MatchGameBaseDataDTO } from '../../../types/matchGame'
import UnbeatenOpponentsInsight from './insights/UnbeatenOpponentsInsight'
import PlayerPerformanceTrendInsight from './insights/PlayerPerformanceTrendInsight'

type InsightKey = 'unbeaten' | 'trend'

interface InsightsTabProps {
    baseData: MatchGameBaseDataDTO | null
}

export default function InsightsTab({ baseData }: InsightsTabProps) {
    const [insightTab, setInsightTab] = useState<InsightKey>('unbeaten')

    const insightTabs = useMemo(() => {
        return [
            { key: 'unbeaten' as const, label: '最无法碰到的对手' },
            { key: 'trend' as const, label: '球员表现浮动' },
        ]
    }, [])

    return (
        <div className="bg-white rounded-xl border shadow-sm p-6">
            <div className="flex items-center gap-2 mb-6 border-b">
                {insightTabs.map((t) => (
                    <button
                        key={t.key}
                        onClick={() => setInsightTab(t.key)}
                        className={
                            'px-4 py-2 text-sm rounded-lg transition-colors border-b-2 ' +
                            (insightTab === t.key
                                ? 'border-blue-600 text-blue-600 font-semibold'
                                : 'border-transparent text-gray-600 hover:text-gray-900')
                        }
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            <div className="mt-6">
                {insightTab === 'unbeaten' && <UnbeatenOpponentsInsight />}
                {insightTab === 'trend' && <PlayerPerformanceTrendInsight baseData={baseData} />}
            </div>
        </div>
    )
}
