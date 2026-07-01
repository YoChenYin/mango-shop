import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// PATCH /api/shipping-discount/[id] – admin: update a rule
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const pw = req.headers.get('Authorization')
  if (!pw || pw !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: '未授權' }, { status: 401 })
  }

  const { productId, minBoxes, discountAmount } = await req.json()
  if (!Number.isInteger(minBoxes) || minBoxes <= 0 || !Number.isInteger(discountAmount) || discountAmount <= 0) {
    return NextResponse.json({ error: '箱數與折抵金額須為正整數' }, { status: 400 })
  }

  const existing = await prisma.shippingDiscountRule.findUnique({ where: { id: params.id } })
  if (!existing) return NextResponse.json({ error: '找不到規則' }, { status: 404 })

  const rule = await prisma.shippingDiscountRule.update({
    where: { id: params.id },
    data: { productId: productId || null, minBoxes, discountAmount },
  })

  return NextResponse.json(rule)
}

// DELETE /api/shipping-discount/[id] – admin: delete a rule
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const pw = req.headers.get('Authorization')
  if (!pw || pw !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: '未授權' }, { status: 401 })
  }

  const existing = await prisma.shippingDiscountRule.findUnique({ where: { id: params.id } })
  if (!existing) return NextResponse.json({ error: '找不到規則' }, { status: 404 })

  await prisma.shippingDiscountRule.delete({ where: { id: params.id } })

  return NextResponse.json({ ok: true })
}
