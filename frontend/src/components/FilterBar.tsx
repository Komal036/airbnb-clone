"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SlidersHorizontal } from "lucide-react";
import { api } from "@/lib/api";

const AMENITY_OPTIONS = [
  "Wifi", "Kitchen", "Free parking", "Washer", "Air conditioning", "Pool",
  "Hot tub", "Dedicated workspace", "TV", "Fireplace", "Pet friendly",
  "Gym", "Beach access", "Mountain view", "Breakfast included",
];

export default function FilterBar() {
  const router = useRouter();
  const params = useSearchParams();
  const [types, setTypes] = useState<string[]>([]);
  const [panelOpen, setPanelOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const activeType = params.get("property_type") || "";
  const activeAmenities = (params.get("amenities") || "").split(",").filter(Boolean);
  const [minPrice, setMinPrice] = useState(params.get("min_price") || "");
  const [maxPrice, setMaxPrice] = useState(params.get("max_price") || "");
  const [amenities, setAmenities] = useState<string[]>(activeAmenities);

  useEffect(() => {
    api.get<string[]>("/listings/property-types").then(setTypes).catch(() => setTypes([]));
  }, []);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setPanelOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  function updateParam(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    next.set("page", "1");
    router.push(`/?${next.toString()}`);
  }

  function toggleType(type: string) {
    updateParam("property_type", activeType === type ? "" : type);
  }

  function toggleAmenity(name: string) {
    setAmenities((prev) => (prev.includes(name) ? prev.filter((a) => a !== name) : [...prev, name]));
  }

  function applyFilters() {
    const next = new URLSearchParams(params.toString());
    if (minPrice) next.set("min_price", minPrice); else next.delete("min_price");
    if (maxPrice) next.set("max_price", maxPrice); else next.delete("max_price");
    if (amenities.length) next.set("amenities", amenities.join(",")); else next.delete("amenities");
    next.set("page", "1");
    router.push(`/?${next.toString()}`);
    setPanelOpen(false);
  }

  function clearFilters() {
    setMinPrice("");
    setMaxPrice("");
    setAmenities([]);
    const next = new URLSearchParams(params.toString());
    next.delete("min_price");
    next.delete("max_price");
    next.delete("amenities");
    next.set("page", "1");
    router.push(`/?${next.toString()}`);
    setPanelOpen(false);
  }

  const activeFilterCount = (minPrice ? 1 : 0) + (maxPrice ? 1 : 0) + activeAmenities.length;

  return (
    <div className="flex items-center gap-3 px-6 md:px-10 py-4 border-b border-hairline overflow-x-auto">
      <div className="flex items-center gap-2 shrink-0">
        {types.map((type) => (
          <button
            key={type}
            onClick={() => toggleType(type)}
            className={`px-4 py-2 rounded-full text-sm border whitespace-nowrap transition-colors ${
              activeType === type
                ? "bg-ink text-white border-ink"
                : "border-hairline text-ink hover:border-ink"
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      <div className="relative shrink-0 ml-auto" ref={panelRef}>
        <button
          onClick={() => setPanelOpen((v) => !v)}
          className="flex items-center gap-2 px-4 py-2 rounded-full border border-hairline text-sm font-medium hover:border-ink"
        >
          <SlidersHorizontal size={14} />
          Filters
          {activeFilterCount > 0 && (
            <span className="bg-ink text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>

        {panelOpen && (
          <div className="absolute right-0 mt-2 w-80 bg-white border border-hairline rounded-xl shadow-card p-5 z-40">
            <p className="font-semibold text-ink mb-3">Price range per night</p>
            <div className="flex items-center gap-3 mb-5">
              <input
                type="number"
                min={0}
                placeholder="Min"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-full border border-hairline rounded-lg px-3 py-2 text-sm outline-none focus:border-ink"
              />
              <span className="text-graytext">-</span>
              <input
                type="number"
                min={0}
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-full border border-hairline rounded-lg px-3 py-2 text-sm outline-none focus:border-ink"
              />
            </div>

            <p className="font-semibold text-ink mb-3">Amenities</p>
            <div className="flex flex-wrap gap-2 mb-5 max-h-40 overflow-y-auto">
              {AMENITY_OPTIONS.map((name) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => toggleAmenity(name)}
                  className={`px-3 py-1.5 rounded-full text-xs border whitespace-nowrap ${
                    amenities.includes(name)
                      ? "bg-ink text-white border-ink"
                      : "border-hairline text-ink hover:border-ink"
                  }`}
                >
                  {name}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-hairline">
              <button onClick={clearFilters} className="text-sm font-medium underline text-ink">
                Clear all
              </button>
              <button
                onClick={applyFilters}
                className="bg-ink text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-black"
              >
                Show results
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
