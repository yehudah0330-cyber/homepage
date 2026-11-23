import type { Api } from './api'

/**
 * 나중에 Cloudflare(Workers + D1)를 연결할 때 채우는 자리입니다.
 * VITE_API_BASE 에 Workers 주소를 넣으면 화면이 자동으로 이 구현을 사용합니다.
 * 서버는 localApi.ts 와 같은 입력/출력을 지키면 됩니다.
 * (관리자 경로 /api/admin/* 는 서버에서 반드시 인증을 확인해야 합니다.)
 */
const base = (import.meta.env.VITE_API_BASE as string | undefined) ?? ''

async function call<T>(path: string, method = 'GET', body?: unknown): Promise<T> {
  const res = await fetch(base + path, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body)
  })
  if (!res.ok) {
    const msg = await res.json().then((j) => j.error as string).catch(() => '')
    throw new Error(msg || '서버와 연결하지 못했어요. 잠시 후 다시 시도해 주세요.')
  }
  return res.json() as Promise<T>
}
const q = (o: Record<string, string>) => new URLSearchParams(o).toString()

export const cloudflareApi: Api = {
  getClosedDays: () => call('/api/closed-days'),
  addClosedDay: (date, reason) => call('/api/admin/closed-days', 'POST', { date, reason }),
  removeClosedDay: (date) => call(`/api/admin/closed-days/${date}`, 'DELETE'),
  getReservations: () => call('/api/admin/reservations'),
  getAvailability: (date) => call(`/api/availability?${q({ date })}`),
  createReservation: (input) => call('/api/reservations', 'POST', input),
  changeReservation: (id, date, time) => call(`/api/reservations/${id}`, 'PATCH', { date, time }),
  cancelReservation: (id) => call(`/api/reservations/${id}/cancel`, 'POST'),
  findReservations: (name, phone) => call(`/api/reservations/lookup?${q({ name, phone })}`),
  setNextCare: (id, care) => call(`/api/admin/reservations/${id}/next-care`, 'PUT', care),
  getNotices: () => call('/api/notices'),
  saveNotice: (n) => call('/api/admin/notices', 'POST', n),
  deleteNotice: (id) => call(`/api/admin/notices/${id}`, 'DELETE'),
  getColumns: () => call('/api/columns'),
  saveColumn: (c) => call('/api/admin/columns', 'POST', c),
  deleteColumn: (id) => call(`/api/admin/columns/${id}`, 'DELETE'),
  isNotifyOn: (phone) => call<{ on: boolean }>(`/api/notify?${q({ phone })}`).then((r) => r.on),
  setNotifyOn: (phone, on) => call('/api/notify', 'PUT', { phone, on }),
  getOutbox: () => call('/api/admin/outbox'),
  addOutbox: (item) => call('/api/admin/outbox', 'POST', item)
}
