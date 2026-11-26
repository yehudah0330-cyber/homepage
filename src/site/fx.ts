// 홈페이지의 움직임. 모두 브라우저에서만 동작하고, "움직임 줄이기"를 켠 기기에서는 쉽니다.
// 자바스크립트가 없어도 내용은 그대로 보입니다 (검색 로봇, 미리 만든 HTML).
import { useEffect, type RefObject } from 'react'

const still = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
const fine = () => window.matchMedia('(hover: hover) and (pointer: fine)').matches
const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v))

/** 스크롤 연동: [data-reveal] 나타나기, [data-scrub] 구간 진행률(--p), [data-steps] 단계 켜기 */
export function useScrollFx(root: RefObject<HTMLElement>, deps: unknown[] = []) {
  useEffect(() => {
    const el = root.current
    if (!el || still()) return
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue
        e.target.classList.add('in')
        io.unobserve(e.target)
      }
    }, { rootMargin: '0px 0px -8% 0px' })
    el.querySelectorAll<HTMLElement>('[data-reveal]:not(.in)').forEach((n) => {
      // 처음부터 화면에 보이는 것은 숨기지 않습니다
      if (!n.classList.contains('rv') && n.getBoundingClientRect().top < window.innerHeight * 0.9) return
      n.classList.add('rv')
      io.observe(n)
    })

    let raf = 0
    const paint = () => {
      raf = 0
      const vh = window.innerHeight
      el.querySelectorAll<HTMLElement>('[data-scrub]').forEach((n) => {
        const r = n.getBoundingClientRect()
        // 위쪽이 화면 아래에서 올라와, 아래쪽이 화면 중간에 닿을 때까지 0 → 1
        const p = clamp((vh * 0.82 - r.top) / (r.height + vh * 0.22))
        n.style.setProperty('--p', p.toFixed(4))
        const steps = n.querySelectorAll<HTMLElement>('[data-step]')
        steps.forEach((s, i) => s.classList.toggle('lit', p >= (i + 0.35) / steps.length))
        if (steps.length) n.classList.add('scrubbing')
      })
      el.querySelectorAll<HTMLElement>('[data-parallax]').forEach((n) => {
        const r = n.parentElement!.getBoundingClientRect()
        if (r.bottom < 0 || r.top > vh) return
        const mid = (r.top + r.height / 2 - vh / 2) / vh
        n.style.setProperty('--shift', `${(mid * Number(n.dataset.parallax)).toFixed(1)}px`)
      })
    }
    const ask = () => { if (!raf) raf = requestAnimationFrame(paint) }
    paint()
    window.addEventListener('scroll', ask, { passive: true })
    window.addEventListener('resize', ask)
    return () => {
      io.disconnect()
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', ask)
      window.removeEventListener('resize', ask)
    }
  }, deps) // eslint-disable-line react-hooks/exhaustive-deps
}

/** 마우스 반응: 카드 기울기·빛(.cx-tilt), 끌려오는 버튼(.cx-magnet) */
export function usePointerFx(root: RefObject<HTMLElement>) {
  useEffect(() => {
    const el = root.current
    if (!el || still() || !fine()) return
    let last: HTMLElement | null = null
    const rest = (n: HTMLElement) => ['--rx', '--ry', '--tx', '--ty'].forEach((k) => n.style.removeProperty(k))
    const move = (e: PointerEvent) => {
      const n = (e.target as Element).closest<HTMLElement>('.cx-tilt, .cx-magnet')
      if (last && last !== n) rest(last)
      last = n
      if (!n) return
      const r = n.getBoundingClientRect()
      const x = (e.clientX - r.left) / r.width
      const y = (e.clientY - r.top) / r.height
      if (n.classList.contains('cx-tilt')) {
        n.style.setProperty('--mx', `${(x * 100).toFixed(1)}%`)
        n.style.setProperty('--my', `${(y * 100).toFixed(1)}%`)
        n.style.setProperty('--rx', `${((0.5 - y) * 6).toFixed(2)}deg`)
        n.style.setProperty('--ry', `${((x - 0.5) * 8).toFixed(2)}deg`)
      } else {
        n.style.setProperty('--tx', `${((x - 0.5) * 12).toFixed(1)}px`)
        n.style.setProperty('--ty', `${((y - 0.5) * 8).toFixed(1)}px`)
      }
    }
    const leave = () => { if (last) rest(last); last = null }
    el.addEventListener('pointermove', move)
    el.addEventListener('pointerleave', leave)
    return () => {
      el.removeEventListener('pointermove', move)
      el.removeEventListener('pointerleave', leave)
    }
  }, [root])
}

// 사진(hero.jpg) 속 찻잔 입구의 위치. 사진을 바꾸면 이 값도 바꿔야 합니다.
const CUP = { w: 1920, h: 1072, x: 962, y: 812, mouth: 205 }

