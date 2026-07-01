import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET /api/shipping-discount – public: get master switch + all rules
export async function GET() {
  const [setting, rules] = await Promise.all([
    prisma.shippingDiscountSetting.findUnique({ where: { id: 1 } }),
    prisma.shippingDiscountRule.findMany({ orderBy: { createdAt: 'asc' } }),
  ])

  return NextResponse.json({
    enabled: setting?.enabled ?? false,
    rules,
  })
}

// PUT /api/shipping-discount – admin: toggle master switch
export async function PUT(req: NextRequest) {
  const pw = req.headers.get('Authorization')
  if (!pw || pw !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: '未授權' }, { status: 401 })
  }

  const { enabled } = await req.json()
  if (typeof enabled !== 'boolean') {
    return NextResponse.json({ error: '缺少 enabled' }, { status: 400 })
  }

  const result = await prisma.shippingDiscountSetting.upsert({
    where: { id: 1 },
    update: { enabled },
    create: { id: 1, enabled },
  })

  return NextResponse.json(result)
}

// POST /api/shipping-discount – admin: create a new rule
export async function POST(req: NextRequest) {
  const pw = req.headers.get('Authorization')
  if (!pw || pw !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: '未授權' }, { status: 401 })
  }

  const { productId, minBoxes, discountAmount } = await req.json()
  if (!Number.isInteger(minBoxes) || minBoxes <= 0 || !Number.isInteger(discountAmount) || discountAmount <= 0) {
    return NextResponse.json({ error: '箱數與折抵金額須為正整數' }, { status: 400 })
  }

  const rule = await prisma.shippingDiscountRule.create({
    data: { productId: productId || null, minBoxes, discountAmount },
  })

  return NextResponse.json(rule, { status: 201 })
}
