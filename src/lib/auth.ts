import { serviceApi } from "./axios";

interface LoginResponse {
  onboardingStatus: "REQUIRED" | "COMPLETED";
  userId?: number;
}

const DEV_USER_ID_KEY = "dev_user_id";

export async function loginWithPin(pin: string): Promise<LoginResponse> {
  const res = (await serviceApi.post("/api/service/auth/simple-login", {
    simplePassword: pin,
  })) as unknown as { code: string; data: LoginResponse };

  if (import.meta.env.DEV && res.data.userId != null) {
    localStorage.setItem(DEV_USER_ID_KEY, String(res.data.userId));
  }

  return res.data;
}

export async function completeOnboarding(): Promise<void> {
  await serviceApi.post("/api/v1/onboarding");
}

export async function logout(): Promise<void> {
  await serviceApi.post("/api/service/auth/logout");
}
