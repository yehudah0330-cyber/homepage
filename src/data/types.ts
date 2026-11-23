export type NextCare = { label: string; endDate: string } // 예: 한약 복용 종료일
export type Reservation = {
  id: string
  name: string
  phone: string // 숫자만
  date: string // YYYY-MM-DD
  time: string // HH:mm
  status: 'confirmed' | 'cancelled'
  createdAt: string
  nextCare?: NextCare
}
export type Notice = { id: string; text: string; createdAt: string }
export type Column = { id: string; title: string; body: string; date: string; createdAt: string } // body: 빈 줄로 문단 구분
export type MessageKind = 'confirm' | 'change' | 'cancel' | 'reminder' | 'care'
export type OutboxItem = {
  id: string
  key: string // 중복 발송 방지용 (예: reminder:예약ID)
  kind: MessageKind
  to: string
  channel: 'alimtalk' | 'sms'
  text: string
  at: string
  status: 'preview' | 'sent'
}
export type CreateInput = { name: string; phone: string; date: string; time: string }
