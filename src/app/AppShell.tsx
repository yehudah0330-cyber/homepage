import { useEffect } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { Icon } from '../site/Icon'
import { useInstall } from './install'
import InstallSheet from './InstallSheet'

const TABS = [
  { to: '/app', label: '홈', icon: 'home' },
  { to: '/care', label: '진료', icon: 'leaf' },
  { to: '/reserve', label: '예약', icon: 'calendar' },
  { to: '/directions', label: '안내', icon: 'pin' }
] as const

export default function AppShell() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return (
    <div className="ap">
      <div className="ap-page" key={pathname}>
        <Outlet />
      </div>
      <InstallSheet />
      <nav className="ap-tabs" aria-label="앱 메뉴">
        {TABS.map((t) => (
          <NavLink key={t.to} to={t.to} end>
            <Icon name={t.icon} />
            <span>{t.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  )
}

/** 앱 설치 안내. 상황(안드로이드, 아이폰, 카카오톡 안 등)에 맞는 방법을 보여 줍니다. */
export function InstallCard() {
  const { state, install } = useInstall()
  if (!state) return null
  if (state === 'app') return <p className="ap-running">앱으로 실행 중입니다</p>
  if (state === 'done') return <p className="ap-running">설치했습니다. 홈 화면의 아이콘으로 열어 주세요.</p>
  return (
    <section className="ap-install" aria-label="앱 설치">
      <div className="ap-install-top">
        <img src="/icons/icon-192.png" alt="" width="52" height="52" />
        <div>
          <b>앱으로 설치하기</b>
          <span>홈 화면에서 바로 열 수 있어요</span>
        </div>
        {state === 'prompt' && <button type="button" onClick={install}>설치</button>}
      </div>
      {state === 'inapp' && <p>지금은 다른 앱 안에서 열려 있어 설치할 수 없습니다. 오른쪽 아래(또는 위)의 <b>점 세 개</b>를 눌러 <b>다른 브라우저로 열기</b>를 선택해 주세요.</p>}
      {state === 'ios' && (
        <details>
          <summary>아이폰 설치 방법</summary>
          <ol>
            <li><b>사파리</b>로 이 화면을 엽니다.</li>
            <li>아래의 <b>공유</b> 버튼(네모에서 위로 화살표)을 누릅니다. 안 보이면 <b>···</b>을 먼저 누르세요.</li>
            <li><b>홈 화면에 추가</b> → <b>추가</b>를 누릅니다.</li>
          </ol>
        </details>
      )}
      {state === 'manual' && (
        <details>
          <summary>설치 방법</summary>
          <ol>
            <li><b>크롬</b>은 오른쪽 위 <b>점 세 개</b>, <b>삼성 인터넷</b>은 아래 <b>메뉴(≡)</b>를 누릅니다.</li>
            <li><b>앱 설치</b> 또는 <b>홈 화면에 추가</b>를 누릅니다.</li>
          </ol>
        </details>
      )}
    </section>
  )
}
