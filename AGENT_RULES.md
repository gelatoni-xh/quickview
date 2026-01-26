# QuickView 前端项目 AI 代理规则

本文档定义了 QuickView 前端项目的开发规范和 AI 代理行为准则。

## 项目概述

**QuickView** 是一个基于 Vite + React + TypeScript 的单页应用（SPA）。

### 技术栈

- **运行时**: 浏览器环境（SPA），无 SSR
- **构建工具**: Vite (ESM, moduleResolution = bundler)
- **语言**: TypeScript (strict = true)
- **框架**: React (react-jsx)
- **代码检查**: ESLint v9 with Flat Config
- **热重载**: Vite + react-refresh
- **样式**: Tailwind CSS

### 项目结构

```
src/
├── components/     # React 组件
│   ├── auth/      # 认证相关组件
│   ├── layout/    # 布局组件
│   └── widgets/   # 业务组件
├── contexts/      # Context 提供者
├── hooks/         # 自定义 Hooks
├── types/         # TypeScript 类型定义
├── utils/         # 工具函数
├── pages/         # 页面组件
└── constants/     # 常量定义
```

## 约束优先级（从高到低）

### 1. 运行时正确性（最高优先级）

**必须保证应用在浏览器中正确运行。**

- ✅ 应用必须在浏览器中正常运行
- ✅ 不能为了代码风格而破坏现有逻辑或行为
- ✅ 优先保证功能正确性，而非代码完美性

**示例**：
- 如果某个功能正常工作，即使代码不够优雅，也不要重构
- 修复 bug 时，确保不会引入新的运行时错误

### 2. TypeScript 编译错误

**修复真正的类型错误，但允许必要的类型断言。**

- ✅ 修复会导致运行时不安全或无法理解的类型错误
- ✅ 允许临时使用 `any`、`unknown` 或类型断言（`as`）如果确实必要
- ⚠️ 不要为了类型完美而过度工程化

**示例**：
```typescript
// ✅ 可接受：必要的类型断言
const data = response.data as UserInfo

// ✅ 可接受：临时使用 any 处理复杂类型
const result: any = await fetch(url)

// ❌ 避免：为了类型完美而创建过度复杂的泛型
```

### 3. React Hooks 规则（必须遵守）

**React Hooks 规则必须始终遵守，这是不可妥协的。**

- ✅ **永远不要**违反 Hooks 规则：
  - 只在函数组件顶层调用 Hooks
  - 不要在循环、条件或嵌套函数中调用 Hooks
  - 自定义 Hooks 必须以 `use` 开头
- ✅ 修复依赖数组问题，特别是当它们导致真实 bug 时
- ⚠️ 如果依赖数组警告不影响功能，可以暂时忽略

**示例**：
```typescript
// ✅ 正确：Hooks 在顶层调用
function Component() {
  const [state, setState] = useState(0)
  useEffect(() => {
    // ...
  }, [])
  return <div>{state}</div>
}

// ❌ 错误：在条件中调用 Hooks
function Component() {
  if (condition) {
    const [state, setState] = useState(0) // 违反规则！
  }
}
```

### 4. ESLint 风格/最佳实践规则（最低优先级）

**非关键的 ESLint 警告可以忽略或抑制。**

- ✅ 可以暂时忽略非关键警告：
  - 未使用的变量或参数
  - 缺少显式返回类型
  - 其他风格问题
- ✅ 可以使用内联注释抑制 ESLint 警告，如果逻辑清晰
- ❌ 不要为了满足 lint 规则而引入不必要的抽象

**示例**：
```typescript
// ✅ 可接受：使用 eslint-disable 抑制非关键警告
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const unused = computeValue()

// ✅ 可接受：暂时保留未使用的参数（可能未来会用到）
function handler(_event: Event) {
  // 暂时未使用 event
}
```

## 明确允许的做法

### ✅ 可以接受

- 暂时保留未使用的变量或参数
- 在需要时使用 `any`、`unknown` 或类型断言
- 使用内联注释抑制 ESLint 警告（如果逻辑清晰）
- 编写稍微冗长或命令式的代码（如果更容易理解）
- 使用 `console.log` 进行调试（开发环境）

