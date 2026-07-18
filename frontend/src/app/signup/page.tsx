"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth, ApiError } from "@/lib/auth-context";
import { useToast } from "@/components/ToastProvider";

export default function SignupPage() {
  const { signup } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await signup(name, email, password);
      showToast("Account created - welcome!", "success");
      router.push("/");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-sm mx-auto px-6 py-16">
      <h1 className="text-2xl font-semibold text-ink mb-1">Create an account</h1>
      <p className="text-graytext text-sm mb-6">Sign up to book stays, save favorites, and host your own listings.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-ink mb-1">Full name</label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-hairline rounded-lg px-3 py-2.5 text-sm outline-none focus:border-ink"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-ink mb-1">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-hairline rounded-lg px-3 py-2.5 text-sm outline-none focus:border-ink"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-ink mb-1">Password</label>
          <input
            type="password"
            required
            minLength={4}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-hairline rounded-lg px-3 py-2.5 text-sm outline-none focus:border-ink"
          />
        </div>

        {error && <p className="text-sm text-rausch">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-rausch hover:bg-rausch-dark disabled:opacity-60 text-white font-medium rounded-lg py-2.5 transition-colors"
        >
          {submitting ? "Creating account..." : "Sign up"}
        </button>
      </form>

      <p className="text-sm text-graytext mt-6">
        Already have an account?{" "}
        <Link href="/login" className="text-ink font-medium underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
