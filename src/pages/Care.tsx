import { Link } from 'react-router-dom'
import { Page, Photo } from '../components/ui'
import { clinic } from '../config/clinic'

export default function Care() {
  return (
    <Page title="진료 안내">
      {clinic.services.map((s) => (
        <article key={s.id} className="card service">
          <Photo src={s.image} label={s.title} />
          <h2>{s.title}</h2>
          <p className="big">{s.summary}</p>
          <ul>{s.points.map((p) => <li key={p}>{p}</li>)}</ul>
        </article>
      ))}
      <Link className="btn primary" to="/reserve">예약하기</Link>
    </Page>
  )
}
