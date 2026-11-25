import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { TextSizeControl } from '../components/ui'
import { clinic } from '../config/clinic'
import { Icon } from './Icon'

export const tel = `tel:${clinic.phone.replace(/\D/g, '')}`

type Item = { to: string; label: string }
type Menu = { label: string; to: string; items?: Item[] }

export const MENUS: Menu[] = [
  {
    label: '한의원 소개',
    to: '/about/doctor',
    items: [
      { to: '/about/doctor', label: '의료진 소개' },
      { to: '/about/hours', label: '진료시간' },
      { to: '/about/location', label: '오시는 길' }
    ]
  },
  { label: '진료 안내', to: `/treatment/${clinic.services[0].id}`, items: clinic.services.map((s) => ({ to: `/treatment/${s.id}`, label: s.title })) },
  { label: '원장 칼럼', to: '/column' }
]

export default function SiteLayout() {
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()
  useEffect(() => {
    setOpen(false)
    window.scrollTo(0, 0)
  }, [pathname])
  useEffect(() => {
    const s = clinic.services.find((x) => pathname === `/treatment/${x.id}`)
    const names: Record<string, string> = { '/about/doctor': '의료진 소개', '/about/hours': '진료시간', '/about/location': '오시는 길', '/column': '원장 칼럼' }
    const page = s ? `${s.title} 안내` : names[pathname]
    document.title = page ? `${page} | ${clinic.name} 수원 영통구 한의원` : `${clinic.name} | 수원 영통구 망포 한의원 · 침 · 약침 · 한약 · 다이어트`
    const link = document.querySelector('link[rel="canonical"]')
    if (link) link.setAttribute('href', `https://bubuhani.com${pathname === '/' ? '/' : pathname}`)
  }, [pathname])

  return (
    <div className="site">
      <div className="site-util">
        <div className="site-wrap util-in">
          <span>{clinic.address}</span>
          <TextSizeControl />
        </div>
      </div>
      <header className="site-head">
        <div className="site-wrap site-head-in">
          <Link to="/" className="brand">{clinic.name}</Link>
          <nav className="site-nav" aria-label="홈페이지 메뉴">
            {MENUS.map((m) => (
              <div key={m.label} className="nav-item">
                <NavLink to={m.to} className="nav-top">{m.label}</NavLink>
                {m.items && (
                  <div className="nav-sub">
                    {m.items.map((i) => <NavLink key={i.to} to={i.to}>{i.label}</NavLink>)}
                  </div>
                )}
              </div>
            ))}
          </nav>
          <Link className="btn small site-cta" to="/reserve">진료 예약</Link>
          <button type="button" className="burger" aria-expanded={open} aria-label="메뉴 열기" onClick={() => setOpen(!open)}>
            <span /><span /><span />
          </button>
        </div>
        {open && (
          <nav className="m-menu" aria-label="모바일 메뉴">
            {MENUS.map((m) => (
              <div key={m.label} className="m-group">
                <p>{m.label}</p>
                {(m.items ?? [{ to: m.to, label: m.label }]).map((i) => <Link key={i.to} to={i.to}>{i.label}</Link>)}
              </div>
            ))}
            <Link className="btn primary" to="/reserve">진료 예약</Link>
          </nav>
        )}
      </header>

      <Outlet />

      <footer className="site-foot">
        <div className="site-wrap foot-in">
          <div>
            <b className="foot-name">{clinic.name}</b>
            <p>{clinic.address}</p>
            <p>대표전화 <a href={tel}>{clinic.phone}</a></p>
            {clinic.showPrepNotice && <p className="muted">※ 일부 안내는 준비 중입니다. 정확한 내용은 전화로 확인해 주세요.</p>}
          </div>
          <div className="foot-links">
            <a href="https://blog.naver.com/caccactus" target="_blank" rel="noopener noreferrer">네이버 블로그</a>
            <Link to="/my">내 예약 확인</Link>
            <Link to="/privacy">개인정보 처리 안내</Link>
            <Link to="/app">앱 화면으로 보기</Link>
            <Link to="/admin">직원용</Link>
          </div>
        </div>
      </footer>

      <div className="float-cta" aria-label="빠른 메뉴">
        <Link to="/reserve"><Icon name="calendar" />진료 예약</Link>
        <a href={tel}><Icon name="phone" />전화 상담</a>
      </div>
    </div>
  )
}
