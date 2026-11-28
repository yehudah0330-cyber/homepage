import { clinic } from '../config/clinic'
import { fromISO, fromMin, prettyTime, toISO, toMin } from './date'

/** 그 날짜의 예약 가능 시각 목록 (점심시간 제외). 정기 휴진이면 빈 배열 */
export function daySlots(iso: string): string[] {
  if (clinic.closedHolidays[iso] !== undefined) return []
  const h = clinic.hours[fromISO(iso).getDay()]
  if (!h) return []
  const out: string[] = []
  const end = toMin(h.close) - clinic.slotMinutes
  for (let t = toMin(h.open); t <= end; t += clinic.slotMinutes) {
    if (h.lunchStart && h.lunchEnd && t >= toMin(h.lunchStart) && t < toMin(h.lunchEnd)) continue
    out.push(fromMin(t))
  }
  return out
}

export type TodayState = { kind: 'closed' | 'before' | 'open' | 'lunch' | 'after'; text: string }

/** 첫 화면에 보여줄 "오늘 진료 여부" */
export function todayState(now: Date, closedDates: Record<string, string>): TodayState {
  const iso = toISO(now)
  if (clinic.closedHolidays[iso] !== undefined && closedDates[iso] === undefined) {
    return { kind: 'closed', text: `오늘은 ${clinic.closedHolidays[iso]}이라 쉽니다` }
  }
  if (closedDates[iso] !== undefined) {
    const why = closedDates[iso]
    return { kind: 'closed', text: `오늘은 쉽니다${why ? ` (${why})` : ''}` }
  }
  const h = clinic.hours[now.getDay()]
  if (!h) return { kind: 'closed', text: '오늘은 정기 휴진일입니다' }
  const m = now.getHours() * 60 + now.getMinutes()
  const end = prettyTime(h.close)
  const tag = h.night ? '야간진료' : '진료'
  if (m < toMin(h.open)) return { kind: 'before', text: `오늘 ${prettyTime(h.open)}부터 ${end}까지${h.night ? ' 야간진료' : ' 진료'}합니다` }
  if (m >= toMin(h.close)) return { kind: 'after', text: `오늘 ${tag}가 끝났습니다 (${end}까지)` }
  if (h.lunchStart && h.lunchEnd && m >= toMin(h.lunchStart) && m < toMin(h.lunchEnd))
    return { kind: 'lunch', text: `지금은 점심시간 · ${prettyTime(h.lunchEnd)}부터 진료${h.night ? ` (오늘은 ${end}까지 야간진료)` : ''}` }
  return { kind: 'open', text: h.night ? `오늘은 야간진료일 · ${end}까지 진료합니다` : `오늘 진료 중 · ${end}까지` }
}
