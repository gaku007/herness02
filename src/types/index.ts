// イベント型
export interface Event {
  id: string;
  name: string;
  date: string;
  description: string;
  thumbnail: string;
}

// 商品型（チケット・グッズ）
export interface Product {
  id: string;
  eventId: string;
  type: 'ticket' | 'goods';
  name: string;
  description: string;
  price: number;
  image: string;
  stock: number;
  category?: string;
}

// カートアイテム型
export interface CartItem {
  productId: string;
  quantity: number;
  price: number;
  name: string;
}

// カート型
export interface Cart {
  items: CartItem[];
  total: number;
}

// 購入者情報型
export interface BuyerInfo {
  name: string;
  email: string;
  phoneNumber: string;
  address: string;
  postalCode: string;
}

// 注文型
export interface Order {
  id: string;
  buyerInfo: BuyerInfo;
  items: CartItem[];
  totalAmount: number;
  createdAt: string;
  status: 'pending' | 'completed' | 'cancelled';
}

// API レスポンス型
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
