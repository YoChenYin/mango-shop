import Link from 'next/link'

const steps = [
  {
    num: '01',
    title: '收到請立即開封通風',
    body: '芒果在運送過程中悶在箱內，收到後請立即打開紙箱，讓芒果在室溫下自然通風透氣。請勿直接存放在密閉箱內，避免過度熟成。',
  },
  {
    num: '02',
    title: '果粉退即最佳食用時機',
    body: '芒果表面的白色果粉（果霜）是天然蠟質，是新鮮的象徵。待果粉逐漸退去、果皮轉為光亮飽滿時，即為最佳食用時機，香甜度最高。',
  },
  {
    num: '03',
    title: '果粉退後進冰箱保存',
    body: '果粉退去後，請將芒果移入冰箱冷藏（建議 10–13°C），可延緩熟成並保持果肉口感。已切開的芒果請以保鮮膜包覆後冷藏，建議 1–2 天內食用完畢。',
  },
]

const tips = [
  { icon: '🌡️', text: '室溫催熟：20–30°C 最佳' },
  { icon: '🚫', text: '避免陽光直射或高溫悶熱處' },
  { icon: '🔪', text: '切開後儘速食用，避免氧化變色' },
  { icon: '🧊', text: '冷藏建議 10–13°C，勿冷凍' },
  { icon: '📦', text: '單顆以報紙或軟布包裹可延長保存' },
]

export default function GuidePage() {
  return (
    <div className="min-h-screen bg-stone-50">
      {/* Nav */}
      <nav className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-6 py-5 flex items-center gap-3">
          <Link href="/" className="font-light text-gray-700 tracking-[0.3em] text-sm hover:text-mango-500 transition-colors">
            芒 芒 人 海
          </Link>
          <span className="text-gray-200">/</span>
          <span className="text-gray-400 text-xs tracking-wider">收到芒果</span>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-[10px] tracking-[0.5em] text-mango-400 mb-5 uppercase">Guide</p>
          <h1 className="text-2xl font-light text-gray-700 tracking-[0.15em] mb-4">收到芒果後</h1>
          <div className="w-8 h-px bg-mango-300 mx-auto mb-6" />
          <p className="text-xs text-gray-400 leading-relaxed tracking-wide">
            芒果離開果園，帶著果農的心意來到您手中。<br />
            幾個小步驟，讓您品嚐到最甜蜜的一口。
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-0 mb-16">
          {steps.map((step, i) => (
            <div key={step.num} className="flex gap-6">
              {/* Left: number + line */}
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 border border-mango-300 flex items-center justify-center shrink-0">
                  <span className="text-[10px] text-mango-400 tracking-widest">{step.num}</span>
                </div>
                {i < steps.length - 1 && <div className="w-px flex-1 bg-gray-100 my-2" />}
              </div>
              {/* Right: content */}
              <div className={`pb-10 ${i === steps.length - 1 ? '' : ''}`}>
                <h2 className="text-sm font-medium text-gray-700 tracking-wide mb-3 mt-1.5">{step.title}</h2>
                <p className="text-xs text-gray-500 leading-[2] tracking-wide">{step.body}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Tips */}
        <div className="bg-white border border-gray-100 p-8 mb-12">
          <h3 className="text-xs font-medium text-gray-600 tracking-[0.3em] mb-6 uppercase">小提醒</h3>
          <ul className="space-y-3">
            {tips.map((tip) => (
              <li key={tip.text} className="flex items-start gap-3 text-xs text-gray-500 tracking-wide leading-relaxed">
                <span className="shrink-0">{tip.icon}</span>
                <span>{tip.text}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* CTA */}
        <div className="text-center border-t border-gray-100 pt-12">
          <p className="text-xs text-gray-400 tracking-wider mb-6">還沒訂購嗎？</p>
          <Link
            href="/order"
            className="inline-block border border-mango-400 text-mango-500 hover:bg-mango-500 hover:text-white text-xs px-12 py-3.5 tracking-[0.3em] transition-all duration-300 font-light"
          >
            立即訂購
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-600 py-10 mt-16">
        <div className="text-center">
          <p className="text-xs tracking-[0.45em] mb-4 text-gray-500">芒 芒 人 海</p>
          <a
            href="https://www.instagram.com/MANGMANGO.TAINAN"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-gray-500 hover:text-white text-xs tracking-wider transition-colors mb-4"
          >
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
            @MANGMANGO.TAINAN
          </a>
          <p className="text-[10px] tracking-[0.25em]">© 2024 MANG MANG · 台南玉井</p>
        </div>
      </footer>
    </div>
  )
}
