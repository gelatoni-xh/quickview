/**
 * 顶部导航栏组件
 *
 * 包含侧边栏开关按钮。在移动端或侧边栏收起时，
 * 用户可以通过点击此按钮打开侧边导航栏。
 */

/** Header 组件的 Props 类型 */
type HeaderProps = {
    /** 设置侧边栏打开/关闭状态的函数 */
    setSidebarOpen: (open: boolean) => void
}

export default function Header({ setSidebarOpen }: HeaderProps) {
    return (
        <button
            onClick={() => setSidebarOpen(true)}
            className="mb-4 inline-flex items-center px-3 py-2 text-sm bg-white border rounded shadow-sm hover:bg-gray-50"
            aria-label="打开侧边栏"
        >
            ☰
        </button>
    )
}
