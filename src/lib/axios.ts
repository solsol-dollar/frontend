import axios from 'axios'

function createInstance(baseURL: string) {
  const instance = axios.create({
    baseURL,
    timeout: 10000,
    withCredentials: true,
    headers: { 'Content-Type': 'application/json' },
  })

  instance.interceptors.response.use(
    (res) => res.data,
    (err) => Promise.reject(err),
  )

  return instance
}

// 자금/원장 (청약, 리턴플랜, 계좌) — 직접 8080으로
export const ledgerApi = createInstance(import.meta.env.VITE_LEDGER_URL ?? 'http://localhost:8080')

// 조회/AI + 인증 (IPO, 증권, 홈, auth) — Vite proxy: /api/v1, /api/service → 8081
export const serviceApi = createInstance('')