### ❌ 不可接受

- 违反 React Hooks 规则
- 在未解释原因的情况下改变行为
- 为了 lint 或类型完美而过度工程化
- 破坏现有功能以追求代码风格

## 代码风格指南

### 组件编写

- 使用函数式组件
- 使用 TypeScript 定义 Props 接口
- 使用中文注释说明组件用途和参数
- 优先使用自定义 Hooks 封装业务逻辑

**示例**：
```typescript
/**
 * 待办事项卡片组件
 *
 * 展示待办事项列表，支持筛选和编辑。
 *
 * @param tagId - 标签 ID，用于筛选
 */
export default function TodoCard({ tagId }: { tagId: number | null }) {
  const { data, loading, error } = useTodoItems(tagId)
  // ...
}
```

### Hooks 编写

- 自定义 Hooks 必须以 `use` 开头
- 使用 `useCallback` 缓存函数（特别是作为依赖时）
- 使用 `useEffect` 处理副作用
- 返回对象包含 `data`、`loading`、`error` 和 `refresh` 方法（如适用）

**示例**：
```typescript
/**
 * 获取待办事项列表
 *
 * @param tagId - 标签 ID，为 null 时获取所有
 */
export function useTodoItems(tagId: number | null) {
  const [data, setData] = useState<TodoItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    // ...
  }, [tagId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, loading, error, refresh: fetchData }
}
```

### API 请求

- 使用 `fetch` API
- 从 `localStorage` 获取 token 并添加到请求头
- 统一错误处理
- 使用类型定义 API 响应

**示例**：
```typescript
const token = localStorage.getItem('token')
const headers: HeadersInit = {}
if (token) {
  headers['Authorization'] = `Bearer ${token}`
}
const res = await fetch(url, { headers })
const result: ApiResponse = await res.json()
```

### 类型定义

- 所有 API 响应都应定义类型
- 使用接口（`interface`）定义对象类型
- 使用 JSDoc 注释说明字段含义
- 类型文件放在 `src/types/` 目录

**示例**：
```typescript
/**
 * 用户信息
 */
export interface UserInfo {
  /** 用户基本信息，匿名用户时为 null */
  user: User | null
  /** 权限编码列表 */
  permissionCodes: string[]
}
```

## 文件命名规范

- **组件文件**: PascalCase，如 `TodoCard.tsx`
- **Hooks 文件**: camelCase，以 `use` 开头，如 `useTodoItems.ts`
- **类型文件**: camelCase，如 `auth.ts`、`todo.ts`
- **工具文件**: camelCase，如 `api.ts`
- **常量文件**: camelCase，如 `permissions.ts`

## 开发工作流

### 开发环境

```bash
# 本地开发
npm run dev

# 远程开发（使用代理）
npm run remote

# 构建
npm run build

# 代码检查
npm run lint
```

### 环境变量

- `.env.development` - 本地开发环境
- `.env.development.remote` - 远程开发环境（使用代理）

## 常见问题处理

### 如何处理 ESLint 警告？

1. **运行时错误相关**: 必须修复
2. **React Hooks 相关**: 必须修复
3. **类型错误**: 优先修复，必要时使用类型断言
4. **风格警告**: 可以忽略或抑制

### 如何处理类型错误？

1. 优先修复真正的类型错误
2. 如果类型过于复杂，可以使用 `as` 断言
3. 临时使用 `any` 是可以接受的，但应添加注释说明原因

### 如何添加新功能？

1. 在 `src/hooks/` 中创建自定义 Hook（如需要）
2. 在 `src/components/` 中创建组件
3. 在 `src/types/` 中定义类型（如需要）
4. 遵循现有的代码风格和模式

## 总结

**核心原则**: 运行时正确性 > 类型安全 > Hooks 规则 > 代码风格

在开发过程中，始终优先保证应用能够正常运行，然后才是代码质量和风格。不要为了追求完美的类型或 lint 规则而破坏功能。
