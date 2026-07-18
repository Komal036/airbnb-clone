"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { SearchX } from "lucide-react";
import { api } from "@/lib/api";
import { PaginatedListings } from "@/lib/types";
import { useAuth } from "@/lib/auth-context";
import SearchBar from "@/components/SearchBar";
import FilterBar from "@/components/FilterBar";
import ListingCard from "@/components/ListingCard";
import Pagination from "@/components/Pagination";

export default function HomePage() {
  return (
    <Suspense fallback={<div className="px-6 md:px-10 py-8"><GridSkeleton /></div>}>
      <HomePageContent />
    </Suspense>
  );
}

function HomePageContent() {
  const params = useSearchParams();
  const { user } = useAuth();
  const [data, setData] = useState<PaginatedListings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");

    const query = new URLSearchParams(params.toString());
    if (user) query.set("user_id", String(user.id));
    if (!query.get("page")) query.set("page", "1");

    api
      .get<PaginatedListings>(`/listings?${query.toString()}`)
      .then(setData)
      .catch(() => setError("Couldn't load listings. Is the API running?"))
      .finally(() => setLoading(false));
  }, [params, user]);

  return (
    <div>
      <div className="px-6 md:px-10 py-6 border-b border-hairline">
        <SearchBar />
      </div>
      <FilterBar />

      <div className="px-6 md:px-10 py-8">
        {loading && <GridSkeleton />}

        {!loading && error && (
          <div className="text-center py-24">
            <p className="text-graytext">{error}</p>
          </div>
        )}

        {!loading && !error && data && data.items.length === 0 && (
          <div className="text-center py-24 flex flex-col items-center gap-3">
            <SearchX size={40} className="text-graytext" />
            <p className="text-lg font-medium text-ink">No listings match your search</p>
            <p className="text-graytext text-sm">Try adjusting your dates, filters, or destination.</p>
          </div>
        )}

        {!loading && !error && data && data.items.length > 0 && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-6 gap-y-10">
              {data.items.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
            <Pagination page={data.page} totalPages={data.total_pages} />
          </>
        )}
      </div>
    </div>
  );
}

function GridSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-6 gap-y-10">
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="aspect-square rounded-xl2 bg-gray-200" />
          <div className="h-4 bg-gray-200 rounded mt-3 w-3/4" />
          <div className="h-3 bg-gray-200 rounded mt-2 w-1/2" />
          <div className="h-3 bg-gray-200 rounded mt-2 w-1/3" />
        </div>
      ))}
    </div>
  );
}
