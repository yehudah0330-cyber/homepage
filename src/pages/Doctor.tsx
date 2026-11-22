import { Page, Photo } from '../components/ui'
import { clinic } from '../config/clinic'

export default function Doctor() {
  const d = clinic.doctor
  return (
    <Page title="한의사 소개">
      <div className="card center">
        <Photo src={d.photo} label={d.name} round />
        <h2>{d.name}</h2>
        {d.title && <p>{d.title}</p>}
      </div>
      {d.career.length > 0 && (
        <section className="card">
          <h2>약력</h2>
          <ul>{d.career.map((c) => <li key={c}>{c}</li>)}</ul>
        </section>
      )}
      {d.philosophy && (
        <section className="card">
          <h2>진료 철학</h2>
          <p className="big quote">“{d.philosophy}”</p>
        </section>
      )}
      {!d.philosophy && d.career.length === 0 && <p className="card">약력과 진료 철학은 곧 안내해 드리겠습니다.</p>}
    </Page>
  )
}
