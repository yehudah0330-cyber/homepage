import { clinic } from '../config/clinic'
import { daySlots } from '../lib/schedule'
import { normPhone } from '../lib/date'
import type { Api } from './api'
import type { Notice, OutboxItem, Reservation } from './types'

const K = {
  res: 'hw:reservations',
  closed: 'hw:closed',
  notices: 'hw:notices',
  notifyOff: 'hw:notifyOff',
  outbox: 'hw:outbox'
}
function load<T>(key: string, fallback: T): T {
  try {
    const v = localStorage.getItem(key)
    return v ? (JSON.parse(v) as T) : fallback
  } catch {
    return fallback
  }
}
function save(key: string, v: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(v))
  } catch {
    /* 저장소를 쓸 수 없는 환경 */
  }
}
const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4)

function getNotices(): Notice[] {
  const n = load<Notice[] | null>(K.notices, null)
  if (n) return n
  const first: Notice[] = [
    { id: uid(), text: '환절기에는 따뜻한 물을 자주 드시고, 예약 시간 10분 전에 도착해 주세요.', createdAt: new Date().toISOString() }
  ]
  save(K.notices, first)
  return first
}

function used(all: Reservation[], date: string, time: string, ignoreId?: string) {
  return all.filter((r) => r.status === 'confirmed' && r.date === date && r.time === time && r.id !== ignoreId).length
}
const FULL = '방금 다른 분이 예약하셨어요. 다른 시간을 골라 주세요.'

export const localApi: Api = {
  async getClosedDays() {
    return load<Record<string, string>>(K.closed, {})
  },
  async addClosedDay(date, reason) {
    const c = load<Record<string, string>>(K.closed, {})
    c[date] = reason
    save(K.closed, c)
  },
  async removeClosedDay(date) {
    const c = load<Record<string, string>>(K.closed, {})
    delete c[date]
    save(K.closed, c)
  },
  async getReservations() {
    return load<Reservation[]>(K.res, [])
  },
  async getAvailability(date) {
    const closed = load<Record<string, string>>(K.closed, {})
    if (closed[date] !== undefined) return {}
    const all = load<Reservation[]>(K.res, [])
    const out: Record<string, number> = {}
    for (const t of daySlots(date)) out[t] = Math.max(0, clinic.capacityPerSlot - used(all, date, t))
    return out
  },
  async createReservation(input) {
    const all = load<Reservation[]>(K.res, [])
    if (used(all, input.date, input.time) >= clinic.capacityPerSlot) throw new Error(FULL)
    const r: Reservation = {
      id: uid(),
      ...input,
      phone: normPhone(input.phone),
      status: 'confirmed',
      createdAt: new Date().toISOString()
    }
    save(K.res, [...all, r])
    return r
  },
  async changeReservation(id, date, time) {
    const all = load<Reservation[]>(K.res, [])
    const r = all.find((x) => x.id === id)
    if (!r) throw new Error('예약을 찾을 수 없어요.')
    if (used(all, date, time, id) >= clinic.capacityPerSlot) throw new Error(FULL)
    r.date = date
    r.time = time
    r.status = 'confirmed'
    save(K.res, all)
    return r
  },
  async cancelReservation(id) {
    const all = load<Reservation[]>(K.res, [])
    const r = all.find((x) => x.id === id)
    if (!r) throw new Error('예약을 찾을 수 없어요.')
    r.status = 'cancelled'
    save(K.res, all)
    return r
  },
  async findReservations(name, phone) {
    const p = normPhone(phone)
    return load<Reservation[]>(K.res, []).filter((r) => r.phone === p && r.name.trim() === name.trim())
  },
  async setNextCare(id, care) {
    const all = load<Reservation[]>(K.res, [])
    const r = all.find((x) => x.id === id)
    if (r) {
      if (care) r.nextCare = care
      else delete r.nextCare
      save(K.res, all)
    }
  },
  async getNotices() {
    return [...getNotices()].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  },
  async saveNotice(n) {
    const all = getNotices()
    if (n.id) {
      const f = all.find((x) => x.id === n.id)
      if (f) f.text = n.text
    } else all.push({ id: uid(), text: n.text, createdAt: new Date().toISOString() })
    save(K.notices, all)
  },
  async deleteNotice(id) {
    save(K.notices, getNotices().filter((x) => x.id !== id))
  },
  async isNotifyOn(phone) {
    return !load<string[]>(K.notifyOff, []).includes(normPhone(phone))
  },
  async setNotifyOn(phone, on) {
    const p = normPhone(phone)
    const off = load<string[]>(K.notifyOff, []).filter((x) => x !== p)
    if (!on) off.push(p)
    save(K.notifyOff, off)
  },
  async getOutbox() {
    return load<OutboxItem[]>(K.outbox, [])
  },
  async addOutbox(item) {
    const all = load<OutboxItem[]>(K.outbox, [])
    all.unshift({ ...item, id: uid(), at: new Date().toISOString() })
    save(K.outbox, all.slice(0, 200))
  }
}
