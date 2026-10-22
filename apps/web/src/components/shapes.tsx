import { cn } from '@/lib/cn';

// Decorative circles in the spirit of zurich.com.au's, drawn for this demo. Both sit on their
// bottom edge, so they can rest on a band's edge or a photo's corner.
const arrangements = {
  // Beside the hero photo, on Zurich Blue.
  hero: (
    <svg viewBox="0 0 200 110" className="h-full w-full">
      <circle cx="18" cy="100" r="9" className="fill-sky-blue" />
      <path d="M40 110 A62 62 0 0 1 102 48 V110 Z" className="fill-light-blue" />
      <circle cx="104" cy="82" r="28" className="fill-white" />
      <path d="M130 110 A70 70 0 0 1 200 40 V110 Z" className="fill-zurich-white" />
    </svg>
  ),
  // Beside the lime band's round photo.
  band: (
    <svg viewBox="0 0 180 120" className="h-full w-full">
      <path d="M0 120 A84 84 0 0 1 84 36 V120 Z" className="fill-light-blue" />
      <circle cx="122" cy="84" r="36" className="fill-dark-blue" />
      <circle cx="74" cy="104" r="14" className="fill-sky-blue" />
    </svg>
  ),
};

export function Shapes({
  arrangement,
  className,
}: {
  arrangement: keyof typeof arrangements;
  className?: string;
}) {
  return (
    <div aria-hidden="true" className={cn('pointer-events-none', className)}>
      {arrangements[arrangement]}
    </div>
  );
}
