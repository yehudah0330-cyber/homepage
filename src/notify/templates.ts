import { clinic } from '../config/clinic'
import { prettyDate, prettyTime } from '../lib/date'
import type { MessageKind, Reservation } from '../data/types'

export function buildMessage(kind: MessageKind, r: Reservation): string {
  const when = `${prettyDate(r.date)} ${prettyTime(r.time)}`
  const foot = `\n문의 ${clinic.phone}`
  switch (kind) {
    case 'confirm':
      return `[${clinic.name}] ${r.name}님, 예약이 확정되었습니다.\n일시: ${when}\n10분 전까지 도착해 주세요.${foot}`
    case 'change':
      return `[${clinic.name}] ${r.name}님, 예약이 변경되었습니다.\n변경된 일시: ${when}${foot}`
    case 'cancel':
      return `[${clinic.name}] ${r.name}님, 예약이 취소되었습니다.\n취소된 일시: ${when}\n다시 예약하실 때는 앱에서 편하게 눌러 주세요.${foot}`
    case 'reminder':
      return `[${clinic.name}] ${r.name}님, 내일 진료 예약 안내입니다.\n일시: ${when}\n변경·취소는 앱에서 가능합니다.${foot}`
    case 'care':
      return `[${clinic.name}] ${r.name}님, ${r.nextCare?.label ?? '복용'}이(가) ${r.nextCare ? prettyDate(r.nextCare.endDate) : ''}쯤 끝납니다.\n다음 진료를 미리 예약하시면 좋습니다.${foot}`
  }
}
