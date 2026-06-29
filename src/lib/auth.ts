import { serviceApi } from "./axios";

interface LoginResponse {
  onboardingStatus: "REQUIRED" | "COMPLETED";
  investmentStatus: "REQUIRED" | "COMPLETED";
  userId?: number;
}

const DEV_USER_ID_KEY = "dev_user_id";
export const INVESTMENT_STATUS_KEY = "investment_status";

export async function loginWithPin(pin: string): Promise<LoginResponse> {
  const res = (await serviceApi.post("/api/service/auth/simple-login", {
    simplePassword: pin,
  })) as unknown as { code: string; data: LoginResponse };

  if (import.meta.env.DEV && res.data.userId != null) {
    localStorage.setItem(DEV_USER_ID_KEY, String(res.data.userId));
  }
  localStorage.setItem(INVESTMENT_STATUS_KEY, res.data.investmentStatus);

  return res.data;
}

export function getInvestmentStatus(): "REQUIRED" | "COMPLETED" {
  return (localStorage.getItem(INVESTMENT_STATUS_KEY) as "REQUIRED" | "COMPLETED") ?? "REQUIRED";
}

export function markInvestmentCompleted(): void {
  localStorage.setItem(INVESTMENT_STATUS_KEY, "COMPLETED");
}

export async function completeOnboarding(): Promise<void> {
  await serviceApi.post('/api/service/api/v1/onboarding')
}

export async function logout(): Promise<void> {
  await serviceApi.post("/api/service/auth/logout");
  localStorage.removeItem(INVESTMENT_STATUS_KEY);
}
