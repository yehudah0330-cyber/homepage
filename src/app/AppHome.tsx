import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Photo } from '../components/ui'
import { clinic } from '../config/clinic'
import { api } from '../data/api'
import type { Notice } from '../data/types'
import { DAY_NAMES } from '../lib/date'
import { Icon } from '../site/Icon'
import { InstallCard } from './AppShell'
import { pic } from './pic'
import { tips } from './tips'
import { useToday } from './useToday'

const tel = `tel:${clinic.phone.replace(/\D/g, '')}`

export default function AppHome() {
  const { state } = useToday()
  const [notice, setNotice] = useState<Notice | null>(null)
  useEffect(() => { api.getNotices().then((n) => setNotice(n[0] ?? null)).catch(() => undefined) }, [])
  const now = new Date()
  const tip = tips[now.getMonth()]

  return (
    <main>
      <header className="ap-hero">
        <img src="/images/hero.jpg" alt="" />
        <div className="ap-hero-in">
          <b className="ap-brand">{clinic.name}</b>
          {state && <Link to="/directions" className={`ap-today ${state.kind}`} aria-live="polite"><span className="dot" aria-hidden="true" />{state.text}</Link>}
          <p className="ap-line">충분히 듣고,<br />필요한 치료만 합니다.</p>
          <div className="ap-hero-btns">
            <Link className="ap-btn gold" to="/reserve"><Icon name="calendar" />진료 예약</Link>
            <Link className="ap-btn glass" to="/care">진료 안내</Link>
          </div>
        </div>
      </header>

      <nav className="ap-quick" aria-label="바로가기">
        <Link to="/reserve"><i><Icon name="calendar" /></i>예약</Link>
        <a href={tel}><i><Icon name="phone" /></i>전화</a>
        <Link to="/directions"><i><Icon name="pin" /></i>오시는 길</Link>
        <a href="https://blog.naver.com/caccactus" target="_blank" rel="noopener noreferrer"><i><Icon name="book" /></i>블로그</a>
      </nav>

      <div className="ap-body">
        {notice && <p className="ap-notice"><b>공지</b> {notice.text}</p>}
        <InstallCard />

        <section>
          <div className="ap-head"><h2>오늘의 생활 안내</h2><span>{now.getMonth() + 1}월 {now.getDate()}일 {DAY_NAMES[now.getDay()]}요일</span></div>
          <article className="ap-tip">
            <Photo src={pic('/images/herb.jpg')} label="말린 약재가 담긴 그릇" />
            <h3>{tip.title}</h3>
            <p>{tip.text}</p>
            <p className="ap-tea"><b>곁들이면 좋은 차</b> {tip.tea}</p>
            <small>일반적인 생활 정보이며 진단과 치료를 대신하지 않습니다.</small>
          </article>
        </section>

        <section>
          <div className="ap-head"><h2>진료 과목</h2><span>옆으로 밀어 보세요</span></div>
          <ul className="ap-rail">
            {clinic.services.map((s) => (
              <li key={s.id}>
                <Link to={`/care?open=${s.id}`}>
                  <Photo src={pic(s.image)} label={s.title} />
                  <b>{s.title}</b>
                  <span>{s.summary}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <p className="ap-foot">{clinic.address}<br />대표전화 <a href={tel}>{clinic.phone}</a></p>
      </div>
    </main>
  )
}
