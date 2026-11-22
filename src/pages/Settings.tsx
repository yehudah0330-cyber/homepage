import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Msg, Page } from '../components/ui'
import { api } from '../data/api'
import { validPhone } from '../lib/date'
import { getMe, setMe } from '../lib/prefs'

type BIP = Event & { prompt: () => Promise<void> }

export default function Settings() {
  const [phone, setPhone] = useState(getMe().phone)
  const [on, setOn] = useState<boolean | null>(null)
  const [msg, setMsg] = useState('')
  const [install, setInstall] = useState<BIP | null>(null)
  const ios = /iphone|ipad|ipod/i.test(navigator.userAgent)

  useEffect(() => {
    if (validPhone(phone)) api.isNotifyOn(phone).then(setOn)
    const h = (e: Event) => {
      e.preventDefault()
      setInstall(e as BIP)
    }
    window.addEventListener('beforeinstallprompt', h)
    return () => window.removeEventListener('beforeinstallprompt', h)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const check = async () => {
    setMsg('')
    if (!validPhone(phone)) return setMsg('휴대전화 번호를 확인해 주세요.')
    setMe({ ...getMe(), phone })
    setOn(await api.isNotifyOn(phone))
  }
  const toggle = async () => {
    const next = !on
    await api.setNotifyOn(phone, next)
    setOn(next)
    setMsg(next ? '알림을 켰어요.' : '알림을 껐어요. (예약 확정·변경·취소 안내는 꼭 필요해 계속 보내드려요)')
  }

  return (
    <Page title="설정">
      <section className="card">
        <h2>알림</h2>
        <p>예약 전날 알림과 다음 진료 안내를 받을지 정할 수 있어요.</p>
        <label className="field">휴대전화 번호
          <input value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" placeholder="010-1234-5678" />
        </label>
        <button type="button" className="btn ghost" onClick={check}>내 알림 상태 보기</button>
        {on !== null && (
          <button type="button" className={`switch ${on ? 'on' : ''}`} role="switch" aria-checked={on} onClick={toggle}>
            <span>전날·다음 진료 알림</span><b>{on ? '켜짐' : '꺼짐'}</b>
          </button>
        )}
        {msg && <Msg kind="info">{msg}</Msg>}
      </section>

      <section className="card">
        <h2>홈 화면에 앱 설치</h2>
        {install ? (
          <button type="button" className="btn primary" onClick={() => install.prompt()}>앱 설치하기</button>
        ) : ios ? (
          <p>화면 아래 <b>공유 버튼(□↑)</b>을 누르고 <b>“홈 화면에 추가”</b>를 눌러 주세요.</p>
        ) : (
          <p>브라우저 메뉴(⋮)에서 <b>“앱 설치”</b> 또는 <b>“홈 화면에 추가”</b>를 눌러 주세요.</p>
        )}
      </section>

      <Link className="btn ghost" to="/privacy">개인정보 수집·이용 안내</Link>
      <Link className="linkbtn center" to="/admin">직원용</Link>
    </Page>
  )
}
