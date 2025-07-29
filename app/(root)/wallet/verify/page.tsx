import { Suspense } from "react";
import WalletVerify from "./Helper";

export default function WalletVerifyPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <WalletVerify />
    </Suspense>
  )
}