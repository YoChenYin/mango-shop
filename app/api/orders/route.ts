import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendOrderConfirmation } from '@/lib/email'
import { z } from 'zod'

const CartItemSchema = z.object({
  variantId: z.string(),
  productId: z.string(),
  productName: z.string(),
  variantName: z.string(),
  price: z.number(),
  quantity: z.number().int().positive(),
})

const OrderBodySchema = z.object({
  customerName: z.string().min(1),
  customerEmail: z.string().email(),
  customerPhone: z.string().min(1),
  recipientName: z.string().optional(),
  recipientPhone: z.string().optional(),
  deliveryAddress: z.string().min(1),
  noHolidayDelivery: z.boolean().optional().default(false),
  notes: z.string().optional().default(''),
  items: z.array(CartItemSchema).min(1),
  subtotal: z.number(),
  shipping: z.number(),
  total: z.number(),
  paymentCode: z.string().optional(),
  paymentDate: z.string().optional(),
})

function generateOrderNumber(): string {
  const now = new Date()
  const date = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`
  const rand = Math.floor(Math.random() * 9000) + 1000
  return `MG-${date}-${rand}`
}

// POST /api/orders – create new order
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = OrderBodySchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: '資料格式錯誤', detail: parsed.error.flatten() }, { status: 400 })
    }

    const {
      customerName, customerEmail, customerPhone,
      recipientName, recipientPhone,
      deliveryAddress, noHolidayDelivery, notes,
      items, subtotal, shipping, total,
      paymentCode, paymentDate,
    } = parsed.data

    const orderNumber = generateOrderNumber()

    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerName,
        customerEmail,
        customerPhone,
        recipientName: recipientName || null,
        recipientPhone: recipientPhone || null,
        deliveryAddress,
        noHolidayDelivery: noHolidayDelivery ?? false,
        notes: notes || null,
        subtotal,
        shipping,
        total,
        paymentCode: paymentCode || null,
        paymentDate: paymentDate || null,
        items: {
          create: items.map((item) => ({
            productId: item.productId,
            productName: item.productName,
            variantName: item.variantName,
            price: item.price,
            quantity: item.quantity,
            subtotal: item.price * item.quantity,
          })),
        },
      },
      include: { items: true },
    })

    sendOrderConfirmation({
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      items: order.items,
      subtotal: order.subtotal,
      shipping: order.shipping,
      total: order.total,
      deliveryAddress: order.deliveryAddress,
    }).catch(console.error)

    return NextResponse.json({ orderId: order.id, orderNumber: order.orderNumber }, { status: 201 })
  } catch (err) {
    console.error('Order creation error:', err)
    return NextResponse.json({ error: '訂單建立失敗，請稍後再試' }, { status: 500 })
  }
}

// GET /api/orders – admin: list all orders
export async function GET(req: NextRequest) {
  const pw = req.headers.get('Authorization')
  if (!pw || pw !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: '未授權' }, { status: 401 })
  }

  const orders = await prisma.order.findMany({
    include: { items: true },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(orders)
}
