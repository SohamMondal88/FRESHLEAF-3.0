
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
  stock?: number;
  rating: number;
  reviews: number;
  isNew?: boolean;
  isOrganic?: boolean;
  isLocal?: boolean;
  origin?: string;
  harvestTime?: string;
  nutritionHighlights?: string[];
  baseUnit: string; // e.g., 'kg', 'pc', 'bunch'
  sellerId?: string; // ID of the farmer/seller
}

export interface CartItem extends Product {
  quantity: number;
  selectedUnit: string; // e.g., '500g', '1kg'
}

export interface BillDetails {
  mrpTotal: number;
  itemTotal: number;
  discount: number;
  handlingFee: number;
  platformFee: number;
  deliveryFee: number;
  smallCartFee: number;
  tip: number;
  grandTotal: number;
}

export interface User {
  id: string;
  name: string;
  email?: string;
  phone: string;
  gender?: string;
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
  createdAt: number; // Timestamp for cancellation logic
  total: number;
  billBreakdown?: BillDetails;
  status: 'Processing' | 'Packed' | 'Out for Delivery' | 'Delivered' | 'Cancelled';
  items: CartItem[];
  trackingId?: string;
  paymentMethod: string;
  address: string;
  courier: string; 
  agent?: DeliveryAgent; // Assigned friend
  customerName?: string;
  customerPhone?: string;
  instructions?: string[];
  deliverySlot?: {
    date: string;
    time: string;
  };
  deliveryNotes?: string;
  walletUsed?: number;
  pointsEarned?: number;
}

export interface Transaction {
  id: string;
  userId: string;
  orderId: string;
  amount: number;
  walletUsed?: number;
  paymentMethod: string;
  status: 'pending' | 'paid' | 'failed';
  currency: string;
  createdAt: number;
}

export interface DeliveryAgent {
  name: string;
  phone: string;
  vehicleNumber: string;
  avatar: string;
  rating: number;
}

// ... rest of your types (BlogPost, etc)
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

export interface Farmer {
  id: string;
  name: string;
  farmName: string;
  location: string;
  description: string;
  avatar: string;
  coverImage: string;
  certifications: string[];
  joinedDate: string;
  rating: number;
}
