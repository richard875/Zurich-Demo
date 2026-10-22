import { cn } from '@/lib/cn';

// Decorative shapes that sit on their bottom edge, so they can rest on a band's edge or a photo's
// corner. The hero's is zurich.com.au's stage shape; the band's is drawn for this demo.
const arrangements = {
  // zurich.com.au's stage shape (267 × 144), on Zurich Blue: two half discs cut on the diagonal
  // and two circles.
  hero: (
    <svg viewBox="0 0 267 144" className="h-full w-full">
      <path
        d="M122.441 24.649C130.253 16.8353 139.528 10.6369 149.736 6.40759C159.944 2.17831 170.884 0.00100644 181.934 3.48832e-07C192.983 -0.00100574 203.924 2.1743 214.133 6.40172C224.341 10.6291 233.617 16.8259 241.431 24.6382C249.244 32.4505 255.443 41.7253 259.672 51.933C263.902 62.1408 266.079 73.0816 266.08 84.1309C266.081 95.1801 263.905 106.121 259.678 116.33C255.451 126.538 249.254 135.814 241.442 143.628L122.441 24.649Z"
        className="fill-zurich-white"
      />
      <path
        d="M47.7567 143.94C42.3226 138.486 38.016 132.015 35.0827 124.897C32.1495 117.778 30.6471 110.152 30.6612 102.452C30.6754 94.7532 32.2059 87.1323 35.1653 80.0246C38.1247 72.917 42.4552 66.4618 47.9093 61.0277C53.3634 55.5936 59.8345 51.287 66.953 48.3538C74.0715 45.4205 81.698 43.9181 89.3972 43.9323C97.0963 43.9465 104.717 45.477 111.825 48.4364C118.933 51.3958 125.388 55.7262 130.822 61.1804L47.7567 143.94Z"
        className="fill-light-blue"
      />
      <circle cx="145.046" cy="103.729" r="40.2712" className="fill-white" />
      <circle cx="17.4915" cy="126.508" r="17.4915" className="fill-sky-blue" />
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
