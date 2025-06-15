import { GalleryVerticalEnd } from "lucide-react"
import Link from "next/link"
import { LoginForm } from "@/components/login-form"
import Image from "next/image"

export default function LoginPage() {
    return (
        <div className="grid min-h-svh lg:grid-cols-2">
            <div className="flex flex-col gap-4 p-6 md:p-10">
                <div className="flex justify-center gap-2 md:justify-start">
                    <Link href="/" className="flex items-center gap-1 font-medium">
                        <div className="relative h-32 w-32">
                            <Image
                                src="/sprii-logo-dark.png"
                                alt="Spriie Logo"
                                fill
                                className="object-contain"
                                priority
                            />
                        </div>
                    </Link>
                </div>
                <div className="flex flex-1 items-center justify-center">
                    <div className="w-full max-w-xs">
                        <LoginForm />
                    </div>
                </div>
            </div>
            <div className="bg-muted relative hidden lg:block">
                <Image
                    src="/login-image.jpeg"
                    alt="Image"
                    width={500}
                    height={500}
                    className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
                />
            </div>
        </div>
    )
}
