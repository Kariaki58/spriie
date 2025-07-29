'use client'

import Link from 'next/link'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useSession } from 'next-auth/react'

interface NavItem {
    href: string
    label: string
    icon: React.ReactNode
}

interface SidebarConfig {
    navItems: NavItem[]
}

export default function DashboardSidebar({ config }: { config: SidebarConfig }) {
    const pathname = usePathname()
    const [isCollapsed, setIsCollapsed] = useState(false)
    const [isMobile, setIsMobile] = useState(false)
    const [isMounted, setIsMounted] = useState(false)
    const { data: session } = useSession()

    useEffect(() => {
        setIsMounted(true)
    }, [])

    useEffect(() => {
        if (!isMounted) return

        const handleResize = () => {
            const mobile = window.innerWidth < 1024
            setIsMobile(mobile)
            setIsCollapsed(mobile)
        }

        handleResize()
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [isMounted])

    useEffect(() => {
        if (!isMounted) return

        const handleClickOutside = (e: MouseEvent) => {
            if (isMobile && !isCollapsed) {
                const sidebar = document.querySelector('aside')
                if (sidebar && !sidebar.contains(e.target as Node)) {
                    setIsCollapsed(true)
                }
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [isMobile, isCollapsed, isMounted])

    const toggleSidebar = () => setIsCollapsed(!isCollapsed)

    const isActive = (href: string) => {
        return pathname === href
    }

    if (!isMounted) {
        return (
            <aside className="w-20 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 h-full flex flex-col">
                <div className="flex-1 flex flex-col overflow-y-auto p-4">
                    <div className="flex items-center justify-center mb-8">
                        <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                    </div>
                    <nav className="flex-1">
                        <ul className="space-y-1">
                            {config.navItems.map((item) => (
                                <li key={item.href}>
                                    <div className="flex items-center justify-center p-3">
                                        <div className="w-5 h-5 bg-gray-200 dark:bg-gray-700 rounded"></div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </nav>
                </div>
            </aside>
        )
    }

    return (
        <>
            {isMobile && !isCollapsed && (
                <div 
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={toggleSidebar}
                />
            )}
            <aside 
                className={`
                    bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 
                    transition-all duration-300 ease-in-out h-full flex flex-col
                    ${isCollapsed ? 'w-20' : 'w-64'} 
                    ${isMobile && !isCollapsed ? 'fixed inset-y-0 left-0 z-50 shadow-xl' : 'relative'}
                `}
            >
                <div className="flex-1 flex flex-col overflow-y-auto p-4">
                    <div className="flex items-center justify-between mb-8">
                        {!isCollapsed && (
                            <Link href="/" className="flex items-center space-x-2">
                                <div className="relative h-10 w-10">
                                    <Image
                                        src="/sprii-logo-dark.png"
                                        alt="Spriie Logo"
                                        fill
                                        className="object-contain"
                                        priority
                                    />
                                </div>
                                <span className="font-semibold text-lg text-gray-900 dark:text-white">
                                    Spriie
                                </span>
                            </Link>
                        )}
                        
                        <button
                            onClick={toggleSidebar}
                            className={`p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400
                                ${isCollapsed ? 'mx-auto' : ''}`}
                        >
                            {isMobile && !isCollapsed ? (
                                <X className="w-5 h-5" />
                            ) : isCollapsed ? (
                                <ChevronRight className="w-5 h-5" />
                            ) : (
                                <ChevronLeft className="w-5 h-5" />
                            )}
                        </button>
                    </div>
                    <nav className="flex-1">
                        <ul className="space-y-1">
                            {config.navItems.map((item) => {
                                    if (item.href === "/vendor" && session?.user.role !== "seller") {
                                        return null;
                                    } else if (item.href === "/store" && session?.user.role === "seller") {
                                        
                                    } else {
                                        return <li key={item.href}>
                                            <Link
                                                href={item.href}
                                                className={`
                                                    flex items-center p-3 rounded-lg transition-colors
                                                    ${isActive(item.href)
                                                        ? 'bg-emerald-50 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-300'
                                                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                                    }
                                                    ${isCollapsed ? 'justify-center' : ''}
                                                `}
                                            >
                                                <span className={`
                                                    flex items-center justify-center w-5 h-5
                                                    ${isActive(item.href) 
                                                        ? 'text-emerald-600 dark:text-emerald-300'
                                                        : 'text-gray-500 dark:text-gray-400'
                                                    }
                                                `}>
                                                    {item.icon}
                                                </span>
                                                {!isCollapsed && (
                                                    <span className="ml-3 font-medium">{item.label}</span>
                                                )}
                                            </Link>
                                        </li>
                                    }
                                }
                                
                            )}
                        </ul>
                    </nav>

                    {!isCollapsed && (
                        <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-700"></div>
                    )}
                </div>
            </aside>
        </>
    )
}