import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { Photo } from '../components/ui'
import { clinic } from '../config/clinic'
import { api } from '../data/api'
import blogPosts from '../data/blog.json'
import type { Column, Notice } from '../data/types'
import { DAY_NAMES, prettyTime } from '../lib/date'
import { todayState, type TodayState } from '../lib/schedule'
import { useHeroScene, usePointerFx, useScrollFx } from './fx'
import { Icon } from './Icon'
import { tel } from './SiteLayout'

const HERO = '/images/hero.jpg'
const ORDER = [1, 2, 3, 4, 5, 6, 0]
const FLOW = [
  { name: '상담', text: '불편한 곳과 생활 습관을 충분히 듣습니다.' },
  { name: '진단', text: '증상과 체질을 살펴 필요한 치료를 정합니다.' },
  { name: '치료', text: '치료 내용과 주의할 점을 설명드리고 진행합니다.' },
  { name: '관리', text: '치료 뒤 생활 관리와 다음 진료를 안내합니다.' }
]
const nth = (i: number) => ({ '--i': i }) as CSSProperties

export default function SiteHome() {
  const [state, setState] = useState<TodayState | null>(null)
  const [today, setToday] = useState<number | null>(null)
  const closedRef = useRef<Record<string, string>>({})
  const [notice, setNotice] = useState<Notice | null>(null)
  const [columns, setColumns] = useState<Column[]>([])
  const root = useRef<HTMLElement>(null)
  const hero = useRef<HTMLElement>(null)
  const steam = useRef<HTMLCanvasElement>(null)

  useHeroScene(hero, steam)
  usePointerFx(root)
  useScrollFx(root, [columns.length])

  useEffect(() => {
    const t = setInterval(() => setState((s) => (s ? todayState(new Date(), closedRef.current) : s)), 60000)
    return () => clearInterval(t)
  }, [])
  useEffect(() => {
    setToday(new Date().getDay())
    api.getClosedDays().then((c) => {
      closedRef.current = c
      setState(todayState(new Date(), c))
    })
    api.getNotices().then((n) => setNotice(n[0] ?? null))
    api.getColumns().then((c) => setColumns(c.slice(0, 3)))
  }, [])

  const q = encodeURIComponent(clinic.mapQuery)
  const lunch = clinic.hours[1]

  return (
    <main ref={root} className="cx">
      <section ref={hero} className="cx-hero">
        <div className="cx-scene" aria-hidden="true">
          <img className="cx-photo" src={HERO} alt="" />
        </div>
        <div className="cx-shade" aria-hidden="true" />
        <canvas ref={steam} className="cx-steam" aria-hidden="true" />
        <div className="cx-glow" aria-hidden="true" />

        <div className="site-wrap cx-hero-in">
          <div className="cx-hero-text">
            {state && <p className={`cx-today ${state.kind}`} aria-live="polite"><span className="dot" aria-hidden="true" />{state.text}</p>}
            <h1 className="cx-name" aria-label={clinic.name}>
              {[...clinic.name].map((ch, i) => <span key={i} aria-hidden="true" style={nth(i)}>{ch}</span>)}
            </h1>
            <p className="cx-line">충분히 듣고,<br />필요한 치료만 합니다.</p>
            <p className="cx-sub">수원시 영통구 망포동에서 침, 약침, 한약, 체중 관리를 진료합니다.</p>
            <div className="cx-btns">
              <Link className="cx-btn gold cx-magnet" to="/reserve"><Icon name="calendar" />진료 예약</Link>
              <a className="cx-btn glass cx-magnet" href={tel}><Icon name="phone" />전화 {clinic.phone}</a>
            </div>
          </div>
        </div>

        <div className="site-wrap cx-facts-wrap">
          <dl className="cx-facts">
            <div><dt>야간진료</dt><dd>월·수·금 저녁 8시까지</dd></div>
            <div><dt>점심시간</dt><dd>{lunch?.lunchStart}~{lunch?.lunchEnd}<small>토요일은 점심시간 없이 진료</small></dd></div>
            <div><dt>전화</dt><dd><a href={tel}>{clinic.phone}</a></dd></div>
            <div><dt>위치</dt><dd>{clinic.address}</dd></div>
          </dl>
        </div>
      </section>

      {notice && <div className="site-wrap"><p className="notice cx-notice"><b>공지</b> {notice.text}</p></div>}

      <section className="cx-sec">
        <div className="site-wrap">
          <div className="cx-head" data-reveal>
            <h2>진료 안내</h2>
            <p>어디가 불편하신지 먼저 듣고, 필요한 치료를 함께 정합니다.</p>
          </div>
          <ul className="cx-cards">
            {clinic.services.map((s, i) => (
              <li key={s.id} data-reveal style={nth(i % 2)}>
                <Link className={`cx-card cx-tilt ${s.id}`} to={`/treatment/${s.id}`}>
                  <span className="cx-card-img"><span data-parallax="-34"><Photo src={s.image} label={s.title} /></span></span>
                  <span className="cx-card-body">
                    <b>{s.title}</b>
                    <span>{s.summary}</span>
                    <em>자세히 보기 <Icon name="arrow" /></em>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="cx-sec cx-dark">
        <div className="site-wrap">
          <div className="cx-head" data-reveal>
            <h2>진료는 이렇게 진행됩니다</h2>
            <p>한 분 한 분의 이야기를 충분히 듣고 진료합니다.</p>
          </div>
          <div className="cx-flow" data-scrub>
            <span className="cx-flow-line" aria-hidden="true"><i /></span>
            <ol>
              {FLOW.map((f, i) => (
                <li key={f.name} data-step>
                  <span className="cx-no" aria-hidden="true">{i + 1}</span>
                  <b>{f.name}</b>
                  <p>{f.text}</p>
                </li>
              ))}
            </ol>
          </div>
          <div className="cx-center" data-reveal><Link className="cx-btn glass cx-magnet" to="/about/doctor">의료진 소개 보기</Link></div>
        </div>
      </section>

      <section className="cx-sec cx-time">
        <div className="site-wrap">
          <div className="cx-head" data-reveal>
            <h2>진료시간</h2>
            <p>{clinic.holidayNote}</p>
          </div>
          <ul className="cx-week">
            {ORDER.map((d, i) => {
              const h = clinic.hours[d]
              return (
                <li key={d} data-reveal style={nth(i)}>
                  <div className={`cx-day cx-tilt${d === today ? ' now' : ''}${h ? '' : ' off'}${h?.night ? ' night' : ''}`}>
                    <b>{DAY_NAMES[d]}요일</b>
                    {h ? (
                      <>
                        <strong>{prettyTime(h.close)}<small>까지</small></strong>
                        <span>{h.open} 시작</span>
                      </>
                    ) : <strong>휴진</strong>}
                    {h?.night && <em>야간진료</em>}
                    {d === today && <i>오늘</i>}
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      </section>

      <section className="cx-sec cx-read">
        <div className="site-wrap">
          {/* 칼럼이 하나도 없으면 이 칸은 보이지 않습니다 */}
          {columns.length > 0 && <>
            <div className="cx-head row" data-reveal>
              <h2>원장 칼럼</h2>
              <Link className="more-link" to="/column">전체 보기 <Icon name="arrow" /></Link>
            </div>
            <ul className="cx-posts">
              {columns.map((c, i) => (
                <li key={c.id} data-reveal style={nth(i)}>
                  <Link className="cx-post cx-tilt" to={`/column/${c.id}`}>
                    <h3>{c.title}</h3>
                    <time dateTime={c.date}>{c.date.replace(/-/g, '.')}</time>
                  </Link>
                </li>
              ))}
            </ul>
          </>}

          <div className="cx-head row" data-reveal>
            <h2>블로그 새 글</h2>
            <a className="more-link" href="https://blog.naver.com/caccactus" target="_blank" rel="noreferrer">블로그 가기 <Icon name="arrow" /></a>
          </div>
          <ul className="cx-posts">
            {blogPosts.map((p, i) => (
              <li key={p.url} data-reveal style={nth(i)}>
                <a className="cx-post cx-tilt" href={p.url} target="_blank" rel="noreferrer">
                  <h3>{p.title}</h3>
                  <time dateTime={p.date}>{p.date.replace(/-/g, '.')}</time>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="cx-sec cx-dark cx-visit">
        <img className="cx-visit-bg" src={HERO} alt="" loading="lazy" data-parallax="-90" />
        <div className="site-wrap">
          <div className="cx-panel" data-reveal>
            <h2>오시는 길</h2>
            <p className="cx-addr">{clinic.address}</p>
            {[...clinic.directions.subway, ...clinic.directions.parking].map((t) => <p key={t}>{t}</p>)}
            <div className="cx-btns">
              <a className="cx-btn gold cx-magnet" href={`https://map.naver.com/p/search/${q}`} target="_blank" rel="noopener noreferrer"><Icon name="pin" />네이버지도로 보기</a>
              <Link className="cx-btn glass cx-magnet" to="/about/location">교통 안내</Link>
              <a className="cx-btn glass cx-magnet" href={tel}><Icon name="phone" />{clinic.phone}</a>
            </div>
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
