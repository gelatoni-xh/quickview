import type { BaseResponse } from './rbac'

export type MatchGameStatsDimension = 'PLAYER' | 'USER'

export type MatchGameStatsMetric =
    | 'APPEARANCES'
    | 'SCORE'
    | 'SCORE_AVG'
    | 'REBOUND'
    | 'REBOUND_AVG'
    | 'ASSIST'
    | 'ASSIST_AVG'
    | 'STEAL'
    | 'STEAL_AVG'
    | 'BLOCK'
    | 'BLOCK_AVG'
    | 'FG_ATTEMPT'
    | 'FG_ATTEMPT_AVG'
    | 'FG_MADE'
    | 'FG_MADE_AVG'
    | 'FG_PCT'
    | 'FG_PCT_AVG'
    | 'THREE_ATTEMPT'
    | 'THREE_ATTEMPT_AVG'
    | 'THREE_MADE'
    | 'THREE_MADE_AVG'
    | 'THREE_PCT'
    | 'THREE_PCT_AVG'
    | 'MVP'
    | 'MVP_AVG'
    | 'SVP'
    | 'SVP_AVG'
    | 'TURNOVER'
    | 'TURNOVER_AVG'

export interface MatchGameDTO {
    id: number
    season: string
    seasonMatchNo: number
    matchTime: string
    isRobot: boolean
    myScore: number
    oppScore: number
    result: boolean
    remark?: string
    createTime?: string
}

export interface MatchTeamStatsDTO {
    id?: number
    matchId?: number
    teamType: number
    score?: number
    fgAttempt?: number
    fgMade?: number
    threeAttempt?: number
    threeMade?: number
    assist?: number
    rebound?: number
    offRebound?: number
    defRebound?: number
    steal?: number
    block?: number
    dunk?: number
    paintScore?: number
    secondChanceScore?: number
    turnoverToScore?: number
    maxLead?: number
    createTime?: string
}

export interface MatchPlayerStatsDTO {
    id?: number
    matchId?: number
    teamType: number
    userName?: string
    playerName?: string
    rating?: number
    isMvp?: boolean
    isSvp?: boolean
    score?: number
    assist?: number
    rebound?: number
    steal?: number
    block?: number
    turnover?: number
    dunk?: number
    fgAttempt?: number
    fgMade?: number
    threeAttempt?: number
    threeMade?: number
    midCount?: number
    maxScoringRun?: number
    createTime?: string
}

export interface MatchGameDetailDTO {
    matchGame: MatchGameDTO
    myTeamStats: MatchTeamStatsDTO[]
    opponentTeamStats: MatchTeamStatsDTO[]
    myPlayerStats: MatchPlayerStatsDTO[]
    opponentPlayerStats: MatchPlayerStatsDTO[]
}

export interface MatchGameStatsRankItem {
    name: string
    value?: number
    avg?: number
    made?: number
    attempt?: number
    rate?: number
}

export interface MatchGameStatsLeaderboard {
    metric: MatchGameStatsMetric
    metricDesc: string
    items: MatchGameStatsRankItem[]
}

export interface MatchGameStatsDTO {
    season?: string
    dimension: MatchGameStatsDimension
    leaderboards: MatchGameStatsLeaderboard[]
}

export type MatchGamePageResponse = BaseResponse<MatchGameDTO[]>
export type MatchGameCreateResponse = BaseResponse<number>
export type MatchGameUpdateResponse = BaseResponse<boolean>
export type MatchGameDeleteResponse = BaseResponse<boolean>
export type MatchGameDetailResponse = BaseResponse<MatchGameDetailDTO>
export type MatchGameStatsResponse = BaseResponse<MatchGameStatsDTO>
