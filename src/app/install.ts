// 앱 설치(홈 화면에 추가)를 돕습니다. 설치 신호는 화면이 그려지기 전에 올 수 있어 여기서 미리 받아 둡니다.
import { useEffect, useState } from 'react'

type PromptEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> }

let saved: PromptEvent | null = null
let installed = false
const listeners = new Set<() => void>()
const ping = () => listeners.forEach((f) => f())

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    saved = e as PromptEvent
    ping()
  })
  window.addEventListener('appinstalled', () => {
    saved = null
    installed = true
    ping()
  })
}

export type InstallKind = 'app' | 'done' | 'prompt' | 'inapp' | 'ios' | 'manual'

function kind(): InstallKind {
  if (window.matchMedia('(display-mode: standalone)').matches || (navigator as { standalone?: boolean }).standalone) return 'app'
  if (installed) return 'done'
  const ua = navigator.userAgent
  // 카카오톡·네이버 같은 앱 안에서 연 화면에서는 설치할 수 없습니다
  if (/KAKAOTALK|NAVER\(inapp|Instagram|FBAN|FBAV|Line\//i.test(ua)) return 'inapp'
  if (saved) return 'prompt'
  if (/iPhone|iPad|iPod/i.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)) return 'ios'
  return 'manual'
}

export function useInstall() {
  const [state, setState] = useState<InstallKind | null>(null)
  useEffect(() => {
    const update = () => setState(kind())
    update()
    listeners.add(update)
    return () => { listeners.delete(update) }
  }, [])
  const install = async () => {
    const e = saved
    if (!e) return
    await e.prompt()
    await e.userChoice
    saved = null
    ping()
  }
  return { state, install }
}
