// 배포(빌드) 때 각 페이지를 미리 완성된 HTML 로 만들기 위한 파일입니다. (검색 로봇이 본문을 바로 읽을 수 있게)
import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router-dom/server'
import { Route, Routes } from 'react-router-dom'
import { clinic } from './config/clinic'
import SiteLayout from './site/SiteLayout'
import SiteHome from './site/Home'
import { ColumnList, DoctorPage, HoursPage, LocationPage, Treatment } from './site/Pages'

export function render(url: string) {
  return renderToString(
    <StaticRouter location={url}>
      <Routes>
        <Route element={<SiteLayout />}>
          <Route path="/" element={<SiteHome />} />
          <Route path="/about/doctor" element={<DoctorPage />} />
          <Route path="/about/hours" element={<HoursPage />} />
          <Route path="/about/location" element={<LocationPage />} />
          <Route path="/treatment/:id" element={<Treatment />} />
          <Route path="/column" element={<ColumnList />} />
        </Route>
      </Routes>
    </StaticRouter>
  )
}

const where = '수원시 영통구 망포동'
export function pages(): { url: string; title: string; description: string }[] {
  const n = clinic.name
  return [
    { url: '/', title: `${n} | 수원 영통구 망포 한의원 · 침 · 약침 · 한약 · 다이어트`, description: `${where} ${n}입니다. 침, 약침, 한약, 체중 관리 진료. 월·수·금 저녁 8시까지 야간진료. ${clinic.phone}` },
    { url: '/about/doctor', title: `의료진 소개 | ${n} 수원 영통구 한의원`, description: `${n} 의료진 소개와 진료 철학을 안내합니다.` },
    { url: '/about/hours', title: `진료시간 | ${n} 수원 영통구 한의원`, description: `${n} 진료시간. 월·수·금 저녁 8시까지 야간진료, 점심시간 12시 30분~2시. ${clinic.holidayNote}` },
    { url: '/about/location', title: `오시는 길 | ${n} 수원 영통구 한의원`, description: `${n} 오시는 길. ${clinic.address}, 망포역 3번 출구에서 망포사거리 방향. 전화 ${clinic.phone}` },
    ...clinic.services.map((s) => ({ url: `/treatment/${s.id}`, title: `${s.title} 안내 | ${n} 수원 영통구 한의원`, description: `${n}의 ${s.title}. ${s.summary}` })),
    { url: '/column', title: `원장 칼럼 | ${n} 수원 영통구 한의원`, description: `${n} 원장이 직접 쓰는 건강 이야기.` }
  ]
}
