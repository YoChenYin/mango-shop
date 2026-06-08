import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
import { sendStatusUpdate } from '@/lib/email'

// DELETE /api/orders/[id] – admin: delete order
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const pw = _req.headers.get('Authorization')
  if (!pw || pw !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: '未授權' }, { status: 401 })
  }

  const existing = await prisma.order.findUnique({ where: { id: params.id } })
  if (!existing) return NextResponse.json({ error: '找不到訂單' }, { status: 404 })

  await prisma.orderItem.deleteMany({ where: { orderId: params.id } })
  await prisma.order.delete({ where: { id: params.id } })

  return NextResponse.json({ ok: true })
}

// GET /api/orders/[id] – public: get single order for success page
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: { items: true },
  })
  if (!order) return NextResponse.json({ error: '找不到訂單' }, { status: 404 })
  return NextResponse.json(order)
}

// PATCH /api/orders/[id] – admin: update order or payment status
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const pw = req.headers.get('Authorization')
  if (!pw || pw !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: '未授權' }, { status: 401 })
  }

  const body = await req.json()
  const { orderStatus, paymentStatus, adminNotes } = body

  if (!orderStatus && !paymentStatus && adminNotes === undefined) {
    return NextResponse.json({ error: '請提供要更新的欄位' }, { status: 400 })
  }

  const existing = await prisma.order.findUnique({ where: { id: params.id } })
  if (!existing) return NextResponse.json({ error: '找不到訂單' }, { status: 404 })

  const updated = await prisma.order.update({
    where: { id: params.id },
    data: {
      ...(orderStatus && { orderStatus }),
      ...(paymentStatus && { paymentStatus }),
      ...(adminNotes !== undefined && { adminNotes }),
    },
  })

  // Send email if status actually changed
  const statusChanged =
    (orderStatus && orderStatus !== existing.orderStatus) ||
    (paymentStatus && paymentStatus !== existing.paymentStatus)

  if (statusChanged) {
    sendStatusUpdate({
      orderNumber: existing.orderNumber,
      customerName: existing.customerName,
      customerEmail: existing.customerEmail,
      ...(orderStatus && orderStatus !== existing.orderStatus ? { orderStatus } : {}),
      ...(paymentStatus && paymentStatus !== existing.paymentStatus ? { paymentStatus } : {}),
    }).catch((err) => {
      console.error('[Email] 狀態更新信寄送失敗:', existing.orderNumber, err?.message ?? err)
    })
  }

  return NextResponse.json({
    id: updated.id,
    orderStatus: updated.orderStatus,
    paymentStatus: updated.paymentStatus,
    adminNotes: updated.adminNotes,
  })
}
