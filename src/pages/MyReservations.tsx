import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Msg, Page } from '../components/ui'
import { api } from '../data/api'
import type { Reservation } from '../data/types'
import { prettyDate, prettyTime, toISO, validPhone } from '../lib/date'
import { getMe, setMe } from '../lib/prefs'
import { notify } from '../notify/notifier'

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
    const all = await api.findReservations(n, p)
    const today = toISO(new Date())
    setList(all.filter((r) => r.status === 'confirmed' && r.date >= today).sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time)))
  }
  useEffect(() => {
    const me = getMe()
    if (me.name && validPhone(me.phone)) search(me.name, me.phone)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const cancel = async (r: Reservation) => {
    const c = await api.cancelReservation(r.id)
    await notify('cancel', c)
    setAsk('')
    setInfo('예약을 취소했어요. 취소 안내가 발송됩니다.')
    search()
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

      {list && (list.length === 0 ? <Msg kind="info">예정된 예약이 없어요.</Msg> : list.map((r) => (
        <article key={r.id} className="card">
          <p className="big">{prettyDate(r.date)}</p>
          <p className="big">{prettyTime(r.time)}</p>
          {r.nextCare && <p className="muted">{r.nextCare.label} · {prettyDate(r.nextCare.endDate)}까지</p>}
          {ask === r.id ? (
            <div className="two">
              <button type="button" className="btn danger" onClick={() => cancel(r)}>네, 취소할게요</button>
              <button type="button" className="btn ghost" onClick={() => setAsk('')}>아니요</button>
            </div>
          ) : (
            <div className="two">
              <Link className="btn primary" to={`/reserve?change=${r.id}`}>시간 변경</Link>
              <button type="button" className="btn ghost" onClick={() => setAsk(r.id)}>예약 취소</button>
            </div>
          )}
        </article>
      )))}
    </Page>
  )
}
