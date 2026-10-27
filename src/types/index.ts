export type ProductCategory = 'men' | 'kids' | 'accessories';

export type MensSubCategory = 
  | 'shirts' 
  | 't-shirts' 
  | 'jeans' 
  | 'trousers' 
  | 'casual-wear' 
  | 'formal-wear' 
  | 'traditional-wear';

export type KidsSubCategory = 
  | 'boys-shirts' 
  | 'kids-t-shirts' 
  | 'pants-shorts' 
  | 'casual-wear' 
  | 'party-wear';

export interface ProductColor {
  name: string;
  hex: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  discountPercentage?: number;
  category: ProductCategory;
  subCategory: MensSubCategory | KidsSubCategory | string;
  images: string[];
  description: string;
  sizes: string[];
  colors: ProductColor[];
  inStock: boolean;
  stockCount?: number;
  fabric: string;
  fit: string;
  isFeatured?: boolean;
  isNewArrival?: boolean;
  isTrending?: boolean;
  isOffer?: boolean;
  rating: number;
  reviewCount: number;
  // Added by the admin-managed catalogue (all optional so the original static data still type-checks)
  sku?: string;
  brand?: string;
  tags?: string[];
  imageAlt?: string;
  variants?: { size: string; color: string; stock: number }[];
}

export interface CartItem {
  id: string; // unique item key e.g. `${product.id}-${size}-${color}`
  product: Product;
  selectedSize: string;
  selectedColor: ProductColor;
  quantity: number;
}

export interface CategoryInfo {
  id: string;
  name: string;
  slug: string;
  category: ProductCategory;
  description: string;
  image: string;
  itemCount: number;
}

export interface PromotionalOffer {
  id: string;
  code: string;
  title: string;
  subtitle: string;
  discountBadge: string;
  description: string;
  validUntil: string;
  targetCategory?: ProductCategory | 'all';
  link?: string;
  placements?: string[];
  terms: string[];
  bgColor?: string;
  minOrderValue?: number;
}

export interface CustomerReview {
  id: string;
  author: string;
  location: string;
  rating: number;
  date: string;
  title: string;
  comment: string;
  isDemonstration: boolean;
}

export interface OrderCustomerDetails {
  fullName: string;
  mobile: string;
  email: string;
  address: string;
  landmark?: string;
  city: string;
  state: string;
  pinCode: string;
  notes?: string;
}

export interface DemonstrationOrder {
  orderId: string;
  createdAt: string;
  customer: OrderCustomerDetails;
  items: CartItem[];
  subtotal: number;
  deliveryCharges: number;
  discountAmount: number;
  total: number;
  status: 'Confirmed' | 'Processing';
  isDemo: boolean;
}
