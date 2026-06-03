import Link from 'next/link'
import Image from 'next/image'
import { PRODUCTS } from '@/lib/products'

const PRODUCT_IMAGES: Record<string, string> = {
  aiwen: '/images/aiwen.jpg',
  yuwen: '/images/yuwen.jpg',
  peach: '/images/peach.jpg',
}

const REVIEWS = [
  { stars: 5, text: '看了韓國太玩夫婦來的，所有的人都好熱情，芒果品質也非常好，價格跟芒果一樣甜，大推！' },
  { stars: 5, text: '愛文芒果的香氣跟甜度都沒話說' },
  { stars: 5, text: '這家芒果這一個月就定了兩次，每一顆都超級甜！！！不誇張' },
  { stars: 5, text: '好吃到我再次回購' },
  { stars: 5, text: '每年都在等這家的芒果' },
]

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <div>
            <p className="font-light text-gray-700 tracking-[0.45em] text-sm">芒 芒 人 海</p>
            <p className="text-[10px] text-gray-400 tracking-[0.3em] mt-0.5">MANG MANG</p>
          </div>
          <div className="flex items-center gap-8">
            <a href="#products" className="text-gray-400 hover:text-gray-700 text-xs tracking-[0.2em] transition-colors hidden sm:block">品項</a>
            <a href="#about" className="text-gray-400 hover:text-gray-700 text-xs tracking-[0.2em] transition-colors hidden sm:block">關於我們</a>
            <Link href="/guide" className="text-gray-400 hover:text-gray-700 text-xs tracking-[0.2em] transition-colors hidden sm:block">收到芒果</Link>
            <Link href="/order" className="btn-primary">訂購</Link>
          </div>
        </div>
      </nav>

      {/* Hero — bg-black 讓縮小後的邊緣與 overlay 融合 */}
      <section className="relative overflow-hidden h-[88vh] min-h-[560px] bg-black">
        <div
          className="absolute inset-0"
          style={{ transform: 'scale(0.93)', transformOrigin: 'center center' }}
        >
          <Image
            src="/images/home.jpg"
            alt="芒芒人海"
            fill
            className="object-cover"
            priority
          />
        </div>
        <div className="absolute inset-0 bg-black/42" />
        <div className="relative h-full flex flex-col items-center justify-center text-center text-white px-4">
          <p className="text-[10px] tracking-[0.6em] text-white/60 mb-8 uppercase">Tainan · Yujing · Since Ever</p>
          <h1 className="text-5xl md:text-7xl font-light tracking-[0.35em] mb-3">芒芒人海</h1>
          <p className="text-xs tracking-[0.5em] text-white/70 mb-10">MANG MANG</p>
          <div className="w-px h-14 bg-white/30 mx-auto mb-10" />
          <p className="text-sm text-white/70 mb-10 tracking-[0.2em] font-light">產地直送 · 新鮮採摘 · 鮮甜到府</p>
          <div className="flex gap-5">
            <Link
              href="/order"
              className="border border-white/80 text-white hover:bg-white hover:text-gray-800 text-xs font-light px-10 py-3.5 tracking-[0.3em] transition-all duration-300"
            >
              立即訂購
            </Link>
            <a
              href="#products"
              className="text-white/60 hover:text-white text-xs px-10 py-3.5 tracking-[0.3em] transition-colors"
            >
              查看品項
            </a>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-14 bg-white border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4">
          <div className="grid grid-cols-3 gap-6 text-center">
            {[
              { title: '新鮮採摘', desc: '當日採收，品嚐最原始甜味' },
              { title: '產地直送', desc: '台南玉井，直達您的餐桌' },
              { title: '嚴選品質', desc: '每顆精挑，無農藥殘留' },
            ].map((f, i) => (
              <div key={f.title}>
                <p className="text-[10px] tracking-[0.4em] text-mango-400 mb-3">0{i + 1}</p>
                <h3 className="text-sm font-medium text-gray-700 tracking-wider mb-1.5">{f.title}</h3>
                <p className="text-xs text-gray-400 leading-relaxed hidden sm:block">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Products */}
      <section id="products" className="py-24 bg-stone-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-[10px] tracking-[0.5em] text-mango-400 mb-5 uppercase">Products</p>
            <h2 className="section-title">當季品項</h2>
            <div className="w-8 h-px bg-mango-300 mx-auto mt-6" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {PRODUCTS.map((product) => (
              <div
                key={product.id}
                className={`card group transition-all duration-300 hover:shadow-md ${!product.available ? 'opacity-60' : ''}`}
              >
                <div className="relative h-52 overflow-hidden">
                  {PRODUCT_IMAGES[product.id] ? (
                    <Image
                      src={PRODUCT_IMAGES[product.id]}
                      alt={product.name}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className={`h-full flex items-center justify-center text-5xl ${product.available ? 'bg-amber-50' : 'bg-gray-50'}`}>
                      {product.emoji}
                    </div>
                  )}
                  {!product.available && <div className="absolute inset-0 bg-white/25" />}
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between mb-1">
                    <h3 className="font-medium text-gray-800 text-sm tracking-wide">{product.name}</h3>
                    {!product.available && (
                      <span className="text-[10px] text-gray-400 border border-gray-200 px-2 py-0.5 tracking-wider ml-2 whitespace-nowrap">即將開放</span>
                    )}
                  </div>
                  <p className="text-[10px] text-gray-400 tracking-[0.25em] mb-2">{product.nameEn}</p>
                  <p className="text-xs text-gray-500 mb-3 leading-relaxed">{product.description}</p>
                  <p className="text-[10px] text-mango-400 tracking-[0.2em] mb-4">{product.season}</p>

                  {product.available && product.variants.length > 0 && (
                    <div className="space-y-1.5 mb-4 border-t border-gray-100 pt-3">
                      {product.variants.map((v) => (
                        <div key={v.id} className="flex justify-between text-xs">
                          <span className="text-gray-400 font-light">{v.name}</span>
                          <span className="text-gray-700">NT$ {v.price.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {product.available ? (
                    <Link
                      href="/order"
                      className="block text-center text-xs border border-mango-400 text-mango-500 hover:bg-mango-500 hover:text-white transition-all duration-200 py-2.5 tracking-[0.2em]"
                    >
                      加入訂單
                    </Link>
                  ) : (
                    <button
                      disabled
                      className="w-full text-xs text-gray-300 border border-gray-200 py-2.5 cursor-not-allowed tracking-[0.2em]"
                    >
                      即將開放
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Shipping wait time — 更新出貨天數請修改 lib/products.ts 的 shippingDays */}
      <section className="py-16 bg-white border-t border-gray-100">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-10">
            <p className="text-[10px] tracking-[0.5em] text-mango-400 mb-4 uppercase">Shipping</p>
            <h2 className="section-title">出貨等待時間</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {PRODUCTS.map((product) => (
              <div key={product.id} className="flex items-center justify-between py-4">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-light text-gray-700 tracking-wide">{product.name}</span>
                  {!product.available && (
                    <span className="text-[10px] text-gray-400 border border-gray-200 px-2 py-0.5 tracking-wider">即將開放</span>
                  )}
                </div>
                <span className={`text-sm tracking-wider ${product.available ? 'text-mango-500' : 'text-gray-300'}`}>
                  {product.shippingDays}
                </span>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-gray-400 text-center mt-6 tracking-wider">以上為下單確認後之出貨天數，實際出貨以通知為準</p>
        </div>
      </section>

      {/* Google Reviews */}
      <section className="py-20 bg-stone-50 border-t border-stone-200">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-[10px] tracking-[0.5em] text-gray-400 mb-5 uppercase">Reviews</p>
            <h2 className="section-title mb-4">顧客好評</h2>
            <div className="flex items-center justify-center gap-0.5 mb-2">
              {[...Array(5)].map((_, i) => <span key={i} className="text-amber-400">★</span>)}
            </div>
            <p className="text-xs text-gray-400 tracking-wider">Google 評論</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
            {REVIEWS.slice(0, 6).map((r, i) => (
              <div key={i} className="bg-white border border-gray-100 p-5">
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(r.stars)].map((_, j) => <span key={j} className="text-amber-400 text-xs">★</span>)}
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">「{r.text}」</p>
              </div>
            ))}
          </div>
          <div className="text-center">
            <a
              href="https://share.google/sj9yrSVZ6yZLmHOMW"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 border border-gray-200 hover:border-gray-400 text-gray-500 hover:text-gray-700 text-xs px-10 py-3.5 tracking-[0.2em] transition-all duration-200"
            >
              <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              查看所有 Google 評論
            </a>
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="py-24 bg-white border-t border-gray-100">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-[10px] tracking-[0.5em] text-gray-400 mb-5 uppercase">About</p>
            <h2 className="section-title mb-8">來自台南玉井的芒果</h2>
            <p className="text-sm text-gray-400 max-w-xl mx-auto leading-[2.2]">
              玉井，台灣芒果的故鄉。這片土地孕育了全台最香甜的芒果，
              我們自產自銷，省去中間商，讓您以最實惠的價格品嚐到最新鮮的芒果。
            </p>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            {[
              { num: '20+', label: '年果園經驗' },
              { num: '100%', label: '台灣本土' },
              { num: '0', label: '中間商' },
            ].map((s) => (
              <div key={s.label} className="py-10 border border-gray-200">
                <div className="text-3xl font-light text-mango-400 mb-2 tracking-wider">{s.num}</div>
                <div className="text-xs text-gray-400 tracking-[0.2em]">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Order CTA */}
      <section className="py-20 bg-stone-50 border-t border-stone-200">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <p className="text-[10px] tracking-[0.5em] text-mango-400 mb-6 uppercase">Order</p>
          <h2 className="text-2xl font-light text-gray-700 tracking-[0.1em] mb-4">現在訂購，鮮甜直達家門</h2>
          <p className="text-xs text-gray-400 mb-10 tracking-[0.2em]">當天採收 · 常溫配送</p>
          <Link
            href="/order"
            className="inline-block border border-mango-400 text-mango-500 hover:bg-mango-500 hover:text-white font-light text-xs px-14 py-4 tracking-[0.3em] transition-all duration-300"
          >
            立即訂購
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-500 py-12">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-xs tracking-[0.45em] mb-4 text-gray-400">芒 芒 人 海</p>
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
          <p className="text-[10px] tracking-[0.25em] text-gray-600">© 2024 MANG MANG · 台南玉井</p>
        </div>
      </footer>
    </div>
  )
}
