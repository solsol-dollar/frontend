import { serviceApi } from './axios'

interface LoginResponse {
  onboardingStatus: 'REQUIRED' | 'COMPLETED'
}

// POST /auth/simple-login — 엔드포인트는 백엔드와 맞춰 수정하세요
export async function loginWithPin(pin: string): Promise<LoginResponse> {
  const res = (await serviceApi.post('/api/service/auth/simple-login', {
    simplePassword: pin,
  })) as unknown as { code: string; data: LoginResponse }

  return res.data
}

export async function completeOnboarding(): Promise<void> {
  await serviceApi.post('/api/v1/onboarding')
}

export async function logout(): Promise<void> {
  await serviceApi.post('/api/service/auth/logout')
}
