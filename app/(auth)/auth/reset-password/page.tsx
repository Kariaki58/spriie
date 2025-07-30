import { Suspense } from "react";
import ResetPassword from "./reset-helper";

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ResetPassword />
        </Suspense>
    )
}