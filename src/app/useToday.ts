import { useEffect, useState } from 'react'
import { api } from '../data/api'
import { todayState, type TodayState } from '../lib/schedule'

/** 오늘 진료 상태와 임시 휴진일. 1분마다 다시 확인합니다. */
export function useToday() {
  const [state, setState] = useState<TodayState | null>(null)
  const [closed, setClosed] = useState<Record<string, string>>({})
  useEffect(() => {
    let alive = true
    const tick = async () => {
      const c = await api.getClosedDays().catch(() => ({}) as Record<string, string>)
      if (!alive) return
      setClosed(c)
      setState(todayState(new Date(), c))
    }
    tick()
    const id = setInterval(tick, 60_000)
    return () => {
      alive = false
      clearInterval(id)
    }
  }, [])
  return { state, closed }
}
