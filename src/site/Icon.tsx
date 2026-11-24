// 한 가지 선 굵기로 그린 아이콘
const PATHS: Record<string, string> = {
  pin: 'M12 21s-6-5.4-6-10a6 6 0 1 1 12 0c0 4.6-6 10-6 10z M12 8.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5z',
  clock: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z M12 7v5l3 2',
  calendar: 'M4 6h16v14H4z M4 10h16 M8 3v4 M16 3v4',
  phone: 'M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a1 1 0 0 1-1 1A15 15 0 0 1 4 5a1 1 0 0 1 1-1z',
  leaf: 'M5 19C5 10 10 5 20 4c0 10-5 15-14 15z M5 19l8-8',
  arrow: 'M5 12h14 M13 6l6 6-6 6'
}

export function Icon({ name }: { name: keyof typeof PATHS }) {
  return (
    <svg className="icon" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={PATHS[name]} />
    </svg>
  )
}
