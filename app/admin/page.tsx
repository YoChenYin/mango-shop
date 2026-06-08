'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { PRODUCTS } from '@/lib/products'

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

interface StockRecord {
  variantId: string
  available: boolean
  stock: number
}

export default function AdminPage() {
  const [password, setPassword] = useState('')
  const [authed, setAuthed] = useState(false)
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState<'ALL' | OrderStatus | PaymentStatus>('ALL')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [updating, setUpdating] = useState<string | null>(null)
  const [adminNotesMap, setAdminNotesMap] = useState<Record<string, string>>({})
  const [savingNotes, setSavingNotes] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  // Stock
  const [stockMap, setStockMap] = useState<Record<string, StockRecord>>({})
  const [savingStock, setSavingStock] = useState<string | null>(null)
  const [stockSaveResult, setStockSaveResult] = useState<Record<string, 'ok' | 'err'>>({})
  const [activeTab, setActiveTab] = useState<'orders' | 'stock'>('orders')

  const fetchOrders = useCallback(async (pw: string) => {
    setLoading(true)
    try {
      const res = await fetch('/api/orders', { headers: { Authorization: pw } })
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

  const fetchStock = useCallback(async () => {
    const res = await fetch('/api/stock')
    if (!res.ok) return
    const data: StockRecord[] = await res.json()
    const map: Record<string, StockRecord> = {}
    data.forEach((s) => { map[s.variantId] = s })
    // fill defaults for variants not yet in DB
    PRODUCTS.forEach((p) => p.variants.forEach((v) => {
      if (!map[v.id]) map[v.id] = { variantId: v.id, available: true, stock: 0 }
    }))
    setStockMap(map)
  }, [])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    sessionStorage.setItem('admin_pw', password)
    setAuthed(true)
  }

  useEffect(() => {
    const saved = sessionStorage.getItem('admin_pw')
    if (saved) { setPassword(saved); setAuthed(true) }
  }, [])

  useEffect(() => {
    if (authed && password) {
      fetchOrders(password)
      fetchStock()
    }
  }, [authed, password, fetchOrders, fetchStock])

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

  const handleDeleteOrder = async (orderId: string) => {
    setDeletingId(orderId)
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'DELETE',
        headers: { Authorization: password },
      })
      if (res.ok) {
        setOrders((prev) => prev.filter((o) => o.id !== orderId))
        setConfirmDelete(null)
      }
    } finally {
      setDeletingId(null)
    }
  }

  const handleSaveStock = async (variantId: string) => {
    setSavingStock(variantId)
    try {
      const s = stockMap[variantId]
      const res = await fetch('/api/stock', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: password },
        body: JSON.stringify({ variantId, available: s.available, stock: s.stock }),
      })
      setStockSaveResult((prev) => ({ ...prev, [variantId]: res.ok ? 'ok' : 'err' }))
      setTimeout(() => setStockSaveResult((prev) => { const next = { ...prev }; delete next[variantId]; return next }), 2500)
    } catch {
      setStockSaveResult((prev) => ({ ...prev, [variantId]: 'err' }))
      setTimeout(() => setStockSaveResult((prev) => { const next = { ...prev }; delete next[variantId]; return next }), 2500)
    } finally {
      setSavingStock(null)
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
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="bg-white border border-gray-100 p-8 w-full max-w-sm">
          <div className="text-center mb-6">
            <h1 className="text-lg font-light text-gray-700 tracking-[0.2em] mt-2">後台管理</h1>
            <p className="text-xs text-gray-400 mt-1 tracking-wider">芒芒人海 MANG MANG</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs text-gray-500 tracking-wider mb-2">管理員密碼</label>
              <input
                type="password"
                className="input-field"
                placeholder="請輸入密碼"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="w-full btn-primary py-3 tracking-[0.3em]">登入</button>
          </form>
          <Link href="/" className="block text-center text-xs text-gray-400 hover:text-mango-500 mt-4 tracking-wider">
            ← 回到前台
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <p className="font-light text-gray-700 tracking-[0.3em] text-sm">後台管理</p>
            <p className="text-[10px] text-gray-400 tracking-widest mt-0.5">MANG MANG</p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => { fetchOrders(password); fetchStock() }}
              className="text-xs text-gray-400 hover:text-gray-700 border border-gray-200 px-3 py-1.5 tracking-wider transition-colors"
            >
              重新整理
            </button>
            <button
              onClick={() => { sessionStorage.removeItem('admin_pw'); setAuthed(false) }}
              className="text-xs text-gray-400 hover:text-red-500 transition-colors tracking-wider"
            >
              登出
            </button>
          </div>
        </div>
        {/* Tabs */}
        <div className="max-w-7xl mx-auto px-6 flex gap-6 border-t border-gray-100">
          {(['orders', 'stock'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`text-xs py-3 tracking-[0.2em] border-b-2 transition-colors ${
                activeTab === tab
                  ? 'border-mango-400 text-mango-500'
                  : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              {tab === 'orders' ? '訂單管理' : '庫存管理'}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* ── 訂單管理 ── */}
        {activeTab === 'orders' && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { label: '全部訂單', value: orders.length, color: 'bg-gray-100 text-gray-700' },
                { label: '處理中', value: orders.filter((o) => o.orderStatus === 'PROCESSING').length, color: 'bg-yellow-100 text-yellow-700' },
                { label: '已出貨', value: orders.filter((o) => o.orderStatus === 'SHIPPED').length, color: 'bg-green-100 text-green-700' },
                { label: '未付款', value: orders.filter((o) => o.paymentStatus === 'UNPAID').length, color: 'bg-red-100 text-red-600' },
              ].map((s) => (
                <div key={s.label} className={`p-4 ${s.color}`}>
                  <p className="text-2xl font-light">{s.value}</p>
                  <p className="text-xs tracking-wider mt-1">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Filters */}
            <div className="flex gap-2 flex-wrap mb-6">
              {(['ALL', 'PROCESSING', 'SHIPPED', 'PAID', 'UNPAID'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-1.5 text-xs tracking-wider transition-all ${
                    filter === f
                      ? 'bg-mango-500 text-white'
                      : 'bg-white text-gray-500 border border-gray-200 hover:border-mango-300'
                  }`}
                >
                  {f === 'ALL' ? '全部' : f === 'PROCESSING' ? '處理中' : f === 'SHIPPED' ? '已出貨' : f === 'PAID' ? '已付款' : '未付款'}
                </button>
              ))}
              <span className="ml-auto text-xs text-gray-400 self-center tracking-wider">共 {filteredOrders.length} 筆</span>
            </div>

            {loading ? (
              <div className="text-center py-16 text-gray-400 tracking-wider text-sm">載入中…</div>
            ) : filteredOrders.length === 0 ? (
              <div className="text-center py-16 text-gray-400 text-sm tracking-wider">目前沒有訂單</div>
            ) : (
              <div className="space-y-2">
                {filteredOrders
                  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                  .map((order) => (
                    <div key={order.id} className="bg-white border border-gray-100">
                      {/* Row */}
                      <div
                        className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                        onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
                      >
                        <div className="flex flex-wrap items-center gap-3">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-mono text-mango-500 text-xs tracking-wider">{order.orderNumber}</span>
                              <span className="text-xs text-gray-400">
                                {new Date(order.createdAt).toLocaleString('zh-TW', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                              </span>
                              {order.noHolidayDelivery && (
                                <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 tracking-wider">假日不送</span>
                              )}
                              {order.adminNotes && (
                                <span className="text-[10px] bg-blue-100 text-blue-600 px-1.5 py-0.5 tracking-wider">有備注</span>
                              )}
                            </div>
                            <p className="text-sm text-gray-700 mt-0.5 font-light">{order.customerName} · {order.customerPhone}</p>
                            <p className="text-xs text-gray-400 truncate">{order.deliveryAddress}</p>
                          </div>

                          <div className="hidden md:block text-xs text-gray-500 flex-1 min-w-0 font-light">
                            {order.items.map((item, i) => (
                              <span key={i}>{item.productName} {item.variantName} ×{item.quantity}{i < order.items.length - 1 ? '、' : ''}</span>
                            ))}
                          </div>

                          <p className="text-sm font-medium text-gray-700">NT$ {order.total.toLocaleString()}</p>

                          <div className="flex gap-2 flex-wrap" onClick={(e) => e.stopPropagation()}>
                            <select
                              value={order.orderStatus}
                              onChange={(e) => handleStatusUpdate(order.id, 'orderStatus', e.target.value)}
                              disabled={updating === order.id + 'orderStatus'}
                              className={`text-xs border px-2 py-1.5 cursor-pointer focus:outline-none ${
                                order.orderStatus === 'SHIPPED' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-yellow-100 text-yellow-700 border-yellow-200'
                              }`}
                            >
                              <option value="PROCESSING">處理中</option>
                              <option value="SHIPPED">已出貨</option>
                            </select>
                            <select
                              value={order.paymentStatus}
                              onChange={(e) => handleStatusUpdate(order.id, 'paymentStatus', e.target.value)}
                              disabled={updating === order.id + 'paymentStatus'}
                              className={`text-xs border px-2 py-1.5 cursor-pointer focus:outline-none ${
                                order.paymentStatus === 'PAID' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-red-100 text-red-600 border-red-200'
                              }`}
                            >
                              <option value="UNPAID">未付款</option>
                              <option value="PAID">已付款</option>
                            </select>
                          </div>

                          <span className="text-gray-300">{expandedId === order.id ? '▲' : '▼'}</span>
                        </div>
                      </div>

                      {/* Expanded */}
                      {expandedId === order.id && (
                        <div className="border-t border-gray-100 p-4 bg-gray-50 space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <h4 className="text-[10px] text-gray-400 tracking-[0.3em] uppercase mb-2">訂購人</h4>
                              <p className="text-xs text-gray-600"><span className="text-gray-400">姓名：</span>{order.customerName}</p>
                              <p className="text-xs text-gray-600"><span className="text-gray-400">電話：</span>{order.customerPhone}</p>
                              <p className="text-xs text-gray-600"><span className="text-gray-400">Email：</span>{order.customerEmail}</p>
                            </div>
                            <div>
                              <h4 className="text-[10px] text-gray-400 tracking-[0.3em] uppercase mb-2">收件人</h4>
                              <p className="text-xs text-gray-600"><span className="text-gray-400">姓名：</span>{order.recipientName || order.customerName}</p>
                              <p className="text-xs text-gray-600"><span className="text-gray-400">電話：</span>{order.recipientPhone || order.customerPhone}</p>
                              <p className="text-xs text-gray-600"><span className="text-gray-400">地址：</span>{order.deliveryAddress}</p>
                              {order.noHolidayDelivery && <p className="text-xs text-amber-600 mt-1">⚠️ 假日不可收貨</p>}
                              {order.notes && <p className="text-xs text-gray-600 mt-1"><span className="text-gray-400">備註：</span>{order.notes}</p>}
                            </div>
                            <div>
                              <h4 className="text-[10px] text-gray-400 tracking-[0.3em] uppercase mb-2">訂購明細</h4>
                              {order.items.map((item, i) => (
                                <div key={i} className="flex justify-between text-xs text-gray-600">
                                  <span>{item.productName} {item.variantName} × {item.quantity}</span>
                                  <span>NT$ {item.subtotal.toLocaleString()}</span>
                                </div>
                              ))}
                              <div className="border-t border-gray-200 mt-2 pt-2 space-y-0.5">
                                <div className="flex justify-between text-xs text-gray-400"><span>小計</span><span>NT$ {order.subtotal.toLocaleString()}</span></div>
                                <div className="flex justify-between text-xs text-gray-400"><span>運費</span><span>NT$ {order.shipping.toLocaleString()}</span></div>
                                <div className="flex justify-between text-xs font-medium text-gray-700"><span>合計</span><span>NT$ {order.total.toLocaleString()}</span></div>
                              </div>
                            </div>
                            {(order.paymentCode || order.paymentDate) && (
                              <div>
                                <h4 className="text-[10px] text-gray-400 tracking-[0.3em] uppercase mb-2">付款資訊</h4>
                                {order.paymentCode && <p className="text-xs text-gray-600"><span className="text-gray-400">末五碼：</span><span className="font-mono font-bold">{order.paymentCode}</span></p>}
                                {order.paymentDate && <p className="text-xs text-gray-600"><span className="text-gray-400">匯款日期：</span>{order.paymentDate}</p>}
                              </div>
                            )}
                          </div>

                          {/* Admin notes */}
                          <div className="border-t border-gray-200 pt-4" onClick={(e) => e.stopPropagation()}>
                            <h4 className="text-[10px] text-gray-400 tracking-[0.3em] uppercase mb-2">人工備注</h4>
                            <div className="flex gap-2 items-start">
                              <textarea
                                className="flex-1 text-xs border border-gray-200 px-3 py-2 resize-none focus:outline-none focus:ring-1 focus:ring-mango-300 bg-white"
                                rows={2}
                                placeholder="內部備注（不對顧客顯示）"
                                value={adminNotesMap[order.id] ?? ''}
                                onChange={(e) => setAdminNotesMap((prev) => ({ ...prev, [order.id]: e.target.value }))}
                              />
                              <button
                                type="button"
                                disabled={savingNotes === order.id}
                                onClick={() => handleSaveNotes(order.id)}
                                className="text-xs px-3 py-2 bg-mango-500 text-white hover:bg-mango-600 transition-colors disabled:opacity-50 tracking-wider"
                              >
                                {savingNotes === order.id ? '儲存中…' : '儲存'}
                              </button>
                            </div>
                          </div>

                          {/* Delete */}
                          <div className="border-t border-gray-200 pt-4 flex justify-end" onClick={(e) => e.stopPropagation()}>
                            {confirmDelete === order.id ? (
                              <div className="flex items-center gap-3">
                                <span className="text-xs text-red-500 tracking-wider">確定刪除這筆訂單？</span>
                                <button
                                  onClick={() => handleDeleteOrder(order.id)}
                                  disabled={deletingId === order.id}
                                  className="text-xs px-3 py-1.5 bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-50 tracking-wider"
                                >
                                  {deletingId === order.id ? '刪除中…' : '確定刪除'}
                                </button>
                                <button
                                  onClick={() => setConfirmDelete(null)}
                                  className="text-xs px-3 py-1.5 border border-gray-200 text-gray-500 hover:border-gray-400 tracking-wider"
                                >
                                  取消
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setConfirmDelete(order.id)}
                                className="text-xs text-gray-400 hover:text-red-500 transition-colors tracking-wider border border-gray-200 hover:border-red-300 px-3 py-1.5"
                              >
                                刪除訂單
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            )}
          </>
        )}

        {/* ── 庫存管理 ── */}
        {activeTab === 'stock' && (
          <div className="max-w-2xl">
            <p className="text-xs text-gray-400 tracking-wider mb-6">
              設定各品項的庫存數量。庫存設為 0 表示不限量；大於 0 時訂購頁面會顯示剩餘數量。關閉「可訂購」後，該品項在訂購頁面會顯示為無法訂購。
            </p>
            <div className="space-y-3">
              {PRODUCTS.map((product) => (
                <div key={product.id}>
                  <p className="text-xs font-medium text-gray-600 tracking-wider mb-2">{product.name}</p>
                  {product.variants.length === 0 ? (
                    <p className="text-xs text-gray-400 ml-2 tracking-wider">尚未開放</p>
                  ) : (
                    product.variants.map((variant) => {
                      const s = stockMap[variant.id] ?? { variantId: variant.id, available: true, stock: 0 }
                      return (
                        <div key={variant.id} className="bg-white border border-gray-100 p-4 flex flex-wrap items-center gap-4 mb-2">
                          <span className="text-xs text-gray-600 flex-1 min-w-[120px] tracking-wide">{variant.name}</span>

                          {/* Available toggle */}
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={s.available}
                              onChange={(e) => setStockMap((prev) => ({
                                ...prev,
                                [variant.id]: { ...s, available: e.target.checked },
                              }))}
                              className="w-4 h-4"
                            />
                            <span className={`text-xs tracking-wider ${s.available ? 'text-green-600' : 'text-gray-400'}`}>
                              {s.available ? '可訂購' : '暫停接單'}
                            </span>
                          </label>

                          {/* Stock count */}
                          <div className="flex items-center gap-2">
                            <label className="text-xs text-gray-400 tracking-wider whitespace-nowrap">庫存數量</label>
                            <input
                              type="number"
                              min={0}
                              value={s.stock}
                              onChange={(e) => setStockMap((prev) => ({
                                ...prev,
                                [variant.id]: { ...s, stock: Math.max(0, parseInt(e.target.value) || 0) },
                              }))}
                              className="w-20 border border-gray-200 px-2 py-1 text-xs text-center focus:outline-none focus:ring-1 focus:ring-mango-300"
                            />
                            <span className="text-xs text-gray-400 tracking-wider">箱（0=不限）</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleSaveStock(variant.id)}
                              disabled={savingStock === variant.id}
                              className="text-xs px-3 py-1.5 bg-mango-500 text-white hover:bg-mango-600 transition-colors disabled:opacity-50 tracking-wider"
                            >
                              {savingStock === variant.id ? '儲存中…' : '儲存'}
                            </button>
                            {stockSaveResult[variant.id] === 'ok' && (
                              <span className="text-xs text-green-600 tracking-wider">✓ 已儲存</span>
                            )}
                            {stockSaveResult[variant.id] === 'err' && (
                              <span className="text-xs text-red-500 tracking-wider">✗ 失敗</span>
                            )}
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
