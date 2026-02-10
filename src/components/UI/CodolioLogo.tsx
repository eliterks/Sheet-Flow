export function CodolioLogo({ className = 'h-6 w-6' }: { className?: string }) {
  return (
    <img
      src="https://codolio.com/codolio_assets/codolio.svg"
      alt="Codolio"
      className={className}
      loading="lazy"
      referrerPolicy="no-referrer"
    />
  )
}