/** 첫 화면: 찻잔에서 김이 오르고, 마우스를 따라 사진과 빛이 천천히 움직입니다. */
export function useHeroScene(hero: RefObject<HTMLElement>, canvas: RefObject<HTMLCanvasElement>) {
  useEffect(() => {
    const box = hero.current
    const cv = canvas.current
    const img = box?.querySelector<HTMLImageElement>('.cx-photo')
    const g = cv?.getContext('2d')
    if (!box || !cv || !img || !g || still()) return

    const puff = document.createElement('canvas')
    puff.width = puff.height = 128
    const pg = puff.getContext('2d')!
    const grad = pg.createRadialGradient(64, 64, 0, 64, 64, 64)
    grad.addColorStop(0, 'rgba(255,250,238,.9)')
    grad.addColorStop(0.45, 'rgba(255,246,226,.28)')
    grad.addColorStop(1, 'rgba(255,244,220,0)')
    pg.fillStyle = grad
    pg.fillRect(0, 0, 128, 128)

    type P = { t: number; life: number; off: number; phase: number; size: number }
    const born = (t = 0): P => ({ t, life: 3.6 + Math.random() * 2.6, off: Math.random() - 0.5, phase: Math.random() * 6.28, size: 0.7 + Math.random() * 0.8 })
    const puffs = Array.from({ length: 70 }, () => { const p = born(); p.t = Math.random() * p.life; return p })

    let wind = 0
    let aim = { x: 0, y: 0 }
    const at = { x: 0, y: 0 }
    const move = (e: PointerEvent) => {
      const r = box.getBoundingClientRect()
      aim = { x: (e.clientX - r.left) / r.width - 0.5, y: (e.clientY - r.top) / r.height - 0.5 }
      box.style.setProperty('--gx', `${e.clientX - r.left}px`)
      box.style.setProperty('--gy', `${e.clientY - r.top}px`)
    }
    if (fine()) box.addEventListener('pointermove', move)

    let raf = 0
    let prev = 0
    let seen = true
    const frame = (now: number) => {
      raf = 0
      if (!seen || document.hidden) return
      const dt = Math.min(0.05, prev ? (now - prev) / 1000 : 0.016)
      prev = now
      at.x += (aim.x - at.x) * 0.04
      at.y += (aim.y - at.y) * 0.04
      wind += (aim.x * 40 - wind) * 0.02
      const r = box.getBoundingClientRect()
      box.style.setProperty('--px', `${(-at.x * 18).toFixed(2)}px`)
      box.style.setProperty('--py', `${(-at.y * 12 + Math.max(0, -r.top) * 0.22).toFixed(2)}px`)

      const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
      const W = Math.round(r.width * dpr)
      const H = Math.round(r.height * dpr)
      if (cv.width !== W || cv.height !== H) { cv.width = W; cv.height = H }
      g.setTransform(dpr, 0, 0, dpr, 0, 0)
      g.clearRect(0, 0, r.width, r.height)

      // object-fit: cover 로 늘어난 사진에서 찻잔이 화면 어디에 있는지 계산
      const ir = img.getBoundingClientRect()
      const s = Math.max(ir.width / CUP.w, ir.height / CUP.h)
      const cx = ir.left - r.left + (ir.width - CUP.w * s) / 2 + CUP.x * s
      const cy = ir.top - r.top + (ir.height - CUP.h * s) / 2 + CUP.y * s
      const mouth = CUP.mouth * s

      g.globalCompositeOperation = 'lighter'
      for (let i = 0; i < puffs.length; i++) {
        let p = puffs[i]
        p.t += dt
        if (p.t > p.life) p = puffs[i] = born()
        const k = p.t / p.life
        const rise = mouth * 2.3 * k
        const sway = Math.sin(p.phase + k * 5.5) * mouth * 0.28 * k
        const x = cx + p.off * mouth * (0.55 + k * 0.5) + sway + wind * k * k
        const y = cy - rise
        const d = mouth * (0.28 + k * 0.85) * p.size
        g.globalAlpha = Math.sin(Math.PI * Math.pow(k, 0.55)) * 0.12
        g.drawImage(puff, x - d * 0.36, y - d * 0.8, d * 0.72, d * 1.6)
      }
      g.globalAlpha = 1
      raf = requestAnimationFrame(frame)
    }
    const play = () => { if (!raf) { prev = 0; raf = requestAnimationFrame(frame) } }
    const io = new IntersectionObserver(([e]) => { seen = e.isIntersecting; if (seen) play() })
    io.observe(box)
    document.addEventListener('visibilitychange', play)
    play()
    return () => {
      cancelAnimationFrame(raf)
      io.disconnect()
      document.removeEventListener('visibilitychange', play)
      box.removeEventListener('pointermove', move)
    }
  }, [hero, canvas])
}

/** 맨 위 진행 막대와, 스크롤하면 얇아지는 머리글 */
export function useHeaderFx() {
  useEffect(() => {
    let raf = 0
    const paint = () => {
      raf = 0
      const d = document.documentElement
      const max = d.scrollHeight - d.clientHeight
      d.style.setProperty('--read', max > 0 ? clamp(window.scrollY / max).toFixed(4) : '0')
      d.classList.toggle('scrolled', window.scrollY > 24)
    }
    const ask = () => { if (!raf) raf = requestAnimationFrame(paint) }
    paint()
    window.addEventListener('scroll', ask, { passive: true })
    window.addEventListener('resize', ask)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', ask)
      window.removeEventListener('resize', ask)
      document.documentElement.classList.remove('scrolled')
    }
  }, [])
}
