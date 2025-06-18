"use client";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { signOut } from "next-auth/react";


export default function Page() {
    const { data: session } = useSession();


    return (
        <div>
            {JSON.stringify(session)}
            <Button className="block mt-20 mx-20" onClick={() => signOut({ callbackUrl: '/auth/login' })}>Logout</Button>
        </div>
    )
}