"use client";
import Link from "next/link";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormEvent, useState } from "react";

export default function ForgetPassword() {
  const [email, setEmail] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [message, setMessage] = useState<{text: string; type: 'success' | 'error'} | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
        const response = await fetch("/api/auth/forget-password", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(email)
        });

        const data = await response.json();

        if (!response.ok) {
            setMessage({
                text: data?.error || "Something went wrong. Please try again.",
                type: 'error'
            });
        } else {
            setMessage({
                text: data?.message || `Reset link sent to ${email}`,
                type: 'success'
            });
            setEmail("");
        }

        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log("Email submitted:", email);

    } catch (error) {
        console.error("Error submitting email:", error);
        setMessage({
            text: "Failed to send reset link. Please try again.",
            type: 'error'
        });
    } finally {
        setIsSubmitting(false);
    }

  };

  return (
    <div className="h-screen overflow-y-auto p-2 bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Reset your password
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Or{" "}
          <Link 
            href="/auth/login" 
            className="font-medium text-emerald-600 hover:text-emerald-500"
          >
            return to sign in
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {message && (
            <div className={`mb-4 p-3 rounded-md text-sm ${
              message.type === 'success' 
                ? 'bg-emerald-50 text-emerald-700' 
                : 'bg-red-50 text-red-700'
            }`}>
              {message.text}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <Label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </Label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 w-full"
                  placeholder="you@example.com"
                />
              </div>
              <p className="mt-2 text-sm text-gray-500">
                We'll send you a link to reset your password
              </p>
            </div>

            <div>
              <Button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Sending..." : "Send reset link"}
              </Button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Having trouble?
                </span>
              </div>
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Contact{" "}
                <a
                  href="mailto:contact@spriie.com"
                  className="font-medium text-emerald-600 hover:text-emerald-500"
                >
                  contact@spriie.com
                </a>{" "}
                for assistance
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}