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
    withCredentials: true,
    headers: { 'Content-Type': 'application/json' },
  })

  instance.interceptors.request.use((config) => {
    const token = getToken()
    if (token) config.headers['Authorization'] = `Bearer ${token}`
    return config
  })

  instance.interceptors.response.use(
    (res) => res.data,
    (err) => Promise.reject(err),
  )

  return instance
}

export const ledgerApi = createInstance(import.meta.env.VITE_LEDGER_URL ?? 'http://localhost:8080')
export const serviceApi = createInstance('')
