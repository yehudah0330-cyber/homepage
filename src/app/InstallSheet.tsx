// QR 등으로 앱에 들어오면 아래에서 올라오는 큰 설치 안내창.
// 설치는 휴대폰 규칙상 사용자가 직접 눌러야 합니다. 닫으면 다시 뜨지 않습니다. (주소 끝에 ?install=1 이면 항상 보임)
import { useEffect, useRef, useState } from 'react'
import { useInstall } from './install'

const KEY = 'hw:install-closed'
const closedBefore = () => {
  try {
    return localStorage.getItem(KEY) === '1'
  } catch {
    return false
  }
}

function ShareIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 15V3 M8 7l4-4 4 4 M7 11H5v10h14V11h-2" />
    </svg>
  )
}

export default function InstallSheet() {
  const { state, install } = useInstall()
  const [open, setOpen] = useState(false)
  const first = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const forced = new URLSearchParams(window.location.search).get('install') === '1'
    const phone = window.matchMedia('(pointer: coarse)').matches
    // 예약하러 온 사람(예약 QR 등)에게는 설치창으로 가리지 않습니다
    const booking = window.location.pathname === '/reserve'
    if (!forced && (!phone || booking || closedBefore())) return
    // 안드로이드의 설치 신호가 도착할 시간을 잠깐 기다립니다
    const t = setTimeout(() => setOpen(true), 1300)
    return () => clearTimeout(t)
  }, [])

  const close = () => {
    setOpen(false)
    try {
      localStorage.setItem(KEY, '1')
    } catch {
      /* 저장할 수 없으면 다음에 다시 보입니다 */
    }
  }

  const shown = open && state !== null && state !== 'app'
  useEffect(() => {
    if (!shown) return
    first.current?.focus()
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && close()
    window.addEventListener('keydown', esc)
    return () => window.removeEventListener('keydown', esc)
  }, [shown])

  if (!shown) return null
  const kakao = /KAKAOTALK/i.test(navigator.userAgent)
  const samsung = /SamsungBrowser/i.test(navigator.userAgent)

  return (
    <div className="ap-sheet-back" onClick={(e) => e.target === e.currentTarget && close()}>
      <div className="ap-sheet" role="dialog" aria-modal="true" aria-labelledby="ap-sheet-title" ref={first} tabIndex={-1}>
        <img src="/icons/icon-192.png" alt="" width="72" height="72" />
        <h2 id="ap-sheet-title">{state === 'done' ? '설치했습니다' : '앱으로 설치하세요'}</h2>

        {state === 'done' && <p>휴대폰 홈 화면의 <b>부부</b> 아이콘을 눌러 열어 주세요.</p>}

        {state === 'prompt' && (
          <>
            <p>아래 버튼을 누른 뒤, 확인 창에서 <b>설치</b>를 눌러 주세요.</p>
            <button type="button" className="ap-sheet-go" onClick={install}>설치하기</button>
          </>
        )}

        {state === 'ios' && (
          <>
            <ol>
              <li><span>화면 아래의 <b>공유</b> 버튼<i className="ap-share"><ShareIcon /></i>을 누르세요<small>안 보이면 <b>···</b> 을 먼저 누르세요</small></span></li>
              <li><span><b>홈 화면에 추가</b>를 누르세요<small>안 보이면 위로 밀어 보세요</small></span></li>
              <li><span>오른쪽 위 <b>추가</b>를 누르세요</span></li>
            </ol>
            <p className="ap-arrow" aria-hidden="true">↓</p>
          </>
        )}

        {state === 'inapp' && (
          <>
            <p>지금 화면에서는 설치할 수 없습니다. <b>다른 브라우저로 열어</b> 주세요.</p>
            {kakao
              ? <a className="ap-sheet-go" href={`kakaotalk://web/openExternal?url=${encodeURIComponent('https://bubuhani.com/app?install=1')}`}>다른 브라우저로 열기</a>
              : <p>오른쪽 위(또는 아래)의 <b>점 세 개</b> → <b>다른 브라우저로 열기</b>를 누르세요.</p>}
          </>
        )}

        {state === 'manual' && samsung && (
          <ol>
            <li><span>주소창의 <b>설치 아이콘</b>이 있으면 누르세요</span></li>
            <li><span>없으면 아래의 <b>메뉴(≡)</b> → <b>현재 페이지 추가</b> → <b>홈 화면</b>을 누르세요</span></li>
          </ol>
        )}

        {state === 'manual' && !samsung && (
          <ol>
            <li><span><b>크롬</b>에서 오른쪽 위 <b>점 세 개</b>를 누르세요</span></li>
            <li><span><b>앱 설치</b> 또는 <b>홈 화면에 추가</b>를 누르세요</span></li>
            <li><span><b>설치</b>를 누르세요</span></li>
          </ol>
        )}

        <button type="button" className="ap-sheet-close" onClick={close}>{state === 'done' ? '확인' : '다음에 할게요'}</button>
      </div>
    </div>
  )
}
