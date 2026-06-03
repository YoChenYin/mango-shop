export interface ProductVariant {
  id: string
  name: string
  price: number
}

export interface Product {
  id: string
  name: string
  nameEn: string
  description: string
  available: boolean
  season: string
  variants: ProductVariant[]
  emoji: string
  shippingDays: string   // 可隨時在此更新出貨等待時間
}

export const PRODUCTS: Product[] = [
  {
    id: 'aiwen',
    name: '愛文芒果',
    nameEn: 'Irwin Mango',
    description: '香甜多汁，為台灣芒果之王，台南玉井最具代表性品種',
    available: true,
    season: '6月 - 7月',
    emoji: '',
    shippingDays: '產季剛開始，約兩週後開始穩定出貨',
    variants: [
      { id: 'aiwen-s', name: '愛文參號（10 台斤）', price: 600 },
    ],
  },
  {
    id: 'yuwen',
    name: '玉文芒果',
    nameEn: 'Yuwen Mango',
    description: '甜度之高，果肉超多，口感細緻香甜',
    available: true,
    season: '6月 - 7月',
    emoji: '',
    shippingDays: '5-8 工作天',
    variants: [
      { id: 'yuwen-s', name: '玉文貳號（10 台斤）', price: 700 },
      { id: 'yuwen-l', name: '玉文壹號（10 台斤）', price: 800 },
    ],
  },
  {
    id: 'peach',
    name: '水蜜桃芒果',
    nameEn: 'Peach Mango',
    description: '果香如水蜜桃般清甜，細緻甜美',
    available: false,
    season: '即將開放',
    emoji: '',
    shippingDays: '—',
    variants: [],
  },
  {
    id: 'wuxiang',
    name: '烏香芒果',
    nameEn: 'Wuxiang Mango',
    description: '香氣獨特迷人，台灣傳統珍貴品種',
    available: false,
    season: '即將開放',
    emoji: '',
    shippingDays: '—',
    variants: [],
  },
]
