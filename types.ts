
export interface Product {
  id: string;
  name: {
    en: string;
    hi: string;
    bn: string;
  };
  price: number; // Base price per baseUnit
  oldPrice?: number;
  image: string; // Primary thumbnail
  gallery: string[]; // Array of 3 images
  category: string;
  description: string;
  inStock: boolean;
  rating: number;
  reviews: number;
  isNew?: boolean;
  isOrganic?: boolean;
  isLocal?: boolean;
  baseUnit: string; // e.g., 'kg', 'pc', 'bunch'
  sellerId?: string; // ID of the farmer/seller
}

export interface CartItem extends Product {
  quantity: number;
  selectedUnit: string; // e.g., '500g', '1kg'
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content?: string;
  date: string;
  author: string;
  authorAvatar?: string;
  image: string;
  category: string;
  readTime: string;
  tags?: string[];
}

export interface Testimonial {
  id: string;
  name: string;
  location: string;
  comment: string;
  rating: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  pincode?: string;
  isPro?: boolean; // Membership status
  avatar?: string;
  role: 'customer' | 'seller'; // Distinguish between buyers and farmers
  farmName?: string; // For sellers
  walletBalance: number; // Credit points
}

export interface Order {
  id: string;
  userId: string;
  date: string;
  total: number;
  status: 'Processing' | 'Packed' | 'Out for Delivery' | 'Delivered' | 'Cancelled';
  items: CartItem[];
  trackingId?: string;
  paymentMethod: string;
  address: string;
  courier?: string; // e.g., 'Bombax'
  customerName?: string;
  customerPhone?: string;
}

export interface TrackingStep {
  title: string;
  subtitle: string;
  timestamp: string;
  completed: boolean;
  icon: any;
}
