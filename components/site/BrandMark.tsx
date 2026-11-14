/** The lab's mark: a specimen frame with a calibration crosshair and one signal point. */
export function BrandMark({ className = "brand-mark" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M1 7V1h6M17 1h6v6M23 17v6h-6M7 23H1v-6" stroke="currentColor" strokeWidth="1.5" />
      <path d="M12 5v4M12 15v4M5 12h4M15 12h4" stroke="currentColor" strokeOpacity="0.45" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="2.6" fill="#FF5A1F" />
    </svg>
  );
}
