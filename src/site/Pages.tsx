import { useEffect, useState, type ReactNode } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { Photo } from '../components/ui'
import { clinic } from '../config/clinic'
import { api } from '../data/api'
import type { Column } from '../data/types'
import { todayISO } from '../lib/date'
import { Icon } from './Icon'
import { HoursTable } from './Home'
import { tel } from './SiteLayout'

function Banner({ title, image, sub }: { title: string; image: string; sub?: string }) {
  const img = image.endsWith('.svg') ? '/images/hero.jpg' : image
  return (
    <section className="banner" style={{ backgroundImage: `linear-gradient(rgba(58,42,32,.62), rgba(58,42,32,.62)), url(${img})` }}>
      <div className="site-wrap">
        <h1>{title}</h1>
        {sub && <p>{sub}</p>}
      </div>
    </section>
  )
}

function Crumb({ items }: { items: string[] }) {
  return <p className="crumb site-wrap">홈 · {items.join(' · ')}</p>
}

function Cta({ children }: { children?: ReactNode }) {
  return (
    <div className="cta-band">
      <div className="site-wrap cta-in">
        <p>{children ?? '어디가 불편하신지 편하게 말씀해 주세요.'}</p>
        <div className="cta-btns">
          <Link className="btn gold" to="/reserve">진료 예약</Link>
          <a className="btn outline-light" href={tel}>전화 {clinic.phone}</a>
        </div>
      </div>
    </div>
  )
}

export function Treatment() {
  const { id } = useParams()
  const s = clinic.services.find((x) => x.id === id)
  if (!s) return <Navigate to="/" replace />
  return (
    <main>
      <Banner title={s.title} image={s.image} sub={s.summary} />
      <Crumb items={['진료 안내', s.title]} />
      <div className="site-wrap sub-layout">
        <aside className="side-menu" aria-label="진료 안내 메뉴">
          <h2>진료 안내</h2>
          {clinic.services.map((x) => (
            <Link key={x.id} to={`/treatment/${x.id}`} className={x.id === s.id ? 'on' : ''} aria-current={x.id === s.id ? 'page' : undefined}>{x.title}</Link>
          ))}
        </aside>
        <article className="sub-body">
          <div className="sub-photo"><Photo src={s.image} label={s.title} /></div>
          <h2 className="sec-title">{s.title}</h2>
          <p className="big">{s.summary}</p>
          <h3 className="sub-h">이런 분께 권합니다</h3>
          <ul className="check-list">{s.points.map((p) => <li key={p}>{p}</li>)}</ul>
          <h3 className="sub-h">진료는 이렇게 진행됩니다</h3>
          <ol className="flow">
            <li><b>상담</b><span>불편한 곳과 생활 습관을 충분히 듣습니다.</span></li>
            <li><b>진단</b><span>증상과 체질을 살펴 필요한 치료를 정합니다.</span></li>
            <li><b>치료</b><span>치료 내용과 주의할 점을 설명드리고 진행합니다.</span></li>
            <li><b>관리</b><span>치료 뒤 생활 관리와 다음 진료를 안내합니다.</span></li>
          </ol>
          <p className="muted">치료 방법과 비용은 진료 시 자세히 설명드립니다. 궁금한 점은 전화({clinic.phone})로 문의해 주세요.</p>
        </article>
      </div>
      <Cta />
    </main>
  )
}

export function DoctorPage() {
  const d = clinic.doctor
  return (
    <main>
      <Banner title="의료진 소개" image="/images/hero.jpg" />
      <Crumb items={['한의원 소개', '의료진 소개']} />
      <div className="site-wrap about-doc">
        <Photo src={d.photo} label={d.name} round />
        <div>
          <p className="doc-name">{d.name}</p>
          {d.title && <p className="doc-title">{d.title}</p>}
          {d.philosophy && <p className="lead-quote">“{d.philosophy}”</p>}
          {d.career.length > 0 && <ul className="check-list">{d.career.map((c) => <li key={c}>{c}</li>)}</ul>}
          {!d.philosophy && d.career.length === 0 && <p>약력과 진료 철학은 곧 안내해 드리겠습니다.</p>}
        </div>
      </div>
      <Cta />
    </main>
  )
}

