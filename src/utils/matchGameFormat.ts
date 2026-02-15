import type { MatchGameDTO } from '../types/matchGame'

export function toInputDatetimeLocalValue(value: string): string {
    if (!value) return ''

    if (value.includes('T') && value.length >= 16) {
        return value.slice(0, 16)
    }

    const date = new Date(value)
    if (Number.isNaN(date.getTime())) {
        return ''
    }

    const pad = (n: number) => String(n).padStart(2, '0')
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

export function formatDatetime(value: string): string {
    if (!value) return '-'

    try {
        const date = new Date(value)
        if (Number.isNaN(date.getTime())) {
            return value
        }
        return date.toLocaleString()
    } catch {
        return value
    }
}

export function calcWinnerText(game: MatchGameDTO): string {
    return game.result ? '胜' : '负'
}

export function ensureNumber(v: string, fallback: number): number {
    const n = Number(v)
    if (Number.isNaN(n)) return fallback
    return n
}

export function normalizeLocalDateTime(value: string): string {
    if (!value) return value
    if (value.length === 16) {
        return value + ':00'
    }
    return value
}

export function formatPct01(rate?: number): string {
    const v = typeof rate === 'number' && !Number.isNaN(rate) ? rate : 0
    return (v * 100).toFixed(1) + '%'
}
