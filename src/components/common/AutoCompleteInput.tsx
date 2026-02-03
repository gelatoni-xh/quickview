import { useState, useRef, useEffect, useMemo } from 'react'
import { createPortal } from 'react-dom'

interface AutoCompleteInputProps {
    value: string
    onChange: (value: string) => void
    options: string[]
    placeholder?: string
    disabled?: boolean
    className?: string
    inputClassName?: string
    dropdownPosition?: 'bottom' | 'top'
    usePortal?: boolean
}

export default function AutoCompleteInput({
    value,
    onChange,
    options,
    placeholder = '请输入...',
    disabled = false,
    className = '',
    inputClassName = '',
    dropdownPosition = 'bottom',
    usePortal = false
}: AutoCompleteInputProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [focusedIndex, setFocusedIndex] = useState(-1)
    const [dropdownStyle, setDropdownStyle] = useState({})
    const containerRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    // 计算下拉框位置
    useEffect(() => {
        if (isOpen && usePortal && inputRef.current) {
            const inputRect = inputRef.current.getBoundingClientRect()
            const newPosition = {
                position: 'fixed' as const,
                zIndex: 1000,
                minWidth: inputRect.width,
                left: inputRect.left,
                ...(dropdownPosition === 'top' 
                    ? { bottom: window.innerHeight - inputRect.top - window.scrollY } 
                    : { top: inputRect.bottom + window.scrollY }
                )
            }
            setDropdownStyle(newPosition)
        }
    }, [isOpen, usePortal, dropdownPosition])

    // 过滤选项 - 不区分大小写，支持部分匹配
    const filteredOptions = useMemo(() => {
        if (!value) return options
        return options.filter(option => 
            option.toLowerCase().includes(value.toLowerCase())
        )
    }, [options, value])

    // 处理输入变化
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange(e.target.value)
        setIsOpen(true)
        setFocusedIndex(-1)
    }

    // 处理选项选择
    const handleSelect = (option: string) => {
        onChange(option)
        setIsOpen(false)
        setFocusedIndex(-1)
        inputRef.current?.focus()
    }

    // 处理键盘导航
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!isOpen) {
            if (e.key === 'ArrowDown' || e.key === 'Enter') {
                setIsOpen(true)
                e.preventDefault()
            }
            return
        }

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

    // 点击外部关闭下拉框
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
                onFocus={() => {
                    if (!disabled) {
                        setIsOpen(true)
                    }
                }}
                placeholder={placeholder}
                disabled={disabled}
                className={`border rounded px-2 py-1 text-sm w-full ${inputClassName} ${
                    disabled ? 'bg-gray-100 cursor-not-allowed text-gray-400' : 'cursor-text'
                }`}
            />
            
            {isOpen && filteredOptions.length > 0 && (
                usePortal ? (
                    createPortal(
                        <div 
                            style={dropdownStyle}
                            className="bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto"
                        >
                            {filteredOptions.map((option, index) => (
                                <div
                                    key={option}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        console.log('Portal option clicked:', option);
                                        handleSelect(option);
                                    }}
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
                        </div>,
                        document.body
                    )
                ) : (
                    <div 
                        className={`absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto ${
                            dropdownPosition === 'top' ? 'bottom-full mb-1' : 'mt-1'
                        }`}
                    >
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
                )
            )}
        </div>
    )
}