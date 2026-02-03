import { useState, useRef, useEffect } from 'react'

interface SimpleAutoCompleteProps {
    value: string
    onChange: (value: string) => void
    options: string[]
    placeholder?: string
    disabled?: boolean
    className?: string
}

export default function SimpleAutoComplete({
    value,
    onChange,
    options,
    placeholder = '请选择...',
    disabled = false,
    className = ''
}: SimpleAutoCompleteProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [focusedIndex, setFocusedIndex] = useState(-1)
    const containerRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    // 过滤选项
    const filteredOptions = options.filter(option => 
        option.toLowerCase().includes(value.toLowerCase())
    )

    const handleSelect = (option: string) => {
        console.log('SimpleAutoComplete: selecting', option)
        onChange(option)
        setIsOpen(false)
        setFocusedIndex(-1)
        inputRef.current?.blur()
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange(e.target.value)
        if (e.target.value && !isOpen) {
            setIsOpen(true)
        }
        setFocusedIndex(-1)
    }

    // 键盘导航
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (disabled) return
        
        if (!isOpen && (e.key === 'ArrowDown' || e.key === 'Enter')) {
            setIsOpen(true)
            e.preventDefault()
            return
        }

        if (!isOpen) return

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault()
                setFocusedIndex(prev => 
                    prev < filteredOptions.length - 1 ? prev + 1 : 0
                )
                break
            case 'ArrowUp':
                e.preventDefault()
                setFocusedIndex(prev => 
                    prev > 0 ? prev - 1 : filteredOptions.length - 1
                )
                break
            case 'Enter':
                e.preventDefault()
                if (focusedIndex >= 0 && focusedIndex < filteredOptions.length) {
                    handleSelect(filteredOptions[focusedIndex])
                }
                break
            case 'Escape':
                e.preventDefault()
                setIsOpen(false)
                setFocusedIndex(-1)
                break
        }
    }

    // 点击外部关闭
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false)
                setFocusedIndex(-1)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [])

    return (
        <div ref={containerRef} className={`relative ${className}`}>
            <input
                ref={inputRef}
                type="text"
                value={value}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                onFocus={() => !disabled && setIsOpen(true)}
                placeholder={placeholder}
                disabled={disabled}
                className={`border rounded px-2 py-1 text-sm w-full ${
                    disabled ? 'bg-gray-100 cursor-not-allowed text-gray-400' : 'cursor-text'
                }`}
            />
            
            {isOpen && filteredOptions.length > 0 && (
                <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto mt-1">
                    {filteredOptions.map((option, index) => (
                        <div
                            key={option}
                            onClick={() => handleSelect(option)}
                            onMouseEnter={() => setFocusedIndex(index)}
                            className={`px-3 py-2 text-sm cursor-pointer ${
                                index === focusedIndex 
                                    ? 'bg-blue-100 text-blue-900' 
                                    : 'hover:bg-gray-100'
                            }`}
                        >
                            {option}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}