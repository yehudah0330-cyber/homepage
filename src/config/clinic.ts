// ★ 한의원 정보는 이 파일 한 곳만 고치면 앱 전체에 반영됩니다. (현재 값은 모두 샘플입니다)
export type DayHours = { open: string; close: string; lunchStart?: string; lunchEnd?: string; night?: boolean } | null

const lunch = { lunchStart: '12:30', lunchEnd: '14:00' }
const lateDay: DayHours = { open: '09:30', close: '20:00', night: true, ...lunch } // 월·수·금
const midDay: DayHours = { open: '09:30', close: '19:00', ...lunch } // 화·목

export const clinic = {
  name: '신영통부부한의원',
  phone: '031-273-0061',
  address: '수원시 영통구 태장로 84, 망포프라자 2층',
  mapQuery: '수원시 영통구 태장로 84 망포프라자',
  // 카카오톡 채널 1:1 채팅 주소. 비워 두면 카톡 버튼이 숨겨집니다.
  kakaoChat: 'https://pf.kakao.com/_xiyxmvX/chat',
  kakaoManager: 'https://center-pf.kakao.com/_xiyxmvX/chats', // 관리자용 채팅 목록 (카카오 로그인 필요)
  // 진료시간: 월·수·금 20시, 화·목 19시, 토 13시(점심 없음). 시작 09:30.
  // 요일별 진료시간 (0=일요일 … 6=토요일). null 이면 정기 휴진
  hours: [null, lateDay, midDay, lateDay, midDay, lateDay, { open: '09:30', close: '13:00' }] as DayHours[],
  // 공휴일에도 진료합니다. 아래 날짜만 쉽니다 (1월 1일, 설날 연휴, 어린이날, 광복절, 추석 연휴, 성탄절). 해마다 날짜를 추가해 주세요.
  holidayNote: '공휴일에도 진료합니다. 다만 1월 1일, 설날 연휴, 어린이날, 광복절, 추석 연휴, 성탄절은 쉽니다.',
  closedHolidays: {
    '2026-01-01': '신정',
    '2026-02-16': '설날 연휴',
    '2026-02-17': '설날',
    '2026-02-18': '설날 연휴',
    '2026-05-05': '어린이날',
    '2026-08-15': '광복절',
    '2026-09-24': '추석 연휴',
    '2026-09-25': '추석',
    '2026-09-26': '추석 연휴',
    '2026-12-25': '성탄절',
    '2027-01-01': '신정',
    '2027-02-06': '설날 연휴',
    '2027-02-07': '설날',
    '2027-02-08': '설날 연휴',
    '2027-05-05': '어린이날',
    '2027-08-15': '광복절',
    '2027-09-14': '추석 연휴',
    '2027-09-15': '추석',
    '2027-09-16': '추석 연휴',
    '2027-12-25': '성탄절',
  } as Record<string, string>,
  slotMinutes: 30, // 예약 간격
  capacityPerSlot: 2, // 같은 시간에 받을 수 있는 인원
  bookingDays: 14, // 오늘부터 며칠 앞까지 예약 가능
  // TODO 오시는 길 안내: 문장을 추가하면 홈페이지·앱에 자동으로 나타납니다. 비워 두면 숨겨집니다.
  directions: {
    parking: ['주차장이 있습니다. 내원하셔서 차번호를 말씀해 주시면 할인권을 제공해 드립니다.'] as string[],
    subway: ['수인분당선 망포역 3번 출구로 나오셔서 그대로 직진해 태장사거리까지 오시면 됩니다. 한의원은 태장사거리에 있습니다.'] as string[],
    bus: [] as string[]
  },
  // image 에 '/images/acu.jpg' 처럼 public/images 안의 사진 경로를 넣으면 사진이 표시됩니다.
  services: [
    { id: 'acu', title: '침 치료', summary: '아픈 곳과 몸의 균형을 맞춰 통증을 줄여 드립니다.', points: ['허리·무릎·어깨 통증', '두통, 어지럼', '일회용 멸균 침만 사용'], image: '/images/acu.jpg' },
    { id: 'yakchim', title: '약침 치료', summary: '한약 성분을 정제한 약액을 아픈 부위와 혈자리에 주입해 염증과 통증을 다스립니다.', points: ['허리·무릎·어깨 통증', '근육 뭉침, 만성 통증', '증상과 체질에 맞는 약침 선택'], image: '/images/yakchim.svg' },
    { id: 'herb', title: '한약', summary: '체질과 증상에 맞게 한 분 한 분 지어 드립니다.', points: ['보약, 피로 회복', '소화·수면 문제', '복용이 끝날 때쯤 안내해 드려요'], image: '/images/herb.jpg' },
    { id: 'diet', title: '다이어트', summary: '무리한 굶기 없이 체질에 맞춰 천천히 관리합니다.', points: ['체질 상담', '식사 습관 안내', '한약 + 침 병행'], image: '/images/diet.jpg' }
  ],
  // 원장 칼럼 '예시 글'입니다. 처음 한 번만 보이는 샘플이에요.
  // 칼럼은 이 파일이 아니라 관리자 화면(/admin → 칼럼 탭)에서 쓰고 지우고 고칩니다.
  sampleColumns: [
    { date: '2026-11-20', title: '환절기, 몸이 보내는 신호 읽기', body: '일교차가 큰 계절에는 몸이 적응하느라 평소보다 많은 에너지를 씁니다.\n\n충분한 수면, 따뜻한 물, 가벼운 걷기부터 시작해 보세요. 증상이 오래 가면 진료를 받아 보시길 권합니다.' },
    { date: '2026-11-10', title: '허리 통증, 오래 앉아 계신 분께', body: '같은 자세가 길어지면 근육이 굳고 통증이 반복됩니다. 50분 앉았다면 3분은 일어나 몸을 풀어 주세요.\n\n생활 습관을 바로잡으면서 필요한 치료를 병행하면 회복이 빨라집니다.' }
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
