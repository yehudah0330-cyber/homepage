import { useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { clinic } from '../../config/clinic'
import { isAdmin, setAdmin } from '../../lib/prefs'
import { Msg } from '../../components/ui'

// ⚠ 데모용 PIN 입니다. 브라우저에 들어 있는 값이라 보안이 아닙니다.
// 실제 운영(Cloudflare 연결) 시에는 서버에서 로그인(Cloudflare Access 등)을 확인하세요.
const SERVER = !['localhost', '127.0.0.1', '[::1]'].includes(location.hostname)
const PIN = (import.meta.env.VITE_ADMIN_PIN as string | undefined) || '1234'

export default function AdminLayout() {
  const [ok, setOk] = useState(SERVER || isAdmin())
  const [pin, setPin] = useState('')
  const [err, setErr] = useState('')

  if (!ok) {
    return (
      <div className="shell">
        <main className="main">
          <h1 className="h1">직원 로그인</h1>
          <label className="field">PIN 번호
            <input type="password" inputMode="numeric" value={pin} onChange={(e) => setPin(e.target.value)} autoFocus />
          </label>
          {err && <Msg kind="error">{err}</Msg>}
          <button type="button" className="btn primary" onClick={() => {
            if (pin === PIN) {
              setAdmin(true)
              setOk(true)
            } else setErr('PIN 번호가 맞지 않아요.')
          }}>들어가기</button>
          <Link className="linkbtn center" to="/">환자 화면으로</Link>
        </main>
      </div>
    )
  }
  return (
    <div className="shell admin">
      <header className="top">
        <div className="brand">{clinic.name} 관리</div>
        {SERVER ? <a className="back" href="/cdn-cgi/access/logout">로그아웃</a> : <button type="button" className="back" onClick={() => { setAdmin(false); setOk(false) }}>로그아웃</button>}
      </header>
      <nav className="tabs" aria-label="관리 메뉴">
        <NavLink to="/admin" end>예약</NavLink>
        <NavLink to="/admin/notices">공지</NavLink>
        <NavLink to="/admin/columns">칼럼</NavLink>
        <NavLink to="/admin/closed">휴진일</NavLink>
        <NavLink to="/admin/alerts">알림</NavLink>
      </nav>
      <main className="main wide"><Outlet /></main>
    </div>
  )
}
