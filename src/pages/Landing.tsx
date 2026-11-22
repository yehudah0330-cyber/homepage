import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Photo, TextSizeControl } from '../components/ui'
import { clinic } from '../config/clinic'
import { api } from '../data/api'
import type { Notice } from '../data/types'
import { DAY_NAMES, todayISO } from '../lib/date'
import { todayState, type TodayState } from '../lib/schedule'

const tel = `tel:${clinic.phone.replace(/\D/g, '')}`
const ORDER = [1, 2, 3, 4, 5, 6, 0]
const HERO = '/images/hero.jpg'

export default function Landing() {
  const [state, setState] = useState<TodayState | null>(null)
  const [closed, setClosed] = useState<Record<string, string>>({})
  const [notice, setNotice] = useState<Notice | null>(null)

  useEffect(() => {
    api.getClosedDays().then((c) => {
      setClosed(c)
      setState(todayState(new Date(), c))
    })
    api.getNotices().then((n) => setNotice(n[0] ?? null))
  }, [])

  const q = encodeURIComponent(clinic.mapQuery)
  const d = clinic.directions
  const doc = clinic.doctor
  const upcoming = Object.entries(closed).filter(([k]) => k >= todayISO()).sort(([a], [b]) => a.localeCompare(b))

  return (
    <div className="site">
      <header className="site-head">
        <div className="site-wrap site-head-in">
          <a href="#top" className="brand">{clinic.name}</a>
          <nav className="site-nav" aria-label="홈페이지 메뉴">
            <a href="#care">진료 안내</a>
            <a href="#doctor">의료진</a>
            <a href="#hours">진료시간</a>
            <a href="#where">오시는 길</a>
          </nav>
          <Link className="btn small site-cta" to="/reserve">예약하기</Link>
        </div>
      </header>

      <main id="top">
        <section className="hero" style={{ backgroundImage: `linear-gradient(100deg, rgba(20,42,30,.92) 0%, rgba(20,42,30,.72) 45%, rgba(20,42,30,.25) 100%), url(${HERO})` }}>
          <div className="site-wrap hero-in">
            {state && <p className={`today glass ${state.kind}`} aria-live="polite"><span className="dot" aria-hidden="true" />{state.text}</p>}
            <p className="eyebrow">한방 진료 · 간편 예약</p>
            <h1 className="hero-title">몸과 마음의 균형을<br />정성으로 돌봅니다</h1>
            <p className="hero-sub">한 분 한 분의 이야기를 충분히 듣고,<br />꼭 필요한 치료만 따뜻하게 해 드립니다.</p>
            <div className="hero-btns">
              <Link className="btn gold" to="/reserve">전화 없이 예약하기</Link>
              <a className="btn outline-light" href={tel}>전화 {clinic.phone}</a>
            </div>
          </div>
        </section>

        <div className="site-wrap sizebar"><TextSizeControl /></div>

        {notice && <div className="site-wrap"><p className="notice"><b>공지</b> {notice.text}</p></div>}

        <section className="site-wrap steps" aria-label="예약 방법">
          <p className="eyebrow dark">HOW TO</p>
          <h2 className="sec-title">예약은 세 번만 누르면 끝납니다</h2>
          <ol>
            <li><b>01</b><span>날짜를 고릅니다</span></li>
            <li><b>02</b><span>시간을 고릅니다</span></li>
            <li><b>03</b><span>이름·전화번호를 확인합니다</span></li>
          </ol>
          <p className="muted">회원가입은 필요 없습니다. 예약이 확정·변경·취소되면 카카오톡이나 문자로 알려 드립니다.</p>
        </section>

        <section id="care" className="band sand">
          <div className="site-wrap">
            <p className="eyebrow dark">TREATMENT</p>
            <h2 className="sec-title">진료 안내</h2>
            <div className="svc-grid">
              {clinic.services.map((s) => (
                <article key={s.id} className="svc">
                  <Photo src={s.image} label={s.title} />
                  <div className="svc-body">
                    <h3>{s.title}</h3>
                    <p className="big">{s.summary}</p>
                    <ul>{s.points.map((p) => <li key={p}>{p}</li>)}</ul>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="doctor" className="band deep">
          <div className="site-wrap doctor">
            <Photo src={doc.photo} label={doc.name} round />
            <div>
              <p className="eyebrow">DOCTOR</p>
              <h2 className="sec-title light">의료진 소개</h2>
              <p className="doc-name">{doc.name}</p>
              {doc.title && <p className="doc-title">{doc.title}</p>}
              {doc.philosophy && <p className="quote">“{doc.philosophy}”</p>}
              {doc.career.length > 0 && <ul>{doc.career.map((c) => <li key={c}>{c}</li>)}</ul>}
              {!doc.philosophy && doc.career.length === 0 && <p>약력과 진료 철학은 곧 안내해 드리겠습니다.</p>}
            </div>
          </div>
        </section>

        <section id="hours" className="band">
          <div className="site-wrap two-col">
            <div>
              <p className="eyebrow dark">HOURS</p>
              <h2 className="sec-title">진료시간</h2>
              <table className="hours">
                <tbody>
                  {ORDER.map((i) => {
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
            </div>
            <div className="card side">
              <h3>쉬는 날 안내</h3>
              {upcoming.length === 0 ? <p>앞으로 예정된 휴진일이 없습니다.</p> : (
                <ul>{upcoming.map(([k, why]) => <li key={k}>{Number(k.slice(5, 7))}월 {Number(k.slice(8))}일 {why && `· ${why}`}</li>)}</ul>
              )}
              <Link className="btn primary" to="/reserve">예약하기</Link>
            </div>
          </div>
        </section>

        <section id="where" className="site-wrap where">
          <p className="eyebrow dark">LOCATION</p>
          <h2 className="sec-title">오시는 길</h2>
          <p className="addr">{clinic.address}</p>
          <div className="two">
            <a className="btn primary" href={`https://map.naver.com/p/search/${q}`} target="_blank" rel="noopener noreferrer">네이버지도로 보기</a>
            <a className="btn primary alt" href={`https://map.kakao.com/link/search/${q}`} target="_blank" rel="noopener noreferrer">카카오맵으로 보기</a>
          </div>
          {d.parking.length + d.subway.length + d.bus.length === 0 ? (
            <p className="muted">주차·대중교통 안내는 준비 중입니다. 궁금하신 점은 전화({clinic.phone})로 문의해 주세요.</p>
          ) : (
            <div className="svc-grid three">
              {d.parking.length > 0 && <div className="card"><h3>주차</h3><ul>{d.parking.map((t) => <li key={t}>{t}</li>)}</ul></div>}
              {d.subway.length > 0 && <div className="card"><h3>지하철</h3><ul>{d.subway.map((t) => <li key={t}>{t}</li>)}</ul></div>}
              {d.bus.length > 0 && <div className="card"><h3>버스</h3><ul>{d.bus.map((t) => <li key={t}>{t}</li>)}</ul></div>}
            </div>
          )}
        </section>
      </main>

      <footer className="site-foot">
        <div className="site-wrap foot-in">
          <div>
            <b className="foot-name">{clinic.name}</b>
            <p>{clinic.address}</p>
            <p>대표전화 <a href={tel}>{clinic.phone}</a></p>
            {clinic.showPrepNotice && <p className="muted">※ 진료시간 등 일부 안내는 준비 중입니다. 정확한 내용은 전화로 확인해 주세요.</p>}
          </div>
          <div className="foot-links">
            <Link to="/app">앱 화면으로 보기</Link>
            <Link to="/my">내 예약 확인</Link>
            <Link to="/privacy">개인정보 처리 안내</Link>
            <Link to="/admin">직원용</Link>
          </div>
        </div>
      </footer>

      <div className="sticky-cta" aria-label="빠른 메뉴">
        <Link className="btn primary" to="/reserve">예약하기</Link>
        <a className="btn ghost" href={tel}>전화</a>
      </div>
    </div>
  )
}
