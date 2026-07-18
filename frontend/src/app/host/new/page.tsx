"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/components/ToastProvider";
import ListingForm, { ListingFormValues } from "@/components/ListingForm";

export default function NewListingPage() {
  const { user, loading: authLoading } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(values: ListingFormValues) {
    if (!user) return;
    setSubmitting(true);
    try {
      const listing = await api.post<{ id: number }>(`/listings?host_id=${user.id}`, values);
      showToast("Listing created!", "success");
      router.push(`/listings/${listing.id}`);
    } catch (e) {
      showToast(e instanceof ApiError ? e.message : "Couldn't create this listing", "error");
    } finally {
      setSubmitting(false);
    }
  }

  if (authLoading) return null;

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-6 py-24 text-center">
        <p className="text-lg font-medium text-ink mb-2">Log in to create a listing</p>
        <Link href="/login" className="text-rausch underline text-sm">Log in</Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-semibold text-ink mb-6">Create a new listing</h1>
      <ListingForm submitLabel="Create listing" onSubmit={handleSubmit} submitting={submitting} />
    </div>
  );
}
