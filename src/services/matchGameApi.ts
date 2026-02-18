import { apiDelete, apiGet, apiPost, apiPut } from '../utils/api'
import type { ApiPostBody } from '../utils/api'
import type {
    MatchGameBaseDataResponse,
    MatchGameCreateResponse,
    MatchGameDeleteResponse,
    MatchGameDetailResponse,
    MatchGamePageResponse,
    MatchGameStatsDimension,
    MatchGameStatsResponse,
    MatchGameUpdateResponse,
    MatchPlayerStatsDTO,
    MatchTeamStatsDTO,
    OpponentStatsResponse,
} from '../types/matchGame'

export interface MatchGamePageRequest {
    pageNum: number
    pageSize: number
    season: string | null
}

export interface MatchGameUpsertRequest {
    id?: number
    season: string
    matchTime: string
    isRobot: boolean
    myScore: number
    oppScore: number
    result: boolean
    remark: string
    creator?: number
    modifier?: number
    teamStatsList: MatchTeamStatsDTO[] | null
    playerStatsList: MatchPlayerStatsDTO[] | null
}

export interface MatchGameStatsRequest {
    season: string | null
    matchDate: string | null
    excludeRobot: boolean
    dimension: MatchGameStatsDimension
}

export interface MatchGameTrendRequest {
    season: string | null
    excludeRobot: boolean
    dimension: string
}

export interface MatchGameTrendData {
    dates: string[]
    winRate: number[]
    playerMetrics: {
        [playerName: string]: {
            rating: number[]
            score: number[]
            rebound: number[]
            assist: number[]
            steal: number[]
            block: number[]
        }
    }
}

export interface MatchGameTrendResponse {
    success: boolean
    statusCode: string
    data: MatchGameTrendData
    message: string | null
    traceId: string
}

export async function getMatchGamePage(req: MatchGamePageRequest) {
    return apiPost<MatchGamePageResponse>('/api/match-game/page', req as unknown as ApiPostBody)
}

export async function getMatchGameDetail(gameId: number) {
    return apiGet<MatchGameDetailResponse>(`/api/match-game/detail/${gameId}`)
}

export async function createMatchGame(req: MatchGameUpsertRequest) {
    return apiPost<MatchGameCreateResponse>('/api/match-game/create', req as unknown as ApiPostBody)
}

export async function updateMatchGame(req: MatchGameUpsertRequest) {
    return apiPut<MatchGameUpdateResponse>('/api/match-game/update', req as unknown as ApiPostBody)
}

export async function deleteMatchGame(gameId: number) {
    return apiDelete<MatchGameDeleteResponse>(`/api/match-game/delete/${gameId}`)
}

export async function getMatchGameStats(req: MatchGameStatsRequest) {
    return apiPost<MatchGameStatsResponse>('/api/match-game/stats', req as unknown as ApiPostBody)
}

export async function getMatchGameTrend(req: MatchGameTrendRequest) {
    return apiPost<MatchGameTrendResponse>('/api/match-game/trend', req as unknown as ApiPostBody)
}

export async function clearMatchGameCache() {
    return apiPost<boolean>('/api/match-game/clear-cache', {})
}

export async function getMatchGameBaseData() {
    return apiGet<MatchGameBaseDataResponse>('/api/match-game/base-data')
}

export async function getOpponentStats(season?: string | null, minGames?: number) {
    const params = new URLSearchParams()
    if (season) params.append('season', season)
    if (minGames) params.append('minGames', minGames.toString())
    return apiGet<OpponentStatsResponse>(`/api/match-game/opponent-stats${params.toString() ? '?' + params.toString() : ''}`)
}
