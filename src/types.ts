export type Currency = 'IRT' | 'CNY' | 'AED';

export interface Category {
  id: string;
  name: string;
  icon?: string;
}

export interface Media {
  images: string[];
  video?: string;
  audio?: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  categoryIds: string[];
  priceValue: number;
  currency: Currency;
  media: Media;
  isOutOfStock: boolean;
  createdAt: string;
  priceIRT?: number;
  priceCNY?: number;
  priceAED?: number;
  purchasePriceIRT?: number;
  purchasePriceAED?: number;
  purchasePriceCNY?: number;
}

export interface BannerItem {
  id: string;
  bannerUrl: string;
  bannerUrlDesktop: string;
  bannerRedirect?: string;
}

export interface Settings {
  cnyRate: string;
  aedRate: string;
  adminPassword?: string;
  staffPassword?: string;
  showGlobalRates?: boolean;
  bannerUrl?: string;
  bannerUrlDesktop?: string;
  bannerRedirect?: string;
  banners?: BannerItem[];
  bannerInterval?: number;
  bannerTransition?: 'fade' | 'slide' | 'scale' | 'flip' | 'rotate' | 'slideUp' | 'shutter' | 'elastic' | 'blur';
  showAllProductsCategory?: boolean;
  showAvailableCategory?: boolean;
  showOutOfStockCategory?: boolean;
  lastPriceUpdate?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  currency: Currency;
  priceValue: number;
  tomanPrice: number;
  isDirham: boolean;
  image?: string;
}

export type OrderStatus = 'pending' | 'processing' | 'confirmed' | 'completed' | 'cancelled';

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerNotes?: string;
  items: OrderItem[];
  totalToman: number;
  totalAED: number;
  hasAEDItems: boolean;
  status: OrderStatus;
  createdAt: string;
  updatedAt?: string;
}

export interface PriceHistory {
  id: string;
  productId: string;
  productName: string;
  oldPrice: number;
  newPrice: number;
  changedAt: string;
}
