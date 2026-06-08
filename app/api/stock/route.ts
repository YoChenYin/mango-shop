import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/stock – public: get all variant stock
export async function GET() {
  const stocks = await prisma.productStock.findMany()
  return NextResponse.json(stocks)
}

// PUT /api/stock – admin: update stock for a variant
export async function PUT(req: NextRequest) {
  const pw = req.headers.get('Authorization')
  if (!pw || pw !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: '未授權' }, { status: 401 })
  }

  const { variantId, available, stock } = await req.json()
  if (!variantId) {
    return NextResponse.json({ error: '缺少 variantId' }, { status: 400 })
  }

  const result = await prisma.productStock.upsert({
    where: { variantId },
    update: { available, stock },
    create: { variantId, available, stock },
  })

  return NextResponse.json(result)
}
