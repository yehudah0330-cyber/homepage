import { useCallback, useEffect, useState } from 'react'
import { Msg } from '../../components/ui'
import { api } from '../../data/api'
import { prettyDate, todayISO } from '../../lib/date'

export default function ClosedDays() {
  const [closed, setClosed] = useState<Record<string, string>>({})
  const [date, setDate] = useState('')
  const [reason, setReason] = useState('')
  const [warn, setWarn] = useState('')
  const load = useCallback(() => api.getClosedDays().then(setClosed), [])
  useEffect(() => { load() }, [load])

  const add = async () => {
    if (!date) return
    const booked = (await api.getReservations()).filter((r) => r.date === date && r.status === 'confirmed').length
    await api.addClosedDay(date, reason.trim())
    setWarn(booked ? `${prettyDate(date)}에 이미 예약 ${booked}건이 있어요. 예약 메뉴에서 변경·취소 안내를 보내 주세요.` : '')
    setDate('')
    setReason('')
    load()
  }
  const rows = Object.entries(closed).sort(([a], [b]) => a.localeCompare(b))
  return (
    <>
      <h2>휴진일 등록</h2>
      <div className="inline">
        <input type="date" value={date} min={todayISO()} onChange={(e) => setDate(e.target.value)} aria-label="휴진 날짜" />
        <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="사유 (예: 학회, 공휴일)" aria-label="사유" />
        <button type="button" className="btn primary" disabled={!date} onClick={add}>등록</button>
      </div>
      {warn && <Msg kind="error">{warn}</Msg>}
      {rows.length === 0 && <Msg kind="info">등록된 휴진일이 없어요.</Msg>}
      {rows.map(([d, why]) => (
        <article key={d} className="card row">
          <div className="rowhead"><b>{prettyDate(d)}</b><span>{why}</span></div>
          <button type="button" className="btn ghost" onClick={async () => { await api.removeClosedDay(d); load() }}>삭제</button>
        </article>
      ))}
    </>
  )
}
