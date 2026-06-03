'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'

type OrderStatus = 'PROCESSING' | 'SHIPPED'
type PaymentStatus = 'PAID' | 'UNPAID'

interface Order {
  id: string
  orderNumber: string
  createdAt: string
  customerName: string
  customerEmail: string
  customerPhone: string
  recipientName?: string
  recipientPhone?: string
  deliveryAddress: string
  noHolidayDelivery: boolean
  notes?: string
  items: { productName: string; variantName: string; quantity: number; price: number; subtotal: number }[]
  subtotal: number
  shipping: number
  total: number
  paymentCode?: string
  paymentDate?: string
  orderStatus: OrderStatus
  paymentStatus: PaymentStatus
  adminNotes?: string
}

export default function AdminPage() {
  const [password, setPassword] = useState('')
  const [authed, setAuthed] = useState(false)
  const [authError, setAuthError] = useState('')
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState<'ALL' | OrderStatus | PaymentStatus>('ALL')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [updating, setUpdating] = useState<string | null>(null)
  const [adminNotesMap, setAdminNotesMap] = useState<Record<string, string>>({})
  const [savingNotes, setSavingNotes] = useState<string | null>(null)

  const fetchOrders = useCallback(async (pw: string) => {
    setLoading(true)
    try {
      const res = await fetch('/api/orders', {
        headers: { Authorization: pw },
      })
      if (res.status === 401) { setAuthed(false); return }
      const data: Order[] = await res.json()
      setOrders(data)
      const notesInit: Record<string, string> = {}
      data.forEach((o) => { notesInit[o.id] = o.adminNotes ?? '' })
      setAdminNotesMap(notesInit)
    } finally {
      setLoading(false)
    }
  }, [])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setAuthError('')
    sessionStorage.setItem('admin_pw', password)
    setAuthed(true)
  }

  useEffect(() => {
    const saved = sessionStorage.getItem('admin_pw')
    if (saved) { setPassword(saved); setAuthed(true) }
  }, [])

  useEffect(() => {
    if (authed && password) fetchOrders(password)
  }, [authed, password, fetchOrders])

  const handleStatusUpdate = async (orderId: string, field: 'orderStatus' | 'paymentStatus', value: string) => {
    setUpdating(orderId + field)
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: password },
        body: JSON.stringify({ [field]: value }),
      })
      if (res.ok) {
        const updated = await res.json()
        setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, ...updated } : o)))
      }
    } finally {
      setUpdating(null)
    }
  }

  const handleSaveNotes = async (orderId: string) => {
    setSavingNotes(orderId)
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: password },
        body: JSON.stringify({ adminNotes: adminNotesMap[orderId] ?? '' }),
      })
      if (res.ok) {
        const updated = await res.json()
        setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, adminNotes: updated.adminNotes } : o)))
      }
    } finally {
      setSavingNotes(null)
    }
  }

  const filteredOrders = orders.filter((o) => {
    if (filter === 'ALL') return true
    if (filter === 'PROCESSING' || filter === 'SHIPPED') return o.orderStatus === filter
    if (filter === 'PAID' || filter === 'UNPAID') return o.paymentStatus === filter
    return true
  })

  if (!authed) {
    return (
      <div className="min-h-screen bg-mango-50 flex items-center justify-center">
        <div className="card p-8 w-full max-w-sm">
          <div className="text-center mb-6">
            <span className="text-4xl">🔐</span>
            <h1 className="text-xl font-bold text-gray-800 mt-2">後台管理</h1>
            <p className="text-sm text-gray-400 mt-1">芒芒人海 MANG MANG</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">管理員密碼</label>
              <input
                type="password"
                className="input-field"
                placeholder="請輸入密碼"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {authError && <p className="text-red-500 text-sm">{authError}</p>}
            <button type="submit" className="w-full btn-primary">
              登入
            </button>
          </form>
          <Link href="/" className="block text-center text-sm text-gray-400 hover:text-mango-500 mt-4">
            ← 回到前台
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xl">🥭</span>
            <div>
              <p className="font-bold text-gray-800">後台管理</p>
              <p className="text-xs text-gray-400">芒芒人海 MANG MANG</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchOrders(password)}
              className="text-sm text-gray-500 hover:text-mango-600 border border-gray-200 px-3 py-1.5 rounded-lg hover:border-mango-300 transition-colors"
            >
              🔄 重新整理
            </button>
            <button
              onClick={() => { sessionStorage.removeItem('admin_pw'); setAuthed(false) }}
              className="text-sm text-gray-500 hover:text-red-500 transition-colors"
            >
              登出
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: '全部訂單', value: orders.length, color: 'bg-gray-100 text-gray-700' },
            { label: '處理中', value: orders.filter((o) => o.orderStatus === 'PROCESSING').length, color: 'bg-yellow-100 text-yellow-700' },
            { label: '已出貨', value: orders.filter((o) => o.orderStatus === 'SHIPPED').length, color: 'bg-green-100 text-green-700' },
            { label: '未付款', value: orders.filter((o) => o.paymentStatus === 'UNPAID').length, color: 'bg-red-100 text-red-600' },
          ].map((s) => (
            <div key={s.label} className={`rounded-xl p-4 ${s.color}`}>
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-sm">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex gap-2 flex-wrap mb-6">
          {(['ALL', 'PROCESSING', 'SHIPPED', 'PAID', 'UNPAID'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                filter === f
                  ? 'bg-mango-500 text-white shadow-sm'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-mango-300'
              }`}
            >
              {f === 'ALL' ? '全部' : f === 'PROCESSING' ? '處理中' : f === 'SHIPPED' ? '已出貨' : f === 'PAID' ? '已付款' : '未付款'}
            </button>
          ))}
          <span className="ml-auto text-sm text-gray-400 self-center">共 {filteredOrders.length} 筆</span>
        </div>

        {loading ? (
          <div className="text-center py-16">
            <div className="text-4xl animate-spin inline-block mb-3">🥭</div>
            <p className="text-gray-400">載入中…</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-3xl mb-3">📭</p>
            <p>目前沒有訂單</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredOrders
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
              .map((order) => (
                <div key={order.id} className="card overflow-visible">
                  {/* Row header */}
                  <div
                    className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
                  >
                    <div className="flex flex-wrap items-center gap-3">
                      {/* Order number + date */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono font-bold text-mango-600 text-sm">{order.orderNumber}</span>
                          <span className="text-xs text-gray-400">
                            {new Date(order.createdAt).toLocaleString('zh-TW', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {order.noHolidayDelivery && (
                            <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-medium">假日不送</span>
                          )}
                          {order.adminNotes && (
                            <span className="text-xs bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded font-medium">有備注</span>
                          )}
                        </div>
                        <p className="text-sm font-medium text-gray-800 mt-0.5">
                          {order.customerName} · {order.customerPhone}
                        </p>
                        <p className="text-xs text-gray-400 truncate">{order.deliveryAddress}</p>
                      </div>

                      {/* Items summary */}
                      <div className="hidden md:block text-sm text-gray-600 flex-1 min-w-0">
                        {order.items.map((item, i) => (
                          <span key={i}>
                            {item.productName} {item.variantName} ×{item.quantity}
                            {i < order.items.length - 1 ? '、' : ''}
                          </span>
                        ))}
                      </div>

                      {/* Amount */}
                      <div className="text-right">
                        <p className="font-bold text-gray-800">NT$ {order.total.toLocaleString()}</p>
                      </div>

                      {/* Status selects */}
                      <div className="flex gap-2 flex-wrap" onClick={(e) => e.stopPropagation()}>
                        <select
                          value={order.orderStatus}
                          onChange={(e) => handleStatusUpdate(order.id, 'orderStatus', e.target.value)}
                          disabled={updating === order.id + 'orderStatus'}
                          className={`text-xs border rounded-lg px-2 py-1.5 font-medium cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-mango-400 ${
                            order.orderStatus === 'SHIPPED'
                              ? 'bg-green-100 text-green-700 border-green-200'
                              : 'bg-yellow-100 text-yellow-700 border-yellow-200'
                          }`}
                        >
                          <option value="PROCESSING">處理中</option>
                          <option value="SHIPPED">已出貨</option>
                        </select>
                        <select
                          value={order.paymentStatus}
                          onChange={(e) => handleStatusUpdate(order.id, 'paymentStatus', e.target.value)}
                          disabled={updating === order.id + 'paymentStatus'}
                          className={`text-xs border rounded-lg px-2 py-1.5 font-medium cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-mango-400 ${
                            order.paymentStatus === 'PAID'
                              ? 'bg-green-100 text-green-700 border-green-200'
                              : 'bg-red-100 text-red-600 border-red-200'
                          }`}
                        >
                          <option value="UNPAID">未付款</option>
                          <option value="PAID">已付款</option>
                        </select>
                      </div>

                      <span className="text-gray-300 text-lg">{expandedId === order.id ? '▲' : '▼'}</span>
                    </div>
                  </div>

                  {/* Expanded details */}
                  {expandedId === order.id && (
                    <div className="border-t border-gray-100 p-4 bg-gray-50 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Orderer */}
                        <div>
                          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">訂購人</h4>
                          <p className="text-sm"><span className="text-gray-400">姓名：</span>{order.customerName}</p>
                          <p className="text-sm"><span className="text-gray-400">電話：</span>{order.customerPhone}</p>
                          <p className="text-sm"><span className="text-gray-400">Email：</span>{order.customerEmail}</p>
                        </div>
                        {/* Recipient */}
                        <div>
                          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">收件人</h4>
                          <p className="text-sm"><span className="text-gray-400">姓名：</span>{order.recipientName || order.customerName}</p>
                          <p className="text-sm"><span className="text-gray-400">電話：</span>{order.recipientPhone || order.customerPhone}</p>
                          <p className="text-sm"><span className="text-gray-400">地址：</span>{order.deliveryAddress}</p>
                          {order.noHolidayDelivery && (
                            <p className="text-sm mt-1 text-amber-600 font-medium">⚠️ 假日不可收貨，請安排平日配送</p>
                          )}
                          {order.notes && <p className="text-sm mt-1"><span className="text-gray-400">備註：</span>{order.notes}</p>}
                        </div>
                        {/* Order items */}
                        <div>
                          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">訂購明細</h4>
                          {order.items.map((item, i) => (
                            <div key={i} className="flex justify-between text-sm">
                              <span>{item.productName} {item.variantName} × {item.quantity}</span>
                              <span>NT$ {item.subtotal.toLocaleString()}</span>
                            </div>
                          ))}
                          <div className="border-t border-gray-200 mt-2 pt-2 text-sm space-y-0.5">
                            <div className="flex justify-between text-gray-500"><span>小計</span><span>NT$ {order.subtotal.toLocaleString()}</span></div>
                            <div className="flex justify-between text-gray-500"><span>運費</span><span>NT$ {order.shipping.toLocaleString()}</span></div>
                            <div className="flex justify-between font-bold"><span>合計</span><span className="text-mango-600">NT$ {order.total.toLocaleString()}</span></div>
                          </div>
                        </div>
                        {/* Payment info */}
                        {(order.paymentCode || order.paymentDate) && (
                          <div>
                            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">付款資訊</h4>
                            {order.paymentCode && (
                              <p className="text-sm mb-1"><span className="text-gray-400">末五碼：</span><span className="font-mono font-bold">{order.paymentCode}</span></p>
                            )}
                            {order.paymentDate && (
                              <p className="text-sm"><span className="text-gray-400">匯款日期：</span>{order.paymentDate}</p>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Admin notes */}
                      <div className="border-t border-gray-200 pt-4" onClick={(e) => e.stopPropagation()}>
                        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">人工備注</h4>
                        <div className="flex gap-2 items-start">
                          <textarea
                            className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-mango-400 bg-white"
                            rows={2}
                            placeholder="在此輸入內部備注（不對客戶顯示）"
                            value={adminNotesMap[order.id] ?? ''}
                            onChange={(e) => setAdminNotesMap((prev) => ({ ...prev, [order.id]: e.target.value }))}
                          />
                          <button
                            type="button"
                            disabled={savingNotes === order.id}
                            onClick={() => handleSaveNotes(order.id)}
                            className="text-sm px-3 py-2 bg-mango-500 text-white rounded-lg hover:bg-mango-600 transition-colors disabled:opacity-50 whitespace-nowrap"
                          >
                            {savingNotes === order.id ? '儲存中…' : '儲存'}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  )
}
