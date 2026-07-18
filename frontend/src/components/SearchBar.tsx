"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, MapPin, Users } from "lucide-react";

export default function SearchBar() {
  const router = useRouter();
  const params = useSearchParams();

  const [location, setLocation] = useState(params.get("location") || "");
  const [checkIn, setCheckIn] = useState(params.get("check_in") || "");
  const [checkOut, setCheckOut] = useState(params.get("check_out") || "");
  const [guests, setGuests] = useState(params.get("guests") || "");

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const next = new URLSearchParams(params.toString());
    next.set("page", "1");

    const setOrDelete = (key: string, value: string) => {
      if (value) next.set(key, value);
      else next.delete(key);
    };
    setOrDelete("location", location);
    setOrDelete("check_in", checkIn);
    setOrDelete("check_out", checkOut);
    setOrDelete("guests", guests);

    router.push(`/?${next.toString()}`);
  }

  return (
    <form
      onSubmit={handleSearch}
      className="flex flex-col md:flex-row items-stretch md:items-center gap-2 md:gap-0 bg-white border border-hairline md:rounded-full rounded-2xl shadow-soft max-w-3xl mx-auto p-2"
    >
      <div className="flex-1 flex items-center gap-2 px-4 py-2 md:border-r border-hairline">
        <MapPin size={16} className="text-graytext shrink-0" />
        <div className="flex-1 min-w-0">
          <label className="block text-xs font-semibold text-ink">Where</label>
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Search destinations"
            className="w-full text-sm outline-none placeholder:text-graytext bg-transparent"
          />
        </div>
      </div>

      <div className="flex-1 flex items-center gap-2 px-4 py-2 md:border-r border-hairline">
        <div className="flex-1 min-w-0">
          <label className="block text-xs font-semibold text-ink">Check in</label>
          <input
            type="date"
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
            className="w-full text-sm outline-none bg-transparent text-graytext"
          />
        </div>
      </div>

      <div className="flex-1 flex items-center gap-2 px-4 py-2 md:border-r border-hairline">
        <div className="flex-1 min-w-0">
          <label className="block text-xs font-semibold text-ink">Check out</label>
          <input
            type="date"
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            className="w-full text-sm outline-none bg-transparent text-graytext"
          />
        </div>
      </div>

      <div className="flex-1 flex items-center gap-2 px-4 py-2">
        <Users size={16} className="text-graytext shrink-0" />
        <div className="flex-1 min-w-0">
          <label className="block text-xs font-semibold text-ink">Guests</label>
          <input
            type="number"
            min={1}
            value={guests}
            onChange={(e) => setGuests(e.target.value)}
            placeholder="Add guests"
            className="w-full text-sm outline-none placeholder:text-graytext bg-transparent"
          />
        </div>

        <button
          type="submit"
          className="ml-2 shrink-0 bg-rausch hover:bg-rausch-dark text-white rounded-full p-3 flex items-center justify-center gap-2 transition-colors"
          aria-label="Search"
        >
          <Search size={16} strokeWidth={3} />
        </button>
      </div>
    </form>
  );
}
