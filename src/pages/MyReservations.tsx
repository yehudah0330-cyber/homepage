import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Msg, Page } from '../components/ui'
import { clinic } from '../config/clinic'
import { booking } from '../data/booking'
import type { Reservation } from '../data/types'
import { normPhone, prettyDate, prettyTime, todayISO, validPhone } from '../lib/date'
import { getMe, setMe } from '../lib/prefs'

const STATUS = { pending: '확인 중', confirmed: '확정', cancelled: '취소' } as const

export default function MyReservations() {
  const [name, setName] = useState(getMe().name)
  const [phone, setPhone] = useState(getMe().phone)
  const [list, setList] = useState<Reservation[] | null>(null)
  const [err, setErr] = useState('')
  const [ask, setAsk] = useState('')
  const [info, setInfo] = useState('')

  const search = async (n = name, p = phone) => {
    setErr('')
    if (!n.trim() || !validPhone(p)) return setErr('이름과 휴대전화 번호를 확인해 주세요.')
    setMe({ name: n.trim(), phone: p })
    try {
      const all = await booking.mine(n.trim(), normPhone(p))
      setList(all.filter((r) => r.date >= todayISO()).sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time)))
    } catch (e) {
      setErr((e as Error).message)
    }
  }
  useEffect(() => {
    const me = getMe()
    if (me.name && validPhone(me.phone)) search(me.name, me.phone)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const cancel = async (r: Reservation) => {
    try {
      await booking.cancel(r.id)
      setInfo('예약을 취소했어요.')
      await search()
    } catch (e) {
      setErr((e as Error).message)
    }
    setAsk('')
  }

  return (
    <Page title="내 예약">
      <label className="field">이름
        <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
      </label>
      <label className="field">휴대전화 번호
        <input value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" autoComplete="tel" placeholder="010-1234-5678" />
      </label>
      {err && <Msg kind="error">{err}</Msg>}
      {info && <Msg kind="ok">{info}</Msg>}
      <button type="button" className="btn primary" onClick={() => search()}>내 예약 찾기</button>
      <p className="muted">시간을 바꾸려면 취소 후 다시 신청하시거나 {clinic.phone}로 연락해 주세요. <Link to="/reserve">예약 신청하기</Link></p>

      {list && (list.length === 0 ? <Msg kind="info">예정된 예약이 없어요.</Msg> : list.map((r) => (
        <article key={r.id} className="card">
          <p className="big">{prettyDate(r.date)}</p>
          <p className="big">{prettyTime(r.time)}</p>
          <p><b>{STATUS[r.status]}</b>{r.service ? ` · ${r.service}` : ''}</p>
          {r.status !== 'cancelled' && (ask === r.id ? (
            <div className="two">
              <button type="button" className="btn danger" onClick={() => cancel(r)}>네, 취소할게요</button>
              <button type="button" className="btn ghost" onClick={() => setAsk('')}>아니요</button>
            </div>
          ) : (
            <button type="button" className="btn ghost" onClick={() => setAsk(r.id)}>예약 취소</button>
          ))}
        </article>
      )))}
    </Page>
  )
}
