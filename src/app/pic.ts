/** 앱에서 쓰는 사진. 한약 사진은 오른쪽의 글씨를 잘라낸 파일을 씁니다. */
export const pic = (src: string) => (src === '/images/herb.jpg' ? '/images/herb-crop.jpg' : src)
