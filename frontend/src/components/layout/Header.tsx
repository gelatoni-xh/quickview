type HeaderProps = {
    setSidebarOpen: (open: boolean) => void
}

export default function Header({ setSidebarOpen }: HeaderProps) {
    return (
        <button
            onClick={() => setSidebarOpen(true)}
            className="mb-4 inline-flex items-center px-3 py-2 text-sm bg-white border rounded shadow-sm hover:bg-gray-50"
        >
            ☰
        </button>
    )
}
