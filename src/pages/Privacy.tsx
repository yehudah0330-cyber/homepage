import { Page, PrivacyText } from '../components/ui'

export default function Privacy() {
  return (
    <Page title="개인정보 수집·이용 안내">
      <PrivacyText />
      <p className="muted" style={{ marginTop: '1rem' }}>
        이 홈페이지는 방문 통계(어떤 페이지를 얼마나 보는지)를 파악하기 위해 구글 애널리틱스를 사용합니다. 이름이나 연락처 같은 개인 정보는 통계 도구로 보내지 않습니다.
      </p>
    </Page>
  )
}
