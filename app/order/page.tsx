'use client'

import { useState, useCallback, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { PRODUCTS } from '@/lib/products'
import { calculateShipping } from '@/lib/shipping'

interface CartItem {
  variantId: string
  productId: string
  productName: string
  variantName: string
  price: number
  quantity: number
}

interface StockRecord {
  variantId: string
  available: boolean
  stock: number
}

export default function OrderPage() {
  const router = useRouter()
  const [cart, setCart] = useState<Record<string, CartItem>>({})
  const [stockMap, setStockMap] = useState<Record<string, StockRecord>>({})

  const [orderer, setOrderer] = useState({ name: '', email: '', phone: '' })
  const [recipient, setRecipient] = useState({ name: '', phone: '', address: '', noHolidayDelivery: false })
  const [notes, setNotes] = useState('')

  const today = new Date().toISOString().split('T')[0]
  const [paymentCode, setPaymentCode] = useState('')
  const [paymentDate, setPaymentDate] = useState(today)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  // 讀取後台庫存設定
  useEffect(() => {
    fetch('/api/stock')
      .then((r) => r.json())
      .then((data: StockRecord[]) => {
        const map: Record<string, StockRecord> = {}
        data.forEach((s) => { map[s.variantId] = s })
        setStockMap(map)
      })
      .catch(() => {})
  }, [])

  // 判斷某 variant 是否可訂購
  const isVariantAvailable = useCallback((productAvailable: boolean, variantId: string) => {
    const record = stockMap[variantId]
    if (record) return record.available
    return productAvailable   // 無 DB 記錄時使用 products.ts 的預設值
  }, [stockMap])

  const updateQuantity = useCallback((variant: { id: string; productId: string; productName: string; variantName: string; price: number }, qty: number) => {
    setCart((prev) => {
      if (qty <= 0) {
        const next = { ...prev }
        delete next[variant.id]
        return next
      }
      return {
        ...prev,
        [variant.id]: {
          variantId: variant.id,
          productId: variant.productId,
          productName: variant.productName,
          variantName: variant.variantName,
          price: variant.price,
          quantity: qty,
        },
      }
    })
  }, [])

  const cartItems = Object.values(cart)
  const totalBoxes = cartItems.reduce((sum, item) => sum + item.quantity, 0)
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shipping = calculateShipping(totalBoxes)
  const total = subtotal + shipping

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (cartItems.length === 0) { setError('請選擇至少一項商品'); return }
    if (!orderer.name || !orderer.email || !orderer.phone) { setError('請填寫訂購人資料'); return }
    if (!recipient.address) { setError('請填寫收件地址'); return }
    if (!paymentCode) { setError('請填寫匯款末五碼'); return }

    setSubmitting(true)
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: orderer.name,
          customerEmail: orderer.email,
          customerPhone: orderer.phone,
          recipientName: recipient.name || undefined,
          recipientPhone: recipient.phone || undefined,
          deliveryAddress: recipient.address,
          noHolidayDelivery: recipient.noHolidayDelivery,
          notes,
          items: cartItems,
          subtotal,
          shipping,
          total,
          paymentCode,
          paymentDate,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || '訂單建立失敗')
      router.push(`/order/success?orderId=${json.orderId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : '發生錯誤，請稍後再試')
    } finally {
      setSubmitting(false)
    }
  }

  const stepLabel = (n: number) => (
    <span className="w-6 h-6 border border-mango-400 text-mango-500 text-xs flex items-center justify-center font-light tracking-wider">
      {n}
    </span>
  )

  // 有任一 variant 可訂購才顯示該品項
  const availableProducts = PRODUCTS.filter((p) =>
    p.variants.some((v) => isVariantAvailable(p.available, v.id))
  )

  return (
    <div className="min-h-screen bg-stone-50">
      <nav className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center gap-3">
          <Link href="/" className="font-light text-gray-700 tracking-[0.3em] text-sm hover:text-mango-500 transition-colors">
            芒 芒 人 海
          </Link>
          <span className="text-gray-200">/</span>
          <span className="text-gray-400 text-xs tracking-wider">訂購</span>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="mb-10">
          <p className="text-[10px] tracking-[0.5em] text-mango-400 mb-3 uppercase">Order</p>
          <h1 className="text-2xl font-light text-gray-700 tracking-[0.12em]">立即訂購</h1>
          <p className="text-xs text-gray-400 mt-2 tracking-wider">選擇品項，填寫資料，鮮甜直送到府</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-5">

              {/* Step 1: Products */}
              <div className="bg-white border border-gray-100 p-6">
                <h2 className="font-light text-gray-700 mb-6 flex items-center gap-3 tracking-wider">
                  {stepLabel(1)} 選擇商品
                </h2>
                {availableProducts.length === 0 ? (
                  <p className="text-sm text-gray-400 tracking-wide text-center py-6">目前暫無開放訂購的品項，請稍後再來</p>
                ) : (
                  <div className="space-y-6">
                    {availableProducts.map((product) => (
                      <div key={product.id}>
                        <div className="mb-3">
                          <h3 className="text-sm font-medium text-gray-700 tracking-wide">{product.name}</h3>
                          <p className="text-[10px] text-gray-400 tracking-[0.2em] mt-0.5">{product.nameEn} · {product.season}</p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {product.variants.map((variant) => {
                            const qty = cart[variant.id]?.quantity ?? 0
                            const available = isVariantAvailable(product.available, variant.id)
                            const stockRecord = stockMap[variant.id]
                            const stockCount = stockRecord?.stock ?? 0

                            return (
                              <div
                                key={variant.id}
                                className={`border p-4 transition-all ${
                                  !available
                                    ? 'border-gray-100 bg-gray-50 opacity-60'
                                    : qty > 0
                                    ? 'border-mango-300 bg-mango-50/50'
                                    : 'border-gray-100 bg-white'
                                }`}
                              >
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-xs text-gray-600 tracking-wide">{variant.name}</span>
                                  <span className="text-sm text-gray-800">NT$ {variant.price.toLocaleString()}</span>
                                </div>

                                {/* 庫存提示 */}
                                {available && stockCount > 0 && (
                                  <p className="text-[10px] text-amber-500 tracking-wider mb-2">剩餘 {stockCount} 箱</p>
                                )}
                                {!available && (
                                  <p className="text-[10px] text-gray-400 tracking-wider mb-2">暫停接單</p>
                                )}

                                {available && (
                                  <div className="flex items-center gap-4 mt-2">
                                    <button
                                      type="button"
                                      onClick={() => updateQuantity({ id: variant.id, productId: product.id, productName: product.name, variantName: variant.name, price: variant.price }, qty - 1)}
                                      className="w-7 h-7 border border-gray-200 text-gray-500 hover:border-mango-400 hover:text-mango-500 transition-colors flex items-center justify-center text-base leading-none"
                                    >
                                      −
                                    </button>
                                    <span className="w-6 text-center text-sm text-gray-700">{qty}</span>
                                    <button
                                      type="button"
                                      onClick={() => updateQuantity({ id: variant.id, productId: product.id, productName: product.name, variantName: variant.name, price: variant.price }, qty + 1)}
                                      disabled={stockCount > 0 && qty >= stockCount}
                                      className="w-7 h-7 border border-gray-200 text-gray-500 hover:border-mango-400 hover:text-mango-500 transition-colors flex items-center justify-center text-base leading-none disabled:opacity-30 disabled:cursor-not-allowed"
                                    >
                                      +
                                    </button>
                                    {qty > 0 && (
                                      <span className="text-xs text-mango-500 ml-auto tracking-wide">
                                        NT$ {(variant.price * qty).toLocaleString()}
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Step 2: Orderer */}
              <div className="bg-white border border-gray-100 p-6">
                <h2 className="font-light text-gray-700 mb-6 flex items-center gap-3 tracking-wider">
                  {stepLabel(2)} 訂購人資料
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 tracking-wider mb-2">姓名 <span className="text-mango-400">*</span></label>
                    <input type="text" className="input-field" placeholder="訂購人姓名" value={orderer.name} onChange={(e) => setOrderer(p => ({ ...p, name: e.target.value }))} required />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 tracking-wider mb-2">手機 <span className="text-mango-400">*</span></label>
                    <input type="tel" className="input-field" placeholder="0912-345-678" value={orderer.phone} onChange={(e) => setOrderer(p => ({ ...p, phone: e.target.value }))} required />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs text-gray-500 tracking-wider mb-2">Email <span className="text-mango-400">*</span></label>
                    <input type="email" className="input-field" placeholder="example@email.com" value={orderer.email} onChange={(e) => setOrderer(p => ({ ...p, email: e.target.value }))} required />
                  </div>
                </div>
              </div>

              {/* Step 3: Recipient */}
              <div className="bg-white border border-gray-100 p-6">
                <h2 className="font-light text-gray-700 mb-1 flex items-center gap-3 tracking-wider">
                  {stepLabel(3)} 收件人資料
                </h2>
                <p className="text-[10px] text-gray-400 tracking-wider mb-6 ml-9">姓名與手機若與訂購人相同可留白</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 tracking-wider mb-2">收件人姓名</label>
                    <input type="text" className="input-field" placeholder="同訂購人可留白" value={recipient.name} onChange={(e) => setRecipient(p => ({ ...p, name: e.target.value }))} />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 tracking-wider mb-2">收件人手機</label>
                    <input type="tel" className="input-field" placeholder="同訂購人可留白" value={recipient.phone} onChange={(e) => setRecipient(p => ({ ...p, phone: e.target.value }))} />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs text-gray-500 tracking-wider mb-2">收件地址 <span className="text-mango-400">*</span></label>
                    <input type="text" className="input-field" placeholder="台北市信義區信義路一段 1 號" value={recipient.address} onChange={(e) => setRecipient(p => ({ ...p, address: e.target.value }))} required />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        className="w-4 h-4 border border-gray-300 text-mango-500 focus:ring-mango-300 cursor-pointer"
                        checked={recipient.noHolidayDelivery}
                        onChange={(e) => setRecipient(p => ({ ...p, noHolidayDelivery: e.target.checked }))}
                      />
                      <span className="text-xs text-gray-600 tracking-wider group-hover:text-gray-800">假日不可收貨</span>
                    </label>
                    {recipient.noHolidayDelivery && (
                      <p className="text-[10px] text-amber-500 mt-2 ml-7 tracking-wide">已標記，將安排平日配送</p>
                    )}
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs text-gray-500 tracking-wider mb-2">備註</label>
                    <textarea className="input-field resize-none" rows={2} placeholder="如有特殊需求請說明" value={notes} onChange={(e) => setNotes(e.target.value)} />
                  </div>
                </div>
              </div>

              {/* Step 4: Payment */}
              <div className="bg-white border border-gray-100 p-6">
                <h2 className="font-light text-gray-700 mb-6 flex items-center gap-3 tracking-wider">
                  {stepLabel(4)} 付款資訊
                </h2>
                <div className="bg-amber-50 border border-amber-100 p-5 mb-6">
                  <h3 className="text-xs font-medium text-amber-800 mb-3 tracking-wider">匯款帳戶</h3>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                    <span className="text-gray-500 tracking-wide">銀行</span>
                    <span className="text-gray-700">新光銀行 (103)</span>
                    <span className="text-gray-500 tracking-wide">帳號</span>
                    <span className="font-mono text-gray-800 text-sm tracking-widest">1049500192076</span>
                    <span className="text-gray-500 tracking-wide">金額</span>
                    <span className="text-mango-600 font-medium">{total > 0 ? `NT$ ${total.toLocaleString()}` : '依訂單計算'}</span>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 tracking-wider mb-2">匯款末五碼 <span className="text-mango-400">*</span></label>
                    <input type="text" className="input-field" placeholder="12345" maxLength={5} value={paymentCode} onChange={(e) => setPaymentCode(e.target.value.replace(/\D/g, '').slice(0, 5))} required />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 tracking-wider mb-2">匯款日期 <span className="text-mango-400">*</span></label>
                    <input type="date" className="input-field" value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)} required />
                  </div>
                </div>
              </div>

              {error && (
                <div className="border border-red-200 bg-red-50 text-red-600 p-4 text-xs tracking-wide">{error}</div>
              )}
            </div>

            {/* Order summary */}
            <div className="lg:col-span-1">
              <div className="bg-white border border-gray-100 p-6 sticky top-24">
                <p className="text-[10px] tracking-[0.4em] text-gray-400 mb-4 uppercase">Summary</p>
                <h2 className="font-light text-gray-700 tracking-wider mb-5">訂單摘要</h2>
                {cartItems.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-6 tracking-wider">尚未選擇商品</p>
                ) : (
                  <div className="space-y-3 mb-5">
                    {cartItems.map((item) => (
                      <div key={item.variantId} className="flex justify-between text-xs">
                        <div>
                          <p className="text-gray-700 tracking-wide">{item.productName}</p>
                          <p className="text-gray-400 mt-0.5">{item.variantName} × {item.quantity}</p>
                        </div>
                        <span className="text-gray-600">NT$ {(item.price * item.quantity).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                )}
                <div className="border-t border-gray-100 pt-4 space-y-2">
                  <div className="flex justify-between text-xs text-gray-500">
                    <span className="tracking-wide">小計</span>
                    <span>NT$ {subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span className="tracking-wide">運費{totalBoxes > 0 && <span className="text-gray-400 ml-1">({totalBoxes} 箱)</span>}</span>
                    <span>{totalBoxes > 0 ? `NT$ ${shipping.toLocaleString()}` : '—'}</span>
                  </div>
                  <div className="flex justify-between text-sm pt-2 border-t border-gray-100">
                    <span className="text-gray-700 tracking-wide">合計</span>
                    <span className="text-mango-500 font-medium">{total > 0 ? `NT$ ${total.toLocaleString()}` : '—'}</span>
                  </div>
                </div>
                <div className="mt-4 text-[10px] text-gray-400 bg-stone-50 p-3 leading-relaxed tracking-wide">
                  常溫配送<br />1-2 箱 NT$150 · 3-4 箱 NT$300
                </div>
                <button
                  type="submit"
                  disabled={submitting || cartItems.length === 0}
                  className="w-full mt-5 bg-mango-500 hover:bg-mango-600 text-white text-xs py-3.5 tracking-[0.3em] transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {submitting ? '送出中…' : '確認送出訂單'}
                </button>
                <p className="text-[10px] text-gray-400 text-center mt-3 tracking-wider">點擊送出即代表同意訂購條款</p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
