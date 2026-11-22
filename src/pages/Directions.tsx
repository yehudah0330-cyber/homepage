import { useState } from 'react'
import { Page } from '../components/ui'
import { clinic } from '../config/clinic'

export default function Directions() {
  const [copied, setCopied] = useState(false)
  const q = encodeURIComponent(clinic.mapQuery)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(clinic.address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      window.prompt('주소를 길게 눌러 복사하세요', clinic.address)
    }
  }
  const d = clinic.directions
  return (
    <Page title="오시는 길">
      <div className="card">
        <p className="big">{clinic.address}</p>
        <button type="button" className="btn ghost" onClick={copy}>{copied ? '복사했어요 ✓' : '주소 복사하기'}</button>
      </div>
      <div className="two">
        <a className="btn primary" href={`https://map.naver.com/p/search/${q}`} target="_blank" rel="noopener noreferrer">네이버지도로 보기</a>
        <a className="btn primary alt" href={`https://map.kakao.com/link/search/${q}`} target="_blank" rel="noopener noreferrer">카카오맵으로 보기</a>
      </div>
      {d.parking.length > 0 && <section className="card"><h2>🚗 주차 안내</h2><ul>{d.parking.map((t) => <li key={t}>{t}</li>)}</ul></section>}
      {d.subway.length > 0 && <section className="card"><h2>🚇 지하철</h2><ul>{d.subway.map((t) => <li key={t}>{t}</li>)}</ul></section>}
      {d.bus.length > 0 && <section className="card"><h2>🚌 버스</h2><ul>{d.bus.map((t) => <li key={t}>{t}</li>)}</ul></section>}
      {d.parking.length + d.subway.length + d.bus.length === 0 && (
        <p className="card">주차·대중교통 안내는 준비 중입니다. 궁금하신 점은 전화({clinic.phone})로 문의해 주세요.</p>
      )}
    </Page>
  )
}
