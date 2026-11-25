import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Photo } from '../components/ui'
import { clinic } from '../config/clinic'
import { api } from '../data/api'
import type { Column, Notice } from '../data/types'
import { DAY_NAMES } from '../lib/date'
import { todayState, type TodayState } from '../lib/schedule'
import { Icon } from './Icon'
import { tel } from './SiteLayout'

const HERO = '/images/hero.jpg'
const ORDER = [1, 2, 3, 4, 5, 6, 0]

export default function SiteHome() {
  const [state, setState] = useState<TodayState | null>(null)
  const closedRef = useRef<Record<string, string>>({})
  const [notice, setNotice] = useState<Notice | null>(null)
  const [columns, setColumns] = useState<Column[]>([])

  useEffect(() => {
    const t = setInterval(() => setState((s) => (s ? todayState(new Date(), closedRef.current) : s)), 60000)
    return () => clearInterval(t)
  }, [])
  useEffect(() => {
    api.getClosedDays().then((c) => {
      closedRef.current = c
      setState(todayState(new Date(), c))
    })
    api.getNotices().then((n) => setNotice(n[0] ?? null))
    api.getColumns().then((c) => setColumns(c.slice(0, 3)))
  }, [])

  return (
    <main>
      <section className="hero2">
        <div className="site-wrap hero2-in">
          <div className="hero2-text">
            <h1 className="hero-name">{clinic.name}</h1>
            {state && <p className={`today ${state.kind}`} aria-live="polite"><span className="dot" aria-hidden="true" />{state.text}</p>}
            <p className="hero-title">충분히 듣고,<br />필요한 치료만 합니다.</p>
            <p className="hero-sub">수원시 영통구 망포동에서 침, 약침, 한약, 체중 관리를 진료합니다.</p>
            <div className="hero-btns">
              <Link className="btn primary" to="/reserve">진료 예약</Link>
              <a className="btn ghost" href={tel}>전화 {clinic.phone}</a>
            </div>
          </div>
          <img className="hero2-img" src={HERO} alt="" />
        </div>
      </section>

      <div className="site-wrap">
        <dl className="facts">
          <div><dt>전화</dt><dd><a href={tel}>{clinic.phone}</a></dd></div>
          <div><dt>위치</dt><dd>{clinic.address}</dd></div>
          <div><dt>점심시간</dt><dd>{clinic.hours[1]?.lunchStart}~{clinic.hours[1]?.lunchEnd} <small>(토요일은 점심시간 없이 진료)</small></dd></div>
        </dl>
      </div>

      {notice && <div className="site-wrap"><p className="notice"><b>공지</b> {notice.text}</p></div>}

      <section className="band">
        <div className="site-wrap">
          <div className="sec-head">
            <h2 className="sec-title">진료 안내</h2>
            <Link className="more-link" to="/treatment/acu">전체 보기 <Icon name="arrow" /></Link>
          </div>
          <ul className="svc">
            {clinic.services.map((s) => (
              <li key={s.id}>
                <Link to={`/treatment/${s.id}`}>
                  <span className="svc-text"><b>{s.title}</b><span>{s.summary}</span></span>
                  <Photo src={s.image} label={s.title} />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="band sand">
        <div className="site-wrap doctor-teaser">
          <Photo src={clinic.doctor.photo} label={clinic.doctor.name} round />
          <div>
            <h2 className="sec-title">의료진 소개</h2>
            <p className="lead-quote">{clinic.doctor.philosophy ? `“${clinic.doctor.philosophy}”` : '한 분 한 분의 이야기를 충분히 듣고 진료합니다.'}</p>
            <Link className="btn primary fit" to="/about/doctor">의료진 소개 보기</Link>
          </div>
        </div>
      </section>

      <section className="band">
        <div className="site-wrap">
          <div className="sec-head">
            <h2 className="sec-title">원장 칼럼</h2>
            <Link className="more-link" to="/column">전체 보기 <Icon name="arrow" /></Link>
          </div>
          <div className="toc">
            {columns.map((c) => (
              <Link key={c.id} to={`/column/${c.id}`} className="entry-row">
                <h3>{c.title}</h3>
                <span className="leader" aria-hidden="true" />
                <time dateTime={c.date}>{c.date.replace(/-/g, '.')}</time>
              </Link>
            ))}
            {columns.length === 0 && <p className="muted">곧 원장 칼럼이 올라옵니다.</p>}
          </div>
        </div>
      </section>

      <section className="band sand">
        <div className="site-wrap two-col">
          <div>
            <h2 className="sec-title">진료시간</h2>
            <HoursTable />
          </div>
          <div className="side">
            <h2 className="sec-title">오시는 길</h2>
            <p className="addr">{clinic.address}</p>
            <Link className="btn primary" to="/about/location">지도·교통 안내</Link>
            <Link className="btn ghost" to="/reserve">진료 예약</Link>
          </div>
        </div>
      </section>
    </main>
  )
}

export function HoursTable() {
  return (
    <table className="hours">
      <tbody>
        {ORDER.map((i) => {
          const h = clinic.hours[i]
          return (
            <tr key={i} className={i === new Date().getDay() ? 'now' : ''}>
              <th scope="row">{DAY_NAMES[i]}요일{h?.night && <em>야간진료</em>}</th>
              <td>{h ? <>{h.open} ~ {h.close}{h.lunchStart && <small>점심 {h.lunchStart}~{h.lunchEnd}</small>}</> : '휴진'}</td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}
