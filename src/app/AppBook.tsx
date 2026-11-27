// 예약: 원하는 진료·날짜·시간을 고른 뒤 카카오톡 채널 채팅이나 전화로 신청합니다. 병원 답을 받아야 확정입니다.
// 관리자 화면이 열리기 전까지는 예약을 서버에 저장하지 않습니다 (직원이 볼 수 없는 예약이 생기지 않도록).
// 서버에 저장하는 예전 예약 화면은 src/pages/Reserve.tsx 에 그대로 있습니다.
import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { clinic } from '../config/clinic'
import { DAY_NAMES, addDays, fromISO, prettyDate, prettyTime, toISO, toMin } from '../lib/date'
import { daySlots } from '../lib/schedule'
import { Icon } from '../site/Icon'
import { useToday } from './useToday'

const tel = `tel:${clinic.phone.replace(/\D/g, '')}`

export default function AppBook() {
  const [params] = useSearchParams()
  const { closed } = useToday()
  const [care, setCare] = useState(clinic.services.find((s) => s.id === params.get('care'))?.id ?? '')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [copied, setCopied] = useState(false)

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
  const message = ready ? `[${clinic.name} 예약 요청]
날짜: ${prettyDate(date)}
시간: ${prettyTime(time)}
진료: ${picked.title}
성함: ` : ''

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(message)
      setCopied(true)
    } catch {
      setCopied(false)
    }
  }

  return (
    <main className="ap-body top">
      <h1>진료 예약</h1>
      <p className="ap-lead">원하는 시간을 고른 뒤 <b>카카오톡이나 전화</b>로 신청해 주세요.</p>

      <h2 className="ap-label">1. 진료 종류</h2>
      <div className="ap-chips">
        {clinic.services.map((s) => (
          <button key={s.id} type="button" aria-pressed={care === s.id} onClick={() => { setCare(s.id); setCopied(false) }}>{s.title}</button>
        ))}
      </div>

      <h2 className="ap-label">2. 날짜</h2>
      <div className="ap-days">
        {days.map((d, i) => {
          const dt = fromISO(d)
          const off = slotsOf(d).length === 0
          return (
            <button key={d} type="button" disabled={off} aria-pressed={date === d} onClick={() => { setDate(d); setTime(''); setCopied(false) }}>
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
            <button key={t} type="button" aria-pressed={time === t} onClick={() => { setTime(t); setCopied(false) }}>{t}</button>
          ))}
        </div>
      )}

      <section className="ap-summary" aria-live="polite">
        {ready ? (
          <>
            <p className="ap-sum-when">{prettyDate(date)}<br />{prettyTime(time)} · {picked.title}</p>
            <p><b>아직 예약이 확정되지 않았습니다.</b> 병원의 답을 받으면 확정됩니다.</p>
            {clinic.kakaoChat && (
              <>
                <a className="ap-btn kakao" href={clinic.kakaoChat} target="_blank" rel="noopener noreferrer" onClick={copy}>카카오톡으로 보내기</a>
                <ol className="ap-how">
                  <li>위 버튼을 누르면 <b>예약 내용이 복사</b>되고 병원 채팅창이 열립니다.</li>
                  <li>입력칸을 <b>길게 눌러 붙여넣기</b>를 하세요.</li>
                  <li><b>성함을 적고 보내기</b>를 누르세요.</li>
                </ol>
                {copied && <p className="ap-copied" role="status">예약 내용을 복사했습니다.</p>}
                <details className="ap-msg"><summary>복사되는 내용 보기</summary><pre>{message}</pre></details>
              </>
            )}
            <a className="ap-btn line" href={tel}><Icon name="phone" />전화로 신청하기 {clinic.phone}</a>
          </>
        ) : (
          <>
            <p>진료 종류, 날짜, 시간을 고르면 여기에 정리됩니다.</p>
            <a className="ap-btn line" href={tel}><Icon name="phone" />바로 전화하기</a>
          </>
        )}
      </section>
    </main>
  )
}
