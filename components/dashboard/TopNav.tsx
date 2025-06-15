'use client'

import ThemeToggle from "./ThemeToggle"



export default function TopNav() {
    return (
        <header className="sticky top-0 z-10 bg-white dark:bg-gray-800 shadow-sm">
            <div className="flex items-center justify-between h-16 px-6">
                <div className="flex items-center space-x-4">
                    <h1 className="text-xl font-semibold text-gray-800 dark:text-white">
                        Spriie
                    </h1>
                </div>
                <div className="flex items-center space-x-4">
                    <ThemeToggle />
                </div>
            </div>
        </header>
    )
}
