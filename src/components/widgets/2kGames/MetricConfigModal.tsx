import { useState, useEffect } from 'react'
import type { MatchGameStatsMetricConfig, MatchGameStatsDimension } from '../../../types/matchGame'

interface MetricConfigModalProps {
    dimension: MatchGameStatsDimension
    metricConfigs: MatchGameStatsMetricConfig[]
    visibleMetrics: Set<string>
    onClose: () => void
    onSave: (metrics: Set<string>) => void
}

export default function MetricConfigModal(props: MetricConfigModalProps) {
    const [selected, setSelected] = useState<Set<string>>(new Set(props.visibleMetrics))

    useEffect(() => {
        setSelected(new Set(props.visibleMetrics))
    }, [props.visibleMetrics])

    const handleToggle = (metric: string) => {
        const newSelected = new Set(selected)
        if (newSelected.has(metric)) {
            newSelected.delete(metric)
        } else {
            newSelected.add(metric)
        }
        setSelected(newSelected)
    }

    const handleSave = () => {
        props.onSave(selected)
        props.onClose()
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col">
                <div className="px-6 py-4 border-b flex items-center justify-between">
                    <h2 className="text-lg font-semibold">显示项配置</h2>
                    <button onClick={props.onClose} className="text-gray-400 hover:text-gray-600">✕</button>
                </div>

                <div className="flex-1 overflow-auto p-6">
                    <div className="grid grid-cols-2 gap-3">
                        {props.metricConfigs.map((config) => (
                            <label key={config.metric} className="flex items-center gap-2 p-3 border rounded hover:bg-gray-50 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={selected.has(config.metric)}
                                    onChange={() => handleToggle(config.metric)}
                                    className="w-4 h-4"
                                />
                                <span className="text-sm">{config.desc}</span>
                            </label>
                        ))}
                    </div>
                </div>

                <div className="px-6 py-4 border-t flex justify-end gap-3">
                    <button onClick={props.onClose} className="px-4 py-2 text-sm border rounded hover:bg-gray-50">
                        取消
                    </button>
                    <button onClick={handleSave} className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">
                        保存
                    </button>
                </div>
            </div>
        </div>
    )
}
