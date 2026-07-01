/**
 * 運費計算規則：
 * 常溫配送，每 2 箱算一次 150 元
 * 1-2 箱：150 元
 * 3-4 箱：300 元
 * 5-6 箱：450 元，以此類推
 */
export function calculateShipping(totalBoxes: number): number {
  if (totalBoxes <= 0) return 0
  return Math.ceil(totalBoxes / 2) * 150
}

export function shippingDescription(totalBoxes: number): string {
  if (totalBoxes <= 0) return ''
  if (totalBoxes <= 2) return `${totalBoxes} 箱（同地址合併運費）`
  return `${totalBoxes} 箱`
}

export interface ShippingDiscountRule {
  id: string
  productId: string | null   // null = 全部品項加總箱數
  minBoxes: number
  discountAmount: number
}

/**
 * 運費優惠：每條規則獨立判斷是否達標（達標即折抵該規則的金額，可疊加），
 * 總折抵金額不會超過原始運費。
 */
export function calculateShippingDiscount(
  cartItems: { productId: string; quantity: number }[],
  enabled: boolean,
  rules: ShippingDiscountRule[],
  shippingBeforeDiscount: number
): number {
  if (!enabled || rules.length === 0 || shippingBeforeDiscount <= 0) return 0

  const totalBoxes = cartItems.reduce((sum, i) => sum + i.quantity, 0)
  const boxesByProduct: Record<string, number> = {}
  cartItems.forEach((i) => {
    boxesByProduct[i.productId] = (boxesByProduct[i.productId] ?? 0) + i.quantity
  })

  let discount = 0
  for (const rule of rules) {
    const count = rule.productId ? (boxesByProduct[rule.productId] ?? 0) : totalBoxes
    if (count >= rule.minBoxes) discount += rule.discountAmount
  }

  return Math.min(discount, shippingBeforeDiscount)
}
