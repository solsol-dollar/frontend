importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js')

// 서비스 워커는 Vite 빌드 파이프라인 밖에서 실행됩니다.
// VITE_* 환경변수가 주입되지 않으므로 Firebase 설정 값을 직접 입력해야 합니다.
// Firebase 콘솔(console.firebase.google.com)에서 프로젝트 설정 → 웹 앱 → SDK 설정 복사
//
// TODO: FCM 연동 시 아래 값을 채울 것 (이 파일은 .gitignore 되지 않으므로 실제 키 입력 후 주의)
firebase.initializeApp({
  apiKey: '',
  authDomain: '',
  projectId: '',
  messagingSenderId: '',
  appId: '',
})

const messaging = firebase.messaging()

messaging.onBackgroundMessage((payload) => {
  const { title, body } = payload.notification ?? {}
  self.registration.showNotification(title ?? 'SOL SOL 달러', {
    body,
    icon: '/icons/icon-192.png',
  })
})
