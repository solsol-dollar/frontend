const LOGO_COLORS = ['#FF6B35', '#1C1FE8', '#E8632A', '#635BFF', '#10A37F', '#E2468B', '#3660AC', '#019989']

export function generateLogoColor(ticker: string): string {
  let hash = 0
  for (let i = 0; i < ticker.length; i++) hash = (hash * 31 + ticker.charCodeAt(i)) & 0xffffffff
  return LOGO_COLORS[Math.abs(hash) % LOGO_COLORS.length]
}
