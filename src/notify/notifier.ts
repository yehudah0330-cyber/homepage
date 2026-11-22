import { api } from '../data/api'
import type { MessageKind, Reservation } from '../data/types'
import { addDays, toISO } from '../lib/date'
import { buildMessage } from './templates'

/**
 * 알림 발송 한 곳. 지금은 "미리보기"로 기록만 남깁니다.
 * 실제 발송(카카오 알림톡 → 실패 시 문자)은 Cloudflare Workers 에서 솔라피 등
 * 발송 대행사 API 를 호출하도록 연결하세요. (카카오 채널·템플릿 승인 필요)
 *
 * 예약 확정/변경/취소는 꼭 필요한 안내라 항상 보내고,
 * 전날 알림·다음 진료 안내는 환자가 끄면 보내지 않습니다.
 */
export async function notify(kind: MessageKind, r: Reservation, key?: string): Promise<string> {
  const text = buildMessage(kind, r)
  const optional = kind === 'reminder' || kind === 'care'
  if (optional && !(await api.isNotifyOn(r.phone))) return text
  await api.addOutbox({ key: key ?? `${kind}:${r.id}:${Date.now()}`, kind, to: r.phone, channel: 'alimtalk', text, status: 'preview' })
  return text
}

export type DueItem = { key: string; kind: MessageKind; r: Reservation }

/** 오늘 보내야 할 알림: 내일 예약(전날 알림), 복용 종료 2일 전 안내 */
export async function computeDue(now: Date): Promise<DueItem[]> {
  const [all, outbox] = await Promise.all([api.getReservations(), api.getOutbox()])
  const sent = new Set(outbox.map((o) => o.key))
  const today = toISO(now)
  const tomorrow = toISO(addDays(now, 1))
  const inTwo = toISO(addDays(now, 2))
  const due: DueItem[] = []
  for (const r of all) {
    if (r.status !== 'confirmed') continue
    if (!(await api.isNotifyOn(r.phone))) continue
    const rk = `reminder:${r.id}:${r.date}`
    if (r.date === tomorrow && !sent.has(rk)) due.push({ key: rk, kind: 'reminder', r })
    const end = r.nextCare?.endDate
    const ck = `care:${r.id}:${end}`
    if (end && end >= today && end <= inTwo && !sent.has(ck)) due.push({ key: ck, kind: 'care', r })
  }
  return due
}
