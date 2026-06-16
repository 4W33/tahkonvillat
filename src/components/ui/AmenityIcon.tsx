import type { AmenityId } from "@/types/villa";

type Props = {
  amenity: AmenityId;
  className?: string;
};

export function AmenityIcon({ amenity, className = "h-5 w-5" }: Props) {
  const shared = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.5,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className,
    "aria-hidden": true,
  };

  switch (amenity) {
    case "sauna":
      return (
        <svg {...shared}>
          <path d="M8 20h8M6 16h12M9 12c1-2 2-3 3-3s2 1 3 3M7 8c.5-1.5 1.5-2.5 3-2.5M14 8c.5-1.5 1.5-2.5 3-2.5" />
          <path d="M12 4v2" />
        </svg>
      );
    case "wifi":
      return (
        <svg {...shared}>
          <path d="M5 9a11 11 0 0114 0M8.5 12.5a6 6 0 017 0M12 16h.01" />
          <circle cx="12" cy="19" r="1" fill="currentColor" stroke="none" />
        </svg>
      );
    case "jacuzzi":
      return (
        <svg {...shared}>
          <path d="M4 14h16M6 10c2 2 4 2 6 0s4-2 6 0M7 18c1 1 2 1 3 0s2-1 3 0 2-1 3 0" />
        </svg>
      );
    case "pets":
      return (
        <svg {...shared}>
          <circle cx="8" cy="9" r="2" />
          <circle cx="16" cy="9" r="2" />
          <circle cx="6" cy="14" r="1.5" />
          <circle cx="18" cy="14" r="1.5" />
          <path d="M12 11c-2 0-4 2-4 5v2h8v-2c0-3-2-5-4-5z" />
        </svg>
      );
    case "beds":
      return (
        <svg {...shared}>
          <path d="M4 18V10a3 3 0 013-3h10a3 3 0 013 3v8" />
          <path d="M4 14h16M4 18h16" />
        </svg>
      );
    case "kitchen":
      return (
        <svg {...shared}>
          <path d="M6 4v7M10 4v7M6 11h4M18 4v16M14 8h6" />
        </svg>
      );
    case "fireplace":
      return (
        <svg {...shared}>
          <path d="M6 20h12M8 20V10l4-4 4 4v10" />
          <path d="M12 14c-1 2-2 3-2 4h4c0-1-1-2-2-4z" />
        </svg>
      );
    case "parking":
      return (
        <svg {...shared}>
          <rect x="4" y="4" width="16" height="16" rx="2" />
          <path d="M10 8h3a2 2 0 110 4h-3v4" />
        </svg>
      );
    default:
      return null;
  }
}
