import { useCallback, useEffect, useState } from 'react'
import { Msg } from '../../components/ui'
import { api } from '../../data/api'
import type { Column } from '../../data/types'

export default function Columns() {
  const [list, setList] = useState<Column[]>([])
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [editId, setEditId] = useState('')
  const [done, setDone] = useState('')
  const load = useCallback(() => api.getColumns().then(setList), [])
  useEffect(() => { load() }, [load])

  const reset = () => { setEditId(''); setTitle(''); setBody('') }
  const save = async () => {
    if (!title.trim() || !body.trim()) return
    await api.saveColumn({ id: editId || undefined, title: title.trim(), body: body.trim() })
    setDone(editId ? '수정했어요.' : '홈페이지에 올렸어요.')
    reset()
    load()
  }
  return (
    <>
      <h2>원장 칼럼 {editId ? '수정' : '새로 쓰기'}</h2>
      <p className="muted">올린 글은 홈페이지의 "원장 칼럼"에 최신순으로 나옵니다. 문단을 나누려면 빈 줄을 한 줄 넣어 주세요.</p>
      <label className="field">제목
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="예: 환절기 건강 관리법" />
      </label>
      <label className="field">내용
        <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={10} placeholder="글을 써 주세요." />
      </label>
      <div className="two">
        <button type="button" className="btn primary" onClick={save} disabled={!title.trim() || !body.trim()}>{editId ? '수정 저장' : '홈페이지에 올리기'}</button>
        {editId && <button type="button" className="btn ghost" onClick={reset}>취소</button>}
      </div>
      {done && <Msg kind="ok">{done}</Msg>}
      <Msg kind="info">지금은 글이 이 컴퓨터(브라우저)에만 저장됩니다. 다른 기기에서도 보이게 하려면 서버 연결(Cloudflare)이 필요합니다.</Msg>
      {list.length === 0 && <Msg kind="info">올린 글이 없어요.</Msg>}
      {list.map((c) => (
        <article key={c.id} className="card">
          <span className="muted">{c.date}</span>
          <h3>{c.title}</h3>
          <p className="muted">{c.body.slice(0, 80)}{c.body.length > 80 ? '…' : ''}</p>
          <div className="rowbtns">
            <button type="button" className="btn ghost" onClick={() => { setEditId(c.id); setTitle(c.title); setBody(c.body); setDone(''); window.scrollTo(0, 0) }}>수정</button>
            <button type="button" className="btn danger" onClick={async () => { if (window.confirm('이 글을 삭제할까요?')) { await api.deleteColumn(c.id); load() } }}>삭제</button>
          </div>
        </article>
      ))}
    </>
  )
}
