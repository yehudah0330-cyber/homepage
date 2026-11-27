// 예약 현황: 확인할 신청이 맨 위, 그 아래 날짜별 예약. 1분마다 새로 불러옵니다.
import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { Msg } from '../../components/ui'
import { clinic } from '../../config/clinic'
import { booking } from '../../data/booking'
import type { Reservation } from '../../data/types'
import { normPhone, prettyDate, prettyPhone, prettyTime, todayISO } from '../../lib/date'

const smsText = (r: Reservation) => {
  const when = `${prettyDate(r.date)} ${prettyTime(r.time)}`
  if (r.status === 'confirmed') return `[${clinic.name}] ${r.name}님, ${when} 예약이 확정되었습니다. 변경은 ${clinic.phone}`
  if (r.status === 'cancelled') return `[${clinic.name}] ${r.name}님, ${when} 예약이 어렵게 되어 취소되었습니다. 다른 시간은 ${clinic.phone}`
  return `[${clinic.name}] ${r.name}님, 신청하신 ${when}은 예약이 많아 다른 시간을 안내드립니다. 가능한 시간: `
}

export default function Reservations() {
  const [all, setAll] = useState<Reservation[] | null>(null)
  const [err, setErr] = useState('')
  const [edit, setEdit] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState({ name: '', phone: '', date: todayISO(), time: '10:00', service: '' })

  const load = useCallback(() => booking.list().then((l) => { setAll(l); setErr('') }).catch((e: Error) => setErr(e.message)), [])
  useEffect(() => {
    load()
    const id = setInterval(load, 60_000)
    return () => clearInterval(id)
  }, [load])

  const run = async (job: () => Promise<unknown>) => {
    try {
      await job()
      setEdit('')
      await load()
    } catch (e) {
      setErr((e as Error).message)
    }
  }

  const coming = (all ?? []).filter((r) => r.date >= todayISO()).sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))
  const waiting = coming.filter((r) => r.status === 'pending')
  const confirmed = coming.filter((r) => r.status === 'confirmed')
  const cancelled = coming.filter((r) => r.status === 'cancelled')
  const days = [...new Set(confirmed.map((r) => r.date))]
  const count = (r: Reservation) => coming.filter((x) => x.status !== 'cancelled' && x.date === r.date && x.time === r.time).length

  const card = (r: Reservation) => (
    <article key={r.id} className={`adm-card ${r.status}`}>
      <p className="adm-when">
        {prettyDate(r.date)} <b>{prettyTime(r.time)}</b>
        {r.status !== 'cancelled' && count(r) > clinic.capacityPerSlot && <span className="adm-busy">몰림 {count(r)}명</span>}
      </p>
      <p><b>{r.name}</b>{r.service && <> · {r.service}</>}</p>
      {r.phone && <p><a href={`tel:${r.phone}`}>{prettyPhone(r.phone)}</a></p>}
      <div className="adm-btns">
        {r.status !== 'confirmed' && <button type="button" className="btn primary" onClick={() => run(() => booking.update(r.id, { status: 'confirmed' }))}>확정</button>}
        <button type="button" className="btn ghost" onClick={() => { setEdit(edit === r.id ? '' : r.id); setDate(r.date); setTime(r.time) }}>시간 변경</button>
        {r.status !== 'cancelled' && <button type="button" className="btn ghost" onClick={() => { if (window.confirm(`${r.name}님 예약을 취소할까요?`)) run(() => booking.update(r.id, { status: 'cancelled' })) }}>취소</button>}
        {r.phone && <a className="btn ghost" href={`sms:${r.phone}?body=${encodeURIComponent(smsText(r))}`}>문자 보내기</a>}
      </div>
      {edit === r.id && (
        <div className="adm-edit">
          <input type="date" aria-label="새 날짜" value={date} onChange={(e) => setDate(e.target.value)} />
          <input type="time" aria-label="새 시간" step={1800} value={time} onChange={(e) => setTime(e.target.value)} />
          <button type="button" className="btn primary" onClick={() => run(() => booking.update(r.id, { date, time, status: 'confirmed' }))}>바꾸고 확정</button>
        </div>
      )}
    </article>
  )

  const add = (e: FormEvent) => {
    e.preventDefault()
    run(async () => {
      await booking.add({ ...form, phone: normPhone(form.phone) })
      setForm({ ...form, name: '', phone: '' })
      setAdding(false)
    })
  }

  return (
    <>
      <div className="adm-top">
        <button type="button" className="btn ghost" onClick={load}>새로고침</button>
        <button type="button" className="btn ghost" onClick={() => setAdding(!adding)}>{adding ? '닫기' : '＋ 직접 추가'}</button>
      </div>
      {err && <Msg kind="error">{err}</Msg>}
      {adding && (
        <form className="adm-card" onSubmit={add}>
          <p><b>전화·방문 예약 추가</b></p>
          <input required placeholder="이름" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input inputMode="tel" placeholder="전화번호 (선택)" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <input type="date" required value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          <input type="time" required step={1800} value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} />
          <select value={form.service} onChange={(e) => setForm({ ...form, service: e.target.value })} aria-label="진료 항목">
            <option value="">진료 항목 (선택)</option>
            {clinic.services.map((s) => <option key={s.id}>{s.title}</option>)}
          </select>
          <button type="submit" className="btn primary">추가</button>
        </form>
      )}
      {!all ? <p className="muted">불러오는 중…</p> : (
        <>
          <h2 className="adm-h">확인할 신청 {waiting.length}건</h2>
          {waiting.length === 0 ? <p className="muted">새 신청이 없습니다.</p> : waiting.map(card)}
          <h2 className="adm-h">확정된 예약</h2>
          {days.length === 0 && <p className="muted">확정된 예약이 없습니다.</p>}
          {days.map((d) => (
            <section key={d}>
              <h3 className="adm-day">{d === todayISO() ? '오늘 · ' : ''}{prettyDate(d)} ({confirmed.filter((r) => r.date === d).length}명)</h3>
              {confirmed.filter((r) => r.date === d).map(card)}
            </section>
          ))}
          {cancelled.length > 0 && <details><summary className="adm-h">취소 {cancelled.length}건</summary>{cancelled.map(card)}</details>}
        </>
      )}
    </>
  )
}
