import axios from 'axios'

const MOCK_USER_ID = '1'

function createInstance(baseURL: string) {
  const instance = axios.create({
    baseURL,
    timeout: 10000,
    headers: { 'Content-Type': 'application/json' },
  })

  instance.interceptors.request.use((config) => {
    config.headers['X-User-Id'] = MOCK_USER_ID
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

// 자금/원장 (청약, 리턴플랜, 계좌)
export const ledgerApi = createInstance(import.meta.env.VITE_LEDGER_URL ?? 'http://localhost:8080')

// 조회/AI (IPO 탐색, 증권, 홈 대시보드)
export const serviceApi = createInstance(import.meta.env.VITE_SERVICE_URL ?? 'http://localhost:8081')
