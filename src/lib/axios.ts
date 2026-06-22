import axios from 'axios'

const DEV_TOKEN = ''

export function getToken(): string | null {
  return DEV_TOKEN || localStorage.getItem('accessToken')
}

export function setToken(token: string) {
  localStorage.setItem('accessToken', token)
}

function createInstance(baseURL: string) {
  const instance = axios.create({
    baseURL,
    timeout: 10000,
    headers: { 'Content-Type': 'application/json' },
  })

  instance.interceptors.request.use((config) => {
    const token = getToken()
    if (token) config.headers['Authorization'] = `Bearer ${token}`
    return config
  })

  instance.interceptors.response.use(
    (res) => res.data,
    (err) => {
      // TODO: 에러 토스트 처리
      return Promise.reject(err)
    },
  )

  return instance
}

// 자금/원장 (청약, 리턴플랜, 계좌) — 추후 proxy 추가 시 빈 문자열로
export const ledgerApi = createInstance(import.meta.env.VITE_LEDGER_URL ?? 'http://localhost:8080')

// 조회/AI (IPO 탐색, 증권, 홈 대시보드) — Vite proxy /api/v1 → localhost:8081
export const serviceApi = createInstance('')
