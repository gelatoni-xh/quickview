/**
 * 应用程序入口文件
 *
 * 使用 React 18 的 createRoot API 渲染应用，
 * StrictMode 用于在开发环境中检测潜在问题。
 */
import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <App />
    </StrictMode>
)
