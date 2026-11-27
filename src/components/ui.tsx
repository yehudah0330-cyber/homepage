import { useEffect, useState, type ReactNode } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { clinic } from '../config/clinic'
import { FONT_STEPS, getFontStep, setFontStep } from '../lib/prefs'

export function TextSizeControl() {
  const [step, setStep] = useState(getFontStep())
  const pick = (i: number) => {
    setStep(i)
    setFontStep(i)
  }
  return (
    <div className="textsize" role="group" aria-label="글씨 크기">
      <span className="textsize-label">글씨 크기</span>
      {FONT_STEPS.map((s, i) => (
        <button key={s.label} type="button" className={i === step ? 'on' : ''} aria-pressed={i === step} onClick={() => pick(i)}>
          {s.label}
        </button>
      ))}
    </div>
  )
}

export function Page({ title, children, wide }: { title?: string; children: ReactNode; wide?: boolean }) {
  const nav = useNavigate()
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  const home = pathname === '/app'
  return (
    <div className="shell">
      <header className="top">
        {home ? <div className="brand">{clinic.name}</div> : (
          <button type="button" className="back" onClick={() => nav(-1)}>← 뒤로</button>
        )}
        {!home && <Link to="/app" className="brand small">{clinic.name}</Link>}
      </header>
      <TextSizeControl />
      <main className={wide ? 'main wide' : 'main'}>
        {title && <h1 className="h1">{title}</h1>}
        {children}
      </main>
    </div>
  )
}

export function BigButton({ to, href, icon, label, sub, tone = 'green' }: {
  to?: string
  href?: string
  icon: string
  label: string
  sub?: string
  tone?: 'green' | 'sand' | 'leaf'
}) {
  const inner = (
    <>
      <span className="bb-icon" aria-hidden="true">{icon}</span>
      <span className="bb-text">
        <span className="bb-label">{label}</span>
        {sub && <span className="bb-sub">{sub}</span>}
      </span>
    </>
  )
  if (href) return <a className={`bigbtn ${tone}`} href={href}>{inner}</a>
  return <Link className={`bigbtn ${tone}`} to={to ?? '/'}>{inner}</Link>
}

/** 사진이 없으면 따뜻한 색 자리표시를 보여줍니다. public/images 에 사진을 넣고 경로를 지정하세요. */
export function Photo({ src, label, round }: { src?: string; label: string; round?: boolean }) {
  const [broken, setBroken] = useState(false)
  if (src && !broken) return <img className={round ? 'photo round' : 'photo'} src={src} alt={label} loading="lazy" onError={() => setBroken(true)} />
  return (
    <div className={round ? 'photo ph round' : 'photo ph'} role="img" aria-label={`${label} 사진 자리`}>
      <span>{label}</span>
      <small>사진 자리</small>
    </div>
  )
}

export function Stepper({ step }: { step: 1 | 2 | 3 }) {
  const items = ['날짜', '시간', '확인']
  return (
    <ol className="stepper" aria-label="예약 단계">
      {items.map((t, i) => (
        <li key={t} className={i + 1 === step ? 'on' : i + 1 < step ? 'done' : ''} aria-current={i + 1 === step ? 'step' : undefined}>
          <b>{i + 1}</b> {t}
        </li>
      ))}
    </ol>
  )
}

export function PrivacyText() {
  return (
    <div className="privacy">
      <p><b>1. 수집 항목</b> 이름, 전화번호, 예약 날짜와 시간, 선택한 진료 항목</p>
      <p><b>2. 이용 목적</b> 진료 예약 확인과 확정·변경·취소 안내</p>
      <p><b>3. 보관 기간</b> 예약일로부터 3개월 (이후 자동 삭제). 삭제를 요청하시면 바로 삭제합니다.</p>
      <p><b>4. 동의하지 않을 권리</b> 동의하지 않으셔도 되지만, 이 경우 온라인으로는 예약하실 수 없고 전화 예약만 가능합니다.</p>
      <p><b>5. 보관 위치</b> 홈페이지 서버(Cloudflare, 국외 서버를 이용할 수 있음)</p>
      <p><b>6. 문의</b> {clinic.name} {clinic.phone}</p>
      <p className="muted">※ 증상·질병 등 건강 정보는 앱에서 수집하지 않습니다.</p>
    </div>
  )
}

export function Msg({ kind, children }: { kind: 'error' | 'ok' | 'info'; children: ReactNode }) {
  return <div className={`msg ${kind}`} role={kind === 'error' ? 'alert' : 'status'}>{children}</div>
}
