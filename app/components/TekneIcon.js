export default function TekneIcon({ size = 32, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Large outer triangle */}
      <path
        d="M16 2L30 28H2L16 2Z"
        fill="currentColor"
        className="text-white"
      />
      
      {/* Inner smaller triangle */}
      <path
        d="M16 8L24 24H8L16 8Z"
        fill="currentColor"
        className="text-white opacity-80"
      />
      
      {/* Faceting lines - connecting inner triangle vertices to outer triangle */}
      <path
        d="M16 8L16 2"
        stroke="currentColor"
        strokeWidth="0.5"
        className="text-white opacity-60"
      />
      <path
        d="M24 24L30 28"
        stroke="currentColor"
        strokeWidth="0.5"
        className="text-white opacity-60"
      />
      <path
        d="M8 24L2 28"
        stroke="currentColor"
        strokeWidth="0.5"
        className="text-white opacity-60"
      />
      
      {/* Additional faceting lines for more complexity */}
      <path
        d="M16 8L24 28"
        stroke="currentColor"
        strokeWidth="0.3"
        className="text-white opacity-40"
      />
      <path
        d="M16 8L8 28"
        stroke="currentColor"
        strokeWidth="0.3"
        className="text-white opacity-40"
      />
      
      {/* Center line for symmetry */}
      <path
        d="M16 8L16 28"
        stroke="currentColor"
        strokeWidth="0.3"
        className="text-white opacity-50"
      />
    </svg>
  )
} 