interface BookCoverProps {
  className?: string
}

export function BookCover({ className = '' }: BookCoverProps) {
  return (
    <div
      className={`
        aspect-[2/3] w-64 md:w-72 lg:w-80
        bg-cover bg-center bg-base-300
        shadow-2xl rounded-sm
        ${className}
      `}
      style={{ backgroundImage: "url('/aiimmigrants-cover.png')" }}
      role="img"
      aria-label="AI Immigrants book cover"
    />
  )
}
