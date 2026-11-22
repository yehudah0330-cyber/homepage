import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { BigButton, Page } from '../components/ui'
import { clinic } from '../config/clinic'
import { api } from '../data/api'
import type { Notice } from '../data/types'
import { todayState, type TodayState } from '../lib/schedule'

export default function Home() {
  const [state, setState] = useState<TodayState | null>(null)
  const [notice, setNotice] = useState<Notice | null>(null)

  useEffect(() => {
    let alive = true
    const tick = async () => {
      const closed = await api.getClosedDays()
      if (alive) setState(todayState(new Date(), closed))
    }
    tick()
    api.getNotices().then((n) => alive && setNotice(n[0] ?? null))
    const id = setInterval(tick, 60_000)
    return () => {
      alive = false
      clearInterval(id)
    }
  }, [])

  return (
    <Page>
      {state && (
        <Link to="/hours" className={`today ${state.kind}`} aria-live="polite">
          <span className="dot" aria-hidden="true" />
          {state.text}
        </Link>
      )}
      {notice && <p className="notice"><b>공지</b> {notice.text}</p>}

      <nav className="bigbtns" aria-label="주요 메뉴">
        <BigButton to="/reserve" icon="📅" label="예약하기" sub="날짜 · 시간 · 확인" />
        <BigButton href={`tel:${clinic.phone.replace(/\D/g, '')}`} icon="📞" label="전화하기" sub={clinic.phone} tone="leaf" />
        <BigButton to="/directions" icon="📍" label="오시는 길" sub="지도 · 주차 · 대중교통" tone="sand" />
        <BigButton to="/hours" icon="🕘" label="진료시간" sub="점심시간 · 휴진일" tone="sand" />
        <BigButton to="/care" icon="🌿" label="진료 안내" sub="침 · 추나 · 한약 · 다이어트" tone="leaf" />
      </nav>

      <div className="homelinks">
        <Link to="/doctor">한의사 소개</Link>
        <Link to="/my">내 예약</Link>
        <Link to="/settings">설정</Link>
      </div>
    </Page>
  )
}
