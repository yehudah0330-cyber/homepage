import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Msg, Page, PrivacyText, Stepper } from '../components/ui'
import { clinic } from '../config/clinic'
import { api } from '../data/api'
import type { Reservation } from '../data/types'
import { DAY_NAMES, addDays, fromISO, normPhone, prettyDate, prettyPhone, prettyTime, toISO, validPhone } from '../lib/date'
import { kakaoEnabled, kakaoLoginName } from '../lib/kakao'
import { getMe, setMe } from '../lib/prefs'
import { daySlots } from '../lib/schedule'
import { notify } from '../notify/notifier'

export default function Reserve() {
  const [params] = useSearchParams()
  const changeId = params.get('change')
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [closed, setClosed] = useState<Record<string, string>>({})
  const [avail, setAvail] = useState<Record<string, number> | null>(null)
  const [name, setName] = useState(getMe().name)
  const [phone, setPhone] = useState(getMe().phone)
  const [agree, setAgree] = useState(false)
  const [showPrivacy, setShowPrivacy] = useState(false)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [done, setDone] = useState<{ r: Reservation; text: string } | null>(null)
  const [target, setTarget] = useState<Reservation | null>(null)

  useEffect(() => {
    api.getClosedDays().then(setClosed)
  }, [])
  // 변경 모드: 기존 예약 불러오기
  useEffect(() => {
    if (!changeId) return
    api.getReservations().then((all) => {
      const r = all.find((x) => x.id === changeId)
      if (r) setTarget(r)
    })
  }, [changeId])

  const days = useMemo(() => {
    const now = new Date()
    return Array.from({ length: clinic.bookingDays }, (_, i) => toISO(addDays(now, i)))
  }, [])

  const pickDate = async (d: string) => {
    setDate(d)
    setTime('')
    setErr('')
    setAvail(null)
    setStep(2)
    setAvail(await api.getAvailability(d))
  }
  const pickTime = (t: string) => {
    setTime(t)
    setErr('')
    setStep(3)
  }

  const slots = useMemo(() => {
    if (!date) return []
    const now = new Date()
    const isToday = date === toISO(now)
    const nowMin = now.getHours() * 60 + now.getMinutes()
    return daySlots(date).filter((t) => {
      if (!isToday) return true
      const [h, m] = t.split(':').map(Number)
      return h * 60 + m > nowMin + 10
    })
  }, [date])

  const kakao = async () => {
    setErr('')
    try {
      const n = await kakaoLoginName()
      if (n) setName(n)
    } catch (e) {
      setErr((e as Error).message)
    }
  }

  const submit = async () => {
    setErr('')
    if (!changeId) {
      if (!name.trim()) return setErr('이름을 입력해 주세요.')
      if (!validPhone(phone)) return setErr('휴대전화 번호를 확인해 주세요. (예: 010-1234-5678)')
      if (!agree) return setErr('개인정보 수집에 동의해 주세요.')
    }
    setBusy(true)
    try {
      let r: Reservation
      if (changeId) {
        r = await api.changeReservation(changeId, date, time)
        setDone({ r, text: await notify('change', r) })
      } else {
        r = await api.createReservation({ name: name.trim(), phone: normPhone(phone), date, time })
        setMe({ name: name.trim(), phone: normPhone(phone) })
        setDone({ r, text: await notify('confirm', r) })
      }
    } catch (e) {
      setErr((e as Error).message)
      if (/예약하셨/.test((e as Error).message)) {
        setStep(2)
        setAvail(await api.getAvailability(date))
      }
    } finally {
      setBusy(false)
    }
  }

  if (done) {
    return (
      <Page title={changeId ? '예약이 변경되었어요' : '예약이 완료되었어요'}>
        <div className="card done">
          <p className="big">{prettyDate(done.r.date)}</p>
          <p className="big">{prettyTime(done.r.time)}</p>
          <p>{done.r.name}님 · {prettyPhone(done.r.phone)}</p>
        </div>
        <Msg kind="ok">문자·카카오 알림으로 안내가 갑니다. (지금은 미리보기입니다)</Msg>
        <pre className="preview" aria-label="알림 미리보기">{done.text}</pre>
        <Link className="btn primary" to="/app">처음으로</Link>
        <Link className="btn ghost" to="/my">내 예약 보기</Link>
      </Page>
    )
  }

  return (
    <Page title={changeId ? '예약 변경' : '예약하기'}>
      <Stepper step={step} />
      {changeId && target && <Msg kind="info">현재 예약: {prettyDate(target.date)} {prettyTime(target.time)}</Msg>}

      {step === 1 && (
        <section aria-label="날짜 고르기">
          <p className="lead">언제 오시겠어요?</p>
          <div className="daygrid">
            {days.map((d) => {
              const dt = fromISO(d)
              const off = closed[d] !== undefined || !clinic.hours[dt.getDay()]
              const isToday = d === toISO(new Date())
              return (
                <button key={d} type="button" className={`daycard${off ? ' off' : ''}`} disabled={off} onClick={() => pickDate(d)}>
                  <span className="dc-dow">{isToday ? '오늘' : DAY_NAMES[dt.getDay()] + '요일'}</span>
                  <span className="dc-day">{dt.getMonth() + 1}/{dt.getDate()}</span>
                  {off && <span className="dc-off">휴진</span>}
                </button>
              )
            })}
          </div>
        </section>
      )}

      {step === 2 && (
        <section aria-label="시간 고르기">
          <p className="lead">{prettyDate(date)} · 몇 시가 좋으세요?</p>
          {avail === null ? <p className="muted">불러오는 중…</p> : slots.length === 0 ? (
            <Msg kind="info">이 날은 예약할 수 있는 시간이 없어요. 다른 날을 골라 주세요.</Msg>
          ) : (
            <div className="slotgrid">
              {slots.map((t) => {
                const left = avail[t] ?? 0
                return (
                  <button key={t} type="button" className={`slot${left === 0 ? ' off' : ''}`} disabled={left === 0} onClick={() => pickTime(t)}>
                    {prettyTime(t)}
                    <small>{left === 0 ? '마감' : '예약 가능'}</small>
                  </button>
                )
              })}
            </div>
          )}
          <button type="button" className="btn ghost" onClick={() => setStep(1)}>날짜 다시 고르기</button>
        </section>
      )}

      {step === 3 && (
        <section aria-label="확인">
          <div className="card done">
            <p className="big">{prettyDate(date)}</p>
            <p className="big">{prettyTime(time)}</p>
          </div>

          {!changeId && (
            <>
              <label className="field">이름
                <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" placeholder="홍길동" />
              </label>
              <label className="field">휴대전화 번호
                <input value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" autoComplete="tel" placeholder="010-1234-5678" />
              </label>
              <button type="button" className="btn kakao" onClick={kakao}>
                {kakaoEnabled ? '카카오로 이름 불러오기' : '카카오 간편 로그인 (준비 중)'}
              </button>

              <label className="check">
                <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
                <span>개인정보 수집·이용에 동의합니다 (필수)</span>
              </label>
              <button type="button" className="linkbtn" onClick={() => setShowPrivacy((v) => !v)}>
                {showPrivacy ? '내용 접기' : '동의 내용 보기'}
              </button>
              {showPrivacy && <PrivacyText />}
            </>
          )}

          {err && <Msg kind="error">{err}</Msg>}
          <button type="button" className="btn primary" disabled={busy} onClick={submit}>
            {busy ? '잠시만요…' : changeId ? '이 시간으로 변경하기' : '예약하기'}
          </button>
          <button type="button" className="btn ghost" onClick={() => setStep(2)}>시간 다시 고르기</button>
        </section>
      )}
      {step !== 3 && err && <Msg kind="error">{err}</Msg>}
    </Page>
  )
}
