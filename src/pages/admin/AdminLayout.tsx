import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { Link, Navigate, NavLink, Outlet, useLocation } from 'react-router-dom'
import { Msg } from '../../components/ui'
import { clinic } from '../../config/clinic'
import { booking } from '../../data/booking'

// 로그인 확인은 서버가 합니다. 이 화면만 열어서는 아무 정보도 볼 수 없습니다.
export default function AdminLayout() {
  const [state, setState] = useState<'loading' | 'out' | 'in'>('loading')
  const [ready, setReady] = useState(true)
  const [pw, setPw] = useState('')
  const [remember, setRemember] = useState(true)
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const [role, setRole] = useState<'owner' | 'staff1' | 'staff2' | null>(null)
  const { pathname } = useLocation()

  const check = useCallback(
    () => booking.session().then((s) => { setReady(s.ready); setRole(s.role); setState(s.admin ? 'in' : 'out') }).catch((e: Error) => { setErr(e.message); setState('out') }),
    []
  )
  useEffect(() => {
    document.title = `관리자 | ${clinic.name}`
    check()
  }, [check])

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setErr('')
    try {
      await booking.login(pw, remember)
      setPw('')
      await check()
    } catch (x) {
      setErr((x as Error).message)
    } finally {
      setBusy(false)
    }
  }

  if (state === 'loading') return <div className="shell"><main className="main"><p className="muted">확인 중…</p></main></div>
  if (state === 'out') {
    return (
      <div className="shell">
        <main className="main">
          <h1 className="h1">직원 로그인</h1>
          {!ready && <Msg kind="info">관리자 비밀번호가 아직 설정되지 않았습니다. Cloudflare에서 비밀값 ADMIN_PASSWORD(8자 이상)를 먼저 등록해 주세요.</Msg>}
          <form onSubmit={submit}>
            <label className="field">비밀번호
              <input type="password" autoComplete="current-password" value={pw} onChange={(e) => setPw(e.target.value)} autoFocus />
            </label>
            <label className="adm-check"><input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} /> 이 기기에서 30일 동안 로그인 유지 (공용 컴퓨터에서는 끄세요)</label>
            {err && <Msg kind="error">{err}</Msg>}
            <button type="submit" className="btn primary" disabled={busy || !pw}>들어가기</button>
          </form>
          <Link className="linkbtn center" to="/">환자 화면으로</Link>
        </main>
      </div>
    )
  }
  const owner = role === 'owner'
  // 직원 계정은 예약 화면만 씁니다 (서버에서도 막습니다)
  if (!owner && pathname !== '/admin') return <Navigate to="/admin" replace />
  return (
    <div className="shell admin">
      <header className="top">
        <div className="brand">{clinic.name} 관리{!owner && <span className="adm-role">직원 {role === 'staff2' ? 2 : 1}</span>}</div>
        <button type="button" className="back" onClick={async () => { await booking.logout(); setState('out') }}>로그아웃</button>
      </header>
      <nav className="tabs" aria-label="관리 메뉴">
        <NavLink to="/admin" end>예약</NavLink>
        {owner && (
          <>
            <NavLink to="/admin/closed">휴진일</NavLink>
            <NavLink to="/admin/notices">공지</NavLink>
            <NavLink to="/admin/columns">칼럼</NavLink>
          </>
        )}
      </nav>
      <main className="main wide">
        <Outlet />
        {owner && <button type="button" className="linkbtn center" onClick={async () => { if (window.confirm('모든 휴대폰과 컴퓨터에서 로그아웃합니다. 계속할까요?')) { await booking.logoutAll(); setState('out') } }}>모든 기기에서 로그아웃</button>}
      </main>
    </div>
  )
}
