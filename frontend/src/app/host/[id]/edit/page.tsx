"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import { ListingDetail } from "@/lib/types";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/components/ToastProvider";
import ListingForm, { ListingFormValues } from "@/components/ListingForm";

export default function EditListingPage() {
  const params = useParams();
  const { user, loading: authLoading } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();

  const [listing, setListing] = useState<ListingDetail | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [forbidden, setForbidden] = useState(false);

  useEffect(() => {
    api
      .get<ListingDetail>(`/listings/${params.id}`)
      .then((l) => {
        if (user && l.host.id !== user.id) {
          setForbidden(true);
        } else {
          setListing(l);
        }
      })
      .catch(() => setForbidden(true));
  }, [params.id, user]);

  async function handleSubmit(values: ListingFormValues) {
    if (!user) return;
    setSubmitting(true);
    try {
      await api.put(`/listings/${params.id}?host_id=${user.id}`, values);
      showToast("Listing updated", "success");
      router.push("/host");
    } catch (e) {
      showToast(e instanceof ApiError ? e.message : "Couldn't update this listing", "error");
    } finally {
      setSubmitting(false);
    }
  }

  if (authLoading) return null;

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-6 py-24 text-center">
        <p className="text-lg font-medium text-ink mb-2">Log in to edit this listing</p>
        <Link href="/login" className="text-rausch underline text-sm">Log in</Link>
      </div>
    );
  }

  if (forbidden) {
    return (
      <div className="max-w-md mx-auto px-6 py-24 text-center">
        <p className="text-lg font-medium text-ink mb-2">You don&apos;t have access to edit this listing</p>
        <Link href="/host" className="text-rausch underline text-sm">Back to your listings</Link>
      </div>
    );
  }

  if (!listing) return <div className="max-w-2xl mx-auto px-6 py-10 text-graytext">Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-semibold text-ink mb-6">Edit listing</h1>
      <ListingForm initial={listing} submitLabel="Save changes" onSubmit={handleSubmit} submitting={submitting} />
    </div>
  );
}
