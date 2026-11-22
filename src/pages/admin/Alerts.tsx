import { useCallback, useEffect, useState } from 'react'
import { Msg } from '../../components/ui'
import { api } from '../../data/api'
import type { OutboxItem } from '../../data/types'
import { prettyPhone } from '../../lib/date'
import { computeDue, notify, type DueItem } from '../../notify/notifier'

const KIND: Record<string, string> = { confirm: '예약 확정', change: '예약 변경', cancel: '예약 취소', reminder: '전날 알림', care: '다음 진료 안내' }

export default function Alerts() {
  const [due, setDue] = useState<DueItem[]>([])
  const [log, setLog] = useState<OutboxItem[]>([])
  const load = useCallback(async () => {
    setDue(await computeDue(new Date()))
    setLog(await api.getOutbox())
  }, [])
  useEffect(() => { load() }, [load])

  const send = async (d: DueItem) => {
    await notify(d.kind, d.r, d.key)
    load()
  }
  return (
    <>
      <Msg kind="info">지금은 <b>미리보기</b>입니다. 실제 카카오 알림톡·문자 발송은 Cloudflare 서버와 발송 대행사를 연결한 뒤 자동으로 나갑니다.</Msg>
      <h2>오늘 보낼 알림 {due.length}건</h2>
      {due.length === 0 && <Msg kind="ok">오늘 보낼 알림이 없어요.</Msg>}
      {due.map((d) => (
        <article key={d.key} className="card row">
          <div className="rowhead"><b>{KIND[d.kind]}</b><span>{d.r.name} · {prettyPhone(d.r.phone)}</span></div>
          <button type="button" className="btn primary" onClick={() => send(d)}>미리보기 발송 기록</button>
        </article>
      ))}
      <h2>발송 기록 (최근)</h2>
      {log.length === 0 && <Msg kind="info">아직 기록이 없어요.</Msg>}
      {log.slice(0, 30).map((o) => (
        <details key={o.id} className="card">
          <summary>{KIND[o.kind]} · {prettyPhone(o.to)} · {new Date(o.at).toLocaleString('ko-KR')}</summary>
          <pre className="preview">{o.text}</pre>
        </details>
      ))}
    </>
  )
}
