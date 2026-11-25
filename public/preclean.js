// 미리 만든 본문은 검색 로봇용입니다. 사람이 열 때는 앱이 직접 화면을 그리므로, 홈이 아닌 주소에서는 미리 만든 홈 본문을 지웁니다.
(function () {
  var p = location.pathname.replace(/\/$/, '') || '/'
  if (p !== '/') {
    var r = document.getElementById('root')
    if (r) r.innerHTML = ''
  }
})()
