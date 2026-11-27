import { useSearchParams, Link } from 'react-router-dom'
import { Photo } from '../components/ui'
import { clinic } from '../config/clinic'
import { Icon } from '../site/Icon'
import { pic } from './pic'

export default function AppCare() {
  const [params] = useSearchParams()
  const open = params.get('open')
  return (
    <main className="ap-body top">
      <h1>진료 안내</h1>
      <p className="ap-lead">치료 방법과 비용은 진료 때 자세히 설명드립니다.</p>
      <div className="ap-acc">
        {clinic.services.map((s) => (
          <details key={s.id} open={s.id === open}>
            <summary>
              <Photo src={pic(s.image)} label="" />
              <span><b>{s.title}</b><small>{s.summary}</small></span>
            </summary>
            <div className="ap-acc-body">
              <h2>이런 분께 권합니다</h2>
              <ul>{s.points.map((p) => <li key={p}>{p}</li>)}</ul>
              <Link className="ap-btn dark" to={`/reserve?care=${s.id}`}><Icon name="calendar" />{s.title} 예약하기</Link>
            </div>
          </details>
        ))}
      </div>
    </main>
  )
}
