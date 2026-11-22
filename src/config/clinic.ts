// ★ 한의원 정보는 이 파일 한 곳만 고치면 앱 전체에 반영됩니다. (현재 값은 모두 샘플입니다)
export type DayHours = { open: string; close: string; lunchStart?: string; lunchEnd?: string } | null

const weekday: DayHours = { open: '09:00', close: '18:00', lunchStart: '13:00', lunchEnd: '14:00' }

export const clinic = {
  name: '신영통부부한의원',
  phone: '031-273-0061',
  address: '수원시 영통구 태장로 84, 망포프라자 2층',
  mapQuery: '수원시 영통구 태장로 84 망포프라자',
  // TODO 진료시간: 실제 시간으로 고쳐 주세요 (지금은 임시 값입니다)
  // 요일별 진료시간 (0=일요일 … 6=토요일). null 이면 정기 휴진
  hours: [null, weekday, weekday, weekday, weekday, weekday, { open: '09:00', close: '13:00' }] as DayHours[],
  slotMinutes: 30, // 예약 간격
  capacityPerSlot: 2, // 같은 시간에 받을 수 있는 인원
  bookingDays: 14, // 오늘부터 며칠 앞까지 예약 가능
  // TODO 오시는 길 안내: 문장을 추가하면 홈페이지·앱에 자동으로 나타납니다. 비워 두면 숨겨집니다.
  directions: {
    parking: [] as string[],
    subway: [] as string[],
    bus: [] as string[]
  },
  // image 에 '/images/acu.jpg' 처럼 public/images 안의 사진 경로를 넣으면 사진이 표시됩니다.
  services: [
    { id: 'acu', title: '침 치료', summary: '아픈 곳과 몸의 균형을 맞춰 통증을 줄여 드립니다.', points: ['허리·무릎·어깨 통증', '두통, 어지럼', '일회용 멸균 침만 사용'], image: '/images/acu.jpg' },
    { id: 'chuna', title: '추나 요법', summary: '손으로 굽은 척추와 골반을 바로잡는 치료입니다.', points: ['목·허리 디스크', '골반·자세 교정', '급여 적용 가능한 경우가 있어요'], image: '/images/chuna.jpg' },
    { id: 'herb', title: '한약', summary: '체질과 증상에 맞게 한 분 한 분 지어 드립니다.', points: ['보약, 피로 회복', '소화·수면 문제', '복용이 끝날 때쯤 안내해 드려요'], image: '/images/herb.jpg' },
    { id: 'diet', title: '다이어트', summary: '무리한 굶기 없이 체질에 맞춰 천천히 관리합니다.', points: ['체질 상담', '식사 습관 안내', '한약 + 침 병행'], image: '/images/diet.jpg' }
  ],
  // TODO 원장님 정보: 아래를 채우면 의료진 소개에 나타납니다. 비워 두면 해당 줄은 숨겨집니다.
  doctor: {
    name: '원장',
    photo: '', // 예: '/images/doctor.jpg' (public/images 폴더에 사진을 넣으세요)
    title: '',
    career: [] as string[], // 예: ['OO대학교 한의과대학 졸업', '전 OO한방병원 과장']
    philosophy: ''
  },
  // 진료시간 등 샘플 값이 남아 있는 동안 홈페이지 아래에 "일부 정보 준비 중" 문구를 보여줍니다. 다 채우면 false
  showPrepNotice: true
}
