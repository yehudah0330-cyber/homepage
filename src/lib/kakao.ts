// 카카오 간편 로그인. VITE_KAKAO_JS_KEY 가 없으면 사용할 수 없는 상태로 둡니다.
// 카카오 개발자 콘솔에서 앱 등록 → JavaScript 키 발급 → 사이트 도메인 등록 → 카카오 로그인 활성화 후 사용하세요.
const KEY = import.meta.env.VITE_KAKAO_JS_KEY as string | undefined

export const kakaoEnabled = Boolean(KEY)

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type K = any

function loadSdk(): Promise<K> {
  const w = window as unknown as { Kakao?: K }
  if (w.Kakao) return Promise.resolve(w.Kakao)
  return new Promise((resolve, reject) => {
    const s = document.createElement('script')
    s.src = 'https://t1.kakaocdn.net/kakao_js_sdk/2.7.4/kakao.min.js'
    s.onload = () => resolve((window as unknown as { Kakao: K }).Kakao)
    s.onerror = () => reject(new Error('카카오를 불러오지 못했어요.'))
    document.head.appendChild(s)
  })
}

/** 카카오 로그인 후 닉네임(이름)을 돌려줍니다. 전화번호는 직접 입력받습니다. */
export async function kakaoLoginName(): Promise<string> {
  if (!KEY) throw new Error('카카오 로그인은 아직 설정되지 않았어요. 이름과 전화번호로 예약해 주세요.')
  const Kakao = await loadSdk()
  if (!Kakao.isInitialized()) Kakao.init(KEY)
  await new Promise<void>((resolve, reject) =>
    Kakao.Auth.login({ success: () => resolve(), fail: () => reject(new Error('카카오 로그인을 취소했어요.')) })
  )
  const me = await Kakao.API.request({ url: '/v2/user/me' })
  return (me?.kakao_account?.profile?.nickname as string) ?? ''
}
