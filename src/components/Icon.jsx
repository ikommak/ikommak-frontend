const paths = {
  search: <><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></>,
  location: <><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></>,
  shield: <><path d="M12 3 5 6v5c0 4.7 2.8 8 7 10 4.2-2 7-5.3 7-10V6l-7-3Z"/><path d="m9 12 2 2 4-4"/></>,
  star: <path d="m12 2.8 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.4l6.2-.9L12 2.8Z"/>,
  check: <path d="m5 12 4 4L19 6"/>,
  arrow: <><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></>,
  clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
  phone: <path d="M7.5 3.5 5 5c-.8.5-.8 2-.2 3.5 1.8 4.5 5.2 7.9 9.7 9.7 1.5.6 3 .6 3.5-.2l1.5-2.5-4-2-1.4 1.4c-2.2-1-4-2.8-5-5L10.5 8l-3-4.5Z"/>,
  dollar: <><path d="M12 2v20"/><path d="M17 6.5c-1-1-2.6-1.5-4.5-1.5-2.5 0-4.5 1.3-4.5 3.3 0 5 9 2.2 9 7 0 2-2 3.7-5 3.7-2 0-3.8-.7-5-2"/></>,
  menu: <><path d="M4 7h16M4 12h16M4 17h16"/></>,
  close: <><path d="m6 6 12 12M18 6 6 18"/></>,
  tool: <><path d="M14.7 6.3a4 4 0 0 0-5 5L3 18l3 3 6.7-6.7a4 4 0 0 0 5-5l-2.4 2.4-3-3 2.4-2.4Z"/></>,
  chevron: <path d="m9 6 6 6-6 6"/>,
}

export default function Icon({ name, size = 20, filled = false, className = '' }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  )
}
