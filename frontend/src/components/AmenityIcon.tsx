import {
  Wifi, ChefHat, Car, WashingMachine, Wind, Waves, Droplets, Laptop, Tv,
  Flame, PawPrint, Dumbbell, Umbrella, Mountain, Coffee, CircleCheck,
  LucideIcon,
} from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  wifi: Wifi,
  "chef-hat": ChefHat,
  car: Car,
  "washing-machine": WashingMachine,
  wind: Wind,
  waves: Waves,
  droplets: Droplets,
  laptop: Laptop,
  tv: Tv,
  flame: Flame,
  "paw-print": PawPrint,
  dumbbell: Dumbbell,
  umbrella: Umbrella,
  mountain: Mountain,
  coffee: Coffee,
};

export default function AmenityIcon({ icon, size = 20 }: { icon: string | null; size?: number }) {
  const Icon = (icon && ICONS[icon]) || CircleCheck;
  return <Icon size={size} strokeWidth={1.5} />;
}
