export interface StockRecord {
  variantId: string
  available: boolean
  stock: number
}

// 判斷某 variant 是否可訂購：DB 有紀錄用 DB 值，否則用 products.ts 的預設值
export function isVariantAvailable(
  productDefaultAvailable: boolean,
  stockMap: Record<string, StockRecord>,
  variantId: string
): boolean {
  const record = stockMap[variantId]
  if (record) return record.available
  return productDefaultAvailable
}
