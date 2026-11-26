// 자주 묻는 질문. 홈페이지에 보이는 글과 검색엔진용 정보(FAQPage)가 이 목록 하나를 같이 씁니다.
// 의료광고 규정: 효과 보장, 후기, 다른 곳과의 비교는 넣지 않습니다.
import { clinic } from './clinic'

const lunch = clinic.hours[1]

export const faq: { q: string; a: string }[] = [
  { q: `${clinic.name}은 어디에 있나요?`, a: `${clinic.address}에 있습니다. ${clinic.directions.subway.join(' ')}` },
  { q: '진료시간은 어떻게 되나요?', a: '월·수·금은 오전 9시 30분부터 저녁 8시까지, 화·목은 오전 9시 30분부터 저녁 7시까지, 토요일은 오전 9시 30분부터 오후 1시까지 진료합니다. 일요일은 쉽니다.' },
  { q: '야간진료를 하나요?', a: '네. 월·수·금은 저녁 8시까지 야간진료를 합니다.' },
  { q: '점심시간은 언제인가요?', a: `${lunch?.lunchStart}~${lunch?.lunchEnd}입니다. 토요일은 점심시간 없이 진료합니다.` },
  { q: '공휴일에도 진료하나요?', a: clinic.holidayNote },
  { q: '주차할 수 있나요?', a: clinic.directions.parking.join(' ') },
  { q: '어떤 진료를 하나요?', a: '침 치료, 약침 치료, 한약, 다이어트(체중 관리) 진료를 합니다. 치료 방법과 비용은 진료 때 자세히 설명드립니다.' },
  { q: '문의는 어떻게 하나요?', a: `전화 ${clinic.phone}로 문의해 주세요.` }
]
