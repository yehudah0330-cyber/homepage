// 예약과 관리자 로그인: 항상 우리 서버(worker)와 통신합니다.
import type { Reservation } from './types'

async function call<T>(path: string, method = 'GET', body?: unknown): Promise<T> {
  const res = await fetch(path, { method, headers: { 'Content-Type': 'application/json' }, body: body === undefined ? undefined : JSON.stringify(body) })
  const data = await res.json().catch(() => null)
  if (!res.ok || data === null) throw Object.assign(new Error((data as { error?: string } | null)?.error || '서버와 연결하지 못했어요. 잠시 후 다시 시도해 주세요.'), { status: res.status })
  return data as T
}

export type Input = { name: string; phone: string; date: string; time: string; service: string }

export const booking = {
  status: () => call<{ open: boolean; preview: boolean }>('/api/booking-status'),
  availability: (date: string) => call<Record<string, number>>(`/api/availability?date=${date}`),
  request: (input: Input) => call<Reservation>('/api/reservations', 'POST', input),
  mine: (name: string, phone: string) => call<Reservation[]>(`/api/reservations/lookup?${new URLSearchParams({ name, phone })}`),
  cancel: (id: string) => call<Reservation>(`/api/reservations/${id}/cancel`, 'POST'),
  session: () => call<{ admin: boolean; ready: boolean }>('/api/session'),
  login: (password: string, remember: boolean) => call('/api/login', 'POST', { password, remember }),
  logout: () => call('/api/logout', 'POST'),
  logoutAll: () => call('/api/admin/logout-all', 'POST'),
  list: () => call<Reservation[]>('/api/admin/reservations'),
  add: (input: Input) => call('/api/admin/reservations', 'POST', input),
  update: (id: string, change: Partial<Pick<Reservation, 'status' | 'date' | 'time'>>) => call(`/api/admin/reservations/${id}`, 'PATCH', change)
}
