type SidebarProps = {
    sidebarOpen: boolean
    setSidebarOpen: (open: boolean) => void
}

export default function Sidebar({ sidebarOpen, setSidebarOpen }: SidebarProps) {
    return (
        <aside
            className={`w-56 bg-white border-r fixed inset-y-0 left-0 z-40 transform transition-transform duration-200
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}
        >
            <div className="flex items-center justify-between p-4 border-b">
                <div className="font-bold text-lg">QuickView</div>
                <button
                    onClick={() => setSidebarOpen(false)}
                    className="text-gray-500 hover:text-black text-lg leading-none"
                    aria-label="Close sidebar"
                >
                    ×
                </button>
            </div>

            <nav className="px-4 space-y-2">
                <div className="text-sm text-gray-600 font-medium">Home</div>
            </nav>
        </aside>
    )
}
