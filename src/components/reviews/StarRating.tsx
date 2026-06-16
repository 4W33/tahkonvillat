type Props = {
  value: number;
  size?: "sm" | "md" | "lg";
};

const sizeClass = {
  sm: "h-3.5 w-3.5",
  md: "h-4 w-4",
  lg: "h-5 w-5",
};

const STAR_PATH =
  "M10 1.5l2.47 5.01 5.53.8-4 3.9.94 5.5L10 14.9l-4.94 2.81.94-5.5-4-3.9 5.53-.8L10 1.5z";

export function StarRating({ value, size = "sm" }: Props) {
  const clamped = Math.min(5, Math.max(0, value));
  const filled = Math.round(clamped);

  return (
    <span
      className="inline-flex gap-0.5"
      role="img"
      aria-label={`${clamped.toFixed(1)} / 5`}
    >
      {Array.from({ length: 5 }, (_, index) => (
        <svg
          key={index}
          viewBox="0 0 20 20"
          className={`${sizeClass[size]} ${
            index < filled ? "text-gold" : "text-cream-300"
          }`}
          aria-hidden
        >
          <path fill="currentColor" d={STAR_PATH} />
        </svg>
      ))}
    </span>
  );
}
