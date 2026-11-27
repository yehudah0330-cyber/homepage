import { Link } from 'react-router-dom'
import { Photo, TextSizeControl } from '../components/ui'
import { clinic } from '../config/clinic'
import { DAY_NAMES, prettyDate, todayISO } from '../lib/date'
import { Icon } from '../site/Icon'
import { InstallCard } from './AppShell'
import { useToday } from './useToday'

const tel = `tel:${clinic.phone.replace(/\D/g, '')}`
const ORDER = [1, 2, 3, 4, 5, 6, 0]

export default function AppInfo() {
  const { closed } = useToday()
  const q = encodeURIComponent(clinic.mapQuery)
  const today = new Date().getDay()
  const upcoming = Object.entries({ ...clinic.closedHolidays, ...closed }).filter(([k]) => k >= todayISO()).sort(([a], [b]) => a.localeCompare(b)).slice(0, 4)

  return (
    <main className="ap-body top">
      <h1>오시는 길</h1>
      <p className="ap-lead">{clinic.address}</p>
      <Photo src="/images/hero.jpg" label="따뜻한 빛이 드는 방" />
      <div className="ap-two">
        <a className="ap-btn dark" href={`https://map.naver.com/p/search/${q}`} target="_blank" rel="noopener noreferrer"><Icon name="pin" />네이버지도</a>
        <a className="ap-btn line" href={`https://map.kakao.com/link/search/${q}`} target="_blank" rel="noopener noreferrer">카카오맵</a>
      </div>
      <a className="ap-btn line wide" href={tel}><Icon name="phone" />{clinic.phone}</a>

      <section className="ap-card">
        <h2>진료시간</h2>
        <table>
          <tbody>
            {ORDER.map((d) => {
              const h = clinic.hours[d]
              return (
                <tr key={d} className={d === today ? 'now' : ''}>
                  <th scope="row">{DAY_NAMES[d]}요일{d === today && <i>오늘</i>}</th>
                  <td>{h ? <>{h.open} ~ {h.close}{h.night && <small>야간진료</small>}</> : '휴진'}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
        <p>점심시간 {clinic.hours[1]?.lunchStart}~{clinic.hours[1]?.lunchEnd} (토요일은 점심시간 없음)</p>
        <p>{clinic.holidayNote}</p>
        {upcoming.length > 0 && (
          <>
            <h3>다가오는 휴진일</h3>
            <ul>{upcoming.map(([k, why]) => <li key={k}>{prettyDate(k)} {why}</li>)}</ul>
          </>
        )}
      </section>

      <section className="ap-card">
        <h2>교통과 주차</h2>
        {[...clinic.directions.subway, ...clinic.directions.bus, ...clinic.directions.parking].map((t) => <p key={t}>{t}</p>)}
      </section>

      <InstallCard />

      <section className="ap-card">
        <h2>글씨 크기</h2>
        <TextSizeControl />
      </section>

      <p className="ap-links">
        <Link to="/">홈페이지 보기</Link>
        <Link to="/doctor">의료진 소개</Link>
        <a href="https://blog.naver.com/caccactus" target="_blank" rel="noopener noreferrer">네이버 블로그</a>
        <Link to="/privacy">개인정보 처리 안내</Link>
      </p>
    </main>
  )
}
