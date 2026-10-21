// Invented partner wordmark: a simple wave over the name. Harbour Bank is fictional.
export function HarbourBankMark() {
  return (
    <span className="inline-flex items-center gap-1.5 text-sm leading-none">
      <span className="font-light">with</span>
      <svg viewBox="0 0 20 12" className="h-3 w-5" aria-hidden="true">
        <path
          d="M1 8c2.5-3 5.5-3 8 0s5.5 3 8 0"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
      <span className="font-semibold tracking-wide">Harbour Bank</span>
    </span>
  );
}
