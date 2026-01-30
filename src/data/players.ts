/**
 * 玩家数据维护文件
 * 
 * 包含用户和球员的预设数据，便于选择框使用
 */

export interface User {
    id: number
    username: string
}

export interface Player {
    id: number
    name: string
}

// 用户数据
export const users: User[] = [
    { id: 1, username: '偶尔打铁的小凡' },
    { id: 2, username: '与田祐希男友' },
    { id: 3, username: 'LeslieCoral' },
]

// 球员数据
export const players: Player[] = [
    { id: 1, name: '拉里·南斯（85）'},
    { id: 2, name: '德文·布克（现役）'},
    { id: 3, name: '乔尔·恩比德（现役）'},
    { id: 4, name: '杰林·布朗（现役）'},
]

// 根据用户名获取用户
export function getUserByUsername(username: string): User | undefined {
    return users.find(user => user.username === username)
}

// 根据用户ID获取用户
export function getUserById(id: number): User | undefined {
    return users.find(user => user.id === id)
}

// 根据球员名获取球员
export function getPlayerByName(name: string): Player | undefined {
    return players.find(player => player.name === name)
}

// 根据球员ID获取球员
export function getPlayerById(id: number): Player | undefined {
    return players.find(player => player.id === id)
}