import { useCallback, useEffect, useState } from 'react'
import { Msg } from '../../components/ui'
import { api } from '../../data/api'
import type { Notice } from '../../data/types'

export default function Notices() {
  const [list, setList] = useState<Notice[]>([])
  const [text, setText] = useState('')
  const [editId, setEditId] = useState('')
  const load = useCallback(() => api.getNotices().then(setList), [])
  useEffect(() => { load() }, [load])

  const save = async () => {
    if (!text.trim()) return
    await api.saveNotice({ id: editId || undefined, text: text.trim() })
    setText('')
    setEditId('')
    load()
  }
  return (
    <>
      <h2>공지 {editId ? '수정' : '새로 쓰기'}</h2>
      <p className="muted">가장 최근 공지 1개가 환자 첫 화면에 보여요.</p>
      <textarea value={text} onChange={(e) => setText(e.target.value)} rows={3} placeholder="예: 12월 25일은 휴진입니다." />
      <div className="two">
        <button type="button" className="btn primary" onClick={save}>{editId ? '수정 저장' : '공지 올리기'}</button>
        {editId && <button type="button" className="btn ghost" onClick={() => { setEditId(''); setText('') }}>취소</button>}
      </div>
      {list.length === 0 && <Msg kind="info">등록된 공지가 없어요.</Msg>}
      {list.map((n, i) => (
        <article key={n.id} className="card">
          {i === 0 && <span className="tag confirmed">첫 화면에 표시 중</span>}
          <p>{n.text}</p>
          <div className="rowbtns">
            <button type="button" className="btn ghost" onClick={() => { setEditId(n.id); setText(n.text) }}>수정</button>
            <button type="button" className="btn danger" onClick={async () => { await api.deleteNotice(n.id); load() }}>삭제</button>
          </div>
        </article>
      ))}
    </>
  )
}
