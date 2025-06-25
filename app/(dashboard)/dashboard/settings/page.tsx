"use client";
import { Button } from "@/components/ui/button"
import { signOut } from "next-auth/react"
import { useSession } from "next-auth/react"

export default function DashboardSettingsDisplay() {
    const { data: session } = useSession();
    
    return (
        <div>
            <p>{JSON.stringify(session)}</p>

            <Button onClick={() => signOut({ callbackUrl: '/auth/login' })}>Logout</Button>
            dashboard settings display.
        </div>
    )
}