"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

type PaymentVerificationResponse = {
  success: boolean;
  amount?: number;
  walletType?: string;
  error?: string;
};

export default function WalletVerify() {
  const [status, setStatus] = useState<string>("Verifying...");
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session } = useSession();

  const callbackUrl = searchParams.get("callbackUrl");

  useEffect(() => {
    const reference = searchParams.get("reference");
    const trxref = searchParams.get("trxref");

    if (!reference || !trxref) {
      setStatus("❌ Missing reference.");
      startRedirectTimer();
      return;
    }

    const verify = async () => {
      try {
        const res = await fetch(
          `/api/wallet/verify?reference=${reference}&trxref=${trxref}`
        );
        const data: PaymentVerificationResponse = await res.json();

        if (data.success) {
          setStatus(
            `✅ Payment successful! ₦${data.amount} added to your wallet.`
          );
        } else {
          setStatus(`❌ Payment failed: ${data.error || "Unknown error"}`);
        }
      } catch (error) {
        console.error("Verification error:", error);
        setStatus("❌ Error verifying payment.");
      } finally {
        startRedirectTimer();
      }
    };

    verify();
  }, [searchParams]);

  const startRedirectTimer = () => {
    setTimeout(() => {
      if (callbackUrl && callbackUrl !== "undefined") {
        router.push(callbackUrl);
      } else {
        if (session?.user.role === "seller") {
            router.push("/vendor/wallet")
            return;
        }
        router.push("/user/wallet");
      }
    }, 2000);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-emerald-50 px-4">
      <div className="bg-white shadow-lg p-8 rounded-2xl text-center max-w-md w-full border border-emerald-200">
        <div className="mb-6">
          <div className="inline-block bg-emerald-100 text-emerald-600 px-4 py-2 rounded-full font-medium text-sm">
            Wallet Funding Status
          </div>
        </div>

        <div className="mb-4 text-gray-700 text-lg font-medium min-h-[48px]">
          {status}
        </div>

        <p className="text-sm text-gray-500">
          You&apos;ll be redirected shortly...
        </p>

        <div className="mt-6 flex justify-center">
          <div className="w-20 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
        </div>
      </div>
    </div>
  );
}