export function HoursPage() {
  const [closed, setClosed] = useState<Record<string, string>>({})
  useEffect(() => { api.getClosedDays().then(setClosed) }, [])
  const upcoming = Object.entries(closed).filter(([k]) => k >= todayISO()).sort(([a], [b]) => a.localeCompare(b))
  return (
    <main>
      <Banner title="진료시간" image="/images/hero.jpg" />
      <Crumb items={['한의원 소개', '진료시간']} />
      <div className="site-wrap two-col page-pad">
        <HoursTable />
        <div className="side">
          <h3>쉬는 날 안내</h3>
          {upcoming.length === 0 ? <p>앞으로 예정된 휴진일이 없습니다.</p> : (
            <ul>{upcoming.map(([k, why]) => <li key={k}>{Number(k.slice(5, 7))}월 {Number(k.slice(8))}일 {why && `· ${why}`}</li>)}</ul>
          )}
          <p className="muted">진료 시간 중 점심시간에는 진료하지 않습니다.</p>
        </div>
      </div>
      <Cta />
    </main>
  )
}

export function LocationPage() {
  const q = encodeURIComponent(clinic.mapQuery)
  const d = clinic.directions
  return (
    <main>
      <Banner title="오시는 길" image="/images/hero.jpg" />
      <Crumb items={['한의원 소개', '오시는 길']} />
      <div className="site-wrap page-pad where">
        <p className="addr">{clinic.address}</p>
        <p>대표전화 <a href={tel}>{clinic.phone}</a></p>
        <div className="two">
          <a className="btn primary" href={`https://map.naver.com/p/search/${q}`} target="_blank" rel="noopener noreferrer">네이버지도로 보기</a>
          <a className="btn primary alt" href={`https://map.kakao.com/link/search/${q}`} target="_blank" rel="noopener noreferrer">카카오맵으로 보기</a>
        </div>
        {d.parking.length + d.subway.length + d.bus.length === 0 ? (
          <p className="muted">주차·대중교통 안내는 준비 중입니다. 궁금하신 점은 전화({clinic.phone})로 문의해 주세요.</p>
        ) : (
          <div className="routes">
            {d.parking.length > 0 && <div><h3>주차</h3><ul>{d.parking.map((t) => <li key={t}>{t}</li>)}</ul></div>}
            {d.subway.length > 0 && <div><h3>지하철</h3><ul>{d.subway.map((t) => <li key={t}>{t}</li>)}</ul></div>}
            {d.bus.length > 0 && <div><h3>버스</h3><ul>{d.bus.map((t) => <li key={t}>{t}</li>)}</ul></div>}
          </div>
        )}
      </div>
      <Cta />
    </main>
  )
}

export function ColumnList() {
  const [list, setList] = useState<Column[]>([])
  useEffect(() => { api.getColumns().then(setList) }, [])
  return (
    <main>
      <Banner title="원장 칼럼" image="/images/herb.jpg" sub="원장이 직접 쓰는 건강 이야기" />
      <Crumb items={['원장 칼럼']} />
      <div className="site-wrap page-pad">
        <div className="toc">
          {list.map((c) => (
            <Link key={c.id} to={`/column/${c.id}`} className="entry-row">
              <h3>{c.title}</h3>
              <span className="leader" aria-hidden="true" />
              <time dateTime={c.date}>{c.date.replace(/-/g, '.')}</time>
            </Link>
          ))}
          {list.length === 0 && <p className="muted">곧 원장 칼럼이 올라옵니다.</p>}
        </div>
      </div>
    </main>
  )
}

export function ColumnView() {
  const { id } = useParams()
  const [list, setList] = useState<Column[] | null>(null)
  useEffect(() => { api.getColumns().then(setList) }, [])
  if (!list) return <main className="page-pad site-wrap"><p className="muted">불러오는 중…</p></main>
  const i = list.findIndex((c) => c.id === id)
  if (i < 0) return <Navigate to="/column" replace />
  const c = list[i]
  const paras = c.body.split(/\n\s*\n/).map((t) => t.trim()).filter(Boolean)
  const newer = list[i - 1]
  const older = list[i + 1]
  return (
    <main>
      <Banner title="원장 칼럼" image="/images/herb.jpg" />
      <Crumb items={['원장 칼럼']} />
      <article className="site-wrap page-pad post">
        <time dateTime={c.date}>{c.date.replace(/-/g, '.')}</time>
        <h2 className="sec-title">{c.title}</h2>
        {paras.map((t, k) => <p key={k}>{t}</p>)}
        <div className="post-nav">
          {newer ? <Link to={`/column/${newer.id}`}>← 다음 글 · {newer.title}</Link> : <span />}
          {older && <Link to={`/column/${older.id}`}>이전 글 · {older.title} →</Link>}
        </div>
        <Link className="more-link" to="/column"><Icon name="arrow" /> 목록으로</Link>
      </article>
      <Cta />
    </main>
  )
}
