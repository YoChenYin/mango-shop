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
