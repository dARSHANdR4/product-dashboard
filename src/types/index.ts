// ─── Auth ───────────────────────────────────────────────────────────────────
export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthUser {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  image: string;
  token: string;
  refreshToken: string;
}

// ─── Product ─────────────────────────────────────────────────────────────────
export interface ProductDimensions {
  width: number;
  height: number;
  depth: number;
}

export interface ProductMeta {
  createdAt: string;
  updatedAt: string;
  barcode: string;
  qrCode: string;
}

export interface ProductReview {
  rating: number;
  comment: string;
  date: string;
  reviewerName: string;
  reviewerEmail: string;
}

export interface Product {
  id: number;
  title: string;
  description: string;
  category: string;
  price: number;
  discountPercentage: number;
  rating: number;
  stock: number;
  tags: string[];
  brand: string;
  sku: string;
  weight: number;
  dimensions: ProductDimensions;
  warrantyInformation: string;
  shippingInformation: string;
  availabilityStatus: string;
  reviews: ProductReview[];
  returnPolicy: string;
  minimumOrderQuantity: number;
  meta: ProductMeta;
  images: string[];
  thumbnail: string;
  // local-only fields
  _optimisticStatus?: 'idle' | 'pending' | 'error';
  _isLocal?: boolean; // true for locally-added products
}

export interface PaginatedProducts {
  products: Product[];
  total: number;
  skip: number;
  limit: number;
}

// ─── Sorting ─────────────────────────────────────────────────────────────────
export type SortField = 'price' | 'rating' | 'title';
export type SortOrder = 'asc' | 'desc';

// ─── Product Form ─────────────────────────────────────────────────────────────
export interface ProductFormData {
  title: string;
  description: string;
  category: string;
  price: string;
  stock: string;
  brand: string;
  discountPercentage: string;
  thumbnail: string;
}

// ─── Toast ───────────────────────────────────────────────────────────────────
export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

// ─── Cache ───────────────────────────────────────────────────────────────────
export interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

// ─── Query State ──────────────────────────────────────────────────────────────
export interface ProductsQueryState {
  page: number;
  limit: number;
  search: string;
  category: string;
  sortBy: SortField | '';
  sortOrder: SortOrder;
}

// ─── API Error ────────────────────────────────────────────────────────────────
export interface ApiError {
  message: string;
  status?: number;
  isNetworkError: boolean;
}
