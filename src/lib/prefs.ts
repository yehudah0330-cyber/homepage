// 이 기기에 기억해 두는 값들 (글씨 크기, 이름·전화번호)
const get = (k: string) => {
  try {
    return localStorage.getItem(k)
  } catch {
    return null
  }
}
const set = (k: string, v: string) => {
  try {
    localStorage.setItem(k, v)
  } catch {
    /* ignore */
  }
}

export const FONT_STEPS = [
  { label: '보통', scale: 1 },
  { label: '크게', scale: 1.2 },
  { label: '아주 크게', scale: 1.45 }
]

export function getFontStep(): number {
  const n = Number(get('hw:font'))
  return n >= 0 && n < FONT_STEPS.length ? n : 0
}
export function applyFontStep(step: number) {
  document.documentElement.style.setProperty('--fs', String(FONT_STEPS[step].scale))
}
export function setFontStep(step: number) {
  set('hw:font', String(step))
  applyFontStep(step)
}

export type Me = { name: string; phone: string }
export function getMe(): Me {
  try {
    const v = get('hw:me')
    return v ? (JSON.parse(v) as Me) : { name: '', phone: '' }
  } catch {
    return { name: '', phone: '' }
  }
}
export function setMe(me: Me) {
  set('hw:me', JSON.stringify(me))
}

export const isAdmin = () => {
  try {
    return sessionStorage.getItem('hw:admin') === '1'
  } catch {
    return false
  }
}
export const setAdmin = (on: boolean) => {
  try {
    if (on) sessionStorage.setItem('hw:admin', '1')
    else sessionStorage.removeItem('hw:admin')
  } catch {
    /* ignore */
  }
}
