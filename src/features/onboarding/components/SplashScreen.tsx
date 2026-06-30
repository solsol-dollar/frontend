export function SplashScreen() {
  return (
    <div className="mobile-container flex flex-col items-center justify-center h-screen bg-white mb-5">
      <div
        className="animate-splash-float"
        style={{ animationDelay: '0.7s' }}
      >
        <div className="relative">
          <div className="absolute -inset-8 rounded-full bg-blue-300/10 blur-3xl animate-glow-pulse" />

          <div className="relative w-36 h-36 animate-splash-in" style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', transform: 'translateZ(0)', willChange: 'transform', isolation: 'isolate' }}>
            <img
              src="/icons/appLogo_dollar.png"
              alt="SOL SOL 달러"
              className="w-36 h-36 object-contain"
              style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', transform: 'translateZ(0)', display: 'block' }}
            />
            <div
              className="absolute inset-0 pointer-events-none animate-shimmer"
              style={{
                background:
                  'linear-gradient(108deg, transparent 40%, rgba(255,255,255,0.25) 50%, transparent 60%)',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
