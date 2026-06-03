'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

interface OrderDetail {
  id: string
  orderNumber: string
  customerName: string
  total: number
  shipping: number
  subtotal: number
  items: { productName: string; variantName: string; quantity: number; subtotal: number }[]
}

function SuccessContent() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('orderId')
  const [order, setOrder] = useState<OrderDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!orderId) { setLoading(false); return }
    fetch(`/api/orders/${orderId}`)
      .then((r) => r.json())
      .then((data) => { setOrder(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [orderId])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="text-4xl animate-spin inline-block mb-4">🥭</div>
          <p className="text-gray-500">載入中…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-16 text-center">
      {/* Success icon */}
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <span className="text-4xl">✅</span>
      </div>

      <h1 className="text-3xl font-bold text-gray-800 mb-2">訂購成功！</h1>
      <p className="text-gray-500 mb-8">
        感謝您的訂購！確認信已寄送至您的信箱，請查收。
      </p>

      {order && (
        <div className="card p-6 text-left mb-8">
          <div className="text-center mb-5 pb-4 border-b border-gray-100">
            <p className="text-sm text-gray-400">訂單編號</p>
            <p className="text-xl font-bold text-mango-600 font-mono">{order.orderNumber}</p>
          </div>

          <div className="space-y-2 mb-4">
            {order.items.map((item, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-gray-600">
                  {item.productName} {item.variantName} × {item.quantity}
                </span>
                <span className="font-medium">NT$ {item.subtotal.toLocaleString()}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-100 pt-3 space-y-1">
            <div className="flex justify-between text-sm text-gray-500">
              <span>小計</span><span>NT$ {order.subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-500">
              <span>運費</span><span>NT$ {order.shipping.toLocaleString()}</span>
            </div>
            <div className="flex justify-between font-bold text-lg pt-1">
              <span>合計</span>
              <span className="text-mango-600">NT$ {order.total.toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}

      {/* Payment reminder */}
      <div className="bg-orange-50 border border-orange-200 rounded-xl p-5 mb-8 text-left">
        <h3 className="font-semibold text-orange-800 mb-3 flex items-center gap-2">
          <span>💳</span> 請完成匯款
        </h3>
        <div className="space-y-1 text-sm">
          <p><span className="text-gray-500">銀行：</span><span className="font-medium">新光銀行 (103)</span></p>
          <p><span className="text-gray-500">帳號：</span><span className="font-mono font-bold tracking-wider">1049500192076</span></p>
          {order && (
            <p><span className="text-gray-500">金額：</span><span className="font-bold text-mango-600">NT$ {order.total.toLocaleString()}</span></p>
          )}
        </div>
        <p className="text-xs text-gray-500 mt-3">
          完成匯款後，我們確認收款後會盡快安排出貨，並以 Email 通知您。
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link href="/" className="btn-primary">
          回到首頁
        </Link>
        <Link href="/order" className="btn-outline">
          繼續訂購
        </Link>
      </div>
    </div>
  )
}

export default function SuccessPage() {
  return (
    <div className="min-h-screen bg-mango-50">
      <nav className="bg-white border-b border-orange-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="text-xl">🥭</span>
            <span className="font-bold text-mango-600 group-hover:text-mango-700">芒芒人海</span>
          </Link>
        </div>
      </nav>
      <Suspense>
        <SuccessContent />
      </Suspense>
    </div>
  )
}
