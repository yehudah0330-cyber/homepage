export const DAY_NAMES = ['일', '월', '화', '수', '목', '금', '토']

export function toISO(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
}
export function fromISO(s: string): Date {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d)
}
export function addDays(d: Date, n: number): Date {
  const r = new Date(d)
  r.setDate(r.getDate() + n)
  return r
}
export function todayISO(): string {
  return toISO(new Date())
}
export function prettyDate(iso: string): string {
  const d = fromISO(iso)
  return `${d.getMonth() + 1}월 ${d.getDate()}일 (${DAY_NAMES[d.getDay()]})`
}
export function toMin(t: string): number {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}
export function fromMin(n: number): string {
  return `${String(Math.floor(n / 60)).padStart(2, '0')}:${String(n % 60).padStart(2, '0')}`
}
export function prettyTime(t: string): string {
  const [h, m] = t.split(':').map(Number)
  const ap = h < 12 ? '오전' : '오후'
  const hh = h % 12 === 0 ? 12 : h % 12
  return m === 0 ? `${ap} ${hh}시` : `${ap} ${hh}시 ${m}분`
}
export function normPhone(p: string): string {
  return p.replace(/\D/g, '')
}
export function prettyPhone(p: string): string {
  const n = normPhone(p)
  if (n.length === 11) return `${n.slice(0, 3)}-${n.slice(3, 7)}-${n.slice(7)}`
  if (n.length === 10) return `${n.slice(0, 3)}-${n.slice(3, 6)}-${n.slice(6)}`
  return p
}
export function validPhone(p: string): boolean {
  return /^01[016789]\d{7,8}$/.test(normPhone(p))
}
