importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js')

firebase.initializeApp({
  apiKey: 'AIzaSyAQ80gvBqHc3hxyTASogJkx0_Y9v7fzVKE',
  authDomain: 'solsol-dollar.firebaseapp.com',
  projectId: 'solsol-dollar',
  messagingSenderId: '409696929635',
  appId: '1:409696929635:web:c7a0efca68f526ca36b556',
})

const messaging = firebase.messaging()

messaging.onBackgroundMessage((payload) => {
  const { title, body } = payload.notification ?? {}
  self.registration.showNotification(title ?? 'SOL SOL 달러', {
    body,
    icon: '/icons/icon-192.png',
  })
})
