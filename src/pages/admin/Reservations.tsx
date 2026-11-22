import { useCallback, useEffect, useMemo, useState } from 'react'
import { Msg } from '../../components/ui'
import { api } from '../../data/api'
import type { Reservation } from '../../data/types'
import { addDays, fromISO, prettyDate, prettyPhone, prettyTime, toISO, todayISO } from '../../lib/date'
import { daySlots } from '../../lib/schedule'
import { notify } from '../../notify/notifier'

export default function Reservations() {
  const [all, setAll] = useState<Reservation[]>([])
  const [date, setDate] = useState(todayISO())
  const [edit, setEdit] = useState<string>('')
  const [newDate, setNewDate] = useState('')
  const [newTime, setNewTime] = useState('')
  const [careId, setCareId] = useState('')
  const [careLabel, setCareLabel] = useState('한약 복용')
  const [careDays, setCareDays] = useState('15')
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')

  const load = useCallback(() => api.getReservations().then(setAll), [])
  useEffect(() => { load() }, [load])

  const rows = useMemo(
    () => all.filter((r) => r.date === date).sort((a, b) => a.time.localeCompare(b.time)),
    [all, date]
  )
  const confirmedCount = rows.filter((r) => r.status === 'confirmed').length
  const shift = (n: number) => setDate(toISO(addDays(fromISO(date), n)))

  const cancel = async (r: Reservation) => {
    const c = await api.cancelReservation(r.id)
    await notify('cancel', c)
    setMsg(`${r.name}님 예약을 취소하고 안내를 보냈어요.`)
    load()
  }
  const change = async (r: Reservation) => {
    setErr('')
    try {
      const c = await api.changeReservation(r.id, newDate, newTime)
      await notify('change', c)
      setMsg(`${r.name}님 예약을 변경하고 안내를 보냈어요.`)
      setEdit('')
      load()
    } catch (e) {
      setErr((e as Error).message)
    }
  }
  const saveCare = async (r: Reservation) => {
    const days = Math.max(1, Number(careDays) || 0)
    await api.setNextCare(r.id, { label: careLabel.trim() || '복용', endDate: toISO(addDays(fromISO(r.date), days)) })
    setCareId('')
    setMsg('다음 진료 안내를 저장했어요.')
    load()
  }

  return (
    <>
      <div className="datebar">
        <button type="button" className="btn ghost" onClick={() => shift(-1)}>← 전날</button>
        <input type="date" value={date} onChange={(e) => e.target.value && setDate(e.target.value)} aria-label="날짜" />
        <button type="button" className="btn ghost" onClick={() => shift(1)}>다음날 →</button>
        <button type="button" className="btn ghost" onClick={() => setDate(todayISO())}>오늘</button>
      </div>
      <h2>{prettyDate(date)} · 예약 {confirmedCount}명</h2>
      {msg && <Msg kind="ok">{msg}</Msg>}
      {err && <Msg kind="error">{err}</Msg>}
      {rows.length === 0 && <Msg kind="info">이 날은 예약이 없어요.</Msg>}
      {rows.map((r) => (
        <article key={r.id} className={`card row ${r.status}`}>
          <div className="rowhead">
            <b className="big">{prettyTime(r.time)}</b>
            <span>{r.name} · <a href={`tel:${r.phone}`}>{prettyPhone(r.phone)}</a></span>
            <span className={`tag ${r.status}`}>{r.status === 'confirmed' ? '확정' : '취소됨'}</span>
          </div>
          {r.nextCare && <p className="muted">{r.nextCare.label} · {prettyDate(r.nextCare.endDate)}까지</p>}
          {r.status === 'confirmed' && (
            <div className="rowbtns">
              <button type="button" className="btn ghost" onClick={() => { setEdit(edit === r.id ? '' : r.id); setNewDate(r.date); setNewTime(r.time) }}>시간 변경</button>
              <button type="button" className="btn ghost" onClick={() => setCareId(careId === r.id ? '' : r.id)}>다음 진료 안내</button>
              <button type="button" className="btn danger" onClick={() => cancel(r)}>예약 취소</button>
            </div>
          )}
          {edit === r.id && (
            <div className="inline">
              <input type="date" value={newDate} min={todayISO()} onChange={(e) => { setNewDate(e.target.value); setNewTime('') }} />
              <select value={newTime} onChange={(e) => setNewTime(e.target.value)}>
                <option value="">시간 선택</option>
                {newDate && daySlots(newDate).map((t) => <option key={t} value={t}>{prettyTime(t)}</option>)}
              </select>
              <button type="button" className="btn primary" disabled={!newDate || !newTime} onClick={() => change(r)}>변경하고 안내 보내기</button>
            </div>
          )}
          {careId === r.id && (
            <div className="inline">
              <input value={careLabel} onChange={(e) => setCareLabel(e.target.value)} aria-label="안내 내용" />
              <input value={careDays} onChange={(e) => setCareDays(e.target.value)} inputMode="numeric" aria-label="며칠분" style={{ maxWidth: '6rem' }} /> 일분
              <button type="button" className="btn primary" onClick={() => saveCare(r)}>저장</button>
            </div>
          )}
        </article>
      ))}
    </>
  )
}
