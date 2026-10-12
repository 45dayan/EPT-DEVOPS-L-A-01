export function Mark({ className = "h-9 w-9" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className={className}>
      <rect width="32" height="32" rx="8" fill="#1C1915" />
      <path
        d="M9 8h8.2c4.2 0 6.8 2.5 6.8 8s-2.6 8-6.8 8H9V8zm3.2 3.1v9.8h4.7c2.5 0 3.9-1.5 3.9-4.9s-1.4-4.9-3.9-4.9H12.2z"
        fill="#F3ECDF"
      />
      <rect x="22" y="22" width="6" height="6" rx="1.5" fill="#C56A22" />
    </svg>
  );
}
