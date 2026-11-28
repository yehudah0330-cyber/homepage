// 예약 현황: 확인할 신청이 맨 위, 그 아래 달력(기본) 또는 목록. 1분마다 새로 불러옵니다.
import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react'
import { Msg } from '../../components/ui'
import { clinic } from '../../config/clinic'
import { booking } from '../../data/booking'
import type { Reservation } from '../../data/types'
import { DAY_NAMES, fromISO, normPhone, prettyDate, prettyPhone, prettyTime, toISO, todayISO } from '../../lib/date'
import { daySlots } from '../../lib/schedule'

// 환자에게 보내는 안내 문구 (카톡 붙여넣기와 문자에 같이 씁니다)
const KIND = { confirmed: '예약 확정', pending: '시간 조정 안내', cancelled: '예약 취소' } as const
const notice = (r: Reservation) => {
  const when = `${prettyDate(r.date)} ${prettyTime(r.time)}`
  const lines = {
    confirmed: [`${r.name}님, 예약이 확정되었습니다.`, '', `■ 일시: ${when}`, '■ 위치: 망포프라자 2층 (태장사거리)', `■ 변경·취소: ${clinic.phone}`, '', '감사합니다.'],
    pending: [`${r.name}님, 신청하신 ${when}은`, '예약이 많아 다른 시간을 안내드립니다.', '', '■ 가능한 시간: ', '', '편하신 시간을 답장해 주세요.', `문의: ${clinic.phone}`],
    cancelled: [`${r.name}님, ${when} 예약이 취소되었습니다.`, '', `다시 예약하시려면 ${clinic.phone}로 연락 주세요.`, '감사합니다.']
  }[r.status]
  return [`[${clinic.name}]`, ...lines].join('\n')
}

// 넓은 PC 화면에서는 왼쪽 달력, 오른쪽 예약 내용. 화면 크기가 바뀌면 다시 맞춥니다.
function useViewport() {
  const read = () => ({ wide: window.matchMedia('(min-width: 1100px)').matches, height: window.innerHeight })
  const [size, setSize] = useState(read)
  useEffect(() => {
    const on = () => setSize(read())
    window.addEventListener('resize', on)
    return () => window.removeEventListener('resize', on)
  }, [])
  return size
}
// 달력 한 칸에 글자가 잘리지 않고 들어가는 줄 수
function nameLines(height: number, weeks: number) {
  const rem = parseFloat(getComputedStyle(document.documentElement).fontSize)
  const calendar = Math.min(Math.max(height - 8 * rem, Math.min(23 * rem, 380)), 52 * rem)
  const cell = (calendar - 4.4 * rem) / weeks - 3
  // 글자 크기는 화면이 낮으면 함께 작아집니다 (theme.css 와 같은 기준)
  const line = Math.min(0.8 * rem, 0.024 * height) * 1.25 + 0.5
  return Math.max(1, Math.floor((cell - Math.min(rem, 0.024 * height) * 1.5 - 6) / line))
}
const byTime = (a: Reservation, b: Reservation) => (a.date + a.time).localeCompare(b.date + b.time)

