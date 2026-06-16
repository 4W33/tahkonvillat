import { Link } from "@/i18n/navigation";

type Props = {
  href: "/" | "/villas" | "/apartments" | "/contact" | "/faq";
  label: string;
};

export function BackLink({ href, label }: Props) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 font-sans text-sm text-forest-600 transition-colors hover:text-forest"
    >
      <svg
        viewBox="0 0 16 16"
        fill="none"
        className="h-4 w-4"
        aria-hidden
      >
        <path
          d="M10 3L5 8l5 5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {label}
    </Link>
  );
}
