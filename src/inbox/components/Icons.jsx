// Inline stroke icons, 16px grid, drawn for the inbox. currentColor everywhere.
const base = { width: 16, height: 16, viewBox: '0 0 16 16', fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true, focusable: 'false' }

const paths = {
  archive: <><rect x="2" y="3" width="12" height="3" rx="1" /><path d="M3 6v6.5a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V6M6.5 9h3" /></>,
  inbox: <><path d="M2 9.5 3.6 4a1 1 0 0 1 1-.7h6.8a1 1 0 0 1 1 .7L14 9.5V12a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1Z" /><path d="M2 9.5h3.2l.8 1.5h4l.8-1.5H14" /></>,
  unread: <><rect x="2" y="4" width="12" height="9" rx="1.2" /><path d="m2.5 5 5.5 4 5.5-4" /><circle cx="13" cy="3.5" r="2" fill="currentColor" stroke="none" /></>,
  read: <><path d="M2 7.2 8 3l6 4.2V12a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1Z" /><path d="m2.4 7.5 5.6 3.6 5.6-3.6" /></>,
  pin: <path d="M9.6 2.5 13.5 6.4l-2.2.6-2.3 2.3.3 3-1.2 1.2-2.4-2.6L3.4 13.2l-.6-.6 2.3-2.3-2.6-2.4 1.2-1.2 3 .3 2.3-2.3Z" />,
  pinOff: <><path d="M9.6 2.5 13.5 6.4l-2.2.6-2.3 2.3.3 3-1.2 1.2-2.4-2.6L3.4 13.2l-.6-.6 2.3-2.3-2.6-2.4 1.2-1.2 3 .3 2.3-2.3Z" /><path d="m2 2 12 12" /></>,
  star: <path d="m8 2.2 1.75 3.6 3.95.57-2.86 2.78.67 3.93L8 11.22l-3.51 1.86.67-3.93L2.3 6.37l3.95-.57Z" />,
  trash: <><path d="M2.8 4.5h10.4M6.2 4.5V3.2a.8.8 0 0 1 .8-.8h2a.8.8 0 0 1 .8.8v1.3M4 4.5l.6 8.2a1 1 0 0 0 1 .9h4.8a1 1 0 0 0 1-.9l.6-8.2" /></>,
  tag: <><path d="M2.5 8.3V3a.5.5 0 0 1 .5-.5h5.3l5.2 5.2a.8.8 0 0 1 0 1.1l-4.2 4.2a.8.8 0 0 1-1.1 0Z" /><circle cx="5.5" cy="5.5" r="1" /></>,
  external: <path d="M6.5 3H3.5a1 1 0 0 0-1 1v8.5a1 1 0 0 0 1 1H12a1 1 0 0 0 1-1v-3M9.5 2.5h4v4M13.3 2.7 7.5 8.5" />,
  back: <path d="M13 8H3.5M7.5 4 3.5 8l4 4" />,
  refresh: <><path d="M13.2 6.5A5.3 5.3 0 0 0 3.4 5M2.8 9.5a5.3 5.3 0 0 0 9.8 1.5" /><path d="M3.2 2.5V5.2h2.7M12.8 13.5v-2.7h-2.7" /></>,
  settings: <><path d="M2.5 4.5h6M11.5 4.5h2M2.5 11.5h2M7.5 11.5h6" /><circle cx="10" cy="4.5" r="1.5" /><circle cx="6" cy="11.5" r="1.5" /></>,
  sort: <><path d="M2.5 3.5h11M4.5 8h7M6.5 12.5h3" /></>,
  search: <><circle cx="7" cy="7" r="4.3" /><path d="m10.2 10.2 3.3 3.3" /></>,
  close: <path d="m3.5 3.5 9 9M12.5 3.5l-9 9" />,
  check: <path d="m3 8.5 3.2 3 6.8-7" />,
  copy: <><rect x="5.5" y="5.5" width="8" height="8" rx="1" /><path d="M10.5 5.5V3.5a1 1 0 0 0-1-1h-6a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2" /></>,
  chevron: <path d="m4.5 6.5 3.5 3.5 3.5-3.5" />,
  clip: <path d="M13 7.5 8.1 12.4a3 3 0 0 1-4.3-4.3l5.3-5.3a2 2 0 0 1 2.9 2.9L6.8 10.9a1 1 0 0 1-1.5-1.5l4.6-4.6" />,
  keyboard: <><rect x="1.5" y="4" width="13" height="8.5" rx="1.2" /><path d="M4 6.5h.01M6.5 6.5h.01M9 6.5h.01M11.5 6.5h.01M4.5 10h7" /></>,
  image: <><rect x="2" y="3" width="12" height="10" rx="1.2" /><circle cx="5.8" cy="6.5" r="1.2" /><path d="m2.5 12 3.8-3.6 2.4 2.2 1.9-1.6 3 2.7" /></>,
  sparkle: <path d="M8 2.5v3M8 10.5v3M2.5 8h3M10.5 8h3M4.2 4.2l1.6 1.6M10.2 10.2l1.6 1.6M11.8 4.2l-1.6 1.6M5.8 10.2l-1.6 1.6" />,
}

export default function Icon({ name, size = 16, filled = false, className, title }) {
  const p = paths[name]
  if (!p) return null
  return (
    <svg {...base} width={size} height={size} className={className} fill={filled ? 'currentColor' : 'none'}
      role={title ? 'img' : undefined} aria-hidden={title ? undefined : true}>
      {title && <title>{title}</title>}
      {p}
    </svg>
  )
}
