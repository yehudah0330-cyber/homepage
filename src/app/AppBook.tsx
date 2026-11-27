// 예약
// - 온라인 예약이 열려 있으면: 이름·전화번호를 넣고 "예약 신청" → 병원이 확인해 확정합니다.
// - 닫혀 있으면: 카카오톡 채팅이나 전화로 신청합니다. (로그인한 직원에게는 시험용 신청 화면이 보입니다)
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { PrivacyText } from '../components/ui'
import { clinic } from '../config/clinic'
import { booking } from '../data/booking'
import type { Reservation } from '../data/types'
import { DAY_NAMES, addDays, fromISO, normPhone, prettyDate, prettyPhone, prettyTime, toISO, toMin, todayISO, validPhone } from '../lib/date'
import { getMe, setMe } from '../lib/prefs'
import { daySlots } from '../lib/schedule'
import { Icon } from '../site/Icon'
import { useToday } from './useToday'

const tel = `tel:${clinic.phone.replace(/\D/g, '')}`
const STATUS = { pending: '확인 중', confirmed: '확정', cancelled: '취소' } as const

export default function AppBook() {
  const [params] = useSearchParams()
  const { closed } = useToday()
  const [mode, setMode] = useState({ open: false, preview: false })
  const [care, setCare] = useState(clinic.services.find((s) => s.id === params.get('care'))?.id ?? '')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [copied, setCopied] = useState(false)
  const [name, setName] = useState(getMe().name)
  const [phone, setPhone] = useState(getMe().phone)
  const [agree, setAgree] = useState(false)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [done, setDone] = useState<Reservation | null>(null)
  const [mine, setMine] = useState<Reservation[]>([])
  const [avail, setAvail] = useState<Record<string, number>>({})
  const online = mode.open || mode.preview

  useEffect(() => { booking.status().then(setMode).catch(() => undefined) }, [])
  useEffect(() => {
    setAvail({})
    if (date && online) booking.availability(date).then(setAvail).catch(() => undefined)
  }, [date, online])

  const loadMine = useCallback(() => {
    const me = getMe()
    if (!me.name || !me.phone) return
    booking.mine(me.name, me.phone).then((l) => setMine(l.filter((r) => r.date >= todayISO()))).catch(() => undefined)
  }, [])
  useEffect(() => { if (online) loadMine() }, [online, loadMine])

  const slotsOf = (iso: string) => {
    if (closed[iso] !== undefined) return []
    const now = new Date()
    const min = iso === toISO(now) ? now.getHours() * 60 + now.getMinutes() + 10 : -1
    return daySlots(iso).filter((t) => toMin(t) > min)
  }
  const days = useMemo(() => Array.from({ length: clinic.bookingDays }, (_, i) => toISO(addDays(new Date(), i))), [])
  const slots = date ? slotsOf(date) : []
  const picked = clinic.services.find((s) => s.id === care)
  const ready = picked && date && time && slots.includes(time)
  const message = ready ? `[${clinic.name} 예약 요청]\n날짜: ${prettyDate(date)}\n시간: ${prettyTime(time)}\n진료: ${picked.title}\n성함: ` : ''
  const reset = () => { setCopied(false); setErr(''); setDone(null) }
  // 신청한 뒤 카톡 채널에 보내는 글: 병원에 알림이 가고, 그 대화방으로 답을 받습니다.
  const request = done ? `[예약 신청]
이름: ${done.name}
일시: ${prettyDate(done.date)} ${prettyTime(done.time)}
확정 안내 부탁드립니다.` : ''

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
    } catch {
      setCopied(false)
    }
  }

  const submit = async () => {
    if (!ready) return
    if (!name.trim()) return setErr('이름을 입력해 주세요.')
    if (!validPhone(phone)) return setErr('휴대전화 번호를 확인해 주세요. (예: 010-1234-5678)')
    if (!agree) return setErr('개인정보 수집에 동의해 주세요.')
    setBusy(true)
    setErr('')
    try {
      const r = await booking.request({ name: name.trim(), phone: normPhone(phone), date, time, service: picked.title })
      setMe({ name: name.trim(), phone: normPhone(phone) })
      setCopied(false)
      setDone(r)
      setTime('')
      loadMine()
    } catch (e) {
      setErr((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  const cancel = async (r: Reservation) => {
    if (!window.confirm(`${prettyDate(r.date)} ${prettyTime(r.time)} 예약을 취소할까요?`)) return
    try {
      await booking.cancel(r.id)
      loadMine()
    } catch (e) {
      setErr((e as Error).message)
    }
  }

  return (
    <main className="ap-body top">
      <h1>진료 예약</h1>
      {mode.preview && <p className="ap-notice"><b>시험 모드</b> 로그인한 직원에게만 보이는 신청 화면입니다. 환자에게는 아직 열리지 않았습니다.</p>}
      <p className="ap-lead">{online ? <>원하는 시간을 고르고 <b>예약 신청</b>을 눌러 주세요.</> : <>원하는 시간을 고른 뒤 <b>카카오톡이나 전화</b>로 신청해 주세요.</>}</p>

      <h2 className="ap-label">1. 진료 종류</h2>
      <div className="ap-chips">
        {clinic.services.map((s) => (
          <button key={s.id} type="button" aria-pressed={care === s.id} onClick={() => { setCare(s.id); reset() }}>{s.title}</button>
        ))}
      </div>

      <h2 className="ap-label">2. 날짜</h2>
      <div className="ap-days">
        {days.map((d, i) => {
          const dt = fromISO(d)
          const off = slotsOf(d).length === 0
          return (
            <button key={d} type="button" disabled={off} aria-pressed={date === d} onClick={() => { setDate(d); setTime(''); reset() }}>
              <small>{i === 0 ? '오늘' : DAY_NAMES[dt.getDay()]}</small>
              <b>{dt.getDate()}</b>
              <small>{off ? '마감' : `${dt.getMonth() + 1}월`}</small>
            </button>
          )
        })}
      </div>

      <h2 className="ap-label">3. 시간</h2>
      {!date ? <p className="ap-hint">날짜를 먼저 골라 주세요.</p> : (
        <div className="ap-slots">
          {slots.map((t) => (
            <button key={t} type="button" aria-pressed={time === t} onClick={() => { setTime(t); reset() }}>
              {t}{avail[t] === 0 && <small>붐빔</small>}
            </button>
          ))}
        </div>
      )}

      <section className="ap-summary" aria-live="polite">
        {done && (
          <div className="ap-done" role="status">
            <p className="ap-sum-when">예약 신청이 접수되었습니다</p>
            <p>{prettyDate(done.date)} {prettyTime(done.time)}</p>
            <p><b>병원에서 확인한 뒤 확정</b>됩니다. 아래 "내 예약"에서 확인하실 수 있고, 시간을 조정해야 하면 연락드립니다.</p>
            {clinic.kakaoChat && (
              <>
                <a className="ap-btn kakao" href={clinic.kakaoChat} target="_blank" rel="noopener noreferrer" onClick={() => copy(request)}>카톡으로 확정 안내 받기</a>
                <ol className="ap-how">
                  <li>위 버튼을 누르면 <b>신청 내용이 복사</b>되고 병원 채팅창이 열립니다.</li>
                  <li>입력칸을 <b>길게 눌러 붙여넣기</b>(PC는 Ctrl+V)를 하세요.</li>
                  <li><b>보내기</b>를 누르면 그 대화방으로 답을 드립니다.</li>
                </ol>
                {copied && <p className="ap-copied" role="status">신청 내용을 복사했습니다.</p>}
                <details className="ap-msg"><summary>복사되는 내용 보기</summary><pre>{request}</pre></details>
              </>
            )}
          </div>
        )}
        {ready ? (
          <>
            <p className="ap-sum-when">{prettyDate(date)}<br />{prettyTime(time)} · {picked.title}</p>
            {online ? (
              <>
                {avail[time] === 0 && <p>예약이 많은 시간입니다. 병원에서 다른 시간을 안내드릴 수 있습니다.</p>}
                <label className="ap-field">이름<input autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} /></label>
                <label className="ap-field">휴대전화<input inputMode="tel" autoComplete="tel" placeholder="010-0000-0000" value={phone} onChange={(e) => setPhone(e.target.value)} /></label>
                <label className="ap-agree"><input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} /> 개인정보 수집·이용에 동의합니다 (필수)</label>
                <details className="ap-msg"><summary>수집·이용 내용 보기</summary><PrivacyText /></details>
                {err && <p className="ap-err" role="alert">{err}</p>}
                <button type="button" className="ap-btn gold ap-go" disabled={busy} onClick={submit}>{busy ? '보내는 중…' : '예약 신청'}</button>
              </>
            ) : (
              <>
                <p><b>아직 예약이 확정되지 않았습니다.</b> 병원의 답을 받으면 확정됩니다.</p>
                {clinic.kakaoChat && (
                  <>
                    <a className="ap-btn kakao" href={clinic.kakaoChat} target="_blank" rel="noopener noreferrer" onClick={() => copy(message)}>카카오톡으로 보내기</a>
                    <ol className="ap-how">
                      <li>위 버튼을 누르면 <b>예약 내용이 복사</b>되고 병원 채팅창이 열립니다.</li>
                      <li>입력칸을 <b>길게 눌러 붙여넣기</b>를 하세요.</li>
                      <li><b>성함을 적고 보내기</b>를 누르세요.</li>
                    </ol>
                    {copied && <p className="ap-copied" role="status">예약 내용을 복사했습니다.</p>}
                    <details className="ap-msg"><summary>복사되는 내용 보기</summary><pre>{message}</pre></details>
                  </>
                )}
              </>
            )}
          </>
        ) : (
          !done && (
            <>
              <p>진료 종류, 날짜, 시간을 고르면 <b>{online ? '신청 칸이 여기에 나타납니다' : '예약 내용이 여기에 정리됩니다'}</b>.</p>
              {!online && clinic.kakaoChat && <a className="ap-btn kakao" href={clinic.kakaoChat} target="_blank" rel="noopener noreferrer">카카오톡으로 문의하기</a>}
            </>
          )
        )}
        <a className="ap-btn line" href={tel}><Icon name="phone" />전화하기 {clinic.phone}</a>
        {online && clinic.kakaoChat && <a className="ap-ask" href={clinic.kakaoChat} target="_blank" rel="noopener noreferrer">궁금한 점은 카카오톡으로 문의</a>}
      </section>

      {online && mine.length > 0 && (
        <section className="ap-card">
          <h2>내 예약</h2>
          {mine.map((r) => (
            <div key={r.id} className={`ap-mine ${r.status}`}>
              <p><b>{prettyDate(r.date)} {prettyTime(r.time)}</b> <span>{STATUS[r.status]}</span></p>
              <p>{r.name}님 · {prettyPhone(r.phone)}{r.service ? ` · ${r.service}` : ''}</p>
              {r.status !== 'cancelled' && <button type="button" onClick={() => cancel(r)}>예약 취소</button>}
            </div>
          ))}
        </section>
      )}
      <p className="ap-foot"><Link to="/privacy">개인정보 처리 안내</Link></p>
    </main>
  )
}
