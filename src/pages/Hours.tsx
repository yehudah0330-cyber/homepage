import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Page } from '../components/ui'
import { clinic } from '../config/clinic'
import { api } from '../data/api'
import { DAY_NAMES, prettyDate, todayISO } from '../lib/date'
import { todayState, type TodayState } from '../lib/schedule'

export default function Hours() {
  const [closed, setClosed] = useState<Record<string, string>>({})
  const [state, setState] = useState<TodayState | null>(null)
  useEffect(() => {
    api.getClosedDays().then((c) => {
      setClosed(c)
      setState(todayState(new Date(), c))
    })
  }, [])
  const upcoming = Object.entries(closed).filter(([d]) => d >= todayISO()).sort(([a], [b]) => a.localeCompare(b))
  const order = [1, 2, 3, 4, 5, 6, 0]
  return (
    <Page title="진료시간">
      {state && <div className={`today ${state.kind}`}><span className="dot" aria-hidden="true" />{state.text}</div>}
      <table className="hours">
        <tbody>
          {order.map((i) => {
            const h = clinic.hours[i]
            return (
              <tr key={i} className={i === new Date().getDay() ? 'now' : ''}>
                <th scope="row">{DAY_NAMES[i]}요일</th>
                <td>{h ? <>{h.open} ~ {h.close}{h.lunchStart && <small>점심 {h.lunchStart}~{h.lunchEnd}</small>}</> : '휴진'}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
      <section className="card">
        <h2>쉬는 날 안내</h2>
        {upcoming.length === 0 ? <p>앞으로 예정된 휴진일이 없어요.</p> : (
          <ul>{upcoming.map(([d, why]) => <li key={d}>{prettyDate(d)} {why && `· ${why}`}</li>)}</ul>
        )}
      </section>
      <Link className="btn primary" to="/reserve">예약하기</Link>
    </Page>
  )
}