export default function Reservations() {
  const { wide, height } = useViewport()
  const [all, setAll] = useState<Reservation[] | null>(null)
  const [closed, setClosed] = useState<Record<string, string>>({})
  const [err, setErr] = useState('')
  const [view, setView] = useState<'cal' | 'list'>('cal')
  const [day, setDay] = useState(todayISO())
  const [month, setMonth] = useState(todayISO().slice(0, 7))
  const [picked, setPicked] = useState('')
  const [edit, setEdit] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState({ name: '', phone: '', date: todayISO(), time: '10:00', service: '' })
  const [copied, setCopied] = useState<{ id: string; ok: boolean } | null>(null)
  const dayRef = useRef<HTMLElement>(null)
  const formRef = useRef<HTMLFormElement>(null)

  const load = useCallback(
    () => Promise.all([booking.list(), booking.closedDays()]).then(([l, c]) => { setAll(l); setClosed(c); setErr('') }).catch((e: Error) => setErr(e.message)),
    []
  )
  useEffect(() => {
    load()
    const id = setInterval(load, 60_000)
    // 다른 창을 보다가 돌아오면 바로 새로 불러옵니다
    const back = () => { if (!document.hidden) load() }
    document.addEventListener('visibilitychange', back)
    window.addEventListener('focus', back)
    return () => {
      clearInterval(id)
      document.removeEventListener('visibilitychange', back)
      window.removeEventListener('focus', back)
    }
  }, [load])
  useEffect(() => { if (adding) formRef.current?.scrollIntoView({ block: 'nearest' }) }, [adding, form.date, form.time])

  const run = async (job: () => Promise<unknown>) => {
    try {
      await job()
      setEdit('')
      await load()
    } catch (e) {
      setErr((e as Error).message)
    }
  }

  const copy = async (r: Reservation) => {
    const ok = await navigator.clipboard.writeText(notice(r)).then(() => true, () => false)
    setCopied({ id: r.id + r.status, ok })
  }

  const list = [...(all ?? [])].sort(byTime)
  const coming = list.filter((r) => r.date >= todayISO())
  const waiting = coming.filter((r) => r.status === 'pending')
  const confirmed = coming.filter((r) => r.status === 'confirmed')
  const cancelled = coming.filter((r) => r.status === 'cancelled')
  const live = (d: string) => list.filter((r) => r.date === d && r.status !== 'cancelled')
  const count = (r: Reservation) => live(r.date).filter((x) => x.time === r.time).length
  const offReason = (d: string) => closed[d] ?? clinic.closedHolidays[d] ?? (clinic.hours[fromISO(d).getDay()] ? undefined : '휴진')

  const card = (r: Reservation) => (
    <article key={r.id} className={`adm-card ${r.status}`}>
      <p className="adm-when">
        {prettyDate(r.date)} <b>{prettyTime(r.time)}</b>
        {r.status !== 'cancelled' && count(r) > clinic.capacityPerSlot && <span className="adm-busy">몰림 {count(r)}명</span>}
      </p>
      <p><b>{r.name}</b>{r.service && <> · {r.service}</>} <small>{r.status === 'pending' ? '확인 전' : r.status === 'confirmed' ? '확정' : '취소'}</small></p>
      {r.phone && <p><a href={`tel:${r.phone}`}>{prettyPhone(r.phone)}</a></p>}
      <div className="adm-btns">
        {r.status !== 'confirmed' && <button type="button" className="btn primary" onClick={() => run(() => booking.update(r.id, { status: 'confirmed' }))}>확정</button>}
        <button type="button" className="btn ghost" onClick={() => { setEdit(edit === r.id ? '' : r.id); setDate(r.date); setTime(r.time) }}>시간 변경</button>
        {r.status !== 'cancelled' && <button type="button" className="btn ghost" onClick={() => { if (window.confirm(`${r.name}님 예약을 취소할까요?`)) run(() => booking.update(r.id, { status: 'cancelled' })) }}>취소</button>}
        {/* PC: 한 번에 복사하고 채팅 목록 열기 */}
        <a className="btn kakao adm-onego" href={clinic.kakaoManager} target="_blank" rel="noopener noreferrer" onClick={() => copy(r)}>복사하고 채팅 열기</a>
        <button type="button" className="btn kakao adm-copy" onClick={() => copy(r)}><span className="adm-copy-pc">문구만 복사</span><span className="adm-copy-phone">카톡 문구 복사</span></button>
        {r.phone && <a className="btn ghost adm-sms" href={`sms:${r.phone}?body=${encodeURIComponent(notice(r))}`}>문자 보내기</a>}
      </div>
      {copied?.id === r.id + r.status && (
        <div className="adm-copied" role="status">
          {copied.ok
            ? (
              <>
                <p><b>"{KIND[r.status]}" 문구를 복사했습니다.</b> <b>한의원 채널 관리자</b>의 {r.name}님 대화방에 붙여넣어(PC는 Ctrl+V) 보내세요.</p>
                <a className="btn primary adm-chat-pc" href={clinic.kakaoManager} target="_blank" rel="noopener noreferrer">채널 관리자 채팅 열기</a>
                <p className="adm-chat-phone">휴대폰은 <b>카카오비즈니스</b> 앱 → 채팅에서 여세요.</p>
              </>
            )
            : <><p>자동 복사가 안 됐습니다. 아래 글을 직접 복사해 주세요.</p><textarea readOnly rows={8} value={notice(r)} onFocus={(e) => e.target.select()} /></>}
        </div>
      )}
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
  const addAt = (d: string, t: string) => {
    setForm({ ...form, date: d, time: t })
    setAdding(true)
  }

  // ── 달력 ──
  const first = fromISO(`${month}-01`)
  const length = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate()
  const cells: (string | null)[] = [
    ...Array<null>(first.getDay()).fill(null),
    ...Array.from({ length }, (_, i) => `${month}-${String(i + 1).padStart(2, '0')}`)
  ]
  const move = (n: number) => setMonth(toISO(new Date(first.getFullYear(), first.getMonth() + n, 1)).slice(0, 7))
  const choose = (d: string) => {
    setDay(d)
    setPicked('')
    setEdit('')
    requestAnimationFrame(() => dayRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }))
  }
  const dayLive = live(day)
  const times = [...new Set([...(offReason(day) === undefined ? daySlots(day) : []), ...dayLive.map((r) => r.time)])].sort()
  const chosen = dayLive.find((r) => r.id === picked)

  const addForm = adding && (
        <form className="adm-card" onSubmit={add} ref={formRef}>
          <p><b>전화·방문 예약 추가</b></p>
          <input required placeholder="이름" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input inputMode="tel" placeholder="전화번호 (선택)" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <input type="date" required aria-label="날짜" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          <input type="time" required aria-label="시간" step={1800} value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} />
          <fieldset className="adm-services">
            <legend>진료 항목 (선택, 여러 개 가능)</legend>
            {clinic.services.map((s) => {
              const on = form.service.split(', ').includes(s.title)
              const toggle = () => setForm({ ...form, service: clinic.services.filter((x) => (x.id === s.id ? !on : form.service.split(', ').includes(x.title))).map((x) => x.title).join(', ') })
              return <label key={s.id}><input type="checkbox" checked={on} onChange={toggle} />{s.title}</label>
            })}
          </fieldset>
          <button type="submit" className="btn primary">추가</button>
        </form>
      )
  // 신청이 있는 달로 옮겨 가서 그 예약을 펼칩니다
  const jump = (r: Reservation) => {
    setView('cal')
    setMonth(r.date.slice(0, 7))
    setDay(r.date)
    setPicked(r.id)
    setEdit('')
    setTimeout(() => document.querySelector('.slot-card')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 50)
  }
  const waitingTitle = <h2 className="adm-h">확인할 신청 {waiting.length}건</h2>
  const noWaiting = <p className="muted">새 신청이 없습니다.</p>
  const waitingList = (
    <>
      {waitingTitle}
      {waiting.length === 0 ? noWaiting : waiting.map((r) => (
        <div key={r.id}>
          {card(r)}
          <button type="button" className="linkbtn adm-jump" onClick={() => jump(r)}>달력에서 보기</button>
        </div>
      ))}
    </>
  )
  // PC 오른쪽 칸 맨 위: 한 줄씩 짧게
  const waitingRows = (
    <div className={`side-wait${waiting.length ? ' has' : ''}`}>
      {waitingTitle}
      {waiting.length === 0 ? noWaiting : (
        <ul>
          {waiting.map((r) => (
            <li key={r.id}>
              <button type="button" className="wait-go" onClick={() => jump(r)}><span>{prettyDate(r.date)} {prettyTime(r.time)}</span><b>{r.name}</b></button>
              <button type="button" className="btn primary" aria-label={`${r.name}님 예약 확정`} onClick={() => run(() => booking.update(r.id, { status: 'confirmed' }))}>확정</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
  const toggle = (
    <div className="adm-view" role="group" aria-label="보기 방식">
      <button type="button" aria-pressed={view === 'cal'} onClick={() => setView('cal')}>달력</button>
      <button type="button" aria-pressed={view === 'list'} onClick={() => setView('list')}>목록</button>
    </div>
  )
  const lines = wide ? nameLines(height, Math.ceil(cells.length / 7)) : 4
  const calendar = (
    <div className="cal-main">
    <div className="cal-head">
      <button type="button" aria-label="이전 달" onClick={() => move(-1)}>‹</button>
      <h2>{first.getFullYear()}년 {first.getMonth() + 1}월</h2>
      <button type="button" aria-label="다음 달" onClick={() => move(1)}>›</button>
      <button type="button" className="cal-today" onClick={() => { setMonth(todayISO().slice(0, 7)); choose(todayISO()) }}>오늘</button>
    </div>
    <div className="cal">
      {DAY_NAMES.map((n) => <span key={n} className="cal-dow">{n}</span>)}
      {cells.map((d, i) => {
        if (!d) return <span key={`e${i}`} />
        const rows = live(d)
        const ok = rows.filter((r) => r.status === 'confirmed').length
        const wait = rows.length - ok
        const off = offReason(d)
          // 다 못 들어가면 마지막 줄은 "외 ○명"
          const shown = rows.length <= lines ? rows.length : lines - 1
        return (
          <button key={d} type="button" className={`cal-day${d === day ? ' sel' : ''}${d === todayISO() ? ' today' : ''}${off !== undefined ? ' off' : ''}`}
            aria-pressed={d === day} aria-label={`${prettyDate(d)}, 확정 ${ok}명, 확인 전 ${wait}명${off !== undefined ? ', 휴진' : ''}`} onClick={() => choose(d)}>
            <b>{Number(d.slice(8))}</b>
            {ok > 0 && <em className="ok">{ok}<i>명</i></em>}
            {wait > 0 && <em className="wait">{wait}<i>대기</i></em>}
            {off !== undefined && rows.length === 0 && <small>휴</small>}
            <span className="cal-names" aria-hidden="true">{rows.slice(0, shown).map((r) => <span key={r.id} className={r.status}>{r.time} {r.name}</span>)}{rows.length > shown && <span>{shown > 0 ? `외 ${rows.length - shown}명` : `${rows.length}명`}</span>}</span>
          </button>
        )
      })}
    </div>
    <p className="cal-help">날짜를 누르면 아래에 시간별 예약이 나옵니다. <span className="key ok">확정</span> <span className="key wait">확인 전</span></p>

    </div>
  )
  const detail = (
    <section className="cal-detail" ref={dayRef} aria-live="polite">
      <h2 className="adm-h">{prettyDate(day)}{day === todayISO() ? ' · 오늘' : ''} — {dayLive.length}명</h2>
      {offReason(day) !== undefined && <p className="muted">쉬는 날입니다{offReason(day) && offReason(day) !== '휴진' ? ` (${offReason(day)})` : ''}.</p>}
      <ul className="slots">
        {times.map((t) => {
          const rows = dayLive.filter((r) => r.time === t)
          return (
            <li key={t} className={rows.length > clinic.capacityPerSlot ? 'busy' : ''}>
              <span className="slot-time">{t}</span>
              <span className="slot-names">
                {rows.map((r) => <button key={r.id} type="button" className={`chip ${r.status}`} aria-pressed={picked === r.id} onClick={() => { setPicked(picked === r.id ? '' : r.id); setEdit('') }}>{r.name}</button>)}
              </span>
              {day >= todayISO() && <button type="button" className="slot-add" aria-label={`${t}에 예약 추가`} onClick={() => addAt(day, t)}>＋</button>}
              {chosen && chosen.time === t && <div className="slot-card">{card(chosen)}</div>}
            </li>
          )
        })}
      </ul>
    </section>
  )
  const side = wide && view === 'cal'

  return (
    <div className={wide ? 'res res-wide' : 'res'}>
      <div className="adm-top">
        {wide && toggle}
        <button type="button" className="btn ghost" onClick={load}>새로고침</button>
        <button type="button" className="btn ghost" onClick={() => { if (!adding) setForm({ ...form, date: day }); setAdding(!adding) }}>{adding ? '닫기' : '＋ 직접 추가'}</button>
      </div>
      {err && <Msg kind="error">{err}</Msg>}
      {!side && addForm}
      {!all ? <p className="muted">불러오는 중…</p> : side ? (
        <div className="cal-wrap">
          {calendar}
          <div className="cal-side">
            {waitingRows}
            <div className="side-scroll">
              {addForm}
              {detail}
            </div>
          </div>
        </div>
      ) : (
        <>
          {waitingList}
          {!wide && toggle}
          {view === 'cal' ? (
            <>
              {calendar}
              {detail}
            </>
          ) : (
            <>
              <h2 className="adm-h">확정된 예약</h2>
              {confirmed.length === 0 && <p className="muted">확정된 예약이 없습니다.</p>}
              {[...new Set(confirmed.map((r) => r.date))].map((d) => (
                <section key={d}>
                  <h3 className="adm-day">{d === todayISO() ? '오늘 · ' : ''}{prettyDate(d)} ({confirmed.filter((r) => r.date === d).length}명)</h3>
                  {confirmed.filter((r) => r.date === d).map(card)}
                </section>
              ))}
              {cancelled.length > 0 && <details><summary className="adm-h">취소 {cancelled.length}건</summary>{cancelled.map(card)}</details>}
            </>
          )}
        </>
      )}
    </div>
  )
}
