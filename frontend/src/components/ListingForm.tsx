"use client";

import { useState } from "react";
import { ListingDetail } from "@/lib/types";

export interface ListingFormValues {
  title: string;
  description: string;
  property_type: string;
  city: string;
  state: string;
  country: string;
  price_per_night: number;
  cleaning_fee: number;
  max_guests: number;
  bedrooms: number;
  beds: number;
  bathrooms: number;
  photo_urls: string[];
  amenity_names: string[];
}

const PROPERTY_TYPES = [
  "Entire apartment", "Entire house", "Private room", "Cabin", "Villa",
  "Cottage", "Farmhouse", "Bungalow", "Houseboat", "Treehouse", "Unique stay",
];

const AMENITY_OPTIONS = [
  "Wifi", "Kitchen", "Free parking", "Washer", "Air conditioning", "Pool",
  "Hot tub", "Dedicated workspace", "TV", "Fireplace", "Pet friendly",
  "Gym", "Beach access", "Mountain view", "Breakfast included",
];

function toDefaults(listing?: ListingDetail): ListingFormValues {
  if (!listing) {
    return {
      title: "", description: "", property_type: PROPERTY_TYPES[0],
      city: "", state: "", country: "", price_per_night: 50, cleaning_fee: 0,
      max_guests: 2, bedrooms: 1, beds: 1, bathrooms: 1,
      photo_urls: ["", "", ""], amenity_names: [],
    };
  }
  return {
    title: listing.title,
    description: listing.description,
    property_type: listing.property_type,
    city: listing.city,
    state: listing.state || "",
    country: listing.country,
    price_per_night: listing.price_per_night,
    cleaning_fee: listing.cleaning_fee,
    max_guests: listing.max_guests,
    bedrooms: listing.bedrooms,
    beds: listing.beds,
    bathrooms: listing.bathrooms,
    photo_urls: listing.photos.length ? listing.photos.map((p) => p.url) : ["", "", ""],
    amenity_names: listing.amenities.map((a) => a.name),
  };
}

export default function ListingForm({
  initial,
  submitLabel,
  onSubmit,
  submitting,
}: {
  initial?: ListingDetail;
  submitLabel: string;
  onSubmit: (values: ListingFormValues) => void;
  submitting: boolean;
}) {
  const [values, setValues] = useState<ListingFormValues>(toDefaults(initial));

  function set<K extends keyof ListingFormValues>(key: K, value: ListingFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function updatePhoto(i: number, url: string) {
    const next = [...values.photo_urls];
    next[i] = url;
    set("photo_urls", next);
  }

  function toggleAmenity(name: string) {
    set(
      "amenity_names",
      values.amenity_names.includes(name)
        ? values.amenity_names.filter((a) => a !== name)
        : [...values.amenity_names, name]
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit({ ...values, photo_urls: values.photo_urls.filter((u) => u.trim()) });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl">
      <Section title="Basics">
        <Field label="Title">
          <input
            required
            value={values.title}
            onChange={(e) => set("title", e.target.value)}
            placeholder="Sunlit A-frame cabin in the pines"
            className="input"
          />
        </Field>
        <Field label="Description">
          <textarea
            required
            rows={4}
            value={values.description}
            onChange={(e) => set("description", e.target.value)}
            className="input"
          />
        </Field>
        <Field label="Property type">
          <select value={values.property_type} onChange={(e) => set("property_type", e.target.value)} className="input">
            {PROPERTY_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </Field>
      </Section>

      <Section title="Location">
        <div className="grid grid-cols-3 gap-3">
          <Field label="City"><input required value={values.city} onChange={(e) => set("city", e.target.value)} className="input" /></Field>
          <Field label="State"><input value={values.state} onChange={(e) => set("state", e.target.value)} className="input" /></Field>
          <Field label="Country"><input required value={values.country} onChange={(e) => set("country", e.target.value)} className="input" /></Field>
        </div>
      </Section>

      <Section title="Space">
        <div className="grid grid-cols-4 gap-3">
          <Field label="Guests">
            <input type="number" min={1} value={values.max_guests} onChange={(e) => set("max_guests", Number(e.target.value))} className="input" />
          </Field>
          <Field label="Bedrooms">
            <input type="number" min={0} value={values.bedrooms} onChange={(e) => set("bedrooms", Number(e.target.value))} className="input" />
          </Field>
          <Field label="Beds">
            <input type="number" min={1} value={values.beds} onChange={(e) => set("beds", Number(e.target.value))} className="input" />
          </Field>
          <Field label="Baths">
            <input type="number" min={0.5} step={0.5} value={values.bathrooms} onChange={(e) => set("bathrooms", Number(e.target.value))} className="input" />
          </Field>
        </div>
      </Section>

      <Section title="Pricing">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Price per night (USD)">
            <input type="number" min={1} value={values.price_per_night} onChange={(e) => set("price_per_night", Number(e.target.value))} className="input" />
          </Field>
          <Field label="Cleaning fee (USD)">
            <input type="number" min={0} value={values.cleaning_fee} onChange={(e) => set("cleaning_fee", Number(e.target.value))} className="input" />
          </Field>
        </div>
      </Section>

      <Section title="Photos">
        <p className="text-xs text-graytext mb-2">Paste image URLs. Leave blank slots empty - at least one photo is recommended.</p>
        <div className="space-y-2">
          {values.photo_urls.map((url, i) => (
            <input
              key={i}
              value={url}
              onChange={(e) => updatePhoto(i, e.target.value)}
              placeholder={`https://... (photo ${i + 1})`}
              className="input"
            />
          ))}
          <button
            type="button"
            onClick={() => set("photo_urls", [...values.photo_urls, ""])}
            className="text-sm text-ink underline"
          >
            + Add another photo
          </button>
        </div>
      </Section>

      <Section title="Amenities">
        <div className="flex flex-wrap gap-2">
          {AMENITY_OPTIONS.map((name) => (
            <button
              type="button"
              key={name}
              onClick={() => toggleAmenity(name)}
              className={`px-3 py-1.5 rounded-full text-xs border ${
                values.amenity_names.includes(name) ? "bg-ink text-white border-ink" : "border-hairline text-ink"
              }`}
            >
              {name}
            </button>
          ))}
        </div>
      </Section>

      <button
        type="submit"
        disabled={submitting}
        className="bg-rausch hover:bg-rausch-dark disabled:opacity-60 text-white font-semibold rounded-lg px-6 py-3"
      >
        {submitting ? "Saving..." : submitLabel}
      </button>

      <style jsx>{`
        .input {
          width: 100%;
          border: 1px solid #dddddd;
          border-radius: 8px;
          padding: 0.55rem 0.75rem;
          font-size: 0.875rem;
          outline: none;
        }
        .input:focus {
          border-color: #222222;
        }
      `}</style>
    </form>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="font-semibold text-ink mb-3">{title}</h2>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-graytext mb-1">{label}</label>
      {children}
    </div>
  );
}
