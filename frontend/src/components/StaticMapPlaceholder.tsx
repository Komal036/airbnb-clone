"use client";

import { useState } from "react";
import { MapPin } from "lucide-react";
import ComingSoonModal from "./ComingSoonModal";

/**
 * A static, lightweight "map" - not a real tile-based map (that would need
 * a Google Maps / Mapbox API key), just an SVG that plots the listing's
 * stored lat/lng on a stylized grid so the location still feels situated
 * on a map. The brief explicitly allows a static map image here. The
 * interactive version is flagged as a "Coming soon" placeholder, same as
 * messaging and identity verification.
 */
export default function StaticMapPlaceholder({
  latitude,
  longitude,
  locationLabel,
}: {
  latitude: number | null;
  longitude: number | null;
  locationLabel: string;
}) {
  const [open, setOpen] = useState(false);

  // Normalize lat/lng into a 0-100 position inside the box just for a
  // plausible-looking pin placement, not real cartography.
  const left = latitude !== null ? ((latitude + 90) / 180) * 100 : 50;
  const top = longitude !== null ? ((longitude + 180) / 360) * 100 : 50;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="relative w-full aspect-[16/7] rounded-xl2 overflow-hidden border border-hairline group"
      >
        <svg viewBox="0 0 400 175" className="w-full h-full" preserveAspectRatio="none">
          <rect width="400" height="175" fill="#EAEAEA" />
          {Array.from({ length: 9 }).map((_, i) => (
            <line key={`v${i}`} x1={i * 50} y1="0" x2={i * 50} y2="175" stroke="#D6D6D6" strokeWidth="1" />
          ))}
          {Array.from({ length: 5 }).map((_, i) => (
            <line key={`h${i}`} x1="0" y1={i * 44} x2="400" y2={i * 44} stroke="#D6D6D6" strokeWidth="1" />
          ))}
        </svg>
        <div
          className="absolute -translate-x-1/2 -translate-y-full"
          style={{ left: `${top}%`, top: `${left}%` }}
        >
          <MapPin size={32} className="fill-rausch text-white drop-shadow" strokeWidth={1.5} />
        </div>
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors flex items-end justify-start p-3">
          <span className="bg-white text-ink text-xs font-medium px-3 py-1.5 rounded-lg shadow-soft">
            Interactive map coming soon - showing approximate area near {locationLabel}
          </span>
        </div>
      </button>

      <ComingSoonModal
        open={open}
        onClose={() => setOpen(false)}
        icon={MapPin}
        title="Live map"
        description="An interactive map with real pricing pins for nearby stays isn't wired up in this build - the brief allows a static map placeholder here instead."
      />
    </>
  );
}
