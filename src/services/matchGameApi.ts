import { apiDelete, apiGet, apiPost, apiPut } from '../utils/api'
import type { ApiPostBody } from '../utils/api'
import type {
    MatchGameCreateResponse,
    MatchGameDeleteResponse,
    MatchGameDetailResponse,
    MatchGamePageResponse,
    MatchGameStatsDimension,
    MatchGameStatsResponse,
    MatchGameUpdateResponse,
    MatchPlayerStatsDTO,
    MatchTeamStatsDTO,
} from '../types/matchGame'

export interface MatchGamePageRequest {
    pageNum: number
    pageSize: number
    season: string | null
}

export interface MatchGameUpsertRequest {
    id?: number
    season: string
    seasonMatchNo: number
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
    dimension: MatchGameStatsDimension
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
