import type { CreateInput, NextCare, Notice, OutboxItem, Reservation } from './types'
import { localApi } from './localApi'
import { cloudflareApi } from './cloudflareApi'

/**
 * 화면은 이 인터페이스만 사용합니다.
 * 지금은 localApi(이 기기 저장), VITE_API_BASE 를 넣으면 cloudflareApi 로 자동 전환됩니다.
 */
export interface Api {
  getClosedDays(): Promise<Record<string, string>> // { '2026-12-25': '성탄절' }
  addClosedDay(date: string, reason: string): Promise<void>
  removeClosedDay(date: string): Promise<void>
  getReservations(): Promise<Reservation[]>
  /** 날짜별 시간대 남은 자리 */
  getAvailability(date: string): Promise<Record<string, number>>
  createReservation(input: CreateInput): Promise<Reservation>
  changeReservation(id: string, date: string, time: string): Promise<Reservation>
  cancelReservation(id: string): Promise<Reservation>
  findReservations(name: string, phone: string): Promise<Reservation[]>
  setNextCare(id: string, care: NextCare | null): Promise<void>
  getNotices(): Promise<Notice[]>
  saveNotice(n: { id?: string; text: string }): Promise<void>
  deleteNotice(id: string): Promise<void>
  isNotifyOn(phone: string): Promise<boolean>
  setNotifyOn(phone: string, on: boolean): Promise<void>
  getOutbox(): Promise<OutboxItem[]>
  addOutbox(item: Omit<OutboxItem, 'id' | 'at'>): Promise<void>
}

export const api: Api = import.meta.env.VITE_API_BASE ? cloudflareApi : localApi
