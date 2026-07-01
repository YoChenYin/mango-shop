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
  available: boolean   // 預設值；未有 DB 庫存記錄時使用此欄位
  season: string
  variants: ProductVariant[]
  emoji: string
  shippingDays: string
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
    shippingDays: '約 7- 14 工作天出貨(隨天氣動態調整)',
    variants: [
      { id: 'aiwen-premium',  name: '嚴選（10 台斤）', price: 950 },
      { id: 'aiwen-select',   name: '精選（10 台斤）', price: 800 },
      { id: 'aiwen-standard', name: '普選（10 台斤）', price: 650 },
      { id: 'aiwen-blessing', name: '惜福果（10 台斤）', price: 500 },
    ],
  },
  {
    id: 'yuwen',
    name: '玉文芒果',
    nameEn: 'Yuwen Mango',
    description: '甜度之高，果肉超多，口感細緻香甜',
    available: true,
    season: '6/21 左右結束',
    emoji: '',
    shippingDays: '5 工作天',
    variants: [
      { id: 'yuwen-premium', name: '嚴選（10 台斤）', price: 800 },
      { id: 'yuwen-select',  name: '精選（10 台斤）', price: 700 },
    ],
  },
  {
    id: 'peach',
    name: '水蜜桃芒果',
    nameEn: 'Peach Mango',
    description: '果香如水蜜桃般清甜，細緻甜美，限量供應',
    available: true,   // 預設關閉；後台開啟後前台即生效
    season: '6月 - 7月',
    emoji: '',
    shippingDays: '5 工作天',
    variants: [
      { id: 'peach-premium', name: '嚴選（10 台斤）', price: 800 },
      { id: 'peach-select',  name: '精選（10 台斤）', price: 650 },
    ],
  },
  {
    id: 'wuxiang',
    name: '烏香芒果',
    nameEn: 'Wuxiang Mango',
    description: '香氣獨特迷人，台灣傳統珍貴品種',
    available: false,   // 預設關閉；後台開啟後前台即生效
    season: '6/21 左右結束',
    emoji: '',
    shippingDays: '5 工作天',
    variants: [
      { id: 'wuxiang-select', name: '精選（10 台斤）', price: 800 },
    ],
  },
  {
    id: 'mix',
    name: '綜合芒果',
    nameEn: 'Mix Mango',
    description: '品種百百種',
    available: true,   // 預設關閉；後台開啟後前台即生效
    season: '6月 - 7月',
    emoji: '',
    shippingDays: '5-8 工作天',
    variants: [
      { id: 'wuxiang-peach-premium', name: '[玉文水蜜桃芒]嚴選（10 台斤）', price: 800 },
      { id: 'wuxiang-peach-select', name: '[玉文水蜜桃芒]精選（10 台斤）', price: 700 },
      { id: 'aiwen-peach-standard', name: '[愛文水蜜桃芒]普選（10 台斤）', price: 650 },
    ],
  },
]

// 首頁「當季品項」只顯示這些品項（玉文、烏香等非當季/未開放品項不在首頁露出）
export const HOME_FEATURED_PRODUCT_IDS = ['aiwen', 'peach', 'mix']
